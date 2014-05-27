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

chrome.runtime.onSuspend.addListener(function() {
  return root.app.Storage.saveAll(null);
});


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
    this.Storage.onDataLoaded = (function(_this) {
      return function(data) {
        _this.Storage.session.server = {};
        _this.Storage.session.server.status = _this.Server.status;
        if (_this.Storage.data.firstTime == null) {
          _this.Storage.data.firstTime = false;
          return _this.Storage.data.maps.push({
            name: 'Salesforce',
            url: 'https.*\/resource(\/[0-9]+)?\/([A-Za-z0-9\-._]+\/)?',
            regexRepl: '',
            isRedirect: true,
            isOn: false
          });
        }
      };
    })(this);
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
    this.getFileMatch = this.wrap(this, 'Application.getFileMatch', this.getFileMatch);
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

  Application.prototype.init = function() {};

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
          _this.data.currentResources.length = 0;
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
    var dir, filePath, _dirs, _i, _len, _ref;
    filePath = info.uri;
    if (filePath == null) {
      return cb('file not found');
    }
    _dirs = [];
    _ref = this.data.directories;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dir = _ref[_i];
      if (dir.isOn) {
        _dirs.push(dir);
      }
    }
    if (filePath.substring(0, 1) === '/') {
      filePath = filePath.substring(1);
    }
    return this.findFileForPath(_dirs, filePath, (function(_this) {
      return function(err, fileEntry, dir) {
        if (err != null) {
          return typeof cb === "function" ? cb(err) : void 0;
        }
        return fileEntry.file(function(file) {
          return typeof cb === "function" ? cb(null, fileEntry, file) : void 0;
        }, function(err) {
          return typeof cb === "function" ? cb(err) : void 0;
        });
      };
    })(this));
  };

  Application.prototype.startServer = function(cb) {
    if (this.Server.status.isOn === false) {
      return this.Server.start(null, null, null, (function(_this) {
        return function(err, socketInfo) {
          if (err != null) {
            _this.Notify("Server Error", "Error Starting Server: " + error);
            return typeof cb === "function" ? cb(err) : void 0;
          } else {
            _this.Notify("Server Started", "Started Server " + _this.Server.status.url);
            return typeof cb === "function" ? cb(null, _this.Server.status) : void 0;
          }
        };
      })(this));
    }
  };

  Application.prototype.stopServer = function(cb) {
    return this.Server.stop((function(_this) {
      return function(err, success) {
        if (err != null) {
          _this.Notify("Server Error", "Server could not be stopped: " + error);
          return typeof cb === "function" ? cb(err) : void 0;
        } else {
          _this.Notify('Server Stopped', "Server Stopped");
          return typeof cb === "function" ? cb(null, _this.Server.status) : void 0;
        }
      };
    })(this));
  };

  Application.prototype.restartServer = function() {
    return this.startServer();
  };

  Application.prototype.changePort = function() {};

  Application.prototype.getLocalFilePathWithRedirect = function(url) {
    var filePath, filePathRegex, map, resPath, _i, _len, _ref, _ref1, _ref2;
    filePathRegex = /^((http[s]?|ftp|chrome-extension|file):\/\/)?\/?([^\/\.]+\.)*?([^\/\.]+\.[^:\/\s\.]{2,3}(\.[^:\/\s\.]‌​{2,3})?)(:\d+)?($|\/)([^#?\s]+)?(.*?)?(#[\w\-]+)?$/;
    if (((_ref = this.data[this.currentTabId]) != null ? _ref.maps : void 0) == null) {
      return null;
    }
    resPath = (_ref1 = url.match(filePathRegex)) != null ? _ref1[8] : void 0;
    if (resPath == null) {
      resPath = url;
    }
    if (resPath == null) {
      return null;
    }
    _ref2 = this.data[this.currentTabId].maps;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      map = _ref2[_i];
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

  Application.prototype.URLtoLocalPath = function(url, cb) {
    var filePath;
    return filePath = this.Redirect.getLocalFilePathWithRedirect(url);
  };

  Application.prototype.getFileMatch = function(filePath, cb) {
    if (filePath == null) {
      return typeof cb === "function" ? cb('file not found') : void 0;
    }
    show('trying ' + filePath);
    return this.findFileForPath(this.data.directories, filePath, (function(_this) {
      return function(err, fileEntry, directory) {
        if (err != null) {
          return typeof cb === "function" ? cb(err) : void 0;
        }
        delete fileEntry.entry;
        _this.data.currentFileMatches[filePath] = {
          fileEntry: chrome.fileSystem.retainEntry(fileEntry),
          filePath: filePath,
          directory: directory
        };
        return typeof cb === "function" ? cb(null, _this.data.currentFileMatches[filePath], directory) : void 0;
      };
    })(this));
  };

  Application.prototype.findFileInDirectories = function(directories, path, cb) {
    var myDirs, _dir, _path;
    myDirs = directories.slice();
    _path = path;
    _dir = myDirs.shift();
    return this.FS.getLocalFileEntry(_dir, _path, (function(_this) {
      return function(err, fileEntry) {
        if (err != null) {
          if (myDirs.length > 0) {
            return _this.findFileInDirectories(myDirs, _path, cb);
          } else {
            return typeof cb === "function" ? cb('not found') : void 0;
          }
        } else {
          return typeof cb === "function" ? cb(null, fileEntry, _dir) : void 0;
        }
      };
    })(this));
  };

  Application.prototype.findFileForPath = function(dirs, path, cb) {
    return this.findFileInDirectories(dirs, path, (function(_this) {
      return function(err, fileEntry, directory) {
        if (err != null) {
          if (path === path.replace(/.*?\//, '')) {
            return typeof cb === "function" ? cb('not found') : void 0;
          } else {
            return _this.findFileForPath(dirs, path.replace(/.*?\//, ''), cb);
          }
        } else {
          return typeof cb === "function" ? cb(null, fileEntry, directory) : void 0;
        }
      };
    })(this));
  };

  Application.prototype.mapAllResources = function(cb) {
    return this.getResources((function(_this) {
      return function() {
        var found, item, localPath, need, notFound, _i, _len, _ref, _results;
        need = _this.data.currentResources.length;
        found = notFound = 0;
        _ref = _this.data.currentResources;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          localPath = _this.URLtoLocalPath(item.url);
          if (localPath != null) {
            _results.push(_this.getFileMatch(localPath, function(err, success) {
              need--;
              show(arguments);
              if (err != null) {
                notFound++;
              } else {
                found++;
              }
              if (need === 0) {
                if (found > 0) {
                  return typeof cb === "function" ? cb(null, 'done') : void 0;
                } else {
                  return typeof cb === "function" ? cb('nothing found') : void 0;
                }
              }
            }));
          } else {
            need--;
            notFound++;
            if (need === 0) {
              _results.push(typeof cb === "function" ? cb('nothing found') : void 0);
            } else {
              _results.push(void 0);
            }
          }
        }
        return _results;
      };
    })(this));
  };

  Application.prototype.setBadgeText = function(text, tabId) {
    var badgeText;
    badgeText = text || '' + Object.keys(this.data.currentFileMatches).length;
    return chrome.browserAction.setBadgeText({
      text: badgeText
    });
  };

  Application.prototype.removeBadgeText = function(tabId) {
    return chrome.browserAction.setBadgeText({
      text: ''
    });
  };

  Application.prototype.lsR = function(dir, onsuccess, onerror) {
    this.results = {};
    return chrome.fileSystem.restoreEntry(dir.directoryEntryId, (function(_this) {
      return function(dirEntry) {
        var dive, ignore, todo;
        todo = 0;
        ignore = /.git|.idea|node_modules|bower_components/;
        dive = function(dir, results) {
          var reader;
          todo++;
          reader = dir.createReader();
          return reader.readEntries(function(entries) {
            var entry, _fn, _i, _len;
            todo--;
            _fn = function(entry) {
              results[entry.fullPath] = entry;
              if (entry.fullPath.match(ignore) === null) {
                if (entry.isDirectory) {
                  todo++;
                  return dive(entry, results);
                }
              }
            };
            for (_i = 0, _len = entries.length; _i < _len; _i++) {
              entry = entries[_i];
              _fn(entry);
            }
            if (todo === 0) {
              return show('onsuccess');
            }
          }, function(error) {
            return todo--;
          });
        };
        return console.log(dive(dirEntry, _this.results));
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
    return this.LISTEN.Ext(fname, function(args) {
      var _ref;
      if ((args != null ? args.isProxy : void 0) != null) {
        if (typeof arguments[1] === "function") {
          if (((_ref = args["arguments"]) != null ? _ref.length : void 0) >= 0) {
            return f.apply(_klas, args["arguments"].concat(arguments[1]));
          } else {
            return f.apply(_klas, [].concat(arguments[1]));
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
        return this.MSG.Ext(msg, (function(_this) {
          return function() {
            var argz, _ref;
            argz = Array.prototype.slice.call(arguments);
            if ((argz != null ? argz.length : void 0) > 0 && (((_ref = argz[0]) != null ? _ref.isProxy : void 0) != null)) {
              return callback.apply(_this, argz[0].isProxy);
            }
          };
        })(this));
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
    this.getLocalFileEntry = __bind(this.getLocalFileEntry, this);
  }

  FileSystem.prototype.readFile = function(dirEntry, path, cb) {
    return this.getFileEntry(dirEntry, path, (function(_this) {
      return function(err, fileEntry) {
        if (err != null) {
          return typeof cb === "function" ? cb(err) : void 0;
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
    var dirEntry;
    dirEntry = chrome.fileSystem.restoreEntry(dir.directoryEntryId, function() {});
    if (dirEntry == null) {
      return chrome.fileSystem.restoreEntry(dir.directoryEntryId, (function(_this) {
        return function(dirEntry) {
          return _this.getFileEntry(dirEntry, filePath, cb);
        };
      })(this));
    } else {
      return this.getFileEntry(dirEntry, filePath, cb);
    }
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
    return this.external.listeners[message] = callback;
  };

  LISTEN.prototype._onMessageExternal = function(request, sender, sendResponse) {
    var key, responseStatus, _base, _sendResponse;
    responseStatus = {
      called: false
    };
    _sendResponse = (function(_this) {
      return function() {
        var e, proxyArgs, whatever;
        whatever = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        try {
          sendResponse.apply(null, proxyArgs = [
            {
              isProxy: whatever
            }
          ]);
        } catch (_error) {
          e = _error;
          void 0;
        }
        return responseStatus.called = true;
      };
    })(this);
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
    var key, responseStatus, _base, _sendResponse;
    responseStatus = {
      called: false
    };
    _sendResponse = (function(_this) {
      return function() {
        var e;
        try {
          sendResponse.apply(_this, arguments);
        } catch (_error) {
          e = _error;
        }
        return responseStatus.called = true;
      };
    })(this);
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
/*
  Tested against Chromium build with Object.observe and acts EXACTLY the same,
  though Chromium build is MUCH faster

  Trying to stay as close to the spec as possible,
  this is a work in progress, feel free to comment/update

  Specification:
    http://wiki.ecmascript.org/doku.php?id=harmony:observe

  Built using parts of:
    https://github.com/tvcutsem/harmony-reflect/blob/master/examples/observer.js

  Limits so far;
    Built using polling... Will update again with polling/getter&setters to make things better at some point

TODO:
  Add support for Object.prototype.watch -> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/watch
*/
"use strict";
if(!Object.observe){
  (function(extend, global){
    var isCallable = (function(toString){
        var s = toString.call(toString),
            u = typeof u;
        return typeof global.alert === "object" ?
          function(f){
            return s === toString.call(f) || (!!f && typeof f.toString == u && typeof f.valueOf == u && /^\s*\bfunction\b/.test("" + f));
          }:
          function(f){
            return s === toString.call(f);
          }
        ;
    })(extend.prototype.toString);
    // isNode & isElement from http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    //Returns true if it is a DOM node
    function isNode(o){
      return (
        typeof Node === "object" ? o instanceof Node :
        o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
      );
    }
    //Returns true if it is a DOM element
    function isElement(o){
      return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
    );
    }
    var _isImmediateSupported = (function(){
      return !!global.setImmediate;
    })();
    var _doCheckCallback = (function(){
      if(_isImmediateSupported){
        return function(f){
          return setImmediate(f);
        };
      }else{
        return function(f){
          return setTimeout(f, 10);
        };
      }
    })();
    var _clearCheckCallback = (function(){
      if(_isImmediateSupported){
        return function(id){
          clearImmediate(id);
        };
      }else{
        return function(id){
          clearTimeout(id);
        };
      }
    })();
    var isNumeric=function(n){
      return !isNaN(parseFloat(n)) && isFinite(n);
    };
    var sameValueNotify = function(x, y){
      if(typeof(x)==='object' && typeof(y)==='object' && x != null && y != null) {
        var aKeys = Object.keys(x).sort();
        var bKeys = Object.keys(y).sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
      }
      if(x===y){
        return x !== 0 || 1 / x === 1 / y;
      }
      return x !== x && y !== y;
    };
    var sameValue = function(x, y){
      if(x===y){
        return x !== 0 || 1 / x === 1 / y;
      }
      return x !== x && y !== y;
    };    
    var isAccessorDescriptor = function(desc){
      if (typeof(desc) === 'undefined'){
        return false;
      }
      return ('get' in desc || 'set' in desc);
    };
    var isDataDescriptor = function(desc){
      if (typeof(desc) === 'undefined'){
        return false;
      }
      return ('value' in desc || 'writable' in desc);
    };
    
    var validateArguments = function(O, callback, accept){
      if(typeof(O)!=='object'){
        // Throw Error
        throw new TypeError("Object.observeObject called on non-object");
      }
      if(isCallable(callback)===false){
        // Throw Error
        throw new TypeError("Object.observeObject: Expecting function");
      }
      if(Object.isFrozen(callback)===true){
        // Throw Error
        throw new TypeError("Object.observeObject: Expecting unfrozen function");
      }
      if (accept !== undefined) {
        if (!Array.isArray(accept)) {
          throw new TypeError("Object.observeObject: Expecting acceptList in the form of an array");
        }
      }
    };

    var Observer = (function(){
      var wraped = [];
      var Observer = function(O, callback, accept){
        validateArguments(O, callback, accept);
        if (!accept) {
          accept = ["add", "update", "delete", "reconfigure", "setPrototype", "preventExtensions"];
        }
        Object.getNotifier(O).addListener(callback, accept);
        if(wraped.indexOf(O)===-1){
          wraped.push(O);
        }else{
          Object.getNotifier(O)._checkPropertyListing();
        }
      };

      Observer.prototype.deliverChangeRecords = function(O){
        Object.getNotifier(O).deliverChangeRecords();
      };

      wraped.lastScanned = 0;
      var f = (function(wrapped){
              return function(){
                var i = 0, l = wrapped.length, startTime = new Date(), takingTooLong=false;
                for(i=wrapped.lastScanned; (i<l)&&(!takingTooLong); i++){
                  Object.getNotifier(wrapped[i])._checkPropertyListing();
                  takingTooLong=((new Date())-startTime)>100; // make sure we don't take more than 100 milliseconds to scan all objects
                }
                wrapped.lastScanned=i<l?i:0; // reset wrapped so we can make sure that we pick things back up
                _doCheckCallback(f);
              };
            })(wraped);
      _doCheckCallback(f);
      return Observer;
    })();

    var Notifier = function(watching){
    var _listeners = [], _acceptLists = [], _updates = [], _updater = false, properties = [], values = [];
      var self = this;
      Object.defineProperty(self, '_watching', {
                  enumerable: true,
                  get: (function(watched){
                    return function(){
                      return watched;
                    };
                  })(watching)
                });
      var wrapProperty = function(object, prop){
        var propType = typeof(object[prop]), descriptor = Object.getOwnPropertyDescriptor(object, prop);
        if((prop==='getNotifier')||isAccessorDescriptor(descriptor)||(!descriptor.enumerable)){
          return false;
        }
        if((object instanceof Array)&&isNumeric(prop)){
          var idx = properties.length;
          properties[idx] = prop;
          values[idx] = object[prop];
          return true;
        }
        (function(idx, prop){
          properties[idx] = prop;
          values[idx] = object[prop];
          Object.defineProperty(object, prop, {
            get: function(){
              return values[idx];
            },
            set: function(value){
              if(!sameValueNotify(values[idx], value))
                Object.getNotifier(object).queueUpdate(object, prop, 'update', values[idx]);
              if(!sameValue(values[idx], value))
                values[idx] = value;
            }
          });
        })(properties.length, prop);
        return true;
      };
      self._checkPropertyListing = function(dontQueueUpdates){
        var object = self._watching, keys = Object.keys(object), i=0, l=keys.length;
        var newKeys = [], oldKeys = properties.slice(0), updates = [];
        var prop, queueUpdates = !dontQueueUpdates, propType, value, idx, aLength;

        if(object instanceof Array){
          aLength = properties.length;
        }

        for(i=0; i<l; i++){
          prop = keys[i];
          value = object[prop];
          propType = typeof(value);
          if((idx = properties.indexOf(prop))===-1){
            if(wrapProperty(object, prop)&&queueUpdates){
              self.queueUpdate(object, prop, 'add', null, object[prop]);
            }
          }else{
            if((object instanceof Array)&&(isNumeric(prop))){
              if(!sameValueNotify(values[idx],value)){
                if(queueUpdates){
                  self.queueUpdate(object, prop, 'update', values[idx], value);
                }
              }
              if(values[idx] !== value)
                values[idx] = value;
            }
            oldKeys.splice(oldKeys.indexOf(prop), 1);
          }
        }

        if(object instanceof Array && object.length !== aLength){
          if(queueUpdates){
            self.queueUpdate(object, 'length', 'update', aLength, object);
          }
        }

        if(queueUpdates){
          l = oldKeys.length;
          for(i=0; i<l; i++){
            idx = properties.indexOf(oldKeys[i]);
            self.queueUpdate(object, oldKeys[i], 'delete', values[idx]);
            properties.splice(idx,1);
            values.splice(idx,1);
          };
        }
      };
      self.addListener = function(callback, accept){
        var idx = _listeners.indexOf(callback);
        if(idx===-1){
          _listeners.push(callback);
          _acceptLists.push(accept);
        }
        else {
          _acceptLists[idx] = accept;
        }
      };
      self.removeListener = function(callback){
        var idx = _listeners.indexOf(callback);
        if(idx>-1){
          _listeners.splice(idx, 1);
          _acceptLists.splice(idx, 1);
        }
      };
      self.listeners = function(){
        return _listeners;
      };
      self.queueUpdate = function(what, prop, type, was){
        this.queueUpdates([{
          type: type,
          object: what,
          name: prop,
          oldValue: was
        }]);
      };
      self.queueUpdates = function(updates){
        var self = this, i = 0, l = updates.length||0, update;
        for(i=0; i<l; i++){
          update = updates[i];
          _updates.push(update);
        }
        if(_updater){
          _clearCheckCallback(_updater);
        }
        _updater = _doCheckCallback(function(){
          _updater = false;
          self.deliverChangeRecords();
        });
      };
      self.deliverChangeRecords = function(){
        var i = 0, l = _listeners.length,
            //keepRunning = true, removed as it seems the actual implementation doesn't do this
            // In response to BUG #5
            retval;
        for(i=0; i<l; i++){
          if(_listeners[i]){
            var currentUpdates;
            if (_acceptLists[i]) {
              currentUpdates = [];
              for (var j = 0, updatesLength = _updates.length; j < updatesLength; j++) {
                if (_acceptLists[i].indexOf(_updates[j].type) !== -1) {
                  currentUpdates.push(_updates[j]);
                }
              }
            }
            else {
              currentUpdates = _updates;
            }
            if (currentUpdates.length) {
              if(_listeners[i]===console.log){
                console.log(currentUpdates);
              }else{
                _listeners[i](currentUpdates);
              }
            }
          }
        }
        /*
        for(i=0; i<l&&keepRunning; i++){
          if(typeof(_listeners[i])==='function'){
            if(_listeners[i]===console.log){
              console.log(_updates);
            }else{
              retval = _listeners[i](_updates);
              if(typeof(retval) === 'boolean'){
                keepRunning = retval;
              }
            }
          }
        }
        */
        _updates=[];
      };
      self.notify = function(changeRecord) {
        if (typeof changeRecord !== "object" || typeof changeRecord.type !== "string") {
          throw new TypeError("Invalid changeRecord with non-string 'type' property");
        }
        changeRecord.object = watching;
        self.queueUpdates([changeRecord]);
      };
      self._checkPropertyListing(true);
    };

    var _notifiers=[], _indexes=[];
    extend.getNotifier = function(O){
    var idx = _indexes.indexOf(O), notifier = idx>-1?_notifiers[idx]:false;
      if(!notifier){
        idx = _indexes.length;
        _indexes[idx] = O;
        notifier = _notifiers[idx] = new Notifier(O);
      }
      return notifier;
    };
    extend.observe = function(O, callback, accept){
      // For Bug 4, can't observe DOM elements tested against canry implementation and matches
      if(!isElement(O)){
        return new Observer(O, callback, accept);
      }
    };
    extend.unobserve = function(O, callback){
      validateArguments(O, callback);
      var idx = _indexes.indexOf(O),
          notifier = idx>-1?_notifiers[idx]:false;
      if (!notifier){
        return;
      }
      notifier.removeListener(callback);
      if (notifier.listeners().length === 0){
        _indexes.splice(idx, 1);
        _notifiers.splice(idx, 1);
      }
    };
  })(Object, this);
}

},{}],8:[function(require,module,exports){

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


},{}],9:[function(require,module,exports){
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
  // var onchan = onchange(parent || this, prefix);
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
      ? prefix + '^^' + name
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

Observable.prototype.pause = function (subject) {
  // debug('stop');

  return this.observers.filter(function (observer) {
    if (subject == observer.subject) {
      observer._isPaused = true;
      return true;
    }

    return false;
  });
}

Observable.prototype.isPaused = function (subject) {
  // debug('stop');

  var paused = this.observers.filter(function (observer) {
    if (subject == observer.subject && observer._isPaused) {
      return true;
    }
    return false;
  });

  if(paused.length > 0) return true;
  return false;

}

Observable.prototype.resume = function (observer) {
  // debug('stop');
  if(observer != null && observer.length > 0 && observer[0].subject != null && observer[0].onchange != null)
  {
     observer[0]._isPaused = false;
  }
  // this.observers.filter(function (observer) {
  //   if (subject == observer.subject) {
  //     Object.observe(observer.subject, observer.onchange);
  //     return true;
  //   }
  //   return false;
  // });
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
    if (subject === observer.subject) {
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
        ? prefix + '^^' + name
        : name
      
      if (Object.prototype.toString.call( change.object ) === '[object Array]' && null != value && 'object' == typeof value) {
        new Observable(value, parent, path);
      }
      else if ('add' == type && null != value && 'object' == typeof value) {
        new Observable(value, parent, path);
      } else if ('delete' == type && 'object' == typeof change.oldValue) {
        parent._remove(change.oldValue);
      }
      if(!parent.isPaused(change.object)) {
        change = new Change(path, change);
        parent.emit(type, change);
        parent.emit(type + ' ' + path, change);
        parent.emit('change', change);
      }
    })
  }
}


},{"./change":8,"events":10}],10:[function(require,module,exports){
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

  Server.prototype.socketProperties = {
    persistent: true,
    name: 'SLRedirector'
  };

  Server.prototype.getLocalFile = null;

  Server.prototype.socketIds = [];

  Server.prototype.status = {
    host: null,
    port: null,
    maxConnections: 50,
    isOn: false,
    socketInfo: null,
    url: null
  };

  function Server() {
    this._onAccept = __bind(this._onAccept, this);
    this._onListen = __bind(this._onListen, this);
    this._onReceive = __bind(this._onReceive, this);
    this.status.host = "127.0.0.1";
    this.status.port = 10012;
    this.status.maxConnections = 50;
    this.status.url = 'http://' + this.status.host + ':' + this.status.port + '/';
    this.status.isOn = false;
  }

  Server.prototype.start = function(host, port, maxConnections, cb) {
    if (host != null) {
      this.status.host = host;
    }
    if (port != null) {
      this.status.port = port;
    }
    if (maxConnections != null) {
      this.status.maxConnections = maxConnections;
    }
    return this.killAll((function(_this) {
      return function(err, success) {
        if (err != null) {
          return typeof cb === "function" ? cb(err) : void 0;
        }
        _this.status.isOn = false;
        return _this.socket.create('tcp', {}, function(socketInfo) {
          _this.status.socketInfo = socketInfo;
          _this.socketIds = [];
          _this.socketIds.push(_this.status.socketInfo.socketId);
          chrome.storage.sync.set({
            'socketIds': _this.socketIds
          });
          return _this.socket.listen(_this.status.socketInfo.socketId, _this.status.host, _this.status.port, function(result) {
            if (result > -1) {
              show('listening ' + _this.status.socketInfo.socketId);
              _this.status.isOn = true;
              _this.socket.accept(_this.status.socketInfo.socketId, _this._onAccept);
              return typeof cb === "function" ? cb(null, _this.status) : void 0;
            } else {
              return typeof cb === "function" ? cb(result) : void 0;
            }
          });
        });
      };
    })(this));
  };

  Server.prototype.killAll = function(cb) {
    return chrome.storage.sync.get('socketIds', (function(_this) {
      return function(result) {
        var cnt, s, _i, _len, _ref, _results;
        _this.socketIds = result.socketIds;
        _this.status.isOn = false;
        if (_this.socketIds == null) {
          return typeof cb === "function" ? cb(null, 'success') : void 0;
        }
        cnt = 0;
        _ref = _this.socketIds;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          _results.push((function(s) {
            cnt++;
            return _this.socket.getInfo(s, function(socketInfo) {
              var _ref1;
              cnt--;
              if (chrome.runtime.lastError == null) {
                if (((_ref1 = _this.status.socketInfo) != null ? _ref1.connected : void 0) || (_this.status.socketInfo == null)) {
                  _this.socket.disconnect(s);
                }
                _this.socket.destroy(s);
              }
              if (cnt === 0) {
                return typeof cb === "function" ? cb(null, 'success') : void 0;
              }
            });
          })(s));
        }
        return _results;
      };
    })(this));
  };

  Server.prototype.stop = function(cb) {
    return this.killAll((function(_this) {
      return function(err, success) {
        if (err != null) {
          return typeof cb === "function" ? cb(err) : void 0;
        } else {
          return typeof cb === "function" ? cb(null, success) : void 0;
        }
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
        keepAlive = false;
        if (data.indexOf('Connection: keep-alive' !== -1)) {
          keepAlive = true;
        }
        if (data.indexOf("GET ") !== 0) {
          return typeof cb === "function" ? cb('404', {
            keepAlive: keepAlive
          }) : void 0;
        }
        uriEnd = data.indexOf(" ", 4);
        if (uriEnd < 0) {
          return end(socketId);
        }
        uri = data.substring(4, uriEnd);
        if (uri == null) {
          return typeof cb === "function" ? cb('404', {
            keepAlive: keepAlive
          }) : void 0;
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
    return this.socket.accept(this.status.socketInfo.socketId, this._onAccept);
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
var LISTEN, MSG, Observable, Storage;

LISTEN = require('./listen.coffee');

MSG = require('./msg.coffee');

require('Object-observe-polyfill');

Observable = require('observed');

Storage = (function() {
  var watchAndNotify;

  Storage.prototype.api = chrome.storage.local;

  Storage.prototype.LISTEN = LISTEN.get();

  Storage.prototype.MSG = MSG.get();

  Storage.prototype.data = {
    currentResources: [],
    directories: [],
    maps: [],
    tabMaps: {},
    currentFileMatches: {}
  };

  Storage.prototype.session = {};

  Storage.prototype.onDataLoaded = function() {};

  Storage.prototype.callback = function() {};

  Storage.prototype.notifyOnChange = function() {};

  function Storage(_onDataLoaded) {
    if (_onDataLoaded != null) {
      this.onDataLoaded = _onDataLoaded;
    }
    this.api.get((function(_this) {
      return function(results) {
        var k;
        for (k in results) {
          _this.data[k] = results[k];
        }
        watchAndNotify(_this, 'dataChanged', _this.data, true);
        return _this.onDataLoaded(_this.data);
      };
    })(this));
    this.init();
  }

  Storage.prototype.init = function() {
    return watchAndNotify(this, 'sessionData', this.session, false);
  };

  Storage.prototype.isArray = function() {
    return Array.isArray || function(value) {
      return {}.toString.call(value) === '[object Array]';
    };
  };

  watchAndNotify = function(_this, msgKey, obj, store) {
    var isArray;
    _this.observer = Observable(obj);
    _this.observer.on('change', function(change) {
      var msg;
      show(change);
      if (store) {
        _this.api.set(obj);
      }
      msg = {};
      msg[msgKey] = change;
      return _this.MSG.ExtPort(msg);
    });
    isArray = Array.isArray || function(value) {
      return {}.toString.call(value) === '[object Array]';
    };
    return _this.LISTEN.Ext(msgKey, function(change) {
      show(change);
      if (obj == null) {
        obj = {};
      }
      return (function(data, api, observer) {
        var newArr, paused, stack, _shift;
        stack = change.path.split('^^');
        if (data[stack[0]] == null) {
          return data[stack[0]] = change.value;
        }
        while (stack.length > 0) {
          _shift = stack.shift();
          if (stack.length > 0 && isArray(data[_shift]) && change.name === stack[0]) {
            newArr = Array.prototype.slice.call(change.object);
            data[_shift] = newArr;
            return;
          }
          if (/^\d+$/.test(_shift)) {
            _shift = parseInt(_shift);
          }
          if (stack.length !== 0) {
            data = data[_shift];
          }
        }
        paused = observer.pause(data);
        data[_shift] = change.value;
        return setTimeout(function() {
          return observer.resume(paused);
        }, 20);
      })(obj, _this.api, _this.observer);
    });
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
    this.observer.stop();
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
          _this.MSG.ExtPort({
            'dataChanged': {
              path: c,
              value: result[c]
            }
          });
        }
        _this.observer = Observable(_this.data);
        _this.observer.on('change', function(change) {
          if (change.name !== 'length') {
            show(change);
            _this.api.set(_this.data);
            return _this.MSG.ExtPort({
              'dataChanged': change
            });
          }
        });
        _this.api.set(_this.data);
        if (typeof cb === "function") {
          cb(result);
        }
        return _this.onDataLoaded(_this.data);
      };
    })(this));
  };

  Storage.prototype.onDataLoaded = function(data) {};

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


},{"./listen.coffee":5,"./msg.coffee":6,"Object-observe-polyfill":7,"observed":9}],14:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvYXBwL3NyYy9iYWNrZ3JvdW5kLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9jb21tb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L2NvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vZGVfbW9kdWxlcy9PYmplY3Qtb2JzZXJ2ZS1wb2x5ZmlsbC9PYmplY3Qub2JzZXJ2ZS5wb2x5LmpzIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vZGVfbW9kdWxlcy9vYnNlcnZlZC9saWIvY2hhbmdlLmpzIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vZGVfbW9kdWxlcy9vYnNlcnZlZC9saWIvb2JzZXJ2ZWQuanMiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vdGlmaWNhdGlvbi5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvc2VydmVyLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9zdG9yYWdlLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS91dGlsLmNvZmZl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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Q1csT0FEWCxFQUNvQixPQURwQixFQUM2QixLQUQ3QixFQUNvQyxRQURwQyxFQUM4QyxPQUQ5QyxFQUVSLFdBRlEsRUFFSyxPQUZMLEVBRWMsZ0JBRmQsRUFFZ0MsVUFGaEMsRUFFNEMsTUFGNUMsRUFFb0QsS0FGcEQsRUFHUixjQUhRLEVBR1EsU0FIUixFQUdtQixZQUhuQixFQUdpQyxPQUhqQyxFQUcwQyxNQUgxQyxFQUdrRCxTQUhsRCxFQUlSLFdBSlEsRUFJSyxPQUpMLEVBSWMsTUFKZCxDQUFWLENBQUE7QUFBQSxFQUtBLElBQUEsR0FBTyxTQUFBLEdBQUE7QUFFTCxRQUFBLHFCQUFBO0FBQUE7U0FBQSw4Q0FBQTtzQkFBQTtVQUF3QixDQUFBLE9BQVMsQ0FBQSxDQUFBO0FBQy9CLHNCQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVIsR0FBYSxLQUFiO09BREY7QUFBQTtvQkFGSztFQUFBLENBTFAsQ0FBQTtBQVVBLEVBQUEsSUFBRywrQkFBSDtXQUNFLE1BQU0sQ0FBQyxJQUFQLEdBQWMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBeEIsQ0FBNkIsT0FBTyxDQUFDLEdBQXJDLEVBQTBDLE9BQTFDLEVBRGhCO0dBQUEsTUFBQTtXQUdFLE1BQU0sQ0FBQyxJQUFQLEdBQWMsU0FBQSxHQUFBO2FBQ1osUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBekIsQ0FBOEIsT0FBTyxDQUFDLEdBQXRDLEVBQTJDLE9BQTNDLEVBQW9ELFNBQXBELEVBRFk7SUFBQSxFQUhoQjtHQVhnQjtBQUFBLENBQUQsQ0FBQSxDQUFBLENBQWpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMgc2VydmVyID0gcmVxdWlyZSAnLi90Y3Atc2VydmVyLmpzJ1xuXG5nZXRHbG9iYWwgPSAtPlxuICBfZ2V0R2xvYmFsID0gLT5cbiAgICB0aGlzXG5cbiAgX2dldEdsb2JhbCgpXG5cbnJvb3QgPSBnZXRHbG9iYWwoKVxuXG5BcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5cbmNocm9tZS5hcHAucnVudGltZS5vbkxhdW5jaGVkLmFkZExpc3RlbmVyIC0+XG4gIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSAnaW5kZXguaHRtbCcsXG4gICAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgICBib3VuZHM6XG4gICAgICAgICAgd2lkdGg6NzcwXG4gICAgICAgICAgaGVpZ2h0OjgwMFxuXG5cblxuXG4jIENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy5jb2ZmZWUnXG4jIE1TRyA9IHJlcXVpcmUgJy4uLy4uL21zZy5jb2ZmZWUnXG4jIExJU1RFTiA9IHJlcXVpcmUgJy4uLy4uL2xpc3Rlbi5jb2ZmZWUnXG4jIFN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbiMgRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4uLy4uL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnLmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuLi8uLi9maWxlc3lzdGVtLmNvZmZlZSdcblNlcnZlciA9IHJlcXVpcmUgJy4uLy4uL3NlcnZlci5jb2ZmZWUnXG5cblxucm9vdC5hcHAgPSBuZXcgQXBwbGljYXRpb24gXG4gIFN0b3JhZ2U6IG5ldyBTdG9yYWdlXG4gIEZTOiBuZXcgRmlsZVN5c3RlbVxuICBTZXJ2ZXI6IG5ldyBTZXJ2ZXJcblxucm9vdC5hcHAuU2VydmVyLmdldExvY2FsRmlsZSA9IGFwcC5nZXRMb2NhbEZpbGVcbiMgcm9vdC5hcHAuU3RvcmFnZS5kYXRhLnNlcnZlciA9IHN0YXR1czpyb290LmFwcC5TZXJ2ZXIuc3RhdHVzXG5cbmNocm9tZS5ydW50aW1lLm9uU3VzcGVuZC5hZGRMaXN0ZW5lciAtPlxuICByb290LmFwcC5TdG9yYWdlLnNhdmVBbGwobnVsbClcblxuI3Jvb3QuYXBwLlN0b3JhZ2UucmV0cmlldmVBbGwoKVxuIiwicmVxdWlyZSAnLi91dGlsLmNvZmZlZSdcbkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcbkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuL3N0b3JhZ2UuY29mZmVlJ1xuRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4vZmlsZXN5c3RlbS5jb2ZmZWUnXG5Ob3RpZmljYXRpb24gPSByZXF1aXJlICcuL25vdGlmaWNhdGlvbi5jb2ZmZWUnXG5TZXJ2ZXIgPSByZXF1aXJlICcuL3NlcnZlci5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwbGljYXRpb24gZXh0ZW5kcyBDb25maWdcbiAgTElTVEVOOiBudWxsXG4gIE1TRzogbnVsbFxuICBTdG9yYWdlOiBudWxsXG4gIEZTOiBudWxsXG4gIFNlcnZlcjogbnVsbFxuICBOb3RpZnk6IG51bGxcbiAgcGxhdGZvcm06bnVsbFxuICBjdXJyZW50VGFiSWQ6bnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoZGVwcykgLT5cbiAgICBzdXBlclxuXG4gICAgQE1TRyA/PSBNU0cuZ2V0KClcbiAgICBATElTVEVOID89IExJU1RFTi5nZXQoKVxuICAgIFxuICAgIGZvciBwcm9wIG9mIGRlcHNcbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwib2JqZWN0XCIgXG4gICAgICAgIEBbcHJvcF0gPSBAd3JhcE9iakluYm91bmQgZGVwc1twcm9wXVxuICAgICAgaWYgdHlwZW9mIGRlcHNbcHJvcF0gaXMgXCJmdW5jdGlvblwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpPdXRib3VuZCBuZXcgZGVwc1twcm9wXVxuXG4gICAgQFN0b3JhZ2Uub25EYXRhTG9hZGVkID0gKGRhdGEpID0+XG4gICAgICAjIEBkYXRhID0gZGF0YVxuICAgICAgIyBkZWxldGUgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXJcbiAgICAgICMgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXIgPSB7fVxuICAgICAgIyBkZWxldGUgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXIuc3RhdHVzXG5cbiAgICAgIEBTdG9yYWdlLnNlc3Npb24uc2VydmVyID0ge31cbiAgICAgIEBTdG9yYWdlLnNlc3Npb24uc2VydmVyLnN0YXR1cyA9IEBTZXJ2ZXIuc3RhdHVzXG5cbiAgICAgIGlmIG5vdCBAU3RvcmFnZS5kYXRhLmZpcnN0VGltZT9cbiAgICAgICAgQFN0b3JhZ2UuZGF0YS5maXJzdFRpbWUgPSBmYWxzZVxuICAgICAgICBAU3RvcmFnZS5kYXRhLm1hcHMucHVzaFxuICAgICAgICAgIG5hbWU6J1NhbGVzZm9yY2UnXG4gICAgICAgICAgdXJsOidodHRwcy4qXFwvcmVzb3VyY2UoXFwvWzAtOV0rKT9cXC8oW0EtWmEtejAtOVxcLS5fXStcXC8pPydcbiAgICAgICAgICByZWdleFJlcGw6JydcbiAgICAgICAgICBpc1JlZGlyZWN0OnRydWVcbiAgICAgICAgICBpc09uOmZhbHNlXG5cblxuICAgICAgIyBpZiBAUmVkaXJlY3Q/IHRoZW4gQFJlZGlyZWN0LmRhdGEgPSBAZGF0YS50YWJNYXBzXG5cbiAgICBATm90aWZ5ID89IChuZXcgTm90aWZpY2F0aW9uKS5zaG93IFxuICAgICMgQFN0b3JhZ2UgPz0gQHdyYXBPYmpPdXRib3VuZCBuZXcgU3RvcmFnZSBAZGF0YVxuICAgICMgQEZTID0gbmV3IEZpbGVTeXN0ZW0gXG4gICAgIyBAU2VydmVyID89IEB3cmFwT2JqT3V0Ym91bmQgbmV3IFNlcnZlclxuICAgIEBkYXRhID0gQFN0b3JhZ2UuZGF0YVxuICAgIFxuICAgIEB3cmFwID0gaWYgQFNFTEZfVFlQRSBpcyAnQVBQJyB0aGVuIEB3cmFwSW5ib3VuZCBlbHNlIEB3cmFwT3V0Ym91bmRcblxuICAgIEBvcGVuQXBwID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLm9wZW5BcHAnLCBAb3BlbkFwcFxuICAgIEBsYXVuY2hBcHAgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ubGF1bmNoQXBwJywgQGxhdW5jaEFwcFxuICAgIEBzdGFydFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5zdGFydFNlcnZlcicsIEBzdGFydFNlcnZlclxuICAgIEByZXN0YXJ0U2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnJlc3RhcnRTZXJ2ZXInLCBAcmVzdGFydFNlcnZlclxuICAgIEBzdG9wU2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnN0b3BTZXJ2ZXInLCBAc3RvcFNlcnZlclxuICAgIEBnZXRGaWxlTWF0Y2ggPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0RmlsZU1hdGNoJywgQGdldEZpbGVNYXRjaFxuXG4gICAgQHdyYXAgPSBpZiBAU0VMRl9UWVBFIGlzICdFWFRFTlNJT04nIHRoZW4gQHdyYXBJbmJvdW5kIGVsc2UgQHdyYXBPdXRib3VuZFxuXG4gICAgQGdldFJlc291cmNlcyA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRSZXNvdXJjZXMnLCBAZ2V0UmVzb3VyY2VzXG4gICAgQGdldEN1cnJlbnRUYWIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0Q3VycmVudFRhYicsIEBnZXRDdXJyZW50VGFiXG5cbiAgICBjaHJvbWUucnVudGltZS5nZXRQbGF0Zm9ybUluZm8gKGluZm8pID0+XG4gICAgICBAcGxhdGZvcm0gPSBpbmZvXG5cbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgLT5cblxuICAgICMgQFN0b3JhZ2UucmV0cmlldmVBbGwoKSBpZiBAU3RvcmFnZT9cblxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgbGF1bmNoQXBwOiAoY2IsIGVycm9yKSAtPlxuICAgICAgY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIEBBUFBfSUQsIChleHRJbmZvKSA9PlxuICAgICAgICBpZiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgICBlcnJvciBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNiPyBleHRJbmZvXG5cbiAgb3BlbkFwcDogKCkgPT5cbiAgICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsXG4gICAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgICBib3VuZHM6XG4gICAgICAgICAgd2lkdGg6NzcwXG4gICAgICAgICAgaGVpZ2h0OjgwMCxcbiAgICAgICh3aW4pID0+XG4gICAgICAgIEBhcHBXaW5kb3cgPSB3aW4pIFxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgZ2V0UmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldEN1cnJlbnRUYWIgKHRhYklkKSA9PlxuICAgICAgY2hyb21lLnRhYnMuZXhlY3V0ZVNjcmlwdCB0YWJJZCwgXG4gICAgICAgIGZpbGU6J3NjcmlwdHMvY29udGVudC5qcycsIChyZXN1bHRzKSA9PlxuICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMubGVuZ3RoID0gMFxuICAgICAgICAgIGZvciByIGluIHJlc3VsdHNcbiAgICAgICAgICAgIGZvciByZXMgaW4gclxuICAgICAgICAgICAgICBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLnB1c2ggcmVzXG4gICAgICAgICAgY2I/IG51bGwsIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXNcblxuXG4gIGdldExvY2FsRmlsZTogKGluZm8sIGNiKSA9PlxuICAgIGZpbGVQYXRoID0gaW5mby51cmlcbiAgICAjIGZpbGVQYXRoID0gQGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3QgdXJsXG4gICAgcmV0dXJuIGNiICdmaWxlIG5vdCBmb3VuZCcgdW5sZXNzIGZpbGVQYXRoP1xuICAgIF9kaXJzID0gW11cbiAgICBfZGlycy5wdXNoIGRpciBmb3IgZGlyIGluIEBkYXRhLmRpcmVjdG9yaWVzIHdoZW4gZGlyLmlzT25cbiAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnN1YnN0cmluZyAxIGlmIGZpbGVQYXRoLnN1YnN0cmluZygwLDEpIGlzICcvJ1xuICAgIEBmaW5kRmlsZUZvclBhdGggX2RpcnMsIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcikgPT5cbiAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gY2I/IGVyclxuICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgIGNiPyBudWxsLGZpbGVFbnRyeSxmaWxlXG4gICAgICAsKGVycikgPT4gY2I/IGVyclxuXG5cbiAgc3RhcnRTZXJ2ZXI6IChjYikgLT5cbiAgICBpZiBAU2VydmVyLnN0YXR1cy5pc09uIGlzIGZhbHNlXG4gICAgICBAU2VydmVyLnN0YXJ0IG51bGwsbnVsbCxudWxsLCAoZXJyLCBzb2NrZXRJbmZvKSA9PlxuICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIkVycm9yIFN0YXJ0aW5nIFNlcnZlcjogI3sgZXJyb3IgfVwiXG4gICAgICAgICAgICBjYj8gZXJyXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBTdGFydGVkXCIsIFwiU3RhcnRlZCBTZXJ2ZXIgI3sgQFNlcnZlci5zdGF0dXMudXJsIH1cIlxuICAgICAgICAgICAgY2I/IG51bGwsIEBTZXJ2ZXIuc3RhdHVzXG5cbiAgc3RvcFNlcnZlcjogKGNiKSAtPlxuICAgICAgQFNlcnZlci5zdG9wIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICAgIGlmIGVycj9cbiAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIEVycm9yXCIsXCJTZXJ2ZXIgY291bGQgbm90IGJlIHN0b3BwZWQ6ICN7IGVycm9yIH1cIlxuICAgICAgICAgIGNiPyBlcnJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBOb3RpZnkgJ1NlcnZlciBTdG9wcGVkJywgXCJTZXJ2ZXIgU3RvcHBlZFwiXG4gICAgICAgICAgY2I/IG51bGwsIEBTZXJ2ZXIuc3RhdHVzXG5cbiAgcmVzdGFydFNlcnZlcjogLT5cbiAgICBAc3RhcnRTZXJ2ZXIoKVxuXG4gIGNoYW5nZVBvcnQ6ID0+XG4gIGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3Q6ICh1cmwpIC0+XG4gICAgZmlsZVBhdGhSZWdleCA9IC9eKChodHRwW3NdP3xmdHB8Y2hyb21lLWV4dGVuc2lvbnxmaWxlKTpcXC9cXC8pP1xcLz8oW15cXC9cXC5dK1xcLikqPyhbXlxcL1xcLl0rXFwuW146XFwvXFxzXFwuXXsyLDN9KFxcLlteOlxcL1xcc1xcLl3igIzigIt7MiwzfSk/KSg6XFxkKyk/KCR8XFwvKShbXiM/XFxzXSspPyguKj8pPygjW1xcd1xcLV0rKT8kL1xuICAgXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIEBkYXRhW0BjdXJyZW50VGFiSWRdPy5tYXBzP1xuXG4gICAgcmVzUGF0aCA9IHVybC5tYXRjaChmaWxlUGF0aFJlZ2V4KT9bOF1cbiAgICBpZiBub3QgcmVzUGF0aD9cbiAgICAgICMgdHJ5IHJlbHBhdGhcbiAgICAgIHJlc1BhdGggPSB1cmxcblxuICAgIHJldHVybiBudWxsIHVubGVzcyByZXNQYXRoP1xuICAgIFxuICAgIGZvciBtYXAgaW4gQGRhdGFbQGN1cnJlbnRUYWJJZF0ubWFwc1xuICAgICAgcmVzUGF0aCA9IHVybC5tYXRjaChuZXcgUmVnRXhwKG1hcC51cmwpKT8gYW5kIG1hcC51cmw/XG5cbiAgICAgIGlmIHJlc1BhdGhcbiAgICAgICAgaWYgcmVmZXJlcj9cbiAgICAgICAgICAjIFRPRE86IHRoaXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXAudXJsKSwgbWFwLnJlZ2V4UmVwbFxuICAgICAgICBicmVha1xuICAgIHJldHVybiBmaWxlUGF0aFxuXG4gIFVSTHRvTG9jYWxQYXRoOiAodXJsLCBjYikgLT5cbiAgICBmaWxlUGF0aCA9IEBSZWRpcmVjdC5nZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0IHVybFxuXG4gIGdldEZpbGVNYXRjaDogKGZpbGVQYXRoLCBjYikgLT5cbiAgICByZXR1cm4gY2I/ICdmaWxlIG5vdCBmb3VuZCcgdW5sZXNzIGZpbGVQYXRoP1xuICAgIHNob3cgJ3RyeWluZyAnICsgZmlsZVBhdGhcbiAgICBAZmluZEZpbGVGb3JQYXRoIEBkYXRhLmRpcmVjdG9yaWVzLCBmaWxlUGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXJlY3RvcnkpID0+XG5cbiAgICAgIGlmIGVycj8gXG4gICAgICAgICMgc2hvdyAnbm8gZmlsZXMgZm91bmQgZm9yICcgKyBmaWxlUGF0aFxuICAgICAgICByZXR1cm4gY2I/IGVyclxuXG4gICAgICBkZWxldGUgZmlsZUVudHJ5LmVudHJ5XG4gICAgICBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdID0gXG4gICAgICAgIGZpbGVFbnRyeTogY2hyb21lLmZpbGVTeXN0ZW0ucmV0YWluRW50cnkgZmlsZUVudHJ5XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aFxuICAgICAgICBkaXJlY3Rvcnk6IGRpcmVjdG9yeVxuICAgICAgY2I/IG51bGwsIEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlc1tmaWxlUGF0aF0sIGRpcmVjdG9yeVxuICAgICAgXG5cblxuICBmaW5kRmlsZUluRGlyZWN0b3JpZXM6IChkaXJlY3RvcmllcywgcGF0aCwgY2IpIC0+XG4gICAgbXlEaXJzID0gZGlyZWN0b3JpZXMuc2xpY2UoKSBcbiAgICBfcGF0aCA9IHBhdGhcbiAgICBfZGlyID0gbXlEaXJzLnNoaWZ0KClcblxuICAgIEBGUy5nZXRMb2NhbEZpbGVFbnRyeSBfZGlyLCBfcGF0aCwgKGVyciwgZmlsZUVudHJ5KSA9PlxuICAgICAgaWYgZXJyP1xuICAgICAgICBpZiBteURpcnMubGVuZ3RoID4gMFxuICAgICAgICAgIEBmaW5kRmlsZUluRGlyZWN0b3JpZXMgbXlEaXJzLCBfcGF0aCwgY2JcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNiPyAnbm90IGZvdW5kJ1xuICAgICAgZWxzZVxuICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBfZGlyXG5cbiAgZmluZEZpbGVGb3JQYXRoOiAoZGlycywgcGF0aCwgY2IpIC0+XG4gICAgQGZpbmRGaWxlSW5EaXJlY3RvcmllcyBkaXJzLCBwYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcmVjdG9yeSkgPT5cbiAgICAgIGlmIGVycj9cbiAgICAgICAgaWYgcGF0aCBpcyBwYXRoLnJlcGxhY2UoLy4qP1xcLy8sICcnKVxuICAgICAgICAgIGNiPyAnbm90IGZvdW5kJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQGZpbmRGaWxlRm9yUGF0aCBkaXJzLCBwYXRoLnJlcGxhY2UoLy4qP1xcLy8sICcnKSwgY2JcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZGlyZWN0b3J5XG4gIFxuICBtYXBBbGxSZXNvdXJjZXM6IChjYikgLT5cbiAgICBAZ2V0UmVzb3VyY2VzID0+XG4gICAgICBuZWVkID0gQGRhdGEuY3VycmVudFJlc291cmNlcy5sZW5ndGhcbiAgICAgIGZvdW5kID0gbm90Rm91bmQgPSAwXG4gICAgICBmb3IgaXRlbSBpbiBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG4gICAgICAgIGxvY2FsUGF0aCA9IEBVUkx0b0xvY2FsUGF0aCBpdGVtLnVybFxuICAgICAgICBpZiBsb2NhbFBhdGg/XG4gICAgICAgICAgQGdldEZpbGVNYXRjaCBsb2NhbFBhdGgsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICAgICAgICBuZWVkLS1cbiAgICAgICAgICAgIHNob3cgYXJndW1lbnRzXG4gICAgICAgICAgICBpZiBlcnI/IHRoZW4gbm90Rm91bmQrK1xuICAgICAgICAgICAgZWxzZSBmb3VuZCsrICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIGlmIG5lZWQgaXMgMFxuICAgICAgICAgICAgICBpZiBmb3VuZCA+IDBcbiAgICAgICAgICAgICAgICBjYj8gbnVsbCwgJ2RvbmUnXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjYj8gJ25vdGhpbmcgZm91bmQnXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIG5lZWQtLVxuICAgICAgICAgIG5vdEZvdW5kKytcbiAgICAgICAgICBpZiBuZWVkIGlzIDBcbiAgICAgICAgICAgIGNiPyAnbm90aGluZyBmb3VuZCdcblxuICBzZXRCYWRnZVRleHQ6ICh0ZXh0LCB0YWJJZCkgLT5cbiAgICBiYWRnZVRleHQgPSB0ZXh0IHx8ICcnICsgT2JqZWN0LmtleXMoQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzKS5sZW5ndGhcbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQgXG4gICAgICB0ZXh0OmJhZGdlVGV4dFxuICAgICAgIyB0YWJJZDp0YWJJZFxuICBcbiAgcmVtb3ZlQmFkZ2VUZXh0Oih0YWJJZCkgLT5cbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQgXG4gICAgICB0ZXh0OicnXG4gICAgICAjIHRhYklkOnRhYklkXG5cbiAgbHNSOiAoZGlyLCBvbnN1Y2Nlc3MsIG9uZXJyb3IpIC0+XG4gICAgQHJlc3VsdHMgPSB7fVxuXG4gICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICBcbiAgICAgIHRvZG8gPSAwXG4gICAgICBpZ25vcmUgPSAvLmdpdHwuaWRlYXxub2RlX21vZHVsZXN8Ym93ZXJfY29tcG9uZW50cy9cbiAgICAgIGRpdmUgPSAoZGlyLCByZXN1bHRzKSAtPlxuICAgICAgICB0b2RvKytcbiAgICAgICAgcmVhZGVyID0gZGlyLmNyZWF0ZVJlYWRlcigpXG4gICAgICAgIHJlYWRlci5yZWFkRW50cmllcyAoZW50cmllcykgLT5cbiAgICAgICAgICB0b2RvLS1cbiAgICAgICAgICBmb3IgZW50cnkgaW4gZW50cmllc1xuICAgICAgICAgICAgZG8gKGVudHJ5KSAtPlxuICAgICAgICAgICAgICByZXN1bHRzW2VudHJ5LmZ1bGxQYXRoXSA9IGVudHJ5XG4gICAgICAgICAgICAgIGlmIGVudHJ5LmZ1bGxQYXRoLm1hdGNoKGlnbm9yZSkgaXMgbnVsbFxuICAgICAgICAgICAgICAgIGlmIGVudHJ5LmlzRGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICB0b2RvKytcbiAgICAgICAgICAgICAgICAgIGRpdmUgZW50cnksIHJlc3VsdHMgXG4gICAgICAgICAgICAgICMgc2hvdyBlbnRyeVxuICAgICAgICAgIHNob3cgJ29uc3VjY2VzcycgaWYgdG9kbyBpcyAwXG4gICAgICAgICAgIyBzaG93ICdvbnN1Y2Nlc3MnIHJlc3VsdHMgaWYgdG9kbyBpcyAwXG4gICAgICAgICwoZXJyb3IpIC0+XG4gICAgICAgICAgdG9kby0tXG4gICAgICAgICAgIyBzaG93IGVycm9yXG4gICAgICAgICAgIyBvbmVycm9yIGVycm9yLCByZXN1bHRzIGlmIHRvZG8gaXMgMCBcblxuICAgICAgY29uc29sZS5sb2cgZGl2ZSBkaXJFbnRyeSwgQHJlc3VsdHMgIFxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb25cblxuXG4iLCJjbGFzcyBDb25maWdcbiAgIyBBUFBfSUQ6ICdjZWNpZmFmcGhlZ2hvZnBmZGtoZWtraWJjaWJoZ2ZlYydcbiAgIyBFWFRFTlNJT05fSUQ6ICdkZGRpbWJuamliamNhZmJva25iZ2hlaGJmYWpnZ2dlcCdcbiAgQVBQX0lEOiAnZGVuZWZkb29mbmtnam1wYmZwa25paHBnZGhhaHBibGgnXG4gIEVYVEVOU0lPTl9JRDogJ2lqY2ptcGVqb25taW1vb2ZiY3BhbGllamhpa2Flb21oJyAgXG4gIFNFTEZfSUQ6IGNocm9tZS5ydW50aW1lLmlkXG4gIGlzQ29udGVudFNjcmlwdDogbG9jYXRpb24ucHJvdG9jb2wgaXNudCAnY2hyb21lLWV4dGVuc2lvbjonXG4gIEVYVF9JRDogbnVsbFxuICBFWFRfVFlQRTogbnVsbFxuICBcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQEVYVF9JRCA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiBARVhURU5TSU9OX0lEIGVsc2UgQEFQUF9JRFxuICAgIEBFWFRfVFlQRSA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG4gICAgQFNFTEZfVFlQRSA9IGlmIEBBUFBfSUQgaXNudCBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcblxuICB3cmFwSW5ib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgICBfa2xhcyA9IG9ialxuICAgICAgQExJU1RFTi5FeHQgZm5hbWUsIChhcmdzKSAtPlxuICAgICAgICBpZiBhcmdzPy5pc1Byb3h5P1xuICAgICAgICAgIGlmIHR5cGVvZiBhcmd1bWVudHNbMV0gaXMgXCJmdW5jdGlvblwiXG4gICAgICAgICAgICBpZiBhcmdzLmFyZ3VtZW50cz8ubGVuZ3RoID49IDBcbiAgICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIGFyZ3MuYXJndW1lbnRzLmNvbmNhdCBhcmd1bWVudHNbMV0gXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBbXS5jb25jYXQgYXJndW1lbnRzWzFdXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgYXJndW1lbnRzXG5cbiAgICAgICAgIyBhcmdzID0gW11cbiAgICAgICAgIyBpZiBhcmdzLmFyZ3VtZW50cz8ubGVuZ3RoIGlzIDBcbiAgICAgICAgIyAgIGFyZ3MucHVzaCBudWxsXG4gICAgICAgICMgZWxzZVxuICAgICAgICAjICAgYXJncyA9IF9hcmd1bWVudHNcbiAgICAgICAgIyBfYXJncyA9IGFyZ3NbMF0/LnB1c2goYXJnc1sxXSlcbiAgICAgICAgI2YuYXBwbHkgX2tsYXMsIGFyZ3NcblxuICB3cmFwT2JqSW5ib3VuZDogKG9iaikgLT5cbiAgICAob2JqW2tleV0gPSBAd3JhcEluYm91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG4gIHdyYXBPdXRib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgLT5cbiAgICAgIG1zZyA9IHt9XG4gICAgICBtc2dbZm5hbWVdID0gXG4gICAgICAgIGlzUHJveHk6dHJ1ZVxuICAgICAgICBhcmd1bWVudHM6QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG4gICAgICBtc2dbZm5hbWVdLmlzUHJveHkgPSB0cnVlXG4gICAgICBfYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuXG4gICAgICBpZiBfYXJncy5sZW5ndGggaXMgMFxuICAgICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cyA9IHVuZGVmaW5lZCBcbiAgICAgICAgcmV0dXJuIEBNU0cuRXh0IG1zZywgKCkgLT4gdW5kZWZpbmVkXG5cbiAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzID0gX2FyZ3NcblxuICAgICAgY2FsbGJhY2sgPSBtc2dbZm5hbWVdLmFyZ3VtZW50cy5wb3AoKVxuICAgICAgaWYgdHlwZW9mIGNhbGxiYWNrIGlzbnQgXCJmdW5jdGlvblwiXG4gICAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzLnB1c2ggY2FsbGJhY2tcbiAgICAgICAgQE1TRy5FeHQgbXNnLCAoKSAtPiB1bmRlZmluZWRcbiAgICAgIGVsc2VcbiAgICAgICAgQE1TRy5FeHQgbXNnLCAoKSA9PlxuICAgICAgICAgIGFyZ3ogPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcbiAgICAgICAgICAjIHByb3h5QXJncyA9IFtpc1Byb3h5OmFyZ3pdXG4gICAgICAgICAgaWYgYXJnej8ubGVuZ3RoID4gMCBhbmQgYXJnelswXT8uaXNQcm94eT9cbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5IEAsIGFyZ3pbMF0uaXNQcm94eSBcblxuICB3cmFwT2JqT3V0Ym91bmQ6IChvYmopIC0+XG4gICAgKG9ialtrZXldID0gQHdyYXBPdXRib3VuZCBvYmosIG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsga2V5LCBvYmpba2V5XSkgZm9yIGtleSBvZiBvYmogd2hlbiB0eXBlb2Ygb2JqW2tleV0gaXMgXCJmdW5jdGlvblwiXG4gICAgb2JqXG5cbm1vZHVsZS5leHBvcnRzID0gQ29uZmlnIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuXG5jbGFzcyBGaWxlU3lzdGVtXG4gIGFwaTogY2hyb21lLmZpbGVTeXN0ZW1cbiAgcmV0YWluZWREaXJzOiB7fVxuICBMSVNURU46IExJU1RFTi5nZXQoKSBcbiAgTVNHOiBNU0cuZ2V0KClcbiAgY29uc3RydWN0b3I6ICgpIC0+XG5cbiAgIyBAZGlyczogbmV3IERpcmVjdG9yeVN0b3JlXG4gICMgZmlsZVRvQXJyYXlCdWZmZXI6IChibG9iLCBvbmxvYWQsIG9uZXJyb3IpIC0+XG4gICMgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICMgICByZWFkZXIub25sb2FkID0gb25sb2FkXG5cbiAgIyAgIHJlYWRlci5vbmVycm9yID0gb25lcnJvclxuXG4gICMgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgYmxvYlxuXG4gIHJlYWRGaWxlOiAoZGlyRW50cnksIHBhdGgsIGNiKSAtPlxuICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIHBhdGgsXG4gICAgICAoZXJyLCBmaWxlRW50cnkpID0+XG4gICAgICAgIFxuICAgICAgICBpZiBlcnI/IHRoZW4gcmV0dXJuIGNiPyBlcnJcblxuICAgICAgICBmaWxlRW50cnkuZmlsZSAoZmlsZSkgPT5cbiAgICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBmaWxlXG4gICAgICAgICwoZXJyKSA9PiBjYj8gZXJyXG5cbiAgZ2V0RmlsZUVudHJ5OiAoZGlyRW50cnksIHBhdGgsIGNiKSAtPlxuICAgICAgZGlyRW50cnkuZ2V0RmlsZSBwYXRoLCB7fSwgKGZpbGVFbnRyeSkgPT5cbiAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeVxuICAgICAgLChlcnIpID0+IGNiPyBlcnJcblxuICAjIG9wZW5EaXJlY3Rvcnk6IChjYWxsYmFjaykgLT5cbiAgb3BlbkRpcmVjdG9yeTogKGRpcmVjdG9yeUVudHJ5LCBjYikgLT5cbiAgIyBAYXBpLmNob29zZUVudHJ5IHR5cGU6J29wZW5EaXJlY3RvcnknLCAoZGlyZWN0b3J5RW50cnksIGZpbGVzKSA9PlxuICAgIEBhcGkuZ2V0RGlzcGxheVBhdGggZGlyZWN0b3J5RW50cnksIChwYXRoTmFtZSkgPT5cbiAgICAgIGRpciA9XG4gICAgICAgICAgcmVsUGF0aDogZGlyZWN0b3J5RW50cnkuZnVsbFBhdGggIy5yZXBsYWNlKCcvJyArIGRpcmVjdG9yeUVudHJ5Lm5hbWUsICcnKVxuICAgICAgICAgIGRpcmVjdG9yeUVudHJ5SWQ6IEBhcGkucmV0YWluRW50cnkoZGlyZWN0b3J5RW50cnkpXG4gICAgICAgICAgZW50cnk6IGRpcmVjdG9yeUVudHJ5XG4gICAgICBjYj8gbnVsbCwgcGF0aE5hbWUsIGRpclxuICAgICAgICAgICMgQGdldE9uZURpckxpc3QgZGlyXG4gICAgICAgICAgIyBTdG9yYWdlLnNhdmUgJ2RpcmVjdG9yaWVzJywgQHNjb3BlLmRpcmVjdG9yaWVzIChyZXN1bHQpIC0+XG5cbiAgZ2V0TG9jYWxGaWxlRW50cnk6IChkaXIsIGZpbGVQYXRoLCBjYikgPT4gXG4gICAgZGlyRW50cnkgPSBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsICgpIC0+XG4gICAgaWYgbm90IGRpckVudHJ5P1xuICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIGZpbGVQYXRoLCBjYlxuICAgIGVsc2VcbiAgICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIGZpbGVQYXRoLCBjYlxuXG5cblxuICAjIGdldExvY2FsRmlsZTogKGRpciwgZmlsZVBhdGgsIGNiLCBlcnJvcikgPT4gXG4gICMgIyBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgIyAjICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAjICMgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICMgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgIyAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgIyAgICAgLChfZXJyb3IpID0+IGVycm9yKF9lcnJvcilcbiAgIyAjIGVsc2VcbiAgIyAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAjICAgICAjIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiAgIyAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCwgKGVyciwgZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgIGlmIGVycj8gdGhlbiBjYj8gZXJyXG4gICMgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZmlsZVxuICAjICAgLChfZXJyb3IpID0+IGNiPyhfZXJyb3IpXG5cbiAgICAgICMgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIHN1Y2Nlc3MsXG4gICAgICAjICAgICAoZXJyKSA9PlxuICAgICAgIyAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggaW5mbywgY2JcblxuICAjIGZpbmRGaWxlRm9yUGF0aDogKGluZm8sIGNiKSA9PlxuICAjICAgICBAZmluZEZpbGVGb3JRdWVyeVN0cmluZyBpbmZvLnVyaSwgY2IsIGluZm8ucmVmZXJlclxuXG4gICMgZmluZEZpbGVGb3JRdWVyeVN0cmluZzogKF91cmwsIGNiLCBlcnJvciwgcmVmZXJlcikgPT5cbiAgIyAgICAgdXJsID0gZGVjb2RlVVJJQ29tcG9uZW50KF91cmwpLnJlcGxhY2UgLy4qP3NscmVkaXJcXD0vLCAnJ1xuXG4gICMgICAgIG1hdGNoID0gaXRlbSBmb3IgaXRlbSBpbiBAbWFwcyB3aGVuIHVybC5tYXRjaChuZXcgUmVnRXhwKGl0ZW0udXJsKSk/IGFuZCBpdGVtLnVybD8gYW5kIG5vdCBtYXRjaD9cblxuICAjICAgICBpZiBtYXRjaD9cbiAgIyAgICAgICAgIGlmIHJlZmVyZXI/XG4gICMgICAgICAgICAgICAgZmlsZVBhdGggPSB1cmwubWF0Y2goLy4qXFwvXFwvLio/XFwvKC4qKS8pP1sxXVxuICAjICAgICAgICAgZWxzZVxuICAjICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXRjaC51cmwpLCBtYXRjaC5yZWdleFJlcGxcblxuICAjICAgICAgICAgZmlsZVBhdGgucmVwbGFjZSAnLycsICdcXFxcJyBpZiBwbGF0Zm9ybSBpcyAnd2luJ1xuXG4gICMgICAgICAgICBkaXIgPSBAU3RvcmFnZS5kYXRhLmRpcmVjdG9yaWVzW21hdGNoLmRpcmVjdG9yeV1cblxuICAjICAgICAgICAgaWYgbm90IGRpcj8gdGhlbiByZXR1cm4gZXJyICdubyBtYXRjaCdcblxuICAjICAgICAgICAgaWYgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0/XG4gICMgICAgICAgICAgICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAjICAgICAgICAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgICAgICBlbHNlXG4gICMgICAgICAgICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICMgICAgICAgICAgICAgICAgIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiAgIyAgICAgICAgICAgICAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAgICAgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAgICAgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICBlbHNlXG4gICMgICAgICAgICBlcnJvcigpXG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVN5c3RlbSIsIkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcblxuY2xhc3MgTElTVEVOIGV4dGVuZHMgQ29uZmlnXG4gIGxvY2FsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlXG4gICAgbGlzdGVuZXJzOnt9XG4gICAgIyByZXNwb25zZUNhbGxlZDpmYWxzZVxuICBleHRlcm5hbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsXG4gICAgbGlzdGVuZXJzOnt9XG4gICAgIyByZXNwb25zZUNhbGxlZDpmYWxzZVxuICBpbnN0YW5jZSA9IG51bGxcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBcbiAgICBjaHJvbWUucnVudGltZS5vbkNvbm5lY3RFeHRlcm5hbC5hZGRMaXN0ZW5lciAocG9ydCkgPT5cbiAgICAgIHBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICAgIEBsb2NhbC5hcGkuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwuYXBpPy5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgQGdldDogKCkgLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgTElTVEVOXG5cbiAgTG9jYWw6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICBAbG9jYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBFeHQ6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICAjIHNob3cgJ2FkZGluZyBleHQgbGlzdGVuZXIgZm9yICcgKyBtZXNzYWdlXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgX29uTWVzc2FnZUV4dGVybmFsOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgcmVzcG9uc2VTdGF0dXMgPSBjYWxsZWQ6ZmFsc2VcblxuICAgIF9zZW5kUmVzcG9uc2UgPSAod2hhdGV2ZXIuLi4pID0+XG4gICAgICB0cnlcbiAgICAgICAgIyB3aGF0ZXZlci5zaGlmdCgpIGlmIHdoYXRldmVyWzBdIGlzIG51bGwgYW5kIHdoYXRldmVyWzFdP1xuICAgICAgICBzZW5kUmVzcG9uc2UuYXBwbHkgbnVsbCxwcm94eUFyZ3MgPSBbaXNQcm94eTp3aGF0ZXZlcl1cblxuICAgICAgY2F0Y2ggZVxuICAgICAgICB1bmRlZmluZWQgIyBlcnJvciBiZWNhdXNlIG5vIHJlc3BvbnNlIHdhcyByZXF1ZXN0ZWQgZnJvbSB0aGUgTVNHLCBkb24ndCBjYXJlXG4gICAgICByZXNwb25zZVN0YXR1cy5jYWxsZWQgPSB0cnVlXG4gICAgICBcbiAgICAjIChzaG93IFwiPD09IEdPVCBFWFRFUk5BTCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgaWYgc2VuZGVyLmlkIGlzbnQgQEVYVF9JRCBhbmQgc2VuZGVyLmNvbnN0cnVjdG9yLm5hbWUgaXNudCAnUG9ydCdcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG4gICAgXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCAjIGZvciBzeW5jaHJvbm91cyBzZW5kUmVzcG9uc2VcbiAgICAgICMgc2hvdyAncmV0dXJuaW5nIHRydWUnXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gIF9vbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuICAgIF9zZW5kUmVzcG9uc2UgPSA9PlxuICAgICAgdHJ5XG4gICAgICAgICMgc2hvdyAnY2FsbGluZyBzZW5kcmVzcG9uc2UnXG4gICAgICAgIHNlbmRSZXNwb25zZS5hcHBseSB0aGlzLGFyZ3VtZW50c1xuICAgICAgY2F0Y2ggZVxuICAgICAgICAjIHNob3cgZVxuICAgICAgcmVzcG9uc2VTdGF0dXMuY2FsbGVkID0gdHJ1ZVxuXG4gICAgIyAoc2hvdyBcIjw9PSBHT1QgTUVTU0FHRSA9PSAjeyBARVhUX1RZUEUgfSA9PVwiICsgX2tleSkgZm9yIF9rZXkgb2YgcmVxdWVzdFxuICAgIEBsb2NhbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBfc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZFxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gTElTVEVOIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBNU0cgZXh0ZW5kcyBDb25maWdcbiAgaW5zdGFuY2UgPSBudWxsXG4gIHBvcnQ6bnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IE1TR1xuXG4gIEBjcmVhdGVQb3J0OiAoKSAtPlxuXG5cbiAgTG9jYWw6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIChzaG93IFwiPT0gTUVTU0FHRSAjeyBfa2V5IH0gPT0+XCIpIGZvciBfa2V5IG9mIG1lc3NhZ2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBtZXNzYWdlLCByZXNwb25kXG4gIEV4dDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFIEVYVEVSTkFMICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIEBFWFRfSUQsIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0UG9ydDogKG1lc3NhZ2UpIC0+XG4gICAgdHJ5XG4gICAgICBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG4gICAgY2F0Y2hcbiAgICAgIEBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuICAgICAgQHBvcnQucG9zdE1lc3NhZ2UgbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1TRyIsIi8qXG4gIFRlc3RlZCBhZ2FpbnN0IENocm9taXVtIGJ1aWxkIHdpdGggT2JqZWN0Lm9ic2VydmUgYW5kIGFjdHMgRVhBQ1RMWSB0aGUgc2FtZSxcbiAgdGhvdWdoIENocm9taXVtIGJ1aWxkIGlzIE1VQ0ggZmFzdGVyXG5cbiAgVHJ5aW5nIHRvIHN0YXkgYXMgY2xvc2UgdG8gdGhlIHNwZWMgYXMgcG9zc2libGUsXG4gIHRoaXMgaXMgYSB3b3JrIGluIHByb2dyZXNzLCBmZWVsIGZyZWUgdG8gY29tbWVudC91cGRhdGVcblxuICBTcGVjaWZpY2F0aW9uOlxuICAgIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6b2JzZXJ2ZVxuXG4gIEJ1aWx0IHVzaW5nIHBhcnRzIG9mOlxuICAgIGh0dHBzOi8vZ2l0aHViLmNvbS90dmN1dHNlbS9oYXJtb255LXJlZmxlY3QvYmxvYi9tYXN0ZXIvZXhhbXBsZXMvb2JzZXJ2ZXIuanNcblxuICBMaW1pdHMgc28gZmFyO1xuICAgIEJ1aWx0IHVzaW5nIHBvbGxpbmcuLi4gV2lsbCB1cGRhdGUgYWdhaW4gd2l0aCBwb2xsaW5nL2dldHRlciZzZXR0ZXJzIHRvIG1ha2UgdGhpbmdzIGJldHRlciBhdCBzb21lIHBvaW50XG5cblRPRE86XG4gIEFkZCBzdXBwb3J0IGZvciBPYmplY3QucHJvdG90eXBlLndhdGNoIC0+IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC93YXRjaFxuKi9cblwidXNlIHN0cmljdFwiO1xuaWYoIU9iamVjdC5vYnNlcnZlKXtcbiAgKGZ1bmN0aW9uKGV4dGVuZCwgZ2xvYmFsKXtcbiAgICB2YXIgaXNDYWxsYWJsZSA9IChmdW5jdGlvbih0b1N0cmluZyl7XG4gICAgICAgIHZhciBzID0gdG9TdHJpbmcuY2FsbCh0b1N0cmluZyksXG4gICAgICAgICAgICB1ID0gdHlwZW9mIHU7XG4gICAgICAgIHJldHVybiB0eXBlb2YgZ2xvYmFsLmFsZXJ0ID09PSBcIm9iamVjdFwiID9cbiAgICAgICAgICBmdW5jdGlvbihmKXtcbiAgICAgICAgICAgIHJldHVybiBzID09PSB0b1N0cmluZy5jYWxsKGYpIHx8ICghIWYgJiYgdHlwZW9mIGYudG9TdHJpbmcgPT0gdSAmJiB0eXBlb2YgZi52YWx1ZU9mID09IHUgJiYgL15cXHMqXFxiZnVuY3Rpb25cXGIvLnRlc3QoXCJcIiArIGYpKTtcbiAgICAgICAgICB9OlxuICAgICAgICAgIGZ1bmN0aW9uKGYpe1xuICAgICAgICAgICAgcmV0dXJuIHMgPT09IHRvU3RyaW5nLmNhbGwoZik7XG4gICAgICAgICAgfVxuICAgICAgICA7XG4gICAgfSkoZXh0ZW5kLnByb3RvdHlwZS50b1N0cmluZyk7XG4gICAgLy8gaXNOb2RlICYgaXNFbGVtZW50IGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zODQyODYvamF2YXNjcmlwdC1pc2RvbS1ob3ctZG8teW91LWNoZWNrLWlmLWEtamF2YXNjcmlwdC1vYmplY3QtaXMtYS1kb20tb2JqZWN0XG4gICAgLy9SZXR1cm5zIHRydWUgaWYgaXQgaXMgYSBET00gbm9kZVxuICAgIGZ1bmN0aW9uIGlzTm9kZShvKXtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHR5cGVvZiBOb2RlID09PSBcIm9iamVjdFwiID8gbyBpbnN0YW5jZW9mIE5vZGUgOlxuICAgICAgICBvICYmIHR5cGVvZiBvID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBvLm5vZGVUeXBlID09PSBcIm51bWJlclwiICYmIHR5cGVvZiBvLm5vZGVOYW1lPT09XCJzdHJpbmdcIlxuICAgICAgKTtcbiAgICB9XG4gICAgLy9SZXR1cm5zIHRydWUgaWYgaXQgaXMgYSBET00gZWxlbWVudFxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudChvKXtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHR5cGVvZiBIVE1MRWxlbWVudCA9PT0gXCJvYmplY3RcIiA/IG8gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA6IC8vRE9NMlxuICAgICAgICBvICYmIHR5cGVvZiBvID09PSBcIm9iamVjdFwiICYmIG8gIT09IG51bGwgJiYgby5ub2RlVHlwZSA9PT0gMSAmJiB0eXBlb2Ygby5ub2RlTmFtZT09PVwic3RyaW5nXCJcbiAgICApO1xuICAgIH1cbiAgICB2YXIgX2lzSW1tZWRpYXRlU3VwcG9ydGVkID0gKGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gISFnbG9iYWwuc2V0SW1tZWRpYXRlO1xuICAgIH0pKCk7XG4gICAgdmFyIF9kb0NoZWNrQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKXtcbiAgICAgIGlmKF9pc0ltbWVkaWF0ZVN1cHBvcnRlZCl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihmKXtcbiAgICAgICAgICByZXR1cm4gc2V0SW1tZWRpYXRlKGYpO1xuICAgICAgICB9O1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihmKXtcbiAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmLCAxMCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSkoKTtcbiAgICB2YXIgX2NsZWFyQ2hlY2tDYWxsYmFjayA9IChmdW5jdGlvbigpe1xuICAgICAgaWYoX2lzSW1tZWRpYXRlU3VwcG9ydGVkKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICBjbGVhckltbWVkaWF0ZShpZCk7XG4gICAgICAgIH07XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pKCk7XG4gICAgdmFyIGlzTnVtZXJpYz1mdW5jdGlvbihuKXtcbiAgICAgIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChuKSkgJiYgaXNGaW5pdGUobik7XG4gICAgfTtcbiAgICB2YXIgc2FtZVZhbHVlTm90aWZ5ID0gZnVuY3Rpb24oeCwgeSl7XG4gICAgICBpZih0eXBlb2YoeCk9PT0nb2JqZWN0JyAmJiB0eXBlb2YoeSk9PT0nb2JqZWN0JyAmJiB4ICE9IG51bGwgJiYgeSAhPSBudWxsKSB7XG4gICAgICAgIHZhciBhS2V5cyA9IE9iamVjdC5rZXlzKHgpLnNvcnQoKTtcbiAgICAgICAgdmFyIGJLZXlzID0gT2JqZWN0LmtleXMoeSkuc29ydCgpO1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYUtleXMpID09PSBKU09OLnN0cmluZ2lmeShiS2V5cyk7XG4gICAgICB9XG4gICAgICBpZih4PT09eSl7XG4gICAgICAgIHJldHVybiB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB4ICE9PSB4ICYmIHkgIT09IHk7XG4gICAgfTtcbiAgICB2YXIgc2FtZVZhbHVlID0gZnVuY3Rpb24oeCwgeSl7XG4gICAgICBpZih4PT09eSl7XG4gICAgICAgIHJldHVybiB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB4ICE9PSB4ICYmIHkgIT09IHk7XG4gICAgfTsgICAgXG4gICAgdmFyIGlzQWNjZXNzb3JEZXNjcmlwdG9yID0gZnVuY3Rpb24oZGVzYyl7XG4gICAgICBpZiAodHlwZW9mKGRlc2MpID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoJ2dldCcgaW4gZGVzYyB8fCAnc2V0JyBpbiBkZXNjKTtcbiAgICB9O1xuICAgIHZhciBpc0RhdGFEZXNjcmlwdG9yID0gZnVuY3Rpb24oZGVzYyl7XG4gICAgICBpZiAodHlwZW9mKGRlc2MpID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoJ3ZhbHVlJyBpbiBkZXNjIHx8ICd3cml0YWJsZScgaW4gZGVzYyk7XG4gICAgfTtcbiAgICBcbiAgICB2YXIgdmFsaWRhdGVBcmd1bWVudHMgPSBmdW5jdGlvbihPLCBjYWxsYmFjaywgYWNjZXB0KXtcbiAgICAgIGlmKHR5cGVvZihPKSE9PSdvYmplY3QnKXtcbiAgICAgICAgLy8gVGhyb3cgRXJyb3JcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdC5vYnNlcnZlT2JqZWN0IGNhbGxlZCBvbiBub24tb2JqZWN0XCIpO1xuICAgICAgfVxuICAgICAgaWYoaXNDYWxsYWJsZShjYWxsYmFjayk9PT1mYWxzZSl7XG4gICAgICAgIC8vIFRocm93IEVycm9yXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3Qub2JzZXJ2ZU9iamVjdDogRXhwZWN0aW5nIGZ1bmN0aW9uXCIpO1xuICAgICAgfVxuICAgICAgaWYoT2JqZWN0LmlzRnJvemVuKGNhbGxiYWNrKT09PXRydWUpe1xuICAgICAgICAvLyBUaHJvdyBFcnJvclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0Lm9ic2VydmVPYmplY3Q6IEV4cGVjdGluZyB1bmZyb3plbiBmdW5jdGlvblwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChhY2NlcHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWNjZXB0KSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3Qub2JzZXJ2ZU9iamVjdDogRXhwZWN0aW5nIGFjY2VwdExpc3QgaW4gdGhlIGZvcm0gb2YgYW4gYXJyYXlcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIE9ic2VydmVyID0gKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgd3JhcGVkID0gW107XG4gICAgICB2YXIgT2JzZXJ2ZXIgPSBmdW5jdGlvbihPLCBjYWxsYmFjaywgYWNjZXB0KXtcbiAgICAgICAgdmFsaWRhdGVBcmd1bWVudHMoTywgY2FsbGJhY2ssIGFjY2VwdCk7XG4gICAgICAgIGlmICghYWNjZXB0KSB7XG4gICAgICAgICAgYWNjZXB0ID0gW1wiYWRkXCIsIFwidXBkYXRlXCIsIFwiZGVsZXRlXCIsIFwicmVjb25maWd1cmVcIiwgXCJzZXRQcm90b3R5cGVcIiwgXCJwcmV2ZW50RXh0ZW5zaW9uc1wiXTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZ2V0Tm90aWZpZXIoTykuYWRkTGlzdGVuZXIoY2FsbGJhY2ssIGFjY2VwdCk7XG4gICAgICAgIGlmKHdyYXBlZC5pbmRleE9mKE8pPT09LTEpe1xuICAgICAgICAgIHdyYXBlZC5wdXNoKE8pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBPYmplY3QuZ2V0Tm90aWZpZXIoTykuX2NoZWNrUHJvcGVydHlMaXN0aW5nKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIE9ic2VydmVyLnByb3RvdHlwZS5kZWxpdmVyQ2hhbmdlUmVjb3JkcyA9IGZ1bmN0aW9uKE8pe1xuICAgICAgICBPYmplY3QuZ2V0Tm90aWZpZXIoTykuZGVsaXZlckNoYW5nZVJlY29yZHMoKTtcbiAgICAgIH07XG5cbiAgICAgIHdyYXBlZC5sYXN0U2Nhbm5lZCA9IDA7XG4gICAgICB2YXIgZiA9IChmdW5jdGlvbih3cmFwcGVkKXtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAwLCBsID0gd3JhcHBlZC5sZW5ndGgsIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCksIHRha2luZ1Rvb0xvbmc9ZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yKGk9d3JhcHBlZC5sYXN0U2Nhbm5lZDsgKGk8bCkmJighdGFraW5nVG9vTG9uZyk7IGkrKyl7XG4gICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0Tm90aWZpZXIod3JhcHBlZFtpXSkuX2NoZWNrUHJvcGVydHlMaXN0aW5nKCk7XG4gICAgICAgICAgICAgICAgICB0YWtpbmdUb29Mb25nPSgobmV3IERhdGUoKSktc3RhcnRUaW1lKT4xMDA7IC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCB0YWtlIG1vcmUgdGhhbiAxMDAgbWlsbGlzZWNvbmRzIHRvIHNjYW4gYWxsIG9iamVjdHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd3JhcHBlZC5sYXN0U2Nhbm5lZD1pPGw/aTowOyAvLyByZXNldCB3cmFwcGVkIHNvIHdlIGNhbiBtYWtlIHN1cmUgdGhhdCB3ZSBwaWNrIHRoaW5ncyBiYWNrIHVwXG4gICAgICAgICAgICAgICAgX2RvQ2hlY2tDYWxsYmFjayhmKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKHdyYXBlZCk7XG4gICAgICBfZG9DaGVja0NhbGxiYWNrKGYpO1xuICAgICAgcmV0dXJuIE9ic2VydmVyO1xuICAgIH0pKCk7XG5cbiAgICB2YXIgTm90aWZpZXIgPSBmdW5jdGlvbih3YXRjaGluZyl7XG4gICAgdmFyIF9saXN0ZW5lcnMgPSBbXSwgX2FjY2VwdExpc3RzID0gW10sIF91cGRhdGVzID0gW10sIF91cGRhdGVyID0gZmFsc2UsIHByb3BlcnRpZXMgPSBbXSwgdmFsdWVzID0gW107XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VsZiwgJ193YXRjaGluZycsIHtcbiAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICBnZXQ6IChmdW5jdGlvbih3YXRjaGVkKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdhdGNoZWQ7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICB9KSh3YXRjaGluZylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIHZhciB3cmFwUHJvcGVydHkgPSBmdW5jdGlvbihvYmplY3QsIHByb3Ape1xuICAgICAgICB2YXIgcHJvcFR5cGUgPSB0eXBlb2Yob2JqZWN0W3Byb3BdKSwgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wKTtcbiAgICAgICAgaWYoKHByb3A9PT0nZ2V0Tm90aWZpZXInKXx8aXNBY2Nlc3NvckRlc2NyaXB0b3IoZGVzY3JpcHRvcil8fCghZGVzY3JpcHRvci5lbnVtZXJhYmxlKSl7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmKChvYmplY3QgaW5zdGFuY2VvZiBBcnJheSkmJmlzTnVtZXJpYyhwcm9wKSl7XG4gICAgICAgICAgdmFyIGlkeCA9IHByb3BlcnRpZXMubGVuZ3RoO1xuICAgICAgICAgIHByb3BlcnRpZXNbaWR4XSA9IHByb3A7XG4gICAgICAgICAgdmFsdWVzW2lkeF0gPSBvYmplY3RbcHJvcF07XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgKGZ1bmN0aW9uKGlkeCwgcHJvcCl7XG4gICAgICAgICAgcHJvcGVydGllc1tpZHhdID0gcHJvcDtcbiAgICAgICAgICB2YWx1ZXNbaWR4XSA9IG9iamVjdFtwcm9wXTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBwcm9wLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZXNbaWR4XTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICAgICAgaWYoIXNhbWVWYWx1ZU5vdGlmeSh2YWx1ZXNbaWR4XSwgdmFsdWUpKVxuICAgICAgICAgICAgICAgIE9iamVjdC5nZXROb3RpZmllcihvYmplY3QpLnF1ZXVlVXBkYXRlKG9iamVjdCwgcHJvcCwgJ3VwZGF0ZScsIHZhbHVlc1tpZHhdKTtcbiAgICAgICAgICAgICAgaWYoIXNhbWVWYWx1ZSh2YWx1ZXNbaWR4XSwgdmFsdWUpKVxuICAgICAgICAgICAgICAgIHZhbHVlc1tpZHhdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pKHByb3BlcnRpZXMubGVuZ3RoLCBwcm9wKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgICAgc2VsZi5fY2hlY2tQcm9wZXJ0eUxpc3RpbmcgPSBmdW5jdGlvbihkb250UXVldWVVcGRhdGVzKXtcbiAgICAgICAgdmFyIG9iamVjdCA9IHNlbGYuX3dhdGNoaW5nLCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KSwgaT0wLCBsPWtleXMubGVuZ3RoO1xuICAgICAgICB2YXIgbmV3S2V5cyA9IFtdLCBvbGRLZXlzID0gcHJvcGVydGllcy5zbGljZSgwKSwgdXBkYXRlcyA9IFtdO1xuICAgICAgICB2YXIgcHJvcCwgcXVldWVVcGRhdGVzID0gIWRvbnRRdWV1ZVVwZGF0ZXMsIHByb3BUeXBlLCB2YWx1ZSwgaWR4LCBhTGVuZ3RoO1xuXG4gICAgICAgIGlmKG9iamVjdCBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgICAgICBhTGVuZ3RoID0gcHJvcGVydGllcy5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaT0wOyBpPGw7IGkrKyl7XG4gICAgICAgICAgcHJvcCA9IGtleXNbaV07XG4gICAgICAgICAgdmFsdWUgPSBvYmplY3RbcHJvcF07XG4gICAgICAgICAgcHJvcFR5cGUgPSB0eXBlb2YodmFsdWUpO1xuICAgICAgICAgIGlmKChpZHggPSBwcm9wZXJ0aWVzLmluZGV4T2YocHJvcCkpPT09LTEpe1xuICAgICAgICAgICAgaWYod3JhcFByb3BlcnR5KG9iamVjdCwgcHJvcCkmJnF1ZXVlVXBkYXRlcyl7XG4gICAgICAgICAgICAgIHNlbGYucXVldWVVcGRhdGUob2JqZWN0LCBwcm9wLCAnYWRkJywgbnVsbCwgb2JqZWN0W3Byb3BdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGlmKChvYmplY3QgaW5zdGFuY2VvZiBBcnJheSkmJihpc051bWVyaWMocHJvcCkpKXtcbiAgICAgICAgICAgICAgaWYoIXNhbWVWYWx1ZU5vdGlmeSh2YWx1ZXNbaWR4XSx2YWx1ZSkpe1xuICAgICAgICAgICAgICAgIGlmKHF1ZXVlVXBkYXRlcyl7XG4gICAgICAgICAgICAgICAgICBzZWxmLnF1ZXVlVXBkYXRlKG9iamVjdCwgcHJvcCwgJ3VwZGF0ZScsIHZhbHVlc1tpZHhdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmKHZhbHVlc1tpZHhdICE9PSB2YWx1ZSlcbiAgICAgICAgICAgICAgICB2YWx1ZXNbaWR4XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2xkS2V5cy5zcGxpY2Uob2xkS2V5cy5pbmRleE9mKHByb3ApLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihvYmplY3QgaW5zdGFuY2VvZiBBcnJheSAmJiBvYmplY3QubGVuZ3RoICE9PSBhTGVuZ3RoKXtcbiAgICAgICAgICBpZihxdWV1ZVVwZGF0ZXMpe1xuICAgICAgICAgICAgc2VsZi5xdWV1ZVVwZGF0ZShvYmplY3QsICdsZW5ndGgnLCAndXBkYXRlJywgYUxlbmd0aCwgb2JqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihxdWV1ZVVwZGF0ZXMpe1xuICAgICAgICAgIGwgPSBvbGRLZXlzLmxlbmd0aDtcbiAgICAgICAgICBmb3IoaT0wOyBpPGw7IGkrKyl7XG4gICAgICAgICAgICBpZHggPSBwcm9wZXJ0aWVzLmluZGV4T2Yob2xkS2V5c1tpXSk7XG4gICAgICAgICAgICBzZWxmLnF1ZXVlVXBkYXRlKG9iamVjdCwgb2xkS2V5c1tpXSwgJ2RlbGV0ZScsIHZhbHVlc1tpZHhdKTtcbiAgICAgICAgICAgIHByb3BlcnRpZXMuc3BsaWNlKGlkeCwxKTtcbiAgICAgICAgICAgIHZhbHVlcy5zcGxpY2UoaWR4LDEpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzZWxmLmFkZExpc3RlbmVyID0gZnVuY3Rpb24oY2FsbGJhY2ssIGFjY2VwdCl7XG4gICAgICAgIHZhciBpZHggPSBfbGlzdGVuZXJzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgICAgICBpZihpZHg9PT0tMSl7XG4gICAgICAgICAgX2xpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICBfYWNjZXB0TGlzdHMucHVzaChhY2NlcHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIF9hY2NlcHRMaXN0c1tpZHhdID0gYWNjZXB0O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc2VsZi5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcbiAgICAgICAgdmFyIGlkeCA9IF9saXN0ZW5lcnMuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgIGlmKGlkeD4tMSl7XG4gICAgICAgICAgX2xpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICBfYWNjZXB0TGlzdHMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzZWxmLmxpc3RlbmVycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBfbGlzdGVuZXJzO1xuICAgICAgfTtcbiAgICAgIHNlbGYucXVldWVVcGRhdGUgPSBmdW5jdGlvbih3aGF0LCBwcm9wLCB0eXBlLCB3YXMpe1xuICAgICAgICB0aGlzLnF1ZXVlVXBkYXRlcyhbe1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgb2JqZWN0OiB3aGF0LFxuICAgICAgICAgIG5hbWU6IHByb3AsXG4gICAgICAgICAgb2xkVmFsdWU6IHdhc1xuICAgICAgICB9XSk7XG4gICAgICB9O1xuICAgICAgc2VsZi5xdWV1ZVVwZGF0ZXMgPSBmdW5jdGlvbih1cGRhdGVzKXtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLCBpID0gMCwgbCA9IHVwZGF0ZXMubGVuZ3RofHwwLCB1cGRhdGU7XG4gICAgICAgIGZvcihpPTA7IGk8bDsgaSsrKXtcbiAgICAgICAgICB1cGRhdGUgPSB1cGRhdGVzW2ldO1xuICAgICAgICAgIF91cGRhdGVzLnB1c2godXBkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZihfdXBkYXRlcil7XG4gICAgICAgICAgX2NsZWFyQ2hlY2tDYWxsYmFjayhfdXBkYXRlcik7XG4gICAgICAgIH1cbiAgICAgICAgX3VwZGF0ZXIgPSBfZG9DaGVja0NhbGxiYWNrKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgX3VwZGF0ZXIgPSBmYWxzZTtcbiAgICAgICAgICBzZWxmLmRlbGl2ZXJDaGFuZ2VSZWNvcmRzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIHNlbGYuZGVsaXZlckNoYW5nZVJlY29yZHMgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgaSA9IDAsIGwgPSBfbGlzdGVuZXJzLmxlbmd0aCxcbiAgICAgICAgICAgIC8va2VlcFJ1bm5pbmcgPSB0cnVlLCByZW1vdmVkIGFzIGl0IHNlZW1zIHRoZSBhY3R1YWwgaW1wbGVtZW50YXRpb24gZG9lc24ndCBkbyB0aGlzXG4gICAgICAgICAgICAvLyBJbiByZXNwb25zZSB0byBCVUcgIzVcbiAgICAgICAgICAgIHJldHZhbDtcbiAgICAgICAgZm9yKGk9MDsgaTxsOyBpKyspe1xuICAgICAgICAgIGlmKF9saXN0ZW5lcnNbaV0pe1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRVcGRhdGVzO1xuICAgICAgICAgICAgaWYgKF9hY2NlcHRMaXN0c1tpXSkge1xuICAgICAgICAgICAgICBjdXJyZW50VXBkYXRlcyA9IFtdO1xuICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMCwgdXBkYXRlc0xlbmd0aCA9IF91cGRhdGVzLmxlbmd0aDsgaiA8IHVwZGF0ZXNMZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChfYWNjZXB0TGlzdHNbaV0uaW5kZXhPZihfdXBkYXRlc1tqXS50eXBlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRVcGRhdGVzLnB1c2goX3VwZGF0ZXNbal0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRVcGRhdGVzID0gX3VwZGF0ZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3VycmVudFVwZGF0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGlmKF9saXN0ZW5lcnNbaV09PT1jb25zb2xlLmxvZyl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY3VycmVudFVwZGF0ZXMpO1xuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBfbGlzdGVuZXJzW2ldKGN1cnJlbnRVcGRhdGVzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKlxuICAgICAgICBmb3IoaT0wOyBpPGwmJmtlZXBSdW5uaW5nOyBpKyspe1xuICAgICAgICAgIGlmKHR5cGVvZihfbGlzdGVuZXJzW2ldKT09PSdmdW5jdGlvbicpe1xuICAgICAgICAgICAgaWYoX2xpc3RlbmVyc1tpXT09PWNvbnNvbGUubG9nKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coX3VwZGF0ZXMpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIHJldHZhbCA9IF9saXN0ZW5lcnNbaV0oX3VwZGF0ZXMpO1xuICAgICAgICAgICAgICBpZih0eXBlb2YocmV0dmFsKSA9PT0gJ2Jvb2xlYW4nKXtcbiAgICAgICAgICAgICAgICBrZWVwUnVubmluZyA9IHJldHZhbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAqL1xuICAgICAgICBfdXBkYXRlcz1bXTtcbiAgICAgIH07XG4gICAgICBzZWxmLm5vdGlmeSA9IGZ1bmN0aW9uKGNoYW5nZVJlY29yZCkge1xuICAgICAgICBpZiAodHlwZW9mIGNoYW5nZVJlY29yZCAhPT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2hhbmdlUmVjb3JkLnR5cGUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBjaGFuZ2VSZWNvcmQgd2l0aCBub24tc3RyaW5nICd0eXBlJyBwcm9wZXJ0eVwiKTtcbiAgICAgICAgfVxuICAgICAgICBjaGFuZ2VSZWNvcmQub2JqZWN0ID0gd2F0Y2hpbmc7XG4gICAgICAgIHNlbGYucXVldWVVcGRhdGVzKFtjaGFuZ2VSZWNvcmRdKTtcbiAgICAgIH07XG4gICAgICBzZWxmLl9jaGVja1Byb3BlcnR5TGlzdGluZyh0cnVlKTtcbiAgICB9O1xuXG4gICAgdmFyIF9ub3RpZmllcnM9W10sIF9pbmRleGVzPVtdO1xuICAgIGV4dGVuZC5nZXROb3RpZmllciA9IGZ1bmN0aW9uKE8pe1xuICAgIHZhciBpZHggPSBfaW5kZXhlcy5pbmRleE9mKE8pLCBub3RpZmllciA9IGlkeD4tMT9fbm90aWZpZXJzW2lkeF06ZmFsc2U7XG4gICAgICBpZighbm90aWZpZXIpe1xuICAgICAgICBpZHggPSBfaW5kZXhlcy5sZW5ndGg7XG4gICAgICAgIF9pbmRleGVzW2lkeF0gPSBPO1xuICAgICAgICBub3RpZmllciA9IF9ub3RpZmllcnNbaWR4XSA9IG5ldyBOb3RpZmllcihPKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub3RpZmllcjtcbiAgICB9O1xuICAgIGV4dGVuZC5vYnNlcnZlID0gZnVuY3Rpb24oTywgY2FsbGJhY2ssIGFjY2VwdCl7XG4gICAgICAvLyBGb3IgQnVnIDQsIGNhbid0IG9ic2VydmUgRE9NIGVsZW1lbnRzIHRlc3RlZCBhZ2FpbnN0IGNhbnJ5IGltcGxlbWVudGF0aW9uIGFuZCBtYXRjaGVzXG4gICAgICBpZighaXNFbGVtZW50KE8pKXtcbiAgICAgICAgcmV0dXJuIG5ldyBPYnNlcnZlcihPLCBjYWxsYmFjaywgYWNjZXB0KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGV4dGVuZC51bm9ic2VydmUgPSBmdW5jdGlvbihPLCBjYWxsYmFjayl7XG4gICAgICB2YWxpZGF0ZUFyZ3VtZW50cyhPLCBjYWxsYmFjayk7XG4gICAgICB2YXIgaWR4ID0gX2luZGV4ZXMuaW5kZXhPZihPKSxcbiAgICAgICAgICBub3RpZmllciA9IGlkeD4tMT9fbm90aWZpZXJzW2lkeF06ZmFsc2U7XG4gICAgICBpZiAoIW5vdGlmaWVyKXtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbm90aWZpZXIucmVtb3ZlTGlzdGVuZXIoY2FsbGJhY2spO1xuICAgICAgaWYgKG5vdGlmaWVyLmxpc3RlbmVycygpLmxlbmd0aCA9PT0gMCl7XG4gICAgICAgIF9pbmRleGVzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICBfbm90aWZpZXJzLnNwbGljZShpZHgsIDEpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKE9iamVjdCwgdGhpcyk7XG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IENoYW5nZTtcblxuLyohXG4gKiBDaGFuZ2Ugb2JqZWN0IGNvbnN0cnVjdG9yXG4gKlxuICogVGhlIGBjaGFuZ2VgIG9iamVjdCBwYXNzZWQgdG8gT2JqZWN0Lm9ic2VydmUgY2FsbGJhY2tzXG4gKiBpcyBpbW11dGFibGUgc28gd2UgY3JlYXRlIGEgbmV3IG9uZSB0byBtb2RpZnkuXG4gKi9cblxuZnVuY3Rpb24gQ2hhbmdlIChwYXRoLCBjaGFuZ2UpIHtcbiAgdGhpcy5wYXRoID0gcGF0aDtcbiAgdGhpcy5uYW1lID0gY2hhbmdlLm5hbWU7XG4gIHRoaXMudHlwZSA9IGNoYW5nZS50eXBlO1xuICB0aGlzLm9iamVjdCA9IGNoYW5nZS5vYmplY3Q7XG4gIHRoaXMudmFsdWUgPSBjaGFuZ2Uub2JqZWN0W2NoYW5nZS5uYW1lXTtcbiAgdGhpcy5vbGRWYWx1ZSA9IGNoYW5nZS5vbGRWYWx1ZTtcbn1cblxuIiwiLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTpvYnNlcnZlXG5cbnZhciBDaGFuZ2UgPSByZXF1aXJlKCcuL2NoYW5nZScpO1xudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG4vLyB2YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdvYnNlcnZlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBPYnNlcnZhYmxlO1xuXG4vKipcbiAqIE9ic2VydmFibGUgY29uc3RydWN0b3IuXG4gKlxuICogVGhlIHBhc3NlZCBgc3ViamVjdGAgd2lsbCBiZSBvYnNlcnZlZCBmb3IgY2hhbmdlcyB0b1xuICogYWxsIHByb3BlcnRpZXMsIGluY2x1ZGVkIG5lc3RlZCBvYmplY3RzIGFuZCBhcnJheXMuXG4gKlxuICogQW4gYEV2ZW50RW1pdHRlcmAgd2lsbCBiZSByZXR1cm5lZC4gVGhpcyBlbWl0dGVyIHdpbGxcbiAqIGVtaXQgdGhlIGZvbGxvd2luZyBldmVudHM6XG4gKlxuICogLSBhZGRcbiAqIC0gdXBkYXRlXG4gKiAtIGRlbGV0ZVxuICogLSByZWNvbmZpZ3VyZVxuICpcbiAqIC8vIC0gc2V0UHJvdG90eXBlP1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdWJqZWN0XG4gKiBAcGFyYW0ge09ic2VydmFibGV9IFtwYXJlbnRdIChpbnRlcm5hbCB1c2UpXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ByZWZpeF0gKGludGVybmFsIHVzZSlcbiAqIEByZXR1cm4ge0V2ZW50RW1pdHRlcn1cbiAqL1xuXG5mdW5jdGlvbiBPYnNlcnZhYmxlIChzdWJqZWN0LCBwYXJlbnQsIHByZWZpeCkge1xuICBpZiAoJ29iamVjdCcgIT0gdHlwZW9mIHN1YmplY3QpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb2JqZWN0IGV4cGVjdGVkLiBnb3Q6ICcgKyB0eXBlb2Ygc3ViamVjdCk7XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE9ic2VydmFibGUpKVxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShzdWJqZWN0LCBwYXJlbnQsIHByZWZpeCk7XG5cbiAgLy8gZGVidWcoJ25ldycsIHN1YmplY3QsICEhcGFyZW50LCBwcmVmaXgpO1xuXG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fYmluZChzdWJqZWN0LCBwYXJlbnQsIHByZWZpeCk7XG59O1xuXG4vLyBhZGQgZW1pdHRlciBjYXBhYmlsaXRpZXNcbmZvciAodmFyIGkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgT2JzZXJ2YWJsZS5wcm90b3R5cGVbaV0gPSBFbWl0dGVyLnByb3RvdHlwZVtpXTtcbn1cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUub2JzZXJ2ZXJzID0gdW5kZWZpbmVkO1xuT2JzZXJ2YWJsZS5wcm90b3R5cGUub25jaGFuZ2UgPSB1bmRlZmluZWQ7XG5PYnNlcnZhYmxlLnByb3RvdHlwZS5zdWJqZWN0ID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIEJpbmRzIHRoaXMgT2JzZXJ2YWJsZSB0byBgc3ViamVjdGAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHN1YmplY3RcbiAqIEBwYXJhbSB7T2JzZXJ2YWJsZX0gW3BhcmVudF1cbiAqIEBwYXJhbSB7U3RyaW5nfSBbcHJlZml4XVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuX2JpbmQgPSBmdW5jdGlvbiAoc3ViamVjdCwgcGFyZW50LCBwcmVmaXgpIHtcbiAgaWYgKHRoaXMuc3ViamVjdCkgdGhyb3cgbmV3IEVycm9yKCdhbHJlYWR5IGJvdW5kIScpO1xuICBpZiAobnVsbCA9PSBzdWJqZWN0KSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzdWJqZWN0IGNhbm5vdCBiZSBudWxsJyk7XG5cbiAgLy8gZGVidWcoJ19iaW5kJywgc3ViamVjdCk7XG5cbiAgdGhpcy5zdWJqZWN0ID0gc3ViamVjdDtcblxuICBpZiAocGFyZW50KSB7XG4gICAgcGFyZW50Lm9ic2VydmVycy5wdXNoKHRoaXMpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMub2JzZXJ2ZXJzID0gW3RoaXNdO1xuICB9XG5cbiAgdGhpcy5vbmNoYW5nZSA9IG9uY2hhbmdlKHBhcmVudCB8fCB0aGlzLCBwcmVmaXgpO1xuICAvLyB2YXIgb25jaGFuID0gb25jaGFuZ2UocGFyZW50IHx8IHRoaXMsIHByZWZpeCk7XG4gIE9iamVjdC5vYnNlcnZlKHRoaXMuc3ViamVjdCwgdGhpcy5vbmNoYW5nZSk7XG5cbiAgdGhpcy5fd2FsayhwYXJlbnQgfHwgdGhpcywgcHJlZml4KTtcbn1cblxuLyoqXG4gKiBQZW5kaW5nIGNoYW5nZSBldmVudHMgYXJlIG5vdCBlbWl0dGVkIHVudGlsIGFmdGVyIHRoZSBuZXh0XG4gKiB0dXJuIG9mIHRoZSBldmVudCBsb29wLiBUaGlzIG1ldGhvZCBmb3JjZXMgdGhlIGVuZ2luZXMgaGFuZFxuICogYW5kIHRyaWdnZXJzIGFsbCBldmVudHMgbm93LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuZGVsaXZlckNoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGRlYnVnKCdkZWxpdmVyQ2hhbmdlcycpXG4gIHRoaXMub2JzZXJ2ZXJzLmZvckVhY2goZnVuY3Rpb24obykge1xuICAgIE9iamVjdC5kZWxpdmVyQ2hhbmdlUmVjb3JkcyhvLm9uY2hhbmdlKTtcbiAgfSk7XG59XG5cbi8qKlxuICogV2FsayBkb3duIHRocm91Z2ggdGhlIHRyZWUgb2Ygb3VyIGBzdWJqZWN0YCwgb2JzZXJ2aW5nXG4gKiBvYmplY3RzIGFsb25nIHRoZSB3YXkuXG4gKlxuICogQHBhcmFtIHtPYnNlcnZhYmxlfSBbcGFyZW50XVxuICogQHBhcmFtIHtTdHJpbmd9IFtwcmVmaXhdXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5fd2FsayA9IGZ1bmN0aW9uIChwYXJlbnQsIHByZWZpeCkge1xuICAvLyBkZWJ1ZygnX3dhbGsnKTtcblxuICB2YXIgb2JqZWN0ID0gdGhpcy5zdWJqZWN0O1xuXG4gIC8vIGtleXM/XG4gIE9iamVjdC5rZXlzKG9iamVjdCkuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtuYW1lXTtcblxuICAgIGlmICgnb2JqZWN0JyAhPSB0eXBlb2YgdmFsdWUpIHJldHVybjtcbiAgICBpZiAobnVsbCA9PSB2YWx1ZSkgcmV0dXJuO1xuXG4gICAgdmFyIHBhdGggPSBwcmVmaXhcbiAgICAgID8gcHJlZml4ICsgJ15eJyArIG5hbWVcbiAgICAgIDogbmFtZTtcblxuICAgIG5ldyBPYnNlcnZhYmxlKHZhbHVlLCBwYXJlbnQsIHBhdGgpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTdG9wIGxpc3RlbmluZyB0byBhbGwgYm91bmQgb2JqZWN0c1xuICovXG5cbk9ic2VydmFibGUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGRlYnVnKCdzdG9wJyk7XG5cbiAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaChmdW5jdGlvbiAob2JzZXJ2ZXIpIHtcbiAgICBPYmplY3QudW5vYnNlcnZlKG9ic2VydmVyLnN1YmplY3QsIG9ic2VydmVyLm9uY2hhbmdlKTtcbiAgfSk7XG59XG5cbk9ic2VydmFibGUucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgLy8gZGVidWcoJ3N0b3AnKTtcblxuICByZXR1cm4gdGhpcy5vYnNlcnZlcnMuZmlsdGVyKGZ1bmN0aW9uIChvYnNlcnZlcikge1xuICAgIGlmIChzdWJqZWN0ID09IG9ic2VydmVyLnN1YmplY3QpIHtcbiAgICAgIG9ic2VydmVyLl9pc1BhdXNlZCA9IHRydWU7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5pc1BhdXNlZCA9IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gIC8vIGRlYnVnKCdzdG9wJyk7XG5cbiAgdmFyIHBhdXNlZCA9IHRoaXMub2JzZXJ2ZXJzLmZpbHRlcihmdW5jdGlvbiAob2JzZXJ2ZXIpIHtcbiAgICBpZiAoc3ViamVjdCA9PSBvYnNlcnZlci5zdWJqZWN0ICYmIG9ic2VydmVyLl9pc1BhdXNlZCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbiAgaWYocGF1c2VkLmxlbmd0aCA+IDApIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG5cbn1cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24gKG9ic2VydmVyKSB7XG4gIC8vIGRlYnVnKCdzdG9wJyk7XG4gIGlmKG9ic2VydmVyICE9IG51bGwgJiYgb2JzZXJ2ZXIubGVuZ3RoID4gMCAmJiBvYnNlcnZlclswXS5zdWJqZWN0ICE9IG51bGwgJiYgb2JzZXJ2ZXJbMF0ub25jaGFuZ2UgIT0gbnVsbClcbiAge1xuICAgICBvYnNlcnZlclswXS5faXNQYXVzZWQgPSBmYWxzZTtcbiAgfVxuICAvLyB0aGlzLm9ic2VydmVycy5maWx0ZXIoZnVuY3Rpb24gKG9ic2VydmVyKSB7XG4gIC8vICAgaWYgKHN1YmplY3QgPT0gb2JzZXJ2ZXIuc3ViamVjdCkge1xuICAvLyAgICAgT2JqZWN0Lm9ic2VydmUob2JzZXJ2ZXIuc3ViamVjdCwgb2JzZXJ2ZXIub25jaGFuZ2UpO1xuICAvLyAgICAgcmV0dXJuIHRydWU7XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBmYWxzZTtcbiAgLy8gfSk7XG59XG4vKipcbiAqIFN0b3AgbGlzdGVuaW5nIHRvIGNoYW5nZXMgb24gYHN1YmplY3RgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHN1YmplY3RcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbk9ic2VydmFibGUucHJvdG90eXBlLl9yZW1vdmUgPSBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAvLyBkZWJ1ZygnX3JlbW92ZScsIHN1YmplY3QpO1xuXG4gIHRoaXMub2JzZXJ2ZXJzID0gdGhpcy5vYnNlcnZlcnMuZmlsdGVyKGZ1bmN0aW9uIChvYnNlcnZlcikge1xuICAgIGlmIChzdWJqZWN0ID09PSBvYnNlcnZlci5zdWJqZWN0KSB7XG4gICAgICBPYmplY3QudW5vYnNlcnZlKG9ic2VydmVyLnN1YmplY3QsIG9ic2VydmVyLm9uY2hhbmdlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG5cbi8qIVxuICogQ3JlYXRlcyBhbiBPYmplY3Qub2JzZXJ2ZSBgb25jaGFuZ2VgIGxpc3RlbmVyXG4gKi9cblxuZnVuY3Rpb24gb25jaGFuZ2UgKHBhcmVudCwgcHJlZml4KSB7XG4gIHJldHVybiBmdW5jdGlvbiAoYXJ5KSB7XG4gICAgLy8gZGVidWcoJ29uY2hhbmdlJywgcHJlZml4KTtcblxuICAgIGFyeS5mb3JFYWNoKGZ1bmN0aW9uIChjaGFuZ2UpIHtcbiAgICAgIHZhciBvYmplY3QgPSBjaGFuZ2Uub2JqZWN0O1xuICAgICAgdmFyIHR5cGUgPSBjaGFuZ2UudHlwZTtcbiAgICAgIHZhciBuYW1lID0gY2hhbmdlLm5hbWU7XG4gICAgICB2YXIgdmFsdWUgPSBvYmplY3RbbmFtZV07XG5cbiAgICAgIHZhciBwYXRoID0gcHJlZml4XG4gICAgICAgID8gcHJlZml4ICsgJ15eJyArIG5hbWVcbiAgICAgICAgOiBuYW1lXG4gICAgICBcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoIGNoYW5nZS5vYmplY3QgKSA9PT0gJ1tvYmplY3QgQXJyYXldJyAmJiBudWxsICE9IHZhbHVlICYmICdvYmplY3QnID09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICBuZXcgT2JzZXJ2YWJsZSh2YWx1ZSwgcGFyZW50LCBwYXRoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCdhZGQnID09IHR5cGUgJiYgbnVsbCAhPSB2YWx1ZSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgbmV3IE9ic2VydmFibGUodmFsdWUsIHBhcmVudCwgcGF0aCk7XG4gICAgICB9IGVsc2UgaWYgKCdkZWxldGUnID09IHR5cGUgJiYgJ29iamVjdCcgPT0gdHlwZW9mIGNoYW5nZS5vbGRWYWx1ZSkge1xuICAgICAgICBwYXJlbnQuX3JlbW92ZShjaGFuZ2Uub2xkVmFsdWUpO1xuICAgICAgfVxuICAgICAgaWYoIXBhcmVudC5pc1BhdXNlZChjaGFuZ2Uub2JqZWN0KSkge1xuICAgICAgICBjaGFuZ2UgPSBuZXcgQ2hhbmdlKHBhdGgsIGNoYW5nZSk7XG4gICAgICAgIHBhcmVudC5lbWl0KHR5cGUsIGNoYW5nZSk7XG4gICAgICAgIHBhcmVudC5lbWl0KHR5cGUgKyAnICcgKyBwYXRoLCBjaGFuZ2UpO1xuICAgICAgICBwYXJlbnQuZW1pdCgnY2hhbmdlJywgY2hhbmdlKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsImNsYXNzIE5vdGlmaWNhdGlvblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICBzaG93OiAodGl0bGUsIG1lc3NhZ2UpIC0+XG4gICAgdW5pcXVlSWQgPSAobGVuZ3RoPTgpIC0+XG4gICAgICBpZCA9IFwiXCJcbiAgICAgIGlkICs9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKSB3aGlsZSBpZC5sZW5ndGggPCBsZW5ndGhcbiAgICAgIGlkLnN1YnN0ciAwLCBsZW5ndGhcblxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSB1bmlxdWVJZCgpLFxuICAgICAgdHlwZTonYmFzaWMnXG4gICAgICB0aXRsZTp0aXRsZVxuICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgICAgaWNvblVybDonaW1hZ2VzL2ljb24tMzgucG5nJyxcbiAgICAgIChjYWxsYmFjaykgLT5cbiAgICAgICAgdW5kZWZpbmVkXG5cbm1vZHVsZS5leHBvcnRzID0gTm90aWZpY2F0aW9uIiwiI1RPRE86IHJld3JpdGUgdGhpcyBjbGFzcyB1c2luZyB0aGUgbmV3IGNocm9tZS5zb2NrZXRzLiogYXBpIHdoZW4geW91IGNhbiBtYW5hZ2UgdG8gbWFrZSBpdCB3b3JrXG5jbGFzcyBTZXJ2ZXJcbiAgc29ja2V0OiBjaHJvbWUuc29ja2V0XG4gICMgdGNwOiBjaHJvbWUuc29ja2V0cy50Y3BcbiAgc29ja2V0UHJvcGVydGllczpcbiAgICAgIHBlcnNpc3RlbnQ6dHJ1ZVxuICAgICAgbmFtZTonU0xSZWRpcmVjdG9yJ1xuICAjIHNvY2tldEluZm86bnVsbFxuICBnZXRMb2NhbEZpbGU6bnVsbFxuICBzb2NrZXRJZHM6W11cbiAgc3RhdHVzOlxuICAgIGhvc3Q6bnVsbFxuICAgIHBvcnQ6bnVsbFxuICAgIG1heENvbm5lY3Rpb25zOjUwXG4gICAgaXNPbjpmYWxzZVxuICAgIHNvY2tldEluZm86bnVsbFxuICAgIHVybDpudWxsXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQHN0YXR1cy5ob3N0ID0gXCIxMjcuMC4wLjFcIlxuICAgIEBzdGF0dXMucG9ydCA9IDEwMDEyXG4gICAgQHN0YXR1cy5tYXhDb25uZWN0aW9ucyA9IDUwXG4gICAgQHN0YXR1cy51cmwgPSAnaHR0cDovLycgKyBAc3RhdHVzLmhvc3QgKyAnOicgKyBAc3RhdHVzLnBvcnQgKyAnLydcbiAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuXG5cbiAgc3RhcnQ6IChob3N0LHBvcnQsbWF4Q29ubmVjdGlvbnMsIGNiKSAtPlxuICAgIGlmIGhvc3Q/IHRoZW4gQHN0YXR1cy5ob3N0ID0gaG9zdFxuICAgIGlmIHBvcnQ/IHRoZW4gQHN0YXR1cy5wb3J0ID0gcG9ydFxuICAgIGlmIG1heENvbm5lY3Rpb25zPyB0aGVuIEBzdGF0dXMubWF4Q29ubmVjdGlvbnMgPSBtYXhDb25uZWN0aW9uc1xuXG4gICAgQGtpbGxBbGwgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgIHJldHVybiBjYj8gZXJyIGlmIGVycj9cblxuICAgICAgQHN0YXR1cy5pc09uID0gZmFsc2VcbiAgICAgIEBzb2NrZXQuY3JlYXRlICd0Y3AnLCB7fSwgKHNvY2tldEluZm8pID0+XG4gICAgICAgIEBzdGF0dXMuc29ja2V0SW5mbyA9IHNvY2tldEluZm9cbiAgICAgICAgQHNvY2tldElkcyA9IFtdXG4gICAgICAgIEBzb2NrZXRJZHMucHVzaCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQgJ3NvY2tldElkcyc6QHNvY2tldElkc1xuICAgICAgICBAc29ja2V0Lmxpc3RlbiBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBzdGF0dXMuaG9zdCwgQHN0YXR1cy5wb3J0LCAocmVzdWx0KSA9PlxuICAgICAgICAgIGlmIHJlc3VsdCA+IC0xXG4gICAgICAgICAgICBzaG93ICdsaXN0ZW5pbmcgJyArIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICAgICAgQHN0YXR1cy5pc09uID0gdHJ1ZVxuICAgICAgICAgICAgQHNvY2tldC5hY2NlcHQgQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG4gICAgICAgICAgICBjYj8gbnVsbCwgQHN0YXR1c1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNiPyByZXN1bHRcblxuXG4gIGtpbGxBbGw6IChjYikgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCAnc29ja2V0SWRzJywgKHJlc3VsdCkgPT5cbiAgICAgIEBzb2NrZXRJZHMgPSByZXN1bHQuc29ja2V0SWRzXG4gICAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuICAgICAgcmV0dXJuIGNiPyBudWxsLCAnc3VjY2VzcycgdW5sZXNzIEBzb2NrZXRJZHM/XG4gICAgICBjbnQgPSAwXG4gICAgICBmb3IgcyBpbiBAc29ja2V0SWRzXG4gICAgICAgIGRvIChzKSA9PlxuICAgICAgICAgIGNudCsrXG4gICAgICAgICAgQHNvY2tldC5nZXRJbmZvIHMsIChzb2NrZXRJbmZvKSA9PlxuICAgICAgICAgICAgY250LS1cbiAgICAgICAgICAgIGlmIG5vdCBjaHJvbWUucnVudGltZS5sYXN0RXJyb3I/XG4gICAgICAgICAgICAgIEBzb2NrZXQuZGlzY29ubmVjdCBzIGlmIEBzdGF0dXMuc29ja2V0SW5mbz8uY29ubmVjdGVkIG9yIG5vdCBAc3RhdHVzLnNvY2tldEluZm8/XG4gICAgICAgICAgICAgIEBzb2NrZXQuZGVzdHJveSBzXG5cbiAgICAgICAgICAgIGNiPyBudWxsLCAnc3VjY2VzcycgaWYgY250IGlzIDBcblxuICBzdG9wOiAoY2IpIC0+XG4gICAgQGtpbGxBbGwgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgIGlmIGVycj8gXG4gICAgICAgIGNiPyBlcnJcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsc3VjY2Vzc1xuXG5cbiAgX29uUmVjZWl2ZTogKHJlY2VpdmVJbmZvKSA9PlxuICAgIHNob3coXCJDbGllbnQgc29ja2V0ICdyZWNlaXZlJyBldmVudDogc2Q9XCIgKyByZWNlaXZlSW5mby5zb2NrZXRJZFxuICAgICsgXCIsIGJ5dGVzPVwiICsgcmVjZWl2ZUluZm8uZGF0YS5ieXRlTGVuZ3RoKVxuXG4gIF9vbkxpc3RlbjogKHNlcnZlclNvY2tldElkLCByZXN1bHRDb2RlKSA9PlxuICAgIHJldHVybiBzaG93ICdFcnJvciBMaXN0ZW5pbmc6ICcgKyBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSBpZiByZXN1bHRDb2RlIDwgMFxuICAgIEBzZXJ2ZXJTb2NrZXRJZCA9IHNlcnZlclNvY2tldElkXG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdC5hZGRMaXN0ZW5lciBAX29uQWNjZXB0XG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdEVycm9yLmFkZExpc3RlbmVyIEBfb25BY2NlcHRFcnJvclxuICAgIEB0Y3Aub25SZWNlaXZlLmFkZExpc3RlbmVyIEBfb25SZWNlaXZlXG4gICAgIyBzaG93IFwiW1wiK3NvY2tldEluZm8ucGVlckFkZHJlc3MrXCI6XCIrc29ja2V0SW5mby5wZWVyUG9ydCtcIl0gQ29ubmVjdGlvbiBhY2NlcHRlZCFcIjtcbiAgICAjIGluZm8gPSBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAjIEBnZXRGaWxlIHVyaSwgKGZpbGUpIC0+XG4gIF9vbkFjY2VwdEVycm9yOiAoZXJyb3IpIC0+XG4gICAgc2hvdyBlcnJvclxuXG4gIF9vbkFjY2VwdDogKHNvY2tldEluZm8pID0+XG4gICAgIyByZXR1cm4gbnVsbCBpZiBpbmZvLnNvY2tldElkIGlzbnQgQHNlcnZlclNvY2tldElkXG4gICAgc2hvdyhcIlNlcnZlciBzb2NrZXQgJ2FjY2VwdCcgZXZlbnQ6IHNkPVwiICsgc29ja2V0SW5mby5zb2NrZXRJZClcbiAgICBpZiBzb2NrZXRJbmZvPy5zb2NrZXRJZD9cbiAgICAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZCwgKGVyciwgaW5mbykgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gQF93cml0ZUVycm9yIHNvY2tldEluZm8uc29ja2V0SWQsIDQwNCwgaW5mby5rZWVwQWxpdmVcblxuICAgICAgICBAZ2V0TG9jYWxGaWxlIGluZm8sIChlcnIsIGZpbGVFbnRyeSwgZmlsZVJlYWRlcikgPT5cbiAgICAgICAgICBpZiBlcnI/IHRoZW4gQF93cml0ZUVycm9yIHNvY2tldEluZm8uc29ja2V0SWQsIDQwNCwgaW5mby5rZWVwQWxpdmVcbiAgICAgICAgICBlbHNlIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJbmZvLnNvY2tldElkLCBmaWxlRW50cnksIGZpbGVSZWFkZXIsIGluZm8ua2VlcEFsaXZlXG4gICAgZWxzZVxuICAgICAgc2hvdyBcIk5vIHNvY2tldD8hXCJcbiAgICAjIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuXG5cbiAgc3RyaW5nVG9VaW50OEFycmF5OiAoc3RyaW5nKSAtPlxuICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgaSA9IDBcblxuICAgIHdoaWxlIGkgPCBzdHJpbmcubGVuZ3RoXG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgIGkrK1xuICAgIHZpZXdcblxuICBhcnJheUJ1ZmZlclRvU3RyaW5nOiAoYnVmZmVyKSAtPlxuICAgIHN0ciA9IFwiXCJcbiAgICB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgcyA9IDBcblxuICAgIHdoaWxlIHMgPCB1QXJyYXlWYWwubGVuZ3RoXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pXG4gICAgICBzKytcbiAgICBzdHJcblxuICBfd3JpdGUyMDBSZXNwb25zZTogKHNvY2tldElkLCBmaWxlRW50cnksIGZpbGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBjb250ZW50VHlwZSA9IChpZiAoZmlsZS50eXBlIGlzIFwiXCIpIHRoZW4gXCJ0ZXh0L3BsYWluXCIgZWxzZSBmaWxlLnR5cGUpXG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+XG4gICAgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShldi50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgICAgc2hvdyB3cml0ZUluZm9cbiAgICAgICAgIyBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5vbmVycm9yID0gKGVycm9yKSA9PlxuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGZpbGVcblxuXG4gICAgIyBAZW5kIHNvY2tldElkXG4gICAgIyBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICMgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgPT5cbiAgICAjICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAjICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICMgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAjICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJZFxuXG5cbiAgX3JlYWRGcm9tU29ja2V0OiAoc29ja2V0SWQsIGNiKSAtPlxuICAgIEBzb2NrZXQucmVhZCBzb2NrZXRJZCwgKHJlYWRJbmZvKSA9PlxuICAgICAgc2hvdyBcIlJFQURcIiwgcmVhZEluZm9cblxuICAgICAgIyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIGRhdGEgPSBAYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKVxuICAgICAgc2hvdyBkYXRhXG5cbiAgICAgIGtlZXBBbGl2ZSA9IGZhbHNlXG4gICAgICBrZWVwQWxpdmUgPSB0cnVlIGlmIGRhdGEuaW5kZXhPZiAnQ29ubmVjdGlvbjoga2VlcC1hbGl2ZScgaXNudCAtMVxuXG4gICAgICBpZiBkYXRhLmluZGV4T2YoXCJHRVQgXCIpIGlzbnQgMFxuICAgICAgICByZXR1cm4gY2I/ICc0MDQnLCBrZWVwQWxpdmU6a2VlcEFsaXZlXG5cblxuXG4gICAgICB1cmlFbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIDQpXG5cbiAgICAgIHJldHVybiBlbmQgc29ja2V0SWQgaWYgdXJpRW5kIDwgMFxuXG4gICAgICB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpXG4gICAgICBpZiBub3QgdXJpP1xuICAgICAgICByZXR1cm4gY2I/ICc0MDQnLCBrZWVwQWxpdmU6a2VlcEFsaXZlXG5cbiAgICAgIGluZm8gPVxuICAgICAgICB1cmk6IHVyaVxuICAgICAgICBrZWVwQWxpdmU6a2VlcEFsaXZlXG4gICAgICBpbmZvLnJlZmVyZXIgPSBkYXRhLm1hdGNoKC9SZWZlcmVyOlxccyguKikvKT9bMV1cbiAgICAgICNzdWNjZXNzXG4gICAgICBjYj8gbnVsbCwgaW5mb1xuXG4gIGVuZDogKHNvY2tldElkLCBrZWVwQWxpdmUpIC0+XG4gICAgICAjIGlmIGtlZXBBbGl2ZVxuICAgICAgIyAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICMgZWxzZVxuICAgIEBzb2NrZXQuZGlzY29ubmVjdCBzb2NrZXRJZFxuICAgIEBzb2NrZXQuZGVzdHJveSBzb2NrZXRJZFxuICAgIHNob3cgJ2VuZGluZyAnICsgc29ja2V0SWRcbiAgICBAc29ja2V0LmFjY2VwdCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuICBfd3JpdGVFcnJvcjogKHNvY2tldElkLCBlcnJvckNvZGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBmaWxlID0gc2l6ZTogMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGJlZ2luLi4uIFwiXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogZmlsZSA9IFwiICsgZmlsZVxuICAgIGNvbnRlbnRUeXBlID0gXCJ0ZXh0L3BsYWluXCIgIyhmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCBcIiArIGVycm9yQ29kZSArIFwiIE5vdCBGb3VuZFxcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoKGlmIGtlZXBBbGl2ZSB0aGVuIFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIGVsc2UgXCJcIikpICsgXCJcXG5cXG5cIilcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgaGVhZGVyLi4uXCJcbiAgICBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldCBoZWFkZXIsIDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgdmlldy4uLlwiXG4gICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICAgc2hvdyBcIldSSVRFXCIsIHdyaXRlSW5mb1xuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG5cbm1vZHVsZS5leHBvcnRzID0gU2VydmVyXG4iLCJMSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG4jIHdpbmRvdy5PYnNlcnZhYmxlID0gcmVxdWlyZSAnLi9vYnNlcnZlLmNvZmZlZSdcbnJlcXVpcmUgJ09iamVjdC1vYnNlcnZlLXBvbHlmaWxsJ1xuT2JzZXJ2YWJsZSA9IHJlcXVpcmUgJ29ic2VydmVkJ1xuXG5jbGFzcyBTdG9yYWdlXG4gIGFwaTogY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIGRhdGE6IFxuICAgIGN1cnJlbnRSZXNvdXJjZXM6IFtdXG4gICAgZGlyZWN0b3JpZXM6W11cbiAgICBtYXBzOltdXG4gICAgdGFiTWFwczp7fVxuICAgIGN1cnJlbnRGaWxlTWF0Y2hlczp7fVxuICBcbiAgc2Vzc2lvbjp7fVxuXG4gIG9uRGF0YUxvYWRlZDogLT5cblxuICBjYWxsYmFjazogKCkgLT5cbiAgbm90aWZ5T25DaGFuZ2U6ICgpIC0+XG4gIGNvbnN0cnVjdG9yOiAoX29uRGF0YUxvYWRlZCkgLT5cbiAgICBAb25EYXRhTG9hZGVkID0gX29uRGF0YUxvYWRlZCBpZiBfb25EYXRhTG9hZGVkP1xuICAgIEBhcGkuZ2V0IChyZXN1bHRzKSA9PlxuICAgICAgQGRhdGFba10gPSByZXN1bHRzW2tdIGZvciBrIG9mIHJlc3VsdHNcblxuICAgICAgd2F0Y2hBbmROb3RpZnkgQCwnZGF0YUNoYW5nZWQnLCBAZGF0YSwgdHJ1ZVxuXG4gICAgICBAb25EYXRhTG9hZGVkIEBkYXRhXG5cbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgLT5cbiAgICB3YXRjaEFuZE5vdGlmeSBALCdzZXNzaW9uRGF0YScsIEBzZXNzaW9uLCBmYWxzZVxuICAgICMgQHJldHJpZXZlQWxsKClcblxuICBcbiAgaXNBcnJheTogLT4gXG4gICAgQXJyYXkuaXNBcnJheSB8fCAoIHZhbHVlICkgLT4gcmV0dXJuIHt9LnRvU3RyaW5nLmNhbGwoIHZhbHVlICkgaXMgJ1tvYmplY3QgQXJyYXldJ1xuXG4gIHdhdGNoQW5kTm90aWZ5ID0gKF90aGlzLCBtc2dLZXksIG9iaiwgc3RvcmUpIC0+XG4gICAgICBfdGhpcy5vYnNlcnZlciA9IE9ic2VydmFibGUgb2JqXG4gICAgICBfdGhpcy5vYnNlcnZlci5vbiAnY2hhbmdlJywgKGNoYW5nZSkgLT5cbiAgICAgICAgIyBpZiBjaGFuZ2UubmFtZSBpcyAnbGVuZ3RoJyAgICAgICAgICBcbiAgICAgICAgIyAgIHBhdGggPSBjaGFuZ2UucGF0aC5zcGxpdCgnXl4nKVxuICAgICAgICAjICAgc2F2ZUFyciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNoYW5nZS5vYmplY3RbcGF0aFswXV0pIFxuICAgICAgICAjICAgY2hhbmdlLm9iamVjdFtwYXRoWzBdXS5sZW5ndGggPSAwXG4gICAgICAgICMgICBzZXRUaW1lb3V0ICgpIC0+XG4gICAgICAgICMgICAgIGNoYW5nZS5vYmplY3RbcGF0aFswXV0gPSBzYXZlQXJyXG4gICAgICAgIHNob3cgY2hhbmdlXG4gICAgICAgIF90aGlzLmFwaS5zZXQgb2JqIGlmIHN0b3JlXG4gICAgICAgIG1zZyA9IHt9XG4gICAgICAgIG1zZ1ttc2dLZXldID0gY2hhbmdlXG4gICAgICAgIF90aGlzLk1TRy5FeHRQb3J0IG1zZ1xuXG4gICAgICBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCAoIHZhbHVlICkgLT4gcmV0dXJuIHt9LnRvU3RyaW5nLmNhbGwoIHZhbHVlICkgaXMgJ1tvYmplY3QgQXJyYXldJ1xuXG4gICAgICBfdGhpcy5MSVNURU4uRXh0IG1zZ0tleSwgKGNoYW5nZSkgLT5cbiAgICAgICAgc2hvdyBjaGFuZ2VcbiAgICAgICAgb2JqID89IHt9XG4gICAgICAgICMgc2hvdyAnZGF0YSBjaGFuZ2VkICdcbiAgICAgICAgIyBzaG93IGNoYW5nZVxuICAgICAgICAjIHJldHVybiBpZiBfdGhpcy5pc0FycmF5KGNoYW5nZS5vYmplY3QpXG5cbiAgICAgICAgKChkYXRhLCBhcGksIG9ic2VydmVyKSAtPlxuICAgICAgICAgIHN0YWNrID0gY2hhbmdlLnBhdGguc3BsaXQgJ15eJ1xuXG4gICAgICAgICAgcmV0dXJuIGRhdGFbc3RhY2tbMF1dID0gY2hhbmdlLnZhbHVlIGlmIG5vdCBkYXRhW3N0YWNrWzBdXT9cblxuICAgICAgICAgIHdoaWxlIHN0YWNrLmxlbmd0aCA+IDAgXG4gICAgICAgICAgICBfc2hpZnQgPSBzdGFjay5zaGlmdCgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YWNrLmxlbmd0aCA+IDAgYW5kIGlzQXJyYXkoZGF0YVtfc2hpZnRdKSBhbmQgY2hhbmdlLm5hbWUgaXMgc3RhY2tbMF1cbiAgICAgICAgICAgICAgbmV3QXJyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY2hhbmdlLm9iamVjdClcbiAgICAgICAgICAgICAgIyBPYnNlcnZhYmxlIG5ld0FyclxuICAgICAgICAgICAgICBkYXRhW19zaGlmdF0gPSBuZXdBcnJcbiAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICAgIGlmIC9eXFxkKyQvLnRlc3QgX3NoaWZ0IFxuICAgICAgICAgICAgICBfc2hpZnQgPSBwYXJzZUludCBfc2hpZnRcbiAgICAgICAgICAgICAgIyBlbHNlIGlmIGNoYW5nZS50eXBlIGlzICd1cGRhdGUnIGFuZCBjaGFuZ2UubmFtZSBpcyAnbGVuZ3RoJ1xuXG4gICAgICAgICAgICBkYXRhID0gZGF0YVtfc2hpZnRdIHVubGVzcyBzdGFjay5sZW5ndGggaXMgMFxuXG4gICAgICAgICAgcGF1c2VkID0gb2JzZXJ2ZXIucGF1c2UgZGF0YVxuICAgICAgICAgIGRhdGFbX3NoaWZ0XSA9IGNoYW5nZS52YWx1ZVxuXG4gICAgICAgICAgc2V0VGltZW91dCAoKSAtPlxuICAgICAgICAgICAgICBvYnNlcnZlci5yZXN1bWUgcGF1c2VkXG4gICAgICAgICAgLDIwICBcbiAgICAgICAgKShvYmosIF90aGlzLmFwaSwgX3RoaXMub2JzZXJ2ZXIpICAgIFxuXG4gIHNhdmU6IChrZXksIGl0ZW0sIGNiKSAtPlxuXG4gICAgb2JqID0ge31cbiAgICBvYmpba2V5XSA9IGl0ZW1cbiAgICBAZGF0YVtrZXldID0gaXRlbVxuICAgIEBhcGkuc2V0IG9iaiwgKHJlcykgPT5cbiAgICAgIGNiPygpXG4gICAgICBAY2FsbGJhY2s/KClcbiBcbiAgc2F2ZUFsbDogKGRhdGEsIGNiKSAtPlxuXG4gICAgaWYgZGF0YT8gXG4gICAgICBAYXBpLnNldCBkYXRhLCAoKSA9PlxuICAgICAgICBjYj8oKVxuXG4gICAgICAgICMgQGNhbGxiYWNrPygpXG4gICAgZWxzZVxuICAgICAgQGFwaS5zZXQgQGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG5cbiAgICAgICAgIyBAY2FsbGJhY2s/KClcbiAgICAjIHNob3cgJ3NhdmVBbGwgQGRhdGE6ICcgKyBAZGF0YS5zb2NrZXRJZHM/WzBdXG4gICAgIyBzaG93ICdzYXZlQWxsIGRhdGE6ICcgKyBkYXRhLnNvY2tldElkcz9bMF1cblxuICByZXRyaWV2ZTogKGtleSwgY2IpIC0+XG4gICAgQG9ic2VydmVyLnN0b3AoKVxuICAgIEBhcGkuZ2V0IGtleSwgKHJlc3VsdHMpIC0+XG4gICAgICBAZGF0YVtyXSA9IHJlc3VsdHNbcl0gZm9yIHIgb2YgcmVzdWx0c1xuICAgICAgaWYgY2I/IHRoZW4gY2IgcmVzdWx0c1trZXldXG5cbiAgcmV0cmlldmVBbGw6IChjYikgLT5cbiAgICAjIEBvYnNlcnZlci5zdG9wKClcbiAgICBAYXBpLmdldCAocmVzdWx0KSA9PlxuICAgICAgZm9yIGMgb2YgcmVzdWx0IFxuICAgICAgIyAgIGRlbGV0ZSBAZGF0YVtjXVxuICAgICAgICBAZGF0YVtjXSA9IHJlc3VsdFtjXSBcbiAgICAgICMgQGRhdGEgPSByZXN1bHRcbiAgICAgICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6XG4gICAgICAgICAgcGF0aDpjXG4gICAgICAgICAgdmFsdWU6cmVzdWx0W2NdXG4gICAgICBAb2JzZXJ2ZXIgPSBPYnNlcnZhYmxlIEBkYXRhXG4gICAgICBAb2JzZXJ2ZXIub24gJ2NoYW5nZScsIChjaGFuZ2UpID0+XG4gICAgICAgIGlmIGNoYW5nZS5uYW1lIGlzbnQgJ2xlbmd0aCdcbiAgICAgICAgICBzaG93IGNoYW5nZVxuICAgICAgICAgIEBhcGkuc2V0IEBkYXRhXG4gICAgICAgICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6Y2hhbmdlIFxuXG4gICAgICBAYXBpLnNldCBAZGF0YVxuICAgICAgIyBAY2FsbGJhY2s/IHJlc3VsdFxuICAgICAgY2I/IHJlc3VsdFxuICAgICAgQG9uRGF0YUxvYWRlZCBAZGF0YVxuXG4gICAgICAjIEBNU0cuRXh0UG9ydCAnZGF0YUNoYW5nZWQnOlxuICAgICAgIyBAb2JzZXJ2ZXIgPSBPYnNlcnZhYmxlIEBkYXRhXG4gICAgICAjIEBvYnNlcnZlci5vbiAnY2hhbmdlJywgKGNoYW5nZSkgPT5cbiAgICAgICMgICBzaG93ICd0ZWxsIGNoYW5naW5nIGRhdGEnXG4gICAgICAjICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6Y2hhbmdlXG5cbiAgb25EYXRhTG9hZGVkOiAoZGF0YSkgLT5cblxuICBvbkNoYW5nZWQ6IChrZXksIGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgaWYgY2hhbmdlc1trZXldPyBhbmQgY2I/IHRoZW4gY2IgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuICBvbkNoYW5nZWRBbGw6ICgpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLG5hbWVzcGFjZSkgPT5cbiAgICAgIGhhc0NoYW5nZXMgPSBmYWxzZVxuICAgICAgZm9yIGMgb2YgY2hhbmdlcyB3aGVuIGNoYW5nZXNbY10ubmV3VmFsdWUgIT0gY2hhbmdlc1tjXS5vbGRWYWx1ZSBhbmQgYyBpc250J3NvY2tldElkcydcbiAgICAgICAgKGMpID0+IFxuICAgICAgICAgIEBkYXRhW2NdID0gY2hhbmdlc1tjXS5uZXdWYWx1ZSBcbiAgICAgICAgICBzaG93ICdkYXRhIGNoYW5nZWQ6ICdcbiAgICAgICAgICBzaG93IGNcbiAgICAgICAgICBzaG93IEBkYXRhW2NdXG5cbiAgICAgICAgICBoYXNDaGFuZ2VzID0gdHJ1ZVxuXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXMgaWYgaGFzQ2hhbmdlc1xuICAgICAgc2hvdyAnY2hhbmdlZCcgaWYgaGFzQ2hhbmdlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE3NDIwOTNcbm1vZHVsZS5leHBvcnRzID0gKCgpIC0+XG4gIG1ldGhvZHMgPSBbXG4gICAgJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJyxcbiAgICAnZXhjZXB0aW9uJywgJ2dyb3VwJywgJ2dyb3VwQ29sbGFwc2VkJywgJ2dyb3VwRW5kJywgJ2luZm8nLCAnbG9nJyxcbiAgICAnbWFya1RpbWVsaW5lJywgJ3Byb2ZpbGUnLCAncHJvZmlsZUVuZCcsICd0YWJsZScsICd0aW1lJywgJ3RpbWVFbmQnLFxuICAgICd0aW1lU3RhbXAnLCAndHJhY2UnLCAnd2FybiddXG4gIG5vb3AgPSAoKSAtPlxuICAgICMgc3R1YiB1bmRlZmluZWQgbWV0aG9kcy5cbiAgICBmb3IgbSBpbiBtZXRob2RzICB3aGVuICAhY29uc29sZVttXVxuICAgICAgY29uc29sZVttXSA9IG5vb3BcblxuICBpZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZD9cbiAgICB3aW5kb3cuc2hvdyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUpXG4gIGVsc2VcbiAgICB3aW5kb3cuc2hvdyA9ICgpIC0+XG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKVxuKSgpXG4iXX0=
