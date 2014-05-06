(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{}],2:[function(require,module,exports){
var Application, ExtBackground, app, sendResources,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Application = require('../../common.coffee');

ExtBackground = (function(_super) {
  __extends(ExtBackground, _super);

  function ExtBackground() {
    this.updateIcon = __bind(this.updateIcon, this);
    return ExtBackground.__super__.constructor.apply(this, arguments);
  }

  ExtBackground.prototype.urls = {};

  ExtBackground.prototype.urlArr = [];

  ExtBackground.prototype.origins = {};

  ExtBackground.prototype.isOn = {};

  ExtBackground.prototype.files = {};

  ExtBackground.prototype.extPort = {};

  ExtBackground.prototype.init = function() {
    chrome.tabs.onUpdated.addListener((function(_this) {
      return function(tabId) {
        if (_this.isOn[tabId] != null) {
          return _this.updateIcon(tabId);
        }
      };
    })(this));
    this.LISTEN.Local('resources', (function(_this) {
      return function(resources) {
        debugger;
        _this.launchApp();
        return _this.MSG.Ext({
          'resources': resources
        });
      };
    })(this));
    return chrome.browserAction.onClicked.addListener((function(_this) {
      return function(tab) {
        if (_this.isOn[tab.id]) {
          _this.isOn[tab.id] = true;
          chrome.tabs.sendMessage(tab.id, {
            'getResources': true
          });
        } else {
          _this.isOn[tab.id] = _this.isOn[tab.id] != null ? true : !_this.isOn[tab.id];
        }
        return _this.updateIcon(tab.id);
      };
    })(this));
  };

  ExtBackground.prototype.updateIcon = function(tabId) {
    if (this.isOn[tabId]) {
      return chrome.browserAction.setIcon({
        path: {
          '19': 'images/redir-on-19.png',
          '38': 'images/redir-on-38.png'
        },
        tabId: tabId
      });
    } else {
      return chrome.browserAction.setIcon({
        path: {
          '19': 'images/redir-off-19.png',
          '38': 'images/redir-off-38.png'
        },
        tabId: tabId
      });
    }
  };

  return ExtBackground;

})(Application);

sendResources = function(resources) {
  return chrome.runtime.sendMessage(appId, {
    resources: resources
  });
};

app = new ExtBackground;


},{"../../common.coffee":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0Ryb3Bib3ggKFNpbHZlcmxpbmUpL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL0Ryb3Bib3ggKFNpbHZlcmxpbmUpL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL2NvbW1vbi5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0Ryb3Bib3ggKFNpbHZlcmxpbmUpL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL2V4dGVuc2lvbi9zcmMvYmFja2dyb3VuZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNJQSxJQUFBLGtFQUFBO0VBQUEsa0ZBQUE7O0FBQUEsS0FBSyxDQUFBLFNBQUUsQ0FBQSxLQUFQLEdBQWUsU0FBQyxLQUFELEdBQUE7QUFDWCxNQUFBLEdBQUE7QUFBQSxFQUFBLElBQWEsTUFBQSxDQUFBLEtBQUEsS0FBa0IsUUFBL0I7QUFBQSxXQUFPLEVBQVAsQ0FBQTtHQUFBO0FBQUEsRUFDQSxHQUFBLEdBQU0sTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaLENBQWtCLENBQUMsTUFEekIsQ0FBQTtTQUVBLElBQUMsQ0FBQSxNQUFELENBQVEsU0FBQyxJQUFELEdBQUE7QUFDSixRQUFBLGVBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxDQUFSLENBQUE7QUFDQSxTQUFBLFlBQUE7dUJBQUE7QUFDSSxNQUFBLElBQWMsSUFBSyxDQUFBLEdBQUEsQ0FBTCxLQUFhLEdBQTNCO0FBQUEsUUFBQSxLQUFBLElBQVMsQ0FBVCxDQUFBO09BREo7QUFBQSxLQURBO0FBR0EsSUFBQSxJQUFHLEtBQUEsS0FBUyxHQUFaO2FBQXFCLEtBQXJCO0tBQUEsTUFBQTthQUErQixNQUEvQjtLQUpJO0VBQUEsQ0FBUixFQUhXO0FBQUEsQ0FBZixDQUFBOztBQUFBLEtBU0ss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QUEsRUFBVSxTQUFWO0dBQWpDLEVBREk7QUFBQSxDQTVDaEIsQ0FBQTs7QUFBQSxHQStDQSxHQUFNLEdBQUEsQ0FBQSxhQS9DTixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIHNlcnZlciA9IHJlcXVpcmUgJy4vdGNwLXNlcnZlci5qcydcbiMgcmVxdWlyZSAnLi9jaHJvbWUtbW9jaydcbiMgcm9vdC5xID0gcmVxdWlyZSAncSdcblxuQXJyYXk6OndoZXJlID0gKHF1ZXJ5KSAtPlxuICAgIHJldHVybiBbXSBpZiB0eXBlb2YgcXVlcnkgaXNudCBcIm9iamVjdFwiXG4gICAgaGl0ID0gT2JqZWN0LmtleXMocXVlcnkpLmxlbmd0aFxuICAgIEBmaWx0ZXIgKGl0ZW0pIC0+XG4gICAgICAgIG1hdGNoID0gMFxuICAgICAgICBmb3Iga2V5LCB2YWwgb2YgcXVlcnlcbiAgICAgICAgICAgIG1hdGNoICs9IDEgaWYgaXRlbVtrZXldIGlzIHZhbFxuICAgICAgICBpZiBtYXRjaCBpcyBoaXQgdGhlbiB0cnVlIGVsc2UgZmFsc2VcblxuQXJyYXk6OnRvRGljdCA9IChrZXkpIC0+XG4gIEByZWR1Y2UgKChkaWN0LCBvYmopIC0+IGRpY3RbIG9ialtrZXldIF0gPSBvYmogaWYgb2JqW2tld3ldPzsgcmV0dXJuIGRpY3QpLCB7fVxuXG5cbmNsYXNzIE1TR1xuICAgIGNvbnN0cnVjdG9yOiAoY29uZmlnKSAtPlxuICAgICAgICBAY29uZmlnID0gY29uZmlnXG4gICAgTG9jYWw6IChtZXNzYWdlKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyBcIj09IE1FU1NBR0UgPT0+ICN7IG1lc3NhZ2UgfVwiXG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIG1lc3NhZ2VcbiAgICBFeHQ6IChtZXNzYWdlKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyBcIj09IE1FU1NBR0UgI3sgQGNvbmZpZy5FWFRfVFlQRSB9ID09PiAjeyBtZXNzYWdlIH1cIlxuICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBAY29uZmlnLkVYVF9JRCwgbWVzc2FnZVxuXG5jbGFzcyBMSVNURU5cbiAgICBsb2NhbDpcbiAgICAgICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VcbiAgICAgICAgbGlzdGVuZXJzOnt9XG4gICAgZXh0ZXJuYWw6XG4gICAgICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWxcbiAgICAgICAgbGlzdGVuZXJzOnt9XG4gICAgY29uc3RydWN0b3I6IChjb25maWcpIC0+XG4gICAgICAgIEBjb25maWcgPSBjb25maWdcbiAgICAgICAgQGxvY2FsLmFwaS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZVxuICAgICAgICBAZXh0ZXJuYWwuYXBpPy5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgICBMb2NhbDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgICAgQGxvY2FsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgICBFeHQ6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICAgIEBleHRlcm5hbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gICAgX29uTWVzc2FnZUV4dGVybmFsOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgICAgIGNvbnNvbGUubG9nIFwiPD09IEVYVEVSTkFMIE1FU1NBR0UgPT0gI3sgQGNvbmZpZy5FWFRfVFlQRSB9ID09XCIgKyByZXF1ZXN0XG4gICAgICAgIGlmIHNlbmRlci5pZCBpc250IEBjb25maWcuRVhUX0lEIHRoZW4gcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSBmb3Iga2V5IG9mIHJlcXVlc3RcblxuICAgIF9vbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICAgICAgY29uc29sZS5sb2cgXCI8PT0gTUVTU0FHRSA9PSAjeyBAY29uZmlnLkVYVF9UWVBFIH0gPT1cIiArIHJlcXVlc3RcbiAgICAgICAgQGxvY2FsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0gZm9yIGtleSBvZiByZXF1ZXN0XG5cbiAgICAjIGNsYXNzIExpc3RlbmVyXG4gICAgIyAgIGxpc3RlbmVyczoge31cbiAgICAjICAgZXh0ZXJuYWw6ZmFsc2VcbiAgICAjICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VcbiAgICAjICAgY29uc3RydWN0b3I6IChleHRlcm5hbCkgLT5cbiAgICAjICAgICBAZXh0ZXJuYWwgPSBleHRlcm5hbFxuICAgICMgICAgIEBhcGkgPSBpZiBAZXh0ZXJuYWwgdGhlbiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbCBlbHNlIEBhcGlcbiAgICAjICAgICBAYXBpLmFkZExpc3RlbmVyIEBvbk1lc3NhZ2VcbiAgICAjICAgYWRkTGlzdGVuZXI6IChtZXNzYWdlLCBjYWxsYmFjaykgLT5cbiAgICAjICAgICBAbGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcbiAgICAjICAgb25NZXNzYWdlOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgIyAgICAgY29uc29sZS5sb2cgXCI8PT0gTUVTU0FHRSA9PSAjeyBAY29uZmlnLkVYVF9UWVBFIH0gPT1cIiArIHJlcXVlc3RcbiAgICAjICAgICBpZiBAZXh0ZXJuYWwgYW5kIHNlbmRlci5pZCBpc250IEBjb25maWcuRVhUX0lEIHRoZW4gcmV0dXJuIHVuZGVmaW5lZFxuICAgICMgICAgIGVsc2VcbiAgICAjICAgICAgIGZvciBrZXkgb2YgcmVxdWVzdFxuICAgICMgICAgICAgICBkbyAoa2V5KSA9PiBpZiBAbGlzdGVuZXJzW2tleV0/IHRoZW4gQGxpc3RlbmVyc1trZXldIHJlcXVlc3Qua2V5XG5cbmNsYXNzIERhdGFcbiAgICBtYXBwaW5nOltcbiAgICAgICAgZGlyZWN0b3J5Om51bGxcbiAgICAgICAgdXJsUGF0dGVybjpudWxsXG4gICAgXVxuICAgIHJlc291cmNlczpbXG4gICAgICAgIHJlc291cmNlOm51bGxcbiAgICAgICAgZmlsZTpudWxsXG4gICAgXVxuXG5cblxuY2xhc3MgU3RvcmFnZVxuICAgIGFwaTogY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgICBkYXRhOiB7fVxuICAgIGNhbGxiYWNrOiAoKSAtPlxuICAgIGNvbnN0cnVjdG9yOiAoY2FsbGJhY2spIC0+XG4gICAgICAgIEBjYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgICAgIEByZXRyaWV2ZUFsbCgpXG4gICAgICAgIEBvbkNoYW5nZWRBbGwoKVxuXG4gICAgc2F2ZTogKGtleSwgaXRlbSkgLT5cbiAgICAgIG9iaiA9IHt9XG4gICAgICBvYmpba2V5XSA9IGl0ZW1cbiAgICAgIEBhcGkuc2V0IG9ialxuXG4gICAgc2F2ZUFsbDogKCkgLT5cbiAgICAgICAgQGFwaS5zZXQgQGRhdGFcblxuICAgIHJldHJpZXZlOiAoa2V5LCBjYikgLT5cbiAgICAgICAgQGFwaS5nZXQga2V5LCAocmVzdWx0cykgLT5cbiAgICAgICAgICAgIEBkYXRhW3JdID0gcmVzdWx0c1tyXSBmb3IgciBvZiByZXN1bHRzXG4gICAgICAgICAgICBpZiBjYj8gdGhlbiBjYiByZXN1bHRzW2tleV1cblxuXG4gICAgcmV0cmlldmVBbGw6IChjYikgLT5cbiAgICAgICAgQGFwaS5nZXQgKHJlc3VsdCkgPT5cbiAgICAgICAgICAgIEBkYXRhID0gcmVzdWx0XG4gICAgICAgICAgICBAY2FsbGJhY2s/IHJlc3VsdFxuICAgICAgICAgICAgY2I/IHJlc3VsdFxuICAgICAgICAgICAgY29uc29sZS5sb2cgcmVzdWx0XG5cbiAgICBvbkNoYW5nZWQ6IChrZXksIGNiKSAtPlxuICAgICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLCBuYW1lc3BhY2UpIC0+XG4gICAgICAgIGlmIGNoYW5nZXNba2V5XT8gYW5kIGNiPyB0aGVuIGNiIGNoYW5nZXNba2V5XS5uZXdWYWx1ZVxuICAgICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuICAgIG9uQ2hhbmdlZEFsbDogKCkgLT5cbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLG5hbWVzcGFjZSkgPT5cbiAgICAgICAgICAgIEBkYXRhW2NdID0gY2hhbmdlc1tjXS5uZXdWYWx1ZSBmb3IgYyBvZiBjaGFuZ2VzXG4gICAgICAgICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuXG4jIGNsYXNzIERpcmVjdG9yeVN0b3JlXG4jICAgZGlyZWN0b3JpZXMgPVxuIyAgIGNvbnN0cnVjdG9yICgpIC0+XG5cbiMgY2xhc3MgRGlyZWN0b3J5XG5cblxuY2xhc3MgRmlsZVN5c3RlbVxuICAgIGFwaTogY2hyb21lLmZpbGVTeXN0ZW1cblxuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuXG4gICAgIyBAZGlyczogbmV3IERpcmVjdG9yeVN0b3JlXG4gICAgZmlsZVRvQXJyYXlCdWZmZXI6IChibG9iLCBjYWxsYmFjaywgb3B0X2Vycm9yQ2FsbGJhY2spIC0+XG4gICAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgICByZWFkZXIub25sb2FkID0gKGUpIC0+XG4gICAgICAgIGNhbGxiYWNrIGUudGFyZ2V0LnJlc3VsdFxuICAgICAgICByZXR1cm5cblxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSAoZSkgLT5cbiAgICAgICAgb3B0X2Vycm9yQ2FsbGJhY2sgZSAgaWYgb3B0X2Vycm9yQ2FsbGJhY2tcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBibG9iXG4gICAgICByZXR1cm5cblxuICAgIHJlYWRGaWxlOiAoZGlyRW50cnksIHBhdGgsIHN1Y2Nlc3MsIGVycm9yKSAtPlxuICAgICAgICBnZXRGaWxlRW50cnkgZGlyRW50cnksIHBhdGgsIChmaWxlRW50cnkpIC0+XG4gICAgICAgICAgICBmaWxlRW50cnkuZmlsZSAoZmlsZSkgLT5cbiAgICAgICAgICAgICAgICBmaWxlVG9BcnJheUJ1ZmZlciBmaWxlLCAoYXJyYXlCdWZmZXIpIC0+XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgYXJyYXlCdWZmZXJcbiAgICAgICAgICAgICAgICAgICAgLGVycm9yXG4gICAgICAgICAgICAgICAgLGVycm9yXG4gICAgICAgICAgICAsZXJyb3JcblxuICAgIGdldEZpbGVFbnRyeTogKGRpckVudHJ5LCBwYXRoLCBzdWNjZXNzLCBlcnJvcikgLT5cbiAgICAgICAgZGlyRW50cnkuZ2V0RmlsZSBwYXRoLCB7fSwgKGZpbGVFbnRyeSkgLT5cbiAgICAgICAgICAgIHN1Y2Nlc3MgZmlsZUVudHJ5XG5cbiAgICBvcGVuRGlyZWN0b3J5OiAoY2FsbGJhY2spID0+XG4gICAgICAgIEBhcGkuY2hvb3NlRW50cnkgdHlwZTonb3BlbkRpcmVjdG9yeScsIChkaXJlY3RvcnlFbnRyeSwgZmlsZXMpID0+XG4gICAgICAgICAgICBAYXBpLmdldERpc3BsYXlQYXRoIGRpcmVjdG9yeUVudHJ5LCAocGF0aE5hbWUpID0+XG4gICAgICAgICAgICAgICAgZGlyID1cbiAgICAgICAgICAgICAgICAgIHJlbFBhdGg6IGRpcmVjdG9yeUVudHJ5LmZ1bGxQYXRoLnJlcGxhY2UgJy8nICsgZGlyZWN0b3J5RW50cnkubmFtZSwgJydcbiAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeUVudHJ5SWQ6IEBhcGkucmV0YWluRW50cnkgZGlyZWN0b3J5RW50cnlcbiAgICAgICAgICAgICAgICAgIGVudHJ5OiBkaXJlY3RvcnlFbnRyeVxuXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgcGF0aE5hbWUsIGRpclxuICAgICAgICAgICAgICAgICMgQGdldE9uZURpckxpc3QgZGlyXG4gICAgICAgICAgICAgICAgIyBTdG9yYWdlLnNhdmUgJ2RpcmVjdG9yaWVzJywgQHNjb3BlLmRpcmVjdG9yaWVzIChyZXN1bHQpIC0+XG5cblxuXG5jbGFzcyBNYXBwaW5nXG4gICAgcmVzb3VyY2U6IG51bGwgI2h0dHA6Ly9ibGFsYS5jb20vd2hhdC9ldmVyL2luZGV4LmpzXG4gICAgbG9jYWw6IG51bGwgIy9zb21lc2hpdHR5RGlyL290aGVyU2hpdHR5RGlyL1xuICAgIHJlZ2V4OiBudWxsXG4gICAgY29uc3RydWN0b3I6IChyZXNvdXJjZSwgbG9jYWwsIHJlZ2V4KSAtPlxuICAgICAgW0Bsb2NhbCwgQHJlc291cmNlLCBAcmVnZXhdID0gW2xvY2FsLCByZXNvdXJjZSwgcmVnZXhdXG5cbiAgICBnZXRMb2NhbFJlc291cmNlOiAoKSAtPlxuICAgICAgQHJlc291cmNlLnJlcGxhY2UoQHJlZ2V4LCBAbG9jYWwpXG5cbiAgICBzZXRSZWRpcmVjdERlY2xhcmF0aXZlOiAodGFiSWQpIC0+XG4gICAgICBydWxlcyA9IFtdLnB1c2hcbiAgICAgICAgcHJpb3JpdHk6MTAwXG4gICAgICAgIGNvbmRpdGlvbnM6IFtcbiAgICAgICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlcXVlc3RNYXRjaGVyXG4gICAgICAgICAgICAgICAgdXJsOlxuICAgICAgICAgICAgICAgICAgICB1cmxNYXRjaGVzOkByZWdleFxuICAgICAgICAgICAgXVxuICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZWRpcmVjdFJlcXVlc3RcbiAgICAgICAgICAgICAgICByZWRpcmVjdFVybDpAZ2V0TG9jYWxSZXNvdXJjZSgpXG4gICAgICAgIF1cbiAgICAgIGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3Qub25SZXF1ZXN0LmFkZFJ1bGVzIHJ1bGVzXG5cbiMgY2xhc3MgU3RvcmFnZUZhY3RvcnlcbiMgICBtYWtlT2JqZWN0OiAodHlwZSkgLT5cbiMgICAgIHN3aXRjaCB0eXBlXG4jICAgICAgIHdoZW4gJ1Jlc291cmNlTGlzdCdcbiMgICBfY3JlYXRlOiAodHlwZSkgLT5cbiMgICAgIEBnZXRGcm9tU3RvcmFnZS50aGVuIChvYmopIC0+XG4jICAgICAgIHJldHVybiBvYmpcblxuIyAgIGdldEZyb21TdG9yYWdlOiAoKSAtPlxuIyAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlIChzdWNjZXNzLCBmYWlsKSAtPlxuIyAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQgKGEpIC0+XG4jICAgICAgICAgYiA9IG5ldyBSZXNvdXJjZUxpc3RcbiMgICAgICAgICBmb3Iga2V5IG9mIGFcbiMgICAgICAgICAgIGRvIChhKSAtPlxuIyAgICAgICAgICAgICBiW2tleV0gPSBhW2tleV1cbiMgICAgICAgICBzdWNjZXNzIGJcbiMjI1xuY2xhc3MgRmlsZVxuICAgIGNvbnN0cnVjdG9yOiAoZGlyZWN0b3J5RW50cnksIHBhdGgpIC0+XG4gICAgICAgIEBkaXJFbnRyeSA9IGRpcmVjdG9yeUVudHJ5XG4gICAgICAgIEBwYXRoID0gcGF0aFxuXG5jbGFzcyBTZXJ2ZXJcbiAgICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuICAgIHN0YXJ0OiAoKSAtPlxuICAgICAgICBzb2NrZXQuY3JlYXRlIFwidGNwXCIsIHt9LCAoX3NvY2tldEluZm8pIC0+XG4gICAgICAgICAgICBAc29ja2V0SW5mbyA9IF9zb2NrZXRJbmZvO1xuICAgICAgICAgICAgc29ja2V0Lmxpc3RlbiBzb2NrZXRJbmZvLnNvY2tldElkLCBcIjEyNy4wLjAuMVwiLCAzMTMzNywgNTAsIChyZXN1bHQpIC0+XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cgXCJMSVNURU5JTkc6XCIsIHJlc3VsdFxuICAgICAgICAgICAgICAgIHNvY2tldC5hY2NlcHQgQHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuICAgIHN0b3A6ICgpIC0+XG4gICAgICAgIHNvY2tldC5kZXN0cm95IEBzb2NrZXRJbmZvLnNvY2tldElkXG5cbiAgICBfb25BY2NlcHQ6IChhY2NlcHRJbmZvKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyhcIkFDQ0VQVFwiLCBhY2NlcHRJbmZvKVxuICAgICAgICBpbmZvID0gQF9yZWFkRnJvbVNvY2tldCBhY2NlcHRJbmZvLnNvY2tldElkXG4gICAgICAgIEBnZXRGaWxlIHVyaSwgKGZpbGUpIC0+XG5cbiAgICBnZXRGaWxlOiAodXJpKSAtPlxuXG4gICAgX3dyaXRlMjAwUmVzcG9uc2U6IChzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKSAtPlxuICAgICAgY29udGVudFR5cGUgPSAoaWYgKGZpbGUudHlwZSBpcyBcIlwiKSB0aGVuIFwidGV4dC9wbGFpblwiIGVsc2UgZmlsZS50eXBlKVxuICAgICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgICAgaGVhZGVyID0gc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgMjAwIE9LXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgICAgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuICAgICAgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gKGUpIC0+XG4gICAgICAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgICAgIHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSAtPlxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgICAgICAgaWYga2VlcEFsaXZlXG4gICAgICAgICAgICByZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNvY2tldC5kZXN0cm95IHNvY2tldElkXG4gICAgICAgICAgICBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0XG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGZpbGVSZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgZmlsZVxuICAgICAgcmV0dXJuXG5cbiAgICBfcmVhZEZyb21Tb2NrZXQ6IChzb2NrZXRJZCkgLT5cbiAgICAgICAgc29ja2V0LnJlYWQgc29ja2V0SWQsIChyZWFkSW5mbykgLT5cbiAgICAgICAgICBjb25zb2xlLmxvZyBcIlJFQURcIiwgcmVhZEluZm9cblxuICAgICAgICAgICMgUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICAgICAgZGF0YSA9IGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSlcbiAgICAgICAgICBpZiBkYXRhLmluZGV4T2YoXCJHRVQgXCIpIGlzIDBcbiAgICAgICAgICAgIGtlZXBBbGl2ZSA9IGZhbHNlXG4gICAgICAgICAgICBrZWVwQWxpdmUgPSB0cnVlICB1bmxlc3MgZGF0YS5pbmRleE9mKFwiQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiKSBpcyAtMVxuXG4gICAgICAgICAgICAjIHdlIGNhbiBvbmx5IGRlYWwgd2l0aCBHRVQgcmVxdWVzdHNcbiAgICAgICAgICAgIHVyaUVuZCA9IGRhdGEuaW5kZXhPZihcIiBcIiwgNClcbiAgICAgICAgICAgIHJldHVybiAgaWYgdXJpRW5kIDwgMFxuICAgICAgICAgICAgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKVxuXG4gICAgICAgICAgICAjIHN0cmlwIHF5ZXJ5IHN0cmluZ1xuICAgICAgICAgICAgcSA9IHVyaS5pbmRleE9mKFwiP1wiKVxuICAgICAgICAgICAgaW5mbyA9XG4gICAgICAgICAgICAgICAgdXJpOiAodXJpLnN1YnN0cmluZygwLCBxKSB1bmxlc3MgcSBpcyAtMSlcbiAgICAgICAgICAgICAgICBrZWVwQWxpdmU6a2VlcEFsaXZlXG5cbiAgICAgICAgc3RyaW5nVG9VaW50OEFycmF5OiAoc3RyaW5nKSAtPlxuICAgICAgICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKVxuICAgICAgICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgICAgICAgaSA9IDBcblxuICAgICAgICAgIHdoaWxlIGkgPCBzdHJpbmcubGVuZ3RoXG4gICAgICAgICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgIHZpZXdcblxuICAgICAgICBhcnJheUJ1ZmZlclRvU3RyaW5nOiAoYnVmZmVyKSAtPlxuICAgICAgICAgIHN0ciA9IFwiXCJcbiAgICAgICAgICB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgICAgICAgcyA9IDBcblxuICAgICAgICAgIHdoaWxlIHMgPCB1QXJyYXlWYWwubGVuZ3RoXG4gICAgICAgICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pXG4gICAgICAgICAgICBzKytcbiAgICAgICAgICBzdHJcbiMjI1xuY2xhc3MgVXRpbFxuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuXG5jbGFzcyBBcHBsaWNhdGlvblxuXG4gICAgY29uZmlnOlxuICAgICAgICBBUFBfSUQ6ICdjaHBmZmRja2toaHBwbWdjbGZib21wZmdrZ2hwbWdwZydcbiAgICAgICAgRVhURU5TSU9OX0lEOiAnYWFqaHBoampiY25ua2duaGxibG5pYW9lanBjbmpkcGYnXG5cbiAgICBkYXRhOm51bGxcbiAgICBMSVNURU46IG51bGxcbiAgICBNU0c6IG51bGxcbiAgICBTdG9yYWdlOiBudWxsXG4gICAgRlM6IG51bGxcblxuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICAgICBAU3RvcmFnZSA9IG5ldyBTdG9yYWdlXG4gICAgICAgIEBGUyA9IG5ldyBGaWxlU3lzdGVtXG5cbiAgICAgICAgQGNvbmZpZy5TRUxGX0lEID0gY2hyb21lLnJ1bnRpbWUuaWRcbiAgICAgICAgQGNvbmZpZy5FWFRfSUQgPSBpZiBAY29uZmlnLkFQUF9JRCBpcyBAY29uZmlnLlNFTEZfSUQgdGhlbiBAY29uZmlnLkVYVEVOU0lPTl9JRCBlbHNlIEBjb25maWcuQVBQX0lEXG4gICAgICAgIEBjb25maWcuRVhUX1RZUEUgPSBpZiBAY29uZmlnLkFQUF9JRCBpc250IEBjb25maWcuU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcbiAgICAgICAgQE1TRyA9IG5ldyBNU0cgQGNvbmZpZ1xuICAgICAgICBATElTVEVOID0gbmV3IExJU1RFTiBAY29uZmlnXG5cbiAgICAgICAgQGFwcFdpbmRvdyA9IG51bGxcbiAgICAgICAgQHBvcnQgPSAzMTMzN1xuICAgICAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcbiAgICAgICAgQGluaXQoKVxuXG4gICAgaW5pdDogKCkgPT5cblxuICAgICAgIyBMSVNURU4uRVhUICdkaXJlY3RvcnlFbnRyeUlkJyAoZGlySWQpIC0+XG4gICAgICAgICMgQGRpcmVjdG9yaWVzLnB1c2ggZGlySWRcbiAgICBhZGRNYXBwaW5nOiAoKSAtPlxuICAgICMgaWYgQGRhdGEuZGlyZWN0b3JpZXNbXVxuICAgICAgICAjIEBGUy5vcGVuRGlyZWN0b3J5IChwYXRoTmFtZSwgZGlyKSAtPlxuICAgICAgICAjIG1hdGNoID0gQGRhdGEucmVzb3VyY2VzXG4gICAgICAgICMgaWYgbWF0Y2gubGVuZ3RoID4gMCB0aGVuXG5cbiAgICBsYXVuY2hBcHA6IChjYikgLT5cbiAgICAgICAgY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIEBjb25maWcuQVBQX0lEXG5cbiAgICBzdGFydFNlcnZlcjogKCkgPT5cbiAgICAgIEBzZXJ2ZXIgPSBuZXcgVGNwU2VydmVyKCcxMjcuMC4wLjEnLCBAcG9ydClcbiAgICAgIEBzZXJ2ZXIubGlzdGVuXG5cbiAgICBvcGVuQXBwOiAoKSA9PlxuICAgICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJyxcbiAgICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgICBib3VuZHM6XG4gICAgICAgICAgICAgIHdpZHRoOjUwMFxuICAgICAgICAgICAgICBoZWlnaHQ6ODAwLFxuICAgICAgKHdpbikgPT5cbiAgICAgICAgICBAYXBwV2luZG93ID0gd2luKVxuXG4gICAgc2V0UmVkaXJlY3Q6ICgpID0+XG4gICAgICB1bmRlZmluZWRcblxuICAgIGdldFJlc291cmNlczogKHNlbGVjdG9yKSAtPlxuICAgICAgW10ubWFwLmNhbGwgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvciksIChlKSAtPlxuICAgICAgICB1cmw6IGlmIGUuaHJlZj8gdGhlbiBlLmhyZWYgZWxzZSBlLnNyY1xuICAgICAgICBwYXRoOiBpZiBlLmF0dHJpYnV0ZXNbJ3NyYyddPy52YWx1ZT8gdGhlbiBlLmF0dHJpYnV0ZXNbJ3NyYyddLnZhbHVlIGVsc2UgZS5hdHRyaWJ1dGVzWydocmVmJ10/LnZhbHVlXG4gICAgICAgIGhyZWY6IGUuaHJlZlxuICAgICAgICBzcmM6IGUuc3JjXG4gICAgICAgIHR5cGU6IGUudHlwZVxuICAgICAgICB0YWdOYW1lOiBlLnRhZ05hbWVcbiAgICAgIC5maWx0ZXIgKGUpIC0+XG4gICAgICAgICAgaWYgZS51cmwubWF0Y2goJ14oaHR0cHM/KXwoY2hyb21lLWV4dGVuc2lvbil8KGZpbGUpOlxcL1xcLy4qJyk/IHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxpY2F0aW9uXG5cbiMgbWFwRmlsZXMgPSAoZGlyZWN0b3J5RW50cnlJZCkgLT5cbiMgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCAocmVzb3VyY2VzKSAtPlxuIyAgICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeShkaXJlY3RvcnlFbnRyeUlkLCAoZGlyKSAtPlxuXG4jICAgICAgICAgKVxuXG4jIHRlc3RQYXRoID0gKHVybCwgZGlyZWN0b3J5RW50cnkpIC0+XG4jICAgICBmb3IgbmFtZSBpbiB1cmwuc3BsaXQoJy8nKS5zbGljZSgwKS5yZXZlcnNlKClcbiMgICAgICAgICBkbyAobmFtZSkgLT5cbiMgICAgICAgICAgICAgZGlyZWN0b3J5RW50cnkuZ2V0RmlsZShwYXRoICsgbmFtZSwge30sXG4jICAgICAgICAgICAgICAgICAoZmlsZSkgLT5cbiMgICAgICAgICAgICAgICAgIClcblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiMjI1xuIHZhciBleHRNc2dJZCA9ICdwbWdubmJkZm1tcGRrZ2FhbWtkaWlwZmdqYnBnaW9mYyc7XG4gIHZhciBhZGREaXJlY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLCB7XG4gICAgICAgIGlkOiBcIm1haW53aW5cIixcbiAgICAgICAgYm91bmRzOiB7XG4gICAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICAgIGhlaWdodDogNTBcbiAgICAgICAgfSxcbiAgICB9LCBmdW5jdGlvbih3aW4pIHtcbiAgICAgICAgbWFpbldpbiA9IHdpbjtcbiAgICB9KTtcbiAgfVxuXG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICAvLyBpZiAoc2VuZGVyLmlkICE9IGV4dE1zZ0lkKVxuICAgICAgICAgIC8vICAgcmV0dXJuIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiR290IERpcmVjdG9yeVwifSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgZGlyZWN0b3JpZXMucHVzaChyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgLy8gY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5KHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCwgZnVuY3Rpb24oZGlyZWN0b3J5RW50cnkpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIGlmIChzZW5kZXIuaWQgIT0gZXh0TXNnSWQpIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgICAgcmV0dXJuOyAgLy8gZG9uJ3QgYWxsb3cgdGhpcyBleHRlbnNpb24gYWNjZXNzXG4gICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm9wZW5EaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wZW5pbmcgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIGFkZERpcmVjdG9yeSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgc29ja2V0LmNyZWF0ZShcInRjcFwiLCB7fSwgZnVuY3Rpb24oX3NvY2tldEluZm8pIHtcbiAgICAgICAgc29ja2V0SW5mbyA9IF9zb2NrZXRJbmZvO1xuICAgICAgICBzb2NrZXQubGlzdGVuKHNvY2tldEluZm8uc29ja2V0SWQsIFwiMTI3LjAuMC4xXCIsIDMzMzMzLCA1MCwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTElTVEVOSU5HOlwiLCByZXN1bHQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBzdG9wU29ja2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldEluZm8uc29ja2V0SWQpO1xuICAgIH1cblxuXG4jIyNcblxuIyMjXG5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN0YXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKTtcbiAgdmFyIHN0b3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3BcIik7XG4gIHZhciBob3N0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaG9zdHNcIik7XG4gIHZhciBwb3J0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3J0XCIpO1xuICB2YXIgZGlyZWN0b3J5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaXJlY3RvcnlcIik7XG5cbiAgdmFyIHNvY2tldCA9IGNocm9tZS5zb2NrZXQ7XG4gIHZhciBzb2NrZXRJbmZvO1xuICB2YXIgZmlsZXNNYXAgPSB7fTtcblxuICB2YXIgcm9vdERpcjtcbiAgdmFyIHBvcnQsIGV4dFBvcnQ7XG4gIHZhciBkaXJlY3RvcmllcyA9IFtdO1xuXG4gIHZhciBzdHJpbmdUb1VpbnQ4QXJyYXkgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICB2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHN0cmluZy5sZW5ndGgpO1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiB2aWV3O1xuICB9O1xuXG4gIHZhciBhcnJheUJ1ZmZlclRvU3RyaW5nID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgdmFyIHN0ciA9ICcnO1xuICAgIHZhciB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGZvcih2YXIgcyA9IDA7IHMgPCB1QXJyYXlWYWwubGVuZ3RoOyBzKyspIHtcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVBcnJheVZhbFtzXSk7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG4gIH07XG5cbiAgdmFyIGxvZ1RvU2NyZWVuID0gZnVuY3Rpb24obG9nKSB7XG4gICAgbG9nZ2VyLnRleHRDb250ZW50ICs9IGxvZyArIFwiXFxuXCI7XG4gIH1cblxuICB2YXIgd3JpdGVFcnJvclJlc3BvbnNlID0gZnVuY3Rpb24oc29ja2V0SWQsIGVycm9yQ29kZSwga2VlcEFsaXZlKSB7XG4gICAgdmFyIGZpbGUgPSB7IHNpemU6IDAgfTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIik7XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogZmlsZSA9IFwiICsgZmlsZSk7XG4gICAgdmFyIGNvbnRlbnRUeXBlID0gXCJ0ZXh0L3BsYWluXCI7IC8vKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICB2YXIgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZTtcbiAgICB2YXIgaGVhZGVyID0gc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKCBrZWVwQWxpdmUgPyBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiA6IFwiXCIpICsgXCJcXG5cXG5cIik7XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiKTtcbiAgICB2YXIgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldChoZWFkZXIsIDApO1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyB2aWV3Li4uXCIpO1xuICAgIHNvY2tldC53cml0ZShzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCBmdW5jdGlvbih3cml0ZUluZm8pIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiV1JJVEVcIiwgd3JpdGVJbmZvKTtcbiAgICAgIGlmIChrZWVwQWxpdmUpIHtcbiAgICAgICAgcmVhZEZyb21Tb2NrZXQoc29ja2V0SWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SWQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OmZpbGVyZWFkZXI6OiBlbmQgb25sb2FkLi4uXCIpO1xuXG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogZW5kLi4uXCIpO1xuICB9O1xuXG4gIHZhciB3cml0ZTIwMFJlc3BvbnNlID0gZnVuY3Rpb24oc29ja2V0SWQsIGZpbGUsIGtlZXBBbGl2ZSkge1xuICAgIHZhciBjb250ZW50VHlwZSA9IChmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgdmFyIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemU7XG4gICAgdmFyIGhlYWRlciA9IHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIDIwMCBPS1xcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoIGtlZXBBbGl2ZSA/IFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIDogXCJcIikgKyBcIlxcblxcblwiKTtcbiAgICB2YXIgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldChoZWFkZXIsIDApO1xuXG4gICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoKTtcbiAgICAgICBzb2NrZXQud3JpdGUoc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgZnVuY3Rpb24od3JpdGVJbmZvKSB7XG4gICAgICAgICBjb25zb2xlLmxvZyhcIldSSVRFXCIsIHdyaXRlSW5mbyk7XG4gICAgICAgICBpZiAoa2VlcEFsaXZlKSB7XG4gICAgICAgICAgIHJlYWRGcm9tU29ja2V0KHNvY2tldElkKTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldElkKTtcbiAgICAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihmaWxlKTtcbiAgfTtcblxuICB2YXIgb25BY2NlcHQgPSBmdW5jdGlvbihhY2NlcHRJbmZvKSB7XG4gICAgY29uc29sZS5sb2coXCJBQ0NFUFRcIiwgYWNjZXB0SW5mbylcbiAgICByZWFkRnJvbVNvY2tldChhY2NlcHRJbmZvLnNvY2tldElkKTtcbiAgfTtcblxuICB2YXIgcmVhZEZyb21Tb2NrZXQgPSBmdW5jdGlvbihzb2NrZXRJZCkge1xuICAgIC8vICBSZWFkIGluIHRoZSBkYXRhXG4gICAgc29ja2V0LnJlYWQoc29ja2V0SWQsIGZ1bmN0aW9uKHJlYWRJbmZvKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlJFQURcIiwgcmVhZEluZm8pO1xuICAgICAgLy8gUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICB2YXIgZGF0YSA9IGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSk7XG4gICAgICBpZihkYXRhLmluZGV4T2YoXCJHRVQgXCIpID09IDApIHtcbiAgICAgICAgdmFyIGtlZXBBbGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoZGF0YS5pbmRleE9mKFwiQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiKSAhPSAtMSkge1xuICAgICAgICAgIGtlZXBBbGl2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBjYW4gb25seSBkZWFsIHdpdGggR0VUIHJlcXVlc3RzXG4gICAgICAgIHZhciB1cmlFbmQgPSAgZGF0YS5pbmRleE9mKFwiIFwiLCA0KTtcbiAgICAgICAgaWYodXJpRW5kIDwgMCkgeyAgIHJldHVybjsgfVxuICAgICAgICB2YXIgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKTtcbiAgICAgICAgLy8gc3RyaXAgcXllcnkgc3RyaW5nXG4gICAgICAgIHZhciBxID0gdXJpLmluZGV4T2YoXCI/XCIpO1xuICAgICAgICBpZiAocSAhPSAtMSkge1xuICAgICAgICAgIHVyaSA9IHVyaS5zdWJzdHJpbmcoMCwgcSk7XG4gICAgICAgIH1cblxuICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkoZGlyZWN0b3JpZXNbMF0pXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICAgKGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihkaXJlY3RvcnlFbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVyaSk7XG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeUVudHJ5LmdldEZpbGUoJ215TmV3QXBwREVWLnJlc291cmNlL2luZGV4LmpzJywge30pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd3JpdGUyMDBSZXNwb25zZShzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKTtcbiAgICAgICAgICAgICAgICAgICAgfSxmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfSkodXJpKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIHZhciBmaWxlID1cbiAgICAgICAgLy8gaWYoISFmaWxlID09IGZhbHNlKSB7XG4gICAgICAgIC8vICAgY29uc29sZS53YXJuKFwiRmlsZSBkb2VzIG5vdCBleGlzdC4uLlwiICsgdXJpKTtcbiAgICAgICAgLy8gICB3cml0ZUVycm9yUmVzcG9uc2Uoc29ja2V0SWQsIDQwNCwga2VlcEFsaXZlKTtcbiAgICAgICAgLy8gICByZXR1cm47XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gbG9nVG9TY3JlZW4oXCJHRVQgMjAwIFwiICsgdXJpKTtcbiAgICAgICAgLy8gd3JpdGUyMDBSZXNwb25zZShzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKTtcbiAgICAgIC8vIH1cbiAgICAgIC8vIGVsc2Uge1xuICAgICAgICAvLyBUaHJvdyBhbiBlcnJvclxuICAgICAgICAvLyBzb2NrZXQuZGVzdHJveShzb2NrZXRJZCk7XG4gICAgICAvLyB9XG5cbiAgfTtcbn0pO1xufVxuXG5cbiAgdmFyIGV4dE1zZ0lkID0gJ3BtZ25uYmRmbW1wZGtnYWFta2RpaXBmZ2picGdpb2ZjJztcblxuXG4gICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWwuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgaWYgKHNlbmRlci5pZCAhPSBleHRNc2dJZCkge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG4gICAgICAgICAgICByZXR1cm47ICAvLyBkb24ndCBhbGxvdyB0aGlzIGV4dGVuc2lvbiBhY2Nlc3NcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3BlbkRpcmVjdG9yeSkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BlbmluZyBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgYWRkRGlyZWN0b3J5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICAvLyBpZiAoc2VuZGVyLmlkICE9IGV4dE1zZ0lkKVxuICAgICAgICAgIC8vICAgcmV0dXJuIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcInNvcnJ5LCBjb3VsZCBub3QgcHJvY2VzcyB5b3VyIG1lc3NhZ2VcIn0pO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiR290IERpcmVjdG9yeVwifSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgZGlyZWN0b3JpZXMucHVzaChyZXF1ZXN0LmRpcmVjdG9yeUVudHJ5SWQpO1xuICAgICAgICAgICAgLy8gY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5KHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCwgZnVuY3Rpb24oZGlyZWN0b3J5RW50cnkpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhkaXJlY3RvcnlFbnRyeSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcHMsIEkgZG9uJ3QgdW5kZXJzdGFuZCB0aGlzIG1lc3NhZ2VcIn0pO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHNvY2tldC5jcmVhdGUoXCJ0Y3BcIiwge30sIGZ1bmN0aW9uKF9zb2NrZXRJbmZvKSB7XG4gICAgICAgIHNvY2tldEluZm8gPSBfc29ja2V0SW5mbztcbiAgICAgICAgc29ja2V0Lmxpc3Rlbihzb2NrZXRJbmZvLnNvY2tldElkLCBcIjEyNy4wLjAuMVwiLCAzMzMzMywgNTAsIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkxJU1RFTklORzpcIiwgcmVzdWx0KTtcbiAgICAgICAgc29ja2V0LmFjY2VwdChzb2NrZXRJbmZvLnNvY2tldElkLCBvbkFjY2VwdCk7XG4gICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgc3RvcFNvY2tldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzb2NrZXQuZGVzdHJveShzb2NrZXRJbmZvLnNvY2tldElkKTtcbiAgICB9XG5cbiAgdmFyIGFkZERpcmVjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsIHtcbiAgICAgICAgaWQ6IFwibWFpbndpblwiLFxuICAgICAgICBib3VuZHM6IHtcbiAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgaGVpZ2h0OiA1MFxuICAgICAgICB9LFxuICAgIH0sIGZ1bmN0aW9uKHdpbikge1xuICAgICAgICBtYWluV2luID0gd2luO1xuICAgIH0pO1xuICB9XG5cbn07XG4jIyNcblxuIiwiIyBnZXRHbG9iYWwgPSAtPlxuIyAgIF9nZXRHbG9iYWwgPSAtPlxuIyAgICAgdGhpc1xuXG4jICAgX2dldEdsb2JhbCgpXG5cbiMgcm9vdCA9IGdldEdsb2JhbCgpXG5cbiMgcm9vdC5hcHAgPSBhcHAgPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuIyBhcHAgPSBuZXcgbGliLkFwcGxpY2F0aW9uXG5BcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5cbmNsYXNzIEV4dEJhY2tncm91bmQgZXh0ZW5kcyBBcHBsaWNhdGlvblxuICAgIHVybHM6IHt9XG4gICAgdXJsQXJyOiBbXVxuICAgIG9yaWdpbnM6IHt9XG4gICAgaXNPbjoge31cbiAgICBmaWxlczoge31cbiAgICBleHRQb3J0OiB7fVxuXG4gICAgaW5pdDogKCkgLT5cbiAgICAgICAgY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyICh0YWJJZCkgPT5cbiAgICAgICAgICAgIEB1cGRhdGVJY29uKHRhYklkKSBpZiBAaXNPblt0YWJJZF0/XG5cbiAgICAgICAgQExJU1RFTi5Mb2NhbCAncmVzb3VyY2VzJywgKHJlc291cmNlcykgPT5cbiAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgQGxhdW5jaEFwcCgpXG4gICAgICAgICAgICBATVNHLkV4dCAncmVzb3VyY2VzJzpyZXNvdXJjZXNcblxuICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIgKHRhYikgPT5cbiAgICAgICAgICAgIGlmIEBpc09uW3RhYi5pZF1cbiAgICAgICAgICAgICAgICBAaXNPblt0YWIuaWRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlIHRhYi5pZCwgJ2dldFJlc291cmNlcyc6dHJ1ZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBpc09uW3RhYi5pZF0gPSBpZiBAaXNPblt0YWIuaWRdPyB0aGVuIHRydWUgZWxzZSAhQGlzT25bdGFiLmlkXVxuXG4gICAgICAgICAgICBAdXBkYXRlSWNvbiB0YWIuaWRcblxuICAgIHVwZGF0ZUljb246ICh0YWJJZCkgPT5cbiAgICAgICAgaWYgQGlzT25bdGFiSWRdXG4gICAgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRJY29uKFxuICAgICAgICAgICAgICAgIHBhdGg6XG4gICAgICAgICAgICAgICAgICAgICcxOSc6J2ltYWdlcy9yZWRpci1vbi0xOS5wbmcnXG4gICAgICAgICAgICAgICAgICAgICczOCc6J2ltYWdlcy9yZWRpci1vbi0zOC5wbmcnLFxuICAgICAgICAgICAgICAgIHRhYklkOnRhYklkXG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEljb24oXG4gICAgICAgICAgICAgICAgcGF0aDpcbiAgICAgICAgICAgICAgICAgICAgJzE5JzonaW1hZ2VzL3JlZGlyLW9mZi0xOS5wbmcnXG4gICAgICAgICAgICAgICAgICAgICczOCc6J2ltYWdlcy9yZWRpci1vZmYtMzgucG5nJyxcbiAgICAgICAgICAgICAgICB0YWJJZDp0YWJJZFxuICAgICAgICAgICAgKVxuXG5zZW5kUmVzb3VyY2VzID0gKHJlc291cmNlcykgLT5cbiAgICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKGFwcElkLHJlc291cmNlczpyZXNvdXJjZXMpXG5cbmFwcCA9IG5ldyBFeHRCYWNrZ3JvdW5kXG4gICAgIyBjaHJvbWUudGFicy5yZWxvYWQgdGFiLmlkXG5cblxuIyB2YXIgYWRkTGlzdGVuZXJzMiA9IGZ1bmN0aW9uKCkge1xuIyAgICAgdmFyIHJ1bGUxID0ge1xuIyAgICAgICAgIHByaW9yaXR5OiAxMDAsXG4jICAgICAgICAgY29uZGl0aW9uczogW1xuIyAgICAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuUmVxdWVzdE1hdGNoZXIoe1xuIyAgICAgICAgICAgICAgIHVybDogeyBwYXRoQ29udGFpbnM6ICdyZXNvdXJjZScgfSxcbiMgICAgICAgICAgICAgICAgIHN0YWdlczogW1wib25CZWZvcmVSZXF1ZXN0XCIsIFwib25CZWZvcmVTZW5kSGVhZGVyc1wiLCBcIm9uSGVhZGVyc1JlY2VpdmVkXCIsIFwib25BdXRoUmVxdWlyZWRcIl1cbiMgICAgICAgICAgICAgfSlcbiMgICAgICAgICBdLFxuIyAgICAgICAgIGFjdGlvbnM6IFtcbiMgICAgICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlZGlyZWN0UmVxdWVzdCh7XG4jICAgICAgICAgICAgIHJlZGlyZWN0VXJsOidjaHJvbWUtZXh0ZW5zaW9uOi8vcG1nbm5iZGZtbXBka2dhYW1rZGlpcGZnamJwZ2lvZmMvcmVkaXJlY3RvcidcbiMgICAgICAgICAgIH0pLFxuIyAgICAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuU2VuZE1lc3NhZ2VUb0V4dGVuc2lvbih7bWVzc2FnZTogXCJcIn0pXG4jICAgICAgICAgXVxuIyAgICAgICB9O1xuIyB2YXIgcnVsZTIgPSB7XG4jICAgICAgICAgcHJpb3JpdHk6IDEsXG4jICAgICAgICAgY29uZGl0aW9uczogW1xuIyAgICAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuUmVxdWVzdE1hdGNoZXIoe1xuIyAgICAgICAgICAgICAgIHVybDogeyBwYXRoQ29udGFpbnM6ICdyZWRpcmVjdG9yJyB9XG4jICAgICAgICAgICAgIH0pXG4jICAgICAgICAgXSxcbiMgICAgICAgICBhY3Rpb25zOiBbXG4jICAgICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZWRpcmVjdFJlcXVlc3Qoe1xuIyAgICAgICAgICAgICByZWRpcmVjdFVybDonZmlsZTovLy9Vc2Vycy9kYW5pZWwvRHJvcGJveC9kZXYvTWF2ZW5zTWF0ZS8zZGVtby9zcmMvcGFja2FnZS54bWwnXG4jICAgICAgICAgICB9KSxcbiMgICAgICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlNlbmRNZXNzYWdlVG9FeHRlbnNpb24oe21lc3NhZ2U6IFwiXCJ9KVxuIyAgICAgICAgIF1cbiMgICAgICAgfTtcbiMgICAgICAgLy8gdmFyIHJ1bGUyID0ge1xuIyAgICAgICAvLyAgIHByaW9yaXR5OiAxMDAwLFxuIyAgICAgICAvLyAgIGNvbmRpdGlvbnM6IFtcbiMgICAgICAgLy8gICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlcXVlc3RNYXRjaGVyKHtcbiMgICAgICAgLy8gICAgICAgdXJsOiB7IGhvc3RTdWZmaXg6ICcubXlzZXJ2ZXIuY29tJyB9IH0pXG4jICAgICAgIC8vICAgXSxcbiMgICAgICAgLy8gICBhY3Rpb25zOiBbXG4jICAgICAgIC8vICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5JZ25vcmVSdWxlcyh7XG4jICAgICAgIC8vICAgICAgIGxvd2VyUHJpb3JpdHlUaGFuOiAxMDAwIH0pXG4jICAgICAgIC8vICAgXVxuIyAgICAgICAvLyB9O1xuIyAgICAgICBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0Lm9uUmVxdWVzdC5hZGRSdWxlcyhbcnVsZTEsIHJ1bGUyXSk7XG5cbiMgfVxuXG4jIGNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbih0YWIpIHtcbiMgICAgIGlzT25bdGFiLmlkXSA9IGlzT25bdGFiLmlkXSA9PSB1bmRlZmluZWQgPyB0cnVlIDogIWlzT25bdGFiLmlkXTtcbiMgICAgIHVwZGF0ZUljb24odGFiLmlkKTtcbiMgICAgIGNocm9tZS50YWJzLnJlbG9hZCh0YWIuaWQpO1xuIyB9KTtcblxuIyB2YXIgdXBkYXRlSWNvbiA9IGZ1bmN0aW9uKHRhYklkKSB7XG4jICAgICBpZiAoaXNPblt0YWJJZF0gPT0gdHJ1ZSkge1xuIyAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEljb24oe3BhdGg6eycxOSc6J2ltYWdlcy9yZWRpci1vbi0xOS5wbmcnLCAnMzgnOidpbWFnZXMvcmVkaXItb24tMzgucG5nJ30sIHRhYklkOnRhYklkfSk7XG4jICAgICAgICAgLy8gY29udmVydEZpbGVSZXNvdXJjZXNUb0RhdGEoKTtcbiMgICAgICAgICAvLyBhZGRMaXN0ZW5lcnModGFiSWQpO1xuIyAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKGFwcElkLHtvcGVuRGlyZWN0b3J5OnRydWV9KTtcbiMgICAgIH1cbiMgICAgIGVsc2VcbiMgICAgIHtcbiMgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRJY29uKHtwYXRoOnsnMTknOidpbWFnZXMvcmVkaXItb2ZmLTE5LnBuZycsICczOCc6J2ltYWdlcy9yZWRpci1vZmYtMzgucG5nJ30sIHRhYklkOnRhYklkfSk7XG4jICAgICAgICAgcmVtb3ZlTGlzdGVuZXJzKHRhYklkKTtcbiMgICAgIH1cbiMgfVxuXG4jIGNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbih0YWJJZCkge1xuIyAgICAgaWYoaXNPblt0YWJJZF0gIT0gdW5kZWZpbmVkKSB7XG4jICAgICAgICAgdXBkYXRlSWNvbih0YWJJZCk7XG4jICAgICB9XG4jIH0pO1xuXG4jIGNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKGZ1bmN0aW9uIChkZXRhaWxzKSB7XG4jICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCggICAge1xuIyAgICAgICAgIHVybHM6IHtcbiMgICAgICAgICAgICAgICAgIFwiaHR0cHM6Ly8qLnNhbGVzZm9yY2UuY29tL3Jlc291cmNlLypcIjoge1xuIyAgICAgICAgICAgICAgICAgICAgIHJlZ2V4OiAnaHR0cHMuKlxcL3Jlc291cmNlKFxcL1swLTldKyk/XFwvKFtBLVphLXowLTlcXC0uX10rXFwvKT8nLFxuIyAgICAgICAgICAgICAgICAgICAgIHJlZ3JlcGxhY2U6ICdodHRwOi8vbG9jYWxob3N0OjkwMDAvJ1xuIyAgICAgICAgICAgICAgICAgfSxcbiMgICAgICAgICAgICAgICAgIFwiaHR0cHM6Ly8qLmZvcmNlLmNvbS9yZXNvdXJjZS8qXCI6IHtcbiMgICAgICAgICAgICAgICAgICAgICByZWdleDogJ2h0dHBzLipcXC9yZXNvdXJjZShcXC9bMC05XSspP1xcLyhbQS1aYS16MC05XFwtLl9dK1xcLyk/JyxcbiMgICAgICAgICAgICAgICAgICAgICByZWdyZXBsYWNlOiAnaHR0cDovL2xvY2FsaG9zdDo5MDAwLydcbiMgICAgICAgICAgICAgICAgIH1cblxuIyAgICAgICAgIH1cbiMgICAgIH0pO1xuIyB9KTtcblxuIyBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24oY2hhbmdlcywgbmFtZXNwYWNlKSB7XG5cbiMgICAgIGlmKG5hbWVzcGFjZSAhPSAnc3luYycpIHJldHVybjtcblxuIyAgICAgZm9yIChrZXkgaW4gY2hhbmdlcykge1xuIyAgICAgICAgICAgdmFyIHN0b3JhZ2VDaGFuZ2UgPSBjaGFuZ2VzW2tleV07XG4jICAgICAgICAgICBpZihrZXkgPT0gJ3VybHMnKSB7XG4jICAgICAgICAgICAgIHVybHMgPSBzdG9yYWdlQ2hhbmdlLm5ld1ZhbHVlO1xuIyAgICAgICAgICAgICB1cmxBcnIubGVuZ3RoID0gMDtcbiMgICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gdXJscykge1xuIyAgICAgICAgICAgICAgICAgdXJsQXJyLnB1c2goa2V5KTtcbiMgICAgICAgICAgICAgfVxuIyAgICAgICAgICAgfVxuIyAgICAgICAgIH1cbiMgfSk7XG5cbiMgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoZnVuY3Rpb24ob3B0KSB7XG4jICAgICB1cmxzID0gb3B0LnVybHM7XG4jICAgICB1cmxBcnIubGVuZ3RoID0gMDtcbiMgICAgIGZvcih2YXIga2V5IGluIHVybHMpIHtcbiMgICAgICAgICB1cmxBcnIucHVzaChrZXkpO1xuIyAgICAgfVxuIyB9KVxuXG4jIGNocm9tZS5ydW50aW1lLm9uQ29ubmVjdC5hZGRMaXN0ZW5lcihmdW5jdGlvbihwb3J0KSB7XG5cbiMgfSk7XG5cblxuXG5cblxuXG4jIHZhciBjb252ZXJ0RmlsZVJlc291cmNlc1RvRGF0YSA9IGZ1bmN0aW9uKCkge1xuIyAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2Uoe30sIGZ1bmN0aW9uKCkge1xuXG4jICAgICB9KTtcbiMgfVxuXG5cbiMgdmFyIGhlYWRlclJlcXVlc3RMaXN0ZW5lciA9IGZ1bmN0aW9uKGRldGFpbHMsIGtleSl7XG5cbiMgICAgIHZhciBmbGFnID0gZmFsc2UsXG4jICAgICAgICAgcnVsZSA9IHtcbiMgICAgICAgICAgICAgbmFtZTogXCJPcmlnaW5cIixcbiMgICAgICAgICAgICAgdmFsdWU6IFwiaHR0cDovL2V2aWwuY29tL1wiXG4jICAgICAgICAgfTtcblxuIyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZXRhaWxzLnJlcXVlc3RIZWFkZXJzLmxlbmd0aDsgKytpKSB7XG4jICAgICAgICAgaWYgKGRldGFpbHMucmVxdWVzdEhlYWRlcnNbaV0ubmFtZSA9PT0gcnVsZS5uYW1lKSB7XG4jICAgICAgICAgICAgIGZsYWcgPSB0cnVlO1xuIyAgICAgICAgICAgICBvcmlnaW5zW2RldGFpbHMucmVxdWVzdElkXSA9IGRldGFpbHMucmVxdWVzdEhlYWRlcnNbaV0udmFsdWU7XG4jICAgICAgICAgICAgIGRldGFpbHMucmVxdWVzdEhlYWRlcnNbaV0udmFsdWUgPSBydWxlLnZhbHVlO1xuIyAgICAgICAgICAgICBicmVhaztcbiMgICAgICAgICB9XG4jICAgICB9XG4jICAgICBpZighZmxhZykgZGV0YWlscy5yZXF1ZXN0SGVhZGVycy5wdXNoKHJ1bGUpO1xuIyAgICAgcmV0dXJuIHtyZXF1ZXN0SGVhZGVyczogZGV0YWlscy5yZXF1ZXN0SGVhZGVyc307XG4jIH07XG4jIHZhciBoZWFkZXJSZXNwb25zZUxpc3RlbmVyID0gZnVuY3Rpb24oZGV0YWlscywga2V5KXtcblxuIyAgICAgaWYob3JpZ2luc1tkZXRhaWxzLnJlcXVlc3RJZF0gIT0gdW5kZWZpbmVkKSB7XG4jICAgICAgICAgdmFyIHJ1bGUgPSB7XG4jICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIixcbiMgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogb3JpZ2luc1tkZXRhaWxzLnJlcXVlc3RJZF1cbiMgICAgICAgICAgICAgfTtcblxuIyAgICAgICAgIGRldGFpbHMucmVzcG9uc2VIZWFkZXJzLnB1c2gocnVsZSk7XG4jICAgICAgICAgZGV0YWlscy5yZXNwb25zZUhlYWRlcnMucHVzaCh7XG4jICAgICAgICAgICAgIFwibmFtZVwiOlwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIixcbiMgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwidHJ1ZVwiXG4jICAgICAgICAgfSk7XG4jICAgICAgICAgZGVsZXRlIG9yaWdpbnNbZGV0YWlscy5yZXF1ZXN0SWRdO1xuIyAgICAgfVxuXG4jICAgICByZXR1cm4ge3Jlc3BvbnNlSGVhZGVyczogZGV0YWlscy5yZXNwb25zZUhlYWRlcnN9O1xuIyB9O1xuXG4jIHZhciBiZWZvcmVSZXF1ZXN0TGlzdGVuZXIgPSBmdW5jdGlvbihkZXRhaWxzLCBrZXkpIHtcblxuIyAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cCh1cmxzW2tleV0ucmVnZXgpO1xuIyAgICAgdmFyIHJlcGwgPSB1cmxzW2tleV0ucmVncmVwbGFjZTtcblxuIyAgICAgaWYoZGV0YWlscy51cmwubWF0Y2gocmUpID09IG51bGwpIHJldHVybiB7fTtcblxuIyAgICAgcmV0dXJuIHtcbiMgICAgICAgICByZWRpcmVjdFVybDogZGV0YWlscy51cmwucmVwbGFjZShyZSwgcmVwbClcbiMgICAgIH07XG4jIH1cblxuIyBmdW5jdGlvbiBjcmVhdGVMaXN0ZW5lcihrZXksIGxpc3RlbmVyRnVuY3Rpb24sIGxpc3RlbmVyS2V5KSB7XG4jICAgICB1cmxzW2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zW2xpc3RlbmVyS2V5XSA9IGZ1bmN0aW9uKGRldGFpbHMpIHsgcmV0dXJuIGxpc3RlbmVyRnVuY3Rpb24oKSB9O1xuIyAgICAgcmV0dXJuIHVybHNba2V5XS5fbGlzdGVuZXJGdW5jdGlvbltsaXN0ZW5lcktleV07XG4jIH1cblxuIyB2YXIgYWRkTGlzdGVuZXJzMSA9IGZ1bmN0aW9uKHRhYklkKSB7XG4jICAgICByZW1vdmVMaXN0ZW5lcnMoKTtcbiMgICAgIGZvcih2YXIga2V5IGluIHVybHMpIHtcblxuIyAgICAgICAgIGlmKHVybHNba2V5XS5jb3JzICE9IHVuZGVmaW5lZCAmJiB1cmxzW2tleV0uY29ycyA9PSB0cnVlKSB7XG4jICAgICAgICAgICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlU2VuZEhlYWRlcnMuYWRkTGlzdGVuZXIoXG4jICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX2tleSwgX3R5cGUpIHtcbiMgICAgICAgICAgICAgICAgICAgICBpZih1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9ucyA9PSB1bmRlZmluZWQpIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zID0ge307XG4jICAgICAgICAgICAgICAgICAgICAgdXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbX3R5cGVdID0gKGZ1bmN0aW9uKGtleSkge1xuIyAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGV0YWlscykge1xuIyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhlYWRlclJlcXVlc3RMaXN0ZW5lcihkZXRhaWxzLCBrZXkpO1xuIyAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuIyAgICAgICAgICAgICAgICAgICAgIH0oa2V5KSk7XG4jICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zW190eXBlXTtcbiMgICAgICAgICAgICAgICAgIH0oa2V5LCAnb25CZWZvcmVTZW5kSGVhZGVycycpKSxcbiMgICAgICAgICAgICAgICAgIHtcbiMgICAgICAgICAgICAgICAgICAgICB1cmxzOiBbXCI8YWxsX3VybHM+XCJdLFxuIyAgICAgICAgICAgICAgICAgICAgIHRhYklkOiB0YWJJZFxuIyAgICAgICAgICAgICAgICAgfSxcbiMgICAgICAgICAgICAgICAgIFtcInJlcXVlc3RIZWFkZXJzXCJdXG4jICAgICAgICAgICAgICk7XG5cbiMgICAgICAgICAgICAgY2hyb21lLndlYlJlcXVlc3Qub25IZWFkZXJzUmVjZWl2ZWQuYWRkTGlzdGVuZXIoXG4jICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX2tleSwgX3R5cGUpIHtcbiMgICAgICAgICAgICAgICAgICAgICBpZih1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9ucyA9PSB1bmRlZmluZWQpIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zID0ge307XG4jICAgICAgICAgICAgICAgICAgICAgdXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbX3R5cGVdID0gKGZ1bmN0aW9uKGtleSkge1xuIyAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGV0YWlscykge1xuIyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhlYWRlclJlc3BvbnNlTGlzdGVuZXIoZGV0YWlscywga2V5KTtcbiMgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiMgICAgICAgICAgICAgICAgICAgICB9KGtleSkpO1xuIyAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tfdHlwZV07XG4jICAgICAgICAgICAgICAgICB9KGtleSwgJ29uSGVhZGVyc1JlY2VpdmVkJykpLFxuIyAgICAgICAgICAgICAgICAge1xuIyAgICAgICAgICAgICAgICAgICAgIHVybHM6IFtcIjxhbGxfdXJscz5cIl0sXG4jICAgICAgICAgICAgICAgICAgICAgdGFiSWQ6IHRhYklkXG4jICAgICAgICAgICAgICAgICB9LFxuIyAgICAgICAgICAgICAgICAgW1wiYmxvY2tpbmdcIiwgXCJyZXNwb25zZUhlYWRlcnNcIl1cbiMgICAgICAgICAgICAgKTtcbiMgICAgICAgICB9XG5cbiMgICAgICAgICBpZih1cmxzW2tleV0ucmVnZXggIT0gdW5kZWZpbmVkICYmIHVybHNba2V5XS5yZWdleC5sZW5ndGggPiAwKSB7XG4jICAgICAgICAgICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5hZGRMaXN0ZW5lcihcbiMgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfa2V5LCBfdHlwZSkge1xuIyAgICAgICAgICAgICAgICAgICAgIGlmKHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zID09IHVuZGVmaW5lZCkgdXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnMgPSB7fTtcbiMgICAgICAgICAgICAgICAgICAgICB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tfdHlwZV0gPSAoZnVuY3Rpb24oa2V5KSB7XG4jICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihkZXRhaWxzKSB7XG4jICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmVmb3JlUmVxdWVzdExpc3RlbmVyKGRldGFpbHMsIGtleSk7XG4jICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4jICAgICAgICAgICAgICAgICAgICAgfShrZXkpKTtcbiMgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbX3R5cGVdO1xuIyAgICAgICAgICAgICAgICAgfShrZXksICdvbkJlZm9yZVJlcXVlc3QnKSksXG4jICAgICAgICAgICAgICAgICB7XG4jICAgICAgICAgICAgICAgICAgICAgdXJsczogW2tleV0sXG4jICAgICAgICAgICAgICAgICAgICAgdGFiSWQ6IHRhYklkXG4jICAgICAgICAgICAgICAgICB9LFxuIyAgICAgICAgICAgICAgICAgW1wiYmxvY2tpbmdcIl1cbiMgICAgICAgICAgICAgKTtcbiMgICAgICAgICB9XG5cbiMgICAgIH1cbiMgfVxuXG4jIHZhciByZW1vdmVMaXN0ZW5lcnMgPSBmdW5jdGlvbih0YWJJZCkge1xuIyAgICAgZm9yKHZhciBrZXkgaW4gdXJscykge1xuIyAgICAgICAgIGZvcih2YXIgbGtleSBpbiB1cmxzW2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zKSB7XG4jICAgICAgICAgICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5yZW1vdmVMaXN0ZW5lcih1cmxzW2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zW2xrZXldKTtcbiMgICAgICAgICAgICAgY2hyb21lLndlYlJlcXVlc3Qub25IZWFkZXJzUmVjZWl2ZWQucmVtb3ZlTGlzdGVuZXIodXJsc1trZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tsa2V5XSk7XG4jICAgICAgICAgICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlU2VuZEhlYWRlcnMucmVtb3ZlTGlzdGVuZXIodXJsc1trZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tsa2V5XSk7XG4jICAgICAgICAgfVxuIyAgICAgfVxuIyB9XG5cblxuIyAvLyB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4jIC8vIHhoci5vcGVuKCdHRVQnLCAnZmlsZTovLy9Vc2Vycy9kYW5pZWwvRHJvcGJveC9kZXYvTWF2ZW5zTWF0ZS8zZGVtby9zcmMvcGFja2FnZS54bWwnLCB0cnVlKTtcbiMgLy8geGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cbiMgLy8geGhyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcbiMgLy8gICBidG9hKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQ4QXJyYXkodGhpcy5yZXNwb25zZSkpO1xuIyAvLyB9O1xuXG4jIC8vIHhoci5zZW5kKCk7XG5cblxuXG4iXX0=
