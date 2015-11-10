var rp = require('request-promise');
var cheerio = require('cheerio');
var Promise = require("bluebird");

const BASE_URL = 'https://github.com';


function fetch(url) {
  var options = {
    uri: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) Gecko/20100101 Firefox/40.1'
    },
    transform: function(body) {
      return cheerio.load(body);
    }
  };
  return rp(options);
}


function getRepoCommitsCount(repo) {
  return new Promise((resolve, reject) => {
    var url = `${BASE_URL}/${repo}`;
    fetch(url)
      .then($ => {
        var num_str = $('.numbers-summary .commits .num').text().trim();
        var num = parseInt(num_str.replace(/,/g, ''), 10);
        resolve(num);
      })
      .catch(reject);
  });
}

function getFirstPageUrl(repo, num_of_commits) {
  const COMMITS_PER_PAGE = 35;
  var first_page = Math.ceil(num_of_commits / COMMITS_PER_PAGE);
  return `${BASE_URL}/${repo}/commits?page=${first_page}`;
}

function extractFirstCommitInfo($) {
  var li = $('.commit.commits-list-item').last();

  var tmp = li.data('channel').split(':commit:');
  var repo = tmp[0], sha = tmp[1];

  var author_id = li.find('.commit-author-section a').text().trim();
  var commit_title = li.find('.commit-title a').text().trim();
  var time_str = li.find('time').attr('datetime');

  return {
    repo: repo,
    sha: sha,
    title: commit_title,
    time: new Date(time_str),
    url: `${BASE_URL}/${repo}/commit/${sha}`,
    browse_url: `${BASE_URL}/${repo}/tree/${sha}`,
    author: author_id
  };
}

function getFirstCommit(repo) {
  return new Promise((resolve, reject) => {
    getRepoCommitsCount(repo)
      .then(count => getFirstPageUrl(repo, count))
      .then(fetch)
      .then(extractFirstCommitInfo)
      .then(resolve)
      .catch(reject);
  });
}


exports.getFirstCommit = getFirstCommit;
