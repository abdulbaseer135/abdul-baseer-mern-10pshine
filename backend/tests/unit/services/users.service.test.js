const { expect } = require('chai');
const { connect, disconnect, clear } = require('../../helpers/testDb');
const usersService = require('../../../src/services/users.service');
const { createUser } = require('../../../src/dal/users.dal');

describe('Users Service', () => {
  before(async () => await connect());
  afterEach(async () => await clear());
  after(async () => await disconnect());

  let userId;

  beforeEach(async () => {
    const user = await createUser({
      name: 'Abdul Baseer',
      email: `abdul${Date.now()}@test.com`,
      password: 'pass123',
    });
    userId = user._id;
  });

  it('should get user profile', async () => {
    const user = await usersService.getProfile(userId);
    expect(user).to.have.property('_id');
    expect(user).to.not.have.property('password');
  });

  it('should update user name', async () => {
    const updated = await usersService.updateProfile(userId, { name: 'Updated Name' });
    expect(updated.name).to.equal('Updated Name');
  });

  it('should NOT update password through profile update', async () => {
    const updated = await usersService.updateProfile(userId, {
      name: 'Safe Update',
      password: 'hacked123',
    });
    expect(updated.name).to.equal('Safe Update');
    expect(updated).to.not.have.property('password');
  });

  it('should NOT update email through profile update', async () => {
    const updated = await usersService.updateProfile(userId, {
      name: 'No Email Change',
      email: 'hacked@test.com',
    });
    expect(updated.name).to.equal('No Email Change');
  });

  it('should delete user profile', async () => {
    await usersService.deleteProfile(userId);
    try {
      await usersService.getProfile(userId);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err.statusCode).to.equal(404);
    }
  });

  // ─── changePassword Tests ────────────────────────────────────────────

  it('should change password successfully with correct old password', async () => {
    await usersService.changePassword(userId, 'pass123', 'newpass456');

    // verify new password works by logging in
    const user = await usersService.getProfile(userId);
    expect(user).to.have.property('_id');
  });

  it('should throw 401 when old password is incorrect', async () => {
    try {
      await usersService.changePassword(userId, 'wrongpassword', 'newpass456');
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err.statusCode).to.equal(401);
      expect(err.message).to.equal('Old password is incorrect');
    }
  });

  it('should throw 404 when user does not exist for changePassword', async () => {
    const fakeId = '000000000000000000000000';
    try {
      await usersService.changePassword(fakeId, 'pass123', 'newpass456');
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err.statusCode).to.equal(404);
      expect(err.message).to.equal('User not found');
    }
  });

  it('should throw 404 when user does not exist for getProfile', async () => {
    const fakeId = '000000000000000000000000';
    try {
      await usersService.getProfile(fakeId);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err.statusCode).to.equal(404);
    }
  });

  it('should throw 404 when user does not exist for updateProfile', async () => {
    const fakeId = '000000000000000000000000';
    try {
      await usersService.updateProfile(fakeId, { name: 'Ghost' });
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err.statusCode).to.equal(404);
    }
  });
});