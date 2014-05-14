(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{}],2:[function(require,module,exports){
var Application, ExtBackground, app,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Application = require('../../common.coffee');

ExtBackground = (function(_super) {
  var sendResources;

  __extends(ExtBackground, _super);

  function ExtBackground() {
    this.updateIcon = __bind(this.updateIcon, this);
    this.redirectListener = __bind(this.redirectListener, this);
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
        if (_this.isOn[tabId] == null) {
          return _this.updateIcon(tabId);
        }
      };
    })(this));
    this.LISTEN.Local('resources', (function(_this) {
      return function(resources) {};
    })(this));
    this.LISTEN.Ext('redirInfo', (function(_this) {
      return function(redirInfo) {
        _this.maps = redirInfo.maps;
        _this.server = redirInfo.server;
        if (redirInfo.matchingResources.length > 0) {
          _this.MSG.Ext({
            'startServer': true
          });
          _this.initRedirects();
          _this.isOn[_this.currentTabId] = true;
        } else {
          _this.launchUI(function(extInfo) {
            return void 0;
          }, function(error) {
            return _this.Notify('Error', error.message);
          });
        }
        return _this.updateIcon(_this.currentTabId);
      };
    })(this));
    return chrome.browserAction.onClicked.addListener((function(_this) {
      return function(tab) {
        _this.currentTabId = tab.id;
        if (_this.isOn[tab.id] == null) {
          _this.isOn[tab.id] = false;
        }
        if (!_this.isOn[tab.id]) {
          chrome.tabs.sendMessage(tab.id, {
            'getResources': true
          }, function(response) {
            return _this.launchApp(function(extInfo) {
              _this.MSG.Ext({
                'resources': response.resources
              });
              return _this.isOn[tab.id] = true;
            });
          });
        } else {
          _this.isOn[tab.id] = false;
          _this.killRedirects();
          _this.MSG.Ext({
            'stopServer': true
          });
        }
        return _this.updateIcon(tab.id);
      };
    })(this));
  };

  ExtBackground.prototype.getServer = function() {};

  ExtBackground.prototype.killRedirects = function() {
    return chrome.webRequest.onBeforeRequest.removeListener(this.redirectListener);
  };

  ExtBackground.prototype.initRedirects = function() {
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

  sendResources = function(resources) {
    return chrome.runtime.sendMessage(appId, {
      resources: resources
    });
  };

  return ExtBackground;

})(Application);

