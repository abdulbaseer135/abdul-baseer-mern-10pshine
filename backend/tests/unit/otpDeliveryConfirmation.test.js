const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('OTP delivery confirmation', () => {
  function setup(sendEmail) {
    const updateUser = sinon.stub().resolves({});
    const service = proxyquire('../../src/services/auth.service', {
      '../dal/users.dal': {
        findByEmail: sinon.stub().resolves({ _id: 'test-id' }),
        updateUser,
      },
      '../utils/nodemailer': { sendOTPEmail: sendEmail },
    });
    return { service, updateUser };
  }

  it('does not report success while the mail provider is still processing', async () => {
    let accept;
    const mail = sinon.stub().returns(new Promise(resolve => { accept = resolve; }));
    const { service, updateUser } = setup(mail);
    let completed = false;
    const result = service.sendOTP('test@example.com', 'verify').then(() => { completed = true; });
    await new Promise(resolve => setImmediate(resolve));
    expect(updateUser.calledOnce).to.equal(true);
    expect(mail.calledOnce).to.equal(true);
    expect(completed).to.equal(false);
    accept();
    await result;
    expect(completed).to.equal(true);
  });

  it('returns a useful error when email delivery fails', async () => {
    const { service } = setup(sinon.stub().rejects(Object.assign(new Error('provider failure'), { code: 'EAUTH' })));
    try {
      await service.sendOTP('test@example.com', 'verify');
      expect.fail('Expected failed delivery to reject');
    } catch (error) {
      expect(error.statusCode).to.equal(502);
      expect(error.message).to.include('Unable to send');
      expect(error.message).not.to.include('provider failure');
    }
  });
});
