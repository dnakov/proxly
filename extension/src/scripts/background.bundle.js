(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Application, Config, FileSystem, LISTEN, MSG, Notification, Server, Storage,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

require('./util.coffee');

Config = require('./config.coffee');

MSG = require('./msg.coffee');

LISTEN = require('./listen.coffee');

Storage = require('./storage.coffee');

FileSystem = require('./filesystem.coffee');

Notification = require('./notification.coffee');

Server = require('./server.coffee');

Application = (function(_super) {
  __extends(Application, _super);

  Application.prototype.LISTEN = null;

  Application.prototype.MSG = null;

  Application.prototype.Storage = null;

  Application.prototype.FS = null;

  Application.prototype.Server = null;

  Application.prototype.Notify = null;

  Application.prototype.platform = null;

  Application.prototype.currentTabId = null;

  function Application(deps) {
    this.changePort = __bind(this.changePort, this);
    this.getLocalFile = __bind(this.getLocalFile, this);
    this.openApp = __bind(this.openApp, this);
    var prop;
    Application.__super__.constructor.apply(this, arguments);
    if (this.MSG == null) {
      this.MSG = MSG.get();
    }
    if (this.LISTEN == null) {
      this.LISTEN = LISTEN.get();
    }
    for (prop in deps) {
      if (typeof deps[prop] === "object") {
        this[prop] = this.wrapObjInbound(deps[prop]);
      }
      if (typeof deps[prop] === "function") {
        this[prop] = this.wrapObjOutbound(new deps[prop]);
      }
    }
    if (this.Notify == null) {
      this.Notify = (new Notification).show;
    }
    this.data = this.Storage.data;
    this.wrap = this.SELF_TYPE === 'APP' ? this.wrapInbound : this.wrapOutbound;
    this.openApp = this.wrap(this, 'Application.openApp', this.openApp);
    this.launchApp = this.wrap(this, 'Application.launchApp', this.launchApp);
    this.startServer = this.wrap(this, 'Application.startServer', this.startServer);
    this.restartServer = this.wrap(this, 'Application.restartServer', this.restartServer);
    this.stopServer = this.wrap(this, 'Application.stopServer', this.stopServer);
    this.wrap = this.SELF_TYPE === 'EXTENSION' ? this.wrapInbound : this.wrapOutbound;
    this.getResources = this.wrap(this, 'Application.getResources', this.getResources);
    this.getCurrentTab = this.wrap(this, 'Application.getCurrentTab', this.getCurrentTab);
    chrome.runtime.getPlatformInfo((function(_this) {
      return function(info) {
        return _this.platform = info;
      };
    })(this));
    this.init();
  }

  Application.prototype.init = function() {
    return this.data.server = {
      host: "127.0.0.1",
      port: 8089,
      isOn: false
    };
  };

  Application.prototype.getCurrentTab = function(cb) {
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (function(_this) {
      return function(tabs) {
        _this.currentTabId = tabs[0].id;
        return typeof cb === "function" ? cb(_this.currentTabId) : void 0;
      };
    })(this));
  };

  Application.prototype.launchApp = function(cb, error) {
    return chrome.management.launchApp(this.APP_ID, (function(_this) {
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
    return chrome.app.window.create('index.html', {
      id: "mainwin",
      bounds: {
        width: 770,
        height: 800
      }
    }, (function(_this) {
      return function(win) {
        return _this.appWindow = win;
      };
    })(this));
  };

  Application.prototype.getCurrentTab = function(cb) {
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (function(_this) {
      return function(tabs) {
        _this.currentTabId = tabs[0].id;
        return typeof cb === "function" ? cb(_this.currentTabId) : void 0;
      };
    })(this));
  };

  Application.prototype.getResources = function(cb) {
    return this.getCurrentTab((function(_this) {
      return function(tabId) {
        return chrome.tabs.executeScript(tabId, {
          file: 'scripts/content.js'
        }, function(results) {
          var r, res, _i, _j, _len, _len1;
          _this.data.currentResources = [];
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            r = results[_i];
            for (_j = 0, _len1 = r.length; _j < _len1; _j++) {
              res = r[_j];
              _this.data.currentResources.push(res);
            }
          }
          return typeof cb === "function" ? cb() : void 0;
        });
      };
    })(this));
  };

  Application.prototype.getLocalFile = function(info, cb, err) {
    var fileEntryId, filePath, url;
    url = info.uri;
    filePath = this.getLocalFilePath(url);
    fileEntryId = this.data.currentFileMatches[filePath].fileEntry;
    if (fileEntryId != null) {
      return chrome.fileSystem.restoreEntry(fileEntryId, (function(_this) {
        return function(fileEntry) {
          return fileEntry.file(function(file) {
            return typeof cb === "function" ? cb(fileEntry, file) : void 0;
          }, err);
        };
      })(this));
    }
  };

  Application.prototype.startServer = function(cb, err) {
    if (this.Server.stopped === true) {
      return this.Server.start(this.data.server.host, this.data.server.port, null, (function(_this) {
        return function(socketInfo) {
          _this.data.server.url = 'http://' + _this.data.server.host + ':' + _this.data.server.port + '/';
          _this.data.server.isOn = true;
          _this.Notify("Server Started", "Started Server http://" + _this.data.server.host + ":" + _this.data.server.port);
          return typeof cb === "function" ? cb() : void 0;
        };
      })(this), (function(_this) {
        return function(error) {
          _this.Notify("Server Error", "Error Starting Server: " + error);
          _this.data.server.url = 'http://' + _this.data.server.host + ':' + _this.data.server.port + '/';
          _this.data.server.isOn = true;
          return typeof err === "function" ? err() : void 0;
        };
      })(this));
    }
  };

  Application.prototype.stopServer = function(cb, err) {
    return this.Server.stop((function(_this) {
      return function(success) {
        _this.Notify('Server Stopped', "Server Stopped");
        _this.data.server.url = '';
        _this.data.server.isOn = false;
        return typeof cb === "function" ? cb() : void 0;
      };
    })(this), (function(_this) {
      return function(error) {
        if (typeof err === "function") {
          err();
        }
        return _this.Notify("Server Error", "Server could not be stopped: " + error);
      };
    })(this));
  };

  Application.prototype.restartServer = function() {
    return this.stopServer((function(_this) {
      return function() {
        return _this.startServer();
      };
    })(this));
  };

  Application.prototype.changePort = function() {};

  Application.prototype.getLocalFilePath = function(url) {
    var filePath, filePathRegex, map, resPath, _base, _i, _len, _ref, _ref1;
    filePathRegex = /^((http[s]?|ftp|chrome-extension|file):\/\/)?\/?([^\/\.]+\.)*?([^\/\.]+\.[^:\/\s\.]{2,3}(\.[^:\/\s\.]‌​{2,3})?)(:\d+)?($|\/)([^#?\s]+)?(.*?)?(#[\w\-]+)?$/;
    if ((_base = this.data).currentFileMatches == null) {
      _base.currentFileMatches = {};
    }
    if (!((this.data.maps != null) && (this.data.directories != null))) {
      return {};
    }
    resPath = (_ref = url.match(filePathRegex)) != null ? _ref[8] : void 0;
    if (resPath == null) {
      return {};
    }
    _ref1 = this.data.maps;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      map = _ref1[_i];
      resPath = (url.match(new RegExp(map.url)) != null) && (map.url != null);
      if (resPath) {
        if (typeof referer !== "undefined" && referer !== null) {

        } else {
          filePath = url.replace(new RegExp(map.url), map.regexRepl);
        }
        break;
      }
    }
    return filePath;
  };

  Application.prototype.findLocalFilePathForURL = function(url, cb) {
    var filePath;
    filePath = this.getLocalFilePath(url);
    if (filePath == null) {
      return;
    }
    return this.findFileInDirectories(this.data.directories, filePath, (function(_this) {
      return function(fileEntry, directory) {
        delete fileEntry.entry;
        _this.data.currentFileMatches[filePath] = {
          fileEntry: chrome.fileSystem.retainEntry(fileEntry),
          filePath: filePath,
          directory: directory
        };
        return typeof cb === "function" ? cb(_this.data.currentFileMatches[filePath], directory) : void 0;
      };
    })(this), (function(_this) {
      return function(err) {
        return show('no files found for ' + filePath);
      };
    })(this));
  };

  Application.prototype.findFileInDirectories = function(directories, path, cb, err) {
    var allDirs, dir, _dirs, _path;
    if (typeof allDirs === "undefined" || allDirs === null) {
      allDirs = directories.slice();
    }
    if (directories === void 0 || path === void 0) {
      err();
    }
    _dirs = allDirs.slice();
    _path = path;
    dir = _dirs.shift();
    if (dir === void 0) {
      _path.replace(/.*?\//, '');
    }
    if (_path.match(/.*?\//) != null) {
      if (dir === void 0) {
        _dirs = allDirs.slice();
        dir = _dirs.shift();
      }
      return this.FS.getLocalFileEntry(dir, _path, (function(_this) {
        return function(fileEntry) {
          return typeof cb === "function" ? cb(fileEntry, dir) : void 0;
        };
      })(this), (function(_this) {
        return function(error) {
          return _this.findFileInDirectories(_dirs, _path, cb, err);
        };
      })(this));
    } else {
      return this.FS.getLocalFileEntry(dir, _path, (function(_this) {
        return function(fileEntry) {
          return typeof cb === "function" ? cb(fileEntry, dir) : void 0;
        };
      })(this), err);
    }
  };

  Application.prototype.mapAllResources = function(cb) {
    return this.getResources((function(_this) {
      return function() {
        var item, _i, _len, _ref, _results;
        _ref = _this.data.currentResources;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push(_this.findLocalFilePathForURL(item.url, function() {
            return typeof cb === "function" ? cb() : void 0;
          }));
        }
        return _results;
      };
    })(this));
  };

  return Application;

})(Config);

module.exports = Application;


},{"./config.coffee":2,"./filesystem.coffee":4,"./listen.coffee":5,"./msg.coffee":6,"./notification.coffee":11,"./server.coffee":13,"./storage.coffee":14,"./util.coffee":15}],2:[function(require,module,exports){
var Config;

Config = (function() {
  Config.prototype.APP_ID = 'denefdoofnkgjmpbfpknihpgdhahpblh';

  Config.prototype.EXTENSION_ID = 'ijcjmpejonmimoofbcpaliejhikaeomh';

  Config.prototype.SELF_ID = chrome.runtime.id;

  Config.prototype.isContentScript = location.protocol !== 'chrome-extension:';

  Config.prototype.EXT_ID = null;

  Config.prototype.EXT_TYPE = null;

  function Config() {
    this.EXT_ID = this.APP_ID === this.SELF_ID ? this.EXTENSION_ID : this.APP_ID;
    this.EXT_TYPE = this.APP_ID === this.SELF_ID ? 'EXTENSION' : 'APP';
    this.SELF_TYPE = this.APP_ID !== this.SELF_ID ? 'EXTENSION' : 'APP';
  }

  Config.prototype.wrapInbound = function(obj, fname, f) {
    var _klas;
    _klas = obj;
    return this.LISTEN.Ext(fname, function(callback) {
      var args, _arguments, _callback;
      _callback = callback;
      _arguments = Array.prototype.slice.call(arguments);
      args = [];
      if (_arguments.length === 0 || (_arguments[0] == null)) {
        args.push(null);
      } else {
        args = _arguments;
      }
      return f.apply(_klas, args);
    });
  };

  Config.prototype.wrapObjInbound = function(obj) {
    var key;
    for (key in obj) {
      if (typeof obj[key] === "function") {
        obj[key] = this.wrapInbound(obj, obj.constructor.name + '.' + key, obj[key]);
      }
    }
    return obj;
  };

  Config.prototype.wrapOutbound = function(obj, fname, f) {
    return function() {
      var callback, msg, _args;
      msg = {};
      _args = Array.prototype.slice.call(arguments);
      if (_args.length === 0) {
        msg[fname] = null;
        return this.MSG.Ext(msg);
      }
      msg[fname] = _args;
      callback = msg[fname].pop();
      if (typeof callback !== "function") {
        msg[fname].push(callback);
        return this.MSG.Ext(msg);
      } else {
        return this.MSG.Ext(msg, callback);
      }
    };
  };

  Config.prototype.wrapObjOutbound = function(obj) {
    var key;
    for (key in obj) {
      if (typeof obj[key] === "function") {
        obj[key] = this.wrapOutbound(obj, obj.constructor.name + '.' + key, obj[key]);
      }
    }
    return obj;
  };

  return Config;

})();

module.exports = Config;


},{}],3:[function(require,module,exports){
var Application, FileSystem, Redirect, Storage, getGlobal, root;

getGlobal = function() {
  var _getGlobal;
  _getGlobal = function() {
    return this;
  };
  return _getGlobal();
};

root = getGlobal();

chrome.browserAction.setPopup({
  popup: "popup.html"
});

Application = require('../../common.coffee');

Redirect = require('../../redirect.coffee');

Storage = require('../../storage.coffee');

FileSystem = require('../../filesystem.coffee');

root.app = new Application({
  Redirect: new Redirect,
  Storage: Storage,
  FS: FileSystem
});

root.app.Storage.retrieveAll();


},{"../../common.coffee":1,"../../filesystem.coffee":4,"../../redirect.coffee":12,"../../storage.coffee":14}],4:[function(require,module,exports){
var FileSystem, LISTEN, MSG,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

LISTEN = require('./listen.coffee');

MSG = require('./msg.coffee');

FileSystem = (function() {
  FileSystem.prototype.api = chrome.fileSystem;

  FileSystem.prototype.retainedDirs = {};

  FileSystem.prototype.LISTEN = LISTEN.get();

  FileSystem.prototype.MSG = MSG.get();

  function FileSystem() {
    this.findFileForQueryString = __bind(this.findFileForQueryString, this);
    this.findFileForPath = __bind(this.findFileForPath, this);
    this.getLocalFile = __bind(this.getLocalFile, this);
    this.getLocalFileEntry = __bind(this.getLocalFileEntry, this);
  }

  FileSystem.prototype.readFile = function(dirEntry, path, success, error) {
    return this.getFileEntry(dirEntry, path, (function(_this) {
      return function(fileEntry) {
        return fileEntry.file(function(file) {
          return typeof success === "function" ? success(fileEntry, file) : void 0;
        }, function(err) {
          return typeof error === "function" ? error(err) : void 0;
        });
      };
    })(this), (function(_this) {
      return function(err) {
        return typeof error === "function" ? error(err) : void 0;
      };
    })(this));
  };

  FileSystem.prototype.getFileEntry = function(dirEntry, path, success, error) {
    if ((dirEntry != null ? dirEntry.getFile : void 0) != null) {
      return dirEntry.getFile(path, {}, function(fileEntry) {
        return typeof success === "function" ? success(fileEntry) : void 0;
      }, (function(_this) {
        return function(err) {
          return typeof error === "function" ? error(err) : void 0;
        };
      })(this));
    } else {
      return typeof error === "function" ? error() : void 0;
    }
  };

  FileSystem.prototype.openDirectory = function(directoryEntry, callback) {
    return this.api.getDisplayPath(directoryEntry, (function(_this) {
      return function(pathName) {
        var dir;
        dir = {
          relPath: directoryEntry.fullPath,
          directoryEntryId: _this.api.retainEntry(directoryEntry),
          entry: directoryEntry
        };
        return callback(pathName, dir);
      };
    })(this));
  };

  FileSystem.prototype.getLocalFileEntry = function(dir, filePath, cb, error) {
    return chrome.fileSystem.restoreEntry(dir.directoryEntryId, (function(_this) {
      return function(dirEntry) {
        return _this.getFileEntry(dirEntry, filePath, function(fileEntry) {
          return typeof cb === "function" ? cb(fileEntry) : void 0;
        }, error);
      };
    })(this));
  };

  FileSystem.prototype.getLocalFile = function(dir, filePath, cb, error) {
    return chrome.fileSystem.restoreEntry(dir.directoryEntryId, (function(_this) {
      return function(dirEntry) {
        return _this.readFile(dirEntry, filePath, function(fileEntry, file) {
          return typeof cb === "function" ? cb(fileEntry, file) : void 0;
        }, function(_error) {
          return typeof error === "function" ? error(_error) : void 0;
        }, function(_error) {
          return typeof error === "function" ? error(_error) : void 0;
        });
      };
    })(this));
  };

  FileSystem.prototype.findFileForPath = function(info, success, error) {
    return this.findFileForQueryString(info.uri, success, error, info.referer);
  };

  FileSystem.prototype.findFileForQueryString = function(_url, cb, error, referer) {
    var dir, dirEntry, filePath, item, match, url, _i, _len, _ref, _ref1;
    url = decodeURIComponent(_url).replace(/.*?slredir\=/, '');
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
      if (platform === 'win') {
        filePath.replace('/', '\\');
      }
      dir = this.Storage.data.directories[match.directory];
      if (dir == null) {
        return err('no match');
      }
      if (this.retainedDirs[dir.directoryEntryId] != null) {
        dirEntry = this.retainedDirs[dir.directoryEntryId];
        return this.readFile(dirEntry, filePath, (function(_this) {
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
            return _this.readFile(dirEntry, filePath, function(fileEntry, file) {
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

  return FileSystem;

})();

module.exports = FileSystem;


},{"./listen.coffee":5,"./msg.coffee":6}],5:[function(require,module,exports){
var Config, LISTEN,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Config = require('./config.coffee');

LISTEN = (function(_super) {
  var instance;

  __extends(LISTEN, _super);

  LISTEN.prototype.local = {
    api: chrome.runtime.onMessage,
    listeners: {}
  };

  LISTEN.prototype.external = {
    api: chrome.runtime.onMessageExternal,
    listeners: {}
  };

  instance = null;

  function LISTEN() {
    this._onMessage = __bind(this._onMessage, this);
    this._onMessageExternal = __bind(this._onMessageExternal, this);
    this.Ext = __bind(this.Ext, this);
    this.Local = __bind(this.Local, this);
    var _ref;
    LISTEN.__super__.constructor.apply(this, arguments);
    chrome.runtime.onConnectExternal.addListener((function(_this) {
      return function(port) {
        return port.onMessage.addListener(_this._onMessageExternal);
      };
    })(this));
    this.local.api.addListener(this._onMessage);
    if ((_ref = this.external.api) != null) {
      _ref.addListener(this._onMessageExternal);
    }
  }

  LISTEN.get = function() {
    return instance != null ? instance : instance = new LISTEN;
  };

  LISTEN.prototype.Local = function(message, callback) {
    return this.local.listeners[message] = callback;
  };

  LISTEN.prototype.Ext = function(message, callback) {
    show('adding ext listener for ' + message);
    return this.external.listeners[message] = callback;
  };

  LISTEN.prototype._onMessageExternal = function(request, sender, sendResponse) {
    var key, responseStatus, _base, _key, _sendResponse;
    responseStatus = {
      called: false
    };
    _sendResponse = function() {
      var e;
      try {
        show('calling sendresponse');
        sendResponse.apply(null, arguments);
      } catch (_error) {
        e = _error;
        void 0;
      }
      return responseStatus.called = true;
    };
    for (_key in request) {
      show(("<== GOT EXTERNAL MESSAGE == " + this.EXT_TYPE + " ==") + _key);
    }
    if (sender.id !== this.EXT_ID && sender.constructor.name !== 'Port') {
      return false;
    }
    for (key in request) {
      if (typeof (_base = this.external.listeners)[key] === "function") {
        _base[key](request[key], _sendResponse);
      }
    }
    if (!responseStatus.called) {
      return true;
    }
  };

  LISTEN.prototype._onMessage = function(request, sender, sendResponse) {
    var key, responseStatus, _base, _key, _sendResponse;
    responseStatus = {
      called: false
    };
    _sendResponse = (function(_this) {
      return function() {
        var e;
        try {
          show('calling sendresponse');
          sendResponse.apply(_this, arguments);
        } catch (_error) {
          e = _error;
          show(e);
        }
        return responseStatus.called = true;
      };
    })(this);
    for (_key in request) {
      show(("<== GOT MESSAGE == " + this.EXT_TYPE + " ==") + _key);
    }
    for (key in request) {
      if (typeof (_base = this.local.listeners)[key] === "function") {
        _base[key](request[key], _sendResponse);
      }
    }
    if (!responseStatus.called) {
      return true;
    }
  };

  return LISTEN;

})(Config);

module.exports = LISTEN;


},{"./config.coffee":2}],6:[function(require,module,exports){
var Config, MSG,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Config = require('./config.coffee');

MSG = (function(_super) {
  var instance;

  __extends(MSG, _super);

  instance = null;

  MSG.prototype.port = null;

  function MSG() {
    MSG.__super__.constructor.apply(this, arguments);
    this.port = chrome.runtime.connect(this.EXT_ID);
  }

  MSG.get = function() {
    return instance != null ? instance : instance = new MSG;
  };

  MSG.createPort = function() {};

  MSG.prototype.Local = function(message, respond) {
    var _key;
    for (_key in message) {
      show("== MESSAGE " + _key + " ==>");
    }
    return chrome.runtime.sendMessage(message, respond);
  };

  MSG.prototype.Ext = function(message, respond) {
    var _key;
    for (_key in message) {
      show("== MESSAGE EXTERNAL " + _key + " ==>");
    }
    return chrome.runtime.sendMessage(this.EXT_ID, message, respond);
  };

  MSG.prototype.ExtPort = function(message) {
    try {
      return this.port.postMessage(message);
    } catch (_error) {
      this.port = chrome.runtime.connect(this.EXT_ID);
      return this.port.postMessage(message);
    }
  };

  return MSG;

})(Config);

module.exports = MSG;


},{"./config.coffee":2}],7:[function(require,module,exports){

module.exports = exports = Change;

/*!
 * Change object constructor
 *
 * The `change` object passed to Object.observe callbacks
 * is immutable so we create a new one to modify.
 */

function Change (path, change) {
  this.path = path;
  this.name = change.name;
  this.type = change.type;
  this.object = change.object;
  this.value = change.object[change.name];
  this.oldValue = change.oldValue;
}


},{}],8:[function(require,module,exports){
// http://wiki.ecmascript.org/doku.php?id=harmony:observe

var Change = require('./change');
var Emitter = require('events').EventEmitter;
var debug = require('debug')('observed');

module.exports = exports = Observable;

/**
 * Observable constructor.
 *
 * The passed `subject` will be observed for changes to
 * all properties, included nested objects and arrays.
 *
 * An `EventEmitter` will be returned. This emitter will
 * emit the following events:
 *
 * - add
 * - update
 * - delete
 * - reconfigure
 *
 * // - setPrototype?
 *
 * @param {Object} subject
 * @param {Observable} [parent] (internal use)
 * @param {String} [prefix] (internal use)
 * @return {EventEmitter}
 */

function Observable (subject, parent, prefix) {
  if ('object' != typeof subject)
    throw new TypeError('object expected. got: ' + typeof subject);

  if (!(this instanceof Observable))
    return new Observable(subject, parent, prefix);

  debug('new', subject, !!parent, prefix);

  Emitter.call(this);
  this._bind(subject, parent, prefix);
};

// add emitter capabilities
for (var i in Emitter.prototype) {
  Observable.prototype[i] = Emitter.prototype[i];
}

Observable.prototype.observers = undefined;
Observable.prototype.onchange = undefined;
Observable.prototype.subject = undefined;

/**
 * Binds this Observable to `subject`.
 *
 * @param {Object} subject
 * @param {Observable} [parent]
 * @param {String} [prefix]
 * @api private
 */

Observable.prototype._bind = function (subject, parent, prefix) {
  if (this.subject) throw new Error('already bound!');
  if (null == subject) throw new TypeError('subject cannot be null');

  debug('_bind', subject);

  this.subject = subject;

  if (parent) {
    parent.observers.push(this);
  } else {
    this.observers = [this];
  }

  this.onchange = onchange(parent || this, prefix);
  Object.observe(this.subject, this.onchange);

  this._walk(parent || this, prefix);
}

/**
 * Pending change events are not emitted until after the next
 * turn of the event loop. This method forces the engines hand
 * and triggers all events now.
 *
 * @api public
 */

Observable.prototype.deliverChanges = function () {
  debug('deliverChanges')
  this.observers.forEach(function(o) {
    Object.deliverChangeRecords(o.onchange);
  });
}

/**
 * Walk down through the tree of our `subject`, observing
 * objects along the way.
 *
 * @param {Observable} [parent]
 * @param {String} [prefix]
 * @api private
 */

Observable.prototype._walk = function (parent, prefix) {
  debug('_walk');

  var object = this.subject;

  // keys?
  Object.keys(object).forEach(function (name) {
    var value = object[name];

    if ('object' != typeof value) return;
    if (null == value) return;

    var path = prefix
      ? prefix + '.' + name
      : name;

    new Observable(value, parent, path);
  });
}

/**
 * Stop listening to all bound objects
 */

Observable.prototype.stop = function () {
  debug('stop');

  this.observers.forEach(function (observer) {
    Object.unobserve(observer.subject, observer.onchange);
  });
}

/**
 * Stop listening to changes on `subject`
 *
 * @param {Object} subject
 * @api private
 */

Observable.prototype._remove = function (subject) {
  debug('_remove', subject);

  this.observers = this.observers.filter(function (observer) {
    if (subject == observer.subject) {
      Object.unobserve(observer.subject, observer.onchange);
      return false;
    }

    return true;
  });
}

/*!
 * Creates an Object.observe `onchange` listener
 */

function onchange (parent, prefix) {
  return function (ary) {
    debug('onchange', prefix);

    ary.forEach(function (change) {
      var object = change.object;
      var type = change.type;
      var name = change.name;
      var value = object[name];

      var path = prefix
        ? prefix + '.' + name
        : name

      if ('add' == type && null != value && 'object' == typeof value) {
        new Observable(value, parent, path);
      } else if ('delete' == type && 'object' == typeof change.oldValue) {
        parent._remove(change.oldValue);
      }

      change = new Change(path, change);
      parent.emit(type, change);
      parent.emit(type + ' ' + path, change);
      parent.emit('change', change);
    })
  }
}


},{"./change":7,"debug":9,"events":10}],9:[function(require,module,exports){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

},{}],10:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],11:[function(require,module,exports){
var Notification;

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
      iconUrl: 'images/icon-38.png'
    }, function(callback) {
      return void 0;
    });
  };

  return Notification;

})();

module.exports = Notification;


},{}],12:[function(require,module,exports){
var Redirect,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Redirect = (function() {
  Redirect.prototype.data = {
    tabId: {
      listener: null,
      isOn: false
    }
  };

  Redirect.prototype.prefix = null;

  Redirect.prototype.currentMatches = {};

  Redirect.prototype.currentTabId = null;

  Redirect.prototype.getLocalFilePath = function() {};

  function Redirect() {
    this.withPrefix = __bind(this.withPrefix, this);
  }

  Redirect.prototype.tab = function(tabId) {
    var _base;
    this.currentTabId = tabId;
    if ((_base = this.data)[tabId] == null) {
      _base[tabId] = {};
    }
    return this;
  };

  Redirect.prototype.withPrefix = function(prefix) {
    this.prefix = prefix;
    return this;
  };

  Redirect.prototype.withDirectories = function(directories) {
    if ((directories != null ? directories.length : void 0) === 0) {
      this.data[this.currentTabId].directories = [];
      this._stop(this.currentTabId);
    } else {
      this.data[this.currentTabId].directories = directories;
      this.start();
    }
    return this;
  };

  Redirect.prototype.withMaps = function(maps) {
    if (Object.getOwnPropertyNames(maps).length === 0) {
      this.data[this.currentTabId].maps = {};
      this._stop(this.currentTabId);
    } else {
      this.data[this.currentTabId].maps = maps;
      this.start();
    }
    return this;
  };

  Redirect.prototype.start = function() {
    if (!this.data[this.currentTabId].listener) {
      chrome.webRequest.onBeforeRequest.removeListener(this.data[this.currentTabId].listener);
    }
    this.data[this.currentTabId].listener = this.createRedirectListener();
    this.data[this.currentTabId].isOn = true;
    return this._start(this.currentTabId);
  };

  Redirect.prototype.killAll = function() {
    var tabId, _results;
    _results = [];
    for (tabId in this.data) {
      _results.push(this._stop(tabId));
    }
    return _results;
  };

  Redirect.prototype._stop = function(tabId) {
    return chrome.webRequest.onBeforeRequest.removeListener(this.data[tabId].listener);
  };

  Redirect.prototype._start = function(tabId) {
    return chrome.webRequest.onBeforeRequest.addListener(this.data[tabId].listener, {
      urls: ['<all_urls>'],
      tabId: this.currentTabId
    }, ['blocking']);
  };

  Redirect.prototype.getCurrentTab = function(cb) {
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (function(_this) {
      return function(tabs) {
        _this.currentTabId = tabs[0].id;
        return typeof cb === "function" ? cb(_this.currentTabId) : void 0;
      };
    })(this));
  };

  Redirect.prototype.toggle = function() {
    if (this.status[this.currentTabId] == null) {
      this.status[this.currentTabId] = true;
    }
    this.status[this.currentTabId] = !this.status[this.currentTabId];
    if (this.status[this.currentTabId]) {
      this.startServer();
      return this.start();
    } else {
      this.stop();
      return this.stopServer();
    }
  };

  Redirect.prototype.createRedirectListener = function() {
    return (function(_this) {
      return function(details) {
        var path;
        path = _this.getLocalFilePath(details.url);
        if (path != null) {
          return {
            redirectUrl: _this.prefix + path
          };
        } else {
          return {};
        }
      };
    })(this);
  };

  Redirect.prototype.toDict = function(obj, key) {
    return obj.reduce((function(dict, _obj) {
      if (_obj[key] != null) {
        dict[_obj[key]] = _obj;
      }
      return dict;
    }), {});
  };

  return Redirect;

})();

module.exports = Redirect;


},{}],13:[function(require,module,exports){
var Server,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Server = (function() {
  Server.prototype.socket = chrome.socket;

  Server.prototype.host = "127.0.0.1";

  Server.prototype.port = 8089;

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
          chrome.storage.sync.set({
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
    return chrome.storage.sync.get('socketIds', (function(_this) {
      return function(result) {
        var cnt, s, _i, _len, _ref, _results;
        show('got ids');
        show(result);
        _this.socketIds = result.socketIds;
        if (_this.socketIds == null) {
          return typeof callback === "function" ? callback() : void 0;
        }
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

module.exports = Server;


},{}],14:[function(require,module,exports){
var LISTEN, MSG, Storage;

LISTEN = require('./listen.coffee');

MSG = require('./msg.coffee');

window.Observable = require('observed');

Storage = (function() {
  Storage.prototype.api = chrome.storage.local;

  Storage.prototype.LISTEN = LISTEN.get();

  Storage.prototype.MSG = MSG.get();

  Storage.prototype.data = {
    currentResources: []
  };

  Storage.prototype.callback = function() {};

  function Storage() {
    this.observer = Observable(this.data);
    this.observer.on('change', (function(_this) {
      return function(change) {
        return _this.MSG.ExtPort({
          'dataChanged': change
        });
      };
    })(this));
    this.LISTEN.Ext('dataChanged', (function(_this) {
      return function(change) {
        var _data;
        if (_this.data == null) {
          _this.data = {};
        }
        _data = _this.data;
        _this.observer.stop();
        (function(data) {
          var stack, _shift;
          stack = change.path.split('.');
          if (data[stack[0]] == null) {
            return data[stack[0]] = change.value;
          }
          while (stack.length > 1) {
            _shift = stack.shift();
            if (/^\d+$/.test(_shift)) {
              _shift = parseInt(_shift);
            }
            data = data[_shift];
          }
          _shift = stack.shift();
          if (/^\d+$/.test(_shift)) {
            _shift = parseInt(_shift);
          }
          return data[_shift] = change.value;
        })(_this.data);
        _this.saveAll();
        _this.observer = Observable(_this.data);
        return _this.observer.on('change', function(change) {
          return _this.MSG.ExtPort({
            'dataChanged': change
          });
        });
      };
    })(this));
  }

  Storage.prototype.isArray = function() {
    return Array.isArray || function(value) {
      return {}.toString.call(value) === '[object Array]';
    };
  };

  Storage.prototype.save = function(key, item, cb) {
    var obj;
    obj = {};
    obj[key] = item;
    this.data[key] = item;
    return this.api.set(obj, (function(_this) {
      return function(res) {
        if (typeof cb === "function") {
          cb();
        }
        return typeof _this.callback === "function" ? _this.callback() : void 0;
      };
    })(this));
  };

  Storage.prototype.saveAllAndSync = function(data) {
    return this.saveAll(data, (function(_this) {
      return function() {
        return _this.MSG.Ext({
          'storageData': _this.data
        });
      };
    })(this));
  };

  Storage.prototype.saveAll = function(data, cb) {
    if (data != null) {
      return this.api.set(data, (function(_this) {
        return function() {
          return typeof cb === "function" ? cb() : void 0;
        };
      })(this));
    } else {
      return this.api.set(this.data, (function(_this) {
        return function() {
          return typeof cb === "function" ? cb() : void 0;
        };
      })(this));
    }
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
        var c;
        for (c in result) {
          _this.data[c] = result[c];
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
        var c, hasChanges;
        hasChanges = false;
        for (c in changes) {
          if (changes[c].newValue !== changes[c].oldValue && c !== 'socketIds') {
            (function(c) {
              _this.data[c] = changes[c].newValue;
              show('data changed: ');
              show(c);
              show(_this.data[c]);
              return hasChanges = true;
            });
          }
        }
        if (hasChanges) {
          if (typeof _this.callback === "function") {
            _this.callback(changes);
          }
        }
        if (hasChanges) {
          return show('changed');
        }
      };
    })(this));
  };

  return Storage;

})();

module.exports = Storage;


},{"./listen.coffee":5,"./msg.coffee":6,"observed":8}],15:[function(require,module,exports){
module.exports = (function() {
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


},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvY29tbW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9jb25maWcuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L2V4dGVuc2lvbi9zcmMvYmFja2dyb3VuZC5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L25vZGVfbW9kdWxlcy9vYnNlcnZlZC9saWIvY2hhbmdlLmpzIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L25vZGVfbW9kdWxlcy9vYnNlcnZlZC9saWIvb2JzZXJ2ZWQuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm9kZV9tb2R1bGVzL29ic2VydmVkL25vZGVfbW9kdWxlcy9kZWJ1Zy9kZWJ1Zy5qcyIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm90aWZpY2F0aW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9yZWRpcmVjdC5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvc2VydmVyLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9zdG9yYWdlLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsMkVBQUE7RUFBQTs7aVNBQUE7O0FBQUEsT0FBQSxDQUFRLGVBQVIsQ0FBQSxDQUFBOztBQUFBLE1BQ0EsR0FBUyxPQUFBLENBQVEsaUJBQVIsQ0FEVCxDQUFBOztBQUFBLEdBRUEsR0FBTSxPQUFBLENBQVEsY0FBUixDQUZOLENBQUE7O0FBQUEsTUFHQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQUhULENBQUE7O0FBQUEsT0FJQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUixDQUpWLENBQUE7O0FBQUEsVUFLQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUixDQUxiLENBQUE7O0FBQUEsWUFNQSxHQUFlLE9BQUEsQ0FBUSx1QkFBUixDQU5mLENBQUE7O0FBQUEsTUFPQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQVBULENBQUE7O0FBQUE7QUFXRSxnQ0FBQSxDQUFBOztBQUFBLHdCQUFBLE1BQUEsR0FBUSxJQUFSLENBQUE7O0FBQUEsd0JBQ0EsR0FBQSxHQUFLLElBREwsQ0FBQTs7QUFBQSx3QkFFQSxPQUFBLEdBQVMsSUFGVCxDQUFBOztBQUFBLHdCQUdBLEVBQUEsR0FBSSxJQUhKLENBQUE7O0FBQUEsd0JBSUEsTUFBQSxHQUFRLElBSlIsQ0FBQTs7QUFBQSx3QkFLQSxNQUFBLEdBQVEsSUFMUixDQUFBOztBQUFBLHdCQU1BLFFBQUEsR0FBUyxJ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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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T0FBMUMsRUFEaEI7R0FBQSxNQUFBO1dBR0UsTUFBTSxDQUFDLElBQVAsR0FBYyxTQUFBLEdBQUE7YUFDWixRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUF6QixDQUE4QixPQUFPLENBQUMsR0FBdEMsRUFBMkMsT0FBM0MsRUFBb0QsU0FBcEQsRUFEWTtJQUFBLEVBSGhCO0dBWGdCO0FBQUEsQ0FBRCxDQUFBLENBQUEsQ0FBakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZSAnLi91dGlsLmNvZmZlZSdcbkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcbkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuL3N0b3JhZ2UuY29mZmVlJ1xuRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4vZmlsZXN5c3RlbS5jb2ZmZWUnXG5Ob3RpZmljYXRpb24gPSByZXF1aXJlICcuL25vdGlmaWNhdGlvbi5jb2ZmZWUnXG5TZXJ2ZXIgPSByZXF1aXJlICcuL3NlcnZlci5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwbGljYXRpb24gZXh0ZW5kcyBDb25maWdcbiAgTElTVEVOOiBudWxsXG4gIE1TRzogbnVsbFxuICBTdG9yYWdlOiBudWxsXG4gIEZTOiBudWxsXG4gIFNlcnZlcjogbnVsbFxuICBOb3RpZnk6IG51bGxcbiAgcGxhdGZvcm06bnVsbFxuICBjdXJyZW50VGFiSWQ6bnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoZGVwcykgLT5cbiAgICBzdXBlclxuXG4gICAgQE1TRyA/PSBNU0cuZ2V0KClcbiAgICBATElTVEVOID89IExJU1RFTi5nZXQoKVxuICAgIFxuICAgIGZvciBwcm9wIG9mIGRlcHNcbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwib2JqZWN0XCIgXG4gICAgICAgIEBbcHJvcF0gPSBAd3JhcE9iakluYm91bmQgZGVwc1twcm9wXVxuICAgICAgaWYgdHlwZW9mIGRlcHNbcHJvcF0gaXMgXCJmdW5jdGlvblwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpPdXRib3VuZCBuZXcgZGVwc1twcm9wXVxuXG4gICAgQE5vdGlmeSA/PSAobmV3IE5vdGlmaWNhdGlvbikuc2hvdyBcbiAgICAjIEBTdG9yYWdlID89IEB3cmFwT2JqT3V0Ym91bmQgbmV3IFN0b3JhZ2UgQGRhdGFcbiAgICAjIEBGUyA9IG5ldyBGaWxlU3lzdGVtIFxuICAgICMgQFNlcnZlciA/PSBAd3JhcE9iak91dGJvdW5kIG5ldyBTZXJ2ZXJcbiAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcbiAgICBcbiAgICBAd3JhcCA9IGlmIEBTRUxGX1RZUEUgaXMgJ0FQUCcgdGhlbiBAd3JhcEluYm91bmQgZWxzZSBAd3JhcE91dGJvdW5kXG5cbiAgICBAb3BlbkFwcCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5vcGVuQXBwJywgQG9wZW5BcHBcbiAgICBAbGF1bmNoQXBwID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmxhdW5jaEFwcCcsIEBsYXVuY2hBcHBcbiAgICBAc3RhcnRTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uc3RhcnRTZXJ2ZXInLCBAc3RhcnRTZXJ2ZXJcbiAgICBAcmVzdGFydFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5yZXN0YXJ0U2VydmVyJywgQHJlc3RhcnRTZXJ2ZXJcbiAgICBAc3RvcFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5zdG9wU2VydmVyJywgQHN0b3BTZXJ2ZXJcbiAgICBcblxuICAgIEB3cmFwID0gaWYgQFNFTEZfVFlQRSBpcyAnRVhURU5TSU9OJyB0aGVuIEB3cmFwSW5ib3VuZCBlbHNlIEB3cmFwT3V0Ym91bmRcblxuICAgIEBnZXRSZXNvdXJjZXMgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0UmVzb3VyY2VzJywgQGdldFJlc291cmNlc1xuICAgIEBnZXRDdXJyZW50VGFiID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldEN1cnJlbnRUYWInLCBAZ2V0Q3VycmVudFRhYlxuXG4gICAgY2hyb21lLnJ1bnRpbWUuZ2V0UGxhdGZvcm1JbmZvIChpbmZvKSA9PlxuICAgICAgQHBsYXRmb3JtID0gaW5mb1xuXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpIC0+XG4gICAgQGRhdGEuc2VydmVyID1cbiAgICAgIGhvc3Q6XCIxMjcuMC4wLjFcIlxuICAgICAgcG9ydDo4MDg5XG4gICAgICBpc09uOmZhbHNlXG5cbiAgZ2V0Q3VycmVudFRhYjogKGNiKSAtPlxuICAgICMgdHJpZWQgdG8ga2VlcCBvbmx5IGFjdGl2ZVRhYiBwZXJtaXNzaW9uLCBidXQgb2ggd2VsbC4uXG4gICAgY2hyb21lLnRhYnMucXVlcnlcbiAgICAgIGFjdGl2ZTp0cnVlXG4gICAgICBjdXJyZW50V2luZG93OnRydWVcbiAgICAsKHRhYnMpID0+XG4gICAgICBAY3VycmVudFRhYklkID0gdGFic1swXS5pZFxuICAgICAgY2I/IEBjdXJyZW50VGFiSWRcblxuICBsYXVuY2hBcHA6IChjYiwgZXJyb3IpIC0+XG4gICAgICBjaHJvbWUubWFuYWdlbWVudC5sYXVuY2hBcHAgQEFQUF9JRCwgKGV4dEluZm8pID0+XG4gICAgICAgIGlmIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxuICAgICAgICAgIGVycm9yIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxuICAgICAgICBlbHNlXG4gICAgICAgICAgY2I/IGV4dEluZm9cblxuICBvcGVuQXBwOiAoKSA9PlxuICAgICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJyxcbiAgICAgICAgaWQ6IFwibWFpbndpblwiXG4gICAgICAgIGJvdW5kczpcbiAgICAgICAgICB3aWR0aDo3NzBcbiAgICAgICAgICBoZWlnaHQ6ODAwLFxuICAgICAgKHdpbikgPT5cbiAgICAgICAgQGFwcFdpbmRvdyA9IHdpbikgXG5cbiAgZ2V0Q3VycmVudFRhYjogKGNiKSAtPlxuICAgICMgdHJpZWQgdG8ga2VlcCBvbmx5IGFjdGl2ZVRhYiBwZXJtaXNzaW9uLCBidXQgb2ggd2VsbC4uXG4gICAgY2hyb21lLnRhYnMucXVlcnlcbiAgICAgIGFjdGl2ZTp0cnVlXG4gICAgICBjdXJyZW50V2luZG93OnRydWVcbiAgICAsKHRhYnMpID0+XG4gICAgICBAY3VycmVudFRhYklkID0gdGFic1swXS5pZFxuICAgICAgY2I/IEBjdXJyZW50VGFiSWRcblxuICBnZXRSZXNvdXJjZXM6IChjYikgLT5cbiAgICBAZ2V0Q3VycmVudFRhYiAodGFiSWQpID0+XG4gICAgICBjaHJvbWUudGFicy5leGVjdXRlU2NyaXB0IHRhYklkLCBcbiAgICAgICAgZmlsZTonc2NyaXB0cy9jb250ZW50LmpzJywgKHJlc3VsdHMpID0+XG4gICAgICAgICAgQGRhdGEuY3VycmVudFJlc291cmNlcyA9IFtdXG4gICAgICAgICAgZm9yIHIgaW4gcmVzdWx0c1xuICAgICAgICAgICAgZm9yIHJlcyBpbiByXG4gICAgICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMucHVzaCByZXNcbiAgICAgICAgICBjYj8oKVxuXG4gICMgdXBkYXRlUmVzb3VyY2VzTGlzdGVuZXI6IChyZXNvdXJjZXMpID0+XG4gICMgICAgIHNob3cgcmVzb3VyY2VzXG4gICMgICAgIF9yZXNvdXJjZXMgPSBbXVxuXG4gICMgICAgIGZvciBmcmFtZSBpbiByZXNvdXJjZXMgXG4gICMgICAgICAgZG8gKGZyYW1lKSA9PlxuICAjICAgICAgICAgZm9yIGl0ZW0gaW4gZnJhbWUgXG4gICMgICAgICAgICAgIGRvIChpdGVtKSA9PlxuICAjICAgICAgICAgICAgIF9yZXNvdXJjZXMucHVzaCBpdGVtXG4gICMgICAgIEBTdG9yYWdlLnNhdmUgJ2N1cnJlbnRSZXNvdXJjZXMnLCByZXNvdXJjZXNcbiAgZ2V0TG9jYWxGaWxlOiAoaW5mbywgY2IsIGVycikgPT5cbiAgICB1cmwgPSBpbmZvLnVyaVxuICAgIGZpbGVQYXRoID0gQGdldExvY2FsRmlsZVBhdGggdXJsXG4gICAgZmlsZUVudHJ5SWQgPSBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdLmZpbGVFbnRyeVxuICAgIGlmIGZpbGVFbnRyeUlkP1xuICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGZpbGVFbnRyeUlkLCAoZmlsZUVudHJ5KSA9PlxuICAgICAgICBmaWxlRW50cnkuZmlsZSAoZmlsZSkgPT5cbiAgICAgICAgICBjYj8oZmlsZUVudHJ5LGZpbGUpXG4gICAgICAgICxlcnJcbiAgICAjIGRpck5hbWUgPSBpbmZvLnVyaVxuXG4gICAgIyBkaXJOYW1lID0gZGlyTmFtZS5tYXRjaCgvKFxcLy4qP1xcLyl8KFxcXFwuKj9cXFxcKS8pP1swXSB8fCAnJ1xuICAgICMgZGlyTmFtZSA9IGRpck5hbWUuc3Vic3RyaW5nIDAsIGRpck5hbWUubGVuZ3RoIC0gMVxuICAgICMgc2hvdyAnbG9va2luZyBmb3IgJyArIGRpck5hbWVcbiAgICAjIF9tYXBzID0ge31cbiAgICAjIF9tYXBzW2l0ZW0uZGlyZWN0b3J5XSA9IGl0ZW0uaXNPbiBmb3IgaXRlbSBpbiBAZGF0YS5tYXBzXG5cbiAgICAjIGZvciBrLCBkaXIgb2YgQGRhdGEuZGlyZWN0b3JpZXMgd2hlbiBfbWFwc1trXVxuICAgICMgICBzaG93ICdpbiBsb29wJyArIGRpci5yZWxQYXRoXG4gICAgIyAgIGlmIGRpci5yZWxQYXRoIGlzIGRpck5hbWUgdGhlbiBmb3VuZERpciA9IGRpclxuXG4gICAgIyBpZiBmb3VuZERpcj9cbiAgICAjICAgc2hvdyAnZm91bmQhICcgKyBmb3VuZERpclxuICAgICMgICBARlMuZ2V0TG9jYWxGaWxlIGZvdW5kRGlyLCBmaWxlUGF0aCwgY2IsIGVyclxuICAgICMgZWxzZVxuICAgICMgICBzaG93ICdkdW5ubywgbm90IGZvdW5kJ1xuICAgICMgICBlcnIoKVxuXG4gIHN0YXJ0U2VydmVyOiAoY2IsIGVycikgLT5cbiAgICAgIGlmIEBTZXJ2ZXIuc3RvcHBlZCBpcyB0cnVlXG4gICAgICAgICAgQFNlcnZlci5zdGFydCBAZGF0YS5zZXJ2ZXIuaG9zdCxAZGF0YS5zZXJ2ZXIucG9ydCxudWxsLCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgICAgICAgQGRhdGEuc2VydmVyLnVybCA9ICdodHRwOi8vJyArIEBkYXRhLnNlcnZlci5ob3N0ICsgJzonICsgQGRhdGEuc2VydmVyLnBvcnQgKyAnLydcbiAgICAgICAgICAgICAgQGRhdGEuc2VydmVyLmlzT24gPSB0cnVlXG4gICAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgU3RhcnRlZFwiLCBcIlN0YXJ0ZWQgU2VydmVyIGh0dHA6Ly8jeyBAZGF0YS5zZXJ2ZXIuaG9zdCB9OiN7QGRhdGEuc2VydmVyLnBvcnR9XCJcbiAgICAgICAgICAgICAgY2I/KClcbiAgICAgICAgICAsKGVycm9yKSA9PlxuICAgICAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIEVycm9yXCIsXCJFcnJvciBTdGFydGluZyBTZXJ2ZXI6ICN7IGVycm9yIH1cIlxuICAgICAgICAgICAgICBAZGF0YS5zZXJ2ZXIudXJsID0gJ2h0dHA6Ly8nICsgQGRhdGEuc2VydmVyLmhvc3QgKyAnOicgKyBAZGF0YS5zZXJ2ZXIucG9ydCArICcvJ1xuICAgICAgICAgICAgICBAZGF0YS5zZXJ2ZXIuaXNPbiA9IHRydWVcbiAgICAgICAgICAgICAgZXJyPygpXG5cbiAgc3RvcFNlcnZlcjogKGNiLCBlcnIpIC0+XG4gICAgICBAU2VydmVyLnN0b3AgKHN1Y2Nlc3MpID0+XG4gICAgICAgICAgQE5vdGlmeSAnU2VydmVyIFN0b3BwZWQnLCBcIlNlcnZlciBTdG9wcGVkXCJcbiAgICAgICAgICBAZGF0YS5zZXJ2ZXIudXJsID0gJydcbiAgICAgICAgICBAZGF0YS5zZXJ2ZXIuaXNPbiA9IGZhbHNlXG4gICAgICAgICAgY2I/KClcbiAgICAgICwoZXJyb3IpID0+XG4gICAgICAgICAgZXJyPygpXG4gICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBFcnJvclwiLFwiU2VydmVyIGNvdWxkIG5vdCBiZSBzdG9wcGVkOiAjeyBlcnJvciB9XCJcblxuICByZXN0YXJ0U2VydmVyOiAtPlxuICAgIEBzdG9wU2VydmVyICgpID0+XG4gICAgICBAc3RhcnRTZXJ2ZXIoKVxuXG4gIGNoYW5nZVBvcnQ6ID0+XG5cbiAgZ2V0TG9jYWxGaWxlUGF0aDogKHVybCkgLT5cbiAgICBmaWxlUGF0aFJlZ2V4ID0gL14oKGh0dHBbc10/fGZ0cHxjaHJvbWUtZXh0ZW5zaW9ufGZpbGUpOlxcL1xcLyk/XFwvPyhbXlxcL1xcLl0rXFwuKSo/KFteXFwvXFwuXStcXC5bXjpcXC9cXHNcXC5dezIsM30oXFwuW146XFwvXFxzXFwuXeKAjOKAi3syLDN9KT8pKDpcXGQrKT8oJHxcXC8pKFteIz9cXHNdKyk/KC4qPyk/KCNbXFx3XFwtXSspPyQvXG5cbiAgICBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXMgPz0ge31cbiAgICBcbiAgICByZXR1cm4ge30gdW5sZXNzIEBkYXRhLm1hcHM/IGFuZCBAZGF0YS5kaXJlY3Rvcmllcz9cblxuICAgIHJlc1BhdGggPSB1cmwubWF0Y2goZmlsZVBhdGhSZWdleCk/WzhdXG5cbiAgICByZXR1cm4ge30gdW5sZXNzIHJlc1BhdGg/XG4gICAgXG4gICAgZm9yIG1hcCBpbiBAZGF0YS5tYXBzXG4gICAgICByZXNQYXRoID0gdXJsLm1hdGNoKG5ldyBSZWdFeHAobWFwLnVybCkpPyBhbmQgbWFwLnVybD9cblxuICAgICAgaWYgcmVzUGF0aFxuICAgICAgICBpZiByZWZlcmVyP1xuICAgICAgICAgICMgVE9ETzogdGhpc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgZmlsZVBhdGggPSB1cmwucmVwbGFjZSBuZXcgUmVnRXhwKG1hcC51cmwpLCBtYXAucmVnZXhSZXBsXG4gICAgICAgIGJyZWFrXG4gICAgcmV0dXJuIGZpbGVQYXRoXG5cbiAgZmluZExvY2FsRmlsZVBhdGhGb3JVUkw6ICh1cmwsIGNiKSAtPlxuICAgIGZpbGVQYXRoID0gQGdldExvY2FsRmlsZVBhdGggdXJsXG4gICAgcmV0dXJuIHVubGVzcyBmaWxlUGF0aD9cbiAgICBAZmluZEZpbGVJbkRpcmVjdG9yaWVzIEBkYXRhLmRpcmVjdG9yaWVzLCBmaWxlUGF0aCwgKGZpbGVFbnRyeSwgZGlyZWN0b3J5KSA9PlxuICAgICMgcmV0dXJuIHJlZGlyZWN0VXJsOiBAcHJlZml4ICsgZmlsZVBhdGhcbiAgICAgIGRlbGV0ZSBmaWxlRW50cnkuZW50cnlcbiAgICAgIEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlc1tmaWxlUGF0aF0gPSBcbiAgICAgICAgZmlsZUVudHJ5OiBjaHJvbWUuZmlsZVN5c3RlbS5yZXRhaW5FbnRyeSBmaWxlRW50cnlcbiAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgIGRpcmVjdG9yeTogZGlyZWN0b3J5XG4gICAgICBjYj8oQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzW2ZpbGVQYXRoXSwgZGlyZWN0b3J5KVxuICAgICwoZXJyKSA9PlxuICAgICAgc2hvdyAnbm8gZmlsZXMgZm91bmQgZm9yICcgKyBmaWxlUGF0aFxuXG5cbiAgZmluZEZpbGVJbkRpcmVjdG9yaWVzOiAoZGlyZWN0b3JpZXMsIHBhdGgsIGNiLCBlcnIpIC0+XG4gICAgYWxsRGlycyA9IGRpcmVjdG9yaWVzLnNsaWNlKCkgdW5sZXNzIGFsbERpcnM/XG4gICAgZXJyKCkgaWYgZGlyZWN0b3JpZXMgaXMgdW5kZWZpbmVkIG9yIHBhdGggaXMgdW5kZWZpbmVkXG4gICAgX2RpcnMgPSBhbGxEaXJzLnNsaWNlKClcbiAgICBfcGF0aCA9IHBhdGhcbiAgICBkaXIgPSBfZGlycy5zaGlmdCgpXG4gICAgX3BhdGgucmVwbGFjZSgvLio/XFwvLywgJycpIGlmIGRpciBpcyB1bmRlZmluZWRcbiAgICBpZiBfcGF0aC5tYXRjaCgvLio/XFwvLyk/ICNzdGlsbCBkaXJlY3RvcnlcbiAgICAgICMgZGlyID0gX2RpcnMuc2hpZnQoKVxuICAgICAgaWYgZGlyIGlzIHVuZGVmaW5lZFxuICAgICAgICBfZGlycyA9IGFsbERpcnMuc2xpY2UoKSBcbiAgICAgICAgZGlyID0gX2RpcnMuc2hpZnQoKSBcblxuICAgICAgQEZTLmdldExvY2FsRmlsZUVudHJ5IGRpciwgX3BhdGgsIFxuICAgICAgICAoZmlsZUVudHJ5KSA9PlxuICAgICAgICAgIGNiPyBmaWxlRW50cnksIGRpclxuICAgICAgICAsKGVycm9yKSA9PlxuICAgICAgICAgIEBmaW5kRmlsZUluRGlyZWN0b3JpZXMgX2RpcnMsIF9wYXRoLCBjYiwgZXJyICBcbiAgICBlbHNlXG4gICAgICBARlMuZ2V0TG9jYWxGaWxlRW50cnkgZGlyLCBfcGF0aCwgXG4gICAgICAgIChmaWxlRW50cnkpID0+XG4gICAgICAgICAgY2I/IGZpbGVFbnRyeSwgZGlyXG4gICAgICAgICxlcnJcbiAgXG4gIG1hcEFsbFJlc291cmNlczogKGNiKSAtPlxuICAgIEBnZXRSZXNvdXJjZXMgPT5cbiAgICAgIGZvciBpdGVtIGluIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXNcbiAgICAgICAgQGZpbmRMb2NhbEZpbGVQYXRoRm9yVVJMIGl0ZW0udXJsLCA9PlxuICAgICAgICAgIGNiPygpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvblxuXG5cbiIsImNsYXNzIENvbmZpZ1xuICAjIEFQUF9JRDogJ2NlY2lmYWZwaGVnaG9mcGZka2hla2tpYmNpYmhnZmVjJ1xuICAjIEVYVEVOU0lPTl9JRDogJ2RkZGltYm5qaWJqY2FmYm9rbmJnaGVoYmZhamdnZ2VwJ1xuICBBUFBfSUQ6ICdkZW5lZmRvb2Zua2dqbXBiZnBrbmlocGdkaGFocGJsaCdcbiAgRVhURU5TSU9OX0lEOiAnaWpjam1wZWpvbm1pbW9vZmJjcGFsaWVqaGlrYWVvbWgnICBcbiAgU0VMRl9JRDogY2hyb21lLnJ1bnRpbWUuaWRcbiAgaXNDb250ZW50U2NyaXB0OiBsb2NhdGlvbi5wcm90b2NvbCBpc250ICdjaHJvbWUtZXh0ZW5zaW9uOidcbiAgRVhUX0lEOiBudWxsXG4gIEVYVF9UWVBFOiBudWxsXG4gIFxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBARVhUX0lEID0gaWYgQEFQUF9JRCBpcyBAU0VMRl9JRCB0aGVuIEBFWFRFTlNJT05fSUQgZWxzZSBAQVBQX0lEXG4gICAgQEVYVF9UWVBFID0gaWYgQEFQUF9JRCBpcyBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcbiAgICBAU0VMRl9UWVBFID0gaWYgQEFQUF9JRCBpc250IEBTRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuXG4gIHdyYXBJbmJvdW5kOiAob2JqLCBmbmFtZSwgZikgLT5cbiAgICAgIF9rbGFzID0gb2JqXG4gICAgICBATElTVEVOLkV4dCBmbmFtZSwgKGNhbGxiYWNrKSAtPlxuICAgICAgICBfY2FsbGJhY2sgPSBjYWxsYmFja1xuICAgICAgICBfYXJndW1lbnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgICAgICBhcmdzID0gW11cbiAgICAgICAgaWYgX2FyZ3VtZW50cy5sZW5ndGggaXMgMCBvciBub3QgX2FyZ3VtZW50c1swXT9cbiAgICAgICAgICBhcmdzLnB1c2ggbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXJncyA9IF9hcmd1bWVudHNcbiAgICAgICAgIyBfYXJncyA9IGFyZ3NbMF0/LnB1c2goYXJnc1sxXSlcbiAgICAgICAgZi5hcHBseSBfa2xhcywgYXJnc1xuXG4gIHdyYXBPYmpJbmJvdW5kOiAob2JqKSAtPlxuICAgIChvYmpba2V5XSA9IEB3cmFwSW5ib3VuZCBvYmosIG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsga2V5LCBvYmpba2V5XSkgZm9yIGtleSBvZiBvYmogd2hlbiB0eXBlb2Ygb2JqW2tleV0gaXMgXCJmdW5jdGlvblwiXG4gICAgb2JqXG5cbiAgd3JhcE91dGJvdW5kOiAob2JqLCBmbmFtZSwgZikgLT5cbiAgICAtPlxuICAgICAgbXNnID0ge31cbiAgICAgIF9hcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG5cbiAgICAgIGlmIF9hcmdzLmxlbmd0aCBpcyAwXG4gICAgICAgIG1zZ1tmbmFtZV0gPSBudWxsIFxuICAgICAgICByZXR1cm4gQE1TRy5FeHQgbXNnXG5cbiAgICAgIG1zZ1tmbmFtZV0gPSBfYXJnc1xuXG4gICAgICBjYWxsYmFjayA9IG1zZ1tmbmFtZV0ucG9wKClcbiAgICAgIGlmIHR5cGVvZiBjYWxsYmFjayBpc250IFwiZnVuY3Rpb25cIlxuICAgICAgICBtc2dbZm5hbWVdLnB1c2ggY2FsbGJhY2tcbiAgICAgICAgQE1TRy5FeHQgbXNnXG4gICAgICBlbHNlXG4gICAgICAgIEBNU0cuRXh0IG1zZywgY2FsbGJhY2sgXG5cbiAgd3JhcE9iak91dGJvdW5kOiAob2JqKSAtPlxuICAgIChvYmpba2V5XSA9IEB3cmFwT3V0Ym91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpZyIsImdldEdsb2JhbCA9IC0+XG4gIF9nZXRHbG9iYWwgPSAtPlxuICAgIHRoaXNcblxuICBfZ2V0R2xvYmFsKClcblxucm9vdCA9IGdldEdsb2JhbCgpXG5cbiMgcm9vdC5hcHAgPSBhcHAgPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuIyBhcHAgPSBuZXcgbGliLkFwcGxpY2F0aW9uXG5jaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRQb3B1cCBwb3B1cDpcInBvcHVwLmh0bWxcIlxuXG5BcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5SZWRpcmVjdCA9IHJlcXVpcmUgJy4uLy4uL3JlZGlyZWN0LmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuLi8uLi9maWxlc3lzdGVtLmNvZmZlZSdcblxucm9vdC5hcHAgPSBuZXcgQXBwbGljYXRpb25cbiAgUmVkaXJlY3Q6IG5ldyBSZWRpcmVjdFxuICBTdG9yYWdlOiBTdG9yYWdlXG4gIEZTOiBGaWxlU3lzdGVtXG5cbnJvb3QuYXBwLlN0b3JhZ2UucmV0cmlldmVBbGwoKSIsIkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcblxuY2xhc3MgRmlsZVN5c3RlbVxuICBhcGk6IGNocm9tZS5maWxlU3lzdGVtXG4gIHJldGFpbmVkRGlyczoge31cbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuXG4gICMgQGRpcnM6IG5ldyBEaXJlY3RvcnlTdG9yZVxuICAjIGZpbGVUb0FycmF5QnVmZmVyOiAoYmxvYiwgb25sb2FkLCBvbmVycm9yKSAtPlxuICAjICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAjICAgcmVhZGVyLm9ubG9hZCA9IG9ubG9hZFxuXG4gICMgICByZWFkZXIub25lcnJvciA9IG9uZXJyb3JcblxuICAjICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGJsb2JcblxuICByZWFkRmlsZTogKGRpckVudHJ5LCBwYXRoLCBzdWNjZXNzLCBlcnJvcikgLT5cbiAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBwYXRoLFxuICAgICAgKGZpbGVFbnRyeSkgPT5cbiAgICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgICAgc3VjY2Vzcz8oZmlsZUVudHJ5LCBmaWxlKVxuICAgICAgICAsKGVycikgPT4gZXJyb3I/IGVyclxuICAgICAgLChlcnIpID0+IGVycm9yPyBlcnJcblxuICBnZXRGaWxlRW50cnk6IChkaXJFbnRyeSwgcGF0aCwgc3VjY2VzcywgZXJyb3IpIC0+XG4gICAgaWYgZGlyRW50cnk/LmdldEZpbGU/XG4gICAgICBkaXJFbnRyeS5nZXRGaWxlIHBhdGgsIHt9LCAoZmlsZUVudHJ5KSAtPlxuICAgICAgICBzdWNjZXNzPyBmaWxlRW50cnlcbiAgICAgICwoZXJyKSA9PiBlcnJvcj8gZXJyXG4gICAgZWxzZSBlcnJvcj8oKVxuXG4gICMgb3BlbkRpcmVjdG9yeTogKGNhbGxiYWNrKSAtPlxuICBvcGVuRGlyZWN0b3J5OiAoZGlyZWN0b3J5RW50cnksIGNhbGxiYWNrKSAtPlxuICAjIEBhcGkuY2hvb3NlRW50cnkgdHlwZTonb3BlbkRpcmVjdG9yeScsIChkaXJlY3RvcnlFbnRyeSwgZmlsZXMpID0+XG4gICAgQGFwaS5nZXREaXNwbGF5UGF0aCBkaXJlY3RvcnlFbnRyeSwgKHBhdGhOYW1lKSA9PlxuICAgICAgZGlyID1cbiAgICAgICAgICByZWxQYXRoOiBkaXJlY3RvcnlFbnRyeS5mdWxsUGF0aCAjLnJlcGxhY2UoJy8nICsgZGlyZWN0b3J5RW50cnkubmFtZSwgJycpXG4gICAgICAgICAgZGlyZWN0b3J5RW50cnlJZDogQGFwaS5yZXRhaW5FbnRyeShkaXJlY3RvcnlFbnRyeSlcbiAgICAgICAgICBlbnRyeTogZGlyZWN0b3J5RW50cnlcblxuICAgICAgICBjYWxsYmFjayBwYXRoTmFtZSwgZGlyXG4gICAgICAgICAgIyBAZ2V0T25lRGlyTGlzdCBkaXJcbiAgICAgICAgICAjIFN0b3JhZ2Uuc2F2ZSAnZGlyZWN0b3JpZXMnLCBAc2NvcGUuZGlyZWN0b3JpZXMgKHJlc3VsdCkgLT5cblxuICBnZXRMb2NhbEZpbGVFbnRyeTogKGRpciwgZmlsZVBhdGgsIGNiLCBlcnJvcikgPT4gXG4gICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgICAgIChmaWxlRW50cnkpID0+XG4gICAgICAgIGNiPyhmaWxlRW50cnkpXG4gICAgICAsZXJyb3JcblxuICBnZXRMb2NhbEZpbGU6IChkaXIsIGZpbGVQYXRoLCBjYiwgZXJyb3IpID0+IFxuICAjIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAjICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAjICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgICAgICwoX2Vycm9yKSA9PiBlcnJvcihfZXJyb3IpXG4gICMgZWxzZVxuICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgIyBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICAgICAgICAgLChfZXJyb3IpID0+IGVycm9yPyhfZXJyb3IpXG4gICAgICAsKF9lcnJvcikgPT4gZXJyb3I/KF9lcnJvcilcblxuICAgICAgIyBAZmluZEZpbGVGb3JRdWVyeVN0cmluZyBpbmZvLnVyaSwgc3VjY2VzcyxcbiAgICAgICMgICAgIChlcnIpID0+XG4gICAgICAjICAgICAgICAgQGZpbmRGaWxlRm9yUGF0aCBpbmZvLCBzdWNjZXNzLCBlcnJvclxuXG4gIGZpbmRGaWxlRm9yUGF0aDogKGluZm8sIHN1Y2Nlc3MsIGVycm9yKSA9PlxuICAgICAgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIHN1Y2Nlc3MsIGVycm9yLCBpbmZvLnJlZmVyZXJcblxuICBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nOiAoX3VybCwgY2IsIGVycm9yLCByZWZlcmVyKSA9PlxuICAgICAgdXJsID0gZGVjb2RlVVJJQ29tcG9uZW50KF91cmwpLnJlcGxhY2UgLy4qP3NscmVkaXJcXD0vLCAnJ1xuXG4gICAgICBtYXRjaCA9IGl0ZW0gZm9yIGl0ZW0gaW4gQG1hcHMgd2hlbiB1cmwubWF0Y2gobmV3IFJlZ0V4cChpdGVtLnVybCkpPyBhbmQgaXRlbS51cmw/IGFuZCBub3QgbWF0Y2g/XG5cbiAgICAgIGlmIG1hdGNoP1xuICAgICAgICAgIGlmIHJlZmVyZXI/XG4gICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLm1hdGNoKC8uKlxcL1xcLy4qP1xcLyguKikvKT9bMV1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXRjaC51cmwpLCBtYXRjaC5yZWdleFJlcGxcblxuICAgICAgICAgIGZpbGVQYXRoLnJlcGxhY2UgJy8nLCAnXFxcXCcgaWYgcGxhdGZvcm0gaXMgJ3dpbidcblxuICAgICAgICAgIGRpciA9IEBTdG9yYWdlLmRhdGEuZGlyZWN0b3JpZXNbbWF0Y2guZGlyZWN0b3J5XVxuXG4gICAgICAgICAgaWYgbm90IGRpcj8gdGhlbiByZXR1cm4gZXJyICdubyBtYXRjaCdcblxuICAgICAgICAgIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAgICAgICAgICAgICBkaXJFbnRyeSA9IEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdXG4gICAgICAgICAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgICAgICAgICAgICAgICAgIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiAgICAgICAgICAgICAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgICAgICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICAgICBlbHNlXG4gICAgICAgICAgZXJyb3IoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVTeXN0ZW0iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIExJU1RFTiBleHRlbmRzIENvbmZpZ1xuICBsb2NhbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZVxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgZXh0ZXJuYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbFxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgaW5zdGFuY2UgPSBudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgXG4gICAgY2hyb21lLnJ1bnRpbWUub25Db25uZWN0RXh0ZXJuYWwuYWRkTGlzdGVuZXIgKHBvcnQpID0+XG4gICAgICBwb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgICBAbG9jYWwuYXBpLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlXG4gICAgQGV4dGVybmFsLmFwaT8uYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IExJU1RFTlxuXG4gIExvY2FsOiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgQGxvY2FsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgRXh0OiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgc2hvdyAnYWRkaW5nIGV4dCBsaXN0ZW5lciBmb3IgJyArIG1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBfb25NZXNzYWdlRXh0ZXJuYWw6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuICAgIF9zZW5kUmVzcG9uc2UgPSAtPlxuICAgICAgdHJ5XG4gICAgICAgIHNob3cgJ2NhbGxpbmcgc2VuZHJlc3BvbnNlJ1xuICAgICAgICBzZW5kUmVzcG9uc2UuYXBwbHkgbnVsbCxhcmd1bWVudHNcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgdW5kZWZpbmVkICMgZXJyb3IgYmVjYXVzZSBubyByZXNwb25zZSB3YXMgcmVxdWVzdGVkIGZyb20gdGhlIE1TRywgZG9uJ3QgY2FyZVxuICAgICAgcmVzcG9uc2VTdGF0dXMuY2FsbGVkID0gdHJ1ZVxuICAgICAgXG4gICAgKHNob3cgXCI8PT0gR09UIEVYVEVSTkFMIE1FU1NBR0UgPT0gI3sgQEVYVF9UWVBFIH0gPT1cIiArIF9rZXkpIGZvciBfa2V5IG9mIHJlcXVlc3RcbiAgICBpZiBzZW5kZXIuaWQgaXNudCBARVhUX0lEIGFuZCBzZW5kZXIuY29uc3RydWN0b3IubmFtZSBpc250ICdQb3J0J1xuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgX3NlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcbiAgICBcbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkICMgZm9yIHN5bmNocm9ub3VzIHNlbmRSZXNwb25zZVxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgX29uTWVzc2FnZTogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHJlc3BvbnNlU3RhdHVzID0gY2FsbGVkOmZhbHNlXG4gICAgX3NlbmRSZXNwb25zZSA9ID0+XG4gICAgICB0cnlcbiAgICAgICAgc2hvdyAnY2FsbGluZyBzZW5kcmVzcG9uc2UnXG4gICAgICAgIHNlbmRSZXNwb25zZS5hcHBseSB0aGlzLGFyZ3VtZW50c1xuICAgICAgY2F0Y2ggZVxuICAgICAgICBzaG93IGVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcblxuICAgIChzaG93IFwiPD09IEdPVCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgQGxvY2FsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG5cbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkXG4gICAgICAjIHNob3cgJ3JldHVybmluZyB0cnVlJ1xuICAgICAgcmV0dXJuIHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBMSVNURU4iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIE1TRyBleHRlbmRzIENvbmZpZ1xuICBpbnN0YW5jZSA9IG51bGxcbiAgcG9ydDpudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgQHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG5cbiAgQGdldDogKCkgLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgTVNHXG5cbiAgQGNyZWF0ZVBvcnQ6ICgpIC0+XG5cblxuICBMb2NhbDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0OiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICAoc2hvdyBcIj09IE1FU1NBR0UgRVhURVJOQUwgI3sgX2tleSB9ID09PlwiKSBmb3IgX2tleSBvZiBtZXNzYWdlXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgQEVYVF9JRCwgbWVzc2FnZSwgcmVzcG9uZFxuICBFeHRQb3J0OiAobWVzc2FnZSkgLT5cbiAgICB0cnlcbiAgICAgIEBwb3J0LnBvc3RNZXNzYWdlIG1lc3NhZ2VcbiAgICBjYXRjaFxuICAgICAgQHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG4gICAgICBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG5cbm1vZHVsZS5leHBvcnRzID0gTVNHIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBDaGFuZ2U7XG5cbi8qIVxuICogQ2hhbmdlIG9iamVjdCBjb25zdHJ1Y3RvclxuICpcbiAqIFRoZSBgY2hhbmdlYCBvYmplY3QgcGFzc2VkIHRvIE9iamVjdC5vYnNlcnZlIGNhbGxiYWNrc1xuICogaXMgaW1tdXRhYmxlIHNvIHdlIGNyZWF0ZSBhIG5ldyBvbmUgdG8gbW9kaWZ5LlxuICovXG5cbmZ1bmN0aW9uIENoYW5nZSAocGF0aCwgY2hhbmdlKSB7XG4gIHRoaXMucGF0aCA9IHBhdGg7XG4gIHRoaXMubmFtZSA9IGNoYW5nZS5uYW1lO1xuICB0aGlzLnR5cGUgPSBjaGFuZ2UudHlwZTtcbiAgdGhpcy5vYmplY3QgPSBjaGFuZ2Uub2JqZWN0O1xuICB0aGlzLnZhbHVlID0gY2hhbmdlLm9iamVjdFtjaGFuZ2UubmFtZV07XG4gIHRoaXMub2xkVmFsdWUgPSBjaGFuZ2Uub2xkVmFsdWU7XG59XG5cbiIsIi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6b2JzZXJ2ZVxuXG52YXIgQ2hhbmdlID0gcmVxdWlyZSgnLi9jaGFuZ2UnKTtcbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnb2JzZXJ2ZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gT2JzZXJ2YWJsZTtcblxuLyoqXG4gKiBPYnNlcnZhYmxlIGNvbnN0cnVjdG9yLlxuICpcbiAqIFRoZSBwYXNzZWQgYHN1YmplY3RgIHdpbGwgYmUgb2JzZXJ2ZWQgZm9yIGNoYW5nZXMgdG9cbiAqIGFsbCBwcm9wZXJ0aWVzLCBpbmNsdWRlZCBuZXN0ZWQgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICpcbiAqIEFuIGBFdmVudEVtaXR0ZXJgIHdpbGwgYmUgcmV0dXJuZWQuIFRoaXMgZW1pdHRlciB3aWxsXG4gKiBlbWl0IHRoZSBmb2xsb3dpbmcgZXZlbnRzOlxuICpcbiAqIC0gYWRkXG4gKiAtIHVwZGF0ZVxuICogLSBkZWxldGVcbiAqIC0gcmVjb25maWd1cmVcbiAqXG4gKiAvLyAtIHNldFByb3RvdHlwZT9cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc3ViamVjdFxuICogQHBhcmFtIHtPYnNlcnZhYmxlfSBbcGFyZW50XSAoaW50ZXJuYWwgdXNlKVxuICogQHBhcmFtIHtTdHJpbmd9IFtwcmVmaXhdIChpbnRlcm5hbCB1c2UpXG4gKiBAcmV0dXJuIHtFdmVudEVtaXR0ZXJ9XG4gKi9cblxuZnVuY3Rpb24gT2JzZXJ2YWJsZSAoc3ViamVjdCwgcGFyZW50LCBwcmVmaXgpIHtcbiAgaWYgKCdvYmplY3QnICE9IHR5cGVvZiBzdWJqZWN0KVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29iamVjdCBleHBlY3RlZC4gZ290OiAnICsgdHlwZW9mIHN1YmplY3QpO1xuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBPYnNlcnZhYmxlKSlcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoc3ViamVjdCwgcGFyZW50LCBwcmVmaXgpO1xuXG4gIGRlYnVnKCduZXcnLCBzdWJqZWN0LCAhIXBhcmVudCwgcHJlZml4KTtcblxuICBFbWl0dGVyLmNhbGwodGhpcyk7XG4gIHRoaXMuX2JpbmQoc3ViamVjdCwgcGFyZW50LCBwcmVmaXgpO1xufTtcblxuLy8gYWRkIGVtaXR0ZXIgY2FwYWJpbGl0aWVzXG5mb3IgKHZhciBpIGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gIE9ic2VydmFibGUucHJvdG90eXBlW2ldID0gRW1pdHRlci5wcm90b3R5cGVbaV07XG59XG5cbk9ic2VydmFibGUucHJvdG90eXBlLm9ic2VydmVycyA9IHVuZGVmaW5lZDtcbk9ic2VydmFibGUucHJvdG90eXBlLm9uY2hhbmdlID0gdW5kZWZpbmVkO1xuT2JzZXJ2YWJsZS5wcm90b3R5cGUuc3ViamVjdCA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBCaW5kcyB0aGlzIE9ic2VydmFibGUgdG8gYHN1YmplY3RgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdWJqZWN0XG4gKiBAcGFyYW0ge09ic2VydmFibGV9IFtwYXJlbnRdXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ByZWZpeF1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbk9ic2VydmFibGUucHJvdG90eXBlLl9iaW5kID0gZnVuY3Rpb24gKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KSB7XG4gIGlmICh0aGlzLnN1YmplY3QpIHRocm93IG5ldyBFcnJvcignYWxyZWFkeSBib3VuZCEnKTtcbiAgaWYgKG51bGwgPT0gc3ViamVjdCkgdGhyb3cgbmV3IFR5cGVFcnJvcignc3ViamVjdCBjYW5ub3QgYmUgbnVsbCcpO1xuXG4gIGRlYnVnKCdfYmluZCcsIHN1YmplY3QpO1xuXG4gIHRoaXMuc3ViamVjdCA9IHN1YmplY3Q7XG5cbiAgaWYgKHBhcmVudCkge1xuICAgIHBhcmVudC5vYnNlcnZlcnMucHVzaCh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm9ic2VydmVycyA9IFt0aGlzXTtcbiAgfVxuXG4gIHRoaXMub25jaGFuZ2UgPSBvbmNoYW5nZShwYXJlbnQgfHwgdGhpcywgcHJlZml4KTtcbiAgT2JqZWN0Lm9ic2VydmUodGhpcy5zdWJqZWN0LCB0aGlzLm9uY2hhbmdlKTtcblxuICB0aGlzLl93YWxrKHBhcmVudCB8fCB0aGlzLCBwcmVmaXgpO1xufVxuXG4vKipcbiAqIFBlbmRpbmcgY2hhbmdlIGV2ZW50cyBhcmUgbm90IGVtaXR0ZWQgdW50aWwgYWZ0ZXIgdGhlIG5leHRcbiAqIHR1cm4gb2YgdGhlIGV2ZW50IGxvb3AuIFRoaXMgbWV0aG9kIGZvcmNlcyB0aGUgZW5naW5lcyBoYW5kXG4gKiBhbmQgdHJpZ2dlcnMgYWxsIGV2ZW50cyBub3cuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5kZWxpdmVyQ2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgZGVidWcoJ2RlbGl2ZXJDaGFuZ2VzJylcbiAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaChmdW5jdGlvbihvKSB7XG4gICAgT2JqZWN0LmRlbGl2ZXJDaGFuZ2VSZWNvcmRzKG8ub25jaGFuZ2UpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBXYWxrIGRvd24gdGhyb3VnaCB0aGUgdHJlZSBvZiBvdXIgYHN1YmplY3RgLCBvYnNlcnZpbmdcbiAqIG9iamVjdHMgYWxvbmcgdGhlIHdheS5cbiAqXG4gKiBAcGFyYW0ge09ic2VydmFibGV9IFtwYXJlbnRdXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ByZWZpeF1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbk9ic2VydmFibGUucHJvdG90eXBlLl93YWxrID0gZnVuY3Rpb24gKHBhcmVudCwgcHJlZml4KSB7XG4gIGRlYnVnKCdfd2FsaycpO1xuXG4gIHZhciBvYmplY3QgPSB0aGlzLnN1YmplY3Q7XG5cbiAgLy8ga2V5cz9cbiAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0W25hbWVdO1xuXG4gICAgaWYgKCdvYmplY3QnICE9IHR5cGVvZiB2YWx1ZSkgcmV0dXJuO1xuICAgIGlmIChudWxsID09IHZhbHVlKSByZXR1cm47XG5cbiAgICB2YXIgcGF0aCA9IHByZWZpeFxuICAgICAgPyBwcmVmaXggKyAnLicgKyBuYW1lXG4gICAgICA6IG5hbWU7XG5cbiAgICBuZXcgT2JzZXJ2YWJsZSh2YWx1ZSwgcGFyZW50LCBwYXRoKTtcbiAgfSk7XG59XG5cbi8qKlxuICogU3RvcCBsaXN0ZW5pbmcgdG8gYWxsIGJvdW5kIG9iamVjdHNcbiAqL1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICBkZWJ1Zygnc3RvcCcpO1xuXG4gIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goZnVuY3Rpb24gKG9ic2VydmVyKSB7XG4gICAgT2JqZWN0LnVub2JzZXJ2ZShvYnNlcnZlci5zdWJqZWN0LCBvYnNlcnZlci5vbmNoYW5nZSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFN0b3AgbGlzdGVuaW5nIHRvIGNoYW5nZXMgb24gYHN1YmplY3RgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHN1YmplY3RcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbk9ic2VydmFibGUucHJvdG90eXBlLl9yZW1vdmUgPSBmdW5jdGlvbiAoc3ViamVjdCkge1xuICBkZWJ1ZygnX3JlbW92ZScsIHN1YmplY3QpO1xuXG4gIHRoaXMub2JzZXJ2ZXJzID0gdGhpcy5vYnNlcnZlcnMuZmlsdGVyKGZ1bmN0aW9uIChvYnNlcnZlcikge1xuICAgIGlmIChzdWJqZWN0ID09IG9ic2VydmVyLnN1YmplY3QpIHtcbiAgICAgIE9iamVjdC51bm9ic2VydmUob2JzZXJ2ZXIuc3ViamVjdCwgb2JzZXJ2ZXIub25jaGFuZ2UpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbn1cblxuLyohXG4gKiBDcmVhdGVzIGFuIE9iamVjdC5vYnNlcnZlIGBvbmNoYW5nZWAgbGlzdGVuZXJcbiAqL1xuXG5mdW5jdGlvbiBvbmNoYW5nZSAocGFyZW50LCBwcmVmaXgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChhcnkpIHtcbiAgICBkZWJ1Zygnb25jaGFuZ2UnLCBwcmVmaXgpO1xuXG4gICAgYXJ5LmZvckVhY2goZnVuY3Rpb24gKGNoYW5nZSkge1xuICAgICAgdmFyIG9iamVjdCA9IGNoYW5nZS5vYmplY3Q7XG4gICAgICB2YXIgdHlwZSA9IGNoYW5nZS50eXBlO1xuICAgICAgdmFyIG5hbWUgPSBjaGFuZ2UubmFtZTtcbiAgICAgIHZhciB2YWx1ZSA9IG9iamVjdFtuYW1lXTtcblxuICAgICAgdmFyIHBhdGggPSBwcmVmaXhcbiAgICAgICAgPyBwcmVmaXggKyAnLicgKyBuYW1lXG4gICAgICAgIDogbmFtZVxuXG4gICAgICBpZiAoJ2FkZCcgPT0gdHlwZSAmJiBudWxsICE9IHZhbHVlICYmICdvYmplY3QnID09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICBuZXcgT2JzZXJ2YWJsZSh2YWx1ZSwgcGFyZW50LCBwYXRoKTtcbiAgICAgIH0gZWxzZSBpZiAoJ2RlbGV0ZScgPT0gdHlwZSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgY2hhbmdlLm9sZFZhbHVlKSB7XG4gICAgICAgIHBhcmVudC5fcmVtb3ZlKGNoYW5nZS5vbGRWYWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGNoYW5nZSA9IG5ldyBDaGFuZ2UocGF0aCwgY2hhbmdlKTtcbiAgICAgIHBhcmVudC5lbWl0KHR5cGUsIGNoYW5nZSk7XG4gICAgICBwYXJlbnQuZW1pdCh0eXBlICsgJyAnICsgcGF0aCwgY2hhbmdlKTtcbiAgICAgIHBhcmVudC5lbWl0KCdjaGFuZ2UnLCBjaGFuZ2UpO1xuICAgIH0pXG4gIH1cbn1cblxuIiwiXG4vKipcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlYnVnO1xuXG4vKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7VHlwZX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVidWcobmFtZSkge1xuICBpZiAoIWRlYnVnLmVuYWJsZWQobmFtZSkpIHJldHVybiBmdW5jdGlvbigpe307XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGZtdCl7XG4gICAgZm10ID0gY29lcmNlKGZtdCk7XG5cbiAgICB2YXIgY3VyciA9IG5ldyBEYXRlO1xuICAgIHZhciBtcyA9IGN1cnIgLSAoZGVidWdbbmFtZV0gfHwgY3Vycik7XG4gICAgZGVidWdbbmFtZV0gPSBjdXJyO1xuXG4gICAgZm10ID0gbmFtZVxuICAgICAgKyAnICdcbiAgICAgICsgZm10XG4gICAgICArICcgKycgKyBkZWJ1Zy5odW1hbml6ZShtcyk7XG5cbiAgICAvLyBUaGlzIGhhY2tlcnkgaXMgcmVxdWlyZWQgZm9yIElFOFxuICAgIC8vIHdoZXJlIGBjb25zb2xlLmxvZ2AgZG9lc24ndCBoYXZlICdhcHBseSdcbiAgICB3aW5kb3cuY29uc29sZVxuICAgICAgJiYgY29uc29sZS5sb2dcbiAgICAgICYmIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGN1cnJlbnRseSBhY3RpdmUgZGVidWcgbW9kZSBuYW1lcy5cbiAqL1xuXG5kZWJ1Zy5uYW1lcyA9IFtdO1xuZGVidWcuc2tpcHMgPSBbXTtcblxuLyoqXG4gKiBFbmFibGVzIGEgZGVidWcgbW9kZSBieSBuYW1lLiBUaGlzIGNhbiBpbmNsdWRlIG1vZGVzXG4gKiBzZXBhcmF0ZWQgYnkgYSBjb2xvbiBhbmQgd2lsZGNhcmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmRlYnVnLmVuYWJsZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdHJ5IHtcbiAgICBsb2NhbFN0b3JhZ2UuZGVidWcgPSBuYW1lO1xuICB9IGNhdGNoKGUpe31cblxuICB2YXIgc3BsaXQgPSAobmFtZSB8fCAnJykuc3BsaXQoL1tcXHMsXSsvKVxuICAgICwgbGVuID0gc3BsaXQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBuYW1lID0gc3BsaXRbaV0ucmVwbGFjZSgnKicsICcuKj8nKTtcbiAgICBpZiAobmFtZVswXSA9PT0gJy0nKSB7XG4gICAgICBkZWJ1Zy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZS5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBkZWJ1Zy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZSArICckJykpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBEaXNhYmxlIGRlYnVnIG91dHB1dC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmRlYnVnLmRpc2FibGUgPSBmdW5jdGlvbigpe1xuICBkZWJ1Zy5lbmFibGUoJycpO1xufTtcblxuLyoqXG4gKiBIdW1hbml6ZSB0aGUgZ2l2ZW4gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZGVidWcuaHVtYW5pemUgPSBmdW5jdGlvbihtcykge1xuICB2YXIgc2VjID0gMTAwMFxuICAgICwgbWluID0gNjAgKiAxMDAwXG4gICAgLCBob3VyID0gNjAgKiBtaW47XG5cbiAgaWYgKG1zID49IGhvdXIpIHJldHVybiAobXMgLyBob3VyKS50b0ZpeGVkKDEpICsgJ2gnO1xuICBpZiAobXMgPj0gbWluKSByZXR1cm4gKG1zIC8gbWluKS50b0ZpeGVkKDEpICsgJ20nO1xuICBpZiAobXMgPj0gc2VjKSByZXR1cm4gKG1zIC8gc2VjIHwgMCkgKyAncyc7XG4gIHJldHVybiBtcyArICdtcyc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZGVidWcuZW5hYmxlZCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRlYnVnLnNraXBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGRlYnVnLnNraXBzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRlYnVnLm5hbWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGRlYnVnLm5hbWVzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cblxuLy8gcGVyc2lzdFxuXG50cnkge1xuICBpZiAod2luZG93LmxvY2FsU3RvcmFnZSkgZGVidWcuZW5hYmxlKGxvY2FsU3RvcmFnZS5kZWJ1Zyk7XG59IGNhdGNoKGUpe31cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsImNsYXNzIE5vdGlmaWNhdGlvblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICBzaG93OiAodGl0bGUsIG1lc3NhZ2UpIC0+XG4gICAgdW5pcXVlSWQgPSAobGVuZ3RoPTgpIC0+XG4gICAgICBpZCA9IFwiXCJcbiAgICAgIGlkICs9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKSB3aGlsZSBpZC5sZW5ndGggPCBsZW5ndGhcbiAgICAgIGlkLnN1YnN0ciAwLCBsZW5ndGhcblxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSB1bmlxdWVJZCgpLFxuICAgICAgdHlwZTonYmFzaWMnXG4gICAgICB0aXRsZTp0aXRsZVxuICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgICAgaWNvblVybDonaW1hZ2VzL2ljb24tMzgucG5nJyxcbiAgICAgIChjYWxsYmFjaykgLT5cbiAgICAgICAgdW5kZWZpbmVkXG5cbm1vZHVsZS5leHBvcnRzID0gTm90aWZpY2F0aW9uIiwiY2xhc3MgUmVkaXJlY3RcbiAgZGF0YTpcbiAgICB0YWJJZDpcbiAgICAgIGxpc3RlbmVyOm51bGxcbiAgICAgIGlzT246ZmFsc2VcbiAgXG4gIHByZWZpeDpudWxsXG4gIGN1cnJlbnRNYXRjaGVzOnt9XG4gIGN1cnJlbnRUYWJJZDogbnVsbFxuICBnZXRMb2NhbEZpbGVQYXRoOiAtPlxuICAjIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI3NzU1XG4gICMgdXJsOiBSZWdFeHBbJyQmJ10sXG4gICMgcHJvdG9jb2w6UmVnRXhwLiQyLFxuICAjIGhvc3Q6UmVnRXhwLiQzLFxuICAjIHBhdGg6UmVnRXhwLiQ0LFxuICAjIGZpbGU6UmVnRXhwLiQ2LCAvLyA4XG4gICMgcXVlcnk6UmVnRXhwLiQ3LFxuICAjIGhhc2g6UmVnRXhwLiQ4XG4gICAgICAgICBcbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgdGFiOiAodGFiSWQpIC0+XG4gICAgQGN1cnJlbnRUYWJJZCA9IHRhYklkXG4gICAgQGRhdGFbdGFiSWRdID89IHt9XG4gICAgdGhpc1xuXG4gIHdpdGhQcmVmaXg6IChwcmVmaXgpID0+XG4gICAgQHByZWZpeCA9IHByZWZpeFxuICAgIHRoaXNcblxuICB3aXRoRGlyZWN0b3JpZXM6IChkaXJlY3RvcmllcykgLT5cbiAgICBpZiBkaXJlY3Rvcmllcz8ubGVuZ3RoIGlzIDBcbiAgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLmRpcmVjdG9yaWVzID0gW10gXG4gICAgICBAX3N0b3AgQGN1cnJlbnRUYWJJZFxuICAgIGVsc2UgI2lmIE9iamVjdC5rZXlzKEBkYXRhW0BjdXJyZW50VGFiSWRdKS5sZW5ndGggaXMgMFxuICAgICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0uZGlyZWN0b3JpZXMgPSBkaXJlY3Rvcmllc1xuICAgICAgQHN0YXJ0KClcbiAgICB0aGlzICAgIFxuXG4gIHdpdGhNYXBzOiAobWFwcykgLT5cbiAgICBpZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtYXBzKS5sZW5ndGggaXMgMFxuICAgICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubWFwcyA9IHt9IFxuICAgICAgQF9zdG9wIEBjdXJyZW50VGFiSWRcbiAgICBlbHNlICNpZiBPYmplY3Qua2V5cyhAZGF0YVtAY3VycmVudFRhYklkXSkubGVuZ3RoIGlzIDBcbiAgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHMgPSBtYXBzXG4gICAgICBAc3RhcnQoKVxuICAgIHRoaXNcblxuICBzdGFydDogLT5cbiAgICB1bmxlc3MgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubGlzdGVuZXJcbiAgICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5yZW1vdmVMaXN0ZW5lciBAZGF0YVtAY3VycmVudFRhYklkXS5saXN0ZW5lclxuXG4gICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubGlzdGVuZXIgPSBAY3JlYXRlUmVkaXJlY3RMaXN0ZW5lcigpXG4gICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0uaXNPbiA9IHRydWVcbiAgICBAX3N0YXJ0IEBjdXJyZW50VGFiSWRcblxuICBraWxsQWxsOiAoKSAtPlxuICAgIEBfc3RvcCB0YWJJZCBmb3IgdGFiSWQgb2YgQGRhdGFcblxuICBfc3RvcDogKHRhYklkKSAtPlxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5yZW1vdmVMaXN0ZW5lciBAZGF0YVt0YWJJZF0ubGlzdGVuZXJcblxuICBfc3RhcnQ6ICh0YWJJZCkgLT5cbiAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QuYWRkTGlzdGVuZXIgQGRhdGFbdGFiSWRdLmxpc3RlbmVyLFxuICAgICAgdXJsczpbJzxhbGxfdXJscz4nXVxuICAgICAgdGFiSWQ6QGN1cnJlbnRUYWJJZCxcbiAgICAgIFsnYmxvY2tpbmcnXVxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgdG9nZ2xlOiAoKSAtPlxuICAgICAgQHN0YXR1c1tAY3VycmVudFRhYklkXSA9IHRydWUgdW5sZXNzIEBzdGF0dXNbQGN1cnJlbnRUYWJJZF0/XG4gICAgICBAc3RhdHVzW0BjdXJyZW50VGFiSWRdID0gIUBzdGF0dXNbQGN1cnJlbnRUYWJJZF1cblxuICAgICAgaWYgQHN0YXR1c1tAY3VycmVudFRhYklkXVxuICAgICAgICBAc3RhcnRTZXJ2ZXIoKVxuICAgICAgICBAc3RhcnQoKVxuICAgICAgZWxzZVxuICAgICAgICBAc3RvcCgpXG4gICAgICAgIEBzdG9wU2VydmVyKClcblxuICBjcmVhdGVSZWRpcmVjdExpc3RlbmVyOiAoKSAtPlxuICAgIChkZXRhaWxzKSA9PlxuICAgICAgcGF0aCA9IEBnZXRMb2NhbEZpbGVQYXRoIGRldGFpbHMudXJsXG4gICAgICBpZiBwYXRoP1xuICAgICAgICByZXR1cm4gcmVkaXJlY3RVcmw6QHByZWZpeCArIHBhdGhcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHt9IFxuXG4gIHRvRGljdDogKG9iaixrZXkpIC0+XG4gICAgb2JqLnJlZHVjZSAoKGRpY3QsIF9vYmopIC0+IGRpY3RbIF9vYmpba2V5XSBdID0gX29iaiBpZiBfb2JqW2tleV0/OyByZXR1cm4gZGljdCksIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gUmVkaXJlY3RcbiIsIiNUT0RPOiByZXdyaXRlIHRoaXMgY2xhc3MgdXNpbmcgdGhlIG5ldyBjaHJvbWUuc29ja2V0cy4qIGFwaSB3aGVuIHlvdSBjYW4gbWFuYWdlIHRvIG1ha2UgaXQgd29ya1xuY2xhc3MgU2VydmVyXG4gIHNvY2tldDogY2hyb21lLnNvY2tldFxuICAjIHRjcDogY2hyb21lLnNvY2tldHMudGNwXG4gIGhvc3Q6XCIxMjcuMC4wLjFcIlxuICBwb3J0OjgwODlcbiAgbWF4Q29ubmVjdGlvbnM6NTAwXG4gIHNvY2tldFByb3BlcnRpZXM6XG4gICAgICBwZXJzaXN0ZW50OnRydWVcbiAgICAgIG5hbWU6J1NMUmVkaXJlY3RvcidcbiAgc29ja2V0SW5mbzpudWxsXG4gIGdldExvY2FsRmlsZTpudWxsXG4gIHNvY2tldElkczpbXVxuICBzdG9wcGVkOnRydWVcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuICBzdGFydDogKGhvc3QscG9ydCxtYXhDb25uZWN0aW9ucywgY2IsZXJyKSAtPlxuICAgIEBob3N0ID0gaWYgaG9zdD8gdGhlbiBob3N0IGVsc2UgQGhvc3RcbiAgICBAcG9ydCA9IGlmIHBvcnQ/IHRoZW4gcG9ydCBlbHNlIEBwb3J0XG4gICAgQG1heENvbm5lY3Rpb25zID0gaWYgbWF4Q29ubmVjdGlvbnM/IHRoZW4gbWF4Q29ubmVjdGlvbnMgZWxzZSBAbWF4Q29ubmVjdGlvbnNcblxuICAgIEBraWxsQWxsIChzdWNjZXNzKSA9PlxuICAgICAgQHNvY2tldC5jcmVhdGUgJ3RjcCcsIHt9LCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgQHNvY2tldElkcyA9IFtdXG4gICAgICAgIEBzb2NrZXRJZHMucHVzaCBzb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0ICdzb2NrZXRJZHMnOkBzb2NrZXRJZHNcbiAgICAgICAgQHNvY2tldC5saXN0ZW4gc29ja2V0SW5mby5zb2NrZXRJZCwgQGhvc3QsIEBwb3J0LCAocmVzdWx0KSA9PlxuICAgICAgICAgIGlmIHJlc3VsdCA+IC0xXG4gICAgICAgICAgICBzaG93ICdsaXN0ZW5pbmcgJyArIHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgICAgIEBzdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICAgIEBzb2NrZXRJbmZvID0gc29ja2V0SW5mb1xuICAgICAgICAgICAgQHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuICAgICAgICAgICAgY2I/IHNvY2tldEluZm9cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnI/IHJlc3VsdFxuICAgICxlcnI/XG5cblxuICBraWxsQWxsOiAoY2FsbGJhY2ssIGVycm9yKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0ICdzb2NrZXRJZHMnLCAocmVzdWx0KSA9PlxuICAgICAgc2hvdyAnZ290IGlkcydcbiAgICAgIHNob3cgcmVzdWx0XG4gICAgICBAc29ja2V0SWRzID0gcmVzdWx0LnNvY2tldElkc1xuICAgICAgcmV0dXJuIGNhbGxiYWNrPygpIHVubGVzcyBAc29ja2V0SWRzP1xuICAgICAgY250ID0gMFxuICAgICAgZm9yIHMgaW4gQHNvY2tldElkc1xuICAgICAgICBkbyAocykgPT5cbiAgICAgICAgICBjbnQrK1xuICAgICAgICAgIEBzb2NrZXQuZ2V0SW5mbyBzLCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgICAgIGNudC0tXG4gICAgICAgICAgICBpZiBub3QgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yP1xuICAgICAgICAgICAgICBAc29ja2V0LmRpc2Nvbm5lY3Qgc1xuICAgICAgICAgICAgICBAc29ja2V0LmRlc3Ryb3kgc1xuXG4gICAgICAgICAgICBjYWxsYmFjaz8oKSBpZiBjbnQgaXMgMFxuXG5cbiAgc3RvcDogKGNhbGxiYWNrLCBlcnJvcikgLT5cbiAgICBAa2lsbEFsbCAoc3VjY2VzcykgPT5cbiAgICAgIEBzdG9wcGVkID0gdHJ1ZVxuICAgICAgY2FsbGJhY2s/KClcbiAgICAsKGVycm9yKSA9PlxuICAgICAgZXJyb3I/IGVycm9yXG5cblxuICBfb25SZWNlaXZlOiAocmVjZWl2ZUluZm8pID0+XG4gICAgc2hvdyhcIkNsaWVudCBzb2NrZXQgJ3JlY2VpdmUnIGV2ZW50OiBzZD1cIiArIHJlY2VpdmVJbmZvLnNvY2tldElkXG4gICAgKyBcIiwgYnl0ZXM9XCIgKyByZWNlaXZlSW5mby5kYXRhLmJ5dGVMZW5ndGgpXG5cbiAgX29uTGlzdGVuOiAoc2VydmVyU29ja2V0SWQsIHJlc3VsdENvZGUpID0+XG4gICAgcmV0dXJuIHNob3cgJ0Vycm9yIExpc3RlbmluZzogJyArIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIGlmIHJlc3VsdENvZGUgPCAwXG4gICAgQHNlcnZlclNvY2tldElkID0gc2VydmVyU29ja2V0SWRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0LmFkZExpc3RlbmVyIEBfb25BY2NlcHRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0RXJyb3IuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdEVycm9yXG4gICAgQHRjcC5vblJlY2VpdmUuYWRkTGlzdGVuZXIgQF9vblJlY2VpdmVcbiAgICAjIHNob3cgXCJbXCIrc29ja2V0SW5mby5wZWVyQWRkcmVzcytcIjpcIitzb2NrZXRJbmZvLnBlZXJQb3J0K1wiXSBDb25uZWN0aW9uIGFjY2VwdGVkIVwiO1xuICAgICMgaW5mbyA9IEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICMgQGdldEZpbGUgdXJpLCAoZmlsZSkgLT5cbiAgX29uQWNjZXB0RXJyb3I6IChlcnJvcikgLT5cbiAgICBzaG93IGVycm9yXG5cbiAgX29uQWNjZXB0OiAoc29ja2V0SW5mbykgPT5cbiAgICAjIHJldHVybiBudWxsIGlmIGluZm8uc29ja2V0SWQgaXNudCBAc2VydmVyU29ja2V0SWRcbiAgICBzaG93KFwiU2VydmVyIHNvY2tldCAnYWNjZXB0JyBldmVudDogc2Q9XCIgKyBzb2NrZXRJbmZvLnNvY2tldElkKVxuICAgIGlmIHNvY2tldEluZm8/LnNvY2tldElkP1xuICAgICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkLCAoaW5mbykgPT5cbiAgICAgICAgQGdldExvY2FsRmlsZSBpbmZvLCAoZmlsZUVudHJ5LCBmaWxlUmVhZGVyKSA9PlxuICAgICAgICAgICAgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldEluZm8uc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZVJlYWRlciwgaW5mby5rZWVwQWxpdmVcbiAgICAgICAgLChlcnJvcikgPT5cbiAgICAgICAgICAgIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG4gICAgZWxzZVxuICAgICAgc2hvdyBcIk5vIHNvY2tldD8hXCJcbiAgICAjIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuXG5cbiAgc3RyaW5nVG9VaW50OEFycmF5OiAoc3RyaW5nKSAtPlxuICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgaSA9IDBcblxuICAgIHdoaWxlIGkgPCBzdHJpbmcubGVuZ3RoXG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgIGkrK1xuICAgIHZpZXdcblxuICBhcnJheUJ1ZmZlclRvU3RyaW5nOiAoYnVmZmVyKSAtPlxuICAgIHN0ciA9IFwiXCJcbiAgICB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgcyA9IDBcblxuICAgIHdoaWxlIHMgPCB1QXJyYXlWYWwubGVuZ3RoXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pXG4gICAgICBzKytcbiAgICBzdHJcblxuICBfd3JpdGUyMDBSZXNwb25zZTogKHNvY2tldElkLCBmaWxlRW50cnksIGZpbGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBjb250ZW50VHlwZSA9IChpZiAoZmlsZS50eXBlIGlzIFwiXCIpIHRoZW4gXCJ0ZXh0L3BsYWluXCIgZWxzZSBmaWxlLnR5cGUpXG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+XG4gICAgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShldi50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgICAgc2hvdyB3cml0ZUluZm9cbiAgICAgICAgIyBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5vbmVycm9yID0gKGVycm9yKSA9PlxuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGZpbGVcblxuXG4gICAgIyBAZW5kIHNvY2tldElkXG4gICAgIyBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICMgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgPT5cbiAgICAjICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAjICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICMgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAjICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJZFxuXG5cbiAgX3JlYWRGcm9tU29ja2V0OiAoc29ja2V0SWQsIGNiKSAtPlxuICAgIEBzb2NrZXQucmVhZCBzb2NrZXRJZCwgKHJlYWRJbmZvKSA9PlxuICAgICAgc2hvdyBcIlJFQURcIiwgcmVhZEluZm9cblxuICAgICAgIyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIGRhdGEgPSBAYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKVxuICAgICAgc2hvdyBkYXRhXG5cbiAgICAgIGlmIGRhdGEuaW5kZXhPZihcIkdFVCBcIikgaXNudCAwXG4gICAgICAgIEBlbmQgc29ja2V0SWRcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGtlZXBBbGl2ZSA9IGZhbHNlXG4gICAgICBrZWVwQWxpdmUgPSB0cnVlIGlmIGRhdGEuaW5kZXhPZiAnQ29ubmVjdGlvbjoga2VlcC1hbGl2ZScgaXNudCAtMVxuXG4gICAgICB1cmlFbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIDQpXG5cbiAgICAgIHJldHVybiBlbmQgc29ja2V0SWQgaWYgdXJpRW5kIDwgMFxuXG4gICAgICB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpXG4gICAgICBpZiBub3QgdXJpP1xuICAgICAgICB3cml0ZUVycm9yIHNvY2tldElkLCA0MDQsIGtlZXBBbGl2ZVxuICAgICAgICByZXR1cm5cblxuICAgICAgaW5mbyA9XG4gICAgICAgIHVyaTogdXJpXG4gICAgICAgIGtlZXBBbGl2ZTprZWVwQWxpdmVcbiAgICAgIGluZm8ucmVmZXJlciA9IGRhdGEubWF0Y2goL1JlZmVyZXI6XFxzKC4qKS8pP1sxXVxuICAgICAgI3N1Y2Nlc3NcbiAgICAgIGNiPyBpbmZvXG5cbiAgZW5kOiAoc29ja2V0SWQsIGtlZXBBbGl2ZSkgLT5cbiAgICAgICMgaWYga2VlcEFsaXZlXG4gICAgICAjICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgIyBlbHNlXG4gICAgQHNvY2tldC5kaXNjb25uZWN0IHNvY2tldElkXG4gICAgQHNvY2tldC5kZXN0cm95IHNvY2tldElkXG4gICAgc2hvdyAnZW5kaW5nICcgKyBzb2NrZXRJZFxuICAgIEBzb2NrZXQuYWNjZXB0IEBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAgX3dyaXRlRXJyb3I6IChzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIC0+XG4gICAgZmlsZSA9IHNpemU6IDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIlxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGVcbiAgICBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiICMoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIlxuICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcnZlclxuIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuIyB3aW5kb3cuT2JzZXJ2YWJsZSA9IHJlcXVpcmUgJy4vb2JzZXJ2ZS5jb2ZmZWUnXG53aW5kb3cuT2JzZXJ2YWJsZSA9IHJlcXVpcmUgJ29ic2VydmVkJ1xuXG5jbGFzcyBTdG9yYWdlXG4gIGFwaTogY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIGRhdGE6IFxuICAgIGN1cnJlbnRSZXNvdXJjZXM6IFtdXG4gIGNhbGxiYWNrOiAoKSAtPlxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBAb2JzZXJ2ZXIgPSBPYnNlcnZhYmxlIEBkYXRhXG4gICAgQG9ic2VydmVyLm9uICdjaGFuZ2UnLCAoY2hhbmdlKSA9PlxuICAgICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6Y2hhbmdlXG5cbiAgICBATElTVEVOLkV4dCAnZGF0YUNoYW5nZWQnLCAoY2hhbmdlKSA9PlxuICAgICAgQGRhdGEgPz0ge31cbiAgICAgIF9kYXRhID0gQGRhdGFcbiAgICAgICMgc2hvdyAnZGF0YSBjaGFuZ2VkICdcbiAgICAgICMgc2hvdyBjaGFuZ2VcbiAgICAgICMgcmV0dXJuIGlmIEBpc0FycmF5KGNoYW5nZS5vYmplY3QpXG5cbiAgICAgIEBvYnNlcnZlci5zdG9wKClcbiAgICAgICgoZGF0YSkgLT5cbiAgICAgICAgc3RhY2sgPSBjaGFuZ2UucGF0aC5zcGxpdCAnLidcblxuICAgICAgICByZXR1cm4gZGF0YVtzdGFja1swXV0gPSBjaGFuZ2UudmFsdWUgaWYgbm90IGRhdGFbc3RhY2tbMF1dP1xuXG4gICAgICAgIHdoaWxlIHN0YWNrLmxlbmd0aCA+IDEgXG4gICAgICAgICAgX3NoaWZ0ID0gc3RhY2suc2hpZnQoKVxuICAgICAgICAgIGlmIC9eXFxkKyQvLnRlc3QgX3NoaWZ0IHRoZW4gX3NoaWZ0ID0gcGFyc2VJbnQgX3NoaWZ0XG4gICAgICAgICAgZGF0YSA9IGRhdGFbX3NoaWZ0XSBcblxuICAgICAgICBfc2hpZnQgPSBzdGFjay5zaGlmdCgpXG4gICAgICAgIGlmIC9eXFxkKyQvLnRlc3QgX3NoaWZ0IHRoZW4gX3NoaWZ0ID0gcGFyc2VJbnQgX3NoaWZ0XG4gICAgICAgIGRhdGFbX3NoaWZ0XSA9IGNoYW5nZS52YWx1ZVxuICAgICAgKShAZGF0YSlcblxuICAgICAgIyBjaGFuZ2UucGF0aCA9IGNoYW5nZS5wYXRoLnJlcGxhY2UoL1xcLihcXGQrKVxcLi9nLCAnWyQxXS4nKSBpZiBAaXNBcnJheSBjaGFuZ2Uub2JqZWN0XG4gICAgICBcblxuICAgICAgQHNhdmVBbGwoKVxuICAgICAgXG4gICAgICBAb2JzZXJ2ZXIgPSBPYnNlcnZhYmxlIEBkYXRhXG4gICAgICBAb2JzZXJ2ZXIub24gJ2NoYW5nZScsIChjaGFuZ2UpID0+XG4gICAgICAgIEBNU0cuRXh0UG9ydCAnZGF0YUNoYW5nZWQnOmNoYW5nZVxuXG4gICAgIyBAb25DaGFuZ2VkQWxsKClcblxuICBpc0FycmF5OiAtPiBcbiAgICBBcnJheS5pc0FycmF5IHx8ICggdmFsdWUgKSAtPiByZXR1cm4ge30udG9TdHJpbmcuY2FsbCggdmFsdWUgKSBpcyAnW29iamVjdCBBcnJheV0nXG5cblxuICBzYXZlOiAoa2V5LCBpdGVtLCBjYikgLT5cbiAgICBvYmogPSB7fVxuICAgIG9ialtrZXldID0gaXRlbVxuICAgIEBkYXRhW2tleV0gPSBpdGVtXG4gICAgQGFwaS5zZXQgb2JqLCAocmVzKSA9PlxuICAgICAgY2I/KClcbiAgICAgIEBjYWxsYmFjaz8oKVxuXG4gIHNhdmVBbGxBbmRTeW5jOiAoZGF0YSkgLT5cbiAgICBAc2F2ZUFsbCBkYXRhLCAoKSA9PlxuICAgICAgQE1TRy5FeHQgJ3N0b3JhZ2VEYXRhJzpAZGF0YVxuXG4gIHNhdmVBbGw6IChkYXRhLCBjYikgLT5cbiAgICBpZiBkYXRhPyBcbiAgICAgIEBhcGkuc2V0IGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gICAgICAgICMgQGNhbGxiYWNrPygpXG4gICAgZWxzZVxuICAgICAgQGFwaS5zZXQgQGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gICAgICAgICMgQGNhbGxiYWNrPygpXG4gICAgIyBzaG93ICdzYXZlQWxsIEBkYXRhOiAnICsgQGRhdGEuc29ja2V0SWRzP1swXVxuICAgICMgc2hvdyAnc2F2ZUFsbCBkYXRhOiAnICsgZGF0YS5zb2NrZXRJZHM/WzBdXG5cbiAgcmV0cmlldmU6IChrZXksIGNiKSAtPlxuICAgIEBhcGkuZ2V0IGtleSwgKHJlc3VsdHMpIC0+XG4gICAgICBAZGF0YVtyXSA9IHJlc3VsdHNbcl0gZm9yIHIgb2YgcmVzdWx0c1xuICAgICAgaWYgY2I/IHRoZW4gY2IgcmVzdWx0c1trZXldXG5cbiAgcmV0cmlldmVBbGw6IChjYikgLT5cbiAgICBAYXBpLmdldCAocmVzdWx0KSA9PlxuICAgICAgQGRhdGFbY10gPSByZXN1bHRbY10gZm9yIGMgb2YgcmVzdWx0IFxuICAgICAgIyBAY2FsbGJhY2s/IHJlc3VsdFxuICAgICAgY2I/IHJlc3VsdFxuICAgICAgc2hvdyByZXN1bHRcblxuICBvbkNoYW5nZWQ6IChrZXksIGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgaWYgY2hhbmdlc1trZXldPyBhbmQgY2I/IHRoZW4gY2IgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuICBvbkNoYW5nZWRBbGw6ICgpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLG5hbWVzcGFjZSkgPT5cbiAgICAgIGhhc0NoYW5nZXMgPSBmYWxzZVxuICAgICAgZm9yIGMgb2YgY2hhbmdlcyB3aGVuIGNoYW5nZXNbY10ubmV3VmFsdWUgIT0gY2hhbmdlc1tjXS5vbGRWYWx1ZSBhbmQgYyBpc250J3NvY2tldElkcydcbiAgICAgICAgKGMpID0+IFxuICAgICAgICAgIEBkYXRhW2NdID0gY2hhbmdlc1tjXS5uZXdWYWx1ZSBcbiAgICAgICAgICBzaG93ICdkYXRhIGNoYW5nZWQ6ICdcbiAgICAgICAgICBzaG93IGNcbiAgICAgICAgICBzaG93IEBkYXRhW2NdXG5cbiAgICAgICAgICBoYXNDaGFuZ2VzID0gdHJ1ZVxuXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXMgaWYgaGFzQ2hhbmdlc1xuICAgICAgc2hvdyAnY2hhbmdlZCcgaWYgaGFzQ2hhbmdlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE3NDIwOTNcbm1vZHVsZS5leHBvcnRzID0gKCgpIC0+XG4gIG1ldGhvZHMgPSBbXG4gICAgJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJyxcbiAgICAnZXhjZXB0aW9uJywgJ2dyb3VwJywgJ2dyb3VwQ29sbGFwc2VkJywgJ2dyb3VwRW5kJywgJ2luZm8nLCAnbG9nJyxcbiAgICAnbWFya1RpbWVsaW5lJywgJ3Byb2ZpbGUnLCAncHJvZmlsZUVuZCcsICd0YWJsZScsICd0aW1lJywgJ3RpbWVFbmQnLFxuICAgICd0aW1lU3RhbXAnLCAndHJhY2UnLCAnd2FybiddXG4gIG5vb3AgPSAoKSAtPlxuICAgICMgc3R1YiB1bmRlZmluZWQgbWV0aG9kcy5cbiAgICBmb3IgbSBpbiBtZXRob2RzICB3aGVuICAhY29uc29sZVttXVxuICAgICAgY29uc29sZVttXSA9IG5vb3BcblxuICBpZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZD9cbiAgICB3aW5kb3cuc2hvdyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUpXG4gIGVsc2VcbiAgICB3aW5kb3cuc2hvdyA9ICgpIC0+XG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKVxuKSgpXG4iXX0=
