// Import necessary modules
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import Amadeus from 'amadeus';
import rateLimit from "express-rate-limit";

// Create Express instance
const app = express();
const PORT = 5000; // define server port number

// Define the username and password for authentication
const USERNAME = 'admin';
const PASSWORD = 'qwe12345';

// Middleware for basic authentication
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64')
            .toString()
            .split(':');
  
        const username = auth[0];
        const password = auth[1];
  
        if (username === USERNAME && password === PASSWORD) {
            return next();
        }
    }
  
    res.set('WWW-Authenticate', 'Basic realm="Authentication Required"');
    return res.status(401).send('Authentication Required');
};

//  Parse JSON data from the body of a POST request
app.use(bodyParser.json());

// Allow request from port 4200 to access server resources
app.use(cors({
    origin: 'http://localhost:4200'
}));

// Prevent DoS attacks by limiting number of requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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
app.get(`/city-and-airport-search/:parameter`, [
    // Validate input to prevent XSS or SQL injection attacks    
    check('parameter')
        .trim() // trims the input
        .isLength({ min: 1 }) // checks for a minimum length of 1
        .withMessage('Parameter is required')
        .escape() // replaces all characters with escape sequences
], authenticate, (req, res) => {
    // check for any validation errors
    const errors = validationResult(req);

    // If error, return a 400 response with the validation error messages
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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
