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
        debugger;
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
              _this.status.url = 'http://' + _this.status.host + ':' + _this.status.port + '/';
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
        var cnt, i, s, _i, _len, _ref, _results;
        _this.socketIds = result.socketIds;
        _this.status.isOn = false;
        if (_this.socketIds == null) {
          return typeof cb === "function" ? cb(null, 'success') : void 0;
        }
        cnt = 0;
        i = 0;
        while (i < _this.socketIds[0]) {
          _this.socket.destroy(i);
          i++;
        }
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
        _this.status.isOn = false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvYXBwL3NyYy9iYWNrZ3JvdW5kLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9jb21tb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L2NvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L25vZGVfbW9kdWxlcy93YXRjaGpzL3NyYy93YXRjaC5qcyIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9ub3RpZmljYXRpb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3NlcnZlci5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvc3RvcmFnZS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNFQSxJQUFBLGlFQUFBOztBQUFBLFNBQUEsR0FBWSxTQUFBLEdBQUE7QUFD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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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LE9BRHBCLEVBQzZCLEtBRDdCLEVBQ29DLFFBRHBDLEVBQzhDLE9BRDlDLEVBRVIsV0FGUSxFQUVLLE9BRkwsRUFFYyxnQkFGZCxFQUVnQyxVQUZoQyxFQUU0QyxNQUY1QyxFQUVvRCxLQUZwRCxFQUdSLGNBSFEsRUFHUSxTQUhSLEVBR21CLFlBSG5CLEVBR2lDLE9BSGpDLEVBRzBDLE1BSDFDLEVBR2tELFNBSGxELEVBSVIsV0FKUSxFQUlLLE9BSkwsRUFJYyxNQUpkLENBSlYsQ0FBQTtBQUFBLEVBVUEsSUFBQSxHQUFPLFNBQUEsR0FBQTtBQUVMLFFBQUEscUJBQUE7QUFBQTtTQUFBLDhDQUFBO3NCQUFBO1VBQXdCLENBQUEsT0FBUyxDQUFBLENBQUE7QUFDL0Isc0JBQUEsT0FBUSxDQUFBLENBQUEsQ0FBUixHQUFhLEtBQWI7T0FERjtBQUFBO29CQUZLO0VBQUEsQ0FWUCxDQUFBO0FBZ0JBLEVBQUEsSUFBRywrQkFBSDtXQUNFLE1BQU0sQ0FBQyxJQUFQLEdBQWMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBeEIsQ0FBNkIsT0FBTyxDQUFDLEdBQXJDLEVBQTBDLE9BQTFDLEVBRGhCO0dBQUEsTUFBQTtXQUdFLE1BQU0sQ0FBQyxJQUFQLEdBQWMsU0FBQSxHQUFBO2FBQ1osUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBekIsQ0FBOEIsT0FBTyxDQUFDLEdBQXRDLEVBQTJDLE9BQTNDLEVBQW9ELFNBQXBELEVBRFk7SUFBQSxFQUhoQjtHQWxCZ0I7QUFBQSxDQUFELENBQUEsQ0FBQSxDQUFqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIHNlcnZlciA9IHJlcXVpcmUgJy4vdGNwLXNlcnZlci5qcydcblxuZ2V0R2xvYmFsID0gLT5cbiAgX2dldEdsb2JhbCA9IC0+XG4gICAgdGhpc1xuXG4gIF9nZXRHbG9iYWwoKVxuXG5yb290ID0gZ2V0R2xvYmFsKClcblxuQXBwbGljYXRpb24gPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuXG5jaHJvbWUuYXBwLnJ1bnRpbWUub25MYXVuY2hlZC5hZGRMaXN0ZW5lciAtPlxuICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUgJ2luZGV4Lmh0bWwnLFxuICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgYm91bmRzOlxuICAgICAgICAgIHdpZHRoOjc3MFxuICAgICAgICAgIGhlaWdodDo4MDBcblxuXG5cblxuIyBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcuY29mZmVlJ1xuIyBNU0cgPSByZXF1aXJlICcuLi8uLi9tc2cuY29mZmVlJ1xuIyBMSVNURU4gPSByZXF1aXJlICcuLi8uLi9saXN0ZW4uY29mZmVlJ1xuIyBTdG9yYWdlID0gcmVxdWlyZSAnLi4vLi4vc3RvcmFnZS5jb2ZmZWUnXG4jIEZpbGVTeXN0ZW0gPSByZXF1aXJlICcuLi8uLi9maWxlc3lzdGVtLmNvZmZlZSdcbkNvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi4vLi4vc3RvcmFnZS5jb2ZmZWUnXG5GaWxlU3lzdGVtID0gcmVxdWlyZSAnLi4vLi4vZmlsZXN5c3RlbS5jb2ZmZWUnXG5TZXJ2ZXIgPSByZXF1aXJlICcuLi8uLi9zZXJ2ZXIuY29mZmVlJ1xuXG5cbnJvb3QuYXBwID0gbmV3IEFwcGxpY2F0aW9uIFxuICBTdG9yYWdlOiBuZXcgU3RvcmFnZVxuICBGUzogbmV3IEZpbGVTeXN0ZW1cbiAgU2VydmVyOiBuZXcgU2VydmVyXG5cbnJvb3QuYXBwLlNlcnZlci5nZXRMb2NhbEZpbGUgPSBhcHAuZ2V0TG9jYWxGaWxlXG4jIHJvb3QuYXBwLlN0b3JhZ2UuZGF0YS5zZXJ2ZXIgPSBzdGF0dXM6cm9vdC5hcHAuU2VydmVyLnN0YXR1c1xuXG5jaHJvbWUucnVudGltZS5vblN1c3BlbmQuYWRkTGlzdGVuZXIgLT5cbiAgcm9vdC5hcHAuU3RvcmFnZS5zYXZlQWxsKG51bGwpXG5cbiNyb290LmFwcC5TdG9yYWdlLnJldHJpZXZlQWxsKClcbiIsInJlcXVpcmUgJy4vdXRpbC5jb2ZmZWUnXG5Db25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5MSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuTm90aWZpY2F0aW9uID0gcmVxdWlyZSAnLi9ub3RpZmljYXRpb24uY29mZmVlJ1xuU2VydmVyID0gcmVxdWlyZSAnLi9zZXJ2ZXIuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgQ29uZmlnXG4gIExJU1RFTjogbnVsbFxuICBNU0c6IG51bGxcbiAgU3RvcmFnZTogbnVsbFxuICBGUzogbnVsbFxuICBTZXJ2ZXI6IG51bGxcbiAgTm90aWZ5OiBudWxsXG4gIHBsYXRmb3JtOm51bGxcbiAgY3VycmVudFRhYklkOm51bGxcblxuICBjb25zdHJ1Y3RvcjogKGRlcHMpIC0+XG4gICAgc3VwZXJcblxuICAgIEBNU0cgPz0gTVNHLmdldCgpXG4gICAgQExJU1RFTiA/PSBMSVNURU4uZ2V0KClcbiAgICBcbiAgICBjaHJvbWUucnVudGltZS5vbkNvbm5lY3RFeHRlcm5hbC5hZGRMaXN0ZW5lciAocG9ydCkgPT5cbiAgICAgIGlmIHBvcnQuc2VuZGVyLmlkIGlzbnQgQEVYVF9JRFxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgQE1TRy5zZXRQb3J0IHBvcnRcbiAgICAgIEBMSVNURU4uc2V0UG9ydCBwb3J0XG4gICAgXG4gICAgcG9ydCA9IGNocm9tZS5ydW50aW1lLmNvbm5lY3QgQEVYVF9JRCBcbiAgICBATVNHLnNldFBvcnQgcG9ydFxuICAgIEBMSVNURU4uc2V0UG9ydCBwb3J0XG4gICAgXG4gICAgZm9yIHByb3Agb2YgZGVwc1xuICAgICAgaWYgdHlwZW9mIGRlcHNbcHJvcF0gaXMgXCJvYmplY3RcIiBcbiAgICAgICAgQFtwcm9wXSA9IEB3cmFwT2JqSW5ib3VuZCBkZXBzW3Byb3BdXG4gICAgICBpZiB0eXBlb2YgZGVwc1twcm9wXSBpcyBcImZ1bmN0aW9uXCIgXG4gICAgICAgIEBbcHJvcF0gPSBAd3JhcE9iak91dGJvdW5kIG5ldyBkZXBzW3Byb3BdXG5cbiAgICBAU3RvcmFnZS5vbkRhdGFMb2FkZWQgPSAoZGF0YSkgPT5cbiAgICAgICMgQGRhdGEgPSBkYXRhXG4gICAgICAjIGRlbGV0ZSBAU3RvcmFnZS5kYXRhLnNlcnZlclxuICAgICAgIyBAU3RvcmFnZS5kYXRhLnNlcnZlciA9IHt9XG4gICAgICAjIGRlbGV0ZSBAU3RvcmFnZS5kYXRhLnNlcnZlci5zdGF0dXNcblxuICAgICAgaWYgbm90IEBTdG9yYWdlLmRhdGEuZmlyc3RUaW1lP1xuICAgICAgICBAU3RvcmFnZS5kYXRhLmZpcnN0VGltZSA9IGZhbHNlXG4gICAgICAgIEBTdG9yYWdlLmRhdGEubWFwcy5wdXNoXG4gICAgICAgICAgbmFtZTonU2FsZXNmb3JjZSdcbiAgICAgICAgICB1cmw6J2h0dHBzLipcXC9yZXNvdXJjZShcXC9bMC05XSspP1xcLyhbQS1aYS16MC05XFwtLl9dK1xcLyk/J1xuICAgICAgICAgIHJlZ2V4UmVwbDonJ1xuICAgICAgICAgIGlzUmVkaXJlY3Q6dHJ1ZVxuICAgICAgICAgIGlzT246ZmFsc2VcblxuXG4gICAgICAjIGlmIEBSZWRpcmVjdD8gdGhlbiBAUmVkaXJlY3QuZGF0YSA9IEBkYXRhLnRhYk1hcHNcblxuICAgIEBOb3RpZnkgPz0gKG5ldyBOb3RpZmljYXRpb24pLnNob3cgXG4gICAgIyBAU3RvcmFnZSA/PSBAd3JhcE9iak91dGJvdW5kIG5ldyBTdG9yYWdlIEBkYXRhXG4gICAgIyBARlMgPSBuZXcgRmlsZVN5c3RlbSBcbiAgICAjIEBTZXJ2ZXIgPz0gQHdyYXBPYmpPdXRib3VuZCBuZXcgU2VydmVyXG4gICAgQGRhdGEgPSBAU3RvcmFnZS5kYXRhXG4gICAgXG4gICAgQHdyYXAgPSBpZiBAU0VMRl9UWVBFIGlzICdBUFAnIHRoZW4gQHdyYXBJbmJvdW5kIGVsc2UgQHdyYXBPdXRib3VuZFxuXG4gICAgQG9wZW5BcHAgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ub3BlbkFwcCcsIEBvcGVuQXBwXG4gICAgQGxhdW5jaEFwcCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5sYXVuY2hBcHAnLCBAbGF1bmNoQXBwXG4gICAgQHN0YXJ0U2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnN0YXJ0U2VydmVyJywgQHN0YXJ0U2VydmVyXG4gICAgQHJlc3RhcnRTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ucmVzdGFydFNlcnZlcicsIEByZXN0YXJ0U2VydmVyXG4gICAgQHN0b3BTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uc3RvcFNlcnZlcicsIEBzdG9wU2VydmVyXG4gICAgQGdldEZpbGVNYXRjaCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRGaWxlTWF0Y2gnLCBAZ2V0RmlsZU1hdGNoXG5cbiAgICBAd3JhcCA9IGlmIEBTRUxGX1RZUEUgaXMgJ0VYVEVOU0lPTicgdGhlbiBAd3JhcEluYm91bmQgZWxzZSBAd3JhcE91dGJvdW5kXG5cbiAgICBAZ2V0UmVzb3VyY2VzID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldFJlc291cmNlcycsIEBnZXRSZXNvdXJjZXNcbiAgICBAZ2V0Q3VycmVudFRhYiA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRDdXJyZW50VGFiJywgQGdldEN1cnJlbnRUYWJcblxuICAgIEBpbml0KClcblxuICBpbml0OiAoKSAtPlxuICAgICAgQFN0b3JhZ2Uuc2Vzc2lvbi5zZXJ2ZXIgPSB7fVxuICAgICAgQFN0b3JhZ2Uuc2Vzc2lvbi5zZXJ2ZXIuc3RhdHVzID0gQFNlcnZlci5zdGF0dXNcbiAgICAjIEBTdG9yYWdlLnJldHJpZXZlQWxsKCkgaWYgQFN0b3JhZ2U/XG5cblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIGxhdW5jaEFwcDogKGNiLCBlcnJvcikgLT5cbiAgICAjIG5lZWRzIG1hbmFnZW1lbnQgcGVybWlzc2lvbi4gb2ZmIGZvciBub3cuXG4gICAgY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIEBBUFBfSUQsIChleHRJbmZvKSA9PlxuICAgICAgaWYgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICAgIGVycm9yIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxuICAgICAgZWxzZVxuICAgICAgICBjYj8gZXh0SW5mb1xuXG4gIG9wZW5BcHA6ICgpID0+XG4gICAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLFxuICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgYm91bmRzOlxuICAgICAgICAgIHdpZHRoOjc3MFxuICAgICAgICAgIGhlaWdodDo4MDAsXG4gICAgICAod2luKSA9PlxuICAgICAgICBAYXBwV2luZG93ID0gd2luKSBcblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIGdldFJlc291cmNlczogKGNiKSAtPlxuICAgIEBnZXRDdXJyZW50VGFiICh0YWJJZCkgPT5cbiAgICAgIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQgdGFiSWQsIFxuICAgICAgICBmaWxlOidzY3JpcHRzL2NvbnRlbnQuanMnLCAocmVzdWx0cykgPT5cbiAgICAgICAgICBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLmxlbmd0aCA9IDBcbiAgICAgICAgICBcbiAgICAgICAgICByZXR1cm4gY2I/KG51bGwsIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMpIGlmIG5vdCByZXN1bHRzP1xuXG4gICAgICAgICAgZm9yIHIgaW4gcmVzdWx0c1xuICAgICAgICAgICAgZm9yIHJlcyBpbiByXG4gICAgICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMucHVzaCByZXNcbiAgICAgICAgICBjYj8gbnVsbCwgQGRhdGEuY3VycmVudFJlc291cmNlc1xuXG5cbiAgZ2V0TG9jYWxGaWxlOiAoaW5mbywgY2IpID0+XG4gICAgZmlsZVBhdGggPSBpbmZvLnVyaVxuICAgIGp1c3RUaGVQYXRoID0gZmlsZVBhdGgubWF0Y2goL14oW14jP1xcc10rKT8oLio/KT8oI1tcXHdcXC1dKyk/JC8pXG4gICAgZmlsZVBhdGggPSBqdXN0VGhlUGF0aFsxXSBpZiBqdXN0VGhlUGF0aD9cbiAgICAjIGZpbGVQYXRoID0gQGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3QgdXJsXG4gICAgcmV0dXJuIGNiICdmaWxlIG5vdCBmb3VuZCcgdW5sZXNzIGZpbGVQYXRoP1xuICAgIF9kaXJzID0gW11cbiAgICBfZGlycy5wdXNoIGRpciBmb3IgZGlyIGluIEBkYXRhLmRpcmVjdG9yaWVzIHdoZW4gZGlyLmlzT25cbiAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnN1YnN0cmluZyAxIGlmIGZpbGVQYXRoLnN1YnN0cmluZygwLDEpIGlzICcvJ1xuICAgIEBmaW5kRmlsZUZvclBhdGggX2RpcnMsIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcikgPT5cbiAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gY2I/IGVyclxuICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgIGNiPyBudWxsLGZpbGVFbnRyeSxmaWxlXG4gICAgICAsKGVycikgPT4gY2I/IGVyclxuXG5cbiAgc3RhcnRTZXJ2ZXI6IChjYikgLT5cbiAgICBpZiBAU2VydmVyLnN0YXR1cy5pc09uIGlzIGZhbHNlXG4gICAgICBAU2VydmVyLnN0YXJ0IG51bGwsbnVsbCxudWxsLCAoZXJyLCBzb2NrZXRJbmZvKSA9PlxuICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIkVycm9yIFN0YXJ0aW5nIFNlcnZlcjogI3sgZXJyIH1cIlxuICAgICAgICAgICAgY2I/IGVyclxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgU3RhcnRlZFwiLCBcIlN0YXJ0ZWQgU2VydmVyICN7IEBTZXJ2ZXIuc3RhdHVzLnVybCB9XCJcbiAgICAgICAgICAgIGNiPyBudWxsLCBAU2VydmVyLnN0YXR1c1xuICAgIGVsc2VcbiAgICAgIGNiPyAnYWxyZWFkeSBzdGFydGVkJ1xuXG4gIHN0b3BTZXJ2ZXI6IChjYikgLT5cbiAgICAgIEBTZXJ2ZXIuc3RvcCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBFcnJvclwiLFwiU2VydmVyIGNvdWxkIG5vdCBiZSBzdG9wcGVkOiAjeyBlcnJvciB9XCJcbiAgICAgICAgICBjYj8gZXJyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBATm90aWZ5ICdTZXJ2ZXIgU3RvcHBlZCcsIFwiU2VydmVyIFN0b3BwZWRcIlxuICAgICAgICAgIGNiPyBudWxsLCBAU2VydmVyLnN0YXR1c1xuXG4gIHJlc3RhcnRTZXJ2ZXI6IC0+XG4gICAgQHN0YXJ0U2VydmVyKClcblxuICBjaGFuZ2VQb3J0OiA9PlxuICBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0OiAodXJsKSAtPlxuICAgIGZpbGVQYXRoUmVnZXggPSAvXigoaHR0cFtzXT98ZnRwfGNocm9tZS1leHRlbnNpb258ZmlsZSk6XFwvXFwvKT9cXC8/KFteXFwvXFwuXStcXC4pKj8oW15cXC9cXC5dK1xcLlteOlxcL1xcc1xcLl17MiwzfShcXC5bXjpcXC9cXHNcXC5d4oCM4oCLezIsM30pPykoOlxcZCspPygkfFxcLykoW14jP1xcc10rKT8oLio/KT8oI1tcXHdcXC1dKyk/JC9cbiAgIFxuICAgIHJldHVybiBudWxsIHVubGVzcyBAZGF0YVtAY3VycmVudFRhYklkXT8ubWFwcz9cblxuICAgIHJlc1BhdGggPSB1cmwubWF0Y2goZmlsZVBhdGhSZWdleCk/WzhdXG4gICAgaWYgbm90IHJlc1BhdGg/XG4gICAgICAjIHRyeSByZWxwYXRoXG4gICAgICByZXNQYXRoID0gdXJsXG5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmVzUGF0aD9cbiAgICBcbiAgICBmb3IgbWFwIGluIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHNcbiAgICAgIHJlc1BhdGggPSB1cmwubWF0Y2gobmV3IFJlZ0V4cChtYXAudXJsKSk/IGFuZCBtYXAudXJsP1xuXG4gICAgICBpZiByZXNQYXRoXG4gICAgICAgIGlmIHJlZmVyZXI/XG4gICAgICAgICAgIyBUT0RPOiB0aGlzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWFwLnVybCksIG1hcC5yZWdleFJlcGxcbiAgICAgICAgYnJlYWtcbiAgICByZXR1cm4gZmlsZVBhdGhcblxuICBVUkx0b0xvY2FsUGF0aDogKHVybCwgY2IpIC0+XG4gICAgZmlsZVBhdGggPSBAUmVkaXJlY3QuZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdCB1cmxcblxuICBnZXRGaWxlTWF0Y2g6IChmaWxlUGF0aCwgY2IpIC0+XG4gICAgcmV0dXJuIGNiPyAnZmlsZSBub3QgZm91bmQnIHVubGVzcyBmaWxlUGF0aD9cbiAgICBzaG93ICd0cnlpbmcgJyArIGZpbGVQYXRoXG4gICAgQGZpbmRGaWxlRm9yUGF0aCBAZGF0YS5kaXJlY3RvcmllcywgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyZWN0b3J5KSA9PlxuXG4gICAgICBpZiBlcnI/IFxuICAgICAgICAjIHNob3cgJ25vIGZpbGVzIGZvdW5kIGZvciAnICsgZmlsZVBhdGhcbiAgICAgICAgcmV0dXJuIGNiPyBlcnJcblxuICAgICAgZGVsZXRlIGZpbGVFbnRyeS5lbnRyeVxuICAgICAgQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzW2ZpbGVQYXRoXSA9IFxuICAgICAgICBmaWxlRW50cnk6IGNocm9tZS5maWxlU3lzdGVtLnJldGFpbkVudHJ5IGZpbGVFbnRyeVxuICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGhcbiAgICAgICAgZGlyZWN0b3J5OiBkaXJlY3RvcnlcbiAgICAgIGNiPyBudWxsLCBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdLCBkaXJlY3RvcnlcbiAgICAgIFxuXG5cbiAgZmluZEZpbGVJbkRpcmVjdG9yaWVzOiAoZGlyZWN0b3JpZXMsIHBhdGgsIGNiKSAtPlxuICAgIG15RGlycyA9IGRpcmVjdG9yaWVzLnNsaWNlKCkgXG4gICAgX3BhdGggPSBwYXRoXG4gICAgX2RpciA9IG15RGlycy5zaGlmdCgpXG5cbiAgICBARlMuZ2V0TG9jYWxGaWxlRW50cnkgX2RpciwgX3BhdGgsIChlcnIsIGZpbGVFbnRyeSkgPT5cbiAgICAgIGlmIGVycj9cbiAgICAgICAgaWYgbXlEaXJzLmxlbmd0aCA+IDBcbiAgICAgICAgICBAZmluZEZpbGVJbkRpcmVjdG9yaWVzIG15RGlycywgX3BhdGgsIGNiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjYj8gJ25vdCBmb3VuZCdcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgX2RpclxuXG4gIGZpbmRGaWxlRm9yUGF0aDogKGRpcnMsIHBhdGgsIGNiKSAtPlxuICAgIEBmaW5kRmlsZUluRGlyZWN0b3JpZXMgZGlycywgcGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXJlY3RvcnkpID0+XG4gICAgICBpZiBlcnI/XG4gICAgICAgIGlmIHBhdGggaXMgcGF0aC5yZXBsYWNlKC8uKj9cXC8vLCAnJylcbiAgICAgICAgICBjYj8gJ25vdCBmb3VuZCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggZGlycywgcGF0aC5yZXBsYWNlKC8uKj9cXC8vLCAnJyksIGNiXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGRpcmVjdG9yeVxuICBcbiAgbWFwQWxsUmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldFJlc291cmNlcyA9PlxuICAgICAgZGVidWdnZXI7XG4gICAgICBuZWVkID0gQGRhdGEuY3VycmVudFJlc291cmNlcy5sZW5ndGhcbiAgICAgIGZvdW5kID0gbm90Rm91bmQgPSAwXG4gICAgICBmb3IgaXRlbSBpbiBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG4gICAgICAgIGxvY2FsUGF0aCA9IEBVUkx0b0xvY2FsUGF0aCBpdGVtLnVybFxuICAgICAgICBpZiBsb2NhbFBhdGg/XG4gICAgICAgICAgQGdldEZpbGVNYXRjaCBsb2NhbFBhdGgsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICAgICAgICBuZWVkLS1cbiAgICAgICAgICAgIHNob3cgYXJndW1lbnRzXG4gICAgICAgICAgICBpZiBlcnI/IHRoZW4gbm90Rm91bmQrK1xuICAgICAgICAgICAgZWxzZSBmb3VuZCsrICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIGlmIG5lZWQgaXMgMFxuICAgICAgICAgICAgICBpZiBmb3VuZCA+IDBcbiAgICAgICAgICAgICAgICBjYj8gbnVsbCwgJ2RvbmUnXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjYj8gJ25vdGhpbmcgZm91bmQnXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIG5lZWQtLVxuICAgICAgICAgIG5vdEZvdW5kKytcbiAgICAgICAgICBpZiBuZWVkIGlzIDBcbiAgICAgICAgICAgIGNiPyAnbm90aGluZyBmb3VuZCdcblxuICBzZXRCYWRnZVRleHQ6ICh0ZXh0LCB0YWJJZCkgLT5cbiAgICBiYWRnZVRleHQgPSB0ZXh0IHx8ICcnICsgT2JqZWN0LmtleXMoQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzKS5sZW5ndGhcbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQgXG4gICAgICB0ZXh0OmJhZGdlVGV4dFxuICAgICAgIyB0YWJJZDp0YWJJZFxuICBcbiAgcmVtb3ZlQmFkZ2VUZXh0Oih0YWJJZCkgLT5cbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQgXG4gICAgICB0ZXh0OicnXG4gICAgICAjIHRhYklkOnRhYklkXG5cbiAgbHNSOiAoZGlyLCBvbnN1Y2Nlc3MsIG9uZXJyb3IpIC0+XG4gICAgQHJlc3VsdHMgPSB7fVxuXG4gICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICBcbiAgICAgIHRvZG8gPSAwXG4gICAgICBpZ25vcmUgPSAvLmdpdHwuaWRlYXxub2RlX21vZHVsZXN8Ym93ZXJfY29tcG9uZW50cy9cbiAgICAgIGRpdmUgPSAoZGlyLCByZXN1bHRzKSAtPlxuICAgICAgICB0b2RvKytcbiAgICAgICAgcmVhZGVyID0gZGlyLmNyZWF0ZVJlYWRlcigpXG4gICAgICAgIHJlYWRlci5yZWFkRW50cmllcyAoZW50cmllcykgLT5cbiAgICAgICAgICB0b2RvLS1cbiAgICAgICAgICBmb3IgZW50cnkgaW4gZW50cmllc1xuICAgICAgICAgICAgZG8gKGVudHJ5KSAtPlxuICAgICAgICAgICAgICByZXN1bHRzW2VudHJ5LmZ1bGxQYXRoXSA9IGVudHJ5XG4gICAgICAgICAgICAgIGlmIGVudHJ5LmZ1bGxQYXRoLm1hdGNoKGlnbm9yZSkgaXMgbnVsbFxuICAgICAgICAgICAgICAgIGlmIGVudHJ5LmlzRGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICB0b2RvKytcbiAgICAgICAgICAgICAgICAgIGRpdmUgZW50cnksIHJlc3VsdHMgXG4gICAgICAgICAgICAgICMgc2hvdyBlbnRyeVxuICAgICAgICAgIHNob3cgJ29uc3VjY2VzcycgaWYgdG9kbyBpcyAwXG4gICAgICAgICAgIyBzaG93ICdvbnN1Y2Nlc3MnIHJlc3VsdHMgaWYgdG9kbyBpcyAwXG4gICAgICAgICwoZXJyb3IpIC0+XG4gICAgICAgICAgdG9kby0tXG4gICAgICAgICAgIyBzaG93IGVycm9yXG4gICAgICAgICAgIyBvbmVycm9yIGVycm9yLCByZXN1bHRzIGlmIHRvZG8gaXMgMCBcblxuICAgICAgIyBjb25zb2xlLmxvZyBkaXZlIGRpckVudHJ5LCBAcmVzdWx0cyAgXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvblxuXG5cbiIsImNsYXNzIENvbmZpZ1xuICAjIEFQUF9JRDogJ2NlY2lmYWZwaGVnaG9mcGZka2hla2tpYmNpYmhnZmVjJ1xuICAjIEVYVEVOU0lPTl9JRDogJ2RkZGltYm5qaWJqY2FmYm9rbmJnaGVoYmZhamdnZ2VwJ1xuICBBUFBfSUQ6ICdkZW5lZmRvb2Zua2dqbXBiZnBrbmlocGdkaGFocGJsaCdcbiAgRVhURU5TSU9OX0lEOiAnaWpjam1wZWpvbm1pbW9vZmJjcGFsaWVqaGlrYWVvbWgnICBcbiAgU0VMRl9JRDogY2hyb21lLnJ1bnRpbWUuaWRcbiAgaXNDb250ZW50U2NyaXB0OiBsb2NhdGlvbi5wcm90b2NvbCBpc250ICdjaHJvbWUtZXh0ZW5zaW9uOidcbiAgRVhUX0lEOiBudWxsXG4gIEVYVF9UWVBFOiBudWxsXG4gIFxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBARVhUX0lEID0gaWYgQEFQUF9JRCBpcyBAU0VMRl9JRCB0aGVuIEBFWFRFTlNJT05fSUQgZWxzZSBAQVBQX0lEXG4gICAgQEVYVF9UWVBFID0gaWYgQEFQUF9JRCBpcyBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcbiAgICBAU0VMRl9UWVBFID0gaWYgQEFQUF9JRCBpc250IEBTRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuXG4gIHdyYXBJbmJvdW5kOiAob2JqLCBmbmFtZSwgZikgLT5cbiAgICAgIF9rbGFzID0gb2JqXG4gICAgICBATElTVEVOLkV4dCBmbmFtZSwgKGFyZ3MpIC0+XG4gICAgICAgIGlmIGFyZ3M/LmlzUHJveHk/XG4gICAgICAgICAgaWYgdHlwZW9mIGFyZ3VtZW50c1sxXSBpcyBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgIGlmIGFyZ3MuYXJndW1lbnRzPy5sZW5ndGggPj0gMFxuICAgICAgICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgYXJncy5hcmd1bWVudHMuY29uY2F0IGFyZ3VtZW50c1sxXSBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIFtdLmNvbmNhdCBhcmd1bWVudHNbMV1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBhcmd1bWVudHNcblxuICB3cmFwT2JqSW5ib3VuZDogKG9iaikgLT5cbiAgICAob2JqW2tleV0gPSBAd3JhcEluYm91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG4gIHdyYXBPdXRib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgLT5cbiAgICAgIG1zZyA9IHt9XG4gICAgICBtc2dbZm5hbWVdID0gXG4gICAgICAgIGlzUHJveHk6dHJ1ZVxuICAgICAgICBhcmd1bWVudHM6QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG4gICAgICBtc2dbZm5hbWVdLmlzUHJveHkgPSB0cnVlXG4gICAgICBfYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuXG4gICAgICBpZiBfYXJncy5sZW5ndGggaXMgMFxuICAgICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cyA9IHVuZGVmaW5lZCBcbiAgICAgICAgcmV0dXJuIEBNU0cuRXh0IG1zZywgKCkgLT4gdW5kZWZpbmVkXG5cbiAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzID0gX2FyZ3NcblxuICAgICAgY2FsbGJhY2sgPSBtc2dbZm5hbWVdLmFyZ3VtZW50cy5wb3AoKVxuICAgICAgaWYgdHlwZW9mIGNhbGxiYWNrIGlzbnQgXCJmdW5jdGlvblwiXG4gICAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzLnB1c2ggY2FsbGJhY2tcbiAgICAgICAgQE1TRy5FeHQgbXNnLCAoKSAtPiB1bmRlZmluZWRcbiAgICAgIGVsc2VcbiAgICAgICAgQE1TRy5FeHQgbXNnLCAoKSA9PlxuICAgICAgICAgIGFyZ3ogPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcbiAgICAgICAgICAjIHByb3h5QXJncyA9IFtpc1Byb3h5OmFyZ3pdXG4gICAgICAgICAgaWYgYXJnej8ubGVuZ3RoID4gMCBhbmQgYXJnelswXT8uaXNQcm94eT9cbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5IEAsIGFyZ3pbMF0uaXNQcm94eSBcblxuICB3cmFwT2JqT3V0Ym91bmQ6IChvYmopIC0+XG4gICAgKG9ialtrZXldID0gQHdyYXBPdXRib3VuZCBvYmosIG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsga2V5LCBvYmpba2V5XSkgZm9yIGtleSBvZiBvYmogd2hlbiB0eXBlb2Ygb2JqW2tleV0gaXMgXCJmdW5jdGlvblwiXG4gICAgb2JqXG5cbm1vZHVsZS5leHBvcnRzID0gQ29uZmlnIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuXG5jbGFzcyBGaWxlU3lzdGVtXG4gIGFwaTogY2hyb21lLmZpbGVTeXN0ZW1cbiAgcmV0YWluZWREaXJzOiB7fVxuICBMSVNURU46IExJU1RFTi5nZXQoKSBcbiAgTVNHOiBNU0cuZ2V0KClcbiAgcGxhdGZvcm06JydcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgY2hyb21lLnJ1bnRpbWUuZ2V0UGxhdGZvcm1JbmZvIChpbmZvKSA9PlxuICAgICAgQHBsYXRmb3JtID0gaW5mb1xuICAjIEBkaXJzOiBuZXcgRGlyZWN0b3J5U3RvcmVcbiAgIyBmaWxlVG9BcnJheUJ1ZmZlcjogKGJsb2IsIG9ubG9hZCwgb25lcnJvcikgLT5cbiAgIyAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgIyAgIHJlYWRlci5vbmxvYWQgPSBvbmxvYWRcblxuICAjICAgcmVhZGVyLm9uZXJyb3IgPSBvbmVycm9yXG5cbiAgIyAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBibG9iXG5cbiAgcmVhZEZpbGU6IChkaXJFbnRyeSwgcGF0aCwgY2IpIC0+XG4gICAgIyBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXC8vZywnXFxcXCcpIGlmIHBsYXRmb3JtIGlzICd3aW4nXG4gICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgcGF0aCxcbiAgICAgIChlcnIsIGZpbGVFbnRyeSkgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gY2I/IGVyclxuXG4gICAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGZpbGVcbiAgICAgICAgLChlcnIpID0+IGNiPyBlcnJcblxuICBnZXRGaWxlRW50cnk6IChkaXJFbnRyeSwgcGF0aCwgY2IpIC0+XG4gICAgIyBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXC8vZywnXFxcXCcpIGlmIHBsYXRmb3JtIGlzICd3aW4nXG4gICAgZGlyRW50cnkuZ2V0RmlsZSBwYXRoLCB7fSwgKGZpbGVFbnRyeSkgPT5cbiAgICAgIGNiPyBudWxsLCBmaWxlRW50cnlcbiAgICAsKGVycikgPT4gY2I/IGVyclxuXG4gICMgb3BlbkRpcmVjdG9yeTogKGNhbGxiYWNrKSAtPlxuICBvcGVuRGlyZWN0b3J5OiAoZGlyZWN0b3J5RW50cnksIGNiKSAtPlxuICAjIEBhcGkuY2hvb3NlRW50cnkgdHlwZTonb3BlbkRpcmVjdG9yeScsIChkaXJlY3RvcnlFbnRyeSwgZmlsZXMpID0+XG4gICAgQGFwaS5nZXREaXNwbGF5UGF0aCBkaXJlY3RvcnlFbnRyeSwgKHBhdGhOYW1lKSA9PlxuICAgICAgZGlyID1cbiAgICAgICAgICByZWxQYXRoOiBkaXJlY3RvcnlFbnRyeS5mdWxsUGF0aCAjLnJlcGxhY2UoJy8nICsgZGlyZWN0b3J5RW50cnkubmFtZSwgJycpXG4gICAgICAgICAgZGlyZWN0b3J5RW50cnlJZDogQGFwaS5yZXRhaW5FbnRyeShkaXJlY3RvcnlFbnRyeSlcbiAgICAgICAgICBlbnRyeTogZGlyZWN0b3J5RW50cnlcbiAgICAgIGNiPyBudWxsLCBwYXRoTmFtZSwgZGlyXG4gICAgICAgICAgIyBAZ2V0T25lRGlyTGlzdCBkaXJcbiAgICAgICAgICAjIFN0b3JhZ2Uuc2F2ZSAnZGlyZWN0b3JpZXMnLCBAc2NvcGUuZGlyZWN0b3JpZXMgKHJlc3VsdCkgLT5cblxuICBnZXRMb2NhbEZpbGVFbnRyeTogKGRpciwgZmlsZVBhdGgsIGNiKSA9PiBcbiAgICAjIGZpbGVQYXRoID0gZmlsZVBhdGgucmVwbGFjZSgvXFwvL2csJ1xcXFwnKSBpZiBwbGF0Zm9ybSBpcyAnd2luJ1xuICAgIGRpckVudHJ5ID0gY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoKSAtPlxuICAgIGlmIG5vdCBkaXJFbnRyeT9cbiAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBmaWxlUGF0aCwgY2JcbiAgICBlbHNlXG4gICAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBmaWxlUGF0aCwgY2JcblxuXG5cbiAgIyBnZXRMb2NhbEZpbGU6IChkaXIsIGZpbGVQYXRoLCBjYiwgZXJyb3IpID0+IFxuICAjICMgaWYgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0/XG4gICMgIyAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiAgIyAjICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAjICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICMgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICMgICAgICwoX2Vycm9yKSA9PiBlcnJvcihfZXJyb3IpXG4gICMgIyBlbHNlXG4gICMgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgIyAgICAgIyBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICMgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICBpZiBlcnI/IHRoZW4gY2I/IGVyclxuICAjICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGZpbGVcbiAgIyAgICwoX2Vycm9yKSA9PiBjYj8oX2Vycm9yKVxuXG4gICAgICAjIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBzdWNjZXNzLFxuICAgICAgIyAgICAgKGVycikgPT5cbiAgICAgICMgICAgICAgICBAZmluZEZpbGVGb3JQYXRoIGluZm8sIGNiXG5cbiAgIyBmaW5kRmlsZUZvclBhdGg6IChpbmZvLCBjYikgPT5cbiAgIyAgICAgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIGNiLCBpbmZvLnJlZmVyZXJcblxuICAjIGZpbmRGaWxlRm9yUXVlcnlTdHJpbmc6IChfdXJsLCBjYiwgZXJyb3IsIHJlZmVyZXIpID0+XG4gICMgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudChfdXJsKS5yZXBsYWNlIC8uKj9zbHJlZGlyXFw9LywgJydcblxuICAjICAgICBtYXRjaCA9IGl0ZW0gZm9yIGl0ZW0gaW4gQG1hcHMgd2hlbiB1cmwubWF0Y2gobmV3IFJlZ0V4cChpdGVtLnVybCkpPyBhbmQgaXRlbS51cmw/IGFuZCBub3QgbWF0Y2g/XG5cbiAgIyAgICAgaWYgbWF0Y2g/XG4gICMgICAgICAgICBpZiByZWZlcmVyP1xuICAjICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLm1hdGNoKC8uKlxcL1xcLy4qP1xcLyguKikvKT9bMV1cbiAgIyAgICAgICAgIGVsc2VcbiAgIyAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWF0Y2gudXJsKSwgbWF0Y2gucmVnZXhSZXBsXG5cbiAgIyAgICAgICAgIGZpbGVQYXRoLnJlcGxhY2UgJy8nLCAnXFxcXCcgaWYgcGxhdGZvcm0gaXMgJ3dpbidcblxuICAjICAgICAgICAgZGlyID0gQFN0b3JhZ2UuZGF0YS5kaXJlY3Rvcmllc1ttYXRjaC5kaXJlY3RvcnldXG5cbiAgIyAgICAgICAgIGlmIG5vdCBkaXI/IHRoZW4gcmV0dXJuIGVyciAnbm8gbWF0Y2gnXG5cbiAgIyAgICAgICAgIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAjICAgICAgICAgICAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiAgIyAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICAgICAgZWxzZVxuICAjICAgICAgICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAjICAgICAgICAgICAgICAgICBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICMgICAgICAgICAgICAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgICAgICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgICAgICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgZWxzZVxuICAjICAgICAgICAgZXJyb3IoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVTeXN0ZW0iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIExJU1RFTiBleHRlbmRzIENvbmZpZ1xuICBsb2NhbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZVxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgZXh0ZXJuYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbFxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgaW5zdGFuY2UgPSBudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG5cbiAgICBAbG9jYWwuYXBpLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlXG4gICAgQGV4dGVybmFsLmFwaT8uYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IExJU1RFTlxuXG4gIHNldFBvcnQ6IChwb3J0KSAtPlxuICAgIEBwb3J0ID0gcG9ydFxuICAgIHBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICBMb2NhbDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgIEBsb2NhbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIEV4dDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgICMgc2hvdyAnYWRkaW5nIGV4dCBsaXN0ZW5lciBmb3IgJyArIG1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBfb25NZXNzYWdlRXh0ZXJuYWw6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuXG4gICAgX3NlbmRSZXNwb25zZSA9ICh3aGF0ZXZlci4uLikgPT5cbiAgICAgIHRyeVxuICAgICAgICAjIHdoYXRldmVyLnNoaWZ0KCkgaWYgd2hhdGV2ZXJbMF0gaXMgbnVsbCBhbmQgd2hhdGV2ZXJbMV0/XG4gICAgICAgIHNlbmRSZXNwb25zZS5hcHBseSBudWxsLHByb3h5QXJncyA9IFtpc1Byb3h5OndoYXRldmVyXVxuXG4gICAgICBjYXRjaCBlXG4gICAgICAgIHVuZGVmaW5lZCAjIGVycm9yIGJlY2F1c2Ugbm8gcmVzcG9uc2Ugd2FzIHJlcXVlc3RlZCBmcm9tIHRoZSBNU0csIGRvbid0IGNhcmVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcbiAgICAgIFxuICAgICMgKHNob3cgXCI8PT0gR09UIEVYVEVSTkFMIE1FU1NBR0UgPT0gI3sgQEVYVF9UWVBFIH0gPT1cIiArIF9rZXkpIGZvciBfa2V5IG9mIHJlcXVlc3RcbiAgICBpZiBzZW5kZXIuaWQ/IFxuICAgICAgaWYgc2VuZGVyLmlkIGlzbnQgQEVYVF9JRCAjYW5kIHNlbmRlci5jb25zdHJ1Y3Rvci5uYW1lIGlzbnQgJ1BvcnQnXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG4gICAgXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCAjIGZvciBzeW5jaHJvbm91cyBzZW5kUmVzcG9uc2VcbiAgICAgICMgc2hvdyAncmV0dXJuaW5nIHRydWUnXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gIF9vbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuICAgIF9zZW5kUmVzcG9uc2UgPSA9PlxuICAgICAgdHJ5XG4gICAgICAgICMgc2hvdyAnY2FsbGluZyBzZW5kcmVzcG9uc2UnXG4gICAgICAgIHNlbmRSZXNwb25zZS5hcHBseSB0aGlzLGFyZ3VtZW50c1xuICAgICAgY2F0Y2ggZVxuICAgICAgICAjIHNob3cgZVxuICAgICAgcmVzcG9uc2VTdGF0dXMuY2FsbGVkID0gdHJ1ZVxuXG4gICAgIyAoc2hvdyBcIjw9PSBHT1QgTUVTU0FHRSA9PSAjeyBARVhUX1RZUEUgfSA9PVwiICsgX2tleSkgZm9yIF9rZXkgb2YgcmVxdWVzdFxuICAgIEBsb2NhbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBfc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZFxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gTElTVEVOIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBNU0cgZXh0ZW5kcyBDb25maWdcbiAgaW5zdGFuY2UgPSBudWxsXG4gIHBvcnQ6bnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IE1TR1xuXG4gIEBjcmVhdGVQb3J0OiAoKSAtPlxuXG4gIHNldFBvcnQ6IChwb3J0KSAtPlxuICAgIEBwb3J0ID0gcG9ydFxuXG4gIExvY2FsOiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICAoc2hvdyBcIj09IE1FU1NBR0UgI3sgX2tleSB9ID09PlwiKSBmb3IgX2tleSBvZiBtZXNzYWdlXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgbWVzc2FnZSwgcmVzcG9uZFxuICBFeHQ6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIChzaG93IFwiPT0gTUVTU0FHRSBFWFRFUk5BTCAjeyBfa2V5IH0gPT0+XCIpIGZvciBfa2V5IG9mIG1lc3NhZ2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBARVhUX0lELCBtZXNzYWdlLCByZXNwb25kXG4gIEV4dFBvcnQ6IChtZXNzYWdlKSAtPlxuICAgIHRyeVxuICAgICAgQHBvcnQucG9zdE1lc3NhZ2UgbWVzc2FnZVxuICAgIGNhdGNoXG4gICAgICBzaG93ICdlcnJvcidcbiAgICAgICMgQHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG4gICAgICAjIEBwb3J0LnBvc3RNZXNzYWdlIG1lc3NhZ2VcblxubW9kdWxlLmV4cG9ydHMgPSBNU0ciLCIvKipcbiAqIERFVkVMT1BFRCBCWVxuICogR0lMIExPUEVTIEJVRU5PXG4gKiBnaWxidWVuby5tYWlsQGdtYWlsLmNvbVxuICpcbiAqIFdPUktTIFdJVEg6XG4gKiBJRSA5KywgRkYgNCssIFNGIDUrLCBXZWJLaXQsIENIIDcrLCBPUCAxMissIEJFU0VOLCBSaGlubyAxLjcrXG4gKlxuICogRk9SSzpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWxhbmtlL1dhdGNoLkpTXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAgICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb21lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAgICAgLy8gbGlrZSBOb2RlLlxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICAgICAgd2luZG93LldhdGNoSlMgPSBmYWN0b3J5KCk7XG4gICAgICAgIHdpbmRvdy53YXRjaCA9IHdpbmRvdy5XYXRjaEpTLndhdGNoO1xuICAgICAgICB3aW5kb3cudW53YXRjaCA9IHdpbmRvdy5XYXRjaEpTLnVud2F0Y2g7XG4gICAgICAgIHdpbmRvdy5jYWxsV2F0Y2hlcnMgPSB3aW5kb3cuV2F0Y2hKUy5jYWxsV2F0Y2hlcnM7XG4gICAgfVxufShmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgV2F0Y2hKUyA9IHtcbiAgICAgICAgbm9Nb3JlOiBmYWxzZVxuICAgIH0sXG4gICAgbGVuZ3Roc3ViamVjdHMgPSBbXTtcblxuICAgIHZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKGZ1bmN0aW9uVG9DaGVjaykge1xuICAgICAgICAgICAgdmFyIGdldFR5cGUgPSB7fTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvblRvQ2hlY2sgJiYgZ2V0VHlwZS50b1N0cmluZy5jYWxsKGZ1bmN0aW9uVG9DaGVjaykgPT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9O1xuXG4gICAgdmFyIGlzSW50ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIHggJSAxID09PSAwO1xuICAgIH07XG5cbiAgICB2YXIgaXNBcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIHZhciBnZXRPYmpEaWZmID0gZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHZhciBhcGx1cyA9IFtdLFxuICAgICAgICBicGx1cyA9IFtdO1xuXG4gICAgICAgIGlmKCEodHlwZW9mIGEgPT0gXCJzdHJpbmdcIikgJiYgISh0eXBlb2YgYiA9PSBcInN0cmluZ1wiKSl7XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KGEpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJbaV0gPT09IHVuZGVmaW5lZCkgYXBsdXMucHVzaChpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBhKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGEuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGJbaV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwbHVzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KGIpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaj0wOyBqPGIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFbal0gPT09IHVuZGVmaW5lZCkgYnBsdXMucHVzaChqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaiBpbiBiKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGIuaGFzT3duUHJvcGVydHkoaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFbal0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJwbHVzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWRkZWQ6IGFwbHVzLFxuICAgICAgICAgICAgcmVtb3ZlZDogYnBsdXNcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY2xvbmUgPSBmdW5jdGlvbihvYmope1xuXG4gICAgICAgIGlmIChudWxsID09IG9iaiB8fCBcIm9iamVjdFwiICE9IHR5cGVvZiBvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29weSA9IG9iai5jb25zdHJ1Y3RvcigpO1xuXG4gICAgICAgIGZvciAodmFyIGF0dHIgaW4gb2JqKSB7XG4gICAgICAgICAgICBjb3B5W2F0dHJdID0gb2JqW2F0dHJdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvcHk7XG5cbiAgICB9XG5cbiAgICB2YXIgZGVmaW5lR2V0QW5kU2V0ID0gZnVuY3Rpb24gKG9iaiwgcHJvcE5hbWUsIGdldHRlciwgc2V0dGVyKSB7XG4gICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgIE9iamVjdC5vYnNlcnZlKG9ialtwcm9wTmFtZV0sIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgIHNldHRlcihkYXRhKTsgLy9UT0RPOiBhZGFwdCBvdXIgY2FsbGJhY2sgZGF0YSB0byBtYXRjaCBPYmplY3Qub2JzZXJ2ZSBkYXRhIHNwZWNcbiAgICAgICAgICAgIH0pOyBcblxuICAgICAgICB9IGNhdGNoKGUpIHtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcE5hbWUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXQ6IGdldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXQ6IHNldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2goZTIpIHtcbiAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVHZXR0ZXJfXy5jYWxsKG9iaiwgcHJvcE5hbWUsIGdldHRlcik7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVTZXR0ZXJfXy5jYWxsKG9iaiwgcHJvcE5hbWUsIHNldHRlcik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlMykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ3YXRjaEpTIGVycm9yOiBicm93c2VyIG5vdCBzdXBwb3J0ZWQgOi9cIilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZGVmaW5lUHJvcCA9IGZ1bmN0aW9uIChvYmosIHByb3BOYW1lLCB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcE5hbWUsIHtcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIG9ialtwcm9wTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgd2F0Y2ggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24oYXJndW1lbnRzWzFdKSkge1xuICAgICAgICAgICAgd2F0Y2hBbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHdhdGNoTWFueS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2F0Y2hPbmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgdmFyIHdhdGNoQWxsID0gZnVuY3Rpb24gKG9iaiwgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpIHtcblxuICAgICAgICBpZiAoKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9wcyA9IFtdO1xuXG5cbiAgICAgICAgaWYoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wID0gMDsgcHJvcCA8IG9iai5sZW5ndGg7IHByb3ArKykgeyAvL2ZvciBlYWNoIGl0ZW0gaWYgb2JqIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBvYmopIHsgLy9mb3IgZWFjaCBhdHRyaWJ1dGUgaWYgb2JqIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcDIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2gocHJvcDIpOyAvL3B1dCBpbiB0aGUgcHJvcHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB3YXRjaE1hbnkob2JqLCBwcm9wcywgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpOyAvL3dhdGNoIGFsbCBpdGVtcyBvZiB0aGUgcHJvcHNcblxuICAgICAgICBpZiAoYWRkTlJlbW92ZSkge1xuICAgICAgICAgICAgcHVzaFRvTGVuZ3RoU3ViamVjdHMob2JqLCBcIiQkd2F0Y2hsZW5ndGhzdWJqZWN0cm9vdFwiLCB3YXRjaGVyLCBsZXZlbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICB2YXIgd2F0Y2hNYW55ID0gZnVuY3Rpb24gKG9iaiwgcHJvcHMsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKSB7XG5cbiAgICAgICAgaWYgKCh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8cHJvcHMubGVuZ3RoOyBpKyspIHsgLy93YXRjaCBlYWNoIHByb3BlcnR5XG4gICAgICAgICAgICB2YXIgcHJvcCA9IHByb3BzW2ldO1xuICAgICAgICAgICAgd2F0Y2hPbmUob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgd2F0Y2hPbmUgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCkge1xuXG4gICAgICAgIGlmICgodHlwZW9mIG9iaiA9PSBcInN0cmluZ1wiKSB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoaXNGdW5jdGlvbihvYmpbcHJvcF0pKSB7IC8vZG9udCB3YXRjaCBpZiBpdCBpcyBhIGZ1bmN0aW9uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZihvYmpbcHJvcF0gIT0gbnVsbCAmJiAobGV2ZWwgPT09IHVuZGVmaW5lZCB8fCBsZXZlbCA+IDApKXtcbiAgICAgICAgICAgIHdhdGNoQWxsKG9ialtwcm9wXSwgd2F0Y2hlciwgbGV2ZWwhPT11bmRlZmluZWQ/IGxldmVsLTEgOiBsZXZlbCxudWxsLCBwYXRoICsgJy4nICsgcHJvcCk7IC8vcmVjdXJzaXZlbHkgd2F0Y2ggYWxsIGF0dHJpYnV0ZXMgb2YgdGhpc1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmaW5lV2F0Y2hlcihvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBwYXRoKTtcblxuICAgICAgICBpZihhZGROUmVtb3ZlICYmIChsZXZlbCA9PT0gdW5kZWZpbmVkIHx8IGxldmVsID4gMCkpe1xuICAgICAgICAgICAgcHVzaFRvTGVuZ3RoU3ViamVjdHMob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgdW53YXRjaCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbihhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB1bndhdGNoQWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB1bndhdGNoTWFueS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdW53YXRjaE9uZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHVud2F0Y2hBbGwgPSBmdW5jdGlvbiAob2JqLCB3YXRjaGVyKSB7XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFN0cmluZyB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgdmFyIHByb3BzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wID0gMDsgcHJvcCA8IG9iai5sZW5ndGg7IHByb3ArKykgeyAvL2ZvciBlYWNoIGl0ZW0gaWYgb2JqIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1bndhdGNoTWFueShvYmosIHByb3BzLCB3YXRjaGVyKTsgLy93YXRjaCBhbGwgaXRlbnMgb2YgdGhlIHByb3BzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdW53YXRjaFByb3BzSW5PYmplY3QgPSBmdW5jdGlvbiAob2JqMikge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wcyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AyIGluIG9iajIpIHsgLy9mb3IgZWFjaCBhdHRyaWJ1dGUgaWYgb2JqIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqMi5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmoyW3Byb3AyXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVud2F0Y2hQcm9wc0luT2JqZWN0KG9iajJbcHJvcDJdKTsgLy9yZWN1cnMgaW50byBvYmplY3QgcHJvcHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wMik7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVud2F0Y2hNYW55KG9iajIsIHByb3BzLCB3YXRjaGVyKTsgLy91bndhdGNoIGFsbCBvZiB0aGUgcHJvcHNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB1bndhdGNoUHJvcHNJbk9iamVjdChvYmopO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdmFyIHVud2F0Y2hNYW55ID0gZnVuY3Rpb24gKG9iaiwgcHJvcHMsIHdhdGNoZXIpIHtcblxuICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBwcm9wcykgeyAvL3dhdGNoIGVhY2ggYXR0cmlidXRlIG9mIFwicHJvcHNcIiBpZiBpcyBhbiBvYmplY3RcbiAgICAgICAgICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICB1bndhdGNoT25lKG9iaiwgcHJvcHNbcHJvcDJdLCB3YXRjaGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZGVmaW5lV2F0Y2hlciA9IGZ1bmN0aW9uIChvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBwYXRoKSB7XG5cbiAgICAgICAgdmFyIHZhbCA9IG9ialtwcm9wXTtcblxuICAgICAgICB3YXRjaEZ1bmN0aW9ucyhvYmosIHByb3ApO1xuXG4gICAgICAgIGlmICghb2JqLndhdGNoZXJzKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wKG9iaiwgXCJ3YXRjaGVyc1wiLCB7fSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICghb2JqLl9wYXRoKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wKG9iaiwgXCJfcGF0aFwiLCBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb2JqLndhdGNoZXJzW3Byb3BdKSB7XG4gICAgICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxvYmoud2F0Y2hlcnNbcHJvcF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKG9iai53YXRjaGVyc1twcm9wXVtpXSA9PT0gd2F0Y2hlcil7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0ucHVzaCh3YXRjaGVyKTsgLy9hZGQgdGhlIG5ldyB3YXRjaGVyIGluIHRoZSB3YXRjaGVycyBhcnJheVxuXG5cbiAgICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH07XG5cblxuICAgICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld3ZhbCkge1xuICAgICAgICAgICAgdmFyIG9sZHZhbCA9IHZhbDtcbiAgICAgICAgICAgIHZhbCA9IG5ld3ZhbDtcblxuICAgICAgICAgICAgaWYgKGxldmVsICE9PSAwICYmIG9ialtwcm9wXSl7XG4gICAgICAgICAgICAgICAgLy8gd2F0Y2ggc3ViIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICB3YXRjaEFsbChvYmpbcHJvcF0sIHdhdGNoZXIsIChsZXZlbD09PXVuZGVmaW5lZCk/bGV2ZWw6bGV2ZWwtMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdhdGNoRnVuY3Rpb25zKG9iaiwgcHJvcCk7XG5cbiAgICAgICAgICAgIGlmICghV2F0Y2hKUy5ub01vcmUpe1xuICAgICAgICAgICAgICAgIC8vaWYgKEpTT04uc3RyaW5naWZ5KG9sZHZhbCkgIT09IEpTT04uc3RyaW5naWZ5KG5ld3ZhbCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkdmFsICE9PSBuZXd2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKG9iaiwgcHJvcCwgXCJzZXRcIiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgICAgICAgICBXYXRjaEpTLm5vTW9yZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBkZWZpbmVHZXRBbmRTZXQob2JqLCBwcm9wLCBnZXR0ZXIsIHNldHRlcik7XG5cbiAgICB9O1xuXG4gICAgdmFyIGNhbGxXYXRjaGVycyA9IGZ1bmN0aW9uIChvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpIHtcbiAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yICh2YXIgd3I9MDsgd3I8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgd3IrKykge1xuICAgICAgICAgICAgICAgIG9iai53YXRjaGVyc1twcm9wXVt3cl0uY2FsbChvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHsvL2NhbGwgYWxsXG4gICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBhY3Rpb24sIG5ld3ZhbCwgb2xkdmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQHRvZG8gY29kZSByZWxhdGVkIHRvIFwid2F0Y2hGdW5jdGlvbnNcIiBpcyBjZXJ0YWlubHkgYnVnZ3lcbiAgICB2YXIgbWV0aG9kTmFtZXMgPSBbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzbGljZScsICd1bnNoaWZ0JywgJ3NwbGljZSddO1xuICAgIHZhciBkZWZpbmVBcnJheU1ldGhvZFdhdGNoZXIgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCBvcmlnaW5hbCwgbWV0aG9kTmFtZSkge1xuICAgICAgICBkZWZpbmVQcm9wKG9ialtwcm9wXSwgbWV0aG9kTmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gb3JpZ2luYWwuYXBwbHkob2JqW3Byb3BdLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgd2F0Y2hPbmUob2JqLCBvYmpbcHJvcF0pO1xuICAgICAgICAgICAgaWYgKG1ldGhvZE5hbWUgIT09ICdzbGljZScpIHtcbiAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBtZXRob2ROYW1lLGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgd2F0Y2hGdW5jdGlvbnMgPSBmdW5jdGlvbihvYmosIHByb3ApIHtcblxuICAgICAgICBpZiAoKCFvYmpbcHJvcF0pIHx8IChvYmpbcHJvcF0gaW5zdGFuY2VvZiBTdHJpbmcpIHx8ICghaXNBcnJheShvYmpbcHJvcF0pKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IG1ldGhvZE5hbWVzLmxlbmd0aCwgbWV0aG9kTmFtZTsgaS0tOykge1xuICAgICAgICAgICAgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgICAgICAgZGVmaW5lQXJyYXlNZXRob2RXYXRjaGVyKG9iaiwgcHJvcCwgb2JqW3Byb3BdW21ldGhvZE5hbWVdLCBtZXRob2ROYW1lKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB1bndhdGNoT25lID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgd2F0Y2hlcikge1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdyA9IG9iai53YXRjaGVyc1twcm9wXVtpXTtcblxuICAgICAgICAgICAgaWYodyA9PSB3YXRjaGVyKSB7XG4gICAgICAgICAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbW92ZUZyb21MZW5ndGhTdWJqZWN0cyhvYmosIHByb3AsIHdhdGNoZXIpO1xuICAgIH07XG5cbiAgICB2YXIgbG9vcCA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgZm9yKHZhciBpPTA7IGk8bGVuZ3Roc3ViamVjdHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgdmFyIHN1YmogPSBsZW5ndGhzdWJqZWN0c1tpXTtcblxuICAgICAgICAgICAgaWYgKHN1YmoucHJvcCA9PT0gXCIkJHdhdGNobGVuZ3Roc3ViamVjdHJvb3RcIikge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpZmZlcmVuY2UgPSBnZXRPYmpEaWZmKHN1Ymoub2JqLCBzdWJqLmFjdHVhbCk7XG5cbiAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCB8fCBkaWZmZXJlbmNlLnJlbW92ZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZCAhPSBkaWZmZXJlbmNlLnJlbW92ZWQgJiYgKGRpZmZlcmVuY2UuYWRkZWRbMF0gIT0gZGlmZmVyZW5jZS5yZW1vdmVkWzBdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoTWFueShzdWJqLm9iaiwgZGlmZmVyZW5jZS5hZGRlZCwgc3Viai53YXRjaGVyLCBzdWJqLmxldmVsIC0gMSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Ymoud2F0Y2hlci5jYWxsKHN1Ymoub2JqLCBcInJvb3RcIiwgXCJkaWZmZXJlbnRhdHRyXCIsIGRpZmZlcmVuY2UsIHN1YmouYWN0dWFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWJqLmFjdHVhbCA9IGNsb25lKHN1Ymoub2JqKTtcblxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKHN1Ymoub2JqW3N1YmoucHJvcF0gPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHZhciBkaWZmZXJlbmNlID0gZ2V0T2JqRGlmZihzdWJqLm9ialtzdWJqLnByb3BdLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCB8fCBkaWZmZXJlbmNlLnJlbW92ZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaj0wOyBqPHN1Ymoub2JqLndhdGNoZXJzW3N1YmoucHJvcF0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaE1hbnkoc3Viai5vYmpbc3Viai5wcm9wXSwgZGlmZmVyZW5jZS5hZGRlZCwgc3Viai5vYmoud2F0Y2hlcnNbc3Viai5wcm9wXVtqXSwgc3Viai5sZXZlbCAtIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKHN1Ymoub2JqLCBzdWJqLnByb3AsIFwiZGlmZmVyZW50YXR0clwiLCBkaWZmZXJlbmNlLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3Viai5hY3R1YWwgPSBjbG9uZShzdWJqLm9ialtzdWJqLnByb3BdKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgcHVzaFRvTGVuZ3RoU3ViamVjdHMgPSBmdW5jdGlvbihvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsKXtcbiAgICAgICAgXG4gICAgICAgIHZhciBhY3R1YWw7XG5cbiAgICAgICAgaWYgKHByb3AgPT09IFwiJCR3YXRjaGxlbmd0aHN1YmplY3Ryb290XCIpIHtcbiAgICAgICAgICAgIGFjdHVhbCA9ICBjbG9uZShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWN0dWFsID0gY2xvbmUob2JqW3Byb3BdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxlbmd0aHN1YmplY3RzLnB1c2goe1xuICAgICAgICAgICAgb2JqOiBvYmosXG4gICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgICAgICAgICB3YXRjaGVyOiB3YXRjaGVyLFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgcmVtb3ZlRnJvbUxlbmd0aFN1YmplY3RzID0gZnVuY3Rpb24ob2JqLCBwcm9wLCB3YXRjaGVyKXtcblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8bGVuZ3Roc3ViamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzdWJqID0gbGVuZ3Roc3ViamVjdHNbaV07XG5cbiAgICAgICAgICAgIGlmIChzdWJqLm9iaiA9PSBvYmogJiYgc3Viai5wcm9wID09IHByb3AgJiYgc3Viai53YXRjaGVyID09IHdhdGNoZXIpIHtcbiAgICAgICAgICAgICAgICBsZW5ndGhzdWJqZWN0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBzZXRJbnRlcnZhbChsb29wLCA1MCk7XG5cbiAgICBXYXRjaEpTLndhdGNoID0gd2F0Y2g7XG4gICAgV2F0Y2hKUy51bndhdGNoID0gdW53YXRjaDtcbiAgICBXYXRjaEpTLmNhbGxXYXRjaGVycyA9IGNhbGxXYXRjaGVycztcblxuICAgIHJldHVybiBXYXRjaEpTO1xuXG59KSk7XG4iLCJjbGFzcyBOb3RpZmljYXRpb25cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgc2hvdzogKHRpdGxlLCBtZXNzYWdlKSAtPlxuICAgIHVuaXF1ZUlkID0gKGxlbmd0aD04KSAtPlxuICAgICAgaWQgPSBcIlwiXG4gICAgICBpZCArPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMikgd2hpbGUgaWQubGVuZ3RoIDwgbGVuZ3RoXG4gICAgICBpZC5zdWJzdHIgMCwgbGVuZ3RoXG5cbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUgdW5pcXVlSWQoKSxcbiAgICAgIHR5cGU6J2Jhc2ljJ1xuICAgICAgdGl0bGU6dGl0bGVcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgIGljb25Vcmw6J2ltYWdlcy9pY29uLTM4LnBuZycsXG4gICAgICAoY2FsbGJhY2spIC0+XG4gICAgICAgIHVuZGVmaW5lZFxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGlmaWNhdGlvbiIsIiNUT0RPOiByZXdyaXRlIHRoaXMgY2xhc3MgdXNpbmcgdGhlIG5ldyBjaHJvbWUuc29ja2V0cy4qIGFwaSB3aGVuIHlvdSBjYW4gbWFuYWdlIHRvIG1ha2UgaXQgd29ya1xuY2xhc3MgU2VydmVyXG4gIHNvY2tldDogY2hyb21lLnNvY2tldFxuICAjIHRjcDogY2hyb21lLnNvY2tldHMudGNwXG4gIHNvY2tldFByb3BlcnRpZXM6XG4gICAgICBwZXJzaXN0ZW50OnRydWVcbiAgICAgIG5hbWU6J1NMUmVkaXJlY3RvcidcbiAgIyBzb2NrZXRJbmZvOm51bGxcbiAgZ2V0TG9jYWxGaWxlOm51bGxcbiAgc29ja2V0SWRzOltdXG4gIHN0YXR1czpcbiAgICBob3N0Om51bGxcbiAgICBwb3J0Om51bGxcbiAgICBtYXhDb25uZWN0aW9uczo1MFxuICAgIGlzT246ZmFsc2VcbiAgICBzb2NrZXRJbmZvOm51bGxcbiAgICB1cmw6bnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIEBzdGF0dXMuaG9zdCA9IFwiMTI3LjAuMC4xXCJcbiAgICBAc3RhdHVzLnBvcnQgPSAxMDAxMlxuICAgIEBzdGF0dXMubWF4Q29ubmVjdGlvbnMgPSA1MFxuICAgIEBzdGF0dXMudXJsID0gJ2h0dHA6Ly8nICsgQHN0YXR1cy5ob3N0ICsgJzonICsgQHN0YXR1cy5wb3J0ICsgJy8nXG4gICAgQHN0YXR1cy5pc09uID0gZmFsc2VcblxuXG4gIHN0YXJ0OiAoaG9zdCxwb3J0LG1heENvbm5lY3Rpb25zLCBjYikgLT5cbiAgICBpZiBob3N0PyB0aGVuIEBzdGF0dXMuaG9zdCA9IGhvc3RcbiAgICBpZiBwb3J0PyB0aGVuIEBzdGF0dXMucG9ydCA9IHBvcnRcbiAgICBpZiBtYXhDb25uZWN0aW9ucz8gdGhlbiBAc3RhdHVzLm1heENvbm5lY3Rpb25zID0gbWF4Q29ubmVjdGlvbnNcblxuICAgIEBraWxsQWxsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICByZXR1cm4gY2I/IGVyciBpZiBlcnI/XG5cbiAgICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG4gICAgICBAc29ja2V0LmNyZWF0ZSAndGNwJywge30sIChzb2NrZXRJbmZvKSA9PlxuICAgICAgICBAc3RhdHVzLnNvY2tldEluZm8gPSBzb2NrZXRJbmZvXG4gICAgICAgIEBzb2NrZXRJZHMgPSBbXVxuICAgICAgICBAc29ja2V0SWRzLnB1c2ggQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0ICdzb2NrZXRJZHMnOkBzb2NrZXRJZHNcbiAgICAgICAgQHNvY2tldC5saXN0ZW4gQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkLCBAc3RhdHVzLmhvc3QsIEBzdGF0dXMucG9ydCwgKHJlc3VsdCkgPT5cbiAgICAgICAgICBpZiByZXN1bHQgPiAtMVxuICAgICAgICAgICAgc2hvdyAnbGlzdGVuaW5nICcgKyBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgICAgIEBzdGF0dXMuaXNPbiA9IHRydWVcbiAgICAgICAgICAgIEBzdGF0dXMudXJsID0gJ2h0dHA6Ly8nICsgQHN0YXR1cy5ob3N0ICsgJzonICsgQHN0YXR1cy5wb3J0ICsgJy8nXG4gICAgICAgICAgICBAc29ja2V0LmFjY2VwdCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcbiAgICAgICAgICAgIGNiPyBudWxsLCBAc3RhdHVzXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2I/IHJlc3VsdFxuXG5cbiAga2lsbEFsbDogKGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0ICdzb2NrZXRJZHMnLCAocmVzdWx0KSA9PlxuICAgICAgQHNvY2tldElkcyA9IHJlc3VsdC5zb2NrZXRJZHNcbiAgICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG4gICAgICByZXR1cm4gY2I/IG51bGwsICdzdWNjZXNzJyB1bmxlc3MgQHNvY2tldElkcz9cbiAgICAgIGNudCA9IDBcbiAgICAgIGkgPSAwXG4gICAgICBcbiAgICAgIHdoaWxlIGkgPCBAc29ja2V0SWRzWzBdXG4gICAgICAgIEBzb2NrZXQuZGVzdHJveSBpXG4gICAgICAgIGkrK1xuXG4gICAgICBmb3IgcyBpbiBAc29ja2V0SWRzXG4gICAgICAgIGRvIChzKSA9PlxuICAgICAgICAgIGNudCsrXG4gICAgICAgICAgQHNvY2tldC5nZXRJbmZvIHMsIChzb2NrZXRJbmZvKSA9PlxuICAgICAgICAgICAgY250LS1cbiAgICAgICAgICAgIGlmIG5vdCBjaHJvbWUucnVudGltZS5sYXN0RXJyb3I/XG4gICAgICAgICAgICAgIEBzb2NrZXQuZGlzY29ubmVjdCBzIGlmIEBzdGF0dXMuc29ja2V0SW5mbz8uY29ubmVjdGVkIG9yIG5vdCBAc3RhdHVzLnNvY2tldEluZm8/XG4gICAgICAgICAgICAgIEBzb2NrZXQuZGVzdHJveSBzXG5cbiAgICAgICAgICAgIGNiPyBudWxsLCAnc3VjY2VzcycgaWYgY250IGlzIDBcblxuICBzdG9wOiAoY2IpIC0+XG4gICAgQGtpbGxBbGwgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG4gICAgICBpZiBlcnI/IFxuICAgICAgICBjYj8gZXJyXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLHN1Y2Nlc3NcblxuXG4gIF9vblJlY2VpdmU6IChyZWNlaXZlSW5mbykgPT5cbiAgICBzaG93KFwiQ2xpZW50IHNvY2tldCAncmVjZWl2ZScgZXZlbnQ6IHNkPVwiICsgcmVjZWl2ZUluZm8uc29ja2V0SWRcbiAgICArIFwiLCBieXRlcz1cIiArIHJlY2VpdmVJbmZvLmRhdGEuYnl0ZUxlbmd0aClcblxuICBfb25MaXN0ZW46IChzZXJ2ZXJTb2NrZXRJZCwgcmVzdWx0Q29kZSkgPT5cbiAgICByZXR1cm4gc2hvdyAnRXJyb3IgTGlzdGVuaW5nOiAnICsgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UgaWYgcmVzdWx0Q29kZSA8IDBcbiAgICBAc2VydmVyU29ja2V0SWQgPSBzZXJ2ZXJTb2NrZXRJZFxuICAgIEB0Y3BTZXJ2ZXIub25BY2NlcHQuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdFxuICAgIEB0Y3BTZXJ2ZXIub25BY2NlcHRFcnJvci5hZGRMaXN0ZW5lciBAX29uQWNjZXB0RXJyb3JcbiAgICBAdGNwLm9uUmVjZWl2ZS5hZGRMaXN0ZW5lciBAX29uUmVjZWl2ZVxuICAgICMgc2hvdyBcIltcIitzb2NrZXRJbmZvLnBlZXJBZGRyZXNzK1wiOlwiK3NvY2tldEluZm8ucGVlclBvcnQrXCJdIENvbm5lY3Rpb24gYWNjZXB0ZWQhXCI7XG4gICAgIyBpbmZvID0gQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkXG4gICAgIyBAZ2V0RmlsZSB1cmksIChmaWxlKSAtPlxuICBfb25BY2NlcHRFcnJvcjogKGVycm9yKSAtPlxuICAgIHNob3cgZXJyb3JcblxuICBfb25BY2NlcHQ6IChzb2NrZXRJbmZvKSA9PlxuICAgICMgcmV0dXJuIG51bGwgaWYgaW5mby5zb2NrZXRJZCBpc250IEBzZXJ2ZXJTb2NrZXRJZFxuICAgIHNob3coXCJTZXJ2ZXIgc29ja2V0ICdhY2NlcHQnIGV2ZW50OiBzZD1cIiArIHNvY2tldEluZm8uc29ja2V0SWQpXG4gICAgaWYgc29ja2V0SW5mbz8uc29ja2V0SWQ/XG4gICAgICBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWQsIChlcnIsIGluZm8pID0+XG4gICAgICAgIFxuICAgICAgICBpZiBlcnI/IHRoZW4gcmV0dXJuIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG5cbiAgICAgICAgQGdldExvY2FsRmlsZSBpbmZvLCAoZXJyLCBmaWxlRW50cnksIGZpbGVSZWFkZXIpID0+XG4gICAgICAgICAgaWYgZXJyPyB0aGVuIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG4gICAgICAgICAgZWxzZSBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SW5mby5zb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlUmVhZGVyLCBpbmZvLmtlZXBBbGl2ZVxuICAgIGVsc2VcbiAgICAgIHNob3cgXCJObyBzb2NrZXQ/IVwiXG4gICAgIyBAc29ja2V0LmFjY2VwdCBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cblxuXG4gIHN0cmluZ1RvVWludDhBcnJheTogKHN0cmluZykgLT5cbiAgICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyaW5nLmxlbmd0aClcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIGkgPSAwXG5cbiAgICB3aGlsZSBpIDwgc3RyaW5nLmxlbmd0aFxuICAgICAgdmlld1tpXSA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG4gICAgICBpKytcbiAgICB2aWV3XG5cbiAgYXJyYXlCdWZmZXJUb1N0cmluZzogKGJ1ZmZlcikgLT5cbiAgICBzdHIgPSBcIlwiXG4gICAgdUFycmF5VmFsID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIHMgPSAwXG5cbiAgICB3aGlsZSBzIDwgdUFycmF5VmFsLmxlbmd0aFxuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodUFycmF5VmFsW3NdKVxuICAgICAgcysrXG4gICAgc3RyXG5cbiAgX3dyaXRlMjAwUmVzcG9uc2U6IChzb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlLCBrZWVwQWxpdmUpIC0+XG4gICAgY29udGVudFR5cGUgPSAoaWYgKGZpbGUudHlwZSBpcyBcIlwiKSB0aGVuIFwidGV4dC9wbGFpblwiIGVsc2UgZmlsZS50eXBlKVxuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgMjAwIE9LXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuXG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXJcbiAgICByZWFkZXIub25sb2FkID0gKGV2KSA9PlxuICAgICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZXYudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICAgIHNob3cgd3JpdGVJbmZvXG4gICAgICAgICMgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIub25lcnJvciA9IChlcnJvcikgPT5cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBmaWxlXG5cblxuICAgICMgQGVuZCBzb2NrZXRJZFxuICAgICMgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAjIGZpbGVSZWFkZXIub25sb2FkID0gKGUpID0+XG4gICAgIyAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgIyAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAjICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgIyAgICAgICBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SWRcblxuXG4gIF9yZWFkRnJvbVNvY2tldDogKHNvY2tldElkLCBjYikgLT5cbiAgICBAc29ja2V0LnJlYWQgc29ja2V0SWQsIChyZWFkSW5mbykgPT5cbiAgICAgIHNob3cgXCJSRUFEXCIsIHJlYWRJbmZvXG5cbiAgICAgICMgUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICBkYXRhID0gQGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSlcbiAgICAgIHNob3cgZGF0YVxuXG4gICAgICBrZWVwQWxpdmUgPSBmYWxzZVxuICAgICAga2VlcEFsaXZlID0gdHJ1ZSBpZiBkYXRhLmluZGV4T2YgJ0Nvbm5lY3Rpb246IGtlZXAtYWxpdmUnIGlzbnQgLTFcblxuICAgICAgaWYgZGF0YS5pbmRleE9mKFwiR0VUIFwiKSBpc250IDBcbiAgICAgICAgcmV0dXJuIGNiPyAnNDA0Jywga2VlcEFsaXZlOmtlZXBBbGl2ZVxuXG5cblxuICAgICAgdXJpRW5kID0gZGF0YS5pbmRleE9mKFwiIFwiLCA0KVxuXG4gICAgICByZXR1cm4gZW5kIHNvY2tldElkIGlmIHVyaUVuZCA8IDBcblxuICAgICAgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKVxuICAgICAgaWYgbm90IHVyaT9cbiAgICAgICAgcmV0dXJuIGNiPyAnNDA0Jywga2VlcEFsaXZlOmtlZXBBbGl2ZVxuXG4gICAgICBpbmZvID1cbiAgICAgICAgdXJpOiB1cmlcbiAgICAgICAga2VlcEFsaXZlOmtlZXBBbGl2ZVxuICAgICAgaW5mby5yZWZlcmVyID0gZGF0YS5tYXRjaCgvUmVmZXJlcjpcXHMoLiopLyk/WzFdXG4gICAgICAjc3VjY2Vzc1xuICAgICAgY2I/IG51bGwsIGluZm9cblxuICBlbmQ6IChzb2NrZXRJZCwga2VlcEFsaXZlKSAtPlxuICAgICAgIyBpZiBrZWVwQWxpdmVcbiAgICAgICMgICBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAjIGVsc2VcbiAgICBAc29ja2V0LmRpc2Nvbm5lY3Qgc29ja2V0SWRcbiAgICBAc29ja2V0LmRlc3Ryb3kgc29ja2V0SWRcbiAgICBzaG93ICdlbmRpbmcgJyArIHNvY2tldElkXG4gICAgQHNvY2tldC5hY2NlcHQgQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAgX3dyaXRlRXJyb3I6IChzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIC0+XG4gICAgZmlsZSA9IHNpemU6IDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIlxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGVcbiAgICBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiICMoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIlxuICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcnZlclxuIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuXG5XYXRjaEpTID0gcmVxdWlyZSAnd2F0Y2hqcydcbndhdGNoID0gV2F0Y2hKUy53YXRjaFxudW53YXRjaCA9IFdhdGNoSlMudW53YXRjaFxuY2FsbFdhdGNoZXJzID0gV2F0Y2hKUy5jYWxsV2F0Y2hlcnNcblxuY2xhc3MgU3RvcmFnZVxuICBhcGk6IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gIExJU1RFTjogTElTVEVOLmdldCgpIFxuICBNU0c6IE1TRy5nZXQoKVxuICBkYXRhOiBcbiAgICBjdXJyZW50UmVzb3VyY2VzOiBbXVxuICAgIGRpcmVjdG9yaWVzOltdXG4gICAgbWFwczpbXVxuICAgIHRhYk1hcHM6e31cbiAgICBjdXJyZW50RmlsZU1hdGNoZXM6e31cbiAgXG4gIHNlc3Npb246e31cblxuICBvbkRhdGFMb2FkZWQ6IC0+XG5cbiAgY2FsbGJhY2s6ICgpIC0+XG4gIG5vdGlmeU9uQ2hhbmdlOiAoKSAtPlxuICBjb25zdHJ1Y3RvcjogKF9vbkRhdGFMb2FkZWQpIC0+XG4gICAgQG9uRGF0YUxvYWRlZCA9IF9vbkRhdGFMb2FkZWQgaWYgX29uRGF0YUxvYWRlZD9cbiAgICBAYXBpLmdldCAocmVzdWx0cykgPT5cbiAgICAgIEBkYXRhW2tdID0gcmVzdWx0c1trXSBmb3IgayBvZiByZXN1bHRzXG5cbiAgICAgIHdhdGNoQW5kTm90aWZ5IEAsJ2RhdGFDaGFuZ2VkJywgQGRhdGEsIHRydWVcblxuICAgICAgd2F0Y2hBbmROb3RpZnkgQCwnc2Vzc2lvbkRhdGEnLCBAc2Vzc2lvbiwgZmFsc2VcblxuICAgICAgQG9uRGF0YUxvYWRlZCBAZGF0YVxuXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpIC0+XG4gICAgXG4gIHdhdGNoQW5kTm90aWZ5ID0gKF90aGlzLCBtc2dLZXksIG9iaiwgc3RvcmUpIC0+XG5cbiAgICAgIF9saXN0ZW5lciA9IChwcm9wLCBhY3Rpb24sIG5ld1ZhbCwgb2xkVmFsKSAtPlxuICAgICAgICBpZiAoYWN0aW9uIGlzIFwic2V0XCIgb3IgXCJkaWZmZXJlbnRhdHRyXCIpIGFuZCBfdGhpcy5ub1dhdGNoIGlzIGZhbHNlXG4gICAgICAgICAgaWYgbm90IC9eXFxkKyQvLnRlc3QocHJvcClcbiAgICAgICAgICAgIHNob3cgYXJndW1lbnRzXG4gICAgICAgICAgICBfdGhpcy5hcGkuc2V0IG9iaiBpZiBzdG9yZVxuICAgICAgICAgICAgbXNnID0ge31cbiAgICAgICAgICAgIG1zZ1ttc2dLZXldID0gb2JqXG4gICAgICAgICAgICAjIHVud2F0Y2ggb2JqLCBfbGlzdGVuZXIsMyx0cnVlXG4gICAgICAgICAgICBfdGhpcy5NU0cuRXh0UG9ydCBtc2dcbiAgICAgICAgXG4gICAgICBfdGhpcy5ub1dhdGNoID0gZmFsc2VcbiAgICAgIHdhdGNoIG9iaiwgX2xpc3RlbmVyLDMsdHJ1ZVxuXG4gICAgICBfdGhpcy5MSVNURU4uRXh0IG1zZ0tleSwgKGRhdGEpIC0+XG4gICAgICAgIF90aGlzLm5vV2F0Y2ggPSB0cnVlXG4gICAgICAgICMgdW53YXRjaCBvYmosIF9saXN0ZW5lciwzLHRydWVcbiAgICAgICAgXG4gICAgICAgIG9ialtrXSA9IGRhdGFba10gZm9yIGsgb2YgZGF0YVxuICAgICAgICBzZXRUaW1lb3V0ICgpIC0+IFxuICAgICAgICAgIF90aGlzLm5vV2F0Y2ggPSBmYWxzZVxuICAgICAgICAsMjAwXG5cbiAgc2F2ZTogKGtleSwgaXRlbSwgY2IpIC0+XG5cbiAgICBvYmogPSB7fVxuICAgIG9ialtrZXldID0gaXRlbVxuICAgIEBkYXRhW2tleV0gPSBpdGVtXG4gICAgQGFwaS5zZXQgb2JqLCAocmVzKSA9PlxuICAgICAgY2I/KClcbiAgICAgIEBjYWxsYmFjaz8oKVxuIFxuICBzYXZlQWxsOiAoZGF0YSwgY2IpIC0+XG5cbiAgICBpZiBkYXRhPyBcbiAgICAgIEBhcGkuc2V0IGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gXG4gICAgZWxzZVxuICAgICAgQGFwaS5zZXQgQGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gXG5cbiAgcmV0cmlldmU6IChrZXksIGNiKSAtPlxuICAgIEBvYnNlcnZlci5zdG9wKClcbiAgICBAYXBpLmdldCBrZXksIChyZXN1bHRzKSAtPlxuICAgICAgQGRhdGFbcl0gPSByZXN1bHRzW3JdIGZvciByIG9mIHJlc3VsdHNcbiAgICAgIGlmIGNiPyB0aGVuIGNiIHJlc3VsdHNba2V5XVxuXG4gIHJldHJpZXZlQWxsOiAoY2IpIC0+XG4gICAgIyBAb2JzZXJ2ZXIuc3RvcCgpXG4gICAgQGFwaS5nZXQgKHJlc3VsdCkgPT5cbiAgICAgIGZvciBjIG9mIHJlc3VsdCBcbiAgICAgICMgICBkZWxldGUgQGRhdGFbY11cbiAgICAgICAgQGRhdGFbY10gPSByZXN1bHRbY10gXG4gICAgICAjIEBkYXRhID0gcmVzdWx0XG4gICAgICAgIEBNU0cuRXh0UG9ydCAnZGF0YUNoYW5nZWQnOlxuICAgICAgICAgIHBhdGg6Y1xuICAgICAgICAgIHZhbHVlOnJlc3VsdFtjXVxuIFxuXG4gICAgICBAYXBpLnNldCBAZGF0YVxuICAgICAgIyBAY2FsbGJhY2s/IHJlc3VsdFxuICAgICAgY2I/IHJlc3VsdFxuICAgICAgQG9uRGF0YUxvYWRlZCBAZGF0YVxuXG4gIG9uRGF0YUxvYWRlZDogKGRhdGEpIC0+XG5cbiAgb25DaGFuZ2VkOiAoa2V5LCBjYikgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsIG5hbWVzcGFjZSkgLT5cbiAgICAgIGlmIGNoYW5nZXNba2V5XT8gYW5kIGNiPyB0aGVuIGNiIGNoYW5nZXNba2V5XS5uZXdWYWx1ZVxuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzXG5cbiAgb25DaGFuZ2VkQWxsOiAoKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcyxuYW1lc3BhY2UpID0+XG4gICAgICBoYXNDaGFuZ2VzID0gZmFsc2VcbiAgICAgIGZvciBjIG9mIGNoYW5nZXMgd2hlbiBjaGFuZ2VzW2NdLm5ld1ZhbHVlICE9IGNoYW5nZXNbY10ub2xkVmFsdWUgYW5kIGMgaXNudCdzb2NrZXRJZHMnXG4gICAgICAgIChjKSA9PiBcbiAgICAgICAgICBAZGF0YVtjXSA9IGNoYW5nZXNbY10ubmV3VmFsdWUgXG4gICAgICAgICAgc2hvdyAnZGF0YSBjaGFuZ2VkOiAnXG4gICAgICAgICAgc2hvdyBjXG4gICAgICAgICAgc2hvdyBAZGF0YVtjXVxuXG4gICAgICAgICAgaGFzQ2hhbmdlcyA9IHRydWVcblxuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzIGlmIGhhc0NoYW5nZXNcbiAgICAgIHNob3cgJ2NoYW5nZWQnIGlmIGhhc0NoYW5nZXNcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlXG4iLCIjIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxNzQyMDkzXG5tb2R1bGUuZXhwb3J0cyA9ICgoKSAtPlxuXG4gIGRlYnVnID0gZmFsc2VcbiAgXG4gIHJldHVybiAod2luZG93LnNob3cgPSAoKSAtPikgaWYgbm90IGRlYnVnXG5cbiAgbWV0aG9kcyA9IFtcbiAgICAnYXNzZXJ0JywgJ2NsZWFyJywgJ2NvdW50JywgJ2RlYnVnJywgJ2RpcicsICdkaXJ4bWwnLCAnZXJyb3InLFxuICAgICdleGNlcHRpb24nLCAnZ3JvdXAnLCAnZ3JvdXBDb2xsYXBzZWQnLCAnZ3JvdXBFbmQnLCAnaW5mbycsICdsb2cnLFxuICAgICdtYXJrVGltZWxpbmUnLCAncHJvZmlsZScsICdwcm9maWxlRW5kJywgJ3RhYmxlJywgJ3RpbWUnLCAndGltZUVuZCcsXG4gICAgJ3RpbWVTdGFtcCcsICd0cmFjZScsICd3YXJuJ11cbiAgICBcbiAgbm9vcCA9ICgpIC0+XG4gICAgIyBzdHViIHVuZGVmaW5lZCBtZXRob2RzLlxuICAgIGZvciBtIGluIG1ldGhvZHMgIHdoZW4gICFjb25zb2xlW21dXG4gICAgICBjb25zb2xlW21dID0gbm9vcFxuXG5cbiAgaWYgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQ/XG4gICAgd2luZG93LnNob3cgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlKVxuICBlbHNlXG4gICAgd2luZG93LnNob3cgPSAoKSAtPlxuICAgICAgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cylcbikoKVxuIl19
