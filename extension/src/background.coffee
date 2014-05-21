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

root.app = new Application
  Redirect: new Redirect
  Storage: Storage
  FS: FileSystem

root.app.Storage.retrieveAll()