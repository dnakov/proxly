DnDFileController = (selector, onDropCallback) ->
  el_ = document.querySelector(selector)
  overCount = 0
  @dragenter = (e) ->
    e.stopPropagation()
    e.preventDefault()
    overCount++
    show 'dragenter'
    el_.classList.add "dropping"
    return

  @dragover = (e) ->
    e.stopPropagation()
    e.preventDefault()
    show 'dragover'
    return

  @dragleave = (e) ->
    e.stopPropagation()
    e.preventDefault()
    show 'dragleave'
    if --overCount <= 0
      el_.classList.remove "dropping"
      overCount = 0
    return

  @drop = (e) ->
    e.stopPropagation()
    e.preventDefault()
    show 'drop'
    show e
    el_.classList.remove "dropping"
    onDropCallback e.dataTransfer
    return

  el_.addEventListener "dragenter", @dragenter, false
  el_.addEventListener "dragover", @dragover, false
  el_.addEventListener "dragleave", @dragleave, false
  el_.addEventListener "drop", @drop, false
  return

module.exports = DnDFileController