# server = require './tcp-server.js'

getGlobal = ->
  _getGlobal = ->
    this

  _getGlobal()

root = getGlobal()

Application = require '../../common.coffee'
chrome.app.runtime.onLaunched.addListener ->
  chrome.app.window.create 'index.html',
        id: "mainwin"
        bounds:
          width:770
          height:800

#app = new lib.Application
# class AppBackground extends Application
#     retainedDirs:{}
#     init: () ->
#         # chrome.browserAction.onClicked.addListener
#         @Storage.retrieveAll () =>

#           @data = @Storage.data

#           if @Storage.data.server? then @Storage.data.server = {}
            
#           @maps = @data.maps

#         @Server.getLocalFile = @getLocalFile

#         # @LISTEN.Ext 'resources', (result) =>
#         #     @Storage.save 'currentResources', result, (saved) =>
#         #       # @MSG.Ext 'redirInfo':
#         #       #     matchingResources:@getMatchingResources()
#         #       #     maps:@maps
#         #       #     server:
#         #       #         url:'http://' + @Server.host + ':' + @Server.port + '?slredir='
#         @LISTEN.Local 'restartServer', () => @restartServer()

#         @LISTEN.Local 'startServer', () => @startServer()
#         @LISTEN.Ext 'startServer', () => 
#           @startServer () =>
#             @Storage.saveAllAndSync()
#         @LISTEN.Local 'stopServer', () => @stopServer()
#         @LISTEN.Ext 'stopServer', () => 
#           @stopServer () =>
#             @Storage.saveAllAndSync()
#         # @startServer()
#         # try
#         #     chrome.app.runtime.onRestarted.addListener @cleanUp
#         # catch error
#         #     show error


#     cleanUp: () ->
#         @stopServer()

#     getMatchingResources: () ->
#       matchingResources = []
#       for res in @data.currentResources
#         do (res) =>
#           for item in @maps when res.url.match(new RegExp(item.url))? and item.url?
#             do (item) =>
#               matchingResources.push res
#       return matchingResources


#     getLocalFile: (info, cb, error) =>
#       url = info.uri
#       url = url.substring 1
#       filePath = url

#       dir = @Storage.data.directories[@Storage.data.currentMap.directory]

#       if not dir? then return error 'no match'

#       if @retainedDirs[dir.directoryEntryId]?
#         dirEntry = @retainedDirs[dir.directoryEntryId]
#         @FS.readFile dirEntry, filePath,
#           (fileEntry, file) =>
#               cb?(fileEntry, file)
#           ,(_error) => error(_error)
#       else
#         chrome.fileSystem.restoreEntry dir.directoryEntryId, (dirEntry) =>
#           @retainedDirs[dir.directoryEntryId] = dirEntry
#           @FS.readFile dirEntry, filePath,
#               (fileEntry, file) =>
#                   cb?(fileEntry, file)
#               ,(_error) => error(_error)
#           ,(_error) => error(_error)

#         # @findFileForQueryString info.uri, success,
#         #     (err) =>
#         #         @findFileForPath info, success, error

#     findFileForPath: (info, success, error) =>
#         @findFileForQueryString info.uri, success, error, info.referer

#     findFileForQueryString: (_url, cb, error, referer) =>
#         url = decodeURIComponent(_url).replace /.*?slredir\=/, ''

#         match = item for item in @maps when url.match(new RegExp(item.url))? and item.url? and not match?

#         if match?
#             if referer?
#                 filePath = url.match(/.*\/\/.*?\/(.*)/)?[1]
#             else
#                 filePath = url.replace new RegExp(match.url), match.regexRepl

#             filePath.replace '/', '\\' if platform is 'win'

#             dir = @Storage.data.directories[match.directory]

#             if not dir? then return err 'no match'

#             if @retainedDirs[dir.directoryEntryId]?
#                 dirEntry = @retainedDirs[dir.directoryEntryId]
#                 @FS.readFile dirEntry, filePath,
#                     (fileEntry, file) =>
#                         cb?(fileEntry, file)
#                     ,(error) => error()
#             else
#                 chrome.fileSystem.restoreEntry dir.directoryEntryId, (dirEntry) =>
#                     @retainedDirs[dir.directoryEntryId] = dirEntry
#                     @FS.readFile dirEntry, filePath,
#                         (fileEntry, file) =>
#                             cb?(fileEntry, file)
#                         ,(error) => error()
#                     ,(error) => error()
#         else
#             error()


# Config = require '../../config.coffee'
# MSG = require '../../msg.coffee'
# LISTEN = require '../../listen.coffee'
# Storage = require '../../storage.coffee'
# FileSystem = require '../../filesystem.coffee'
Config = require '../../config.coffee'
Storage = require '../../storage.coffee'
FileSystem = require '../../filesystem.coffee'
Server = require '../../server.coffee'

root.app = new Application 
  Storage: new Storage
  FS: new FileSystem
  Server: new Server

root.app.Server.getLocalFile = app.getLocalFile
root.app.Storage.retrieveAll()
