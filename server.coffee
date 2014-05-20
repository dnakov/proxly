#TODO: rewrite this class using the new chrome.sockets.* api when you can manage to make it work
class Server
  socket: chrome.socket
  # tcp: chrome.sockets.tcp
  host:"127.0.0.1"
  port:8089
  maxConnections:500
  socketProperties:
      persistent:true
      name:'SLRedirector'
  socketInfo:null
  getLocalFile:null
  socketIds:[]
  stopped:true

  constructor: () ->

  start: (host,port,maxConnections, cb,err) ->
    @host = if host? then host else @host
    @port = if port? then port else @port
    @maxConnections = if maxConnections? then maxConnections else @maxConnections

    @killAll (success) =>
      @socket.create 'tcp', {}, (socketInfo) =>
        @socketIds = []
        @socketIds.push socketInfo.socketId
        chrome.storage.sync.set 'socketIds':@socketIds
        @socket.listen socketInfo.socketId, @host, @port, (result) =>
          if result > -1
            show 'listening ' + socketInfo.socketId
            @stopped = false
            @socketInfo = socketInfo
            @socket.accept socketInfo.socketId, @_onAccept
            cb? socketInfo
          else
            err? result
    ,err?


  killAll: (callback, error) ->
    chrome.storage.sync.get 'socketIds', (result) =>
      show 'got ids'
      show result
      @socketIds = result.socketIds
      return callback?() unless @socketIds?
      cnt = 0
      for s in @socketIds
        do (s) =>
          cnt++
          @socket.getInfo s, (socketInfo) =>
            cnt--
            if not chrome.runtime.lastError?
              @socket.disconnect s
              @socket.destroy s

            callback?() if cnt is 0


  stop: (callback, error) ->
    @killAll (success) =>
      @stopped = true
      callback?()
    ,(error) =>
      error? error


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
      @_readFromSocket socketInfo.socketId, (info) =>
        @getLocalFile info, (fileEntry, fileReader) =>
            @_write200Response socketInfo.socketId, fileEntry, fileReader, info.keepAlive
        ,(error) =>
            @_writeError socketInfo.socketId, 404, info.keepAlive
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

module.exports = Server
