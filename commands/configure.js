const inquirer = require('inquirer');

const CredentialManager = require('../lib/credential-manager');
const util = require('../lib/util');

const configure = {
  async consumer(name) {
    const credentialsManager = new CredentialManager(name);
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'key',
        message: 'Enter your Twitter API key:',
        validate: util.notEmpty,
      },
      {
        type: 'password',
        name: 'secret',
        message: 'Enter your Twitter API secret',
        validate: util.notEmpty,
      },
    ]);
    await credentialsManager.storeKeyAndSecret(answers.key, answers.secret);
  },
};

module.exports = configure;
