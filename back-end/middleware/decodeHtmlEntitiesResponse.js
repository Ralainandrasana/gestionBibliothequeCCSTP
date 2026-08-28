const ENTITY_REPLACEMENTS = [
    { pattern: /&(?:amp|#0*38|#x0*26);/gi, value: '&' },
    { pattern: /&(?:quot|#0*34|#x0*22);/gi, value: '"' },
    { pattern: /&(?:apos|#0*39|#x0*27);/gi, value: "'" }
];
const { buildUploadUrl } = require('../utils/uploadUrl');

const MISSING_PHOTO_VALUES = new Set(['', 'null', 'undefined']);
const LEGACY_UPLOAD_URL = /\/Bibliofianar\/uploads\/files\/([^/?#]+)(?:[?#].*)?$/i;

function normalizePhotoValue(key, value) {
    if (key !== 'photo' || typeof value !== 'string') return value;

    const trimmedValue = value.trim();
    if (MISSING_PHOTO_VALUES.has(trimmedValue.toLowerCase())) return null;

    // Les anciennes donnees peuvent contenir l'adresse IP du poste ayant
    // enregistre la photo. On conserve le nom du fichier, mais on utilise
    // l'URL publique configuree pour le serveur actuel.
    const legacyUpload = trimmedValue.match(LEGACY_UPLOAD_URL);
    return legacyUpload ? buildUploadUrl(legacyUpload[1]) : trimmedValue;
}

/**
 * Décode uniquement les entités introduites historiquement par
 * FILTER_SANITIZE_STRING. Les balises HTML (&lt; et &gt;) restent encodées.
 */
function decodeHtmlEntities(value) {
    if (typeof value !== 'string' || !value.includes('&')) return value;

    let decodedValue = value;
    for (let pass = 0; pass < 3; pass += 1) {
        const previousValue = decodedValue;
        decodedValue = ENTITY_REPLACEMENTS.reduce(
            (text, replacement) => text.replace(replacement.pattern, replacement.value),
            decodedValue
        );

        if (decodedValue === previousValue) break;
    }

    return decodedValue;
}

function decodeResponseValue(value, seen = new WeakMap(), currentKey = '') {
    value = normalizePhotoValue(currentKey, value);

    if (typeof value === 'string') return decodeHtmlEntities(value);
    if (value === null || typeof value !== 'object') return value;
    if (value instanceof Date || Buffer.isBuffer(value)) return value;
    if (seen.has(value)) return seen.get(value);

    const decodedValue = Array.isArray(value) ? [] : {};
    seen.set(value, decodedValue);

    Object.entries(value).forEach(([key, item]) => {
        decodedValue[key] = decodeResponseValue(item, seen, key);
    });

    return decodedValue;
}

function decodeHtmlEntitiesResponse(req, res, next) {
    const originalJson = res.json;

    res.json = function jsonWithDecodedHtmlEntities(body) {
        return originalJson.call(this, decodeResponseValue(body));
    };

    next();
}

module.exports = decodeHtmlEntitiesResponse;
module.exports.decodeHtmlEntities = decodeHtmlEntities;
module.exports.decodeResponseValue = decodeResponseValue;
module.exports.normalizePhotoValue = normalizePhotoValue;
