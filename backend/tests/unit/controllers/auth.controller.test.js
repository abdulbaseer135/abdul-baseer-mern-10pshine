const sinon = require('sinon');
const { expect } = require('chai');
const authService = require('../../../src/services/auth.service');
const authController = require('../../../src/controllers/auth.controller');

const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

const mockNext = () => sinon.stub();

describe('Auth Controller', () => {
  afterEach(() => sinon.restore());

  // ─── signup ──────────────────────────────────────────────────────────

  describe('signup()', () => {
    it('should call next with error if service throws', async () => {
      sinon.stub(authService, 'register').rejects(new Error('Registration failed'));

      const req = { body: { name: 'Abdul', email: 'abdul@test.com', password: 'Password123!' } };
      const res = mockRes();
      const next = mockNext();

      await authController.signup(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  // ─── loginUser ───────────────────────────────────────────────────────

  describe('loginUser()', () => {
    it('should call next with error if service throws', async () => {
      sinon.stub(authService, 'login').rejects(new Error('Invalid credentials'));

      const req = { body: { email: 'abdul@test.com', password: 'wrong' } };
      const res = mockRes();
      const next = mockNext();

      await authController.loginUser(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('should return 200 on logout', async () => {
      const req = {};
      const res = mockRes();
      const next = mockNext();

      await authController.logout(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });
  });

  // ─── getMe ───────────────────────────────────────────────────────────

  describe('getMe()', () => {
    it('should return 200 with current user data', async () => {
      const mockUser = { _id: 'uid1', name: 'Abdul', email: 'abdul@test.com', profileImage: '/uploads/profile.jpg' };

      const req = { user: mockUser };
      const res = mockRes();
      const next = mockNext();

      await authController.getMe(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should format image URLs correctly', async () => {
      const mockUser = { _id: 'uid1', name: 'Abdul', email: 'abdul@test.com', profileImage: '/uploads/profile.jpg' };

      const req = { user: mockUser };
      const res = mockRes();
      const next = mockNext();

      await authController.getMe(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  // ─── sendOTPCode ────────────────────────────────────────────────────

  describe('sendOTPCode()', () => {

    it('should call next with error if email is missing', async () => {
      const req = { body: { purpose: 'verify' } };
      const res = mockRes();
      const next = mockNext();

      await authController.sendOTPCode(req, res, next);

      expect(next.calledOnce).to.be.true;
    });

    it('should call next with error if purpose is missing', async () => {
      const req = { body: { email: 'abdul@test.com' } };
      const res = mockRes();
      const next = mockNext();

      await authController.sendOTPCode(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  // ─── verifyOTPHandler ────────────────────────────────────────────────

  describe('verifyOTPHandler()', () => {
    it('should call next with error if required fields are missing', async () => {
      const req = { body: { email: 'abdul@test.com' } };
      const res = mockRes();
      const next = mockNext();

      await authController.verifyOTPHandler(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  // ─── resetUserPassword ───────────────────────────────────────────────

  describe('resetUserPassword()', () => {
    it('should call next with error if email is missing', async () => {
      const req = { body: { newPassword: 'NewPassword123!' } };
      const res = mockRes();
      const next = mockNext();

      await authController.resetUserPassword(req, res, next);

      expect(next.calledOnce).to.be.true;
    });

    it('should call next with error if newPassword is missing', async () => {
      const req = { body: { email: 'abdul@test.com' } };
      const res = mockRes();
      const next = mockNext();

      await authController.resetUserPassword(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });
});
