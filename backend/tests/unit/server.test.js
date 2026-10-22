const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Server startup', () => {
  let signalListeners;
  beforeEach(() => {
    signalListeners = { SIGTERM: process.listeners('SIGTERM'), SIGINT: process.listeners('SIGINT') };
  });
  afterEach(() => {
    for (const signal of Object.keys(signalListeners)) {
      for (const listener of process.listeners(signal)) {
        if (!signalListeners[signal].includes(listener)) process.removeListener(signal, listener);
      }
    }
    sinon.restore();
  });
  const setup = () => {
    const server = {
      listen: sinon.stub().callsFake((port, callback) => callback()),
      on: sinon.stub(),
      close: sinon.stub().callsFake((callback) => callback()),
    };
    const createServer = sinon.stub().returns(server);
    const connectDB = sinon.stub().resolves();
    const assertRequiredEnv = sinon.stub();
    const io = { close: sinon.stub() };
    const initSocket = sinon.stub().returns(io);
    const disconnect = sinon.stub().resolves();
    const app = () => {};
    const { startServer } = proxyquire('../../src/local-server', {
      'node:http': { createServer }, './app': app,
      './config/db': connectDB, './config/env': { PORT: 5001, assertRequiredEnv },
      './config/logger': { info: sinon.stub() }, './config/socket': { initSocket },
      mongoose: { disconnect },
    });
    return { startServer, server, createServer, connectDB, assertRequiredEnv, initSocket, app, io, disconnect };
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
  it('closes sockets, HTTP and MongoDB on SIGTERM', async () => {
    const deps = setup();
    const exit = sinon.stub(process, 'exit');
    await deps.startServer();
    const listener = process.listeners('SIGTERM').find((fn) => !signalListeners.SIGTERM.includes(fn));
    listener();
    await new Promise((resolve) => setImmediate(resolve));
    sinon.assert.calledOnce(deps.io.close);
    sinon.assert.calledOnce(deps.server.close);
    sinon.assert.calledOnce(deps.disconnect);
    sinon.assert.calledWith(exit, 0);
  });
  it('reports the failing startup phase without error details', async () => {
    for (const [dependency, phase] of [
      ['assertRequiredEnv', 'environment_validation'],
      ['connectDB', 'database_connection'],
      ['createServer', 'http_server_creation'],
      ['initSocket', 'socket_initialization'],
      ['listen', 'http_listen'],
    ]) {
      const deps = setup();
      const error = new Error('private configuration value');
      if (dependency === 'connectDB') deps.connectDB.rejects(error);
      else (dependency === 'listen' ? deps.server.listen : deps[dependency]).throws(error);
      const exit = sinon.stub(process, 'exit');
      const output = sinon.stub(console, 'error');
      await deps.startServer();
      const diagnostic = JSON.parse(output.firstCall.args[0]);
      expect(diagnostic.phase).to.equal(phase);
      expect(diagnostic.category).to.equal('unexpected_error');
      expect(output.firstCall.args[0]).not.to.include('private configuration value');
      sinon.assert.calledWith(exit, 1);
      exit.restore();
      output.restore();
    }
  });
  it('captures asynchronous listener errors after registering the handler before listen', async () => {
    const deps = setup();
    const exit = sinon.stub(process, 'exit');
    const output = sinon.stub(console, 'error');
    await deps.startServer();
    sinon.assert.callOrder(deps.server.on, deps.server.listen);
    deps.server.on.firstCall.args[1](Object.assign(new Error('private value'), { code: 'EADDRINUSE' }));
    expect(JSON.parse(output.firstCall.args[0])).to.include({ phase: 'http_listen', category: 'port_in_use' });
    sinon.assert.calledWith(exit, 1);
  });
});
