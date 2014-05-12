# http://stackoverflow.com/a/21742093
(() ->
  methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeStamp', 'trace', 'warn']
  noop = () ->
    # stub undefined methods.
    for m in methods  when  !console[m]
      console[m] = noop

  if Function.prototype.bind?
    window.show = Function.prototype.bind.call(console.log, console)
  else
    window.show = () ->
      Function.prototype.apply.call(console.log, console, arguments)
)()

class MSG
  isContentScript: location.protocol isnt 'chrome-extension:'
  constructor: (config) ->
    @config = config
  Local: (message, respond) ->
    show "== MESSAGE #{ JSON.stringify message } ==>"
    chrome.runtime.sendMessage message, respond
  Ext: (message, respond) ->
    show "== MESSAGE #{ JSON.stringify message } ==>"
    chrome.runtime.sendMessage @config.EXT_ID, message, respond

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
    show "<== EXTERNAL MESSAGE == #{ @config.EXT_TYPE } ==" + request
    if sender.id isnt @config.EXT_ID then return undefined
    @external.listeners[key]? request[key], sendResponse for key of request

  _onMessage: (request, sender, sendResponse) =>
    show "<== MESSAGE == #{ @config.EXT_TYPE } ==" + request
    @local.listeners[key]? request[key], sendResponse for key of request

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
      show result

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
  # fileToArrayBuffer: (blob, onload, onerror) ->
  #   reader = new FileReader()
  #   reader.onload = onload

  #   reader.onerror = onerror

  #   reader.readAsArrayBuffer blob

  readFile: (dirEntry, path, success, error) ->
    @getFileEntry dirEntry, path,
      (fileEntry) =>
        fileEntry.file (file) =>
          success(fileEntry, file)
        ,(error) => error()
      ,(error) => error()

  getFileEntry: (dirEntry, path, success, error) ->
    if dirEntry?.getFile?
      dirEntry.getFile path, {}, (fileEntry) ->
        success fileEntry
    else error()

  openDirectory: (callback) =>
    @api.chooseEntry type:'openDirectory', (directoryEntry, files) =>
      @api.getDisplayPath directoryEntry, (pathName) =>
        dir =
            relPath: directoryEntry.fullPath.replace('/' + directoryEntry.name, '')
            directoryEntryId: @api.retainEntry(directoryEntry)
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
###

