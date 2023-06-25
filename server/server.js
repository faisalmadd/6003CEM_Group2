// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Amadeus = require('amadeus');

// Create Express instance
const app = express();
const PORT = 5000; // define server port number

//  Parse JSON data from the body of a POST request
app.use(bodyParser.json())

// Allow request from port 4200 to access server resources
app.use(cors({
    origin: 'http://localhost:4200'
}));

// Start server on port 5000
app.listen(PORT, () =>
    console.log(`Server is running on port: http://localhost:${PORT}`)
);

// Create new Amadeus instance & specify API keys
const amadeus = new Amadeus({
    clientId: 'RPmhTGGRGj7X9cpKNNuvAFKol3KF0aTL',
    clientSecret: 'kOfLa0ZdtMTbrP4L',
});

// Defines a route handler for a GET request at the endpoint /city-and-airport-search/:parameter
app.get(`/city-and-airport-search/:parameter`, (req, res) => {
    // Retrieves the parameter value
    const parameter = req.params.parameter;
    
    // Which cities or airports start with the parameter variable
    amadeus.referenceData.locations
        .get({
            keyword: parameter,
            subType: Amadeus.location.any,
        })
        .then(function (response) {
            res.send(response.result);
        })
        .catch(function (response) {
            res.send(response);
        });
});