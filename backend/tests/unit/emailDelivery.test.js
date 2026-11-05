const { expect } = require('chai');
const sinon = require('sinon');
const { sendOTPEmail } = require('../../src/utils/nodemailer');

describe('HTTPS OTP email delivery', () => {
  let previousKey;
  let previousFrom;
  let previousProvider;

  beforeEach(() => {
    previousKey = process.env.RESEND_API_KEY;
    previousFrom = process.env.EMAIL_FROM;
    previousProvider = process.env.EMAIL_PROVIDER;

    process.env.RESEND_API_KEY = 'test-key';
    process.env.EMAIL_FROM = 'noreply@example.com';
    process.env.EMAIL_PROVIDER = 'resend';
  });

  afterEach(() => {
    if (previousKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousKey;

    if (previousFrom === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = previousFrom;

    if (previousProvider === undefined) delete process.env.EMAIL_PROVIDER;
    else process.env.EMAIL_PROVIDER = previousProvider;

    sinon.restore();
  });

  it('uses HTTPS with a bounded timeout and sends the recipient, code, and HTML', async () => {
    const fetch = sinon.stub(global, 'fetch').resolves({
      ok: true,
      json: async () => ({ id: 'resend_msg_123' }),
    });

    await sendOTPEmail('test@example.com', '123456', 'reset');

    const [url, options] = fetch.firstCall.args;
    expect(url).to.equal('https://api.resend.com/emails');
    expect(options.headers.Authorization).to.equal('Bearer test-key');
    const parsed = JSON.parse(options.body);
    expect(parsed.to).to.deep.equal(['test@example.com']);
    expect(parsed.text).to.include('123456');
    expect(parsed.html).to.include('123456');
    expect(parsed.html).to.include('Password Reset');
    expect(options.signal).to.exist;
  });

  it('reports provider rejection when response is not ok', async () => {
    sinon.stub(global, 'fetch').resolves({
      ok: false,
      status: 422,
      json: async () => ({ error: { name: 'validation_error', message: 'Domain not verified' } }),
    });

    try {
      await sendOTPEmail('test@example.com', '123456', 'verify');
      expect.fail('Expected rejection');
    } catch (error) {
      expect(error.message).to.equal('Failed to send OTP email');
      expect(error.code).to.equal('validation_error');
    }
  });

  it('handles connection failure or timeout', async () => {
    const timeoutErr = new Error('The operation was aborted');
    timeoutErr.name = 'TimeoutError';
    sinon.stub(global, 'fetch').rejects(timeoutErr);

    try {
      await sendOTPEmail('test@example.com', '123456', 'verify');
      expect.fail('Expected timeout rejection');
    } catch (error) {
      expect(error.message).to.equal('Failed to send OTP email');
      expect(error.code).to.equal('ETIMEDOUT');
    }
  });

  it('fails fast when required configuration is missing', async () => {
    delete process.env.RESEND_API_KEY;

    try {
      await sendOTPEmail('test@example.com', '123456', 'verify');
      expect.fail('Expected missing config error');
    } catch (error) {
      expect(error.code).to.equal('CONFIG_ERROR');
      expect(error.message).to.include('RESEND_API_KEY');
    }
  });
});
