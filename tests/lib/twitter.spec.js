const chai = require('chai');
const dirtyChai = require('dirty-chai');
const sinon = require('sinon');
const axios = require('axios');

const Twitter = require('../../lib/twitter');

const { expect } = chai;
chai.use(dirtyChai);

describe('the twitter module', () => {
  let twitter;
  before(() => {
    twitter = new Twitter('key', 'secret');
  });
  it('should set a token', () => {
    twitter.setToken('abc', '123');
    expect(twitter.token).to.include({ key: 'abc' });
    expect(twitter.token).to.include({ secret: '123' });
  });
  it('should invoke GET APIs', async () => {
    sinon.stub(axios, 'get').resolves({ data: 'getRespData' });
    const response = await twitter.get('/api');
    expect(response).to.equal('getRespData');
    axios.get.restore();
  });
  it('should invoke POST APIs', async () => {
    sinon.stub(axios, 'post').resolves({ data: 'postRespData' });
    const response = await twitter.post('/api', 'someData');
    expect(response).to.equal('postRespData');
    axios.post.restore();
  });
});
