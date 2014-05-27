(function() {
	chrome.runtime.getBackgroundPage(function(win) {
		win.app.openApp();
	});
})()