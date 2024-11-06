const db = require('../config/db');

class AppLogsModel {
    // READ
    static async getAppLogs() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM app_logs limit 3', [], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
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
