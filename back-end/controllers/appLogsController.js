const appLogsModel = require("../models/appLogs");

class AppLogsController {
    // READ
    static async getAllAppLogs(req, res) {
        try {
            const requestedPage = Number.parseInt(req.query.page, 10);
            const requestedPageSize = Number.parseInt(req.query.pageSize, 10);
            const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
            const pageSize = Number.isFinite(requestedPageSize)
                ? Math.min(Math.max(requestedPageSize, 10), 100)
                : 20;
            const search = String(req.query.search || '').trim().slice(0, 150);
            const { rows, total } = await appLogsModel.getAppLogs({
                limit: pageSize,
                offset: (page - 1) * pageSize,
                search
            });

            res.json({
                data: rows,
                pagination: { current: page, pageSize, total }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des journaux :', error);
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
