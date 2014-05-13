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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL2Rldi9yZWRpcmVjdG9yL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbmllbC9kZXYvcmVkaXJlY3Rvci9jb21tb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcmVkaXJlY3Rvci9leHRlbnNpb24vc3JjL2JhY2tncm91bmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQ0EsSUFBQSxvRUFBQTtFQUFBLGtGQUFBOztBQUFBLENBQUMsU0FBQSxHQUFBO0FBQ0MsTUFBQSxhQUFBO0FBQUEsRUFBQSxPQUFBLEdBQVUsQ0FDUixRQURRLEVBQ0UsT0FERixFQUNXLE9BRFgsRUFDb0IsT0FEcEIsRUFDNkIsS0FEN0IsRUFDb0MsUUFEcEMsRUFDOEMsT0FEOUMsRUFFUixXQUZRLEVBRUssT0FGTCxFQUVjLGdCQUZkLEVBRWdDLFVBRmhDLEVBRTRDLE1BRjVDLEVBRW9ELEtBRnBELEVBR1IsY0FIUSxFQUdRLFNBSFIsRUFHbUIsWUFIbkIsRUFHaUMsT0FIakMsRUFHMEMsTUFIMUMsRUFHa0QsU0FIbEQsRUFJUixXQUpRLEVBSUssT0FKTCxFQUljLE1BSmQsQ0FBVixDQUFBO0FBQUEsRUFLQSxJQUFBLEdBQU8sU0FBQSxHQUFBO0FBRUwsUUFBQSxxQkFBQTtBQUFBO1NBQUEsOENBQUE7c0JBQUE7VUFBd0IsQ0FBQSxPQUFTLENBQUEsQ0FBQTtBQUMvQixzQkFBQSxPQUFRLENBQUEsQ0FBQSxDQUFSLEdBQWEsS0FBYjtPQURGO0FBQUE7b0JBRks7RUFBQSxDQUxQLENBQUE7QUFVQSxFQUFBLElBQUcsK0JBQUg7V0FDRSxNQUFNLENBQUMsSUFBUCxHQUFjLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQXhCLENBQTZCLE9BQU8sQ0FBQyxH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LCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE3NDIwOTNcbigoKSAtPlxuICBtZXRob2RzID0gW1xuICAgICdhc3NlcnQnLCAnY2xlYXInLCAnY291bnQnLCAnZGVidWcnLCAnZGlyJywgJ2RpcnhtbCcsICdlcnJvcicsXG4gICAgJ2V4Y2VwdGlvbicsICdncm91cCcsICdncm91cENvbGxhcHNlZCcsICdncm91cEVuZCcsICdpbmZvJywgJ2xvZycsXG4gICAgJ21hcmtUaW1lbGluZScsICdwcm9maWxlJywgJ3Byb2ZpbGVFbmQnLCAndGFibGUnLCAndGltZScsICd0aW1lRW5kJyxcbiAgICAndGltZVN0YW1wJywgJ3RyYWNlJywgJ3dhcm4nXVxuICBub29wID0gKCkgLT5cbiAgICAjIHN0dWIgdW5kZWZpbmVkIG1ldGhvZHMuXG4gICAgZm9yIG0gaW4gbWV0aG9kcyAgd2hlbiAgIWNvbnNvbGVbbV1cbiAgICAgIGNvbnNvbGVbbV0gPSBub29wXG5cbiAgaWYgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQ/XG4gICAgd2luZG93LnNob3cgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlKVxuICBlbHNlXG4gICAgd2luZG93LnNob3cgPSAoKSAtPlxuICAgICAgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cylcbikoKVxuXG5jbGFzcyBNU0dcbiAgaXNDb250ZW50U2NyaXB0OiBsb2NhdGlvbi5wcm90b2NvbCBpc250ICdjaHJvbWUtZXh0ZW5zaW9uOidcbiAgY29uc3RydWN0b3I6IChjb25maWcpIC0+XG4gICAgQGNvbmZpZyA9IGNvbmZpZ1xuICBMb2NhbDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgc2hvdyBcIj09IE1FU1NBR0UgI3sgSlNPTi5zdHJpbmdpZnkgbWVzc2FnZSB9ID09PlwiXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgbWVzc2FnZSwgcmVzcG9uZFxuICBFeHQ6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIHNob3cgXCI9PSBNRVNTQUdFICN7IEpTT04uc3RyaW5naWZ5IG1lc3NhZ2UgfSA9PT5cIlxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIEBjb25maWcuRVhUX0lELCBtZXNzYWdlLCByZXNwb25kXG5cbmNsYXNzIExJU1RFTlxuICBsb2NhbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZVxuICAgIGxpc3RlbmVyczp7fVxuICBleHRlcm5hbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsXG4gICAgbGlzdGVuZXJzOnt9XG4gIGNvbnN0cnVjdG9yOiAoY29uZmlnKSAtPlxuICAgIEBjb25maWcgPSBjb25maWdcbiAgICBAbG9jYWwuYXBpLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlXG4gICAgQGV4dGVybmFsLmFwaT8uYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gIExvY2FsOiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgQGxvY2FsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgRXh0OiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgX29uTWVzc2FnZUV4dGVybmFsOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgc2hvdyBcIjw9PSBFWFRFUk5BTCBNRVNTQUdFID09ICN7IEBjb25maWcuRVhUX1RZUEUgfSA9PVwiICsgcmVxdWVzdFxuICAgIGlmIHNlbmRlci5pZCBpc250IEBjb25maWcuRVhUX0lEIHRoZW4gcmV0dXJuIHVuZGVmaW5lZFxuICAgIEBleHRlcm5hbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBzZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG5cbiAgX29uTWVzc2FnZTogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHNob3cgXCI8PT0gTUVTU0FHRSA9PSAjeyBAY29uZmlnLkVYVF9UWVBFIH0gPT1cIiArIHJlcXVlc3RcbiAgICBAbG9jYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuXG5jbGFzcyBEYXRhXG4gIG1hcHBpbmc6W1xuICAgIGRpcmVjdG9yeTpudWxsXG4gICAgdXJsUGF0dGVybjpudWxsXG4gIF1cbiAgcmVzb3VyY2VzOltcbiAgICByZXNvdXJjZTpudWxsXG4gICAgZmlsZTpudWxsXG4gIF1cblxuXG5cbmNsYXNzIFN0b3JhZ2VcbiAgYXBpOiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICBkYXRhOiB7fVxuICBjYWxsYmFjazogKCkgLT5cbiAgY29uc3RydWN0b3I6IChjYWxsYmFjaykgLT5cbiAgICBAY2FsbGJhY2sgPSBjYWxsYmFja1xuICAgIEByZXRyaWV2ZUFsbCgpXG4gICAgQG9uQ2hhbmdlZEFsbCgpXG5cbiAgc2F2ZTogKGtleSwgaXRlbSkgLT5cbiAgICBvYmogPSB7fVxuICAgIG9ialtrZXldID0gaXRlbVxuICAgIEBhcGkuc2V0IG9ialxuXG4gIHNhdmVBbGw6ICgpIC0+XG4gICAgQGFwaS5zZXQgQGRhdGFcblxuICByZXRyaWV2ZTogKGtleSwgY2IpIC0+XG4gICAgQGFwaS5nZXQga2V5LCAocmVzdWx0cykgLT5cbiAgICAgIEBkYXRhW3JdID0gcmVzdWx0c1tyXSBmb3IgciBvZiByZXN1bHRzXG4gICAgICBpZiBjYj8gdGhlbiBjYiByZXN1bHRzW2tleV1cblxuXG4gIHJldHJpZXZlQWxsOiAoY2IpIC0+XG4gICAgQGFwaS5nZXQgKHJlc3VsdCkgPT5cbiAgICAgIEBkYXRhID0gcmVzdWx0XG4gICAgICBAY2FsbGJhY2s/IHJlc3VsdFxuICAgICAgY2I/IHJlc3VsdFxuICAgICAgc2hvdyByZXN1bHRcblxuICBvbkNoYW5nZWQ6IChrZXksIGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgaWYgY2hhbmdlc1trZXldPyBhbmQgY2I/IHRoZW4gY2IgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuICBvbkNoYW5nZWRBbGw6ICgpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLG5hbWVzcGFjZSkgPT5cbiAgICAgIEBkYXRhW2NdID0gY2hhbmdlc1tjXS5uZXdWYWx1ZSBmb3IgYyBvZiBjaGFuZ2VzXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuXG4jIGNsYXNzIERpcmVjdG9yeVN0b3JlXG4jICAgZGlyZWN0b3JpZXMgPVxuIyAgIGNvbnN0cnVjdG9yICgpIC0+XG5cbiMgY2xhc3MgRGlyZWN0b3J5XG5cblxuY2xhc3MgRmlsZVN5c3RlbVxuICBhcGk6IGNocm9tZS5maWxlU3lzdGVtXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG5cbiAgIyBAZGlyczogbmV3IERpcmVjdG9yeVN0b3JlXG4gICMgZmlsZVRvQXJyYXlCdWZmZXI6IChibG9iLCBvbmxvYWQsIG9uZXJyb3IpIC0+XG4gICMgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICMgICByZWFkZXIub25sb2FkID0gb25sb2FkXG5cbiAgIyAgIHJlYWRlci5vbmVycm9yID0gb25lcnJvclxuXG4gICMgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgYmxvYlxuXG4gIHJlYWRGaWxlOiAoZGlyRW50cnksIHBhdGgsIHN1Y2Nlc3MsIGVycm9yKSAtPlxuICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIHBhdGgsXG4gICAgICAoZmlsZUVudHJ5KSA9PlxuICAgICAgICBmaWxlRW50cnkuZmlsZSAoZmlsZSkgPT5cbiAgICAgICAgICBzdWNjZXNzKGZpbGVFbnRyeSwgZmlsZSlcbiAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuXG4gIGdldEZpbGVFbnRyeTogKGRpckVudHJ5LCBwYXRoLCBzdWNjZXNzLCBlcnJvcikgLT5cbiAgICBpZiBkaXJFbnRyeT8uZ2V0RmlsZT9cbiAgICAgIGRpckVudHJ5LmdldEZpbGUgcGF0aCwge30sIChmaWxlRW50cnkpIC0+XG4gICAgICAgIHN1Y2Nlc3MgZmlsZUVudHJ5XG4gICAgZWxzZSBlcnJvcigpXG5cbiAgb3BlbkRpcmVjdG9yeTogKGNhbGxiYWNrKSA9PlxuICAgIEBhcGkuY2hvb3NlRW50cnkgdHlwZTonb3BlbkRpcmVjdG9yeScsIChkaXJlY3RvcnlFbnRyeSwgZmlsZXMpID0+XG4gICAgICBAYXBpLmdldERpc3BsYXlQYXRoIGRpcmVjdG9yeUVudHJ5LCAocGF0aE5hbWUpID0+XG4gICAgICAgIGRpciA9XG4gICAgICAgICAgICByZWxQYXRoOiBkaXJlY3RvcnlFbnRyeS5mdWxsUGF0aC5yZXBsYWNlKCcvJyArIGRpcmVjdG9yeUVudHJ5Lm5hbWUsICcnKVxuICAgICAgICAgICAgZGlyZWN0b3J5RW50cnlJZDogQGFwaS5yZXRhaW5FbnRyeShkaXJlY3RvcnlFbnRyeSlcbiAgICAgICAgICAgIGVudHJ5OiBkaXJlY3RvcnlFbnRyeVxuXG4gICAgICAgICAgY2FsbGJhY2sgcGF0aE5hbWUsIGRpclxuICAgICAgICAgICAgIyBAZ2V0T25lRGlyTGlzdCBkaXJcbiAgICAgICAgICAgICMgU3RvcmFnZS5zYXZlICdkaXJlY3RvcmllcycsIEBzY29wZS5kaXJlY3RvcmllcyAocmVzdWx0KSAtPlxuXG5cblxuY2xhc3MgTWFwcGluZ1xuICByZXNvdXJjZTogbnVsbCAjaHR0cDovL2JsYWxhLmNvbS93aGF0L2V2ZXIvaW5kZXguanNcbiAgbG9jYWw6IG51bGwgIy9zb21lc2hpdHR5RGlyL290aGVyU2hpdHR5RGlyL1xuICByZWdleDogbnVsbFxuICBjb25zdHJ1Y3RvcjogKHJlc291cmNlLCBsb2NhbCwgcmVnZXgpIC0+XG4gICAgW0Bsb2NhbCwgQHJlc291cmNlLCBAcmVnZXhdID0gW2xvY2FsLCByZXNvdXJjZSwgcmVnZXhdXG5cbiAgZ2V0TG9jYWxSZXNvdXJjZTogKCkgLT5cbiAgICBAcmVzb3VyY2UucmVwbGFjZShAcmVnZXgsIEBsb2NhbClcblxuICBzZXRSZWRpcmVjdERlY2xhcmF0aXZlOiAodGFiSWQpIC0+XG4gICAgcnVsZXMgPSBbXS5wdXNoXG4gICAgICBwcmlvcml0eToxMDBcbiAgICAgIGNvbmRpdGlvbnM6IFtcbiAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuUmVxdWVzdE1hdGNoZXJcbiAgICAgICAgICB1cmw6XG4gICAgICAgICAgICB1cmxNYXRjaGVzOkByZWdleFxuICAgICAgICBdXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlZGlyZWN0UmVxdWVzdFxuICAgICAgICAgIHJlZGlyZWN0VXJsOkBnZXRMb2NhbFJlc291cmNlKClcbiAgICAgIF1cbiAgICBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0Lm9uUmVxdWVzdC5hZGRSdWxlcyBydWxlc1xuXG4jIGNsYXNzIFN0b3JhZ2VGYWN0b3J5XG4jICAgbWFrZU9iamVjdDogKHR5cGUpIC0+XG4jICAgICBzd2l0Y2ggdHlwZVxuIyAgICAgICB3aGVuICdSZXNvdXJjZUxpc3QnXG4jICAgX2NyZWF0ZTogKHR5cGUpIC0+XG4jICAgICBAZ2V0RnJvbVN0b3JhZ2UudGhlbiAob2JqKSAtPlxuIyAgICAgICByZXR1cm4gb2JqXG5cbiMgICBnZXRGcm9tU3RvcmFnZTogKCkgLT5cbiMgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZSAoc3VjY2VzcywgZmFpbCkgLT5cbiMgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0IChhKSAtPlxuIyAgICAgICAgIGIgPSBuZXcgUmVzb3VyY2VMaXN0XG4jICAgICAgICAgZm9yIGtleSBvZiBhXG4jICAgICAgICAgICBkbyAoYSkgLT5cbiMgICAgICAgICAgICAgYltrZXldID0gYVtrZXldXG4jICAgICAgICAgc3VjY2VzcyBiXG4jIyNcbmNsYXNzIEZpbGVcbiAgICBjb25zdHJ1Y3RvcjogKGRpcmVjdG9yeUVudHJ5LCBwYXRoKSAtPlxuICAgICAgICBAZGlyRW50cnkgPSBkaXJlY3RvcnlFbnRyeVxuICAgICAgICBAcGF0aCA9IHBhdGhcbiMjI1xuXG4jVE9ETzogcmV3cml0ZSB0aGlzIGNsYXNzIHVzaW5nIHRoZSBuZXcgY2hyb21lLnNvY2tldHMuKiBhcGkgd2hlbiB5b3UgY2FuIG1hbmFnZSB0byBtYWtlIGl0IHdvcmtcbmNsYXNzIFNlcnZlclxuICBzb2NrZXQ6IGNocm9tZS5zb2NrZXRcbiAgIyB0Y3A6IGNocm9tZS5zb2NrZXRzLnRjcFxuICBob3N0OlwiMTI3LjAuMC4xXCJcbiAgcG9ydDo4MDgyXG4gIG1heENvbm5lY3Rpb25zOjUwMFxuICBzb2NrZXRQcm9wZXJ0aWVzOlxuICAgICAgcGVyc2lzdGVudDp0cnVlXG4gICAgICBuYW1lOidTTFJlZGlyZWN0b3InXG4gIHNvY2tldEluZm86bnVsbFxuICBnZXRMb2NhbEZpbGU6bnVsbFxuICBzb2NrZXRJZHM6W11cbiAgc3RvcHBlZDpmYWxzZVxuXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuXG4gIHN0YXJ0OiAoaG9zdCxwb3J0LG1heENvbm5lY3Rpb25zLCBjYikgLT5cbiAgICBAaG9zdCA9IGlmIGhvc3Q/IHRoZW4gaG9zdCBlbHNlIEBob3N0XG4gICAgQHBvcnQgPSBpZiBwb3J0PyB0aGVuIHBvcnQgZWxzZSBAcG9ydFxuICAgIEBtYXhDb25uZWN0aW9ucyA9IGlmIG1heENvbm5lY3Rpb25zPyB0aGVuIG1heENvbm5lY3Rpb25zIGVsc2UgQG1heENvbm5lY3Rpb25zXG5cbiAgICBAa2lsbEFsbCAoKSA9PlxuICAgICAgQHNvY2tldC5jcmVhdGUgJ3RjcCcsIHt9LCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgQHNvY2tldElkcyA9IFtdXG4gICAgICAgIEBzb2NrZXRJZHMucHVzaCBzb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCAnc29ja2V0SWRzJzpAc29ja2V0SWRzXG4gICAgICAgIEBzb2NrZXQubGlzdGVuIHNvY2tldEluZm8uc29ja2V0SWQsIEBob3N0LCBAcG9ydCwgKHJlc3VsdCkgPT5cbiAgICAgICAgICBzaG93ICdsaXN0ZW5pbmcgJyArIHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgICBAc3RvcHBlZCA9IGZhbHNlXG4gICAgICAgICAgQHNvY2tldEluZm8gPSBzb2NrZXRJbmZvXG4gICAgICAgICAgQHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG4gIGtpbGxBbGw6IChjYWxsYmFjaykgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQgJ3NvY2tldElkcycsIChyZXN1bHQpID0+XG4gICAgICBzaG93ICdnb3QgaWRzJ1xuICAgICAgc2hvdyByZXN1bHRcbiAgICAgIEBzb2NrZXRJZHMgPSByZXN1bHQuc29ja2V0SWRzXG4gICAgICBmb3IgcyBpbiBAc29ja2V0SWRzP1xuICAgICAgICBkbyAocykgPT5cbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIEBzb2NrZXQuZGlzY29ubmVjdCBzXG4gICAgICAgICAgICBAc29ja2V0LmRlc3Ryb3kgc1xuICAgICAgICAgICAgc2hvdyAna2lsbGVkICcgKyBzXG4gICAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAgIHNob3cgXCJjb3VsZCBub3Qga2lsbCAjeyBzIH0gYmVjYXVzZSAjeyBlcnJvciB9XCJcbiAgICAgIGNhbGxiYWNrPygpXG5cbiAgc3RvcDogKCkgLT5cbiAgICBAa2lsbEFsbCgpXG4gICAgQHN0b3BwZWQgPSB0cnVlXG5cbiAgX29uUmVjZWl2ZTogKHJlY2VpdmVJbmZvKSA9PlxuICAgIHNob3coXCJDbGllbnQgc29ja2V0ICdyZWNlaXZlJyBldmVudDogc2Q9XCIgKyByZWNlaXZlSW5mby5zb2NrZXRJZFxuICAgICsgXCIsIGJ5dGVzPVwiICsgcmVjZWl2ZUluZm8uZGF0YS5ieXRlTGVuZ3RoKVxuXG4gIF9vbkxpc3RlbjogKHNlcnZlclNvY2tldElkLCByZXN1bHRDb2RlKSA9PlxuICAgIHJldHVybiBzaG93ICdFcnJvciBMaXN0ZW5pbmc6ICcgKyBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSBpZiByZXN1bHRDb2RlIDwgMFxuICAgIEBzZXJ2ZXJTb2NrZXRJZCA9IHNlcnZlclNvY2tldElkXG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdC5hZGRMaXN0ZW5lciBAX29uQWNjZXB0XG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdEVycm9yLmFkZExpc3RlbmVyIEBfb25BY2NlcHRFcnJvclxuICAgIEB0Y3Aub25SZWNlaXZlLmFkZExpc3RlbmVyIEBfb25SZWNlaXZlXG4gICAgIyBzaG93IFwiW1wiK3NvY2tldEluZm8ucGVlckFkZHJlc3MrXCI6XCIrc29ja2V0SW5mby5wZWVyUG9ydCtcIl0gQ29ubmVjdGlvbiBhY2NlcHRlZCFcIjtcbiAgICAjIGluZm8gPSBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAjIEBnZXRGaWxlIHVyaSwgKGZpbGUpIC0+XG4gIF9vbkFjY2VwdEVycm9yOiAoZXJyb3IpIC0+XG4gICAgc2hvdyBlcnJvclxuXG4gIF9vbkFjY2VwdDogKHNvY2tldEluZm8pID0+XG4gICAgIyByZXR1cm4gbnVsbCBpZiBpbmZvLnNvY2tldElkIGlzbnQgQHNlcnZlclNvY2tldElkXG4gICAgc2hvdyhcIlNlcnZlciBzb2NrZXQgJ2FjY2VwdCcgZXZlbnQ6IHNkPVwiICsgc29ja2V0SW5mby5zb2NrZXRJZClcbiAgICBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWQsIChpbmZvKSA9PlxuICAgICAgQGdldExvY2FsRmlsZSBpbmZvLFxuICAgICAgICAoZmlsZUVudHJ5LCBmaWxlUmVhZGVyKSA9PlxuICAgICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJbmZvLnNvY2tldElkLCBmaWxlRW50cnksIGZpbGVSZWFkZXIsIGluZm8ua2VlcEFsaXZlLFxuICAgICAgICAoZXJyb3IpID0+XG4gICAgICAgICAgQF93cml0ZUVycm9yIHNvY2tldEluZm8uc29ja2V0SWQsIDQwNCwgaW5mby5rZWVwQWxpdmVcbiAgICAjIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuXG5cbiAgc3RyaW5nVG9VaW50OEFycmF5OiAoc3RyaW5nKSAtPlxuICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgaSA9IDBcblxuICAgIHdoaWxlIGkgPCBzdHJpbmcubGVuZ3RoXG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgIGkrK1xuICAgIHZpZXdcblxuICBhcnJheUJ1ZmZlclRvU3RyaW5nOiAoYnVmZmVyKSAtPlxuICAgIHN0ciA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICBzID0gMFxuXG4gICAgd2hpbGUgcyA8IHVBcnJheVZhbC5sZW5ndGhcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVBcnJheVZhbFtzXSlcbiAgICAgIHMrK1xuICAgIHN0clxuXG4gIF93cml0ZTIwMFJlc3BvbnNlOiAoc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZSwga2VlcEFsaXZlKSAtPlxuICAgIGNvbnRlbnRUeXBlID0gKGlmIChmaWxlLnR5cGUgaXMgXCJcIikgdGhlbiBcInRleHQvcGxhaW5cIiBlbHNlIGZpbGUudHlwZSlcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIDIwMCBPS1xcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoKGlmIGtlZXBBbGl2ZSB0aGVuIFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIGVsc2UgXCJcIikpICsgXCJcXG5cXG5cIilcbiAgICBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldCBoZWFkZXIsIDBcblxuICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChldikgPT5cbiAgICAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGV2LnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aFxuICAgICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICAgICBzaG93IHdyaXRlSW5mb1xuICAgICAgICAjIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLm9uZXJyb3IgPSAoZXJyb3IpID0+XG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgZmlsZVxuXG5cbiAgICAjIEBlbmQgc29ja2V0SWRcbiAgICAjIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgIyBmaWxlUmVhZGVyLm9ubG9hZCA9IChlKSA9PlxuICAgICMgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShlLnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aFxuICAgICMgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgIyAgICAgc2hvdyBcIldSSVRFXCIsIHdyaXRlSW5mb1xuICAgICMgICAgICAgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldElkXG5cblxuICBfcmVhZEZyb21Tb2NrZXQ6IChzb2NrZXRJZCwgY2IpIC0+XG4gICAgQHNvY2tldC5yZWFkIHNvY2tldElkLCAocmVhZEluZm8pID0+XG4gICAgICBzaG93IFwiUkVBRFwiLCByZWFkSW5mb1xuXG4gICAgICAjIFBhcnNlIHRoZSByZXF1ZXN0LlxuICAgICAgZGF0YSA9IEBhcnJheUJ1ZmZlclRvU3RyaW5nKHJlYWRJbmZvLmRhdGEpXG4gICAgICBzaG93IGRhdGFcblxuICAgICAgaWYgZGF0YS5pbmRleE9mKFwiR0VUIFwiKSBpc250IDBcbiAgICAgICAgQGVuZCBzb2NrZXRJZFxuICAgICAgICByZXR1cm5cblxuICAgICAga2VlcEFsaXZlID0gZmFsc2VcbiAgICAgIGtlZXBBbGl2ZSA9IHRydWUgaWYgZGF0YS5pbmRleE9mICdDb25uZWN0aW9uOiBrZWVwLWFsaXZlJyBpc250IC0xXG5cbiAgICAgIHVyaUVuZCA9IGRhdGEuaW5kZXhPZihcIiBcIiwgNClcblxuICAgICAgcmV0dXJuIGVuZCBzb2NrZXRJZCBpZiB1cmlFbmQgPCAwXG5cbiAgICAgIHVyaSA9IGRhdGEuc3Vic3RyaW5nKDQsIHVyaUVuZClcbiAgICAgIGlmIG5vdCB1cmk/XG4gICAgICAgIHdyaXRlRXJyb3Igc29ja2V0SWQsIDQwNCwga2VlcEFsaXZlXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpbmZvID1cbiAgICAgICAgdXJpOiB1cmlcbiAgICAgICAga2VlcEFsaXZlOmtlZXBBbGl2ZVxuICAgICAgaW5mby5yZWZlcmVyID0gZGF0YS5tYXRjaCgvUmVmZXJlcjpcXHMoLiopLyk/WzFdXG4gICAgICAjc3VjY2Vzc1xuICAgICAgY2I/IGluZm9cblxuICBlbmQ6IChzb2NrZXRJZCwga2VlcEFsaXZlKSAtPlxuICAgICAgIyBpZiBrZWVwQWxpdmVcbiAgICAgICMgICBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAjIGVsc2VcbiAgICBAc29ja2V0LmRpc2Nvbm5lY3Qgc29ja2V0SWRcbiAgICBAc29ja2V0LmRlc3Ryb3kgc29ja2V0SWRcbiAgICBzaG93ICdlbmRpbmcgJyArIHNvY2tldElkXG4gICAgQHNvY2tldC5hY2NlcHQgQHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuICBfd3JpdGVFcnJvcjogKHNvY2tldElkLCBlcnJvckNvZGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBmaWxlID0gc2l6ZTogMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGJlZ2luLi4uIFwiXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogZmlsZSA9IFwiICsgZmlsZVxuICAgIGNvbnRlbnRUeXBlID0gXCJ0ZXh0L3BsYWluXCIgIyhmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCBcIiArIGVycm9yQ29kZSArIFwiIE5vdCBGb3VuZFxcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoKGlmIGtlZXBBbGl2ZSB0aGVuIFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIGVsc2UgXCJcIikpICsgXCJcXG5cXG5cIilcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgaGVhZGVyLi4uXCJcbiAgICBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldCBoZWFkZXIsIDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgdmlldy4uLlwiXG4gICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICAgc2hvdyBcIldSSVRFXCIsIHdyaXRlSW5mb1xuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG5cbmNsYXNzIEFwcGxpY2F0aW9uXG5cbiAgY29uZmlnOlxuICAgIEFQUF9JRDogJ25mbm1ubm9uZGRjYmxhY2VqZGVuZmhpY2FsYmtpaW9kJ1xuICAgIEVYVEVOU0lPTl9JRDogJ2JkamhiaW9nbGVhbmtrYWRnb2xvaWhjYmphbG1uZGFsJ1xuXG4gIGRhdGE6bnVsbFxuICBMSVNURU46IG51bGxcbiAgTVNHOiBudWxsXG4gIFN0b3JhZ2U6IG51bGxcbiAgRlM6IG51bGxcbiAgU2VydmVyOiBudWxsXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQFN0b3JhZ2UgPSBuZXcgU3RvcmFnZVxuICAgIEBGUyA9IG5ldyBGaWxlU3lzdGVtXG4gICAgQFNlcnZlciA9IG5ldyBTZXJ2ZXJcbiAgICBAY29uZmlnLlNFTEZfSUQgPSBjaHJvbWUucnVudGltZS5pZFxuICAgIEBjb25maWcuRVhUX0lEID0gaWYgQGNvbmZpZy5BUFBfSUQgaXMgQGNvbmZpZy5TRUxGX0lEIHRoZW4gQGNvbmZpZy5FWFRFTlNJT05fSUQgZWxzZSBAY29uZmlnLkFQUF9JRFxuICAgIEBjb25maWcuRVhUX1RZUEUgPSBpZiBAY29uZmlnLkFQUF9JRCBpc250IEBjb25maWcuU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcbiAgICBATVNHID0gbmV3IE1TRyBAY29uZmlnXG4gICAgQExJU1RFTiA9IG5ldyBMSVNURU4gQGNvbmZpZ1xuXG4gICAgQGFwcFdpbmRvdyA9IG51bGxcbiAgICBAcG9ydCA9IDMxMzM3XG4gICAgQGRhdGEgPSBAU3RvcmFnZS5kYXRhXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpID0+XG5cblxuICBsYXVuY2hBcHA6IChjYikgLT5cbiAgICBjaHJvbWUubWFuYWdlbWVudC5sYXVuY2hBcHAgQGNvbmZpZy5BUFBfSURcblxuICBvcGVuQXBwOiAoKSA9PlxuICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsXG4gICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgIGJvdW5kczpcbiAgICAgICAgd2lkdGg6NTAwXG4gICAgICAgIGhlaWdodDo4MDAsXG4gICAgKHdpbikgPT5cbiAgICAgIEBhcHBXaW5kb3cgPSB3aW4pXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvblxuIiwiIyBnZXRHbG9iYWwgPSAtPlxuIyAgIF9nZXRHbG9iYWwgPSAtPlxuIyAgICAgdGhpc1xuXG4jICAgX2dldEdsb2JhbCgpXG5cbiMgcm9vdCA9IGdldEdsb2JhbCgpXG5cbiMgcm9vdC5hcHAgPSBhcHAgPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuIyBhcHAgPSBuZXcgbGliLkFwcGxpY2F0aW9uXG5cbkFwcGxpY2F0aW9uID0gcmVxdWlyZSAnLi4vLi4vY29tbW9uLmNvZmZlZSdcblxuY2xhc3MgRXh0QmFja2dyb3VuZCBleHRlbmRzIEFwcGxpY2F0aW9uXG4gICAgdXJsczoge31cbiAgICB1cmxBcnI6IFtdXG4gICAgb3JpZ2luczoge31cbiAgICBpc09uOiB7fVxuICAgIGZpbGVzOiB7fVxuICAgIGV4dFBvcnQ6IHt9XG4gICAgY3VycmVudFRhYklkOm51bGxcbiAgICBtYXBzOiBbXVxuXG4gICAgaW5pdDogKCkgLT5cbiAgICAgICAgY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyICh0YWJJZCkgPT5cbiAgICAgICAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJJZFxuICAgICAgICAgICAgQHVwZGF0ZUljb24odGFiSWQpIGlmIG5vdCBAaXNPblt0YWJJZF0/XG5cbiAgICAgICAgQExJU1RFTi5Mb2NhbCAncmVzb3VyY2VzJywgKHJlc291cmNlcykgPT5cbiAgICAgICAgICAgIHVuZGVmaW5lZFxuXG4gICAgICAgIEBMSVNURU4uRXh0ICdyZWRpckluZm8nLCAocmVkKSA9PlxuICAgICAgICAgICAgQG1hcHM9cmVkLm1hcHNcbiAgICAgICAgICAgIEBzZXJ2ZXI9cmVkLnNlcnZlclxuXG4gICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lciAodGFiKSA9PlxuICAgICAgICAgICAgaWYgbm90IEBpc09uW3RhYi5pZF1cbiAgICAgICAgICAgICAgICBAaXNPblt0YWIuaWRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlIHRhYi5pZCwgJ2dldFJlc291cmNlcyc6dHJ1ZSwgKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgICAgICAgICBAbGF1bmNoQXBwKClcbiAgICAgICAgICAgICAgICAgICAgQE1TRy5FeHQgJ3Jlc291cmNlcyc6cmVzcG9uc2UucmVzb3VyY2VzXG4gICAgICAgICAgICAgICAgICAgICMgQGluaXRSZWRpcmVjdHMoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBpc09uW3RhYi5pZF0gPSBpZiBub3QgQGlzT25bdGFiLmlkXT8gdGhlbiB0cnVlIGVsc2UgIUBpc09uW3RhYi5pZF1cbiAgICAgICAgICAgICAgICBAa2lsbFJlZGlyZWN0cygpXG5cbiAgICAgICAgICAgIEB1cGRhdGVJY29uIHRhYi5pZFxuXG4gICAgZ2V0U2VydmVyOiAoKSAtPlxuXG4gICAga2lsbFJlZGlyZWN0czogKCkgLT5cbiAgICAgICAgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVSZXF1ZXN0LnJlbW92ZUxpc3RlbmVyKClcblxuICAgIGluaXRSZWRpcmVjdHM6ICgpID0+XG4gICAgICAgIHJldHVybiBpZiBAbWFwcy5sZW5ndGggaXMgMFxuICAgICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QuYWRkTGlzdGVuZXIgQHJlZGlyZWN0TGlzdGVuZXIsXG4gICAgICAgICAgICB1cmxzOlsnPGFsbF91cmxzPiddXG4gICAgICAgICAgICB0YWJJZDpAY3VycmVudFRhYklkLFxuICAgICAgICAgICAgWydibG9ja2luZyddXG5cbiAgICAgICAgIyBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVNlbmRIZWFkZXJzLmFkZExpc3RlbmVyIEBoZWFkZXJMaXN0ZW5lcixcbiAgICAgICAgIyAgICAgdXJsczpbJzxhbGxfdXJscz4nXVxuICAgICAgICAjICAgICB0YWJJZDpAY3VycmVudFRhYklkLFxuICAgICAgICAjICAgICBbJ3JlcXVlc3RIZWFkZXJzJ11cblxuICAgICAgICAjIGNocm9tZS53ZWJSZXF1ZXN0Lm9uSGVhZGVyc1JlY2VpdmVkLmFkZExpc3RlbmVyICgoZGV0YWlscykgPT4gQHJlZGlyZWN0TGlzdGVuZXIoZGV0YWlscykpLFxuICAgICAgICAjICAgICB1cmxzOlsnPGFsbF91cmxzPiddXG4gICAgICAgICMgICAgIHRhYklkOkBjdXJyZW50VGFiSWQsXG4gICAgICAgICMgICAgIFsnYmxvY2tpbmcnLCdyZXNwb25zZUhlYWRlcnMnXVxuXG5cbiAgICBtYXRjaDogKHVybCkgLT5cbiAgICAgICAgcmV0dXJuIG1hcCBmb3IgbWFwIGluIEBtYXBzIHdoZW4gdXJsLm1hdGNoKG1hcC51cmwpPyBhbmQgbWFwLnVybD9cbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgIGhlYWRlckxpc3RlbmVyOiAoZGV0YWlscykgLT5cbiAgICAgICAgc2hvdyBkZXRhaWxzXG5cbiAgICByZWRpcmVjdExpc3RlbmVyOiAoZGV0YWlscykgPT5cbiAgICAgICAgc2hvdyBkZXRhaWxzXG4gICAgICAgIG1hcCA9IEBtYXRjaCBkZXRhaWxzLnVybFxuICAgICAgICBpZiBtYXA/XG4gICAgICAgICAgICBzaG93ICdyZWRpcmVjdGVkIHRvICcgKyBAc2VydmVyLnVybCArIGVuY29kZVVSSUNvbXBvbmVudChkZXRhaWxzLnVybClcbiAgICAgICAgICAgIHJldHVybiByZWRpcmVjdFVybDogQHNlcnZlci51cmwgKyBlbmNvZGVVUklDb21wb25lbnQoZGV0YWlscy51cmwpICNkZXRhaWxzLnVybC5yZXBsYWNlKG5ldyBSZWdFeHAobWFwLnVybCksIG1hcC5yZWdleFJlcGwpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB7fVxuICAgIyB7XG4jICAgICAgICAgICAgICAgICAgICAgdXJsczogW2tleV0sXG4jICAgICAgICAgICAgICAgICAgICAgdGFiSWQ6IHRhYklkXG4jICAgICAgICAgICAgICAgICB9LFxuIyAgICAgICAgICAgICAgICAgW1wiYmxvY2tpbmdcIl1cbiAgICAgICAgIyBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVNlbmRIZWFkZXJzLmFkZExpc3RlbmVyKFxuICAgICAgICAjICAgICAgICAgKGZ1bmN0aW9uKF9rZXksIF90eXBlKSB7XG4gICAgICAgICMgICAgICAgICAgICAgaWYodXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnMgPT0gdW5kZWZpbmVkKSB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9ucyA9IHt9O1xuICAgICAgICAjICAgICAgICAgICAgIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zW190eXBlXSA9IChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgIyAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRldGFpbHMpIHtcbiAgICAgICAgIyAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoZWFkZXJSZXF1ZXN0TGlzdGVuZXIoZGV0YWlscywga2V5KTtcbiAgICAgICAgIyAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgIyAgICAgICAgICAgICB9KGtleSkpO1xuICAgICAgICAjICAgICAgICAgICAgIHJldHVybiB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tfdHlwZV07XG4gICAgICAgICMgICAgICAgICB9KGtleSwgJ29uQmVmb3JlU2VuZEhlYWRlcnMnKSksXG4gICAgICAgICMgICAgICAgICB7XG4gICAgICAgICMgICAgICAgICAgICAgdXJsczogW1wiPGFsbF91cmxzPlwiXSxcbiAgICAgICAgIyAgICAgICAgICAgICB0YWJJZDogdGFiSWRcbiAgICAgICAgIyAgICAgICAgIH0sXG4gICAgICAgICMgICAgICAgICBbXCJyZXF1ZXN0SGVhZGVyc1wiXVxuICAgICAgICAjICAgICApO1xuXG5cbiAgICB1cGRhdGVJY29uOiAodGFiSWQpID0+XG4gICAgICAgIGlmIEBpc09uW3RhYklkXVxuICAgICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0SWNvbihcbiAgICAgICAgICAgICAgICBwYXRoOlxuICAgICAgICAgICAgICAgICAgICAnMTknOidpbWFnZXMvcmVkaXItb24tMTkucG5nJ1xuICAgICAgICAgICAgICAgICAgICAnMzgnOidpbWFnZXMvcmVkaXItb24tMzgucG5nJyxcbiAgICAgICAgICAgICAgICB0YWJJZDp0YWJJZFxuICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRJY29uKFxuICAgICAgICAgICAgICAgIHBhdGg6XG4gICAgICAgICAgICAgICAgICAgICcxOSc6J2ltYWdlcy9yZWRpci1vZmYtMTkucG5nJ1xuICAgICAgICAgICAgICAgICAgICAnMzgnOidpbWFnZXMvcmVkaXItb2ZmLTM4LnBuZycsXG4gICAgICAgICAgICAgICAgdGFiSWQ6dGFiSWRcbiAgICAgICAgICAgIClcblxuc2VuZFJlc291cmNlcyA9IChyZXNvdXJjZXMpIC0+XG4gICAgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShhcHBJZCxyZXNvdXJjZXM6cmVzb3VyY2VzKVxuXG5hcHAgPSBuZXcgRXh0QmFja2dyb3VuZFxuICAgICMgY2hyb21lLnRhYnMucmVsb2FkIHRhYi5pZFxuXG5cbiMgdmFyIGFkZExpc3RlbmVyczIgPSBmdW5jdGlvbigpIHtcbiMgICAgIHZhciBydWxlMSA9IHtcbiMgICAgICAgICBwcmlvcml0eTogMTAwLFxuIyAgICAgICAgIGNvbmRpdGlvbnM6IFtcbiMgICAgICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlcXVlc3RNYXRjaGVyKHtcbiMgICAgICAgICAgICAgICB1cmw6IHsgcGF0aENvbnRhaW5zOiAncmVzb3VyY2UnIH0sXG4jICAgICAgICAgICAgICAgICBzdGFnZXM6IFtcIm9uQmVmb3JlUmVxdWVzdFwiLCBcIm9uQmVmb3JlU2VuZEhlYWRlcnNcIiwgXCJvbkhlYWRlcnNSZWNlaXZlZFwiLCBcIm9uQXV0aFJlcXVpcmVkXCJdXG4jICAgICAgICAgICAgIH0pXG4jICAgICAgICAgXSxcbiMgICAgICAgICBhY3Rpb25zOiBbXG4jICAgICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZWRpcmVjdFJlcXVlc3Qoe1xuIyAgICAgICAgICAgICByZWRpcmVjdFVybDonY2hyb21lLWV4dGVuc2lvbjovL3BtZ25uYmRmbW1wZGtnYWFta2RpaXBmZ2picGdpb2ZjL3JlZGlyZWN0b3InXG4jICAgICAgICAgICB9KSxcbiMgICAgICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlNlbmRNZXNzYWdlVG9FeHRlbnNpb24oe21lc3NhZ2U6IFwiXCJ9KVxuIyAgICAgICAgIF1cbiMgICAgICAgfTtcbiMgdmFyIHJ1bGUyID0ge1xuIyAgICAgICAgIHByaW9yaXR5OiAxLFxuIyAgICAgICAgIGNvbmRpdGlvbnM6IFtcbiMgICAgICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlcXVlc3RNYXRjaGVyKHtcbiMgICAgICAgICAgICAgICB1cmw6IHsgcGF0aENvbnRhaW5zOiAncmVkaXJlY3RvcicgfVxuIyAgICAgICAgICAgICB9KVxuIyAgICAgICAgIF0sXG4jICAgICAgICAgYWN0aW9uczogW1xuIyAgICAgICAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuUmVkaXJlY3RSZXF1ZXN0KHtcbiMgICAgICAgICAgICAgcmVkaXJlY3RVcmw6J2ZpbGU6Ly8vVXNlcnMvZGFuaWVsL0Ryb3Bib3gvZGV2L01hdmVuc01hdGUvM2RlbW8vc3JjL3BhY2thZ2UueG1sJ1xuIyAgICAgICAgICAgfSksXG4jICAgICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5TZW5kTWVzc2FnZVRvRXh0ZW5zaW9uKHttZXNzYWdlOiBcIlwifSlcbiMgICAgICAgICBdXG4jICAgICAgIH07XG4jICAgICAgIC8vIHZhciBydWxlMiA9IHtcbiMgICAgICAgLy8gICBwcmlvcml0eTogMTAwMCxcbiMgICAgICAgLy8gICBjb25kaXRpb25zOiBbXG4jICAgICAgIC8vICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZXF1ZXN0TWF0Y2hlcih7XG4jICAgICAgIC8vICAgICAgIHVybDogeyBob3N0U3VmZml4OiAnLm15c2VydmVyLmNvbScgfSB9KVxuIyAgICAgICAvLyAgIF0sXG4jICAgICAgIC8vICAgYWN0aW9uczogW1xuIyAgICAgICAvLyAgICAgbmV3IGNocm9tZS5kZWNsYXJhdGl2ZVdlYlJlcXVlc3QuSWdub3JlUnVsZXMoe1xuIyAgICAgICAvLyAgICAgICBsb3dlclByaW9yaXR5VGhhbjogMTAwMCB9KVxuIyAgICAgICAvLyAgIF1cbiMgICAgICAgLy8gfTtcbiMgICAgICAgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5vblJlcXVlc3QuYWRkUnVsZXMoW3J1bGUxLCBydWxlMl0pO1xuXG4jIH1cblxuIyBjaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24odGFiKSB7XG4jICAgICBpc09uW3RhYi5pZF0gPSBpc09uW3RhYi5pZF0gPT0gdW5kZWZpbmVkID8gdHJ1ZSA6ICFpc09uW3RhYi5pZF07XG4jICAgICB1cGRhdGVJY29uKHRhYi5pZCk7XG4jICAgICBjaHJvbWUudGFicy5yZWxvYWQodGFiLmlkKTtcbiMgfSk7XG5cbiMgdmFyIHVwZGF0ZUljb24gPSBmdW5jdGlvbih0YWJJZCkge1xuIyAgICAgaWYgKGlzT25bdGFiSWRdID09IHRydWUpIHtcbiMgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRJY29uKHtwYXRoOnsnMTknOidpbWFnZXMvcmVkaXItb24tMTkucG5nJywgJzM4JzonaW1hZ2VzL3JlZGlyLW9uLTM4LnBuZyd9LCB0YWJJZDp0YWJJZH0pO1xuIyAgICAgICAgIC8vIGNvbnZlcnRGaWxlUmVzb3VyY2VzVG9EYXRhKCk7XG4jICAgICAgICAgLy8gYWRkTGlzdGVuZXJzKHRhYklkKTtcbiMgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShhcHBJZCx7b3BlbkRpcmVjdG9yeTp0cnVlfSk7XG4jICAgICB9XG4jICAgICBlbHNlXG4jICAgICB7XG4jICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0SWNvbih7cGF0aDp7JzE5JzonaW1hZ2VzL3JlZGlyLW9mZi0xOS5wbmcnLCAnMzgnOidpbWFnZXMvcmVkaXItb2ZmLTM4LnBuZyd9LCB0YWJJZDp0YWJJZH0pO1xuIyAgICAgICAgIHJlbW92ZUxpc3RlbmVycyh0YWJJZCk7XG4jICAgICB9XG4jIH1cblxuIyBjaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24odGFiSWQpIHtcbiMgICAgIGlmKGlzT25bdGFiSWRdICE9IHVuZGVmaW5lZCkge1xuIyAgICAgICAgIHVwZGF0ZUljb24odGFiSWQpO1xuIyAgICAgfVxuIyB9KTtcblxuIyBjaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoZGV0YWlscykge1xuIyAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoICAgIHtcbiMgICAgICAgICB1cmxzOiB7XG4jICAgICAgICAgICAgICAgICBcImh0dHBzOi8vKi5zYWxlc2ZvcmNlLmNvbS9yZXNvdXJjZS8qXCI6IHtcbiMgICAgICAgICAgICAgICAgICAgICByZWdleDogJ2h0dHBzLipcXC9yZXNvdXJjZShcXC9bMC05XSspP1xcLyhbQS1aYS16MC05XFwtLl9dK1xcLyk/JyxcbiMgICAgICAgICAgICAgICAgICAgICByZWdyZXBsYWNlOiAnaHR0cDovL2xvY2FsaG9zdDo5MDAwLydcbiMgICAgICAgICAgICAgICAgIH0sXG4jICAgICAgICAgICAgICAgICBcImh0dHBzOi8vKi5mb3JjZS5jb20vcmVzb3VyY2UvKlwiOiB7XG4jICAgICAgICAgICAgICAgICAgICAgcmVnZXg6ICdodHRwcy4qXFwvcmVzb3VyY2UoXFwvWzAtOV0rKT9cXC8oW0EtWmEtejAtOVxcLS5fXStcXC8pPycsXG4jICAgICAgICAgICAgICAgICAgICAgcmVncmVwbGFjZTogJ2h0dHA6Ly9sb2NhbGhvc3Q6OTAwMC8nXG4jICAgICAgICAgICAgICAgICB9XG5cbiMgICAgICAgICB9XG4jICAgICB9KTtcbiMgfSk7XG5cbiMgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKGZ1bmN0aW9uKGNoYW5nZXMsIG5hbWVzcGFjZSkge1xuXG4jICAgICBpZihuYW1lc3BhY2UgIT0gJ3N5bmMnKSByZXR1cm47XG5cbiMgICAgIGZvciAoa2V5IGluIGNoYW5nZXMpIHtcbiMgICAgICAgICAgIHZhciBzdG9yYWdlQ2hhbmdlID0gY2hhbmdlc1trZXldO1xuIyAgICAgICAgICAgaWYoa2V5ID09ICd1cmxzJykge1xuIyAgICAgICAgICAgICB1cmxzID0gc3RvcmFnZUNoYW5nZS5uZXdWYWx1ZTtcbiMgICAgICAgICAgICAgdXJsQXJyLmxlbmd0aCA9IDA7XG4jICAgICAgICAgICAgIGZvcih2YXIga2V5IGluIHVybHMpIHtcbiMgICAgICAgICAgICAgICAgIHVybEFyci5wdXNoKGtleSk7XG4jICAgICAgICAgICAgIH1cbiMgICAgICAgICAgIH1cbiMgICAgICAgICB9XG4jIH0pO1xuXG4jIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KGZ1bmN0aW9uKG9wdCkge1xuIyAgICAgdXJscyA9IG9wdC51cmxzO1xuIyAgICAgdXJsQXJyLmxlbmd0aCA9IDA7XG4jICAgICBmb3IodmFyIGtleSBpbiB1cmxzKSB7XG4jICAgICAgICAgdXJsQXJyLnB1c2goa2V5KTtcbiMgICAgIH1cbiMgfSlcblxuIyBjaHJvbWUucnVudGltZS5vbkNvbm5lY3QuYWRkTGlzdGVuZXIoZnVuY3Rpb24ocG9ydCkge1xuXG4jIH0pO1xuXG5cblxuXG5cblxuIyB2YXIgY29udmVydEZpbGVSZXNvdXJjZXNUb0RhdGEgPSBmdW5jdGlvbigpIHtcbiMgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHt9LCBmdW5jdGlvbigpIHtcblxuIyAgICAgfSk7XG4jIH1cblxuXG4jIHZhciBoZWFkZXJSZXF1ZXN0TGlzdGVuZXIgPSBmdW5jdGlvbihkZXRhaWxzLCBrZXkpe1xuXG4jICAgICB2YXIgZmxhZyA9IGZhbHNlLFxuIyAgICAgICAgIHJ1bGUgPSB7XG4jICAgICAgICAgICAgIG5hbWU6IFwiT3JpZ2luXCIsXG4jICAgICAgICAgICAgIHZhbHVlOiBcImh0dHA6Ly9ldmlsLmNvbS9cIlxuIyAgICAgICAgIH07XG5cbiMgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGV0YWlscy5yZXF1ZXN0SGVhZGVycy5sZW5ndGg7ICsraSkge1xuIyAgICAgICAgIGlmIChkZXRhaWxzLnJlcXVlc3RIZWFkZXJzW2ldLm5hbWUgPT09IHJ1bGUubmFtZSkge1xuIyAgICAgICAgICAgICBmbGFnID0gdHJ1ZTtcbiMgICAgICAgICAgICAgb3JpZ2luc1tkZXRhaWxzLnJlcXVlc3RJZF0gPSBkZXRhaWxzLnJlcXVlc3RIZWFkZXJzW2ldLnZhbHVlO1xuIyAgICAgICAgICAgICBkZXRhaWxzLnJlcXVlc3RIZWFkZXJzW2ldLnZhbHVlID0gcnVsZS52YWx1ZTtcbiMgICAgICAgICAgICAgYnJlYWs7XG4jICAgICAgICAgfVxuIyAgICAgfVxuIyAgICAgaWYoIWZsYWcpIGRldGFpbHMucmVxdWVzdEhlYWRlcnMucHVzaChydWxlKTtcbiMgICAgIHJldHVybiB7cmVxdWVzdEhlYWRlcnM6IGRldGFpbHMucmVxdWVzdEhlYWRlcnN9O1xuIyB9O1xuIyB2YXIgaGVhZGVyUmVzcG9uc2VMaXN0ZW5lciA9IGZ1bmN0aW9uKGRldGFpbHMsIGtleSl7XG5cbiMgICAgIGlmKG9yaWdpbnNbZGV0YWlscy5yZXF1ZXN0SWRdICE9IHVuZGVmaW5lZCkge1xuIyAgICAgICAgIHZhciBydWxlID0ge1xuIyAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsXG4jICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IG9yaWdpbnNbZGV0YWlscy5yZXF1ZXN0SWRdXG4jICAgICAgICAgICAgIH07XG5cbiMgICAgICAgICBkZXRhaWxzLnJlc3BvbnNlSGVhZGVycy5wdXNoKHJ1bGUpO1xuIyAgICAgICAgIGRldGFpbHMucmVzcG9uc2VIZWFkZXJzLnB1c2goe1xuIyAgICAgICAgICAgICBcIm5hbWVcIjpcIkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCIsXG4jICAgICAgICAgICAgIFwidmFsdWVcIjpcInRydWVcIlxuIyAgICAgICAgIH0pO1xuIyAgICAgICAgIGRlbGV0ZSBvcmlnaW5zW2RldGFpbHMucmVxdWVzdElkXTtcbiMgICAgIH1cblxuIyAgICAgcmV0dXJuIHtyZXNwb25zZUhlYWRlcnM6IGRldGFpbHMucmVzcG9uc2VIZWFkZXJzfTtcbiMgfTtcblxuIyB2YXIgYmVmb3JlUmVxdWVzdExpc3RlbmVyID0gZnVuY3Rpb24oZGV0YWlscywga2V5KSB7XG5cbiMgICAgIHZhciByZSA9IG5ldyBSZWdFeHAodXJsc1trZXldLnJlZ2V4KTtcbiMgICAgIHZhciByZXBsID0gdXJsc1trZXldLnJlZ3JlcGxhY2U7XG5cbiMgICAgIGlmKGRldGFpbHMudXJsLm1hdGNoKHJlKSA9PSBudWxsKSByZXR1cm4ge307XG5cbiMgICAgIHJldHVybiB7XG4jICAgICAgICAgcmVkaXJlY3RVcmw6IGRldGFpbHMudXJsLnJlcGxhY2UocmUsIHJlcGwpXG4jICAgICB9O1xuIyB9XG5cbiMgZnVuY3Rpb24gY3JlYXRlTGlzdGVuZXIoa2V5LCBsaXN0ZW5lckZ1bmN0aW9uLCBsaXN0ZW5lcktleSkge1xuIyAgICAgdXJsc1trZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tsaXN0ZW5lcktleV0gPSBmdW5jdGlvbihkZXRhaWxzKSB7IHJldHVybiBsaXN0ZW5lckZ1bmN0aW9uKCkgfTtcbiMgICAgIHJldHVybiB1cmxzW2tleV0uX2xpc3RlbmVyRnVuY3Rpb25bbGlzdGVuZXJLZXldO1xuIyB9XG5cbiMgdmFyIGFkZExpc3RlbmVyczEgPSBmdW5jdGlvbih0YWJJZCkge1xuIyAgICAgcmVtb3ZlTGlzdGVuZXJzKCk7XG4jICAgICBmb3IodmFyIGtleSBpbiB1cmxzKSB7XG5cbiMgICAgICAgICBpZih1cmxzW2tleV0uY29ycyAhPSB1bmRlZmluZWQgJiYgdXJsc1trZXldLmNvcnMgPT0gdHJ1ZSkge1xuIyAgICAgICAgICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVNlbmRIZWFkZXJzLmFkZExpc3RlbmVyKFxuIyAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9rZXksIF90eXBlKSB7XG4jICAgICAgICAgICAgICAgICAgICAgaWYodXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnMgPT0gdW5kZWZpbmVkKSB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9ucyA9IHt9O1xuIyAgICAgICAgICAgICAgICAgICAgIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zW190eXBlXSA9IChmdW5jdGlvbihrZXkpIHtcbiMgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRldGFpbHMpIHtcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoZWFkZXJSZXF1ZXN0TGlzdGVuZXIoZGV0YWlscywga2V5KTtcbiMgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiMgICAgICAgICAgICAgICAgICAgICB9KGtleSkpO1xuIyAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tfdHlwZV07XG4jICAgICAgICAgICAgICAgICB9KGtleSwgJ29uQmVmb3JlU2VuZEhlYWRlcnMnKSksXG4jICAgICAgICAgICAgICAgICB7XG4jICAgICAgICAgICAgICAgICAgICAgdXJsczogW1wiPGFsbF91cmxzPlwiXSxcbiMgICAgICAgICAgICAgICAgICAgICB0YWJJZDogdGFiSWRcbiMgICAgICAgICAgICAgICAgIH0sXG4jICAgICAgICAgICAgICAgICBbXCJyZXF1ZXN0SGVhZGVyc1wiXVxuIyAgICAgICAgICAgICApO1xuXG4jICAgICAgICAgICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uSGVhZGVyc1JlY2VpdmVkLmFkZExpc3RlbmVyKFxuIyAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9rZXksIF90eXBlKSB7XG4jICAgICAgICAgICAgICAgICAgICAgaWYodXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnMgPT0gdW5kZWZpbmVkKSB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9ucyA9IHt9O1xuIyAgICAgICAgICAgICAgICAgICAgIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zW190eXBlXSA9IChmdW5jdGlvbihrZXkpIHtcbiMgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRldGFpbHMpIHtcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoZWFkZXJSZXNwb25zZUxpc3RlbmVyKGRldGFpbHMsIGtleSk7XG4jICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4jICAgICAgICAgICAgICAgICAgICAgfShrZXkpKTtcbiMgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbX3R5cGVdO1xuIyAgICAgICAgICAgICAgICAgfShrZXksICdvbkhlYWRlcnNSZWNlaXZlZCcpKSxcbiMgICAgICAgICAgICAgICAgIHtcbiMgICAgICAgICAgICAgICAgICAgICB1cmxzOiBbXCI8YWxsX3VybHM+XCJdLFxuIyAgICAgICAgICAgICAgICAgICAgIHRhYklkOiB0YWJJZFxuIyAgICAgICAgICAgICAgICAgfSxcbiMgICAgICAgICAgICAgICAgIFtcImJsb2NraW5nXCIsIFwicmVzcG9uc2VIZWFkZXJzXCJdXG4jICAgICAgICAgICAgICk7XG4jICAgICAgICAgfVxuXG4jICAgICAgICAgaWYodXJsc1trZXldLnJlZ2V4ICE9IHVuZGVmaW5lZCAmJiB1cmxzW2tleV0ucmVnZXgubGVuZ3RoID4gMCkge1xuIyAgICAgICAgICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QuYWRkTGlzdGVuZXIoXG4jICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX2tleSwgX3R5cGUpIHtcbiMgICAgICAgICAgICAgICAgICAgICBpZih1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9ucyA9PSB1bmRlZmluZWQpIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zID0ge307XG4jICAgICAgICAgICAgICAgICAgICAgdXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbX3R5cGVdID0gKGZ1bmN0aW9uKGtleSkge1xuIyAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGV0YWlscykge1xuIyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJlZm9yZVJlcXVlc3RMaXN0ZW5lcihkZXRhaWxzLCBrZXkpO1xuIyAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuIyAgICAgICAgICAgICAgICAgICAgIH0oa2V5KSk7XG4jICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zW190eXBlXTtcbiMgICAgICAgICAgICAgICAgIH0oa2V5LCAnb25CZWZvcmVSZXF1ZXN0JykpLFxuIyAgICAgICAgICAgICAgICAge1xuIyAgICAgICAgICAgICAgICAgICAgIHVybHM6IFtrZXldLFxuIyAgICAgICAgICAgICAgICAgICAgIHRhYklkOiB0YWJJZFxuIyAgICAgICAgICAgICAgICAgfSxcbiMgICAgICAgICAgICAgICAgIFtcImJsb2NraW5nXCJdXG4jICAgICAgICAgICAgICk7XG4jICAgICAgICAgfVxuXG4jICAgICB9XG4jIH1cblxuIyB2YXIgcmVtb3ZlTGlzdGVuZXJzID0gZnVuY3Rpb24odGFiSWQpIHtcbiMgICAgIGZvcih2YXIga2V5IGluIHVybHMpIHtcbiMgICAgICAgICBmb3IodmFyIGxrZXkgaW4gdXJsc1trZXldLl9saXN0ZW5lckZ1bmN0aW9ucykge1xuIyAgICAgICAgICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QucmVtb3ZlTGlzdGVuZXIodXJsc1trZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tsa2V5XSk7XG4jICAgICAgICAgICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uSGVhZGVyc1JlY2VpdmVkLnJlbW92ZUxpc3RlbmVyKHVybHNba2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbbGtleV0pO1xuIyAgICAgICAgICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVNlbmRIZWFkZXJzLnJlbW92ZUxpc3RlbmVyKHVybHNba2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbbGtleV0pO1xuIyAgICAgICAgIH1cbiMgICAgIH1cbiMgfVxuXG5cbiMgLy8gdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuIyAvLyB4aHIub3BlbignR0VUJywgJ2ZpbGU6Ly8vVXNlcnMvZGFuaWVsL0Ryb3Bib3gvZGV2L01hdmVuc01hdGUvM2RlbW8vc3JjL3BhY2thZ2UueG1sJywgdHJ1ZSk7XG4jIC8vIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4jIC8vIHhoci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG4jIC8vICAgYnRvYShTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5ldyBVaW50OEFycmF5KHRoaXMucmVzcG9uc2UpKTtcbiMgLy8gfTtcblxuIyAvLyB4aHIuc2VuZCgpO1xuXG5cblxuIl19
