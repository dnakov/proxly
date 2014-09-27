LISTEN = require './listen.coffee'
MSG = require './msg.coffee'

class FileWatcher
  files:{}
  getLocalFile:null
  
  constructor: ->

  watchFile: (path) ->
    @getLocalFile path, (er, fileEntry, file) ->
      file.getMetadata (meta) =>
        files[path] = meta
        show meta
 