/**
 * @usage
 *
 * in html:
 *
 * <script src="../firelogger/main.js"></script>
 *
 * in javascript:
 *
 * window.addEventListener("load", function() {
 *   FireLogger.init();
 * });
 */

var FireLogger = (function() {
  var dir = "firelogger/";

  return {
    _socketIOPath: null,
    _msgScriptPath:    dir + "message.js",
    _configScriptPath: dir + "config.js",
    _dataScriptPath:   dir + "data.js",
    _viewScriptPath:   dir + "view.js",
    _workerScriptPath: dir + "worker.js",

    _config: null,
    _data: null,
    _view: null,
    _worker: null,
    _socketIOReady: false,
    _msgDefinitionReady: false,

    displayInConsole: false,   // print to console
    displayInBody: true,      // print to body
    useWebWorker: true,

    init: function() {
      if (this.useWebWorker) {
        if (window.Worker) {
          this.initWithWorker();
          return;
        }
      }

      this.initNormal();
    },

    waitDependenceComplete: function(onComplete) {
      var self = this;

      var intervalHandle = setInterval(function()
      {
        var _view = self._view;
        var _data = self._data;

        var isViewReady = !!_view;
        var isDataReady = !!_data;
        var isIOReady = !!self._socketIOReady;
        var isMsgReady = !!self._msgDefinitionReady;

        if (!isViewReady || !isDataReady || !isIOReady || !isMsgReady)
        {
          if (!isViewReady) {
            console.log("view is not ready!");
          }
          if (!isDataReady) {
            console.log("data is not ready!");
          }
          if (!isIOReady) {
            console.log("io is not ready!");
          }
          return;
        }

        clearInterval(intervalHandle);
        console.log("load complete");

        onComplete ? onComplete() : null;
      }, 600);
    },

    waitComplete: function(property, onComplete) {
      var self = this;
      var intervalHandle = setInterval(function()
      {
        var isReady = !!self[property];

        if (!isReady) {
          console.log(property + " is not ready!");
          return;
        }

        clearInterval(intervalHandle);
        console.log(property + " ready! ");

        onComplete ? onComplete() : null;
      }, 600);
    },

    getMsgScript: function() {
      var self = this;
      self.createScript(self._msgScriptPath, function() {
        self._msgDefinitionReady = true;
      });
    },
    getConfigScript: function() {
      var self = this;
      self.createScript(self._configScriptPath, function() {
        self._config = FireLoggerConfig;
      });
    },
    getViewScript: function() {
      var self = this;
      self.createScript(self._viewScriptPath, function() {
        self._view = FireLoggerView;
      });
    },
    getDataScript: function() {
      var self = this;
      self.createScript(self._dataScriptPath, function() {
        self._data = FireLoggerData;
      });
    },
    getSocketIOScript: function() {
      var self = this;
      self.createScript(self._socketIOPath, function() {
        self._socketIOReady = true;
      });
    },

    initNormal: function() {
      var self = this;
      // TODO: use loader module
      self.getMsgScript();
      self.getConfigScript();

      self.waitComplete("_config", function() {
        self._socketIOPath = FireLoggerConfig.socketIOScript;

        self.getSocketIOScript();
        self.getViewScript();
        self.getDataScript();

        self.waitDependenceComplete(function() {
          var _view = self._view;
          var _data = self._data;

          _view.init();

          var uri = self._config.logServer;
          _data.init(uri);

          _data.onAddData = function(data) {
            self.handleWorkerMessage(FMsg.onAddData, data);
          };

          _data.onClearData = function() {
            self.handleWorkerMessage(FMsg.onClearData);
          };
        });
      });
    },

    initWithWorker: function() {
      var self = this;
      self.getMsgScript();
      self.getViewScript();

      self.waitComplete("_view", function() {
        self._view.init();
        self.initWorker();
      });
    },

    initWorker: function() {
      var self = this;
      self._worker = new Worker(self._workerScriptPath);

      self._worker.onmessage = function(event) {
        var eventData = event.data;
        var name = eventData.name;
        var data = eventData.data;
        self.handleWorkerMessage(name, data);
      };
    },

    deleteWorker: function() {
      // TODO
    },

    createScript: function(src, onload) {
      var script = document.createElement("script");
      script.src = src;
      script.onload = onload;
      document.body.appendChild(script);
      return script;
    },

    printToConsole: function(data) {
      if(!this.displayInConsole) return;
      console.log(data);
    },

    handleWorkerMessage: function(name, data) {
      var self = this;

      if (name == FMsg.onAddData) {
        self._view.addToNodeList(data);
        self.printToConsole(data);
        return true;
      }

      if (name == FMsg.onClearData) {
        self._view.clearNodeList();
        return true;
      }

      if (name == FMsg.workerReady) {
        console.log("worker ready!!! main ");
        return true;
      }

      if (name == FMsg.onGetDataLength) {
        self._view.dataLength = data;
        // printToConsole("self._view.dataLength: " + self._view.dataLength);
        return true;
      }

      if (name == FMsg.onCreateRoom) {
        self._view.createRoomButton(data);
        return true;
      }

      console.log("Not handle this message ", name);
      return false;
    },

    post: function(name, data) {
      var self = this;
      self._worker.postMessage({ name: name, data: data });
    },

    /**
     * @property cls command: clear document.body, if this.displayInBody is true
     */
    get cls() {
      this.handleWorkerMessage(FMsg.onClearData);
    },
    set cls(value) {},

    get clearData() {
      if (this.useWebWorker) {
        this.post(FMsg.clearData);
      } else {
        this._data.clear();
      }
    },
    set clearData(value) {},

    get dataLength() {
      if (this.useWebWorker) {
        this.post(FMsg.getDataLength);
      } else {
        this.handleWorkerMessage(FMsg.onGetDataLength, this._data.currentLength());
      }
    },

    setCurrentRoom: function(roomName) {
      if (this.useWebWorker) {
        this.post(FMsg.setRoomName, roomName);
      } else {
        // todo
      }
    },
  };
})();
