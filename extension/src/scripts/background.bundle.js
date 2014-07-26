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


},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvY29tbW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9jb25maWcuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L2V4dGVuc2lvbi9zcmMvYmFja2dyb3VuZC5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L25vZGVfbW9kdWxlcy93YXRjaGpzL3NyYy93YXRjaC5qcyIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9ub3RpZmljYXRpb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3JlZGlyZWN0LmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9zZXJ2ZXIuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3N0b3JhZ2UuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3V0aWwuY29mZmVlIl0sIm5hbWVzIjpb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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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OEIsT0FBTyxDQUFDLEdBQXRDLEVBQTJDLE9BQTNDLEVBQW9ELFNBQXBELEVBRFk7SUFBQSxFQUhoQjtHQWxCZ0I7QUFBQSxDQUFELENBQUEsQ0FBQSxDQUFqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlICcuL3V0aWwuY29mZmVlJ1xuQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuU3RvcmFnZSA9IHJlcXVpcmUgJy4vc3RvcmFnZS5jb2ZmZWUnXG5GaWxlU3lzdGVtID0gcmVxdWlyZSAnLi9maWxlc3lzdGVtLmNvZmZlZSdcbk5vdGlmaWNhdGlvbiA9IHJlcXVpcmUgJy4vbm90aWZpY2F0aW9uLmNvZmZlZSdcblNlcnZlciA9IHJlcXVpcmUgJy4vc2VydmVyLmNvZmZlZSdcblxuXG5jbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIENvbmZpZ1xuICBMSVNURU46IG51bGxcbiAgTVNHOiBudWxsXG4gIFN0b3JhZ2U6IG51bGxcbiAgRlM6IG51bGxcbiAgU2VydmVyOiBudWxsXG4gIE5vdGlmeTogbnVsbFxuICBwbGF0Zm9ybTpudWxsXG4gIGN1cnJlbnRUYWJJZDpudWxsXG5cbiAgY29uc3RydWN0b3I6IChkZXBzKSAtPlxuICAgIHN1cGVyXG5cbiAgICBATVNHID89IE1TRy5nZXQoKVxuICAgIEBMSVNURU4gPz0gTElTVEVOLmdldCgpXG4gICAgXG4gICAgY2hyb21lLnJ1bnRpbWUub25Db25uZWN0RXh0ZXJuYWwuYWRkTGlzdGVuZXIgKHBvcnQpID0+XG4gICAgICBpZiBwb3J0LnNlbmRlci5pZCBpc250IEBFWFRfSURcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIEBNU0cuc2V0UG9ydCBwb3J0XG4gICAgICBATElTVEVOLnNldFBvcnQgcG9ydFxuICAgIFxuICAgIHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG4gICAgQE1TRy5zZXRQb3J0IHBvcnRcbiAgICBATElTVEVOLnNldFBvcnQgcG9ydFxuICAgIFxuICAgIGZvciBwcm9wIG9mIGRlcHNcbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwib2JqZWN0XCIgXG4gICAgICAgIEBbcHJvcF0gPSBAd3JhcE9iakluYm91bmQgZGVwc1twcm9wXVxuICAgICAgaWYgdHlwZW9mIGRlcHNbcHJvcF0gaXMgXCJmdW5jdGlvblwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpPdXRib3VuZCBuZXcgZGVwc1twcm9wXVxuXG4gICAgQFN0b3JhZ2Uub25EYXRhTG9hZGVkID0gKGRhdGEpID0+XG4gICAgICAjIEBkYXRhID0gZGF0YVxuICAgICAgIyBkZWxldGUgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXJcbiAgICAgICMgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXIgPSB7fVxuICAgICAgIyBkZWxldGUgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXIuc3RhdHVzXG5cbiAgICAgIGlmIG5vdCBAU3RvcmFnZS5kYXRhLmZpcnN0VGltZT9cbiAgICAgICAgQFN0b3JhZ2UuZGF0YS5maXJzdFRpbWUgPSBmYWxzZVxuICAgICAgICBAU3RvcmFnZS5kYXRhLm1hcHMucHVzaFxuICAgICAgICAgIG5hbWU6J1NhbGVzZm9yY2UnXG4gICAgICAgICAgdXJsOidodHRwcy4qXFwvcmVzb3VyY2UoXFwvWzAtOV0rKT9cXC8oW0EtWmEtejAtOVxcLS5fXStcXC8pPydcbiAgICAgICAgICByZWdleFJlcGw6JydcbiAgICAgICAgICBpc1JlZGlyZWN0OnRydWVcbiAgICAgICAgICBpc09uOmZhbHNlXG5cblxuICAgICAgIyBpZiBAUmVkaXJlY3Q/IHRoZW4gQFJlZGlyZWN0LmRhdGEgPSBAZGF0YS50YWJNYXBzXG5cbiAgICBATm90aWZ5ID89IChuZXcgTm90aWZpY2F0aW9uKS5zaG93IFxuICAgICMgQFN0b3JhZ2UgPz0gQHdyYXBPYmpPdXRib3VuZCBuZXcgU3RvcmFnZSBAZGF0YVxuICAgICMgQEZTID0gbmV3IEZpbGVTeXN0ZW0gXG4gICAgIyBAU2VydmVyID89IEB3cmFwT2JqT3V0Ym91bmQgbmV3IFNlcnZlclxuICAgIEBkYXRhID0gQFN0b3JhZ2UuZGF0YVxuICAgIFxuICAgIEB3cmFwID0gaWYgQFNFTEZfVFlQRSBpcyAnQVBQJyB0aGVuIEB3cmFwSW5ib3VuZCBlbHNlIEB3cmFwT3V0Ym91bmRcblxuICAgIEBvcGVuQXBwID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLm9wZW5BcHAnLCBAb3BlbkFwcFxuICAgIEBsYXVuY2hBcHAgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ubGF1bmNoQXBwJywgQGxhdW5jaEFwcFxuICAgIEBzdGFydFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5zdGFydFNlcnZlcicsIEBzdGFydFNlcnZlclxuICAgIEByZXN0YXJ0U2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnJlc3RhcnRTZXJ2ZXInLCBAcmVzdGFydFNlcnZlclxuICAgIEBzdG9wU2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnN0b3BTZXJ2ZXInLCBAc3RvcFNlcnZlclxuICAgIEBnZXRGaWxlTWF0Y2ggPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0RmlsZU1hdGNoJywgQGdldEZpbGVNYXRjaFxuXG4gICAgQHdyYXAgPSBpZiBAU0VMRl9UWVBFIGlzICdFWFRFTlNJT04nIHRoZW4gQHdyYXBJbmJvdW5kIGVsc2UgQHdyYXBPdXRib3VuZFxuXG4gICAgQGdldFJlc291cmNlcyA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRSZXNvdXJjZXMnLCBAZ2V0UmVzb3VyY2VzXG4gICAgQGdldEN1cnJlbnRUYWIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0Q3VycmVudFRhYicsIEBnZXRDdXJyZW50VGFiXG5cbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgLT5cbiAgICAgIEBTdG9yYWdlLnNlc3Npb24uc2VydmVyID0ge31cbiAgICAgIEBTdG9yYWdlLnNlc3Npb24uc2VydmVyLnN0YXR1cyA9IEBTZXJ2ZXIuc3RhdHVzXG4gICAgIyBAU3RvcmFnZS5yZXRyaWV2ZUFsbCgpIGlmIEBTdG9yYWdlP1xuXG5cbiAgZ2V0Q3VycmVudFRhYjogKGNiKSAtPlxuICAgICMgdHJpZWQgdG8ga2VlcCBvbmx5IGFjdGl2ZVRhYiBwZXJtaXNzaW9uLCBidXQgb2ggd2VsbC4uXG4gICAgY2hyb21lLnRhYnMucXVlcnlcbiAgICAgIGFjdGl2ZTp0cnVlXG4gICAgICBjdXJyZW50V2luZG93OnRydWVcbiAgICAsKHRhYnMpID0+XG4gICAgICBAY3VycmVudFRhYklkID0gdGFic1swXS5pZFxuICAgICAgY2I/IEBjdXJyZW50VGFiSWRcblxuICBsYXVuY2hBcHA6IChjYiwgZXJyb3IpIC0+XG4gICAgIyBuZWVkcyBtYW5hZ2VtZW50IHBlcm1pc3Npb24uIG9mZiBmb3Igbm93LlxuICAgIGNocm9tZS5tYW5hZ2VtZW50LmxhdW5jaEFwcCBAQVBQX0lELCAoZXh0SW5mbykgPT5cbiAgICAgIGlmIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxuICAgICAgICBlcnJvciBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IGV4dEluZm9cblxuICBvcGVuQXBwOiAoKSA9PlxuICAgICAgY2hyb21lLmFwcC53aW5kb3cuY3JlYXRlKCdpbmRleC5odG1sJyxcbiAgICAgICAgaWQ6IFwibWFpbndpblwiXG4gICAgICAgIGJvdW5kczpcbiAgICAgICAgICB3aWR0aDo3NzBcbiAgICAgICAgICBoZWlnaHQ6ODAwLFxuICAgICAgKHdpbikgPT5cbiAgICAgICAgQGFwcFdpbmRvdyA9IHdpbikgXG5cbiAgZ2V0Q3VycmVudFRhYjogKGNiKSAtPlxuICAgICMgdHJpZWQgdG8ga2VlcCBvbmx5IGFjdGl2ZVRhYiBwZXJtaXNzaW9uLCBidXQgb2ggd2VsbC4uXG4gICAgY2hyb21lLnRhYnMucXVlcnlcbiAgICAgIGFjdGl2ZTp0cnVlXG4gICAgICBjdXJyZW50V2luZG93OnRydWVcbiAgICAsKHRhYnMpID0+XG4gICAgICBAY3VycmVudFRhYklkID0gdGFic1swXS5pZFxuICAgICAgY2I/IEBjdXJyZW50VGFiSWRcblxuICBnZXRSZXNvdXJjZXM6IChjYikgLT5cbiAgICBAZ2V0Q3VycmVudFRhYiAodGFiSWQpID0+XG4gICAgICBjaHJvbWUudGFicy5leGVjdXRlU2NyaXB0IHRhYklkLCBcbiAgICAgICAgZmlsZTonc2NyaXB0cy9jb250ZW50LmpzJywgKHJlc3VsdHMpID0+XG4gICAgICAgICAgQGRhdGEuY3VycmVudFJlc291cmNlcy5sZW5ndGggPSAwXG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIGNiPyhudWxsLCBAZGF0YS5jdXJyZW50UmVzb3VyY2VzKSBpZiBub3QgcmVzdWx0cz9cblxuICAgICAgICAgIGZvciByIGluIHJlc3VsdHNcbiAgICAgICAgICAgIGZvciByZXMgaW4gclxuICAgICAgICAgICAgICBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLnB1c2ggcmVzXG4gICAgICAgICAgY2I/IG51bGwsIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXNcblxuXG4gIGdldExvY2FsRmlsZTogKGluZm8sIGNiKSA9PlxuICAgIGZpbGVQYXRoID0gaW5mby51cmlcbiAgICBqdXN0VGhlUGF0aCA9IGZpbGVQYXRoLm1hdGNoKC9eKFteIz9cXHNdKyk/KC4qPyk/KCNbXFx3XFwtXSspPyQvKVxuICAgIGZpbGVQYXRoID0ganVzdFRoZVBhdGhbMV0gaWYganVzdFRoZVBhdGg/XG4gICAgIyBmaWxlUGF0aCA9IEBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0IHVybFxuICAgIHJldHVybiBjYiAnZmlsZSBub3QgZm91bmQnIHVubGVzcyBmaWxlUGF0aD9cbiAgICBfZGlycyA9IFtdXG4gICAgX2RpcnMucHVzaCBkaXIgZm9yIGRpciBpbiBAZGF0YS5kaXJlY3RvcmllcyB3aGVuIGRpci5pc09uXG4gICAgZmlsZVBhdGggPSBmaWxlUGF0aC5zdWJzdHJpbmcgMSBpZiBmaWxlUGF0aC5zdWJzdHJpbmcoMCwxKSBpcyAnLydcbiAgICBAZmluZEZpbGVGb3JQYXRoIF9kaXJzLCBmaWxlUGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXIpID0+XG4gICAgICBpZiBlcnI/IHRoZW4gcmV0dXJuIGNiPyBlcnJcbiAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICBjYj8gbnVsbCxmaWxlRW50cnksZmlsZVxuICAgICAgLChlcnIpID0+IGNiPyBlcnJcblxuXG4gIHN0YXJ0U2VydmVyOiAoY2IpIC0+XG4gICAgaWYgQFNlcnZlci5zdGF0dXMuaXNPbiBpcyBmYWxzZVxuICAgICAgQFNlcnZlci5zdGFydCBudWxsLG51bGwsbnVsbCwgKGVyciwgc29ja2V0SW5mbykgPT5cbiAgICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIEVycm9yXCIsXCJFcnJvciBTdGFydGluZyBTZXJ2ZXI6ICN7IGVyciB9XCJcbiAgICAgICAgICAgIGNiPyBlcnJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIFN0YXJ0ZWRcIiwgXCJTdGFydGVkIFNlcnZlciAjeyBAU2VydmVyLnN0YXR1cy51cmwgfVwiXG4gICAgICAgICAgICBjYj8gbnVsbCwgQFNlcnZlci5zdGF0dXNcbiAgICBlbHNlXG4gICAgICBjYj8gJ2FscmVhZHkgc3RhcnRlZCdcblxuICBzdG9wU2VydmVyOiAoY2IpIC0+XG4gICAgICBAU2VydmVyLnN0b3AgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgICAgaWYgZXJyP1xuICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIlNlcnZlciBjb3VsZCBub3QgYmUgc3RvcHBlZDogI3sgZXJyb3IgfVwiXG4gICAgICAgICAgY2I/IGVyclxuICAgICAgICBlbHNlXG4gICAgICAgICAgQE5vdGlmeSAnU2VydmVyIFN0b3BwZWQnLCBcIlNlcnZlciBTdG9wcGVkXCJcbiAgICAgICAgICBjYj8gbnVsbCwgQFNlcnZlci5zdGF0dXNcblxuICByZXN0YXJ0U2VydmVyOiAtPlxuICAgIEBzdGFydFNlcnZlcigpXG5cbiAgY2hhbmdlUG9ydDogPT5cbiAgZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdDogKHVybCkgLT5cbiAgICBmaWxlUGF0aFJlZ2V4ID0gL14oKGh0dHBbc10/fGZ0cHxjaHJvbWUtZXh0ZW5zaW9ufGZpbGUpOlxcL1xcLyk/XFwvPyhbXlxcL1xcLl0rXFwuKSo/KFteXFwvXFwuXStcXC5bXjpcXC9cXHNcXC5dezIsM30oXFwuW146XFwvXFxzXFwuXeKAjOKAi3syLDN9KT8pKDpcXGQrKT8oJHxcXC8pKFteIz9cXHNdKyk/KC4qPyk/KCNbXFx3XFwtXSspPyQvXG4gICBcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgQGRhdGFbQGN1cnJlbnRUYWJJZF0/Lm1hcHM/XG5cbiAgICByZXNQYXRoID0gdXJsLm1hdGNoKGZpbGVQYXRoUmVnZXgpP1s4XVxuICAgIGlmIG5vdCByZXNQYXRoP1xuICAgICAgIyB0cnkgcmVscGF0aFxuICAgICAgcmVzUGF0aCA9IHVybFxuXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHJlc1BhdGg/XG4gICAgXG4gICAgZm9yIG1hcCBpbiBAZGF0YVtAY3VycmVudFRhYklkXS5tYXBzXG4gICAgICByZXNQYXRoID0gdXJsLm1hdGNoKG5ldyBSZWdFeHAobWFwLnVybCkpPyBhbmQgbWFwLnVybD9cblxuICAgICAgaWYgcmVzUGF0aFxuICAgICAgICBpZiByZWZlcmVyP1xuICAgICAgICAgICMgVE9ETzogdGhpc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgZmlsZVBhdGggPSB1cmwucmVwbGFjZSBuZXcgUmVnRXhwKG1hcC51cmwpLCBtYXAucmVnZXhSZXBsXG4gICAgICAgIGJyZWFrXG4gICAgcmV0dXJuIGZpbGVQYXRoXG5cbiAgVVJMdG9Mb2NhbFBhdGg6ICh1cmwsIGNiKSAtPlxuICAgIGZpbGVQYXRoID0gQFJlZGlyZWN0LmdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3QgdXJsXG5cbiAgZ2V0RmlsZU1hdGNoOiAoZmlsZVBhdGgsIGNiKSAtPlxuICAgIHJldHVybiBjYj8gJ2ZpbGUgbm90IGZvdW5kJyB1bmxlc3MgZmlsZVBhdGg/XG4gICAgc2hvdyAndHJ5aW5nICcgKyBmaWxlUGF0aFxuICAgIEBmaW5kRmlsZUZvclBhdGggQGRhdGEuZGlyZWN0b3JpZXMsIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcmVjdG9yeSkgPT5cblxuICAgICAgaWYgZXJyPyBcbiAgICAgICAgIyBzaG93ICdubyBmaWxlcyBmb3VuZCBmb3IgJyArIGZpbGVQYXRoXG4gICAgICAgIHJldHVybiBjYj8gZXJyXG5cbiAgICAgIGRlbGV0ZSBmaWxlRW50cnkuZW50cnlcbiAgICAgIEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlc1tmaWxlUGF0aF0gPSBcbiAgICAgICAgZmlsZUVudHJ5OiBjaHJvbWUuZmlsZVN5c3RlbS5yZXRhaW5FbnRyeSBmaWxlRW50cnlcbiAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgIGRpcmVjdG9yeTogZGlyZWN0b3J5XG4gICAgICBjYj8gbnVsbCwgQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzW2ZpbGVQYXRoXSwgZGlyZWN0b3J5XG4gICAgICBcblxuXG4gIGZpbmRGaWxlSW5EaXJlY3RvcmllczogKGRpcmVjdG9yaWVzLCBwYXRoLCBjYikgLT5cbiAgICBteURpcnMgPSBkaXJlY3Rvcmllcy5zbGljZSgpIFxuICAgIF9wYXRoID0gcGF0aFxuICAgIF9kaXIgPSBteURpcnMuc2hpZnQoKVxuXG4gICAgQEZTLmdldExvY2FsRmlsZUVudHJ5IF9kaXIsIF9wYXRoLCAoZXJyLCBmaWxlRW50cnkpID0+XG4gICAgICBpZiBlcnI/XG4gICAgICAgIGlmIG15RGlycy5sZW5ndGggPiAwXG4gICAgICAgICAgQGZpbmRGaWxlSW5EaXJlY3RvcmllcyBteURpcnMsIF9wYXRoLCBjYlxuICAgICAgICBlbHNlXG4gICAgICAgICAgY2I/ICdub3QgZm91bmQnXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIF9kaXJcblxuICBmaW5kRmlsZUZvclBhdGg6IChkaXJzLCBwYXRoLCBjYikgLT5cbiAgICBAZmluZEZpbGVJbkRpcmVjdG9yaWVzIGRpcnMsIHBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyZWN0b3J5KSA9PlxuICAgICAgaWYgZXJyP1xuICAgICAgICBpZiBwYXRoIGlzIHBhdGgucmVwbGFjZSgvLio/XFwvLywgJycpXG4gICAgICAgICAgY2I/ICdub3QgZm91bmQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZmluZEZpbGVGb3JQYXRoIGRpcnMsIHBhdGgucmVwbGFjZSgvLio/XFwvLywgJycpLCBjYlxuICAgICAgZWxzZVxuICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBkaXJlY3RvcnlcbiAgXG4gIG1hcEFsbFJlc291cmNlczogKGNiKSAtPlxuICAgIEBnZXRSZXNvdXJjZXMgPT5cbiAgICAgIGRlYnVnZ2VyO1xuICAgICAgbmVlZCA9IEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMubGVuZ3RoXG4gICAgICBmb3VuZCA9IG5vdEZvdW5kID0gMFxuICAgICAgZm9yIGl0ZW0gaW4gQGRhdGEuY3VycmVudFJlc291cmNlc1xuICAgICAgICBsb2NhbFBhdGggPSBAVVJMdG9Mb2NhbFBhdGggaXRlbS51cmxcbiAgICAgICAgaWYgbG9jYWxQYXRoP1xuICAgICAgICAgIEBnZXRGaWxlTWF0Y2ggbG9jYWxQYXRoLCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgICAgICAgbmVlZC0tXG4gICAgICAgICAgICBzaG93IGFyZ3VtZW50c1xuICAgICAgICAgICAgaWYgZXJyPyB0aGVuIG5vdEZvdW5kKytcbiAgICAgICAgICAgIGVsc2UgZm91bmQrKyAgICAgICAgICAgIFxuXG4gICAgICAgICAgICBpZiBuZWVkIGlzIDBcbiAgICAgICAgICAgICAgaWYgZm91bmQgPiAwXG4gICAgICAgICAgICAgICAgY2I/IG51bGwsICdkb25lJ1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2I/ICdub3RoaW5nIGZvdW5kJ1xuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBuZWVkLS1cbiAgICAgICAgICBub3RGb3VuZCsrXG4gICAgICAgICAgaWYgbmVlZCBpcyAwXG4gICAgICAgICAgICBjYj8gJ25vdGhpbmcgZm91bmQnXG5cbiAgc2V0QmFkZ2VUZXh0OiAodGV4dCwgdGFiSWQpIC0+XG4gICAgYmFkZ2VUZXh0ID0gdGV4dCB8fCAnJyArIE9iamVjdC5rZXlzKEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlcykubGVuZ3RoXG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0IFxuICAgICAgdGV4dDpiYWRnZVRleHRcbiAgICAgICMgdGFiSWQ6dGFiSWRcbiAgXG4gIHJlbW92ZUJhZGdlVGV4dDoodGFiSWQpIC0+XG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0IFxuICAgICAgdGV4dDonJ1xuICAgICAgIyB0YWJJZDp0YWJJZFxuXG4gIGxzUjogKGRpciwgb25zdWNjZXNzLCBvbmVycm9yKSAtPlxuICAgIEByZXN1bHRzID0ge31cblxuICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgXG4gICAgICB0b2RvID0gMFxuICAgICAgaWdub3JlID0gLy5naXR8LmlkZWF8bm9kZV9tb2R1bGVzfGJvd2VyX2NvbXBvbmVudHMvXG4gICAgICBkaXZlID0gKGRpciwgcmVzdWx0cykgLT5cbiAgICAgICAgdG9kbysrXG4gICAgICAgIHJlYWRlciA9IGRpci5jcmVhdGVSZWFkZXIoKVxuICAgICAgICByZWFkZXIucmVhZEVudHJpZXMgKGVudHJpZXMpIC0+XG4gICAgICAgICAgdG9kby0tXG4gICAgICAgICAgZm9yIGVudHJ5IGluIGVudHJpZXNcbiAgICAgICAgICAgIGRvIChlbnRyeSkgLT5cbiAgICAgICAgICAgICAgcmVzdWx0c1tlbnRyeS5mdWxsUGF0aF0gPSBlbnRyeVxuICAgICAgICAgICAgICBpZiBlbnRyeS5mdWxsUGF0aC5tYXRjaChpZ25vcmUpIGlzIG51bGxcbiAgICAgICAgICAgICAgICBpZiBlbnRyeS5pc0RpcmVjdG9yeVxuICAgICAgICAgICAgICAgICAgdG9kbysrXG4gICAgICAgICAgICAgICAgICBkaXZlIGVudHJ5LCByZXN1bHRzIFxuICAgICAgICAgICAgICAjIHNob3cgZW50cnlcbiAgICAgICAgICBzaG93ICdvbnN1Y2Nlc3MnIGlmIHRvZG8gaXMgMFxuICAgICAgICAgICMgc2hvdyAnb25zdWNjZXNzJyByZXN1bHRzIGlmIHRvZG8gaXMgMFxuICAgICAgICAsKGVycm9yKSAtPlxuICAgICAgICAgIHRvZG8tLVxuICAgICAgICAgICMgc2hvdyBlcnJvclxuICAgICAgICAgICMgb25lcnJvciBlcnJvciwgcmVzdWx0cyBpZiB0b2RvIGlzIDAgXG5cbiAgICAgICMgY29uc29sZS5sb2cgZGl2ZSBkaXJFbnRyeSwgQHJlc3VsdHMgIFxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb25cblxuXG4iLCJjbGFzcyBDb25maWdcbiAgIyBBUFBfSUQ6ICdjZWNpZmFmcGhlZ2hvZnBmZGtoZWtraWJjaWJoZ2ZlYydcbiAgIyBFWFRFTlNJT05fSUQ6ICdkZGRpbWJuamliamNhZmJva25iZ2hlaGJmYWpnZ2dlcCdcbiAgQVBQX0lEOiAnZGVuZWZkb29mbmtnam1wYmZwa25paHBnZGhhaHBibGgnXG4gIEVYVEVOU0lPTl9JRDogJ2lqY2ptcGVqb25taW1vb2ZiY3BhbGllamhpa2Flb21oJyAgXG4gIFNFTEZfSUQ6IGNocm9tZS5ydW50aW1lLmlkXG4gIGlzQ29udGVudFNjcmlwdDogbG9jYXRpb24ucHJvdG9jb2wgaXNudCAnY2hyb21lLWV4dGVuc2lvbjonXG4gIEVYVF9JRDogbnVsbFxuICBFWFRfVFlQRTogbnVsbFxuICBcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQEVYVF9JRCA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiBARVhURU5TSU9OX0lEIGVsc2UgQEFQUF9JRFxuICAgIEBFWFRfVFlQRSA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG4gICAgQFNFTEZfVFlQRSA9IGlmIEBBUFBfSUQgaXNudCBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcblxuICB3cmFwSW5ib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgICBfa2xhcyA9IG9ialxuICAgICAgQExJU1RFTi5FeHQgZm5hbWUsIChhcmdzKSAtPlxuICAgICAgICBpZiBhcmdzPy5pc1Byb3h5P1xuICAgICAgICAgIGlmIHR5cGVvZiBhcmd1bWVudHNbMV0gaXMgXCJmdW5jdGlvblwiXG4gICAgICAgICAgICBpZiBhcmdzLmFyZ3VtZW50cz8ubGVuZ3RoID49IDBcbiAgICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIGFyZ3MuYXJndW1lbnRzLmNvbmNhdCBhcmd1bWVudHNbMV0gXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBbXS5jb25jYXQgYXJndW1lbnRzWzFdXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgYXJndW1lbnRzXG5cbiAgd3JhcE9iakluYm91bmQ6IChvYmopIC0+XG4gICAgKG9ialtrZXldID0gQHdyYXBJbmJvdW5kIG9iaiwgb2JqLmNvbnN0cnVjdG9yLm5hbWUgKyAnLicgKyBrZXksIG9ialtrZXldKSBmb3Iga2V5IG9mIG9iaiB3aGVuIHR5cGVvZiBvYmpba2V5XSBpcyBcImZ1bmN0aW9uXCJcbiAgICBvYmpcblxuICB3cmFwT3V0Ym91bmQ6IChvYmosIGZuYW1lLCBmKSAtPlxuICAgIC0+XG4gICAgICBtc2cgPSB7fVxuICAgICAgbXNnW2ZuYW1lXSA9IFxuICAgICAgICBpc1Byb3h5OnRydWVcbiAgICAgICAgYXJndW1lbnRzOkFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuICAgICAgbXNnW2ZuYW1lXS5pc1Byb3h5ID0gdHJ1ZVxuICAgICAgX2FyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcblxuICAgICAgaWYgX2FyZ3MubGVuZ3RoIGlzIDBcbiAgICAgICAgbXNnW2ZuYW1lXS5hcmd1bWVudHMgPSB1bmRlZmluZWQgXG4gICAgICAgIHJldHVybiBATVNHLkV4dCBtc2csICgpIC0+IHVuZGVmaW5lZFxuXG4gICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cyA9IF9hcmdzXG5cbiAgICAgIGNhbGxiYWNrID0gbXNnW2ZuYW1lXS5hcmd1bWVudHMucG9wKClcbiAgICAgIGlmIHR5cGVvZiBjYWxsYmFjayBpc250IFwiZnVuY3Rpb25cIlxuICAgICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cy5wdXNoIGNhbGxiYWNrXG4gICAgICAgIEBNU0cuRXh0IG1zZywgKCkgLT4gdW5kZWZpbmVkXG4gICAgICBlbHNlXG4gICAgICAgIEBNU0cuRXh0IG1zZywgKCkgPT5cbiAgICAgICAgICBhcmd6ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG4gICAgICAgICAgIyBwcm94eUFyZ3MgPSBbaXNQcm94eTphcmd6XVxuICAgICAgICAgIGlmIGFyZ3o/Lmxlbmd0aCA+IDAgYW5kIGFyZ3pbMF0/LmlzUHJveHk/XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseSBALCBhcmd6WzBdLmlzUHJveHkgXG5cbiAgd3JhcE9iak91dGJvdW5kOiAob2JqKSAtPlxuICAgIChvYmpba2V5XSA9IEB3cmFwT3V0Ym91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpZyIsImdldEdsb2JhbCA9IC0+XG4gIF9nZXRHbG9iYWwgPSAtPlxuICAgIHRoaXNcblxuICBfZ2V0R2xvYmFsKClcblxucm9vdCA9IGdldEdsb2JhbCgpXG5cbiMgcm9vdC5hcHAgPSBhcHAgPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuIyBhcHAgPSBuZXcgbGliLkFwcGxpY2F0aW9uXG5jaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRQb3B1cCBwb3B1cDpcInBvcHVwLmh0bWxcIlxuXG5cblxuQXBwbGljYXRpb24gPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuUmVkaXJlY3QgPSByZXF1aXJlICcuLi8uLi9yZWRpcmVjdC5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi4vLi4vc3RvcmFnZS5jb2ZmZWUnXG5GaWxlU3lzdGVtID0gcmVxdWlyZSAnLi4vLi4vZmlsZXN5c3RlbS5jb2ZmZWUnXG5TZXJ2ZXIgPSByZXF1aXJlICcuLi8uLi9zZXJ2ZXIuY29mZmVlJ1xuXG5yZWRpciA9IG5ldyBSZWRpcmVjdFxuXG5hcHAgPSByb290LmFwcCA9IG5ldyBBcHBsaWNhdGlvblxuICBSZWRpcmVjdDogcmVkaXJcbiAgU3RvcmFnZTogU3RvcmFnZVxuICBGUzogRmlsZVN5c3RlbVxuICBTZXJ2ZXI6IFNlcnZlclxuICBcbmFwcC5TdG9yYWdlLnJldHJpZXZlQWxsKG51bGwpXG4jICAgYXBwLlN0b3JhZ2UuZGF0YVtrXSA9IGRhdGFba10gZm9yIGsgb2YgZGF0YVxuICBcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lciAodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT5cbiAgIyBpZiByZWRpci5kYXRhW3RhYklkXT8uaXNPblxuICAjICAgYXBwLm1hcEFsbFJlc291cmNlcyAoKSA9PlxuICAjICAgICBjaHJvbWUudGFicy5zZXRCYWRnZVRleHQgXG4gICMgICAgICAgdGV4dDpPYmplY3Qua2V5cyhhcHAuY3VycmVudEZpbGVNYXRjaGVzKS5sZW5ndGhcbiAgIyAgICAgICB0YWJJZDp0YWJJZFxuICAgICBcblxuXG4iLCJMSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5cbmNsYXNzIEZpbGVTeXN0ZW1cbiAgYXBpOiBjaHJvbWUuZmlsZVN5c3RlbVxuICByZXRhaW5lZERpcnM6IHt9XG4gIExJU1RFTjogTElTVEVOLmdldCgpIFxuICBNU0c6IE1TRy5nZXQoKVxuICBwbGF0Zm9ybTonJ1xuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBjaHJvbWUucnVudGltZS5nZXRQbGF0Zm9ybUluZm8gKGluZm8pID0+XG4gICAgICBAcGxhdGZvcm0gPSBpbmZvXG4gICMgQGRpcnM6IG5ldyBEaXJlY3RvcnlTdG9yZVxuICAjIGZpbGVUb0FycmF5QnVmZmVyOiAoYmxvYiwgb25sb2FkLCBvbmVycm9yKSAtPlxuICAjICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAjICAgcmVhZGVyLm9ubG9hZCA9IG9ubG9hZFxuXG4gICMgICByZWFkZXIub25lcnJvciA9IG9uZXJyb3JcblxuICAjICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGJsb2JcblxuICByZWFkRmlsZTogKGRpckVudHJ5LCBwYXRoLCBjYikgLT5cbiAgICAjIHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcLy9nLCdcXFxcJykgaWYgcGxhdGZvcm0gaXMgJ3dpbidcbiAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBwYXRoLFxuICAgICAgKGVyciwgZmlsZUVudHJ5KSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgZXJyPyB0aGVuIHJldHVybiBjYj8gZXJyXG5cbiAgICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZmlsZVxuICAgICAgICAsKGVycikgPT4gY2I/IGVyclxuXG4gIGdldEZpbGVFbnRyeTogKGRpckVudHJ5LCBwYXRoLCBjYikgLT5cbiAgICAjIHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcLy9nLCdcXFxcJykgaWYgcGxhdGZvcm0gaXMgJ3dpbidcbiAgICBkaXJFbnRyeS5nZXRGaWxlIHBhdGgsIHt9LCAoZmlsZUVudHJ5KSA9PlxuICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeVxuICAgICwoZXJyKSA9PiBjYj8gZXJyXG5cbiAgIyBvcGVuRGlyZWN0b3J5OiAoY2FsbGJhY2spIC0+XG4gIG9wZW5EaXJlY3Rvcnk6IChkaXJlY3RvcnlFbnRyeSwgY2IpIC0+XG4gICMgQGFwaS5jaG9vc2VFbnRyeSB0eXBlOidvcGVuRGlyZWN0b3J5JywgKGRpcmVjdG9yeUVudHJ5LCBmaWxlcykgPT5cbiAgICBAYXBpLmdldERpc3BsYXlQYXRoIGRpcmVjdG9yeUVudHJ5LCAocGF0aE5hbWUpID0+XG4gICAgICBkaXIgPVxuICAgICAgICAgIHJlbFBhdGg6IGRpcmVjdG9yeUVudHJ5LmZ1bGxQYXRoICMucmVwbGFjZSgnLycgKyBkaXJlY3RvcnlFbnRyeS5uYW1lLCAnJylcbiAgICAgICAgICBkaXJlY3RvcnlFbnRyeUlkOiBAYXBpLnJldGFpbkVudHJ5KGRpcmVjdG9yeUVudHJ5KVxuICAgICAgICAgIGVudHJ5OiBkaXJlY3RvcnlFbnRyeVxuICAgICAgY2I/IG51bGwsIHBhdGhOYW1lLCBkaXJcbiAgICAgICAgICAjIEBnZXRPbmVEaXJMaXN0IGRpclxuICAgICAgICAgICMgU3RvcmFnZS5zYXZlICdkaXJlY3RvcmllcycsIEBzY29wZS5kaXJlY3RvcmllcyAocmVzdWx0KSAtPlxuXG4gIGdldExvY2FsRmlsZUVudHJ5OiAoZGlyLCBmaWxlUGF0aCwgY2IpID0+IFxuICAgICMgZmlsZVBhdGggPSBmaWxlUGF0aC5yZXBsYWNlKC9cXC8vZywnXFxcXCcpIGlmIHBsYXRmb3JtIGlzICd3aW4nXG4gICAgZGlyRW50cnkgPSBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsICgpIC0+XG4gICAgaWYgbm90IGRpckVudHJ5P1xuICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIGZpbGVQYXRoLCBjYlxuICAgIGVsc2VcbiAgICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIGZpbGVQYXRoLCBjYlxuXG5cblxuICAjIGdldExvY2FsRmlsZTogKGRpciwgZmlsZVBhdGgsIGNiLCBlcnJvcikgPT4gXG4gICMgIyBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgIyAjICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAjICMgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICMgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgIyAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgIyAgICAgLChfZXJyb3IpID0+IGVycm9yKF9lcnJvcilcbiAgIyAjIGVsc2VcbiAgIyAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAjICAgICAjIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiAgIyAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCwgKGVyciwgZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgIGlmIGVycj8gdGhlbiBjYj8gZXJyXG4gICMgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZmlsZVxuICAjICAgLChfZXJyb3IpID0+IGNiPyhfZXJyb3IpXG5cbiAgICAgICMgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIHN1Y2Nlc3MsXG4gICAgICAjICAgICAoZXJyKSA9PlxuICAgICAgIyAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggaW5mbywgY2JcblxuICAjIGZpbmRGaWxlRm9yUGF0aDogKGluZm8sIGNiKSA9PlxuICAjICAgICBAZmluZEZpbGVGb3JRdWVyeVN0cmluZyBpbmZvLnVyaSwgY2IsIGluZm8ucmVmZXJlclxuXG4gICMgZmluZEZpbGVGb3JRdWVyeVN0cmluZzogKF91cmwsIGNiLCBlcnJvciwgcmVmZXJlcikgPT5cbiAgIyAgICAgdXJsID0gZGVjb2RlVVJJQ29tcG9uZW50KF91cmwpLnJlcGxhY2UgLy4qP3NscmVkaXJcXD0vLCAnJ1xuXG4gICMgICAgIG1hdGNoID0gaXRlbSBmb3IgaXRlbSBpbiBAbWFwcyB3aGVuIHVybC5tYXRjaChuZXcgUmVnRXhwKGl0ZW0udXJsKSk/IGFuZCBpdGVtLnVybD8gYW5kIG5vdCBtYXRjaD9cblxuICAjICAgICBpZiBtYXRjaD9cbiAgIyAgICAgICAgIGlmIHJlZmVyZXI/XG4gICMgICAgICAgICAgICAgZmlsZVBhdGggPSB1cmwubWF0Y2goLy4qXFwvXFwvLio/XFwvKC4qKS8pP1sxXVxuICAjICAgICAgICAgZWxzZVxuICAjICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXRjaC51cmwpLCBtYXRjaC5yZWdleFJlcGxcblxuICAjICAgICAgICAgZmlsZVBhdGgucmVwbGFjZSAnLycsICdcXFxcJyBpZiBwbGF0Zm9ybSBpcyAnd2luJ1xuXG4gICMgICAgICAgICBkaXIgPSBAU3RvcmFnZS5kYXRhLmRpcmVjdG9yaWVzW21hdGNoLmRpcmVjdG9yeV1cblxuICAjICAgICAgICAgaWYgbm90IGRpcj8gdGhlbiByZXR1cm4gZXJyICdubyBtYXRjaCdcblxuICAjICAgICAgICAgaWYgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0/XG4gICMgICAgICAgICAgICAgZGlyRW50cnkgPSBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXVxuICAjICAgICAgICAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgICAgICBlbHNlXG4gICMgICAgICAgICAgICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICMgICAgICAgICAgICAgICAgIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdID0gZGlyRW50cnlcbiAgIyAgICAgICAgICAgICAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAgICAgICAgICAgICAgICAgICAgIChmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAgICAgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICBlbHNlXG4gICMgICAgICAgICBlcnJvcigpXG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVN5c3RlbSIsIkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcblxuY2xhc3MgTElTVEVOIGV4dGVuZHMgQ29uZmlnXG4gIGxvY2FsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlXG4gICAgbGlzdGVuZXJzOnt9XG4gICAgIyByZXNwb25zZUNhbGxlZDpmYWxzZVxuICBleHRlcm5hbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsXG4gICAgbGlzdGVuZXJzOnt9XG4gICAgIyByZXNwb25zZUNhbGxlZDpmYWxzZVxuICBpbnN0YW5jZSA9IG51bGxcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcblxuICAgIEBsb2NhbC5hcGkuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwuYXBpPy5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgQGdldDogKCkgLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgTElTVEVOXG5cbiAgc2V0UG9ydDogKHBvcnQpIC0+XG4gICAgQHBvcnQgPSBwb3J0XG4gICAgcG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gIExvY2FsOiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgQGxvY2FsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgRXh0OiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgIyBzaG93ICdhZGRpbmcgZXh0IGxpc3RlbmVyIGZvciAnICsgbWVzc2FnZVxuICAgIEBleHRlcm5hbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIF9vbk1lc3NhZ2VFeHRlcm5hbDogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHJlc3BvbnNlU3RhdHVzID0gY2FsbGVkOmZhbHNlXG5cbiAgICBfc2VuZFJlc3BvbnNlID0gKHdoYXRldmVyLi4uKSA9PlxuICAgICAgdHJ5XG4gICAgICAgICMgd2hhdGV2ZXIuc2hpZnQoKSBpZiB3aGF0ZXZlclswXSBpcyBudWxsIGFuZCB3aGF0ZXZlclsxXT9cbiAgICAgICAgc2VuZFJlc3BvbnNlLmFwcGx5IG51bGwscHJveHlBcmdzID0gW2lzUHJveHk6d2hhdGV2ZXJdXG5cbiAgICAgIGNhdGNoIGVcbiAgICAgICAgdW5kZWZpbmVkICMgZXJyb3IgYmVjYXVzZSBubyByZXNwb25zZSB3YXMgcmVxdWVzdGVkIGZyb20gdGhlIE1TRywgZG9uJ3QgY2FyZVxuICAgICAgcmVzcG9uc2VTdGF0dXMuY2FsbGVkID0gdHJ1ZVxuICAgICAgXG4gICAgIyAoc2hvdyBcIjw9PSBHT1QgRVhURVJOQUwgTUVTU0FHRSA9PSAjeyBARVhUX1RZUEUgfSA9PVwiICsgX2tleSkgZm9yIF9rZXkgb2YgcmVxdWVzdFxuICAgIGlmIHNlbmRlci5pZD8gXG4gICAgICBpZiBzZW5kZXIuaWQgaXNudCBARVhUX0lEICNhbmQgc2VuZGVyLmNvbnN0cnVjdG9yLm5hbWUgaXNudCAnUG9ydCdcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgX3NlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcbiAgICBcbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkICMgZm9yIHN5bmNocm9ub3VzIHNlbmRSZXNwb25zZVxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgX29uTWVzc2FnZTogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHJlc3BvbnNlU3RhdHVzID0gY2FsbGVkOmZhbHNlXG4gICAgX3NlbmRSZXNwb25zZSA9ID0+XG4gICAgICB0cnlcbiAgICAgICAgIyBzaG93ICdjYWxsaW5nIHNlbmRyZXNwb25zZSdcbiAgICAgICAgc2VuZFJlc3BvbnNlLmFwcGx5IHRoaXMsYXJndW1lbnRzXG4gICAgICBjYXRjaCBlXG4gICAgICAgICMgc2hvdyBlXG4gICAgICByZXNwb25zZVN0YXR1cy5jYWxsZWQgPSB0cnVlXG5cbiAgICAjIChzaG93IFwiPD09IEdPVCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgQGxvY2FsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG5cbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkXG4gICAgICAjIHNob3cgJ3JldHVybmluZyB0cnVlJ1xuICAgICAgcmV0dXJuIHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBMSVNURU4iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIE1TRyBleHRlbmRzIENvbmZpZ1xuICBpbnN0YW5jZSA9IG51bGxcbiAgcG9ydDpudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG5cbiAgQGdldDogKCkgLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgTVNHXG5cbiAgQGNyZWF0ZVBvcnQ6ICgpIC0+XG5cbiAgc2V0UG9ydDogKHBvcnQpIC0+XG4gICAgQHBvcnQgPSBwb3J0XG5cbiAgTG9jYWw6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIChzaG93IFwiPT0gTUVTU0FHRSAjeyBfa2V5IH0gPT0+XCIpIGZvciBfa2V5IG9mIG1lc3NhZ2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBtZXNzYWdlLCByZXNwb25kXG4gIEV4dDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFIEVYVEVSTkFMICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIEBFWFRfSUQsIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0UG9ydDogKG1lc3NhZ2UpIC0+XG4gICAgdHJ5XG4gICAgICBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG4gICAgY2F0Y2hcbiAgICAgIHNob3cgJ2Vycm9yJ1xuICAgICAgIyBAcG9ydCA9IGNocm9tZS5ydW50aW1lLmNvbm5lY3QgQEVYVF9JRCBcbiAgICAgICMgQHBvcnQucG9zdE1lc3NhZ2UgbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1TRyIsIi8qKlxuICogREVWRUxPUEVEIEJZXG4gKiBHSUwgTE9QRVMgQlVFTk9cbiAqIGdpbGJ1ZW5vLm1haWxAZ21haWwuY29tXG4gKlxuICogV09SS1MgV0lUSDpcbiAqIElFIDkrLCBGRiA0KywgU0YgNSssIFdlYktpdCwgQ0ggNyssIE9QIDEyKywgQkVTRU4sIFJoaW5vIDEuNytcbiAqXG4gKiBGT1JLOlxuICogaHR0cHM6Ly9naXRodWIuY29tL21lbGFua2UvV2F0Y2guSlNcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgICAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgICAgICAvLyBsaWtlIE5vZGUuXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgICAgICB3aW5kb3cuV2F0Y2hKUyA9IGZhY3RvcnkoKTtcbiAgICAgICAgd2luZG93LndhdGNoID0gd2luZG93LldhdGNoSlMud2F0Y2g7XG4gICAgICAgIHdpbmRvdy51bndhdGNoID0gd2luZG93LldhdGNoSlMudW53YXRjaDtcbiAgICAgICAgd2luZG93LmNhbGxXYXRjaGVycyA9IHdpbmRvdy5XYXRjaEpTLmNhbGxXYXRjaGVycztcbiAgICB9XG59KGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBXYXRjaEpTID0ge1xuICAgICAgICBub01vcmU6IGZhbHNlXG4gICAgfSxcbiAgICBsZW5ndGhzdWJqZWN0cyA9IFtdO1xuXG4gICAgdmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiAoZnVuY3Rpb25Ub0NoZWNrKSB7XG4gICAgICAgICAgICB2YXIgZ2V0VHlwZSA9IHt9O1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uVG9DaGVjayAmJiBnZXRUeXBlLnRvU3RyaW5nLmNhbGwoZnVuY3Rpb25Ub0NoZWNrKSA9PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH07XG5cbiAgICB2YXIgaXNJbnQgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4geCAlIDEgPT09IDA7XG4gICAgfTtcblxuICAgIHZhciBpc0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgdmFyIGdldE9iakRpZmYgPSBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgdmFyIGFwbHVzID0gW10sXG4gICAgICAgIGJwbHVzID0gW107XG5cbiAgICAgICAgaWYoISh0eXBlb2YgYSA9PSBcInN0cmluZ1wiKSAmJiAhKHR5cGVvZiBiID09IFwic3RyaW5nXCIpKXtcblxuICAgICAgICAgICAgaWYgKGlzQXJyYXkoYSkpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYltpXSA9PT0gdW5kZWZpbmVkKSBhcGx1cy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGEpe1xuICAgICAgICAgICAgICAgICAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYltpXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBsdXMucHVzaChpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzQXJyYXkoYikpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqPTA7IGo8Yi5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYVtqXSA9PT0gdW5kZWZpbmVkKSBicGx1cy5wdXNoKGopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBqIGluIGIpe1xuICAgICAgICAgICAgICAgICAgICBpZiAoYi5oYXNPd25Qcm9wZXJ0eShqKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYVtqXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnBsdXMucHVzaChqKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhZGRlZDogYXBsdXMsXG4gICAgICAgICAgICByZW1vdmVkOiBicGx1c1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBjbG9uZSA9IGZ1bmN0aW9uKG9iail7XG5cbiAgICAgICAgaWYgKG51bGwgPT0gb2JqIHx8IFwib2JqZWN0XCIgIT0gdHlwZW9mIG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb3B5ID0gb2JqLmNvbnN0cnVjdG9yKCk7XG5cbiAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBvYmopIHtcbiAgICAgICAgICAgIGNvcHlbYXR0cl0gPSBvYmpbYXR0cl07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29weTtcblxuICAgIH1cblxuICAgIHZhciBkZWZpbmVHZXRBbmRTZXQgPSBmdW5jdGlvbiAob2JqLCBwcm9wTmFtZSwgZ2V0dGVyLCBzZXR0ZXIpIHtcbiAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgT2JqZWN0Lm9ic2VydmUob2JqW3Byb3BOYW1lXSwgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgc2V0dGVyKGRhdGEpOyAvL1RPRE86IGFkYXB0IG91ciBjYWxsYmFjayBkYXRhIHRvIG1hdGNoIE9iamVjdC5vYnNlcnZlIGRhdGEgc3BlY1xuICAgICAgICAgICAgfSk7IFxuXG4gICAgICAgIH0gY2F0Y2goZSkge1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wTmFtZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldDogZ2V0dGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldDogc2V0dGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaChlMikge1xuICAgICAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5fX2RlZmluZUdldHRlcl9fLmNhbGwob2JqLCBwcm9wTmFtZSwgZ2V0dGVyKTtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5fX2RlZmluZVNldHRlcl9fLmNhbGwob2JqLCBwcm9wTmFtZSwgc2V0dGVyKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoKGUzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIndhdGNoSlMgZXJyb3I6IGJyb3dzZXIgbm90IHN1cHBvcnRlZCA6L1wiKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBkZWZpbmVQcm9wID0gZnVuY3Rpb24gKG9iaiwgcHJvcE5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wTmFtZSwge1xuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgb2JqW3Byb3BOYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciB3YXRjaCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbihhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB3YXRjaEFsbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoYXJndW1lbnRzWzFdKSkge1xuICAgICAgICAgICAgd2F0Y2hNYW55LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3YXRjaE9uZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG5cbiAgICB2YXIgd2F0Y2hBbGwgPSBmdW5jdGlvbiAob2JqLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCkge1xuXG4gICAgICAgIGlmICgodHlwZW9mIG9iaiA9PSBcInN0cmluZ1wiKSB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByb3BzID0gW107XG5cblxuICAgICAgICBpZihpc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgPSAwOyBwcm9wIDwgb2JqLmxlbmd0aDsgcHJvcCsrKSB7IC8vZm9yIGVhY2ggaXRlbSBpZiBvYmogaXMgYW4gYXJyYXlcbiAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3ApOyAvL3B1dCBpbiB0aGUgcHJvcHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AyIGluIG9iaikgeyAvL2ZvciBlYWNoIGF0dHJpYnV0ZSBpZiBvYmogaXMgYW4gb2JqZWN0XG4gICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wMik7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHdhdGNoTWFueShvYmosIHByb3BzLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCk7IC8vd2F0Y2ggYWxsIGl0ZW1zIG9mIHRoZSBwcm9wc1xuXG4gICAgICAgIGlmIChhZGROUmVtb3ZlKSB7XG4gICAgICAgICAgICBwdXNoVG9MZW5ndGhTdWJqZWN0cyhvYmosIFwiJCR3YXRjaGxlbmd0aHN1YmplY3Ryb290XCIsIHdhdGNoZXIsIGxldmVsKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIHZhciB3YXRjaE1hbnkgPSBmdW5jdGlvbiAob2JqLCBwcm9wcywgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpIHtcblxuICAgICAgICBpZiAoKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxwcm9wcy5sZW5ndGg7IGkrKykgeyAvL3dhdGNoIGVhY2ggcHJvcGVydHlcbiAgICAgICAgICAgIHZhciBwcm9wID0gcHJvcHNbaV07XG4gICAgICAgICAgICB3YXRjaE9uZShvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB3YXRjaE9uZSA9IGZ1bmN0aW9uIChvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKSB7XG5cbiAgICAgICAgaWYgKCh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZihpc0Z1bmN0aW9uKG9ialtwcm9wXSkpIHsgLy9kb250IHdhdGNoIGlmIGl0IGlzIGEgZnVuY3Rpb25cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKG9ialtwcm9wXSAhPSBudWxsICYmIChsZXZlbCA9PT0gdW5kZWZpbmVkIHx8IGxldmVsID4gMCkpe1xuICAgICAgICAgICAgd2F0Y2hBbGwob2JqW3Byb3BdLCB3YXRjaGVyLCBsZXZlbCE9PXVuZGVmaW5lZD8gbGV2ZWwtMSA6IGxldmVsLG51bGwsIHBhdGggKyAnLicgKyBwcm9wKTsgLy9yZWN1cnNpdmVseSB3YXRjaCBhbGwgYXR0cmlidXRlcyBvZiB0aGlzXG4gICAgICAgIH1cblxuICAgICAgICBkZWZpbmVXYXRjaGVyKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIHBhdGgpO1xuXG4gICAgICAgIGlmKGFkZE5SZW1vdmUgJiYgKGxldmVsID09PSB1bmRlZmluZWQgfHwgbGV2ZWwgPiAwKSl7XG4gICAgICAgICAgICBwdXNoVG9MZW5ndGhTdWJqZWN0cyhvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB1bndhdGNoID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHVud2F0Y2hBbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHVud2F0Y2hNYW55LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1bndhdGNoT25lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgdW53YXRjaEFsbCA9IGZ1bmN0aW9uIChvYmosIHdhdGNoZXIpIHtcblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgU3RyaW5nIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgPSAwOyBwcm9wIDwgb2JqLmxlbmd0aDsgcHJvcCsrKSB7IC8vZm9yIGVhY2ggaXRlbSBpZiBvYmogaXMgYW4gYXJyYXlcbiAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3ApOyAvL3B1dCBpbiB0aGUgcHJvcHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVud2F0Y2hNYW55KG9iaiwgcHJvcHMsIHdhdGNoZXIpOyAvL3dhdGNoIGFsbCBpdGVucyBvZiB0aGUgcHJvcHNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB1bndhdGNoUHJvcHNJbk9iamVjdCA9IGZ1bmN0aW9uIChvYmoyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb3BzID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcDIgaW4gb2JqMikgeyAvL2ZvciBlYWNoIGF0dHJpYnV0ZSBpZiBvYmogaXMgYW4gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmoyLmhhc093blByb3BlcnR5KHByb3AyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9iajJbcHJvcDJdIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW53YXRjaFByb3BzSW5PYmplY3Qob2JqMltwcm9wMl0pOyAvL3JlY3VycyBpbnRvIG9iamVjdCBwcm9wc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3AyKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdW53YXRjaE1hbnkob2JqMiwgcHJvcHMsIHdhdGNoZXIpOyAvL3Vud2F0Y2ggYWxsIG9mIHRoZSBwcm9wc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHVud2F0Y2hQcm9wc0luT2JqZWN0KG9iaik7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICB2YXIgdW53YXRjaE1hbnkgPSBmdW5jdGlvbiAob2JqLCBwcm9wcywgd2F0Y2hlcikge1xuXG4gICAgICAgIGZvciAodmFyIHByb3AyIGluIHByb3BzKSB7IC8vd2F0Y2ggZWFjaCBhdHRyaWJ1dGUgb2YgXCJwcm9wc1wiIGlmIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHByb3AyKSkge1xuICAgICAgICAgICAgICAgIHVud2F0Y2hPbmUob2JqLCBwcm9wc1twcm9wMl0sIHdhdGNoZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBkZWZpbmVXYXRjaGVyID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIHBhdGgpIHtcblxuICAgICAgICB2YXIgdmFsID0gb2JqW3Byb3BdO1xuXG4gICAgICAgIHdhdGNoRnVuY3Rpb25zKG9iaiwgcHJvcCk7XG5cbiAgICAgICAgaWYgKCFvYmoud2F0Y2hlcnMpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3Aob2JqLCBcIndhdGNoZXJzXCIsIHt9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCFvYmouX3BhdGgpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3Aob2JqLCBcIl9wYXRoXCIsIHBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFvYmoud2F0Y2hlcnNbcHJvcF0pIHtcbiAgICAgICAgICAgIG9iai53YXRjaGVyc1twcm9wXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPG9iai53YXRjaGVyc1twcm9wXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYob2JqLndhdGNoZXJzW3Byb3BdW2ldID09PSB3YXRjaGVyKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIG9iai53YXRjaGVyc1twcm9wXS5wdXNoKHdhdGNoZXIpOyAvL2FkZCB0aGUgbmV3IHdhdGNoZXIgaW4gdGhlIHdhdGNoZXJzIGFycmF5XG5cblxuICAgICAgICB2YXIgZ2V0dGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIHZhciBzZXR0ZXIgPSBmdW5jdGlvbiAobmV3dmFsKSB7XG4gICAgICAgICAgICB2YXIgb2xkdmFsID0gdmFsO1xuICAgICAgICAgICAgdmFsID0gbmV3dmFsO1xuXG4gICAgICAgICAgICBpZiAobGV2ZWwgIT09IDAgJiYgb2JqW3Byb3BdKXtcbiAgICAgICAgICAgICAgICAvLyB3YXRjaCBzdWIgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgIHdhdGNoQWxsKG9ialtwcm9wXSwgd2F0Y2hlciwgKGxldmVsPT09dW5kZWZpbmVkKT9sZXZlbDpsZXZlbC0xKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2F0Y2hGdW5jdGlvbnMob2JqLCBwcm9wKTtcblxuICAgICAgICAgICAgaWYgKCFXYXRjaEpTLm5vTW9yZSl7XG4gICAgICAgICAgICAgICAgLy9pZiAoSlNPTi5zdHJpbmdpZnkob2xkdmFsKSAhPT0gSlNPTi5zdHJpbmdpZnkobmV3dmFsKSkge1xuICAgICAgICAgICAgICAgIGlmIChvbGR2YWwgIT09IG5ld3ZhbCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBcInNldFwiLCBuZXd2YWwsIG9sZHZhbCk7XG4gICAgICAgICAgICAgICAgICAgIFdhdGNoSlMubm9Nb3JlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGRlZmluZUdldEFuZFNldChvYmosIHByb3AsIGdldHRlciwgc2V0dGVyKTtcblxuICAgIH07XG5cbiAgICB2YXIgY2FsbFdhdGNoZXJzID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgYWN0aW9uLCBuZXd2YWwsIG9sZHZhbCkge1xuICAgICAgICBpZiAocHJvcCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB3cj0wOyB3cjxvYmoud2F0Y2hlcnNbcHJvcF0ubGVuZ3RoOyB3cisrKSB7XG4gICAgICAgICAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdW3dyXS5jYWxsKG9iaiwgcHJvcCwgYWN0aW9uLCBuZXd2YWwsIG9sZHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIG9iaikgey8vY2FsbCBhbGxcbiAgICAgICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxXYXRjaGVycyhvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBAdG9kbyBjb2RlIHJlbGF0ZWQgdG8gXCJ3YXRjaEZ1bmN0aW9uc1wiIGlzIGNlcnRhaW5seSBidWdneVxuICAgIHZhciBtZXRob2ROYW1lcyA9IFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NsaWNlJywgJ3Vuc2hpZnQnLCAnc3BsaWNlJ107XG4gICAgdmFyIGRlZmluZUFycmF5TWV0aG9kV2F0Y2hlciA9IGZ1bmN0aW9uIChvYmosIHByb3AsIG9yaWdpbmFsLCBtZXRob2ROYW1lKSB7XG4gICAgICAgIGRlZmluZVByb3Aob2JqW3Byb3BdLCBtZXRob2ROYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBvcmlnaW5hbC5hcHBseShvYmpbcHJvcF0sIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB3YXRjaE9uZShvYmosIG9ialtwcm9wXSk7XG4gICAgICAgICAgICBpZiAobWV0aG9kTmFtZSAhPT0gJ3NsaWNlJykge1xuICAgICAgICAgICAgICAgIGNhbGxXYXRjaGVycyhvYmosIHByb3AsIG1ldGhvZE5hbWUsYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciB3YXRjaEZ1bmN0aW9ucyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkge1xuXG4gICAgICAgIGlmICgoIW9ialtwcm9wXSkgfHwgKG9ialtwcm9wXSBpbnN0YW5jZW9mIFN0cmluZykgfHwgKCFpc0FycmF5KG9ialtwcm9wXSkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gbWV0aG9kTmFtZXMubGVuZ3RoLCBtZXRob2ROYW1lOyBpLS07KSB7XG4gICAgICAgICAgICBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICAgICAgICBkZWZpbmVBcnJheU1ldGhvZFdhdGNoZXIob2JqLCBwcm9wLCBvYmpbcHJvcF1bbWV0aG9kTmFtZV0sIG1ldGhvZE5hbWUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHVud2F0Y2hPbmUgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCB3YXRjaGVyKSB7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxvYmoud2F0Y2hlcnNbcHJvcF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB3ID0gb2JqLndhdGNoZXJzW3Byb3BdW2ldO1xuXG4gICAgICAgICAgICBpZih3ID09IHdhdGNoZXIpIHtcbiAgICAgICAgICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0uc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVtb3ZlRnJvbUxlbmd0aFN1YmplY3RzKG9iaiwgcHJvcCwgd2F0Y2hlcik7XG4gICAgfTtcblxuICAgIHZhciBsb29wID0gZnVuY3Rpb24oKXtcblxuICAgICAgICBmb3IodmFyIGk9MDsgaTxsZW5ndGhzdWJqZWN0cy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICB2YXIgc3ViaiA9IGxlbmd0aHN1YmplY3RzW2ldO1xuXG4gICAgICAgICAgICBpZiAoc3Viai5wcm9wID09PSBcIiQkd2F0Y2hsZW5ndGhzdWJqZWN0cm9vdFwiKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlmZmVyZW5jZSA9IGdldE9iakRpZmYoc3Viai5vYmosIHN1YmouYWN0dWFsKTtcblxuICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQubGVuZ3RoIHx8IGRpZmZlcmVuY2UucmVtb3ZlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkICE9IGRpZmZlcmVuY2UucmVtb3ZlZCAmJiAoZGlmZmVyZW5jZS5hZGRlZFswXSAhPSBkaWZmZXJlbmNlLnJlbW92ZWRbMF0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hNYW55KHN1Ymoub2JqLCBkaWZmZXJlbmNlLmFkZGVkLCBzdWJqLndhdGNoZXIsIHN1YmoubGV2ZWwgLSAxLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgc3Viai53YXRjaGVyLmNhbGwoc3Viai5vYmosIFwicm9vdFwiLCBcImRpZmZlcmVudGF0dHJcIiwgZGlmZmVyZW5jZSwgc3Viai5hY3R1YWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN1YmouYWN0dWFsID0gY2xvbmUoc3Viai5vYmopO1xuXG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYoc3Viai5vYmpbc3Viai5wcm9wXSA9PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdmFyIGRpZmZlcmVuY2UgPSBnZXRPYmpEaWZmKHN1Ymoub2JqW3N1YmoucHJvcF0sIHN1YmouYWN0dWFsKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKGRpZmZlcmVuY2UuYWRkZWQubGVuZ3RoIHx8IGRpZmZlcmVuY2UucmVtb3ZlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqPTA7IGo8c3Viai5vYmoud2F0Y2hlcnNbc3Viai5wcm9wXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoTWFueShzdWJqLm9ialtzdWJqLnByb3BdLCBkaWZmZXJlbmNlLmFkZGVkLCBzdWJqLm9iai53YXRjaGVyc1tzdWJqLnByb3BdW2pdLCBzdWJqLmxldmVsIC0gMSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMoc3Viai5vYmosIHN1YmoucHJvcCwgXCJkaWZmZXJlbnRhdHRyXCIsIGRpZmZlcmVuY2UsIHN1YmouYWN0dWFsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdWJqLmFjdHVhbCA9IGNsb25lKHN1Ymoub2JqW3N1YmoucHJvcF0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciBwdXNoVG9MZW5ndGhTdWJqZWN0cyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwpe1xuICAgICAgICBcbiAgICAgICAgdmFyIGFjdHVhbDtcblxuICAgICAgICBpZiAocHJvcCA9PT0gXCIkJHdhdGNobGVuZ3Roc3ViamVjdHJvb3RcIikge1xuICAgICAgICAgICAgYWN0dWFsID0gIGNsb25lKG9iaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY3R1YWwgPSBjbG9uZShvYmpbcHJvcF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGVuZ3Roc3ViamVjdHMucHVzaCh7XG4gICAgICAgICAgICBvYmo6IG9iaixcbiAgICAgICAgICAgIHByb3A6IHByb3AsXG4gICAgICAgICAgICBhY3R1YWw6IGFjdHVhbCxcbiAgICAgICAgICAgIHdhdGNoZXI6IHdhdGNoZXIsXG4gICAgICAgICAgICBsZXZlbDogbGV2ZWxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciByZW1vdmVGcm9tTGVuZ3RoU3ViamVjdHMgPSBmdW5jdGlvbihvYmosIHByb3AsIHdhdGNoZXIpe1xuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxsZW5ndGhzdWJqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHN1YmogPSBsZW5ndGhzdWJqZWN0c1tpXTtcblxuICAgICAgICAgICAgaWYgKHN1Ymoub2JqID09IG9iaiAmJiBzdWJqLnByb3AgPT0gcHJvcCAmJiBzdWJqLndhdGNoZXIgPT0gd2F0Y2hlcikge1xuICAgICAgICAgICAgICAgIGxlbmd0aHN1YmplY3RzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHNldEludGVydmFsKGxvb3AsIDUwKTtcblxuICAgIFdhdGNoSlMud2F0Y2ggPSB3YXRjaDtcbiAgICBXYXRjaEpTLnVud2F0Y2ggPSB1bndhdGNoO1xuICAgIFdhdGNoSlMuY2FsbFdhdGNoZXJzID0gY2FsbFdhdGNoZXJzO1xuXG4gICAgcmV0dXJuIFdhdGNoSlM7XG5cbn0pKTtcbiIsImNsYXNzIE5vdGlmaWNhdGlvblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICBzaG93OiAodGl0bGUsIG1lc3NhZ2UpIC0+XG4gICAgdW5pcXVlSWQgPSAobGVuZ3RoPTgpIC0+XG4gICAgICBpZCA9IFwiXCJcbiAgICAgIGlkICs9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKSB3aGlsZSBpZC5sZW5ndGggPCBsZW5ndGhcbiAgICAgIGlkLnN1YnN0ciAwLCBsZW5ndGhcblxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSB1bmlxdWVJZCgpLFxuICAgICAgdHlwZTonYmFzaWMnXG4gICAgICB0aXRsZTp0aXRsZVxuICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgICAgaWNvblVybDonaW1hZ2VzL2ljb24tMzgucG5nJyxcbiAgICAgIChjYWxsYmFjaykgLT5cbiAgICAgICAgdW5kZWZpbmVkXG5cbm1vZHVsZS5leHBvcnRzID0gTm90aWZpY2F0aW9uIiwiY2xhc3MgUmVkaXJlY3RcbiAgZGF0YTp7fVxuICBcbiAgcHJlZml4Om51bGxcbiAgY3VycmVudE1hdGNoZXM6e31cbiAgY3VycmVudFRhYklkOiBudWxsXG4gICMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjc3NTVcbiAgIyB1cmw6IFJlZ0V4cFsnJCYnXSxcbiAgIyBwcm90b2NvbDpSZWdFeHAuJDIsXG4gICMgaG9zdDpSZWdFeHAuJDMsXG4gICMgcGF0aDpSZWdFeHAuJDQsXG4gICMgZmlsZTpSZWdFeHAuJDYsIC8vIDhcbiAgIyBxdWVyeTpSZWdFeHAuJDcsXG4gICMgaGFzaDpSZWdFeHAuJDhcbiAgICAgICAgIFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgXG4gIGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3Q6ICh1cmwpID0+XG4gICAgZmlsZVBhdGhSZWdleCA9IC9eKChodHRwW3NdP3xmdHB8Y2hyb21lLWV4dGVuc2lvbnxmaWxlKTpcXC9cXC8pP1xcLz8oW15cXC9cXC5dK1xcLikqPyhbXlxcL1xcLl0rXFwuW146XFwvXFxzXFwuXXsyLDN9KFxcLlteOlxcL1xcc1xcLl3igIzigIt7MiwzfSk/KSg6XFxkKyk/KCR8XFwvKShbXiM/XFxzXSspPyguKj8pPygjW1xcd1xcLV0rKT8kL1xuICAgXG4gICAgX21hcHMgPSBbXVxuICAgIGlmIEBkYXRhW0BjdXJyZW50VGFiSWRdP1xuICAgICAgX21hcHMucHVzaCBtYXAgZm9yIG1hcCBpbiBAZGF0YVtAY3VycmVudFRhYklkXS5tYXBzIHdoZW4gbWFwLmlzT25cbiAgICBcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgX21hcHMubGVuZ3RoID4gMFxuXG4gICAgcmVzUGF0aCA9IHVybC5tYXRjaChmaWxlUGF0aFJlZ2V4KT9bOF1cbiAgICBpZiBub3QgcmVzUGF0aD9cbiAgICAgICMgdHJ5IHJlbHBhdGhcbiAgICAgIHJlc1BhdGggPSB1cmxcblxuICAgIHJldHVybiBudWxsIHVubGVzcyByZXNQYXRoP1xuICAgIFxuICAgIGZvciBtYXAgaW4gX21hcHNcbiAgICAgIHJlc1BhdGggPSB1cmwubWF0Y2gobmV3IFJlZ0V4cChtYXAudXJsKSk/IGFuZCBtYXAudXJsP1xuXG4gICAgICBpZiByZXNQYXRoXG4gICAgICAgIGlmIHJlZmVyZXI/XG4gICAgICAgICAgIyBUT0RPOiB0aGlzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWFwLnVybCksIG1hcC5yZWdleFJlcGxcbiAgICAgICAgYnJlYWtcbiAgICByZXR1cm4gZmlsZVBhdGhcblxuICB0YWI6ICh0YWJJZCkgLT5cbiAgICBAY3VycmVudFRhYklkID0gdGFiSWRcbiAgICBAZGF0YVt0YWJJZF0gPz0gaXNPbjpmYWxzZVxuICAgIHRoaXNcblxuICB3aXRoUHJlZml4OiAocHJlZml4KSA9PlxuICAgIEBwcmVmaXggPSBwcmVmaXhcbiAgICB0aGlzXG5cbiAgIyB3aXRoRGlyZWN0b3JpZXM6IChkaXJlY3RvcmllcykgLT5cbiAgIyAgIGlmIGRpcmVjdG9yaWVzPy5sZW5ndGggaXMgMFxuICAjICAgICBAZGF0YVtAY3VycmVudFRhYklkXS5kaXJlY3RvcmllcyA9IFtdIFxuICAjICAgICBAX3N0b3AgQGN1cnJlbnRUYWJJZFxuICAjICAgZWxzZSAjaWYgT2JqZWN0LmtleXMoQGRhdGFbQGN1cnJlbnRUYWJJZF0pLmxlbmd0aCBpcyAwXG4gICMgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLmRpcmVjdG9yaWVzID0gZGlyZWN0b3JpZXNcbiAgIyAgICAgQHN0YXJ0KClcbiAgIyAgIHRoaXMgICAgXG5cbiAgd2l0aE1hcHM6IChtYXBzKSAtPlxuICAgIGlmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG1hcHMpLmxlbmd0aCBpcyAwXG4gICAgICBAZGF0YVtAY3VycmVudFRhYklkXS5tYXBzID0gW11cbiAgICAgIEBfc3RvcCBAY3VycmVudFRhYklkXG4gICAgZWxzZSAjaWYgT2JqZWN0LmtleXMoQGRhdGFbQGN1cnJlbnRUYWJJZF0pLmxlbmd0aCBpcyAwXG4gICAgICBAZGF0YVtAY3VycmVudFRhYklkXS5tYXBzID0gbWFwc1xuICAgIHRoaXNcblxuICBzdGFydDogLT5cbiAgICB1bmxlc3MgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubGlzdGVuZXJcbiAgICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5yZW1vdmVMaXN0ZW5lciBAZGF0YVtAY3VycmVudFRhYklkXS5saXN0ZW5lclxuXG4gICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubGlzdGVuZXIgPSBAY3JlYXRlUmVkaXJlY3RMaXN0ZW5lcigpXG4gICAgIyBAZGF0YVtAY3VycmVudFRhYklkXS5vbkJlZm9yZVNlbmRIZWFkZXJzTGlzdGVuZXIgPSBAY3JlYXRlT25CZWZvcmVTZW5kSGVhZGVyc0xpc3RlbmVyKClcbiAgICBAZGF0YVtAY3VycmVudFRhYklkXS5vbkhlYWRlcnNSZWNlaXZlZExpc3RlbmVyID0gQGNyZWF0ZU9uSGVhZGVyc1JlY2VpdmVkTGlzdGVuZXIoKVxuICAgICMgQGRhdGFbQGN1cnJlbnRUYWJJZF0uaXNPbiA9IHRydWVcbiAgICBAX3N0YXJ0IEBjdXJyZW50VGFiSWRcblxuICBraWxsQWxsOiAoKSAtPlxuICAgIEBfc3RvcCB0YWJJZCBmb3IgdGFiSWQgb2YgQGRhdGFcblxuICBfc3RvcDogKHRhYklkKSAtPlxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5yZW1vdmVMaXN0ZW5lciBAZGF0YVt0YWJJZF0ubGlzdGVuZXJcbiAgICAjIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlU2VuZEhlYWRlcnMucmVtb3ZlTGlzdGVuZXIgQGRhdGFbdGFiSWRdLm9uQmVmb3JlU2VuZEhlYWRlcnNMaXN0ZW5lclxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uSGVhZGVyc1JlY2VpdmVkLnJlbW92ZUxpc3RlbmVyIEBkYXRhW3RhYklkXS5vbkhlYWRlcnNSZWNlaXZlZExpc3RlbmVyXG4gICAgXG4gIF9zdGFydDogKHRhYklkKSAtPlxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5hZGRMaXN0ZW5lciBAZGF0YVt0YWJJZF0ubGlzdGVuZXIsXG4gICAgICB1cmxzOlsnPGFsbF91cmxzPiddXG4gICAgICB0YWJJZDp0YWJJZCxcbiAgICAgIFsnYmxvY2tpbmcnXVxuICAgICMgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVTZW5kSGVhZGVycy5hZGRMaXN0ZW5lciBAZGF0YVt0YWJJZF0ub25CZWZvcmVTZW5kSGVhZGVyc0xpc3RlbmVyLFxuICAgICMgICB1cmxzOlsnPGFsbF91cmxzPiddXG4gICAgIyAgIHRhYklkOnRhYklkLFxuICAgICMgICBbXCJyZXF1ZXN0SGVhZGVyc1wiXVxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uSGVhZGVyc1JlY2VpdmVkLmFkZExpc3RlbmVyIEBkYXRhW3RhYklkXS5vbkhlYWRlcnNSZWNlaXZlZExpc3RlbmVyLFxuICAgICAgdXJsczpbJzxhbGxfdXJscz4nXVxuICAgICAgdGFiSWQ6dGFiSWQsXG4gICAgICBbJ2Jsb2NraW5nJywncmVzcG9uc2VIZWFkZXJzJ10gICAgXG5cbiAgZ2V0Q3VycmVudFRhYjogKGNiKSAtPlxuICAgICMgdHJpZWQgdG8ga2VlcCBvbmx5IGFjdGl2ZVRhYiBwZXJtaXNzaW9uLCBidXQgb2ggd2VsbC4uXG4gICAgY2hyb21lLnRhYnMucXVlcnlcbiAgICAgIGFjdGl2ZTp0cnVlXG4gICAgICBjdXJyZW50V2luZG93OnRydWVcbiAgICAsKHRhYnMpID0+XG4gICAgICBAY3VycmVudFRhYklkID0gdGFic1swXS5pZFxuICAgICAgY2I/IEBjdXJyZW50VGFiSWRcblxuICB0b2dnbGU6ICgpIC0+XG4gICAgaXNPbiA9IGZhbHNlXG4gICAgaWYgQGRhdGFbQGN1cnJlbnRUYWJJZF0/Lm1hcHM/XG4gICAgICBmb3IgbSBpbiBAZGF0YVtAY3VycmVudFRhYklkXT8ubWFwc1xuICAgICAgICBpZiBtLmlzT25cbiAgICAgICAgICBpc09uID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpc09uID0gZmFsc2VcbiAgICAgICMgQGRhdGFbQGN1cnJlbnRUYWJJZF0uaXNPbiA9ICFAZGF0YVtAY3VycmVudFRhYklkXS5pc09uXG4gICAgICBcbiAgICAgIGlmIGlzT25cbiAgICAgICAgQHN0YXJ0KClcbiAgICAgIGVsc2VcbiAgICAgICAgQF9zdG9wKEBjdXJyZW50VGFiSWQpXG5cbiAgICAgIHJldHVybiBpc09uXG5cbiAgIyBzaG91bGRBbGxvd0NPUlM6IChkZXRhaWxzKSAtPlxuXG5cbiAgIyBjcmVhdGVPbkJlZm9yZVNlbmRIZWFkZXJzTGlzdGVuZXI6ICgpIC0+XG4gICMgICAoZGV0YWlscykgPT5cbiAgIyAgICAgaWYgZGV0YWlscy51cmwuaW5kZXhPZihAcHJlZml4KSBpcyAwXG4gICMgICAgICAgZmxhZyA9IGZhbHNlXG4gICMgICAgICAgcnVsZSA9XG4gICMgICAgICAgICBuYW1lOiBcIk9yaWdpblwiXG4gICMgICAgICAgICB2YWx1ZTogXCJodHRwOi8vcHJveGx5LmNvbVwiXG4gICMgICAgICAgZm9yIGhlYWRlciBpbiBkZXRhaWxzLnJlcXVlc3RIZWFkZXJzXG4gICMgICAgICAgICBpZiBoZWFkZXIubmFtZSBpcyBydWxlLm5hbWVcbiAgIyAgICAgICAgICAgZmxhZyA9IHRydWVcbiAgIyAgICAgICAgICAgaGVhZGVyLnZhbHVlID0gcnVsZS52YWx1ZVxuICAjICAgICAgICAgICBicmVha1xuXG4gICMgICAgICAgZGV0YWlscy5yZXF1ZXN0SGVhZGVycy5wdXNoIHJ1bGUgaWYgbm90IGZsYWdcblxuICAjICAgICByZXR1cm4gcmVxdWVzdEhlYWRlcnM6ZGV0YWlscy5yZXF1ZXN0SGVhZGVyc1xuXG4gIGNyZWF0ZU9uSGVhZGVyc1JlY2VpdmVkTGlzdGVuZXI6ICgpIC0+XG4gICAgKGRldGFpbHMpID0+XG4gICAgICBpZiBkZXRhaWxzLnVybC5pbmRleE9mKEBwcmVmaXgpIGlzIDBcbiAgICAgICAgcnVsZSA9XG4gICAgICAgICAgbmFtZTogXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIlxuICAgICAgICAgIHZhbHVlOiBcIipcIlxuXG4gICAgICAgIGRldGFpbHMucmVzcG9uc2VIZWFkZXJzLnB1c2ggcnVsZVxuXG4gICAgICByZXR1cm4gcmVzcG9uc2VIZWFkZXJzOmRldGFpbHMucmVzcG9uc2VIZWFkZXJzXG5cbiAgY3JlYXRlUmVkaXJlY3RMaXN0ZW5lcjogKCkgLT5cbiAgICAoZGV0YWlscykgPT5cbiAgICAgIHBhdGggPSBAZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdCBkZXRhaWxzLnVybFxuICAgICAgaWYgcGF0aD8gYW5kIHBhdGguaW5kZXhPZiBAcHJlZml4IGlzIC0xXG4gICAgICAgIHJldHVybiByZWRpcmVjdFVybDpAcHJlZml4ICsgcGF0aFxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4ge30gXG5cbiAgdG9EaWN0OiAob2JqLGtleSkgLT5cbiAgICBvYmoucmVkdWNlICgoZGljdCwgX29iaikgLT4gZGljdFsgX29ialtrZXldIF0gPSBfb2JqIGlmIF9vYmpba2V5XT87IHJldHVybiBkaWN0KSwge31cblxubW9kdWxlLmV4cG9ydHMgPSBSZWRpcmVjdFxuIiwiI1RPRE86IHJld3JpdGUgdGhpcyBjbGFzcyB1c2luZyB0aGUgbmV3IGNocm9tZS5zb2NrZXRzLiogYXBpIHdoZW4geW91IGNhbiBtYW5hZ2UgdG8gbWFrZSBpdCB3b3JrXG5jbGFzcyBTZXJ2ZXJcbiAgc29ja2V0OiBjaHJvbWUuc29ja2V0XG4gICMgdGNwOiBjaHJvbWUuc29ja2V0cy50Y3BcbiAgc29ja2V0UHJvcGVydGllczpcbiAgICAgIHBlcnNpc3RlbnQ6dHJ1ZVxuICAgICAgbmFtZTonU0xSZWRpcmVjdG9yJ1xuICAjIHNvY2tldEluZm86bnVsbFxuICBnZXRMb2NhbEZpbGU6bnVsbFxuICBzb2NrZXRJZHM6W11cbiAgc3RhdHVzOlxuICAgIGhvc3Q6bnVsbFxuICAgIHBvcnQ6bnVsbFxuICAgIG1heENvbm5lY3Rpb25zOjUwXG4gICAgaXNPbjpmYWxzZVxuICAgIHNvY2tldEluZm86bnVsbFxuICAgIHVybDpudWxsXG5cbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQHN0YXR1cy5ob3N0ID0gXCIxMjcuMC4wLjFcIlxuICAgIEBzdGF0dXMucG9ydCA9IDEwMDEyXG4gICAgQHN0YXR1cy5tYXhDb25uZWN0aW9ucyA9IDUwXG4gICAgQHN0YXR1cy51cmwgPSAnaHR0cDovLycgKyBAc3RhdHVzLmhvc3QgKyAnOicgKyBAc3RhdHVzLnBvcnQgKyAnLydcbiAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuXG5cbiAgc3RhcnQ6IChob3N0LHBvcnQsbWF4Q29ubmVjdGlvbnMsIGNiKSAtPlxuICAgIGlmIGhvc3Q/IHRoZW4gQHN0YXR1cy5ob3N0ID0gaG9zdFxuICAgIGlmIHBvcnQ/IHRoZW4gQHN0YXR1cy5wb3J0ID0gcG9ydFxuICAgIGlmIG1heENvbm5lY3Rpb25zPyB0aGVuIEBzdGF0dXMubWF4Q29ubmVjdGlvbnMgPSBtYXhDb25uZWN0aW9uc1xuXG4gICAgQGtpbGxBbGwgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgIHJldHVybiBjYj8gZXJyIGlmIGVycj9cblxuICAgICAgQHN0YXR1cy5pc09uID0gZmFsc2VcbiAgICAgIEBzb2NrZXQuY3JlYXRlICd0Y3AnLCB7fSwgKHNvY2tldEluZm8pID0+XG4gICAgICAgIEBzdGF0dXMuc29ja2V0SW5mbyA9IHNvY2tldEluZm9cbiAgICAgICAgQHNvY2tldElkcyA9IFtdXG4gICAgICAgIEBzb2NrZXRJZHMucHVzaCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQgJ3NvY2tldElkcyc6QHNvY2tldElkc1xuICAgICAgICBAc29ja2V0Lmxpc3RlbiBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBzdGF0dXMuaG9zdCwgQHN0YXR1cy5wb3J0LCAocmVzdWx0KSA9PlxuICAgICAgICAgIGlmIHJlc3VsdCA+IC0xXG4gICAgICAgICAgICBzaG93ICdsaXN0ZW5pbmcgJyArIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICAgICAgQHN0YXR1cy5pc09uID0gdHJ1ZVxuICAgICAgICAgICAgQHN0YXR1cy51cmwgPSAnaHR0cDovLycgKyBAc3RhdHVzLmhvc3QgKyAnOicgKyBAc3RhdHVzLnBvcnQgKyAnLydcbiAgICAgICAgICAgIEBzb2NrZXQuYWNjZXB0IEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuICAgICAgICAgICAgY2I/IG51bGwsIEBzdGF0dXNcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjYj8gcmVzdWx0XG5cblxuICBraWxsQWxsOiAoY2IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQgJ3NvY2tldElkcycsIChyZXN1bHQpID0+XG4gICAgICBAc29ja2V0SWRzID0gcmVzdWx0LnNvY2tldElkc1xuICAgICAgQHN0YXR1cy5pc09uID0gZmFsc2VcbiAgICAgIHJldHVybiBjYj8gbnVsbCwgJ3N1Y2Nlc3MnIHVubGVzcyBAc29ja2V0SWRzP1xuICAgICAgY250ID0gMFxuICAgICAgaSA9IDBcbiAgICAgIFxuICAgICAgd2hpbGUgaSA8IEBzb2NrZXRJZHNbMF1cbiAgICAgICAgQHNvY2tldC5kZXN0cm95IGlcbiAgICAgICAgaSsrXG5cbiAgICAgIGZvciBzIGluIEBzb2NrZXRJZHNcbiAgICAgICAgZG8gKHMpID0+XG4gICAgICAgICAgY250KytcbiAgICAgICAgICBAc29ja2V0LmdldEluZm8gcywgKHNvY2tldEluZm8pID0+XG4gICAgICAgICAgICBjbnQtLVxuICAgICAgICAgICAgaWYgbm90IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcj9cbiAgICAgICAgICAgICAgQHNvY2tldC5kaXNjb25uZWN0IHMgaWYgQHN0YXR1cy5zb2NrZXRJbmZvPy5jb25uZWN0ZWQgb3Igbm90IEBzdGF0dXMuc29ja2V0SW5mbz9cbiAgICAgICAgICAgICAgQHNvY2tldC5kZXN0cm95IHNcblxuICAgICAgICAgICAgY2I/IG51bGwsICdzdWNjZXNzJyBpZiBjbnQgaXMgMFxuXG4gIHN0b3A6IChjYikgLT5cbiAgICBAa2lsbEFsbCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgQHN0YXR1cy5pc09uID0gZmFsc2VcbiAgICAgIGlmIGVycj8gXG4gICAgICAgIGNiPyBlcnJcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsc3VjY2Vzc1xuXG5cbiAgX29uUmVjZWl2ZTogKHJlY2VpdmVJbmZvKSA9PlxuICAgIHNob3coXCJDbGllbnQgc29ja2V0ICdyZWNlaXZlJyBldmVudDogc2Q9XCIgKyByZWNlaXZlSW5mby5zb2NrZXRJZFxuICAgICsgXCIsIGJ5dGVzPVwiICsgcmVjZWl2ZUluZm8uZGF0YS5ieXRlTGVuZ3RoKVxuXG4gIF9vbkxpc3RlbjogKHNlcnZlclNvY2tldElkLCByZXN1bHRDb2RlKSA9PlxuICAgIHJldHVybiBzaG93ICdFcnJvciBMaXN0ZW5pbmc6ICcgKyBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSBpZiByZXN1bHRDb2RlIDwgMFxuICAgIEBzZXJ2ZXJTb2NrZXRJZCA9IHNlcnZlclNvY2tldElkXG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdC5hZGRMaXN0ZW5lciBAX29uQWNjZXB0XG4gICAgQHRjcFNlcnZlci5vbkFjY2VwdEVycm9yLmFkZExpc3RlbmVyIEBfb25BY2NlcHRFcnJvclxuICAgIEB0Y3Aub25SZWNlaXZlLmFkZExpc3RlbmVyIEBfb25SZWNlaXZlXG4gICAgIyBzaG93IFwiW1wiK3NvY2tldEluZm8ucGVlckFkZHJlc3MrXCI6XCIrc29ja2V0SW5mby5wZWVyUG9ydCtcIl0gQ29ubmVjdGlvbiBhY2NlcHRlZCFcIjtcbiAgICAjIGluZm8gPSBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWRcbiAgICAjIEBnZXRGaWxlIHVyaSwgKGZpbGUpIC0+XG4gIF9vbkFjY2VwdEVycm9yOiAoZXJyb3IpIC0+XG4gICAgc2hvdyBlcnJvclxuXG4gIF9vbkFjY2VwdDogKHNvY2tldEluZm8pID0+XG4gICAgIyByZXR1cm4gbnVsbCBpZiBpbmZvLnNvY2tldElkIGlzbnQgQHNlcnZlclNvY2tldElkXG4gICAgc2hvdyhcIlNlcnZlciBzb2NrZXQgJ2FjY2VwdCcgZXZlbnQ6IHNkPVwiICsgc29ja2V0SW5mby5zb2NrZXRJZClcbiAgICBpZiBzb2NrZXRJbmZvPy5zb2NrZXRJZD9cbiAgICAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZCwgKGVyciwgaW5mbykgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gQF93cml0ZUVycm9yIHNvY2tldEluZm8uc29ja2V0SWQsIDQwNCwgaW5mby5rZWVwQWxpdmVcblxuICAgICAgICBAZ2V0TG9jYWxGaWxlIGluZm8sIChlcnIsIGZpbGVFbnRyeSwgZmlsZVJlYWRlcikgPT5cbiAgICAgICAgICBpZiBlcnI/IHRoZW4gQF93cml0ZUVycm9yIHNvY2tldEluZm8uc29ja2V0SWQsIDQwNCwgaW5mby5rZWVwQWxpdmVcbiAgICAgICAgICBlbHNlIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJbmZvLnNvY2tldElkLCBmaWxlRW50cnksIGZpbGVSZWFkZXIsIGluZm8ua2VlcEFsaXZlXG4gICAgZWxzZVxuICAgICAgc2hvdyBcIk5vIHNvY2tldD8hXCJcbiAgICAjIEBzb2NrZXQuYWNjZXB0IHNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuXG5cbiAgc3RyaW5nVG9VaW50OEFycmF5OiAoc3RyaW5nKSAtPlxuICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHJpbmcubGVuZ3RoKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgaSA9IDBcblxuICAgIHdoaWxlIGkgPCBzdHJpbmcubGVuZ3RoXG4gICAgICB2aWV3W2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICAgIGkrK1xuICAgIHZpZXdcblxuICBhcnJheUJ1ZmZlclRvU3RyaW5nOiAoYnVmZmVyKSAtPlxuICAgIHN0ciA9IFwiXCJcbiAgICB1QXJyYXlWYWwgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gICAgcyA9IDBcblxuICAgIHdoaWxlIHMgPCB1QXJyYXlWYWwubGVuZ3RoXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1QXJyYXlWYWxbc10pXG4gICAgICBzKytcbiAgICBzdHJcblxuICBfd3JpdGUyMDBSZXNwb25zZTogKHNvY2tldElkLCBmaWxlRW50cnksIGZpbGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBjb250ZW50VHlwZSA9IChpZiAoZmlsZS50eXBlIGlzIFwiXCIpIHRoZW4gXCJ0ZXh0L3BsYWluXCIgZWxzZSBmaWxlLnR5cGUpXG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCAyMDAgT0tcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG5cbiAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlclxuICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+XG4gICAgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShldi50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgICAgc2hvdyB3cml0ZUluZm9cbiAgICAgICAgIyBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5vbmVycm9yID0gKGVycm9yKSA9PlxuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGZpbGVcblxuXG4gICAgIyBAZW5kIHNvY2tldElkXG4gICAgIyBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICMgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgPT5cbiAgICAjICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZS50YXJnZXQucmVzdWx0KSwgaGVhZGVyLmJ5dGVMZW5ndGhcbiAgICAjICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICMgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAjICAgICAgIEBfd3JpdGUyMDBSZXNwb25zZSBzb2NrZXRJZFxuXG5cbiAgX3JlYWRGcm9tU29ja2V0OiAoc29ja2V0SWQsIGNiKSAtPlxuICAgIEBzb2NrZXQucmVhZCBzb2NrZXRJZCwgKHJlYWRJbmZvKSA9PlxuICAgICAgc2hvdyBcIlJFQURcIiwgcmVhZEluZm9cblxuICAgICAgIyBQYXJzZSB0aGUgcmVxdWVzdC5cbiAgICAgIGRhdGEgPSBAYXJyYXlCdWZmZXJUb1N0cmluZyhyZWFkSW5mby5kYXRhKVxuICAgICAgc2hvdyBkYXRhXG5cbiAgICAgIGtlZXBBbGl2ZSA9IGZhbHNlXG4gICAgICBrZWVwQWxpdmUgPSB0cnVlIGlmIGRhdGEuaW5kZXhPZiAnQ29ubmVjdGlvbjoga2VlcC1hbGl2ZScgaXNudCAtMVxuXG4gICAgICBpZiBkYXRhLmluZGV4T2YoXCJHRVQgXCIpIGlzbnQgMFxuICAgICAgICByZXR1cm4gY2I/ICc0MDQnLCBrZWVwQWxpdmU6a2VlcEFsaXZlXG5cblxuXG4gICAgICB1cmlFbmQgPSBkYXRhLmluZGV4T2YoXCIgXCIsIDQpXG5cbiAgICAgIHJldHVybiBlbmQgc29ja2V0SWQgaWYgdXJpRW5kIDwgMFxuXG4gICAgICB1cmkgPSBkYXRhLnN1YnN0cmluZyg0LCB1cmlFbmQpXG4gICAgICBpZiBub3QgdXJpP1xuICAgICAgICByZXR1cm4gY2I/ICc0MDQnLCBrZWVwQWxpdmU6a2VlcEFsaXZlXG5cbiAgICAgIGluZm8gPVxuICAgICAgICB1cmk6IHVyaVxuICAgICAgICBrZWVwQWxpdmU6a2VlcEFsaXZlXG4gICAgICBpbmZvLnJlZmVyZXIgPSBkYXRhLm1hdGNoKC9SZWZlcmVyOlxccyguKikvKT9bMV1cbiAgICAgICNzdWNjZXNzXG4gICAgICBjYj8gbnVsbCwgaW5mb1xuXG4gIGVuZDogKHNvY2tldElkLCBrZWVwQWxpdmUpIC0+XG4gICAgICAjIGlmIGtlZXBBbGl2ZVxuICAgICAgIyAgIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICMgZWxzZVxuICAgIEBzb2NrZXQuZGlzY29ubmVjdCBzb2NrZXRJZFxuICAgIEBzb2NrZXQuZGVzdHJveSBzb2NrZXRJZFxuICAgIHNob3cgJ2VuZGluZyAnICsgc29ja2V0SWRcbiAgICBAc29ja2V0LmFjY2VwdCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcblxuICBfd3JpdGVFcnJvcjogKHNvY2tldElkLCBlcnJvckNvZGUsIGtlZXBBbGl2ZSkgLT5cbiAgICBmaWxlID0gc2l6ZTogMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGJlZ2luLi4uIFwiXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogZmlsZSA9IFwiICsgZmlsZVxuICAgIGNvbnRlbnRUeXBlID0gXCJ0ZXh0L3BsYWluXCIgIyhmaWxlLnR5cGUgPT09IFwiXCIpID8gXCJ0ZXh0L3BsYWluXCIgOiBmaWxlLnR5cGU7XG4gICAgY29udGVudExlbmd0aCA9IGZpbGUuc2l6ZVxuICAgIGhlYWRlciA9IEBzdHJpbmdUb1VpbnQ4QXJyYXkoXCJIVFRQLzEuMCBcIiArIGVycm9yQ29kZSArIFwiIE5vdCBGb3VuZFxcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoKGlmIGtlZXBBbGl2ZSB0aGVuIFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIGVsc2UgXCJcIikpICsgXCJcXG5cXG5cIilcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgaGVhZGVyLi4uXCJcbiAgICBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldCBoZWFkZXIsIDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBEb25lIHNldHRpbmcgdmlldy4uLlwiXG4gICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICAgc2hvdyBcIldSSVRFXCIsIHdyaXRlSW5mb1xuICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG5cbm1vZHVsZS5leHBvcnRzID0gU2VydmVyXG4iLCJMSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5cbldhdGNoSlMgPSByZXF1aXJlICd3YXRjaGpzJ1xud2F0Y2ggPSBXYXRjaEpTLndhdGNoXG51bndhdGNoID0gV2F0Y2hKUy51bndhdGNoXG5jYWxsV2F0Y2hlcnMgPSBXYXRjaEpTLmNhbGxXYXRjaGVyc1xuXG5jbGFzcyBTdG9yYWdlXG4gIGFwaTogY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIGRhdGE6IFxuICAgIGN1cnJlbnRSZXNvdXJjZXM6IFtdXG4gICAgZGlyZWN0b3JpZXM6W11cbiAgICBtYXBzOltdXG4gICAgdGFiTWFwczp7fVxuICAgIGN1cnJlbnRGaWxlTWF0Y2hlczp7fVxuICBcbiAgc2Vzc2lvbjp7fVxuXG4gIG9uRGF0YUxvYWRlZDogLT5cblxuICBjYWxsYmFjazogKCkgLT5cbiAgbm90aWZ5T25DaGFuZ2U6ICgpIC0+XG4gIGNvbnN0cnVjdG9yOiAoX29uRGF0YUxvYWRlZCkgLT5cbiAgICBAb25EYXRhTG9hZGVkID0gX29uRGF0YUxvYWRlZCBpZiBfb25EYXRhTG9hZGVkP1xuICAgIEBhcGkuZ2V0IChyZXN1bHRzKSA9PlxuICAgICAgQGRhdGFba10gPSByZXN1bHRzW2tdIGZvciBrIG9mIHJlc3VsdHNcblxuICAgICAgd2F0Y2hBbmROb3RpZnkgQCwnZGF0YUNoYW5nZWQnLCBAZGF0YSwgdHJ1ZVxuXG4gICAgICB3YXRjaEFuZE5vdGlmeSBALCdzZXNzaW9uRGF0YScsIEBzZXNzaW9uLCBmYWxzZVxuXG4gICAgICBAb25EYXRhTG9hZGVkIEBkYXRhXG5cbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgLT5cbiAgICBcbiAgd2F0Y2hBbmROb3RpZnkgPSAoX3RoaXMsIG1zZ0tleSwgb2JqLCBzdG9yZSkgLT5cblxuICAgICAgX2xpc3RlbmVyID0gKHByb3AsIGFjdGlvbiwgbmV3VmFsLCBvbGRWYWwpIC0+XG4gICAgICAgIGlmIChhY3Rpb24gaXMgXCJzZXRcIiBvciBcImRpZmZlcmVudGF0dHJcIikgYW5kIF90aGlzLm5vV2F0Y2ggaXMgZmFsc2VcbiAgICAgICAgICBpZiBub3QgL15cXGQrJC8udGVzdChwcm9wKVxuICAgICAgICAgICAgc2hvdyBhcmd1bWVudHNcbiAgICAgICAgICAgIF90aGlzLmFwaS5zZXQgb2JqIGlmIHN0b3JlXG4gICAgICAgICAgICBtc2cgPSB7fVxuICAgICAgICAgICAgbXNnW21zZ0tleV0gPSBvYmpcbiAgICAgICAgICAgICMgdW53YXRjaCBvYmosIF9saXN0ZW5lciwzLHRydWVcbiAgICAgICAgICAgIF90aGlzLk1TRy5FeHRQb3J0IG1zZ1xuICAgICAgICBcbiAgICAgIF90aGlzLm5vV2F0Y2ggPSBmYWxzZVxuICAgICAgd2F0Y2ggb2JqLCBfbGlzdGVuZXIsMyx0cnVlXG5cbiAgICAgIF90aGlzLkxJU1RFTi5FeHQgbXNnS2V5LCAoZGF0YSkgLT5cbiAgICAgICAgX3RoaXMubm9XYXRjaCA9IHRydWVcbiAgICAgICAgIyB1bndhdGNoIG9iaiwgX2xpc3RlbmVyLDMsdHJ1ZVxuICAgICAgICBcbiAgICAgICAgb2JqW2tdID0gZGF0YVtrXSBmb3IgayBvZiBkYXRhXG4gICAgICAgIHNldFRpbWVvdXQgKCkgLT4gXG4gICAgICAgICAgX3RoaXMubm9XYXRjaCA9IGZhbHNlXG4gICAgICAgICwyMDBcblxuICBzYXZlOiAoa2V5LCBpdGVtLCBjYikgLT5cblxuICAgIG9iaiA9IHt9XG4gICAgb2JqW2tleV0gPSBpdGVtXG4gICAgQGRhdGFba2V5XSA9IGl0ZW1cbiAgICBAYXBpLnNldCBvYmosIChyZXMpID0+XG4gICAgICBjYj8oKVxuICAgICAgQGNhbGxiYWNrPygpXG4gXG4gIHNhdmVBbGw6IChkYXRhLCBjYikgLT5cblxuICAgIGlmIGRhdGE/IFxuICAgICAgQGFwaS5zZXQgZGF0YSwgKCkgPT5cbiAgICAgICAgY2I/KClcbiBcbiAgICBlbHNlXG4gICAgICBAYXBpLnNldCBAZGF0YSwgKCkgPT5cbiAgICAgICAgY2I/KClcbiBcblxuICByZXRyaWV2ZTogKGtleSwgY2IpIC0+XG4gICAgQG9ic2VydmVyLnN0b3AoKVxuICAgIEBhcGkuZ2V0IGtleSwgKHJlc3VsdHMpIC0+XG4gICAgICBAZGF0YVtyXSA9IHJlc3VsdHNbcl0gZm9yIHIgb2YgcmVzdWx0c1xuICAgICAgaWYgY2I/IHRoZW4gY2IgcmVzdWx0c1trZXldXG5cbiAgcmV0cmlldmVBbGw6IChjYikgLT5cbiAgICAjIEBvYnNlcnZlci5zdG9wKClcbiAgICBAYXBpLmdldCAocmVzdWx0KSA9PlxuICAgICAgZm9yIGMgb2YgcmVzdWx0IFxuICAgICAgIyAgIGRlbGV0ZSBAZGF0YVtjXVxuICAgICAgICBAZGF0YVtjXSA9IHJlc3VsdFtjXSBcbiAgICAgICMgQGRhdGEgPSByZXN1bHRcbiAgICAgICAgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6XG4gICAgICAgICAgcGF0aDpjXG4gICAgICAgICAgdmFsdWU6cmVzdWx0W2NdXG4gXG5cbiAgICAgIEBhcGkuc2V0IEBkYXRhXG4gICAgICAjIEBjYWxsYmFjaz8gcmVzdWx0XG4gICAgICBjYj8gcmVzdWx0XG4gICAgICBAb25EYXRhTG9hZGVkIEBkYXRhXG5cbiAgb25EYXRhTG9hZGVkOiAoZGF0YSkgLT5cblxuICBvbkNoYW5nZWQ6IChrZXksIGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcywgbmFtZXNwYWNlKSAtPlxuICAgICAgaWYgY2hhbmdlc1trZXldPyBhbmQgY2I/IHRoZW4gY2IgY2hhbmdlc1trZXldLm5ld1ZhbHVlXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXNcblxuICBvbkNoYW5nZWRBbGw6ICgpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLG5hbWVzcGFjZSkgPT5cbiAgICAgIGhhc0NoYW5nZXMgPSBmYWxzZVxuICAgICAgZm9yIGMgb2YgY2hhbmdlcyB3aGVuIGNoYW5nZXNbY10ubmV3VmFsdWUgIT0gY2hhbmdlc1tjXS5vbGRWYWx1ZSBhbmQgYyBpc250J3NvY2tldElkcydcbiAgICAgICAgKGMpID0+IFxuICAgICAgICAgIEBkYXRhW2NdID0gY2hhbmdlc1tjXS5uZXdWYWx1ZSBcbiAgICAgICAgICBzaG93ICdkYXRhIGNoYW5nZWQ6ICdcbiAgICAgICAgICBzaG93IGNcbiAgICAgICAgICBzaG93IEBkYXRhW2NdXG5cbiAgICAgICAgICBoYXNDaGFuZ2VzID0gdHJ1ZVxuXG4gICAgICBAY2FsbGJhY2s/IGNoYW5nZXMgaWYgaGFzQ2hhbmdlc1xuICAgICAgc2hvdyAnY2hhbmdlZCcgaWYgaGFzQ2hhbmdlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE3NDIwOTNcbm1vZHVsZS5leHBvcnRzID0gKCgpIC0+XG5cbiAgZGVidWcgPSBmYWxzZVxuICBcbiAgcmV0dXJuICh3aW5kb3cuc2hvdyA9ICgpIC0+KSBpZiBub3QgZGVidWdcblxuICBtZXRob2RzID0gW1xuICAgICdhc3NlcnQnLCAnY2xlYXInLCAnY291bnQnLCAnZGVidWcnLCAnZGlyJywgJ2RpcnhtbCcsICdlcnJvcicsXG4gICAgJ2V4Y2VwdGlvbicsICdncm91cCcsICdncm91cENvbGxhcHNlZCcsICdncm91cEVuZCcsICdpbmZvJywgJ2xvZycsXG4gICAgJ21hcmtUaW1lbGluZScsICdwcm9maWxlJywgJ3Byb2ZpbGVFbmQnLCAndGFibGUnLCAndGltZScsICd0aW1lRW5kJyxcbiAgICAndGltZVN0YW1wJywgJ3RyYWNlJywgJ3dhcm4nXVxuICAgIFxuICBub29wID0gKCkgLT5cbiAgICAjIHN0dWIgdW5kZWZpbmVkIG1ldGhvZHMuXG4gICAgZm9yIG0gaW4gbWV0aG9kcyAgd2hlbiAgIWNvbnNvbGVbbV1cbiAgICAgIGNvbnNvbGVbbV0gPSBub29wXG5cblxuICBpZiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZD9cbiAgICB3aW5kb3cuc2hvdyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUpXG4gIGVsc2VcbiAgICB3aW5kb3cuc2hvdyA9ICgpIC0+XG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKVxuKSgpXG4iXX0=
