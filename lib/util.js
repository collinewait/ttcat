const open = require('open');

const notEmpty = input => (input === '' ? 'This value is required' : true);
const openBrowser = url => open(url);

module.exports = { notEmpty, openBrowser };
