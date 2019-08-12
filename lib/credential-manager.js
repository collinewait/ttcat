const Configstore = require('configstore');
const keytar = require('keytar');

class CredentialManager {
  constructor(name) {
    this.conf = new Configstore(name);
    this.service = name;
  }

  async getKeyAndSecret(prop) {
    const key = this.conf.get(`keys.${prop}`);
    if (!key) {
      throw new Error(
        `Missing ${prop} key -- have you run 'configure ${prop}'?`,
      );
    }
    const secret = await keytar.getPassword(this.service, key);
    if (!secret) {
      throw new Error(
        `Missing ${prop} secret -- have you run 'configure ${prop}'?`,
      );
    }
    return [key, secret];
  }

  async storeKeyAndSecret(prop, key, secret) {
    this.conf.set(`keys.${prop}`, key);
    await keytar.setPassword(this.service, key, secret);
  }

  async clearKeyAndSecret(prop) {
    const key = this.conf.get(`keys.${prop}`);
    this.conf.delete(`keys.${prop}`);
    await keytar.deletePassword(this.service, key);
  }

  async clearAll() {
    for (let prop of Object.keys(this.conf.get('keys'))) {
      await this.clearKeyAndSecret(prop);
    }
  }
}

module.exports = CredentialManager;
