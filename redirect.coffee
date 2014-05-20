class Redirect
  data:
    tabId:
      listener:null
      maps:
        url:null
        regexRepl:null
      isOn:false
  
  prefix:null
  currentTabId: null

  constructor: ->

  tab: (tabId) ->
    @currentTabId = tabId
    @data[tabId] ?= {}
    this

  withPrefix: (prefix) =>
    @prefix = prefix
    this

  withMaps: (maps...) ->
    if maps.length is 0
      @data[@currentTabId].maps = {} 
      @_stop @currentTabId
    else #if Object.keys(@data[@currentTabId]).length is 0
      @data[@currentTabId].maps = @toDict maps, 'url'
      @start()
    this

  start: ->
    unless @data[@currentTabId].listener
      chrome.webRequest.onBeforeRequest.removeListener @data[@currentTabId].listener

    @data[@currentTabId].listener = @createRedirectListener()
    @data[@currentTabId].isOn = true
    @_start @currentTabId

  killAll: () ->
    @_stop tabId for tabId of @data

  _stop: (tabId) ->
    chrome.webRequest.onBeforeRequest.removeListener @data[tabId].listener

  _start: (tabId) ->
    chrome.webRequest.onBeforeRequest.addListener @data[tabId].listener,
      urls:['<all_urls>']
      tabId:@currentTabId,
      ['blocking']

  getCurrentTab: (cb) ->
    # tried to keep only activeTab permission, but oh well..
    chrome.tabs.query
      active:true
      currentWindow:true
    ,(tabs) =>
      @currentTabId = tabs[0].id
      cb? @currentTabId

  toggle: () ->
      @status[@currentTabId] = true unless @status[@currentTabId]?
      @status[@currentTabId] = !@status[@currentTabId]

      if @status[@currentTabId]
        @startServer()
        @start()
      else
        @stop()
        @stopServer()

  createRedirectListener: () ->
    (details) ->
      return @findLocalFilePathForURL details

  findLocalFilePathForURL: (details, referer) =>
    currentMap = @data[details.tabId]
    return {} unless currentMap?

    url = details.url

    for regex, regexRepl of currentMap
      do (regex, regexRepl) ->
        match = url.match(new RegExp(regex))? and regex?

        if match and isRedirect
          if referer?
            filePath = url.match(/.*\/\/.*?\/(.*)/)?[1]
          else
            filePath = url.replace new RegExp(regex), regexRepl

          return redirectUrl: @prefix + filePath

    return {}

  toDict: (obj,key) ->
    obj.reduce ((dict, _obj) -> dict[ _obj[key] ] = _obj if _obj[key]?; return dict), {}

module.exports = Redirect
