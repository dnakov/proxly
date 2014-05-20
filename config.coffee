class Config
  # APP_ID: 'cecifafpheghofpfdkhekkibcibhgfec'
  # EXTENSION_ID: 'dddimbnjibjcafboknbghehbfajgggep'
  APP_ID: 'denefdoofnkgjmpbfpknihpgdhahpblh'
  EXTENSION_ID: 'ijcjmpejonmimoofbcpaliejhikaeomh'  
  SELF_ID: chrome.runtime.id
  isContentScript: location.protocol isnt 'chrome-extension:'
  EXT_ID: null
  EXT_TYPE: null
  
  constructor: () ->
    @EXT_ID = if @APP_ID is @SELF_ID then @EXTENSION_ID else @APP_ID
    @EXT_TYPE = if @APP_ID is @SELF_ID then 'EXTENSION' else 'APP'
    @SELF_TYPE = if @APP_ID isnt @SELF_ID then 'EXTENSION' else 'APP'

  wrapInbound: (obj, fname, f) ->
      _klas = obj
      @LISTEN.Ext fname, (callback) ->
        _callback = callback
        _arguments = Array.prototype.slice.call(arguments)
        args = []
        if _arguments.length is 0
          args.push null
        else
          args = _arguments

        f.apply _klas, args

  wrapObjInbound: (obj) ->
    (obj[key] = @wrapInbound obj, obj.constructor.name + '.' + key, obj[key]) for key of obj when typeof obj[key] is "function"
    obj

  wrapOutbound: (obj, fname, f) ->
    ->
      msg = {}
      _args = Array.prototype.slice.call arguments

      if _args.length is 0
        msg[fname] = null 
        return @MSG.Ext msg

      msg[fname] = _args

      callback = msg[fname].pop()
      if typeof callback isnt "function"
        msg[fname].push callback
        @MSG.Ext msg
      else
        @MSG.Ext msg, callback 

  wrapObjOutbound: (obj) ->
    (obj[key] = @wrapOutbound obj, obj.constructor.name + '.' + key, obj[key]) for key of obj when typeof obj[key] is "function"
    obj

module.exports = Config