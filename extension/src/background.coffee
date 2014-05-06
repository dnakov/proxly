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

    init: () ->
        chrome.tabs.onUpdated.addListener (tabId) =>
            @updateIcon(tabId) if @isOn[tabId]?

        @LISTEN.Local 'resources', (resources) =>
            debugger;
            @launchApp()
            @MSG.Ext 'resources':resources

        chrome.browserAction.onClicked.addListener (tab) =>
            if @isOn[tab.id]
                @isOn[tab.id] = true
                chrome.tabs.sendMessage tab.id, 'getResources':true
            else
                @isOn[tab.id] = if @isOn[tab.id]? then true else !@isOn[tab.id]

            @updateIcon tab.id

    updateIcon: (tabId) =>
        if @isOn[tabId]
            chrome.browserAction.setIcon(
                path:
                    '19':'images/redir-on-19.png'
                    '38':'images/redir-on-38.png',
                tabId:tabId
            )
        else
            chrome.browserAction.setIcon(
                path:
                    '19':'images/redir-off-19.png'
                    '38':'images/redir-off-38.png',
                tabId:tabId
            )

sendResources = (resources) ->
            chrome.runtime.sendMessage(appId,resources:resources)

app = new ExtBackground
    # chrome.tabs.reload tab.id


# var addListeners2 = function() {
#     var rule1 = {
#         priority: 100,
#         conditions: [
#           new chrome.declarativeWebRequest.RequestMatcher({
#               url: { pathContains: 'resource' },
#                 stages: ["onBeforeRequest", "onBeforeSendHeaders", "onHeadersReceived", "onAuthRequired"]
#             })
#         ],
#         actions: [
#           new chrome.declarativeWebRequest.RedirectRequest({
#             redirectUrl:'chrome-extension://pmgnnbdfmmpdkgaamkdiipfgjbpgiofc/redirector'
#           }),
#           new chrome.declarativeWebRequest.SendMessageToExtension({message: ""})
#         ]
#       };
# var rule2 = {
#         priority: 1,
#         conditions: [
#           new chrome.declarativeWebRequest.RequestMatcher({
#               url: { pathContains: 'redirector' }
#             })
#         ],
#         actions: [
#           new chrome.declarativeWebRequest.RedirectRequest({
#             redirectUrl:'file:///Users/daniel/Dropbox/dev/MavensMate/3demo/src/package.xml'
#           }),
#           new chrome.declarativeWebRequest.SendMessageToExtension({message: ""})
#         ]
#       };
#       // var rule2 = {
#       //   priority: 1000,
#       //   conditions: [
#       //     new chrome.declarativeWebRequest.RequestMatcher({
#       //       url: { hostSuffix: '.myserver.com' } })
#       //   ],
#       //   actions: [
#       //     new chrome.declarativeWebRequest.IgnoreRules({
#       //       lowerPriorityThan: 1000 })
#       //   ]
#       // };
#       chrome.declarativeWebRequest.onRequest.addRules([rule1, rule2]);

# }

# chrome.browserAction.onClicked.addListener(function(tab) {
#     isOn[tab.id] = isOn[tab.id] == undefined ? true : !isOn[tab.id];
#     updateIcon(tab.id);
#     chrome.tabs.reload(tab.id);
# });

# var updateIcon = function(tabId) {
#     if (isOn[tabId] == true) {
#         chrome.browserAction.setIcon({path:{'19':'images/redir-on-19.png', '38':'images/redir-on-38.png'}, tabId:tabId});
#         // convertFileResourcesToData();
#         // addListeners(tabId);
#         chrome.runtime.sendMessage(appId,{openDirectory:true});
#     }
#     else
#     {
#         chrome.browserAction.setIcon({path:{'19':'images/redir-off-19.png', '38':'images/redir-off-38.png'}, tabId:tabId});
#         removeListeners(tabId);
#     }
# }

# chrome.tabs.onUpdated.addListener(function(tabId) {
#     if(isOn[tabId] != undefined) {
#         updateIcon(tabId);
#     }
# });

# chrome.runtime.onInstalled.addListener(function (details) {
#     chrome.storage.sync.set(    {
#         urls: {
#                 "https://*.salesforce.com/resource/*": {
#                     regex: 'https.*\/resource(\/[0-9]+)?\/([A-Za-z0-9\-._]+\/)?',
#                     regreplace: 'http://localhost:9000/'
#                 },
#                 "https://*.force.com/resource/*": {
#                     regex: 'https.*\/resource(\/[0-9]+)?\/([A-Za-z0-9\-._]+\/)?',
#                     regreplace: 'http://localhost:9000/'
#                 }

#         }
#     });
# });

# chrome.storage.onChanged.addListener(function(changes, namespace) {

#     if(namespace != 'sync') return;

#     for (key in changes) {
#           var storageChange = changes[key];
#           if(key == 'urls') {
#             urls = storageChange.newValue;
#             urlArr.length = 0;
#             for(var key in urls) {
#                 urlArr.push(key);
#             }
#           }
#         }
# });

