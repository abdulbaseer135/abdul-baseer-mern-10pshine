const sinon = require('sinon');
const { expect } = require('chai');
const usersService = require('../../../src/services/users.service');
const usersController = require('../../../src/controllers/users.controller');

const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

const mockNext = () => sinon.stub();

describe('Users Controller', () => {
  afterEach(() => sinon.restore());

  // ─── getProfile ──────────────────────────────────────────────────────

  describe('getProfile()', () => {
    it('should return 200 with user profile data', async () => {
      const mockUser = { _id: 'uid1', name: 'Abdul Baseer', email: 'abdul@test.com' };
      sinon.stub(usersService, 'getProfile').resolves(mockUser);

      const req = { user: { _id: 'uid1' } };
      const res = mockRes();
      const next = mockNext();

      await usersController.getProfile(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should call next with error if service throws', async () => {
      sinon.stub(usersService, 'getProfile').rejects(new Error('User not found'));

      const req = { user: { _id: 'uid1' } };
      const res = mockRes();
      const next = mockNext();

      await usersController.getProfile(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  // ─── updateProfile ───────────────────────────────────────────────────

  describe('updateProfile()', () => {
    it('should return 200 with updated user data', async () => {
      const mockUser = { _id: 'uid1', name: 'New Name', email: 'abdul@test.com' };
      sinon.stub(usersService, 'updateProfile').resolves(mockUser);

      const req = { user: { _id: 'uid1' }, body: { name: 'New Name' } };
      const res = mockRes();
      const next = mockNext();

      await usersController.updateProfile(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should call next with error if service throws', async () => {
      sinon.stub(usersService, 'updateProfile').rejects(new Error('User not found'));

      const req = { user: { _id: 'uid1' }, body: { name: 'New Name' } };
      const res = mockRes();
      const next = mockNext();

      await usersController.updateProfile(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  // ─── deleteProfile ───────────────────────────────────────────────────

  describe('deleteProfile()', () => {
    it('should return 200 after successful deletion', async () => {
      sinon.stub(usersService, 'deleteProfile').resolves();

      const req = { user: { _id: 'uid1' } };
      const res = mockRes();
      const next = mockNext();

      await usersController.deleteProfile(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should call next with error if service throws', async () => {
      sinon.stub(usersService, 'deleteProfile').rejects(new Error('User not found'));

      const req = { user: { _id: 'uid1' } };
      const res = mockRes();
      const next = mockNext();

      await usersController.deleteProfile(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  // ─── changePassword ──────────────────────────────────────────────────

  describe('changePassword()', () => {
    it('should return 200 on successful password change', async () => {
      sinon.stub(usersService, 'changePassword').resolves();

      const req = {
        user: { _id: 'uid1' },
        body: { oldPassword: 'pass123', newPassword: 'newpass456' },
      };
      const res = mockRes();
      const next = mockNext();

      await usersController.changePassword(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should call next with 401 error when old password is wrong', async () => {
      const error = new Error('Old password is incorrect');
      error.statusCode = 401;
      sinon.stub(usersService, 'changePassword').rejects(error);

      const req = {
        user: { _id: 'uid1' },
        body: { oldPassword: 'wrongpass', newPassword: 'newpass456' },
      };
      const res = mockRes();
      const next = mockNext();

      await usersController.changePassword(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].statusCode).to.equal(401);
    });

    it('should call next with 404 error when user not found', async () => {
      const error = new Error('User not found');
      error.statusCode = 404;
      sinon.stub(usersService, 'changePassword').rejects(error);

      const req = {
        user: { _id: 'uid1' },
        body: { oldPassword: 'pass123', newPassword: 'newpass456' },
      };
      const res = mockRes();
      const next = mockNext();

      await usersController.changePassword(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].statusCode).to.equal(404);
    });
  });
});