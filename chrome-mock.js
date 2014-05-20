
var getGlobal = function() {
    var _getGlobal = function() { return this }
    return _getGlobal()
}
root = getGlobal()


root.chrome = {
    mock: {
        value: {},
        getBytesInUse: 0
    },
    runtime: {
        lastError: undefined,
        getBackgroundPage: function(callback) {
            callback({})
        }
    }
}

root.chrome.mock.updateBytesInUse = function() {
    var bytes = 0
    for (var idx in root.chrome.mock.value) {
        bytes += 1
    }
    root.chrome.mock.getBytesInUse = bytes
}

root.chrome.storage = {
    local: {
        get: function(key, callback) {
            if (key === null) {
                callback(root.chrome.mock.value)
            } else {
                callback(root.chrome.mock.value[key])
            }
        },
        getBytesInUse: function(obj, callback) {
            root.chrome.mock.updateBytesInUse()
            callback(root.chrome.mock.getBytesInUse)
        },
        set: function(obj, callback) {
            for (var idx in obj) root.chrome.mock.value[idx] = obj[idx]

            callback()
        },
        remove: function(key, callback) {
            delete root.chrome.mock.value.key
            callback()
        },
        clear: function(callback) {
            root.chrome.mock.value = {}
            callback()
        }
    },
    onChanged: {
        addListener: function() {}
    }
}
root.chrome.runtime = {
    onMessage: {
        addListener: function() {}
    },
    onMessageExternal: {
        addListener: function() {}
    }

}
root.chrome.storage.sync = root.chrome.storage.local
