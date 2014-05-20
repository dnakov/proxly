require 'angular'
require 'angular-sanitize'

# filer = require './filer.min.js'

root = exports ? this
app = null

class MainCtrl
  app:null
  background:null
  currentTab: {}
  constructor: (@scope, @filter, @q, @sce, @window) ->
    @app = app

    @data = @app.data
 
    @scope.openApp = @openApp
    @scope.maps = @data.maps
    @scope.toggleItem = @toggleItem
    @scope.currentTab = @currentTab

    chrome.tabs.query
      active:true
      currentWindow:true
    ,(tabs) =>
      @currentTab = tabs[0]
      @app.currentTabId = @currentTab.id

  openApp: () ->
    app.openApp()

  toggleItem: (item) =>
    _maps = []
    item.isOn = !item.isOn
    _maps.push _item for _item in @scope.maps when _item.isOn

    app.Redirect
    .tab @currentTab.id
    .withMaps _maps

    @app.startServer() unless @data.server?.isOn
    # _item.isOn = false for _item in @maps when _item isnt @currentMap

chrome.runtime.getBackgroundPage (win) =>
  app = win.app
  ngapp = angular.module 'redir-popup', ['ngSanitize']
  MainCtrl.$inject = ["$scope", "$filter", "$q", "$sce", "$window"]
  ngapp.controller 'MainCtrl', MainCtrl
  angular.bootstrap document, ['redir-popup']    
