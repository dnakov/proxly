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
          return typeof cb === "function" ? cb(null, _this.data.currentResources) : void 0;
        });
      };
    })(this));
  };

  Application.prototype.getLocalFile = function(info, cb) {
    var fileEntryId, filePath, url;
    url = info.uri;
    filePath = this.getLocalFilePath(url);
    fileEntryId = this.data.currentFileMatches[filePath].fileEntry;
    if (fileEntryId != null) {
      return chrome.fileSystem.restoreEntry(fileEntryId, (function(_this) {
        return function(fileEntry) {
          return fileEntry.file(function(file) {
            return typeof cb === "function" ? cb(null, fileEntry, file) : void 0;
          }, function(err) {
            return typeof cb === "function" ? cb(err) : void 0;
          });
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
      return function(err, fileEntry, directory) {
        if (err != null) {
          show('no files found for ' + filePath);
          return typeof cb === "function" ? cb(err) : void 0;
        }
        delete fileEntry.entry;
        _this.data.currentFileMatches[filePath] = {
          fileEntry: chrome.fileSystem.retainEntry(fileEntry),
          filePath: filePath,
          directory: directory
        };
        return typeof cb === "function" ? cb(_this.data.currentFileMatches[filePath], directory) : void 0;
      };
    })(this));
  };

  Application.prototype.findFileInDirectories = function(directories, path, cb) {
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
        return function(err, fileEntry) {
          if (err != null) {
            _this.findFileInDirectories(_dirs, _path, cb, err);
          }
          return typeof cb === "function" ? cb(null, fileEntry, dir) : void 0;
        };
      })(this));
    } else {
      return this.FS.getLocalFileEntry(dir, _path, (function(_this) {
        return function(fileEntry) {
          if (typeof err !== "undefined" && err !== null) {
            if (typeof cb === "function") {
              cb(err);
            }
          }
          return typeof cb === "function" ? cb(null, fileEntry, dir) : void 0;
        };
      })(this));
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
          _results.push(_this.findLocalFilePathForURL(item.url, function(err, success) {
            return typeof cb === "function" ? cb(null, 'done') : void 0;
          }));
        }
        return _results;
      };
    })(this));
  };

  return Application;

})(Config);

