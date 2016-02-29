/*
 *  Entry point for express-prerender
 *  mainly for setting up configurations
 *
 *  The `configs` object has the form:
 *
 *  {
 *      cache_path  : path/to/cached_filed,
 *      dist_folder : path/to/distribution folder
 *  }
 *
 *  The `cached_path` is the folder where the cached files will be stored
 *  and served from.
 *
 *  `dist` is the path to the distribution folder of the website.
 *  The `dist` is used to see wether the cached files are still valid
 *  using the `dist` last modified stamp. `dist` can also be a path to a
 *  file if no folder is relevant.
 *
 * */
var fs = require('fs'),
    stringDecoder = require("string_decoder").StringDecoder,
    decoder = new stringDecoder('utf8');

/*
    Module returns a prerendered html page
    if the requests comes from a Robot
*/
module.exports = function(configs) {
    this.cache_path = configs.cache_path;
    this.dist_folder = configs.dist_folder;


    this.prerender = function(_request, _response, _next) {
        // removing any trailing slashes in order to homogenize the cached pages
        var path = _request.path.charAt(_request.path.length - 1) == "/" ? _request.path.slice(0, _request.path.length - 1) : _request.path;
        path = path != "" ? path : "/";
        // replace remaining dashes with underscores
        var _fname = path.replace(/[\/]/g, "_") + ".html";

        var getCache = function() {
            var cache = null,
                dist = fs.lstatSync(this.dist_folder);
            try {
                cache = fs.lstatSync(this.cache_path + _fname);
            } catch (e) {
                console.log("Page %s is not cached ", path);
            }
            if (cache && cache.isFile()) {
                var cacheAge = cache.mtime.getTime();
                var buildAge = dist.mtime.getTime();
                valid = cacheAge > buildAge;
                console.log(_fname, " is already cached and valid: ", valid);
                if (valid) {
                    var file = decoder.write(fs.readFileSync(this.cache_path + _fname));
                    _response.send(file);
                } else {
                    console.log("Cached page ", _fname, " no longer valid");
                    getPage();
                }
            } else {
                getPage();
            }
        }

        // scrapes the page from the running page
        var getPage = function() {
            var _this = this;
            var spawn = require("child_process").spawn;
            phantom = spawn("phantomjs", ["--ignore-ssl-errors=true", __dirname + "/scraper.js", path, cache_path]);
            phantom.stdout.on("data", function(data) {
                console.log("Output from PhantomJS:\n");
                console.log(decoder.write(data));
            });
            phantom.stderr.on("data", function(data) {
                console.log("PhantomJS ran into errors:\n");
                console.log(decoder.write(data));
            });
            phantom.on("close", function(code) {
                console.log("phantom closed with code ", code);
                if (code === 0) {
                    var file = decoder.write(fs.readFileSync(_this.cache_path + _fname));
                    _response.send(file);
                } else {
                    // didnt get the page, best better
                    // continue as nomral
                    _next();
                }
            });
        };

        var readUseragent = function() {
            if (_request.path.indexOf(".") >= 0 ||
                _request.path.indexOf("partner_images") >= 0 ||
                _request.path.indexOf("order_images") >= 0 ||
                _request.path.indexOf("API") >= 0) {
                _next();
            } else {
                var useragent = require("express-useragent"),
                    source = _request.headers['user-agent'],
                    ua = useragent.parse(source);
                if (ua.isBot && source.indexOf("PhantomJS") < 0) {
                    getCache();
                } else {
                    _next()
                }
            }
        }();
    }

    return this;
}