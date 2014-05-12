(function() {
  var Application, Data, FileSystem, LISTEN, MSG, Mapping, Storage, Util,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Array.prototype.where = function(query) {
    var hit;
    if (typeof query !== "object") {
      return [];
    }
    hit = Object.keys(query).length;
    return this.filter(function(item) {
      var key, match, val;
      match = 0;
      for (key in query) {
        val = query[key];
        if (item[key] === val) {
          match += 1;
        }
      }
      if (match === hit) {
        return true;
      } else {
        return false;
      }
    });
  };

  Array.prototype.toDict = function(key) {
    return this.reduce((function(dict, obj) {
      if (obj[kewy] != null) {
        dict[obj[key]] = obj;
      }
      return dict;
    }), {});
  };

  MSG = (function() {
    function MSG(config) {
      this.config = config;
    }

    MSG.prototype.Local = function(message) {
      console.log("== MESSAGE ==> " + message);
      return chrome.runtime.sendMessage(message);
    };

    MSG.prototype.Ext = function(message) {
      console.log("== MESSAGE " + this.config.EXT_TYPE + " ==> " + message);
      return chrome.runtime.sendMessage(this.config.EXT_ID, message);
    };

    return MSG;

  })();

  LISTEN = (function() {
    LISTEN.prototype.local = {
      api: chrome.runtime.onMessage,
      listeners: {}
    };

    LISTEN.prototype.external = {
      api: chrome.runtime.onMessageExternal,
      listeners: {}
    };

    function LISTEN(config) {
      this._onMessage = __bind(this._onMessage, this);
      this._onMessageExternal = __bind(this._onMessageExternal, this);
      this.Ext = __bind(this.Ext, this);
      this.Local = __bind(this.Local, this);
      var _ref;
      this.config = config;
      this.local.api.addListener(this._onMessage);
      if ((_ref = this.external.api) != null) {
        _ref.addListener(this._onMessageExternal);
      }
    }

    LISTEN.prototype.Local = function(message, callback) {
      return this.local.listeners[message] = callback;
    };

    LISTEN.prototype.Ext = function(message, callback) {
      return this.external.listeners[message] = callback;
    };

    LISTEN.prototype._onMessageExternal = function(request, sender, sendResponse) {
      var key, _base, _results;
      console.log(("<== EXTERNAL MESSAGE == " + this.config.EXT_TYPE + " ==") + request);
      if (sender.id !== this.config.EXT_ID) {
        return void 0;
      }
      _results = [];
      for (key in request) {
        _results.push(typeof (_base = this.external.listeners)[key] === "function" ? _base[key](request[key]) : void 0);
      }
      return _results;
    };

    LISTEN.prototype._onMessage = function(request, sender, sendResponse) {
      var key, _base, _results;
      console.log(("<== MESSAGE == " + this.config.EXT_TYPE + " ==") + request);
      _results = [];
      for (key in request) {
        _results.push(typeof (_base = this.local.listeners)[key] === "function" ? _base[key](request[key]) : void 0);
      }
      return _results;
    };

    return LISTEN;

  })();

  Data = (function() {
    function Data() {}

    Data.prototype.mapping = [
      {
        directory: null,
        urlPattern: null
      }
    ];

    Data.prototype.resources = [
      {
        resource: null,
        file: null
      }
    ];

    return Data;

  })();

  Storage = (function() {
    Storage.prototype.api = chrome.storage.local;

    Storage.prototype.data = {};

    Storage.prototype.callback = function() {};

    function Storage(callback) {
      this.callback = callback;
      this.retrieveAll();
      this.onChangedAll();
    }

    Storage.prototype.save = function(key, item) {
      var obj;
      obj = {};
      obj[key] = item;
      return this.api.set(obj);
    };

    Storage.prototype.saveAll = function() {
      return this.api.set(this.data);
    };

    Storage.prototype.retrieve = function(key, cb) {
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
          _this.data = result;
          if (typeof _this.callback === "function") {
            _this.callback(result);
          }
          if (typeof cb === "function") {
            cb(result);
          }
          return console.log(result);
        };
      })(this));
    };

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
          var c;
          for (c in changes) {
            _this.data[c] = changes[c].newValue;
          }
          return typeof _this.callback === "function" ? _this.callback(changes) : void 0;
        };
      })(this));
    };

    return Storage;

  })();

  FileSystem = (function() {
    FileSystem.prototype.api = chrome.fileSystem;

    function FileSystem() {
      this.openDirectory = __bind(this.openDirectory, this);
    }

    FileSystem.prototype.fileToArrayBuffer = function(blob, callback, opt_errorCallback) {
      var reader;
      reader = new FileReader();
      reader.onload = function(e) {
        callback(e.target.result);
      };
      reader.onerror = function(e) {
        if (opt_errorCallback) {
          opt_errorCallback(e);
        }
      };
      reader.readAsArrayBuffer(blob);
    };

    FileSystem.prototype.readFile = function(dirEntry, path, success, error) {
      return getFileEntry(dirEntry, path, function(fileEntry) {
        return fileEntry.file(function(file) {
          return fileToArrayBuffer(file, function(arrayBuffer) {
            return success(arrayBuffer, error);
          }, error);
        }, error);
      });
    };

    FileSystem.prototype.getFileEntry = function(dirEntry, path, success, error) {
      return dirEntry.getFile(path, {}, function(fileEntry) {
        return success(fileEntry);
      });
    };

    FileSystem.prototype.openDirectory = function(callback) {
      return this.api.chooseEntry({
        type: 'openDirectory'
      }, (function(_this) {
        return function(directoryEntry, files) {
          return _this.api.getDisplayPath(directoryEntry, function(pathName) {
            var dir;
            dir = {
              relPath: directoryEntry.fullPath.replace('/' + directoryEntry.name, ''),
              directoryEntryId: _this.api.retainEntry(directoryEntry),
              entry: directoryEntry
            };
            return callback(pathName, dir);
          });
        };
      })(this));
    };

    return FileSystem;

  })();

  Mapping = (function() {
    Mapping.prototype.resource = null;

    Mapping.prototype.local = null;

    Mapping.prototype.regex = null;

    function Mapping(resource, local, regex) {
      var _ref;
      _ref = [local, resource, regex], this.local = _ref[0], this.resource = _ref[1], this.regex = _ref[2];
    }

    Mapping.prototype.getLocalResource = function() {
      return this.resource.replace(this.regex, this.local);
    };

    Mapping.prototype.setRedirectDeclarative = function(tabId) {
      var rules;
      rules = [].push({
        priority: 100,
        conditions: [
          new chrome.declarativeWebRequest.RequestMatcher({
            url: {
              urlMatches: this.regex
            }
          })
        ],
        actions: [
          new chrome.declarativeWebRequest.RedirectRequest({
            redirectUrl: this.getLocalResource()
          })
        ]
      });
      return chrome.declarativeWebRequest.onRequest.addRules(rules);
    };

    return Mapping;

  })();


  /*
  class File
      constructor: (directoryEntry, path) ->
          @dirEntry = directoryEntry
          @path = path
  
  class Server
      constructor: () ->
  
      start: () ->
          socket.create "tcp", {}, (_socketInfo) ->
              @socketInfo = _socketInfo;
              socket.listen socketInfo.socketId, "127.0.0.1", 31337, 50, (result) ->
                  console.log "LISTENING:", result
                  socket.accept @socketInfo.socketId, @_onAccept
  
      stop: () ->
          socket.destroy @socketInfo.socketId
  
      _onAccept: (acceptInfo) ->
          console.log("ACCEPT", acceptInfo)
          info = @_readFromSocket acceptInfo.socketId
          @getFile uri, (file) ->
  
      getFile: (uri) ->
  
      _write200Response: (socketId, file, keepAlive) ->
        contentType = (if (file.type is "") then "text/plain" else file.type)
        contentLength = file.size
        header = stringToUint8Array("HTTP/1.0 200 OK\nContent-length: " + file.size + "\nContent-type:" + contentType + ((if keepAlive then "\nConnection: keep-alive" else "")) + "\n\n")
        outputBuffer = new ArrayBuffer(header.byteLength + file.size)
        view = new Uint8Array(outputBuffer)
        view.set header, 0
        fileReader = new FileReader()
        fileReader.onload = (e) ->
          view.set new Uint8Array(e.target.result), header.byteLength
          socket.write socketId, outputBuffer, (writeInfo) ->
            console.log "WRITE", writeInfo
            if keepAlive
              readFromSocket socketId
            else
              socket.destroy socketId
              socket.accept socketInfo.socketId, onAccept
            return
  
          return
  
        fileReader.readAsArrayBuffer file
        return
  
      _readFromSocket: (socketId) ->
          socket.read socketId, (readInfo) ->
            console.log "READ", readInfo
  
             * Parse the request.
            data = arrayBufferToString(readInfo.data)
            if data.indexOf("GET ") is 0
              keepAlive = false
              keepAlive = true  unless data.indexOf("Connection: keep-alive") is -1
  
               * we can only deal with GET requests
              uriEnd = data.indexOf(" ", 4)
              return  if uriEnd < 0
              uri = data.substring(4, uriEnd)
  
               * strip qyery string
              q = uri.indexOf("?")
              info =
                  uri: (uri.substring(0, q) unless q is -1)
                  keepAlive:keepAlive
  
          stringToUint8Array: (string) ->
            buffer = new ArrayBuffer(string.length)
            view = new Uint8Array(buffer)
            i = 0
  
            while i < string.length
              view[i] = string.charCodeAt(i)
              i++
            view
  
          arrayBufferToString: (buffer) ->
            str = ""
            uArrayVal = new Uint8Array(buffer)
            s = 0
  
            while s < uArrayVal.length
              str += String.fromCharCode(uArrayVal[s])
              s++
            str
   */

  Util = (function() {
    function Util() {}

    return Util;

  })();

  Application = (function() {
    Application.prototype.config = {
      APP_ID: 'chpffdckkhhppmgclfbompfgkghpmgpg',
      EXTENSION_ID: 'aajhphjjbcnnkgnhlblniaoejpcnjdpf'
    };

    Application.prototype.data = null;

    Application.prototype.LISTEN = null;

    Application.prototype.MSG = null;

    Application.prototype.Storage = null;

    Application.prototype.FS = null;

    function Application() {
      this.setRedirect = __bind(this.setRedirect, this);
      this.openApp = __bind(this.openApp, this);
      this.startServer = __bind(this.startServer, this);
      this.init = __bind(this.init, this);
      this.Storage = new Storage;
      this.FS = new FileSystem;
      this.config.SELF_ID = chrome.runtime.id;
      this.config.EXT_ID = this.config.APP_ID === this.config.SELF_ID ? this.config.EXTENSION_ID : this.config.APP_ID;
      this.config.EXT_TYPE = this.config.APP_ID !== this.config.SELF_ID ? 'EXTENSION' : 'APP';
      this.MSG = new MSG(this.config);
      this.LISTEN = new LISTEN(this.config);
      this.appWindow = null;
      this.port = 31337;
      this.data = this.Storage.data;
      this.init();
    }

    Application.prototype.init = function() {};

    Application.prototype.addMapping = function() {};

    Application.prototype.launchApp = function(cb) {
      return chrome.management.launchApp(this.config.APP_ID);
    };

    Application.prototype.startServer = function() {
      this.server = new TcpServer('127.0.0.1', this.port);
      return this.server.listen;
    };

    Application.prototype.openApp = function() {
      return chrome.app.window.create('index.html', {
        id: "mainwin",
        bounds: {
          width: 500,
          height: 800
        }
      }, (function(_this) {
        return function(win) {
          return _this.appWindow = win;
        };
      })(this));
    };

    Application.prototype.setRedirect = function() {
      return void 0;
    };

    Application.prototype.getResources = function(selector) {
      return [].map.call(document.querySelectorAll(selector), function(e) {
        var _ref, _ref1;
        return {
          url: e.href != null ? e.href : e.src,
          path: ((_ref = e.attributes['src']) != null ? _ref.value : void 0) != null ? e.attributes['src'].value : (_ref1 = e.attributes['href']) != null ? _ref1.value : void 0,
          href: e.href,
          src: e.src,
          type: e.type,
          tagName: e.tagName
        };
      }).filter(function(e) {
        if (e.url.match('^(https?)|(chrome-extension)|(file):\/\/.*') != null) {
          return true;
        } else {
          return false;
        }
      });
    };

    return Application;

  })();

  module.exports = Application;


  /*
   var extMsgId = 'pmgnnbdfmmpdkgaamkdiipfgjbpgiofc';
    var addDirectory = function() {
      chrome.app.window.create('index.html', {
          id: "mainwin",
          bounds: {
            width: 50,
            height: 50
          },
      }, function(win) {
          mainWin = win;
      });
    }
  
  
  
      chrome.runtime.onMessage.addListener(
          function(request, sender, sendResponse) {
            // if (sender.id != extMsgId)
            //   return sendResponse({"result":"sorry, could not process your message"});
  
            if (request.directoryEntryId) {
              // sendResponse({"result":"Got Directory"});
              console.log(request.directoryEntryId);
              directories.push(request.directoryEntryId);
              // chrome.fileSystem.restoreEntry(request.directoryEntryId, function(directoryEntry) {
              //     console.log(directoryEntry);
              // });
  
            } else {
              // sendResponse({"result":"Ops, I don't understand this message"});
            }
        });
            chrome.runtime.onMessageExternal.addListener(
          function(request, sender, sendResponse) {
            if (sender.id != extMsgId) {
              sendResponse({"result":"sorry, could not process your message"});
              return;  // don't allow this extension access
            } else if (request.openDirectory) {
              // sendResponse({"result":"Opening Directory"});
              addDirectory();
            } else {
              sendResponse({"result":"Ops, I don't understand this message"});
            }
        });
  
      socket.create("tcp", {}, function(_socketInfo) {
          socketInfo = _socketInfo;
          socket.listen(socketInfo.socketId, "127.0.0.1", 33333, 50, function(result) {
          console.log("LISTENING:", result);
          socket.accept(socketInfo.socketId, onAccept);
      });
      });
  
      var stopSocket = function() {
          socket.destroy(socketInfo.socketId);
      }
   */


  /*
  onload = function() {
    var start = document.getElementById("start");
    var stop = document.getElementById("stop");
    var hosts = document.getElementById("hosts");
    var port = document.getElementById("port");
    var directory = document.getElementById("directory");
  
    var socket = chrome.socket;
    var socketInfo;
    var filesMap = {};
  
    var rootDir;
    var port, extPort;
    var directories = [];
  
    var stringToUint8Array = function(string) {
      var buffer = new ArrayBuffer(string.length);
      var view = new Uint8Array(buffer);
      for(var i = 0; i < string.length; i++) {
        view[i] = string.charCodeAt(i);
      }
      return view;
    };
  
    var arrayBufferToString = function(buffer) {
      var str = '';
      var uArrayVal = new Uint8Array(buffer);
      for(var s = 0; s < uArrayVal.length; s++) {
        str += String.fromCharCode(uArrayVal[s]);
      }
      return str;
    };
  
    var logToScreen = function(log) {
      logger.textContent += log + "\n";
    }
  
    var writeErrorResponse = function(socketId, errorCode, keepAlive) {
      var file = { size: 0 };
      console.info("writeErrorResponse:: begin... ");
      console.info("writeErrorResponse:: file = " + file);
      var contentType = "text/plain"; //(file.type === "") ? "text/plain" : file.type;
      var contentLength = file.size;
      var header = stringToUint8Array("HTTP/1.0 " + errorCode + " Not Found\nContent-length: " + file.size + "\nContent-type:" + contentType + ( keepAlive ? "\nConnection: keep-alive" : "") + "\n\n");
      console.info("writeErrorResponse:: Done setting header...");
      var outputBuffer = new ArrayBuffer(header.byteLength + file.size);
      var view = new Uint8Array(outputBuffer)
      view.set(header, 0);
      console.info("writeErrorResponse:: Done setting view...");
      socket.write(socketId, outputBuffer, function(writeInfo) {
        console.log("WRITE", writeInfo);
        if (keepAlive) {
          readFromSocket(socketId);
        } else {
          socket.destroy(socketId);
          socket.accept(socketInfo.socketId, onAccept);
        }
      });
      console.info("writeErrorResponse::filereader:: end onload...");
  
      console.info("writeErrorResponse:: end...");
    };
  
    var write200Response = function(socketId, file, keepAlive) {
      var contentType = (file.type === "") ? "text/plain" : file.type;
      var contentLength = file.size;
      var header = stringToUint8Array("HTTP/1.0 200 OK\nContent-length: " + file.size + "\nContent-type:" + contentType + ( keepAlive ? "\nConnection: keep-alive" : "") + "\n\n");
      var outputBuffer = new ArrayBuffer(header.byteLength + file.size);
      var view = new Uint8Array(outputBuffer)
      view.set(header, 0);
  
      var fileReader = new FileReader();
      fileReader.onload = function(e) {
         view.set(new Uint8Array(e.target.result), header.byteLength);
         socket.write(socketId, outputBuffer, function(writeInfo) {
           console.log("WRITE", writeInfo);
           if (keepAlive) {
             readFromSocket(socketId);
           } else {
             socket.destroy(socketId);
             socket.accept(socketInfo.socketId, onAccept);
           }
        });
      };
  
      fileReader.readAsArrayBuffer(file);
    };
  
    var onAccept = function(acceptInfo) {
      console.log("ACCEPT", acceptInfo)
      readFromSocket(acceptInfo.socketId);
    };
  
    var readFromSocket = function(socketId) {
      //  Read in the data
      socket.read(socketId, function(readInfo) {
        console.log("READ", readInfo);
        // Parse the request.
        var data = arrayBufferToString(readInfo.data);
        if(data.indexOf("GET ") == 0) {
          var keepAlive = false;
          if (data.indexOf("Connection: keep-alive") != -1) {
            keepAlive = true;
          }
  
          // we can only deal with GET requests
          var uriEnd =  data.indexOf(" ", 4);
          if(uriEnd < 0) {   return; }
          var uri = data.substring(4, uriEnd);
          // strip qyery string
          var q = uri.indexOf("?");
          if (q != -1) {
            uri = uri.substring(0, q);
          }
  
          chrome.fileSystem.restoreEntry(directories[0])
          .then(
              (function(url) {
                  return function(directoryEntry) {
                      console.log(directoryEntry);
                      console.log(uri);
                      directoryEntry.getFile('myNewAppDEV.resource/index.js', {})
                      .then(function(file) {
                          console.log(file);
                          write200Response(socketId, file, keepAlive);
                      },function(e) {
                          console.log(e);
                      });
  
                  }
               })(uri)
          );
  
          // var file =
          // if(!!file == false) {
          //   console.warn("File does not exist..." + uri);
          //   writeErrorResponse(socketId, 404, keepAlive);
          //   return;
          // }
          // logToScreen("GET 200 " + uri);
          // write200Response(socketId, file, keepAlive);
        // }
        // else {
          // Throw an error
          // socket.destroy(socketId);
        // }
  
    };
  });
  }
  
  
    var extMsgId = 'pmgnnbdfmmpdkgaamkdiipfgjbpgiofc';
  
  
      chrome.runtime.onMessageExternal.addListener(
          function(request, sender, sendResponse) {
            if (sender.id != extMsgId) {
              sendResponse({"result":"sorry, could not process your message"});
              return;  // don't allow this extension access
            } else if (request.openDirectory) {
              // sendResponse({"result":"Opening Directory"});
              addDirectory();
            } else {
              sendResponse({"result":"Ops, I don't understand this message"});
            }
        });
  
  
      chrome.runtime.onMessage.addListener(
          function(request, sender, sendResponse) {
            // if (sender.id != extMsgId)
            //   return sendResponse({"result":"sorry, could not process your message"});
  
            if (request.directoryEntryId) {
              // sendResponse({"result":"Got Directory"});
              console.log(request.directoryEntryId);
              directories.push(request.directoryEntryId);
              // chrome.fileSystem.restoreEntry(request.directoryEntryId, function(directoryEntry) {
              //     console.log(directoryEntry);
              // });
  
            } else {
              // sendResponse({"result":"Ops, I don't understand this message"});
            }
        });
      socket.create("tcp", {}, function(_socketInfo) {
          socketInfo = _socketInfo;
          socket.listen(socketInfo.socketId, "127.0.0.1", 33333, 50, function(result) {
          console.log("LISTENING:", result);
          socket.accept(socketInfo.socketId, onAccept);
      });
      });
  
      var stopSocket = function() {
          socket.destroy(socketInfo.socketId);
      }
  
    var addDirectory = function() {
      chrome.app.window.create('index.html', {
          id: "mainwin",
          bounds: {
            width: 50,
            height: 50
          },
      }, function(win) {
          mainWin = win;
      });
    }
  
  };
   */

}).call(this);