app = new ExtBackground;


},{"../../common.coffee":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9yZWRpcmVjdG9yL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcmVkaXJlY3Rvci9jb21tb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcmVkaXJlY3Rvci9leHRlbnNpb24vc3JjL2JhY2tncm91bmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQ0EsSUFBQSxrRkFBQTtFQUFBLGtGQUFBOztBQUFBLENBQUMsU0FBQSxHQUFBO0FBQ0MsTUFBQSxhQUFBO0FBQUEsRUFBQSxPQUFBLEdBQVUsQ0FDUixRQURRLEVBQ0UsT0FERixFQUNXLE9BRFgsRUFDb0IsT0FEcEIsRUFDNkIsS0FEN0IsRUFDb0MsUUFEcEMsRUFDOEMsT0FEOUMsRUFFUixXQUZRLEVBRUssT0FGTCxFQUVjLGdCQUZkLEVBRWdDLFVBRmhDLEVBRTRDLE1BRjVDLEVBRW9ELEtBRnBELEVBR1IsY0FIUSxFQUdRLFNBSFIsRUFHbUIsWUFIbkIsRUFHaUMsT0FIakMsRUFHMEMsTUFIMUMsRUFHa0QsU0FIbEQsRUFJUixXQUpRLEVBSUssT0FKTCxFQUljLE1BSmQsQ0FBVixDQUFBO0FBQUEsRUFLQSxJQUFBLEdBQU8sU0FBQSxHQUFBO0FBRUwsUUFBQSxxQkFBQTtBQUFBO1NBQUEsOENBQUE7c0JBQUE7VUFBd0IsQ0FBQSxPQUFTLENBQUEsQ0FBQTtBQUMvQixzQkFBQSxPQUFRLENBQUEsQ0FBQSxDQUFSLEdBQWEsS0FBYjtPQURGO0FBQUE7b0JBRks7RUFBQSxDQUxQLENBQUE7QUFVQSxFQUFBLElBQUcsK0JBQUg7V0FDRSxNQUFNLENBQUMsSUFBUCxHQUFjLFFBQVEsQ0FB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Q0FBQyxHQUEzQixDQUF0QyxDQUFBLENBQUE7QUFDQSxhQUFPO0FBQUEsUUFBQSxXQUFBLEVBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLEdBQWMsa0JBQUEsQ0FBbUIsT0FBTyxDQUFDLEdBQTNCLENBQTNCO09BQVAsQ0FGRjtLQUFBLE1BQUE7QUFJRSxhQUFPLEVBQVAsQ0FKRjtLQUhnQjtFQUFBLENBM0VsQixDQUFBOztBQUFBLDBCQXlHQSxVQUFBLEdBQVksU0FBQyxLQUFELEdBQUE7QUFDVixJQUFBLElBQUcsSUFBQyxDQUFBLElBQUssQ0FBQSxLQUFBLENBQVQ7YUFDRSxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQXJCLENBQ0U7QUFBQSxRQUFBLElBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFLLHdCQUFMO0FBQUEsVUFDQSxJQUFBLEVBQUssd0JBREw7U0FERjtBQUFBLFFBR0EsS0FBQSxFQUFNLEtBSE47T0FERixFQURGO0tBQUEsTUFBQTthQVFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBckIsQ0FDRTtBQUFBLFFBQUEsSUFBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQUsseUJBQUw7QUFBQSxVQUNBLElBQUEsRUFBSyx5QkFETDtTQURGO0FBQUEsUUFHQSxLQUFBLEVBQU0sS0FITjtPQURGLEVBUkY7S0FEVTtFQUFBLENBekdaLENBQUE7O0FBQUEsRUF5SEEsYUFBQSxHQUFnQixTQUFDLFNBQUQsR0FBQTtXQUNkLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBZixDQUEyQixLQUEzQixFQUFpQztBQUFBLE1BQUEsU0FBQSxFQUFVLFNBQVY7S0FBakMsRUFEYztFQUFBLENBekhoQixDQUFBOzt1QkFBQTs7R0FEMEIsWUFGNUIsQ0FBQTs7QUFBQSxHQStIQSxHQUFNLEdBQUEsQ0FBQSxhQS9ITixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxNzQyMDkzXG4oKCkgLT5cbiAgbWV0aG9kcyA9IFtcbiAgICAnYXNzZXJ0JywgJ2NsZWFyJywgJ2NvdW50JywgJ2RlYnVnJywgJ2RpcicsICdkaXJ4bWwnLCAnZXJyb3InLFxuICAgICdleGNlcHRpb24nLCAnZ3JvdXAnLCAnZ3JvdXBDb2xsYXBzZWQnLCAnZ3JvdXBFbmQnLCAnaW5mbycsICdsb2cnLFxuICAgICdtYXJrVGltZWxpbmUnLCAncHJvZmlsZScsICdwcm9maWxlRW5kJywgJ3RhYmxlJywgJ3RpbWUnLCAndGltZUVuZCcsXG4gICAgJ3RpbWVTdGFtcCcsICd0cmFjZScsICd3YXJuJ11cbiAgbm9vcCA9ICgpIC0+XG4gICAgIyBzdHViIHVuZGVmaW5lZCBtZXRob2RzLlxuICAgIGZvciBtIGluIG1ldGhvZHMgIHdoZW4gICFjb25zb2xlW21dXG4gICAgICBjb25zb2xlW21dID0gbm9vcFxuXG4gIGlmIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kP1xuICAgIHdpbmRvdy5zaG93ID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSlcbiAgZWxzZVxuICAgIHdpbmRvdy5zaG93ID0gKCkgLT5cbiAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpXG4pKClcblxuY2xhc3MgTm90aWZpY2F0aW9uXG4gIHNob3c6ICh0aXRsZSwgbWVzc2FnZSkgLT5cbiAgICB1bmlxdWVJZCA9IChsZW5ndGg9OCkgLT5cbiAgICAgIGlkID0gXCJcIlxuICAgICAgaWQgKz0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpIHdoaWxlIGlkLmxlbmd0aCA8IGxlbmd0aFxuICAgICAgaWQuc3Vic3RyIDAsIGxlbmd0aFxuXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlIHVuaXF1ZUlkKCksXG4gICAgICB0eXBlOidiYXNpYydcbiAgICAgIHRpdGxlOnRpdGxlXG4gICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICBpY29uVXJsOidpbWFnZXMvcmVkaXItb24tMzgucG5nJyxcbiAgICAgIChjYWxsYmFjaykgLT5cbiAgICAgICAgdW5kZWZpbmVkXG5cblxuXG5jbGFzcyBNU0dcbiAgaXNDb250ZW50U2NyaXB0OiBsb2NhdGlvbi5wcm90b2NvbCBpc250ICdjaHJvbWUtZXh0ZW5zaW9uOidcbiAgY29uc3RydWN0b3I6IChjb25maWcpIC0+XG4gICAgQGNvbmZpZyA9IGNvbmZpZ1xuICBMb2NhbDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgc2hvdyBcIj09IE1FU1NBR0UgI3sgSlNPTi5zdHJpbmdpZnkgbWVzc2FnZSB9ID09PlwiXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgbWVzc2FnZSwgcmVzcG9uZFxuICBFeHQ6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIHNob3cgXCI9PSBNRVNTQUdFICN7IEpTT04uc3RyaW5naWZ5IG1lc3NhZ2UgfSA9PT5cIlxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIEBjb25maWcuRVhUX0lELCBtZXNzYWdlLCByZXNwb25kXG5cbmNsYXNzIExJU1RFTlxuICBsb2NhbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZVxuICAgIGxpc3RlbmVyczp7fVxuICBleHRlcm5hbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsXG4gICAgbGlzdGVuZXJzOnt9XG4gIGNvbnN0cnVjdG9yOiAoY29uZmlnKSAtPlxuICAgIEBjb25maWcgPSBjb25maWdcbiAgICBAbG9jYWwuYXBpLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlXG4gICAgQGV4dGVybmFsLmFwaT8uYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gIExvY2FsOiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgQGxvY2FsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgRXh0OiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgX29uTWVzc2FnZUV4dGVybmFsOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgc2hvdyBcIjw9PSBFWFRFUk5BTCBNRVNTQUdFID09ICN7IEBjb25maWcuRVhUX1RZUEUgfSA9PVwiICsgcmVxdWVzdFxuICAgIGlmIHNlbmRlci5pZCBpc250IEBjb25maWcuRVhUX0lEIHRoZW4gcmV0dXJuIHVuZGVmaW5lZFxuICAgIEBleHRlcm5hbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBzZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG4gICAgIyBzZW5kUmVzcG9uc2UgcmVxdWVzdFtrZXldIGZvciBrZXkgb2YgcmVxdWVzdFxuXG4gIF9vbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICBzaG93IFwiPD09IE1FU1NBR0UgPT0gI3sgQGNvbmZpZy5FWFRfVFlQRSB9ID09XCIgKyByZXF1ZXN0XG4gICAgQGxvY2FsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIHNlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcblxuY2xhc3MgRGF0YVxuICBtYXBwaW5nOltcbiAgICBkaXJlY3Rvcnk6bnVsbFxuICAgIHVybFBhdHRlcm46bnVsbFxuICBdXG4gIHJlc291cmNlczpbXG4gICAgcmVzb3VyY2U6bnVsbFxuICAgIGZpbGU6bnVsbFxuICBdXG5cblxuXG5jbGFzcyBTdG9yYWdlXG4gIGFwaTogY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgZGF0YToge31cbiAgY2FsbGJhY2s6ICgpIC0+XG4gIGNvbnN0cnVjdG9yOiAoY2FsbGJhY2spIC0+XG4gICAgQGNhbGxiYWNrID0gY2FsbGJhY2tcbiAgICBAcmV0cmlldmVBbGwoKVxuICAgIEBvbkNoYW5nZWRBbGwoKVxuXG4gIHNhdmU6IChrZXksIGl0ZW0sIGNiKSAtPlxuICAgIG9iaiA9IHt9XG4gICAgb2JqW2tleV0gPSBpdGVtXG4gICAgQGFwaS5zZXQgb2JqLCAocmVzKSAtPlxuICAgICAgY2I/KClcblxuICBzYXZlQWxsOiAoKSAtPlxuICAgIEBhcGkuc2V0IEBkYXRhXG5cbiAgcmV0cmlldmU6IChrZXksIGNiKSAtPlxuICAgIEBhcGkuZ2V0IGtleSwgKHJlc3VsdHMpIC0+XG4gICAgICBAZGF0YVtyXSA9IHJlc3VsdHNbcl0gZm9yIHIgb2YgcmVzdWx0c1xuICAgICAgaWYgY2I/IHRoZW4gY2IgcmVzdWx0c1trZXldXG5cblxuICByZXRyaWV2ZUFsbDogKGNiKSAtPlxuICAgIEBhcGkuZ2V0IChyZXN1bHQpID0+XG4gICAgICBAZGF0YSA9IHJlc3VsdFxuICAgICAgQGNhbGxiYWNrPyByZXN1bHRcbiAgICAgIGNiPyByZXN1bHRcbiAgICAgIHNob3cgcmVzdWx0XG5cbiAgb25DaGFuZ2VkOiAoa2V5LCBjYikgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsIG5hbWVzcGFjZSkgLT5cbiAgICAgIGlmIGNoYW5nZXNba2V5XT8gYW5kIGNiPyB0aGVuIGNiIGNoYW5nZXNba2V5XS5uZXdWYWx1ZVxuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzXG5cbiAgb25DaGFuZ2VkQWxsOiAoKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcyxuYW1lc3BhY2UpID0+XG4gICAgICBAZGF0YVtjXSA9IGNoYW5nZXNbY10ubmV3VmFsdWUgZm9yIGMgb2YgY2hhbmdlc1xuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzXG5cblxuIyBjbGFzcyBEaXJlY3RvcnlTdG9yZVxuIyAgIGRpcmVjdG9yaWVzID1cbiMgICBjb25zdHJ1Y3RvciAoKSAtPlxuXG4jIGNsYXNzIERpcmVjdG9yeVxuXG5cbmNsYXNzIEZpbGVTeXN0ZW1cbiAgYXBpOiBjaHJvbWUuZmlsZVN5c3RlbVxuXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuXG4gICMgQGRpcnM6IG5ldyBEaXJlY3RvcnlTdG9yZVxuICAjIGZpbGVUb0FycmF5QnVmZmVyOiAoYmxvYiwgb25sb2FkLCBvbmVycm9yKSAtPlxuICAjICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAjICAgcmVhZGVyLm9ubG9hZCA9IG9ubG9hZFxuXG4gICMgICByZWFkZXIub25lcnJvciA9IG9uZXJyb3JcblxuICAjICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGJsb2JcblxuICByZWFkRmlsZTogKGRpckVudHJ5LCBwYXRoLCBzdWNjZXNzLCBlcnJvcikgLT5cbiAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBwYXRoLFxuICAgICAgKGZpbGVFbnRyeSkgPT5cbiAgICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgICAgc3VjY2VzcyhmaWxlRW50cnksIGZpbGUpXG4gICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgICAgICwoZXJyb3IpID0+IGVycm9yKClcblxuICBnZXRGaWxlRW50cnk6IChkaXJFbnRyeSwgcGF0aCwgc3VjY2VzcywgZXJyb3IpIC0+XG4gICAgaWYgZGlyRW50cnk/LmdldEZpbGU/XG4gICAgICBkaXJFbnRyeS5nZXRGaWxlIHBhdGgsIHt9LCAoZmlsZUVudHJ5KSAtPlxuICAgICAgICBzdWNjZXNzIGZpbGVFbnRyeVxuICAgIGVsc2UgZXJyb3IoKVxuXG4gIG9wZW5EaXJlY3Rvcnk6IChjYWxsYmFjaykgPT5cbiAgICBAYXBpLmNob29zZUVudHJ5IHR5cGU6J29wZW5EaXJlY3RvcnknLCAoZGlyZWN0b3J5RW50cnksIGZpbGVzKSA9PlxuICAgICAgQGFwaS5nZXREaXNwbGF5UGF0aCBkaXJlY3RvcnlFbnRyeSwgKHBhdGhOYW1lKSA9PlxuICAgICAgICBkaXIgPVxuICAgICAgICAgICAgcmVsUGF0aDogZGlyZWN0b3J5RW50cnkuZnVsbFBhdGgucmVwbGFjZSgnLycgKyBkaXJlY3RvcnlFbnRyeS5uYW1lLCAnJylcbiAgICAgICAgICAgIGRpcmVjdG9yeUVudHJ5SWQ6IEBhcGkucmV0YWluRW50cnkoZGlyZWN0b3J5RW50cnkpXG4gICAgICAgICAgICBlbnRyeTogZGlyZWN0b3J5RW50cnlcblxuICAgICAgICAgIGNhbGxiYWNrIHBhdGhOYW1lLCBkaXJcbiAgICAgICAgICAgICMgQGdldE9uZURpckxpc3QgZGlyXG4gICAgICAgICAgICAjIFN0b3JhZ2Uuc2F2ZSAnZGlyZWN0b3JpZXMnLCBAc2NvcGUuZGlyZWN0b3JpZXMgKHJlc3VsdCkgLT5cblxuXG5cbmNsYXNzIE1hcHBpbmdcbiAgcmVzb3VyY2U6IG51bGwgI2h0dHA6Ly9ibGFsYS5jb20vd2hhdC9ldmVyL2luZGV4LmpzXG4gIGxvY2FsOiBudWxsICMvc29tZXNoaXR0eURpci9vdGhlclNoaXR0eURpci9cbiAgcmVnZXg6IG51bGxcbiAgY29uc3RydWN0b3I6IChyZXNvdXJjZSwgbG9jYWwsIHJlZ2V4KSAtPlxuICAgIFtAbG9jYWwsIEByZXNvdXJjZSwgQHJlZ2V4XSA9IFtsb2NhbCwgcmVzb3VyY2UsIHJlZ2V4XVxuXG4gIGdldExvY2FsUmVzb3VyY2U6ICgpIC0+XG4gICAgQHJlc291cmNlLnJlcGxhY2UoQHJlZ2V4LCBAbG9jYWwpXG5cbiAgc2V0UmVkaXJlY3REZWNsYXJhdGl2ZTogKHRhYklkKSAtPlxuICAgIHJ1bGVzID0gW10ucHVzaFxuICAgICAgcHJpb3JpdHk6MTAwXG4gICAgICBjb25kaXRpb25zOiBbXG4gICAgICAgIG5ldyBjaHJvbWUuZGVjbGFyYXRpdmVXZWJSZXF1ZXN0LlJlcXVlc3RNYXRjaGVyXG4gICAgICAgICAgdXJsOlxuICAgICAgICAgICAgdXJsTWF0Y2hlczpAcmVnZXhcbiAgICAgICAgXVxuICAgICAgYWN0aW9uczogW1xuICAgICAgICBuZXcgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5SZWRpcmVjdFJlcXVlc3RcbiAgICAgICAgICByZWRpcmVjdFVybDpAZ2V0TG9jYWxSZXNvdXJjZSgpXG4gICAgICBdXG4gICAgY2hyb21lLmRlY2xhcmF0aXZlV2ViUmVxdWVzdC5vblJlcXVlc3QuYWRkUnVsZXMgcnVsZXNcblxuIyBjbGFzcyBTdG9yYWdlRmFjdG9yeVxuIyAgIG1ha2VPYmplY3Q6ICh0eXBlKSAtPlxuIyAgICAgc3dpdGNoIHR5cGVcbiMgICAgICAgd2hlbiAnUmVzb3VyY2VMaXN0J1xuIyAgIF9jcmVhdGU6ICh0eXBlKSAtPlxuIyAgICAgQGdldEZyb21TdG9yYWdlLnRoZW4gKG9iaikgLT5cbiMgICAgICAgcmV0dXJuIG9ialxuXG4jICAgZ2V0RnJvbVN0b3JhZ2U6ICgpIC0+XG4jICAgICBwcm9taXNlID0gbmV3IFByb21pc2UgKHN1Y2Nlc3MsIGZhaWwpIC0+XG4jICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCAoYSkgLT5cbiMgICAgICAgICBiID0gbmV3IFJlc291cmNlTGlzdFxuIyAgICAgICAgIGZvciBrZXkgb2YgYVxuIyAgICAgICAgICAgZG8gKGEpIC0+XG4jICAgICAgICAgICAgIGJba2V5XSA9IGFba2V5XVxuIyAgICAgICAgIHN1Y2Nlc3MgYlxuIyMjXG5jbGFzcyBGaWxlXG4gICAgY29uc3RydWN0b3I6IChkaXJlY3RvcnlFbnRyeSwgcGF0aCkgLT5cbiAgICAgICAgQGRpckVudHJ5ID0gZGlyZWN0b3J5RW50cnlcbiAgICAgICAgQHBhdGggPSBwYXRoXG4jIyNcblxuI1RPRE86IHJld3JpdGUgdGhpcyBjbGFzcyB1c2luZyB0aGUgbmV3IGNocm9tZS5zb2NrZXRzLiogYXBpIHdoZW4geW91IGNhbiBtYW5hZ2UgdG8gbWFrZSBpdCB3b3JrXG5jbGFzcyBTZXJ2ZXJcbiAgc29ja2V0OiBjaHJvbWUuc29ja2V0XG4gICMgdGNwOiBjaHJvbWUuc29ja2V0cy50Y3BcbiAgaG9zdDpcIjEyNy4wLjAuMVwiXG4gIHBvcnQ6ODA4NVxuICBtYXhDb25uZWN0aW9uczo1MDBcbiAgc29ja2V0UHJvcGVydGllczpcbiAgICAgIHBlcnNpc3RlbnQ6dHJ1ZVxuICAgICAgbmFtZTonU0xSZWRpcmVjdG9yJ1xuICBzb2NrZXRJbmZvOm51bGxcbiAgZ2V0TG9jYWxGaWxlOm51bGxcbiAgc29ja2V0SWRzOltdXG4gIHN0b3BwZWQ6dHJ1ZVxuXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuXG4gIHN0YXJ0OiAoaG9zdCxwb3J0LG1heENvbm5lY3Rpb25zLCBjYixlcnIpIC0+XG4gICAgQGhvc3QgPSBpZiBob3N0PyB0aGVuIGhvc3QgZWxzZSBAaG9zdFxuICAgIEBwb3J0ID0gaWYgcG9ydD8gdGhlbiBwb3J0IGVsc2UgQHBvcnRcbiAgICBAbWF4Q29ubmVjdGlvbnMgPSBpZiBtYXhDb25uZWN0aW9ucz8gdGhlbiBtYXhDb25uZWN0aW9ucyBlbHNlIEBtYXhDb25uZWN0aW9uc1xuXG4gICAgQGtpbGxBbGwgKHN1Y2Nlc3MpID0+XG4gICAgICBAc29ja2V0LmNyZWF0ZSAndGNwJywge30sIChzb2NrZXRJbmZvKSA9PlxuICAgICAgICBAc29ja2V0SWRzID0gW11cbiAgICAgICAgQHNvY2tldElkcy5wdXNoIHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0ICdzb2NrZXRJZHMnOkBzb2NrZXRJZHNcbiAgICAgICAgQHNvY2tldC5saXN0ZW4gc29ja2V0SW5mby5zb2NrZXRJZCwgQGhvc3QsIEBwb3J0LCAocmVzdWx0KSA9PlxuICAgICAgICAgIGlmIHJlc3VsdCA+IC0xXG4gICAgICAgICAgICBzaG93ICdsaXN0ZW5pbmcgJyArIHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgICAgIEBzdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICAgIEBzb2NrZXRJbmZvID0gc29ja2V0SW5mb1xuICAgICAgICAgICAgQHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuICAgICAgICAgICAgY2I/IHNvY2tldEluZm9cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnI/IHJlc3VsdFxuICAgICxlcnI/XG5cblxuICBraWxsQWxsOiAoY2FsbGJhY2ssIGVycm9yKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCAnc29ja2V0SWRzJywgKHJlc3VsdCkgPT5cbiAgICAgIHNob3cgJ2dvdCBpZHMnXG4gICAgICBzaG93IHJlc3VsdFxuICAgICAgQHNvY2tldElkcyA9IHJlc3VsdC5zb2NrZXRJZHNcbiAgICAgIGNudCA9IDBcbiAgICAgIGZvciBzIGluIEBzb2NrZXRJZHNcbiAgICAgICAgZG8gKHMpID0+XG4gICAgICAgICAgY250KytcbiAgICAgICAgICBAc29ja2V0LmdldEluZm8gcywgKHNvY2tldEluZm8pID0+XG4gICAgICAgICAgICBjbnQtLVxuICAgICAgICAgICAgaWYgbm90IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcj9cbiAgICAgICAgICAgICAgQHNvY2tldC5kaXNjb25uZWN0IHNcbiAgICAgICAgICAgICAgQHNvY2tldC5kZXN0cm95IHNcblxuICAgICAgICAgICAgY2FsbGJhY2s/KCkgaWYgY250IGlzIDBcblxuXG4gIHN0b3A6IChjYWxsYmFjaywgZXJyb3IpIC0+XG4gICAgQGtpbGxBbGwgKHN1Y2Nlc3MpID0+XG4gICAgICBAc3RvcHBlZCA9IHRydWVcbiAgICAgIGNhbGxiYWNrPygpXG4gICAgLChlcnJvcikgPT5cbiAgICAgIGVycm9yPyBlcnJvclxuXG5cbiAgX29uUmVjZWl2ZTogKHJlY2VpdmVJbmZvKSA9PlxuICAgIHNob3coXCJDbGllbnQgc29ja2V0ICdyZWNlaXZlJyBldmVudDogc2Q9XCIgKyByZWNlaXZlSW5mby5zb2NrZXRJZFxuICAgICsgXCIsIGJ5dGVzPVwiICsgcmVjZWl2ZUluZm8uZGF0YS5ieXRlTGVuZ3RoKVxuXG4gIF9vbkxpc3RlbjogKHNlcnZlclNvY2tldElkLCByZXN1bHRDb2RlKSA9PlxuICAgIHJldHVybiBzaG93ICdFcnJvciBMaXN0ZW5pbmc6ICcgKyBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSBpZiByZXN1bHRDb2RlIDwgMFxuICAgIEBzZXJ2ZXJTb2NrZXRJZCA9IHNlcnZlclNvY2tldElkXG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdC5hZGRMaXN0ZW5lciBAX29uQWNjZXB0XG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdEVycm9yLmFkZExpc3RlbmVyIEBfb25BY2NlcHRFcnJvclxuICAgIEB0Y3Aub25SZWNlaXZlLmFkZExpc3RlbmVyIEBfb25SZWNlaXZlXG4gICAgIyBzaG93IFwiW1wiK3NvY2tldEluZm8ucGVlckFkZHJlc3MrXCI6XCIrc29ja2V0SW5mby5wZWVyUG9ydCtcIl0gQ29ubmVjdGlvbiBhY2NlcHRlZCFcIjtcbiAgICAjIGluZm8gPSBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAjIEBnZXRGaWxlIHVyaSwgKGZpbGUpIC0+XG4gIF9vbkFjY2VwdEVycm9yOiAoZXJyb3IpIC0+XG4gICAgc2hvdyBlcnJvclxuXG4gIF9vbkFjY2VwdDogKHNvY2tldEluZm8pID0+XG4gICAgIyByZXR1cm4gbnVsbCBpZiBpbmZvLnNvY2tldElkIGlzbnQgQHNlcnZlclNvY2tldElkXG4gICAgc2hvdyhcIlNlcnZlciBzb2NrZXQgJ2FjY2VwdCcgZXZlbnQ6IHNkPVwiICsgc29ja2V0SW5mby5zb2NrZXRJZClcbiAgICBpZiBzb2NrZXRJbmZvPy5zb2NrZXRJZD9cbiAgICAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZCwgKGluZm8pID0+XG4gICAgICAgIEBnZXRMb2NhbEZpbGUgaW5mbywgKGZpbGVFbnRyeSwgZmlsZVJlYWRlcikgPT5cbiAgICAgICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJbmZvLnNvY2tldElkLCBmaWxlRW50cnksIGZpbGVSZWFkZXIsIGluZm8ua2VlcEFsaXZlXG4gICAgICAgICwoZXJyb3IpID0+XG4gICAgICAgICAgICBAX3dyaXRlRXJyb3Igc29ja2V0SW5mby5zb2NrZXRJZCwgNDA0LCBpbmZvLmtlZXBBbGl2ZVxuICAgIGVsc2VcbiAgICAgIHNob3cgXCJObyBzb2NrZXQ/IVwiXG4gICAgIyBAc29ja2V0LmFjY2VwdCBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cblxuXG4gIHN0cmluZ1RvVWludDhBcnJheTogKHN0cmluZykgLT5cbiAgICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyaW5nLmxlbmd0aClcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIGkgPSAwXG5cbiAgICB3aGlsZSBpIDwgc3RyaW5nLmxlbmd0aFxuICAgICAgdmlld1tpXSA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG4gICAgICBpKytcbiAgICB2aWV3XG5cbiAgYXJyYXlCdWZmZXJUb1N0cmluZzogKGJ1ZmZlcikgLT5cbiAgICBzdHIgPSBcIlwiXG4gICAgdUFycmF5VmFsID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIHMgPSAwXG5cbiAgICB3aGlsZSBzIDwgdUFycmF5VmFsLmxlbmd0aFxuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodUFycmF5VmFsW3NdKVxuICAgICAgcysrXG4gICAgc3RyXG5cbiAgX3dyaXRlMjAwUmVzcG9uc2U6IChzb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlLCBrZWVwQWxpdmUpIC0+XG4gICAgY29udGVudFR5cGUgPSAoaWYgKGZpbGUudHlwZSBpcyBcIlwiKSB0aGVuIFwidGV4dC9wbGFpblwiIGVsc2UgZmlsZS50eXBlKVxuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgMjAwIE9LXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuXG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXJcbiAgICByZWFkZXIub25sb2FkID0gKGV2KSA9PlxuICAgICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZXYudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICAgIHNob3cgd3JpdGVJbmZvXG4gICAgICAgICMgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIub25lcnJvciA9IChlcnJvcikgPT5cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBmaWxlXG5cblxuICAgICMgQGVuZCBzb2NrZXRJZFxuICAgICMgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAjIGZpbGVSZWFkZXIub25sb2FkID0gKGUpID0+XG4gICAgIyAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgIyAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAjICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgIyAgICAgICBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SWRcblxuXG4gIF9yZWFkRnJvbVNvY2tldDogKHNvY2tldElkLCBjYikgLT5cbiAgICBAc29ja2V0LnJlYWQgc29ja2V0SWQsIChyZWFkSW5mbykgPT5cbiAgICAgIHNob3cgXCJSRUFEXCIsIHJlYWRJbmZvXG5cbiAgICAgICMgUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICBkYXRhID0gQGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSlcbiAgICAgIHNob3cgZGF0YVxuXG4gICAgICBpZiBkYXRhLmluZGV4T2YoXCJHRVQgXCIpIGlzbnQgMFxuICAgICAgICBAZW5kIHNvY2tldElkXG4gICAgICAgIHJldHVyblxuXG4gICAgICBrZWVwQWxpdmUgPSBmYWxzZVxuICAgICAga2VlcEFsaXZlID0gdHJ1ZSBpZiBkYXRhLmluZGV4T2YgJ0Nvbm5lY3Rpb246IGtlZXAtYWxpdmUnIGlzbnQgLTFcblxuICAgICAgdXJpRW5kID0gZGF0YS5pbmRleE9mKFwiIFwiLCA0KVxuXG4gICAgICByZXR1cm4gZW5kIHNvY2tldElkIGlmIHVyaUVuZCA8IDBcblxuICAgICAgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKVxuICAgICAgaWYgbm90IHVyaT9cbiAgICAgICAgd3JpdGVFcnJvciBzb2NrZXRJZCwgNDA0LCBrZWVwQWxpdmVcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGluZm8gPVxuICAgICAgICB1cmk6IHVyaVxuICAgICAgICBrZWVwQWxpdmU6a2VlcEFsaXZlXG4gICAgICBpbmZvLnJlZmVyZXIgPSBkYXRhLm1hdGNoKC9SZWZlcmVyOlxccyguKikvKT9bMV1cbiAgICAgICNzdWNjZXNzXG4gICAgICBjYj8gaW5mb1xuXG4gIGVuZDogKHNvY2tldElkLCBrZWVwQWxpdmUpIC0+XG4gICAgICAjIGlmIGtlZXBBbGl2ZVxuICAgICAgIyAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICMgZWxzZVxuICAgIEBzb2NrZXQuZGlzY29ubmVjdCBzb2NrZXRJZFxuICAgIEBzb2NrZXQuZGVzdHJveSBzb2NrZXRJZFxuICAgIHNob3cgJ2VuZGluZyAnICsgc29ja2V0SWRcbiAgICBAc29ja2V0LmFjY2VwdCBAc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG4gIF93cml0ZUVycm9yOiAoc29ja2V0SWQsIGVycm9yQ29kZSwga2VlcEFsaXZlKSAtPlxuICAgIGZpbGUgPSBzaXplOiAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogYmVnaW4uLi4gXCJcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBmaWxlID0gXCIgKyBmaWxlXG4gICAgY29udGVudFR5cGUgPSBcInRleHQvcGxhaW5cIiAjKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIFwiICsgZXJyb3JDb2RlICsgXCIgTm90IEZvdW5kXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyBoZWFkZXIuLi5cIlxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyB2aWV3Li4uXCJcbiAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcblxuY2xhc3MgQXBwbGljYXRpb25cblxuICBjb25maWc6XG4gICAgQVBQX0lEOiAnY2VjaWZhZnBoZWdob2ZwZmRraGVra2liY2liaGdmZWMnXG4gICAgRVhURU5TSU9OX0lEOiAnZGRkaW1ibmppYmpjYWZib2tuYmdoZWhiZmFqZ2dnZXAnXG5cbiAgZGF0YTpudWxsXG4gIExJU1RFTjogbnVsbFxuICBNU0c6IG51bGxcbiAgU3RvcmFnZTogbnVsbFxuICBGUzogbnVsbFxuICBTZXJ2ZXI6IG51bGxcbiAgTm90aWZ5OiBudWxsXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQE5vdGlmeSA9IChuZXcgTm90aWZpY2F0aW9uKS5zaG93XG4gICAgQFN0b3JhZ2UgPSBuZXcgU3RvcmFnZVxuICAgIEBGUyA9IG5ldyBGaWxlU3lzdGVtXG4gICAgQFNlcnZlciA9IG5ldyBTZXJ2ZXJcbiAgICBAY29uZmlnLlNFTEZfSUQgPSBjaHJvbWUucnVudGltZS5pZFxuICAgIEBjb25maWcuRVhUX0lEID0gaWYgQGNvbmZpZy5BUFBfSUQgaXMgQGNvbmZpZy5TRUxGX0lEIHRoZW4gQGNvbmZpZy5FWFRFTlNJT05fSUQgZWxzZSBAY29uZmlnLkFQUF9JRFxuICAgIEBjb25maWcuRVhUX1RZUEUgPSBpZiBAY29uZmlnLkFQUF9JRCBpc250IEBjb25maWcuU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcbiAgICBATVNHID0gbmV3IE1TRyBAY29uZmlnXG4gICAgQExJU1RFTiA9IG5ldyBMSVNURU4gQGNvbmZpZ1xuXG4gICAgQGFwcFdpbmRvdyA9IG51bGxcbiAgICBAcG9ydCA9IDMxMzM3XG4gICAgQGRhdGEgPSBAU3RvcmFnZS5kYXRhXG4gICAgQExJU1RFTi5FeHQgJ29wZW5BcHAnLCBAb3BlbkFwcFxuICAgIEBpbml0KClcblxuICBpbml0OiAoKSA9PlxuXG4gIGxhdW5jaFVJOiAoY2IsIGVycm9yKSAtPlxuICAgIEBsYXVuY2hBcHAgKGV4dEluZm8pID0+XG4gICAgICBAb3BlbkFwcCgpXG4gICAgICBjYj8gZXh0SW5mb1xuICAgICxlcnJvclxuXG4gIGxhdW5jaEFwcDogKGNiLCBlcnJvciwgb3BlblVJKSAtPlxuICAgICAgY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIEBjb25maWcuQVBQX0lELCAoZXh0SW5mbykgPT5cbiAgICAgICAgaWYgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICAgICAgZXJyb3IgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjYj8gZXh0SW5mb1xuXG4gIG9wZW5BcHA6ICgpID0+XG4gICAgaWYgY2hyb21lLmFwcD8ud2luZG93P1xuICAgICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJyxcbiAgICAgICAgaWQ6IFwibWFpbndpblwiXG4gICAgICAgIGJvdW5kczpcbiAgICAgICAgICB3aWR0aDo1MDBcbiAgICAgICAgICBoZWlnaHQ6ODAwLFxuICAgICAgKHdpbikgPT5cbiAgICAgICAgQGFwcFdpbmRvdyA9IHdpbilcbiAgICBlbHNlXG4gICAgICBATVNHLkV4dCAnb3BlbkFwcCc6dHJ1ZVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb25cbiIsIiMgZ2V0R2xvYmFsID0gLT5cbiMgICBfZ2V0R2xvYmFsID0gLT5cbiMgICAgIHRoaXNcblxuIyAgIF9nZXRHbG9iYWwoKVxuXG4jIHJvb3QgPSBnZXRHbG9iYWwoKVxuXG4jIHJvb3QuYXBwID0gYXBwID0gcmVxdWlyZSAnLi4vLi4vY29tbW9uLmNvZmZlZSdcbiMgYXBwID0gbmV3IGxpYi5BcHBsaWNhdGlvblxuXG5BcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5cbmNsYXNzIEV4dEJhY2tncm91bmQgZXh0ZW5kcyBBcHBsaWNhdGlvblxuICB1cmxzOiB7fVxuICB1cmxBcnI6IFtdXG4gIG9yaWdpbnM6IHt9XG4gIGlzT246IHt9XG4gIGZpbGVzOiB7fVxuICBleHRQb3J0OiB7fVxuICBjdXJyZW50VGFiSWQ6bnVsbFxuICBtYXBzOiBbXVxuXG4gIGluaXQ6ICgpIC0+XG4gICAgY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyICh0YWJJZCkgPT5cbiAgICAgICMgQGN1cnJlbnRUYWJJZCA9IHRhYklkXG4gICAgICBAdXBkYXRlSWNvbih0YWJJZCkgaWYgbm90IEBpc09uW3RhYklkXT9cblxuICAgIEBMSVNURU4uTG9jYWwgJ3Jlc291cmNlcycsIChyZXNvdXJjZXMpID0+XG5cbiAgICBATElTVEVOLkV4dCAncmVkaXJJbmZvJywgKHJlZGlySW5mbykgPT5cbiAgICAgIEBtYXBzID0gcmVkaXJJbmZvLm1hcHNcbiAgICAgIEBzZXJ2ZXIgPSByZWRpckluZm8uc2VydmVyXG4gICAgICBpZiByZWRpckluZm8ubWF0Y2hpbmdSZXNvdXJjZXMubGVuZ3RoID4gMFxuICAgICAgICBATVNHLkV4dCAnc3RhcnRTZXJ2ZXInOnRydWVcbiAgICAgICAgQGluaXRSZWRpcmVjdHMoKVxuICAgICAgICAjIEBOb3RpZnkgJ1JlZGlyZWN0aW5nJywgJ1JlZGlyZWN0aW5nIGVuYWJsZWQgZm9yIHRoaXMgdGFiJ1xuICAgICAgICBAaXNPbltAY3VycmVudFRhYklkXSA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgQGxhdW5jaFVJIChleHRJbmZvKSA9PlxuICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICAsKGVycm9yKSA9PlxuICAgICAgICAgIEBOb3RpZnkgJ0Vycm9yJywgZXJyb3IubWVzc2FnZVxuICAgICAgQHVwZGF0ZUljb24gQGN1cnJlbnRUYWJJZFxuXG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24ub25DbGlja2VkLmFkZExpc3RlbmVyICh0YWIpID0+XG4gICAgICBAY3VycmVudFRhYklkID0gdGFiLmlkXG4gICAgICBpZiBub3QgQGlzT25bdGFiLmlkXT8gdGhlbiBAaXNPblt0YWIuaWRdID0gZmFsc2VcblxuICAgICAgaWYgbm90IEBpc09uW3RhYi5pZF1cbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UgdGFiLmlkLCAnZ2V0UmVzb3VyY2VzJzp0cnVlLCAocmVzcG9uc2UpID0+XG4gICAgICAgICAgQGxhdW5jaEFwcCAoZXh0SW5mbykgPT5cbiAgICAgICAgICAgIEBNU0cuRXh0ICdyZXNvdXJjZXMnOnJlc3BvbnNlLnJlc291cmNlc1xuICAgICAgICAgICAgQGlzT25bdGFiLmlkXSA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgQGlzT25bdGFiLmlkXSA9IGZhbHNlXG4gICAgICAgIEBraWxsUmVkaXJlY3RzKClcbiAgICAgICAgQE1TRy5FeHQgJ3N0b3BTZXJ2ZXInOnRydWVcbiAgICAgIEB1cGRhdGVJY29uIHRhYi5pZFxuXG5cbiAgZ2V0U2VydmVyOiAoKSAtPlxuXG4gIGtpbGxSZWRpcmVjdHM6ICgpIC0+XG4gICAgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVSZXF1ZXN0LnJlbW92ZUxpc3RlbmVyKEByZWRpcmVjdExpc3RlbmVyKVxuXG4gIGluaXRSZWRpcmVjdHM6ICgpIC0+XG4gICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QuYWRkTGlzdGVuZXIgQHJlZGlyZWN0TGlzdGVuZXIsXG4gICAgICAgICB1cmxzOlsnPGFsbF91cmxzPiddXG4gICAgICAgICB0YWJJZDpAY3VycmVudFRhYklkLFxuICAgICAgICAgWydibG9ja2luZyddXG5cbiAgICAjIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlU2VuZEhlYWRlcnMuYWRkTGlzdGVuZXIgQGhlYWRlckxpc3RlbmVyLFxuICAgICMgICAgIHVybHM6Wyc8YWxsX3VybHM+J11cbiAgICAjICAgICB0YWJJZDpAY3VycmVudFRhYklkLFxuICAgICMgICAgIFsncmVxdWVzdEhlYWRlcnMnXVxuXG4gICAgIyBjaHJvbWUud2ViUmVxdWVzdC5vbkhlYWRlcnNSZWNlaXZlZC5hZGRMaXN0ZW5lciAoKGRldGFpbHMpID0+IEByZWRpcmVjdExpc3RlbmVyKGRldGFpbHMpKSxcbiAgICAjICAgICB1cmxzOlsnPGFsbF91cmxzPiddXG4gICAgIyAgICAgdGFiSWQ6QGN1cnJlbnRUYWJJZCxcbiAgICAjICAgICBbJ2Jsb2NraW5nJywncmVzcG9uc2VIZWFkZXJzJ11cblxuICBtYXRjaDogKHVybCkgLT5cbiAgICByZXR1cm4gbWFwIGZvciBtYXAgaW4gQG1hcHMgd2hlbiB1cmwubWF0Y2gobWFwLnVybCk/IGFuZCBtYXAudXJsP1xuICAgIHJldHVybiBudWxsXG5cbiAgaGVhZGVyTGlzdGVuZXI6IChkZXRhaWxzKSAtPlxuICAgIHNob3cgZGV0YWlsc1xuXG4gIHJlZGlyZWN0TGlzdGVuZXI6IChkZXRhaWxzKSA9PlxuICAgIHNob3cgZGV0YWlsc1xuICAgIG1hcCA9IEBtYXRjaCBkZXRhaWxzLnVybFxuICAgIGlmIG1hcD9cbiAgICAgIHNob3cgJ3JlZGlyZWN0ZWQgdG8gJyArIEBzZXJ2ZXIudXJsICsgZW5jb2RlVVJJQ29tcG9uZW50KGRldGFpbHMudXJsKVxuICAgICAgcmV0dXJuIHJlZGlyZWN0VXJsOiBAc2VydmVyLnVybCArIGVuY29kZVVSSUNvbXBvbmVudChkZXRhaWxzLnVybCkgI2RldGFpbHMudXJsLnJlcGxhY2UobmV3IFJlZ0V4cChtYXAudXJsKSwgbWFwLnJlZ2V4UmVwbClcbiAgICBlbHNlXG4gICAgICByZXR1cm4ge31cbiMge1xuIyAgICAgICAgICAgICAgICAgICAgIHVybHM6IFtrZXldLFxuIyAgICAgICAgICAgICAgICAgICAgIHRhYklkOiB0YWJJZFxuIyAgICAgICAgICAgICAgICAgfSxcbiMgICAgICAgICAgICAgICAgIFtcImJsb2NraW5nXCJdXG4gICAgICMgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVTZW5kSGVhZGVycy5hZGRMaXN0ZW5lcihcbiAgICAgIyAgICAgICAgIChmdW5jdGlvbihfa2V5LCBfdHlwZSkge1xuICAgICAjICAgICAgICAgICAgIGlmKHVybHNbX2tleV0uX2xpc3RlbmVyRnVuY3Rpb25zID09IHVuZGVmaW5lZCkgdXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnMgPSB7fTtcbiAgICAgIyAgICAgICAgICAgICB1cmxzW19rZXldLl9saXN0ZW5lckZ1bmN0aW9uc1tfdHlwZV0gPSAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICMgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihkZXRhaWxzKSB7XG4gICAgICMgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGVhZGVyUmVxdWVzdExpc3RlbmVyKGRldGFpbHMsIGtleSk7XG4gICAgICMgICAgICAgICAgICAgICAgIH07XG4gICAgICMgICAgICAgICAgICAgfShrZXkpKTtcbiAgICAgIyAgICAgICAgICAgICByZXR1cm4gdXJsc1tfa2V5XS5fbGlzdGVuZXJGdW5jdGlvbnNbX3R5cGVdO1xuICAgICAjICAgICAgICAgfShrZXksICdvbkJlZm9yZVNlbmRIZWFkZXJzJykpLFxuICAgICAjICAgICAgICAge1xuICAgICAjICAgICAgICAgICAgIHVybHM6IFtcIjxhbGxfdXJscz5cIl0sXG4gICAgICMgICAgICAgICAgICAgdGFiSWQ6IHRhYklkXG4gICAgICMgICAgICAgICB9LFxuICAgICAjICAgICAgICAgW1wicmVxdWVzdEhlYWRlcnNcIl1cbiAgICAgIyAgICAgKTtcblxuICB1cGRhdGVJY29uOiAodGFiSWQpID0+XG4gICAgaWYgQGlzT25bdGFiSWRdXG4gICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRJY29uKFxuICAgICAgICBwYXRoOlxuICAgICAgICAgICcxOSc6J2ltYWdlcy9yZWRpci1vbi0xOS5wbmcnXG4gICAgICAgICAgJzM4JzonaW1hZ2VzL3JlZGlyLW9uLTM4LnBuZydcbiAgICAgICAgdGFiSWQ6dGFiSWRcbiAgICAgICAgIClcbiAgICBlbHNlXG4gICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRJY29uKFxuICAgICAgICBwYXRoOlxuICAgICAgICAgICcxOSc6J2ltYWdlcy9yZWRpci1vZmYtMTkucG5nJ1xuICAgICAgICAgICczOCc6J2ltYWdlcy9yZWRpci1vZmYtMzgucG5nJ1xuICAgICAgICB0YWJJZDp0YWJJZFxuICAgICAgKVxuXG4gIHNlbmRSZXNvdXJjZXMgPSAocmVzb3VyY2VzKSAtPlxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKGFwcElkLHJlc291cmNlczpyZXNvdXJjZXMpXG5cbmFwcCA9IG5ldyBFeHRCYWNrZ3JvdW5kXG4iXX0=
