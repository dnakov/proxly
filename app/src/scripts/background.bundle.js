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
  debug = false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvYXBwL3NyYy9iYWNrZ3JvdW5kLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9jb21tb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L2NvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L25vZGVfbW9kdWxlcy93YXRjaGpzL3NyYy93YXRjaC5qcyIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9ub3RpZmljYXRpb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3NlcnZlci5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvc3RvcmFnZS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNFQSxJQUFBLGlFQUFBOztBQUFBLFNBQUEsR0FBWSxTQUFBLEdBQUE7QUFD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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QjtHQUFBLE1BQUE7V0FHRSxNQUFNLENBQUMsSUFBUCxHQUFjLFNBQUEsR0FBQTthQUNaLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQXpCLENBQThCLE9BQU8sQ0FBQyxHQUF0QyxFQUEyQyxPQUEzQyxFQUFvRCxTQUFwRCxFQURZO0lBQUEsRUFIaEI7R0FsQmdCO0FBQUEsQ0FBRCxDQUFBLENBQUEsQ0FBakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyBzZXJ2ZXIgPSByZXF1aXJlICcuL3RjcC1zZXJ2ZXIuanMnXG5cbmdldEdsb2JhbCA9IC0+XG4gIF9nZXRHbG9iYWwgPSAtPlxuICAgIHRoaXNcblxuICBfZ2V0R2xvYmFsKClcblxucm9vdCA9IGdldEdsb2JhbCgpXG5cbkFwcGxpY2F0aW9uID0gcmVxdWlyZSAnLi4vLi4vY29tbW9uLmNvZmZlZSdcblxuY2hyb21lLmFwcC5ydW50aW1lLm9uTGF1bmNoZWQuYWRkTGlzdGVuZXIgLT5cbiAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlICdpbmRleC5odG1sJyxcbiAgICAgICAgaWQ6IFwibWFpbndpblwiXG4gICAgICAgIGJvdW5kczpcbiAgICAgICAgICB3aWR0aDo3NzBcbiAgICAgICAgICBoZWlnaHQ6ODAwXG5cblxuXG5cbiMgQ29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnLmNvZmZlZSdcbiMgTVNHID0gcmVxdWlyZSAnLi4vLi4vbXNnLmNvZmZlZSdcbiMgTElTVEVOID0gcmVxdWlyZSAnLi4vLi4vbGlzdGVuLmNvZmZlZSdcbiMgU3RvcmFnZSA9IHJlcXVpcmUgJy4uLy4uL3N0b3JhZ2UuY29mZmVlJ1xuIyBGaWxlU3lzdGVtID0gcmVxdWlyZSAnLi4vLi4vZmlsZXN5c3RlbS5jb2ZmZWUnXG5Db25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcuY29mZmVlJ1xuU3RvcmFnZSA9IHJlcXVpcmUgJy4uLy4uL3N0b3JhZ2UuY29mZmVlJ1xuRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4uLy4uL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuU2VydmVyID0gcmVxdWlyZSAnLi4vLi4vc2VydmVyLmNvZmZlZSdcblxuXG5yb290LmFwcCA9IG5ldyBBcHBsaWNhdGlvbiBcbiAgU3RvcmFnZTogbmV3IFN0b3JhZ2VcbiAgRlM6IG5ldyBGaWxlU3lzdGVtXG4gIFNlcnZlcjogbmV3IFNlcnZlclxuXG5yb290LmFwcC5TZXJ2ZXIuZ2V0TG9jYWxGaWxlID0gYXBwLmdldExvY2FsRmlsZVxuIyByb290LmFwcC5TdG9yYWdlLmRhdGEuc2VydmVyID0gc3RhdHVzOnJvb3QuYXBwLlNlcnZlci5zdGF0dXNcblxuY2hyb21lLnJ1bnRpbWUub25TdXNwZW5kLmFkZExpc3RlbmVyIC0+XG4gIHJvb3QuYXBwLlN0b3JhZ2Uuc2F2ZUFsbChudWxsKVxuXG4jcm9vdC5hcHAuU3RvcmFnZS5yZXRyaWV2ZUFsbCgpXG4iLCJyZXF1aXJlICcuL3V0aWwuY29mZmVlJ1xuQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuU3RvcmFnZSA9IHJlcXVpcmUgJy4vc3RvcmFnZS5jb2ZmZWUnXG5GaWxlU3lzdGVtID0gcmVxdWlyZSAnLi9maWxlc3lzdGVtLmNvZmZlZSdcbk5vdGlmaWNhdGlvbiA9IHJlcXVpcmUgJy4vbm90aWZpY2F0aW9uLmNvZmZlZSdcblNlcnZlciA9IHJlcXVpcmUgJy4vc2VydmVyLmNvZmZlZSdcblxuXG5jbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIENvbmZpZ1xuICBMSVNURU46IG51bGxcbiAgTVNHOiBudWxsXG4gIFN0b3JhZ2U6IG51bGxcbiAgRlM6IG51bGxcbiAgU2VydmVyOiBudWxsXG4gIE5vdGlmeTogbnVsbFxuICBwbGF0Zm9ybTpudWxsXG4gIGN1cnJlbnRUYWJJZDpudWxsXG5cbiAgY29uc3RydWN0b3I6IChkZXBzKSAtPlxuICAgIHN1cGVyXG5cbiAgICBATVNHID89IE1TRy5nZXQoKVxuICAgIEBMSVNURU4gPz0gTElTVEVOLmdldCgpXG4gICAgXG4gICAgY2hyb21lLnJ1bnRpbWUub25Db25uZWN0RXh0ZXJuYWwuYWRkTGlzdGVuZXIgKHBvcnQpID0+XG4gICAgICBpZiBwb3J0LnNlbmRlci5pZCBpc250IEBFWFRfSURcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIEBNU0cuc2V0UG9ydCBwb3J0XG4gICAgICBATElTVEVOLnNldFBvcnQgcG9ydFxuICAgIFxuICAgIHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG4gICAgQE1TRy5zZXRQb3J0IHBvcnRcbiAgICBATElTVEVOLnNldFBvcnQgcG9ydFxuICAgIFxuICAgIGZvciBwcm9wIG9mIGRlcHNcbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwib2JqZWN0XCIgXG4gICAgICAgIEBbcHJvcF0gPSBAd3JhcE9iakluYm91bmQgZGVwc1twcm9wXVxuICAgICAgaWYgdHlwZW9mIGRlcHNbcHJvcF0gaXMgXCJmdW5jdGlvblwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpPdXRib3VuZCBuZXcgZGVwc1twcm9wXVxuXG4gICAgQFN0b3JhZ2Uub25EYXRhTG9hZGVkID0gKGRhdGEpID0+XG4gICAgICAjIEBkYXRhID0gZGF0YVxuICAgICAgIyBkZWxldGUgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXJcbiAgICAgICMgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXIgPSB7fVxuICAgICAgIyBkZWxldGUgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXIuc3RhdHVzXG5cbiAgICAgIGlmIG5vdCBAU3RvcmFnZS5kYXRhLmZpcnN0VGltZT9cbiAgICAgICAgQFN0b3JhZ2UuZGF0YS5maXJzdFRpbWUgPSBmYWxzZVxuICAgICAgICBAU3RvcmFnZS5kYXRhLm1hcHMucHVzaFxuICAgICAgICAgIG5hbWU6J1NhbGVzZm9yY2UnXG4gICAgICAgICAgdXJsOidodHRwcy4qXFwvcmVzb3VyY2UoXFwvWzAtOV0rKT9cXC8oW0EtWmEtejAtOVxcLS5fXStcXC8pPydcbiAgICAgICAgICByZWdleFJlcGw6JydcbiAgICAgICAgICBpc1JlZGlyZWN0OnRydWVcbiAgICAgICAgICBpc09uOmZhbHNlXG5cblxuICAgICAgIyBpZiBAUmVkaXJlY3Q/IHRoZW4gQFJlZGlyZWN0LmRhdGEgPSBAZGF0YS50YWJNYXBzXG5cbiAgICBATm90aWZ5ID89IChuZXcgTm90aWZpY2F0aW9uKS5zaG93IFxuICAgICMgQFN0b3JhZ2UgPz0gQHdyYXBPYmpPdXRib3VuZCBuZXcgU3RvcmFnZSBAZGF0YVxuICAgICMgQEZTID0gbmV3IEZpbGVTeXN0ZW0gXG4gICAgIyBAU2VydmVyID89IEB3cmFwT2JqT3V0Ym91bmQgbmV3IFNlcnZlclxuICAgIEBkYXRhID0gQFN0b3JhZ2UuZGF0YVxuICAgIFxuICAgIEB3cmFwID0gaWYgQFNFTEZfVFlQRSBpcyAnQVBQJyB0aGVuIEB3cmFwSW5ib3VuZCBlbHNlIEB3cmFwT3V0Ym91bmRcblxuICAgIEBvcGVuQXBwID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLm9wZW5BcHAnLCBAb3BlbkFwcFxuICAgIEBsYXVuY2hBcHAgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ubGF1bmNoQXBwJywgQGxhdW5jaEFwcFxuICAgIEBzdGFydFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5zdGFydFNlcnZlcicsIEBzdGFydFNlcnZlclxuICAgIEByZXN0YXJ0U2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnJlc3RhcnRTZXJ2ZXInLCBAcmVzdGFydFNlcnZlclxuICAgIEBzdG9wU2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnN0b3BTZXJ2ZXInLCBAc3RvcFNlcnZlclxuICAgIEBnZXRGaWxlTWF0Y2ggPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0RmlsZU1hdGNoJywgQGdldEZpbGVNYXRjaFxuXG4gICAgQHdyYXAgPSBpZiBAU0VMRl9UWVBFIGlzICdFWFRFTlNJT04nIHRoZW4gQHdyYXBJbmJvdW5kIGVsc2UgQHdyYXBPdXRib3VuZFxuXG4gICAgQGdldFJlc291cmNlcyA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRSZXNvdXJjZXMnLCBAZ2V0UmVzb3VyY2VzXG4gICAgQGdldEN1cnJlbnRUYWIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0Q3VycmVudFRhYicsIEBnZXRDdXJyZW50VGFiXG5cbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgLT5cbiAgICAgIEBTdG9yYWdlLnNlc3Npb24uc2VydmVyID0ge31cbiAgICAgIEBTdG9yYWdlLnNlc3Npb24uc2VydmVyLnN0YXR1cyA9IEBTZXJ2ZXIuc3RhdHVzXG4gICAgIyBAU3RvcmFnZS5yZXRyaWV2ZUFsbCgpIGlmIEBTdG9yYWdlP1xuXG5cbiAgZ2V0Q3VycmVudFRhYjogKGNiKSAtPlxuICAgICMgdHJpZWQgdG8ga2VlcCBvbmx5IGFjdGl2ZVRhYiBwZXJtaXNzaW9uLCBidXQgb2ggd2VsbC4uXG4gICAgY2hyb21lLnRhYnMucXVlcnlcbiAgICAgIGFjdGl2ZTp0cnVlXG4gICAgICBjdXJyZW50V2luZG93OnRydWVcbiAgICAsKHRhYnMpID0+XG4gICAgICBAY3VycmVudFRhYklkID0gdGFic1swXS5pZFxuICAgICAgY2I/IEBjdXJyZW50VGFiSWRcblxuICBsYXVuY2hBcHA6IChjYiwgZXJyb3IpIC0+XG4gICAgIyBuZWVkcyBtYW5hZ2VtZW50IHBlcm1pc3Npb24uIG9mZiBmb3Igbm93LlxuICAgIGNocm9tZS5tYW5hZ2VtZW50LmxhdW5jaEFwcCBAQVBQX0lELCAoZXh0SW5mbykgPT5cbiAgICAgIGlmIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxuICAgICAgICBlcnJvciBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IGV4dEluZm9cblxuICBvcGVuQXBwOiAoKSA9PlxuICAgICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJyxcbiAgICAgICAgaWQ6IFwibWFpbndpblwiXG4gICAgICAgIGJvdW5kczpcbiAgICAgICAgICB3aWR0aDo3NzBcbiAgICAgICAgICBoZWlnaHQ6ODAwLFxuICAgICAgKHdpbikgPT5cbiAgICAgICAgQGFwcFdpbmRvdyA9IHdpbikgXG5cbiAgZ2V0Q3VycmVudFRhYjogKGNiKSAtPlxuICAgICMgdHJpZWQgdG8ga2VlcCBvbmx5IGFjdGl2ZVRhYiBwZXJtaXNzaW9uLCBidXQgb2ggd2VsbC4uXG4gICAgY2hyb21lLnRhYnMucXVlcnlcbiAgICAgIGFjdGl2ZTp0cnVlXG4gICAgICBjdXJyZW50V2luZG93OnRydWVcbiAgICAsKHRhYnMpID0+XG4gICAgICBAY3VycmVudFRhYklkID0gdGFic1swXS5pZFxuICAgICAgY2I/IEBjdXJyZW50VGFiSWRcblxuICBnZXRSZXNvdXJjZXM6IChjYikgLT5cbiAgICBAZ2V0Q3VycmVudFRhYiAodGFiSWQpID0+XG4gICAgICBjaHJvbWUudGFicy5leGVjdXRlU2NyaXB0IHRhYklkLCBcbiAgICAgICAgZmlsZTonc2NyaXB0cy9jb250ZW50LmpzJywgKHJlc3VsdHMpID0+XG4gICAgICAgICAgQGRhdGEuY3VycmVudFJlc291cmNlcy5sZW5ndGggPSAwXG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIGNiPyhudWxsLCBAZGF0YS5jdXJyZW50UmVzb3VyY2VzKSBpZiBub3QgcmVzdWx0cz9cblxuICAgICAgICAgIGZvciByIGluIHJlc3VsdHNcbiAgICAgICAgICAgIGZvciByZXMgaW4gclxuICAgICAgICAgICAgICBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLnB1c2ggcmVzXG4gICAgICAgICAgY2I/IG51bGwsIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXNcblxuXG4gIGdldExvY2FsRmlsZTogKGluZm8sIGNiKSA9PlxuICAgIGZpbGVQYXRoID0gaW5mby51cmlcbiAgICAjIGZpbGVQYXRoID0gQGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3QgdXJsXG4gICAgcmV0dXJuIGNiICdmaWxlIG5vdCBmb3VuZCcgdW5sZXNzIGZpbGVQYXRoP1xuICAgIF9kaXJzID0gW11cbiAgICBfZGlycy5wdXNoIGRpciBmb3IgZGlyIGluIEBkYXRhLmRpcmVjdG9yaWVzIHdoZW4gZGlyLmlzT25cbiAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnN1YnN0cmluZyAxIGlmIGZpbGVQYXRoLnN1YnN0cmluZygwLDEpIGlzICcvJ1xuICAgIEBmaW5kRmlsZUZvclBhdGggX2RpcnMsIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcikgPT5cbiAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gY2I/IGVyclxuICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgIGNiPyBudWxsLGZpbGVFbnRyeSxmaWxlXG4gICAgICAsKGVycikgPT4gY2I/IGVyclxuXG5cbiAgc3RhcnRTZXJ2ZXI6IChjYikgLT5cbiAgICBpZiBAU2VydmVyLnN0YXR1cy5pc09uIGlzIGZhbHNlXG4gICAgICBAU2VydmVyLnN0YXJ0IG51bGwsbnVsbCxudWxsLCAoZXJyLCBzb2NrZXRJbmZvKSA9PlxuICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIkVycm9yIFN0YXJ0aW5nIFNlcnZlcjogI3sgZXJyIH1cIlxuICAgICAgICAgICAgY2I/IGVyclxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgU3RhcnRlZFwiLCBcIlN0YXJ0ZWQgU2VydmVyICN7IEBTZXJ2ZXIuc3RhdHVzLnVybCB9XCJcbiAgICAgICAgICAgIGNiPyBudWxsLCBAU2VydmVyLnN0YXR1c1xuICAgIGVsc2VcbiAgICAgIGNiPyAnYWxyZWFkeSBzdGFydGVkJ1xuXG4gIHN0b3BTZXJ2ZXI6IChjYikgLT5cbiAgICAgIEBTZXJ2ZXIuc3RvcCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBFcnJvclwiLFwiU2VydmVyIGNvdWxkIG5vdCBiZSBzdG9wcGVkOiAjeyBlcnJvciB9XCJcbiAgICAgICAgICBjYj8gZXJyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBATm90aWZ5ICdTZXJ2ZXIgU3RvcHBlZCcsIFwiU2VydmVyIFN0b3BwZWRcIlxuICAgICAgICAgIGNiPyBudWxsLCBAU2VydmVyLnN0YXR1c1xuXG4gIHJlc3RhcnRTZXJ2ZXI6IC0+XG4gICAgQHN0YXJ0U2VydmVyKClcblxuICBjaGFuZ2VQb3J0OiA9PlxuICBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0OiAodXJsKSAtPlxuICAgIGZpbGVQYXRoUmVnZXggPSAvXigoaHR0cFtzXT98ZnRwfGNocm9tZS1leHRlbnNpb258ZmlsZSk6XFwvXFwvKT9cXC8/KFteXFwvXFwuXStcXC4pKj8oW15cXC9cXC5dK1xcLlteOlxcL1xcc1xcLl17MiwzfShcXC5bXjpcXC9cXHNcXC5d4oCM4oCLezIsM30pPykoOlxcZCspPygkfFxcLykoW14jP1xcc10rKT8oLio/KT8oI1tcXHdcXC1dKyk/JC9cbiAgIFxuICAgIHJldHVybiBudWxsIHVubGVzcyBAZGF0YVtAY3VycmVudFRhYklkXT8ubWFwcz9cblxuICAgIHJlc1BhdGggPSB1cmwubWF0Y2goZmlsZVBhdGhSZWdleCk/WzhdXG4gICAgaWYgbm90IHJlc1BhdGg/XG4gICAgICAjIHRyeSByZWxwYXRoXG4gICAgICByZXNQYXRoID0gdXJsXG5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmVzUGF0aD9cbiAgICBcbiAgICBmb3IgbWFwIGluIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHNcbiAgICAgIHJlc1BhdGggPSB1cmwubWF0Y2gobmV3IFJlZ0V4cChtYXAudXJsKSk/IGFuZCBtYXAudXJsP1xuXG4gICAgICBpZiByZXNQYXRoXG4gICAgICAgIGlmIHJlZmVyZXI/XG4gICAgICAgICAgIyBUT0RPOiB0aGlzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWFwLnVybCksIG1hcC5yZWdleFJlcGxcbiAgICAgICAgYnJlYWtcbiAgICByZXR1cm4gZmlsZVBhdGhcblxuICBVUkx0b0xvY2FsUGF0aDogKHVybCwgY2IpIC0+XG4gICAgZmlsZVBhdGggPSBAUmVkaXJlY3QuZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdCB1cmxcblxuICBnZXRGaWxlTWF0Y2g6IChmaWxlUGF0aCwgY2IpIC0+XG4gICAgcmV0dXJuIGNiPyAnZmlsZSBub3QgZm91bmQnIHVubGVzcyBmaWxlUGF0aD9cbiAgICBzaG93ICd0cnlpbmcgJyArIGZpbGVQYXRoXG4gICAgQGZpbmRGaWxlRm9yUGF0aCBAZGF0YS5kaXJlY3RvcmllcywgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyZWN0b3J5KSA9PlxuXG4gICAgICBpZiBlcnI/IFxuICAgICAgICAjIHNob3cgJ25vIGZpbGVzIGZvdW5kIGZvciAnICsgZmlsZVBhdGhcbiAgICAgICAgcmV0dXJuIGNiPyBlcnJcblxuICAgICAgZGVsZXRlIGZpbGVFbnRyeS5lbnRyeVxuICAgICAgQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzW2ZpbGVQYXRoXSA9IFxuICAgICAgICBmaWxlRW50cnk6IGNocm9tZS5maWxlU3lzdGVtLnJldGFpbkVudHJ5IGZpbGVFbnRyeVxuICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGhcbiAgICAgICAgZGlyZWN0b3J5OiBkaXJlY3RvcnlcbiAgICAgIGNiPyBudWxsLCBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdLCBkaXJlY3RvcnlcbiAgICAgIFxuXG5cbiAgZmluZEZpbGVJbkRpcmVjdG9yaWVzOiAoZGlyZWN0b3JpZXMsIHBhdGgsIGNiKSAtPlxuICAgIG15RGlycyA9IGRpcmVjdG9yaWVzLnNsaWNlKCkgXG4gICAgX3BhdGggPSBwYXRoXG4gICAgX2RpciA9IG15RGlycy5zaGlmdCgpXG5cbiAgICBARlMuZ2V0TG9jYWxGaWxlRW50cnkgX2RpciwgX3BhdGgsIChlcnIsIGZpbGVFbnRyeSkgPT5cbiAgICAgIGlmIGVycj9cbiAgICAgICAgaWYgbXlEaXJzLmxlbmd0aCA+IDBcbiAgICAgICAgICBAZmluZEZpbGVJbkRpcmVjdG9yaWVzIG15RGlycywgX3BhdGgsIGNiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjYj8gJ25vdCBmb3VuZCdcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgX2RpclxuXG4gIGZpbmRGaWxlRm9yUGF0aDogKGRpcnMsIHBhdGgsIGNiKSAtPlxuICAgIEBmaW5kRmlsZUluRGlyZWN0b3JpZXMgZGlycywgcGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXJlY3RvcnkpID0+XG4gICAgICBpZiBlcnI/XG4gICAgICAgIGlmIHBhdGggaXMgcGF0aC5yZXBsYWNlKC8uKj9cXC8vLCAnJylcbiAgICAgICAgICBjYj8gJ25vdCBmb3VuZCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggZGlycywgcGF0aC5yZXBsYWNlKC8uKj9cXC8vLCAnJyksIGNiXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGRpcmVjdG9yeVxuICBcbiAgbWFwQWxsUmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldFJlc291cmNlcyA9PlxuICAgICAgbmVlZCA9IEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMubGVuZ3RoXG4gICAgICBmb3VuZCA9IG5vdEZvdW5kID0gMFxuICAgICAgZm9yIGl0ZW0gaW4gQGRhdGEuY3VycmVudFJlc291cmNlc1xuICAgICAgICBsb2NhbFBhdGggPSBAVVJMdG9Mb2NhbFBhdGggaXRlbS51cmxcbiAgICAgICAgaWYgbG9jYWxQYXRoP1xuICAgICAgICAgIEBnZXRGaWxlTWF0Y2ggbG9jYWxQYXRoLCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgICAgICAgbmVlZC0tXG4gICAgICAgICAgICBzaG93IGFyZ3VtZW50c1xuICAgICAgICAgICAgaWYgZXJyPyB0aGVuIG5vdEZvdW5kKytcbiAgICAgICAgICAgIGVsc2UgZm91bmQrKyAgICAgICAgICAgIFxuXG4gICAgICAgICAgICBpZiBuZWVkIGlzIDBcbiAgICAgICAgICAgICAgaWYgZm91bmQgPiAwXG4gICAgICAgICAgICAgICAgY2I/IG51bGwsICdkb25lJ1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2I/ICdub3RoaW5nIGZvdW5kJ1xuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBuZWVkLS1cbiAgICAgICAgICBub3RGb3VuZCsrXG4gICAgICAgICAgaWYgbmVlZCBpcyAwXG4gICAgICAgICAgICBjYj8gJ25vdGhpbmcgZm91bmQnXG5cbiAgc2V0QmFkZ2VUZXh0OiAodGV4dCwgdGFiSWQpIC0+XG4gICAgYmFkZ2VUZXh0ID0gdGV4dCB8fCAnJyArIE9iamVjdC5rZXlzKEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlcykubGVuZ3RoXG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0IFxuICAgICAgdGV4dDpiYWRnZVRleHRcbiAgICAgICMgdGFiSWQ6dGFiSWRcbiAgXG4gIHJlbW92ZUJhZGdlVGV4dDoodGFiSWQpIC0+XG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0IFxuICAgICAgdGV4dDonJ1xuICAgICAgIyB0YWJJZDp0YWJJZFxuXG4gIGxzUjogKGRpciwgb25zdWNjZXNzLCBvbmVycm9yKSAtPlxuICAgIEByZXN1bHRzID0ge31cblxuICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgXG4gICAgICB0b2RvID0gMFxuICAgICAgaWdub3JlID0gLy5naXR8LmlkZWF8bm9kZV9tb2R1bGVzfGJvd2VyX2NvbXBvbmVudHMvXG4gICAgICBkaXZlID0gKGRpciwgcmVzdWx0cykgLT5cbiAgICAgICAgdG9kbysrXG4gICAgICAgIHJlYWRlciA9IGRpci5jcmVhdGVSZWFkZXIoKVxuICAgICAgICByZWFkZXIucmVhZEVudHJpZXMgKGVudHJpZXMpIC0+XG4gICAgICAgICAgdG9kby0tXG4gICAgICAgICAgZm9yIGVudHJ5IGluIGVudHJpZXNcbiAgICAgICAgICAgIGRvIChlbnRyeSkgLT5cbiAgICAgICAgICAgICAgcmVzdWx0c1tlbnRyeS5mdWxsUGF0aF0gPSBlbnRyeVxuICAgICAgICAgICAgICBpZiBlbnRyeS5mdWxsUGF0aC5tYXRjaChpZ25vcmUpIGlzIG51bGxcbiAgICAgICAgICAgICAgICBpZiBlbnRyeS5pc0RpcmVjdG9yeVxuICAgICAgICAgICAgICAgICAgdG9kbysrXG4gICAgICAgICAgICAgICAgICBkaXZlIGVudHJ5LCByZXN1bHRzIFxuICAgICAgICAgICAgICAjIHNob3cgZW50cnlcbiAgICAgICAgICBzaG93ICdvbnN1Y2Nlc3MnIGlmIHRvZG8gaXMgMFxuICAgICAgICAgICMgc2hvdyAnb25zdWNjZXNzJyByZXN1bHRzIGlmIHRvZG8gaXMgMFxuICAgICAgICAsKGVycm9yKSAtPlxuICAgICAgICAgIHRvZG8tLVxuICAgICAgICAgICMgc2hvdyBlcnJvclxuICAgICAgICAgICMgb25lcnJvciBlcnJvciwgcmVzdWx0cyBpZiB0b2RvIGlzIDAgXG5cbiAgICAgICMgY29uc29sZS5sb2cgZGl2ZSBkaXJFbnRyeSwgQHJlc3VsdHMgIFxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb25cblxuXG4iLCJjbGFzcyBDb25maWdcbiAgIyBBUFBfSUQ6ICdjZWNpZmFmcGhlZ2hvZnBmZGtoZWtraWJjaWJoZ2ZlYydcbiAgIyBFWFRFTlNJT05fSUQ6ICdkZGRpbWJuamliamNhZmJva25iZ2hlaGJmYWpnZ2dlcCdcbiAgQVBQX0lEOiAnZGVuZWZkb29mbmtnam1wYmZwa25paHBnZGhhaHBibGgnXG4gIEVYVEVOU0lPTl9JRDogJ2lqY2ptcGVqb25taW1vb2ZiY3BhbGllamhpa2Flb21oJyAgXG4gIFNFTEZfSUQ6IGNocm9tZS5ydW50aW1lLmlkXG4gIGlzQ29udGVudFNjcmlwdDogbG9jYXRpb24ucHJvdG9jb2wgaXNudCAnY2hyb21lLWV4dGVuc2lvbjonXG4gIEVYVF9JRDogbnVsbFxuICBFWFRfVFlQRTogbnVsbFxuICBcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQEVYVF9JRCA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiBARVhURU5TSU9OX0lEIGVsc2UgQEFQUF9JRFxuICAgIEBFWFRfVFlQRSA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG4gICAgQFNFTEZfVFlQRSA9IGlmIEBBUFBfSUQgaXNudCBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcblxuICB3cmFwSW5ib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgICBfa2xhcyA9IG9ialxuICAgICAgQExJU1RFTi5FeHQgZm5hbWUsIChhcmdzKSAtPlxuICAgICAgICBpZiBhcmdzPy5pc1Byb3h5P1xuICAgICAgICAgIGlmIHR5cGVvZiBhcmd1bWVudHNbMV0gaXMgXCJmdW5jdGlvblwiXG4gICAgICAgICAgICBpZiBhcmdzLmFyZ3VtZW50cz8ubGVuZ3RoID49IDBcbiAgICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIGFyZ3MuYXJndW1lbnRzLmNvbmNhdCBhcmd1bWVudHNbMV0gXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBbXS5jb25jYXQgYXJndW1lbnRzWzFdXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgYXJndW1lbnRzXG5cbiAgd3JhcE9iakluYm91bmQ6IChvYmopIC0+XG4gICAgKG9ialtrZXldID0gQHdyYXBJbmJvdW5kIG9iaiwgb2JqLmNvbnN0cnVjdG9yLm5hbWUgKyAnLicgKyBrZXksIG9ialtrZXldKSBmb3Iga2V5IG9mIG9iaiB3aGVuIHR5cGVvZiBvYmpba2V5XSBpcyBcImZ1bmN0aW9uXCJcbiAgICBvYmpcblxuICB3cmFwT3V0Ym91bmQ6IChvYmosIGZuYW1lLCBmKSAtPlxuICAgIC0+XG4gICAgICBtc2cgPSB7fVxuICAgICAgbXNnW2ZuYW1lXSA9IFxuICAgICAgICBpc1Byb3h5OnRydWVcbiAgICAgICAgYXJndW1lbnRzOkFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuICAgICAgbXNnW2ZuYW1lXS5pc1Byb3h5ID0gdHJ1ZVxuICAgICAgX2FyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcblxuICAgICAgaWYgX2FyZ3MubGVuZ3RoIGlzIDBcbiAgICAgICAgbXNnW2ZuYW1lXS5hcmd1bWVudHMgPSB1bmRlZmluZWQgXG4gICAgICAgIHJldHVybiBATVNHLkV4dCBtc2csICgpIC0+IHVuZGVmaW5lZFxuXG4gICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cyA9IF9hcmdzXG5cbiAgICAgIGNhbGxiYWNrID0gbXNnW2ZuYW1lXS5hcmd1bWVudHMucG9wKClcbiAgICAgIGlmIHR5cGVvZiBjYWxsYmFjayBpc250IFwiZnVuY3Rpb25cIlxuICAgICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cy5wdXNoIGNhbGxiYWNrXG4gICAgICAgIEBNU0cuRXh0IG1zZywgKCkgLT4gdW5kZWZpbmVkXG4gICAgICBlbHNlXG4gICAgICAgIEBNU0cuRXh0IG1zZywgKCkgPT5cbiAgICAgICAgICBhcmd6ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG4gICAgICAgICAgIyBwcm94eUFyZ3MgPSBbaXNQcm94eTphcmd6XVxuICAgICAgICAgIGlmIGFyZ3o/Lmxlbmd0aCA+IDAgYW5kIGFyZ3pbMF0/LmlzUHJveHk/XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseSBALCBhcmd6WzBdLmlzUHJveHkgXG5cbiAgd3JhcE9iak91dGJvdW5kOiAob2JqKSAtPlxuICAgIChvYmpba2V5XSA9IEB3cmFwT3V0Ym91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpZyIsIkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcblxuY2xhc3MgRmlsZVN5c3RlbVxuICBhcGk6IGNocm9tZS5maWxlU3lzdGVtXG4gIHJldGFpbmVkRGlyczoge31cbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIHBsYXRmb3JtOicnXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIGNocm9tZS5ydW50aW1lLmdldFBsYXRmb3JtSW5mbyAoaW5mbykgPT5cbiAgICAgIEBwbGF0Zm9ybSA9IGluZm9cbiAgIyBAZGlyczogbmV3IERpcmVjdG9yeVN0b3JlXG4gICMgZmlsZVRvQXJyYXlCdWZmZXI6IChibG9iLCBvbmxvYWQsIG9uZXJyb3IpIC0+XG4gICMgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICMgICByZWFkZXIub25sb2FkID0gb25sb2FkXG5cbiAgIyAgIHJlYWRlci5vbmVycm9yID0gb25lcnJvclxuXG4gICMgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgYmxvYlxuXG4gIHJlYWRGaWxlOiAoZGlyRW50cnksIHBhdGgsIGNiKSAtPlxuICAgICMgcGF0aCA9IHBhdGgucmVwbGFjZSgvXFwvL2csJ1xcXFwnKSBpZiBwbGF0Zm9ybSBpcyAnd2luJ1xuICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIHBhdGgsXG4gICAgICAoZXJyLCBmaWxlRW50cnkpID0+XG4gICAgICAgIFxuICAgICAgICBpZiBlcnI/IHRoZW4gcmV0dXJuIGNiPyBlcnJcblxuICAgICAgICBmaWxlRW50cnkuZmlsZSAoZmlsZSkgPT5cbiAgICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBmaWxlXG4gICAgICAgICwoZXJyKSA9PiBjYj8gZXJyXG5cbiAgZ2V0RmlsZUVudHJ5OiAoZGlyRW50cnksIHBhdGgsIGNiKSAtPlxuICAgICMgcGF0aCA9IHBhdGgucmVwbGFjZSgvXFwvL2csJ1xcXFwnKSBpZiBwbGF0Zm9ybSBpcyAnd2luJ1xuICAgIGRpckVudHJ5LmdldEZpbGUgcGF0aCwge30sIChmaWxlRW50cnkpID0+XG4gICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5XG4gICAgLChlcnIpID0+IGNiPyBlcnJcblxuICAjIG9wZW5EaXJlY3Rvcnk6IChjYWxsYmFjaykgLT5cbiAgb3BlbkRpcmVjdG9yeTogKGRpcmVjdG9yeUVudHJ5LCBjYikgLT5cbiAgIyBAYXBpLmNob29zZUVudHJ5IHR5cGU6J29wZW5EaXJlY3RvcnknLCAoZGlyZWN0b3J5RW50cnksIGZpbGVzKSA9PlxuICAgIEBhcGkuZ2V0RGlzcGxheVBhdGggZGlyZWN0b3J5RW50cnksIChwYXRoTmFtZSkgPT5cbiAgICAgIGRpciA9XG4gICAgICAgICAgcmVsUGF0aDogZGlyZWN0b3J5RW50cnkuZnVsbFBhdGggIy5yZXBsYWNlKCcvJyArIGRpcmVjdG9yeUVudHJ5Lm5hbWUsICcnKVxuICAgICAgICAgIGRpcmVjdG9yeUVudHJ5SWQ6IEBhcGkucmV0YWluRW50cnkoZGlyZWN0b3J5RW50cnkpXG4gICAgICAgICAgZW50cnk6IGRpcmVjdG9yeUVudHJ5XG4gICAgICBjYj8gbnVsbCwgcGF0aE5hbWUsIGRpclxuICAgICAgICAgICMgQGdldE9uZURpckxpc3QgZGlyXG4gICAgICAgICAgIyBTdG9yYWdlLnNhdmUgJ2RpcmVjdG9yaWVzJywgQHNjb3BlLmRpcmVjdG9yaWVzIChyZXN1bHQpIC0+XG5cbiAgZ2V0TG9jYWxGaWxlRW50cnk6IChkaXIsIGZpbGVQYXRoLCBjYikgPT4gXG4gICAgIyBmaWxlUGF0aCA9IGZpbGVQYXRoLnJlcGxhY2UoL1xcLy9nLCdcXFxcJykgaWYgcGxhdGZvcm0gaXMgJ3dpbidcbiAgICBkaXJFbnRyeSA9IGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKCkgLT5cbiAgICBpZiBub3QgZGlyRW50cnk/XG4gICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgICAgICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgZmlsZVBhdGgsIGNiXG4gICAgZWxzZVxuICAgICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgZmlsZVBhdGgsIGNiXG5cblxuXG4gICMgZ2V0TG9jYWxGaWxlOiAoZGlyLCBmaWxlUGF0aCwgY2IsIGVycm9yKSA9PiBcbiAgIyAjIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAjICMgICBkaXJFbnRyeSA9IEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdXG4gICMgIyAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgIyAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAjICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAjICAgICAsKF9lcnJvcikgPT4gZXJyb3IoX2Vycm9yKVxuICAjICMgZWxzZVxuICAjICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICMgICAgICMgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0gPSBkaXJFbnRyeVxuICAjICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgaWYgZXJyPyB0aGVuIGNiPyBlcnJcbiAgIyAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBmaWxlXG4gICMgICAsKF9lcnJvcikgPT4gY2I/KF9lcnJvcilcblxuICAgICAgIyBAZmluZEZpbGVGb3JRdWVyeVN0cmluZyBpbmZvLnVyaSwgc3VjY2VzcyxcbiAgICAgICMgICAgIChlcnIpID0+XG4gICAgICAjICAgICAgICAgQGZpbmRGaWxlRm9yUGF0aCBpbmZvLCBjYlxuXG4gICMgZmluZEZpbGVGb3JQYXRoOiAoaW5mbywgY2IpID0+XG4gICMgICAgIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBjYiwgaW5mby5yZWZlcmVyXG5cbiAgIyBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nOiAoX3VybCwgY2IsIGVycm9yLCByZWZlcmVyKSA9PlxuICAjICAgICB1cmwgPSBkZWNvZGVVUklDb21wb25lbnQoX3VybCkucmVwbGFjZSAvLio/c2xyZWRpclxcPS8sICcnXG5cbiAgIyAgICAgbWF0Y2ggPSBpdGVtIGZvciBpdGVtIGluIEBtYXBzIHdoZW4gdXJsLm1hdGNoKG5ldyBSZWdFeHAoaXRlbS51cmwpKT8gYW5kIGl0ZW0udXJsPyBhbmQgbm90IG1hdGNoP1xuXG4gICMgICAgIGlmIG1hdGNoP1xuICAjICAgICAgICAgaWYgcmVmZXJlcj9cbiAgIyAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5tYXRjaCgvLipcXC9cXC8uKj9cXC8oLiopLyk/WzFdXG4gICMgICAgICAgICBlbHNlXG4gICMgICAgICAgICAgICAgZmlsZVBhdGggPSB1cmwucmVwbGFjZSBuZXcgUmVnRXhwKG1hdGNoLnVybCksIG1hdGNoLnJlZ2V4UmVwbFxuXG4gICMgICAgICAgICBmaWxlUGF0aC5yZXBsYWNlICcvJywgJ1xcXFwnIGlmIHBsYXRmb3JtIGlzICd3aW4nXG5cbiAgIyAgICAgICAgIGRpciA9IEBTdG9yYWdlLmRhdGEuZGlyZWN0b3JpZXNbbWF0Y2guZGlyZWN0b3J5XVxuXG4gICMgICAgICAgICBpZiBub3QgZGlyPyB0aGVuIHJldHVybiBlcnIgJ25vIG1hdGNoJ1xuXG4gICMgICAgICAgICBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgIyAgICAgICAgICAgICBkaXJFbnRyeSA9IEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdXG4gICMgICAgICAgICAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgICAgIGVsc2VcbiAgIyAgICAgICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0gPSBkaXJFbnRyeVxuICAjICAgICAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICAgICAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICAgICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgIGVsc2VcbiAgIyAgICAgICAgIGVycm9yKClcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlU3lzdGVtIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBMSVNURU4gZXh0ZW5kcyBDb25maWdcbiAgbG9jYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGV4dGVybmFsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWxcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGluc3RhbmNlID0gbnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuXG4gICAgQGxvY2FsLmFwaS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZVxuICAgIEBleHRlcm5hbC5hcGk/LmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICBAZ2V0OiAoKSAtPlxuICAgIGluc3RhbmNlID89IG5ldyBMSVNURU5cblxuICBzZXRQb3J0OiAocG9ydCkgLT5cbiAgICBAcG9ydCA9IHBvcnRcbiAgICBwb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgTG9jYWw6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICBAbG9jYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBFeHQ6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICAjIHNob3cgJ2FkZGluZyBleHQgbGlzdGVuZXIgZm9yICcgKyBtZXNzYWdlXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgX29uTWVzc2FnZUV4dGVybmFsOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgcmVzcG9uc2VTdGF0dXMgPSBjYWxsZWQ6ZmFsc2VcblxuICAgIF9zZW5kUmVzcG9uc2UgPSAod2hhdGV2ZXIuLi4pID0+XG4gICAgICB0cnlcbiAgICAgICAgIyB3aGF0ZXZlci5zaGlmdCgpIGlmIHdoYXRldmVyWzBdIGlzIG51bGwgYW5kIHdoYXRldmVyWzFdP1xuICAgICAgICBzZW5kUmVzcG9uc2UuYXBwbHkgbnVsbCxwcm94eUFyZ3MgPSBbaXNQcm94eTp3aGF0ZXZlcl1cblxuICAgICAgY2F0Y2ggZVxuICAgICAgICB1bmRlZmluZWQgIyBlcnJvciBiZWNhdXNlIG5vIHJlc3BvbnNlIHdhcyByZXF1ZXN0ZWQgZnJvbSB0aGUgTVNHLCBkb24ndCBjYXJlXG4gICAgICByZXNwb25zZVN0YXR1cy5jYWxsZWQgPSB0cnVlXG4gICAgICBcbiAgICAjIChzaG93IFwiPD09IEdPVCBFWFRFUk5BTCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgaWYgc2VuZGVyLmlkPyBcbiAgICAgIGlmIHNlbmRlci5pZCBpc250IEBFWFRfSUQgI2FuZCBzZW5kZXIuY29uc3RydWN0b3IubmFtZSBpc250ICdQb3J0J1xuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgIEBleHRlcm5hbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBfc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuICAgIFxuICAgIHVubGVzcyByZXNwb25zZVN0YXR1cy5jYWxsZWQgIyBmb3Igc3luY2hyb25vdXMgc2VuZFJlc3BvbnNlXG4gICAgICAjIHNob3cgJ3JldHVybmluZyB0cnVlJ1xuICAgICAgcmV0dXJuIHRydWVcblxuICBfb25NZXNzYWdlOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgcmVzcG9uc2VTdGF0dXMgPSBjYWxsZWQ6ZmFsc2VcbiAgICBfc2VuZFJlc3BvbnNlID0gPT5cbiAgICAgIHRyeVxuICAgICAgICAjIHNob3cgJ2NhbGxpbmcgc2VuZHJlc3BvbnNlJ1xuICAgICAgICBzZW5kUmVzcG9uc2UuYXBwbHkgdGhpcyxhcmd1bWVudHNcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgIyBzaG93IGVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcblxuICAgICMgKHNob3cgXCI8PT0gR09UIE1FU1NBR0UgPT0gI3sgQEVYVF9UWVBFIH0gPT1cIiArIF9rZXkpIGZvciBfa2V5IG9mIHJlcXVlc3RcbiAgICBAbG9jYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgX3NlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcblxuICAgIHVubGVzcyByZXNwb25zZVN0YXR1cy5jYWxsZWRcbiAgICAgICMgc2hvdyAncmV0dXJuaW5nIHRydWUnXG4gICAgICByZXR1cm4gdHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IExJU1RFTiIsIkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcblxuY2xhc3MgTVNHIGV4dGVuZHMgQ29uZmlnXG4gIGluc3RhbmNlID0gbnVsbFxuICBwb3J0Om51bGxcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcblxuICBAZ2V0OiAoKSAtPlxuICAgIGluc3RhbmNlID89IG5ldyBNU0dcblxuICBAY3JlYXRlUG9ydDogKCkgLT5cblxuICBzZXRQb3J0OiAocG9ydCkgLT5cbiAgICBAcG9ydCA9IHBvcnRcblxuICBMb2NhbDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0OiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICAoc2hvdyBcIj09IE1FU1NBR0UgRVhURVJOQUwgI3sgX2tleSB9ID09PlwiKSBmb3IgX2tleSBvZiBtZXNzYWdlXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgQEVYVF9JRCwgbWVzc2FnZSwgcmVzcG9uZFxuICBFeHRQb3J0OiAobWVzc2FnZSkgLT5cbiAgICB0cnlcbiAgICAgIEBwb3J0LnBvc3RNZXNzYWdlIG1lc3NhZ2VcbiAgICBjYXRjaFxuICAgICAgc2hvdyAnZXJyb3InXG4gICAgICAjIEBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuICAgICAgIyBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG5cbm1vZHVsZS5leHBvcnRzID0gTVNHIiwiLyoqXG4gKiBERVZFTE9QRUQgQllcbiAqIEdJTCBMT1BFUyBCVUVOT1xuICogZ2lsYnVlbm8ubWFpbEBnbWFpbC5jb21cbiAqXG4gKiBXT1JLUyBXSVRIOlxuICogSUUgOSssIEZGIDQrLCBTRiA1KywgV2ViS2l0LCBDSCA3KywgT1AgMTIrLCBCRVNFTiwgUmhpbm8gMS43K1xuICpcbiAqIEZPUks6XG4gKiBodHRwczovL2dpdGh1Yi5jb20vbWVsYW5rZS9XYXRjaC5KU1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgICAgIC8vIGxpa2UgTm9kZS5cbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIHdpbmRvdy5XYXRjaEpTID0gZmFjdG9yeSgpO1xuICAgICAgICB3aW5kb3cud2F0Y2ggPSB3aW5kb3cuV2F0Y2hKUy53YXRjaDtcbiAgICAgICAgd2luZG93LnVud2F0Y2ggPSB3aW5kb3cuV2F0Y2hKUy51bndhdGNoO1xuICAgICAgICB3aW5kb3cuY2FsbFdhdGNoZXJzID0gd2luZG93LldhdGNoSlMuY2FsbFdhdGNoZXJzO1xuICAgIH1cbn0oZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIFdhdGNoSlMgPSB7XG4gICAgICAgIG5vTW9yZTogZmFsc2VcbiAgICB9LFxuICAgIGxlbmd0aHN1YmplY3RzID0gW107XG5cbiAgICB2YXIgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIChmdW5jdGlvblRvQ2hlY2spIHtcbiAgICAgICAgICAgIHZhciBnZXRUeXBlID0ge307XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb25Ub0NoZWNrICYmIGdldFR5cGUudG9TdHJpbmcuY2FsbChmdW5jdGlvblRvQ2hlY2spID09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gICAgfTtcblxuICAgIHZhciBpc0ludCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiB4ICUgMSA9PT0gMDtcbiAgICB9O1xuXG4gICAgdmFyIGlzQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0T2JqRGlmZiA9IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICB2YXIgYXBsdXMgPSBbXSxcbiAgICAgICAgYnBsdXMgPSBbXTtcblxuICAgICAgICBpZighKHR5cGVvZiBhID09IFwic3RyaW5nXCIpICYmICEodHlwZW9mIGIgPT0gXCJzdHJpbmdcIikpe1xuXG4gICAgICAgICAgICBpZiAoaXNBcnJheShhKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiW2ldID09PSB1bmRlZmluZWQpIGFwbHVzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gYSl7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihiW2ldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGx1cy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNBcnJheShiKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGo9MDsgajxiLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhW2pdID09PSB1bmRlZmluZWQpIGJwbHVzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGogaW4gYil7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiLmhhc093blByb3BlcnR5KGopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhW2pdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicGx1cy5wdXNoKGopO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFkZGVkOiBhcGx1cyxcbiAgICAgICAgICAgIHJlbW92ZWQ6IGJwbHVzXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGNsb25lID0gZnVuY3Rpb24ob2JqKXtcblxuICAgICAgICBpZiAobnVsbCA9PSBvYmogfHwgXCJvYmplY3RcIiAhPSB0eXBlb2Ygb2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvcHkgPSBvYmouY29uc3RydWN0b3IoKTtcblxuICAgICAgICBmb3IgKHZhciBhdHRyIGluIG9iaikge1xuICAgICAgICAgICAgY29weVthdHRyXSA9IG9ialthdHRyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb3B5O1xuXG4gICAgfVxuXG4gICAgdmFyIGRlZmluZUdldEFuZFNldCA9IGZ1bmN0aW9uIChvYmosIHByb3BOYW1lLCBnZXR0ZXIsIHNldHRlcikge1xuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICBPYmplY3Qub2JzZXJ2ZShvYmpbcHJvcE5hbWVdLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICBzZXR0ZXIoZGF0YSk7IC8vVE9ETzogYWRhcHQgb3VyIGNhbGxiYWNrIGRhdGEgdG8gbWF0Y2ggT2JqZWN0Lm9ic2VydmUgZGF0YSBzcGVjXG4gICAgICAgICAgICB9KTsgXG5cbiAgICAgICAgfSBjYXRjaChlKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3BOYW1lLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBnZXR0ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0OiBzZXR0ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoKGUyKSB7XG4gICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLl9fZGVmaW5lR2V0dGVyX18uY2FsbChvYmosIHByb3BOYW1lLCBnZXR0ZXIpO1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLl9fZGVmaW5lU2V0dGVyX18uY2FsbChvYmosIHByb3BOYW1lLCBzZXR0ZXIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2goZTMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwid2F0Y2hKUyBlcnJvcjogYnJvd3NlciBub3Qgc3VwcG9ydGVkIDovXCIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGRlZmluZVByb3AgPSBmdW5jdGlvbiAob2JqLCBwcm9wTmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3BOYW1lLCB7XG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBvYmpbcHJvcE5hbWVdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHdhdGNoID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHdhdGNoQWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB3YXRjaE1hbnkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdhdGNoT25lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cblxuICAgIHZhciB3YXRjaEFsbCA9IGZ1bmN0aW9uIChvYmosIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKSB7XG5cbiAgICAgICAgaWYgKCh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHJvcHMgPSBbXTtcblxuXG4gICAgICAgIGlmKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCA9IDA7IHByb3AgPCBvYmoubGVuZ3RoOyBwcm9wKyspIHsgLy9mb3IgZWFjaCBpdGVtIGlmIG9iaiBpcyBhbiBhcnJheVxuICAgICAgICAgICAgICAgIHByb3BzLnB1c2gocHJvcCk7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcDIgaW4gb2JqKSB7IC8vZm9yIGVhY2ggYXR0cmlidXRlIGlmIG9iaiBpcyBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3AyKSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3AyKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgd2F0Y2hNYW55KG9iaiwgcHJvcHMsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKTsgLy93YXRjaCBhbGwgaXRlbXMgb2YgdGhlIHByb3BzXG5cbiAgICAgICAgaWYgKGFkZE5SZW1vdmUpIHtcbiAgICAgICAgICAgIHB1c2hUb0xlbmd0aFN1YmplY3RzKG9iaiwgXCIkJHdhdGNobGVuZ3Roc3ViamVjdHJvb3RcIiwgd2F0Y2hlciwgbGV2ZWwpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdmFyIHdhdGNoTWFueSA9IGZ1bmN0aW9uIChvYmosIHByb3BzLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCkge1xuXG4gICAgICAgIGlmICgodHlwZW9mIG9iaiA9PSBcInN0cmluZ1wiKSB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHByb3BzLmxlbmd0aDsgaSsrKSB7IC8vd2F0Y2ggZWFjaCBwcm9wZXJ0eVxuICAgICAgICAgICAgdmFyIHByb3AgPSBwcm9wc1tpXTtcbiAgICAgICAgICAgIHdhdGNoT25lKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHdhdGNoT25lID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpIHtcblxuICAgICAgICBpZiAoKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGlzRnVuY3Rpb24ob2JqW3Byb3BdKSkgeyAvL2RvbnQgd2F0Y2ggaWYgaXQgaXMgYSBmdW5jdGlvblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYob2JqW3Byb3BdICE9IG51bGwgJiYgKGxldmVsID09PSB1bmRlZmluZWQgfHwgbGV2ZWwgPiAwKSl7XG4gICAgICAgICAgICB3YXRjaEFsbChvYmpbcHJvcF0sIHdhdGNoZXIsIGxldmVsIT09dW5kZWZpbmVkPyBsZXZlbC0xIDogbGV2ZWwsbnVsbCwgcGF0aCArICcuJyArIHByb3ApOyAvL3JlY3Vyc2l2ZWx5IHdhdGNoIGFsbCBhdHRyaWJ1dGVzIG9mIHRoaXNcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmluZVdhdGNoZXIob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgcGF0aCk7XG5cbiAgICAgICAgaWYoYWRkTlJlbW92ZSAmJiAobGV2ZWwgPT09IHVuZGVmaW5lZCB8fCBsZXZlbCA+IDApKXtcbiAgICAgICAgICAgIHB1c2hUb0xlbmd0aFN1YmplY3RzKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHVud2F0Y2ggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24oYXJndW1lbnRzWzFdKSkge1xuICAgICAgICAgICAgdW53YXRjaEFsbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoYXJndW1lbnRzWzFdKSkge1xuICAgICAgICAgICAgdW53YXRjaE1hbnkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVud2F0Y2hPbmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB1bndhdGNoQWxsID0gZnVuY3Rpb24gKG9iaiwgd2F0Y2hlcikge1xuXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBTdHJpbmcgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCA9IDA7IHByb3AgPCBvYmoubGVuZ3RoOyBwcm9wKyspIHsgLy9mb3IgZWFjaCBpdGVtIGlmIG9iaiBpcyBhbiBhcnJheVxuICAgICAgICAgICAgICAgIHByb3BzLnB1c2gocHJvcCk7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdW53YXRjaE1hbnkob2JqLCBwcm9wcywgd2F0Y2hlcik7IC8vd2F0Y2ggYWxsIGl0ZW5zIG9mIHRoZSBwcm9wc1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHVud2F0Y2hQcm9wc0luT2JqZWN0ID0gZnVuY3Rpb24gKG9iajIpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBvYmoyKSB7IC8vZm9yIGVhY2ggYXR0cmlidXRlIGlmIG9iaiBpcyBhbiBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iajIuaGFzT3duUHJvcGVydHkocHJvcDIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2JqMltwcm9wMl0gaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bndhdGNoUHJvcHNJbk9iamVjdChvYmoyW3Byb3AyXSk7IC8vcmVjdXJzIGludG8gb2JqZWN0IHByb3BzXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2gocHJvcDIpOyAvL3B1dCBpbiB0aGUgcHJvcHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB1bndhdGNoTWFueShvYmoyLCBwcm9wcywgd2F0Y2hlcik7IC8vdW53YXRjaCBhbGwgb2YgdGhlIHByb3BzXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdW53YXRjaFByb3BzSW5PYmplY3Qob2JqKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIHZhciB1bndhdGNoTWFueSA9IGZ1bmN0aW9uIChvYmosIHByb3BzLCB3YXRjaGVyKSB7XG5cbiAgICAgICAgZm9yICh2YXIgcHJvcDIgaW4gcHJvcHMpIHsgLy93YXRjaCBlYWNoIGF0dHJpYnV0ZSBvZiBcInByb3BzXCIgaWYgaXMgYW4gb2JqZWN0XG4gICAgICAgICAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkocHJvcDIpKSB7XG4gICAgICAgICAgICAgICAgdW53YXRjaE9uZShvYmosIHByb3BzW3Byb3AyXSwgd2F0Y2hlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGRlZmluZVdhdGNoZXIgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgcGF0aCkge1xuXG4gICAgICAgIHZhciB2YWwgPSBvYmpbcHJvcF07XG5cbiAgICAgICAgd2F0Y2hGdW5jdGlvbnMob2JqLCBwcm9wKTtcblxuICAgICAgICBpZiAoIW9iai53YXRjaGVycykge1xuICAgICAgICAgICAgZGVmaW5lUHJvcChvYmosIFwid2F0Y2hlcnNcIiwge30pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIW9iai5fcGF0aCkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcChvYmosIFwiX3BhdGhcIiwgcGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9iai53YXRjaGVyc1twcm9wXSkge1xuICAgICAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZihvYmoud2F0Y2hlcnNbcHJvcF1baV0gPT09IHdhdGNoZXIpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdLnB1c2god2F0Y2hlcik7IC8vYWRkIHRoZSBuZXcgd2F0Y2hlciBpbiB0aGUgd2F0Y2hlcnMgYXJyYXlcblxuXG4gICAgICAgIHZhciBnZXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgdmFyIHNldHRlciA9IGZ1bmN0aW9uIChuZXd2YWwpIHtcbiAgICAgICAgICAgIHZhciBvbGR2YWwgPSB2YWw7XG4gICAgICAgICAgICB2YWwgPSBuZXd2YWw7XG5cbiAgICAgICAgICAgIGlmIChsZXZlbCAhPT0gMCAmJiBvYmpbcHJvcF0pe1xuICAgICAgICAgICAgICAgIC8vIHdhdGNoIHN1YiBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgd2F0Y2hBbGwob2JqW3Byb3BdLCB3YXRjaGVyLCAobGV2ZWw9PT11bmRlZmluZWQpP2xldmVsOmxldmVsLTEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3YXRjaEZ1bmN0aW9ucyhvYmosIHByb3ApO1xuXG4gICAgICAgICAgICBpZiAoIVdhdGNoSlMubm9Nb3JlKXtcbiAgICAgICAgICAgICAgICAvL2lmIChKU09OLnN0cmluZ2lmeShvbGR2YWwpICE9PSBKU09OLnN0cmluZ2lmeShuZXd2YWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZHZhbCAhPT0gbmV3dmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxXYXRjaGVycyhvYmosIHByb3AsIFwic2V0XCIsIG5ld3ZhbCwgb2xkdmFsKTtcbiAgICAgICAgICAgICAgICAgICAgV2F0Y2hKUy5ub01vcmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZGVmaW5lR2V0QW5kU2V0KG9iaiwgcHJvcCwgZ2V0dGVyLCBzZXR0ZXIpO1xuXG4gICAgfTtcblxuICAgIHZhciBjYWxsV2F0Y2hlcnMgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCBhY3Rpb24sIG5ld3ZhbCwgb2xkdmFsKSB7XG4gICAgICAgIGlmIChwcm9wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHdyPTA7IHdyPG9iai53YXRjaGVyc1twcm9wXS5sZW5ndGg7IHdyKyspIHtcbiAgICAgICAgICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF1bd3JdLmNhbGwob2JqLCBwcm9wLCBhY3Rpb24sIG5ld3ZhbCwgb2xkdmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gb2JqKSB7Ly9jYWxsIGFsbFxuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKG9iaiwgcHJvcCwgYWN0aW9uLCBuZXd2YWwsIG9sZHZhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEB0b2RvIGNvZGUgcmVsYXRlZCB0byBcIndhdGNoRnVuY3Rpb25zXCIgaXMgY2VydGFpbmx5IGJ1Z2d5XG4gICAgdmFyIG1ldGhvZE5hbWVzID0gWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc2xpY2UnLCAndW5zaGlmdCcsICdzcGxpY2UnXTtcbiAgICB2YXIgZGVmaW5lQXJyYXlNZXRob2RXYXRjaGVyID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgb3JpZ2luYWwsIG1ldGhvZE5hbWUpIHtcbiAgICAgICAgZGVmaW5lUHJvcChvYmpbcHJvcF0sIG1ldGhvZE5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IG9yaWdpbmFsLmFwcGx5KG9ialtwcm9wXSwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHdhdGNoT25lKG9iaiwgb2JqW3Byb3BdKTtcbiAgICAgICAgICAgIGlmIChtZXRob2ROYW1lICE9PSAnc2xpY2UnKSB7XG4gICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKG9iaiwgcHJvcCwgbWV0aG9kTmFtZSxhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHdhdGNoRnVuY3Rpb25zID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7XG5cbiAgICAgICAgaWYgKCghb2JqW3Byb3BdKSB8fCAob2JqW3Byb3BdIGluc3RhbmNlb2YgU3RyaW5nKSB8fCAoIWlzQXJyYXkob2JqW3Byb3BdKSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSBtZXRob2ROYW1lcy5sZW5ndGgsIG1ldGhvZE5hbWU7IGktLTspIHtcbiAgICAgICAgICAgIG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgICAgICAgIGRlZmluZUFycmF5TWV0aG9kV2F0Y2hlcihvYmosIHByb3AsIG9ialtwcm9wXVttZXRob2ROYW1lXSwgbWV0aG9kTmFtZSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgdW53YXRjaE9uZSA9IGZ1bmN0aW9uIChvYmosIHByb3AsIHdhdGNoZXIpIHtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPG9iai53YXRjaGVyc1twcm9wXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHcgPSBvYmoud2F0Y2hlcnNbcHJvcF1baV07XG5cbiAgICAgICAgICAgIGlmKHcgPT0gd2F0Y2hlcikge1xuICAgICAgICAgICAgICAgIG9iai53YXRjaGVyc1twcm9wXS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZW1vdmVGcm9tTGVuZ3RoU3ViamVjdHMob2JqLCBwcm9wLCB3YXRjaGVyKTtcbiAgICB9O1xuXG4gICAgdmFyIGxvb3AgPSBmdW5jdGlvbigpe1xuXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPGxlbmd0aHN1YmplY3RzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIHZhciBzdWJqID0gbGVuZ3Roc3ViamVjdHNbaV07XG5cbiAgICAgICAgICAgIGlmIChzdWJqLnByb3AgPT09IFwiJCR3YXRjaGxlbmd0aHN1YmplY3Ryb290XCIpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWZmZXJlbmNlID0gZ2V0T2JqRGlmZihzdWJqLm9iaiwgc3Viai5hY3R1YWwpO1xuXG4gICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGggfHwgZGlmZmVyZW5jZS5yZW1vdmVkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQgIT0gZGlmZmVyZW5jZS5yZW1vdmVkICYmIChkaWZmZXJlbmNlLmFkZGVkWzBdICE9IGRpZmZlcmVuY2UucmVtb3ZlZFswXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaE1hbnkoc3Viai5vYmosIGRpZmZlcmVuY2UuYWRkZWQsIHN1Ymoud2F0Y2hlciwgc3Viai5sZXZlbCAtIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJqLndhdGNoZXIuY2FsbChzdWJqLm9iaiwgXCJyb290XCIsIFwiZGlmZmVyZW50YXR0clwiLCBkaWZmZXJlbmNlLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3Viai5hY3R1YWwgPSBjbG9uZShzdWJqLm9iaik7XG5cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZihzdWJqLm9ialtzdWJqLnByb3BdID09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgICAgICB2YXIgZGlmZmVyZW5jZSA9IGdldE9iakRpZmYoc3Viai5vYmpbc3Viai5wcm9wXSwgc3Viai5hY3R1YWwpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGggfHwgZGlmZmVyZW5jZS5yZW1vdmVkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGo9MDsgajxzdWJqLm9iai53YXRjaGVyc1tzdWJqLnByb3BdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hNYW55KHN1Ymoub2JqW3N1YmoucHJvcF0sIGRpZmZlcmVuY2UuYWRkZWQsIHN1Ymoub2JqLndhdGNoZXJzW3N1YmoucHJvcF1bal0sIHN1YmoubGV2ZWwgLSAxLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxXYXRjaGVycyhzdWJqLm9iaiwgc3Viai5wcm9wLCBcImRpZmZlcmVudGF0dHJcIiwgZGlmZmVyZW5jZSwgc3Viai5hY3R1YWwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN1YmouYWN0dWFsID0gY2xvbmUoc3Viai5vYmpbc3Viai5wcm9wXSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHB1c2hUb0xlbmd0aFN1YmplY3RzID0gZnVuY3Rpb24ob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCl7XG4gICAgICAgIFxuICAgICAgICB2YXIgYWN0dWFsO1xuXG4gICAgICAgIGlmIChwcm9wID09PSBcIiQkd2F0Y2hsZW5ndGhzdWJqZWN0cm9vdFwiKSB7XG4gICAgICAgICAgICBhY3R1YWwgPSAgY2xvbmUob2JqKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjdHVhbCA9IGNsb25lKG9ialtwcm9wXSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZW5ndGhzdWJqZWN0cy5wdXNoKHtcbiAgICAgICAgICAgIG9iajogb2JqLFxuICAgICAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgICAgIGFjdHVhbDogYWN0dWFsLFxuICAgICAgICAgICAgd2F0Y2hlcjogd2F0Y2hlcixcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHJlbW92ZUZyb21MZW5ndGhTdWJqZWN0cyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCwgd2F0Y2hlcil7XG5cbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPGxlbmd0aHN1YmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc3ViaiA9IGxlbmd0aHN1YmplY3RzW2ldO1xuXG4gICAgICAgICAgICBpZiAoc3Viai5vYmogPT0gb2JqICYmIHN1YmoucHJvcCA9PSBwcm9wICYmIHN1Ymoud2F0Y2hlciA9PSB3YXRjaGVyKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3Roc3ViamVjdHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgc2V0SW50ZXJ2YWwobG9vcCwgNTApO1xuXG4gICAgV2F0Y2hKUy53YXRjaCA9IHdhdGNoO1xuICAgIFdhdGNoSlMudW53YXRjaCA9IHVud2F0Y2g7XG4gICAgV2F0Y2hKUy5jYWxsV2F0Y2hlcnMgPSBjYWxsV2F0Y2hlcnM7XG5cbiAgICByZXR1cm4gV2F0Y2hKUztcblxufSkpO1xuIiwiY2xhc3MgTm90aWZpY2F0aW9uXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gIHNob3c6ICh0aXRsZSwgbWVzc2FnZSkgLT5cbiAgICB1bmlxdWVJZCA9IChsZW5ndGg9OCkgLT5cbiAgICAgIGlkID0gXCJcIlxuICAgICAgaWQgKz0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpIHdoaWxlIGlkLmxlbmd0aCA8IGxlbmd0aFxuICAgICAgaWQuc3Vic3RyIDAsIGxlbmd0aFxuXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlIHVuaXF1ZUlkKCksXG4gICAgICB0eXBlOidiYXNpYydcbiAgICAgIHRpdGxlOnRpdGxlXG4gICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICBpY29uVXJsOidpbWFnZXMvaWNvbi0zOC5wbmcnLFxuICAgICAgKGNhbGxiYWNrKSAtPlxuICAgICAgICB1bmRlZmluZWRcblxubW9kdWxlLmV4cG9ydHMgPSBOb3RpZmljYXRpb24iLCIjVE9ETzogcmV3cml0ZSB0aGlzIGNsYXNzIHVzaW5nIHRoZSBuZXcgY2hyb21lLnNvY2tldHMuKiBhcGkgd2hlbiB5b3UgY2FuIG1hbmFnZSB0byBtYWtlIGl0IHdvcmtcbmNsYXNzIFNlcnZlclxuICBzb2NrZXQ6IGNocm9tZS5zb2NrZXRcbiAgIyB0Y3A6IGNocm9tZS5zb2NrZXRzLnRjcFxuICBzb2NrZXRQcm9wZXJ0aWVzOlxuICAgICAgcGVyc2lzdGVudDp0cnVlXG4gICAgICBuYW1lOidTTFJlZGlyZWN0b3InXG4gICMgc29ja2V0SW5mbzpudWxsXG4gIGdldExvY2FsRmlsZTpudWxsXG4gIHNvY2tldElkczpbXVxuICBzdGF0dXM6XG4gICAgaG9zdDpudWxsXG4gICAgcG9ydDpudWxsXG4gICAgbWF4Q29ubmVjdGlvbnM6NTBcbiAgICBpc09uOmZhbHNlXG4gICAgc29ja2V0SW5mbzpudWxsXG4gICAgdXJsOm51bGxcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBAc3RhdHVzLmhvc3QgPSBcIjEyNy4wLjAuMVwiXG4gICAgQHN0YXR1cy5wb3J0ID0gMTAwMTJcbiAgICBAc3RhdHVzLm1heENvbm5lY3Rpb25zID0gNTBcbiAgICBAc3RhdHVzLnVybCA9ICdodHRwOi8vJyArIEBzdGF0dXMuaG9zdCArICc6JyArIEBzdGF0dXMucG9ydCArICcvJ1xuICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG5cblxuICBzdGFydDogKGhvc3QscG9ydCxtYXhDb25uZWN0aW9ucywgY2IpIC0+XG4gICAgaWYgaG9zdD8gdGhlbiBAc3RhdHVzLmhvc3QgPSBob3N0XG4gICAgaWYgcG9ydD8gdGhlbiBAc3RhdHVzLnBvcnQgPSBwb3J0XG4gICAgaWYgbWF4Q29ubmVjdGlvbnM/IHRoZW4gQHN0YXR1cy5tYXhDb25uZWN0aW9ucyA9IG1heENvbm5lY3Rpb25zXG5cbiAgICBAa2lsbEFsbCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgcmV0dXJuIGNiPyBlcnIgaWYgZXJyP1xuXG4gICAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuICAgICAgQHNvY2tldC5jcmVhdGUgJ3RjcCcsIHt9LCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgQHN0YXR1cy5zb2NrZXRJbmZvID0gc29ja2V0SW5mb1xuICAgICAgICBAc29ja2V0SWRzID0gW11cbiAgICAgICAgQHNvY2tldElkcy5wdXNoIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCAnc29ja2V0SWRzJzpAc29ja2V0SWRzXG4gICAgICAgIEBzb2NrZXQubGlzdGVuIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQHN0YXR1cy5ob3N0LCBAc3RhdHVzLnBvcnQsIChyZXN1bHQpID0+XG4gICAgICAgICAgaWYgcmVzdWx0ID4gLTFcbiAgICAgICAgICAgIHNob3cgJ2xpc3RlbmluZyAnICsgQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgICAgICBAc3RhdHVzLmlzT24gPSB0cnVlXG4gICAgICAgICAgICBAc29ja2V0LmFjY2VwdCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcbiAgICAgICAgICAgIGNiPyBudWxsLCBAc3RhdHVzXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2I/IHJlc3VsdFxuXG5cbiAga2lsbEFsbDogKGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0ICdzb2NrZXRJZHMnLCAocmVzdWx0KSA9PlxuICAgICAgQHNvY2tldElkcyA9IHJlc3VsdC5zb2NrZXRJZHNcbiAgICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG4gICAgICByZXR1cm4gY2I/IG51bGwsICdzdWNjZXNzJyB1bmxlc3MgQHNvY2tldElkcz9cbiAgICAgIGNudCA9IDBcbiAgICAgIGZvciBzIGluIEBzb2NrZXRJZHNcbiAgICAgICAgZG8gKHMpID0+XG4gICAgICAgICAgY250KytcbiAgICAgICAgICBAc29ja2V0LmdldEluZm8gcywgKHNvY2tldEluZm8pID0+XG4gICAgICAgICAgICBjbnQtLVxuICAgICAgICAgICAgaWYgbm90IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcj9cbiAgICAgICAgICAgICAgQHNvY2tldC5kaXNjb25uZWN0IHMgaWYgQHN0YXR1cy5zb2NrZXRJbmZvPy5jb25uZWN0ZWQgb3Igbm90IEBzdGF0dXMuc29ja2V0SW5mbz9cbiAgICAgICAgICAgICAgQHNvY2tldC5kZXN0cm95IHNcblxuICAgICAgICAgICAgY2I/IG51bGwsICdzdWNjZXNzJyBpZiBjbnQgaXMgMFxuXG4gIHN0b3A6IChjYikgLT5cbiAgICBAa2lsbEFsbCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgaWYgZXJyPyBcbiAgICAgICAgY2I/IGVyclxuICAgICAgZWxzZVxuICAgICAgICBjYj8gbnVsbCxzdWNjZXNzXG5cblxuICBfb25SZWNlaXZlOiAocmVjZWl2ZUluZm8pID0+XG4gICAgc2hvdyhcIkNsaWVudCBzb2NrZXQgJ3JlY2VpdmUnIGV2ZW50OiBzZD1cIiArIHJlY2VpdmVJbmZvLnNvY2tldElkXG4gICAgKyBcIiwgYnl0ZXM9XCIgKyByZWNlaXZlSW5mby5kYXRhLmJ5dGVMZW5ndGgpXG5cbiAgX29uTGlzdGVuOiAoc2VydmVyU29ja2V0SWQsIHJlc3VsdENvZGUpID0+XG4gICAgcmV0dXJuIHNob3cgJ0Vycm9yIExpc3RlbmluZzogJyArIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIGlmIHJlc3VsdENvZGUgPCAwXG4gICAgQHNlcnZlclNvY2tldElkID0gc2VydmVyU29ja2V0SWRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0LmFkZExpc3RlbmVyIEBfb25BY2NlcHRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0RXJyb3IuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdEVycm9yXG4gICAgQHRjcC5vblJlY2VpdmUuYWRkTGlzdGVuZXIgQF9vblJlY2VpdmVcbiAgICAjIHNob3cgXCJbXCIrc29ja2V0SW5mby5wZWVyQWRkcmVzcytcIjpcIitzb2NrZXRJbmZvLnBlZXJQb3J0K1wiXSBDb25uZWN0aW9uIGFjY2VwdGVkIVwiO1xuICAgICMgaW5mbyA9IEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICMgQGdldEZpbGUgdXJpLCAoZmlsZSkgLT5cbiAgX29uQWNjZXB0RXJyb3I6IChlcnJvcikgLT5cbiAgICBzaG93IGVycm9yXG5cbiAgX29uQWNjZXB0OiAoc29ja2V0SW5mbykgPT5cbiAgICAjIHJldHVybiBudWxsIGlmIGluZm8uc29ja2V0SWQgaXNudCBAc2VydmVyU29ja2V0SWRcbiAgICBzaG93KFwiU2VydmVyIHNvY2tldCAnYWNjZXB0JyBldmVudDogc2Q9XCIgKyBzb2NrZXRJbmZvLnNvY2tldElkKVxuICAgIGlmIHNvY2tldEluZm8/LnNvY2tldElkP1xuICAgICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkLCAoZXJyLCBpbmZvKSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgZXJyPyB0aGVuIHJldHVybiBAX3dyaXRlRXJyb3Igc29ja2V0SW5mby5zb2NrZXRJZCwgNDA0LCBpbmZvLmtlZXBBbGl2ZVxuXG4gICAgICAgIEBnZXRMb2NhbEZpbGUgaW5mbywgKGVyciwgZmlsZUVudHJ5LCBmaWxlUmVhZGVyKSA9PlxuICAgICAgICAgIGlmIGVycj8gdGhlbiBAX3dyaXRlRXJyb3Igc29ja2V0SW5mby5zb2NrZXRJZCwgNDA0LCBpbmZvLmtlZXBBbGl2ZVxuICAgICAgICAgIGVsc2UgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldEluZm8uc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZVJlYWRlciwgaW5mby5rZWVwQWxpdmVcbiAgICBlbHNlXG4gICAgICBzaG93IFwiTm8gc29ja2V0PyFcIlxuICAgICMgQHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG5cblxuICBzdHJpbmdUb1VpbnQ4QXJyYXk6IChzdHJpbmcpIC0+XG4gICAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHN0cmluZy5sZW5ndGgpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICBpID0gMFxuXG4gICAgd2hpbGUgaSA8IHN0cmluZy5sZW5ndGhcbiAgICAgIHZpZXdbaV0gPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuICAgICAgaSsrXG4gICAgdmlld1xuXG4gIGFycmF5QnVmZmVyVG9TdHJpbmc6IChidWZmZXIpIC0+XG4gICAgc3RyID0gXCJcIlxuICAgIHVBcnJheVZhbCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICBzID0gMFxuXG4gICAgd2hpbGUgcyA8IHVBcnJheVZhbC5sZW5ndGhcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVBcnJheVZhbFtzXSlcbiAgICAgIHMrK1xuICAgIHN0clxuXG4gIF93cml0ZTIwMFJlc3BvbnNlOiAoc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZSwga2VlcEFsaXZlKSAtPlxuICAgIGNvbnRlbnRUeXBlID0gKGlmIChmaWxlLnR5cGUgaXMgXCJcIikgdGhlbiBcInRleHQvcGxhaW5cIiBlbHNlIGZpbGUudHlwZSlcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIDIwMCBPS1xcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoKGlmIGtlZXBBbGl2ZSB0aGVuIFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIGVsc2UgXCJcIikpICsgXCJcXG5cXG5cIilcbiAgICBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldCBoZWFkZXIsIDBcblxuICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChldikgPT5cbiAgICAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGV2LnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aFxuICAgICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICAgICBzaG93IHdyaXRlSW5mb1xuICAgICAgICAjIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLm9uZXJyb3IgPSAoZXJyb3IpID0+XG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgZmlsZVxuXG5cbiAgICAjIEBlbmQgc29ja2V0SWRcbiAgICAjIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgIyBmaWxlUmVhZGVyLm9ubG9hZCA9IChlKSA9PlxuICAgICMgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShlLnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aFxuICAgICMgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgIyAgICAgc2hvdyBcIldSSVRFXCIsIHdyaXRlSW5mb1xuICAgICMgICAgICAgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldElkXG5cblxuICBfcmVhZEZyb21Tb2NrZXQ6IChzb2NrZXRJZCwgY2IpIC0+XG4gICAgQHNvY2tldC5yZWFkIHNvY2tldElkLCAocmVhZEluZm8pID0+XG4gICAgICBzaG93IFwiUkVBRFwiLCByZWFkSW5mb1xuXG4gICAgICAjIFBhcnNlIHRoZSByZXF1ZXN0LlxuICAgICAgZGF0YSA9IEBhcnJheUJ1ZmZlclRvU3RyaW5nKHJlYWRJbmZvLmRhdGEpXG4gICAgICBzaG93IGRhdGFcblxuICAgICAga2VlcEFsaXZlID0gZmFsc2VcbiAgICAgIGtlZXBBbGl2ZSA9IHRydWUgaWYgZGF0YS5pbmRleE9mICdDb25uZWN0aW9uOiBrZWVwLWFsaXZlJyBpc250IC0xXG5cbiAgICAgIGlmIGRhdGEuaW5kZXhPZihcIkdFVCBcIikgaXNudCAwXG4gICAgICAgIHJldHVybiBjYj8gJzQwNCcsIGtlZXBBbGl2ZTprZWVwQWxpdmVcblxuXG5cbiAgICAgIHVyaUVuZCA9IGRhdGEuaW5kZXhPZihcIiBcIiwgNClcblxuICAgICAgcmV0dXJuIGVuZCBzb2NrZXRJZCBpZiB1cmlFbmQgPCAwXG5cbiAgICAgIHVyaSA9IGRhdGEuc3Vic3RyaW5nKDQsIHVyaUVuZClcbiAgICAgIGlmIG5vdCB1cmk/XG4gICAgICAgIHJldHVybiBjYj8gJzQwNCcsIGtlZXBBbGl2ZTprZWVwQWxpdmVcblxuICAgICAgaW5mbyA9XG4gICAgICAgIHVyaTogdXJpXG4gICAgICAgIGtlZXBBbGl2ZTprZWVwQWxpdmVcbiAgICAgIGluZm8ucmVmZXJlciA9IGRhdGEubWF0Y2goL1JlZmVyZXI6XFxzKC4qKS8pP1sxXVxuICAgICAgI3N1Y2Nlc3NcbiAgICAgIGNiPyBudWxsLCBpbmZvXG5cbiAgZW5kOiAoc29ja2V0SWQsIGtlZXBBbGl2ZSkgLT5cbiAgICAgICMgaWYga2VlcEFsaXZlXG4gICAgICAjICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgIyBlbHNlXG4gICAgQHNvY2tldC5kaXNjb25uZWN0IHNvY2tldElkXG4gICAgQHNvY2tldC5kZXN0cm95IHNvY2tldElkXG4gICAgc2hvdyAnZW5kaW5nICcgKyBzb2NrZXRJZFxuICAgIEBzb2NrZXQuYWNjZXB0IEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG4gIF93cml0ZUVycm9yOiAoc29ja2V0SWQsIGVycm9yQ29kZSwga2VlcEFsaXZlKSAtPlxuICAgIGZpbGUgPSBzaXplOiAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogYmVnaW4uLi4gXCJcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBmaWxlID0gXCIgKyBmaWxlXG4gICAgY29udGVudFR5cGUgPSBcInRleHQvcGxhaW5cIiAjKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIFwiICsgZXJyb3JDb2RlICsgXCIgTm90IEZvdW5kXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyBoZWFkZXIuLi5cIlxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyB2aWV3Li4uXCJcbiAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcblxubW9kdWxlLmV4cG9ydHMgPSBTZXJ2ZXJcbiIsIkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcblxuV2F0Y2hKUyA9IHJlcXVpcmUgJ3dhdGNoanMnXG53YXRjaCA9IFdhdGNoSlMud2F0Y2hcbnVud2F0Y2ggPSBXYXRjaEpTLnVud2F0Y2hcbmNhbGxXYXRjaGVycyA9IFdhdGNoSlMuY2FsbFdhdGNoZXJzXG5cbmNsYXNzIFN0b3JhZ2VcbiAgYXBpOiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICBMSVNURU46IExJU1RFTi5nZXQoKSBcbiAgTVNHOiBNU0cuZ2V0KClcbiAgZGF0YTogXG4gICAgY3VycmVudFJlc291cmNlczogW11cbiAgICBkaXJlY3RvcmllczpbXVxuICAgIG1hcHM6W11cbiAgICB0YWJNYXBzOnt9XG4gICAgY3VycmVudEZpbGVNYXRjaGVzOnt9XG4gIFxuICBzZXNzaW9uOnt9XG5cbiAgb25EYXRhTG9hZGVkOiAtPlxuXG4gIGNhbGxiYWNrOiAoKSAtPlxuICBub3RpZnlPbkNoYW5nZTogKCkgLT5cbiAgY29uc3RydWN0b3I6IChfb25EYXRhTG9hZGVkKSAtPlxuICAgIEBvbkRhdGFMb2FkZWQgPSBfb25EYXRhTG9hZGVkIGlmIF9vbkRhdGFMb2FkZWQ/XG4gICAgQGFwaS5nZXQgKHJlc3VsdHMpID0+XG4gICAgICBAZGF0YVtrXSA9IHJlc3VsdHNba10gZm9yIGsgb2YgcmVzdWx0c1xuXG4gICAgICB3YXRjaEFuZE5vdGlmeSBALCdkYXRhQ2hhbmdlZCcsIEBkYXRhLCB0cnVlXG5cbiAgICAgIHdhdGNoQW5kTm90aWZ5IEAsJ3Nlc3Npb25EYXRhJywgQHNlc3Npb24sIGZhbHNlXG5cbiAgICAgIEBvbkRhdGFMb2FkZWQgQGRhdGFcblxuICAgIEBpbml0KClcblxuICBpbml0OiAoKSAtPlxuICAgIFxuICB3YXRjaEFuZE5vdGlmeSA9IChfdGhpcywgbXNnS2V5LCBvYmosIHN0b3JlKSAtPlxuXG4gICAgICBfbGlzdGVuZXIgPSAocHJvcCwgYWN0aW9uLCBuZXdWYWwsIG9sZFZhbCkgLT5cbiAgICAgICAgaWYgKGFjdGlvbiBpcyBcInNldFwiIG9yIFwiZGlmZmVyZW50YXR0clwiKSBhbmQgX3RoaXMubm9XYXRjaCBpcyBmYWxzZVxuICAgICAgICAgIGlmIG5vdCAvXlxcZCskLy50ZXN0KHByb3ApXG4gICAgICAgICAgICBzaG93IGFyZ3VtZW50c1xuICAgICAgICAgICAgX3RoaXMuYXBpLnNldCBvYmogaWYgc3RvcmVcbiAgICAgICAgICAgIG1zZyA9IHt9XG4gICAgICAgICAgICBtc2dbbXNnS2V5XSA9IG9ialxuICAgICAgICAgICAgIyB1bndhdGNoIG9iaiwgX2xpc3RlbmVyLDMsdHJ1ZVxuICAgICAgICAgICAgX3RoaXMuTVNHLkV4dFBvcnQgbXNnXG4gICAgICAgIFxuICAgICAgX3RoaXMubm9XYXRjaCA9IGZhbHNlXG4gICAgICB3YXRjaCBvYmosIF9saXN0ZW5lciwzLHRydWVcblxuICAgICAgX3RoaXMuTElTVEVOLkV4dCBtc2dLZXksIChkYXRhKSAtPlxuICAgICAgICBfdGhpcy5ub1dhdGNoID0gdHJ1ZVxuICAgICAgICAjIHVud2F0Y2ggb2JqLCBfbGlzdGVuZXIsMyx0cnVlXG4gICAgICAgIFxuICAgICAgICBvYmpba10gPSBkYXRhW2tdIGZvciBrIG9mIGRhdGFcbiAgICAgICAgc2V0VGltZW91dCAoKSAtPiBcbiAgICAgICAgICBfdGhpcy5ub1dhdGNoID0gZmFsc2VcbiAgICAgICAgLDIwMFxuXG4gIHNhdmU6IChrZXksIGl0ZW0sIGNiKSAtPlxuXG4gICAgb2JqID0ge31cbiAgICBvYmpba2V5XSA9IGl0ZW1cbiAgICBAZGF0YVtrZXldID0gaXRlbVxuICAgIEBhcGkuc2V0IG9iaiwgKHJlcykgPT5cbiAgICAgIGNiPygpXG4gICAgICBAY2FsbGJhY2s/KClcbiBcbiAgc2F2ZUFsbDogKGRhdGEsIGNiKSAtPlxuXG4gICAgaWYgZGF0YT8gXG4gICAgICBAYXBpLnNldCBkYXRhLCAoKSA9PlxuICAgICAgICBjYj8oKVxuIFxuICAgIGVsc2VcbiAgICAgIEBhcGkuc2V0IEBkYXRhLCAoKSA9PlxuICAgICAgICBjYj8oKVxuIFxuXG4gIHJldHJpZXZlOiAoa2V5LCBjYikgLT5cbiAgICBAb2JzZXJ2ZXIuc3RvcCgpXG4gICAgQGFwaS5nZXQga2V5LCAocmVzdWx0cykgLT5cbiAgICAgIEBkYXRhW3JdID0gcmVzdWx0c1tyXSBmb3IgciBvZiByZXN1bHRzXG4gICAgICBpZiBjYj8gdGhlbiBjYiByZXN1bHRzW2tleV1cblxuICByZXRyaWV2ZUFsbDogKGNiKSAtPlxuICAgICMgQG9ic2VydmVyLnN0b3AoKVxuICAgIEBhcGkuZ2V0IChyZXN1bHQpID0+XG4gICAgICBmb3IgYyBvZiByZXN1bHQgXG4gICAgICAjICAgZGVsZXRlIEBkYXRhW2NdXG4gICAgICAgIEBkYXRhW2NdID0gcmVzdWx0W2NdIFxuICAgICAgIyBAZGF0YSA9IHJlc3VsdFxuICAgICAgICBATVNHLkV4dFBvcnQgJ2RhdGFDaGFuZ2VkJzpcbiAgICAgICAgICBwYXRoOmNcbiAgICAgICAgICB2YWx1ZTpyZXN1bHRbY11cbiBcblxuICAgICAgQGFwaS5zZXQgQGRhdGFcbiAgICAgICMgQGNhbGxiYWNrPyByZXN1bHRcbiAgICAgIGNiPyByZXN1bHRcbiAgICAgIEBvbkRhdGFMb2FkZWQgQGRhdGFcblxuICBvbkRhdGFMb2FkZWQ6IChkYXRhKSAtPlxuXG4gIG9uQ2hhbmdlZDogKGtleSwgY2IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLCBuYW1lc3BhY2UpIC0+XG4gICAgICBpZiBjaGFuZ2VzW2tleV0/IGFuZCBjYj8gdGhlbiBjYiBjaGFuZ2VzW2tleV0ubmV3VmFsdWVcbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlc1xuXG4gIG9uQ2hhbmdlZEFsbDogKCkgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsbmFtZXNwYWNlKSA9PlxuICAgICAgaGFzQ2hhbmdlcyA9IGZhbHNlXG4gICAgICBmb3IgYyBvZiBjaGFuZ2VzIHdoZW4gY2hhbmdlc1tjXS5uZXdWYWx1ZSAhPSBjaGFuZ2VzW2NdLm9sZFZhbHVlIGFuZCBjIGlzbnQnc29ja2V0SWRzJ1xuICAgICAgICAoYykgPT4gXG4gICAgICAgICAgQGRhdGFbY10gPSBjaGFuZ2VzW2NdLm5ld1ZhbHVlIFxuICAgICAgICAgIHNob3cgJ2RhdGEgY2hhbmdlZDogJ1xuICAgICAgICAgIHNob3cgY1xuICAgICAgICAgIHNob3cgQGRhdGFbY11cblxuICAgICAgICAgIGhhc0NoYW5nZXMgPSB0cnVlXG5cbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlcyBpZiBoYXNDaGFuZ2VzXG4gICAgICBzaG93ICdjaGFuZ2VkJyBpZiBoYXNDaGFuZ2VzXG5cbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZVxuIiwiIyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTc0MjA5M1xubW9kdWxlLmV4cG9ydHMgPSAoKCkgLT5cblxuICBkZWJ1ZyA9IGZhbHNlXG4gIFxuICByZXR1cm4gKHdpbmRvdy5zaG93ID0gKCkgLT4pIGlmIG5vdCBkZWJ1Z1xuXG4gIG1ldGhvZHMgPSBbXG4gICAgJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJyxcbiAgICAnZXhjZXB0aW9uJywgJ2dyb3VwJywgJ2dyb3VwQ29sbGFwc2VkJywgJ2dyb3VwRW5kJywgJ2luZm8nLCAnbG9nJyxcbiAgICAnbWFya1RpbWVsaW5lJywgJ3Byb2ZpbGUnLCAncHJvZmlsZUVuZCcsICd0YWJsZScsICd0aW1lJywgJ3RpbWVFbmQnLFxuICAgICd0aW1lU3RhbXAnLCAndHJhY2UnLCAnd2FybiddXG4gICAgXG4gIG5vb3AgPSAoKSAtPlxuICAgICMgc3R1YiB1bmRlZmluZWQgbWV0aG9kcy5cbiAgICBmb3IgbSBpbiBtZXRob2RzICB3aGVuICAhY29uc29sZVttXVxuICAgICAgY29uc29sZVttXSA9IG5vb3BcblxuXG4gIGlmIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kP1xuICAgIHdpbmRvdy5zaG93ID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSlcbiAgZWxzZVxuICAgIHdpbmRvdy5zaG93ID0gKCkgLT5cbiAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpXG4pKClcbiJdfQ==
