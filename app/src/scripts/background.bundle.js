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


},{"../../common.coffee":2,"../../config.coffee":3,"../../filesystem.coffee":4,"../../server.coffee":10,"../../storage.coffee":11}],2:[function(require,module,exports){
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
          _this.data.currentResources = results;
          return typeof cb === "function" ? cb() : void 0;
        });
      };
    })(this));
  };

  Application.prototype.getLocalFile = function(info, cb, err) {
    var dir, dirName, filePath, foundDir, item, k, url, _i, _len, _maps, _ref, _ref1, _ref2;
    url = info.uri;
    filePath = url;
    dirName = info.uri;
    dirName = ((_ref = dirName.match(/(\/.*?\/)|(\\.*?\\)/)) != null ? _ref[0] : void 0) || '';
    dirName = dirName.substring(0, dirName.length - 1);
    show('looking for ' + dirName);
    _maps = {};
    _ref1 = this.data.maps;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      item = _ref1[_i];
      _maps[item.directory] = item.isOn;
    }
    _ref2 = this.data.directories;
    for (k in _ref2) {
      dir = _ref2[k];
      if (!_maps[k]) {
        continue;
      }
      show('in loop' + dir.relPath);
      if (dir.relPath === dirName) {
        foundDir = dir;
      }
    }
    if (foundDir != null) {
      show('found! ' + foundDir);
      return this.FS.getLocalFile(foundDir, filePath, cb, err);
    } else {
      show('dunno, not found');
      return err();
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

  return Application;

})(Config);

