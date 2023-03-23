const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the login page");
});

router.post("/", (req, res) => {
  // Add logic for user authentication here
  res.send("User authentication endpoint");
});

module.exports = router;
