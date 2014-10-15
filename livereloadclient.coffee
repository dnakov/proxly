MSG = require './msg.coffee'
LISTEN = require './listen.coffee'


module.exports = class LiveReloadClient
  MSG:MSG.get()
  LISTEN:LISTEN.get()
  tabs:{}
  script: "document.write(\'<script src=\"#{chrome.runtime.getURL('livereload.js')}\"></script>\')"
  properScript: """
    var a = document.createElement("script");
    a.src="https://localhost:35729/livereload.js?snipver=1";
    a.type=type="text/javascript";
    document.body.appendChild(a);
    """
  constructor: () ->

  activate: (tabId, tab, cb) ->
    @tabs[tabId]?.proper = tab.proper

    if tab.proper is false
      obj = 
        file:'scripts/reloader.js'
        allFrames:true
    else
      obj = 
        code:@properScript
        allFrames:true

    chrome.tabs.executeScript tabId, obj, () =>
      @tabs[tabId].active = true
      cb?()

  deactivate: (tabId, cb) ->
    @tabs[tabId]?.active = false
    chrome.tabs.reload @tabId, bypassCache:true, () =>

  reload: (path, options) ->
    for key, value of @tabs when value.active is true
      do (key,value) =>
        @activate parseInt(key), value, (er, data) =>
          console.log('reloading ' + path)
          # chrome.tabs.executeScript tabId, code: "LiveReload_.reload(\'" + path + "\')", () ->
          chrome.tabs.sendMessage parseInt(key),
            action:"reload"
            path:path


