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
  liveReload:{}
  watchedFiles:{}
  fileWatchers: {}

  constructor: (deps) ->
    super

    @MSG ?= MSG.get()
    @LISTEN ?= LISTEN.get()
    
    chrome.runtime.onConnectExternal.addListener (port) =>
      if port.sender.id isnt @EXT_ID
        return false

      @MSG.setPort port
      @LISTEN.setPort port
    
    port = chrome.runtime.connect @EXT_ID 
    @MSG.setPort port
    @LISTEN.setPort port
    
    for prop of deps
      if typeof deps[prop] is "object" 
        @[prop] = @wrapObjInbound deps[prop]
      if typeof deps[prop] is "function" 
        @[prop] = @wrapObjOutbound new deps[prop]

    @Storage.onDataLoaded = (data) =>
      # @data = data
      # delete @Storage.data.server
      # @Storage.data.server = {}
      # delete @Storage.data.server.status

      if not @Storage.data.firstTime?
        @Storage.data.firstTime = false
        @Storage.data.maps.push
          name:'Example: Salesforce'
          url:'https.*\/resource(\/[0-9]+)?\/([A-Za-z0-9\-._]+\/)?'
          regexRepl:''
          isRedirect:true
          isOn:false
          type:'Local Dir'
          dir: {}
          directoryEntryId: ''
        @Storage.data.maps.push
          name:'Example: Gulp + Salesforce'
          url:'https.*\/resource(\/[0-9]+)?\/([A-Za-z0-9\-._]+\/)?'
          regexRepl:''
          isRedirect:true
          isOn:false
          type:'Web Server'
          origin:'http://localhost:9000/'
          dir: {}
          directoryEntryId: ''          


      # if @Redirect? then @Redirect.data = @data.tabMaps

    # @Notify ?= (new Notification).show 
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
    @getFileMatch = @wrap @, 'Application.getFileMatch', @getFileMatch
    @watchFiles = @wrap @, 'Application.watchFiles', @watchFiles
    @stopWatchingFiles = @wrap @, 'Application.stopWatchingFiles', @stopWatchingFiles

    @wrap = if @SELF_TYPE is 'EXTENSION' then @wrapInbound else @wrapOutbound

    @getResources = @wrap @, 'Application.getResources', @getResources
    @getCurrentTab = @wrap @, 'Application.getCurrentTab', @getCurrentTab


    @init()

  init: () ->
      @Storage.session.server = {}
      @Storage.session.server.status = @Server.status
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
    # needs management permission. off for now.
    chrome.management.launchApp @APP_ID, (extInfo) =>
      if chrome.runtime.lastError
        error chrome.runtime.lastError
      else
        cb? extInfo

  openApp: (item) =>
      chrome.app.window.create('index.html',
        id: "mainwin"
        bounds:
          width:770
          height:800,
      (win) =>
        if item then win.openDirectory(item)
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
          
          return cb?(null, @data.currentResources) if not results?

          for r in results
            for res in r
              @data.currentResources.push res
          cb? null, @data.currentResources


  getLocalFile: (info, cb) =>
    # filePath = info.uri
    # justThePath = filePath.match(/^([^#?\s]+)?(.*?)?(#[\w\-]+)?$/)
    # filePath = justThePath[1] if justThePath?
    # # filePath = @getLocalFilePathWithRedirect url
    # return cb 'file not found' unless filePath?
    # for item in @data.maps
    # _dirs = []
    # _dirs.push dir for dir in @data.directories when dir.isOn
    # filePath = filePath.substring 1 if filePath.substring(0,1) is '/'
    # @findFileForPath _dirs, filePath, (err, fileEntry, dir) =>
    #   if err? then return cb? err
    #   fileEntry.getMetadata (meta) =>
    #     @watchedFiles[filePath] = 
    #       entry:fileEntry
    #       lastModified:meta.modificationTime

    #   fileEntry.file (file) =>
    #     cb? null,fileEntry,file
    #   ,(err) => cb? err

  watchFiles: (tabId, map) ->

    if @fileWatchers[tabId]? then return

    @lsR map.dir
    
    @fileWatchers[tabId] = setInterval () =>
      for key, value of @watchedFiles when value.entry.isDirectory is false
        do (key,value) =>
          value.entry.getMetadata (meta) =>
            if value.lastModified?.getTime() < meta.modificationTime.getTime()
              @LiveReloadClient.reload(key)
              show value
            value.lastModified = meta.modificationTime
    ,500

  stopWatchingFiles: (tabId) ->
    clearInterval @fileWatchers[tabId]
    delete @fileWatchers[tabId]

  startServer: (dirId, cb) ->

    @Server.start dirId, null,null,null, (err, socketInfo) =>
        if err?
          # @Notify "Server Error","Error Starting Server: #{ err }"
          cb? err
        else
          # @Notify "Server Started", "Started Server #{ @Server.status.url }"
          cb? null, @Server.status

  stopServer: (cb) ->
      @Server.stop (err, success) =>
        if err?
          # @Notify "Server Error","Server could not be stopped: #{ error }"
          cb? err
        else
          # @Notify 'Server Stopped', "Server Stopped"
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

  getFileMatch: (item, filePath, cb) ->
    return cb? 'file not found' unless filePath?
    show 'trying ' + filePath
    @findFileForPath [item.dir], filePath, (err, fileEntry, directory) =>

      if err? 
        # show 'no files found for ' + filePath
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
        if myDirs.length > 0
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

      need = @data.currentResources.length
      found = notFound = 0
      for item in @data.currentResources
        localPath = @URLtoLocalPath item.url
        if localPath?
          @getFileMatch localPath, (err, success) =>
            need--
            show arguments
            if err? then notFound++
            else found++            

            if need is 0
              if found > 0
                cb? null, 'done'
              else
                cb? 'nothing found'

        else
          need--
          notFound++
          if need is 0
            cb? 'nothing found'

  setBadgeText: (text, tabId) ->
    badgeText = text || '' + Object.keys(@data.currentFileMatches).length
    chrome.browserAction.setBadgeText 
      text:badgeText
      # tabId:tabId

  getDirectoryForMap: (map) ->
    for dir in @data.directories when dir.directoryEntryId is map.directoryEntryId
      return dir  

  
  removeBadgeText:(tabId) ->
    chrome.browserAction.setBadgeText 
      text:''
      # tabId:tabId

  lsR: (dir, onsuccess, onerror) ->
    # @watchedFiles = {}

    chrome.fileSystem.restoreEntry dir.directoryEntryId, (dirEntry) =>
      
      todo = 0
      ignore = /.git|.idea|node_modules|bower_components/
      dive = (dir, watchedFiles) ->
        todo++
        reader = dir.createReader()
        reader.readEntries (entries) ->
          todo--
          for entry in entries
            do (entry) ->
              watchedFiles[entry.fullPath] = entry:entry
              if entry.fullPath.match(ignore) is null
                if entry.isDirectory
                  todo++
                  dive entry, watchedFiles 
              # show entry
          show 'onsuccess' if todo is 0
          # show 'onsuccess' watchedFiles if todo is 0
        ,(error) ->
          todo--
          show error
          # onerror error, watchedFiles if todo is 0 

      dive dirEntry, @watchedFiles  
      
  uniqueId = (length=8) ->
    id = ""
    id += Math.random().toString(36).substr(2) while id.length < length
    id.substr 0, length


module.exports = Application


