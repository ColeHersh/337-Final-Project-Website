/**
 * For the user spefic things like profile, login, and registration
 * Is an exported function to avoud using globals
 */

// imports
const path = require('path');

module.exports = function(app, db, sessions) {
    /**
     * Generate a random token for user sessions
     */
    function generateToken() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-+*/~=_';
        var token = '';
        for (let i = 0; i < 16; i++) {
            token += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return token;
    }

    app.get(['/', '/login'], (req, res) => {
        res.sendFile(path.join(__dirname, '../html_files/login.html'));
    });

    app.get('/createUser', (req, res) => {
        res.sendFile(path.join(__dirname, '../html_files/createUser.html'));
    });

    // this is used to authenticate a login 
    app.post('/loginAuth', (req, res) => {

        const { username, password } = req.body;

        let response = {
            success: false,
            token: null,
            message: ""
        };

        db.collection('users').findOne({ username: username, password: password })
            .then(user => {

                if (!user) {
                    response.message = "username or password is incorrect";
                    return res.json(response);
                }

                response.success = true;
                response.token = generateToken();

                // store session
                sessions[username] = { token: response.token };

                res.json(response);
            })
            .catch(err => {
                console.log("Error when searching for user in loginAuth: " + err);
                response.message = "Error occurred while searching for user";
                res.json(response);
            });

    });
}