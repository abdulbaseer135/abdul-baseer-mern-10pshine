const { expect } = require('chai');
const { connect, disconnect, clear } = require('../../helpers/testDb');
const {
  recordDeletedEmail,
  findDeletedByEmail,
  removeDeletedEmail,
} = require('../../../src/dal/deletedAccounts.dal');

describe('Deleted Accounts DAL', () => {
  before(async () => await connect());
  afterEach(async () => await clear());
  after(async () => await disconnect());

  it('should upsert a deleted email tombstone', async () => {
    const email = 'Former.User@Example.com';
    await recordDeletedEmail(email);

    const found = await findDeletedByEmail(email);
    expect(found).to.exist;
    expect(found.email).to.equal('former.user@example.com');
  });

  it('should remove a deleted email tombstone', async () => {
    const email = 'restore@example.com';
    await recordDeletedEmail(email);
    await removeDeletedEmail(email);

    const found = await findDeletedByEmail(email);
    expect(found).to.equal(null);
  });

  it('should return null for emails that were never deleted', async () => {
    const found = await findDeletedByEmail('never-deleted@example.com');
    expect(found).to.equal(null);
  });
});
