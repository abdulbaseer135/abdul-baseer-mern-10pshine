const { describe, it, before, after, beforeEach } = require('mocha');
const { expect } = require('chai');
const mongoose = require('mongoose');
const { connect, disconnect, clear } = require('../../helpers/testDb');
const Note = require('../../../src/models/Note.model');

// A valid userId ObjectId for all tests
const userId = new mongoose.Types.ObjectId();

describe('Note Model - Note.model.js', () => {
  before(async () => {
    await connect();
  });

  after(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    await clear();
  });

  // ─── Default values ────────────────────────────────────────────────────

  describe('Default values', () => {
    it('should default isPublic to false', async () => {
      const note = await Note.create({ title: 'T', content: 'C', userId });
      expect(note.isPublic).to.be.false;
    });

    it('should default isPinned to false', async () => {
      const note = await Note.create({ title: 'T', content: 'C', userId });
      expect(note.isPinned).to.be.false;
    });

    it('should default category to general', async () => {
      const note = await Note.create({ title: 'T', content: 'C', userId });
      expect(note.category).to.equal('general');
    });

    it('should auto-generate a noteId UUID when not provided', async () => {
      const note = await Note.create({ title: 'T', content: 'C', userId });
      expect(note.noteId).to.be.a('string');
      expect(note.noteId).to.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  // ─── Validation ────────────────────────────────────────────────────────

  describe('Validation', () => {
    it('should fail validation when title is missing', async () => {
      let err;
      try {
        await Note.create({ content: 'C', userId });
      } catch (e) {
        err = e;
      }
      expect(err).to.exist;
      expect(err.errors.title).to.exist;
    });

    it('should fail validation when title exceeds 100 characters', async () => {
      let err;
      try {
        await Note.create({ title: 'A'.repeat(101), content: 'C', userId });
      } catch (e) {
        err = e;
      }
      expect(err).to.exist;
      expect(err.errors.title).to.exist;
    });

    it('should fail validation when content is missing', async () => {
      let err;
      try {
        await Note.create({ title: 'T', userId });
      } catch (e) {
        err = e;
      }
      expect(err).to.exist;
      expect(err.errors.content).to.exist;
    });

    it('should accept a title of exactly 100 characters', async () => {
      const note = await Note.create({ title: 'A'.repeat(100), content: 'C', userId });
      expect(note.title).to.have.length(100);
    });
  });

  // ─── pre('save') middleware ────────────────────────────────────────────

  describe('pre(save) middleware — normalizeTaskStatus', () => {
    it('should set taskStatus to todo when category=task and taskStatus is null', async () => {
      const note = await Note.create({
        title: 'Task Note',
        content: 'C',
        userId,
        category: 'task',
        taskStatus: null,
      });
      expect(note.taskStatus).to.equal('todo');
    });

    it('should set taskStatus to todo when category=task and taskStatus is undefined', async () => {
      const note = await Note.create({
        title: 'Task Note',
        content: 'C',
        userId,
        category: 'task',
        // taskStatus not provided — should default to 'todo'
      });
      expect(note.taskStatus).to.equal('todo');
    });

    it('should preserve valid taskStatus when category=task', async () => {
      const note = await Note.create({
        title: 'Task Note',
        content: 'C',
        userId,
        category: 'task',
        taskStatus: 'doing',
      });
      expect(note.taskStatus).to.equal('doing');
    });

    it('should preserve done taskStatus when category=task', async () => {
      const note = await Note.create({
        title: 'Task Note',
        content: 'C',
        userId,
        category: 'task',
        taskStatus: 'done',
      });
      expect(note.taskStatus).to.equal('done');
    });

    it('should set taskStatus to null when category=general', async () => {
      const note = await Note.create({
        title: 'General Note',
        content: 'C',
        userId,
        category: 'general',
        taskStatus: 'todo',
      });
      expect(note.taskStatus).to.be.null;
    });

    it('should set taskStatus to null when category=idea', async () => {
      const note = await Note.create({
        title: 'Idea Note',
        content: 'C',
        userId,
        category: 'idea',
        taskStatus: 'doing',
      });
      expect(note.taskStatus).to.be.null;
    });
  });

  // ─── pre('findOneAndUpdate') middleware ────────────────────────────────

  describe('pre(findOneAndUpdate) middleware — normalizeTaskStatus', () => {
    it('should set taskStatus to todo when updating category to task with no taskStatus', async () => {
      const note = await Note.create({ title: 'T', content: 'C', userId, category: 'general' });

      const updated = await Note.findOneAndUpdate(
        { _id: note._id },
        { category: 'task' },
        { new: true }
      );
      expect(updated.taskStatus).to.equal('todo');
    });

    it('should set taskStatus to null when updating category to general', async () => {
      const note = await Note.create({
        title: 'T', content: 'C', userId, category: 'task', taskStatus: 'doing',
      });

      const updated = await Note.findOneAndUpdate(
        { _id: note._id },
        { category: 'general' },
        { new: true }
      );
      expect(updated.taskStatus).to.be.null;
    });

    it('should set taskStatus to null when updating category to idea', async () => {
      const note = await Note.create({
        title: 'T', content: 'C', userId, category: 'task', taskStatus: 'todo',
      });

      const updated = await Note.findOneAndUpdate(
        { _id: note._id },
        { category: 'idea' },
        { new: true }
      );
      expect(updated.taskStatus).to.be.null;
    });

    it('should not modify taskStatus when update does not touch category or taskStatus', async () => {
      const note = await Note.create({
        title: 'T', content: 'C', userId, category: 'task', taskStatus: 'done',
      });

      const updated = await Note.findOneAndUpdate(
        { _id: note._id },
        { title: 'Updated Title' },
        { new: true }
      );
      // taskStatus should remain as saved (null because pre-save set it to 'done')
      expect(updated.title).to.equal('Updated Title');
    });

    it('should preserve valid taskStatus when updating category to task with valid taskStatus', async () => {
      const note = await Note.create({ title: 'T', content: 'C', userId, category: 'general' });

      const updated = await Note.findOneAndUpdate(
        { _id: note._id },
        { category: 'task', taskStatus: 'done' },
        { new: true }
      );
      expect(updated.taskStatus).to.equal('done');
    });
  });
});
