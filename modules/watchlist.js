/**
 * For the user's watchlist
 * Is an exported function to avoud using globals
 */

// imports
var { watch } = require('fs');
var { get } = require('http');
var path = require('path');
var { title } = require('process');

module.exports = function(app, db, sessions) {
    var watchlists = db.collection("watchlists");

    function getUser(req){
        var token = req.headers.session || req.query.session;

        if(token && sessions[token]){
            if(typeof sessions[token] === "string"){
                return sessions[token];
            }
            return sessions[token].username;
        }
        return null;
    }

    app.get("/watchlist", async function (req, res) {
        var username = getUser(req);
        if(!username){
            res.status(401).json({error: "You are not logged in"});
            return;
        }
        var movies = await watchlists.find({username: username}).toArray();
        res.json(movies);
        
    });

    app.post("/watchlist/add", async function (req, res) {
        var username = getUser(req);
        if(!username){
            res.status(401).json({error: "You are not logged in"});
            return;
        }
        var movie = req.body;
        var exists = await watchlists.findOne({
            username: username,
            title: movie.title
        });
        
        // if the movie is already in the watchlist
        if(exists){
            res.json({ msgs: "Movie is already in watchlist"});
            return;
        }

        await watchlists.insertOne({
            username: username,
            title: movie.title,
            year: movie.year,
            poster: movie.poster,
            watched: false
        });
        res.json({msgs: "Movie has been added to the watchlist"})
        
    });

    app.delete("/watchlist/remove", async function(req, res){
        var username = getUser(req);
        if(!username){
            res.status(401).json({error: "You are not logged in"});
            return;
        }
        await watchlists.deleteOne({
            username: username,
            title: req.body.title
        });
        res.json({ msgs: "The movie has been removed from the watchlist"})
    });

    app.post("/watchlist/watched", async function(req, res){
        var username = getUser(req);
        if(!username){
            res.status(401).json({error: "You are not logged in"});
            return;
        }
        await watchlists.deleteOne({
            username: username,
            title: req.body.title
        });
        res.json({ msgs: "Removed from the watchlist and marked as watched"})
    });
};
