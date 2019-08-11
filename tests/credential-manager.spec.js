const chai = require('chai');
const sinon = require('sinon');
const inquirer = require('inquirer');
const dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
const { expect } = chai;

const CredentialManager = require('../lib/credential-manager');

describe('a credential manager', () => {
  let credentialManager;
  before(() => {
    credentialManager = new CredentialManager('ttcat-test');
  });

  after(async () => {
    await credentialManager.clearKeyAndSecret();
  });

  context('with no existing credentials', () => {
    it('should prompt the user', async () => {
      sinon
        .stub(inquirer, 'prompt')
        .resolves({ key: 'testKey', secret: 'testSecret' });
      const [key, secret] = await credentialManager.getKeyAndSecret();
      expect(key).to.equal('testKey');
      expect(secret).to.equal('testSecret');
      expect(inquirer.prompt.calledOnce).to.be.true();
      inquirer.prompt.restore();
    });
  });

  context('with existing credentials', () => {
    it('should just return them', async () => {
      const [key, secret] = await credentialManager.getKeyAndSecret();
      expect(key).to.equal('testKey');
      expect(secret).to.equal('testSecret');
    });
  });
});
