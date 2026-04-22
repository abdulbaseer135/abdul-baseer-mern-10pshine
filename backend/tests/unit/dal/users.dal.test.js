const { expect } = require('chai');
const { connect, disconnect, clear } = require('../../helpers/testDb');
const { createUser, findByEmail, findById, updateUser, deleteUser } = require('../../../src/dal/users.dal');

describe('Users DAL', () => {
  before(async () => await connect());
  afterEach(async () => await clear());
  after(async () => await disconnect());

  it('should create a new user', async () => {
    const user = await createUser({ name: 'Abdul', email: 'abdul@test.com', password: 'pass123' });
    expect(user).to.have.property('_id');
    expect(user.email).to.equal('abdul@test.com');
  });

  it('should find a user by email', async () => {
    await createUser({ name: 'Abdul', email: 'find@test.com', password: 'pass123' });
    const user = await findByEmail('find@test.com');
    expect(user).to.not.be.null;
    expect(user.email).to.equal('find@test.com');
  });

  it('should return null for non-existing email', async () => {
    const user = await findByEmail('ghost@test.com');
    expect(user).to.be.null;
  });

  it('should find user by id without password', async () => {
    const created = await createUser({ name: 'Abdul', email: 'byid@test.com', password: 'pass123' });
    const user = await findById(created._id);
    expect(user).to.not.have.property('password');
  });

  it('should update a user', async () => {
    const created = await createUser({ name: 'Old Name', email: 'update@test.com', password: 'pass123' });
    const updated = await updateUser(created._id, { name: 'New Name' });
    expect(updated.name).to.equal('New Name');
  });

  it('should delete a user', async () => {
    const created = await createUser({ name: 'Delete', email: 'delete@test.com', password: 'pass123' });
    await deleteUser(created._id);
    const user = await findById(created._id);
    expect(user).to.be.null;
  });
});