const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const User = require("./models/User");
const Booking = require("./models/Booking");
const Restaurant = require("./models/Restaurant");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://dinekro.netlify.app",
    credentials: true, 
  })
);
app.use(bodyParser.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Only image files are allowed!");
    }
  }
});

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const isAdmin = async (req, res, next) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser || adminUser.admin !== 1) {
      return res.status(403).json({ message: "Access denied! Admins only." });
    }

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

app.post("/signup", async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const newUser = new User({ email, password, username });
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        name: newUser.username,
        email: newUser.email,
        admin: newUser.admin
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.username,
        email: user.email,
        admin: user.admin
      }
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find(); 
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.post("/addRestaurant", upload.single("image"), async (req, res) => {
  const { name, location, table, cost, rating } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !location || !table || !cost || !rating) {
    return res.status(400).json({ message: "All fields are required..." });
  }

  try {
    const existingRestaurant = await Restaurant.findOne({ $or: [{ name }, { location }] });

    if (existingRestaurant) {
      return res.status(400).json({ message: "Restaurant already exists!" });
    }

    const newRestaurant = new Restaurant({
      name,
      location,
      table,
      cost,
      rating,
      imageUrl,
    });
    await newRestaurant.save();
    res.status(201).json({
      message: "Restaurant added successfully",
      restaurant: {
        name: newRestaurant.name,
        location: newRestaurant.location,
        table: newRestaurant.table,
        cost: newRestaurant.cost,
        rating: newRestaurant.rating,
        imageUrl: newRestaurant.imageUrl,
      },
    });
  } catch (err) {
    console.error("Error adding restaurant:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.post("/confirmBooking", async (req, res) => {
  const { name, date, time, people, contact, tableNumber, restaurant } = req.body;

  if (!name || !date || !time || !people || !contact || !tableNumber || !restaurant) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    const newBooking = new Booking({
      name,
      date,
      time,
      people,
      contact,
      tableNumber,
      restaurant
    });
    await newBooking.save();

    res.status(201).json({ message: "Booking Confirmed!", booking: newBooking });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/delete-restaurant/:id", isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (err) {
    console.error("Error deleting restaurant:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
