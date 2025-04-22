const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketio(server);


app.use(express.json());

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("send-location", (data) => {
    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
    io.emit("user-disconnected", socket.id);
  });
});

app.post("/gps", (req, res) => {
  const { latitude, longitude } = req.body;
  console.log("ESP32 →", latitude, longitude);

  io.emit("receive-location", {
        id: "esp32",
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
    });

  res.sendStatus(200);
});


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});