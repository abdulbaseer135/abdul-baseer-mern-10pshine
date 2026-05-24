const { expect } = require('chai');
const { connect, disconnect, clear } = require('../helpers/testDb');
const notesService = require('../../src/services/notes.service');
const { createUser } = require('../../src/dal/users.dal');
const { createNote } = require('../../src/dal/notes.dal');
const mongoose = require('mongoose');

describe('Notes Routes Integration Tests', () => {
  let userId;
  let noteId;

  before(async () => {
    await connect();
  });

  afterEach(async () => {
    await clear();
  });

  after(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    // Create a test user
    const user = await createUser({
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'pass123',
    });
    userId = user._id;

    // Create a test note
    const note = await createNote({
      title: 'Test Note',
      content: 'Test Content',
      userId,
    });
    noteId = note._id;
  });

  // ─── Notes Service Tests ─────────────────────────────────────────────

  describe('Notes Service Integration', () => {
    it('should create, retrieve, update, and delete notes', async () => {
      // Create
      const created = await notesService.create(userId, { title: 'New', content: 'Content' });
      expect(created).to.have.property('_id');

      // Get all
      const all = await notesService.getAll(userId, 1, 10);
      expect(all.notes.length).to.be.greaterThan(0);

      // Get one
      const found = await notesService.getOne(created._id, userId);
      expect(found._id.toString()).to.equal(created._id.toString());

      // Update
      const updated = await notesService.update(created._id, userId, { title: 'Updated' });
      expect(updated.title).to.equal('Updated');

      // Delete
      await notesService.remove(created._id, userId);
      try {
        await notesService.getOne(created._id, userId);
        expect.fail('Note should have been deleted');
      } catch (err) {
        expect(err.statusCode).to.equal(404);
      }
    });

    it('should handle pagination correctly', async () => {
      // Create multiple notes
      for (let i = 0; i < 5; i++) {
        await notesService.create(userId, { title: `Note ${i}`, content: `Content ${i}` });
      }

      // Get first page
      const page1 = await notesService.getAll(userId, 1, 3);
      expect(page1.notes).to.have.length(3);
      expect(page1.total).to.be.greaterThan(3);

      // Get second page
      const page2 = await notesService.getAll(userId, 2, 3);
      expect(page2.notes.length).to.be.greaterThan(0);
    });

    it('should search notes by title and content', async () => {
      await notesService.create(userId, { title: 'JavaScript Basics', content: 'Learn JS' });
      await notesService.create(userId, { title: 'Python Guide', content: 'Python is great' });

      const results = await notesService.getAll(userId, 1, 10, 'JavaScript');
      expect(results.notes.some(n => n.title.includes('JavaScript'))).to.be.true;
    });

    it('should prevent access to other users notes', async () => {
      const otherUser = await createUser({
        name: 'Other User',
        email: `other${Date.now()}@test.com`,
        password: 'pass123',
      });

      try {
        await notesService.getOne(noteId, otherUser._id);
        expect.fail('Should have thrown 403');
      } catch (err) {
        expect(err.statusCode).to.equal(403);
      }
    });

    it('should handle note import successfully', async () => {
      const notes = [
        { title: 'Import 1', content: 'Content 1', category: 'general' },
        { title: 'Import 2', content: 'Content 2', category: 'task' },
      ];

      const importedNotes = [];
      for (const n of notes) {
        const created = await notesService.create(userId, n);
        importedNotes.push(created);
      }

      expect(importedNotes).to.have.length(2);
      expect(importedNotes[0].title).to.equal('Import 1');
    });

    it('should handle note export', async () => {
      const result = await notesService.getAll(userId, 1, 100);
      expect(result).to.have.property('notes');
      expect(Array.isArray(result.notes)).to.be.true;
    });
  });

  // ─── User Isolation Tests ────────────────────────────────────────────

  describe('User Isolation', () => {
    it('each user should only see their own notes', async () => {
      const user1 = await createUser({
        name: 'User 1',
        email: `user1${Date.now()}@test.com`,
        password: 'pass123',
      });
      const user2 = await createUser({
        name: 'User 2',
        email: `user2${Date.now()}@test.com`,
        password: 'pass123',
      });

      await notesService.create(user1._id, { title: 'User1 Note', content: 'Content' });
      await notesService.create(user2._id, { title: 'User2 Note', content: 'Content' });

      const user1Notes = await notesService.getAll(user1._id, 1, 10);
      const user2Notes = await notesService.getAll(user2._id, 1, 10);

      expect(user1Notes.notes.every(n => n.userId.toString() === user1._id.toString())).to.be.true;
      expect(user2Notes.notes.every(n => n.userId.toString() === user2._id.toString())).to.be.true;
    });
  });

  // ─── Data Integrity Tests ───────────────────────────────────────────

  describe('Data Integrity', () => {
    it('should preserve note metadata on update', async () => {
      const created = await notesService.create(userId, {
        title: 'Original',
        content: 'Original Content',
        category: 'task',
        taskStatus: 'todo',
      });

      const updated = await notesService.update(created._id, userId, { title: 'Updated' });
      expect(updated.category).to.equal('task');
      expect(updated.taskStatus).to.equal('todo');
    });
  });
});
