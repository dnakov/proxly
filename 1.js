(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var getGlobal = function() {
    var _getGlobal = function() { return this }
    return _getGlobal()
}
root = getGlobal()


root.chrome = {
    mock: {
        value: {},
        getBytesInUse: 0
    },
    runtime: {
        lastError: undefined,
        getBackgroundPage: function(callback) {
            callback({})
        }
    }
}

root.chrome.mock.updateBytesInUse = function() {
    var bytes = 0
    for (var idx in root.chrome.mock.value) {
        bytes += 1
    }
    root.chrome.mock.getBytesInUse = bytes
}

root.chrome.storage = {
    local: {
        get: function(key, callback) {
            if (key === null) {
                callback(root.chrome.mock.value)
            } else {
                callback(root.chrome.mock.value[key])
            }
        },
        getBytesInUse: function(obj, callback) {
            root.chrome.mock.updateBytesInUse()
            callback(root.chrome.mock.getBytesInUse)
        },
        set: function(obj, callback) {
            for (var idx in obj) root.chrome.mock.value[idx] = obj[idx]

            callback()
        },
        remove: function(key, callback) {
            delete root.chrome.mock.value.key
            callback()
        },
        clear: function(callback) {
            root.chrome.mock.value = {}
            callback()
        }
    }
}

root.chrome.storage.sync = root.chrome.storage.local

},{}],2:[function(require,module,exports){
var Library,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

require('./chrome-mock');

Library = (function() {
  var APP_ID, Application, EXTENSION_ID, EXT_ID, LISTEN, Mapping, ResourceList, SELF_ID, Storage;

  function Library() {}

  APP_ID = 'chpffdckkhhppmgclfbompfgkghpmgpg';

  EXTENSION_ID = 'aajhphjjbcnnkgnhlblniaoejpcnjdpf';

  SELF_ID = chrome.runtime.id;

  EXT_ID = APP_ID === SELF_ID ? EXTENSION_ID : APP_ID;

  Library.prototype.MSG = function(message, ext) {
    return chrome.runtime.sendMessage(message, ext);
  };

  Library.prototype.MSGEXT = function(message) {
    return MSG(message, EXT_ID);
  };

  Library.prototype.LISTEN = LISTEN = (function() {
    var Listener, external, local;

    function LISTEN() {}

    local = null;

    external = null;

    LISTEN.FOR = function(message, callback) {
      return (local != null ? local : local = new Listener(false)).addListener({
        message: callback
      });
    };

    LISTEN.FOREXT = function(message, callback) {
      return (external != null ? external : external = new Listener(true)).addListener({
        message: callback
      });
    };

    Listener = (function() {
      Listener.prototype.listeners = {};

      Listener.prototype.external = false;

      Listener.prototype.api = chrome.runtime.onMessage;

      function Listener(external) {
        this.external = external;
        this.api = this.external ? chrome.runtime.onMessageExternal : this.api;
        this.api.addListener(this.onMessage);
      }

      Listener.prototype.addListener = function(message, callback) {
        return listeners[message] = callback;
      };

      Listener.prototype.onMessage = function(request, sender, sendResponse) {
        var key, _results;
        if (this.external && sender.id !== EXT_ID) {
          return void 0;
        } else {
          _results = [];
          for (key in request) {
            _results.push((function(key) {
              return listeners[key](request.key);
            })(key));
          }
          return _results;
        }
      };

      return Listener;

    })();

    return LISTEN;

  })();

  Library.prototype.Storage = Storage = (function() {
    function Storage() {}

    Storage.prototype.api = chrome.storage.local;

    Storage.save = function(key, item) {
      return api.set({
        key: item
      });
    };

    Storage.retrieve = function(key) {
      var promise;
      promise = new Promise(function(resolve, reject) {
        this.api.get(key, function(results) {
          return resolve(results);
        });
        return function(error) {
          return reject(error);
        };
      });
      return promise.then(function(results) {
        return results;
      });
    };

    Storage.onChanged = function(key, callback) {
      return chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (changes[key] != null) {
          return callback(changes[key].newValue);
        }
      });
    };

    return Storage;

  })();

  Library.prototype.Mapping = Mapping = (function() {
    Mapping.prototype.host = '';

    Mapping.prototype.url = '';

    Mapping.prototype.local = '';

    function Mapping(host, url, local) {
      this.host = host || this.host;
      this.url = url || this.url;
      this.local = local || this.local;
    }

    Mapping.prototype.setRedirectDeclarative = function(tabId) {
      var rules;
      rules = [].push({
        priority: 100,
        conditions: [
          new chrome.declarativeWebRequest.RequestMatcher({
            url: {
              urlMatches: this.local
            }
          })
        ],
        actions: [
          new chrome.declarativeWebRequest.RedirectRequest({
            redirectUrl: this.local
          })
        ]
      });
      return chrome.declarativeWebRequest.onRequest.addRules(rules);
    };

    return Mapping;

  })();

  Library.prototype.ResourceList = ResourceList = (function() {
    var getResources;

    ResourceList.prototype.selector = 'script[src],link[href]';

    ResourceList.prototype.resources = [];

    function ResourceList(selector) {
      this.selector = selector || this.selector;
      this.getResources();
    }

    getResources = function() {
      return this.resources = [].map.call(document.querySelectorAll(this.selector), function(e) {
        var _ref, _ref1;
        return {
          url: e.href != null ? e.href : e.src,
          path: ((_ref = e.attributes['src']) != null ? _ref.value : void 0) != null ? e.attributes['src'].value : (_ref1 = e.attributes['href']) != null ? _ref1.value : void 0,
          href: e.href,
          src: e.src,
          type: e.type,
          tagName: e.tagName
        };
      }).filter(function(e) {
        if (e.url.match('^(https?)|(chrome-extension)|(file):\/\/.*') != null) {
          return true;
        } else {
          return false;
        }
      });
    };

    return ResourceList;

  })();

  Library.prototype.Application = Application = (function() {
    function Application(extMsgId) {
      this.setRedirect = __bind(this.setRedirect, this);
      this.openApp = __bind(this.openApp, this);
      this.startServer = __bind(this.startServer, this);
      this.init = __bind(this.init, this);
      this.directories = [];
      this.appWindow;
      this.port = 31337;
      this.init();
    }

    Application.prototype.init = function() {
      Storage.onChanged('resourceMap', function(obj) {
        return MSG_EXT(obj);
      });
      return LISTEN.EXT('resources', function(result) {
        Storage.save('resources', result);
        return this.openApp();
      });
    };

    Application.prototype.startServer = function() {
      this.server = new TcpServer('127.0.0.1', this.port);
      return this.server.listen;
    };

    Application.prototype.openApp = function() {
      return chrome.app.window.create('index.html', {
        id: "mainwin",
        bounds: {
          width: 500,
          height: 800
        }
      }, (function(_this) {
        return function(win) {
          return _this.appWindow = win;
        };
      })(this));
    };

    Application.prototype.setRedirect = function() {
      return void 0;
    };

    return Application;

  })();

  return Library;

})();

