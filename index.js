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
    cache_page = "prerender/rendered/",
    stringDecoder = require("string_decoder").StringDecoder,
    decoder = new stringDecoder('utf8'),
    cache_path = "",
    dist_folder = "";

/*
    Module returns a prerendered html page
    if the requests comes from a Robot
*/
var _prerender = function(_request, _response, _next) {
    // remove any trailing slashes
    var _fname = _request.charAt(_request.path.length - 1) == "/" ? _request.path.slice(0, _request.path.length - 1) : _request.path;
    // replace remaining dashes with underscores
    var _fname = _fname.replace(/[\/]/g, "_") + ".html";

    var getCache = function() {
        var path = _request.path,
            cache = null,
            dist = fs.lstatSync(dist_folder);
        try {
            cache = fs.lstatSync(cache_page + _fname);
        } catch (e) {
            console.log("Page %s is not cached ", path);
        }
        if (cache && cache.isFile()) {
            var cacheAge = cache.mtime.getTime();
            var buildAge = dist.mtime.getTime();
            valid = cacheAge > buildAge;
            console.log(_fname, " is already cached and valid: ", valid);
            if (valid) {
                var file = decoder.write(fs.readFileSync(cache_page + _fname));
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
        var spawn = require("child_process").spawn,
            path = _request.path;
        phantom = spawn("phantomjs", ["--ignore-ssl-errors=true", "prerender/scraper.js", path, cache_path]);
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
                var file = decoder.write(fs.readFileSync(cache_page + _fname));
                _response.send(file);
            } else {
                // didnt get the page, best better
                // continue as nomral
                _next();
            }
        });
    };

    var readUseragent = function() {
        if (_request.path.indexOf(".") >= 0) {
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

module.exports  = function(configs) {
    cache_path  = configs.cache_path;
    dist_folder = configs.dist_folder; 
    
    var prerender = _prerender;
    return this;
}



