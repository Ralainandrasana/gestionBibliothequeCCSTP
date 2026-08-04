const db = require('../config/db');

class AppLogsModel {
    // READ
    static async getAppLogs({ limit = 20, offset = 0, search = '' } = {}) {
        const searchableColumns = `CONCAT_WS(' ',
            log_id, Timestamp, Action, TableName, RecordID, SqlQuery, UserID,
            ServerIP, RequestUrl, RequestData, RequestCompleted, RequestMsg
        )`;
        const whereClause = search ? ` WHERE ${searchableColumns} LIKE ?` : '';
        const searchValues = search ? [`%${search}%`] : [];

        const rows = await new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM app_logs${whereClause} ORDER BY log_id DESC LIMIT ? OFFSET ?`,
                [...searchValues, limit, offset],
                (error, result) => error ? reject(error) : resolve(result)
            );
        });

        const total = await new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(*) AS total FROM app_logs${whereClause}`,
                searchValues,
                (error, result) => error ? reject(error) : resolve(Number(result[0]?.total || 0))
            );
        });

        return { rows, total };
    }

    // CREATE
    static async addAppLog(data) {
        return new Promise((resolve, reject) => {
            const { Timestamp, Action, TableName, RecordID, SqlQuery, UserID, ServerIP, RequestUrl, RequestData, RequestCompleted, RequestMsg } = data;
            db.query('INSERT INTO app_logs(Timestamp, Action, TableName, RecordID, SqlQuery, UserID, ServerIP, RequestUrl, RequestData, RequestCompleted, RequestMsg) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                     [Timestamp, Action, TableName, RecordID, SqlQuery, UserID, ServerIP, RequestUrl, RequestData, RequestCompleted, RequestMsg], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // DELETE
    static async deleteAppLog(log_id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM app_logs WHERE log_id = ?', [log_id], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

module.exports = AppLogsModel;
