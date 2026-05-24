const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const profileController = require('../../../src/controllers/profile.controller');
const ApiError = require('../../../src/utils/ApiError');
const usersDal = require('../../../src/dal/users.dal');
const logger = require('../../../src/config/logger');

describe('Profile Controller - profile.controller.js', () => {
  let req;
  let res;
  let next;
  let updateUserStub;
  let loggerStub;

  beforeEach(() => {
    req = {
      user: { _id: 'user123' },
      file: null,
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };

    next = sinon.stub();
    updateUserStub = sinon.stub(usersDal, 'updateUser');
    loggerStub = sinon.stub(logger, 'info');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('uploadProfileImage()', () => {
    it('should return 400 if no file provided', async () => {
      req.file = null;

      await profileController.uploadProfileImage(req, res, next);

      expect(next.calledOnce).to.be.true;
      const error = next.getCall(0).args[0];
      expect(error).to.be.instanceof(ApiError);
      expect(error.status).to.equal(400);
      expect(error.message).to.include('No image file provided');
    });

    it('should update user with image URL', async () => {
      req.file = { filename: 'profile-123.jpg' };
      const updatedUser = {
        _id: 'user123',
        profileImage: 'http://localhost:5000/uploads/profiles/profile-123.jpg',
      };

      updateUserStub.resolves(updatedUser);

      await profileController.uploadProfileImage(req, res, next);

      expect(updateUserStub.calledOnce).to.be.true;
      expect(updateUserStub.calledWith('user123', sinon.match.object)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(loggerStub.calledOnce).to.be.true;
    });

    it('should include updated user in response', async () => {
      req.file = { filename: 'profile-789.png' };
      const updatedUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        profileImage: 'http://localhost:5000/uploads/profiles/profile-789.png',
      };

      updateUserStub.resolves(updatedUser);

      await profileController.uploadProfileImage(req, res, next);

      expect(res.json.calledOnce).to.be.true;
      const callArgs = res.json.getCall(0).args[0];
      expect(callArgs).to.have.property('data');
    });

    it('should handle database error during upload', async () => {
      req.file = { filename: 'profile-error.jpg' };
      updateUserStub.rejects(new Error('Database error'));

      await profileController.uploadProfileImage(req, res, next);

      expect(next.calledOnce).to.be.true;
    });

    it('should construct correct image URL', async () => {
      req.file = { filename: 'test-profile.webp' };
      updateUserStub.resolves({
        _id: 'user123',
        profileImage: 'http://localhost:5000/uploads/profiles/test-profile.webp',
      });

      await profileController.uploadProfileImage(req, res, next);

      expect(updateUserStub.calledOnce).to.be.true;
      const updateCall = updateUserStub.getCall(0);
      const updateData = updateCall.args[1];
      expect(updateData.profileImage).to.include('/uploads/profiles/');
      expect(updateData.profileImage).to.include('test-profile.webp');
    });
  });

  describe('removeProfileImage()', () => {
    it('should update user with null profileImage', async () => {
      const updatedUser = {
        _id: 'user123',
        profileImage: null,
      };

      updateUserStub.resolves(updatedUser);

      await profileController.removeProfileImage(req, res, next);

      expect(updateUserStub.calledOnce).to.be.true;
      expect(updateUserStub.calledWith('user123', { profileImage: null })).to.be.true;
    });

    it('should return 200 status on success', async () => {
      updateUserStub.resolves({
        _id: 'user123',
        profileImage: null,
      });

      await profileController.removeProfileImage(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
    });

    it('should return updated user in response', async () => {
      const updatedUser = {
        _id: 'user123',
        name: 'Test User',
        profileImage: null,
      };

      updateUserStub.resolves(updatedUser);

      await profileController.removeProfileImage(req, res, next);

      expect(res.json.calledOnce).to.be.true;
      const callArgs = res.json.getCall(0).args[0];
      expect(callArgs).to.have.property('data');
    });

    it('should log successful removal', async () => {
      updateUserStub.resolves({
        _id: 'user123',
        profileImage: null,
      });

      await profileController.removeProfileImage(req, res, next);

      expect(loggerStub.calledOnce).to.be.true;
    });

    it('should handle database error during removal', async () => {
      updateUserStub.rejects(new Error('Database error'));

      await profileController.removeProfileImage(req, res, next);

      expect(next.calledOnce).to.be.true;
    });

    it('should include success message in response', async () => {
      updateUserStub.resolves({
        _id: 'user123',
        profileImage: null,
      });

      await profileController.removeProfileImage(req, res, next);

      expect(res.json.calledOnce).to.be.true;
      const callArgs = res.json.getCall(0).args[0];
      expect(callArgs).to.have.property('message');
      expect(callArgs.message).to.include('removed');
    });
  });
});
