getGlobal = ->
  _getGlobal = ->
    this

  _getGlobal()

root = getGlobal()

# root.app = app = require '../../common.coffee'
# app = new lib.Application
chrome.browserAction.setPopup popup:"popup.html"



Application = require '../../common.coffee'
Redirect = require '../../redirect.coffee'
Storage = require '../../storage.coffee'
FileSystem = require '../../filesystem.coffee'
Server = require '../../server.coffee'

redir = new Redirect

app = root.app = new Application
  Redirect: redir
  Storage: Storage
  FS: FileSystem
  Server: Server
  
app.Storage.retrieveAll(null)
#   app.Storage.data[k] = data[k] for k of data
  
chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) =>
  # if redir.data[tabId]?.isOn
  #   app.mapAllResources () =>
  #     chrome.tabs.setBadgeText 
  #       text:Object.keys(app.currentFileMatches).length
  #       tabId:tabId
     


