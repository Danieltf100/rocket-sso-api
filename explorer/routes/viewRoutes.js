'use strict';
var fs = require('fs');

/**
 * 
 * @param {express} app
 * Render the index of the API server to presentation purpose. 
 */
module.exports = (app) => {
    var path = require('path'),
        indexHtml = path.join(__dirname+'/../pages/index.html');

    app.get('/', (req, res) => {
        var log = JSON.parse(fs.readFileSync('./log.json', 'utf8'));
        var now = new Date();
        var uptime = now.getTime() - log.time.begin;
        var r = {
            status: "The API is up and Running",
            uptime: uptime + ' milliseconds'
        }
        res.send(r);
    })

    app.get('/explorer', (req, res) => {
        res.sendFile(indexHtml);
    });

}