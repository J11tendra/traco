// const express = require("express");
// const app = express();
// const http = require("http");
// const path = require("path");

// const socketio = require("socket.io");

// const server = http.createServer(app);
// const io = socketio(server);

// io.on("connection", function (socket) {
//     socket.on("send-location", function (data) {
//         io.emit("receive-location", {id: socket.id, ...data})
//     })

//      socket.on("disconnect", function (reason) {
//         console.log(`Client disconnected: ${socket.id} (${reason})`);
//         io.emit("user-disconnected", socket.id);
//      });
    
//     console.log("connected"); 
// });

// app.set("view engine", "ejs");
// app.use (express.static(path.join(__dirname, "public")));

// app.get("/", function (req, res) {
//     res.render("index");
// })


// server.listen(3000, "0.0.0.0");



const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

// ───────────────────────────────────────────────────
// Middleware to parse JSON bodies
app.use(express.json());

// Serve your client app
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

// ─── Socket.IO connection & relay ───────────────────
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

// ─── ESP32 POST handler ─────────────────────────────
app.post("/gps", (req, res) => {
  const { latitude, longitude } = req.body;
  console.log("ESP32 →", latitude, longitude);

  // Broadcast to all clients under a fixed ID
  io.emit("receive-location", {
        id: "esp32",
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
    });

  res.sendStatus(200);
});

server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
