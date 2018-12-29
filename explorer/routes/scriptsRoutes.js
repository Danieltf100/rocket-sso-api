'use strict';

module.exports = (app) => {

    const fs = require('fs'),
          path = require('path'),
          folder = path.join(__dirname+'/../scripts/');

    fs.readdirSync(folder).forEach(file => {
        app.get('/scripts/'+file, (req, res) => {
            res.sendFile(path.join(__dirname+'/../scripts/'+file));
        })
    });

}