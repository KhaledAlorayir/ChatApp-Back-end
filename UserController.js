import User from "./model/User.js";
const users = [];

export const AddUser = (id, name, room) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const u = new User(id, name, room);

  const exists = users.find(
    (user) => u.name === user.name && u.room === user.room
  );

  if (exists)
    return { error: "thier is already a user in this room with this name!" };

  users.push(u);

  return { user: u };
};

export const RemoveUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

export const getUser = (id) => {
  return users.find((user) => user.id === id);
};

export const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

export const Print = () => {
  console.log(users);
};
