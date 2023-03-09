// Function to generate random string of given length
function generateRandomString(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Function to send emails to invite users to join a chatroom
exports.sendInviteEmail = (email, name, room, url) => {
  // Construct the email message
  const message = `Hi there,<br>${name} has invited you to join the chatroom "${room}".<br>Please click on the link below to join the conversation:<br>${url}`;
  const subject = "Invitation to join the chatroom";

  // Create a nodemailer transporter
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dharamthokpranav@gmail.com",
      pass: "wrectzhamtdiqasj",
    },
  });

  // Set the email options
  const mailOptions = {
    from: "dharamthokpranav@gmail.com",
    to: email,
    subject: subject,
    html: `<h4>${message}</h4>`,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
