class Redirect
  data:
    tabId:
      listener:null
      isOn:false
  
  prefix:null
  currentMatches:{}
  currentTabId: null
  # http://stackoverflow.com/a/27755
  # url: RegExp['$&'],
  # protocol:RegExp.$2,
  # host:RegExp.$3,
  # path:RegExp.$4,
  # file:RegExp.$6, // 8
  # query:RegExp.$7,
  # hash:RegExp.$8
         
  constructor: ->
  
  getLocalFilePathWithRedirect: (url) =>
    filePathRegex = /^((http[s]?|ftp|chrome-extension|file):\/\/)?\/?([^\/\.]+\.)*?([^\/\.]+\.[^:\/\s\.]{2,3}(\.[^:\/\s\.]‌​{2,3})?)(:\d+)?($|\/)([^#?\s]+)?(.*?)?(#[\w\-]+)?$/
   
    return null unless @data[@currentTabId]?.maps?

    resPath = url.match(filePathRegex)?[8]
    if not resPath?
      # try relpath
      resPath = url

    return null unless resPath?
    
    for map in @data[@currentTabId].maps
      resPath = url.match(new RegExp(map.url))? and map.url?

      if resPath
        if referer?
          # TODO: this
        else
          filePath = url.replace new RegExp(map.url), map.regexRepl
        break
    return filePath

  tab: (tabId) ->
    @currentTabId = tabId
    @data[tabId] ?= isOn:false
    this

  withPrefix: (prefix) =>
    @prefix = prefix
    this

  # withDirectories: (directories) ->
  #   if directories?.length is 0
  #     @data[@currentTabId].directories = [] 
  #     @_stop @currentTabId
  #   else #if Object.keys(@data[@currentTabId]).length is 0
  #     @data[@currentTabId].directories = directories
  #     @start()
  #   this    

  withMaps: (maps) ->
    if Object.getOwnPropertyNames(maps).length is 0
      @data[@currentTabId].maps = []
      @_stop @currentTabId
    else #if Object.keys(@data[@currentTabId]).length is 0
      @data[@currentTabId].maps = maps
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
    if @data[@currentTabId]
      @data[@currentTabId].isOn = !@data[@currentTabId].isOn
      
      if @data[@currentTabId].isOn
        @start()
      else
        @_stop(@currentTabId)

  createRedirectListener: () ->
    (details) =>
      path = @getLocalFilePathWithRedirect details.url
      if path?
        return redirectUrl:@prefix + path
      else
        return {} 

  toDict: (obj,key) ->
    obj.reduce ((dict, _obj) -> dict[ _obj[key] ] = _obj if _obj[key]?; return dict), {}

module.exports = Redirect