module.exports = new Library;


/*
 var extMsgId = 'pmgnnbdfmmpdkgaamkdiipfgjbpgiofc';
  var addDirectory = function() {
    chrome.app.window.create('index.html', {
        id: "mainwin",
        bounds: {
          width: 50,
          height: 50
        },
    }, function(win) {
        mainWin = win;
    });
  }



    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          // if (sender.id != extMsgId)
          //   return sendResponse({"result":"sorry, could not process your message"});

          if (request.directoryEntryId) {
            // sendResponse({"result":"Got Directory"});
            console.log(request.directoryEntryId);
            directories.push(request.directoryEntryId);
            // chrome.fileSystem.restoreEntry(request.directoryEntryId, function(directoryEntry) {
            //     console.log(directoryEntry);
            // });

          } else {
            // sendResponse({"result":"Ops, I don't understand this message"});
          }
      });
          chrome.runtime.onMessageExternal.addListener(
        function(request, sender, sendResponse) {
          if (sender.id != extMsgId) {
            sendResponse({"result":"sorry, could not process your message"});
            return;  // don't allow this extension access
          } else if (request.openDirectory) {
            // sendResponse({"result":"Opening Directory"});
            addDirectory();
          } else {
            sendResponse({"result":"Ops, I don't understand this message"});
          }
      });

    socket.create("tcp", {}, function(_socketInfo) {
        socketInfo = _socketInfo;
        socket.listen(socketInfo.socketId, "127.0.0.1", 33333, 50, function(result) {
        console.log("LISTENING:", result);
        socket.accept(socketInfo.socketId, onAccept);
    });
    });

    var stopSocket = function() {
        socket.destroy(socketInfo.socketId);
    }
 */


