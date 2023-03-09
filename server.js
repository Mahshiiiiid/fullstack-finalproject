const http = require('http');
const express = require('express');
const app = express();
const socketio = require('socket.io');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { addUser, removeUser, getUser, getUsersInRoom, getAllRooms } = require('./users');
const router = require('./router');
const { sendInviteEmail } = require('./emailSender');

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
app.use('/chat', router);

// Set up CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Set up socket listeners
io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'welcomeText', text: `Hello ${user.name}, Welcome to the ${user.room}.  Happy Chatting! ` });
    socket.broadcast.to(user.room).emit('message', { user: 'welcomeText', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('getRoomList', (callback) => {
    const rooms = getAllRooms();
    const roomList = rooms.map((room) => room.room);
    socket.emit('roomList', { roomList });
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

  socket.on('error', (error) => {
    console.log(`${socket.id}: ${error}`);
  });
});

// Test API
app.get('/', (req, res) => {
  res.send({ response: 'Server is running' });
});

// New route for '/invite'
app.post('/invite', (req, res) => {
  const { email, name } = req.body;
  sendInviteEmail(email, name);
  res.send('Invite sent successfully');
});

// Set up server instances
const socketServer = server.listen(4000, () => console.log(`Socket server has started on port 4000.`));
const emailServer = app.listen(4001, () => console.log(`Email server has started on port 4001.`));

// Export app and servers for testing purposes
module.exports = { app, socketServer, emailServer };



