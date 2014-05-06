(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AppBackground, Application, app,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Application = require('../../common.coffee');

AppBackground = (function(_super) {
  __extends(AppBackground, _super);

  function AppBackground() {
    return AppBackground.__super__.constructor.apply(this, arguments);
  }

  AppBackground.prototype.init = function() {
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
    return chrome.app.runtime.onLaunched(this.openApp());
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


},{"../../common.coffee":2}],2:[function(require,module,exports){
var Application, Data, FileSystem, LISTEN, MSG, Mapping, Storage, Util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Array.prototype.where = function(query) {
  var hit;
  if (typeof query !== "object") {
    return [];
  }
  hit = Object.keys(query).length;
  return this.filter(function(item) {
    var key, match, val;
    match = 0;
    for (key in query) {
      val = query[key];
      if (item[key] === val) {
        match += 1;
      }
    }
    if (match === hit) {
      return true;
    } else {
      return false;
    }
  });
};

Array.prototype.toDict = function(key) {
  return this.reduce((function(dict, obj) {
    if (obj[kewy] != null) {
      dict[obj[key]] = obj;
    }
    return dict;
  }), {});
};

MSG = (function() {
  function MSG(config) {
    this.config = config;
  }

  MSG.prototype.Local = function(message) {
    console.log("== MESSAGE ==> " + message);
    return chrome.runtime.sendMessage(message);
  };

  MSG.prototype.Ext = function(message) {
    console.log("== MESSAGE " + this.config.EXT_TYPE + " ==> " + message);
    return chrome.runtime.sendMessage(this.config.EXT_ID, message);
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
    console.log(("<== EXTERNAL MESSAGE == " + this.config.EXT_TYPE + " ==") + request);
    if (sender.id !== this.config.EXT_ID) {
      return void 0;
    }
    _results = [];
    for (key in request) {
      _results.push(typeof (_base = this.external.listeners)[key] === "function" ? _base[key](request[key]) : void 0);
    }
    return _results;
  };

  LISTEN.prototype._onMessage = function(request, sender, sendResponse) {
    var key, _base, _results;
    console.log(("<== MESSAGE == " + this.config.EXT_TYPE + " ==") + request);
    _results = [];
    for (key in request) {
      _results.push(typeof (_base = this.local.listeners)[key] === "function" ? _base[key](request[key]) : void 0);
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
        return console.log(result);
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

  FileSystem.prototype.fileToArrayBuffer = function(blob, callback, opt_errorCallback) {
    var reader;
    reader = new FileReader();
    reader.onload = function(e) {
      callback(e.target.result);
    };
    reader.onerror = function(e) {
      if (opt_errorCallback) {
        opt_errorCallback(e);
      }
    };
    reader.readAsArrayBuffer(blob);
  };

  FileSystem.prototype.readFile = function(dirEntry, path, success, error) {
    return getFileEntry(dirEntry, path, function(fileEntry) {
      return fileEntry.file(function(file) {
        return fileToArrayBuffer(file, function(arrayBuffer) {
          return success(arrayBuffer, error);
        }, error);
      }, error);
    });
  };

  FileSystem.prototype.getFileEntry = function(dirEntry, path, success, error) {
    return dirEntry.getFile(path, {}, function(fileEntry) {
      return success(fileEntry);
    });
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

class Server
    constructor: () ->

    start: () ->
        socket.create "tcp", {}, (_socketInfo) ->
            @socketInfo = _socketInfo;
            socket.listen socketInfo.socketId, "127.0.0.1", 31337, 50, (result) ->
                console.log "LISTENING:", result
                socket.accept @socketInfo.socketId, @_onAccept

    stop: () ->
        socket.destroy @socketInfo.socketId

    _onAccept: (acceptInfo) ->
        console.log("ACCEPT", acceptInfo)
        info = @_readFromSocket acceptInfo.socketId
        @getFile uri, (file) ->

    getFile: (uri) ->

    _write200Response: (socketId, file, keepAlive) ->
      contentType = (if (file.type is "") then "text/plain" else file.type)
      contentLength = file.size
      header = stringToUint8Array("HTTP/1.0 200 OK\nContent-length: " + file.size + "\nContent-type:" + contentType + ((if keepAlive then "\nConnection: keep-alive" else "")) + "\n\n")
      outputBuffer = new ArrayBuffer(header.byteLength + file.size)
      view = new Uint8Array(outputBuffer)
      view.set header, 0
      fileReader = new FileReader()
      fileReader.onload = (e) ->
        view.set new Uint8Array(e.target.result), header.byteLength
        socket.write socketId, outputBuffer, (writeInfo) ->
          console.log "WRITE", writeInfo
          if keepAlive
            readFromSocket socketId
          else
            socket.destroy socketId
            socket.accept socketInfo.socketId, onAccept
          return

        return

      fileReader.readAsArrayBuffer file
      return

    _readFromSocket: (socketId) ->
        socket.read socketId, (readInfo) ->
          console.log "READ", readInfo

           * Parse the request.
          data = arrayBufferToString(readInfo.data)
          if data.indexOf("GET ") is 0
            keepAlive = false
            keepAlive = true  unless data.indexOf("Connection: keep-alive") is -1

             * we can only deal with GET requests
            uriEnd = data.indexOf(" ", 4)
            return  if uriEnd < 0
            uri = data.substring(4, uriEnd)

             * strip qyery string
            q = uri.indexOf("?")
            info =
                uri: (uri.substring(0, q) unless q is -1)
                keepAlive:keepAlive

        stringToUint8Array: (string) ->
          buffer = new ArrayBuffer(string.length)
          view = new Uint8Array(buffer)
          i = 0

          while i < string.length
            view[i] = string.charCodeAt(i)
            i++
          view

        arrayBufferToString: (buffer) ->
          str = ""
          uArrayVal = new Uint8Array(buffer)
          s = 0

          while s < uArrayVal.length
            str += String.fromCharCode(uArrayVal[s])
            s++
          str
 */

Util = (function() {
  function Util() {}

  return Util;

})();

Application = (function() {
  Application.prototype.config = {
    APP_ID: 'chpffdckkhhppmgclfbompfgkghpmgpg',
    EXTENSION_ID: 'aajhphjjbcnnkgnhlblniaoejpcnjdpf'
  };

  Application.prototype.data = null;

  Application.prototype.LISTEN = null;

  Application.prototype.MSG = null;

  Application.prototype.Storage = null;

  Application.prototype.FS = null;

  function Application() {
    this.setRedirect = __bind(this.setRedirect, this);
    this.openApp = __bind(this.openApp, this);
    this.startServer = __bind(this.startServer, this);
    this.init = __bind(this.init, this);
    this.Storage = new Storage;
    this.FS = new FileSystem;
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

  Application.prototype.addMapping = function() {};

  Application.prototype.launchApp = function(cb) {
    return chrome.management.launchApp(this.config.APP_ID);
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

  Application.prototype.getResources = function(selector) {
    return [].map.call(document.querySelectorAll(selector), function(e) {
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

  return Application;

})();

module.exports = Application;


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


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0Ryb3Bib3ggKFNpbHZlcmxpbmUpL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL0Ryb3Bib3ggKFNpbHZlcmxpbmUpL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL2FwcC9zcmMvYmFja2dyb3VuZC5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0Ryb3Bib3ggKFNpbHZlcmxpbmUpL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL2NvbW1vbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNVQSxJQUFBLCtCQUFBO0VBQUE7aVNBQUE7O0FBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQUFkLENBQUE7O0FBQUE7QUFHSSxrQ0FBQSxDQUFBOzs7O0dBQUE7O0FBQUEsMEJBQUEsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNGLElBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQW1CLGFBQW5CLEVBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLEdBQUQsR0FBQTtlQUM5QixLQUFDLENBQUEsR0FBRyxDQUFDLEdBQUwsQ0FBUyxHQUFULEVBRDhCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxXQUFaLEVBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLE1BQUQsR0FBQTtlQUNyQixLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxrQkFBZCxFQUFrQyxNQUFsQyxFQURxQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCLENBSEEsQ0FBQTtXQU1BLE1BQU0sQ0FBQyxH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KGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIHNlcnZlciA9IHJlcXVpcmUgJy4vdGNwLXNlcnZlci5qcydcblxuIyBnZXRHbG9iYWwgPSAtPlxuIyAgIF9nZXRHbG9iYWwgPSAtPlxuIyAgICAgdGhpc1xuXG4jICAgX2dldEdsb2JhbCgpXG5cbiMgcm9vdCA9IGdldEdsb2JhbCgpXG5cbkFwcGxpY2F0aW9uID0gcmVxdWlyZSAnLi4vLi4vY29tbW9uLmNvZmZlZSdcbiNhcHAgPSBuZXcgbGliLkFwcGxpY2F0aW9uXG5jbGFzcyBBcHBCYWNrZ3JvdW5kIGV4dGVuZHMgQXBwbGljYXRpb25cbiAgICBpbml0OiAoKSAtPlxuICAgICAgICBAU3RvcmFnZS5vbkNoYW5nZWQgJ3Jlc291cmNlTWFwJywgKG9iaikgPT5cbiAgICAgICAgICAgIEBNU0cuRXh0IG9ialxuXG4gICAgICAgIEBMSVNURU4uRXh0ICdyZXNvdXJjZXMnLCAocmVzdWx0KSA9PlxuICAgICAgICAgICAgQFN0b3JhZ2Uuc2F2ZSAnY3VycmVudFJlc291cmNlcycsIHJlc3VsdFxuXG4gICAgICAgIGNocm9tZS5hcHAucnVudGltZS5vbkxhdW5jaGVkIEBvcGVuQXBwKClcblxuYXBwID0gbmV3IEFwcEJhY2tncm91bmRcblxuXG5cbiMjI1xuIHZhciB3aGl0ZWxpc3RlZElkID0gJ3BtZ25uYmRmbW1wZGtnYWFta2RpaXBmZ2picGdpb2ZjJztcbiAgdmFyIGFkZERpcmVjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsIHtcbiAgICAgICAgaWQ6IFwibWFpbndpblwiLFxuICAgICAgICBib3VuZHM6IHtcbiAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgaGVpZ2h0OiA1MFxuICAgICAgICB9LFxuICAgIH0sIGZ1bmN0aW9uKHdpbikge1xuICAgICAgICBtYWluV2luID0gd2luO1xuICAgIH0pO1xuICB9XG5cblxuXG4gICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIC8vIGlmIChzZW5kZXIuaWQgIT0gd2hpdGVsaXN0ZWRJZClcbiAgICAgICAgICAvLyAgIHJldHVybiBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJzb3JyeSwgY291bGQgbm90IHByb2Nlc3MgeW91ciBtZXNzYWdlXCJ9KTtcblxuICAgICAgICAgIGlmIChyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIkdvdCBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzLnB1c2gocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIC8vIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeShyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQsIGZ1bmN0aW9uKGRpcmVjdG9yeUVudHJ5KSB7XG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZGlyZWN0b3J5RW50cnkpO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BzLCBJIGRvbid0IHVuZGVyc3RhbmQgdGhpcyBtZXNzYWdlXCJ9KTtcbiAgICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbC5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICBpZiAoc2VuZGVyLmlkICE9IHdoaXRlbGlzdGVkSWQpIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgICAgcmV0dXJuOyAgLy8gZG9uJ3QgYWxsb3cgdGhpcyBleHRlbnNpb24gYWNjZXNzXG4gICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm9wZW5EaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wZW5pbmcgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIGFkZERpcmVjdG9yeSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgc29ja2V0LmNyZWF0ZShcInRjcFwiLCB7fSwgZnVuY3Rpb24oX3NvY2tldEluZm8pIHtcbiAgICAgICAgc29ja2V0SW5mbyA9IF9zb2NrZXRJbmZvO1xuICAgICAgICBzb2NrZXQubGlzdGVuKHNvY2tldEluZm8uc29ja2V0SWQsIFwiMTI3LjAuMC4xXCIsIDMzMzMzLCA1MCwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTElTVEVOSU5HOlwiLCByZXN1bHQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBzdG9wU29ja2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldEluZm8uc29ja2V0SWQpO1xuICAgIH1cblxuXG4jIyNcblxuIyMjXG5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN0YXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKTtcbiAgdmFyIHN0b3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3BcIik7XG4gIHZhciBob3N0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaG9zdHNcIik7XG4gIHZhciBwb3J0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3J0XCIpO1xuICB2YXIgZGlyZWN0b3J5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaXJlY3RvcnlcIik7XG5cbiAgdmFyIHNvY2tldCA9IGNocm9tZS5zb2NrZXQ7XG4gIHZhciBzb2NrZXRJbmZvO1xuICB2YXIgZmlsZXNNYXAgPSB7fTtcblxuICB2YXIgcm9vdERpcjtcbiAgdmFyIHBvcnQsIGV4dFBvcnQ7XG4gIHZhciBkaXJlY3RvcmllcyA9IFtdO1xuXG4gIHZhciBzdHJpbmdUb1VpbnQ4QXJyYXkgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICB2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHN0cmluZy5sZW5ndGgpO1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiB2aWV3O1xuICB9O1xuXG4gIHZhciBhcnJheUJ1ZmZlclRvU3RyaW5nID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgdmFyIHN0ciA9ICcnO1xuICAgIHZhciB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGZvcih2YXIgcyA9IDA7IHMgPCB1QXJyYXlWYWwubGVuZ3RoOyBzKyspIHtcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVBcnJheVZhbFtzXSk7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG4gIH07XG5cbiAgdmFyIGxvZ1RvU2NyZWVuID0gZnVuY3Rpb24obG9nKSB7XG4gICAgbG9nZ2VyLnRleHRDb250ZW50ICs9IGxvZyArIFwiXFxuXCI7XG4gIH1cblxuICB2YXIgd3JpdGVFcnJvclJlc3BvbnNlID0gZnVuY3Rpb24oc29ja2V0SWQsIGVycm9yQ29kZSwga2VlcEFsaXZlKSB7XG4gICAgdmFyIGZpbGUgPSB7IHNpemU6IDAgfTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIik7XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogZmlsZSA9IFwiICsgZmlsZSk7XG4gICAgdmFyIGNvbnRlbnRUeXBlID0gXCJ0ZXh0L3BsYWluXCI7IC8vKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICB2YXIgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZTtcbiAgICB2YXIgaGVhZGVyID0gc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKCBrZWVwQWxpdmUgPyBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiA6IFwiXCIpICsgXCJcXG5cXG5cIik7XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiKTtcbiAgICB2YXIgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldChoZWFkZXIsIDApO1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyB2aWV3Li4uXCIpO1xuICAgIHNvY2tldC53cml0ZShzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCBmdW5jdGlvbih3cml0ZUluZm8pIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiV1JJVEVcIiwgd3JpdGVJbmZvKTtcbiAgICAgIGlmIChrZWVwQWxpdmUpIHtcbiAgICAgICAgcmVhZEZyb21Tb2NrZXQoc29ja2V0SWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SWQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OmZpbGVyZWFkZXI6OiBlbmQgb25sb2FkLi4uXCIpO1xuXG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogZW5kLi4uXCIpO1xuICB9O1xuXG4gIHZhciB3cml0ZTIwMFJlc3BvbnNlID0gZnVuY3Rpb24oc29ja2V0SWQsIGZpbGUsIGtlZXBBbGl2ZSkge1xuICAgIHZhciBjb250ZW50VHlwZSA9IChmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgdmFyIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemU7XG4gICAgdmFyIGhlYWRlciA9IHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIDIwMCBPS1xcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoIGtlZXBBbGl2ZSA/IFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIDogXCJcIikgKyBcIlxcblxcblwiKTtcbiAgICB2YXIgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldChoZWFkZXIsIDApO1xuXG4gICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoKTtcbiAgICAgICBzb2NrZXQud3JpdGUoc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgZnVuY3Rpb24od3JpdGVJbmZvKSB7XG4gICAgICAgICBjb25zb2xlLmxvZyhcIldSSVRFXCIsIHdyaXRlSW5mbyk7XG4gICAgICAgICBpZiAoa2VlcEFsaXZlKSB7XG4gICAgICAgICAgIHJlYWRGcm9tU29ja2V0KHNvY2tldElkKTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldElkKTtcbiAgICAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihmaWxlKTtcbiAgfTtcblxuICB2YXIgb25BY2NlcHQgPSBmdW5jdGlvbihhY2NlcHRJbmZvKSB7XG4gICAgY29uc29sZS5sb2coXCJBQ0NFUFRcIiwgYWNjZXB0SW5mbylcbiAgICByZWFkRnJvbVNvY2tldChhY2NlcHRJbmZvLnNvY2tldElkKTtcbiAgfTtcblxuICB2YXIgcmVhZEZyb21Tb2NrZXQgPSBmdW5jdGlvbihzb2NrZXRJZCkge1xuICAgIC8vICBSZWFkIGluIHRoZSBkYXRhXG4gICAgc29ja2V0LnJlYWQoc29ja2V0SWQsIGZ1bmN0aW9uKHJlYWRJbmZvKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlJFQURcIiwgcmVhZEluZm8pO1xuICAgICAgLy8gUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICB2YXIgZGF0YSA9IGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSk7XG4gICAgICBpZihkYXRhLmluZGV4T2YoXCJHRVQgXCIpID09IDApIHtcbiAgICAgICAgdmFyIGtlZXBBbGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoZGF0YS5pbmRleE9mKFwiQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiKSAhPSAtMSkge1xuICAgICAgICAgIGtlZXBBbGl2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBjYW4gb25seSBkZWFsIHdpdGggR0VUIHJlcXVlc3RzXG4gICAgICAgIHZhciB1cmlFbmQgPSAgZGF0YS5pbmRleE9mKFwiIFwiLCA0KTtcbiAgICAgICAgaWYodXJpRW5kIDwgMCkgeyAgIHJldHVybjsgfVxuICAgICAgICB2YXIgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKTtcbiAgICAgICAgLy8gc3RyaXAgcXllcnkgc3RyaW5nXG4gICAgICAgIHZhciBxID0gdXJpLmluZGV4T2YoXCI/XCIpO1xuICAgICAgICBpZiAocSAhPSAtMSkge1xuICAgICAgICAgIHVyaSA9IHVyaS5zdWJzdHJpbmcoMCwgcSk7XG4gICAgICAgIH1cblxuICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkoZGlyZWN0b3JpZXNbMF0pXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICAgKGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihkaXJlY3RvcnlFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVyaSk7XG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeUVudHJ5LmdldEZpbGUoJ215TmV3QXBwREVWLnJlc291cmNlL2luZGV4LmpzJywge30pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd3JpdGUyMDBSZXNwb25zZShzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKTtcbiAgICAgICAgICAgICAgICAgICAgfSxmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfSkodXJpKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIHZhciBmaWxlID1cbiAgICAgICAgLy8gaWYoISFmaWxlID09IGZhbHNlKSB7XG4gICAgICAgIC8vICAgY29uc29sZS53YXJuKFwiRmlsZSBkb2VzIG5vdCBleGlzdC4uLlwiICsgdXJpKTtcbiAgICAgICAgLy8gICB3cml0ZUVycm9yUmVzcG9uc2Uoc29ja2V0SWQsIDQwNCwga2VlcEFsaXZlKTtcbiAgICAgICAgLy8gICByZXR1cm47XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gbG9nVG9TY3JlZW4oXCJHRVQgMjAwIFwiICsgdXJpKTtcbiAgICAgICAgLy8gd3JpdGUyMDBSZXNwb25zZShzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKTtcbiAgICAgIC8vIH1cbiAgICAgIC8vIGVsc2Uge1xuICAgICAgICAvLyBUaHJvdyBhbiBlcnJvclxuICAgICAgICAvLyBzb2NrZXQuZGVzdHJveShzb2NrZXRJZCk7XG4gICAgICAvLyB9XG5cbiAgfTtcbn0pO1xufVxuXG5cbiAgdmFyIHdoaXRlbGlzdGVkSWQgPSAncG1nbm5iZGZtbXBka2dhYW1rZGlpcGZnamJwZ2lvZmMnO1xuXG5cbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbC5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICBpZiAoc2VuZGVyLmlkICE9IHdoaXRlbGlzdGVkSWQpIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgICAgcmV0dXJuOyAgLy8gZG9uJ3QgYWxsb3cgdGhpcyBleHRlbnNpb24gYWNjZXNzXG4gICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm9wZW5EaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wZW5pbmcgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIGFkZERpcmVjdG9yeSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuXG5cbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgLy8gaWYgKHNlbmRlci5pZCAhPSB3aGl0ZWxpc3RlZElkKVxuICAgICAgICAgIC8vICAgcmV0dXJuIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiR290IERpcmVjdG9yeVwifSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgZGlyZWN0b3JpZXMucHVzaChyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgLy8gY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5KHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCwgZnVuY3Rpb24oZGlyZWN0b3J5RW50cnkpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHNvY2tldC5jcmVhdGUoXCJ0Y3BcIiwge30sIGZ1bmN0aW9uKF9zb2NrZXRJbmZvKSB7XG4gICAgICAgIHNvY2tldEluZm8gPSBfc29ja2V0SW5mbztcbiAgICAgICAgc29ja2V0Lmxpc3Rlbihzb2NrZXRJbmZvLnNvY2tldElkLCBcIjEyNy4wLjAuMVwiLCAzMzMzMywgNTAsIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkxJU1RFTklORzpcIiwgcmVzdWx0KTtcbiAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgc3RvcFNvY2tldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzb2NrZXQuZGVzdHJveShzb2NrZXRJbmZvLnNvY2tldElkKTtcbiAgICB9XG5cbiAgdmFyIGFkZERpcmVjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsIHtcbiAgICAgICAgaWQ6IFwibWFpbndpblwiLFxuICAgICAgICBib3VuZHM6IHtcbiAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgaGVpZ2h0OiA1MFxuICAgICAgICB9LFxuICAgIH0sIGZ1bmN0aW9uKHdpbikge1xuICAgICAgICBtYWluV2luID0gd2luO1xuICAgIH0pO1xuICB9XG5cbn07XG4jIyNcblxuIiwiIyBzZXJ2ZXIgPSByZXF1aXJlICcuL3RjcC1zZXJ2ZXIuanMnXG4jIHJlcXVpcmUgJy4vY2hyb21lLW1vY2snXG4jIHJvb3QucSA9IHJlcXVpcmUgJ3EnXG5cbkFycmF5Ojp3aGVyZSA9IChxdWVyeSkgLT5cbiAgICByZXR1cm4gW10gaWYgdHlwZW9mIHF1ZXJ5IGlzbnQgXCJvYmplY3RcIlxuICAgIGhpdCA9IE9iamVjdC5rZXlzKHF1ZXJ5KS5sZW5ndGhcbiAgICBAZmlsdGVyIChpdGVtKSAtPlxuICAgICAgICBtYXRjaCA9IDBcbiAgICAgICAgZm9yIGtleSwgdmFsIG9mIHF1ZXJ5XG4gICAgICAgICAgICBtYXRjaCArPSAxIGlmIGl0ZW1ba2V5XSBpcyB2YWxcbiAgICAgICAgaWYgbWF0Y2ggaXMgaGl0IHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5cbkFycmF5Ojp0b0RpY3QgPSAoa2V5KSAtPlxuICBAcmVkdWNlICgoZGljdCwgb2JqKSAtPiBkaWN0WyBvYmpba2V5XSBdID0gb2JqIGlmIG9ialtrZXd5XT87IHJldHVybiBkaWN0KSwge31cblxuXG5jbGFzcyBNU0dcbiAgICBjb25zdHJ1Y3RvcjogKGNvbmZpZykgLT5cbiAgICAgICAgQGNvbmZpZyA9IGNvbmZpZ1xuICAgIExvY2FsOiAobWVzc2FnZSkgLT5cbiAgICAgICAgY29uc29sZS5sb2cgXCI9PSBNRVNTQUdFID09PiAjeyBtZXNzYWdlIH1cIlxuICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBtZXNzYWdlXG4gICAgRXh0OiAobWVzc2FnZSkgLT5cbiAgICAgICAgY29uc29sZS5sb2cgXCI9PSBNRVNTQUdFICN7IEBjb25maWcuRVhUX1RZUEUgfSA9PT4gI3sgbWVzc2FnZSB9XCJcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgQGNvbmZpZy5FWFRfSUQsIG1lc3NhZ2VcblxuY2xhc3MgTElTVEVOXG4gICAgbG9jYWw6XG4gICAgICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlXG4gICAgICAgIGxpc3RlbmVyczp7fVxuICAgIGV4dGVybmFsOlxuICAgICAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsXG4gICAgICAgIGxpc3RlbmVyczp7fVxuICAgIGNvbnN0cnVjdG9yOiAoY29uZmlnKSAtPlxuICAgICAgICBAY29uZmlnID0gY29uZmlnXG4gICAgICAgIEBsb2NhbC5hcGkuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VcbiAgICAgICAgQGV4dGVybmFsLmFwaT8uYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gICAgTG9jYWw6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICAgIEBsb2NhbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gICAgRXh0OiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICAgIF9vbk1lc3NhZ2VFeHRlcm5hbDogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgICAgICBjb25zb2xlLmxvZyBcIjw9PSBFWFRFUk5BTCBNRVNTQUdFID09ICN7IEBjb25maWcuRVhUX1RZUEUgfSA9PVwiICsgcmVxdWVzdFxuICAgICAgICBpZiBzZW5kZXIuaWQgaXNudCBAY29uZmlnLkVYVF9JRCB0aGVuIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgQGV4dGVybmFsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0gZm9yIGtleSBvZiByZXF1ZXN0XG5cbiAgICBfb25NZXNzYWdlOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgICAgIGNvbnNvbGUubG9nIFwiPD09IE1FU1NBR0UgPT0gI3sgQGNvbmZpZy5FWFRfVFlQRSB9ID09XCIgKyByZXF1ZXN0XG4gICAgICAgIEBsb2NhbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldIGZvciBrZXkgb2YgcmVxdWVzdFxuXG4gICAgIyBjbGFzcyBMaXN0ZW5lclxuICAgICMgICBsaXN0ZW5lcnM6IHt9XG4gICAgIyAgIGV4dGVybmFsOmZhbHNlXG4gICAgIyAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlXG4gICAgIyAgIGNvbnN0cnVjdG9yOiAoZXh0ZXJuYWwpIC0+XG4gICAgIyAgICAgQGV4dGVybmFsID0gZXh0ZXJuYWxcbiAgICAjICAgICBAYXBpID0gaWYgQGV4dGVybmFsIHRoZW4gY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWwgZWxzZSBAYXBpXG4gICAgIyAgICAgQGFwaS5hZGRMaXN0ZW5lciBAb25NZXNzYWdlXG4gICAgIyAgIGFkZExpc3RlbmVyOiAobWVzc2FnZSwgY2FsbGJhY2spIC0+XG4gICAgIyAgICAgQGxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG4gICAgIyAgIG9uTWVzc2FnZTogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgICMgICAgIGNvbnNvbGUubG9nIFwiPD09IE1FU1NBR0UgPT0gI3sgQGNvbmZpZy5FWFRfVFlQRSB9ID09XCIgKyByZXF1ZXN0XG4gICAgIyAgICAgaWYgQGV4dGVybmFsIGFuZCBzZW5kZXIuaWQgaXNudCBAY29uZmlnLkVYVF9JRCB0aGVuIHJldHVybiB1bmRlZmluZWRcbiAgICAjICAgICBlbHNlXG4gICAgIyAgICAgICBmb3Iga2V5IG9mIHJlcXVlc3RcbiAgICAjICAgICAgICAgZG8gKGtleSkgPT4gaWYgQGxpc3RlbmVyc1trZXldPyB0aGVuIEBsaXN0ZW5lcnNba2V5XSByZXF1ZXN0LmtleVxuXG5jbGFzcyBEYXRhXG4gICAgbWFwcGluZzpbXG4gICAgICAgIGRpcmVjdG9yeTpudWxsXG4gICAgICAgIHVybFBhdHRlcm46bnVsbFxuICAgIF1cbiAgICByZXNvdXJjZXM6W1xuICAgICAgICByZXNvdXJjZTpudWxsXG4gICAgICAgIGZpbGU6bnVsbFxuICAgIF1cblxuXG5cbmNsYXNzIFN0b3JhZ2VcbiAgICBhcGk6IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgZGF0YToge31cbiAgICBjYWxsYmFjazogKCkgLT5cbiAgICBjb25zdHJ1Y3RvcjogKGNhbGxiYWNrKSAtPlxuICAgICAgICBAY2FsbGJhY2sgPSBjYWxsYmFja1xuICAgICAgICBAcmV0cmlldmVBbGwoKVxuICAgICAgICBAb25DaGFuZ2VkQWxsKClcblxuICAgIHNhdmU6IChrZXksIGl0ZW0pIC0+XG4gICAgICBvYmogPSB7fVxuICAgICAgb2JqW2tleV0gPSBpdGVtXG4gICAgICBAYXBpLnNldCBvYmpcblxuICAgIHNhdmVBbGw6ICgpIC0+XG4gICAgICAgIEBhcGkuc2V0IEBkYXRhXG5cbiAgICByZXRyaWV2ZTogKGtleSwgY2IpIC0+XG4gICAgICAgIEBhcGkuZ2V0IGtleSwgKHJlc3VsdHMpIC0+XG4gICAgICAgICAgICBAZGF0YVtyXSA9IHJlc3VsdHNbcl0gZm9yIHIgb2YgcmVzdWx0c1xuICAgICAgICAgICAgaWYgY2I/IHRoZW4gY2IgcmVzdWx0c1trZXldXG5cblxuICAgIHJldHJpZXZlQWxsOiAoY2IpIC0+XG4gICAgICAgIEBhcGkuZ2V0IChyZXN1bHQpID0+XG4gICAgICAgICAgICBAZGF0YSA9IHJlc3VsdFxuICAgICAgICAgICAgQGNhbGxiYWNrPyByZXN1bHRcbiAgICAgICAgICAgIGNiPyByZXN1bHRcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIHJlc3VsdFxuXG4gICAgb25DaGFuZ2VkOiAoa2V5LCBjYikgLT5cbiAgICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgICBpZiBjaGFuZ2VzW2tleV0/IGFuZCBjYj8gdGhlbiBjYiBjaGFuZ2VzW2tleV0ubmV3VmFsdWVcbiAgICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzXG5cbiAgICBvbkNoYW5nZWRBbGw6ICgpIC0+XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcyxuYW1lc3BhY2UpID0+XG4gICAgICAgICAgICBAZGF0YVtjXSA9IGNoYW5nZXNbY10ubmV3VmFsdWUgZm9yIGMgb2YgY2hhbmdlc1xuICAgICAgICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzXG5cblxuIyBjbGFzcyBEaXJlY3RvcnlTdG9yZVxuIyAgIGRpcmVjdG9yaWVzID1cbiMgICBjb25zdHJ1Y3RvciAoKSAtPlxuXG4jIGNsYXNzIERpcmVjdG9yeVxuXG5cbmNsYXNzIEZpbGVTeXN0ZW1cbiAgICBhcGk6IGNocm9tZS5maWxlU3lzdGVtXG5cbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuICAgICMgQGRpcnM6IG5ldyBEaXJlY3RvcnlTdG9yZVxuICAgIGZpbGVUb0FycmF5QnVmZmVyOiAoYmxvYiwgY2FsbGJhY2ssIG9wdF9lcnJvckNhbGxiYWNrKSAtPlxuICAgICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICAgcmVhZGVyLm9ubG9hZCA9IChlKSAtPlxuICAgICAgICBjYWxsYmFjayBlLnRhcmdldC5yZXN1bHRcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIHJlYWRlci5vbmVycm9yID0gKGUpIC0+XG4gICAgICAgIG9wdF9lcnJvckNhbGxiYWNrIGUgIGlmIG9wdF9lcnJvckNhbGxiYWNrXG4gICAgICAgIHJldHVyblxuXG4gICAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgYmxvYlxuICAgICAgcmV0dXJuXG5cbiAgICByZWFkRmlsZTogKGRpckVudHJ5LCBwYXRoLCBzdWNjZXNzLCBlcnJvcikgLT5cbiAgICAgICAgZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBwYXRoLCAoZmlsZUVudHJ5KSAtPlxuICAgICAgICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpIC0+XG4gICAgICAgICAgICAgICAgZmlsZVRvQXJyYXlCdWZmZXIgZmlsZSwgKGFycmF5QnVmZmVyKSAtPlxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzIGFycmF5QnVmZmVyXG4gICAgICAgICAgICAgICAgICAgICxlcnJvclxuICAgICAgICAgICAgICAgICxlcnJvclxuICAgICAgICAgICAgLGVycm9yXG5cbiAgICBnZXRGaWxlRW50cnk6IChkaXJFbnRyeSwgcGF0aCwgc3VjY2VzcywgZXJyb3IpIC0+XG4gICAgICAgIGRpckVudHJ5LmdldEZpbGUgcGF0aCwge30sIChmaWxlRW50cnkpIC0+XG4gICAgICAgICAgICBzdWNjZXNzIGZpbGVFbnRyeVxuXG4gICAgb3BlbkRpcmVjdG9yeTogKGNhbGxiYWNrKSA9PlxuICAgICAgICBAYXBpLmNob29zZUVudHJ5IHR5cGU6J29wZW5EaXJlY3RvcnknLCAoZGlyZWN0b3J5RW50cnksIGZpbGVzKSA9PlxuICAgICAgICAgICAgQGFwaS5nZXREaXNwbGF5UGF0aCBkaXJlY3RvcnlFbnRyeSwgKHBhdGhOYW1lKSA9PlxuICAgICAgICAgICAgICAgIGRpciA9XG4gICAgICAgICAgICAgICAgICByZWxQYXRoOiBkaXJlY3RvcnlFbnRyeS5mdWxsUGF0aC5yZXBsYWNlICcvJyArIGRpcmVjdG9yeUVudHJ5Lm5hbWUsICcnXG4gICAgICAgICAgICAgICAgICBkaXJlY3RvcnlFbnRyeUlkOiBAYXBpLnJldGFpbkVudHJ5IGRpcmVjdG9yeUVudHJ5XG4gICAgICAgICAgICAgICAgICBlbnRyeTogZGlyZWN0b3J5RW50cnlcblxuICAgICAgICAgICAgICAgIGNhbGxiYWNrIHBhdGhOYW1lLCBkaXJcbiAgICAgICAgICAgICAgICAjIEBnZXRPbmVEaXJMaXN0IGRpclxuICAgICAgICAgICAgICAgICMgU3RvcmFnZS5zYXZlICdkaXJlY3RvcmllcycsIEBzY29wZS5kaXJlY3RvcmllcyAocmVzdWx0KSAtPlxuXG5cblxuY2xhc3MgTWFwcGluZ1xuICAgIHJlc291cmNlOiBudWxsICNodHRwOi8vYmxhbGEuY29tL3doYXQvZXZlci9pbmRleC5qc1xuICAgIGxvY2FsOiBudWxsICMvc29tZXNoaXR0eURpci9vdGhlclNoaXR0eURpci9cbiAgICByZWdleDogbnVsbFxuICAgIGNvbnN0cnVjdG9yOiAocmVzb3VyY2UsIGxvY2FsLCByZWdleCkgLT5cbiAgICAgIFtAbG9jYWwsIEByZXNvdXJjZSwgQHJlZ2V4XSA9IFtsb2NhbCwgcmVzb3VyY2UsIHJlZ2V4XVxuXG4gICAgZ2V0TG9jYWxSZXNvdXJjZTogKCkgLT5cbiAgICAgIEByZXNvdXJjZS5yZXBsYWNlKEByZWdleCwgQGxvY2FsKVxuXG4gICAgc2V0UmVkaXJlY3REZWNsYXJhdGl2ZTogKHRhYklkKSAtPlxuICAgICAgcnVsZXMgPSBbXS5wdXNoXG4gICAgICAgIHByaW9yaXR5OjEwMFxuICAgICAgICBjb25kaXRpb25zOiBbXG4gICAgICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZXF1ZXN0TWF0Y2hlclxuICAgICAgICAgICAgICAgIHVybDpcbiAgICAgICAgICAgICAgICAgICAgdXJsTWF0Y2hlczpAcmVnZXhcbiAgICAgICAgICAgIF1cbiAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuUmVkaXJlY3RSZXF1ZXN0XG4gICAgICAgICAgICAgICAgcmVkaXJlY3RVcmw6QGdldExvY2FsUmVzb3VyY2UoKVxuICAgICAgICBdXG4gICAgICBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0Lm9uUmVxdWVzdC5hZGRSdWxlcyBydWxlc1xuXG4jIGNsYXNzIFN0b3JhZ2VGYWN0b3J5XG4jICAgbWFrZU9iamVjdDogKHR5cGUpIC0+XG4jICAgICBzd2l0Y2ggdHlwZVxuIyAgICAgICB3aGVuICdSZXNvdXJjZUxpc3QnXG4jICAgX2NyZWF0ZTogKHR5cGUpIC0+XG4jICAgICBAZ2V0RnJvbVN0b3JhZ2UudGhlbiAob2JqKSAtPlxuIyAgICAgICByZXR1cm4gb2JqXG5cbiMgICBnZXRGcm9tU3RvcmFnZTogKCkgLT5cbiMgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZSAoc3VjY2VzcywgZmFpbCkgLT5cbiMgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0IChhKSAtPlxuIyAgICAgICAgIGIgPSBuZXcgUmVzb3VyY2VMaXN0XG4jICAgICAgICAgZm9yIGtleSBvZiBhXG4jICAgICAgICAgICBkbyAoYSkgLT5cbiMgICAgICAgICAgICAgYltrZXldID0gYVtrZXldXG4jICAgICAgICAgc3VjY2VzcyBiXG4jIyNcbmNsYXNzIEZpbGVcbiAgICBjb25zdHJ1Y3RvcjogKGRpcmVjdG9yeUVudHJ5LCBwYXRoKSAtPlxuICAgICAgICBAZGlyRW50cnkgPSBkaXJlY3RvcnlFbnRyeVxuICAgICAgICBAcGF0aCA9IHBhdGhcblxuY2xhc3MgU2VydmVyXG4gICAgY29uc3RydWN0b3I6ICgpIC0+XG5cbiAgICBzdGFydDogKCkgLT5cbiAgICAgICAgc29ja2V0LmNyZWF0ZSBcInRjcFwiLCB7fSwgKF9zb2NrZXRJbmZvKSAtPlxuICAgICAgICAgICAgQHNvY2tldEluZm8gPSBfc29ja2V0SW5mbztcbiAgICAgICAgICAgIHNvY2tldC5saXN0ZW4gc29ja2V0SW5mby5zb2NrZXRJZCwgXCIxMjcuMC4wLjFcIiwgMzEzMzcsIDUwLCAocmVzdWx0KSAtPlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiTElTVEVOSU5HOlwiLCByZXN1bHRcbiAgICAgICAgICAgICAgICBzb2NrZXQuYWNjZXB0IEBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAgICBzdG9wOiAoKSAtPlxuICAgICAgICBzb2NrZXQuZGVzdHJveSBAc29ja2V0SW5mby5zb2NrZXRJZFxuXG4gICAgX29uQWNjZXB0OiAoYWNjZXB0SW5mbykgLT5cbiAgICAgICAgY29uc29sZS5sb2coXCJBQ0NFUFRcIiwgYWNjZXB0SW5mbylcbiAgICAgICAgaW5mbyA9IEBfcmVhZEZyb21Tb2NrZXQgYWNjZXB0SW5mby5zb2NrZXRJZFxuICAgICAgICBAZ2V0RmlsZSB1cmksIChmaWxlKSAtPlxuXG4gICAgZ2V0RmlsZTogKHVyaSkgLT5cblxuICAgIF93cml0ZTIwMFJlc3BvbnNlOiAoc29ja2V0SWQsIGZpbGUsIGtlZXBBbGl2ZSkgLT5cbiAgICAgIGNvbnRlbnRUeXBlID0gKGlmIChmaWxlLnR5cGUgaXMgXCJcIikgdGhlbiBcInRleHQvcGxhaW5cIiBlbHNlIGZpbGUudHlwZSlcbiAgICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICAgIGhlYWRlciA9IHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIDIwMCBPS1xcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoKGlmIGtlZXBBbGl2ZSB0aGVuIFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIGVsc2UgXCJcIikpICsgXCJcXG5cXG5cIilcbiAgICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgICB2aWV3LnNldCBoZWFkZXIsIDBcbiAgICAgIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IChlKSAtPlxuICAgICAgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShlLnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aFxuICAgICAgICBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgLT5cbiAgICAgICAgICBjb25zb2xlLmxvZyBcIldSSVRFXCIsIHdyaXRlSW5mb1xuICAgICAgICAgIGlmIGtlZXBBbGl2ZVxuICAgICAgICAgICAgcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzb2NrZXQuZGVzdHJveSBzb2NrZXRJZFxuICAgICAgICAgICAgc29ja2V0LmFjY2VwdCBzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdFxuICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHJldHVyblxuXG4gICAgICBmaWxlUmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGZpbGVcbiAgICAgIHJldHVyblxuXG4gICAgX3JlYWRGcm9tU29ja2V0OiAoc29ja2V0SWQpIC0+XG4gICAgICAgIHNvY2tldC5yZWFkIHNvY2tldElkLCAocmVhZEluZm8pIC0+XG4gICAgICAgICAgY29uc29sZS5sb2cgXCJSRUFEXCIsIHJlYWRJbmZvXG5cbiAgICAgICAgICAjIFBhcnNlIHRoZSByZXF1ZXN0LlxuICAgICAgICAgIGRhdGEgPSBhcnJheUJ1ZmZlclRvU3RyaW5nKHJlYWRJbmZvLmRhdGEpXG4gICAgICAgICAgaWYgZGF0YS5pbmRleE9mKFwiR0VUIFwiKSBpcyAwXG4gICAgICAgICAgICBrZWVwQWxpdmUgPSBmYWxzZVxuICAgICAgICAgICAga2VlcEFsaXZlID0gdHJ1ZSAgdW5sZXNzIGRhdGEuaW5kZXhPZihcIkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIikgaXMgLTFcblxuICAgICAgICAgICAgIyB3ZSBjYW4gb25seSBkZWFsIHdpdGggR0VUIHJlcXVlc3RzXG4gICAgICAgICAgICB1cmlFbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIDQpXG4gICAgICAgICAgICByZXR1cm4gIGlmIHVyaUVuZCA8IDBcbiAgICAgICAgICAgIHVyaSA9IGRhdGEuc3Vic3RyaW5nKDQsIHVyaUVuZClcblxuICAgICAgICAgICAgIyBzdHJpcCBxeWVyeSBzdHJpbmdcbiAgICAgICAgICAgIHEgPSB1cmkuaW5kZXhPZihcIj9cIilcbiAgICAgICAgICAgIGluZm8gPVxuICAgICAgICAgICAgICAgIHVyaTogKHVyaS5zdWJzdHJpbmcoMCwgcSkgdW5sZXNzIHEgaXMgLTEpXG4gICAgICAgICAgICAgICAga2VlcEFsaXZlOmtlZXBBbGl2ZVxuXG4gICAgICAgIHN0cmluZ1RvVWludDhBcnJheTogKHN0cmluZykgLT5cbiAgICAgICAgICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyaW5nLmxlbmd0aClcbiAgICAgICAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgICAgICAgIGkgPSAwXG5cbiAgICAgICAgICB3aGlsZSBpIDwgc3RyaW5nLmxlbmd0aFxuICAgICAgICAgICAgdmlld1tpXSA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICB2aWV3XG5cbiAgICAgICAgYXJyYXlCdWZmZXJUb1N0cmluZzogKGJ1ZmZlcikgLT5cbiAgICAgICAgICBzdHIgPSBcIlwiXG4gICAgICAgICAgdUFycmF5VmFsID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgICAgICAgIHMgPSAwXG5cbiAgICAgICAgICB3aGlsZSBzIDwgdUFycmF5VmFsLmxlbmd0aFxuICAgICAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodUFycmF5VmFsW3NdKVxuICAgICAgICAgICAgcysrXG4gICAgICAgICAgc3RyXG4jIyNcbmNsYXNzIFV0aWxcbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuY2xhc3MgQXBwbGljYXRpb25cblxuICAgIGNvbmZpZzpcbiAgICAgICAgQVBQX0lEOiAnY2hwZmZkY2traGhwcG1nY2xmYm9tcGZna2docG1ncGcnXG4gICAgICAgIEVYVEVOU0lPTl9JRDogJ2FhamhwaGpqYmNubmtnbmhsYmxuaWFvZWpwY25qZHBmJ1xuXG4gICAgZGF0YTpudWxsXG4gICAgTElTVEVOOiBudWxsXG4gICAgTVNHOiBudWxsXG4gICAgU3RvcmFnZTogbnVsbFxuICAgIEZTOiBudWxsXG5cbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAgICAgQFN0b3JhZ2UgPSBuZXcgU3RvcmFnZVxuICAgICAgICBARlMgPSBuZXcgRmlsZVN5c3RlbVxuXG4gICAgICAgIEBjb25maWcuU0VMRl9JRCA9IGNocm9tZS5ydW50aW1lLmlkXG4gICAgICAgIEBjb25maWcuRVhUX0lEID0gaWYgQGNvbmZpZy5BUFBfSUQgaXMgQGNvbmZpZy5TRUxGX0lEIHRoZW4gQGNvbmZpZy5FWFRFTlNJT05fSUQgZWxzZSBAY29uZmlnLkFQUF9JRFxuICAgICAgICBAY29uZmlnLkVYVF9UWVBFID0gaWYgQGNvbmZpZy5BUFBfSUQgaXNudCBAY29uZmlnLlNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG4gICAgICAgIEBNU0cgPSBuZXcgTVNHIEBjb25maWdcbiAgICAgICAgQExJU1RFTiA9IG5ldyBMSVNURU4gQGNvbmZpZ1xuXG4gICAgICAgIEBhcHBXaW5kb3cgPSBudWxsXG4gICAgICAgIEBwb3J0ID0gMzEzMzdcbiAgICAgICAgQGRhdGEgPSBAU3RvcmFnZS5kYXRhXG4gICAgICAgIEBpbml0KClcblxuICAgIGluaXQ6ICgpID0+XG5cbiAgICAgICMgTElTVEVOLkVYVCAnZGlyZWN0b3J5RW50cnlJZCcgKGRpcklkKSAtPlxuICAgICAgICAjIEBkaXJlY3Rvcmllcy5wdXNoIGRpcklkXG4gICAgYWRkTWFwcGluZzogKCkgLT5cbiAgICAjIGlmIEBkYXRhLmRpcmVjdG9yaWVzW11cbiAgICAgICAgIyBARlMub3BlbkRpcmVjdG9yeSAocGF0aE5hbWUsIGRpcikgLT5cbiAgICAgICAgIyBtYXRjaCA9IEBkYXRhLnJlc291cmNlc1xuICAgICAgICAjIGlmIG1hdGNoLmxlbmd0aCA+IDAgdGhlblxuXG4gICAgbGF1bmNoQXBwOiAoY2IpIC0+XG4gICAgICAgIGNocm9tZS5tYW5hZ2VtZW50LmxhdW5jaEFwcCBAY29uZmlnLkFQUF9JRFxuXG4gICAgc3RhcnRTZXJ2ZXI6ICgpID0+XG4gICAgICBAc2VydmVyID0gbmV3IFRjcFNlcnZlcignMTI3LjAuMC4xJywgQHBvcnQpXG4gICAgICBAc2VydmVyLmxpc3RlblxuXG4gICAgb3BlbkFwcDogKCkgPT5cbiAgICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsXG4gICAgICAgICAgaWQ6IFwibWFpbndpblwiXG4gICAgICAgICAgYm91bmRzOlxuICAgICAgICAgICAgICB3aWR0aDo1MDBcbiAgICAgICAgICAgICAgaGVpZ2h0OjgwMCxcbiAgICAgICh3aW4pID0+XG4gICAgICAgICAgQGFwcFdpbmRvdyA9IHdpbilcblxuICAgIHNldFJlZGlyZWN0OiAoKSA9PlxuICAgICAgdW5kZWZpbmVkXG5cbiAgICBnZXRSZXNvdXJjZXM6IChzZWxlY3RvcikgLT5cbiAgICAgIFtdLm1hcC5jYWxsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLCAoZSkgLT5cbiAgICAgICAgdXJsOiBpZiBlLmhyZWY/IHRoZW4gZS5ocmVmIGVsc2UgZS5zcmNcbiAgICAgICAgcGF0aDogaWYgZS5hdHRyaWJ1dGVzWydzcmMnXT8udmFsdWU/IHRoZW4gZS5hdHRyaWJ1dGVzWydzcmMnXS52YWx1ZSBlbHNlIGUuYXR0cmlidXRlc1snaHJlZiddPy52YWx1ZVxuICAgICAgICBocmVmOiBlLmhyZWZcbiAgICAgICAgc3JjOiBlLnNyY1xuICAgICAgICB0eXBlOiBlLnR5cGVcbiAgICAgICAgdGFnTmFtZTogZS50YWdOYW1lXG4gICAgICAuZmlsdGVyIChlKSAtPlxuICAgICAgICAgIGlmIGUudXJsLm1hdGNoKCdeKGh0dHBzPyl8KGNocm9tZS1leHRlbnNpb24pfChmaWxlKTpcXC9cXC8uKicpPyB0aGVuIHRydWUgZWxzZSBmYWxzZVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvblxuXG4jIG1hcEZpbGVzID0gKGRpcmVjdG9yeUVudHJ5SWQpIC0+XG4jICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQgKHJlc291cmNlcykgLT5cbiMgICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkoZGlyZWN0b3J5RW50cnlJZCwgKGRpcikgLT5cblxuIyAgICAgICAgIClcblxuIyB0ZXN0UGF0aCA9ICh1cmwsIGRpcmVjdG9yeUVudHJ5KSAtPlxuIyAgICAgZm9yIG5hbWUgaW4gdXJsLnNwbGl0KCcvJykuc2xpY2UoMCkucmV2ZXJzZSgpXG4jICAgICAgICAgZG8gKG5hbWUpIC0+XG4jICAgICAgICAgICAgIGRpcmVjdG9yeUVudHJ5LmdldEZpbGUocGF0aCArIG5hbWUsIHt9LFxuIyAgICAgICAgICAgICAgICAgKGZpbGUpIC0+XG4jICAgICAgICAgICAgICAgICApXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4jIyNcbiB2YXIgZXh0TXNnSWQgPSAncG1nbm5iZGZtbXBka2dhYW1rZGlpcGZnamJwZ2lvZmMnO1xuICB2YXIgYWRkRGlyZWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJywge1xuICAgICAgICBpZDogXCJtYWlud2luXCIsXG4gICAgICAgIGJvdW5kczoge1xuICAgICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgICBoZWlnaHQ6IDUwXG4gICAgICAgIH0sXG4gICAgfSwgZnVuY3Rpb24od2luKSB7XG4gICAgICAgIG1haW5XaW4gPSB3aW47XG4gICAgfSk7XG4gIH1cblxuXG5cbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgLy8gaWYgKHNlbmRlci5pZCAhPSBleHRNc2dJZClcbiAgICAgICAgICAvLyAgIHJldHVybiBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJzb3JyeSwgY291bGQgbm90IHByb2Nlc3MgeW91ciBtZXNzYWdlXCJ9KTtcblxuICAgICAgICAgIGlmIChyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIkdvdCBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzLnB1c2gocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIC8vIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeShyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQsIGZ1bmN0aW9uKGRpcmVjdG9yeUVudHJ5KSB7XG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZGlyZWN0b3J5RW50cnkpO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BzLCBJIGRvbid0IHVuZGVyc3RhbmQgdGhpcyBtZXNzYWdlXCJ9KTtcbiAgICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbC5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICBpZiAoc2VuZGVyLmlkICE9IGV4dE1zZ0lkKSB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJzb3JyeSwgY291bGQgbm90IHByb2Nlc3MgeW91ciBtZXNzYWdlXCJ9KTtcbiAgICAgICAgICAgIHJldHVybjsgIC8vIGRvbid0IGFsbG93IHRoaXMgZXh0ZW5zaW9uIGFjY2Vzc1xuICAgICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5vcGVuRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcGVuaW5nIERpcmVjdG9yeVwifSk7XG4gICAgICAgICAgICBhZGREaXJlY3RvcnkoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BzLCBJIGRvbid0IHVuZGVyc3RhbmQgdGhpcyBtZXNzYWdlXCJ9KTtcbiAgICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIHNvY2tldC5jcmVhdGUoXCJ0Y3BcIiwge30sIGZ1bmN0aW9uKF9zb2NrZXRJbmZvKSB7XG4gICAgICAgIHNvY2tldEluZm8gPSBfc29ja2V0SW5mbztcbiAgICAgICAgc29ja2V0Lmxpc3Rlbihzb2NrZXRJbmZvLnNvY2tldElkLCBcIjEyNy4wLjAuMVwiLCAzMzMzMywgNTAsIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkxJU1RFTklORzpcIiwgcmVzdWx0KTtcbiAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgc3RvcFNvY2tldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzb2NrZXQuZGVzdHJveShzb2NrZXRJbmZvLnNvY2tldElkKTtcbiAgICB9XG5cblxuIyMjXG5cbiMjI1xub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdGFydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIik7XG4gIHZhciBzdG9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9wXCIpO1xuICB2YXIgaG9zdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImhvc3RzXCIpO1xuICB2YXIgcG9ydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9ydFwiKTtcbiAgdmFyIGRpcmVjdG9yeSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGlyZWN0b3J5XCIpO1xuXG4gIHZhciBzb2NrZXQgPSBjaHJvbWUuc29ja2V0O1xuICB2YXIgc29ja2V0SW5mbztcbiAgdmFyIGZpbGVzTWFwID0ge307XG5cbiAgdmFyIHJvb3REaXI7XG4gIHZhciBwb3J0LCBleHRQb3J0O1xuICB2YXIgZGlyZWN0b3JpZXMgPSBbXTtcblxuICB2YXIgc3RyaW5nVG9VaW50OEFycmF5ID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgICAgdmlld1tpXSA9IHN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXR1cm4gdmlldztcbiAgfTtcblxuICB2YXIgYXJyYXlCdWZmZXJUb1N0cmluZyA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgIHZhciBzdHIgPSAnJztcbiAgICB2YXIgdUFycmF5VmFsID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBmb3IodmFyIHMgPSAwOyBzIDwgdUFycmF5VmFsLmxlbmd0aDsgcysrKSB7XG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xuICB9O1xuXG4gIHZhciBsb2dUb1NjcmVlbiA9IGZ1bmN0aW9uKGxvZykge1xuICAgIGxvZ2dlci50ZXh0Q29udGVudCArPSBsb2cgKyBcIlxcblwiO1xuICB9XG5cbiAgdmFyIHdyaXRlRXJyb3JSZXNwb25zZSA9IGZ1bmN0aW9uKHNvY2tldElkLCBlcnJvckNvZGUsIGtlZXBBbGl2ZSkge1xuICAgIHZhciBmaWxlID0geyBzaXplOiAwIH07XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogYmVnaW4uLi4gXCIpO1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGUpO1xuICAgIHZhciBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiOyAvLyhmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgdmFyIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemU7XG4gICAgdmFyIGhlYWRlciA9IHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIFwiICsgZXJyb3JDb2RlICsgXCIgTm90IEZvdW5kXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgga2VlcEFsaXZlID8gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgOiBcIlwiKSArIFwiXFxuXFxuXCIpO1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyBoZWFkZXIuLi5cIik7XG4gICAgdmFyIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSk7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQoaGVhZGVyLCAwKTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgdmlldy4uLlwiKTtcbiAgICBzb2NrZXQud3JpdGUoc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgZnVuY3Rpb24od3JpdGVJbmZvKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIldSSVRFXCIsIHdyaXRlSW5mbyk7XG4gICAgICBpZiAoa2VlcEFsaXZlKSB7XG4gICAgICAgIHJlYWRGcm9tU29ja2V0KHNvY2tldElkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldElkKTtcbiAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjpmaWxlcmVhZGVyOjogZW5kIG9ubG9hZC4uLlwiKTtcblxuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IGVuZC4uLlwiKTtcbiAgfTtcblxuICB2YXIgd3JpdGUyMDBSZXNwb25zZSA9IGZ1bmN0aW9uKHNvY2tldElkLCBmaWxlLCBrZWVwQWxpdmUpIHtcbiAgICB2YXIgY29udGVudFR5cGUgPSAoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIHZhciBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplO1xuICAgIHZhciBoZWFkZXIgPSBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKCBrZWVwQWxpdmUgPyBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiA6IFwiXCIpICsgXCJcXG5cXG5cIik7XG4gICAgdmFyIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSk7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQoaGVhZGVyLCAwKTtcblxuICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICB2aWV3LnNldChuZXcgVWludDhBcnJheShlLnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aCk7XG4gICAgICAgc29ja2V0LndyaXRlKHNvY2tldElkLCBvdXRwdXRCdWZmZXIsIGZ1bmN0aW9uKHdyaXRlSW5mbykge1xuICAgICAgICAgY29uc29sZS5sb2coXCJXUklURVwiLCB3cml0ZUluZm8pO1xuICAgICAgICAgaWYgKGtlZXBBbGl2ZSkge1xuICAgICAgICAgICByZWFkRnJvbVNvY2tldChzb2NrZXRJZCk7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICBzb2NrZXQuZGVzdHJveShzb2NrZXRJZCk7XG4gICAgICAgICAgIHNvY2tldC5hY2NlcHQoc29ja2V0SW5mby5zb2NrZXRJZCwgb25BY2NlcHQpO1xuICAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZpbGVSZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoZmlsZSk7XG4gIH07XG5cbiAgdmFyIG9uQWNjZXB0ID0gZnVuY3Rpb24oYWNjZXB0SW5mbykge1xuICAgIGNvbnNvbGUubG9nKFwiQUNDRVBUXCIsIGFjY2VwdEluZm8pXG4gICAgcmVhZEZyb21Tb2NrZXQoYWNjZXB0SW5mby5zb2NrZXRJZCk7XG4gIH07XG5cbiAgdmFyIHJlYWRGcm9tU29ja2V0ID0gZnVuY3Rpb24oc29ja2V0SWQpIHtcbiAgICAvLyAgUmVhZCBpbiB0aGUgZGF0YVxuICAgIHNvY2tldC5yZWFkKHNvY2tldElkLCBmdW5jdGlvbihyZWFkSW5mbykge1xuICAgICAgY29uc29sZS5sb2coXCJSRUFEXCIsIHJlYWRJbmZvKTtcbiAgICAgIC8vIFBhcnNlIHRoZSByZXF1ZXN0LlxuICAgICAgdmFyIGRhdGEgPSBhcnJheUJ1ZmZlclRvU3RyaW5nKHJlYWRJbmZvLmRhdGEpO1xuICAgICAgaWYoZGF0YS5pbmRleE9mKFwiR0VUIFwiKSA9PSAwKSB7XG4gICAgICAgIHZhciBrZWVwQWxpdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKGRhdGEuaW5kZXhPZihcIkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIikgIT0gLTEpIHtcbiAgICAgICAgICBrZWVwQWxpdmUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UgY2FuIG9ubHkgZGVhbCB3aXRoIEdFVCByZXF1ZXN0c1xuICAgICAgICB2YXIgdXJpRW5kID0gIGRhdGEuaW5kZXhPZihcIiBcIiwgNCk7XG4gICAgICAgIGlmKHVyaUVuZCA8IDApIHsgICByZXR1cm47IH1cbiAgICAgICAgdmFyIHVyaSA9IGRhdGEuc3Vic3RyaW5nKDQsIHVyaUVuZCk7XG4gICAgICAgIC8vIHN0cmlwIHF5ZXJ5IHN0cmluZ1xuICAgICAgICB2YXIgcSA9IHVyaS5pbmRleE9mKFwiP1wiKTtcbiAgICAgICAgaWYgKHEgIT0gLTEpIHtcbiAgICAgICAgICB1cmkgPSB1cmkuc3Vic3RyaW5nKDAsIHEpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5KGRpcmVjdG9yaWVzWzBdKVxuICAgICAgICAudGhlbihcbiAgICAgICAgICAgIChmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGlyZWN0b3J5RW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGlyZWN0b3J5RW50cnkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh1cmkpO1xuICAgICAgICAgICAgICAgICAgICBkaXJlY3RvcnlFbnRyeS5nZXRGaWxlKCdteU5ld0FwcERFVi5yZXNvdXJjZS9pbmRleC5qcycsIHt9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRlMjAwUmVzcG9uc2Uoc29ja2V0SWQsIGZpbGUsIGtlZXBBbGl2ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH0pKHVyaSlcbiAgICAgICAgKTtcblxuICAgICAgICAvLyB2YXIgZmlsZSA9XG4gICAgICAgIC8vIGlmKCEhZmlsZSA9PSBmYWxzZSkge1xuICAgICAgICAvLyAgIGNvbnNvbGUud2FybihcIkZpbGUgZG9lcyBub3QgZXhpc3QuLi5cIiArIHVyaSk7XG4gICAgICAgIC8vICAgd3JpdGVFcnJvclJlc3BvbnNlKHNvY2tldElkLCA0MDQsIGtlZXBBbGl2ZSk7XG4gICAgICAgIC8vICAgcmV0dXJuO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIGxvZ1RvU2NyZWVuKFwiR0VUIDIwMCBcIiArIHVyaSk7XG4gICAgICAgIC8vIHdyaXRlMjAwUmVzcG9uc2Uoc29ja2V0SWQsIGZpbGUsIGtlZXBBbGl2ZSk7XG4gICAgICAvLyB9XG4gICAgICAvLyBlbHNlIHtcbiAgICAgICAgLy8gVGhyb3cgYW4gZXJyb3JcbiAgICAgICAgLy8gc29ja2V0LmRlc3Ryb3koc29ja2V0SWQpO1xuICAgICAgLy8gfVxuXG4gIH07XG59KTtcbn1cblxuXG4gIHZhciBleHRNc2dJZCA9ICdwbWdubmJkZm1tcGRrZ2FhbWtkaWlwZmdqYnBnaW9mYyc7XG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIGlmIChzZW5kZXIuaWQgIT0gZXh0TXNnSWQpIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgICAgcmV0dXJuOyAgLy8gZG9uJ3QgYWxsb3cgdGhpcyBleHRlbnNpb24gYWNjZXNzXG4gICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm9wZW5EaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wZW5pbmcgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIGFkZERpcmVjdG9yeSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuXG5cbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgLy8gaWYgKHNlbmRlci5pZCAhPSBleHRNc2dJZClcbiAgICAgICAgICAvLyAgIHJldHVybiBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJzb3JyeSwgY291bGQgbm90IHByb2Nlc3MgeW91ciBtZXNzYWdlXCJ9KTtcblxuICAgICAgICAgIGlmIChyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIkdvdCBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzLnB1c2gocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKTtcbiAgICAgICAgICAgIC8vIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeShyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQsIGZ1bmN0aW9uKGRpcmVjdG9yeUVudHJ5KSB7XG4gICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZGlyZWN0b3J5RW50cnkpO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BzLCBJIGRvbid0IHVuZGVyc3RhbmQgdGhpcyBtZXNzYWdlXCJ9KTtcbiAgICAgICAgICB9XG4gICAgICB9KTtcbiAgICBzb2NrZXQuY3JlYXRlKFwidGNwXCIsIHt9LCBmdW5jdGlvbihfc29ja2V0SW5mbykge1xuICAgICAgICBzb2NrZXRJbmZvID0gX3NvY2tldEluZm87XG4gICAgICAgIHNvY2tldC5saXN0ZW4oc29ja2V0SW5mby5zb2NrZXRJZCwgXCIxMjcuMC4wLjFcIiwgMzMzMzMsIDUwLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJMSVNURU5JTkc6XCIsIHJlc3VsdCk7XG4gICAgICAgIHNvY2tldC5hY2NlcHQoc29ja2V0SW5mby5zb2NrZXRJZCwgb25BY2NlcHQpO1xuICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdmFyIHN0b3BTb2NrZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SW5mby5zb2NrZXRJZCk7XG4gICAgfVxuXG4gIHZhciBhZGREaXJlY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLCB7XG4gICAgICAgIGlkOiBcIm1haW53aW5cIixcbiAgICAgICAgYm91bmRzOiB7XG4gICAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICAgIGhlaWdodDogNTBcbiAgICAgICAgfSxcbiAgICB9LCBmdW5jdGlvbih3aW4pIHtcbiAgICAgICAgbWFpbldpbiA9IHdpbjtcbiAgICB9KTtcbiAgfVxuXG59O1xuIyMjXG5cbiJdfQ==
