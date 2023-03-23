const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {
  console.log('Request body:', req.body); // Add this line to log the request body

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });

    const result = await user.save();
    res.status(201).json({ message: "User created", userId: result._id });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

router.post("/login", async (req, res) => {
  let user;
  try {
    user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error finding user" });
  }

  let passwordIsValid;
  try {
    passwordIsValid = await bcrypt.compare(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error validating password" });
  }

  const token = jwt.sign({ userId: user._id, username: user.username }, "your_jwt_secret", { expiresIn: "1h" });
  res.status(200).json({ token: token, expiresIn: 3600, userId: user._id });
});

module.exports = router;
