const path = require('path');
const fs = require('fs-extra');
const chai = require('chai');
const dirtyChai = require('dirty-chai');
const sinon = require('sinon');
const keytar = require('keytar');
const _ = require('lodash');
const inquirer = require('inquirer');

const configure = require('../../commands/configure');
const CredentialManager = require('../../lib/credential-manager');
const Twitter = require('../../lib/twitter');
const utill = require('../../lib/util');

const { expect } = chai;

// make sure dirty chai is the last to make necessary
// conversions including those of other plugins.
chai.use(dirtyChai);

describe('the configure module', () => {
  const secrets = {};
  let credentialsManager;
  let sandbox;
  before(() => {
    sinon.stub(keytar, 'setPassword').callsFake((service, key, secret) => {
      _.set(secrets, `${service}.${key}`, secret);
      return Promise.resolve();
    });
    sinon.stub(keytar, 'getPassword').callsFake((service, key) => {
      const value = _.get(secrets, `${service}.${key}`);
      return value
        ? Promise.resolve(value)
        : Promise.reject(new Error('Missing consumer secret'));
    });
    sinon.stub(keytar, 'deletePassword').callsFake((service, key) => {
      _.unset(secrets, `${service}.${key}`);
      return Promise.resolve();
    });
    credentialsManager = new CredentialManager('ttcat-test');
  });
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  it('should add credentials when non are found', async () => {
    sandbox
      .stub(inquirer, 'prompt')
      .resolves({ key: 'testKey', secret: 'testSecret' });
    await configure.consumer('ttcat-test');
    const [key, secret] = await credentialsManager.getKeyAndSecret(
      'consumer',
    );
    expect(key).to.equal('testKey');
    expect(secret).to.equal('testSecret');
    expect(inquirer.prompt.calledOnce).to.be.true();
  });

  it('should override existing credentials', async () => {
    sandbox
      .stub(inquirer, 'prompt')
      .resolves({ key: 'differentTestKey', secret: 'differentTestSecret' });
    await configure.consumer('ttcat-test');
    const [key, secret] = await credentialsManager.getKeyAndSecret(
      'consumer',
    );
    expect(key).to.equal('differentTestKey');
    expect(secret).to.equal('differentTestSecret');
    expect(inquirer.prompt.calledOnce).to.be.true();
  });

  afterEach(() => {
    sandbox.restore();
  });
  it('should add an account', async () => {
    sandbox
      .stub(CredentialManager.prototype, 'getKeyAndSecret')
      .resolves('key', 'secret');
    sandbox
      .stub(Twitter.prototype, 'post')
      .onFirstCall()
      .resolves('oauth_token=abc&oauth_token_secret=def')
      .onSecondCall()
      .resolves('oauth_token=hij&oauth_token_secret=klm');
    sandbox.stub(Twitter.prototype, 'get').resolves({ screen_name: 'foo' });
    sandbox
      .stub(inquirer, 'prompt')
      .onFirstCall()
      .resolves({ continue: '' })
      .onSecondCall()
      .resolves({ pin: 1234 });
    sandbox.stub(utill, 'openBrowser').returns('');
    sandbox.stub(console, 'log');
    await configure.account('ttcat-test');
    CredentialManager.prototype.getKeyAndSecret.restore();
    const [token, secret] = await credentialsManager.getKeyAndSecret(
      'account',
    );
    expect(token).to.equal('hij');
    expect(secret).to.equal('klm');
    expect(
      console.log.calledWith('Account "foo" successfully added'),
    ).to.be.true();
  });
  after(async () => {
    await credentialsManager.clearAll();
    keytar.deletePassword.restore();
    keytar.setPassword.restore();
    keytar.getPassword.restore();
    await fs.unlink(
      path.join(
        process.env.HOME,
        '.config',
        'configstore',
        'ttcat-test.json',
      ),
    );
  });
});
