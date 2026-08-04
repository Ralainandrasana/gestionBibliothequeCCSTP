const AppLogsModel = require('../models/appLogs');
const { runWithAuditContext, getLastSqlQuery, getLastInsertId } = require('../utils/auditContext');

const SENSITIVE_FIELD = /(password|passwd|pswd|token|secret|authorization|cookie|session|reset.?key|login_session_key)/i;
const IDENTIFIER_FIELDS = [
    'id', 'log_id', 'userId', 'id_user', 'id_adh', 'id_livre',
    'id_emprunt', 'id_oeuvre', 'id_personne', 'id_dewey'
];

const TABLE_NAMES = {
    users: 'user',
    user: 'user',
    deweys: 'dewey',
    dewey: 'dewey',
    adherents: 'adherent',
    adherent: 'adherent',
    livres: 'livre',
    livre: 'livre',
    livre_emprunts: 'livre_emprunt',
    livre_emprunt: 'livre_emprunt',
    oeuvres: 'oeuvre',
    oeuvre: 'oeuvre',
    personnes: 'personne',
    personne: 'personne'
};

const AUTH_ACTIONS = {
    login: 'userlogin',
    logout: 'userlogout',
    register: 'add',
    profile: 'edit',
    'change-password': 'passwordchange',
    'request-password-reset': 'passwordresetrequest',
    'reset-password': 'passwordreset'
};

function shouldAudit(req) {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return false;
    if (req.originalUrl.startsWith('/api/crud/app_logs')) return false;
    return /^\/api\/(auth|crud|other)(\/|$)/.test(req.originalUrl);
}

function sanitize(value, seen = new WeakSet()) {
    if (value === null || value === undefined) return value;
    if (Buffer.isBuffer(value)) return '[fichier binaire]';
    if (typeof value !== 'object') return value;
    if (seen.has(value)) return '[référence circulaire]';

    seen.add(value);
    if (Array.isArray(value)) return value.map(item => sanitize(item, seen));

    return Object.entries(value).reduce((result, [key, item]) => {
        result[key] = SENSITIVE_FIELD.test(key) ? '[MASQUÉ]' : sanitize(item, seen);
        return result;
    }, {});
}

function getRouteParts(req) {
    return req.originalUrl.split('?')[0].split('/').filter(Boolean);
}

function getTableName(req) {
    const parts = getRouteParts(req);
    if (parts[1] === 'auth') return 'user';

    const resource = parts[2];
    return TABLE_NAMES[String(resource || '').toLowerCase()] || resource || null;
}

function getAction(req) {
    const parts = getRouteParts(req);
    if (parts[1] === 'auth') {
        if (parts[2] === 'admin' && parts[3] === 'users') return 'edit';
        return AUTH_ACTIONS[parts[2]] || 'edit';
    }

    if (req.method === 'POST') return 'add';
    if (req.method === 'DELETE') return 'delete';
    return 'edit';
}

function firstIdentifier(...sources) {
    for (const source of sources) {
        if (!source || typeof source !== 'object') continue;
        for (const key of IDENTIFIER_FIELDS) {
            if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
                return String(source[key]);
            }
        }
    }
    return null;
}

function getRecordId(req, responseBody) {
    const directId = firstIdentifier(req.params, req.body, responseBody);
    if (directId) return directId;

    if (req.method === 'POST' && getLastInsertId()) return getLastInsertId();

    const parts = getRouteParts(req);
    const numericPart = [...parts].reverse().find(part => /^\d+$/.test(part));
    return numericPart || null;
}

function getResponseMessage(body, statusCode) {
    if (body && typeof body === 'object') {
        const message = body.message || body.error;
        if (typeof message === 'string') return message;
    }
    if (typeof body === 'string') return body.slice(0, 2000);
    return `HTTP ${statusCode}`;
}

function localTimestamp() {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} `
        + `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || req.ip || req.socket?.remoteAddress || '');
    return ip.split(',')[0].trim().replace(/^::ffff:/, '');
}

function auditMiddleware(req, res, next) {
    runWithAuditContext(() => {
        if (!shouldAudit(req)) return next();

        const initialUserId = req.session?.userId || null;
        let responseBody;
        const originalJson = res.json.bind(res);
        const originalSend = res.send.bind(res);

        res.json = body => {
            responseBody = body;
            return originalJson(body);
        };
        res.send = body => {
            if (responseBody === undefined) responseBody = body;
            return originalSend(body);
        };

        res.once('finish', () => {
            const sanitizedRequest = sanitize(req.body || {});
            if (req.file) {
                sanitizedRequest.photo = {
                    originalName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    size: req.file.size
                };
            }

            const log = {
                Timestamp: localTimestamp(),
                Action: getAction(req),
                TableName: getTableName(req),
                RecordID: getRecordId(req, responseBody),
                SqlQuery: getLastSqlQuery(),
                UserID: initialUserId || req.session?.userId || null,
                ServerIP: getClientIp(req),
                RequestUrl: req.originalUrl,
                RequestData: JSON.stringify(sanitizedRequest),
                RequestCompleted: res.statusCode < 400 ? 'true' : 'false',
                RequestMsg: getResponseMessage(responseBody, res.statusCode)
            };

            AppLogsModel.addAppLog(log).catch(error => {
                console.error('Erreur pendant la journalisation app_logs :', error.message);
            });
        });

        next();
    });
}

module.exports = auditMiddleware;
