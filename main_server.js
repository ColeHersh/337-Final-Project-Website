/**
 * This is the main server file for the movie review/watchlist website.
 * All other js files should be linked here if any are used.
 * Each module's code is in its own file to avoid merge conflicts
 * 
 * To work, make sure mongod is running so the database is online
 * 
 * npm install installs the required dependencies in the JSONS
 * 
 * This is the file that should be run to start the server. It handles all the modules as needed
 */

// express requirments
const express = require('express');
const app = express();

// file system requirments
const fs = require('fs');
var path = require('path');

//connect to the mongodb database
const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// this is for the user session managements - NOTE MAY HAVE TO MAKE GLOBAL OR PASS TO MODULES
var sessions = {}

// for JSONs
app.use(express.json());

// for css
app.use(express.static(path.join(__dirname, 'html_files')));
app.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/style.css');
});


client.connect()
.then(() => {
    console.log('Connected to MongoDB');

    // get the database
    const db = client.db('movie_reviews');

    // import the modules for the server
    require('./modules/user')(app, db, sessions);
    require('./modules/search')(app, db, sessions);
    require('./modules/watchlist')(app, db, sessions);


})
.catch((error) => {
console.error('Connection failed', error);
})

// per specs listen on port 8080
app.listen(8080, () => {
    console.log('Server is running on port 8080');
});