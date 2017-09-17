'use strict';

const os = require('os');
const fs = require('fs');
const dns = require('dns');
const constants = require('./Constants');

let log = console.log;
let localAddress = "";

function main() {

  dns.lookup(os.hostname(), (err, address, family) => {
    console.log('IP 地址: %j 地址族: IPv%s', address, family);
    localAddress = address;

    useIO();
    useHttpServer();
  });
}


// http server
function useHttpServer() {
  const express = require('express');
  const app = express();
  const server = require('http').createServer(app);
  const port = 3030;

  server.listen(port, function () {
    var object = server.address();
    // console.log(os.networkInterfaces());
    // console.log(os.hostname());
    // console.log(server.localAddress);

    console.log('Http Server listening at %s:%s', localAddress, object.port);
  });

  // Routing
  app.use(express.static(__dirname));
  app.use("/", function(req, res) {
    res.sendFile(__dirname + "/simple-monitor/index.html");
  });
}


// 定义客户
let clients = {}
function clientsLength() {
  return Object.keys(clients).length
}

function addClient(id) {
  clients[id] = {}
}

function delClient(id) {
  delete clients[id];
}


// 事件处理函数
function handleRequestFile(socket, path) {  
  fs.readFile('demo.txt', 'utf8', function (err, data) {
    if (err) {
      return console.error(err)
    }
    else {
      socket.emit(constants.EVENT_SEND_FILE, data)
    }
  });
}

function handleError(error) {    
  console.log('handleError: ');
  console.log(error);
}

// 连接成功后调用
function handleConnect(socket) {
  console.log('connected! ');

  let socketID = socket.id;

  addClient(socketID);

  let welcomeMessage = '[Welcome ' + socketID +' !!] Num: (' + clientsLength() + ')';
  socket.send(welcomeMessage);
}

// 广播消息
function broadcastMessage(socket, message, toSender) {  
  if (toSender) {
    socket.emit('message', message);
  }
  socket.broadcast.emit('message', message);
}


function useIO() {
  var io = require('socket.io').listen(constants.SERVER_PORT);
  io.on('connection', function (socket) {
    
    handleConnect(socket)
    
    let socketID = socket.id;
    let lastData;

    socket.on('message', function(data) {
      // socket.emit('message', 'echo ' + arguments[0])
      // socket.broadcast.emit('message', 'echo: ' + arguments[0])
      

      // if (lastData == data) return;
      // lastData = data;

      // console.log(data);
      broadcastMessage(socket, data, false);      
    })

    socket.on('disconnect', function() {            
      delClient(socketID)
      // let message = 'client socketID=[' + socketID + '] disconnect!! Num: (' + clientsLength() + ')'
      let message = 'client socketID=[' + socketID + '] disconnect! ';

      broadcastMessage(socket, message, false)

      console.log(message)
    })

    socket.on('error', handleError)    

    socket.on(constants.EVENT_REQUEST_FILE, function(){
      handleRequestFile(socket, 'demo.txt')
    })
  })

  log('server ready!')
}



//
// 
main();