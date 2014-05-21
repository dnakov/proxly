class Redirect
  data:
    tabId:
      listener:null
      isOn:false
  
  prefix:null
  currentMatches:{}
  currentTabId: null
  getLocalFilePath: ->
  # http://stackoverflow.com/a/27755
  # url: RegExp['$&'],
  # protocol:RegExp.$2,
  # host:RegExp.$3,
  # path:RegExp.$4,
  # file:RegExp.$6, // 8
  # query:RegExp.$7,
  # hash:RegExp.$8
         
  constructor: ->

  tab: (tabId) ->
    @currentTabId = tabId
    @data[tabId] ?= {}
    this

  withPrefix: (prefix) =>
    @prefix = prefix
    this

  withDirectories: (directories) ->
    if directories?.length is 0
      @data[@currentTabId].directories = [] 
      @_stop @currentTabId
    else #if Object.keys(@data[@currentTabId]).length is 0
      @data[@currentTabId].directories = directories
      @start()
    this    

  withMaps: (maps) ->
    if Object.getOwnPropertyNames(maps).length is 0
      @data[@currentTabId].maps = {} 
      @_stop @currentTabId
    else #if Object.keys(@data[@currentTabId]).length is 0
      @data[@currentTabId].maps = maps
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
    (details) =>
      path = @getLocalFilePath details.url
      if path?
        return redirectUrl:@prefix + path
      else
        return {} 

  toDict: (obj,key) ->
    obj.reduce ((dict, _obj) -> dict[ _obj[key] ] = _obj if _obj[key]?; return dict), {}

module.exports = Redirect
