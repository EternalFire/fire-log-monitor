var FireLoggerData = (function() {
  return {
    _socket: null,
    _room: null,
    _uri: "", // socket.io server address

    _array: [],
    _lastData: null,
    _dataNum: 100000 * 3,    // max length of _array
    currentRoom: null,

    onMessage: null,         // will call when receive message
    onAddData: null,         // will call when data push in _array
    onClearData: null,       // will call when data remove from _array
    onCreateRoom: null,

    init: function(uri) {
      this.connect(uri);
      this.initSocketHandler(this._socket);
      this.test();
    },

    /**
     * @function connect
     * @param  {String} uri log server address
     */
    connect: function(uri) {
      var address = uri || this._uri;
      this._uri = uri;

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

      socket.on("connect", function() {
        socket.on("message", function(data) {
          self.handleMessage(data);
        });

        // self namespace socket
        self._room = io(`${self._uri}/${socket.id}`);
        self._room.on("private message", function(socketID, data) {
          console.log('private message: ', socketID, data);
          self.handleMessage(data);
        });

        // room
        socket.on("create room success", function(roomName) {
          if (!roomName || roomName.length < 1) {
            console.log("the roomName is ", roomName);
            return;
          }

          console.log("create room success  roomName: ", roomName);

          self.onCreateRoom && self.onCreateRoom(roomName);

          var roomSocket = io(`${self._uri}/${roomName}`);
          roomSocket.on("message", function(data) {
            self.handleRoomMessage(roomName, data);
          })
        });
      });
    },

    handleMessage: function(data) {
      this.onMessage && this.onMessage(data);
      this.add(data);
    },

    handleRoomMessage: function(roomName, data) {
      if (this.currentRoom == roomName) {
        this.onMessage && this.onMessage(data);
        this.add(data);
      }
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

    test: function() {
      var self = this;
      var cases = [];
      var addCase = function(name, callback, option) {
        var caseObject = {name, callback, option};
        cases.push(caseObject);
      }
      var runCase = function() {
        cases.forEach(function(caseObject, i) {
          var option = caseObject.option;

          if (option) {
            if (option.isRun == false) {
              return;
            }
          }

          console.log("run case: ", caseObject.name);
          caseObject.callback();
        });
      }

      function case_auto_send(socket) {
        setInterval(function() {
          var _socket;
          var message = new Date().toString();

          if (typeof socket == "function") {
            _socket = socket();
          } else {
            _socket = _socket;
          }

          console.log("send ", message);
          _socket.emit("private message", _socket.id, message);
        }, 1000);
      }

      addCase("auto_send", case_auto_send.bind(self, function() {return self._room}), { isRun: false });

      console.log("test", self._room);

      runCase();
    }
  };
})();