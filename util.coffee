# http://stackoverflow.com/a/21742093
module.exports = (() ->

  debug = true
  
  return (window.show = () ->) if not debug

  methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeStamp', 'trace', 'warn']
    
  noop = () ->
    # stub undefined methods.
    for m in methods  when  !console[m]
      console[m] = noop


  if Function.prototype.bind?
    window.show = Function.prototype.bind.call(console.log, console)
  else
    window.show = () ->
      Function.prototype.apply.call(console.log, console, arguments)
)()
