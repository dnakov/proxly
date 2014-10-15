class Redirect
  data:{}
  
  prefix:null
  currentMatches:{}
  currentTabId: null
  corsMap: {}
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
   
    _maps = []
    if @data[@currentTabId]?
      _maps.push map for map in @data[@currentTabId].maps when map.isOn
    
    return null unless _maps.length > 0

    resPath = url.match(filePathRegex)?[8]
    if not resPath?
      # try relpath
      resPath = url

    return null unless resPath?
    
    for map in _maps
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

  withPrefix: (prefix) ->
    @prefix = prefix
    this


  withCORS: (cors) ->
    @data[@currentTabId].cors = cors
    this

  # withDirectories: (directories) ->
  #   if directories?.length is 0
  #     @data[@currentTabId].directories = [] 
  #     @_stop @currentTabId
  #   else #if Object.keys(@data[@currentTabId]).length is 0
  #     @data[@currentTabId].directories = directories
  #     @start()
  #   this  

  withHeaders: (headers) ->
    if Object.getOwnPropertyNames(headers).length is 0
      @data[@currentTabId].headers = []
      @_stopHeaders @currentTabId
    else #if Object.keys(@data[@currentTabId]).length is 0
      @data[@currentTabId].headers = headers
    this



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
    @data[@currentTabId].onBeforeSendHeadersListener = @createOnBeforeSendHeadersListener()
    @data[@currentTabId].onHeadersReceivedListener = @createOnHeadersReceivedListener()
    # @data[@currentTabId].isOn = true
    @_start @currentTabId

  killAll: () ->
    @_stop tabId for tabId of @data

  _stopHeaders: (tabId) ->


  _stop: (tabId) ->
    chrome.webRequest.onBeforeRequest.removeListener @data[tabId].listener
    chrome.webRequest.onBeforeSendHeaders.removeListener @data[tabId].onBeforeSendHeadersListener
    chrome.webRequest.onHeadersReceived.removeListener @data[tabId].onHeadersReceivedListener
    chrome.webRequest.handlerBehaviorChanged()
    
  _start: (tabId) ->
    if @data[@currentTabId].maps?.length > 0
      chrome.webRequest.onBeforeRequest.addListener @data[tabId].listener,
        urls:['<all_urls>']
        tabId:tabId,
        ['blocking']

    chrome.webRequest.onBeforeSendHeaders.addListener @data[tabId].onBeforeSendHeadersListener,
      urls:['<all_urls>']
      tabId:tabId,
      ['blocking',"requestHeaders"]
    chrome.webRequest.onHeadersReceived.addListener @data[tabId].onHeadersReceivedListener,
      urls:['<all_urls>']
      tabId:tabId,
      ['blocking','responseHeaders']    

  getCurrentTab: (cb) ->
    # tried to keep only activeTab permission, but oh well..
    chrome.tabs.query
      active:true
      currentWindow:true
    ,(tabs) =>
      @currentTabId = tabs[0].id
      cb? @currentTabId

  toggle: () ->
    isOn = false
    if @data[@currentTabId]?.maps?
      for m in @data[@currentTabId]?.maps
        if m.isOn
          isOn = true
          break
        else
          isOn = false
      # @data[@currentTabId].isOn = !@data[@currentTabId].isOn
    if @data[@currentTabId]?.headers?
      for m in @data[@currentTabId]?.headers
        if m.isOn
          isOn = true
          break
        else
          isOn = false  

    isOn = true if @data[@currentTabId].cors?.isOn is true

    if isOn
      @start()
    else
      @_stop(@currentTabId)

    return isOn

  # shouldAllowCORS: (details) ->


  createOnBeforeSendHeadersListener: () ->
    (details) =>
      if details.url.indexOf(@prefix) is 0 or @data[@currentTabId].cors?.isOn is true
        flag = false
        rule =
          name: "Origin"
          value: new URL(details.url).origin
        for header in details.requestHeaders
          if header.name is rule.name
            flag = true
            @corsMap[details.url] = header.value
            header.value = rule.value
            break

        details.requestHeaders.push rule if not flag
        
      for header in @data[@currentTabId].headers when header.isOn and header.type is "Request"
        hdr =
          name:header.name
          value:header.value
        details.requestHeaders.push hdr

      return requestHeaders:details.requestHeaders

  createOnHeadersReceivedListener: () ->
    (details) =>
      if @corsMap[details.url]? or @data[@currentTabId].cors?.isOn is true
      # if details.url.indexOf(@prefix) is 0
        rule =
          name: "Access-Control-Allow-Origin"
          value: @corsMap[details.url] or "*"

        details.responseHeaders.push rule

        rule =
          name: "Access-Control-Allow-Credentials"
          value: "true"

        details.responseHeaders.push rule

      for header in @data[@currentTabId].headers when header.isOn and header.type is "Response"
        hdr =
          name:header.name
          value:header.value
        details.requestHeaders.push hdr

      return responseHeaders:details.responseHeaders

  createRedirectListener: () ->
    (details) =>
      path = @getLocalFilePathWithRedirect details.url
      if path? and path.indexOf @prefix is -1
        return redirectUrl:@prefix + path
      else
        return {} 

  toDict: (obj,key) ->
    obj.reduce ((dict, _obj) -> dict[ _obj[key] ] = _obj if _obj[key]?; return dict), {}

module.exports = Redirect
