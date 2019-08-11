#! /usr/bin/env node
const CredentialManager = require('../lib/credential-manager');

async function main() {
  const credentialManager = new CredentialManager('ttcat');

  const [key, secret] = await credentialManager.getKeyAndSecret();

  console.log(key, secret);
}

main().catch(console.error);
