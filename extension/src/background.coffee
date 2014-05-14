# getGlobal = ->
#   _getGlobal = ->
#     this

#   _getGlobal()

# root = getGlobal()

# root.app = app = require '../../common.coffee'
# app = new lib.Application

Application = require '../../common.coffee'

class ExtBackground extends Application
  urls: {}
  urlArr: []
  origins: {}
  isOn: {}
  files: {}
  extPort: {}
  currentTabId:null
  maps: []

  init: () ->
    chrome.tabs.onUpdated.addListener (tabId) =>
      # @currentTabId = tabId
      @updateIcon(tabId) if not @isOn[tabId]?

    @LISTEN.Local 'resources', (resources) =>

    @LISTEN.Ext 'redirInfo', (redirInfo) =>
      @maps = redirInfo.maps
      @server = redirInfo.server
      if redirInfo.matchingResources.length > 0
        @MSG.Ext 'startServer':true
        @initRedirects()
        # @Notify 'Redirecting', 'Redirecting enabled for this tab'
        @isOn[@currentTabId] = true
      else
        @launchUI (extInfo) =>
          undefined
        ,(error) =>
          @Notify 'Error', error.message
      @updateIcon @currentTabId

    chrome.browserAction.onClicked.addListener (tab) =>
      @currentTabId = tab.id
      if not @isOn[tab.id]? then @isOn[tab.id] = false

      if not @isOn[tab.id]
        chrome.tabs.sendMessage tab.id, 'getResources':true, (response) =>
          @launchApp (extInfo) =>
            @MSG.Ext 'resources':response.resources
            @isOn[tab.id] = true
      else
        @isOn[tab.id] = false
        @killRedirects()
        @MSG.Ext 'stopServer':true
      @updateIcon tab.id


  getServer: () ->

  killRedirects: () ->
    chrome.webRequest.onBeforeRequest.removeListener(@redirectListener)

  initRedirects: () ->
      chrome.webRequest.onBeforeRequest.addListener @redirectListener,
         urls:['<all_urls>']
         tabId:@currentTabId,
         ['blocking']

    # chrome.webRequest.onBeforeSendHeaders.addListener @headerListener,
    #     urls:['<all_urls>']
    #     tabId:@currentTabId,
    #     ['requestHeaders']

    # chrome.webRequest.onHeadersReceived.addListener ((details) => @redirectListener(details)),
    #     urls:['<all_urls>']
    #     tabId:@currentTabId,
    #     ['blocking','responseHeaders']

  match: (url) ->
    return map for map in @maps when url.match(map.url)? and map.url?
    return null

  headerListener: (details) ->
    show details

  redirectListener: (details) =>
    show details
    map = @match details.url
    if map?
      show 'redirected to ' + @server.url + encodeURIComponent(details.url)
      return redirectUrl: @server.url + encodeURIComponent(details.url) #details.url.replace(new RegExp(map.url), map.regexRepl)
    else
      return {}
# {
#                     urls: [key],
#                     tabId: tabId
#                 },
#                 ["blocking"]
     # chrome.webRequest.onBeforeSendHeaders.addListener(
     #         (function(_key, _type) {
     #             if(urls[_key]._listenerFunctions == undefined) urls[_key]._listenerFunctions = {};
     #             urls[_key]._listenerFunctions[_type] = (function(key) {
     #                 return function(details) {
     #                     return headerRequestListener(details, key);
     #                 };
     #             }(key));
     #             return urls[_key]._listenerFunctions[_type];
     #         }(key, 'onBeforeSendHeaders')),
     #         {
     #             urls: ["<all_urls>"],
     #             tabId: tabId
     #         },
     #         ["requestHeaders"]
     #     );

  updateIcon: (tabId) =>
    if @isOn[tabId]
      chrome.browserAction.setIcon(
        path:
          '19':'images/redir-on-19.png'
          '38':'images/redir-on-38.png'
        tabId:tabId
         )
    else
      chrome.browserAction.setIcon(
        path:
          '19':'images/redir-off-19.png'
          '38':'images/redir-off-38.png'
        tabId:tabId
      )

  sendResources = (resources) ->
    chrome.runtime.sendMessage(appId,resources:resources)

app = new ExtBackground
