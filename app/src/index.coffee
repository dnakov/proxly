# require 'jquery'
require 'angular'
require 'angular-sanitize'
require 'angular-animate'
getGlobal = ->
  _getGlobal = ->
    this

  _getGlobal()

root = getGlobal()
# root = exports ? this

# root.filer = filer
# Application = require '../../common.coffee'
require '../../util.coffee'

DnDFileController = (selector, onDropCallback) ->
  el_ = document.querySelector(selector)
  overCount = 0
  @dragenter = (e) ->
    e.stopPropagation()
    e.preventDefault()
    overCount++
    show 'dragenter'
    el_.classList.add "dropping"
    return

  @dragover = (e) ->
    e.stopPropagation()
    e.preventDefault()
    show 'dragover'
    return

  @dragleave = (e) ->
    e.stopPropagation()
    e.preventDefault()
    show 'dragleave'
    if --overCount <= 0
      el_.classList.remove "dropping"
      overCount = 0
    return

  @drop = (e) ->
    e.stopPropagation()
    e.preventDefault()
    show 'drop'
    show e
    el_.classList.remove "dropping"
    onDropCallback e.dataTransfer
    return

  el_.addEventListener "dragenter", @dragenter, false
  el_.addEventListener "dragover", @dragover, false
  el_.addEventListener "dragleave", @dragleave, false
  el_.addEventListener "drop", @drop, false
  return

class MainCtrl
  constructor: (@scope, @filter, @sce, $document) ->
    show(@scope)
    @app = root.app
    @dnd = new DnDFileController 'html', @onDrop

    @data = @app.Storage.data

    @scope.server = @data.server

    @scope.maps = @data.maps ?= []
    @scope.currentResources = @data.currentResources ?= []
    @scope.resources = @data.resources ?= {}
    @scope.directories = @data.directories ?= []
    @scope.save = @save
    @scope.resourceMap = @resourceMap = []
    @scope.getResources = @getResources
    @scope.urlFilter = @urlFilter = 'resource'
    @scope.findMatches = @findMatches
    @scope.foundFiles = {}
    @scope.dirDisplay = {}
    @scope.currentFilter = {}
    @scope.setCurrentFilter = @setCurrentFilter
    @scope.trustAsResourceUrl = @trustAsResourcUrl
    @scope.urls = {}
    @scope.newMapping = @newMapping
    @scope.newDirectory = @newDirectory
    @scope.deleteDirectory = @deleteDirectory
    @scope.getHtmlSafe = @getHtmlSafe
    @scope.setLocalPath = @setLocalPath
    @scope.toggleServer = @toggleServer
    @scope.deleteMapping = @deleteMapping
    @scope.setCurrent = @setCurrent
    @scope.refreshCurrentResources = @refreshCurrentResources
    @scope.changePort = @changePort
    @scope.onDrop = @onDrop
    @scope.toggleItem = @toggleItem
    @scope.getClass = @getClass
    @scope.newItem = @newItem
    @scope.currentFileMatches = @data.currentFileMatches

    $document.on 'dragenter', @onDrop

    # @app.Storage.retrieveAll () =>
    #   if @data.maps? then @setLocalPath item for item in @data.maps

    @scope.presets = [
      presetName:'Salesforce'
      url:'https.*\/resource(\/[0-9]+)?\/([A-Za-z0-9\-._]+\/)?'
      regexRepl:''
      ]

    @scope.navIsRedirect=false


    @init()

  init: ->
    @loadCurrentResources()

  onDrop: (event) =>
    entry = event.items[0]?.webkitGetAsEntry?()
    return unless entry?.isDirectory
    @app.FS.openDirectory entry, (pathName, dir) =>
      dir.name = pathName.match(/[^\/]+$/)?[0]
      delete dir.entry
      dir.pathName = pathName
      dir.isOn = true
      @data.directories.unshift dir
      @scope.$apply()


  loadCurrentResources: () ->
    @app.getResources()

  save: (close) =>
    @app.Storage.saveAllAndSync()
    chrome.app.window.current().close() if close
      # @app.Storage.set resourceMap:@scope.resourceMap

  refreshCurrentResources: () =>
    @loadCurrentResources()

  newDirectory: () =>
    @openDirectory (pathName, dir) =>
      @scope.$apply()

  newMapping: (item) =>
    newItem = if item? then angular.copy(item) else {}
    newItem.isRedirect = true
    newItem.url = newItem.regexRepl = '' 
    @data.maps.unshift newItem
    newItem.name = 'Redirect ' + @data.maps.length
    # @openDirectory newItem, (pathName, dir) =>
    #   newItem.name = pathName.match(/[^\/]+$/)?[0]
    #   newItem.directory = pathName
    #   @setLocalPath newItem
    #   @data.maps.unshift newItem      
    #   @scope.currentFilter = item
    #   @scope.$apply()

  deleteDirectory: (item) =>
    idx = @data.directories.indexOf item
    @data.directories.splice(idx, 1) if idx >= 0

  deleteMapping: (item) =>
    idx = @data.maps.indexOf item
    @data.maps.splice(idx, 1) if idx >= 0
    @currentFilter = {}

  setLocalPath: (item) =>
    @scope.currentFilter = item
    reg = new RegExp item.url
    for resource in @scope.filteredResources
      resource.localPath = resource.url.replace(reg, item.regexRepl)
      _dirs = [] 
      _dirs.push dir for dir in @scope.directories when dir.isOn
      @app.findLocalFilePathForURL resource.url, (fileMatch, directory) => 
        for res in @scope.filteredResources when res.localPath is fileMatch.filePath
          res.localFile = directory.pathName + '/' + res.localPath
        @scope.$apply()


  openDirectory: (cb) =>
    # @app.FS.openDirectory (pathName, dir) =>
    chrome.fileSystem.chooseEntry type:'openDirectory', (directoryEntry, files) =>
      @app.FS.openDirectory directoryEntry, (pathName, dir) =>
        dir.name = pathName.match(/[^\/]+$/)?[0]
        dir.pathName = pathName    
        dir.isOn = true    
        # can't save circular blah blah
        delete dir.entry
        @data.directories.unshift dir
        cb?(pathName,dir)

  setCurrentFilter: (item) ->
    @currentFilter = angular.copy item

  getHtmlSafe: (text) ->
    @sce.trustAsHtml text

  toggleServer: () =>
    if @scope.server.isOn
      @app.stopServer =>
        @scope.$apply()
    else
      @app.startServer =>
        @scope.$apply()

  getClass: (type, item) ->
    if type is 'on'
      if item.isOn then 'btn-success' else 'btn-default'
    else
      if item.isOn then 'btn-default' else 'btn-danger'

  newItem: () =>
    if @scope.navIsRedirect
      @newMapping()
    else
      @newDirectory()

  toggleItem: (item) ->
    item.isOn = true unless item.isOn?
    item.isOn = !item.isOn

  getFullDirList: (directories) ->
    for own key, d of directories
      @getOneDirList d

  getDirList: (d) ->
    @lsR d.entry, (results) =>
      d.list = results
    ,(error, results) ->
      show(error, results)

  getOneDirList: (d) ->
    if d.entry?
      @getDirList d
    else
      @app.FS.restoreEntry d.directoryEntryId, (entry) =>
        d.entry = entry
        @getDirList d

  findMatches: =>
    if @scope.directoryEntry?
      promises = []
      for item in @filter('filter')(@scope.resourceMap, 'url':@scope.urlFilter, false)
        do (item) =>
          @$findFile(@scope.directoryEntry, item.url, -1)
          .then (something) ->
            show 'something'

        # @q.all(promises).then (results) ->

    else
      @app.openDirectory()

  trustAsResourcUrl: (url) ->
    @sce.trustAsResourceUrl url

  $findFile: (directoryEntry, url, level) =>
    pathArr = url.split('/')
    deferred = @q.defer()
    if pathArr.length > 3 and level > 3 - pathArr.length
      path = pathArr[level..].reduce (x,y) -> x + '/' + y

      directoryEntry.getFile path, {},
        (file) =>
          @scope.foundFiles[url] = filePath:file.fullPath
          show 'found'
          deferred.resolve()
        (error) =>
          show 'not found'
          @$findFile directoryEntry, url, level-1
          .then (file) =>
            @scope.foundFiles[url] = filePath:file.fullPath
            deferred.resolve()
    else
      deferred.reject()
    return deferred.promise

  sendRules: ->
        # @MSG