module.exports = Application;


},{"./config.coffee":2,"./filesystem.coffee":4,"./listen.coffee":5,"./msg.coffee":6,"./notification.coffee":9,"./server.coffee":11,"./storage.coffee":12,"./util.coffee":13}],2:[function(require,module,exports){
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
    return this.LISTEN.Ext(fname, function(args) {
      var _ref;
      if (args != null ? args.isProxy : void 0) {
        if (typeof arguments[1] === "function") {
          if (((_ref = args["arguments"]) != null ? _ref.length : void 0) >= 0) {
            return f.apply(_klas, args["arguments"].concat(arguments[1]));
          } else {
            return f.apply(_klas, [null].concat(arguments[1]));
          }
        }
      }
      return f.apply(_klas, arguments);
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
      msg[fname] = {
        isProxy: true,
        "arguments": Array.prototype.slice.call(arguments)
      };
      msg[fname].isProxy = true;
      _args = Array.prototype.slice.call(arguments);
      if (_args.length === 0) {
        msg[fname]["arguments"] = void 0;
        return this.MSG.Ext(msg, function() {
          return void 0;
        });
      }
      msg[fname]["arguments"] = _args;
      callback = msg[fname]["arguments"].pop();
      if (typeof callback !== "function") {
        msg[fname]["arguments"].push(callback);
        return this.MSG.Ext(msg, function() {
          return void 0;
        });
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


},{"../../common.coffee":1,"../../filesystem.coffee":4,"../../redirect.coffee":10,"../../storage.coffee":12}],4:[function(require,module,exports){
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
    this.getLocalFile = __bind(this.getLocalFile, this);
    this.getLocalFileEntry = __bind(this.getLocalFileEntry, this);
  }

  FileSystem.prototype.readFile = function(dirEntry, path, cb) {
    return this.getFileEntry(dirEntry, path, (function(_this) {
      return function(err, fileEntry) {
        if (err != null) {
          if (typeof cb === "function") {
            cb(err);
          }
        }
        return fileEntry.file(function(file) {
          return typeof cb === "function" ? cb(null, fileEntry, file) : void 0;
        }, function(err) {
          return typeof cb === "function" ? cb(err) : void 0;
        });
      };
    })(this));
  };

  FileSystem.prototype.getFileEntry = function(dirEntry, path, cb) {
    return dirEntry.getFile(path, {}, (function(_this) {
      return function(fileEntry) {
        return typeof cb === "function" ? cb(null, fileEntry) : void 0;
      };
    })(this), (function(_this) {
      return function(err) {
        return typeof cb === "function" ? cb(err) : void 0;
      };
    })(this));
  };

  FileSystem.prototype.openDirectory = function(directoryEntry, cb) {
    return this.api.getDisplayPath(directoryEntry, (function(_this) {
      return function(pathName) {
        var dir;
        dir = {
          relPath: directoryEntry.fullPath,
          directoryEntryId: _this.api.retainEntry(directoryEntry),
          entry: directoryEntry
        };
        return typeof cb === "function" ? cb(null, pathName, dir) : void 0;
      };
    })(this));
  };

  FileSystem.prototype.getLocalFileEntry = function(dir, filePath, cb) {
    return chrome.fileSystem.restoreEntry(dir.directoryEntryId, (function(_this) {
      return function(dirEntry) {
        return _this.getFileEntry(dirEntry, filePath, function(err, fileEntry) {
          if (err != null) {
            if (typeof cb === "function") {
              cb(err);
            }
          }
          return typeof cb === "function" ? cb(null, fileEntry) : void 0;
        });
      };
    })(this));
  };

  FileSystem.prototype.getLocalFile = function(dir, filePath, cb, error) {
    return chrome.fileSystem.restoreEntry(dir.directoryEntryId, (function(_this) {
      return function(dirEntry) {
        return _this.readFile(dirEntry, filePath, function(err, fileEntry, file) {
          if (err != null) {
            if (typeof cb === "function") {
              cb(err);
            }
          }
          return typeof cb === "function" ? cb(null, fileEntry, file) : void 0;
        });
      };
    })(this), (function(_this) {
      return function(_error) {
        return typeof cb === "function" ? cb(_error) : void 0;
      };
    })(this));
  };

  return FileSystem;

})();

module.exports = FileSystem;


},{"./listen.coffee":5,"./msg.coffee":6}],5:[function(require,module,exports){
var Config, LISTEN,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

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
    _sendResponse = (function(_this) {
      return function() {
        var e, whatever;
        whatever = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        try {
          if (whatever[0] === null) {
            whatever.shift();
          }
          sendResponse.apply(null, whatever);
        } catch (_error) {
          e = _error;
          void 0;
        }
        return responseStatus.called = true;
      };
    })(this);
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
// var debug = require('debug')('observed');

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

  // debug('new', subject, !!parent, prefix);

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

  // debug('_bind', subject);

  this.subject = subject;

  if (parent) {
    parent.observers.push(this);
  } else {
    this.observers = [this];
  }

  this.onchange = onchange(parent || this, prefix);
  // Object.observe(this.subject, this.onchange);
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
  // debug('deliverChanges')
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
  // debug('_walk');

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
  // debug('stop');

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
  // debug('_remove', subject);

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
    // debug('onchange', prefix);

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


},{"./change":7,"events":14}],9:[function(require,module,exports){
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


},{}],10:[function(require,module,exports){
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


},{}],11:[function(require,module,exports){
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
        return function(err, info) {
          if (err != null) {
            return _this._writeError(socketInfo.socketId, 404, info.keepAlive);
          }
          return _this.getLocalFile(info, function(err, fileEntry, fileReader) {
            if (err != null) {
              return _this._writeError(socketInfo.socketId, 404, info.keepAlive);
            } else {
              return _this._write200Response(socketInfo.socketId, fileEntry, fileReader, info.keepAlive);
            }
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
          return typeof cb === "function" ? cb('404') : void 0;
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
          return typeof cb === "function" ? cb('404') : void 0;
        }
        info = {
          uri: uri,
          keepAlive: keepAlive
        };
        info.referer = (_ref = data.match(/Referer:\s(.*)/)) != null ? _ref[1] : void 0;
        return typeof cb === "function" ? cb(null, info) : void 0;
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


},{}],12:[function(require,module,exports){
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

  Storage.prototype.notifyOnChange = function() {};

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


},{"./listen.coffee":5,"./msg.coffee":6,"observed":8}],13:[function(require,module,exports){
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


},{}],14:[function(require,module,exports){
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

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9jb21tb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L2NvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvZXh0ZW5zaW9uL3NyYy9iYWNrZ3JvdW5kLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9maWxlc3lzdGVtLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9saXN0ZW4uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L21zZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL29ic2VydmVkL2xpYi9jaGFuZ2UuanMiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL29ic2VydmVkL2xpYi9vYnNlcnZlZC5qcyIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9ub3RpZmljYXRpb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L3JlZGlyZWN0LmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9zZXJ2ZXIuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L3N0b3JhZ2UuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L3V0aWwuY29mZmVlIiwiL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwyRUFBQTtFQUFBOztpU0FB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LElBQUksQ0FBQyxXQUFOLENBQWtCLE9BQWxCLEVBSkY7S0FETztFQUFBLENBbEJULENBQUE7O2FBQUE7O0dBRGdCLE9BRmxCLENBQUE7O0FBQUEsTUE0Qk0sQ0FBQyxPQUFQLEdBQWlCLEdBNUJqQixDQUFBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlICcuL3V0aWwuY29mZmVlJ1xuQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuU3RvcmFnZSA9IHJlcXVpcmUgJy4vc3RvcmFnZS5jb2ZmZWUnXG5GaWxlU3lzdGVtID0gcmVxdWlyZSAnLi9maWxlc3lzdGVtLmNvZmZlZSdcbk5vdGlmaWNhdGlvbiA9IHJlcXVpcmUgJy4vbm90aWZpY2F0aW9uLmNvZmZlZSdcblNlcnZlciA9IHJlcXVpcmUgJy4vc2VydmVyLmNvZmZlZSdcblxuXG5jbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIENvbmZpZ1xuICBMSVNURU46IG51bGxcbiAgTVNHOiBudWxsXG4gIFN0b3JhZ2U6IG51bGxcbiAgRlM6IG51bGxcbiAgU2VydmVyOiBudWxsXG4gIE5vdGlmeTogbnVsbFxuICBwbGF0Zm9ybTpudWxsXG4gIGN1cnJlbnRUYWJJZDpudWxsXG5cbiAgY29uc3RydWN0b3I6IChkZXBzKSAtPlxuICAgIHN1cGVyXG5cbiAgICBATVNHID89IE1TRy5nZXQoKVxuICAgIEBMSVNURU4gPz0gTElTVEVOLmdldCgpXG4gICAgXG4gICAgZm9yIHByb3Agb2YgZGVwc1xuICAgICAgaWYgdHlwZW9mIGRlcHNbcHJvcF0gaXMgXCJvYmplY3RcIiBcbiAgICAgICAgQFtwcm9wXSA9IEB3cmFwT2JqSW5ib3VuZCBkZXBzW3Byb3BdXG4gICAgICBpZiB0eXBlb2YgZGVwc1twcm9wXSBpcyBcImZ1bmN0aW9uXCIgXG4gICAgICAgIEBbcHJvcF0gPSBAd3JhcE9iak91dGJvdW5kIG5ldyBkZXBzW3Byb3BdXG5cbiAgICBATm90aWZ5ID89IChuZXcgTm90aWZpY2F0aW9uKS5zaG93IFxuICAgICMgQFN0b3JhZ2UgPz0gQHdyYXBPYmpPdXRib3VuZCBuZXcgU3RvcmFnZSBAZGF0YVxuICAgICMgQEZTID0gbmV3IEZpbGVTeXN0ZW0gXG4gICAgIyBAU2VydmVyID89IEB3cmFwT2JqT3V0Ym91bmQgbmV3IFNlcnZlclxuICAgIEBkYXRhID0gQFN0b3JhZ2UuZGF0YVxuICAgIFxuICAgIEB3cmFwID0gaWYgQFNFTEZfVFlQRSBpcyAnQVBQJyB0aGVuIEB3cmFwSW5ib3VuZCBlbHNlIEB3cmFwT3V0Ym91bmRcblxuICAgIEBvcGVuQXBwID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLm9wZW5BcHAnLCBAb3BlbkFwcFxuICAgIEBsYXVuY2hBcHAgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ubGF1bmNoQXBwJywgQGxhdW5jaEFwcFxuICAgIEBzdGFydFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5zdGFydFNlcnZlcicsIEBzdGFydFNlcnZlclxuICAgIEByZXN0YXJ0U2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnJlc3RhcnRTZXJ2ZXInLCBAcmVzdGFydFNlcnZlclxuICAgIEBzdG9wU2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnN0b3BTZXJ2ZXInLCBAc3RvcFNlcnZlclxuICAgIFxuXG4gICAgQHdyYXAgPSBpZiBAU0VMRl9UWVBFIGlzICdFWFRFTlNJT04nIHRoZW4gQHdyYXBJbmJvdW5kIGVsc2UgQHdyYXBPdXRib3VuZFxuXG4gICAgQGdldFJlc291cmNlcyA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRSZXNvdXJjZXMnLCBAZ2V0UmVzb3VyY2VzXG4gICAgQGdldEN1cnJlbnRUYWIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0Q3VycmVudFRhYicsIEBnZXRDdXJyZW50VGFiXG5cbiAgICBjaHJvbWUucnVudGltZS5nZXRQbGF0Zm9ybUluZm8gKGluZm8pID0+XG4gICAgICBAcGxhdGZvcm0gPSBpbmZvXG5cbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgLT5cbiAgICBAZGF0YS5zZXJ2ZXIgPVxuICAgICAgaG9zdDpcIjEyNy4wLjAuMVwiXG4gICAgICBwb3J0OjgwODlcbiAgICAgIGlzT246ZmFsc2VcblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIGxhdW5jaEFwcDogKGNiLCBlcnJvcikgLT5cbiAgICAgIGNocm9tZS5tYW5hZ2VtZW50LmxhdW5jaEFwcCBAQVBQX0lELCAoZXh0SW5mbykgPT5cbiAgICAgICAgaWYgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICAgICAgZXJyb3IgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjYj8gZXh0SW5mb1xuXG4gIG9wZW5BcHA6ICgpID0+XG4gICAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLFxuICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgYm91bmRzOlxuICAgICAgICAgIHdpZHRoOjc3MFxuICAgICAgICAgIGhlaWdodDo4MDAsXG4gICAgICAod2luKSA9PlxuICAgICAgICBAYXBwV2luZG93ID0gd2luKSBcblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIGdldFJlc291cmNlczogKGNiKSAtPlxuICAgIEBnZXRDdXJyZW50VGFiICh0YWJJZCkgPT5cbiAgICAgIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQgdGFiSWQsIFxuICAgICAgICBmaWxlOidzY3JpcHRzL2NvbnRlbnQuanMnLCAocmVzdWx0cykgPT5cbiAgICAgICAgICBAZGF0YS5jdXJyZW50UmVzb3VyY2VzID0gW11cbiAgICAgICAgICBmb3IgciBpbiByZXN1bHRzXG4gICAgICAgICAgICBmb3IgcmVzIGluIHJcbiAgICAgICAgICAgICAgQGRhdGEuY3VycmVudFJlc291cmNlcy5wdXNoIHJlc1xuICAgICAgICAgIGNiPyBudWxsLCBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG5cbiAgIyB1cGRhdGVSZXNvdXJjZXNMaXN0ZW5lcjogKHJlc291cmNlcykgPT5cbiAgIyAgICAgc2hvdyByZXNvdXJjZXNcbiAgIyAgICAgX3Jlc291cmNlcyA9IFtdXG5cbiAgIyAgICAgZm9yIGZyYW1lIGluIHJlc291cmNlcyBcbiAgIyAgICAgICBkbyAoZnJhbWUpID0+XG4gICMgICAgICAgICBmb3IgaXRlbSBpbiBmcmFtZSBcbiAgIyAgICAgICAgICAgZG8gKGl0ZW0pID0+XG4gICMgICAgICAgICAgICAgX3Jlc291cmNlcy5wdXNoIGl0ZW1cbiAgIyAgICAgQFN0b3JhZ2Uuc2F2ZSAnY3VycmVudFJlc291cmNlcycsIHJlc291cmNlc1xuICBnZXRMb2NhbEZpbGU6IChpbmZvLCBjYikgPT5cbiAgICB1cmwgPSBpbmZvLnVyaVxuICAgIGZpbGVQYXRoID0gQGdldExvY2FsRmlsZVBhdGggdXJsXG4gICAgZmlsZUVudHJ5SWQgPSBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdLmZpbGVFbnRyeVxuICAgIGlmIGZpbGVFbnRyeUlkP1xuICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGZpbGVFbnRyeUlkLCAoZmlsZUVudHJ5KSA9PlxuICAgICAgICBmaWxlRW50cnkuZmlsZSAoZmlsZSkgPT5cbiAgICAgICAgICBjYj8gbnVsbCxmaWxlRW50cnksZmlsZVxuICAgICAgICAsKGVycikgPT4gY2I/IGVyclxuXG4gICAgIyBkaXJOYW1lID0gaW5mby51cmlcblxuICAgICMgZGlyTmFtZSA9IGRpck5hbWUubWF0Y2goLyhcXC8uKj9cXC8pfChcXFxcLio/XFxcXCkvKT9bMF0gfHwgJydcbiAgICAjIGRpck5hbWUgPSBkaXJOYW1lLnN1YnN0cmluZyAwLCBkaXJOYW1lLmxlbmd0aCAtIDFcbiAgICAjIHNob3cgJ2xvb2tpbmcgZm9yICcgKyBkaXJOYW1lXG4gICAgIyBfbWFwcyA9IHt9XG4gICAgIyBfbWFwc1tpdGVtLmRpcmVjdG9yeV0gPSBpdGVtLmlzT24gZm9yIGl0ZW0gaW4gQGRhdGEubWFwc1xuXG4gICAgIyBmb3IgaywgZGlyIG9mIEBkYXRhLmRpcmVjdG9yaWVzIHdoZW4gX21hcHNba11cbiAgICAjICAgc2hvdyAnaW4gbG9vcCcgKyBkaXIucmVsUGF0aFxuICAgICMgICBpZiBkaXIucmVsUGF0aCBpcyBkaXJOYW1lIHRoZW4gZm91bmREaXIgPSBkaXJcblxuICAgICMgaWYgZm91bmREaXI/XG4gICAgIyAgIHNob3cgJ2ZvdW5kISAnICsgZm91bmREaXJcbiAgICAjICAgQEZTLmdldExvY2FsRmlsZSBmb3VuZERpciwgZmlsZVBhdGgsIGNiLCBlcnJcbiAgICAjIGVsc2VcbiAgICAjICAgc2hvdyAnZHVubm8sIG5vdCBmb3VuZCdcbiAgICAjICAgZXJyKClcblxuICBzdGFydFNlcnZlcjogKGNiLCBlcnIpIC0+XG4gICAgICBpZiBAU2VydmVyLnN0b3BwZWQgaXMgdHJ1ZVxuICAgICAgICAgIEBTZXJ2ZXIuc3RhcnQgQGRhdGEuc2VydmVyLmhvc3QsQGRhdGEuc2VydmVyLnBvcnQsbnVsbCwgKHNvY2tldEluZm8pID0+XG4gICAgICAgICAgICAgIEBkYXRhLnNlcnZlci51cmwgPSAnaHR0cDovLycgKyBAZGF0YS5zZXJ2ZXIuaG9zdCArICc6JyArIEBkYXRhLnNlcnZlci5wb3J0ICsgJy8nXG4gICAgICAgICAgICAgIEBkYXRhLnNlcnZlci5pc09uID0gdHJ1ZVxuICAgICAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIFN0YXJ0ZWRcIiwgXCJTdGFydGVkIFNlcnZlciBodHRwOi8vI3sgQGRhdGEuc2VydmVyLmhvc3QgfToje0BkYXRhLnNlcnZlci5wb3J0fVwiXG4gICAgICAgICAgICAgIGNiPygpXG4gICAgICAgICAgLChlcnJvcikgPT5cbiAgICAgICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBFcnJvclwiLFwiRXJyb3IgU3RhcnRpbmcgU2VydmVyOiAjeyBlcnJvciB9XCJcbiAgICAgICAgICAgICAgQGRhdGEuc2VydmVyLnVybCA9ICdodHRwOi8vJyArIEBkYXRhLnNlcnZlci5ob3N0ICsgJzonICsgQGRhdGEuc2VydmVyLnBvcnQgKyAnLydcbiAgICAgICAgICAgICAgQGRhdGEuc2VydmVyLmlzT24gPSB0cnVlXG4gICAgICAgICAgICAgIGVycj8oKVxuXG4gIHN0b3BTZXJ2ZXI6IChjYiwgZXJyKSAtPlxuICAgICAgQFNlcnZlci5zdG9wIChzdWNjZXNzKSA9PlxuICAgICAgICAgIEBOb3RpZnkgJ1NlcnZlciBTdG9wcGVkJywgXCJTZXJ2ZXIgU3RvcHBlZFwiXG4gICAgICAgICAgQGRhdGEuc2VydmVyLnVybCA9ICcnXG4gICAgICAgICAgQGRhdGEuc2VydmVyLmlzT24gPSBmYWxzZVxuICAgICAgICAgIGNiPygpXG4gICAgICAsKGVycm9yKSA9PlxuICAgICAgICAgIGVycj8oKVxuICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIlNlcnZlciBjb3VsZCBub3QgYmUgc3RvcHBlZDogI3sgZXJyb3IgfVwiXG5cbiAgcmVzdGFydFNlcnZlcjogLT5cbiAgICBAc3RvcFNlcnZlciAoKSA9PlxuICAgICAgQHN0YXJ0U2VydmVyKClcblxuICBjaGFuZ2VQb3J0OiA9PlxuXG4gIGdldExvY2FsRmlsZVBhdGg6ICh1cmwpIC0+XG4gICAgZmlsZVBhdGhSZWdleCA9IC9eKChodHRwW3NdP3xmdHB8Y2hyb21lLWV4dGVuc2lvbnxmaWxlKTpcXC9cXC8pP1xcLz8oW15cXC9cXC5dK1xcLikqPyhbXlxcL1xcLl0rXFwuW146XFwvXFxzXFwuXXsyLDN9KFxcLlteOlxcL1xcc1xcLl3igIzigIt7MiwzfSk/KSg6XFxkKyk/KCR8XFwvKShbXiM/XFxzXSspPyguKj8pPygjW1xcd1xcLV0rKT8kL1xuXG4gICAgQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzID89IHt9XG4gICAgXG4gICAgcmV0dXJuIHt9IHVubGVzcyBAZGF0YS5tYXBzPyBhbmQgQGRhdGEuZGlyZWN0b3JpZXM/XG5cbiAgICByZXNQYXRoID0gdXJsLm1hdGNoKGZpbGVQYXRoUmVnZXgpP1s4XVxuXG4gICAgcmV0dXJuIHt9IHVubGVzcyByZXNQYXRoP1xuICAgIFxuICAgIGZvciBtYXAgaW4gQGRhdGEubWFwc1xuICAgICAgcmVzUGF0aCA9IHVybC5tYXRjaChuZXcgUmVnRXhwKG1hcC51cmwpKT8gYW5kIG1hcC51cmw/XG5cbiAgICAgIGlmIHJlc1BhdGhcbiAgICAgICAgaWYgcmVmZXJlcj9cbiAgICAgICAgICAjIFRPRE86IHRoaXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXAudXJsKSwgbWFwLnJlZ2V4UmVwbFxuICAgICAgICBicmVha1xuICAgIHJldHVybiBmaWxlUGF0aFxuXG4gIGZpbmRMb2NhbEZpbGVQYXRoRm9yVVJMOiAodXJsLCBjYikgLT5cbiAgICBmaWxlUGF0aCA9IEBnZXRMb2NhbEZpbGVQYXRoIHVybFxuICAgIHJldHVybiB1bmxlc3MgZmlsZVBhdGg/XG4gICAgQGZpbmRGaWxlSW5EaXJlY3RvcmllcyBAZGF0YS5kaXJlY3RvcmllcywgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyZWN0b3J5KSA9PlxuXG4gICAgICBpZiBlcnI/IFxuICAgICAgICBzaG93ICdubyBmaWxlcyBmb3VuZCBmb3IgJyArIGZpbGVQYXRoXG4gICAgICAgIHJldHVybiBjYj8gZXJyXG5cbiAgICAgIGRlbGV0ZSBmaWxlRW50cnkuZW50cnlcbiAgICAgIEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlc1tmaWxlUGF0aF0gPSBcbiAgICAgICAgZmlsZUVudHJ5OiBjaHJvbWUuZmlsZVN5c3RlbS5yZXRhaW5FbnRyeSBmaWxlRW50cnlcbiAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgIGRpcmVjdG9yeTogZGlyZWN0b3J5XG4gICAgICBjYj8oQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzW2ZpbGVQYXRoXSwgZGlyZWN0b3J5KVxuICAgICAgXG5cblxuICBmaW5kRmlsZUluRGlyZWN0b3JpZXM6IChkaXJlY3RvcmllcywgcGF0aCwgY2IpIC0+XG4gICAgYWxsRGlycyA9IGRpcmVjdG9yaWVzLnNsaWNlKCkgdW5sZXNzIGFsbERpcnM/XG4gICAgZXJyKCkgaWYgZGlyZWN0b3JpZXMgaXMgdW5kZWZpbmVkIG9yIHBhdGggaXMgdW5kZWZpbmVkXG4gICAgX2RpcnMgPSBhbGxEaXJzLnNsaWNlKClcbiAgICBfcGF0aCA9IHBhdGhcbiAgICBkaXIgPSBfZGlycy5zaGlmdCgpXG4gICAgX3BhdGgucmVwbGFjZSgvLio/XFwvLywgJycpIGlmIGRpciBpcyB1bmRlZmluZWRcbiAgICBpZiBfcGF0aC5tYXRjaCgvLio/XFwvLyk/ICNzdGlsbCBkaXJlY3RvcnlcbiAgICAgICMgZGlyID0gX2RpcnMuc2hpZnQoKVxuICAgICAgaWYgZGlyIGlzIHVuZGVmaW5lZFxuICAgICAgICBfZGlycyA9IGFsbERpcnMuc2xpY2UoKSBcbiAgICAgICAgZGlyID0gX2RpcnMuc2hpZnQoKSBcblxuICAgICAgQEZTLmdldExvY2FsRmlsZUVudHJ5IGRpciwgX3BhdGgsIFxuICAgICAgICAoZXJyLCBmaWxlRW50cnkpID0+XG4gICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgQGZpbmRGaWxlSW5EaXJlY3RvcmllcyBfZGlycywgX3BhdGgsIGNiLCBlcnIgXG5cbiAgICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBkaXJcbiAgICBlbHNlXG4gICAgICBARlMuZ2V0TG9jYWxGaWxlRW50cnkgZGlyLCBfcGF0aCwgXG4gICAgICAgIChmaWxlRW50cnkpID0+XG4gICAgICAgICAgaWYgZXJyPyB0aGVuIGNiPyBlcnJcblxuICAgICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGRpclxuICBcbiAgbWFwQWxsUmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldFJlc291cmNlcyA9PlxuICAgICAgZm9yIGl0ZW0gaW4gQGRhdGEuY3VycmVudFJlc291cmNlc1xuICAgICAgICBAZmluZExvY2FsRmlsZVBhdGhGb3JVUkwgaXRlbS51cmwsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICAgICAgY2I/IG51bGwsICdkb25lJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb25cblxuXG4iLCJjbGFzcyBDb25maWdcbiAgIyBBUFBfSUQ6ICdjZWNpZmFmcGhlZ2hvZnBmZGtoZWtraWJjaWJoZ2ZlYydcbiAgIyBFWFRFTlNJT05fSUQ6ICdkZGRpbWJuamliamNhZmJva25iZ2hlaGJmYWpnZ2dlcCdcbiAgQVBQX0lEOiAnZGVuZWZkb29mbmtnam1wYmZwa25paHBnZGhhaHBibGgnXG4gIEVYVEVOU0lPTl9JRDogJ2lqY2ptcGVqb25taW1vb2ZiY3BhbGllamhpa2Flb21oJyAgXG4gIFNFTEZfSUQ6IGNocm9tZS5ydW50aW1lLmlkXG4gIGlzQ29udGVudFNjcmlwdDogbG9jYXRpb24ucHJvdG9jb2wgaXNudCAnY2hyb21lLWV4dGVuc2lvbjonXG4gIEVYVF9JRDogbnVsbFxuICBFWFRfVFlQRTogbnVsbFxuICBcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQEVYVF9JRCA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiBARVhURU5TSU9OX0lEIGVsc2UgQEFQUF9JRFxuICAgIEBFWFRfVFlQRSA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG4gICAgQFNFTEZfVFlQRSA9IGlmIEBBUFBfSUQgaXNudCBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcblxuICB3cmFwSW5ib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgICBfa2xhcyA9IG9ialxuICAgICAgQExJU1RFTi5FeHQgZm5hbWUsIChhcmdzKSAtPlxuICAgICAgICBpZiBhcmdzPy5pc1Byb3h5XG4gICAgICAgICAgaWYgdHlwZW9mIGFyZ3VtZW50c1sxXSBpcyBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgIGlmIGFyZ3MuYXJndW1lbnRzPy5sZW5ndGggPj0gMFxuICAgICAgICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgYXJncy5hcmd1bWVudHMuY29uY2F0IGFyZ3VtZW50c1sxXSBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIFtudWxsXS5jb25jYXQgYXJndW1lbnRzWzFdXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgYXJndW1lbnRzXG5cbiAgICAgICAgIyBhcmdzID0gW11cbiAgICAgICAgIyBpZiBhcmdzLmFyZ3VtZW50cz8ubGVuZ3RoIGlzIDBcbiAgICAgICAgIyAgIGFyZ3MucHVzaCBudWxsXG4gICAgICAgICMgZWxzZVxuICAgICAgICAjICAgYXJncyA9IF9hcmd1bWVudHNcbiAgICAgICAgIyBfYXJncyA9IGFyZ3NbMF0/LnB1c2goYXJnc1sxXSlcbiAgICAgICAgI2YuYXBwbHkgX2tsYXMsIGFyZ3NcblxuICB3cmFwT2JqSW5ib3VuZDogKG9iaikgLT5cbiAgICAob2JqW2tleV0gPSBAd3JhcEluYm91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG4gIHdyYXBPdXRib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgLT5cbiAgICAgIG1zZyA9IHt9XG4gICAgICBtc2dbZm5hbWVdID0gXG4gICAgICAgIGlzUHJveHk6dHJ1ZVxuICAgICAgICBhcmd1bWVudHM6QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG4gICAgICBtc2dbZm5hbWVdLmlzUHJveHkgPSB0cnVlXG4gICAgICBfYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuXG4gICAgICBpZiBfYXJncy5sZW5ndGggaXMgMFxuICAgICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cyA9IHVuZGVmaW5lZCBcbiAgICAgICAgcmV0dXJuIEBNU0cuRXh0IG1zZywgKCkgLT4gdW5kZWZpbmVkXG5cbiAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzID0gX2FyZ3NcblxuICAgICAgY2FsbGJhY2sgPSBtc2dbZm5hbWVdLmFyZ3VtZW50cy5wb3AoKVxuICAgICAgaWYgdHlwZW9mIGNhbGxiYWNrIGlzbnQgXCJmdW5jdGlvblwiXG4gICAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzLnB1c2ggY2FsbGJhY2tcbiAgICAgICAgQE1TRy5FeHQgbXNnLCAoKSAtPiB1bmRlZmluZWRcbiAgICAgIGVsc2VcbiAgICAgICAgQE1TRy5FeHQgbXNnLCBjYWxsYmFjayBcblxuICB3cmFwT2JqT3V0Ym91bmQ6IChvYmopIC0+XG4gICAgKG9ialtrZXldID0gQHdyYXBPdXRib3VuZCBvYmosIG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsga2V5LCBvYmpba2V5XSkgZm9yIGtleSBvZiBvYmogd2hlbiB0eXBlb2Ygb2JqW2tleV0gaXMgXCJmdW5jdGlvblwiXG4gICAgb2JqXG5cbm1vZHVsZS5leHBvcnRzID0gQ29uZmlnIiwiZ2V0R2xvYmFsID0gLT5cbiAgX2dldEdsb2JhbCA9IC0+XG4gICAgdGhpc1xuXG4gIF9nZXRHbG9iYWwoKVxuXG5yb290ID0gZ2V0R2xvYmFsKClcblxuIyByb290LmFwcCA9IGFwcCA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG4jIGFwcCA9IG5ldyBsaWIuQXBwbGljYXRpb25cbmNocm9tZS5icm93c2VyQWN0aW9uLnNldFBvcHVwIHBvcHVwOlwicG9wdXAuaHRtbFwiXG5cbkFwcGxpY2F0aW9uID0gcmVxdWlyZSAnLi4vLi4vY29tbW9uLmNvZmZlZSdcblJlZGlyZWN0ID0gcmVxdWlyZSAnLi4vLi4vcmVkaXJlY3QuY29mZmVlJ1xuU3RvcmFnZSA9IHJlcXVpcmUgJy4uLy4uL3N0b3JhZ2UuY29mZmVlJ1xuRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4uLy4uL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuXG5yb290LmFwcCA9IG5ldyBBcHBsaWNhdGlvblxuICBSZWRpcmVjdDogbmV3IFJlZGlyZWN0XG4gIFN0b3JhZ2U6IFN0b3JhZ2VcbiAgRlM6IEZpbGVTeXN0ZW1cblxucm9vdC5hcHAuU3RvcmFnZS5yZXRyaWV2ZUFsbCgpIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuXG5jbGFzcyBGaWxlU3lzdGVtXG4gIGFwaTogY2hyb21lLmZpbGVTeXN0ZW1cbiAgcmV0YWluZWREaXJzOiB7fVxuICBMSVNURU46IExJU1RFTi5nZXQoKSBcbiAgTVNHOiBNU0cuZ2V0KClcbiAgY29uc3RydWN0b3I6ICgpIC0+XG5cbiAgIyBAZGlyczogbmV3IERpcmVjdG9yeVN0b3JlXG4gICMgZmlsZVRvQXJyYXlCdWZmZXI6IChibG9iLCBvbmxvYWQsIG9uZXJyb3IpIC0+XG4gICMgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICMgICByZWFkZXIub25sb2FkID0gb25sb2FkXG5cbiAgIyAgIHJlYWRlci5vbmVycm9yID0gb25lcnJvclxuXG4gICMgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgYmxvYlxuXG4gIHJlYWRGaWxlOiAoZGlyRW50cnksIHBhdGgsIGNiKSAtPlxuICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIHBhdGgsXG4gICAgICAoZXJyLCBmaWxlRW50cnkpID0+XG4gICAgICAgIFxuICAgICAgICBpZiBlcnI/IHRoZW4gY2I/IGVyclxuXG4gICAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGZpbGVcbiAgICAgICAgLChlcnIpID0+IGNiPyBlcnJcblxuICBnZXRGaWxlRW50cnk6IChkaXJFbnRyeSwgcGF0aCwgY2IpIC0+XG4gICAgICBkaXJFbnRyeS5nZXRGaWxlIHBhdGgsIHt9LCAoZmlsZUVudHJ5KSA9PlxuICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5XG4gICAgICAsKGVycikgPT4gY2I/IGVyclxuXG4gICMgb3BlbkRpcmVjdG9yeTogKGNhbGxiYWNrKSAtPlxuICBvcGVuRGlyZWN0b3J5OiAoZGlyZWN0b3J5RW50cnksIGNiKSAtPlxuICAjIEBhcGkuY2hvb3NlRW50cnkgdHlwZTonb3BlbkRpcmVjdG9yeScsIChkaXJlY3RvcnlFbnRyeSwgZmlsZXMpID0+XG4gICAgQGFwaS5nZXREaXNwbGF5UGF0aCBkaXJlY3RvcnlFbnRyeSwgKHBhdGhOYW1lKSA9PlxuICAgICAgZGlyID1cbiAgICAgICAgICByZWxQYXRoOiBkaXJlY3RvcnlFbnRyeS5mdWxsUGF0aCAjLnJlcGxhY2UoJy8nICsgZGlyZWN0b3J5RW50cnkubmFtZSwgJycpXG4gICAgICAgICAgZGlyZWN0b3J5RW50cnlJZDogQGFwaS5yZXRhaW5FbnRyeShkaXJlY3RvcnlFbnRyeSlcbiAgICAgICAgICBlbnRyeTogZGlyZWN0b3J5RW50cnlcbiAgICAgIGNiPyBudWxsLCBwYXRoTmFtZSwgZGlyXG4gICAgICAgICAgIyBAZ2V0T25lRGlyTGlzdCBkaXJcbiAgICAgICAgICAjIFN0b3JhZ2Uuc2F2ZSAnZGlyZWN0b3JpZXMnLCBAc2NvcGUuZGlyZWN0b3JpZXMgKHJlc3VsdCkgLT5cblxuICBnZXRMb2NhbEZpbGVFbnRyeTogKGRpciwgZmlsZVBhdGgsIGNiKSA9PiBcbiAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIGZpbGVQYXRoLFxuICAgICAgICAoZXJyLCBmaWxlRW50cnkpID0+XG4gICAgICAgICAgaWYgZXJyPyB0aGVuIGNiPyBlcnIgXG4gICAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeVxuXG4gIGdldExvY2FsRmlsZTogKGRpciwgZmlsZVBhdGgsIGNiLCBlcnJvcikgPT4gXG4gICMgaWYgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0/XG4gICMgICBkaXJFbnRyeSA9IEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdXG4gICMgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAgICAgLChfZXJyb3IpID0+IGVycm9yKF9lcnJvcilcbiAgIyBlbHNlXG4gICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICAjIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgICAgICAgaWYgZXJyPyB0aGVuIGNiPyBlcnJcbiAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZmlsZVxuICAgICwoX2Vycm9yKSA9PiBjYj8oX2Vycm9yKVxuXG4gICAgICAjIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBzdWNjZXNzLFxuICAgICAgIyAgICAgKGVycikgPT5cbiAgICAgICMgICAgICAgICBAZmluZEZpbGVGb3JQYXRoIGluZm8sIGNiXG5cbiAgIyBmaW5kRmlsZUZvclBhdGg6IChpbmZvLCBjYikgPT5cbiAgIyAgICAgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIGNiLCBpbmZvLnJlZmVyZXJcblxuICAjIGZpbmRGaWxlRm9yUXVlcnlTdHJpbmc6IChfdXJsLCBjYiwgZXJyb3IsIHJlZmVyZXIpID0+XG4gICMgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudChfdXJsKS5yZXBsYWNlIC8uKj9zbHJlZGlyXFw9LywgJydcblxuICAjICAgICBtYXRjaCA9IGl0ZW0gZm9yIGl0ZW0gaW4gQG1hcHMgd2hlbiB1cmwubWF0Y2gobmV3IFJlZ0V4cChpdGVtLnVybCkpPyBhbmQgaXRlbS51cmw/IGFuZCBub3QgbWF0Y2g/XG5cbiAgIyAgICAgaWYgbWF0Y2g/XG4gICMgICAgICAgICBpZiByZWZlcmVyP1xuICAjICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLm1hdGNoKC8uKlxcL1xcLy4qP1xcLyguKikvKT9bMV1cbiAgIyAgICAgICAgIGVsc2VcbiAgIyAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWF0Y2gudXJsKSwgbWF0Y2gucmVnZXhSZXBsXG5cbiAgIyAgICAgICAgIGZpbGVQYXRoLnJlcGxhY2UgJy8nLCAnXFxcXCcgaWYgcGxhdGZvcm0gaXMgJ3dpbidcblxuICAjICAgICAgICAgZGlyID0gQFN0b3JhZ2UuZGF0YS5kaXJlY3Rvcmllc1ttYXRjaC5kaXJlY3RvcnldXG5cbiAgIyAgICAgICAgIGlmIG5vdCBkaXI/IHRoZW4gcmV0dXJuIGVyciAnbm8gbWF0Y2gnXG5cbiAgIyAgICAgICAgIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAjICAgICAgICAgICAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiAgIyAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICAgICAgZWxzZVxuICAjICAgICAgICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAjICAgICAgICAgICAgICAgICBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICMgICAgICAgICAgICAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgICAgICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgICAgICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgZWxzZVxuICAjICAgICAgICAgZXJyb3IoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVTeXN0ZW0iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIExJU1RFTiBleHRlbmRzIENvbmZpZ1xuICBsb2NhbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZVxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgZXh0ZXJuYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbFxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgaW5zdGFuY2UgPSBudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgXG4gICAgY2hyb21lLnJ1bnRpbWUub25Db25uZWN0RXh0ZXJuYWwuYWRkTGlzdGVuZXIgKHBvcnQpID0+XG4gICAgICBwb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgICBAbG9jYWwuYXBpLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlXG4gICAgQGV4dGVybmFsLmFwaT8uYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IExJU1RFTlxuXG4gIExvY2FsOiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgQGxvY2FsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgRXh0OiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgc2hvdyAnYWRkaW5nIGV4dCBsaXN0ZW5lciBmb3IgJyArIG1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBfb25NZXNzYWdlRXh0ZXJuYWw6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuXG4gICAgX3NlbmRSZXNwb25zZSA9ICh3aGF0ZXZlci4uLikgPT5cbiAgICAgIHRyeVxuICAgICAgICB3aGF0ZXZlci5zaGlmdCgpIGlmIHdoYXRldmVyWzBdIGlzIG51bGwgXG4gICAgICAgIHNlbmRSZXNwb25zZS5hcHBseSBudWxsLHdoYXRldmVyXG4gICAgICBjYXRjaCBlXG4gICAgICAgIHVuZGVmaW5lZCAjIGVycm9yIGJlY2F1c2Ugbm8gcmVzcG9uc2Ugd2FzIHJlcXVlc3RlZCBmcm9tIHRoZSBNU0csIGRvbid0IGNhcmVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcbiAgICAgIFxuICAgIChzaG93IFwiPD09IEdPVCBFWFRFUk5BTCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgaWYgc2VuZGVyLmlkIGlzbnQgQEVYVF9JRCBhbmQgc2VuZGVyLmNvbnN0cnVjdG9yLm5hbWUgaXNudCAnUG9ydCdcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG4gICAgXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCAjIGZvciBzeW5jaHJvbm91cyBzZW5kUmVzcG9uc2VcbiAgICAgICMgc2hvdyAncmV0dXJuaW5nIHRydWUnXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gIF9vbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuICAgIF9zZW5kUmVzcG9uc2UgPSA9PlxuICAgICAgdHJ5XG4gICAgICAgIHNob3cgJ2NhbGxpbmcgc2VuZHJlc3BvbnNlJ1xuICAgICAgICBzZW5kUmVzcG9uc2UuYXBwbHkgdGhpcyxhcmd1bWVudHNcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgc2hvdyBlXG4gICAgICByZXNwb25zZVN0YXR1cy5jYWxsZWQgPSB0cnVlXG5cbiAgICAoc2hvdyBcIjw9PSBHT1QgTUVTU0FHRSA9PSAjeyBARVhUX1RZUEUgfSA9PVwiICsgX2tleSkgZm9yIF9rZXkgb2YgcmVxdWVzdFxuICAgIEBsb2NhbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBfc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZFxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gTElTVEVOIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBNU0cgZXh0ZW5kcyBDb25maWdcbiAgaW5zdGFuY2UgPSBudWxsXG4gIHBvcnQ6bnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IE1TR1xuXG4gIEBjcmVhdGVQb3J0OiAoKSAtPlxuXG5cbiAgTG9jYWw6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIChzaG93IFwiPT0gTUVTU0FHRSAjeyBfa2V5IH0gPT0+XCIpIGZvciBfa2V5IG9mIG1lc3NhZ2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBtZXNzYWdlLCByZXNwb25kXG4gIEV4dDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFIEVYVEVSTkFMICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIEBFWFRfSUQsIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0UG9ydDogKG1lc3NhZ2UpIC0+XG4gICAgdHJ5XG4gICAgICBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG4gICAgY2F0Y2hcbiAgICAgIEBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuICAgICAgQHBvcnQucG9zdE1lc3NhZ2UgbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1TRyIsIlxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQ2hhbmdlO1xuXG4vKiFcbiAqIENoYW5nZSBvYmplY3QgY29uc3RydWN0b3JcbiAqXG4gKiBUaGUgYGNoYW5nZWAgb2JqZWN0IHBhc3NlZCB0byBPYmplY3Qub2JzZXJ2ZSBjYWxsYmFja3NcbiAqIGlzIGltbXV0YWJsZSBzbyB3ZSBjcmVhdGUgYSBuZXcgb25lIHRvIG1vZGlmeS5cbiAqL1xuXG5mdW5jdGlvbiBDaGFuZ2UgKHBhdGgsIGNoYW5nZSkge1xuICB0aGlzLnBhdGggPSBwYXRoO1xuICB0aGlzLm5hbWUgPSBjaGFuZ2UubmFtZTtcbiAgdGhpcy50eXBlID0gY2hhbmdlLnR5cGU7XG4gIHRoaXMub2JqZWN0ID0gY2hhbmdlLm9iamVjdDtcbiAgdGhpcy52YWx1ZSA9IGNoYW5nZS5vYmplY3RbY2hhbmdlLm5hbWVdO1xuICB0aGlzLm9sZFZhbHVlID0gY2hhbmdlLm9sZFZhbHVlO1xufVxuXG4iLCIvLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255Om9ic2VydmVcblxudmFyIENoYW5nZSA9IHJlcXVpcmUoJy4vY2hhbmdlJyk7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbi8vIHZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ29ic2VydmVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IE9ic2VydmFibGU7XG5cbi8qKlxuICogT2JzZXJ2YWJsZSBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBUaGUgcGFzc2VkIGBzdWJqZWN0YCB3aWxsIGJlIG9ic2VydmVkIGZvciBjaGFuZ2VzIHRvXG4gKiBhbGwgcHJvcGVydGllcywgaW5jbHVkZWQgbmVzdGVkIG9iamVjdHMgYW5kIGFycmF5cy5cbiAqXG4gKiBBbiBgRXZlbnRFbWl0dGVyYCB3aWxsIGJlIHJldHVybmVkLiBUaGlzIGVtaXR0ZXIgd2lsbFxuICogZW1pdCB0aGUgZm9sbG93aW5nIGV2ZW50czpcbiAqXG4gKiAtIGFkZFxuICogLSB1cGRhdGVcbiAqIC0gZGVsZXRlXG4gKiAtIHJlY29uZmlndXJlXG4gKlxuICogLy8gLSBzZXRQcm90b3R5cGU/XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHN1YmplY3RcbiAqIEBwYXJhbSB7T2JzZXJ2YWJsZX0gW3BhcmVudF0gKGludGVybmFsIHVzZSlcbiAqIEBwYXJhbSB7U3RyaW5nfSBbcHJlZml4XSAoaW50ZXJuYWwgdXNlKVxuICogQHJldHVybiB7RXZlbnRFbWl0dGVyfVxuICovXG5cbmZ1bmN0aW9uIE9ic2VydmFibGUgKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KSB7XG4gIGlmICgnb2JqZWN0JyAhPSB0eXBlb2Ygc3ViamVjdClcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvYmplY3QgZXhwZWN0ZWQuIGdvdDogJyArIHR5cGVvZiBzdWJqZWN0KTtcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgT2JzZXJ2YWJsZSkpXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KTtcblxuICAvLyBkZWJ1ZygnbmV3Jywgc3ViamVjdCwgISFwYXJlbnQsIHByZWZpeCk7XG5cbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9iaW5kKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KTtcbn07XG5cbi8vIGFkZCBlbWl0dGVyIGNhcGFiaWxpdGllc1xuZm9yICh2YXIgaSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICBPYnNlcnZhYmxlLnByb3RvdHlwZVtpXSA9IEVtaXR0ZXIucHJvdG90eXBlW2ldO1xufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5vYnNlcnZlcnMgPSB1bmRlZmluZWQ7XG5PYnNlcnZhYmxlLnByb3RvdHlwZS5vbmNoYW5nZSA9IHVuZGVmaW5lZDtcbk9ic2VydmFibGUucHJvdG90eXBlLnN1YmplY3QgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogQmluZHMgdGhpcyBPYnNlcnZhYmxlIHRvIGBzdWJqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc3ViamVjdFxuICogQHBhcmFtIHtPYnNlcnZhYmxlfSBbcGFyZW50XVxuICogQHBhcmFtIHtTdHJpbmd9IFtwcmVmaXhdXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5fYmluZCA9IGZ1bmN0aW9uIChzdWJqZWN0LCBwYXJlbnQsIHByZWZpeCkge1xuICBpZiAodGhpcy5zdWJqZWN0KSB0aHJvdyBuZXcgRXJyb3IoJ2FscmVhZHkgYm91bmQhJyk7XG4gIGlmIChudWxsID09IHN1YmplY3QpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N1YmplY3QgY2Fubm90IGJlIG51bGwnKTtcblxuICAvLyBkZWJ1ZygnX2JpbmQnLCBzdWJqZWN0KTtcblxuICB0aGlzLnN1YmplY3QgPSBzdWJqZWN0O1xuXG4gIGlmIChwYXJlbnQpIHtcbiAgICBwYXJlbnQub2JzZXJ2ZXJzLnB1c2godGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5vYnNlcnZlcnMgPSBbdGhpc107XG4gIH1cblxuICB0aGlzLm9uY2hhbmdlID0gb25jaGFuZ2UocGFyZW50IHx8IHRoaXMsIHByZWZpeCk7XG4gIC8vIE9iamVjdC5vYnNlcnZlKHRoaXMuc3ViamVjdCwgdGhpcy5vbmNoYW5nZSk7XG4gIE9iamVjdC5vYnNlcnZlKHRoaXMuc3ViamVjdCwgdGhpcy5vbmNoYW5nZSk7XG4gIHRoaXMuX3dhbGsocGFyZW50IHx8IHRoaXMsIHByZWZpeCk7XG59XG5cbi8qKlxuICogUGVuZGluZyBjaGFuZ2UgZXZlbnRzIGFyZSBub3QgZW1pdHRlZCB1bnRpbCBhZnRlciB0aGUgbmV4dFxuICogdHVybiBvZiB0aGUgZXZlbnQgbG9vcC4gVGhpcyBtZXRob2QgZm9yY2VzIHRoZSBlbmdpbmVzIGhhbmRcbiAqIGFuZCB0cmlnZ2VycyBhbGwgZXZlbnRzIG5vdy5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk9ic2VydmFibGUucHJvdG90eXBlLmRlbGl2ZXJDaGFuZ2VzID0gZnVuY3Rpb24gKCkge1xuICAvLyBkZWJ1ZygnZGVsaXZlckNoYW5nZXMnKVxuICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uKG8pIHtcbiAgICBPYmplY3QuZGVsaXZlckNoYW5nZVJlY29yZHMoby5vbmNoYW5nZSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFdhbGsgZG93biB0aHJvdWdoIHRoZSB0cmVlIG9mIG91ciBgc3ViamVjdGAsIG9ic2VydmluZ1xuICogb2JqZWN0cyBhbG9uZyB0aGUgd2F5LlxuICpcbiAqIEBwYXJhbSB7T2JzZXJ2YWJsZX0gW3BhcmVudF1cbiAqIEBwYXJhbSB7U3RyaW5nfSBbcHJlZml4XVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuX3dhbGsgPSBmdW5jdGlvbiAocGFyZW50LCBwcmVmaXgpIHtcbiAgLy8gZGVidWcoJ193YWxrJyk7XG5cbiAgdmFyIG9iamVjdCA9IHRoaXMuc3ViamVjdDtcblxuICAvLyBrZXlzP1xuICBPYmplY3Qua2V5cyhvYmplY3QpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgdmFsdWUgPSBvYmplY3RbbmFtZV07XG5cbiAgICBpZiAoJ29iamVjdCcgIT0gdHlwZW9mIHZhbHVlKSByZXR1cm47XG4gICAgaWYgKG51bGwgPT0gdmFsdWUpIHJldHVybjtcblxuICAgIHZhciBwYXRoID0gcHJlZml4XG4gICAgICA/IHByZWZpeCArICcuJyArIG5hbWVcbiAgICAgIDogbmFtZTtcblxuICAgIG5ldyBPYnNlcnZhYmxlKHZhbHVlLCBwYXJlbnQsIHBhdGgpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTdG9wIGxpc3RlbmluZyB0byBhbGwgYm91bmQgb2JqZWN0c1xuICovXG5cbk9ic2VydmFibGUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGRlYnVnKCdzdG9wJyk7XG5cbiAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaChmdW5jdGlvbiAob2JzZXJ2ZXIpIHtcbiAgICBPYmplY3QudW5vYnNlcnZlKG9ic2VydmVyLnN1YmplY3QsIG9ic2VydmVyLm9uY2hhbmdlKTtcbiAgfSk7XG59XG5cbi8qKlxuICogU3RvcCBsaXN0ZW5pbmcgdG8gY2hhbmdlcyBvbiBgc3ViamVjdGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc3ViamVjdFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuX3JlbW92ZSA9IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gIC8vIGRlYnVnKCdfcmVtb3ZlJywgc3ViamVjdCk7XG5cbiAgdGhpcy5vYnNlcnZlcnMgPSB0aGlzLm9ic2VydmVycy5maWx0ZXIoZnVuY3Rpb24gKG9ic2VydmVyKSB7XG4gICAgaWYgKHN1YmplY3QgPT0gb2JzZXJ2ZXIuc3ViamVjdCkge1xuICAgICAgT2JqZWN0LnVub2JzZXJ2ZShvYnNlcnZlci5zdWJqZWN0LCBvYnNlcnZlci5vbmNoYW5nZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuXG4vKiFcbiAqIENyZWF0ZXMgYW4gT2JqZWN0Lm9ic2VydmUgYG9uY2hhbmdlYCBsaXN0ZW5lclxuICovXG5cbmZ1bmN0aW9uIG9uY2hhbmdlIChwYXJlbnQsIHByZWZpeCkge1xuICByZXR1cm4gZnVuY3Rpb24gKGFyeSkge1xuICAgIC8vIGRlYnVnKCdvbmNoYW5nZScsIHByZWZpeCk7XG5cbiAgICBhcnkuZm9yRWFjaChmdW5jdGlvbiAoY2hhbmdlKSB7XG4gICAgICB2YXIgb2JqZWN0ID0gY2hhbmdlLm9iamVjdDtcbiAgICAgIHZhciB0eXBlID0gY2hhbmdlLnR5cGU7XG4gICAgICB2YXIgbmFtZSA9IGNoYW5nZS5uYW1lO1xuICAgICAgdmFyIHZhbHVlID0gb2JqZWN0W25hbWVdO1xuXG4gICAgICB2YXIgcGF0aCA9IHByZWZpeFxuICAgICAgICA/IHByZWZpeCArICcuJyArIG5hbWVcbiAgICAgICAgOiBuYW1lXG5cbiAgICAgIGlmICgnYWRkJyA9PSB0eXBlICYmIG51bGwgIT0gdmFsdWUgJiYgJ29iamVjdCcgPT0gdHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIG5ldyBPYnNlcnZhYmxlKHZhbHVlLCBwYXJlbnQsIHBhdGgpO1xuICAgICAgfSBlbHNlIGlmICgnZGVsZXRlJyA9PSB0eXBlICYmICdvYmplY3QnID09IHR5cGVvZiBjaGFuZ2Uub2xkVmFsdWUpIHtcbiAgICAgICAgcGFyZW50Ll9yZW1vdmUoY2hhbmdlLm9sZFZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgY2hhbmdlID0gbmV3IENoYW5nZShwYXRoLCBjaGFuZ2UpO1xuICAgICAgcGFyZW50LmVtaXQodHlwZSwgY2hhbmdlKTtcbiAgICAgIHBhcmVudC5lbWl0KHR5cGUgKyAnICcgKyBwYXRoLCBjaGFuZ2UpO1xuICAgICAgcGFyZW50LmVtaXQoJ2NoYW5nZScsIGNoYW5nZSk7XG4gICAgfSlcbiAgfVxufVxuXG4iLCJjbGFzcyBOb3RpZmljYXRpb25cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgc2hvdzogKHRpdGxlLCBtZXNzYWdlKSAtPlxuICAgIHVuaXF1ZUlkID0gKGxlbmd0aD04KSAtPlxuICAgICAgaWQgPSBcIlwiXG4gICAgICBpZCArPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMikgd2hpbGUgaWQubGVuZ3RoIDwgbGVuZ3RoXG4gICAgICBpZC5zdWJzdHIgMCwgbGVuZ3RoXG5cbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUgdW5pcXVlSWQoKSxcbiAgICAgIHR5cGU6J2Jhc2ljJ1xuICAgICAgdGl0bGU6dGl0bGVcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgIGljb25Vcmw6J2ltYWdlcy9pY29uLTM4LnBuZycsXG4gICAgICAoY2FsbGJhY2spIC0+XG4gICAgICAgIHVuZGVmaW5lZFxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGlmaWNhdGlvbiIsImNsYXNzIFJlZGlyZWN0XG4gIGRhdGE6XG4gICAgdGFiSWQ6XG4gICAgICBsaXN0ZW5lcjpudWxsXG4gICAgICBpc09uOmZhbHNlXG4gIFxuICBwcmVmaXg6bnVsbFxuICBjdXJyZW50TWF0Y2hlczp7fVxuICBjdXJyZW50VGFiSWQ6IG51bGxcbiAgZ2V0TG9jYWxGaWxlUGF0aDogLT5cbiAgIyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNzc1NVxuICAjIHVybDogUmVnRXhwWyckJiddLFxuICAjIHByb3RvY29sOlJlZ0V4cC4kMixcbiAgIyBob3N0OlJlZ0V4cC4kMyxcbiAgIyBwYXRoOlJlZ0V4cC4kNCxcbiAgIyBmaWxlOlJlZ0V4cC4kNiwgLy8gOFxuICAjIHF1ZXJ5OlJlZ0V4cC4kNyxcbiAgIyBoYXNoOlJlZ0V4cC4kOFxuICAgICAgICAgXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gIHRhYjogKHRhYklkKSAtPlxuICAgIEBjdXJyZW50VGFiSWQgPSB0YWJJZFxuICAgIEBkYXRhW3RhYklkXSA/PSB7fVxuICAgIHRoaXNcblxuICB3aXRoUHJlZml4OiAocHJlZml4KSA9PlxuICAgIEBwcmVmaXggPSBwcmVmaXhcbiAgICB0aGlzXG5cbiAgd2l0aERpcmVjdG9yaWVzOiAoZGlyZWN0b3JpZXMpIC0+XG4gICAgaWYgZGlyZWN0b3JpZXM/Lmxlbmd0aCBpcyAwXG4gICAgICBAZGF0YVtAY3VycmVudFRhYklkXS5kaXJlY3RvcmllcyA9IFtdIFxuICAgICAgQF9zdG9wIEBjdXJyZW50VGFiSWRcbiAgICBlbHNlICNpZiBPYmplY3Qua2V5cyhAZGF0YVtAY3VycmVudFRhYklkXSkubGVuZ3RoIGlzIDBcbiAgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLmRpcmVjdG9yaWVzID0gZGlyZWN0b3JpZXNcbiAgICAgIEBzdGFydCgpXG4gICAgdGhpcyAgICBcblxuICB3aXRoTWFwczogKG1hcHMpIC0+XG4gICAgaWYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobWFwcykubGVuZ3RoIGlzIDBcbiAgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHMgPSB7fSBcbiAgICAgIEBfc3RvcCBAY3VycmVudFRhYklkXG4gICAgZWxzZSAjaWYgT2JqZWN0LmtleXMoQGRhdGFbQGN1cnJlbnRUYWJJZF0pLmxlbmd0aCBpcyAwXG4gICAgICBAZGF0YVtAY3VycmVudFRhYklkXS5tYXBzID0gbWFwc1xuICAgICAgQHN0YXJ0KClcbiAgICB0aGlzXG5cbiAgc3RhcnQ6IC0+XG4gICAgdW5sZXNzIEBkYXRhW0BjdXJyZW50VGFiSWRdLmxpc3RlbmVyXG4gICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QucmVtb3ZlTGlzdGVuZXIgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubGlzdGVuZXJcblxuICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLmxpc3RlbmVyID0gQGNyZWF0ZVJlZGlyZWN0TGlzdGVuZXIoKVxuICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLmlzT24gPSB0cnVlXG4gICAgQF9zdGFydCBAY3VycmVudFRhYklkXG5cbiAga2lsbEFsbDogKCkgLT5cbiAgICBAX3N0b3AgdGFiSWQgZm9yIHRhYklkIG9mIEBkYXRhXG5cbiAgX3N0b3A6ICh0YWJJZCkgLT5cbiAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QucmVtb3ZlTGlzdGVuZXIgQGRhdGFbdGFiSWRdLmxpc3RlbmVyXG5cbiAgX3N0YXJ0OiAodGFiSWQpIC0+XG4gICAgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVSZXF1ZXN0LmFkZExpc3RlbmVyIEBkYXRhW3RhYklkXS5saXN0ZW5lcixcbiAgICAgIHVybHM6Wyc8YWxsX3VybHM+J11cbiAgICAgIHRhYklkOkBjdXJyZW50VGFiSWQsXG4gICAgICBbJ2Jsb2NraW5nJ11cblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIHRvZ2dsZTogKCkgLT5cbiAgICAgIEBzdGF0dXNbQGN1cnJlbnRUYWJJZF0gPSB0cnVlIHVubGVzcyBAc3RhdHVzW0BjdXJyZW50VGFiSWRdP1xuICAgICAgQHN0YXR1c1tAY3VycmVudFRhYklkXSA9ICFAc3RhdHVzW0BjdXJyZW50VGFiSWRdXG5cbiAgICAgIGlmIEBzdGF0dXNbQGN1cnJlbnRUYWJJZF1cbiAgICAgICAgQHN0YXJ0U2VydmVyKClcbiAgICAgICAgQHN0YXJ0KClcbiAgICAgIGVsc2VcbiAgICAgICAgQHN0b3AoKVxuICAgICAgICBAc3RvcFNlcnZlcigpXG5cbiAgY3JlYXRlUmVkaXJlY3RMaXN0ZW5lcjogKCkgLT5cbiAgICAoZGV0YWlscykgPT5cbiAgICAgIHBhdGggPSBAZ2V0TG9jYWxGaWxlUGF0aCBkZXRhaWxzLnVybFxuICAgICAgaWYgcGF0aD9cbiAgICAgICAgcmV0dXJuIHJlZGlyZWN0VXJsOkBwcmVmaXggKyBwYXRoXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiB7fSBcblxuICB0b0RpY3Q6IChvYmosa2V5KSAtPlxuICAgIG9iai5yZWR1Y2UgKChkaWN0LCBfb2JqKSAtPiBkaWN0WyBfb2JqW2tleV0gXSA9IF9vYmogaWYgX29ialtrZXldPzsgcmV0dXJuIGRpY3QpLCB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZGlyZWN0XG4iLCIjVE9ETzogcmV3cml0ZSB0aGlzIGNsYXNzIHVzaW5nIHRoZSBuZXcgY2hyb21lLnNvY2tldHMuKiBhcGkgd2hlbiB5b3UgY2FuIG1hbmFnZSB0byBtYWtlIGl0IHdvcmtcbmNsYXNzIFNlcnZlclxuICBzb2NrZXQ6IGNocm9tZS5zb2NrZXRcbiAgIyB0Y3A6IGNocm9tZS5zb2NrZXRzLnRjcFxuICBob3N0OlwiMTI3LjAuMC4xXCJcbiAgcG9ydDo4MDg5XG4gIG1heENvbm5lY3Rpb25zOjUwMFxuICBzb2NrZXRQcm9wZXJ0aWVzOlxuICAgICAgcGVyc2lzdGVudDp0cnVlXG4gICAgICBuYW1lOidTTFJlZGlyZWN0b3InXG4gIHNvY2tldEluZm86bnVsbFxuICBnZXRMb2NhbEZpbGU6bnVsbFxuICBzb2NrZXRJZHM6W11cbiAgc3RvcHBlZDp0cnVlXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG5cbiAgc3RhcnQ6IChob3N0LHBvcnQsbWF4Q29ubmVjdGlvbnMsIGNiLGVycikgLT5cbiAgICBAaG9zdCA9IGlmIGhvc3Q/IHRoZW4gaG9zdCBlbHNlIEBob3N0XG4gICAgQHBvcnQgPSBpZiBwb3J0PyB0aGVuIHBvcnQgZWxzZSBAcG9ydFxuICAgIEBtYXhDb25uZWN0aW9ucyA9IGlmIG1heENvbm5lY3Rpb25zPyB0aGVuIG1heENvbm5lY3Rpb25zIGVsc2UgQG1heENvbm5lY3Rpb25zXG5cbiAgICBAa2lsbEFsbCAoc3VjY2VzcykgPT5cbiAgICAgIEBzb2NrZXQuY3JlYXRlICd0Y3AnLCB7fSwgKHNvY2tldEluZm8pID0+XG4gICAgICAgIEBzb2NrZXRJZHMgPSBbXVxuICAgICAgICBAc29ja2V0SWRzLnB1c2ggc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCAnc29ja2V0SWRzJzpAc29ja2V0SWRzXG4gICAgICAgIEBzb2NrZXQubGlzdGVuIHNvY2tldEluZm8uc29ja2V0SWQsIEBob3N0LCBAcG9ydCwgKHJlc3VsdCkgPT5cbiAgICAgICAgICBpZiByZXN1bHQgPiAtMVxuICAgICAgICAgICAgc2hvdyAnbGlzdGVuaW5nICcgKyBzb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgICAgICBAc3RvcHBlZCA9IGZhbHNlXG4gICAgICAgICAgICBAc29ja2V0SW5mbyA9IHNvY2tldEluZm9cbiAgICAgICAgICAgIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcbiAgICAgICAgICAgIGNiPyBzb2NrZXRJbmZvXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXJyPyByZXN1bHRcbiAgICAsZXJyP1xuXG5cbiAga2lsbEFsbDogKGNhbGxiYWNrLCBlcnJvcikgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCAnc29ja2V0SWRzJywgKHJlc3VsdCkgPT5cbiAgICAgIHNob3cgJ2dvdCBpZHMnXG4gICAgICBzaG93IHJlc3VsdFxuICAgICAgQHNvY2tldElkcyA9IHJlc3VsdC5zb2NrZXRJZHNcbiAgICAgIHJldHVybiBjYWxsYmFjaz8oKSB1bmxlc3MgQHNvY2tldElkcz9cbiAgICAgIGNudCA9IDBcbiAgICAgIGZvciBzIGluIEBzb2NrZXRJZHNcbiAgICAgICAgZG8gKHMpID0+XG4gICAgICAgICAgY250KytcbiAgICAgICAgICBAc29ja2V0LmdldEluZm8gcywgKHNvY2tldEluZm8pID0+XG4gICAgICAgICAgICBjbnQtLVxuICAgICAgICAgICAgaWYgbm90IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcj9cbiAgICAgICAgICAgICAgQHNvY2tldC5kaXNjb25uZWN0IHNcbiAgICAgICAgICAgICAgQHNvY2tldC5kZXN0cm95IHNcblxuICAgICAgICAgICAgY2FsbGJhY2s/KCkgaWYgY250IGlzIDBcblxuXG4gIHN0b3A6IChjYWxsYmFjaywgZXJyb3IpIC0+XG4gICAgQGtpbGxBbGwgKHN1Y2Nlc3MpID0+XG4gICAgICBAc3RvcHBlZCA9IHRydWVcbiAgICAgIGNhbGxiYWNrPygpXG4gICAgLChlcnJvcikgPT5cbiAgICAgIGVycm9yPyBlcnJvclxuXG5cbiAgX29uUmVjZWl2ZTogKHJlY2VpdmVJbmZvKSA9PlxuICAgIHNob3coXCJDbGllbnQgc29ja2V0ICdyZWNlaXZlJyBldmVudDogc2Q9XCIgKyByZWNlaXZlSW5mby5zb2NrZXRJZFxuICAgICsgXCIsIGJ5dGVzPVwiICsgcmVjZWl2ZUluZm8uZGF0YS5ieXRlTGVuZ3RoKVxuXG4gIF9vbkxpc3RlbjogKHNlcnZlclNvY2tldElkLCByZXN1bHRDb2RlKSA9PlxuICAgIHJldHVybiBzaG93ICdFcnJvciBMaXN0ZW5pbmc6ICcgKyBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSBpZiByZXN1bHRDb2RlIDwgMFxuICAgIEBzZXJ2ZXJTb2NrZXRJZCA9IHNlcnZlclNvY2tldElkXG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdC5hZGRMaXN0ZW5lciBAX29uQWNjZXB0XG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdEVycm9yLmFkZExpc3RlbmVyIEBfb25BY2NlcHRFcnJvclxuICAgIEB0Y3Aub25SZWNlaXZlLmFkZExpc3RlbmVyIEBfb25SZWNlaXZlXG4gICAgIyBzaG93IFwiW1wiK3NvY2tldEluZm8ucGVlckFkZHJlc3MrXCI6XCIrc29ja2V0SW5mby5wZWVyUG9ydCtcIl0gQ29ubmVjdGlvbiBhY2NlcHRlZCFcIjtcbiAgICAjIGluZm8gPSBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAjIEBnZXRGaWxlIHVyaSwgKGZpbGUpIC0+XG4gIF9vbkFjY2VwdEVycm9yOiAoZXJyb3IpIC0+XG4gICAgc2hvdyBlcnJvclxuXG4gIF9vbkFjY2VwdDogKHNvY2tldEluZm8pID0+XG4gICAgIyByZXR1cm4gbnVsbCBpZiBpbmZvLnNvY2tldElkIGlzbnQgQHNlcnZlclNvY2tldElkXG4gICAgc2hvdyhcIlNlcnZlciBzb2NrZXQgJ2FjY2VwdCcgZXZlbnQ6IHNkPVwiICsgc29ja2V0SW5mby5zb2NrZXRJZClcbiAgICBpZiBzb2NrZXRJbmZvPy5zb2NrZXRJZD9cbiAgICAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZCwgKGVyciwgaW5mbykgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gQF93cml0ZUVycm9yIHNvY2tldEluZm8uc29ja2V0SWQsIDQwNCwgaW5mby5rZWVwQWxpdmVcblxuICAgICAgICBAZ2V0TG9jYWxGaWxlIGluZm8sIChlcnIsIGZpbGVFbnRyeSwgZmlsZVJlYWRlcikgPT5cbiAgICAgICAgICBpZiBlcnI/IHRoZW4gQF93cml0ZUVycm9yIHNvY2tldEluZm8uc29ja2V0SWQsIDQwNCwgaW5mby5rZWVwQWxpdmVcbiAgICAgICAgICBlbHNlIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJbmZvLnNvY2tldElkLCBmaWxlRW50cnksIGZpbGVSZWFkZXIsIGluZm8ua2VlcEFsaXZlXG4gICAgZWxzZVxuICAgICAgc2hvdyBcIk5vIHNvY2tldD8hXCJcbiAgICAjIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuXG5cbiAgc3RyaW5nVG9VaW50OEFycmF5OiAoc3RyaW5nKSAtPlxuICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgaSA9IDBcblxuICAgIHdoaWxlIGkgPCBzdHJpbmcubGVuZ3RoXG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgIGkrK1xuICAgIHZpZXdcblxuICBhcnJheUJ1ZmZlclRvU3RyaW5nOiAoYnVmZmVyKSAtPlxuICAgIHN0ciA9IFwiXCJcbiAgICB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgcyA9IDBcblxuICAgIHdoaWxlIHMgPCB1QXJyYXlWYWwubGVuZ3RoXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pXG4gICAgICBzKytcbiAgICBzdHJcblxuICBfd3JpdGUyMDBSZXNwb25zZTogKHNvY2tldElkLCBmaWxlRW50cnksIGZpbGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBjb250ZW50VHlwZSA9IChpZiAoZmlsZS50eXBlIGlzIFwiXCIpIHRoZW4gXCJ0ZXh0L3BsYWluXCIgZWxzZSBmaWxlLnR5cGUpXG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+XG4gICAgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShldi50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgICAgc2hvdyB3cml0ZUluZm9cbiAgICAgICAgIyBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5vbmVycm9yID0gKGVycm9yKSA9PlxuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGZpbGVcblxuXG4gICAgIyBAZW5kIHNvY2tldElkXG4gICAgIyBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICMgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgPT5cbiAgICAjICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAjICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICMgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAjICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJZFxuXG5cbiAgX3JlYWRGcm9tU29ja2V0OiAoc29ja2V0SWQsIGNiKSAtPlxuICAgIEBzb2NrZXQucmVhZCBzb2NrZXRJZCwgKHJlYWRJbmZvKSA9PlxuICAgICAgc2hvdyBcIlJFQURcIiwgcmVhZEluZm9cblxuICAgICAgIyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIGRhdGEgPSBAYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKVxuICAgICAgc2hvdyBkYXRhXG5cbiAgICAgIGlmIGRhdGEuaW5kZXhPZihcIkdFVCBcIikgaXNudCAwXG4gICAgICAgIHJldHVybiBjYj8gJzQwNCdcblxuICAgICAga2VlcEFsaXZlID0gZmFsc2VcbiAgICAgIGtlZXBBbGl2ZSA9IHRydWUgaWYgZGF0YS5pbmRleE9mICdDb25uZWN0aW9uOiBrZWVwLWFsaXZlJyBpc250IC0xXG5cbiAgICAgIHVyaUVuZCA9IGRhdGEuaW5kZXhPZihcIiBcIiwgNClcblxuICAgICAgcmV0dXJuIGVuZCBzb2NrZXRJZCBpZiB1cmlFbmQgPCAwXG5cbiAgICAgIHVyaSA9IGRhdGEuc3Vic3RyaW5nKDQsIHVyaUVuZClcbiAgICAgIGlmIG5vdCB1cmk/XG4gICAgICAgIHJldHVybiBjYj8gJzQwNCdcblxuICAgICAgaW5mbyA9XG4gICAgICAgIHVyaTogdXJpXG4gICAgICAgIGtlZXBBbGl2ZTprZWVwQWxpdmVcbiAgICAgIGluZm8ucmVmZXJlciA9IGRhdGEubWF0Y2goL1JlZmVyZXI6XFxzKC4qKS8pP1sxXVxuICAgICAgI3N1Y2Nlc3NcbiAgICAgIGNiPyBudWxsLCBpbmZvXG5cbiAgZW5kOiAoc29ja2V0SWQsIGtlZXBBbGl2ZSkgLT5cbiAgICAgICMgaWYga2VlcEFsaXZlXG4gICAgICAjICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgIyBlbHNlXG4gICAgQHNvY2tldC5kaXNjb25uZWN0IHNvY2tldElkXG4gICAgQHNvY2tldC5kZXN0cm95IHNvY2tldElkXG4gICAgc2hvdyAnZW5kaW5nICcgKyBzb2NrZXRJZFxuICAgIEBzb2NrZXQuYWNjZXB0IEBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAgX3dyaXRlRXJyb3I6IChzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIC0+XG4gICAgZmlsZSA9IHNpemU6IDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIlxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGVcbiAgICBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiICMoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIlxuICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcnZlclxuIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuIyB3aW5kb3cuT2JzZXJ2YWJsZSA9IHJlcXVpcmUgJy4vb2JzZXJ2ZS5jb2ZmZWUnXG53aW5kb3cuT2JzZXJ2YWJsZSA9IHJlcXVpcmUgJ29ic2VydmVkJ1xuXG5jbGFzcyBTdG9yYWdlXG4gIGFwaTogY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIGRhdGE6IFxuICAgIGN1cnJlbnRSZXNvdXJjZXM6IFtdXG4gIGNhbGxiYWNrOiAoKSAtPlxuICBub3RpZnlPbkNoYW5nZTogKCkgLT5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQG9ic2VydmVyID0gT2JzZXJ2YWJsZSBAZGF0YVxuICAgIEBvYnNlcnZlci5vbiAnY2hhbmdlJywgKGNoYW5nZSkgPT5cbiAgICAgIEBNU0cuRXh0UG9ydCAnZGF0YUNoYW5nZWQnOmNoYW5nZVxuXG4gICAgQExJU1RFTi5FeHQgJ2RhdGFDaGFuZ2VkJywgKGNoYW5nZSkgPT5cbiAgICAgIEBkYXRhID89IHt9XG4gICAgICBfZGF0YSA9IEBkYXRhXG4gICAgICAjIHNob3cgJ2RhdGEgY2hhbmdlZCAnXG4gICAgICAjIHNob3cgY2hhbmdlXG4gICAgICAjIHJldHVybiBpZiBAaXNBcnJheShjaGFuZ2Uub2JqZWN0KVxuXG4gICAgICBAb2JzZXJ2ZXIuc3RvcCgpXG4gICAgICAoKGRhdGEpIC0+XG4gICAgICAgIHN0YWNrID0gY2hhbmdlLnBhdGguc3BsaXQgJy4nXG5cbiAgICAgICAgcmV0dXJuIGRhdGFbc3RhY2tbMF1dID0gY2hhbmdlLnZhbHVlIGlmIG5vdCBkYXRhW3N0YWNrWzBdXT9cblxuICAgICAgICB3aGlsZSBzdGFjay5sZW5ndGggPiAxIFxuICAgICAgICAgIF9zaGlmdCA9IHN0YWNrLnNoaWZ0KClcbiAgICAgICAgICBpZiAvXlxcZCskLy50ZXN0IF9zaGlmdCB0aGVuIF9zaGlmdCA9IHBhcnNlSW50IF9zaGlmdFxuICAgICAgICAgIGRhdGEgPSBkYXRhW19zaGlmdF0gXG5cbiAgICAgICAgX3NoaWZ0ID0gc3RhY2suc2hpZnQoKVxuICAgICAgICBpZiAvXlxcZCskLy50ZXN0IF9zaGlmdCB0aGVuIF9zaGlmdCA9IHBhcnNlSW50IF9zaGlmdFxuICAgICAgICBkYXRhW19zaGlmdF0gPSBjaGFuZ2UudmFsdWVcbiAgICAgICkoQGRhdGEpXG5cbiAgICAgICMgY2hhbmdlLnBhdGggPSBjaGFuZ2UucGF0aC5yZXBsYWNlKC9cXC4oXFxkKylcXC4vZywgJ1skMV0uJykgaWYgQGlzQXJyYXkgY2hhbmdlLm9iamVjdFxuICAgICAgXG5cbiAgICAgIEBzYXZlQWxsKClcbiAgICAgIFxuICAgICAgQG9ic2VydmVyID0gT2JzZXJ2YWJsZSBAZGF0YVxuICAgICAgQG9ic2VydmVyLm9uICdjaGFuZ2UnLCAoY2hhbmdlKSA9PlxuICAgICAgICBATVNHLkV4dFBvcnQgJ2RhdGFDaGFuZ2VkJzpjaGFuZ2VcblxuICAgICMgQG9uQ2hhbmdlZEFsbCgpXG5cbiAgaXNBcnJheTogLT4gXG4gICAgQXJyYXkuaXNBcnJheSB8fCAoIHZhbHVlICkgLT4gcmV0dXJuIHt9LnRvU3RyaW5nLmNhbGwoIHZhbHVlICkgaXMgJ1tvYmplY3QgQXJyYXldJ1xuXG5cbiAgc2F2ZTogKGtleSwgaXRlbSwgY2IpIC0+XG4gICAgb2JqID0ge31cbiAgICBvYmpba2V5XSA9IGl0ZW1cbiAgICBAZGF0YVtrZXldID0gaXRlbVxuICAgIEBhcGkuc2V0IG9iaiwgKHJlcykgPT5cbiAgICAgIGNiPygpXG4gICAgICBAY2FsbGJhY2s/KClcblxuICBzYXZlQWxsQW5kU3luYzogKGRhdGEpIC0+XG4gICAgQHNhdmVBbGwgZGF0YSwgKCkgPT5cbiAgICAgIEBNU0cuRXh0ICdzdG9yYWdlRGF0YSc6QGRhdGFcblxuICBzYXZlQWxsOiAoZGF0YSwgY2IpIC0+XG4gICAgaWYgZGF0YT8gXG4gICAgICBAYXBpLnNldCBkYXRhLCAoKSA9PlxuICAgICAgICBjYj8oKVxuICAgICAgICAjIEBjYWxsYmFjaz8oKVxuICAgIGVsc2VcbiAgICAgIEBhcGkuc2V0IEBkYXRhLCAoKSA9PlxuICAgICAgICBjYj8oKVxuICAgICAgICAjIEBjYWxsYmFjaz8oKVxuICAgICMgc2hvdyAnc2F2ZUFsbCBAZGF0YTogJyArIEBkYXRhLnNvY2tldElkcz9bMF1cbiAgICAjIHNob3cgJ3NhdmVBbGwgZGF0YTogJyArIGRhdGEuc29ja2V0SWRzP1swXVxuXG4gIHJldHJpZXZlOiAoa2V5LCBjYikgLT5cbiAgICBAYXBpLmdldCBrZXksIChyZXN1bHRzKSAtPlxuICAgICAgQGRhdGFbcl0gPSByZXN1bHRzW3JdIGZvciByIG9mIHJlc3VsdHNcbiAgICAgIGlmIGNiPyB0aGVuIGNiIHJlc3VsdHNba2V5XVxuXG4gIHJldHJpZXZlQWxsOiAoY2IpIC0+XG4gICAgQGFwaS5nZXQgKHJlc3VsdCkgPT5cbiAgICAgIEBkYXRhW2NdID0gcmVzdWx0W2NdIGZvciBjIG9mIHJlc3VsdCBcbiAgICAgICMgQGNhbGxiYWNrPyByZXN1bHRcbiAgICAgIGNiPyByZXN1bHRcbiAgICAgIHNob3cgcmVzdWx0XG5cbiAgb25DaGFuZ2VkOiAoa2V5LCBjYikgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsIG5hbWVzcGFjZSkgLT5cbiAgICAgIGlmIGNoYW5nZXNba2V5XT8gYW5kIGNiPyB0aGVuIGNiIGNoYW5nZXNba2V5XS5uZXdWYWx1ZVxuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzXG5cbiAgb25DaGFuZ2VkQWxsOiAoKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcyxuYW1lc3BhY2UpID0+XG4gICAgICBoYXNDaGFuZ2VzID0gZmFsc2VcbiAgICAgIGZvciBjIG9mIGNoYW5nZXMgd2hlbiBjaGFuZ2VzW2NdLm5ld1ZhbHVlICE9IGNoYW5nZXNbY10ub2xkVmFsdWUgYW5kIGMgaXNudCdzb2NrZXRJZHMnXG4gICAgICAgIChjKSA9PiBcbiAgICAgICAgICBAZGF0YVtjXSA9IGNoYW5nZXNbY10ubmV3VmFsdWUgXG4gICAgICAgICAgc2hvdyAnZGF0YSBjaGFuZ2VkOiAnXG4gICAgICAgICAgc2hvdyBjXG4gICAgICAgICAgc2hvdyBAZGF0YVtjXVxuXG4gICAgICAgICAgaGFzQ2hhbmdlcyA9IHRydWVcblxuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzIGlmIGhhc0NoYW5nZXNcbiAgICAgIHNob3cgJ2NoYW5nZWQnIGlmIGhhc0NoYW5nZXNcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlXG4iLCIjIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxNzQyMDkzXG5tb2R1bGUuZXhwb3J0cyA9ICgoKSAtPlxuICBtZXRob2RzID0gW1xuICAgICdhc3NlcnQnLCAnY2xlYXInLCAnY291bnQnLCAnZGVidWcnLCAnZGlyJywgJ2RpcnhtbCcsICdlcnJvcicsXG4gICAgJ2V4Y2VwdGlvbicsICdncm91cCcsICdncm91cENvbGxhcHNlZCcsICdncm91cEVuZCcsICdpbmZvJywgJ2xvZycsXG4gICAgJ21hcmtUaW1lbGluZScsICdwcm9maWxlJywgJ3Byb2ZpbGVFbmQnLCAndGFibGUnLCAndGltZScsICd0aW1lRW5kJyxcbiAgICAndGltZVN0YW1wJywgJ3RyYWNlJywgJ3dhcm4nXVxuICBub29wID0gKCkgLT5cbiAgICAjIHN0dWIgdW5kZWZpbmVkIG1ldGhvZHMuXG4gICAgZm9yIG0gaW4gbWV0aG9kcyAgd2hlbiAgIWNvbnNvbGVbbV1cbiAgICAgIGNvbnNvbGVbbV0gPSBub29wXG5cbiAgaWYgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQ/XG4gICAgd2luZG93LnNob3cgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlKVxuICBlbHNlXG4gICAgd2luZG93LnNob3cgPSAoKSAtPlxuICAgICAgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cylcbikoKVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIl19
