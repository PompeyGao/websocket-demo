const content = require("fs").readFileSync(__dirname + "/index.html", "utf8");
const httpServer = require("http").createServer((req, res) => {
  // serve the index.html file
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Content-Length", Buffer.byteLength(content));
  res.end(content);
});
const options = {};
const io = require("socket.io")(httpServer, options);

io.on("connection", (socket) => {
  console.log("连接成功", socket.id);
  socket.on('sendByClient', data => {
    socket.emit("hello", data);
  })
});

httpServer.listen(3000, () => {
  console.log("服务已启动，go to http://localhost:3000");
});
