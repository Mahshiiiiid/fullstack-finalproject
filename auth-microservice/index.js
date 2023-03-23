const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Route to authenticate a user and return an access token
app.post('/authenticate', async (req, res) => {
  const { code, redirectUri } = req.body;

  if (!code || !redirectUri) {
    return res.status(400).json({ error: 'Code and redirectUri are required.' });
  }

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
    console.error('Authentication failed:', error.message);
    res.status(400).json({ error: 'Authentication failed' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Authentication microservice is running on port ${port}`);
});
