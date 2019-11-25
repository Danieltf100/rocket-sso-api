var express = require('express'),
    app = express(),
    port = process.env.PORT || 80,
    log = require('node-pretty-log'),
    mongoose = require('mongoose'),
    Session = require('./api/models/sessionModel'),
    User = require('./api/models/UserModel'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    sha512 = require('js-sha512').sha512;

try {
    // mongoose instance connection url connection
    log('info', '   > Starting connection with database');
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/HomolApi', { useNewUrlParser: true });

    log('info', '   > Setup app');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    log('info', '   > Updating API Token');
    try {
        var path = './api/security/static/env.json';
        var env = JSON.parse(fs.readFileSync(path, 'utf8'));
        var apiToken = sha512(env.apiToken);
        apiToken = apiToken.substring(0, 31);
        env.apiToken = apiToken;
        fs.writeFileSync(path, JSON.stringify(env));
        log('success', '> The API Token was updated');
    } catch (err) {
        log('error', '  > The API Token can not be updated.');
    }

    log('info', '   > Adding routes to app');
    // Imports
    var userRoute = require('./api/routes/UserRoutes');
    var sessionRoute = require('./api/routes/sessionRoutes');
    var viewRoute = require('./explorer/routes/viewRoutes');
    var assetRoute = require('./explorer/routes/assetRoutes');
    var scriptsRoute = require('./explorer/routes/scriptsRoutes');
    // Routes
    userRoute(app);
    sessionRoute(app);
    viewRoute(app);
    log('info', '   > Adding and updating assets route');
    assetRoute(app);
    log('info', '   > Adding and updating scripts route');
    scriptsRoute(app);


    log('info', '   > Registering port to app');
    app.listen(port);
    fs.writeFileSync('./log.json', JSON.stringify({
        time: {
            begin: (new Date().getTime()),
            end: null
        },
        date: (new Date().toDateString())
    }));

    /**
     * use first argument value as: info, warn, success or error.
     * @example log('info', ...any);
     */
    log('success', '> API Restful started on port ' + port);
} catch (err) {
    log('error', err);
}

module.exports = app;