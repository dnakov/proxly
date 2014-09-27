# Application = require '../../common.coffee'

# class ExtContent extends Application
#     init:() ->
#         @LISTEN.Local 'getResources', (res, respond) =>
#             show 'getting resources'
#             respond 'resources':@getResources('script[src],link[href]')

#     getResources: (selector) ->
#       [].map.call document.querySelectorAll(selector), (e) ->
#         url = if e.href? then e.href else e.src
#         url: url
#         path: if e.attributes['src']?.value? then e.attributes['src'].value else e.attributes['href']?.value
#         href: e.href
#         src: e.src
#         type: e.type
#         tagName: e.tagName
#         extension: url.match(/\.([^\.]*$)/)?[1]
#       .filter (e) ->
#           if e.url.match('^(https?)|(chrome-extension)|(file):\/\/.*')? then true else false


# app = new ExtContent
resources = [].map.call document.querySelectorAll('script[src],link[href]'), (e) ->
        url = if e.href? then e.href else e.src
        url = '' unless url?
        url: url
        path: if e.attributes['src']?.value? then e.attributes['src'].value else e.attributes['href']?.value
        href: e.href
        src: e.src
        type: e.type
        tagName: e.tagName
        extension: url.match(/\.([^\.]*$)/)?[1]
      .filter (e) ->
          if e.url?.match('^https?|http?|chrome-extension|file:\/\/.*')? then true else false
# console.log resources
return resources

