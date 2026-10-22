const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Profile image validation and storage', () => {
  const png = Buffer.from('89504e470d0a1a0a0000', 'hex');
  let readFile, unlink, prepare, previousEnv;
  beforeEach(() => {
    previousEnv = { ...process.env };
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    process.env.NODE_ENV = 'development';
    readFile = sinon.stub().resolves(png);
    unlink = sinon.stub().resolves();
    prepare = proxyquire('../../src/middleware/profileImage.middleware', { 'node:fs/promises': { readFile, unlink } }).prepareProfileImage;
  });
  afterEach(() => { process.env = previousEnv; sinon.restore(); });
  const req = () => ({ file: { path: 'temporary-test-file', filename: 'test.png', mimetype: 'image/png' } });
  it('rejects disguised HTML and deletes the temporary file', async () => {
    readFile.resolves(Buffer.from('<svg onload="alert(1)"></svg>'));
    const next = sinon.spy();
    await prepare(req(), {}, next);
    expect(next.firstCall.args[0].statusCode).to.equal(400);
    sinon.assert.calledWith(unlink, 'temporary-test-file');
  });
  it('accepts a matching raster image locally', async () => {
    const next = sinon.spy();
    await prepare(req(), {}, next);
    expect(next.firstCall.args).to.deep.equal([]);
    expect(unlink.called).to.be.false;
  });
  it('fails closed if persistent storage is absent in production', async () => {
    process.env.NODE_ENV = 'production';
    const next = sinon.spy();
    await prepare(req(), {}, next);
    expect(next.firstCall.args[0].statusCode).to.equal(503);
    expect(unlink.calledOnce).to.be.true;
  });
  it('stores a remote URL and removes the temporary local file', async () => {
    Object.assign(process.env, { CLOUDINARY_CLOUD_NAME: 'test', CLOUDINARY_API_KEY: 'key', CLOUDINARY_API_SECRET: 'secret' });
    sinon.stub(global, 'fetch').resolves({ ok: true, json: async () => ({ secure_url: 'https://res.cloudinary.com/test/image/upload/test.png' }) });
    const request = req(), next = sinon.spy();
    await prepare(request, {}, next);
    expect(request.file.remoteUrl).to.equal('https://res.cloudinary.com/test/image/upload/test.png');
    expect(unlink.calledOnce).to.be.true;
    expect(next.firstCall.args).to.deep.equal([]);
  });
});
