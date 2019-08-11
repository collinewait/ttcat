#! /usr/bin/env node

const program = require('commander');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .command('configure', 'configure Twitter-related credentials')
  .parse(process.argv);
// const CredentialManager = require('../lib/credential-manager');

// async function main() {
//   const credentialManager = new CredentialManager('ttcat');

//   const [key, secret] = await credentialManager.getKeyAndSecret();

//   console.log(key, secret);
// }

// main().catch(console.error);
