const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const dirtyChai = require('dirty-chai');
const sinon = require('sinon');
const { ObjectReadableMock, ObjectWritableMock } = require('stream-mock');

const lookup = require('../../commands/lookup');
const CredentialManager = require('../../lib/credential-manager');
const Twitter = require('../../lib/twitter');

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(dirtyChai);

describe('the lookup module', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  context('users', () => {
    beforeEach(() => {
      sandbox
        .stub(CredentialManager.prototype, 'getKeyAndSecret')
        .resolves(['key', 'secret']);
      sandbox.stub(Twitter.prototype, 'get').callsFake(url => {
        const response = url
          .slice(url.indexOf('=') + 1)
          .split(',')
          .map(n => ({ screen_name: n }));
        return Promise.resolve(response);
      });
    });

    it('should look up users piped to stdin', done => {
      const stdin = new ObjectReadableMock(['foo\n', 'bar\n'], {
        objectMode: true,
      });
      const stdout = new ObjectWritableMock();
      lookup.users('ttcat-test', null, { stdin, stdout });
      stdout.on('finish', () => {
        expect(JSON.parse(stdout.data.join(''))).to.deep.equal([
          { screen_name: 'foo' },
          { screen_name: 'bar' },
        ]);
        done();
      });
    });

    it('should lookup more than 100 users pined to stdin', done => {
      const users = [...Array(101).keys()].map(n => `foo${n}`);
      const stdin = new ObjectReadableMock(users.map(u => `${u}\n`), {
        objectMode: true,
      });
      const stdout = new ObjectWritableMock();
      lookup.users('ttcat-test', null, { stdin, stdout });
      stdout.on('finish', () => {
        expect(JSON.parse(stdout.data.join('')))
          .to.deep
          .equal(users.map(u => ({ screen_name: u })));
        done();
      });
    });

    it('should lookup users from the command line', done => {
      const stdout = new ObjectWritableMock();
      lookup.users('ttcat-test', 'foo,bar', { stdout });
      stdout.on('finish', () => {
        expect(JSON.parse(stdout.data.join(''))).to.deep.equal([
          { screen_name: 'foo' },
          { screen_name: 'bar' },
        ]);
        done();
      });
    });

    it('should reject on error', async () => {
      Twitter.prototype.get.restore();
      sandbox.stub(Twitter.prototype, 'get').rejects(new Error('Test Error'));
      const stdout = new ObjectWritableMock();
      await expect(
        lookup.users('ttcat-test', 'foo', { stdout }),
      ).to.be.rejectedWith('Test Error');
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
