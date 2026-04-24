/**
 * For user-specific things like profile, login, and registration
 * Is an exported function to avoid using globals
 * 
 * Note to return resposnes as sending multiple headers at once occures and causes server crashes
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

                if (user) {
                    response.message = "Username already exists";
                    return res.json(response);
                }

                return db.collection('users')
                    .insertOne({ username: username, password: password, bio:"Tell us about yourself!", favorite: "", average_rating: 0 })
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

    app.get('/profile', (req, res) => {
        res.sendFile(path.join(__dirname, '../html_files/profile.html'));
    });

    app.get('/getProfileInfo' , (req, res) => {
        console.log("Received request for profile info with query:", req.query);
        const { token, username } = req.query;
        var response = {
            success: false,
            bio: null,
            favorite: null,
            averageRating: null
        };
        if(!token || !username || !sessions[username] || sessions[username].token !== token){
            console.log("Invalid or expired session for user:", username);
            res.json(response);
            return;
        }
        else{
            response.success = true;
            db.collection('users').findOne({ username: username })
            .then(user => {
                if (!user) {
                    response.success = false;
                    response.message = "User not found - Critical error: session exists for user that does not exist in database";
                    console.log(response.message);
                    return res.json(response);
                }
                console.log("User profile found for", username);
                response.bio = user.bio;
                response.favorite = user.favorite;
                response.averageRating = user.average_rating;

                console.log("response is", response);
                return res.json(response);
            })
            .catch(err => {
                response.success = false;
                console.log("Error in getProfileInfo:", err);
                response.message = "Error occurred while fetching profile information";
                return res.json(response);
            });
        }
    });

    app.get('/logout', (req, res) => {
        const { username } = req.query;

        if (sessions[username]) {
            delete sessions[username];
            console.log("User logged out:", username);
        }
        return res.json({});
    });


};