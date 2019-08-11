const path = require('path');
const fs = require('fs');
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
    await credentialManager.storeKeyAndSecret('apiTestKey', 'apiTestSecret');
    const [key, secret] = await credentialManager.getKeyAndSecret();
    expect(key).to.equal('apiTestKey');
    expect(secret).to.equal('apiTestSecret');
  });

  it('should reject when no credentials are found', async () => {
    await credentialManager.clearKeyAndSecret();
    expect(credentialManager.getKeyAndSecret()).to.be.rejected();
  });

  after(done => {
    fs.unlink(
      path.join(
        process.env.HOME,
        '.config',
        'configstore',
        'ttcat-test.json',
      ),
      done,
    );
  });
});
