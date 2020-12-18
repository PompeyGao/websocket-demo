const WebSocket = require("ws");
const PORT = 3000;
/**
 * 传输的消息是个对象
 * type 消息类型
 *  0 表示进入聊天室的消息
 *  1 用户离开聊天室
 *  2 正常的聊天内容
 * msg 消息内容
 * time 时间
 */

// 记录连接的总用户
let count = 0;
const JOIN_TIP = 0;
const QUIT_TIP = 1;
const MSG = 2;

const wss = new WebSocket.Server({
  port: PORT,
});

wss.on("listening", () => {
  console.log("服务已开启~，监听端口：" + PORT);
});

wss.on("connection", function connection(ws) {
  console.log(`有用户连接了`);
  count++;
  ws.userName = `用户${count}`;
  // 1、新用户进来后 通知所有人
  broadcast({
    type: JOIN_TIP,
    msg: `${ws.userName}进入了聊天室`,
    time: new Date().toLocaleTimeString(),
  });

  // 2、接收到浏览器发送的数据，通知所有人
  // 接收到用户数据
  ws.on("message", function incoming(message) {
    console.log("receive: ", message);
    broadcast({
      type: MSG,
      msg: `${ws.userName}：${message}`,
      time: new Date().toLocaleTimeString(),
    });
  });

  // 3、有人离开，通知所有人
  // 用户断开
  ws.on("close", function close(message) {
    broadcast({
      type: QUIT_TIP,
      msg: `${ws.userName}退出聊天室`,
      time: new Date().toLocaleTimeString(),
    });
    count--;
  });

  // 捕获错误
  ws.on("error", function catchError(err) {
    console.log("捕获错误", err);
  });
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
