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
      @LISTEN.Ext fname, (args) ->
        if args?.isProxy?
          if typeof arguments[1] is "function"
            if args.arguments?.length >= 0
              return f.apply _klas, args.arguments.concat arguments[1] 
            else
              return f.apply _klas, [].concat arguments[1]
        
        return f.apply _klas, arguments

  wrapObjInbound: (obj) ->
    (obj[key] = @wrapInbound obj, obj.constructor.name + '.' + key, obj[key]) for key of obj when typeof obj[key] is "function"
    obj

  wrapOutbound: (obj, fname, f) ->
    ->
      msg = {}
      msg[fname] = 
        isProxy:true
        arguments:Array.prototype.slice.call arguments
      msg[fname].isProxy = true
      _args = Array.prototype.slice.call arguments

      if _args.length is 0
        msg[fname].arguments = undefined 
        return @MSG.Ext msg, () -> undefined

      msg[fname].arguments = _args

      callback = msg[fname].arguments.pop()
      if typeof callback isnt "function"
        msg[fname].arguments.push callback
        @MSG.Ext msg, () -> undefined
      else
        @MSG.Ext msg, () =>
          argz = Array.prototype.slice.call arguments
          # proxyArgs = [isProxy:argz]
          if argz?.length > 0 and argz[0]?.isProxy?
            callback.apply @, argz[0].isProxy 

  wrapObjOutbound: (obj) ->
    (obj[key] = @wrapOutbound obj, obj.constructor.name + '.' + key, obj[key]) for key of obj when typeof obj[key] is "function"
    obj

module.exports = Config