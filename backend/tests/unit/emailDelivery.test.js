const { expect } = require('chai');
const sinon = require('sinon');
const { sendOTPEmail } = require('../../src/utils/nodemailer');

describe('HTTPS OTP email delivery', () => {
  let previousKey;
  beforeEach(() => { previousKey = process.env.RESEND_API_KEY; process.env.RESEND_API_KEY = 'test-key'; });
  afterEach(() => {
    if (previousKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousKey;
    sinon.restore();
  });
  it('uses HTTPS with a bounded timeout and sends the recipient and code', async () => {
    const fetch = sinon.stub(global, 'fetch').resolves({ ok: true });
    await sendOTPEmail('test@example.com', '123456', 'reset');
    const [url, options] = fetch.firstCall.args;
    expect(url).to.equal('https://api.resend.com/emails');
    expect(options.headers.Authorization).to.equal('Bearer test-key');
    expect(JSON.parse(options.body).to).to.deep.equal(['test@example.com']);
    expect(JSON.parse(options.body).text).to.include('123456');
    expect(options.signal).to.exist;
  });
  it('reports provider rejection', async () => {
    sinon.stub(global, 'fetch').resolves({ ok: false });
    try { await sendOTPEmail('test@example.com', '123456', 'verify'); expect.fail('Expected rejection'); }
    catch (error) { expect(error.message).to.equal('Failed to send OTP email'); }
  });
});
