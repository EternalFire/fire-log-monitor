// FireLogger Worker Message
var FMsg = (function() {
  function getName(value) {
    for (var name in FMsg) {
      if (FMsg[name] == value) {
        return name;
      }
    }
    return null;
  }

  return {
    getName: getName,

    // SocketIO
    onMessage: 10000000, // receive SocketIO message

    // data module
    onAddData:       11000000,
    onClearData:     11000001,
    clearData:       11000002,
    getDataLength:   11000003,
    onGetDataLength: 11000004,

    // Worker
    workerReady: 12000000,


  };
})();