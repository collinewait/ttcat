const path = require('path');
const fs = require('fs');
const chai = require('chai');
const dirtyChai = require('dirty-chai');
const sinon = require('sinon');
const inquirer = require('inquirer');

const configure = require('../../commands/configure');
const CredentialManager = require('../../lib/credential-manager');

const { expect } = chai;

// make sure dirty chai is the last to make necessary
// conversions including those of other plugins.
chai.use(dirtyChai);

describe('the configure module', () => {
  let credentialsManager;
  before(() => {
    credentialsManager = new CredentialManager('ttcat-test');
  });
  it('should add credentials when non are found', async () => {
    sinon
      .stub(inquirer, 'prompt')
      .resolves({ key: 'testKey', secret: 'testSecret' });
    await configure.consumer('ttcat-test');
    const [key, secret] = await credentialsManager.getKeyAndSecret();
    expect(key).to.equal('testKey');
    expect(secret).to.equal('testSecret');
    expect(inquirer.prompt.calledOnce).to.be.true();
    inquirer.prompt.restore();
  });

  it('should override existing credentials', async () => {
    sinon
      .stub(inquirer, 'prompt')
      .resolves({ key: 'differentTestKey', secret: 'differentTestSecret' });
    await configure.consumer('ttcat-test');
    const [key, secret] = await credentialsManager.getKeyAndSecret();
    expect(key).to.equal('differentTestKey');
    expect(secret).to.equal('differentTestSecret');
    expect(inquirer.prompt.calledOnce).to.be.true();
    inquirer.prompt.restore();
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
