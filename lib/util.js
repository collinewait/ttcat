const open = require('open');
const chalk = require('chalk');

const notEmpty = input => (input === '' ? 'This value is required' : true);
const openBrowser = url => open(url);
const handleError = message => {
  console.error(chalk.redBright(message));
  process.exitCode = 1;
};

module.exports = { notEmpty, openBrowser, handleError };