module.exports = Application;


},{"./config.coffee":3,"./filesystem.coffee":4,"./listen.coffee":5,"./msg.coffee":6,"./notification.coffee":9,"./server.coffee":10,"./storage.coffee":11,"./util.coffee":12}],3:[function(require,module,exports){
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
      if (_arguments.length === 0) {
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
var FileSystem,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FileSystem = (function() {
  FileSystem.prototype.api = chrome.fileSystem;

  FileSystem.prototype.retainedDirs = {};

  function FileSystem() {
    this.findFileForQueryString = __bind(this.findFileForQueryString, this);
    this.findFileForPath = __bind(this.findFileForPath, this);
    this.getLocalFile = __bind(this.getLocalFile, this);
  }

  FileSystem.prototype.readFile = function(dirEntry, path, success, error) {
    return this.getFileEntry(dirEntry, path, (function(_this) {
      return function(fileEntry) {
        return fileEntry.file(function(file) {
          return success(fileEntry, file);
        }, function(err) {
          return error(err);
        });
      };
    })(this), (function(_this) {
      return function(err) {
        return error(err);
      };
    })(this));
  };

  FileSystem.prototype.getFileEntry = function(dirEntry, path, success, error) {
    if ((dirEntry != null ? dirEntry.getFile : void 0) != null) {
      return dirEntry.getFile(path, {}, function(fileEntry) {
        return success(fileEntry);
      }, (function(_this) {
        return function(err) {
          return error(err);
        };
      })(this));
    } else {
      return error();
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

  FileSystem.prototype.getLocalFile = function(dir, filePath, cb, error) {
    return chrome.fileSystem.restoreEntry(dir.directoryEntryId, (function(_this) {
      return function(dirEntry) {
        return _this.readFile(dirEntry, filePath, function(fileEntry, file) {
          return typeof cb === "function" ? cb(fileEntry, file) : void 0;
        }, function(_error) {
          return error(_error);
        }, function(_error) {
          return error(_error);
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


},{}],5:[function(require,module,exports){
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


},{"./change":7,"events":13}],9:[function(require,module,exports){
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


},{}],11:[function(require,module,exports){
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


},{"./listen.coffee":5,"./msg.coffee":6,"observed":8}],12:[function(require,module,exports){
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


},{}],13:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9hcHAvc3JjL2JhY2tncm91bmQuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L2NvbW1vbi5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvY29uZmlnLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9maWxlc3lzdGVtLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9saXN0ZW4uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L21zZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL29ic2VydmVkL2xpYi9jaGFuZ2UuanMiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL29ic2VydmVkL2xpYi9vYnNlcnZlZC5qcyIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9ub3RpZmljYXRpb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L3NlcnZlci5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvc3RvcmFnZS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvdXRpbC5jb2ZmZWUiLCIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNFQSxJQUFBLGlFQUFBOztBQUFBLFNBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLFVBQUE7QUFBQSxFQUFBLFVBQUEsR0FB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QyxFQUFvRCxTQUFwRCxFQURZO0lBQUEsRUFIaEI7R0FYZ0I7QUFBQSxDQUFELENBQUEsQ0FBQSxDQUFqQixDQUFBOzs7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMgc2VydmVyID0gcmVxdWlyZSAnLi90Y3Atc2VydmVyLmpzJ1xuXG5nZXRHbG9iYWwgPSAtPlxuICBfZ2V0R2xvYmFsID0gLT5cbiAgICB0aGlzXG5cbiAgX2dldEdsb2JhbCgpXG5cbnJvb3QgPSBnZXRHbG9iYWwoKVxuXG5BcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5jaHJvbWUuYXBwLnJ1bnRpbWUub25MYXVuY2hlZC5hZGRMaXN0ZW5lciAtPlxuICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUgJ2luZGV4Lmh0bWwnLFxuICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgYm91bmRzOlxuICAgICAgICAgIHdpZHRoOjc3MFxuICAgICAgICAgIGhlaWdodDo4MDBcblxuI2FwcCA9IG5ldyBsaWIuQXBwbGljYXRpb25cbiMgY2xhc3MgQXBwQmFja2dyb3VuZCBleHRlbmRzIEFwcGxpY2F0aW9uXG4jICAgICByZXRhaW5lZERpcnM6e31cbiMgICAgIGluaXQ6ICgpIC0+XG4jICAgICAgICAgIyBjaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXJcbiMgICAgICAgICBAU3RvcmFnZS5yZXRyaWV2ZUFsbCAoKSA9PlxuXG4jICAgICAgICAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcblxuIyAgICAgICAgICAgaWYgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXI/IHRoZW4gQFN0b3JhZ2UuZGF0YS5zZXJ2ZXIgPSB7fVxuICAgICAgICAgICAgXG4jICAgICAgICAgICBAbWFwcyA9IEBkYXRhLm1hcHNcblxuIyAgICAgICAgIEBTZXJ2ZXIuZ2V0TG9jYWxGaWxlID0gQGdldExvY2FsRmlsZVxuXG4jICAgICAgICAgIyBATElTVEVOLkV4dCAncmVzb3VyY2VzJywgKHJlc3VsdCkgPT5cbiMgICAgICAgICAjICAgICBAU3RvcmFnZS5zYXZlICdjdXJyZW50UmVzb3VyY2VzJywgcmVzdWx0LCAoc2F2ZWQpID0+XG4jICAgICAgICAgIyAgICAgICAjIEBNU0cuRXh0ICdyZWRpckluZm8nOlxuIyAgICAgICAgICMgICAgICAgIyAgICAgbWF0Y2hpbmdSZXNvdXJjZXM6QGdldE1hdGNoaW5nUmVzb3VyY2VzKClcbiMgICAgICAgICAjICAgICAgICMgICAgIG1hcHM6QG1hcHNcbiMgICAgICAgICAjICAgICAgICMgICAgIHNlcnZlcjpcbiMgICAgICAgICAjICAgICAgICMgICAgICAgICB1cmw6J2h0dHA6Ly8nICsgQFNlcnZlci5ob3N0ICsgJzonICsgQFNlcnZlci5wb3J0ICsgJz9zbHJlZGlyPSdcbiMgICAgICAgICBATElTVEVOLkxvY2FsICdyZXN0YXJ0U2VydmVyJywgKCkgPT4gQHJlc3RhcnRTZXJ2ZXIoKVxuXG4jICAgICAgICAgQExJU1RFTi5Mb2NhbCAnc3RhcnRTZXJ2ZXInLCAoKSA9PiBAc3RhcnRTZXJ2ZXIoKVxuIyAgICAgICAgIEBMSVNURU4uRXh0ICdzdGFydFNlcnZlcicsICgpID0+IFxuIyAgICAgICAgICAgQHN0YXJ0U2VydmVyICgpID0+XG4jICAgICAgICAgICAgIEBTdG9yYWdlLnNhdmVBbGxBbmRTeW5jKClcbiMgICAgICAgICBATElTVEVOLkxvY2FsICdzdG9wU2VydmVyJywgKCkgPT4gQHN0b3BTZXJ2ZXIoKVxuIyAgICAgICAgIEBMSVNURU4uRXh0ICdzdG9wU2VydmVyJywgKCkgPT4gXG4jICAgICAgICAgICBAc3RvcFNlcnZlciAoKSA9PlxuIyAgICAgICAgICAgICBAU3RvcmFnZS5zYXZlQWxsQW5kU3luYygpXG4jICAgICAgICAgIyBAc3RhcnRTZXJ2ZXIoKVxuIyAgICAgICAgICMgdHJ5XG4jICAgICAgICAgIyAgICAgY2hyb21lLmFwcC5ydW50aW1lLm9uUmVzdGFydGVkLmFkZExpc3RlbmVyIEBjbGVhblVwXG4jICAgICAgICAgIyBjYXRjaCBlcnJvclxuIyAgICAgICAgICMgICAgIHNob3cgZXJyb3JcblxuXG4jICAgICBjbGVhblVwOiAoKSAtPlxuIyAgICAgICAgIEBzdG9wU2VydmVyKClcblxuIyAgICAgZ2V0TWF0Y2hpbmdSZXNvdXJjZXM6ICgpIC0+XG4jICAgICAgIG1hdGNoaW5nUmVzb3VyY2VzID0gW11cbiMgICAgICAgZm9yIHJlcyBpbiBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG4jICAgICAgICAgZG8gKHJlcykgPT5cbiMgICAgICAgICAgIGZvciBpdGVtIGluIEBtYXBzIHdoZW4gcmVzLnVybC5tYXRjaChuZXcgUmVnRXhwKGl0ZW0udXJsKSk/IGFuZCBpdGVtLnVybD9cbiMgICAgICAgICAgICAgZG8gKGl0ZW0pID0+XG4jICAgICAgICAgICAgICAgbWF0Y2hpbmdSZXNvdXJjZXMucHVzaCByZXNcbiMgICAgICAgcmV0dXJuIG1hdGNoaW5nUmVzb3VyY2VzXG5cblxuIyAgICAgZ2V0TG9jYWxGaWxlOiAoaW5mbywgY2IsIGVycm9yKSA9PlxuIyAgICAgICB1cmwgPSBpbmZvLnVyaVxuIyAgICAgICB1cmwgPSB1cmwuc3Vic3RyaW5nIDFcbiMgICAgICAgZmlsZVBhdGggPSB1cmxcblxuIyAgICAgICBkaXIgPSBAU3RvcmFnZS5kYXRhLmRpcmVjdG9yaWVzW0BTdG9yYWdlLmRhdGEuY3VycmVudE1hcC5kaXJlY3RvcnldXG5cbiMgICAgICAgaWYgbm90IGRpcj8gdGhlbiByZXR1cm4gZXJyb3IgJ25vIG1hdGNoJ1xuXG4jICAgICAgIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuIyAgICAgICAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiMgICAgICAgICBARlMucmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuIyAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiMgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuIyAgICAgICAgICAgLChfZXJyb3IpID0+IGVycm9yKF9lcnJvcilcbiMgICAgICAgZWxzZVxuIyAgICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuIyAgICAgICAgICAgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0gPSBkaXJFbnRyeVxuIyAgICAgICAgICAgQEZTLnJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiMgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuIyAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuIyAgICAgICAgICAgICAgICwoX2Vycm9yKSA9PiBlcnJvcihfZXJyb3IpXG4jICAgICAgICAgICAsKF9lcnJvcikgPT4gZXJyb3IoX2Vycm9yKVxuXG4jICAgICAgICAgIyBAZmluZEZpbGVGb3JRdWVyeVN0cmluZyBpbmZvLnVyaSwgc3VjY2VzcyxcbiMgICAgICAgICAjICAgICAoZXJyKSA9PlxuIyAgICAgICAgICMgICAgICAgICBAZmluZEZpbGVGb3JQYXRoIGluZm8sIHN1Y2Nlc3MsIGVycm9yXG5cbiMgICAgIGZpbmRGaWxlRm9yUGF0aDogKGluZm8sIHN1Y2Nlc3MsIGVycm9yKSA9PlxuIyAgICAgICAgIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBzdWNjZXNzLCBlcnJvciwgaW5mby5yZWZlcmVyXG5cbiMgICAgIGZpbmRGaWxlRm9yUXVlcnlTdHJpbmc6IChfdXJsLCBjYiwgZXJyb3IsIHJlZmVyZXIpID0+XG4jICAgICAgICAgdXJsID0gZGVjb2RlVVJJQ29tcG9uZW50KF91cmwpLnJlcGxhY2UgLy4qP3NscmVkaXJcXD0vLCAnJ1xuXG4jICAgICAgICAgbWF0Y2ggPSBpdGVtIGZvciBpdGVtIGluIEBtYXBzIHdoZW4gdXJsLm1hdGNoKG5ldyBSZWdFeHAoaXRlbS51cmwpKT8gYW5kIGl0ZW0udXJsPyBhbmQgbm90IG1hdGNoP1xuXG4jICAgICAgICAgaWYgbWF0Y2g/XG4jICAgICAgICAgICAgIGlmIHJlZmVyZXI/XG4jICAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5tYXRjaCgvLipcXC9cXC8uKj9cXC8oLiopLyk/WzFdXG4jICAgICAgICAgICAgIGVsc2VcbiMgICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXRjaC51cmwpLCBtYXRjaC5yZWdleFJlcGxcblxuIyAgICAgICAgICAgICBmaWxlUGF0aC5yZXBsYWNlICcvJywgJ1xcXFwnIGlmIHBsYXRmb3JtIGlzICd3aW4nXG5cbiMgICAgICAgICAgICAgZGlyID0gQFN0b3JhZ2UuZGF0YS5kaXJlY3Rvcmllc1ttYXRjaC5kaXJlY3RvcnldXG5cbiMgICAgICAgICAgICAgaWYgbm90IGRpcj8gdGhlbiByZXR1cm4gZXJyICdubyBtYXRjaCdcblxuIyAgICAgICAgICAgICBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiMgICAgICAgICAgICAgICAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiMgICAgICAgICAgICAgICAgIEBGUy5yZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4jICAgICAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiMgICAgICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiMgICAgICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4jICAgICAgICAgICAgIGVsc2VcbiMgICAgICAgICAgICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuIyAgICAgICAgICAgICAgICAgICAgIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiMgICAgICAgICAgICAgICAgICAgICBARlMucmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuIyAgICAgICAgICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuIyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiMgICAgICAgICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuIyAgICAgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiMgICAgICAgICBlbHNlXG4jICAgICAgICAgICAgIGVycm9yKClcblxuXG4jIENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy5jb2ZmZWUnXG4jIE1TRyA9IHJlcXVpcmUgJy4uLy4uL21zZy5jb2ZmZWUnXG4jIExJU1RFTiA9IHJlcXVpcmUgJy4uLy4uL2xpc3Rlbi5jb2ZmZWUnXG4jIFN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbiMgRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4uLy4uL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnLmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuLi8uLi9maWxlc3lzdGVtLmNvZmZlZSdcblNlcnZlciA9IHJlcXVpcmUgJy4uLy4uL3NlcnZlci5jb2ZmZWUnXG5cbnJvb3QuYXBwID0gbmV3IEFwcGxpY2F0aW9uIFxuICBTdG9yYWdlOiBuZXcgU3RvcmFnZVxuICBGUzogbmV3IEZpbGVTeXN0ZW1cbiAgU2VydmVyOiBuZXcgU2VydmVyXG5cbnJvb3QuYXBwLlNlcnZlci5nZXRMb2NhbEZpbGUgPSBhcHAuZ2V0TG9jYWxGaWxlXG5yb290LmFwcC5TdG9yYWdlLnJldHJpZXZlQWxsKClcbiIsInJlcXVpcmUgJy4vdXRpbC5jb2ZmZWUnXG5Db25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5MSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuTm90aWZpY2F0aW9uID0gcmVxdWlyZSAnLi9ub3RpZmljYXRpb24uY29mZmVlJ1xuU2VydmVyID0gcmVxdWlyZSAnLi9zZXJ2ZXIuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgQ29uZmlnXG4gIExJU1RFTjogbnVsbFxuICBNU0c6IG51bGxcbiAgU3RvcmFnZTogbnVsbFxuICBGUzogbnVsbFxuICBTZXJ2ZXI6IG51bGxcbiAgTm90aWZ5OiBudWxsXG4gIHBsYXRmb3JtOm51bGxcbiAgY3VycmVudFRhYklkOm51bGxcblxuICBjb25zdHJ1Y3RvcjogKGRlcHMpIC0+XG4gICAgc3VwZXJcblxuICAgIEBNU0cgPz0gTVNHLmdldCgpXG4gICAgQExJU1RFTiA/PSBMSVNURU4uZ2V0KClcbiAgICBcbiAgICBmb3IgcHJvcCBvZiBkZXBzXG4gICAgICBpZiB0eXBlb2YgZGVwc1twcm9wXSBpcyBcIm9iamVjdFwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpJbmJvdW5kIGRlcHNbcHJvcF1cbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwiZnVuY3Rpb25cIiBcbiAgICAgICAgQFtwcm9wXSA9IEB3cmFwT2JqT3V0Ym91bmQgbmV3IGRlcHNbcHJvcF1cblxuICAgIEBOb3RpZnkgPz0gKG5ldyBOb3RpZmljYXRpb24pLnNob3cgXG4gICAgIyBAU3RvcmFnZSA/PSBAd3JhcE9iak91dGJvdW5kIG5ldyBTdG9yYWdlIEBkYXRhXG4gICAgIyBARlMgPSBuZXcgRmlsZVN5c3RlbSBcbiAgICAjIEBTZXJ2ZXIgPz0gQHdyYXBPYmpPdXRib3VuZCBuZXcgU2VydmVyXG4gICAgQGRhdGEgPSBAU3RvcmFnZS5kYXRhXG4gICAgXG4gICAgQHdyYXAgPSBpZiBAU0VMRl9UWVBFIGlzICdBUFAnIHRoZW4gQHdyYXBJbmJvdW5kIGVsc2UgQHdyYXBPdXRib3VuZFxuXG4gICAgQG9wZW5BcHAgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ub3BlbkFwcCcsIEBvcGVuQXBwXG4gICAgQGxhdW5jaEFwcCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5sYXVuY2hBcHAnLCBAbGF1bmNoQXBwXG4gICAgQHN0YXJ0U2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnN0YXJ0U2VydmVyJywgQHN0YXJ0U2VydmVyXG4gICAgQHJlc3RhcnRTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ucmVzdGFydFNlcnZlcicsIEByZXN0YXJ0U2VydmVyXG4gICAgQHN0b3BTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uc3RvcFNlcnZlcicsIEBzdG9wU2VydmVyXG4gICAgXG5cbiAgICBAd3JhcCA9IGlmIEBTRUxGX1RZUEUgaXMgJ0VYVEVOU0lPTicgdGhlbiBAd3JhcEluYm91bmQgZWxzZSBAd3JhcE91dGJvdW5kXG5cbiAgICBAZ2V0UmVzb3VyY2VzID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldFJlc291cmNlcycsIEBnZXRSZXNvdXJjZXNcbiAgICBAZ2V0Q3VycmVudFRhYiA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRDdXJyZW50VGFiJywgQGdldEN1cnJlbnRUYWJcblxuICAgIGNocm9tZS5ydW50aW1lLmdldFBsYXRmb3JtSW5mbyAoaW5mbykgPT5cbiAgICAgIEBwbGF0Zm9ybSA9IGluZm9cblxuICAgIEBpbml0KClcblxuICBpbml0OiAoKSAtPlxuICAgIEBkYXRhLnNlcnZlciA9XG4gICAgICBob3N0OlwiMTI3LjAuMC4xXCJcbiAgICAgIHBvcnQ6ODA4OVxuICAgICAgaXNPbjpmYWxzZVxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgbGF1bmNoQXBwOiAoY2IsIGVycm9yKSAtPlxuICAgICAgY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIEBBUFBfSUQsIChleHRJbmZvKSA9PlxuICAgICAgICBpZiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgICBlcnJvciBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNiPyBleHRJbmZvXG5cbiAgb3BlbkFwcDogKCkgPT5cbiAgICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsXG4gICAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgICBib3VuZHM6XG4gICAgICAgICAgd2lkdGg6NzcwXG4gICAgICAgICAgaGVpZ2h0OjgwMCxcbiAgICAgICh3aW4pID0+XG4gICAgICAgIEBhcHBXaW5kb3cgPSB3aW4pIFxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgZ2V0UmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldEN1cnJlbnRUYWIgKHRhYklkKSA9PlxuICAgICAgY2hyb21lLnRhYnMuZXhlY3V0ZVNjcmlwdCB0YWJJZCwgXG4gICAgICAgIGZpbGU6J3NjcmlwdHMvY29udGVudC5qcycsIChyZXN1bHRzKSA9PlxuICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMgPSByZXN1bHRzXG4gICAgICAgICAgY2I/KClcblxuICAjIHVwZGF0ZVJlc291cmNlc0xpc3RlbmVyOiAocmVzb3VyY2VzKSA9PlxuICAjICAgICBzaG93IHJlc291cmNlc1xuICAjICAgICBfcmVzb3VyY2VzID0gW11cblxuICAjICAgICBmb3IgZnJhbWUgaW4gcmVzb3VyY2VzIFxuICAjICAgICAgIGRvIChmcmFtZSkgPT5cbiAgIyAgICAgICAgIGZvciBpdGVtIGluIGZyYW1lIFxuICAjICAgICAgICAgICBkbyAoaXRlbSkgPT5cbiAgIyAgICAgICAgICAgICBfcmVzb3VyY2VzLnB1c2ggaXRlbVxuICAjICAgICBAU3RvcmFnZS5zYXZlICdjdXJyZW50UmVzb3VyY2VzJywgcmVzb3VyY2VzXG4gIGdldExvY2FsRmlsZTogKGluZm8sIGNiLCBlcnIpID0+XG4gICAgdXJsID0gaW5mby51cmlcbiAgICBmaWxlUGF0aCA9IHVybFxuICAgIGRpck5hbWUgPSBpbmZvLnVyaVxuXG4gICAgZGlyTmFtZSA9IGRpck5hbWUubWF0Y2goLyhcXC8uKj9cXC8pfChcXFxcLio/XFxcXCkvKT9bMF0gfHwgJydcbiAgICBkaXJOYW1lID0gZGlyTmFtZS5zdWJzdHJpbmcgMCwgZGlyTmFtZS5sZW5ndGggLSAxXG4gICAgc2hvdyAnbG9va2luZyBmb3IgJyArIGRpck5hbWVcbiAgICBfbWFwcyA9IHt9XG4gICAgX21hcHNbaXRlbS5kaXJlY3RvcnldID0gaXRlbS5pc09uIGZvciBpdGVtIGluIEBkYXRhLm1hcHNcblxuICAgIGZvciBrLCBkaXIgb2YgQGRhdGEuZGlyZWN0b3JpZXMgd2hlbiBfbWFwc1trXVxuICAgICAgc2hvdyAnaW4gbG9vcCcgKyBkaXIucmVsUGF0aFxuICAgICAgaWYgZGlyLnJlbFBhdGggaXMgZGlyTmFtZSB0aGVuIGZvdW5kRGlyID0gZGlyXG5cbiAgICBpZiBmb3VuZERpcj9cbiAgICAgIHNob3cgJ2ZvdW5kISAnICsgZm91bmREaXJcbiAgICAgIEBGUy5nZXRMb2NhbEZpbGUgZm91bmREaXIsIGZpbGVQYXRoLCBjYiwgZXJyXG4gICAgZWxzZVxuICAgICAgc2hvdyAnZHVubm8sIG5vdCBmb3VuZCdcbiAgICAgIGVycigpXG5cbiAgc3RhcnRTZXJ2ZXI6IChjYiwgZXJyKSAtPlxuICAgICAgaWYgQFNlcnZlci5zdG9wcGVkIGlzIHRydWVcbiAgICAgICAgICBAU2VydmVyLnN0YXJ0IEBkYXRhLnNlcnZlci5ob3N0LEBkYXRhLnNlcnZlci5wb3J0LG51bGwsIChzb2NrZXRJbmZvKSA9PlxuICAgICAgICAgICAgICBAZGF0YS5zZXJ2ZXIudXJsID0gJ2h0dHA6Ly8nICsgQGRhdGEuc2VydmVyLmhvc3QgKyAnOicgKyBAZGF0YS5zZXJ2ZXIucG9ydCArICcvJ1xuICAgICAgICAgICAgICBAZGF0YS5zZXJ2ZXIuaXNPbiA9IHRydWVcbiAgICAgICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBTdGFydGVkXCIsIFwiU3RhcnRlZCBTZXJ2ZXIgaHR0cDovLyN7IEBkYXRhLnNlcnZlci5ob3N0IH06I3tAZGF0YS5zZXJ2ZXIucG9ydH1cIlxuICAgICAgICAgICAgICBjYj8oKVxuICAgICAgICAgICwoZXJyb3IpID0+XG4gICAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIkVycm9yIFN0YXJ0aW5nIFNlcnZlcjogI3sgZXJyb3IgfVwiXG4gICAgICAgICAgICAgIEBkYXRhLnNlcnZlci51cmwgPSAnaHR0cDovLycgKyBAZGF0YS5zZXJ2ZXIuaG9zdCArICc6JyArIEBkYXRhLnNlcnZlci5wb3J0ICsgJy8nXG4gICAgICAgICAgICAgIEBkYXRhLnNlcnZlci5pc09uID0gdHJ1ZVxuICAgICAgICAgICAgICBlcnI/KClcblxuICBzdG9wU2VydmVyOiAoY2IsIGVycikgLT5cbiAgICAgIEBTZXJ2ZXIuc3RvcCAoc3VjY2VzcykgPT5cbiAgICAgICAgICBATm90aWZ5ICdTZXJ2ZXIgU3RvcHBlZCcsIFwiU2VydmVyIFN0b3BwZWRcIlxuICAgICAgICAgIEBkYXRhLnNlcnZlci51cmwgPSAnJ1xuICAgICAgICAgIEBkYXRhLnNlcnZlci5pc09uID0gZmFsc2VcbiAgICAgICAgICBjYj8oKVxuICAgICAgLChlcnJvcikgPT5cbiAgICAgICAgICBlcnI/KClcbiAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIEVycm9yXCIsXCJTZXJ2ZXIgY291bGQgbm90IGJlIHN0b3BwZWQ6ICN7IGVycm9yIH1cIlxuXG4gIHJlc3RhcnRTZXJ2ZXI6IC0+XG4gICAgQHN0b3BTZXJ2ZXIgKCkgPT5cbiAgICAgIEBzdGFydFNlcnZlcigpXG5cbiAgY2hhbmdlUG9ydDogPT5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxpY2F0aW9uXG5cblxuIiwiY2xhc3MgQ29uZmlnXG4gICMgQVBQX0lEOiAnY2VjaWZhZnBoZWdob2ZwZmRraGVra2liY2liaGdmZWMnXG4gICMgRVhURU5TSU9OX0lEOiAnZGRkaW1ibmppYmpjYWZib2tuYmdoZWhiZmFqZ2dnZXAnXG4gIEFQUF9JRDogJ2RlbmVmZG9vZm5rZ2ptcGJmcGtuaWhwZ2RoYWhwYmxoJ1xuICBFWFRFTlNJT05fSUQ6ICdpamNqbXBlam9ubWltb29mYmNwYWxpZWpoaWthZW9taCcgIFxuICBTRUxGX0lEOiBjaHJvbWUucnVudGltZS5pZFxuICBpc0NvbnRlbnRTY3JpcHQ6IGxvY2F0aW9uLnByb3RvY29sIGlzbnQgJ2Nocm9tZS1leHRlbnNpb246J1xuICBFWFRfSUQ6IG51bGxcbiAgRVhUX1RZUEU6IG51bGxcbiAgXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIEBFWFRfSUQgPSBpZiBAQVBQX0lEIGlzIEBTRUxGX0lEIHRoZW4gQEVYVEVOU0lPTl9JRCBlbHNlIEBBUFBfSURcbiAgICBARVhUX1RZUEUgPSBpZiBAQVBQX0lEIGlzIEBTRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuICAgIEBTRUxGX1RZUEUgPSBpZiBAQVBQX0lEIGlzbnQgQFNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG5cbiAgd3JhcEluYm91bmQ6IChvYmosIGZuYW1lLCBmKSAtPlxuICAgICAgX2tsYXMgPSBvYmpcbiAgICAgIEBMSVNURU4uRXh0IGZuYW1lLCAoY2FsbGJhY2spIC0+XG4gICAgICAgIF9jYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgICAgIF9hcmd1bWVudHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICBpZiBfYXJndW1lbnRzLmxlbmd0aCBpcyAwXG4gICAgICAgICAgYXJncy5wdXNoIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFyZ3MgPSBfYXJndW1lbnRzXG5cbiAgICAgICAgZi5hcHBseSBfa2xhcywgYXJnc1xuXG4gIHdyYXBPYmpJbmJvdW5kOiAob2JqKSAtPlxuICAgIChvYmpba2V5XSA9IEB3cmFwSW5ib3VuZCBvYmosIG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsga2V5LCBvYmpba2V5XSkgZm9yIGtleSBvZiBvYmogd2hlbiB0eXBlb2Ygb2JqW2tleV0gaXMgXCJmdW5jdGlvblwiXG4gICAgb2JqXG5cbiAgd3JhcE91dGJvdW5kOiAob2JqLCBmbmFtZSwgZikgLT5cbiAgICAtPlxuICAgICAgbXNnID0ge31cbiAgICAgIF9hcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG5cbiAgICAgIGlmIF9hcmdzLmxlbmd0aCBpcyAwXG4gICAgICAgIG1zZ1tmbmFtZV0gPSBudWxsIFxuICAgICAgICByZXR1cm4gQE1TRy5FeHQgbXNnXG5cbiAgICAgIG1zZ1tmbmFtZV0gPSBfYXJnc1xuXG4gICAgICBjYWxsYmFjayA9IG1zZ1tmbmFtZV0ucG9wKClcbiAgICAgIGlmIHR5cGVvZiBjYWxsYmFjayBpc250IFwiZnVuY3Rpb25cIlxuICAgICAgICBtc2dbZm5hbWVdLnB1c2ggY2FsbGJhY2tcbiAgICAgICAgQE1TRy5FeHQgbXNnXG4gICAgICBlbHNlXG4gICAgICAgIEBNU0cuRXh0IG1zZywgY2FsbGJhY2sgXG5cbiAgd3JhcE9iak91dGJvdW5kOiAob2JqKSAtPlxuICAgIChvYmpba2V5XSA9IEB3cmFwT3V0Ym91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpZyIsImNsYXNzIEZpbGVTeXN0ZW1cbiAgYXBpOiBjaHJvbWUuZmlsZVN5c3RlbVxuICByZXRhaW5lZERpcnM6IHt9XG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuXG4gICMgQGRpcnM6IG5ldyBEaXJlY3RvcnlTdG9yZVxuICAjIGZpbGVUb0FycmF5QnVmZmVyOiAoYmxvYiwgb25sb2FkLCBvbmVycm9yKSAtPlxuICAjICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAjICAgcmVhZGVyLm9ubG9hZCA9IG9ubG9hZFxuXG4gICMgICByZWFkZXIub25lcnJvciA9IG9uZXJyb3JcblxuICAjICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGJsb2JcblxuICByZWFkRmlsZTogKGRpckVudHJ5LCBwYXRoLCBzdWNjZXNzLCBlcnJvcikgLT5cbiAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBwYXRoLFxuICAgICAgKGZpbGVFbnRyeSkgPT5cbiAgICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgICAgc3VjY2VzcyhmaWxlRW50cnksIGZpbGUpXG4gICAgICAgICwoZXJyKSA9PiBlcnJvciBlcnJcbiAgICAgICwoZXJyKSA9PiBlcnJvciBlcnJcblxuICBnZXRGaWxlRW50cnk6IChkaXJFbnRyeSwgcGF0aCwgc3VjY2VzcywgZXJyb3IpIC0+XG4gICAgaWYgZGlyRW50cnk/LmdldEZpbGU/XG4gICAgICBkaXJFbnRyeS5nZXRGaWxlIHBhdGgsIHt9LCAoZmlsZUVudHJ5KSAtPlxuICAgICAgICBzdWNjZXNzIGZpbGVFbnRyeVxuICAgICAgLChlcnIpID0+IGVycm9yIGVyclxuICAgIGVsc2UgZXJyb3IoKVxuXG4gICMgb3BlbkRpcmVjdG9yeTogKGNhbGxiYWNrKSAtPlxuICBvcGVuRGlyZWN0b3J5OiAoZGlyZWN0b3J5RW50cnksIGNhbGxiYWNrKSAtPlxuICAjIEBhcGkuY2hvb3NlRW50cnkgdHlwZTonb3BlbkRpcmVjdG9yeScsIChkaXJlY3RvcnlFbnRyeSwgZmlsZXMpID0+XG4gICAgQGFwaS5nZXREaXNwbGF5UGF0aCBkaXJlY3RvcnlFbnRyeSwgKHBhdGhOYW1lKSA9PlxuICAgICAgZGlyID1cbiAgICAgICAgICByZWxQYXRoOiBkaXJlY3RvcnlFbnRyeS5mdWxsUGF0aCAjLnJlcGxhY2UoJy8nICsgZGlyZWN0b3J5RW50cnkubmFtZSwgJycpXG4gICAgICAgICAgZGlyZWN0b3J5RW50cnlJZDogQGFwaS5yZXRhaW5FbnRyeShkaXJlY3RvcnlFbnRyeSlcbiAgICAgICAgICBlbnRyeTogZGlyZWN0b3J5RW50cnlcblxuICAgICAgICBjYWxsYmFjayBwYXRoTmFtZSwgZGlyXG4gICAgICAgICAgIyBAZ2V0T25lRGlyTGlzdCBkaXJcbiAgICAgICAgICAjIFN0b3JhZ2Uuc2F2ZSAnZGlyZWN0b3JpZXMnLCBAc2NvcGUuZGlyZWN0b3JpZXMgKHJlc3VsdCkgLT5cblxuICBnZXRMb2NhbEZpbGU6IChkaXIsIGZpbGVQYXRoLCBjYiwgZXJyb3IpID0+IFxuICAjIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAjICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAjICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgICAgICwoX2Vycm9yKSA9PiBlcnJvcihfZXJyb3IpXG4gICMgZWxzZVxuICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgIyBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICAgICAgICAgLChfZXJyb3IpID0+IGVycm9yKF9lcnJvcilcbiAgICAgICwoX2Vycm9yKSA9PiBlcnJvcihfZXJyb3IpXG5cbiAgICAgICMgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIHN1Y2Nlc3MsXG4gICAgICAjICAgICAoZXJyKSA9PlxuICAgICAgIyAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggaW5mbywgc3VjY2VzcywgZXJyb3JcblxuICBmaW5kRmlsZUZvclBhdGg6IChpbmZvLCBzdWNjZXNzLCBlcnJvcikgPT5cbiAgICAgIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBzdWNjZXNzLCBlcnJvciwgaW5mby5yZWZlcmVyXG5cbiAgZmluZEZpbGVGb3JRdWVyeVN0cmluZzogKF91cmwsIGNiLCBlcnJvciwgcmVmZXJlcikgPT5cbiAgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudChfdXJsKS5yZXBsYWNlIC8uKj9zbHJlZGlyXFw9LywgJydcblxuICAgICAgbWF0Y2ggPSBpdGVtIGZvciBpdGVtIGluIEBtYXBzIHdoZW4gdXJsLm1hdGNoKG5ldyBSZWdFeHAoaXRlbS51cmwpKT8gYW5kIGl0ZW0udXJsPyBhbmQgbm90IG1hdGNoP1xuXG4gICAgICBpZiBtYXRjaD9cbiAgICAgICAgICBpZiByZWZlcmVyP1xuICAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5tYXRjaCgvLipcXC9cXC8uKj9cXC8oLiopLyk/WzFdXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWF0Y2gudXJsKSwgbWF0Y2gucmVnZXhSZXBsXG5cbiAgICAgICAgICBmaWxlUGF0aC5yZXBsYWNlICcvJywgJ1xcXFwnIGlmIHBsYXRmb3JtIGlzICd3aW4nXG5cbiAgICAgICAgICBkaXIgPSBAU3RvcmFnZS5kYXRhLmRpcmVjdG9yaWVzW21hdGNoLmRpcmVjdG9yeV1cblxuICAgICAgICAgIGlmIG5vdCBkaXI/IHRoZW4gcmV0dXJuIGVyciAnbm8gbWF0Y2gnXG5cbiAgICAgICAgICBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgICAgICAgICAgICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICAgICAgICAgICAgICBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICAgICAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICAgICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAgICAgZWxzZVxuICAgICAgICAgIGVycm9yKClcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlU3lzdGVtIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBMSVNURU4gZXh0ZW5kcyBDb25maWdcbiAgbG9jYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGV4dGVybmFsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWxcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGluc3RhbmNlID0gbnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIFxuICAgIGNocm9tZS5ydW50aW1lLm9uQ29ubmVjdEV4dGVybmFsLmFkZExpc3RlbmVyIChwb3J0KSA9PlxuICAgICAgcG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gICAgQGxvY2FsLmFwaS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZVxuICAgIEBleHRlcm5hbC5hcGk/LmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICBAZ2V0OiAoKSAtPlxuICAgIGluc3RhbmNlID89IG5ldyBMSVNURU5cblxuICBMb2NhbDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgIEBsb2NhbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIEV4dDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgIHNob3cgJ2FkZGluZyBleHQgbGlzdGVuZXIgZm9yICcgKyBtZXNzYWdlXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgX29uTWVzc2FnZUV4dGVybmFsOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgcmVzcG9uc2VTdGF0dXMgPSBjYWxsZWQ6ZmFsc2VcbiAgICBfc2VuZFJlc3BvbnNlID0gLT5cbiAgICAgIHRyeVxuICAgICAgICBzaG93ICdjYWxsaW5nIHNlbmRyZXNwb25zZSdcbiAgICAgICAgc2VuZFJlc3BvbnNlLmFwcGx5IG51bGwsYXJndW1lbnRzXG4gICAgICBjYXRjaCBlXG4gICAgICAgIHVuZGVmaW5lZCAjIGVycm9yIGJlY2F1c2Ugbm8gcmVzcG9uc2Ugd2FzIHJlcXVlc3RlZCBmcm9tIHRoZSBNU0csIGRvbid0IGNhcmVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcbiAgICAgIFxuICAgIChzaG93IFwiPD09IEdPVCBFWFRFUk5BTCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgaWYgc2VuZGVyLmlkIGlzbnQgQEVYVF9JRCBhbmQgc2VuZGVyLmNvbnN0cnVjdG9yLm5hbWUgaXNudCAnUG9ydCdcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG4gICAgXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCAjIGZvciBzeW5jaHJvbm91cyBzZW5kUmVzcG9uc2VcbiAgICAgICMgc2hvdyAncmV0dXJuaW5nIHRydWUnXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gIF9vbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuICAgIF9zZW5kUmVzcG9uc2UgPSA9PlxuICAgICAgdHJ5XG4gICAgICAgIHNob3cgJ2NhbGxpbmcgc2VuZHJlc3BvbnNlJ1xuICAgICAgICBzZW5kUmVzcG9uc2UuYXBwbHkgdGhpcyxhcmd1bWVudHNcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgc2hvdyBlXG4gICAgICByZXNwb25zZVN0YXR1cy5jYWxsZWQgPSB0cnVlXG5cbiAgICAoc2hvdyBcIjw9PSBHT1QgTUVTU0FHRSA9PSAjeyBARVhUX1RZUEUgfSA9PVwiICsgX2tleSkgZm9yIF9rZXkgb2YgcmVxdWVzdFxuICAgIEBsb2NhbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBfc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZFxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gTElTVEVOIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBNU0cgZXh0ZW5kcyBDb25maWdcbiAgaW5zdGFuY2UgPSBudWxsXG4gIHBvcnQ6bnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IE1TR1xuXG4gIEBjcmVhdGVQb3J0OiAoKSAtPlxuXG5cbiAgTG9jYWw6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIChzaG93IFwiPT0gTUVTU0FHRSAjeyBfa2V5IH0gPT0+XCIpIGZvciBfa2V5IG9mIG1lc3NhZ2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBtZXNzYWdlLCByZXNwb25kXG4gIEV4dDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFIEVYVEVSTkFMICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIEBFWFRfSUQsIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0UG9ydDogKG1lc3NhZ2UpIC0+XG4gICAgdHJ5XG4gICAgICBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG4gICAgY2F0Y2hcbiAgICAgIEBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuICAgICAgQHBvcnQucG9zdE1lc3NhZ2UgbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1TRyIsIlxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQ2hhbmdlO1xuXG4vKiFcbiAqIENoYW5nZSBvYmplY3QgY29uc3RydWN0b3JcbiAqXG4gKiBUaGUgYGNoYW5nZWAgb2JqZWN0IHBhc3NlZCB0byBPYmplY3Qub2JzZXJ2ZSBjYWxsYmFja3NcbiAqIGlzIGltbXV0YWJsZSBzbyB3ZSBjcmVhdGUgYSBuZXcgb25lIHRvIG1vZGlmeS5cbiAqL1xuXG5mdW5jdGlvbiBDaGFuZ2UgKHBhdGgsIGNoYW5nZSkge1xuICB0aGlzLnBhdGggPSBwYXRoO1xuICB0aGlzLm5hbWUgPSBjaGFuZ2UubmFtZTtcbiAgdGhpcy50eXBlID0gY2hhbmdlLnR5cGU7XG4gIHRoaXMub2JqZWN0ID0gY2hhbmdlLm9iamVjdDtcbiAgdGhpcy52YWx1ZSA9IGNoYW5nZS5vYmplY3RbY2hhbmdlLm5hbWVdO1xuICB0aGlzLm9sZFZhbHVlID0gY2hhbmdlLm9sZFZhbHVlO1xufVxuXG4iLCIvLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255Om9ic2VydmVcblxudmFyIENoYW5nZSA9IHJlcXVpcmUoJy4vY2hhbmdlJyk7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbi8vIHZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ29ic2VydmVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IE9ic2VydmFibGU7XG5cbi8qKlxuICogT2JzZXJ2YWJsZSBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBUaGUgcGFzc2VkIGBzdWJqZWN0YCB3aWxsIGJlIG9ic2VydmVkIGZvciBjaGFuZ2VzIHRvXG4gKiBhbGwgcHJvcGVydGllcywgaW5jbHVkZWQgbmVzdGVkIG9iamVjdHMgYW5kIGFycmF5cy5cbiAqXG4gKiBBbiBgRXZlbnRFbWl0dGVyYCB3aWxsIGJlIHJldHVybmVkLiBUaGlzIGVtaXR0ZXIgd2lsbFxuICogZW1pdCB0aGUgZm9sbG93aW5nIGV2ZW50czpcbiAqXG4gKiAtIGFkZFxuICogLSB1cGRhdGVcbiAqIC0gZGVsZXRlXG4gKiAtIHJlY29uZmlndXJlXG4gKlxuICogLy8gLSBzZXRQcm90b3R5cGU/XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHN1YmplY3RcbiAqIEBwYXJhbSB7T2JzZXJ2YWJsZX0gW3BhcmVudF0gKGludGVybmFsIHVzZSlcbiAqIEBwYXJhbSB7U3RyaW5nfSBbcHJlZml4XSAoaW50ZXJuYWwgdXNlKVxuICogQHJldHVybiB7RXZlbnRFbWl0dGVyfVxuICovXG5cbmZ1bmN0aW9uIE9ic2VydmFibGUgKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KSB7XG4gIGlmICgnb2JqZWN0JyAhPSB0eXBlb2Ygc3ViamVjdClcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvYmplY3QgZXhwZWN0ZWQuIGdvdDogJyArIHR5cGVvZiBzdWJqZWN0KTtcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgT2JzZXJ2YWJsZSkpXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KTtcblxuICAvLyBkZWJ1ZygnbmV3Jywgc3ViamVjdCwgISFwYXJlbnQsIHByZWZpeCk7XG5cbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9iaW5kKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KTtcbn07XG5cbi8vIGFkZCBlbWl0dGVyIGNhcGFiaWxpdGllc1xuZm9yICh2YXIgaSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICBPYnNlcnZhYmxlLnByb3RvdHlwZVtpXSA9IEVtaXR0ZXIucHJvdG90eXBlW2ldO1xufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5vYnNlcnZlcnMgPSB1bmRlZmluZWQ7XG5PYnNlcnZhYmxlLnByb3RvdHlwZS5vbmNoYW5nZSA9IHVuZGVmaW5lZDtcbk9ic2VydmFibGUucHJvdG90eXBlLnN1YmplY3QgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogQmluZHMgdGhpcyBPYnNlcnZhYmxlIHRvIGBzdWJqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc3ViamVjdFxuICogQHBhcmFtIHtPYnNlcnZhYmxlfSBbcGFyZW50XVxuICogQHBhcmFtIHtTdHJpbmd9IFtwcmVmaXhdXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5fYmluZCA9IGZ1bmN0aW9uIChzdWJqZWN0LCBwYXJlbnQsIHByZWZpeCkge1xuICBpZiAodGhpcy5zdWJqZWN0KSB0aHJvdyBuZXcgRXJyb3IoJ2FscmVhZHkgYm91bmQhJyk7XG4gIGlmIChudWxsID09IHN1YmplY3QpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N1YmplY3QgY2Fubm90IGJlIG51bGwnKTtcblxuICAvLyBkZWJ1ZygnX2JpbmQnLCBzdWJqZWN0KTtcblxuICB0aGlzLnN1YmplY3QgPSBzdWJqZWN0O1xuXG4gIGlmIChwYXJlbnQpIHtcbiAgICBwYXJlbnQub2JzZXJ2ZXJzLnB1c2godGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5vYnNlcnZlcnMgPSBbdGhpc107XG4gIH1cblxuICB0aGlzLm9uY2hhbmdlID0gb25jaGFuZ2UocGFyZW50IHx8IHRoaXMsIHByZWZpeCk7XG4gIC8vIE9iamVjdC5vYnNlcnZlKHRoaXMuc3ViamVjdCwgdGhpcy5vbmNoYW5nZSk7XG4gIE9iamVjdC5vYnNlcnZlKHRoaXMuc3ViamVjdCwgdGhpcy5vbmNoYW5nZSk7XG4gIHRoaXMuX3dhbGsocGFyZW50IHx8IHRoaXMsIHByZWZpeCk7XG59XG5cbi8qKlxuICogUGVuZGluZyBjaGFuZ2UgZXZlbnRzIGFyZSBub3QgZW1pdHRlZCB1bnRpbCBhZnRlciB0aGUgbmV4dFxuICogdHVybiBvZiB0aGUgZXZlbnQgbG9vcC4gVGhpcyBtZXRob2QgZm9yY2VzIHRoZSBlbmdpbmVzIGhhbmRcbiAqIGFuZCB0cmlnZ2VycyBhbGwgZXZlbnRzIG5vdy5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbk9ic2VydmFibGUucHJvdG90eXBlLmRlbGl2ZXJDaGFuZ2VzID0gZnVuY3Rpb24gKCkge1xuICAvLyBkZWJ1ZygnZGVsaXZlckNoYW5nZXMnKVxuICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uKG8pIHtcbiAgICBPYmplY3QuZGVsaXZlckNoYW5nZVJlY29yZHMoby5vbmNoYW5nZSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFdhbGsgZG93biB0aHJvdWdoIHRoZSB0cmVlIG9mIG91ciBgc3ViamVjdGAsIG9ic2VydmluZ1xuICogb2JqZWN0cyBhbG9uZyB0aGUgd2F5LlxuICpcbiAqIEBwYXJhbSB7T2JzZXJ2YWJsZX0gW3BhcmVudF1cbiAqIEBwYXJhbSB7U3RyaW5nfSBbcHJlZml4XVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuX3dhbGsgPSBmdW5jdGlvbiAocGFyZW50LCBwcmVmaXgpIHtcbiAgLy8gZGVidWcoJ193YWxrJyk7XG5cbiAgdmFyIG9iamVjdCA9IHRoaXMuc3ViamVjdDtcblxuICAvLyBrZXlzP1xuICBPYmplY3Qua2V5cyhvYmplY3QpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgdmFsdWUgPSBvYmplY3RbbmFtZV07XG5cbiAgICBpZiAoJ29iamVjdCcgIT0gdHlwZW9mIHZhbHVlKSByZXR1cm47XG4gICAgaWYgKG51bGwgPT0gdmFsdWUpIHJldHVybjtcblxuICAgIHZhciBwYXRoID0gcHJlZml4XG4gICAgICA/IHByZWZpeCArICcuJyArIG5hbWVcbiAgICAgIDogbmFtZTtcblxuICAgIG5ldyBPYnNlcnZhYmxlKHZhbHVlLCBwYXJlbnQsIHBhdGgpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTdG9wIGxpc3RlbmluZyB0byBhbGwgYm91bmQgb2JqZWN0c1xuICovXG5cbk9ic2VydmFibGUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGRlYnVnKCdzdG9wJyk7XG5cbiAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaChmdW5jdGlvbiAob2JzZXJ2ZXIpIHtcbiAgICBPYmplY3QudW5vYnNlcnZlKG9ic2VydmVyLnN1YmplY3QsIG9ic2VydmVyLm9uY2hhbmdlKTtcbiAgfSk7XG59XG5cbi8qKlxuICogU3RvcCBsaXN0ZW5pbmcgdG8gY2hhbmdlcyBvbiBgc3ViamVjdGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc3ViamVjdFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuX3JlbW92ZSA9IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gIC8vIGRlYnVnKCdfcmVtb3ZlJywgc3ViamVjdCk7XG5cbiAgdGhpcy5vYnNlcnZlcnMgPSB0aGlzLm9ic2VydmVycy5maWx0ZXIoZnVuY3Rpb24gKG9ic2VydmVyKSB7XG4gICAgaWYgKHN1YmplY3QgPT0gb2JzZXJ2ZXIuc3ViamVjdCkge1xuICAgICAgT2JqZWN0LnVub2JzZXJ2ZShvYnNlcnZlci5zdWJqZWN0LCBvYnNlcnZlci5vbmNoYW5nZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuXG4vKiFcbiAqIENyZWF0ZXMgYW4gT2JqZWN0Lm9ic2VydmUgYG9uY2hhbmdlYCBsaXN0ZW5lclxuICovXG5cbmZ1bmN0aW9uIG9uY2hhbmdlIChwYXJlbnQsIHByZWZpeCkge1xuICByZXR1cm4gZnVuY3Rpb24gKGFyeSkge1xuICAgIC8vIGRlYnVnKCdvbmNoYW5nZScsIHByZWZpeCk7XG5cbiAgICBhcnkuZm9yRWFjaChmdW5jdGlvbiAoY2hhbmdlKSB7XG4gICAgICB2YXIgb2JqZWN0ID0gY2hhbmdlLm9iamVjdDtcbiAgICAgIHZhciB0eXBlID0gY2hhbmdlLnR5cGU7XG4gICAgICB2YXIgbmFtZSA9IGNoYW5nZS5uYW1lO1xuICAgICAgdmFyIHZhbHVlID0gb2JqZWN0W25hbWVdO1xuXG4gICAgICB2YXIgcGF0aCA9IHByZWZpeFxuICAgICAgICA/IHByZWZpeCArICcuJyArIG5hbWVcbiAgICAgICAgOiBuYW1lXG5cbiAgICAgIGlmICgnYWRkJyA9PSB0eXBlICYmIG51bGwgIT0gdmFsdWUgJiYgJ29iamVjdCcgPT0gdHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIG5ldyBPYnNlcnZhYmxlKHZhbHVlLCBwYXJlbnQsIHBhdGgpO1xuICAgICAgfSBlbHNlIGlmICgnZGVsZXRlJyA9PSB0eXBlICYmICdvYmplY3QnID09IHR5cGVvZiBjaGFuZ2Uub2xkVmFsdWUpIHtcbiAgICAgICAgcGFyZW50Ll9yZW1vdmUoY2hhbmdlLm9sZFZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgY2hhbmdlID0gbmV3IENoYW5nZShwYXRoLCBjaGFuZ2UpO1xuICAgICAgcGFyZW50LmVtaXQodHlwZSwgY2hhbmdlKTtcbiAgICAgIHBhcmVudC5lbWl0KHR5cGUgKyAnICcgKyBwYXRoLCBjaGFuZ2UpO1xuICAgICAgcGFyZW50LmVtaXQoJ2NoYW5nZScsIGNoYW5nZSk7XG4gICAgfSlcbiAgfVxufVxuXG4iLCJjbGFzcyBOb3RpZmljYXRpb25cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgc2hvdzogKHRpdGxlLCBtZXNzYWdlKSAtPlxuICAgIHVuaXF1ZUlkID0gKGxlbmd0aD04KSAtPlxuICAgICAgaWQgPSBcIlwiXG4gICAgICBpZCArPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMikgd2hpbGUgaWQubGVuZ3RoIDwgbGVuZ3RoXG4gICAgICBpZC5zdWJzdHIgMCwgbGVuZ3RoXG5cbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUgdW5pcXVlSWQoKSxcbiAgICAgIHR5cGU6J2Jhc2ljJ1xuICAgICAgdGl0bGU6dGl0bGVcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgIGljb25Vcmw6J2ltYWdlcy9pY29uLTM4LnBuZycsXG4gICAgICAoY2FsbGJhY2spIC0+XG4gICAgICAgIHVuZGVmaW5lZFxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGlmaWNhdGlvbiIsIiNUT0RPOiByZXdyaXRlIHRoaXMgY2xhc3MgdXNpbmcgdGhlIG5ldyBjaHJvbWUuc29ja2V0cy4qIGFwaSB3aGVuIHlvdSBjYW4gbWFuYWdlIHRvIG1ha2UgaXQgd29ya1xuY2xhc3MgU2VydmVyXG4gIHNvY2tldDogY2hyb21lLnNvY2tldFxuICAjIHRjcDogY2hyb21lLnNvY2tldHMudGNwXG4gIGhvc3Q6XCIxMjcuMC4wLjFcIlxuICBwb3J0OjgwODlcbiAgbWF4Q29ubmVjdGlvbnM6NTAwXG4gIHNvY2tldFByb3BlcnRpZXM6XG4gICAgICBwZXJzaXN0ZW50OnRydWVcbiAgICAgIG5hbWU6J1NMUmVkaXJlY3RvcidcbiAgc29ja2V0SW5mbzpudWxsXG4gIGdldExvY2FsRmlsZTpudWxsXG4gIHNvY2tldElkczpbXVxuICBzdG9wcGVkOnRydWVcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuICBzdGFydDogKGhvc3QscG9ydCxtYXhDb25uZWN0aW9ucywgY2IsZXJyKSAtPlxuICAgIEBob3N0ID0gaWYgaG9zdD8gdGhlbiBob3N0IGVsc2UgQGhvc3RcbiAgICBAcG9ydCA9IGlmIHBvcnQ/IHRoZW4gcG9ydCBlbHNlIEBwb3J0XG4gICAgQG1heENvbm5lY3Rpb25zID0gaWYgbWF4Q29ubmVjdGlvbnM/IHRoZW4gbWF4Q29ubmVjdGlvbnMgZWxzZSBAbWF4Q29ubmVjdGlvbnNcblxuICAgIEBraWxsQWxsIChzdWNjZXNzKSA9PlxuICAgICAgQHNvY2tldC5jcmVhdGUgJ3RjcCcsIHt9LCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgQHNvY2tldElkcyA9IFtdXG4gICAgICAgIEBzb2NrZXRJZHMucHVzaCBzb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0ICdzb2NrZXRJZHMnOkBzb2NrZXRJZHNcbiAgICAgICAgQHNvY2tldC5saXN0ZW4gc29ja2V0SW5mby5zb2NrZXRJZCwgQGhvc3QsIEBwb3J0LCAocmVzdWx0KSA9PlxuICAgICAgICAgIGlmIHJlc3VsdCA+IC0xXG4gICAgICAgICAgICBzaG93ICdsaXN0ZW5pbmcgJyArIHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgICAgIEBzdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICAgIEBzb2NrZXRJbmZvID0gc29ja2V0SW5mb1xuICAgICAgICAgICAgQHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuICAgICAgICAgICAgY2I/IHNvY2tldEluZm9cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBlcnI/IHJlc3VsdFxuICAgICxlcnI/XG5cblxuICBraWxsQWxsOiAoY2FsbGJhY2ssIGVycm9yKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0ICdzb2NrZXRJZHMnLCAocmVzdWx0KSA9PlxuICAgICAgc2hvdyAnZ290IGlkcydcbiAgICAgIHNob3cgcmVzdWx0XG4gICAgICBAc29ja2V0SWRzID0gcmVzdWx0LnNvY2tldElkc1xuICAgICAgcmV0dXJuIGNhbGxiYWNrPygpIHVubGVzcyBAc29ja2V0SWRzP1xuICAgICAgY250ID0gMFxuICAgICAgZm9yIHMgaW4gQHNvY2tldElkc1xuICAgICAgICBkbyAocykgPT5cbiAgICAgICAgICBjbnQrK1xuICAgICAgICAgIEBzb2NrZXQuZ2V0SW5mbyBzLCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgICAgIGNudC0tXG4gICAgICAgICAgICBpZiBub3QgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yP1xuICAgICAgICAgICAgICBAc29ja2V0LmRpc2Nvbm5lY3Qgc1xuICAgICAgICAgICAgICBAc29ja2V0LmRlc3Ryb3kgc1xuXG4gICAgICAgICAgICBjYWxsYmFjaz8oKSBpZiBjbnQgaXMgMFxuXG5cbiAgc3RvcDogKGNhbGxiYWNrLCBlcnJvcikgLT5cbiAgICBAa2lsbEFsbCAoc3VjY2VzcykgPT5cbiAgICAgIEBzdG9wcGVkID0gdHJ1ZVxuICAgICAgY2FsbGJhY2s/KClcbiAgICAsKGVycm9yKSA9PlxuICAgICAgZXJyb3I/IGVycm9yXG5cblxuICBfb25SZWNlaXZlOiAocmVjZWl2ZUluZm8pID0+XG4gICAgc2hvdyhcIkNsaWVudCBzb2NrZXQgJ3JlY2VpdmUnIGV2ZW50OiBzZD1cIiArIHJlY2VpdmVJbmZvLnNvY2tldElkXG4gICAgKyBcIiwgYnl0ZXM9XCIgKyByZWNlaXZlSW5mby5kYXRhLmJ5dGVMZW5ndGgpXG5cbiAgX29uTGlzdGVuOiAoc2VydmVyU29ja2V0SWQsIHJlc3VsdENvZGUpID0+XG4gICAgcmV0dXJuIHNob3cgJ0Vycm9yIExpc3RlbmluZzogJyArIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIGlmIHJlc3VsdENvZGUgPCAwXG4gICAgQHNlcnZlclNvY2tldElkID0gc2VydmVyU29ja2V0SWRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0LmFkZExpc3RlbmVyIEBfb25BY2NlcHRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0RXJyb3IuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdEVycm9yXG4gICAgQHRjcC5vblJlY2VpdmUuYWRkTGlzdGVuZXIgQF9vblJlY2VpdmVcbiAgICAjIHNob3cgXCJbXCIrc29ja2V0SW5mby5wZWVyQWRkcmVzcytcIjpcIitzb2NrZXRJbmZvLnBlZXJQb3J0K1wiXSBDb25uZWN0aW9uIGFjY2VwdGVkIVwiO1xuICAgICMgaW5mbyA9IEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICMgQGdldEZpbGUgdXJpLCAoZmlsZSkgLT5cbiAgX29uQWNjZXB0RXJyb3I6IChlcnJvcikgLT5cbiAgICBzaG93IGVycm9yXG5cbiAgX29uQWNjZXB0OiAoc29ja2V0SW5mbykgPT5cbiAgICAjIHJldHVybiBudWxsIGlmIGluZm8uc29ja2V0SWQgaXNudCBAc2VydmVyU29ja2V0SWRcbiAgICBzaG93KFwiU2VydmVyIHNvY2tldCAnYWNjZXB0JyBldmVudDogc2Q9XCIgKyBzb2NrZXRJbmZvLnNvY2tldElkKVxuICAgIGlmIHNvY2tldEluZm8/LnNvY2tldElkP1xuICAgICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkLCAoaW5mbykgPT5cbiAgICAgICAgQGdldExvY2FsRmlsZSBpbmZvLCAoZmlsZUVudHJ5LCBmaWxlUmVhZGVyKSA9PlxuICAgICAgICAgICAgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldEluZm8uc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZVJlYWRlciwgaW5mby5rZWVwQWxpdmVcbiAgICAgICAgLChlcnJvcikgPT5cbiAgICAgICAgICAgIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG4gICAgZWxzZVxuICAgICAgc2hvdyBcIk5vIHNvY2tldD8hXCJcbiAgICAjIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuXG5cbiAgc3RyaW5nVG9VaW50OEFycmF5OiAoc3RyaW5nKSAtPlxuICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgaSA9IDBcblxuICAgIHdoaWxlIGkgPCBzdHJpbmcubGVuZ3RoXG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgIGkrK1xuICAgIHZpZXdcblxuICBhcnJheUJ1ZmZlclRvU3RyaW5nOiAoYnVmZmVyKSAtPlxuICAgIHN0ciA9IFwiXCJcbiAgICB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgcyA9IDBcblxuICAgIHdoaWxlIHMgPCB1QXJyYXlWYWwubGVuZ3RoXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pXG4gICAgICBzKytcbiAgICBzdHJcblxuICBfd3JpdGUyMDBSZXNwb25zZTogKHNvY2tldElkLCBmaWxlRW50cnksIGZpbGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBjb250ZW50VHlwZSA9IChpZiAoZmlsZS50eXBlIGlzIFwiXCIpIHRoZW4gXCJ0ZXh0L3BsYWluXCIgZWxzZSBmaWxlLnR5cGUpXG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+XG4gICAgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShldi50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgICAgc2hvdyB3cml0ZUluZm9cbiAgICAgICAgIyBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5vbmVycm9yID0gKGVycm9yKSA9PlxuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGZpbGVcblxuXG4gICAgIyBAZW5kIHNvY2tldElkXG4gICAgIyBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICMgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgPT5cbiAgICAjICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAjICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICMgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAjICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJZFxuXG5cbiAgX3JlYWRGcm9tU29ja2V0OiAoc29ja2V0SWQsIGNiKSAtPlxuICAgIEBzb2NrZXQucmVhZCBzb2NrZXRJZCwgKHJlYWRJbmZvKSA9PlxuICAgICAgc2hvdyBcIlJFQURcIiwgcmVhZEluZm9cblxuICAgICAgIyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIGRhdGEgPSBAYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKVxuICAgICAgc2hvdyBkYXRhXG5cbiAgICAgIGlmIGRhdGEuaW5kZXhPZihcIkdFVCBcIikgaXNudCAwXG4gICAgICAgIEBlbmQgc29ja2V0SWRcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGtlZXBBbGl2ZSA9IGZhbHNlXG4gICAgICBrZWVwQWxpdmUgPSB0cnVlIGlmIGRhdGEuaW5kZXhPZiAnQ29ubmVjdGlvbjoga2VlcC1hbGl2ZScgaXNudCAtMVxuXG4gICAgICB1cmlFbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIDQpXG5cbiAgICAgIHJldHVybiBlbmQgc29ja2V0SWQgaWYgdXJpRW5kIDwgMFxuXG4gICAgICB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpXG4gICAgICBpZiBub3QgdXJpP1xuICAgICAgICB3cml0ZUVycm9yIHNvY2tldElkLCA0MDQsIGtlZXBBbGl2ZVxuICAgICAgICByZXR1cm5cblxuICAgICAgaW5mbyA9XG4gICAgICAgIHVyaTogdXJpXG4gICAgICAgIGtlZXBBbGl2ZTprZWVwQWxpdmVcbiAgICAgIGluZm8ucmVmZXJlciA9IGRhdGEubWF0Y2goL1JlZmVyZXI6XFxzKC4qKS8pP1sxXVxuICAgICAgI3N1Y2Nlc3NcbiAgICAgIGNiPyBpbmZvXG5cbiAgZW5kOiAoc29ja2V0SWQsIGtlZXBBbGl2ZSkgLT5cbiAgICAgICMgaWYga2VlcEFsaXZlXG4gICAgICAjICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgIyBlbHNlXG4gICAgQHNvY2tldC5kaXNjb25uZWN0IHNvY2tldElkXG4gICAgQHNvY2tldC5kZXN0cm95IHNvY2tldElkXG4gICAgc2hvdyAnZW5kaW5nICcgKyBzb2NrZXRJZFxuICAgIEBzb2NrZXQuYWNjZXB0IEBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAgX3dyaXRlRXJyb3I6IChzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIC0+XG4gICAgZmlsZSA9IHNpemU6IDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIlxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGVcbiAgICBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiICMoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIlxuICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcnZlclxuIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuIyB3aW5kb3cuT2JzZXJ2YWJsZSA9IHJlcXVpcmUgJy4vb2JzZXJ2ZS5jb2ZmZWUnXG53aW5kb3cuT2JzZXJ2YWJsZSA9IHJlcXVpcmUgJ29ic2VydmVkJ1xuXG5jbGFzcyBTdG9yYWdlXG4gIGFwaTogY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIGRhdGE6IFxuICAgIGN1cnJlbnRSZXNvdXJjZXM6IFtdXG4gIGNhbGxiYWNrOiAoKSAtPlxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBAb2JzZXJ2ZXIgPSBPYnNlcnZhYmxlIEBkYXRhXG4gICAgQG9ic2VydmVyLm9uICdjaGFuZ2UnLCAoY2hhbmdlKSA9PlxuICAgICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6Y2hhbmdlXG5cbiAgICBATElTVEVOLkV4dCAnZGF0YUNoYW5nZWQnLCAoY2hhbmdlKSA9PlxuICAgICAgQGRhdGEgPz0ge31cbiAgICAgIF9kYXRhID0gQGRhdGFcbiAgICAgICMgc2hvdyAnZGF0YSBjaGFuZ2VkICdcbiAgICAgICMgc2hvdyBjaGFuZ2VcbiAgICAgICMgcmV0dXJuIGlmIEBpc0FycmF5KGNoYW5nZS5vYmplY3QpXG5cbiAgICAgIEBvYnNlcnZlci5zdG9wKClcbiAgICAgICgoZGF0YSkgLT5cbiAgICAgICAgc3RhY2sgPSBjaGFuZ2UucGF0aC5zcGxpdCAnLidcblxuICAgICAgICByZXR1cm4gZGF0YVtzdGFja1swXV0gPSBjaGFuZ2UudmFsdWUgaWYgbm90IGRhdGFbc3RhY2tbMF1dP1xuXG4gICAgICAgIHdoaWxlIHN0YWNrLmxlbmd0aCA+IDEgXG4gICAgICAgICAgX3NoaWZ0ID0gc3RhY2suc2hpZnQoKVxuICAgICAgICAgIGlmIC9eXFxkKyQvLnRlc3QgX3NoaWZ0IHRoZW4gX3NoaWZ0ID0gcGFyc2VJbnQgX3NoaWZ0XG4gICAgICAgICAgZGF0YSA9IGRhdGFbX3NoaWZ0XSBcblxuICAgICAgICBfc2hpZnQgPSBzdGFjay5zaGlmdCgpXG4gICAgICAgIGlmIC9eXFxkKyQvLnRlc3QgX3NoaWZ0IHRoZW4gX3NoaWZ0ID0gcGFyc2VJbnQgX3NoaWZ0XG4gICAgICAgIGRhdGFbX3NoaWZ0XSA9IGNoYW5nZS52YWx1ZVxuICAgICAgKShAZGF0YSlcblxuICAgICAgIyBjaGFuZ2UucGF0aCA9IGNoYW5nZS5wYXRoLnJlcGxhY2UoL1xcLihcXGQrKVxcLi9nLCAnWyQxXS4nKSBpZiBAaXNBcnJheSBjaGFuZ2Uub2JqZWN0XG4gICAgICBcblxuICAgICAgQHNhdmVBbGwoKVxuICAgICAgXG4gICAgICBAb2JzZXJ2ZXIgPSBPYnNlcnZhYmxlIEBkYXRhXG4gICAgICBAb2JzZXJ2ZXIub24gJ2NoYW5nZScsIChjaGFuZ2UpID0+XG4gICAgICAgIEBNU0cuRXh0UG9ydCAnZGF0YUNoYW5nZWQnOmNoYW5nZVxuXG4gICAgIyBAb25DaGFuZ2VkQWxsKClcblxuICBpc0FycmF5OiAtPiBcbiAgICBBcnJheS5pc0FycmF5IHx8ICggdmFsdWUgKSAtPiByZXR1cm4ge30udG9TdHJpbmcuY2FsbCggdmFsdWUgKSBpcyAnW29iamVjdCBBcnJheV0nXG5cblxuICBzYXZlOiAoa2V5LCBpdGVtLCBjYikgLT5cbiAgICBvYmogPSB7fVxuICAgIG9ialtrZXldID0gaXRlbVxuICAgIEBkYXRhW2tleV0gPSBpdGVtXG4gICAgQGFwaS5zZXQgb2JqLCAocmVzKSA9PlxuICAgICAgY2I/KClcbiAgICAgIEBjYWxsYmFjaz8oKVxuXG4gIHNhdmVBbGxBbmRTeW5jOiAoZGF0YSkgLT5cbiAgICBAc2F2ZUFsbCBkYXRhLCAoKSA9PlxuICAgICAgQE1TRy5FeHQgJ3N0b3JhZ2VEYXRhJzpAZGF0YVxuXG4gIHNhdmVBbGw6IChkYXRhLCBjYikgLT5cbiAgICBpZiBkYXRhPyBcbiAgICAgIEBhcGkuc2V0IGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gICAgICAgICMgQGNhbGxiYWNrPygpXG4gICAgZWxzZVxuICAgICAgQGFwaS5zZXQgQGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gICAgICAgICMgQGNhbGxiYWNrPygpXG4gICAgIyBzaG93ICdzYXZlQWxsIEBkYXRhOiAnICsgQGRhdGEuc29ja2V0SWRzP1swXVxuICAgICMgc2hvdyAnc2F2ZUFsbCBkYXRhOiAnICsgZGF0YS5zb2NrZXRJZHM/WzBdXG5cbiAgcmV0cmlldmU6IChrZXksIGNiKSAtPlxuICAgIEBhcGkuZ2V0IGtleSwgKHJlc3VsdHMpIC0+XG4gICAgICBAZGF0YVtyXSA9IHJlc3VsdHNbcl0gZm9yIHIgb2YgcmVzdWx0c1xuICAgICAgaWYgY2I/IHRoZW4gY2IgcmVzdWx0c1trZXldXG5cbiAgcmV0cmlldmVBbGw6IChjYikgLT5cbiAgICBAYXBpLmdldCAocmVzdWx0KSA9PlxuICAgICAgQGRhdGFbY10gPSByZXN1bHRbY10gZm9yIGMgb2YgcmVzdWx0IFxuICAgICAgIyBAY2FsbGJhY2s/IHJlc3VsdFxuICAgICAgY2I/IHJlc3VsdFxuICAgICAgc2hvdyByZXN1bHRcblxuICBvbkNoYW5nZWQ6IChrZXksIGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgaWYgY2hhbmdlc1trZXldPyBhbmQgY2I/IHRoZW4gY2IgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuICBvbkNoYW5nZWRBbGw6ICgpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLG5hbWVzcGFjZSkgPT5cbiAgICAgIGhhc0NoYW5nZXMgPSBmYWxzZVxuICAgICAgZm9yIGMgb2YgY2hhbmdlcyB3aGVuIGNoYW5nZXNbY10ubmV3VmFsdWUgIT0gY2hhbmdlc1tjXS5vbGRWYWx1ZSBhbmQgYyBpc250J3NvY2tldElkcydcbiAgICAgICAgKGMpID0+IFxuICAgICAgICAgIEBkYXRhW2NdID0gY2hhbmdlc1tjXS5uZXdWYWx1ZSBcbiAgICAgICAgICBzaG93ICdkYXRhIGNoYW5nZWQ6ICdcbiAgICAgICAgICBzaG93IGNcbiAgICAgICAgICBzaG93IEBkYXRhW2NdXG5cbiAgICAgICAgICBoYXNDaGFuZ2VzID0gdHJ1ZVxuXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXMgaWYgaGFzQ2hhbmdlc1xuICAgICAgc2hvdyAnY2hhbmdlZCcgaWYgaGFzQ2hhbmdlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE3NDIwOTNcbm1vZHVsZS5leHBvcnRzID0gKCgpIC0+XG4gIG1ldGhvZHMgPSBbXG4gICAgJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJyxcbiAgICAnZXhjZXB0aW9uJywgJ2dyb3VwJywgJ2dyb3VwQ29sbGFwc2VkJywgJ2dyb3VwRW5kJywgJ2luZm8nLCAnbG9nJyxcbiAgICAnbWFya1RpbWVsaW5lJywgJ3Byb2ZpbGUnLCAncHJvZmlsZUVuZCcsICd0YWJsZScsICd0aW1lJywgJ3RpbWVFbmQnLFxuICAgICd0aW1lU3RhbXAnLCAndHJhY2UnLCAnd2FybiddXG4gIG5vb3AgPSAoKSAtPlxuICAgICMgc3R1YiB1bmRlZmluZWQgbWV0aG9kcy5cbiAgICBmb3IgbSBpbiBtZXRob2RzICB3aGVuICAhY29uc29sZVttXVxuICAgICAgY29uc29sZVttXSA9IG5vb3BcblxuICBpZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZD9cbiAgICB3aW5kb3cuc2hvdyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUpXG4gIGVsc2VcbiAgICB3aW5kb3cuc2hvdyA9ICgpIC0+XG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKVxuKSgpXG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iXX0=