chrome.runtime.getBackgroundPage (win) ->
  root.app = win.app

  nghighlight = angular.module("ui.highlight", []).filter "highlight", ->
    (text, search, caseSensitive) ->
      if text and (search or angular.isNumber(search))
        text = text.toString()
        search = search.toString()
        if caseSensitive
          text.split(search).join "<span class=\"ui-match\">" + search + "</span>"
        else
          text.replace new RegExp(search, "gi"), "<span class=\"ui-match\">$&</span>"
      else
        text

  ngapp = angular.module 'redir', ['ngSanitize', 'ui.highlight','ngAnimate']

  MainCtrl.$inject = ["$scope", "$filter", "$sce", "$document"]
  ngapp.controller 'MainCtrl', MainCtrl

  ngRegex = ngapp.filter "regex", ->
    (input, field, regex) ->
      patt = new RegExp(regex)
      out = []
      i = 0

      while i < input.length
        out.push input[i]  if patt.test(input[i][field])
        i++
      out

  angular.bootstrap document, ['redir']


root.lsR = (dir, onsuccess, onerror) =>
  results = {}
  todo = 0
  dive = (dir) =>
    todo++
    reader = dir.createReader()
    reader.readEntries (entries) =>
      todo--
      for entry in entries
        do (entry) =>
          results[entry.fullPath] = entry
          dive entry if entry.isDirectory
          show entry
      onsuccess results if todo is 0
    ,(error) =>
      todo--
      show error
      onerror error, results if todo is 0
    dive dir
