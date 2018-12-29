'use strict';

module.exports = (app) => {

    var userController = require('./../controllers/UserController');

    app.route('/api/user')
        .post(userController.create_a_user)
        .delete(userController.delete_a_user);

    app.route('/api/user/:userId')
        .get(userController.get_a_user);

    app.route('/api/:apiToken/users/data')
        .get(userController.get_all_users_data);

};