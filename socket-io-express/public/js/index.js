//1、连接服务
const socket = io("http://127.0.0.1:3000");

let userInfo = {};

//2、登录功能
// 选择头像
$("#login_avatar li").on("click", function () {
  $(this).addClass("now").siblings().removeClass("now");
});

$("#loginBtn").on("click", function () {
  // 获取用户名
  const username = $("#username").val().trim();
  if (!username) {
    alert("请输入用户名");
    return;
  }
  // 获取头像
  const avatar = $("#login_avatar li.now img").attr("src");

  socket.emit("login", {
    username,
    avatar,
  });
  socket.on("login-error", (data) => {
    alert("用户已存在，登录失败");
  });
  socket.on("login-success", (data) => {
    // alert("登录成功");
    $(".login_box").fadeOut();
    $(".container").fadeIn();
    $("#avatar_url").attr("src", data.avatar);
    $(".user-list .username").text(data.username);
    userInfo = data;
  });
});
socket.on("user-entry", (data) => {
  // 添加一条系统消息
  $(".box-bd").append(`<div class="system">
            <p class="message_system">
              <span class="content">${data.username}加入了群聊</span>
            </p>
          </div>`);
  scrollIntoView();
});

socket.on("user-list", (data) => {
  $(".user-list ul").html("");
  $("#userCount").text(data.length);
  data.forEach((item) => {
    $(".user-list ul").append(`<li class="user">
            <div class="avatar"><img src=${item.avatar} alt="头像" /></div>
            <div class="name">${item.username}</div>
          </li>`);
  });
});

socket.on("user-quit", (data) => {
  // 添加一条系统消息
  $(".box-bd").append(`<div class="system">
            <p class="message_system">
              <span class="content">${data.username}退出了群聊</span>
            </p>
          </div>`);
  scrollIntoView();
});

$("#btn-send").on("click", function () {
  const msg = $("#content").val().trim();
  if (!msg) return alert("消息不能为空！");
  socket.emit("send", {
    ...userInfo,
    msg,
  });
  $("#content").val("");
});

socket.on("user-msg", (data) => {
  // 自己发的消息
  if (data.username === userInfo.username) {
    $(".box-bd").append(`<div class="message-box">
            <div class="my message">
              <img class="avatar" src=${data.avatar} alt="" />
              <div class="content">
                <div class="bubble">
                  <div class="bubble_cont">${data.msg}</div>
                </div>
              </div>
            </div>
          </div>`);
  } else {
    $(".box-bd").append(`<div class="message-box">
            <div class="other message">
              <img class="avatar" src=${data.avatar} alt="" />
              <div class="content">
                <div class="nickname">${data.username}</div>
                <div class="bubble">
                  <div class="bubble_cont">${data.msg}</div>
                </div>
              </div>
            </div>
          </div>`);
  }
  scrollIntoView();
});

function scrollIntoView() {
  $(".box-bd").children(":last").get(0).scrollIntoView(false);
}

// 发送图片

$("#file").on("change", function () {
  const file = this.files[0];
  console.log("file", file);

  const fr = new FileReader();
  fr.readAsDataURL(file);
  fr.onload = function () {
    socket.emit("send-img", {
      ...userInfo,
      img: fr.result,
    });
  };
});

socket.on("user-img", (data) => {
  console.log("data", data);
  // 自己发的消息
  if (data.username === userInfo.username) {
    $(".box-bd").append(`<div class="message-box">
            <div class="my message">
              <img class="avatar" src=${data.avatar} alt="" />
              <div class="content">
                <div class="bubble">
                  <div class="bubble_cont">
                    <img src=${data.img}>
                  </div>
                </div>
              </div>
            </div>
          </div>`);
  } else {
    $(".box-bd").append(`<div class="message-box">
            <div class="other message">
              <img class="avatar" src=${data.avatar} alt="" />
              <div class="content">
                <div class="nickname">${data.username}</div>
                <div class="bubble">
                  <div class="bubble_cont">
                    <img src=${data.img}>
                  </div>
                </div>
              </div>
            </div>
          </div>`);
  }
  // 等待图片加载完成 在滚动
  $(".box-bd img:last").on("load", () => {
    scrollIntoView();
  });
});
