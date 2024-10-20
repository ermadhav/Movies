const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');

const OMDB_API_KEY = '15c25776'; // Your OMDB API Key

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

// Route for rendering the search form
app.get('/', (req, res) => {
    res.render('search'); // This should be your search.ejs file
});

// Route for handling search results
app.get('/results', async (req, res) => {
    const query = req.query.search;
    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`;

    try {
        const response = await axios.get(url, { timeout: 10000 }); // 10 seconds timeout
        const data = response.data;

        // Check if there are search results
        if (data.Response === "True") {
            const movieDetails = await Promise.all(
                data.Search.map(async (movie) => {
                    const movieDetailUrl = `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${OMDB_API_KEY}`;
                    const movieDetailResponse = await axios.get(movieDetailUrl);
                    return movieDetailResponse.data;
                })
            );
            res.render('movies', { data: movieDetails, searchQuery: query });
        } else {
            res.render('movies', { data: [], searchQuery: query, errorMessage: data.Error });
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).send('Something went wrong.');
    }
});

// Start the server
// app.listen(3000, () => {
//     console.log('Server started at port 3000');
// });


module.exports = app; // Export the app for Vercel