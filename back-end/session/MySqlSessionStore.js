const session = require('express-session');

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

class MySqlSessionStore extends session.Store {
    constructor(db, options = {}) {
        super();
        this.db = db;
        this.query = db.queryWithoutAudit || db.query.bind(db);
        this.defaultTtlMs = options.defaultTtlMs || DEFAULT_TTL_MS;

        const cleanupIntervalMs = options.cleanupIntervalMs || DEFAULT_CLEANUP_INTERVAL_MS;
        this.cleanupTimer = setInterval(() => this.cleanupExpiredSessions(), cleanupIntervalMs);
        this.cleanupTimer.unref();
    }

    getExpiration(sessionData) {
        const cookieExpiration = sessionData?.cookie?.expires;
        if (cookieExpiration) {
            const expiration = new Date(cookieExpiration);
            if (!Number.isNaN(expiration.getTime())) return expiration;
        }

        const maxAge = Number(sessionData?.cookie?.maxAge);
        return new Date(Date.now() + (Number.isFinite(maxAge) ? maxAge : this.defaultTtlMs));
    }

    get(sessionId, callback) {
        this.query(
            `SELECT session_data
             FROM app_sessions
             WHERE session_id = ? AND expires_at > NOW(3)
             LIMIT 1`,
            [sessionId],
            (error, rows) => {
                if (error) return callback(error);
                if (!rows.length) return callback(null, null);

                try {
                    callback(null, JSON.parse(rows[0].session_data));
                } catch (parseError) {
                    this.destroy(sessionId, () => callback(parseError));
                }
            }
        );
    }

    set(sessionId, sessionData, callback = () => {}) {
        let serializedSession;
        try {
            serializedSession = JSON.stringify(sessionData);
        } catch (error) {
            callback(error);
            return;
        }

        this.query(
            `INSERT INTO app_sessions (session_id, expires_at, session_data)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
                expires_at = VALUES(expires_at),
                session_data = VALUES(session_data)`,
            [sessionId, this.getExpiration(sessionData), serializedSession],
            callback
        );
    }

    touch(sessionId, sessionData, callback = () => {}) {
        this.query(
            `UPDATE app_sessions
             SET expires_at = ?
             WHERE session_id = ?`,
            [this.getExpiration(sessionData), sessionId],
            callback
        );
    }

    destroy(sessionId, callback = () => {}) {
        this.query('DELETE FROM app_sessions WHERE session_id = ?', [sessionId], callback);
    }

    clear(callback = () => {}) {
        this.query('DELETE FROM app_sessions', callback);
    }

    length(callback) {
        this.query(
            'SELECT COUNT(*) AS total FROM app_sessions WHERE expires_at > NOW(3)',
            (error, rows) => callback(error, error ? undefined : rows[0].total)
        );
    }

    cleanupExpiredSessions() {
        this.query(
            'DELETE FROM app_sessions WHERE expires_at <= NOW(3)',
            (error) => {
                if (error) console.error('Erreur de nettoyage des sessions expirees :', error.message);
            }
        );
    }
}

module.exports = MySqlSessionStore;