# chrome.storage.sync.get(function(opt) {
#     urls = opt.urls;
#     urlArr.length = 0;
#     for(var key in urls) {
#         urlArr.push(key);
#     }
# })

# chrome.runtime.onConnect.addListener(function(port) {

# });






# var convertFileResourcesToData = function() {
#     chrome.tabs.sendMessage({}, function() {

#     });
# }


# var headerRequestListener = function(details, key){

#     var flag = false,
#         rule = {
#             name: "Origin",
#             value: "http://evil.com/"
#         };

#     for (var i = 0; i < details.requestHeaders.length; ++i) {
#         if (details.requestHeaders[i].name === rule.name) {
#             flag = true;
#             origins[details.requestId] = details.requestHeaders[i].value;
#             details.requestHeaders[i].value = rule.value;
#             break;
#         }
#     }
#     if(!flag) details.requestHeaders.push(rule);
#     return {requestHeaders: details.requestHeaders};
# };
# var headerResponseListener = function(details, key){

#     if(origins[details.requestId] != undefined) {
#         var rule = {
#                 "name": "Access-Control-Allow-Origin",
#                 "value": origins[details.requestId]
#             };

#         details.responseHeaders.push(rule);
#         details.responseHeaders.push({
#             "name":"Access-Control-Allow-Credentials",
#             "value":"true"
#         });
#         delete origins[details.requestId];
#     }

#     return {responseHeaders: details.responseHeaders};
# };

# var beforeRequestListener = function(details, key) {

#     var re = new RegExp(urls[key].regex);
#     var repl = urls[key].regreplace;

#     if(details.url.match(re) == null) return {};

#     return {
#         redirectUrl: details.url.replace(re, repl)
#     };
# }

# function createListener(key, listenerFunction, listenerKey) {
#     urls[key]._listenerFunctions[listenerKey] = function(details) { return listenerFunction() };
#     return urls[key]._listenerFunction[listenerKey];
# }

# var addListeners1 = function(tabId) {
#     removeListeners();
#     for(var key in urls) {

#         if(urls[key].cors != undefined && urls[key].cors == true) {
#             chrome.webRequest.onBeforeSendHeaders.addListener(
#                 (function(_key, _type) {
#                     if(urls[_key]._listenerFunctions == undefined) urls[_key]._listenerFunctions = {};
#                     urls[_key]._listenerFunctions[_type] = (function(key) {
#                         return function(details) {
#                             return headerRequestListener(details, key);
#                         };
#                     }(key));
#                     return urls[_key]._listenerFunctions[_type];
#                 }(key, 'onBeforeSendHeaders')),
#                 {
#                     urls: ["<all_urls>"],
#                     tabId: tabId
#                 },
#                 ["requestHeaders"]
#             );

#             chrome.webRequest.onHeadersReceived.addListener(
#                 (function(_key, _type) {
#                     if(urls[_key]._listenerFunctions == undefined) urls[_key]._listenerFunctions = {};
#                     urls[_key]._listenerFunctions[_type] = (function(key) {
#                         return function(details) {
#                             return headerResponseListener(details, key);
#                         };
#                     }(key));
#                     return urls[_key]._listenerFunctions[_type];
#                 }(key, 'onHeadersReceived')),
#                 {
#                     urls: ["<all_urls>"],
#                     tabId: tabId
#                 },
#                 ["blocking", "responseHeaders"]
#             );
#         }

#         if(urls[key].regex != undefined && urls[key].regex.length > 0) {
#             chrome.webRequest.onBeforeRequest.addListener(
#                 (function(_key, _type) {
#                     if(urls[_key]._listenerFunctions == undefined) urls[_key]._listenerFunctions = {};
#                     urls[_key]._listenerFunctions[_type] = (function(key) {
#                         return function(details) {
#                             return beforeRequestListener(details, key);
#                         };
#                     }(key));
#                     return urls[_key]._listenerFunctions[_type];
#                 }(key, 'onBeforeRequest')),
#                 {
#                     urls: [key],
#                     tabId: tabId
#                 },
#                 ["blocking"]
#             );
#         }

#     }
# }

# var removeListeners = function(tabId) {
#     for(var key in urls) {
#         for(var lkey in urls[key]._listenerFunctions) {
#             chrome.webRequest.onBeforeRequest.removeListener(urls[key]._listenerFunctions[lkey]);
#             chrome.webRequest.onHeadersReceived.removeListener(urls[key]._listenerFunctions[lkey]);
#             chrome.webRequest.onBeforeSendHeaders.removeListener(urls[key]._listenerFunctions[lkey]);
#         }
#     }
# }


# // var xhr = new XMLHttpRequest();
# // xhr.open('GET', 'file:///Users/daniel/Dropbox/dev/MavensMate/3demo/src/package.xml', true);
# // xhr.responseType = 'arraybuffer';

# // xhr.onload = function(e) {
# //   btoa(String.fromCharCode.apply(null, new Uint8Array(this.response));
# // };

# // xhr.send();



