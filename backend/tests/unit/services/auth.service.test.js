const { expect } = require('chai');
const { connect, disconnect, clear } = require('../../helpers/testDb');
const { register, login } = require('../../../src/services/auth.service');

describe('Auth Service', () => {
  before(async () => await connect());
  afterEach(async () => await clear());
  after(async () => await disconnect());

  describe('register()', () => {
    it('should register a new user and return token', async () => {
      const result = await register({
        name: 'Abdul',
        email: 'abdul@test.com',
        password: 'password123',
      });
      expect(result).to.have.property('token');
      expect(result.user.email).to.equal('abdul@test.com');
      expect(result.user).to.not.have.property('password');
    });

    it('should throw 409 if email already exists', async () => {
      await register({ name: 'Abdul', email: 'dup@test.com', password: 'pass123' });
      try {
        await register({ name: 'Abdul', email: 'dup@test.com', password: 'pass123' });
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(409);
      }
    });
  });

  describe('login()', () => {
    it('should login with correct credentials', async () => {
      await register({ name: 'Abdul', email: 'login@test.com', password: 'pass123' });
      const result = await login({ email: 'login@test.com', password: 'pass123' });
      expect(result).to.have.property('token');
    });

    it('should throw 401 for wrong password', async () => {
      await register({ name: 'Abdul', email: 'wrong@test.com', password: 'pass123' });
      try {
        await login({ email: 'wrong@test.com', password: 'wrongpass' });
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(401);
      }
    });
  });
});