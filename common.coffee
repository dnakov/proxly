# server = require './tcp-server.js'
# require './chrome-mock'
# root.q = require 'q'

Array::where = (query) ->
    return [] if typeof query isnt "object"
    hit = Object.keys(query).length
    @filter (item) ->
        match = 0
        for key, val of query
            match += 1 if item[key] is val
        if match is hit then true else false

Array::toDict = (key) ->
  @reduce ((dict, obj) -> dict[ obj[key] ] = obj if obj[kewy]?; return dict), {}


class MSG
    constructor: (config) ->
        @config = config
    Local: (message) ->
        console.log "== MESSAGE ==> #{ message }"
        chrome.runtime.sendMessage message
    Ext: (message) ->
        console.log "== MESSAGE #{ @config.EXT_TYPE } ==> #{ message }"
        chrome.runtime.sendMessage @config.EXT_ID, message

class LISTEN
    local:
        api: chrome.runtime.onMessage
        listeners:{}
    external:
        api: chrome.runtime.onMessageExternal
        listeners:{}
    constructor: (config) ->
        @config = config
        @local.api.addListener @_onMessage
        @external.api?.addListener @_onMessageExternal

    Local: (message, callback) =>
      @local.listeners[message] = callback

    Ext: (message, callback) =>
      @external.listeners[message] = callback

    _onMessageExternal: (request, sender, sendResponse) =>
        console.log "<== EXTERNAL MESSAGE == #{ @config.EXT_TYPE } ==" + request
        if sender.id isnt @config.EXT_ID then return undefined
        @external.listeners[key]? request[key] for key of request

    _onMessage: (request, sender, sendResponse) =>
        console.log "<== MESSAGE == #{ @config.EXT_TYPE } ==" + request
        @local.listeners[key]? request[key] for key of request

    # class Listener
    #   listeners: {}
    #   external:false
    #   api: chrome.runtime.onMessage
    #   constructor: (external) ->
    #     @external = external
    #     @api = if @external then chrome.runtime.onMessageExternal else @api
    #     @api.addListener @onMessage
    #   addListener: (message, callback) ->
    #     @listeners[message] = callback
    #   onMessage: (request, sender, sendResponse) =>
    #     console.log "<== MESSAGE == #{ @config.EXT_TYPE } ==" + request
    #     if @external and sender.id isnt @config.EXT_ID then return undefined
    #     else
    #       for key of request
    #         do (key) => if @listeners[key]? then @listeners[key] request.key

class Data
    mapping:[
        directory:null
        urlPattern:null
    ]
    resources:[
        resource:null
        file:null
    ]



class Storage
    api: chrome.storage.local
    data: {}
    callback: () ->
    constructor: (callback) ->
        @callback = callback
        @retrieveAll()
        @onChangedAll()

    save: (key, item) ->
      obj = {}
      obj[key] = item
      @api.set obj

    saveAll: () ->
        @api.set @data

    retrieve: (key, cb) ->
        @api.get key, (results) ->
            @data[r] = results[r] for r of results
            if cb? then cb results[key]


    retrieveAll: (cb) ->
        @api.get (result) =>
            @data = result
            @callback? result
            cb? result
            console.log result

    onChanged: (key, cb) ->
      chrome.storage.onChanged.addListener (changes, namespace) ->
        if changes[key]? and cb? then cb changes[key].newValue
        @callback? changes

    onChangedAll: () ->
        chrome.storage.onChanged.addListener (changes,namespace) =>
            @data[c] = changes[c].newValue for c of changes
            @callback? changes


# class DirectoryStore
#   directories =
#   constructor () ->

# class Directory


class FileSystem
    api: chrome.fileSystem

    constructor: () ->

    # @dirs: new DirectoryStore
    fileToArrayBuffer: (blob, callback, opt_errorCallback) ->
      reader = new FileReader()
      reader.onload = (e) ->
        callback e.target.result
        return

      reader.onerror = (e) ->
        opt_errorCallback e  if opt_errorCallback
        return

      reader.readAsArrayBuffer blob
      return

    readFile: (dirEntry, path, success, error) ->
        getFileEntry dirEntry, path, (fileEntry) ->
            fileEntry.file (file) ->
                fileToArrayBuffer file, (arrayBuffer) ->
                    success arrayBuffer
                    ,error
                ,error
            ,error

    getFileEntry: (dirEntry, path, success, error) ->
        dirEntry.getFile path, {}, (fileEntry) ->
            success fileEntry

    openDirectory: (callback) =>
        @api.chooseEntry type:'openDirectory', (directoryEntry, files) =>
            @api.getDisplayPath directoryEntry, (pathName) =>
                dir =
                  relPath: directoryEntry.fullPath.replace '/' + directoryEntry.name, ''
                  directoryEntryId: @api.retainEntry directoryEntry
                  entry: directoryEntry

                callback pathName, dir
                # @getOneDirList dir
                # Storage.save 'directories', @scope.directories (result) ->



