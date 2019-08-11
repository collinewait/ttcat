const Configstore = require('configstore');
const inquirer = require('inquirer');
const keytar = require('keytar');

class CredentialManager {
  constructor(name) {
    this.conf = new Configstore(name);
    this.service = name;
  }
  async getKeyAndSecret() {
    let key = this.conf.get('apiKey');
    if (key) {
      let secret = await keytar.getPassword(this.service, key);
      return [key, secret];
    } else {
      let answers = await inquirer.prompt([
        { type: 'input', name: 'key', message: 'Enter your twitter API key' },
        {
          type: 'password',
          name: 'secret',
          message: 'Enter your Twitter API secret',
        },
      ]);
      this.conf.set('apiKey', answers.key);
      await keytar.setPassword(this.service, answers.key, answers.secret);
      return [answers.key, answers.secret];
    }
  }

  async clearKeyAndSecret() {
    let key = this.conf.get('apiKey');
    this.conf.delete('apiKey');
    await keytar.deletePassword(this.service, key);
  }
}

module.exports = CredentialManager;
