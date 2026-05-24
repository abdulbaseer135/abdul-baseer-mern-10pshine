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
  let secondUserId;

  beforeEach(async () => {
    const user = await createUser({ name: 'Test', email: `test${Date.now()}@test.com`, password: 'pass123' });
    userId = user._id;
    const secondUser = await createUser({ name: 'Second', email: `second${Date.now()}@test.com`, password: 'pass123' });
    secondUserId = secondUser._id;
  });

  describe('create()', () => {
    it('should create a note with valid data', async () => {
      const note = await notesService.create(userId, { title: 'My Note', content: 'Content' });
      expect(note.title).to.equal('My Note');
      expect(note.content).to.equal('Content');
      expect(note.userId.toString()).to.equal(userId.toString());
    });

    it('should create note with minimal content', async () => {
      const note = await notesService.create(userId, { title: 'Title Only', content: 'placeholder' });
      expect(note.title).to.equal('Title Only');
    });

    it('should set createdAt timestamp', async () => {
      const note = await notesService.create(userId, { title: 'Timestamped', content: 'Content' });
      expect(note.createdAt).to.exist;
      expect(note.createdAt).to.be.instanceof(Date);
    });
  });

  describe('getAll()', () => {
    it('should get all notes for a user with pagination', async () => {
      await notesService.create(userId, { title: 'Note 1', content: 'Content 1' });
      await notesService.create(userId, { title: 'Note 2', content: 'Content 2' });
      await notesService.create(userId, { title: 'Note 3', content: 'Content 3' });
      
      const result = await notesService.getAll(userId, 1, 10);
      expect(result.notes).to.have.length(3);
      expect(result.total).to.equal(3);
    });

    it('should return only first page notes', async () => {
      for (let i = 0; i < 5; i++) {
        await notesService.create(userId, { title: `Note ${i}`, content: 'Content' });
      }
      
      const result = await notesService.getAll(userId, 1, 3);
      expect(result.notes).to.have.length(3);
      expect(result.total).to.equal(5);
    });

    it('should return second page notes', async () => {
      for (let i = 0; i < 5; i++) {
        await notesService.create(userId, { title: `Note ${i}`, content: 'Content' });
      }
      
      const result = await notesService.getAll(userId, 2, 3);
      expect(result.notes.length).to.be.greaterThan(0);
    });

    it('should not return other users notes', async () => {
      await notesService.create(userId, { title: 'My Note', content: 'Content' });
      await notesService.create(secondUserId, { title: 'Other Note', content: 'Content' });
      
      const result = await notesService.getAll(userId, 1, 10);
      expect(result.notes).to.have.length(1);
      expect(result.notes[0].title).to.equal('My Note');
    });

    it('should search notes by title and content', async () => {
      await notesService.create(userId, { title: 'JavaScript Basics', content: 'Learn JS' });
      await notesService.create(userId, { title: 'Python Guide', content: 'Python is great' });
      
      const result = await notesService.getAll(userId, 1, 10, 'JavaScript');
      expect(result.notes.length).to.be.greaterThan(0);
      expect(result.notes[0].title).to.include('JavaScript');
    });
  });

  describe('getOne()', () => {
    it('should get a single note by id', async () => {
      const created = await notesService.create(userId, { title: 'Single', content: 'Content' });
      const found = await notesService.getOne(created._id, userId);
      
      expect(found._id.toString()).to.equal(created._id.toString());
      expect(found.title).to.equal('Single');
    });

    it('should throw 404 for non-existing note', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      try {
        await notesService.getOne(fakeId, userId);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(404);
        expect(err.message).to.include('not found');
      }
    });

    it('should throw 403 when accessing another users note', async () => {
      const note = await notesService.create(userId, { title: 'Mine', content: 'Content' });
      try {
        await notesService.getOne(note._id, secondUserId);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(403);
      }
    });
  });

  describe('update()', () => {
    it('should update a note with valid data', async () => {
      const note = await notesService.create(userId, { title: 'Original', content: 'Original Content' });
      const updated = await notesService.update(note._id, userId, { title: 'Updated', content: 'Updated Content' });
      
      expect(updated.title).to.equal('Updated');
      expect(updated.content).to.equal('Updated Content');
    });

    it('should update only title', async () => {
      const note = await notesService.create(userId, { title: 'Original', content: 'Content' });
      const updated = await notesService.update(note._id, userId, { title: 'New Title' });
      
      expect(updated.title).to.equal('New Title');
      expect(updated.content).to.equal('Content');
    });

    it('should throw 404 for non-existing note', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      try {
        await notesService.update(fakeId, userId, { title: 'Update' });
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(404);
      }
    });

    it('should throw 403 when updating another users note', async () => {
      const note = await notesService.create(userId, { title: 'Mine', content: 'Content' });
      try {
        await notesService.update(note._id, secondUserId, { title: 'Hacked' });
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(403);
      }
    });

    it('should update updatedAt timestamp', async () => {
      const note = await notesService.create(userId, { title: 'Original', content: 'Content' });
      const originalUpdatedAt = note.updatedAt;
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
      
      const updated = await notesService.update(note._id, userId, { title: 'Updated' });
      expect(updated.updatedAt.getTime()).to.be.greaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('remove()', () => {
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

    it('should throw 404 when deleting non-existing note', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      try {
        await notesService.remove(fakeId, userId);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(404);
      }
    });

    it('should throw 403 when deleting another users note', async () => {
      const note = await notesService.create(userId, { title: 'Mine', content: 'Content' });
      try {
        await notesService.remove(note._id, secondUserId);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(403);
      }
    });
  });

  describe('search()', () => {
    it('should search notes by query', async () => {
      await notesService.create(userId, { title: 'React Tutorial', content: 'Learn React' });
      await notesService.create(userId, { title: 'Vue Guide', content: 'Learn Vue' });
      
      const result = await notesService.getAll(userId, 1, 10, 'React');
      expect(result.notes.length).to.be.greaterThan(0);
      expect(result.notes.some(n => n.title.includes('React'))).to.be.true;
    });

    it('should be case-insensitive', async () => {
      await notesService.create(userId, { title: 'JAVASCRIPT', content: 'Learn JS' });
      
      const result1 = await notesService.getAll(userId, 1, 10, 'javascript');
      const result2 = await notesService.getAll(userId, 1, 10, 'JAVASCRIPT');
      const result3 = await notesService.getAll(userId, 1, 10, 'JavaScript');
      
      expect(result1.notes.length).to.equal(result2.notes.length);
      expect(result2.notes.length).to.equal(result3.notes.length);
    });
  });
});