'use strict';

module.exports = (app) => {

    var sessionController = require('../controllers/sessionController');

    app.route('/api/sessions')
        .get(sessionController.list_all_sessions_from_user)
        .post(sessionController.login)
        .delete(sessionController.logout);

    app.route('/api/all/sessions/:apiToken')
        .get(sessionController.list_all);

};