const { expect } = require('chai');
const { connect, disconnect, clear } = require('../../helpers/testDb');
const { createUser, findByEmail, findById } = require('../../../src/dal/users.dal');

describe('Users DAL', () => {
  before(async () => await connect());
  afterEach(async () => await clear());
  after(async () => await disconnect());

  it('should create a new user', async () => {
    const user = await createUser({
      name: 'Abdul Baseer',
      email: 'abdul@test.com',
      password: 'password123',
    });
    expect(user).to.have.property('_id');
    expect(user.email).to.equal('abdul@test.com');
  });

  it('should find a user by email', async () => {
    await createUser({ name: 'Test', email: 'test@test.com', password: 'pass123' });
    const user = await findByEmail('test@test.com');
    expect(user).to.not.be.null;
    expect(user.email).to.equal('test@test.com');
  });

  it('should return null for non-existing email', async () => {
    const user = await findByEmail('notfound@test.com');
    expect(user).to.be.null;
  });
});