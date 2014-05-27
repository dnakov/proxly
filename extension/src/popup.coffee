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
    @$scope.currentTabId = @currentTabId
    # @$scope.serverCheckbox = angular.copy 
    @$scope.navIsRedirect = true
    chrome.tabs.query
      active:true
      currentWindow:true
    ,(tabs) =>
      @currentTab = tabs[0]
      @currentTabId = tabs[0].id
      @app.Redirect.currentTabId = @currentTab.id
      @app.currentTabId = @currentTab.id
      @app.tabMaps ?= {}
      @app.tabMaps[@currentTabId] ?= {}
      @app.tabMaps[@currentTabId].maps ?= angular.copy @app.data.maps || []
      @$scope.maps = @app.tabMaps[@currentTabId].maps


  toggleItem: (item) =>
    _maps = []
    # item.isOn = !item.isOn
    # _maps.push _item for _item in @$scope.maps when _item.isOn
    _item.isOn = false for _item in @$scope.maps when _item isnt item

    @app.Redirect
    .tab @currentTab.id 
    .withMaps @$scope.maps

    @app.mapAllResources () =>
      isOn = @app.Redirect
      # .tab @currentTab.id
      .withPrefix @app.data.server.status.url
      .withMaps @$scope.maps
      .toggle()

      chrome.tabs.reload @currentTab.id, bypassCache:true, () =>
        if isOn then @app.setBadgeText null, @currentTab.id
        else @app.removeBadgeText @currentTab.id


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
      id:"@identifier",
      toggleThis:'&toggleThis'
      _model:'=ngModel'
    template:'''
    <div class="onoffswitch">
      <input type="checkbox" name="onoffswitch" id="{{id}}" ng-model="_model" ng-change="toggleThis()" class="onoffswitch-checkbox">
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
