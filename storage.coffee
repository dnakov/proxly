LISTEN = require './listen.coffee'
MSG = require './msg.coffee'
# window.Observable = require './observe.coffee'
window.Observable = require 'observed'

class Storage
  api: chrome.storage.local
  LISTEN: LISTEN.get() 
  MSG: MSG.get()
  data: 
    currentResources: []
  callback: () ->
  constructor: () ->
    @observer = Observable @data
    @observer.on 'change', (change) =>
      @MSG.ExtPort 'dataChanged':change

    @LISTEN.Ext 'dataChanged', (change) =>
      @data ?= {}
      _data = @data
      # show 'data changed '
      # show change
      # return if @isArray(change.object)

      @observer.stop()
      ((data) ->
        stack = change.path.split '.'

        return data[stack[0]] = change.value if not data[stack[0]]?

        while stack.length > 1 
          _shift = stack.shift()
          if /^\d+$/.test _shift then _shift = parseInt _shift
          data = data[_shift] 

        _shift = stack.shift()
        if /^\d+$/.test _shift then _shift = parseInt _shift
        data[_shift] = change.value
      )(@data)

      # change.path = change.path.replace(/\.(\d+)\./g, '[$1].') if @isArray change.object
      

      @saveAll()
      
      @observer = Observable @data
      @observer.on 'change', (change) =>
        @MSG.ExtPort 'dataChanged':change

    # @onChangedAll()

  isArray: -> 
    Array.isArray || ( value ) -> return {}.toString.call( value ) is '[object Array]'


  save: (key, item, cb) ->
    obj = {}
    obj[key] = item
    @data[key] = item
    @api.set obj, (res) =>
      cb?()
      @callback?()

  saveAllAndSync: (data) ->
    @saveAll data, () =>
      @MSG.Ext 'storageData':@data

  saveAll: (data, cb) ->
    if data? 
      @api.set data, () =>
        cb?()
        # @callback?()
    else
      @api.set @data, () =>
        cb?()
        # @callback?()
    # show 'saveAll @data: ' + @data.socketIds?[0]
    # show 'saveAll data: ' + data.socketIds?[0]

  retrieve: (key, cb) ->
    @api.get key, (results) ->
      @data[r] = results[r] for r of results
      if cb? then cb results[key]

  retrieveAll: (cb) ->
    @api.get (result) =>
      @data[c] = result[c] for c of result 
      # @callback? result
      cb? result
      show result

  onChanged: (key, cb) ->
    chrome.storage.onChanged.addListener (changes, namespace) ->
      if changes[key]? and cb? then cb changes[key].newValue
      @callback? changes

  onChangedAll: () ->
    chrome.storage.onChanged.addListener (changes,namespace) =>
      hasChanges = false
      for c of changes when changes[c].newValue != changes[c].oldValue and c isnt'socketIds'
        (c) => 
          @data[c] = changes[c].newValue 
          show 'data changed: '
          show c
          show @data[c]

          hasChanges = true

      @callback? changes if hasChanges
      show 'changed' if hasChanges

module.exports = Storage
