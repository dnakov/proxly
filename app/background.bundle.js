(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('../../common.coffee');


/*
 var whitelistedId = 'pmgnnbdfmmpdkgaamkdiipfgjbpgiofc';
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
          // if (sender.id != whitelistedId)
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
          if (sender.id != whitelistedId) {
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


  var whitelistedId = 'pmgnnbdfmmpdkgaamkdiipfgjbpgiofc';


    chrome.runtime.onMessageExternal.addListener(
        function(request, sender, sendResponse) {
          if (sender.id != whitelistedId) {
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
          // if (sender.id != whitelistedId)
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


},{"../../common.coffee":3}],2:[function(require,module,exports){

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

},{}],3:[function(require,module,exports){
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
    var api;

    function Storage() {}

    api = chrome.storage.local;

    Storage.save = function(key, item) {
      var obj;
      obj = {};
      obj[key] = item;
      return api.set(obj);
    };

    Storage.retrieve = function(key) {
      var promise;
      promise = new Promise(function(resolve, reject) {
        api.get(key, function(results) {
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


},{"./chrome-mock":2}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbmllbC9Ecm9wYm94IChTaWx2ZXJsaW5lKS9kZXYvcmVzZWFyY2gvcmVkaXJlY3Rvci9hcHAvc3JjL2JhY2tncm91bmQuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecm9wYm94IChTaWx2ZXJsaW5lKS9kZXYvcmVzZWFyY2gvcmVkaXJlY3Rvci9jaHJvbWUtbW9jay5qcyIsIi9Vc2Vycy9kYW5pZWwvRHJvcGJveCAoU2lsdmVybGluZSkvZGV2L3Jlc2VhcmNoL3JlZGlyZWN0b3IvY29tbW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0NBLE9BQUEsQ0FBUSxxQkFBUixDQUFBLENBQUE7O0FBR0E7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBSEE7O0FBZ0VBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaEVBOzs7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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ekIsRUFDSTtBQUFBLFFBQUEsRUFBQSxFQUFJLFNBQUo7QUFBQSxRQUNBLE1BQUEsRUFDSTtBQUFBLFVBQUEsS0FBQSxFQUFNLEdBQU47QUFBQSxVQUNBLE1BQUEsRUFBTyxHQURQO1NBRko7T0FESixFQUtBLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEdBQUQsR0FBQTtpQkFDSSxLQUFDLENBQUEsU0FBRCxHQUFhLElBRGpCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMQSxFQURLO0lBQUEsQ0FwQlQsQ0FBQTs7QUFBQSwwQkE2QkEsV0FBQSxHQUFhLFNBQUEsR0FBQTthQUNULE9BRFM7SUFBQSxDQTdCYixDQUFBOzt1QkFBQTs7TUE1RkosQ0FBQTs7aUJBQUE7O0lBRkYsQ0FBQTs7QUFBQSxNQThITSxDQUFDLE9BQVAsR0FBaUIsR0FBQSxDQUFBLE9BOUhqQixDQUFBOztBQXdKQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F4SkE7O0FBcU5BO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBck5BIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIHNlcnZlciA9IHJlcXVpcmUgJy4vdGNwLXNlcnZlci5qcydcbnJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5cblxuIyMjXG4gdmFyIHdoaXRlbGlzdGVkSWQgPSAncG1nbm5iZGZtbXBka2dhYW1rZGlpcGZnamJwZ2lvZmMnO1xuICB2YXIgYWRkRGlyZWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJywge1xuICAgICAgICBpZDogXCJtYWlud2luXCIsXG4gICAgICAgIGJvdW5kczoge1xuICAgICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgICBoZWlnaHQ6IDUwXG4gICAgICAgIH0sXG4gICAgfSwgZnVuY3Rpb24od2luKSB7XG4gICAgICAgIG1haW5XaW4gPSB3aW47XG4gICAgfSk7XG4gIH1cblxuXG5cbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgLy8gaWYgKHNlbmRlci5pZCAhPSB3aGl0ZWxpc3RlZElkKVxuICAgICAgICAgIC8vICAgcmV0dXJuIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiR290IERpcmVjdG9yeVwifSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgZGlyZWN0b3JpZXMucHVzaChyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgLy8gY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5KHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCwgZnVuY3Rpb24oZGlyZWN0b3J5RW50cnkpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIGlmIChzZW5kZXIuaWQgIT0gd2hpdGVsaXN0ZWRJZCkge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG4gICAgICAgICAgICByZXR1cm47ICAvLyBkb24ndCBhbGxvdyB0aGlzIGV4dGVuc2lvbiBhY2Nlc3NcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3BlbkRpcmVjdG9yeSkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BlbmluZyBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgYWRkRGlyZWN0b3J5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBzb2NrZXQuY3JlYXRlKFwidGNwXCIsIHt9LCBmdW5jdGlvbihfc29ja2V0SW5mbykge1xuICAgICAgICBzb2NrZXRJbmZvID0gX3NvY2tldEluZm87XG4gICAgICAgIHNvY2tldC5saXN0ZW4oc29ja2V0SW5mby5zb2NrZXRJZCwgXCIxMjcuMC4wLjFcIiwgMzMzMzMsIDUwLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJMSVNURU5JTkc6XCIsIHJlc3VsdCk7XG4gICAgICAgIHNvY2tldC5hY2NlcHQoc29ja2V0SW5mby5zb2NrZXRJZCwgb25BY2NlcHQpO1xuICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdmFyIHN0b3BTb2NrZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SW5mby5zb2NrZXRJZCk7XG4gICAgfVxuXG5cbiMjI1xuXG4jIyNcbm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3RhcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpO1xuICB2YXIgc3RvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcFwiKTtcbiAgdmFyIGhvc3RzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJob3N0c1wiKTtcbiAgdmFyIHBvcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBvcnRcIik7XG4gIHZhciBkaXJlY3RvcnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpcmVjdG9yeVwiKTtcblxuICB2YXIgc29ja2V0ID0gY2hyb21lLnNvY2tldDtcbiAgdmFyIHNvY2tldEluZm87XG4gIHZhciBmaWxlc01hcCA9IHt9O1xuXG4gIHZhciByb290RGlyO1xuICB2YXIgcG9ydCwgZXh0UG9ydDtcbiAgdmFyIGRpcmVjdG9yaWVzID0gW107XG5cbiAgdmFyIHN0cmluZ1RvVWludDhBcnJheSA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyaW5nLmxlbmd0aCk7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZpZXdbaV0gPSBzdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZpZXc7XG4gIH07XG5cbiAgdmFyIGFycmF5QnVmZmVyVG9TdHJpbmcgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICB2YXIgc3RyID0gJyc7XG4gICAgdmFyIHVBcnJheVZhbCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgZm9yKHZhciBzID0gMDsgcyA8IHVBcnJheVZhbC5sZW5ndGg7IHMrKykge1xuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodUFycmF5VmFsW3NdKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbiAgfTtcblxuICB2YXIgbG9nVG9TY3JlZW4gPSBmdW5jdGlvbihsb2cpIHtcbiAgICBsb2dnZXIudGV4dENvbnRlbnQgKz0gbG9nICsgXCJcXG5cIjtcbiAgfVxuXG4gIHZhciB3cml0ZUVycm9yUmVzcG9uc2UgPSBmdW5jdGlvbihzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIHtcbiAgICB2YXIgZmlsZSA9IHsgc2l6ZTogMCB9O1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IGJlZ2luLi4uIFwiKTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBmaWxlID0gXCIgKyBmaWxlKTtcbiAgICB2YXIgY29udGVudFR5cGUgPSBcInRleHQvcGxhaW5cIjsgLy8oZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIHZhciBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplO1xuICAgIHZhciBoZWFkZXIgPSBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCBcIiArIGVycm9yQ29kZSArIFwiIE5vdCBGb3VuZFxcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoIGtlZXBBbGl2ZSA/IFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIDogXCJcIikgKyBcIlxcblxcblwiKTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgaGVhZGVyLi4uXCIpO1xuICAgIHZhciBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpO1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0KGhlYWRlciwgMCk7XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIik7XG4gICAgc29ja2V0LndyaXRlKHNvY2tldElkLCBvdXRwdXRCdWZmZXIsIGZ1bmN0aW9uKHdyaXRlSW5mbykge1xuICAgICAgY29uc29sZS5sb2coXCJXUklURVwiLCB3cml0ZUluZm8pO1xuICAgICAgaWYgKGtlZXBBbGl2ZSkge1xuICAgICAgICByZWFkRnJvbVNvY2tldChzb2NrZXRJZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzb2NrZXQuZGVzdHJveShzb2NrZXRJZCk7XG4gICAgICAgIHNvY2tldC5hY2NlcHQoc29ja2V0SW5mby5zb2NrZXRJZCwgb25BY2NlcHQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6ZmlsZXJlYWRlcjo6IGVuZCBvbmxvYWQuLi5cIik7XG5cbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBlbmQuLi5cIik7XG4gIH07XG5cbiAgdmFyIHdyaXRlMjAwUmVzcG9uc2UgPSBmdW5jdGlvbihzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKSB7XG4gICAgdmFyIGNvbnRlbnRUeXBlID0gKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICB2YXIgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZTtcbiAgICB2YXIgaGVhZGVyID0gc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgMjAwIE9LXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgga2VlcEFsaXZlID8gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgOiBcIlwiKSArIFwiXFxuXFxuXCIpO1xuICAgIHZhciBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpO1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0KGhlYWRlciwgMCk7XG5cbiAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGgpO1xuICAgICAgIHNvY2tldC53cml0ZShzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCBmdW5jdGlvbih3cml0ZUluZm8pIHtcbiAgICAgICAgIGNvbnNvbGUubG9nKFwiV1JJVEVcIiwgd3JpdGVJbmZvKTtcbiAgICAgICAgIGlmIChrZWVwQWxpdmUpIHtcbiAgICAgICAgICAgcmVhZEZyb21Tb2NrZXQoc29ja2V0SWQpO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SWQpO1xuICAgICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmaWxlUmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGZpbGUpO1xuICB9O1xuXG4gIHZhciBvbkFjY2VwdCA9IGZ1bmN0aW9uKGFjY2VwdEluZm8pIHtcbiAgICBjb25zb2xlLmxvZyhcIkFDQ0VQVFwiLCBhY2NlcHRJbmZvKVxuICAgIHJlYWRGcm9tU29ja2V0KGFjY2VwdEluZm8uc29ja2V0SWQpO1xuICB9O1xuXG4gIHZhciByZWFkRnJvbVNvY2tldCA9IGZ1bmN0aW9uKHNvY2tldElkKSB7XG4gICAgLy8gIFJlYWQgaW4gdGhlIGRhdGFcbiAgICBzb2NrZXQucmVhZChzb2NrZXRJZCwgZnVuY3Rpb24ocmVhZEluZm8pIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiUkVBRFwiLCByZWFkSW5mbyk7XG4gICAgICAvLyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIHZhciBkYXRhID0gYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKTtcbiAgICAgIGlmKGRhdGEuaW5kZXhPZihcIkdFVCBcIikgPT0gMCkge1xuICAgICAgICB2YXIga2VlcEFsaXZlID0gZmFsc2U7XG4gICAgICAgIGlmIChkYXRhLmluZGV4T2YoXCJDb25uZWN0aW9uOiBrZWVwLWFsaXZlXCIpICE9IC0xKSB7XG4gICAgICAgICAga2VlcEFsaXZlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdlIGNhbiBvbmx5IGRlYWwgd2l0aCBHRVQgcmVxdWVzdHNcbiAgICAgICAgdmFyIHVyaUVuZCA9ICBkYXRhLmluZGV4T2YoXCIgXCIsIDQpO1xuICAgICAgICBpZih1cmlFbmQgPCAwKSB7ICAgcmV0dXJuOyB9XG4gICAgICAgIHZhciB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpO1xuICAgICAgICAvLyBzdHJpcCBxeWVyeSBzdHJpbmdcbiAgICAgICAgdmFyIHEgPSB1cmkuaW5kZXhPZihcIj9cIik7XG4gICAgICAgIGlmIChxICE9IC0xKSB7XG4gICAgICAgICAgdXJpID0gdXJpLnN1YnN0cmluZygwLCBxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeShkaXJlY3Rvcmllc1swXSlcbiAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAoZnVuY3Rpb24odXJsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRpcmVjdG9yeUVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRpcmVjdG9yeUVudHJ5KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXJpKTtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5RW50cnkuZ2V0RmlsZSgnbXlOZXdBcHBERVYucmVzb3VyY2UvaW5kZXguanMnLCB7fSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3cml0ZTIwMFJlc3BvbnNlKHNvY2tldElkLCBmaWxlLCBrZWVwQWxpdmUpO1xuICAgICAgICAgICAgICAgICAgICB9LGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9KSh1cmkpXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gdmFyIGZpbGUgPVxuICAgICAgICAvLyBpZighIWZpbGUgPT0gZmFsc2UpIHtcbiAgICAgICAgLy8gICBjb25zb2xlLndhcm4oXCJGaWxlIGRvZXMgbm90IGV4aXN0Li4uXCIgKyB1cmkpO1xuICAgICAgICAvLyAgIHdyaXRlRXJyb3JSZXNwb25zZShzb2NrZXRJZCwgNDA0LCBrZWVwQWxpdmUpO1xuICAgICAgICAvLyAgIHJldHVybjtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBsb2dUb1NjcmVlbihcIkdFVCAyMDAgXCIgKyB1cmkpO1xuICAgICAgICAvLyB3cml0ZTIwMFJlc3BvbnNlKHNvY2tldElkLCBmaWxlLCBrZWVwQWxpdmUpO1xuICAgICAgLy8gfVxuICAgICAgLy8gZWxzZSB7XG4gICAgICAgIC8vIFRocm93IGFuIGVycm9yXG4gICAgICAgIC8vIHNvY2tldC5kZXN0cm95KHNvY2tldElkKTtcbiAgICAgIC8vIH1cblxuICB9O1xufSk7XG59XG5cblxuICB2YXIgd2hpdGVsaXN0ZWRJZCA9ICdwbWdubmJkZm1tcGRrZ2FhbWtkaWlwZmdqYnBnaW9mYyc7XG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIGlmIChzZW5kZXIuaWQgIT0gd2hpdGVsaXN0ZWRJZCkge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG4gICAgICAgICAgICByZXR1cm47ICAvLyBkb24ndCBhbGxvdyB0aGlzIGV4dGVuc2lvbiBhY2Nlc3NcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3BlbkRpcmVjdG9yeSkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BlbmluZyBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgYWRkRGlyZWN0b3J5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICAvLyBpZiAoc2VuZGVyLmlkICE9IHdoaXRlbGlzdGVkSWQpXG4gICAgICAgICAgLy8gICByZXR1cm4gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJHb3QgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCk7XG4gICAgICAgICAgICBkaXJlY3Rvcmllcy5wdXNoKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCk7XG4gICAgICAgICAgICAvLyBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkLCBmdW5jdGlvbihkaXJlY3RvcnlFbnRyeSkge1xuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGRpcmVjdG9yeUVudHJ5KTtcbiAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG4gICAgc29ja2V0LmNyZWF0ZShcInRjcFwiLCB7fSwgZnVuY3Rpb24oX3NvY2tldEluZm8pIHtcbiAgICAgICAgc29ja2V0SW5mbyA9IF9zb2NrZXRJbmZvO1xuICAgICAgICBzb2NrZXQubGlzdGVuKHNvY2tldEluZm8uc29ja2V0SWQsIFwiMTI3LjAuMC4xXCIsIDMzMzMzLCA1MCwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTElTVEVOSU5HOlwiLCByZXN1bHQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBzdG9wU29ja2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldEluZm8uc29ja2V0SWQpO1xuICAgIH1cblxuICB2YXIgYWRkRGlyZWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJywge1xuICAgICAgICBpZDogXCJtYWlud2luXCIsXG4gICAgICAgIGJvdW5kczoge1xuICAgICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgICBoZWlnaHQ6IDUwXG4gICAgICAgIH0sXG4gICAgfSwgZnVuY3Rpb24od2luKSB7XG4gICAgICAgIG1haW5XaW4gPSB3aW47XG4gICAgfSk7XG4gIH1cblxufTtcbiMjI1xuXG4iLCJcbnZhciBnZXRHbG9iYWwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX2dldEdsb2JhbCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyB9XG4gICAgcmV0dXJuIF9nZXRHbG9iYWwoKVxufVxucm9vdCA9IGdldEdsb2JhbCgpXG5cblxucm9vdC5jaHJvbWUgPSB7XG4gICAgbW9jazoge1xuICAgICAgICB2YWx1ZToge30sXG4gICAgICAgIGdldEJ5dGVzSW5Vc2U6IDBcbiAgICB9LFxuICAgIHJ1bnRpbWU6IHtcbiAgICAgICAgbGFzdEVycm9yOiB1bmRlZmluZWQsXG4gICAgICAgIGdldEJhY2tncm91bmRQYWdlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soe30pXG4gICAgICAgIH1cbiAgICB9XG59XG5cbnJvb3QuY2hyb21lLm1vY2sudXBkYXRlQnl0ZXNJblVzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBieXRlcyA9IDBcbiAgICBmb3IgKHZhciBpZHggaW4gcm9vdC5jaHJvbWUubW9jay52YWx1ZSkge1xuICAgICAgICBieXRlcyArPSAxXG4gICAgfVxuICAgIHJvb3QuY2hyb21lLm1vY2suZ2V0Qnl0ZXNJblVzZSA9IGJ5dGVzXG59XG5cbnJvb3QuY2hyb21lLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbihrZXksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2socm9vdC5jaHJvbWUubW9jay52YWx1ZSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2socm9vdC5jaHJvbWUubW9jay52YWx1ZVtrZXldKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlOiBmdW5jdGlvbihvYmosIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByb290LmNocm9tZS5tb2NrLnVwZGF0ZUJ5dGVzSW5Vc2UoKVxuICAgICAgICAgICAgY2FsbGJhY2socm9vdC5jaHJvbWUubW9jay5nZXRCeXRlc0luVXNlKVxuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKG9iaiwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGZvciAodmFyIGlkeCBpbiBvYmopIHJvb3QuY2hyb21lLm1vY2sudmFsdWVbaWR4XSA9IG9ialtpZHhdXG5cbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihrZXksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBkZWxldGUgcm9vdC5jaHJvbWUubW9jay52YWx1ZS5rZXlcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByb290LmNocm9tZS5tb2NrLnZhbHVlID0ge31cbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgfVxuICAgIH1cbn1cblxucm9vdC5jaHJvbWUuc3RvcmFnZS5zeW5jID0gcm9vdC5jaHJvbWUuc3RvcmFnZS5sb2NhbFxuIiwiIyBzZXJ2ZXIgPSByZXF1aXJlICcuL3RjcC1zZXJ2ZXIuanMnXG5yZXF1aXJlICcuL2Nocm9tZS1tb2NrJ1xuY2xhc3MgTGlicmFyeVxuICBBUFBfSUQgPSAnY2hwZmZkY2traGhwcG1nY2xmYm9tcGZna2docG1ncGcnXG4gIEVYVEVOU0lPTl9JRCA9ICdhYWpocGhqamJjbm5rZ25obGJsbmlhb2VqcGNuamRwZidcbiAgU0VMRl9JRCA9IGNocm9tZS5ydW50aW1lLmlkXG4gIEVYVF9JRCA9IGlmIEFQUF9JRCBpcyBTRUxGX0lEIHRoZW4gRVhURU5TSU9OX0lEIGVsc2UgQVBQX0lEXG4gIE1TRzogKG1lc3NhZ2UsIGV4dCkgLT4gY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgbWVzc2FnZSwgZXh0XG4gIE1TR0VYVDogKG1lc3NhZ2UpIC0+IE1TRyBtZXNzYWdlLEVYVF9JRFxuXG4gIExJU1RFTjogY2xhc3MgTElTVEVOXG4gICAgbG9jYWwgPSBudWxsXG4gICAgZXh0ZXJuYWwgPSBudWxsXG4gICAgQEZPUjogKG1lc3NhZ2UsIGNhbGxiYWNrKSAtPlxuICAgICAgKGxvY2FsID89IG5ldyBMaXN0ZW5lcihmYWxzZSkpLmFkZExpc3RlbmVyIG1lc3NhZ2U6Y2FsbGJhY2tcbiAgICBARk9SRVhUOiAobWVzc2FnZSwgY2FsbGJhY2spIC0+XG4gICAgICAoZXh0ZXJuYWwgPz0gbmV3IExpc3RlbmVyKHRydWUpKS5hZGRMaXN0ZW5lciBtZXNzYWdlOmNhbGxiYWNrXG4gICAgY2xhc3MgTGlzdGVuZXJcbiAgICAgIGxpc3RlbmVyczoge31cbiAgICAgIGV4dGVybmFsOmZhbHNlXG4gICAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZVxuICAgICAgY29uc3RydWN0b3I6IChleHRlcm5hbCkgLT5cbiAgICAgICAgQGV4dGVybmFsID0gZXh0ZXJuYWxcbiAgICAgICAgQGFwaSA9IGlmIEBleHRlcm5hbCB0aGVuIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsIGVsc2UgQGFwaVxuICAgICAgICBAYXBpLmFkZExpc3RlbmVyIEBvbk1lc3NhZ2VcbiAgICAgIGFkZExpc3RlbmVyOiAobWVzc2FnZSwgY2FsbGJhY2spIC0+XG4gICAgICAgIGxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG4gICAgICBvbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgLT5cbiAgICAgICAgaWYgQGV4dGVybmFsIGFuZCBzZW5kZXIuaWQgaXNudCBFWFRfSUQgdGhlbiByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmb3Iga2V5IG9mIHJlcXVlc3RcbiAgICAgICAgICAgIGRvIChrZXkpIC0+IGxpc3RlbmVyc1trZXldIHJlcXVlc3Qua2V5XG5cbiAgU3RvcmFnZTogY2xhc3MgU3RvcmFnZVxuICAgIGFwaSA9IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgQHNhdmU6IChrZXksIGl0ZW0pIC0+XG4gICAgICBvYmogPSB7fVxuICAgICAgb2JqW2tleV0gPSBpdGVtXG4gICAgICBhcGkuc2V0IG9ialxuICAgIEByZXRyaWV2ZTogKGtleSkgLT5cbiAgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZSAocmVzb2x2ZSxyZWplY3QpIC0+XG4gICAgICAgIGFwaS5nZXQga2V5LCAocmVzdWx0cykgLT5cbiAgICAgICAgICByZXNvbHZlIHJlc3VsdHMsXG4gICAgICAgIChlcnJvcikgLT5cbiAgICAgICAgICByZWplY3QgZXJyb3JcbiAgICAgIHByb21pc2UudGhlbiAocmVzdWx0cykgLT4gcmV0dXJuIHJlc3VsdHNcbiAgICBAb25DaGFuZ2VkOiAoa2V5LCBjYWxsYmFjaykgLT5cbiAgICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgICBpZiBjaGFuZ2VzW2tleV0/IHRoZW4gY2FsbGJhY2sgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG5cblxuICBNYXBwaW5nOiBjbGFzcyBNYXBwaW5nXG4gICAgaG9zdDonJ1xuICAgIHVybDonJ1xuICAgIGxvY2FsOicnXG5cbiAgICBjb25zdHJ1Y3RvcjogKGhvc3QsdXJsLGxvY2FsKSAtPlxuICAgICAgQGhvc3QgPSBob3N0IG9yIEBob3N0XG4gICAgICBAdXJsID0gdXJsIG9yIEB1cmxcbiAgICAgIEBsb2NhbCA9IGxvY2FsIG9yIEBsb2NhbFxuXG4gICAgc2V0UmVkaXJlY3REZWNsYXJhdGl2ZTogKHRhYklkKSAtPlxuICAgICAgcnVsZXMgPSBbXS5wdXNoXG4gICAgICAgIHByaW9yaXR5OjEwMFxuICAgICAgICBjb25kaXRpb25zOiBbXG4gICAgICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZXF1ZXN0TWF0Y2hlclxuICAgICAgICAgICAgICAgIHVybDpcbiAgICAgICAgICAgICAgICAgICAgdXJsTWF0Y2hlczpAbG9jYWxcbiAgICAgICAgICAgIF1cbiAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuUmVkaXJlY3RSZXF1ZXN0XG4gICAgICAgICAgICAgICAgcmVkaXJlY3RVcmw6QGxvY2FsXG4gICAgICAgIF1cbiAgICAgIGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3Qub25SZXF1ZXN0LmFkZFJ1bGVzIHJ1bGVzXG5cbiAgUmVzb3VyY2VMaXN0OiBjbGFzcyBSZXNvdXJjZUxpc3RcbiAgICBzZWxlY3RvcjogJ3NjcmlwdFtzcmNdLGxpbmtbaHJlZl0nXG4gICAgcmVzb3VyY2VzOiBbXVxuICAgIGNvbnN0cnVjdG9yOiAoc2VsZWN0b3IpIC0+XG4gICAgICBAc2VsZWN0b3IgPSBzZWxlY3RvciBvciBAc2VsZWN0b3JcbiAgICAgIEBnZXRSZXNvdXJjZXMoKVxuXG4gICAgZ2V0UmVzb3VyY2VzID0gLT5cbiAgICAgIEByZXNvdXJjZXMgPSBbXS5tYXAuY2FsbCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKEBzZWxlY3RvciksIChlKSAtPlxuICAgICAgICB1cmw6IGlmIGUuaHJlZj8gdGhlbiBlLmhyZWYgZWxzZSBlLnNyY1xuICAgICAgICBwYXRoOiBpZiBlLmF0dHJpYnV0ZXNbJ3NyYyddPy52YWx1ZT8gdGhlbiBlLmF0dHJpYnV0ZXNbJ3NyYyddLnZhbHVlIGVsc2UgZS5hdHRyaWJ1dGVzWydocmVmJ10/LnZhbHVlXG4gICAgICAgIGhyZWY6IGUuaHJlZlxuICAgICAgICBzcmM6IGUuc3JjXG4gICAgICAgIHR5cGU6IGUudHlwZVxuICAgICAgICB0YWdOYW1lOiBlLnRhZ05hbWVcbiAgICAgIC5maWx0ZXIgKGUpIC0+XG4gICAgICAgICAgaWYgZS51cmwubWF0Y2goJ14oaHR0cHM/KXwoY2hyb21lLWV4dGVuc2lvbil8KGZpbGUpOlxcL1xcLy4qJyk/IHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5cblxuICBBcHBsaWNhdGlvbjogY2xhc3MgQXBwbGljYXRpb25cbiAgICAgIGNvbnN0cnVjdG9yOiAoZXh0TXNnSWQpIC0+XG4gICAgICAgICAgQGRpcmVjdG9yaWVzID0gW11cbiAgICAgICAgICBAYXBwV2luZG93XG4gICAgICAgICAgQHBvcnQgPSAzMTMzN1xuICAgICAgICAgIEBpbml0KClcbiAgICAgIGluaXQ6ICgpID0+XG4gICAgICAgICAgU3RvcmFnZS5vbkNoYW5nZWQgJ3Jlc291cmNlTWFwJywgKG9iaikgLT5cbiAgICAgICAgICAgIE1TR19FWFQgb2JqXG5cbiAgICAgICAgICBMSVNURU4uRVhUICdyZXNvdXJjZXMnLCAocmVzdWx0KSAtPlxuICAgICAgICAgICAgU3RvcmFnZS5zYXZlICdyZXNvdXJjZXMnLCByZXN1bHRcbiAgICAgICAgICAgIEBvcGVuQXBwKClcblxuICAgICAgICAgICMgTElTVEVOLkVYVCAnZGlyZWN0b3J5RW50cnlJZCcgKGRpcklkKSAtPlxuICAgICAgICAgICAgIyBAZGlyZWN0b3JpZXMucHVzaCBkaXJJZFxuXG4gICAgICBzdGFydFNlcnZlcjogKCkgPT5cbiAgICAgICAgICBAc2VydmVyID0gbmV3IFRjcFNlcnZlcignMTI3LjAuMC4xJywgQHBvcnQpXG4gICAgICAgICAgQHNlcnZlci5saXN0ZW5cblxuICAgICAgb3BlbkFwcDogKCkgPT5cbiAgICAgICAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgICAgICAgYm91bmRzOlxuICAgICAgICAgICAgICAgICAgd2lkdGg6NTAwXG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6ODAwLFxuICAgICAgICAgICh3aW4pID0+XG4gICAgICAgICAgICAgIEBhcHBXaW5kb3cgPSB3aW4pXG5cbiAgICAgIHNldFJlZGlyZWN0OiAoKSA9PlxuICAgICAgICAgIHVuZGVmaW5lZFxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBMaWJyYXJ5XG5cbiMgbWFwRmlsZXMgPSAoZGlyZWN0b3J5RW50cnlJZCkgLT5cbiMgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCAocmVzb3VyY2VzKSAtPlxuIyAgICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeShkaXJlY3RvcnlFbnRyeUlkLCAoZGlyKSAtPlxuXG4jICAgICAgICAgKVxuXG4jIHRlc3RQYXRoID0gKHVybCwgZGlyZWN0b3J5RW50cnkpIC0+XG4jICAgICBmb3IgbmFtZSBpbiB1cmwuc3BsaXQoJy8nKS5zbGljZSgwKS5yZXZlcnNlKClcbiMgICAgICAgICBkbyAobmFtZSkgLT5cbiMgICAgICAgICAgICAgZGlyZWN0b3J5RW50cnkuZ2V0RmlsZShwYXRoICsgbmFtZSwge30sXG4jICAgICAgICAgICAgICAgICAoZmlsZSkgLT5cbiMgICAgICAgICAgICAgICAgIClcblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiMjI1xuIHZhciBleHRNc2dJZCA9ICdwbWdubmJkZm1tcGRrZ2FhbWtkaWlwZmdqYnBnaW9mYyc7XG4gIHZhciBhZGREaXJlY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLCB7XG4gICAgICAgIGlkOiBcIm1haW53aW5cIixcbiAgICAgICAgYm91bmRzOiB7XG4gICAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICAgIGhlaWdodDogNTBcbiAgICAgICAgfSxcbiAgICB9LCBmdW5jdGlvbih3aW4pIHtcbiAgICAgICAgbWFpbldpbiA9IHdpbjtcbiAgICB9KTtcbiAgfVxuXG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICAvLyBpZiAoc2VuZGVyLmlkICE9IGV4dE1zZ0lkKVxuICAgICAgICAgIC8vICAgcmV0dXJuIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiR290IERpcmVjdG9yeVwifSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgZGlyZWN0b3JpZXMucHVzaChyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgLy8gY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5KHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCwgZnVuY3Rpb24oZGlyZWN0b3J5RW50cnkpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIGlmIChzZW5kZXIuaWQgIT0gZXh0TXNnSWQpIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgICAgcmV0dXJuOyAgLy8gZG9uJ3QgYWxsb3cgdGhpcyBleHRlbnNpb24gYWNjZXNzXG4gICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm9wZW5EaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wZW5pbmcgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIGFkZERpcmVjdG9yeSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgc29ja2V0LmNyZWF0ZShcInRjcFwiLCB7fSwgZnVuY3Rpb24oX3NvY2tldEluZm8pIHtcbiAgICAgICAgc29ja2V0SW5mbyA9IF9zb2NrZXRJbmZvO1xuICAgICAgICBzb2NrZXQubGlzdGVuKHNvY2tldEluZm8uc29ja2V0SWQsIFwiMTI3LjAuMC4xXCIsIDMzMzMzLCA1MCwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTElTVEVOSU5HOlwiLCByZXN1bHQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBzdG9wU29ja2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldEluZm8uc29ja2V0SWQpO1xuICAgIH1cblxuXG4jIyNcblxuIyMjXG5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN0YXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKTtcbiAgdmFyIHN0b3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3BcIik7XG4gIHZhciBob3N0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaG9zdHNcIik7XG4gIHZhciBwb3J0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3J0XCIpO1xuICB2YXIgZGlyZWN0b3J5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaXJlY3RvcnlcIik7XG5cbiAgdmFyIHNvY2tldCA9IGNocm9tZS5zb2NrZXQ7XG4gIHZhciBzb2NrZXRJbmZvO1xuICB2YXIgZmlsZXNNYXAgPSB7fTtcblxuICB2YXIgcm9vdERpcjtcbiAgdmFyIHBvcnQsIGV4dFBvcnQ7XG4gIHZhciBkaXJlY3RvcmllcyA9IFtdO1xuXG4gIHZhciBzdHJpbmdUb1VpbnQ4QXJyYXkgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICB2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHN0cmluZy5sZW5ndGgpO1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiB2aWV3O1xuICB9O1xuXG4gIHZhciBhcnJheUJ1ZmZlclRvU3RyaW5nID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgdmFyIHN0ciA9ICcnO1xuICAgIHZhciB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGZvcih2YXIgcyA9IDA7IHMgPCB1QXJyYXlWYWwubGVuZ3RoOyBzKyspIHtcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVBcnJheVZhbFtzXSk7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG4gIH07XG5cbiAgdmFyIGxvZ1RvU2NyZWVuID0gZnVuY3Rpb24obG9nKSB7XG4gICAgbG9nZ2VyLnRleHRDb250ZW50ICs9IGxvZyArIFwiXFxuXCI7XG4gIH1cblxuICB2YXIgd3JpdGVFcnJvclJlc3BvbnNlID0gZnVuY3Rpb24oc29ja2V0SWQsIGVycm9yQ29kZSwga2VlcEFsaXZlKSB7XG4gICAgdmFyIGZpbGUgPSB7IHNpemU6IDAgfTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIik7XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogZmlsZSA9IFwiICsgZmlsZSk7XG4gICAgdmFyIGNvbnRlbnRUeXBlID0gXCJ0ZXh0L3BsYWluXCI7IC8vKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICB2YXIgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZTtcbiAgICB2YXIgaGVhZGVyID0gc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKCBrZWVwQWxpdmUgPyBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiA6IFwiXCIpICsgXCJcXG5cXG5cIik7XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiKTtcbiAgICB2YXIgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldChoZWFkZXIsIDApO1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyB2aWV3Li4uXCIpO1xuICAgIHNvY2tldC53cml0ZShzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCBmdW5jdGlvbih3cml0ZUluZm8pIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiV1JJVEVcIiwgd3JpdGVJbmZvKTtcbiAgICAgIGlmIChrZWVwQWxpdmUpIHtcbiAgICAgICAgcmVhZEZyb21Tb2NrZXQoc29ja2V0SWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SWQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OmZpbGVyZWFkZXI6OiBlbmQgb25sb2FkLi4uXCIpO1xuXG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogZW5kLi4uXCIpO1xuICB9O1xuXG4gIHZhciB3cml0ZTIwMFJlc3BvbnNlID0gZnVuY3Rpb24oc29ja2V0SWQsIGZpbGUsIGtlZXBBbGl2ZSkge1xuICAgIHZhciBjb250ZW50VHlwZSA9IChmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgdmFyIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemU7XG4gICAgdmFyIGhlYWRlciA9IHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIDIwMCBPS1xcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoIGtlZXBBbGl2ZSA/IFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIDogXCJcIikgKyBcIlxcblxcblwiKTtcbiAgICB2YXIgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldChoZWFkZXIsIDApO1xuXG4gICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoKTtcbiAgICAgICBzb2NrZXQud3JpdGUoc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgZnVuY3Rpb24od3JpdGVJbmZvKSB7XG4gICAgICAgICBjb25zb2xlLmxvZyhcIldSSVRFXCIsIHdyaXRlSW5mbyk7XG4gICAgICAgICBpZiAoa2VlcEFsaXZlKSB7XG4gICAgICAgICAgIHJlYWRGcm9tU29ja2V0KHNvY2tldElkKTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldElkKTtcbiAgICAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihmaWxlKTtcbiAgfTtcblxuICB2YXIgb25BY2NlcHQgPSBmdW5jdGlvbihhY2NlcHRJbmZvKSB7XG4gICAgY29uc29sZS5sb2coXCJBQ0NFUFRcIiwgYWNjZXB0SW5mbylcbiAgICByZWFkRnJvbVNvY2tldChhY2NlcHRJbmZvLnNvY2tldElkKTtcbiAgfTtcblxuICB2YXIgcmVhZEZyb21Tb2NrZXQgPSBmdW5jdGlvbihzb2NrZXRJZCkge1xuICAgIC8vICBSZWFkIGluIHRoZSBkYXRhXG4gICAgc29ja2V0LnJlYWQoc29ja2V0SWQsIGZ1bmN0aW9uKHJlYWRJbmZvKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlJFQURcIiwgcmVhZEluZm8pO1xuICAgICAgLy8gUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICB2YXIgZGF0YSA9IGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSk7XG4gICAgICBpZihkYXRhLmluZGV4T2YoXCJHRVQgXCIpID09IDApIHtcbiAgICAgICAgdmFyIGtlZXBBbGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoZGF0YS5pbmRleE9mKFwiQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiKSAhPSAtMSkge1xuICAgICAgICAgIGtlZXBBbGl2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBjYW4gb25seSBkZWFsIHdpdGggR0VUIHJlcXVlc3RzXG4gICAgICAgIHZhciB1cmlFbmQgPSAgZGF0YS5pbmRleE9mKFwiIFwiLCA0KTtcbiAgICAgICAgaWYodXJpRW5kIDwgMCkgeyAgIHJldHVybjsgfVxuICAgICAgICB2YXIgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKTtcbiAgICAgICAgLy8gc3RyaXAgcXllcnkgc3RyaW5nXG4gICAgICAgIHZhciBxID0gdXJpLmluZGV4T2YoXCI/XCIpO1xuICAgICAgICBpZiAocSAhPSAtMSkge1xuICAgICAgICAgIHVyaSA9IHVyaS5zdWJzdHJpbmcoMCwgcSk7XG4gICAgICAgIH1cblxuICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkoZGlyZWN0b3JpZXNbMF0pXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICAgKGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihkaXJlY3RvcnlFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVyaSk7XG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeUVudHJ5LmdldEZpbGUoJ215TmV3QXBwREVWLnJlc291cmNlL2luZGV4LmpzJywge30pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd3JpdGUyMDBSZXNwb25zZShzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKTtcbiAgICAgICAgICAgICAgICAgICAgfSxmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfSkodXJpKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIHZhciBmaWxlID1cbiAgICAgICAgLy8gaWYoISFmaWxlID09IGZhbHNlKSB7XG4gICAgICAgIC8vICAgY29uc29sZS53YXJuKFwiRmlsZSBkb2VzIG5vdCBleGlzdC4uLlwiICsgdXJpKTtcbiAgICAgICAgLy8gICB3cml0ZUVycm9yUmVzcG9uc2Uoc29ja2V0SWQsIDQwNCwga2VlcEFsaXZlKTtcbiAgICAgICAgLy8gICByZXR1cm47XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gbG9nVG9TY3JlZW4oXCJHRVQgMjAwIFwiICsgdXJpKTtcbiAgICAgICAgLy8gd3JpdGUyMDBSZXNwb25zZShzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKTtcbiAgICAgIC8vIH1cbiAgICAgIC8vIGVsc2Uge1xuICAgICAgICAvLyBUaHJvdyBhbiBlcnJvclxuICAgICAgICAvLyBzb2NrZXQuZGVzdHJveShzb2NrZXRJZCk7XG4gICAgICAvLyB9XG5cbiAgfTtcbn0pO1xufVxuXG5cbiAgdmFyIGV4dE1zZ0lkID0gJ3BtZ25uYmRmbW1wZGtnYWFta2RpaXBmZ2picGdpb2ZjJztcblxuXG4gICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWwuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgaWYgKHNlbmRlci5pZCAhPSBleHRNc2dJZCkge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG4gICAgICAgICAgICByZXR1cm47ICAvLyBkb24ndCBhbGxvdyB0aGlzIGV4dGVuc2lvbiBhY2Nlc3NcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3BlbkRpcmVjdG9yeSkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BlbmluZyBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgYWRkRGlyZWN0b3J5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICAvLyBpZiAoc2VuZGVyLmlkICE9IGV4dE1zZ0lkKVxuICAgICAgICAgIC8vICAgcmV0dXJuIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiR290IERpcmVjdG9yeVwifSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgZGlyZWN0b3JpZXMucHVzaChyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgLy8gY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5KHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCwgZnVuY3Rpb24oZGlyZWN0b3J5RW50cnkpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHNvY2tldC5jcmVhdGUoXCJ0Y3BcIiwge30sIGZ1bmN0aW9uKF9zb2NrZXRJbmZvKSB7XG4gICAgICAgIHNvY2tldEluZm8gPSBfc29ja2V0SW5mbztcbiAgICAgICAgc29ja2V0Lmxpc3Rlbihzb2NrZXRJbmZvLnNvY2tldElkLCBcIjEyNy4wLjAuMVwiLCAzMzMzMywgNTAsIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkxJU1RFTklORzpcIiwgcmVzdWx0KTtcbiAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgc3RvcFNvY2tldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzb2NrZXQuZGVzdHJveShzb2NrZXRJbmZvLnNvY2tldElkKTtcbiAgICB9XG5cbiAgdmFyIGFkZERpcmVjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsIHtcbiAgICAgICAgaWQ6IFwibWFpbndpblwiLFxuICAgICAgICBib3VuZHM6IHtcbiAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgaGVpZ2h0OiA1MFxuICAgICAgICB9LFxuICAgIH0sIGZ1bmN0aW9uKHdpbikge1xuICAgICAgICBtYWluV2luID0gd2luO1xuICAgIH0pO1xuICB9XG5cbn07XG4jIyNcblxuIl19
