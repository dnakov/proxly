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
      if @app.liveReload[@currentTabId]? 
        @$scope.liveReload = @app.liveReload[@currentTabId]
      else 
        @$scope.liveReload = @app.liveReload[@currentTabId] = {active:false}

      @app.Redirect.currentTabId = @currentTab.id
      @app.currentTabId = @currentTab.id
      @app.tabMaps ?= {}
      @app.tabMaps[@currentTabId] ?= {}


      @app.tabMaps[@currentTabId].maps = angular.copy @app.data.maps || []
      @app.tabMaps[@currentTabId].active ?= {}


      @$scope.tabMaps = @app.tabMaps[@currentTabId].maps
      for item in @$scope.tabMaps
        Object.defineProperty item, "isOn", 
          get: do () => 
            that = @
            () -> 
              return that.app.tabMaps[that.currentTabId].active[@name] is true

          set: do () =>
            that = @
            (value) -> 
              that.app.tabMaps[that.currentTabId].active[@name] = value 
      
      @app.tabHeaders ?= {}
      @app.tabHeaders[@currentTabId] ?= {}

      @app.tabHeaders[@currentTabId].headers = @app.data.headers || []
      @app.tabHeaders[@currentTabId].active ?= {}

      @$scope.tabHeaders = @app.tabHeaders[@currentTabId].headers
      for item in @$scope.tabHeaders
        Object.defineProperty item, "isOn", 
          get: do () => 
            that = @
            () -> 
              return that.app.tabHeaders[that.currentTabId].active[@name] is true

          set: do () =>
            that = @
            (value) -> 
              that.app.tabHeaders[that.currentTabId].active[@name] = value               
      
      @$scope.cors = @app.data.cors[@currentTab.id] ?= {}

      @$scope.$apply()
          
  toggleLiveReload: () ->

    if @app.liveReload[@currentTabId]?.active is true
      for item in @$scope.tabMaps when item.isOn
        do (item) =>
          if item.type is "Web Server"
            @app.LiveReloadClient.activate @currentTabId, proper:true, () =>
              @app.watchFiles @currentTabId, item
          else
            @app.LiveReloadClient.activate @currentTabId, proper:false, () =>
              @app.watchFiles @currentTabId, item
    else
      @app.stopWatchingFiles @currentTabId, item
      @app.LiveReloadClient.deactivate()
      # @app.liveReload[@currentTabId]?.active = false
    # @$scope.apply()

  deleteHeader: (item) ->
    idx = @$scope.tabHeaders.indexOf item
    @$scope.tabHeaders.splice(idx, 1) if idx >= 0

  newHeader: () ->
    @$scope.tabHeaders.push
      type:"Request"
      name:''
      value:''
      isOn:true

  toggleHeader: () =>
    @app.Redirect
    .tab @currentTab.id 

    isOn = @app.Redirect
    .withHeaders @$scope.tabHeaders
    .toggle()

  toggleCORS: () =>
    debugger
    @app.Redirect
    .tab @currentTab.id
    .withCORS @$scope.cors
    .toggle()


  toggleItem: (item) =>
    _maps = []

    # item.isOn = !item.isOn
    # _maps.push _item for _item in @$scope.tabMaps when _item.isOn
    _item.isOn = false for _item in @$scope.tabMaps when _item isnt item

    @app.Redirect
    .tab @currentTab.id 
    .withMaps @$scope.tabMaps

    prefix = @app.Storage.session.server.status.url 

    if item.type isnt 'Local Dir' 
      prefix = item.origin

    # @app.mapAllResources () =>
    isOn = @app.Redirect
    # .tab @currentTab.id
    .withPrefix prefix
    .withMaps @$scope.tabMaps
    .toggle()
    if isOn and item.type is 'Local Dir'
      @$scope.liveReload.active = true
      @toggleLiveReload(item)
      @app.startServer item.directoryEntryId, () =>
        @$scope.server.status.isOn = true

        chrome.tabs.reload @currentTab.id, bypassCache:true, () =>
          @app.setBadgeText null, @currentTab.id
          # window.close();
    else
      @$scope.liveReload.active = false
      @toggleLiveReload(item)
      @$scope.server.status.isOn = false
      chrome.tabs.reload @currentTab.id, bypassCache:true, () =>
        @app.stopServer () =>
        @app.removeBadgeText @currentTab.id
          # window.close();

  toggleServer: () ->
    for item in @$scope.tabMaps when item.isOn is true and item.type is 'Local Dir'
      if @$scope.server.status.isOn is true
        @app.startServer item.directoryEntryId, () =>
          @$scope.server.status.isOn = true
        # chrome.tabs.reload @currentTab.id, bypassCache:true, () =>
        #   @app.setBadgeText null, @currentTab.id
        #   # window.close();
      else
        @$scope.server.status.isOn = false
        @app.stopServer () =>

chrome.runtime.getBackgroundPage (win) =>
  return if ngapp? 
  try
    angular.module('redir-popup')
  catch e

  # window.app = win.app if win?.app?
  found = false
  # for dir in win.app.data.directories
  #   if dir.directoryEntryId?
  #     found = true
  #     break
  for item in win.app.data.maps
    if item.dir? and item.dir?.directoryEntryId?
      found = true
      break
    if item.type == 'Web Server'
      found = true
      break      

  return win.app.openApp() unless found

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

  ngapp.directive "flipSwitch", ->
    restrict: "EA"
    replace: true
    require: "ngModel"
    scope:
      afterToggle:'&'
      disabled: "@"
      onLabel: "@"
      offLabel: "@"
      knobLabel: "@"

    template: "<div role=\"radio\" class=\"switch\" ng-class=\"{ 'disabled': disabled }\">" + "<div class=\"switch-animate\" ng-class=\"{'switch-off': !model, 'switch-on': model}\">" + "<span class=\"switch-left\" ng-bind=\"onLabel\"></span>" + "<span class=\"knob\" ng-bind=\"knobLabel\"></span>" + "<span class=\"switch-right\" ng-bind=\"offLabel\"></span>" + "</div>" + "</div>"
    link: (scope, element, attrs, ngModelCtrl) ->
      attrs.onLabel = "On"  unless attrs.onLabel
      attrs.offLabel = "Off"  unless attrs.offLabel
      attrs.knobLabel = "\u00a0"  unless attrs.knobLabel
      attrs.disabled = false  unless attrs.disabled
      element.on "click", ->
        scope.$apply scope.toggle
        return

      ngModelCtrl.$formatters.push (modelValue) ->
        modelValue

      ngModelCtrl.$parsers.push (viewValue) ->
        viewValue

      ngModelCtrl.$render = ->
        scope.model = ngModelCtrl.$viewValue
        return

      scope.toggle = toggle = ->
        unless scope.disabled
          scope.model = not scope.model
          ngModelCtrl.$setViewValue scope.model
          scope.afterToggle?()
        return

      return

  
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
