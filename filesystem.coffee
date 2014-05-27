LISTEN = require './listen.coffee'
MSG = require './msg.coffee'

class FileSystem
  api: chrome.fileSystem
  retainedDirs: {}
  LISTEN: LISTEN.get() 
  MSG: MSG.get()
  platform:''
  constructor: () ->
    chrome.runtime.getPlatformInfo (info) =>
      @platform = info
  # @dirs: new DirectoryStore
  # fileToArrayBuffer: (blob, onload, onerror) ->
  #   reader = new FileReader()
  #   reader.onload = onload

  #   reader.onerror = onerror

  #   reader.readAsArrayBuffer blob

  readFile: (dirEntry, path, cb) ->
    # path = path.replace(/\//g,'\\') if platform is 'win'
    @getFileEntry dirEntry, path,
      (err, fileEntry) =>
        
        if err? then return cb? err

        fileEntry.file (file) =>
          cb? null, fileEntry, file
        ,(err) => cb? err

  getFileEntry: (dirEntry, path, cb) ->
    # path = path.replace(/\//g,'\\') if platform is 'win'
    dirEntry.getFile path, {}, (fileEntry) =>
      cb? null, fileEntry
    ,(err) => cb? err

  # openDirectory: (callback) ->
  openDirectory: (directoryEntry, cb) ->
  # @api.chooseEntry type:'openDirectory', (directoryEntry, files) =>
    @api.getDisplayPath directoryEntry, (pathName) =>
      dir =
          relPath: directoryEntry.fullPath #.replace('/' + directoryEntry.name, '')
          directoryEntryId: @api.retainEntry(directoryEntry)
          entry: directoryEntry
      cb? null, pathName, dir
          # @getOneDirList dir
          # Storage.save 'directories', @scope.directories (result) ->

  getLocalFileEntry: (dir, filePath, cb) => 
    # filePath = filePath.replace(/\//g,'\\') if platform is 'win'
    dirEntry = chrome.fileSystem.restoreEntry dir.directoryEntryId, () ->
    if not dirEntry?
      chrome.fileSystem.restoreEntry dir.directoryEntryId, (dirEntry) =>
        @getFileEntry dirEntry, filePath, cb
    else
      @getFileEntry dirEntry, filePath, cb



  # getLocalFile: (dir, filePath, cb, error) => 
  # # if @retainedDirs[dir.directoryEntryId]?
  # #   dirEntry = @retainedDirs[dir.directoryEntryId]
  # #   @readFile dirEntry, filePath,
  # #     (fileEntry, file) =>
  # #         cb?(fileEntry, file)
  # #     ,(_error) => error(_error)
  # # else
  #   chrome.fileSystem.restoreEntry dir.directoryEntryId, (dirEntry) =>
  #     # @retainedDirs[dir.directoryEntryId] = dirEntry
  #     @readFile dirEntry, filePath, (err, fileEntry, file) =>
  #       if err? then cb? err
  #       cb? null, fileEntry, file
  #   ,(_error) => cb?(_error)

      # @findFileForQueryString info.uri, success,
      #     (err) =>
      #         @findFileForPath info, cb

  # findFileForPath: (info, cb) =>
  #     @findFileForQueryString info.uri, cb, info.referer

  # findFileForQueryString: (_url, cb, error, referer) =>
  #     url = decodeURIComponent(_url).replace /.*?slredir\=/, ''

  #     match = item for item in @maps when url.match(new RegExp(item.url))? and item.url? and not match?

  #     if match?
  #         if referer?
  #             filePath = url.match(/.*\/\/.*?\/(.*)/)?[1]
  #         else
  #             filePath = url.replace new RegExp(match.url), match.regexRepl

  #         filePath.replace '/', '\\' if platform is 'win'

  #         dir = @Storage.data.directories[match.directory]

  #         if not dir? then return err 'no match'

  #         if @retainedDirs[dir.directoryEntryId]?
  #             dirEntry = @retainedDirs[dir.directoryEntryId]
  #             @readFile dirEntry, filePath,
  #                 (fileEntry, file) =>
  #                     cb?(fileEntry, file)
  #                 ,(error) => error()
  #         else
  #             chrome.fileSystem.restoreEntry dir.directoryEntryId, (dirEntry) =>
  #                 @retainedDirs[dir.directoryEntryId] = dirEntry
  #                 @readFile dirEntry, filePath,
  #                     (fileEntry, file) =>
  #                         cb?(fileEntry, file)
  #                     ,(error) => error()
  #                 ,(error) => error()
  #     else
  #         error()

module.exports = FileSystem