const userList = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = userList.find(
    (user) => user.room === room && user.name === name
  );

  if (!name || !room) return { error: 'Please enter username and room.' };
  if (existingUser) return { error: 'Username is already taken.' };

  const user = { id, name, room };
  userList.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = userList.findIndex((user) => user.id === id);

  if (index !== -1) return userList.splice(index, 1)[0];
};

const getUser = (id) => userList.find((user) => user.id === id);

const getUsersInRoom = (room) => userList.filter((user) => user.room === room);

const getAllRooms = () => {
  const rooms = userList.map((user) => user.room);
  const uniqueRooms = [...new Set(rooms)];
  return uniqueRooms;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getAllRooms,
};
