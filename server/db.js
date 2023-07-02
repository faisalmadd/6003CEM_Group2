import mongoose from 'mongoose';

const db = 'mongodb+srv://faisal:faisal@testing.g8wd6a3.mongodb.net/WebAPIProject';

mongoose.connect(db)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log("Error connecting to database:", error);
  });

const flightBookingSchema = new mongoose.Schema({
  originLocation: { type: String },
  destinationLocation: { type: String },
  travelDate: { type: String },
  price: { type: String },
  bookingNumber: { type: String },
  travelerFirstName: { type: String },
  travelerLastName: { type: String },
  travelDuration: { type: String },
});

export const FlightBooking = mongoose.model('flightbookings', flightBookingSchema);
