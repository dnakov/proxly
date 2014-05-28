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
    var port, prop;
    Application.__super__.constructor.apply(this, arguments);
    if (this.MSG == null) {
      this.MSG = MSG.get();
    }
    if (this.LISTEN == null) {
      this.LISTEN = LISTEN.get();
    }
    chrome.runtime.onConnectExternal.addListener((function(_this) {
      return function(port) {
        if (port.sender.id !== _this.EXT_ID) {
          return false;
        }
        _this.MSG.setPort(port);
        return _this.LISTEN.setPort(port);
      };
    })(this));
    port = chrome.runtime.connect(this.EXT_ID);
    this.MSG.setPort(port);
    this.LISTEN.setPort(port);
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
          if (results == null) {
            return typeof cb === "function" ? cb(null, _this.data.currentResources) : void 0;
          }
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
    var dir, filePath, justThePath, _dirs, _i, _len, _ref;
    filePath = info.uri;
    justThePath = filePath.match(/^([^#?\s]+)?(.*?)?(#[\w\-]+)?$/);
    if (justThePath != null) {
      filePath = justThePath[1];
    }
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
            _this.Notify("Server Error", "Error Starting Server: " + err);
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
        return dive = function(dir, results) {
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

  FileSystem.prototype.platform = '';

  function FileSystem() {
    this.getLocalFileEntry = __bind(this.getLocalFileEntry, this);
    chrome.runtime.getPlatformInfo((function(_this) {
      return function(info) {
        return _this.platform = info;
      };
    })(this));
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
    this.local.api.addListener(this._onMessage);
    if ((_ref = this.external.api) != null) {
      _ref.addListener(this._onMessageExternal);
    }
  }

  LISTEN.get = function() {
    return instance != null ? instance : instance = new LISTEN;
  };

  LISTEN.prototype.setPort = function(port) {
    this.port = port;
    return port.onMessage.addListener(this._onMessageExternal);
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
    if (sender.id != null) {
      if (sender.id !== this.EXT_ID) {
        return false;
      }
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
  }

  MSG.get = function() {
    return instance != null ? instance : instance = new MSG;
  };

  MSG.createPort = function() {};

  MSG.prototype.setPort = function(port) {
    return this.port = port;
  };

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
      return show('error');
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
  var debug, methods, noop;
  debug = true;
  if (!debug) {
    return (window.show = function() {});
  }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvYXBwL3NyYy9iYWNrZ3JvdW5kLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9jb21tb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L2NvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L25vZGVfbW9kdWxlcy93YXRjaGpzL3NyYy93YXRjaC5qcyIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9ub3RpZmljYXRpb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3NlcnZlci5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvc3RvcmFnZS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNFQSxJQUFBLGlFQUFBOztBQUFBLFNBQUEsR0FBWSxTQUFBLEdBQUE7QUFD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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QVZQLENBQUE7QUFnQkEsRUFBQSxJQUFHLCtCQUFIO1dBQ0UsTUFBTSxDQUFDLElBQVAsR0FBYyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUF4QixDQUE2QixPQUFPLENBQUMsR0FBckMsRUFBMEMsT0FBMUMsRUFEaEI7R0FBQSxNQUFBO1dBR0UsTUFBTSxDQUFDLElBQVAsR0FBYyxTQUFBLEdBQUE7YUFDWixRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUF6QixDQUE4QixPQUFPLENBQUMsR0FBdEMsRUFBMkMsT0FBM0MsRUFBb0QsU0FBcEQsRUFEWTtJQUFBLEVBSGhCO0dBbEJnQjtBQUFBLENBQUQsQ0FBQSxDQUFBLENBQWpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMgc2VydmVyID0gcmVxdWlyZSAnLi90Y3Atc2VydmVyLmpzJ1xuXG5nZXRHbG9iYWwgPSAtPlxuICBfZ2V0R2xvYmFsID0gLT5cbiAgICB0aGlzXG5cbiAgX2dldEdsb2JhbCgpXG5cbnJvb3QgPSBnZXRHbG9iYWwoKVxuXG5BcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5cbmNocm9tZS5hcHAucnVudGltZS5vbkxhdW5jaGVkLmFkZExpc3RlbmVyIC0+XG4gIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSAnaW5kZXguaHRtbCcsXG4gICAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgICBib3VuZHM6XG4gICAgICAgICAgd2lkdGg6NzcwXG4gICAgICAgICAgaGVpZ2h0OjgwMFxuXG5cblxuXG4jIENvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy5jb2ZmZWUnXG4jIE1TRyA9IHJlcXVpcmUgJy4uLy4uL21zZy5jb2ZmZWUnXG4jIExJU1RFTiA9IHJlcXVpcmUgJy4uLy4uL2xpc3Rlbi5jb2ZmZWUnXG4jIFN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbiMgRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4uLy4uL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnLmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuLi8uLi9maWxlc3lzdGVtLmNvZmZlZSdcblNlcnZlciA9IHJlcXVpcmUgJy4uLy4uL3NlcnZlci5jb2ZmZWUnXG5cblxucm9vdC5hcHAgPSBuZXcgQXBwbGljYXRpb24gXG4gIFN0b3JhZ2U6IG5ldyBTdG9yYWdlXG4gIEZTOiBuZXcgRmlsZVN5c3RlbVxuICBTZXJ2ZXI6IG5ldyBTZXJ2ZXJcblxucm9vdC5hcHAuU2VydmVyLmdldExvY2FsRmlsZSA9IGFwcC5nZXRMb2NhbEZpbGVcbiMgcm9vdC5hcHAuU3RvcmFnZS5kYXRhLnNlcnZlciA9IHN0YXR1czpyb290LmFwcC5TZXJ2ZXIuc3RhdHVzXG5cbmNocm9tZS5ydW50aW1lLm9uU3VzcGVuZC5hZGRMaXN0ZW5lciAtPlxuICByb290LmFwcC5TdG9yYWdlLnNhdmVBbGwobnVsbClcblxuI3Jvb3QuYXBwLlN0b3JhZ2UucmV0cmlldmVBbGwoKVxuIiwicmVxdWlyZSAnLi91dGlsLmNvZmZlZSdcbkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcbkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuL3N0b3JhZ2UuY29mZmVlJ1xuRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4vZmlsZXN5c3RlbS5jb2ZmZWUnXG5Ob3RpZmljYXRpb24gPSByZXF1aXJlICcuL25vdGlmaWNhdGlvbi5jb2ZmZWUnXG5TZXJ2ZXIgPSByZXF1aXJlICcuL3NlcnZlci5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwbGljYXRpb24gZXh0ZW5kcyBDb25maWdcbiAgTElTVEVOOiBudWxsXG4gIE1TRzogbnVsbFxuICBTdG9yYWdlOiBudWxsXG4gIEZTOiBudWxsXG4gIFNlcnZlcjogbnVsbFxuICBOb3RpZnk6IG51bGxcbiAgcGxhdGZvcm06bnVsbFxuICBjdXJyZW50VGFiSWQ6bnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoZGVwcykgLT5cbiAgICBzdXBlclxuXG4gICAgQE1TRyA/PSBNU0cuZ2V0KClcbiAgICBATElTVEVOID89IExJU1RFTi5nZXQoKVxuICAgIFxuICAgIGNocm9tZS5ydW50aW1lLm9uQ29ubmVjdEV4dGVybmFsLmFkZExpc3RlbmVyIChwb3J0KSA9PlxuICAgICAgaWYgcG9ydC5zZW5kZXIuaWQgaXNudCBARVhUX0lEXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICBATVNHLnNldFBvcnQgcG9ydFxuICAgICAgQExJU1RFTi5zZXRQb3J0IHBvcnRcbiAgICBcbiAgICBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuICAgIEBNU0cuc2V0UG9ydCBwb3J0XG4gICAgQExJU1RFTi5zZXRQb3J0IHBvcnRcbiAgICBcbiAgICBmb3IgcHJvcCBvZiBkZXBzXG4gICAgICBpZiB0eXBlb2YgZGVwc1twcm9wXSBpcyBcIm9iamVjdFwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpJbmJvdW5kIGRlcHNbcHJvcF1cbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwiZnVuY3Rpb25cIiBcbiAgICAgICAgQFtwcm9wXSA9IEB3cmFwT2JqT3V0Ym91bmQgbmV3IGRlcHNbcHJvcF1cblxuICAgIEBTdG9yYWdlLm9uRGF0YUxvYWRlZCA9IChkYXRhKSA9PlxuICAgICAgIyBAZGF0YSA9IGRhdGFcbiAgICAgICMgZGVsZXRlIEBTdG9yYWdlLmRhdGEuc2VydmVyXG4gICAgICAjIEBTdG9yYWdlLmRhdGEuc2VydmVyID0ge31cbiAgICAgICMgZGVsZXRlIEBTdG9yYWdlLmRhdGEuc2VydmVyLnN0YXR1c1xuXG4gICAgICBpZiBub3QgQFN0b3JhZ2UuZGF0YS5maXJzdFRpbWU/XG4gICAgICAgIEBTdG9yYWdlLmRhdGEuZmlyc3RUaW1lID0gZmFsc2VcbiAgICAgICAgQFN0b3JhZ2UuZGF0YS5tYXBzLnB1c2hcbiAgICAgICAgICBuYW1lOidTYWxlc2ZvcmNlJ1xuICAgICAgICAgIHVybDonaHR0cHMuKlxcL3Jlc291cmNlKFxcL1swLTldKyk/XFwvKFtBLVphLXowLTlcXC0uX10rXFwvKT8nXG4gICAgICAgICAgcmVnZXhSZXBsOicnXG4gICAgICAgICAgaXNSZWRpcmVjdDp0cnVlXG4gICAgICAgICAgaXNPbjpmYWxzZVxuXG5cbiAgICAgICMgaWYgQFJlZGlyZWN0PyB0aGVuIEBSZWRpcmVjdC5kYXRhID0gQGRhdGEudGFiTWFwc1xuXG4gICAgQE5vdGlmeSA/PSAobmV3IE5vdGlmaWNhdGlvbikuc2hvdyBcbiAgICAjIEBTdG9yYWdlID89IEB3cmFwT2JqT3V0Ym91bmQgbmV3IFN0b3JhZ2UgQGRhdGFcbiAgICAjIEBGUyA9IG5ldyBGaWxlU3lzdGVtIFxuICAgICMgQFNlcnZlciA/PSBAd3JhcE9iak91dGJvdW5kIG5ldyBTZXJ2ZXJcbiAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcbiAgICBcbiAgICBAd3JhcCA9IGlmIEBTRUxGX1RZUEUgaXMgJ0FQUCcgdGhlbiBAd3JhcEluYm91bmQgZWxzZSBAd3JhcE91dGJvdW5kXG5cbiAgICBAb3BlbkFwcCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5vcGVuQXBwJywgQG9wZW5BcHBcbiAgICBAbGF1bmNoQXBwID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmxhdW5jaEFwcCcsIEBsYXVuY2hBcHBcbiAgICBAc3RhcnRTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uc3RhcnRTZXJ2ZXInLCBAc3RhcnRTZXJ2ZXJcbiAgICBAcmVzdGFydFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5yZXN0YXJ0U2VydmVyJywgQHJlc3RhcnRTZXJ2ZXJcbiAgICBAc3RvcFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5zdG9wU2VydmVyJywgQHN0b3BTZXJ2ZXJcbiAgICBAZ2V0RmlsZU1hdGNoID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldEZpbGVNYXRjaCcsIEBnZXRGaWxlTWF0Y2hcblxuICAgIEB3cmFwID0gaWYgQFNFTEZfVFlQRSBpcyAnRVhURU5TSU9OJyB0aGVuIEB3cmFwSW5ib3VuZCBlbHNlIEB3cmFwT3V0Ym91bmRcblxuICAgIEBnZXRSZXNvdXJjZXMgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0UmVzb3VyY2VzJywgQGdldFJlc291cmNlc1xuICAgIEBnZXRDdXJyZW50VGFiID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldEN1cnJlbnRUYWInLCBAZ2V0Q3VycmVudFRhYlxuXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpIC0+XG4gICAgICBAU3RvcmFnZS5zZXNzaW9uLnNlcnZlciA9IHt9XG4gICAgICBAU3RvcmFnZS5zZXNzaW9uLnNlcnZlci5zdGF0dXMgPSBAU2VydmVyLnN0YXR1c1xuICAgICMgQFN0b3JhZ2UucmV0cmlldmVBbGwoKSBpZiBAU3RvcmFnZT9cblxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgbGF1bmNoQXBwOiAoY2IsIGVycm9yKSAtPlxuICAgICMgbmVlZHMgbWFuYWdlbWVudCBwZXJtaXNzaW9uLiBvZmYgZm9yIG5vdy5cbiAgICBjaHJvbWUubWFuYWdlbWVudC5sYXVuY2hBcHAgQEFQUF9JRCwgKGV4dEluZm8pID0+XG4gICAgICBpZiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgZXJyb3IgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBleHRJbmZvXG5cbiAgb3BlbkFwcDogKCkgPT5cbiAgICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsXG4gICAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgICBib3VuZHM6XG4gICAgICAgICAgd2lkdGg6NzcwXG4gICAgICAgICAgaGVpZ2h0OjgwMCxcbiAgICAgICh3aW4pID0+XG4gICAgICAgIEBhcHBXaW5kb3cgPSB3aW4pIFxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgZ2V0UmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldEN1cnJlbnRUYWIgKHRhYklkKSA9PlxuICAgICAgY2hyb21lLnRhYnMuZXhlY3V0ZVNjcmlwdCB0YWJJZCwgXG4gICAgICAgIGZpbGU6J3NjcmlwdHMvY29udGVudC5qcycsIChyZXN1bHRzKSA9PlxuICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMubGVuZ3RoID0gMFxuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiBjYj8obnVsbCwgQGRhdGEuY3VycmVudFJlc291cmNlcykgaWYgbm90IHJlc3VsdHM/XG5cbiAgICAgICAgICBmb3IgciBpbiByZXN1bHRzXG4gICAgICAgICAgICBmb3IgcmVzIGluIHJcbiAgICAgICAgICAgICAgQGRhdGEuY3VycmVudFJlc291cmNlcy5wdXNoIHJlc1xuICAgICAgICAgIGNiPyBudWxsLCBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG5cblxuICBnZXRMb2NhbEZpbGU6IChpbmZvLCBjYikgPT5cbiAgICBmaWxlUGF0aCA9IGluZm8udXJpXG4gICAganVzdFRoZVBhdGggPSBmaWxlUGF0aC5tYXRjaCgvXihbXiM/XFxzXSspPyguKj8pPygjW1xcd1xcLV0rKT8kLylcbiAgICBmaWxlUGF0aCA9IGp1c3RUaGVQYXRoWzFdIGlmIGp1c3RUaGVQYXRoP1xuICAgICMgZmlsZVBhdGggPSBAZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdCB1cmxcbiAgICByZXR1cm4gY2IgJ2ZpbGUgbm90IGZvdW5kJyB1bmxlc3MgZmlsZVBhdGg/XG4gICAgX2RpcnMgPSBbXVxuICAgIF9kaXJzLnB1c2ggZGlyIGZvciBkaXIgaW4gQGRhdGEuZGlyZWN0b3JpZXMgd2hlbiBkaXIuaXNPblxuICAgIGZpbGVQYXRoID0gZmlsZVBhdGguc3Vic3RyaW5nIDEgaWYgZmlsZVBhdGguc3Vic3RyaW5nKDAsMSkgaXMgJy8nXG4gICAgQGZpbmRGaWxlRm9yUGF0aCBfZGlycywgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyKSA9PlxuICAgICAgaWYgZXJyPyB0aGVuIHJldHVybiBjYj8gZXJyXG4gICAgICBmaWxlRW50cnkuZmlsZSAoZmlsZSkgPT5cbiAgICAgICAgY2I/IG51bGwsZmlsZUVudHJ5LGZpbGVcbiAgICAgICwoZXJyKSA9PiBjYj8gZXJyXG5cblxuICBzdGFydFNlcnZlcjogKGNiKSAtPlxuICAgIGlmIEBTZXJ2ZXIuc3RhdHVzLmlzT24gaXMgZmFsc2VcbiAgICAgIEBTZXJ2ZXIuc3RhcnQgbnVsbCxudWxsLG51bGwsIChlcnIsIHNvY2tldEluZm8pID0+XG4gICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBFcnJvclwiLFwiRXJyb3IgU3RhcnRpbmcgU2VydmVyOiAjeyBlcnIgfVwiXG4gICAgICAgICAgICBjYj8gZXJyXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBTdGFydGVkXCIsIFwiU3RhcnRlZCBTZXJ2ZXIgI3sgQFNlcnZlci5zdGF0dXMudXJsIH1cIlxuICAgICAgICAgICAgY2I/IG51bGwsIEBTZXJ2ZXIuc3RhdHVzXG4gICAgZWxzZVxuICAgICAgY2I/ICdhbHJlYWR5IHN0YXJ0ZWQnXG5cbiAgc3RvcFNlcnZlcjogKGNiKSAtPlxuICAgICAgQFNlcnZlci5zdG9wIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICAgIGlmIGVycj9cbiAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIEVycm9yXCIsXCJTZXJ2ZXIgY291bGQgbm90IGJlIHN0b3BwZWQ6ICN7IGVycm9yIH1cIlxuICAgICAgICAgIGNiPyBlcnJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBOb3RpZnkgJ1NlcnZlciBTdG9wcGVkJywgXCJTZXJ2ZXIgU3RvcHBlZFwiXG4gICAgICAgICAgY2I/IG51bGwsIEBTZXJ2ZXIuc3RhdHVzXG5cbiAgcmVzdGFydFNlcnZlcjogLT5cbiAgICBAc3RhcnRTZXJ2ZXIoKVxuXG4gIGNoYW5nZVBvcnQ6ID0+XG4gIGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3Q6ICh1cmwpIC0+XG4gICAgZmlsZVBhdGhSZWdleCA9IC9eKChodHRwW3NdP3xmdHB8Y2hyb21lLWV4dGVuc2lvbnxmaWxlKTpcXC9cXC8pP1xcLz8oW15cXC9cXC5dK1xcLikqPyhbXlxcL1xcLl0rXFwuW146XFwvXFxzXFwuXXsyLDN9KFxcLlteOlxcL1xcc1xcLl3igIzigIt7MiwzfSk/KSg6XFxkKyk/KCR8XFwvKShbXiM/XFxzXSspPyguKj8pPygjW1xcd1xcLV0rKT8kL1xuICAgXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIEBkYXRhW0BjdXJyZW50VGFiSWRdPy5tYXBzP1xuXG4gICAgcmVzUGF0aCA9IHVybC5tYXRjaChmaWxlUGF0aFJlZ2V4KT9bOF1cbiAgICBpZiBub3QgcmVzUGF0aD9cbiAgICAgICMgdHJ5IHJlbHBhdGhcbiAgICAgIHJlc1BhdGggPSB1cmxcblxuICAgIHJldHVybiBudWxsIHVubGVzcyByZXNQYXRoP1xuICAgIFxuICAgIGZvciBtYXAgaW4gQGRhdGFbQGN1cnJlbnRUYWJJZF0ubWFwc1xuICAgICAgcmVzUGF0aCA9IHVybC5tYXRjaChuZXcgUmVnRXhwKG1hcC51cmwpKT8gYW5kIG1hcC51cmw/XG5cbiAgICAgIGlmIHJlc1BhdGhcbiAgICAgICAgaWYgcmVmZXJlcj9cbiAgICAgICAgICAjIFRPRE86IHRoaXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXAudXJsKSwgbWFwLnJlZ2V4UmVwbFxuICAgICAgICBicmVha1xuICAgIHJldHVybiBmaWxlUGF0aFxuXG4gIFVSTHRvTG9jYWxQYXRoOiAodXJsLCBjYikgLT5cbiAgICBmaWxlUGF0aCA9IEBSZWRpcmVjdC5nZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0IHVybFxuXG4gIGdldEZpbGVNYXRjaDogKGZpbGVQYXRoLCBjYikgLT5cbiAgICByZXR1cm4gY2I/ICdmaWxlIG5vdCBmb3VuZCcgdW5sZXNzIGZpbGVQYXRoP1xuICAgIHNob3cgJ3RyeWluZyAnICsgZmlsZVBhdGhcbiAgICBAZmluZEZpbGVGb3JQYXRoIEBkYXRhLmRpcmVjdG9yaWVzLCBmaWxlUGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXJlY3RvcnkpID0+XG5cbiAgICAgIGlmIGVycj8gXG4gICAgICAgICMgc2hvdyAnbm8gZmlsZXMgZm91bmQgZm9yICcgKyBmaWxlUGF0aFxuICAgICAgICByZXR1cm4gY2I/IGVyclxuXG4gICAgICBkZWxldGUgZmlsZUVudHJ5LmVudHJ5XG4gICAgICBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdID0gXG4gICAgICAgIGZpbGVFbnRyeTogY2hyb21lLmZpbGVTeXN0ZW0ucmV0YWluRW50cnkgZmlsZUVudHJ5XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aFxuICAgICAgICBkaXJlY3Rvcnk6IGRpcmVjdG9yeVxuICAgICAgY2I/IG51bGwsIEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlc1tmaWxlUGF0aF0sIGRpcmVjdG9yeVxuICAgICAgXG5cblxuICBmaW5kRmlsZUluRGlyZWN0b3JpZXM6IChkaXJlY3RvcmllcywgcGF0aCwgY2IpIC0+XG4gICAgbXlEaXJzID0gZGlyZWN0b3JpZXMuc2xpY2UoKSBcbiAgICBfcGF0aCA9IHBhdGhcbiAgICBfZGlyID0gbXlEaXJzLnNoaWZ0KClcblxuICAgIEBGUy5nZXRMb2NhbEZpbGVFbnRyeSBfZGlyLCBfcGF0aCwgKGVyciwgZmlsZUVudHJ5KSA9PlxuICAgICAgaWYgZXJyP1xuICAgICAgICBpZiBteURpcnMubGVuZ3RoID4gMFxuICAgICAgICAgIEBmaW5kRmlsZUluRGlyZWN0b3JpZXMgbXlEaXJzLCBfcGF0aCwgY2JcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNiPyAnbm90IGZvdW5kJ1xuICAgICAgZWxzZVxuICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBfZGlyXG5cbiAgZmluZEZpbGVGb3JQYXRoOiAoZGlycywgcGF0aCwgY2IpIC0+XG4gICAgQGZpbmRGaWxlSW5EaXJlY3RvcmllcyBkaXJzLCBwYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcmVjdG9yeSkgPT5cbiAgICAgIGlmIGVycj9cbiAgICAgICAgaWYgcGF0aCBpcyBwYXRoLnJlcGxhY2UoLy4qP1xcLy8sICcnKVxuICAgICAgICAgIGNiPyAnbm90IGZvdW5kJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQGZpbmRGaWxlRm9yUGF0aCBkaXJzLCBwYXRoLnJlcGxhY2UoLy4qP1xcLy8sICcnKSwgY2JcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZGlyZWN0b3J5XG4gIFxuICBtYXBBbGxSZXNvdXJjZXM6IChjYikgLT5cbiAgICBAZ2V0UmVzb3VyY2VzID0+XG4gICAgICBuZWVkID0gQGRhdGEuY3VycmVudFJlc291cmNlcy5sZW5ndGhcbiAgICAgIGZvdW5kID0gbm90Rm91bmQgPSAwXG4gICAgICBmb3IgaXRlbSBpbiBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG4gICAgICAgIGxvY2FsUGF0aCA9IEBVUkx0b0xvY2FsUGF0aCBpdGVtLnVybFxuICAgICAgICBpZiBsb2NhbFBhdGg/XG4gICAgICAgICAgQGdldEZpbGVNYXRjaCBsb2NhbFBhdGgsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICAgICAgICBuZWVkLS1cbiAgICAgICAgICAgIHNob3cgYXJndW1lbnRzXG4gICAgICAgICAgICBpZiBlcnI/IHRoZW4gbm90Rm91bmQrK1xuICAgICAgICAgICAgZWxzZSBmb3VuZCsrICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIGlmIG5lZWQgaXMgMFxuICAgICAgICAgICAgICBpZiBmb3VuZCA+IDBcbiAgICAgICAgICAgICAgICBjYj8gbnVsbCwgJ2RvbmUnXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjYj8gJ25vdGhpbmcgZm91bmQnXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIG5lZWQtLVxuICAgICAgICAgIG5vdEZvdW5kKytcbiAgICAgICAgICBpZiBuZWVkIGlzIDBcbiAgICAgICAgICAgIGNiPyAnbm90aGluZyBmb3VuZCdcblxuICBzZXRCYWRnZVRleHQ6ICh0ZXh0LCB0YWJJZCkgLT5cbiAgICBiYWRnZVRleHQgPSB0ZXh0IHx8ICcnICsgT2JqZWN0LmtleXMoQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzKS5sZW5ndGhcbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQgXG4gICAgICB0ZXh0OmJhZGdlVGV4dFxuICAgICAgIyB0YWJJZDp0YWJJZFxuICBcbiAgcmVtb3ZlQmFkZ2VUZXh0Oih0YWJJZCkgLT5cbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQgXG4gICAgICB0ZXh0OicnXG4gICAgICAjIHRhYklkOnRhYklkXG5cbiAgbHNSOiAoZGlyLCBvbnN1Y2Nlc3MsIG9uZXJyb3IpIC0+XG4gICAgQHJlc3VsdHMgPSB7fVxuXG4gICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICBcbiAgICAgIHRvZG8gPSAwXG4gICAgICBpZ25vcmUgPSAvLmdpdHwuaWRlYXxub2RlX21vZHVsZXN8Ym93ZXJfY29tcG9uZW50cy9cbiAgICAgIGRpdmUgPSAoZGlyLCByZXN1bHRzKSAtPlxuICAgICAgICB0b2RvKytcbiAgICAgICAgcmVhZGVyID0gZGlyLmNyZWF0ZVJlYWRlcigpXG4gICAgICAgIHJlYWRlci5yZWFkRW50cmllcyAoZW50cmllcykgLT5cbiAgICAgICAgICB0b2RvLS1cbiAgICAgICAgICBmb3IgZW50cnkgaW4gZW50cmllc1xuICAgICAgICAgICAgZG8gKGVudHJ5KSAtPlxuICAgICAgICAgICAgICByZXN1bHRzW2VudHJ5LmZ1bGxQYXRoXSA9IGVudHJ5XG4gICAgICAgICAgICAgIGlmIGVudHJ5LmZ1bGxQYXRoLm1hdGNoKGlnbm9yZSkgaXMgbnVsbFxuICAgICAgICAgICAgICAgIGlmIGVudHJ5LmlzRGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICB0b2RvKytcbiAgICAgICAgICAgICAgICAgIGRpdmUgZW50cnksIHJlc3VsdHMgXG4gICAgICAgICAgICAgICMgc2hvdyBlbnRyeVxuICAgICAgICAgIHNob3cgJ29uc3VjY2VzcycgaWYgdG9kbyBpcyAwXG4gICAgICAgICAgIyBzaG93ICdvbnN1Y2Nlc3MnIHJlc3VsdHMgaWYgdG9kbyBpcyAwXG4gICAgICAgICwoZXJyb3IpIC0+XG4gICAgICAgICAgdG9kby0tXG4gICAgICAgICAgIyBzaG93IGVycm9yXG4gICAgICAgICAgIyBvbmVycm9yIGVycm9yLCByZXN1bHRzIGlmIHRvZG8gaXMgMCBcblxuICAgICAgIyBjb25zb2xlLmxvZyBkaXZlIGRpckVudHJ5LCBAcmVzdWx0cyAgXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvblxuXG5cbiIsImNsYXNzIENvbmZpZ1xuICAjIEFQUF9JRDogJ2NlY2lmYWZwaGVnaG9mcGZka2hla2tpYmNpYmhnZmVjJ1xuICAjIEVYVEVOU0lPTl9JRDogJ2RkZGltYm5qaWJqY2FmYm9rbmJnaGVoYmZhamdnZ2VwJ1xuICBBUFBfSUQ6ICdkZW5lZmRvb2Zua2dqbXBiZnBrbmlocGdkaGFocGJsaCdcbiAgRVhURU5TSU9OX0lEOiAnaWpjam1wZWpvbm1pbW9vZmJjcGFsaWVqaGlrYWVvbWgnICBcbiAgU0VMRl9JRDogY2hyb21lLnJ1bnRpbWUuaWRcbiAgaXNDb250ZW50U2NyaXB0OiBsb2NhdGlvbi5wcm90b2NvbCBpc250ICdjaHJvbWUtZXh0ZW5zaW9uOidcbiAgRVhUX0lEOiBudWxsXG4gIEVYVF9UWVBFOiBudWxsXG4gIFxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBARVhUX0lEID0gaWYgQEFQUF9JRCBpcyBAU0VMRl9JRCB0aGVuIEBFWFRFTlNJT05fSUQgZWxzZSBAQVBQX0lEXG4gICAgQEVYVF9UWVBFID0gaWYgQEFQUF9JRCBpcyBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcbiAgICBAU0VMRl9UWVBFID0gaWYgQEFQUF9JRCBpc250IEBTRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuXG4gIHdyYXBJbmJvdW5kOiAob2JqLCBmbmFtZSwgZikgLT5cbiAgICAgIF9rbGFzID0gb2JqXG4gICAgICBATElTVEVOLkV4dCBmbmFtZSwgKGFyZ3MpIC0+XG4gICAgICAgIGlmIGFyZ3M/LmlzUHJveHk/XG4gICAgICAgICAgaWYgdHlwZW9mIGFyZ3VtZW50c1sxXSBpcyBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgIGlmIGFyZ3MuYXJndW1lbnRzPy5sZW5ndGggPj0gMFxuICAgICAgICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgYXJncy5hcmd1bWVudHMuY29uY2F0IGFyZ3VtZW50c1sxXSBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIFtdLmNvbmNhdCBhcmd1bWVudHNbMV1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBhcmd1bWVudHNcblxuICB3cmFwT2JqSW5ib3VuZDogKG9iaikgLT5cbiAgICAob2JqW2tleV0gPSBAd3JhcEluYm91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG4gIHdyYXBPdXRib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgLT5cbiAgICAgIG1zZyA9IHt9XG4gICAgICBtc2dbZm5hbWVdID0gXG4gICAgICAgIGlzUHJveHk6dHJ1ZVxuICAgICAgICBhcmd1bWVudHM6QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG4gICAgICBtc2dbZm5hbWVdLmlzUHJveHkgPSB0cnVlXG4gICAgICBfYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuXG4gICAgICBpZiBfYXJncy5sZW5ndGggaXMgMFxuICAgICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cyA9IHVuZGVmaW5lZCBcbiAgICAgICAgcmV0dXJuIEBNU0cuRXh0IG1zZywgKCkgLT4gdW5kZWZpbmVkXG5cbiAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzID0gX2FyZ3NcblxuICAgICAgY2FsbGJhY2sgPSBtc2dbZm5hbWVdLmFyZ3VtZW50cy5wb3AoKVxuICAgICAgaWYgdHlwZW9mIGNhbGxiYWNrIGlzbnQgXCJmdW5jdGlvblwiXG4gICAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzLnB1c2ggY2FsbGJhY2tcbiAgICAgICAgQE1TRy5FeHQgbXNnLCAoKSAtPiB1bmRlZmluZWRcbiAgICAgIGVsc2VcbiAgICAgICAgQE1TRy5FeHQgbXNnLCAoKSA9PlxuICAgICAgICAgIGFyZ3ogPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcbiAgICAgICAgICAjIHByb3h5QXJncyA9IFtpc1Byb3h5OmFyZ3pdXG4gICAgICAgICAgaWYgYXJnej8ubGVuZ3RoID4gMCBhbmQgYXJnelswXT8uaXNQcm94eT9cbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5IEAsIGFyZ3pbMF0uaXNQcm94eSBcblxuICB3cmFwT2JqT3V0Ym91bmQ6IChvYmopIC0+XG4gICAgKG9ialtrZXldID0gQHdyYXBPdXRib3VuZCBvYmosIG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsga2V5LCBvYmpba2V5XSkgZm9yIGtleSBvZiBvYmogd2hlbiB0eXBlb2Ygb2JqW2tleV0gaXMgXCJmdW5jdGlvblwiXG4gICAgb2JqXG5cbm1vZHVsZS5leHBvcnRzID0gQ29uZmlnIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuXG5jbGFzcyBGaWxlU3lzdGVtXG4gIGFwaTogY2hyb21lLmZpbGVTeXN0ZW1cbiAgcmV0YWluZWREaXJzOiB7fVxuICBMSVNURU46IExJU1RFTi5nZXQoKSBcbiAgTVNHOiBNU0cuZ2V0KClcbiAgcGxhdGZvcm06JydcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgY2hyb21lLnJ1bnRpbWUuZ2V0UGxhdGZvcm1JbmZvIChpbmZvKSA9PlxuICAgICAgQHBsYXRmb3JtID0gaW5mb1xuICAjIEBkaXJzOiBuZXcgRGlyZWN0b3J5U3RvcmVcbiAgIyBmaWxlVG9BcnJheUJ1ZmZlcjogKGJsb2IsIG9ubG9hZCwgb25lcnJvcikgLT5cbiAgIyAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgIyAgIHJlYWRlci5vbmxvYWQgPSBvbmxvYWRcblxuICAjICAgcmVhZGVyLm9uZXJyb3IgPSBvbmVycm9yXG5cbiAgIyAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBibG9iXG5cbiAgcmVhZEZpbGU6IChkaXJFbnRyeSwgcGF0aCwgY2IpIC0+XG4gICAgIyBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXC8vZywnXFxcXCcpIGlmIHBsYXRmb3JtIGlzICd3aW4nXG4gICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgcGF0aCxcbiAgICAgIChlcnIsIGZpbGVFbnRyeSkgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gY2I/IGVyclxuXG4gICAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGZpbGVcbiAgICAgICAgLChlcnIpID0+IGNiPyBlcnJcblxuICBnZXRGaWxlRW50cnk6IChkaXJFbnRyeSwgcGF0aCwgY2IpIC0+XG4gICAgIyBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXC8vZywnXFxcXCcpIGlmIHBsYXRmb3JtIGlzICd3aW4nXG4gICAgZGlyRW50cnkuZ2V0RmlsZSBwYXRoLCB7fSwgKGZpbGVFbnRyeSkgPT5cbiAgICAgIGNiPyBudWxsLCBmaWxlRW50cnlcbiAgICAsKGVycikgPT4gY2I/IGVyclxuXG4gICMgb3BlbkRpcmVjdG9yeTogKGNhbGxiYWNrKSAtPlxuICBvcGVuRGlyZWN0b3J5OiAoZGlyZWN0b3J5RW50cnksIGNiKSAtPlxuICAjIEBhcGkuY2hvb3NlRW50cnkgdHlwZTonb3BlbkRpcmVjdG9yeScsIChkaXJlY3RvcnlFbnRyeSwgZmlsZXMpID0+XG4gICAgQGFwaS5nZXREaXNwbGF5UGF0aCBkaXJlY3RvcnlFbnRyeSwgKHBhdGhOYW1lKSA9PlxuICAgICAgZGlyID1cbiAgICAgICAgICByZWxQYXRoOiBkaXJlY3RvcnlFbnRyeS5mdWxsUGF0aCAjLnJlcGxhY2UoJy8nICsgZGlyZWN0b3J5RW50cnkubmFtZSwgJycpXG4gICAgICAgICAgZGlyZWN0b3J5RW50cnlJZDogQGFwaS5yZXRhaW5FbnRyeShkaXJlY3RvcnlFbnRyeSlcbiAgICAgICAgICBlbnRyeTogZGlyZWN0b3J5RW50cnlcbiAgICAgIGNiPyBudWxsLCBwYXRoTmFtZSwgZGlyXG4gICAgICAgICAgIyBAZ2V0T25lRGlyTGlzdCBkaXJcbiAgICAgICAgICAjIFN0b3JhZ2Uuc2F2ZSAnZGlyZWN0b3JpZXMnLCBAc2NvcGUuZGlyZWN0b3JpZXMgKHJlc3VsdCkgLT5cblxuICBnZXRMb2NhbEZpbGVFbnRyeTogKGRpciwgZmlsZVBhdGgsIGNiKSA9PiBcbiAgICAjIGZpbGVQYXRoID0gZmlsZVBhdGgucmVwbGFjZSgvXFwvL2csJ1xcXFwnKSBpZiBwbGF0Zm9ybSBpcyAnd2luJ1xuICAgIGRpckVudHJ5ID0gY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoKSAtPlxuICAgIGlmIG5vdCBkaXJFbnRyeT9cbiAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBmaWxlUGF0aCwgY2JcbiAgICBlbHNlXG4gICAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBmaWxlUGF0aCwgY2JcblxuXG5cbiAgIyBnZXRMb2NhbEZpbGU6IChkaXIsIGZpbGVQYXRoLCBjYiwgZXJyb3IpID0+IFxuICAjICMgaWYgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0/XG4gICMgIyAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiAgIyAjICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAjICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICMgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICMgICAgICwoX2Vycm9yKSA9PiBlcnJvcihfZXJyb3IpXG4gICMgIyBlbHNlXG4gICMgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgIyAgICAgIyBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICMgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICBpZiBlcnI/IHRoZW4gY2I/IGVyclxuICAjICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGZpbGVcbiAgIyAgICwoX2Vycm9yKSA9PiBjYj8oX2Vycm9yKVxuXG4gICAgICAjIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBzdWNjZXNzLFxuICAgICAgIyAgICAgKGVycikgPT5cbiAgICAgICMgICAgICAgICBAZmluZEZpbGVGb3JQYXRoIGluZm8sIGNiXG5cbiAgIyBmaW5kRmlsZUZvclBhdGg6IChpbmZvLCBjYikgPT5cbiAgIyAgICAgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIGNiLCBpbmZvLnJlZmVyZXJcblxuICAjIGZpbmRGaWxlRm9yUXVlcnlTdHJpbmc6IChfdXJsLCBjYiwgZXJyb3IsIHJlZmVyZXIpID0+XG4gICMgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudChfdXJsKS5yZXBsYWNlIC8uKj9zbHJlZGlyXFw9LywgJydcblxuICAjICAgICBtYXRjaCA9IGl0ZW0gZm9yIGl0ZW0gaW4gQG1hcHMgd2hlbiB1cmwubWF0Y2gobmV3IFJlZ0V4cChpdGVtLnVybCkpPyBhbmQgaXRlbS51cmw/IGFuZCBub3QgbWF0Y2g/XG5cbiAgIyAgICAgaWYgbWF0Y2g/XG4gICMgICAgICAgICBpZiByZWZlcmVyP1xuICAjICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLm1hdGNoKC8uKlxcL1xcLy4qP1xcLyguKikvKT9bMV1cbiAgIyAgICAgICAgIGVsc2VcbiAgIyAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWF0Y2gudXJsKSwgbWF0Y2gucmVnZXhSZXBsXG5cbiAgIyAgICAgICAgIGZpbGVQYXRoLnJlcGxhY2UgJy8nLCAnXFxcXCcgaWYgcGxhdGZvcm0gaXMgJ3dpbidcblxuICAjICAgICAgICAgZGlyID0gQFN0b3JhZ2UuZGF0YS5kaXJlY3Rvcmllc1ttYXRjaC5kaXJlY3RvcnldXG5cbiAgIyAgICAgICAgIGlmIG5vdCBkaXI/IHRoZW4gcmV0dXJuIGVyciAnbm8gbWF0Y2gnXG5cbiAgIyAgICAgICAgIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAjICAgICAgICAgICAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiAgIyAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICAgICAgZWxzZVxuICAjICAgICAgICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAjICAgICAgICAgICAgICAgICBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICMgICAgICAgICAgICAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgICAgICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgICAgICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgZWxzZVxuICAjICAgICAgICAgZXJyb3IoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVTeXN0ZW0iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIExJU1RFTiBleHRlbmRzIENvbmZpZ1xuICBsb2NhbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZVxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgZXh0ZXJuYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbFxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgaW5zdGFuY2UgPSBudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG5cbiAgICBAbG9jYWwuYXBpLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlXG4gICAgQGV4dGVybmFsLmFwaT8uYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IExJU1RFTlxuXG4gIHNldFBvcnQ6IChwb3J0KSAtPlxuICAgIEBwb3J0ID0gcG9ydFxuICAgIHBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICBMb2NhbDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgIEBsb2NhbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIEV4dDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgICMgc2hvdyAnYWRkaW5nIGV4dCBsaXN0ZW5lciBmb3IgJyArIG1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBfb25NZXNzYWdlRXh0ZXJuYWw6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuXG4gICAgX3NlbmRSZXNwb25zZSA9ICh3aGF0ZXZlci4uLikgPT5cbiAgICAgIHRyeVxuICAgICAgICAjIHdoYXRldmVyLnNoaWZ0KCkgaWYgd2hhdGV2ZXJbMF0gaXMgbnVsbCBhbmQgd2hhdGV2ZXJbMV0/XG4gICAgICAgIHNlbmRSZXNwb25zZS5hcHBseSBudWxsLHByb3h5QXJncyA9IFtpc1Byb3h5OndoYXRldmVyXVxuXG4gICAgICBjYXRjaCBlXG4gICAgICAgIHVuZGVmaW5lZCAjIGVycm9yIGJlY2F1c2Ugbm8gcmVzcG9uc2Ugd2FzIHJlcXVlc3RlZCBmcm9tIHRoZSBNU0csIGRvbid0IGNhcmVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcbiAgICAgIFxuICAgICMgKHNob3cgXCI8PT0gR09UIEVYVEVSTkFMIE1FU1NBR0UgPT0gI3sgQEVYVF9UWVBFIH0gPT1cIiArIF9rZXkpIGZvciBfa2V5IG9mIHJlcXVlc3RcbiAgICBpZiBzZW5kZXIuaWQ/IFxuICAgICAgaWYgc2VuZGVyLmlkIGlzbnQgQEVYVF9JRCAjYW5kIHNlbmRlci5jb25zdHJ1Y3Rvci5uYW1lIGlzbnQgJ1BvcnQnXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG4gICAgXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCAjIGZvciBzeW5jaHJvbm91cyBzZW5kUmVzcG9uc2VcbiAgICAgICMgc2hvdyAncmV0dXJuaW5nIHRydWUnXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gIF9vbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuICAgIF9zZW5kUmVzcG9uc2UgPSA9PlxuICAgICAgdHJ5XG4gICAgICAgICMgc2hvdyAnY2FsbGluZyBzZW5kcmVzcG9uc2UnXG4gICAgICAgIHNlbmRSZXNwb25zZS5hcHBseSB0aGlzLGFyZ3VtZW50c1xuICAgICAgY2F0Y2ggZVxuICAgICAgICAjIHNob3cgZVxuICAgICAgcmVzcG9uc2VTdGF0dXMuY2FsbGVkID0gdHJ1ZVxuXG4gICAgIyAoc2hvdyBcIjw9PSBHT1QgTUVTU0FHRSA9PSAjeyBARVhUX1RZUEUgfSA9PVwiICsgX2tleSkgZm9yIF9rZXkgb2YgcmVxdWVzdFxuICAgIEBsb2NhbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBfc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZFxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gTElTVEVOIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBNU0cgZXh0ZW5kcyBDb25maWdcbiAgaW5zdGFuY2UgPSBudWxsXG4gIHBvcnQ6bnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IE1TR1xuXG4gIEBjcmVhdGVQb3J0OiAoKSAtPlxuXG4gIHNldFBvcnQ6IChwb3J0KSAtPlxuICAgIEBwb3J0ID0gcG9ydFxuXG4gIExvY2FsOiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICAoc2hvdyBcIj09IE1FU1NBR0UgI3sgX2tleSB9ID09PlwiKSBmb3IgX2tleSBvZiBtZXNzYWdlXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgbWVzc2FnZSwgcmVzcG9uZFxuICBFeHQ6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIChzaG93IFwiPT0gTUVTU0FHRSBFWFRFUk5BTCAjeyBfa2V5IH0gPT0+XCIpIGZvciBfa2V5IG9mIG1lc3NhZ2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBARVhUX0lELCBtZXNzYWdlLCByZXNwb25kXG4gIEV4dFBvcnQ6IChtZXNzYWdlKSAtPlxuICAgIHRyeVxuICAgICAgQHBvcnQucG9zdE1lc3NhZ2UgbWVzc2FnZVxuICAgIGNhdGNoXG4gICAgICBzaG93ICdlcnJvcidcbiAgICAgICMgQHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG4gICAgICAjIEBwb3J0LnBvc3RNZXNzYWdlIG1lc3NhZ2VcblxubW9kdWxlLmV4cG9ydHMgPSBNU0ciLCIvKipcbiAqIERFVkVMT1BFRCBCWVxuICogR0lMIExPUEVTIEJVRU5PXG4gKiBnaWxidWVuby5tYWlsQGdtYWlsLmNvbVxuICpcbiAqIFdPUktTIFdJVEg6XG4gKiBJRSA5KywgRkYgNCssIFNGIDUrLCBXZWJLaXQsIENIIDcrLCBPUCAxMissIEJFU0VOLCBSaGlubyAxLjcrXG4gKlxuICogRk9SSzpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWxhbmtlL1dhdGNoLkpTXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAgICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb21lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAgICAgLy8gbGlrZSBOb2RlLlxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICAgICAgd2luZG93LldhdGNoSlMgPSBmYWN0b3J5KCk7XG4gICAgICAgIHdpbmRvdy53YXRjaCA9IHdpbmRvdy5XYXRjaEpTLndhdGNoO1xuICAgICAgICB3aW5kb3cudW53YXRjaCA9IHdpbmRvdy5XYXRjaEpTLnVud2F0Y2g7XG4gICAgICAgIHdpbmRvdy5jYWxsV2F0Y2hlcnMgPSB3aW5kb3cuV2F0Y2hKUy5jYWxsV2F0Y2hlcnM7XG4gICAgfVxufShmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgV2F0Y2hKUyA9IHtcbiAgICAgICAgbm9Nb3JlOiBmYWxzZVxuICAgIH0sXG4gICAgbGVuZ3Roc3ViamVjdHMgPSBbXTtcblxuICAgIHZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKGZ1bmN0aW9uVG9DaGVjaykge1xuICAgICAgICAgICAgdmFyIGdldFR5cGUgPSB7fTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvblRvQ2hlY2sgJiYgZ2V0VHlwZS50b1N0cmluZy5jYWxsKGZ1bmN0aW9uVG9DaGVjaykgPT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9O1xuXG4gICAgdmFyIGlzSW50ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIHggJSAxID09PSAwO1xuICAgIH07XG5cbiAgICB2YXIgaXNBcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIHZhciBnZXRPYmpEaWZmID0gZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHZhciBhcGx1cyA9IFtdLFxuICAgICAgICBicGx1cyA9IFtdO1xuXG4gICAgICAgIGlmKCEodHlwZW9mIGEgPT0gXCJzdHJpbmdcIikgJiYgISh0eXBlb2YgYiA9PSBcInN0cmluZ1wiKSl7XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KGEpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJbaV0gPT09IHVuZGVmaW5lZCkgYXBsdXMucHVzaChpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBhKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGEuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGJbaV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwbHVzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KGIpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaj0wOyBqPGIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFbal0gPT09IHVuZGVmaW5lZCkgYnBsdXMucHVzaChqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaiBpbiBiKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGIuaGFzT3duUHJvcGVydHkoaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFbal0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJwbHVzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWRkZWQ6IGFwbHVzLFxuICAgICAgICAgICAgcmVtb3ZlZDogYnBsdXNcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY2xvbmUgPSBmdW5jdGlvbihvYmope1xuXG4gICAgICAgIGlmIChudWxsID09IG9iaiB8fCBcIm9iamVjdFwiICE9IHR5cGVvZiBvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29weSA9IG9iai5jb25zdHJ1Y3RvcigpO1xuXG4gICAgICAgIGZvciAodmFyIGF0dHIgaW4gb2JqKSB7XG4gICAgICAgICAgICBjb3B5W2F0dHJdID0gb2JqW2F0dHJdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvcHk7XG5cbiAgICB9XG5cbiAgICB2YXIgZGVmaW5lR2V0QW5kU2V0ID0gZnVuY3Rpb24gKG9iaiwgcHJvcE5hbWUsIGdldHRlciwgc2V0dGVyKSB7XG4gICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgIE9iamVjdC5vYnNlcnZlKG9ialtwcm9wTmFtZV0sIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgIHNldHRlcihkYXRhKTsgLy9UT0RPOiBhZGFwdCBvdXIgY2FsbGJhY2sgZGF0YSB0byBtYXRjaCBPYmplY3Qub2JzZXJ2ZSBkYXRhIHNwZWNcbiAgICAgICAgICAgIH0pOyBcblxuICAgICAgICB9IGNhdGNoKGUpIHtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcE5hbWUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXQ6IGdldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXQ6IHNldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2goZTIpIHtcbiAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVHZXR0ZXJfXy5jYWxsKG9iaiwgcHJvcE5hbWUsIGdldHRlcik7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVTZXR0ZXJfXy5jYWxsKG9iaiwgcHJvcE5hbWUsIHNldHRlcik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlMykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ3YXRjaEpTIGVycm9yOiBicm93c2VyIG5vdCBzdXBwb3J0ZWQgOi9cIilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZGVmaW5lUHJvcCA9IGZ1bmN0aW9uIChvYmosIHByb3BOYW1lLCB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcE5hbWUsIHtcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIG9ialtwcm9wTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgd2F0Y2ggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24oYXJndW1lbnRzWzFdKSkge1xuICAgICAgICAgICAgd2F0Y2hBbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHdhdGNoTWFueS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2F0Y2hPbmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgdmFyIHdhdGNoQWxsID0gZnVuY3Rpb24gKG9iaiwgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpIHtcblxuICAgICAgICBpZiAoKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9wcyA9IFtdO1xuXG5cbiAgICAgICAgaWYoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wID0gMDsgcHJvcCA8IG9iai5sZW5ndGg7IHByb3ArKykgeyAvL2ZvciBlYWNoIGl0ZW0gaWYgb2JqIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBvYmopIHsgLy9mb3IgZWFjaCBhdHRyaWJ1dGUgaWYgb2JqIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcDIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2gocHJvcDIpOyAvL3B1dCBpbiB0aGUgcHJvcHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB3YXRjaE1hbnkob2JqLCBwcm9wcywgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpOyAvL3dhdGNoIGFsbCBpdGVtcyBvZiB0aGUgcHJvcHNcblxuICAgICAgICBpZiAoYWRkTlJlbW92ZSkge1xuICAgICAgICAgICAgcHVzaFRvTGVuZ3RoU3ViamVjdHMob2JqLCBcIiQkd2F0Y2hsZW5ndGhzdWJqZWN0cm9vdFwiLCB3YXRjaGVyLCBsZXZlbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICB2YXIgd2F0Y2hNYW55ID0gZnVuY3Rpb24gKG9iaiwgcHJvcHMsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKSB7XG5cbiAgICAgICAgaWYgKCh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8cHJvcHMubGVuZ3RoOyBpKyspIHsgLy93YXRjaCBlYWNoIHByb3BlcnR5XG4gICAgICAgICAgICB2YXIgcHJvcCA9IHByb3BzW2ldO1xuICAgICAgICAgICAgd2F0Y2hPbmUob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgd2F0Y2hPbmUgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCkge1xuXG4gICAgICAgIGlmICgodHlwZW9mIG9iaiA9PSBcInN0cmluZ1wiKSB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoaXNGdW5jdGlvbihvYmpbcHJvcF0pKSB7IC8vZG9udCB3YXRjaCBpZiBpdCBpcyBhIGZ1bmN0aW9uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZihvYmpbcHJvcF0gIT0gbnVsbCAmJiAobGV2ZWwgPT09IHVuZGVmaW5lZCB8fCBsZXZlbCA+IDApKXtcbiAgICAgICAgICAgIHdhdGNoQWxsKG9ialtwcm9wXSwgd2F0Y2hlciwgbGV2ZWwhPT11bmRlZmluZWQ/IGxldmVsLTEgOiBsZXZlbCxudWxsLCBwYXRoICsgJy4nICsgcHJvcCk7IC8vcmVjdXJzaXZlbHkgd2F0Y2ggYWxsIGF0dHJpYnV0ZXMgb2YgdGhpc1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmaW5lV2F0Y2hlcihvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBwYXRoKTtcblxuICAgICAgICBpZihhZGROUmVtb3ZlICYmIChsZXZlbCA9PT0gdW5kZWZpbmVkIHx8IGxldmVsID4gMCkpe1xuICAgICAgICAgICAgcHVzaFRvTGVuZ3RoU3ViamVjdHMob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgdW53YXRjaCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbihhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB1bndhdGNoQWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB1bndhdGNoTWFueS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdW53YXRjaE9uZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHVud2F0Y2hBbGwgPSBmdW5jdGlvbiAob2JqLCB3YXRjaGVyKSB7XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFN0cmluZyB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgdmFyIHByb3BzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wID0gMDsgcHJvcCA8IG9iai5sZW5ndGg7IHByb3ArKykgeyAvL2ZvciBlYWNoIGl0ZW0gaWYgb2JqIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1bndhdGNoTWFueShvYmosIHByb3BzLCB3YXRjaGVyKTsgLy93YXRjaCBhbGwgaXRlbnMgb2YgdGhlIHByb3BzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdW53YXRjaFByb3BzSW5PYmplY3QgPSBmdW5jdGlvbiAob2JqMikge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wcyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AyIGluIG9iajIpIHsgLy9mb3IgZWFjaCBhdHRyaWJ1dGUgaWYgb2JqIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqMi5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmoyW3Byb3AyXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVud2F0Y2hQcm9wc0luT2JqZWN0KG9iajJbcHJvcDJdKTsgLy9yZWN1cnMgaW50byBvYmplY3QgcHJvcHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wMik7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVud2F0Y2hNYW55KG9iajIsIHByb3BzLCB3YXRjaGVyKTsgLy91bndhdGNoIGFsbCBvZiB0aGUgcHJvcHNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB1bndhdGNoUHJvcHNJbk9iamVjdChvYmopO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdmFyIHVud2F0Y2hNYW55ID0gZnVuY3Rpb24gKG9iaiwgcHJvcHMsIHdhdGNoZXIpIHtcblxuICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBwcm9wcykgeyAvL3dhdGNoIGVhY2ggYXR0cmlidXRlIG9mIFwicHJvcHNcIiBpZiBpcyBhbiBvYmplY3RcbiAgICAgICAgICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICB1bndhdGNoT25lKG9iaiwgcHJvcHNbcHJvcDJdLCB3YXRjaGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZGVmaW5lV2F0Y2hlciA9IGZ1bmN0aW9uIChvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBwYXRoKSB7XG5cbiAgICAgICAgdmFyIHZhbCA9IG9ialtwcm9wXTtcblxuICAgICAgICB3YXRjaEZ1bmN0aW9ucyhvYmosIHByb3ApO1xuXG4gICAgICAgIGlmICghb2JqLndhdGNoZXJzKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wKG9iaiwgXCJ3YXRjaGVyc1wiLCB7fSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICghb2JqLl9wYXRoKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wKG9iaiwgXCJfcGF0aFwiLCBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb2JqLndhdGNoZXJzW3Byb3BdKSB7XG4gICAgICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxvYmoud2F0Y2hlcnNbcHJvcF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKG9iai53YXRjaGVyc1twcm9wXVtpXSA9PT0gd2F0Y2hlcil7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0ucHVzaCh3YXRjaGVyKTsgLy9hZGQgdGhlIG5ldyB3YXRjaGVyIGluIHRoZSB3YXRjaGVycyBhcnJheVxuXG5cbiAgICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH07XG5cblxuICAgICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld3ZhbCkge1xuICAgICAgICAgICAgdmFyIG9sZHZhbCA9IHZhbDtcbiAgICAgICAgICAgIHZhbCA9IG5ld3ZhbDtcblxuICAgICAgICAgICAgaWYgKGxldmVsICE9PSAwICYmIG9ialtwcm9wXSl7XG4gICAgICAgICAgICAgICAgLy8gd2F0Y2ggc3ViIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICB3YXRjaEFsbChvYmpbcHJvcF0sIHdhdGNoZXIsIChsZXZlbD09PXVuZGVmaW5lZCk/bGV2ZWw6bGV2ZWwtMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdhdGNoRnVuY3Rpb25zKG9iaiwgcHJvcCk7XG5cbiAgICAgICAgICAgIGlmICghV2F0Y2hKUy5ub01vcmUpe1xuICAgICAgICAgICAgICAgIC8vaWYgKEpTT04uc3RyaW5naWZ5KG9sZHZhbCkgIT09IEpTT04uc3RyaW5naWZ5KG5ld3ZhbCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkdmFsICE9PSBuZXd2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKG9iaiwgcHJvcCwgXCJzZXRcIiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgICAgICAgICBXYXRjaEpTLm5vTW9yZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBkZWZpbmVHZXRBbmRTZXQob2JqLCBwcm9wLCBnZXR0ZXIsIHNldHRlcik7XG5cbiAgICB9O1xuXG4gICAgdmFyIGNhbGxXYXRjaGVycyA9IGZ1bmN0aW9uIChvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpIHtcbiAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yICh2YXIgd3I9MDsgd3I8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgd3IrKykge1xuICAgICAgICAgICAgICAgIG9iai53YXRjaGVyc1twcm9wXVt3cl0uY2FsbChvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHsvL2NhbGwgYWxsXG4gICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBhY3Rpb24sIG5ld3ZhbCwgb2xkdmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQHRvZG8gY29kZSByZWxhdGVkIHRvIFwid2F0Y2hGdW5jdGlvbnNcIiBpcyBjZXJ0YWlubHkgYnVnZ3lcbiAgICB2YXIgbWV0aG9kTmFtZXMgPSBbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzbGljZScsICd1bnNoaWZ0JywgJ3NwbGljZSddO1xuICAgIHZhciBkZWZpbmVBcnJheU1ldGhvZFdhdGNoZXIgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCBvcmlnaW5hbCwgbWV0aG9kTmFtZSkge1xuICAgICAgICBkZWZpbmVQcm9wKG9ialtwcm9wXSwgbWV0aG9kTmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gb3JpZ2luYWwuYXBwbHkob2JqW3Byb3BdLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgd2F0Y2hPbmUob2JqLCBvYmpbcHJvcF0pO1xuICAgICAgICAgICAgaWYgKG1ldGhvZE5hbWUgIT09ICdzbGljZScpIHtcbiAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBtZXRob2ROYW1lLGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgd2F0Y2hGdW5jdGlvbnMgPSBmdW5jdGlvbihvYmosIHByb3ApIHtcblxuICAgICAgICBpZiAoKCFvYmpbcHJvcF0pIHx8IChvYmpbcHJvcF0gaW5zdGFuY2VvZiBTdHJpbmcpIHx8ICghaXNBcnJheShvYmpbcHJvcF0pKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IG1ldGhvZE5hbWVzLmxlbmd0aCwgbWV0aG9kTmFtZTsgaS0tOykge1xuICAgICAgICAgICAgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgICAgICAgZGVmaW5lQXJyYXlNZXRob2RXYXRjaGVyKG9iaiwgcHJvcCwgb2JqW3Byb3BdW21ldGhvZE5hbWVdLCBtZXRob2ROYW1lKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB1bndhdGNoT25lID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgd2F0Y2hlcikge1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdyA9IG9iai53YXRjaGVyc1twcm9wXVtpXTtcblxuICAgICAgICAgICAgaWYodyA9PSB3YXRjaGVyKSB7XG4gICAgICAgICAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbW92ZUZyb21MZW5ndGhTdWJqZWN0cyhvYmosIHByb3AsIHdhdGNoZXIpO1xuICAgIH07XG5cbiAgICB2YXIgbG9vcCA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgZm9yKHZhciBpPTA7IGk8bGVuZ3Roc3ViamVjdHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgdmFyIHN1YmogPSBsZW5ndGhzdWJqZWN0c1tpXTtcblxuICAgICAgICAgICAgaWYgKHN1YmoucHJvcCA9PT0gXCIkJHdhdGNobGVuZ3Roc3ViamVjdHJvb3RcIikge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpZmZlcmVuY2UgPSBnZXRPYmpEaWZmKHN1Ymoub2JqLCBzdWJqLmFjdHVhbCk7XG5cbiAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCB8fCBkaWZmZXJlbmNlLnJlbW92ZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZCAhPSBkaWZmZXJlbmNlLnJlbW92ZWQgJiYgKGRpZmZlcmVuY2UuYWRkZWRbMF0gIT0gZGlmZmVyZW5jZS5yZW1vdmVkWzBdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoTWFueShzdWJqLm9iaiwgZGlmZmVyZW5jZS5hZGRlZCwgc3Viai53YXRjaGVyLCBzdWJqLmxldmVsIC0gMSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Ymoud2F0Y2hlci5jYWxsKHN1Ymoub2JqLCBcInJvb3RcIiwgXCJkaWZmZXJlbnRhdHRyXCIsIGRpZmZlcmVuY2UsIHN1YmouYWN0dWFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWJqLmFjdHVhbCA9IGNsb25lKHN1Ymoub2JqKTtcblxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKHN1Ymoub2JqW3N1YmoucHJvcF0gPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHZhciBkaWZmZXJlbmNlID0gZ2V0T2JqRGlmZihzdWJqLm9ialtzdWJqLnByb3BdLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCB8fCBkaWZmZXJlbmNlLnJlbW92ZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaj0wOyBqPHN1Ymoub2JqLndhdGNoZXJzW3N1YmoucHJvcF0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaE1hbnkoc3Viai5vYmpbc3Viai5wcm9wXSwgZGlmZmVyZW5jZS5hZGRlZCwgc3Viai5vYmoud2F0Y2hlcnNbc3Viai5wcm9wXVtqXSwgc3Viai5sZXZlbCAtIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKHN1Ymoub2JqLCBzdWJqLnByb3AsIFwiZGlmZmVyZW50YXR0clwiLCBkaWZmZXJlbmNlLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3Viai5hY3R1YWwgPSBjbG9uZShzdWJqLm9ialtzdWJqLnByb3BdKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgcHVzaFRvTGVuZ3RoU3ViamVjdHMgPSBmdW5jdGlvbihvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsKXtcbiAgICAgICAgXG4gICAgICAgIHZhciBhY3R1YWw7XG5cbiAgICAgICAgaWYgKHByb3AgPT09IFwiJCR3YXRjaGxlbmd0aHN1YmplY3Ryb290XCIpIHtcbiAgICAgICAgICAgIGFjdHVhbCA9ICBjbG9uZShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWN0dWFsID0gY2xvbmUob2JqW3Byb3BdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxlbmd0aHN1YmplY3RzLnB1c2goe1xuICAgICAgICAgICAgb2JqOiBvYmosXG4gICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgICAgICAgICB3YXRjaGVyOiB3YXRjaGVyLFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgcmVtb3ZlRnJvbUxlbmd0aFN1YmplY3RzID0gZnVuY3Rpb24ob2JqLCBwcm9wLCB3YXRjaGVyKXtcblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8bGVuZ3Roc3ViamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzdWJqID0gbGVuZ3Roc3ViamVjdHNbaV07XG5cbiAgICAgICAgICAgIGlmIChzdWJqLm9iaiA9PSBvYmogJiYgc3Viai5wcm9wID09IHByb3AgJiYgc3Viai53YXRjaGVyID09IHdhdGNoZXIpIHtcbiAgICAgICAgICAgICAgICBsZW5ndGhzdWJqZWN0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBzZXRJbnRlcnZhbChsb29wLCA1MCk7XG5cbiAgICBXYXRjaEpTLndhdGNoID0gd2F0Y2g7XG4gICAgV2F0Y2hKUy51bndhdGNoID0gdW53YXRjaDtcbiAgICBXYXRjaEpTLmNhbGxXYXRjaGVycyA9IGNhbGxXYXRjaGVycztcblxuICAgIHJldHVybiBXYXRjaEpTO1xuXG59KSk7XG4iLCJjbGFzcyBOb3RpZmljYXRpb25cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgc2hvdzogKHRpdGxlLCBtZXNzYWdlKSAtPlxuICAgIHVuaXF1ZUlkID0gKGxlbmd0aD04KSAtPlxuICAgICAgaWQgPSBcIlwiXG4gICAgICBpZCArPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMikgd2hpbGUgaWQubGVuZ3RoIDwgbGVuZ3RoXG4gICAgICBpZC5zdWJzdHIgMCwgbGVuZ3RoXG5cbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUgdW5pcXVlSWQoKSxcbiAgICAgIHR5cGU6J2Jhc2ljJ1xuICAgICAgdGl0bGU6dGl0bGVcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgIGljb25Vcmw6J2ltYWdlcy9pY29uLTM4LnBuZycsXG4gICAgICAoY2FsbGJhY2spIC0+XG4gICAgICAgIHVuZGVmaW5lZFxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGlmaWNhdGlvbiIsIiNUT0RPOiByZXdyaXRlIHRoaXMgY2xhc3MgdXNpbmcgdGhlIG5ldyBjaHJvbWUuc29ja2V0cy4qIGFwaSB3aGVuIHlvdSBjYW4gbWFuYWdlIHRvIG1ha2UgaXQgd29ya1xuY2xhc3MgU2VydmVyXG4gIHNvY2tldDogY2hyb21lLnNvY2tldFxuICAjIHRjcDogY2hyb21lLnNvY2tldHMudGNwXG4gIHNvY2tldFByb3BlcnRpZXM6XG4gICAgICBwZXJzaXN0ZW50OnRydWVcbiAgICAgIG5hbWU6J1NMUmVkaXJlY3RvcidcbiAgIyBzb2NrZXRJbmZvOm51bGxcbiAgZ2V0TG9jYWxGaWxlOm51bGxcbiAgc29ja2V0SWRzOltdXG4gIHN0YXR1czpcbiAgICBob3N0Om51bGxcbiAgICBwb3J0Om51bGxcbiAgICBtYXhDb25uZWN0aW9uczo1MFxuICAgIGlzT246ZmFsc2VcbiAgICBzb2NrZXRJbmZvOm51bGxcbiAgICB1cmw6bnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIEBzdGF0dXMuaG9zdCA9IFwiMTI3LjAuMC4xXCJcbiAgICBAc3RhdHVzLnBvcnQgPSAxMDAxMlxuICAgIEBzdGF0dXMubWF4Q29ubmVjdGlvbnMgPSA1MFxuICAgIEBzdGF0dXMudXJsID0gJ2h0dHA6Ly8nICsgQHN0YXR1cy5ob3N0ICsgJzonICsgQHN0YXR1cy5wb3J0ICsgJy8nXG4gICAgQHN0YXR1cy5pc09uID0gZmFsc2VcblxuXG4gIHN0YXJ0OiAoaG9zdCxwb3J0LG1heENvbm5lY3Rpb25zLCBjYikgLT5cbiAgICBpZiBob3N0PyB0aGVuIEBzdGF0dXMuaG9zdCA9IGhvc3RcbiAgICBpZiBwb3J0PyB0aGVuIEBzdGF0dXMucG9ydCA9IHBvcnRcbiAgICBpZiBtYXhDb25uZWN0aW9ucz8gdGhlbiBAc3RhdHVzLm1heENvbm5lY3Rpb25zID0gbWF4Q29ubmVjdGlvbnNcblxuICAgIEBraWxsQWxsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICByZXR1cm4gY2I/IGVyciBpZiBlcnI/XG5cbiAgICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG4gICAgICBAc29ja2V0LmNyZWF0ZSAndGNwJywge30sIChzb2NrZXRJbmZvKSA9PlxuICAgICAgICBAc3RhdHVzLnNvY2tldEluZm8gPSBzb2NrZXRJbmZvXG4gICAgICAgIEBzb2NrZXRJZHMgPSBbXVxuICAgICAgICBAc29ja2V0SWRzLnB1c2ggQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0ICdzb2NrZXRJZHMnOkBzb2NrZXRJZHNcbiAgICAgICAgQHNvY2tldC5saXN0ZW4gQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkLCBAc3RhdHVzLmhvc3QsIEBzdGF0dXMucG9ydCwgKHJlc3VsdCkgPT5cbiAgICAgICAgICBpZiByZXN1bHQgPiAtMVxuICAgICAgICAgICAgc2hvdyAnbGlzdGVuaW5nICcgKyBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgICAgIEBzdGF0dXMuaXNPbiA9IHRydWVcbiAgICAgICAgICAgIEBzb2NrZXQuYWNjZXB0IEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuICAgICAgICAgICAgY2I/IG51bGwsIEBzdGF0dXNcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjYj8gcmVzdWx0XG5cblxuICBraWxsQWxsOiAoY2IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQgJ3NvY2tldElkcycsIChyZXN1bHQpID0+XG4gICAgICBAc29ja2V0SWRzID0gcmVzdWx0LnNvY2tldElkc1xuICAgICAgQHN0YXR1cy5pc09uID0gZmFsc2VcbiAgICAgIHJldHVybiBjYj8gbnVsbCwgJ3N1Y2Nlc3MnIHVubGVzcyBAc29ja2V0SWRzP1xuICAgICAgY250ID0gMFxuICAgICAgZm9yIHMgaW4gQHNvY2tldElkc1xuICAgICAgICBkbyAocykgPT5cbiAgICAgICAgICBjbnQrK1xuICAgICAgICAgIEBzb2NrZXQuZ2V0SW5mbyBzLCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgICAgIGNudC0tXG4gICAgICAgICAgICBpZiBub3QgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yP1xuICAgICAgICAgICAgICBAc29ja2V0LmRpc2Nvbm5lY3QgcyBpZiBAc3RhdHVzLnNvY2tldEluZm8/LmNvbm5lY3RlZCBvciBub3QgQHN0YXR1cy5zb2NrZXRJbmZvP1xuICAgICAgICAgICAgICBAc29ja2V0LmRlc3Ryb3kgc1xuXG4gICAgICAgICAgICBjYj8gbnVsbCwgJ3N1Y2Nlc3MnIGlmIGNudCBpcyAwXG5cbiAgc3RvcDogKGNiKSAtPlxuICAgIEBraWxsQWxsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICBpZiBlcnI/IFxuICAgICAgICBjYj8gZXJyXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLHN1Y2Nlc3NcblxuXG4gIF9vblJlY2VpdmU6IChyZWNlaXZlSW5mbykgPT5cbiAgICBzaG93KFwiQ2xpZW50IHNvY2tldCAncmVjZWl2ZScgZXZlbnQ6IHNkPVwiICsgcmVjZWl2ZUluZm8uc29ja2V0SWRcbiAgICArIFwiLCBieXRlcz1cIiArIHJlY2VpdmVJbmZvLmRhdGEuYnl0ZUxlbmd0aClcblxuICBfb25MaXN0ZW46IChzZXJ2ZXJTb2NrZXRJZCwgcmVzdWx0Q29kZSkgPT5cbiAgICByZXR1cm4gc2hvdyAnRXJyb3IgTGlzdGVuaW5nOiAnICsgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UgaWYgcmVzdWx0Q29kZSA8IDBcbiAgICBAc2VydmVyU29ja2V0SWQgPSBzZXJ2ZXJTb2NrZXRJZFxuICAgIEB0Y3BTZXJ2ZXIub25BY2NlcHQuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdFxuICAgIEB0Y3BTZXJ2ZXIub25BY2NlcHRFcnJvci5hZGRMaXN0ZW5lciBAX29uQWNjZXB0RXJyb3JcbiAgICBAdGNwLm9uUmVjZWl2ZS5hZGRMaXN0ZW5lciBAX29uUmVjZWl2ZVxuICAgICMgc2hvdyBcIltcIitzb2NrZXRJbmZvLnBlZXJBZGRyZXNzK1wiOlwiK3NvY2tldEluZm8ucGVlclBvcnQrXCJdIENvbm5lY3Rpb24gYWNjZXB0ZWQhXCI7XG4gICAgIyBpbmZvID0gQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkXG4gICAgIyBAZ2V0RmlsZSB1cmksIChmaWxlKSAtPlxuICBfb25BY2NlcHRFcnJvcjogKGVycm9yKSAtPlxuICAgIHNob3cgZXJyb3JcblxuICBfb25BY2NlcHQ6IChzb2NrZXRJbmZvKSA9PlxuICAgICMgcmV0dXJuIG51bGwgaWYgaW5mby5zb2NrZXRJZCBpc250IEBzZXJ2ZXJTb2NrZXRJZFxuICAgIHNob3coXCJTZXJ2ZXIgc29ja2V0ICdhY2NlcHQnIGV2ZW50OiBzZD1cIiArIHNvY2tldEluZm8uc29ja2V0SWQpXG4gICAgaWYgc29ja2V0SW5mbz8uc29ja2V0SWQ/XG4gICAgICBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWQsIChlcnIsIGluZm8pID0+XG4gICAgICAgIFxuICAgICAgICBpZiBlcnI/IHRoZW4gcmV0dXJuIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG5cbiAgICAgICAgQGdldExvY2FsRmlsZSBpbmZvLCAoZXJyLCBmaWxlRW50cnksIGZpbGVSZWFkZXIpID0+XG4gICAgICAgICAgaWYgZXJyPyB0aGVuIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG4gICAgICAgICAgZWxzZSBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SW5mby5zb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlUmVhZGVyLCBpbmZvLmtlZXBBbGl2ZVxuICAgIGVsc2VcbiAgICAgIHNob3cgXCJObyBzb2NrZXQ/IVwiXG4gICAgIyBAc29ja2V0LmFjY2VwdCBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cblxuXG4gIHN0cmluZ1RvVWludDhBcnJheTogKHN0cmluZykgLT5cbiAgICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyaW5nLmxlbmd0aClcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIGkgPSAwXG5cbiAgICB3aGlsZSBpIDwgc3RyaW5nLmxlbmd0aFxuICAgICAgdmlld1tpXSA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG4gICAgICBpKytcbiAgICB2aWV3XG5cbiAgYXJyYXlCdWZmZXJUb1N0cmluZzogKGJ1ZmZlcikgLT5cbiAgICBzdHIgPSBcIlwiXG4gICAgdUFycmF5VmFsID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIHMgPSAwXG5cbiAgICB3aGlsZSBzIDwgdUFycmF5VmFsLmxlbmd0aFxuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodUFycmF5VmFsW3NdKVxuICAgICAgcysrXG4gICAgc3RyXG5cbiAgX3dyaXRlMjAwUmVzcG9uc2U6IChzb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlLCBrZWVwQWxpdmUpIC0+XG4gICAgY29udGVudFR5cGUgPSAoaWYgKGZpbGUudHlwZSBpcyBcIlwiKSB0aGVuIFwidGV4dC9wbGFpblwiIGVsc2UgZmlsZS50eXBlKVxuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgMjAwIE9LXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuXG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXJcbiAgICByZWFkZXIub25sb2FkID0gKGV2KSA9PlxuICAgICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZXYudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICAgIHNob3cgd3JpdGVJbmZvXG4gICAgICAgICMgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIub25lcnJvciA9IChlcnJvcikgPT5cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBmaWxlXG5cblxuICAgICMgQGVuZCBzb2NrZXRJZFxuICAgICMgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAjIGZpbGVSZWFkZXIub25sb2FkID0gKGUpID0+XG4gICAgIyAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgIyAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAjICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgIyAgICAgICBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SWRcblxuXG4gIF9yZWFkRnJvbVNvY2tldDogKHNvY2tldElkLCBjYikgLT5cbiAgICBAc29ja2V0LnJlYWQgc29ja2V0SWQsIChyZWFkSW5mbykgPT5cbiAgICAgIHNob3cgXCJSRUFEXCIsIHJlYWRJbmZvXG5cbiAgICAgICMgUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICBkYXRhID0gQGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSlcbiAgICAgIHNob3cgZGF0YVxuXG4gICAgICBrZWVwQWxpdmUgPSBmYWxzZVxuICAgICAga2VlcEFsaXZlID0gdHJ1ZSBpZiBkYXRhLmluZGV4T2YgJ0Nvbm5lY3Rpb246IGtlZXAtYWxpdmUnIGlzbnQgLTFcblxuICAgICAgaWYgZGF0YS5pbmRleE9mKFwiR0VUIFwiKSBpc250IDBcbiAgICAgICAgcmV0dXJuIGNiPyAnNDA0Jywga2VlcEFsaXZlOmtlZXBBbGl2ZVxuXG5cblxuICAgICAgdXJpRW5kID0gZGF0YS5pbmRleE9mKFwiIFwiLCA0KVxuXG4gICAgICByZXR1cm4gZW5kIHNvY2tldElkIGlmIHVyaUVuZCA8IDBcblxuICAgICAgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKVxuICAgICAgaWYgbm90IHVyaT9cbiAgICAgICAgcmV0dXJuIGNiPyAnNDA0Jywga2VlcEFsaXZlOmtlZXBBbGl2ZVxuXG4gICAgICBpbmZvID1cbiAgICAgICAgdXJpOiB1cmlcbiAgICAgICAga2VlcEFsaXZlOmtlZXBBbGl2ZVxuICAgICAgaW5mby5yZWZlcmVyID0gZGF0YS5tYXRjaCgvUmVmZXJlcjpcXHMoLiopLyk/WzFdXG4gICAgICAjc3VjY2Vzc1xuICAgICAgY2I/IG51bGwsIGluZm9cblxuICBlbmQ6IChzb2NrZXRJZCwga2VlcEFsaXZlKSAtPlxuICAgICAgIyBpZiBrZWVwQWxpdmVcbiAgICAgICMgICBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAjIGVsc2VcbiAgICBAc29ja2V0LmRpc2Nvbm5lY3Qgc29ja2V0SWRcbiAgICBAc29ja2V0LmRlc3Ryb3kgc29ja2V0SWRcbiAgICBzaG93ICdlbmRpbmcgJyArIHNvY2tldElkXG4gICAgQHNvY2tldC5hY2NlcHQgQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAgX3dyaXRlRXJyb3I6IChzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIC0+XG4gICAgZmlsZSA9IHNpemU6IDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIlxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGVcbiAgICBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiICMoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIlxuICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcnZlclxuIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuXG5XYXRjaEpTID0gcmVxdWlyZSAnd2F0Y2hqcydcbndhdGNoID0gV2F0Y2hKUy53YXRjaFxudW53YXRjaCA9IFdhdGNoSlMudW53YXRjaFxuY2FsbFdhdGNoZXJzID0gV2F0Y2hKUy5jYWxsV2F0Y2hlcnNcblxuY2xhc3MgU3RvcmFnZVxuICBhcGk6IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gIExJU1RFTjogTElTVEVOLmdldCgpIFxuICBNU0c6IE1TRy5nZXQoKVxuICBkYXRhOiBcbiAgICBjdXJyZW50UmVzb3VyY2VzOiBbXVxuICAgIGRpcmVjdG9yaWVzOltdXG4gICAgbWFwczpbXVxuICAgIHRhYk1hcHM6e31cbiAgICBjdXJyZW50RmlsZU1hdGNoZXM6e31cbiAgXG4gIHNlc3Npb246e31cblxuICBvbkRhdGFMb2FkZWQ6IC0+XG5cbiAgY2FsbGJhY2s6ICgpIC0+XG4gIG5vdGlmeU9uQ2hhbmdlOiAoKSAtPlxuICBjb25zdHJ1Y3RvcjogKF9vbkRhdGFMb2FkZWQpIC0+XG4gICAgQG9uRGF0YUxvYWRlZCA9IF9vbkRhdGFMb2FkZWQgaWYgX29uRGF0YUxvYWRlZD9cbiAgICBAYXBpLmdldCAocmVzdWx0cykgPT5cbiAgICAgIEBkYXRhW2tdID0gcmVzdWx0c1trXSBmb3IgayBvZiByZXN1bHRzXG5cbiAgICAgIHdhdGNoQW5kTm90aWZ5IEAsJ2RhdGFDaGFuZ2VkJywgQGRhdGEsIHRydWVcblxuICAgICAgd2F0Y2hBbmROb3RpZnkgQCwnc2Vzc2lvbkRhdGEnLCBAc2Vzc2lvbiwgZmFsc2VcblxuICAgICAgQG9uRGF0YUxvYWRlZCBAZGF0YVxuXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpIC0+XG4gICAgXG4gIHdhdGNoQW5kTm90aWZ5ID0gKF90aGlzLCBtc2dLZXksIG9iaiwgc3RvcmUpIC0+XG5cbiAgICAgIF9saXN0ZW5lciA9IChwcm9wLCBhY3Rpb24sIG5ld1ZhbCwgb2xkVmFsKSAtPlxuICAgICAgICBpZiAoYWN0aW9uIGlzIFwic2V0XCIgb3IgXCJkaWZmZXJlbnRhdHRyXCIpIGFuZCBfdGhpcy5ub1dhdGNoIGlzIGZhbHNlXG4gICAgICAgICAgaWYgbm90IC9eXFxkKyQvLnRlc3QocHJvcClcbiAgICAgICAgICAgIHNob3cgYXJndW1lbnRzXG4gICAgICAgICAgICBfdGhpcy5hcGkuc2V0IG9iaiBpZiBzdG9yZVxuICAgICAgICAgICAgbXNnID0ge31cbiAgICAgICAgICAgIG1zZ1ttc2dLZXldID0gb2JqXG4gICAgICAgICAgICAjIHVud2F0Y2ggb2JqLCBfbGlzdGVuZXIsMyx0cnVlXG4gICAgICAgICAgICBfdGhpcy5NU0cuRXh0UG9ydCBtc2dcbiAgICAgICAgXG4gICAgICBfdGhpcy5ub1dhdGNoID0gZmFsc2VcbiAgICAgIHdhdGNoIG9iaiwgX2xpc3RlbmVyLDMsdHJ1ZVxuXG4gICAgICBfdGhpcy5MSVNURU4uRXh0IG1zZ0tleSwgKGRhdGEpIC0+XG4gICAgICAgIF90aGlzLm5vV2F0Y2ggPSB0cnVlXG4gICAgICAgICMgdW53YXRjaCBvYmosIF9saXN0ZW5lciwzLHRydWVcbiAgICAgICAgXG4gICAgICAgIG9ialtrXSA9IGRhdGFba10gZm9yIGsgb2YgZGF0YVxuICAgICAgICBzZXRUaW1lb3V0ICgpIC0+IFxuICAgICAgICAgIF90aGlzLm5vV2F0Y2ggPSBmYWxzZVxuICAgICAgICAsMjAwXG5cbiAgc2F2ZTogKGtleSwgaXRlbSwgY2IpIC0+XG5cbiAgICBvYmogPSB7fVxuICAgIG9ialtrZXldID0gaXRlbVxuICAgIEBkYXRhW2tleV0gPSBpdGVtXG4gICAgQGFwaS5zZXQgb2JqLCAocmVzKSA9PlxuICAgICAgY2I/KClcbiAgICAgIEBjYWxsYmFjaz8oKVxuIFxuICBzYXZlQWxsOiAoZGF0YSwgY2IpIC0+XG5cbiAgICBpZiBkYXRhPyBcbiAgICAgIEBhcGkuc2V0IGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gXG4gICAgZWxzZVxuICAgICAgQGFwaS5zZXQgQGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gXG5cbiAgcmV0cmlldmU6IChrZXksIGNiKSAtPlxuICAgIEBvYnNlcnZlci5zdG9wKClcbiAgICBAYXBpLmdldCBrZXksIChyZXN1bHRzKSAtPlxuICAgICAgQGRhdGFbcl0gPSByZXN1bHRzW3JdIGZvciByIG9mIHJlc3VsdHNcbiAgICAgIGlmIGNiPyB0aGVuIGNiIHJlc3VsdHNba2V5XVxuXG4gIHJldHJpZXZlQWxsOiAoY2IpIC0+XG4gICAgIyBAb2JzZXJ2ZXIuc3RvcCgpXG4gICAgQGFwaS5nZXQgKHJlc3VsdCkgPT5cbiAgICAgIGZvciBjIG9mIHJlc3VsdCBcbiAgICAgICMgICBkZWxldGUgQGRhdGFbY11cbiAgICAgICAgQGRhdGFbY10gPSByZXN1bHRbY10gXG4gICAgICAjIEBkYXRhID0gcmVzdWx0XG4gICAgICAgIEBNU0cuRXh0UG9ydCAnZGF0YUNoYW5nZWQnOlxuICAgICAgICAgIHBhdGg6Y1xuICAgICAgICAgIHZhbHVlOnJlc3VsdFtjXVxuIFxuXG4gICAgICBAYXBpLnNldCBAZGF0YVxuICAgICAgIyBAY2FsbGJhY2s/IHJlc3VsdFxuICAgICAgY2I/IHJlc3VsdFxuICAgICAgQG9uRGF0YUxvYWRlZCBAZGF0YVxuXG4gIG9uRGF0YUxvYWRlZDogKGRhdGEpIC0+XG5cbiAgb25DaGFuZ2VkOiAoa2V5LCBjYikgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsIG5hbWVzcGFjZSkgLT5cbiAgICAgIGlmIGNoYW5nZXNba2V5XT8gYW5kIGNiPyB0aGVuIGNiIGNoYW5nZXNba2V5XS5uZXdWYWx1ZVxuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzXG5cbiAgb25DaGFuZ2VkQWxsOiAoKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcyxuYW1lc3BhY2UpID0+XG4gICAgICBoYXNDaGFuZ2VzID0gZmFsc2VcbiAgICAgIGZvciBjIG9mIGNoYW5nZXMgd2hlbiBjaGFuZ2VzW2NdLm5ld1ZhbHVlICE9IGNoYW5nZXNbY10ub2xkVmFsdWUgYW5kIGMgaXNudCdzb2NrZXRJZHMnXG4gICAgICAgIChjKSA9PiBcbiAgICAgICAgICBAZGF0YVtjXSA9IGNoYW5nZXNbY10ubmV3VmFsdWUgXG4gICAgICAgICAgc2hvdyAnZGF0YSBjaGFuZ2VkOiAnXG4gICAgICAgICAgc2hvdyBjXG4gICAgICAgICAgc2hvdyBAZGF0YVtjXVxuXG4gICAgICAgICAgaGFzQ2hhbmdlcyA9IHRydWVcblxuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzIGlmIGhhc0NoYW5nZXNcbiAgICAgIHNob3cgJ2NoYW5nZWQnIGlmIGhhc0NoYW5nZXNcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlXG4iLCIjIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxNzQyMDkzXG5tb2R1bGUuZXhwb3J0cyA9ICgoKSAtPlxuXG4gIGRlYnVnID0gdHJ1ZVxuICBcbiAgcmV0dXJuICh3aW5kb3cuc2hvdyA9ICgpIC0+KSBpZiBub3QgZGVidWdcblxuICBtZXRob2RzID0gW1xuICAgICdhc3NlcnQnLCAnY2xlYXInLCAnY291bnQnLCAnZGVidWcnLCAnZGlyJywgJ2RpcnhtbCcsICdlcnJvcicsXG4gICAgJ2V4Y2VwdGlvbicsICdncm91cCcsICdncm91cENvbGxhcHNlZCcsICdncm91cEVuZCcsICdpbmZvJywgJ2xvZycsXG4gICAgJ21hcmtUaW1lbGluZScsICdwcm9maWxlJywgJ3Byb2ZpbGVFbmQnLCAndGFibGUnLCAndGltZScsICd0aW1lRW5kJyxcbiAgICAndGltZVN0YW1wJywgJ3RyYWNlJywgJ3dhcm4nXVxuICAgIFxuICBub29wID0gKCkgLT5cbiAgICAjIHN0dWIgdW5kZWZpbmVkIG1ldGhvZHMuXG4gICAgZm9yIG0gaW4gbWV0aG9kcyAgd2hlbiAgIWNvbnNvbGVbbV1cbiAgICAgIGNvbnNvbGVbbV0gPSBub29wXG5cblxuICBpZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZD9cbiAgICB3aW5kb3cuc2hvdyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUpXG4gIGVsc2VcbiAgICB3aW5kb3cuc2hvdyA9ICgpIC0+XG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKVxuKSgpXG4iXX0=
