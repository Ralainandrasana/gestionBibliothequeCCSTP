const mysql = require('mysql');
const { recordSqlQuery, recordQueryResult, bindAuditCallback } = require('../utils/auditContext');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fianarantsoa'	
});

const originalQuery = db.query;
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

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

module.exports = db;
