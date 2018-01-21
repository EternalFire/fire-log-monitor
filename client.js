'use strict';

const constants = require('./Constants')
const fs = require('fs')

const uri = constants.ADDRESS_FOR_CLIENT

const io = require('socket.io-client')
const socket = io(uri)

function handleSendFile(data) {
  console.log('handleSendFile: ')
  console.log(data)
  saveToFile('demo__omed.txt', data)
}

function saveToFile(name, data) {
  fs.writeFile(name, data, (err) => {
    if (err) {

      throw err;
    }

    console.log('File saved!')
  })
}

socket.on('connect', () => {

  console.log('client: ', socket.id, ' connected!');

  socket.on('message', (data)=>{
    console.log('message:', data);
  });

  setInterval(function(){
    var message = ` ${socket.id}, ` + (new Date()).toString();
    console.log(message);
    socket.emit('message', message.replace(',', '\n'));
    // socket.emit('commander', '#c|', 'get', message);
  }, 1000);

  // setInterval(function() {
  //   try {
  //     throw new Error("test client ERROR!!!")
  //   } catch(e) {
  //     socket.emit('message', e.stack);
  //   }
  // }.bind(this), 2000);

  // socket.on(constants.EVENT_SEND_FILE, handleSendFile)
  // socket.emit(constants.EVENT_REQUEST_FILE)

  // setTimeout(function () {
  //   socket.emit('closeServer');
  //   socket.disconnect(true);
  // }, 2000);


  // setTimeout(function() {
  //   let roomName = "r_1";

  //   socket.on("create room success", function(name) {
  //     console.log("client room: ", name);
  //     let roomSocket = io(uri + "/" + name);

  //     roomSocket.on("connect", function() {
  //       setInterval(function() {
  //         let message = new Date().toString();
  //         console.log(message);

  //         roomSocket.emit("message", message);
  //       }, 1000);
  //     });
  //   });

  //   socket.emit("create room", roomName);
  // }, 1000);

});

