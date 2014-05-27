LISTEN = require './listen.coffee'
MSG = require './msg.coffee'
# window.Observable = require './observe.coffee'
require 'Object-observe-polyfill'
Observable = require 'observed'

class Storage
  api: chrome.storage.local
  LISTEN: LISTEN.get() 
  MSG: MSG.get()
  data: 
    currentResources: []
    directories:[]
    maps:[]
    tabMaps:{}
    currentFileMatches:{}
  
  session:{}

  onDataLoaded: ->

  callback: () ->
  notifyOnChange: () ->
  constructor: (_onDataLoaded) ->
    @onDataLoaded = _onDataLoaded if _onDataLoaded?
    @api.get (results) =>
      @data[k] = results[k] for k of results

      watchAndNotify @,'dataChanged', @data, true

      @onDataLoaded @data

    @init()

  init: () ->
    watchAndNotify @,'sessionData', @session, false
    # @retrieveAll()

  
  isArray: -> 
    Array.isArray || ( value ) -> return {}.toString.call( value ) is '[object Array]'

  watchAndNotify = (_this, msgKey, obj, store) ->
      _this.observer = Observable obj
      _this.observer.on 'change', (change) ->
        # if change.name is 'length'          
        #   path = change.path.split('^^')
        #   saveArr = Array.prototype.slice.call(change.object[path[0]]) 
        #   change.object[path[0]].length = 0
        #   setTimeout () ->
        #     change.object[path[0]] = saveArr
        show change
        _this.api.set obj if store
        msg = {}
        msg[msgKey] = change
        _this.MSG.ExtPort msg

      isArray = Array.isArray || ( value ) -> return {}.toString.call( value ) is '[object Array]'

      _this.LISTEN.Ext msgKey, (change) ->
        show change
        obj ?= {}
        # show 'data changed '
        # show change
        # return if _this.isArray(change.object)

        ((data, api, observer) ->
          stack = change.path.split '^^'

          return data[stack[0]] = change.value if not data[stack[0]]?

          while stack.length > 0 
            _shift = stack.shift()
            
            if stack.length > 0 and isArray(data[_shift]) and change.name is stack[0]
              newArr = Array.prototype.slice.call(change.object)
              # Observable newArr
              data[_shift] = newArr
              return

            if /^\d+$/.test _shift 
              _shift = parseInt _shift
              # else if change.type is 'update' and change.name is 'length'

            data = data[_shift] unless stack.length is 0

          paused = observer.pause data
          data[_shift] = change.value

          setTimeout () ->
              observer.resume paused
          ,20  
        )(obj, _this.api, _this.observer)    

  save: (key, item, cb) ->

    obj = {}
    obj[key] = item
    @data[key] = item
    @api.set obj, (res) =>
      cb?()
      @callback?()
 
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
    @observer.stop()
    @api.get key, (results) ->
      @data[r] = results[r] for r of results
      if cb? then cb results[key]

  retrieveAll: (cb) ->
    # @observer.stop()
    @api.get (result) =>
      for c of result 
      #   delete @data[c]
        @data[c] = result[c] 
      # @data = result
        @MSG.ExtPort 'dataChanged':
          path:c
          value:result[c]
      @observer = Observable @data
      @observer.on 'change', (change) =>
        if change.name isnt 'length'
          show change
          @api.set @data
          @MSG.ExtPort 'dataChanged':change 

      @api.set @data
      # @callback? result
      cb? result
      @onDataLoaded @data

      # @MSG.ExtPort 'dataChanged':
      # @observer = Observable @data
      # @observer.on 'change', (change) =>
      #   show 'tell changing data'
      #   @MSG.ExtPort 'dataChanged':change

  onDataLoaded: (data) ->

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
