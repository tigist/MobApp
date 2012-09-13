function WebViewPG() {

}

WebViewPG.prototype.setUrl = function(url) {
    	PhoneGap.exec(null, null, "WebViewPG", "setUrl", [url]);
};

WebViewPG.prototype.sendAppToFront = function() {
    	PhoneGap.exec(null, null, "WebViewPG", "sendAppToFront", []);
};

WebViewPG.prototype.touch = function () {
    	PhoneGap.exec(null, null, "WebViewPG", "touch", []);
};

PhoneGap.addConstructor(function () {
    if (typeof(window.plugins.webView) == "undefined") {
    	console.log('registering webViewPG()');
    	PhoneGap.addPlugin('webView', new WebViewPG());
    	window.plugins.webView.touch();
    }
});
