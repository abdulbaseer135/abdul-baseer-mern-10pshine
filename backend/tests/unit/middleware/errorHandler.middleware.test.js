const { expect } = require('chai');
const sinon = require('sinon');
const errorHandler = require('../../../src/middleware/errorHandler.middleware');
const ApiError = require('../../../src/utils/ApiError');

describe('Error Handler Middleware', () => {
  let prevEnv;
  beforeEach(() => {
    prevEnv = process.env.NODE_ENV;
  });
  afterEach(() => {
    process.env.NODE_ENV = prevEnv;
    sinon.restore();
  });

  const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = sinon.stub().callsFake((code) => {
      res.statusCode = code;
      return res;
    });
    res.json = sinon.stub().returns(res);
    return res;
  };

  it('preserves actionable message for operational 502 ApiError in production', () => {
    process.env.NODE_ENV = 'production';
    const err = new ApiError(502, 'Unable to send verification email. Please try again later.');
    const req = { method: 'POST', originalUrl: '/api/v1/auth/send-otp' };
    const res = mockRes();
    const next = sinon.stub();

    errorHandler(err, req, res, next);

    expect(res.status.calledWith(502)).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.include({
      success: false,
      statusCode: 502,
      message: 'Unable to send verification email. Please try again later.',
    });
  });

  it('masks unknown internal 500 error messages in production', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('Secret database password leaked in stack');
    const req = { method: 'GET', originalUrl: '/api/v1/notes' };
    const res = mockRes();
    const next = sinon.stub();

    errorHandler(err, req, res, next);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.firstCall.args[0].message).to.equal('Internal Server Error');
  });

  it('logs the request url properly without undefined', () => {
    const consoleSpy = sinon.spy(console, 'error');
    const err = new ApiError(400, 'Bad Request');
    const req = { method: 'POST', originalUrl: '/api/v1/auth/send-otp' };
    const res = mockRes();
    const next = sinon.stub();

    errorHandler(err, req, res, next);

    expect(consoleSpy.calledOnce).to.be.true;
    expect(consoleSpy.firstCall.args[1].url).to.equal('/api/v1/auth/send-otp');
  });
});

