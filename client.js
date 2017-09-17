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
    var message = ` ${socket.id} ` + (new Date()).toString();
    console.log(message);
    socket.emit('message', message);
  },200);

  // socket.on(constants.EVENT_SEND_FILE, handleSendFile)

  // socket.emit(constants.EVENT_REQUEST_FILE)
  // 
  
  // setTimeout(function () {
  //   socket.emit('closeServer');
  //   socket.disconnect(true);
  // }, 2000);

});

