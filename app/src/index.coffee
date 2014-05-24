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

  # ProxlyCtrl.$inject = ["$scope", "$filter", "$sce", "$document", "$window", "dndFile"]

  ngapp.controller 'ProxlyCtrl', ProxlyCtrl
  

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
