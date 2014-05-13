(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AppBackground, Application, app,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Application = require('../../common.coffee');

AppBackground = (function(_super) {
  __extends(AppBackground, _super);

  function AppBackground() {
    this.findFileForQueryString = __bind(this.findFileForQueryString, this);
    this.findFileForPath = __bind(this.findFileForPath, this);
    this.getLocalFile = __bind(this.getLocalFile, this);
    return AppBackground.__super__.constructor.apply(this, arguments);
  }

  AppBackground.prototype.retainedDirs = {};

  AppBackground.prototype.init = function() {
    var error;
    this.Storage.retrieveAll((function(_this) {
      return function() {
        _this.data = _this.Storage.data;
        return _this.maps = _this.data.maps;
      };
    })(this));
    this.Server.getLocalFile = this.getLocalFile;
    this.Storage.onChanged('resourceMap', (function(_this) {
      return function(obj) {
        return _this.MSG.Ext(obj);
      };
    })(this));
    this.LISTEN.Ext('resources', (function(_this) {
      return function(result) {
        return _this.Storage.save('currentResources', result);
      };
    })(this));
    this.LISTEN.Local('startServer', (function(_this) {
      return function(results) {
        return _this.Server.start(results.host, results.port);
      };
    })(this));
    this.LISTEN.Local('stopServer', (function(_this) {
      return function() {
        return _this.Server.stop();
      };
    })(this));
    this.startServer();
    try {
      chrome.app.runtime.onLaunched.addListener(this.openApp);
      return chrome.app.runtime.onRestarted.addListener(this.cleanUp);
    } catch (_error) {
      error = _error;
      return show(error);
    }
  };

  AppBackground.prototype.cleanUp = function() {
    return this.stopServer();
  };

  AppBackground.prototype.getLocalFile = function(info, cb, error) {
    return this.findFileForQueryString(info.url, success, (function(_this) {
      return function(error) {
        return _this.findFileForPath(info, cb, error);
      };
    })(this));
  };

  AppBackground.prototype.findFileForPath = function(info, cb, error) {
    return this.findFileForQueryString(info.url, cb, error, info.referer);
  };

  AppBackground.prototype.findFileForQueryString = function(_url, cb, error, referer) {
    var dir, dirEntry, filePath, item, match, url, _i, _len, _ref, _ref1;
    url = _url.replace(/.*?slredir\=/, '');
    _ref = this.maps;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if ((url.match(new RegExp(item.url), item.regexRepl) != null) && (item.url != null) && (typeof match === "undefined" || match === null)) {
        match = item;
      }
    }
    if (match != null) {
      if (referer != null) {
        filePath = (_ref1 = url.match(/.*\/\/.*?\/(.*)/)) != null ? _ref1[1] : void 0;
      } else {
        filePath = url.replace(new RegExp(match.url), match.regexRepl);
      }
      dir = this.Storage.data.directories[match.directory];
      if (dir == null) {
        return err('no match');
      }
      if (this.retainedDirs[dir.directoryEntryId] != null) {
        dirEntry = this.retainedDirs[dir.directoryEntryId];
        return this.FS.readFile(dirEntry, filePath, (function(_this) {
          return function(fileEntry, file) {
            return typeof cb === "function" ? cb(fileEntry, file) : void 0;
          };
        })(this), (function(_this) {
          return function(error) {
            return error();
          };
        })(this));
      } else {
        return chrome.fileSystem.restoreEntry(dir.directoryEntryId, (function(_this) {
          return function(dirEntry) {
            _this.retainedDirs[dir.directoryEntryId] = dirEntry;
            return _this.FS.readFile(dirEntry, filePath, function(fileEntry, file) {
              return typeof cb === "function" ? cb(fileEntry, file) : void 0;
            }, function(error) {
              return error();
            }, function(error) {
              return error();
            });
          };
        })(this));
      }
    } else {
      return error();
    }
  };

  AppBackground.prototype.startServer = function() {
    return this.Server.start(null, null, null, (function(_this) {
      return function() {
        return _this.MSG.Local({
          'server': _this.Server
        });
      };
    })(this));
  };

  AppBackground.prototype.stopServer = function() {
    this.Server.stop;
    return this.MSG.Local({
      'server': null
    });
  };

  return AppBackground;

})(Application);

