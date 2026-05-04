/**
 * For the search page - allows users to search for movies using the OMDB API
 * and add them to their watchlist.
 * Is an exported function to avoid using globals.
 * 
 * Uses the same session pattern as user.js and watchlist.js
 */

const path = require('path');
const https = require('https');

// Free OMDB API key - get your own at http://www.omdbapi.com/apikey.aspx
// This demo key has limited requests per day
const OMDB_API_KEY = 'trilogy'; // replace with your own key if needed

module.exports = function(app, db, sessions) {

    /**
     * Helper: validate session using the same token pattern as user.js
     * Checks localStorage token + username sent as query params
     */
    function isValidSession(token, username) {
        return token && username && sessions[username] && sessions[username].token === token;
    }

    /**
     * Helper: fetch data from OMDB API
     */
    function omdbFetch(params) {
        return new Promise((resolve, reject) => {
            const query = new URLSearchParams({ apikey: OMDB_API_KEY, ...params }).toString();
            const url = `https://www.omdbapi.com/?${query}`;
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); }
                    catch (e) { reject(e); }
                });
            }).on('error', reject);
        });
    }

    // ── Serve the search HTML page ──
    app.get('/movies', (req, res) => {
        res.sendFile(path.join(__dirname, '../html_files/search.html'));
    });

    /**
     * GET /searchMovies?query=<title>&token=<token>&username=<username>
     * Searches OMDB for movies by title. Returns up to 10 results.
     * Session required.
     */
    app.get('/searchMovies', async (req, res) => {
        const { query, token, username } = req.query;

        if (!isValidSession(token, username)) {
            return res.json({ success: false, message: 'Session expired. Please log in again.' });
        }

        if (!query || query.trim() === '') {
            return res.json({ success: false, message: 'Please enter a search term.' });
        }

        try {
            const data = await omdbFetch({ s: query.trim(), type: 'movie' });

            if (data.Response === 'False') {
                return res.json({ success: true, movies: [], message: data.Error || 'No movies found.' });
            }

            // OMDB search returns basic info; send it as-is
            return res.json({ success: true, movies: data.Search || [] });

        } catch (err) {
            console.error('Error in /searchMovies:', err);
            return res.json({ success: false, message: 'Error fetching movies. Please try again.' });
        }
    });

    /**
     * GET /movieDetails?imdbID=<id>&token=<token>&username=<username>
     * Fetches full details for a single movie by IMDB ID.
     * Session required.
     */
    app.get('/movieDetails', async (req, res) => {
        const { imdbID, token, username } = req.query;

        if (!isValidSession(token, username)) {
            return res.json({ success: false, message: 'Session expired. Please log in again.' });
        }

        if (!imdbID) {
            return res.json({ success: false, message: 'No movie ID provided.' });
        }

        try {
            const data = await omdbFetch({ i: imdbID, plot: 'full' });

            if (data.Response === 'False') {
                return res.json({ success: false, message: data.Error || 'Movie not found.' });
            }

            return res.json({ success: true, movie: data });

        } catch (err) {
            console.error('Error in /movieDetails:', err);
            return res.json({ success: false, message: 'Error fetching movie details.' });
        }
    });

    /**
     * POST /submitReview
     * Saves a user's star rating + review for a movie to the DB.
     * Body: { imdbID, title, year, poster, rating, review, token, username }
     */
    app.post('/submitReview', async (req, res) => {
        const { imdbID, title, year, poster, rating, review, token, username } = req.body;

        if (!isValidSession(token, username)) {
            return res.json({ success: false, message: 'Session expired. Please log in again.' });
        }

        if (!imdbID || !title || rating === undefined) {
            return res.json({ success: false, message: 'Missing required fields.' });
        }

        const numRating = parseFloat(rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 10) {
            return res.json({ success: false, message: 'Rating must be between 1 and 10.' });
        }

        try {
            const reviews = db.collection('reviews');

            // Upsert: one review per user per movie
            await reviews.updateOne(
                { username: username, imdbID: imdbID },
                { $set: { username, imdbID, title, year, poster, rating: numRating, review: review || '', updatedAt: new Date() } },
                { upsert: true }
            );

            // Update the user's average rating and favorite movie in the users collection
            const allUserReviews = await reviews.find({ username: username }).toArray();
            const avgRating = allUserReviews.reduce((sum, r) => sum + r.rating, 0) / allUserReviews.length;

            // Favorite = the movie with the highest rating
            const favorite = allUserReviews.reduce((best, r) => r.rating > best.rating ? r : best, allUserReviews[0]);

            await db.collection('users').updateOne(
                { username: username },
                { $set: { average_rating: Math.round(avgRating * 10) / 10, favorite: favorite.title } }
            );

            return res.json({ success: true, message: 'Review saved!' });

        } catch (err) {
            console.error('Error in /submitReview:', err);
            return res.json({ success: false, message: 'Error saving review.' });
        }
    });

    /**
     * GET /getReview?imdbID=<id>&token=<token>&username=<username>
     * Gets the logged-in user's existing review for a movie (if any).
     */
    app.get('/getReview', async (req, res) => {
        const { imdbID, token, username } = req.query;

        if (!isValidSession(token, username)) {
            return res.json({ success: false, message: 'Session expired.' });
        }

        try {
            const review = await db.collection('reviews').findOne({ username, imdbID });
            return res.json({ success: true, review: review || null });
        } catch (err) {
            console.error('Error in /getReview:', err);
            return res.json({ success: false, message: 'Error fetching review.' });
        }
    });
};
