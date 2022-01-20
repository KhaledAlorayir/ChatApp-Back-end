import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as Users from "./UserController.js";

//
const app = express();
const MyServer = http.createServer(app);
const io = new Server(MyServer, {
  cors: { origin: "https://chat-app-sa.netlify.app" },
});

//
app.use(cors());

//
const PORT = process.env.PORT || 5000;
MyServer.listen(PORT, () => console.log("server is running"));

//
app.get("/", (_, res) => {
  res.send("Welcome!");
});

//Sockets
io.on("connection", (socket) => {
  //On Join
  socket.on("join", ({ name, room }, callback) => {
    const result = Users.AddUser(socket.id, name, room);

    if (result.error) return callback(result.error);

    //join user to room
    socket.join(room);

    //send to everyone in the room except the one who joined
    socket.broadcast.to(room).emit("message", {
      user: "admin",
      text: `${result.user.name} has joined the room!`,
    });
    //send to the one who joined
    socket.emit("message", {
      user: "admin",
      text: `${result.user.name} welcome to the room!`,
    });

    const usersInRoom = Users.getUsersInRoom(room);
    const names = usersInRoom.map((user) => user.name);
    io.to(room).emit("getUsers", names);

    callback();
  });

  //On send message
  socket.on("send", (message, callback) => {
    const user = Users.getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });

  socket.on("disconnect", () => {
    const u = Users.RemoveUser(socket.id);

    if (u) {
      io.to(u.room).emit("message", {
        user: "admin",
        text: `${u.name} has left the room`,
      });

      const usersInRoom = Users.getUsersInRoom(u.room);
      const names = usersInRoom.map((user) => user.name);
      io.to(u.room).emit("getUsers", names);
    }
  });
});
