const WebSocket = require('ws');
const PORT = 3000;

// 记录连接的总用户
let count = 0;

const wss = new WebSocket.Server({
  port: PORT
})

wss.on('listening',() => {
  console.log('服务已开启~，监听端口：'  + PORT);
})

wss.on('connection', function connection(ws) {
  console.log(`有用户连接了`);
  count++;
  ws.userName = `用户${count}`;
  // 1、新用户进来后 通知所有人
  broadcast(`${ws.userName}进入了聊天室`);

  // 2、接收到浏览器发送的数据，通知所有人
  // 接收到用户数据
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
    broadcast(`${ws.userName}：${message}`);
  });

  // 3、有人离开，通知所有人
  // 用户断开
  ws.on("close", function close(message) {
    broadcast(`${ws.userName}退出聊天室`);
    count--;
  });

  // 捕获错误
  ws.on("error", function catchError(err) {
    console.log("捕获错误", err);
  });
})

function broadcast (data) {
  wss.clients.forEach(client => {
    if(client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  })
}

