const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const proxyquire = require('proxyquire').noCallThru();
const { connect, disconnect, clear } = require('../helpers/testDb');

describe('Signup HTTP route with isolated database and email', () => {
  let app;
  let sendEmail;
  before(async () => {
    await connect();
    sendEmail = sinon.stub().resolves();
    const service = proxyquire('../../src/services/auth.service', {
      '../utils/nodemailer': { sendOTPEmailNonBlocking: sendEmail },
      '../utils/emailValidation': { validateEmailFormat: () => true, validateEmailDomain: async () => true },
    });
    const controller = proxyquire('../../src/controllers/auth.controller', { '../services/auth.service': service });
    const authRoutes = proxyquire('../../src/routes/auth.routes', { '../controllers/auth.controller': controller });
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRoutes);
    app.use(require('../../src/middleware/errorHandler.middleware'));
  });
  afterEach(async () => { sendEmail.resetHistory(); await clear(); });
  after(disconnect);

  it('accepts signup at the actual prefix and requires email verification', async () => {
    const response = await request(app).post('/api/v1/auth/signup').send({
      name: 'Isolated Test', email: 'isolated@example.com', password: 'Password123!',
    });
    expect(response.status).to.equal(201);
    expect(response.body.data.requiresVerification).to.equal(true);
    expect(response.body.data.token).to.equal(null);
    expect(response.body.data.user.isEmailVerified).to.equal(false);
    sinon.assert.calledOnce(sendEmail);
  });

  it('rejects invalid request bodies before creating an account or sending email', async () => {
    const response = await request(app).post('/api/v1/auth/signup').send({});
    expect(response.status).to.equal(400);
    sinon.assert.notCalled(sendEmail);
  });
});
