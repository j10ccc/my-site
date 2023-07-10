---
layout: "@layouts/MarkdownPostLayout.astro"
title: 蚂蚁技术体验部大作业总结
author: J10c
pubDate: 2022-01-16
tags: ["programming"]
---

## 背景

-   这次前端课收获颇丰，蚂蚁高层讲师水平高，代码风格棒，教学态度也很好，课堂氛围融洽~~（第一节课的老师甚至跟我聊起了 HHKB）~~
-   期末还差两门考试在一个星期后，突然想起来博客好像好久没有更新了。
-   今天大家好像也都不想复习了，就来写这份总结
-   博客的代码框不知道为啥变回黄色了，可能是 Linux 下 hugo 的锅，反正懒得再改了（

## 技术栈

-   NodeJS
-   koa
-   socket.io
-   客户端
-   服务端

## koa

> [Koa](https://koa.bootcss.com/)是一个基于 Node.js 平台的下一代 web 开发框架。

~~上半节课用原生 node 写的 http 服务器代码忘记放哪里去了，反正 koa 10行代码就能搞定~~

### 注意

`koa`代码全写在**后端程序**里面

### 引入

```js
const path = require('path');
const http = require('http');
const Koa = require('koa');
const serve = require('koa-static');
```

### 模板

```js
// 初始化
const hostname = '127.0.0.1';
const port = 3000;
const publicPath = path.join(__dirname, 'public');

// 创建koa实例
const app = new Koa();

// 创建http server 实例
const server = http.createServer(app.callback());
/*
   code here...
 */

app.use(serve(publicPath));

server.listen(port, hostname, () => {
	console.log('listening...');
});
```

## socket.io

> [Socket.IO](https://socketio.bootcss.com/) 是一个可以在浏览器与服务器之间实现实时、双向、基于事件的通信的工具库。

~~写这部分代码太痛苦了，写错了一个对象一直没发现，还以为是 wsl 的问题~~

### 注意

socket.io在客户端最好不要使用本地引用，好像会出锅？控制台一直会报错，不知道为啥

### 服务端

##### 主框架

以下代码写在上面的**koa代码**的`code here`

```js
/*
   以下代码是写在上面的koa代码的 code here 处的
 */

//创建 socket.io实例
const io = socketIO(server);

//储存在线所有用户
const users = new Map();
const historys = [];

// 客户端接入
io.use((socket, next) => {
	const { name, password } = socket.handshake.query;
	if (!name) {
		return next(new Error('WRONG_ACCOUNT'));
	}
	if (password !== 'j10c') {
		console.log("wrong password");
		return next(new Error('WRONG_PASSWORD'));
	}
	next();
});

io.on('connection', function(socket) {
	console.log('user connected');
	const name = socket.handshake.query.name;
	users.set(name, socket); // 在表中储存用户消息
	console.log('users====', users.keys());
	io.sockets.emit('online', [...users.keys()]); // 注意 sockets ！！！

	socket.on('disconnect', function(socket) {
		console.log(socket); //transport close
		console.log('user connected');
		users.delete(name, socket);
		console.log('users ==== ', users.keys());
		io.sockets.emit('online', [...users.keys()]); // 服务端向所有客户端发送数据 io.sockets.emit
	});

	socket.on('sendMessage', (content) => {
		console.log(name + " send a message: " + content);
		const message = {
			time: Date.now(),
			sender: name,
			content: content
		};
		historys.push(message);
		socket.broadcast.emit('receiveMessage', message);// 服务端向所有其他客户端发送数据
	});

	socket.on('getHistory', (fn) => {
		fn(historys);
	});
});
```

#### `io`实例

主要代码分成两部分`io.use` 和`io.on`

服务端的`socket`是`io.use`或者`io.on`中调回函数中的一个参数，所以`socket.on`是写在`io.on(){}`函数里面的，注意！！！

#### 发送数据

`io.sockets.emit(eventName, data)`，`io.sockets.send(data)`

如代码中的`io.sockets.emit('online', [...users.keys()]);` ，即向所有已经建立连接的**客户端**发送数据

#### 广播

`socket.broadcast.emit`或者`socket.broadcast.emit`，向所有已建立连接的**其他客户端**发送数据**（注意和`io.sockets.emit`的区分！！！）**

#### 区分

在这个项目中，用户向房间发送消息之后，他自己的消息同时发到本地缓存和服务器，服务器无需再给该用户发送消息数据！所以用`socket.broadcast.emit`

### 客户端

#### 程序流程

登录，检查登录成功与否，获取历史消息

#### 主框架

```js
var socket; //开头先声明 socket 为全局变量
window.onload = function() {
	document.querySelector('#submit').addEventListener('click', ()=>{
		socket = io({
			query: {
			name: account,
			password: password
		},
		reconnection: false,
	});
	socket.on('connect', () => {
		socket.emit('getHistory', (data) => {});
	});
	socket.on('connect_error', (err) => {});
	socket.on('disconnect', () => {});
	socket.on('online', (users) => {}); // 监听服务端发来的数据
	socket.on('receiveMessage', (message) => {});
}
                                                       
document.querySelector('#sent_message').addEventListener('click', (e) => {
	socket.emit('sendMessage', text);
})；

```

#### 解析

在第一次用到`socket`的时候给变量赋值，下面的代码是在**登录(login)**的时候就用到了

**注意区分服务端和客户端中的 `socket`！！！**

```js
login.addEventListener('click', function(){
	var account = document.querySelectorAll('input')[0].value;
	var password = document.querySelectorAll('input')[1].value;
	socket = io({
		query: {
			name: account,
			password: password
		},
		reconnection: false,
	});
});
```

-   客户端的`socket.emit(eventName, data, [callback])`作用为给服务端发送数据，服务端通过`socket.on(eventName, (data, fn) => {})`创建监听数据事件，两者间通过`eventName`相互匹配。
-   `[callback]`为回调函数，用于指定一个当对方确定接收到数据时调用的回调函数。
-   另外一种监听事件`socket.once(eventName, (data, fn) => {})`，这个只监听一次，在回调函数执行完毕后，结束监听。

#### 一个很有意思的东西

```js
//客户端
socket.emit('sendMessage', text);
socket.emit('getHistory', (data) => {});

//服务端
socket.on('sendMessage', (content) => {
	console.log(name + " send a message: " + content);
});
socket.on('getHistory', (fn) => {
	fn(historys);
});
```

`sendMessage`中客户端发送了`text`，服务端中用回调函数中的`content`参数接收

而`getHsitory`中客户端发送了空内容，来请求数据，服务端用另外一个参数`fn`（应该是个函数），这个函数可以立即将数据发送回去，这个是不是有点类似 get 请求？

## 前端代码的一些tips

1.  HTML 结构语义化
2.  缩进长度两个空格？蚂蚁这位学长的代码风格非常满足我强迫症，~~然而这篇文章是用 typora写的，代码都是乱贴的，缩进很乱~~
3.  元素事件不要直接写在组件上，而是以`element.addEventListener('event', function(){})`形式写在 `js` 文件里面
4.  尽量不要使用双引号，用单引号？
5.  模板字符串

```javascript
let name = 'j10c';
console.log('im ' + name);
console.log(`im ${name}`);
```

6.  箭头函数

```javascript
socket.on('receiveMessage', (message) => {
	console.log('received a message broadcast message:', message);
	addMessage(message.sender, message.content);
});
  
// message 是函数的参数，该函数为socket.on(eventName, function(){})函数的一个参数
  
//等价于
socket.on('receiveMessage', function(message){
	// code here...
});
```

7.  如何使用好元素的 `classList`，看到 CSS 课上给元素添加 animation 淡入淡出的类标签的时候还挺震撼的，以前一直以为`class`和`id`本身就是用来区分唯一元素和泛用元素的标签，现在知道了还能把`class`看作一种单一的属性。

## 总结

主要还是学了socket.io相关知识，期待寒假的时候有机会再练习一遍。
