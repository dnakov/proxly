(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Application, Config, FileSystem, Server, Storage, getGlobal, root;

getGlobal = function() {
  var _getGlobal;
  _getGlobal = function() {
    return this;
  };
  return _getGlobal();
};

root = getGlobal();

Application = require('../../common.coffee');

chrome.app.runtime.onLaunched.addListener(function() {
  return chrome.app.window.create('index.html', {
    id: "mainwin",
    bounds: {
      width: 770,
      height: 800
    }
  });
});

Config = require('../../config.coffee');

Storage = require('../../storage.coffee');

FileSystem = require('../../filesystem.coffee');

Server = require('../../server.coffee');

root.app = new Application({
  Storage: new Storage,
  FS: new FileSystem,
  Server: new Server
});

root.app.Server.getLocalFile = app.getLocalFile;

root.app.Storage.retrieveAll();


},{"../../common.coffee":2,"../../config.coffee":3,"../../filesystem.coffee":4,"../../server.coffee":12,"../../storage.coffee":13}],2:[function(require,module,exports){
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


},{"./config.coffee":3,"./filesystem.coffee":4,"./listen.coffee":5,"./msg.coffee":6,"./notification.coffee":11,"./server.coffee":12,"./storage.coffee":13,"./util.coffee":14}],3:[function(require,module,exports){
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


},{}],4:[function(require,module,exports){
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


},{"./config.coffee":3}],6:[function(require,module,exports){
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


},{"./config.coffee":3}],7:[function(require,module,exports){

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


},{}],13:[function(require,module,exports){
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


},{"./listen.coffee":5,"./msg.coffee":6,"observed":8}],14:[function(require,module,exports){
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


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvYXBwL3NyYy9iYWNrZ3JvdW5kLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9jb21tb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L2NvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L25vZGVfbW9kdWxlcy9vYnNlcnZlZC9saWIvY2hhbmdlLmpzIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L25vZGVfbW9kdWxlcy9vYnNlcnZlZC9saWIvb2JzZXJ2ZWQuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm9kZV9tb2R1bGVzL29ic2VydmVkL25vZGVfbW9kdWxlcy9kZWJ1Zy9kZWJ1Zy5qcyIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm90aWZpY2F0aW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9zZXJ2ZXIuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3N0b3JhZ2UuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDRUEsSUFBQSxpRUFBQTs7QUFBQSxTQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxVQUFBO0FBQUEsRUFBQSxVQUFBLEdBQWEsU0FBQSxHQUFBO1dBQ1gsS0FEVztFQUFBLENBQWIsQ0FBQTtTQUdBLFVBQUEsQ0FBQSxFQUpVO0FBQUEsQ0FBWixDQUFBOztBQUFBLElBTUEsR0FBTyxTQUFBLENBQUEsQ0FOUCxDQUFBOztBQUFBLFdBUUEsR0FBYyxPQUFBLENBQVEscUJBQVIsQ0FSZCxDQUFBOztBQUFBLE1BU00sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUE5QixDQUEwQyxTQUFBLEdBQUE7U0FDeEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBbEIsQ0FBeUIsWUFBekIsRUFDTTtBQUFBLElBQUEsRUFBQSxFQUFJLFNBQUo7QUFBQSxJQUNBLE1BQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFNLEdBQU47QUFBQSxNQUNBLE1BQUEsRUFBTyxHQURQO0tBRkY7R0FETixFQUR3QztBQUFBLENBQTFDLENBVEEsQ0FBQTs7QUFBQSxNQXNCQSxHQUFTLE9BQUEsQ0FBUSxxQkFBUixDQXRCVCxDQUFBOztBQUFBLE9BdUJBLEdBQVUsT0FBQSxDQUFRLHNCQUFSLENBdkJWLENBQUE7O0FBQUEsVUF3QkEsR0FBYSxPQUFBLENBQVEseUJBQVIsQ0F4QmIsQ0FBQTs7QUFBQSxNQXlCQSxHQUFTLE9BQUEsQ0FBUSxxQkFBUixDQXpC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NEJNLENBQUMsT0FBUCxHQUFpQixHQTVCakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFJLENBQUMsSUFBeEIsQ0FBNkIsT0FBTyxDQUFDLEdBQXJDLEVBQTBDLE9BQTFDLEVBRGhCO0dBQUEsTUFBQTtXQUdFLE1BQU0sQ0FBQyxJQUFQLEdBQWMsU0FBQSxHQUFBO2FBQ1osUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBekIsQ0FBOEIsT0FBTyxDQUFDLEdBQXRDLEVBQTJDLE9BQTNDLEVBQW9ELFNBQXBELEVBRFk7SUFBQSxFQUhoQjtHQVhnQjtBQUFBLENBQUQsQ0FBQSxDQUFBLENBQWpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMgc2VydmVyID0gcmVxdWlyZSAnLi90Y3Atc2VydmVyLmpzJ1xuXG5nZXRHbG9iYWwgPSAtPlxuICBfZ2V0R2xvYmFsID0gLT5cbiAgICB0aGlzXG5cbiAgX2dldEdsb2JhbCgpXG5cbnJvb3QgPSBnZXRHbG9iYWwoKVxuXG5BcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5jaHJvbWUuYXBwLnJ1bnRpbWUub25MYXVuY2hlZC5hZGRMaXN0ZW5lciAtPlxuICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUgJ2luZGV4Lmh0bWwnLFxuICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgYm91bmRzOlxuICAgICAgICAgIHdpZHRoOjc3MFxuICAgICAgICAgIGhlaWdodDo4MDBcblxuXG4jIENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy5jb2ZmZWUnXG4jIE1TRyA9IHJlcXVpcmUgJy4uLy4uL21zZy5jb2ZmZWUnXG4jIExJU1RFTiA9IHJlcXVpcmUgJy4uLy4uL2xpc3Rlbi5jb2ZmZWUnXG4jIFN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbiMgRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4uLy4uL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnLmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuLi8uLi9maWxlc3lzdGVtLmNvZmZlZSdcblNlcnZlciA9IHJlcXVpcmUgJy4uLy4uL3NlcnZlci5jb2ZmZWUnXG5cbnJvb3QuYXBwID0gbmV3IEFwcGxpY2F0aW9uIFxuICBTdG9yYWdlOiBuZXcgU3RvcmFnZVxuICBGUzogbmV3IEZpbGVTeXN0ZW1cbiAgU2VydmVyOiBuZXcgU2VydmVyXG5cbnJvb3QuYXBwLlNlcnZlci5nZXRMb2NhbEZpbGUgPSBhcHAuZ2V0TG9jYWxGaWxlXG5yb290LmFwcC5TdG9yYWdlLnJldHJpZXZlQWxsKClcbiIsInJlcXVpcmUgJy4vdXRpbC5jb2ZmZWUnXG5Db25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5MSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuTm90aWZpY2F0aW9uID0gcmVxdWlyZSAnLi9ub3RpZmljYXRpb24uY29mZmVlJ1xuU2VydmVyID0gcmVxdWlyZSAnLi9zZXJ2ZXIuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgQ29uZmlnXG4gIExJU1RFTjogbnVsbFxuICBNU0c6IG51bGxcbiAgU3RvcmFnZTogbnVsbFxuICBGUzogbnVsbFxuICBTZXJ2ZXI6IG51bGxcbiAgTm90aWZ5OiBudWxsXG4gIHBsYXRmb3JtOm51bGxcbiAgY3VycmVudFRhYklkOm51bGxcblxuICBjb25zdHJ1Y3RvcjogKGRlcHMpIC0+XG4gICAgc3VwZXJcblxuICAgIEBNU0cgPz0gTVNHLmdldCgpXG4gICAgQExJU1RFTiA/PSBMSVNURU4uZ2V0KClcbiAgICBcbiAgICBmb3IgcHJvcCBvZiBkZXBzXG4gICAgICBpZiB0eXBlb2YgZGVwc1twcm9wXSBpcyBcIm9iamVjdFwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpJbmJvdW5kIGRlcHNbcHJvcF1cbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwiZnVuY3Rpb25cIiBcbiAgICAgICAgQFtwcm9wXSA9IEB3cmFwT2JqT3V0Ym91bmQgbmV3IGRlcHNbcHJvcF1cblxuICAgIEBOb3RpZnkgPz0gKG5ldyBOb3RpZmljYXRpb24pLnNob3cgXG4gICAgIyBAU3RvcmFnZSA/PSBAd3JhcE9iak91dGJvdW5kIG5ldyBTdG9yYWdlIEBkYXRhXG4gICAgIyBARlMgPSBuZXcgRmlsZVN5c3RlbSBcbiAgICAjIEBTZXJ2ZXIgPz0gQHdyYXBPYmpPdXRib3VuZCBuZXcgU2VydmVyXG4gICAgQGRhdGEgPSBAU3RvcmFnZS5kYXRhXG4gICAgXG4gICAgQHdyYXAgPSBpZiBAU0VMRl9UWVBFIGlzICdBUFAnIHRoZW4gQHdyYXBJbmJvdW5kIGVsc2UgQHdyYXBPdXRib3VuZFxuXG4gICAgQG9wZW5BcHAgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ub3BlbkFwcCcsIEBvcGVuQXBwXG4gICAgQGxhdW5jaEFwcCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5sYXVuY2hBcHAnLCBAbGF1bmNoQXBwXG4gICAgQHN0YXJ0U2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnN0YXJ0U2VydmVyJywgQHN0YXJ0U2VydmVyXG4gICAgQHJlc3RhcnRTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ucmVzdGFydFNlcnZlcicsIEByZXN0YXJ0U2VydmVyXG4gICAgQHN0b3BTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uc3RvcFNlcnZlcicsIEBzdG9wU2VydmVyXG4gICAgXG5cbiAgICBAd3JhcCA9IGlmIEBTRUxGX1RZUEUgaXMgJ0VYVEVOU0lPTicgdGhlbiBAd3JhcEluYm91bmQgZWxzZSBAd3JhcE91dGJvdW5kXG5cbiAgICBAZ2V0UmVzb3VyY2VzID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldFJlc291cmNlcycsIEBnZXRSZXNvdXJjZXNcbiAgICBAZ2V0Q3VycmVudFRhYiA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRDdXJyZW50VGFiJywgQGdldEN1cnJlbnRUYWJcblxuICAgIGNocm9tZS5ydW50aW1lLmdldFBsYXRmb3JtSW5mbyAoaW5mbykgPT5cbiAgICAgIEBwbGF0Zm9ybSA9IGluZm9cblxuICAgIEBpbml0KClcblxuICBpbml0OiAoKSAtPlxuICAgIEBkYXRhLnNlcnZlciA9XG4gICAgICBob3N0OlwiMTI3LjAuMC4xXCJcbiAgICAgIHBvcnQ6ODA4OVxuICAgICAgaXNPbjpmYWxzZVxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgbGF1bmNoQXBwOiAoY2IsIGVycm9yKSAtPlxuICAgICAgY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIEBBUFBfSUQsIChleHRJbmZvKSA9PlxuICAgICAgICBpZiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgICBlcnJvciBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNiPyBleHRJbmZvXG5cbiAgb3BlbkFwcDogKCkgPT5cbiAgICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsXG4gICAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgICBib3VuZHM6XG4gICAgICAgICAgd2lkdGg6NzcwXG4gICAgICAgICAgaGVpZ2h0OjgwMCxcbiAgICAgICh3aW4pID0+XG4gICAgICAgIEBhcHBXaW5kb3cgPSB3aW4pIFxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgZ2V0UmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldEN1cnJlbnRUYWIgKHRhYklkKSA9PlxuICAgICAgY2hyb21lLnRhYnMuZXhlY3V0ZVNjcmlwdCB0YWJJZCwgXG4gICAgICAgIGZpbGU6J3NjcmlwdHMvY29udGVudC5qcycsIChyZXN1bHRzKSA9PlxuICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMgPSBbXVxuICAgICAgICAgIGZvciByIGluIHJlc3VsdHNcbiAgICAgICAgICAgIGZvciByZXMgaW4gclxuICAgICAgICAgICAgICBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLnB1c2ggcmVzXG4gICAgICAgICAgY2I/KClcblxuICAjIHVwZGF0ZVJlc291cmNlc0xpc3RlbmVyOiAocmVzb3VyY2VzKSA9PlxuICAjICAgICBzaG93IHJlc291cmNlc1xuICAjICAgICBfcmVzb3VyY2VzID0gW11cblxuICAjICAgICBmb3IgZnJhbWUgaW4gcmVzb3VyY2VzIFxuICAjICAgICAgIGRvIChmcmFtZSkgPT5cbiAgIyAgICAgICAgIGZvciBpdGVtIGluIGZyYW1lIFxuICAjICAgICAgICAgICBkbyAoaXRlbSkgPT5cbiAgIyAgICAgICAgICAgICBfcmVzb3VyY2VzLnB1c2ggaXRlbVxuICAjICAgICBAU3RvcmFnZS5zYXZlICdjdXJyZW50UmVzb3VyY2VzJywgcmVzb3VyY2VzXG4gIGdldExvY2FsRmlsZTogKGluZm8sIGNiLCBlcnIpID0+XG4gICAgdXJsID0gaW5mby51cmlcbiAgICBmaWxlUGF0aCA9IEBnZXRMb2NhbEZpbGVQYXRoIHVybFxuICAgIGZpbGVFbnRyeUlkID0gQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzW2ZpbGVQYXRoXS5maWxlRW50cnlcbiAgICBpZiBmaWxlRW50cnlJZD9cbiAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBmaWxlRW50cnlJZCwgKGZpbGVFbnRyeSkgPT5cbiAgICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgICAgY2I/KGZpbGVFbnRyeSxmaWxlKVxuICAgICAgICAsZXJyXG4gICAgIyBkaXJOYW1lID0gaW5mby51cmlcblxuICAgICMgZGlyTmFtZSA9IGRpck5hbWUubWF0Y2goLyhcXC8uKj9cXC8pfChcXFxcLio/XFxcXCkvKT9bMF0gfHwgJydcbiAgICAjIGRpck5hbWUgPSBkaXJOYW1lLnN1YnN0cmluZyAwLCBkaXJOYW1lLmxlbmd0aCAtIDFcbiAgICAjIHNob3cgJ2xvb2tpbmcgZm9yICcgKyBkaXJOYW1lXG4gICAgIyBfbWFwcyA9IHt9XG4gICAgIyBfbWFwc1tpdGVtLmRpcmVjdG9yeV0gPSBpdGVtLmlzT24gZm9yIGl0ZW0gaW4gQGRhdGEubWFwc1xuXG4gICAgIyBmb3IgaywgZGlyIG9mIEBkYXRhLmRpcmVjdG9yaWVzIHdoZW4gX21hcHNba11cbiAgICAjICAgc2hvdyAnaW4gbG9vcCcgKyBkaXIucmVsUGF0aFxuICAgICMgICBpZiBkaXIucmVsUGF0aCBpcyBkaXJOYW1lIHRoZW4gZm91bmREaXIgPSBkaXJcblxuICAgICMgaWYgZm91bmREaXI/XG4gICAgIyAgIHNob3cgJ2ZvdW5kISAnICsgZm91bmREaXJcbiAgICAjICAgQEZTLmdldExvY2FsRmlsZSBmb3VuZERpciwgZmlsZVBhdGgsIGNiLCBlcnJcbiAgICAjIGVsc2VcbiAgICAjICAgc2hvdyAnZHVubm8sIG5vdCBmb3VuZCdcbiAgICAjICAgZXJyKClcblxuICBzdGFydFNlcnZlcjogKGNiLCBlcnIpIC0+XG4gICAgICBpZiBAU2VydmVyLnN0b3BwZWQgaXMgdHJ1ZVxuICAgICAgICAgIEBTZXJ2ZXIuc3RhcnQgQGRhdGEuc2VydmVyLmhvc3QsQGRhdGEuc2VydmVyLnBvcnQsbnVsbCwgKHNvY2tldEluZm8pID0+XG4gICAgICAgICAgICAgIEBkYXRhLnNlcnZlci51cmwgPSAnaHR0cDovLycgKyBAZGF0YS5zZXJ2ZXIuaG9zdCArICc6JyArIEBkYXRhLnNlcnZlci5wb3J0ICsgJy8nXG4gICAgICAgICAgICAgIEBkYXRhLnNlcnZlci5pc09uID0gdHJ1ZVxuICAgICAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIFN0YXJ0ZWRcIiwgXCJTdGFydGVkIFNlcnZlciBodHRwOi8vI3sgQGRhdGEuc2VydmVyLmhvc3QgfToje0BkYXRhLnNlcnZlci5wb3J0fVwiXG4gICAgICAgICAgICAgIGNiPygpXG4gICAgICAgICAgLChlcnJvcikgPT5cbiAgICAgICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBFcnJvclwiLFwiRXJyb3IgU3RhcnRpbmcgU2VydmVyOiAjeyBlcnJvciB9XCJcbiAgICAgICAgICAgICAgQGRhdGEuc2VydmVyLnVybCA9ICdodHRwOi8vJyArIEBkYXRhLnNlcnZlci5ob3N0ICsgJzonICsgQGRhdGEuc2VydmVyLnBvcnQgKyAnLydcbiAgICAgICAgICAgICAgQGRhdGEuc2VydmVyLmlzT24gPSB0cnVlXG4gICAgICAgICAgICAgIGVycj8oKVxuXG4gIHN0b3BTZXJ2ZXI6IChjYiwgZXJyKSAtPlxuICAgICAgQFNlcnZlci5zdG9wIChzdWNjZXNzKSA9PlxuICAgICAgICAgIEBOb3RpZnkgJ1NlcnZlciBTdG9wcGVkJywgXCJTZXJ2ZXIgU3RvcHBlZFwiXG4gICAgICAgICAgQGRhdGEuc2VydmVyLnVybCA9ICcnXG4gICAgICAgICAgQGRhdGEuc2VydmVyLmlzT24gPSBmYWxzZVxuICAgICAgICAgIGNiPygpXG4gICAgICAsKGVycm9yKSA9PlxuICAgICAgICAgIGVycj8oKVxuICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIlNlcnZlciBjb3VsZCBub3QgYmUgc3RvcHBlZDogI3sgZXJyb3IgfVwiXG5cbiAgcmVzdGFydFNlcnZlcjogLT5cbiAgICBAc3RvcFNlcnZlciAoKSA9PlxuICAgICAgQHN0YXJ0U2VydmVyKClcblxuICBjaGFuZ2VQb3J0OiA9PlxuXG4gIGdldExvY2FsRmlsZVBhdGg6ICh1cmwpIC0+XG4gICAgZmlsZVBhdGhSZWdleCA9IC9eKChodHRwW3NdP3xmdHB8Y2hyb21lLWV4dGVuc2lvbnxmaWxlKTpcXC9cXC8pP1xcLz8oW15cXC9cXC5dK1xcLikqPyhbXlxcL1xcLl0rXFwuW146XFwvXFxzXFwuXXsyLDN9KFxcLlteOlxcL1xcc1xcLl3igIzigIt7MiwzfSk/KSg6XFxkKyk/KCR8XFwvKShbXiM/XFxzXSspPyguKj8pPygjW1xcd1xcLV0rKT8kL1xuXG4gICAgQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzID89IHt9XG4gICAgXG4gICAgcmV0dXJuIHt9IHVubGVzcyBAZGF0YS5tYXBzPyBhbmQgQGRhdGEuZGlyZWN0b3JpZXM/XG5cbiAgICByZXNQYXRoID0gdXJsLm1hdGNoKGZpbGVQYXRoUmVnZXgpP1s4XVxuXG4gICAgcmV0dXJuIHt9IHVubGVzcyByZXNQYXRoP1xuICAgIFxuICAgIGZvciBtYXAgaW4gQGRhdGEubWFwc1xuICAgICAgcmVzUGF0aCA9IHVybC5tYXRjaChuZXcgUmVnRXhwKG1hcC51cmwpKT8gYW5kIG1hcC51cmw/XG5cbiAgICAgIGlmIHJlc1BhdGhcbiAgICAgICAgaWYgcmVmZXJlcj9cbiAgICAgICAgICAjIFRPRE86IHRoaXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXAudXJsKSwgbWFwLnJlZ2V4UmVwbFxuICAgICAgICBicmVha1xuICAgIHJldHVybiBmaWxlUGF0aFxuXG4gIGZpbmRMb2NhbEZpbGVQYXRoRm9yVVJMOiAodXJsLCBjYikgLT5cbiAgICBmaWxlUGF0aCA9IEBnZXRMb2NhbEZpbGVQYXRoIHVybFxuICAgIHJldHVybiB1bmxlc3MgZmlsZVBhdGg/XG4gICAgQGZpbmRGaWxlSW5EaXJlY3RvcmllcyBAZGF0YS5kaXJlY3RvcmllcywgZmlsZVBhdGgsIChmaWxlRW50cnksIGRpcmVjdG9yeSkgPT5cbiAgICAjIHJldHVybiByZWRpcmVjdFVybDogQHByZWZpeCArIGZpbGVQYXRoXG4gICAgICBkZWxldGUgZmlsZUVudHJ5LmVudHJ5XG4gICAgICBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdID0gXG4gICAgICAgIGZpbGVFbnRyeTogY2hyb21lLmZpbGVTeXN0ZW0ucmV0YWluRW50cnkgZmlsZUVudHJ5XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aFxuICAgICAgICBkaXJlY3Rvcnk6IGRpcmVjdG9yeVxuICAgICAgY2I/KEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlc1tmaWxlUGF0aF0sIGRpcmVjdG9yeSlcbiAgICAsKGVycikgPT5cbiAgICAgIHNob3cgJ25vIGZpbGVzIGZvdW5kIGZvciAnICsgZmlsZVBhdGhcblxuXG4gIGZpbmRGaWxlSW5EaXJlY3RvcmllczogKGRpcmVjdG9yaWVzLCBwYXRoLCBjYiwgZXJyKSAtPlxuICAgIGFsbERpcnMgPSBkaXJlY3Rvcmllcy5zbGljZSgpIHVubGVzcyBhbGxEaXJzP1xuICAgIGVycigpIGlmIGRpcmVjdG9yaWVzIGlzIHVuZGVmaW5lZCBvciBwYXRoIGlzIHVuZGVmaW5lZFxuICAgIF9kaXJzID0gYWxsRGlycy5zbGljZSgpXG4gICAgX3BhdGggPSBwYXRoXG4gICAgZGlyID0gX2RpcnMuc2hpZnQoKVxuICAgIF9wYXRoLnJlcGxhY2UoLy4qP1xcLy8sICcnKSBpZiBkaXIgaXMgdW5kZWZpbmVkXG4gICAgaWYgX3BhdGgubWF0Y2goLy4qP1xcLy8pPyAjc3RpbGwgZGlyZWN0b3J5XG4gICAgICAjIGRpciA9IF9kaXJzLnNoaWZ0KClcbiAgICAgIGlmIGRpciBpcyB1bmRlZmluZWRcbiAgICAgICAgX2RpcnMgPSBhbGxEaXJzLnNsaWNlKCkgXG4gICAgICAgIGRpciA9IF9kaXJzLnNoaWZ0KCkgXG5cbiAgICAgIEBGUy5nZXRMb2NhbEZpbGVFbnRyeSBkaXIsIF9wYXRoLCBcbiAgICAgICAgKGZpbGVFbnRyeSkgPT5cbiAgICAgICAgICBjYj8gZmlsZUVudHJ5LCBkaXJcbiAgICAgICAgLChlcnJvcikgPT5cbiAgICAgICAgICBAZmluZEZpbGVJbkRpcmVjdG9yaWVzIF9kaXJzLCBfcGF0aCwgY2IsIGVyciAgXG4gICAgZWxzZVxuICAgICAgQEZTLmdldExvY2FsRmlsZUVudHJ5IGRpciwgX3BhdGgsIFxuICAgICAgICAoZmlsZUVudHJ5KSA9PlxuICAgICAgICAgIGNiPyBmaWxlRW50cnksIGRpclxuICAgICAgICAsZXJyXG4gIFxuICBtYXBBbGxSZXNvdXJjZXM6IChjYikgLT5cbiAgICBAZ2V0UmVzb3VyY2VzID0+XG4gICAgICBmb3IgaXRlbSBpbiBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG4gICAgICAgIEBmaW5kTG9jYWxGaWxlUGF0aEZvclVSTCBpdGVtLnVybCwgPT5cbiAgICAgICAgICBjYj8oKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb25cblxuXG4iLCJjbGFzcyBDb25maWdcbiAgIyBBUFBfSUQ6ICdjZWNpZmFmcGhlZ2hvZnBmZGtoZWtraWJjaWJoZ2ZlYydcbiAgIyBFWFRFTlNJT05fSUQ6ICdkZGRpbWJuamliamNhZmJva25iZ2hlaGJmYWpnZ2dlcCdcbiAgQVBQX0lEOiAnZGVuZWZkb29mbmtnam1wYmZwa25paHBnZGhhaHBibGgnXG4gIEVYVEVOU0lPTl9JRDogJ2lqY2ptcGVqb25taW1vb2ZiY3BhbGllamhpa2Flb21oJyAgXG4gIFNFTEZfSUQ6IGNocm9tZS5ydW50aW1lLmlkXG4gIGlzQ29udGVudFNjcmlwdDogbG9jYXRpb24ucHJvdG9jb2wgaXNudCAnY2hyb21lLWV4dGVuc2lvbjonXG4gIEVYVF9JRDogbnVsbFxuICBFWFRfVFlQRTogbnVsbFxuICBcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQEVYVF9JRCA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiBARVhURU5TSU9OX0lEIGVsc2UgQEFQUF9JRFxuICAgIEBFWFRfVFlQRSA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG4gICAgQFNFTEZfVFlQRSA9IGlmIEBBUFBfSUQgaXNudCBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcblxuICB3cmFwSW5ib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgICBfa2xhcyA9IG9ialxuICAgICAgQExJU1RFTi5FeHQgZm5hbWUsIChjYWxsYmFjaykgLT5cbiAgICAgICAgX2NhbGxiYWNrID0gY2FsbGJhY2tcbiAgICAgICAgX2FyZ3VtZW50cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICAgICAgYXJncyA9IFtdXG4gICAgICAgIGlmIF9hcmd1bWVudHMubGVuZ3RoIGlzIDAgb3Igbm90IF9hcmd1bWVudHNbMF0/XG4gICAgICAgICAgYXJncy5wdXNoIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFyZ3MgPSBfYXJndW1lbnRzXG4gICAgICAgICMgX2FyZ3MgPSBhcmdzWzBdPy5wdXNoKGFyZ3NbMV0pXG4gICAgICAgIGYuYXBwbHkgX2tsYXMsIGFyZ3NcblxuICB3cmFwT2JqSW5ib3VuZDogKG9iaikgLT5cbiAgICAob2JqW2tleV0gPSBAd3JhcEluYm91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG4gIHdyYXBPdXRib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgLT5cbiAgICAgIG1zZyA9IHt9XG4gICAgICBfYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuXG4gICAgICBpZiBfYXJncy5sZW5ndGggaXMgMFxuICAgICAgICBtc2dbZm5hbWVdID0gbnVsbCBcbiAgICAgICAgcmV0dXJuIEBNU0cuRXh0IG1zZ1xuXG4gICAgICBtc2dbZm5hbWVdID0gX2FyZ3NcblxuICAgICAgY2FsbGJhY2sgPSBtc2dbZm5hbWVdLnBvcCgpXG4gICAgICBpZiB0eXBlb2YgY2FsbGJhY2sgaXNudCBcImZ1bmN0aW9uXCJcbiAgICAgICAgbXNnW2ZuYW1lXS5wdXNoIGNhbGxiYWNrXG4gICAgICAgIEBNU0cuRXh0IG1zZ1xuICAgICAgZWxzZVxuICAgICAgICBATVNHLkV4dCBtc2csIGNhbGxiYWNrIFxuXG4gIHdyYXBPYmpPdXRib3VuZDogKG9iaikgLT5cbiAgICAob2JqW2tleV0gPSBAd3JhcE91dGJvdW5kIG9iaiwgb2JqLmNvbnN0cnVjdG9yLm5hbWUgKyAnLicgKyBrZXksIG9ialtrZXldKSBmb3Iga2V5IG9mIG9iaiB3aGVuIHR5cGVvZiBvYmpba2V5XSBpcyBcImZ1bmN0aW9uXCJcbiAgICBvYmpcblxubW9kdWxlLmV4cG9ydHMgPSBDb25maWciLCJMSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5cbmNsYXNzIEZpbGVTeXN0ZW1cbiAgYXBpOiBjaHJvbWUuZmlsZVN5c3RlbVxuICByZXRhaW5lZERpcnM6IHt9XG4gIExJU1RFTjogTElTVEVOLmdldCgpIFxuICBNU0c6IE1TRy5nZXQoKVxuICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuICAjIEBkaXJzOiBuZXcgRGlyZWN0b3J5U3RvcmVcbiAgIyBmaWxlVG9BcnJheUJ1ZmZlcjogKGJsb2IsIG9ubG9hZCwgb25lcnJvcikgLT5cbiAgIyAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgIyAgIHJlYWRlci5vbmxvYWQgPSBvbmxvYWRcblxuICAjICAgcmVhZGVyLm9uZXJyb3IgPSBvbmVycm9yXG5cbiAgIyAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBibG9iXG5cbiAgcmVhZEZpbGU6IChkaXJFbnRyeSwgcGF0aCwgc3VjY2VzcywgZXJyb3IpIC0+XG4gICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgcGF0aCxcbiAgICAgIChmaWxlRW50cnkpID0+XG4gICAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICAgIHN1Y2Nlc3M/KGZpbGVFbnRyeSwgZmlsZSlcbiAgICAgICAgLChlcnIpID0+IGVycm9yPyBlcnJcbiAgICAgICwoZXJyKSA9PiBlcnJvcj8gZXJyXG5cbiAgZ2V0RmlsZUVudHJ5OiAoZGlyRW50cnksIHBhdGgsIHN1Y2Nlc3MsIGVycm9yKSAtPlxuICAgIGlmIGRpckVudHJ5Py5nZXRGaWxlP1xuICAgICAgZGlyRW50cnkuZ2V0RmlsZSBwYXRoLCB7fSwgKGZpbGVFbnRyeSkgLT5cbiAgICAgICAgc3VjY2Vzcz8gZmlsZUVudHJ5XG4gICAgICAsKGVycikgPT4gZXJyb3I/IGVyclxuICAgIGVsc2UgZXJyb3I/KClcblxuICAjIG9wZW5EaXJlY3Rvcnk6IChjYWxsYmFjaykgLT5cbiAgb3BlbkRpcmVjdG9yeTogKGRpcmVjdG9yeUVudHJ5LCBjYWxsYmFjaykgLT5cbiAgIyBAYXBpLmNob29zZUVudHJ5IHR5cGU6J29wZW5EaXJlY3RvcnknLCAoZGlyZWN0b3J5RW50cnksIGZpbGVzKSA9PlxuICAgIEBhcGkuZ2V0RGlzcGxheVBhdGggZGlyZWN0b3J5RW50cnksIChwYXRoTmFtZSkgPT5cbiAgICAgIGRpciA9XG4gICAgICAgICAgcmVsUGF0aDogZGlyZWN0b3J5RW50cnkuZnVsbFBhdGggIy5yZXBsYWNlKCcvJyArIGRpcmVjdG9yeUVudHJ5Lm5hbWUsICcnKVxuICAgICAgICAgIGRpcmVjdG9yeUVudHJ5SWQ6IEBhcGkucmV0YWluRW50cnkoZGlyZWN0b3J5RW50cnkpXG4gICAgICAgICAgZW50cnk6IGRpcmVjdG9yeUVudHJ5XG5cbiAgICAgICAgY2FsbGJhY2sgcGF0aE5hbWUsIGRpclxuICAgICAgICAgICMgQGdldE9uZURpckxpc3QgZGlyXG4gICAgICAgICAgIyBTdG9yYWdlLnNhdmUgJ2RpcmVjdG9yaWVzJywgQHNjb3BlLmRpcmVjdG9yaWVzIChyZXN1bHQpIC0+XG5cbiAgZ2V0TG9jYWxGaWxlRW50cnk6IChkaXIsIGZpbGVQYXRoLCBjYiwgZXJyb3IpID0+IFxuICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICAgICAoZmlsZUVudHJ5KSA9PlxuICAgICAgICBjYj8oZmlsZUVudHJ5KVxuICAgICAgLGVycm9yXG5cbiAgZ2V0TG9jYWxGaWxlOiAoZGlyLCBmaWxlUGF0aCwgY2IsIGVycm9yKSA9PiBcbiAgIyBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgIyAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiAgIyAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICAgICAsKF9lcnJvcikgPT4gZXJyb3IoX2Vycm9yKVxuICAjIGVsc2VcbiAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgICAgICMgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0gPSBkaXJFbnRyeVxuICAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAgICAgICAgICwoX2Vycm9yKSA9PiBlcnJvcj8oX2Vycm9yKVxuICAgICAgLChfZXJyb3IpID0+IGVycm9yPyhfZXJyb3IpXG5cbiAgICAgICMgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIHN1Y2Nlc3MsXG4gICAgICAjICAgICAoZXJyKSA9PlxuICAgICAgIyAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggaW5mbywgc3VjY2VzcywgZXJyb3JcblxuICBmaW5kRmlsZUZvclBhdGg6IChpbmZvLCBzdWNjZXNzLCBlcnJvcikgPT5cbiAgICAgIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBzdWNjZXNzLCBlcnJvciwgaW5mby5yZWZlcmVyXG5cbiAgZmluZEZpbGVGb3JRdWVyeVN0cmluZzogKF91cmwsIGNiLCBlcnJvciwgcmVmZXJlcikgPT5cbiAgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudChfdXJsKS5yZXBsYWNlIC8uKj9zbHJlZGlyXFw9LywgJydcblxuICAgICAgbWF0Y2ggPSBpdGVtIGZvciBpdGVtIGluIEBtYXBzIHdoZW4gdXJsLm1hdGNoKG5ldyBSZWdFeHAoaXRlbS51cmwpKT8gYW5kIGl0ZW0udXJsPyBhbmQgbm90IG1hdGNoP1xuXG4gICAgICBpZiBtYXRjaD9cbiAgICAgICAgICBpZiByZWZlcmVyP1xuICAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5tYXRjaCgvLipcXC9cXC8uKj9cXC8oLiopLyk/WzFdXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWF0Y2gudXJsKSwgbWF0Y2gucmVnZXhSZXBsXG5cbiAgICAgICAgICBmaWxlUGF0aC5yZXBsYWNlICcvJywgJ1xcXFwnIGlmIHBsYXRmb3JtIGlzICd3aW4nXG5cbiAgICAgICAgICBkaXIgPSBAU3RvcmFnZS5kYXRhLmRpcmVjdG9yaWVzW21hdGNoLmRpcmVjdG9yeV1cblxuICAgICAgICAgIGlmIG5vdCBkaXI/IHRoZW4gcmV0dXJuIGVyciAnbm8gbWF0Y2gnXG5cbiAgICAgICAgICBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgICAgICAgICAgICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICAgICAgICAgICAgICBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICAgICAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICAgICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAgICAgZWxzZVxuICAgICAgICAgIGVycm9yKClcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlU3lzdGVtIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBMSVNURU4gZXh0ZW5kcyBDb25maWdcbiAgbG9jYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGV4dGVybmFsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWxcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGluc3RhbmNlID0gbnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIFxuICAgIGNocm9tZS5ydW50aW1lLm9uQ29ubmVjdEV4dGVybmFsLmFkZExpc3RlbmVyIChwb3J0KSA9PlxuICAgICAgcG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gICAgQGxvY2FsLmFwaS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZVxuICAgIEBleHRlcm5hbC5hcGk/LmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICBAZ2V0OiAoKSAtPlxuICAgIGluc3RhbmNlID89IG5ldyBMSVNURU5cblxuICBMb2NhbDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgIEBsb2NhbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIEV4dDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgIHNob3cgJ2FkZGluZyBleHQgbGlzdGVuZXIgZm9yICcgKyBtZXNzYWdlXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgX29uTWVzc2FnZUV4dGVybmFsOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgcmVzcG9uc2VTdGF0dXMgPSBjYWxsZWQ6ZmFsc2VcbiAgICBfc2VuZFJlc3BvbnNlID0gLT5cbiAgICAgIHRyeVxuICAgICAgICBzaG93ICdjYWxsaW5nIHNlbmRyZXNwb25zZSdcbiAgICAgICAgc2VuZFJlc3BvbnNlLmFwcGx5IG51bGwsYXJndW1lbnRzXG4gICAgICBjYXRjaCBlXG4gICAgICAgIHVuZGVmaW5lZCAjIGVycm9yIGJlY2F1c2Ugbm8gcmVzcG9uc2Ugd2FzIHJlcXVlc3RlZCBmcm9tIHRoZSBNU0csIGRvbid0IGNhcmVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcbiAgICAgIFxuICAgIChzaG93IFwiPD09IEdPVCBFWFRFUk5BTCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgaWYgc2VuZGVyLmlkIGlzbnQgQEVYVF9JRCBhbmQgc2VuZGVyLmNvbnN0cnVjdG9yLm5hbWUgaXNudCAnUG9ydCdcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG4gICAgXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCAjIGZvciBzeW5jaHJvbm91cyBzZW5kUmVzcG9uc2VcbiAgICAgICMgc2hvdyAncmV0dXJuaW5nIHRydWUnXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gIF9vbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuICAgIF9zZW5kUmVzcG9uc2UgPSA9PlxuICAgICAgdHJ5XG4gICAgICAgIHNob3cgJ2NhbGxpbmcgc2VuZHJlc3BvbnNlJ1xuICAgICAgICBzZW5kUmVzcG9uc2UuYXBwbHkgdGhpcyxhcmd1bWVudHNcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgc2hvdyBlXG4gICAgICByZXNwb25zZVN0YXR1cy5jYWxsZWQgPSB0cnVlXG5cbiAgICAoc2hvdyBcIjw9PSBHT1QgTUVTU0FHRSA9PSAjeyBARVhUX1RZUEUgfSA9PVwiICsgX2tleSkgZm9yIF9rZXkgb2YgcmVxdWVzdFxuICAgIEBsb2NhbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBfc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZFxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gTElTVEVOIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBNU0cgZXh0ZW5kcyBDb25maWdcbiAgaW5zdGFuY2UgPSBudWxsXG4gIHBvcnQ6bnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IE1TR1xuXG4gIEBjcmVhdGVQb3J0OiAoKSAtPlxuXG5cbiAgTG9jYWw6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIChzaG93IFwiPT0gTUVTU0FHRSAjeyBfa2V5IH0gPT0+XCIpIGZvciBfa2V5IG9mIG1lc3NhZ2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBtZXNzYWdlLCByZXNwb25kXG4gIEV4dDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFIEVYVEVSTkFMICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIEBFWFRfSUQsIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0UG9ydDogKG1lc3NhZ2UpIC0+XG4gICAgdHJ5XG4gICAgICBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG4gICAgY2F0Y2hcbiAgICAgIEBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuICAgICAgQHBvcnQucG9zdE1lc3NhZ2UgbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1TRyIsIlxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQ2hhbmdlO1xuXG4vKiFcbiAqIENoYW5nZSBvYmplY3QgY29uc3RydWN0b3JcbiAqXG4gKiBUaGUgYGNoYW5nZWAgb2JqZWN0IHBhc3NlZCB0byBPYmplY3Qub2JzZXJ2ZSBjYWxsYmFja3NcbiAqIGlzIGltbXV0YWJsZSBzbyB3ZSBjcmVhdGUgYSBuZXcgb25lIHRvIG1vZGlmeS5cbiAqL1xuXG5mdW5jdGlvbiBDaGFuZ2UgKHBhdGgsIGNoYW5nZSkge1xuICB0aGlzLnBhdGggPSBwYXRoO1xuICB0aGlzLm5hbWUgPSBjaGFuZ2UubmFtZTtcbiAgdGhpcy50eXBlID0gY2hhbmdlLnR5cGU7XG4gIHRoaXMub2JqZWN0ID0gY2hhbmdlLm9iamVjdDtcbiAgdGhpcy52YWx1ZSA9IGNoYW5nZS5vYmplY3RbY2hhbmdlLm5hbWVdO1xuICB0aGlzLm9sZFZhbHVlID0gY2hhbmdlLm9sZFZhbHVlO1xufVxuXG4iLCIvLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255Om9ic2VydmVcblxudmFyIENoYW5nZSA9IHJlcXVpcmUoJy4vY2hhbmdlJyk7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ29ic2VydmVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IE9ic2VydmFibGU7XG5cbi8qKlxuICogT2JzZXJ2YWJsZSBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBUaGUgcGFzc2VkIGBzdWJqZWN0YCB3aWxsIGJlIG9ic2VydmVkIGZvciBjaGFuZ2VzIHRvXG4gKiBhbGwgcHJvcGVydGllcywgaW5jbHVkZWQgbmVzdGVkIG9iamVjdHMgYW5kIGFycmF5cy5cbiAqXG4gKiBBbiBgRXZlbnRFbWl0dGVyYCB3aWxsIGJlIHJldHVybmVkLiBUaGlzIGVtaXR0ZXIgd2lsbFxuICogZW1pdCB0aGUgZm9sbG93aW5nIGV2ZW50czpcbiAqXG4gKiAtIGFkZFxuICogLSB1cGRhdGVcbiAqIC0gZGVsZXRlXG4gKiAtIHJlY29uZmlndXJlXG4gKlxuICogLy8gLSBzZXRQcm90b3R5cGU/XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHN1YmplY3RcbiAqIEBwYXJhbSB7T2JzZXJ2YWJsZX0gW3BhcmVudF0gKGludGVybmFsIHVzZSlcbiAqIEBwYXJhbSB7U3RyaW5nfSBbcHJlZml4XSAoaW50ZXJuYWwgdXNlKVxuICogQHJldHVybiB7RXZlbnRFbWl0dGVyfVxuICovXG5cbmZ1bmN0aW9uIE9ic2VydmFibGUgKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KSB7XG4gIGlmICgnb2JqZWN0JyAhPSB0eXBlb2Ygc3ViamVjdClcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvYmplY3QgZXhwZWN0ZWQuIGdvdDogJyArIHR5cGVvZiBzdWJqZWN0KTtcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgT2JzZXJ2YWJsZSkpXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KTtcblxuICBkZWJ1ZygnbmV3Jywgc3ViamVjdCwgISFwYXJlbnQsIHByZWZpeCk7XG5cbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9iaW5kKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KTtcbn07XG5cbi8vIGFkZCBlbWl0dGVyIGNhcGFiaWxpdGllc1xuZm9yICh2YXIgaSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICBPYnNlcnZhYmxlLnByb3RvdHlwZVtpXSA9IEVtaXR0ZXIucHJvdG90eXBlW2ldO1xufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5vYnNlcnZlcnMgPSB1bmRlZmluZWQ7XG5PYnNlcnZhYmxlLnByb3RvdHlwZS5vbmNoYW5nZSA9IHVuZGVmaW5lZDtcbk9ic2VydmFibGUucHJvdG90eXBlLnN1YmplY3QgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogQmluZHMgdGhpcyBPYnNlcnZhYmxlIHRvIGBzdWJqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc3ViamVjdFxuICogQHBhcmFtIHtPYnNlcnZhYmxlfSBbcGFyZW50XVxuICogQHBhcmFtIHtTdHJpbmd9IFtwcmVmaXhdXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5fYmluZCA9IGZ1bmN0aW9uIChzdWJqZWN0LCBwYXJlbnQsIHByZWZpeCkge1xuICBpZiAodGhpcy5zdWJqZWN0KSB0aHJvdyBuZXcgRXJyb3IoJ2FscmVhZHkgYm91bmQhJyk7XG4gIGlmIChudWxsID09IHN1YmplY3QpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N1YmplY3QgY2Fubm90IGJlIG51bGwnKTtcblxuICBkZWJ1ZygnX2JpbmQnLCBzdWJqZWN0KTtcblxuICB0aGlzLnN1YmplY3QgPSBzdWJqZWN0O1xuXG4gIGlmIChwYXJlbnQpIHtcbiAgICBwYXJlbnQub2JzZXJ2ZXJzLnB1c2godGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5vYnNlcnZlcnMgPSBbdGhpc107XG4gIH1cblxuICB0aGlzLm9uY2hhbmdlID0gb25jaGFuZ2UocGFyZW50IHx8IHRoaXMsIHByZWZpeCk7XG4gIE9iamVjdC5vYnNlcnZlKHRoaXMuc3ViamVjdCwgdGhpcy5vbmNoYW5nZSk7XG5cbiAgdGhpcy5fd2FsayhwYXJlbnQgfHwgdGhpcywgcHJlZml4KTtcbn1cblxuLyoqXG4gKiBQZW5kaW5nIGNoYW5nZSBldmVudHMgYXJlIG5vdCBlbWl0dGVkIHVudGlsIGFmdGVyIHRoZSBuZXh0XG4gKiB0dXJuIG9mIHRoZSBldmVudCBsb29wLiBUaGlzIG1ldGhvZCBmb3JjZXMgdGhlIGVuZ2luZXMgaGFuZFxuICogYW5kIHRyaWdnZXJzIGFsbCBldmVudHMgbm93LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuZGVsaXZlckNoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XG4gIGRlYnVnKCdkZWxpdmVyQ2hhbmdlcycpXG4gIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goZnVuY3Rpb24obykge1xuICAgIE9iamVjdC5kZWxpdmVyQ2hhbmdlUmVjb3JkcyhvLm9uY2hhbmdlKTtcbiAgfSk7XG59XG5cbi8qKlxuICogV2FsayBkb3duIHRocm91Z2ggdGhlIHRyZWUgb2Ygb3VyIGBzdWJqZWN0YCwgb2JzZXJ2aW5nXG4gKiBvYmplY3RzIGFsb25nIHRoZSB3YXkuXG4gKlxuICogQHBhcmFtIHtPYnNlcnZhYmxlfSBbcGFyZW50XVxuICogQHBhcmFtIHtTdHJpbmd9IFtwcmVmaXhdXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5fd2FsayA9IGZ1bmN0aW9uIChwYXJlbnQsIHByZWZpeCkge1xuICBkZWJ1ZygnX3dhbGsnKTtcblxuICB2YXIgb2JqZWN0ID0gdGhpcy5zdWJqZWN0O1xuXG4gIC8vIGtleXM/XG4gIE9iamVjdC5rZXlzKG9iamVjdCkuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtuYW1lXTtcblxuICAgIGlmICgnb2JqZWN0JyAhPSB0eXBlb2YgdmFsdWUpIHJldHVybjtcbiAgICBpZiAobnVsbCA9PSB2YWx1ZSkgcmV0dXJuO1xuXG4gICAgdmFyIHBhdGggPSBwcmVmaXhcbiAgICAgID8gcHJlZml4ICsgJy4nICsgbmFtZVxuICAgICAgOiBuYW1lO1xuXG4gICAgbmV3IE9ic2VydmFibGUodmFsdWUsIHBhcmVudCwgcGF0aCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFN0b3AgbGlzdGVuaW5nIHRvIGFsbCBib3VuZCBvYmplY3RzXG4gKi9cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgZGVidWcoJ3N0b3AnKTtcblxuICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uIChvYnNlcnZlcikge1xuICAgIE9iamVjdC51bm9ic2VydmUob2JzZXJ2ZXIuc3ViamVjdCwgb2JzZXJ2ZXIub25jaGFuZ2UpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTdG9wIGxpc3RlbmluZyB0byBjaGFuZ2VzIG9uIGBzdWJqZWN0YFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdWJqZWN0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5fcmVtb3ZlID0gZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgZGVidWcoJ19yZW1vdmUnLCBzdWJqZWN0KTtcblxuICB0aGlzLm9ic2VydmVycyA9IHRoaXMub2JzZXJ2ZXJzLmZpbHRlcihmdW5jdGlvbiAob2JzZXJ2ZXIpIHtcbiAgICBpZiAoc3ViamVjdCA9PSBvYnNlcnZlci5zdWJqZWN0KSB7XG4gICAgICBPYmplY3QudW5vYnNlcnZlKG9ic2VydmVyLnN1YmplY3QsIG9ic2VydmVyLm9uY2hhbmdlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG5cbi8qIVxuICogQ3JlYXRlcyBhbiBPYmplY3Qub2JzZXJ2ZSBgb25jaGFuZ2VgIGxpc3RlbmVyXG4gKi9cblxuZnVuY3Rpb24gb25jaGFuZ2UgKHBhcmVudCwgcHJlZml4KSB7XG4gIHJldHVybiBmdW5jdGlvbiAoYXJ5KSB7XG4gICAgZGVidWcoJ29uY2hhbmdlJywgcHJlZml4KTtcblxuICAgIGFyeS5mb3JFYWNoKGZ1bmN0aW9uIChjaGFuZ2UpIHtcbiAgICAgIHZhciBvYmplY3QgPSBjaGFuZ2Uub2JqZWN0O1xuICAgICAgdmFyIHR5cGUgPSBjaGFuZ2UudHlwZTtcbiAgICAgIHZhciBuYW1lID0gY2hhbmdlLm5hbWU7XG4gICAgICB2YXIgdmFsdWUgPSBvYmplY3RbbmFtZV07XG5cbiAgICAgIHZhciBwYXRoID0gcHJlZml4XG4gICAgICAgID8gcHJlZml4ICsgJy4nICsgbmFtZVxuICAgICAgICA6IG5hbWVcblxuICAgICAgaWYgKCdhZGQnID09IHR5cGUgJiYgbnVsbCAhPSB2YWx1ZSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgbmV3IE9ic2VydmFibGUodmFsdWUsIHBhcmVudCwgcGF0aCk7XG4gICAgICB9IGVsc2UgaWYgKCdkZWxldGUnID09IHR5cGUgJiYgJ29iamVjdCcgPT0gdHlwZW9mIGNoYW5nZS5vbGRWYWx1ZSkge1xuICAgICAgICBwYXJlbnQuX3JlbW92ZShjaGFuZ2Uub2xkVmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBjaGFuZ2UgPSBuZXcgQ2hhbmdlKHBhdGgsIGNoYW5nZSk7XG4gICAgICBwYXJlbnQuZW1pdCh0eXBlLCBjaGFuZ2UpO1xuICAgICAgcGFyZW50LmVtaXQodHlwZSArICcgJyArIHBhdGgsIGNoYW5nZSk7XG4gICAgICBwYXJlbnQuZW1pdCgnY2hhbmdlJywgY2hhbmdlKTtcbiAgICB9KVxuICB9XG59XG5cbiIsIlxuLyoqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJ1ZztcblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1R5cGV9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlYnVnKG5hbWUpIHtcbiAgaWYgKCFkZWJ1Zy5lbmFibGVkKG5hbWUpKSByZXR1cm4gZnVuY3Rpb24oKXt9O1xuXG4gIHJldHVybiBmdW5jdGlvbihmbXQpe1xuICAgIGZtdCA9IGNvZXJjZShmbXQpO1xuXG4gICAgdmFyIGN1cnIgPSBuZXcgRGF0ZTtcbiAgICB2YXIgbXMgPSBjdXJyIC0gKGRlYnVnW25hbWVdIHx8IGN1cnIpO1xuICAgIGRlYnVnW25hbWVdID0gY3VycjtcblxuICAgIGZtdCA9IG5hbWVcbiAgICAgICsgJyAnXG4gICAgICArIGZtdFxuICAgICAgKyAnICsnICsgZGVidWcuaHVtYW5pemUobXMpO1xuXG4gICAgLy8gVGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRThcbiAgICAvLyB3aGVyZSBgY29uc29sZS5sb2dgIGRvZXNuJ3QgaGF2ZSAnYXBwbHknXG4gICAgd2luZG93LmNvbnNvbGVcbiAgICAgICYmIGNvbnNvbGUubG9nXG4gICAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMuXG4gKi9cblxuZGVidWcubmFtZXMgPSBbXTtcbmRlYnVnLnNraXBzID0gW107XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZS4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kZWJ1Zy5lbmFibGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHRyeSB7XG4gICAgbG9jYWxTdG9yYWdlLmRlYnVnID0gbmFtZTtcbiAgfSBjYXRjaChlKXt9XG5cbiAgdmFyIHNwbGl0ID0gKG5hbWUgfHwgJycpLnNwbGl0KC9bXFxzLF0rLylcbiAgICAsIGxlbiA9IHNwbGl0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbmFtZSA9IHNwbGl0W2ldLnJlcGxhY2UoJyonLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVbMF0gPT09ICctJykge1xuICAgICAgZGVidWcuc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZGVidWcubmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUgKyAnJCcpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogRGlzYWJsZSBkZWJ1ZyBvdXRwdXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kZWJ1Zy5kaXNhYmxlID0gZnVuY3Rpb24oKXtcbiAgZGVidWcuZW5hYmxlKCcnKTtcbn07XG5cbi8qKlxuICogSHVtYW5pemUgdGhlIGdpdmVuIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmRlYnVnLmh1bWFuaXplID0gZnVuY3Rpb24obXMpIHtcbiAgdmFyIHNlYyA9IDEwMDBcbiAgICAsIG1pbiA9IDYwICogMTAwMFxuICAgICwgaG91ciA9IDYwICogbWluO1xuXG4gIGlmIChtcyA+PSBob3VyKSByZXR1cm4gKG1zIC8gaG91cikudG9GaXhlZCgxKSArICdoJztcbiAgaWYgKG1zID49IG1pbikgcmV0dXJuIChtcyAvIG1pbikudG9GaXhlZCgxKSArICdtJztcbiAgaWYgKG1zID49IHNlYykgcmV0dXJuIChtcyAvIHNlYyB8IDApICsgJ3MnO1xuICByZXR1cm4gbXMgKyAnbXMnO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG1vZGUgbmFtZSBpcyBlbmFibGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmRlYnVnLmVuYWJsZWQgPSBmdW5jdGlvbihuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkZWJ1Zy5za2lwcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChkZWJ1Zy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkZWJ1Zy5uYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChkZWJ1Zy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG5cbi8vIHBlcnNpc3RcblxudHJ5IHtcbiAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UpIGRlYnVnLmVuYWJsZShsb2NhbFN0b3JhZ2UuZGVidWcpO1xufSBjYXRjaChlKXt9XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJjbGFzcyBOb3RpZmljYXRpb25cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgc2hvdzogKHRpdGxlLCBtZXNzYWdlKSAtPlxuICAgIHVuaXF1ZUlkID0gKGxlbmd0aD04KSAtPlxuICAgICAgaWQgPSBcIlwiXG4gICAgICBpZCArPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMikgd2hpbGUgaWQubGVuZ3RoIDwgbGVuZ3RoXG4gICAgICBpZC5zdWJzdHIgMCwgbGVuZ3RoXG5cbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUgdW5pcXVlSWQoKSxcbiAgICAgIHR5cGU6J2Jhc2ljJ1xuICAgICAgdGl0bGU6dGl0bGVcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgIGljb25Vcmw6J2ltYWdlcy9pY29uLTM4LnBuZycsXG4gICAgICAoY2FsbGJhY2spIC0+XG4gICAgICAgIHVuZGVmaW5lZFxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGlmaWNhdGlvbiIsIiNUT0RPOiByZXdyaXRlIHRoaXMgY2xhc3MgdXNpbmcgdGhlIG5ldyBjaHJvbWUuc29ja2V0cy4qIGFwaSB3aGVuIHlvdSBjYW4gbWFuYWdlIHRvIG1ha2UgaXQgd29ya1xuY2xhc3MgU2VydmVyXG4gIHNvY2tldDogY2hyb21lLnNvY2tldFxuICAjIHRjcDogY2hyb21lLnNvY2tldHMudGNwXG4gIGhvc3Q6XCIxMjcuMC4wLjFcIlxuICBwb3J0OjgwODlcbiAgbWF4Q29ubmVjdGlvbnM6NTAwXG4gIHNvY2tldFByb3BlcnRpZXM6XG4gICAgICBwZXJzaXN0ZW50OnRydWVcbiAgICAgIG5hbWU6J1NMUmVkaXJlY3RvcidcbiAgc29ja2V0SW5mbzpudWxsXG4gIGdldExvY2FsRmlsZTpudWxsXG4gIHNvY2tldElkczpbXVxuICBzdG9wcGVkOnRydWVcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuICBzdGFydDogKGhvc3QscG9ydCxtYXhDb25uZWN0aW9ucywgY2IsZXJyKSAtPlxuICAgIEBob3N0ID0gaWYgaG9zdD8gdGhlbiBob3N0IGVsc2UgQGhvc3RcbiAgICBAcG9ydCA9IGlmIHBvcnQ/IHRoZW4gcG9ydCBlbHNlIEBwb3J0XG4gICAgQG1heENvbm5lY3Rpb25zID0gaWYgbWF4Q29ubmVjdGlvbnM/IHRoZW4gbWF4Q29ubmVjdGlvbnMgZWxzZSBAbWF4Q29ubmVjdGlvbnNcblxuICAgIEBraWxsQWxsIChzdWNjZXNzKSA9PlxuICAgICAgQHNvY2tldC5jcmVhdGUgJ3RjcCcsIHt9LCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgQHNvY2tldElkcyA9IFtdXG4gICAgICAgIEBzb2NrZXRJZHMucHVzaCBzb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0ICdzb2NrZXRJZHMnOkBzb2NrZXRJZHNcbiAgICAgICAgQHNvY2tldC5saXN0ZW4gc29ja2V0SW5mby5zb2NrZXRJZCwgQGhvc3QsIEBwb3J0LCAocmVzdWx0KSA9PlxuICAgICAgICAgIGlmIHJlc3VsdCA+IC0xXG4gICAgICAgICAgICBzaG93ICdsaXN0ZW5pbmcgJyArIHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgICAgIEBzdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICAgIEBzb2NrZXRJbmZvID0gc29ja2V0SW5mb1xuICAgICAgICAgICAgQHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuICAgICAgICAgICAgY2I/IHNvY2tldEluZm9cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnI/IHJlc3VsdFxuICAgICxlcnI/XG5cblxuICBraWxsQWxsOiAoY2FsbGJhY2ssIGVycm9yKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0ICdzb2NrZXRJZHMnLCAocmVzdWx0KSA9PlxuICAgICAgc2hvdyAnZ290IGlkcydcbiAgICAgIHNob3cgcmVzdWx0XG4gICAgICBAc29ja2V0SWRzID0gcmVzdWx0LnNvY2tldElkc1xuICAgICAgcmV0dXJuIGNhbGxiYWNrPygpIHVubGVzcyBAc29ja2V0SWRzP1xuICAgICAgY250ID0gMFxuICAgICAgZm9yIHMgaW4gQHNvY2tldElkc1xuICAgICAgICBkbyAocykgPT5cbiAgICAgICAgICBjbnQrK1xuICAgICAgICAgIEBzb2NrZXQuZ2V0SW5mbyBzLCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgICAgIGNudC0tXG4gICAgICAgICAgICBpZiBub3QgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yP1xuICAgICAgICAgICAgICBAc29ja2V0LmRpc2Nvbm5lY3Qgc1xuICAgICAgICAgICAgICBAc29ja2V0LmRlc3Ryb3kgc1xuXG4gICAgICAgICAgICBjYWxsYmFjaz8oKSBpZiBjbnQgaXMgMFxuXG5cbiAgc3RvcDogKGNhbGxiYWNrLCBlcnJvcikgLT5cbiAgICBAa2lsbEFsbCAoc3VjY2VzcykgPT5cbiAgICAgIEBzdG9wcGVkID0gdHJ1ZVxuICAgICAgY2FsbGJhY2s/KClcbiAgICAsKGVycm9yKSA9PlxuICAgICAgZXJyb3I/IGVycm9yXG5cblxuICBfb25SZWNlaXZlOiAocmVjZWl2ZUluZm8pID0+XG4gICAgc2hvdyhcIkNsaWVudCBzb2NrZXQgJ3JlY2VpdmUnIGV2ZW50OiBzZD1cIiArIHJlY2VpdmVJbmZvLnNvY2tldElkXG4gICAgKyBcIiwgYnl0ZXM9XCIgKyByZWNlaXZlSW5mby5kYXRhLmJ5dGVMZW5ndGgpXG5cbiAgX29uTGlzdGVuOiAoc2VydmVyU29ja2V0SWQsIHJlc3VsdENvZGUpID0+XG4gICAgcmV0dXJuIHNob3cgJ0Vycm9yIExpc3RlbmluZzogJyArIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIGlmIHJlc3VsdENvZGUgPCAwXG4gICAgQHNlcnZlclNvY2tldElkID0gc2VydmVyU29ja2V0SWRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0LmFkZExpc3RlbmVyIEBfb25BY2NlcHRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0RXJyb3IuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdEVycm9yXG4gICAgQHRjcC5vblJlY2VpdmUuYWRkTGlzdGVuZXIgQF9vblJlY2VpdmVcbiAgICAjIHNob3cgXCJbXCIrc29ja2V0SW5mby5wZWVyQWRkcmVzcytcIjpcIitzb2NrZXRJbmZvLnBlZXJQb3J0K1wiXSBDb25uZWN0aW9uIGFjY2VwdGVkIVwiO1xuICAgICMgaW5mbyA9IEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICMgQGdldEZpbGUgdXJpLCAoZmlsZSkgLT5cbiAgX29uQWNjZXB0RXJyb3I6IChlcnJvcikgLT5cbiAgICBzaG93IGVycm9yXG5cbiAgX29uQWNjZXB0OiAoc29ja2V0SW5mbykgPT5cbiAgICAjIHJldHVybiBudWxsIGlmIGluZm8uc29ja2V0SWQgaXNudCBAc2VydmVyU29ja2V0SWRcbiAgICBzaG93KFwiU2VydmVyIHNvY2tldCAnYWNjZXB0JyBldmVudDogc2Q9XCIgKyBzb2NrZXRJbmZvLnNvY2tldElkKVxuICAgIGlmIHNvY2tldEluZm8/LnNvY2tldElkP1xuICAgICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkLCAoaW5mbykgPT5cbiAgICAgICAgQGdldExvY2FsRmlsZSBpbmZvLCAoZmlsZUVudHJ5LCBmaWxlUmVhZGVyKSA9PlxuICAgICAgICAgICAgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldEluZm8uc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZVJlYWRlciwgaW5mby5rZWVwQWxpdmVcbiAgICAgICAgLChlcnJvcikgPT5cbiAgICAgICAgICAgIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG4gICAgZWxzZVxuICAgICAgc2hvdyBcIk5vIHNvY2tldD8hXCJcbiAgICAjIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuXG5cbiAgc3RyaW5nVG9VaW50OEFycmF5OiAoc3RyaW5nKSAtPlxuICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgaSA9IDBcblxuICAgIHdoaWxlIGkgPCBzdHJpbmcubGVuZ3RoXG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgIGkrK1xuICAgIHZpZXdcblxuICBhcnJheUJ1ZmZlclRvU3RyaW5nOiAoYnVmZmVyKSAtPlxuICAgIHN0ciA9IFwiXCJcbiAgICB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgcyA9IDBcblxuICAgIHdoaWxlIHMgPCB1QXJyYXlWYWwubGVuZ3RoXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pXG4gICAgICBzKytcbiAgICBzdHJcblxuICBfd3JpdGUyMDBSZXNwb25zZTogKHNvY2tldElkLCBmaWxlRW50cnksIGZpbGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBjb250ZW50VHlwZSA9IChpZiAoZmlsZS50eXBlIGlzIFwiXCIpIHRoZW4gXCJ0ZXh0L3BsYWluXCIgZWxzZSBmaWxlLnR5cGUpXG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+XG4gICAgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShldi50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgICAgc2hvdyB3cml0ZUluZm9cbiAgICAgICAgIyBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5vbmVycm9yID0gKGVycm9yKSA9PlxuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGZpbGVcblxuXG4gICAgIyBAZW5kIHNvY2tldElkXG4gICAgIyBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICMgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgPT5cbiAgICAjICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAjICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICMgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAjICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJZFxuXG5cbiAgX3JlYWRGcm9tU29ja2V0OiAoc29ja2V0SWQsIGNiKSAtPlxuICAgIEBzb2NrZXQucmVhZCBzb2NrZXRJZCwgKHJlYWRJbmZvKSA9PlxuICAgICAgc2hvdyBcIlJFQURcIiwgcmVhZEluZm9cblxuICAgICAgIyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIGRhdGEgPSBAYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKVxuICAgICAgc2hvdyBkYXRhXG5cbiAgICAgIGlmIGRhdGEuaW5kZXhPZihcIkdFVCBcIikgaXNudCAwXG4gICAgICAgIEBlbmQgc29ja2V0SWRcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGtlZXBBbGl2ZSA9IGZhbHNlXG4gICAgICBrZWVwQWxpdmUgPSB0cnVlIGlmIGRhdGEuaW5kZXhPZiAnQ29ubmVjdGlvbjoga2VlcC1hbGl2ZScgaXNudCAtMVxuXG4gICAgICB1cmlFbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIDQpXG5cbiAgICAgIHJldHVybiBlbmQgc29ja2V0SWQgaWYgdXJpRW5kIDwgMFxuXG4gICAgICB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpXG4gICAgICBpZiBub3QgdXJpP1xuICAgICAgICB3cml0ZUVycm9yIHNvY2tldElkLCA0MDQsIGtlZXBBbGl2ZVxuICAgICAgICByZXR1cm5cblxuICAgICAgaW5mbyA9XG4gICAgICAgIHVyaTogdXJpXG4gICAgICAgIGtlZXBBbGl2ZTprZWVwQWxpdmVcbiAgICAgIGluZm8ucmVmZXJlciA9IGRhdGEubWF0Y2goL1JlZmVyZXI6XFxzKC4qKS8pP1sxXVxuICAgICAgI3N1Y2Nlc3NcbiAgICAgIGNiPyBpbmZvXG5cbiAgZW5kOiAoc29ja2V0SWQsIGtlZXBBbGl2ZSkgLT5cbiAgICAgICMgaWYga2VlcEFsaXZlXG4gICAgICAjICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgIyBlbHNlXG4gICAgQHNvY2tldC5kaXNjb25uZWN0IHNvY2tldElkXG4gICAgQHNvY2tldC5kZXN0cm95IHNvY2tldElkXG4gICAgc2hvdyAnZW5kaW5nICcgKyBzb2NrZXRJZFxuICAgIEBzb2NrZXQuYWNjZXB0IEBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAgX3dyaXRlRXJyb3I6IChzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIC0+XG4gICAgZmlsZSA9IHNpemU6IDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIlxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGVcbiAgICBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiICMoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIlxuICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcnZlclxuIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuIyB3aW5kb3cuT2JzZXJ2YWJsZSA9IHJlcXVpcmUgJy4vb2JzZXJ2ZS5jb2ZmZWUnXG53aW5kb3cuT2JzZXJ2YWJsZSA9IHJlcXVpcmUgJ29ic2VydmVkJ1xuXG5jbGFzcyBTdG9yYWdlXG4gIGFwaTogY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIGRhdGE6IFxuICAgIGN1cnJlbnRSZXNvdXJjZXM6IFtdXG4gIGNhbGxiYWNrOiAoKSAtPlxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBAb2JzZXJ2ZXIgPSBPYnNlcnZhYmxlIEBkYXRhXG4gICAgQG9ic2VydmVyLm9uICdjaGFuZ2UnLCAoY2hhbmdlKSA9PlxuICAgICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6Y2hhbmdlXG5cbiAgICBATElTVEVOLkV4dCAnZGF0YUNoYW5nZWQnLCAoY2hhbmdlKSA9PlxuICAgICAgQGRhdGEgPz0ge31cbiAgICAgIF9kYXRhID0gQGRhdGFcbiAgICAgICMgc2hvdyAnZGF0YSBjaGFuZ2VkICdcbiAgICAgICMgc2hvdyBjaGFuZ2VcbiAgICAgICMgcmV0dXJuIGlmIEBpc0FycmF5KGNoYW5nZS5vYmplY3QpXG5cbiAgICAgIEBvYnNlcnZlci5zdG9wKClcbiAgICAgICgoZGF0YSkgLT5cbiAgICAgICAgc3RhY2sgPSBjaGFuZ2UucGF0aC5zcGxpdCAnLidcblxuICAgICAgICByZXR1cm4gZGF0YVtzdGFja1swXV0gPSBjaGFuZ2UudmFsdWUgaWYgbm90IGRhdGFbc3RhY2tbMF1dP1xuXG4gICAgICAgIHdoaWxlIHN0YWNrLmxlbmd0aCA+IDEgXG4gICAgICAgICAgX3NoaWZ0ID0gc3RhY2suc2hpZnQoKVxuICAgICAgICAgIGlmIC9eXFxkKyQvLnRlc3QgX3NoaWZ0IHRoZW4gX3NoaWZ0ID0gcGFyc2VJbnQgX3NoaWZ0XG4gICAgICAgICAgZGF0YSA9IGRhdGFbX3NoaWZ0XSBcblxuICAgICAgICBfc2hpZnQgPSBzdGFjay5zaGlmdCgpXG4gICAgICAgIGlmIC9eXFxkKyQvLnRlc3QgX3NoaWZ0IHRoZW4gX3NoaWZ0ID0gcGFyc2VJbnQgX3NoaWZ0XG4gICAgICAgIGRhdGFbX3NoaWZ0XSA9IGNoYW5nZS52YWx1ZVxuICAgICAgKShAZGF0YSlcblxuICAgICAgIyBjaGFuZ2UucGF0aCA9IGNoYW5nZS5wYXRoLnJlcGxhY2UoL1xcLihcXGQrKVxcLi9nLCAnWyQxXS4nKSBpZiBAaXNBcnJheSBjaGFuZ2Uub2JqZWN0XG4gICAgICBcblxuICAgICAgQHNhdmVBbGwoKVxuICAgICAgXG4gICAgICBAb2JzZXJ2ZXIgPSBPYnNlcnZhYmxlIEBkYXRhXG4gICAgICBAb2JzZXJ2ZXIub24gJ2NoYW5nZScsIChjaGFuZ2UpID0+XG4gICAgICAgIEBNU0cuRXh0UG9ydCAnZGF0YUNoYW5nZWQnOmNoYW5nZVxuXG4gICAgIyBAb25DaGFuZ2VkQWxsKClcblxuICBpc0FycmF5OiAtPiBcbiAgICBBcnJheS5pc0FycmF5IHx8ICggdmFsdWUgKSAtPiByZXR1cm4ge30udG9TdHJpbmcuY2FsbCggdmFsdWUgKSBpcyAnW29iamVjdCBBcnJheV0nXG5cblxuICBzYXZlOiAoa2V5LCBpdGVtLCBjYikgLT5cbiAgICBvYmogPSB7fVxuICAgIG9ialtrZXldID0gaXRlbVxuICAgIEBkYXRhW2tleV0gPSBpdGVtXG4gICAgQGFwaS5zZXQgb2JqLCAocmVzKSA9PlxuICAgICAgY2I/KClcbiAgICAgIEBjYWxsYmFjaz8oKVxuXG4gIHNhdmVBbGxBbmRTeW5jOiAoZGF0YSkgLT5cbiAgICBAc2F2ZUFsbCBkYXRhLCAoKSA9PlxuICAgICAgQE1TRy5FeHQgJ3N0b3JhZ2VEYXRhJzpAZGF0YVxuXG4gIHNhdmVBbGw6IChkYXRhLCBjYikgLT5cbiAgICBpZiBkYXRhPyBcbiAgICAgIEBhcGkuc2V0IGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gICAgICAgICMgQGNhbGxiYWNrPygpXG4gICAgZWxzZVxuICAgICAgQGFwaS5zZXQgQGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gICAgICAgICMgQGNhbGxiYWNrPygpXG4gICAgIyBzaG93ICdzYXZlQWxsIEBkYXRhOiAnICsgQGRhdGEuc29ja2V0SWRzP1swXVxuICAgICMgc2hvdyAnc2F2ZUFsbCBkYXRhOiAnICsgZGF0YS5zb2NrZXRJZHM/WzBdXG5cbiAgcmV0cmlldmU6IChrZXksIGNiKSAtPlxuICAgIEBhcGkuZ2V0IGtleSwgKHJlc3VsdHMpIC0+XG4gICAgICBAZGF0YVtyXSA9IHJlc3VsdHNbcl0gZm9yIHIgb2YgcmVzdWx0c1xuICAgICAgaWYgY2I/IHRoZW4gY2IgcmVzdWx0c1trZXldXG5cbiAgcmV0cmlldmVBbGw6IChjYikgLT5cbiAgICBAYXBpLmdldCAocmVzdWx0KSA9PlxuICAgICAgQGRhdGFbY10gPSByZXN1bHRbY10gZm9yIGMgb2YgcmVzdWx0IFxuICAgICAgIyBAY2FsbGJhY2s/IHJlc3VsdFxuICAgICAgY2I/IHJlc3VsdFxuICAgICAgc2hvdyByZXN1bHRcblxuICBvbkNoYW5nZWQ6IChrZXksIGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgaWYgY2hhbmdlc1trZXldPyBhbmQgY2I/IHRoZW4gY2IgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuICBvbkNoYW5nZWRBbGw6ICgpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLG5hbWVzcGFjZSkgPT5cbiAgICAgIGhhc0NoYW5nZXMgPSBmYWxzZVxuICAgICAgZm9yIGMgb2YgY2hhbmdlcyB3aGVuIGNoYW5nZXNbY10ubmV3VmFsdWUgIT0gY2hhbmdlc1tjXS5vbGRWYWx1ZSBhbmQgYyBpc250J3NvY2tldElkcydcbiAgICAgICAgKGMpID0+IFxuICAgICAgICAgIEBkYXRhW2NdID0gY2hhbmdlc1tjXS5uZXdWYWx1ZSBcbiAgICAgICAgICBzaG93ICdkYXRhIGNoYW5nZWQ6ICdcbiAgICAgICAgICBzaG93IGNcbiAgICAgICAgICBzaG93IEBkYXRhW2NdXG5cbiAgICAgICAgICBoYXNDaGFuZ2VzID0gdHJ1ZVxuXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXMgaWYgaGFzQ2hhbmdlc1xuICAgICAgc2hvdyAnY2hhbmdlZCcgaWYgaGFzQ2hhbmdlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE3NDIwOTNcbm1vZHVsZS5leHBvcnRzID0gKCgpIC0+XG4gIG1ldGhvZHMgPSBbXG4gICAgJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJyxcbiAgICAnZXhjZXB0aW9uJywgJ2dyb3VwJywgJ2dyb3VwQ29sbGFwc2VkJywgJ2dyb3VwRW5kJywgJ2luZm8nLCAnbG9nJyxcbiAgICAnbWFya1RpbWVsaW5lJywgJ3Byb2ZpbGUnLCAncHJvZmlsZUVuZCcsICd0YWJsZScsICd0aW1lJywgJ3RpbWVFbmQnLFxuICAgICd0aW1lU3RhbXAnLCAndHJhY2UnLCAnd2FybiddXG4gIG5vb3AgPSAoKSAtPlxuICAgICMgc3R1YiB1bmRlZmluZWQgbWV0aG9kcy5cbiAgICBmb3IgbSBpbiBtZXRob2RzICB3aGVuICAhY29uc29sZVttXVxuICAgICAgY29uc29sZVttXSA9IG5vb3BcblxuICBpZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZD9cbiAgICB3aW5kb3cuc2hvdyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUpXG4gIGVsc2VcbiAgICB3aW5kb3cuc2hvdyA9ICgpIC0+XG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKVxuKSgpXG4iXX0=
