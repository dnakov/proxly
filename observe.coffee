class Observable

  observers = undefined
  subject = undefined

  @create: (subject) ->
    (new @ subject).subject

  constructor: (subject, parent, prefix) ->
    throw new TypeError("object expected. got: " + typeof subject)  unless "object" is typeof subject
    return new Observable(subject, parent, prefix)  unless this instanceof Observable
    
    # debug('new', subject, !!parent, prefix);
    
    # Emitter.call(this);
    @_bind subject, parent, prefix
    return

  _bind: (subject, parent, prefix) ->
    throw new Error("already bound!")  if @subject
    throw new TypeError("subject cannot be null")  if null is subject
    @subject = subject
    if parent
      parent.observers.push this
    else
      @observers = [this]
    @_onchange = _onchange(parent or this, prefix)
    Object.observe @subject, @_onchange
    @_walk parent or this, prefix
    return

  deliverChanges = ->
    @observers.forEach (o) ->
      Object.deliverChangeRecords o._onchange
      return


  _walk: (parent, prefix) ->
    object = @subject
    Object.keys(object).forEach (name) ->
      value = object[name]
      return  unless "object" is typeof value
      return  if null is value
      path = (if prefix then prefix + "." + name else name)
      new Observable(value, parent, path)
      return


  stop: ->
    @observers.forEach (observer) ->
      Object.unobserve observer.subject, observer._onchange
      return


  _remove: (subject) ->
    @observers = @observers.filter((observer) ->
      if subject is observer.subject
        Object.unobserve observer.subject, observer._onchange
        return false
      true
    )

  onchange: (change) ->


  _onchange = (parent, prefix) ->
    (ary) ->
      ary.forEach (change) ->
        object = change.object
        type = change.type
        name = change.name
        value = object[name]
        path = (if prefix then prefix + "^^" + name else name)
        if "add" is type and null isnt value and "object" is typeof value
          new Observable(value, parent, path)
        else parent._remove change.oldValue  if "delete" is type and "object" is typeof change.oldValue
        change = new @Change(path, change)
        parent.onchange type, change
        parent.onchange type + ' ' + path, change
        parent.onchange 'change', change
        return

  Change = (path, change) ->
    @path = path
    @name = change.name
    @type = change.type
    @object = change.object
    @value = change.object[change.name]
    @oldValue = change.oldValue
    return @

module.exports = exports = Observable