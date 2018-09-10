## express-prerender
A package for prerendering pages for crawlers. This is useful when meta tags are dependent on a JavaScript framework to be loaded first 
e.g. Ember. The middleware will serve a cached page for any requests by crawlers to a page or cache the page if no valid cache exists. 
This way the middleware handles dynamic pages very well since it does not need to know of any paths on the website before hand. Providing 
a path to the website folder enables the middleware to determine wether a cached page is still valid or not. 

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
    cache_path      : path/where/cached/files/are/saved/,
    dist_folder     : website/distribution/folder, 
    ignore          : ["list", "of", "strings"],
    protocol        : "http" | "https",
    host            : hostname,
    port            : portnumber,
    verbose         : bool
});
app.use(prerender.prerender);
```

Both `cache_path` and `dist_folder` are relative to the file where *express-prerender* is required or absolute.

The reason to give the path of the distribution folder in `dist_folder` is for the *express-prerender*
to know when a cached page is no longer valid. This way when the website folder is modified the pages will
be recached on next crawler hit.

`ignore` is a list of strings that, if any path includes any of the strings then the express-prerender will not 
try to cache the request even though it is requested by a crawler. This is useful for leaving out calls for 
resources. By default de list is set to [].

`protocol` can either be "http" or "https" by default protocol is set to "https".

`host` is the hostname for the request by prerender, by default its set to "localhost".

`port` is a portnumber for the request by prerender, by default is set to none (so default port for protocol)

`verbose` is either true or false, by default it's set to false.


**What it does**

*express-prerender* will filter any requests with *express-useragent* where the user-agent corresponds to a robot. 
If the user-agent is not one, then next() is called to continue your express app as normal. Otherwise *express-prerender* 
will attempt to read a cached file of the requested page. 

If such a cached version of the page exists, then that is served to the crawler. Otherwise PhantomJS is spawned in a child process
to render the requested path on localhost and then that is served to the crawler and cached for next hit on that page. 

The `dist_folder` is looked at to determine wether the last modified time was before or after the last modified time of a cached page. 
This is in order to determine wether a cached page is still valid, if not the page will be recached.  


**Test**

You can test the middleware with curl. Issuing a normal request to your website should reveal what you would normally see:
```
curl yoursite
```

To check that robots are served with a prerendered version, then you can set the useragent to 'twitterbot' for instance:
```
curl yoursite -A twitterbot
```
