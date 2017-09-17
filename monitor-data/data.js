var logData = (function() {

return {
  _socket: null,
  _uri: "ws://192.168.31.183:3000", // socket.io server address
  _array: [],
  _lastData: null,
  _dataNum: 100000 * 3,    // max length of _array
  _nodeList: null,

  displayInConsole: true,  // print to console 
  displayInBody: true,     // print to body
  
  onMessage: null,         // will call when receive message
  onAddData: null,         // will call when data push in _array
  onClearData: null,       // will call when data remove from _array

  init: function() {
    this.connect();  
    this.initSocketHandler(this._socket);
  },

  connect: function(uri) {
    var address = uri || this._uri;
    if (this._socket) {
      this._socket.disconnect(true);
      this._socket = null;
    }

    var socket = io(address);
    this._socket = socket;
  },

  initSocketHandler: function(socket) {
    if (!socket) return;

    var self = this;

    socket.on("message", function(data) {
      if (self.onMessage) self.onMessage(data);

      self.add(data);
      self.printToConsole(data);
      self.printToBody(data);
    });
  },

  /**
   * Add data to this._array
   * @param {String} data message from socket.io server
   */
  add: function(data) {
    if (this.currentLength() >= this._dataNum) {
      this.clear();
    }

    if (this._lastData == data) return;
    this._lastData = data;

    var len = this._array.push(data);

    if (this.onAddData) this.onAddData(data);

    return len;
  },

  clear: function() {
    this._array = [];

    if (this.onClearData) this.onClearData();
  },

  currentLength: function() {
    return this._array.length;
  },

  getDataArray: function() {
    return this._array;
  },


  printToConsole: function(data) {
    if (!this.displayInConsole) return;
    
    console.log(data);
  },


  printToBody: function(data) {
    if (!this.displayInBody) return;

    var node = document.createElement("p");

    this._nodeList = this._nodeList || [];
    this._nodeList.push(node);

    node.innerHTML = data;
    
    node.style.marginTop = "0";
    node.style.marginBottom = "5px";

    document.body.appendChild(node);    
  },

  clearNodeList: function() {
    if (!this._nodeList) return;

    this._nodeList.forEach(function(element) {
      element.remove();
    });
  },
};  
})();