#TODO: rewrite this class using the new chrome.sockets.* api when you can manage to make it work
class Server
  socket: chrome.socket
  # tcp: chrome.sockets.tcp
  host:"127.0.0.1"
  port:8082
  maxConnections:500
  socketProperties:
      persistent:true
      name:'SLRedirector'
  socketInfo:null
  getLocalFile:null
  socketIds:[]
  stopped:false

  constructor: () ->

  start: (host,port,maxConnections, cb) ->
    @host = if host? then host else @host
    @port = if port? then port else @port
    @maxConnections = if maxConnections? then maxConnections else @maxConnections

    @killAll () =>
      @socket.create 'tcp', {}, (socketInfo) =>
        @socketIds = []
        @socketIds.push socketInfo.socketId
        chrome.storage.local.set 'socketIds':@socketIds
        @socket.listen socketInfo.socketId, @host, @port, (result) =>
          show 'listening ' + socketInfo.socketId
          @stopped = false
          @socketInfo = socketInfo
          @socket.accept socketInfo.socketId, @_onAccept

  killAll: (callback) ->
    chrome.storage.local.get 'socketIds', (result) =>
      show 'got ids'
      show result
      @socketIds = result.socketIds
      for s in @socketIds?
        do (s) =>
          try
            @socket.disconnect s
            @socket.destroy s
            show 'killed ' + s
          catch error
            show "could not kill #{ s } because #{ error }"
      callback?()

  stop: () ->
    @killAll()
    @stopped = true

  _onReceive: (receiveInfo) =>
    show("Client socket 'receive' event: sd=" + receiveInfo.socketId
    + ", bytes=" + receiveInfo.data.byteLength)

  _onListen: (serverSocketId, resultCode) =>
    return show 'Error Listening: ' + chrome.runtime.lastError.message if resultCode < 0
    @serverSocketId = serverSocketId
    @tcpServer.onAccept.addListener @_onAccept
    @tcpServer.onAcceptError.addListener @_onAcceptError
    @tcp.onReceive.addListener @_onReceive
    # show "["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] Connection accepted!";
    # info = @_readFromSocket socketInfo.socketId
    # @getFile uri, (file) ->
  _onAcceptError: (error) ->
    show error

  _onAccept: (socketInfo) =>
    # return null if info.socketId isnt @serverSocketId
    show("Server socket 'accept' event: sd=" + socketInfo.socketId)
    @_readFromSocket socketInfo.socketId, (info) =>
      @getLocalFile info,
        (fileEntry, fileReader) =>
          @_write200Response socketInfo.socketId, fileEntry, fileReader, info.keepAlive,
        (error) =>
          @_writeError socketInfo.socketId, 404, info.keepAlive
    # @socket.accept socketInfo.socketId, @_onAccept



  stringToUint8Array: (string) ->
    buffer = new ArrayBuffer(string.length)
    view = new Uint8Array(buffer)
    i = 0

    while i < string.length
      view[i] = string.charCodeAt(i)
      i++
    view

  arrayBufferToString: (buffer) ->
    str = new Uint8Array(buffer)
    s = 0

    while s < uArrayVal.length
      str += String.fromCharCode(uArrayVal[s])
      s++
    str

  _write200Response: (socketId, fileEntry, file, keepAlive) ->
    contentType = (if (file.type is "") then "text/plain" else file.type)
    contentLength = file.size
    header = @stringToUint8Array("HTTP/1.0 200 OK\nContent-length: " + file.size + "\nContent-type:" + contentType + ((if keepAlive then "\nConnection: keep-alive" else "")) + "\n\n")
    outputBuffer = new ArrayBuffer(header.byteLength + file.size)
    view = new Uint8Array(outputBuffer)
    view.set header, 0

    reader = new FileReader
    reader.onload = (ev) =>
      view.set new Uint8Array(ev.target.result), header.byteLength
      @socket.write socketId, outputBuffer, (writeInfo) =>
        show writeInfo
        # @_readFromSocket socketId
        @end socketId, keepAlive
    reader.onerror = (error) =>
      @end socketId, keepAlive
    reader.readAsArrayBuffer file


    # @end socketId
    # fileReader = new FileReader()
    # fileReader.onload = (e) =>
    #   view.set new Uint8Array(e.target.result), header.byteLength
    #   @socket.write socketId, outputBuffer, (writeInfo) =>
    #     show "WRITE", writeInfo
    #       @_write200Response socketId


  _readFromSocket: (socketId, cb) ->
    @socket.read socketId, (readInfo) =>
      show "READ", readInfo

      # Parse the request.
      data = @arrayBufferToString(readInfo.data)
      show data

      if data.indexOf("GET ") isnt 0
        @end socketId
        return

      keepAlive = false
      keepAlive = true if data.indexOf 'Connection: keep-alive' isnt -1

      uriEnd = data.indexOf(" ", 4)

      return end socketId if uriEnd < 0

      uri = data.substring(4, uriEnd)
      if not uri?
        writeError socketId, 404, keepAlive
        return

      info =
        uri: uri
        keepAlive:keepAlive
      info.referer = data.match(/Referer:\s(.*)/)?[1]
      #success
      cb? info

  end: (socketId, keepAlive) ->
      # if keepAlive
      #   @_readFromSocket socketId
      # else
    @socket.disconnect socketId
    @socket.destroy socketId
    show 'ending ' + socketId
    @socket.accept @socketInfo.socketId, @_onAccept

  _writeError: (socketId, errorCode, keepAlive) ->
    file = size: 0
    console.info "writeErrorResponse:: begin... "
    console.info "writeErrorResponse:: file = " + file
    contentType = "text/plain" #(file.type === "") ? "text/plain" : file.type;
    contentLength = file.size
    header = @stringToUint8Array("HTTP/1.0 " + errorCode + " Not Found\nContent-length: " + file.size + "\nContent-type:" + contentType + ((if keepAlive then "\nConnection: keep-alive" else "")) + "\n\n")
    console.info "writeErrorResponse:: Done setting header..."
    outputBuffer = new ArrayBuffer(header.byteLength + file.size)
    view = new Uint8Array(outputBuffer)
    view.set header, 0
    console.info "writeErrorResponse:: Done setting view..."
    @socket.write socketId, outputBuffer, (writeInfo) =>
      show "WRITE", writeInfo
      @end socketId, keepAlive

class Application

  config:
    APP_ID: 'cecifafpheghofpfdkhekkibcibhgfec'
    EXTENSION_ID: 'dddimbnjibjcafboknbghehbfajgggep'

  data:null
  LISTEN: null
  MSG: null
  Storage: null
  FS: null
  Server: null

  constructor: () ->
    @Storage = new Storage
    @FS = new FileSystem
    @Server = new Server
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

    # @server = new TcpServer('127.0.0.1', @port)
    # @server.listen

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
  show = -> # jshint -W021
    if window.console
      if Function::bind
        log = Function::bind.call(console.log, console)
      else
        log = ->
          Function::apply.call console.log, console, arguments_
          return
      log.apply this, arguments_


module.exports = Application
