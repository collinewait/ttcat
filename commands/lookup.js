const through2 = require('through2');
const ps = require('promise-streams');
const split = require('split2');
const parallel = require('parallel-transform');
const from = require('from2-array');
const JSONStream = require('JSONStream');

const CredentialManager = require('../lib/credential-manager');
const Twitter = require('../lib/twitter');
const batch = require('../lib/batch-stream');

const doLookup = async (api, name, items, inout = process) => {
  const credentialManager = new CredentialManager(name);
  const [key, secret] = await credentialManager.getKeyAndSecret('consumer');
  const twitter = new Twitter(key, secret);
  const [token, tokenSecret] = await credentialManager.getKeyAndSecret(
    'account',
  );
  twitter.setToken(token, tokenSecret);
  return ps.pipeline(
    items ? from.obj(items.split(',')) : inout.stdin.pipe(split()),
    batch(100),
    parallel(2, (data, next) => {
      twitter
        .get(`${api}${data.join(',')}`)
        .then(results => next(null, results))
        .catch(next);
    }),
    through2.obj(function fluttenStream(chunk, enc, next) {
      chunk.forEach(c => this.push(c));
      next();
    }),
    JSONStream.stringify(),
    inout.stdout,
  );
};

const lookup = {
  async users(...args) {
    await doLookup('1.1/users/lookup.json?screen_name=', ...args);
  },
  async statuses(...args) {
    await doLookup('1.1/statuses/lookup.json?id=', ...args);
  },
};

module.exports = lookup;
