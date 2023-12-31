# 6003CEM_Group2

Web API Development

Flights Booking Web System


Main Features:

* City and airport search using the Amadeus Airport & City Search API. This will allow your user to select their origin and destination.
* Flight search using the Amadeus Flight Offers Search API. This will fetch a list of the cheapest flights between the origin and destination.
* Confirm a flight using Amadeus Flight Offers Price API. This will confirm the validity of the fare with the airline before booking.
* Flight booking using the Amadeus Flight Create Orders API. This will book the confirmed flight and generate a booking reference number.


To-do List:
1) make sure we can call the required flights API [Done]
2) make sure we can call the extra miscellaneous APIs (could be for hotel or flights) [Done]
3) start with the foundation of the website UI [Done]
4) begin implementing the UI with the API calls and all the required features [Done]
5) clean up the UI [Done]
6) Add username and password auth for the express server API [Done]
7) Add express-rate-limiter to prevent DoS attack [Done]
8) Add validation to prevent XSS & SQL injection attacks [Done]
9) Connect and insert flight booking details to database [Done]
10) Display the flight booking details in frontend []
