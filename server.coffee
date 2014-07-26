#TODO: rewrite this class using the new chrome.sockets.* api when you can manage to make it work
class Server
  socket: chrome.socket
  # tcp: chrome.sockets.tcp
  socketProperties:
      persistent:true
      name:'SLRedirector'
  # socketInfo:null
  getLocalFile:null
  socketIds:[]
  status:
    host:null
    port:null
    maxConnections:50
    isOn:false
    socketInfo:null
    url:null

  constructor: () ->
    @status.host = "127.0.0.1"
    @status.port = 10012
    @status.maxConnections = 50
    @status.url = 'http://' + @status.host + ':' + @status.port + '/'
    @status.isOn = false


  start: (host,port,maxConnections, cb) ->
    if host? then @status.host = host
    if port? then @status.port = port
    if maxConnections? then @status.maxConnections = maxConnections

    @killAll (err, success) =>
      return cb? err if err?

      @status.isOn = false
      @socket.create 'tcp', {}, (socketInfo) =>
        @status.socketInfo = socketInfo
        @socketIds = []
        @socketIds.push @status.socketInfo.socketId
        chrome.storage.sync.set 'socketIds':@socketIds
        @socket.listen @status.socketInfo.socketId, @status.host, @status.port, (result) =>
          if result > -1
            show 'listening ' + @status.socketInfo.socketId
            @status.isOn = true
            @status.url = 'http://' + @status.host + ':' + @status.port + '/'
            @socket.accept @status.socketInfo.socketId, @_onAccept
            cb? null, @status
          else
            cb? result


  killAll: (cb) ->
    chrome.storage.sync.get 'socketIds', (result) =>
      @socketIds = result.socketIds
      @status.isOn = false
      return cb? null, 'success' unless @socketIds?
      cnt = 0
      i = 0
      
      while i < @socketIds[0]
        @socket.destroy i
        i++

      for s in @socketIds
        do (s) =>
          cnt++
          @socket.getInfo s, (socketInfo) =>
            cnt--
            if not chrome.runtime.lastError?
              @socket.disconnect s if @status.socketInfo?.connected or not @status.socketInfo?
              @socket.destroy s

            cb? null, 'success' if cnt is 0

  stop: (cb) ->
    @killAll (err, success) =>
      @status.isOn = false
      if err? 
        cb? err
      else
        cb? null,success


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
    if socketInfo?.socketId?
      @_readFromSocket socketInfo.socketId, (err, info) =>
        
        if err? then return @_writeError socketInfo.socketId, 404, info.keepAlive

        @getLocalFile info, (err, fileEntry, fileReader) =>
          if err? then @_writeError socketInfo.socketId, 404, info.keepAlive
          else @_write200Response socketInfo.socketId, fileEntry, fileReader, info.keepAlive
    else
      show "No socket?!"
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
    str = ""
    uArrayVal = new Uint8Array(buffer)
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

      keepAlive = false
      keepAlive = true if data.indexOf 'Connection: keep-alive' isnt -1

      if data.indexOf("GET ") isnt 0
        return cb? '404', keepAlive:keepAlive



      uriEnd = data.indexOf(" ", 4)

      return end socketId if uriEnd < 0

      uri = data.substring(4, uriEnd)
      if not uri?
        return cb? '404', keepAlive:keepAlive

      info =
        uri: uri
        keepAlive:keepAlive
      info.referer = data.match(/Referer:\s(.*)/)?[1]
      #success
      cb? null, info

  end: (socketId, keepAlive) ->
      # if keepAlive
      #   @_readFromSocket socketId
      # else
    @socket.disconnect socketId
    @socket.destroy socketId
    show 'ending ' + socketId
    @socket.accept @status.socketInfo.socketId, @_onAccept

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

module.exports = Server
