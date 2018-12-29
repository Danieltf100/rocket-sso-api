'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('Users'),
    Session = mongoose.model('Sessions'),
    sha512 = require('js-sha512').sha512,
    fs = require('fs'),
    env = JSON.parse(fs.readFileSync('./api/security/static/env.json', 'utf8')),
    log = require('node-pretty-log');

exports.create_a_user = (req, res) => {

    log('info', 'creating a user');
    var new_user = new User(req.body);
    new_user.password = sha512(new_user.password);
    new_user.save((err, user) => {
        if (err) {
            if (err.code === 11000) { // duplicate email
                log('warn', 'Oops, something going wrong', { task: 'Creating a user' }, 'caused by: Insert Duplicate email');
            } else {
                log('warn', 'Oops, something going wrong', { task: 'Creating a user' });
            }
            res.send(err);
        } else {
            log('success', 'A user was created as planned');
            res.json({
                message: 'User successfully created',
                userId: user._id
            });
        }
    });

};

exports.delete_a_user = (req, res) => {

    log('info', 'Deleting a user');
    User.remove({
        email: req.body.username,
        password: sha512(req.body.password)
    }, (err, user) => {
        if (err) {
            log('warn', 'Oops, something going wrong', { task: 'Deleting a user' });
            res.send(err);
        } else {
            log('success', 'A user was deleted as planned');
            res.json({ message: 'User successfully deleted' });
        }
    });

};

exports.get_a_user = (req, res) => {

    log('info', 'Getting a user');
    User.findById(req.params.userId, (err, user) => {
        if (err) {
            log('warn', 'Oops, something going wrong', { task: 'Getting a user' });
            res.send(err);
        } else {
            log('success', 'A user was getted as planned');
            res.json({
                _id: user._id,
                email: user.email,
                name: user.name
            });
        }
    })

};

exports.get_all_users_data = (req, res) => {

    if (req.params.apiToken === env.apiToken) {
        log('warn', 'Listing all users data');
        User.find({}, (err, users) => {
            if (err) {
                log('warn', 'Oops, something going wrong', { task: 'Listing all users data' });
                res.send(err);
            } else {
                log('success', 'Listing all users data');
                res.json(users);
            }
        });
    }
    else {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        log('warn', 'Unauthorized access detected', { task: 'List All Users data', ip: ip });
        res.status(401).send({ message: "You don't have permission to access this content. Ask to admin of the api to access it" });
    }

}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @description this method erase all users and is only for developer purpose and will never be submited in a route production
 */
exports.eraseUsers = (req, res) => {
    
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // The if ahead confirm if the user has access to do it and double check this by remote adress equal localhost (::1)
    if (req.params.apiToken === env.apiToken && ip.indexOf('::1') === 0) {
        User.remove({}, (err, resp) => {
            if (err) {
                log('warn', 'Oops, something going wrong', { task: 'Listing all users data' });
                res.send(err);
            } else {
                log('success', 'Listing all users data');
                res.json({ message: 'All users was deleted' });
            }
        })
    }
    else {
        log('warn', 'Unauthorized access detected', { task: 'Delete all db', ip: ip });
        res.status(401).send({ message: "You don't have permission to access this content. Ask to admin of the api to access it" });
    }

}