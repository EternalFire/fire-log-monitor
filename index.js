'use strict';

module.exports = main;

const os = require('os');
const fs = require('fs');
const dns = require('dns');
const constants = require('./Constants');

let localAddress = "";

// client records
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


function main() {
  dns.lookup(os.hostname(), (err, address, family) => {
    console.log('IP address: %j family: IPv%s', address, family);
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
    res.sendFile(__dirname + '/simple-monitor/index.html');
  });
}


function useIO() {
  var io = require('socket.io').listen(constants.SERVER_PORT);
  io.on('connection', function (socket) {

    handleConnect(socket)

    let socketID = socket.id;
    let lastData;

    socket.on('message', function(data) {

      // if (lastData == data) return;
      // lastData = data;

      // console.log(data);
      broadcastMessage(socket, data, false);
    })

    socket.on('disconnect', function() {
      delClient(socketID)

      let message = 'client socketID=[' + socketID + '] disconnect!! Num: (' + clientsLength() + ')'
      // let message = 'client socketID=[' + socketID + '] disconnect! ';
      broadcastMessage(socket, message, false)

      console.log(message)
    })

    socket.on('error', handleError)

    socket.on(constants.EVENT_REQUEST_FILE, function(){
      handleRequestFile(socket, 'demo.txt')
    })
  })

  console.log('log server ready!')
}


// handlers
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

function handleConnect(socket) {
  let socketID = socket.id;
  console.log(socketID + ' connected! ');

  addClient(socketID);

  let welcomeMessage = '[Welcome ' + socketID +' !!] Num: (' + clientsLength() + ')';
  // socket.send(welcomeMessage);
  broadcastMessage(socket, welcomeMessage, true);
}

/**
 * broadcast message
 * @param {Socket} socket
 * @param {String} message
 * @param {Boolean} toSender if true, broadcast to the sender
 */
function broadcastMessage(socket, message, toSender) {
  if (toSender) {
    socket.emit('message', message);
  }
  socket.broadcast.emit('message', message);
}
