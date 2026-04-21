const { expect } = require('chai');
const { connect, disconnect, clear } = require('../../helpers/testDb');
const notesService = require('../../../src/services/notes.service');
const { createUser } = require('../../../src/dal/users.dal');
const mongoose = require('mongoose');

describe('Notes Service', () => {
  before(async () => await connect());
  afterEach(async () => await clear());
  after(async () => await disconnect());

  let userId;

  beforeEach(async () => {
    const user = await createUser({ name: 'Test', email: `test${Date.now()}@test.com`, password: 'pass123' });
    userId = user._id;
  });

  it('should create a note', async () => {
    const note = await notesService.create(userId, { title: 'My Note', content: 'Content' });
    expect(note.title).to.equal('My Note');
    expect(note.userId.toString()).to.equal(userId.toString());
  });

  it('should get all notes for a user', async () => {
    await notesService.create(userId, { title: 'Note 1', content: 'Content 1' });
    await notesService.create(userId, { title: 'Note 2', content: 'Content 2' });
    const result = await notesService.getAll(userId, 1, 10);
    expect(result.notes).to.have.length(2);
  });

  it('should throw 404 for non-existing note', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    try {
      await notesService.getOne(fakeId, userId);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err.statusCode).to.equal(404);
    }
  });

  it('should throw 403 when accessing another users note', async () => {
    const note = await notesService.create(userId, { title: 'Mine', content: 'Content' });
    const otherId = new mongoose.Types.ObjectId();
    try {
      await notesService.getOne(note._id, otherId);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err.statusCode).to.equal(403);
    }
  });

  it('should delete a note', async () => {
    const note = await notesService.create(userId, { title: 'Delete', content: 'Content' });
    await notesService.remove(note._id, userId);
    try {
      await notesService.getOne(note._id, userId);
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err.statusCode).to.equal(404);
    }
  });
});