const path = require('path');
const fs = require('fs-extra');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const { expect } = chai;
chai.use(chaiAsPromised);

const CredentialManager = require('../../lib/credential-manager');

describe('the credential manager', () => {
  let credentialManager;
  before(() => {
    credentialManager = new CredentialManager('ttcat-test');
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
    credentialManager.conf.set('keys.consumer', 'foo');
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
