var router = require('koa-router')();
var send = require('koa-send');
var github = require('./github')


var serveIndex = function *(next) {
  yield send(this, 'index.html', {
    root: __dirname + '/templates'
  });
};

router.get('/', serveIndex);
router.get('/:user/:repo', serveIndex);


router.get('/api/:user/:repo', function *(next) {
  var params = this.params;
  var repo = params.user + '/' + params.repo;

  console.log('Got request for', repo);

  if (yield* this.cashed()) {
    console.log(repo, ' is cached');
    return;
  }

  this.body = yield github.getFirstCommit(repo);
});



module.exports = router;
