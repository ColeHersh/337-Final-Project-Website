/**
 * For the user spefic things like profile, login, and registration
 * Is an exported function to avoud using globals
 */

// imports
const path = require('path');

module.exports = function(app, db) {
    app.get(['/', '/login'], (req, res) => {
        res.sendFile(path.join(__dirname, '../html_files/login.html'));
    });

    app.get('/createUser', (req, res) => {
        res.sendFile(path.join(__dirname, '../html_files/createUser.html'));
    });
};