/*
onload = function() {
  var start = document.getElementById("start");
  var stop = document.getElementById("stop");
  var hosts = document.getElementById("hosts");
  var port = document.getElementById("port");
  var directory = document.getElementById("directory");

  var socket = chrome.socket;
  var socketInfo;
  var filesMap = {};

  var rootDir;
  var port, extPort;
  var directories = [];

  var stringToUint8Array = function(string) {
    var buffer = new ArrayBuffer(string.length);
    var view = new Uint8Array(buffer);
    for(var i = 0; i < string.length; i++) {
      view[i] = string.charCodeAt(i);
    }
    return view;
  };

  var arrayBufferToString = function(buffer) {
    var str = '';
    var uArrayVal = new Uint8Array(buffer);
    for(var s = 0; s < uArrayVal.length; s++) {
      str += String.fromCharCode(uArrayVal[s]);
    }
    return str;
  };

  var logToScreen = function(log) {
    logger.textContent += log + "\n";
  }

  var writeErrorResponse = function(socketId, errorCode, keepAlive) {
    var file = { size: 0 };
    console.info("writeErrorResponse:: begin... ");
    console.info("writeErrorResponse:: file = " + file);
    var contentType = "text/plain"; //(file.type === "") ? "text/plain" : file.type;
    var contentLength = file.size;
    var header = stringToUint8Array("HTTP/1.0 " + errorCode + " Not Found\nContent-length: " + file.size + "\nContent-type:" + contentType + ( keepAlive ? "\nConnection: keep-alive" : "") + "\n\n");
    console.info("writeErrorResponse:: Done setting header...");
    var outputBuffer = new ArrayBuffer(header.byteLength + file.size);
    var view = new Uint8Array(outputBuffer)
    view.set(header, 0);
    console.info("writeErrorResponse:: Done setting view...");
    socket.write(socketId, outputBuffer, function(writeInfo) {
      console.log("WRITE", writeInfo);
      if (keepAlive) {
        readFromSocket(socketId);
      } else {
        socket.destroy(socketId);
        socket.accept(socketInfo.socketId, onAccept);
      }
    });
    console.info("writeErrorResponse::filereader:: end onload...");

    console.info("writeErrorResponse:: end...");
  };

  var write200Response = function(socketId, file, keepAlive) {
    var contentType = (file.type === "") ? "text/plain" : file.type;
    var contentLength = file.size;
    var header = stringToUint8Array("HTTP/1.0 200 OK\nContent-length: " + file.size + "\nContent-type:" + contentType + ( keepAlive ? "\nConnection: keep-alive" : "") + "\n\n");
    var outputBuffer = new ArrayBuffer(header.byteLength + file.size);
    var view = new Uint8Array(outputBuffer)
    view.set(header, 0);

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
       view.set(new Uint8Array(e.target.result), header.byteLength);
       socket.write(socketId, outputBuffer, function(writeInfo) {
         console.log("WRITE", writeInfo);
         if (keepAlive) {
           readFromSocket(socketId);
         } else {
           socket.destroy(socketId);
           socket.accept(socketInfo.socketId, onAccept);
         }
      });
    };

    fileReader.readAsArrayBuffer(file);
  };

  var onAccept = function(acceptInfo) {
    console.log("ACCEPT", acceptInfo)
    readFromSocket(acceptInfo.socketId);
  };

  var readFromSocket = function(socketId) {
    //  Read in the data
    socket.read(socketId, function(readInfo) {
      console.log("READ", readInfo);
      // Parse the request.
      var data = arrayBufferToString(readInfo.data);
      if(data.indexOf("GET ") == 0) {
        var keepAlive = false;
        if (data.indexOf("Connection: keep-alive") != -1) {
          keepAlive = true;
        }

        // we can only deal with GET requests
        var uriEnd =  data.indexOf(" ", 4);
        if(uriEnd < 0) {   return; }
        var uri = data.substring(4, uriEnd);
        // strip qyery string
        var q = uri.indexOf("?");
        if (q != -1) {
          uri = uri.substring(0, q);
        }

        chrome.fileSystem.restoreEntry(directories[0])
        .then(
            (function(url) {
                return function(directoryEntry) {
                    console.log(directoryEntry);
                    console.log(uri);
                    directoryEntry.getFile('myNewAppDEV.resource/index.js', {})
                    .then(function(file) {
                        console.log(file);
                        write200Response(socketId, file, keepAlive);
                    },function(e) {
                        console.log(e);
                    });

                }
             })(uri)
        );

        // var file =
        // if(!!file == false) {
        //   console.warn("File does not exist..." + uri);
        //   writeErrorResponse(socketId, 404, keepAlive);
        //   return;
        // }
        // logToScreen("GET 200 " + uri);
        // write200Response(socketId, file, keepAlive);
      // }
      // else {
        // Throw an error
        // socket.destroy(socketId);
      // }

  };
});
}


  var extMsgId = 'pmgnnbdfmmpdkgaamkdiipfgjbpgiofc';


    chrome.runtime.onMessageExternal.addListener(
        function(request, sender, sendResponse) {
          if (sender.id != extMsgId) {
            sendResponse({"result":"sorry, could not process your message"});
            return;  // don't allow this extension access
          } else if (request.openDirectory) {
            // sendResponse({"result":"Opening Directory"});
            addDirectory();
          } else {
            sendResponse({"result":"Ops, I don't understand this message"});
          }
      });


    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          // if (sender.id != extMsgId)
          //   return sendResponse({"result":"sorry, could not process your message"});

          if (request.directoryEntryId) {
            // sendResponse({"result":"Got Directory"});
            console.log(request.directoryEntryId);
            directories.push(request.directoryEntryId);
            // chrome.fileSystem.restoreEntry(request.directoryEntryId, function(directoryEntry) {
            //     console.log(directoryEntry);
            // });

          } else {
            // sendResponse({"result":"Ops, I don't understand this message"});
          }
      });
    socket.create("tcp", {}, function(_socketInfo) {
        socketInfo = _socketInfo;
        socket.listen(socketInfo.socketId, "127.0.0.1", 33333, 50, function(result) {
        console.log("LISTENING:", result);
        socket.accept(socketInfo.socketId, onAccept);
    });
    });

    var stopSocket = function() {
        socket.destroy(socketInfo.socketId);
    }

  var addDirectory = function() {
    chrome.app.window.create('index.html', {
        id: "mainwin",
        bounds: {
          width: 50,
          height: 50
        },
    }, function(win) {
        mainWin = win;
    });
  }

};
 */


},{"./chrome-mock":1}],3:[function(require,module,exports){
require('./common.coffee');

},{"./common.coffee":2}]},{},[3])
