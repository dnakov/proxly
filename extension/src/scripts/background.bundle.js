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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvY29tbW9uLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9jb25maWcuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L2V4dGVuc2lvbi9zcmMvYmFja2dyb3VuZC5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvZmlsZXN5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvZGFuaWVsL0RyaXZlL2Rldi9yZXNlYXJjaC9wcm94bHkvbGlzdGVuLmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9tc2cuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L25vZGVfbW9kdWxlcy93YXRjaGpzL3NyYy93YXRjaC5qcyIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9ub3RpZmljYXRpb24uY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3JlZGlyZWN0LmNvZmZlZSIsIi9Vc2Vycy9kYW5pZWwvRHJpdmUvZGV2L3Jlc2VhcmNoL3Byb3hseS9zZXJ2ZXIuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3N0b3JhZ2UuY29mZmVlIiwiL1VzZXJzL2RhbmllbC9Ecml2ZS9kZXYvcmVzZWFyY2gvcHJveGx5L3V0aWwuY29mZmVlIl0sIm5hbWVzIjpb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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QixFQUdpQyxPQUhqQyxFQUcwQyxNQUgxQyxFQUdrRCxTQUhsRCxFQUlSLFdBSlEsRUFJSyxPQUpMLEVBSWMsTUFKZCxDQUpWLENBQUE7QUFBQSxFQVVBLElBQUEsR0FBTyxTQUFBLEdBQUE7QUFFTCxRQUFBLHFCQUFBO0FBQUE7U0FBQSw4Q0FBQTtzQkFBQTtVQUF3QixDQUFBLE9BQVMsQ0FBQSxDQUFBO0FBQy9CLHNCQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVIsR0FBYSxLQUFiO09BREY7QUFBQTtvQkFGSztFQUFBLENBVlAsQ0FBQTtBQWdCQSxFQUFBLElBQUcsK0JBQUg7V0FDRSxNQUFNLENBQUMsSUFBUCxHQUFjLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQXhCLENBQTZCLE9BQU8sQ0FBQyxHQUFyQyxFQUEwQyxPQUExQyxFQURoQjtHQUFBLE1BQUE7V0FHRSxNQUFNLENBQUMsSUFBUCxHQUFjLFNBQUEsR0FBQTthQUNaLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQXpCLENBQThCLE9BQU8sQ0FBQyxHQUF0QyxFQUEyQyxPQUEzQyxFQUFvRCxTQUFwRCxFQURZO0lBQUEsRUFIaEI7R0FsQmdCO0FBQUEsQ0FBRCxDQUFBLENBQUEsQ0FBakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZSAnLi91dGlsLmNvZmZlZSdcbkNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnLmNvZmZlZSdcbk1TRyA9IHJlcXVpcmUgJy4vbXNnLmNvZmZlZSdcbkxJU1RFTiA9IHJlcXVpcmUgJy4vbGlzdGVuLmNvZmZlZSdcblN0b3JhZ2UgPSByZXF1aXJlICcuL3N0b3JhZ2UuY29mZmVlJ1xuRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4vZmlsZXN5c3RlbS5jb2ZmZWUnXG5Ob3RpZmljYXRpb24gPSByZXF1aXJlICcuL25vdGlmaWNhdGlvbi5jb2ZmZWUnXG5TZXJ2ZXIgPSByZXF1aXJlICcuL3NlcnZlci5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwbGljYXRpb24gZXh0ZW5kcyBDb25maWdcbiAgTElTVEVOOiBudWxsXG4gIE1TRzogbnVsbFxuICBTdG9yYWdlOiBudWxsXG4gIEZTOiBudWxsXG4gIFNlcnZlcjogbnVsbFxuICBOb3RpZnk6IG51bGxcbiAgcGxhdGZvcm06bnVsbFxuICBjdXJyZW50VGFiSWQ6bnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoZGVwcykgLT5cbiAgICBzdXBlclxuXG4gICAgQE1TRyA/PSBNU0cuZ2V0KClcbiAgICBATElTVEVOID89IExJU1RFTi5nZXQoKVxuICAgIFxuICAgIGNocm9tZS5ydW50aW1lLm9uQ29ubmVjdEV4dGVybmFsLmFkZExpc3RlbmVyIChwb3J0KSA9PlxuICAgICAgaWYgcG9ydC5zZW5kZXIuaWQgaXNudCBARVhUX0lEXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICBATVNHLnNldFBvcnQgcG9ydFxuICAgICAgQExJU1RFTi5zZXRQb3J0IHBvcnRcbiAgICBcbiAgICBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBARVhUX0lEIFxuICAgIEBNU0cuc2V0UG9ydCBwb3J0XG4gICAgQExJU1RFTi5zZXRQb3J0IHBvcnRcbiAgICBcbiAgICBmb3IgcHJvcCBvZiBkZXBzXG4gICAgICBpZiB0eXBlb2YgZGVwc1twcm9wXSBpcyBcIm9iamVjdFwiIFxuICAgICAgICBAW3Byb3BdID0gQHdyYXBPYmpJbmJvdW5kIGRlcHNbcHJvcF1cbiAgICAgIGlmIHR5cGVvZiBkZXBzW3Byb3BdIGlzIFwiZnVuY3Rpb25cIiBcbiAgICAgICAgQFtwcm9wXSA9IEB3cmFwT2JqT3V0Ym91bmQgbmV3IGRlcHNbcHJvcF1cblxuICAgIEBTdG9yYWdlLm9uRGF0YUxvYWRlZCA9IChkYXRhKSA9PlxuICAgICAgIyBAZGF0YSA9IGRhdGFcbiAgICAgICMgZGVsZXRlIEBTdG9yYWdlLmRhdGEuc2VydmVyXG4gICAgICAjIEBTdG9yYWdlLmRhdGEuc2VydmVyID0ge31cbiAgICAgICMgZGVsZXRlIEBTdG9yYWdlLmRhdGEuc2VydmVyLnN0YXR1c1xuXG4gICAgICBpZiBub3QgQFN0b3JhZ2UuZGF0YS5maXJzdFRpbWU/XG4gICAgICAgIEBTdG9yYWdlLmRhdGEuZmlyc3RUaW1lID0gZmFsc2VcbiAgICAgICAgQFN0b3JhZ2UuZGF0YS5tYXBzLnB1c2hcbiAgICAgICAgICBuYW1lOidTYWxlc2ZvcmNlJ1xuICAgICAgICAgIHVybDonaHR0cHMuKlxcL3Jlc291cmNlKFxcL1swLTldKyk/XFwvKFtBLVphLXowLTlcXC0uX10rXFwvKT8nXG4gICAgICAgICAgcmVnZXhSZXBsOicnXG4gICAgICAgICAgaXNSZWRpcmVjdDp0cnVlXG4gICAgICAgICAgaXNPbjpmYWxzZVxuXG5cbiAgICAgICMgaWYgQFJlZGlyZWN0PyB0aGVuIEBSZWRpcmVjdC5kYXRhID0gQGRhdGEudGFiTWFwc1xuXG4gICAgQE5vdGlmeSA/PSAobmV3IE5vdGlmaWNhdGlvbikuc2hvdyBcbiAgICAjIEBTdG9yYWdlID89IEB3cmFwT2JqT3V0Ym91bmQgbmV3IFN0b3JhZ2UgQGRhdGFcbiAgICAjIEBGUyA9IG5ldyBGaWxlU3lzdGVtIFxuICAgICMgQFNlcnZlciA/PSBAd3JhcE9iak91dGJvdW5kIG5ldyBTZXJ2ZXJcbiAgICBAZGF0YSA9IEBTdG9yYWdlLmRhdGFcbiAgICBcbiAgICBAd3JhcCA9IGlmIEBTRUxGX1RZUEUgaXMgJ0FQUCcgdGhlbiBAd3JhcEluYm91bmQgZWxzZSBAd3JhcE91dGJvdW5kXG5cbiAgICBAb3BlbkFwcCA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5vcGVuQXBwJywgQG9wZW5BcHBcbiAgICBAbGF1bmNoQXBwID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmxhdW5jaEFwcCcsIEBsYXVuY2hBcHBcbiAgICBAc3RhcnRTZXJ2ZXIgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uc3RhcnRTZXJ2ZXInLCBAc3RhcnRTZXJ2ZXJcbiAgICBAcmVzdGFydFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5yZXN0YXJ0U2VydmVyJywgQHJlc3RhcnRTZXJ2ZXJcbiAgICBAc3RvcFNlcnZlciA9IEB3cmFwIEAsICdBcHBsaWNhdGlvbi5zdG9wU2VydmVyJywgQHN0b3BTZXJ2ZXJcbiAgICBAZ2V0RmlsZU1hdGNoID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldEZpbGVNYXRjaCcsIEBnZXRGaWxlTWF0Y2hcblxuICAgIEB3cmFwID0gaWYgQFNFTEZfVFlQRSBpcyAnRVhURU5TSU9OJyB0aGVuIEB3cmFwSW5ib3VuZCBlbHNlIEB3cmFwT3V0Ym91bmRcblxuICAgIEBnZXRSZXNvdXJjZXMgPSBAd3JhcCBALCAnQXBwbGljYXRpb24uZ2V0UmVzb3VyY2VzJywgQGdldFJlc291cmNlc1xuICAgIEBnZXRDdXJyZW50VGFiID0gQHdyYXAgQCwgJ0FwcGxpY2F0aW9uLmdldEN1cnJlbnRUYWInLCBAZ2V0Q3VycmVudFRhYlxuXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpIC0+XG4gICAgICBAU3RvcmFnZS5zZXNzaW9uLnNlcnZlciA9IHt9XG4gICAgICBAU3RvcmFnZS5zZXNzaW9uLnNlcnZlci5zdGF0dXMgPSBAU2VydmVyLnN0YXR1c1xuICAgICMgQFN0b3JhZ2UucmV0cmlldmVBbGwoKSBpZiBAU3RvcmFnZT9cblxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgbGF1bmNoQXBwOiAoY2IsIGVycm9yKSAtPlxuICAgICMgbmVlZHMgbWFuYWdlbWVudCBwZXJtaXNzaW9uLiBvZmYgZm9yIG5vdy5cbiAgICBjaHJvbWUubWFuYWdlbWVudC5sYXVuY2hBcHAgQEFQUF9JRCwgKGV4dEluZm8pID0+XG4gICAgICBpZiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JcbiAgICAgICAgZXJyb3IgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBleHRJbmZvXG5cbiAgb3BlbkFwcDogKCkgPT5cbiAgICAgIGNocm9tZS5hcHAud2luZG93LmNyZWF0ZSgnaW5kZXguaHRtbCcsXG4gICAgICAgIGlkOiBcIm1haW53aW5cIlxuICAgICAgICBib3VuZHM6XG4gICAgICAgICAgd2lkdGg6NzcwXG4gICAgICAgICAgaGVpZ2h0OjgwMCxcbiAgICAgICh3aW4pID0+XG4gICAgICAgIEBhcHBXaW5kb3cgPSB3aW4pIFxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgZ2V0UmVzb3VyY2VzOiAoY2IpIC0+XG4gICAgQGdldEN1cnJlbnRUYWIgKHRhYklkKSA9PlxuICAgICAgY2hyb21lLnRhYnMuZXhlY3V0ZVNjcmlwdCB0YWJJZCwgXG4gICAgICAgIGZpbGU6J3NjcmlwdHMvY29udGVudC5qcycsIChyZXN1bHRzKSA9PlxuICAgICAgICAgIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXMubGVuZ3RoID0gMFxuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiBjYj8obnVsbCwgQGRhdGEuY3VycmVudFJlc291cmNlcykgaWYgbm90IHJlc3VsdHM/XG5cbiAgICAgICAgICBmb3IgciBpbiByZXN1bHRzXG4gICAgICAgICAgICBmb3IgcmVzIGluIHJcbiAgICAgICAgICAgICAgQGRhdGEuY3VycmVudFJlc291cmNlcy5wdXNoIHJlc1xuICAgICAgICAgIGNiPyBudWxsLCBAZGF0YS5jdXJyZW50UmVzb3VyY2VzXG5cblxuICBnZXRMb2NhbEZpbGU6IChpbmZvLCBjYikgPT5cbiAgICBmaWxlUGF0aCA9IGluZm8udXJpXG4gICAgIyBmaWxlUGF0aCA9IEBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0IHVybFxuICAgIHJldHVybiBjYiAnZmlsZSBub3QgZm91bmQnIHVubGVzcyBmaWxlUGF0aD9cbiAgICBfZGlycyA9IFtdXG4gICAgX2RpcnMucHVzaCBkaXIgZm9yIGRpciBpbiBAZGF0YS5kaXJlY3RvcmllcyB3aGVuIGRpci5pc09uXG4gICAgZmlsZVBhdGggPSBmaWxlUGF0aC5zdWJzdHJpbmcgMSBpZiBmaWxlUGF0aC5zdWJzdHJpbmcoMCwxKSBpcyAnLydcbiAgICBAZmluZEZpbGVGb3JQYXRoIF9kaXJzLCBmaWxlUGF0aCwgKGVyciwgZmlsZUVudHJ5LCBkaXIpID0+XG4gICAgICBpZiBlcnI/IHRoZW4gcmV0dXJuIGNiPyBlcnJcbiAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICBjYj8gbnVsbCxmaWxlRW50cnksZmlsZVxuICAgICAgLChlcnIpID0+IGNiPyBlcnJcblxuXG4gIHN0YXJ0U2VydmVyOiAoY2IpIC0+XG4gICAgaWYgQFNlcnZlci5zdGF0dXMuaXNPbiBpcyBmYWxzZVxuICAgICAgQFNlcnZlci5zdGFydCBudWxsLG51bGwsbnVsbCwgKGVyciwgc29ja2V0SW5mbykgPT5cbiAgICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIEVycm9yXCIsXCJFcnJvciBTdGFydGluZyBTZXJ2ZXI6ICN7IGVyciB9XCJcbiAgICAgICAgICAgIGNiPyBlcnJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBATm90aWZ5IFwiU2VydmVyIFN0YXJ0ZWRcIiwgXCJTdGFydGVkIFNlcnZlciAjeyBAU2VydmVyLnN0YXR1cy51cmwgfVwiXG4gICAgICAgICAgICBjYj8gbnVsbCwgQFNlcnZlci5zdGF0dXNcbiAgICBlbHNlXG4gICAgICBjYj8gJ2FscmVhZHkgc3RhcnRlZCdcblxuICBzdG9wU2VydmVyOiAoY2IpIC0+XG4gICAgICBAU2VydmVyLnN0b3AgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgICAgaWYgZXJyP1xuICAgICAgICAgIEBOb3RpZnkgXCJTZXJ2ZXIgRXJyb3JcIixcIlNlcnZlciBjb3VsZCBub3QgYmUgc3RvcHBlZDogI3sgZXJyb3IgfVwiXG4gICAgICAgICAgY2I/IGVyclxuICAgICAgICBlbHNlXG4gICAgICAgICAgQE5vdGlmeSAnU2VydmVyIFN0b3BwZWQnLCBcIlNlcnZlciBTdG9wcGVkXCJcbiAgICAgICAgICBjYj8gbnVsbCwgQFNlcnZlci5zdGF0dXNcblxuICByZXN0YXJ0U2VydmVyOiAtPlxuICAgIEBzdGFydFNlcnZlcigpXG5cbiAgY2hhbmdlUG9ydDogPT5cbiAgZ2V0TG9jYWxGaWxlUGF0aFdpdGhSZWRpcmVjdDogKHVybCkgLT5cbiAgICBmaWxlUGF0aFJlZ2V4ID0gL14oKGh0dHBbc10/fGZ0cHxjaHJvbWUtZXh0ZW5zaW9ufGZpbGUpOlxcL1xcLyk/XFwvPyhbXlxcL1xcLl0rXFwuKSo/KFteXFwvXFwuXStcXC5bXjpcXC9cXHNcXC5dezIsM30oXFwuW146XFwvXFxzXFwuXeKAjOKAi3syLDN9KT8pKDpcXGQrKT8oJHxcXC8pKFteIz9cXHNdKyk/KC4qPyk/KCNbXFx3XFwtXSspPyQvXG4gICBcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgQGRhdGFbQGN1cnJlbnRUYWJJZF0/Lm1hcHM/XG5cbiAgICByZXNQYXRoID0gdXJsLm1hdGNoKGZpbGVQYXRoUmVnZXgpP1s4XVxuICAgIGlmIG5vdCByZXNQYXRoP1xuICAgICAgIyB0cnkgcmVscGF0aFxuICAgICAgcmVzUGF0aCA9IHVybFxuXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHJlc1BhdGg/XG4gICAgXG4gICAgZm9yIG1hcCBpbiBAZGF0YVtAY3VycmVudFRhYklkXS5tYXBzXG4gICAgICByZXNQYXRoID0gdXJsLm1hdGNoKG5ldyBSZWdFeHAobWFwLnVybCkpPyBhbmQgbWFwLnVybD9cblxuICAgICAgaWYgcmVzUGF0aFxuICAgICAgICBpZiByZWZlcmVyP1xuICAgICAgICAgICMgVE9ETzogdGhpc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgZmlsZVBhdGggPSB1cmwucmVwbGFjZSBuZXcgUmVnRXhwKG1hcC51cmwpLCBtYXAucmVnZXhSZXBsXG4gICAgICAgIGJyZWFrXG4gICAgcmV0dXJuIGZpbGVQYXRoXG5cbiAgVVJMdG9Mb2NhbFBhdGg6ICh1cmwsIGNiKSAtPlxuICAgIGZpbGVQYXRoID0gQFJlZGlyZWN0LmdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3QgdXJsXG5cbiAgZ2V0RmlsZU1hdGNoOiAoZmlsZVBhdGgsIGNiKSAtPlxuICAgIHJldHVybiBjYj8gJ2ZpbGUgbm90IGZvdW5kJyB1bmxlc3MgZmlsZVBhdGg/XG4gICAgc2hvdyAndHJ5aW5nICcgKyBmaWxlUGF0aFxuICAgIEBmaW5kRmlsZUZvclBhdGggQGRhdGEuZGlyZWN0b3JpZXMsIGZpbGVQYXRoLCAoZXJyLCBmaWxlRW50cnksIGRpcmVjdG9yeSkgPT5cblxuICAgICAgaWYgZXJyPyBcbiAgICAgICAgIyBzaG93ICdubyBmaWxlcyBmb3VuZCBmb3IgJyArIGZpbGVQYXRoXG4gICAgICAgIHJldHVybiBjYj8gZXJyXG5cbiAgICAgIGRlbGV0ZSBmaWxlRW50cnkuZW50cnlcbiAgICAgIEBkYXRhLmN1cnJlbnRGaWxlTWF0Y2hlc1tmaWxlUGF0aF0gPSBcbiAgICAgICAgZmlsZUVudHJ5OiBjaHJvbWUuZmlsZVN5c3RlbS5yZXRhaW5FbnRyeSBmaWxlRW50cnlcbiAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgIGRpcmVjdG9yeTogZGlyZWN0b3J5XG4gICAgICBjYj8gbnVsbCwgQGRhdGEuY3VycmVudEZpbGVNYXRjaGVzW2ZpbGVQYXRoXSwgZGlyZWN0b3J5XG4gICAgICBcblxuXG4gIGZpbmRGaWxlSW5EaXJlY3RvcmllczogKGRpcmVjdG9yaWVzLCBwYXRoLCBjYikgLT5cbiAgICBteURpcnMgPSBkaXJlY3Rvcmllcy5zbGljZSgpIFxuICAgIF9wYXRoID0gcGF0aFxuICAgIF9kaXIgPSBteURpcnMuc2hpZnQoKVxuXG4gICAgQEZTLmdldExvY2FsRmlsZUVudHJ5IF9kaXIsIF9wYXRoLCAoZXJyLCBmaWxlRW50cnkpID0+XG4gICAgICBpZiBlcnI/XG4gICAgICAgIGlmIG15RGlycy5sZW5ndGggPiAwXG4gICAgICAgICAgQGZpbmRGaWxlSW5EaXJlY3RvcmllcyBteURpcnMsIF9wYXRoLCBjYlxuICAgICAgICBlbHNlXG4gICAgICAgICAgY2I/ICdub3QgZm91bmQnXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIF9kaXJcblxuICBmaW5kRmlsZUZvclBhdGg6IChkaXJzLCBwYXRoLCBjYikgLT5cbiAgICBAZmluZEZpbGVJbkRpcmVjdG9yaWVzIGRpcnMsIHBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZGlyZWN0b3J5KSA9PlxuICAgICAgaWYgZXJyP1xuICAgICAgICBpZiBwYXRoIGlzIHBhdGgucmVwbGFjZSgvLio/XFwvLywgJycpXG4gICAgICAgICAgY2I/ICdub3QgZm91bmQnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZmluZEZpbGVGb3JQYXRoIGRpcnMsIHBhdGgucmVwbGFjZSgvLio/XFwvLywgJycpLCBjYlxuICAgICAgZWxzZVxuICAgICAgICBjYj8gbnVsbCwgZmlsZUVudHJ5LCBkaXJlY3RvcnlcbiAgXG4gIG1hcEFsbFJlc291cmNlczogKGNiKSAtPlxuICAgIEBnZXRSZXNvdXJjZXMgPT5cbiAgICAgIG5lZWQgPSBAZGF0YS5jdXJyZW50UmVzb3VyY2VzLmxlbmd0aFxuICAgICAgZm91bmQgPSBub3RGb3VuZCA9IDBcbiAgICAgIGZvciBpdGVtIGluIEBkYXRhLmN1cnJlbnRSZXNvdXJjZXNcbiAgICAgICAgbG9jYWxQYXRoID0gQFVSTHRvTG9jYWxQYXRoIGl0ZW0udXJsXG4gICAgICAgIGlmIGxvY2FsUGF0aD9cbiAgICAgICAgICBAZ2V0RmlsZU1hdGNoIGxvY2FsUGF0aCwgKGVyciwgc3VjY2VzcykgPT5cbiAgICAgICAgICAgIG5lZWQtLVxuICAgICAgICAgICAgc2hvdyBhcmd1bWVudHNcbiAgICAgICAgICAgIGlmIGVycj8gdGhlbiBub3RGb3VuZCsrXG4gICAgICAgICAgICBlbHNlIGZvdW5kKysgICAgICAgICAgICBcblxuICAgICAgICAgICAgaWYgbmVlZCBpcyAwXG4gICAgICAgICAgICAgIGlmIGZvdW5kID4gMFxuICAgICAgICAgICAgICAgIGNiPyBudWxsLCAnZG9uZSdcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNiPyAnbm90aGluZyBmb3VuZCdcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgbmVlZC0tXG4gICAgICAgICAgbm90Rm91bmQrK1xuICAgICAgICAgIGlmIG5lZWQgaXMgMFxuICAgICAgICAgICAgY2I/ICdub3RoaW5nIGZvdW5kJ1xuXG4gIHNldEJhZGdlVGV4dDogKHRleHQsIHRhYklkKSAtPlxuICAgIGJhZGdlVGV4dCA9IHRleHQgfHwgJycgKyBPYmplY3Qua2V5cyhAZGF0YS5jdXJyZW50RmlsZU1hdGNoZXMpLmxlbmd0aFxuICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCBcbiAgICAgIHRleHQ6YmFkZ2VUZXh0XG4gICAgICAjIHRhYklkOnRhYklkXG4gIFxuICByZW1vdmVCYWRnZVRleHQ6KHRhYklkKSAtPlxuICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCBcbiAgICAgIHRleHQ6JydcbiAgICAgICMgdGFiSWQ6dGFiSWRcblxuICBsc1I6IChkaXIsIG9uc3VjY2Vzcywgb25lcnJvcikgLT5cbiAgICBAcmVzdWx0cyA9IHt9XG5cbiAgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgICAgIFxuICAgICAgdG9kbyA9IDBcbiAgICAgIGlnbm9yZSA9IC8uZ2l0fC5pZGVhfG5vZGVfbW9kdWxlc3xib3dlcl9jb21wb25lbnRzL1xuICAgICAgZGl2ZSA9IChkaXIsIHJlc3VsdHMpIC0+XG4gICAgICAgIHRvZG8rK1xuICAgICAgICByZWFkZXIgPSBkaXIuY3JlYXRlUmVhZGVyKClcbiAgICAgICAgcmVhZGVyLnJlYWRFbnRyaWVzIChlbnRyaWVzKSAtPlxuICAgICAgICAgIHRvZG8tLVxuICAgICAgICAgIGZvciBlbnRyeSBpbiBlbnRyaWVzXG4gICAgICAgICAgICBkbyAoZW50cnkpIC0+XG4gICAgICAgICAgICAgIHJlc3VsdHNbZW50cnkuZnVsbFBhdGhdID0gZW50cnlcbiAgICAgICAgICAgICAgaWYgZW50cnkuZnVsbFBhdGgubWF0Y2goaWdub3JlKSBpcyBudWxsXG4gICAgICAgICAgICAgICAgaWYgZW50cnkuaXNEaXJlY3RvcnlcbiAgICAgICAgICAgICAgICAgIHRvZG8rK1xuICAgICAgICAgICAgICAgICAgZGl2ZSBlbnRyeSwgcmVzdWx0cyBcbiAgICAgICAgICAgICAgIyBzaG93IGVudHJ5XG4gICAgICAgICAgc2hvdyAnb25zdWNjZXNzJyBpZiB0b2RvIGlzIDBcbiAgICAgICAgICAjIHNob3cgJ29uc3VjY2VzcycgcmVzdWx0cyBpZiB0b2RvIGlzIDBcbiAgICAgICAgLChlcnJvcikgLT5cbiAgICAgICAgICB0b2RvLS1cbiAgICAgICAgICAjIHNob3cgZXJyb3JcbiAgICAgICAgICAjIG9uZXJyb3IgZXJyb3IsIHJlc3VsdHMgaWYgdG9kbyBpcyAwIFxuXG4gICAgICAjIGNvbnNvbGUubG9nIGRpdmUgZGlyRW50cnksIEByZXN1bHRzICBcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcGxpY2F0aW9uXG5cblxuIiwiY2xhc3MgQ29uZmlnXG4gICMgQVBQX0lEOiAnY2VjaWZhZnBoZWdob2ZwZmRraGVra2liY2liaGdmZWMnXG4gICMgRVhURU5TSU9OX0lEOiAnZGRkaW1ibmppYmpjYWZib2tuYmdoZWhiZmFqZ2dnZXAnXG4gIEFQUF9JRDogJ2RlbmVmZG9vZm5rZ2ptcGJmcGtuaWhwZ2RoYWhwYmxoJ1xuICBFWFRFTlNJT05fSUQ6ICdpamNqbXBlam9ubWltb29mYmNwYWxpZWpoaWthZW9taCcgIFxuICBTRUxGX0lEOiBjaHJvbWUucnVudGltZS5pZFxuICBpc0NvbnRlbnRTY3JpcHQ6IGxvY2F0aW9uLnByb3RvY29sIGlzbnQgJ2Nocm9tZS1leHRlbnNpb246J1xuICBFWFRfSUQ6IG51bGxcbiAgRVhUX1RZUEU6IG51bGxcbiAgXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIEBFWFRfSUQgPSBpZiBAQVBQX0lEIGlzIEBTRUxGX0lEIHRoZW4gQEVYVEVOU0lPTl9JRCBlbHNlIEBBUFBfSURcbiAgICBARVhUX1RZUEUgPSBpZiBAQVBQX0lEIGlzIEBTRUxGX0lEIHRoZW4gJ0VYVEVOU0lPTicgZWxzZSAnQVBQJ1xuICAgIEBTRUxGX1RZUEUgPSBpZiBAQVBQX0lEIGlzbnQgQFNFTEZfSUQgdGhlbiAnRVhURU5TSU9OJyBlbHNlICdBUFAnXG5cbiAgd3JhcEluYm91bmQ6IChvYmosIGZuYW1lLCBmKSAtPlxuICAgICAgX2tsYXMgPSBvYmpcbiAgICAgIEBMSVNURU4uRXh0IGZuYW1lLCAoYXJncykgLT5cbiAgICAgICAgaWYgYXJncz8uaXNQcm94eT9cbiAgICAgICAgICBpZiB0eXBlb2YgYXJndW1lbnRzWzFdIGlzIFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgaWYgYXJncy5hcmd1bWVudHM/Lmxlbmd0aCA+PSAwXG4gICAgICAgICAgICAgIHJldHVybiBmLmFwcGx5IF9rbGFzLCBhcmdzLmFyZ3VtZW50cy5jb25jYXQgYXJndW1lbnRzWzFdIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gZi5hcHBseSBfa2xhcywgW10uY29uY2F0IGFyZ3VtZW50c1sxXVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGYuYXBwbHkgX2tsYXMsIGFyZ3VtZW50c1xuXG4gIHdyYXBPYmpJbmJvdW5kOiAob2JqKSAtPlxuICAgIChvYmpba2V5XSA9IEB3cmFwSW5ib3VuZCBvYmosIG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgJy4nICsga2V5LCBvYmpba2V5XSkgZm9yIGtleSBvZiBvYmogd2hlbiB0eXBlb2Ygb2JqW2tleV0gaXMgXCJmdW5jdGlvblwiXG4gICAgb2JqXG5cbiAgd3JhcE91dGJvdW5kOiAob2JqLCBmbmFtZSwgZikgLT5cbiAgICAtPlxuICAgICAgbXNnID0ge31cbiAgICAgIG1zZ1tmbmFtZV0gPSBcbiAgICAgICAgaXNQcm94eTp0cnVlXG4gICAgICAgIGFyZ3VtZW50czpBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCBhcmd1bWVudHNcbiAgICAgIG1zZ1tmbmFtZV0uaXNQcm94eSA9IHRydWVcbiAgICAgIF9hcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgYXJndW1lbnRzXG5cbiAgICAgIGlmIF9hcmdzLmxlbmd0aCBpcyAwXG4gICAgICAgIG1zZ1tmbmFtZV0uYXJndW1lbnRzID0gdW5kZWZpbmVkIFxuICAgICAgICByZXR1cm4gQE1TRy5FeHQgbXNnLCAoKSAtPiB1bmRlZmluZWRcblxuICAgICAgbXNnW2ZuYW1lXS5hcmd1bWVudHMgPSBfYXJnc1xuXG4gICAgICBjYWxsYmFjayA9IG1zZ1tmbmFtZV0uYXJndW1lbnRzLnBvcCgpXG4gICAgICBpZiB0eXBlb2YgY2FsbGJhY2sgaXNudCBcImZ1bmN0aW9uXCJcbiAgICAgICAgbXNnW2ZuYW1lXS5hcmd1bWVudHMucHVzaCBjYWxsYmFja1xuICAgICAgICBATVNHLkV4dCBtc2csICgpIC0+IHVuZGVmaW5lZFxuICAgICAgZWxzZVxuICAgICAgICBATVNHLkV4dCBtc2csICgpID0+XG4gICAgICAgICAgYXJneiA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsIGFyZ3VtZW50c1xuICAgICAgICAgICMgcHJveHlBcmdzID0gW2lzUHJveHk6YXJnel1cbiAgICAgICAgICBpZiBhcmd6Py5sZW5ndGggPiAwIGFuZCBhcmd6WzBdPy5pc1Byb3h5P1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkgQCwgYXJnelswXS5pc1Byb3h5IFxuXG4gIHdyYXBPYmpPdXRib3VuZDogKG9iaikgLT5cbiAgICAob2JqW2tleV0gPSBAd3JhcE91dGJvdW5kIG9iaiwgb2JqLmNvbnN0cnVjdG9yLm5hbWUgKyAnLicgKyBrZXksIG9ialtrZXldKSBmb3Iga2V5IG9mIG9iaiB3aGVuIHR5cGVvZiBvYmpba2V5XSBpcyBcImZ1bmN0aW9uXCJcbiAgICBvYmpcblxubW9kdWxlLmV4cG9ydHMgPSBDb25maWciLCJnZXRHbG9iYWwgPSAtPlxuICBfZ2V0R2xvYmFsID0gLT5cbiAgICB0aGlzXG5cbiAgX2dldEdsb2JhbCgpXG5cbnJvb3QgPSBnZXRHbG9iYWwoKVxuXG4jIHJvb3QuYXBwID0gYXBwID0gcmVxdWlyZSAnLi4vLi4vY29tbW9uLmNvZmZlZSdcbiMgYXBwID0gbmV3IGxpYi5BcHBsaWNhdGlvblxuY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0UG9wdXAgcG9wdXA6XCJwb3B1cC5odG1sXCJcblxuXG5cbkFwcGxpY2F0aW9uID0gcmVxdWlyZSAnLi4vLi4vY29tbW9uLmNvZmZlZSdcblJlZGlyZWN0ID0gcmVxdWlyZSAnLi4vLi4vcmVkaXJlY3QuY29mZmVlJ1xuU3RvcmFnZSA9IHJlcXVpcmUgJy4uLy4uL3N0b3JhZ2UuY29mZmVlJ1xuRmlsZVN5c3RlbSA9IHJlcXVpcmUgJy4uLy4uL2ZpbGVzeXN0ZW0uY29mZmVlJ1xuU2VydmVyID0gcmVxdWlyZSAnLi4vLi4vc2VydmVyLmNvZmZlZSdcblxucmVkaXIgPSBuZXcgUmVkaXJlY3RcblxuYXBwID0gcm9vdC5hcHAgPSBuZXcgQXBwbGljYXRpb25cbiAgUmVkaXJlY3Q6IHJlZGlyXG4gIFN0b3JhZ2U6IFN0b3JhZ2VcbiAgRlM6IEZpbGVTeXN0ZW1cbiAgU2VydmVyOiBTZXJ2ZXJcbiAgXG5hcHAuU3RvcmFnZS5yZXRyaWV2ZUFsbChudWxsKVxuIyAgIGFwcC5TdG9yYWdlLmRhdGFba10gPSBkYXRhW2tdIGZvciBrIG9mIGRhdGFcbiAgXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIgKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpID0+XG4gICMgaWYgcmVkaXIuZGF0YVt0YWJJZF0/LmlzT25cbiAgIyAgIGFwcC5tYXBBbGxSZXNvdXJjZXMgKCkgPT5cbiAgIyAgICAgY2hyb21lLnRhYnMuc2V0QmFkZ2VUZXh0IFxuICAjICAgICAgIHRleHQ6T2JqZWN0LmtleXMoYXBwLmN1cnJlbnRGaWxlTWF0Y2hlcykubGVuZ3RoXG4gICMgICAgICAgdGFiSWQ6dGFiSWRcbiAgICAgXG5cblxuIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuXG5jbGFzcyBGaWxlU3lzdGVtXG4gIGFwaTogY2hyb21lLmZpbGVTeXN0ZW1cbiAgcmV0YWluZWREaXJzOiB7fVxuICBMSVNURU46IExJU1RFTi5nZXQoKSBcbiAgTVNHOiBNU0cuZ2V0KClcbiAgcGxhdGZvcm06JydcbiAgY29uc3RydWN0b3I6ICgpIC0+XG4gICAgY2hyb21lLnJ1bnRpbWUuZ2V0UGxhdGZvcm1JbmZvIChpbmZvKSA9PlxuICAgICAgQHBsYXRmb3JtID0gaW5mb1xuICAjIEBkaXJzOiBuZXcgRGlyZWN0b3J5U3RvcmVcbiAgIyBmaWxlVG9BcnJheUJ1ZmZlcjogKGJsb2IsIG9ubG9hZCwgb25lcnJvcikgLT5cbiAgIyAgIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgIyAgIHJlYWRlci5vbmxvYWQgPSBvbmxvYWRcblxuICAjICAgcmVhZGVyLm9uZXJyb3IgPSBvbmVycm9yXG5cbiAgIyAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBibG9iXG5cbiAgcmVhZEZpbGU6IChkaXJFbnRyeSwgcGF0aCwgY2IpIC0+XG4gICAgIyBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXC8vZywnXFxcXCcpIGlmIHBsYXRmb3JtIGlzICd3aW4nXG4gICAgQGdldEZpbGVFbnRyeSBkaXJFbnRyeSwgcGF0aCxcbiAgICAgIChlcnIsIGZpbGVFbnRyeSkgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVycj8gdGhlbiByZXR1cm4gY2I/IGVyclxuXG4gICAgICAgIGZpbGVFbnRyeS5maWxlIChmaWxlKSA9PlxuICAgICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGZpbGVcbiAgICAgICAgLChlcnIpID0+IGNiPyBlcnJcblxuICBnZXRGaWxlRW50cnk6IChkaXJFbnRyeSwgcGF0aCwgY2IpIC0+XG4gICAgIyBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXC8vZywnXFxcXCcpIGlmIHBsYXRmb3JtIGlzICd3aW4nXG4gICAgZGlyRW50cnkuZ2V0RmlsZSBwYXRoLCB7fSwgKGZpbGVFbnRyeSkgPT5cbiAgICAgIGNiPyBudWxsLCBmaWxlRW50cnlcbiAgICAsKGVycikgPT4gY2I/IGVyclxuXG4gICMgb3BlbkRpcmVjdG9yeTogKGNhbGxiYWNrKSAtPlxuICBvcGVuRGlyZWN0b3J5OiAoZGlyZWN0b3J5RW50cnksIGNiKSAtPlxuICAjIEBhcGkuY2hvb3NlRW50cnkgdHlwZTonb3BlbkRpcmVjdG9yeScsIChkaXJlY3RvcnlFbnRyeSwgZmlsZXMpID0+XG4gICAgQGFwaS5nZXREaXNwbGF5UGF0aCBkaXJlY3RvcnlFbnRyeSwgKHBhdGhOYW1lKSA9PlxuICAgICAgZGlyID1cbiAgICAgICAgICByZWxQYXRoOiBkaXJlY3RvcnlFbnRyeS5mdWxsUGF0aCAjLnJlcGxhY2UoJy8nICsgZGlyZWN0b3J5RW50cnkubmFtZSwgJycpXG4gICAgICAgICAgZGlyZWN0b3J5RW50cnlJZDogQGFwaS5yZXRhaW5FbnRyeShkaXJlY3RvcnlFbnRyeSlcbiAgICAgICAgICBlbnRyeTogZGlyZWN0b3J5RW50cnlcbiAgICAgIGNiPyBudWxsLCBwYXRoTmFtZSwgZGlyXG4gICAgICAgICAgIyBAZ2V0T25lRGlyTGlzdCBkaXJcbiAgICAgICAgICAjIFN0b3JhZ2Uuc2F2ZSAnZGlyZWN0b3JpZXMnLCBAc2NvcGUuZGlyZWN0b3JpZXMgKHJlc3VsdCkgLT5cblxuICBnZXRMb2NhbEZpbGVFbnRyeTogKGRpciwgZmlsZVBhdGgsIGNiKSA9PiBcbiAgICAjIGZpbGVQYXRoID0gZmlsZVBhdGgucmVwbGFjZSgvXFwvL2csJ1xcXFwnKSBpZiBwbGF0Zm9ybSBpcyAnd2luJ1xuICAgIGRpckVudHJ5ID0gY2hyb21lLmZpbGVTeXN0ZW0ucmVzdG9yZUVudHJ5IGRpci5kaXJlY3RvcnlFbnRyeUlkLCAoKSAtPlxuICAgIGlmIG5vdCBkaXJFbnRyeT9cbiAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAgICAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBmaWxlUGF0aCwgY2JcbiAgICBlbHNlXG4gICAgICBAZ2V0RmlsZUVudHJ5IGRpckVudHJ5LCBmaWxlUGF0aCwgY2JcblxuXG5cbiAgIyBnZXRMb2NhbEZpbGU6IChkaXIsIGZpbGVQYXRoLCBjYiwgZXJyb3IpID0+IFxuICAjICMgaWYgQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF0/XG4gICMgIyAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiAgIyAjICAgQHJlYWRGaWxlIGRpckVudHJ5LCBmaWxlUGF0aCxcbiAgIyAjICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICMgICAgICAgICBjYj8oZmlsZUVudHJ5LCBmaWxlKVxuICAjICMgICAgICwoX2Vycm9yKSA9PiBlcnJvcihfZXJyb3IpXG4gICMgIyBlbHNlXG4gICMgICBjaHJvbWUuZmlsZVN5c3RlbS5yZXN0b3JlRW50cnkgZGlyLmRpcmVjdG9yeUVudHJ5SWQsIChkaXJFbnRyeSkgPT5cbiAgIyAgICAgIyBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICMgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsIChlcnIsIGZpbGVFbnRyeSwgZmlsZSkgPT5cbiAgIyAgICAgICBpZiBlcnI/IHRoZW4gY2I/IGVyclxuICAjICAgICAgIGNiPyBudWxsLCBmaWxlRW50cnksIGZpbGVcbiAgIyAgICwoX2Vycm9yKSA9PiBjYj8oX2Vycm9yKVxuXG4gICAgICAjIEBmaW5kRmlsZUZvclF1ZXJ5U3RyaW5nIGluZm8udXJpLCBzdWNjZXNzLFxuICAgICAgIyAgICAgKGVycikgPT5cbiAgICAgICMgICAgICAgICBAZmluZEZpbGVGb3JQYXRoIGluZm8sIGNiXG5cbiAgIyBmaW5kRmlsZUZvclBhdGg6IChpbmZvLCBjYikgPT5cbiAgIyAgICAgQGZpbmRGaWxlRm9yUXVlcnlTdHJpbmcgaW5mby51cmksIGNiLCBpbmZvLnJlZmVyZXJcblxuICAjIGZpbmRGaWxlRm9yUXVlcnlTdHJpbmc6IChfdXJsLCBjYiwgZXJyb3IsIHJlZmVyZXIpID0+XG4gICMgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudChfdXJsKS5yZXBsYWNlIC8uKj9zbHJlZGlyXFw9LywgJydcblxuICAjICAgICBtYXRjaCA9IGl0ZW0gZm9yIGl0ZW0gaW4gQG1hcHMgd2hlbiB1cmwubWF0Y2gobmV3IFJlZ0V4cChpdGVtLnVybCkpPyBhbmQgaXRlbS51cmw/IGFuZCBub3QgbWF0Y2g/XG5cbiAgIyAgICAgaWYgbWF0Y2g/XG4gICMgICAgICAgICBpZiByZWZlcmVyP1xuICAjICAgICAgICAgICAgIGZpbGVQYXRoID0gdXJsLm1hdGNoKC8uKlxcL1xcLy4qP1xcLyguKikvKT9bMV1cbiAgIyAgICAgICAgIGVsc2VcbiAgIyAgICAgICAgICAgICBmaWxlUGF0aCA9IHVybC5yZXBsYWNlIG5ldyBSZWdFeHAobWF0Y2gudXJsKSwgbWF0Y2gucmVnZXhSZXBsXG5cbiAgIyAgICAgICAgIGZpbGVQYXRoLnJlcGxhY2UgJy8nLCAnXFxcXCcgaWYgcGxhdGZvcm0gaXMgJ3dpbidcblxuICAjICAgICAgICAgZGlyID0gQFN0b3JhZ2UuZGF0YS5kaXJlY3Rvcmllc1ttYXRjaC5kaXJlY3RvcnldXG5cbiAgIyAgICAgICAgIGlmIG5vdCBkaXI/IHRoZW4gcmV0dXJuIGVyciAnbm8gbWF0Y2gnXG5cbiAgIyAgICAgICAgIGlmIEByZXRhaW5lZERpcnNbZGlyLmRpcmVjdG9yeUVudHJ5SWRdP1xuICAjICAgICAgICAgICAgIGRpckVudHJ5ID0gQHJldGFpbmVkRGlyc1tkaXIuZGlyZWN0b3J5RW50cnlJZF1cbiAgIyAgICAgICAgICAgICBAcmVhZEZpbGUgZGlyRW50cnksIGZpbGVQYXRoLFxuICAjICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgICAgICAgICAgICAgICAgY2I/KGZpbGVFbnRyeSwgZmlsZSlcbiAgIyAgICAgICAgICAgICAgICAgLChlcnJvcikgPT4gZXJyb3IoKVxuICAjICAgICAgICAgZWxzZVxuICAjICAgICAgICAgICAgIGNocm9tZS5maWxlU3lzdGVtLnJlc3RvcmVFbnRyeSBkaXIuZGlyZWN0b3J5RW50cnlJZCwgKGRpckVudHJ5KSA9PlxuICAjICAgICAgICAgICAgICAgICBAcmV0YWluZWREaXJzW2Rpci5kaXJlY3RvcnlFbnRyeUlkXSA9IGRpckVudHJ5XG4gICMgICAgICAgICAgICAgICAgIEByZWFkRmlsZSBkaXJFbnRyeSwgZmlsZVBhdGgsXG4gICMgICAgICAgICAgICAgICAgICAgICAoZmlsZUVudHJ5LCBmaWxlKSA9PlxuICAjICAgICAgICAgICAgICAgICAgICAgICAgIGNiPyhmaWxlRW50cnksIGZpbGUpXG4gICMgICAgICAgICAgICAgICAgICAgICAsKGVycm9yKSA9PiBlcnJvcigpXG4gICMgICAgICAgICAgICAgICAgICwoZXJyb3IpID0+IGVycm9yKClcbiAgIyAgICAgZWxzZVxuICAjICAgICAgICAgZXJyb3IoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVTeXN0ZW0iLCJDb25maWcgPSByZXF1aXJlICcuL2NvbmZpZy5jb2ZmZWUnXG5cbmNsYXNzIExJU1RFTiBleHRlbmRzIENvbmZpZ1xuICBsb2NhbDpcbiAgICBhcGk6IGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZVxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgZXh0ZXJuYWw6XG4gICAgYXBpOiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbFxuICAgIGxpc3RlbmVyczp7fVxuICAgICMgcmVzcG9uc2VDYWxsZWQ6ZmFsc2VcbiAgaW5zdGFuY2UgPSBudWxsXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG5cbiAgICBAbG9jYWwuYXBpLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlXG4gICAgQGV4dGVybmFsLmFwaT8uYWRkTGlzdGVuZXIgQF9vbk1lc3NhZ2VFeHRlcm5hbFxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IExJU1RFTlxuXG4gIHNldFBvcnQ6IChwb3J0KSAtPlxuICAgIEBwb3J0ID0gcG9ydFxuICAgIHBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyIEBfb25NZXNzYWdlRXh0ZXJuYWxcblxuICBMb2NhbDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgIEBsb2NhbC5saXN0ZW5lcnNbbWVzc2FnZV0gPSBjYWxsYmFja1xuXG4gIEV4dDogKG1lc3NhZ2UsIGNhbGxiYWNrKSA9PlxuICAgICMgc2hvdyAnYWRkaW5nIGV4dCBsaXN0ZW5lciBmb3IgJyArIG1lc3NhZ2VcbiAgICBAZXh0ZXJuYWwubGlzdGVuZXJzW21lc3NhZ2VdID0gY2FsbGJhY2tcblxuICBfb25NZXNzYWdlRXh0ZXJuYWw6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuXG4gICAgX3NlbmRSZXNwb25zZSA9ICh3aGF0ZXZlci4uLikgPT5cbiAgICAgIHRyeVxuICAgICAgICAjIHdoYXRldmVyLnNoaWZ0KCkgaWYgd2hhdGV2ZXJbMF0gaXMgbnVsbCBhbmQgd2hhdGV2ZXJbMV0/XG4gICAgICAgIHNlbmRSZXNwb25zZS5hcHBseSBudWxsLHByb3h5QXJncyA9IFtpc1Byb3h5OndoYXRldmVyXVxuXG4gICAgICBjYXRjaCBlXG4gICAgICAgIHVuZGVmaW5lZCAjIGVycm9yIGJlY2F1c2Ugbm8gcmVzcG9uc2Ugd2FzIHJlcXVlc3RlZCBmcm9tIHRoZSBNU0csIGRvbid0IGNhcmVcbiAgICAgIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCA9IHRydWVcbiAgICAgIFxuICAgICMgKHNob3cgXCI8PT0gR09UIEVYVEVSTkFMIE1FU1NBR0UgPT0gI3sgQEVYVF9UWVBFIH0gPT1cIiArIF9rZXkpIGZvciBfa2V5IG9mIHJlcXVlc3RcbiAgICBpZiBzZW5kZXIuaWQ/IFxuICAgICAgaWYgc2VuZGVyLmlkIGlzbnQgQEVYVF9JRCAjYW5kIHNlbmRlci5jb25zdHJ1Y3Rvci5uYW1lIGlzbnQgJ1BvcnQnXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQGV4dGVybmFsLmxpc3RlbmVyc1trZXldPyByZXF1ZXN0W2tleV0sIF9zZW5kUmVzcG9uc2UgZm9yIGtleSBvZiByZXF1ZXN0XG4gICAgXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZCAjIGZvciBzeW5jaHJvbm91cyBzZW5kUmVzcG9uc2VcbiAgICAgICMgc2hvdyAncmV0dXJuaW5nIHRydWUnXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gIF9vbk1lc3NhZ2U6IChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT5cbiAgICByZXNwb25zZVN0YXR1cyA9IGNhbGxlZDpmYWxzZVxuICAgIF9zZW5kUmVzcG9uc2UgPSA9PlxuICAgICAgdHJ5XG4gICAgICAgICMgc2hvdyAnY2FsbGluZyBzZW5kcmVzcG9uc2UnXG4gICAgICAgIHNlbmRSZXNwb25zZS5hcHBseSB0aGlzLGFyZ3VtZW50c1xuICAgICAgY2F0Y2ggZVxuICAgICAgICAjIHNob3cgZVxuICAgICAgcmVzcG9uc2VTdGF0dXMuY2FsbGVkID0gdHJ1ZVxuXG4gICAgIyAoc2hvdyBcIjw9PSBHT1QgTUVTU0FHRSA9PSAjeyBARVhUX1RZUEUgfSA9PVwiICsgX2tleSkgZm9yIF9rZXkgb2YgcmVxdWVzdFxuICAgIEBsb2NhbC5saXN0ZW5lcnNba2V5XT8gcmVxdWVzdFtrZXldLCBfc2VuZFJlc3BvbnNlIGZvciBrZXkgb2YgcmVxdWVzdFxuXG4gICAgdW5sZXNzIHJlc3BvbnNlU3RhdHVzLmNhbGxlZFxuICAgICAgIyBzaG93ICdyZXR1cm5pbmcgdHJ1ZSdcbiAgICAgIHJldHVybiB0cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gTElTVEVOIiwiQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xuXG5jbGFzcyBNU0cgZXh0ZW5kcyBDb25maWdcbiAgaW5zdGFuY2UgPSBudWxsXG4gIHBvcnQ6bnVsbFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuXG4gIEBnZXQ6ICgpIC0+XG4gICAgaW5zdGFuY2UgPz0gbmV3IE1TR1xuXG4gIEBjcmVhdGVQb3J0OiAoKSAtPlxuXG4gIHNldFBvcnQ6IChwb3J0KSAtPlxuICAgIEBwb3J0ID0gcG9ydFxuXG4gIExvY2FsOiAobWVzc2FnZSwgcmVzcG9uZCkgLT5cbiAgICAoc2hvdyBcIj09IE1FU1NBR0UgI3sgX2tleSB9ID09PlwiKSBmb3IgX2tleSBvZiBtZXNzYWdlXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UgbWVzc2FnZSwgcmVzcG9uZFxuICBFeHQ6IChtZXNzYWdlLCByZXNwb25kKSAtPlxuICAgIChzaG93IFwiPT0gTUVTU0FHRSBFWFRFUk5BTCAjeyBfa2V5IH0gPT0+XCIpIGZvciBfa2V5IG9mIG1lc3NhZ2VcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSBARVhUX0lELCBtZXNzYWdlLCByZXNwb25kXG4gIEV4dFBvcnQ6IChtZXNzYWdlKSAtPlxuICAgIHRyeVxuICAgICAgQHBvcnQucG9zdE1lc3NhZ2UgbWVzc2FnZVxuICAgIGNhdGNoXG4gICAgICBzaG93ICdlcnJvcidcbiAgICAgICMgQHBvcnQgPSBjaHJvbWUucnVudGltZS5jb25uZWN0IEBFWFRfSUQgXG4gICAgICAjIEBwb3J0LnBvc3RNZXNzYWdlIG1lc3NhZ2VcblxubW9kdWxlLmV4cG9ydHMgPSBNU0ciLCIvKipcbiAqIERFVkVMT1BFRCBCWVxuICogR0lMIExPUEVTIEJVRU5PXG4gKiBnaWxidWVuby5tYWlsQGdtYWlsLmNvbVxuICpcbiAqIFdPUktTIFdJVEg6XG4gKiBJRSA5KywgRkYgNCssIFNGIDUrLCBXZWJLaXQsIENIIDcrLCBPUCAxMissIEJFU0VOLCBSaGlubyAxLjcrXG4gKlxuICogRk9SSzpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWxhbmtlL1dhdGNoLkpTXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAgICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb21lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAgICAgLy8gbGlrZSBOb2RlLlxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICAgICAgd2luZG93LldhdGNoSlMgPSBmYWN0b3J5KCk7XG4gICAgICAgIHdpbmRvdy53YXRjaCA9IHdpbmRvdy5XYXRjaEpTLndhdGNoO1xuICAgICAgICB3aW5kb3cudW53YXRjaCA9IHdpbmRvdy5XYXRjaEpTLnVud2F0Y2g7XG4gICAgICAgIHdpbmRvdy5jYWxsV2F0Y2hlcnMgPSB3aW5kb3cuV2F0Y2hKUy5jYWxsV2F0Y2hlcnM7XG4gICAgfVxufShmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgV2F0Y2hKUyA9IHtcbiAgICAgICAgbm9Nb3JlOiBmYWxzZVxuICAgIH0sXG4gICAgbGVuZ3Roc3ViamVjdHMgPSBbXTtcblxuICAgIHZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKGZ1bmN0aW9uVG9DaGVjaykge1xuICAgICAgICAgICAgdmFyIGdldFR5cGUgPSB7fTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvblRvQ2hlY2sgJiYgZ2V0VHlwZS50b1N0cmluZy5jYWxsKGZ1bmN0aW9uVG9DaGVjaykgPT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9O1xuXG4gICAgdmFyIGlzSW50ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIHggJSAxID09PSAwO1xuICAgIH07XG5cbiAgICB2YXIgaXNBcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIHZhciBnZXRPYmpEaWZmID0gZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHZhciBhcGx1cyA9IFtdLFxuICAgICAgICBicGx1cyA9IFtdO1xuXG4gICAgICAgIGlmKCEodHlwZW9mIGEgPT0gXCJzdHJpbmdcIikgJiYgISh0eXBlb2YgYiA9PSBcInN0cmluZ1wiKSl7XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KGEpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJbaV0gPT09IHVuZGVmaW5lZCkgYXBsdXMucHVzaChpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBhKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGEuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGJbaV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwbHVzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KGIpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaj0wOyBqPGIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFbal0gPT09IHVuZGVmaW5lZCkgYnBsdXMucHVzaChqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaiBpbiBiKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGIuaGFzT3duUHJvcGVydHkoaikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFbal0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJwbHVzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWRkZWQ6IGFwbHVzLFxuICAgICAgICAgICAgcmVtb3ZlZDogYnBsdXNcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY2xvbmUgPSBmdW5jdGlvbihvYmope1xuXG4gICAgICAgIGlmIChudWxsID09IG9iaiB8fCBcIm9iamVjdFwiICE9IHR5cGVvZiBvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29weSA9IG9iai5jb25zdHJ1Y3RvcigpO1xuXG4gICAgICAgIGZvciAodmFyIGF0dHIgaW4gb2JqKSB7XG4gICAgICAgICAgICBjb3B5W2F0dHJdID0gb2JqW2F0dHJdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvcHk7XG5cbiAgICB9XG5cbiAgICB2YXIgZGVmaW5lR2V0QW5kU2V0ID0gZnVuY3Rpb24gKG9iaiwgcHJvcE5hbWUsIGdldHRlciwgc2V0dGVyKSB7XG4gICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgIE9iamVjdC5vYnNlcnZlKG9ialtwcm9wTmFtZV0sIGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgIHNldHRlcihkYXRhKTsgLy9UT0RPOiBhZGFwdCBvdXIgY2FsbGJhY2sgZGF0YSB0byBtYXRjaCBPYmplY3Qub2JzZXJ2ZSBkYXRhIHNwZWNcbiAgICAgICAgICAgIH0pOyBcblxuICAgICAgICB9IGNhdGNoKGUpIHtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcE5hbWUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXQ6IGdldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXQ6IHNldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2goZTIpIHtcbiAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVHZXR0ZXJfXy5jYWxsKG9iaiwgcHJvcE5hbWUsIGdldHRlcik7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVTZXR0ZXJfXy5jYWxsKG9iaiwgcHJvcE5hbWUsIHNldHRlcik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlMykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ3YXRjaEpTIGVycm9yOiBicm93c2VyIG5vdCBzdXBwb3J0ZWQgOi9cIilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZGVmaW5lUHJvcCA9IGZ1bmN0aW9uIChvYmosIHByb3BOYW1lLCB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcE5hbWUsIHtcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIG9ialtwcm9wTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgd2F0Y2ggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24oYXJndW1lbnRzWzFdKSkge1xuICAgICAgICAgICAgd2F0Y2hBbGwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGFyZ3VtZW50c1sxXSkpIHtcbiAgICAgICAgICAgIHdhdGNoTWFueS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2F0Y2hPbmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgdmFyIHdhdGNoQWxsID0gZnVuY3Rpb24gKG9iaiwgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpIHtcblxuICAgICAgICBpZiAoKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikgfHwgKCEob2JqIGluc3RhbmNlb2YgT2JqZWN0KSAmJiAhaXNBcnJheShvYmopKSkgeyAvL2FjY2VwdHMgb25seSBvYmplY3RzIGFuZCBhcnJheSAobm90IHN0cmluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9wcyA9IFtdO1xuXG5cbiAgICAgICAgaWYoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wID0gMDsgcHJvcCA8IG9iai5sZW5ndGg7IHByb3ArKykgeyAvL2ZvciBlYWNoIGl0ZW0gaWYgb2JqIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBvYmopIHsgLy9mb3IgZWFjaCBhdHRyaWJ1dGUgaWYgb2JqIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcDIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2gocHJvcDIpOyAvL3B1dCBpbiB0aGUgcHJvcHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB3YXRjaE1hbnkob2JqLCBwcm9wcywgd2F0Y2hlciwgbGV2ZWwsIGFkZE5SZW1vdmUsIHBhdGgpOyAvL3dhdGNoIGFsbCBpdGVtcyBvZiB0aGUgcHJvcHNcblxuICAgICAgICBpZiAoYWRkTlJlbW92ZSkge1xuICAgICAgICAgICAgcHVzaFRvTGVuZ3RoU3ViamVjdHMob2JqLCBcIiQkd2F0Y2hsZW5ndGhzdWJqZWN0cm9vdFwiLCB3YXRjaGVyLCBsZXZlbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICB2YXIgd2F0Y2hNYW55ID0gZnVuY3Rpb24gKG9iaiwgcHJvcHMsIHdhdGNoZXIsIGxldmVsLCBhZGROUmVtb3ZlLCBwYXRoKSB7XG5cbiAgICAgICAgaWYgKCh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHx8ICghKG9iaiBpbnN0YW5jZW9mIE9iamVjdCkgJiYgIWlzQXJyYXkob2JqKSkpIHsgLy9hY2NlcHRzIG9ubHkgb2JqZWN0cyBhbmQgYXJyYXkgKG5vdCBzdHJpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8cHJvcHMubGVuZ3RoOyBpKyspIHsgLy93YXRjaCBlYWNoIHByb3BlcnR5XG4gICAgICAgICAgICB2YXIgcHJvcCA9IHByb3BzW2ldO1xuICAgICAgICAgICAgd2F0Y2hPbmUob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgd2F0Y2hPbmUgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCwgYWRkTlJlbW92ZSwgcGF0aCkge1xuXG4gICAgICAgIGlmICgodHlwZW9mIG9iaiA9PSBcInN0cmluZ1wiKSB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoaXNGdW5jdGlvbihvYmpbcHJvcF0pKSB7IC8vZG9udCB3YXRjaCBpZiBpdCBpcyBhIGZ1bmN0aW9uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZihvYmpbcHJvcF0gIT0gbnVsbCAmJiAobGV2ZWwgPT09IHVuZGVmaW5lZCB8fCBsZXZlbCA+IDApKXtcbiAgICAgICAgICAgIHdhdGNoQWxsKG9ialtwcm9wXSwgd2F0Y2hlciwgbGV2ZWwhPT11bmRlZmluZWQ/IGxldmVsLTEgOiBsZXZlbCxudWxsLCBwYXRoICsgJy4nICsgcHJvcCk7IC8vcmVjdXJzaXZlbHkgd2F0Y2ggYWxsIGF0dHJpYnV0ZXMgb2YgdGhpc1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmaW5lV2F0Y2hlcihvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBwYXRoKTtcblxuICAgICAgICBpZihhZGROUmVtb3ZlICYmIChsZXZlbCA9PT0gdW5kZWZpbmVkIHx8IGxldmVsID4gMCkpe1xuICAgICAgICAgICAgcHVzaFRvTGVuZ3RoU3ViamVjdHMob2JqLCBwcm9wLCB3YXRjaGVyLCBsZXZlbCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgdW53YXRjaCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbihhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB1bndhdGNoQWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgICAgICB1bndhdGNoTWFueS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdW53YXRjaE9uZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgdmFyIHVud2F0Y2hBbGwgPSBmdW5jdGlvbiAob2JqLCB3YXRjaGVyKSB7XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFN0cmluZyB8fCAoIShvYmogaW5zdGFuY2VvZiBPYmplY3QpICYmICFpc0FycmF5KG9iaikpKSB7IC8vYWNjZXB0cyBvbmx5IG9iamVjdHMgYW5kIGFycmF5IChub3Qgc3RyaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgdmFyIHByb3BzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wID0gMDsgcHJvcCA8IG9iai5sZW5ndGg7IHByb3ArKykgeyAvL2ZvciBlYWNoIGl0ZW0gaWYgb2JqIGlzIGFuIGFycmF5XG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wKTsgLy9wdXQgaW4gdGhlIHByb3BzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1bndhdGNoTWFueShvYmosIHByb3BzLCB3YXRjaGVyKTsgLy93YXRjaCBhbGwgaXRlbnMgb2YgdGhlIHByb3BzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdW53YXRjaFByb3BzSW5PYmplY3QgPSBmdW5jdGlvbiAob2JqMikge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wcyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AyIGluIG9iajIpIHsgLy9mb3IgZWFjaCBhdHRyaWJ1dGUgaWYgb2JqIGlzIGFuIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqMi5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmoyW3Byb3AyXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVud2F0Y2hQcm9wc0luT2JqZWN0KG9iajJbcHJvcDJdKTsgLy9yZWN1cnMgaW50byBvYmplY3QgcHJvcHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChwcm9wMik7IC8vcHV0IGluIHRoZSBwcm9wc1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVud2F0Y2hNYW55KG9iajIsIHByb3BzLCB3YXRjaGVyKTsgLy91bndhdGNoIGFsbCBvZiB0aGUgcHJvcHNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB1bndhdGNoUHJvcHNJbk9iamVjdChvYmopO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdmFyIHVud2F0Y2hNYW55ID0gZnVuY3Rpb24gKG9iaiwgcHJvcHMsIHdhdGNoZXIpIHtcblxuICAgICAgICBmb3IgKHZhciBwcm9wMiBpbiBwcm9wcykgeyAvL3dhdGNoIGVhY2ggYXR0cmlidXRlIG9mIFwicHJvcHNcIiBpZiBpcyBhbiBvYmplY3RcbiAgICAgICAgICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwcm9wMikpIHtcbiAgICAgICAgICAgICAgICB1bndhdGNoT25lKG9iaiwgcHJvcHNbcHJvcDJdLCB3YXRjaGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZGVmaW5lV2F0Y2hlciA9IGZ1bmN0aW9uIChvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsLCBwYXRoKSB7XG5cbiAgICAgICAgdmFyIHZhbCA9IG9ialtwcm9wXTtcblxuICAgICAgICB3YXRjaEZ1bmN0aW9ucyhvYmosIHByb3ApO1xuXG4gICAgICAgIGlmICghb2JqLndhdGNoZXJzKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wKG9iaiwgXCJ3YXRjaGVyc1wiLCB7fSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICghb2JqLl9wYXRoKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wKG9iaiwgXCJfcGF0aFwiLCBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb2JqLndhdGNoZXJzW3Byb3BdKSB7XG4gICAgICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxvYmoud2F0Y2hlcnNbcHJvcF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKG9iai53YXRjaGVyc1twcm9wXVtpXSA9PT0gd2F0Y2hlcil7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICBvYmoud2F0Y2hlcnNbcHJvcF0ucHVzaCh3YXRjaGVyKTsgLy9hZGQgdGhlIG5ldyB3YXRjaGVyIGluIHRoZSB3YXRjaGVycyBhcnJheVxuXG5cbiAgICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH07XG5cblxuICAgICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld3ZhbCkge1xuICAgICAgICAgICAgdmFyIG9sZHZhbCA9IHZhbDtcbiAgICAgICAgICAgIHZhbCA9IG5ld3ZhbDtcblxuICAgICAgICAgICAgaWYgKGxldmVsICE9PSAwICYmIG9ialtwcm9wXSl7XG4gICAgICAgICAgICAgICAgLy8gd2F0Y2ggc3ViIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICB3YXRjaEFsbChvYmpbcHJvcF0sIHdhdGNoZXIsIChsZXZlbD09PXVuZGVmaW5lZCk/bGV2ZWw6bGV2ZWwtMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdhdGNoRnVuY3Rpb25zKG9iaiwgcHJvcCk7XG5cbiAgICAgICAgICAgIGlmICghV2F0Y2hKUy5ub01vcmUpe1xuICAgICAgICAgICAgICAgIC8vaWYgKEpTT04uc3RyaW5naWZ5KG9sZHZhbCkgIT09IEpTT04uc3RyaW5naWZ5KG5ld3ZhbCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkdmFsICE9PSBuZXd2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKG9iaiwgcHJvcCwgXCJzZXRcIiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgICAgICAgICBXYXRjaEpTLm5vTW9yZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBkZWZpbmVHZXRBbmRTZXQob2JqLCBwcm9wLCBnZXR0ZXIsIHNldHRlcik7XG5cbiAgICB9O1xuXG4gICAgdmFyIGNhbGxXYXRjaGVycyA9IGZ1bmN0aW9uIChvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpIHtcbiAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yICh2YXIgd3I9MDsgd3I8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgd3IrKykge1xuICAgICAgICAgICAgICAgIG9iai53YXRjaGVyc1twcm9wXVt3cl0uY2FsbChvYmosIHByb3AsIGFjdGlvbiwgbmV3dmFsLCBvbGR2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHsvL2NhbGwgYWxsXG4gICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBhY3Rpb24sIG5ld3ZhbCwgb2xkdmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQHRvZG8gY29kZSByZWxhdGVkIHRvIFwid2F0Y2hGdW5jdGlvbnNcIiBpcyBjZXJ0YWlubHkgYnVnZ3lcbiAgICB2YXIgbWV0aG9kTmFtZXMgPSBbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzbGljZScsICd1bnNoaWZ0JywgJ3NwbGljZSddO1xuICAgIHZhciBkZWZpbmVBcnJheU1ldGhvZFdhdGNoZXIgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCBvcmlnaW5hbCwgbWV0aG9kTmFtZSkge1xuICAgICAgICBkZWZpbmVQcm9wKG9ialtwcm9wXSwgbWV0aG9kTmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gb3JpZ2luYWwuYXBwbHkob2JqW3Byb3BdLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgd2F0Y2hPbmUob2JqLCBvYmpbcHJvcF0pO1xuICAgICAgICAgICAgaWYgKG1ldGhvZE5hbWUgIT09ICdzbGljZScpIHtcbiAgICAgICAgICAgICAgICBjYWxsV2F0Y2hlcnMob2JqLCBwcm9wLCBtZXRob2ROYW1lLGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgd2F0Y2hGdW5jdGlvbnMgPSBmdW5jdGlvbihvYmosIHByb3ApIHtcblxuICAgICAgICBpZiAoKCFvYmpbcHJvcF0pIHx8IChvYmpbcHJvcF0gaW5zdGFuY2VvZiBTdHJpbmcpIHx8ICghaXNBcnJheShvYmpbcHJvcF0pKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IG1ldGhvZE5hbWVzLmxlbmd0aCwgbWV0aG9kTmFtZTsgaS0tOykge1xuICAgICAgICAgICAgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgICAgICAgZGVmaW5lQXJyYXlNZXRob2RXYXRjaGVyKG9iaiwgcHJvcCwgb2JqW3Byb3BdW21ldGhvZE5hbWVdLCBtZXRob2ROYW1lKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciB1bndhdGNoT25lID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgd2F0Y2hlcikge1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8b2JqLndhdGNoZXJzW3Byb3BdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdyA9IG9iai53YXRjaGVyc1twcm9wXVtpXTtcblxuICAgICAgICAgICAgaWYodyA9PSB3YXRjaGVyKSB7XG4gICAgICAgICAgICAgICAgb2JqLndhdGNoZXJzW3Byb3BdLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlbW92ZUZyb21MZW5ndGhTdWJqZWN0cyhvYmosIHByb3AsIHdhdGNoZXIpO1xuICAgIH07XG5cbiAgICB2YXIgbG9vcCA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgZm9yKHZhciBpPTA7IGk8bGVuZ3Roc3ViamVjdHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgdmFyIHN1YmogPSBsZW5ndGhzdWJqZWN0c1tpXTtcblxuICAgICAgICAgICAgaWYgKHN1YmoucHJvcCA9PT0gXCIkJHdhdGNobGVuZ3Roc3ViamVjdHJvb3RcIikge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpZmZlcmVuY2UgPSBnZXRPYmpEaWZmKHN1Ymoub2JqLCBzdWJqLmFjdHVhbCk7XG5cbiAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCB8fCBkaWZmZXJlbmNlLnJlbW92ZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZCAhPSBkaWZmZXJlbmNlLnJlbW92ZWQgJiYgKGRpZmZlcmVuY2UuYWRkZWRbMF0gIT0gZGlmZmVyZW5jZS5yZW1vdmVkWzBdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoTWFueShzdWJqLm9iaiwgZGlmZmVyZW5jZS5hZGRlZCwgc3Viai53YXRjaGVyLCBzdWJqLmxldmVsIC0gMSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Ymoud2F0Y2hlci5jYWxsKHN1Ymoub2JqLCBcInJvb3RcIiwgXCJkaWZmZXJlbnRhdHRyXCIsIGRpZmZlcmVuY2UsIHN1YmouYWN0dWFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWJqLmFjdHVhbCA9IGNsb25lKHN1Ymoub2JqKTtcblxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKHN1Ymoub2JqW3N1YmoucHJvcF0gPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHZhciBkaWZmZXJlbmNlID0gZ2V0T2JqRGlmZihzdWJqLm9ialtzdWJqLnByb3BdLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZihkaWZmZXJlbmNlLmFkZGVkLmxlbmd0aCB8fCBkaWZmZXJlbmNlLnJlbW92ZWQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoZGlmZmVyZW5jZS5hZGRlZC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaj0wOyBqPHN1Ymoub2JqLndhdGNoZXJzW3N1YmoucHJvcF0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaE1hbnkoc3Viai5vYmpbc3Viai5wcm9wXSwgZGlmZmVyZW5jZS5hZGRlZCwgc3Viai5vYmoud2F0Y2hlcnNbc3Viai5wcm9wXVtqXSwgc3Viai5sZXZlbCAtIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbFdhdGNoZXJzKHN1Ymoub2JqLCBzdWJqLnByb3AsIFwiZGlmZmVyZW50YXR0clwiLCBkaWZmZXJlbmNlLCBzdWJqLmFjdHVhbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3Viai5hY3R1YWwgPSBjbG9uZShzdWJqLm9ialtzdWJqLnByb3BdKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgcHVzaFRvTGVuZ3RoU3ViamVjdHMgPSBmdW5jdGlvbihvYmosIHByb3AsIHdhdGNoZXIsIGxldmVsKXtcbiAgICAgICAgXG4gICAgICAgIHZhciBhY3R1YWw7XG5cbiAgICAgICAgaWYgKHByb3AgPT09IFwiJCR3YXRjaGxlbmd0aHN1YmplY3Ryb290XCIpIHtcbiAgICAgICAgICAgIGFjdHVhbCA9ICBjbG9uZShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWN0dWFsID0gY2xvbmUob2JqW3Byb3BdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxlbmd0aHN1YmplY3RzLnB1c2goe1xuICAgICAgICAgICAgb2JqOiBvYmosXG4gICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgICAgICAgICB3YXRjaGVyOiB3YXRjaGVyLFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgcmVtb3ZlRnJvbUxlbmd0aFN1YmplY3RzID0gZnVuY3Rpb24ob2JqLCBwcm9wLCB3YXRjaGVyKXtcblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8bGVuZ3Roc3ViamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzdWJqID0gbGVuZ3Roc3ViamVjdHNbaV07XG5cbiAgICAgICAgICAgIGlmIChzdWJqLm9iaiA9PSBvYmogJiYgc3Viai5wcm9wID09IHByb3AgJiYgc3Viai53YXRjaGVyID09IHdhdGNoZXIpIHtcbiAgICAgICAgICAgICAgICBsZW5ndGhzdWJqZWN0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBzZXRJbnRlcnZhbChsb29wLCA1MCk7XG5cbiAgICBXYXRjaEpTLndhdGNoID0gd2F0Y2g7XG4gICAgV2F0Y2hKUy51bndhdGNoID0gdW53YXRjaDtcbiAgICBXYXRjaEpTLmNhbGxXYXRjaGVycyA9IGNhbGxXYXRjaGVycztcblxuICAgIHJldHVybiBXYXRjaEpTO1xuXG59KSk7XG4iLCJjbGFzcyBOb3RpZmljYXRpb25cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgc2hvdzogKHRpdGxlLCBtZXNzYWdlKSAtPlxuICAgIHVuaXF1ZUlkID0gKGxlbmd0aD04KSAtPlxuICAgICAgaWQgPSBcIlwiXG4gICAgICBpZCArPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMikgd2hpbGUgaWQubGVuZ3RoIDwgbGVuZ3RoXG4gICAgICBpZC5zdWJzdHIgMCwgbGVuZ3RoXG5cbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUgdW5pcXVlSWQoKSxcbiAgICAgIHR5cGU6J2Jhc2ljJ1xuICAgICAgdGl0bGU6dGl0bGVcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgIGljb25Vcmw6J2ltYWdlcy9pY29uLTM4LnBuZycsXG4gICAgICAoY2FsbGJhY2spIC0+XG4gICAgICAgIHVuZGVmaW5lZFxuXG5tb2R1bGUuZXhwb3J0cyA9IE5vdGlmaWNhdGlvbiIsImNsYXNzIFJlZGlyZWN0XG4gIGRhdGE6e31cbiAgXG4gIHByZWZpeDpudWxsXG4gIGN1cnJlbnRNYXRjaGVzOnt9XG4gIGN1cnJlbnRUYWJJZDogbnVsbFxuICAjIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI3NzU1XG4gICMgdXJsOiBSZWdFeHBbJyQmJ10sXG4gICMgcHJvdG9jb2w6UmVnRXhwLiQyLFxuICAjIGhvc3Q6UmVnRXhwLiQzLFxuICAjIHBhdGg6UmVnRXhwLiQ0LFxuICAjIGZpbGU6UmVnRXhwLiQ2LCAvLyA4XG4gICMgcXVlcnk6UmVnRXhwLiQ3LFxuICAjIGhhc2g6UmVnRXhwLiQ4XG4gICAgICAgICBcbiAgY29uc3RydWN0b3I6IC0+XG4gIFxuICBnZXRMb2NhbEZpbGVQYXRoV2l0aFJlZGlyZWN0OiAodXJsKSA9PlxuICAgIGZpbGVQYXRoUmVnZXggPSAvXigoaHR0cFtzXT98ZnRwfGNocm9tZS1leHRlbnNpb258ZmlsZSk6XFwvXFwvKT9cXC8/KFteXFwvXFwuXStcXC4pKj8oW15cXC9cXC5dK1xcLlteOlxcL1xcc1xcLl17MiwzfShcXC5bXjpcXC9cXHNcXC5d4oCM4oCLezIsM30pPykoOlxcZCspPygkfFxcLykoW14jP1xcc10rKT8oLio/KT8oI1tcXHdcXC1dKyk/JC9cbiAgIFxuICAgIF9tYXBzID0gW11cbiAgICBpZiBAZGF0YVtAY3VycmVudFRhYklkXT9cbiAgICAgIF9tYXBzLnB1c2ggbWFwIGZvciBtYXAgaW4gQGRhdGFbQGN1cnJlbnRUYWJJZF0ubWFwcyB3aGVuIG1hcC5pc09uXG4gICAgXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIF9tYXBzLmxlbmd0aCA+IDBcblxuICAgIHJlc1BhdGggPSB1cmwubWF0Y2goZmlsZVBhdGhSZWdleCk/WzhdXG4gICAgaWYgbm90IHJlc1BhdGg/XG4gICAgICAjIHRyeSByZWxwYXRoXG4gICAgICByZXNQYXRoID0gdXJsXG5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmVzUGF0aD9cbiAgICBcbiAgICBmb3IgbWFwIGluIF9tYXBzXG4gICAgICByZXNQYXRoID0gdXJsLm1hdGNoKG5ldyBSZWdFeHAobWFwLnVybCkpPyBhbmQgbWFwLnVybD9cblxuICAgICAgaWYgcmVzUGF0aFxuICAgICAgICBpZiByZWZlcmVyP1xuICAgICAgICAgICMgVE9ETzogdGhpc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgZmlsZVBhdGggPSB1cmwucmVwbGFjZSBuZXcgUmVnRXhwKG1hcC51cmwpLCBtYXAucmVnZXhSZXBsXG4gICAgICAgIGJyZWFrXG4gICAgcmV0dXJuIGZpbGVQYXRoXG5cbiAgdGFiOiAodGFiSWQpIC0+XG4gICAgQGN1cnJlbnRUYWJJZCA9IHRhYklkXG4gICAgQGRhdGFbdGFiSWRdID89IGlzT246ZmFsc2VcbiAgICB0aGlzXG5cbiAgd2l0aFByZWZpeDogKHByZWZpeCkgPT5cbiAgICBAcHJlZml4ID0gcHJlZml4XG4gICAgdGhpc1xuXG4gICMgd2l0aERpcmVjdG9yaWVzOiAoZGlyZWN0b3JpZXMpIC0+XG4gICMgICBpZiBkaXJlY3Rvcmllcz8ubGVuZ3RoIGlzIDBcbiAgIyAgICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0uZGlyZWN0b3JpZXMgPSBbXSBcbiAgIyAgICAgQF9zdG9wIEBjdXJyZW50VGFiSWRcbiAgIyAgIGVsc2UgI2lmIE9iamVjdC5rZXlzKEBkYXRhW0BjdXJyZW50VGFiSWRdKS5sZW5ndGggaXMgMFxuICAjICAgICBAZGF0YVtAY3VycmVudFRhYklkXS5kaXJlY3RvcmllcyA9IGRpcmVjdG9yaWVzXG4gICMgICAgIEBzdGFydCgpXG4gICMgICB0aGlzICAgIFxuXG4gIHdpdGhNYXBzOiAobWFwcykgLT5cbiAgICBpZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtYXBzKS5sZW5ndGggaXMgMFxuICAgICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubWFwcyA9IFtdXG4gICAgICBAX3N0b3AgQGN1cnJlbnRUYWJJZFxuICAgIGVsc2UgI2lmIE9iamVjdC5rZXlzKEBkYXRhW0BjdXJyZW50VGFiSWRdKS5sZW5ndGggaXMgMFxuICAgICAgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubWFwcyA9IG1hcHNcbiAgICB0aGlzXG5cbiAgc3RhcnQ6IC0+XG4gICAgdW5sZXNzIEBkYXRhW0BjdXJyZW50VGFiSWRdLmxpc3RlbmVyXG4gICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QucmVtb3ZlTGlzdGVuZXIgQGRhdGFbQGN1cnJlbnRUYWJJZF0ubGlzdGVuZXJcblxuICAgIEBkYXRhW0BjdXJyZW50VGFiSWRdLmxpc3RlbmVyID0gQGNyZWF0ZVJlZGlyZWN0TGlzdGVuZXIoKVxuICAgICMgQGRhdGFbQGN1cnJlbnRUYWJJZF0uaXNPbiA9IHRydWVcbiAgICBAX3N0YXJ0IEBjdXJyZW50VGFiSWRcblxuICBraWxsQWxsOiAoKSAtPlxuICAgIEBfc3RvcCB0YWJJZCBmb3IgdGFiSWQgb2YgQGRhdGFcblxuICBfc3RvcDogKHRhYklkKSAtPlxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5yZW1vdmVMaXN0ZW5lciBAZGF0YVt0YWJJZF0ubGlzdGVuZXJcblxuICBfc3RhcnQ6ICh0YWJJZCkgLT5cbiAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QuYWRkTGlzdGVuZXIgQGRhdGFbdGFiSWRdLmxpc3RlbmVyLFxuICAgICAgdXJsczpbJzxhbGxfdXJscz4nXVxuICAgICAgdGFiSWQ6QGN1cnJlbnRUYWJJZCxcbiAgICAgIFsnYmxvY2tpbmcnXVxuXG4gIGdldEN1cnJlbnRUYWI6IChjYikgLT5cbiAgICAjIHRyaWVkIHRvIGtlZXAgb25seSBhY3RpdmVUYWIgcGVybWlzc2lvbiwgYnV0IG9oIHdlbGwuLlxuICAgIGNocm9tZS50YWJzLnF1ZXJ5XG4gICAgICBhY3RpdmU6dHJ1ZVxuICAgICAgY3VycmVudFdpbmRvdzp0cnVlXG4gICAgLCh0YWJzKSA9PlxuICAgICAgQGN1cnJlbnRUYWJJZCA9IHRhYnNbMF0uaWRcbiAgICAgIGNiPyBAY3VycmVudFRhYklkXG5cbiAgdG9nZ2xlOiAoKSAtPlxuICAgIGlzT24gPSBmYWxzZVxuICAgIGlmIEBkYXRhW0BjdXJyZW50VGFiSWRdPy5tYXBzP1xuICAgICAgZm9yIG0gaW4gQGRhdGFbQGN1cnJlbnRUYWJJZF0/Lm1hcHNcbiAgICAgICAgaWYgbS5pc09uXG4gICAgICAgICAgaXNPbiA9IHRydWVcbiAgICAgICAgICBicmVha1xuICAgICAgICBlbHNlXG4gICAgICAgICAgaXNPbiA9IGZhbHNlXG4gICAgICAjIEBkYXRhW0BjdXJyZW50VGFiSWRdLmlzT24gPSAhQGRhdGFbQGN1cnJlbnRUYWJJZF0uaXNPblxuICAgICAgXG4gICAgICBpZiBpc09uXG4gICAgICAgIEBzdGFydCgpXG4gICAgICBlbHNlXG4gICAgICAgIEBfc3RvcChAY3VycmVudFRhYklkKVxuXG4gICAgICByZXR1cm4gaXNPblxuXG4gIGNyZWF0ZVJlZGlyZWN0TGlzdGVuZXI6ICgpIC0+XG4gICAgKGRldGFpbHMpID0+XG4gICAgICBwYXRoID0gQGdldExvY2FsRmlsZVBhdGhXaXRoUmVkaXJlY3QgZGV0YWlscy51cmxcbiAgICAgIGlmIHBhdGg/IGFuZCBwYXRoLmluZGV4T2YgQHByZWZpeCBpcyAtMVxuICAgICAgICByZXR1cm4gcmVkaXJlY3RVcmw6QHByZWZpeCArIHBhdGhcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHt9IFxuXG4gIHRvRGljdDogKG9iaixrZXkpIC0+XG4gICAgb2JqLnJlZHVjZSAoKGRpY3QsIF9vYmopIC0+IGRpY3RbIF9vYmpba2V5XSBdID0gX29iaiBpZiBfb2JqW2tleV0/OyByZXR1cm4gZGljdCksIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gUmVkaXJlY3RcbiIsIiNUT0RPOiByZXdyaXRlIHRoaXMgY2xhc3MgdXNpbmcgdGhlIG5ldyBjaHJvbWUuc29ja2V0cy4qIGFwaSB3aGVuIHlvdSBjYW4gbWFuYWdlIHRvIG1ha2UgaXQgd29ya1xuY2xhc3MgU2VydmVyXG4gIHNvY2tldDogY2hyb21lLnNvY2tldFxuICAjIHRjcDogY2hyb21lLnNvY2tldHMudGNwXG4gIHNvY2tldFByb3BlcnRpZXM6XG4gICAgICBwZXJzaXN0ZW50OnRydWVcbiAgICAgIG5hbWU6J1NMUmVkaXJlY3RvcidcbiAgIyBzb2NrZXRJbmZvOm51bGxcbiAgZ2V0TG9jYWxGaWxlOm51bGxcbiAgc29ja2V0SWRzOltdXG4gIHN0YXR1czpcbiAgICBob3N0Om51bGxcbiAgICBwb3J0Om51bGxcbiAgICBtYXhDb25uZWN0aW9uczo1MFxuICAgIGlzT246ZmFsc2VcbiAgICBzb2NrZXRJbmZvOm51bGxcbiAgICB1cmw6bnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIEBzdGF0dXMuaG9zdCA9IFwiMTI3LjAuMC4xXCJcbiAgICBAc3RhdHVzLnBvcnQgPSAxMDAxMlxuICAgIEBzdGF0dXMubWF4Q29ubmVjdGlvbnMgPSA1MFxuICAgIEBzdGF0dXMudXJsID0gJ2h0dHA6Ly8nICsgQHN0YXR1cy5ob3N0ICsgJzonICsgQHN0YXR1cy5wb3J0ICsgJy8nXG4gICAgQHN0YXR1cy5pc09uID0gZmFsc2VcblxuXG4gIHN0YXJ0OiAoaG9zdCxwb3J0LG1heENvbm5lY3Rpb25zLCBjYikgLT5cbiAgICBpZiBob3N0PyB0aGVuIEBzdGF0dXMuaG9zdCA9IGhvc3RcbiAgICBpZiBwb3J0PyB0aGVuIEBzdGF0dXMucG9ydCA9IHBvcnRcbiAgICBpZiBtYXhDb25uZWN0aW9ucz8gdGhlbiBAc3RhdHVzLm1heENvbm5lY3Rpb25zID0gbWF4Q29ubmVjdGlvbnNcblxuICAgIEBraWxsQWxsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICByZXR1cm4gY2I/IGVyciBpZiBlcnI/XG5cbiAgICAgIEBzdGF0dXMuaXNPbiA9IGZhbHNlXG4gICAgICBAc29ja2V0LmNyZWF0ZSAndGNwJywge30sIChzb2NrZXRJbmZvKSA9PlxuICAgICAgICBAc3RhdHVzLnNvY2tldEluZm8gPSBzb2NrZXRJbmZvXG4gICAgICAgIEBzb2NrZXRJZHMgPSBbXVxuICAgICAgICBAc29ja2V0SWRzLnB1c2ggQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0ICdzb2NrZXRJZHMnOkBzb2NrZXRJZHNcbiAgICAgICAgQHNvY2tldC5saXN0ZW4gQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkLCBAc3RhdHVzLmhvc3QsIEBzdGF0dXMucG9ydCwgKHJlc3VsdCkgPT5cbiAgICAgICAgICBpZiByZXN1bHQgPiAtMVxuICAgICAgICAgICAgc2hvdyAnbGlzdGVuaW5nICcgKyBAc3RhdHVzLnNvY2tldEluZm8uc29ja2V0SWRcbiAgICAgICAgICAgIEBzdGF0dXMuaXNPbiA9IHRydWVcbiAgICAgICAgICAgIEBzb2NrZXQuYWNjZXB0IEBzdGF0dXMuc29ja2V0SW5mby5zb2NrZXRJZCwgQF9vbkFjY2VwdFxuICAgICAgICAgICAgY2I/IG51bGwsIEBzdGF0dXNcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjYj8gcmVzdWx0XG5cblxuICBraWxsQWxsOiAoY2IpIC0+XG4gICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQgJ3NvY2tldElkcycsIChyZXN1bHQpID0+XG4gICAgICBAc29ja2V0SWRzID0gcmVzdWx0LnNvY2tldElkc1xuICAgICAgQHN0YXR1cy5pc09uID0gZmFsc2VcbiAgICAgIHJldHVybiBjYj8gbnVsbCwgJ3N1Y2Nlc3MnIHVubGVzcyBAc29ja2V0SWRzP1xuICAgICAgY250ID0gMFxuICAgICAgZm9yIHMgaW4gQHNvY2tldElkc1xuICAgICAgICBkbyAocykgPT5cbiAgICAgICAgICBjbnQrK1xuICAgICAgICAgIEBzb2NrZXQuZ2V0SW5mbyBzLCAoc29ja2V0SW5mbykgPT5cbiAgICAgICAgICAgIGNudC0tXG4gICAgICAgICAgICBpZiBub3QgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yP1xuICAgICAgICAgICAgICBAc29ja2V0LmRpc2Nvbm5lY3QgcyBpZiBAc3RhdHVzLnNvY2tldEluZm8/LmNvbm5lY3RlZCBvciBub3QgQHN0YXR1cy5zb2NrZXRJbmZvP1xuICAgICAgICAgICAgICBAc29ja2V0LmRlc3Ryb3kgc1xuXG4gICAgICAgICAgICBjYj8gbnVsbCwgJ3N1Y2Nlc3MnIGlmIGNudCBpcyAwXG5cbiAgc3RvcDogKGNiKSAtPlxuICAgIEBraWxsQWxsIChlcnIsIHN1Y2Nlc3MpID0+XG4gICAgICBpZiBlcnI/IFxuICAgICAgICBjYj8gZXJyXG4gICAgICBlbHNlXG4gICAgICAgIGNiPyBudWxsLHN1Y2Nlc3NcblxuXG4gIF9vblJlY2VpdmU6IChyZWNlaXZlSW5mbykgPT5cbiAgICBzaG93KFwiQ2xpZW50IHNvY2tldCAncmVjZWl2ZScgZXZlbnQ6IHNkPVwiICsgcmVjZWl2ZUluZm8uc29ja2V0SWRcbiAgICArIFwiLCBieXRlcz1cIiArIHJlY2VpdmVJbmZvLmRhdGEuYnl0ZUxlbmd0aClcblxuICBfb25MaXN0ZW46IChzZXJ2ZXJTb2NrZXRJZCwgcmVzdWx0Q29kZSkgPT5cbiAgICByZXR1cm4gc2hvdyAnRXJyb3IgTGlzdGVuaW5nOiAnICsgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UgaWYgcmVzdWx0Q29kZSA8IDBcbiAgICBAc2VydmVyU29ja2V0SWQgPSBzZXJ2ZXJTb2NrZXRJZFxuICAgIEB0Y3BTZXJ2ZXIub25BY2NlcHQuYWRkTGlzdGVuZXIgQF9vbkFjY2VwdFxuICAgIEB0Y3BTZXJ2ZXIub25BY2NlcHRFcnJvci5hZGRMaXN0ZW5lciBAX29uQWNjZXB0RXJyb3JcbiAgICBAdGNwLm9uUmVjZWl2ZS5hZGRMaXN0ZW5lciBAX29uUmVjZWl2ZVxuICAgICMgc2hvdyBcIltcIitzb2NrZXRJbmZvLnBlZXJBZGRyZXNzK1wiOlwiK3NvY2tldEluZm8ucGVlclBvcnQrXCJdIENvbm5lY3Rpb24gYWNjZXB0ZWQhXCI7XG4gICAgIyBpbmZvID0gQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJbmZvLnNvY2tldElkXG4gICAgIyBAZ2V0RmlsZSB1cmksIChmaWxlKSAtPlxuICBfb25BY2NlcHRFcnJvcjogKGVycm9yKSAtPlxuICAgIHNob3cgZXJyb3JcblxuICBfb25BY2NlcHQ6IChzb2NrZXRJbmZvKSA9PlxuICAgICMgcmV0dXJuIG51bGwgaWYgaW5mby5zb2NrZXRJZCBpc250IEBzZXJ2ZXJTb2NrZXRJZFxuICAgIHNob3coXCJTZXJ2ZXIgc29ja2V0ICdhY2NlcHQnIGV2ZW50OiBzZD1cIiArIHNvY2tldEluZm8uc29ja2V0SWQpXG4gICAgaWYgc29ja2V0SW5mbz8uc29ja2V0SWQ/XG4gICAgICBAX3JlYWRGcm9tU29ja2V0IHNvY2tldEluZm8uc29ja2V0SWQsIChlcnIsIGluZm8pID0+XG4gICAgICAgIFxuICAgICAgICBpZiBlcnI/IHRoZW4gcmV0dXJuIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG5cbiAgICAgICAgQGdldExvY2FsRmlsZSBpbmZvLCAoZXJyLCBmaWxlRW50cnksIGZpbGVSZWFkZXIpID0+XG4gICAgICAgICAgaWYgZXJyPyB0aGVuIEBfd3JpdGVFcnJvciBzb2NrZXRJbmZvLnNvY2tldElkLCA0MDQsIGluZm8ua2VlcEFsaXZlXG4gICAgICAgICAgZWxzZSBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SW5mby5zb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlUmVhZGVyLCBpbmZvLmtlZXBBbGl2ZVxuICAgIGVsc2VcbiAgICAgIHNob3cgXCJObyBzb2NrZXQ/IVwiXG4gICAgIyBAc29ja2V0LmFjY2VwdCBzb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cblxuXG4gIHN0cmluZ1RvVWludDhBcnJheTogKHN0cmluZykgLT5cbiAgICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyaW5nLmxlbmd0aClcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIGkgPSAwXG5cbiAgICB3aGlsZSBpIDwgc3RyaW5nLmxlbmd0aFxuICAgICAgdmlld1tpXSA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG4gICAgICBpKytcbiAgICB2aWV3XG5cbiAgYXJyYXlCdWZmZXJUb1N0cmluZzogKGJ1ZmZlcikgLT5cbiAgICBzdHIgPSBcIlwiXG4gICAgdUFycmF5VmFsID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICAgIHMgPSAwXG5cbiAgICB3aGlsZSBzIDwgdUFycmF5VmFsLmxlbmd0aFxuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodUFycmF5VmFsW3NdKVxuICAgICAgcysrXG4gICAgc3RyXG5cbiAgX3dyaXRlMjAwUmVzcG9uc2U6IChzb2NrZXRJZCwgZmlsZUVudHJ5LCBmaWxlLCBrZWVwQWxpdmUpIC0+XG4gICAgY29udGVudFR5cGUgPSAoaWYgKGZpbGUudHlwZSBpcyBcIlwiKSB0aGVuIFwidGV4dC9wbGFpblwiIGVsc2UgZmlsZS50eXBlKVxuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgMjAwIE9LXFxuQ29udGVudC1sZW5ndGg6IFwiICsgZmlsZS5zaXplICsgXCJcXG5Db250ZW50LXR5cGU6XCIgKyBjb250ZW50VHlwZSArICgoaWYga2VlcEFsaXZlIHRoZW4gXCJcXG5Db25uZWN0aW9uOiBrZWVwLWFsaXZlXCIgZWxzZSBcIlwiKSkgKyBcIlxcblxcblwiKVxuICAgIG91dHB1dEJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihoZWFkZXIuYnl0ZUxlbmd0aCArIGZpbGUuc2l6ZSlcbiAgICB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0QnVmZmVyKVxuICAgIHZpZXcuc2V0IGhlYWRlciwgMFxuXG4gICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXJcbiAgICByZWFkZXIub25sb2FkID0gKGV2KSA9PlxuICAgICAgdmlldy5zZXQgbmV3IFVpbnQ4QXJyYXkoZXYudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgICBAc29ja2V0LndyaXRlIHNvY2tldElkLCBvdXRwdXRCdWZmZXIsICh3cml0ZUluZm8pID0+XG4gICAgICAgIHNob3cgd3JpdGVJbmZvXG4gICAgICAgICMgQF9yZWFkRnJvbVNvY2tldCBzb2NrZXRJZFxuICAgICAgICBAZW5kIHNvY2tldElkLCBrZWVwQWxpdmVcbiAgICByZWFkZXIub25lcnJvciA9IChlcnJvcikgPT5cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciBmaWxlXG5cblxuICAgICMgQGVuZCBzb2NrZXRJZFxuICAgICMgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAjIGZpbGVSZWFkZXIub25sb2FkID0gKGUpID0+XG4gICAgIyAgIHZpZXcuc2V0IG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCksIGhlYWRlci5ieXRlTGVuZ3RoXG4gICAgIyAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAjICAgICBzaG93IFwiV1JJVEVcIiwgd3JpdGVJbmZvXG4gICAgIyAgICAgICBAX3dyaXRlMjAwUmVzcG9uc2Ugc29ja2V0SWRcblxuXG4gIF9yZWFkRnJvbVNvY2tldDogKHNvY2tldElkLCBjYikgLT5cbiAgICBAc29ja2V0LnJlYWQgc29ja2V0SWQsIChyZWFkSW5mbykgPT5cbiAgICAgIHNob3cgXCJSRUFEXCIsIHJlYWRJbmZvXG5cbiAgICAgICMgUGFyc2UgdGhlIHJlcXVlc3QuXG4gICAgICBkYXRhID0gQGFycmF5QnVmZmVyVG9TdHJpbmcocmVhZEluZm8uZGF0YSlcbiAgICAgIHNob3cgZGF0YVxuXG4gICAgICBrZWVwQWxpdmUgPSBmYWxzZVxuICAgICAga2VlcEFsaXZlID0gdHJ1ZSBpZiBkYXRhLmluZGV4T2YgJ0Nvbm5lY3Rpb246IGtlZXAtYWxpdmUnIGlzbnQgLTFcblxuICAgICAgaWYgZGF0YS5pbmRleE9mKFwiR0VUIFwiKSBpc250IDBcbiAgICAgICAgcmV0dXJuIGNiPyAnNDA0Jywga2VlcEFsaXZlOmtlZXBBbGl2ZVxuXG5cblxuICAgICAgdXJpRW5kID0gZGF0YS5pbmRleE9mKFwiIFwiLCA0KVxuXG4gICAgICByZXR1cm4gZW5kIHNvY2tldElkIGlmIHVyaUVuZCA8IDBcblxuICAgICAgdXJpID0gZGF0YS5zdWJzdHJpbmcoNCwgdXJpRW5kKVxuICAgICAgaWYgbm90IHVyaT9cbiAgICAgICAgcmV0dXJuIGNiPyAnNDA0Jywga2VlcEFsaXZlOmtlZXBBbGl2ZVxuXG4gICAgICBpbmZvID1cbiAgICAgICAgdXJpOiB1cmlcbiAgICAgICAga2VlcEFsaXZlOmtlZXBBbGl2ZVxuICAgICAgaW5mby5yZWZlcmVyID0gZGF0YS5tYXRjaCgvUmVmZXJlcjpcXHMoLiopLyk/WzFdXG4gICAgICAjc3VjY2Vzc1xuICAgICAgY2I/IG51bGwsIGluZm9cblxuICBlbmQ6IChzb2NrZXRJZCwga2VlcEFsaXZlKSAtPlxuICAgICAgIyBpZiBrZWVwQWxpdmVcbiAgICAgICMgICBAX3JlYWRGcm9tU29ja2V0IHNvY2tldElkXG4gICAgICAjIGVsc2VcbiAgICBAc29ja2V0LmRpc2Nvbm5lY3Qgc29ja2V0SWRcbiAgICBAc29ja2V0LmRlc3Ryb3kgc29ja2V0SWRcbiAgICBzaG93ICdlbmRpbmcgJyArIHNvY2tldElkXG4gICAgQHNvY2tldC5hY2NlcHQgQHN0YXR1cy5zb2NrZXRJbmZvLnNvY2tldElkLCBAX29uQWNjZXB0XG5cbiAgX3dyaXRlRXJyb3I6IChzb2NrZXRJZCwgZXJyb3JDb2RlLCBrZWVwQWxpdmUpIC0+XG4gICAgZmlsZSA9IHNpemU6IDBcbiAgICBjb25zb2xlLmluZm8gXCJ3cml0ZUVycm9yUmVzcG9uc2U6OiBiZWdpbi4uLiBcIlxuICAgIGNvbnNvbGUuaW5mbyBcIndyaXRlRXJyb3JSZXNwb25zZTo6IGZpbGUgPSBcIiArIGZpbGVcbiAgICBjb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiICMoZmlsZS50eXBlID09PSBcIlwiKSA/IFwidGV4dC9wbGFpblwiIDogZmlsZS50eXBlO1xuICAgIGNvbnRlbnRMZW5ndGggPSBmaWxlLnNpemVcbiAgICBoZWFkZXIgPSBAc3RyaW5nVG9VaW50OEFycmF5KFwiSFRUUC8xLjAgXCIgKyBlcnJvckNvZGUgKyBcIiBOb3QgRm91bmRcXG5Db250ZW50LWxlbmd0aDogXCIgKyBmaWxlLnNpemUgKyBcIlxcbkNvbnRlbnQtdHlwZTpcIiArIGNvbnRlbnRUeXBlICsgKChpZiBrZWVwQWxpdmUgdGhlbiBcIlxcbkNvbm5lY3Rpb246IGtlZXAtYWxpdmVcIiBlbHNlIFwiXCIpKSArIFwiXFxuXFxuXCIpXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIGhlYWRlci4uLlwiXG4gICAgb3V0cHV0QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGhlYWRlci5ieXRlTGVuZ3RoICsgZmlsZS5zaXplKVxuICAgIHZpZXcgPSBuZXcgVWludDhBcnJheShvdXRwdXRCdWZmZXIpXG4gICAgdmlldy5zZXQgaGVhZGVyLCAwXG4gICAgY29uc29sZS5pbmZvIFwid3JpdGVFcnJvclJlc3BvbnNlOjogRG9uZSBzZXR0aW5nIHZpZXcuLi5cIlxuICAgIEBzb2NrZXQud3JpdGUgc29ja2V0SWQsIG91dHB1dEJ1ZmZlciwgKHdyaXRlSW5mbykgPT5cbiAgICAgIHNob3cgXCJXUklURVwiLCB3cml0ZUluZm9cbiAgICAgIEBlbmQgc29ja2V0SWQsIGtlZXBBbGl2ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlcnZlclxuIiwiTElTVEVOID0gcmVxdWlyZSAnLi9saXN0ZW4uY29mZmVlJ1xuTVNHID0gcmVxdWlyZSAnLi9tc2cuY29mZmVlJ1xuXG5XYXRjaEpTID0gcmVxdWlyZSAnd2F0Y2hqcydcbndhdGNoID0gV2F0Y2hKUy53YXRjaFxudW53YXRjaCA9IFdhdGNoSlMudW53YXRjaFxuY2FsbFdhdGNoZXJzID0gV2F0Y2hKUy5jYWxsV2F0Y2hlcnNcblxuY2xhc3MgU3RvcmFnZVxuICBhcGk6IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gIExJU1RFTjogTElTVEVOLmdldCgpIFxuICBNU0c6IE1TRy5nZXQoKVxuICBkYXRhOiBcbiAgICBjdXJyZW50UmVzb3VyY2VzOiBbXVxuICAgIGRpcmVjdG9yaWVzOltdXG4gICAgbWFwczpbXVxuICAgIHRhYk1hcHM6e31cbiAgICBjdXJyZW50RmlsZU1hdGNoZXM6e31cbiAgXG4gIHNlc3Npb246e31cblxuICBvbkRhdGFMb2FkZWQ6IC0+XG5cbiAgY2FsbGJhY2s6ICgpIC0+XG4gIG5vdGlmeU9uQ2hhbmdlOiAoKSAtPlxuICBjb25zdHJ1Y3RvcjogKF9vbkRhdGFMb2FkZWQpIC0+XG4gICAgQG9uRGF0YUxvYWRlZCA9IF9vbkRhdGFMb2FkZWQgaWYgX29uRGF0YUxvYWRlZD9cbiAgICBAYXBpLmdldCAocmVzdWx0cykgPT5cbiAgICAgIEBkYXRhW2tdID0gcmVzdWx0c1trXSBmb3IgayBvZiByZXN1bHRzXG5cbiAgICAgIHdhdGNoQW5kTm90aWZ5IEAsJ2RhdGFDaGFuZ2VkJywgQGRhdGEsIHRydWVcblxuICAgICAgd2F0Y2hBbmROb3RpZnkgQCwnc2Vzc2lvbkRhdGEnLCBAc2Vzc2lvbiwgZmFsc2VcblxuICAgICAgQG9uRGF0YUxvYWRlZCBAZGF0YVxuXG4gICAgQGluaXQoKVxuXG4gIGluaXQ6ICgpIC0+XG4gICAgXG4gIHdhdGNoQW5kTm90aWZ5ID0gKF90aGlzLCBtc2dLZXksIG9iaiwgc3RvcmUpIC0+XG5cbiAgICAgIF9saXN0ZW5lciA9IChwcm9wLCBhY3Rpb24sIG5ld1ZhbCwgb2xkVmFsKSAtPlxuICAgICAgICBpZiAoYWN0aW9uIGlzIFwic2V0XCIgb3IgXCJkaWZmZXJlbnRhdHRyXCIpIGFuZCBfdGhpcy5ub1dhdGNoIGlzIGZhbHNlXG4gICAgICAgICAgaWYgbm90IC9eXFxkKyQvLnRlc3QocHJvcClcbiAgICAgICAgICAgIHNob3cgYXJndW1lbnRzXG4gICAgICAgICAgICBfdGhpcy5hcGkuc2V0IG9iaiBpZiBzdG9yZVxuICAgICAgICAgICAgbXNnID0ge31cbiAgICAgICAgICAgIG1zZ1ttc2dLZXldID0gb2JqXG4gICAgICAgICAgICAjIHVud2F0Y2ggb2JqLCBfbGlzdGVuZXIsMyx0cnVlXG4gICAgICAgICAgICBfdGhpcy5NU0cuRXh0UG9ydCBtc2dcbiAgICAgICAgXG4gICAgICBfdGhpcy5ub1dhdGNoID0gZmFsc2VcbiAgICAgIHdhdGNoIG9iaiwgX2xpc3RlbmVyLDMsdHJ1ZVxuXG4gICAgICBfdGhpcy5MSVNURU4uRXh0IG1zZ0tleSwgKGRhdGEpIC0+XG4gICAgICAgIF90aGlzLm5vV2F0Y2ggPSB0cnVlXG4gICAgICAgICMgdW53YXRjaCBvYmosIF9saXN0ZW5lciwzLHRydWVcbiAgICAgICAgXG4gICAgICAgIG9ialtrXSA9IGRhdGFba10gZm9yIGsgb2YgZGF0YVxuICAgICAgICBzZXRUaW1lb3V0ICgpIC0+IFxuICAgICAgICAgIF90aGlzLm5vV2F0Y2ggPSBmYWxzZVxuICAgICAgICAsMjAwXG5cbiAgc2F2ZTogKGtleSwgaXRlbSwgY2IpIC0+XG5cbiAgICBvYmogPSB7fVxuICAgIG9ialtrZXldID0gaXRlbVxuICAgIEBkYXRhW2tleV0gPSBpdGVtXG4gICAgQGFwaS5zZXQgb2JqLCAocmVzKSA9PlxuICAgICAgY2I/KClcbiAgICAgIEBjYWxsYmFjaz8oKVxuIFxuICBzYXZlQWxsOiAoZGF0YSwgY2IpIC0+XG5cbiAgICBpZiBkYXRhPyBcbiAgICAgIEBhcGkuc2V0IGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gXG4gICAgZWxzZVxuICAgICAgQGFwaS5zZXQgQGRhdGEsICgpID0+XG4gICAgICAgIGNiPygpXG4gXG5cbiAgcmV0cmlldmU6IChrZXksIGNiKSAtPlxuICAgIEBvYnNlcnZlci5zdG9wKClcbiAgICBAYXBpLmdldCBrZXksIChyZXN1bHRzKSAtPlxuICAgICAgQGRhdGFbcl0gPSByZXN1bHRzW3JdIGZvciByIG9mIHJlc3VsdHNcbiAgICAgIGlmIGNiPyB0aGVuIGNiIHJlc3VsdHNba2V5XVxuXG4gIHJldHJpZXZlQWxsOiAoY2IpIC0+XG4gICAgIyBAb2JzZXJ2ZXIuc3RvcCgpXG4gICAgQGFwaS5nZXQgKHJlc3VsdCkgPT5cbiAgICAgIGZvciBjIG9mIHJlc3VsdCBcbiAgICAgICMgICBkZWxldGUgQGRhdGFbY11cbiAgICAgICAgQGRhdGFbY10gPSByZXN1bHRbY10gXG4gICAgICAjIEBkYXRhID0gcmVzdWx0XG4gICAgICAgIEBNU0cuRXh0UG9ydCAnZGF0YUNoYW5nZWQnOlxuICAgICAgICAgIHBhdGg6Y1xuICAgICAgICAgIHZhbHVlOnJlc3VsdFtjXVxuIFxuXG4gICAgICBAYXBpLnNldCBAZGF0YVxuICAgICAgIyBAY2FsbGJhY2s/IHJlc3VsdFxuICAgICAgY2I/IHJlc3VsdFxuICAgICAgQG9uRGF0YUxvYWRlZCBAZGF0YVxuXG4gIG9uRGF0YUxvYWRlZDogKGRhdGEpIC0+XG5cbiAgb25DaGFuZ2VkOiAoa2V5LCBjYikgLT5cbiAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIgKGNoYW5nZXMsIG5hbWVzcGFjZSkgLT5cbiAgICAgIGlmIGNoYW5nZXNba2V5XT8gYW5kIGNiPyB0aGVuIGNiIGNoYW5nZXNba2V5XS5uZXdWYWx1ZVxuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzXG5cbiAgb25DaGFuZ2VkQWxsOiAoKSAtPlxuICAgIGNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lciAoY2hhbmdlcyxuYW1lc3BhY2UpID0+XG4gICAgICBoYXNDaGFuZ2VzID0gZmFsc2VcbiAgICAgIGZvciBjIG9mIGNoYW5nZXMgd2hlbiBjaGFuZ2VzW2NdLm5ld1ZhbHVlICE9IGNoYW5nZXNbY10ub2xkVmFsdWUgYW5kIGMgaXNudCdzb2NrZXRJZHMnXG4gICAgICAgIChjKSA9PiBcbiAgICAgICAgICBAZGF0YVtjXSA9IGNoYW5nZXNbY10ubmV3VmFsdWUgXG4gICAgICAgICAgc2hvdyAnZGF0YSBjaGFuZ2VkOiAnXG4gICAgICAgICAgc2hvdyBjXG4gICAgICAgICAgc2hvdyBAZGF0YVtjXVxuXG4gICAgICAgICAgaGFzQ2hhbmdlcyA9IHRydWVcblxuICAgICAgQGNhbGxiYWNrPyBjaGFuZ2VzIGlmIGhhc0NoYW5nZXNcbiAgICAgIHNob3cgJ2NoYW5nZWQnIGlmIGhhc0NoYW5nZXNcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlXG4iLCIjIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxNzQyMDkzXG5tb2R1bGUuZXhwb3J0cyA9ICgoKSAtPlxuXG4gIGRlYnVnID0gZmFsc2VcbiAgXG4gIHJldHVybiAod2luZG93LnNob3cgPSAoKSAtPikgaWYgbm90IGRlYnVnXG5cbiAgbWV0aG9kcyA9IFtcbiAgICAnYXNzZXJ0JywgJ2NsZWFyJywgJ2NvdW50JywgJ2RlYnVnJywgJ2RpcicsICdkaXJ4bWwnLCAnZXJyb3InLFxuICAgICdleGNlcHRpb24nLCAnZ3JvdXAnLCAnZ3JvdXBDb2xsYXBzZWQnLCAnZ3JvdXBFbmQnLCAnaW5mbycsICdsb2cnLFxuICAgICdtYXJrVGltZWxpbmUnLCAncHJvZmlsZScsICdwcm9maWxlRW5kJywgJ3RhYmxlJywgJ3RpbWUnLCAndGltZUVuZCcsXG4gICAgJ3RpbWVTdGFtcCcsICd0cmFjZScsICd3YXJuJ11cbiAgICBcbiAgbm9vcCA9ICgpIC0+XG4gICAgIyBzdHViIHVuZGVmaW5lZCBtZXRob2RzLlxuICAgIGZvciBtIGluIG1ldGhvZHMgIHdoZW4gICFjb25zb2xlW21dXG4gICAgICBjb25zb2xlW21dID0gbm9vcFxuXG5cbiAgaWYgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQ/XG4gICAgd2luZG93LnNob3cgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlKVxuICBlbHNlXG4gICAgd2luZG93LnNob3cgPSAoKSAtPlxuICAgICAgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cylcbikoKVxuIl19
