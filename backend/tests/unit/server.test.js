const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Server startup', () => {
  afterEach(() => sinon.restore());
  const setup = () => {
    const server = { listen: sinon.stub().callsFake((port, callback) => callback()) };
    const createServer = sinon.stub().returns(server);
    const connectDB = sinon.stub().resolves();
    const assertRequiredEnv = sinon.stub();
    const initSocket = sinon.stub();
    const app = () => {};
    const { startServer } = proxyquire('../../src/local-server', {
      'node:http': { createServer }, './app': app,
      './config/db': connectDB, './config/env': { PORT: 5001, assertRequiredEnv },
      './config/logger': { info: sinon.stub() }, './config/socket': { initSocket },
    });
    return { startServer, server, createServer, connectDB, assertRequiredEnv, initSocket, app };
  };
  it('does not start a listener when imported', () => {
    const deps = setup();
    expect(deps.createServer.called).to.be.false;
  });
  it('validates configuration and connects before accepting requests', async () => {
    const deps = setup();
    await deps.startServer();
    sinon.assert.callOrder(deps.assertRequiredEnv, deps.connectDB, deps.createServer, deps.initSocket, deps.server.listen);
    sinon.assert.calledWith(deps.createServer, deps.app);
    sinon.assert.calledWith(deps.initSocket, deps.server);
    sinon.assert.calledWith(deps.server.listen, 5001);
  });
  it('exits without listening when the database connection fails', async () => {
    const deps = setup();
    deps.connectDB.rejects(new Error('DB unavailable'));
    const exit = sinon.stub(process, 'exit');
    sinon.stub(console, 'error');
    await deps.startServer();
    sinon.assert.calledWith(exit, 1);
    expect(deps.server.listen.called).to.be.false;
  });
});
