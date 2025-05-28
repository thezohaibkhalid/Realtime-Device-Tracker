const express = require("express");
const app = express();
const socketIo = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = socketIo(server);
const path = require("path");

const users = {};

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.emit("existing-users", users);

  socket.on("send-location", (data) => {
    users[socket.id] = data;
    io.emit("recieve-location", {
      id: socket.id,
      ...data,
    });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("user-disconnected", {
      id: socket.id,
    });
    console.log("A user disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
