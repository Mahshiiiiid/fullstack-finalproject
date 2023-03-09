const express = require("express");
const router = express.Router();
const emailSender = require("./emailSender");

// Define the sendInvitations function
const sendInvitations = (req, res) => {
  // Your code for sending email invitations goes here
};

// Endpoint for inviting people to a chatroom
router.post("/invite", sendInvitations);

// Exporting the router module
module.exports = router;

