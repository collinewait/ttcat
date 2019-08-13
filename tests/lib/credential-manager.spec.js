const path = require('path');
const fs = require('fs-extra');
const sinon = require('sinon');
const keytar = require('keytar');
const _ = require('lodash');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const { expect } = chai;
chai.use(chaiAsPromised);

const CredentialManager = require('../../lib/credential-manager');

describe('the credential manager', () => {
  const secrets = {};
  let credentialManager;
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
    credentialManager = new CredentialManager('ttcat-test');
  });

  it('should return credentials set in the environment', async () => {
    process.env['TTCAT-TEST_CONSUMER_KEY'] = 'one';
    process.env['TTCAT-TEST_CONSUMER_SECRET'] = 'two';
    const [key, secret] = await credentialManager.getKeyAndSecret('consumer');
    expect(key).to.equal('one');
    expect(secret).to.equal('two');
  });

  it('should prefer credentials set in the environment', async () => {
    await credentialManager.storeKeyAndSecret('consumer', 'foo', 'boom');
    const [key, secret] = await credentialManager.getKeyAndSecret('consumer');
    expect(key).to.equal('one');
    expect(secret).to.equal('two');
    delete process.env['TTCAT-TEST_CONSUMER_KEY'];
    delete process.env['TTCAT-TEST_CONSUMER_SECRET'];
  });

  it('should return credentials when they are found', async () => {
    await credentialManager.storeKeyAndSecret(
      'consumer',
      'apiTestKey',
      'apiTestSecret',
    );
    const [key, secret] = await credentialManager.getKeyAndSecret('consumer');
    expect(key).to.equal('apiTestKey');
    expect(secret).to.equal('apiTestSecret');
  });

  it('should reject when no key is found', async () => {
    await credentialManager.clearKeyAndSecret('consumer');
    expect(credentialManager.getKeyAndSecret('consumer')).to.be.rejectedWith(
      'Missing consumer key',
    );
  });

  it('should reject when no secret is found', async () => {
    credentialManager.conf.set('keys.consumer', 'foom');
    await expect(
      credentialManager.getKeyAndSecret('consumer'),
    ).to.be.rejectedWith('Missing consumer secret');
    credentialManager.conf.delete('keys.consumer');
  });

  it('should remove all credentials', async () => {
    await credentialManager.storeKeyAndSecret('consumer', 'one', 'two');
    await credentialManager.storeKeyAndSecret('account', 'three', 'four');
    await credentialManager.clearAll();
    await expect(
      credentialManager.getKeyAndSecret('consumer'),
    ).to.be.rejected();
    await expect(
      credentialManager.getKeyAndSecret('account'),
    ).to.be.rejected();
  });
  after(async () => {
    await credentialManager.clearAll();
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
