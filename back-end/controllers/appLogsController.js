const appLogsModel = require("../models/applogs");

class AppLogsController {
    // READ
    static async getAllAppLogs(req, res) {
        try {
            const results = await appLogsModel.getAppLogs();
            res.json(results);
        } catch (error) {
            res.status(500).send('Error retrieving App Logs');
        }
    }

    // CREATE
    static async addNewAppLog(req, res) {
        try {
            await appLogsModel.addAppLog(req.body);
            res.send('App Log added successfully');
        } catch (error) {
            res.status(500).send('Error adding App Log');
        }
    }

    // DELETE
    static async deleteAppLog(req, res) {
        try {
            await appLogsModel.deleteAppLog(req.body.log_id);
            res.send('App Log deleted successfully');
        } catch (error) {
            res.status(500).send('Error deleting App Log');
        }
    }
}

module.exports = AppLogsController;
