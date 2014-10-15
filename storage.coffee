LISTEN = require './listen.coffee'
MSG = require './msg.coffee'

WatchJS = require 'watchjs'
watch = WatchJS.watch
unwatch = WatchJS.unwatch
callWatchers = WatchJS.callWatchers

class Storage
  api: chrome.storage.local
  LISTEN: LISTEN.get() 
  MSG: MSG.get()
  data: 
    currentResources: []
    directories:[]
    maps:[]
    cors:{}
    headers:[]
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

      watchAndNotify @,'sessionData', @session, false

      @onDataLoaded @data

    @init()

  init: () ->
    
  watchAndNotify = (_this, msgKey, obj, store) ->

      _listener = (prop, action, newVal, oldVal) ->
        if (action is "set" or "differentattr") and _this.noWatch is false
          if not /^\d+$/.test(prop)
            show arguments
            _this.api.set obj if store
            msg = {}
            msg[msgKey] = obj
            # unwatch obj, _listener,3,true
            _this.MSG.ExtPort msg
        
      _this.noWatch = false
      watch obj, _listener,3,true

      _this.LISTEN.Ext msgKey, (data) ->
        _this.noWatch = true
        # unwatch obj, _listener,3,true
        
        obj[k] = data[k] for k of data
        setTimeout () -> 
          _this.noWatch = false
        ,200

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
 
    else
      @api.set @data, () =>
        cb?()
 

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
 

      @api.set @data
      # @callback? result
      cb? result
      @onDataLoaded @data

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
