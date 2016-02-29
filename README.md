##express-prerender
A package for prerendering pages for crawlers. This is useful when meta tags are dependent on a JavaScript framework to be loaded first 
e.g. Ember.

**PhantomJS dependant**

express-prerender requires PhantomJS to be installed on the system. 


**Install**

```
    npm install express-prerender
```

**Usage**

In your express application above other routes, just require the plugin with your configuration like such:
```
var prerender = require("express-prerender")({
    cache_path      : path/where/cached/files/are/saved,
    dist_folder     : website/distribution/folder, 
    protocol        : "http" | "https"
});
app.use(prerender.prerender);
```

Both `cache_path` and `dist_folder` are relative to the file where *express-prerender* is required or absolute.

The reason to give the path of the distribution folder in `dist_folder` is for the *express-prerender*
to know when a cached page is no longer valid. This way when the website folder is modified the pages will
be recached on next crawler hit.

`protocol` can either be "http" or "https" by default protocol is set to "https".


**What it does**

*express-prerender* will filter any requests with *express-useragent* where the user-agent corresponds to a robot. 
If the user-agent is not one, then next() is called to continue your express app as normal. Otherwise *express-prerender* 
will attempt to read a cached file of the requested page. 

If such a cached version of the page exists, then that is served to the crawler. Otherwise PhantomJS is spawned in a child process
to render the requested path on localhost and then that is served to the crawler and cached for next hit on that page. 

The `dist_folder` is looked at to determine wether the last modified time was before or after the last modified time of a cached page. 
This is in order to determine wether a cached page is still valid, if not the page will be recached.  
