(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  var show;

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
    this.setRedirect = __bind(this.setRedirect, this);
    this.openApp = __bind(this.openApp, this);
    this.startServer = __bind(this.startServer, this);
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

  Application.prototype.addMapping = function() {};

  Application.prototype.launchApp = function(cb) {
    return chrome.management.launchApp(this.config.APP_ID);
  };

  Application.prototype.startServer = function() {};

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

  show = function() {
    var log;
    if (window.console) {
      if (Function.prototype.bind) {
        log = Function.prototype.bind.call(console.log, console);
      } else {
        log = function() {
          Function.prototype.apply.call(console.log, console, arguments_);
        };
      }
      return log.apply(this, arguments_);
    }
  };

  return Application;

})();

module.exports = Application;


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
    this.redirectListener = __bind(this.redirectListener, this);
    this.initRedirects = __bind(this.initRedirects, this);
    return ExtBackground.__super__.constructor.apply(this, arguments);
  }

  ExtBackground.prototype.urls = {};

  ExtBackground.prototype.urlArr = [];

  ExtBackground.prototype.origins = {};

  ExtBackground.prototype.isOn = {};

  ExtBackground.prototype.files = {};

  ExtBackground.prototype.extPort = {};

  ExtBackground.prototype.currentTabId = null;

  ExtBackground.prototype.maps = [];

  ExtBackground.prototype.init = function() {
    chrome.tabs.onUpdated.addListener((function(_this) {
      return function(tabId) {
        _this.currentTabId = tabId;
        if (_this.isOn[tabId] == null) {
          return _this.updateIcon(tabId);
        }
      };
    })(this));
    this.LISTEN.Local('resources', (function(_this) {
      return function(resources) {
        return void 0;
      };
    })(this));
    this.LISTEN.Ext('redirInfo', (function(_this) {
      return function(red) {
        _this.maps = red.maps;
        return _this.server = red.server;
      };
    })(this));
    return chrome.browserAction.onClicked.addListener((function(_this) {
      return function(tab) {
        if (!_this.isOn[tab.id]) {
          _this.isOn[tab.id] = true;
          chrome.tabs.sendMessage(tab.id, {
            'getResources': true
          }, function(response) {
            _this.launchApp();
            return _this.MSG.Ext({
              'resources': response.resources
            });
          });
        } else {
          _this.isOn[tab.id] = _this.isOn[tab.id] == null ? true : !_this.isOn[tab.id];
          _this.killRedirects();
        }
        return _this.updateIcon(tab.id);
      };
    })(this));
  };

  ExtBackground.prototype.getServer = function() {};

  ExtBackground.prototype.killRedirects = function() {
    return chrome.webRequest.onBeforeRequest.removeListener();
  };

  ExtBackground.prototype.initRedirects = function() {
    if (this.maps.length === 0) {
      return;
    }
    return chrome.webRequest.onBeforeRequest.addListener(this.redirectListener, {
      urls: ['<all_urls>'],
      tabId: this.currentTabId
    }, ['blocking']);
  };

  ExtBackground.prototype.match = function(url) {
    var map, _i, _len, _ref;
    _ref = this.maps;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      map = _ref[_i];
      if ((url.match(map.url) != null) && (map.url != null)) {
        return map;
      }
    }
    return null;
  };

  ExtBackground.prototype.headerListener = function(details) {
    return show(details);
  };

  ExtBackground.prototype.redirectListener = function(details) {
    var map;
    show(details);
    map = this.match(details.url);
    if (map != null) {
      show('redirected to ' + this.server.url + encodeURIComponent(details.url));
      return {
        redirectUrl: this.server.url + encodeURIComponent(details.url)
      };
    } else {
      return {};
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcmVkaXJlY3Rvci9jb21tb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcmVkaXJlY3Rvci9leHRlbnNpb24vc3JjL2JhY2tncm91bmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQ0EsSUFBQSxvRUFBQTtFQUFBLGtGQUFBOztBQUFBLENBQUMsU0FBQSxHQUFBO0FBQ0MsTUFBQSxhQUFBO0FBQUEsRUFBQSxPQUFBLEdBQVUsQ0FDUixRQURRLEVBQ0UsT0FERixFQUNXLE9BRFgsRUFDb0IsT0FEcEIsRUFDNkIsS0FEN0IsRUFDb0MsUUFEcEMsRUFDOEMsT0FEOUMsRUFFUixXQUZRLEVBRUssT0FGTCxFQUVjLGdCQUZkLEVBRWdDLFVBRmhDLEVBRTRDLE1BRjVDLEVBRW9ELEtBRnBELEVBR1IsY0FIUSxFQUdRLFNBSFIsRUFHbUIsWUFIbkIsRUFHaUMsT0FIakMsRUFHMEMsTUFIMUMsRUFHa0QsU0FIbEQsRUFJUixXQUpRLEVBSUssT0FKTCxFQUljLE1BSmQsQ0FBVixDQUFBO0FBQUEsRUFLQSxJQUFBLEdBQU8sU0FBQSxHQUFBO0FBRUwsUUFBQSxxQkFBQTtBQUFBO1NBQUEsOENBQUE7c0JBQUE7VUFBd0IsQ0FBQSxPQUFTLENBQUEsQ0FBQTtBQUMvQixzQkFBQSxPQUFRLENBQUEsQ0FBQSxDQUFSLEdBQWEsS0FBYjtPQURGO0FBQUE7b0JBRks7RUFBQSxDQUxQLENBQUE7QUFVQSxFQUFBLElBQUcsK0JBQUg7V0FDRSxNQUFNLENBQUMsSUFBUCxHQUFjLFFBQVEsQ0FB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Q0FBQyxHQUEzQixDQUEzQjtPQUFQLENBRko7S0FBQSxNQUFBO0FBSUksYUFBTyxFQUFQLENBSko7S0FIYztFQUFBLENBaEVsQixDQUFBOztBQUFBLDBCQStGQSxVQUFBLEdBQVksU0FBQyxLQUFELEdBQUE7QUFDUixJQUFBLElBQUcsSUFBQyxDQUFBLElBQUssQ0FBQSxLQUFBLENBQVQ7YUFDSSxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQXJCLENBQ0k7QUFBQSxRQUFBLElBQUEsRUFDSTtBQUFBLFVBQUEsSUFBQSxFQUFLLHdCQUFMO0FBQUEsVUFDQSxJQUFBLEVBQUssd0JBREw7U0FESjtBQUFBLFFBR0EsS0FBQSxFQUFNLEtBSE47T0FESixFQURKO0tBQUEsTUFBQTthQVFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBckIsQ0FDSTtBQUFBLFFBQUEsSUFBQSxFQUNJO0FBQUEsVUFBQSxJQUFBLEVBQUsseUJBQUw7QUFBQSxVQUNBLElBQUEsRUFBSyx5QkFETDtTQURKO0FBQUEsUUFHQSxLQUFBLEVBQU0sS0FITjtPQURKLEVBUko7S0FEUTtFQUFBLENBL0ZaLENBQUE7O3VCQUFBOztHQUR3QixZQUY1QixDQUFBOztBQUFBLGFBa0hBLEdBQWdCLFNBQUMsU0FBRCxHQUFBO1NBQ0osTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFmLENBQTJCLEtBQTNCLEVBQWlDO0FBQUEsSUFBQSxTQUFBLEVBQVUsU0FBVjtHQUFqQyxFQURJO0FBQUEsQ0FsSGhCLENBQUE7O0FBQUEsR0FxSEEsR0FBTSxHQUFBLENBQUEsYUFySE4sQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTc0MjA5M1xuKCgpIC0+XG4gIG1ldGhvZHMgPSBbXG4gICAgJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJyxcbiAgICAnZXhjZXB0aW9uJywgJ2dyb3VwJywgJ2dyb3VwQ29sbGFwc2VkJywgJ2dyb3VwRW5kJywgJ2luZm8nLCAnbG9nJyxcbiAgICAnbWFya1RpbWVsaW5lJywgJ3Byb2ZpbGUnLCAncHJvZmlsZUVuZCcsICd0YWJsZScsICd0aW1lJywgJ3RpbWVFbmQnLFxuICAgICd0aW1lU3RhbXAnLCAndHJhY2UnLCAnd2FybiddXG4gIG5vb3AgPSAoKSAtPlxuICAgICMgc3R1YiB1bmRlZmluZWQgbWV0aG9kcy5cbiAgICBmb3IgbSBpbiBtZXRob2RzICB3aGVuICAhY29uc29sZVttXVxuICAgICAgY29uc29sZVttXSA9IG5vb3BcblxuICBpZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZD9cbiAgICB3aW5kb3cuc2hvdyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUpXG4gIGVsc2VcbiAgICB3aW5kb3cuc2hvdyA9ICgpIC0+XG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKVxuKSgpXG5cbmNsYXNzIE1TR1xuICBpc0NvbnRlbnRTY3JpcHQ6IGxvY2F0aW9uLnByb3RvY29sIGlzbnQgJ2Nocm9tZS1leHRlbnNpb246J1xuICBjb25zdHJ1Y3RvcjogKGNvbmZpZykgLT5cbiAgICBAY29uZmlnID0gY29uZmlnXG4gIExvY2FsOiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICBzaG93IFwiPT0gTUVTU0FHRSAjeyBKU09OLnN0cmluZ2lmeSBtZXNzYWdlIH0gPT0+XCJcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBtZXNzYWdlLCByZXNwb25kXG4gIEV4dDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgc2hvdyBcIj09IE1FU1NBR0UgI3sgSlNPTi5zdHJpbmdpZnkgbWVzc2FnZSB9ID09PlwiXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgQGNvbmZpZy5FWFRfSUQsIG1lc3NhZ2UsIHJlc3BvbmRcblxuY2xhc3MgTElTVEVOXG4gIGxvY2FsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlXG4gICAgbGlzdGVuZXJzOnt9XG4gIGV4dGVybmFsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWxcbiAgICBsaXN0ZW5lcnM6e31cbiAgY29uc3RydWN0b3I6IChjb25maWcpIC0+XG4gICAgQGNvbmZpZyA9IGNvbmZpZ1xuICAgIEBsb2NhbC5hcGkuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwuYXBpPy5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgTG9jYWw6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICBAbG9jYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBFeHQ6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBfb25NZXNzYWdlRXh0ZXJuYWw6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICBzaG93IFwiPD09IEVYVEVSTkFMIE1FU1NBR0UgPT0gI3sgQGNvbmZpZy5FWFRfVFlQRSB9ID09XCIgKyByZXF1ZXN0XG4gICAgaWYgc2VuZGVyLmlkIGlzbnQgQGNvbmZpZy5FWFRfSUQgdGhlbiByZXR1cm4gdW5kZWZpbmVkXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIHNlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcblxuICBfb25NZXNzYWdlOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgc2hvdyBcIjw9PSBNRVNTQUdFID09ICN7IEBjb25maWcuRVhUX1RZUEUgfSA9PVwiICsgcmVxdWVzdFxuICAgIEBsb2NhbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBzZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG5cbmNsYXNzIERhdGFcbiAgbWFwcGluZzpbXG4gICAgZGlyZWN0b3J5Om51bGxcbiAgICB1cmxQYXR0ZXJuOm51bGxcbiAgXVxuICByZXNvdXJjZXM6W1xuICAgIHJlc291cmNlOm51bGxcbiAgICBmaWxlOm51bGxcbiAgXVxuXG5cblxuY2xhc3MgU3RvcmFnZVxuICBhcGk6IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gIGRhdGE6IHt9XG4gIGNhbGxiYWNrOiAoKSAtPlxuICBjb25zdHJ1Y3RvcjogKGNhbGxiYWNrKSAtPlxuICAgIEBjYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgQHJldHJpZXZlQWxsKClcbiAgICBAb25DaGFuZ2VkQWxsKClcblxuICBzYXZlOiAoa2V5LCBpdGVtKSAtPlxuICAgIG9iaiA9IHt9XG4gICAgb2JqW2tleV0gPSBpdGVtXG4gICAgQGFwaS5zZXQgb2JqXG5cbiAgc2F2ZUFsbDogKCkgLT5cbiAgICBAYXBpLnNldCBAZGF0YVxuXG4gIHJldHJpZXZlOiAoa2V5LCBjYikgLT5cbiAgICBAYXBpLmdldCBrZXksIChyZXN1bHRzKSAtPlxuICAgICAgQGRhdGFbcl0gPSByZXN1bHRzW3JdIGZvciByIG9mIHJlc3VsdHNcbiAgICAgIGlmIGNiPyB0aGVuIGNiIHJlc3VsdHNba2V5XVxuXG5cbiAgcmV0cmlldmVBbGw6IChjYikgLT5cbiAgICBAYXBpLmdldCAocmVzdWx0KSA9PlxuICAgICAgQGRhdGEgPSByZXN1bHRcbiAgICAgIEBjYWxsYmFjaz8gcmVzdWx0XG4gICAgICBjYj8gcmVzdWx0XG4gICAgICBzaG93IHJlc3VsdFxuXG4gIG9uQ2hhbmdlZDogKGtleSwgY2IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLCBuYW1lc3BhY2UpIC0+XG4gICAgICBpZiBjaGFuZ2VzW2tleV0/IGFuZCBjYj8gdGhlbiBjYiBjaGFuZ2VzW2tleV0ubmV3VmFsdWVcbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlc1xuXG4gIG9uQ2hhbmdlZEFsbDogKCkgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsbmFtZXNwYWNlKSA9PlxuICAgICAgQGRhdGFbY10gPSBjaGFuZ2VzW2NdLm5ld1ZhbHVlIGZvciBjIG9mIGNoYW5nZXNcbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlc1xuXG5cbiMgY2xhc3MgRGlyZWN0b3J5U3RvcmVcbiMgICBkaXJlY3RvcmllcyA9XG4jICAgY29uc3RydWN0b3IgKCkgLT5cblxuIyBjbGFzcyBEaXJlY3RvcnlcblxuXG5jbGFzcyBGaWxlU3lzdGVtXG4gIGFwaTogY2hyb21lLmZpbGVTeXN0ZW1cblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuICAjIEBkaXJzOiBuZXcgRGlyZWN0b3J5U3RvcmVcbiAgIyBmaWxlVG9BcnJheUJ1ZmZlcjogKGJsb2IsIG9ubG9hZCwgb25lcnJvcikgLT5cbiAgIyAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgIyAgIHJlYWRlci5vbmxvYWQgPSBvbmxvYWRcblxuICAjICAgcmVhZGVyLm9uZXJyb3IgPSBvbmVycm9yXG5cbiAgIyAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBibG9iXG5cbiAgcmVhZEZpbGU6IChkaXJFbnRyeSwgcGF0aCwgc3VjY2VzcywgZXJyb3IpIC0+XG4gICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgcGF0aCxcbiAgICAgIChmaWxlRW50cnkpID0+XG4gICAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICAgIHN1Y2Nlc3MoZmlsZUVudHJ5LCBmaWxlKVxuICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG5cbiAgZ2V0RmlsZUVudHJ5OiAoZGlyRW50cnksIHBhdGgsIHN1Y2Nlc3MsIGVycm9yKSAtPlxuICAgIGlmIGRpckVudHJ5Py5nZXRGaWxlP1xuICAgICAgZGlyRW50cnkuZ2V0RmlsZSBwYXRoLCB7fSwgKGZpbGVFbnRyeSkgLT5cbiAgICAgICAgc3VjY2VzcyBmaWxlRW50cnlcbiAgICBlbHNlIGVycm9yKClcblxuICBvcGVuRGlyZWN0b3J5OiAoY2FsbGJhY2spID0+XG4gICAgQGFwaS5jaG9vc2VFbnRyeSB0eXBlOidvcGVuRGlyZWN0b3J5JywgKGRpcmVjdG9yeUVudHJ5LCBmaWxlcykgPT5cbiAgICAgIEBhcGkuZ2V0RGlzcGxheVBhdGggZGlyZWN0b3J5RW50cnksIChwYXRoTmFtZSkgPT5cbiAgICAgICAgZGlyID1cbiAgICAgICAgICAgIHJlbFBhdGg6IGRpcmVjdG9yeUVudHJ5LmZ1bGxQYXRoLnJlcGxhY2UoJy8nICsgZGlyZWN0b3J5RW50cnkubmFtZSwgJycpXG4gICAgICAgICAgICBkaXJlY3RvcnlFbnRyeUlkOiBAYXBpLnJldGFpbkVudHJ5KGRpcmVjdG9yeUVudHJ5KVxuICAgICAgICAgICAgZW50cnk6IGRpcmVjdG9yeUVudHJ5XG5cbiAgICAgICAgICBjYWxsYmFjayBwYXRoTmFtZSwgZGlyXG4gICAgICAgICAgICAjIEBnZXRPbmVEaXJMaXN0IGRpclxuICAgICAgICAgICAgIyBTdG9yYWdlLnNhdmUgJ2RpcmVjdG9yaWVzJywgQHNjb3BlLmRpcmVjdG9yaWVzIChyZXN1bHQpIC0+XG5cblxuXG5jbGFzcyBNYXBwaW5nXG4gIHJlc291cmNlOiBudWxsICNodHRwOi8vYmxhbGEuY29tL3doYXQvZXZlci9pbmRleC5qc1xuICBsb2NhbDogbnVsbCAjL3NvbWVzaGl0dHlEaXIvb3RoZXJTaGl0dHlEaXIvXG4gIHJlZ2V4OiBudWxsXG4gIGNvbnN0cnVjdG9yOiAocmVzb3VyY2UsIGxvY2FsLCByZWdleCkgLT5cbiAgICBbQGxvY2FsLCBAcmVzb3VyY2UsIEByZWdleF0gPSBbbG9jYWwsIHJlc291cmNlLCByZWdleF1cblxuICBnZXRMb2NhbFJlc291cmNlOiAoKSAtPlxuICAgIEByZXNvdXJjZS5yZXBsYWNlKEByZWdleCwgQGxvY2FsKVxuXG4gIHNldFJlZGlyZWN0RGVjbGFyYXRpdmU6ICh0YWJJZCkgLT5cbiAgICBydWxlcyA9IFtdLnB1c2hcbiAgICAgIHByaW9yaXR5OjEwMFxuICAgICAgY29uZGl0aW9uczogW1xuICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZXF1ZXN0TWF0Y2hlclxuICAgICAgICAgIHVybDpcbiAgICAgICAgICAgIHVybE1hdGNoZXM6QHJlZ2V4XG4gICAgICAgIF1cbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuUmVkaXJlY3RSZXF1ZXN0XG4gICAgICAgICAgcmVkaXJlY3RVcmw6QGdldExvY2FsUmVzb3VyY2UoKVxuICAgICAgXVxuICAgIGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3Qub25SZXF1ZXN0LmFkZFJ1bGVzIHJ1bGVzXG5cbiMgY2xhc3MgU3RvcmFnZUZhY3RvcnlcbiMgICBtYWtlT2JqZWN0OiAodHlwZSkgLT5cbiMgICAgIHN3aXRjaCB0eXBlXG4jICAgICAgIHdoZW4gJ1Jlc291cmNlTGlzdCdcbiMgICBfY3JlYXRlOiAodHlwZSkgLT5cbiMgICAgIEBnZXRGcm9tU3RvcmFnZS50aGVuIChvYmopIC0+XG4jICAgICAgIHJldHVybiBvYmpcblxuIyAgIGdldEZyb21TdG9yYWdlOiAoKSAtPlxuIyAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlIChzdWNjZXNzLCBmYWlsKSAtPlxuIyAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQgKGEpIC0+XG4jICAgICAgICAgYiA9IG5ldyBSZXNvdXJjZUxpc3RcbiMgICAgICAgICBmb3Iga2V5IG9mIGFcbiMgICAgICAgICAgIGRvIChhKSAtPlxuIyAgICAgICAgICAgICBiW2tleV0gPSBhW2tleV1cbiMgICAgICAgICBzdWNjZXNzIGJcbiMjI1xuY2xhc3MgRmlsZVxuICAgIGNvbnN0cnVjdG9yOiAoZGlyZWN0b3J5RW50cnksIHBhdGgpIC0+XG4gICAgICAgIEBkaXJFbnRyeSA9IGRpcmVjdG9yeUVudHJ5XG4gICAgICAgIEBwYXRoID0gcGF0aFxuIyMjXG5cbiNUT0RPOiByZXdyaXRlIHRoaXMgY2xhc3MgdXNpbmcgdGhlIG5ldyBjaHJvbWUuc29ja2V0cy4qIGFwaSB3aGVuIHlvdSBjYW4gbWFuYWdlIHRvIG1ha2UgaXQgd29ya1xuY2xhc3MgU2VydmVyXG4gIHNvY2tldDogY2hyb21lLnNvY2tldFxuICAjIHRjcDogY2hyb21lLnNvY2tldHMudGNwXG4gIGhvc3Q6XCIxMjcuMC4wLjFcIlxuICBwb3J0OjgwODJcbiAgbWF4Q29ubmVjdGlvbnM6NTAwXG4gIHNvY2tldFByb3BlcnRpZXM6XG4gICAgICBwZXJzaXN0ZW50OnRydWVcbiAgICAgIG5hbWU6J1NMUmVkaXJlY3RvcidcbiAgc29ja2V0SW5mbzpudWxsXG4gIGdldExvY2FsRmlsZTpudWxsXG4gIHNvY2tldElkczpbXVxuICBzdG9wcGVkOmZhbHNlXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG5cbiAgc3RhcnQ6IChob3N0LHBvcnQsbWF4Q29ubmVjdGlvbnMsIGNiKSAtPlxuICAgIEBob3N0ID0gaWYgaG9zdD8gdGhlbiBob3N0IGVsc2UgQGhvc3RcbiAgICBAcG9ydCA9IGlmIHBvcnQ/IHRoZW4gcG9ydCBlbHNlIEBwb3J0XG4gICAgQG1heENvbm5lY3Rpb25zID0gaWYgbWF4Q29ubmVjdGlvbnM/IHRoZW4gbWF4Q29ubmVjdGlvbnMgZWxzZSBAbWF4Q29ubmVjdGlvbnNcblxuICAgIEBraWxsQWxsICgpID0+XG4gICAgICBAc29ja2V0LmNyZWF0ZSAndGNwJywge30sIChzb2NrZXRJbmZvKSA9PlxuICAgICAgICBAc29ja2V0SWRzID0gW11cbiAgICAgICAgQHNvY2tldElkcy5wdXNoIHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0ICdzb2NrZXRJZHMnOkBzb2NrZXRJZHNcbiAgICAgICAgQHNvY2tldC5saXN0ZW4gc29ja2V0SW5mby5zb2NrZXRJZCwgQGhvc3QsIEBwb3J0LCAocmVzdWx0KSA9PlxuICAgICAgICAgIHNob3cgJ2xpc3RlbmluZyAnICsgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICAgIEBzdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICBAc29ja2V0SW5mbyA9IHNvY2tldEluZm9cbiAgICAgICAgICBAc29ja2V0LmFjY2VwdCBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAga2lsbEFsbDogKGNhbGxiYWNrKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCAnc29ja2V0SWRzJywgKHJlc3VsdCkgPT5cbiAgICAgIHNob3cgJ2dvdCBpZHMnXG4gICAgICBzaG93IHJlc3VsdFxuICAgICAgQHNvY2tldElkcyA9IHJlc3VsdC5zb2NrZXRJZHNcbiAgICAgIGZvciBzIGluIEBzb2NrZXRJZHM/XG4gICAgICAgIGRvIChzKSA9PlxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgQHNvY2tldC5kaXNjb25uZWN0IHNcbiAgICAgICAgICAgIEBzb2NrZXQuZGVzdHJveSBzXG4gICAgICAgICAgICBzaG93ICdraWxsZWQgJyArIHNcbiAgICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgICAgc2hvdyBcImNvdWxkIG5vdCBraWxsICN7IHMgfSBiZWNhdXNlICN7IGVycm9yIH1cIlxuICAgICAgY2FsbGJhY2s/KClcblxuICBzdG9wOiAoKSAtPlxuICAgIEBraWxsQWxsKClcbiAgICBAc3RvcHBlZCA9IHRydWVcblxuICBfb25SZWNlaXZlOiAocmVjZWl2ZUluZm8pID0+XG4gICAgc2hvdyhcIkNsaWVudCBzb2NrZXQgJ3JlY2VpdmUnIGV2ZW50OiBzZD1cIiArIHJlY2VpdmVJbmZvLnNvY2tldElkXG4gICAgKyBcIiwgYnl0ZXM9XCIgKyByZWNlaXZlSW5mby5kYXRhLmJ5dGVMZW5ndGgpXG5cbiAgX29uTGlzdGVuOiAoc2VydmVyU29ja2V0SWQsIHJlc3VsdENvZGUpID0+XG4gICAgcmV0dXJuIHNob3cgJ0Vycm9yIExpc3RlbmluZzogJyArIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIGlmIHJlc3VsdENvZGUgPCAwXG4gICAgQHNlcnZlclNvY2tldElkID0gc2VydmVyU29ja2V0SWRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0LmFkZExpc3RlbmVyIEBfb25BY2NlcHRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0RXJyb3IuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdEVycm9yXG4gICAgQHRjcC5vblJlY2VpdmUuYWRkTGlzdGVuZXIgQF9vblJlY2VpdmVcbiAgICAjIHNob3cgXCJbXCIrc29ja2V0SW5mby5wZWVyQWRkcmVzcytcIjpcIitzb2NrZXRJbmZvLnBlZXJQb3J0K1wiXSBDb25uZWN0aW9uIGFjY2VwdGVkIVwiO1xuICAgICMgaW5mbyA9IEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICMgQGdldEZpbGUgdXJpLCAoZmlsZSkgLT5cbiAgX29uQWNjZXB0RXJyb3I6IChlcnJvcikgLT5cbiAgICBzaG93IGVycm9yXG5cbiAgX29uQWNjZXB0OiAoc29ja2V0SW5mbykgPT5cbiAgICAjIHJldHVybiBudWxsIGlmIGluZm8uc29ja2V0SWQgaXNudCBAc2VydmVyU29ja2V0SWRcbiAgICBzaG93KFwiU2VydmVyIHNvY2tldCAnYWNjZXB0JyBldmVudDogc2Q9XCIgKyBzb2NrZXRJbmZvLnNvY2tldElkKVxuICAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZCwgKGluZm8pID0+XG4gICAgICBAZ2V0TG9jYWxGaWxlIGluZm8sXG4gICAgICAgIChmaWxlRW50cnksIGZpbGVSZWFkZXIpID0+XG4gICAgICAgICAgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldEluZm8uc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZVJlYWRlciwgaW5mby5rZWVwQWxpdmUsXG4gICAgICAgIChlcnJvcikgPT5cbiAgICAgICAgICBAX3dyaXRlRXJyb3Igc29ja2V0SW5mby5zb2NrZXRJZCwgNDA0LCBpbmZvLmtlZXBBbGl2ZVxuICAgICMgQHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG5cblxuICBzdHJpbmdUb1VpbnQ4QXJyYXk6IChzdHJpbmcpIC0+XG4gICAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHN0cmluZy5sZW5ndGgpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICBpID0gMFxuXG4gICAgd2hpbGUgaSA8IHN0cmluZy5sZW5ndGhcbiAgICAgIHZpZXdbaV0gPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuICAgICAgaSsrXG4gICAgdmlld1xuXG4gIGFycmF5QnVmZmVyVG9TdHJpbmc6IChidWZmZXIpIC0+XG4gICAgc3RyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIHMgPSAwXG5cbiAgICB3aGlsZSBzIDwgdUFycmF5VmFsLmxlbmd0aFxuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodUFycmF5VmFsW3NdKVxuICAgICAgcysrXG4gICAgc3RyXG5cbiAgX3dyaXRlMjAwUmVzcG9uc2U6IChzb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlLCBrZWVwQWxpdmUpIC0+XG4gICAgY29udGVudFR5cGUgPSAoaWYgKGZpbGUudHlwZSBpcyBcIlwiKSB0aGVuIFwidGV4dC9wbGFpblwiIGVsc2UgZmlsZS50eXBlKVxuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgMjAwIE9LXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuXG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXJcbiAgICByZWFkZXIub25sb2FkID0gKGV2KSA9PlxuICAgICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZXYudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICAgIHNob3cgd3JpdGVJbmZvXG4gICAgICAgICMgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIub25lcnJvciA9IChlcnJvcikgPT5cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBmaWxlXG5cblxuICAgICMgQGVuZCBzb2NrZXRJZFxuICAgICMgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAjIGZpbGVSZWFkZXIub25sb2FkID0gKGUpID0+XG4gICAgIyAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgIyAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAjICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgIyAgICAgICBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SWRcblxuXG4gIF9yZWFkRnJvbVNvY2tldDogKHNvY2tldElkLCBjYikgLT5cbiAgICBAc29ja2V0LnJlYWQgc29ja2V0SWQsIChyZWFkSW5mbykgPT5cbiAgICAgIHNob3cgXCJSRUFEXCIsIHJlYWRJbmZvXG5cbiAgICAgICMgUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICBkYXRhID0gQGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSlcbiAgICAgIHNob3cgZGF0YVxuXG4gICAgICBpZiBkYXRhLmluZGV4T2YoXCJHRVQgXCIpIGlzbnQgMFxuICAgICAgICBAZW5kIHNvY2tldElkXG4gICAgICAgIHJldHVyblxuXG4gICAgICBrZWVwQWxpdmUgPSBmYWxzZVxuICAgICAga2VlcEFsaXZlID0gdHJ1ZSBpZiBkYXRhLmluZGV4T2YgJ0Nvbm5lY3Rpb246IGtlZXAtYWxpdmUnIGlzbnQgLTFcblxuICAgICAgdXJpRW5kID0gZGF0YS5pbmRleE9mKFwiIFwiLCA0KVxuXG4gICAgICByZXR1cm4gZW5kIHNvY2tldElkIGlmIHVyaUVuZCA8IDBcblxuICAgICAgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKVxuICAgICAgaWYgbm90IHVyaT9cbiAgICAgICAgd3JpdGVFcnJvciBzb2NrZXRJZCwgNDA0LCBrZWVwQWxpdmVcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGluZm8gPVxuICAgICAgICB1cmk6IHVyaVxuICAgICAgICBrZWVwQWxpdmU6a2VlcEFsaXZlXG4gICAgICBpbmZvLnJlZmVyZXIgPSBkYXRhLm1hdGNoKC9SZWZlcmVyOlxccyguKikvKT9bMV1cbiAgICAgICNzdWNjZXNzXG4gICAgICBjYj8gaW5mb1xuXG4gIGVuZDogKHNvY2tldElkLCBrZWVwQWxpdmUpIC0+XG4gICAgICAjIGlmIGtlZXBBbGl2ZVxuICAgICAgIyAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICMgZWxzZVxuICAgIEBzb2NrZXQuZGlzY29ubmVjdCBzb2NrZXRJZFxuICAgIEBzb2NrZXQuZGVzdHJveSBzb2NrZXRJZFxuICAgIHNob3cgJ2VuZGluZyAnICsgc29ja2V0SWRcbiAgICBAc29ja2V0LmFjY2VwdCBAc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG4gIF93cml0ZUVycm9yOiAoc29ja2V0SWQsIGVycm9yQ29kZSwga2VlcEFsaXZlKSAtPlxuICAgIGZpbGUgPSBzaXplOiAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogYmVnaW4uLi4gXCJcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBmaWxlID0gXCIgKyBmaWxlXG4gICAgY29udGVudFR5cGUgPSBcInRleHQvcGxhaW5cIiAjKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIFwiICsgZXJyb3JDb2RlICsgXCIgTm90IEZvdW5kXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyBoZWFkZXIuLi5cIlxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyB2aWV3Li4uXCJcbiAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcblxuY2xhc3MgQXBwbGljYXRpb25cblxuICBjb25maWc6XG4gICAgQVBQX0lEOiAnY2VjaWZhZnBoZWdob2ZwZmRraGVra2liY2liaGdmZWMnXG4gICAgRVhURU5TSU9OX0lEOiAnZGRkaW1ibmppYmpjYWZib2tuYmdoZWhiZmFqZ2dnZXAnXG5cbiAgZGF0YTpudWxsXG4gIExJU1RFTjogbnVsbFxuICBNU0c6IG51bGxcbiAgU3RvcmFnZTogbnVsbFxuICBGUzogbnVsbFxuICBTZXJ2ZXI6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBAU3RvcmFnZSA9IG5ldyBTdG9yYWdlXG4gICAgQEZTID0gbmV3IEZpbGVTeXN0ZW1cbiAgICBAU2VydmVyID0gbmV3IFNlcnZlclxuICAgIEBjb25maWcuU0VMRl9JRCA9IGNocm9tZS5ydW50aW1lLmlkXG4gICAgQGNvbmZpZy5FWFRfSUQgPSBpZiBAY29uZmlnLkFQUF9JRCBpcyBAY29uZmlnLlNFTEZfSUQgdGhlbiBAY29uZmlnLkVYVEVOU0lPTl9JRCBlbHNlIEBjb25maWcuQVBQX0lEXG4gICAgQGNvbmZpZy5FWFRfVFlQRSA9IGlmIEBjb25maWcuQVBQX0lEIGlzbnQgQGNvbmZpZy5TRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuICAgIEBNU0cgPSBuZXcgTVNHIEBjb25maWdcbiAgICBATElTVEVOID0gbmV3IExJU1RFTiBAY29uZmlnXG5cbiAgICBAYXBwV2luZG93ID0gbnVsbFxuICAgIEBwb3J0ID0gMzEzMzdcbiAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgPT5cblxuICAgICMgTElTVEVOLkVYVCAnZGlyZWN0b3J5RW50cnlJZCcgKGRpcklkKSAtPlxuICAgICAgIyBAZGlyZWN0b3JpZXMucHVzaCBkaXJJZFxuICBhZGRNYXBwaW5nOiAoKSAtPlxuICAjIGlmIEBkYXRhLmRpcmVjdG9yaWVzW11cbiAgICAgICMgQEZTLm9wZW5EaXJlY3RvcnkgKHBhdGhOYW1lLCBkaXIpIC0+XG4gICAgICAjIG1hdGNoID0gQGRhdGEucmVzb3VyY2VzXG4gICAgICAjIGlmIG1hdGNoLmxlbmd0aCA+IDAgdGhlblxuXG4gIGxhdW5jaEFwcDogKGNiKSAtPlxuICAgIGNocm9tZS5tYW5hZ2VtZW50LmxhdW5jaEFwcCBAY29uZmlnLkFQUF9JRFxuXG4gIHN0YXJ0U2VydmVyOiAoKSA9PlxuXG4gICAgIyBAc2VydmVyID0gbmV3IFRjcFNlcnZlcignMTI3LjAuMC4xJywgQHBvcnQpXG4gICAgIyBAc2VydmVyLmxpc3RlblxuXG4gIG9wZW5BcHA6ICgpID0+XG4gICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJyxcbiAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgYm91bmRzOlxuICAgICAgICB3aWR0aDo1MDBcbiAgICAgICAgaGVpZ2h0OjgwMCxcbiAgICAod2luKSA9PlxuICAgICAgQGFwcFdpbmRvdyA9IHdpbilcblxuICBzZXRSZWRpcmVjdDogKCkgPT5cbiAgICB1bmRlZmluZWRcbiAgc2hvdyA9IC0+ICMganNoaW50IC1XMDIxXG4gICAgaWYgd2luZG93LmNvbnNvbGVcbiAgICAgIGlmIEZ1bmN0aW9uOjpiaW5kXG4gICAgICAgIGxvZyA9IEZ1bmN0aW9uOjpiaW5kLmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUpXG4gICAgICBlbHNlXG4gICAgICAgIGxvZyA9IC0+XG4gICAgICAgICAgRnVuY3Rpb246OmFwcGx5LmNhbGwgY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50c19cbiAgICAgICAgICByZXR1cm5cbiAgICAgIGxvZy5hcHBseSB0aGlzLCBhcmd1bWVudHNfXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvblxuIiwiIyBnZXRHbG9iYWwgPSAtPlxuIyAgIF9nZXRHbG9iYWwgPSAtPlxuIyAgICAgdGhpc1xuXG4jICAgX2dldEdsb2JhbCgpXG5cbiMgcm9vdCA9IGdldEdsb2JhbCgpXG5cbiMgcm9vdC5hcHAgPSBhcHAgPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuIyBhcHAgPSBuZXcgbGliLkFwcGxpY2F0aW9uXG5cbkFwcGxpY2F0aW9uID0gcmVxdWlyZSAnLi4vLi4vY29tbW9uLmNvZmZlZSdcblxuY2xhc3MgRXh0QmFja2dyb3VuZCBleHRlbmRzIEFwcGxpY2F0aW9uXG4gICAgdXJsczoge31cbiAgICB1cmxBcnI6IFtdXG4gICAgb3JpZ2luczoge31cbiAgICBpc09uOiB7fVxuICAgIGZpbGVzOiB7fVxuICAgIGV4dFBvcnQ6IHt9XG4gICAgY3VycmVudFRhYklkOm51bGxcbiAgICBtYXBzOiBbXVxuXG4gICAgaW5pdDogKCkgLT5cbiAgICAgICAgY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyICh0YWJJZCkgPT5cbiAgICAgICAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJJZFxuICAgICAgICAgICAgQHVwZGF0ZUljb24odGFiSWQpIGlmIG5vdCBAaXNPblt0YWJJZF0/XG5cbiAgICAgICAgQExJU1RFTi5Mb2NhbCAncmVzb3VyY2VzJywgKHJlc291cmNlcykgPT5cbiAgICAgICAgICAgIHVuZGVmaW5lZFxuXG4gICAgICAgIEBMSVNURU4uRXh0ICdyZWRpckluZm8nLCAocmVkKSA9PlxuICAgICAgICAgICAgQG1hcHM9cmVkLm1hcHNcbiAgICAgICAgICAgIEBzZXJ2ZXI9cmVkLnNlcnZlclxuXG4gICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lciAodGFiKSA9PlxuICAgICAgICAgICAgaWYgbm90IEBpc09uW3RhYi5pZF1cbiAgICAgICAgICAgICAgICBAaXNPblt0YWIuaWRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlIHRhYi5pZCwgJ2dldFJlc291cmNlcyc6dHJ1ZSwgKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgICAgICAgICBAbGF1bmNoQXBwKClcbiAgICAgICAgICAgICAgICAgICAgQE1TRy5FeHQgJ3Jlc291cmNlcyc6cmVzcG9uc2UucmVzb3VyY2VzXG4gICAgICAgICAgICAgICAgICAgICMgQGluaXRSZWRpcmVjdHMoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBpc09uW3RhYi5pZF0gPSBpZiBub3QgQGlzT25bdGFiLmlkXT8gdGhlbiB0cnVlIGVsc2UgIUBpc09uW3RhYi5pZF1cbiAgICAgICAgICAgICAgICBAa2lsbFJlZGlyZWN0cygpXG5cbiAgICAgICAgICAgIEB1cGRhdGVJY29uIHRhYi5pZFxuXG4gICAgZ2V0U2VydmVyOiAoKSAtPlxuXG4gICAga2lsbFJlZGlyZWN0czogKCkgLT5cbiAgICAgICAgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVSZXF1ZXN0LnJlbW92ZUxpc3RlbmVyKClcblxuICAgIGluaXRSZWRpcmVjdHM6ICgpID0+XG4gICAgICAgIHJldHVybiBpZiBAbWFwcy5sZW5ndGggaXMgMFxuICAgICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QuYWRkTGlzdGVuZXIgQHJlZGlyZWN0TGlzdGVuZXIsXG4gICAgICAgICAgICB1cmxzOlsnPGFsbF91cmxzPiddXG4gICAgICAgICAgICB0YWJJZDpAY3VycmVudFRhYklkLFxuICAgICAgICAgICAgWydibG9ja2luZyddXG5cbiAgICAgICAgIyBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVNlbmRIZWFkZXJzLmFkZExpc3RlbmVyIEBoZWFkZXJMaXN0ZW5lcixcbiAgICAgICAgIyAgICAgdXJsczpbJzxhbGxfdXJscz4nXVxuICAgICAgICAjICAgICB0YWJJZDpAY3VycmVudFRhYklkLFxuICAgICAgICAjICAgICBbJ3JlcXVlc3RIZWFkZXJzJ11cblxuICAgICAgICAjIGNocm9tZS53ZWJSZXF1ZXN0Lm9uSGVhZGVyc1JlY2VpdmVkLmFkZExpc3RlbmVyICgoZGV0YWlscykgPT4gQHJlZGlyZWN0TGlzdGVuZXIoZGV0YWlscykpLFxuICAgICAgICAjICAgICB1cmxzOlsnPGFsbF91cmxzPiddXG4gICAgICAgICMgICAgIHRhYklkOkBjdXJyZW50VGFiSWQsXG4gICAgICAgICMgICAgIFsnYmxvY2tpbmcnLCdyZXNwb25zZUhlYWRlcnMnXVxuXG5cbiAgICBtYXRjaDogKHVybCkgLT5cbiAgICAgICAgcmV0dXJuIG1hcCBmb3IgbWFwIGluIEBtYXBzIHdoZW4gdXJsLm1hdGNoKG1hcC51cmwpPyBhbmQgbWFwLnVybD9cbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgIGhlYWRlckxpc3RlbmVyOiAoZGV0YWlscykgLT5cbiAgICAgICAgc2hvdyBkZXRhaWxzXG5cbiAgICByZWRpcmVjdExpc3RlbmVyOiAoZGV0YWlscykgPT5cbiAgICAgICAgc2hvdyBkZXRhaWxzXG4gICAgICAgIG1hcCA9IEBtYXRjaCBkZXRhaWxzLnVybFxuICAgICAgICBpZiBtYXA/XG4gICAgICAgICAgICBzaG93ICdyZWRpcmVjdGVkIHRvICcgKyBAc2VydmVyLnVybCArIGVuY29kZVVSSUNvbXBvbmVudChkZXRhaWxzLnVybClcbiAgICAgICAgICAgIHJldHVybiByZWRpcmVjdFVybDogQHNlcnZlci51cmwgKyBlbmNvZGVVUklDb21wb25lbnQoZGV0YWlscy51cmwpICNkZXRhaWxzLnVybC5yZXBsYWNlKG5ldyBSZWdFeHAobWFwLnVybCksIG1hcC5yZWdleFJlcGwpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB7fVxuICAgIyB7XG4jICAgICAgICAgICAgICAgICAgICAgdXJsczogW2tleV0sXG4jICAgICAgICAgICAgICAgICAgICAgdGFiSWQ6IHRhYklkXG4jICAgICAgICAgICAgICAgICB9LFxuIyAgICAgICAgICAgICAgICAgW1wiYmxvY2tpbmdcIl1cbiAgICAgICAgIyBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVNlbmRIZWFkZXJzLmFkZExpc3RlbmVyKFxuICAgICAgICAjICAgICAgICAgKGZ1bmN0aW9uKF9rZXksIF90eXBlKSB7XG4gICAgICAgICMgICAgICAgICAgICAgaWYodXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnMgPT0gdW5kZWZpbmVkKSB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9ucyA9IHt9O1xuICAgICAgICAjICAgICAgICAgICAgIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zW190eXBlXSA9IChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgIyAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRldGFpbHMpIHtcbiAgICAgICAgIyAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoZWFkZXJSZXF1ZXN0TGlzdGVuZXIoZGV0YWlscywga2V5KTtcbiAgICAgICAgIyAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgIyAgICAgICAgICAgICB9KGtleSkpO1xuICAgICAgICAjICAgICAgICAgICAgIHJldHVybiB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tfdHlwZV07XG4gICAgICAgICMgICAgICAgICB9KGtleSwgJ29uQmVmb3JlU2VuZEhlYWRlcnMnKSksXG4gICAgICAgICMgICAgICAgICB7XG4gICAgICAgICMgICAgICAgICAgICAgdXJsczogW1wiPGFsbF91cmxzPlwiXSxcbiAgICAgICAgIyAgICAgICAgICAgICB0YWJJZDogdGFiSWRcbiAgICAgICAgIyAgICAgICAgIH0sXG4gICAgICAgICMgICAgICAgICBbXCJyZXF1ZXN0SGVhZGVyc1wiXVxuICAgICAgICAjICAgICApO1xuXG5cbiAgICB1cGRhdGVJY29uOiAodGFiSWQpID0+XG4gICAgICAgIGlmIEBpc09uW3RhYklkXVxuICAgICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0SWNvbihcbiAgICAgICAgICAgICAgICBwYXRoOlxuICAgICAgICAgICAgICAgICAgICAnMTknOidpbWFnZXMvcmVkaXItb24tMTkucG5nJ1xuICAgICAgICAgICAgICAgICAgICAnMzgnOidpbWFnZXMvcmVkaXItb24tMzgucG5nJyxcbiAgICAgICAgICAgICAgICB0YWJJZDp0YWJJZFxuICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRJY29uKFxuICAgICAgICAgICAgICAgIHBhdGg6XG4gICAgICAgICAgICAgICAgICAgICcxOSc6J2ltYWdlcy9yZWRpci1vZmYtMTkucG5nJ1xuICAgICAgICAgICAgICAgICAgICAnMzgnOidpbWFnZXMvcmVkaXItb2ZmLTM4LnBuZycsXG4gICAgICAgICAgICAgICAgdGFiSWQ6dGFiSWRcbiAgICAgICAgICAgIClcblxuc2VuZFJlc291cmNlcyA9IChyZXNvdXJjZXMpIC0+XG4gICAgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShhcHBJZCxyZXNvdXJjZXM6cmVzb3VyY2VzKVxuXG5hcHAgPSBuZXcgRXh0QmFja2dyb3VuZFxuICAgICMgY2hyb21lLnRhYnMucmVsb2FkIHRhYi5pZFxuXG5cbiMgdmFyIGFkZExpc3RlbmVyczIgPSBmdW5jdGlvbigpIHtcbiMgICAgIHZhciBydWxlMSA9IHtcbiMgICAgICAgICBwcmlvcml0eTogMTAwLFxuIyAgICAgICAgIGNvbmRpdGlvbnM6IFtcbiMgICAgICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlcXVlc3RNYXRjaGVyKHtcbiMgICAgICAgICAgICAgICB1cmw6IHsgcGF0aENvbnRhaW5zOiAncmVzb3VyY2UnIH0sXG4jICAgICAgICAgICAgICAgICBzdGFnZXM6IFtcIm9uQmVmb3JlUmVxdWVzdFwiLCBcIm9uQmVmb3JlU2VuZEhlYWRlcnNcIiwgXCJvbkhlYWRlcnNSZWNlaXZlZFwiLCBcIm9uQXV0aFJlcXVpcmVkXCJdXG4jICAgICAgICAgICAgIH0pXG4jICAgICAgICAgXSxcbiMgICAgICAgICBhY3Rpb25zOiBbXG4jICAgICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZWRpcmVjdFJlcXVlc3Qoe1xuIyAgICAgICAgICAgICByZWRpcmVjdFVybDonY2hyb21lLWV4dGVuc2lvbjovL3BtZ25uYmRmbW1wZGtnYWFta2RpaXBmZ2picGdpb2ZjL3JlZGlyZWN0b3InXG4jICAgICAgICAgICB9KSxcbiMgICAgICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlNlbmRNZXNzYWdlVG9FeHRlbnNpb24oe21lc3NhZ2U6IFwiXCJ9KVxuIyAgICAgICAgIF1cbiMgICAgICAgfTtcbiMgdmFyIHJ1bGUyID0ge1xuIyAgICAgICAgIHByaW9yaXR5OiAxLFxuIyAgICAgICAgIGNvbmRpdGlvbnM6IFtcbiMgICAgICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlcXVlc3RNYXRjaGVyKHtcbiMgICAgICAgICAgICAgICB1cmw6IHsgcGF0aENvbnRhaW5zOiAncmVkaXJlY3RvcicgfVxuIyAgICAgICAgICAgICB9KVxuIyAgICAgICAgIF0sXG4jICAgICAgICAgYWN0aW9uczogW1xuIyAgICAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuUmVkaXJlY3RSZXF1ZXN0KHtcbiMgICAgICAgICAgICAgcmVkaXJlY3RVcmw6J2ZpbGU6Ly8vVXNlcnMvZGFuaWVsL0Ryb3Bib3gvZGV2L01hdmVuc01hdGUvM2RlbW8vc3JjL3BhY2thZ2UueG1sJ1xuIyAgICAgICAgICAgfSksXG4jICAgICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5TZW5kTWVzc2FnZVRvRXh0ZW5zaW9uKHttZXNzYWdlOiBcIlwifSlcbiMgICAgICAgICBdXG4jICAgICAgIH07XG4jICAgICAgIC8vIHZhciBydWxlMiA9IHtcbiMgICAgICAgLy8gICBwcmlvcml0eTogMTAwMCxcbiMgICAgICAgLy8gICBjb25kaXRpb25zOiBbXG4jICAgICAgIC8vICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZXF1ZXN0TWF0Y2hlcih7XG4jICAgICAgIC8vICAgICAgIHVybDogeyBob3N0U3VmZml4OiAnLm15c2VydmVyLmNvbScgfSB9KVxuIyAgICAgICAvLyAgIF0sXG4jICAgICAgIC8vICAgYWN0aW9uczogW1xuIyAgICAgICAvLyAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuSWdub3JlUnVsZXMoe1xuIyAgICAgICAvLyAgICAgICBsb3dlclByaW9yaXR5VGhhbjogMTAwMCB9KVxuIyAgICAgICAvLyAgIF1cbiMgICAgICAgLy8gfTtcbiMgICAgICAgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5vblJlcXVlc3QuYWRkUnVsZXMoW3J1bGUxLCBydWxlMl0pO1xuXG4jIH1cblxuIyBjaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24odGFiKSB7XG4jICAgICBpc09uW3RhYi5pZF0gPSBpc09uW3RhYi5pZF0gPT0gdW5kZWZpbmVkID8gdHJ1ZSA6ICFpc09uW3RhYi5pZF07XG4jICAgICB1cGRhdGVJY29uKHRhYi5pZCk7XG4jICAgICBjaHJvbWUudGFicy5yZWxvYWQodGFiLmlkKTtcbiMgfSk7XG5cbiMgdmFyIHVwZGF0ZUljb24gPSBmdW5jdGlvbih0YWJJZCkge1xuIyAgICAgaWYgKGlzT25bdGFiSWRdID09IHRydWUpIHtcbiMgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRJY29uKHtwYXRoOnsnMTknOidpbWFnZXMvcmVkaXItb24tMTkucG5nJywgJzM4JzonaW1hZ2VzL3JlZGlyLW9uLTM4LnBuZyd9LCB0YWJJZDp0YWJJZH0pO1xuIyAgICAgICAgIC8vIGNvbnZlcnRGaWxlUmVzb3VyY2VzVG9EYXRhKCk7XG4jICAgICAgICAgLy8gYWRkTGlzdGVuZXJzKHRhYklkKTtcbiMgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShhcHBJZCx7b3BlbkRpcmVjdG9yeTp0cnVlfSk7XG4jICAgICB9XG4jICAgICBlbHNlXG4jICAgICB7XG4jICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0SWNvbih7cGF0aDp7JzE5JzonaW1hZ2VzL3JlZGlyLW9mZi0xOS5wbmcnLCAnMzgnOidpbWFnZXMvcmVkaXItb2ZmLTM4LnBuZyd9LCB0YWJJZDp0YWJJZH0pO1xuIyAgICAgICAgIHJlbW92ZUxpc3RlbmVycyh0YWJJZCk7XG4jICAgICB9XG4jIH1cblxuIyBjaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24odGFiSWQpIHtcbiMgICAgIGlmKGlzT25bdGFiSWRdICE9IHVuZGVmaW5lZCkge1xuIyAgICAgICAgIHVwZGF0ZUljb24odGFiSWQpO1xuIyAgICAgfVxuIyB9KTtcblxuIyBjaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoZGV0YWlscykge1xuIyAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoICAgIHtcbiMgICAgICAgICB1cmxzOiB7XG4jICAgICAgICAgICAgICAgICBcImh0dHBzOi8vKi5zYWxlc2ZvcmNlLmNvbS9yZXNvdXJjZS8qXCI6IHtcbiMgICAgICAgICAgICAgICAgICAgICByZWdleDogJ2h0dHBzLipcXC9yZXNvdXJjZShcXC9bMC05XSspP1xcLyhbQS1aYS16MC05XFwtLl9dK1xcLyk/JyxcbiMgICAgICAgICAgICAgICAgICAgICByZWdyZXBsYWNlOiAnaHR0cDovL2xvY2FsaG9zdDo5MDAwLydcbiMgICAgICAgICAgICAgICAgIH0sXG4jICAgICAgICAgICAgICAgICBcImh0dHBzOi8vKi5mb3JjZS5jb20vcmVzb3VyY2UvKlwiOiB7XG4jICAgICAgICAgICAgICAgICAgICAgcmVnZXg6ICdodHRwcy4qXFwvcmVzb3VyY2UoXFwvWzAtOV0rKT9cXC8oW0EtWmEtejAtOVxcLS5fXStcXC8pPycsXG4jICAgICAgICAgICAgICAgICAgICAgcmVncmVwbGFjZTogJ2h0dHA6Ly9sb2NhbGhvc3Q6OTAwMC8nXG4jICAgICAgICAgICAgICAgICB9XG5cbiMgICAgICAgICB9XG4jICAgICB9KTtcbiMgfSk7XG5cbiMgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKGZ1bmN0aW9uKGNoYW5nZXMsIG5hbWVzcGFjZSkge1xuXG4jICAgICBpZihuYW1lc3BhY2UgIT0gJ3N5bmMnKSByZXR1cm47XG5cbiMgICAgIGZvciAoa2V5IGluIGNoYW5nZXMpIHtcbiMgICAgICAgICAgIHZhciBzdG9yYWdlQ2hhbmdlID0gY2hhbmdlc1trZXldO1xuIyAgICAgICAgICAgaWYoa2V5ID09ICd1cmxzJykge1xuIyAgICAgICAgICAgICB1cmxzID0gc3RvcmFnZUNoYW5nZS5uZXdWYWx1ZTtcbiMgICAgICAgICAgICAgdXJsQXJyLmxlbmd0aCA9IDA7XG4jICAgICAgICAgICAgIGZvcih2YXIga2V5IGluIHVybHMpIHtcbiMgICAgICAgICAgICAgICAgIHVybEFyci5wdXNoKGtleSk7XG4jICAgICAgICAgICAgIH1cbiMgICAgICAgICAgIH1cbiMgICAgICAgICB9XG4jIH0pO1xuXG4jIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KGZ1bmN0aW9uKG9wdCkge1xuIyAgICAgdXJscyA9IG9wdC51cmxzO1xuIyAgICAgdXJsQXJyLmxlbmd0aCA9IDA7XG4jICAgICBmb3IodmFyIGtleSBpbiB1cmxzKSB7XG4jICAgICAgICAgdXJsQXJyLnB1c2goa2V5KTtcbiMgICAgIH1cbiMgfSlcblxuIyBjaHJvbWUucnVudGltZS5vbkNvbm5lY3QuYWRkTGlzdGVuZXIoZnVuY3Rpb24ocG9ydCkge1xuXG4jIH0pO1xuXG5cblxuXG5cblxuIyB2YXIgY29udmVydEZpbGVSZXNvdXJjZXNUb0RhdGEgPSBmdW5jdGlvbigpIHtcbiMgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHt9LCBmdW5jdGlvbigpIHtcblxuIyAgICAgfSk7XG4jIH1cblxuXG4jIHZhciBoZWFkZXJSZXF1ZXN0TGlzdGVuZXIgPSBmdW5jdGlvbihkZXRhaWxzLCBrZXkpe1xuXG4jICAgICB2YXIgZmxhZyA9IGZhbHNlLFxuIyAgICAgICAgIHJ1bGUgPSB7XG4jICAgICAgICAgICAgIG5hbWU6IFwiT3JpZ2luXCIsXG4jICAgICAgICAgICAgIHZhbHVlOiBcImh0dHA6Ly9ldmlsLmNvbS9cIlxuIyAgICAgICAgIH07XG5cbiMgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGV0YWlscy5yZXF1ZXN0SGVhZGVycy5sZW5ndGg7ICsraSkge1xuIyAgICAgICAgIGlmIChkZXRhaWxzLnJlcXVlc3RIZWFkZXJzW2ldLm5hbWUgPT09IHJ1bGUubmFtZSkge1xuIyAgICAgICAgICAgICBmbGFnID0gdHJ1ZTtcbiMgICAgICAgICAgICAgb3JpZ2luc1tkZXRhaWxzLnJlcXVlc3RJZF0gPSBkZXRhaWxzLnJlcXVlc3RIZWFkZXJzW2ldLnZhbHVlO1xuIyAgICAgICAgICAgICBkZXRhaWxzLnJlcXVlc3RIZWFkZXJzW2ldLnZhbHVlID0gcnVsZS52YWx1ZTtcbiMgICAgICAgICAgICAgYnJlYWs7XG4jICAgICAgICAgfVxuIyAgICAgfVxuIyAgICAgaWYoIWZsYWcpIGRldGFpbHMucmVxdWVzdEhlYWRlcnMucHVzaChydWxlKTtcbiMgICAgIHJldHVybiB7cmVxdWVzdEhlYWRlcnM6IGRldGFpbHMucmVxdWVzdEhlYWRlcnN9O1xuIyB9O1xuIyB2YXIgaGVhZGVyUmVzcG9uc2VMaXN0ZW5lciA9IGZ1bmN0aW9uKGRldGFpbHMsIGtleSl7XG5cbiMgICAgIGlmKG9yaWdpbnNbZGV0YWlscy5yZXF1ZXN0SWRdICE9IHVuZGVmaW5lZCkge1xuIyAgICAgICAgIHZhciBydWxlID0ge1xuIyAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsXG4jICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IG9yaWdpbnNbZGV0YWlscy5yZXF1ZXN0SWRdXG4jICAgICAgICAgICAgIH07XG5cbiMgICAgICAgICBkZXRhaWxzLnJlc3BvbnNlSGVhZGVycy5wdXNoKHJ1bGUpO1xuIyAgICAgICAgIGRldGFpbHMucmVzcG9uc2VIZWFkZXJzLnB1c2goe1xuIyAgICAgICAgICAgICBcIm5hbWVcIjpcIkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCIsXG4jICAgICAgICAgICAgIFwidmFsdWVcIjpcInRydWVcIlxuIyAgICAgICAgIH0pO1xuIyAgICAgICAgIGRlbGV0ZSBvcmlnaW5zW2RldGFpbHMucmVxdWVzdElkXTtcbiMgICAgIH1cblxuIyAgICAgcmV0dXJuIHtyZXNwb25zZUhlYWRlcnM6IGRldGFpbHMucmVzcG9uc2VIZWFkZXJzfTtcbiMgfTtcblxuIyB2YXIgYmVmb3JlUmVxdWVzdExpc3RlbmVyID0gZnVuY3Rpb24oZGV0YWlscywga2V5KSB7XG5cbiMgICAgIHZhciByZSA9IG5ldyBSZWdFeHAodXJsc1trZXldLnJlZ2V4KTtcbiMgICAgIHZhciByZXBsID0gdXJsc1trZXldLnJlZ3JlcGxhY2U7XG5cbiMgICAgIGlmKGRldGFpbHMudXJsLm1hdGNoKHJlKSA9PSBudWxsKSByZXR1cm4ge307XG5cbiMgICAgIHJldHVybiB7XG4jICAgICAgICAgcmVkaXJlY3RVcmw6IGRldGFpbHMudXJsLnJlcGxhY2UocmUsIHJlcGwpXG4jICAgICB9O1xuIyB9XG5cbiMgZnVuY3Rpb24gY3JlYXRlTGlzdGVuZXIoa2V5LCBsaXN0ZW5lckZ1bmN0aW9uLCBsaXN0ZW5lcktleSkge1xuIyAgICAgdXJsc1trZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tsaXN0ZW5lcktleV0gPSBmdW5jdGlvbihkZXRhaWxzKSB7IHJldHVybiBsaXN0ZW5lckZ1bmN0aW9uKCkgfTtcbiMgICAgIHJldHVybiB1cmxzW2tleV0uX2xpc3RlbmVyRnVuY3Rpb25bbGlzdGVuZXJLZXldO1xuIyB9XG5cbiMgdmFyIGFkZExpc3RlbmVyczEgPSBmdW5jdGlvbih0YWJJZCkge1xuIyAgICAgcmVtb3ZlTGlzdGVuZXJzKCk7XG4jICAgICBmb3IodmFyIGtleSBpbiB1cmxzKSB7XG5cbiMgICAgICAgICBpZih1cmxzW2tleV0uY29ycyAhPSB1bmRlZmluZWQgJiYgdXJsc1trZXldLmNvcnMgPT0gdHJ1ZSkge1xuIyAgICAgICAgICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVNlbmRIZWFkZXJzLmFkZExpc3RlbmVyKFxuIyAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9rZXksIF90eXBlKSB7XG4jICAgICAgICAgICAgICAgICAgICAgaWYodXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnMgPT0gdW5kZWZpbmVkKSB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9ucyA9IHt9O1xuIyAgICAgICAgICAgICAgICAgICAgIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zW190eXBlXSA9IChmdW5jdGlvbihrZXkpIHtcbiMgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRldGFpbHMpIHtcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoZWFkZXJSZXF1ZXN0TGlzdGVuZXIoZGV0YWlscywga2V5KTtcbiMgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiMgICAgICAgICAgICAgICAgICAgICB9KGtleSkpO1xuIyAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tfdHlwZV07XG4jICAgICAgICAgICAgICAgICB9KGtleSwgJ29uQmVmb3JlU2VuZEhlYWRlcnMnKSksXG4jICAgICAgICAgICAgICAgICB7XG4jICAgICAgICAgICAgICAgICAgICAgdXJsczogW1wiPGFsbF91cmxzPlwiXSxcbiMgICAgICAgICAgICAgICAgICAgICB0YWJJZDogdGFiSWRcbiMgICAgICAgICAgICAgICAgIH0sXG4jICAgICAgICAgICAgICAgICBbXCJyZXF1ZXN0SGVhZGVyc1wiXVxuIyAgICAgICAgICAgICApO1xuXG4jICAgICAgICAgICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uSGVhZGVyc1JlY2VpdmVkLmFkZExpc3RlbmVyKFxuIyAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9rZXksIF90eXBlKSB7XG4jICAgICAgICAgICAgICAgICAgICAgaWYodXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnMgPT0gdW5kZWZpbmVkKSB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9ucyA9IHt9O1xuIyAgICAgICAgICAgICAgICAgICAgIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zW190eXBlXSA9IChmdW5jdGlvbihrZXkpIHtcbiMgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRldGFpbHMpIHtcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoZWFkZXJSZXNwb25zZUxpc3RlbmVyKGRldGFpbHMsIGtleSk7XG4jICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4jICAgICAgICAgICAgICAgICAgICAgfShrZXkpKTtcbiMgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbX3R5cGVdO1xuIyAgICAgICAgICAgICAgICAgfShrZXksICdvbkhlYWRlcnNSZWNlaXZlZCcpKSxcbiMgICAgICAgICAgICAgICAgIHtcbiMgICAgICAgICAgICAgICAgICAgICB1cmxzOiBbXCI8YWxsX3VybHM+XCJdLFxuIyAgICAgICAgICAgICAgICAgICAgIHRhYklkOiB0YWJJZFxuIyAgICAgICAgICAgICAgICAgfSxcbiMgICAgICAgICAgICAgICAgIFtcImJsb2NraW5nXCIsIFwicmVzcG9uc2VIZWFkZXJzXCJdXG4jICAgICAgICAgICAgICk7XG4jICAgICAgICAgfVxuXG4jICAgICAgICAgaWYodXJsc1trZXldLnJlZ2V4ICE9IHVuZGVmaW5lZCAmJiB1cmxzW2tleV0ucmVnZXgubGVuZ3RoID4gMCkge1xuIyAgICAgICAgICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QuYWRkTGlzdGVuZXIoXG4jICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX2tleSwgX3R5cGUpIHtcbiMgICAgICAgICAgICAgICAgICAgICBpZih1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9ucyA9PSB1bmRlZmluZWQpIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zID0ge307XG4jICAgICAgICAgICAgICAgICAgICAgdXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbX3R5cGVdID0gKGZ1bmN0aW9uKGtleSkge1xuIyAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGV0YWlscykge1xuIyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlZm9yZVJlcXVlc3RMaXN0ZW5lcihkZXRhaWxzLCBrZXkpO1xuIyAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuIyAgICAgICAgICAgICAgICAgICAgIH0oa2V5KSk7XG4jICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zW190eXBlXTtcbiMgICAgICAgICAgICAgICAgIH0oa2V5LCAnb25CZWZvcmVSZXF1ZXN0JykpLFxuIyAgICAgICAgICAgICAgICAge1xuIyAgICAgICAgICAgICAgICAgICAgIHVybHM6IFtrZXldLFxuIyAgICAgICAgICAgICAgICAgICAgIHRhYklkOiB0YWJJZFxuIyAgICAgICAgICAgICAgICAgfSxcbiMgICAgICAgICAgICAgICAgIFtcImJsb2NraW5nXCJdXG4jICAgICAgICAgICAgICk7XG4jICAgICAgICAgfVxuXG4jICAgICB9XG4jIH1cblxuIyB2YXIgcmVtb3ZlTGlzdGVuZXJzID0gZnVuY3Rpb24odGFiSWQpIHtcbiMgICAgIGZvcih2YXIga2V5IGluIHVybHMpIHtcbiMgICAgICAgICBmb3IodmFyIGxrZXkgaW4gdXJsc1trZXldLl9saXN0ZW5lckZ1bmN0aW9ucykge1xuIyAgICAgICAgICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QucmVtb3ZlTGlzdGVuZXIodXJsc1trZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tsa2V5XSk7XG4jICAgICAgICAgICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uSGVhZGVyc1JlY2VpdmVkLnJlbW92ZUxpc3RlbmVyKHVybHNba2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbbGtleV0pO1xuIyAgICAgICAgICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVNlbmRIZWFkZXJzLnJlbW92ZUxpc3RlbmVyKHVybHNba2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbbGtleV0pO1xuIyAgICAgICAgIH1cbiMgICAgIH1cbiMgfVxuXG5cbiMgLy8gdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuIyAvLyB4aHIub3BlbignR0VUJywgJ2ZpbGU6Ly8vVXNlcnMvZGFuaWVsL0Ryb3Bib3gvZGV2L01hdmVuc01hdGUvM2RlbW8vc3JjL3BhY2thZ2UueG1sJywgdHJ1ZSk7XG4jIC8vIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4jIC8vIHhoci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG4jIC8vICAgYnRvYShTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5ldyBVaW50OEFycmF5KHRoaXMucmVzcG9uc2UpKTtcbiMgLy8gfTtcblxuIyAvLyB4aHIuc2VuZCgpO1xuXG5cblxuIl19
