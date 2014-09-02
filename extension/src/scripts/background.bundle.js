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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9jb21tb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L2NvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvZXh0ZW5zaW9uL3NyYy9iYWNrZ3JvdW5kLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9maWxlc3lzdGVtLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9saXN0ZW4uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L21zZy5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoanMvc3JjL3dhdGNoLmpzIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vdGlmaWNhdGlvbi5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvcmVkaXJlY3QuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L3NlcnZlci5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvc3RvcmFnZS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLDJFQUFBO0VBQUE7O2lTQUFBOztBQUFBLE9BQUEsQ0FBUSxlQUFSLENBQUEsQ0FBQTs7QUFBQSxNQUNBLEdBQVMsT0FBQSxDQUFRLGlCQUFSLENBRFQsQ0FBQTs7QUFBQSxHQUVBLEdBQU0sT0FBQSxDQUFRLGNBQVIsQ0FGTixDQUFBOztBQUFBLE1BR0EsR0FBUyxPQUFBLENBQVEsaUJBQVIsQ0FIVCxDQUFBOztBQUFBLE9BSUEsR0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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OlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlICcuL3V0aWwuY29mZmVlJ1xuQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuU3RvcmFnZSA9IHJlcXVpcmUgJy4vc3RvcmFnZS5jb2ZmZWUnXG5GaWxlU3lzdGVtID0gcmVxdWlyZSAnLi9maWxlc3lzdGVtLmNvZmZlZSdcbk5vdGlmaWNhdGlvbiA9IHJlcXVpcmUgJy4vbm90aWZpY2F0aW9uLmNvZmZlZSdcblNlcnZlciA9IHJlcXVpcmUgJy4vc2VydmVyLmNvZmZlZSdcblxuXG5jbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIENvbmZpZ1xuICBMSVNURU46IG51bGxcbiAgTVNHOiBudWxsXG4gIFN0b3JhZ2U6IG51bGxcbiAgRlM6IG51bGxcbiAgU2VydmVyOiBudWxsXG4gIE5vdGlmeTogbnVsbFxuICBwbGF0Zm9ybTpudWxsXG4gIGN1cnJlbnRUYWJJZDpudWxsXG5cbiAgY29uc3RydWN0b3I6IChkZXBzKSAtPlxuICAgIHN1cGVyXG5cbiAgICBATVNHID89IE1TRy5nZXQoKVxuICAgIEBMSVNURU4gPz0gTElTVEVOLmdldCgpXG4gICAgXG4gICAgY2hyb21lLnJ1bnRpbWUub25Db25uZWN0RXh0ZXJuYWwuYWRkTGlzdGVuZXIgKHBvcnQpID0+XG4gICAgICBpZiBwb3J0LnNlbmRlci5pZCBpc250IEBFWFRfSURcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIEBNU0cuc2V0UG9ydCBwb3J0XG4gICAgICBATElTVEVOLnNldFBvcnQgcG9ydFxuICAgIFxuICAgIHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG4gICAgQE1TRy5zZXRQb3J0IHBvcnRcbiAgICBATElTVEVOLnNldFBvcnQgcG9ydFxuICAgIFxuICAgIGZvciBwcm9wIG9mIGRlcHNcbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwib2JqZWN0XCIgXG4gICAgICAgIEBbcHJvcF0gPSBAd3JhcE9iakluYm91bmQgZGVwc1twcm9wXVxuICAgICAgaWYgdHlwZW9mIGRlcHNbcHJvcF0gaXMgXCJmdW5jdGlvblwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpPdXRib3VuZCBuZXcgZGVwc1twcm9wXVxuXG4gICAgQFN0b3JhZ2Uub25EYXRhTG9hZGVkID0gKGRhdGEpID0+XG4gICAgICAjIEBkYXRhID0gZGF0YVxuICAgICAgIyBkZWxldGUgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXJcbiAgICAgICMgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXIgPSB7fVxuICAgICAgIyBkZWxldGUgQFN0b3JhZ2UuZGF0YS5zZXJ2ZXIuc3RhdHVzXG5cbiAgICAgIGlmIG5vdCBAU3RvcmFnZS5kYXRhLmZpcnN0VGltZT9cbiAgICAgICAgQFN0b3JhZ2UuZGF0YS5maXJzdFRpbWUgPSBmYWxzZVxuICAgICAgICBAU3RvcmFnZS5kYXRhLm1hcHMucHVzaFxuICAgICAgICAgIG5hbWU6J1NhbGVzZm9yY2UnXG4gICAgICAgICAgdXJsOidodHRwcy4qXFwvcmVzb3VyY2UoXFwvWzAtOV0rKT9cXC8oW0EtWmEtejAtOVxcLS5fXStcXC8pPydcbiAgICAgICAgICByZWdleFJlcGw6JydcbiAgICAgICAgICBpc1JlZGlyZWN0OnRydWVcbiAgICAgICAgICBpc09uOmZhbHNlXG4gICAgICAgICAgdHlwZTonTG9jYWwgRmlsZSdcbiAgICAgICAgICBcblxuXG4gICAgICAjIGlmIEBSZWRpcmVjdD8gdGhlbiBAUmVkaXJlY3QuZGF0YSA9IEBkYXRhLnRhYk1hcHNcblxuICAgIEBOb3RpZnkgPz0gKG5ldyBOb3RpZmljYXRpb24pLnNob3cgXG4gICAgIyBAU3RvcmFnZSA/PSBAd3JhcE9iak91dGJvdW5kIG5ldyBTdG9yYWdlIEBkYXRhXG4gICAgIyBARlMgPSBuZXcgRmlsZVN5c3RlbSBcbiAgICAjIEBTZXJ2ZXIgPz0gQHdyYXBPYmpPdXRib3VuZCBuZXcgU2VydmVyXG4gICAgQGRhdGEgPSBAU3RvcmFnZS5kYXRhXG4gICAgXG4gICAgQHdyYXAgPSBpZiBAU0VMRl9UWVBFIGlzICdBUFAnIHRoZW4gQHdyYXBJbmJvdW5kIGVsc2UgQHdyYXBPdXRib3VuZFxuXG4gICAgQG9wZW5BcHAgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ub3BlbkFwcCcsIEBvcGVuQXBwXG4gICAgQGxhdW5jaEFwcCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5sYXVuY2hBcHAnLCBAbGF1bmNoQXBwXG4gICAgQHN0YXJ0U2VydmVyID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLnN0YXJ0U2VydmVyJywgQHN0YXJ0U2VydmVyXG4gICAgQHJlc3RhcnRTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24ucmVzdGFydFNlcnZlcicsIEByZXN0YXJ0U2VydmVyXG4gICAgQHN0b3BTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uc3RvcFNlcnZlcicsIEBzdG9wU2VydmVyXG4gICAgQGdldEZpbGVNYXRjaCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRGaWxlTWF0Y2gnLCBAZ2V0RmlsZU1hdGNoXG5cbiAgICBAd3JhcCA9IGlmIEBTRUxGX1RZUEUgaXMgJ0VYVEVOU0lPTicgdGhlbiBAd3JhcEluYm91bmQgZWxzZSBAd3JhcE91dGJvdW5kXG5cbiAgICBAZ2V0UmVzb3VyY2VzID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldFJlc291cmNlcycsIEBnZXRSZXNvdXJjZXNcbiAgICBAZ2V0Q3VycmVudFRhYiA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5nZXRDdXJyZW50VGFiJywgQGdldEN1cnJlbnRUYWJcblxuICAgIEBpbml0KClcblxuICBpbml0OiAoKSAtPlxuICAgICAgQFN0b3JhZ2Uuc2Vzc2lvbi5zZXJ2ZXIgPSB7fVxuICAgICAgQFN0b3JhZ2Uuc2Vzc2lvbi5zZXJ2ZXIuc3RhdHVzID0gQFNlcnZlci5zdGF0dXNcbiAgICAjIEBTdG9yYWdlLnJldHJpZXZlQWxsKCkgaWYgQFN0b3JhZ2U/XG5cblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIGxhdW5jaEFwcDogKGNiLCBlcnJvcikgLT5cbiAgICAjIG5lZWRzIG1hbmFnZW1lbnQgcGVybWlzc2lvbi4gb2ZmIGZvciBub3cuXG4gICAgY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIEBBUFBfSUQsIChleHRJbmZvKSA9PlxuICAgICAgaWYgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICAgIGVycm9yIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxuICAgICAgZWxzZVxuICAgICAgICBjYj8gZXh0SW5mb1xuXG4gIG9wZW5BcHA6ICgpID0+XG4gICAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLFxuICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgYm91bmRzOlxuICAgICAgICAgIHdpZHRoOjc3MFxuICAgICAgICAgIGhlaWdodDo4MDAsXG4gICAgICAod2luKSA9PlxuICAgICAgICBAYXBwV2luZG93ID0gd2luKSBcblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIGdldFJlc291cmNlczogKGNiKSAtPlxuICAgIEBnZXRDdXJyZW50VGFiICh0YWJJZCkgPT5cbiAgICAgIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQgdGFiSWQsIFxuICAgICAgICBmaWxlOidzY3JpcHRzL2NvbnRlbnQuanMnLCAocmVzdWx0cykgPT5cbiAgICAgICAgICBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLmxlbmd0aCA9IDBcbiAgICAgICAgICBcbiAgICAgICAgICByZXR1cm4gY2I/KG51bGwsIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMpIGlmIG5vdCByZXN1bHRzP1xuXG4gICAgICAgICAgZm9yIHIgaW4gcmVzdWx0c1xuICAgICAgICAgICAgZm9yIHJlcyBpbiByXG4gICAgICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMucHVzaCByZXNcbiAgICAgICAgICBjYj8gbnVsbCwgQGRhdGEuY3VycmVudFJlc291cmNlc1xuXG5cbiAgZ2V0TG9jYWxGaWxlOiAoaW5mbywgY2IpID0+XG4gICAgZmlsZVBhdGggPSBpbmZvLnVyaVxuICAgIGp1c3RUaGVQYXRoID0gZmlsZVBhdGgubWF0Y2goL14oW14jP1xcc10rKT8oLio/KT8oI1tcXHdcXC1dKyk/JC8pXG4gICAgZmlsZVBhdGggPSBqdXN0VGhlUGF0aFsxXSBpZiBqdXN0VGhlUGF0aD9cbiAgICAjIGZpbGVQYXRoID0gQGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3QgdXJsXG4gICAgcmV0dXJuIGNiICdmaWxlIG5vdCBmb3VuZCcgdW5sZXNzIGZpbGVQYXRoP1xuICAgIF9kaXJzID0gW11cbiAgICBfZGlycy5wdXNoIGRpciBmb3IgZGlyIGluIEBkYXRhLmRpcmVjdG9yaWVzIHdoZW4gZGlyLmlzT25cbiAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnN1YnN0cmluZyAxIGlmIGZpbGVQYXRoLnN1YnN0cmluZygwLDEpIGlzICcvJ1xuICAgIEBmaW5kRmlsZUZvclBhdGggX2RpcnMsIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcikgPT5cbiAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gY2I/IGVyclxuICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgIGNiPyBudWxsLGZpbGVFbnRyeSxmaWxlXG4gICAgICAsKGVycikgPT4gY2I/IGVyclxuXG5cbiAgc3RhcnRTZXJ2ZXI6IChjYikgLT5cbiAgICBpZiBAU2VydmVyLnN0YXR1cy5pc09uIGlzIGZhbHNlXG4gICAgICBAU2VydmVyLnN0YXJ0IG51bGwsbnVsbCxudWxsLCAoZXJyLCBzb2NrZXRJbmZvKSA9PlxuICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIkVycm9yIFN0YXJ0aW5nIFNlcnZlcjogI3sgZXJyIH1cIlxuICAgICAgICAgICAgY2I/IGVyclxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgU3RhcnRlZFwiLCBcIlN0YXJ0ZWQgU2VydmVyICN7IEBTZXJ2ZXIuc3RhdHVzLnVybCB9XCJcbiAgICAgICAgICAgIGNiPyBudWxsLCBAU2VydmVyLnN0YXR1c1xuICAgIGVsc2VcbiAgICAgIGNiPyAnYWxyZWFkeSBzdGFydGVkJ1xuXG4gIHN0b3BTZXJ2ZXI6IChjYikgLT5cbiAgICAgIEBTZXJ2ZXIuc3RvcCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBFcnJvclwiLFwiU2VydmVyIGNvdWxkIG5vdCBiZSBzdG9wcGVkOiAjeyBlcnJvciB9XCJcbiAgICAgICAgICBjYj8gZXJyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBATm90aWZ5ICdTZXJ2ZXIgU3RvcHBlZCcsIFwiU2VydmVyIFN0b3BwZWRcIlxuICAgICAgICAgIGNiPyBudWxsLCBAU2VydmVyLnN0YXR1c1xuXG4gIHJlc3RhcnRTZXJ2ZXI6IC0+XG4gICAgQHN0YXJ0U2VydmVyKClcblxuICBjaGFuZ2VQb3J0OiA9PlxuICBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0OiAodXJsKSAtPlxuICAgIGZpbGVQYXRoUmVnZXggPSAvXigoaHR0cFtzXT98ZnRwfGNocm9tZS1leHRlbnNpb258ZmlsZSk6XFwvXFwvKT9cXC8/KFteXFwvXFwuXStcXC4pKj8oW15cXC9cXC5dK1xcLlteOlxcL1xcc1xcLl17MiwzfShcXC5bXjpcXC9cXHNcXC5d4oCM4oCLezIsM30pPykoOlxcZCspPygkfFxcLykoW14jP1xcc10rKT8oLio/KT8oI1tcXHdcXC1dKyk/JC9cbiAgIFxuICAgIHJldHVybiBudWxsIHVubGVzcyBAZGF0YVtAY3VycmVudFRhYklkXT8ubWFwcz9cblxuICAgIHJlc1BhdGggPSB1cmwubWF0Y2goZmlsZVBhdGhSZWdleCk/WzhdXG4gICAgaWYgbm90IHJlc1BhdGg/XG4gICAgICAjIHRyeSByZWxwYXRoXG4gICAgICByZXNQYXRoID0gdXJsXG5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmVzUGF0aD9cbiAgICBcbiAgICBmb3IgbWFwIGluIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHNcbiAgICAgIHJlc1BhdGggPSB1cmwubWF0Y2gobmV3IFJlZ0V4cChtYXAudXJsKSk/IGFuZCBtYXAudXJsP1xuXG4gICAgICBpZiByZXNQYXRoXG4gICAgICAgIGlmIHJlZmVyZXI/XG4gICAgICAgICAgIyBUT0RPOiB0aGlzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWFwLnVybCksIG1hcC5yZWdleFJlcGxcbiAgICAgICAgYnJlYWtcbiAgICByZXR1cm4gZmlsZVBhdGhcblxuICBVUkx0b0xvY2FsUGF0aDogKHVybCwgY2IpIC0+XG4gICAgZmlsZVBhdGggPSBAUmVkaXJlY3QuZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdCB1cmxcblxuICBnZXRGaWxlTWF0Y2g6IChmaWxlUGF0aCwgY2IpIC0+XG4gICAgcmV0dXJuIGNiPyAnZmlsZSBub3QgZm91bmQnIHVubGVzcyBmaWxlUGF0aD9cbiAgICBzaG93ICd0cnlpbmcgJyArIGZpbGVQYXRoXG4gICAgQGZpbmRGaWxlRm9yUGF0aCBAZGF0YS5kaXJlY3RvcmllcywgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyZWN0b3J5KSA9PlxuXG4gICAgICBpZiBlcnI/IFxuICAgICAgICAjIHNob3cgJ25vIGZpbGVzIGZvdW5kIGZvciAnICsgZmlsZVBhdGhcbiAgICAgICAgcmV0dXJuIGNiPyBlcnJcblxuICAgICAgZGVsZXRlIGZpbGVFbnRyeS5lbnRyeVxuICAgICAgQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzW2ZpbGVQYXRoXSA9IFxuICAgICAgICBmaWxlRW50cnk6IGNocm9tZS5maWxlU3lzdGVtLnJldGFpbkVudHJ5IGZpbGVFbnRyeVxuICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGhcbiAgICAgICAgZGlyZWN0b3J5OiBkaXJlY3RvcnlcbiAgICAgIGNiPyBudWxsLCBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdLCBkaXJlY3RvcnlcbiAgICAgIFxuXG5cbiAgZmluZEZpbGVJbkRpcmVjdG9yaWVzOiAoZGlyZWN0b3JpZXMsIHBhdGgsIGNiKSAtPlxuICAgIG15RGlycyA9IGRpcmVjdG9yaWVzLnNsaWNlKCkgXG4gICAgX3BhdGggPSBwYXRoXG4gICAgX2RpciA9IG15RGlycy5zaGlmdCgpXG5cbiAgICBARlMuZ2V0TG9jYWxGaWxlRW50cnkgX2RpciwgX3BhdGgsIChlcnIsIGZpbGVFbnRyeSkgPT5cbiAgICAgIGlmIGVycj9cbiAgICAgICAgaWYgbXlEaXJzLmxlbmd0aCA+IDBcbiAgICAgICAgICBAZmluZEZpbGVJbkRpcmVjdG9yaWVzIG15RGlycywgX3BhdGgsIGNiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjYj8gJ25vdCBmb3VuZCdcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgX2RpclxuXG4gIGZpbmRGaWxlRm9yUGF0aDogKGRpcnMsIHBhdGgsIGNiKSAtPlxuICAgIEBmaW5kRmlsZUluRGlyZWN0b3JpZXMgZGlycywgcGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXJlY3RvcnkpID0+XG4gICAgICBpZiBlcnI/XG4gICAgICAgIGlmIHBhdGggaXMgcGF0aC5yZXBsYWNlKC8uKj9cXC8vLCAnJylcbiAgICAgICAgICBjYj8gJ25vdCBmb3VuZCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggZGlycywgcGF0aC5yZXBsYWNlKC8uKj9cXC8vLCAnJyksIGNiXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGRpcmVjdG9yeVxuICBcbiAgbWFwQWxsUmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldFJlc291cmNlcyA9PlxuICAgICAgZGVidWdnZXI7XG4gICAgICBuZWVkID0gQGRhdGEuY3VycmVudFJlc291cmNlcy5sZW5ndGhcbiAgICAgIGZvdW5kID0gbm90Rm91bmQgPSAwXG4gICAgICBmb3IgaXRlbSBpbiBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG4gICAgICAgIGxvY2FsUGF0aCA9IEBVUkx0b0xvY2FsUGF0aCBpdGVtLnVybFxuICAgICAgICBpZiBsb2NhbFBhdGg/XG4gICAgICAgICAgQGdldEZpbGVNYXRjaCBsb2NhbFBhdGgsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICAgICAgICBuZWVkLS1cbiAgICAgICAgICAgIHNob3cgYXJndW1lbnRzXG4gICAgICAgICAgICBpZiBlcnI/IHRoZW4gbm90Rm91bmQrK1xuICAgICAgICAgICAgZWxzZSBmb3VuZCsrICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIGlmIG5lZWQgaXMgMFxuICAgICAgICAgICAgICBpZiBmb3VuZCA+IDBcbiAgICAgICAgICAgICAgICBjYj8gbnVsbCwgJ2RvbmUnXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjYj8gJ25vdGhpbmcgZm91bmQnXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIG5lZWQtLVxuICAgICAgICAgIG5vdEZvdW5kKytcbiAgICAgICAgICBpZiBuZWVkIGlzIDBcbiAgICAgICAgICAgIGNiPyAnbm90aGluZyBmb3VuZCdcblxuICBzZXRCYWRnZVRleHQ6ICh0ZXh0LCB0YWJJZCkgLT5cbiAgICBiYWRnZVRleHQgPSB0ZXh0IHx8ICcnICsgT2JqZWN0LmtleXMoQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzKS5sZW5ndGhcbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQgXG4gICAgICB0ZXh0OmJhZGdlVGV4dFxuICAgICAgIyB0YWJJZDp0YWJJZFxuICBcbiAgcmVtb3ZlQmFkZ2VUZXh0Oih0YWJJZCkgLT5cbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQgXG4gICAgICB0ZXh0OicnXG4gICAgICAjIHRhYklkOnRhYklkXG5cbiAgbHNSOiAoZGlyLCBvbnN1Y2Nlc3MsIG9uZXJyb3IpIC0+XG4gICAgQHJlc3VsdHMgPSB7fVxuXG4gICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICBcbiAgICAgIHRvZG8gPSAwXG4gICAgICBpZ25vcmUgPSAvLmdpdHwuaWRlYXxub2RlX21vZHVsZXN8Ym93ZXJfY29tcG9uZW50cy9cbiAgICAgIGRpdmUgPSAoZGlyLCByZXN1bHRzKSAtPlxuICAgICAgICB0b2RvKytcbiAgICAgICAgcmVhZGVyID0gZGlyLmNyZWF0ZVJlYWRlcigpXG4gICAgICAgIHJlYWRlci5yZWFkRW50cmllcyAoZW50cmllcykgLT5cbiAgICAgICAgICB0b2RvLS1cbiAgICAgICAgICBmb3IgZW50cnkgaW4gZW50cmllc1xuICAgICAgICAgICAgZG8gKGVudHJ5KSAtPlxuICAgICAgICAgICAgICByZXN1bHRzW2VudHJ5LmZ1bGxQYXRoXSA9IGVudHJ5XG4gICAgICAgICAgICAgIGlmIGVudHJ5LmZ1bGxQYXRoLm1hdGNoKGlnbm9yZSkgaXMgbnVsbFxuICAgICAgICAgICAgICAgIGlmIGVudHJ5LmlzRGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICB0b2RvKytcbiAgICAgICAgICAgICAgICAgIGRpdmUgZW50cnksIHJlc3VsdHMgXG4gICAgICAgICAgICAgICMgc2hvdyBlbnRyeVxuICAgICAgICAgIHNob3cgJ29uc3VjY2VzcycgaWYgdG9kbyBpcyAwXG4gICAgICAgICAgIyBzaG93ICdvbnN1Y2Nlc3MnIHJlc3VsdHMgaWYgdG9kbyBpcyAwXG4gICAgICAgICwoZXJyb3IpIC0+XG4gICAgICAgICAgdG9kby0tXG4gICAgICAgICAgIyBzaG93IGVycm9yXG4gICAgICAgICAgIyBvbmVycm9yIGVycm9yLCByZXN1bHRzIGlmIHRvZG8gaXMgMCBcblxuICAgICAgIyBjb25zb2xlLmxvZyBkaXZlIGRpckVudHJ5LCBAcmVzdWx0cyAgXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvblxuXG5cbiIsImNsYXNzIENvbmZpZ1xuICAjIEFQUF9JRDogJ2NlY2lmYWZwaGVnaG9mcGZka2hla2tpYmNpYmhnZmVjJ1xuICAjIEVYVEVOU0lPTl9JRDogJ2RkZGltYm5qaWJqY2FmYm9rbmJnaGVoYmZhamdnZ2VwJ1xuICBBUFBfSUQ6ICdkZW5lZmRvb2Zua2dqbXBiZnBrbmlocGdkaGFocGJsaCdcbiAgRVhURU5TSU9OX0lEOiAnaWpjam1wZWpvbm1pbW9vZmJjcGFsaWVqaGlrYWVvbWgnICBcbiAgU0VMRl9JRDogY2hyb21lLnJ1bnRpbWUuaWRcbiAgaXNDb250ZW50U2NyaXB0OiBsb2NhdGlvbi5wcm90b2NvbCBpc250ICdjaHJvbWUtZXh0ZW5zaW9uOidcbiAgRVhUX0lEOiBudWxsXG4gIEVYVF9UWVBFOiBudWxsXG4gIFxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBARVhUX0lEID0gaWYgQEFQUF9JRCBpcyBAU0VMRl9JRCB0aGVuIEBFWFRFTlNJT05fSUQgZWxzZSBAQVBQX0lEXG4gICAgQEVYVF9UWVBFID0gaWYgQEFQUF9JRCBpcyBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcbiAgICBAU0VMRl9UWVBFID0gaWYgQEFQUF9JRCBpc250IEBTRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuXG4gIHdyYXBJbmJvdW5kOiAob2JqLCBmbmFtZSwgZikgLT5cbiAgICAgIF9rbGFzID0gb2JqXG4gICAgICBATElTVEVOLkV4dCBmbmFtZSwgKGFyZ3MpIC0+XG4gICAgICAgIGlmIGFyZ3M/LmlzUHJveHk/XG4gICAgICAgICAgaWYgdHlwZW9mIGFyZ3VtZW50c1sxXSBpcyBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgIGlmIGFyZ3MuYXJndW1lbnRzPy5sZW5ndGggPj0gMFxuICAgICAgICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgYXJncy5hcmd1bWVudHMuY29uY2F0IGFyZ3VtZW50c1sxXSBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIFtdLmNvbmNhdCBhcmd1bWVudHNbMV1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBhcmd1bWVudHNcblxuICB3cmFwT2JqSW5ib3VuZDogKG9iaikgLT5cbiAgICAob2JqW2tleV0gPSBAd3JhcEluYm91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG4gIHdyYXBPdXRib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgLT5cbiAgICAgIG1zZyA9IHt9XG4gICAgICBtc2dbZm5hbWVdID0gXG4gICAgICAgIGlzUHJveHk6dHJ1ZVxuICAgICAgICBhcmd1bWVudHM6QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG4gICAgICBtc2dbZm5hbWVdLmlzUHJveHkgPSB0cnVlXG4gICAgICBfYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuXG4gICAgICBpZiBfYXJncy5sZW5ndGggaXMgMFxuICAgICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cyA9IHVuZGVmaW5lZCBcbiAgICAgICAgcmV0dXJuIEBNU0cuRXh0IG1zZywgKCkgLT4gdW5kZWZpbmVkXG5cbiAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzID0gX2FyZ3NcblxuICAgICAgY2FsbGJhY2sgPSBtc2dbZm5hbWVdLmFyZ3VtZW50cy5wb3AoKVxuICAgICAgaWYgdHlwZW9mIGNhbGxiYWNrIGlzbnQgXCJmdW5jdGlvblwiXG4gICAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzLnB1c2ggY2FsbGJhY2tcbiAgICAgICAgQE1TRy5FeHQgbXNnLCAoKSAtPiB1bmRlZmluZWRcbiAgICAgIGVsc2VcbiAgICAgICAgQE1TRy5FeHQgbXNnLCAoKSA9PlxuICAgICAgICAgIGFyZ3ogPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcbiAgICAgICAgICAjIHByb3h5QXJncyA9IFtpc1Byb3h5OmFyZ3pdXG4gICAgICAgICAgaWYgYXJnej8ubGVuZ3RoID4gMCBhbmQgYXJnelswXT8uaXNQcm94eT9cbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5IEAsIGFyZ3pbMF0uaXNQcm94eSBcblxuICB3cmFwT2JqT3V0Ym91bmQ6IChvYmopIC0+XG4gICAgKG9ialtrZXldID0gQHdyYXBPdXRib3VuZCBvYmosIG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsga2V5LCBvYmpba2V5XSkgZm9yIGtleSBvZiBvYmogd2hlbiB0eXBlb2Ygb2JqW2tleV0gaXMgXCJmdW5jdGlvblwiXG4gICAgb2JqXG5cbm1vZHVsZS5leHBvcnRzID0gQ29uZmlnIiwiZ2V0R2xvYmFsID0gLT5cbiAgX2dldEdsb2JhbCA9IC0+XG4gICAgdGhpc1xuXG4gIF9nZXRHbG9iYWwoKVxuXG5yb290ID0gZ2V0R2xvYmFsKClcblxuIyByb290LmFwcCA9IGFwcCA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG4jIGFwcCA9IG5ldyBsaWIuQXBwbGljYXRpb25cbmNocm9tZS5icm93c2VyQWN0aW9uLnNldFBvcHVwIHBvcHVwOlwicG9wdXAuaHRtbFwiXG5cblxuXG5BcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5SZWRpcmVjdCA9IHJlcXVpcmUgJy4uLy4uL3JlZGlyZWN0LmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuLi8uLi9maWxlc3lzdGVtLmNvZmZlZSdcblNlcnZlciA9IHJlcXVpcmUgJy4uLy4uL3NlcnZlci5jb2ZmZWUnXG5cbnJlZGlyID0gbmV3IFJlZGlyZWN0XG5cbmFwcCA9IHJvb3QuYXBwID0gbmV3IEFwcGxpY2F0aW9uXG4gIFJlZGlyZWN0OiByZWRpclxuICBTdG9yYWdlOiBTdG9yYWdlXG4gIEZTOiBGaWxlU3lzdGVtXG4gIFNlcnZlcjogU2VydmVyXG4gIFxuYXBwLlN0b3JhZ2UucmV0cmlldmVBbGwobnVsbClcbiMgICBhcHAuU3RvcmFnZS5kYXRhW2tdID0gZGF0YVtrXSBmb3IgayBvZiBkYXRhXG4gIFxuY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyICh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSA9PlxuICAjIGlmIHJlZGlyLmRhdGFbdGFiSWRdPy5pc09uXG4gICMgICBhcHAubWFwQWxsUmVzb3VyY2VzICgpID0+XG4gICMgICAgIGNocm9tZS50YWJzLnNldEJhZGdlVGV4dCBcbiAgIyAgICAgICB0ZXh0Ok9iamVjdC5rZXlzKGFwcC5jdXJyZW50RmlsZU1hdGNoZXMpLmxlbmd0aFxuICAjICAgICAgIHRhYklkOnRhYklkXG4gICAgIFxuXG5cbiIsIkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcblxuY2xhc3MgRmlsZVN5c3RlbVxuICBhcGk6IGNocm9tZS5maWxlU3lzdGVtXG4gIHJldGFpbmVkRGlyczoge31cbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIHBsYXRmb3JtOicnXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIGNocm9tZS5ydW50aW1lLmdldFBsYXRmb3JtSW5mbyAoaW5mbykgPT5cbiAgICAgIEBwbGF0Zm9ybSA9IGluZm9cbiAgIyBAZGlyczogbmV3IERpcmVjdG9yeVN0b3JlXG4gICMgZmlsZVRvQXJyYXlCdWZmZXI6IChibG9iLCBvbmxvYWQsIG9uZXJyb3IpIC0+XG4gICMgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICMgICByZWFkZXIub25sb2FkID0gb25sb2FkXG5cbiAgIyAgIHJlYWRlci5vbmVycm9yID0gb25lcnJvclxuXG4gICMgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgYmxvYlxuXG4gIHJlYWRGaWxlOiAoZGlyRW50cnksIHBhdGgsIGNiKSAtPlxuICAgICMgcGF0aCA9IHBhdGgucmVwbGFjZSgvXFwvL2csJ1xcXFwnKSBpZiBwbGF0Zm9ybSBpcyAnd2luJ1xuICAgIEBnZXRGaWxlRW50cnkgZGlyRW50cnksIHBhdGgsXG4gICAgICAoZXJyLCBmaWxlRW50cnkpID0+XG4gICAgICAgIFxuICAgICAgICBpZiBlcnI/IHRoZW4gcmV0dXJuIGNiPyBlcnJcblxuICAgICAgICBmaWxlRW50cnkuZmlsZSAoZmlsZSkgPT5cbiAgICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBmaWxlXG4gICAgICAgICwoZXJyKSA9PiBjYj8gZXJyXG5cbiAgZ2V0RmlsZUVudHJ5OiAoZGlyRW50cnksIHBhdGgsIGNiKSAtPlxuICAgICMgcGF0aCA9IHBhdGgucmVwbGFjZSgvXFwvL2csJ1xcXFwnKSBpZiBwbGF0Zm9ybSBpcyAnd2luJ1xuICAgIGRpckVudHJ5LmdldEZpbGUgcGF0aCwge30sIChmaWxlRW50cnkpID0+XG4gICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5XG4gICAgLChlcnIpID0+IGNiPyBlcnJcblxuICAjIG9wZW5EaXJlY3Rvcnk6IChjYWxsYmFjaykgLT5cbiAgb3BlbkRpcmVjdG9yeTogKGRpcmVjdG9yeUVudHJ5LCBjYikgLT5cbiAgIyBAYXBpLmNob29zZUVudHJ5IHR5cGU6J29wZW5EaXJlY3RvcnknLCAoZGlyZWN0b3J5RW50cnksIGZpbGVzKSA9PlxuICAgIEBhcGkuZ2V0RGlzcGxheVBhdGggZGlyZWN0b3J5RW50cnksIChwYXRoTmFtZSkgPT5cbiAgICAgIGRpciA9XG4gICAgICAgICAgcmVsUGF0aDogZGlyZWN0b3J5RW50cnkuZnVsbFBhdGggIy5yZXBsYWNlKCcvJyArIGRpcmVjdG9yeUVudHJ5Lm5hbWUsICcnKVxuICAgICAgICAgIGRpcmVjdG9yeUVudHJ5SWQ6IEBhcGkucmV0YWluRW50cnkoZGlyZWN0b3J5RW50cnkpXG4gICAgICAgICAgZW50cnk6IGRpcmVjdG9yeUVudHJ5XG4gICAgICBjYj8gbnVsbCwgcGF0aE5hbWUsIGRpclxuICAgICAgICAgICMgQGdldE9uZURpckxpc3QgZGlyXG4gICAgICAgICAgIyBTdG9yYWdlLnNhdmUgJ2RpcmVjdG9yaWVzJywgQHNjb3BlLmRpcmVjdG9yaWVzIChyZXN1bHQpIC0+XG5cbiAgZ2V0TG9jYWxGaWxlRW50cnk6IChkaXIsIGZpbGVQYXRoLCBjYikgPT4gXG4gICAgIyBmaWxlUGF0aCA9IGZpbGVQYXRoLnJlcGxhY2UoL1xcLy9nLCdcXFxcJykgaWYgcGxhdGZvcm0gaXMgJ3dpbidcbiAgICBkaXJFbnRyeSA9IGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKCkgLT5cbiAgICBpZiBub3QgZGlyRW50cnk/XG4gICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgICAgICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgZmlsZVBhdGgsIGNiXG4gICAgZWxzZVxuICAgICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgZmlsZVBhdGgsIGNiXG5cblxuXG4gICMgZ2V0TG9jYWxGaWxlOiAoZGlyLCBmaWxlUGF0aCwgY2IsIGVycm9yKSA9PiBcbiAgIyAjIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAjICMgICBkaXJFbnRyeSA9IEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdXG4gICMgIyAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgIyAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAjICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAjICAgICAsKF9lcnJvcikgPT4gZXJyb3IoX2Vycm9yKVxuICAjICMgZWxzZVxuICAjICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICMgICAgICMgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0gPSBkaXJFbnRyeVxuICAjICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgaWYgZXJyPyB0aGVuIGNiPyBlcnJcbiAgIyAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBmaWxlXG4gICMgICAsKF9lcnJvcikgPT4gY2I/KF9lcnJvcilcblxuICAgICAgIyBAZmluZEZpbGVGb3JRdWVyeVN0cmluZyBpbmZvLnVyaSwgc3VjY2VzcyxcbiAgICAgICMgICAgIChlcnIpID0+XG4gICAgICAjICAgICAgICAgQGZpbmRGaWxlRm9yUGF0aCBpbmZvLCBjYlxuXG4gICMgZmluZEZpbGVGb3JQYXRoOiAoaW5mbywgY2IpID0+XG4gICMgICAgIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBjYiwgaW5mby5yZWZlcmVyXG5cbiAgIyBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nOiAoX3VybCwgY2IsIGVycm9yLCByZWZlcmVyKSA9PlxuICAjICAgICB1cmwgPSBkZWNvZGVVUklDb21wb25lbnQoX3VybCkucmVwbGFjZSAvLio/c2xyZWRpclxcPS8sICcnXG5cbiAgIyAgICAgbWF0Y2ggPSBpdGVtIGZvciBpdGVtIGluIEBtYXBzIHdoZW4gdXJsLm1hdGNoKG5ldyBSZWdFeHAoaXRlbS51cmwpKT8gYW5kIGl0ZW0udXJsPyBhbmQgbm90IG1hdGNoP1xuXG4gICMgICAgIGlmIG1hdGNoP1xuICAjICAgICAgICAgaWYgcmVmZXJlcj9cbiAgIyAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5tYXRjaCgvLipcXC9cXC8uKj9cXC8oLiopLyk/WzFdXG4gICMgICAgICAgICBlbHNlXG4gICMgICAgICAgICAgICAgZmlsZVBhdGggPSB1cmwucmVwbGFjZSBuZXcgUmVnRXhwKG1hdGNoLnVybCksIG1hdGNoLnJlZ2V4UmVwbFxuXG4gICMgICAgICAgICBmaWxlUGF0aC5yZXBsYWNlICcvJywgJ1xcXFwnIGlmIHBsYXRmb3JtIGlzICd3aW4nXG5cbiAgIyAgICAgICAgIGRpciA9IEBTdG9yYWdlLmRhdGEuZGlyZWN0b3JpZXNbbWF0Y2guZGlyZWN0b3J5XVxuXG4gICMgICAgICAgICBpZiBub3QgZGlyPyB0aGVuIHJldHVybiBlcnIgJ25vIG1hdGNoJ1xuXG4gICMgICAgICAgICBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgIyAgICAgICAgICAgICBkaXJFbnRyeSA9IEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdXG4gICMgICAgICAgICAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgICAgIGVsc2VcbiAgIyAgICAgICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0gPSBkaXJFbnRyeVxuICAjICAgICAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICAgICAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICAgICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgIGVsc2VcbiAgIyAgICAgICAgIGVycm9yKClcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlU3lzdGVtIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBMSVNURU4gZXh0ZW5kcyBDb25maWdcbiAgbG9jYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGV4dGVybmFsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWxcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGluc3RhbmNlID0gbnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuXG4gICAgQGxvY2FsLmFwaS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZVxuICAgIEBleHRlcm5hbC5hcGk/LmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICBAZ2V0OiAoKSAtPlxuICAgIGluc3RhbmNlID89IG5ldyBMSVNURU5cblxuICBzZXRQb3J0OiAocG9ydCkgLT5cbiAgICBAcG9ydCA9IHBvcnRcbiAgICBwb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgTG9jYWw6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICBAbG9jYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBFeHQ6IChtZXNzYWdlLCBjYWxsYmFjaykgPT5cbiAgICAjIHNob3cgJ2FkZGluZyBleHQgbGlzdGVuZXIgZm9yICcgKyBtZXNzYWdlXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgX29uTWVzc2FnZUV4dGVybmFsOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgcmVzcG9uc2VTdGF0dXMgPSBjYWxsZWQ6ZmFsc2VcblxuICAgIF9zZW5kUmVzcG9uc2UgPSAod2hhdGV2ZXIuLi4pID0+XG4gICAgICB0cnlcbiAgICAgICAgIyB3aGF0ZXZlci5zaGlmdCgpIGlmIHdoYXRldmVyWzBdIGlzIG51bGwgYW5kIHdoYXRldmVyWzFdP1xuICAgICAgICBzZW5kUmVzcG9uc2UuYXBwbHkgbnVsbCxwcm94eUFyZ3MgPSBbaXNQcm94eTp3aGF0ZXZlcl1cblxuICAgICAgY2F0Y2ggZVxuICAgICAgICB1bmRlZmluZWQgIyBlcnJvciBiZWNhdXNlIG5vIHJlc3BvbnNlIHdhcyByZXF1ZXN0ZWQgZnJvbSB0aGUgTVNHLCBkb24ndCBjYXJlXG4gICAgICByZXNwb25zZVN0YXR1cy5jYWxsZWQgPSB0cnVlXG4gICAgICBcbiAgICAjIChzaG93IFwiPD09IEdPVCBFWFRFUk5BTCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgaWYgc2VuZGVyLmlkPyBcbiAgICAgIGlmIHNlbmRlci5pZCBpc250IEBFWFRfSUQgI2FuZCBzZW5kZXIuY29uc3RydWN0b3IubmFtZSBpc250ICdQb3J0J1xuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgIEBleHRlcm5hbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBfc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuICAgIFxuICAgIHVubGVzcyByZXNwb25zZVN0YXR1cy5jYWxsZWQgIyBmb3Igc3luY2hyb25vdXMgc2VuZFJlc3BvbnNlXG4gICAgICAjIHNob3cgJ3JldHVybmluZyB0cnVlJ1xuICAgICAgcmV0dXJuIHRydWVcblxuICBfb25NZXNzYWdlOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgcmVzcG9uc2VTdGF0dXMgPSBjYWxsZWQ6ZmFsc2VcbiAgICBfc2VuZFJlc3BvbnNlID0gPT5cbiAgICAgIHRyeVxuICAgICAgICAjIHNob3cgJ2NhbGxpbmcgc2VuZHJlc3BvbnNlJ1xuICAgICAgICBzZW5kUmVzcG9uc2UuYXBwbHkgdGhpcyxhcmd1bWVudHNcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgIyBzaG93IGVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcblxuICAgICMgKHNob3cgXCI8PT0gR09UIE1FU1NBR0UgPT0gI3sgQEVYVF9UWVBFIH0gPT1cIiArIF9rZXkpIGZvciBfa2V5IG9mIHJlcXVlc3RcbiAgICBAbG9jYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgX3NlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcblxuICAgIHVubGVzcyByZXNwb25zZVN0YXR1cy5jYWxsZWRcbiAgICAgICMgc2hvdyAncmV0dXJuaW5nIHRydWUnXG4gICAgICByZXR1cm4gdHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IExJU1RFTiIsIkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcblxuY2xhc3MgTVNHIGV4dGVuZHMgQ29uZmlnXG4gIGluc3RhbmNlID0gbnVsbFxuICBwb3J0Om51bGxcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcblxuICBAZ2V0OiAoKSAtPlxuICAgIGluc3RhbmNlID89IG5ldyBNU0dcblxuICBAY3JlYXRlUG9ydDogKCkgLT5cblxuICBzZXRQb3J0OiAocG9ydCkgLT5cbiAgICBAcG9ydCA9IHBvcnRcblxuICBMb2NhbDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0OiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICAoc2hvdyBcIj09IE1FU1NBR0UgRVhURVJOQUwgI3sgX2tleSB9ID09PlwiKSBmb3IgX2tleSBvZiBtZXNzYWdlXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgQEVYVF9JRCwgbWVzc2FnZSwgcmVzcG9uZFxuICBFeHRQb3J0OiAobWVzc2FnZSkgLT5cbiAgICB0cnlcbiAgICAgIEBwb3J0LnBvc3RNZXNzYWdlIG1lc3NhZ2VcbiAgICBjYXRjaFxuICAgICAgc2hvdyAnZXJyb3InXG4gICAgICAjIEBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuICAgICAgIyBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG5cbm1vZHVsZS5leHBvcnRzID0gTVNHIiwiLyoqXG4gKiBERVZFTE9QRUQgQllcbiAqIEdJTCBMT1BFUyBCVUVOT1xuICogZ2lsYnVlbm8ubWFpbEBnbWFpbC5jb21cbiAqXG4gKiBXT1JLUyBXSVRIOlxuICogSUUgOSssIEZGIDQrLCBTRiA1KywgV2ViS2l0LCBDSCA3KywgT1AgMTIrLCBCRVNFTiwgUmhpbm8gMS43K1xuICpcbiAqIEZPUks6XG4gKiBodHRwczovL2dpdGh1Yi5jb20vbWVsYW5rZS9XYXRjaC5KU1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAgICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb21lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAgICAgLy8gbGlrZSBOb2RlLlxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICAgICAgd2luZG93LldhdGNoSlMgPSBmYWN0b3J5KCk7XG4gICAgICAgIHdpbmRvdy53YXRjaCA9IHdpbmRvdy5XYXRjaEpTLndhdGNoO1xuICAgICAgICB3aW5kb3cudW53YXRjaCA9IHdpbmRvdy5XYXRjaEpTLnVud2F0Y2g7XG4gICAgICAgIHdpbmRvdy5jYWxsV2F0Y2hlcnMgPSB3aW5kb3cuV2F0Y2hKUy5jYWxsV2F0Y2hlcnM7XG4gICAgfVxufShmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgV2F0Y2hKUyA9IHtcbiAgICAgICAgbm9Nb3JlOiBmYWxzZVxuICAgIH0sXG4gICAgbGVuZ3Roc3ViamVjdHMgPSBbXTtcblxuICAgIHZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKGZ1bmN0aW9uVG9DaGVjaykge1xuICAgICAgICAgICAgdmFyIGdldFR5cGUgPSB7fTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvblRvQ2hlY2sgJiYgZ2V0VHlwZS50b1N0cmluZy5jYWxsKGZ1bmN0aW9uVG9DaGVjaykgPT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9O1xuXG4gICAgdmFyIGlzSW50ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIHggJSAxID09PSAwO1xuICAgIH07XG5cbiAgICB2YXIgaXNBcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIHZhciBnZXRPYmpEaWZmID0gZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHZhciBhcGx1cyA9IFtdLFxuICAgICAgICBicGx1cyA9IFtdO1xuXG4gICAgICAgIGlmKCEodHlwZW9mIGEgPT0gXCJzdHJpbmdcIikgJiYgISh0eXBlb2YgYiA9PSBcInN0cmluZ1wiKSl7XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KGEpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJbaV0gPT09IHVuZGVmaW5lZCkgYXBsdXMucHVzaChpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBhKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGEuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGJbaV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwbHVzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KGIpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaj0wOyBqPGIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFbal0gPT09IHVuZGVmaW5lZCkgYnBsdXMucHVzaChqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaiBpbiBiKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGIuaGFzT3duUHJvcGVydHkoaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFbal0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJwbHVzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWRkZWQ6IGFwbHVzLFxuICAgICAgICAgICAgcmVtb3ZlZDogYnBsdXNcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY2xvbmUgPSBmdW5jdGlvbihvYmope1xuXG4gICAgICAgIGlmIChudWxsID09IG9iaiB8fCBcIm9iamVjdFwiICE9IHR5cGVvZiBvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29weSA9IG9iai5jb25zdHJ1Y3RvcigpO1xuXG4gICAgICAgIGZvciAodmFyIGF0dHIgaW4gb2JqKSB7XG4gICAgICAgICAgICBjb3B5W2F0dHJdID0gb2JqW2F0dHJdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvcHk7XG5cbiAgICB9XG5cbiAgICB2YXIgZGVmaW5lR2V0QW5kU2V0ID0gZnVuY3Rpb24gKG9iaiwgcHJvcE5hbWUsIGdldHRlciwgc2V0dGVyKSB7XG4gICAgICAgIHRyeSB7XG5cblxuICAgICAgICAgICAgT2JqZWN0Lm9ic2VydmUob2JqLCBmdW5jdGlvbihjaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgY2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKGNoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhbmdlLm5hbWUgPT09IHByb3BOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0ZXIoY2hhbmdlLm9iamVjdFtjaGFuZ2UubmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9IGNhdGNoKGUpIHtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcE5hbWUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXQ6IGdldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXQ6IHNldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2goZTIpIHtcbiAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVHZXR0ZXJfXy5jYWxsKG9iaiwgcHJvcE5hbWUsIGdldHRlcik7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVTZXR0ZXJfXy5jYWxsKG9iaiwgcHJvcE5hbWUsIHNldHRlcik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlMykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ3YXRjaEpTIGVycm9yOiBicm93c2VyIG5vdCBzdXBwb3J0ZWQgOi9cIilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZGVmaW5lUHJvcCA9IGZ1bmN0aW9uIChvYmosIHByb3BOYW1lLCB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcE5hbWUsIHtcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIG9ialtwcm9wTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgd2F0Y2ggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24oYXJndW1lbnRzWzFdKSkge1xuICAgICAgICAgICAgd2F0Y2hBbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHdhdGNoTWFueS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2F0Y2hPbmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgdmFyIHdhdGNoQWxsID0gZnVuY3Rpb24gKG9iaiwgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpIHtcblxuICAgICAgICBpZiAoKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9wcyA9IFtdO1xuXG5cbiAgICAgICAgaWYoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wID0gMDsgcHJvcCA8IG9iai5sZW5ndGg7IHByb3ArKykgeyAvL2ZvciBlYWNoIGl0ZW0gaWYgb2JqIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBvYmopIHsgLy9mb3IgZWFjaCBhdHRyaWJ1dGUgaWYgb2JqIGlzIGFuIG9iamVjdFxuXHRcdFx0XHRpZiAocHJvcDIgPT0gXCIkdmFsXCIpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3AyKSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3AyKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgd2F0Y2hNYW55KG9iaiwgcHJvcHMsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKTsgLy93YXRjaCBhbGwgaXRlbXMgb2YgdGhlIHByb3BzXG5cbiAgICAgICAgaWYgKGFkZE5SZW1vdmUpIHtcbiAgICAgICAgICAgIHB1c2hUb0xlbmd0aFN1YmplY3RzKG9iaiwgXCIkJHdhdGNobGVuZ3Roc3ViamVjdHJvb3RcIiwgd2F0Y2hlciwgbGV2ZWwpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdmFyIHdhdGNoTWFueSA9IGZ1bmN0aW9uIChvYmosIHByb3BzLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCkge1xuXG4gICAgICAgIGlmICgodHlwZW9mIG9iaiA9PSBcInN0cmluZ1wiKSB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHByb3BzLmxlbmd0aDsgaSsrKSB7IC8vd2F0Y2ggZWFjaCBwcm9wZXJ0eVxuICAgICAgICAgICAgdmFyIHByb3AgPSBwcm9wc1tpXTtcbiAgICAgICAgICAgIHdhdGNoT25lKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHdhdGNoT25lID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpIHtcblxuICAgICAgICBpZiAoKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGlzRnVuY3Rpb24ob2JqW3Byb3BdKSkgeyAvL2RvbnQgd2F0Y2ggaWYgaXQgaXMgYSBmdW5jdGlvblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9ialtwcm9wXSAhPSBudWxsICYmIChsZXZlbCA9PT0gdW5kZWZpbmVkIHx8IGxldmVsID4gMCkpe1xuICAgICAgICAgICAgd2F0Y2hBbGwob2JqW3Byb3BdLCB3YXRjaGVyLCBsZXZlbCE9PXVuZGVmaW5lZD8gbGV2ZWwtMSA6IGxldmVsLG51bGwsIHBhdGggKyAnLicgKyBwcm9wKTsgLy9yZWN1cnNpdmVseSB3YXRjaCBhbGwgYXR0cmlidXRlcyBvZiB0aGlzXG4gICAgICAgIH1cblxuICAgICAgICBkZWZpbmVXYXRjaGVyKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIHBhdGgpO1xuXG4gICAgICAgIGlmKGFkZE5SZW1vdmUgJiYgKGxldmVsID09PSB1bmRlZmluZWQgfHwgbGV2ZWwgPiAwKSl7XG4gICAgICAgICAgICBwdXNoVG9MZW5ndGhTdWJqZWN0cyhvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB1bndhdGNoID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHVud2F0Y2hBbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHVud2F0Y2hNYW55LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1bndhdGNoT25lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgdW53YXRjaEFsbCA9IGZ1bmN0aW9uIChvYmosIHdhdGNoZXIpIHtcblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgU3RyaW5nIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgPSAwOyBwcm9wIDwgb2JqLmxlbmd0aDsgcHJvcCsrKSB7IC8vZm9yIGVhY2ggaXRlbSBpZiBvYmogaXMgYW4gYXJyYXlcbiAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3ApOyAvL3B1dCBpbiB0aGUgcHJvcHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVud2F0Y2hNYW55KG9iaiwgcHJvcHMsIHdhdGNoZXIpOyAvL3dhdGNoIGFsbCBpdGVucyBvZiB0aGUgcHJvcHNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB1bndhdGNoUHJvcHNJbk9iamVjdCA9IGZ1bmN0aW9uIChvYmoyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb3BzID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcDIgaW4gb2JqMikgeyAvL2ZvciBlYWNoIGF0dHJpYnV0ZSBpZiBvYmogaXMgYW4gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmoyLmhhc093blByb3BlcnR5KHByb3AyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9iajJbcHJvcDJdIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW53YXRjaFByb3BzSW5PYmplY3Qob2JqMltwcm9wMl0pOyAvL3JlY3VycyBpbnRvIG9iamVjdCBwcm9wc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHByb3AyKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdW53YXRjaE1hbnkob2JqMiwgcHJvcHMsIHdhdGNoZXIpOyAvL3Vud2F0Y2ggYWxsIG9mIHRoZSBwcm9wc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHVud2F0Y2hQcm9wc0luT2JqZWN0KG9iaik7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICB2YXIgdW53YXRjaE1hbnkgPSBmdW5jdGlvbiAob2JqLCBwcm9wcywgd2F0Y2hlcikge1xuXG4gICAgICAgIGZvciAodmFyIHByb3AyIGluIHByb3BzKSB7IC8vd2F0Y2ggZWFjaCBhdHRyaWJ1dGUgb2YgXCJwcm9wc1wiIGlmIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHByb3AyKSkge1xuICAgICAgICAgICAgICAgIHVud2F0Y2hPbmUob2JqLCBwcm9wc1twcm9wMl0sIHdhdGNoZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBkZWZpbmVXYXRjaGVyID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgd2F0Y2hlciwgbGV2ZWwsIHBhdGgpIHtcblxuICAgICAgICB2YXIgdmFsID0gb2JqW3Byb3BdO1xuXG4gICAgICAgIHdhdGNoRnVuY3Rpb25zKG9iaiwgcHJvcCk7XG5cbiAgICAgICAgaWYgKCFvYmoud2F0Y2hlcnMpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3Aob2JqLCBcIndhdGNoZXJzXCIsIHt9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb2JqLl9wYXRoKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wKG9iaiwgXCJfcGF0aFwiLCBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb2JqLndhdGNoZXJzW3Byb3BdKSB7XG4gICAgICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxvYmoud2F0Y2hlcnNbcHJvcF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKG9iai53YXRjaGVyc1twcm9wXVtpXSA9PT0gd2F0Y2hlcil7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0ucHVzaCh3YXRjaGVyKTsgLy9hZGQgdGhlIG5ldyB3YXRjaGVyIGluIHRoZSB3YXRjaGVycyBhcnJheVxuXG5cbiAgICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH07XG5cblxuICAgICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld3ZhbCkge1xuICAgICAgICAgICAgdmFyIG9sZHZhbCA9IHZhbDtcbiAgICAgICAgICAgIHZhbCA9IG5ld3ZhbDtcblxuICAgICAgICAgICAgaWYgKGxldmVsICE9PSAwICYmIG9ialtwcm9wXSl7XG4gICAgICAgICAgICAgICAgLy8gd2F0Y2ggc3ViIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICB3YXRjaEFsbChvYmpbcHJvcF0sIHdhdGNoZXIsIChsZXZlbD09PXVuZGVmaW5lZCk/bGV2ZWw6bGV2ZWwtMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdhdGNoRnVuY3Rpb25zKG9iaiwgcHJvcCk7XG5cbiAgICAgICAgICAgIGlmICghV2F0Y2hKUy5ub01vcmUpe1xuICAgICAgICAgICAgICAgIC8vaWYgKEpTT04uc3RyaW5naWZ5KG9sZHZhbCkgIT09IEpTT04uc3RyaW5naWZ5KG5ld3ZhbCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkdmFsICE9PSBuZXd2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKG9iaiwgcHJvcCwgXCJzZXRcIiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgICAgICAgICBXYXRjaEpTLm5vTW9yZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBkZWZpbmVHZXRBbmRTZXQob2JqLCBwcm9wLCBnZXR0ZXIsIHNldHRlcik7XG5cbiAgICB9O1xuXG4gICAgdmFyIGNhbGxXYXRjaGVycyA9IGZ1bmN0aW9uIChvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpIHtcbiAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yICh2YXIgd3I9MDsgd3I8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgd3IrKykge1xuICAgICAgICAgICAgICAgIG9iai53YXRjaGVyc1twcm9wXVt3cl0uY2FsbChvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHsvL2NhbGwgYWxsXG4gICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBhY3Rpb24sIG5ld3ZhbCwgb2xkdmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQHRvZG8gY29kZSByZWxhdGVkIHRvIFwid2F0Y2hGdW5jdGlvbnNcIiBpcyBjZXJ0YWlubHkgYnVnZ3lcbiAgICB2YXIgbWV0aG9kTmFtZXMgPSBbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzbGljZScsICd1bnNoaWZ0JywgJ3NwbGljZSddO1xuICAgIHZhciBkZWZpbmVBcnJheU1ldGhvZFdhdGNoZXIgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCBvcmlnaW5hbCwgbWV0aG9kTmFtZSkge1xuICAgICAgICBkZWZpbmVQcm9wKG9ialtwcm9wXSwgbWV0aG9kTmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gb3JpZ2luYWwuYXBwbHkob2JqW3Byb3BdLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgd2F0Y2hPbmUob2JqLCBvYmpbcHJvcF0pO1xuICAgICAgICAgICAgaWYgKG1ldGhvZE5hbWUgIT09ICdzbGljZScpIHtcbiAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBtZXRob2ROYW1lLGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgd2F0Y2hGdW5jdGlvbnMgPSBmdW5jdGlvbihvYmosIHByb3ApIHtcblxuICAgICAgICBpZiAoKCFvYmpbcHJvcF0pIHx8IChvYmpbcHJvcF0gaW5zdGFuY2VvZiBTdHJpbmcpIHx8ICghaXNBcnJheShvYmpbcHJvcF0pKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IG1ldGhvZE5hbWVzLmxlbmd0aCwgbWV0aG9kTmFtZTsgaS0tOykge1xuICAgICAgICAgICAgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgICAgICAgZGVmaW5lQXJyYXlNZXRob2RXYXRjaGVyKG9iaiwgcHJvcCwgb2JqW3Byb3BdW21ldGhvZE5hbWVdLCBtZXRob2ROYW1lKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB1bndhdGNoT25lID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgd2F0Y2hlcikge1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdyA9IG9iai53YXRjaGVyc1twcm9wXVtpXTtcblxuICAgICAgICAgICAgaWYodyA9PSB3YXRjaGVyKSB7XG4gICAgICAgICAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbW92ZUZyb21MZW5ndGhTdWJqZWN0cyhvYmosIHByb3AsIHdhdGNoZXIpO1xuICAgIH07XG5cbiAgICB2YXIgbG9vcCA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgZm9yKHZhciBpPTA7IGk8bGVuZ3Roc3ViamVjdHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgdmFyIHN1YmogPSBsZW5ndGhzdWJqZWN0c1tpXTtcblxuICAgICAgICAgICAgaWYgKHN1YmoucHJvcCA9PT0gXCIkJHdhdGNobGVuZ3Roc3ViamVjdHJvb3RcIikge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpZmZlcmVuY2UgPSBnZXRPYmpEaWZmKHN1Ymoub2JqLCBzdWJqLmFjdHVhbCk7XG5cbiAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCB8fCBkaWZmZXJlbmNlLnJlbW92ZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZCAhPSBkaWZmZXJlbmNlLnJlbW92ZWQgJiYgKGRpZmZlcmVuY2UuYWRkZWRbMF0gIT0gZGlmZmVyZW5jZS5yZW1vdmVkWzBdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoTWFueShzdWJqLm9iaiwgZGlmZmVyZW5jZS5hZGRlZCwgc3Viai53YXRjaGVyLCBzdWJqLmxldmVsIC0gMSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Ymoud2F0Y2hlci5jYWxsKHN1Ymoub2JqLCBcInJvb3RcIiwgXCJkaWZmZXJlbnRhdHRyXCIsIGRpZmZlcmVuY2UsIHN1YmouYWN0dWFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWJqLmFjdHVhbCA9IGNsb25lKHN1Ymoub2JqKTtcblxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKHN1Ymoub2JqW3N1YmoucHJvcF0gPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHZhciBkaWZmZXJlbmNlID0gZ2V0T2JqRGlmZihzdWJqLm9ialtzdWJqLnByb3BdLCBzdWJqLmFjdHVhbCk7XG5cbiAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCB8fCBkaWZmZXJlbmNlLnJlbW92ZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaj0wOyBqPHN1Ymoub2JqLndhdGNoZXJzW3N1YmoucHJvcF0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaE1hbnkoc3Viai5vYmpbc3Viai5wcm9wXSwgZGlmZmVyZW5jZS5hZGRlZCwgc3Viai5vYmoud2F0Y2hlcnNbc3Viai5wcm9wXVtqXSwgc3Viai5sZXZlbCAtIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKHN1Ymoub2JqLCBzdWJqLnByb3AsIFwiZGlmZmVyZW50YXR0clwiLCBkaWZmZXJlbmNlLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3Viai5hY3R1YWwgPSBjbG9uZShzdWJqLm9ialtzdWJqLnByb3BdKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgcHVzaFRvTGVuZ3RoU3ViamVjdHMgPSBmdW5jdGlvbihvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsKXtcblxuICAgICAgICB2YXIgYWN0dWFsO1xuXG4gICAgICAgIGlmIChwcm9wID09PSBcIiQkd2F0Y2hsZW5ndGhzdWJqZWN0cm9vdFwiKSB7XG4gICAgICAgICAgICBhY3R1YWwgPSAgY2xvbmUob2JqKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjdHVhbCA9IGNsb25lKG9ialtwcm9wXSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZW5ndGhzdWJqZWN0cy5wdXNoKHtcbiAgICAgICAgICAgIG9iajogb2JqLFxuICAgICAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgICAgIGFjdHVhbDogYWN0dWFsLFxuICAgICAgICAgICAgd2F0Y2hlcjogd2F0Y2hlcixcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHJlbW92ZUZyb21MZW5ndGhTdWJqZWN0cyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCwgd2F0Y2hlcil7XG5cbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPGxlbmd0aHN1YmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc3ViaiA9IGxlbmd0aHN1YmplY3RzW2ldO1xuXG4gICAgICAgICAgICBpZiAoc3Viai5vYmogPT0gb2JqICYmIHN1YmoucHJvcCA9PSBwcm9wICYmIHN1Ymoud2F0Y2hlciA9PSB3YXRjaGVyKSB7XG4gICAgICAgICAgICAgICAgbGVuZ3Roc3ViamVjdHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgc2V0SW50ZXJ2YWwobG9vcCwgNTApO1xuXG4gICAgV2F0Y2hKUy53YXRjaCA9IHdhdGNoO1xuICAgIFdhdGNoSlMudW53YXRjaCA9IHVud2F0Y2g7XG4gICAgV2F0Y2hKUy5jYWxsV2F0Y2hlcnMgPSBjYWxsV2F0Y2hlcnM7XG5cbiAgICByZXR1cm4gV2F0Y2hKUztcblxufSkpO1xuIiwiY2xhc3MgTm90aWZpY2F0aW9uXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gIHNob3c6ICh0aXRsZSwgbWVzc2FnZSkgLT5cbiAgICB1bmlxdWVJZCA9IChsZW5ndGg9OCkgLT5cbiAgICAgIGlkID0gXCJcIlxuICAgICAgaWQgKz0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpIHdoaWxlIGlkLmxlbmd0aCA8IGxlbmd0aFxuICAgICAgaWQuc3Vic3RyIDAsIGxlbmd0aFxuXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlIHVuaXF1ZUlkKCksXG4gICAgICB0eXBlOidiYXNpYydcbiAgICAgIHRpdGxlOnRpdGxlXG4gICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICBpY29uVXJsOidpbWFnZXMvaWNvbi0zOC5wbmcnLFxuICAgICAgKGNhbGxiYWNrKSAtPlxuICAgICAgICB1bmRlZmluZWRcblxubW9kdWxlLmV4cG9ydHMgPSBOb3RpZmljYXRpb24iLCJjbGFzcyBSZWRpcmVjdFxuICBkYXRhOnt9XG4gIFxuICBwcmVmaXg6bnVsbFxuICBjdXJyZW50TWF0Y2hlczp7fVxuICBjdXJyZW50VGFiSWQ6IG51bGxcbiAgIyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNzc1NVxuICAjIHVybDogUmVnRXhwWyckJiddLFxuICAjIHByb3RvY29sOlJlZ0V4cC4kMixcbiAgIyBob3N0OlJlZ0V4cC4kMyxcbiAgIyBwYXRoOlJlZ0V4cC4kNCxcbiAgIyBmaWxlOlJlZ0V4cC4kNiwgLy8gOFxuICAjIHF1ZXJ5OlJlZ0V4cC4kNyxcbiAgIyBoYXNoOlJlZ0V4cC4kOFxuICAgICAgICAgXG4gIGNvbnN0cnVjdG9yOiAtPlxuICBcbiAgZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdDogKHVybCkgPT5cbiAgICBmaWxlUGF0aFJlZ2V4ID0gL14oKGh0dHBbc10/fGZ0cHxjaHJvbWUtZXh0ZW5zaW9ufGZpbGUpOlxcL1xcLyk/XFwvPyhbXlxcL1xcLl0rXFwuKSo/KFteXFwvXFwuXStcXC5bXjpcXC9cXHNcXC5dezIsM30oXFwuW146XFwvXFxzXFwuXeKAjOKAi3syLDN9KT8pKDpcXGQrKT8oJHxcXC8pKFteIz9cXHNdKyk/KC4qPyk/KCNbXFx3XFwtXSspPyQvXG4gICBcbiAgICBfbWFwcyA9IFtdXG4gICAgaWYgQGRhdGFbQGN1cnJlbnRUYWJJZF0/XG4gICAgICBfbWFwcy5wdXNoIG1hcCBmb3IgbWFwIGluIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHMgd2hlbiBtYXAuaXNPblxuICAgIFxuICAgIHJldHVybiBudWxsIHVubGVzcyBfbWFwcy5sZW5ndGggPiAwXG5cbiAgICByZXNQYXRoID0gdXJsLm1hdGNoKGZpbGVQYXRoUmVnZXgpP1s4XVxuICAgIGlmIG5vdCByZXNQYXRoP1xuICAgICAgIyB0cnkgcmVscGF0aFxuICAgICAgcmVzUGF0aCA9IHVybFxuXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHJlc1BhdGg/XG4gICAgXG4gICAgZm9yIG1hcCBpbiBfbWFwc1xuICAgICAgcmVzUGF0aCA9IHVybC5tYXRjaChuZXcgUmVnRXhwKG1hcC51cmwpKT8gYW5kIG1hcC51cmw/XG5cbiAgICAgIGlmIHJlc1BhdGhcbiAgICAgICAgaWYgcmVmZXJlcj9cbiAgICAgICAgICAjIFRPRE86IHRoaXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXAudXJsKSwgbWFwLnJlZ2V4UmVwbFxuICAgICAgICBicmVha1xuICAgIHJldHVybiBmaWxlUGF0aFxuXG4gIHRhYjogKHRhYklkKSAtPlxuICAgIEBjdXJyZW50VGFiSWQgPSB0YWJJZFxuICAgIEBkYXRhW3RhYklkXSA/PSBpc09uOmZhbHNlXG4gICAgdGhpc1xuXG4gIHdpdGhQcmVmaXg6IChwcmVmaXgpID0+XG4gICAgQHByZWZpeCA9IHByZWZpeFxuICAgIHRoaXNcblxuICAjIHdpdGhEaXJlY3RvcmllczogKGRpcmVjdG9yaWVzKSAtPlxuICAjICAgaWYgZGlyZWN0b3JpZXM/Lmxlbmd0aCBpcyAwXG4gICMgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLmRpcmVjdG9yaWVzID0gW10gXG4gICMgICAgIEBfc3RvcCBAY3VycmVudFRhYklkXG4gICMgICBlbHNlICNpZiBPYmplY3Qua2V5cyhAZGF0YVtAY3VycmVudFRhYklkXSkubGVuZ3RoIGlzIDBcbiAgIyAgICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0uZGlyZWN0b3JpZXMgPSBkaXJlY3Rvcmllc1xuICAjICAgICBAc3RhcnQoKVxuICAjICAgdGhpcyAgICBcblxuICB3aXRoTWFwczogKG1hcHMpIC0+XG4gICAgaWYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobWFwcykubGVuZ3RoIGlzIDBcbiAgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHMgPSBbXVxuICAgICAgQF9zdG9wIEBjdXJyZW50VGFiSWRcbiAgICBlbHNlICNpZiBPYmplY3Qua2V5cyhAZGF0YVtAY3VycmVudFRhYklkXSkubGVuZ3RoIGlzIDBcbiAgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHMgPSBtYXBzXG4gICAgdGhpc1xuXG4gIHN0YXJ0OiAtPlxuICAgIHVubGVzcyBAZGF0YVtAY3VycmVudFRhYklkXS5saXN0ZW5lclxuICAgICAgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVSZXF1ZXN0LnJlbW92ZUxpc3RlbmVyIEBkYXRhW0BjdXJyZW50VGFiSWRdLmxpc3RlbmVyXG5cbiAgICBAZGF0YVtAY3VycmVudFRhYklkXS5saXN0ZW5lciA9IEBjcmVhdGVSZWRpcmVjdExpc3RlbmVyKClcbiAgICAjIEBkYXRhW0BjdXJyZW50VGFiSWRdLm9uQmVmb3JlU2VuZEhlYWRlcnNMaXN0ZW5lciA9IEBjcmVhdGVPbkJlZm9yZVNlbmRIZWFkZXJzTGlzdGVuZXIoKVxuICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLm9uSGVhZGVyc1JlY2VpdmVkTGlzdGVuZXIgPSBAY3JlYXRlT25IZWFkZXJzUmVjZWl2ZWRMaXN0ZW5lcigpXG4gICAgIyBAZGF0YVtAY3VycmVudFRhYklkXS5pc09uID0gdHJ1ZVxuICAgIEBfc3RhcnQgQGN1cnJlbnRUYWJJZFxuXG4gIGtpbGxBbGw6ICgpIC0+XG4gICAgQF9zdG9wIHRhYklkIGZvciB0YWJJZCBvZiBAZGF0YVxuXG4gIF9zdG9wOiAodGFiSWQpIC0+XG4gICAgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVSZXF1ZXN0LnJlbW92ZUxpc3RlbmVyIEBkYXRhW3RhYklkXS5saXN0ZW5lclxuICAgICMgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVTZW5kSGVhZGVycy5yZW1vdmVMaXN0ZW5lciBAZGF0YVt0YWJJZF0ub25CZWZvcmVTZW5kSGVhZGVyc0xpc3RlbmVyXG4gICAgY2hyb21lLndlYlJlcXVlc3Qub25IZWFkZXJzUmVjZWl2ZWQucmVtb3ZlTGlzdGVuZXIgQGRhdGFbdGFiSWRdLm9uSGVhZGVyc1JlY2VpdmVkTGlzdGVuZXJcbiAgICBcbiAgX3N0YXJ0OiAodGFiSWQpIC0+XG4gICAgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVSZXF1ZXN0LmFkZExpc3RlbmVyIEBkYXRhW3RhYklkXS5saXN0ZW5lcixcbiAgICAgIHVybHM6Wyc8YWxsX3VybHM+J11cbiAgICAgIHRhYklkOnRhYklkLFxuICAgICAgWydibG9ja2luZyddXG4gICAgIyBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVNlbmRIZWFkZXJzLmFkZExpc3RlbmVyIEBkYXRhW3RhYklkXS5vbkJlZm9yZVNlbmRIZWFkZXJzTGlzdGVuZXIsXG4gICAgIyAgIHVybHM6Wyc8YWxsX3VybHM+J11cbiAgICAjICAgdGFiSWQ6dGFiSWQsXG4gICAgIyAgIFtcInJlcXVlc3RIZWFkZXJzXCJdXG4gICAgY2hyb21lLndlYlJlcXVlc3Qub25IZWFkZXJzUmVjZWl2ZWQuYWRkTGlzdGVuZXIgQGRhdGFbdGFiSWRdLm9uSGVhZGVyc1JlY2VpdmVkTGlzdGVuZXIsXG4gICAgICB1cmxzOlsnPGFsbF91cmxzPiddXG4gICAgICB0YWJJZDp0YWJJZCxcbiAgICAgIFsnYmxvY2tpbmcnLCdyZXNwb25zZUhlYWRlcnMnXSAgICBcblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIHRvZ2dsZTogKCkgLT5cbiAgICBpc09uID0gZmFsc2VcbiAgICBpZiBAZGF0YVtAY3VycmVudFRhYklkXT8ubWFwcz9cbiAgICAgIGZvciBtIGluIEBkYXRhW0BjdXJyZW50VGFiSWRdPy5tYXBzXG4gICAgICAgIGlmIG0uaXNPblxuICAgICAgICAgIGlzT24gPSB0cnVlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlzT24gPSBmYWxzZVxuICAgICAgIyBAZGF0YVtAY3VycmVudFRhYklkXS5pc09uID0gIUBkYXRhW0BjdXJyZW50VGFiSWRdLmlzT25cbiAgICAgIFxuICAgICAgaWYgaXNPblxuICAgICAgICBAc3RhcnQoKVxuICAgICAgZWxzZVxuICAgICAgICBAX3N0b3AoQGN1cnJlbnRUYWJJZClcblxuICAgICAgcmV0dXJuIGlzT25cblxuICAjIHNob3VsZEFsbG93Q09SUzogKGRldGFpbHMpIC0+XG5cblxuICAjIGNyZWF0ZU9uQmVmb3JlU2VuZEhlYWRlcnNMaXN0ZW5lcjogKCkgLT5cbiAgIyAgIChkZXRhaWxzKSA9PlxuICAjICAgICBpZiBkZXRhaWxzLnVybC5pbmRleE9mKEBwcmVmaXgpIGlzIDBcbiAgIyAgICAgICBmbGFnID0gZmFsc2VcbiAgIyAgICAgICBydWxlID1cbiAgIyAgICAgICAgIG5hbWU6IFwiT3JpZ2luXCJcbiAgIyAgICAgICAgIHZhbHVlOiBcImh0dHA6Ly9wcm94bHkuY29tXCJcbiAgIyAgICAgICBmb3IgaGVhZGVyIGluIGRldGFpbHMucmVxdWVzdEhlYWRlcnNcbiAgIyAgICAgICAgIGlmIGhlYWRlci5uYW1lIGlzIHJ1bGUubmFtZVxuICAjICAgICAgICAgICBmbGFnID0gdHJ1ZVxuICAjICAgICAgICAgICBoZWFkZXIudmFsdWUgPSBydWxlLnZhbHVlXG4gICMgICAgICAgICAgIGJyZWFrXG5cbiAgIyAgICAgICBkZXRhaWxzLnJlcXVlc3RIZWFkZXJzLnB1c2ggcnVsZSBpZiBub3QgZmxhZ1xuXG4gICMgICAgIHJldHVybiByZXF1ZXN0SGVhZGVyczpkZXRhaWxzLnJlcXVlc3RIZWFkZXJzXG5cbiAgY3JlYXRlT25IZWFkZXJzUmVjZWl2ZWRMaXN0ZW5lcjogKCkgLT5cbiAgICAoZGV0YWlscykgPT5cbiAgICAgIGlmIGRldGFpbHMudXJsLmluZGV4T2YoQHByZWZpeCkgaXMgMFxuICAgICAgICBydWxlID1cbiAgICAgICAgICBuYW1lOiBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiXG4gICAgICAgICAgdmFsdWU6IFwiKlwiXG5cbiAgICAgICAgZGV0YWlscy5yZXNwb25zZUhlYWRlcnMucHVzaCBydWxlXG5cbiAgICAgIHJldHVybiByZXNwb25zZUhlYWRlcnM6ZGV0YWlscy5yZXNwb25zZUhlYWRlcnNcblxuICBjcmVhdGVSZWRpcmVjdExpc3RlbmVyOiAoKSAtPlxuICAgIChkZXRhaWxzKSA9PlxuICAgICAgcGF0aCA9IEBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0IGRldGFpbHMudXJsXG4gICAgICBpZiBwYXRoPyBhbmQgcGF0aC5pbmRleE9mIEBwcmVmaXggaXMgLTFcbiAgICAgICAgcmV0dXJuIHJlZGlyZWN0VXJsOkBwcmVmaXggKyBwYXRoXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiB7fSBcblxuICB0b0RpY3Q6IChvYmosa2V5KSAtPlxuICAgIG9iai5yZWR1Y2UgKChkaWN0LCBfb2JqKSAtPiBkaWN0WyBfb2JqW2tleV0gXSA9IF9vYmogaWYgX29ialtrZXldPzsgcmV0dXJuIGRpY3QpLCB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZGlyZWN0XG4iLCIjVE9ETzogcmV3cml0ZSB0aGlzIGNsYXNzIHVzaW5nIHRoZSBuZXcgY2hyb21lLnNvY2tldHMuKiBhcGkgd2hlbiB5b3UgY2FuIG1hbmFnZSB0byBtYWtlIGl0IHdvcmtcbmNsYXNzIFNlcnZlclxuICBzb2NrZXQ6IGNocm9tZS5zb2NrZXRcbiAgIyB0Y3A6IGNocm9tZS5zb2NrZXRzLnRjcFxuICBzb2NrZXRQcm9wZXJ0aWVzOlxuICAgICAgcGVyc2lzdGVudDp0cnVlXG4gICAgICBuYW1lOidTTFJlZGlyZWN0b3InXG4gICMgc29ja2V0SW5mbzpudWxsXG4gIGdldExvY2FsRmlsZTpudWxsXG4gIHNvY2tldElkczpbXVxuICBzdGF0dXM6XG4gICAgaG9zdDpudWxsXG4gICAgcG9ydDpudWxsXG4gICAgbWF4Q29ubmVjdGlvbnM6NTBcbiAgICBpc09uOmZhbHNlXG4gICAgc29ja2V0SW5mbzpudWxsXG4gICAgdXJsOm51bGxcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBAc3RhdHVzLmhvc3QgPSBcIjEyNy4wLjAuMVwiXG4gICAgQHN0YXR1cy5wb3J0ID0gMTAwMTJcbiAgICBAc3RhdHVzLm1heENvbm5lY3Rpb25zID0gNTBcbiAgICBAc3RhdHVzLnVybCA9ICdodHRwOi8vJyArIEBzdGF0dXMuaG9zdCArICc6JyArIEBzdGF0dXMucG9ydCArICcvJ1xuICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG5cblxuICBzdGFydDogKGhvc3QscG9ydCxtYXhDb25uZWN0aW9ucywgY2IpIC0+XG4gICAgaWYgaG9zdD8gdGhlbiBAc3RhdHVzLmhvc3QgPSBob3N0XG4gICAgaWYgcG9ydD8gdGhlbiBAc3RhdHVzLnBvcnQgPSBwb3J0XG4gICAgaWYgbWF4Q29ubmVjdGlvbnM/IHRoZW4gQHN0YXR1cy5tYXhDb25uZWN0aW9ucyA9IG1heENvbm5lY3Rpb25zXG5cbiAgICBAa2lsbEFsbCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgcmV0dXJuIGNiPyBlcnIgaWYgZXJyP1xuXG4gICAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuICAgICAgQHNvY2tldC5jcmVhdGUgJ3RjcCcsIHt9LCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgQHN0YXR1cy5zb2NrZXRJbmZvID0gc29ja2V0SW5mb1xuICAgICAgICBAc29ja2V0SWRzID0gW11cbiAgICAgICAgQHNvY2tldElkcy5wdXNoIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCAnc29ja2V0SWRzJzpAc29ja2V0SWRzXG4gICAgICAgIEBzb2NrZXQubGlzdGVuIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQHN0YXR1cy5ob3N0LCBAc3RhdHVzLnBvcnQsIChyZXN1bHQpID0+XG4gICAgICAgICAgaWYgcmVzdWx0ID4gLTFcbiAgICAgICAgICAgIHNob3cgJ2xpc3RlbmluZyAnICsgQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgICAgICBAc3RhdHVzLmlzT24gPSB0cnVlXG4gICAgICAgICAgICBAc3RhdHVzLnVybCA9ICdodHRwOi8vJyArIEBzdGF0dXMuaG9zdCArICc6JyArIEBzdGF0dXMucG9ydCArICcvJ1xuICAgICAgICAgICAgQHNvY2tldC5hY2NlcHQgQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG4gICAgICAgICAgICBjYj8gbnVsbCwgQHN0YXR1c1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNiPyByZXN1bHRcblxuXG4gIGtpbGxBbGw6IChjYikgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCAnc29ja2V0SWRzJywgKHJlc3VsdCkgPT5cbiAgICAgIEBzb2NrZXRJZHMgPSByZXN1bHQuc29ja2V0SWRzXG4gICAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuICAgICAgcmV0dXJuIGNiPyBudWxsLCAnc3VjY2VzcycgdW5sZXNzIEBzb2NrZXRJZHM/XG4gICAgICBjbnQgPSAwXG4gICAgICBpID0gMFxuICAgICAgXG4gICAgICB3aGlsZSBpIDwgQHNvY2tldElkc1swXVxuICAgICAgICBAc29ja2V0LmRlc3Ryb3kgaVxuICAgICAgICBpKytcblxuICAgICAgZm9yIHMgaW4gQHNvY2tldElkc1xuICAgICAgICBkbyAocykgPT5cbiAgICAgICAgICBjbnQrK1xuICAgICAgICAgIEBzb2NrZXQuZ2V0SW5mbyBzLCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgICAgIGNudC0tXG4gICAgICAgICAgICBpZiBub3QgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yP1xuICAgICAgICAgICAgICBAc29ja2V0LmRpc2Nvbm5lY3QgcyBpZiBAc3RhdHVzLnNvY2tldEluZm8/LmNvbm5lY3RlZCBvciBub3QgQHN0YXR1cy5zb2NrZXRJbmZvP1xuICAgICAgICAgICAgICBAc29ja2V0LmRlc3Ryb3kgc1xuXG4gICAgICAgICAgICBjYj8gbnVsbCwgJ3N1Y2Nlc3MnIGlmIGNudCBpcyAwXG5cbiAgc3RvcDogKGNiKSAtPlxuICAgIEBraWxsQWxsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuICAgICAgaWYgZXJyPyBcbiAgICAgICAgY2I/IGVyclxuICAgICAgZWxzZVxuICAgICAgICBjYj8gbnVsbCxzdWNjZXNzXG5cblxuICBfb25SZWNlaXZlOiAocmVjZWl2ZUluZm8pID0+XG4gICAgc2hvdyhcIkNsaWVudCBzb2NrZXQgJ3JlY2VpdmUnIGV2ZW50OiBzZD1cIiArIHJlY2VpdmVJbmZvLnNvY2tldElkXG4gICAgKyBcIiwgYnl0ZXM9XCIgKyByZWNlaXZlSW5mby5kYXRhLmJ5dGVMZW5ndGgpXG5cbiAgX29uTGlzdGVuOiAoc2VydmVyU29ja2V0SWQsIHJlc3VsdENvZGUpID0+XG4gICAgcmV0dXJuIHNob3cgJ0Vycm9yIExpc3RlbmluZzogJyArIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIGlmIHJlc3VsdENvZGUgPCAwXG4gICAgQHNlcnZlclNvY2tldElkID0gc2VydmVyU29ja2V0SWRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0LmFkZExpc3RlbmVyIEBfb25BY2NlcHRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0RXJyb3IuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdEVycm9yXG4gICAgQHRjcC5vblJlY2VpdmUuYWRkTGlzdGVuZXIgQF9vblJlY2VpdmVcbiAgICAjIHNob3cgXCJbXCIrc29ja2V0SW5mby5wZWVyQWRkcmVzcytcIjpcIitzb2NrZXRJbmZvLnBlZXJQb3J0K1wiXSBDb25uZWN0aW9uIGFjY2VwdGVkIVwiO1xuICAgICMgaW5mbyA9IEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICMgQGdldEZpbGUgdXJpLCAoZmlsZSkgLT5cbiAgX29uQWNjZXB0RXJyb3I6IChlcnJvcikgLT5cbiAgICBzaG93IGVycm9yXG5cbiAgX29uQWNjZXB0OiAoc29ja2V0SW5mbykgPT5cbiAgICAjIHJldHVybiBudWxsIGlmIGluZm8uc29ja2V0SWQgaXNudCBAc2VydmVyU29ja2V0SWRcbiAgICBzaG93KFwiU2VydmVyIHNvY2tldCAnYWNjZXB0JyBldmVudDogc2Q9XCIgKyBzb2NrZXRJbmZvLnNvY2tldElkKVxuICAgIGlmIHNvY2tldEluZm8/LnNvY2tldElkP1xuICAgICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkLCAoZXJyLCBpbmZvKSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgZXJyPyB0aGVuIHJldHVybiBAX3dyaXRlRXJyb3Igc29ja2V0SW5mby5zb2NrZXRJZCwgNDA0LCBpbmZvLmtlZXBBbGl2ZVxuXG4gICAgICAgIEBnZXRMb2NhbEZpbGUgaW5mbywgKGVyciwgZmlsZUVudHJ5LCBmaWxlUmVhZGVyKSA9PlxuICAgICAgICAgIGlmIGVycj8gdGhlbiBAX3dyaXRlRXJyb3Igc29ja2V0SW5mby5zb2NrZXRJZCwgNDA0LCBpbmZvLmtlZXBBbGl2ZVxuICAgICAgICAgIGVsc2UgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldEluZm8uc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZVJlYWRlciwgaW5mby5rZWVwQWxpdmVcbiAgICBlbHNlXG4gICAgICBzaG93IFwiTm8gc29ja2V0PyFcIlxuICAgICMgQHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG5cblxuICBzdHJpbmdUb1VpbnQ4QXJyYXk6IChzdHJpbmcpIC0+XG4gICAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHN0cmluZy5sZW5ndGgpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICBpID0gMFxuXG4gICAgd2hpbGUgaSA8IHN0cmluZy5sZW5ndGhcbiAgICAgIHZpZXdbaV0gPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuICAgICAgaSsrXG4gICAgdmlld1xuXG4gIGFycmF5QnVmZmVyVG9TdHJpbmc6IChidWZmZXIpIC0+XG4gICAgc3RyID0gXCJcIlxuICAgIHVBcnJheVZhbCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICBzID0gMFxuXG4gICAgd2hpbGUgcyA8IHVBcnJheVZhbC5sZW5ndGhcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVBcnJheVZhbFtzXSlcbiAgICAgIHMrK1xuICAgIHN0clxuXG4gIF93cml0ZTIwMFJlc3BvbnNlOiAoc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZSwga2VlcEFsaXZlKSAtPlxuICAgIGNvbnRlbnRUeXBlID0gKGlmIChmaWxlLnR5cGUgaXMgXCJcIikgdGhlbiBcInRleHQvcGxhaW5cIiBlbHNlIGZpbGUudHlwZSlcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIDIwMCBPS1xcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoKGlmIGtlZXBBbGl2ZSB0aGVuIFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIGVsc2UgXCJcIikpICsgXCJcXG5cXG5cIilcbiAgICBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldCBoZWFkZXIsIDBcblxuICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChldikgPT5cbiAgICAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGV2LnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aFxuICAgICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICAgICBzaG93IHdyaXRlSW5mb1xuICAgICAgICAjIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLm9uZXJyb3IgPSAoZXJyb3IpID0+XG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgZmlsZVxuXG5cbiAgICAjIEBlbmQgc29ja2V0SWRcbiAgICAjIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgIyBmaWxlUmVhZGVyLm9ubG9hZCA9IChlKSA9PlxuICAgICMgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShlLnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aFxuICAgICMgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgIyAgICAgc2hvdyBcIldSSVRFXCIsIHdyaXRlSW5mb1xuICAgICMgICAgICAgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldElkXG5cblxuICBfcmVhZEZyb21Tb2NrZXQ6IChzb2NrZXRJZCwgY2IpIC0+XG4gICAgQHNvY2tldC5yZWFkIHNvY2tldElkLCAocmVhZEluZm8pID0+XG4gICAgICBzaG93IFwiUkVBRFwiLCByZWFkSW5mb1xuXG4gICAgICAjIFBhcnNlIHRoZSByZXF1ZXN0LlxuICAgICAgZGF0YSA9IEBhcnJheUJ1ZmZlclRvU3RyaW5nKHJlYWRJbmZvLmRhdGEpXG4gICAgICBzaG93IGRhdGFcblxuICAgICAga2VlcEFsaXZlID0gZmFsc2VcbiAgICAgIGtlZXBBbGl2ZSA9IHRydWUgaWYgZGF0YS5pbmRleE9mICdDb25uZWN0aW9uOiBrZWVwLWFsaXZlJyBpc250IC0xXG5cbiAgICAgIGlmIGRhdGEuaW5kZXhPZihcIkdFVCBcIikgaXNudCAwXG4gICAgICAgIHJldHVybiBjYj8gJzQwNCcsIGtlZXBBbGl2ZTprZWVwQWxpdmVcblxuXG5cbiAgICAgIHVyaUVuZCA9IGRhdGEuaW5kZXhPZihcIiBcIiwgNClcblxuICAgICAgcmV0dXJuIGVuZCBzb2NrZXRJZCBpZiB1cmlFbmQgPCAwXG5cbiAgICAgIHVyaSA9IGRhdGEuc3Vic3RyaW5nKDQsIHVyaUVuZClcbiAgICAgIGlmIG5vdCB1cmk/XG4gICAgICAgIHJldHVybiBjYj8gJzQwNCcsIGtlZXBBbGl2ZTprZWVwQWxpdmVcblxuICAgICAgaW5mbyA9XG4gICAgICAgIHVyaTogdXJpXG4gICAgICAgIGtlZXBBbGl2ZTprZWVwQWxpdmVcbiAgICAgIGluZm8ucmVmZXJlciA9IGRhdGEubWF0Y2goL1JlZmVyZXI6XFxzKC4qKS8pP1sxXVxuICAgICAgI3N1Y2Nlc3NcbiAgICAgIGNiPyBudWxsLCBpbmZvXG5cbiAgZW5kOiAoc29ja2V0SWQsIGtlZXBBbGl2ZSkgLT5cbiAgICAgICMgaWYga2VlcEFsaXZlXG4gICAgICAjICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgIyBlbHNlXG4gICAgQHNvY2tldC5kaXNjb25uZWN0IHNvY2tldElkXG4gICAgQHNvY2tldC5kZXN0cm95IHNvY2tldElkXG4gICAgc2hvdyAnZW5kaW5nICcgKyBzb2NrZXRJZFxuICAgIEBzb2NrZXQuYWNjZXB0IEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG4gIF93cml0ZUVycm9yOiAoc29ja2V0SWQsIGVycm9yQ29kZSwga2VlcEFsaXZlKSAtPlxuICAgIGZpbGUgPSBzaXplOiAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogYmVnaW4uLi4gXCJcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBmaWxlID0gXCIgKyBmaWxlXG4gICAgY29udGVudFR5cGUgPSBcInRleHQvcGxhaW5cIiAjKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIFwiICsgZXJyb3JDb2RlICsgXCIgTm90IEZvdW5kXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyBoZWFkZXIuLi5cIlxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyB2aWV3Li4uXCJcbiAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcblxubW9kdWxlLmV4cG9ydHMgPSBTZXJ2ZXJcbiIsIkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcblxuV2F0Y2hKUyA9IHJlcXVpcmUgJ3dhdGNoanMnXG53YXRjaCA9IFdhdGNoSlMud2F0Y2hcbnVud2F0Y2ggPSBXYXRjaEpTLnVud2F0Y2hcbmNhbGxXYXRjaGVycyA9IFdhdGNoSlMuY2FsbFdhdGNoZXJzXG5cbmNsYXNzIFN0b3JhZ2VcbiAgYXBpOiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICBMSVNURU46IExJU1RFTi5nZXQoKSBcbiAgTVNHOiBNU0cuZ2V0KClcbiAgZGF0YTogXG4gICAgY3VycmVudFJlc291cmNlczogW11cbiAgICBkaXJlY3RvcmllczpbXVxuICAgIG1hcHM6W11cbiAgICB0YWJNYXBzOnt9XG4gICAgY3VycmVudEZpbGVNYXRjaGVzOnt9XG4gIFxuICBzZXNzaW9uOnt9XG5cbiAgb25EYXRhTG9hZGVkOiAtPlxuXG4gIGNhbGxiYWNrOiAoKSAtPlxuICBub3RpZnlPbkNoYW5nZTogKCkgLT5cbiAgY29uc3RydWN0b3I6IChfb25EYXRhTG9hZGVkKSAtPlxuICAgIEBvbkRhdGFMb2FkZWQgPSBfb25EYXRhTG9hZGVkIGlmIF9vbkRhdGFMb2FkZWQ/XG4gICAgQGFwaS5nZXQgKHJlc3VsdHMpID0+XG4gICAgICBAZGF0YVtrXSA9IHJlc3VsdHNba10gZm9yIGsgb2YgcmVzdWx0c1xuXG4gICAgICB3YXRjaEFuZE5vdGlmeSBALCdkYXRhQ2hhbmdlZCcsIEBkYXRhLCB0cnVlXG5cbiAgICAgIHdhdGNoQW5kTm90aWZ5IEAsJ3Nlc3Npb25EYXRhJywgQHNlc3Npb24sIGZhbHNlXG5cbiAgICAgIEBvbkRhdGFMb2FkZWQgQGRhdGFcblxuICAgIEBpbml0KClcblxuICBpbml0OiAoKSAtPlxuICAgIFxuICB3YXRjaEFuZE5vdGlmeSA9IChfdGhpcywgbXNnS2V5LCBvYmosIHN0b3JlKSAtPlxuXG4gICAgICBfbGlzdGVuZXIgPSAocHJvcCwgYWN0aW9uLCBuZXdWYWwsIG9sZFZhbCkgLT5cbiAgICAgICAgaWYgKGFjdGlvbiBpcyBcInNldFwiIG9yIFwiZGlmZmVyZW50YXR0clwiKSBhbmQgX3RoaXMubm9XYXRjaCBpcyBmYWxzZVxuICAgICAgICAgIGlmIG5vdCAvXlxcZCskLy50ZXN0KHByb3ApXG4gICAgICAgICAgICBzaG93IGFyZ3VtZW50c1xuICAgICAgICAgICAgX3RoaXMuYXBpLnNldCBvYmogaWYgc3RvcmVcbiAgICAgICAgICAgIG1zZyA9IHt9XG4gICAgICAgICAgICBtc2dbbXNnS2V5XSA9IG9ialxuICAgICAgICAgICAgIyB1bndhdGNoIG9iaiwgX2xpc3RlbmVyLDMsdHJ1ZVxuICAgICAgICAgICAgX3RoaXMuTVNHLkV4dFBvcnQgbXNnXG4gICAgICAgIFxuICAgICAgX3RoaXMubm9XYXRjaCA9IGZhbHNlXG4gICAgICB3YXRjaCBvYmosIF9saXN0ZW5lciwzLHRydWVcblxuICAgICAgX3RoaXMuTElTVEVOLkV4dCBtc2dLZXksIChkYXRhKSAtPlxuICAgICAgICBfdGhpcy5ub1dhdGNoID0gdHJ1ZVxuICAgICAgICAjIHVud2F0Y2ggb2JqLCBfbGlzdGVuZXIsMyx0cnVlXG4gICAgICAgIFxuICAgICAgICBvYmpba10gPSBkYXRhW2tdIGZvciBrIG9mIGRhdGFcbiAgICAgICAgc2V0VGltZW91dCAoKSAtPiBcbiAgICAgICAgICBfdGhpcy5ub1dhdGNoID0gZmFsc2VcbiAgICAgICAgLDIwMFxuXG4gIHNhdmU6IChrZXksIGl0ZW0sIGNiKSAtPlxuXG4gICAgb2JqID0ge31cbiAgICBvYmpba2V5XSA9IGl0ZW1cbiAgICBAZGF0YVtrZXldID0gaXRlbVxuICAgIEBhcGkuc2V0IG9iaiwgKHJlcykgPT5cbiAgICAgIGNiPygpXG4gICAgICBAY2FsbGJhY2s/KClcbiBcbiAgc2F2ZUFsbDogKGRhdGEsIGNiKSAtPlxuXG4gICAgaWYgZGF0YT8gXG4gICAgICBAYXBpLnNldCBkYXRhLCAoKSA9PlxuICAgICAgICBjYj8oKVxuIFxuICAgIGVsc2VcbiAgICAgIEBhcGkuc2V0IEBkYXRhLCAoKSA9PlxuICAgICAgICBjYj8oKVxuIFxuXG4gIHJldHJpZXZlOiAoa2V5LCBjYikgLT5cbiAgICBAb2JzZXJ2ZXIuc3RvcCgpXG4gICAgQGFwaS5nZXQga2V5LCAocmVzdWx0cykgLT5cbiAgICAgIEBkYXRhW3JdID0gcmVzdWx0c1tyXSBmb3IgciBvZiByZXN1bHRzXG4gICAgICBpZiBjYj8gdGhlbiBjYiByZXN1bHRzW2tleV1cblxuICByZXRyaWV2ZUFsbDogKGNiKSAtPlxuICAgICMgQG9ic2VydmVyLnN0b3AoKVxuICAgIEBhcGkuZ2V0IChyZXN1bHQpID0+XG4gICAgICBmb3IgYyBvZiByZXN1bHQgXG4gICAgICAjICAgZGVsZXRlIEBkYXRhW2NdXG4gICAgICAgIEBkYXRhW2NdID0gcmVzdWx0W2NdIFxuICAgICAgIyBAZGF0YSA9IHJlc3VsdFxuICAgICAgICBATVNHLkV4dFBvcnQgJ2RhdGFDaGFuZ2VkJzpcbiAgICAgICAgICBwYXRoOmNcbiAgICAgICAgICB2YWx1ZTpyZXN1bHRbY11cbiBcblxuICAgICAgQGFwaS5zZXQgQGRhdGFcbiAgICAgICMgQGNhbGxiYWNrPyByZXN1bHRcbiAgICAgIGNiPyByZXN1bHRcbiAgICAgIEBvbkRhdGFMb2FkZWQgQGRhdGFcblxuICBvbkRhdGFMb2FkZWQ6IChkYXRhKSAtPlxuXG4gIG9uQ2hhbmdlZDogKGtleSwgY2IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLCBuYW1lc3BhY2UpIC0+XG4gICAgICBpZiBjaGFuZ2VzW2tleV0/IGFuZCBjYj8gdGhlbiBjYiBjaGFuZ2VzW2tleV0ubmV3VmFsdWVcbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlc1xuXG4gIG9uQ2hhbmdlZEFsbDogKCkgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsbmFtZXNwYWNlKSA9PlxuICAgICAgaGFzQ2hhbmdlcyA9IGZhbHNlXG4gICAgICBmb3IgYyBvZiBjaGFuZ2VzIHdoZW4gY2hhbmdlc1tjXS5uZXdWYWx1ZSAhPSBjaGFuZ2VzW2NdLm9sZFZhbHVlIGFuZCBjIGlzbnQnc29ja2V0SWRzJ1xuICAgICAgICAoYykgPT4gXG4gICAgICAgICAgQGRhdGFbY10gPSBjaGFuZ2VzW2NdLm5ld1ZhbHVlIFxuICAgICAgICAgIHNob3cgJ2RhdGEgY2hhbmdlZDogJ1xuICAgICAgICAgIHNob3cgY1xuICAgICAgICAgIHNob3cgQGRhdGFbY11cblxuICAgICAgICAgIGhhc0NoYW5nZXMgPSB0cnVlXG5cbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlcyBpZiBoYXNDaGFuZ2VzXG4gICAgICBzaG93ICdjaGFuZ2VkJyBpZiBoYXNDaGFuZ2VzXG5cbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZVxuIiwiIyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTc0MjA5M1xubW9kdWxlLmV4cG9ydHMgPSAoKCkgLT5cblxuICBkZWJ1ZyA9IHRydWVcbiAgXG4gIHJldHVybiAod2luZG93LnNob3cgPSAoKSAtPikgaWYgbm90IGRlYnVnXG5cbiAgbWV0aG9kcyA9IFtcbiAgICAnYXNzZXJ0JywgJ2NsZWFyJywgJ2NvdW50JywgJ2RlYnVnJywgJ2RpcicsICdkaXJ4bWwnLCAnZXJyb3InLFxuICAgICdleGNlcHRpb24nLCAnZ3JvdXAnLCAnZ3JvdXBDb2xsYXBzZWQnLCAnZ3JvdXBFbmQnLCAnaW5mbycsICdsb2cnLFxuICAgICdtYXJrVGltZWxpbmUnLCAncHJvZmlsZScsICdwcm9maWxlRW5kJywgJ3RhYmxlJywgJ3RpbWUnLCAndGltZUVuZCcsXG4gICAgJ3RpbWVTdGFtcCcsICd0cmFjZScsICd3YXJuJ11cbiAgICBcbiAgbm9vcCA9ICgpIC0+XG4gICAgIyBzdHViIHVuZGVmaW5lZCBtZXRob2RzLlxuICAgIGZvciBtIGluIG1ldGhvZHMgIHdoZW4gICFjb25zb2xlW21dXG4gICAgICBjb25zb2xlW21dID0gbm9vcFxuXG5cbiAgaWYgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQ/XG4gICAgd2luZG93LnNob3cgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlKVxuICBlbHNlXG4gICAgd2luZG93LnNob3cgPSAoKSAtPlxuICAgICAgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cylcbikoKVxuIl19
