class FileSystem
  api: chrome.fileSystem
  retainedDirs: {}
  constructor: () ->

  # @dirs: new DirectoryStore
  # fileToArrayBuffer: (blob, onload, onerror) ->
  #   reader = new FileReader()
  #   reader.onload = onload

  #   reader.onerror = onerror

  #   reader.readAsArrayBuffer blob

  readFile: (dirEntry, path, success, error) ->
    @getFileEntry dirEntry, path,
      (fileEntry) =>
        fileEntry.file (file) =>
          success(fileEntry, file)
        ,(err) => error err
      ,(err) => error err

  getFileEntry: (dirEntry, path, success, error) ->
    if dirEntry?.getFile?
      dirEntry.getFile path, {}, (fileEntry) ->
        success fileEntry
      ,(err) => error err
    else error()

  # openDirectory: (callback) ->
  openDirectory: (directoryEntry, callback) ->
  # @api.chooseEntry type:'openDirectory', (directoryEntry, files) =>
    @api.getDisplayPath directoryEntry, (pathName) =>
      dir =
          relPath: directoryEntry.fullPath #.replace('/' + directoryEntry.name, '')
          directoryEntryId: @api.retainEntry(directoryEntry)
          entry: directoryEntry

        callback pathName, dir
          # @getOneDirList dir
          # Storage.save 'directories', @scope.directories (result) ->

  getLocalFile: (dir, filePath, cb, error) => 
  # if @retainedDirs[dir.directoryEntryId]?
  #   dirEntry = @retainedDirs[dir.directoryEntryId]
  #   @readFile dirEntry, filePath,
  #     (fileEntry, file) =>
  #         cb?(fileEntry, file)
  #     ,(_error) => error(_error)
  # else
    chrome.fileSystem.restoreEntry dir.directoryEntryId, (dirEntry) =>
      # @retainedDirs[dir.directoryEntryId] = dirEntry
      @readFile dirEntry, filePath,
          (fileEntry, file) =>
              cb?(fileEntry, file)
          ,(_error) => error(_error)
      ,(_error) => error(_error)

      # @findFileForQueryString info.uri, success,
      #     (err) =>
      #         @findFileForPath info, success, error

  findFileForPath: (info, success, error) =>
      @findFileForQueryString info.uri, success, error, info.referer

  findFileForQueryString: (_url, cb, error, referer) =>
      url = decodeURIComponent(_url).replace /.*?slredir\=/, ''

      match = item for item in @maps when url.match(new RegExp(item.url))? and item.url? and not match?

      if match?
          if referer?
              filePath = url.match(/.*\/\/.*?\/(.*)/)?[1]
          else
              filePath = url.replace new RegExp(match.url), match.regexRepl

          filePath.replace '/', '\\' if platform is 'win'

          dir = @Storage.data.directories[match.directory]

          if not dir? then return err 'no match'

          if @retainedDirs[dir.directoryEntryId]?
              dirEntry = @retainedDirs[dir.directoryEntryId]
              @readFile dirEntry, filePath,
                  (fileEntry, file) =>
                      cb?(fileEntry, file)
                  ,(error) => error()
          else
              chrome.fileSystem.restoreEntry dir.directoryEntryId, (dirEntry) =>
                  @retainedDirs[dir.directoryEntryId] = dirEntry
                  @readFile dirEntry, filePath,
                      (fileEntry, file) =>
                          cb?(fileEntry, file)
                      ,(error) => error()
                  ,(error) => error()
      else
          error()

module.exports = FileSystem