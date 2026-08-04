const { AsyncLocalStorage } = require('async_hooks');

const auditStorage = new AsyncLocalStorage();

function runWithAuditContext(callback) {
    auditStorage.run({ lastSqlQuery: null, lastInsertId: null }, callback);
}

function recordSqlQuery(query) {
    const store = auditStorage.getStore();
    if (!store) return;

    const sql = typeof query === 'string' ? query : query?.sql;
    if (sql) {
        // Conserver les marqueurs « ? » évite d'écrire des mots de passe ou
        // d'autres valeurs sensibles dans le journal.
        store.lastSqlQuery = String(sql).replace(/\s+/g, ' ').trim().slice(0, 255);
        store.lastInsertId = null;
    }
}

function recordQueryResult(result) {
    const store = auditStorage.getStore();
    if (store && result?.insertId) store.lastInsertId = String(result.insertId);
}

function getLastSqlQuery() {
    return auditStorage.getStore()?.lastSqlQuery || null;
}

function getLastInsertId() {
    return auditStorage.getStore()?.lastInsertId || null;
}

function bindAuditCallback(callback) {
    const store = auditStorage.getStore();
    if (!store || typeof callback !== 'function') return callback;

    return (...args) => auditStorage.run(store, () => callback(...args));
}

module.exports = {
    runWithAuditContext,
    recordSqlQuery,
    recordQueryResult,
    getLastSqlQuery,
    getLastInsertId,
    bindAuditCallback
};
