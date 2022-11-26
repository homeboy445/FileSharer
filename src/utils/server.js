const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const ip = require('ip');
app.use(express.static(path.join(__dirname, 'public')));

class FileSharerServer {
  constructor() {
    this.serverURL = `http://${ip.address()}:3005/`;
    this.httpServer = http.createServer(app);
    this.socketIO = new Server(this.httpServer);
    this.registerRoutes();
    this.connectSocket();
  }

  registerRoutes() {
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "./index.html"));
    });
  }

  connectSocket() {
    this.socketIO.on("connect", (socket) => {
      console.log("User connected!");
      socket.on('sendFile', (data) => {
        socket.broadcast.emit('receiveFile', data);
      });
      socket.on("disconnect", () => {
        console.log("User disconnected!");
      });
    });
  }

  getServerURL() {
    return this.serverURL;
  }

  run() {
    this.httpServer.listen(3005, ip.address(), () => {
      console.log("Server is running!");
    });
  }
}

module.exports = {
    Server: FileSharerServer
};
