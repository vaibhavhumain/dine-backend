const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: String,
  location: String,
  cost: Number,
  rating: Number,
  menu: [String],
  image: String, 
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
