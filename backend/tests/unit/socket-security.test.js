const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Socket authentication and room isolation', () => {
  const setup = () => {
    let authenticate, onConnection;
    const verify = sinon.stub().returns({ id: 'verified-user' });
    const findById = sinon.stub().resolves({ _id: 'verified-user', isEmailVerified: true });
    class Server {
      use(fn) { authenticate = fn; }
      on(event, fn) { if (event === 'connection') onConnection = fn; }
    }
    const { initSocket } = proxyquire('../../src/config/socket', {
      'socket.io': { Server }, jsonwebtoken: { verify },
      './env': { JWT_SECRET: 'test-secret', CLIENT_URL: 'http://localhost:3000' },
      '../dal/users.dal': { findById },
    });
    initSocket({});
    return { authenticate, onConnection, verify, findById };
  };
  it('rejects unauthenticated handshakes', async () => {
    const deps = setup();
    deps.verify.throws(new Error('missing token'));
    const next = sinon.spy();
    await deps.authenticate({ handshake: { auth: {} }, data: {} }, next);
    expect(next.firstCall.args[0].message).to.equal('Not authorized');
  });
  it('rejects deleted and unverified accounts', async () => {
    const deps = setup();
    for (const user of [null, { _id: 'u1', isEmailVerified: false }]) {
      deps.findById.resolves(user);
      const next = sinon.spy();
      await deps.authenticate({ handshake: { auth: { token: 'token' } }, data: {} }, next);
      expect(next.firstCall.args[0]).to.be.instanceOf(Error);
    }
  });
  it('joins only the authenticated user room and ignores supplied room IDs', async () => {
    const deps = setup();
    const socket = { handshake: { auth: { token: 'token', userId: 'victim' } }, data: {}, join: sinon.spy(), on: sinon.spy() };
    const next = sinon.spy();
    await deps.authenticate(socket, next);
    deps.onConnection(socket);
    expect(next.firstCall.args).to.deep.equal([]);
    sinon.assert.calledOnceWithExactly(socket.join, 'verified-user');
    expect(socket.on.calledWith('join')).to.be.false;
  });
});
