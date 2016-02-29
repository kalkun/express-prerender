##express-prerender
A package for prerendering pages for crawlers. This is useful when meta tags are dependent on a JavaScript framework to be loaded first 
e.g. Ember.

**Install**

```
    npm install express-prerender
```

**Usage**

In your express application just require the plugin with your configuration like such:
```
var prerender = require("express-prerender")({
    cache_path      : path/where/cached/files/are/saved,
    dist_folder     : website/distribution/folder
});
app.use(prerender.prerender);
```

Both `cache_path` and `dist_folder` are relative to the file where express-prerender is required or absolute.

The reason to give the path of the distribution folder in `dist_folder` is for the express-prerender
to know when a cached page is no longer valid. This way when the website folder is modified the pages will
be recached on next crawler hit.