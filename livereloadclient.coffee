MSG = require './msg.coffee'
LISTEN = require './listen.coffee'


module.exports = class LiveReloadClient
  MSG:MSG.get()
  LISTEN:LISTEN.get()
  tabs:{}
  script: "document.write(\'<script src=\"#{chrome.runtime.getURL('livereload.js')}\"></script>\')"

  constructor: () ->

  activate: (tabId, cb) ->
    console.log(@script)
    chrome.tabs.executeScript tabId, 
      file:'scripts/reloader.js'
      allFrames:true
    , () =>
      @tabs[tabId].active = true
      cb?()

  deactivate: (tabId, cb) ->
    @tabs[tabId] = false
    chrome.tabs.reload @tabId, bypassCache:true, () =>

  reload: (path, options) ->
    for key, value of @tabs when value.active is true
      do (key,value) =>
        @activate parseInt(key), (er, data) =>
          console.log('reloading ' + path)
          # chrome.tabs.executeScript tabId, code: "LiveReload_.reload(\'" + path + "\')", () ->
          chrome.tabs.sendMessage parseInt(key),
            action:"reload"
            path:path


