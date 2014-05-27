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


},{"./listen.coffee":5,"./msg.coffee":6,"watchjs":7}],12:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvY29tbW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9jb25maWcuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L2V4dGVuc2lvbi9zcmMvYmFja2dyb3VuZC5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL2Rldi9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L25vZGVfbW9kdWxlcy93YXRjaGpzL3NyYy93YXRjaC5qcyIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9ub3RpZmljYXRpb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L3JlZGlyZWN0LmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvZGV2L3Byb3hseS9zZXJ2ZXIuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L3N0b3JhZ2UuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9kZXYvcHJveGx5L3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwyRUFBQTtFQUFBOztpU0FBQTs7QUFBQSxPQUFBLENBQVEsZUFBUixDQUFBLENBQUE7O0FBQUEsTUFDQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQURULENBQUE7O0FBQUEsR0FFQSxHQUFNLE9BQUEsQ0FBUSxjQUFSLENBRk4sQ0FBQTs7QUFBQSxNQUdBLEdBQVMsT0FBQSxDQUFRLGlCQUFSLENBSFQsQ0FBQTs7QUFBQSxPQUlBLEdBQVUsT0FBQSxDQUFRLGtCQUFSLENBSlYsQ0FBQTs7QUFBQSxVQUtBLEdBQWEsT0FBQSxDQUFRLHFCQUFSLENBTGIsQ0FBQTs7QUFBQSxZQU1BLEdBQWUsT0FBQSxDQUFRLHVCQUFSLENBTmYsQ0FBQTs7QUFBQSxNQU9BLEdBQVMsT0FBQSxDQUFRLGlCQUFSLENBUFQsQ0FBQTs7QUFBQTtBQVdFLGdDQUFBLENBQUE7O0FBQUEsd0JBQUEsTUFBQSxHQUFRLElBQVIsQ0FBQTs7QUFBQSx3QkFDQSxHQUFBLEdBQUssSUFETCxDQUFBOztBQUFBLHdCQUVBLE9BQUEsR0FBUyxJQUZULENBQUE7O0FBQUEsd0JBR0EsRUFBQSxHQUFJLElBSEosQ0FBQTs7QUFBQSx3QkFJQSxNQUFBLEdBQVEsSUFKUixDQUFBOztBQUFBLHdCQUtBLE1BQUEsR0FBUSxJQUxSLENBQUE7O0FBQUEsd0JBTUEsUUFBQSxHQUFTLElBTlQsQ0FBQTs7QUFBQSx3QkFPQSxZQUFBLEdBQWEsSUFQYixDQUFBOztBQVNhLEVBQUEscUJBQUMsSUFBRCxHQUFBO0FBQ1gsbURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsUUFBQSxJQUFBO0FBQUEsSUFBQSw4Q0FBQSxTQUFBLENBQUEsQ0FBQTs7TUFFQSxJQUFDLENBQUEsTUFBTyxHQUFHLENBQUMsR0FBSixDQUFBO0tBRlI7O01BR0EsSUFBQyxDQUFBLFNBQVUsTUFBTSxDQUFDLEdBQVAsQ0FBQTtLQUhYO0FBS0EsU0FBQSxZQUFBLEdBQUE7QUFDRSxNQUFBLElBQUcsTUFBQSxDQUFBLElBQVksQ0FBQSxJQUFBLENBQVosS0FBcUIsUUFBeEI7QUFDRSxRQUFBLElBQUUsQ0FBQSxJQUFBLENBQUYsR0FBVSxJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFLLENBQUEsSUFBQSxDQUFyQixDQUFWLENBREY7T0FBQTtBQUVBLE1BQUEsSUFBRyxNQUFBLENBQUEsSUFBWSxDQUFBLElBQUEsQ0FBWixLQUFxQixVQUF4QjtBQUNFLFFBQUEsSUFBRSxDQUFBLElBQUEsQ0FBRixHQUFVLElBQUMsQ0FBQSxlQUFELENBQWlCLEdBQUEsQ0FBQSxJQUFTLENBQUEsSUFBQSxDQUExQixDQUFWLENBREY7T0FIRjtBQUFBLEtBTEE7QUFBQSxJQVdBLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxHQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxJQUFELEdBQUE7QUFNdEIsUUFBQSxJQUFPLG9DQUFQO0FBQ0UsVUFBQSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFkLEdBQTBCLEtBQTFCLENBQUE7aUJBQ0EsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQW5CLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBSyxZQUFMO0FBQUEsWUFDQSxHQUFBLEVBQUkscURBREo7QUFBQSxZQUVBLFNBQUEsRUFBVSxFQUZWO0FBQUEsWUFHQSxVQUFBLEVBQVcsSUFIWDtBQUFBLFlBSUEsSUFBQSxFQUFLLEtBSkw7V0FERixFQUZGO1NBTnNCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FYeEIsQ0FBQTs7TUE2QkEsSUFBQyxDQUFBLFNBQVUsQ0FBQyxHQUFBLENBQUEsWUFBRCxDQUFrQixDQUFDO0tBN0I5QjtBQUFBLElBaUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQWpDakIsQ0FBQTtBQUFBLElBbUNBLElBQUMsQ0FBQSxJQUFELEdBQVcsSUFBQyxDQUFBLFNBQUQsS0FBYyxLQUFqQixHQUE0QixJQUFDLENBQUEsV0FBN0IsR0FBOEMsSUFBQyxDQUFBLFlBbkN2RCxDQUFBO0FBQUEsSUFxQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU4sRUFBUyxxQkFBVCxFQUFnQyxJQUFDLENBQUEsT0FBakMsQ0FyQ1gsQ0FBQTtBQUFBLElBc0NBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVMsdUJBQVQsRUFBa0MsSUFBQyxDQUFBLFNBQW5DLENBdENiLENBQUE7QUFBQSxJQXVDQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixFQUFTLHlCQUFULEVBQW9DLElBQUMsQ0FBQSxXQUFyQyxDQXZDZixDQUFBO0FBQUEsSUF3Q0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVMsMkJBQVQsRUFBc0MsSUFBQyxDQUFBLGFBQXZDLENBeENqQixDQUFBO0FBQUEsSUF5Q0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU4sRUFBUyx3QkFBVCxFQUFtQyxJQUFDLENBQUEsVUFBcEMsQ0F6Q2QsQ0FBQTtBQUFBLElBMENBLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixFQUFTLDBCQUFULEVBQXFDLElBQUMsQ0FBQSxZQUF0QyxDQTFDaEIsQ0FBQTtBQUFBLElBNENBLElBQUMsQ0FBQSxJQUFELEdBQVcsSUFBQyxDQUFBLFNBQUQsS0FBYyxXQUFqQixHQUFrQyxJQUFDLENBQUEsV0FBbkMsR0FBb0QsSUFBQyxDQUFBLFlBNUM3RCxDQUFBO0FBQUEsSUE4Q0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVMsMEJBQVQsRUFBcUMsSUFBQyxDQUFBLFlBQXRDLENBOUNoQixDQUFBO0FBQUEsSUErQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFOLEVBQVMsMkJBQVQsRUFBc0MsSUFBQyxDQUFBLGFBQXZDLENBL0NqQixDQUFBO0FBQUEsSUFpREEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFmLENBQStCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLElBQUQsR0FBQTtlQUM3QixLQUFDLENBQUEsUUFBRCxHQUFZLEtBRGlCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0IsQ0FqREEsQ0FBQTtBQUFBLElBb0RBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FwREEsQ0FEVztFQUFBLENBVGI7O0FBQUEsd0JBZ0VBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDRixJQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQWpCLEdBQTBCLEVBQTFCLENBQUE7V0FDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBeEIsR0FBaUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUZ2QztFQUFBLENBaEVOLENBQUE7O0FBQUEsd0JBc0VBLGFBQUEsR0FBZSxTQUFDLEVBQUQsR0FBQTtXQUViLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBWixDQUNFO0FBQUEsTUFBQSxNQUFBLEVBQU8sSUFBUDtBQUFBLE1BQ0EsYUFBQSxFQUFjLElBRGQ7S0FERixFQUdDLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLElBQUQsR0FBQTtBQUNDLFFBQUEsS0FBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBQXhCLENBQUE7MENBQ0EsR0FBSSxLQUFDLENBQUEsdUJBRk47TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhELEVBRmE7RUFBQSxDQXRFZixDQUFBOztBQUFBLHdCQStFQSxTQUFBLEdBQVcsU0FBQyxFQUFELEVBQUssS0FBTCxHQUFBO1dBQ1AsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFsQixDQUE0QixJQUFDLENBQUEsTUFBN0IsRUFBcUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsT0FBRCxHQUFBO0FBQ25DLFFBQUEsSUFBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQWxCO2lCQUNFLEtBQUEsQ0FBTSxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQXJCLEVBREY7U0FBQSxNQUFBOzRDQUdFLEdBQUksa0JBSE47U0FEbUM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQyxFQURPO0VBQUEsQ0EvRVgsQ0FBQTs7QUFBQSx3QkFzRkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtXQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQWxCLENBQXlCLFlBQXpCLEVBQ0U7QUFBQSxNQUFBLEVBQUEsRUFBSSxTQUFKO0FBQUEsTUFDQSxNQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTSxHQUFOO0FBQUEsUUFDQSxNQUFBLEVBQU8sR0FEUDtPQUZGO0tBREYsRUFLQSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxHQUFELEdBQUE7ZUFDRSxLQUFDLENBQUEsU0FBRCxHQUFhLElBRGY7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxBLEVBREs7RUFBQSxDQXRGVCxDQUFBOztBQUFBLHdCQStGQSxhQUFBLEdBQWUsU0FBQyxFQUFELEdBQUE7V0FFYixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQVosQ0FDRTtBQUFBLE1BQUEsTUFBQSxFQUFPLElBQVA7QUFBQSxNQUNBLGFBQUEsRUFBYyxJQURkO0tBREYsRUFHQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxJQUFELEdBQUE7QUFDQyxRQUFBLEtBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxFQUF4QixDQUFBOzBDQUNBLEdBQUksS0FBQyxDQUFBLHVCQUZOO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIRCxFQUZhO0VBQUEsQ0EvRmYsQ0FBQTs7QUFBQSx3QkF3R0EsWUFBQSxHQUFjLFNBQUMsRUFBRCxHQUFBO1dBQ1osSUFBQyxDQUFBLGFBQUQsQ0FBZSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxLQUFELEdBQUE7ZUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQVosQ0FBMEIsS0FBMUIsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFLLG9CQUFMO1NBREYsRUFDNkIsU0FBQyxPQUFELEdBQUE7QUFDekIsY0FBQSwyQkFBQTtBQUFBLFVBQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUF2QixHQUFnQyxDQUFoQyxDQUFBO0FBQ0EsZUFBQSw4Q0FBQTs0QkFBQTtBQUNFLGlCQUFBLDBDQUFBOzBCQUFBO0FBQ0UsY0FBQSxLQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQXZCLENBQTRCLEdBQTVCLENBQUEsQ0FERjtBQUFBLGFBREY7QUFBQSxXQURBOzRDQUlBLEdBQUksTUFBTSxLQUFDLENBQUEsSUFBSSxDQUFDLDJCQUxTO1FBQUEsQ0FEN0IsRUFEYTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWYsRUFEWTtFQUFBLENBeEdkLENBQUE7O0FBQUEsd0JBbUhBLFlBQUEsR0FBYyxTQUFDLElBQUQsRUFBTyxFQUFQLEdBQUE7QUFDWixRQUFBLG9DQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLEdBQWhCLENBQUE7QUFFQSxJQUFBLElBQWtDLGdCQUFsQztBQUFBLGFBQU8sRUFBQSxDQUFHLGdCQUFILENBQVAsQ0FBQTtLQUZBO0FBQUEsSUFHQSxLQUFBLEdBQVEsRUFIUixDQUFBO0FBSUE7QUFBQSxTQUFBLDJDQUFBO3FCQUFBO1VBQWlELEdBQUcsQ0FBQztBQUFyRCxRQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxDQUFBO09BQUE7QUFBQSxLQUpBO0FBS0EsSUFBQSxJQUFtQyxRQUFRLENBQUMsU0FBVCxDQUFtQixDQUFuQixFQUFxQixDQUFyQixDQUFBLEtBQTJCLEdBQTlEO0FBQUEsTUFBQSxRQUFBLEdBQVcsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsQ0FBbkIsQ0FBWCxDQUFBO0tBTEE7V0FNQSxJQUFDLENBQUEsZUFBRCxDQUFpQixLQUFqQixFQUF3QixRQUF4QixFQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxHQUFELEVBQU0sU0FBTixFQUFpQixHQUFqQixHQUFBO0FBQ2hDLFFBQUEsSUFBRyxXQUFIO0FBQWEsNENBQU8sR0FBSSxhQUFYLENBQWI7U0FBQTtlQUNBLFNBQVMsQ0FBQyxJQUFWLENBQWUsU0FBQyxJQUFELEdBQUE7NENBQ2IsR0FBSSxNQUFLLFdBQVUsZUFETjtRQUFBLENBQWYsRUFFQyxTQUFDLEdBQUQsR0FBQTs0Q0FBUyxHQUFJLGNBQWI7UUFBQSxDQUZELEVBRmdDO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsRUFQWTtFQUFBLENBbkhkLENBQUE7O0FBQUEsd0JBaUlBLFdBQUEsR0FBYSxTQUFDLEVBQUQsR0FBQTtBQUNYLElBQUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFmLEtBQXVCLEtBQTFCO2FBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsSUFBZCxFQUFtQixJQUFuQixFQUF3QixJQUF4QixFQUE4QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxHQUFELEVBQU0sVUFBTixHQUFBO0FBQzFCLFVBQUEsSUFBRyxXQUFIO0FBQ0UsWUFBQSxLQUFDLENBQUEsTUFBRCxDQUFRLGNBQVIsRUFBd0IseUJBQUEsR0FBbkMsS0FBVyxDQUFBLENBQUE7OENBQ0EsR0FBSSxjQUZOO1dBQUEsTUFBQTtBQUlFLFlBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBUSxnQkFBUixFQUEyQixpQkFBQSxHQUF0QyxLQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFKLENBQUEsQ0FBQTs4Q0FDQSxHQUFJLE1BQU0sS0FBQyxDQUFBLE1BQU0sQ0FBQyxpQkFMcEI7V0FEMEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixFQURGO0tBQUEsTUFBQTt3Q0FTRSxHQUFJLDRCQVROO0tBRFc7RUFBQSxDQWpJYixDQUFBOztBQUFBLHdCQTZJQSxVQUFBLEdBQVksU0FBQyxFQUFELEdBQUE7V0FDUixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxHQUFELEVBQU0sT0FBTixHQUFBO0FBQ1gsUUFBQSxJQUFHLFdBQUg7QUFDRSxVQUFBLEtBQUMsQ0FBQSxNQUFELENBQVEsY0FBUixFQUF3QiwrQkFBQSxHQUFqQyxLQUFTLENBQUEsQ0FBQTs0Q0FDQSxHQUFJLGNBRk47U0FBQSxNQUFBO0FBSUUsVUFBQSxLQUFDLENBQUEsTUFBRCxDQUFRLGdCQUFSLEVBQTBCLGdCQUExQixDQUFBLENBQUE7NENBQ0EsR0FBSSxNQUFNLEtBQUMsQ0FBQSxNQUFNLENBQUMsaUJBTHBCO1NBRFc7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiLEVBRFE7RUFBQSxDQTdJWixDQUFBOztBQUFBLHdCQXNKQSxhQUFBLEdBQWUsU0FBQSxHQUFBO1dBQ2IsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQURhO0VBQUEsQ0F0SmYsQ0FBQTs7QUFBQSx3QkF5SkEsVUFBQSxHQUFZLFNBQUEsR0FBQSxDQXpKWixDQUFBOztBQUFBLHdCQTBKQSw0QkFBQSxHQUE4QixTQUFDLEdBQUQsR0FBQTtBQUM1QixRQUFBLG1FQUFBO0FBQUEsSUFBQSxhQUFBLEdBQWdCLDJKQUFoQixDQUFBO0FBRUEsSUFBQSxJQUFtQiw0RUFBbkI7QUFBQSxhQUFPLElBQVAsQ0FBQTtLQUZBO0FBQUEsSUFJQSxPQUFBLHFEQUFvQyxDQUFBLENBQUEsVUFKcEMsQ0FBQTtBQUtBLElBQUEsSUFBTyxlQUFQO0FBRUUsTUFBQSxPQUFBLEdBQVUsR0FBVixDQUZGO0tBTEE7QUFTQSxJQUFBLElBQW1CLGVBQW5CO0FBQUEsYUFBTyxJQUFQLENBQUE7S0FUQTtBQVdBO0FBQUEsU0FBQSw0Q0FBQTtzQkFBQTtBQUNFLE1BQUEsT0FBQSxHQUFVLHdDQUFBLElBQW9DLGlCQUE5QyxDQUFBO0FBRUEsTUFBQSxJQUFHLE9BQUg7QUFDRSxRQUFBLElBQUcsa0RBQUg7QUFBQTtTQUFBLE1BQUE7QUFHRSxVQUFBLFFBQUEsR0FBVyxHQUFHLENBQUMsT0FBSixDQUFnQixJQUFBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFoQixFQUFpQyxHQUFHLENBQUMsU0FBckMsQ0FBWCxDQUhGO1NBQUE7QUFJQSxjQUxGO09BSEY7QUFBQSxLQVhBO0FBb0JBLFdBQU8sUUFBUCxDQXJCNEI7RUFBQSxDQTFKOUIsQ0FBQTs7QUFBQSx3QkFpTEEsY0FBQSxHQUFnQixTQUFDLEdBQUQsRUFBTSxFQUFOLEdBQUE7QUFDZCxRQUFBLFFBQUE7V0FBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVEsQ0FBQyw0QkFBVixDQUF1QyxHQUF2QyxFQURHO0VBQUEsQ0FqTGhCLENBQUE7O0FBQUEsd0JBb0xBLFlBQUEsR0FBYyxTQUFDLFFBQUQsRUFBVyxFQUFYLEdBQUE7QUFDWixJQUFBLElBQW1DLGdCQUFuQztBQUFBLHdDQUFPLEdBQUksMEJBQVgsQ0FBQTtLQUFBO0FBQUEsSUFDQSxJQUFBLENBQUssU0FBQSxHQUFZLFFBQWpCLENBREEsQ0FBQTtXQUVBLElBQUMsQ0FBQSxlQUFELENBQWlCLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBdkIsRUFBb0MsUUFBcEMsRUFBOEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsR0FBRCxFQUFNLFNBQU4sRUFBaUIsU0FBakIsR0FBQTtBQUU1QyxRQUFBLElBQUcsV0FBSDtBQUVFLDRDQUFPLEdBQUksYUFBWCxDQUZGO1NBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBQSxTQUFnQixDQUFDLEtBSmpCLENBQUE7QUFBQSxRQUtBLEtBQUMsQ0FBQSxJQUFJLENBQUMsa0JBQW1CLENBQUEsUUFBQSxDQUF6QixHQUNFO0FBQUEsVUFBQSxTQUFBLEVBQVcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFsQixDQUE4QixTQUE5QixDQUFYO0FBQUEsVUFDQSxRQUFBLEVBQVUsUUFEVjtBQUFBLFVBRUEsU0FBQSxFQUFXLFNBRlg7U0FORixDQUFBOzBDQVNBLEdBQUksTUFBTSxLQUFDLENBQUEsSUFBSSxDQUFDLGtCQUFtQixDQUFBLFFBQUEsR0FBVyxvQkFYRjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDLEVBSFk7RUFBQSxDQXBMZCxDQUFBOztBQUFBLHdCQXNNQSxxQkFBQSxHQUF1QixTQUFDLFdBQUQsRUFBYyxJQUFkLEVBQW9CLEVBQXBCLEdBQUE7QUFDckIsUUFBQSxtQkFBQTtBQUFBLElBQUEsTUFBQSxHQUFTLFdBQVcsQ0FBQyxLQUFaLENBQUEsQ0FBVCxDQUFBO0FBQUEsSUFDQSxLQUFBLEdBQVEsSUFEUixDQUFBO0FBQUEsSUFFQSxJQUFBLEdBQU8sTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUZQLENBQUE7V0FJQSxJQUFDLENBQUEsRUFBRSxDQUFDLGlCQUFKLENBQXNCLElBQXRCLEVBQTRCLEtBQTVCLEVBQW1DLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLEdBQUQsRUFBTSxTQUFOLEdBQUE7QUFDakMsUUFBQSxJQUFHLFdBQUg7QUFDRSxVQUFBLElBQUcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBbkI7bUJBQ0UsS0FBQyxDQUFBLHFCQUFELENBQXVCLE1BQXZCLEVBQStCLEtBQS9CLEVBQXNDLEVBQXRDLEVBREY7V0FBQSxNQUFBOzhDQUdFLEdBQUksc0JBSE47V0FERjtTQUFBLE1BQUE7NENBTUUsR0FBSSxNQUFNLFdBQVcsZUFOdkI7U0FEaUM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQyxFQUxxQjtFQUFBLENBdE12QixDQUFBOztBQUFBLHdCQW9OQSxlQUFBLEdBQWlCLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxFQUFiLEdBQUE7V0FDZixJQUFDLENBQUEscUJBQUQsQ0FBdUIsSUFBdkIsRUFBNkIsSUFBN0IsRUFBbUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsR0FBRCxFQUFNLFNBQU4sRUFBaUIsU0FBakIsR0FBQTtBQUNqQyxRQUFBLElBQUcsV0FBSDtBQUNFLFVBQUEsSUFBRyxJQUFBLEtBQVEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxPQUFiLEVBQXNCLEVBQXRCLENBQVg7OENBQ0UsR0FBSSxzQkFETjtXQUFBLE1BQUE7bUJBR0UsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBakIsRUFBdUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxPQUFiLEVBQXNCLEVBQXRCLENBQXZCLEVBQWtELEVBQWxELEVBSEY7V0FERjtTQUFBLE1BQUE7NENBTUUsR0FBSSxNQUFNLFdBQVcsb0JBTnZCO1NBRGlDO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkMsRUFEZTtFQUFBLENBcE5qQixDQUFBOztBQUFBLHdCQThOQSxlQUFBLEdBQWlCLFNBQUMsRUFBRCxHQUFBO1dBQ2YsSUFBQyxDQUFBLFlBQUQsQ0FBYyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQ1osWUFBQSxnRUFBQTtBQUFBLFFBQUEsSUFBQSxHQUFPLEtBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBOUIsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxHQUFRLFFBQUEsR0FBVyxDQURuQixDQUFBO0FBRUE7QUFBQTthQUFBLDJDQUFBOzBCQUFBO0FBQ0UsVUFBQSxTQUFBLEdBQVksS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBSSxDQUFDLEdBQXJCLENBQVosQ0FBQTtBQUNBLFVBQUEsSUFBRyxpQkFBSDswQkFDRSxLQUFDLENBQUEsWUFBRCxDQUFjLFNBQWQsRUFBeUIsU0FBQyxHQUFELEVBQU0sT0FBTixHQUFBO0FBQ3ZCLGNBQUEsSUFBQSxFQUFBLENBQUE7QUFBQSxjQUNBLElBQUEsQ0FBSyxTQUFMLENBREEsQ0FBQTtBQUVBLGNBQUEsSUFBRyxXQUFIO0FBQWEsZ0JBQUEsUUFBQSxFQUFBLENBQWI7ZUFBQSxNQUFBO0FBQ0ssZ0JBQUEsS0FBQSxFQUFBLENBREw7ZUFGQTtBQUtBLGNBQUEsSUFBRyxJQUFBLEtBQVEsQ0FBWDtBQUNFLGdCQUFBLElBQUcsS0FBQSxHQUFRLENBQVg7b0RBQ0UsR0FBSSxNQUFNLGlCQURaO2lCQUFBLE1BQUE7b0RBR0UsR0FBSSwwQkFITjtpQkFERjtlQU51QjtZQUFBLENBQXpCLEdBREY7V0FBQSxNQUFBO0FBY0UsWUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUFBLFlBQ0EsUUFBQSxFQURBLENBQUE7QUFFQSxZQUFBLElBQUcsSUFBQSxLQUFRLENBQVg7dURBQ0UsR0FBSSwyQkFETjthQUFBLE1BQUE7b0NBQUE7YUFoQkY7V0FGRjtBQUFBO3dCQUhZO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZCxFQURlO0VBQUEsQ0E5TmpCLENBQUE7O0FBQUEsd0JBdVBBLFlBQUEsR0FBYyxTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7QUFDWixRQUFBLFNBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxJQUFBLElBQVEsRUFBQSxHQUFLLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLElBQUksQ0FBQyxrQkFBbEIsQ0FBcUMsQ0FBQyxNQUEvRCxDQUFBO1dBQ0EsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFyQixDQUNFO0FBQUEsTUFBQSxJQUFBLEVBQUssU0FBTDtLQURGLEVBRlk7RUFBQSxDQXZQZCxDQUFBOztBQUFBLHdCQTZQQSxlQUFBLEdBQWdCLFNBQUMsS0FBRCxHQUFBO1dBQ2QsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFyQixDQUNFO0FBQUEsTUFBQSxJQUFBLEVBQUssRUFBTDtLQURGLEVBRGM7RUFBQSxDQTdQaEIsQ0FBQTs7QUFBQSx3QkFrUUEsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLFNBQU4sRUFBaUIsT0FBakIsR0FBQTtBQUNILElBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFYLENBQUE7V0FFQSxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQWxCLENBQStCLEdBQUcsQ0FBQyxnQkFBbkMsRUFBcUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsUUFBRCxHQUFBO0FBRW5ELFlBQUEsa0JBQUE7QUFBQSxRQUFBLElBQUEsR0FBTyxDQUFQLENBQUE7QUFBQSxRQUNBLE1BQUEsR0FBUywwQ0FEVCxDQUFBO0FBQUEsUUFFQSxJQUFBLEdBQU8sU0FBQyxHQUFELEVBQU0sT0FBTixHQUFBO0FBQ0wsY0FBQSxNQUFBO0FBQUEsVUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxHQUFTLEdBQUcsQ0FBQyxZQUFKLENBQUEsQ0FEVCxDQUFBO2lCQUVBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLFNBQUMsT0FBRCxHQUFBO0FBQ2pCLGdCQUFBLG9CQUFBO0FBQUEsWUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLGtCQUNLLFNBQUMsS0FBRCxHQUFBO0FBQ0QsY0FBQSxPQUFRLENBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBUixHQUEwQixLQUExQixDQUFBO0FBQ0EsY0FBQSxJQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBZixDQUFxQixNQUFyQixDQUFBLEtBQWdDLElBQW5DO0FBQ0UsZ0JBQUEsSUFBRyxLQUFLLENBQUMsV0FBVDtBQUNFLGtCQUFBLElBQUEsRUFBQSxDQUFBO3lCQUNBLElBQUEsQ0FBSyxLQUFMLEVBQVksT0FBWixFQUZGO2lCQURGO2VBRkM7WUFBQSxDQURMO0FBQUEsaUJBQUEsOENBQUE7a0NBQUE7QUFDRSxrQkFBSSxNQUFKLENBREY7QUFBQSxhQURBO0FBU0EsWUFBQSxJQUFvQixJQUFBLEtBQVEsQ0FBNUI7cUJBQUEsSUFBQSxDQUFLLFdBQUwsRUFBQTthQVZpQjtVQUFBLENBQW5CLEVBWUMsU0FBQyxLQUFELEdBQUE7bUJBQ0MsSUFBQSxHQUREO1VBQUEsQ0FaRCxFQUhLO1FBQUEsQ0FGUCxDQUFBO2VBc0JBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBQSxDQUFLLFFBQUwsRUFBZSxLQUFDLENBQUEsT0FBaEIsQ0FBWixFQXhCbUQ7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyRCxFQUhHO0VBQUEsQ0FsUUwsQ0FBQTs7cUJBQUE7O0dBRHdCLE9BVjFCLENBQUE7O0FBQUEsTUEyU00sQ0FBQyxPQUFQLEdBQWlCLFdBM1NqQixDQUFBOzs7O0FDQUEsSUFBQSxNQUFBOztBQUFBO0FBR0UsbUJBQUEsTUFBQSxHQUFRLGtDQUFSLENBQUE7O0FBQUEsbUJBQ0EsWUFBQSxHQUFjLGtDQURkLENBQUE7O0FBQUEsbUJBRUEsT0FBQSxHQUFTLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFGeEIsQ0FBQTs7QUFBQSxtQkFHQSxlQUFBLEdBQWlCLFFBQVEsQ0FBQyxRQUFULEtBQXVCLG1CQUh4QyxDQUFBOztBQUFBLG1CQUlBLE1BQUEsR0FBUSxJQUpSLENBQUE7O0FBQUEsbUJBS0EsUUFBQSxHQUFVLElBTFYsQ0FBQTs7QUFPYSxFQUFBLGdCQUFBLEdBQUE7QUFDWCxJQUFBLElBQUMsQ0FBQSxNQUFELEdBQWEsSUFBQyxDQUFBLE1BQUQsS0FBVyxJQUFDLENBQUEsT0FBZixHQUE0QixJQUFDLENBQUEsWUFBN0IsR0FBK0MsSUFBQyxDQUFBLE1BQTFELENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFELEdBQWUsSUFBQyxDQUFBLE1BQUQsS0FBVyxJQUFDLENBQUEsT0FBZixHQUE0QixXQUE1QixHQUE2QyxLQUR6RCxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsU0FBRCxHQUFnQixJQUFDLENBQUEsTUFBRCxLQUFhLElBQUMsQ0FBQSxPQUFqQixHQUE4QixXQUE5QixHQUErQyxLQUY1RCxDQURXO0VBQUEsQ0FQYjs7QUFBQSxtQkFZQSxXQUFBLEdBQWEsU0FBQyxHQUFELEVBQU0sS0FBTixFQUFhLENBQWIsR0FBQTtBQUNULFFBQUEsS0FBQTtBQUFBLElBQUEsS0FBQSxHQUFRLEdBQVIsQ0FBQTtXQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLEtBQVosRUFBbUIsU0FBQyxJQUFELEdBQUE7QUFDakIsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFHLDhDQUFIO0FBQ0UsUUFBQSxJQUFHLE1BQUEsQ0FBQSxTQUFpQixDQUFBLENBQUEsQ0FBakIsS0FBdUIsVUFBMUI7QUFDRSxVQUFBLDhDQUFpQixDQUFFLGdCQUFoQixJQUEwQixDQUE3QjtBQUNFLG1CQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsS0FBUixFQUFlLElBQUksQ0FBQyxXQUFELENBQVUsQ0FBQyxNQUFmLENBQXNCLFNBQVUsQ0FBQSxDQUFBLENBQWhDLENBQWYsQ0FBUCxDQURGO1dBQUEsTUFBQTtBQUdFLG1CQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsS0FBUixFQUFlLEVBQUUsQ0FBQyxNQUFILENBQVUsU0FBVSxDQUFBLENBQUEsQ0FBcEIsQ0FBZixDQUFQLENBSEY7V0FERjtTQURGO09BQUE7QUFPQSxhQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsS0FBUixFQUFlLFNBQWYsQ0FBUCxDQVJpQjtJQUFBLENBQW5CLEVBRlM7RUFBQSxDQVpiLENBQUE7O0FBQUEsbUJBZ0NBLGNBQUEsR0FBZ0IsU0FBQyxHQUFELEdBQUE7QUFDZCxRQUFBLEdBQUE7QUFBQSxTQUFBLFVBQUEsR0FBQTtVQUE4RixNQUFBLENBQUEsR0FBVyxDQUFBLEdBQUEsQ0FBWCxLQUFtQjtBQUFqSCxRQUFDLEdBQUksQ0FBQSxHQUFBLENBQUosR0FBVyxJQUFDLENBQUEsV0FBRCxDQUFhLEdBQWIsRUFBa0IsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFoQixHQUF1QixHQUF2QixHQUE2QixHQUEvQyxFQUFvRCxHQUFJLENBQUEsR0FBQSxDQUF4RCxDQUFaO09BQUE7QUFBQSxLQUFBO1dBQ0EsSUFGYztFQUFBLENBaENoQixDQUFBOztBQUFBLG1CQW9DQSxZQUFBLEdBQWMsU0FBQyxHQUFELEVBQU0sS0FBTixFQUFhLENBQWIsR0FBQTtXQUNaLFNBQUEsR0FBQTtBQUNFLFVBQUEsb0JBQUE7QUFBQSxNQUFBLEdBQUEsR0FBTSxFQUFOLENBQUE7QUFBQSxNQUNBLEdBQUksQ0FBQSxLQUFBLENBQUosR0FDRTtBQUFBLFFBQUEsT0FBQSxFQUFRLElBQVI7QUFBQSxRQUNBLFdBQUEsRUFBVSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUF0QixDQUEyQixTQUEzQixDQURWO09BRkYsQ0FBQTtBQUFBLE1BSUEsR0FBSSxDQUFBLEtBQUEsQ0FBTSxDQUFDLE9BQVgsR0FBcUIsSUFKckIsQ0FBQTtBQUFBLE1BS0EsS0FBQSxHQUFRLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQXRCLENBQTJCLFNBQTNCLENBTFIsQ0FBQTtBQU9BLE1BQUEsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFuQjtBQUNFLFFBQUEsR0FBSSxDQUFBLEtBQUEsQ0FBTSxDQUFDLFdBQUQsQ0FBVixHQUF1QixNQUF2QixDQUFBO0FBQ0EsZUFBTyxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQUwsQ0FBUyxHQUFULEVBQWMsU0FBQSxHQUFBO2lCQUFNLE9BQU47UUFBQSxDQUFkLENBQVAsQ0FGRjtPQVBBO0FBQUEsTUFXQSxHQUFJLENBQUEsS0FBQSxDQUFNLENBQUMsV0FBRCxDQUFWLEdBQXVCLEtBWHZCLENBQUE7QUFBQSxNQWFBLFFBQUEsR0FBVyxHQUFJLENBQUEsS0FBQSxDQUFNLENBQUMsV0FBRCxDQUFVLENBQUMsR0FBckIsQ0FBQSxDQWJYLENBQUE7QUFjQSxNQUFBLElBQUcsTUFBQSxDQUFBLFFBQUEsS0FBcUIsVUFBeEI7QUFDRSxRQUFBLEdBQUksQ0FBQSxLQUFBLENBQU0sQ0FBQyxXQUFELENBQVUsQ0FBQyxJQUFyQixDQUEwQixRQUExQixDQUFBLENBQUE7ZUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEdBQUwsQ0FBUyxHQUFULEVBQWMsU0FBQSxHQUFBO2lCQUFNLE9BQU47UUFBQSxDQUFkLEVBRkY7T0FBQSxNQUFBO2VBSUUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFMLENBQVMsR0FBVCxFQUFjLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQ1osZ0JBQUEsVUFBQTtBQUFBLFlBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQXRCLENBQTJCLFNBQTNCLENBQVAsQ0FBQTtBQUVBLFlBQUEsb0JBQUcsSUFBSSxDQUFFLGdCQUFOLEdBQWUsQ0FBZixJQUFxQiw0REFBeEI7cUJBQ0UsUUFBUSxDQUFDLEtBQVQsQ0FBZSxLQUFmLEVBQWtCLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUExQixFQURGO2FBSFk7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkLEVBSkY7T0FmRjtJQUFBLEVBRFk7RUFBQSxDQXBDZCxDQUFBOztBQUFBLG1CQThEQSxlQUFBLEdBQWlCLFNBQUMsR0FBRCxHQUFBO0FBQ2YsUUFBQSxHQUFBO0FBQUEsU0FBQSxVQUFBLEdBQUE7VUFBK0YsTUFBQSxDQUFBLEdBQVcsQ0FBQSxHQUFBLENBQVgsS0FBbUI7QUFBbEgsUUFBQyxHQUFJLENBQUEsR0FBQSxDQUFKLEdBQVcsSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkLEVBQW1CLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBaEIsR0FBdUIsR0FBdkIsR0FBNkIsR0FBaEQsRUFBcUQsR0FBSSxDQUFBLEdBQUEsQ0FBekQsQ0FBWjtPQUFBO0FBQUEsS0FBQTtXQUNBLElBRmU7RUFBQSxDQTlEakIsQ0FBQTs7Z0JBQUE7O0lBSEYsQ0FBQTs7QUFBQSxNQXFFTSxDQUFDLE9BQVAsR0FBaUIsTUFyRWpCLENBQUE7Ozs7QUNBQSxJQUFBLCtFQUFBOztBQUFBLFNBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLFVBQUE7QUFBQSxFQUFBLFVBQUEsR0FBYSxTQUFBLEdBQUE7V0FDWCxLQURXO0VBQUEsQ0FBYixDQUFBO1NBR0EsVUFBQSxDQUFBLEVBSlU7QUFBQSxDQUFaLENBQUE7O0FBQUEsSUFNQSxHQUFPLFNBQUEsQ0FBQSxDQU5QLENBQUE7O0FBQUEsTUFVTSxDQUFDLGFBQWEsQ0FBQyxRQUFyQixDQUE4QjtBQUFBLEVBQUEsS0FBQSxFQUFNLFlBQU47Q0FBOUIsQ0FWQSxDQUFBOztBQUFBLFdBY0EsR0FBYyxPQUFBLENBQVEscUJBQVIsQ0FkZCxDQUFBOztBQUFBLFFBZUEsR0FBVyxPQUFBLENBQVEsdUJBQVIsQ0FmWCxDQUFBOztBQUFBLE9BZ0JBLEdBQVUsT0FBQSxDQUFRLHNCQUFSLENBaEJWLENBQUE7O0FBQUEsVUFpQkEsR0FBYSxPQUFBLENBQVEseUJBQVIsQ0FqQmIsQ0FBQTs7QUFBQSxNQWtCQSxHQUFTLE9BQUEsQ0FBUSxxQkFBUixDQWxCVCxDQUFBOztBQUFBLEtBb0JBLEdBQVEsR0FBQSxDQUFBLFFBcEJSLENBQUE7O0FBQUEsR0FzQkEsR0FBTSxJQUFJLENBQUMsR0FBTCxHQUFlLElBQUEsV0FBQSxDQUNuQjtBQUFBLEVBQUEsUUFBQSxFQUFVLEtBQVY7QUFBQSxFQUNBLE9BQUEsRUFBUyxPQURUO0FBQUEsRUFFQSxFQUFBLEVBQUksVUFGSjtBQUFBLEVBR0EsTUFBQSxFQUFRLE1BSFI7Q0FEbUIsQ0F0QnJCLENBQUE7O0FBQUEsR0E0QkcsQ0FBQyxPQUFPLENBQUMsV0FBWixDQUF3QixJQUF4QixDQTVCQSxDQUFBOztBQUFBLE1BK0JNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUF0QixDQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO1NBQUEsU0FBQyxLQUFELEVBQVEsVUFBUixFQUFvQixHQUFwQixHQUFBLEVBQUE7QUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBL0JBLENBQUE7Ozs7QUNBQSxJQUFBLHVCQUFBO0VBQUEsa0ZBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQUFULENBQUE7O0FBQUEsR0FDQSxHQUFNLE9BQUEsQ0FBUSxjQUFSLENBRE4sQ0FBQTs7QUFBQTtBQUlFLHVCQUFBLEdBQUEsR0FBSyxNQUFNLENBQUMsVUFBWixDQUFBOztBQUFBLHVCQUNBLFlBQUEsR0FBYyxFQURkLENBQUE7O0FBQUEsdUJBRUEsTUFBQSxHQUFRLE1BQU0sQ0FBQyxHQUFQLENBQUEsQ0FGUixDQUFBOztBQUFBLHVCQUdBLEdBQUEsR0FBSyxHQUFHLENBQUMsR0FBSixDQUFBLENBSEwsQ0FBQTs7QUFJYSxFQUFBLG9CQUFBLEdBQUE7QUFBSSxpRUFBQSxDQUFKO0VBQUEsQ0FKYjs7QUFBQSx1QkFlQSxRQUFBLEdBQVUsU0FBQyxRQUFELEVBQVcsSUFBWCxFQUFpQixFQUFqQixHQUFBO1dBQ1IsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkLEVBQXdCLElBQXhCLEVBQ0UsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsR0FBRCxFQUFNLFNBQU4sR0FBQTtBQUVFLFFBQUEsSUFBRyxXQUFIO0FBQWEsNENBQU8sR0FBSSxhQUFYLENBQWI7U0FBQTtlQUVBLFNBQVMsQ0FBQyxJQUFWLENBQWUsU0FBQyxJQUFELEdBQUE7NENBQ2IsR0FBSSxNQUFNLFdBQVcsZUFEUjtRQUFBLENBQWYsRUFFQyxTQUFDLEdBQUQsR0FBQTs0Q0FBUyxHQUFJLGNBQWI7UUFBQSxDQUZELEVBSkY7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURGLEVBRFE7RUFBQSxDQWZWLENBQUE7O0FBQUEsdUJBeUJBLFlBQUEsR0FBYyxTQUFDLFFBQUQsRUFBVyxJQUFYLEVBQWlCLEVBQWpCLEdBQUE7V0FDVixRQUFRLENBQUMsT0FBVCxDQUFpQixJQUFqQixFQUF1QixFQUF2QixFQUEyQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxTQUFELEdBQUE7MENBQ3pCLEdBQUksTUFBTSxvQkFEZTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCLEVBRUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsR0FBRCxHQUFBOzBDQUFTLEdBQUksY0FBYjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRkQsRUFEVTtFQUFBLENBekJkLENBQUE7O0FBQUEsdUJBK0JBLGFBQUEsR0FBZSxTQUFDLGNBQUQsRUFBaUIsRUFBakIsR0FBQTtXQUViLElBQUMsQ0FBQSxHQUFHLENBQUMsY0FBTCxDQUFvQixjQUFwQixFQUFvQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxRQUFELEdBQUE7QUFDbEMsWUFBQSxHQUFBO0FBQUEsUUFBQSxHQUFBLEdBQ0k7QUFBQSxVQUFBLE9BQUEsRUFBUyxjQUFjLENBQUMsUUFBeEI7QUFBQSxVQUNBLGdCQUFBLEVBQWtCLEtBQUMsQ0FBQSxHQUFHLENBQUMsV0FBTCxDQUFpQixjQUFqQixDQURsQjtBQUFBLFVBRUEsS0FBQSxFQUFPLGNBRlA7U0FESixDQUFBOzBDQUlBLEdBQUksTUFBTSxVQUFVLGNBTGM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQyxFQUZhO0VBQUEsQ0EvQmYsQ0FBQTs7QUFBQSx1QkEwQ0EsaUJBQUEsR0FBbUIsU0FBQyxHQUFELEVBQU0sUUFBTixFQUFnQixFQUFoQixHQUFBO0FBQ2pCLFFBQUEsUUFBQTtBQUFBLElBQUEsUUFBQSxHQUFXLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBbEIsQ0FBK0IsR0FBRyxDQUFDLGdCQUFuQyxFQUFxRCxTQUFBLEdBQUEsQ0FBckQsQ0FBWCxDQUFBO0FBQ0EsSUFBQSxJQUFPLGdCQUFQO2FBQ0UsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFsQixDQUErQixHQUFHLENBQUMsZ0JBQW5DLEVBQXFELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFFBQUQsR0FBQTtpQkFDbkQsS0FBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkLEVBQXdCLFFBQXhCLEVBQWtDLEVBQWxDLEVBRG1EO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckQsRUFERjtLQUFBLE1BQUE7YUFJRSxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQWQsRUFBd0IsUUFBeEIsRUFBa0MsRUFBbEMsRUFKRjtLQUZpQjtFQUFBLENBMUNuQixDQUFBOztvQkFBQTs7SUFKRixDQUFBOztBQUFBLE1BZ0hNLENBQUMsT0FBUCxHQUFpQixVQWhIakIsQ0FBQTs7OztBQ0FBLElBQUEsY0FBQTtFQUFBOzs7b0JBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQUFULENBQUE7O0FBQUE7QUFHRSxNQUFBLFFBQUE7O0FBQUEsMkJBQUEsQ0FBQTs7QUFBQSxtQkFBQSxLQUFBLEdBQ0U7QUFBQSxJQUFBLEdBQUEsRUFBSyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQXBCO0FBQUEsSUFDQSxTQUFBLEVBQVUsRUFEVjtHQURGLENBQUE7O0FBQUEsbUJBSUEsUUFBQSxHQUNFO0FBQUEsSUFBQSxHQUFBLEVBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBcEI7QUFBQSxJQUNBLFNBQUEsRUFBVSxFQURWO0dBTEYsQ0FBQTs7QUFBQSxFQVFBLFFBQUEsR0FBVyxJQVJYLENBQUE7O0FBU2EsRUFBQSxnQkFBQSxHQUFBO0FBQ1gsbURBQUEsQ0FBQTtBQUFBLG1FQUFBLENBQUE7QUFBQSxxQ0FBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLFFBQUEsSUFBQTtBQUFBLElBQUEseUNBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxJQUVBLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsV0FBakMsQ0FBNkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsSUFBRCxHQUFBO2VBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBZixDQUEyQixLQUFDLENBQUEsa0JBQTVCLEVBRDJDO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0MsQ0FGQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFYLENBQXVCLElBQUMsQ0FBQSxVQUF4QixDQUxBLENBQUE7O1VBTWEsQ0FBRSxXQUFmLENBQTJCLElBQUMsQ0FBQSxrQkFBNUI7S0FQVztFQUFBLENBVGI7O0FBQUEsRUFrQkEsTUFBQyxDQUFBLEdBQUQsR0FBTSxTQUFBLEdBQUE7OEJBQ0osV0FBQSxXQUFZLEdBQUEsQ0FBQSxPQURSO0VBQUEsQ0FsQk4sQ0FBQTs7QUFBQSxtQkFxQkEsS0FBQSxHQUFPLFNBQUMsT0FBRCxFQUFVLFFBQVYsR0FBQTtXQUNMLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBVSxDQUFBLE9BQUEsQ0FBakIsR0FBNEIsU0FEdkI7RUFBQSxDQXJCUCxDQUFBOztBQUFBLG1CQXdCQSxHQUFBLEdBQUssU0FBQyxPQUFELEVBQVUsUUFBVixHQUFBO1dBRUgsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFVLENBQUEsT0FBQSxDQUFwQixHQUErQixTQUY1QjtFQUFBLENBeEJMLENBQUE7O0FBQUEsbUJBNEJBLGtCQUFBLEdBQW9CLFNBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsWUFBbEIsR0FBQTtBQUNsQixRQUFBLHlDQUFBO0FBQUEsSUFBQSxjQUFBLEdBQWlCO0FBQUEsTUFBQSxNQUFBLEVBQU8sS0FBUDtLQUFqQixDQUFBO0FBQUEsSUFFQSxhQUFBLEdBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDZCxZQUFBLHNCQUFBO0FBQUEsUUFEZSxrRUFDZixDQUFBO0FBQUE7QUFFRSxVQUFBLFlBQVksQ0FBQyxLQUFiLENBQW1CLElBQW5CLEVBQXdCLFNBQUEsR0FBWTtZQUFDO0FBQUEsY0FBQSxPQUFBLEVBQVEsUUFBUjthQUFEO1dBQXBDLENBQUEsQ0FGRjtTQUFBLGNBQUE7QUFLRSxVQURJLFVBQ0osQ0FBQTtBQUFBLFVBQUEsTUFBQSxDQUxGO1NBQUE7ZUFNQSxjQUFjLENBQUMsTUFBZixHQUF3QixLQVBWO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGaEIsQ0FBQTtBQVlBLElBQUEsSUFBRyxNQUFNLENBQUMsRUFBUCxLQUFlLElBQUMsQ0FBQSxNQUFoQixJQUEyQixNQUFNLENBQUMsV0FBVyxDQUFDLElBQW5CLEtBQTZCLE1BQTNEO0FBQ0UsYUFBTyxLQUFQLENBREY7S0FaQTtBQWVBLFNBQUEsY0FBQSxHQUFBOzthQUFvQixDQUFBLEdBQUEsRUFBTSxPQUFRLENBQUEsR0FBQSxHQUFNO09BQXhDO0FBQUEsS0FmQTtBQWlCQSxJQUFBLElBQUEsQ0FBQSxjQUFxQixDQUFDLE1BQXRCO0FBRUUsYUFBTyxJQUFQLENBRkY7S0FsQmtCO0VBQUEsQ0E1QnBCLENBQUE7O0FBQUEsbUJBa0RBLFVBQUEsR0FBWSxTQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLFlBQWxCLEdBQUE7QUFDVixRQUFBLHlDQUFBO0FBQUEsSUFBQSxjQUFBLEdBQWlCO0FBQUEsTUFBQSxNQUFBLEVBQU8sS0FBUDtLQUFqQixDQUFBO0FBQUEsSUFDQSxhQUFBLEdBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDZCxZQUFBLENBQUE7QUFBQTtBQUVFLFVBQUEsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsS0FBbkIsRUFBd0IsU0FBeEIsQ0FBQSxDQUZGO1NBQUEsY0FBQTtBQUdNLFVBQUEsVUFBQSxDQUhOO1NBQUE7ZUFLQSxjQUFjLENBQUMsTUFBZixHQUF3QixLQU5WO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEaEIsQ0FBQTtBQVVBLFNBQUEsY0FBQSxHQUFBOzthQUFpQixDQUFBLEdBQUEsRUFBTSxPQUFRLENBQUEsR0FBQSxHQUFNO09BQXJDO0FBQUEsS0FWQTtBQVlBLElBQUEsSUFBQSxDQUFBLGNBQXFCLENBQUMsTUFBdEI7QUFFRSxhQUFPLElBQVAsQ0FGRjtLQWJVO0VBQUEsQ0FsRFosQ0FBQTs7Z0JBQUE7O0dBRG1CLE9BRnJCLENBQUE7O0FBQUEsTUFzRU0sQ0FBQyxPQUFQLEdBQWlCLE1BdEVqQixDQUFBOzs7O0FDQUEsSUFBQSxXQUFBO0VBQUE7aVNBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQUFULENBQUE7O0FBQUE7QUFHRSxNQUFBLFFBQUE7O0FBQUEsd0JBQUEsQ0FBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxJQUFYLENBQUE7O0FBQUEsZ0JBQ0EsSUFBQSxHQUFLLElBREwsQ0FBQTs7QUFFYSxFQUFBLGFBQUEsR0FBQTtBQUNYLElBQUEsc0NBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFmLENBQXVCLElBQUMsQ0FBQSxNQUF4QixDQURSLENBRFc7RUFBQSxDQUZiOztBQUFBLEVBTUEsR0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFBLEdBQUE7OEJBQ0osV0FBQSxXQUFZLEdBQUEsQ0FBQSxJQURSO0VBQUEsQ0FOTixDQUFBOztBQUFBLEVBU0EsR0FBQyxDQUFBLFVBQUQsR0FBYSxTQUFBLEdBQUEsQ0FUYixDQUFBOztBQUFBLGdCQVlBLEtBQUEsR0FBTyxTQUFDLE9BQUQsRUFBVSxPQUFWLEdBQUE7QUFDTCxRQUFBLElBQUE7QUFBQSxTQUFBLGVBQUEsR0FBQTtBQUFBLE1BQUMsSUFBQSxDQUFNLGFBQUEsR0FBVixJQUFVLEdBQW9CLE1BQTFCLENBQUQsQ0FBQTtBQUFBLEtBQUE7V0FDQSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQWYsQ0FBMkIsT0FBM0IsRUFBb0MsT0FBcEMsRUFGSztFQUFBLENBWlAsQ0FBQTs7QUFBQSxnQkFlQSxHQUFBLEdBQUssU0FBQyxPQUFELEVBQVUsT0FBVixHQUFBO0FBQ0gsUUFBQSxJQUFBO0FBQUEsU0FBQSxlQUFBLEdBQUE7QUFBQSxNQUFDLElBQUEsQ0FBTSxzQkFBQSxHQUFWLElBQVUsR0FBNkIsTUFBbkMsQ0FBRCxDQUFBO0FBQUEsS0FBQTtXQUNBLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBZixDQUEyQixJQUFDLENBQUEsTUFBNUIsRUFBb0MsT0FBcEMsRUFBNkMsT0FBN0MsRUFGRztFQUFBLENBZkwsQ0FBQTs7QUFBQSxnQkFrQkEsT0FBQSxHQUFTLFNBQUMsT0FBRCxHQUFBO0FBQ1A7YUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsT0FBbEIsRUFERjtLQUFBLGNBQUE7QUFHRSxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFmLENBQXVCLElBQUMsQ0FBQSxNQUF4QixDQUFSLENBQUE7YUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsT0FBbEIsRUFKRjtLQURPO0VBQUEsQ0FsQlQsQ0FBQTs7YUFBQTs7R0FEZ0IsT0FGbEIsQ0FBQTs7QUFBQSxNQTRCTSxDQUFDLE9BQVAsR0FBaUIsR0E1QmpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QjtBQUFBLENBQUQsQ0FBQSxDQUFBLENBQWpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUgJy4vdXRpbC5jb2ZmZWUnXG5Db25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5NU0cgPSByZXF1aXJlICcuL21zZy5jb2ZmZWUnXG5MSVNURU4gPSByZXF1aXJlICcuL2xpc3Rlbi5jb2ZmZWUnXG5TdG9yYWdlID0gcmVxdWlyZSAnLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuTm90aWZpY2F0aW9uID0gcmVxdWlyZSAnLi9ub3RpZmljYXRpb24uY29mZmVlJ1xuU2VydmVyID0gcmVxdWlyZSAnLi9zZXJ2ZXIuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgQ29uZmlnXG4gIExJU1RFTjogbnVsbFxuICBNU0c6IG51bGxcbiAgU3RvcmFnZTogbnVsbFxuICBGUzogbnVsbFxuICBTZXJ2ZXI6IG51bGxcbiAgTm90aWZ5OiBudWxsXG4gIHBsYXRmb3JtOm51bGxcbiAgY3VycmVudFRhYklkOm51bGxcblxuICBjb25zdHJ1Y3RvcjogKGRlcHMpIC0+XG4gICAgc3VwZXJcblxuICAgIEBNU0cgPz0gTVNHLmdldCgpXG4gICAgQExJU1RFTiA/PSBMSVNURU4uZ2V0KClcbiAgICBcbiAgICBmb3IgcHJvcCBvZiBkZXBzXG4gICAgICBpZiB0eXBlb2YgZGVwc1twcm9wXSBpcyBcIm9iamVjdFwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpJbmJvdW5kIGRlcHNbcHJvcF1cbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwiZnVuY3Rpb25cIiBcbiAgICAgICAgQFtwcm9wXSA9IEB3cmFwT2JqT3V0Ym91bmQgbmV3IGRlcHNbcHJvcF1cblxuICAgIEBTdG9yYWdlLm9uRGF0YUxvYWRlZCA9IChkYXRhKSA9PlxuICAgICAgIyBAZGF0YSA9IGRhdGFcbiAgICAgICMgZGVsZXRlIEBTdG9yYWdlLmRhdGEuc2VydmVyXG4gICAgICAjIEBTdG9yYWdlLmRhdGEuc2VydmVyID0ge31cbiAgICAgICMgZGVsZXRlIEBTdG9yYWdlLmRhdGEuc2VydmVyLnN0YXR1c1xuXG4gICAgICBpZiBub3QgQFN0b3JhZ2UuZGF0YS5maXJzdFRpbWU/XG4gICAgICAgIEBTdG9yYWdlLmRhdGEuZmlyc3RUaW1lID0gZmFsc2VcbiAgICAgICAgQFN0b3JhZ2UuZGF0YS5tYXBzLnB1c2hcbiAgICAgICAgICBuYW1lOidTYWxlc2ZvcmNlJ1xuICAgICAgICAgIHVybDonaHR0cHMuKlxcL3Jlc291cmNlKFxcL1swLTldKyk/XFwvKFtBLVphLXowLTlcXC0uX10rXFwvKT8nXG4gICAgICAgICAgcmVnZXhSZXBsOicnXG4gICAgICAgICAgaXNSZWRpcmVjdDp0cnVlXG4gICAgICAgICAgaXNPbjpmYWxzZVxuXG5cbiAgICAgICMgaWYgQFJlZGlyZWN0PyB0aGVuIEBSZWRpcmVjdC5kYXRhID0gQGRhdGEudGFiTWFwc1xuXG4gICAgQE5vdGlmeSA/PSAobmV3IE5vdGlmaWNhdGlvbikuc2hvdyBcbiAgICAjIEBTdG9yYWdlID89IEB3cmFwT2JqT3V0Ym91bmQgbmV3IFN0b3JhZ2UgQGRhdGFcbiAgICAjIEBGUyA9IG5ldyBGaWxlU3lzdGVtIFxuICAgICMgQFNlcnZlciA/PSBAd3JhcE9iak91dGJvdW5kIG5ldyBTZXJ2ZXJcbiAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcbiAgICBcbiAgICBAd3JhcCA9IGlmIEBTRUxGX1RZUEUgaXMgJ0FQUCcgdGhlbiBAd3JhcEluYm91bmQgZWxzZSBAd3JhcE91dGJvdW5kXG5cbiAgICBAb3BlbkFwcCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5vcGVuQXBwJywgQG9wZW5BcHBcbiAgICBAbGF1bmNoQXBwID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmxhdW5jaEFwcCcsIEBsYXVuY2hBcHBcbiAgICBAc3RhcnRTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uc3RhcnRTZXJ2ZXInLCBAc3RhcnRTZXJ2ZXJcbiAgICBAcmVzdGFydFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5yZXN0YXJ0U2VydmVyJywgQHJlc3RhcnRTZXJ2ZXJcbiAgICBAc3RvcFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5zdG9wU2VydmVyJywgQHN0b3BTZXJ2ZXJcbiAgICBAZ2V0RmlsZU1hdGNoID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldEZpbGVNYXRjaCcsIEBnZXRGaWxlTWF0Y2hcblxuICAgIEB3cmFwID0gaWYgQFNFTEZfVFlQRSBpcyAnRVhURU5TSU9OJyB0aGVuIEB3cmFwSW5ib3VuZCBlbHNlIEB3cmFwT3V0Ym91bmRcblxuICAgIEBnZXRSZXNvdXJjZXMgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0UmVzb3VyY2VzJywgQGdldFJlc291cmNlc1xuICAgIEBnZXRDdXJyZW50VGFiID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldEN1cnJlbnRUYWInLCBAZ2V0Q3VycmVudFRhYlxuXG4gICAgY2hyb21lLnJ1bnRpbWUuZ2V0UGxhdGZvcm1JbmZvIChpbmZvKSA9PlxuICAgICAgQHBsYXRmb3JtID0gaW5mb1xuXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpIC0+XG4gICAgICBAU3RvcmFnZS5zZXNzaW9uLnNlcnZlciA9IHt9XG4gICAgICBAU3RvcmFnZS5zZXNzaW9uLnNlcnZlci5zdGF0dXMgPSBAU2VydmVyLnN0YXR1c1xuICAgICMgQFN0b3JhZ2UucmV0cmlldmVBbGwoKSBpZiBAU3RvcmFnZT9cblxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgbGF1bmNoQXBwOiAoY2IsIGVycm9yKSAtPlxuICAgICAgY2hyb21lLm1hbmFnZW1lbnQubGF1bmNoQXBwIEBBUFBfSUQsIChleHRJbmZvKSA9PlxuICAgICAgICBpZiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgICBlcnJvciBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNiPyBleHRJbmZvXG5cbiAgb3BlbkFwcDogKCkgPT5cbiAgICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsXG4gICAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgICBib3VuZHM6XG4gICAgICAgICAgd2lkdGg6NzcwXG4gICAgICAgICAgaGVpZ2h0OjgwMCxcbiAgICAgICh3aW4pID0+XG4gICAgICAgIEBhcHBXaW5kb3cgPSB3aW4pIFxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgZ2V0UmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldEN1cnJlbnRUYWIgKHRhYklkKSA9PlxuICAgICAgY2hyb21lLnRhYnMuZXhlY3V0ZVNjcmlwdCB0YWJJZCwgXG4gICAgICAgIGZpbGU6J3NjcmlwdHMvY29udGVudC5qcycsIChyZXN1bHRzKSA9PlxuICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMubGVuZ3RoID0gMFxuICAgICAgICAgIGZvciByIGluIHJlc3VsdHNcbiAgICAgICAgICAgIGZvciByZXMgaW4gclxuICAgICAgICAgICAgICBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLnB1c2ggcmVzXG4gICAgICAgICAgY2I/IG51bGwsIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXNcblxuXG4gIGdldExvY2FsRmlsZTogKGluZm8sIGNiKSA9PlxuICAgIGZpbGVQYXRoID0gaW5mby51cmlcbiAgICAjIGZpbGVQYXRoID0gQGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3QgdXJsXG4gICAgcmV0dXJuIGNiICdmaWxlIG5vdCBmb3VuZCcgdW5sZXNzIGZpbGVQYXRoP1xuICAgIF9kaXJzID0gW11cbiAgICBfZGlycy5wdXNoIGRpciBmb3IgZGlyIGluIEBkYXRhLmRpcmVjdG9yaWVzIHdoZW4gZGlyLmlzT25cbiAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnN1YnN0cmluZyAxIGlmIGZpbGVQYXRoLnN1YnN0cmluZygwLDEpIGlzICcvJ1xuICAgIEBmaW5kRmlsZUZvclBhdGggX2RpcnMsIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcikgPT5cbiAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gY2I/IGVyclxuICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgIGNiPyBudWxsLGZpbGVFbnRyeSxmaWxlXG4gICAgICAsKGVycikgPT4gY2I/IGVyclxuXG5cbiAgc3RhcnRTZXJ2ZXI6IChjYikgLT5cbiAgICBpZiBAU2VydmVyLnN0YXR1cy5pc09uIGlzIGZhbHNlXG4gICAgICBAU2VydmVyLnN0YXJ0IG51bGwsbnVsbCxudWxsLCAoZXJyLCBzb2NrZXRJbmZvKSA9PlxuICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIkVycm9yIFN0YXJ0aW5nIFNlcnZlcjogI3sgZXJyb3IgfVwiXG4gICAgICAgICAgICBjYj8gZXJyXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQE5vdGlmeSBcIlNlcnZlciBTdGFydGVkXCIsIFwiU3RhcnRlZCBTZXJ2ZXIgI3sgQFNlcnZlci5zdGF0dXMudXJsIH1cIlxuICAgICAgICAgICAgY2I/IG51bGwsIEBTZXJ2ZXIuc3RhdHVzXG4gICAgZWxzZVxuICAgICAgY2I/ICdhbHJlYWR5IHN0YXJ0ZWQnXG5cbiAgc3RvcFNlcnZlcjogKGNiKSAtPlxuICAgICAgQFNlcnZlci5zdG9wIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICAgIGlmIGVycj9cbiAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIEVycm9yXCIsXCJTZXJ2ZXIgY291bGQgbm90IGJlIHN0b3BwZWQ6ICN7IGVycm9yIH1cIlxuICAgICAgICAgIGNiPyBlcnJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBOb3RpZnkgJ1NlcnZlciBTdG9wcGVkJywgXCJTZXJ2ZXIgU3RvcHBlZFwiXG4gICAgICAgICAgY2I/IG51bGwsIEBTZXJ2ZXIuc3RhdHVzXG5cbiAgcmVzdGFydFNlcnZlcjogLT5cbiAgICBAc3RhcnRTZXJ2ZXIoKVxuXG4gIGNoYW5nZVBvcnQ6ID0+XG4gIGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3Q6ICh1cmwpIC0+XG4gICAgZmlsZVBhdGhSZWdleCA9IC9eKChodHRwW3NdP3xmdHB8Y2hyb21lLWV4dGVuc2lvbnxmaWxlKTpcXC9cXC8pP1xcLz8oW15cXC9cXC5dK1xcLikqPyhbXlxcL1xcLl0rXFwuW146XFwvXFxzXFwuXXsyLDN9KFxcLlteOlxcL1xcc1xcLl3igIzigIt7MiwzfSk/KSg6XFxkKyk/KCR8XFwvKShbXiM/XFxzXSspPyguKj8pPygjW1xcd1xcLV0rKT8kL1xuICAgXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIEBkYXRhW0BjdXJyZW50VGFiSWRdPy5tYXBzP1xuXG4gICAgcmVzUGF0aCA9IHVybC5tYXRjaChmaWxlUGF0aFJlZ2V4KT9bOF1cbiAgICBpZiBub3QgcmVzUGF0aD9cbiAgICAgICMgdHJ5IHJlbHBhdGhcbiAgICAgIHJlc1BhdGggPSB1cmxcblxuICAgIHJldHVybiBudWxsIHVubGVzcyByZXNQYXRoP1xuICAgIFxuICAgIGZvciBtYXAgaW4gQGRhdGFbQGN1cnJlbnRUYWJJZF0ubWFwc1xuICAgICAgcmVzUGF0aCA9IHVybC5tYXRjaChuZXcgUmVnRXhwKG1hcC51cmwpKT8gYW5kIG1hcC51cmw/XG5cbiAgICAgIGlmIHJlc1BhdGhcbiAgICAgICAgaWYgcmVmZXJlcj9cbiAgICAgICAgICAjIFRPRE86IHRoaXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZpbGVQYXRoID0gdXJsLnJlcGxhY2UgbmV3IFJlZ0V4cChtYXAudXJsKSwgbWFwLnJlZ2V4UmVwbFxuICAgICAgICBicmVha1xuICAgIHJldHVybiBmaWxlUGF0aFxuXG4gIFVSTHRvTG9jYWxQYXRoOiAodXJsLCBjYikgLT5cbiAgICBmaWxlUGF0aCA9IEBSZWRpcmVjdC5nZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0IHVybFxuXG4gIGdldEZpbGVNYXRjaDogKGZpbGVQYXRoLCBjYikgLT5cbiAgICByZXR1cm4gY2I/ICdmaWxlIG5vdCBmb3VuZCcgdW5sZXNzIGZpbGVQYXRoP1xuICAgIHNob3cgJ3RyeWluZyAnICsgZmlsZVBhdGhcbiAgICBAZmluZEZpbGVGb3JQYXRoIEBkYXRhLmRpcmVjdG9yaWVzLCBmaWxlUGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXJlY3RvcnkpID0+XG5cbiAgICAgIGlmIGVycj8gXG4gICAgICAgICMgc2hvdyAnbm8gZmlsZXMgZm91bmQgZm9yICcgKyBmaWxlUGF0aFxuICAgICAgICByZXR1cm4gY2I/IGVyclxuXG4gICAgICBkZWxldGUgZmlsZUVudHJ5LmVudHJ5XG4gICAgICBAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXNbZmlsZVBhdGhdID0gXG4gICAgICAgIGZpbGVFbnRyeTogY2hyb21lLmZpbGVTeXN0ZW0ucmV0YWluRW50cnkgZmlsZUVudHJ5XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aFxuICAgICAgICBkaXJlY3Rvcnk6IGRpcmVjdG9yeVxuICAgICAgY2I/IG51bGwsIEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlc1tmaWxlUGF0aF0sIGRpcmVjdG9yeVxuICAgICAgXG5cblxuICBmaW5kRmlsZUluRGlyZWN0b3JpZXM6IChkaXJlY3RvcmllcywgcGF0aCwgY2IpIC0+XG4gICAgbXlEaXJzID0gZGlyZWN0b3JpZXMuc2xpY2UoKSBcbiAgICBfcGF0aCA9IHBhdGhcbiAgICBfZGlyID0gbXlEaXJzLnNoaWZ0KClcblxuICAgIEBGUy5nZXRMb2NhbEZpbGVFbnRyeSBfZGlyLCBfcGF0aCwgKGVyciwgZmlsZUVudHJ5KSA9PlxuICAgICAgaWYgZXJyP1xuICAgICAgICBpZiBteURpcnMubGVuZ3RoID4gMFxuICAgICAgICAgIEBmaW5kRmlsZUluRGlyZWN0b3JpZXMgbXlEaXJzLCBfcGF0aCwgY2JcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNiPyAnbm90IGZvdW5kJ1xuICAgICAgZWxzZVxuICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBfZGlyXG5cbiAgZmluZEZpbGVGb3JQYXRoOiAoZGlycywgcGF0aCwgY2IpIC0+XG4gICAgQGZpbmRGaWxlSW5EaXJlY3RvcmllcyBkaXJzLCBwYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcmVjdG9yeSkgPT5cbiAgICAgIGlmIGVycj9cbiAgICAgICAgaWYgcGF0aCBpcyBwYXRoLnJlcGxhY2UoLy4qP1xcLy8sICcnKVxuICAgICAgICAgIGNiPyAnbm90IGZvdW5kJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQGZpbmRGaWxlRm9yUGF0aCBkaXJzLCBwYXRoLnJlcGxhY2UoLy4qP1xcLy8sICcnKSwgY2JcbiAgICAgIGVsc2VcbiAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZGlyZWN0b3J5XG4gIFxuICBtYXBBbGxSZXNvdXJjZXM6IChjYikgLT5cbiAgICBAZ2V0UmVzb3VyY2VzID0+XG4gICAgICBuZWVkID0gQGRhdGEuY3VycmVudFJlc291cmNlcy5sZW5ndGhcbiAgICAgIGZvdW5kID0gbm90Rm91bmQgPSAwXG4gICAgICBmb3IgaXRlbSBpbiBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG4gICAgICAgIGxvY2FsUGF0aCA9IEBVUkx0b0xvY2FsUGF0aCBpdGVtLnVybFxuICAgICAgICBpZiBsb2NhbFBhdGg/XG4gICAgICAgICAgQGdldEZpbGVNYXRjaCBsb2NhbFBhdGgsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICAgICAgICBuZWVkLS1cbiAgICAgICAgICAgIHNob3cgYXJndW1lbnRzXG4gICAgICAgICAgICBpZiBlcnI/IHRoZW4gbm90Rm91bmQrK1xuICAgICAgICAgICAgZWxzZSBmb3VuZCsrICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIGlmIG5lZWQgaXMgMFxuICAgICAgICAgICAgICBpZiBmb3VuZCA+IDBcbiAgICAgICAgICAgICAgICBjYj8gbnVsbCwgJ2RvbmUnXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjYj8gJ25vdGhpbmcgZm91bmQnXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIG5lZWQtLVxuICAgICAgICAgIG5vdEZvdW5kKytcbiAgICAgICAgICBpZiBuZWVkIGlzIDBcbiAgICAgICAgICAgIGNiPyAnbm90aGluZyBmb3VuZCdcblxuICBzZXRCYWRnZVRleHQ6ICh0ZXh0LCB0YWJJZCkgLT5cbiAgICBiYWRnZVRleHQgPSB0ZXh0IHx8ICcnICsgT2JqZWN0LmtleXMoQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzKS5sZW5ndGhcbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQgXG4gICAgICB0ZXh0OmJhZGdlVGV4dFxuICAgICAgIyB0YWJJZDp0YWJJZFxuICBcbiAgcmVtb3ZlQmFkZ2VUZXh0Oih0YWJJZCkgLT5cbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQgXG4gICAgICB0ZXh0OicnXG4gICAgICAjIHRhYklkOnRhYklkXG5cbiAgbHNSOiAoZGlyLCBvbnN1Y2Nlc3MsIG9uZXJyb3IpIC0+XG4gICAgQHJlc3VsdHMgPSB7fVxuXG4gICAgY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoZGlyRW50cnkpID0+XG4gICAgICBcbiAgICAgIHRvZG8gPSAwXG4gICAgICBpZ25vcmUgPSAvLmdpdHwuaWRlYXxub2RlX21vZHVsZXN8Ym93ZXJfY29tcG9uZW50cy9cbiAgICAgIGRpdmUgPSAoZGlyLCByZXN1bHRzKSAtPlxuICAgICAgICB0b2RvKytcbiAgICAgICAgcmVhZGVyID0gZGlyLmNyZWF0ZVJlYWRlcigpXG4gICAgICAgIHJlYWRlci5yZWFkRW50cmllcyAoZW50cmllcykgLT5cbiAgICAgICAgICB0b2RvLS1cbiAgICAgICAgICBmb3IgZW50cnkgaW4gZW50cmllc1xuICAgICAgICAgICAgZG8gKGVudHJ5KSAtPlxuICAgICAgICAgICAgICByZXN1bHRzW2VudHJ5LmZ1bGxQYXRoXSA9IGVudHJ5XG4gICAgICAgICAgICAgIGlmIGVudHJ5LmZ1bGxQYXRoLm1hdGNoKGlnbm9yZSkgaXMgbnVsbFxuICAgICAgICAgICAgICAgIGlmIGVudHJ5LmlzRGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICB0b2RvKytcbiAgICAgICAgICAgICAgICAgIGRpdmUgZW50cnksIHJlc3VsdHMgXG4gICAgICAgICAgICAgICMgc2hvdyBlbnRyeVxuICAgICAgICAgIHNob3cgJ29uc3VjY2VzcycgaWYgdG9kbyBpcyAwXG4gICAgICAgICAgIyBzaG93ICdvbnN1Y2Nlc3MnIHJlc3VsdHMgaWYgdG9kbyBpcyAwXG4gICAgICAgICwoZXJyb3IpIC0+XG4gICAgICAgICAgdG9kby0tXG4gICAgICAgICAgIyBzaG93IGVycm9yXG4gICAgICAgICAgIyBvbmVycm9yIGVycm9yLCByZXN1bHRzIGlmIHRvZG8gaXMgMCBcblxuICAgICAgY29uc29sZS5sb2cgZGl2ZSBkaXJFbnRyeSwgQHJlc3VsdHMgIFxuXG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb25cblxuXG4iLCJjbGFzcyBDb25maWdcbiAgIyBBUFBfSUQ6ICdjZWNpZmFmcGhlZ2hvZnBmZGtoZWtraWJjaWJoZ2ZlYydcbiAgIyBFWFRFTlNJT05fSUQ6ICdkZGRpbWJuamliamNhZmJva25iZ2hlaGJmYWpnZ2dlcCdcbiAgQVBQX0lEOiAnZGVuZWZkb29mbmtnam1wYmZwa25paHBnZGhhaHBibGgnXG4gIEVYVEVOU0lPTl9JRDogJ2lqY2ptcGVqb25taW1vb2ZiY3BhbGllamhpa2Flb21oJyAgXG4gIFNFTEZfSUQ6IGNocm9tZS5ydW50aW1lLmlkXG4gIGlzQ29udGVudFNjcmlwdDogbG9jYXRpb24ucHJvdG9jb2wgaXNudCAnY2hyb21lLWV4dGVuc2lvbjonXG4gIEVYVF9JRDogbnVsbFxuICBFWFRfVFlQRTogbnVsbFxuICBcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgQEVYVF9JRCA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiBARVhURU5TSU9OX0lEIGVsc2UgQEFQUF9JRFxuICAgIEBFWFRfVFlQRSA9IGlmIEBBUFBfSUQgaXMgQFNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG4gICAgQFNFTEZfVFlQRSA9IGlmIEBBUFBfSUQgaXNudCBAU0VMRl9JRCB0aGVuICdFWFRFTlNJT04nIGVsc2UgJ0FQUCdcblxuICB3cmFwSW5ib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgICBfa2xhcyA9IG9ialxuICAgICAgQExJU1RFTi5FeHQgZm5hbWUsIChhcmdzKSAtPlxuICAgICAgICBpZiBhcmdzPy5pc1Byb3h5P1xuICAgICAgICAgIGlmIHR5cGVvZiBhcmd1bWVudHNbMV0gaXMgXCJmdW5jdGlvblwiXG4gICAgICAgICAgICBpZiBhcmdzLmFyZ3VtZW50cz8ubGVuZ3RoID49IDBcbiAgICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIGFyZ3MuYXJndW1lbnRzLmNvbmNhdCBhcmd1bWVudHNbMV0gXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBbXS5jb25jYXQgYXJndW1lbnRzWzFdXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgYXJndW1lbnRzXG5cbiAgICAgICAgIyBhcmdzID0gW11cbiAgICAgICAgIyBpZiBhcmdzLmFyZ3VtZW50cz8ubGVuZ3RoIGlzIDBcbiAgICAgICAgIyAgIGFyZ3MucHVzaCBudWxsXG4gICAgICAgICMgZWxzZVxuICAgICAgICAjICAgYXJncyA9IF9hcmd1bWVudHNcbiAgICAgICAgIyBfYXJncyA9IGFyZ3NbMF0/LnB1c2goYXJnc1sxXSlcbiAgICAgICAgI2YuYXBwbHkgX2tsYXMsIGFyZ3NcblxuICB3cmFwT2JqSW5ib3VuZDogKG9iaikgLT5cbiAgICAob2JqW2tleV0gPSBAd3JhcEluYm91bmQgb2JqLCBvYmouY29uc3RydWN0b3IubmFtZSArICcuJyArIGtleSwgb2JqW2tleV0pIGZvciBrZXkgb2Ygb2JqIHdoZW4gdHlwZW9mIG9ialtrZXldIGlzIFwiZnVuY3Rpb25cIlxuICAgIG9ialxuXG4gIHdyYXBPdXRib3VuZDogKG9iaiwgZm5hbWUsIGYpIC0+XG4gICAgLT5cbiAgICAgIG1zZyA9IHt9XG4gICAgICBtc2dbZm5hbWVdID0gXG4gICAgICAgIGlzUHJveHk6dHJ1ZVxuICAgICAgICBhcmd1bWVudHM6QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG4gICAgICBtc2dbZm5hbWVdLmlzUHJveHkgPSB0cnVlXG4gICAgICBfYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuXG4gICAgICBpZiBfYXJncy5sZW5ndGggaXMgMFxuICAgICAgICBtc2dbZm5hbWVdLmFyZ3VtZW50cyA9IHVuZGVmaW5lZCBcbiAgICAgICAgcmV0dXJuIEBNU0cuRXh0IG1zZywgKCkgLT4gdW5kZWZpbmVkXG5cbiAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzID0gX2FyZ3NcblxuICAgICAgY2FsbGJhY2sgPSBtc2dbZm5hbWVdLmFyZ3VtZW50cy5wb3AoKVxuICAgICAgaWYgdHlwZW9mIGNhbGxiYWNrIGlzbnQgXCJmdW5jdGlvblwiXG4gICAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzLnB1c2ggY2FsbGJhY2tcbiAgICAgICAgQE1TRy5FeHQgbXNnLCAoKSAtPiB1bmRlZmluZWRcbiAgICAgIGVsc2VcbiAgICAgICAgQE1TRy5FeHQgbXNnLCAoKSA9PlxuICAgICAgICAgIGFyZ3ogPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcbiAgICAgICAgICAjIHByb3h5QXJncyA9IFtpc1Byb3h5OmFyZ3pdXG4gICAgICAgICAgaWYgYXJnej8ubGVuZ3RoID4gMCBhbmQgYXJnelswXT8uaXNQcm94eT9cbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5IEAsIGFyZ3pbMF0uaXNQcm94eSBcblxuICB3cmFwT2JqT3V0Ym91bmQ6IChvYmopIC0+XG4gICAgKG9ialtrZXldID0gQHdyYXBPdXRib3VuZCBvYmosIG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsga2V5LCBvYmpba2V5XSkgZm9yIGtleSBvZiBvYmogd2hlbiB0eXBlb2Ygb2JqW2tleV0gaXMgXCJmdW5jdGlvblwiXG4gICAgb2JqXG5cbm1vZHVsZS5leHBvcnRzID0gQ29uZmlnIiwiZ2V0R2xvYmFsID0gLT5cbiAgX2dldEdsb2JhbCA9IC0+XG4gICAgdGhpc1xuXG4gIF9nZXRHbG9iYWwoKVxuXG5yb290ID0gZ2V0R2xvYmFsKClcblxuIyByb290LmFwcCA9IGFwcCA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG4jIGFwcCA9IG5ldyBsaWIuQXBwbGljYXRpb25cbmNocm9tZS5icm93c2VyQWN0aW9uLnNldFBvcHVwIHBvcHVwOlwicG9wdXAuaHRtbFwiXG5cblxuXG5BcHBsaWNhdGlvbiA9IHJlcXVpcmUgJy4uLy4uL2NvbW1vbi5jb2ZmZWUnXG5SZWRpcmVjdCA9IHJlcXVpcmUgJy4uLy4uL3JlZGlyZWN0LmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuLi8uLi9zdG9yYWdlLmNvZmZlZSdcbkZpbGVTeXN0ZW0gPSByZXF1aXJlICcuLi8uLi9maWxlc3lzdGVtLmNvZmZlZSdcblNlcnZlciA9IHJlcXVpcmUgJy4uLy4uL3NlcnZlci5jb2ZmZWUnXG5cbnJlZGlyID0gbmV3IFJlZGlyZWN0XG5cbmFwcCA9IHJvb3QuYXBwID0gbmV3IEFwcGxpY2F0aW9uXG4gIFJlZGlyZWN0OiByZWRpclxuICBTdG9yYWdlOiBTdG9yYWdlXG4gIEZTOiBGaWxlU3lzdGVtXG4gIFNlcnZlcjogU2VydmVyXG4gIFxuYXBwLlN0b3JhZ2UucmV0cmlldmVBbGwobnVsbClcbiMgICBhcHAuU3RvcmFnZS5kYXRhW2tdID0gZGF0YVtrXSBmb3IgayBvZiBkYXRhXG4gIFxuY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyICh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSA9PlxuICAjIGlmIHJlZGlyLmRhdGFbdGFiSWRdPy5pc09uXG4gICMgICBhcHAubWFwQWxsUmVzb3VyY2VzICgpID0+XG4gICMgICAgIGNocm9tZS50YWJzLnNldEJhZGdlVGV4dCBcbiAgIyAgICAgICB0ZXh0Ok9iamVjdC5rZXlzKGFwcC5jdXJyZW50RmlsZU1hdGNoZXMpLmxlbmd0aFxuICAjICAgICAgIHRhYklkOnRhYklkXG4gICAgIFxuXG5cbiIsIkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcblxuY2xhc3MgRmlsZVN5c3RlbVxuICBhcGk6IGNocm9tZS5maWxlU3lzdGVtXG4gIHJldGFpbmVkRGlyczoge31cbiAgTElTVEVOOiBMSVNURU4uZ2V0KCkgXG4gIE1TRzogTVNHLmdldCgpXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuXG4gICMgQGRpcnM6IG5ldyBEaXJlY3RvcnlTdG9yZVxuICAjIGZpbGVUb0FycmF5QnVmZmVyOiAoYmxvYiwgb25sb2FkLCBvbmVycm9yKSAtPlxuICAjICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAjICAgcmVhZGVyLm9ubG9hZCA9IG9ubG9hZFxuXG4gICMgICByZWFkZXIub25lcnJvciA9IG9uZXJyb3JcblxuICAjICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyIGJsb2JcblxuICByZWFkRmlsZTogKGRpckVudHJ5LCBwYXRoLCBjYikgLT5cbiAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBwYXRoLFxuICAgICAgKGVyciwgZmlsZUVudHJ5KSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgZXJyPyB0aGVuIHJldHVybiBjYj8gZXJyXG5cbiAgICAgICAgZmlsZUVudHJ5LmZpbGUgKGZpbGUpID0+XG4gICAgICAgICAgY2I/IG51bGwsIGZpbGVFbnRyeSwgZmlsZVxuICAgICAgICAsKGVycikgPT4gY2I/IGVyclxuXG4gIGdldEZpbGVFbnRyeTogKGRpckVudHJ5LCBwYXRoLCBjYikgLT5cbiAgICAgIGRpckVudHJ5LmdldEZpbGUgcGF0aCwge30sIChmaWxlRW50cnkpID0+XG4gICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnlcbiAgICAgICwoZXJyKSA9PiBjYj8gZXJyXG5cbiAgIyBvcGVuRGlyZWN0b3J5OiAoY2FsbGJhY2spIC0+XG4gIG9wZW5EaXJlY3Rvcnk6IChkaXJlY3RvcnlFbnRyeSwgY2IpIC0+XG4gICMgQGFwaS5jaG9vc2VFbnRyeSB0eXBlOidvcGVuRGlyZWN0b3J5JywgKGRpcmVjdG9yeUVudHJ5LCBmaWxlcykgPT5cbiAgICBAYXBpLmdldERpc3BsYXlQYXRoIGRpcmVjdG9yeUVudHJ5LCAocGF0aE5hbWUpID0+XG4gICAgICBkaXIgPVxuICAgICAgICAgIHJlbFBhdGg6IGRpcmVjdG9yeUVudHJ5LmZ1bGxQYXRoICMucmVwbGFjZSgnLycgKyBkaXJlY3RvcnlFbnRyeS5uYW1lLCAnJylcbiAgICAgICAgICBkaXJlY3RvcnlFbnRyeUlkOiBAYXBpLnJldGFpbkVudHJ5KGRpcmVjdG9yeUVudHJ5KVxuICAgICAgICAgIGVudHJ5OiBkaXJlY3RvcnlFbnRyeVxuICAgICAgY2I/IG51bGwsIHBhdGhOYW1lLCBkaXJcbiAgICAgICAgICAjIEBnZXRPbmVEaXJMaXN0IGRpclxuICAgICAgICAgICMgU3RvcmFnZS5zYXZlICdkaXJlY3RvcmllcycsIEBzY29wZS5kaXJlY3RvcmllcyAocmVzdWx0KSAtPlxuXG4gIGdldExvY2FsRmlsZUVudHJ5OiAoZGlyLCBmaWxlUGF0aCwgY2IpID0+IFxuICAgIGRpckVudHJ5ID0gY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoKSAtPlxuICAgIGlmIG5vdCBkaXJFbnRyeT9cbiAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBmaWxlUGF0aCwgY2JcbiAgICBlbHNlXG4gICAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBmaWxlUGF0aCwgY2JcblxuXG5cbiAgIyBnZXRMb2NhbEZpbGU6IChkaXIsIGZpbGVQYXRoLCBjYiwgZXJyb3IpID0+IFxuICAjICMgaWYgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0/XG4gICMgIyAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiAgIyAjICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAjICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICMgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICMgICAgICwoX2Vycm9yKSA9PiBlcnJvcihfZXJyb3IpXG4gICMgIyBlbHNlXG4gICMgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgIyAgICAgIyBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICMgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICBpZiBlcnI/IHRoZW4gY2I/IGVyclxuICAjICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGZpbGVcbiAgIyAgICwoX2Vycm9yKSA9PiBjYj8oX2Vycm9yKVxuXG4gICAgICAjIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBzdWNjZXNzLFxuICAgICAgIyAgICAgKGVycikgPT5cbiAgICAgICMgICAgICAgICBAZmluZEZpbGVGb3JQYXRoIGluZm8sIGNiXG5cbiAgIyBmaW5kRmlsZUZvclBhdGg6IChpbmZvLCBjYikgPT5cbiAgIyAgICAgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIGNiLCBpbmZvLnJlZmVyZXJcblxuICAjIGZpbmRGaWxlRm9yUXVlcnlTdHJpbmc6IChfdXJsLCBjYiwgZXJyb3IsIHJlZmVyZXIpID0+XG4gICMgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudChfdXJsKS5yZXBsYWNlIC8uKj9zbHJlZGlyXFw9LywgJydcblxuICAjICAgICBtYXRjaCA9IGl0ZW0gZm9yIGl0ZW0gaW4gQG1hcHMgd2hlbiB1cmwubWF0Y2gobmV3IFJlZ0V4cChpdGVtLnVybCkpPyBhbmQgaXRlbS51cmw/IGFuZCBub3QgbWF0Y2g/XG5cbiAgIyAgICAgaWYgbWF0Y2g/XG4gICMgICAgICAgICBpZiByZWZlcmVyP1xuICAjICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLm1hdGNoKC8uKlxcL1xcLy4qP1xcLyguKikvKT9bMV1cbiAgIyAgICAgICAgIGVsc2VcbiAgIyAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWF0Y2gudXJsKSwgbWF0Y2gucmVnZXhSZXBsXG5cbiAgIyAgICAgICAgIGZpbGVQYXRoLnJlcGxhY2UgJy8nLCAnXFxcXCcgaWYgcGxhdGZvcm0gaXMgJ3dpbidcblxuICAjICAgICAgICAgZGlyID0gQFN0b3JhZ2UuZGF0YS5kaXJlY3Rvcmllc1ttYXRjaC5kaXJlY3RvcnldXG5cbiAgIyAgICAgICAgIGlmIG5vdCBkaXI/IHRoZW4gcmV0dXJuIGVyciAnbm8gbWF0Y2gnXG5cbiAgIyAgICAgICAgIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAjICAgICAgICAgICAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiAgIyAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICAgICAgZWxzZVxuICAjICAgICAgICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAjICAgICAgICAgICAgICAgICBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICMgICAgICAgICAgICAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgICAgICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgICAgICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgZWxzZVxuICAjICAgICAgICAgZXJyb3IoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVTeXN0ZW0iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIExJU1RFTiBleHRlbmRzIENvbmZpZ1xuICBsb2NhbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZVxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgZXh0ZXJuYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbFxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgaW5zdGFuY2UgPSBudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgXG4gICAgY2hyb21lLnJ1bnRpbWUub25Db25uZWN0RXh0ZXJuYWwuYWRkTGlzdGVuZXIgKHBvcnQpID0+XG4gICAgICBwb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lciBAX29uTWVzc2FnZUV4dGVybmFsXG5cbiAgICBAbG9jYWwuYXBpLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlXG4gICAgQGV4dGVybmFsLmFwaT8uYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IExJU1RFTlxuXG4gIExvY2FsOiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgQGxvY2FsLmxpc3RlbmVyc1ttZXNzYWdlXSA9IGNhbGxiYWNrXG5cbiAgRXh0OiAobWVzc2FnZSwgY2FsbGJhY2spID0+XG4gICAgIyBzaG93ICdhZGRpbmcgZXh0IGxpc3RlbmVyIGZvciAnICsgbWVzc2FnZVxuICAgIEBleHRlcm5hbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIF9vbk1lc3NhZ2VFeHRlcm5hbDogKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PlxuICAgIHJlc3BvbnNlU3RhdHVzID0gY2FsbGVkOmZhbHNlXG5cbiAgICBfc2VuZFJlc3BvbnNlID0gKHdoYXRldmVyLi4uKSA9PlxuICAgICAgdHJ5XG4gICAgICAgICMgd2hhdGV2ZXIuc2hpZnQoKSBpZiB3aGF0ZXZlclswXSBpcyBudWxsIGFuZCB3aGF0ZXZlclsxXT9cbiAgICAgICAgc2VuZFJlc3BvbnNlLmFwcGx5IG51bGwscHJveHlBcmdzID0gW2lzUHJveHk6d2hhdGV2ZXJdXG5cbiAgICAgIGNhdGNoIGVcbiAgICAgICAgdW5kZWZpbmVkICMgZXJyb3IgYmVjYXVzZSBubyByZXNwb25zZSB3YXMgcmVxdWVzdGVkIGZyb20gdGhlIE1TRywgZG9uJ3QgY2FyZVxuICAgICAgcmVzcG9uc2VTdGF0dXMuY2FsbGVkID0gdHJ1ZVxuICAgICAgXG4gICAgIyAoc2hvdyBcIjw9PSBHT1QgRVhURVJOQUwgTUVTU0FHRSA9PSAjeyBARVhUX1RZUEUgfSA9PVwiICsgX2tleSkgZm9yIF9rZXkgb2YgcmVxdWVzdFxuICAgIGlmIHNlbmRlci5pZCBpc250IEBFWFRfSUQgYW5kIHNlbmRlci5jb25zdHJ1Y3Rvci5uYW1lIGlzbnQgJ1BvcnQnXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIEBleHRlcm5hbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBfc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuICAgIFxuICAgIHVubGVzcyByZXNwb25zZVN0YXR1cy5jYWxsZWQgIyBmb3Igc3luY2hyb25vdXMgc2VuZFJlc3BvbnNlXG4gICAgICAjIHNob3cgJ3JldHVybmluZyB0cnVlJ1xuICAgICAgcmV0dXJuIHRydWVcblxuICBfb25NZXNzYWdlOiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+XG4gICAgcmVzcG9uc2VTdGF0dXMgPSBjYWxsZWQ6ZmFsc2VcbiAgICBfc2VuZFJlc3BvbnNlID0gPT5cbiAgICAgIHRyeVxuICAgICAgICAjIHNob3cgJ2NhbGxpbmcgc2VuZHJlc3BvbnNlJ1xuICAgICAgICBzZW5kUmVzcG9uc2UuYXBwbHkgdGhpcyxhcmd1bWVudHNcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgIyBzaG93IGVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcblxuICAgICMgKHNob3cgXCI8PT0gR09UIE1FU1NBR0UgPT0gI3sgQEVYVF9UWVBFIH0gPT1cIiArIF9rZXkpIGZvciBfa2V5IG9mIHJlcXVlc3RcbiAgICBAbG9jYWwubGlzdGVuZXJzW2tleV0/IHJlcXVlc3Rba2V5XSwgX3NlbmRSZXNwb25zZSBmb3Iga2V5IG9mIHJlcXVlc3RcblxuICAgIHVubGVzcyByZXNwb25zZVN0YXR1cy5jYWxsZWRcbiAgICAgICMgc2hvdyAncmV0dXJuaW5nIHRydWUnXG4gICAgICByZXR1cm4gdHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IExJU1RFTiIsIkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcblxuY2xhc3MgTVNHIGV4dGVuZHMgQ29uZmlnXG4gIGluc3RhbmNlID0gbnVsbFxuICBwb3J0Om51bGxcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBAcG9ydCA9IGNocm9tZS5ydW50aW1lLmNvbm5lY3QgQEVYVF9JRCBcblxuICBAZ2V0OiAoKSAtPlxuICAgIGluc3RhbmNlID89IG5ldyBNU0dcblxuICBAY3JlYXRlUG9ydDogKCkgLT5cblxuXG4gIExvY2FsOiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICAoc2hvdyBcIj09IE1FU1NBR0UgI3sgX2tleSB9ID09PlwiKSBmb3IgX2tleSBvZiBtZXNzYWdlXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgbWVzc2FnZSwgcmVzcG9uZFxuICBFeHQ6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIChzaG93IFwiPT0gTUVTU0FHRSBFWFRFUk5BTCAjeyBfa2V5IH0gPT0+XCIpIGZvciBfa2V5IG9mIG1lc3NhZ2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBARVhUX0lELCBtZXNzYWdlLCByZXNwb25kXG4gIEV4dFBvcnQ6IChtZXNzYWdlKSAtPlxuICAgIHRyeVxuICAgICAgQHBvcnQucG9zdE1lc3NhZ2UgbWVzc2FnZVxuICAgIGNhdGNoXG4gICAgICBAcG9ydCA9IGNocm9tZS5ydW50aW1lLmNvbm5lY3QgQEVYVF9JRCBcbiAgICAgIEBwb3J0LnBvc3RNZXNzYWdlIG1lc3NhZ2VcblxubW9kdWxlLmV4cG9ydHMgPSBNU0ciLCIvKipcbiAqIERFVkVMT1BFRCBCWVxuICogR0lMIExPUEVTIEJVRU5PXG4gKiBnaWxidWVuby5tYWlsQGdtYWlsLmNvbVxuICpcbiAqIFdPUktTIFdJVEg6XG4gKiBJRSA5KywgRkYgNCssIFNGIDUrLCBXZWJLaXQsIENIIDcrLCBPUCAxMissIEJFU0VOLCBSaGlubyAxLjcrXG4gKlxuICogRk9SSzpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWxhbmtlL1dhdGNoLkpTXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAgICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb21lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAgICAgLy8gbGlrZSBOb2RlLlxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICAgICAgd2luZG93LldhdGNoSlMgPSBmYWN0b3J5KCk7XG4gICAgICAgIHdpbmRvdy53YXRjaCA9IHdpbmRvdy5XYXRjaEpTLndhdGNoO1xuICAgICAgICB3aW5kb3cudW53YXRjaCA9IHdpbmRvdy5XYXRjaEpTLnVud2F0Y2g7XG4gICAgICAgIHdpbmRvdy5jYWxsV2F0Y2hlcnMgPSB3aW5kb3cuV2F0Y2hKUy5jYWxsV2F0Y2hlcnM7XG4gICAgfVxufShmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgV2F0Y2hKUyA9IHtcbiAgICAgICAgbm9Nb3JlOiBmYWxzZVxuICAgIH0sXG4gICAgbGVuZ3Roc3ViamVjdHMgPSBbXTtcblxuICAgIHZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKGZ1bmN0aW9uVG9DaGVjaykge1xuICAgICAgICAgICAgdmFyIGdldFR5cGUgPSB7fTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvblRvQ2hlY2sgJiYgZ2V0VHlwZS50b1N0cmluZy5jYWxsKGZ1bmN0aW9uVG9DaGVjaykgPT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9O1xuXG4gICAgdmFyIGlzSW50ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIHggJSAxID09PSAwO1xuICAgIH07XG5cbiAgICB2YXIgaXNBcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIHZhciBnZXRPYmpEaWZmID0gZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHZhciBhcGx1cyA9IFtdLFxuICAgICAgICBicGx1cyA9IFtdO1xuXG4gICAgICAgIGlmKCEodHlwZW9mIGEgPT0gXCJzdHJpbmdcIikgJiYgISh0eXBlb2YgYiA9PSBcInN0cmluZ1wiKSl7XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KGEpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJbaV0gPT09IHVuZGVmaW5lZCkgYXBsdXMucHVzaChpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBhKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGEuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGJbaV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwbHVzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KGIpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaj0wOyBqPGIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFbal0gPT09IHVuZGVmaW5lZCkgYnBsdXMucHVzaChqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaiBpbiBiKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGIuaGFzT3duUHJvcGVydHkoaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFbal0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJwbHVzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWRkZWQ6IGFwbHVzLFxuICAgICAgICAgICAgcmVtb3ZlZDogYnBsdXNcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY2xvbmUgPSBmdW5jdGlvbihvYmope1xuXG4gICAgICAgIGlmIChudWxsID09IG9iaiB8fCBcIm9iamVjdFwiICE9IHR5cGVvZiBvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29weSA9IG9iai5jb25zdHJ1Y3RvcigpO1xuXG4gICAgICAgIGZvciAodmFyIGF0dHIgaW4gb2JqKSB7XG4gICAgICAgICAgICBjb3B5W2F0dHJdID0gb2JqW2F0dHJdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvcHk7XG5cbiAgICB9XG5cbiAgICB2YXIgZGVmaW5lR2V0QW5kU2V0ID0gZnVuY3Rpb24gKG9iaiwgcHJvcE5hbWUsIGdldHRlciwgc2V0dGVyKSB7XG4gICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgIE9iamVjdC5vYnNlcnZlKG9ialtwcm9wTmFtZV0sIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgIHNldHRlcihkYXRhKTsgLy9UT0RPOiBhZGFwdCBvdXIgY2FsbGJhY2sgZGF0YSB0byBtYXRjaCBPYmplY3Qub2JzZXJ2ZSBkYXRhIHNwZWNcbiAgICAgICAgICAgIH0pOyBcblxuICAgICAgICB9IGNhdGNoKGUpIHtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcE5hbWUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXQ6IGdldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXQ6IHNldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2goZTIpIHtcbiAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVHZXR0ZXJfXy5jYWxsKG9iaiwgcHJvcE5hbWUsIGdldHRlcik7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVTZXR0ZXJfXy5jYWxsKG9iaiwgcHJvcE5hbWUsIHNldHRlcik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlMykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ3YXRjaEpTIGVycm9yOiBicm93c2VyIG5vdCBzdXBwb3J0ZWQgOi9cIilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZGVmaW5lUHJvcCA9IGZ1bmN0aW9uIChvYmosIHByb3BOYW1lLCB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcE5hbWUsIHtcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIG9ialtwcm9wTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgd2F0Y2ggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24oYXJndW1lbnRzWzFdKSkge1xuICAgICAgICAgICAgd2F0Y2hBbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHdhdGNoTWFueS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2F0Y2hPbmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgdmFyIHdhdGNoQWxsID0gZnVuY3Rpb24gKG9iaiwgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpIHtcblxuICAgICAgICBpZiAoKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9wcyA9IFtdO1xuXG5cbiAgICAgICAgaWYoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wID0gMDsgcHJvcCA8IG9iai5sZW5ndGg7IHByb3ArKykgeyAvL2ZvciBlYWNoIGl0ZW0gaWYgb2JqIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBvYmopIHsgLy9mb3IgZWFjaCBhdHRyaWJ1dGUgaWYgb2JqIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcDIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2gocHJvcDIpOyAvL3B1dCBpbiB0aGUgcHJvcHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB3YXRjaE1hbnkob2JqLCBwcm9wcywgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpOyAvL3dhdGNoIGFsbCBpdGVtcyBvZiB0aGUgcHJvcHNcblxuICAgICAgICBpZiAoYWRkTlJlbW92ZSkge1xuICAgICAgICAgICAgcHVzaFRvTGVuZ3RoU3ViamVjdHMob2JqLCBcIiQkd2F0Y2hsZW5ndGhzdWJqZWN0cm9vdFwiLCB3YXRjaGVyLCBsZXZlbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICB2YXIgd2F0Y2hNYW55ID0gZnVuY3Rpb24gKG9iaiwgcHJvcHMsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKSB7XG5cbiAgICAgICAgaWYgKCh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8cHJvcHMubGVuZ3RoOyBpKyspIHsgLy93YXRjaCBlYWNoIHByb3BlcnR5XG4gICAgICAgICAgICB2YXIgcHJvcCA9IHByb3BzW2ldO1xuICAgICAgICAgICAgd2F0Y2hPbmUob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgd2F0Y2hPbmUgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCkge1xuXG4gICAgICAgIGlmICgodHlwZW9mIG9iaiA9PSBcInN0cmluZ1wiKSB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoaXNGdW5jdGlvbihvYmpbcHJvcF0pKSB7IC8vZG9udCB3YXRjaCBpZiBpdCBpcyBhIGZ1bmN0aW9uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZihvYmpbcHJvcF0gIT0gbnVsbCAmJiAobGV2ZWwgPT09IHVuZGVmaW5lZCB8fCBsZXZlbCA+IDApKXtcbiAgICAgICAgICAgIHdhdGNoQWxsKG9ialtwcm9wXSwgd2F0Y2hlciwgbGV2ZWwhPT11bmRlZmluZWQ/IGxldmVsLTEgOiBsZXZlbCxudWxsLCBwYXRoICsgJy4nICsgcHJvcCk7IC8vcmVjdXJzaXZlbHkgd2F0Y2ggYWxsIGF0dHJpYnV0ZXMgb2YgdGhpc1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmaW5lV2F0Y2hlcihvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBwYXRoKTtcblxuICAgICAgICBpZihhZGROUmVtb3ZlICYmIChsZXZlbCA9PT0gdW5kZWZpbmVkIHx8IGxldmVsID4gMCkpe1xuICAgICAgICAgICAgcHVzaFRvTGVuZ3RoU3ViamVjdHMob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgdW53YXRjaCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbihhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB1bndhdGNoQWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB1bndhdGNoTWFueS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdW53YXRjaE9uZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHVud2F0Y2hBbGwgPSBmdW5jdGlvbiAob2JqLCB3YXRjaGVyKSB7XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFN0cmluZyB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgdmFyIHByb3BzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wID0gMDsgcHJvcCA8IG9iai5sZW5ndGg7IHByb3ArKykgeyAvL2ZvciBlYWNoIGl0ZW0gaWYgb2JqIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1bndhdGNoTWFueShvYmosIHByb3BzLCB3YXRjaGVyKTsgLy93YXRjaCBhbGwgaXRlbnMgb2YgdGhlIHByb3BzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdW53YXRjaFByb3BzSW5PYmplY3QgPSBmdW5jdGlvbiAob2JqMikge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wcyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AyIGluIG9iajIpIHsgLy9mb3IgZWFjaCBhdHRyaWJ1dGUgaWYgb2JqIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqMi5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmoyW3Byb3AyXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVud2F0Y2hQcm9wc0luT2JqZWN0KG9iajJbcHJvcDJdKTsgLy9yZWN1cnMgaW50byBvYmplY3QgcHJvcHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wMik7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVud2F0Y2hNYW55KG9iajIsIHByb3BzLCB3YXRjaGVyKTsgLy91bndhdGNoIGFsbCBvZiB0aGUgcHJvcHNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB1bndhdGNoUHJvcHNJbk9iamVjdChvYmopO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdmFyIHVud2F0Y2hNYW55ID0gZnVuY3Rpb24gKG9iaiwgcHJvcHMsIHdhdGNoZXIpIHtcblxuICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBwcm9wcykgeyAvL3dhdGNoIGVhY2ggYXR0cmlidXRlIG9mIFwicHJvcHNcIiBpZiBpcyBhbiBvYmplY3RcbiAgICAgICAgICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICB1bndhdGNoT25lKG9iaiwgcHJvcHNbcHJvcDJdLCB3YXRjaGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZGVmaW5lV2F0Y2hlciA9IGZ1bmN0aW9uIChvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBwYXRoKSB7XG5cbiAgICAgICAgdmFyIHZhbCA9IG9ialtwcm9wXTtcblxuICAgICAgICB3YXRjaEZ1bmN0aW9ucyhvYmosIHByb3ApO1xuXG4gICAgICAgIGlmICghb2JqLndhdGNoZXJzKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wKG9iaiwgXCJ3YXRjaGVyc1wiLCB7fSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICghb2JqLl9wYXRoKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wKG9iaiwgXCJfcGF0aFwiLCBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb2JqLndhdGNoZXJzW3Byb3BdKSB7XG4gICAgICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxvYmoud2F0Y2hlcnNbcHJvcF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKG9iai53YXRjaGVyc1twcm9wXVtpXSA9PT0gd2F0Y2hlcil7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0ucHVzaCh3YXRjaGVyKTsgLy9hZGQgdGhlIG5ldyB3YXRjaGVyIGluIHRoZSB3YXRjaGVycyBhcnJheVxuXG5cbiAgICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH07XG5cblxuICAgICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld3ZhbCkge1xuICAgICAgICAgICAgdmFyIG9sZHZhbCA9IHZhbDtcbiAgICAgICAgICAgIHZhbCA9IG5ld3ZhbDtcblxuICAgICAgICAgICAgaWYgKGxldmVsICE9PSAwICYmIG9ialtwcm9wXSl7XG4gICAgICAgICAgICAgICAgLy8gd2F0Y2ggc3ViIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICB3YXRjaEFsbChvYmpbcHJvcF0sIHdhdGNoZXIsIChsZXZlbD09PXVuZGVmaW5lZCk/bGV2ZWw6bGV2ZWwtMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdhdGNoRnVuY3Rpb25zKG9iaiwgcHJvcCk7XG5cbiAgICAgICAgICAgIGlmICghV2F0Y2hKUy5ub01vcmUpe1xuICAgICAgICAgICAgICAgIC8vaWYgKEpTT04uc3RyaW5naWZ5KG9sZHZhbCkgIT09IEpTT04uc3RyaW5naWZ5KG5ld3ZhbCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkdmFsICE9PSBuZXd2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKG9iaiwgcHJvcCwgXCJzZXRcIiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgICAgICAgICBXYXRjaEpTLm5vTW9yZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBkZWZpbmVHZXRBbmRTZXQob2JqLCBwcm9wLCBnZXR0ZXIsIHNldHRlcik7XG5cbiAgICB9O1xuXG4gICAgdmFyIGNhbGxXYXRjaGVycyA9IGZ1bmN0aW9uIChvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpIHtcbiAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yICh2YXIgd3I9MDsgd3I8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgd3IrKykge1xuICAgICAgICAgICAgICAgIG9iai53YXRjaGVyc1twcm9wXVt3cl0uY2FsbChvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHsvL2NhbGwgYWxsXG4gICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBhY3Rpb24sIG5ld3ZhbCwgb2xkdmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQHRvZG8gY29kZSByZWxhdGVkIHRvIFwid2F0Y2hGdW5jdGlvbnNcIiBpcyBjZXJ0YWlubHkgYnVnZ3lcbiAgICB2YXIgbWV0aG9kTmFtZXMgPSBbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzbGljZScsICd1bnNoaWZ0JywgJ3NwbGljZSddO1xuICAgIHZhciBkZWZpbmVBcnJheU1ldGhvZFdhdGNoZXIgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCBvcmlnaW5hbCwgbWV0aG9kTmFtZSkge1xuICAgICAgICBkZWZpbmVQcm9wKG9ialtwcm9wXSwgbWV0aG9kTmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gb3JpZ2luYWwuYXBwbHkob2JqW3Byb3BdLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgd2F0Y2hPbmUob2JqLCBvYmpbcHJvcF0pO1xuICAgICAgICAgICAgaWYgKG1ldGhvZE5hbWUgIT09ICdzbGljZScpIHtcbiAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBtZXRob2ROYW1lLGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgd2F0Y2hGdW5jdGlvbnMgPSBmdW5jdGlvbihvYmosIHByb3ApIHtcblxuICAgICAgICBpZiAoKCFvYmpbcHJvcF0pIHx8IChvYmpbcHJvcF0gaW5zdGFuY2VvZiBTdHJpbmcpIHx8ICghaXNBcnJheShvYmpbcHJvcF0pKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IG1ldGhvZE5hbWVzLmxlbmd0aCwgbWV0aG9kTmFtZTsgaS0tOykge1xuICAgICAgICAgICAgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgICAgICAgZGVmaW5lQXJyYXlNZXRob2RXYXRjaGVyKG9iaiwgcHJvcCwgb2JqW3Byb3BdW21ldGhvZE5hbWVdLCBtZXRob2ROYW1lKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB1bndhdGNoT25lID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgd2F0Y2hlcikge1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdyA9IG9iai53YXRjaGVyc1twcm9wXVtpXTtcblxuICAgICAgICAgICAgaWYodyA9PSB3YXRjaGVyKSB7XG4gICAgICAgICAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbW92ZUZyb21MZW5ndGhTdWJqZWN0cyhvYmosIHByb3AsIHdhdGNoZXIpO1xuICAgIH07XG5cbiAgICB2YXIgbG9vcCA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgZm9yKHZhciBpPTA7IGk8bGVuZ3Roc3ViamVjdHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgdmFyIHN1YmogPSBsZW5ndGhzdWJqZWN0c1tpXTtcblxuICAgICAgICAgICAgaWYgKHN1YmoucHJvcCA9PT0gXCIkJHdhdGNobGVuZ3Roc3ViamVjdHJvb3RcIikge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpZmZlcmVuY2UgPSBnZXRPYmpEaWZmKHN1Ymoub2JqLCBzdWJqLmFjdHVhbCk7XG5cbiAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCB8fCBkaWZmZXJlbmNlLnJlbW92ZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZCAhPSBkaWZmZXJlbmNlLnJlbW92ZWQgJiYgKGRpZmZlcmVuY2UuYWRkZWRbMF0gIT0gZGlmZmVyZW5jZS5yZW1vdmVkWzBdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoTWFueShzdWJqLm9iaiwgZGlmZmVyZW5jZS5hZGRlZCwgc3Viai53YXRjaGVyLCBzdWJqLmxldmVsIC0gMSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Ymoud2F0Y2hlci5jYWxsKHN1Ymoub2JqLCBcInJvb3RcIiwgXCJkaWZmZXJlbnRhdHRyXCIsIGRpZmZlcmVuY2UsIHN1YmouYWN0dWFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWJqLmFjdHVhbCA9IGNsb25lKHN1Ymoub2JqKTtcblxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKHN1Ymoub2JqW3N1YmoucHJvcF0gPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHZhciBkaWZmZXJlbmNlID0gZ2V0T2JqRGlmZihzdWJqLm9ialtzdWJqLnByb3BdLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCB8fCBkaWZmZXJlbmNlLnJlbW92ZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaj0wOyBqPHN1Ymoub2JqLndhdGNoZXJzW3N1YmoucHJvcF0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaE1hbnkoc3Viai5vYmpbc3Viai5wcm9wXSwgZGlmZmVyZW5jZS5hZGRlZCwgc3Viai5vYmoud2F0Y2hlcnNbc3Viai5wcm9wXVtqXSwgc3Viai5sZXZlbCAtIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKHN1Ymoub2JqLCBzdWJqLnByb3AsIFwiZGlmZmVyZW50YXR0clwiLCBkaWZmZXJlbmNlLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3Viai5hY3R1YWwgPSBjbG9uZShzdWJqLm9ialtzdWJqLnByb3BdKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgcHVzaFRvTGVuZ3RoU3ViamVjdHMgPSBmdW5jdGlvbihvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsKXtcbiAgICAgICAgXG4gICAgICAgIHZhciBhY3R1YWw7XG5cbiAgICAgICAgaWYgKHByb3AgPT09IFwiJCR3YXRjaGxlbmd0aHN1YmplY3Ryb290XCIpIHtcbiAgICAgICAgICAgIGFjdHVhbCA9ICBjbG9uZShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWN0dWFsID0gY2xvbmUob2JqW3Byb3BdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxlbmd0aHN1YmplY3RzLnB1c2goe1xuICAgICAgICAgICAgb2JqOiBvYmosXG4gICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgICAgICAgICB3YXRjaGVyOiB3YXRjaGVyLFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgcmVtb3ZlRnJvbUxlbmd0aFN1YmplY3RzID0gZnVuY3Rpb24ob2JqLCBwcm9wLCB3YXRjaGVyKXtcblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8bGVuZ3Roc3ViamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzdWJqID0gbGVuZ3Roc3ViamVjdHNbaV07XG5cbiAgICAgICAgICAgIGlmIChzdWJqLm9iaiA9PSBvYmogJiYgc3Viai5wcm9wID09IHByb3AgJiYgc3Viai53YXRjaGVyID09IHdhdGNoZXIpIHtcbiAgICAgICAgICAgICAgICBsZW5ndGhzdWJqZWN0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBzZXRJbnRlcnZhbChsb29wLCA1MCk7XG5cbiAgICBXYXRjaEpTLndhdGNoID0gd2F0Y2g7XG4gICAgV2F0Y2hKUy51bndhdGNoID0gdW53YXRjaDtcbiAgICBXYXRjaEpTLmNhbGxXYXRjaGVycyA9IGNhbGxXYXRjaGVycztcblxuICAgIHJldHVybiBXYXRjaEpTO1xuXG59KSk7XG4iLCJjbGFzcyBOb3RpZmljYXRpb25cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgc2hvdzogKHRpdGxlLCBtZXNzYWdlKSAtPlxuICAgIHVuaXF1ZUlkID0gKGxlbmd0aD04KSAtPlxuICAgICAgaWQgPSBcIlwiXG4gICAgICBpZCArPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMikgd2hpbGUgaWQubGVuZ3RoIDwgbGVuZ3RoXG4gICAgICBpZC5zdWJzdHIgMCwgbGVuZ3RoXG5cbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUgdW5pcXVlSWQoKSxcbiAgICAgIHR5cGU6J2Jhc2ljJ1xuICAgICAgdGl0bGU6dGl0bGVcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgIGljb25Vcmw6J2ltYWdlcy9pY29uLTM4LnBuZycsXG4gICAgICAoY2FsbGJhY2spIC0+XG4gICAgICAgIHVuZGVmaW5lZFxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGlmaWNhdGlvbiIsImNsYXNzIFJlZGlyZWN0XG4gIGRhdGE6e31cbiAgXG4gIHByZWZpeDpudWxsXG4gIGN1cnJlbnRNYXRjaGVzOnt9XG4gIGN1cnJlbnRUYWJJZDogbnVsbFxuICAjIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI3NzU1XG4gICMgdXJsOiBSZWdFeHBbJyQmJ10sXG4gICMgcHJvdG9jb2w6UmVnRXhwLiQyLFxuICAjIGhvc3Q6UmVnRXhwLiQzLFxuICAjIHBhdGg6UmVnRXhwLiQ0LFxuICAjIGZpbGU6UmVnRXhwLiQ2LCAvLyA4XG4gICMgcXVlcnk6UmVnRXhwLiQ3LFxuICAjIGhhc2g6UmVnRXhwLiQ4XG4gICAgICAgICBcbiAgY29uc3RydWN0b3I6IC0+XG4gIFxuICBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0OiAodXJsKSA9PlxuICAgIGZpbGVQYXRoUmVnZXggPSAvXigoaHR0cFtzXT98ZnRwfGNocm9tZS1leHRlbnNpb258ZmlsZSk6XFwvXFwvKT9cXC8/KFteXFwvXFwuXStcXC4pKj8oW15cXC9cXC5dK1xcLlteOlxcL1xcc1xcLl17MiwzfShcXC5bXjpcXC9cXHNcXC5d4oCM4oCLezIsM30pPykoOlxcZCspPygkfFxcLykoW14jP1xcc10rKT8oLio/KT8oI1tcXHdcXC1dKyk/JC9cbiAgIFxuICAgIF9tYXBzID0gW11cbiAgICBpZiBAZGF0YVtAY3VycmVudFRhYklkXT9cbiAgICAgIF9tYXBzLnB1c2ggbWFwIGZvciBtYXAgaW4gQGRhdGFbQGN1cnJlbnRUYWJJZF0ubWFwcyB3aGVuIG1hcC5pc09uXG4gICAgXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIF9tYXBzLmxlbmd0aCA+IDBcblxuICAgIHJlc1BhdGggPSB1cmwubWF0Y2goZmlsZVBhdGhSZWdleCk/WzhdXG4gICAgaWYgbm90IHJlc1BhdGg/XG4gICAgICAjIHRyeSByZWxwYXRoXG4gICAgICByZXNQYXRoID0gdXJsXG5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmVzUGF0aD9cbiAgICBcbiAgICBmb3IgbWFwIGluIF9tYXBzXG4gICAgICByZXNQYXRoID0gdXJsLm1hdGNoKG5ldyBSZWdFeHAobWFwLnVybCkpPyBhbmQgbWFwLnVybD9cblxuICAgICAgaWYgcmVzUGF0aFxuICAgICAgICBpZiByZWZlcmVyP1xuICAgICAgICAgICMgVE9ETzogdGhpc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgZmlsZVBhdGggPSB1cmwucmVwbGFjZSBuZXcgUmVnRXhwKG1hcC51cmwpLCBtYXAucmVnZXhSZXBsXG4gICAgICAgIGJyZWFrXG4gICAgcmV0dXJuIGZpbGVQYXRoXG5cbiAgdGFiOiAodGFiSWQpIC0+XG4gICAgQGN1cnJlbnRUYWJJZCA9IHRhYklkXG4gICAgQGRhdGFbdGFiSWRdID89IGlzT246ZmFsc2VcbiAgICB0aGlzXG5cbiAgd2l0aFByZWZpeDogKHByZWZpeCkgPT5cbiAgICBAcHJlZml4ID0gcHJlZml4XG4gICAgdGhpc1xuXG4gICMgd2l0aERpcmVjdG9yaWVzOiAoZGlyZWN0b3JpZXMpIC0+XG4gICMgICBpZiBkaXJlY3Rvcmllcz8ubGVuZ3RoIGlzIDBcbiAgIyAgICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0uZGlyZWN0b3JpZXMgPSBbXSBcbiAgIyAgICAgQF9zdG9wIEBjdXJyZW50VGFiSWRcbiAgIyAgIGVsc2UgI2lmIE9iamVjdC5rZXlzKEBkYXRhW0BjdXJyZW50VGFiSWRdKS5sZW5ndGggaXMgMFxuICAjICAgICBAZGF0YVtAY3VycmVudFRhYklkXS5kaXJlY3RvcmllcyA9IGRpcmVjdG9yaWVzXG4gICMgICAgIEBzdGFydCgpXG4gICMgICB0aGlzICAgIFxuXG4gIHdpdGhNYXBzOiAobWFwcykgLT5cbiAgICBpZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtYXBzKS5sZW5ndGggaXMgMFxuICAgICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubWFwcyA9IFtdXG4gICAgICBAX3N0b3AgQGN1cnJlbnRUYWJJZFxuICAgIGVsc2UgI2lmIE9iamVjdC5rZXlzKEBkYXRhW0BjdXJyZW50VGFiSWRdKS5sZW5ndGggaXMgMFxuICAgICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubWFwcyA9IG1hcHNcbiAgICB0aGlzXG5cbiAgc3RhcnQ6IC0+XG4gICAgdW5sZXNzIEBkYXRhW0BjdXJyZW50VGFiSWRdLmxpc3RlbmVyXG4gICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QucmVtb3ZlTGlzdGVuZXIgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubGlzdGVuZXJcblxuICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLmxpc3RlbmVyID0gQGNyZWF0ZVJlZGlyZWN0TGlzdGVuZXIoKVxuICAgICMgQGRhdGFbQGN1cnJlbnRUYWJJZF0uaXNPbiA9IHRydWVcbiAgICBAX3N0YXJ0IEBjdXJyZW50VGFiSWRcblxuICBraWxsQWxsOiAoKSAtPlxuICAgIEBfc3RvcCB0YWJJZCBmb3IgdGFiSWQgb2YgQGRhdGFcblxuICBfc3RvcDogKHRhYklkKSAtPlxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5yZW1vdmVMaXN0ZW5lciBAZGF0YVt0YWJJZF0ubGlzdGVuZXJcblxuICBfc3RhcnQ6ICh0YWJJZCkgLT5cbiAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QuYWRkTGlzdGVuZXIgQGRhdGFbdGFiSWRdLmxpc3RlbmVyLFxuICAgICAgdXJsczpbJzxhbGxfdXJscz4nXVxuICAgICAgdGFiSWQ6QGN1cnJlbnRUYWJJZCxcbiAgICAgIFsnYmxvY2tpbmcnXVxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgdG9nZ2xlOiAoKSAtPlxuICAgIGlzT24gPSBmYWxzZVxuICAgIGlmIEBkYXRhW0BjdXJyZW50VGFiSWRdPy5tYXBzP1xuICAgICAgZm9yIG0gaW4gQGRhdGFbQGN1cnJlbnRUYWJJZF0/Lm1hcHNcbiAgICAgICAgaWYgbS5pc09uXG4gICAgICAgICAgaXNPbiA9IHRydWVcbiAgICAgICAgICBicmVha1xuICAgICAgICBlbHNlXG4gICAgICAgICAgaXNPbiA9IGZhbHNlXG4gICAgICAjIEBkYXRhW0BjdXJyZW50VGFiSWRdLmlzT24gPSAhQGRhdGFbQGN1cnJlbnRUYWJJZF0uaXNPblxuICAgICAgXG4gICAgICBpZiBpc09uXG4gICAgICAgIEBzdGFydCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBfc3RvcChAY3VycmVudFRhYklkKVxuXG4gICAgICByZXR1cm4gaXNPblxuXG4gIGNyZWF0ZVJlZGlyZWN0TGlzdGVuZXI6ICgpIC0+XG4gICAgKGRldGFpbHMpID0+XG4gICAgICBwYXRoID0gQGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3QgZGV0YWlscy51cmxcbiAgICAgIGlmIHBhdGg/IGFuZCBwYXRoLmluZGV4T2YgQHByZWZpeCBpcyAtMVxuICAgICAgICByZXR1cm4gcmVkaXJlY3RVcmw6QHByZWZpeCArIHBhdGhcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHt9IFxuXG4gIHRvRGljdDogKG9iaixrZXkpIC0+XG4gICAgb2JqLnJlZHVjZSAoKGRpY3QsIF9vYmopIC0+IGRpY3RbIF9vYmpba2V5XSBdID0gX29iaiBpZiBfb2JqW2tleV0/OyByZXR1cm4gZGljdCksIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gUmVkaXJlY3RcbiIsIiNUT0RPOiByZXdyaXRlIHRoaXMgY2xhc3MgdXNpbmcgdGhlIG5ldyBjaHJvbWUuc29ja2V0cy4qIGFwaSB3aGVuIHlvdSBjYW4gbWFuYWdlIHRvIG1ha2UgaXQgd29ya1xuY2xhc3MgU2VydmVyXG4gIHNvY2tldDogY2hyb21lLnNvY2tldFxuICAjIHRjcDogY2hyb21lLnNvY2tldHMudGNwXG4gIHNvY2tldFByb3BlcnRpZXM6XG4gICAgICBwZXJzaXN0ZW50OnRydWVcbiAgICAgIG5hbWU6J1NMUmVkaXJlY3RvcidcbiAgIyBzb2NrZXRJbmZvOm51bGxcbiAgZ2V0TG9jYWxGaWxlOm51bGxcbiAgc29ja2V0SWRzOltdXG4gIHN0YXR1czpcbiAgICBob3N0Om51bGxcbiAgICBwb3J0Om51bGxcbiAgICBtYXhDb25uZWN0aW9uczo1MFxuICAgIGlzT246ZmFsc2VcbiAgICBzb2NrZXRJbmZvOm51bGxcbiAgICB1cmw6bnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIEBzdGF0dXMuaG9zdCA9IFwiMTI3LjAuMC4xXCJcbiAgICBAc3RhdHVzLnBvcnQgPSAxMDAxMlxuICAgIEBzdGF0dXMubWF4Q29ubmVjdGlvbnMgPSA1MFxuICAgIEBzdGF0dXMudXJsID0gJ2h0dHA6Ly8nICsgQHN0YXR1cy5ob3N0ICsgJzonICsgQHN0YXR1cy5wb3J0ICsgJy8nXG4gICAgQHN0YXR1cy5pc09uID0gZmFsc2VcblxuXG4gIHN0YXJ0OiAoaG9zdCxwb3J0LG1heENvbm5lY3Rpb25zLCBjYikgLT5cbiAgICBpZiBob3N0PyB0aGVuIEBzdGF0dXMuaG9zdCA9IGhvc3RcbiAgICBpZiBwb3J0PyB0aGVuIEBzdGF0dXMucG9ydCA9IHBvcnRcbiAgICBpZiBtYXhDb25uZWN0aW9ucz8gdGhlbiBAc3RhdHVzLm1heENvbm5lY3Rpb25zID0gbWF4Q29ubmVjdGlvbnNcblxuICAgIEBraWxsQWxsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICByZXR1cm4gY2I/IGVyciBpZiBlcnI/XG5cbiAgICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG4gICAgICBAc29ja2V0LmNyZWF0ZSAndGNwJywge30sIChzb2NrZXRJbmZvKSA9PlxuICAgICAgICBAc3RhdHVzLnNvY2tldEluZm8gPSBzb2NrZXRJbmZvXG4gICAgICAgIEBzb2NrZXRJZHMgPSBbXVxuICAgICAgICBAc29ja2V0SWRzLnB1c2ggQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0ICdzb2NrZXRJZHMnOkBzb2NrZXRJZHNcbiAgICAgICAgQHNvY2tldC5saXN0ZW4gQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkLCBAc3RhdHVzLmhvc3QsIEBzdGF0dXMucG9ydCwgKHJlc3VsdCkgPT5cbiAgICAgICAgICBpZiByZXN1bHQgPiAtMVxuICAgICAgICAgICAgc2hvdyAnbGlzdGVuaW5nICcgKyBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgICAgIEBzdGF0dXMuaXNPbiA9IHRydWVcbiAgICAgICAgICAgIEBzb2NrZXQuYWNjZXB0IEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuICAgICAgICAgICAgY2I/IG51bGwsIEBzdGF0dXNcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjYj8gcmVzdWx0XG5cblxuICBraWxsQWxsOiAoY2IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQgJ3NvY2tldElkcycsIChyZXN1bHQpID0+XG4gICAgICBAc29ja2V0SWRzID0gcmVzdWx0LnNvY2tldElkc1xuICAgICAgQHN0YXR1cy5pc09uID0gZmFsc2VcbiAgICAgIHJldHVybiBjYj8gbnVsbCwgJ3N1Y2Nlc3MnIHVubGVzcyBAc29ja2V0SWRzP1xuICAgICAgY250ID0gMFxuICAgICAgZm9yIHMgaW4gQHNvY2tldElkc1xuICAgICAgICBkbyAocykgPT5cbiAgICAgICAgICBjbnQrK1xuICAgICAgICAgIEBzb2NrZXQuZ2V0SW5mbyBzLCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgICAgIGNudC0tXG4gICAgICAgICAgICBpZiBub3QgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yP1xuICAgICAgICAgICAgICBAc29ja2V0LmRpc2Nvbm5lY3QgcyBpZiBAc3RhdHVzLnNvY2tldEluZm8/LmNvbm5lY3RlZCBvciBub3QgQHN0YXR1cy5zb2NrZXRJbmZvP1xuICAgICAgICAgICAgICBAc29ja2V0LmRlc3Ryb3kgc1xuXG4gICAgICAgICAgICBjYj8gbnVsbCwgJ3N1Y2Nlc3MnIGlmIGNudCBpcyAwXG5cbiAgc3RvcDogKGNiKSAtPlxuICAgIEBraWxsQWxsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICBpZiBlcnI/IFxuICAgICAgICBjYj8gZXJyXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLHN1Y2Nlc3NcblxuXG4gIF9vblJlY2VpdmU6IChyZWNlaXZlSW5mbykgPT5cbiAgICBzaG93KFwiQ2xpZW50IHNvY2tldCAncmVjZWl2ZScgZXZlbnQ6IHNkPVwiICsgcmVjZWl2ZUluZm8uc29ja2V0SWRcbiAgICArIFwiLCBieXRlcz1cIiArIHJlY2VpdmVJbmZvLmRhdGEuYnl0ZUxlbmd0aClcblxuICBfb25MaXN0ZW46IChzZXJ2ZXJTb2NrZXRJZCwgcmVzdWx0Q29kZSkgPT5cbiAgICByZXR1cm4gc2hvdyAnRXJyb3IgTGlzdGVuaW5nOiAnICsgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UgaWYgcmVzdWx0Q29kZSA8IDBcbiAgICBAc2VydmVyU29ja2V0SWQgPSBzZXJ2ZXJTb2NrZXRJZFxuICAgIEB0Y3BTZXJ2ZXIub25BY2NlcHQuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdFxuICAgIEB0Y3BTZXJ2ZXIub25BY2NlcHRFcnJvci5hZGRMaXN0ZW5lciBAX29uQWNjZXB0RXJyb3JcbiAgICBAdGNwLm9uUmVjZWl2ZS5hZGRMaXN0ZW5lciBAX29uUmVjZWl2ZVxuICAgICMgc2hvdyBcIltcIitzb2NrZXRJbmZvLnBlZXJBZGRyZXNzK1wiOlwiK3NvY2tldEluZm8ucGVlclBvcnQrXCJdIENvbm5lY3Rpb24gYWNjZXB0ZWQhXCI7XG4gICAgIyBpbmZvID0gQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkXG4gICAgIyBAZ2V0RmlsZSB1cmksIChmaWxlKSAtPlxuICBfb25BY2NlcHRFcnJvcjogKGVycm9yKSAtPlxuICAgIHNob3cgZXJyb3JcblxuICBfb25BY2NlcHQ6IChzb2NrZXRJbmZvKSA9PlxuICAgICMgcmV0dXJuIG51bGwgaWYgaW5mby5zb2NrZXRJZCBpc250IEBzZXJ2ZXJTb2NrZXRJZFxuICAgIHNob3coXCJTZXJ2ZXIgc29ja2V0ICdhY2NlcHQnIGV2ZW50OiBzZD1cIiArIHNvY2tldEluZm8uc29ja2V0SWQpXG4gICAgaWYgc29ja2V0SW5mbz8uc29ja2V0SWQ/XG4gICAgICBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWQsIChlcnIsIGluZm8pID0+XG4gICAgICAgIFxuICAgICAgICBpZiBlcnI/IHRoZW4gcmV0dXJuIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG5cbiAgICAgICAgQGdldExvY2FsRmlsZSBpbmZvLCAoZXJyLCBmaWxlRW50cnksIGZpbGVSZWFkZXIpID0+XG4gICAgICAgICAgaWYgZXJyPyB0aGVuIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG4gICAgICAgICAgZWxzZSBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SW5mby5zb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlUmVhZGVyLCBpbmZvLmtlZXBBbGl2ZVxuICAgIGVsc2VcbiAgICAgIHNob3cgXCJObyBzb2NrZXQ/IVwiXG4gICAgIyBAc29ja2V0LmFjY2VwdCBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cblxuXG4gIHN0cmluZ1RvVWludDhBcnJheTogKHN0cmluZykgLT5cbiAgICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyaW5nLmxlbmd0aClcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIGkgPSAwXG5cbiAgICB3aGlsZSBpIDwgc3RyaW5nLmxlbmd0aFxuICAgICAgdmlld1tpXSA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG4gICAgICBpKytcbiAgICB2aWV3XG5cbiAgYXJyYXlCdWZmZXJUb1N0cmluZzogKGJ1ZmZlcikgLT5cbiAgICBzdHIgPSBcIlwiXG4gICAgdUFycmF5VmFsID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIHMgPSAwXG5cbiAgICB3aGlsZSBzIDwgdUFycmF5VmFsLmxlbmd0aFxuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodUFycmF5VmFsW3NdKVxuICAgICAgcysrXG4gICAgc3RyXG5cbiAgX3dyaXRlMjAwUmVzcG9uc2U6IChzb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlLCBrZWVwQWxpdmUpIC0+XG4gICAgY29udGVudFR5cGUgPSAoaWYgKGZpbGUudHlwZSBpcyBcIlwiKSB0aGVuIFwidGV4dC9wbGFpblwiIGVsc2UgZmlsZS50eXBlKVxuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgMjAwIE9LXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuXG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXJcbiAgICByZWFkZXIub25sb2FkID0gKGV2KSA9PlxuICAgICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZXYudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICAgIHNob3cgd3JpdGVJbmZvXG4gICAgICAgICMgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIub25lcnJvciA9IChlcnJvcikgPT5cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBmaWxlXG5cblxuICAgICMgQGVuZCBzb2NrZXRJZFxuICAgICMgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAjIGZpbGVSZWFkZXIub25sb2FkID0gKGUpID0+XG4gICAgIyAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgIyAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAjICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgIyAgICAgICBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SWRcblxuXG4gIF9yZWFkRnJvbVNvY2tldDogKHNvY2tldElkLCBjYikgLT5cbiAgICBAc29ja2V0LnJlYWQgc29ja2V0SWQsIChyZWFkSW5mbykgPT5cbiAgICAgIHNob3cgXCJSRUFEXCIsIHJlYWRJbmZvXG5cbiAgICAgICMgUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICBkYXRhID0gQGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSlcbiAgICAgIHNob3cgZGF0YVxuXG4gICAgICBrZWVwQWxpdmUgPSBmYWxzZVxuICAgICAga2VlcEFsaXZlID0gdHJ1ZSBpZiBkYXRhLmluZGV4T2YgJ0Nvbm5lY3Rpb246IGtlZXAtYWxpdmUnIGlzbnQgLTFcblxuICAgICAgaWYgZGF0YS5pbmRleE9mKFwiR0VUIFwiKSBpc250IDBcbiAgICAgICAgcmV0dXJuIGNiPyAnNDA0Jywga2VlcEFsaXZlOmtlZXBBbGl2ZVxuXG5cblxuICAgICAgdXJpRW5kID0gZGF0YS5pbmRleE9mKFwiIFwiLCA0KVxuXG4gICAgICByZXR1cm4gZW5kIHNvY2tldElkIGlmIHVyaUVuZCA8IDBcblxuICAgICAgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKVxuICAgICAgaWYgbm90IHVyaT9cbiAgICAgICAgcmV0dXJuIGNiPyAnNDA0Jywga2VlcEFsaXZlOmtlZXBBbGl2ZVxuXG4gICAgICBpbmZvID1cbiAgICAgICAgdXJpOiB1cmlcbiAgICAgICAga2VlcEFsaXZlOmtlZXBBbGl2ZVxuICAgICAgaW5mby5yZWZlcmVyID0gZGF0YS5tYXRjaCgvUmVmZXJlcjpcXHMoLiopLyk/WzFdXG4gICAgICAjc3VjY2Vzc1xuICAgICAgY2I/IG51bGwsIGluZm9cblxuICBlbmQ6IChzb2NrZXRJZCwga2VlcEFsaXZlKSAtPlxuICAgICAgIyBpZiBrZWVwQWxpdmVcbiAgICAgICMgICBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAjIGVsc2VcbiAgICBAc29ja2V0LmRpc2Nvbm5lY3Qgc29ja2V0SWRcbiAgICBAc29ja2V0LmRlc3Ryb3kgc29ja2V0SWRcbiAgICBzaG93ICdlbmRpbmcgJyArIHNvY2tldElkXG4gICAgQHNvY2tldC5hY2NlcHQgQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAgX3dyaXRlRXJyb3I6IChzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIC0+XG4gICAgZmlsZSA9IHNpemU6IDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIlxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGVcbiAgICBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiICMoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIlxuICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcnZlclxuIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuIyB3aW5kb3cuT2JzZXJ2YWJsZSA9IHJlcXVpcmUgJy4vb2JzZXJ2ZS5jb2ZmZWUnXG4jIHJlcXVpcmUgJ09iamVjdC1vYnNlcnZlLXBvbHlmaWxsJ1xuIyBPYnNlcnZhYmxlID0gcmVxdWlyZSAnb2JzZXJ2ZWQnXG5XYXRjaEpTID0gcmVxdWlyZSAnd2F0Y2hqcydcbndhdGNoID0gV2F0Y2hKUy53YXRjaFxudW53YXRjaCA9IFdhdGNoSlMudW53YXRjaFxuY2FsbFdhdGNoZXJzID0gV2F0Y2hKUy5jYWxsV2F0Y2hlcnNcblxuY2xhc3MgU3RvcmFnZVxuICBhcGk6IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gIExJU1RFTjogTElTVEVOLmdldCgpIFxuICBNU0c6IE1TRy5nZXQoKVxuICBkYXRhOiBcbiAgICBjdXJyZW50UmVzb3VyY2VzOiBbXVxuICAgIGRpcmVjdG9yaWVzOltdXG4gICAgbWFwczpbXVxuICAgIHRhYk1hcHM6e31cbiAgICBjdXJyZW50RmlsZU1hdGNoZXM6e31cbiAgXG4gIHNlc3Npb246e31cblxuICBvbkRhdGFMb2FkZWQ6IC0+XG5cbiAgY2FsbGJhY2s6ICgpIC0+XG4gIG5vdGlmeU9uQ2hhbmdlOiAoKSAtPlxuICBjb25zdHJ1Y3RvcjogKF9vbkRhdGFMb2FkZWQpIC0+XG4gICAgQG9uRGF0YUxvYWRlZCA9IF9vbkRhdGFMb2FkZWQgaWYgX29uRGF0YUxvYWRlZD9cbiAgICBAYXBpLmdldCAocmVzdWx0cykgPT5cbiAgICAgIEBkYXRhW2tdID0gcmVzdWx0c1trXSBmb3IgayBvZiByZXN1bHRzXG5cbiAgICAgIHdhdGNoQW5kTm90aWZ5IEAsJ2RhdGFDaGFuZ2VkJywgQGRhdGEsIHRydWVcblxuICAgICAgd2F0Y2hBbmROb3RpZnkgQCwnc2Vzc2lvbkRhdGEnLCBAc2Vzc2lvbiwgZmFsc2VcblxuICAgICAgQG9uRGF0YUxvYWRlZCBAZGF0YVxuXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpIC0+XG4gICAgXG4gICAgIyBAcmV0cmlldmVBbGwoKVxuXG4gIFxuICBpc0FycmF5OiAtPiBcbiAgICBBcnJheS5pc0FycmF5IHx8ICggdmFsdWUgKSAtPiByZXR1cm4ge30udG9TdHJpbmcuY2FsbCggdmFsdWUgKSBpcyAnW29iamVjdCBBcnJheV0nXG5cbiAgd2F0Y2hBbmROb3RpZnkgPSAoX3RoaXMsIG1zZ0tleSwgb2JqLCBzdG9yZSkgLT5cbiAgICAgICMgX3RoaXMub2JzZXJ2ZXIgPSBPYnNlcnZhYmxlIG9ialxuICAgICAgIyBfdGhpcy5vYnNlcnZlci5vbiAnY2hhbmdlJywgKGNoYW5nZSkgLT5cbiAgICAgICAgIyBpZiBjaGFuZ2UubmFtZSBpcyAnbGVuZ3RoJyAgICAgICAgICBcbiAgICAgICAgIyAgIHBhdGggPSBjaGFuZ2UucGF0aC5zcGxpdCgnXl4nKVxuICAgICAgICAjICAgc2F2ZUFyciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNoYW5nZS5vYmplY3RbcGF0aFswXV0pIFxuICAgICAgICAjICAgY2hhbmdlLm9iamVjdFtwYXRoWzBdXS5sZW5ndGggPSAwXG4gICAgICAgICMgICBzZXRUaW1lb3V0ICgpIC0+XG4gICAgICAgICMgICAgIGNoYW5nZS5vYmplY3RbcGF0aFswXV0gPSBzYXZlQXJyXG4gICAgICBfbGlzdGVuZXIgPSAocHJvcCwgYWN0aW9uLCBuZXdWYWwsIG9sZFZhbCkgLT5cbiAgICAgICAgaWYgKGFjdGlvbiBpcyBcInNldFwiIG9yIFwiZGlmZmVyZW50YXR0clwiKSBhbmQgX3RoaXMubm9XYXRjaCBpcyBmYWxzZVxuICAgICAgICAgIGlmIG5vdCAvXlxcZCskLy50ZXN0KHByb3ApXG4gICAgICAgICAgICBzaG93IGFyZ3VtZW50c1xuICAgICAgICAgICAgX3RoaXMuYXBpLnNldCBvYmogaWYgc3RvcmVcbiAgICAgICAgICAgIG1zZyA9IHt9XG4gICAgICAgICAgICBtc2dbbXNnS2V5XSA9IG9ialxuICAgICAgICAgICAgIyB1bndhdGNoIG9iaiwgX2xpc3RlbmVyLDMsdHJ1ZVxuICAgICAgICAgICAgX3RoaXMuTVNHLkV4dFBvcnQgbXNnXG4gICAgICAgIFxuICAgICAgX3RoaXMubm9XYXRjaCA9IGZhbHNlXG4gICAgICB3YXRjaCBvYmosIF9saXN0ZW5lciwzLHRydWVcbiAgICAgICAgIyBfdGhpcy5NU0cuRXh0UG9ydCBtc2dcblxuICAgICAgX3RoaXMuTElTVEVOLkV4dCBtc2dLZXksIChkYXRhKSAtPlxuICAgICAgICBfdGhpcy5ub1dhdGNoID0gdHJ1ZVxuICAgICAgICAjIHVud2F0Y2ggb2JqLCBfbGlzdGVuZXIsMyx0cnVlXG4gICAgICAgIFxuICAgICAgICBvYmpba10gPSBkYXRhW2tdIGZvciBrIG9mIGRhdGFcbiAgICAgICAgc2V0VGltZW91dCAoKSAtPiBcbiAgICAgICAgICBfdGhpcy5ub1dhdGNoID0gZmFsc2VcbiAgICAgICAgLDIwMFxuICAgICAgICAjIHdhdGNoIG9iaiwgX2xpc3RlbmVyLDMsdHJ1ZVxuXG4gICAgICAgICMgc2hvdyBjaGFuZ2VcbiAgICAgICAgIyBvYmogPz0ge31cbiAgICAgICAgIyBzaG93ICdkYXRhIGNoYW5nZWQgJ1xuICAgICAgICAjIHNob3cgY2hhbmdlXG4gICAgICAgICMgcmV0dXJuIGlmIF90aGlzLmlzQXJyYXkoY2hhbmdlLm9iamVjdClcblxuICAgICAgICAjICgoZGF0YSwgYXBpLCBvYnNlcnZlcikgLT5cbiAgICAgICAgIyAgIHN0YWNrID0gY2hhbmdlLnBhdGguc3BsaXQgJ15eJ1xuXG4gICAgICAgICMgICByZXR1cm4gZGF0YVtzdGFja1swXV0gPSBjaGFuZ2UudmFsdWUgaWYgbm90IGRhdGFbc3RhY2tbMF1dP1xuXG4gICAgICAgICMgICB3aGlsZSBzdGFjay5sZW5ndGggPiAwIFxuICAgICAgICAjICAgICBfc2hpZnQgPSBzdGFjay5zaGlmdCgpXG4gICAgICAgICAgICBcbiAgICAgICAgIyAgICAgaWYgc3RhY2subGVuZ3RoID4gMCBhbmQgaXNBcnJheShkYXRhW19zaGlmdF0pIGFuZCBjaGFuZ2UubmFtZSBpcyBzdGFja1swXVxuICAgICAgICAjICAgICAgIG5ld0FyciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNoYW5nZS5vYmplY3QpXG4gICAgICAgICMgICAgICAgIyBPYnNlcnZhYmxlIG5ld0FyclxuICAgICAgICAjICAgICAgIGRhdGFbX3NoaWZ0XSA9IG5ld0FyclxuICAgICAgICAjICAgICAgIHJldHVyblxuXG4gICAgICAgICMgICAgIGlmIC9eXFxkKyQvLnRlc3QgX3NoaWZ0IFxuICAgICAgICAjICAgICAgIF9zaGlmdCA9IHBhcnNlSW50IF9zaGlmdFxuICAgICAgICAjICAgICAgICMgZWxzZSBpZiBjaGFuZ2UudHlwZSBpcyAndXBkYXRlJyBhbmQgY2hhbmdlLm5hbWUgaXMgJ2xlbmd0aCdcblxuICAgICAgICAjICAgICBkYXRhID0gZGF0YVtfc2hpZnRdIHVubGVzcyBzdGFjay5sZW5ndGggaXMgMFxuXG4gICAgICAgICMgICAjIHBhdXNlZCA9IG9ic2VydmVyLnBhdXNlIGRhdGFcbiAgICAgICAgIyAgIGRhdGFbX3NoaWZ0XSA9IGNoYW5nZS52YWx1ZVxuXG4gICAgICAgICMgICAjIHNldFRpbWVvdXQgKCkgLT5cbiAgICAgICAgIyAgICMgICAgIG9ic2VydmVyLnJlc3VtZSBwYXVzZWRcbiAgICAgICAgIyAgICMgLDIwICBcbiAgICAgICAgIyApKG9iaiwgX3RoaXMuYXBpLCBfdGhpcy5vYnNlcnZlcikgICAgXG5cbiAgc2F2ZTogKGtleSwgaXRlbSwgY2IpIC0+XG5cbiAgICBvYmogPSB7fVxuICAgIG9ialtrZXldID0gaXRlbVxuICAgIEBkYXRhW2tleV0gPSBpdGVtXG4gICAgQGFwaS5zZXQgb2JqLCAocmVzKSA9PlxuICAgICAgY2I/KClcbiAgICAgIEBjYWxsYmFjaz8oKVxuIFxuICBzYXZlQWxsOiAoZGF0YSwgY2IpIC0+XG5cbiAgICBpZiBkYXRhPyBcbiAgICAgIEBhcGkuc2V0IGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG5cbiAgICAgICAgIyBAY2FsbGJhY2s/KClcbiAgICBlbHNlXG4gICAgICBAYXBpLnNldCBAZGF0YSwgKCkgPT5cbiAgICAgICAgY2I/KClcblxuICAgICAgICAjIEBjYWxsYmFjaz8oKVxuICAgICMgc2hvdyAnc2F2ZUFsbCBAZGF0YTogJyArIEBkYXRhLnNvY2tldElkcz9bMF1cbiAgICAjIHNob3cgJ3NhdmVBbGwgZGF0YTogJyArIGRhdGEuc29ja2V0SWRzP1swXVxuXG4gIHJldHJpZXZlOiAoa2V5LCBjYikgLT5cbiAgICBAb2JzZXJ2ZXIuc3RvcCgpXG4gICAgQGFwaS5nZXQga2V5LCAocmVzdWx0cykgLT5cbiAgICAgIEBkYXRhW3JdID0gcmVzdWx0c1tyXSBmb3IgciBvZiByZXN1bHRzXG4gICAgICBpZiBjYj8gdGhlbiBjYiByZXN1bHRzW2tleV1cblxuICByZXRyaWV2ZUFsbDogKGNiKSAtPlxuICAgICMgQG9ic2VydmVyLnN0b3AoKVxuICAgIEBhcGkuZ2V0IChyZXN1bHQpID0+XG4gICAgICBmb3IgYyBvZiByZXN1bHQgXG4gICAgICAjICAgZGVsZXRlIEBkYXRhW2NdXG4gICAgICAgIEBkYXRhW2NdID0gcmVzdWx0W2NdIFxuICAgICAgIyBAZGF0YSA9IHJlc3VsdFxuICAgICAgICBATVNHLkV4dFBvcnQgJ2RhdGFDaGFuZ2VkJzpcbiAgICAgICAgICBwYXRoOmNcbiAgICAgICAgICB2YWx1ZTpyZXN1bHRbY11cbiAgICAgICMgQG9ic2VydmVyID0gT2JzZXJ2YWJsZSBAZGF0YVxuICAgICAgIyBAb2JzZXJ2ZXIub24gJ2NoYW5nZScsIChjaGFuZ2UpID0+XG4gICAgICAjICAgaWYgY2hhbmdlLm5hbWUgaXNudCAnbGVuZ3RoJ1xuICAgICAgIyAgICAgc2hvdyBjaGFuZ2VcbiAgICAgICMgICAgIEBhcGkuc2V0IEBkYXRhXG4gICAgICAjICAgICBATVNHLkV4dFBvcnQgJ2RhdGFDaGFuZ2VkJzpjaGFuZ2UgXG5cbiAgICAgIEBhcGkuc2V0IEBkYXRhXG4gICAgICAjIEBjYWxsYmFjaz8gcmVzdWx0XG4gICAgICBjYj8gcmVzdWx0XG4gICAgICBAb25EYXRhTG9hZGVkIEBkYXRhXG5cbiAgICAgICMgQE1TRy5FeHRQb3J0ICdkYXRhQ2hhbmdlZCc6XG4gICAgICAjIEBvYnNlcnZlciA9IE9ic2VydmFibGUgQGRhdGFcbiAgICAgICMgQG9ic2VydmVyLm9uICdjaGFuZ2UnLCAoY2hhbmdlKSA9PlxuICAgICAgIyAgIHNob3cgJ3RlbGwgY2hhbmdpbmcgZGF0YSdcbiAgICAgICMgICBATVNHLkV4dFBvcnQgJ2RhdGFDaGFuZ2VkJzpjaGFuZ2VcblxuICBvbkRhdGFMb2FkZWQ6IChkYXRhKSAtPlxuXG4gIG9uQ2hhbmdlZDogKGtleSwgY2IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyIChjaGFuZ2VzLCBuYW1lc3BhY2UpIC0+XG4gICAgICBpZiBjaGFuZ2VzW2tleV0/IGFuZCBjYj8gdGhlbiBjYiBjaGFuZ2VzW2tleV0ubmV3VmFsdWVcbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlc1xuXG4gIG9uQ2hhbmdlZEFsbDogKCkgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsbmFtZXNwYWNlKSA9PlxuICAgICAgaGFzQ2hhbmdlcyA9IGZhbHNlXG4gICAgICBmb3IgYyBvZiBjaGFuZ2VzIHdoZW4gY2hhbmdlc1tjXS5uZXdWYWx1ZSAhPSBjaGFuZ2VzW2NdLm9sZFZhbHVlIGFuZCBjIGlzbnQnc29ja2V0SWRzJ1xuICAgICAgICAoYykgPT4gXG4gICAgICAgICAgQGRhdGFbY10gPSBjaGFuZ2VzW2NdLm5ld1ZhbHVlIFxuICAgICAgICAgIHNob3cgJ2RhdGEgY2hhbmdlZDogJ1xuICAgICAgICAgIHNob3cgY1xuICAgICAgICAgIHNob3cgQGRhdGFbY11cblxuICAgICAgICAgIGhhc0NoYW5nZXMgPSB0cnVlXG5cbiAgICAgIEBjYWxsYmFjaz8gY2hhbmdlcyBpZiBoYXNDaGFuZ2VzXG4gICAgICBzaG93ICdjaGFuZ2VkJyBpZiBoYXNDaGFuZ2VzXG5cbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZVxuIiwiIyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTc0MjA5M1xubW9kdWxlLmV4cG9ydHMgPSAoKCkgLT5cbiAgbWV0aG9kcyA9IFtcbiAgICAnYXNzZXJ0JywgJ2NsZWFyJywgJ2NvdW50JywgJ2RlYnVnJywgJ2RpcicsICdkaXJ4bWwnLCAnZXJyb3InLFxuICAgICdleGNlcHRpb24nLCAnZ3JvdXAnLCAnZ3JvdXBDb2xsYXBzZWQnLCAnZ3JvdXBFbmQnLCAnaW5mbycsICdsb2cnLFxuICAgICdtYXJrVGltZWxpbmUnLCAncHJvZmlsZScsICdwcm9maWxlRW5kJywgJ3RhYmxlJywgJ3RpbWUnLCAndGltZUVuZCcsXG4gICAgJ3RpbWVTdGFtcCcsICd0cmFjZScsICd3YXJuJ11cbiAgbm9vcCA9ICgpIC0+XG4gICAgIyBzdHViIHVuZGVmaW5lZCBtZXRob2RzLlxuICAgIGZvciBtIGluIG1ldGhvZHMgIHdoZW4gICFjb25zb2xlW21dXG4gICAgICBjb25zb2xlW21dID0gbm9vcFxuXG4gIGlmIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kP1xuICAgIHdpbmRvdy5zaG93ID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSlcbiAgZWxzZVxuICAgIHdpbmRvdy5zaG93ID0gKCkgLT5cbiAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpXG4pKClcbiJdfQ==
