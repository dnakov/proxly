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
        return _this.Storage.save('currentResources', result, function(saved) {
          return _this.MSG.Ext({
            'redirInfo': {
              matchingResources: _this.getMatchingResources(),
              maps: _this.maps,
              server: {
                url: 'http://' + _this.Server.host + ':' + _this.Server.port + '/slredir?'
              }
            }
          });
        });
      };
    })(this));
    this.LISTEN.Local('startServer', (function(_this) {
      return function() {
        return _this.startServer();
      };
    })(this));
    this.LISTEN.Ext('startServer', (function(_this) {
      return function() {
        return _this.startServer();
      };
    })(this));
    this.LISTEN.Local('stopServer', (function(_this) {
      return function() {
        return _this.stopServer();
      };
    })(this));
    return this.LISTEN.Ext('stopServer', (function(_this) {
      return function() {
        return _this.stopServer();
      };
    })(this));
  };

  AppBackground.prototype.cleanUp = function() {
    return this.stopServer();
  };

  AppBackground.prototype.getMatchingResources = function() {
    var matchingResources, res, _fn, _i, _len, _ref;
    matchingResources = [];
    _ref = this.data.currentResources;
    _fn = (function(_this) {
      return function(res) {
        var item, _j, _len1, _ref1, _results;
        _ref1 = _this.maps;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          item = _ref1[_j];
          if ((res.url.match(new RegExp(item.url)) != null) && (item.url != null)) {
            _results.push((function(item) {
              return matchingResources.push(res);
            })(item));
          }
        }
        return _results;
      };
    })(this);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      res = _ref[_i];
      _fn(res);
    }
    return matchingResources;
  };

  AppBackground.prototype.getLocalFile = function(info, success, error) {
    return this.findFileForQueryString(info.uri, success, (function(_this) {
      return function(err) {
        return _this.findFileForPath(info, success, error);
      };
    })(this));
  };

  AppBackground.prototype.findFileForPath = function(info, success, error) {
    return this.findFileForQueryString(info.uri, success, error, info.referer);
  };

  AppBackground.prototype.findFileForQueryString = function(_url, cb, error, referer) {
    var dir, dirEntry, filePath, item, match, url, _i, _len, _ref, _ref1;
    url = _url.replace(/.*?slredir\=/, '');
    _ref = this.maps;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if ((url.match(new RegExp(item.url)) != null) && (item.url != null) && (typeof match === "undefined" || match === null)) {
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

  AppBackground.prototype.startServer = function(cb, err) {
    if (this.Server.stopped === true) {
      return this.Server.start(null, null, null, (function(_this) {
        return function(socketInfo) {
          _this.MSG.Local({
            'server': _this.Server
          });
          return _this.Notify("Server Started", "Started Server http://" + _this.Server.host + ":" + _this.Server.port);
        };
      })(this), (function(_this) {
        return function(error) {
          return _this.Notify("Server Error", "Error Starting Server: " + error);
        };
      })(this));
    }
  };

  AppBackground.prototype.stopServer = function() {
    return this.Server.stop((function(_this) {
      return function(success) {
        _this.Notify('Server Stopped', "Server Stopped");
        return _this.MSG.Local({
          'server': null
        });
      };
    })(this), (function(_this) {
      return function(error) {
        return _this.Notify("Server Error", "Server could not be stopped: " + error);
      };
    })(this));
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
var Application, Data, FileSystem, LISTEN, MSG, Mapping, Notification, Server, Storage,
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

Notification = (function() {
  function Notification() {}

  Notification.prototype.show = function(title, message) {
    var uniqueId;
    uniqueId = function(length) {
      var id;
      if (length == null) {
        length = 8;
      }
      id = "";
      while (id.length < length) {
        id += Math.random().toString(36).substr(2);
      }
      return id.substr(0, length);
    };
    return chrome.notifications.create(uniqueId(), {
      type: 'basic',
      title: title,
      message: message,
      iconUrl: 'images/redir-on-38.png'
    }, function(callback) {
      return void 0;
    });
  };

  return Notification;

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

  Storage.prototype.save = function(key, item, cb) {
    var obj;
    obj = {};
    obj[key] = item;
    return this.api.set(obj, function(res) {
      return typeof cb === "function" ? cb() : void 0;
    });
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

  Server.prototype.port = 8085;

  Server.prototype.maxConnections = 500;

  Server.prototype.socketProperties = {
    persistent: true,
    name: 'SLRedirector'
  };

  Server.prototype.socketInfo = null;

  Server.prototype.getLocalFile = null;

  Server.prototype.socketIds = [];

  Server.prototype.stopped = true;

  function Server() {
    this._onAccept = __bind(this._onAccept, this);
    this._onListen = __bind(this._onListen, this);
    this._onReceive = __bind(this._onReceive, this);
  }

  Server.prototype.start = function(host, port, maxConnections, cb, err) {
    this.host = host != null ? host : this.host;
    this.port = port != null ? port : this.port;
    this.maxConnections = maxConnections != null ? maxConnections : this.maxConnections;
    return this.killAll((function(_this) {
      return function(success) {
        return _this.socket.create('tcp', {}, function(socketInfo) {
          _this.socketIds = [];
          _this.socketIds.push(socketInfo.socketId);
          chrome.storage.local.set({
            'socketIds': _this.socketIds
          });
          return _this.socket.listen(socketInfo.socketId, _this.host, _this.port, function(result) {
            if (result > -1) {
              show('listening ' + socketInfo.socketId);
              _this.stopped = false;
              _this.socketInfo = socketInfo;
              _this.socket.accept(socketInfo.socketId, _this._onAccept);
              return typeof cb === "function" ? cb(socketInfo) : void 0;
            } else {
              return typeof err === "function" ? err(result) : void 0;
            }
          });
        });
      };
    })(this), err != null);
  };

  Server.prototype.killAll = function(callback, error) {
    return chrome.storage.local.get('socketIds', (function(_this) {
      return function(result) {
        var cnt, s, _i, _len, _ref, _results;
        show('got ids');
        show(result);
        _this.socketIds = result.socketIds;
        cnt = 0;
        _ref = _this.socketIds;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          _results.push((function(s) {
            cnt++;
            return _this.socket.getInfo(s, function(socketInfo) {
              cnt--;
              if (chrome.runtime.lastError == null) {
                _this.socket.disconnect(s);
                _this.socket.destroy(s);
              }
              if (cnt === 0) {
                return typeof callback === "function" ? callback() : void 0;
              }
            });
          })(s));
        }
        return _results;
      };
    })(this));
  };

  Server.prototype.stop = function(callback, error) {
    return this.killAll((function(_this) {
      return function(success) {
        _this.stopped = true;
        return typeof callback === "function" ? callback() : void 0;
      };
    })(this), (function(_this) {
      return function(error) {
        return typeof error === "function" ? error(error) : void 0;
      };
    })(this));
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
    if ((socketInfo != null ? socketInfo.socketId : void 0) != null) {
      return this._readFromSocket(socketInfo.socketId, (function(_this) {
        return function(info) {
          return _this.getLocalFile(info, function(fileEntry, fileReader) {
            return _this._write200Response(socketInfo.socketId, fileEntry, fileReader, info.keepAlive);
          }, function(error) {
            return _this._writeError(socketInfo.socketId, 404, info.keepAlive);
          });
        };
      })(this));
    } else {
      return show("No socket?!");
    }
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
    var s, str, uArrayVal;
    str = "";
    uArrayVal = new Uint8Array(buffer);
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

  Application.prototype.Notify = null;

  function Application() {
    this.openApp = __bind(this.openApp, this);
    this.init = __bind(this.init, this);
    this.Notify = (new Notification).show;
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
    this.LISTEN.Ext('openApp', this.openApp);
    this.init();
  }

  Application.prototype.init = function() {};

  Application.prototype.launchUI = function(cb, error) {
    return this.launchApp((function(_this) {
      return function(extInfo) {
        _this.openApp();
        return typeof cb === "function" ? cb(extInfo) : void 0;
      };
    })(this), error);
  };

  Application.prototype.launchApp = function(cb, error, openUI) {
    return chrome.management.launchApp(this.config.APP_ID, (function(_this) {
      return function(extInfo) {
        if (chrome.runtime.lastError) {
          return error(chrome.runtime.lastError);
        } else {
          return typeof cb === "function" ? cb(extInfo) : void 0;
        }
      };
    })(this));
  };

  Application.prototype.openApp = function() {
    var _ref;
    if (((_ref = chrome.app) != null ? _ref.window : void 0) != null) {
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
    } else {
      return this.MSG.Ext({
        'openApp': true
      });
    }
  };

  return Application;

})();

module.exports = Application;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcmVkaXJlY3Rvci9hcHAvc3JjL2JhY2tncm91bmQuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcmVkaXJlY3Rvci9jb21tb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDVUEsSUFBQSwrQkFBQTtFQUFBOztpU0FBQTs7QUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBQWQsQ0FBQTs7QUFBQTtBQUdJLGtDQUFBLENBQUE7Ozs7Ozs7R0FBQTs7QUFBQSwwQkFBQSxZQUFBLEdBQWEsRUFBYixDQUFBOztBQUFBLDBCQUNBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDRixJQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsS0FBQyxDQUFBLElBQUQsR0FBUSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQWpCLENBQUE7ZUFDQSxLQUFDLENBQUEsSUFBRCxHQUFRLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FGRztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLENBQUEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLEdBQXVCLElBQUMsQ0FBQSxZQUp4QixDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBbUIsYUFBbkIsRUFBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsR0FBRCxHQUFBO2VB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RyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQWxCO2lCQUNFLEtBQUEsQ0FBTSxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQXJCLEVBREY7U0FBQSxNQUFBOzRDQUdFLEdBQUksa0JBSE47U0FEMEM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxFQURPO0VBQUEsQ0FyQ1gsQ0FBQTs7QUFBQSx3QkE0Q0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBRyw0REFBSDthQUNFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQWxCLENBQXlCLFlBQXpCLEVBQ0U7QUFBQSxRQUFBLEVBQUEsRUFBSSxTQUFKO0FBQUEsUUFDQSxNQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTSxHQUFOO0FBQUEsVUFDQSxNQUFBLEVBQU8sR0FEUDtTQUZGO09BREYsRUFLQSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxHQUFELEdBQUE7aUJBQ0UsS0FBQyxDQUFBLFNBQUQsR0FBYSxJQURmO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMQSxFQURGO0tBQUEsTUFBQTthQVNFLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxDQUFTO0FBQUEsUUFBQSxTQUFBLEVBQVUsSUFBVjtPQUFULEVBVEY7S0FETztFQUFBLENBNUNULENBQUE7O3FCQUFBOztJQTNhRixDQUFBOztBQUFBLE1Bb2VNLENBQUMsT0FBUCxHQUFpQixXQXBlakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyBzZXJ2ZXIgPSByZXF1aXJlICcuL3RjcC1zZXJ2ZXIuanMnXG5cbiMgZ2V0R2xvYmFsID0gLT5cbiMgICBfZ2V0R2xvYmFsID0gLT5cbiMgICAgIHRoaXNcblxuIyAgIF9nZXRHbG9iYWwoKVxuXG4jIHJvb3QgPSBnZXRHbG9iYWwoKVxuXG5BcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG4jYXBwID0gbmV3IGxpYi5BcHBsaWNhdGlvblxuY2xhc3MgQXBwQmFja2dyb3VuZCBleHRlbmRzIEFwcGxpY2F0aW9uXG4gICAgcmV0YWluZWREaXJzOnt9XG4gICAgaW5pdDogKCkgLT5cbiAgICAgICAgQFN0b3JhZ2UucmV0cmlldmVBbGwgKCkgPT5cbiAgICAgICAgICAgIEBkYXRhID0gQFN0b3JhZ2UuZGF0YVxuICAgICAgICAgICAgQG1hcHMgPSBAZGF0YS5tYXBzXG5cbiAgICAgICAgQFNlcnZlci5nZXRMb2NhbEZpbGUgPSBAZ2V0TG9jYWxGaWxlXG4gICAgICAgIEBTdG9yYWdlLm9uQ2hhbmdlZCAncmVzb3VyY2VNYXAnLCAob2JqKSA9PlxuICAgICAgICAgICAgQE1TRy5FeHQgb2JqXG5cbiAgICAgICAgQExJU1RFTi5FeHQgJ3Jlc291cmNlcycsIChyZXN1bHQpID0+XG4gICAgICAgICAgICBAU3RvcmFnZS5zYXZlICdjdXJyZW50UmVzb3VyY2VzJywgcmVzdWx0LCAoc2F2ZWQpID0+XG4gICAgICAgICAgICAgIEBNU0cuRXh0ICdyZWRpckluZm8nOlxuICAgICAgICAgICAgICAgICAgbWF0Y2hpbmdSZXNvdXJjZXM6QGdldE1hdGNoaW5nUmVzb3VyY2VzKClcbiAgICAgICAgICAgICAgICAgIG1hcHM6QG1hcHNcbiAgICAgICAgICAgICAgICAgIHNlcnZlcjpcbiAgICAgICAgICAgICAgICAgICAgICB1cmw6J2h0dHA6Ly8nICsgQFNlcnZlci5ob3N0ICsgJzonICsgQFNlcnZlci5wb3J0ICsgJy9zbHJlZGlyPydcblxuICAgICAgICBATElTVEVOLkxvY2FsICdzdGFydFNlcnZlcicsICgpID0+IEBzdGFydFNlcnZlcigpXG4gICAgICAgIEBMSVNURU4uRXh0ICdzdGFydFNlcnZlcicsICgpID0+IEBzdGFydFNlcnZlcigpXG4gICAgICAgIEBMSVNURU4uTG9jYWwgJ3N0b3BTZXJ2ZXInLCAoKSA9PiBAc3RvcFNlcnZlcigpXG4gICAgICAgIEBMSVNURU4uRXh0ICdzdG9wU2VydmVyJywgKCkgPT4gQHN0b3BTZXJ2ZXIoKVxuICAgICAgICAjIEBzdGFydFNlcnZlcigpXG4gICAgICAgICMgdHJ5XG4gICAgICAgICMgICAgIGNocm9tZS5hcHAucnVudGltZS5vblJlc3RhcnRlZC5hZGRMaXN0ZW5lciBAY2xlYW5VcFxuICAgICAgICAjIGNhdGNoIGVycm9yXG4gICAgICAgICMgICAgIHNob3cgZXJyb3JcblxuXG4gICAgY2xlYW5VcDogKCkgLT5cbiAgICAgICAgQHN0b3BTZXJ2ZXIoKVxuXG4gICAgZ2V0TWF0Y2hpbmdSZXNvdXJjZXM6ICgpIC0+XG4gICAgICBtYXRjaGluZ1Jlc291cmNlcyA9IFtdXG4gICAgICBmb3IgcmVzIGluIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXNcbiAgICAgICAgZG8gKHJlcykgPT5cbiAgICAgICAgICBmb3IgaXRlbSBpbiBAbWFwcyB3aGVuIHJlcy51cmwubWF0Y2gobmV3IFJlZ0V4cChpdGVtLnVybCkpPyBhbmQgaXRlbS51cmw/XG4gICAgICAgICAgICBkbyAoaXRlbSkgPT5cbiAgICAgICAgICAgICAgbWF0Y2hpbmdSZXNvdXJjZXMucHVzaCByZXNcbiAgICAgIHJldHVybiBtYXRjaGluZ1Jlc291cmNlc1xuXG5cbiAgICBnZXRMb2NhbEZpbGU6IChpbmZvLCBzdWNjZXNzLCBlcnJvcikgPT5cblxuICAgICAgICBAZmluZEZpbGVGb3JRdWVyeVN0cmluZyBpbmZvLnVyaSwgc3VjY2VzcyxcbiAgICAgICAgICAgIChlcnIpID0+XG4gICAgICAgICAgICAgICAgQGZpbmRGaWxlRm9yUGF0aCBpbmZvLCBzdWNjZXNzLCBlcnJvclxuXG4gICAgZmluZEZpbGVGb3JQYXRoOiAoaW5mbywgc3VjY2VzcywgZXJyb3IpID0+XG4gICAgICAgIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBzdWNjZXNzLCBlcnJvciwgaW5mby5yZWZlcmVyXG5cbiAgICBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nOiAoX3VybCwgY2IsIGVycm9yLCByZWZlcmVyKSA9PlxuICAgICAgICB1cmwgPSBfdXJsLnJlcGxhY2UgLy4qP3NscmVkaXJcXD0vLCAnJ1xuXG4gICAgICAgIG1hdGNoID0gaXRlbSBmb3IgaXRlbSBpbiBAbWFwcyB3aGVuIHVybC5tYXRjaChuZXcgUmVnRXhwKGl0ZW0udXJsKSk/IGFuZCBpdGVtLnVybD8gYW5kIG5vdCBtYXRjaD9cblxuICAgICAgICBpZiBtYXRjaD9cbiAgICAgICAgICAgIGlmIHJlZmVyZXI/XG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSB1cmwubWF0Y2goLy4qXFwvXFwvLio/XFwvKC4qKS8pP1sxXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXRjaC51cmwpLCBtYXRjaC5yZWdleFJlcGxcbiAgICAgICAgICAgIGRpciA9IEBTdG9yYWdlLmRhdGEuZGlyZWN0b3JpZXNbbWF0Y2guZGlyZWN0b3J5XVxuXG4gICAgICAgICAgICBpZiBub3QgZGlyPyB0aGVuIHJldHVybiBlcnIgJ25vIG1hdGNoJ1xuXG4gICAgICAgICAgICBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgICAgICAgICAgICAgICBkaXJFbnRyeSA9IEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdXG4gICAgICAgICAgICAgICAgQEZTLnJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICAgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgICAgICAgICAgICAgICAgICAgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0gPSBkaXJFbnRyeVxuICAgICAgICAgICAgICAgICAgICBARlMucmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAgICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycm9yKClcblxuXG4gICAgc3RhcnRTZXJ2ZXI6IChjYiwgZXJyKSAtPlxuICAgICAgICBpZiBAU2VydmVyLnN0b3BwZWQgaXMgdHJ1ZVxuICAgICAgICAgICAgQFNlcnZlci5zdGFydCBudWxsLG51bGwsbnVsbCwgKHNvY2tldEluZm8pID0+XG4gICAgICAgICAgICAgICAgQE1TRy5Mb2NhbCAnc2VydmVyJzpAU2VydmVyXG4gICAgICAgICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBTdGFydGVkXCIsIFwiU3RhcnRlZCBTZXJ2ZXIgaHR0cDovLyN7IEBTZXJ2ZXIuaG9zdCB9OiN7QFNlcnZlci5wb3J0fVwiXG4gICAgICAgICAgICAsKGVycm9yKSA9PlxuICAgICAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIkVycm9yIFN0YXJ0aW5nIFNlcnZlcjogI3sgZXJyb3IgfVwiXG5cbiAgICBzdG9wU2VydmVyOiAoKSAtPlxuICAgICAgICBAU2VydmVyLnN0b3AgKHN1Y2Nlc3MpID0+XG4gICAgICAgICAgICBATm90aWZ5ICdTZXJ2ZXIgU3RvcHBlZCcsIFwiU2VydmVyIFN0b3BwZWRcIlxuICAgICAgICAgICAgQE1TRy5Mb2NhbCAnc2VydmVyJzpudWxsXG4gICAgICAgICwoZXJyb3IpID0+XG4gICAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIEVycm9yXCIsXCJTZXJ2ZXIgY291bGQgbm90IGJlIHN0b3BwZWQ6ICN7IGVycm9yIH1cIlxuXG5hcHAgPSBuZXcgQXBwQmFja2dyb3VuZFxuXG5cblxuIyMjXG4gdmFyIHdoaXRlbGlzdGVkSWQgPSAncG1nbm5iZGZtbXBka2dhYW1rZGlpcGZnamJwZ2lvZmMnO1xuICB2YXIgYWRkRGlyZWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJywge1xuICAgICAgICBpZDogXCJtYWlud2luXCIsXG4gICAgICAgIGJvdW5kczoge1xuICAgICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgICBoZWlnaHQ6IDUwXG4gICAgICAgIH0sXG4gICAgfSwgZnVuY3Rpb24od2luKSB7XG4gICAgICAgIG1haW5XaW4gPSB3aW47XG4gICAgfSk7XG4gIH1cblxuXG5cbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgLy8gaWYgKHNlbmRlci5pZCAhPSB3aGl0ZWxpc3RlZElkKVxuICAgICAgICAgIC8vICAgcmV0dXJuIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiR290IERpcmVjdG9yeVwifSk7XG4gICAgICAgICAgICBzaG93KHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCk7XG4gICAgICAgICAgICBkaXJlY3Rvcmllcy5wdXNoKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCk7XG4gICAgICAgICAgICAvLyBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkLCBmdW5jdGlvbihkaXJlY3RvcnlFbnRyeSkge1xuICAgICAgICAgICAgLy8gICAgIHNob3coZGlyZWN0b3J5RW50cnkpO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BzLCBJIGRvbid0IHVuZGVyc3RhbmQgdGhpcyBtZXNzYWdlXCJ9KTtcbiAgICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbC5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICBpZiAoc2VuZGVyLmlkICE9IHdoaXRlbGlzdGVkSWQpIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgICAgcmV0dXJuOyAgLy8gZG9uJ3QgYWxsb3cgdGhpcyBleHRlbnNpb24gYWNjZXNzXG4gICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm9wZW5EaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wZW5pbmcgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIGFkZERpcmVjdG9yeSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgc29ja2V0LmNyZWF0ZShcInRjcFwiLCB7fSwgZnVuY3Rpb24oX3NvY2tldEluZm8pIHtcbiAgICAgICAgc29ja2V0SW5mbyA9IF9zb2NrZXRJbmZvO1xuICAgICAgICBzb2NrZXQubGlzdGVuKHNvY2tldEluZm8uc29ja2V0SWQsIFwiMTI3LjAuMC4xXCIsIDMzMzMzLCA1MCwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIHNob3coXCJMSVNURU5JTkc6XCIsIHJlc3VsdCk7XG4gICAgICAgIHNvY2tldC5hY2NlcHQoc29ja2V0SW5mby5zb2NrZXRJZCwgb25BY2NlcHQpO1xuICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdmFyIHN0b3BTb2NrZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SW5mby5zb2NrZXRJZCk7XG4gICAgfVxuXG5cbiMjI1xuXG4jIyNcbm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3RhcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpO1xuICB2YXIgc3RvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcFwiKTtcbiAgdmFyIGhvc3RzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJob3N0c1wiKTtcbiAgdmFyIHBvcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBvcnRcIik7XG4gIHZhciBkaXJlY3RvcnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpcmVjdG9yeVwiKTtcblxuICB2YXIgc29ja2V0ID0gY2hyb21lLnNvY2tldDtcbiAgdmFyIHNvY2tldEluZm87XG4gIHZhciBmaWxlc01hcCA9IHt9O1xuXG4gIHZhciByb290RGlyO1xuICB2YXIgcG9ydCwgZXh0UG9ydDtcbiAgdmFyIGRpcmVjdG9yaWVzID0gW107XG5cbiAgdmFyIHN0cmluZ1RvVWludDhBcnJheSA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyaW5nLmxlbmd0aCk7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZpZXdbaV0gPSBzdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZpZXc7XG4gIH07XG5cbiAgdmFyIGFycmF5QnVmZmVyVG9TdHJpbmcgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICB2YXIgc3RyID0gJyc7XG4gICAgdmFyIHVBcnJheVZhbCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgZm9yKHZhciBzID0gMDsgcyA8IHVBcnJheVZhbC5sZW5ndGg7IHMrKykge1xuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodUFycmF5VmFsW3NdKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbiAgfTtcblxuICB2YXIgbG9nVG9TY3JlZW4gPSBmdW5jdGlvbihsb2cpIHtcbiAgICBsb2dnZXIudGV4dENvbnRlbnQgKz0gbG9nICsgXCJcXG5cIjtcbiAgfVxuXG4gIHZhciB3cml0ZUVycm9yUmVzcG9uc2UgPSBmdW5jdGlvbihzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIHtcbiAgICB2YXIgZmlsZSA9IHsgc2l6ZTogMCB9O1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IGJlZ2luLi4uIFwiKTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBmaWxlID0gXCIgKyBmaWxlKTtcbiAgICB2YXIgY29udGVudFR5cGUgPSBcInRleHQvcGxhaW5cIjsgLy8oZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIHZhciBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplO1xuICAgIHZhciBoZWFkZXIgPSBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCBcIiArIGVycm9yQ29kZSArIFwiIE5vdCBGb3VuZFxcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoIGtlZXBBbGl2ZSA/IFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIDogXCJcIikgKyBcIlxcblxcblwiKTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgaGVhZGVyLi4uXCIpO1xuICAgIHZhciBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpO1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0KGhlYWRlciwgMCk7XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIik7XG4gICAgc29ja2V0LndyaXRlKHNvY2tldElkLCBvdXRwdXRCdWZmZXIsIGZ1bmN0aW9uKHdyaXRlSW5mbykge1xuICAgICAgc2hvdyhcIldSSVRFXCIsIHdyaXRlSW5mbyk7XG4gICAgICBpZiAoa2VlcEFsaXZlKSB7XG4gICAgICAgIHJlYWRGcm9tU29ja2V0KHNvY2tldElkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldElkKTtcbiAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjpmaWxlcmVhZGVyOjogZW5kIG9ubG9hZC4uLlwiKTtcblxuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IGVuZC4uLlwiKTtcbiAgfTtcblxuICB2YXIgd3JpdGUyMDBSZXNwb25zZSA9IGZ1bmN0aW9uKHNvY2tldElkLCBmaWxlLCBrZWVwQWxpdmUpIHtcbiAgICB2YXIgY29udGVudFR5cGUgPSAoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIHZhciBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplO1xuICAgIHZhciBoZWFkZXIgPSBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKCBrZWVwQWxpdmUgPyBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiA6IFwiXCIpICsgXCJcXG5cXG5cIik7XG4gICAgdmFyIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSk7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQoaGVhZGVyLCAwKTtcblxuICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICB2aWV3LnNldChuZXcgVWludDhBcnJheShlLnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aCk7XG4gICAgICAgc29ja2V0LndyaXRlKHNvY2tldElkLCBvdXRwdXRCdWZmZXIsIGZ1bmN0aW9uKHdyaXRlSW5mbykge1xuICAgICAgICAgc2hvdyhcIldSSVRFXCIsIHdyaXRlSW5mbyk7XG4gICAgICAgICBpZiAoa2VlcEFsaXZlKSB7XG4gICAgICAgICAgIHJlYWRGcm9tU29ja2V0KHNvY2tldElkKTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldElkKTtcbiAgICAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihmaWxlKTtcbiAgfTtcblxuICB2YXIgb25BY2NlcHQgPSBmdW5jdGlvbihhY2NlcHRJbmZvKSB7XG4gICAgc2hvdyhcIkFDQ0VQVFwiLCBhY2NlcHRJbmZvKVxuICAgIHJlYWRGcm9tU29ja2V0KGFjY2VwdEluZm8uc29ja2V0SWQpO1xuICB9O1xuXG4gIHZhciByZWFkRnJvbVNvY2tldCA9IGZ1bmN0aW9uKHNvY2tldElkKSB7XG4gICAgLy8gIFJlYWQgaW4gdGhlIGRhdGFcbiAgICBzb2NrZXQucmVhZChzb2NrZXRJZCwgZnVuY3Rpb24ocmVhZEluZm8pIHtcbiAgICAgIHNob3coXCJSRUFEXCIsIHJlYWRJbmZvKTtcbiAgICAgIC8vIFBhcnNlIHRoZSByZXF1ZXN0LlxuICAgICAgdmFyIGRhdGEgPSBhcnJheUJ1ZmZlclRvU3RyaW5nKHJlYWRJbmZvLmRhdGEpO1xuICAgICAgaWYoZGF0YS5pbmRleE9mKFwiR0VUIFwiKSA9PSAwKSB7XG4gICAgICAgIHZhciBrZWVwQWxpdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKGRhdGEuaW5kZXhPZihcIkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIikgIT0gLTEpIHtcbiAgICAgICAgICBrZWVwQWxpdmUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UgY2FuIG9ubHkgZGVhbCB3aXRoIEdFVCByZXF1ZXN0c1xuICAgICAgICB2YXIgdXJpRW5kID0gIGRhdGEuaW5kZXhPZihcIiBcIiwgNCk7XG4gICAgICAgIGlmKHVyaUVuZCA8IDApIHsgICByZXR1cm47IH1cbiAgICAgICAgdmFyIHVyaSA9IGRhdGEuc3Vic3RyaW5nKDQsIHVyaUVuZCk7XG4gICAgICAgIC8vIHN0cmlwIHF5ZXJ5IHN0cmluZ1xuICAgICAgICB2YXIgcSA9IHVyaS5pbmRleE9mKFwiP1wiKTtcbiAgICAgICAgaWYgKHEgIT0gLTEpIHtcbiAgICAgICAgICB1cmkgPSB1cmkuc3Vic3RyaW5nKDAsIHEpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5KGRpcmVjdG9yaWVzWzBdKVxuICAgICAgICAudGhlbihcbiAgICAgICAgICAgIChmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGlyZWN0b3J5RW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgIHNob3codXJpKTtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5RW50cnkuZ2V0RmlsZSgnbXlOZXdBcHBERVYucmVzb3VyY2UvaW5kZXguanMnLCB7fSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdyhmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRlMjAwUmVzcG9uc2Uoc29ja2V0SWQsIGZpbGUsIGtlZXBBbGl2ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdyhlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfSkodXJpKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIHZhciBmaWxlID1cbiAgICAgICAgLy8gaWYoISFmaWxlID09IGZhbHNlKSB7XG4gICAgICAgIC8vICAgY29uc29sZS53YXJuKFwiRmlsZSBkb2VzIG5vdCBleGlzdC4uLlwiICsgdXJpKTtcbiAgICAgICAgLy8gICB3cml0ZUVycm9yUmVzcG9uc2Uoc29ja2V0SWQsIDQwNCwga2VlcEFsaXZlKTtcbiAgICAgICAgLy8gICByZXR1cm47XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gbG9nVG9TY3JlZW4oXCJHRVQgMjAwIFwiICsgdXJpKTtcbiAgICAgICAgLy8gd3JpdGUyMDBSZXNwb25zZShzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKTtcbiAgICAgIC8vIH1cbiAgICAgIC8vIGVsc2Uge1xuICAgICAgICAvLyBUaHJvdyBhbiBlcnJvclxuICAgICAgICAvLyBzb2NrZXQuZGVzdHJveShzb2NrZXRJZCk7XG4gICAgICAvLyB9XG5cbiAgfTtcbn0pO1xufVxuXG5cbiAgdmFyIHdoaXRlbGlzdGVkSWQgPSAncG1nbm5iZGZtbXBka2dhYW1rZGlpcGZnamJwZ2lvZmMnO1xuXG5cbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbC5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICBpZiAoc2VuZGVyLmlkICE9IHdoaXRlbGlzdGVkSWQpIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgICAgcmV0dXJuOyAgLy8gZG9uJ3QgYWxsb3cgdGhpcyBleHRlbnNpb24gYWNjZXNzXG4gICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm9wZW5EaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wZW5pbmcgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIGFkZERpcmVjdG9yeSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuXG5cbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgLy8gaWYgKHNlbmRlci5pZCAhPSB3aGl0ZWxpc3RlZElkKVxuICAgICAgICAgIC8vICAgcmV0dXJuIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiR290IERpcmVjdG9yeVwifSk7XG4gICAgICAgICAgICBzaG93KHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCk7XG4gICAgICAgICAgICBkaXJlY3Rvcmllcy5wdXNoKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCk7XG4gICAgICAgICAgICAvLyBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkLCBmdW5jdGlvbihkaXJlY3RvcnlFbnRyeSkge1xuICAgICAgICAgICAgLy8gICAgIHNob3coZGlyZWN0b3J5RW50cnkpO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BzLCBJIGRvbid0IHVuZGVyc3RhbmQgdGhpcyBtZXNzYWdlXCJ9KTtcbiAgICAgICAgICB9XG4gICAgICB9KTtcbiAgICBzb2NrZXQuY3JlYXRlKFwidGNwXCIsIHt9LCBmdW5jdGlvbihfc29ja2V0SW5mbykge1xuICAgICAgICBzb2NrZXRJbmZvID0gX3NvY2tldEluZm87XG4gICAgICAgIHNvY2tldC5saXN0ZW4oc29ja2V0SW5mby5zb2NrZXRJZCwgXCIxMjcuMC4wLjFcIiwgMzMzMzMsIDUwLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgc2hvdyhcIkxJU1RFTklORzpcIiwgcmVzdWx0KTtcbiAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgc3RvcFNvY2tldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzb2NrZXQuZGVzdHJveShzb2NrZXRJbmZvLnNvY2tldElkKTtcbiAgICB9XG5cbiAgdmFyIGFkZERpcmVjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsIHtcbiAgICAgICAgaWQ6IFwibWFpbndpblwiLFxuICAgICAgICBib3VuZHM6IHtcbiAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgaGVpZ2h0OiA1MFxuICAgICAgICB9LFxuICAgIH0sIGZ1bmN0aW9uKHdpbikge1xuICAgICAgICBtYWluV2luID0gd2luO1xuICAgIH0pO1xuICB9XG5cbn07XG4jIyNcbiIsIiMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE3NDIwOTNcbigoKSAtPlxuICBtZXRob2RzID0gW1xuICAgICdhc3NlcnQnLCAnY2xlYXInLCAnY291bnQnLCAnZGVidWcnLCAnZGlyJywgJ2RpcnhtbCcsICdlcnJvcicsXG4gICAgJ2V4Y2VwdGlvbicsICdncm91cCcsICdncm91cENvbGxhcHNlZCcsICdncm91cEVuZCcsICdpbmZvJywgJ2xvZycsXG4gICAgJ21hcmtUaW1lbGluZScsICdwcm9maWxlJywgJ3Byb2ZpbGVFbmQnLCAndGFibGUnLCAndGltZScsICd0aW1lRW5kJyxcbiAgICAndGltZVN0YW1wJywgJ3RyYWNlJywgJ3dhcm4nXVxuICBub29wID0gKCkgLT5cbiAgICAjIHN0dWIgdW5kZWZpbmVkIG1ldGhvZHMuXG4gICAgZm9yIG0gaW4gbWV0aG9kcyAgd2hlbiAgIWNvbnNvbGVbbV1cbiAgICAgIGNvbnNvbGVbbV0gPSBub29wXG5cbiAgaWYgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQ/XG4gICAgd2luZG93LnNob3cgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlKVxuICBlbHNlXG4gICAgd2luZG93LnNob3cgPSAoKSAtPlxuICAgICAgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cylcbikoKVxuXG5jbGFzcyBOb3RpZmljYXRpb25cbiAgc2hvdzogKHRpdGxlLCBtZXNzYWdlKSAtPlxuICAgIHVuaXF1ZUlkID0gKGxlbmd0aD04KSAtPlxuICAgICAgaWQgPSBcIlwiXG4gICAgICBpZCArPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMikgd2hpbGUgaWQubGVuZ3RoIDwgbGVuZ3RoXG4gICAgICBpZC5zdWJzdHIgMCwgbGVuZ3RoXG5cbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUgdW5pcXVlSWQoKSxcbiAgICAgIHR5cGU6J2Jhc2ljJ1xuICAgICAgdGl0bGU6dGl0bGVcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgIGljb25Vcmw6J2ltYWdlcy9yZWRpci1vbi0zOC5wbmcnLFxuICAgICAgKGNhbGxiYWNrKSAtPlxuICAgICAgICB1bmRlZmluZWRcblxuXG5cbmNsYXNzIE1TR1xuICBpc0NvbnRlbnRTY3JpcHQ6IGxvY2F0aW9uLnByb3RvY29sIGlzbnQgJ2Nocm9tZS1leHRlbnNpb246J1xuICBjb25zdHJ1Y3RvcjogKGNvbmZpZykgLT5cbiAgICBAY29uZmlnID0gY29uZmlnXG4gIExvY2FsOiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICBzaG93IFwiPT0gTUVTU0FHRSAjeyBKU09OLnN0cmluZ2lmeSBtZXNzYWdlIH0gPT0+XCJcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBtZXNzYWdlLCByZXNwb25kXG4gIEV4dDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgc2hvdyBcIj09IE1FU1NBR0UgI3sgSlNPTi5zdHJpbmdpZnkgbWVzc2FnZSB9ID09PlwiXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgQGNvbmZpZy5FWFRfSUQsIG1lc3NhZ2UsIHJlc3BvbmRcblxuY2xhc3MgTElTVEVOXG4gIGxvY2FsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlXG4gICAgbGlzdGVuZXJzOnt9XG4gIGV4dGVybmFsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWxcbiAgICBsaXN0ZW5lcnM6e31cbiAgY29uc3RydWN0b3I6IChjb25maWcpIC0+XG4gICAgQGNvbmZpZyA9IGNvbmZpZ1xuICAgIEBsb2NhbC5hcGkuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwuYXBpPy5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgTG9jYWw6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICBAbG9jYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBFeHQ6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBfb25NZXNzYWdlRXh0ZXJuYWw6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICBzaG93IFwiPD09IEVYVEVSTkFMIE1FU1NBR0UgPT0gI3sgQGNvbmZpZy5FWFRfVFlQRSB9ID09XCIgKyByZXF1ZXN0XG4gICAgaWYgc2VuZGVyLmlkIGlzbnQgQGNvbmZpZy5FWFRfSUQgdGhlbiByZXR1cm4gdW5kZWZpbmVkXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIHNlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcbiAgICAjIHNlbmRSZXNwb25zZSByZXF1ZXN0W2tleV0gZm9yIGtleSBvZiByZXF1ZXN0XG5cbiAgX29uTWVzc2FnZTogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHNob3cgXCI8PT0gTUVTU0FHRSA9PSAjeyBAY29uZmlnLkVYVF9UWVBFIH0gPT1cIiArIHJlcXVlc3RcbiAgICBAbG9jYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuXG5jbGFzcyBEYXRhXG4gIG1hcHBpbmc6W1xuICAgIGRpcmVjdG9yeTpudWxsXG4gICAgdXJsUGF0dGVybjpudWxsXG4gIF1cbiAgcmVzb3VyY2VzOltcbiAgICByZXNvdXJjZTpudWxsXG4gICAgZmlsZTpudWxsXG4gIF1cblxuXG5cbmNsYXNzIFN0b3JhZ2VcbiAgYXBpOiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICBkYXRhOiB7fVxuICBjYWxsYmFjazogKCkgLT5cbiAgY29uc3RydWN0b3I6IChjYWxsYmFjaykgLT5cbiAgICBAY2FsbGJhY2sgPSBjYWxsYmFja1xuICAgIEByZXRyaWV2ZUFsbCgpXG4gICAgQG9uQ2hhbmdlZEFsbCgpXG5cbiAgc2F2ZTogKGtleSwgaXRlbSwgY2IpIC0+XG4gICAgb2JqID0ge31cbiAgICBvYmpba2V5XSA9IGl0ZW1cbiAgICBAYXBpLnNldCBvYmosIChyZXMpIC0+XG4gICAgICBjYj8oKVxuXG4gIHNhdmVBbGw6ICgpIC0+XG4gICAgQGFwaS5zZXQgQGRhdGFcblxuICByZXRyaWV2ZTogKGtleSwgY2IpIC0+XG4gICAgQGFwaS5nZXQga2V5LCAocmVzdWx0cykgLT5cbiAgICAgIEBkYXRhW3JdID0gcmVzdWx0c1tyXSBmb3IgciBvZiByZXN1bHRzXG4gICAgICBpZiBjYj8gdGhlbiBjYiByZXN1bHRzW2tleV1cblxuXG4gIHJldHJpZXZlQWxsOiAoY2IpIC0+XG4gICAgQGFwaS5nZXQgKHJlc3VsdCkgPT5cbiAgICAgIEBkYXRhID0gcmVzdWx0XG4gICAgICBAY2FsbGJhY2s/IHJlc3VsdFxuICAgICAgY2I/IHJlc3VsdFxuICAgICAgc2hvdyByZXN1bHRcblxuICBvbkNoYW5nZWQ6IChrZXksIGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgaWYgY2hhbmdlc1trZXldPyBhbmQgY2I/IHRoZW4gY2IgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuICBvbkNoYW5nZWRBbGw6ICgpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLG5hbWVzcGFjZSkgPT5cbiAgICAgIEBkYXRhW2NdID0gY2hhbmdlc1tjXS5uZXdWYWx1ZSBmb3IgYyBvZiBjaGFuZ2VzXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuXG4jIGNsYXNzIERpcmVjdG9yeVN0b3JlXG4jICAgZGlyZWN0b3JpZXMgPVxuIyAgIGNvbnN0cnVjdG9yICgpIC0+XG5cbiMgY2xhc3MgRGlyZWN0b3J5XG5cblxuY2xhc3MgRmlsZVN5c3RlbVxuICBhcGk6IGNocm9tZS5maWxlU3lzdGVtXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG5cbiAgIyBAZGlyczogbmV3IERpcmVjdG9yeVN0b3JlXG4gICMgZmlsZVRvQXJyYXlCdWZmZXI6IChibG9iLCBvbmxvYWQsIG9uZXJyb3IpIC0+XG4gICMgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICMgICByZWFkZXIub25sb2FkID0gb25sb2FkXG5cbiAgIyAgIHJlYWRlci5vbmVycm9yID0gb25lcnJvclxuXG4gICMgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgYmxvYlxuXG4gIHJlYWRGaWxlOiAoZGlyRW50cnksIHBhdGgsIHN1Y2Nlc3MsIGVycm9yKSAtPlxuICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIHBhdGgsXG4gICAgICAoZmlsZUVudHJ5KSA9PlxuICAgICAgICBmaWxlRW50cnkuZmlsZSAoZmlsZSkgPT5cbiAgICAgICAgICBzdWNjZXNzKGZpbGVFbnRyeSwgZmlsZSlcbiAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuXG4gIGdldEZpbGVFbnRyeTogKGRpckVudHJ5LCBwYXRoLCBzdWNjZXNzLCBlcnJvcikgLT5cbiAgICBpZiBkaXJFbnRyeT8uZ2V0RmlsZT9cbiAgICAgIGRpckVudHJ5LmdldEZpbGUgcGF0aCwge30sIChmaWxlRW50cnkpIC0+XG4gICAgICAgIHN1Y2Nlc3MgZmlsZUVudHJ5XG4gICAgZWxzZSBlcnJvcigpXG5cbiAgb3BlbkRpcmVjdG9yeTogKGNhbGxiYWNrKSA9PlxuICAgIEBhcGkuY2hvb3NlRW50cnkgdHlwZTonb3BlbkRpcmVjdG9yeScsIChkaXJlY3RvcnlFbnRyeSwgZmlsZXMpID0+XG4gICAgICBAYXBpLmdldERpc3BsYXlQYXRoIGRpcmVjdG9yeUVudHJ5LCAocGF0aE5hbWUpID0+XG4gICAgICAgIGRpciA9XG4gICAgICAgICAgICByZWxQYXRoOiBkaXJlY3RvcnlFbnRyeS5mdWxsUGF0aC5yZXBsYWNlKCcvJyArIGRpcmVjdG9yeUVudHJ5Lm5hbWUsICcnKVxuICAgICAgICAgICAgZGlyZWN0b3J5RW50cnlJZDogQGFwaS5yZXRhaW5FbnRyeShkaXJlY3RvcnlFbnRyeSlcbiAgICAgICAgICAgIGVudHJ5OiBkaXJlY3RvcnlFbnRyeVxuXG4gICAgICAgICAgY2FsbGJhY2sgcGF0aE5hbWUsIGRpclxuICAgICAgICAgICAgIyBAZ2V0T25lRGlyTGlzdCBkaXJcbiAgICAgICAgICAgICMgU3RvcmFnZS5zYXZlICdkaXJlY3RvcmllcycsIEBzY29wZS5kaXJlY3RvcmllcyAocmVzdWx0KSAtPlxuXG5cblxuY2xhc3MgTWFwcGluZ1xuICByZXNvdXJjZTogbnVsbCAjaHR0cDovL2JsYWxhLmNvbS93aGF0L2V2ZXIvaW5kZXguanNcbiAgbG9jYWw6IG51bGwgIy9zb21lc2hpdHR5RGlyL290aGVyU2hpdHR5RGlyL1xuICByZWdleDogbnVsbFxuICBjb25zdHJ1Y3RvcjogKHJlc291cmNlLCBsb2NhbCwgcmVnZXgpIC0+XG4gICAgW0Bsb2NhbCwgQHJlc291cmNlLCBAcmVnZXhdID0gW2xvY2FsLCByZXNvdXJjZSwgcmVnZXhdXG5cbiAgZ2V0TG9jYWxSZXNvdXJjZTogKCkgLT5cbiAgICBAcmVzb3VyY2UucmVwbGFjZShAcmVnZXgsIEBsb2NhbClcblxuICBzZXRSZWRpcmVjdERlY2xhcmF0aXZlOiAodGFiSWQpIC0+XG4gICAgcnVsZXMgPSBbXS5wdXNoXG4gICAgICBwcmlvcml0eToxMDBcbiAgICAgIGNvbmRpdGlvbnM6IFtcbiAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuUmVxdWVzdE1hdGNoZXJcbiAgICAgICAgICB1cmw6XG4gICAgICAgICAgICB1cmxNYXRjaGVzOkByZWdleFxuICAgICAgICBdXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlZGlyZWN0UmVxdWVzdFxuICAgICAgICAgIHJlZGlyZWN0VXJsOkBnZXRMb2NhbFJlc291cmNlKClcbiAgICAgIF1cbiAgICBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0Lm9uUmVxdWVzdC5hZGRSdWxlcyBydWxlc1xuXG4jIGNsYXNzIFN0b3JhZ2VGYWN0b3J5XG4jICAgbWFrZU9iamVjdDogKHR5cGUpIC0+XG4jICAgICBzd2l0Y2ggdHlwZVxuIyAgICAgICB3aGVuICdSZXNvdXJjZUxpc3QnXG4jICAgX2NyZWF0ZTogKHR5cGUpIC0+XG4jICAgICBAZ2V0RnJvbVN0b3JhZ2UudGhlbiAob2JqKSAtPlxuIyAgICAgICByZXR1cm4gb2JqXG5cbiMgICBnZXRGcm9tU3RvcmFnZTogKCkgLT5cbiMgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZSAoc3VjY2VzcywgZmFpbCkgLT5cbiMgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0IChhKSAtPlxuIyAgICAgICAgIGIgPSBuZXcgUmVzb3VyY2VMaXN0XG4jICAgICAgICAgZm9yIGtleSBvZiBhXG4jICAgICAgICAgICBkbyAoYSkgLT5cbiMgICAgICAgICAgICAgYltrZXldID0gYVtrZXldXG4jICAgICAgICAgc3VjY2VzcyBiXG4jIyNcbmNsYXNzIEZpbGVcbiAgICBjb25zdHJ1Y3RvcjogKGRpcmVjdG9yeUVudHJ5LCBwYXRoKSAtPlxuICAgICAgICBAZGlyRW50cnkgPSBkaXJlY3RvcnlFbnRyeVxuICAgICAgICBAcGF0aCA9IHBhdGhcbiMjI1xuXG4jVE9ETzogcmV3cml0ZSB0aGlzIGNsYXNzIHVzaW5nIHRoZSBuZXcgY2hyb21lLnNvY2tldHMuKiBhcGkgd2hlbiB5b3UgY2FuIG1hbmFnZSB0byBtYWtlIGl0IHdvcmtcbmNsYXNzIFNlcnZlclxuICBzb2NrZXQ6IGNocm9tZS5zb2NrZXRcbiAgIyB0Y3A6IGNocm9tZS5zb2NrZXRzLnRjcFxuICBob3N0OlwiMTI3LjAuMC4xXCJcbiAgcG9ydDo4MDg1XG4gIG1heENvbm5lY3Rpb25zOjUwMFxuICBzb2NrZXRQcm9wZXJ0aWVzOlxuICAgICAgcGVyc2lzdGVudDp0cnVlXG4gICAgICBuYW1lOidTTFJlZGlyZWN0b3InXG4gIHNvY2tldEluZm86bnVsbFxuICBnZXRMb2NhbEZpbGU6bnVsbFxuICBzb2NrZXRJZHM6W11cbiAgc3RvcHBlZDp0cnVlXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG5cbiAgc3RhcnQ6IChob3N0LHBvcnQsbWF4Q29ubmVjdGlvbnMsIGNiLGVycikgLT5cbiAgICBAaG9zdCA9IGlmIGhvc3Q/IHRoZW4gaG9zdCBlbHNlIEBob3N0XG4gICAgQHBvcnQgPSBpZiBwb3J0PyB0aGVuIHBvcnQgZWxzZSBAcG9ydFxuICAgIEBtYXhDb25uZWN0aW9ucyA9IGlmIG1heENvbm5lY3Rpb25zPyB0aGVuIG1heENvbm5lY3Rpb25zIGVsc2UgQG1heENvbm5lY3Rpb25zXG5cbiAgICBAa2lsbEFsbCAoc3VjY2VzcykgPT5cbiAgICAgIEBzb2NrZXQuY3JlYXRlICd0Y3AnLCB7fSwgKHNvY2tldEluZm8pID0+XG4gICAgICAgIEBzb2NrZXRJZHMgPSBbXVxuICAgICAgICBAc29ja2V0SWRzLnB1c2ggc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQgJ3NvY2tldElkcyc6QHNvY2tldElkc1xuICAgICAgICBAc29ja2V0Lmxpc3RlbiBzb2NrZXRJbmZvLnNvY2tldElkLCBAaG9zdCwgQHBvcnQsIChyZXN1bHQpID0+XG4gICAgICAgICAgaWYgcmVzdWx0ID4gLTFcbiAgICAgICAgICAgIHNob3cgJ2xpc3RlbmluZyAnICsgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICAgICAgQHN0b3BwZWQgPSBmYWxzZVxuICAgICAgICAgICAgQHNvY2tldEluZm8gPSBzb2NrZXRJbmZvXG4gICAgICAgICAgICBAc29ja2V0LmFjY2VwdCBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG4gICAgICAgICAgICBjYj8gc29ja2V0SW5mb1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVycj8gcmVzdWx0XG4gICAgLGVycj9cblxuXG4gIGtpbGxBbGw6IChjYWxsYmFjaywgZXJyb3IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0ICdzb2NrZXRJZHMnLCAocmVzdWx0KSA9PlxuICAgICAgc2hvdyAnZ290IGlkcydcbiAgICAgIHNob3cgcmVzdWx0XG4gICAgICBAc29ja2V0SWRzID0gcmVzdWx0LnNvY2tldElkc1xuICAgICAgY250ID0gMFxuICAgICAgZm9yIHMgaW4gQHNvY2tldElkc1xuICAgICAgICBkbyAocykgPT5cbiAgICAgICAgICBjbnQrK1xuICAgICAgICAgIEBzb2NrZXQuZ2V0SW5mbyBzLCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgICAgIGNudC0tXG4gICAgICAgICAgICBpZiBub3QgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yP1xuICAgICAgICAgICAgICBAc29ja2V0LmRpc2Nvbm5lY3Qgc1xuICAgICAgICAgICAgICBAc29ja2V0LmRlc3Ryb3kgc1xuXG4gICAgICAgICAgICBjYWxsYmFjaz8oKSBpZiBjbnQgaXMgMFxuXG5cbiAgc3RvcDogKGNhbGxiYWNrLCBlcnJvcikgLT5cbiAgICBAa2lsbEFsbCAoc3VjY2VzcykgPT5cbiAgICAgIEBzdG9wcGVkID0gdHJ1ZVxuICAgICAgY2FsbGJhY2s/KClcbiAgICAsKGVycm9yKSA9PlxuICAgICAgZXJyb3I/IGVycm9yXG5cblxuICBfb25SZWNlaXZlOiAocmVjZWl2ZUluZm8pID0+XG4gICAgc2hvdyhcIkNsaWVudCBzb2NrZXQgJ3JlY2VpdmUnIGV2ZW50OiBzZD1cIiArIHJlY2VpdmVJbmZvLnNvY2tldElkXG4gICAgKyBcIiwgYnl0ZXM9XCIgKyByZWNlaXZlSW5mby5kYXRhLmJ5dGVMZW5ndGgpXG5cbiAgX29uTGlzdGVuOiAoc2VydmVyU29ja2V0SWQsIHJlc3VsdENvZGUpID0+XG4gICAgcmV0dXJuIHNob3cgJ0Vycm9yIExpc3RlbmluZzogJyArIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIGlmIHJlc3VsdENvZGUgPCAwXG4gICAgQHNlcnZlclNvY2tldElkID0gc2VydmVyU29ja2V0SWRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0LmFkZExpc3RlbmVyIEBfb25BY2NlcHRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0RXJyb3IuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdEVycm9yXG4gICAgQHRjcC5vblJlY2VpdmUuYWRkTGlzdGVuZXIgQF9vblJlY2VpdmVcbiAgICAjIHNob3cgXCJbXCIrc29ja2V0SW5mby5wZWVyQWRkcmVzcytcIjpcIitzb2NrZXRJbmZvLnBlZXJQb3J0K1wiXSBDb25uZWN0aW9uIGFjY2VwdGVkIVwiO1xuICAgICMgaW5mbyA9IEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICMgQGdldEZpbGUgdXJpLCAoZmlsZSkgLT5cbiAgX29uQWNjZXB0RXJyb3I6IChlcnJvcikgLT5cbiAgICBzaG93IGVycm9yXG5cbiAgX29uQWNjZXB0OiAoc29ja2V0SW5mbykgPT5cbiAgICAjIHJldHVybiBudWxsIGlmIGluZm8uc29ja2V0SWQgaXNudCBAc2VydmVyU29ja2V0SWRcbiAgICBzaG93KFwiU2VydmVyIHNvY2tldCAnYWNjZXB0JyBldmVudDogc2Q9XCIgKyBzb2NrZXRJbmZvLnNvY2tldElkKVxuICAgIGlmIHNvY2tldEluZm8/LnNvY2tldElkP1xuICAgICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkLCAoaW5mbykgPT5cbiAgICAgICAgQGdldExvY2FsRmlsZSBpbmZvLCAoZmlsZUVudHJ5LCBmaWxlUmVhZGVyKSA9PlxuICAgICAgICAgICAgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldEluZm8uc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZVJlYWRlciwgaW5mby5rZWVwQWxpdmVcbiAgICAgICAgLChlcnJvcikgPT5cbiAgICAgICAgICAgIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG4gICAgZWxzZVxuICAgICAgc2hvdyBcIk5vIHNvY2tldD8hXCJcbiAgICAjIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuXG5cbiAgc3RyaW5nVG9VaW50OEFycmF5OiAoc3RyaW5nKSAtPlxuICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgaSA9IDBcblxuICAgIHdoaWxlIGkgPCBzdHJpbmcubGVuZ3RoXG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgIGkrK1xuICAgIHZpZXdcblxuICBhcnJheUJ1ZmZlclRvU3RyaW5nOiAoYnVmZmVyKSAtPlxuICAgIHN0ciA9IFwiXCJcbiAgICB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgcyA9IDBcblxuICAgIHdoaWxlIHMgPCB1QXJyYXlWYWwubGVuZ3RoXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pXG4gICAgICBzKytcbiAgICBzdHJcblxuICBfd3JpdGUyMDBSZXNwb25zZTogKHNvY2tldElkLCBmaWxlRW50cnksIGZpbGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBjb250ZW50VHlwZSA9IChpZiAoZmlsZS50eXBlIGlzIFwiXCIpIHRoZW4gXCJ0ZXh0L3BsYWluXCIgZWxzZSBmaWxlLnR5cGUpXG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+XG4gICAgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShldi50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgICAgc2hvdyB3cml0ZUluZm9cbiAgICAgICAgIyBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5vbmVycm9yID0gKGVycm9yKSA9PlxuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGZpbGVcblxuXG4gICAgIyBAZW5kIHNvY2tldElkXG4gICAgIyBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICMgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgPT5cbiAgICAjICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAjICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICMgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAjICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJZFxuXG5cbiAgX3JlYWRGcm9tU29ja2V0OiAoc29ja2V0SWQsIGNiKSAtPlxuICAgIEBzb2NrZXQucmVhZCBzb2NrZXRJZCwgKHJlYWRJbmZvKSA9PlxuICAgICAgc2hvdyBcIlJFQURcIiwgcmVhZEluZm9cblxuICAgICAgIyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIGRhdGEgPSBAYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKVxuICAgICAgc2hvdyBkYXRhXG5cbiAgICAgIGlmIGRhdGEuaW5kZXhPZihcIkdFVCBcIikgaXNudCAwXG4gICAgICAgIEBlbmQgc29ja2V0SWRcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGtlZXBBbGl2ZSA9IGZhbHNlXG4gICAgICBrZWVwQWxpdmUgPSB0cnVlIGlmIGRhdGEuaW5kZXhPZiAnQ29ubmVjdGlvbjoga2VlcC1hbGl2ZScgaXNudCAtMVxuXG4gICAgICB1cmlFbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIDQpXG5cbiAgICAgIHJldHVybiBlbmQgc29ja2V0SWQgaWYgdXJpRW5kIDwgMFxuXG4gICAgICB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpXG4gICAgICBpZiBub3QgdXJpP1xuICAgICAgICB3cml0ZUVycm9yIHNvY2tldElkLCA0MDQsIGtlZXBBbGl2ZVxuICAgICAgICByZXR1cm5cblxuICAgICAgaW5mbyA9XG4gICAgICAgIHVyaTogdXJpXG4gICAgICAgIGtlZXBBbGl2ZTprZWVwQWxpdmVcbiAgICAgIGluZm8ucmVmZXJlciA9IGRhdGEubWF0Y2goL1JlZmVyZXI6XFxzKC4qKS8pP1sxXVxuICAgICAgI3N1Y2Nlc3NcbiAgICAgIGNiPyBpbmZvXG5cbiAgZW5kOiAoc29ja2V0SWQsIGtlZXBBbGl2ZSkgLT5cbiAgICAgICMgaWYga2VlcEFsaXZlXG4gICAgICAjICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgIyBlbHNlXG4gICAgQHNvY2tldC5kaXNjb25uZWN0IHNvY2tldElkXG4gICAgQHNvY2tldC5kZXN0cm95IHNvY2tldElkXG4gICAgc2hvdyAnZW5kaW5nICcgKyBzb2NrZXRJZFxuICAgIEBzb2NrZXQuYWNjZXB0IEBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAgX3dyaXRlRXJyb3I6IChzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIC0+XG4gICAgZmlsZSA9IHNpemU6IDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIlxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGVcbiAgICBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiICMoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIlxuICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuXG5jbGFzcyBBcHBsaWNhdGlvblxuXG4gIGNvbmZpZzpcbiAgICBBUFBfSUQ6ICdjZWNpZmFmcGhlZ2hvZnBmZGtoZWtraWJjaWJoZ2ZlYydcbiAgICBFWFRFTlNJT05fSUQ6ICdkZGRpbWJuamliamNhZmJva25iZ2hlaGJmYWpnZ2dlcCdcblxuICBkYXRhOm51bGxcbiAgTElTVEVOOiBudWxsXG4gIE1TRzogbnVsbFxuICBTdG9yYWdlOiBudWxsXG4gIEZTOiBudWxsXG4gIFNlcnZlcjogbnVsbFxuICBOb3RpZnk6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBATm90aWZ5ID0gKG5ldyBOb3RpZmljYXRpb24pLnNob3dcbiAgICBAU3RvcmFnZSA9IG5ldyBTdG9yYWdlXG4gICAgQEZTID0gbmV3IEZpbGVTeXN0ZW1cbiAgICBAU2VydmVyID0gbmV3IFNlcnZlclxuICAgIEBjb25maWcuU0VMRl9JRCA9IGNocm9tZS5ydW50aW1lLmlkXG4gICAgQGNvbmZpZy5FWFRfSUQgPSBpZiBAY29uZmlnLkFQUF9JRCBpcyBAY29uZmlnLlNFTEZfSUQgdGhlbiBAY29uZmlnLkVYVEVOU0lPTl9JRCBlbHNlIEBjb25maWcuQVBQX0lEXG4gICAgQGNvbmZpZy5FWFRfVFlQRSA9IGlmIEBjb25maWcuQVBQX0lEIGlzbnQgQGNvbmZpZy5TRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuICAgIEBNU0cgPSBuZXcgTVNHIEBjb25maWdcbiAgICBATElTVEVOID0gbmV3IExJU1RFTiBAY29uZmlnXG5cbiAgICBAYXBwV2luZG93ID0gbnVsbFxuICAgIEBwb3J0ID0gMzEzMzdcbiAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcbiAgICBATElTVEVOLkV4dCAnb3BlbkFwcCcsIEBvcGVuQXBwXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpID0+XG5cbiAgbGF1bmNoVUk6IChjYiwgZXJyb3IpIC0+XG4gICAgQGxhdW5jaEFwcCAoZXh0SW5mbykgPT5cbiAgICAgIEBvcGVuQXBwKClcbiAgICAgIGNiPyBleHRJbmZvXG4gICAgLGVycm9yXG5cbiAgbGF1bmNoQXBwOiAoY2IsIGVycm9yLCBvcGVuVUkpIC0+XG4gICAgICBjaHJvbWUubWFuYWdlbWVudC5sYXVuY2hBcHAgQGNvbmZpZy5BUFBfSUQsIChleHRJbmZvKSA9PlxuICAgICAgICBpZiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgICBlcnJvciBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNiPyBleHRJbmZvXG5cbiAgb3BlbkFwcDogKCkgPT5cbiAgICBpZiBjaHJvbWUuYXBwPy53aW5kb3c/XG4gICAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLFxuICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgYm91bmRzOlxuICAgICAgICAgIHdpZHRoOjUwMFxuICAgICAgICAgIGhlaWdodDo4MDAsXG4gICAgICAod2luKSA9PlxuICAgICAgICBAYXBwV2luZG93ID0gd2luKVxuICAgIGVsc2VcbiAgICAgIEBNU0cuRXh0ICdvcGVuQXBwJzp0cnVlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvblxuIl19
