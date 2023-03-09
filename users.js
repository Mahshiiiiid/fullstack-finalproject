const userList = [];

// add user to a specific room
const joinUserToRoom = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = userList.find(
    (user) => user.room === room && user.name === name
  );

  if (!name || !room) return { error: "Please enter username and room." };
  if (existingUser) return { error: "Username is already taken." };

  const user = { id, name, room };
  userList.push(user);

  return { user };
};

// remove user from a specific room
const removeUserFromRoom = (id) => {
  const index = userList.findIndex((user) => user.id === id);

  if (index !== -1) return userList.splice(index, 1)[0];
};

// get details of a user based on their id
const getUserById = (id) => userList.find((user) => user.id === id);

// get all users in a specific room
const getUsersInRoom = (room) => userList.filter((user) => user.room === room);

// get a list of all available rooms
const getAllRooms = () => {
  return userList;
};

module.exports = {
  joinUserToRoom,
  removeUserFromRoom,
  getUserById,
  getUsersInRoom,
  getAllRooms,
};
