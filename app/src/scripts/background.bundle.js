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
            isOn: false,
            type: 'Local File'
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


            Object.observe(obj, function(changes) {
                changes.forEach(function(change) {
                    if (change.name === propName) {
                        setter(change.object[change.name]);
                    }
                });
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
				if (prop2 == "$val") {
					continue;
				}

                if (Object.prototype.hasOwnProperty.call(obj, prop2)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9hcHAvc3JjL2JhY2tncm91bmQuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L2NvbW1vbi5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvY29uZmlnLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9maWxlc3lzdGVtLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9saXN0ZW4uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L21zZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoanMvc3JjL3dhdGNoLmpzIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vdGlmaWNhdGlvbi5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvc2VydmVyLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9zdG9yYWdlLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS91dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0VBLElBQUEsaUVBQUE7O0FBQUEsU0FBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsVUFBQTtBQUFBLEVBQUEsVUFBQSxHQUFhLFNBQUEsR0FBQTtXQUNYLEtBRFc7RUFBQSxDQUFiLENBQUE7U0FHQSxVQUFBLENBQUEsRUFKVTtBQUFBLENBQVosQ0FBQTs7QUFBQSxJQU1BLEdBQU8sU0FBQSxDQUFBLENBTlAsQ0FBQTs7QUFBQSxXQVFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBUmQsQ0FBQTs7QUFBQSxNQVVNLENBQUMsR0FBRyxD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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUhuQixFQUdpQyxPQUhqQyxFQUcwQyxNQUgxQyxFQUdrRCxTQUhsRCxFQUlSLFdBSlEsRUFJSyxPQUpMLEVBSWMsTUFKZCxDQUpWLENBQUE7QUFBQSxFQVVBLElBQUEsR0FBTyxTQUFBLEdBQUE7QUFFTCxRQUFBLHFCQUFBO0FBQUE7U0FBQSw4Q0FBQTtzQkFBQTtVQUF3QixDQUFBLE9BQVMsQ0FBQSxDQUFBO0FBQy9CLHNCQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVIsR0FBYSxLQUFiO09BREY7QUFBQTtvQkFGSztFQUFBLENBVlAsQ0FBQTtBQWdCQSxFQUFBLElBQUcsK0JBQUg7V0FDRSxNQUFNLENBQUMsSUFBUCxHQUFjLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQXhCLENBQTZCLE9BQU8sQ0FBQyxHQUFyQyxFQUEwQyxPQUExQyxFQURoQjtHQUFBLE1BQUE7V0FHRSxNQUFNLENBQUMsSUFBUCxHQUFjLFNBQUEsR0FBQTthQUNaLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQXpCLENBQThCLE9BQU8sQ0FBQyxHQUF0QyxFQUEyQyxPQUEzQyxFQUFvRCxTQUFwRCxFQURZO0lBQUEsRUFIaEI7R0FsQmdCO0FBQUEsQ0FBRCxDQUFBLENBQUEsQ0FBakIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIHNlcnZlciA9IHJlcXVpcmUgJy4vdGNwLXNlcnZlci5qcydcblxuZ2V0R2xvYmFsID0gLT5cbiAgX2dldEdsb2JhbCA9IC0+XG4gICAgdGhpc1xuXG4gIF9nZXRHbG9iYWwoKVxuXG5yb290ID0gZ2V0R2xvYmFsKClcblxuQXBwbGljYXRpb24gPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuXG5jaHJvbWUuYXBwLnJ1bnRpbWUub25MYXVuY2hlZC5hZGRMaXN0ZW5lciAtPlxuICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUgJ2luZGV4Lmh0bWwnLFxuICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgYm91bmRzOlxuICAgICAgICAgIHdpZHRoOjc3MFxuICAgICAgICAgIGhlaWdodDo4MDBcblxuXG5cblxuIyBDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcuY29mZmVlJ1xuIyBNU0cgPSByZXF1aXJlICcuLi8uLi9tc2cuY29mZmVlJ1xuIyBMSVNURU4gPSByZXF1aXJlICcuLi8uLi9saXN0ZW4uY29mZmVlJ1xuIyBTdG9yYWdlID0gcmVxdWlyZSAnLi4vLi4vc3RvcmFnZS5jb2ZmZWUnXG4jIEZpbGVTeXN0ZW0gPSByZXF1aXJlICcuLi8uLi9maWxlc3lzdGVtLmNvZmZlZSdcbkNvbmZpZyA9IHJlcXVpcmUgJy4uLy4uL2NvbmZpZy5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi4vLi4vc3RvcmFnZS5jb2ZmZWUnXG5GaWxlU3lzdGVtID0gcmVxdWlyZSAnLi4vLi4vZmlsZXN5c3RlbS5jb2ZmZWUnXG5TZXJ2ZXIgPSByZXF1aXJlICcuLi8uLi9zZXJ2ZXIuY29mZmVlJ1xuXG5cbnJvb3QuYXBwID0gbmV3IEFwcGxpY2F0aW9uIFxuICBTdG9yYWdlOiBuZXcgU3RvcmFnZVxuICBGUzogbmV3IEZpbGVTeXN0ZW1cbiAgU2VydmVyOiBuZXcgU2VydmVyXG5cbnJvb3QuYXBwLlNlcnZlci5nZXRMb2NhbEZpbGUgPSBhcHAuZ2V0TG9jYWxGaWxlXG4jIHJvb3QuYXBwLlN0b3JhZ2UuZGF0YS5zZXJ2ZXIgPSBzdGF0dXM6cm9vdC5hcHAuU2VydmVyLnN0YXR1c1xuXG5jaHJvbWUucnVudGltZS5vblN1c3BlbmQuYWRkTGlzdGVuZXIgLT5cbiAgcm9vdC5hcHAuU3RvcmFnZS5zYXZlQWxsKG51bGwpXG5cbiNyb290LmFwcC5TdG9yYWdlLnJldHJpZXZlQWxsKClcbiIsInJlcXVpcmUgJy4vdXRpbC5jb2ZmZWUnXG5Db25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5MSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuTm90aWZpY2F0aW9uID0gcmVxdWlyZSAnLi9ub3RpZmljYXRpb24uY29mZmVlJ1xuU2VydmVyID0gcmVxdWlyZSAnLi9zZXJ2ZXIuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgQ29uZmlnXG4gIExJU1RFTjogbnVsbFxuICBNU0c6IG51bGxcbiAgU3RvcmFnZTogbnVsbFxuICBGUzogbnVsbFxuICBTZXJ2ZXI6IG51bGxcbiAgTm90aWZ5OiBudWxsXG4gIHBsYXRmb3JtOm51bGxcbiAgY3VycmVudFRhYklkOm51bGxcblxuICBjb25zdHJ1Y3RvcjogKGRlcHMpIC0+XG4gICAgc3VwZXJcblxuICAgIEBNU0cgPz0gTVNHLmdldCgpXG4gICAgQExJU1RFTiA/PSBMSVNURU4uZ2V0KClcbiAgICBcbiAgICBjaHJvbWUucnVudGltZS5vbkNvbm5lY3RFeHRlcm5hbC5hZGRMaXN0ZW5lciAocG9ydCkgPT5cbiAgICAgIGlmIHBvcnQuc2VuZGVyLmlkIGlzbnQgQEVYVF9JRFxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgQE1TRy5zZXRQb3J0IHBvcnRcbiAgICAgIEBMSVNURU4uc2V0UG9ydCBwb3J0XG4gICAgXG4gICAgcG9ydCA9IGNocm9tZS5ydW50aW1lLmNvbm5lY3QgQEVYVF9JRCBcbiAgICBATVNHLnNldFBvcnQgcG9ydFxuICAgIEBMSVNURU4uc2V0UG9ydCBwb3J0XG4gICAgXG4gICAgZm9yIHByb3Agb2YgZGVwc1xuICAgICAgaWYgdHlwZW9mIGRlcHNbcHJvcF0gaXMgXCJvYmplY3RcIiBcbiAgICAgICAgQFtwcm9wXSA9IEB3cmFwT2JqSW5ib3VuZCBkZXBzW3Byb3BdXG4gICAgICBpZiB0eXBlb2YgZGVwc1twcm9wXSBpcyBcImZ1bmN0aW9uXCIgXG4gICAgICAgIEBbcHJvcF0gPSBAd3JhcE9iak91dGJvdW5kIG5ldyBkZXBzW3Byb3BdXG5cbiAgICBAU3RvcmFnZS5vbkRhdGFMb2FkZWQgPSAoZGF0YSkgPT5cbiAgICAgICMgQGRhdGEgPSBkYXRhXG4gICAgICAjIGRlbGV0ZSBAU3RvcmFnZS5kYXRhLnNlcnZlclxuICAgICAgIyBAU3RvcmFnZS5kYXRhLnNlcnZlciA9IHt9XG4gICAgICAjIGRlbGV0ZSBAU3RvcmFnZS5kYXRhLnNlcnZlci5zdGF0dXNcblxuICAgICAgaWYgbm90IEBTdG9yYWdlLmRhdGEuZmlyc3RUaW1lP1xuICAgICAgICBAU3RvcmFnZS5kYXRhLmZpcnN0VGltZSA9IGZhbHNlXG4gICAgICAgIEBTdG9yYWdlLmRhdGEubWFwcy5wdXNoXG4gICAgICAgICAgbmFtZTonU2FsZXNmb3JjZSdcbiAgICAgICAgICB1cmw6J2h0dHBzLipcXC9yZXNvdXJjZShcXC9bMC05XSspP1xcLyhbQS1aYS16MC05XFwtLl9dK1xcLyk/J1xuICAgICAgICAgIHJlZ2V4UmVwbDonJ1xuICAgICAgICAgIGlzUmVkaXJlY3Q6dHJ1ZVxuICAgICAgICAgIGlzT246ZmFsc2VcbiAgICAgICAgICB0eXBlOidMb2NhbCBGaWxlJ1xuICAgICAgICAgIFxuXG5cbiAgICAgICMgaWYgQFJlZGlyZWN0PyB0aGVuIEBSZWRpcmVjdC5kYXRhID0gQGRhdGEudGFiTWFwc1xuXG4gICAgQE5vdGlmeSA/PSAobmV3IE5vdGlmaWNhdGlvbikuc2hvdyBcbiAgICAjIEBTdG9yYWdlID89IEB3cmFwT2JqT3V0Ym91bmQgbmV3IFN0b3JhZ2UgQGRhdGFcbiAgICAjIEBGUyA9IG5ldyBGaWxlU3lzdGVtIFxuICAgICMgQFNlcnZlciA/PSBAd3JhcE9iak91dGJvdW5kIG5ldyBTZXJ2ZXJcbiAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcbiAgICBcbiAgICBAd3JhcCA9IGlmIEBTRUxGX1RZUEUgaXMgJ0FQUCcgdGhlbiBAd3JhcEluYm91bmQgZWxzZSBAd3JhcE91dGJvdW5kXG5cbiAgICBAb3BlbkFwcCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5vcGVuQXBwJywgQG9wZW5BcHBcbiAgICBAbGF1bmNoQXBwID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmxhdW5jaEFwcCcsIEBsYXVuY2hBcHBcbiAgICBAc3RhcnRTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uc3RhcnRTZXJ2ZXInLCBAc3RhcnRTZXJ2ZXJcbiAgICBAcmVzdGFydFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5yZXN0YXJ0U2VydmVyJywgQHJlc3RhcnRTZXJ2ZXJcbiAgICBAc3RvcFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5zdG9wU2VydmVyJywgQHN0b3BTZXJ2ZXJcbiAgICBAZ2V0RmlsZU1hdGNoID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldEZpbGVNYXRjaCcsIEBnZXRGaWxlTWF0Y2hcblxuICAgIEB3cmFwID0gaWYgQFNFTEZfVFlQRSBpcyAnRVhURU5TSU9OJyB0aGVuIEB3cmFwSW5ib3VuZCBlbHNlIEB3cmFwT3V0Ym91bmRcblxuICAgIEBnZXRSZXNvdXJjZXMgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0UmVzb3VyY2VzJywgQGdldFJlc291cmNlc1xuICAgIEBnZXRDdXJyZW50VGFiID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldEN1cnJlbnRUYWInLCBAZ2V0Q3VycmVudFRhYlxuXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpIC0+XG4gICAgICBAU3RvcmFnZS5zZXNzaW9uLnNlcnZlciA9IHt9XG4gICAgICBAU3RvcmFnZS5zZXNzaW9uLnNlcnZlci5zdGF0dXMgPSBAU2VydmVyLnN0YXR1c1xuICAgICMgQFN0b3JhZ2UucmV0cmlldmVBbGwoKSBpZiBAU3RvcmFnZT9cblxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgbGF1bmNoQXBwOiAoY2IsIGVycm9yKSAtPlxuICAgICMgbmVlZHMgbWFuYWdlbWVudCBwZXJtaXNzaW9uLiBvZmYgZm9yIG5vdy5cbiAgICBjaHJvbWUubWFuYWdlbWVudC5sYXVuY2hBcHAgQEFQUF9JRCwgKGV4dEluZm8pID0+XG4gICAgICBpZiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgZXJyb3IgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBleHRJbmZvXG5cbiAgb3BlbkFwcDogKCkgPT5cbiAgICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsXG4gICAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgICBib3VuZHM6XG4gICAgICAgICAgd2lkdGg6NzcwXG4gICAgICAgICAgaGVpZ2h0OjgwMCxcbiAgICAgICh3aW4pID0+XG4gICAgICAgIEBhcHBXaW5kb3cgPSB3aW4pIFxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgZ2V0UmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldEN1cnJlbnRUYWIgKHRhYklkKSA9PlxuICAgICAgY2hyb21lLnRhYnMuZXhlY3V0ZVNjcmlwdCB0YWJJZCwgXG4gICAgICAgIGZpbGU6J3NjcmlwdHMvY29udGVudC5qcycsIChyZXN1bHRzKSA9PlxuICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMubGVuZ3RoID0gMFxuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiBjYj8obnVsbCwgQGRhdGEuY3VycmVudFJlc291cmNlcykgaWYgbm90IHJlc3VsdHM/XG5cbiAgICAgICAgICBmb3IgciBpbiByZXN1bHRzXG4gICAgICAgICAgICBmb3IgcmVzIGluIHJcbiAgICAgICAgICAgICAgQGRhdGEuY3VycmVudFJlc291cmNlcy5wdXNoIHJlc1xuICAgICAgICAgIGNiPyBudWxsLCBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG5cblxuICBnZXRMb2NhbEZpbGU6IChpbmZvLCBjYikgPT5cbiAgICBmaWxlUGF0aCA9IGluZm8udXJpXG4gICAganVzdFRoZVBhdGggPSBmaWxlUGF0aC5tYXRjaCgvXihbXiM/XFxzXSspPyguKj8pPygjW1xcd1xcLV0rKT8kLylcbiAgICBmaWxlUGF0aCA9IGp1c3RUaGVQYXRoWzFdIGlmIGp1c3RUaGVQYXRoP1xuICAgICMgZmlsZVBhdGggPSBAZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdCB1cmxcbiAgICByZXR1cm4gY2IgJ2ZpbGUgbm90IGZvdW5kJyB1bmxlc3MgZmlsZVBhdGg/XG4gICAgX2RpcnMgPSBbXVxuICAgIF9kaXJzLnB1c2ggZGlyIGZvciBkaXIgaW4gQGRhdGEuZGlyZWN0b3JpZXMgd2hlbiBkaXIuaXNPblxuICAgIGZpbGVQYXRoID0gZmlsZVBhdGguc3Vic3RyaW5nIDEgaWYgZmlsZVBhdGguc3Vic3RyaW5nKDAsMSkgaXMgJy8nXG4gICAgQGZpbmRGaWxlRm9yUGF0aCBfZGlycywgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyKSA9PlxuICAgICAgaWYgZXJyPyB0aGVuIHJldHVybiBjYj8gZXJyXG4gICAgICBmaWxlRW50cnkuZmlsZSAoZmlsZSkgPT5cbiAgICAgICAgY2I/IG51bGwsZmlsZUVudHJ5LGZpbGVcbiAgICAgICwoZXJyKSA9PiBjYj8gZXJyXG5cblxuICBzdGFydFNlcnZlcjogKGNiKSAtPlxuICAgIGlmIEBTZXJ2ZXIuc3RhdHVzLmlzT24gaXMgZmFsc2VcbiAgICAgIEBTZXJ2ZXIuc3RhcnQgbnVsbCxudWxsLG51bGwsIChlcnIsIHNvY2tldEluZm8pID0+XG4gICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBFcnJvclwiLFwiRXJyb3IgU3RhcnRpbmcgU2VydmVyOiAjeyBlcnIgfVwiXG4gICAgICAgICAgICBjYj8gZXJyXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBTdGFydGVkXCIsIFwiU3RhcnRlZCBTZXJ2ZXIgI3sgQFNlcnZlci5zdGF0dXMudXJsIH1cIlxuICAgICAgICAgICAgY2I/IG51bGwsIEBTZXJ2ZXIuc3RhdHVzXG4gICAgZWxzZVxuICAgICAgY2I/ICdhbHJlYWR5IHN0YXJ0ZWQnXG5cbiAgc3RvcFNlcnZlcjogKGNiKSAtPlxuICAgICAgQFNlcnZlci5zdG9wIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICAgIGlmIGVycj9cbiAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIEVycm9yXCIsXCJTZXJ2ZXIgY291bGQgbm90IGJlIHN0b3BwZWQ6ICN7IGVycm9yIH1cIlxuICAgICAgICAgIGNiPyBlcnJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBOb3RpZnkgJ1NlcnZlciBTdG9wcGVkJywgXCJTZXJ2ZXIgU3RvcHBlZFwiXG4gICAgICAgICAgY2I/IG51bGwsIEBTZXJ2ZXIuc3RhdHVzXG5cbiAgcmVzdGFydFNlcnZlcjogLT5cbiAgICBAc3RhcnRTZXJ2ZXIoKVxuXG4gIGNoYW5nZVBvcnQ6ID0+XG4gIGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3Q6ICh1cmwpIC0+XG4gICAgZmlsZVBhdGhSZWdleCA9IC9eKChodHRwW3NdP3xmdHB8Y2hyb21lLWV4dGVuc2lvbnxmaWxlKTpcXC9cXC8pP1xcLz8oW15cXC9cXC5dK1xcLikqPyhbXlxcL1xcLl0rXFwuW146XFwvXFxzXFwuXXsyLDN9KFxcLlteOlxcL1xcc1xcLl3igIzigIt7MiwzfSk/KSg6XFxkKyk/KCR8XFwvKShbXiM/XFxzXSspPyguKj8pPygjW1xcd1xcLV0rKT8kL1xuICAgXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIEBkYXRhW0BjdXJyZW50VGFiSWRdPy5tYXBzP1xuXG4gICAgcmVzUGF0aCA9IHVybC5tYXRjaChmaWxlUGF0aFJlZ2V4KT9bOF1cbiAgICBpZiBub3QgcmVzUGF0aD9cbiAgICAgICMgdHJ5IHJlbHBhdGhcbiAgICAgIHJlc1BhdGggPSB1cmxcblxuICAgIHJldHVybiBudWxsIHVubGVzcyByZXNQYXRoP1xuICAgIFxuICAgIGZvciBtYXAgaW4gQGRhdGFbQGN1cnJlbnRUYWJJZF0ubWFwc1xuICAgICAgcmVzUGF0aCA9IHVybC5tYXRjaChuZXcgUmVnRXhwKG1hcC51cmwpKT8gYW5kIG1hcC51cmw/XG5cbiAgICAgIGlmIHJlc1BhdGhcbiAgICAgICAgaWYgcmVmZXJlcj9cbiAgICAgICAgICAjIFRPRE86IHRoaXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXAudXJsKSwgbWFwLnJlZ2V4UmVwbFxuICAgICAgICBicmVha1xuICAgIHJldHVybiBmaWxlUGF0aFxuXG4gIFVSTHRvTG9jYWxQYXRoOiAodXJsLCBjYikgLT5cbiAgICBmaWxlUGF0aCA9IEBSZWRpcmVjdC5nZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0IHVybFxuXG4gIGdldEZpbGVNYXRjaDogKGZpbGVQYXRoLCBjYikgLT5cbiAgICByZXR1cm4gY2I/ICdmaWxlIG5vdCBmb3VuZCcgdW5sZXNzIGZpbGVQYXRoP1xuICAgIHNob3cgJ3RyeWluZyAnICsgZmlsZVBhdGhcbiAgICBAZmluZEZpbGVGb3JQYXRoIEBkYXRhLmRpcmVjdG9yaWVzLCBmaWxlUGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXJlY3RvcnkpID0+XG5cbiAgICAgIGlmIGVycj8gXG4gICAgICAgICMgc2hvdyAnbm8gZmlsZXMgZm91bmQgZm9yICcgKyBmaWxlUGF0aFxuICAgICAgICByZXR1cm4gY2I/IGVyclxuXG4gICAgICBkZWxldGUgZmlsZUVudHJ5LmVudHJ5XG4gICAgICBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdID0gXG4gICAgICAgIGZpbGVFbnRyeTogY2hyb21lLmZpbGVTeXN0ZW0ucmV0YWluRW50cnkgZmlsZUVudHJ5XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aFxuICAgICAgICBkaXJlY3Rvcnk6IGRpcmVjdG9yeVxuICAgICAgY2I/IG51bGwsIEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlc1tmaWxlUGF0aF0sIGRpcmVjdG9yeVxuICAgICAgXG5cblxuICBmaW5kRmlsZUluRGlyZWN0b3JpZXM6IChkaXJlY3RvcmllcywgcGF0aCwgY2IpIC0+XG4gICAgbXlEaXJzID0gZGlyZWN0b3JpZXMuc2xpY2UoKSBcbiAgICBfcGF0aCA9IHBhdGhcbiAgICBfZGlyID0gbXlEaXJzLnNoaWZ0KClcblxuICAgIEBGUy5nZXRMb2NhbEZpbGVFbnRyeSBfZGlyLCBfcGF0aCwgKGVyciwgZmlsZUVudHJ5KSA9PlxuICAgICAgaWYgZXJyP1xuICAgICAgICBpZiBteURpcnMubGVuZ3RoID4gMFxuICAgICAgICAgIEBmaW5kRmlsZUluRGlyZWN0b3JpZXMgbXlEaXJzLCBfcGF0aCwgY2JcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNiPyAnbm90IGZvdW5kJ1xuICAgICAgZWxzZVxuICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBfZGlyXG5cbiAgZmluZEZpbGVGb3JQYXRoOiAoZGlycywgcGF0aCwgY2IpIC0+XG4gICAgQGZpbmRGaWxlSW5EaXJlY3RvcmllcyBkaXJzLCBwYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcmVjdG9yeSkgPT5cbiAgICAgIGlmIGVycj9cbiAgICAgICAgaWYgcGF0aCBpcyBwYXRoLnJlcGxhY2UoLy4qP1xcLy8sICcnKVxuICAgICAgICAgIGNiPyAnbm90IGZvdW5kJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQGZpbmRGaWxlRm9yUGF0aCBkaXJzLCBwYXRoLnJlcGxhY2UoLy4qP1xcLy8sICcnKSwgY2JcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZGlyZWN0b3J5XG4gIFxuICBtYXBBbGxSZXNvdXJjZXM6IChjYikgLT5cbiAgICBAZ2V0UmVzb3VyY2VzID0+XG4gICAgICBkZWJ1Z2dlcjtcbiAgICAgIG5lZWQgPSBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLmxlbmd0aFxuICAgICAgZm91bmQgPSBub3RGb3VuZCA9IDBcbiAgICAgIGZvciBpdGVtIGluIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXNcbiAgICAgICAgbG9jYWxQYXRoID0gQFVSTHRvTG9jYWxQYXRoIGl0ZW0udXJsXG4gICAgICAgIGlmIGxvY2FsUGF0aD9cbiAgICAgICAgICBAZ2V0RmlsZU1hdGNoIGxvY2FsUGF0aCwgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgICAgICAgIG5lZWQtLVxuICAgICAgICAgICAgc2hvdyBhcmd1bWVudHNcbiAgICAgICAgICAgIGlmIGVycj8gdGhlbiBub3RGb3VuZCsrXG4gICAgICAgICAgICBlbHNlIGZvdW5kKysgICAgICAgICAgICBcblxuICAgICAgICAgICAgaWYgbmVlZCBpcyAwXG4gICAgICAgICAgICAgIGlmIGZvdW5kID4gMFxuICAgICAgICAgICAgICAgIGNiPyBudWxsLCAnZG9uZSdcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNiPyAnbm90aGluZyBmb3VuZCdcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgbmVlZC0tXG4gICAgICAgICAgbm90Rm91bmQrK1xuICAgICAgICAgIGlmIG5lZWQgaXMgMFxuICAgICAgICAgICAgY2I/ICdub3RoaW5nIGZvdW5kJ1xuXG4gIHNldEJhZGdlVGV4dDogKHRleHQsIHRhYklkKSAtPlxuICAgIGJhZGdlVGV4dCA9IHRleHQgfHwgJycgKyBPYmplY3Qua2V5cyhAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXMpLmxlbmd0aFxuICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCBcbiAgICAgIHRleHQ6YmFkZ2VUZXh0XG4gICAgICAjIHRhYklkOnRhYklkXG4gIFxuICByZW1vdmVCYWRnZVRleHQ6KHRhYklkKSAtPlxuICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCBcbiAgICAgIHRleHQ6JydcbiAgICAgICMgdGFiSWQ6dGFiSWRcblxuICBsc1I6IChkaXIsIG9uc3VjY2Vzcywgb25lcnJvcikgLT5cbiAgICBAcmVzdWx0cyA9IHt9XG5cbiAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgICAgIFxuICAgICAgdG9kbyA9IDBcbiAgICAgIGlnbm9yZSA9IC8uZ2l0fC5pZGVhfG5vZGVfbW9kdWxlc3xib3dlcl9jb21wb25lbnRzL1xuICAgICAgZGl2ZSA9IChkaXIsIHJlc3VsdHMpIC0+XG4gICAgICAgIHRvZG8rK1xuICAgICAgICByZWFkZXIgPSBkaXIuY3JlYXRlUmVhZGVyKClcbiAgICAgICAgcmVhZGVyLnJlYWRFbnRyaWVzIChlbnRyaWVzKSAtPlxuICAgICAgICAgIHRvZG8tLVxuICAgICAgICAgIGZvciBlbnRyeSBpbiBlbnRyaWVzXG4gICAgICAgICAgICBkbyAoZW50cnkpIC0+XG4gICAgICAgICAgICAgIHJlc3VsdHNbZW50cnkuZnVsbFBhdGhdID0gZW50cnlcbiAgICAgICAgICAgICAgaWYgZW50cnkuZnVsbFBhdGgubWF0Y2goaWdub3JlKSBpcyBudWxsXG4gICAgICAgICAgICAgICAgaWYgZW50cnkuaXNEaXJlY3RvcnlcbiAgICAgICAgICAgICAgICAgIHRvZG8rK1xuICAgICAgICAgICAgICAgICAgZGl2ZSBlbnRyeSwgcmVzdWx0cyBcbiAgICAgICAgICAgICAgIyBzaG93IGVudHJ5XG4gICAgICAgICAgc2hvdyAnb25zdWNjZXNzJyBpZiB0b2RvIGlzIDBcbiAgICAgICAgICAjIHNob3cgJ29uc3VjY2VzcycgcmVzdWx0cyBpZiB0b2RvIGlzIDBcbiAgICAgICAgLChlcnJvcikgLT5cbiAgICAgICAgICB0b2RvLS1cbiAgICAgICAgICAjIHNob3cgZXJyb3JcbiAgICAgICAgICAjIG9uZXJyb3IgZXJyb3IsIHJlc3VsdHMgaWYgdG9kbyBpcyAwIFxuXG4gICAgICAjIGNvbnNvbGUubG9nIGRpdmUgZGlyRW50cnksIEByZXN1bHRzICBcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxpY2F0aW9uXG5cblxuIiwiY2xhc3MgQ29uZmlnXG4gICMgQVBQX0lEOiAnY2VjaWZhZnBoZWdob2ZwZmRraGVra2liY2liaGdmZWMnXG4gICMgRVhURU5TSU9OX0lEOiAnZGRkaW1ibmppYmpjYWZib2tuYmdoZWhiZmFqZ2dnZXAnXG4gIEFQUF9JRDogJ2RlbmVmZG9vZm5rZ2ptcGJmcGtuaWhwZ2RoYWhwYmxoJ1xuICBFWFRFTlNJT05fSUQ6ICdpamNqbXBlam9ubWltb29mYmNwYWxpZWpoaWthZW9taCcgIFxuICBTRUxGX0lEOiBjaHJvbWUucnVudGltZS5pZFxuICBpc0NvbnRlbnRTY3JpcHQ6IGxvY2F0aW9uLnByb3RvY29sIGlzbnQgJ2Nocm9tZS1leHRlbnNpb246J1xuICBFWFRfSUQ6IG51bGxcbiAgRVhUX1RZUEU6IG51bGxcbiAgXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIEBFWFRfSUQgPSBpZiBAQVBQX0lEIGlzIEBTRUxGX0lEIHRoZW4gQEVYVEVOU0lPTl9JRCBlbHNlIEBBUFBfSURcbiAgICBARVhUX1RZUEUgPSBpZiBAQVBQX0lEIGlzIEBTRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuICAgIEBTRUxGX1RZUEUgPSBpZiBAQVBQX0lEIGlzbnQgQFNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG5cbiAgd3JhcEluYm91bmQ6IChvYmosIGZuYW1lLCBmKSAtPlxuICAgICAgX2tsYXMgPSBvYmpcbiAgICAgIEBMSVNURU4uRXh0IGZuYW1lLCAoYXJncykgLT5cbiAgICAgICAgaWYgYXJncz8uaXNQcm94eT9cbiAgICAgICAgICBpZiB0eXBlb2YgYXJndW1lbnRzWzFdIGlzIFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgaWYgYXJncy5hcmd1bWVudHM/Lmxlbmd0aCA+PSAwXG4gICAgICAgICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBhcmdzLmFyZ3VtZW50cy5jb25jYXQgYXJndW1lbnRzWzFdIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgW10uY29uY2F0IGFyZ3VtZW50c1sxXVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIGFyZ3VtZW50c1xuXG4gIHdyYXBPYmpJbmJvdW5kOiAob2JqKSAtPlxuICAgIChvYmpba2V5XSA9IEB3cmFwSW5ib3VuZCBvYmosIG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsga2V5LCBvYmpba2V5XSkgZm9yIGtleSBvZiBvYmogd2hlbiB0eXBlb2Ygb2JqW2tleV0gaXMgXCJmdW5jdGlvblwiXG4gICAgb2JqXG5cbiAgd3JhcE91dGJvdW5kOiAob2JqLCBmbmFtZSwgZikgLT5cbiAgICAtPlxuICAgICAgbXNnID0ge31cbiAgICAgIG1zZ1tmbmFtZV0gPSBcbiAgICAgICAgaXNQcm94eTp0cnVlXG4gICAgICAgIGFyZ3VtZW50czpBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcbiAgICAgIG1zZ1tmbmFtZV0uaXNQcm94eSA9IHRydWVcbiAgICAgIF9hcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG5cbiAgICAgIGlmIF9hcmdzLmxlbmd0aCBpcyAwXG4gICAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzID0gdW5kZWZpbmVkIFxuICAgICAgICByZXR1cm4gQE1TRy5FeHQgbXNnLCAoKSAtPiB1bmRlZmluZWRcblxuICAgICAgbXNnW2ZuYW1lXS5hcmd1bWVudHMgPSBfYXJnc1xuXG4gICAgICBjYWxsYmFjayA9IG1zZ1tmbmFtZV0uYXJndW1lbnRzLnBvcCgpXG4gICAgICBpZiB0eXBlb2YgY2FsbGJhY2sgaXNudCBcImZ1bmN0aW9uXCJcbiAgICAgICAgbXNnW2ZuYW1lXS5hcmd1bWVudHMucHVzaCBjYWxsYmFja1xuICAgICAgICBATVNHLkV4dCBtc2csICgpIC0+IHVuZGVmaW5lZFxuICAgICAgZWxzZVxuICAgICAgICBATVNHLkV4dCBtc2csICgpID0+XG4gICAgICAgICAgYXJneiA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuICAgICAgICAgICMgcHJveHlBcmdzID0gW2lzUHJveHk6YXJnel1cbiAgICAgICAgICBpZiBhcmd6Py5sZW5ndGggPiAwIGFuZCBhcmd6WzBdPy5pc1Byb3h5P1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkgQCwgYXJnelswXS5pc1Byb3h5IFxuXG4gIHdyYXBPYmpPdXRib3VuZDogKG9iaikgLT5cbiAgICAob2JqW2tleV0gPSBAd3JhcE91dGJvdW5kIG9iaiwgb2JqLmNvbnN0cnVjdG9yLm5hbWUgKyAnLicgKyBrZXksIG9ialtrZXldKSBmb3Iga2V5IG9mIG9iaiB3aGVuIHR5cGVvZiBvYmpba2V5XSBpcyBcImZ1bmN0aW9uXCJcbiAgICBvYmpcblxubW9kdWxlLmV4cG9ydHMgPSBDb25maWciLCJMSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5cbmNsYXNzIEZpbGVTeXN0ZW1cbiAgYXBpOiBjaHJvbWUuZmlsZVN5c3RlbVxuICByZXRhaW5lZERpcnM6IHt9XG4gIExJU1RFTjogTElTVEVOLmdldCgpIFxuICBNU0c6IE1TRy5nZXQoKVxuICBwbGF0Zm9ybTonJ1xuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBjaHJvbWUucnVudGltZS5nZXRQbGF0Zm9ybUluZm8gKGluZm8pID0+XG4gICAgICBAcGxhdGZvcm0gPSBpbmZvXG4gICMgQGRpcnM6IG5ldyBEaXJlY3RvcnlTdG9yZVxuICAjIGZpbGVUb0FycmF5QnVmZmVyOiAoYmxvYiwgb25sb2FkLCBvbmVycm9yKSAtPlxuICAjICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAjICAgcmVhZGVyLm9ubG9hZCA9IG9ubG9hZFxuXG4gICMgICByZWFkZXIub25lcnJvciA9IG9uZXJyb3JcblxuICAjICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGJsb2JcblxuICByZWFkRmlsZTogKGRpckVudHJ5LCBwYXRoLCBjYikgLT5cbiAgICAjIHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcLy9nLCdcXFxcJykgaWYgcGxhdGZvcm0gaXMgJ3dpbidcbiAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBwYXRoLFxuICAgICAgKGVyciwgZmlsZUVudHJ5KSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgZXJyPyB0aGVuIHJldHVybiBjYj8gZXJyXG5cbiAgICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZmlsZVxuICAgICAgICAsKGVycikgPT4gY2I/IGVyclxuXG4gIGdldEZpbGVFbnRyeTogKGRpckVudHJ5LCBwYXRoLCBjYikgLT5cbiAgICAjIHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcLy9nLCdcXFxcJykgaWYgcGxhdGZvcm0gaXMgJ3dpbidcbiAgICBkaXJFbnRyeS5nZXRGaWxlIHBhdGgsIHt9LCAoZmlsZUVudHJ5KSA9PlxuICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeVxuICAgICwoZXJyKSA9PiBjYj8gZXJyXG5cbiAgIyBvcGVuRGlyZWN0b3J5OiAoY2FsbGJhY2spIC0+XG4gIG9wZW5EaXJlY3Rvcnk6IChkaXJlY3RvcnlFbnRyeSwgY2IpIC0+XG4gICMgQGFwaS5jaG9vc2VFbnRyeSB0eXBlOidvcGVuRGlyZWN0b3J5JywgKGRpcmVjdG9yeUVudHJ5LCBmaWxlcykgPT5cbiAgICBAYXBpLmdldERpc3BsYXlQYXRoIGRpcmVjdG9yeUVudHJ5LCAocGF0aE5hbWUpID0+XG4gICAgICBkaXIgPVxuICAgICAgICAgIHJlbFBhdGg6IGRpcmVjdG9yeUVudHJ5LmZ1bGxQYXRoICMucmVwbGFjZSgnLycgKyBkaXJlY3RvcnlFbnRyeS5uYW1lLCAnJylcbiAgICAgICAgICBkaXJlY3RvcnlFbnRyeUlkOiBAYXBpLnJldGFpbkVudHJ5KGRpcmVjdG9yeUVudHJ5KVxuICAgICAgICAgIGVudHJ5OiBkaXJlY3RvcnlFbnRyeVxuICAgICAgY2I/IG51bGwsIHBhdGhOYW1lLCBkaXJcbiAgICAgICAgICAjIEBnZXRPbmVEaXJMaXN0IGRpclxuICAgICAgICAgICMgU3RvcmFnZS5zYXZlICdkaXJlY3RvcmllcycsIEBzY29wZS5kaXJlY3RvcmllcyAocmVzdWx0KSAtPlxuXG4gIGdldExvY2FsRmlsZUVudHJ5OiAoZGlyLCBmaWxlUGF0aCwgY2IpID0+IFxuICAgICMgZmlsZVBhdGggPSBmaWxlUGF0aC5yZXBsYWNlKC9cXC8vZywnXFxcXCcpIGlmIHBsYXRmb3JtIGlzICd3aW4nXG4gICAgZGlyRW50cnkgPSBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsICgpIC0+XG4gICAgaWYgbm90IGRpckVudHJ5P1xuICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIGZpbGVQYXRoLCBjYlxuICAgIGVsc2VcbiAgICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIGZpbGVQYXRoLCBjYlxuXG5cblxuICAjIGdldExvY2FsRmlsZTogKGRpciwgZmlsZVBhdGgsIGNiLCBlcnJvcikgPT4gXG4gICMgIyBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgIyAjICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAjICMgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICMgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgIyAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgIyAgICAgLChfZXJyb3IpID0+IGVycm9yKF9lcnJvcilcbiAgIyAjIGVsc2VcbiAgIyAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAjICAgICAjIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiAgIyAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCwgKGVyciwgZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgIGlmIGVycj8gdGhlbiBjYj8gZXJyXG4gICMgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZmlsZVxuICAjICAgLChfZXJyb3IpID0+IGNiPyhfZXJyb3IpXG5cbiAgICAgICMgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIHN1Y2Nlc3MsXG4gICAgICAjICAgICAoZXJyKSA9PlxuICAgICAgIyAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggaW5mbywgY2JcblxuICAjIGZpbmRGaWxlRm9yUGF0aDogKGluZm8sIGNiKSA9PlxuICAjICAgICBAZmluZEZpbGVGb3JRdWVyeVN0cmluZyBpbmZvLnVyaSwgY2IsIGluZm8ucmVmZXJlclxuXG4gICMgZmluZEZpbGVGb3JRdWVyeVN0cmluZzogKF91cmwsIGNiLCBlcnJvciwgcmVmZXJlcikgPT5cbiAgIyAgICAgdXJsID0gZGVjb2RlVVJJQ29tcG9uZW50KF91cmwpLnJlcGxhY2UgLy4qP3NscmVkaXJcXD0vLCAnJ1xuXG4gICMgICAgIG1hdGNoID0gaXRlbSBmb3IgaXRlbSBpbiBAbWFwcyB3aGVuIHVybC5tYXRjaChuZXcgUmVnRXhwKGl0ZW0udXJsKSk/IGFuZCBpdGVtLnVybD8gYW5kIG5vdCBtYXRjaD9cblxuICAjICAgICBpZiBtYXRjaD9cbiAgIyAgICAgICAgIGlmIHJlZmVyZXI/XG4gICMgICAgICAgICAgICAgZmlsZVBhdGggPSB1cmwubWF0Y2goLy4qXFwvXFwvLio/XFwvKC4qKS8pP1sxXVxuICAjICAgICAgICAgZWxzZVxuICAjICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXRjaC51cmwpLCBtYXRjaC5yZWdleFJlcGxcblxuICAjICAgICAgICAgZmlsZVBhdGgucmVwbGFjZSAnLycsICdcXFxcJyBpZiBwbGF0Zm9ybSBpcyAnd2luJ1xuXG4gICMgICAgICAgICBkaXIgPSBAU3RvcmFnZS5kYXRhLmRpcmVjdG9yaWVzW21hdGNoLmRpcmVjdG9yeV1cblxuICAjICAgICAgICAgaWYgbm90IGRpcj8gdGhlbiByZXR1cm4gZXJyICdubyBtYXRjaCdcblxuICAjICAgICAgICAgaWYgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0/XG4gICMgICAgICAgICAgICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAjICAgICAgICAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgICAgICBlbHNlXG4gICMgICAgICAgICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICMgICAgICAgICAgICAgICAgIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiAgIyAgICAgICAgICAgICAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAgICAgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAgICAgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICBlbHNlXG4gICMgICAgICAgICBlcnJvcigpXG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVN5c3RlbSIsIkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcblxuY2xhc3MgTElTVEVOIGV4dGVuZHMgQ29uZmlnXG4gIGxvY2FsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlXG4gICAgbGlzdGVuZXJzOnt9XG4gICAgIyByZXNwb25zZUNhbGxlZDpmYWxzZVxuICBleHRlcm5hbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsXG4gICAgbGlzdGVuZXJzOnt9XG4gICAgIyByZXNwb25zZUNhbGxlZDpmYWxzZVxuICBpbnN0YW5jZSA9IG51bGxcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcblxuICAgIEBsb2NhbC5hcGkuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwuYXBpPy5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgQGdldDogKCkgLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgTElTVEVOXG5cbiAgc2V0UG9ydDogKHBvcnQpIC0+XG4gICAgQHBvcnQgPSBwb3J0XG4gICAgcG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gIExvY2FsOiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgQGxvY2FsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgRXh0OiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgIyBzaG93ICdhZGRpbmcgZXh0IGxpc3RlbmVyIGZvciAnICsgbWVzc2FnZVxuICAgIEBleHRlcm5hbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIF9vbk1lc3NhZ2VFeHRlcm5hbDogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHJlc3BvbnNlU3RhdHVzID0gY2FsbGVkOmZhbHNlXG5cbiAgICBfc2VuZFJlc3BvbnNlID0gKHdoYXRldmVyLi4uKSA9PlxuICAgICAgdHJ5XG4gICAgICAgICMgd2hhdGV2ZXIuc2hpZnQoKSBpZiB3aGF0ZXZlclswXSBpcyBudWxsIGFuZCB3aGF0ZXZlclsxXT9cbiAgICAgICAgc2VuZFJlc3BvbnNlLmFwcGx5IG51bGwscHJveHlBcmdzID0gW2lzUHJveHk6d2hhdGV2ZXJdXG5cbiAgICAgIGNhdGNoIGVcbiAgICAgICAgdW5kZWZpbmVkICMgZXJyb3IgYmVjYXVzZSBubyByZXNwb25zZSB3YXMgcmVxdWVzdGVkIGZyb20gdGhlIE1TRywgZG9uJ3QgY2FyZVxuICAgICAgcmVzcG9uc2VTdGF0dXMuY2FsbGVkID0gdHJ1ZVxuICAgICAgXG4gICAgIyAoc2hvdyBcIjw9PSBHT1QgRVhURVJOQUwgTUVTU0FHRSA9PSAjeyBARVhUX1RZUEUgfSA9PVwiICsgX2tleSkgZm9yIF9rZXkgb2YgcmVxdWVzdFxuICAgIGlmIHNlbmRlci5pZD8gXG4gICAgICBpZiBzZW5kZXIuaWQgaXNudCBARVhUX0lEICNhbmQgc2VuZGVyLmNvbnN0cnVjdG9yLm5hbWUgaXNudCAnUG9ydCdcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgX3NlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcbiAgICBcbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkICMgZm9yIHN5bmNocm9ub3VzIHNlbmRSZXNwb25zZVxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgX29uTWVzc2FnZTogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHJlc3BvbnNlU3RhdHVzID0gY2FsbGVkOmZhbHNlXG4gICAgX3NlbmRSZXNwb25zZSA9ID0+XG4gICAgICB0cnlcbiAgICAgICAgIyBzaG93ICdjYWxsaW5nIHNlbmRyZXNwb25zZSdcbiAgICAgICAgc2VuZFJlc3BvbnNlLmFwcGx5IHRoaXMsYXJndW1lbnRzXG4gICAgICBjYXRjaCBlXG4gICAgICAgICMgc2hvdyBlXG4gICAgICByZXNwb25zZVN0YXR1cy5jYWxsZWQgPSB0cnVlXG5cbiAgICAjIChzaG93IFwiPD09IEdPVCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgQGxvY2FsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG5cbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkXG4gICAgICAjIHNob3cgJ3JldHVybmluZyB0cnVlJ1xuICAgICAgcmV0dXJuIHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBMSVNURU4iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIE1TRyBleHRlbmRzIENvbmZpZ1xuICBpbnN0YW5jZSA9IG51bGxcbiAgcG9ydDpudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG5cbiAgQGdldDogKCkgLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgTVNHXG5cbiAgQGNyZWF0ZVBvcnQ6ICgpIC0+XG5cbiAgc2V0UG9ydDogKHBvcnQpIC0+XG4gICAgQHBvcnQgPSBwb3J0XG5cbiAgTG9jYWw6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIChzaG93IFwiPT0gTUVTU0FHRSAjeyBfa2V5IH0gPT0+XCIpIGZvciBfa2V5IG9mIG1lc3NhZ2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBtZXNzYWdlLCByZXNwb25kXG4gIEV4dDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFIEVYVEVSTkFMICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIEBFWFRfSUQsIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0UG9ydDogKG1lc3NhZ2UpIC0+XG4gICAgdHJ5XG4gICAgICBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG4gICAgY2F0Y2hcbiAgICAgIHNob3cgJ2Vycm9yJ1xuICAgICAgIyBAcG9ydCA9IGNocm9tZS5ydW50aW1lLmNvbm5lY3QgQEVYVF9JRCBcbiAgICAgICMgQHBvcnQucG9zdE1lc3NhZ2UgbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1TRyIsIi8qKlxuICogREVWRUxPUEVEIEJZXG4gKiBHSUwgTE9QRVMgQlVFTk9cbiAqIGdpbGJ1ZW5vLm1haWxAZ21haWwuY29tXG4gKlxuICogV09SS1MgV0lUSDpcbiAqIElFIDkrLCBGRiA0KywgU0YgNSssIFdlYktpdCwgQ0ggNyssIE9QIDEyKywgQkVTRU4sIFJoaW5vIDEuNytcbiAqXG4gKiBGT1JLOlxuICogaHR0cHM6Ly9naXRodWIuY29tL21lbGFua2UvV2F0Y2guSlNcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgICAgIC8vIGxpa2UgTm9kZS5cbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIHdpbmRvdy5XYXRjaEpTID0gZmFjdG9yeSgpO1xuICAgICAgICB3aW5kb3cud2F0Y2ggPSB3aW5kb3cuV2F0Y2hKUy53YXRjaDtcbiAgICAgICAgd2luZG93LnVud2F0Y2ggPSB3aW5kb3cuV2F0Y2hKUy51bndhdGNoO1xuICAgICAgICB3aW5kb3cuY2FsbFdhdGNoZXJzID0gd2luZG93LldhdGNoSlMuY2FsbFdhdGNoZXJzO1xuICAgIH1cbn0oZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIFdhdGNoSlMgPSB7XG4gICAgICAgIG5vTW9yZTogZmFsc2VcbiAgICB9LFxuICAgIGxlbmd0aHN1YmplY3RzID0gW107XG5cbiAgICB2YXIgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIChmdW5jdGlvblRvQ2hlY2spIHtcbiAgICAgICAgICAgIHZhciBnZXRUeXBlID0ge307XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb25Ub0NoZWNrICYmIGdldFR5cGUudG9TdHJpbmcuY2FsbChmdW5jdGlvblRvQ2hlY2spID09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gICAgfTtcblxuICAgIHZhciBpc0ludCA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiB4ICUgMSA9PT0gMDtcbiAgICB9O1xuXG4gICAgdmFyIGlzQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0T2JqRGlmZiA9IGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICB2YXIgYXBsdXMgPSBbXSxcbiAgICAgICAgYnBsdXMgPSBbXTtcblxuICAgICAgICBpZighKHR5cGVvZiBhID09IFwic3RyaW5nXCIpICYmICEodHlwZW9mIGIgPT0gXCJzdHJpbmdcIikpe1xuXG4gICAgICAgICAgICBpZiAoaXNBcnJheShhKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiW2ldID09PSB1bmRlZmluZWQpIGFwbHVzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gYSl7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihiW2ldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGx1cy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNBcnJheShiKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGo9MDsgajxiLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhW2pdID09PSB1bmRlZmluZWQpIGJwbHVzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGogaW4gYil7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiLmhhc093blByb3BlcnR5KGopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhW2pdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicGx1cy5wdXNoKGopO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFkZGVkOiBhcGx1cyxcbiAgICAgICAgICAgIHJlbW92ZWQ6IGJwbHVzXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGNsb25lID0gZnVuY3Rpb24ob2JqKXtcblxuICAgICAgICBpZiAobnVsbCA9PSBvYmogfHwgXCJvYmplY3RcIiAhPSB0eXBlb2Ygb2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvcHkgPSBvYmouY29uc3RydWN0b3IoKTtcblxuICAgICAgICBmb3IgKHZhciBhdHRyIGluIG9iaikge1xuICAgICAgICAgICAgY29weVthdHRyXSA9IG9ialthdHRyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb3B5O1xuXG4gICAgfVxuXG4gICAgdmFyIGRlZmluZUdldEFuZFNldCA9IGZ1bmN0aW9uIChvYmosIHByb3BOYW1lLCBnZXR0ZXIsIHNldHRlcikge1xuICAgICAgICB0cnkge1xuXG5cbiAgICAgICAgICAgIE9iamVjdC5vYnNlcnZlKG9iaiwgZnVuY3Rpb24oY2hhbmdlcykge1xuICAgICAgICAgICAgICAgIGNoYW5nZXMuZm9yRWFjaChmdW5jdGlvbihjaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYW5nZS5uYW1lID09PSBwcm9wTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGVyKGNoYW5nZS5vYmplY3RbY2hhbmdlLm5hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSBjYXRjaChlKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3BOYW1lLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0OiBnZXR0ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0OiBzZXR0ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoKGUyKSB7XG4gICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLl9fZGVmaW5lR2V0dGVyX18uY2FsbChvYmosIHByb3BOYW1lLCBnZXR0ZXIpO1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLl9fZGVmaW5lU2V0dGVyX18uY2FsbChvYmosIHByb3BOYW1lLCBzZXR0ZXIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2goZTMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwid2F0Y2hKUyBlcnJvcjogYnJvd3NlciBub3Qgc3VwcG9ydGVkIDovXCIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGRlZmluZVByb3AgPSBmdW5jdGlvbiAob2JqLCBwcm9wTmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3BOYW1lLCB7XG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBvYmpbcHJvcE5hbWVdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHdhdGNoID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHdhdGNoQWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB3YXRjaE1hbnkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdhdGNoT25lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cblxuICAgIHZhciB3YXRjaEFsbCA9IGZ1bmN0aW9uIChvYmosIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKSB7XG5cbiAgICAgICAgaWYgKCh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHJvcHMgPSBbXTtcblxuXG4gICAgICAgIGlmKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCA9IDA7IHByb3AgPCBvYmoubGVuZ3RoOyBwcm9wKyspIHsgLy9mb3IgZWFjaCBpdGVtIGlmIG9iaiBpcyBhbiBhcnJheVxuICAgICAgICAgICAgICAgIHByb3BzLnB1c2gocHJvcCk7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcDIgaW4gb2JqKSB7IC8vZm9yIGVhY2ggYXR0cmlidXRlIGlmIG9iaiBpcyBhbiBvYmplY3Rcblx0XHRcdFx0aWYgKHByb3AyID09IFwiJHZhbFwiKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wMikpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wMik7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHdhdGNoTWFueShvYmosIHByb3BzLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCk7IC8vd2F0Y2ggYWxsIGl0ZW1zIG9mIHRoZSBwcm9wc1xuXG4gICAgICAgIGlmIChhZGROUmVtb3ZlKSB7XG4gICAgICAgICAgICBwdXNoVG9MZW5ndGhTdWJqZWN0cyhvYmosIFwiJCR3YXRjaGxlbmd0aHN1YmplY3Ryb290XCIsIHdhdGNoZXIsIGxldmVsKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIHZhciB3YXRjaE1hbnkgPSBmdW5jdGlvbiAob2JqLCBwcm9wcywgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpIHtcblxuICAgICAgICBpZiAoKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxwcm9wcy5sZW5ndGg7IGkrKykgeyAvL3dhdGNoIGVhY2ggcHJvcGVydHlcbiAgICAgICAgICAgIHZhciBwcm9wID0gcHJvcHNbaV07XG4gICAgICAgICAgICB3YXRjaE9uZShvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB3YXRjaE9uZSA9IGZ1bmN0aW9uIChvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKSB7XG5cbiAgICAgICAgaWYgKCh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZihpc0Z1bmN0aW9uKG9ialtwcm9wXSkpIHsgLy9kb250IHdhdGNoIGlmIGl0IGlzIGEgZnVuY3Rpb25cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZihvYmpbcHJvcF0gIT0gbnVsbCAmJiAobGV2ZWwgPT09IHVuZGVmaW5lZCB8fCBsZXZlbCA+IDApKXtcbiAgICAgICAgICAgIHdhdGNoQWxsKG9ialtwcm9wXSwgd2F0Y2hlciwgbGV2ZWwhPT11bmRlZmluZWQ/IGxldmVsLTEgOiBsZXZlbCxudWxsLCBwYXRoICsgJy4nICsgcHJvcCk7IC8vcmVjdXJzaXZlbHkgd2F0Y2ggYWxsIGF0dHJpYnV0ZXMgb2YgdGhpc1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmaW5lV2F0Y2hlcihvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBwYXRoKTtcblxuICAgICAgICBpZihhZGROUmVtb3ZlICYmIChsZXZlbCA9PT0gdW5kZWZpbmVkIHx8IGxldmVsID4gMCkpe1xuICAgICAgICAgICAgcHVzaFRvTGVuZ3RoU3ViamVjdHMob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgdW53YXRjaCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbihhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB1bndhdGNoQWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB1bndhdGNoTWFueS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdW53YXRjaE9uZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHVud2F0Y2hBbGwgPSBmdW5jdGlvbiAob2JqLCB3YXRjaGVyKSB7XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFN0cmluZyB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgdmFyIHByb3BzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wID0gMDsgcHJvcCA8IG9iai5sZW5ndGg7IHByb3ArKykgeyAvL2ZvciBlYWNoIGl0ZW0gaWYgb2JqIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1bndhdGNoTWFueShvYmosIHByb3BzLCB3YXRjaGVyKTsgLy93YXRjaCBhbGwgaXRlbnMgb2YgdGhlIHByb3BzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdW53YXRjaFByb3BzSW5PYmplY3QgPSBmdW5jdGlvbiAob2JqMikge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wcyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AyIGluIG9iajIpIHsgLy9mb3IgZWFjaCBhdHRyaWJ1dGUgaWYgb2JqIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqMi5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmoyW3Byb3AyXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVud2F0Y2hQcm9wc0luT2JqZWN0KG9iajJbcHJvcDJdKTsgLy9yZWN1cnMgaW50byBvYmplY3QgcHJvcHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wMik7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVud2F0Y2hNYW55KG9iajIsIHByb3BzLCB3YXRjaGVyKTsgLy91bndhdGNoIGFsbCBvZiB0aGUgcHJvcHNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB1bndhdGNoUHJvcHNJbk9iamVjdChvYmopO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdmFyIHVud2F0Y2hNYW55ID0gZnVuY3Rpb24gKG9iaiwgcHJvcHMsIHdhdGNoZXIpIHtcblxuICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBwcm9wcykgeyAvL3dhdGNoIGVhY2ggYXR0cmlidXRlIG9mIFwicHJvcHNcIiBpZiBpcyBhbiBvYmplY3RcbiAgICAgICAgICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICB1bndhdGNoT25lKG9iaiwgcHJvcHNbcHJvcDJdLCB3YXRjaGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZGVmaW5lV2F0Y2hlciA9IGZ1bmN0aW9uIChvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBwYXRoKSB7XG5cbiAgICAgICAgdmFyIHZhbCA9IG9ialtwcm9wXTtcblxuICAgICAgICB3YXRjaEZ1bmN0aW9ucyhvYmosIHByb3ApO1xuXG4gICAgICAgIGlmICghb2JqLndhdGNoZXJzKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wKG9iaiwgXCJ3YXRjaGVyc1wiLCB7fSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9iai5fcGF0aCkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcChvYmosIFwiX3BhdGhcIiwgcGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9iai53YXRjaGVyc1twcm9wXSkge1xuICAgICAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZihvYmoud2F0Y2hlcnNbcHJvcF1baV0gPT09IHdhdGNoZXIpe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdLnB1c2god2F0Y2hlcik7IC8vYWRkIHRoZSBuZXcgd2F0Y2hlciBpbiB0aGUgd2F0Y2hlcnMgYXJyYXlcblxuXG4gICAgICAgIHZhciBnZXR0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgdmFyIHNldHRlciA9IGZ1bmN0aW9uIChuZXd2YWwpIHtcbiAgICAgICAgICAgIHZhciBvbGR2YWwgPSB2YWw7XG4gICAgICAgICAgICB2YWwgPSBuZXd2YWw7XG5cbiAgICAgICAgICAgIGlmIChsZXZlbCAhPT0gMCAmJiBvYmpbcHJvcF0pe1xuICAgICAgICAgICAgICAgIC8vIHdhdGNoIHN1YiBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgd2F0Y2hBbGwob2JqW3Byb3BdLCB3YXRjaGVyLCAobGV2ZWw9PT11bmRlZmluZWQpP2xldmVsOmxldmVsLTEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3YXRjaEZ1bmN0aW9ucyhvYmosIHByb3ApO1xuXG4gICAgICAgICAgICBpZiAoIVdhdGNoSlMubm9Nb3JlKXtcbiAgICAgICAgICAgICAgICAvL2lmIChKU09OLnN0cmluZ2lmeShvbGR2YWwpICE9PSBKU09OLnN0cmluZ2lmeShuZXd2YWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZHZhbCAhPT0gbmV3dmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxXYXRjaGVycyhvYmosIHByb3AsIFwic2V0XCIsIG5ld3ZhbCwgb2xkdmFsKTtcbiAgICAgICAgICAgICAgICAgICAgV2F0Y2hKUy5ub01vcmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZGVmaW5lR2V0QW5kU2V0KG9iaiwgcHJvcCwgZ2V0dGVyLCBzZXR0ZXIpO1xuXG4gICAgfTtcblxuICAgIHZhciBjYWxsV2F0Y2hlcnMgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCBhY3Rpb24sIG5ld3ZhbCwgb2xkdmFsKSB7XG4gICAgICAgIGlmIChwcm9wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHdyPTA7IHdyPG9iai53YXRjaGVyc1twcm9wXS5sZW5ndGg7IHdyKyspIHtcbiAgICAgICAgICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF1bd3JdLmNhbGwob2JqLCBwcm9wLCBhY3Rpb24sIG5ld3ZhbCwgb2xkdmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gb2JqKSB7Ly9jYWxsIGFsbFxuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKG9iaiwgcHJvcCwgYWN0aW9uLCBuZXd2YWwsIG9sZHZhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEB0b2RvIGNvZGUgcmVsYXRlZCB0byBcIndhdGNoRnVuY3Rpb25zXCIgaXMgY2VydGFpbmx5IGJ1Z2d5XG4gICAgdmFyIG1ldGhvZE5hbWVzID0gWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc2xpY2UnLCAndW5zaGlmdCcsICdzcGxpY2UnXTtcbiAgICB2YXIgZGVmaW5lQXJyYXlNZXRob2RXYXRjaGVyID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgb3JpZ2luYWwsIG1ldGhvZE5hbWUpIHtcbiAgICAgICAgZGVmaW5lUHJvcChvYmpbcHJvcF0sIG1ldGhvZE5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IG9yaWdpbmFsLmFwcGx5KG9ialtwcm9wXSwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHdhdGNoT25lKG9iaiwgb2JqW3Byb3BdKTtcbiAgICAgICAgICAgIGlmIChtZXRob2ROYW1lICE9PSAnc2xpY2UnKSB7XG4gICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKG9iaiwgcHJvcCwgbWV0aG9kTmFtZSxhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHdhdGNoRnVuY3Rpb25zID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7XG5cbiAgICAgICAgaWYgKCghb2JqW3Byb3BdKSB8fCAob2JqW3Byb3BdIGluc3RhbmNlb2YgU3RyaW5nKSB8fCAoIWlzQXJyYXkob2JqW3Byb3BdKSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSBtZXRob2ROYW1lcy5sZW5ndGgsIG1ldGhvZE5hbWU7IGktLTspIHtcbiAgICAgICAgICAgIG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgICAgICAgIGRlZmluZUFycmF5TWV0aG9kV2F0Y2hlcihvYmosIHByb3AsIG9ialtwcm9wXVttZXRob2ROYW1lXSwgbWV0aG9kTmFtZSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgdW53YXRjaE9uZSA9IGZ1bmN0aW9uIChvYmosIHByb3AsIHdhdGNoZXIpIHtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPG9iai53YXRjaGVyc1twcm9wXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHcgPSBvYmoud2F0Y2hlcnNbcHJvcF1baV07XG5cbiAgICAgICAgICAgIGlmKHcgPT0gd2F0Y2hlcikge1xuICAgICAgICAgICAgICAgIG9iai53YXRjaGVyc1twcm9wXS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZW1vdmVGcm9tTGVuZ3RoU3ViamVjdHMob2JqLCBwcm9wLCB3YXRjaGVyKTtcbiAgICB9O1xuXG4gICAgdmFyIGxvb3AgPSBmdW5jdGlvbigpe1xuXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPGxlbmd0aHN1YmplY3RzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIHZhciBzdWJqID0gbGVuZ3Roc3ViamVjdHNbaV07XG5cbiAgICAgICAgICAgIGlmIChzdWJqLnByb3AgPT09IFwiJCR3YXRjaGxlbmd0aHN1YmplY3Ryb290XCIpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWZmZXJlbmNlID0gZ2V0T2JqRGlmZihzdWJqLm9iaiwgc3Viai5hY3R1YWwpO1xuXG4gICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGggfHwgZGlmZmVyZW5jZS5yZW1vdmVkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQgIT0gZGlmZmVyZW5jZS5yZW1vdmVkICYmIChkaWZmZXJlbmNlLmFkZGVkWzBdICE9IGRpZmZlcmVuY2UucmVtb3ZlZFswXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaE1hbnkoc3Viai5vYmosIGRpZmZlcmVuY2UuYWRkZWQsIHN1Ymoud2F0Y2hlciwgc3Viai5sZXZlbCAtIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJqLndhdGNoZXIuY2FsbChzdWJqLm9iaiwgXCJyb290XCIsIFwiZGlmZmVyZW50YXR0clwiLCBkaWZmZXJlbmNlLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3Viai5hY3R1YWwgPSBjbG9uZShzdWJqLm9iaik7XG5cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZihzdWJqLm9ialtzdWJqLnByb3BdID09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgICAgICB2YXIgZGlmZmVyZW5jZSA9IGdldE9iakRpZmYoc3Viai5vYmpbc3Viai5wcm9wXSwgc3Viai5hY3R1YWwpO1xuXG4gICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGggfHwgZGlmZmVyZW5jZS5yZW1vdmVkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGo9MDsgajxzdWJqLm9iai53YXRjaGVyc1tzdWJqLnByb3BdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hNYW55KHN1Ymoub2JqW3N1YmoucHJvcF0sIGRpZmZlcmVuY2UuYWRkZWQsIHN1Ymoub2JqLndhdGNoZXJzW3N1YmoucHJvcF1bal0sIHN1YmoubGV2ZWwgLSAxLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxXYXRjaGVycyhzdWJqLm9iaiwgc3Viai5wcm9wLCBcImRpZmZlcmVudGF0dHJcIiwgZGlmZmVyZW5jZSwgc3Viai5hY3R1YWwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN1YmouYWN0dWFsID0gY2xvbmUoc3Viai5vYmpbc3Viai5wcm9wXSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHB1c2hUb0xlbmd0aFN1YmplY3RzID0gZnVuY3Rpb24ob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCl7XG5cbiAgICAgICAgdmFyIGFjdHVhbDtcblxuICAgICAgICBpZiAocHJvcCA9PT0gXCIkJHdhdGNobGVuZ3Roc3ViamVjdHJvb3RcIikge1xuICAgICAgICAgICAgYWN0dWFsID0gIGNsb25lKG9iaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY3R1YWwgPSBjbG9uZShvYmpbcHJvcF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGVuZ3Roc3ViamVjdHMucHVzaCh7XG4gICAgICAgICAgICBvYmo6IG9iaixcbiAgICAgICAgICAgIHByb3A6IHByb3AsXG4gICAgICAgICAgICBhY3R1YWw6IGFjdHVhbCxcbiAgICAgICAgICAgIHdhdGNoZXI6IHdhdGNoZXIsXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciByZW1vdmVGcm9tTGVuZ3RoU3ViamVjdHMgPSBmdW5jdGlvbihvYmosIHByb3AsIHdhdGNoZXIpe1xuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxsZW5ndGhzdWJqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHN1YmogPSBsZW5ndGhzdWJqZWN0c1tpXTtcblxuICAgICAgICAgICAgaWYgKHN1Ymoub2JqID09IG9iaiAmJiBzdWJqLnByb3AgPT0gcHJvcCAmJiBzdWJqLndhdGNoZXIgPT0gd2F0Y2hlcikge1xuICAgICAgICAgICAgICAgIGxlbmd0aHN1YmplY3RzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHNldEludGVydmFsKGxvb3AsIDUwKTtcblxuICAgIFdhdGNoSlMud2F0Y2ggPSB3YXRjaDtcbiAgICBXYXRjaEpTLnVud2F0Y2ggPSB1bndhdGNoO1xuICAgIFdhdGNoSlMuY2FsbFdhdGNoZXJzID0gY2FsbFdhdGNoZXJzO1xuXG4gICAgcmV0dXJuIFdhdGNoSlM7XG5cbn0pKTtcbiIsImNsYXNzIE5vdGlmaWNhdGlvblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICBzaG93OiAodGl0bGUsIG1lc3NhZ2UpIC0+XG4gICAgdW5pcXVlSWQgPSAobGVuZ3RoPTgpIC0+XG4gICAgICBpZCA9IFwiXCJcbiAgICAgIGlkICs9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKSB3aGlsZSBpZC5sZW5ndGggPCBsZW5ndGhcbiAgICAgIGlkLnN1YnN0ciAwLCBsZW5ndGhcblxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSB1bmlxdWVJZCgpLFxuICAgICAgdHlwZTonYmFzaWMnXG4gICAgICB0aXRsZTp0aXRsZVxuICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgICAgaWNvblVybDonaW1hZ2VzL2ljb24tMzgucG5nJyxcbiAgICAgIChjYWxsYmFjaykgLT5cbiAgICAgICAgdW5kZWZpbmVkXG5cbm1vZHVsZS5leHBvcnRzID0gTm90aWZpY2F0aW9uIiwiI1RPRE86IHJld3JpdGUgdGhpcyBjbGFzcyB1c2luZyB0aGUgbmV3IGNocm9tZS5zb2NrZXRzLiogYXBpIHdoZW4geW91IGNhbiBtYW5hZ2UgdG8gbWFrZSBpdCB3b3JrXG5jbGFzcyBTZXJ2ZXJcbiAgc29ja2V0OiBjaHJvbWUuc29ja2V0XG4gICMgdGNwOiBjaHJvbWUuc29ja2V0cy50Y3BcbiAgc29ja2V0UHJvcGVydGllczpcbiAgICAgIHBlcnNpc3RlbnQ6dHJ1ZVxuICAgICAgbmFtZTonU0xSZWRpcmVjdG9yJ1xuICAjIHNvY2tldEluZm86bnVsbFxuICBnZXRMb2NhbEZpbGU6bnVsbFxuICBzb2NrZXRJZHM6W11cbiAgc3RhdHVzOlxuICAgIGhvc3Q6bnVsbFxuICAgIHBvcnQ6bnVsbFxuICAgIG1heENvbm5lY3Rpb25zOjUwXG4gICAgaXNPbjpmYWxzZVxuICAgIHNvY2tldEluZm86bnVsbFxuICAgIHVybDpudWxsXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQHN0YXR1cy5ob3N0ID0gXCIxMjcuMC4wLjFcIlxuICAgIEBzdGF0dXMucG9ydCA9IDEwMDEyXG4gICAgQHN0YXR1cy5tYXhDb25uZWN0aW9ucyA9IDUwXG4gICAgQHN0YXR1cy51cmwgPSAnaHR0cDovLycgKyBAc3RhdHVzLmhvc3QgKyAnOicgKyBAc3RhdHVzLnBvcnQgKyAnLydcbiAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuXG5cbiAgc3RhcnQ6IChob3N0LHBvcnQsbWF4Q29ubmVjdGlvbnMsIGNiKSAtPlxuICAgIGlmIGhvc3Q/IHRoZW4gQHN0YXR1cy5ob3N0ID0gaG9zdFxuICAgIGlmIHBvcnQ/IHRoZW4gQHN0YXR1cy5wb3J0ID0gcG9ydFxuICAgIGlmIG1heENvbm5lY3Rpb25zPyB0aGVuIEBzdGF0dXMubWF4Q29ubmVjdGlvbnMgPSBtYXhDb25uZWN0aW9uc1xuXG4gICAgQGtpbGxBbGwgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgIHJldHVybiBjYj8gZXJyIGlmIGVycj9cblxuICAgICAgQHN0YXR1cy5pc09uID0gZmFsc2VcbiAgICAgIEBzb2NrZXQuY3JlYXRlICd0Y3AnLCB7fSwgKHNvY2tldEluZm8pID0+XG4gICAgICAgIEBzdGF0dXMuc29ja2V0SW5mbyA9IHNvY2tldEluZm9cbiAgICAgICAgQHNvY2tldElkcyA9IFtdXG4gICAgICAgIEBzb2NrZXRJZHMucHVzaCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQgJ3NvY2tldElkcyc6QHNvY2tldElkc1xuICAgICAgICBAc29ja2V0Lmxpc3RlbiBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBzdGF0dXMuaG9zdCwgQHN0YXR1cy5wb3J0LCAocmVzdWx0KSA9PlxuICAgICAgICAgIGlmIHJlc3VsdCA+IC0xXG4gICAgICAgICAgICBzaG93ICdsaXN0ZW5pbmcgJyArIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICAgICAgQHN0YXR1cy5pc09uID0gdHJ1ZVxuICAgICAgICAgICAgQHN0YXR1cy51cmwgPSAnaHR0cDovLycgKyBAc3RhdHVzLmhvc3QgKyAnOicgKyBAc3RhdHVzLnBvcnQgKyAnLydcbiAgICAgICAgICAgIEBzb2NrZXQuYWNjZXB0IEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuICAgICAgICAgICAgY2I/IG51bGwsIEBzdGF0dXNcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjYj8gcmVzdWx0XG5cblxuICBraWxsQWxsOiAoY2IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQgJ3NvY2tldElkcycsIChyZXN1bHQpID0+XG4gICAgICBAc29ja2V0SWRzID0gcmVzdWx0LnNvY2tldElkc1xuICAgICAgQHN0YXR1cy5pc09uID0gZmFsc2VcbiAgICAgIHJldHVybiBjYj8gbnVsbCwgJ3N1Y2Nlc3MnIHVubGVzcyBAc29ja2V0SWRzP1xuICAgICAgY250ID0gMFxuICAgICAgaSA9IDBcbiAgICAgIFxuICAgICAgd2hpbGUgaSA8IEBzb2NrZXRJZHNbMF1cbiAgICAgICAgQHNvY2tldC5kZXN0cm95IGlcbiAgICAgICAgaSsrXG5cbiAgICAgIGZvciBzIGluIEBzb2NrZXRJZHNcbiAgICAgICAgZG8gKHMpID0+XG4gICAgICAgICAgY250KytcbiAgICAgICAgICBAc29ja2V0LmdldEluZm8gcywgKHNvY2tldEluZm8pID0+XG4gICAgICAgICAgICBjbnQtLVxuICAgICAgICAgICAgaWYgbm90IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcj9cbiAgICAgICAgICAgICAgQHNvY2tldC5kaXNjb25uZWN0IHMgaWYgQHN0YXR1cy5zb2NrZXRJbmZvPy5jb25uZWN0ZWQgb3Igbm90IEBzdGF0dXMuc29ja2V0SW5mbz9cbiAgICAgICAgICAgICAgQHNvY2tldC5kZXN0cm95IHNcblxuICAgICAgICAgICAgY2I/IG51bGwsICdzdWNjZXNzJyBpZiBjbnQgaXMgMFxuXG4gIHN0b3A6IChjYikgLT5cbiAgICBAa2lsbEFsbCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgQHN0YXR1cy5pc09uID0gZmFsc2VcbiAgICAgIGlmIGVycj8gXG4gICAgICAgIGNiPyBlcnJcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsc3VjY2Vzc1xuXG5cbiAgX29uUmVjZWl2ZTogKHJlY2VpdmVJbmZvKSA9PlxuICAgIHNob3coXCJDbGllbnQgc29ja2V0ICdyZWNlaXZlJyBldmVudDogc2Q9XCIgKyByZWNlaXZlSW5mby5zb2NrZXRJZFxuICAgICsgXCIsIGJ5dGVzPVwiICsgcmVjZWl2ZUluZm8uZGF0YS5ieXRlTGVuZ3RoKVxuXG4gIF9vbkxpc3RlbjogKHNlcnZlclNvY2tldElkLCByZXN1bHRDb2RlKSA9PlxuICAgIHJldHVybiBzaG93ICdFcnJvciBMaXN0ZW5pbmc6ICcgKyBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSBpZiByZXN1bHRDb2RlIDwgMFxuICAgIEBzZXJ2ZXJTb2NrZXRJZCA9IHNlcnZlclNvY2tldElkXG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdC5hZGRMaXN0ZW5lciBAX29uQWNjZXB0XG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdEVycm9yLmFkZExpc3RlbmVyIEBfb25BY2NlcHRFcnJvclxuICAgIEB0Y3Aub25SZWNlaXZlLmFkZExpc3RlbmVyIEBfb25SZWNlaXZlXG4gICAgIyBzaG93IFwiW1wiK3NvY2tldEluZm8ucGVlckFkZHJlc3MrXCI6XCIrc29ja2V0SW5mby5wZWVyUG9ydCtcIl0gQ29ubmVjdGlvbiBhY2NlcHRlZCFcIjtcbiAgICAjIGluZm8gPSBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAjIEBnZXRGaWxlIHVyaSwgKGZpbGUpIC0+XG4gIF9vbkFjY2VwdEVycm9yOiAoZXJyb3IpIC0+XG4gICAgc2hvdyBlcnJvclxuXG4gIF9vbkFjY2VwdDogKHNvY2tldEluZm8pID0+XG4gICAgIyByZXR1cm4gbnVsbCBpZiBpbmZvLnNvY2tldElkIGlzbnQgQHNlcnZlclNvY2tldElkXG4gICAgc2hvdyhcIlNlcnZlciBzb2NrZXQgJ2FjY2VwdCcgZXZlbnQ6IHNkPVwiICsgc29ja2V0SW5mby5zb2NrZXRJZClcbiAgICBpZiBzb2NrZXRJbmZvPy5zb2NrZXRJZD9cbiAgICAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZCwgKGVyciwgaW5mbykgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gQF93cml0ZUVycm9yIHNvY2tldEluZm8uc29ja2V0SWQsIDQwNCwgaW5mby5rZWVwQWxpdmVcblxuICAgICAgICBAZ2V0TG9jYWxGaWxlIGluZm8sIChlcnIsIGZpbGVFbnRyeSwgZmlsZVJlYWRlcikgPT5cbiAgICAgICAgICBpZiBlcnI/IHRoZW4gQF93cml0ZUVycm9yIHNvY2tldEluZm8uc29ja2V0SWQsIDQwNCwgaW5mby5rZWVwQWxpdmVcbiAgICAgICAgICBlbHNlIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJbmZvLnNvY2tldElkLCBmaWxlRW50cnksIGZpbGVSZWFkZXIsIGluZm8ua2VlcEFsaXZlXG4gICAgZWxzZVxuICAgICAgc2hvdyBcIk5vIHNvY2tldD8hXCJcbiAgICAjIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuXG5cbiAgc3RyaW5nVG9VaW50OEFycmF5OiAoc3RyaW5nKSAtPlxuICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgaSA9IDBcblxuICAgIHdoaWxlIGkgPCBzdHJpbmcubGVuZ3RoXG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgIGkrK1xuICAgIHZpZXdcblxuICBhcnJheUJ1ZmZlclRvU3RyaW5nOiAoYnVmZmVyKSAtPlxuICAgIHN0ciA9IFwiXCJcbiAgICB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgcyA9IDBcblxuICAgIHdoaWxlIHMgPCB1QXJyYXlWYWwubGVuZ3RoXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pXG4gICAgICBzKytcbiAgICBzdHJcblxuICBfd3JpdGUyMDBSZXNwb25zZTogKHNvY2tldElkLCBmaWxlRW50cnksIGZpbGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBjb250ZW50VHlwZSA9IChpZiAoZmlsZS50eXBlIGlzIFwiXCIpIHRoZW4gXCJ0ZXh0L3BsYWluXCIgZWxzZSBmaWxlLnR5cGUpXG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+XG4gICAgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShldi50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgICAgc2hvdyB3cml0ZUluZm9cbiAgICAgICAgIyBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5vbmVycm9yID0gKGVycm9yKSA9PlxuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGZpbGVcblxuXG4gICAgIyBAZW5kIHNvY2tldElkXG4gICAgIyBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICMgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgPT5cbiAgICAjICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAjICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICMgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAjICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJZFxuXG5cbiAgX3JlYWRGcm9tU29ja2V0OiAoc29ja2V0SWQsIGNiKSAtPlxuICAgIEBzb2NrZXQucmVhZCBzb2NrZXRJZCwgKHJlYWRJbmZvKSA9PlxuICAgICAgc2hvdyBcIlJFQURcIiwgcmVhZEluZm9cblxuICAgICAgIyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIGRhdGEgPSBAYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKVxuICAgICAgc2hvdyBkYXRhXG5cbiAgICAgIGtlZXBBbGl2ZSA9IGZhbHNlXG4gICAgICBrZWVwQWxpdmUgPSB0cnVlIGlmIGRhdGEuaW5kZXhPZiAnQ29ubmVjdGlvbjoga2VlcC1hbGl2ZScgaXNudCAtMVxuXG4gICAgICBpZiBkYXRhLmluZGV4T2YoXCJHRVQgXCIpIGlzbnQgMFxuICAgICAgICByZXR1cm4gY2I/ICc0MDQnLCBrZWVwQWxpdmU6a2VlcEFsaXZlXG5cblxuXG4gICAgICB1cmlFbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIDQpXG5cbiAgICAgIHJldHVybiBlbmQgc29ja2V0SWQgaWYgdXJpRW5kIDwgMFxuXG4gICAgICB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpXG4gICAgICBpZiBub3QgdXJpP1xuICAgICAgICByZXR1cm4gY2I/ICc0MDQnLCBrZWVwQWxpdmU6a2VlcEFsaXZlXG5cbiAgICAgIGluZm8gPVxuICAgICAgICB1cmk6IHVyaVxuICAgICAgICBrZWVwQWxpdmU6a2VlcEFsaXZlXG4gICAgICBpbmZvLnJlZmVyZXIgPSBkYXRhLm1hdGNoKC9SZWZlcmVyOlxccyguKikvKT9bMV1cbiAgICAgICNzdWNjZXNzXG4gICAgICBjYj8gbnVsbCwgaW5mb1xuXG4gIGVuZDogKHNvY2tldElkLCBrZWVwQWxpdmUpIC0+XG4gICAgICAjIGlmIGtlZXBBbGl2ZVxuICAgICAgIyAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICMgZWxzZVxuICAgIEBzb2NrZXQuZGlzY29ubmVjdCBzb2NrZXRJZFxuICAgIEBzb2NrZXQuZGVzdHJveSBzb2NrZXRJZFxuICAgIHNob3cgJ2VuZGluZyAnICsgc29ja2V0SWRcbiAgICBAc29ja2V0LmFjY2VwdCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuICBfd3JpdGVFcnJvcjogKHNvY2tldElkLCBlcnJvckNvZGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBmaWxlID0gc2l6ZTogMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGJlZ2luLi4uIFwiXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogZmlsZSA9IFwiICsgZmlsZVxuICAgIGNvbnRlbnRUeXBlID0gXCJ0ZXh0L3BsYWluXCIgIyhmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCBcIiArIGVycm9yQ29kZSArIFwiIE5vdCBGb3VuZFxcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoKGlmIGtlZXBBbGl2ZSB0aGVuIFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIGVsc2UgXCJcIikpICsgXCJcXG5cXG5cIilcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgaGVhZGVyLi4uXCJcbiAgICBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldCBoZWFkZXIsIDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgdmlldy4uLlwiXG4gICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICAgc2hvdyBcIldSSVRFXCIsIHdyaXRlSW5mb1xuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG5cbm1vZHVsZS5leHBvcnRzID0gU2VydmVyXG4iLCJMSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5cbldhdGNoSlMgPSByZXF1aXJlICd3YXRjaGpzJ1xud2F0Y2ggPSBXYXRjaEpTLndhdGNoXG51bndhdGNoID0gV2F0Y2hKUy51bndhdGNoXG5jYWxsV2F0Y2hlcnMgPSBXYXRjaEpTLmNhbGxXYXRjaGVyc1xuXG5jbGFzcyBTdG9yYWdlXG4gIGFwaTogY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIGRhdGE6IFxuICAgIGN1cnJlbnRSZXNvdXJjZXM6IFtdXG4gICAgZGlyZWN0b3JpZXM6W11cbiAgICBtYXBzOltdXG4gICAgdGFiTWFwczp7fVxuICAgIGN1cnJlbnRGaWxlTWF0Y2hlczp7fVxuICBcbiAgc2Vzc2lvbjp7fVxuXG4gIG9uRGF0YUxvYWRlZDogLT5cblxuICBjYWxsYmFjazogKCkgLT5cbiAgbm90aWZ5T25DaGFuZ2U6ICgpIC0+XG4gIGNvbnN0cnVjdG9yOiAoX29uRGF0YUxvYWRlZCkgLT5cbiAgICBAb25EYXRhTG9hZGVkID0gX29uRGF0YUxvYWRlZCBpZiBfb25EYXRhTG9hZGVkP1xuICAgIEBhcGkuZ2V0IChyZXN1bHRzKSA9PlxuICAgICAgQGRhdGFba10gPSByZXN1bHRzW2tdIGZvciBrIG9mIHJlc3VsdHNcblxuICAgICAgd2F0Y2hBbmROb3RpZnkgQCwnZGF0YUNoYW5nZWQnLCBAZGF0YSwgdHJ1ZVxuXG4gICAgICB3YXRjaEFuZE5vdGlmeSBALCdzZXNzaW9uRGF0YScsIEBzZXNzaW9uLCBmYWxzZVxuXG4gICAgICBAb25EYXRhTG9hZGVkIEBkYXRhXG5cbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgLT5cbiAgICBcbiAgd2F0Y2hBbmROb3RpZnkgPSAoX3RoaXMsIG1zZ0tleSwgb2JqLCBzdG9yZSkgLT5cblxuICAgICAgX2xpc3RlbmVyID0gKHByb3AsIGFjdGlvbiwgbmV3VmFsLCBvbGRWYWwpIC0+XG4gICAgICAgIGlmIChhY3Rpb24gaXMgXCJzZXRcIiBvciBcImRpZmZlcmVudGF0dHJcIikgYW5kIF90aGlzLm5vV2F0Y2ggaXMgZmFsc2VcbiAgICAgICAgICBpZiBub3QgL15cXGQrJC8udGVzdChwcm9wKVxuICAgICAgICAgICAgc2hvdyBhcmd1bWVudHNcbiAgICAgICAgICAgIF90aGlzLmFwaS5zZXQgb2JqIGlmIHN0b3JlXG4gICAgICAgICAgICBtc2cgPSB7fVxuICAgICAgICAgICAgbXNnW21zZ0tleV0gPSBvYmpcbiAgICAgICAgICAgICMgdW53YXRjaCBvYmosIF9saXN0ZW5lciwzLHRydWVcbiAgICAgICAgICAgIF90aGlzLk1TRy5FeHRQb3J0IG1zZ1xuICAgICAgICBcbiAgICAgIF90aGlzLm5vV2F0Y2ggPSBmYWxzZVxuICAgICAgd2F0Y2ggb2JqLCBfbGlzdGVuZXIsMyx0cnVlXG5cbiAgICAgIF90aGlzLkxJU1RFTi5FeHQgbXNnS2V5LCAoZGF0YSkgLT5cbiAgICAgICAgX3RoaXMubm9XYXRjaCA9IHRydWVcbiAgICAgICAgIyB1bndhdGNoIG9iaiwgX2xpc3RlbmVyLDMsdHJ1ZVxuICAgICAgICBcbiAgICAgICAgb2JqW2tdID0gZGF0YVtrXSBmb3IgayBvZiBkYXRhXG4gICAgICAgIHNldFRpbWVvdXQgKCkgLT4gXG4gICAgICAgICAgX3RoaXMubm9XYXRjaCA9IGZhbHNlXG4gICAgICAgICwyMDBcblxuICBzYXZlOiAoa2V5LCBpdGVtLCBjYikgLT5cblxuICAgIG9iaiA9IHt9XG4gICAgb2JqW2tleV0gPSBpdGVtXG4gICAgQGRhdGFba2V5XSA9IGl0ZW1cbiAgICBAYXBpLnNldCBvYmosIChyZXMpID0+XG4gICAgICBjYj8oKVxuICAgICAgQGNhbGxiYWNrPygpXG4gXG4gIHNhdmVBbGw6IChkYXRhLCBjYikgLT5cblxuICAgIGlmIGRhdGE/IFxuICAgICAgQGFwaS5zZXQgZGF0YSwgKCkgPT5cbiAgICAgICAgY2I/KClcbiBcbiAgICBlbHNlXG4gICAgICBAYXBpLnNldCBAZGF0YSwgKCkgPT5cbiAgICAgICAgY2I/KClcbiBcblxuICByZXRyaWV2ZTogKGtleSwgY2IpIC0+XG4gICAgQG9ic2VydmVyLnN0b3AoKVxuICAgIEBhcGkuZ2V0IGtleSwgKHJlc3VsdHMpIC0+XG4gICAgICBAZGF0YVtyXSA9IHJlc3VsdHNbcl0gZm9yIHIgb2YgcmVzdWx0c1xuICAgICAgaWYgY2I/IHRoZW4gY2IgcmVzdWx0c1trZXldXG5cbiAgcmV0cmlldmVBbGw6IChjYikgLT5cbiAgICAjIEBvYnNlcnZlci5zdG9wKClcbiAgICBAYXBpLmdldCAocmVzdWx0KSA9PlxuICAgICAgZm9yIGMgb2YgcmVzdWx0IFxuICAgICAgIyAgIGRlbGV0ZSBAZGF0YVtjXVxuICAgICAgICBAZGF0YVtjXSA9IHJlc3VsdFtjXSBcbiAgICAgICMgQGRhdGEgPSByZXN1bHRcbiAgICAgICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6XG4gICAgICAgICAgcGF0aDpjXG4gICAgICAgICAgdmFsdWU6cmVzdWx0W2NdXG4gXG5cbiAgICAgIEBhcGkuc2V0IEBkYXRhXG4gICAgICAjIEBjYWxsYmFjaz8gcmVzdWx0XG4gICAgICBjYj8gcmVzdWx0XG4gICAgICBAb25EYXRhTG9hZGVkIEBkYXRhXG5cbiAgb25EYXRhTG9hZGVkOiAoZGF0YSkgLT5cblxuICBvbkNoYW5nZWQ6IChrZXksIGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgaWYgY2hhbmdlc1trZXldPyBhbmQgY2I/IHRoZW4gY2IgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuICBvbkNoYW5nZWRBbGw6ICgpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLG5hbWVzcGFjZSkgPT5cbiAgICAgIGhhc0NoYW5nZXMgPSBmYWxzZVxuICAgICAgZm9yIGMgb2YgY2hhbmdlcyB3aGVuIGNoYW5nZXNbY10ubmV3VmFsdWUgIT0gY2hhbmdlc1tjXS5vbGRWYWx1ZSBhbmQgYyBpc250J3NvY2tldElkcydcbiAgICAgICAgKGMpID0+IFxuICAgICAgICAgIEBkYXRhW2NdID0gY2hhbmdlc1tjXS5uZXdWYWx1ZSBcbiAgICAgICAgICBzaG93ICdkYXRhIGNoYW5nZWQ6ICdcbiAgICAgICAgICBzaG93IGNcbiAgICAgICAgICBzaG93IEBkYXRhW2NdXG5cbiAgICAgICAgICBoYXNDaGFuZ2VzID0gdHJ1ZVxuXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXMgaWYgaGFzQ2hhbmdlc1xuICAgICAgc2hvdyAnY2hhbmdlZCcgaWYgaGFzQ2hhbmdlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE3NDIwOTNcbm1vZHVsZS5leHBvcnRzID0gKCgpIC0+XG5cbiAgZGVidWcgPSB0cnVlXG4gIFxuICByZXR1cm4gKHdpbmRvdy5zaG93ID0gKCkgLT4pIGlmIG5vdCBkZWJ1Z1xuXG4gIG1ldGhvZHMgPSBbXG4gICAgJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJyxcbiAgICAnZXhjZXB0aW9uJywgJ2dyb3VwJywgJ2dyb3VwQ29sbGFwc2VkJywgJ2dyb3VwRW5kJywgJ2luZm8nLCAnbG9nJyxcbiAgICAnbWFya1RpbWVsaW5lJywgJ3Byb2ZpbGUnLCAncHJvZmlsZUVuZCcsICd0YWJsZScsICd0aW1lJywgJ3RpbWVFbmQnLFxuICAgICd0aW1lU3RhbXAnLCAndHJhY2UnLCAnd2FybiddXG4gICAgXG4gIG5vb3AgPSAoKSAtPlxuICAgICMgc3R1YiB1bmRlZmluZWQgbWV0aG9kcy5cbiAgICBmb3IgbSBpbiBtZXRob2RzICB3aGVuICAhY29uc29sZVttXVxuICAgICAgY29uc29sZVttXSA9IG5vb3BcblxuXG4gIGlmIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kP1xuICAgIHdpbmRvdy5zaG93ID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSlcbiAgZWxzZVxuICAgIHdpbmRvdy5zaG93ID0gKCkgLT5cbiAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpXG4pKClcbiJdfQ==
