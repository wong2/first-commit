var router = require('koa-router')();
var send = require('koa-send');
var github = require('./github')


router.get('/', function *(next) {
  yield send(this, 'index.html', {
    root: __dirname + '/templates'
  });
});

router.get('/api/:user/:repo', function *(next) {
  var params = this.params;
  var repo = params.user + '/' + params.repo;

  console.log('Got request for', repo);

  if (yield* this.cashed()) {
    console.log(repo, ' is cached');
    return;
  }

  try {
    this.body = yield github.getFirstCommit(repo);
  } catch (e) {
    console.error(e);
  }
});



module.exports = router;
