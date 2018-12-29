'use strict';

module.exports = (app) => {

    const fs = require('fs'),
          path = require('path'),
          folder = path.join(__dirname+'/../static/image/');

    fs.readdirSync(folder).forEach(file => {
        app.get('/static/image/'+file, (req, res) => {
            res.sendFile(path.join(__dirname+'/../static/image/'+file));
        })
    });

}