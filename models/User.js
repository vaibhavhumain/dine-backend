const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
