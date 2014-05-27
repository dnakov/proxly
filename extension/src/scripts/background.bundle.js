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


},{"./config.coffee":2,"./filesystem.coffee":4,"./listen.coffee":5,"./msg.coffee":6,"./notification.coffee":11,"./server.coffee":13,"./storage.coffee":14,"./util.coffee":15}],2:[function(require,module,exports){
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


},{"../../common.coffee":1,"../../filesystem.coffee":4,"../../redirect.coffee":12,"../../server.coffee":13,"../../storage.coffee":14}],4:[function(require,module,exports){
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


},{"./config.coffee":2}],7:[function(require,module,exports){
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
    return chrome.webRequest.onBeforeRequest.removeListener(this.data[tabId].listener);
  };

  Redirect.prototype._start = function(tabId) {
    return chrome.webRequest.onBeforeRequest.addListener(this.data[tabId].listener, {
      urls: ['<all_urls>'],
      tabId: this.currentTabId
    }, ['blocking']);
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


},{}],13:[function(require,module,exports){
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


},{}],14:[function(require,module,exports){
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


},{"./listen.coffee":5,"./msg.coffee":6,"Object-observe-polyfill":7,"observed":9}],15:[function(require,module,exports){
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


},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvY29tbW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9jb25maWcuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L2V4dGVuc2lvbi9zcmMvYmFja2dyb3VuZC5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vZGVfbW9kdWxlcy9PYmplY3Qtb2JzZXJ2ZS1wb2x5ZmlsbC9PYmplY3Qub2JzZXJ2ZS5wb2x5LmpzIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vZGVfbW9kdWxlcy9vYnNlcnZlZC9saWIvY2hhbmdlLmpzIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vZGVfbW9kdWxlcy9vYnNlcnZlZC9saWIvb2JzZXJ2ZWQuanMiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vdGlmaWNhdGlvbi5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvcmVkaXJlY3QuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L3NlcnZlci5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvc3RvcmFnZS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLDJFQUFBO0VBQUE7O2lTQUFBOztBQUFBLE9BQUEsQ0FBUSxlQUFSLENBQUEsQ0FBQTs7QUFBQSxNQUNBLEdBQVMsT0FBQSxDQUFRLGlCQUFSLENBRFQsQ0FBQTs7QUFBQSxHQUVBLEdBQU0sT0FBQSxDQUFRLGNBQVIsQ0FGTixDQUFBOztBQUFBLE1BR0EsR0FBUyxPQUFBLENBQVEsaUJBQVIsQ0FIVCxDQUFBOztBQUFBLE9BSUEsR0FBVSxPQUFBLENBQVEsa0JBQVIsQ0FKVixDQUFBOztBQUFBLFVBS0EsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FMYixDQUFBOztBQUFBLFlBTUEsR0FBZSxPQUFBLENBQVEsdUJBQVIsQ0FOZixDQUFBOztBQUFBLE1BT0EsR0FBUyxPQUFBLENBQVEsaUJBQVIsQ0FQVCxDQUFBOztBQUFBO0FBV0UsZ0NBQUEsQ0FBQTs7QUFBQSx3QkFBQSxNQUFBLEdBQVEsSUFBUixDQUFBOztBQUFBLHdCQUNBLEdBQUEsR0FBSyxJQURMLENBQUE7O0FBQUEsd0JBRUEsT0FBQSxHQUFTLElBRlQsQ0FBQTs7QUFBQSx3QkFHQSxFQUFBLEdBQUksSUFISixDQUFBOztBQUFBLHdCQUlBLE1BQUEsR0FBUSxJQUpSLENBQUE7O0FBQUEsd0JBS0EsTUFBQSxHQUFRLElBTFIsQ0FBQTs7QUFBQSx3QkFNQSxRQUFBLEdBQVMsSUFOVCxDQUFBOztBQUFBLHdCQU9BLFlBQUEsR0FBYSxJQVBiLENBQUE7O0FBU2EsRUFBQSxxQkFBQyxJQUFELEdBQUE7QUFDWCxtREFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSxRQUFBLElBQUE7QUFBQSxJQUFBLDhDQUFBLFNBQUEsQ0FBQSxDQUFBOztNQUVBLElBQUMsQ0FBQSxNQUFPLEdBQUcsQ0FBQyxHQUFKLENBQUE7S0FGUjs7TUFHQSxJQUFDLENBQUEsU0FBVSxN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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LEdBQWMsU0FBQSxHQUFBO2FBQ1osUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBekIsQ0FBOEIsT0FBTyxDQUFDLEdBQXRDLEVBQTJDLE9BQTNDLEVBQW9ELFNBQXBELEVBRFk7SUFBQSxFQUhoQjtHQVhnQjtBQUFBLENBQUQsQ0FBQSxDQUFBLENBQWpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUgJy4vdXRpbC5jb2ZmZWUnXG5Db25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5MSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuTm90aWZpY2F0aW9uID0gcmVxdWlyZSAnLi9ub3RpZmljYXRpb24uY29mZmVlJ1xuU2VydmVyID0gcmVxdWlyZSAnLi9zZXJ2ZXIuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgQ29uZmlnXG4gIExJU1RFTjogbnVsbFxuICBNU0c6IG51bGxcbiAgU3RvcmFnZTogbnVsbFxuICBGUzogbnVsbFxuICBTZXJ2ZXI6IG51bGxcbiAgTm90aWZ5OiBudWxsXG4gIHBsYXRmb3JtOm51bGxcbiAgY3VycmVudFRhYklkOm51bGxcblxuICBjb25zdHJ1Y3RvcjogKGRlcHMpIC0+XG4gICAgc3VwZXJcblxuICAgIEBNU0cgPz0gTVNHLmdldCgpXG4gICAgQExJU1RFTiA/PSBMSVNURU4uZ2V0KClcbiAgICBcbiAgICBmb3IgcHJvcCBvZiBkZXBzXG4gICAgICBpZiB0eXBlb2YgZGVwc1twcm9wXSBpcyBcIm9iamVjdFwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpJbmJvdW5kIGRlcHNbcHJvcF1cbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwiZnVuY3Rpb25cIiBcbiAgICAgICAgQFtwcm9wXSA9IEB3cmFwT2JqT3V0Ym91bmQgbmV3IGRlcHNbcHJvcF1cblxuICAgIEBTdG9yYWdlLm9uRGF0YUxvYWRlZCA9IChkYXRhKSA9PlxuICAgICAgIyBAZGF0YSA9IGRhdGFcbiAgICAgICMgZGVsZXRlIEBTdG9yYWdlLmRhdGEuc2VydmVyXG4gICAgICAjIEBTdG9yYWdlLmRhdGEuc2VydmVyID0ge31cbiAgICAgICMgZGVsZXRlIEBTdG9yYWdlLmRhdGEuc2VydmVyLnN0YXR1c1xuXG4gICAgICBAU3RvcmFnZS5zZXNzaW9uLnNlcnZlciA9IHt9XG4gICAgICBAU3RvcmFnZS5zZXNzaW9uLnNlcnZlci5zdGF0dXMgPSBAU2VydmVyLnN0YXR1c1xuXG4gICAgICBpZiBub3QgQFN0b3JhZ2UuZGF0YS5maXJzdFRpbWU/XG4gICAgICAgIEBTdG9yYWdlLmRhdGEuZmlyc3RUaW1lID0gZmFsc2VcbiAgICAgICAgQFN0b3JhZ2UuZGF0YS5tYXBzLnB1c2hcbiAgICAgICAgICBuYW1lOidTYWxlc2ZvcmNlJ1xuICAgICAgICAgIHVybDonaHR0cHMuKlxcL3Jlc291cmNlKFxcL1swLTldKyk/XFwvKFtBLVphLXowLTlcXC0uX10rXFwvKT8nXG4gICAgICAgICAgcmVnZXhSZXBsOicnXG4gICAgICAgICAgaXNSZWRpcmVjdDp0cnVlXG4gICAgICAgICAgaXNPbjpmYWxzZVxuXG5cbiAgICAgICMgaWYgQFJlZGlyZWN0PyB0aGVuIEBSZWRpcmVjdC5kYXRhID0gQGRhdGEudGFiTWFwc1xuXG4gICAgQE5vdGlmeSA/PSAobmV3IE5vdGlmaWNhdGlvbikuc2hvdyBcbiAgICAjIEBTdG9yYWdlID89IEB3cmFwT2JqT3V0Ym91bmQgbmV3IFN0b3JhZ2UgQGRhdGFcbiAgICAjIEBGUyA9IG5ldyBGaWxlU3lzdGVtIFxuICAgICMgQFNlcnZlciA/PSBAd3JhcE9iak91dGJvdW5kIG5ldyBTZXJ2ZXJcbiAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcbiAgICBcbiAgICBAd3JhcCA9IGlmIEBTRUxGX1RZUEUgaXMgJ0FQUCcgdGhlbiBAd3JhcEluYm91bmQgZWxzZSBAd3JhcE91dGJvdW5kXG5cbiAgICBAb3BlbkFwcCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5vcGVuQXBwJywgQG9wZW5BcHBcbiAgICBAbGF1bmNoQXBwID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmxhdW5jaEFwcCcsIEBsYXVuY2hBcHBcbiAgICBAc3RhcnRTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uc3RhcnRTZXJ2ZXInLCBAc3RhcnRTZXJ2ZXJcbiAgICBAcmVzdGFydFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5yZXN0YXJ0U2VydmVyJywgQHJlc3RhcnRTZXJ2ZXJcbiAgICBAc3RvcFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5zdG9wU2VydmVyJywgQHN0b3BTZXJ2ZXJcbiAgICBAZ2V0RmlsZU1hdGNoID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldEZpbGVNYXRjaCcsIEBnZXRGaWxlTWF0Y2hcblxuICAgIEB3cmFwID0gaWYgQFNFTEZfVFlQRSBpcyAnRVhURU5TSU9OJyB0aGVuIEB3cmFwSW5ib3VuZCBlbHNlIEB3cmFwT3V0Ym91bmRcblxuICAgIEBnZXRSZXNvdXJjZXMgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0UmVzb3VyY2VzJywgQGdldFJlc291cmNlc1xuICAgIEBnZXRDdXJyZW50VGFiID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldEN1cnJlbnRUYWInLCBAZ2V0Q3VycmVudFRhYlxuXG4gICAgY2hyb21lLnJ1bnRpbWUuZ2V0UGxhdGZvcm1JbmZvIChpbmZvKSA9PlxuICAgICAgQHBsYXRmb3JtID0gaW5mb1xuXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpIC0+XG5cbiAgICAjIEBTdG9yYWdlLnJldHJpZXZlQWxsKCkgaWYgQFN0b3JhZ2U/XG5cblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIGxhdW5jaEFwcDogKGNiLCBlcnJvcikgLT5cbiAgICAgIGNocm9tZS5tYW5hZ2VtZW50LmxhdW5jaEFwcCBAQVBQX0lELCAoZXh0SW5mbykgPT5cbiAgICAgICAgaWYgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICAgICAgZXJyb3IgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjYj8gZXh0SW5mb1xuXG4gIG9wZW5BcHA6ICgpID0+XG4gICAgICBjaHJvbWUuYXBwLndpbmRvdy5jcmVhdGUoJ2luZGV4Lmh0bWwnLFxuICAgICAgICBpZDogXCJtYWlud2luXCJcbiAgICAgICAgYm91bmRzOlxuICAgICAgICAgIHdpZHRoOjc3MFxuICAgICAgICAgIGhlaWdodDo4MDAsXG4gICAgICAod2luKSA9PlxuICAgICAgICBAYXBwV2luZG93ID0gd2luKSBcblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIGdldFJlc291cmNlczogKGNiKSAtPlxuICAgIEBnZXRDdXJyZW50VGFiICh0YWJJZCkgPT5cbiAgICAgIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQgdGFiSWQsIFxuICAgICAgICBmaWxlOidzY3JpcHRzL2NvbnRlbnQuanMnLCAocmVzdWx0cykgPT5cbiAgICAgICAgICBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLmxlbmd0aCA9IDBcbiAgICAgICAgICBmb3IgciBpbiByZXN1bHRzXG4gICAgICAgICAgICBmb3IgcmVzIGluIHJcbiAgICAgICAgICAgICAgQGRhdGEuY3VycmVudFJlc291cmNlcy5wdXNoIHJlc1xuICAgICAgICAgIGNiPyBudWxsLCBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG5cblxuICBnZXRMb2NhbEZpbGU6IChpbmZvLCBjYikgPT5cbiAgICBmaWxlUGF0aCA9IGluZm8udXJpXG4gICAgIyBmaWxlUGF0aCA9IEBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0IHVybFxuICAgIHJldHVybiBjYiAnZmlsZSBub3QgZm91bmQnIHVubGVzcyBmaWxlUGF0aD9cbiAgICBfZGlycyA9IFtdXG4gICAgX2RpcnMucHVzaCBkaXIgZm9yIGRpciBpbiBAZGF0YS5kaXJlY3RvcmllcyB3aGVuIGRpci5pc09uXG4gICAgZmlsZVBhdGggPSBmaWxlUGF0aC5zdWJzdHJpbmcgMSBpZiBmaWxlUGF0aC5zdWJzdHJpbmcoMCwxKSBpcyAnLydcbiAgICBAZmluZEZpbGVGb3JQYXRoIF9kaXJzLCBmaWxlUGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXIpID0+XG4gICAgICBpZiBlcnI/IHRoZW4gcmV0dXJuIGNiPyBlcnJcbiAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICBjYj8gbnVsbCxmaWxlRW50cnksZmlsZVxuICAgICAgLChlcnIpID0+IGNiPyBlcnJcblxuXG4gIHN0YXJ0U2VydmVyOiAoY2IpIC0+XG4gICAgaWYgQFNlcnZlci5zdGF0dXMuaXNPbiBpcyBmYWxzZVxuICAgICAgQFNlcnZlci5zdGFydCBudWxsLG51bGwsbnVsbCwgKGVyciwgc29ja2V0SW5mbykgPT5cbiAgICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIEVycm9yXCIsXCJFcnJvciBTdGFydGluZyBTZXJ2ZXI6ICN7IGVycm9yIH1cIlxuICAgICAgICAgICAgY2I/IGVyclxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgU3RhcnRlZFwiLCBcIlN0YXJ0ZWQgU2VydmVyICN7IEBTZXJ2ZXIuc3RhdHVzLnVybCB9XCJcbiAgICAgICAgICAgIGNiPyBudWxsLCBAU2VydmVyLnN0YXR1c1xuXG4gIHN0b3BTZXJ2ZXI6IChjYikgLT5cbiAgICAgIEBTZXJ2ZXIuc3RvcCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBFcnJvclwiLFwiU2VydmVyIGNvdWxkIG5vdCBiZSBzdG9wcGVkOiAjeyBlcnJvciB9XCJcbiAgICAgICAgICBjYj8gZXJyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBATm90aWZ5ICdTZXJ2ZXIgU3RvcHBlZCcsIFwiU2VydmVyIFN0b3BwZWRcIlxuICAgICAgICAgIGNiPyBudWxsLCBAU2VydmVyLnN0YXR1c1xuXG4gIHJlc3RhcnRTZXJ2ZXI6IC0+XG4gICAgQHN0YXJ0U2VydmVyKClcblxuICBjaGFuZ2VQb3J0OiA9PlxuICBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0OiAodXJsKSAtPlxuICAgIGZpbGVQYXRoUmVnZXggPSAvXigoaHR0cFtzXT98ZnRwfGNocm9tZS1leHRlbnNpb258ZmlsZSk6XFwvXFwvKT9cXC8/KFteXFwvXFwuXStcXC4pKj8oW15cXC9cXC5dK1xcLlteOlxcL1xcc1xcLl17MiwzfShcXC5bXjpcXC9cXHNcXC5d4oCM4oCLezIsM30pPykoOlxcZCspPygkfFxcLykoW14jP1xcc10rKT8oLio/KT8oI1tcXHdcXC1dKyk/JC9cbiAgIFxuICAgIHJldHVybiBudWxsIHVubGVzcyBAZGF0YVtAY3VycmVudFRhYklkXT8ubWFwcz9cblxuICAgIHJlc1BhdGggPSB1cmwubWF0Y2goZmlsZVBhdGhSZWdleCk/WzhdXG4gICAgaWYgbm90IHJlc1BhdGg/XG4gICAgICAjIHRyeSByZWxwYXRoXG4gICAgICByZXNQYXRoID0gdXJsXG5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmVzUGF0aD9cbiAgICBcbiAgICBmb3IgbWFwIGluIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHNcbiAgICAgIHJlc1BhdGggPSB1cmwubWF0Y2gobmV3IFJlZ0V4cChtYXAudXJsKSk/IGFuZCBtYXAudXJsP1xuXG4gICAgICBpZiByZXNQYXRoXG4gICAgICAgIGlmIHJlZmVyZXI/XG4gICAgICAgICAgIyBUT0RPOiB0aGlzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWFwLnVybCksIG1hcC5yZWdleFJlcGxcbiAgICAgICAgYnJlYWtcbiAgICByZXR1cm4gZmlsZVBhdGhcblxuICBVUkx0b0xvY2FsUGF0aDogKHVybCwgY2IpIC0+XG4gICAgZmlsZVBhdGggPSBAUmVkaXJlY3QuZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdCB1cmxcblxuICBnZXRGaWxlTWF0Y2g6IChmaWxlUGF0aCwgY2IpIC0+XG4gICAgcmV0dXJuIGNiPyAnZmlsZSBub3QgZm91bmQnIHVubGVzcyBmaWxlUGF0aD9cbiAgICBzaG93ICd0cnlpbmcgJyArIGZpbGVQYXRoXG4gICAgQGZpbmRGaWxlRm9yUGF0aCBAZGF0YS5kaXJlY3RvcmllcywgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyZWN0b3J5KSA9PlxuXG4gICAgICBpZiBlcnI/IFxuICAgICAgICAjIHNob3cgJ25vIGZpbGVzIGZvdW5kIGZvciAnICsgZmlsZVBhdGhcbiAgICAgICAgcmV0dXJuIGNiPyBlcnJcblxuICAgICAgZGVsZXRlIGZpbGVFbnRyeS5lbnRyeVxuICAgICAgQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzW2ZpbGVQYXRoXSA9IFxuICAgICAgICBmaWxlRW50cnk6IGNocm9tZS5maWxlU3lzdGVtLnJldGFpbkVudHJ5IGZpbGVFbnRyeVxuICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGhcbiAgICAgICAgZGlyZWN0b3J5OiBkaXJlY3RvcnlcbiAgICAgIGNiPyBudWxsLCBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdLCBkaXJlY3RvcnlcbiAgICAgIFxuXG5cbiAgZmluZEZpbGVJbkRpcmVjdG9yaWVzOiAoZGlyZWN0b3JpZXMsIHBhdGgsIGNiKSAtPlxuICAgIG15RGlycyA9IGRpcmVjdG9yaWVzLnNsaWNlKCkgXG4gICAgX3BhdGggPSBwYXRoXG4gICAgX2RpciA9IG15RGlycy5zaGlmdCgpXG5cbiAgICBARlMuZ2V0TG9jYWxGaWxlRW50cnkgX2RpciwgX3BhdGgsIChlcnIsIGZpbGVFbnRyeSkgPT5cbiAgICAgIGlmIGVycj9cbiAgICAgICAgaWYgbXlEaXJzLmxlbmd0aCA+IDBcbiAgICAgICAgICBAZmluZEZpbGVJbkRpcmVjdG9yaWVzIG15RGlycywgX3BhdGgsIGNiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjYj8gJ25vdCBmb3VuZCdcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgX2RpclxuXG4gIGZpbmRGaWxlRm9yUGF0aDogKGRpcnMsIHBhdGgsIGNiKSAtPlxuICAgIEBmaW5kRmlsZUluRGlyZWN0b3JpZXMgZGlycywgcGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXJlY3RvcnkpID0+XG4gICAgICBpZiBlcnI/XG4gICAgICAgIGlmIHBhdGggaXMgcGF0aC5yZXBsYWNlKC8uKj9cXC8vLCAnJylcbiAgICAgICAgICBjYj8gJ25vdCBmb3VuZCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBmaW5kRmlsZUZvclBhdGggZGlycywgcGF0aC5yZXBsYWNlKC8uKj9cXC8vLCAnJyksIGNiXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGRpcmVjdG9yeVxuICBcbiAgbWFwQWxsUmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldFJlc291cmNlcyA9PlxuICAgICAgbmVlZCA9IEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMubGVuZ3RoXG4gICAgICBmb3VuZCA9IG5vdEZvdW5kID0gMFxuICAgICAgZm9yIGl0ZW0gaW4gQGRhdGEuY3VycmVudFJlc291cmNlc1xuICAgICAgICBsb2NhbFBhdGggPSBAVVJMdG9Mb2NhbFBhdGggaXRlbS51cmxcbiAgICAgICAgaWYgbG9jYWxQYXRoP1xuICAgICAgICAgIEBnZXRGaWxlTWF0Y2ggbG9jYWxQYXRoLCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgICAgICAgbmVlZC0tXG4gICAgICAgICAgICBzaG93IGFyZ3VtZW50c1xuICAgICAgICAgICAgaWYgZXJyPyB0aGVuIG5vdEZvdW5kKytcbiAgICAgICAgICAgIGVsc2UgZm91bmQrKyAgICAgICAgICAgIFxuXG4gICAgICAgICAgICBpZiBuZWVkIGlzIDBcbiAgICAgICAgICAgICAgaWYgZm91bmQgPiAwXG4gICAgICAgICAgICAgICAgY2I/IG51bGwsICdkb25lJ1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2I/ICdub3RoaW5nIGZvdW5kJ1xuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBuZWVkLS1cbiAgICAgICAgICBub3RGb3VuZCsrXG4gICAgICAgICAgaWYgbmVlZCBpcyAwXG4gICAgICAgICAgICBjYj8gJ25vdGhpbmcgZm91bmQnXG5cbiAgc2V0QmFkZ2VUZXh0OiAodGV4dCwgdGFiSWQpIC0+XG4gICAgYmFkZ2VUZXh0ID0gdGV4dCB8fCAnJyArIE9iamVjdC5rZXlzKEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlcykubGVuZ3RoXG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0IFxuICAgICAgdGV4dDpiYWRnZVRleHRcbiAgICAgICMgdGFiSWQ6dGFiSWRcbiAgXG4gIHJlbW92ZUJhZGdlVGV4dDoodGFiSWQpIC0+XG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0IFxuICAgICAgdGV4dDonJ1xuICAgICAgIyB0YWJJZDp0YWJJZFxuXG4gIGxzUjogKGRpciwgb25zdWNjZXNzLCBvbmVycm9yKSAtPlxuICAgIEByZXN1bHRzID0ge31cblxuICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgXG4gICAgICB0b2RvID0gMFxuICAgICAgaWdub3JlID0gLy5naXR8LmlkZWF8bm9kZV9tb2R1bGVzfGJvd2VyX2NvbXBvbmVudHMvXG4gICAgICBkaXZlID0gKGRpciwgcmVzdWx0cykgLT5cbiAgICAgICAgdG9kbysrXG4gICAgICAgIHJlYWRlciA9IGRpci5jcmVhdGVSZWFkZXIoKVxuICAgICAgICByZWFkZXIucmVhZEVudHJpZXMgKGVudHJpZXMpIC0+XG4gICAgICAgICAgdG9kby0tXG4gICAgICAgICAgZm9yIGVudHJ5IGluIGVudHJpZXNcbiAgICAgICAgICAgIGRvIChlbnRyeSkgLT5cbiAgICAgICAgICAgICAgcmVzdWx0c1tlbnRyeS5mdWxsUGF0aF0gPSBlbnRyeVxuICAgICAgICAgICAgICBpZiBlbnRyeS5mdWxsUGF0aC5tYXRjaChpZ25vcmUpIGlzIG51bGxcbiAgICAgICAgICAgICAgICBpZiBlbnRyeS5pc0RpcmVjdG9yeVxuICAgICAgICAgICAgICAgICAgdG9kbysrXG4gICAgICAgICAgICAgICAgICBkaXZlIGVudHJ5LCByZXN1bHRzIFxuICAgICAgICAgICAgICAjIHNob3cgZW50cnlcbiAgICAgICAgICBzaG93ICdvbnN1Y2Nlc3MnIGlmIHRvZG8gaXMgMFxuICAgICAgICAgICMgc2hvdyAnb25zdWNjZXNzJyByZXN1bHRzIGlmIHRvZG8gaXMgMFxuICAgICAgICAsKGVycm9yKSAtPlxuICAgICAgICAgIHRvZG8tLVxuICAgICAgICAgICMgc2hvdyBlcnJvclxuICAgICAgICAgICMgb25lcnJvciBlcnJvciwgcmVzdWx0cyBpZiB0b2RvIGlzIDAgXG5cbiAgICAgIGNvbnNvbGUubG9nIGRpdmUgZGlyRW50cnksIEByZXN1bHRzICBcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxpY2F0aW9uXG5cblxuIiwiY2xhc3MgQ29uZmlnXG4gICMgQVBQX0lEOiAnY2VjaWZhZnBoZWdob2ZwZmRraGVra2liY2liaGdmZWMnXG4gICMgRVhURU5TSU9OX0lEOiAnZGRkaW1ibmppYmpjYWZib2tuYmdoZWhiZmFqZ2dnZXAnXG4gIEFQUF9JRDogJ2RlbmVmZG9vZm5rZ2ptcGJmcGtuaWhwZ2RoYWhwYmxoJ1xuICBFWFRFTlNJT05fSUQ6ICdpamNqbXBlam9ubWltb29mYmNwYWxpZWpoaWthZW9taCcgIFxuICBTRUxGX0lEOiBjaHJvbWUucnVudGltZS5pZFxuICBpc0NvbnRlbnRTY3JpcHQ6IGxvY2F0aW9uLnByb3RvY29sIGlzbnQgJ2Nocm9tZS1leHRlbnNpb246J1xuICBFWFRfSUQ6IG51bGxcbiAgRVhUX1RZUEU6IG51bGxcbiAgXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIEBFWFRfSUQgPSBpZiBAQVBQX0lEIGlzIEBTRUxGX0lEIHRoZW4gQEVYVEVOU0lPTl9JRCBlbHNlIEBBUFBfSURcbiAgICBARVhUX1RZUEUgPSBpZiBAQVBQX0lEIGlzIEBTRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuICAgIEBTRUxGX1RZUEUgPSBpZiBAQVBQX0lEIGlzbnQgQFNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG5cbiAgd3JhcEluYm91bmQ6IChvYmosIGZuYW1lLCBmKSAtPlxuICAgICAgX2tsYXMgPSBvYmpcbiAgICAgIEBMSVNURU4uRXh0IGZuYW1lLCAoYXJncykgLT5cbiAgICAgICAgaWYgYXJncz8uaXNQcm94eT9cbiAgICAgICAgICBpZiB0eXBlb2YgYXJndW1lbnRzWzFdIGlzIFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgaWYgYXJncy5hcmd1bWVudHM/Lmxlbmd0aCA+PSAwXG4gICAgICAgICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBhcmdzLmFyZ3VtZW50cy5jb25jYXQgYXJndW1lbnRzWzFdIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgW10uY29uY2F0IGFyZ3VtZW50c1sxXVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIGFyZ3VtZW50c1xuXG4gICAgICAgICMgYXJncyA9IFtdXG4gICAgICAgICMgaWYgYXJncy5hcmd1bWVudHM/Lmxlbmd0aCBpcyAwXG4gICAgICAgICMgICBhcmdzLnB1c2ggbnVsbFxuICAgICAgICAjIGVsc2VcbiAgICAgICAgIyAgIGFyZ3MgPSBfYXJndW1lbnRzXG4gICAgICAgICMgX2FyZ3MgPSBhcmdzWzBdPy5wdXNoKGFyZ3NbMV0pXG4gICAgICAgICNmLmFwcGx5IF9rbGFzLCBhcmdzXG5cbiAgd3JhcE9iakluYm91bmQ6IChvYmopIC0+XG4gICAgKG9ialtrZXldID0gQHdyYXBJbmJvdW5kIG9iaiwgb2JqLmNvbnN0cnVjdG9yLm5hbWUgKyAnLicgKyBrZXksIG9ialtrZXldKSBmb3Iga2V5IG9mIG9iaiB3aGVuIHR5cGVvZiBvYmpba2V5XSBpcyBcImZ1bmN0aW9uXCJcbiAgICBvYmpcblxuICB3cmFwT3V0Ym91bmQ6IChvYmosIGZuYW1lLCBmKSAtPlxuICAgIC0+XG4gICAgICBtc2cgPSB7fVxuICAgICAgbXNnW2ZuYW1lXSA9IFxuICAgICAgICBpc1Byb3h5OnRydWVcbiAgICAgICAgYXJndW1lbnRzOkFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuICAgICAgbXNnW2ZuYW1lXS5pc1Byb3h5ID0gdHJ1ZVxuICAgICAgX2FyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcblxuICAgICAgaWYgX2FyZ3MubGVuZ3RoIGlzIDBcbiAgICAgICAgbXNnW2ZuYW1lXS5hcmd1bWVudHMgPSB1bmRlZmluZWQgXG4gICAgICAgIHJldHVybiBATVNHLkV4dCBtc2csICgpIC0+IHVuZGVmaW5lZFxuXG4gICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cyA9IF9hcmdzXG5cbiAgICAgIGNhbGxiYWNrID0gbXNnW2ZuYW1lXS5hcmd1bWVudHMucG9wKClcbiAgICAgIGlmIHR5cGVvZiBjYWxsYmFjayBpc250IFwiZnVuY3Rpb25cIlxuICAgICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cy5wdXNoIGNhbGxiYWNrXG4gICAgICAgIEBNU0cuRXh0IG1zZywgKCkgLT4gdW5kZWZpbmVkXG4gICAgICBlbHNlXG4gICAgICAgIEBNU0cuRXh0IG1zZywgKCkgPT5cbiAgICAgICAgICBhcmd6ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG4gICAgICAgICAgIyBwcm94eUFyZ3MgPSBbaXNQcm94eTphcmd6XVxuICAgICAgICAgIGlmIGFyZ3o/Lmxlbmd0aCA+IDAgYW5kIGFyZ3pbMF0/LmlzUHJveHk/XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseSBALCBhcmd6WzBdLmlzUHJveHkgXG5cbiAgd3JhcE9iak91dGJvdW5kOiAob2JqKSAtPlxuICAgIChvYmpba2V5XSA9IEB3cmFwT3V0Ym91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpZyIsImdldEdsb2JhbCA9IC0+XG4gIF9nZXRHbG9iYWwgPSAtPlxuICAgIHRoaXNcblxuICBfZ2V0R2xvYmFsKClcblxucm9vdCA9IGdldEdsb2JhbCgpXG5cbiMgcm9vdC5hcHAgPSBhcHAgPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuIyBhcHAgPSBuZXcgbGliLkFwcGxpY2F0aW9uXG5jaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRQb3B1cCBwb3B1cDpcInBvcHVwLmh0bWxcIlxuXG5cblxuQXBwbGljYXRpb24gPSByZXF1aXJlICcuLi8uLi9jb21tb24uY29mZmVlJ1xuUmVkaXJlY3QgPSByZXF1aXJlICcuLi8uLi9yZWRpcmVjdC5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi4vLi4vc3RvcmFnZS5jb2ZmZWUnXG5GaWxlU3lzdGVtID0gcmVxdWlyZSAnLi4vLi4vZmlsZXN5c3RlbS5jb2ZmZWUnXG5TZXJ2ZXIgPSByZXF1aXJlICcuLi8uLi9zZXJ2ZXIuY29mZmVlJ1xuXG5yZWRpciA9IG5ldyBSZWRpcmVjdFxuXG5hcHAgPSByb290LmFwcCA9IG5ldyBBcHBsaWNhdGlvblxuICBSZWRpcmVjdDogcmVkaXJcbiAgU3RvcmFnZTogU3RvcmFnZVxuICBGUzogRmlsZVN5c3RlbVxuICBTZXJ2ZXI6IFNlcnZlclxuICBcbmFwcC5TdG9yYWdlLnJldHJpZXZlQWxsKG51bGwpXG4jICAgYXBwLlN0b3JhZ2UuZGF0YVtrXSA9IGRhdGFba10gZm9yIGsgb2YgZGF0YVxuICBcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lciAodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT5cbiAgIyBpZiByZWRpci5kYXRhW3RhYklkXT8uaXNPblxuICAjICAgYXBwLm1hcEFsbFJlc291cmNlcyAoKSA9PlxuICAjICAgICBjaHJvbWUudGFicy5zZXRCYWRnZVRleHQgXG4gICMgICAgICAgdGV4dDpPYmplY3Qua2V5cyhhcHAuY3VycmVudEZpbGVNYXRjaGVzKS5sZW5ndGhcbiAgIyAgICAgICB0YWJJZDp0YWJJZFxuICAgICBcblxuXG4iLCJMSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5cbmNsYXNzIEZpbGVTeXN0ZW1cbiAgYXBpOiBjaHJvbWUuZmlsZVN5c3RlbVxuICByZXRhaW5lZERpcnM6IHt9XG4gIExJU1RFTjogTElTVEVOLmdldCgpIFxuICBNU0c6IE1TRy5nZXQoKVxuICBjb25zdHJ1Y3RvcjogKCkgLT5cblxuICAjIEBkaXJzOiBuZXcgRGlyZWN0b3J5U3RvcmVcbiAgIyBmaWxlVG9BcnJheUJ1ZmZlcjogKGJsb2IsIG9ubG9hZCwgb25lcnJvcikgLT5cbiAgIyAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgIyAgIHJlYWRlci5vbmxvYWQgPSBvbmxvYWRcblxuICAjICAgcmVhZGVyLm9uZXJyb3IgPSBvbmVycm9yXG5cbiAgIyAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBibG9iXG5cbiAgcmVhZEZpbGU6IChkaXJFbnRyeSwgcGF0aCwgY2IpIC0+XG4gICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgcGF0aCxcbiAgICAgIChlcnIsIGZpbGVFbnRyeSkgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gY2I/IGVyclxuXG4gICAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGZpbGVcbiAgICAgICAgLChlcnIpID0+IGNiPyBlcnJcblxuICBnZXRGaWxlRW50cnk6IChkaXJFbnRyeSwgcGF0aCwgY2IpIC0+XG4gICAgICBkaXJFbnRyeS5nZXRGaWxlIHBhdGgsIHt9LCAoZmlsZUVudHJ5KSA9PlxuICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5XG4gICAgICAsKGVycikgPT4gY2I/IGVyclxuXG4gICMgb3BlbkRpcmVjdG9yeTogKGNhbGxiYWNrKSAtPlxuICBvcGVuRGlyZWN0b3J5OiAoZGlyZWN0b3J5RW50cnksIGNiKSAtPlxuICAjIEBhcGkuY2hvb3NlRW50cnkgdHlwZTonb3BlbkRpcmVjdG9yeScsIChkaXJlY3RvcnlFbnRyeSwgZmlsZXMpID0+XG4gICAgQGFwaS5nZXREaXNwbGF5UGF0aCBkaXJlY3RvcnlFbnRyeSwgKHBhdGhOYW1lKSA9PlxuICAgICAgZGlyID1cbiAgICAgICAgICByZWxQYXRoOiBkaXJlY3RvcnlFbnRyeS5mdWxsUGF0aCAjLnJlcGxhY2UoJy8nICsgZGlyZWN0b3J5RW50cnkubmFtZSwgJycpXG4gICAgICAgICAgZGlyZWN0b3J5RW50cnlJZDogQGFwaS5yZXRhaW5FbnRyeShkaXJlY3RvcnlFbnRyeSlcbiAgICAgICAgICBlbnRyeTogZGlyZWN0b3J5RW50cnlcbiAgICAgIGNiPyBudWxsLCBwYXRoTmFtZSwgZGlyXG4gICAgICAgICAgIyBAZ2V0T25lRGlyTGlzdCBkaXJcbiAgICAgICAgICAjIFN0b3JhZ2Uuc2F2ZSAnZGlyZWN0b3JpZXMnLCBAc2NvcGUuZGlyZWN0b3JpZXMgKHJlc3VsdCkgLT5cblxuICBnZXRMb2NhbEZpbGVFbnRyeTogKGRpciwgZmlsZVBhdGgsIGNiKSA9PiBcbiAgICBkaXJFbnRyeSA9IGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKCkgLT5cbiAgICBpZiBub3QgZGlyRW50cnk/XG4gICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgICAgICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgZmlsZVBhdGgsIGNiXG4gICAgZWxzZVxuICAgICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgZmlsZVBhdGgsIGNiXG5cblxuXG4gICMgZ2V0TG9jYWxGaWxlOiAoZGlyLCBmaWxlUGF0aCwgY2IsIGVycm9yKSA9PiBcbiAgIyAjIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAjICMgICBkaXJFbnRyeSA9IEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdXG4gICMgIyAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgIyAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAjICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAjICAgICAsKF9lcnJvcikgPT4gZXJyb3IoX2Vycm9yKVxuICAjICMgZWxzZVxuICAjICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICMgICAgICMgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0gPSBkaXJFbnRyeVxuICAjICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGZpbGUpID0+XG4gICMgICAgICAgaWYgZXJyPyB0aGVuIGNiPyBlcnJcbiAgIyAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBmaWxlXG4gICMgICAsKF9lcnJvcikgPT4gY2I/KF9lcnJvcilcblxuICAgICAgIyBAZmluZEZpbGVGb3JRdWVyeVN0cmluZyBpbmZvLnVyaSwgc3VjY2VzcyxcbiAgICAgICMgICAgIChlcnIpID0+XG4gICAgICAjICAgICAgICAgQGZpbmRGaWxlRm9yUGF0aCBpbmZvLCBjYlxuXG4gICMgZmluZEZpbGVGb3JQYXRoOiAoaW5mbywgY2IpID0+XG4gICMgICAgIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBjYiwgaW5mby5yZWZlcmVyXG5cbiAgIyBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nOiAoX3VybCwgY2IsIGVycm9yLCByZWZlcmVyKSA9PlxuICAjICAgICB1cmwgPSBkZWNvZGVVUklDb21wb25lbnQoX3VybCkucmVwbGFjZSAvLio/c2xyZWRpclxcPS8sICcnXG5cbiAgIyAgICAgbWF0Y2ggPSBpdGVtIGZvciBpdGVtIGluIEBtYXBzIHdoZW4gdXJsLm1hdGNoKG5ldyBSZWdFeHAoaXRlbS51cmwpKT8gYW5kIGl0ZW0udXJsPyBhbmQgbm90IG1hdGNoP1xuXG4gICMgICAgIGlmIG1hdGNoP1xuICAjICAgICAgICAgaWYgcmVmZXJlcj9cbiAgIyAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5tYXRjaCgvLipcXC9cXC8uKj9cXC8oLiopLyk/WzFdXG4gICMgICAgICAgICBlbHNlXG4gICMgICAgICAgICAgICAgZmlsZVBhdGggPSB1cmwucmVwbGFjZSBuZXcgUmVnRXhwKG1hdGNoLnVybCksIG1hdGNoLnJlZ2V4UmVwbFxuXG4gICMgICAgICAgICBmaWxlUGF0aC5yZXBsYWNlICcvJywgJ1xcXFwnIGlmIHBsYXRmb3JtIGlzICd3aW4nXG5cbiAgIyAgICAgICAgIGRpciA9IEBTdG9yYWdlLmRhdGEuZGlyZWN0b3JpZXNbbWF0Y2guZGlyZWN0b3J5XVxuXG4gICMgICAgICAgICBpZiBub3QgZGlyPyB0aGVuIHJldHVybiBlcnIgJ25vIG1hdGNoJ1xuXG4gICMgICAgICAgICBpZiBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXT9cbiAgIyAgICAgICAgICAgICBkaXJFbnRyeSA9IEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdXG4gICMgICAgICAgICAgICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgICAgIGVsc2VcbiAgIyAgICAgICAgICAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0gPSBkaXJFbnRyeVxuICAjICAgICAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICAgICAgICAgICAgICAgICAgICAgKGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICAgICAgICAgICAgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICAgICAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgIGVsc2VcbiAgIyAgICAgICAgIGVycm9yKClcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlU3lzdGVtIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBMSVNURU4gZXh0ZW5kcyBDb25maWdcbiAgbG9jYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGV4dGVybmFsOlxuICAgIGFwaTogY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWxcbiAgICBsaXN0ZW5lcnM6e31cbiAgICAjIHJlc3BvbnNlQ2FsbGVkOmZhbHNlXG4gIGluc3RhbmNlID0gbnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIFxuICAgIGNocm9tZS5ydW50aW1lLm9uQ29ubmVjdEV4dGVybmFsLmFkZExpc3RlbmVyIChwb3J0KSA9PlxuICAgICAgcG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gICAgQGxvY2FsLmFwaS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZVxuICAgIEBleHRlcm5hbC5hcGk/LmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICBAZ2V0OiAoKSAtPlxuICAgIGluc3RhbmNlID89IG5ldyBMSVNURU5cblxuICBMb2NhbDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgIEBsb2NhbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIEV4dDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgICMgc2hvdyAnYWRkaW5nIGV4dCBsaXN0ZW5lciBmb3IgJyArIG1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBfb25NZXNzYWdlRXh0ZXJuYWw6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuXG4gICAgX3NlbmRSZXNwb25zZSA9ICh3aGF0ZXZlci4uLikgPT5cbiAgICAgIHRyeVxuICAgICAgICAjIHdoYXRldmVyLnNoaWZ0KCkgaWYgd2hhdGV2ZXJbMF0gaXMgbnVsbCBhbmQgd2hhdGV2ZXJbMV0/XG4gICAgICAgIHNlbmRSZXNwb25zZS5hcHBseSBudWxsLHByb3h5QXJncyA9IFtpc1Byb3h5OndoYXRldmVyXVxuXG4gICAgICBjYXRjaCBlXG4gICAgICAgIHVuZGVmaW5lZCAjIGVycm9yIGJlY2F1c2Ugbm8gcmVzcG9uc2Ugd2FzIHJlcXVlc3RlZCBmcm9tIHRoZSBNU0csIGRvbid0IGNhcmVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcbiAgICAgIFxuICAgICMgKHNob3cgXCI8PT0gR09UIEVYVEVSTkFMIE1FU1NBR0UgPT0gI3sgQEVYVF9UWVBFIH0gPT1cIiArIF9rZXkpIGZvciBfa2V5IG9mIHJlcXVlc3RcbiAgICBpZiBzZW5kZXIuaWQgaXNudCBARVhUX0lEIGFuZCBzZW5kZXIuY29uc3RydWN0b3IubmFtZSBpc250ICdQb3J0J1xuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgX3NlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcbiAgICBcbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkICMgZm9yIHN5bmNocm9ub3VzIHNlbmRSZXNwb25zZVxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgX29uTWVzc2FnZTogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHJlc3BvbnNlU3RhdHVzID0gY2FsbGVkOmZhbHNlXG4gICAgX3NlbmRSZXNwb25zZSA9ID0+XG4gICAgICB0cnlcbiAgICAgICAgIyBzaG93ICdjYWxsaW5nIHNlbmRyZXNwb25zZSdcbiAgICAgICAgc2VuZFJlc3BvbnNlLmFwcGx5IHRoaXMsYXJndW1lbnRzXG4gICAgICBjYXRjaCBlXG4gICAgICAgICMgc2hvdyBlXG4gICAgICByZXNwb25zZVN0YXR1cy5jYWxsZWQgPSB0cnVlXG5cbiAgICAjIChzaG93IFwiPD09IEdPVCBNRVNTQUdFID09ICN7IEBFWFRfVFlQRSB9ID09XCIgKyBfa2V5KSBmb3IgX2tleSBvZiByZXF1ZXN0XG4gICAgQGxvY2FsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG5cbiAgICB1bmxlc3MgcmVzcG9uc2VTdGF0dXMuY2FsbGVkXG4gICAgICAjIHNob3cgJ3JldHVybmluZyB0cnVlJ1xuICAgICAgcmV0dXJuIHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBMSVNURU4iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIE1TRyBleHRlbmRzIENvbmZpZ1xuICBpbnN0YW5jZSA9IG51bGxcbiAgcG9ydDpudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgQHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG5cbiAgQGdldDogKCkgLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgTVNHXG5cbiAgQGNyZWF0ZVBvcnQ6ICgpIC0+XG5cblxuICBMb2NhbDogKG1lc3NhZ2UsIHJlc3BvbmQpIC0+XG4gICAgKHNob3cgXCI9PSBNRVNTQUdFICN7IF9rZXkgfSA9PT5cIikgZm9yIF9rZXkgb2YgbWVzc2FnZVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlIG1lc3NhZ2UsIHJlc3BvbmRcbiAgRXh0OiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICAoc2hvdyBcIj09IE1FU1NBR0UgRVhURVJOQUwgI3sgX2tleSB9ID09PlwiKSBmb3IgX2tleSBvZiBtZXNzYWdlXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgQEVYVF9JRCwgbWVzc2FnZSwgcmVzcG9uZFxuICBFeHRQb3J0OiAobWVzc2FnZSkgLT5cbiAgICB0cnlcbiAgICAgIEBwb3J0LnBvc3RNZXNzYWdlIG1lc3NhZ2VcbiAgICBjYXRjaFxuICAgICAgQHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG4gICAgICBAcG9ydC5wb3N0TWVzc2FnZSBtZXNzYWdlXG5cbm1vZHVsZS5leHBvcnRzID0gTVNHIiwiLypcbiAgVGVzdGVkIGFnYWluc3QgQ2hyb21pdW0gYnVpbGQgd2l0aCBPYmplY3Qub2JzZXJ2ZSBhbmQgYWN0cyBFWEFDVExZIHRoZSBzYW1lLFxuICB0aG91Z2ggQ2hyb21pdW0gYnVpbGQgaXMgTVVDSCBmYXN0ZXJcblxuICBUcnlpbmcgdG8gc3RheSBhcyBjbG9zZSB0byB0aGUgc3BlYyBhcyBwb3NzaWJsZSxcbiAgdGhpcyBpcyBhIHdvcmsgaW4gcHJvZ3Jlc3MsIGZlZWwgZnJlZSB0byBjb21tZW50L3VwZGF0ZVxuXG4gIFNwZWNpZmljYXRpb246XG4gICAgaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTpvYnNlcnZlXG5cbiAgQnVpbHQgdXNpbmcgcGFydHMgb2Y6XG4gICAgaHR0cHM6Ly9naXRodWIuY29tL3R2Y3V0c2VtL2hhcm1vbnktcmVmbGVjdC9ibG9iL21hc3Rlci9leGFtcGxlcy9vYnNlcnZlci5qc1xuXG4gIExpbWl0cyBzbyBmYXI7XG4gICAgQnVpbHQgdXNpbmcgcG9sbGluZy4uLiBXaWxsIHVwZGF0ZSBhZ2FpbiB3aXRoIHBvbGxpbmcvZ2V0dGVyJnNldHRlcnMgdG8gbWFrZSB0aGluZ3MgYmV0dGVyIGF0IHNvbWUgcG9pbnRcblxuVE9ETzpcbiAgQWRkIHN1cHBvcnQgZm9yIE9iamVjdC5wcm90b3R5cGUud2F0Y2ggLT4gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L3dhdGNoXG4qL1xuXCJ1c2Ugc3RyaWN0XCI7XG5pZighT2JqZWN0Lm9ic2VydmUpe1xuICAoZnVuY3Rpb24oZXh0ZW5kLCBnbG9iYWwpe1xuICAgIHZhciBpc0NhbGxhYmxlID0gKGZ1bmN0aW9uKHRvU3RyaW5nKXtcbiAgICAgICAgdmFyIHMgPSB0b1N0cmluZy5jYWxsKHRvU3RyaW5nKSxcbiAgICAgICAgICAgIHUgPSB0eXBlb2YgdTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBnbG9iYWwuYWxlcnQgPT09IFwib2JqZWN0XCIgP1xuICAgICAgICAgIGZ1bmN0aW9uKGYpe1xuICAgICAgICAgICAgcmV0dXJuIHMgPT09IHRvU3RyaW5nLmNhbGwoZikgfHwgKCEhZiAmJiB0eXBlb2YgZi50b1N0cmluZyA9PSB1ICYmIHR5cGVvZiBmLnZhbHVlT2YgPT0gdSAmJiAvXlxccypcXGJmdW5jdGlvblxcYi8udGVzdChcIlwiICsgZikpO1xuICAgICAgICAgIH06XG4gICAgICAgICAgZnVuY3Rpb24oZil7XG4gICAgICAgICAgICByZXR1cm4gcyA9PT0gdG9TdHJpbmcuY2FsbChmKTtcbiAgICAgICAgICB9XG4gICAgICAgIDtcbiAgICB9KShleHRlbmQucHJvdG90eXBlLnRvU3RyaW5nKTtcbiAgICAvLyBpc05vZGUgJiBpc0VsZW1lbnQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM4NDI4Ni9qYXZhc2NyaXB0LWlzZG9tLWhvdy1kby15b3UtY2hlY2staWYtYS1qYXZhc2NyaXB0LW9iamVjdC1pcy1hLWRvbS1vYmplY3RcbiAgICAvL1JldHVybnMgdHJ1ZSBpZiBpdCBpcyBhIERPTSBub2RlXG4gICAgZnVuY3Rpb24gaXNOb2RlKG8pe1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdHlwZW9mIE5vZGUgPT09IFwib2JqZWN0XCIgPyBvIGluc3RhbmNlb2YgTm9kZSA6XG4gICAgICAgIG8gJiYgdHlwZW9mIG8gPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG8ubm9kZVR5cGUgPT09IFwibnVtYmVyXCIgJiYgdHlwZW9mIG8ubm9kZU5hbWU9PT1cInN0cmluZ1wiXG4gICAgICApO1xuICAgIH1cbiAgICAvL1JldHVybnMgdHJ1ZSBpZiBpdCBpcyBhIERPTSBlbGVtZW50XG4gICAgZnVuY3Rpb24gaXNFbGVtZW50KG8pe1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdHlwZW9mIEhUTUxFbGVtZW50ID09PSBcIm9iamVjdFwiID8gbyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50IDogLy9ET00yXG4gICAgICAgIG8gJiYgdHlwZW9mIG8gPT09IFwib2JqZWN0XCIgJiYgbyAhPT0gbnVsbCAmJiBvLm5vZGVUeXBlID09PSAxICYmIHR5cGVvZiBvLm5vZGVOYW1lPT09XCJzdHJpbmdcIlxuICAgICk7XG4gICAgfVxuICAgIHZhciBfaXNJbW1lZGlhdGVTdXBwb3J0ZWQgPSAoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiAhIWdsb2JhbC5zZXRJbW1lZGlhdGU7XG4gICAgfSkoKTtcbiAgICB2YXIgX2RvQ2hlY2tDYWxsYmFjayA9IChmdW5jdGlvbigpe1xuICAgICAgaWYoX2lzSW1tZWRpYXRlU3VwcG9ydGVkKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGYpe1xuICAgICAgICAgIHJldHVybiBzZXRJbW1lZGlhdGUoZik7XG4gICAgICAgIH07XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGYpe1xuICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGYsIDEwKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KSgpO1xuICAgIHZhciBfY2xlYXJDaGVja0NhbGxiYWNrID0gKGZ1bmN0aW9uKCl7XG4gICAgICBpZihfaXNJbW1lZGlhdGVTdXBwb3J0ZWQpe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaWQpe1xuICAgICAgICAgIGNsZWFySW1tZWRpYXRlKGlkKTtcbiAgICAgICAgfTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaWQpe1xuICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSkoKTtcbiAgICB2YXIgaXNOdW1lcmljPWZ1bmN0aW9uKG4pe1xuICAgICAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KG4pKSAmJiBpc0Zpbml0ZShuKTtcbiAgICB9O1xuICAgIHZhciBzYW1lVmFsdWVOb3RpZnkgPSBmdW5jdGlvbih4LCB5KXtcbiAgICAgIGlmKHR5cGVvZih4KT09PSdvYmplY3QnICYmIHR5cGVvZih5KT09PSdvYmplY3QnICYmIHggIT0gbnVsbCAmJiB5ICE9IG51bGwpIHtcbiAgICAgICAgdmFyIGFLZXlzID0gT2JqZWN0LmtleXMoeCkuc29ydCgpO1xuICAgICAgICB2YXIgYktleXMgPSBPYmplY3Qua2V5cyh5KS5zb3J0KCk7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhS2V5cykgPT09IEpTT04uc3RyaW5naWZ5KGJLZXlzKTtcbiAgICAgIH1cbiAgICAgIGlmKHg9PT15KXtcbiAgICAgICAgcmV0dXJuIHggIT09IDAgfHwgMSAvIHggPT09IDEgLyB5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHggIT09IHggJiYgeSAhPT0geTtcbiAgICB9O1xuICAgIHZhciBzYW1lVmFsdWUgPSBmdW5jdGlvbih4LCB5KXtcbiAgICAgIGlmKHg9PT15KXtcbiAgICAgICAgcmV0dXJuIHggIT09IDAgfHwgMSAvIHggPT09IDEgLyB5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHggIT09IHggJiYgeSAhPT0geTtcbiAgICB9OyAgICBcbiAgICB2YXIgaXNBY2Nlc3NvckRlc2NyaXB0b3IgPSBmdW5jdGlvbihkZXNjKXtcbiAgICAgIGlmICh0eXBlb2YoZGVzYykgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuICgnZ2V0JyBpbiBkZXNjIHx8ICdzZXQnIGluIGRlc2MpO1xuICAgIH07XG4gICAgdmFyIGlzRGF0YURlc2NyaXB0b3IgPSBmdW5jdGlvbihkZXNjKXtcbiAgICAgIGlmICh0eXBlb2YoZGVzYykgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuICgndmFsdWUnIGluIGRlc2MgfHwgJ3dyaXRhYmxlJyBpbiBkZXNjKTtcbiAgICB9O1xuICAgIFxuICAgIHZhciB2YWxpZGF0ZUFyZ3VtZW50cyA9IGZ1bmN0aW9uKE8sIGNhbGxiYWNrLCBhY2NlcHQpe1xuICAgICAgaWYodHlwZW9mKE8pIT09J29iamVjdCcpe1xuICAgICAgICAvLyBUaHJvdyBFcnJvclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0Lm9ic2VydmVPYmplY3QgY2FsbGVkIG9uIG5vbi1vYmplY3RcIik7XG4gICAgICB9XG4gICAgICBpZihpc0NhbGxhYmxlKGNhbGxiYWNrKT09PWZhbHNlKXtcbiAgICAgICAgLy8gVGhyb3cgRXJyb3JcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdC5vYnNlcnZlT2JqZWN0OiBFeHBlY3RpbmcgZnVuY3Rpb25cIik7XG4gICAgICB9XG4gICAgICBpZihPYmplY3QuaXNGcm96ZW4oY2FsbGJhY2spPT09dHJ1ZSl7XG4gICAgICAgIC8vIFRocm93IEVycm9yXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3Qub2JzZXJ2ZU9iamVjdDogRXhwZWN0aW5nIHVuZnJvemVuIGZ1bmN0aW9uXCIpO1xuICAgICAgfVxuICAgICAgaWYgKGFjY2VwdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShhY2NlcHQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdC5vYnNlcnZlT2JqZWN0OiBFeHBlY3RpbmcgYWNjZXB0TGlzdCBpbiB0aGUgZm9ybSBvZiBhbiBhcnJheVwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgT2JzZXJ2ZXIgPSAoZnVuY3Rpb24oKXtcbiAgICAgIHZhciB3cmFwZWQgPSBbXTtcbiAgICAgIHZhciBPYnNlcnZlciA9IGZ1bmN0aW9uKE8sIGNhbGxiYWNrLCBhY2NlcHQpe1xuICAgICAgICB2YWxpZGF0ZUFyZ3VtZW50cyhPLCBjYWxsYmFjaywgYWNjZXB0KTtcbiAgICAgICAgaWYgKCFhY2NlcHQpIHtcbiAgICAgICAgICBhY2NlcHQgPSBbXCJhZGRcIiwgXCJ1cGRhdGVcIiwgXCJkZWxldGVcIiwgXCJyZWNvbmZpZ3VyZVwiLCBcInNldFByb3RvdHlwZVwiLCBcInByZXZlbnRFeHRlbnNpb25zXCJdO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5nZXROb3RpZmllcihPKS5hZGRMaXN0ZW5lcihjYWxsYmFjaywgYWNjZXB0KTtcbiAgICAgICAgaWYod3JhcGVkLmluZGV4T2YoTyk9PT0tMSl7XG4gICAgICAgICAgd3JhcGVkLnB1c2goTyk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIE9iamVjdC5nZXROb3RpZmllcihPKS5fY2hlY2tQcm9wZXJ0eUxpc3RpbmcoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgT2JzZXJ2ZXIucHJvdG90eXBlLmRlbGl2ZXJDaGFuZ2VSZWNvcmRzID0gZnVuY3Rpb24oTyl7XG4gICAgICAgIE9iamVjdC5nZXROb3RpZmllcihPKS5kZWxpdmVyQ2hhbmdlUmVjb3JkcygpO1xuICAgICAgfTtcblxuICAgICAgd3JhcGVkLmxhc3RTY2FubmVkID0gMDtcbiAgICAgIHZhciBmID0gKGZ1bmN0aW9uKHdyYXBwZWQpe1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IDAsIGwgPSB3cmFwcGVkLmxlbmd0aCwgc3RhcnRUaW1lID0gbmV3IERhdGUoKSwgdGFraW5nVG9vTG9uZz1mYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IoaT13cmFwcGVkLmxhc3RTY2FubmVkOyAoaTxsKSYmKCF0YWtpbmdUb29Mb25nKTsgaSsrKXtcbiAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXROb3RpZmllcih3cmFwcGVkW2ldKS5fY2hlY2tQcm9wZXJ0eUxpc3RpbmcoKTtcbiAgICAgICAgICAgICAgICAgIHRha2luZ1Rvb0xvbmc9KChuZXcgRGF0ZSgpKS1zdGFydFRpbWUpPjEwMDsgLy8gbWFrZSBzdXJlIHdlIGRvbid0IHRha2UgbW9yZSB0aGFuIDEwMCBtaWxsaXNlY29uZHMgdG8gc2NhbiBhbGwgb2JqZWN0c1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3cmFwcGVkLmxhc3RTY2FubmVkPWk8bD9pOjA7IC8vIHJlc2V0IHdyYXBwZWQgc28gd2UgY2FuIG1ha2Ugc3VyZSB0aGF0IHdlIHBpY2sgdGhpbmdzIGJhY2sgdXBcbiAgICAgICAgICAgICAgICBfZG9DaGVja0NhbGxiYWNrKGYpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkod3JhcGVkKTtcbiAgICAgIF9kb0NoZWNrQ2FsbGJhY2soZik7XG4gICAgICByZXR1cm4gT2JzZXJ2ZXI7XG4gICAgfSkoKTtcblxuICAgIHZhciBOb3RpZmllciA9IGZ1bmN0aW9uKHdhdGNoaW5nKXtcbiAgICB2YXIgX2xpc3RlbmVycyA9IFtdLCBfYWNjZXB0TGlzdHMgPSBbXSwgX3VwZGF0ZXMgPSBbXSwgX3VwZGF0ZXIgPSBmYWxzZSwgcHJvcGVydGllcyA9IFtdLCB2YWx1ZXMgPSBbXTtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZWxmLCAnX3dhdGNoaW5nJywge1xuICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIGdldDogKGZ1bmN0aW9uKHdhdGNoZWQpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2F0Y2hlZDtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0pKHdhdGNoaW5nKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgdmFyIHdyYXBQcm9wZXJ0eSA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcCl7XG4gICAgICAgIHZhciBwcm9wVHlwZSA9IHR5cGVvZihvYmplY3RbcHJvcF0pLCBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3ApO1xuICAgICAgICBpZigocHJvcD09PSdnZXROb3RpZmllcicpfHxpc0FjY2Vzc29yRGVzY3JpcHRvcihkZXNjcmlwdG9yKXx8KCFkZXNjcmlwdG9yLmVudW1lcmFibGUpKXtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYoKG9iamVjdCBpbnN0YW5jZW9mIEFycmF5KSYmaXNOdW1lcmljKHByb3ApKXtcbiAgICAgICAgICB2YXIgaWR4ID0gcHJvcGVydGllcy5sZW5ndGg7XG4gICAgICAgICAgcHJvcGVydGllc1tpZHhdID0gcHJvcDtcbiAgICAgICAgICB2YWx1ZXNbaWR4XSA9IG9iamVjdFtwcm9wXTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAoZnVuY3Rpb24oaWR4LCBwcm9wKXtcbiAgICAgICAgICBwcm9wZXJ0aWVzW2lkeF0gPSBwcm9wO1xuICAgICAgICAgIHZhbHVlc1tpZHhdID0gb2JqZWN0W3Byb3BdO1xuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIHByb3AsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlc1tpZHhdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgICAgICBpZighc2FtZVZhbHVlTm90aWZ5KHZhbHVlc1tpZHhdLCB2YWx1ZSkpXG4gICAgICAgICAgICAgICAgT2JqZWN0LmdldE5vdGlmaWVyKG9iamVjdCkucXVldWVVcGRhdGUob2JqZWN0LCBwcm9wLCAndXBkYXRlJywgdmFsdWVzW2lkeF0pO1xuICAgICAgICAgICAgICBpZighc2FtZVZhbHVlKHZhbHVlc1tpZHhdLCB2YWx1ZSkpXG4gICAgICAgICAgICAgICAgdmFsdWVzW2lkeF0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSkocHJvcGVydGllcy5sZW5ndGgsIHByb3ApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgICBzZWxmLl9jaGVja1Byb3BlcnR5TGlzdGluZyA9IGZ1bmN0aW9uKGRvbnRRdWV1ZVVwZGF0ZXMpe1xuICAgICAgICB2YXIgb2JqZWN0ID0gc2VsZi5fd2F0Y2hpbmcsIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpLCBpPTAsIGw9a2V5cy5sZW5ndGg7XG4gICAgICAgIHZhciBuZXdLZXlzID0gW10sIG9sZEtleXMgPSBwcm9wZXJ0aWVzLnNsaWNlKDApLCB1cGRhdGVzID0gW107XG4gICAgICAgIHZhciBwcm9wLCBxdWV1ZVVwZGF0ZXMgPSAhZG9udFF1ZXVlVXBkYXRlcywgcHJvcFR5cGUsIHZhbHVlLCBpZHgsIGFMZW5ndGg7XG5cbiAgICAgICAgaWYob2JqZWN0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgICAgIGFMZW5ndGggPSBwcm9wZXJ0aWVzLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihpPTA7IGk8bDsgaSsrKXtcbiAgICAgICAgICBwcm9wID0ga2V5c1tpXTtcbiAgICAgICAgICB2YWx1ZSA9IG9iamVjdFtwcm9wXTtcbiAgICAgICAgICBwcm9wVHlwZSA9IHR5cGVvZih2YWx1ZSk7XG4gICAgICAgICAgaWYoKGlkeCA9IHByb3BlcnRpZXMuaW5kZXhPZihwcm9wKSk9PT0tMSl7XG4gICAgICAgICAgICBpZih3cmFwUHJvcGVydHkob2JqZWN0LCBwcm9wKSYmcXVldWVVcGRhdGVzKXtcbiAgICAgICAgICAgICAgc2VsZi5xdWV1ZVVwZGF0ZShvYmplY3QsIHByb3AsICdhZGQnLCBudWxsLCBvYmplY3RbcHJvcF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgaWYoKG9iamVjdCBpbnN0YW5jZW9mIEFycmF5KSYmKGlzTnVtZXJpYyhwcm9wKSkpe1xuICAgICAgICAgICAgICBpZighc2FtZVZhbHVlTm90aWZ5KHZhbHVlc1tpZHhdLHZhbHVlKSl7XG4gICAgICAgICAgICAgICAgaWYocXVldWVVcGRhdGVzKXtcbiAgICAgICAgICAgICAgICAgIHNlbGYucXVldWVVcGRhdGUob2JqZWN0LCBwcm9wLCAndXBkYXRlJywgdmFsdWVzW2lkeF0sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYodmFsdWVzW2lkeF0gIT09IHZhbHVlKVxuICAgICAgICAgICAgICAgIHZhbHVlc1tpZHhdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvbGRLZXlzLnNwbGljZShvbGRLZXlzLmluZGV4T2YocHJvcCksIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKG9iamVjdCBpbnN0YW5jZW9mIEFycmF5ICYmIG9iamVjdC5sZW5ndGggIT09IGFMZW5ndGgpe1xuICAgICAgICAgIGlmKHF1ZXVlVXBkYXRlcyl7XG4gICAgICAgICAgICBzZWxmLnF1ZXVlVXBkYXRlKG9iamVjdCwgJ2xlbmd0aCcsICd1cGRhdGUnLCBhTGVuZ3RoLCBvYmplY3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHF1ZXVlVXBkYXRlcyl7XG4gICAgICAgICAgbCA9IG9sZEtleXMubGVuZ3RoO1xuICAgICAgICAgIGZvcihpPTA7IGk8bDsgaSsrKXtcbiAgICAgICAgICAgIGlkeCA9IHByb3BlcnRpZXMuaW5kZXhPZihvbGRLZXlzW2ldKTtcbiAgICAgICAgICAgIHNlbGYucXVldWVVcGRhdGUob2JqZWN0LCBvbGRLZXlzW2ldLCAnZGVsZXRlJywgdmFsdWVzW2lkeF0pO1xuICAgICAgICAgICAgcHJvcGVydGllcy5zcGxpY2UoaWR4LDEpO1xuICAgICAgICAgICAgdmFsdWVzLnNwbGljZShpZHgsMSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNlbGYuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbihjYWxsYmFjaywgYWNjZXB0KXtcbiAgICAgICAgdmFyIGlkeCA9IF9saXN0ZW5lcnMuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgIGlmKGlkeD09PS0xKXtcbiAgICAgICAgICBfbGlzdGVuZXJzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgIF9hY2NlcHRMaXN0cy5wdXNoKGFjY2VwdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgX2FjY2VwdExpc3RzW2lkeF0gPSBhY2NlcHQ7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzZWxmLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuICAgICAgICB2YXIgaWR4ID0gX2xpc3RlbmVycy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICAgICAgaWYoaWR4Pi0xKXtcbiAgICAgICAgICBfbGlzdGVuZXJzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgIF9hY2NlcHRMaXN0cy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNlbGYubGlzdGVuZXJzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIF9saXN0ZW5lcnM7XG4gICAgICB9O1xuICAgICAgc2VsZi5xdWV1ZVVwZGF0ZSA9IGZ1bmN0aW9uKHdoYXQsIHByb3AsIHR5cGUsIHdhcyl7XG4gICAgICAgIHRoaXMucXVldWVVcGRhdGVzKFt7XG4gICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICBvYmplY3Q6IHdoYXQsXG4gICAgICAgICAgbmFtZTogcHJvcCxcbiAgICAgICAgICBvbGRWYWx1ZTogd2FzXG4gICAgICAgIH1dKTtcbiAgICAgIH07XG4gICAgICBzZWxmLnF1ZXVlVXBkYXRlcyA9IGZ1bmN0aW9uKHVwZGF0ZXMpe1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIGkgPSAwLCBsID0gdXBkYXRlcy5sZW5ndGh8fDAsIHVwZGF0ZTtcbiAgICAgICAgZm9yKGk9MDsgaTxsOyBpKyspe1xuICAgICAgICAgIHVwZGF0ZSA9IHVwZGF0ZXNbaV07XG4gICAgICAgICAgX3VwZGF0ZXMucHVzaCh1cGRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmKF91cGRhdGVyKXtcbiAgICAgICAgICBfY2xlYXJDaGVja0NhbGxiYWNrKF91cGRhdGVyKTtcbiAgICAgICAgfVxuICAgICAgICBfdXBkYXRlciA9IF9kb0NoZWNrQ2FsbGJhY2soZnVuY3Rpb24oKXtcbiAgICAgICAgICBfdXBkYXRlciA9IGZhbHNlO1xuICAgICAgICAgIHNlbGYuZGVsaXZlckNoYW5nZVJlY29yZHMoKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgc2VsZi5kZWxpdmVyQ2hhbmdlUmVjb3JkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpID0gMCwgbCA9IF9saXN0ZW5lcnMubGVuZ3RoLFxuICAgICAgICAgICAgLy9rZWVwUnVubmluZyA9IHRydWUsIHJlbW92ZWQgYXMgaXQgc2VlbXMgdGhlIGFjdHVhbCBpbXBsZW1lbnRhdGlvbiBkb2Vzbid0IGRvIHRoaXNcbiAgICAgICAgICAgIC8vIEluIHJlc3BvbnNlIHRvIEJVRyAjNVxuICAgICAgICAgICAgcmV0dmFsO1xuICAgICAgICBmb3IoaT0wOyBpPGw7IGkrKyl7XG4gICAgICAgICAgaWYoX2xpc3RlbmVyc1tpXSl7XG4gICAgICAgICAgICB2YXIgY3VycmVudFVwZGF0ZXM7XG4gICAgICAgICAgICBpZiAoX2FjY2VwdExpc3RzW2ldKSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRVcGRhdGVzID0gW107XG4gICAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCB1cGRhdGVzTGVuZ3RoID0gX3VwZGF0ZXMubGVuZ3RoOyBqIDwgdXBkYXRlc0xlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKF9hY2NlcHRMaXN0c1tpXS5pbmRleE9mKF91cGRhdGVzW2pdLnR5cGUpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgY3VycmVudFVwZGF0ZXMucHVzaChfdXBkYXRlc1tqXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgY3VycmVudFVwZGF0ZXMgPSBfdXBkYXRlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdXJyZW50VXBkYXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgaWYoX2xpc3RlbmVyc1tpXT09PWNvbnNvbGUubG9nKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjdXJyZW50VXBkYXRlcyk7XG4gICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIF9saXN0ZW5lcnNbaV0oY3VycmVudFVwZGF0ZXMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8qXG4gICAgICAgIGZvcihpPTA7IGk8bCYma2VlcFJ1bm5pbmc7IGkrKyl7XG4gICAgICAgICAgaWYodHlwZW9mKF9saXN0ZW5lcnNbaV0pPT09J2Z1bmN0aW9uJyl7XG4gICAgICAgICAgICBpZihfbGlzdGVuZXJzW2ldPT09Y29uc29sZS5sb2cpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhfdXBkYXRlcyk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgcmV0dmFsID0gX2xpc3RlbmVyc1tpXShfdXBkYXRlcyk7XG4gICAgICAgICAgICAgIGlmKHR5cGVvZihyZXR2YWwpID09PSAnYm9vbGVhbicpe1xuICAgICAgICAgICAgICAgIGtlZXBSdW5uaW5nID0gcmV0dmFsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICovXG4gICAgICAgIF91cGRhdGVzPVtdO1xuICAgICAgfTtcbiAgICAgIHNlbGYubm90aWZ5ID0gZnVuY3Rpb24oY2hhbmdlUmVjb3JkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2hhbmdlUmVjb3JkICE9PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjaGFuZ2VSZWNvcmQudHlwZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGNoYW5nZVJlY29yZCB3aXRoIG5vbi1zdHJpbmcgJ3R5cGUnIHByb3BlcnR5XCIpO1xuICAgICAgICB9XG4gICAgICAgIGNoYW5nZVJlY29yZC5vYmplY3QgPSB3YXRjaGluZztcbiAgICAgICAgc2VsZi5xdWV1ZVVwZGF0ZXMoW2NoYW5nZVJlY29yZF0pO1xuICAgICAgfTtcbiAgICAgIHNlbGYuX2NoZWNrUHJvcGVydHlMaXN0aW5nKHRydWUpO1xuICAgIH07XG5cbiAgICB2YXIgX25vdGlmaWVycz1bXSwgX2luZGV4ZXM9W107XG4gICAgZXh0ZW5kLmdldE5vdGlmaWVyID0gZnVuY3Rpb24oTyl7XG4gICAgdmFyIGlkeCA9IF9pbmRleGVzLmluZGV4T2YoTyksIG5vdGlmaWVyID0gaWR4Pi0xP19ub3RpZmllcnNbaWR4XTpmYWxzZTtcbiAgICAgIGlmKCFub3RpZmllcil7XG4gICAgICAgIGlkeCA9IF9pbmRleGVzLmxlbmd0aDtcbiAgICAgICAgX2luZGV4ZXNbaWR4XSA9IE87XG4gICAgICAgIG5vdGlmaWVyID0gX25vdGlmaWVyc1tpZHhdID0gbmV3IE5vdGlmaWVyKE8pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vdGlmaWVyO1xuICAgIH07XG4gICAgZXh0ZW5kLm9ic2VydmUgPSBmdW5jdGlvbihPLCBjYWxsYmFjaywgYWNjZXB0KXtcbiAgICAgIC8vIEZvciBCdWcgNCwgY2FuJ3Qgb2JzZXJ2ZSBET00gZWxlbWVudHMgdGVzdGVkIGFnYWluc3QgY2FucnkgaW1wbGVtZW50YXRpb24gYW5kIG1hdGNoZXNcbiAgICAgIGlmKCFpc0VsZW1lbnQoTykpe1xuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmVyKE8sIGNhbGxiYWNrLCBhY2NlcHQpO1xuICAgICAgfVxuICAgIH07XG4gICAgZXh0ZW5kLnVub2JzZXJ2ZSA9IGZ1bmN0aW9uKE8sIGNhbGxiYWNrKXtcbiAgICAgIHZhbGlkYXRlQXJndW1lbnRzKE8sIGNhbGxiYWNrKTtcbiAgICAgIHZhciBpZHggPSBfaW5kZXhlcy5pbmRleE9mKE8pLFxuICAgICAgICAgIG5vdGlmaWVyID0gaWR4Pi0xP19ub3RpZmllcnNbaWR4XTpmYWxzZTtcbiAgICAgIGlmICghbm90aWZpZXIpe1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBub3RpZmllci5yZW1vdmVMaXN0ZW5lcihjYWxsYmFjayk7XG4gICAgICBpZiAobm90aWZpZXIubGlzdGVuZXJzKCkubGVuZ3RoID09PSAwKXtcbiAgICAgICAgX2luZGV4ZXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIF9ub3RpZmllcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkoT2JqZWN0LCB0aGlzKTtcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQ2hhbmdlO1xuXG4vKiFcbiAqIENoYW5nZSBvYmplY3QgY29uc3RydWN0b3JcbiAqXG4gKiBUaGUgYGNoYW5nZWAgb2JqZWN0IHBhc3NlZCB0byBPYmplY3Qub2JzZXJ2ZSBjYWxsYmFja3NcbiAqIGlzIGltbXV0YWJsZSBzbyB3ZSBjcmVhdGUgYSBuZXcgb25lIHRvIG1vZGlmeS5cbiAqL1xuXG5mdW5jdGlvbiBDaGFuZ2UgKHBhdGgsIGNoYW5nZSkge1xuICB0aGlzLnBhdGggPSBwYXRoO1xuICB0aGlzLm5hbWUgPSBjaGFuZ2UubmFtZTtcbiAgdGhpcy50eXBlID0gY2hhbmdlLnR5cGU7XG4gIHRoaXMub2JqZWN0ID0gY2hhbmdlLm9iamVjdDtcbiAgdGhpcy52YWx1ZSA9IGNoYW5nZS5vYmplY3RbY2hhbmdlLm5hbWVdO1xuICB0aGlzLm9sZFZhbHVlID0gY2hhbmdlLm9sZFZhbHVlO1xufVxuXG4iLCIvLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255Om9ic2VydmVcblxudmFyIENoYW5nZSA9IHJlcXVpcmUoJy4vY2hhbmdlJyk7XG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbi8vIHZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ29ic2VydmVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IE9ic2VydmFibGU7XG5cbi8qKlxuICogT2JzZXJ2YWJsZSBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBUaGUgcGFzc2VkIGBzdWJqZWN0YCB3aWxsIGJlIG9ic2VydmVkIGZvciBjaGFuZ2VzIHRvXG4gKiBhbGwgcHJvcGVydGllcywgaW5jbHVkZWQgbmVzdGVkIG9iamVjdHMgYW5kIGFycmF5cy5cbiAqXG4gKiBBbiBgRXZlbnRFbWl0dGVyYCB3aWxsIGJlIHJldHVybmVkLiBUaGlzIGVtaXR0ZXIgd2lsbFxuICogZW1pdCB0aGUgZm9sbG93aW5nIGV2ZW50czpcbiAqXG4gKiAtIGFkZFxuICogLSB1cGRhdGVcbiAqIC0gZGVsZXRlXG4gKiAtIHJlY29uZmlndXJlXG4gKlxuICogLy8gLSBzZXRQcm90b3R5cGU/XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHN1YmplY3RcbiAqIEBwYXJhbSB7T2JzZXJ2YWJsZX0gW3BhcmVudF0gKGludGVybmFsIHVzZSlcbiAqIEBwYXJhbSB7U3RyaW5nfSBbcHJlZml4XSAoaW50ZXJuYWwgdXNlKVxuICogQHJldHVybiB7RXZlbnRFbWl0dGVyfVxuICovXG5cbmZ1bmN0aW9uIE9ic2VydmFibGUgKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KSB7XG4gIGlmICgnb2JqZWN0JyAhPSB0eXBlb2Ygc3ViamVjdClcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvYmplY3QgZXhwZWN0ZWQuIGdvdDogJyArIHR5cGVvZiBzdWJqZWN0KTtcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgT2JzZXJ2YWJsZSkpXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KTtcblxuICAvLyBkZWJ1ZygnbmV3Jywgc3ViamVjdCwgISFwYXJlbnQsIHByZWZpeCk7XG5cbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9iaW5kKHN1YmplY3QsIHBhcmVudCwgcHJlZml4KTtcbn07XG5cbi8vIGFkZCBlbWl0dGVyIGNhcGFiaWxpdGllc1xuZm9yICh2YXIgaSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICBPYnNlcnZhYmxlLnByb3RvdHlwZVtpXSA9IEVtaXR0ZXIucHJvdG90eXBlW2ldO1xufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5vYnNlcnZlcnMgPSB1bmRlZmluZWQ7XG5PYnNlcnZhYmxlLnByb3RvdHlwZS5vbmNoYW5nZSA9IHVuZGVmaW5lZDtcbk9ic2VydmFibGUucHJvdG90eXBlLnN1YmplY3QgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogQmluZHMgdGhpcyBPYnNlcnZhYmxlIHRvIGBzdWJqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc3ViamVjdFxuICogQHBhcmFtIHtPYnNlcnZhYmxlfSBbcGFyZW50XVxuICogQHBhcmFtIHtTdHJpbmd9IFtwcmVmaXhdXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5fYmluZCA9IGZ1bmN0aW9uIChzdWJqZWN0LCBwYXJlbnQsIHByZWZpeCkge1xuICBpZiAodGhpcy5zdWJqZWN0KSB0aHJvdyBuZXcgRXJyb3IoJ2FscmVhZHkgYm91bmQhJyk7XG4gIGlmIChudWxsID09IHN1YmplY3QpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N1YmplY3QgY2Fubm90IGJlIG51bGwnKTtcblxuICAvLyBkZWJ1ZygnX2JpbmQnLCBzdWJqZWN0KTtcblxuICB0aGlzLnN1YmplY3QgPSBzdWJqZWN0O1xuXG4gIGlmIChwYXJlbnQpIHtcbiAgICBwYXJlbnQub2JzZXJ2ZXJzLnB1c2godGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5vYnNlcnZlcnMgPSBbdGhpc107XG4gIH1cblxuICB0aGlzLm9uY2hhbmdlID0gb25jaGFuZ2UocGFyZW50IHx8IHRoaXMsIHByZWZpeCk7XG4gIC8vIHZhciBvbmNoYW4gPSBvbmNoYW5nZShwYXJlbnQgfHwgdGhpcywgcHJlZml4KTtcbiAgT2JqZWN0Lm9ic2VydmUodGhpcy5zdWJqZWN0LCB0aGlzLm9uY2hhbmdlKTtcblxuICB0aGlzLl93YWxrKHBhcmVudCB8fCB0aGlzLCBwcmVmaXgpO1xufVxuXG4vKipcbiAqIFBlbmRpbmcgY2hhbmdlIGV2ZW50cyBhcmUgbm90IGVtaXR0ZWQgdW50aWwgYWZ0ZXIgdGhlIG5leHRcbiAqIHR1cm4gb2YgdGhlIGV2ZW50IGxvb3AuIFRoaXMgbWV0aG9kIGZvcmNlcyB0aGUgZW5naW5lcyBoYW5kXG4gKiBhbmQgdHJpZ2dlcnMgYWxsIGV2ZW50cyBub3cuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5kZWxpdmVyQ2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gZGVidWcoJ2RlbGl2ZXJDaGFuZ2VzJylcbiAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaChmdW5jdGlvbihvKSB7XG4gICAgT2JqZWN0LmRlbGl2ZXJDaGFuZ2VSZWNvcmRzKG8ub25jaGFuZ2UpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBXYWxrIGRvd24gdGhyb3VnaCB0aGUgdHJlZSBvZiBvdXIgYHN1YmplY3RgLCBvYnNlcnZpbmdcbiAqIG9iamVjdHMgYWxvbmcgdGhlIHdheS5cbiAqXG4gKiBAcGFyYW0ge09ic2VydmFibGV9IFtwYXJlbnRdXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ByZWZpeF1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbk9ic2VydmFibGUucHJvdG90eXBlLl93YWxrID0gZnVuY3Rpb24gKHBhcmVudCwgcHJlZml4KSB7XG4gIC8vIGRlYnVnKCdfd2FsaycpO1xuXG4gIHZhciBvYmplY3QgPSB0aGlzLnN1YmplY3Q7XG5cbiAgLy8ga2V5cz9cbiAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0W25hbWVdO1xuXG4gICAgaWYgKCdvYmplY3QnICE9IHR5cGVvZiB2YWx1ZSkgcmV0dXJuO1xuICAgIGlmIChudWxsID09IHZhbHVlKSByZXR1cm47XG5cbiAgICB2YXIgcGF0aCA9IHByZWZpeFxuICAgICAgPyBwcmVmaXggKyAnXl4nICsgbmFtZVxuICAgICAgOiBuYW1lO1xuXG4gICAgbmV3IE9ic2VydmFibGUodmFsdWUsIHBhcmVudCwgcGF0aCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFN0b3AgbGlzdGVuaW5nIHRvIGFsbCBib3VuZCBvYmplY3RzXG4gKi9cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gZGVidWcoJ3N0b3AnKTtcblxuICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uIChvYnNlcnZlcikge1xuICAgIE9iamVjdC51bm9ic2VydmUob2JzZXJ2ZXIuc3ViamVjdCwgb2JzZXJ2ZXIub25jaGFuZ2UpO1xuICB9KTtcbn1cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAvLyBkZWJ1Zygnc3RvcCcpO1xuXG4gIHJldHVybiB0aGlzLm9ic2VydmVycy5maWx0ZXIoZnVuY3Rpb24gKG9ic2VydmVyKSB7XG4gICAgaWYgKHN1YmplY3QgPT0gb2JzZXJ2ZXIuc3ViamVjdCkge1xuICAgICAgb2JzZXJ2ZXIuX2lzUGF1c2VkID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG59XG5cbk9ic2VydmFibGUucHJvdG90eXBlLmlzUGF1c2VkID0gZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgLy8gZGVidWcoJ3N0b3AnKTtcblxuICB2YXIgcGF1c2VkID0gdGhpcy5vYnNlcnZlcnMuZmlsdGVyKGZ1bmN0aW9uIChvYnNlcnZlcikge1xuICAgIGlmIChzdWJqZWN0ID09IG9ic2VydmVyLnN1YmplY3QgJiYgb2JzZXJ2ZXIuX2lzUGF1c2VkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICBpZihwYXVzZWQubGVuZ3RoID4gMCkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcblxufVxuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbiAob2JzZXJ2ZXIpIHtcbiAgLy8gZGVidWcoJ3N0b3AnKTtcbiAgaWYob2JzZXJ2ZXIgIT0gbnVsbCAmJiBvYnNlcnZlci5sZW5ndGggPiAwICYmIG9ic2VydmVyWzBdLnN1YmplY3QgIT0gbnVsbCAmJiBvYnNlcnZlclswXS5vbmNoYW5nZSAhPSBudWxsKVxuICB7XG4gICAgIG9ic2VydmVyWzBdLl9pc1BhdXNlZCA9IGZhbHNlO1xuICB9XG4gIC8vIHRoaXMub2JzZXJ2ZXJzLmZpbHRlcihmdW5jdGlvbiAob2JzZXJ2ZXIpIHtcbiAgLy8gICBpZiAoc3ViamVjdCA9PSBvYnNlcnZlci5zdWJqZWN0KSB7XG4gIC8vICAgICBPYmplY3Qub2JzZXJ2ZShvYnNlcnZlci5zdWJqZWN0LCBvYnNlcnZlci5vbmNoYW5nZSk7XG4gIC8vICAgICByZXR1cm4gdHJ1ZTtcbiAgLy8gICB9XG4gIC8vICAgcmV0dXJuIGZhbHNlO1xuICAvLyB9KTtcbn1cbi8qKlxuICogU3RvcCBsaXN0ZW5pbmcgdG8gY2hhbmdlcyBvbiBgc3ViamVjdGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc3ViamVjdFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUuX3JlbW92ZSA9IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gIC8vIGRlYnVnKCdfcmVtb3ZlJywgc3ViamVjdCk7XG5cbiAgdGhpcy5vYnNlcnZlcnMgPSB0aGlzLm9ic2VydmVycy5maWx0ZXIoZnVuY3Rpb24gKG9ic2VydmVyKSB7XG4gICAgaWYgKHN1YmplY3QgPT09IG9ic2VydmVyLnN1YmplY3QpIHtcbiAgICAgIE9iamVjdC51bm9ic2VydmUob2JzZXJ2ZXIuc3ViamVjdCwgb2JzZXJ2ZXIub25jaGFuZ2UpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbn1cblxuLyohXG4gKiBDcmVhdGVzIGFuIE9iamVjdC5vYnNlcnZlIGBvbmNoYW5nZWAgbGlzdGVuZXJcbiAqL1xuXG5mdW5jdGlvbiBvbmNoYW5nZSAocGFyZW50LCBwcmVmaXgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChhcnkpIHtcbiAgICAvLyBkZWJ1Zygnb25jaGFuZ2UnLCBwcmVmaXgpO1xuXG4gICAgYXJ5LmZvckVhY2goZnVuY3Rpb24gKGNoYW5nZSkge1xuICAgICAgdmFyIG9iamVjdCA9IGNoYW5nZS5vYmplY3Q7XG4gICAgICB2YXIgdHlwZSA9IGNoYW5nZS50eXBlO1xuICAgICAgdmFyIG5hbWUgPSBjaGFuZ2UubmFtZTtcbiAgICAgIHZhciB2YWx1ZSA9IG9iamVjdFtuYW1lXTtcblxuICAgICAgdmFyIHBhdGggPSBwcmVmaXhcbiAgICAgICAgPyBwcmVmaXggKyAnXl4nICsgbmFtZVxuICAgICAgICA6IG5hbWVcbiAgICAgIFxuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCggY2hhbmdlLm9iamVjdCApID09PSAnW29iamVjdCBBcnJheV0nICYmIG51bGwgIT0gdmFsdWUgJiYgJ29iamVjdCcgPT0gdHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIG5ldyBPYnNlcnZhYmxlKHZhbHVlLCBwYXJlbnQsIHBhdGgpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoJ2FkZCcgPT0gdHlwZSAmJiBudWxsICE9IHZhbHVlICYmICdvYmplY3QnID09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICBuZXcgT2JzZXJ2YWJsZSh2YWx1ZSwgcGFyZW50LCBwYXRoKTtcbiAgICAgIH0gZWxzZSBpZiAoJ2RlbGV0ZScgPT0gdHlwZSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgY2hhbmdlLm9sZFZhbHVlKSB7XG4gICAgICAgIHBhcmVudC5fcmVtb3ZlKGNoYW5nZS5vbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgICBpZighcGFyZW50LmlzUGF1c2VkKGNoYW5nZS5vYmplY3QpKSB7XG4gICAgICAgIGNoYW5nZSA9IG5ldyBDaGFuZ2UocGF0aCwgY2hhbmdlKTtcbiAgICAgICAgcGFyZW50LmVtaXQodHlwZSwgY2hhbmdlKTtcbiAgICAgICAgcGFyZW50LmVtaXQodHlwZSArICcgJyArIHBhdGgsIGNoYW5nZSk7XG4gICAgICAgIHBhcmVudC5lbWl0KCdjaGFuZ2UnLCBjaGFuZ2UpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiY2xhc3MgTm90aWZpY2F0aW9uXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gIHNob3c6ICh0aXRsZSwgbWVzc2FnZSkgLT5cbiAgICB1bmlxdWVJZCA9IChsZW5ndGg9OCkgLT5cbiAgICAgIGlkID0gXCJcIlxuICAgICAgaWQgKz0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpIHdoaWxlIGlkLmxlbmd0aCA8IGxlbmd0aFxuICAgICAgaWQuc3Vic3RyIDAsIGxlbmd0aFxuXG4gICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlIHVuaXF1ZUlkKCksXG4gICAgICB0eXBlOidiYXNpYydcbiAgICAgIHRpdGxlOnRpdGxlXG4gICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICBpY29uVXJsOidpbWFnZXMvaWNvbi0zOC5wbmcnLFxuICAgICAgKGNhbGxiYWNrKSAtPlxuICAgICAgICB1bmRlZmluZWRcblxubW9kdWxlLmV4cG9ydHMgPSBOb3RpZmljYXRpb24iLCJjbGFzcyBSZWRpcmVjdFxuICBkYXRhOnt9XG4gIFxuICBwcmVmaXg6bnVsbFxuICBjdXJyZW50TWF0Y2hlczp7fVxuICBjdXJyZW50VGFiSWQ6IG51bGxcbiAgIyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNzc1NVxuICAjIHVybDogUmVnRXhwWyckJiddLFxuICAjIHByb3RvY29sOlJlZ0V4cC4kMixcbiAgIyBob3N0OlJlZ0V4cC4kMyxcbiAgIyBwYXRoOlJlZ0V4cC4kNCxcbiAgIyBmaWxlOlJlZ0V4cC4kNiwgLy8gOFxuICAjIHF1ZXJ5OlJlZ0V4cC4kNyxcbiAgIyBoYXNoOlJlZ0V4cC4kOFxuICAgICAgICAgXG4gIGNvbnN0cnVjdG9yOiAtPlxuICBcbiAgZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdDogKHVybCkgPT5cbiAgICBmaWxlUGF0aFJlZ2V4ID0gL14oKGh0dHBbc10/fGZ0cHxjaHJvbWUtZXh0ZW5zaW9ufGZpbGUpOlxcL1xcLyk/XFwvPyhbXlxcL1xcLl0rXFwuKSo/KFteXFwvXFwuXStcXC5bXjpcXC9cXHNcXC5dezIsM30oXFwuW146XFwvXFxzXFwuXeKAjOKAi3syLDN9KT8pKDpcXGQrKT8oJHxcXC8pKFteIz9cXHNdKyk/KC4qPyk/KCNbXFx3XFwtXSspPyQvXG4gICBcbiAgICBfbWFwcyA9IFtdXG4gICAgaWYgQGRhdGFbQGN1cnJlbnRUYWJJZF0/XG4gICAgICBfbWFwcy5wdXNoIG1hcCBmb3IgbWFwIGluIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHMgd2hlbiBtYXAuaXNPblxuICAgIFxuICAgIHJldHVybiBudWxsIHVubGVzcyBfbWFwcy5sZW5ndGggPiAwXG5cbiAgICByZXNQYXRoID0gdXJsLm1hdGNoKGZpbGVQYXRoUmVnZXgpP1s4XVxuICAgIGlmIG5vdCByZXNQYXRoP1xuICAgICAgIyB0cnkgcmVscGF0aFxuICAgICAgcmVzUGF0aCA9IHVybFxuXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHJlc1BhdGg/XG4gICAgXG4gICAgZm9yIG1hcCBpbiBfbWFwc1xuICAgICAgcmVzUGF0aCA9IHVybC5tYXRjaChuZXcgUmVnRXhwKG1hcC51cmwpKT8gYW5kIG1hcC51cmw/XG5cbiAgICAgIGlmIHJlc1BhdGhcbiAgICAgICAgaWYgcmVmZXJlcj9cbiAgICAgICAgICAjIFRPRE86IHRoaXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXAudXJsKSwgbWFwLnJlZ2V4UmVwbFxuICAgICAgICBicmVha1xuICAgIHJldHVybiBmaWxlUGF0aFxuXG4gIHRhYjogKHRhYklkKSAtPlxuICAgIEBjdXJyZW50VGFiSWQgPSB0YWJJZFxuICAgIEBkYXRhW3RhYklkXSA/PSBpc09uOmZhbHNlXG4gICAgdGhpc1xuXG4gIHdpdGhQcmVmaXg6IChwcmVmaXgpID0+XG4gICAgQHByZWZpeCA9IHByZWZpeFxuICAgIHRoaXNcblxuICAjIHdpdGhEaXJlY3RvcmllczogKGRpcmVjdG9yaWVzKSAtPlxuICAjICAgaWYgZGlyZWN0b3JpZXM/Lmxlbmd0aCBpcyAwXG4gICMgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLmRpcmVjdG9yaWVzID0gW10gXG4gICMgICAgIEBfc3RvcCBAY3VycmVudFRhYklkXG4gICMgICBlbHNlICNpZiBPYmplY3Qua2V5cyhAZGF0YVtAY3VycmVudFRhYklkXSkubGVuZ3RoIGlzIDBcbiAgIyAgICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0uZGlyZWN0b3JpZXMgPSBkaXJlY3Rvcmllc1xuICAjICAgICBAc3RhcnQoKVxuICAjICAgdGhpcyAgICBcblxuICB3aXRoTWFwczogKG1hcHMpIC0+XG4gICAgaWYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobWFwcykubGVuZ3RoIGlzIDBcbiAgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHMgPSBbXVxuICAgICAgQF9zdG9wIEBjdXJyZW50VGFiSWRcbiAgICBlbHNlICNpZiBPYmplY3Qua2V5cyhAZGF0YVtAY3VycmVudFRhYklkXSkubGVuZ3RoIGlzIDBcbiAgICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLm1hcHMgPSBtYXBzXG4gICAgdGhpc1xuXG4gIHN0YXJ0OiAtPlxuICAgIHVubGVzcyBAZGF0YVtAY3VycmVudFRhYklkXS5saXN0ZW5lclxuICAgICAgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVSZXF1ZXN0LnJlbW92ZUxpc3RlbmVyIEBkYXRhW0BjdXJyZW50VGFiSWRdLmxpc3RlbmVyXG5cbiAgICBAZGF0YVtAY3VycmVudFRhYklkXS5saXN0ZW5lciA9IEBjcmVhdGVSZWRpcmVjdExpc3RlbmVyKClcbiAgICAjIEBkYXRhW0BjdXJyZW50VGFiSWRdLmlzT24gPSB0cnVlXG4gICAgQF9zdGFydCBAY3VycmVudFRhYklkXG5cbiAga2lsbEFsbDogKCkgLT5cbiAgICBAX3N0b3AgdGFiSWQgZm9yIHRhYklkIG9mIEBkYXRhXG5cbiAgX3N0b3A6ICh0YWJJZCkgLT5cbiAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QucmVtb3ZlTGlzdGVuZXIgQGRhdGFbdGFiSWRdLmxpc3RlbmVyXG5cbiAgX3N0YXJ0OiAodGFiSWQpIC0+XG4gICAgY2hyb21lLndlYlJlcXVlc3Qub25CZWZvcmVSZXF1ZXN0LmFkZExpc3RlbmVyIEBkYXRhW3RhYklkXS5saXN0ZW5lcixcbiAgICAgIHVybHM6Wyc8YWxsX3VybHM+J11cbiAgICAgIHRhYklkOkBjdXJyZW50VGFiSWQsXG4gICAgICBbJ2Jsb2NraW5nJ11cblxuICBnZXRDdXJyZW50VGFiOiAoY2IpIC0+XG4gICAgIyB0cmllZCB0byBrZWVwIG9ubHkgYWN0aXZlVGFiIHBlcm1pc3Npb24sIGJ1dCBvaCB3ZWxsLi5cbiAgICBjaHJvbWUudGFicy5xdWVyeVxuICAgICAgYWN0aXZlOnRydWVcbiAgICAgIGN1cnJlbnRXaW5kb3c6dHJ1ZVxuICAgICwodGFicykgPT5cbiAgICAgIEBjdXJyZW50VGFiSWQgPSB0YWJzWzBdLmlkXG4gICAgICBjYj8gQGN1cnJlbnRUYWJJZFxuXG4gIHRvZ2dsZTogKCkgLT5cbiAgICBpc09uID0gZmFsc2VcbiAgICBpZiBAZGF0YVtAY3VycmVudFRhYklkXT8ubWFwcz9cbiAgICAgIGZvciBtIGluIEBkYXRhW0BjdXJyZW50VGFiSWRdPy5tYXBzXG4gICAgICAgIGlmIG0uaXNPblxuICAgICAgICAgIGlzT24gPSB0cnVlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlzT24gPSBmYWxzZVxuICAgICAgIyBAZGF0YVtAY3VycmVudFRhYklkXS5pc09uID0gIUBkYXRhW0BjdXJyZW50VGFiSWRdLmlzT25cbiAgICAgIFxuICAgICAgaWYgaXNPblxuICAgICAgICBAc3RhcnQoKVxuICAgICAgZWxzZVxuICAgICAgICBAX3N0b3AoQGN1cnJlbnRUYWJJZClcblxuICAgICAgcmV0dXJuIGlzT25cblxuICBjcmVhdGVSZWRpcmVjdExpc3RlbmVyOiAoKSAtPlxuICAgIChkZXRhaWxzKSA9PlxuICAgICAgcGF0aCA9IEBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0IGRldGFpbHMudXJsXG4gICAgICBpZiBwYXRoPyBhbmQgcGF0aC5pbmRleE9mIEBwcmVmaXggaXMgLTFcbiAgICAgICAgcmV0dXJuIHJlZGlyZWN0VXJsOkBwcmVmaXggKyBwYXRoXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiB7fSBcblxuICB0b0RpY3Q6IChvYmosa2V5KSAtPlxuICAgIG9iai5yZWR1Y2UgKChkaWN0LCBfb2JqKSAtPiBkaWN0WyBfb2JqW2tleV0gXSA9IF9vYmogaWYgX29ialtrZXldPzsgcmV0dXJuIGRpY3QpLCB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZGlyZWN0XG4iLCIjVE9ETzogcmV3cml0ZSB0aGlzIGNsYXNzIHVzaW5nIHRoZSBuZXcgY2hyb21lLnNvY2tldHMuKiBhcGkgd2hlbiB5b3UgY2FuIG1hbmFnZSB0byBtYWtlIGl0IHdvcmtcbmNsYXNzIFNlcnZlclxuICBzb2NrZXQ6IGNocm9tZS5zb2NrZXRcbiAgIyB0Y3A6IGNocm9tZS5zb2NrZXRzLnRjcFxuICBzb2NrZXRQcm9wZXJ0aWVzOlxuICAgICAgcGVyc2lzdGVudDp0cnVlXG4gICAgICBuYW1lOidTTFJlZGlyZWN0b3InXG4gICMgc29ja2V0SW5mbzpudWxsXG4gIGdldExvY2FsRmlsZTpudWxsXG4gIHNvY2tldElkczpbXVxuICBzdGF0dXM6XG4gICAgaG9zdDpudWxsXG4gICAgcG9ydDpudWxsXG4gICAgbWF4Q29ubmVjdGlvbnM6NTBcbiAgICBpc09uOmZhbHNlXG4gICAgc29ja2V0SW5mbzpudWxsXG4gICAgdXJsOm51bGxcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBAc3RhdHVzLmhvc3QgPSBcIjEyNy4wLjAuMVwiXG4gICAgQHN0YXR1cy5wb3J0ID0gMTAwMTJcbiAgICBAc3RhdHVzLm1heENvbm5lY3Rpb25zID0gNTBcbiAgICBAc3RhdHVzLnVybCA9ICdodHRwOi8vJyArIEBzdGF0dXMuaG9zdCArICc6JyArIEBzdGF0dXMucG9ydCArICcvJ1xuICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG5cblxuICBzdGFydDogKGhvc3QscG9ydCxtYXhDb25uZWN0aW9ucywgY2IpIC0+XG4gICAgaWYgaG9zdD8gdGhlbiBAc3RhdHVzLmhvc3QgPSBob3N0XG4gICAgaWYgcG9ydD8gdGhlbiBAc3RhdHVzLnBvcnQgPSBwb3J0XG4gICAgaWYgbWF4Q29ubmVjdGlvbnM/IHRoZW4gQHN0YXR1cy5tYXhDb25uZWN0aW9ucyA9IG1heENvbm5lY3Rpb25zXG5cbiAgICBAa2lsbEFsbCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgcmV0dXJuIGNiPyBlcnIgaWYgZXJyP1xuXG4gICAgICBAc3RhdHVzLmlzT24gPSBmYWxzZVxuICAgICAgQHNvY2tldC5jcmVhdGUgJ3RjcCcsIHt9LCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgQHN0YXR1cy5zb2NrZXRJbmZvID0gc29ja2V0SW5mb1xuICAgICAgICBAc29ja2V0SWRzID0gW11cbiAgICAgICAgQHNvY2tldElkcy5wdXNoIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCAnc29ja2V0SWRzJzpAc29ja2V0SWRzXG4gICAgICAgIEBzb2NrZXQubGlzdGVuIEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQHN0YXR1cy5ob3N0LCBAc3RhdHVzLnBvcnQsIChyZXN1bHQpID0+XG4gICAgICAgICAgaWYgcmVzdWx0ID4gLTFcbiAgICAgICAgICAgIHNob3cgJ2xpc3RlbmluZyAnICsgQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgICAgICBAc3RhdHVzLmlzT24gPSB0cnVlXG4gICAgICAgICAgICBAc29ja2V0LmFjY2VwdCBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWQsIEBfb25BY2NlcHRcbiAgICAgICAgICAgIGNiPyBudWxsLCBAc3RhdHVzXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2I/IHJlc3VsdFxuXG5cbiAga2lsbEFsbDogKGNiKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0ICdzb2NrZXRJZHMnLCAocmVzdWx0KSA9PlxuICAgICAgQHNvY2tldElkcyA9IHJlc3VsdC5zb2NrZXRJZHNcbiAgICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG4gICAgICByZXR1cm4gY2I/IG51bGwsICdzdWNjZXNzJyB1bmxlc3MgQHNvY2tldElkcz9cbiAgICAgIGNudCA9IDBcbiAgICAgIGZvciBzIGluIEBzb2NrZXRJZHNcbiAgICAgICAgZG8gKHMpID0+XG4gICAgICAgICAgY250KytcbiAgICAgICAgICBAc29ja2V0LmdldEluZm8gcywgKHNvY2tldEluZm8pID0+XG4gICAgICAgICAgICBjbnQtLVxuICAgICAgICAgICAgaWYgbm90IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcj9cbiAgICAgICAgICAgICAgQHNvY2tldC5kaXNjb25uZWN0IHMgaWYgQHN0YXR1cy5zb2NrZXRJbmZvPy5jb25uZWN0ZWQgb3Igbm90IEBzdGF0dXMuc29ja2V0SW5mbz9cbiAgICAgICAgICAgICAgQHNvY2tldC5kZXN0cm95IHNcblxuICAgICAgICAgICAgY2I/IG51bGwsICdzdWNjZXNzJyBpZiBjbnQgaXMgMFxuXG4gIHN0b3A6IChjYikgLT5cbiAgICBAa2lsbEFsbCAoZXJyLCBzdWNjZXNzKSA9PlxuICAgICAgaWYgZXJyPyBcbiAgICAgICAgY2I/IGVyclxuICAgICAgZWxzZVxuICAgICAgICBjYj8gbnVsbCxzdWNjZXNzXG5cblxuICBfb25SZWNlaXZlOiAocmVjZWl2ZUluZm8pID0+XG4gICAgc2hvdyhcIkNsaWVudCBzb2NrZXQgJ3JlY2VpdmUnIGV2ZW50OiBzZD1cIiArIHJlY2VpdmVJbmZvLnNvY2tldElkXG4gICAgKyBcIiwgYnl0ZXM9XCIgKyByZWNlaXZlSW5mby5kYXRhLmJ5dGVMZW5ndGgpXG5cbiAgX29uTGlzdGVuOiAoc2VydmVyU29ja2V0SWQsIHJlc3VsdENvZGUpID0+XG4gICAgcmV0dXJuIHNob3cgJ0Vycm9yIExpc3RlbmluZzogJyArIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIGlmIHJlc3VsdENvZGUgPCAwXG4gICAgQHNlcnZlclNvY2tldElkID0gc2VydmVyU29ja2V0SWRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0LmFkZExpc3RlbmVyIEBfb25BY2NlcHRcbiAgICBAdGNwU2VydmVyLm9uQWNjZXB0RXJyb3IuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdEVycm9yXG4gICAgQHRjcC5vblJlY2VpdmUuYWRkTGlzdGVuZXIgQF9vblJlY2VpdmVcbiAgICAjIHNob3cgXCJbXCIrc29ja2V0SW5mby5wZWVyQWRkcmVzcytcIjpcIitzb2NrZXRJbmZvLnBlZXJQb3J0K1wiXSBDb25uZWN0aW9uIGFjY2VwdGVkIVwiO1xuICAgICMgaW5mbyA9IEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SW5mby5zb2NrZXRJZFxuICAgICMgQGdldEZpbGUgdXJpLCAoZmlsZSkgLT5cbiAgX29uQWNjZXB0RXJyb3I6IChlcnJvcikgLT5cbiAgICBzaG93IGVycm9yXG5cbiAgX29uQWNjZXB0OiAoc29ja2V0SW5mbykgPT5cbiAgICAjIHJldHVybiBudWxsIGlmIGluZm8uc29ja2V0SWQgaXNudCBAc2VydmVyU29ja2V0SWRcbiAgICBzaG93KFwiU2VydmVyIHNvY2tldCAnYWNjZXB0JyBldmVudDogc2Q9XCIgKyBzb2NrZXRJbmZvLnNvY2tldElkKVxuICAgIGlmIHNvY2tldEluZm8/LnNvY2tldElkP1xuICAgICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkLCAoZXJyLCBpbmZvKSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgZXJyPyB0aGVuIHJldHVybiBAX3dyaXRlRXJyb3Igc29ja2V0SW5mby5zb2NrZXRJZCwgNDA0LCBpbmZvLmtlZXBBbGl2ZVxuXG4gICAgICAgIEBnZXRMb2NhbEZpbGUgaW5mbywgKGVyciwgZmlsZUVudHJ5LCBmaWxlUmVhZGVyKSA9PlxuICAgICAgICAgIGlmIGVycj8gdGhlbiBAX3dyaXRlRXJyb3Igc29ja2V0SW5mby5zb2NrZXRJZCwgNDA0LCBpbmZvLmtlZXBBbGl2ZVxuICAgICAgICAgIGVsc2UgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldEluZm8uc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZVJlYWRlciwgaW5mby5rZWVwQWxpdmVcbiAgICBlbHNlXG4gICAgICBzaG93IFwiTm8gc29ja2V0PyFcIlxuICAgICMgQHNvY2tldC5hY2NlcHQgc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG5cblxuICBzdHJpbmdUb1VpbnQ4QXJyYXk6IChzdHJpbmcpIC0+XG4gICAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHN0cmluZy5sZW5ndGgpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICBpID0gMFxuXG4gICAgd2hpbGUgaSA8IHN0cmluZy5sZW5ndGhcbiAgICAgIHZpZXdbaV0gPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuICAgICAgaSsrXG4gICAgdmlld1xuXG4gIGFycmF5QnVmZmVyVG9TdHJpbmc6IChidWZmZXIpIC0+XG4gICAgc3RyID0gXCJcIlxuICAgIHVBcnJheVZhbCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICBzID0gMFxuXG4gICAgd2hpbGUgcyA8IHVBcnJheVZhbC5sZW5ndGhcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVBcnJheVZhbFtzXSlcbiAgICAgIHMrK1xuICAgIHN0clxuXG4gIF93cml0ZTIwMFJlc3BvbnNlOiAoc29ja2V0SWQsIGZpbGVFbnRyeSwgZmlsZSwga2VlcEFsaXZlKSAtPlxuICAgIGNvbnRlbnRUeXBlID0gKGlmIChmaWxlLnR5cGUgaXMgXCJcIikgdGhlbiBcInRleHQvcGxhaW5cIiBlbHNlIGZpbGUudHlwZSlcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIDIwMCBPS1xcbkNvbnRlbnQtbGVuZ3RoOiBcIiArIGZpbGUuc2l6ZSArIFwiXFxuQ29udGVudC10eXBlOlwiICsgY29udGVudFR5cGUgKyAoKGlmIGtlZXBBbGl2ZSB0aGVuIFwiXFxuQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVwiIGVsc2UgXCJcIikpICsgXCJcXG5cXG5cIilcbiAgICBvdXRwdXRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaGVhZGVyLmJ5dGVMZW5ndGggKyBmaWxlLnNpemUpXG4gICAgdmlldyA9IG5ldyBVaW50OEFycmF5KG91dHB1dEJ1ZmZlcilcbiAgICB2aWV3LnNldCBoZWFkZXIsIDBcblxuICAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyXG4gICAgcmVhZGVyLm9ubG9hZCA9IChldikgPT5cbiAgICAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGV2LnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aFxuICAgICAgQHNvY2tldC53cml0ZSBzb2NrZXRJZCwgb3V0cHV0QnVmZmVyLCAod3JpdGVJbmZvKSA9PlxuICAgICAgICBzaG93IHdyaXRlSW5mb1xuICAgICAgICAjIEBfcmVhZEZyb21Tb2NrZXQgc29ja2V0SWRcbiAgICAgICAgQGVuZCBzb2NrZXRJZCwga2VlcEFsaXZlXG4gICAgcmVhZGVyLm9uZXJyb3IgPSAoZXJyb3IpID0+XG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIgZmlsZVxuXG5cbiAgICAjIEBlbmQgc29ja2V0SWRcbiAgICAjIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgIyBmaWxlUmVhZGVyLm9ubG9hZCA9IChlKSA9PlxuICAgICMgICB2aWV3LnNldCBuZXcgVWludDhBcnJheShlLnRhcmdldC5yZXN1bHQpLCBoZWFkZXIuYnl0ZUxlbmd0aFxuICAgICMgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgIyAgICAgc2hvdyBcIldSSVRFXCIsIHdyaXRlSW5mb1xuICAgICMgICAgICAgQF93cml0ZTIwMFJlc3BvbnNlIHNvY2tldElkXG5cblxuICBfcmVhZEZyb21Tb2NrZXQ6IChzb2NrZXRJZCwgY2IpIC0+XG4gICAgQHNvY2tldC5yZWFkIHNvY2tldElkLCAocmVhZEluZm8pID0+XG4gICAgICBzaG93IFwiUkVBRFwiLCByZWFkSW5mb1xuXG4gICAgICAjIFBhcnNlIHRoZSByZXF1ZXN0LlxuICAgICAgZGF0YSA9IEBhcnJheUJ1ZmZlclRvU3RyaW5nKHJlYWRJbmZvLmRhdGEpXG4gICAgICBzaG93IGRhdGFcblxuICAgICAga2VlcEFsaXZlID0gZmFsc2VcbiAgICAgIGtlZXBBbGl2ZSA9IHRydWUgaWYgZGF0YS5pbmRleE9mICdDb25uZWN0aW9uOiBrZWVwLWFsaXZlJyBpc250IC0xXG5cbiAgICAgIGlmIGRhdGEuaW5kZXhPZihcIkdFVCBcIikgaXNudCAwXG4gICAgICAgIHJldHVybiBjYj8gJzQwNCcsIGtlZXBBbGl2ZTprZWVwQWxpdmVcblxuXG5cbiAgICAgIHVyaUVuZCA9IGRhdGEuaW5kZXhPZihcIiBcIiwgNClcblxuICAgICAgcmV0dXJuIGVuZCBzb2NrZXRJZCBpZiB1cmlFbmQgPCAwXG5cbiAgICAgIHVyaSA9IGRhdGEuc3Vic3RyaW5nKDQsIHVyaUVuZClcbiAgICAgIGlmIG5vdCB1cmk/XG4gICAgICAgIHJldHVybiBjYj8gJzQwNCcsIGtlZXBBbGl2ZTprZWVwQWxpdmVcblxuICAgICAgaW5mbyA9XG4gICAgICAgIHVyaTogdXJpXG4gICAgICAgIGtlZXBBbGl2ZTprZWVwQWxpdmVcbiAgICAgIGluZm8ucmVmZXJlciA9IGRhdGEubWF0Y2goL1JlZmVyZXI6XFxzKC4qKS8pP1sxXVxuICAgICAgI3N1Y2Nlc3NcbiAgICAgIGNiPyBudWxsLCBpbmZvXG5cbiAgZW5kOiAoc29ja2V0SWQsIGtlZXBBbGl2ZSkgLT5cbiAgICAgICMgaWYga2VlcEFsaXZlXG4gICAgICAjICAgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgIyBlbHNlXG4gICAgQHNvY2tldC5kaXNjb25uZWN0IHNvY2tldElkXG4gICAgQHNvY2tldC5kZXN0cm95IHNvY2tldElkXG4gICAgc2hvdyAnZW5kaW5nICcgKyBzb2NrZXRJZFxuICAgIEBzb2NrZXQuYWNjZXB0IEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuXG4gIF93cml0ZUVycm9yOiAoc29ja2V0SWQsIGVycm9yQ29kZSwga2VlcEFsaXZlKSAtPlxuICAgIGZpbGUgPSBzaXplOiAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogYmVnaW4uLi4gXCJcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBmaWxlID0gXCIgKyBmaWxlXG4gICAgY29udGVudFR5cGUgPSBcInRleHQvcGxhaW5cIiAjKGZpbGUudHlwZSA9PT0gXCJcIikgPyBcInRleHQvcGxhaW5cIiA6IGZpbGUudHlwZTtcbiAgICBjb250ZW50TGVuZ3RoID0gZmlsZS5zaXplXG4gICAgaGVhZGVyID0gQHN0cmluZ1RvVWludDhBcnJheShcIkhUVFAvMS4wIFwiICsgZXJyb3JDb2RlICsgXCIgTm90IEZvdW5kXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyBoZWFkZXIuLi5cIlxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IERvbmUgc2V0dGluZyB2aWV3Li4uXCJcbiAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcblxubW9kdWxlLmV4cG9ydHMgPSBTZXJ2ZXJcbiIsIkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcbiMgd2luZG93Lk9ic2VydmFibGUgPSByZXF1aXJlICcuL29ic2VydmUuY29mZmVlJ1xucmVxdWlyZSAnT2JqZWN0LW9ic2VydmUtcG9seWZpbGwnXG5PYnNlcnZhYmxlID0gcmVxdWlyZSAnb2JzZXJ2ZWQnXG5cbmNsYXNzIFN0b3JhZ2VcbiAgYXBpOiBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICBMSVNURU46IExJU1RFTi5nZXQoKSBcbiAgTVNHOiBNU0cuZ2V0KClcbiAgZGF0YTogXG4gICAgY3VycmVudFJlc291cmNlczogW11cbiAgICBkaXJlY3RvcmllczpbXVxuICAgIG1hcHM6W11cbiAgICB0YWJNYXBzOnt9XG4gICAgY3VycmVudEZpbGVNYXRjaGVzOnt9XG4gIFxuICBzZXNzaW9uOnt9XG5cbiAgb25EYXRhTG9hZGVkOiAtPlxuXG4gIGNhbGxiYWNrOiAoKSAtPlxuICBub3RpZnlPbkNoYW5nZTogKCkgLT5cbiAgY29uc3RydWN0b3I6IChfb25EYXRhTG9hZGVkKSAtPlxuICAgIEBvbkRhdGFMb2FkZWQgPSBfb25EYXRhTG9hZGVkIGlmIF9vbkRhdGFMb2FkZWQ/XG4gICAgQGFwaS5nZXQgKHJlc3VsdHMpID0+XG4gICAgICBAZGF0YVtrXSA9IHJlc3VsdHNba10gZm9yIGsgb2YgcmVzdWx0c1xuXG4gICAgICB3YXRjaEFuZE5vdGlmeSBALCdkYXRhQ2hhbmdlZCcsIEBkYXRhLCB0cnVlXG5cbiAgICAgIEBvbkRhdGFMb2FkZWQgQGRhdGFcblxuICAgIEBpbml0KClcblxuICBpbml0OiAoKSAtPlxuICAgIHdhdGNoQW5kTm90aWZ5IEAsJ3Nlc3Npb25EYXRhJywgQHNlc3Npb24sIGZhbHNlXG4gICAgIyBAcmV0cmlldmVBbGwoKVxuXG4gIFxuICBpc0FycmF5OiAtPiBcbiAgICBBcnJheS5pc0FycmF5IHx8ICggdmFsdWUgKSAtPiByZXR1cm4ge30udG9TdHJpbmcuY2FsbCggdmFsdWUgKSBpcyAnW29iamVjdCBBcnJheV0nXG5cbiAgd2F0Y2hBbmROb3RpZnkgPSAoX3RoaXMsIG1zZ0tleSwgb2JqLCBzdG9yZSkgLT5cbiAgICAgIF90aGlzLm9ic2VydmVyID0gT2JzZXJ2YWJsZSBvYmpcbiAgICAgIF90aGlzLm9ic2VydmVyLm9uICdjaGFuZ2UnLCAoY2hhbmdlKSAtPlxuICAgICAgICAjIGlmIGNoYW5nZS5uYW1lIGlzICdsZW5ndGgnICAgICAgICAgIFxuICAgICAgICAjICAgcGF0aCA9IGNoYW5nZS5wYXRoLnNwbGl0KCdeXicpXG4gICAgICAgICMgICBzYXZlQXJyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY2hhbmdlLm9iamVjdFtwYXRoWzBdXSkgXG4gICAgICAgICMgICBjaGFuZ2Uub2JqZWN0W3BhdGhbMF1dLmxlbmd0aCA9IDBcbiAgICAgICAgIyAgIHNldFRpbWVvdXQgKCkgLT5cbiAgICAgICAgIyAgICAgY2hhbmdlLm9iamVjdFtwYXRoWzBdXSA9IHNhdmVBcnJcbiAgICAgICAgc2hvdyBjaGFuZ2VcbiAgICAgICAgX3RoaXMuYXBpLnNldCBvYmogaWYgc3RvcmVcbiAgICAgICAgbXNnID0ge31cbiAgICAgICAgbXNnW21zZ0tleV0gPSBjaGFuZ2VcbiAgICAgICAgX3RoaXMuTVNHLkV4dFBvcnQgbXNnXG5cbiAgICAgIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8ICggdmFsdWUgKSAtPiByZXR1cm4ge30udG9TdHJpbmcuY2FsbCggdmFsdWUgKSBpcyAnW29iamVjdCBBcnJheV0nXG5cbiAgICAgIF90aGlzLkxJU1RFTi5FeHQgbXNnS2V5LCAoY2hhbmdlKSAtPlxuICAgICAgICBzaG93IGNoYW5nZVxuICAgICAgICBvYmogPz0ge31cbiAgICAgICAgIyBzaG93ICdkYXRhIGNoYW5nZWQgJ1xuICAgICAgICAjIHNob3cgY2hhbmdlXG4gICAgICAgICMgcmV0dXJuIGlmIF90aGlzLmlzQXJyYXkoY2hhbmdlLm9iamVjdClcblxuICAgICAgICAoKGRhdGEsIGFwaSwgb2JzZXJ2ZXIpIC0+XG4gICAgICAgICAgc3RhY2sgPSBjaGFuZ2UucGF0aC5zcGxpdCAnXl4nXG5cbiAgICAgICAgICByZXR1cm4gZGF0YVtzdGFja1swXV0gPSBjaGFuZ2UudmFsdWUgaWYgbm90IGRhdGFbc3RhY2tbMF1dP1xuXG4gICAgICAgICAgd2hpbGUgc3RhY2subGVuZ3RoID4gMCBcbiAgICAgICAgICAgIF9zaGlmdCA9IHN0YWNrLnNoaWZ0KClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3RhY2subGVuZ3RoID4gMCBhbmQgaXNBcnJheShkYXRhW19zaGlmdF0pIGFuZCBjaGFuZ2UubmFtZSBpcyBzdGFja1swXVxuICAgICAgICAgICAgICBuZXdBcnIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjaGFuZ2Uub2JqZWN0KVxuICAgICAgICAgICAgICAjIE9ic2VydmFibGUgbmV3QXJyXG4gICAgICAgICAgICAgIGRhdGFbX3NoaWZ0XSA9IG5ld0FyclxuICAgICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAgICAgaWYgL15cXGQrJC8udGVzdCBfc2hpZnQgXG4gICAgICAgICAgICAgIF9zaGlmdCA9IHBhcnNlSW50IF9zaGlmdFxuICAgICAgICAgICAgICAjIGVsc2UgaWYgY2hhbmdlLnR5cGUgaXMgJ3VwZGF0ZScgYW5kIGNoYW5nZS5uYW1lIGlzICdsZW5ndGgnXG5cbiAgICAgICAgICAgIGRhdGEgPSBkYXRhW19zaGlmdF0gdW5sZXNzIHN0YWNrLmxlbmd0aCBpcyAwXG5cbiAgICAgICAgICBwYXVzZWQgPSBvYnNlcnZlci5wYXVzZSBkYXRhXG4gICAgICAgICAgZGF0YVtfc2hpZnRdID0gY2hhbmdlLnZhbHVlXG5cbiAgICAgICAgICBzZXRUaW1lb3V0ICgpIC0+XG4gICAgICAgICAgICAgIG9ic2VydmVyLnJlc3VtZSBwYXVzZWRcbiAgICAgICAgICAsMjAgIFxuICAgICAgICApKG9iaiwgX3RoaXMuYXBpLCBfdGhpcy5vYnNlcnZlcikgICAgXG5cbiAgc2F2ZTogKGtleSwgaXRlbSwgY2IpIC0+XG5cbiAgICBvYmogPSB7fVxuICAgIG9ialtrZXldID0gaXRlbVxuICAgIEBkYXRhW2tleV0gPSBpdGVtXG4gICAgQGFwaS5zZXQgb2JqLCAocmVzKSA9PlxuICAgICAgY2I/KClcbiAgICAgIEBjYWxsYmFjaz8oKVxuIFxuICBzYXZlQWxsOiAoZGF0YSwgY2IpIC0+XG5cbiAgICBpZiBkYXRhPyBcbiAgICAgIEBhcGkuc2V0IGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG5cbiAgICAgICAgIyBAY2FsbGJhY2s/KClcbiAgICBlbHNlXG4gICAgICBAYXBpLnNldCBAZGF0YSwgKCkgPT5cbiAgICAgICAgY2I/KClcblxuICAgICAgICAjIEBjYWxsYmFjaz8oKVxuICAgICMgc2hvdyAnc2F2ZUFsbCBAZGF0YTogJyArIEBkYXRhLnNvY2tldElkcz9bMF1cbiAgICAjIHNob3cgJ3NhdmVBbGwgZGF0YTogJyArIGRhdGEuc29ja2V0SWRzP1swXVxuXG4gIHJldHJpZXZlOiAoa2V5LCBjYikgLT5cbiAgICBAb2JzZXJ2ZXIuc3RvcCgpXG4gICAgQGFwaS5nZXQga2V5LCAocmVzdWx0cykgLT5cbiAgICAgIEBkYXRhW3JdID0gcmVzdWx0c1tyXSBmb3IgciBvZiByZXN1bHRzXG4gICAgICBpZiBjYj8gdGhlbiBjYiByZXN1bHRzW2tleV1cblxuICByZXRyaWV2ZUFsbDogKGNiKSAtPlxuICAgICMgQG9ic2VydmVyLnN0b3AoKVxuICAgIEBhcGkuZ2V0IChyZXN1bHQpID0+XG4gICAgICBmb3IgYyBvZiByZXN1bHQgXG4gICAgICAjICAgZGVsZXRlIEBkYXRhW2NdXG4gICAgICAgIEBkYXRhW2NdID0gcmVzdWx0W2NdIFxuICAgICAgIyBAZGF0YSA9IHJlc3VsdFxuICAgICAgICBATVNHLkV4dFBvcnQgJ2RhdGFDaGFuZ2VkJzpcbiAgICAgICAgICBwYXRoOmNcbiAgICAgICAgICB2YWx1ZTpyZXN1bHRbY11cbiAgICAgIEBvYnNlcnZlciA9IE9ic2VydmFibGUgQGRhdGFcbiAgICAgIEBvYnNlcnZlci5vbiAnY2hhbmdlJywgKGNoYW5nZSkgPT5cbiAgICAgICAgaWYgY2hhbmdlLm5hbWUgaXNudCAnbGVuZ3RoJ1xuICAgICAgICAgIHNob3cgY2hhbmdlXG4gICAgICAgICAgQGFwaS5zZXQgQGRhdGFcbiAgICAgICAgICBATVNHLkV4dFBvcnQgJ2RhdGFDaGFuZ2VkJzpjaGFuZ2UgXG5cbiAgICAgIEBhcGkuc2V0IEBkYXRhXG4gICAgICAjIEBjYWxsYmFjaz8gcmVzdWx0XG4gICAgICBjYj8gcmVzdWx0XG4gICAgICBAb25EYXRhTG9hZGVkIEBkYXRhXG5cbiAgICAgICMgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6XG4gICAgICAjIEBvYnNlcnZlciA9IE9ic2VydmFibGUgQGRhdGFcbiAgICAgICMgQG9ic2VydmVyLm9uICdjaGFuZ2UnLCAoY2hhbmdlKSA9PlxuICAgICAgIyAgIHNob3cgJ3RlbGwgY2hhbmdpbmcgZGF0YSdcbiAgICAgICMgICBATVNHLkV4dFBvcnQgJ2RhdGFDaGFuZ2VkJzpjaGFuZ2VcblxuICBvbkRhdGFMb2FkZWQ6IChkYXRhKSAtPlxuXG4gIG9uQ2hhbmdlZDogKGtleSwgY2IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLCBuYW1lc3BhY2UpIC0+XG4gICAgICBpZiBjaGFuZ2VzW2tleV0/IGFuZCBjYj8gdGhlbiBjYiBjaGFuZ2VzW2tleV0ubmV3VmFsdWVcbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlc1xuXG4gIG9uQ2hhbmdlZEFsbDogKCkgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsbmFtZXNwYWNlKSA9PlxuICAgICAgaGFzQ2hhbmdlcyA9IGZhbHNlXG4gICAgICBmb3IgYyBvZiBjaGFuZ2VzIHdoZW4gY2hhbmdlc1tjXS5uZXdWYWx1ZSAhPSBjaGFuZ2VzW2NdLm9sZFZhbHVlIGFuZCBjIGlzbnQnc29ja2V0SWRzJ1xuICAgICAgICAoYykgPT4gXG4gICAgICAgICAgQGRhdGFbY10gPSBjaGFuZ2VzW2NdLm5ld1ZhbHVlIFxuICAgICAgICAgIHNob3cgJ2RhdGEgY2hhbmdlZDogJ1xuICAgICAgICAgIHNob3cgY1xuICAgICAgICAgIHNob3cgQGRhdGFbY11cblxuICAgICAgICAgIGhhc0NoYW5nZXMgPSB0cnVlXG5cbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlcyBpZiBoYXNDaGFuZ2VzXG4gICAgICBzaG93ICdjaGFuZ2VkJyBpZiBoYXNDaGFuZ2VzXG5cbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZVxuIiwiIyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTc0MjA5M1xubW9kdWxlLmV4cG9ydHMgPSAoKCkgLT5cbiAgbWV0aG9kcyA9IFtcbiAgICAnYXNzZXJ0JywgJ2NsZWFyJywgJ2NvdW50JywgJ2RlYnVnJywgJ2RpcicsICdkaXJ4bWwnLCAnZXJyb3InLFxuICAgICdleGNlcHRpb24nLCAnZ3JvdXAnLCAnZ3JvdXBDb2xsYXBzZWQnLCAnZ3JvdXBFbmQnLCAnaW5mbycsICdsb2cnLFxuICAgICdtYXJrVGltZWxpbmUnLCAncHJvZmlsZScsICdwcm9maWxlRW5kJywgJ3RhYmxlJywgJ3RpbWUnLCAndGltZUVuZCcsXG4gICAgJ3RpbWVTdGFtcCcsICd0cmFjZScsICd3YXJuJ11cbiAgbm9vcCA9ICgpIC0+XG4gICAgIyBzdHViIHVuZGVmaW5lZCBtZXRob2RzLlxuICAgIGZvciBtIGluIG1ldGhvZHMgIHdoZW4gICFjb25zb2xlW21dXG4gICAgICBjb25zb2xlW21dID0gbm9vcFxuXG4gIGlmIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kP1xuICAgIHdpbmRvdy5zaG93ID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSlcbiAgZWxzZVxuICAgIHdpbmRvdy5zaG93ID0gKCkgLT5cbiAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpXG4pKClcbiJdfQ==
