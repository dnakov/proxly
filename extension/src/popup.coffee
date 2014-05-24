require 'angular'
require 'angular-sanitize'
require 'angular-animate'

# filer = require './filer.min.js'

ProxlyCtrl = require '../../proxly-ctrl.coffee'

root = exports ? this
app = null

class PopupCtrl extends ProxlyCtrl
  currentTab:{}
  currentTabId:{}

  constructor: ->
    super
    @currentTabId
    chrome.tabs.query
      active:true
      currentWindow:true
    ,(tabs) =>
      @currentTab = tabs[0]
      @app.Redirect.currentTabId = @currentTab.id
      @app.currentTabId = @currentTab.id

  toggleItem: (item) =>
    _maps = []
    # item.isOn = !item.isOn
    _maps.push _item for _item in @$scope.maps when _item.isOn
    
    @app.Redirect
    .tab @currentTab.id 
    .withMaps @app.data.maps

    @app.mapAllResources () =>
      @app.Redirect
      # .tab @currentTab.id
      .withPrefix 'http://' + @app.data.server.host + ':' + @app.data.server.port + '/'
      .withMaps @app.data.maps
      .toggle()

#     # @app.startServer() unless @data.server?.isOn

# class PopupCtrl
#   currentTab:{}
#   constructor: (@scope, @filter, @sce, $document, $window, @dndFile) ->
#     @app = $window.app

#     @app.Storage.retrieveAll()

#     @data = @app.Storage.data

#     @scope.server = @data.server

#     @scope.maps = @data.maps 
#     @scope.currentResources = @data.currentResources 
#     @scope.resources = @data.resources 
#     @scope.directories = @data.directories 
#     @scope.save = @save
#     @scope.resourceMap = @resourceMap = []
#     @scope.getResources = @getResources
#     @scope.urlFilter = @urlFilter = 'resource'
#     @scope.findMatches = @findMatches
#     @scope.foundFiles = {}
#     @scope.dirDisplay = {}
#     @scope.currentFilter = {}
#     @scope.setCurrentFilter = @setCurrentFilter
#     @scope.trustAsResourceUrl = @trustAsResourcUrl
#     @scope.urls = {}
#     @scope.newMapping = @newMapping
#     @scope.newDirectory = @newDirectory
#     @scope.deleteDirectory = @deleteDirectory
#     @scope.getHtmlSafe = @getHtmlSafe
#     @scope.setLocalPath = @setLocalPath
#     @scope.toggleServer = @toggleServer
#     @scope.deleteMapping = @deleteMapping
#     @scope.setCurrent = @setCurrentunless
#     @scope.refreshCurrentResources = @refreshCurrentResources
#     @scope.changePort = @changePort
#     @scope.onDrop = @onDrop
#     @scope.toggleItem = @toggleItem
#     @scope.getClass = @getClass
#     @scope.newItem = @newItem
#     @scope.currentFileMatches = @data.currentFileMatches
#     @scope.openApp = @openApp
#     @scope.maps = @data.maps
#     @scope.currentTab = @currentTab

#     chrome.tabs.query
#       active:true
#       currentWindow:true
#     ,(tabs) =>
#       @currentTab = tabs[0]
#       @app.currentTabId = @currentTab.id
#     @dnd = new dndFile 'html', @onDrop if @dndFile?
#     # $document.on 'dragenter', @onDrop

#     # @app.Storage.retrieveAll () =>
#     #   if @data.maps? then @setLocalPath item for item in @data.maps

#     @scope.presets = [
#       presetName:'Salesforce'
#       url:'https.*\/resource(\/[0-9]+)?\/([A-Za-z0-9\-._]+\/)?'
#       regexRepl:''
#       ]

#     @scope.navIsRedirect=false
#     @scope.showResources=false

    

#   toggleItem: (item) =>
#     _maps = []
#     # item.isOn = !item.isOn
#     _maps.push _item for _item in @scope.maps when _item.isOn
#     debugger;

#     @app.mapAllResources () =>
#       @app.Redirect
#       .tab @currentTab.id
#       .withPrefix 'http://' + @app.data.server.host + ':' + @app.data.server.port + '/'
#       .withMaps app.data.maps
#       .toggle()

#     # @app.startServer() unless @data.server?.isOn
    

#   onDrop: (event) =>
#     entry = event.items[0]?.webkitGetAsEntry?()
#     return unless entry?.isDirectory
#     @app.FS.openDirectory entry, (err, pathName, dir) =>
#       dir.name = pathName.match(/[^\/]+$/)?[0]
#       delete dir.entry
#       dir.pathName = pathName
#       dir.isOn = true
#       @data.directories.unshift dir
#       # @scope.$apply()

#   save: (close) =>
#     @app.Storage.saveAllAndSync()
#     chrome.app.window.current().close() if close
#       # @app.Storage.set resourceMap:@scope.resourceMap

#   refreshCurrentResources: () =>
#     @app.getResources (currentResources) =>
#       @scope.currentResources = @data.currentResources = currentResources
#       # @scope.$apply()

#   newDirectory: () =>
#     @openDirectory (err, pathName, dir) =>
#       # @scope.$apply()