class Mapping
    resource: null #http://blala.com/what/ever/index.js
    local: null #/someshittyDir/otherShittyDir/
    regex: null
    constructor: (resource, local, regex) ->
      [@local, @resource, @regex] = [local, resource, regex]

    getLocalResource: () ->
      @resource.replace(@regex, @local)

    setRedirectDeclarative: (tabId) ->
      rules = [].push
        priority:100
        conditions: [
            new chrome.declarativeWebRequest.RequestMatcher
                url:
                    urlMatches:@regex
            ]
        actions: [
            new chrome.declarativeWebRequest.RedirectRequest
                redirectUrl:@getLocalResource()
        ]
      chrome.declarativeWebRequest.onRequest.addRules rules

# class StorageFactory
#   makeObject: (type) ->
#     switch type
#       when 'ResourceList'
#   _create: (type) ->
#     @getFromStorage.then (obj) ->
#       return obj

#   getFromStorage: () ->
#     promise = new Promise (success, fail) ->
#       chrome.storage.local.get (a) ->
#         b = new ResourceList
#         for key of a
#           do (a) ->
#             b[key] = a[key]
#         success b
###
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

          # Parse the request.
          data = arrayBufferToString(readInfo.data)
          if data.indexOf("GET ") is 0
            keepAlive = false
            keepAlive = true  unless data.indexOf("Connection: keep-alive") is -1

            # we can only deal with GET requests
            uriEnd = data.indexOf(" ", 4)
            return  if uriEnd < 0
            uri = data.substring(4, uriEnd)

            # strip qyery string
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
###
class Util
    constructor: () ->

class Application

    config:
        APP_ID: 'chpffdckkhhppmgclfbompfgkghpmgpg'
        EXTENSION_ID: 'aajhphjjbcnnkgnhlblniaoejpcnjdpf'

    data:null
    LISTEN: null
    MSG: null
    Storage: null
    FS: null

    constructor: () ->
        @Storage = new Storage
        @FS = new FileSystem

        @config.SELF_ID = chrome.runtime.id
        @config.EXT_ID = if @config.APP_ID is @config.SELF_ID then @config.EXTENSION_ID else @config.APP_ID
        @config.EXT_TYPE = if @config.APP_ID isnt @config.SELF_ID then 'EXTENSION' else 'APP'
        @MSG = new MSG @config
        @LISTEN = new LISTEN @config

        @appWindow = null
        @port = 31337
        @data = @Storage.data
        @init()

    init: () =>

      # LISTEN.EXT 'directoryEntryId' (dirId) ->
        # @directories.push dirId
    addMapping: () ->
    # if @data.directories[]
        # @FS.openDirectory (pathName, dir) ->
        # match = @data.resources
        # if match.length > 0 then

    launchApp: (cb) ->
        chrome.management.launchApp @config.APP_ID

    startServer: () =>
      @server = new TcpServer('127.0.0.1', @port)
      @server.listen

    openApp: () =>
      chrome.app.window.create('index.html',
          id: "mainwin"
          bounds:
              width:500
              height:800,
      (win) =>
          @appWindow = win)

    setRedirect: () =>
      undefined

    getResources: (selector) ->
      [].map.call document.querySelectorAll(selector), (e) ->
        url: if e.href? then e.href else e.src
        path: if e.attributes['src']?.value? then e.attributes['src'].value else e.attributes['href']?.value
        href: e.href
        src: e.src
        type: e.type
        tagName: e.tagName
      .filter (e) ->
          if e.url.match('^(https?)|(chrome-extension)|(file):\/\/.*')? then true else false



module.exports = Application

# mapFiles = (directoryEntryId) ->
#     chrome.storage.local.get (resources) ->
#         chrome.fileSystem.restoreEntry(directoryEntryId, (dir) ->

#         )

# testPath = (url, directoryEntry) ->
#     for name in url.split('/').slice(0).reverse()
#         do (name) ->
#             directoryEntry.getFile(path + name, {},
#                 (file) ->
#                 )












###
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


###

###
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
###