app = new AppBackground;


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
            show(request.directoryEntryId);
            directories.push(request.directoryEntryId);
            // chrome.fileSystem.restoreEntry(request.directoryEntryId, function(directoryEntry) {
            //     show(directoryEntry);
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
        show("LISTENING:", result);
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
      show("WRITE", writeInfo);
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
         show("WRITE", writeInfo);
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
    show("ACCEPT", acceptInfo)
    readFromSocket(acceptInfo.socketId);
  };

  var readFromSocket = function(socketId) {
    //  Read in the data
    socket.read(socketId, function(readInfo) {
      show("READ", readInfo);
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
                    show(directoryEntry);
                    show(uri);
                    directoryEntry.getFile('myNewAppDEV.resource/index.js', {})
                    .then(function(file) {
                        show(file);
                        write200Response(socketId, file, keepAlive);
                    },function(e) {
                        show(e);
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
            show(request.directoryEntryId);
            directories.push(request.directoryEntryId);
            // chrome.fileSystem.restoreEntry(request.directoryEntryId, function(directoryEntry) {
            //     show(directoryEntry);
            // });

          } else {
            // sendResponse({"result":"Ops, I don't understand this message"});
          }
      });
    socket.create("tcp", {}, function(_socketInfo) {
        socketInfo = _socketInfo;
        socket.listen(socketInfo.socketId, "127.0.0.1", 33333, 50, function(result) {
        show("LISTENING:", result);
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


},{"../../common.coffee":2}],2:[function(require,module,exports){
var Application, Data, FileSystem, LISTEN, MSG, Mapping, Server, Storage,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

(function() {
  var methods, noop;
  methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
  noop = function() {
    var m, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = methods.length; _i < _len; _i++) {
      m = methods[_i];
      if (!console[m]) {
        _results.push(console[m] = noop);
      }
    }
    return _results;
  };
  if (Function.prototype.bind != null) {
    return window.show = Function.prototype.bind.call(console.log, console);
  } else {
    return window.show = function() {
      return Function.prototype.apply.call(console.log, console, arguments);
    };
  }
})();

MSG = (function() {
  MSG.prototype.isContentScript = location.protocol !== 'chrome-extension:';

  function MSG(config) {
    this.config = config;
  }

  MSG.prototype.Local = function(message, respond) {
    show("== MESSAGE " + (JSON.stringify(message)) + " ==>");
    return chrome.runtime.sendMessage(message, respond);
  };

  MSG.prototype.Ext = function(message, respond) {
    show("== MESSAGE " + (JSON.stringify(message)) + " ==>");
    return chrome.runtime.sendMessage(this.config.EXT_ID, message, respond);
  };

  return MSG;

})();

LISTEN = (function() {
  LISTEN.prototype.local = {
    api: chrome.runtime.onMessage,
    listeners: {}
  };

  LISTEN.prototype.external = {
    api: chrome.runtime.onMessageExternal,
    listeners: {}
  };

  function LISTEN(config) {
    this._onMessage = __bind(this._onMessage, this);
    this._onMessageExternal = __bind(this._onMessageExternal, this);
    this.Ext = __bind(this.Ext, this);
    this.Local = __bind(this.Local, this);
    var _ref;
    this.config = config;
    this.local.api.addListener(this._onMessage);
    if ((_ref = this.external.api) != null) {
      _ref.addListener(this._onMessageExternal);
    }
  }

  LISTEN.prototype.Local = function(message, callback) {
    return this.local.listeners[message] = callback;
  };

  LISTEN.prototype.Ext = function(message, callback) {
    return this.external.listeners[message] = callback;
  };

  LISTEN.prototype._onMessageExternal = function(request, sender, sendResponse) {
    var key, _base, _results;
    show(("<== EXTERNAL MESSAGE == " + this.config.EXT_TYPE + " ==") + request);
    if (sender.id !== this.config.EXT_ID) {
      return void 0;
    }
    _results = [];
    for (key in request) {
      _results.push(typeof (_base = this.external.listeners)[key] === "function" ? _base[key](request[key], sendResponse) : void 0);
    }
    return _results;
  };

  LISTEN.prototype._onMessage = function(request, sender, sendResponse) {
    var key, _base, _results;
    show(("<== MESSAGE == " + this.config.EXT_TYPE + " ==") + request);
    _results = [];
    for (key in request) {
      _results.push(typeof (_base = this.local.listeners)[key] === "function" ? _base[key](request[key], sendResponse) : void 0);
    }
    return _results;
  };

  return LISTEN;

})();

Data = (function() {
  function Data() {}

  Data.prototype.mapping = [
    {
      directory: null,
      urlPattern: null
    }
  ];

  Data.prototype.resources = [
    {
      resource: null,
      file: null
    }
  ];

  return Data;

})();

Storage = (function() {
  Storage.prototype.api = chrome.storage.local;

  Storage.prototype.data = {};

  Storage.prototype.callback = function() {};

  function Storage(callback) {
    this.callback = callback;
    this.retrieveAll();
    this.onChangedAll();
  }

  Storage.prototype.save = function(key, item) {
    var obj;
    obj = {};
    obj[key] = item;
    return this.api.set(obj);
  };

  Storage.prototype.saveAll = function() {
    return this.api.set(this.data);
  };

  Storage.prototype.retrieve = function(key, cb) {
    return this.api.get(key, function(results) {
      var r;
      for (r in results) {
        this.data[r] = results[r];
      }
      if (cb != null) {
        return cb(results[key]);
      }
    });
  };

  Storage.prototype.retrieveAll = function(cb) {
    return this.api.get((function(_this) {
      return function(result) {
        _this.data = result;
        if (typeof _this.callback === "function") {
          _this.callback(result);
        }
        if (typeof cb === "function") {
          cb(result);
        }
        return show(result);
      };
    })(this));
  };

  Storage.prototype.onChanged = function(key, cb) {
    return chrome.storage.onChanged.addListener(function(changes, namespace) {
      if ((changes[key] != null) && (cb != null)) {
        cb(changes[key].newValue);
      }
      return typeof this.callback === "function" ? this.callback(changes) : void 0;
    });
  };

  Storage.prototype.onChangedAll = function() {
    return chrome.storage.onChanged.addListener((function(_this) {
      return function(changes, namespace) {
        var c;
        for (c in changes) {
          _this.data[c] = changes[c].newValue;
        }
        return typeof _this.callback === "function" ? _this.callback(changes) : void 0;
      };
    })(this));
  };

  return Storage;

})();

FileSystem = (function() {
  FileSystem.prototype.api = chrome.fileSystem;

  function FileSystem() {
    this.openDirectory = __bind(this.openDirectory, this);
  }

  FileSystem.prototype.readFile = function(dirEntry, path, success, error) {
    return this.getFileEntry(dirEntry, path, (function(_this) {
      return function(fileEntry) {
        return fileEntry.file(function(file) {
          return success(fileEntry, file);
        }, function(error) {
          return error();
        });
      };
    })(this), (function(_this) {
      return function(error) {
        return error();
      };
    })(this));
  };

  FileSystem.prototype.getFileEntry = function(dirEntry, path, success, error) {
    if ((dirEntry != null ? dirEntry.getFile : void 0) != null) {
      return dirEntry.getFile(path, {}, function(fileEntry) {
        return success(fileEntry);
      });
    } else {
      return error();
    }
  };

  FileSystem.prototype.openDirectory = function(callback) {
    return this.api.chooseEntry({
      type: 'openDirectory'
    }, (function(_this) {
      return function(directoryEntry, files) {
        return _this.api.getDisplayPath(directoryEntry, function(pathName) {
          var dir;
          dir = {
            relPath: directoryEntry.fullPath.replace('/' + directoryEntry.name, ''),
            directoryEntryId: _this.api.retainEntry(directoryEntry),
            entry: directoryEntry
          };
          return callback(pathName, dir);
        });
      };
    })(this));
  };

  return FileSystem;

})();

Mapping = (function() {
  Mapping.prototype.resource = null;

  Mapping.prototype.local = null;

  Mapping.prototype.regex = null;

  function Mapping(resource, local, regex) {
    var _ref;
    _ref = [local, resource, regex], this.local = _ref[0], this.resource = _ref[1], this.regex = _ref[2];
  }

  Mapping.prototype.getLocalResource = function() {
    return this.resource.replace(this.regex, this.local);
  };

  Mapping.prototype.setRedirectDeclarative = function(tabId) {
    var rules;
    rules = [].push({
      priority: 100,
      conditions: [
        new chrome.declarativeWebRequest.RequestMatcher({
          url: {
            urlMatches: this.regex
          }
        })
      ],
      actions: [
        new chrome.declarativeWebRequest.RedirectRequest({
          redirectUrl: this.getLocalResource()
        })
      ]
    });
    return chrome.declarativeWebRequest.onRequest.addRules(rules);
  };

  return Mapping;

})();


/*
class File
    constructor: (directoryEntry, path) ->
        @dirEntry = directoryEntry
        @path = path
 */

Server = (function() {
  Server.prototype.socket = chrome.socket;

  Server.prototype.host = "127.0.0.1";

  Server.prototype.port = 8082;

  Server.prototype.maxConnections = 500;

  Server.prototype.socketProperties = {
    persistent: true,
    name: 'SLRedirector'
  };

  Server.prototype.socketInfo = null;

  Server.prototype.getLocalFile = null;

  Server.prototype.socketIds = [];

  Server.prototype.stopped = false;

  function Server() {
    this._onAccept = __bind(this._onAccept, this);
    this._onListen = __bind(this._onListen, this);
    this._onReceive = __bind(this._onReceive, this);
  }

  Server.prototype.start = function(host, port, maxConnections, cb) {
    this.host = host != null ? host : this.host;
    this.port = port != null ? port : this.port;
    this.maxConnections = maxConnections != null ? maxConnections : this.maxConnections;
    return this.killAll((function(_this) {
      return function() {
        return _this.socket.create('tcp', {}, function(socketInfo) {
          _this.socketIds = [];
          _this.socketIds.push(socketInfo.socketId);
          chrome.storage.local.set({
            'socketIds': _this.socketIds
          });
          return _this.socket.listen(socketInfo.socketId, _this.host, _this.port, function(result) {
            show('listening ' + socketInfo.socketId);
            _this.stopped = false;
            _this.socketInfo = socketInfo;
            return _this.socket.accept(socketInfo.socketId, _this._onAccept);
          });
        });
      };
    })(this));
  };

  Server.prototype.killAll = function(callback) {
    return chrome.storage.local.get('socketIds', (function(_this) {
      return function(result) {
        var s, _fn, _i, _len, _ref;
        show('got ids');
        show(result);
        _this.socketIds = result.socketIds;
        _ref = _this.socketIds != null;
        _fn = function(s) {
          var error;
          try {
            _this.socket.disconnect(s);
            _this.socket.destroy(s);
            return show('killed ' + s);
          } catch (_error) {
            error = _error;
            return show("could not kill " + s + " because " + error);
          }
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          _fn(s);
        }
        return typeof callback === "function" ? callback() : void 0;
      };
    })(this));
  };

  Server.prototype.stop = function() {
    this.killAll();
    return this.stopped = true;
  };

  Server.prototype._onReceive = function(receiveInfo) {
    return show("Client socket 'receive' event: sd=" + receiveInfo.socketId, +", bytes=" + receiveInfo.data.byteLength);
  };

  Server.prototype._onListen = function(serverSocketId, resultCode) {
    if (resultCode < 0) {
      return show('Error Listening: ' + chrome.runtime.lastError.message);
    }
    this.serverSocketId = serverSocketId;
    this.tcpServer.onAccept.addListener(this._onAccept);
    this.tcpServer.onAcceptError.addListener(this._onAcceptError);
    return this.tcp.onReceive.addListener(this._onReceive);
  };

  Server.prototype._onAcceptError = function(error) {
    return show(error);
  };

  Server.prototype._onAccept = function(socketInfo) {
    show("Server socket 'accept' event: sd=" + socketInfo.socketId);
    return this._readFromSocket(socketInfo.socketId, (function(_this) {
      return function(info) {
        return _this.getLocalFile(info, function(fileEntry, fileReader) {
          return _this._write200Response(socketInfo.socketId, fileEntry, fileReader, info.keepAlive);
        }, function(error) {
          return _this._writeError(socketInfo.socketId, 404, info.keepAlive);
        });
      };
    })(this));
  };

  Server.prototype.stringToUint8Array = function(string) {
    var buffer, i, view;
    buffer = new ArrayBuffer(string.length);
    view = new Uint8Array(buffer);
    i = 0;
    while (i < string.length) {
      view[i] = string.charCodeAt(i);
      i++;
    }
    return view;
  };

  Server.prototype.arrayBufferToString = function(buffer) {
    var s, str;
    str = new Uint8Array(buffer);
    s = 0;
    while (s < uArrayVal.length) {
      str += String.fromCharCode(uArrayVal[s]);
      s++;
    }
    return str;
  };

  Server.prototype._write200Response = function(socketId, fileEntry, file, keepAlive) {
    var contentLength, contentType, header, outputBuffer, reader, view;
    contentType = (file.type === "" ? "text/plain" : file.type);
    contentLength = file.size;
    header = this.stringToUint8Array("HTTP/1.0 200 OK\nContent-length: " + file.size + "\nContent-type:" + contentType + (keepAlive ? "\nConnection: keep-alive" : "") + "\n\n");
    outputBuffer = new ArrayBuffer(header.byteLength + file.size);
    view = new Uint8Array(outputBuffer);
    view.set(header, 0);
    reader = new FileReader;
    reader.onload = (function(_this) {
      return function(ev) {
        view.set(new Uint8Array(ev.target.result), header.byteLength);
        return _this.socket.write(socketId, outputBuffer, function(writeInfo) {
          show(writeInfo);
          return _this.end(socketId, keepAlive);
        });
      };
    })(this);
    reader.onerror = (function(_this) {
      return function(error) {
        return _this.end(socketId, keepAlive);
      };
    })(this);
    return reader.readAsArrayBuffer(file);
  };

  Server.prototype._readFromSocket = function(socketId, cb) {
    return this.socket.read(socketId, (function(_this) {
      return function(readInfo) {
        var data, info, keepAlive, uri, uriEnd, _ref;
        show("READ", readInfo);
        data = _this.arrayBufferToString(readInfo.data);
        show(data);
        if (data.indexOf("GET ") !== 0) {
          _this.end(socketId);
          return;
        }
        keepAlive = false;
        if (data.indexOf('Connection: keep-alive' !== -1)) {
          keepAlive = true;
        }
        uriEnd = data.indexOf(" ", 4);
        if (uriEnd < 0) {
          return end(socketId);
        }
        uri = data.substring(4, uriEnd);
        if (uri == null) {
          writeError(socketId, 404, keepAlive);
          return;
        }
        info = {
          uri: uri,
          keepAlive: keepAlive
        };
        info.referer = (_ref = data.match(/Referer:\s(.*)/)) != null ? _ref[1] : void 0;
        return typeof cb === "function" ? cb(info) : void 0;
      };
    })(this));
  };

  Server.prototype.end = function(socketId, keepAlive) {
    this.socket.disconnect(socketId);
    this.socket.destroy(socketId);
    show('ending ' + socketId);
    return this.socket.accept(this.socketInfo.socketId, this._onAccept);
  };

  Server.prototype._writeError = function(socketId, errorCode, keepAlive) {
    var contentLength, contentType, file, header, outputBuffer, view;
    file = {
      size: 0
    };
    console.info("writeErrorResponse:: begin... ");
    console.info("writeErrorResponse:: file = " + file);
    contentType = "text/plain";
    contentLength = file.size;
    header = this.stringToUint8Array("HTTP/1.0 " + errorCode + " Not Found\nContent-length: " + file.size + "\nContent-type:" + contentType + (keepAlive ? "\nConnection: keep-alive" : "") + "\n\n");
    console.info("writeErrorResponse:: Done setting header...");
    outputBuffer = new ArrayBuffer(header.byteLength + file.size);
    view = new Uint8Array(outputBuffer);
    view.set(header, 0);
    console.info("writeErrorResponse:: Done setting view...");
    return this.socket.write(socketId, outputBuffer, (function(_this) {
      return function(writeInfo) {
        show("WRITE", writeInfo);
        return _this.end(socketId, keepAlive);
      };
    })(this));
  };

  return Server;

})();

Application = (function() {
  Application.prototype.config = {
    APP_ID: 'cecifafpheghofpfdkhekkibcibhgfec',
    EXTENSION_ID: 'dddimbnjibjcafboknbghehbfajgggep'
  };

  Application.prototype.data = null;

  Application.prototype.LISTEN = null;

  Application.prototype.MSG = null;

  Application.prototype.Storage = null;

  Application.prototype.FS = null;

  Application.prototype.Server = null;

  function Application() {
    this.openApp = __bind(this.openApp, this);
    this.init = __bind(this.init, this);
    this.Storage = new Storage;
    this.FS = new FileSystem;
    this.Server = new Server;
    this.config.SELF_ID = chrome.runtime.id;
    this.config.EXT_ID = this.config.APP_ID === this.config.SELF_ID ? this.config.EXTENSION_ID : this.config.APP_ID;
    this.config.EXT_TYPE = this.config.APP_ID !== this.config.SELF_ID ? 'EXTENSION' : 'APP';
    this.MSG = new MSG(this.config);
    this.LISTEN = new LISTEN(this.config);
    this.appWindow = null;
    this.port = 31337;
    this.data = this.Storage.data;
    this.init();
  }

  Application.prototype.init = function() {};

  Application.prototype.launchApp = function(cb) {
    return chrome.management.launchApp(this.config.APP_ID);
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

  return Application;

})();

module.exports = Application;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL2Rldi9yZWRpcmVjdG9yL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbmllbC9kZXYvcmVkaXJlY3Rvci9hcHAvc3JjL2JhY2tncm91bmQuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcmVkaXJlY3Rvci9jb21tb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDVUEsSUFBQSwrQkFBQTtFQUFBOztpU0FBQTs7QUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBQWQsQ0FBQTs7QUFBQTtBQUdJLGtDQUFBLENBQUE7Ozs7Ozs7R0FBQTs7QUFBQSwwQkFBQSxZQUFBLEdBQWEsRUFBYixDQUFBOztBQUFBLDBCQUNBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDRixRQUFBLEtBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsS0FBQyxDQUFBLElBQUQsR0FBUSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQWpCLENBQUE7ZUFDQSxLQUFDLENBQUEsSUFBRCxHQUFRLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FGRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLENBQUEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLEdBQXVCLElBQUMsQ0FBQSxZQUp4QixDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBbUIsYUFBbkIsRUFBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsR0FBRCxHQUFBO2VBQzlCLEtBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxDQUFTLEdBQVQsRUFEOEI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUxBLENBQUE7QUFBQSxJQVFBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFdBQVosRUFBeUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsTUFBRCxHQUFBO2VBQ3JCLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGtCQUFkLEVBQWtDLE1BQWxDLEVBRHFCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekIsQ0FSQSxDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxhQUFkLEVBQTZCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLE9BQUQsR0FBQTtlQUN6QixLQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxPQUFPLENBQUMsSUFBdEIsRUFBNEIsT0FBTyxDQUFDLElBQXBDLEVBRHlCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0IsQ0FYQSxDQUFBO0FBQUEsSUFjQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxZQUFkLEVBQTRCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFDeEIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQUEsRUFEd0I7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QixDQWRBLENBQUE7QUFBQSxJQWlCQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBakJBLENBQUE7QUFrQkE7QUFDSSxNQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUE5QixDQUEwQyxJQUFDLENBQUEsT0FBM0MsQ0FBQSxDQUFBO2FBQ0EsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQS9CLENBQTJDLElBQUMsQ0FBQSxPQUE1QyxFQUZKO0tBQUEsY0FBQTtBQUlJLE1BREUsY0FDRixDQUFBO2FBQUEsSUFBQSxDQUFLLEtBQUwsRUFKSjtLQW5CRTtFQUFBLENBRE4sQ0FBQTs7QUFBQSwwQkEyQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtXQUNMLElBQUMsQ0FBQSxVQUFELENBQUEsRUFESztFQUFBLENBM0JULENBQUE7O0FBQUEsMEJBOEJBLFlBQUEsR0FBYyxTQUFDLElBQUQsRUFBTyxFQUFQLEVBQVcsS0FBWCxHQUFBO1dBRVYsSUFBQyxDQUFBLHNCQUFELENBQXdCLElBQUksQ0FBQyxHQUE3QixFQUFrQyxPQUFsQyxFQUNJLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLEtBQUQsR0FBQTtlQUNJLEtBQUMsQ0FBQSxlQUFELENBQWlCLElBQWpCLEVBQXVCLEVBQXZCLEVBQTJCLEtBQTNCLEVBREo7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURKLEVBRlU7RUFBQSxDQTlCZCxDQUFBOztBQUFBLDBCQW9DQSxlQUFBLEdBQWlCLFNBQUMsSUFBRCxFQUFPLEVBQVAsRUFBVyxLQUFYLEdBQUE7V0FDYixJQUFDLENBQUEsc0JBQUQsQ0FBd0IsSUFBSSxDQUFDLEdBQTdCLEVBQWtDLEVBQWxDLEVBQXNDLEtBQXRDLEVBQTZDLElBQUksQ0FBQyxPQUFsRCxFQURhO0VBQUEsQ0FwQ2pCLENBQUE7O0FBQUEsMEJBdUNBLHNCQUFBLEdBQXdCLFNBQUMsSUFBRCxFQUFPLEVBQVAsRUFBVyxLQUFYLEVBQWtCLE9BQWxCLEdBQUE7QUFDcEIsUUFBQSxnRUFBQTtBQUFBLElBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxPQUFMLENBQWEsY0FBYixFQUE2QixFQUE3QixDQUFOLENBQUE7QUFFQTtBQUFBLFNBQUEsMkNBQUE7c0JBQUE7VUFBb0MseURBQUEsSUFBcUQsa0JBQXJELElBQXVFO0FBQTNHLFFBQUEsS0FBQSxHQUFRLElBQVI7T0FBQTtBQUFBLEtBRkE7QUFJQSxJQUFBLElBQUcsYUFBSDtBQUNJLE1BQUEsSUFBRyxlQUFIO0FBQ0ksUUFBQSxRQUFBLHlEQUF5QyxDQUFBLENBQUEsVUFBekMsQ0FESjtPQUFBLE1BQUE7QUFHSSxRQUFBLFFBQUEsR0FBVyxHQUFHLENBQUMsT0FBSixDQUFnQixJQUFBLE1BQUEsQ0FBTyxLQUFLLENBQUMsR0FBYixDQUFoQixFQUFtQyxLQUFLLENBQUMsU0FBekMsQ0FBWCxDQUhKO09BQUE7QUFBQSxNQUlBLEdBQUEsR0FBTSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFZLENBQUEsS0FBSyxDQUFDLFNBQU4sQ0FKaEMsQ0FBQTtBQU1BLE1BQUEsSUFBTyxXQUFQO0FBQWlCLGVBQU8sR0FBQSxDQUFJLFVBQUosQ0FBUCxDQUFqQjtPQU5BO0FBUUEsTUFBQSxJQUFHLCtDQUFIO0FBQ0ksUUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFlBQWEsQ0FBQSxHQUFHLENBQUMsZ0JBQUosQ0FBekIsQ0FBQTtlQUNBLElBQUMsQ0FBQSxFQUFFLENBQUMsUUFBSixDQUFhLFFBQWIsRUFBdUIsUUFBdkIsRUFDSSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsU0FBRCxFQUFZLElBQVosR0FBQTs4Q0FDSSxHQUFJLFdBQVcsZUFEbkI7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURKLEVBR0ssQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLEtBQUQsR0FBQTttQkFBVyxLQUFBLENBQUEsRUFBWDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSEwsRUFGSjtPQUFBLE1BQUE7ZUFPSSxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQWxCLENBQStCLEdBQUcsQ0FBQyxnQkFBbkMsRUFBcUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLFFBQUQsR0FBQTtBQUNqRCxZQUFBLEtBQUMsQ0FBQSxZQUFhLENBQUEsR0FBRyxDQUFDLGdCQUFKLENBQWQsR0FBc0MsUUFBdEMsQ0FBQTttQkFDQSxLQUFDLENBQUEsRUFBRSxDQUFDLFFBQUosQ0FBYSxRQUFiLEVBQXVCLFFBQXZCLEVBQ0ksU0FBQyxTQUFELEVBQVksSUFBWixHQUFBO2dEQUNJLEdBQUksV0FBVyxlQURuQjtZQUFBLENBREosRUFHSyxTQUFDLEtBQUQsR0FBQTtxQkFBVyxLQUFBLENBQUEsRUFBWDtZQUFBLENBSEwsRUFJQyxTQUFDLEtBQUQsR0FBQTtxQkFBVyxLQUFBLENBQUEsRUFBWDtZQUFBLENBSkQsRUFGaUQ7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyRCxFQVBKO09BVEo7S0FBQSxNQUFBO2FBd0JJLEtBQUEsQ0FBQSxFQXhCSjtLQUxvQjtFQUFBLENBdkN4QixDQUFBOztBQUFBLDBCQXVFQSxXQUFBLEdBQWEsU0FBQSxHQUFBO1dBQ1QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsSUFBZCxFQUFtQixJQUFuQixFQUF3QixJQUF4QixFQUE4QixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO2VBQzFCLEtBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXO0FBQUEsVUFBQSxRQUFBLEVBQVMsS0FBQyxDQUFBLE1BQVY7U0FBWCxFQUQwQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCLEVBRFM7RUFBQSxDQXZFYixDQUFBOztBQUFBLDBCQTJFQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1IsSUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBQTtXQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXO0FBQUEsTUFBQSxRQUFBLEVBQVMsSUFBVDtLQUFYLEVBRlE7RUFBQSxDQTNFWixDQUFBOzt1QkFBQTs7R0FEd0IsWUFGNUIsQ0FBQTs7QUFBQSxHQWtGQSxHQUFNLEdBQUEsQ0FBQSxhQWxGTixDQUFBOztBQXNGQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F0RkE7O0FBbUpBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbkpBOzs7O0FDVEEsSUFBQSxvRUFBQTtFQUFBLGtGQUFBOztBQUFBLENBQUMsU0FBQSxHQUFBO0FBQ0MsTUFBQSxhQUFBO0FBQUEsRUFBQSxPQUFBLEdBQVUsQ0FDUixRQURRLEVBQ0UsT0FERixFQUNXLE9BRFgsRUFDb0IsT0FEcEIsRUFDNkIsS0FEN0IsRUFDb0MsUUFEcEMsRUFDOEMsT0FEOUMsRUFFUixXQUZRLEVBRUssT0FGTCxFQUVjLGdCQUZkLEVBRWdDLFVBRmhDLEVBRTRDLE1BRjVDLEVBRW9ELEtBRnBELEVBR1IsY0FIUSxFQUdRLFNBSFIsRUFHbUIsWUFIbkIsRUFHaUMsT0FIakMsRUFHMEMsTUFIMUMsRUFHa0QsU0FIbEQsRUFJUixXQUpRLEVBSUssT0FKTCxFQUljLE1BSmQsQ0FBVixDQUFBO0FBQUEsRUFLQSxJQUFBLEdBQU8sU0FBQSxHQUFBO0FBRUwsUUFBQSxxQkFBQTtBQUFBO1NBQUEsOENBQUE7c0JBQUE7VUFBd0IsQ0FBQSxPQUFTLENBQUEsQ0FBQTtBQUMvQixzQkFBQSxPQUFRLENBQUEsQ0FBQSxDQUFSLEdBQWEsS0FBYjtPQURGO0FBQUE7b0JBRks7RUFBQSxDQUxQLENBQUE7QUFVQSxFQUFBLElBQUcsK0JBQUg7V0FDRSxNQUFNLENBQUMsSUFBUCxHQUFjLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQXhCLENBQTZCLE9BQU8sQ0FBQyxHQUFyQyxFQUEwQyxPQUExQyxFQURoQjtHQUFBLE1BQUE7V0FHRSxNQUFNLENBQUMsSUFBUCxHQUFjLFNBQUEsR0FBQTthQUNaLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQXpCLENBQThCLE9BQU8sQ0FBQyxHQUF0QyxFQUEyQyxPQUEzQyxFQUFvRCxTQUFwRCxFQURZO0lBQUEsRUFIaEI7R0FYRDtBQUFBLENBQUQsQ0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFBQTtBQW1CRSxnQkFBQSxlQUFBLEdBQWlCLFFBQVEsQ0FBQyxRQUFULEtBQXVCLG1CQUF4QyxDQUFBOztBQUNhLEVBQUEsYUFBQyxNQUFELEdBQUE7QUFDWCxJQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsTUFBVixDQURXO0VBQUEsQ0FEYjs7QUFBQSxnQkFHQSxLQUFBLEdBQU8sU0FBQyxPQUFELEVBQVUsT0FBVixHQUFBO0FBQ0wsSUFBQSxJQUFBLENBQU0sYUFBQSxHQUFZLENBQXJCLElBQUksQ0FBQyxTQUFMLENBQWUsT0FBZixDQUFxQixDQUFaLEdBQXNDLE1BQTVDLENBQUEsQ0FBQTtXQUNBLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBZixDQUEyQixPQUEzQixFQUFvQyxPQUFwQyxFQUZLO0VBQUEsQ0FIUCxDQUFBOztBQUFBLGdCQU1BLEdBQUEsR0FBSyxTQUFDLE9BQUQsRUFBVSxPQUFWLEdBQUE7QUFDSCxJQUFBLElBQUEsQ0FBTSxhQUFBLEdBQVksQ0FBckIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxPQUFmLENBQXFCLENBQVosR0FBc0MsTUFBNUMsQ0FBQSxDQUFBO1dBQ0EsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFmLENBQTJCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbkMsRUFBMkMsT0FBM0MsRUFBb0QsT0FBcEQsRUFGRztFQUFBLENBTkwsQ0FBQTs7YUFBQTs7SUFuQkYsQ0FBQTs7QUFBQTtBQThCRSxtQkFBQSxLQUFBLEdBQ0U7QUFBQSxJQUFBLEdBQUEsRUFBSyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQXBCO0FBQUEsSUFDQSxTQUFBLEVBQVUsRUFEVjtHQURGLENBQUE7O0FBQUEsbUJBR0EsUUFBQSxHQUNFO0FBQUEsSUFBQSxHQUFBLEVBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBcEI7QUFBQSxJQUNBLFNBQUEsRUFBVSxFQURWO0dBSkYsQ0FBQTs7QUFNYSxFQUFBLGdCQUFDLE1BQUQsR0FBQTtBQUNYLG1EQUFBLENBQUE7QUFBQSxtRUFBQSxDQUFBO0FBQUEscUNBQUEsQ0FBQTtBQUFBLHlDQUFBLENBQUE7QUFBQSxRQUFBLElBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsTUFBVixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFYLENBQXVCLElBQUMsQ0FBQSxVQUF4QixDQURBLENBQUE7O1VBRWEsQ0FBRSxXQUFmLENBQTJCLElBQUMsQ0FBQSxrQkFBNUI7S0FIVztFQUFBLENBTmI7O0FBQUEsbUJBV0EsS0FBQSxHQUFPLFNBQUMsT0FBRCxFQUFVLFFBQVYsR0FBQTtXQUNMLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBVSxDQUFBLE9BQUEsQ0FBakIsR0FBNEIsU0FEdkI7RUFBQSxDQVhQLENBQUE7O0FBQUEsbUJBY0EsR0FBQSxHQUFLLFNBQUMsT0FBRCxFQUFVLFFBQVYsR0FBQTtXQUNILElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVSxDQUFBLE9BQUEsQ0FBcEIsR0FBK0IsU0FENUI7RUFBQSxDQWRMLENBQUE7O0FBQUEsbUJBaUJBLGtCQUFBLEdBQW9CLFNBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsWUFBbEIsR0FBQTtBQUNsQixRQUFBLG9CQUFBO0FBQUEsSUFBQSxJQUFBLENBQUssQ0FBQywwQkFBQSxHQUFULElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBQyxHQUE2QyxLQUE5QyxDQUFBLEdBQXFELE9BQTFELENBQUEsQ0FBQTtBQUNBLElBQUEsSUFBRyxNQUFNLENBQUMsRUFBUCxLQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBMUI7QUFBc0MsYUFBTyxNQUFQLENBQXRDO0tBREE7QUFFQTtTQUFBLGNBQUEsR0FBQTtBQUFBLHdGQUFvQixDQUFBLEdBQUEsRUFBTSxPQUFRLENBQUEsR0FBQSxHQUFNLHVCQUF4QyxDQUFBO0FBQUE7b0JBSGtCO0VBQUEsQ0FqQnBCLENBQUE7O0FBQUEsbUJBc0JBLFVBQUEsR0FBWSxTQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLFlBQWxCLEdBQUE7QUFDVixRQUFBLG9CQUFBO0FBQUEsSUFBQSxJQUFBLENBQUssQ0FBQyxpQkFBQSxHQUFULElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBQyxHQUFvQyxLQUFyQyxDQUFBLEdBQTRDLE9BQWpELENBQUEsQ0FBQTtBQUNBO1NBQUEsY0FBQSxHQUFBO0FBQUEscUZBQWlCLENBQUEsR0FBQSxFQUFNLE9BQVEsQ0FBQSxHQUFBLEdBQU0sdUJBQXJDLENBQUE7QUFBQTtvQkFGVTtFQUFBLENBdEJaLENBQUE7O2dCQUFBOztJQTlCRixDQUFBOztBQUFBO29CQXlERTs7QUFBQSxpQkFBQSxPQUFBLEdBQVE7SUFDTjtBQUFBLE1BQUEsU0FBQSxFQUFVLElBQVY7QUFBQSxNQUNBLFVBQUEsRUFBVyxJQURYO0tBRE07R0FBUixDQUFBOztBQUFBLGlCQUlBLFNBQUEsR0FBVTtJQUNSO0FBQUEsTUFBQSxRQUFBLEVBQVMsSUFBVDtBQUFBLE1BQ0EsSUFBQSxFQUFLLElBREw7S0FEUTtHQUpWLENBQUE7O2NBQUE7O0lBekRGLENBQUE7O0FBQUE7QUFxRUUsb0JBQUEsR0FBQSxHQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBcEIsQ0FBQTs7QUFBQSxvQkFDQSxJQUFBLEdBQU0sRUFETixDQUFBOztBQUFBLG9CQUVBLFFBQUEsR0FBVSxTQUFBLEdBQUEsQ0FGVixDQUFBOztBQUdhLEVBQUEsaUJBQUMsUUFBRCxHQUFBO0FBQ1gsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLFFBQVosQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQURBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FGQSxDQURXO0VBQUEsQ0FIYjs7QUFBQSxvQkFRQSxJQUFBLEdBQU0sU0FBQyxHQUFELEVBQU0sSUFBTixHQUFBO0FBQ0osUUFBQSxHQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sRUFBTixDQUFBO0FBQUEsSUFDQSxHQUFJLENBQUEsR0FBQSxDQUFKLEdBQVcsSUFEWCxDQUFBO1dBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFMLENBQVMsR0FBVCxFQUhJO0VBQUEsQ0FSTixDQUFBOztBQUFBLG9CQWFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7V0FDUCxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsSUFBVixFQURPO0VBQUEsQ0FiVCxDQUFBOztBQUFBLG9CQWdCQSxRQUFBLEdBQVUsU0FBQyxHQUFELEVBQU0sRUFBTixHQUFBO1dBQ1IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFMLENBQVMsR0FBVCxFQUFjLFNBQUMsT0FBRCxHQUFBO0FBQ1osVUFBQSxDQUFBO0FBQUEsV0FBQSxZQUFBLEdBQUE7QUFBQSxRQUFBLElBQUMsQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFOLEdBQVcsT0FBUSxDQUFBLENBQUEsQ0FBbkIsQ0FBQTtBQUFBLE9BQUE7QUFDQSxNQUFBLElBQUcsVUFBSDtlQUFZLEVBQUEsQ0FBRyxPQUFRLENBQUEsR0FBQSxDQUFYLEVBQVo7T0FGWTtJQUFBLENBQWQsRUFEUTtFQUFBLENBaEJWLENBQUE7O0FBQUEsb0JBc0JBLFdBQUEsR0FBYSxTQUFDLEVBQUQsR0FBQTtXQUNYLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxDQUFTLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLE1BQUQsR0FBQTtBQUNQLFFBQUEsS0FBQyxDQUFBLElBQUQsR0FBUSxNQUFSLENBQUE7O1VBQ0EsS0FBQyxDQUFBLFNBQVU7U0FEWDs7VUFFQSxHQUFJO1NBRko7ZUFHQSxJQUFBLENBQUssTUFBTCxFQUpPO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVCxFQURXO0VBQUEsQ0F0QmIsQ0FBQTs7QUFBQSxvQkE2QkEsU0FBQSxHQUFXLFNBQUMsR0FBRCxFQUFNLEVBQU4sR0FBQTtXQUNULE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQXpCLENBQXFDLFNBQUMsT0FBRCxFQUFVLFNBQVYsR0FBQTtBQUNuQyxNQUFBLElBQUcsc0JBQUEsSUFBa0IsWUFBckI7QUFBOEIsUUFBQSxFQUFBLENBQUcsT0FBUSxDQUFBLEdBQUEsQ0FBSSxDQUFDLFFBQWhCLENBQUEsQ0FBOUI7T0FBQTttREFDQSxJQUFDLENBQUEsU0FBVSxrQkFGd0I7SUFBQSxDQUFyQyxFQURTO0VBQUEsQ0E3QlgsQ0FBQTs7QUFBQSxvQkFrQ0EsWUFBQSxHQUFjLFNBQUEsR0FBQTtXQUNaLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQXpCLENBQXFDLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLE9BQUQsRUFBUyxTQUFULEdBQUE7QUFDbkMsWUFBQSxDQUFBO0FBQUEsYUFBQSxZQUFBLEdBQUE7QUFBQSxVQUFBLEtBQUMsQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFOLEdBQVcsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQXRCLENBQUE7QUFBQSxTQUFBO3NEQUNBLEtBQUMsQ0FBQSxTQUFVLGtCQUZ3QjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDLEVBRFk7RUFBQSxDQWxDZCxDQUFBOztpQkFBQTs7SUFyRUYsQ0FBQTs7QUFBQTtBQXFIRSx1QkFBQSxHQUFBLEdBQUssTUFBTSxDQUFDLFVBQVosQ0FBQTs7QUFFYSxFQUFBLG9CQUFBLEdBQUE7QUFBSSx5REFBQSxDQUFKO0VBQUEsQ0FGYjs7QUFBQSx1QkFhQSxRQUFBLEdBQVUsU0FBQyxRQUFELEVBQVcsSUFBWCxFQUFpQixPQUFqQixFQUEwQixLQUExQixHQUFBO1dBQ1IsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkLEVBQXdCLElBQXhCLEVBQ0UsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsU0FBRCxHQUFBO2VBQ0UsU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFDLElBQUQsR0FBQTtpQkFDYixPQUFBLENBQVEsU0FBUixFQUFtQixJQUFuQixFQURhO1FBQUEsQ0FBZixFQUVDLFNBQUMsS0FBRCxHQUFBO2lCQUFXLEtBQUEsQ0FBQSxFQUFYO1FBQUEsQ0FGRCxFQURGO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FERixFQUtHLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLEtBQUQsR0FBQTtlQUFXLEtBQUEsQ0FBQSxFQUFYO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMSCxFQURRO0VBQUEsQ0FiVixDQUFBOztBQUFBLHVCQXFCQSxZQUFBLEdBQWMsU0FBQyxRQUFELEVBQVcsSUFBWCxFQUFpQixPQUFqQixFQUEwQixLQUExQixHQUFBO0FBQ1osSUFBQSxJQUFHLHNEQUFIO2FBQ0UsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsSUFBakIsRUFBdUIsRUFBdkIsRUFBMkIsU0FBQyxTQUFELEdBQUE7ZUFDekIsT0FBQSxDQUFRLFNBQVIsRUFEeUI7TUFBQSxDQUEzQixFQURGO0tBQUEsTUFBQTthQUdLLEtBQUEsQ0FBQSxFQUhMO0tBRFk7RUFBQSxDQXJCZCxDQUFBOztBQUFBLHVCQTJCQSxhQUFBLEdBQWUsU0FBQyxRQUFELEdBQUE7V0FDYixJQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsQ0FBaUI7QUFBQSxNQUFBLElBQUEsRUFBSyxlQUFMO0tBQWpCLEVBQXVDLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLGNBQUQsRUFBaUIsS0FBakIsR0FBQTtlQUNyQyxLQUFDLENBQUEsR0FBRyxDQUFDLGNBQUwsQ0FBb0IsY0FBcEIsRUFBb0MsU0FBQyxRQUFELEdBQUE7QUFDbEMsY0FBQSxHQUFBO0FBQUEsVUFBQSxHQUFBLEdBQ0k7QUFBQSxZQUFBLE9BQUEsRUFBUyxjQUFjLENBQUMsUUFBUSxDQUFDLE9BQXhCLENBQWdDLEdBQUEsR0FBTSxjQUFjLENBQUMsSUFBckQsRUFBMkQsRUFBM0QsQ0FBVDtBQUFBLFlBQ0EsZ0JBQUEsRUFBa0IsS0FBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWlCLGNBQWpCLENBRGxCO0FBQUEsWUFFQSxLQUFBLEVBQU8sY0FGUDtXQURKLENBQUE7aUJBS0UsUUFBQSxDQUFTLFFBQVQsRUFBbUIsR0FBbkIsRUFOZ0M7UUFBQSxDQUFwQyxFQURxQztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZDLEVBRGE7RUFBQSxDQTNCZixDQUFBOztvQkFBQTs7SUFySEYsQ0FBQTs7QUFBQTtBQStKRSxvQkFBQSxRQUFBLEdBQVUsSUFBVixDQUFBOztBQUFBLG9CQUNBLEtBQUEsR0FBTyxJQURQLENBQUE7O0FBQUEsb0JBRUEsS0FBQSxHQUFPLElBRlAsQ0FBQTs7QUFHYSxFQUFBLGlCQUFDLFFBQUQsRUFBVyxLQUFYLEVBQWtCLEtBQWxCLEdBQUE7QUFDWCxRQUFBLElBQUE7QUFBQSxJQUFBLE9BQThCLENBQUMsS0FBRCxFQUFRLFFBQVIsRUFBa0IsS0FBbEIsQ0FBOUIsRUFBQyxJQUFDLENBQUEsZUFBRixFQUFTLElBQUMsQ0FBQSxrQkFBVixFQUFvQixJQUFDLENBQUEsZUFBckIsQ0FEVztFQUFBLENBSGI7O0FBQUEsb0JBTUEsZ0JBQUEsR0FBa0IsU0FBQSxHQUFBO1dBQ2hCLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixJQUFDLENBQUEsS0FBbkIsRUFBMEIsSUFBQyxDQUFBLEtBQTNCLEVBRGdCO0VBQUEsQ0FObEIsQ0FBQTs7QUFBQSxvQkFTQSxzQkFBQSxHQUF3QixTQUFDLEtBQUQsR0FBQTtBQUN0QixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxFQUFFLENBQUMsSUFBSCxDQUNOO0FBQUEsTUFBQSxRQUFBLEVBQVMsR0FBVDtBQUFBLE1BQ0EsVUFBQSxFQUFZO1FBQ04sSUFBQSxNQUFNLENBQUMscUJBQXFCLENBQUMsY0FBN0IsQ0FDRjtBQUFBLFVBQUEsR0FBQSxFQUNFO0FBQUEsWUFBQSxVQUFBLEVBQVcsSUFBQyxDQUFBLEtBQVo7V0FERjtTQURFLENBRE07T0FEWjtBQUFBLE1BTUEsT0FBQSxFQUFTO1FBQ0gsSUFBQSxNQUFNLENBQUMscUJBQXFCLENBQUMsZUFBN0IsQ0FDRjtBQUFBLFVBQUEsV0FBQSxFQUFZLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQVo7U0FERSxDQURHO09BTlQ7S0FETSxDQUFSLENBQUE7V0FXQSxNQUFNLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLFFBQXZDLENBQWdELEtBQWhELEVBWnNCO0VBQUEsQ0FUeEIsQ0FBQTs7aUJBQUE7O0lBL0pGLENBQUE7O0FBc01BO0FBQUE7Ozs7O0dBdE1BOztBQUFBO0FBK01FLG1CQUFBLE1BQUEsR0FBUSxNQUFNLENBQUMsTUFBZixDQUFBOztBQUFBLG1CQUVBLElBQUEsR0FBSyxXQUZMLENBQUE7O0FBQUEsbUJBR0EsSUFBQSxHQUFLLElBSEwsQ0FBQTs7QUFBQSxtQkFJQSxjQUFBLEdBQWUsR0FKZixDQUFBOztBQUFBLG1CQUtBLGdCQUFBLEdBQ0k7QUFBQSxJQUFBLFVBQUEsRUFBVyxJQUFYO0FBQUEsSUFDQSxJQUFBLEVBQUssY0FETDtHQU5KLENBQUE7O0FBQUEsbUJBUUEsVUFBQSxHQUFXLElBUlgsQ0FBQTs7QUFBQSxtQkFTQSxZQUFBLEdBQWEsSUFUYixDQUFBOztBQUFBLG1CQVVBLFNBQUEsR0FBVSxFQVZWLENBQUE7O0FBQUEsbUJBV0EsT0FBQSxHQUFRLEtBWFIsQ0FBQTs7QUFhYSxFQUFBLGdCQUFBLEdBQUE7QUFBSSxpREFBQSxDQUFBO0FBQUEsaURBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUo7RUFBQSxDQWJiOztBQUFBLG1CQWVBLEtBQUEsR0FBTyxTQUFDLElBQUQsRUFBTSxJQUFOLEVBQVcsY0FBWCxFQUEyQixFQUEzQixHQUFBO0FBQ0wsSUFBQSxJQUFDLENBQUEsSUFBRCxHQUFXLFlBQUgsR0FBYyxJQUFkLEdBQXdCLElBQUMsQ0FBQSxJQUFqQyxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsSUFBRCxHQUFXLFlBQUgsR0FBYyxJQUFkLEdBQXdCLElBQUMsQ0FBQSxJQURqQyxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsY0FBRCxHQUFxQixzQkFBSCxHQUF3QixjQUF4QixHQUE0QyxJQUFDLENBQUEsY0FGL0QsQ0FBQTtXQUlBLElBQUMsQ0FBQSxPQUFELENBQVMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtlQUNQLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLEtBQWYsRUFBc0IsRUFBdEIsRUFBMEIsU0FBQyxVQUFELEdBQUE7QUFDeEIsVUFBQSxLQUFDLENBQUEsU0FBRCxHQUFhLEVBQWIsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLFVBQVUsQ0FBQyxRQUEzQixDQURBLENBQUE7QUFBQSxVQUVBLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQXJCLENBQXlCO0FBQUEsWUFBQSxXQUFBLEVBQVksS0FBQyxDQUFBLFNBQWI7V0FBekIsQ0FGQSxDQUFBO2lCQUdBLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLFVBQVUsQ0FBQyxRQUExQixFQUFvQyxLQUFDLENBQUEsSUFBckMsRUFBMkMsS0FBQyxDQUFBLElBQTVDLEVBQWtELFNBQUMsTUFBRCxHQUFBO0FBQ2hELFlBQUEsSUFBQSxDQUFLLFlBQUEsR0FBZSxVQUFVLENBQUMsUUFBL0IsQ0FBQSxDQUFBO0FBQUEsWUFDQSxLQUFDLENBQUEsT0FBRCxHQUFXLEtBRFgsQ0FBQTtBQUFBLFlBRUEsS0FBQyxDQUFBLFVBQUQsR0FBYyxVQUZkLENBQUE7bUJBR0EsS0FBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsVUFBVSxDQUFDLFFBQTFCLEVBQW9DLEtBQUMsQ0FBQSxTQUFyQyxFQUpnRDtVQUFBLENBQWxELEVBSndCO1FBQUEsQ0FBMUIsRUFETztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQsRUFMSztFQUFBLENBZlAsQ0FBQTs7QUFBQSxtQkErQkEsT0FBQSxHQUFTLFNBQUMsUUFBRCxHQUFBO1dBQ1AsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBckIsQ0FBeUIsV0FBekIsRUFBc0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ3BDLFlBQUEsc0JBQUE7QUFBQSxRQUFBLElBQUEsQ0FBSyxTQUFMLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQSxDQUFLLE1BQUwsQ0FEQSxDQUFBO0FBQUEsUUFFQSxLQUFDLENBQUEsU0FBRCxHQUFhLE1BQU0sQ0FBQyxTQUZwQixDQUFBO0FBR0E7QUFBQSxjQUNLLFNBQUMsQ0FBRCxHQUFBO0FBQ0QsY0FBQSxLQUFBO0FBQUE7QUFDRSxZQUFBLEtBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixDQUFuQixDQUFBLENBQUE7QUFBQSxZQUNBLEtBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixDQUFoQixDQURBLENBQUE7bUJBRUEsSUFBQSxDQUFLLFNBQUEsR0FBWSxDQUFqQixFQUhGO1dBQUEsY0FBQTtBQUtFLFlBREksY0FDSixDQUFBO21CQUFBLElBQUEsQ0FBTSxpQkFBQSxHQUFqQixDQUFpQixHQUFxQixXQUFyQixHQUFqQixLQUFXLEVBTEY7V0FEQztRQUFBLENBREw7QUFBQSxhQUFBLDJDQUFBO3VCQUFBO0FBQ0UsY0FBSSxFQUFKLENBREY7QUFBQSxTQUhBO2dEQVdBLG9CQVpvQztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRDLEVBRE87RUFBQSxDQS9CVCxDQUFBOztBQUFBLG1CQThDQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FGUDtFQUFBLENBOUNOLENBQUE7O0FBQUEsbUJBa0RBLFVBQUEsR0FBWSxTQUFDLFdBQUQsR0FBQTtXQUNWLElBQUEsQ0FBSyxvQ0FBQSxHQUF1QyxXQUFXLENBQUMsUUFBeEQsRUFDQSxDQUFBLFVBQUEsR0FBZSxXQUFXLENBQUMsSUFBSSxDQUFDLFVBRGhDLEVBRFU7RUFBQSxDQWxEWixDQUFBOztBQUFBLG1CQXNEQSxTQUFBLEdBQVcsU0FBQyxjQUFELEVBQWlCLFVBQWpCLEdBQUE7QUFDVCxJQUFBLElBQXNFLFVBQUEsR0FBYSxDQUFuRjtBQUFBLGFBQU8sSUFBQSxDQUFLLG1CQUFBLEdBQXNCLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQXBELENBQVAsQ0FBQTtLQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsY0FBRCxHQUFrQixjQURsQixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFwQixDQUFnQyxJQUFDLENBQUEsU0FBakMsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsU0FBUyxDQUFDLGFBQWEsQ0FBQyxXQUF6QixDQUFxQyxJQUFDLENBQUEsY0FBdEMsQ0FIQSxDQUFBO1dBSUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxTQUFTLENBQUMsV0FBZixDQUEyQixJQUFDLENBQUEsVUFBNUIsRUFMUztFQUFBLENBdERYLENBQUE7O0FBQUEsbUJBK0RBLGNBQUEsR0FBZ0IsU0FBQyxLQUFELEdBQUE7V0FDZCxJQUFBLENBQUssS0FBTCxFQURjO0VBQUEsQ0EvRGhCLENBQUE7O0FBQUEsbUJBa0VBLFNBQUEsR0FBVyxTQUFDLFVBQUQsR0FBQTtBQUVULElBQUEsSUFBQSxDQUFLLG1DQUFBLEdBQXNDLFVBQVUsQ0FBQyxRQUF0RCxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsZUFBRCxDQUFpQixVQUFVLENBQUMsUUFBNUIsRUFBc0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsSUFBRCxHQUFBO2VBQ3BDLEtBQUMsQ0FBQSxZQUFELENBQWMsSUFBZCxFQUNFLFNBQUMsU0FBRCxFQUFZLFVBQVosR0FBQTtpQkFDRSxLQUFDLENBQUEsaUJBQUQsQ0FBbUIsVUFBVSxDQUFDLFFBQTlCLEVBQXdDLFNBQXhDLEVBQW1ELFVBQW5ELEVBQStELElBQUksQ0FBQyxTQUFwRSxFQURGO1FBQUEsQ0FERixFQUdFLFNBQUMsS0FBRCxHQUFBO2lCQUNFLEtBQUMsQ0FBQSxXQUFELENBQWEsVUFBVSxDQUFDLFFBQXhCLEVBQWtDLEdBQWxDLEVBQXVDLElBQUksQ0FBQyxTQUE1QyxFQURGO1FBQUEsQ0FIRixFQURvQztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRDLEVBSFM7RUFBQSxDQWxFWCxDQUFBOztBQUFBLG1CQStFQSxrQkFBQSxHQUFvQixTQUFDLE1BQUQsR0FBQTtBQUNsQixRQUFBLGVBQUE7QUFBQSxJQUFBLE1BQUEsR0FBYSxJQUFBLFdBQUEsQ0FBWSxNQUFNLENBQUMsTUFBbkIsQ0FBYixDQUFBO0FBQUEsSUFDQSxJQUFBLEdBQVcsSUFBQSxVQUFBLENBQVcsTUFBWCxDQURYLENBQUE7QUFBQSxJQUVBLENBQUEsR0FBSSxDQUZKLENBQUE7QUFJQSxXQUFNLENBQUEsR0FBSSxNQUFNLENBQUMsTUFBakIsR0FBQTtBQUNFLE1BQUEsSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVLE1BQU0sQ0FBQyxVQUFQLENBQWtCLENBQWxCLENBQVYsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxFQURBLENBREY7SUFBQSxDQUpBO1dBT0EsS0FSa0I7RUFBQSxDQS9FcEIsQ0FBQTs7QUFBQSxtQkF5RkEsbUJBQUEsR0FBcUIsU0FBQyxNQUFELEdBQUE7QUFDbkIsUUFBQSxNQUFBO0FBQUEsSUFBQSxHQUFBLEdBQVUsSUFBQSxVQUFBLENBQVcsTUFBWCxDQUFWLENBQUE7QUFBQSxJQUNBLENBQUEsR0FBSSxDQURKLENBQUE7QUFHQSxXQUFNLENBQUEsR0FBSSxTQUFTLENBQUMsTUFBcEIsR0FBQTtBQUNFLE1BQUEsR0FBQSxJQUFPLE1BQU0sQ0FBQyxZQUFQLENBQW9CLFNBQVUsQ0FBQSxDQUFBLENBQTlCLENBQVAsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxFQURBLENBREY7SUFBQSxDQUhBO1dBTUEsSUFQbUI7RUFBQSxDQXpGckIsQ0FBQTs7QUFBQSxtQkFrR0EsaUJBQUEsR0FBbUIsU0FBQyxRQUFELEVBQVcsU0FBWCxFQUFzQixJQUF0QixFQUE0QixTQUE1QixHQUFBO0FBQ2pCLFFBQUEsOERBQUE7QUFBQSxJQUFBLFdBQUEsR0FBYyxDQUFLLElBQUksQ0FBQyxJQUFMLEtBQWEsRUFBakIsR0FBMEIsWUFBMUIsR0FBNEMsSUFBSSxDQUFDLElBQWxELENBQWQsQ0FBQTtBQUFBLElBQ0EsYUFBQSxHQUFnQixJQUFJLENBQUMsSUFEckIsQ0FBQTtBQUFBLElBRUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixtQ0FBQSxHQUFzQyxJQUFJLENBQUMsSUFBM0MsR0FBa0QsaUJBQWxELEdBQXNFLFdBQXRFLEdBQXFGLENBQUksU0FBSCxHQUFrQiwwQkFBbEIsR0FBa0QsRUFBbkQsQ0FBckYsR0FBK0ksTUFBbkssQ0FGVCxDQUFBO0FBQUEsSUFHQSxZQUFBLEdBQW1CLElBQUEsV0FBQSxDQUFZLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLElBQUksQ0FBQyxJQUFyQyxDQUhuQixDQUFBO0FBQUEsSUFJQSxJQUFBLEdBQVcsSUFBQSxVQUFBLENBQVcsWUFBWCxDQUpYLENBQUE7QUFBQSxJQUtBLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBVCxFQUFpQixDQUFqQixDQUxBLENBQUE7QUFBQSxJQU9BLE1BQUEsR0FBUyxHQUFBLENBQUEsVUFQVCxDQUFBO0FBQUEsSUFRQSxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxFQUFELEdBQUE7QUFDZCxRQUFBLElBQUksQ0FBQyxHQUFMLENBQWEsSUFBQSxVQUFBLENBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFyQixDQUFiLEVBQTJDLE1BQU0sQ0FBQyxVQUFsRCxDQUFBLENBQUE7ZUFDQSxLQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxRQUFkLEVBQXdCLFlBQXhCLEVBQXNDLFNBQUMsU0FBRCxHQUFBO0FBQ3BDLFVBQUEsSUFBQSxDQUFLLFNBQUwsQ0FBQSxDQUFBO2lCQUVBLEtBQUMsQ0FBQSxHQUFELENBQUssUUFBTCxFQUFlLFNBQWYsRUFIb0M7UUFBQSxDQUF0QyxFQUZjO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FSaEIsQ0FBQTtBQUFBLElBY0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsS0FBRCxHQUFBO2VBQ2YsS0FBQyxDQUFBLEdBQUQsQ0FBSyxRQUFMLEVBQWUsU0FBZixFQURlO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FkakIsQ0FBQTtXQWdCQSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsSUFBekIsRUFqQmlCO0VBQUEsQ0FsR25CLENBQUE7O0FBQUEsbUJBK0hBLGVBQUEsR0FBaUIsU0FBQyxRQUFELEVBQVcsRUFBWCxHQUFBO1dBQ2YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsUUFBYixFQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxRQUFELEdBQUE7QUFDckIsWUFBQSx3Q0FBQTtBQUFBLFFBQUEsSUFBQSxDQUFLLE1BQUwsRUFBYSxRQUFiLENBQUEsQ0FBQTtBQUFBLFFBR0EsSUFBQSxHQUFPLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixRQUFRLENBQUMsSUFBOUIsQ0FIUCxDQUFBO0FBQUEsUUFJQSxJQUFBLENBQUssSUFBTCxDQUpBLENBQUE7QUFNQSxRQUFBLElBQUcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLENBQUEsS0FBMEIsQ0FBN0I7QUFDRSxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUssUUFBTCxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUZGO1NBTkE7QUFBQSxRQVVBLFNBQUEsR0FBWSxLQVZaLENBQUE7QUFXQSxRQUFBLElBQW9CLElBQUksQ0FBQyxPQUFMLENBQWEsd0JBQUEsS0FBOEIsQ0FBQSxDQUEzQyxDQUFwQjtBQUFBLFVBQUEsU0FBQSxHQUFZLElBQVosQ0FBQTtTQVhBO0FBQUEsUUFhQSxNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLEVBQWtCLENBQWxCLENBYlQsQ0FBQTtBQWVBLFFBQUEsSUFBdUIsTUFBQSxHQUFTLENBQWhDO0FBQUEsaUJBQU8sR0FBQSxDQUFJLFFBQUosQ0FBUCxDQUFBO1NBZkE7QUFBQSxRQWlCQSxHQUFBLEdBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBQWtCLE1BQWxCLENBakJOLENBQUE7QUFrQkEsUUFBQSxJQUFPLFdBQVA7QUFDRSxVQUFBLFVBQUEsQ0FBVyxRQUFYLEVBQXFCLEdBQXJCLEVBQTBCLFNBQTFCLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBRkY7U0FsQkE7QUFBQSxRQXNCQSxJQUFBLEdBQ0U7QUFBQSxVQUFBLEdBQUEsRUFBSyxHQUFMO0FBQUEsVUFDQSxTQUFBLEVBQVUsU0FEVjtTQXZCRixDQUFBO0FBQUEsUUF5QkEsSUFBSSxDQUFDLE9BQUwsdURBQTZDLENBQUEsQ0FBQSxVQXpCN0MsQ0FBQTswQ0EyQkEsR0FBSSxlQTVCaUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixFQURlO0VBQUEsQ0EvSGpCLENBQUE7O0FBQUEsbUJBOEpBLEdBQUEsR0FBSyxTQUFDLFFBQUQsRUFBVyxTQUFYLEdBQUE7QUFJSCxJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixRQUFuQixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixRQUFoQixDQURBLENBQUE7QUFBQSxJQUVBLElBQUEsQ0FBSyxTQUFBLEdBQVksUUFBakIsQ0FGQSxDQUFBO1dBR0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUEzQixFQUFxQyxJQUFDLENBQUEsU0FBdEMsRUFQRztFQUFBLENBOUpMLENBQUE7O0FBQUEsbUJBdUtBLFdBQUEsR0FBYSxTQUFDLFFBQUQsRUFBVyxTQUFYLEVBQXNCLFNBQXRCLEdBQUE7QUFDWCxRQUFBLDREQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxDQUFOO0tBQVAsQ0FBQTtBQUFBLElBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxnQ0FBYixDQURBLENBQUE7QUFBQSxJQUVBLE9BQU8sQ0FBQyxJQUFSLENBQWEsOEJBQUEsR0FBaUMsSUFBOUMsQ0FGQSxDQUFBO0FBQUEsSUFHQSxXQUFBLEdBQWMsWUFIZCxDQUFBO0FBQUEsSUFJQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxJQUpyQixDQUFBO0FBQUEsSUFLQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGtCQUFELENBQW9CLFdBQUEsR0FBYyxTQUFkLEdBQTBCLDhCQUExQixHQUEyRCxJQUFJLENBQUMsSUFBaEUsR0FBdUUsaUJBQXZFLEdBQTJGLFdBQTNGLEdBQTBHLENBQUksU0FBSCxHQUFrQiwwQkFBbEIsR0FBa0QsRUFBbkQsQ0FBMUcsR0FBb0ssTUFBeEwsQ0FMVCxDQUFBO0FBQUEsSUFNQSxPQUFPLENBQUMsSUFBUixDQUFhLDZDQUFiLENBTkEsQ0FBQTtBQUFBLElBT0EsWUFBQSxHQUFtQixJQUFBLFdBQUEsQ0FBWSxNQUFNLENBQUMsVUFBUCxHQUFvQixJQUFJLENBQUMsSUFBckMsQ0FQbkIsQ0FBQTtBQUFBLElBUUEsSUFBQSxHQUFXLElBQUEsVUFBQSxDQUFXLFlBQVgsQ0FSWCxDQUFBO0FBQUEsSUFTQSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsRUFBaUIsQ0FBakIsQ0FUQSxDQUFBO0FBQUEsSUFVQSxPQUFPLENBQUMsSUFBUixDQUFhLDJDQUFiLENBVkEsQ0FBQTtXQVdBLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLFFBQWQsRUFBd0IsWUFBeEIsRUFBc0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsU0FBRCxHQUFBO0FBQ3BDLFFBQUEsSUFBQSxDQUFLLE9BQUwsRUFBYyxTQUFkLENBQUEsQ0FBQTtlQUNBLEtBQUMsQ0FBQSxHQUFELENBQUssUUFBTCxFQUFlLFNBQWYsRUFGb0M7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QyxFQVpXO0VBQUEsQ0F2S2IsQ0FBQTs7Z0JBQUE7O0lBL01GLENBQUE7O0FBQUE7QUF3WUUsd0JBQUEsTUFBQSxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQVEsa0NBQVI7QUFBQSxJQUNBLFlBQUEsRUFBYyxrQ0FEZDtHQURGLENBQUE7O0FBQUEsd0JBSUEsSUFBQSxHQUFLLElBSkwsQ0FBQTs7QUFBQSx3QkFLQSxNQUFBLEdBQVEsSUFMUixDQUFBOztBQUFBLHdCQU1BLEdBQUEsR0FBSyxJQU5MLENBQUE7O0FBQUEsd0JBT0EsT0FBQSxHQUFTLElBUFQsQ0FBQTs7QUFBQSx3QkFRQSxFQUFBLEdBQUksSUFSSixDQUFBOztBQUFBLHdCQVNBLE1BQUEsR0FBUSxJQVRSLENBQUE7O0FBV2EsRUFBQSxxQkFBQSxHQUFBO0FBQ1gsNkNBQUEsQ0FBQTtBQUFBLHVDQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQVgsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLEVBQUQsR0FBTSxHQUFBLENBQUEsVUFETixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLEdBQUEsQ0FBQSxNQUZWLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixHQUFrQixNQUFNLENBQUMsT0FBTyxDQUFDLEVBSGpDLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixHQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsS0FBa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUE3QixHQUEwQyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQWxELEdBQW9FLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFKN0YsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLEdBQXNCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixLQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQS9CLEdBQTRDLFdBQTVDLEdBQTZELEtBTGhGLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxHQUFELEdBQVcsSUFBQSxHQUFBLENBQUksSUFBQyxDQUFBLE1BQUwsQ0FOWCxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxNQUFSLENBUGQsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQVRiLENBQUE7QUFBQSxJQVVBLElBQUMsQ0FBQSxJQUFELEdBQVEsS0FWUixDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFYakIsQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQVpBLENBRFc7RUFBQSxDQVhiOztBQUFBLHdCQTBCQSxJQUFBLEdBQU0sU0FBQSxHQUFBLENBMUJOLENBQUE7O0FBQUEsd0JBNkJBLFNBQUEsR0FBVyxTQUFDLEVBQUQsR0FBQTtXQUNULE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBbEIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFwQyxFQURTO0VBQUEsQ0E3QlgsQ0FBQTs7QUFBQSx3QkFnQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtXQUNQLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQWxCLENBQXlCLFlBQXpCLEVBQ0U7QUFBQSxNQUFBLEVBQUEsRUFBSSxTQUFKO0FBQUEsTUFDQSxNQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTSxHQUFOO0FBQUEsUUFDQSxNQUFBLEVBQU8sR0FEUDtPQUZGO0tBREYsRUFLQSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxHQUFELEdBQUE7ZUFDRSxLQUFDLENBQUEsU0FBRCxHQUFhLElBRGY7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxBLEVBRE87RUFBQSxDQWhDVCxDQUFBOztxQkFBQTs7SUF4WUYsQ0FBQTs7QUFBQSxNQWtiTSxDQUFDLE9BQVAsR0FBaUIsV0FsYmpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMgc2VydmVyID0gcmVxdWlyZSAnLi90Y3Atc2VydmVyLmpzJ1xuXG4jIGdldEdsb2JhbCA9IC0+XG4jICAgX2dldEdsb2JhbCA9IC0+XG4jICAgICB0aGlzXG5cbiMgICBfZ2V0R2xvYmFsKClcblxuIyByb290ID0gZ2V0R2xvYmFsKClcblxuQXBwbGljYXRpb24gPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuI2FwcCA9IG5ldyBsaWIuQXBwbGljYXRpb25cbmNsYXNzIEFwcEJhY2tncm91bmQgZXh0ZW5kcyBBcHBsaWNhdGlvblxuICAgIHJldGFpbmVkRGlyczp7fVxuICAgIGluaXQ6ICgpIC0+XG4gICAgICAgIEBTdG9yYWdlLnJldHJpZXZlQWxsICgpID0+XG4gICAgICAgICAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcbiAgICAgICAgICAgIEBtYXBzID0gQGRhdGEubWFwc1xuXG4gICAgICAgIEBTZXJ2ZXIuZ2V0TG9jYWxGaWxlID0gQGdldExvY2FsRmlsZVxuICAgICAgICBAU3RvcmFnZS5vbkNoYW5nZWQgJ3Jlc291cmNlTWFwJywgKG9iaikgPT5cbiAgICAgICAgICAgIEBNU0cuRXh0IG9ialxuXG4gICAgICAgIEBMSVNURU4uRXh0ICdyZXNvdXJjZXMnLCAocmVzdWx0KSA9PlxuICAgICAgICAgICAgQFN0b3JhZ2Uuc2F2ZSAnY3VycmVudFJlc291cmNlcycsIHJlc3VsdFxuXG4gICAgICAgIEBMSVNURU4uTG9jYWwgJ3N0YXJ0U2VydmVyJywgKHJlc3VsdHMpID0+XG4gICAgICAgICAgICBAU2VydmVyLnN0YXJ0IHJlc3VsdHMuaG9zdCwgcmVzdWx0cy5wb3J0XG5cbiAgICAgICAgQExJU1RFTi5Mb2NhbCAnc3RvcFNlcnZlcicsICgpID0+XG4gICAgICAgICAgICBAU2VydmVyLnN0b3AoKVxuXG4gICAgICAgIEBzdGFydFNlcnZlcigpXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgY2hyb21lLmFwcC5ydW50aW1lLm9uTGF1bmNoZWQuYWRkTGlzdGVuZXIgQG9wZW5BcHBcbiAgICAgICAgICAgIGNocm9tZS5hcHAucnVudGltZS5vblJlc3RhcnRlZC5hZGRMaXN0ZW5lciBAY2xlYW5VcFxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgICAgc2hvdyBlcnJvclxuXG5cbiAgICBjbGVhblVwOiAoKSAtPlxuICAgICAgICBAc3RvcFNlcnZlcigpXG5cbiAgICBnZXRMb2NhbEZpbGU6IChpbmZvLCBjYiwgZXJyb3IpID0+XG5cbiAgICAgICAgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmwsIHN1Y2Nlc3MsXG4gICAgICAgICAgICAoZXJyb3IpID0+XG4gICAgICAgICAgICAgICAgQGZpbmRGaWxlRm9yUGF0aCBpbmZvLCBjYiwgZXJyb3JcblxuICAgIGZpbmRGaWxlRm9yUGF0aDogKGluZm8sIGNiLCBlcnJvcikgPT5cbiAgICAgICAgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmwsIGNiLCBlcnJvciwgaW5mby5yZWZlcmVyXG5cbiAgICBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nOiAoX3VybCwgY2IsIGVycm9yLCByZWZlcmVyKSA9PlxuICAgICAgICB1cmwgPSBfdXJsLnJlcGxhY2UgLy4qP3NscmVkaXJcXD0vLCAnJ1xuXG4gICAgICAgIG1hdGNoID0gaXRlbSBmb3IgaXRlbSBpbiBAbWFwcyB3aGVuIHVybC5tYXRjaChuZXcgUmVnRXhwKGl0ZW0udXJsKSwgaXRlbS5yZWdleFJlcGwpPyBhbmQgaXRlbS51cmw/IGFuZCBub3QgbWF0Y2g/XG5cbiAgICAgICAgaWYgbWF0Y2g/XG4gICAgICAgICAgICBpZiByZWZlcmVyP1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLm1hdGNoKC8uKlxcL1xcLy4qP1xcLyguKikvKT9bMV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWF0Y2gudXJsKSwgbWF0Y2gucmVnZXhSZXBsXG4gICAgICAgICAgICBkaXIgPSBAU3RvcmFnZS5kYXRhLmRpcmVjdG9yaWVzW21hdGNoLmRpcmVjdG9yeV1cblxuICAgICAgICAgICAgaWYgbm90IGRpcj8gdGhlbiByZXR1cm4gZXJyICdubyBtYXRjaCdcblxuICAgICAgICAgICAgaWYgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0/XG4gICAgICAgICAgICAgICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAgICAgICAgICAgICAgIEBGUy5yZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAgICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICAgICAgICAgICAgICAgIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiAgICAgICAgICAgICAgICAgICAgQEZTLnJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnJvcigpXG5cblxuICAgIHN0YXJ0U2VydmVyOiAoKSAtPlxuICAgICAgICBAU2VydmVyLnN0YXJ0IG51bGwsbnVsbCxudWxsLCAoKSA9PlxuICAgICAgICAgICAgQE1TRy5Mb2NhbCAnc2VydmVyJzpAU2VydmVyXG5cbiAgICBzdG9wU2VydmVyOiAoKSAtPlxuICAgICAgICBAU2VydmVyLnN0b3BcbiAgICAgICAgQE1TRy5Mb2NhbCAnc2VydmVyJzpudWxsXG5cbmFwcCA9IG5ldyBBcHBCYWNrZ3JvdW5kXG5cblxuXG4jIyNcbiB2YXIgd2hpdGVsaXN0ZWRJZCA9ICdwbWdubmJkZm1tcGRrZ2FhbWtkaWlwZmdqYnBnaW9mYyc7XG4gIHZhciBhZGREaXJlY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLCB7XG4gICAgICAgIGlkOiBcIm1haW53aW5cIixcbiAgICAgICAgYm91bmRzOiB7XG4gICAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICAgIGhlaWdodDogNTBcbiAgICAgICAgfSxcbiAgICB9LCBmdW5jdGlvbih3aW4pIHtcbiAgICAgICAgbWFpbldpbiA9IHdpbjtcbiAgICB9KTtcbiAgfVxuXG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICAvLyBpZiAoc2VuZGVyLmlkICE9IHdoaXRlbGlzdGVkSWQpXG4gICAgICAgICAgLy8gICByZXR1cm4gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJHb3QgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIHNob3cocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzLnB1c2gocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIC8vIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeShyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQsIGZ1bmN0aW9uKGRpcmVjdG9yeUVudHJ5KSB7XG4gICAgICAgICAgICAvLyAgICAgc2hvdyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIGlmIChzZW5kZXIuaWQgIT0gd2hpdGVsaXN0ZWRJZCkge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG4gICAgICAgICAgICByZXR1cm47ICAvLyBkb24ndCBhbGxvdyB0aGlzIGV4dGVuc2lvbiBhY2Nlc3NcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3BlbkRpcmVjdG9yeSkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BlbmluZyBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgYWRkRGlyZWN0b3J5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBzb2NrZXQuY3JlYXRlKFwidGNwXCIsIHt9LCBmdW5jdGlvbihfc29ja2V0SW5mbykge1xuICAgICAgICBzb2NrZXRJbmZvID0gX3NvY2tldEluZm87XG4gICAgICAgIHNvY2tldC5saXN0ZW4oc29ja2V0SW5mby5zb2NrZXRJZCwgXCIxMjcuMC4wLjFcIiwgMzMzMzMsIDUwLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgc2hvdyhcIkxJU1RFTklORzpcIiwgcmVzdWx0KTtcbiAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgc3RvcFNvY2tldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzb2NrZXQuZGVzdHJveShzb2NrZXRJbmZvLnNvY2tldElkKTtcbiAgICB9XG5cblxuIyMjXG5cbiMjI1xub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdGFydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIik7XG4gIHZhciBzdG9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9wXCIpO1xuICB2YXIgaG9zdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImhvc3RzXCIpO1xuICB2YXIgcG9ydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9ydFwiKTtcbiAgdmFyIGRpcmVjdG9yeSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGlyZWN0b3J5XCIpO1xuXG4gIHZhciBzb2NrZXQgPSBjaHJvbWUuc29ja2V0O1xuICB2YXIgc29ja2V0SW5mbztcbiAgdmFyIGZpbGVzTWFwID0ge307XG5cbiAgdmFyIHJvb3REaXI7XG4gIHZhciBwb3J0LCBleHRQb3J0O1xuICB2YXIgZGlyZWN0b3JpZXMgPSBbXTtcblxuICB2YXIgc3RyaW5nVG9VaW50OEFycmF5ID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgICAgdmlld1tpXSA9IHN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXR1cm4gdmlldztcbiAgfTtcblxuICB2YXIgYXJyYXlCdWZmZXJUb1N0cmluZyA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgIHZhciBzdHIgPSAnJztcbiAgICB2YXIgdUFycmF5VmFsID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBmb3IodmFyIHMgPSAwOyBzIDwgdUFycmF5VmFsLmxlbmd0aDsgcysrKSB7XG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xuICB9O1xuXG4gIHZhciBsb2dUb1NjcmVlbiA9IGZ1bmN0aW9uKGxvZykge1xuICAgIGxvZ2dlci50ZXh0Q29udGVudCArPSBsb2cgKyBcIlxcblwiO1xuICB9XG5cbiAgdmFyIHdyaXRlRXJyb3JSZXNwb25zZSA9IGZ1bmN0aW9uKHNvY2tldElkLCBlcnJvckNvZGUsIGtlZXBBbGl2ZSkge1xuICAgIHZhciBmaWxlID0geyBzaXplOiAwIH07XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogYmVnaW4uLi4gXCIpO1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGUpO1xuICAgIHZhciBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiOyAvLyhmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgdmFyIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemU7XG4gICAgdmFyIGhlYWRlciA9IHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIFwiICsgZXJyb3JDb2RlICsgXCIgTm90IEZvdW5kXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgga2VlcEFsaXZlID8gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgOiBcIlwiKSArIFwiXFxuXFxuXCIpO1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyBoZWFkZXIuLi5cIik7XG4gICAgdmFyIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSk7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQoaGVhZGVyLCAwKTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgdmlldy4uLlwiKTtcbiAgICBzb2NrZXQud3JpdGUoc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgZnVuY3Rpb24od3JpdGVJbmZvKSB7XG4gICAgICBzaG93KFwiV1JJVEVcIiwgd3JpdGVJbmZvKTtcbiAgICAgIGlmIChrZWVwQWxpdmUpIHtcbiAgICAgICAgcmVhZEZyb21Tb2NrZXQoc29ja2V0SWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SWQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OmZpbGVyZWFkZXI6OiBlbmQgb25sb2FkLi4uXCIpO1xuXG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogZW5kLi4uXCIpO1xuICB9O1xuXG4gIHZhciB3cml0ZTIwMFJlc3BvbnNlID0gZnVuY3Rpb24oc29ja2V0SWQsIGZpbGUsIGtlZXBBbGl2ZSkge1xuICAgIHZhciBjb250ZW50VHlwZSA9IChmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgdmFyIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemU7XG4gICAgdmFyIGhlYWRlciA9IHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIDIwMCBPS1xcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoIGtlZXBBbGl2ZSA/IFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIDogXCJcIikgKyBcIlxcblxcblwiKTtcbiAgICB2YXIgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldChoZWFkZXIsIDApO1xuXG4gICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoKTtcbiAgICAgICBzb2NrZXQud3JpdGUoc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgZnVuY3Rpb24od3JpdGVJbmZvKSB7XG4gICAgICAgICBzaG93KFwiV1JJVEVcIiwgd3JpdGVJbmZvKTtcbiAgICAgICAgIGlmIChrZWVwQWxpdmUpIHtcbiAgICAgICAgICAgcmVhZEZyb21Tb2NrZXQoc29ja2V0SWQpO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SWQpO1xuICAgICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmaWxlUmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGZpbGUpO1xuICB9O1xuXG4gIHZhciBvbkFjY2VwdCA9IGZ1bmN0aW9uKGFjY2VwdEluZm8pIHtcbiAgICBzaG93KFwiQUNDRVBUXCIsIGFjY2VwdEluZm8pXG4gICAgcmVhZEZyb21Tb2NrZXQoYWNjZXB0SW5mby5zb2NrZXRJZCk7XG4gIH07XG5cbiAgdmFyIHJlYWRGcm9tU29ja2V0ID0gZnVuY3Rpb24oc29ja2V0SWQpIHtcbiAgICAvLyAgUmVhZCBpbiB0aGUgZGF0YVxuICAgIHNvY2tldC5yZWFkKHNvY2tldElkLCBmdW5jdGlvbihyZWFkSW5mbykge1xuICAgICAgc2hvdyhcIlJFQURcIiwgcmVhZEluZm8pO1xuICAgICAgLy8gUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICB2YXIgZGF0YSA9IGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSk7XG4gICAgICBpZihkYXRhLmluZGV4T2YoXCJHRVQgXCIpID09IDApIHtcbiAgICAgICAgdmFyIGtlZXBBbGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoZGF0YS5pbmRleE9mKFwiQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiKSAhPSAtMSkge1xuICAgICAgICAgIGtlZXBBbGl2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBjYW4gb25seSBkZWFsIHdpdGggR0VUIHJlcXVlc3RzXG4gICAgICAgIHZhciB1cmlFbmQgPSAgZGF0YS5pbmRleE9mKFwiIFwiLCA0KTtcbiAgICAgICAgaWYodXJpRW5kIDwgMCkgeyAgIHJldHVybjsgfVxuICAgICAgICB2YXIgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKTtcbiAgICAgICAgLy8gc3RyaXAgcXllcnkgc3RyaW5nXG4gICAgICAgIHZhciBxID0gdXJpLmluZGV4T2YoXCI/XCIpO1xuICAgICAgICBpZiAocSAhPSAtMSkge1xuICAgICAgICAgIHVyaSA9IHVyaS5zdWJzdHJpbmcoMCwgcSk7XG4gICAgICAgIH1cblxuICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkoZGlyZWN0b3JpZXNbMF0pXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICAgKGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihkaXJlY3RvcnlFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICBzaG93KGRpcmVjdG9yeUVudHJ5KTtcbiAgICAgICAgICAgICAgICAgICAgc2hvdyh1cmkpO1xuICAgICAgICAgICAgICAgICAgICBkaXJlY3RvcnlFbnRyeS5nZXRGaWxlKCdteU5ld0FwcERFVi5yZXNvdXJjZS9pbmRleC5qcycsIHt9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93KGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd3JpdGUyMDBSZXNwb25zZShzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKTtcbiAgICAgICAgICAgICAgICAgICAgfSxmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93KGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9KSh1cmkpXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gdmFyIGZpbGUgPVxuICAgICAgICAvLyBpZighIWZpbGUgPT0gZmFsc2UpIHtcbiAgICAgICAgLy8gICBjb25zb2xlLndhcm4oXCJGaWxlIGRvZXMgbm90IGV4aXN0Li4uXCIgKyB1cmkpO1xuICAgICAgICAvLyAgIHdyaXRlRXJyb3JSZXNwb25zZShzb2NrZXRJZCwgNDA0LCBrZWVwQWxpdmUpO1xuICAgICAgICAvLyAgIHJldHVybjtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBsb2dUb1NjcmVlbihcIkdFVCAyMDAgXCIgKyB1cmkpO1xuICAgICAgICAvLyB3cml0ZTIwMFJlc3BvbnNlKHNvY2tldElkLCBmaWxlLCBrZWVwQWxpdmUpO1xuICAgICAgLy8gfVxuICAgICAgLy8gZWxzZSB7XG4gICAgICAgIC8vIFRocm93IGFuIGVycm9yXG4gICAgICAgIC8vIHNvY2tldC5kZXN0cm95KHNvY2tldElkKTtcbiAgICAgIC8vIH1cblxuICB9O1xufSk7XG59XG5cblxuICB2YXIgd2hpdGVsaXN0ZWRJZCA9ICdwbWdubmJkZm1tcGRrZ2FhbWtkaWlwZmdqYnBnaW9mYyc7XG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIGlmIChzZW5kZXIuaWQgIT0gd2hpdGVsaXN0ZWRJZCkge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG4gICAgICAgICAgICByZXR1cm47ICAvLyBkb24ndCBhbGxvdyB0aGlzIGV4dGVuc2lvbiBhY2Nlc3NcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3BlbkRpcmVjdG9yeSkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BlbmluZyBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgYWRkRGlyZWN0b3J5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICAvLyBpZiAoc2VuZGVyLmlkICE9IHdoaXRlbGlzdGVkSWQpXG4gICAgICAgICAgLy8gICByZXR1cm4gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJHb3QgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIHNob3cocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzLnB1c2gocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIC8vIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeShyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQsIGZ1bmN0aW9uKGRpcmVjdG9yeUVudHJ5KSB7XG4gICAgICAgICAgICAvLyAgICAgc2hvdyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHNvY2tldC5jcmVhdGUoXCJ0Y3BcIiwge30sIGZ1bmN0aW9uKF9zb2NrZXRJbmZvKSB7XG4gICAgICAgIHNvY2tldEluZm8gPSBfc29ja2V0SW5mbztcbiAgICAgICAgc29ja2V0Lmxpc3Rlbihzb2NrZXRJbmZvLnNvY2tldElkLCBcIjEyNy4wLjAuMVwiLCAzMzMzMywgNTAsIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBzaG93KFwiTElTVEVOSU5HOlwiLCByZXN1bHQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBzdG9wU29ja2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldEluZm8uc29ja2V0SWQpO1xuICAgIH1cblxuICB2YXIgYWRkRGlyZWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJywge1xuICAgICAgICBpZDogXCJtYWlud2luXCIsXG4gICAgICAgIGJvdW5kczoge1xuICAgICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgICBoZWlnaHQ6IDUwXG4gICAgICAgIH0sXG4gICAgfSwgZnVuY3Rpb24od2luKSB7XG4gICAgICAgIG1haW5XaW4gPSB3aW47XG4gICAgfSk7XG4gIH1cblxufTtcbiMjI1xuXG4iLCIjIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxNzQyMDkzXG4oKCkgLT5cbiAgbWV0aG9kcyA9IFtcbiAgICAnYXNzZXJ0JywgJ2NsZWFyJywgJ2NvdW50JywgJ2RlYnVnJywgJ2RpcicsICdkaXJ4bWwnLCAnZXJyb3InLFxuICAgICdleGNlcHRpb24nLCAnZ3JvdXAnLCAnZ3JvdXBDb2xsYXBzZWQnLCAnZ3JvdXBFbmQnLCAnaW5mbycsICdsb2cnLFxuICAgICdtYXJrVGltZWxpbmUnLCAncHJvZmlsZScsICdwcm9maWxlRW5kJywgJ3RhYmxlJywgJ3RpbWUnLCAndGltZUVuZCcsXG4gICAgJ3RpbWVTdGFtcCcsICd0cmFjZScsICd3YXJuJ11cbiAgbm9vcCA9ICgpIC0+XG4gICAgIyBzdHViIHVuZGVmaW5lZCBtZXRob2RzLlxuICAgIGZvciBtIGluIG1ldGhvZHMgIHdoZW4gICFjb25zb2xlW21dXG4gICAgICBjb25zb2xlW21dID0gbm9vcFxuXG4gIGlmIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kP1xuICAgIHdpbmRvdy5zaG93ID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSlcbiAgZWxzZVxuICAgIHdpbmRvdy5zaG93ID0gKCkgLT5cbiAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpXG4pKClcblxuY2xhc3MgTVNHXG4gIGlzQ29udGVudFNjcmlwdDogbG9jYXRpb24ucHJvdG9jb2wgaXNudCAnY2hyb21lLWV4dGVuc2lvbjonXG4gIGNvbnN0cnVjdG9yOiAoY29uZmlnKSAtPlxuICAgIEBjb25maWcgPSBjb25maWdcbiAgTG9jYWw6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIHNob3cgXCI9PSBNRVNTQUdFICN7IEpTT04uc3RyaW5naWZ5IG1lc3NhZ2UgfSA9PT5cIlxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0OiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICBzaG93IFwiPT0gTUVTU0FHRSAjeyBKU09OLnN0cmluZ2lmeSBtZXNzYWdlIH0gPT0+XCJcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBAY29uZmlnLkVYVF9JRCwgbWVzc2FnZSwgcmVzcG9uZFxuXG5jbGFzcyBMSVNURU5cbiAgbG9jYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VcbiAgICBsaXN0ZW5lcnM6e31cbiAgZXh0ZXJuYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbFxuICAgIGxpc3RlbmVyczp7fVxuICBjb25zdHJ1Y3RvcjogKGNvbmZpZykgLT5cbiAgICBAY29uZmlnID0gY29uZmlnXG4gICAgQGxvY2FsLmFwaS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZVxuICAgIEBleHRlcm5hbC5hcGk/LmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICBMb2NhbDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgIEBsb2NhbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIEV4dDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgIEBleHRlcm5hbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIF9vbk1lc3NhZ2VFeHRlcm5hbDogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHNob3cgXCI8PT0gRVhURVJOQUwgTUVTU0FHRSA9PSAjeyBAY29uZmlnLkVYVF9UWVBFIH0gPT1cIiArIHJlcXVlc3RcbiAgICBpZiBzZW5kZXIuaWQgaXNudCBAY29uZmlnLkVYVF9JRCB0aGVuIHJldHVybiB1bmRlZmluZWRcbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuXG4gIF9vbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICBzaG93IFwiPD09IE1FU1NBR0UgPT0gI3sgQGNvbmZpZy5FWFRfVFlQRSB9ID09XCIgKyByZXF1ZXN0XG4gICAgQGxvY2FsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIHNlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcblxuY2xhc3MgRGF0YVxuICBtYXBwaW5nOltcbiAgICBkaXJlY3Rvcnk6bnVsbFxuICAgIHVybFBhdHRlcm46bnVsbFxuICBdXG4gIHJlc291cmNlczpbXG4gICAgcmVzb3VyY2U6bnVsbFxuICAgIGZpbGU6bnVsbFxuICBdXG5cblxuXG5jbGFzcyBTdG9yYWdlXG4gIGFwaTogY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgZGF0YToge31cbiAgY2FsbGJhY2s6ICgpIC0+XG4gIGNvbnN0cnVjdG9yOiAoY2FsbGJhY2spIC0+XG4gICAgQGNhbGxiYWNrID0gY2FsbGJhY2tcbiAgICBAcmV0cmlldmVBbGwoKVxuICAgIEBvbkNoYW5nZWRBbGwoKVxuXG4gIHNhdmU6IChrZXksIGl0ZW0pIC0+XG4gICAgb2JqID0ge31cbiAgICBvYmpba2V5XSA9IGl0ZW1cbiAgICBAYXBpLnNldCBvYmpcblxuICBzYXZlQWxsOiAoKSAtPlxuICAgIEBhcGkuc2V0IEBkYXRhXG5cbiAgcmV0cmlldmU6IChrZXksIGNiKSAtPlxuICAgIEBhcGkuZ2V0IGtleSwgKHJlc3VsdHMpIC0+XG4gICAgICBAZGF0YVtyXSA9IHJlc3VsdHNbcl0gZm9yIHIgb2YgcmVzdWx0c1xuICAgICAgaWYgY2I/IHRoZW4gY2IgcmVzdWx0c1trZXldXG5cblxuICByZXRyaWV2ZUFsbDogKGNiKSAtPlxuICAgIEBhcGkuZ2V0IChyZXN1bHQpID0+XG4gICAgICBAZGF0YSA9IHJlc3VsdFxuICAgICAgQGNhbGxiYWNrPyByZXN1bHRcbiAgICAgIGNiPyByZXN1bHRcbiAgICAgIHNob3cgcmVzdWx0XG5cbiAgb25DaGFuZ2VkOiAoa2V5LCBjYikgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsIG5hbWVzcGFjZSkgLT5cbiAgICAgIGlmIGNoYW5nZXNba2V5XT8gYW5kIGNiPyB0aGVuIGNiIGNoYW5nZXNba2V5XS5uZXdWYWx1ZVxuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzXG5cbiAgb25DaGFuZ2VkQWxsOiAoKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcyxuYW1lc3BhY2UpID0+XG4gICAgICBAZGF0YVtjXSA9IGNoYW5nZXNbY10ubmV3VmFsdWUgZm9yIGMgb2YgY2hhbmdlc1xuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzXG5cblxuIyBjbGFzcyBEaXJlY3RvcnlTdG9yZVxuIyAgIGRpcmVjdG9yaWVzID1cbiMgICBjb25zdHJ1Y3RvciAoKSAtPlxuXG4jIGNsYXNzIERpcmVjdG9yeVxuXG5cbmNsYXNzIEZpbGVTeXN0ZW1cbiAgYXBpOiBjaHJvbWUuZmlsZVN5c3RlbVxuXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuXG4gICMgQGRpcnM6IG5ldyBEaXJlY3RvcnlTdG9yZVxuICAjIGZpbGVUb0FycmF5QnVmZmVyOiAoYmxvYiwgb25sb2FkLCBvbmVycm9yKSAtPlxuICAjICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAjICAgcmVhZGVyLm9ubG9hZCA9IG9ubG9hZFxuXG4gICMgICByZWFkZXIub25lcnJvciA9IG9uZXJyb3JcblxuICAjICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGJsb2JcblxuICByZWFkRmlsZTogKGRpckVudHJ5LCBwYXRoLCBzdWNjZXNzLCBlcnJvcikgLT5cbiAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBwYXRoLFxuICAgICAgKGZpbGVFbnRyeSkgPT5cbiAgICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgICAgc3VjY2VzcyhmaWxlRW50cnksIGZpbGUpXG4gICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgICAgICwoZXJyb3IpID0+IGVycm9yKClcblxuICBnZXRGaWxlRW50cnk6IChkaXJFbnRyeSwgcGF0aCwgc3VjY2VzcywgZXJyb3IpIC0+XG4gICAgaWYgZGlyRW50cnk/LmdldEZpbGU/XG4gICAgICBkaXJFbnRyeS5nZXRGaWxlIHBhdGgsIHt9LCAoZmlsZUVudHJ5KSAtPlxuICAgICAgICBzdWNjZXNzIGZpbGVFbnRyeVxuICAgIGVsc2UgZXJyb3IoKVxuXG4gIG9wZW5EaXJlY3Rvcnk6IChjYWxsYmFjaykgPT5cbiAgICBAYXBpLmNob29zZUVudHJ5IHR5cGU6J29wZW5EaXJlY3RvcnknLCAoZGlyZWN0b3J5RW50cnksIGZpbGVzKSA9PlxuICAgICAgQGFwaS5nZXREaXNwbGF5UGF0aCBkaXJlY3RvcnlFbnRyeSwgKHBhdGhOYW1lKSA9PlxuICAgICAgICBkaXIgPVxuICAgICAgICAgICAgcmVsUGF0aDogZGlyZWN0b3J5RW50cnkuZnVsbFBhdGgucmVwbGFjZSgnLycgKyBkaXJlY3RvcnlFbnRyeS5uYW1lLCAnJylcbiAgICAgICAgICAgIGRpcmVjdG9yeUVudHJ5SWQ6IEBhcGkucmV0YWluRW50cnkoZGlyZWN0b3J5RW50cnkpXG4gICAgICAgICAgICBlbnRyeTogZGlyZWN0b3J5RW50cnlcblxuICAgICAgICAgIGNhbGxiYWNrIHBhdGhOYW1lLCBkaXJcbiAgICAgICAgICAgICMgQGdldE9uZURpckxpc3QgZGlyXG4gICAgICAgICAgICAjIFN0b3JhZ2Uuc2F2ZSAnZGlyZWN0b3JpZXMnLCBAc2NvcGUuZGlyZWN0b3JpZXMgKHJlc3VsdCkgLT5cblxuXG5cbmNsYXNzIE1hcHBpbmdcbiAgcmVzb3VyY2U6IG51bGwgI2h0dHA6Ly9ibGFsYS5jb20vd2hhdC9ldmVyL2luZGV4LmpzXG4gIGxvY2FsOiBudWxsICMvc29tZXNoaXR0eURpci9vdGhlclNoaXR0eURpci9cbiAgcmVnZXg6IG51bGxcbiAgY29uc3RydWN0b3I6IChyZXNvdXJjZSwgbG9jYWwsIHJlZ2V4KSAtPlxuICAgIFtAbG9jYWwsIEByZXNvdXJjZSwgQHJlZ2V4XSA9IFtsb2NhbCwgcmVzb3VyY2UsIHJlZ2V4XVxuXG4gIGdldExvY2FsUmVzb3VyY2U6ICgpIC0+XG4gICAgQHJlc291cmNlLnJlcGxhY2UoQHJlZ2V4LCBAbG9jYWwpXG5cbiAgc2V0UmVkaXJlY3REZWNsYXJhdGl2ZTogKHRhYklkKSAtPlxuICAgIHJ1bGVzID0gW10ucHVzaFxuICAgICAgcHJpb3JpdHk6MTAwXG4gICAgICBjb25kaXRpb25zOiBbXG4gICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlcXVlc3RNYXRjaGVyXG4gICAgICAgICAgdXJsOlxuICAgICAgICAgICAgdXJsTWF0Y2hlczpAcmVnZXhcbiAgICAgICAgXVxuICAgICAgYWN0aW9uczogW1xuICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZWRpcmVjdFJlcXVlc3RcbiAgICAgICAgICByZWRpcmVjdFVybDpAZ2V0TG9jYWxSZXNvdXJjZSgpXG4gICAgICBdXG4gICAgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5vblJlcXVlc3QuYWRkUnVsZXMgcnVsZXNcblxuIyBjbGFzcyBTdG9yYWdlRmFjdG9yeVxuIyAgIG1ha2VPYmplY3Q6ICh0eXBlKSAtPlxuIyAgICAgc3dpdGNoIHR5cGVcbiMgICAgICAgd2hlbiAnUmVzb3VyY2VMaXN0J1xuIyAgIF9jcmVhdGU6ICh0eXBlKSAtPlxuIyAgICAgQGdldEZyb21TdG9yYWdlLnRoZW4gKG9iaikgLT5cbiMgICAgICAgcmV0dXJuIG9ialxuXG4jICAgZ2V0RnJvbVN0b3JhZ2U6ICgpIC0+XG4jICAgICBwcm9taXNlID0gbmV3IFByb21pc2UgKHN1Y2Nlc3MsIGZhaWwpIC0+XG4jICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCAoYSkgLT5cbiMgICAgICAgICBiID0gbmV3IFJlc291cmNlTGlzdFxuIyAgICAgICAgIGZvciBrZXkgb2YgYVxuIyAgICAgICAgICAgZG8gKGEpIC0+XG4jICAgICAgICAgICAgIGJba2V5XSA9IGFba2V5XVxuIyAgICAgICAgIHN1Y2Nlc3MgYlxuIyMjXG5jbGFzcyBGaWxlXG4gICAgY29uc3RydWN0b3I6IChkaXJlY3RvcnlFbnRyeSwgcGF0aCkgLT5cbiAgICAgICAgQGRpckVudHJ5ID0gZGlyZWN0b3J5RW50cnlcbiAgICAgICAgQHBhdGggPSBwYXRoXG4jIyNcblxuI1RPRE86IHJld3JpdGUgdGhpcyBjbGFzcyB1c2luZyB0aGUgbmV3IGNocm9tZS5zb2NrZXRzLiogYXBpIHdoZW4geW91IGNhbiBtYW5hZ2UgdG8gbWFrZSBpdCB3b3JrXG5jbGFzcyBTZXJ2ZXJcbiAgc29ja2V0OiBjaHJvbWUuc29ja2V0XG4gICMgdGNwOiBjaHJvbWUuc29ja2V0cy50Y3BcbiAgaG9zdDpcIjEyNy4wLjAuMVwiXG4gIHBvcnQ6ODA4MlxuICBtYXhDb25uZWN0aW9uczo1MDBcbiAgc29ja2V0UHJvcGVydGllczpcbiAgICAgIHBlcnNpc3RlbnQ6dHJ1ZVxuICAgICAgbmFtZTonU0xSZWRpcmVjdG9yJ1xuICBzb2NrZXRJbmZvOm51bGxcbiAgZ2V0TG9jYWxGaWxlOm51bGxcbiAgc29ja2V0SWRzOltdXG4gIHN0b3BwZWQ6ZmFsc2VcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuICBzdGFydDogKGhvc3QscG9ydCxtYXhDb25uZWN0aW9ucywgY2IpIC0+XG4gICAgQGhvc3QgPSBpZiBob3N0PyB0aGVuIGhvc3QgZWxzZSBAaG9zdFxuICAgIEBwb3J0ID0gaWYgcG9ydD8gdGhlbiBwb3J0IGVsc2UgQHBvcnRcbiAgICBAbWF4Q29ubmVjdGlvbnMgPSBpZiBtYXhDb25uZWN0aW9ucz8gdGhlbiBtYXhDb25uZWN0aW9ucyBlbHNlIEBtYXhDb25uZWN0aW9uc1xuXG4gICAgQGtpbGxBbGwgKCkgPT5cbiAgICAgIEBzb2NrZXQuY3JlYXRlICd0Y3AnLCB7fSwgKHNvY2tldEluZm8pID0+XG4gICAgICAgIEBzb2NrZXRJZHMgPSBbXVxuICAgICAgICBAc29ja2V0SWRzLnB1c2ggc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQgJ3NvY2tldElkcyc6QHNvY2tldElkc1xuICAgICAgICBAc29ja2V0Lmxpc3RlbiBzb2NrZXRJbmZvLnNvY2tldElkLCBAaG9zdCwgQHBvcnQsIChyZXN1bHQpID0+XG4gICAgICAgICAgc2hvdyAnbGlzdGVuaW5nICcgKyBzb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgICAgQHN0b3BwZWQgPSBmYWxzZVxuICAgICAgICAgIEBzb2NrZXRJbmZvID0gc29ja2V0SW5mb1xuICAgICAgICAgIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuICBraWxsQWxsOiAoY2FsbGJhY2spIC0+XG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0ICdzb2NrZXRJZHMnLCAocmVzdWx0KSA9PlxuICAgICAgc2hvdyAnZ290IGlkcydcbiAgICAgIHNob3cgcmVzdWx0XG4gICAgICBAc29ja2V0SWRzID0gcmVzdWx0LnNvY2tldElkc1xuICAgICAgZm9yIHMgaW4gQHNvY2tldElkcz9cbiAgICAgICAgZG8gKHMpID0+XG4gICAgICAgICAgdHJ5XG4gICAgICAgICAgICBAc29ja2V0LmRpc2Nvbm5lY3Qgc1xuICAgICAgICAgICAgQHNvY2tldC5kZXN0cm95IHNcbiAgICAgICAgICAgIHNob3cgJ2tpbGxlZCAnICsgc1xuICAgICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgICBzaG93IFwiY291bGQgbm90IGtpbGwgI3sgcyB9IGJlY2F1c2UgI3sgZXJyb3IgfVwiXG4gICAgICBjYWxsYmFjaz8oKVxuXG4gIHN0b3A6ICgpIC0+XG4gICAgQGtpbGxBbGwoKVxuICAgIEBzdG9wcGVkID0gdHJ1ZVxuXG4gIF9vblJlY2VpdmU6IChyZWNlaXZlSW5mbykgPT5cbiAgICBzaG93KFwiQ2xpZW50IHNvY2tldCAncmVjZWl2ZScgZXZlbnQ6IHNkPVwiICsgcmVjZWl2ZUluZm8uc29ja2V0SWRcbiAgICArIFwiLCBieXRlcz1cIiArIHJlY2VpdmVJbmZvLmRhdGEuYnl0ZUxlbmd0aClcblxuICBfb25MaXN0ZW46IChzZXJ2ZXJTb2NrZXRJZCwgcmVzdWx0Q29kZSkgPT5cbiAgICByZXR1cm4gc2hvdyAnRXJyb3IgTGlzdGVuaW5nOiAnICsgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UgaWYgcmVzdWx0Q29kZSA8IDBcbiAgICBAc2VydmVyU29ja2V0SWQgPSBzZXJ2ZXJTb2NrZXRJZFxuICAgIEB0Y3BTZXJ2ZXIub25BY2NlcHQuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdFxuICAgIEB0Y3BTZXJ2ZXIub25BY2NlcHRFcnJvci5hZGRMaXN0ZW5lciBAX29uQWNjZXB0RXJyb3JcbiAgICBAdGNwLm9uUmVjZWl2ZS5hZGRMaXN0ZW5lciBAX29uUmVjZWl2ZVxuICAgICMgc2hvdyBcIltcIitzb2NrZXRJbmZvLnBlZXJBZGRyZXNzK1wiOlwiK3NvY2tldEluZm8ucGVlclBvcnQrXCJdIENvbm5lY3Rpb24gYWNjZXB0ZWQhXCI7XG4gICAgIyBpbmZvID0gQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkXG4gICAgIyBAZ2V0RmlsZSB1cmksIChmaWxlKSAtPlxuICBfb25BY2NlcHRFcnJvcjogKGVycm9yKSAtPlxuICAgIHNob3cgZXJyb3JcblxuICBfb25BY2NlcHQ6IChzb2NrZXRJbmZvKSA9PlxuICAgICMgcmV0dXJuIG51bGwgaWYgaW5mby5zb2NrZXRJZCBpc250IEBzZXJ2ZXJTb2NrZXRJZFxuICAgIHNob3coXCJTZXJ2ZXIgc29ja2V0ICdhY2NlcHQnIGV2ZW50OiBzZD1cIiArIHNvY2tldEluZm8uc29ja2V0SWQpXG4gICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkLCAoaW5mbykgPT5cbiAgICAgIEBnZXRMb2NhbEZpbGUgaW5mbyxcbiAgICAgICAgKGZpbGVFbnRyeSwgZmlsZVJlYWRlcikgPT5cbiAgICAgICAgICBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SW5mby5zb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlUmVhZGVyLCBpbmZvLmtlZXBBbGl2ZSxcbiAgICAgICAgKGVycm9yKSA9PlxuICAgICAgICAgIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG4gICAgIyBAc29ja2V0LmFjY2VwdCBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cblxuXG4gIHN0cmluZ1RvVWludDhBcnJheTogKHN0cmluZykgLT5cbiAgICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyaW5nLmxlbmd0aClcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIGkgPSAwXG5cbiAgICB3aGlsZSBpIDwgc3RyaW5nLmxlbmd0aFxuICAgICAgdmlld1tpXSA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG4gICAgICBpKytcbiAgICB2aWV3XG5cbiAgYXJyYXlCdWZmZXJUb1N0cmluZzogKGJ1ZmZlcikgLT5cbiAgICBzdHIgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgcyA9IDBcblxuICAgIHdoaWxlIHMgPCB1QXJyYXlWYWwubGVuZ3RoXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pXG4gICAgICBzKytcbiAgICBzdHJcblxuICBfd3JpdGUyMDBSZXNwb25zZTogKHNvY2tldElkLCBmaWxlRW50cnksIGZpbGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBjb250ZW50VHlwZSA9IChpZiAoZmlsZS50eXBlIGlzIFwiXCIpIHRoZW4gXCJ0ZXh0L3BsYWluXCIgZWxzZSBmaWxlLnR5cGUpXG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+XG4gICAgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShldi50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgICAgc2hvdyB3cml0ZUluZm9cbiAgICAgICAgIyBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5vbmVycm9yID0gKGVycm9yKSA9PlxuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGZpbGVcblxuXG4gICAgIyBAZW5kIHNvY2tldElkXG4gICAgIyBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICMgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgPT5cbiAgICAjICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAjICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICMgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAjICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJZFxuXG5cbiAgX3JlYWRGcm9tU29ja2V0OiAoc29ja2V0SWQsIGNiKSAtPlxuICAgIEBzb2NrZXQucmVhZCBzb2NrZXRJZCwgKHJlYWRJbmZvKSA9PlxuICAgICAgc2hvdyBcIlJFQURcIiwgcmVhZEluZm9cblxuICAgICAgIyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIGRhdGEgPSBAYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKVxuICAgICAgc2hvdyBkYXRhXG5cbiAgICAgIGlmIGRhdGEuaW5kZXhPZihcIkdFVCBcIikgaXNudCAwXG4gICAgICAgIEBlbmQgc29ja2V0SWRcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGtlZXBBbGl2ZSA9IGZhbHNlXG4gICAgICBrZWVwQWxpdmUgPSB0cnVlIGlmIGRhdGEuaW5kZXhPZiAnQ29ubmVjdGlvbjoga2VlcC1hbGl2ZScgaXNudCAtMVxuXG4gICAgICB1cmlFbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIDQpXG5cbiAgICAgIHJldHVybiBlbmQgc29ja2V0SWQgaWYgdXJpRW5kIDwgMFxuXG4gICAgICB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpXG4gICAgICBpZiBub3QgdXJpP1xuICAgICAgICB3cml0ZUVycm9yIHNvY2tldElkLCA0MDQsIGtlZXBBbGl2ZVxuICAgICAgICByZXR1cm5cblxuICAgICAgaW5mbyA9XG4gICAgICAgIHVyaTogdXJpXG4gICAgICAgIGtlZXBBbGl2ZTprZWVwQWxpdmVcbiAgICAgIGluZm8ucmVmZXJlciA9IGRhdGEubWF0Y2goL1JlZmVyZXI6XFxzKC4qKS8pP1sxXVxuICAgICAgI3N1Y2Nlc3NcbiAgICAgIGNiPyBpbmZvXG5cbiAgZW5kOiAoc29ja2V0SWQsIGtlZXBBbGl2ZSkgLT5cbiAgICAgICMgaWYga2VlcEFsaXZlXG4gICAgICAjICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgIyBlbHNlXG4gICAgQHNvY2tldC5kaXNjb25uZWN0IHNvY2tldElkXG4gICAgQHNvY2tldC5kZXN0cm95IHNvY2tldElkXG4gICAgc2hvdyAnZW5kaW5nICcgKyBzb2NrZXRJZFxuICAgIEBzb2NrZXQuYWNjZXB0IEBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAgX3dyaXRlRXJyb3I6IChzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIC0+XG4gICAgZmlsZSA9IHNpemU6IDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIlxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGVcbiAgICBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiICMoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIlxuICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuXG5jbGFzcyBBcHBsaWNhdGlvblxuXG4gIGNvbmZpZzpcbiAgICBBUFBfSUQ6ICdjZWNpZmFmcGhlZ2hvZnBmZGtoZWtraWJjaWJoZ2ZlYydcbiAgICBFWFRFTlNJT05fSUQ6ICdkZGRpbWJuamliamNhZmJva25iZ2hlaGJmYWpnZ2dlcCdcblxuICBkYXRhOm51bGxcbiAgTElTVEVOOiBudWxsXG4gIE1TRzogbnVsbFxuICBTdG9yYWdlOiBudWxsXG4gIEZTOiBudWxsXG4gIFNlcnZlcjogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIEBTdG9yYWdlID0gbmV3IFN0b3JhZ2VcbiAgICBARlMgPSBuZXcgRmlsZVN5c3RlbVxuICAgIEBTZXJ2ZXIgPSBuZXcgU2VydmVyXG4gICAgQGNvbmZpZy5TRUxGX0lEID0gY2hyb21lLnJ1bnRpbWUuaWRcbiAgICBAY29uZmlnLkVYVF9JRCA9IGlmIEBjb25maWcuQVBQX0lEIGlzIEBjb25maWcuU0VMRl9JRCB0aGVuIEBjb25maWcuRVhURU5TSU9OX0lEIGVsc2UgQGNvbmZpZy5BUFBfSURcbiAgICBAY29uZmlnLkVYVF9UWVBFID0gaWYgQGNvbmZpZy5BUFBfSUQgaXNudCBAY29uZmlnLlNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG4gICAgQE1TRyA9IG5ldyBNU0cgQGNvbmZpZ1xuICAgIEBMSVNURU4gPSBuZXcgTElTVEVOIEBjb25maWdcblxuICAgIEBhcHBXaW5kb3cgPSBudWxsXG4gICAgQHBvcnQgPSAzMTMzN1xuICAgIEBkYXRhID0gQFN0b3JhZ2UuZGF0YVxuICAgIEBpbml0KClcblxuICBpbml0OiAoKSA9PlxuXG5cbiAgbGF1bmNoQXBwOiAoY2IpIC0+XG4gICAgY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIEBjb25maWcuQVBQX0lEXG5cbiAgb3BlbkFwcDogKCkgPT5cbiAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLFxuICAgICAgaWQ6IFwibWFpbndpblwiXG4gICAgICBib3VuZHM6XG4gICAgICAgIHdpZHRoOjUwMFxuICAgICAgICBoZWlnaHQ6ODAwLFxuICAgICh3aW4pID0+XG4gICAgICBAYXBwV2luZG93ID0gd2luKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb25cbiJdfQ==
