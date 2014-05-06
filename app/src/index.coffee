require 'angular'

# filer = require './filer.min.js'

root = exports ? this
# root.filer = filer
Application = require '../../common.coffee'
# $p.promisifyAll obj for obj in [chrome.storage.local, chrome.storage.sync, chrome.runtime, chrome.fileSystem]

# webkitRequestFileSystem window.TEMPORARY, 2*2, (dir) ->
#     $p.promisifyAll(dir.root.createReader().constructor.prototype)



class AppMain extends Application
    init: () ->
        # @startAngular()

app = new AppMain


class MainCtrl
    app:app
    constructor: (@scope, @filter, @q) ->
        console.log(@scope)

        @data = @app.Storage.data
        @scope.maps = @data.maps ?= []
        @scope.currentResources = @data.currentResources ?= []
        @scope.resources = @data.resources ?= {}
        @scope.directories = @data.directories ?= {}
        @scope.save = @save
        @scope.resourceMap = @resourceMap = []
        @scope.getResources = @getResources
        @scope.urlFilter = @urlFilter = 'resource';
        @scope.findMatches = @findMatches
        @scope.foundFiles = {}
        @scope.dirDisplay = {}
        @scope.urls = {};
        @scope.newMapping = @newMapping
        @scope.openDirectory = @openDirectory
        @scope.getHtmlSafe = @getHtmlSafe

        @init()

    init: =>
        @app.Storage.callback = () =>
            @scope.$apply()

    save: (close) =>
        undefined
        # @app.Storage.set resourceMap:@scope.resourceMap
        # chrome.app.window.current().close()-98

    newMapping: () ->
        @maps.push {}

    openDirectory: (mapDir) =>
        @app.FS.openDirectory (pathName, dir) =>
            mapDir.directory = pathName
            @scope.directories[pathName] = dir
            @app.Storage.saveAll()
            console.log pathName
            console.log dir

    getHtmlSafe: (text) ->
        # @sce.trustAsHtml text

    getFullDirList: (directories) ->
        for own key, d of directories
            @getOneDirList d

    getDirList: (d) ->
        @lsR d.entry, (results) =>
            d.list = results
        ,(error, results) ->
            console.log(error, results)

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
                        console.log 'something'

            # @q.all(promises).then (results) ->

        else
            @app.openDirectory()

    $findFile: (directoryEntry, url, level) =>
        pathArr = url.split('/')
        deferred = @q.defer()
        if pathArr.length > 3 and level > 3 - pathArr.length
            path = pathArr[level..].reduce (x,y) -> x + '/' + y

            directoryEntry.getFile path, {},
                (file) =>
                    @scope.foundFiles[url] = filePath:file.fullPath
                    console.log 'found'
                    deferred.resolve()
                (error) =>
                    console.log 'not found'
                    @$findFile directoryEntry, url, level-1
                    .then (file) =>
                        @scope.foundFiles[url] = filePath:file.fullPath
                        deferred.resolve()
        else
            deferred.reject()
        return deferred.promise

    # compileResourceList: =>
        # for res, path = res.url.match('.*/')[0] in @scope.resourceMap when res.url.match('.*/') isnt null
        #     do (res) ->
        #         if @resource[path]? then @resource[path].push res else @resource[path] = []
            # do (res) ->
            #     path = if res.url.match('.*/')? then res.url.match('.*/')[0]
            #     @resources[path] = if @resources.path? then

    sendRules: ->
        # @MSG


app.Storage.retrieveAll (results) ->
    ngapp = angular.module 'redir', ['ui-highlight']
    MainCtrl.$inject = ["$scope", "$filter", "$q"]
    ngapp.controller 'MainCtrl', MainCtrl
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
                        console.log entry
                onsuccess results if todo is 0
            ,(error) =>
                todo--
                console.log error
                onerror error, results if todo is 0
    dive dir

###
Wraps the
@param text {string} haystack to search through
@param search {string} needle to search for
@param [caseSensitive] {boolean} optional boolean to use case-sensitive searching
###
# angular.module("ui.highlight", []).filter "highlight", ->
#   (text, search, caseSensitive) ->
#     if text and (search or angular.isNumber(search))
#       text = text.toString()
#       search = search.toString()
#       if caseSensitive
#         text.split(search).join "<span class=\"ui-match\">" + search + "</span>"
#       else
#         text.replace new RegExp(search, "gi"), "<span class=\"ui-match\">$&</span>"
#     else
#       text

# path:
#     relPath:''
#     directoryEntryId:''
#     entry:entry

# angular.bootstrap document, ['redir']

# class BaseCtrl
#     constructor: ->
#         console.log("All your base are belong to us!")

#     toJson: (item) ->
#         JSON.stringify(item)

# class TodoCtrl extends BaseCtrl
#     constructor: (@$scope) ->
#         super
#         console.log(@$scope)
#         @todos = [
#             {text: "learn angular", done: true}
#             {text: "build an angular app", done: false}]

#     addTodo: ->
#         @todos.push({ text: @todoText, done: false })
#         @todoText = ""

#     remaining: ->
#         count = 0
#         for todo in @todos when todo.done
#             count++
#         count

#     archive: ->
#         oldTodos = @todos
#         @todos = []
#         angular.forEach(oldTodos, (todo) =>
#             @todos.push(todo) unless todo.done
#         )

#     toJson: ->
#         super @todos

# TodoCtrl.$inject = ["$scope"]

# angular.module("todoApp", [])
#     .controller("TodoCtrl", TodoCtrl)
