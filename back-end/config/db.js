const mysql = require('mysql');
const { recordSqlQuery, recordQueryResult, bindAuditCallback } = require('../utils/auditContext');
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fianarantsoa',
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    waitForConnections: true,
    queueLimit: 0
});

const originalQuery = db.query;
// Les operations techniques (sessions) peuvent reutiliser le pool sans
// remplacer la derniere requete metier conservee par le journal d'audit.
db.queryWithoutAudit = originalQuery.bind(db);

db.query = function auditedQuery(...args) {
    recordSqlQuery(args[0]);
    const contextAwareArgs = args.map(arg => {
        if (typeof arg !== 'function') return arg;
        return bindAuditCallback((error, result, fields) => {
            if (!error) recordQueryResult(result);
            return arg(error, result, fields);
        });
    });
    return originalQuery.apply(this, contextAwareArgs);
};

db.getConnection((err, connection) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    connection.release();
    console.log('Connecté à la base de données MySQL');
});

module.exports = db;
