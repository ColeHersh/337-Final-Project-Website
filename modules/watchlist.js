/**
 * For the user's watchlist
 * Is an exported function to avoid using globals
 */
var path = require('path');
module.exports = function(app, db, sessions) {
    var watchlists = db.collection("watchlists");

    function getUser(req) {
        var token = req.headers.session || req.query.session;

        for (var username in sessions) {
            if (sessions[username].token === token) {
                return username;
            }
        }

        return null;
    }
    app.get("/watchlist", async function(req, res) {
        /*var username = getUser(req);

        if (!username) {
            res.status(401).json({ error: "You are not logged in" });
            return;
        }

        var movies = await watchlists.find({ username: username }).toArray();
        res.json(movies);8?
            */
        res.sendFile(path.join(__dirname, '../html_files/watchlist.html'));
    });

    app.get("/watchlist/load", async function(req, res) {
        var username = getUser(req);
        var movies = await watchlists.find({ username: username }).toArray();
        res.json(movies);
    });

    app.post("/watchlist/add", async function(req, res) {
        var username = getUser(req);

        if (!username) {
            res.status(401).json({ error: "You are not logged in" });
            return;
        }

        var movie = req.body;

        var exists = await watchlists.findOne({
            username: username,
            title: movie.title
        });

        if (exists) {
            res.json({ msgs: "Movie is already in watchlist" });
            return;
        }

        await watchlists.insertOne({
            username: username,
            title: movie.title,
            year: movie.year,
            poster: movie.poster,
            rating: 0,
            ratingSum: 0,
            ratingCount: 0,
            watched: false
        });

        res.json({ msgs: "Movie has been added to the watchlist" });
    });

    // watched does same thing so remove as unessesary
    /*app.delete("/watchlist/remove", async function(req, res) {
        var username = getUser(req);

        if (!username) {
            res.status(401).json({ error: "You are not logged in" });
            return;
        }

        await watchlists.deleteOne({
            username: username,
            title: req.body.title
        });

        res.json({ msgs: "The movie has been removed from the watchlist" });
    });*/

    app.post("/watchlist/watched", async function(req, res) {
        var username = getUser(req);

        if (!username) {
            res.status(401).json({ error: "You are not logged in" });
            return;
        }

        await watchlists.deleteOne({
            username: username,
            title: req.body.title
        });

        res.json({ msgs: "Removed from the watchlist and marked as watched" });
    });

    // now defunct as done in search module
    /*app.post("/watchlist/rating", async function(req, res) {
        var username = getUser(req);

        if (!username) {
            res.status(401).json({ error: "You are not logged in" });
            return;
        }
        var rating = parseInt(req.body.rating);

        await watchlists.updateOne(
            {
                username: username,
                title: req.body.title
            },
            {
                $set:{
                    rating: rating
                },
                $inc: {
                    ratingSum: rating,
                    ratingCount: 1
                }
            }
        );

        res.json({ msgs: "Rating updated" });
    });*/
};