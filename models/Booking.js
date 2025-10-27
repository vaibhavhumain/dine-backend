const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    name: String,
    date: String,
    time: String,
    people: Number,
    contact: String,
    tableNumber: String,
    restaurant: {
        name: String,
        location: String,
        cost: String,
        rating: String
    }
});

module.exports = mongoose.model("Booking", bookingSchema);
