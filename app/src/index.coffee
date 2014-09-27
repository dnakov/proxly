# require 'jquery'
require 'angular'
require 'angular-sanitize'
require 'angular-animate'
ProxlyCtrl = require '../../proxly-ctrl.coffee'

# root = exports ? this

# root.filer = filer
# Application = require '../../common.coffee'
DnDFileController = require '../../dndfile.coffee'
require '../../util.coffee'


chrome.runtime.getBackgroundPage (win) ->
  

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

  ngapp.factory 'proxlyApp', => win.app
  ngapp.factory 'dndFile', -> DnDFileController

  # ProxlyCtrl.$inject = ["$scope", "$filter", "$sce", "$document", "$window", "dndFile"]

  ngapp.controller 'ProxlyCtrl', ProxlyCtrl
  
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
      
      return unless input?

      while i < input.length
        out.push input[i]  if patt.test(input[i][field])
        i++
      out

  angular.bootstrap document, ['redir']


# root.lsR = (dir, onsuccess, onerror) =>
#   results = {}
#   todo = 0
#   dive = (dir) =>
#     todo++
#     reader = dir.createReader()
#     reader.readEntries (entries) =>
#       todo--
#       for entry in entries
#         do (entry) =>
#           results[entry.fullPath] = entry
#           dive entry if entry.isDirectory
#           show entry
#       onsuccess results if todo is 0
#     ,(error) =>
#       todo--
#       show error
#       onerror error, results if todo is 0
#     dive dir
