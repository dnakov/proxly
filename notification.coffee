class Notification
  constructor: ->

  show: (title, message) ->
    uniqueId = (length=8) ->
      id = ""
      id += Math.random().toString(36).substr(2) while id.length < length
      id.substr 0, length

    chrome.notifications.create uniqueId(),
      type:'basic'
      title:title
      message: message
      iconUrl:'images/icon-38.png',
      (callback) ->
        undefined

module.exports = Notification