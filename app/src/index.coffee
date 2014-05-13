require 'angular'
require 'angular-sanitize'

# filer = require './filer.min.js'

root = exports ? this
# root.filer = filer
Application = require '../../common.coffee'


class AppMain extends Application
  init: () ->
        # @startAngular()

app = new AppMain


class MainCtrl
  app:app
  constructor: (@scope, @filter, @q, @sce) ->
    show(@scope)

    @data = @app.Storage.data
    @scope.server =
        host:@app.Server.host
        port:@app.Server.port
        stopped:@app.Server.stopped
        status:'on'

    @scope.maps = @data.maps ?= []
    @scope.currentResources = @data.currentResources ?= []
    @scope.resources = @data.resources ?= {}
    @scope.directories = @data.directories ?= {}
    @scope.save = @save
    @scope.resourceMap = @resourceMap = []
    @scope.getResources = @getResources
    @scope.urlFilter = @urlFilter = 'resource'
    @scope.findMatches = @findMatches
    @scope.foundFiles = {}
    @scope.dirDisplay = {}
    @scope.trustAsResourceUrl = @trustAsResourcUrl
    @scope.urls = {}
    @scope.newMapping = @newMapping
    @scope.openDirectory = @openDirectory
    @scope.getHtmlSafe = @getHtmlSafe
    @scope.setLocalPath = @setLocalPath

    @scope.presets = [
      presetName:'Salesforce'
      url:'https.*\/resource(\/[0-9]+)?\/([A-Za-z0-9\-._]+\/)?'
      ]

    @init()

  init: =>
    @app.Storage.callback = () =>
      @scope.$apply()

  save: (close) =>
    @app.Storage.saveAll()
    @app.MSG.Ext 'redirInfo':
      maps:@scope.maps
      server:
        url:'http://' + @app.Server.host + ':' + @app.Server.port + '/slredir?'
      # @app.Storage.set resourceMap:@scope.resourceMap
      # chrome.app.window.current().close()-98

  newMapping: (item) ->
    newItem = angular.copy(item)
    @maps.push newItem
    @openDirectory(newItem)

  deleteMapping: (item) ->
    idx = @maps.indexOf item
    @maps.splice(idx, 1) if idx >= 0

  setLocalPath: (item) ->
    reg = new RegExp item.url
    (resource.localPath = resource.url.replace(reg, item.regexRepl)) for resource in @filteredResources


  openDirectory: (mapDir) =>
    @app.FS.openDirectory (pathName, dir) =>
      mapDir.directory = pathName
      @scope.directories[pathName] = dir
      @app.Storage.saveAll()
      show pathName
      show dir

  getHtmlSafe: (text) ->
    @sce.trustAsHtml text

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

app.Storage.retrieveAll (results) =>

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

  ngapp = angular.module 'redir', ['ngSanitize', 'ui.highlight']
  MainCtrl.$inject = ["$scope", "$filter", "$q", "$sce"]
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
