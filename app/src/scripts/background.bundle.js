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


},{"../../common.coffee":2,"../../config.coffee":3,"../../filesystem.coffee":4,"../../server.coffee":9,"../../storage.coffee":10}],2:[function(require,module,exports){
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

  Application.prototype.init = function() {
    this.Storage.session.server = {};
    return this.Storage.session.server.status = this.Server.status;
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
    } else {
      return typeof cb === "function" ? cb('already started') : void 0;
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


},{"./config.coffee":3,"./filesystem.coffee":4,"./listen.coffee":5,"./msg.coffee":6,"./notification.coffee":8,"./server.coffee":9,"./storage.coffee":10,"./util.coffee":11}],3:[function(require,module,exports){
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
/**
 * DEVELOPED BY
 * GIL LOPES BUENO
 * gilbueno.mail@gmail.com
 *
 * WORKS WITH:
 * IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
 *
 * FORK:
 * https://github.com/melanke/Watch.JS
 */

"use strict";
(function (factory) {
     if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        window.WatchJS = factory();
        window.watch = window.WatchJS.watch;
        window.unwatch = window.WatchJS.unwatch;
        window.callWatchers = window.WatchJS.callWatchers;
    }
}(function () {

    var WatchJS = {
        noMore: false
    },
    lengthsubjects = [];

    var isFunction = function (functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
    };

    var isInt = function (x) {
        return x % 1 === 0;
    };

    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    var getObjDiff = function(a, b){
        var aplus = [],
        bplus = [];

        if(!(typeof a == "string") && !(typeof b == "string")){

            if (isArray(a)) {
                for (var i=0; i<a.length; i++) {
                    if (b[i] === undefined) aplus.push(i);
                }
            } else {
                for(var i in a){
                    if (a.hasOwnProperty(i)) {
                        if(b[i] === undefined) {
                            aplus.push(i);
                        }
                    }
                }
            }

            if (isArray(b)) {
                for (var j=0; j<b.length; j++) {
                    if (a[j] === undefined) bplus.push(j);
                }
            } else {
                for(var j in b){
                    if (b.hasOwnProperty(j)) {
                        if(a[j] === undefined) {
                            bplus.push(j);
                        }
                    }
                }
            }
        }

        return {
            added: aplus,
            removed: bplus
        }
    };

    var clone = function(obj){

        if (null == obj || "object" != typeof obj) {
            return obj;
        }

        var copy = obj.constructor();

        for (var attr in obj) {
            copy[attr] = obj[attr];
        }

        return copy;

    }

    var defineGetAndSet = function (obj, propName, getter, setter) {
        try {

            Object.observe(obj[propName], function(data){
                setter(data); //TODO: adapt our callback data to match Object.observe data spec
            }); 

        } catch(e) {

            try {
                    Object.defineProperty(obj, propName, {
                            get: getter,
                            set: setter,
                            enumerable: true,
                            configurable: true
                    });
            } catch(e2) {
                try{
                    Object.prototype.__defineGetter__.call(obj, propName, getter);
                    Object.prototype.__defineSetter__.call(obj, propName, setter);
                } catch(e3) {
                    throw new Error("watchJS error: browser not supported :/")
                }
            }

        }
    };

    var defineProp = function (obj, propName, value) {
        try {
            Object.defineProperty(obj, propName, {
                enumerable: false,
                configurable: true,
                writable: false,
                value: value
            });
        } catch(error) {
            obj[propName] = value;
        }
    };

    var watch = function () {

        if (isFunction(arguments[1])) {
            watchAll.apply(this, arguments);
        } else if (isArray(arguments[1])) {
            watchMany.apply(this, arguments);
        } else {
            watchOne.apply(this, arguments);
        }

    };


    var watchAll = function (obj, watcher, level, addNRemove, path) {

        if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        var props = [];


        if(isArray(obj)) {
            for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array
                props.push(prop); //put in the props
            }
        } else {
            for (var prop2 in obj) { //for each attribute if obj is an object
                if (obj.hasOwnProperty(prop2)) {
                    props.push(prop2); //put in the props
                }
            }
        }

        watchMany(obj, props, watcher, level, addNRemove, path); //watch all items of the props

        if (addNRemove) {
            pushToLengthSubjects(obj, "$$watchlengthsubjectroot", watcher, level);
        }
    };


    var watchMany = function (obj, props, watcher, level, addNRemove, path) {

        if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        for (var i=0; i<props.length; i++) { //watch each property
            var prop = props[i];
            watchOne(obj, prop, watcher, level, addNRemove, path);
        }

    };

    var watchOne = function (obj, prop, watcher, level, addNRemove, path) {

        if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        if(isFunction(obj[prop])) { //dont watch if it is a function
            return;
        }

        if(obj[prop] != null && (level === undefined || level > 0)){
            watchAll(obj[prop], watcher, level!==undefined? level-1 : level,null, path + '.' + prop); //recursively watch all attributes of this
        }

        defineWatcher(obj, prop, watcher, level, path);

        if(addNRemove && (level === undefined || level > 0)){
            pushToLengthSubjects(obj, prop, watcher, level);
        }

    };

    var unwatch = function () {

        if (isFunction(arguments[1])) {
            unwatchAll.apply(this, arguments);
        } else if (isArray(arguments[1])) {
            unwatchMany.apply(this, arguments);
        } else {
            unwatchOne.apply(this, arguments);
        }

    };

    var unwatchAll = function (obj, watcher) {

        if (obj instanceof String || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        if (isArray(obj)) {
            var props = [];
            for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array
                props.push(prop); //put in the props
            }
            unwatchMany(obj, props, watcher); //watch all itens of the props
        } else {
            var unwatchPropsInObject = function (obj2) {
                var props = [];
                for (var prop2 in obj2) { //for each attribute if obj is an object
                    if (obj2.hasOwnProperty(prop2)) {
                        if (obj2[prop2] instanceof Object) {
                            unwatchPropsInObject(obj2[prop2]); //recurs into object props
                        } else {
                            props.push(prop2); //put in the props
                        }
                    }
                }
                unwatchMany(obj2, props, watcher); //unwatch all of the props
            };
            unwatchPropsInObject(obj);
        }
    };


    var unwatchMany = function (obj, props, watcher) {

        for (var prop2 in props) { //watch each attribute of "props" if is an object
            if (props.hasOwnProperty(prop2)) {
                unwatchOne(obj, props[prop2], watcher);
            }
        }
    };

    var defineWatcher = function (obj, prop, watcher, level, path) {

        var val = obj[prop];

        watchFunctions(obj, prop);

        if (!obj.watchers) {
            defineProp(obj, "watchers", {});
        }
        
        if (!obj._path) {
            defineProp(obj, "_path", path);
        }

        if (!obj.watchers[prop]) {
            obj.watchers[prop] = [];
        }

        for (var i=0; i<obj.watchers[prop].length; i++) {
            if(obj.watchers[prop][i] === watcher){
                return;
            }
        }


        obj.watchers[prop].push(watcher); //add the new watcher in the watchers array


        var getter = function () {
            return val;
        };


        var setter = function (newval) {
            var oldval = val;
            val = newval;

            if (level !== 0 && obj[prop]){
                // watch sub properties
                watchAll(obj[prop], watcher, (level===undefined)?level:level-1);
            }

            watchFunctions(obj, prop);

            if (!WatchJS.noMore){
                //if (JSON.stringify(oldval) !== JSON.stringify(newval)) {
                if (oldval !== newval) {
                    callWatchers(obj, prop, "set", newval, oldval);
                    WatchJS.noMore = false;
                }
            }
        };

        defineGetAndSet(obj, prop, getter, setter);

    };

    var callWatchers = function (obj, prop, action, newval, oldval) {
        if (prop !== undefined) {
            for (var wr=0; wr<obj.watchers[prop].length; wr++) {
                obj.watchers[prop][wr].call(obj, prop, action, newval, oldval);
            }
        } else {
            for (var prop in obj) {//call all
                if (obj.hasOwnProperty(prop)) {
                    callWatchers(obj, prop, action, newval, oldval);
                }
            }
        }
    };

    // @todo code related to "watchFunctions" is certainly buggy
    var methodNames = ['pop', 'push', 'reverse', 'shift', 'sort', 'slice', 'unshift', 'splice'];
    var defineArrayMethodWatcher = function (obj, prop, original, methodName) {
        defineProp(obj[prop], methodName, function () {
            var response = original.apply(obj[prop], arguments);
            watchOne(obj, obj[prop]);
            if (methodName !== 'slice') {
                callWatchers(obj, prop, methodName,arguments);
            }
            return response;
        });
    };

    var watchFunctions = function(obj, prop) {

        if ((!obj[prop]) || (obj[prop] instanceof String) || (!isArray(obj[prop]))) {
            return;
        }

        for (var i = methodNames.length, methodName; i--;) {
            methodName = methodNames[i];
            defineArrayMethodWatcher(obj, prop, obj[prop][methodName], methodName);
        }

    };

    var unwatchOne = function (obj, prop, watcher) {
        for (var i=0; i<obj.watchers[prop].length; i++) {
            var w = obj.watchers[prop][i];

            if(w == watcher) {
                obj.watchers[prop].splice(i, 1);
            }
        }

        removeFromLengthSubjects(obj, prop, watcher);
    };

    var loop = function(){

        for(var i=0; i<lengthsubjects.length; i++) {

            var subj = lengthsubjects[i];

            if (subj.prop === "$$watchlengthsubjectroot") {

                var difference = getObjDiff(subj.obj, subj.actual);

                if(difference.added.length || difference.removed.length){
                    if(difference.added != difference.removed && (difference.added[0] != difference.removed[0])) {
                        if(difference.added.length){
                            watchMany(subj.obj, difference.added, subj.watcher, subj.level - 1, true);
                        }

                        subj.watcher.call(subj.obj, "root", "differentattr", difference, subj.actual);
                    }
                }
                subj.actual = clone(subj.obj);


            } else {
                if(subj.obj[subj.prop] == null) return;
                var difference = getObjDiff(subj.obj[subj.prop], subj.actual);
            
                if(difference.added.length || difference.removed.length){
                    if(difference.added.length){
                        for (var j=0; j<subj.obj.watchers[subj.prop].length; j++) {
                            watchMany(subj.obj[subj.prop], difference.added, subj.obj.watchers[subj.prop][j], subj.level - 1, true);
                        }
                    }

                    callWatchers(subj.obj, subj.prop, "differentattr", difference, subj.actual);
                }

                subj.actual = clone(subj.obj[subj.prop]);

            }

        }

    };

    var pushToLengthSubjects = function(obj, prop, watcher, level){
        
        var actual;

        if (prop === "$$watchlengthsubjectroot") {
            actual =  clone(obj);
        } else {
            actual = clone(obj[prop]);
        }

        lengthsubjects.push({
            obj: obj,
            prop: prop,
            actual: actual,
            watcher: watcher,
            level: level
        });
    };

    var removeFromLengthSubjects = function(obj, prop, watcher){

        for (var i=0; i<lengthsubjects.length; i++) {
            var subj = lengthsubjects[i];

            if (subj.obj == obj && subj.prop == prop && subj.watcher == watcher) {
                lengthsubjects.splice(i, 1);
            }
        }

    };

    setInterval(loop, 50);

    WatchJS.watch = watch;
    WatchJS.unwatch = unwatch;
    WatchJS.callWatchers = callWatchers;

    return WatchJS;

}));

},{}],8:[function(require,module,exports){
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


},{}],9:[function(require,module,exports){
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


},{}],10:[function(require,module,exports){
var LISTEN, MSG, Storage, WatchJS, callWatchers, unwatch, watch;

LISTEN = require('./listen.coffee');

MSG = require('./msg.coffee');

WatchJS = require('watchjs');

watch = WatchJS.watch;

unwatch = WatchJS.unwatch;

callWatchers = WatchJS.callWatchers;

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
        watchAndNotify(_this, 'sessionData', _this.session, false);
        return _this.onDataLoaded(_this.data);
      };
    })(this));
    this.init();
  }

  Storage.prototype.init = function() {};

  Storage.prototype.isArray = function() {
    return Array.isArray || function(value) {
      return {}.toString.call(value) === '[object Array]';
    };
  };

  watchAndNotify = function(_this, msgKey, obj, store) {
    var _listener;
    _listener = function(prop, action, newVal, oldVal) {
      var msg;
      if ((action === "set" || "differentattr") && _this.noWatch === false) {
        if (!/^\d+$/.test(prop)) {
          show(arguments);
          if (store) {
            _this.api.set(obj);
          }
          msg = {};
          msg[msgKey] = obj;
          return _this.MSG.ExtPort(msg);
        }
      }
    };
    _this.noWatch = false;
    watch(obj, _listener, 3, true);
    return _this.LISTEN.Ext(msgKey, function(data) {
      var k;
      _this.noWatch = true;
      for (k in data) {
        obj[k] = data[k];
      }
      return setTimeout(function() {
        return _this.noWatch = false;
      }, 200);
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


},{"./listen.coffee":5,"./msg.coffee":6,"watchjs":7}],11:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvYXBwL3NyYy9iYWNrZ3JvdW5kLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9jb21tb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L2NvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vZGVfbW9kdWxlcy93YXRjaGpzL3NyYy93YXRjaC5qcyIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9ub3RpZmljYXRpb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L3NlcnZlci5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvc3RvcmFnZS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNFQSxJQUFBLGlFQUFBOztBQUFBLFNBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLFVBQUE7QUFBQSxFQUFBLFVBQUEsR0FBYSxTQUFBLEdBQUE7V0FDWCxLQURXO0VBQUEsQ0FBYixDQUFBO1NBR0EsVUFBQSxDQUFBLEVBSlU7QUFBQSxDQUFaLENBQUE7O0FBQUEsSUFNQSxHQUFPLFNBQUEsQ0FBQSxDQU5QLENBQUE7O0FBQUEsV0FRQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQVJkLENBQUE7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QUFBOztBQUFBLE1BNEJNLENBQUMsT0FBUCxHQUFpQixHQTVCakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmRBLElBQUEsWUFBQTs7QUFBQTtBQUNlLEVBQUEsc0JBQUEsR0FBQSxDQUFiOztBQUFBLHlCQUVBLElBQUEsR0FBTSxTQUFDLEtBQUQsRUFBUSxPQUFSLEdBQUE7QUFDSixRQUFBLFFBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVyxTQUFDLE1BQUQsR0FBQTtBQUNULFVBQUEsRUFBQTs7UUFEVSxTQUFPO09BQ2pCO0FBQUEsTUFBQSxFQUFBLEdBQUssRUFBTCxDQUFBO0FBQzJDLGFBQU0sRUFBRSxDQUFDLE1BQUgsR0FBWSxNQUFsQixHQUFBO0FBQTNDLFFBQUEsRUFBQSxJQUFNLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBYSxDQUFDLFFB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RUFHUixjQUhRLEVBR1EsU0FIUixFQUdtQixZQUhuQixFQUdpQyxPQUhqQyxFQUcwQyxNQUgxQyxFQUdrRCxTQUhsRCxFQUlSLFdBSlEsRUFJSyxPQUpMLEVBSWMsTUFKZCxDQUFWLENBQUE7QUFBQSxFQUtBLElBQUEsR0FBTyxTQUFBLEdBQUE7QUFFTCxRQUFBLHFCQUFBO0FBQUE7U0FBQSw4Q0FBQTtzQkFBQTtVQUF3QixDQUFBLE9BQVMsQ0FBQSxDQUFBO0FBQy9CLHNCQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVIsR0FBYSxLQUFiO09BREY7QUFBQTtvQkFGSztFQUFBLENBTFAsQ0FBQTtBQVVBLEVBQUEsSUFBRywrQkFBSDtXQUNFLE1BQU0sQ0FBQyxJQUFQLEdBQWMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBeEIsQ0FBNkIsT0FBTyxDQUFDLEdBQXJDLEVBQTBDLE9BQTFDLEVBRGhCO0dBQUEsTUFBQTtXQUdFLE1BQU0sQ0FBQyxJQUFQLEdBQWMsU0FBQSxHQUFBO2FBQ1osUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBekIsQ0FBOEIsT0FBTyxDQUFDLEdBQXRDLEVBQTJDLE9BQTNDLEVBQW9ELFNBQXBELEVBRFk7SUFBQSxFQUhoQjtHQVhnQjtBQUFBLENBQUQsQ0FBQSxDQUFBLENBQWpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMgc2VydmVyID0gcmVxdWlyZSAnLi90Y3Atc2VydmVyLmpzJ1xuXG5nZXRHbG9iYWwgPSAtPlxuICBfZ2V0R2xvYmFsID0gLT5cbiAgICB0aGlzXG5cbiAgX2dldEdsb2JhbCgpXG5cbnJvb3QgPSBnZXRHbG9iYWwoKVxuXG5BcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5cbmNocm9tZS5hcHAucnVudGltZS5vbkxhdW5jaGVkLmFkZExpc3RlbmVyIC0+XG4gIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSAnaW5kZXguaHRtbCcsXG4gICAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgICBib3VuZHM6XG4gICAgICAgICAgd2lkdGg6NzcwXG4gICAgICAgICAgaGVpZ2h0OjgwMFxuXG5cblxuXG4jIENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy5jb2ZmZWUnXG4jIE1TRyA9IHJlcXVpcmUgJy4uLy4uL21zZy5jb2ZmZWUnXG4jIExJU1RFTiA9IHJlcXVpcmUgJy4uLy4uL2xpc3Rlbi5jb2ZmZWUnXG4jIFN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbiMgRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4uLy4uL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnLmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuLi8uLi9maWxlc3lzdGVtLmNvZmZlZSdcblNlcnZlciA9IHJlcXVpcmUgJy4uLy4uL3NlcnZlci5jb2ZmZWUnXG5cblxucm9vdC5hcHAgPSBuZXcgQXBwbGljYXRpb24gXG4gIFN0b3JhZ2U6IG5ldyBTdG9yYWdlXG4gIEZTOiBuZXcgRmlsZVN5c3RlbVxuICBTZXJ2ZXI6IG5ldyBTZXJ2ZXJcblxucm9vdC5hcHAuU2VydmVyLmdldExvY2FsRmlsZSA9IGFwcC5nZXRMb2NhbEZpbGVcbiMgcm9vdC5hcHAuU3RvcmFnZS5kYXRhLnNlcnZlciA9IHN0YXR1czpyb290LmFwcC5TZXJ2ZXIuc3RhdHVzXG5cbmNocm9tZS5ydW50aW1lLm9uU3VzcGVuZC5hZGRMaXN0ZW5lciAtPlxuICByb290LmFwcC5TdG9yYWdlLnNhdmVBbGwobnVsbClcblxuI3Jvb3QuYXBwLlN0b3JhZ2UucmV0cmlldmVBbGwoKVxuIiwicmVxdWlyZSAnLi91dGlsLmNvZmZlZSdcbkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcbkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuL3N0b3JhZ2UuY29mZmVlJ1xuRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4vZmlsZXN5c3RlbS5jb2ZmZWUnXG5Ob3RpZmljYXRpb24gPSByZXF1aXJlICcuL25vdGlmaWNhdGlvbi5jb2ZmZWUnXG5TZXJ2ZXIgPSByZXF1aXJlICcuL3NlcnZlci5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwbGljYXRpb24gZXh0ZW5kcyBDb25maWdcbiAgTElTVEVOOiBudWxsXG4gIE1TRzogbnVsbFxuICBTdG9yYWdlOiBudWxsXG4gIEZTOiBudWxsXG4gIFNlcnZlcjogbnVsbFxuICBOb3RpZnk6IG51bGxcbiAgcGxhdGZvcm06bnVsbFxuICBjdXJyZW50VGFiSWQ6bnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoZGVwcykgLT5cbiAgICBzdXBlclxuXG4gICAgQE1TRyA/PSBNU0cuZ2V0KClcbiAgICBATElTVEVOID89IExJU1RFTi5nZXQoKVxuICAgIFxuICAgIGZvciBwcm9wIG9mIGRlcHNcbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwib2JqZWN0XCIgXG4gICAgICAgIEBbcHJvcF0gPSBAd3JhcE9iakluYm91bmQgZGVwc1twcm9wXVxuICAgICAgaWYgdHlwZW9mIGRlcHNbcHJvcF0gaXMgXCJmdW5jdGlvblwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpPdXRib3VuZCBuZXcgZGVwc1twcm9wXVxuXG4gICAgQFN0b3JhZ2Uub25EYXRhTG9hZGVkID0gKGRhdGEpID0+XG4gICAgICAjIEBkYXRhID0gZGF0YVxuICAgICAgIyBkZWxldGUgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXJcbiAgICAgICMgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXIgPSB7fVxuICAgICAgIyBkZWxldGUgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXIuc3RhdHVzXG5cbiAgICAgIGlmIG5vdCBAU3RvcmFnZS5kYXRhLmZpcnN0VGltZT9cbiAgICAgICAgQFN0b3JhZ2UuZGF0YS5maXJzdFRpbWUgPSBmYWxzZVxuICAgICAgICBAU3RvcmFnZS5kYXRhLm1hcHMucHVzaFxuICAgICAgICAgIG5hbWU6J1NhbGVzZm9yY2UnXG4gICAgICAgICAgdXJsOidodHRwcy4qXFwvcmVzb3VyY2UoXFwvWzAtOV0rKT9cXC8oW0EtWmEtejAtOVxcLS5fXStcXC8pPydcbiAgICAgICAgICByZWdleFJlcGw6JydcbiAgICAgICAgICBpc1JlZGlyZWN0OnRydWVcbiAgICAgICAgICBpc09uOmZhbHNlXG5cblxuICAgICAgIyBpZiBAUmVkaXJlY3Q/IHRoZW4gQFJlZGlyZWN0LmRhdGEgPSBAZGF0YS50YWJNYXBzXG5cbiAgICBATm90aWZ5ID89IChuZXcgTm90aWZpY2F0aW9uKS5zaG93IFxuICAgICMgQFN0b3JhZ2UgPz0gQHdyYXBPYmpPdXRib3VuZCBuZXcgU3RvcmFnZSBAZGF0YVxuICAgICMgQEZTID0gbmV3IEZpbGVTeXN0ZW0gXG4gICAgIyBAU2VydmVyID89IEB3cmFwT2JqT3V0Ym91bmQgbmV3IFNlcnZlclxuICAgIEBkYXRhID0gQFN0b3JhZ2UuZGF0YVxuICAgIFxuICAgIEB3cmFwID0gaWYgQFNFTEZfVFlQRSBpcyAnQVBQJyB0aGVuIEB3cmFwSW5ib3VuZCBlbHNlIEB3cmFwT3V0Ym91bmRcblxuICAgIEBvcGVuQXBwID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLm9wZW5BcHAnLCBAb3BlbkFwcFxuICAgIEBsYXVuY2hBcHAgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ubGF1bmNoQXBwJywgQGxhdW5jaEFwcFxuICAgIEBzdGFydFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5zdGFydFNlcnZlcicsIEBzdGFydFNlcnZlclxuICAgIEByZXN0YXJ0U2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnJlc3RhcnRTZXJ2ZXInLCBAcmVzdGFydFNlcnZlclxuICAgIEBzdG9wU2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnN0b3BTZXJ2ZXInLCBAc3RvcFNlcnZlclxuICAgIEBnZXRGaWxlTWF0Y2ggPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0RmlsZU1hdGNoJywgQGdldEZpbGVNYXRjaFxuXG4gICAgQHdyYXAgPSBpZiBAU0VMRl9UWVBFIGlzICdFWFRFTlNJT04nIHRoZW4gQHdyYXBJbmJvdW5kIGVsc2UgQHdyYXBPdXRib3VuZFxuXG4gICAgQGdldFJlc291cmNlcyA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRSZXNvdXJjZXMnLCBAZ2V0UmVzb3VyY2VzXG4gICAgQGdldEN1cnJlbnRUYWIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0Q3VycmVudFRhYicsIEBnZXRDdXJyZW50VGFiXG5cbiAgICBjaHJvbWUucnVudGltZS5nZXRQbGF0Zm9ybUluZm8gKGluZm8pID0+XG4gICAgICBAcGxhdGZvcm0gPSBpbmZvXG5cbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgLT5cbiAgICAgIEBTdG9yYWdlLnNlc3Npb24uc2VydmVyID0ge31cbiAgICAgIEBTdG9yYWdlLnNlc3Npb24uc2VydmVyLnN0YXR1cyA9IEBTZXJ2ZXIuc3RhdHVzXG4gICAgIyBAU3RvcmFnZS5yZXRyaWV2ZUFsbCgpIGlmIEBTdG9yYWdlP1xuXG5cbiAgZ2V0Q3VycmVudFRhYjogKGNiKSAtPlxuICAgICMgdHJpZWQgdG8ga2VlcCBvbmx5IGFjdGl2ZVRhYiBwZXJtaXNzaW9uLCBidXQgb2ggd2VsbC4uXG4gICAgY2hyb21lLnRhYnMucXVlcnlcbiAgICAgIGFjdGl2ZTp0cnVlXG4gICAgICBjdXJyZW50V2luZG93OnRydWVcbiAgICAsKHRhYnMpID0+XG4gICAgICBAY3VycmVudFRhYklkID0gdGFic1swXS5pZFxuICAgICAgY2I/IEBjdXJyZW50VGFiSWRcblxuICBsYXVuY2hBcHA6IChjYiwgZXJyb3IpIC0+XG4gICAgICBjaHJvbWUubWFuYWdlbWVudC5sYXVuY2hBcHAgQEFQUF9JRCwgKGV4dEluZm8pID0+XG4gICAgICAgIGlmIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxuICAgICAgICAgIGVycm9yIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxuICAgICAgICBlbHNlXG4gICAgICAgICAgY2I/IGV4dEluZm9cblxuICBvcGVuQXBwOiAoKSA9PlxuICAgICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJyxcbiAgICAgICAgaWQ6IFwibWFpbndpblwiXG4gICAgICAgIGJvdW5kczpcbiAgICAgICAgICB3aWR0aDo3NzBcbiAgICAgICAgICBoZWlnaHQ6ODAwLFxuICAgICAgKHdpbikgPT5cbiAgICAgICAgQGFwcFdpbmRvdyA9IHdpbikgXG5cbiAgZ2V0Q3VycmVudFRhYjogKGNiKSAtPlxuICAgICMgdHJpZWQgdG8ga2VlcCBvbmx5IGFjdGl2ZVRhYiBwZXJtaXNzaW9uLCBidXQgb2ggd2VsbC4uXG4gICAgY2hyb21lLnRhYnMucXVlcnlcbiAgICAgIGFjdGl2ZTp0cnVlXG4gICAgICBjdXJyZW50V2luZG93OnRydWVcbiAgICAsKHRhYnMpID0+XG4gICAgICBAY3VycmVudFRhYklkID0gdGFic1swXS5pZFxuICAgICAgY2I/IEBjdXJyZW50VGFiSWRcblxuICBnZXRSZXNvdXJjZXM6IChjYikgLT5cbiAgICBAZ2V0Q3VycmVudFRhYiAodGFiSWQpID0+XG4gICAgICBjaHJvbWUudGFicy5leGVjdXRlU2NyaXB0IHRhYklkLCBcbiAgICAgICAgZmlsZTonc2NyaXB0cy9jb250ZW50LmpzJywgKHJlc3VsdHMpID0+XG4gICAgICAgICAgQGRhdGEuY3VycmVudFJlc291cmNlcy5sZW5ndGggPSAwXG4gICAgICAgICAgZm9yIHIgaW4gcmVzdWx0c1xuICAgICAgICAgICAgZm9yIHJlcyBpbiByXG4gICAgICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMucHVzaCByZXNcbiAgICAgICAgICBjYj8gbnVsbCwgQGRhdGEuY3VycmVudFJlc291cmNlc1xuXG5cbiAgZ2V0TG9jYWxGaWxlOiAoaW5mbywgY2IpID0+XG4gICAgZmlsZVBhdGggPSBpbmZvLnVyaVxuICAgICMgZmlsZVBhdGggPSBAZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdCB1cmxcbiAgICByZXR1cm4gY2IgJ2ZpbGUgbm90IGZvdW5kJyB1bmxlc3MgZmlsZVBhdGg/XG4gICAgX2RpcnMgPSBbXVxuICAgIF9kaXJzLnB1c2ggZGlyIGZvciBkaXIgaW4gQGRhdGEuZGlyZWN0b3JpZXMgd2hlbiBkaXIuaXNPblxuICAgIGZpbGVQYXRoID0gZmlsZVBhdGguc3Vic3RyaW5nIDEgaWYgZmlsZVBhdGguc3Vic3RyaW5nKDAsMSkgaXMgJy8nXG4gICAgQGZpbmRGaWxlRm9yUGF0aCBfZGlycywgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyKSA9PlxuICAgICAgaWYgZXJyPyB0aGVuIHJldHVybiBjYj8gZXJyXG4gICAgICBmaWxlRW50cnkuZmlsZSAoZmlsZSkgPT5cbiAgICAgICAgY2I/IG51bGwsZmlsZUVudHJ5LGZpbGVcbiAgICAgICwoZXJyKSA9PiBjYj8gZXJyXG5cblxuICBzdGFydFNlcnZlcjogKGNiKSAtPlxuICAgIGlmIEBTZXJ2ZXIuc3RhdHVzLmlzT24gaXMgZmFsc2VcbiAgICAgIEBTZXJ2ZXIuc3RhcnQgbnVsbCxudWxsLG51bGwsIChlcnIsIHNvY2tldEluZm8pID0+XG4gICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBFcnJvclwiLFwiRXJyb3IgU3RhcnRpbmcgU2VydmVyOiAjeyBlcnJvciB9XCJcbiAgICAgICAgICAgIGNiPyBlcnJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIFN0YXJ0ZWRcIiwgXCJTdGFydGVkIFNlcnZlciAjeyBAU2VydmVyLnN0YXR1cy51cmwgfVwiXG4gICAgICAgICAgICBjYj8gbnVsbCwgQFNlcnZlci5zdGF0dXNcbiAgICBlbHNlXG4gICAgICBjYj8gJ2FscmVhZHkgc3RhcnRlZCdcblxuICBzdG9wU2VydmVyOiAoY2IpIC0+XG4gICAgICBAU2VydmVyLnN0b3AgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgICAgaWYgZXJyP1xuICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIlNlcnZlciBjb3VsZCBub3QgYmUgc3RvcHBlZDogI3sgZXJyb3IgfVwiXG4gICAgICAgICAgY2I/IGVyclxuICAgICAgICBlbHNlXG4gICAgICAgICAgQE5vdGlmeSAnU2VydmVyIFN0b3BwZWQnLCBcIlNlcnZlciBTdG9wcGVkXCJcbiAgICAgICAgICBjYj8gbnVsbCwgQFNlcnZlci5zdGF0dXNcblxuICByZXN0YXJ0U2VydmVyOiAtPlxuICAgIEBzdGFydFNlcnZlcigpXG5cbiAgY2hhbmdlUG9ydDogPT5cbiAgZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdDogKHVybCkgLT5cbiAgICBmaWxlUGF0aFJlZ2V4ID0gL14oKGh0dHBbc10/fGZ0cHxjaHJvbWUtZXh0ZW5zaW9ufGZpbGUpOlxcL1xcLyk/XFwvPyhbXlxcL1xcLl0rXFwuKSo/KFteXFwvXFwuXStcXC5bXjpcXC9cXHNcXC5dezIsM30oXFwuW146XFwvXFxzXFwuXeKAjOKAi3syLDN9KT8pKDpcXGQrKT8oJHxcXC8pKFteIz9cXHNdKyk/KC4qPyk/KCNbXFx3XFwtXSspPyQvXG4gICBcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgQGRhdGFbQGN1cnJlbnRUYWJJZF0/Lm1hcHM/XG5cbiAgICByZXNQYXRoID0gdXJsLm1hdGNoKGZpbGVQYXRoUmVnZXgpP1s4XVxuICAgIGlmIG5vdCByZXNQYXRoP1xuICAgICAgIyB0cnkgcmVscGF0aFxuICAgICAgcmVzUGF0aCA9IHVybFxuXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHJlc1BhdGg/XG4gICAgXG4gICAgZm9yIG1hcCBpbiBAZGF0YVtAY3VycmVudFRhYklkXS5tYXBzXG4gICAgICByZXNQYXRoID0gdXJsLm1hdGNoKG5ldyBSZWdFeHAobWFwLnVybCkpPyBhbmQgbWFwLnVybD9cblxuICAgICAgaWYgcmVzUGF0aFxuICAgICAgICBpZiByZWZlcmVyP1xuICAgICAgICAgICMgVE9ETzogdGhpc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgZmlsZVBhdGggPSB1cmwucmVwbGFjZSBuZXcgUmVnRXhwKG1hcC51cmwpLCBtYXAucmVnZXhSZXBsXG4gICAgICAgIGJyZWFrXG4gICAgcmV0dXJuIGZpbGVQYXRoXG5cbiAgVVJMdG9Mb2NhbFBhdGg6ICh1cmwsIGNiKSAtPlxuICAgIGZpbGVQYXRoID0gQFJlZGlyZWN0LmdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3QgdXJsXG5cbiAgZ2V0RmlsZU1hdGNoOiAoZmlsZVBhdGgsIGNiKSAtPlxuICAgIHJldHVybiBjYj8gJ2ZpbGUgbm90IGZvdW5kJyB1bmxlc3MgZmlsZVBhdGg/XG4gICAgc2hvdyAndHJ5aW5nICcgKyBmaWxlUGF0aFxuICAgIEBmaW5kRmlsZUZvclBhdGggQGRhdGEuZGlyZWN0b3JpZXMsIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcmVjdG9yeSkgPT5cblxuICAgICAgaWYgZXJyPyBcbiAgICAgICAgIyBzaG93ICdubyBmaWxlcyBmb3VuZCBmb3IgJyArIGZpbGVQYXRoXG4gICAgICAgIHJldHVybiBjYj8gZXJyXG5cbiAgICAgIGRlbGV0ZSBmaWxlRW50cnkuZW50cnlcbiAgICAgIEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlc1tmaWxlUGF0aF0gPSBcbiAgICAgICAgZmlsZUVudHJ5OiBjaHJvbWUuZmlsZVN5c3RlbS5yZXRhaW5FbnRyeSBmaWxlRW50cnlcbiAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgIGRpcmVjdG9yeTogZGlyZWN0b3J5XG4gICAgICBjYj8gbnVsbCwgQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzW2ZpbGVQYXRoXSwgZGlyZWN0b3J5XG4gICAgICBcblxuXG4gIGZpbmRGaWxlSW5EaXJlY3RvcmllczogKGRpcmVjdG9yaWVzLCBwYXRoLCBjYikgLT5cbiAgICBteURpcnMgPSBkaXJlY3Rvcmllcy5zbGljZSgpIFxuICAgIF9wYXRoID0gcGF0aFxuICAgIF9kaXIgPSBteURpcnMuc2hpZnQoKVxuXG4gICAgQEZTLmdldExvY2FsRmlsZUVudHJ5IF9kaXIsIF9wYXRoLCAoZXJyLCBmaWxlRW50cnkpID0+XG4gICAgICBpZiBlcnI/XG4gICAgICAgIGlmIG15RGlycy5sZW5ndGggPiAwXG4gICAgICAgICAgQGZpbmRGaWxlSW5EaXJlY3RvcmllcyBteURpcnMsIF9wYXRoLCBjYlxuICAgICAgICBlbHNlXG4gICAgICAgICAgY2I/ICdub3QgZm91bmQnXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIF9kaXJcblxuICBmaW5kRmlsZUZvclBhdGg6IChkaXJzLCBwYXRoLCBjYikgLT5cbiAgICBAZmluZEZpbGVJbkRpcmVjdG9yaWVzIGRpcnMsIHBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyZWN0b3J5KSA9PlxuICAgICAgaWYgZXJyP1xuICAgICAgICBpZiBwYXRoIGlzIHBhdGgucmVwbGFjZSgvLio/XFwvLywgJycpXG4gICAgICAgICAgY2I/ICdub3QgZm91bmQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZmluZEZpbGVGb3JQYXRoIGRpcnMsIHBhdGgucmVwbGFjZSgvLio/XFwvLywgJycpLCBjYlxuICAgICAgZWxzZVxuICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBkaXJlY3RvcnlcbiAgXG4gIG1hcEFsbFJlc291cmNlczogKGNiKSAtPlxuICAgIEBnZXRSZXNvdXJjZXMgPT5cbiAgICAgIG5lZWQgPSBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLmxlbmd0aFxuICAgICAgZm91bmQgPSBub3RGb3VuZCA9IDBcbiAgICAgIGZvciBpdGVtIGluIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXNcbiAgICAgICAgbG9jYWxQYXRoID0gQFVSTHRvTG9jYWxQYXRoIGl0ZW0udXJsXG4gICAgICAgIGlmIGxvY2FsUGF0aD9cbiAgICAgICAgICBAZ2V0RmlsZU1hdGNoIGxvY2FsUGF0aCwgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgICAgICAgIG5lZWQtLVxuICAgICAgICAgICAgc2hvdyBhcmd1bWVudHNcbiAgICAgICAgICAgIGlmIGVycj8gdGhlbiBub3RGb3VuZCsrXG4gICAgICAgICAgICBlbHNlIGZvdW5kKysgICAgICAgICAgICBcblxuICAgICAgICAgICAgaWYgbmVlZCBpcyAwXG4gICAgICAgICAgICAgIGlmIGZvdW5kID4gMFxuICAgICAgICAgICAgICAgIGNiPyBudWxsLCAnZG9uZSdcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNiPyAnbm90aGluZyBmb3VuZCdcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgbmVlZC0tXG4gICAgICAgICAgbm90Rm91bmQrK1xuICAgICAgICAgIGlmIG5lZWQgaXMgMFxuICAgICAgICAgICAgY2I/ICdub3RoaW5nIGZvdW5kJ1xuXG4gIHNldEJhZGdlVGV4dDogKHRleHQsIHRhYklkKSAtPlxuICAgIGJhZGdlVGV4dCA9IHRleHQgfHwgJycgKyBPYmplY3Qua2V5cyhAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXMpLmxlbmd0aFxuICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCBcbiAgICAgIHRleHQ6YmFkZ2VUZXh0XG4gICAgICAjIHRhYklkOnRhYklkXG4gIFxuICByZW1vdmVCYWRnZVRleHQ6KHRhYklkKSAtPlxuICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCBcbiAgICAgIHRleHQ6JydcbiAgICAgICMgdGFiSWQ6dGFiSWRcblxuICBsc1I6IChkaXIsIG9uc3VjY2Vzcywgb25lcnJvcikgLT5cbiAgICBAcmVzdWx0cyA9IHt9XG5cbiAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgICAgIFxuICAgICAgdG9kbyA9IDBcbiAgICAgIGlnbm9yZSA9IC8uZ2l0fC5pZGVhfG5vZGVfbW9kdWxlc3xib3dlcl9jb21wb25lbnRzL1xuICAgICAgZGl2ZSA9IChkaXIsIHJlc3VsdHMpIC0+XG4gICAgICAgIHRvZG8rK1xuICAgICAgICByZWFkZXIgPSBkaXIuY3JlYXRlUmVhZGVyKClcbiAgICAgICAgcmVhZGVyLnJlYWRFbnRyaWVzIChlbnRyaWVzKSAtPlxuICAgICAgICAgIHRvZG8tLVxuICAgICAgICAgIGZvciBlbnRyeSBpbiBlbnRyaWVzXG4gICAgICAgICAgICBkbyAoZW50cnkpIC0+XG4gICAgICAgICAgICAgIHJlc3VsdHNbZW50cnkuZnVsbFBhdGhdID0gZW50cnlcbiAgICAgICAgICAgICAgaWYgZW50cnkuZnVsbFBhdGgubWF0Y2goaWdub3JlKSBpcyBudWxsXG4gICAgICAgICAgICAgICAgaWYgZW50cnkuaXNEaXJlY3RvcnlcbiAgICAgICAgICAgICAgICAgIHRvZG8rK1xuICAgICAgICAgICAgICAgICAgZGl2ZSBlbnRyeSwgcmVzdWx0cyBcbiAgICAgICAgICAgICAgIyBzaG93IGVudHJ5XG4gICAgICAgICAgc2hvdyAnb25zdWNjZXNzJyBpZiB0b2RvIGlzIDBcbiAgICAgICAgICAjIHNob3cgJ29uc3VjY2VzcycgcmVzdWx0cyBpZiB0b2RvIGlzIDBcbiAgICAgICAgLChlcnJvcikgLT5cbiAgICAgICAgICB0b2RvLS1cbiAgICAgICAgICAjIHNob3cgZXJyb3JcbiAgICAgICAgICAjIG9uZXJyb3IgZXJyb3IsIHJlc3VsdHMgaWYgdG9kbyBpcyAwIFxuXG4gICAgICBjb25zb2xlLmxvZyBkaXZlIGRpckVudHJ5LCBAcmVzdWx0cyAgXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvblxuXG5cbiIsImNsYXNzIENvbmZpZ1xuICAjIEFQUF9JRDogJ2NlY2lmYWZwaGVnaG9mcGZka2hla2tpYmNpYmhnZmVjJ1xuICAjIEVYVEVOU0lPTl9JRDogJ2RkZGltYm5qaWJqY2FmYm9rbmJnaGVoYmZhamdnZ2VwJ1xuICBBUFBfSUQ6ICdkZW5lZmRvb2Zua2dqbXBiZnBrbmlocGdkaGFocGJsaCdcbiAgRVhURU5TSU9OX0lEOiAnaWpjam1wZWpvbm1pbW9vZmJjcGFsaWVqaGlrYWVvbWgnICBcbiAgU0VMRl9JRDogY2hyb21lLnJ1bnRpbWUuaWRcbiAgaXNDb250ZW50U2NyaXB0OiBsb2NhdGlvbi5wcm90b2NvbCBpc250ICdjaHJvbWUtZXh0ZW5zaW9uOidcbiAgRVhUX0lEOiBudWxsXG4gIEVYVF9UWVBFOiBudWxsXG4gIFxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBARVhUX0lEID0gaWYgQEFQUF9JRCBpcyBAU0VMRl9JRCB0aGVuIEBFWFRFTlNJT05fSUQgZWxzZSBAQVBQX0lEXG4gICAgQEVYVF9UWVBFID0gaWYgQEFQUF9JRCBpcyBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcbiAgICBAU0VMRl9UWVBFID0gaWYgQEFQUF9JRCBpc250IEBTRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuXG4gIHdyYXBJbmJvdW5kOiAob2JqLCBmbmFtZSwgZikgLT5cbiAgICAgIF9rbGFzID0gb2JqXG4gICAgICBATElTVEVOLkV4dCBmbmFtZSwgKGFyZ3MpIC0+XG4gICAgICAgIGlmIGFyZ3M/LmlzUHJveHk/XG4gICAgICAgICAgaWYgdHlwZW9mIGFyZ3VtZW50c1sxXSBpcyBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgIGlmIGFyZ3MuYXJndW1lbnRzPy5sZW5ndGggPj0gMFxuICAgICAgICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgYXJncy5hcmd1bWVudHMuY29uY2F0IGFyZ3VtZW50c1sxXSBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIFtdLmNvbmNhdCBhcmd1bWVudHNbMV1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBhcmd1bWVudHNcblxuICAgICAgICAjIGFyZ3MgPSBbXVxuICAgICAgICAjIGlmIGFyZ3MuYXJndW1lbnRzPy5sZW5ndGggaXMgMFxuICAgICAgICAjICAgYXJncy5wdXNoIG51bGxcbiAgICAgICAgIyBlbHNlXG4gICAgICAgICMgICBhcmdzID0gX2FyZ3VtZW50c1xuICAgICAgICAjIF9hcmdzID0gYXJnc1swXT8ucHVzaChhcmdzWzFdKVxuICAgICAgICAjZi5hcHBseSBfa2xhcywgYXJnc1xuXG4gIHdyYXBPYmpJbmJvdW5kOiAob2JqKSAtPlxuICAgIChvYmpba2V5XSA9IEB3cmFwSW5ib3VuZCBvYmosIG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsga2V5LCBvYmpba2V5XSkgZm9yIGtleSBvZiBvYmogd2hlbiB0eXBlb2Ygb2JqW2tleV0gaXMgXCJmdW5jdGlvblwiXG4gICAgb2JqXG5cbiAgd3JhcE91dGJvdW5kOiAob2JqLCBmbmFtZSwgZikgLT5cbiAgICAtPlxuICAgICAgbXNnID0ge31cbiAgICAgIG1zZ1tmbmFtZV0gPSBcbiAgICAgICAgaXNQcm94eTp0cnVlXG4gICAgICAgIGFyZ3VtZW50czpBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcbiAgICAgIG1zZ1tmbmFtZV0uaXNQcm94eSA9IHRydWVcbiAgICAgIF9hcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG5cbiAgICAgIGlmIF9hcmdzLmxlbmd0aCBpcyAwXG4gICAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzID0gdW5kZWZpbmVkIFxuICAgICAgICByZXR1cm4gQE1TRy5FeHQgbXNnLCAoKSAtPiB1bmRlZmluZWRcblxuICAgICAgbXNnW2ZuYW1lXS5hcmd1bWVudHMgPSBfYXJnc1xuXG4gICAgICBjYWxsYmFjayA9IG1zZ1tmbmFtZV0uYXJndW1lbnRzLnBvcCgpXG4gICAgICBpZiB0eXBlb2YgY2FsbGJhY2sgaXNudCBcImZ1bmN0aW9uXCJcbiAgICAgICAgbXNnW2ZuYW1lXS5hcmd1bWVudHMucHVzaCBjYWxsYmFja1xuICAgICAgICBATVNHLkV4dCBtc2csICgpIC0+IHVuZGVmaW5lZFxuICAgICAgZWxzZVxuICAgICAgICBATVNHLkV4dCBtc2csICgpID0+XG4gICAgICAgICAgYXJneiA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuICAgICAgICAgICMgcHJveHlBcmdzID0gW2lzUHJveHk6YXJnel1cbiAgICAgICAgICBpZiBhcmd6Py5sZW5ndGggPiAwIGFuZCBhcmd6WzBdPy5pc1Byb3h5P1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkgQCwgYXJnelswXS5pc1Byb3h5IFxuXG4gIHdyYXBPYmpPdXRib3VuZDogKG9iaikgLT5cbiAgICAob2JqW2tleV0gPSBAd3JhcE91dGJvdW5kIG9iaiwgb2JqLmNvbnN0cnVjdG9yLm5hbWUgKyAnLicgKyBrZXksIG9ialtrZXldKSBmb3Iga2V5IG9mIG9iaiB3aGVuIHR5cGVvZiBvYmpba2V5XSBpcyBcImZ1bmN0aW9uXCJcbiAgICBvYmpcblxubW9kdWxlLmV4cG9ydHMgPSBDb25maWciLCJMSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5cbmNsYXNzIEZpbGVTeXN0ZW1cbiAgYXBpOiBjaHJvbWUuZmlsZVN5c3RlbVxuICByZXRhaW5lZERpcnM6IHt9XG4gIExJU1RFTjogTElTVEVOLmdldCgpIFxuICBNU0c6IE1TRy5nZXQoKVxuICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuICAjIEBkaXJzOiBuZXcgRGlyZWN0b3J5U3RvcmVcbiAgIyBmaWxlVG9BcnJheUJ1ZmZlcjogKGJsb2IsIG9ubG9hZCwgb25lcnJvcikgLT5cbiAgIyAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgIyAgIHJlYWRlci5vbmxvYWQgPSBvbmxvYWRcblxuICAjICAgcmVhZGVyLm9uZXJyb3IgPSBvbmVycm9yXG5cbiAgIyAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBibG9iXG5cbiAgcmVhZEZpbGU6IChkaXJFbnRyeSwgcGF0aCwgY2IpIC0+XG4gICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgcGF0aCxcbiAgICAgIChlcnIsIGZpbGVFbnRyeSkgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gY2I/IGVyclxuXG4gICAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGZpbGVcbiAgICAgICAgLChlcnIpID0+IGNiPyBlcnJcblxuICBnZXRGaWxlRW50cnk6IChkaXJFbnRyeSwgcGF0aCwgY2IpIC0+XG4gICAgICBkaXJFbnRyeS5nZXRGaWxlIHBhdGgsIHt9LCAoZmlsZUVudHJ5KSA9PlxuICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5XG4gICAgICAsKGVycikgPT4gY2I/IGVyclxuXG4gICMgb3BlbkRpcmVjdG9yeTogKGNhbGxiYWNrKSAtPlxuICBvcGVuRGlyZWN0b3J5OiAoZGlyZWN0b3J5RW50cnksIGNiKSAtPlxuICAjIEBhcGkuY2hvb3NlRW50cnkgdHlwZTonb3BlbkRpcmVjdG9yeScsIChkaXJlY3RvcnlFbnRyeSwgZmlsZXMpID0+XG4gICAgQGFwaS5nZXREaXNwbGF5UGF0aCBkaXJlY3RvcnlFbnRyeSwgKHBhdGhOYW1lKSA9PlxuICAgICAgZGlyID1cbiAgICAgICAgICByZWxQYXRoOiBkaXJlY3RvcnlFbnRyeS5mdWxsUGF0aCAjLnJlcGxhY2UoJy8nICsgZGlyZWN0b3J5RW50cnkubmFtZSwgJycpXG4gICAgICAgICAgZGlyZWN0b3J5RW50cnlJZDogQGFwaS5yZXRhaW5FbnRyeShkaXJlY3RvcnlFbnRyeSlcbiAgICAgICAgICBlbnRyeTogZGlyZWN0b3J5RW50cnlcbiAgICAgIGNiPyBudWxsLCBwYXRoTmFtZSwgZGlyXG4gICAgICAgICAgIyBAZ2V0T25lRGlyTGlzdCBkaXJcbiAgICAgICAgICAjIFN0b3JhZ2Uuc2F2ZSAnZGlyZWN0b3JpZXMnLCBAc2NvcGUuZGlyZWN0b3JpZXMgKHJlc3VsdCkgLT5cblxuICBnZXRMb2NhbEZpbGVFbnRyeTogKGRpciwgZmlsZVBhdGgsIGNiKSA9PiBcbiAgICBkaXJFbnRyeSA9IGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKCkgLT5cbiAgICBpZiBub3QgZGlyRW50cnk/XG4gICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgICAgICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgZmlsZVBhdGgsIGNiXG4gICAgZWxzZVxuICAgICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgZmlsZVBhdGgsIGNiXG5cblxuXG4gICMgZ2V0TG9jYWxGaWxlOiAoZGlyLCBmaWxlUGF0aCwgY2IsIGVycm9yKSA9PiBcbiAgIyAjIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAjICMgICBkaXJFbnRyeSA9IEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdXG4gICMgIyAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgIyAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAjICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAjICAgICAsKF9lcnJvcikgPT4gZXJyb3IoX2Vycm9yKVxuICAjICMgZWxzZVxuICAjICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICMgICAgICMgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0gPSBkaXJFbnRyeVxuICAjICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgaWYgZXJyPyB0aGVuIGNiPyBlcnJcbiAgIyAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBmaWxlXG4gICMgICAsKF9lcnJvcikgPT4gY2I/KF9lcnJvcilcblxuICAgICAgIyBAZmluZEZpbGVGb3JRdWVyeVN0cmluZyBpbmZvLnVyaSwgc3VjY2VzcyxcbiAgICAgICMgICAgIChlcnIpID0+XG4gICAgICAjICAgICAgICAgQGZpbmRGaWxlRm9yUGF0aCBpbmZvLCBjYlxuXG4gICMgZmluZEZpbGVGb3JQYXRoOiAoaW5mbywgY2IpID0+XG4gICMgICAgIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBjYiwgaW5mby5yZWZlcmVyXG5cbiAgIyBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nOiAoX3VybCwgY2IsIGVycm9yLCByZWZlcmVyKSA9PlxuICAjICAgICB1cmwgPSBkZWNvZGVVUklDb21wb25lbnQoX3VybCkucmVwbGFjZSAvLio/c2xyZWRpclxcPS8sICcnXG5cbiAgIyAgICAgbWF0Y2ggPSBpdGVtIGZvciBpdGVtIGluIEBtYXBzIHdoZW4gdXJsLm1hdGNoKG5ldyBSZWdFeHAoaXRlbS51cmwpKT8gYW5kIGl0ZW0udXJsPyBhbmQgbm90IG1hdGNoP1xuXG4gICMgICAgIGlmIG1hdGNoP1xuICAjICAgICAgICAgaWYgcmVmZXJlcj9cbiAgIyAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5tYXRjaCgvLipcXC9cXC8uKj9cXC8oLiopLyk/WzFdXG4gICMgICAgICAgICBlbHNlXG4gICMgICAgICAgICAgICAgZmlsZVBhdGggPSB1cmwucmVwbGFjZSBuZXcgUmVnRXhwKG1hdGNoLnVybCksIG1hdGNoLnJlZ2V4UmVwbFxuXG4gICMgICAgICAgICBmaWxlUGF0aC5yZXBsYWNlICcvJywgJ1xcXFwnIGlmIHBsYXRmb3JtIGlzICd3aW4nXG5cbiAgIyAgICAgICAgIGRpciA9IEBTdG9yYWdlLmRhdGEuZGlyZWN0b3JpZXNbbWF0Y2guZGlyZWN0b3J5XVxuXG4gICMgICAgICAgICBpZiBub3QgZGlyPyB0aGVuIHJldHVybiBlcnIgJ25vIG1hdGNoJ1xuXG4gICMgICAgICAgICBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgIyAgICAgICAgICAgICBkaXJFbnRyeSA9IEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdXG4gICMgICAgICAgICAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgICAgIGVsc2VcbiAgIyAgICAgICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0gPSBkaXJFbnRyeVxuICAjICAgICAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICAgICAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICAgICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgIGVsc2VcbiAgIyAgICAgICAgIGVycm9yKClcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlU3lzdGVtIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBMSVNURU4gZXh0ZW5kcyBDb25maWdcbiAgbG9jYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGV4dGVybmFsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWxcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGluc3RhbmNlID0gbnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIFxuICAgIGNocm9tZS5ydW50aW1lLm9uQ29ubmVjdEV4dGVybmFsLmFkZExpc3RlbmVyIChwb3J0KSA9PlxuICAgICAgcG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gICAgQGxvY2FsLmFwaS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZVxuICAgIEBleHRlcm5hbC5hcGk/LmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICBAZ2V0OiAoKSAtPlxuICAgIGluc3RhbmNlID89IG5ldyBMSVNURU5cblxuICBMb2NhbDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgIEBsb2NhbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIEV4dDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgICMgc2hvdyAnYWRkaW5nIGV4dCBsaXN0ZW5lciBmb3IgJyArIG1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBfb25NZXNzYWdlRXh0ZXJuYWw6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuXG4gICAgX3NlbmRSZXNwb25zZSA9ICh3aGF0ZXZlci4uLikgPT5cbiAgICAgIHRyeVxuICAgICAgICAjIHdoYXRldmVyLnNoaWZ0KCkgaWYgd2hhdGV2ZXJbMF0gaXMgbnVsbCBhbmQgd2hhdGV2ZXJbMV0/XG4gICAgICAgIHNlbmRSZXNwb25zZS5hcHBseSBudWxsLHByb3h5QXJncyA9IFtpc1Byb3h5OndoYXRldmVyXVxuXG4gICAgICBjYXRjaCBlXG4gICAgICAgIHVuZGVmaW5lZCAjIGVycm9yIGJlY2F1c2Ugbm8gcmVzcG9uc2Ugd2FzIHJlcXVlc3RlZCBmcm9tIHRoZSBNU0csIGRvbid0IGNhcmVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcbiAgICAgIFxuICAgICMgKHNob3cgXCI8PT0gR09UIEVYVEVSTkFMIE1FU1NBR0UgPT0gI3sgQEVYVF9UWVBFIH0gPT1cIiArIF9rZXkpIGZvciBfa2V5IG9mIHJlcXVlc3RcbiAgICBpZiBzZW5kZXIuaWQgaXNudCBARVhUX0lEIGFuZCBzZW5kZXIuY29uc3RydWN0b3IubmFtZSBpc250ICdQb3J0J1xuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgX3NlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcbiAgICBcbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkICMgZm9yIHN5bmNocm9ub3VzIHNlbmRSZXNwb25zZVxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgX29uTWVzc2FnZTogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHJlc3BvbnNlU3RhdHVzID0gY2FsbGVkOmZhbHNlXG4gICAgX3NlbmRSZXNwb25zZSA9ID0+XG4gICAgICB0cnlcbiAgICAgICAgIyBzaG93ICdjYWxsaW5nIHNlbmRyZXNwb25zZSdcbiAgICAgICAgc2VuZFJlc3BvbnNlLmFwcGx5IHRoaXMsYXJndW1lbnRzXG4gICAgICBjYXRjaCBlXG4gICAgICAgICMgc2hvdyBlXG4gICAgICByZXNwb25zZVN0YXR1cy5jYWxsZWQgPSB0cnVlXG5cbiAgICAjIChzaG93IFwiPD09IEdPVCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgQGxvY2FsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG5cbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkXG4gICAgICAjIHNob3cgJ3JldHVybmluZyB0cnVlJ1xuICAgICAgcmV0dXJuIHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBMSVNURU4iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIE1TRyBleHRlbmRzIENvbmZpZ1xuICBpbnN0YW5jZSA9IG51bGxcbiAgcG9ydDpudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgQHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG5cbiAgQGdldDogKCkgLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgTVNHXG5cbiAgQGNyZWF0ZVBvcnQ6ICgpIC0+XG5cblxuICBMb2NhbDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0OiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICAoc2hvdyBcIj09IE1FU1NBR0UgRVhURVJOQUwgI3sgX2tleSB9ID09PlwiKSBmb3IgX2tleSBvZiBtZXNzYWdlXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgQEVYVF9JRCwgbWVzc2FnZSwgcmVzcG9uZFxuICBFeHRQb3J0OiAobWVzc2FnZSkgLT5cbiAgICB0cnlcbiAgICAgIEBwb3J0LnBvc3RNZXNzYWdlIG1lc3NhZ2VcbiAgICBjYXRjaFxuICAgICAgQHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG4gICAgICBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG5cbm1vZHVsZS5leHBvcnRzID0gTVNHIiwiLyoqXG4gKiBERVZFTE9QRUQgQllcbiAqIEdJTCBMT1BFUyBCVUVOT1xuICogZ2lsYnVlbm8ubWFpbEBnbWFpbC5jb21cbiAqXG4gKiBXT1JLUyBXSVRIOlxuICogSUUgOSssIEZGIDQrLCBTRiA1KywgV2ViS2l0LCBDSCA3KywgT1AgMTIrLCBCRVNFTiwgUmhpbm8gMS43K1xuICpcbiAqIEZPUks6XG4gKiBodHRwczovL2dpdGh1Yi5jb20vbWVsYW5rZS9XYXRjaC5KU1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgICAgIC8vIGxpa2UgTm9kZS5cbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIHdpbmRvdy5XYXRjaEpTID0gZmFjdG9yeSgpO1xuICAgICAgICB3aW5kb3cud2F0Y2ggPSB3aW5kb3cuV2F0Y2hKUy53YXRjaDtcbiAgICAgICAgd2luZG93LnVud2F0Y2ggPSB3aW5kb3cuV2F0Y2hKUy51bndhdGNoO1xuICAgICAgICB3aW5kb3cuY2FsbFdhdGNoZXJzID0gd2luZG93LldhdGNoSlMuY2FsbFdhdGNoZXJzO1xuICAgIH1cbn0oZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIFdhdGNoSlMgPSB7XG4gICAgICAgIG5vTW9yZTogZmFsc2VcbiAgICB9LFxuICAgIGxlbmd0aHN1YmplY3RzID0gW107XG5cbiAgICB2YXIgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIChmdW5jdGlvblRvQ2hlY2spIHtcbiAgICAgICAgICAgIHZhciBnZXRUeXBlID0ge307XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb25Ub0NoZWNrICYmIGdldFR5cGUudG9TdHJpbmcuY2FsbChmdW5jdGlvblRvQ2hlY2spID09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gICAgfTtcblxuICAgIHZhciBpc0ludCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiB4ICUgMSA9PT0gMDtcbiAgICB9O1xuXG4gICAgdmFyIGlzQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0T2JqRGlmZiA9IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICB2YXIgYXBsdXMgPSBbXSxcbiAgICAgICAgYnBsdXMgPSBbXTtcblxuICAgICAgICBpZighKHR5cGVvZiBhID09IFwic3RyaW5nXCIpICYmICEodHlwZW9mIGIgPT0gXCJzdHJpbmdcIikpe1xuXG4gICAgICAgICAgICBpZiAoaXNBcnJheShhKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiW2ldID09PSB1bmRlZmluZWQpIGFwbHVzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gYSl7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihiW2ldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGx1cy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNBcnJheShiKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGo9MDsgajxiLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhW2pdID09PSB1bmRlZmluZWQpIGJwbHVzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGogaW4gYil7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiLmhhc093blByb3BlcnR5KGopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhW2pdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicGx1cy5wdXNoKGopO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFkZGVkOiBhcGx1cyxcbiAgICAgICAgICAgIHJlbW92ZWQ6IGJwbHVzXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGNsb25lID0gZnVuY3Rpb24ob2JqKXtcblxuICAgICAgICBpZiAobnVsbCA9PSBvYmogfHwgXCJvYmplY3RcIiAhPSB0eXBlb2Ygb2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvcHkgPSBvYmouY29uc3RydWN0b3IoKTtcblxuICAgICAgICBmb3IgKHZhciBhdHRyIGluIG9iaikge1xuICAgICAgICAgICAgY29weVthdHRyXSA9IG9ialthdHRyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb3B5O1xuXG4gICAgfVxuXG4gICAgdmFyIGRlZmluZUdldEFuZFNldCA9IGZ1bmN0aW9uIChvYmosIHByb3BOYW1lLCBnZXR0ZXIsIHNldHRlcikge1xuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICBPYmplY3Qub2JzZXJ2ZShvYmpbcHJvcE5hbWVdLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICBzZXR0ZXIoZGF0YSk7IC8vVE9ETzogYWRhcHQgb3VyIGNhbGxiYWNrIGRhdGEgdG8gbWF0Y2ggT2JqZWN0Lm9ic2VydmUgZGF0YSBzcGVjXG4gICAgICAgICAgICB9KTsgXG5cbiAgICAgICAgfSBjYXRjaChlKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3BOYW1lLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBnZXR0ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0OiBzZXR0ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoKGUyKSB7XG4gICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLl9fZGVmaW5lR2V0dGVyX18uY2FsbChvYmosIHByb3BOYW1lLCBnZXR0ZXIpO1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLl9fZGVmaW5lU2V0dGVyX18uY2FsbChvYmosIHByb3BOYW1lLCBzZXR0ZXIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2goZTMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwid2F0Y2hKUyBlcnJvcjogYnJvd3NlciBub3Qgc3VwcG9ydGVkIDovXCIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGRlZmluZVByb3AgPSBmdW5jdGlvbiAob2JqLCBwcm9wTmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3BOYW1lLCB7XG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBvYmpbcHJvcE5hbWVdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHdhdGNoID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHdhdGNoQWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB3YXRjaE1hbnkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdhdGNoT25lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cblxuICAgIHZhciB3YXRjaEFsbCA9IGZ1bmN0aW9uIChvYmosIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKSB7XG5cbiAgICAgICAgaWYgKCh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHJvcHMgPSBbXTtcblxuXG4gICAgICAgIGlmKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCA9IDA7IHByb3AgPCBvYmoubGVuZ3RoOyBwcm9wKyspIHsgLy9mb3IgZWFjaCBpdGVtIGlmIG9iaiBpcyBhbiBhcnJheVxuICAgICAgICAgICAgICAgIHByb3BzLnB1c2gocHJvcCk7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcDIgaW4gb2JqKSB7IC8vZm9yIGVhY2ggYXR0cmlidXRlIGlmIG9iaiBpcyBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3AyKSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3AyKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgd2F0Y2hNYW55KG9iaiwgcHJvcHMsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKTsgLy93YXRjaCBhbGwgaXRlbXMgb2YgdGhlIHByb3BzXG5cbiAgICAgICAgaWYgKGFkZE5SZW1vdmUpIHtcbiAgICAgICAgICAgIHB1c2hUb0xlbmd0aFN1YmplY3RzKG9iaiwgXCIkJHdhdGNobGVuZ3Roc3ViamVjdHJvb3RcIiwgd2F0Y2hlciwgbGV2ZWwpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdmFyIHdhdGNoTWFueSA9IGZ1bmN0aW9uIChvYmosIHByb3BzLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCkge1xuXG4gICAgICAgIGlmICgodHlwZW9mIG9iaiA9PSBcInN0cmluZ1wiKSB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHByb3BzLmxlbmd0aDsgaSsrKSB7IC8vd2F0Y2ggZWFjaCBwcm9wZXJ0eVxuICAgICAgICAgICAgdmFyIHByb3AgPSBwcm9wc1tpXTtcbiAgICAgICAgICAgIHdhdGNoT25lKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHdhdGNoT25lID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpIHtcblxuICAgICAgICBpZiAoKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGlzRnVuY3Rpb24ob2JqW3Byb3BdKSkgeyAvL2RvbnQgd2F0Y2ggaWYgaXQgaXMgYSBmdW5jdGlvblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYob2JqW3Byb3BdICE9IG51bGwgJiYgKGxldmVsID09PSB1bmRlZmluZWQgfHwgbGV2ZWwgPiAwKSl7XG4gICAgICAgICAgICB3YXRjaEFsbChvYmpbcHJvcF0sIHdhdGNoZXIsIGxldmVsIT09dW5kZWZpbmVkPyBsZXZlbC0xIDogbGV2ZWwsbnVsbCwgcGF0aCArICcuJyArIHByb3ApOyAvL3JlY3Vyc2l2ZWx5IHdhdGNoIGFsbCBhdHRyaWJ1dGVzIG9mIHRoaXNcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmluZVdhdGNoZXIob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgcGF0aCk7XG5cbiAgICAgICAgaWYoYWRkTlJlbW92ZSAmJiAobGV2ZWwgPT09IHVuZGVmaW5lZCB8fCBsZXZlbCA+IDApKXtcbiAgICAgICAgICAgIHB1c2hUb0xlbmd0aFN1YmplY3RzKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHVud2F0Y2ggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24oYXJndW1lbnRzWzFdKSkge1xuICAgICAgICAgICAgdW53YXRjaEFsbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoYXJndW1lbnRzWzFdKSkge1xuICAgICAgICAgICAgdW53YXRjaE1hbnkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVud2F0Y2hPbmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB1bndhdGNoQWxsID0gZnVuY3Rpb24gKG9iaiwgd2F0Y2hlcikge1xuXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBTdHJpbmcgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCA9IDA7IHByb3AgPCBvYmoubGVuZ3RoOyBwcm9wKyspIHsgLy9mb3IgZWFjaCBpdGVtIGlmIG9iaiBpcyBhbiBhcnJheVxuICAgICAgICAgICAgICAgIHByb3BzLnB1c2gocHJvcCk7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdW53YXRjaE1hbnkob2JqLCBwcm9wcywgd2F0Y2hlcik7IC8vd2F0Y2ggYWxsIGl0ZW5zIG9mIHRoZSBwcm9wc1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHVud2F0Y2hQcm9wc0luT2JqZWN0ID0gZnVuY3Rpb24gKG9iajIpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBvYmoyKSB7IC8vZm9yIGVhY2ggYXR0cmlidXRlIGlmIG9iaiBpcyBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iajIuaGFzT3duUHJvcGVydHkocHJvcDIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2JqMltwcm9wMl0gaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bndhdGNoUHJvcHNJbk9iamVjdChvYmoyW3Byb3AyXSk7IC8vcmVjdXJzIGludG8gb2JqZWN0IHByb3BzXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2gocHJvcDIpOyAvL3B1dCBpbiB0aGUgcHJvcHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB1bndhdGNoTWFueShvYmoyLCBwcm9wcywgd2F0Y2hlcik7IC8vdW53YXRjaCBhbGwgb2YgdGhlIHByb3BzXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdW53YXRjaFByb3BzSW5PYmplY3Qob2JqKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIHZhciB1bndhdGNoTWFueSA9IGZ1bmN0aW9uIChvYmosIHByb3BzLCB3YXRjaGVyKSB7XG5cbiAgICAgICAgZm9yICh2YXIgcHJvcDIgaW4gcHJvcHMpIHsgLy93YXRjaCBlYWNoIGF0dHJpYnV0ZSBvZiBcInByb3BzXCIgaWYgaXMgYW4gb2JqZWN0XG4gICAgICAgICAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkocHJvcDIpKSB7XG4gICAgICAgICAgICAgICAgdW53YXRjaE9uZShvYmosIHByb3BzW3Byb3AyXSwgd2F0Y2hlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGRlZmluZVdhdGNoZXIgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgcGF0aCkge1xuXG4gICAgICAgIHZhciB2YWwgPSBvYmpbcHJvcF07XG5cbiAgICAgICAgd2F0Y2hGdW5jdGlvbnMob2JqLCBwcm9wKTtcblxuICAgICAgICBpZiAoIW9iai53YXRjaGVycykge1xuICAgICAgICAgICAgZGVmaW5lUHJvcChvYmosIFwid2F0Y2hlcnNcIiwge30pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIW9iai5fcGF0aCkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcChvYmosIFwiX3BhdGhcIiwgcGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9iai53YXRjaGVyc1twcm9wXSkge1xuICAgICAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZihvYmoud2F0Y2hlcnNbcHJvcF1baV0gPT09IHdhdGNoZXIpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdLnB1c2god2F0Y2hlcik7IC8vYWRkIHRoZSBuZXcgd2F0Y2hlciBpbiB0aGUgd2F0Y2hlcnMgYXJyYXlcblxuXG4gICAgICAgIHZhciBnZXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgdmFyIHNldHRlciA9IGZ1bmN0aW9uIChuZXd2YWwpIHtcbiAgICAgICAgICAgIHZhciBvbGR2YWwgPSB2YWw7XG4gICAgICAgICAgICB2YWwgPSBuZXd2YWw7XG5cbiAgICAgICAgICAgIGlmIChsZXZlbCAhPT0gMCAmJiBvYmpbcHJvcF0pe1xuICAgICAgICAgICAgICAgIC8vIHdhdGNoIHN1YiBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgd2F0Y2hBbGwob2JqW3Byb3BdLCB3YXRjaGVyLCAobGV2ZWw9PT11bmRlZmluZWQpP2xldmVsOmxldmVsLTEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3YXRjaEZ1bmN0aW9ucyhvYmosIHByb3ApO1xuXG4gICAgICAgICAgICBpZiAoIVdhdGNoSlMubm9Nb3JlKXtcbiAgICAgICAgICAgICAgICAvL2lmIChKU09OLnN0cmluZ2lmeShvbGR2YWwpICE9PSBKU09OLnN0cmluZ2lmeShuZXd2YWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZHZhbCAhPT0gbmV3dmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxXYXRjaGVycyhvYmosIHByb3AsIFwic2V0XCIsIG5ld3ZhbCwgb2xkdmFsKTtcbiAgICAgICAgICAgICAgICAgICAgV2F0Y2hKUy5ub01vcmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZGVmaW5lR2V0QW5kU2V0KG9iaiwgcHJvcCwgZ2V0dGVyLCBzZXR0ZXIpO1xuXG4gICAgfTtcblxuICAgIHZhciBjYWxsV2F0Y2hlcnMgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCBhY3Rpb24sIG5ld3ZhbCwgb2xkdmFsKSB7XG4gICAgICAgIGlmIChwcm9wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHdyPTA7IHdyPG9iai53YXRjaGVyc1twcm9wXS5sZW5ndGg7IHdyKyspIHtcbiAgICAgICAgICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF1bd3JdLmNhbGwob2JqLCBwcm9wLCBhY3Rpb24sIG5ld3ZhbCwgb2xkdmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gb2JqKSB7Ly9jYWxsIGFsbFxuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKG9iaiwgcHJvcCwgYWN0aW9uLCBuZXd2YWwsIG9sZHZhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEB0b2RvIGNvZGUgcmVsYXRlZCB0byBcIndhdGNoRnVuY3Rpb25zXCIgaXMgY2VydGFpbmx5IGJ1Z2d5XG4gICAgdmFyIG1ldGhvZE5hbWVzID0gWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc2xpY2UnLCAndW5zaGlmdCcsICdzcGxpY2UnXTtcbiAgICB2YXIgZGVmaW5lQXJyYXlNZXRob2RXYXRjaGVyID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgb3JpZ2luYWwsIG1ldGhvZE5hbWUpIHtcbiAgICAgICAgZGVmaW5lUHJvcChvYmpbcHJvcF0sIG1ldGhvZE5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IG9yaWdpbmFsLmFwcGx5KG9ialtwcm9wXSwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHdhdGNoT25lKG9iaiwgb2JqW3Byb3BdKTtcbiAgICAgICAgICAgIGlmIChtZXRob2ROYW1lICE9PSAnc2xpY2UnKSB7XG4gICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKG9iaiwgcHJvcCwgbWV0aG9kTmFtZSxhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHdhdGNoRnVuY3Rpb25zID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7XG5cbiAgICAgICAgaWYgKCghb2JqW3Byb3BdKSB8fCAob2JqW3Byb3BdIGluc3RhbmNlb2YgU3RyaW5nKSB8fCAoIWlzQXJyYXkob2JqW3Byb3BdKSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSBtZXRob2ROYW1lcy5sZW5ndGgsIG1ldGhvZE5hbWU7IGktLTspIHtcbiAgICAgICAgICAgIG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgICAgICAgIGRlZmluZUFycmF5TWV0aG9kV2F0Y2hlcihvYmosIHByb3AsIG9ialtwcm9wXVttZXRob2ROYW1lXSwgbWV0aG9kTmFtZSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgdW53YXRjaE9uZSA9IGZ1bmN0aW9uIChvYmosIHByb3AsIHdhdGNoZXIpIHtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPG9iai53YXRjaGVyc1twcm9wXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHcgPSBvYmoud2F0Y2hlcnNbcHJvcF1baV07XG5cbiAgICAgICAgICAgIGlmKHcgPT0gd2F0Y2hlcikge1xuICAgICAgICAgICAgICAgIG9iai53YXRjaGVyc1twcm9wXS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZW1vdmVGcm9tTGVuZ3RoU3ViamVjdHMob2JqLCBwcm9wLCB3YXRjaGVyKTtcbiAgICB9O1xuXG4gICAgdmFyIGxvb3AgPSBmdW5jdGlvbigpe1xuXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPGxlbmd0aHN1YmplY3RzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIHZhciBzdWJqID0gbGVuZ3Roc3ViamVjdHNbaV07XG5cbiAgICAgICAgICAgIGlmIChzdWJqLnByb3AgPT09IFwiJCR3YXRjaGxlbmd0aHN1YmplY3Ryb290XCIpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWZmZXJlbmNlID0gZ2V0T2JqRGlmZihzdWJqLm9iaiwgc3Viai5hY3R1YWwpO1xuXG4gICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGggfHwgZGlmZmVyZW5jZS5yZW1vdmVkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQgIT0gZGlmZmVyZW5jZS5yZW1vdmVkICYmIChkaWZmZXJlbmNlLmFkZGVkWzBdICE9IGRpZmZlcmVuY2UucmVtb3ZlZFswXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaE1hbnkoc3Viai5vYmosIGRpZmZlcmVuY2UuYWRkZWQsIHN1Ymoud2F0Y2hlciwgc3Viai5sZXZlbCAtIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJqLndhdGNoZXIuY2FsbChzdWJqLm9iaiwgXCJyb290XCIsIFwiZGlmZmVyZW50YXR0clwiLCBkaWZmZXJlbmNlLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3Viai5hY3R1YWwgPSBjbG9uZShzdWJqLm9iaik7XG5cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZihzdWJqLm9ialtzdWJqLnByb3BdID09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgICAgICB2YXIgZGlmZmVyZW5jZSA9IGdldE9iakRpZmYoc3Viai5vYmpbc3Viai5wcm9wXSwgc3Viai5hY3R1YWwpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGggfHwgZGlmZmVyZW5jZS5yZW1vdmVkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGo9MDsgajxzdWJqLm9iai53YXRjaGVyc1tzdWJqLnByb3BdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hNYW55KHN1Ymoub2JqW3N1YmoucHJvcF0sIGRpZmZlcmVuY2UuYWRkZWQsIHN1Ymoub2JqLndhdGNoZXJzW3N1YmoucHJvcF1bal0sIHN1YmoubGV2ZWwgLSAxLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxXYXRjaGVycyhzdWJqLm9iaiwgc3Viai5wcm9wLCBcImRpZmZlcmVudGF0dHJcIiwgZGlmZmVyZW5jZSwgc3Viai5hY3R1YWwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN1YmouYWN0dWFsID0gY2xvbmUoc3Viai5vYmpbc3Viai5wcm9wXSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHB1c2hUb0xlbmd0aFN1YmplY3RzID0gZnVuY3Rpb24ob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCl7XG4gICAgICAgIFxuICAgICAgICB2YXIgYWN0dWFsO1xuXG4gICAgICAgIGlmIChwcm9wID09PSBcIiQkd2F0Y2hsZW5ndGhzdWJqZWN0cm9vdFwiKSB7XG4gICAgICAgICAgICBhY3R1YWwgPSAgY2xvbmUob2JqKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjdHVhbCA9IGNsb25lKG9ialtwcm9wXSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZW5ndGhzdWJqZWN0cy5wdXNoKHtcbiAgICAgICAgICAgIG9iajogb2JqLFxuICAgICAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgICAgIGFjdHVhbDogYWN0dWFsLFxuICAgICAgICAgICAgd2F0Y2hlcjogd2F0Y2hlcixcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHJlbW92ZUZyb21MZW5ndGhTdWJqZWN0cyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCwgd2F0Y2hlcil7XG5cbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPGxlbmd0aHN1YmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc3ViaiA9IGxlbmd0aHN1YmplY3RzW2ldO1xuXG4gICAgICAgICAgICBpZiAoc3Viai5vYmogPT0gb2JqICYmIHN1YmoucHJvcCA9PSBwcm9wICYmIHN1Ymoud2F0Y2hlciA9PSB3YXRjaGVyKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3Roc3ViamVjdHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgc2V0SW50ZXJ2YWwobG9vcCwgNTApO1xuXG4gICAgV2F0Y2hKUy53YXRjaCA9IHdhdGNoO1xuICAgIFdhdGNoSlMudW53YXRjaCA9IHVud2F0Y2g7XG4gICAgV2F0Y2hKUy5jYWxsV2F0Y2hlcnMgPSBjYWxsV2F0Y2hlcnM7XG5cbiAgICByZXR1cm4gV2F0Y2hKUztcblxufSkpO1xuIiwiY2xhc3MgTm90aWZpY2F0aW9uXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gIHNob3c6ICh0aXRsZSwgbWVzc2FnZSkgLT5cbiAgICB1bmlxdWVJZCA9IChsZW5ndGg9OCkgLT5cbiAgICAgIGlkID0gXCJcIlxuICAgICAgaWQgKz0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpIHdoaWxlIGlkLmxlbmd0aCA8IGxlbmd0aFxuICAgICAgaWQuc3Vic3RyIDAsIGxlbmd0aFxuXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlIHVuaXF1ZUlkKCksXG4gICAgICB0eXBlOidiYXNpYydcbiAgICAgIHRpdGxlOnRpdGxlXG4gICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICBpY29uVXJsOidpbWFnZXMvaWNvbi0zOC5wbmcnLFxuICAgICAgKGNhbGxiYWNrKSAtPlxuICAgICAgICB1bmRlZmluZWRcblxubW9kdWxlLmV4cG9ydHMgPSBOb3RpZmljYXRpb24iLCIjVE9ETzogcmV3cml0ZSB0aGlzIGNsYXNzIHVzaW5nIHRoZSBuZXcgY2hyb21lLnNvY2tldHMuKiBhcGkgd2hlbiB5b3UgY2FuIG1hbmFnZSB0byBtYWtlIGl0IHdvcmtcbmNsYXNzIFNlcnZlclxuICBzb2NrZXQ6IGNocm9tZS5zb2NrZXRcbiAgIyB0Y3A6IGNocm9tZS5zb2NrZXRzLnRjcFxuICBzb2NrZXRQcm9wZXJ0aWVzOlxuICAgICAgcGVyc2lzdGVudDp0cnVlXG4gICAgICBuYW1lOidTTFJlZGlyZWN0b3InXG4gICMgc29ja2V0SW5mbzpudWxsXG4gIGdldExvY2FsRmlsZTpudWxsXG4gIHNvY2tldElkczpbXVxuICBzdGF0dXM6XG4gICAgaG9zdDpudWxsXG4gICAgcG9ydDpudWxsXG4gICAgbWF4Q29ubmVjdGlvbnM6NTBcbiAgICBpc09uOmZhbHNlXG4gICAgc29ja2V0SW5mbzpudWxsXG4gICAgdXJsOm51bGxcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBAc3RhdHVzLmhvc3QgPSBcIjEyNy4wLjAuMVwiXG4gICAgQHN0YXR1cy5wb3J0ID0gMTAwMTJcbiAgICBAc3RhdHVzLm1heENvbm5lY3Rpb25zID0gNTBcbiAgICBAc3RhdHVzLnVybCA9ICdodHRwOi8vJyArIEBzdGF0dXMuaG9zdCArICc6JyArIEBzdGF0dXMucG9ydCArICcvJ1xuICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG5cblxuICBzdGFydDogKGhvc3QscG9ydCxtYXhDb25uZWN0aW9ucywgY2IpIC0+XG4gICAgaWYgaG9zdD8gdGhlbiBAc3RhdHVzLmhvc3QgPSBob3N0XG4gICAgaWYgcG9ydD8gdGhlbiBAc3RhdHVzLnBvcnQgPSBwb3J0XG4gICAgaWYgbWF4Q29ubmVjdGlvbnM/IHRoZW4gQHN0YXR1cy5tYXhDb25uZWN0aW9ucyA9IG1heENvbm5lY3Rpb25zXG5cbiAgICBAa2lsbEFsbCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgcmV0dXJuIGNiPyBlcnIgaWYgZXJyP1xuXG4gICAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuICAgICAgQHNvY2tldC5jcmVhdGUgJ3RjcCcsIHt9LCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgQHN0YXR1cy5zb2NrZXRJbmZvID0gc29ja2V0SW5mb1xuICAgICAgICBAc29ja2V0SWRzID0gW11cbiAgICAgICAgQHNvY2tldElkcy5wdXNoIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCAnc29ja2V0SWRzJzpAc29ja2V0SWRzXG4gICAgICAgIEBzb2NrZXQubGlzdGVuIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQHN0YXR1cy5ob3N0LCBAc3RhdHVzLnBvcnQsIChyZXN1bHQpID0+XG4gICAgICAgICAgaWYgcmVzdWx0ID4gLTFcbiAgICAgICAgICAgIHNob3cgJ2xpc3RlbmluZyAnICsgQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgICAgICBAc3RhdHVzLmlzT24gPSB0cnVlXG4gICAgICAgICAgICBAc29ja2V0LmFjY2VwdCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcbiAgICAgICAgICAgIGNiPyBudWxsLCBAc3RhdHVzXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2I/IHJlc3VsdFxuXG5cbiAga2lsbEFsbDogKGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0ICdzb2NrZXRJZHMnLCAocmVzdWx0KSA9PlxuICAgICAgQHNvY2tldElkcyA9IHJlc3VsdC5zb2NrZXRJZHNcbiAgICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG4gICAgICByZXR1cm4gY2I/IG51bGwsICdzdWNjZXNzJyB1bmxlc3MgQHNvY2tldElkcz9cbiAgICAgIGNudCA9IDBcbiAgICAgIGZvciBzIGluIEBzb2NrZXRJZHNcbiAgICAgICAgZG8gKHMpID0+XG4gICAgICAgICAgY250KytcbiAgICAgICAgICBAc29ja2V0LmdldEluZm8gcywgKHNvY2tldEluZm8pID0+XG4gICAgICAgICAgICBjbnQtLVxuICAgICAgICAgICAgaWYgbm90IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcj9cbiAgICAgICAgICAgICAgQHNvY2tldC5kaXNjb25uZWN0IHMgaWYgQHN0YXR1cy5zb2NrZXRJbmZvPy5jb25uZWN0ZWQgb3Igbm90IEBzdGF0dXMuc29ja2V0SW5mbz9cbiAgICAgICAgICAgICAgQHNvY2tldC5kZXN0cm95IHNcblxuICAgICAgICAgICAgY2I/IG51bGwsICdzdWNjZXNzJyBpZiBjbnQgaXMgMFxuXG4gIHN0b3A6IChjYikgLT5cbiAgICBAa2lsbEFsbCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgaWYgZXJyPyBcbiAgICAgICAgY2I/IGVyclxuICAgICAgZWxzZVxuICAgICAgICBjYj8gbnVsbCxzdWNjZXNzXG5cblxuICBfb25SZWNlaXZlOiAocmVjZWl2ZUluZm8pID0+XG4gICAgc2hvdyhcIkNsaWVudCBzb2NrZXQgJ3JlY2VpdmUnIGV2ZW50OiBzZD1cIiArIHJlY2VpdmVJbmZvLnNvY2tldElkXG4gICAgKyBcIiwgYnl0ZXM9XCIgKyByZWNlaXZlSW5mby5kYXRhLmJ5dGVMZW5ndGgpXG5cbiAgX29uTGlzdGVuOiAoc2VydmVyU29ja2V0SWQsIHJlc3VsdENvZGUpID0+XG4gICAgcmV0dXJuIHNob3cgJ0Vycm9yIExpc3RlbmluZzogJyArIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIGlmIHJlc3VsdENvZGUgPCAwXG4gICAgQHNlcnZlclNvY2tldElkID0gc2VydmVyU29ja2V0SWRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0LmFkZExpc3RlbmVyIEBfb25BY2NlcHRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0RXJyb3IuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdEVycm9yXG4gICAgQHRjcC5vblJlY2VpdmUuYWRkTGlzdGVuZXIgQF9vblJlY2VpdmVcbiAgICAjIHNob3cgXCJbXCIrc29ja2V0SW5mby5wZWVyQWRkcmVzcytcIjpcIitzb2NrZXRJbmZvLnBlZXJQb3J0K1wiXSBDb25uZWN0aW9uIGFjY2VwdGVkIVwiO1xuICAgICMgaW5mbyA9IEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICMgQGdldEZpbGUgdXJpLCAoZmlsZSkgLT5cbiAgX29uQWNjZXB0RXJyb3I6IChlcnJvcikgLT5cbiAgICBzaG93IGVycm9yXG5cbiAgX29uQWNjZXB0OiAoc29ja2V0SW5mbykgPT5cbiAgICAjIHJldHVybiBudWxsIGlmIGluZm8uc29ja2V0SWQgaXNudCBAc2VydmVyU29ja2V0SWRcbiAgICBzaG93KFwiU2VydmVyIHNvY2tldCAnYWNjZXB0JyBldmVudDogc2Q9XCIgKyBzb2NrZXRJbmZvLnNvY2tldElkKVxuICAgIGlmIHNvY2tldEluZm8/LnNvY2tldElkP1xuICAgICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkLCAoZXJyLCBpbmZvKSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgZXJyPyB0aGVuIHJldHVybiBAX3dyaXRlRXJyb3Igc29ja2V0SW5mby5zb2NrZXRJZCwgNDA0LCBpbmZvLmtlZXBBbGl2ZVxuXG4gICAgICAgIEBnZXRMb2NhbEZpbGUgaW5mbywgKGVyciwgZmlsZUVudHJ5LCBmaWxlUmVhZGVyKSA9PlxuICAgICAgICAgIGlmIGVycj8gdGhlbiBAX3dyaXRlRXJyb3Igc29ja2V0SW5mby5zb2NrZXRJZCwgNDA0LCBpbmZvLmtlZXBBbGl2ZVxuICAgICAgICAgIGVsc2UgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldEluZm8uc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZVJlYWRlciwgaW5mby5rZWVwQWxpdmVcbiAgICBlbHNlXG4gICAgICBzaG93IFwiTm8gc29ja2V0PyFcIlxuICAgICMgQHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG5cblxuICBzdHJpbmdUb1VpbnQ4QXJyYXk6IChzdHJpbmcpIC0+XG4gICAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHN0cmluZy5sZW5ndGgpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICBpID0gMFxuXG4gICAgd2hpbGUgaSA8IHN0cmluZy5sZW5ndGhcbiAgICAgIHZpZXdbaV0gPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuICAgICAgaSsrXG4gICAgdmlld1xuXG4gIGFycmF5QnVmZmVyVG9TdHJpbmc6IChidWZmZXIpIC0+XG4gICAgc3RyID0gXCJcIlxuICAgIHVBcnJheVZhbCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICBzID0gMFxuXG4gICAgd2hpbGUgcyA8IHVBcnJheVZhbC5sZW5ndGhcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVBcnJheVZhbFtzXSlcbiAgICAgIHMrK1xuICAgIHN0clxuXG4gIF93cml0ZTIwMFJlc3BvbnNlOiAoc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZSwga2VlcEFsaXZlKSAtPlxuICAgIGNvbnRlbnRUeXBlID0gKGlmIChmaWxlLnR5cGUgaXMgXCJcIikgdGhlbiBcInRleHQvcGxhaW5cIiBlbHNlIGZpbGUudHlwZSlcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIDIwMCBPS1xcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoKGlmIGtlZXBBbGl2ZSB0aGVuIFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIGVsc2UgXCJcIikpICsgXCJcXG5cXG5cIilcbiAgICBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldCBoZWFkZXIsIDBcblxuICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChldikgPT5cbiAgICAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGV2LnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aFxuICAgICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICAgICBzaG93IHdyaXRlSW5mb1xuICAgICAgICAjIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLm9uZXJyb3IgPSAoZXJyb3IpID0+XG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgZmlsZVxuXG5cbiAgICAjIEBlbmQgc29ja2V0SWRcbiAgICAjIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgIyBmaWxlUmVhZGVyLm9ubG9hZCA9IChlKSA9PlxuICAgICMgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShlLnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aFxuICAgICMgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgIyAgICAgc2hvdyBcIldSSVRFXCIsIHdyaXRlSW5mb1xuICAgICMgICAgICAgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldElkXG5cblxuICBfcmVhZEZyb21Tb2NrZXQ6IChzb2NrZXRJZCwgY2IpIC0+XG4gICAgQHNvY2tldC5yZWFkIHNvY2tldElkLCAocmVhZEluZm8pID0+XG4gICAgICBzaG93IFwiUkVBRFwiLCByZWFkSW5mb1xuXG4gICAgICAjIFBhcnNlIHRoZSByZXF1ZXN0LlxuICAgICAgZGF0YSA9IEBhcnJheUJ1ZmZlclRvU3RyaW5nKHJlYWRJbmZvLmRhdGEpXG4gICAgICBzaG93IGRhdGFcblxuICAgICAga2VlcEFsaXZlID0gZmFsc2VcbiAgICAgIGtlZXBBbGl2ZSA9IHRydWUgaWYgZGF0YS5pbmRleE9mICdDb25uZWN0aW9uOiBrZWVwLWFsaXZlJyBpc250IC0xXG5cbiAgICAgIGlmIGRhdGEuaW5kZXhPZihcIkdFVCBcIikgaXNudCAwXG4gICAgICAgIHJldHVybiBjYj8gJzQwNCcsIGtlZXBBbGl2ZTprZWVwQWxpdmVcblxuXG5cbiAgICAgIHVyaUVuZCA9IGRhdGEuaW5kZXhPZihcIiBcIiwgNClcblxuICAgICAgcmV0dXJuIGVuZCBzb2NrZXRJZCBpZiB1cmlFbmQgPCAwXG5cbiAgICAgIHVyaSA9IGRhdGEuc3Vic3RyaW5nKDQsIHVyaUVuZClcbiAgICAgIGlmIG5vdCB1cmk/XG4gICAgICAgIHJldHVybiBjYj8gJzQwNCcsIGtlZXBBbGl2ZTprZWVwQWxpdmVcblxuICAgICAgaW5mbyA9XG4gICAgICAgIHVyaTogdXJpXG4gICAgICAgIGtlZXBBbGl2ZTprZWVwQWxpdmVcbiAgICAgIGluZm8ucmVmZXJlciA9IGRhdGEubWF0Y2goL1JlZmVyZXI6XFxzKC4qKS8pP1sxXVxuICAgICAgI3N1Y2Nlc3NcbiAgICAgIGNiPyBudWxsLCBpbmZvXG5cbiAgZW5kOiAoc29ja2V0SWQsIGtlZXBBbGl2ZSkgLT5cbiAgICAgICMgaWYga2VlcEFsaXZlXG4gICAgICAjICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgIyBlbHNlXG4gICAgQHNvY2tldC5kaXNjb25uZWN0IHNvY2tldElkXG4gICAgQHNvY2tldC5kZXN0cm95IHNvY2tldElkXG4gICAgc2hvdyAnZW5kaW5nICcgKyBzb2NrZXRJZFxuICAgIEBzb2NrZXQuYWNjZXB0IEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG4gIF93cml0ZUVycm9yOiAoc29ja2V0SWQsIGVycm9yQ29kZSwga2VlcEFsaXZlKSAtPlxuICAgIGZpbGUgPSBzaXplOiAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogYmVnaW4uLi4gXCJcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBmaWxlID0gXCIgKyBmaWxlXG4gICAgY29udGVudFR5cGUgPSBcInRleHQvcGxhaW5cIiAjKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIFwiICsgZXJyb3JDb2RlICsgXCIgTm90IEZvdW5kXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyBoZWFkZXIuLi5cIlxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyB2aWV3Li4uXCJcbiAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcblxubW9kdWxlLmV4cG9ydHMgPSBTZXJ2ZXJcbiIsIkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcbiMgd2luZG93Lk9ic2VydmFibGUgPSByZXF1aXJlICcuL29ic2VydmUuY29mZmVlJ1xuIyByZXF1aXJlICdPYmplY3Qtb2JzZXJ2ZS1wb2x5ZmlsbCdcbiMgT2JzZXJ2YWJsZSA9IHJlcXVpcmUgJ29ic2VydmVkJ1xuV2F0Y2hKUyA9IHJlcXVpcmUgJ3dhdGNoanMnXG53YXRjaCA9IFdhdGNoSlMud2F0Y2hcbnVud2F0Y2ggPSBXYXRjaEpTLnVud2F0Y2hcbmNhbGxXYXRjaGVycyA9IFdhdGNoSlMuY2FsbFdhdGNoZXJzXG5cbmNsYXNzIFN0b3JhZ2VcbiAgYXBpOiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICBMSVNURU46IExJU1RFTi5nZXQoKSBcbiAgTVNHOiBNU0cuZ2V0KClcbiAgZGF0YTogXG4gICAgY3VycmVudFJlc291cmNlczogW11cbiAgICBkaXJlY3RvcmllczpbXVxuICAgIG1hcHM6W11cbiAgICB0YWJNYXBzOnt9XG4gICAgY3VycmVudEZpbGVNYXRjaGVzOnt9XG4gIFxuICBzZXNzaW9uOnt9XG5cbiAgb25EYXRhTG9hZGVkOiAtPlxuXG4gIGNhbGxiYWNrOiAoKSAtPlxuICBub3RpZnlPbkNoYW5nZTogKCkgLT5cbiAgY29uc3RydWN0b3I6IChfb25EYXRhTG9hZGVkKSAtPlxuICAgIEBvbkRhdGFMb2FkZWQgPSBfb25EYXRhTG9hZGVkIGlmIF9vbkRhdGFMb2FkZWQ/XG4gICAgQGFwaS5nZXQgKHJlc3VsdHMpID0+XG4gICAgICBAZGF0YVtrXSA9IHJlc3VsdHNba10gZm9yIGsgb2YgcmVzdWx0c1xuXG4gICAgICB3YXRjaEFuZE5vdGlmeSBALCdkYXRhQ2hhbmdlZCcsIEBkYXRhLCB0cnVlXG5cbiAgICAgIHdhdGNoQW5kTm90aWZ5IEAsJ3Nlc3Npb25EYXRhJywgQHNlc3Npb24sIGZhbHNlXG5cbiAgICAgIEBvbkRhdGFMb2FkZWQgQGRhdGFcblxuICAgIEBpbml0KClcblxuICBpbml0OiAoKSAtPlxuICAgIFxuICAgICMgQHJldHJpZXZlQWxsKClcblxuICBcbiAgaXNBcnJheTogLT4gXG4gICAgQXJyYXkuaXNBcnJheSB8fCAoIHZhbHVlICkgLT4gcmV0dXJuIHt9LnRvU3RyaW5nLmNhbGwoIHZhbHVlICkgaXMgJ1tvYmplY3QgQXJyYXldJ1xuXG4gIHdhdGNoQW5kTm90aWZ5ID0gKF90aGlzLCBtc2dLZXksIG9iaiwgc3RvcmUpIC0+XG4gICAgICAjIF90aGlzLm9ic2VydmVyID0gT2JzZXJ2YWJsZSBvYmpcbiAgICAgICMgX3RoaXMub2JzZXJ2ZXIub24gJ2NoYW5nZScsIChjaGFuZ2UpIC0+XG4gICAgICAgICMgaWYgY2hhbmdlLm5hbWUgaXMgJ2xlbmd0aCcgICAgICAgICAgXG4gICAgICAgICMgICBwYXRoID0gY2hhbmdlLnBhdGguc3BsaXQoJ15eJylcbiAgICAgICAgIyAgIHNhdmVBcnIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjaGFuZ2Uub2JqZWN0W3BhdGhbMF1dKSBcbiAgICAgICAgIyAgIGNoYW5nZS5vYmplY3RbcGF0aFswXV0ubGVuZ3RoID0gMFxuICAgICAgICAjICAgc2V0VGltZW91dCAoKSAtPlxuICAgICAgICAjICAgICBjaGFuZ2Uub2JqZWN0W3BhdGhbMF1dID0gc2F2ZUFyclxuICAgICAgX2xpc3RlbmVyID0gKHByb3AsIGFjdGlvbiwgbmV3VmFsLCBvbGRWYWwpIC0+XG4gICAgICAgIGlmIChhY3Rpb24gaXMgXCJzZXRcIiBvciBcImRpZmZlcmVudGF0dHJcIikgYW5kIF90aGlzLm5vV2F0Y2ggaXMgZmFsc2VcbiAgICAgICAgICBpZiBub3QgL15cXGQrJC8udGVzdChwcm9wKVxuICAgICAgICAgICAgc2hvdyBhcmd1bWVudHNcbiAgICAgICAgICAgIF90aGlzLmFwaS5zZXQgb2JqIGlmIHN0b3JlXG4gICAgICAgICAgICBtc2cgPSB7fVxuICAgICAgICAgICAgbXNnW21zZ0tleV0gPSBvYmpcbiAgICAgICAgICAgICMgdW53YXRjaCBvYmosIF9saXN0ZW5lciwzLHRydWVcbiAgICAgICAgICAgIF90aGlzLk1TRy5FeHRQb3J0IG1zZ1xuICAgICAgICBcbiAgICAgIF90aGlzLm5vV2F0Y2ggPSBmYWxzZVxuICAgICAgd2F0Y2ggb2JqLCBfbGlzdGVuZXIsMyx0cnVlXG4gICAgICAgICMgX3RoaXMuTVNHLkV4dFBvcnQgbXNnXG5cbiAgICAgIF90aGlzLkxJU1RFTi5FeHQgbXNnS2V5LCAoZGF0YSkgLT5cbiAgICAgICAgX3RoaXMubm9XYXRjaCA9IHRydWVcbiAgICAgICAgIyB1bndhdGNoIG9iaiwgX2xpc3RlbmVyLDMsdHJ1ZVxuICAgICAgICBcbiAgICAgICAgb2JqW2tdID0gZGF0YVtrXSBmb3IgayBvZiBkYXRhXG4gICAgICAgIHNldFRpbWVvdXQgKCkgLT4gXG4gICAgICAgICAgX3RoaXMubm9XYXRjaCA9IGZhbHNlXG4gICAgICAgICwyMDBcbiAgICAgICAgIyB3YXRjaCBvYmosIF9saXN0ZW5lciwzLHRydWVcblxuICAgICAgICAjIHNob3cgY2hhbmdlXG4gICAgICAgICMgb2JqID89IHt9XG4gICAgICAgICMgc2hvdyAnZGF0YSBjaGFuZ2VkICdcbiAgICAgICAgIyBzaG93IGNoYW5nZVxuICAgICAgICAjIHJldHVybiBpZiBfdGhpcy5pc0FycmF5KGNoYW5nZS5vYmplY3QpXG5cbiAgICAgICAgIyAoKGRhdGEsIGFwaSwgb2JzZXJ2ZXIpIC0+XG4gICAgICAgICMgICBzdGFjayA9IGNoYW5nZS5wYXRoLnNwbGl0ICdeXidcblxuICAgICAgICAjICAgcmV0dXJuIGRhdGFbc3RhY2tbMF1dID0gY2hhbmdlLnZhbHVlIGlmIG5vdCBkYXRhW3N0YWNrWzBdXT9cblxuICAgICAgICAjICAgd2hpbGUgc3RhY2subGVuZ3RoID4gMCBcbiAgICAgICAgIyAgICAgX3NoaWZ0ID0gc3RhY2suc2hpZnQoKVxuICAgICAgICAgICAgXG4gICAgICAgICMgICAgIGlmIHN0YWNrLmxlbmd0aCA+IDAgYW5kIGlzQXJyYXkoZGF0YVtfc2hpZnRdKSBhbmQgY2hhbmdlLm5hbWUgaXMgc3RhY2tbMF1cbiAgICAgICAgIyAgICAgICBuZXdBcnIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjaGFuZ2Uub2JqZWN0KVxuICAgICAgICAjICAgICAgICMgT2JzZXJ2YWJsZSBuZXdBcnJcbiAgICAgICAgIyAgICAgICBkYXRhW19zaGlmdF0gPSBuZXdBcnJcbiAgICAgICAgIyAgICAgICByZXR1cm5cblxuICAgICAgICAjICAgICBpZiAvXlxcZCskLy50ZXN0IF9zaGlmdCBcbiAgICAgICAgIyAgICAgICBfc2hpZnQgPSBwYXJzZUludCBfc2hpZnRcbiAgICAgICAgIyAgICAgICAjIGVsc2UgaWYgY2hhbmdlLnR5cGUgaXMgJ3VwZGF0ZScgYW5kIGNoYW5nZS5uYW1lIGlzICdsZW5ndGgnXG5cbiAgICAgICAgIyAgICAgZGF0YSA9IGRhdGFbX3NoaWZ0XSB1bmxlc3Mgc3RhY2subGVuZ3RoIGlzIDBcblxuICAgICAgICAjICAgIyBwYXVzZWQgPSBvYnNlcnZlci5wYXVzZSBkYXRhXG4gICAgICAgICMgICBkYXRhW19zaGlmdF0gPSBjaGFuZ2UudmFsdWVcblxuICAgICAgICAjICAgIyBzZXRUaW1lb3V0ICgpIC0+XG4gICAgICAgICMgICAjICAgICBvYnNlcnZlci5yZXN1bWUgcGF1c2VkXG4gICAgICAgICMgICAjICwyMCAgXG4gICAgICAgICMgKShvYmosIF90aGlzLmFwaSwgX3RoaXMub2JzZXJ2ZXIpICAgIFxuXG4gIHNhdmU6IChrZXksIGl0ZW0sIGNiKSAtPlxuXG4gICAgb2JqID0ge31cbiAgICBvYmpba2V5XSA9IGl0ZW1cbiAgICBAZGF0YVtrZXldID0gaXRlbVxuICAgIEBhcGkuc2V0IG9iaiwgKHJlcykgPT5cbiAgICAgIGNiPygpXG4gICAgICBAY2FsbGJhY2s/KClcbiBcbiAgc2F2ZUFsbDogKGRhdGEsIGNiKSAtPlxuXG4gICAgaWYgZGF0YT8gXG4gICAgICBAYXBpLnNldCBkYXRhLCAoKSA9PlxuICAgICAgICBjYj8oKVxuXG4gICAgICAgICMgQGNhbGxiYWNrPygpXG4gICAgZWxzZVxuICAgICAgQGFwaS5zZXQgQGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG5cbiAgICAgICAgIyBAY2FsbGJhY2s/KClcbiAgICAjIHNob3cgJ3NhdmVBbGwgQGRhdGE6ICcgKyBAZGF0YS5zb2NrZXRJZHM/WzBdXG4gICAgIyBzaG93ICdzYXZlQWxsIGRhdGE6ICcgKyBkYXRhLnNvY2tldElkcz9bMF1cblxuICByZXRyaWV2ZTogKGtleSwgY2IpIC0+XG4gICAgQG9ic2VydmVyLnN0b3AoKVxuICAgIEBhcGkuZ2V0IGtleSwgKHJlc3VsdHMpIC0+XG4gICAgICBAZGF0YVtyXSA9IHJlc3VsdHNbcl0gZm9yIHIgb2YgcmVzdWx0c1xuICAgICAgaWYgY2I/IHRoZW4gY2IgcmVzdWx0c1trZXldXG5cbiAgcmV0cmlldmVBbGw6IChjYikgLT5cbiAgICAjIEBvYnNlcnZlci5zdG9wKClcbiAgICBAYXBpLmdldCAocmVzdWx0KSA9PlxuICAgICAgZm9yIGMgb2YgcmVzdWx0IFxuICAgICAgIyAgIGRlbGV0ZSBAZGF0YVtjXVxuICAgICAgICBAZGF0YVtjXSA9IHJlc3VsdFtjXSBcbiAgICAgICMgQGRhdGEgPSByZXN1bHRcbiAgICAgICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6XG4gICAgICAgICAgcGF0aDpjXG4gICAgICAgICAgdmFsdWU6cmVzdWx0W2NdXG4gICAgICAjIEBvYnNlcnZlciA9IE9ic2VydmFibGUgQGRhdGFcbiAgICAgICMgQG9ic2VydmVyLm9uICdjaGFuZ2UnLCAoY2hhbmdlKSA9PlxuICAgICAgIyAgIGlmIGNoYW5nZS5uYW1lIGlzbnQgJ2xlbmd0aCdcbiAgICAgICMgICAgIHNob3cgY2hhbmdlXG4gICAgICAjICAgICBAYXBpLnNldCBAZGF0YVxuICAgICAgIyAgICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6Y2hhbmdlIFxuXG4gICAgICBAYXBpLnNldCBAZGF0YVxuICAgICAgIyBAY2FsbGJhY2s/IHJlc3VsdFxuICAgICAgY2I/IHJlc3VsdFxuICAgICAgQG9uRGF0YUxvYWRlZCBAZGF0YVxuXG4gICAgICAjIEBNU0cuRXh0UG9ydCAnZGF0YUNoYW5nZWQnOlxuICAgICAgIyBAb2JzZXJ2ZXIgPSBPYnNlcnZhYmxlIEBkYXRhXG4gICAgICAjIEBvYnNlcnZlci5vbiAnY2hhbmdlJywgKGNoYW5nZSkgPT5cbiAgICAgICMgICBzaG93ICd0ZWxsIGNoYW5naW5nIGRhdGEnXG4gICAgICAjICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6Y2hhbmdlXG5cbiAgb25EYXRhTG9hZGVkOiAoZGF0YSkgLT5cblxuICBvbkNoYW5nZWQ6IChrZXksIGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgaWYgY2hhbmdlc1trZXldPyBhbmQgY2I/IHRoZW4gY2IgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuICBvbkNoYW5nZWRBbGw6ICgpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLG5hbWVzcGFjZSkgPT5cbiAgICAgIGhhc0NoYW5nZXMgPSBmYWxzZVxuICAgICAgZm9yIGMgb2YgY2hhbmdlcyB3aGVuIGNoYW5nZXNbY10ubmV3VmFsdWUgIT0gY2hhbmdlc1tjXS5vbGRWYWx1ZSBhbmQgYyBpc250J3NvY2tldElkcydcbiAgICAgICAgKGMpID0+IFxuICAgICAgICAgIEBkYXRhW2NdID0gY2hhbmdlc1tjXS5uZXdWYWx1ZSBcbiAgICAgICAgICBzaG93ICdkYXRhIGNoYW5nZWQ6ICdcbiAgICAgICAgICBzaG93IGNcbiAgICAgICAgICBzaG93IEBkYXRhW2NdXG5cbiAgICAgICAgICBoYXNDaGFuZ2VzID0gdHJ1ZVxuXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXMgaWYgaGFzQ2hhbmdlc1xuICAgICAgc2hvdyAnY2hhbmdlZCcgaWYgaGFzQ2hhbmdlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE3NDIwOTNcbm1vZHVsZS5leHBvcnRzID0gKCgpIC0+XG4gIG1ldGhvZHMgPSBbXG4gICAgJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJyxcbiAgICAnZXhjZXB0aW9uJywgJ2dyb3VwJywgJ2dyb3VwQ29sbGFwc2VkJywgJ2dyb3VwRW5kJywgJ2luZm8nLCAnbG9nJyxcbiAgICAnbWFya1RpbWVsaW5lJywgJ3Byb2ZpbGUnLCAncHJvZmlsZUVuZCcsICd0YWJsZScsICd0aW1lJywgJ3RpbWVFbmQnLFxuICAgICd0aW1lU3RhbXAnLCAndHJhY2UnLCAnd2FybiddXG4gIG5vb3AgPSAoKSAtPlxuICAgICMgc3R1YiB1bmRlZmluZWQgbWV0aG9kcy5cbiAgICBmb3IgbSBpbiBtZXRob2RzICB3aGVuICAhY29uc29sZVttXVxuICAgICAgY29uc29sZVttXSA9IG5vb3BcblxuICBpZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZD9cbiAgICB3aW5kb3cuc2hvdyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUpXG4gIGVsc2VcbiAgICB3aW5kb3cuc2hvdyA9ICgpIC0+XG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKVxuKSgpXG4iXX0=
