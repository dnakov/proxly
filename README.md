Proxly
======

An experiment evolved into a web dev tool

* Redirects web requests to local files
* Redirects web requests to wherever else you want
* Enables CORS
* Runs a web server
* Watches files for changes
* Livereloads your stuff
* All of this using just Chrome, no command line tools or anything else
* Exists on the chrome store

Install
-----
Get the [Proxly App][1] and [Proxly Extension][2] from the Chrome Store

Build
-----
```
npm install
npm run build
```

Then in  `chrome://extensions`, add unpackaged directories `app/src` and `extension/src` 

[1]: https://chrome.google.com/webstore/detail/proxly/denefdoofnkgjmpbfpknihpgdhahpblh
[2]: https://chrome.google.com/webstore/detail/proxly-extension/ijcjmpejonmimoofbcpaliejhikaeomh
