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
var Application, ExtContent, app,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Application = require('../../common.coffee');

ExtContent = (function(_super) {
  __extends(ExtContent, _super);

  function ExtContent() {
    return ExtContent.__super__.constructor.apply(this, arguments);
  }

  ExtContent.prototype.init = function() {
    return this.LISTEN.Local('getResources', (function(_this) {
      return function(res) {
        return _this.MSG.Local({
          'resources': _this.getResources('script[src],link[href]')
        });
      };
    })(this));
  };

  return ExtContent;

})(Application);

app = new ExtContent;


},{"../../common.coffee":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0Ryb3Bib3ggKFNpbHZlcmxpbmUpL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL0Ryb3Bib3ggKFNpbHZlcmxpbmUpL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL2NvbW1vbi5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0Ryb3Bib3ggKFNpbHZlcmxpbmUpL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL2V4dGVuc2lvbi9zcmMvY29udGVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNJQSxJQUFBLGtFQUFBO0VBQUEsa0ZBQUE7O0FBQUEsS0FBSyxDQUFBLFNBQUUsQ0FBQSxLQUFQLEdBQWUsU0FBQyxLQUFELEdBQUE7QUFDWCxNQUFBLEdBQUE7QUFBQSxFQUFBLElBQWEsTUFBQSxDQUFBLEtBQUEsS0FBa0IsUUFBL0I7QUFBQSxXQUFPLEVBQVAsQ0FBQTtHQUFBO0FBQUEsRUFDQSxHQUFBLEdBQU0sTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaLENBQWtCLENBQUMsTUFEekIsQ0FBQTtTQUVBLElBQUMsQ0FBQSxNQUFELENBQVEsU0FBQyxJQUFELEdBQUE7QUFDSixRQUFBLGVBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxDQUFSLENBQUE7QUFDQSxTQUFBLFlBQUE7dUJBQUE7QUFDSSxNQUFBLElBQWMsSUFBSyxDQUFBLEdBQUEsQ0FBTCxLQUFhLEdBQTNCO0FBQUEsUUFBQSxLQUFBLElBQVMsQ0FBVCxDQUFBO09BREo7QUFBQSxLQURBO0FBR0EsSUFBQSxJQUFHLEtBQUEsS0FBUyxHQUFaO2FBQXFCLEtBQXJCO0tBQUEsTUFBQTthQUErQixNQUEvQjtLQUpJO0VBQUEsQ0FBUixFQUhXO0FBQUEsQ0FBZixDQUFBOztBQUFBLEtBU0ssQ0FB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OztBQUFBLHVCQUFBLElBQUEsR0FBSyxTQUFBLEdBQUE7V0FDRCxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxjQUFkLEVBQThCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLEdBQUQsR0FBQTtlQUMxQixLQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBVztBQUFBLFVBQUEsV0FBQSxFQUFZLEtBQUMsQ0FBQSxZQUFELENBQWMsd0JBQWQsQ0FBWjtTQUFYLEVBRDBCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUIsRUFEQztFQUFBLENBQUwsQ0FBQTs7b0JBQUE7O0dBRHFCLFlBRnpCLENBQUE7O0FBQUEsR0FPQSxHQUFNLEdBQUEsQ0FBQSxVQVBOLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMgc2VydmVyID0gcmVxdWlyZSAnLi90Y3Atc2VydmVyLmpzJ1xuIyByZXF1aXJlICcuL2Nocm9tZS1tb2NrJ1xuIyByb290LnEgPSByZXF1aXJlICdxJ1xuXG5BcnJheTo6d2hlcmUgPSAocXVlcnkpIC0+XG4gICAgcmV0dXJuIFtdIGlmIHR5cGVvZiBxdWVyeSBpc250IFwib2JqZWN0XCJcbiAgICBoaXQgPSBPYmplY3Qua2V5cyhxdWVyeSkubGVuZ3RoXG4gICAgQGZpbHRlciAoaXRlbSkgLT5cbiAgICAgICAgbWF0Y2ggPSAwXG4gICAgICAgIGZvciBrZXksIHZhbCBvZiBxdWVyeVxuICAgICAgICAgICAgbWF0Y2ggKz0gMSBpZiBpdGVtW2tleV0gaXMgdmFsXG4gICAgICAgIGlmIG1hdGNoIGlzIGhpdCB0aGVuIHRydWUgZWxzZSBmYWxzZVxuXG5BcnJheTo6dG9EaWN0ID0gKGtleSkgLT5cbiAgQHJlZHVjZSAoKGRpY3QsIG9iaikgLT4gZGljdFsgb2JqW2tleV0gXSA9IG9iaiBpZiBvYmpba2V3eV0/OyByZXR1cm4gZGljdCksIHt9XG5cblxuY2xhc3MgTVNHXG4gICAgY29uc3RydWN0b3I6IChjb25maWcpIC0+XG4gICAgICAgIEBjb25maWcgPSBjb25maWdcbiAgICBMb2NhbDogKG1lc3NhZ2UpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nIFwiPT0gTUVTU0FHRSA9PT4gI3sgbWVzc2FnZSB9XCJcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgbWVzc2FnZVxuICAgIEV4dDogKG1lc3NhZ2UpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nIFwiPT0gTUVTU0FHRSAjeyBAY29uZmlnLkVYVF9UWVBFIH0gPT0+ICN7IG1lc3NhZ2UgfVwiXG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIEBjb25maWcuRVhUX0lELCBtZXNzYWdlXG5cbmNsYXNzIExJU1RFTlxuICAgIGxvY2FsOlxuICAgICAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZVxuICAgICAgICBsaXN0ZW5lcnM6e31cbiAgICBleHRlcm5hbDpcbiAgICAgICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbFxuICAgICAgICBsaXN0ZW5lcnM6e31cbiAgICBjb25zdHJ1Y3RvcjogKGNvbmZpZykgLT5cbiAgICAgICAgQGNvbmZpZyA9IGNvbmZpZ1xuICAgICAgICBAbG9jYWwuYXBpLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlXG4gICAgICAgIEBleHRlcm5hbC5hcGk/LmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICAgIExvY2FsOiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgICBAbG9jYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICAgIEV4dDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgICAgQGV4dGVybmFsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgICBfb25NZXNzYWdlRXh0ZXJuYWw6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICAgICAgY29uc29sZS5sb2cgXCI8PT0gRVhURVJOQUwgTUVTU0FHRSA9PSAjeyBAY29uZmlnLkVYVF9UWVBFIH0gPT1cIiArIHJlcXVlc3RcbiAgICAgICAgaWYgc2VuZGVyLmlkIGlzbnQgQGNvbmZpZy5FWFRfSUQgdGhlbiByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgIEBleHRlcm5hbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldIGZvciBrZXkgb2YgcmVxdWVzdFxuXG4gICAgX29uTWVzc2FnZTogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgICAgICBjb25zb2xlLmxvZyBcIjw9PSBNRVNTQUdFID09ICN7IEBjb25maWcuRVhUX1RZUEUgfSA9PVwiICsgcmVxdWVzdFxuICAgICAgICBAbG9jYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSBmb3Iga2V5IG9mIHJlcXVlc3RcblxuICAgICMgY2xhc3MgTGlzdGVuZXJcbiAgICAjICAgbGlzdGVuZXJzOiB7fVxuICAgICMgICBleHRlcm5hbDpmYWxzZVxuICAgICMgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZVxuICAgICMgICBjb25zdHJ1Y3RvcjogKGV4dGVybmFsKSAtPlxuICAgICMgICAgIEBleHRlcm5hbCA9IGV4dGVybmFsXG4gICAgIyAgICAgQGFwaSA9IGlmIEBleHRlcm5hbCB0aGVuIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsIGVsc2UgQGFwaVxuICAgICMgICAgIEBhcGkuYWRkTGlzdGVuZXIgQG9uTWVzc2FnZVxuICAgICMgICBhZGRMaXN0ZW5lcjogKG1lc3NhZ2UsIGNhbGxiYWNrKSAtPlxuICAgICMgICAgIEBsaXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuICAgICMgICBvbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICAjICAgICBjb25zb2xlLmxvZyBcIjw9PSBNRVNTQUdFID09ICN7IEBjb25maWcuRVhUX1RZUEUgfSA9PVwiICsgcmVxdWVzdFxuICAgICMgICAgIGlmIEBleHRlcm5hbCBhbmQgc2VuZGVyLmlkIGlzbnQgQGNvbmZpZy5FWFRfSUQgdGhlbiByZXR1cm4gdW5kZWZpbmVkXG4gICAgIyAgICAgZWxzZVxuICAgICMgICAgICAgZm9yIGtleSBvZiByZXF1ZXN0XG4gICAgIyAgICAgICAgIGRvIChrZXkpID0+IGlmIEBsaXN0ZW5lcnNba2V5XT8gdGhlbiBAbGlzdGVuZXJzW2tleV0gcmVxdWVzdC5rZXlcblxuY2xhc3MgRGF0YVxuICAgIG1hcHBpbmc6W1xuICAgICAgICBkaXJlY3Rvcnk6bnVsbFxuICAgICAgICB1cmxQYXR0ZXJuOm51bGxcbiAgICBdXG4gICAgcmVzb3VyY2VzOltcbiAgICAgICAgcmVzb3VyY2U6bnVsbFxuICAgICAgICBmaWxlOm51bGxcbiAgICBdXG5cblxuXG5jbGFzcyBTdG9yYWdlXG4gICAgYXBpOiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICAgIGRhdGE6IHt9XG4gICAgY2FsbGJhY2s6ICgpIC0+XG4gICAgY29uc3RydWN0b3I6IChjYWxsYmFjaykgLT5cbiAgICAgICAgQGNhbGxiYWNrID0gY2FsbGJhY2tcbiAgICAgICAgQHJldHJpZXZlQWxsKClcbiAgICAgICAgQG9uQ2hhbmdlZEFsbCgpXG5cbiAgICBzYXZlOiAoa2V5LCBpdGVtKSAtPlxuICAgICAgb2JqID0ge31cbiAgICAgIG9ialtrZXldID0gaXRlbVxuICAgICAgQGFwaS5zZXQgb2JqXG5cbiAgICBzYXZlQWxsOiAoKSAtPlxuICAgICAgICBAYXBpLnNldCBAZGF0YVxuXG4gICAgcmV0cmlldmU6IChrZXksIGNiKSAtPlxuICAgICAgICBAYXBpLmdldCBrZXksIChyZXN1bHRzKSAtPlxuICAgICAgICAgICAgQGRhdGFbcl0gPSByZXN1bHRzW3JdIGZvciByIG9mIHJlc3VsdHNcbiAgICAgICAgICAgIGlmIGNiPyB0aGVuIGNiIHJlc3VsdHNba2V5XVxuXG5cbiAgICByZXRyaWV2ZUFsbDogKGNiKSAtPlxuICAgICAgICBAYXBpLmdldCAocmVzdWx0KSA9PlxuICAgICAgICAgICAgQGRhdGEgPSByZXN1bHRcbiAgICAgICAgICAgIEBjYWxsYmFjaz8gcmVzdWx0XG4gICAgICAgICAgICBjYj8gcmVzdWx0XG4gICAgICAgICAgICBjb25zb2xlLmxvZyByZXN1bHRcblxuICAgIG9uQ2hhbmdlZDogKGtleSwgY2IpIC0+XG4gICAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsIG5hbWVzcGFjZSkgLT5cbiAgICAgICAgaWYgY2hhbmdlc1trZXldPyBhbmQgY2I/IHRoZW4gY2IgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG4gICAgICAgIEBjYWxsYmFjaz8gY2hhbmdlc1xuXG4gICAgb25DaGFuZ2VkQWxsOiAoKSAtPlxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsbmFtZXNwYWNlKSA9PlxuICAgICAgICAgICAgQGRhdGFbY10gPSBjaGFuZ2VzW2NdLm5ld1ZhbHVlIGZvciBjIG9mIGNoYW5nZXNcbiAgICAgICAgICAgIEBjYWxsYmFjaz8gY2hhbmdlc1xuXG5cbiMgY2xhc3MgRGlyZWN0b3J5U3RvcmVcbiMgICBkaXJlY3RvcmllcyA9XG4jICAgY29uc3RydWN0b3IgKCkgLT5cblxuIyBjbGFzcyBEaXJlY3RvcnlcblxuXG5jbGFzcyBGaWxlU3lzdGVtXG4gICAgYXBpOiBjaHJvbWUuZmlsZVN5c3RlbVxuXG4gICAgY29uc3RydWN0b3I6ICgpIC0+XG5cbiAgICAjIEBkaXJzOiBuZXcgRGlyZWN0b3J5U3RvcmVcbiAgICBmaWxlVG9BcnJheUJ1ZmZlcjogKGJsb2IsIGNhbGxiYWNrLCBvcHRfZXJyb3JDYWxsYmFjaykgLT5cbiAgICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAgIHJlYWRlci5vbmxvYWQgPSAoZSkgLT5cbiAgICAgICAgY2FsbGJhY2sgZS50YXJnZXQucmVzdWx0XG4gICAgICAgIHJldHVyblxuXG4gICAgICByZWFkZXIub25lcnJvciA9IChlKSAtPlxuICAgICAgICBvcHRfZXJyb3JDYWxsYmFjayBlICBpZiBvcHRfZXJyb3JDYWxsYmFja1xuICAgICAgICByZXR1cm5cblxuICAgICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGJsb2JcbiAgICAgIHJldHVyblxuXG4gICAgcmVhZEZpbGU6IChkaXJFbnRyeSwgcGF0aCwgc3VjY2VzcywgZXJyb3IpIC0+XG4gICAgICAgIGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgcGF0aCwgKGZpbGVFbnRyeSkgLT5cbiAgICAgICAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSAtPlxuICAgICAgICAgICAgICAgIGZpbGVUb0FycmF5QnVmZmVyIGZpbGUsIChhcnJheUJ1ZmZlcikgLT5cbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyBhcnJheUJ1ZmZlclxuICAgICAgICAgICAgICAgICAgICAsZXJyb3JcbiAgICAgICAgICAgICAgICAsZXJyb3JcbiAgICAgICAgICAgICxlcnJvclxuXG4gICAgZ2V0RmlsZUVudHJ5OiAoZGlyRW50cnksIHBhdGgsIHN1Y2Nlc3MsIGVycm9yKSAtPlxuICAgICAgICBkaXJFbnRyeS5nZXRGaWxlIHBhdGgsIHt9LCAoZmlsZUVudHJ5KSAtPlxuICAgICAgICAgICAgc3VjY2VzcyBmaWxlRW50cnlcblxuICAgIG9wZW5EaXJlY3Rvcnk6IChjYWxsYmFjaykgPT5cbiAgICAgICAgQGFwaS5jaG9vc2VFbnRyeSB0eXBlOidvcGVuRGlyZWN0b3J5JywgKGRpcmVjdG9yeUVudHJ5LCBmaWxlcykgPT5cbiAgICAgICAgICAgIEBhcGkuZ2V0RGlzcGxheVBhdGggZGlyZWN0b3J5RW50cnksIChwYXRoTmFtZSkgPT5cbiAgICAgICAgICAgICAgICBkaXIgPVxuICAgICAgICAgICAgICAgICAgcmVsUGF0aDogZGlyZWN0b3J5RW50cnkuZnVsbFBhdGgucmVwbGFjZSAnLycgKyBkaXJlY3RvcnlFbnRyeS5uYW1lLCAnJ1xuICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5RW50cnlJZDogQGFwaS5yZXRhaW5FbnRyeSBkaXJlY3RvcnlFbnRyeVxuICAgICAgICAgICAgICAgICAgZW50cnk6IGRpcmVjdG9yeUVudHJ5XG5cbiAgICAgICAgICAgICAgICBjYWxsYmFjayBwYXRoTmFtZSwgZGlyXG4gICAgICAgICAgICAgICAgIyBAZ2V0T25lRGlyTGlzdCBkaXJcbiAgICAgICAgICAgICAgICAjIFN0b3JhZ2Uuc2F2ZSAnZGlyZWN0b3JpZXMnLCBAc2NvcGUuZGlyZWN0b3JpZXMgKHJlc3VsdCkgLT5cblxuXG5cbmNsYXNzIE1hcHBpbmdcbiAgICByZXNvdXJjZTogbnVsbCAjaHR0cDovL2JsYWxhLmNvbS93aGF0L2V2ZXIvaW5kZXguanNcbiAgICBsb2NhbDogbnVsbCAjL3NvbWVzaGl0dHlEaXIvb3RoZXJTaGl0dHlEaXIvXG4gICAgcmVnZXg6IG51bGxcbiAgICBjb25zdHJ1Y3RvcjogKHJlc291cmNlLCBsb2NhbCwgcmVnZXgpIC0+XG4gICAgICBbQGxvY2FsLCBAcmVzb3VyY2UsIEByZWdleF0gPSBbbG9jYWwsIHJlc291cmNlLCByZWdleF1cblxuICAgIGdldExvY2FsUmVzb3VyY2U6ICgpIC0+XG4gICAgICBAcmVzb3VyY2UucmVwbGFjZShAcmVnZXgsIEBsb2NhbClcblxuICAgIHNldFJlZGlyZWN0RGVjbGFyYXRpdmU6ICh0YWJJZCkgLT5cbiAgICAgIHJ1bGVzID0gW10ucHVzaFxuICAgICAgICBwcmlvcml0eToxMDBcbiAgICAgICAgY29uZGl0aW9uczogW1xuICAgICAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuUmVxdWVzdE1hdGNoZXJcbiAgICAgICAgICAgICAgICB1cmw6XG4gICAgICAgICAgICAgICAgICAgIHVybE1hdGNoZXM6QHJlZ2V4XG4gICAgICAgICAgICBdXG4gICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlZGlyZWN0UmVxdWVzdFxuICAgICAgICAgICAgICAgIHJlZGlyZWN0VXJsOkBnZXRMb2NhbFJlc291cmNlKClcbiAgICAgICAgXVxuICAgICAgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5vblJlcXVlc3QuYWRkUnVsZXMgcnVsZXNcblxuIyBjbGFzcyBTdG9yYWdlRmFjdG9yeVxuIyAgIG1ha2VPYmplY3Q6ICh0eXBlKSAtPlxuIyAgICAgc3dpdGNoIHR5cGVcbiMgICAgICAgd2hlbiAnUmVzb3VyY2VMaXN0J1xuIyAgIF9jcmVhdGU6ICh0eXBlKSAtPlxuIyAgICAgQGdldEZyb21TdG9yYWdlLnRoZW4gKG9iaikgLT5cbiMgICAgICAgcmV0dXJuIG9ialxuXG4jICAgZ2V0RnJvbVN0b3JhZ2U6ICgpIC0+XG4jICAgICBwcm9taXNlID0gbmV3IFByb21pc2UgKHN1Y2Nlc3MsIGZhaWwpIC0+XG4jICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCAoYSkgLT5cbiMgICAgICAgICBiID0gbmV3IFJlc291cmNlTGlzdFxuIyAgICAgICAgIGZvciBrZXkgb2YgYVxuIyAgICAgICAgICAgZG8gKGEpIC0+XG4jICAgICAgICAgICAgIGJba2V5XSA9IGFba2V5XVxuIyAgICAgICAgIHN1Y2Nlc3MgYlxuIyMjXG5jbGFzcyBGaWxlXG4gICAgY29uc3RydWN0b3I6IChkaXJlY3RvcnlFbnRyeSwgcGF0aCkgLT5cbiAgICAgICAgQGRpckVudHJ5ID0gZGlyZWN0b3J5RW50cnlcbiAgICAgICAgQHBhdGggPSBwYXRoXG5cbmNsYXNzIFNlcnZlclxuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuXG4gICAgc3RhcnQ6ICgpIC0+XG4gICAgICAgIHNvY2tldC5jcmVhdGUgXCJ0Y3BcIiwge30sIChfc29ja2V0SW5mbykgLT5cbiAgICAgICAgICAgIEBzb2NrZXRJbmZvID0gX3NvY2tldEluZm87XG4gICAgICAgICAgICBzb2NrZXQubGlzdGVuIHNvY2tldEluZm8uc29ja2V0SWQsIFwiMTI3LjAuMC4xXCIsIDMxMzM3LCA1MCwgKHJlc3VsdCkgLT5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBcIkxJU1RFTklORzpcIiwgcmVzdWx0XG4gICAgICAgICAgICAgICAgc29ja2V0LmFjY2VwdCBAc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG4gICAgc3RvcDogKCkgLT5cbiAgICAgICAgc29ja2V0LmRlc3Ryb3kgQHNvY2tldEluZm8uc29ja2V0SWRcblxuICAgIF9vbkFjY2VwdDogKGFjY2VwdEluZm8pIC0+XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQUNDRVBUXCIsIGFjY2VwdEluZm8pXG4gICAgICAgIGluZm8gPSBAX3JlYWRGcm9tU29ja2V0IGFjY2VwdEluZm8uc29ja2V0SWRcbiAgICAgICAgQGdldEZpbGUgdXJpLCAoZmlsZSkgLT5cblxuICAgIGdldEZpbGU6ICh1cmkpIC0+XG5cbiAgICBfd3JpdGUyMDBSZXNwb25zZTogKHNvY2tldElkLCBmaWxlLCBrZWVwQWxpdmUpIC0+XG4gICAgICBjb250ZW50VHlwZSA9IChpZiAoZmlsZS50eXBlIGlzIFwiXCIpIHRoZW4gXCJ0ZXh0L3BsYWluXCIgZWxzZSBmaWxlLnR5cGUpXG4gICAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgICBoZWFkZXIgPSBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgICBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpXG4gICAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgICAgdmlldy5zZXQgaGVhZGVyLCAwXG4gICAgICBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgLT5cbiAgICAgICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAgICAgc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pIC0+XG4gICAgICAgICAgY29uc29sZS5sb2cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAgICAgICBpZiBrZWVwQWxpdmVcbiAgICAgICAgICAgIHJlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgc29ja2V0LmRlc3Ryb3kgc29ja2V0SWRcbiAgICAgICAgICAgIHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgb25BY2NlcHRcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICByZXR1cm5cblxuICAgICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBmaWxlXG4gICAgICByZXR1cm5cblxuICAgIF9yZWFkRnJvbVNvY2tldDogKHNvY2tldElkKSAtPlxuICAgICAgICBzb2NrZXQucmVhZCBzb2NrZXRJZCwgKHJlYWRJbmZvKSAtPlxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiUkVBRFwiLCByZWFkSW5mb1xuXG4gICAgICAgICAgIyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgICAgICBkYXRhID0gYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKVxuICAgICAgICAgIGlmIGRhdGEuaW5kZXhPZihcIkdFVCBcIikgaXMgMFxuICAgICAgICAgICAga2VlcEFsaXZlID0gZmFsc2VcbiAgICAgICAgICAgIGtlZXBBbGl2ZSA9IHRydWUgIHVubGVzcyBkYXRhLmluZGV4T2YoXCJDb25uZWN0aW9uOiBrZWVwLWFsaXZlXCIpIGlzIC0xXG5cbiAgICAgICAgICAgICMgd2UgY2FuIG9ubHkgZGVhbCB3aXRoIEdFVCByZXF1ZXN0c1xuICAgICAgICAgICAgdXJpRW5kID0gZGF0YS5pbmRleE9mKFwiIFwiLCA0KVxuICAgICAgICAgICAgcmV0dXJuICBpZiB1cmlFbmQgPCAwXG4gICAgICAgICAgICB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpXG5cbiAgICAgICAgICAgICMgc3RyaXAgcXllcnkgc3RyaW5nXG4gICAgICAgICAgICBxID0gdXJpLmluZGV4T2YoXCI/XCIpXG4gICAgICAgICAgICBpbmZvID1cbiAgICAgICAgICAgICAgICB1cmk6ICh1cmkuc3Vic3RyaW5nKDAsIHEpIHVubGVzcyBxIGlzIC0xKVxuICAgICAgICAgICAgICAgIGtlZXBBbGl2ZTprZWVwQWxpdmVcblxuICAgICAgICBzdHJpbmdUb1VpbnQ4QXJyYXk6IChzdHJpbmcpIC0+XG4gICAgICAgICAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHN0cmluZy5sZW5ndGgpXG4gICAgICAgICAgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICAgICAgICBpID0gMFxuXG4gICAgICAgICAgd2hpbGUgaSA8IHN0cmluZy5sZW5ndGhcbiAgICAgICAgICAgIHZpZXdbaV0gPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgdmlld1xuXG4gICAgICAgIGFycmF5QnVmZmVyVG9TdHJpbmc6IChidWZmZXIpIC0+XG4gICAgICAgICAgc3RyID0gXCJcIlxuICAgICAgICAgIHVBcnJheVZhbCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICAgICAgICBzID0gMFxuXG4gICAgICAgICAgd2hpbGUgcyA8IHVBcnJheVZhbC5sZW5ndGhcbiAgICAgICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVBcnJheVZhbFtzXSlcbiAgICAgICAgICAgIHMrK1xuICAgICAgICAgIHN0clxuIyMjXG5jbGFzcyBVdGlsXG4gICAgY29uc3RydWN0b3I6ICgpIC0+XG5cbmNsYXNzIEFwcGxpY2F0aW9uXG5cbiAgICBjb25maWc6XG4gICAgICAgIEFQUF9JRDogJ2NocGZmZGNra2hocHBtZ2NsZmJvbXBmZ2tnaHBtZ3BnJ1xuICAgICAgICBFWFRFTlNJT05fSUQ6ICdhYWpocGhqamJjbm5rZ25obGJsbmlhb2VqcGNuamRwZidcblxuICAgIGRhdGE6bnVsbFxuICAgIExJU1RFTjogbnVsbFxuICAgIE1TRzogbnVsbFxuICAgIFN0b3JhZ2U6IG51bGxcbiAgICBGUzogbnVsbFxuXG4gICAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgICAgIEBTdG9yYWdlID0gbmV3IFN0b3JhZ2VcbiAgICAgICAgQEZTID0gbmV3IEZpbGVTeXN0ZW1cblxuICAgICAgICBAY29uZmlnLlNFTEZfSUQgPSBjaHJvbWUucnVudGltZS5pZFxuICAgICAgICBAY29uZmlnLkVYVF9JRCA9IGlmIEBjb25maWcuQVBQX0lEIGlzIEBjb25maWcuU0VMRl9JRCB0aGVuIEBjb25maWcuRVhURU5TSU9OX0lEIGVsc2UgQGNvbmZpZy5BUFBfSURcbiAgICAgICAgQGNvbmZpZy5FWFRfVFlQRSA9IGlmIEBjb25maWcuQVBQX0lEIGlzbnQgQGNvbmZpZy5TRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuICAgICAgICBATVNHID0gbmV3IE1TRyBAY29uZmlnXG4gICAgICAgIEBMSVNURU4gPSBuZXcgTElTVEVOIEBjb25maWdcblxuICAgICAgICBAYXBwV2luZG93ID0gbnVsbFxuICAgICAgICBAcG9ydCA9IDMxMzM3XG4gICAgICAgIEBkYXRhID0gQFN0b3JhZ2UuZGF0YVxuICAgICAgICBAaW5pdCgpXG5cbiAgICBpbml0OiAoKSA9PlxuXG4gICAgICAjIExJU1RFTi5FWFQgJ2RpcmVjdG9yeUVudHJ5SWQnIChkaXJJZCkgLT5cbiAgICAgICAgIyBAZGlyZWN0b3JpZXMucHVzaCBkaXJJZFxuICAgIGFkZE1hcHBpbmc6ICgpIC0+XG4gICAgIyBpZiBAZGF0YS5kaXJlY3Rvcmllc1tdXG4gICAgICAgICMgQEZTLm9wZW5EaXJlY3RvcnkgKHBhdGhOYW1lLCBkaXIpIC0+XG4gICAgICAgICMgbWF0Y2ggPSBAZGF0YS5yZXNvdXJjZXNcbiAgICAgICAgIyBpZiBtYXRjaC5sZW5ndGggPiAwIHRoZW5cblxuICAgIGxhdW5jaEFwcDogKGNiKSAtPlxuICAgICAgICBjaHJvbWUubWFuYWdlbWVudC5sYXVuY2hBcHAgQGNvbmZpZy5BUFBfSURcblxuICAgIHN0YXJ0U2VydmVyOiAoKSA9PlxuICAgICAgQHNlcnZlciA9IG5ldyBUY3BTZXJ2ZXIoJzEyNy4wLjAuMScsIEBwb3J0KVxuICAgICAgQHNlcnZlci5saXN0ZW5cblxuICAgIG9wZW5BcHA6ICgpID0+XG4gICAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLFxuICAgICAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgICAgIGJvdW5kczpcbiAgICAgICAgICAgICAgd2lkdGg6NTAwXG4gICAgICAgICAgICAgIGhlaWdodDo4MDAsXG4gICAgICAod2luKSA9PlxuICAgICAgICAgIEBhcHBXaW5kb3cgPSB3aW4pXG5cbiAgICBzZXRSZWRpcmVjdDogKCkgPT5cbiAgICAgIHVuZGVmaW5lZFxuXG4gICAgZ2V0UmVzb3VyY2VzOiAoc2VsZWN0b3IpIC0+XG4gICAgICBbXS5tYXAuY2FsbCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgKGUpIC0+XG4gICAgICAgIHVybDogaWYgZS5ocmVmPyB0aGVuIGUuaHJlZiBlbHNlIGUuc3JjXG4gICAgICAgIHBhdGg6IGlmIGUuYXR0cmlidXRlc1snc3JjJ10/LnZhbHVlPyB0aGVuIGUuYXR0cmlidXRlc1snc3JjJ10udmFsdWUgZWxzZSBlLmF0dHJpYnV0ZXNbJ2hyZWYnXT8udmFsdWVcbiAgICAgICAgaHJlZjogZS5ocmVmXG4gICAgICAgIHNyYzogZS5zcmNcbiAgICAgICAgdHlwZTogZS50eXBlXG4gICAgICAgIHRhZ05hbWU6IGUudGFnTmFtZVxuICAgICAgLmZpbHRlciAoZSkgLT5cbiAgICAgICAgICBpZiBlLnVybC5tYXRjaCgnXihodHRwcz8pfChjaHJvbWUtZXh0ZW5zaW9uKXwoZmlsZSk6XFwvXFwvLionKT8gdGhlbiB0cnVlIGVsc2UgZmFsc2VcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb25cblxuIyBtYXBGaWxlcyA9IChkaXJlY3RvcnlFbnRyeUlkKSAtPlxuIyAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0IChyZXNvdXJjZXMpIC0+XG4jICAgICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5KGRpcmVjdG9yeUVudHJ5SWQsIChkaXIpIC0+XG5cbiMgICAgICAgICApXG5cbiMgdGVzdFBhdGggPSAodXJsLCBkaXJlY3RvcnlFbnRyeSkgLT5cbiMgICAgIGZvciBuYW1lIGluIHVybC5zcGxpdCgnLycpLnNsaWNlKDApLnJldmVyc2UoKVxuIyAgICAgICAgIGRvIChuYW1lKSAtPlxuIyAgICAgICAgICAgICBkaXJlY3RvcnlFbnRyeS5nZXRGaWxlKHBhdGggKyBuYW1lLCB7fSxcbiMgICAgICAgICAgICAgICAgIChmaWxlKSAtPlxuIyAgICAgICAgICAgICAgICAgKVxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuIyMjXG4gdmFyIGV4dE1zZ0lkID0gJ3BtZ25uYmRmbW1wZGtnYWFta2RpaXBmZ2picGdpb2ZjJztcbiAgdmFyIGFkZERpcmVjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsIHtcbiAgICAgICAgaWQ6IFwibWFpbndpblwiLFxuICAgICAgICBib3VuZHM6IHtcbiAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgaGVpZ2h0OiA1MFxuICAgICAgICB9LFxuICAgIH0sIGZ1bmN0aW9uKHdpbikge1xuICAgICAgICBtYWluV2luID0gd2luO1xuICAgIH0pO1xuICB9XG5cblxuXG4gICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIC8vIGlmIChzZW5kZXIuaWQgIT0gZXh0TXNnSWQpXG4gICAgICAgICAgLy8gICByZXR1cm4gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJHb3QgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCk7XG4gICAgICAgICAgICBkaXJlY3Rvcmllcy5wdXNoKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCk7XG4gICAgICAgICAgICAvLyBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkLCBmdW5jdGlvbihkaXJlY3RvcnlFbnRyeSkge1xuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGRpcmVjdG9yeUVudHJ5KTtcbiAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWwuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgaWYgKHNlbmRlci5pZCAhPSBleHRNc2dJZCkge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG4gICAgICAgICAgICByZXR1cm47ICAvLyBkb24ndCBhbGxvdyB0aGlzIGV4dGVuc2lvbiBhY2Nlc3NcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3BlbkRpcmVjdG9yeSkge1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BlbmluZyBEaXJlY3RvcnlcIn0pO1xuICAgICAgICAgICAgYWRkRGlyZWN0b3J5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICBzb2NrZXQuY3JlYXRlKFwidGNwXCIsIHt9LCBmdW5jdGlvbihfc29ja2V0SW5mbykge1xuICAgICAgICBzb2NrZXRJbmZvID0gX3NvY2tldEluZm87XG4gICAgICAgIHNvY2tldC5saXN0ZW4oc29ja2V0SW5mby5zb2NrZXRJZCwgXCIxMjcuMC4wLjFcIiwgMzMzMzMsIDUwLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJMSVNURU5JTkc6XCIsIHJlc3VsdCk7XG4gICAgICAgIHNvY2tldC5hY2NlcHQoc29ja2V0SW5mby5zb2NrZXRJZCwgb25BY2NlcHQpO1xuICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdmFyIHN0b3BTb2NrZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SW5mby5zb2NrZXRJZCk7XG4gICAgfVxuXG5cbiMjI1xuXG4jIyNcbm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3RhcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpO1xuICB2YXIgc3RvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcFwiKTtcbiAgdmFyIGhvc3RzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJob3N0c1wiKTtcbiAgdmFyIHBvcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBvcnRcIik7XG4gIHZhciBkaXJlY3RvcnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpcmVjdG9yeVwiKTtcblxuICB2YXIgc29ja2V0ID0gY2hyb21lLnNvY2tldDtcbiAgdmFyIHNvY2tldEluZm87XG4gIHZhciBmaWxlc01hcCA9IHt9O1xuXG4gIHZhciByb290RGlyO1xuICB2YXIgcG9ydCwgZXh0UG9ydDtcbiAgdmFyIGRpcmVjdG9yaWVzID0gW107XG5cbiAgdmFyIHN0cmluZ1RvVWludDhBcnJheSA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyaW5nLmxlbmd0aCk7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZpZXdbaV0gPSBzdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZpZXc7XG4gIH07XG5cbiAgdmFyIGFycmF5QnVmZmVyVG9TdHJpbmcgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICB2YXIgc3RyID0gJyc7XG4gICAgdmFyIHVBcnJheVZhbCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgZm9yKHZhciBzID0gMDsgcyA8IHVBcnJheVZhbC5sZW5ndGg7IHMrKykge1xuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodUFycmF5VmFsW3NdKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbiAgfTtcblxuICB2YXIgbG9nVG9TY3JlZW4gPSBmdW5jdGlvbihsb2cpIHtcbiAgICBsb2dnZXIudGV4dENvbnRlbnQgKz0gbG9nICsgXCJcXG5cIjtcbiAgfVxuXG4gIHZhciB3cml0ZUVycm9yUmVzcG9uc2UgPSBmdW5jdGlvbihzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIHtcbiAgICB2YXIgZmlsZSA9IHsgc2l6ZTogMCB9O1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6IGJlZ2luLi4uIFwiKTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBmaWxlID0gXCIgKyBmaWxlKTtcbiAgICB2YXIgY29udGVudFR5cGUgPSBcInRleHQvcGxhaW5cIjsgLy8oZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIHZhciBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplO1xuICAgIHZhciBoZWFkZXIgPSBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCBcIiArIGVycm9yQ29kZSArIFwiIE5vdCBGb3VuZFxcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoIGtlZXBBbGl2ZSA/IFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIDogXCJcIikgKyBcIlxcblxcblwiKTtcbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgaGVhZGVyLi4uXCIpO1xuICAgIHZhciBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpO1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0KGhlYWRlciwgMCk7XG4gICAgY29uc29sZS5pbmZvKFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIik7XG4gICAgc29ja2V0LndyaXRlKHNvY2tldElkLCBvdXRwdXRCdWZmZXIsIGZ1bmN0aW9uKHdyaXRlSW5mbykge1xuICAgICAgY29uc29sZS5sb2coXCJXUklURVwiLCB3cml0ZUluZm8pO1xuICAgICAgaWYgKGtlZXBBbGl2ZSkge1xuICAgICAgICByZWFkRnJvbVNvY2tldChzb2NrZXRJZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzb2NrZXQuZGVzdHJveShzb2NrZXRJZCk7XG4gICAgICAgIHNvY2tldC5hY2NlcHQoc29ja2V0SW5mby5zb2NrZXRJZCwgb25BY2NlcHQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnNvbGUuaW5mbyhcIndyaXRlRXJyb3JSZXNwb25zZTo6ZmlsZXJlYWRlcjo6IGVuZCBvbmxvYWQuLi5cIik7XG5cbiAgICBjb25zb2xlLmluZm8oXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBlbmQuLi5cIik7XG4gIH07XG5cbiAgdmFyIHdyaXRlMjAwUmVzcG9uc2UgPSBmdW5jdGlvbihzb2NrZXRJZCwgZmlsZSwga2VlcEFsaXZlKSB7XG4gICAgdmFyIGNvbnRlbnRUeXBlID0gKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICB2YXIgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZTtcbiAgICB2YXIgaGVhZGVyID0gc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgMjAwIE9LXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgga2VlcEFsaXZlID8gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgOiBcIlwiKSArIFwiXFxuXFxuXCIpO1xuICAgIHZhciBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpO1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0KGhlYWRlciwgMCk7XG5cbiAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGgpO1xuICAgICAgIHNvY2tldC53cml0ZShzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCBmdW5jdGlvbih3cml0ZUluZm8pIHtcbiAgICAgICAgIGNvbnNvbGUubG9nKFwiV1JJVEVcIiwgd3JpdGVJbmZvKTtcbiAgICAgICAgIGlmIChrZWVwQWxpdmUpIHtcbiAgICAgICAgICAgcmVhZEZyb21Tb2NrZXQoc29ja2V0SWQpO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgc29ja2V0LmRlc3Ryb3koc29ja2V0SWQpO1xuICAgICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmaWxlUmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGZpbGUpO1xuICB9O1xuXG4gIHZhciBvbkFjY2VwdCA9IGZ1bmN0aW9uKGFjY2VwdEluZm8pIHtcbiAgICBjb25zb2xlLmxvZyhcIkFDQ0VQVFwiLCBhY2NlcHRJbmZvKVxuICAgIHJlYWRGcm9tU29ja2V0KGFjY2VwdEluZm8uc29ja2V0SWQpO1xuICB9O1xuXG4gIHZhciByZWFkRnJvbVNvY2tldCA9IGZ1bmN0aW9uKHNvY2tldElkKSB7XG4gICAgLy8gIFJlYWQgaW4gdGhlIGRhdGFcbiAgICBzb2NrZXQucmVhZChzb2NrZXRJZCwgZnVuY3Rpb24ocmVhZEluZm8pIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiUkVBRFwiLCByZWFkSW5mbyk7XG4gICAgICAvLyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIHZhciBkYXRhID0gYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKTtcbiAgICAgIGlmKGRhdGEuaW5kZXhPZihcIkdFVCBcIikgPT0gMCkge1xuICAgICAgICB2YXIga2VlcEFsaXZlID0gZmFsc2U7XG4gICAgICAgIGlmIChkYXRhLmluZGV4T2YoXCJDb25uZWN0aW9uOiBrZWVwLWFsaXZlXCIpICE9IC0xKSB7XG4gICAgICAgICAga2VlcEFsaXZlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdlIGNhbiBvbmx5IGRlYWwgd2l0aCBHRVQgcmVxdWVzdHNcbiAgICAgICAgdmFyIHVyaUVuZCA9ICBkYXRhLmluZGV4T2YoXCIgXCIsIDQpO1xuICAgICAgICBpZih1cmlFbmQgPCAwKSB7ICAgcmV0dXJuOyB9XG4gICAgICAgIHZhciB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpO1xuICAgICAgICAvLyBzdHJpcCBxeWVyeSBzdHJpbmdcbiAgICAgICAgdmFyIHEgPSB1cmkuaW5kZXhPZihcIj9cIik7XG4gICAgICAgIGlmIChxICE9IC0xKSB7XG4gICAgICAgICAgdXJpID0gdXJpLnN1YnN0cmluZygwLCBxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeShkaXJlY3Rvcmllc1swXSlcbiAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAoZnVuY3Rpb24odXJsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRpcmVjdG9yeUVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRpcmVjdG9yeUVudHJ5KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXJpKTtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5RW50cnkuZ2V0RmlsZSgnbXlOZXdBcHBERVYucmVzb3VyY2UvaW5kZXguanMnLCB7fSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3cml0ZTIwMFJlc3BvbnNlKHNvY2tldElkLCBmaWxlLCBrZWVwQWxpdmUpO1xuICAgICAgICAgICAgICAgICAgICB9LGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9KSh1cmkpXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gdmFyIGZpbGUgPVxuICAgICAgICAvLyBpZighIWZpbGUgPT0gZmFsc2UpIHtcbiAgICAgICAgLy8gICBjb25zb2xlLndhcm4oXCJGaWxlIGRvZXMgbm90IGV4aXN0Li4uXCIgKyB1cmkpO1xuICAgICAgICAvLyAgIHdyaXRlRXJyb3JSZXNwb25zZShzb2NrZXRJZCwgNDA0LCBrZWVwQWxpdmUpO1xuICAgICAgICAvLyAgIHJldHVybjtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBsb2dUb1NjcmVlbihcIkdFVCAyMDAgXCIgKyB1cmkpO1xuICAgICAgICAvLyB3cml0ZTIwMFJlc3BvbnNlKHNvY2tldElkLCBmaWxlLCBrZWVwQWxpdmUpO1xuICAgICAgLy8gfVxuICAgICAgLy8gZWxzZSB7XG4gICAgICAgIC8vIFRocm93IGFuIGVycm9yXG4gICAgICAgIC8vIHNvY2tldC5kZXN0cm95KHNvY2tldElkKTtcbiAgICAgIC8vIH1cblxuICB9O1xufSk7XG59XG5cblxuICB2YXIgZXh0TXNnSWQgPSAncG1nbm5iZGZtbXBka2dhYW1rZGlpcGZnamJwZ2lvZmMnO1xuXG5cbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbC5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICBpZiAoc2VuZGVyLmlkICE9IGV4dE1zZ0lkKSB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJzb3JyeSwgY291bGQgbm90IHByb2Nlc3MgeW91ciBtZXNzYWdlXCJ9KTtcbiAgICAgICAgICAgIHJldHVybjsgIC8vIGRvbid0IGFsbG93IHRoaXMgZXh0ZW5zaW9uIGFjY2Vzc1xuICAgICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5vcGVuRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJPcGVuaW5nIERpcmVjdG9yeVwifSk7XG4gICAgICAgICAgICBhZGREaXJlY3RvcnkoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwiT3BzLCBJIGRvbid0IHVuZGVyc3RhbmQgdGhpcyBtZXNzYWdlXCJ9KTtcbiAgICAgICAgICB9XG4gICAgICB9KTtcblxuXG4gICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIC8vIGlmIChzZW5kZXIuaWQgIT0gZXh0TXNnSWQpXG4gICAgICAgICAgLy8gICByZXR1cm4gc2VuZFJlc3BvbnNlKHtcInJlc3VsdFwiOlwic29ycnksIGNvdWxkIG5vdCBwcm9jZXNzIHlvdXIgbWVzc2FnZVwifSk7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkKSB7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2Uoe1wicmVzdWx0XCI6XCJHb3QgRGlyZWN0b3J5XCJ9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCk7XG4gICAgICAgICAgICBkaXJlY3Rvcmllcy5wdXNoKHJlcXVlc3QuZGlyZWN0b3J5RW50cnlJZCk7XG4gICAgICAgICAgICAvLyBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkocmVxdWVzdC5kaXJlY3RvcnlFbnRyeUlkLCBmdW5jdGlvbihkaXJlY3RvcnlFbnRyeSkge1xuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGRpcmVjdG9yeUVudHJ5KTtcbiAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZSh7XCJyZXN1bHRcIjpcIk9wcywgSSBkb24ndCB1bmRlcnN0YW5kIHRoaXMgbWVzc2FnZVwifSk7XG4gICAgICAgICAgfVxuICAgICAgfSk7XG4gICAgc29ja2V0LmNyZWF0ZShcInRjcFwiLCB7fSwgZnVuY3Rpb24oX3NvY2tldEluZm8pIHtcbiAgICAgICAgc29ja2V0SW5mbyA9IF9zb2NrZXRJbmZvO1xuICAgICAgICBzb2NrZXQubGlzdGVuKHNvY2tldEluZm8uc29ja2V0SWQsIFwiMTI3LjAuMC4xXCIsIDMzMzMzLCA1MCwgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTElTVEVOSU5HOlwiLCByZXN1bHQpO1xuICAgICAgICBzb2NrZXQuYWNjZXB0KHNvY2tldEluZm8uc29ja2V0SWQsIG9uQWNjZXB0KTtcbiAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBzdG9wU29ja2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNvY2tldC5kZXN0cm95KHNvY2tldEluZm8uc29ja2V0SWQpO1xuICAgIH1cblxuICB2YXIgYWRkRGlyZWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJywge1xuICAgICAgICBpZDogXCJtYWlud2luXCIsXG4gICAgICAgIGJvdW5kczoge1xuICAgICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgICBoZWlnaHQ6IDUwXG4gICAgICAgIH0sXG4gICAgfSwgZnVuY3Rpb24od2luKSB7XG4gICAgICAgIG1haW5XaW4gPSB3aW47XG4gICAgfSk7XG4gIH1cblxufTtcbiMjI1xuXG4iLCJBcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5cbmNsYXNzIEV4dENvbnRlbnQgZXh0ZW5kcyBBcHBsaWNhdGlvblxuICAgIGluaXQ6KCkgLT5cbiAgICAgICAgQExJU1RFTi5Mb2NhbCAnZ2V0UmVzb3VyY2VzJywgKHJlcykgPT5cbiAgICAgICAgICAgIEBNU0cuTG9jYWwgJ3Jlc291cmNlcyc6QGdldFJlc291cmNlcygnc2NyaXB0W3NyY10sbGlua1tocmVmXScpXG5cbmFwcCA9IG5ldyBFeHRDb250ZW50XG4iXX0=
