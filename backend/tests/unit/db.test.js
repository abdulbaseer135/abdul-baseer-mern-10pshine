const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Database connection recovery', () => {
  let previous;
  beforeEach(() => { previous = global.__mongooseCache; delete global.__mongooseCache; });
  afterEach(() => { global.__mongooseCache = previous; });
  it('opens a fresh connection after a failed attempt and reuses success', async () => {
    const connection = { connection: { host: 'test', name: 'test' } };
    const connect = sinon.stub();
    connect.onFirstCall().rejects(new Error('temporary failure'));
    connect.onSecondCall().resolves(connection);
    const connectDB = proxyquire('../../src/config/db', {
      mongoose: { connect }, './env': { assertRequiredEnv() {} },
      './logger': { info() {}, error() {} }, 'node:dns': {},
    });
    expect(await connectDB(2, 0)).to.equal(connection);
    expect(await connectDB(2, 0)).to.equal(connection);
    expect(connect.callCount).to.equal(2);
  });
});
