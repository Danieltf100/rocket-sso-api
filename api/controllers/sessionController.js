'use strict';

var mongoose = require('mongoose'),
    log = require('node-pretty-log'),
    sha512 = require('js-sha512'),
    fs = require('fs'),
    env = JSON.parse(fs.readFileSync('./api/security/static/env.json', 'utf8')),
    Users = mongoose.model('Users'),
    Sessions = mongoose.model('Sessions');

exports.login = (req, res) => {

    // Try find user
    log('info', 'Looking for existent user');

    Users.find({
        email: req.body.email,
        password: sha512(req.body.password)
    }, (err, user) => {

        if (err) {
            log('warn', 'Oops, something going wrong', { task: 'Looking for existent user' });
            res.send(err);
        } else {
            // if find, search for session existent
            log('info', 'Working in user response');
            if (user.length > 0) {
                log('info', 'Starting a session to user ' + user[0]._id);
                var newSession = new Sessions({ user: user[0]._id });
                newSession.save((errOnSave, savedSession) => {
                    if (errOnSave) {
                        log('warn', 'Oops, something going wrong', { task: 'Starting a session' });
                        res.send(errOnSave);
                    } else {                        
                        log('success', 'Session started');
                        res.json({ SessionKey: savedSession._id });
                    }
                });
            } else {
                res.status(200).json({ message: "The email adress or password is invalid or the user don't exist" });
            }
        }

    });

};

exports.logout = (req, res) => {

    // End Session
    log('info', 'Ending session');
    Sessions.remove({
        _id: req.body.SessionKey
    }, (err, session) => {
        if (err) {
            log('warn', 'Oops, something going wrong', { task: 'Ending a session' });
            res.send(err);
        }
        log('success', 'Session ended successfuly');
        res.json({ message: 'Session ended' });
    })

};

exports.list_all_sessions_from_user = (req, res) => {

    log('info', 'Listing all sessions from user');
    var key = req.body.SessionKey;
    if (key === null || key === undefined) {
        key = req.query.SessionKey;
    }
    Sessions.findById(key, (err, session) => {

        if (err) {
            log('warn', 'Oops, something going wrong', { task: 'Getting a session' });
            res.send(err);
        }
        if (session !== null && session !== undefined) {
            log('info', 'Checking all sessions from the user ' + session.user._id);
            Sessions.find({
                user: session.user
            }, (s_err, sessions) => {

                if (s_err) {
                    log('warn', 'Oops, something going wrong', { task: 'Getting all sessions from user' });
                    res.send(s_err);
                }
                log('success', 'Listing all sessions from user ' + session.user._id);
                res.json(sessions);

            });
        }
        else {
            var r = 'There is any session geristered for SessionKey: ' + key;
            log('info', r);
            res.json({ message: r });
        }

    });

};

exports.list_all = (req, res) => {

    if (req.params.apiToken === env.apiToken) {

        log('info', 'Listing all sessions registered');
        Sessions.find({}, (err, sessions) => {

            if (err) {
                log('warn', 'Oops, something going wrong', { task: 'Getting all sessions' });
                res.send(err);
            }
            log('success', 'Sending all Sessions');
            res.json(sessions);

        });
    }
    else {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        log('warn', 'Unauthorized access detected', { task: 'List All Sessions', ip: ip });
        res.status(401).send({ message: "You don't have permission to access this content. Ask to admin of the api to access it" });
    }

};