/**
 * For user-specific things like profile, login, and registration
 * Is an exported function to avoid using globals
 */

// imports
const path = require('path');

module.exports = function(app, db, sessions) {

    /**
     * Generate a random token for user sessions
     */
    function generateToken() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-+*/~=_';
        let token = '';

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

    app.post('/createUserAuth', (req, res) => {

        const { username, password } = req.body;

        const response = {
            success: false,
            message: ""
        };

        db.collection('users')
            .findOne({ username: username })
            .then(user => {

                // USER EXISTS → STOP HERE
                if (user) {
                    response.message = "Username already exists";
                    return res.json(response);
                }

                // IMPORTANT: return insert promise so chain continues correctly
                return db.collection('users')
                    .insertOne({ username: username, password: password })
                    .then(() => {
                        response.success = true;
                        response.message = "User created successfully";
                        return res.json(response);
                    });

            })
            .catch(err => {
                console.log("Error in createUserAuth:", err);
                response.message = "Error occurred. Please try again later.";
                return res.json(response);
            });
    });

    app.post('/loginAuth', (req, res) => {

        const { username, password } = req.body;

        const response = {
            success: false,
            token: null,
            message: ""
        };

        db.collection('users')
            .findOne({ username: username, password: password })
            .then(user => {

                if (!user) {
                    response.message = "username or password is incorrect";
                    return res.json(response);
                }

                response.success = true;
                response.token = generateToken();

                // store session
                sessions[username] = { token: response.token };

                return res.json(response);
            })
            .catch(err => {
                console.log("Error in loginAuth:", err);
                response.message = "Error occurred while searching for user";
                return res.json(response);
            });
    });

};