#   newMapping: (item) =>
#     newItem = if item? then angular.copy(item) else {}
#     newItem.isRedirect = true
#     newItem.url = newItem.regexRepl = '' 
#     @data.maps.unshift newItem
#     newItem.name = 'Redirect ' + @data.maps.length
#     # @openDirectory newItem, (pathName, dir) =>
#     #   newItem.name = pathName.match(/[^\/]+$/)?[0]
#     #   newItem.directory = pathName
#     #   @setLocalPath newItem
#     #   @data.maps.unshift newItem      
#     #   @scope.currentFilter = item
#     #   @scope.$apply()

#   deleteDirectory: (item) =>
#     idx = @data.directories.indexOf item
#     @data.directories.splice(idx, 1) if idx >= 0

#   deleteMapping: (item) =>
#     idx = @data.maps.indexOf item
#     @data.maps.splice(idx, 1) if idx >= 0
#     @currentFilter = {}

#   setLocalPath: (item) =>
    
#     try
#       reg = new RegExp item.url
#       item.regexIsWrong = false
#     catch e
#       item.regexIsWrong = true
#       # @scope.$apply()
#       return 
    
#     @scope.currentFilter = angular.copy item unless item.regexIsWrong

#     for resource in @scope.filteredResources
#       resource.localPath = resource.url.replace(reg, item.regexRepl)
#       _dirs = [] 
#       _dirs.push dir for dir in @scope.directories when dir.isOn
#       @app.getFileMatch resource.localPath, (err, fileMatch, directory) => 
#         return if err? 
#         for res in @scope.filteredResources when res.localPath is fileMatch.filePath
#           res.localFile = directory.pathName + '/' + res.localPath
#         # @scope.$apply()


#   openDirectory: (cb) =>
#     # @app.FS.openDirectory (pathName, dir) =>
#     chrome.fileSystem.chooseEntry type:'openDirectory', (directoryEntry, files) =>
#       @app.FS.openDirectory directoryEntry, (err, pathName, dir) =>
#         dir.name = pathName.match(/[^\/]+$/)?[0]
#         dir.pathName = pathName    
#         dir.isOn = true    
#         # can't save circular blah blah
#         delete dir.entry
#         @data.directories.unshift dir
#         cb?(pathName,dir)

#   setCurrentFilter: (item) ->
#     @currentFilter = angular.copy item

#   getHtmlSafe: (text) ->
#     @sce.trustAsHtml text

#   toggleServer: () =>
#     if @app.data.server.isOn
#       @app.stopServer =>
#         @scope.$apply()
#     else
#       @app.startServer =>
#         @scope.$apply()

#   getClass: (type, item) ->
#     if type is 'on'
#       if item.isOn then 'btn-success' else 'btn-default'
#     else
#       if item.isOn then 'btn-default' else 'btn-danger'

#   newItem: () =>
#     if @scope.navIsRedirect
#       @newMapping()
#     else
#       @newDirectory()

#   getFullDirList: (directories) ->
#     for own key, d of directories
#       @getOneDirList d

#   getDirList: (d) ->
#     @lsR d.entry, (results) =>
#       d.list = results
#     ,(error, results) ->
#       show(error, results)

#   getOneDirList: (d) ->
#     if d.entry?
#       @getDirList d
#     else
#       @app.FS.restoreEntry d.directoryEntryId, (entry) =>
#         d.entry = entry
#         @getDirList d

#   findMatches: =>
#     if @scope.directoryEntry?
#       promises = []
#       for item in @filter('filter')(@scope.resourceMap, 'url':@scope.urlFilter, false)
#         do (item) =>
#           @$findFile(@scope.directoryEntry, item.url, -1)
#           .then (something) ->
#             show 'something'

#         # @q.all(promises).then (results) ->

#     else
#       @app.openDirectory()

#   trustAsResourcUrl: (url) ->
#     @sce.trustAsResourceUrl url


chrome.runtime.getBackgroundPage (win) =>
  return if ngapp? 
  try
    angular.module('redir-popup')
  catch e

    # window.app = win.app if win?.app?
    found = false
    for dir in win.app.data.directories
      if dir.directoryEntryId?
        found = true
        break

    return win.app.openApp() unless found and win.app.data.maps?.length > 0

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


    ngapp = angular.module 'redir-popup', ['ngSanitize', 'ui.highlight','ngAnimate']
    
    ngapp.factory 'proxlyApp', => win.app

    ngapp.directive 'flipSwitch', () ->
      restrict:'AE',
      scope:
        _model:'=boolModel',
        # _onChange:'=onChange'
        id:"@identifier"
      template:'''
      <div class="onoffswitch">
        <input type="checkbox" name="onoffswitch"  id="{{id}}" class="onoffswitch-checkbox" ng-model="_model">
        <label class="onoffswitch-label" for="{{id}}">
            <span class="onoffswitch-inner"></span>
            <span class="onoffswitch-switch"></span>
        </label>
      </div>
      '''
      replace:true    

    ngRegex = ngapp.filter "regex", ->
      (input, field, regex) ->
        patt = new RegExp(regex)
        out = []
        i = 0

        while i < input.length
          out.push input[i]  if patt.test(input[i][field])
          i++
        out

    PopupCtrl.$inject = ["$scope", "$filter", "$sce", "$document", "$window","proxlyApp"]
    ngapp.controller 'PopupCtrl', PopupCtrl
    angular.bootstrap document, ['redir-popup']    
