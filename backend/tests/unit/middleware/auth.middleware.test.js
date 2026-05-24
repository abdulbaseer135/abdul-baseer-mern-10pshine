const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const ApiError = require('../../../src/utils/ApiError');

// ─── Stubs injected via proxyquire ────────────────────────────────────────
// The middleware destructures jwt.verify and findById at call time (not load
// time), so we can stub jwt normally. But findById IS destructured at load
// time, so we inject it via proxyquire.
const findByIdStub = sinon.stub();
const jwtStub = { verify: sinon.stub() };

const { protect } = proxyquire('../../../src/middleware/auth.middleware', {
  'jsonwebtoken': jwtStub,
  '../dal/users.dal': { findById: findByIdStub },
});

describe('Auth Middleware - auth.middleware.js', () => {
  let req;
  let res;
  let next;
  let consoleErrorStub;

  beforeEach(() => {
    req = { headers: {}, ip: '127.0.0.1' };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
    jwtStub.verify.reset();
    findByIdStub.reset();
    consoleErrorStub = sinon.stub(console, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('protect() middleware', () => {
    it('should reject request with no Authorization header', async () => {
      req.headers.authorization = undefined;
      await protect(req, res, next);
      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.be.instanceof(ApiError);
      expect(error.statusCode).to.equal(401);
      expect(error.message).to.include('no token provided');
    });

    it('should reject request with non-Bearer token', async () => {
      req.headers.authorization = 'Basic token123';
      await protect(req, res, next);
      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.be.instanceof(ApiError);
      expect(error.statusCode).to.equal(401);
    });

    it('should extract token from Bearer header and verify it', async () => {
      req.headers.authorization = 'Bearer valid-jwt-token';
      jwtStub.verify.returns({ id: 'user123' });
      findByIdStub.resolves({ _id: 'user123', name: 'Test User' });
      await protect(req, res, next);
      expect(jwtStub.verify.calledOnce).to.be.true;
    });

    it('should handle TokenExpiredError', async () => {
      req.headers.authorization = 'Bearer expired-token';
      const error = new Error('Token has expired');
      error.name = 'TokenExpiredError';
      jwtStub.verify.throws(error);
      await protect(req, res, next);
      expect(next.calledOnce).to.be.true;
      const apiError = next.getCall(0).args[0];
      expect(apiError.statusCode).to.equal(401);
      expect(apiError.message).to.include('expired');
      expect(consoleErrorStub.calledOnce).to.be.true;
    });

    it('should handle JsonWebTokenError', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      jwtStub.verify.throws(error);
      await protect(req, res, next);
      expect(next.calledOnce).to.be.true;
      const apiError = next.getCall(0).args[0];
      expect(apiError.statusCode).to.equal(401);
      expect(apiError.message).to.include('Invalid');
      expect(consoleErrorStub.calledOnce).to.be.true;
    });

    it('should handle unknown JWT errors', async () => {
      req.headers.authorization = 'Bearer bad-token';
      const error = new Error('Unknown JWT error');
      error.name = 'UnknownError';
      jwtStub.verify.throws(error);
      await protect(req, res, next);
      expect(next.calledOnce).to.be.true;
      const apiError = next.getCall(0).args[0];
      expect(apiError.statusCode).to.equal(401);
      expect(apiError.message).to.include('verification failed');
    });

    it('should reject token with no id in payload', async () => {
      req.headers.authorization = 'Bearer token-no-id';
      jwtStub.verify.returns({ name: 'User' }); // No id field
      await protect(req, res, next);
      expect(next.calledOnce).to.be.true;
      const apiError = next.getCall(0).args[0];
      expect(apiError.statusCode).to.equal(401);
      expect(apiError.message).to.include('Invalid token structure');
    });

    it('should fetch user from database using decoded id', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwtStub.verify.returns({ id: 'user123' });
      findByIdStub.resolves({ _id: 'user123', name: 'Test User', email: 'test@example.com' });
      await protect(req, res, next);
      expect(findByIdStub.calledWith('user123')).to.be.true;
    });

    it('should attach user to request object on success', async () => {
      const mockUser = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
      req.headers.authorization = 'Bearer valid-token';
      jwtStub.verify.returns({ id: 'user123' });
      findByIdStub.resolves(mockUser);
      await protect(req, res, next);
      expect(req.user).to.deep.equal(mockUser);
    });

    it('should call next() without error on success', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwtStub.verify.returns({ id: 'user123' });
      findByIdStub.resolves({ _id: 'user123', name: 'Test User' });
      await protect(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.getCall(0).args[0]).to.be.undefined;
    });

    it('should handle database lookup errors with 500', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwtStub.verify.returns({ id: 'user123' });
      findByIdStub.rejects(new Error('Database connection failed'));
      await protect(req, res, next);
      expect(next.calledOnce).to.be.true;
      const apiError = next.getCall(0).args[0];
      expect(apiError.statusCode).to.equal(500);
      expect(apiError.message).to.include('Failed to retrieve user');
      expect(consoleErrorStub.called).to.be.true;
    });

    it('should reject when user not found in database', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwtStub.verify.returns({ id: 'nonexistent' });
      findByIdStub.resolves(null);
      await protect(req, res, next);
      expect(next.calledOnce).to.be.true;
      const apiError = next.getCall(0).args[0];
      expect(apiError.statusCode).to.equal(401);
      expect(apiError.message).to.include('no longer exists');
      expect(consoleErrorStub.called).to.be.true;
    });

    it('should log token verification failure with IP and error details', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      req.ip = '192.168.1.1';
      const error = new Error('Invalid signature');
      error.name = 'JsonWebTokenError';
      jwtStub.verify.throws(error);
      await protect(req, res, next);
      expect(consoleErrorStub.called).to.be.true;
      const logCall = consoleErrorStub.getCall(0);
      expect(logCall.args[0]).to.include('[Auth Middleware]');
    });

    it('should log user lookup failure with userId context', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwtStub.verify.returns({ id: 'user123' });
      findByIdStub.rejects(new Error('Connection timeout'));
      await protect(req, res, next);
      expect(consoleErrorStub.called).to.be.true;
      const logCall = consoleErrorStub.getCall(0);
      expect(logCall.args[1]).to.include.property('userId');
    });

    it('should reject lowercase bearer prefix (case-sensitive)', async () => {
      req.headers.authorization = 'bearer token123';
      await protect(req, res, next);
      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error.statusCode).to.equal(401);
    });

    it('should be exported as a function', () => {
      expect(protect).to.be.a('function');
    });
  });

  describe('Module Export', () => {
    it('should export protect function', () => {
      const auth = require('../../../src/middleware/auth.middleware');
      expect(auth.protect).to.be.a('function');
    });

    it('should only export protect method', () => {
      const auth = require('../../../src/middleware/auth.middleware');
      expect(Object.keys(auth)).to.include('protect');
    });
  });
});
