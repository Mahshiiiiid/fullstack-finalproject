const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to authenticate a user and return an access token
app.post('/authenticate', async (req, res) => {
  const { code, redirectUri } = req.body;

  try {
    const auth0Response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }
    );

    res.json({
      accessToken: auth0Response.data.access_token,
      idToken: auth0Response.data.id_token,
      expiresIn: auth0Response.data.expires_in,
    });
  } catch (error) {
    res.status(400).json({ error: 'Authentication failed' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Authentication microservice is running on port ${port}`);
});
