const { expect } = require('chai');
const { connect, disconnect, clear } = require('../../helpers/testDb');
const { createNote, getNotesByUser, getNoteById, updateNote, deleteNote } = require('../../../src/dal/notes.dal');
const mongoose = require('mongoose');

describe('Notes DAL', () => {
  before(async () => await connect());
  afterEach(async () => await clear());
  after(async () => await disconnect());

  const userId = new mongoose.Types.ObjectId();

  it('should create a note', async () => {
    const note = await createNote({ title: 'Test Note', content: 'Hello', userId });
    expect(note).to.have.property('_id');
    expect(note.title).to.equal('Test Note');
  });

  it('should get notes by user', async () => {
    await createNote({ title: 'Note 1', content: 'Content 1', userId });
    await createNote({ title: 'Note 2', content: 'Content 2', userId });
    const result = await getNotesByUser(userId);
    expect(result.notes).to.have.length(2);
    expect(result.total).to.equal(2);
  });

  it('should get note by id', async () => {
    const note = await createNote({ title: 'Find Me', content: 'Content', userId });
    const found = await getNoteById(note._id);
    expect(found.title).to.equal('Find Me');
  });

  it('should update a note', async () => {
    const note = await createNote({ title: 'Old Title', content: 'Content', userId });
    const updated = await updateNote(note._id, { title: 'New Title' });
    expect(updated.title).to.equal('New Title');
  });

  it('should delete a note', async () => {
    const note = await createNote({ title: 'Delete Me', content: 'Content', userId });
    await deleteNote(note._id);
    const found = await getNoteById(note._id);
    expect(found).to.be.null;
  });
});