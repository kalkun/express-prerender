var page = require('webpage').create(),
    fs = require('fs'),
    host = "://localhost",
    system = require("system"),
    args = system.args;

console.log("Shipfeed scraper is running ");
var statusCode = null;
page.onResourceReceived = function(resource) {
    statusCode = resource.status;
};

if (args.length === 4) {
    var path = String(args[1]);
    var fname = path.replace(/[\/]/g, "_") + ".html";
    var cache_path = String(args[2]);
    var protocol = String(args[3]);
} else {
    // required param exit with some error: 4000
    phantom.exit(4000);
}

// page.clearMemoryCache();

page.open(protocol + host + path, function() {
    if (statusCode < 300 && statusCode >= 200) {
        console.log("getting: ", protocol + host + path);
        console.log("saving to: ", cache_path + fname);
        fs.write(cache_path + fname, page.content, 'w');
        phantom.exit(0);
    } else {
        // Bad response from server, exit
        console.log("Bad status code: ", statusCode);
        phantom.exit(4242);
    }
});
