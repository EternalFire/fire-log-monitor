var FireLoggerView = (function() {

  var _isBottom = function() {
    var threshold = 5.0;
    var isBottom = Math.abs((document.documentElement.scrollHeight - document.documentElement.clientHeight) - document.documentElement.scrollTop) < threshold;
    return isBottom;
  };

  var _scrollToBottom = function() {
    window.scrollTo(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
  };

  var _currentTime = function() {
    return new Date().getTime();
  };

  return {
    _nodeList: null,
    _statusLabelList: null,

    dataLength: -1,

    init: function() {
      this._nodeList = [];
      this._statusLabelList = [];

      this.initToolbar();
      this.tick();
    },

    initToolbar: function() {
      var self = this;
      var div = document.createElement("div");
      document.body.appendChild(div);

      div.classList = "toolbar";

      this.createButton(div, "clear screen", function() {
        FireLogger.cls;
      });
      this.createButton(div, "clear data", function() {
        FireLogger.clearData;
      });

      div.appendChild(document.createElement("hr"));

      this.createStatus("label", div, "0",
        function checkLength(statusObject) {
          FireLogger.dataLength;

          var last = statusObject.last;
          return last != self.dataLength;
        },
        function updateLength(statusObject) {
          // update
          var label = statusObject.ui;
          label.textContent = "Lines " + self.dataLength + "";
          return self.dataLength;
        }
      );

    },

    createButton: function(parent, text, onclick) {
      var btn = document.createElement("button");
      parent.appendChild(btn);

      btn.textContent = text;
      btn.onclick = onclick;

      return btn;
    },

    createStatus: function(type, parent, text, check, update) {
      var ui;

      if (type == "label") {
        ui = this.createLabel(parent, text);
      }

      if (ui) {
        ui.classList = "status";

        // status structure
        this._statusLabelList.push({
          ui: ui,
          last: text,
          check: check,
          update: update,
          updateTime: _currentTime()
        });
      }
    },

    createLabel: function(parent, text) {
      var label = document.createElement("label");
      parent.appendChild(label);

      label.textContent = text;
      return label;
    },

    createNode: function(data, index) {
      var dataContainer = document.createElement("div");
      dataContainer.classList = "logContainer";

      var lineNode = document.createElement("span");
      lineNode.classList = "noselect logLine";
      lineNode.textContent =  (index + 1) + "";
      dataContainer.appendChild(lineNode);

      var node = document.createElement("pre");
      node.textContent = data;
      node.classList = "logcontent";
      dataContainer.appendChild(node);

      return dataContainer;
    },

    clearNodeList: function() {
      if (!this._nodeList) return;

      this._nodeList.forEach(function(element) {
        element.remove();
      });

      this._nodeList = [];
    },

    addToNodeList: function(data) {
      var text = data;
      var isBottom = _isBottom();

      // text.split("\n").forEach(function(element){
      //   var node = this.createNode(element);
      //   document.body.appendChild(node);

      //   this._nodeList.push(node);
      // }.bind(this));

      var node = this.createNode(text, this._nodeList.length);
      document.body.appendChild(node);

      this._nodeList.push(node);

      if (isBottom) {
        _scrollToBottom();
      }
    },

    tick: function() {
      var index = 0;
      var delay = 200;

      setInterval(function(self) {
        var i = Math.min(index, self._statusLabelList.length - 1);
        i = Math.max(i, 0);
        index = i;

        var currentTime = _currentTime(); // milliseconds

        try {
          var statusObject = self._statusLabelList[i];

          if (statusObject.updateTime && currentTime - statusObject.updateTime >= delay * 1.5)
          {
            var ret = statusObject.check(statusObject);
            if (ret) {
              var current = statusObject.update(statusObject);
              statusObject.last = current;
              statusObject.updateTime = currentTime;
            }
          }
          else if (!statusObject.updateTime)
          {
            statusObject.updateTime = currentTime;
          }

        } catch(e) {
          console.log(e);
        }

        index++;
      }, delay, this);
    },
  };
})();