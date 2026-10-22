const { expect } = require('chai');
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const { connect, disconnect, clear } = require('../helpers/testDb');
const User = require('../../src/models/User.model');
const { hashOTP } = require('../../src/utils/otp');
const { verifyOTPCode, generateToken } = require('../../src/services/auth.service');
const { protect } = require('../../src/middleware/auth.middleware');
const authRoutes = require('../../src/routes/auth.routes');
const errorHandler = require('../../src/middleware/errorHandler.middleware');

describe('Password reset security (HTTP + database)', () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.get('/private', protect, (req, res) => res.json({ success: true }));
  app.use(errorHandler);
  const email = 'security@example.com';
  let user;
  before(connect);
  after(disconnect);
  afterEach(clear);
  beforeEach(async () => {
    user = await User.create({ name: 'Security Test', email, password: 'Original123!', isEmailVerified: true,
      otp: { code: hashOTP('123456'), purpose: 'reset', expiresAt: new Date(Date.now() + 60000), attempts: 0 } });
  });
  const reset = (resetToken, resetEmail = email) => request(app).post('/auth/reset-password').send({ email: resetEmail, newPassword: 'Changed123!', resetToken });
  const credential = async () => (await verifyOTPCode(email, '123456', 'reset')).resetToken;

  it('rejects direct password changes without completing OTP verification', async () => {
    const response = await reset();
    expect(response.status).to.equal(400);
    const saved = await User.findById(user._id).select('+password');
    expect(await bcrypt.compare('Original123!', saved.password)).to.be.true;
  });
  it('rejects a forged token', async () => {
    expect((await reset('a'.repeat(64))).status).to.equal(400);
  });
  it('issues a reset credential only after a valid OTP and stores only its hash', async () => {
    const token = await credential();
    const saved = await User.findById(user._id).select('+passwordReset.tokenHash');
    expect(token).to.match(/^[a-f0-9]{64}$/);
    expect(saved.passwordReset.tokenHash).to.equal(hashOTP(token));
    expect(saved.otp.code).to.be.null;
  });
  it('changes the password and rejects token reuse', async () => {
    const token = await credential();
    expect((await reset(token)).status).to.equal(200);
    expect((await reset(token)).status).to.equal(400);
    const saved = await User.findById(user._id).select('+password');
    expect(await bcrypt.compare('Changed123!', saved.password)).to.be.true;
  });
  it('revokes sessions issued before the password reset', async () => {
    const oldToken = generateToken(user._id, 0);
    expect((await request(app).get('/private').set('Authorization', `Bearer ${oldToken}`)).status).to.equal(200);
    await reset(await credential());
    expect((await request(app).get('/private').set('Authorization', `Bearer ${oldToken}`)).status).to.equal(401);
    const updated = await User.findById(user._id);
    const newToken = generateToken(user._id, updated.tokenVersion);
    expect((await request(app).get('/private').set('Authorization', `Bearer ${newToken}`)).status).to.equal(200);
  });
  it('rejects expired credentials', async () => {
    const token = await credential();
    await User.updateOne({ _id: user._id }, { $set: { 'passwordReset.expiresAt': new Date(0) } });
    expect((await reset(token)).status).to.equal(400);
  });
  it('binds credentials to the verified email', async () => {
    const token = await credential();
    expect((await reset(token, 'someoneelse@example.com')).status).to.equal(400);
  });
  it('allows only one of two concurrent requests to consume the credential', async () => {
    const token = await credential();
    const results = await Promise.all([reset(token), reset(token)]);
    expect(results.map((r) => r.status).sort()).to.deep.equal([200, 400]);
  });
  it('rejects a consumed OTP', async () => {
    await credential();
    try { await credential(); throw new Error('Expected rejection'); }
    catch (err) { expect(err.statusCode).to.equal(400); }
  });
  it('locks verification after five incorrect guesses', async () => {
    for (let i = 0; i < 5; i++) {
      try { await verifyOTPCode(email, '000000', 'reset'); throw new Error('Expected rejection'); }
      catch (err) { expect(err.statusCode).to.equal(400); }
    }
    try { await credential(); throw new Error('Expected lockout'); }
    catch (err) { expect(err.statusCode).to.equal(429); }
  });
  it('rejects expired OTPs', async () => {
    await User.updateOne({ _id: user._id }, { $set: { 'otp.expiresAt': new Date(0) } });
    try { await credential(); throw new Error('Expected rejection'); }
    catch (err) { expect(err.statusCode).to.equal(400); }
  });
  it('throttles repeated HTTP verification requests', async () => {
    const responses = [];
    for (let i = 0; i < 6; i++) responses.push(await request(app).post('/auth/verify-otp').send({}));
    expect(responses[5].status).to.equal(429);
  });
});
