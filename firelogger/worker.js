// use web worker
if (typeof DedicatedWorkerGlobalScope != "undefined")
{
  var _data;

  function tryImportScript(src) {
    try {
      importScripts(src);
    } catch(e) {
      console.log(e);
    }
  }

  /**
   * send message to main process
   * @return {String, Any} message name, message data
   */
  function post(name, data) {
    var eventData = { name: name, data: data };
    postMessage(eventData); // communicate to main process
  }

  function handleMainMessage(name, data) {
    if (name == FMsg.clearData) {
      _data.clear();
      return true;
    }

    if (name == FMsg.getDataLength) {
      post(FMsg.onGetDataLength, _data.currentLength());
      return true;
    }

    return false;
  }

  function main()
  {
    tryImportScript("message.js");
    tryImportScript("config.js");
    tryImportScript(FireLoggerConfig.socketIOScript);
    tryImportScript("data.js");

    // init data module
    _data = FireLoggerData;
    _data.init(FireLoggerConfig.logServer);

    _data.onMessage = function(data) {
      post(FMsg.onMessage, data);
    };

    _data.onAddData = function(data) {
      post(FMsg.onAddData, data);
    };

    _data.onClearData = function() {
      post(FMsg.onClearData);
    };

    post(FMsg.workerReady);
  }

  /**
   * receive message from main process
   * @param  {Any} event
   */
  onmessage = function(event) {
    var eventData = event.data;
    var name = eventData.name;
    var data = eventData.data;
    handleMainMessage(name, data);
  };

  main();
}
