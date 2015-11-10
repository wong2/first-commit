var app = require('koa')();
var json = require('koa-json');
var cached = require('cached');
var router = require('./app/router');

var cache = cached('first-commit', {
  backend: {
    type: 'memcached',
    hosts: '127.0.0.1:11211',
  }
});

app.use(require('koa-cash')({
  get: function* (key, maxAge) {
    return cache.get(key);
  },
  set: function* (key, value) {
    return cache.set(key, value);
  }
}));

app
  .use(json({pretty: false, param: 'pretty'}))
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
console.log('Listening on port 3000 ...');
