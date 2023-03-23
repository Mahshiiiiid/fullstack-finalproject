const http = require('http');
const express = require('express');
const app = express();
const socketio = require('socket.io');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { addUser, removeUser, getUser, getUsersInRoom, getAllRooms } = require('./users');
const router = require('./router');
const { sendInviteEmail } = require('./emailSender');
const axios = require('axios');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const cors = require('cors');
const userRoutes = require('./routes/user');
const jwt = require('jsonwebtoken');
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");

// Load environment variables
dotenv.config();

// Create server instance
const server = http.createServer(app);
const io = socketio(server);

// Set up middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/user', userRoutes);
app.use('/chat', router);
app.use("/api/login", loginRouter);
app.use("/api/register", registerRouter);
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://Mahshiiiid:Mahshid9988@cluster-mahshid.yobd8l3.mongodb.net/chatapp?retryWrites=true&w=majority';
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection to database failed!');
  });

  // Set up socket listeners
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token;
      const decodedToken = jwt.verify(token, '4b8c91d394f7210cb7f3cf43a11a914d70a0c26f5832f8ff90a94a15a6835e5d');

      socket.user = decodedToken;
      next();
    } catch (error) {
      console.log('Socket authentication error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connect', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
      const { error, user } = addUser({ id: socket.id, name, room });

      if (error) return callback(error);

      socket.join(user.room);

      socket.emit('message', { user: 'welcomeText', text: `Hello ${user.name}, Welcome to the ${user.room}. Happy Chatting!` });
      socket.broadcast.to(user.room).emit('message', { user: 'welcomeText', text: `${user.name} has joined!` });

      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

      callback();
    });

    socket.on('getRoomList', (callback) => {
      const rooms = getAllRooms();
      socket.emit('roomList', { roomList: rooms });
      callback();
    });

    socket.on('sendMessage', (message, callback) => {
      const user = getUser(socket.id);
      io.to(user.room).emit('message', { user: user.name, text: message });
      callback();
    });

    socket.on('disconnect', () => {
      const user = removeUser(socket.id);

      if (user) {
        io.to(user.room).emit('message', { user: 'welcomeText', text: `${user.name} has left.` });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
      }
    });
  });

  // Start the server
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
