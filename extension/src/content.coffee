Application = require '../../common.coffee'

class ExtContent extends Application
    init:() ->
        @LISTEN.Local 'getResources', (res) =>
            @MSG.Local 'resources':@getResources('script[src],link[href]')

app = new ExtContent
