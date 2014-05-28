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


},{"./config.coffee":2,"./filesystem.coffee":4,"./listen.coffee":5,"./msg.coffee":6,"./notification.coffee":8,"./server.coffee":10,"./storage.coffee":11,"./util.coffee":12}],2:[function(require,module,exports){
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


},{}],3:[function(require,module,exports){
var Application, FileSystem, Redirect, Server, Storage, app, getGlobal, redir, root;

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

Server = require('../../server.coffee');

redir = new Redirect;

app = root.app = new Application({
  Redirect: redir,
  Storage: Storage,
  FS: FileSystem,
  Server: Server
});

app.Storage.retrieveAll(null);

chrome.tabs.onUpdated.addListener((function(_this) {
  return function(tabId, changeInfo, tab) {};
})(this));


},{"../../common.coffee":1,"../../filesystem.coffee":4,"../../redirect.coffee":9,"../../server.coffee":10,"../../storage.coffee":11}],4:[function(require,module,exports){
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


},{"./config.coffee":2}],7:[function(require,module,exports){
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
var Redirect,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Redirect = (function() {
  Redirect.prototype.data = {};

  Redirect.prototype.prefix = null;

  Redirect.prototype.currentMatches = {};

  Redirect.prototype.currentTabId = null;

  function Redirect() {
    this.withPrefix = __bind(this.withPrefix, this);
    this.getLocalFilePathWithRedirect = __bind(this.getLocalFilePathWithRedirect, this);
  }

  Redirect.prototype.getLocalFilePathWithRedirect = function(url) {
    var filePath, filePathRegex, map, resPath, _i, _j, _len, _len1, _maps, _ref, _ref1;
    filePathRegex = /^((http[s]?|ftp|chrome-extension|file):\/\/)?\/?([^\/\.]+\.)*?([^\/\.]+\.[^:\/\s\.]{2,3}(\.[^:\/\s\.]‌​{2,3})?)(:\d+)?($|\/)([^#?\s]+)?(.*?)?(#[\w\-]+)?$/;
    _maps = [];
    if (this.data[this.currentTabId] != null) {
      _ref = this.data[this.currentTabId].maps;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        map = _ref[_i];
        if (map.isOn) {
          _maps.push(map);
        }
      }
    }
    if (!(_maps.length > 0)) {
      return null;
    }
    resPath = (_ref1 = url.match(filePathRegex)) != null ? _ref1[8] : void 0;
    if (resPath == null) {
      resPath = url;
    }
    if (resPath == null) {
      return null;
    }
    for (_j = 0, _len1 = _maps.length; _j < _len1; _j++) {
      map = _maps[_j];
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

  Redirect.prototype.tab = function(tabId) {
    var _base;
    this.currentTabId = tabId;
    if ((_base = this.data)[tabId] == null) {
      _base[tabId] = {
        isOn: false
      };
    }
    return this;
  };

  Redirect.prototype.withPrefix = function(prefix) {
    this.prefix = prefix;
    return this;
  };

  Redirect.prototype.withMaps = function(maps) {
    if (Object.getOwnPropertyNames(maps).length === 0) {
      this.data[this.currentTabId].maps = [];
      this._stop(this.currentTabId);
    } else {
      this.data[this.currentTabId].maps = maps;
    }
    return this;
  };

  Redirect.prototype.start = function() {
    if (!this.data[this.currentTabId].listener) {
      chrome.webRequest.onBeforeRequest.removeListener(this.data[this.currentTabId].listener);
    }
    this.data[this.currentTabId].listener = this.createRedirectListener();
    this.data[this.currentTabId].onHeadersReceivedListener = this.createOnHeadersReceivedListener();
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
    chrome.webRequest.onBeforeRequest.removeListener(this.data[tabId].listener);
    return chrome.webRequest.onHeadersReceived.removeListener(this.data[tabId].onHeadersReceivedListener);
  };

  Redirect.prototype._start = function(tabId) {
    chrome.webRequest.onBeforeRequest.addListener(this.data[tabId].listener, {
      urls: ['<all_urls>'],
      tabId: tabId
    }, ['blocking']);
    return chrome.webRequest.onHeadersReceived.addListener(this.data[tabId].onHeadersReceivedListener, {
      urls: ['<all_urls>'],
      tabId: tabId
    }, ['blocking', 'responseHeaders']);
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
    var isOn, m, _i, _len, _ref, _ref1, _ref2;
    isOn = false;
    if (((_ref = this.data[this.currentTabId]) != null ? _ref.maps : void 0) != null) {
      _ref2 = (_ref1 = this.data[this.currentTabId]) != null ? _ref1.maps : void 0;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        m = _ref2[_i];
        if (m.isOn) {
          isOn = true;
          break;
        } else {
          isOn = false;
        }
      }
      if (isOn) {
        this.start();
      } else {
        this._stop(this.currentTabId);
      }
      return isOn;
    }
  };

  Redirect.prototype.createOnHeadersReceivedListener = function() {
    return (function(_this) {
      return function(details) {
        var rule;
        if (details.url.indexOf(_this.prefix) === 0) {
          rule = {
            name: "Access-Control-Allow-Origin",
            value: "*"
          };
          details.responseHeaders.push(rule);
        }
        return {
          responseHeaders: details.responseHeaders
        };
      };
    })(this);
  };

  Redirect.prototype.createRedirectListener = function() {
    return (function(_this) {
      return function(details) {
        var path;
        path = _this.getLocalFilePathWithRedirect(details.url);
        if ((path != null) && path.indexOf(_this.prefix === -1)) {
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


},{}],10:[function(require,module,exports){
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


},{}],11:[function(require,module,exports){
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


},{"./listen.coffee":5,"./msg.coffee":6,"watchjs":7}],12:[function(require,module,exports){
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


},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvY29tbW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9jb25maWcuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L2V4dGVuc2lvbi9zcmMvYmFja2dyb3VuZC5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L25vZGVfbW9kdWxlcy93YXRjaGpzL3NyYy93YXRjaC5qcyIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9ub3RpZmljYXRpb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3JlZGlyZWN0LmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9zZXJ2ZXIuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3N0b3JhZ2UuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3V0aWwuY29mZmVlIl0sIm5hbWVzIjpb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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LEVBRWdDLFVBRmhDLEVBRTRDLE1BRjVDLEVBRW9ELEtBRnBELEVBR1IsY0FIUSxFQUdRLFNBSFIsRUFHbUIsWUFIbkIsRUFHaUMsT0FIakMsRUFHMEMsTUFIMUMsRUFHa0QsU0FIbEQsRUFJUixXQUpRLEVBSUssT0FKTCxFQUljLE1BSmQsQ0FKVixDQUFBO0FBQUEsRUFVQSxJQUFBLEdBQU8sU0FBQSxHQUFBO0FBRUwsUUFBQSxxQkFBQTtBQUFBO1NBQUEsOENBQUE7c0JBQUE7VUFBd0IsQ0FBQSxPQUFTLENBQUEsQ0FBQTtBQUMvQixzQkFBQSxPQUFRLENBQUEsQ0FBQSxDQUFSLEdBQWEsS0FBYjtPQURGO0FBQUE7b0JBRks7RUFBQSxDQVZQLENBQUE7QUFnQkEsRUFBQSxJQUFHLCtCQUFIO1dBQ0UsTUFBTSxDQUFDLElBQVAsR0FBYyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUF4QixDQUE2QixPQUFPLENBQUMsR0FBckMsRUFBMEMsT0FBMUMsRUFEaEI7R0FBQSxNQUFBO1dBR0UsTUFBTSxDQUFDLElBQVAsR0FBYyxTQUFBLEdBQUE7YUFDWixRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUF6QixDQUE4QixPQUFPLENBQUMsR0FBdEMsRUFBMkMsT0FBM0MsRUFBb0QsU0FBcEQsRUFEWTtJQUFBLEVBSGhCO0dBbEJnQjtBQUFBLENBQUQsQ0FBQSxDQUFBLENBQWpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUgJy4vdXRpbC5jb2ZmZWUnXG5Db25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5MSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuTm90aWZpY2F0aW9uID0gcmVxdWlyZSAnLi9ub3RpZmljYXRpb24uY29mZmVlJ1xuU2VydmVyID0gcmVxdWlyZSAnLi9zZXJ2ZXIuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgQ29uZmlnXG4gIExJU1RFTjogbnVsbFxuICBNU0c6IG51bGxcbiAgU3RvcmFnZTogbnVsbFxuICBGUzogbnVsbFxuICBTZXJ2ZXI6IG51bGxcbiAgTm90aWZ5OiBudWxsXG4gIHBsYXRmb3JtOm51bGxcbiAgY3VycmVudFRhYklkOm51bGxcblxuICBjb25zdHJ1Y3RvcjogKGRlcHMpIC0+XG4gICAgc3VwZXJcblxuICAgIEBNU0cgPz0gTVNHLmdldCgpXG4gICAgQExJU1RFTiA/PSBMSVNURU4uZ2V0KClcbiAgICBcbiAgICBjaHJvbWUucnVudGltZS5vbkNvbm5lY3RFeHRlcm5hbC5hZGRMaXN0ZW5lciAocG9ydCkgPT5cbiAgICAgIGlmIHBvcnQuc2VuZGVyLmlkIGlzbnQgQEVYVF9JRFxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgQE1TRy5zZXRQb3J0IHBvcnRcbiAgICAgIEBMSVNURU4uc2V0UG9ydCBwb3J0XG4gICAgXG4gICAgcG9ydCA9IGNocm9tZS5ydW50aW1lLmNvbm5lY3QgQEVYVF9JRCBcbiAgICBATVNHLnNldFBvcnQgcG9ydFxuICAgIEBMSVNURU4uc2V0UG9ydCBwb3J0XG4gICAgXG4gICAgZm9yIHByb3Agb2YgZGVwc1xuICAgICAgaWYgdHlwZW9mIGRlcHNbcHJvcF0gaXMgXCJvYmplY3RcIiBcbiAgICAgICAgQFtwcm9wXSA9IEB3cmFwT2JqSW5ib3VuZCBkZXBzW3Byb3BdXG4gICAgICBpZiB0eXBlb2YgZGVwc1twcm9wXSBpcyBcImZ1bmN0aW9uXCIgXG4gICAgICAgIEBbcHJvcF0gPSBAd3JhcE9iak91dGJvdW5kIG5ldyBkZXBzW3Byb3BdXG5cbiAgICBAU3RvcmFnZS5vbkRhdGFMb2FkZWQgPSAoZGF0YSkgPT5cbiAgICAgICMgQGRhdGEgPSBkYXRhXG4gICAgICAjIGRlbGV0ZSBAU3RvcmFnZS5kYXRhLnNlcnZlclxuICAgICAgIyBAU3RvcmFnZS5kYXRhLnNlcnZlciA9IHt9XG4gICAgICAjIGRlbGV0ZSBAU3RvcmFnZS5kYXRhLnNlcnZlci5zdGF0dXNcblxuICAgICAgaWYgbm90IEBTdG9yYWdlLmRhdGEuZmlyc3RUaW1lP1xuICAgICAgICBAU3RvcmFnZS5kYXRhLmZpcnN0VGltZSA9IGZhbHNlXG4gICAgICAgIEBTdG9yYWdlLmRhdGEubWFwcy5wdXNoXG4gICAgICAgICAgbmFtZTonU2FsZXNmb3JjZSdcbiAgICAgICAgICB1cmw6J2h0dHBzLipcXC9yZXNvdXJjZShcXC9bMC05XSspP1xcLyhbQS1aYS16MC05XFwtLl9dK1xcLyk/J1xuICAgICAgICAgIHJlZ2V4UmVwbDonJ1xuICAgICAgICAgIGlzUmVkaXJlY3Q6dHJ1ZVxuICAgICAgICAgIGlzT246ZmFsc2VcblxuXG4gICAgICAjIGlmIEBSZWRpcmVjdD8gdGhlbiBAUmVkaXJlY3QuZGF0YSA9IEBkYXRhLnRhYk1hcHNcblxuICAgIEBOb3RpZnkgPz0gKG5ldyBOb3RpZmljYXRpb24pLnNob3cgXG4gICAgIyBAU3RvcmFnZSA/PSBAd3JhcE9iak91dGJvdW5kIG5ldyBTdG9yYWdlIEBkYXRhXG4gICAgIyBARlMgPSBuZXcgRmlsZVN5c3RlbSBcbiAgICAjIEBTZXJ2ZXIgPz0gQHdyYXBPYmpPdXRib3VuZCBuZXcgU2VydmVyXG4gICAgQGRhdGEgPSBAU3RvcmFnZS5kYXRhXG4gICAgXG4gICAgQHdyYXAgPSBpZiBAU0VMRl9UWVBFIGlzICdBUFAnIHRoZW4gQHdyYXBJbmJvdW5kIGVsc2UgQHdyYXBPdXRib3VuZFxuXG4gICAgQG9wZW5BcHAgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ub3BlbkFwcCcsIEBvcGVuQXBwXG4gICAgQGxhdW5jaEFwcCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5sYXVuY2hBcHAnLCBAbGF1bmNoQXBwXG4gICAgQHN0YXJ0U2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnN0YXJ0U2VydmVyJywgQHN0YXJ0U2VydmVyXG4gICAgQHJlc3RhcnRTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ucmVzdGFydFNlcnZlcicsIEByZXN0YXJ0U2VydmVyXG4gICAgQHN0b3BTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uc3RvcFNlcnZlcicsIEBzdG9wU2VydmVyXG4gICAgQGdldEZpbGVNYXRjaCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRGaWxlTWF0Y2gnLCBAZ2V0RmlsZU1hdGNoXG5cbiAgICBAd3JhcCA9IGlmIEBTRUxGX1RZUEUgaXMgJ0VYVEVOU0lPTicgdGhlbiBAd3JhcEluYm91bmQgZWxzZSBAd3JhcE91dGJvdW5kXG5cbiAgICBAZ2V0UmVzb3VyY2VzID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldFJlc291cmNlcycsIEBnZXRSZXNvdXJjZXNcbiAgICBAZ2V0Q3VycmVudFRhYiA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRDdXJyZW50VGFiJywgQGdldEN1cnJlbnRUYWJcblxuICAgIEBpbml0KClcblxuICBpbml0OiAoKSAtPlxuICAgICAgQFN0b3JhZ2Uuc2Vzc2lvbi5zZXJ2ZXIgPSB7fVxuICAgICAgQFN0b3JhZ2Uuc2Vzc2lvbi5zZXJ2ZXIuc3RhdHVzID0gQFNlcnZlci5zdGF0dXNcbiAgICAjIEBTdG9yYWdlLnJldHJpZXZlQWxsKCkgaWYgQFN0b3JhZ2U/XG5cblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIGxhdW5jaEFwcDogKGNiLCBlcnJvcikgLT5cbiAgICAjIG5lZWRzIG1hbmFnZW1lbnQgcGVybWlzc2lvbi4gb2ZmIGZvciBub3cuXG4gICAgY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIEBBUFBfSUQsIChleHRJbmZvKSA9PlxuICAgICAgaWYgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICAgIGVycm9yIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxuICAgICAgZWxzZVxuICAgICAgICBjYj8gZXh0SW5mb1xuXG4gIG9wZW5BcHA6ICgpID0+XG4gICAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLFxuICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgYm91bmRzOlxuICAgICAgICAgIHdpZHRoOjc3MFxuICAgICAgICAgIGhlaWdodDo4MDAsXG4gICAgICAod2luKSA9PlxuICAgICAgICBAYXBwV2luZG93ID0gd2luKSBcblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIGdldFJlc291cmNlczogKGNiKSAtPlxuICAgIEBnZXRDdXJyZW50VGFiICh0YWJJZCkgPT5cbiAgICAgIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQgdGFiSWQsIFxuICAgICAgICBmaWxlOidzY3JpcHRzL2NvbnRlbnQuanMnLCAocmVzdWx0cykgPT5cbiAgICAgICAgICBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLmxlbmd0aCA9IDBcbiAgICAgICAgICBcbiAgICAgICAgICByZXR1cm4gY2I/KG51bGwsIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMpIGlmIG5vdCByZXN1bHRzP1xuXG4gICAgICAgICAgZm9yIHIgaW4gcmVzdWx0c1xuICAgICAgICAgICAgZm9yIHJlcyBpbiByXG4gICAgICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMucHVzaCByZXNcbiAgICAgICAgICBjYj8gbnVsbCwgQGRhdGEuY3VycmVudFJlc291cmNlc1xuXG5cbiAgZ2V0TG9jYWxGaWxlOiAoaW5mbywgY2IpID0+XG4gICAgZmlsZVBhdGggPSBpbmZvLnVyaVxuICAgIGp1c3RUaGVQYXRoID0gZmlsZVBhdGgubWF0Y2goL14oW14jP1xcc10rKT8oLio/KT8oI1tcXHdcXC1dKyk/JC8pXG4gICAgZmlsZVBhdGggPSBqdXN0VGhlUGF0aFsxXSBpZiBqdXN0VGhlUGF0aD9cbiAgICAjIGZpbGVQYXRoID0gQGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3QgdXJsXG4gICAgcmV0dXJuIGNiICdmaWxlIG5vdCBmb3VuZCcgdW5sZXNzIGZpbGVQYXRoP1xuICAgIF9kaXJzID0gW11cbiAgICBfZGlycy5wdXNoIGRpciBmb3IgZGlyIGluIEBkYXRhLmRpcmVjdG9yaWVzIHdoZW4gZGlyLmlzT25cbiAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnN1YnN0cmluZyAxIGlmIGZpbGVQYXRoLnN1YnN0cmluZygwLDEpIGlzICcvJ1xuICAgIEBmaW5kRmlsZUZvclBhdGggX2RpcnMsIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcikgPT5cbiAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gY2I/IGVyclxuICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgIGNiPyBudWxsLGZpbGVFbnRyeSxmaWxlXG4gICAgICAsKGVycikgPT4gY2I/IGVyclxuXG5cbiAgc3RhcnRTZXJ2ZXI6IChjYikgLT5cbiAgICBpZiBAU2VydmVyLnN0YXR1cy5pc09uIGlzIGZhbHNlXG4gICAgICBAU2VydmVyLnN0YXJ0IG51bGwsbnVsbCxudWxsLCAoZXJyLCBzb2NrZXRJbmZvKSA9PlxuICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIkVycm9yIFN0YXJ0aW5nIFNlcnZlcjogI3sgZXJyIH1cIlxuICAgICAgICAgICAgY2I/IGVyclxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgU3RhcnRlZFwiLCBcIlN0YXJ0ZWQgU2VydmVyICN7IEBTZXJ2ZXIuc3RhdHVzLnVybCB9XCJcbiAgICAgICAgICAgIGNiPyBudWxsLCBAU2VydmVyLnN0YXR1c1xuICAgIGVsc2VcbiAgICAgIGNiPyAnYWxyZWFkeSBzdGFydGVkJ1xuXG4gIHN0b3BTZXJ2ZXI6IChjYikgLT5cbiAgICAgIEBTZXJ2ZXIuc3RvcCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBFcnJvclwiLFwiU2VydmVyIGNvdWxkIG5vdCBiZSBzdG9wcGVkOiAjeyBlcnJvciB9XCJcbiAgICAgICAgICBjYj8gZXJyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBATm90aWZ5ICdTZXJ2ZXIgU3RvcHBlZCcsIFwiU2VydmVyIFN0b3BwZWRcIlxuICAgICAgICAgIGNiPyBudWxsLCBAU2VydmVyLnN0YXR1c1xuXG4gIHJlc3RhcnRTZXJ2ZXI6IC0+XG4gICAgQHN0YXJ0U2VydmVyKClcblxuICBjaGFuZ2VQb3J0OiA9PlxuICBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0OiAodXJsKSAtPlxuICAgIGZpbGVQYXRoUmVnZXggPSAvXigoaHR0cFtzXT98ZnRwfGNocm9tZS1leHRlbnNpb258ZmlsZSk6XFwvXFwvKT9cXC8/KFteXFwvXFwuXStcXC4pKj8oW15cXC9cXC5dK1xcLlteOlxcL1xcc1xcLl17MiwzfShcXC5bXjpcXC9cXHNcXC5d4oCM4oCLezIsM30pPykoOlxcZCspPygkfFxcLykoW14jP1xcc10rKT8oLio/KT8oI1tcXHdcXC1dKyk/JC9cbiAgIFxuICAgIHJldHVybiBudWxsIHVubGVzcyBAZGF0YVtAY3VycmVudFRhYklkXT8ubWFwcz9cblxuICAgIHJlc1BhdGggPSB1cmwubWF0Y2goZmlsZVBhdGhSZWdleCk/WzhdXG4gICAgaWYgbm90IHJlc1BhdGg/XG4gICAgICAjIHRyeSByZWxwYXRoXG4gICAgICByZXNQYXRoID0gdXJsXG5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmVzUGF0aD9cbiAgICBcbiAgICBmb3IgbWFwIGluIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHNcbiAgICAgIHJlc1BhdGggPSB1cmwubWF0Y2gobmV3IFJlZ0V4cChtYXAudXJsKSk/IGFuZCBtYXAudXJsP1xuXG4gICAgICBpZiByZXNQYXRoXG4gICAgICAgIGlmIHJlZmVyZXI/XG4gICAgICAgICAgIyBUT0RPOiB0aGlzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWFwLnVybCksIG1hcC5yZWdleFJlcGxcbiAgICAgICAgYnJlYWtcbiAgICByZXR1cm4gZmlsZVBhdGhcblxuICBVUkx0b0xvY2FsUGF0aDogKHVybCwgY2IpIC0+XG4gICAgZmlsZVBhdGggPSBAUmVkaXJlY3QuZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdCB1cmxcblxuICBnZXRGaWxlTWF0Y2g6IChmaWxlUGF0aCwgY2IpIC0+XG4gICAgcmV0dXJuIGNiPyAnZmlsZSBub3QgZm91bmQnIHVubGVzcyBmaWxlUGF0aD9cbiAgICBzaG93ICd0cnlpbmcgJyArIGZpbGVQYXRoXG4gICAgQGZpbmRGaWxlRm9yUGF0aCBAZGF0YS5kaXJlY3RvcmllcywgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyZWN0b3J5KSA9PlxuXG4gICAgICBpZiBlcnI/IFxuICAgICAgICAjIHNob3cgJ25vIGZpbGVzIGZvdW5kIGZvciAnICsgZmlsZVBhdGhcbiAgICAgICAgcmV0dXJuIGNiPyBlcnJcblxuICAgICAgZGVsZXRlIGZpbGVFbnRyeS5lbnRyeVxuICAgICAgQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzW2ZpbGVQYXRoXSA9IFxuICAgICAgICBmaWxlRW50cnk6IGNocm9tZS5maWxlU3lzdGVtLnJldGFpbkVudHJ5IGZpbGVFbnRyeVxuICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGhcbiAgICAgICAgZGlyZWN0b3J5OiBkaXJlY3RvcnlcbiAgICAgIGNiPyBudWxsLCBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdLCBkaXJlY3RvcnlcbiAgICAgIFxuXG5cbiAgZmluZEZpbGVJbkRpcmVjdG9yaWVzOiAoZGlyZWN0b3JpZXMsIHBhdGgsIGNiKSAtPlxuICAgIG15RGlycyA9IGRpcmVjdG9yaWVzLnNsaWNlKCkgXG4gICAgX3BhdGggPSBwYXRoXG4gICAgX2RpciA9IG15RGlycy5zaGlmdCgpXG5cbiAgICBARlMuZ2V0TG9jYWxGaWxlRW50cnkgX2RpciwgX3BhdGgsIChlcnIsIGZpbGVFbnRyeSkgPT5cbiAgICAgIGlmIGVycj9cbiAgICAgICAgaWYgbXlEaXJzLmxlbmd0aCA+IDBcbiAgICAgICAgICBAZmluZEZpbGVJbkRpcmVjdG9yaWVzIG15RGlycywgX3BhdGgsIGNiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjYj8gJ25vdCBmb3VuZCdcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgX2RpclxuXG4gIGZpbmRGaWxlRm9yUGF0aDogKGRpcnMsIHBhdGgsIGNiKSAtPlxuICAgIEBmaW5kRmlsZUluRGlyZWN0b3JpZXMgZGlycywgcGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXJlY3RvcnkpID0+XG4gICAgICBpZiBlcnI/XG4gICAgICAgIGlmIHBhdGggaXMgcGF0aC5yZXBsYWNlKC8uKj9cXC8vLCAnJylcbiAgICAgICAgICBjYj8gJ25vdCBmb3VuZCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggZGlycywgcGF0aC5yZXBsYWNlKC8uKj9cXC8vLCAnJyksIGNiXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGRpcmVjdG9yeVxuICBcbiAgbWFwQWxsUmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldFJlc291cmNlcyA9PlxuICAgICAgbmVlZCA9IEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMubGVuZ3RoXG4gICAgICBmb3VuZCA9IG5vdEZvdW5kID0gMFxuICAgICAgZm9yIGl0ZW0gaW4gQGRhdGEuY3VycmVudFJlc291cmNlc1xuICAgICAgICBsb2NhbFBhdGggPSBAVVJMdG9Mb2NhbFBhdGggaXRlbS51cmxcbiAgICAgICAgaWYgbG9jYWxQYXRoP1xuICAgICAgICAgIEBnZXRGaWxlTWF0Y2ggbG9jYWxQYXRoLCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgICAgICAgbmVlZC0tXG4gICAgICAgICAgICBzaG93IGFyZ3VtZW50c1xuICAgICAgICAgICAgaWYgZXJyPyB0aGVuIG5vdEZvdW5kKytcbiAgICAgICAgICAgIGVsc2UgZm91bmQrKyAgICAgICAgICAgIFxuXG4gICAgICAgICAgICBpZiBuZWVkIGlzIDBcbiAgICAgICAgICAgICAgaWYgZm91bmQgPiAwXG4gICAgICAgICAgICAgICAgY2I/IG51bGwsICdkb25lJ1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2I/ICdub3RoaW5nIGZvdW5kJ1xuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBuZWVkLS1cbiAgICAgICAgICBub3RGb3VuZCsrXG4gICAgICAgICAgaWYgbmVlZCBpcyAwXG4gICAgICAgICAgICBjYj8gJ25vdGhpbmcgZm91bmQnXG5cbiAgc2V0QmFkZ2VUZXh0OiAodGV4dCwgdGFiSWQpIC0+XG4gICAgYmFkZ2VUZXh0ID0gdGV4dCB8fCAnJyArIE9iamVjdC5rZXlzKEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlcykubGVuZ3RoXG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0IFxuICAgICAgdGV4dDpiYWRnZVRleHRcbiAgICAgICMgdGFiSWQ6dGFiSWRcbiAgXG4gIHJlbW92ZUJhZGdlVGV4dDoodGFiSWQpIC0+XG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0IFxuICAgICAgdGV4dDonJ1xuICAgICAgIyB0YWJJZDp0YWJJZFxuXG4gIGxzUjogKGRpciwgb25zdWNjZXNzLCBvbmVycm9yKSAtPlxuICAgIEByZXN1bHRzID0ge31cblxuICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgXG4gICAgICB0b2RvID0gMFxuICAgICAgaWdub3JlID0gLy5naXR8LmlkZWF8bm9kZV9tb2R1bGVzfGJvd2VyX2NvbXBvbmVudHMvXG4gICAgICBkaXZlID0gKGRpciwgcmVzdWx0cykgLT5cbiAgICAgICAgdG9kbysrXG4gICAgICAgIHJlYWRlciA9IGRpci5jcmVhdGVSZWFkZXIoKVxuICAgICAgICByZWFkZXIucmVhZEVudHJpZXMgKGVudHJpZXMpIC0+XG4gICAgICAgICAgdG9kby0tXG4gICAgICAgICAgZm9yIGVudHJ5IGluIGVudHJpZXNcbiAgICAgICAgICAgIGRvIChlbnRyeSkgLT5cbiAgICAgICAgICAgICAgcmVzdWx0c1tlbnRyeS5mdWxsUGF0aF0gPSBlbnRyeVxuICAgICAgICAgICAgICBpZiBlbnRyeS5mdWxsUGF0aC5tYXRjaChpZ25vcmUpIGlzIG51bGxcbiAgICAgICAgICAgICAgICBpZiBlbnRyeS5pc0RpcmVjdG9yeVxuICAgICAgICAgICAgICAgICAgdG9kbysrXG4gICAgICAgICAgICAgICAgICBkaXZlIGVudHJ5LCByZXN1bHRzIFxuICAgICAgICAgICAgICAjIHNob3cgZW50cnlcbiAgICAgICAgICBzaG93ICdvbnN1Y2Nlc3MnIGlmIHRvZG8gaXMgMFxuICAgICAgICAgICMgc2hvdyAnb25zdWNjZXNzJyByZXN1bHRzIGlmIHRvZG8gaXMgMFxuICAgICAgICAsKGVycm9yKSAtPlxuICAgICAgICAgIHRvZG8tLVxuICAgICAgICAgICMgc2hvdyBlcnJvclxuICAgICAgICAgICMgb25lcnJvciBlcnJvciwgcmVzdWx0cyBpZiB0b2RvIGlzIDAgXG5cbiAgICAgICMgY29uc29sZS5sb2cgZGl2ZSBkaXJFbnRyeSwgQHJlc3VsdHMgIFxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb25cblxuXG4iLCJjbGFzcyBDb25maWdcbiAgIyBBUFBfSUQ6ICdjZWNpZmFmcGhlZ2hvZnBmZGtoZWtraWJjaWJoZ2ZlYydcbiAgIyBFWFRFTlNJT05fSUQ6ICdkZGRpbWJuamliamNhZmJva25iZ2hlaGJmYWpnZ2dlcCdcbiAgQVBQX0lEOiAnZGVuZWZkb29mbmtnam1wYmZwa25paHBnZGhhaHBibGgnXG4gIEVYVEVOU0lPTl9JRDogJ2lqY2ptcGVqb25taW1vb2ZiY3BhbGllamhpa2Flb21oJyAgXG4gIFNFTEZfSUQ6IGNocm9tZS5ydW50aW1lLmlkXG4gIGlzQ29udGVudFNjcmlwdDogbG9jYXRpb24ucHJvdG9jb2wgaXNudCAnY2hyb21lLWV4dGVuc2lvbjonXG4gIEVYVF9JRDogbnVsbFxuICBFWFRfVFlQRTogbnVsbFxuICBcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQEVYVF9JRCA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiBARVhURU5TSU9OX0lEIGVsc2UgQEFQUF9JRFxuICAgIEBFWFRfVFlQRSA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG4gICAgQFNFTEZfVFlQRSA9IGlmIEBBUFBfSUQgaXNudCBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcblxuICB3cmFwSW5ib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgICBfa2xhcyA9IG9ialxuICAgICAgQExJU1RFTi5FeHQgZm5hbWUsIChhcmdzKSAtPlxuICAgICAgICBpZiBhcmdzPy5pc1Byb3h5P1xuICAgICAgICAgIGlmIHR5cGVvZiBhcmd1bWVudHNbMV0gaXMgXCJmdW5jdGlvblwiXG4gICAgICAgICAgICBpZiBhcmdzLmFyZ3VtZW50cz8ubGVuZ3RoID49IDBcbiAgICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIGFyZ3MuYXJndW1lbnRzLmNvbmNhdCBhcmd1bWVudHNbMV0gXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBbXS5jb25jYXQgYXJndW1lbnRzWzFdXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgYXJndW1lbnRzXG5cbiAgd3JhcE9iakluYm91bmQ6IChvYmopIC0+XG4gICAgKG9ialtrZXldID0gQHdyYXBJbmJvdW5kIG9iaiwgb2JqLmNvbnN0cnVjdG9yLm5hbWUgKyAnLicgKyBrZXksIG9ialtrZXldKSBmb3Iga2V5IG9mIG9iaiB3aGVuIHR5cGVvZiBvYmpba2V5XSBpcyBcImZ1bmN0aW9uXCJcbiAgICBvYmpcblxuICB3cmFwT3V0Ym91bmQ6IChvYmosIGZuYW1lLCBmKSAtPlxuICAgIC0+XG4gICAgICBtc2cgPSB7fVxuICAgICAgbXNnW2ZuYW1lXSA9IFxuICAgICAgICBpc1Byb3h5OnRydWVcbiAgICAgICAgYXJndW1lbnRzOkFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuICAgICAgbXNnW2ZuYW1lXS5pc1Byb3h5ID0gdHJ1ZVxuICAgICAgX2FyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcblxuICAgICAgaWYgX2FyZ3MubGVuZ3RoIGlzIDBcbiAgICAgICAgbXNnW2ZuYW1lXS5hcmd1bWVudHMgPSB1bmRlZmluZWQgXG4gICAgICAgIHJldHVybiBATVNHLkV4dCBtc2csICgpIC0+IHVuZGVmaW5lZFxuXG4gICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cyA9IF9hcmdzXG5cbiAgICAgIGNhbGxiYWNrID0gbXNnW2ZuYW1lXS5hcmd1bWVudHMucG9wKClcbiAgICAgIGlmIHR5cGVvZiBjYWxsYmFjayBpc250IFwiZnVuY3Rpb25cIlxuICAgICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cy5wdXNoIGNhbGxiYWNrXG4gICAgICAgIEBNU0cuRXh0IG1zZywgKCkgLT4gdW5kZWZpbmVkXG4gICAgICBlbHNlXG4gICAgICAgIEBNU0cuRXh0IG1zZywgKCkgPT5cbiAgICAgICAgICBhcmd6ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG4gICAgICAgICAgIyBwcm94eUFyZ3MgPSBbaXNQcm94eTphcmd6XVxuICAgICAgICAgIGlmIGFyZ3o/Lmxlbmd0aCA+IDAgYW5kIGFyZ3pbMF0/LmlzUHJveHk/XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseSBALCBhcmd6WzBdLmlzUHJveHkgXG5cbiAgd3JhcE9iak91dGJvdW5kOiAob2JqKSAtPlxuICAgIChvYmpba2V5XSA9IEB3cmFwT3V0Ym91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpZyIsImdldEdsb2JhbCA9IC0+XG4gIF9nZXRHbG9iYWwgPSAtPlxuICAgIHRoaXNcblxuICBfZ2V0R2xvYmFsKClcblxucm9vdCA9IGdldEdsb2JhbCgpXG5cbiMgcm9vdC5hcHAgPSBhcHAgPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuIyBhcHAgPSBuZXcgbGliLkFwcGxpY2F0aW9uXG5jaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRQb3B1cCBwb3B1cDpcInBvcHVwLmh0bWxcIlxuXG5cblxuQXBwbGljYXRpb24gPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuUmVkaXJlY3QgPSByZXF1aXJlICcuLi8uLi9yZWRpcmVjdC5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi4vLi4vc3RvcmFnZS5jb2ZmZWUnXG5GaWxlU3lzdGVtID0gcmVxdWlyZSAnLi4vLi4vZmlsZXN5c3RlbS5jb2ZmZWUnXG5TZXJ2ZXIgPSByZXF1aXJlICcuLi8uLi9zZXJ2ZXIuY29mZmVlJ1xuXG5yZWRpciA9IG5ldyBSZWRpcmVjdFxuXG5hcHAgPSByb290LmFwcCA9IG5ldyBBcHBsaWNhdGlvblxuICBSZWRpcmVjdDogcmVkaXJcbiAgU3RvcmFnZTogU3RvcmFnZVxuICBGUzogRmlsZVN5c3RlbVxuICBTZXJ2ZXI6IFNlcnZlclxuICBcbmFwcC5TdG9yYWdlLnJldHJpZXZlQWxsKG51bGwpXG4jICAgYXBwLlN0b3JhZ2UuZGF0YVtrXSA9IGRhdGFba10gZm9yIGsgb2YgZGF0YVxuICBcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lciAodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT5cbiAgIyBpZiByZWRpci5kYXRhW3RhYklkXT8uaXNPblxuICAjICAgYXBwLm1hcEFsbFJlc291cmNlcyAoKSA9PlxuICAjICAgICBjaHJvbWUudGFicy5zZXRCYWRnZVRleHQgXG4gICMgICAgICAgdGV4dDpPYmplY3Qua2V5cyhhcHAuY3VycmVudEZpbGVNYXRjaGVzKS5sZW5ndGhcbiAgIyAgICAgICB0YWJJZDp0YWJJZFxuICAgICBcblxuXG4iLCJMSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5cbmNsYXNzIEZpbGVTeXN0ZW1cbiAgYXBpOiBjaHJvbWUuZmlsZVN5c3RlbVxuICByZXRhaW5lZERpcnM6IHt9XG4gIExJU1RFTjogTElTVEVOLmdldCgpIFxuICBNU0c6IE1TRy5nZXQoKVxuICBwbGF0Zm9ybTonJ1xuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBjaHJvbWUucnVudGltZS5nZXRQbGF0Zm9ybUluZm8gKGluZm8pID0+XG4gICAgICBAcGxhdGZvcm0gPSBpbmZvXG4gICMgQGRpcnM6IG5ldyBEaXJlY3RvcnlTdG9yZVxuICAjIGZpbGVUb0FycmF5QnVmZmVyOiAoYmxvYiwgb25sb2FkLCBvbmVycm9yKSAtPlxuICAjICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAjICAgcmVhZGVyLm9ubG9hZCA9IG9ubG9hZFxuXG4gICMgICByZWFkZXIub25lcnJvciA9IG9uZXJyb3JcblxuICAjICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGJsb2JcblxuICByZWFkRmlsZTogKGRpckVudHJ5LCBwYXRoLCBjYikgLT5cbiAgICAjIHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcLy9nLCdcXFxcJykgaWYgcGxhdGZvcm0gaXMgJ3dpbidcbiAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBwYXRoLFxuICAgICAgKGVyciwgZmlsZUVudHJ5KSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgZXJyPyB0aGVuIHJldHVybiBjYj8gZXJyXG5cbiAgICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZmlsZVxuICAgICAgICAsKGVycikgPT4gY2I/IGVyclxuXG4gIGdldEZpbGVFbnRyeTogKGRpckVudHJ5LCBwYXRoLCBjYikgLT5cbiAgICAjIHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcLy9nLCdcXFxcJykgaWYgcGxhdGZvcm0gaXMgJ3dpbidcbiAgICBkaXJFbnRyeS5nZXRGaWxlIHBhdGgsIHt9LCAoZmlsZUVudHJ5KSA9PlxuICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeVxuICAgICwoZXJyKSA9PiBjYj8gZXJyXG5cbiAgIyBvcGVuRGlyZWN0b3J5OiAoY2FsbGJhY2spIC0+XG4gIG9wZW5EaXJlY3Rvcnk6IChkaXJlY3RvcnlFbnRyeSwgY2IpIC0+XG4gICMgQGFwaS5jaG9vc2VFbnRyeSB0eXBlOidvcGVuRGlyZWN0b3J5JywgKGRpcmVjdG9yeUVudHJ5LCBmaWxlcykgPT5cbiAgICBAYXBpLmdldERpc3BsYXlQYXRoIGRpcmVjdG9yeUVudHJ5LCAocGF0aE5hbWUpID0+XG4gICAgICBkaXIgPVxuICAgICAgICAgIHJlbFBhdGg6IGRpcmVjdG9yeUVudHJ5LmZ1bGxQYXRoICMucmVwbGFjZSgnLycgKyBkaXJlY3RvcnlFbnRyeS5uYW1lLCAnJylcbiAgICAgICAgICBkaXJlY3RvcnlFbnRyeUlkOiBAYXBpLnJldGFpbkVudHJ5KGRpcmVjdG9yeUVudHJ5KVxuICAgICAgICAgIGVudHJ5OiBkaXJlY3RvcnlFbnRyeVxuICAgICAgY2I/IG51bGwsIHBhdGhOYW1lLCBkaXJcbiAgICAgICAgICAjIEBnZXRPbmVEaXJMaXN0IGRpclxuICAgICAgICAgICMgU3RvcmFnZS5zYXZlICdkaXJlY3RvcmllcycsIEBzY29wZS5kaXJlY3RvcmllcyAocmVzdWx0KSAtPlxuXG4gIGdldExvY2FsRmlsZUVudHJ5OiAoZGlyLCBmaWxlUGF0aCwgY2IpID0+IFxuICAgICMgZmlsZVBhdGggPSBmaWxlUGF0aC5yZXBsYWNlKC9cXC8vZywnXFxcXCcpIGlmIHBsYXRmb3JtIGlzICd3aW4nXG4gICAgZGlyRW50cnkgPSBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsICgpIC0+XG4gICAgaWYgbm90IGRpckVudHJ5P1xuICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIGZpbGVQYXRoLCBjYlxuICAgIGVsc2VcbiAgICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIGZpbGVQYXRoLCBjYlxuXG5cblxuICAjIGdldExvY2FsRmlsZTogKGRpciwgZmlsZVBhdGgsIGNiLCBlcnJvcikgPT4gXG4gICMgIyBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgIyAjICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAjICMgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICMgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgIyAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgIyAgICAgLChfZXJyb3IpID0+IGVycm9yKF9lcnJvcilcbiAgIyAjIGVsc2VcbiAgIyAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAjICAgICAjIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiAgIyAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCwgKGVyciwgZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgIGlmIGVycj8gdGhlbiBjYj8gZXJyXG4gICMgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZmlsZVxuICAjICAgLChfZXJyb3IpID0+IGNiPyhfZXJyb3IpXG5cbiAgICAgICMgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIHN1Y2Nlc3MsXG4gICAgICAjICAgICAoZXJyKSA9PlxuICAgICAgIyAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggaW5mbywgY2JcblxuICAjIGZpbmRGaWxlRm9yUGF0aDogKGluZm8sIGNiKSA9PlxuICAjICAgICBAZmluZEZpbGVGb3JRdWVyeVN0cmluZyBpbmZvLnVyaSwgY2IsIGluZm8ucmVmZXJlclxuXG4gICMgZmluZEZpbGVGb3JRdWVyeVN0cmluZzogKF91cmwsIGNiLCBlcnJvciwgcmVmZXJlcikgPT5cbiAgIyAgICAgdXJsID0gZGVjb2RlVVJJQ29tcG9uZW50KF91cmwpLnJlcGxhY2UgLy4qP3NscmVkaXJcXD0vLCAnJ1xuXG4gICMgICAgIG1hdGNoID0gaXRlbSBmb3IgaXRlbSBpbiBAbWFwcyB3aGVuIHVybC5tYXRjaChuZXcgUmVnRXhwKGl0ZW0udXJsKSk/IGFuZCBpdGVtLnVybD8gYW5kIG5vdCBtYXRjaD9cblxuICAjICAgICBpZiBtYXRjaD9cbiAgIyAgICAgICAgIGlmIHJlZmVyZXI/XG4gICMgICAgICAgICAgICAgZmlsZVBhdGggPSB1cmwubWF0Y2goLy4qXFwvXFwvLio/XFwvKC4qKS8pP1sxXVxuICAjICAgICAgICAgZWxzZVxuICAjICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXRjaC51cmwpLCBtYXRjaC5yZWdleFJlcGxcblxuICAjICAgICAgICAgZmlsZVBhdGgucmVwbGFjZSAnLycsICdcXFxcJyBpZiBwbGF0Zm9ybSBpcyAnd2luJ1xuXG4gICMgICAgICAgICBkaXIgPSBAU3RvcmFnZS5kYXRhLmRpcmVjdG9yaWVzW21hdGNoLmRpcmVjdG9yeV1cblxuICAjICAgICAgICAgaWYgbm90IGRpcj8gdGhlbiByZXR1cm4gZXJyICdubyBtYXRjaCdcblxuICAjICAgICAgICAgaWYgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0/XG4gICMgICAgICAgICAgICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAjICAgICAgICAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgICAgICBlbHNlXG4gICMgICAgICAgICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICMgICAgICAgICAgICAgICAgIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiAgIyAgICAgICAgICAgICAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAgICAgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAgICAgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICBlbHNlXG4gICMgICAgICAgICBlcnJvcigpXG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVN5c3RlbSIsIkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcblxuY2xhc3MgTElTVEVOIGV4dGVuZHMgQ29uZmlnXG4gIGxvY2FsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlXG4gICAgbGlzdGVuZXJzOnt9XG4gICAgIyByZXNwb25zZUNhbGxlZDpmYWxzZVxuICBleHRlcm5hbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsXG4gICAgbGlzdGVuZXJzOnt9XG4gICAgIyByZXNwb25zZUNhbGxlZDpmYWxzZVxuICBpbnN0YW5jZSA9IG51bGxcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcblxuICAgIEBsb2NhbC5hcGkuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwuYXBpPy5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgQGdldDogKCkgLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgTElTVEVOXG5cbiAgc2V0UG9ydDogKHBvcnQpIC0+XG4gICAgQHBvcnQgPSBwb3J0XG4gICAgcG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gIExvY2FsOiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgQGxvY2FsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgRXh0OiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgIyBzaG93ICdhZGRpbmcgZXh0IGxpc3RlbmVyIGZvciAnICsgbWVzc2FnZVxuICAgIEBleHRlcm5hbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIF9vbk1lc3NhZ2VFeHRlcm5hbDogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHJlc3BvbnNlU3RhdHVzID0gY2FsbGVkOmZhbHNlXG5cbiAgICBfc2VuZFJlc3BvbnNlID0gKHdoYXRldmVyLi4uKSA9PlxuICAgICAgdHJ5XG4gICAgICAgICMgd2hhdGV2ZXIuc2hpZnQoKSBpZiB3aGF0ZXZlclswXSBpcyBudWxsIGFuZCB3aGF0ZXZlclsxXT9cbiAgICAgICAgc2VuZFJlc3BvbnNlLmFwcGx5IG51bGwscHJveHlBcmdzID0gW2lzUHJveHk6d2hhdGV2ZXJdXG5cbiAgICAgIGNhdGNoIGVcbiAgICAgICAgdW5kZWZpbmVkICMgZXJyb3IgYmVjYXVzZSBubyByZXNwb25zZSB3YXMgcmVxdWVzdGVkIGZyb20gdGhlIE1TRywgZG9uJ3QgY2FyZVxuICAgICAgcmVzcG9uc2VTdGF0dXMuY2FsbGVkID0gdHJ1ZVxuICAgICAgXG4gICAgIyAoc2hvdyBcIjw9PSBHT1QgRVhURVJOQUwgTUVTU0FHRSA9PSAjeyBARVhUX1RZUEUgfSA9PVwiICsgX2tleSkgZm9yIF9rZXkgb2YgcmVxdWVzdFxuICAgIGlmIHNlbmRlci5pZD8gXG4gICAgICBpZiBzZW5kZXIuaWQgaXNudCBARVhUX0lEICNhbmQgc2VuZGVyLmNvbnN0cnVjdG9yLm5hbWUgaXNudCAnUG9ydCdcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgX3NlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcbiAgICBcbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkICMgZm9yIHN5bmNocm9ub3VzIHNlbmRSZXNwb25zZVxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgX29uTWVzc2FnZTogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHJlc3BvbnNlU3RhdHVzID0gY2FsbGVkOmZhbHNlXG4gICAgX3NlbmRSZXNwb25zZSA9ID0+XG4gICAgICB0cnlcbiAgICAgICAgIyBzaG93ICdjYWxsaW5nIHNlbmRyZXNwb25zZSdcbiAgICAgICAgc2VuZFJlc3BvbnNlLmFwcGx5IHRoaXMsYXJndW1lbnRzXG4gICAgICBjYXRjaCBlXG4gICAgICAgICMgc2hvdyBlXG4gICAgICByZXNwb25zZVN0YXR1cy5jYWxsZWQgPSB0cnVlXG5cbiAgICAjIChzaG93IFwiPD09IEdPVCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgQGxvY2FsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG5cbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkXG4gICAgICAjIHNob3cgJ3JldHVybmluZyB0cnVlJ1xuICAgICAgcmV0dXJuIHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBMSVNURU4iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIE1TRyBleHRlbmRzIENvbmZpZ1xuICBpbnN0YW5jZSA9IG51bGxcbiAgcG9ydDpudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG5cbiAgQGdldDogKCkgLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgTVNHXG5cbiAgQGNyZWF0ZVBvcnQ6ICgpIC0+XG5cbiAgc2V0UG9ydDogKHBvcnQpIC0+XG4gICAgQHBvcnQgPSBwb3J0XG5cbiAgTG9jYWw6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIChzaG93IFwiPT0gTUVTU0FHRSAjeyBfa2V5IH0gPT0+XCIpIGZvciBfa2V5IG9mIG1lc3NhZ2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBtZXNzYWdlLCByZXNwb25kXG4gIEV4dDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFIEVYVEVSTkFMICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIEBFWFRfSUQsIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0UG9ydDogKG1lc3NhZ2UpIC0+XG4gICAgdHJ5XG4gICAgICBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG4gICAgY2F0Y2hcbiAgICAgIHNob3cgJ2Vycm9yJ1xuICAgICAgIyBAcG9ydCA9IGNocm9tZS5ydW50aW1lLmNvbm5lY3QgQEVYVF9JRCBcbiAgICAgICMgQHBvcnQucG9zdE1lc3NhZ2UgbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1TRyIsIi8qKlxuICogREVWRUxPUEVEIEJZXG4gKiBHSUwgTE9QRVMgQlVFTk9cbiAqIGdpbGJ1ZW5vLm1haWxAZ21haWwuY29tXG4gKlxuICogV09SS1MgV0lUSDpcbiAqIElFIDkrLCBGRiA0KywgU0YgNSssIFdlYktpdCwgQ0ggNyssIE9QIDEyKywgQkVTRU4sIFJoaW5vIDEuNytcbiAqXG4gKiBGT1JLOlxuICogaHR0cHM6Ly9naXRodWIuY29tL21lbGFua2UvV2F0Y2guSlNcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgICAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgICAgICAvLyBsaWtlIE5vZGUuXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgICAgICB3aW5kb3cuV2F0Y2hKUyA9IGZhY3RvcnkoKTtcbiAgICAgICAgd2luZG93LndhdGNoID0gd2luZG93LldhdGNoSlMud2F0Y2g7XG4gICAgICAgIHdpbmRvdy51bndhdGNoID0gd2luZG93LldhdGNoSlMudW53YXRjaDtcbiAgICAgICAgd2luZG93LmNhbGxXYXRjaGVycyA9IHdpbmRvdy5XYXRjaEpTLmNhbGxXYXRjaGVycztcbiAgICB9XG59KGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBXYXRjaEpTID0ge1xuICAgICAgICBub01vcmU6IGZhbHNlXG4gICAgfSxcbiAgICBsZW5ndGhzdWJqZWN0cyA9IFtdO1xuXG4gICAgdmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiAoZnVuY3Rpb25Ub0NoZWNrKSB7XG4gICAgICAgICAgICB2YXIgZ2V0VHlwZSA9IHt9O1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uVG9DaGVjayAmJiBnZXRUeXBlLnRvU3RyaW5nLmNhbGwoZnVuY3Rpb25Ub0NoZWNrKSA9PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH07XG5cbiAgICB2YXIgaXNJbnQgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4geCAlIDEgPT09IDA7XG4gICAgfTtcblxuICAgIHZhciBpc0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgdmFyIGdldE9iakRpZmYgPSBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgdmFyIGFwbHVzID0gW10sXG4gICAgICAgIGJwbHVzID0gW107XG5cbiAgICAgICAgaWYoISh0eXBlb2YgYSA9PSBcInN0cmluZ1wiKSAmJiAhKHR5cGVvZiBiID09IFwic3RyaW5nXCIpKXtcblxuICAgICAgICAgICAgaWYgKGlzQXJyYXkoYSkpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYltpXSA9PT0gdW5kZWZpbmVkKSBhcGx1cy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGEpe1xuICAgICAgICAgICAgICAgICAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYltpXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBsdXMucHVzaChpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzQXJyYXkoYikpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqPTA7IGo8Yi5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYVtqXSA9PT0gdW5kZWZpbmVkKSBicGx1cy5wdXNoKGopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBqIGluIGIpe1xuICAgICAgICAgICAgICAgICAgICBpZiAoYi5oYXNPd25Qcm9wZXJ0eShqKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYVtqXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnBsdXMucHVzaChqKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhZGRlZDogYXBsdXMsXG4gICAgICAgICAgICByZW1vdmVkOiBicGx1c1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBjbG9uZSA9IGZ1bmN0aW9uKG9iail7XG5cbiAgICAgICAgaWYgKG51bGwgPT0gb2JqIHx8IFwib2JqZWN0XCIgIT0gdHlwZW9mIG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb3B5ID0gb2JqLmNvbnN0cnVjdG9yKCk7XG5cbiAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBvYmopIHtcbiAgICAgICAgICAgIGNvcHlbYXR0cl0gPSBvYmpbYXR0cl07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29weTtcblxuICAgIH1cblxuICAgIHZhciBkZWZpbmVHZXRBbmRTZXQgPSBmdW5jdGlvbiAob2JqLCBwcm9wTmFtZSwgZ2V0dGVyLCBzZXR0ZXIpIHtcbiAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgT2JqZWN0Lm9ic2VydmUob2JqW3Byb3BOYW1lXSwgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgc2V0dGVyKGRhdGEpOyAvL1RPRE86IGFkYXB0IG91ciBjYWxsYmFjayBkYXRhIHRvIG1hdGNoIE9iamVjdC5vYnNlcnZlIGRhdGEgc3BlY1xuICAgICAgICAgICAgfSk7IFxuXG4gICAgICAgIH0gY2F0Y2goZSkge1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wTmFtZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldDogZ2V0dGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldDogc2V0dGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaChlMikge1xuICAgICAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5fX2RlZmluZUdldHRlcl9fLmNhbGwob2JqLCBwcm9wTmFtZSwgZ2V0dGVyKTtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5fX2RlZmluZVNldHRlcl9fLmNhbGwob2JqLCBwcm9wTmFtZSwgc2V0dGVyKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoKGUzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIndhdGNoSlMgZXJyb3I6IGJyb3dzZXIgbm90IHN1cHBvcnRlZCA6L1wiKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBkZWZpbmVQcm9wID0gZnVuY3Rpb24gKG9iaiwgcHJvcE5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wTmFtZSwge1xuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgb2JqW3Byb3BOYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciB3YXRjaCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbihhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB3YXRjaEFsbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoYXJndW1lbnRzWzFdKSkge1xuICAgICAgICAgICAgd2F0Y2hNYW55LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3YXRjaE9uZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG5cbiAgICB2YXIgd2F0Y2hBbGwgPSBmdW5jdGlvbiAob2JqLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCkge1xuXG4gICAgICAgIGlmICgodHlwZW9mIG9iaiA9PSBcInN0cmluZ1wiKSB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByb3BzID0gW107XG5cblxuICAgICAgICBpZihpc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgPSAwOyBwcm9wIDwgb2JqLmxlbmd0aDsgcHJvcCsrKSB7IC8vZm9yIGVhY2ggaXRlbSBpZiBvYmogaXMgYW4gYXJyYXlcbiAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3ApOyAvL3B1dCBpbiB0aGUgcHJvcHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AyIGluIG9iaikgeyAvL2ZvciBlYWNoIGF0dHJpYnV0ZSBpZiBvYmogaXMgYW4gb2JqZWN0XG4gICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wMik7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHdhdGNoTWFueShvYmosIHByb3BzLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCk7IC8vd2F0Y2ggYWxsIGl0ZW1zIG9mIHRoZSBwcm9wc1xuXG4gICAgICAgIGlmIChhZGROUmVtb3ZlKSB7XG4gICAgICAgICAgICBwdXNoVG9MZW5ndGhTdWJqZWN0cyhvYmosIFwiJCR3YXRjaGxlbmd0aHN1YmplY3Ryb290XCIsIHdhdGNoZXIsIGxldmVsKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIHZhciB3YXRjaE1hbnkgPSBmdW5jdGlvbiAob2JqLCBwcm9wcywgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpIHtcblxuICAgICAgICBpZiAoKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxwcm9wcy5sZW5ndGg7IGkrKykgeyAvL3dhdGNoIGVhY2ggcHJvcGVydHlcbiAgICAgICAgICAgIHZhciBwcm9wID0gcHJvcHNbaV07XG4gICAgICAgICAgICB3YXRjaE9uZShvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB3YXRjaE9uZSA9IGZ1bmN0aW9uIChvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKSB7XG5cbiAgICAgICAgaWYgKCh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZihpc0Z1bmN0aW9uKG9ialtwcm9wXSkpIHsgLy9kb250IHdhdGNoIGlmIGl0IGlzIGEgZnVuY3Rpb25cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKG9ialtwcm9wXSAhPSBudWxsICYmIChsZXZlbCA9PT0gdW5kZWZpbmVkIHx8IGxldmVsID4gMCkpe1xuICAgICAgICAgICAgd2F0Y2hBbGwob2JqW3Byb3BdLCB3YXRjaGVyLCBsZXZlbCE9PXVuZGVmaW5lZD8gbGV2ZWwtMSA6IGxldmVsLG51bGwsIHBhdGggKyAnLicgKyBwcm9wKTsgLy9yZWN1cnNpdmVseSB3YXRjaCBhbGwgYXR0cmlidXRlcyBvZiB0aGlzXG4gICAgICAgIH1cblxuICAgICAgICBkZWZpbmVXYXRjaGVyKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIHBhdGgpO1xuXG4gICAgICAgIGlmKGFkZE5SZW1vdmUgJiYgKGxldmVsID09PSB1bmRlZmluZWQgfHwgbGV2ZWwgPiAwKSl7XG4gICAgICAgICAgICBwdXNoVG9MZW5ndGhTdWJqZWN0cyhvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB1bndhdGNoID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHVud2F0Y2hBbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHVud2F0Y2hNYW55LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1bndhdGNoT25lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgdW53YXRjaEFsbCA9IGZ1bmN0aW9uIChvYmosIHdhdGNoZXIpIHtcblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgU3RyaW5nIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgPSAwOyBwcm9wIDwgb2JqLmxlbmd0aDsgcHJvcCsrKSB7IC8vZm9yIGVhY2ggaXRlbSBpZiBvYmogaXMgYW4gYXJyYXlcbiAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3ApOyAvL3B1dCBpbiB0aGUgcHJvcHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVud2F0Y2hNYW55KG9iaiwgcHJvcHMsIHdhdGNoZXIpOyAvL3dhdGNoIGFsbCBpdGVucyBvZiB0aGUgcHJvcHNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB1bndhdGNoUHJvcHNJbk9iamVjdCA9IGZ1bmN0aW9uIChvYmoyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb3BzID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcDIgaW4gb2JqMikgeyAvL2ZvciBlYWNoIGF0dHJpYnV0ZSBpZiBvYmogaXMgYW4gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmoyLmhhc093blByb3BlcnR5KHByb3AyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9iajJbcHJvcDJdIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW53YXRjaFByb3BzSW5PYmplY3Qob2JqMltwcm9wMl0pOyAvL3JlY3VycyBpbnRvIG9iamVjdCBwcm9wc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3AyKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdW53YXRjaE1hbnkob2JqMiwgcHJvcHMsIHdhdGNoZXIpOyAvL3Vud2F0Y2ggYWxsIG9mIHRoZSBwcm9wc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHVud2F0Y2hQcm9wc0luT2JqZWN0KG9iaik7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICB2YXIgdW53YXRjaE1hbnkgPSBmdW5jdGlvbiAob2JqLCBwcm9wcywgd2F0Y2hlcikge1xuXG4gICAgICAgIGZvciAodmFyIHByb3AyIGluIHByb3BzKSB7IC8vd2F0Y2ggZWFjaCBhdHRyaWJ1dGUgb2YgXCJwcm9wc1wiIGlmIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHByb3AyKSkge1xuICAgICAgICAgICAgICAgIHVud2F0Y2hPbmUob2JqLCBwcm9wc1twcm9wMl0sIHdhdGNoZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBkZWZpbmVXYXRjaGVyID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIHBhdGgpIHtcblxuICAgICAgICB2YXIgdmFsID0gb2JqW3Byb3BdO1xuXG4gICAgICAgIHdhdGNoRnVuY3Rpb25zKG9iaiwgcHJvcCk7XG5cbiAgICAgICAgaWYgKCFvYmoud2F0Y2hlcnMpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3Aob2JqLCBcIndhdGNoZXJzXCIsIHt9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCFvYmouX3BhdGgpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3Aob2JqLCBcIl9wYXRoXCIsIHBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFvYmoud2F0Y2hlcnNbcHJvcF0pIHtcbiAgICAgICAgICAgIG9iai53YXRjaGVyc1twcm9wXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPG9iai53YXRjaGVyc1twcm9wXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYob2JqLndhdGNoZXJzW3Byb3BdW2ldID09PSB3YXRjaGVyKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIG9iai53YXRjaGVyc1twcm9wXS5wdXNoKHdhdGNoZXIpOyAvL2FkZCB0aGUgbmV3IHdhdGNoZXIgaW4gdGhlIHdhdGNoZXJzIGFycmF5XG5cblxuICAgICAgICB2YXIgZ2V0dGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIHZhciBzZXR0ZXIgPSBmdW5jdGlvbiAobmV3dmFsKSB7XG4gICAgICAgICAgICB2YXIgb2xkdmFsID0gdmFsO1xuICAgICAgICAgICAgdmFsID0gbmV3dmFsO1xuXG4gICAgICAgICAgICBpZiAobGV2ZWwgIT09IDAgJiYgb2JqW3Byb3BdKXtcbiAgICAgICAgICAgICAgICAvLyB3YXRjaCBzdWIgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgIHdhdGNoQWxsKG9ialtwcm9wXSwgd2F0Y2hlciwgKGxldmVsPT09dW5kZWZpbmVkKT9sZXZlbDpsZXZlbC0xKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2F0Y2hGdW5jdGlvbnMob2JqLCBwcm9wKTtcblxuICAgICAgICAgICAgaWYgKCFXYXRjaEpTLm5vTW9yZSl7XG4gICAgICAgICAgICAgICAgLy9pZiAoSlNPTi5zdHJpbmdpZnkob2xkdmFsKSAhPT0gSlNPTi5zdHJpbmdpZnkobmV3dmFsKSkge1xuICAgICAgICAgICAgICAgIGlmIChvbGR2YWwgIT09IG5ld3ZhbCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBcInNldFwiLCBuZXd2YWwsIG9sZHZhbCk7XG4gICAgICAgICAgICAgICAgICAgIFdhdGNoSlMubm9Nb3JlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGRlZmluZUdldEFuZFNldChvYmosIHByb3AsIGdldHRlciwgc2V0dGVyKTtcblxuICAgIH07XG5cbiAgICB2YXIgY2FsbFdhdGNoZXJzID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgYWN0aW9uLCBuZXd2YWwsIG9sZHZhbCkge1xuICAgICAgICBpZiAocHJvcCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB3cj0wOyB3cjxvYmoud2F0Y2hlcnNbcHJvcF0ubGVuZ3RoOyB3cisrKSB7XG4gICAgICAgICAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdW3dyXS5jYWxsKG9iaiwgcHJvcCwgYWN0aW9uLCBuZXd2YWwsIG9sZHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIG9iaikgey8vY2FsbCBhbGxcbiAgICAgICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxXYXRjaGVycyhvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBAdG9kbyBjb2RlIHJlbGF0ZWQgdG8gXCJ3YXRjaEZ1bmN0aW9uc1wiIGlzIGNlcnRhaW5seSBidWdneVxuICAgIHZhciBtZXRob2ROYW1lcyA9IFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NsaWNlJywgJ3Vuc2hpZnQnLCAnc3BsaWNlJ107XG4gICAgdmFyIGRlZmluZUFycmF5TWV0aG9kV2F0Y2hlciA9IGZ1bmN0aW9uIChvYmosIHByb3AsIG9yaWdpbmFsLCBtZXRob2ROYW1lKSB7XG4gICAgICAgIGRlZmluZVByb3Aob2JqW3Byb3BdLCBtZXRob2ROYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBvcmlnaW5hbC5hcHBseShvYmpbcHJvcF0sIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB3YXRjaE9uZShvYmosIG9ialtwcm9wXSk7XG4gICAgICAgICAgICBpZiAobWV0aG9kTmFtZSAhPT0gJ3NsaWNlJykge1xuICAgICAgICAgICAgICAgIGNhbGxXYXRjaGVycyhvYmosIHByb3AsIG1ldGhvZE5hbWUsYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciB3YXRjaEZ1bmN0aW9ucyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkge1xuXG4gICAgICAgIGlmICgoIW9ialtwcm9wXSkgfHwgKG9ialtwcm9wXSBpbnN0YW5jZW9mIFN0cmluZykgfHwgKCFpc0FycmF5KG9ialtwcm9wXSkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gbWV0aG9kTmFtZXMubGVuZ3RoLCBtZXRob2ROYW1lOyBpLS07KSB7XG4gICAgICAgICAgICBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICAgICAgICBkZWZpbmVBcnJheU1ldGhvZFdhdGNoZXIob2JqLCBwcm9wLCBvYmpbcHJvcF1bbWV0aG9kTmFtZV0sIG1ldGhvZE5hbWUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHVud2F0Y2hPbmUgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCB3YXRjaGVyKSB7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxvYmoud2F0Y2hlcnNbcHJvcF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB3ID0gb2JqLndhdGNoZXJzW3Byb3BdW2ldO1xuXG4gICAgICAgICAgICBpZih3ID09IHdhdGNoZXIpIHtcbiAgICAgICAgICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0uc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVtb3ZlRnJvbUxlbmd0aFN1YmplY3RzKG9iaiwgcHJvcCwgd2F0Y2hlcik7XG4gICAgfTtcblxuICAgIHZhciBsb29wID0gZnVuY3Rpb24oKXtcblxuICAgICAgICBmb3IodmFyIGk9MDsgaTxsZW5ndGhzdWJqZWN0cy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICB2YXIgc3ViaiA9IGxlbmd0aHN1YmplY3RzW2ldO1xuXG4gICAgICAgICAgICBpZiAoc3Viai5wcm9wID09PSBcIiQkd2F0Y2hsZW5ndGhzdWJqZWN0cm9vdFwiKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlmZmVyZW5jZSA9IGdldE9iakRpZmYoc3Viai5vYmosIHN1YmouYWN0dWFsKTtcblxuICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQubGVuZ3RoIHx8IGRpZmZlcmVuY2UucmVtb3ZlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkICE9IGRpZmZlcmVuY2UucmVtb3ZlZCAmJiAoZGlmZmVyZW5jZS5hZGRlZFswXSAhPSBkaWZmZXJlbmNlLnJlbW92ZWRbMF0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hNYW55KHN1Ymoub2JqLCBkaWZmZXJlbmNlLmFkZGVkLCBzdWJqLndhdGNoZXIsIHN1YmoubGV2ZWwgLSAxLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgc3Viai53YXRjaGVyLmNhbGwoc3Viai5vYmosIFwicm9vdFwiLCBcImRpZmZlcmVudGF0dHJcIiwgZGlmZmVyZW5jZSwgc3Viai5hY3R1YWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN1YmouYWN0dWFsID0gY2xvbmUoc3Viai5vYmopO1xuXG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYoc3Viai5vYmpbc3Viai5wcm9wXSA9PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdmFyIGRpZmZlcmVuY2UgPSBnZXRPYmpEaWZmKHN1Ymoub2JqW3N1YmoucHJvcF0sIHN1YmouYWN0dWFsKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQubGVuZ3RoIHx8IGRpZmZlcmVuY2UucmVtb3ZlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqPTA7IGo8c3Viai5vYmoud2F0Y2hlcnNbc3Viai5wcm9wXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoTWFueShzdWJqLm9ialtzdWJqLnByb3BdLCBkaWZmZXJlbmNlLmFkZGVkLCBzdWJqLm9iai53YXRjaGVyc1tzdWJqLnByb3BdW2pdLCBzdWJqLmxldmVsIC0gMSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMoc3Viai5vYmosIHN1YmoucHJvcCwgXCJkaWZmZXJlbnRhdHRyXCIsIGRpZmZlcmVuY2UsIHN1YmouYWN0dWFsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdWJqLmFjdHVhbCA9IGNsb25lKHN1Ymoub2JqW3N1YmoucHJvcF0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciBwdXNoVG9MZW5ndGhTdWJqZWN0cyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwpe1xuICAgICAgICBcbiAgICAgICAgdmFyIGFjdHVhbDtcblxuICAgICAgICBpZiAocHJvcCA9PT0gXCIkJHdhdGNobGVuZ3Roc3ViamVjdHJvb3RcIikge1xuICAgICAgICAgICAgYWN0dWFsID0gIGNsb25lKG9iaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY3R1YWwgPSBjbG9uZShvYmpbcHJvcF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGVuZ3Roc3ViamVjdHMucHVzaCh7XG4gICAgICAgICAgICBvYmo6IG9iaixcbiAgICAgICAgICAgIHByb3A6IHByb3AsXG4gICAgICAgICAgICBhY3R1YWw6IGFjdHVhbCxcbiAgICAgICAgICAgIHdhdGNoZXI6IHdhdGNoZXIsXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciByZW1vdmVGcm9tTGVuZ3RoU3ViamVjdHMgPSBmdW5jdGlvbihvYmosIHByb3AsIHdhdGNoZXIpe1xuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxsZW5ndGhzdWJqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHN1YmogPSBsZW5ndGhzdWJqZWN0c1tpXTtcblxuICAgICAgICAgICAgaWYgKHN1Ymoub2JqID09IG9iaiAmJiBzdWJqLnByb3AgPT0gcHJvcCAmJiBzdWJqLndhdGNoZXIgPT0gd2F0Y2hlcikge1xuICAgICAgICAgICAgICAgIGxlbmd0aHN1YmplY3RzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHNldEludGVydmFsKGxvb3AsIDUwKTtcblxuICAgIFdhdGNoSlMud2F0Y2ggPSB3YXRjaDtcbiAgICBXYXRjaEpTLnVud2F0Y2ggPSB1bndhdGNoO1xuICAgIFdhdGNoSlMuY2FsbFdhdGNoZXJzID0gY2FsbFdhdGNoZXJzO1xuXG4gICAgcmV0dXJuIFdhdGNoSlM7XG5cbn0pKTtcbiIsImNsYXNzIE5vdGlmaWNhdGlvblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICBzaG93OiAodGl0bGUsIG1lc3NhZ2UpIC0+XG4gICAgdW5pcXVlSWQgPSAobGVuZ3RoPTgpIC0+XG4gICAgICBpZCA9IFwiXCJcbiAgICAgIGlkICs9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKSB3aGlsZSBpZC5sZW5ndGggPCBsZW5ndGhcbiAgICAgIGlkLnN1YnN0ciAwLCBsZW5ndGhcblxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSB1bmlxdWVJZCgpLFxuICAgICAgdHlwZTonYmFzaWMnXG4gICAgICB0aXRsZTp0aXRsZVxuICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgICAgaWNvblVybDonaW1hZ2VzL2ljb24tMzgucG5nJyxcbiAgICAgIChjYWxsYmFjaykgLT5cbiAgICAgICAgdW5kZWZpbmVkXG5cbm1vZHVsZS5leHBvcnRzID0gTm90aWZpY2F0aW9uIiwiY2xhc3MgUmVkaXJlY3RcbiAgZGF0YTp7fVxuICBcbiAgcHJlZml4Om51bGxcbiAgY3VycmVudE1hdGNoZXM6e31cbiAgY3VycmVudFRhYklkOiBudWxsXG4gICMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjc3NTVcbiAgIyB1cmw6IFJlZ0V4cFsnJCYnXSxcbiAgIyBwcm90b2NvbDpSZWdFeHAuJDIsXG4gICMgaG9zdDpSZWdFeHAuJDMsXG4gICMgcGF0aDpSZWdFeHAuJDQsXG4gICMgZmlsZTpSZWdFeHAuJDYsIC8vIDhcbiAgIyBxdWVyeTpSZWdFeHAuJDcsXG4gICMgaGFzaDpSZWdFeHAuJDhcbiAgICAgICAgIFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgXG4gIGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3Q6ICh1cmwpID0+XG4gICAgZmlsZVBhdGhSZWdleCA9IC9eKChodHRwW3NdP3xmdHB8Y2hyb21lLWV4dGVuc2lvbnxmaWxlKTpcXC9cXC8pP1xcLz8oW15cXC9cXC5dK1xcLikqPyhbXlxcL1xcLl0rXFwuW146XFwvXFxzXFwuXXsyLDN9KFxcLlteOlxcL1xcc1xcLl3igIzigIt7MiwzfSk/KSg6XFxkKyk/KCR8XFwvKShbXiM/XFxzXSspPyguKj8pPygjW1xcd1xcLV0rKT8kL1xuICAgXG4gICAgX21hcHMgPSBbXVxuICAgIGlmIEBkYXRhW0BjdXJyZW50VGFiSWRdP1xuICAgICAgX21hcHMucHVzaCBtYXAgZm9yIG1hcCBpbiBAZGF0YVtAY3VycmVudFRhYklkXS5tYXBzIHdoZW4gbWFwLmlzT25cbiAgICBcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgX21hcHMubGVuZ3RoID4gMFxuXG4gICAgcmVzUGF0aCA9IHVybC5tYXRjaChmaWxlUGF0aFJlZ2V4KT9bOF1cbiAgICBpZiBub3QgcmVzUGF0aD9cbiAgICAgICMgdHJ5IHJlbHBhdGhcbiAgICAgIHJlc1BhdGggPSB1cmxcblxuICAgIHJldHVybiBudWxsIHVubGVzcyByZXNQYXRoP1xuICAgIFxuICAgIGZvciBtYXAgaW4gX21hcHNcbiAgICAgIHJlc1BhdGggPSB1cmwubWF0Y2gobmV3IFJlZ0V4cChtYXAudXJsKSk/IGFuZCBtYXAudXJsP1xuXG4gICAgICBpZiByZXNQYXRoXG4gICAgICAgIGlmIHJlZmVyZXI/XG4gICAgICAgICAgIyBUT0RPOiB0aGlzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWFwLnVybCksIG1hcC5yZWdleFJlcGxcbiAgICAgICAgYnJlYWtcbiAgICByZXR1cm4gZmlsZVBhdGhcblxuICB0YWI6ICh0YWJJZCkgLT5cbiAgICBAY3VycmVudFRhYklkID0gdGFiSWRcbiAgICBAZGF0YVt0YWJJZF0gPz0gaXNPbjpmYWxzZVxuICAgIHRoaXNcblxuICB3aXRoUHJlZml4OiAocHJlZml4KSA9PlxuICAgIEBwcmVmaXggPSBwcmVmaXhcbiAgICB0aGlzXG5cbiAgIyB3aXRoRGlyZWN0b3JpZXM6IChkaXJlY3RvcmllcykgLT5cbiAgIyAgIGlmIGRpcmVjdG9yaWVzPy5sZW5ndGggaXMgMFxuICAjICAgICBAZGF0YVtAY3VycmVudFRhYklkXS5kaXJlY3RvcmllcyA9IFtdIFxuICAjICAgICBAX3N0b3AgQGN1cnJlbnRUYWJJZFxuICAjICAgZWxzZSAjaWYgT2JqZWN0LmtleXMoQGRhdGFbQGN1cnJlbnRUYWJJZF0pLmxlbmd0aCBpcyAwXG4gICMgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLmRpcmVjdG9yaWVzID0gZGlyZWN0b3JpZXNcbiAgIyAgICAgQHN0YXJ0KClcbiAgIyAgIHRoaXMgICAgXG5cbiAgd2l0aE1hcHM6IChtYXBzKSAtPlxuICAgIGlmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG1hcHMpLmxlbmd0aCBpcyAwXG4gICAgICBAZGF0YVtAY3VycmVudFRhYklkXS5tYXBzID0gW11cbiAgICAgIEBfc3RvcCBAY3VycmVudFRhYklkXG4gICAgZWxzZSAjaWYgT2JqZWN0LmtleXMoQGRhdGFbQGN1cnJlbnRUYWJJZF0pLmxlbmd0aCBpcyAwXG4gICAgICBAZGF0YVtAY3VycmVudFRhYklkXS5tYXBzID0gbWFwc1xuICAgIHRoaXNcblxuICBzdGFydDogLT5cbiAgICB1bmxlc3MgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubGlzdGVuZXJcbiAgICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5yZW1vdmVMaXN0ZW5lciBAZGF0YVtAY3VycmVudFRhYklkXS5saXN0ZW5lclxuXG4gICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubGlzdGVuZXIgPSBAY3JlYXRlUmVkaXJlY3RMaXN0ZW5lcigpXG4gICAgIyBAZGF0YVtAY3VycmVudFRhYklkXS5vbkJlZm9yZVNlbmRIZWFkZXJzTGlzdGVuZXIgPSBAY3JlYXRlT25CZWZvcmVTZW5kSGVhZGVyc0xpc3RlbmVyKClcbiAgICBAZGF0YVtAY3VycmVudFRhYklkXS5vbkhlYWRlcnNSZWNlaXZlZExpc3RlbmVyID0gQGNyZWF0ZU9uSGVhZGVyc1JlY2VpdmVkTGlzdGVuZXIoKVxuICAgICMgQGRhdGFbQGN1cnJlbnRUYWJJZF0uaXNPbiA9IHRydWVcbiAgICBAX3N0YXJ0IEBjdXJyZW50VGFiSWRcblxuICBraWxsQWxsOiAoKSAtPlxuICAgIEBfc3RvcCB0YWJJZCBmb3IgdGFiSWQgb2YgQGRhdGFcblxuICBfc3RvcDogKHRhYklkKSAtPlxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5yZW1vdmVMaXN0ZW5lciBAZGF0YVt0YWJJZF0ubGlzdGVuZXJcbiAgICAjIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlU2VuZEhlYWRlcnMucmVtb3ZlTGlzdGVuZXIgQGRhdGFbdGFiSWRdLm9uQmVmb3JlU2VuZEhlYWRlcnNMaXN0ZW5lclxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uSGVhZGVyc1JlY2VpdmVkLnJlbW92ZUxpc3RlbmVyIEBkYXRhW3RhYklkXS5vbkhlYWRlcnNSZWNlaXZlZExpc3RlbmVyXG4gICAgXG4gIF9zdGFydDogKHRhYklkKSAtPlxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5hZGRMaXN0ZW5lciBAZGF0YVt0YWJJZF0ubGlzdGVuZXIsXG4gICAgICB1cmxzOlsnPGFsbF91cmxzPiddXG4gICAgICB0YWJJZDp0YWJJZCxcbiAgICAgIFsnYmxvY2tpbmcnXVxuICAgICMgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVTZW5kSGVhZGVycy5hZGRMaXN0ZW5lciBAZGF0YVt0YWJJZF0ub25CZWZvcmVTZW5kSGVhZGVyc0xpc3RlbmVyLFxuICAgICMgICB1cmxzOlsnPGFsbF91cmxzPiddXG4gICAgIyAgIHRhYklkOnRhYklkLFxuICAgICMgICBbXCJyZXF1ZXN0SGVhZGVyc1wiXVxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uSGVhZGVyc1JlY2VpdmVkLmFkZExpc3RlbmVyIEBkYXRhW3RhYklkXS5vbkhlYWRlcnNSZWNlaXZlZExpc3RlbmVyLFxuICAgICAgdXJsczpbJzxhbGxfdXJscz4nXVxuICAgICAgdGFiSWQ6dGFiSWQsXG4gICAgICBbJ2Jsb2NraW5nJywncmVzcG9uc2VIZWFkZXJzJ10gICAgXG5cbiAgZ2V0Q3VycmVudFRhYjogKGNiKSAtPlxuICAgICMgdHJpZWQgdG8ga2VlcCBvbmx5IGFjdGl2ZVRhYiBwZXJtaXNzaW9uLCBidXQgb2ggd2VsbC4uXG4gICAgY2hyb21lLnRhYnMucXVlcnlcbiAgICAgIGFjdGl2ZTp0cnVlXG4gICAgICBjdXJyZW50V2luZG93OnRydWVcbiAgICAsKHRhYnMpID0+XG4gICAgICBAY3VycmVudFRhYklkID0gdGFic1swXS5pZFxuICAgICAgY2I/IEBjdXJyZW50VGFiSWRcblxuICB0b2dnbGU6ICgpIC0+XG4gICAgaXNPbiA9IGZhbHNlXG4gICAgaWYgQGRhdGFbQGN1cnJlbnRUYWJJZF0/Lm1hcHM/XG4gICAgICBmb3IgbSBpbiBAZGF0YVtAY3VycmVudFRhYklkXT8ubWFwc1xuICAgICAgICBpZiBtLmlzT25cbiAgICAgICAgICBpc09uID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpc09uID0gZmFsc2VcbiAgICAgICMgQGRhdGFbQGN1cnJlbnRUYWJJZF0uaXNPbiA9ICFAZGF0YVtAY3VycmVudFRhYklkXS5pc09uXG4gICAgICBcbiAgICAgIGlmIGlzT25cbiAgICAgICAgQHN0YXJ0KClcbiAgICAgIGVsc2VcbiAgICAgICAgQF9zdG9wKEBjdXJyZW50VGFiSWQpXG5cbiAgICAgIHJldHVybiBpc09uXG5cbiAgIyBzaG91bGRBbGxvd0NPUlM6IChkZXRhaWxzKSAtPlxuXG5cbiAgIyBjcmVhdGVPbkJlZm9yZVNlbmRIZWFkZXJzTGlzdGVuZXI6ICgpIC0+XG4gICMgICAoZGV0YWlscykgPT5cbiAgIyAgICAgaWYgZGV0YWlscy51cmwuaW5kZXhPZihAcHJlZml4KSBpcyAwXG4gICMgICAgICAgZmxhZyA9IGZhbHNlXG4gICMgICAgICAgcnVsZSA9XG4gICMgICAgICAgICBuYW1lOiBcIk9yaWdpblwiXG4gICMgICAgICAgICB2YWx1ZTogXCJodHRwOi8vcHJveGx5LmNvbVwiXG4gICMgICAgICAgZm9yIGhlYWRlciBpbiBkZXRhaWxzLnJlcXVlc3RIZWFkZXJzXG4gICMgICAgICAgICBpZiBoZWFkZXIubmFtZSBpcyBydWxlLm5hbWVcbiAgIyAgICAgICAgICAgZmxhZyA9IHRydWVcbiAgIyAgICAgICAgICAgaGVhZGVyLnZhbHVlID0gcnVsZS52YWx1ZVxuICAjICAgICAgICAgICBicmVha1xuXG4gICMgICAgICAgZGV0YWlscy5yZXF1ZXN0SGVhZGVycy5wdXNoIHJ1bGUgaWYgbm90IGZsYWdcblxuICAjICAgICByZXR1cm4gcmVxdWVzdEhlYWRlcnM6ZGV0YWlscy5yZXF1ZXN0SGVhZGVyc1xuXG4gIGNyZWF0ZU9uSGVhZGVyc1JlY2VpdmVkTGlzdGVuZXI6ICgpIC0+XG4gICAgKGRldGFpbHMpID0+XG4gICAgICBpZiBkZXRhaWxzLnVybC5pbmRleE9mKEBwcmVmaXgpIGlzIDBcbiAgICAgICAgcnVsZSA9XG4gICAgICAgICAgbmFtZTogXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIlxuICAgICAgICAgIHZhbHVlOiBcIipcIlxuXG4gICAgICAgIGRldGFpbHMucmVzcG9uc2VIZWFkZXJzLnB1c2ggcnVsZVxuXG4gICAgICByZXR1cm4gcmVzcG9uc2VIZWFkZXJzOmRldGFpbHMucmVzcG9uc2VIZWFkZXJzXG5cbiAgY3JlYXRlUmVkaXJlY3RMaXN0ZW5lcjogKCkgLT5cbiAgICAoZGV0YWlscykgPT5cbiAgICAgIHBhdGggPSBAZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdCBkZXRhaWxzLnVybFxuICAgICAgaWYgcGF0aD8gYW5kIHBhdGguaW5kZXhPZiBAcHJlZml4IGlzIC0xXG4gICAgICAgIHJldHVybiByZWRpcmVjdFVybDpAcHJlZml4ICsgcGF0aFxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4ge30gXG5cbiAgdG9EaWN0OiAob2JqLGtleSkgLT5cbiAgICBvYmoucmVkdWNlICgoZGljdCwgX29iaikgLT4gZGljdFsgX29ialtrZXldIF0gPSBfb2JqIGlmIF9vYmpba2V5XT87IHJldHVybiBkaWN0KSwge31cblxubW9kdWxlLmV4cG9ydHMgPSBSZWRpcmVjdFxuIiwiI1RPRE86IHJld3JpdGUgdGhpcyBjbGFzcyB1c2luZyB0aGUgbmV3IGNocm9tZS5zb2NrZXRzLiogYXBpIHdoZW4geW91IGNhbiBtYW5hZ2UgdG8gbWFrZSBpdCB3b3JrXG5jbGFzcyBTZXJ2ZXJcbiAgc29ja2V0OiBjaHJvbWUuc29ja2V0XG4gICMgdGNwOiBjaHJvbWUuc29ja2V0cy50Y3BcbiAgc29ja2V0UHJvcGVydGllczpcbiAgICAgIHBlcnNpc3RlbnQ6dHJ1ZVxuICAgICAgbmFtZTonU0xSZWRpcmVjdG9yJ1xuICAjIHNvY2tldEluZm86bnVsbFxuICBnZXRMb2NhbEZpbGU6bnVsbFxuICBzb2NrZXRJZHM6W11cbiAgc3RhdHVzOlxuICAgIGhvc3Q6bnVsbFxuICAgIHBvcnQ6bnVsbFxuICAgIG1heENvbm5lY3Rpb25zOjUwXG4gICAgaXNPbjpmYWxzZVxuICAgIHNvY2tldEluZm86bnVsbFxuICAgIHVybDpudWxsXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQHN0YXR1cy5ob3N0ID0gXCIxMjcuMC4wLjFcIlxuICAgIEBzdGF0dXMucG9ydCA9IDEwMDEyXG4gICAgQHN0YXR1cy5tYXhDb25uZWN0aW9ucyA9IDUwXG4gICAgQHN0YXR1cy51cmwgPSAnaHR0cDovLycgKyBAc3RhdHVzLmhvc3QgKyAnOicgKyBAc3RhdHVzLnBvcnQgKyAnLydcbiAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuXG5cbiAgc3RhcnQ6IChob3N0LHBvcnQsbWF4Q29ubmVjdGlvbnMsIGNiKSAtPlxuICAgIGlmIGhvc3Q/IHRoZW4gQHN0YXR1cy5ob3N0ID0gaG9zdFxuICAgIGlmIHBvcnQ/IHRoZW4gQHN0YXR1cy5wb3J0ID0gcG9ydFxuICAgIGlmIG1heENvbm5lY3Rpb25zPyB0aGVuIEBzdGF0dXMubWF4Q29ubmVjdGlvbnMgPSBtYXhDb25uZWN0aW9uc1xuXG4gICAgQGtpbGxBbGwgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgIHJldHVybiBjYj8gZXJyIGlmIGVycj9cblxuICAgICAgQHN0YXR1cy5pc09uID0gZmFsc2VcbiAgICAgIEBzb2NrZXQuY3JlYXRlICd0Y3AnLCB7fSwgKHNvY2tldEluZm8pID0+XG4gICAgICAgIEBzdGF0dXMuc29ja2V0SW5mbyA9IHNvY2tldEluZm9cbiAgICAgICAgQHNvY2tldElkcyA9IFtdXG4gICAgICAgIEBzb2NrZXRJZHMucHVzaCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQgJ3NvY2tldElkcyc6QHNvY2tldElkc1xuICAgICAgICBAc29ja2V0Lmxpc3RlbiBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBzdGF0dXMuaG9zdCwgQHN0YXR1cy5wb3J0LCAocmVzdWx0KSA9PlxuICAgICAgICAgIGlmIHJlc3VsdCA+IC0xXG4gICAgICAgICAgICBzaG93ICdsaXN0ZW5pbmcgJyArIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICAgICAgQHN0YXR1cy5pc09uID0gdHJ1ZVxuICAgICAgICAgICAgQHNvY2tldC5hY2NlcHQgQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG4gICAgICAgICAgICBjYj8gbnVsbCwgQHN0YXR1c1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNiPyByZXN1bHRcblxuXG4gIGtpbGxBbGw6IChjYikgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCAnc29ja2V0SWRzJywgKHJlc3VsdCkgPT5cbiAgICAgIEBzb2NrZXRJZHMgPSByZXN1bHQuc29ja2V0SWRzXG4gICAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuICAgICAgcmV0dXJuIGNiPyBudWxsLCAnc3VjY2VzcycgdW5sZXNzIEBzb2NrZXRJZHM/XG4gICAgICBjbnQgPSAwXG4gICAgICBmb3IgcyBpbiBAc29ja2V0SWRzXG4gICAgICAgIGRvIChzKSA9PlxuICAgICAgICAgIGNudCsrXG4gICAgICAgICAgQHNvY2tldC5nZXRJbmZvIHMsIChzb2NrZXRJbmZvKSA9PlxuICAgICAgICAgICAgY250LS1cbiAgICAgICAgICAgIGlmIG5vdCBjaHJvbWUucnVudGltZS5sYXN0RXJyb3I/XG4gICAgICAgICAgICAgIEBzb2NrZXQuZGlzY29ubmVjdCBzIGlmIEBzdGF0dXMuc29ja2V0SW5mbz8uY29ubmVjdGVkIG9yIG5vdCBAc3RhdHVzLnNvY2tldEluZm8/XG4gICAgICAgICAgICAgIEBzb2NrZXQuZGVzdHJveSBzXG5cbiAgICAgICAgICAgIGNiPyBudWxsLCAnc3VjY2VzcycgaWYgY250IGlzIDBcblxuICBzdG9wOiAoY2IpIC0+XG4gICAgQGtpbGxBbGwgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgIGlmIGVycj8gXG4gICAgICAgIGNiPyBlcnJcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsc3VjY2Vzc1xuXG5cbiAgX29uUmVjZWl2ZTogKHJlY2VpdmVJbmZvKSA9PlxuICAgIHNob3coXCJDbGllbnQgc29ja2V0ICdyZWNlaXZlJyBldmVudDogc2Q9XCIgKyByZWNlaXZlSW5mby5zb2NrZXRJZFxuICAgICsgXCIsIGJ5dGVzPVwiICsgcmVjZWl2ZUluZm8uZGF0YS5ieXRlTGVuZ3RoKVxuXG4gIF9vbkxpc3RlbjogKHNlcnZlclNvY2tldElkLCByZXN1bHRDb2RlKSA9PlxuICAgIHJldHVybiBzaG93ICdFcnJvciBMaXN0ZW5pbmc6ICcgKyBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSBpZiByZXN1bHRDb2RlIDwgMFxuICAgIEBzZXJ2ZXJTb2NrZXRJZCA9IHNlcnZlclNvY2tldElkXG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdC5hZGRMaXN0ZW5lciBAX29uQWNjZXB0XG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdEVycm9yLmFkZExpc3RlbmVyIEBfb25BY2NlcHRFcnJvclxuICAgIEB0Y3Aub25SZWNlaXZlLmFkZExpc3RlbmVyIEBfb25SZWNlaXZlXG4gICAgIyBzaG93IFwiW1wiK3NvY2tldEluZm8ucGVlckFkZHJlc3MrXCI6XCIrc29ja2V0SW5mby5wZWVyUG9ydCtcIl0gQ29ubmVjdGlvbiBhY2NlcHRlZCFcIjtcbiAgICAjIGluZm8gPSBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAjIEBnZXRGaWxlIHVyaSwgKGZpbGUpIC0+XG4gIF9vbkFjY2VwdEVycm9yOiAoZXJyb3IpIC0+XG4gICAgc2hvdyBlcnJvclxuXG4gIF9vbkFjY2VwdDogKHNvY2tldEluZm8pID0+XG4gICAgIyByZXR1cm4gbnVsbCBpZiBpbmZvLnNvY2tldElkIGlzbnQgQHNlcnZlclNvY2tldElkXG4gICAgc2hvdyhcIlNlcnZlciBzb2NrZXQgJ2FjY2VwdCcgZXZlbnQ6IHNkPVwiICsgc29ja2V0SW5mby5zb2NrZXRJZClcbiAgICBpZiBzb2NrZXRJbmZvPy5zb2NrZXRJZD9cbiAgICAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZCwgKGVyciwgaW5mbykgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gQF93cml0ZUVycm9yIHNvY2tldEluZm8uc29ja2V0SWQsIDQwNCwgaW5mby5rZWVwQWxpdmVcblxuICAgICAgICBAZ2V0TG9jYWxGaWxlIGluZm8sIChlcnIsIGZpbGVFbnRyeSwgZmlsZVJlYWRlcikgPT5cbiAgICAgICAgICBpZiBlcnI/IHRoZW4gQF93cml0ZUVycm9yIHNvY2tldEluZm8uc29ja2V0SWQsIDQwNCwgaW5mby5rZWVwQWxpdmVcbiAgICAgICAgICBlbHNlIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJbmZvLnNvY2tldElkLCBmaWxlRW50cnksIGZpbGVSZWFkZXIsIGluZm8ua2VlcEFsaXZlXG4gICAgZWxzZVxuICAgICAgc2hvdyBcIk5vIHNvY2tldD8hXCJcbiAgICAjIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuXG5cbiAgc3RyaW5nVG9VaW50OEFycmF5OiAoc3RyaW5nKSAtPlxuICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgaSA9IDBcblxuICAgIHdoaWxlIGkgPCBzdHJpbmcubGVuZ3RoXG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgIGkrK1xuICAgIHZpZXdcblxuICBhcnJheUJ1ZmZlclRvU3RyaW5nOiAoYnVmZmVyKSAtPlxuICAgIHN0ciA9IFwiXCJcbiAgICB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgcyA9IDBcblxuICAgIHdoaWxlIHMgPCB1QXJyYXlWYWwubGVuZ3RoXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pXG4gICAgICBzKytcbiAgICBzdHJcblxuICBfd3JpdGUyMDBSZXNwb25zZTogKHNvY2tldElkLCBmaWxlRW50cnksIGZpbGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBjb250ZW50VHlwZSA9IChpZiAoZmlsZS50eXBlIGlzIFwiXCIpIHRoZW4gXCJ0ZXh0L3BsYWluXCIgZWxzZSBmaWxlLnR5cGUpXG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+XG4gICAgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShldi50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgICAgc2hvdyB3cml0ZUluZm9cbiAgICAgICAgIyBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5vbmVycm9yID0gKGVycm9yKSA9PlxuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGZpbGVcblxuXG4gICAgIyBAZW5kIHNvY2tldElkXG4gICAgIyBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICMgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgPT5cbiAgICAjICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAjICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICMgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAjICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJZFxuXG5cbiAgX3JlYWRGcm9tU29ja2V0OiAoc29ja2V0SWQsIGNiKSAtPlxuICAgIEBzb2NrZXQucmVhZCBzb2NrZXRJZCwgKHJlYWRJbmZvKSA9PlxuICAgICAgc2hvdyBcIlJFQURcIiwgcmVhZEluZm9cblxuICAgICAgIyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIGRhdGEgPSBAYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKVxuICAgICAgc2hvdyBkYXRhXG5cbiAgICAgIGtlZXBBbGl2ZSA9IGZhbHNlXG4gICAgICBrZWVwQWxpdmUgPSB0cnVlIGlmIGRhdGEuaW5kZXhPZiAnQ29ubmVjdGlvbjoga2VlcC1hbGl2ZScgaXNudCAtMVxuXG4gICAgICBpZiBkYXRhLmluZGV4T2YoXCJHRVQgXCIpIGlzbnQgMFxuICAgICAgICByZXR1cm4gY2I/ICc0MDQnLCBrZWVwQWxpdmU6a2VlcEFsaXZlXG5cblxuXG4gICAgICB1cmlFbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIDQpXG5cbiAgICAgIHJldHVybiBlbmQgc29ja2V0SWQgaWYgdXJpRW5kIDwgMFxuXG4gICAgICB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpXG4gICAgICBpZiBub3QgdXJpP1xuICAgICAgICByZXR1cm4gY2I/ICc0MDQnLCBrZWVwQWxpdmU6a2VlcEFsaXZlXG5cbiAgICAgIGluZm8gPVxuICAgICAgICB1cmk6IHVyaVxuICAgICAgICBrZWVwQWxpdmU6a2VlcEFsaXZlXG4gICAgICBpbmZvLnJlZmVyZXIgPSBkYXRhLm1hdGNoKC9SZWZlcmVyOlxccyguKikvKT9bMV1cbiAgICAgICNzdWNjZXNzXG4gICAgICBjYj8gbnVsbCwgaW5mb1xuXG4gIGVuZDogKHNvY2tldElkLCBrZWVwQWxpdmUpIC0+XG4gICAgICAjIGlmIGtlZXBBbGl2ZVxuICAgICAgIyAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICMgZWxzZVxuICAgIEBzb2NrZXQuZGlzY29ubmVjdCBzb2NrZXRJZFxuICAgIEBzb2NrZXQuZGVzdHJveSBzb2NrZXRJZFxuICAgIHNob3cgJ2VuZGluZyAnICsgc29ja2V0SWRcbiAgICBAc29ja2V0LmFjY2VwdCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuICBfd3JpdGVFcnJvcjogKHNvY2tldElkLCBlcnJvckNvZGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBmaWxlID0gc2l6ZTogMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGJlZ2luLi4uIFwiXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogZmlsZSA9IFwiICsgZmlsZVxuICAgIGNvbnRlbnRUeXBlID0gXCJ0ZXh0L3BsYWluXCIgIyhmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCBcIiArIGVycm9yQ29kZSArIFwiIE5vdCBGb3VuZFxcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoKGlmIGtlZXBBbGl2ZSB0aGVuIFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIGVsc2UgXCJcIikpICsgXCJcXG5cXG5cIilcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgaGVhZGVyLi4uXCJcbiAgICBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldCBoZWFkZXIsIDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgdmlldy4uLlwiXG4gICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICAgc2hvdyBcIldSSVRFXCIsIHdyaXRlSW5mb1xuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG5cbm1vZHVsZS5leHBvcnRzID0gU2VydmVyXG4iLCJMSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5cbldhdGNoSlMgPSByZXF1aXJlICd3YXRjaGpzJ1xud2F0Y2ggPSBXYXRjaEpTLndhdGNoXG51bndhdGNoID0gV2F0Y2hKUy51bndhdGNoXG5jYWxsV2F0Y2hlcnMgPSBXYXRjaEpTLmNhbGxXYXRjaGVyc1xuXG5jbGFzcyBTdG9yYWdlXG4gIGFwaTogY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIGRhdGE6IFxuICAgIGN1cnJlbnRSZXNvdXJjZXM6IFtdXG4gICAgZGlyZWN0b3JpZXM6W11cbiAgICBtYXBzOltdXG4gICAgdGFiTWFwczp7fVxuICAgIGN1cnJlbnRGaWxlTWF0Y2hlczp7fVxuICBcbiAgc2Vzc2lvbjp7fVxuXG4gIG9uRGF0YUxvYWRlZDogLT5cblxuICBjYWxsYmFjazogKCkgLT5cbiAgbm90aWZ5T25DaGFuZ2U6ICgpIC0+XG4gIGNvbnN0cnVjdG9yOiAoX29uRGF0YUxvYWRlZCkgLT5cbiAgICBAb25EYXRhTG9hZGVkID0gX29uRGF0YUxvYWRlZCBpZiBfb25EYXRhTG9hZGVkP1xuICAgIEBhcGkuZ2V0IChyZXN1bHRzKSA9PlxuICAgICAgQGRhdGFba10gPSByZXN1bHRzW2tdIGZvciBrIG9mIHJlc3VsdHNcblxuICAgICAgd2F0Y2hBbmROb3RpZnkgQCwnZGF0YUNoYW5nZWQnLCBAZGF0YSwgdHJ1ZVxuXG4gICAgICB3YXRjaEFuZE5vdGlmeSBALCdzZXNzaW9uRGF0YScsIEBzZXNzaW9uLCBmYWxzZVxuXG4gICAgICBAb25EYXRhTG9hZGVkIEBkYXRhXG5cbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgLT5cbiAgICBcbiAgd2F0Y2hBbmROb3RpZnkgPSAoX3RoaXMsIG1zZ0tleSwgb2JqLCBzdG9yZSkgLT5cblxuICAgICAgX2xpc3RlbmVyID0gKHByb3AsIGFjdGlvbiwgbmV3VmFsLCBvbGRWYWwpIC0+XG4gICAgICAgIGlmIChhY3Rpb24gaXMgXCJzZXRcIiBvciBcImRpZmZlcmVudGF0dHJcIikgYW5kIF90aGlzLm5vV2F0Y2ggaXMgZmFsc2VcbiAgICAgICAgICBpZiBub3QgL15cXGQrJC8udGVzdChwcm9wKVxuICAgICAgICAgICAgc2hvdyBhcmd1bWVudHNcbiAgICAgICAgICAgIF90aGlzLmFwaS5zZXQgb2JqIGlmIHN0b3JlXG4gICAgICAgICAgICBtc2cgPSB7fVxuICAgICAgICAgICAgbXNnW21zZ0tleV0gPSBvYmpcbiAgICAgICAgICAgICMgdW53YXRjaCBvYmosIF9saXN0ZW5lciwzLHRydWVcbiAgICAgICAgICAgIF90aGlzLk1TRy5FeHRQb3J0IG1zZ1xuICAgICAgICBcbiAgICAgIF90aGlzLm5vV2F0Y2ggPSBmYWxzZVxuICAgICAgd2F0Y2ggb2JqLCBfbGlzdGVuZXIsMyx0cnVlXG5cbiAgICAgIF90aGlzLkxJU1RFTi5FeHQgbXNnS2V5LCAoZGF0YSkgLT5cbiAgICAgICAgX3RoaXMubm9XYXRjaCA9IHRydWVcbiAgICAgICAgIyB1bndhdGNoIG9iaiwgX2xpc3RlbmVyLDMsdHJ1ZVxuICAgICAgICBcbiAgICAgICAgb2JqW2tdID0gZGF0YVtrXSBmb3IgayBvZiBkYXRhXG4gICAgICAgIHNldFRpbWVvdXQgKCkgLT4gXG4gICAgICAgICAgX3RoaXMubm9XYXRjaCA9IGZhbHNlXG4gICAgICAgICwyMDBcblxuICBzYXZlOiAoa2V5LCBpdGVtLCBjYikgLT5cblxuICAgIG9iaiA9IHt9XG4gICAgb2JqW2tleV0gPSBpdGVtXG4gICAgQGRhdGFba2V5XSA9IGl0ZW1cbiAgICBAYXBpLnNldCBvYmosIChyZXMpID0+XG4gICAgICBjYj8oKVxuICAgICAgQGNhbGxiYWNrPygpXG4gXG4gIHNhdmVBbGw6IChkYXRhLCBjYikgLT5cblxuICAgIGlmIGRhdGE/IFxuICAgICAgQGFwaS5zZXQgZGF0YSwgKCkgPT5cbiAgICAgICAgY2I/KClcbiBcbiAgICBlbHNlXG4gICAgICBAYXBpLnNldCBAZGF0YSwgKCkgPT5cbiAgICAgICAgY2I/KClcbiBcblxuICByZXRyaWV2ZTogKGtleSwgY2IpIC0+XG4gICAgQG9ic2VydmVyLnN0b3AoKVxuICAgIEBhcGkuZ2V0IGtleSwgKHJlc3VsdHMpIC0+XG4gICAgICBAZGF0YVtyXSA9IHJlc3VsdHNbcl0gZm9yIHIgb2YgcmVzdWx0c1xuICAgICAgaWYgY2I/IHRoZW4gY2IgcmVzdWx0c1trZXldXG5cbiAgcmV0cmlldmVBbGw6IChjYikgLT5cbiAgICAjIEBvYnNlcnZlci5zdG9wKClcbiAgICBAYXBpLmdldCAocmVzdWx0KSA9PlxuICAgICAgZm9yIGMgb2YgcmVzdWx0IFxuICAgICAgIyAgIGRlbGV0ZSBAZGF0YVtjXVxuICAgICAgICBAZGF0YVtjXSA9IHJlc3VsdFtjXSBcbiAgICAgICMgQGRhdGEgPSByZXN1bHRcbiAgICAgICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6XG4gICAgICAgICAgcGF0aDpjXG4gICAgICAgICAgdmFsdWU6cmVzdWx0W2NdXG4gXG5cbiAgICAgIEBhcGkuc2V0IEBkYXRhXG4gICAgICAjIEBjYWxsYmFjaz8gcmVzdWx0XG4gICAgICBjYj8gcmVzdWx0XG4gICAgICBAb25EYXRhTG9hZGVkIEBkYXRhXG5cbiAgb25EYXRhTG9hZGVkOiAoZGF0YSkgLT5cblxuICBvbkNoYW5nZWQ6IChrZXksIGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgaWYgY2hhbmdlc1trZXldPyBhbmQgY2I/IHRoZW4gY2IgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuICBvbkNoYW5nZWRBbGw6ICgpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLG5hbWVzcGFjZSkgPT5cbiAgICAgIGhhc0NoYW5nZXMgPSBmYWxzZVxuICAgICAgZm9yIGMgb2YgY2hhbmdlcyB3aGVuIGNoYW5nZXNbY10ubmV3VmFsdWUgIT0gY2hhbmdlc1tjXS5vbGRWYWx1ZSBhbmQgYyBpc250J3NvY2tldElkcydcbiAgICAgICAgKGMpID0+IFxuICAgICAgICAgIEBkYXRhW2NdID0gY2hhbmdlc1tjXS5uZXdWYWx1ZSBcbiAgICAgICAgICBzaG93ICdkYXRhIGNoYW5nZWQ6ICdcbiAgICAgICAgICBzaG93IGNcbiAgICAgICAgICBzaG93IEBkYXRhW2NdXG5cbiAgICAgICAgICBoYXNDaGFuZ2VzID0gdHJ1ZVxuXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXMgaWYgaGFzQ2hhbmdlc1xuICAgICAgc2hvdyAnY2hhbmdlZCcgaWYgaGFzQ2hhbmdlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE3NDIwOTNcbm1vZHVsZS5leHBvcnRzID0gKCgpIC0+XG5cbiAgZGVidWcgPSB0cnVlXG4gIFxuICByZXR1cm4gKHdpbmRvdy5zaG93ID0gKCkgLT4pIGlmIG5vdCBkZWJ1Z1xuXG4gIG1ldGhvZHMgPSBbXG4gICAgJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJyxcbiAgICAnZXhjZXB0aW9uJywgJ2dyb3VwJywgJ2dyb3VwQ29sbGFwc2VkJywgJ2dyb3VwRW5kJywgJ2luZm8nLCAnbG9nJyxcbiAgICAnbWFya1RpbWVsaW5lJywgJ3Byb2ZpbGUnLCAncHJvZmlsZUVuZCcsICd0YWJsZScsICd0aW1lJywgJ3RpbWVFbmQnLFxuICAgICd0aW1lU3RhbXAnLCAndHJhY2UnLCAnd2FybiddXG4gICAgXG4gIG5vb3AgPSAoKSAtPlxuICAgICMgc3R1YiB1bmRlZmluZWQgbWV0aG9kcy5cbiAgICBmb3IgbSBpbiBtZXRob2RzICB3aGVuICAhY29uc29sZVttXVxuICAgICAgY29uc29sZVttXSA9IG5vb3BcblxuXG4gIGlmIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kP1xuICAgIHdpbmRvdy5zaG93ID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSlcbiAgZWxzZVxuICAgIHdpbmRvdy5zaG93ID0gKCkgLT5cbiAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpXG4pKClcbiJdfQ==
