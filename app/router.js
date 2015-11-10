var router = require('koa-router')();
var send = require('koa-send');
var github = require('./github')


router.get('/', function *(next) {
  yield send(this, 'index.html', {
    root: __dirname + '/templates'
  });
});

router.get('/api/:user/:repo', function *(next) {
  if (yield* this.cashed()) {
    return;
  }
  var params = this.params;
  var repo = params.user + '/' + params.repo;
  try {
    this.body = yield github.getFirstCommit(repo);
  } catch (e) {
    console.error(e);
  }
});



module.exports = router;
