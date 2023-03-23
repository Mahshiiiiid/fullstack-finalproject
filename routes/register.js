
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:4000/api/user/signup", req.body);
    res.status(201).json({ message: "User created", userId: response.data.userId });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

module.exports = router;
