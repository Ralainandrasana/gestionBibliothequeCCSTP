const db = require('../config/db');

const LOG_COLUMNS = `log_id, Timestamp, Action, TableName, RecordID, SqlQuery,
    UserID, ServerIP, RequestUrl, RequestData, RequestCompleted, RequestMsg`;

function getConnection() {
    return new Promise((resolve, reject) => {
        db.getConnection((error, connection) => error ? reject(error) : resolve(connection));
    });
}

function query(connection, sql, values = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (error, result) => error ? reject(error) : resolve(result));
    });
}

function beginTransaction(connection) {
    return new Promise((resolve, reject) => {
        connection.beginTransaction((error) => error ? reject(error) : resolve());
    });
}

function commit(connection) {
    return new Promise((resolve, reject) => {
        connection.commit((error) => error ? reject(error) : resolve());
    });
}

function rollback(connection) {
    return new Promise((resolve) => connection.rollback(resolve));
}

function normalizedRetentionDays(value) {
    const days = Number.parseInt(value, 10);
    return Number.isFinite(days) ? Math.min(Math.max(days, 30), 3650) : 365;
}

async function ensureArchiveTable(connection) {
    await query(connection, 'CREATE TABLE IF NOT EXISTS app_logs_archive LIKE app_logs');
    await query(
        connection,
        `ALTER TABLE app_logs_archive
         ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
    );
    await query(connection, 'CREATE INDEX IF NOT EXISTS idx_app_logs_timestamp ON app_logs (Timestamp)');
    await query(
        connection,
        'CREATE INDEX IF NOT EXISTS idx_app_logs_archive_timestamp ON app_logs_archive (Timestamp)'
    );
}

async function archiveAppLogs(retentionDays = process.env.APP_LOG_RETENTION_DAYS) {
    const days = normalizedRetentionDays(retentionDays);
    const connection = await getConnection();

    try {
        await ensureArchiveTable(connection);
        await beginTransaction(connection);

        const archived = await query(
            connection,
            `INSERT IGNORE INTO app_logs_archive (${LOG_COLUMNS})
             SELECT ${LOG_COLUMNS}
             FROM app_logs
             WHERE Timestamp < DATE_FORMAT(
                DATE_SUB(NOW(), INTERVAL ${days} DAY),
                '%Y-%m-%d %H:%i:%s'
             )`
        );

        const removed = await query(
            connection,
            `DELETE activeLog
             FROM app_logs activeLog
             INNER JOIN app_logs_archive archivedLog
                ON archivedLog.log_id = activeLog.log_id
             WHERE activeLog.Timestamp < DATE_FORMAT(
                DATE_SUB(NOW(), INTERVAL ${days} DAY),
                '%Y-%m-%d %H:%i:%s'
             )`
        );

        await commit(connection);
        return {
            retentionDays: days,
            archived: Number(archived.affectedRows || 0),
            removedFromActive: Number(removed.affectedRows || 0)
        };
    } catch (error) {
        await rollback(connection);
        throw error;
    } finally {
        connection.release();
    }
}

if (require.main === module) {
    archiveAppLogs()
        .then((result) => console.log(JSON.stringify(result)))
        .catch((error) => {
            console.error(error);
            process.exitCode = 1;
        })
        .finally(() => db.end());
}

module.exports = { archiveAppLogs };
