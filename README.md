koa-logger2
===========

Logger middleware for [http://github.com/koajs](koajs). Inspired by morgan from expressjs and apache.

Usage
-----

Simplest example that will print basic information to standard output:

```javascript
var logger = require('koa-logger2');
app.use(logger().gen); // will log to standard output by default
```

More advanced usage which will output more [apache-like combined log](http://httpd.apache.org/docs/current/logs.html#accesslog):

```javascript
var logger = require('koa-logger2');

var log_middleware = logger('ip [day/month/year:time zone] "method url protocol/httpVer" status size "referer" "userAgent" duration ms custom[unpacked]');
log_middleware.setStream(fs.createWriteStream(path.join(__dirname, 'logs/2014-09.log'), { flags: 'a' }));

app.use(log_middleware.gen); // !! note there are no () after gen
```

As a result you will get lines like:

```
123.45.67.89 [12/Sep/2014:22:12:26 +0200] "GET / HTTP/1.1" 301 22 "-" "Mozilla/5.0 (Android; Mobile; rv:31.0) Gecko/31.0 Firefox/31.0" 0 ms -
```

Later at any time you can call setStream again in order to replace stream you're writing to.

API
---

Just call the only function which is being exported:

### logger([ format = " day/month time ip "method url protocol/httpVer" status size "referer" "userAgent" duration ms " ])

This will create logger object which has two properties - setStream method and gen. Formatters currently implemented are:

| Formatter | Description (Example)
| --------- | ---------------------
| ip        | IP address of the client
| method    | Request method (GET)
| url       | Request url (/)
| status    | Status code (200)
| httpVer   | Protocol version (1.1)
| protocol  | HTTP or HTTPS
| size      | Content-Length of response
| referer   | Referer header
| userAgent | User-agent header
| time      | Current time in 24-hour format HH:MM:SS
| day       | Day of month 01-31
| month     | Short month name (Sep)
| year      | Year 4 digits (2014)
| zone      | Timezone offset (+0200)
| duration  | Duration of processing this request
| custom[your.field] | Basically access anything you want from koa (ctx) object

#### setStream( [stream.Writable](http://nodejs.org/api/stream.html#stream_class_stream_writable) )

Use this function to replace output stream for the logger (for example for log rotation). Please keep in mind that actual writing to the stream happens "on the way back".

#### gen

Returns generator function which should be used as middleware in your koaApp.
** NOTE: There are NO brackets () at the end. **


TODO
----

* support for auth-module
* unit tests
* better code documentation
* ...

License
-------

MIT
