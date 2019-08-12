const querystring = require('querystring');

const inquirer = require('inquirer');

const CredentialManager = require('../lib/credential-manager');
const util = require('../lib/util');
const Twitter = require('../lib/twitter');

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
    await credentialsManager.storeKeyAndSecret(
      'consumer',
      answers.key,
      answers.secret,
    );
  },

  async account(name) {
    const credentialManager = new CredentialManager(name);
    const [consumer, apiSecret] = await credentialManager.getKeyAndSecret(
      'consumer',
    );
    const twitter = new Twitter(consumer, apiSecret);
    const response = querystring.parse(
      await twitter.post('oauth/request_token'),
    );
    twitter.setToken(response.oauth_token, response.oauth_token_secret);
    await inquirer.prompt({
      type: 'input',
      message:
        'Press enter to open Twitter in your default browser to authorize access',
      name: 'continue',
    });

    util.openBrowser(
      `${twitter.baseUrl}oauth/authorize?oauth_token=${response.oauth_token}`,
    );
    const answers = await inquirer.prompt({
      type: 'input',
      message: 'Enter the pin provided by Twitter',
      name: 'pin',
      validate: util.notEmpty,
    });

    const tokenReposnse = querystring.parse(
      await twitter.post(
        'oauth/access_token',
        `oauth_verifier=${answers.pin}`,
      ),
    );
    twitter.setToken(
      tokenReposnse.oauth_token,
      tokenReposnse.oauth_token_secret,
    );

    const verifyResponse = await twitter.get(
      '1.1/account/verify_credentials.json',
    );
    await credentialManager.storeKeyAndSecret(
      'account',
      tokenReposnse.oauth_token,
      tokenReposnse.oauth_token_secret,
    );
    console.log(`Account "${verifyResponse.screen_name}" successfully added`);
  },
};

module.exports = configure;
