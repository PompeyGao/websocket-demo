// 聊天服务端
const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const users = [];

server.listen(3000, () => {
  console.log("服务已启动");
});

app.use(require("express").static("public"));

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

io.on("connection", (socket) => {
  console.log("新用户已连接");
  socket.on("login", (data) => {
    const isExist = users.some((user) => user.username === data.username);
    if (isExist) {
      socket.emit("login-error", { msg: "登录失败" });
    } else {
      users.push(data);
      socket.emit("login-success", data);
      io.emit("user-entry", data);
      io.emit("user-list", users);
      socket.username = data.username;
      socket.avatar = data.avatar;
    }
  });

  // 断开连接
  socket.on("disconnect", () => {
    console.log("socket", socket.username);
    if (socket.username) {
      // 把当前用户信息删掉
      const index = users.findIndex((i) => i.username === socket.username);
      users.splice(index, 1);
      // 告诉所有人xx退出
      io.emit("user-quit", { username: socket.username });
      // 通知所有人用户列表
      io.emit("user-list", users);
    }
  });

  socket.on("send", (data) => {
    io.emit("user-msg", data);
  });

  socket.on("send-img", (data) => {
    io.emit("user-img", data);
  });
});
