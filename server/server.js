// Import necessary modules
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import Amadeus from 'amadeus';
import rateLimit from "express-rate-limit";

// Import DB
import { FlightBooking } from './db.js';

// Declare placeholder variables for data persistence
var originCode = "";
var destinationCode = "";
var dateOfDeparture = "";
var grandTotal = "";
var bn = "";
var duration = "";

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

app.get(`/flight-search`, authenticate, (req, res) => {
    originCode = req.query.originCode;
    destinationCode = req.query.destinationCode;
    dateOfDeparture = req.query.dateOfDeparture;
    // Find the cheapest flights
    amadeus.shopping.flightOffersSearch.get({
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate: dateOfDeparture,
        adults: '1',
        max: '7'
    }).then(function (response) {
        res.send(response.result);
    }).catch(function (response) {
        res.send(response);
    });
});


app.post(`/flight-confirmation`, authenticate, (req, res) => {
    const flight = req.body.flight
    // Confirm availability and price
    amadeus.shopping.flightOffers.pricing.post(
        JSON.stringify({
            'data': {
                'type': 'flight-offers-pricing',
                'flightOffers': [flight],
            }
        })
    ).then(function (response) {
            res.send(response.result);
        }).catch(function (response) {
            res.send(response)
        })
})

app.post(`/flight-booking`, authenticate, (req, res) => {
  const flight = req.body.flight;
  const name = req.body.name;

  amadeus.booking.flightOrders.post(
    JSON.stringify({
      data: {
        type: 'flight-order',
        flightOffers: [flight],
        travelers: [
          {
            id: '1',
            dateOfBirth: '1999-01-01',
            name: {
              firstName: name.first,
              lastName: name.last,
            },
            gender: 'MALE',
            contact: {
              emailAddress: 'test@test.com',
              phones: [
                {
                  deviceType: 'MOBILE',
                  countryCallingCode: '60',
                  number: '1234567',
                },
              ],
            },
            documents: [
              {
                documentType: 'PASSPORT',
                birthPlace: 'Malaysia',
                issuanceLocation: 'George Town',
                issuanceDate: '2015-04-14',
                number: '00000000',
                expiryDate: '2025-04-14',
                issuanceCountry: 'MY',
                validityCountry: 'MY',
                nationality: 'MY',
                holder: true,
              },
            ],
          },
        ],
      },
    })
  )
    .then(function (response) {
      bn = response.data.associatedRecords[0].reference;
      grandTotal = flight.price.grandTotal;
      duration = flight.itineraries[0].duration;
      console.log(response.data.associatedRecords[0].reference);
      console.log(flight.price.grandTotal);
      console.log(flight.itineraries[0].duration);
      console.log(originCode);
      console.log(destinationCode);

      // Create a new instance of FlightBooking model
      const flightBooking = new FlightBooking({
        originLocation: originCode,
        destinationLocation: destinationCode,
        travelDate: dateOfDeparture,
        price: grandTotal,
        bookingNumber: bn,
        travelerFirstName: name.first,
        travelerLastName: name.last,
        travelDuration: duration,
      });

      // Save the flight booking to MongoDB
      flightBooking
        .save()
        .then((result) => {
          console.log("Success", result);
          res.sendStatus(200); // Send a success response
        })
        .catch((error) => {
          console.log("Error", error);
          res.sendStatus(500); // Send an error response
        });
    })
    .catch(function (response) {
      res.send(response);
    });
});

