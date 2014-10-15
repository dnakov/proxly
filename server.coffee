#TODO: rewrite this class using the new chrome.sockets.* api when you can manage to make it work

WebServer = require('web-server-chrome')

class Server
  
  # tcp: chrome.sockets.tcp
  socketProperties:
      persistent:true
      name:'SLRedirector'
  # socketInfo:null
  getLocalFile:null
  socketIds:[]
  webServer:null
  status:
    host:null
    port:null
    maxConnections:50
    isOn:false
    socketInfo:null
    url:null

  constructor: () ->
    # @socket = chrome.sockets.tcp
    @status.host = "127.0.0.1"
    @status.port = 10012
    @status.maxConnections = 50
    @status.url = 'http://' + @status.host + ':' + @status.port + '/'
    @status.isOn = false
    


  start: (dirId, host,port,maxConnections, cb) ->
    if host? then @status.host = host
    if port? then @status.port = port
    if maxConnections? then @status.maxConnections = maxConnections

    @killAll (err, success) =>
      return cb? err if err?

      @status.isOn = false
      chrome.fileSystem.restoreEntry dirId, (entry) =>
        console.log(entry)
        @webServer = new WebServer.Server {handlers:[[".*", WebServer.DirHandler(new WebServer.FileSystem(entry))]], port:@status.port}
        @webServer.start (er,socketId) =>
          if er? then cb?(er)
          
          @socketIds.push socketId

          chrome.storage.sync.set 'socketIds':@socketIds
          
          @status.isOn = true
          cb?(null, @status)


  killAll: (cb) ->
    chrome.storage.sync.get 'socketIds', (result) =>
      @socketIds = if result.socketIds? then result.socketIds else []
      @status.isOn = false
      return cb? null, 'success' unless @socketIds?.length > 0
      cnt = 0
      i = 0
      
      # while i < @socketIds[0]
      #   chrome.sockets.tcp.disconnect i
      #   i++

      for s in @socketIds when s?
        cnt++
        # chrome.sockets.tcp.getInfo s, (socketInfo) =>
        #   cnt--
        #   if not chrome.runtime.lastError?
        chrome.sockets.tcpServer.disconnect s # if @status.socketInfo?.connected or not @status.socketInfo?

      @socketIds = [];

      cb? null, 'success' 

  stop: (cb) ->
    @killAll (err, success) =>
      @status.isOn = false
      if err? 
        cb? err
      else
        cb? null,success


module.exports = Server
