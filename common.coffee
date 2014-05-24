require './util.coffee'
Config = require './config.coffee'
MSG = require './msg.coffee'
LISTEN = require './listen.coffee'
Storage = require './storage.coffee'
FileSystem = require './filesystem.coffee'
Notification = require './notification.coffee'
Server = require './server.coffee'


class Application extends Config
  LISTEN: null
  MSG: null
  Storage: null
  FS: null
  Server: null
  Notify: null
  platform:null
  currentTabId:null

  constructor: (deps) ->
    super

    @MSG ?= MSG.get()
    @LISTEN ?= LISTEN.get()
    
    for prop of deps
      if typeof deps[prop] is "object" 
        @[prop] = @wrapObjInbound deps[prop]
      if typeof deps[prop] is "function" 
        @[prop] = @wrapObjOutbound new deps[prop]

    @Storage.onDataLoaded = (data) =>
      @data = data
      @data.server = status:@Server.status

    @Notify ?= (new Notification).show 
    # @Storage ?= @wrapObjOutbound new Storage @data
    # @FS = new FileSystem 
    # @Server ?= @wrapObjOutbound new Server
    @data = @Storage.data
    
    @wrap = if @SELF_TYPE is 'APP' then @wrapInbound else @wrapOutbound

    @openApp = @wrap @, 'Application.openApp', @openApp
    @launchApp = @wrap @, 'Application.launchApp', @launchApp
    @startServer = @wrap @, 'Application.startServer', @startServer
    @restartServer = @wrap @, 'Application.restartServer', @restartServer
    @stopServer = @wrap @, 'Application.stopServer', @stopServer
    # @mapAllResources = @wrap @, 'Application.mapAllResources', @mapAllResources
    @getFileMatch = @wrap @, 'Application.getFileMatch', @getFileMatch

    @wrap = if @SELF_TYPE is 'EXTENSION' then @wrapInbound else @wrapOutbound

    @getResources = @wrap @, 'Application.getResources', @getResources
    @getCurrentTab = @wrap @, 'Application.getCurrentTab', @getCurrentTab

    chrome.runtime.getPlatformInfo (info) =>
      @platform = info

    @init()

  init: () ->
    # @Storage.retrieveAll() if @Storage?


  getCurrentTab: (cb) ->
    # tried to keep only activeTab permission, but oh well..
    chrome.tabs.query
      active:true
      currentWindow:true
    ,(tabs) =>
      @currentTabId = tabs[0].id
      cb? @currentTabId

  launchApp: (cb, error) ->
      chrome.management.launchApp @APP_ID, (extInfo) =>
        if chrome.runtime.lastError
          error chrome.runtime.lastError
        else
          cb? extInfo

  openApp: () =>
      chrome.app.window.create('index.html',
        id: "mainwin"
        bounds:
          width:770
          height:800,
      (win) =>
        @appWindow = win) 

  getCurrentTab: (cb) ->
    # tried to keep only activeTab permission, but oh well..
    chrome.tabs.query
      active:true
      currentWindow:true
    ,(tabs) =>
      @currentTabId = tabs[0].id
      cb? @currentTabId

  getResources: (cb) ->
    @getCurrentTab (tabId) =>
      chrome.tabs.executeScript tabId, 
        file:'scripts/content.js', (results) =>
          @data.currentResources.length = 0
          for r in results
            for res in r
              @data.currentResources.push res
          cb? null, @data.currentResources


  getLocalFile: (info, cb) =>
    filePath = info.uri
    # filePath = @getLocalFilePathWithRedirect url
    return cb 'file not found' unless filePath?
    _dirs = []
    _dirs.push dir for dir in @data.directories when dir.isOn
    filePath = filePath.substring 1 if filePath.substring(0,1) is '/'
    @findFileForPath _dirs, filePath, (err, fileEntry, dir) =>
      if err? then return cb? err
      fileEntry.file (file) =>
        cb? null,fileEntry,file
      ,(err) => cb? err


  startServer: (cb) ->
    if @Server.status.isOn is false
      @Server.start null,null,null, (err, socketInfo) =>
          if err?
            @Notify "Server Error","Error Starting Server: #{ error }"
            cb? err
          else
            @Notify "Server Started", "Started Server #{ @Server.status.url }"
            cb? null, @Server.status

  stopServer: (cb) ->
      @Server.stop (err, success) =>
        if err?
          @Notify "Server Error","Server could not be stopped: #{ error }"
          cb? err
        else
          @Notify 'Server Stopped', "Server Stopped"
          cb? null, @Server.status

  restartServer: ->
    @startServer()

  changePort: =>
  getLocalFilePathWithRedirect: (url) ->
    filePathRegex = /^((http[s]?|ftp|chrome-extension|file):\/\/)?\/?([^\/\.]+\.)*?([^\/\.]+\.[^:\/\s\.]{2,3}(\.[^:\/\s\.]‌​{2,3})?)(:\d+)?($|\/)([^#?\s]+)?(.*?)?(#[\w\-]+)?$/
   
    return null unless @data[@currentTabId]?.maps?

    resPath = url.match(filePathRegex)?[8]
    if not resPath?
      # try relpath
      resPath = url

    return null unless resPath?
    
    for map in @data[@currentTabId].maps
      resPath = url.match(new RegExp(map.url))? and map.url?

      if resPath
        if referer?
          # TODO: this
        else
          filePath = url.replace new RegExp(map.url), map.regexRepl
        break
    return filePath

  URLtoLocalPath: (url, cb) ->
    filePath = @Redirect.getLocalFilePathWithRedirect url

  getFileMatch: (filePath, cb) ->
    return cb? 'file not found' unless filePath?
    show 'trying ' + filePath
    @findFileForPath @data.directories, filePath, (err, fileEntry, directory) =>

      if err? 
        show 'no files found for ' + filePath
        return cb? err

      delete fileEntry.entry
      @data.currentFileMatches[filePath] = 
        fileEntry: chrome.fileSystem.retainEntry fileEntry
        filePath: filePath
        directory: directory
      cb? null, @data.currentFileMatches[filePath], directory
      


  findFileInDirectories: (directories, path, cb) ->
    myDirs = directories.slice() 
    _path = path
    _dir = myDirs.shift()

    @FS.getLocalFileEntry _dir, _path, (err, fileEntry) =>
      if err?
        _dir = myDirs.shift()
        if _dir isnt undefined
          @findFileInDirectories myDirs, _path, cb
        else
          cb? 'not found'
      else
        cb? null, fileEntry, _dir

  findFileForPath: (dirs, path, cb) ->
    @findFileInDirectories dirs, path, (err, fileEntry, directory) =>
      if err?
        if path is path.replace(/.*?\//, '')
          cb? 'not found'
        else
          @findFileForPath dirs, path.replace(/.*?\//, ''), cb
      else
        cb? null, fileEntry, directory
  
  mapAllResources: (cb) ->
    @getResources =>
      for item in @data.currentResources
        localPath = @URLtoLocalPath item.url
        if localPath?
          @getFileMatch localPath, (err, success) =>
              cb? null, 'done' unless err?


module.exports = Application


