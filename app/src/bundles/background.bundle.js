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
    this.Server.stop();
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
    APP_ID: 'nfnmnnonddcblacejdenfhicalbkiiod',
    EXTENSION_ID: 'bdjhbiogleankkadgoloihcbjalmndal'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL2Rldi9yZWRpcmVjdG9yL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbmllbC9kZXYvcmVkaXJlY3Rvci9hcHAvc3JjL2JhY2tncm91bmQuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcmVkaXJlY3Rvci9jb21tb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDVUEsSUFBQSwrQkFBQTtFQUFBOztpU0FBQTs7QUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBQWQsQ0FBQTs7QUFBQTtBQUdJLGtDQUFBLENBQUE7Ozs7Ozs7R0FBQTs7QUFBQSwwQkFBQSxZQUFBLEdBQWEsRUFBYixDQUFBOztBQUFBLDBCQUNBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDRixRQUFBLEtBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsS0FBQyxDQUFBLElBQUQsR0FBUSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQWpCLENBQUE7ZUFDQSxLQUFDLENBQUEsSUFBRCxHQUFRLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FGRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLENBQUEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLEdBQXVCLElBQUMsQ0FBQSxZQUp4QixDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBbUIsYUFBbkIsRUFBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsR0FBRCxHQUFBO2VBQzlCLEtBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxD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IGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIHNlcnZlciA9IHJlcXVpcmUgJy4vdGNwLXNlcnZlci5qcydcblxuIyBnZXRHbG9iYWwgPSAtPlxuIyAgIF9nZXRHbG9iYWwgPSAtPlxuIyAgICAgdGhpc1xuXG4jICAgX2dldEdsb2JhbCgpXG5cbiMgcm9vdCA9IGdldEdsb2JhbCgpXG5cbkFwcGxpY2F0aW9uID0gcmVxdWlyZSAnLi4vLi4vY29tbW9uLmNvZmZlZSdcbiNhcHAgPSBuZXcgbGliLkFwcGxpY2F0aW9uXG5jbGFzcyBBcHBCYWNrZ3JvdW5kIGV4dGVuZHMgQXBwbGljYXRpb25cbiAgICByZXRhaW5lZERpcnM6e31cbiAgICBpbml0OiAoKSAtPlxuICAgICAgICBAU3RvcmFnZS5yZXRyaWV2ZUFsbCAoKSA9PlxuICAgICAgICAgICAgQGRhdGEgPSBAU3RvcmFnZS5kYXRhXG4gICAgICAgICAgICBAbWFwcyA9IEBkYXRhLm1hcHNcblxuICAgICAgICBAU2VydmVyLmdldExvY2FsRmlsZSA9IEBnZXRMb2NhbEZpbGVcbiAgICAgICAgQFN0b3JhZ2Uub25DaGFuZ2VkICdyZXNvdXJjZU1hcCcsIChvYmopID0+XG4gICAgICAgICAgICBATVNHLkV4dCBvYmpcblxuICAgICAgICBATElTVEVOLkV4dCAncmVzb3VyY2VzJywgKHJlc3VsdCkgPT5cbiAgICAgICAgICAgIEBTdG9yYWdlLnNhdmUgJ2N1cnJlbnRSZXNvdXJjZXMnLCByZXN1bHRcblxuICAgICAgICBATElTVEVOLkxvY2FsICdzdGFydFNlcnZlcicsIChyZXN1bHRzKSA9PlxuICAgICAgICAgICAgQFNlcnZlci5zdGFydCByZXN1bHRzLmhvc3QsIHJlc3VsdHMucG9ydFxuXG4gICAgICAgIEBMSVNURU4uTG9jYWwgJ3N0b3BTZXJ2ZXInLCAoKSA9PlxuICAgICAgICAgICAgQFNlcnZlci5zdG9wKClcblxuICAgICAgICBAc3RhcnRTZXJ2ZXIoKVxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNocm9tZS5hcHAucnVudGltZS5vbkxhdW5jaGVkLmFkZExpc3RlbmVyIEBvcGVuQXBwXG4gICAgICAgICAgICBjaHJvbWUuYXBwLnJ1bnRpbWUub25SZXN0YXJ0ZWQuYWRkTGlzdGVuZXIgQGNsZWFuVXBcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAgIHNob3cgZXJyb3JcblxuXG4gICAgY2xlYW5VcDogKCkgLT5cbiAgICAgICAgQHN0b3BTZXJ2ZXIoKVxuXG4gICAgZ2V0TG9jYWxGaWxlOiAoaW5mbywgY2IsIGVycm9yKSA9PlxuXG4gICAgICAgIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJsLCBzdWNjZXNzLFxuICAgICAgICAgICAgKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggaW5mbywgY2IsIGVycm9yXG5cbiAgICBmaW5kRmlsZUZvclBhdGg6IChpbmZvLCBjYiwgZXJyb3IpID0+XG4gICAgICAgIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJsLCBjYiwgZXJyb3IsIGluZm8ucmVmZXJlclxuXG4gICAgZmluZEZpbGVGb3JRdWVyeVN0cmluZzogKF91cmwsIGNiLCBlcnJvciwgcmVmZXJlcikgPT5cbiAgICAgICAgdXJsID0gX3VybC5yZXBsYWNlIC8uKj9zbHJlZGlyXFw9LywgJydcblxuICAgICAgICBtYXRjaCA9IGl0ZW0gZm9yIGl0ZW0gaW4gQG1hcHMgd2hlbiB1cmwubWF0Y2gobmV3IFJlZ0V4cChpdGVtLnVybCksIGl0ZW0ucmVnZXhSZXBsKT8gYW5kIGl0ZW0udXJsPyBhbmQgbm90IG1hdGNoP1xuXG4gICAgICAgIGlmIG1hdGNoP1xuICAgICAgICAgICAgaWYgcmVmZXJlcj9cbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5tYXRjaCgvLipcXC9cXC8uKj9cXC8oLiopLyk/WzFdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSB1cmwucmVwbGFjZSBuZXcgUmVnRXhwKG1hdGNoLnVybCksIG1hdGNoLnJlZ2V4UmVwbFxuICAgICAgICAgICAgZGlyID0gQFN0b3JhZ2UuZGF0YS5kaXJlY3Rvcmllc1ttYXRjaC5kaXJlY3RvcnldXG5cbiAgICAgICAgICAgIGlmIG5vdCBkaXI/IHRoZW4gcmV0dXJuIGVyciAnbm8gbWF0Y2gnXG5cbiAgICAgICAgICAgIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAgICAgICAgICAgICAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiAgICAgICAgICAgICAgICBARlMucmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgICAgICAgICAgICAgICBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICAgICAgICAgICAgICAgICAgIEBGUy5yZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICAgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyb3IoKVxuXG5cbiAgICBzdGFydFNlcnZlcjogKCkgLT5cbiAgICAgICAgQFNlcnZlci5zdGFydCBudWxsLG51bGwsbnVsbCwgKCkgPT5cbiAgICAgICAgICAgIEBNU0cuTG9jYWwgJ3NlcnZlcic6QFNlcnZlclxuXG4gICAgc3RvcFNlcnZlcjogKCkgLT5cbiAgICAgICAgQFNlcnZlci5zdG9wKClcbiAgICAgICAgQE1TRy5Mb2NhbCAnc2VydmVyJzpudWxsXG5cbmFwcCA9IG5ldyBBcHBCYWNrZ3JvdW5kXG5cblxuXG4jIyNcbiB2YXIgd2hpdGVsaXN0ZWRJZCA9ICdwbWdubmJkZm1tcGRrZ2FhbWtkaWlwZmdqYnBnaW9mYyc7XG4gIHZhciBhZGREaXJlY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLCB7XG4gICAgICAgIGlkOiBcIm1haW53aW5cIixcbiAgICAgICAgYm91bmRzOiB7XG4gICAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICAgIGhlaWdodDogNTBcbiAgICAgICAgfSxcbiAgICB9LCBmdW5jdGlvbih3aW4pIHtcbiAgICAgICAgbWFpbldpbiA9IHdpbjtcbiAgICB9KTtcbiAgfVxuXG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICAvLyBpZiAoc2VuZGVyLmlkICE9IHdoaXRlbGlzdGVkSWQpXG4gICAgICAgICAgLy8gICByZXR1cm4gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJHb3QgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIHNob3cocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzLnB1c2gocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIC8vIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeShyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQsIGZ1bmN0aW9uKGRpcmVjdG9yeUVudHJ5KSB7XG4gICAgICAgICAgICAvLyAgICAgc2hvdyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIGlmIChzZW5kZXIuaWQgIT0gd2hpdGVsaXN0ZWRJZCkge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG4gICAgICAgICAgICByZXR1cm47ICAvLyBkb24ndCBhbGxvdyB0aGlzIGV4dGVuc2lvbiBhY2Nlc3NcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3BlbkRpcmVjdG9yeSkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BlbmluZyBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgYWRkRGlyZWN0b3J5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBzb2NrZXQuY3JlYXRlKFwidGNwXCIsIHt9LCBmdW5jdGlvbihfc29ja2V0SW5mbykge1xuICAgICAgICBzb2NrZXRJbmZvID0gX3NvY2tldEluZm87XG4gICAgICAgIHNvY2tldC5saXN0ZW4oc29ja2V0SW5mby5zb2NrZXRJZCwgXCIxMjcuMC4wLjFcIiwgMzMzMzMsIDUwLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgc2hvdyhcIkxJU1RFTklORzpcIiwgcmVzdWx0KTtcbiAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgc3RvcFNvY2tldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzb2NrZXQuZGVzdHJveShzb2NrZXRJbmZvLnNvY2tldElkKTtcbiAgICB9XG5cblxuIyMjXG5cbiMjI1xub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdGFydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIik7XG4gIHZhciBzdG9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9wXCIpO1xuICB2YXIgaG9zdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImhvc3RzXCIpO1xuICB2YXIgcG9ydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9ydFwiKTtcbiAgdmFyIGRpcmVjdG9yeSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGlyZWN0b3J5XCIpO1xuXG4gIHZhciBzb2NrZXQgPSBjaHJvbWUuc29ja2V0O1xuICB2YXIgc29ja2V0SW5mbztcbiAgdmFyIGZpbGVzTWFwID0ge307XG5cbiAgdmFyIHJvb3REaXI7XG4gIHZhciBwb3J0LCBleHRQb3J0O1xuICB2YXIgZGlyZWN0b3JpZXMgPSBbXTtcblxuICB2YXIgc3RyaW5nVG9VaW50OEFycmF5ID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgICAgdmlld1tpXSA9IHN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXR1cm4gdmlldztcbiAgfTtcblxuICB2YXIgYXJyYXlCdWZmZXJUb1N0cmluZyA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgIHZhciBzdHIgPSAnJztcbiAgICB2YXIgdUFycmF5VmFsID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBmb3IodmFyIHMgPSAwOyBzIDwgdUFycmF5VmFsLmxlbmd0aDsgcysrKSB7XG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xuICB9O1xuXG4gIHZhciBsb2dUb1NjcmVlbiA9IGZ1bmN0aW9uKGxvZykge1xuICAgIGxvZ2dlci50ZXh0Q29udGVudCArPSBsb2cgKyBcIlxcblwiO1xuICB9XG5cbiAgdmFyIHdyaXRlRXJyb3JSZXNwb25zZSA9IGZ1bmN0aW9uKHNvY2tldElkLCBlcnJvckNvZGUsIGtlZXBBbGl2ZSkge1xuICAgIHZhciBmaWxlID0geyBzaXplOiAwIH07XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogYmVnaW4uLi4gXCIpO1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGUpO1xuICAgIHZhciBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiOyAvLyhmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgdmFyIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemU7XG4gICAgdmFyIGhlYWRlciA9IHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIFwiICsgZXJyb3JDb2RlICsgXCIgTm90IEZvdW5kXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgga2VlcEFsaXZlID8gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgOiBcIlwiKSArIFwiXFxuXFxuXCIpO1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyBoZWFkZXIuLi5cIik7XG4gICAgdmFyIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSk7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQoaGVhZGVyLCAwKTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgdmlldy4uLlwiKTtcbiAgICBzb2NrZXQud3JpdGUoc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgZnVuY3Rpb24od3JpdGVJbmZvKSB7XG4gICAgICBzaG93KFwiV1JJVEVcIiwgd3JpdGVJbmZvKTtcbiAgICAgIGlmIChrZWVwQWxpdmUpIHtcbiAgICAgICAgcmVhZEZyb21Tb2NrZXQoc29ja2V0SWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SWQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OmZpbGVyZWFkZXI6OiBlbmQgb25sb2FkLi4uXCIpO1xuXG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogZW5kLi4uXCIpO1xuICB9O1xuXG4gIHZhciB3cml0ZTIwMFJlc3BvbnNlID0gZnVuY3Rpb24oc29ja2V0SWQsIGZpbGUsIGtlZXBBbGl2ZSkge1xuICAgIHZhciBjb250ZW50VHlwZSA9IChmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgdmFyIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemU7XG4gICAgdmFyIGhlYWRlciA9IHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIDIwMCBPS1xcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoIGtlZXBBbGl2ZSA/IFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIDogXCJcIikgKyBcIlxcblxcblwiKTtcbiAgICB2YXIgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldChoZWFkZXIsIDApO1xuXG4gICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoKTtcbiAgICAgICBzb2NrZXQud3JpdGUoc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgZnVuY3Rpb24od3JpdGVJbmZvKSB7XG4gICAgICAgICBzaG93KFwiV1JJVEVcIiwgd3JpdGVJbmZvKTtcbiAgICAgICAgIGlmIChrZWVwQWxpdmUpIHtcbiAgICAgICAgICAgcmVhZEZyb21Tb2NrZXQoc29ja2V0SWQpO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SWQpO1xuICAgICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmaWxlUmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGZpbGUpO1xuICB9O1xuXG4gIHZhciBvbkFjY2VwdCA9IGZ1bmN0aW9uKGFjY2VwdEluZm8pIHtcbiAgICBzaG93KFwiQUNDRVBUXCIsIGFjY2VwdEluZm8pXG4gICAgcmVhZEZyb21Tb2NrZXQoYWNjZXB0SW5mby5zb2NrZXRJZCk7XG4gIH07XG5cbiAgdmFyIHJlYWRGcm9tU29ja2V0ID0gZnVuY3Rpb24oc29ja2V0SWQpIHtcbiAgICAvLyAgUmVhZCBpbiB0aGUgZGF0YVxuICAgIHNvY2tldC5yZWFkKHNvY2tldElkLCBmdW5jdGlvbihyZWFkSW5mbykge1xuICAgICAgc2hvdyhcIlJFQURcIiwgcmVhZEluZm8pO1xuICAgICAgLy8gUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICB2YXIgZGF0YSA9IGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSk7XG4gICAgICBpZihkYXRhLmluZGV4T2YoXCJHRVQgXCIpID09IDApIHtcbiAgICAgICAgdmFyIGtlZXBBbGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoZGF0YS5pbmRleE9mKFwiQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiKSAhPSAtMSkge1xuICAgICAgICAgIGtlZXBBbGl2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBjYW4gb25seSBkZWFsIHdpdGggR0VUIHJlcXVlc3RzXG4gICAgICAgIHZhciB1cmlFbmQgPSAgZGF0YS5pbmRleE9mKFwiIFwiLCA0KTtcbiAgICAgICAgaWYodXJpRW5kIDwgMCkgeyAgIHJldHVybjsgfVxuICAgICAgICB2YXIgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKTtcbiAgICAgICAgLy8gc3RyaXAgcXllcnkgc3RyaW5nXG4gICAgICAgIHZhciBxID0gdXJpLmluZGV4T2YoXCI/XCIpO1xuICAgICAgICBpZiAocSAhPSAtMSkge1xuICAgICAgICAgIHVyaSA9IHVyaS5zdWJzdHJpbmcoMCwgcSk7XG4gICAgICAgIH1cblxuICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkoZGlyZWN0b3JpZXNbMF0pXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICAgKGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihkaXJlY3RvcnlFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICBzaG93KGRpcmVjdG9yeUVudHJ5KTtcbiAgICAgICAgICAgICAgICAgICAgc2hvdyh1cmkpO1xuICAgICAgICAgICAgICAgICAgICBkaXJlY3RvcnlFbnRyeS5nZXRGaWxlKCdteU5ld0FwcERFVi5yZXNvdXJjZS9pbmRleC5qcycsIHt9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93KGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd3JpdGUyMDBSZXNwb25zZShzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKTtcbiAgICAgICAgICAgICAgICAgICAgfSxmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93KGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9KSh1cmkpXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gdmFyIGZpbGUgPVxuICAgICAgICAvLyBpZighIWZpbGUgPT0gZmFsc2UpIHtcbiAgICAgICAgLy8gICBjb25zb2xlLndhcm4oXCJGaWxlIGRvZXMgbm90IGV4aXN0Li4uXCIgKyB1cmkpO1xuICAgICAgICAvLyAgIHdyaXRlRXJyb3JSZXNwb25zZShzb2NrZXRJZCwgNDA0LCBrZWVwQWxpdmUpO1xuICAgICAgICAvLyAgIHJldHVybjtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBsb2dUb1NjcmVlbihcIkdFVCAyMDAgXCIgKyB1cmkpO1xuICAgICAgICAvLyB3cml0ZTIwMFJlc3BvbnNlKHNvY2tldElkLCBmaWxlLCBrZWVwQWxpdmUpO1xuICAgICAgLy8gfVxuICAgICAgLy8gZWxzZSB7XG4gICAgICAgIC8vIFRocm93IGFuIGVycm9yXG4gICAgICAgIC8vIHNvY2tldC5kZXN0cm95KHNvY2tldElkKTtcbiAgICAgIC8vIH1cblxuICB9O1xufSk7XG59XG5cblxuICB2YXIgd2hpdGVsaXN0ZWRJZCA9ICdwbWdubmJkZm1tcGRrZ2FhbWtkaWlwZmdqYnBnaW9mYyc7XG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIGlmIChzZW5kZXIuaWQgIT0gd2hpdGVsaXN0ZWRJZCkge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG4gICAgICAgICAgICByZXR1cm47ICAvLyBkb24ndCBhbGxvdyB0aGlzIGV4dGVuc2lvbiBhY2Nlc3NcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3BlbkRpcmVjdG9yeSkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BlbmluZyBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgYWRkRGlyZWN0b3J5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICAvLyBpZiAoc2VuZGVyLmlkICE9IHdoaXRlbGlzdGVkSWQpXG4gICAgICAgICAgLy8gICByZXR1cm4gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJHb3QgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIHNob3cocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzLnB1c2gocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIC8vIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeShyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQsIGZ1bmN0aW9uKGRpcmVjdG9yeUVudHJ5KSB7XG4gICAgICAgICAgICAvLyAgICAgc2hvdyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHNvY2tldC5jcmVhdGUoXCJ0Y3BcIiwge30sIGZ1bmN0aW9uKF9zb2NrZXRJbmZvKSB7XG4gICAgICAgIHNvY2tldEluZm8gPSBfc29ja2V0SW5mbztcbiAgICAgICAgc29ja2V0Lmxpc3Rlbihzb2NrZXRJbmZvLnNvY2tldElkLCBcIjEyNy4wLjAuMVwiLCAzMzMzMywgNTAsIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBzaG93KFwiTElTVEVOSU5HOlwiLCByZXN1bHQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBzdG9wU29ja2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldEluZm8uc29ja2V0SWQpO1xuICAgIH1cblxuICB2YXIgYWRkRGlyZWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJywge1xuICAgICAgICBpZDogXCJtYWlud2luXCIsXG4gICAgICAgIGJvdW5kczoge1xuICAgICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgICBoZWlnaHQ6IDUwXG4gICAgICAgIH0sXG4gICAgfSwgZnVuY3Rpb24od2luKSB7XG4gICAgICAgIG1haW5XaW4gPSB3aW47XG4gICAgfSk7XG4gIH1cblxufTtcbiMjI1xuIiwiIyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTc0MjA5M1xuKCgpIC0+XG4gIG1ldGhvZHMgPSBbXG4gICAgJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJyxcbiAgICAnZXhjZXB0aW9uJywgJ2dyb3VwJywgJ2dyb3VwQ29sbGFwc2VkJywgJ2dyb3VwRW5kJywgJ2luZm8nLCAnbG9nJyxcbiAgICAnbWFya1RpbWVsaW5lJywgJ3Byb2ZpbGUnLCAncHJvZmlsZUVuZCcsICd0YWJsZScsICd0aW1lJywgJ3RpbWVFbmQnLFxuICAgICd0aW1lU3RhbXAnLCAndHJhY2UnLCAnd2FybiddXG4gIG5vb3AgPSAoKSAtPlxuICAgICMgc3R1YiB1bmRlZmluZWQgbWV0aG9kcy5cbiAgICBmb3IgbSBpbiBtZXRob2RzICB3aGVuICAhY29uc29sZVttXVxuICAgICAgY29uc29sZVttXSA9IG5vb3BcblxuICBpZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZD9cbiAgICB3aW5kb3cuc2hvdyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUpXG4gIGVsc2VcbiAgICB3aW5kb3cuc2hvdyA9ICgpIC0+XG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKVxuKSgpXG5cbmNsYXNzIE1TR1xuICBpc0NvbnRlbnRTY3JpcHQ6IGxvY2F0aW9uLnByb3RvY29sIGlzbnQgJ2Nocm9tZS1leHRlbnNpb246J1xuICBjb25zdHJ1Y3RvcjogKGNvbmZpZykgLT5cbiAgICBAY29uZmlnID0gY29uZmlnXG4gIExvY2FsOiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICBzaG93IFwiPT0gTUVTU0FHRSAjeyBKU09OLnN0cmluZ2lmeSBtZXNzYWdlIH0gPT0+XCJcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBtZXNzYWdlLCByZXNwb25kXG4gIEV4dDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgc2hvdyBcIj09IE1FU1NBR0UgI3sgSlNPTi5zdHJpbmdpZnkgbWVzc2FnZSB9ID09PlwiXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgQGNvbmZpZy5FWFRfSUQsIG1lc3NhZ2UsIHJlc3BvbmRcblxuY2xhc3MgTElTVEVOXG4gIGxvY2FsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlXG4gICAgbGlzdGVuZXJzOnt9XG4gIGV4dGVybmFsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWxcbiAgICBsaXN0ZW5lcnM6e31cbiAgY29uc3RydWN0b3I6IChjb25maWcpIC0+XG4gICAgQGNvbmZpZyA9IGNvbmZpZ1xuICAgIEBsb2NhbC5hcGkuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwuYXBpPy5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgTG9jYWw6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICBAbG9jYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBFeHQ6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBfb25NZXNzYWdlRXh0ZXJuYWw6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICBzaG93IFwiPD09IEVYVEVSTkFMIE1FU1NBR0UgPT0gI3sgQGNvbmZpZy5FWFRfVFlQRSB9ID09XCIgKyByZXF1ZXN0XG4gICAgaWYgc2VuZGVyLmlkIGlzbnQgQGNvbmZpZy5FWFRfSUQgdGhlbiByZXR1cm4gdW5kZWZpbmVkXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIHNlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcblxuICBfb25NZXNzYWdlOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgc2hvdyBcIjw9PSBNRVNTQUdFID09ICN7IEBjb25maWcuRVhUX1RZUEUgfSA9PVwiICsgcmVxdWVzdFxuICAgIEBsb2NhbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBzZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG5cbmNsYXNzIERhdGFcbiAgbWFwcGluZzpbXG4gICAgZGlyZWN0b3J5Om51bGxcbiAgICB1cmxQYXR0ZXJuOm51bGxcbiAgXVxuICByZXNvdXJjZXM6W1xuICAgIHJlc291cmNlOm51bGxcbiAgICBmaWxlOm51bGxcbiAgXVxuXG5cblxuY2xhc3MgU3RvcmFnZVxuICBhcGk6IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gIGRhdGE6IHt9XG4gIGNhbGxiYWNrOiAoKSAtPlxuICBjb25zdHJ1Y3RvcjogKGNhbGxiYWNrKSAtPlxuICAgIEBjYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgQHJldHJpZXZlQWxsKClcbiAgICBAb25DaGFuZ2VkQWxsKClcblxuICBzYXZlOiAoa2V5LCBpdGVtKSAtPlxuICAgIG9iaiA9IHt9XG4gICAgb2JqW2tleV0gPSBpdGVtXG4gICAgQGFwaS5zZXQgb2JqXG5cbiAgc2F2ZUFsbDogKCkgLT5cbiAgICBAYXBpLnNldCBAZGF0YVxuXG4gIHJldHJpZXZlOiAoa2V5LCBjYikgLT5cbiAgICBAYXBpLmdldCBrZXksIChyZXN1bHRzKSAtPlxuICAgICAgQGRhdGFbcl0gPSByZXN1bHRzW3JdIGZvciByIG9mIHJlc3VsdHNcbiAgICAgIGlmIGNiPyB0aGVuIGNiIHJlc3VsdHNba2V5XVxuXG5cbiAgcmV0cmlldmVBbGw6IChjYikgLT5cbiAgICBAYXBpLmdldCAocmVzdWx0KSA9PlxuICAgICAgQGRhdGEgPSByZXN1bHRcbiAgICAgIEBjYWxsYmFjaz8gcmVzdWx0XG4gICAgICBjYj8gcmVzdWx0XG4gICAgICBzaG93IHJlc3VsdFxuXG4gIG9uQ2hhbmdlZDogKGtleSwgY2IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLCBuYW1lc3BhY2UpIC0+XG4gICAgICBpZiBjaGFuZ2VzW2tleV0/IGFuZCBjYj8gdGhlbiBjYiBjaGFuZ2VzW2tleV0ubmV3VmFsdWVcbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlc1xuXG4gIG9uQ2hhbmdlZEFsbDogKCkgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsbmFtZXNwYWNlKSA9PlxuICAgICAgQGRhdGFbY10gPSBjaGFuZ2VzW2NdLm5ld1ZhbHVlIGZvciBjIG9mIGNoYW5nZXNcbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlc1xuXG5cbiMgY2xhc3MgRGlyZWN0b3J5U3RvcmVcbiMgICBkaXJlY3RvcmllcyA9XG4jICAgY29uc3RydWN0b3IgKCkgLT5cblxuIyBjbGFzcyBEaXJlY3RvcnlcblxuXG5jbGFzcyBGaWxlU3lzdGVtXG4gIGFwaTogY2hyb21lLmZpbGVTeXN0ZW1cblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuICAjIEBkaXJzOiBuZXcgRGlyZWN0b3J5U3RvcmVcbiAgIyBmaWxlVG9BcnJheUJ1ZmZlcjogKGJsb2IsIG9ubG9hZCwgb25lcnJvcikgLT5cbiAgIyAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgIyAgIHJlYWRlci5vbmxvYWQgPSBvbmxvYWRcblxuICAjICAgcmVhZGVyLm9uZXJyb3IgPSBvbmVycm9yXG5cbiAgIyAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBibG9iXG5cbiAgcmVhZEZpbGU6IChkaXJFbnRyeSwgcGF0aCwgc3VjY2VzcywgZXJyb3IpIC0+XG4gICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgcGF0aCxcbiAgICAgIChmaWxlRW50cnkpID0+XG4gICAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICAgIHN1Y2Nlc3MoZmlsZUVudHJ5LCBmaWxlKVxuICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG5cbiAgZ2V0RmlsZUVudHJ5OiAoZGlyRW50cnksIHBhdGgsIHN1Y2Nlc3MsIGVycm9yKSAtPlxuICAgIGlmIGRpckVudHJ5Py5nZXRGaWxlP1xuICAgICAgZGlyRW50cnkuZ2V0RmlsZSBwYXRoLCB7fSwgKGZpbGVFbnRyeSkgLT5cbiAgICAgICAgc3VjY2VzcyBmaWxlRW50cnlcbiAgICBlbHNlIGVycm9yKClcblxuICBvcGVuRGlyZWN0b3J5OiAoY2FsbGJhY2spID0+XG4gICAgQGFwaS5jaG9vc2VFbnRyeSB0eXBlOidvcGVuRGlyZWN0b3J5JywgKGRpcmVjdG9yeUVudHJ5LCBmaWxlcykgPT5cbiAgICAgIEBhcGkuZ2V0RGlzcGxheVBhdGggZGlyZWN0b3J5RW50cnksIChwYXRoTmFtZSkgPT5cbiAgICAgICAgZGlyID1cbiAgICAgICAgICAgIHJlbFBhdGg6IGRpcmVjdG9yeUVudHJ5LmZ1bGxQYXRoLnJlcGxhY2UoJy8nICsgZGlyZWN0b3J5RW50cnkubmFtZSwgJycpXG4gICAgICAgICAgICBkaXJlY3RvcnlFbnRyeUlkOiBAYXBpLnJldGFpbkVudHJ5KGRpcmVjdG9yeUVudHJ5KVxuICAgICAgICAgICAgZW50cnk6IGRpcmVjdG9yeUVudHJ5XG5cbiAgICAgICAgICBjYWxsYmFjayBwYXRoTmFtZSwgZGlyXG4gICAgICAgICAgICAjIEBnZXRPbmVEaXJMaXN0IGRpclxuICAgICAgICAgICAgIyBTdG9yYWdlLnNhdmUgJ2RpcmVjdG9yaWVzJywgQHNjb3BlLmRpcmVjdG9yaWVzIChyZXN1bHQpIC0+XG5cblxuXG5jbGFzcyBNYXBwaW5nXG4gIHJlc291cmNlOiBudWxsICNodHRwOi8vYmxhbGEuY29tL3doYXQvZXZlci9pbmRleC5qc1xuICBsb2NhbDogbnVsbCAjL3NvbWVzaGl0dHlEaXIvb3RoZXJTaGl0dHlEaXIvXG4gIHJlZ2V4OiBudWxsXG4gIGNvbnN0cnVjdG9yOiAocmVzb3VyY2UsIGxvY2FsLCByZWdleCkgLT5cbiAgICBbQGxvY2FsLCBAcmVzb3VyY2UsIEByZWdleF0gPSBbbG9jYWwsIHJlc291cmNlLCByZWdleF1cblxuICBnZXRMb2NhbFJlc291cmNlOiAoKSAtPlxuICAgIEByZXNvdXJjZS5yZXBsYWNlKEByZWdleCwgQGxvY2FsKVxuXG4gIHNldFJlZGlyZWN0RGVjbGFyYXRpdmU6ICh0YWJJZCkgLT5cbiAgICBydWxlcyA9IFtdLnB1c2hcbiAgICAgIHByaW9yaXR5OjEwMFxuICAgICAgY29uZGl0aW9uczogW1xuICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZXF1ZXN0TWF0Y2hlclxuICAgICAgICAgIHVybDpcbiAgICAgICAgICAgIHVybE1hdGNoZXM6QHJlZ2V4XG4gICAgICAgIF1cbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuUmVkaXJlY3RSZXF1ZXN0XG4gICAgICAgICAgcmVkaXJlY3RVcmw6QGdldExvY2FsUmVzb3VyY2UoKVxuICAgICAgXVxuICAgIGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3Qub25SZXF1ZXN0LmFkZFJ1bGVzIHJ1bGVzXG5cbiMgY2xhc3MgU3RvcmFnZUZhY3RvcnlcbiMgICBtYWtlT2JqZWN0OiAodHlwZSkgLT5cbiMgICAgIHN3aXRjaCB0eXBlXG4jICAgICAgIHdoZW4gJ1Jlc291cmNlTGlzdCdcbiMgICBfY3JlYXRlOiAodHlwZSkgLT5cbiMgICAgIEBnZXRGcm9tU3RvcmFnZS50aGVuIChvYmopIC0+XG4jICAgICAgIHJldHVybiBvYmpcblxuIyAgIGdldEZyb21TdG9yYWdlOiAoKSAtPlxuIyAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlIChzdWNjZXNzLCBmYWlsKSAtPlxuIyAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQgKGEpIC0+XG4jICAgICAgICAgYiA9IG5ldyBSZXNvdXJjZUxpc3RcbiMgICAgICAgICBmb3Iga2V5IG9mIGFcbiMgICAgICAgICAgIGRvIChhKSAtPlxuIyAgICAgICAgICAgICBiW2tleV0gPSBhW2tleV1cbiMgICAgICAgICBzdWNjZXNzIGJcbiMjI1xuY2xhc3MgRmlsZVxuICAgIGNvbnN0cnVjdG9yOiAoZGlyZWN0b3J5RW50cnksIHBhdGgpIC0+XG4gICAgICAgIEBkaXJFbnRyeSA9IGRpcmVjdG9yeUVudHJ5XG4gICAgICAgIEBwYXRoID0gcGF0aFxuIyMjXG5cbiNUT0RPOiByZXdyaXRlIHRoaXMgY2xhc3MgdXNpbmcgdGhlIG5ldyBjaHJvbWUuc29ja2V0cy4qIGFwaSB3aGVuIHlvdSBjYW4gbWFuYWdlIHRvIG1ha2UgaXQgd29ya1xuY2xhc3MgU2VydmVyXG4gIHNvY2tldDogY2hyb21lLnNvY2tldFxuICAjIHRjcDogY2hyb21lLnNvY2tldHMudGNwXG4gIGhvc3Q6XCIxMjcuMC4wLjFcIlxuICBwb3J0OjgwODJcbiAgbWF4Q29ubmVjdGlvbnM6NTAwXG4gIHNvY2tldFByb3BlcnRpZXM6XG4gICAgICBwZXJzaXN0ZW50OnRydWVcbiAgICAgIG5hbWU6J1NMUmVkaXJlY3RvcidcbiAgc29ja2V0SW5mbzpudWxsXG4gIGdldExvY2FsRmlsZTpudWxsXG4gIHNvY2tldElkczpbXVxuICBzdG9wcGVkOmZhbHNlXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG5cbiAgc3RhcnQ6IChob3N0LHBvcnQsbWF4Q29ubmVjdGlvbnMsIGNiKSAtPlxuICAgIEBob3N0ID0gaWYgaG9zdD8gdGhlbiBob3N0IGVsc2UgQGhvc3RcbiAgICBAcG9ydCA9IGlmIHBvcnQ/IHRoZW4gcG9ydCBlbHNlIEBwb3J0XG4gICAgQG1heENvbm5lY3Rpb25zID0gaWYgbWF4Q29ubmVjdGlvbnM/IHRoZW4gbWF4Q29ubmVjdGlvbnMgZWxzZSBAbWF4Q29ubmVjdGlvbnNcblxuICAgIEBraWxsQWxsICgpID0+XG4gICAgICBAc29ja2V0LmNyZWF0ZSAndGNwJywge30sIChzb2NrZXRJbmZvKSA9PlxuICAgICAgICBAc29ja2V0SWRzID0gW11cbiAgICAgICAgQHNvY2tldElkcy5wdXNoIHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0ICdzb2NrZXRJZHMnOkBzb2NrZXRJZHNcbiAgICAgICAgQHNvY2tldC5saXN0ZW4gc29ja2V0SW5mby5zb2NrZXRJZCwgQGhvc3QsIEBwb3J0LCAocmVzdWx0KSA9PlxuICAgICAgICAgIHNob3cgJ2xpc3RlbmluZyAnICsgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICAgIEBzdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICBAc29ja2V0SW5mbyA9IHNvY2tldEluZm9cbiAgICAgICAgICBAc29ja2V0LmFjY2VwdCBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAga2lsbEFsbDogKGNhbGxiYWNrKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCAnc29ja2V0SWRzJywgKHJlc3VsdCkgPT5cbiAgICAgIHNob3cgJ2dvdCBpZHMnXG4gICAgICBzaG93IHJlc3VsdFxuICAgICAgQHNvY2tldElkcyA9IHJlc3VsdC5zb2NrZXRJZHNcbiAgICAgIGZvciBzIGluIEBzb2NrZXRJZHM/XG4gICAgICAgIGRvIChzKSA9PlxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgQHNvY2tldC5kaXNjb25uZWN0IHNcbiAgICAgICAgICAgIEBzb2NrZXQuZGVzdHJveSBzXG4gICAgICAgICAgICBzaG93ICdraWxsZWQgJyArIHNcbiAgICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgICAgc2hvdyBcImNvdWxkIG5vdCBraWxsICN7IHMgfSBiZWNhdXNlICN7IGVycm9yIH1cIlxuICAgICAgY2FsbGJhY2s/KClcblxuICBzdG9wOiAoKSAtPlxuICAgIEBraWxsQWxsKClcbiAgICBAc3RvcHBlZCA9IHRydWVcblxuICBfb25SZWNlaXZlOiAocmVjZWl2ZUluZm8pID0+XG4gICAgc2hvdyhcIkNsaWVudCBzb2NrZXQgJ3JlY2VpdmUnIGV2ZW50OiBzZD1cIiArIHJlY2VpdmVJbmZvLnNvY2tldElkXG4gICAgKyBcIiwgYnl0ZXM9XCIgKyByZWNlaXZlSW5mby5kYXRhLmJ5dGVMZW5ndGgpXG5cbiAgX29uTGlzdGVuOiAoc2VydmVyU29ja2V0SWQsIHJlc3VsdENvZGUpID0+XG4gICAgcmV0dXJuIHNob3cgJ0Vycm9yIExpc3RlbmluZzogJyArIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIGlmIHJlc3VsdENvZGUgPCAwXG4gICAgQHNlcnZlclNvY2tldElkID0gc2VydmVyU29ja2V0SWRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0LmFkZExpc3RlbmVyIEBfb25BY2NlcHRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0RXJyb3IuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdEVycm9yXG4gICAgQHRjcC5vblJlY2VpdmUuYWRkTGlzdGVuZXIgQF9vblJlY2VpdmVcbiAgICAjIHNob3cgXCJbXCIrc29ja2V0SW5mby5wZWVyQWRkcmVzcytcIjpcIitzb2NrZXRJbmZvLnBlZXJQb3J0K1wiXSBDb25uZWN0aW9uIGFjY2VwdGVkIVwiO1xuICAgICMgaW5mbyA9IEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICMgQGdldEZpbGUgdXJpLCAoZmlsZSkgLT5cbiAgX29uQWNjZXB0RXJyb3I6IChlcnJvcikgLT5cbiAgICBzaG93IGVycm9yXG5cbiAgX29uQWNjZXB0OiAoc29ja2V0SW5mbykgPT5cbiAgICAjIHJldHVybiBudWxsIGlmIGluZm8uc29ja2V0SWQgaXNudCBAc2VydmVyU29ja2V0SWRcbiAgICBzaG93KFwiU2VydmVyIHNvY2tldCAnYWNjZXB0JyBldmVudDogc2Q9XCIgKyBzb2NrZXRJbmZvLnNvY2tldElkKVxuICAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZCwgKGluZm8pID0+XG4gICAgICBAZ2V0TG9jYWxGaWxlIGluZm8sXG4gICAgICAgIChmaWxlRW50cnksIGZpbGVSZWFkZXIpID0+XG4gICAgICAgICAgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldEluZm8uc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZVJlYWRlciwgaW5mby5rZWVwQWxpdmUsXG4gICAgICAgIChlcnJvcikgPT5cbiAgICAgICAgICBAX3dyaXRlRXJyb3Igc29ja2V0SW5mby5zb2NrZXRJZCwgNDA0LCBpbmZvLmtlZXBBbGl2ZVxuICAgICMgQHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG5cblxuICBzdHJpbmdUb1VpbnQ4QXJyYXk6IChzdHJpbmcpIC0+XG4gICAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHN0cmluZy5sZW5ndGgpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICBpID0gMFxuXG4gICAgd2hpbGUgaSA8IHN0cmluZy5sZW5ndGhcbiAgICAgIHZpZXdbaV0gPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuICAgICAgaSsrXG4gICAgdmlld1xuXG4gIGFycmF5QnVmZmVyVG9TdHJpbmc6IChidWZmZXIpIC0+XG4gICAgc3RyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIHMgPSAwXG5cbiAgICB3aGlsZSBzIDwgdUFycmF5VmFsLmxlbmd0aFxuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodUFycmF5VmFsW3NdKVxuICAgICAgcysrXG4gICAgc3RyXG5cbiAgX3dyaXRlMjAwUmVzcG9uc2U6IChzb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlLCBrZWVwQWxpdmUpIC0+XG4gICAgY29udGVudFR5cGUgPSAoaWYgKGZpbGUudHlwZSBpcyBcIlwiKSB0aGVuIFwidGV4dC9wbGFpblwiIGVsc2UgZmlsZS50eXBlKVxuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgMjAwIE9LXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuXG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXJcbiAgICByZWFkZXIub25sb2FkID0gKGV2KSA9PlxuICAgICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZXYudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICAgIHNob3cgd3JpdGVJbmZvXG4gICAgICAgICMgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIub25lcnJvciA9IChlcnJvcikgPT5cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBmaWxlXG5cblxuICAgICMgQGVuZCBzb2NrZXRJZFxuICAgICMgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAjIGZpbGVSZWFkZXIub25sb2FkID0gKGUpID0+XG4gICAgIyAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgIyAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAjICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgIyAgICAgICBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SWRcblxuXG4gIF9yZWFkRnJvbVNvY2tldDogKHNvY2tldElkLCBjYikgLT5cbiAgICBAc29ja2V0LnJlYWQgc29ja2V0SWQsIChyZWFkSW5mbykgPT5cbiAgICAgIHNob3cgXCJSRUFEXCIsIHJlYWRJbmZvXG5cbiAgICAgICMgUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICBkYXRhID0gQGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSlcbiAgICAgIHNob3cgZGF0YVxuXG4gICAgICBpZiBkYXRhLmluZGV4T2YoXCJHRVQgXCIpIGlzbnQgMFxuICAgICAgICBAZW5kIHNvY2tldElkXG4gICAgICAgIHJldHVyblxuXG4gICAgICBrZWVwQWxpdmUgPSBmYWxzZVxuICAgICAga2VlcEFsaXZlID0gdHJ1ZSBpZiBkYXRhLmluZGV4T2YgJ0Nvbm5lY3Rpb246IGtlZXAtYWxpdmUnIGlzbnQgLTFcblxuICAgICAgdXJpRW5kID0gZGF0YS5pbmRleE9mKFwiIFwiLCA0KVxuXG4gICAgICByZXR1cm4gZW5kIHNvY2tldElkIGlmIHVyaUVuZCA8IDBcblxuICAgICAgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKVxuICAgICAgaWYgbm90IHVyaT9cbiAgICAgICAgd3JpdGVFcnJvciBzb2NrZXRJZCwgNDA0LCBrZWVwQWxpdmVcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGluZm8gPVxuICAgICAgICB1cmk6IHVyaVxuICAgICAgICBrZWVwQWxpdmU6a2VlcEFsaXZlXG4gICAgICBpbmZvLnJlZmVyZXIgPSBkYXRhLm1hdGNoKC9SZWZlcmVyOlxccyguKikvKT9bMV1cbiAgICAgICNzdWNjZXNzXG4gICAgICBjYj8gaW5mb1xuXG4gIGVuZDogKHNvY2tldElkLCBrZWVwQWxpdmUpIC0+XG4gICAgICAjIGlmIGtlZXBBbGl2ZVxuICAgICAgIyAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICMgZWxzZVxuICAgIEBzb2NrZXQuZGlzY29ubmVjdCBzb2NrZXRJZFxuICAgIEBzb2NrZXQuZGVzdHJveSBzb2NrZXRJZFxuICAgIHNob3cgJ2VuZGluZyAnICsgc29ja2V0SWRcbiAgICBAc29ja2V0LmFjY2VwdCBAc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG4gIF93cml0ZUVycm9yOiAoc29ja2V0SWQsIGVycm9yQ29kZSwga2VlcEFsaXZlKSAtPlxuICAgIGZpbGUgPSBzaXplOiAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogYmVnaW4uLi4gXCJcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBmaWxlID0gXCIgKyBmaWxlXG4gICAgY29udGVudFR5cGUgPSBcInRleHQvcGxhaW5cIiAjKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIFwiICsgZXJyb3JDb2RlICsgXCIgTm90IEZvdW5kXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyBoZWFkZXIuLi5cIlxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyB2aWV3Li4uXCJcbiAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcblxuY2xhc3MgQXBwbGljYXRpb25cblxuICBjb25maWc6XG4gICAgQVBQX0lEOiAnbmZubW5ub25kZGNibGFjZWpkZW5maGljYWxia2lpb2QnXG4gICAgRVhURU5TSU9OX0lEOiAnYmRqaGJpb2dsZWFua2thZGdvbG9paGNiamFsbW5kYWwnXG5cbiAgZGF0YTpudWxsXG4gIExJU1RFTjogbnVsbFxuICBNU0c6IG51bGxcbiAgU3RvcmFnZTogbnVsbFxuICBGUzogbnVsbFxuICBTZXJ2ZXI6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBAU3RvcmFnZSA9IG5ldyBTdG9yYWdlXG4gICAgQEZTID0gbmV3IEZpbGVTeXN0ZW1cbiAgICBAU2VydmVyID0gbmV3IFNlcnZlclxuICAgIEBjb25maWcuU0VMRl9JRCA9IGNocm9tZS5ydW50aW1lLmlkXG4gICAgQGNvbmZpZy5FWFRfSUQgPSBpZiBAY29uZmlnLkFQUF9JRCBpcyBAY29uZmlnLlNFTEZfSUQgdGhlbiBAY29uZmlnLkVYVEVOU0lPTl9JRCBlbHNlIEBjb25maWcuQVBQX0lEXG4gICAgQGNvbmZpZy5FWFRfVFlQRSA9IGlmIEBjb25maWcuQVBQX0lEIGlzbnQgQGNvbmZpZy5TRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuICAgIEBNU0cgPSBuZXcgTVNHIEBjb25maWdcbiAgICBATElTVEVOID0gbmV3IExJU1RFTiBAY29uZmlnXG5cbiAgICBAYXBwV2luZG93ID0gbnVsbFxuICAgIEBwb3J0ID0gMzEzMzdcbiAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgPT5cblxuXG4gIGxhdW5jaEFwcDogKGNiKSAtPlxuICAgIGNocm9tZS5tYW5hZ2VtZW50LmxhdW5jaEFwcCBAY29uZmlnLkFQUF9JRFxuXG4gIG9wZW5BcHA6ICgpID0+XG4gICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJyxcbiAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgYm91bmRzOlxuICAgICAgICB3aWR0aDo1MDBcbiAgICAgICAgaGVpZ2h0OjgwMCxcbiAgICAod2luKSA9PlxuICAgICAgQGFwcFdpbmRvdyA9IHdpbilcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxpY2F0aW9uXG4iXX0=
