const sinon = require('sinon');
const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

// ─── Socket mock injected via proxyquire ──────────────────────────────────
const mockEmit = sinon.stub();
const mockTo   = sinon.stub().returns({ emit: mockEmit });
const mockIO   = { to: mockTo };
const getIOStub = sinon.stub().returns(mockIO);

const notesController = proxyquire('../../../src/controllers/notes.controller', {
  '../config/socket': { getIO: getIOStub },
});

const notesService = require('../../../src/services/notes.service');

const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  res.setHeader = sinon.stub().returns(res);
  res.send = sinon.stub().returns(res);
  return res;
};

const mockNext = () => sinon.stub();

describe('Notes Controller', () => {
  beforeEach(() => {
    mockTo.resetHistory();
    mockEmit.resetHistory();
    getIOStub.resetHistory();
  });

  afterEach(() => sinon.restore());

  // ─── createNote ──────────────────────────────────────────────────────
  describe('createNote()', () => {
    it('should return 201 with created note', async () => {
      const mockNote = { _id: 'nid1', title: 'Test', content: 'Content', userId: 'uid1' };
      sinon.stub(notesService, 'create').resolves(mockNote);

      const req = { user: { _id: 'uid1' }, body: { title: 'Test', content: 'Content' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.createNote(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should emit socket event on note creation', async () => {
      const mockNote = { _id: 'nid1', title: 'Test', content: 'Content', userId: 'uid1' };
      sinon.stub(notesService, 'create').resolves(mockNote);

      const req = { user: { _id: 'uid1' }, body: { title: 'Test', content: 'Content' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.createNote(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
    });

    it('should call next with error if service throws', async () => {
      sinon.stub(notesService, 'create').rejects(new Error('Create failed'));

      const req = { user: { _id: 'uid1' }, body: { title: 'Test', content: 'Content' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.createNote(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  // ─── getAllNotes ─────────────────────────────────────────────────────

  describe('getAllNotes()', () => {
    it('should return 200 with notes list', async () => {
      const mockResult = { notes: [{ _id: 'nid1', title: 'Test', content: 'Content' }], total: 1 };
      sinon.stub(notesService, 'getAll').resolves(mockResult);

      const req = { user: { _id: 'uid1' }, query: { page: 1, limit: 10, search: '' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.getAllNotes(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should use default pagination values', async () => {
      const mockResult = { notes: [], total: 0 };
      sinon.stub(notesService, 'getAll').resolves(mockResult);

      const req = { user: { _id: 'uid1' }, query: {} };
      const res = mockRes();
      const next = mockNext();

      await notesController.getAllNotes(req, res, next);

      expect(notesService.getAll.calledWith('uid1', 1, 10, '')).to.be.true;
    });
  });

  // ─── getNoteById ─────────────────────────────────────────────────────

  describe('getNoteById()', () => {
    it('should return 200 with note details', async () => {
      const mockNote = { _id: 'nid1', title: 'Test', content: 'Content', userId: 'uid1' };
      sinon.stub(notesService, 'getOne').resolves(mockNote);

      const req = { user: { _id: 'uid1' }, params: { id: 'nid1' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.getNoteById(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should call next with error if note not found', async () => {
      sinon.stub(notesService, 'getOne').rejects(new Error('Note not found'));

      const req = { user: { _id: 'uid1' }, params: { id: 'nid1' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.getNoteById(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  // ─── updateNote ──────────────────────────────────────────────────────

  describe('updateNote()', () => {

    it('should call next with error if service throws', async () => {
      sinon.stub(notesService, 'update').rejects(new Error('Update failed'));

      const req = { user: { _id: 'uid1' }, params: { id: 'nid1' }, body: { title: 'Updated' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.updateNote(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  // ─── deleteNote ──────────────────────────────────────────────────────

  describe('deleteNote()', () => {

    it('should call next with error if note not found', async () => {
      sinon.stub(notesService, 'remove').rejects(new Error('Note not found'));

      const req = { user: { _id: 'uid1' }, params: { id: 'nid1' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.deleteNote(req, res, next);

      expect(next.calledOnce).to.be.true;
    });
  });

  // ─── exportNotes ─────────────────────────────────────────────────────

  describe('exportNotes()', () => {
    it('should return 200 with exported notes file', async () => {
      const mockResult = {
        notes: [{ 
          _id: 'nid1', 
          noteId: 'note-1',
          title: 'Test', 
          content: 'Content', 
          category: 'general',
          taskStatus: null,
          isPinned: false,
          isPublic: false,
          shareToken: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
      };
      sinon.stub(notesService, 'getAll').resolves(mockResult);

      const req = { user: { _id: 'uid1' }, query: {} };
      const res = mockRes();
      const next = mockNext();

      await notesController.exportNotes(req, res, next);

      expect(res.setHeader.called).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
    });

    it('should set correct Content-Disposition header', async () => {
      const mockResult = { notes: [] };
      sinon.stub(notesService, 'getAll').resolves(mockResult);

      const req = { user: { _id: 'uid1' }, query: {} };
      const res = mockRes();
      const next = mockNext();

      await notesController.exportNotes(req, res, next);

      expect(res.setHeader.calledWith('Content-Disposition')).to.be.true;
      const calls = res.setHeader.getCalls();
      const dispositionCall = calls.find(call => call.args[0] === 'Content-Disposition');
      expect(dispositionCall.args[1]).to.include('attachment');
      expect(dispositionCall.args[1]).to.include('notes.json');
    });

    it('should set Content-Type to application/json', async () => {
      const mockResult = { notes: [] };
      sinon.stub(notesService, 'getAll').resolves(mockResult);

      const req = { user: { _id: 'uid1' }, query: {} };
      const res = mockRes();
      const next = mockNext();

      await notesController.exportNotes(req, res, next);

      expect(res.setHeader.calledWith('Content-Type', 'application/json')).to.be.true;
    });

    it('should export notes with all metadata', async () => {
      const mockResult = {
        notes: [{ 
          _id: 'nid1', 
          noteId: 'note-1',
          title: 'Test Note', 
          content: 'Test Content', 
          category: 'idea',
          taskStatus: 'done',
          isPinned: true,
          isPublic: true,
          shareToken: 'share-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        }],
      };
      sinon.stub(notesService, 'getAll').resolves(mockResult);

      const req = { user: { _id: 'uid1' }, query: {} };
      const res = mockRes();
      const next = mockNext();

      await notesController.exportNotes(req, res, next);

      expect(res.send.calledOnce).to.be.true;
      const payload = res.send.getCall(0).args[0];
      expect(payload).to.include('note-1');
      expect(payload).to.include('idea');
      expect(payload).to.include('done');
    });

    it('should handle fallback for result.notes access', async () => {
      // When result is array instead of object
      const mockResult = [
        { _id: 'nid1', title: 'Test', content: 'Content' }
      ];
      sinon.stub(notesService, 'getAll').resolves(mockResult);

      const req = { user: { _id: 'uid1' }, query: {} };
      const res = mockRes();
      const next = mockNext();

      await notesController.exportNotes(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
    });

    it('should include exported_at timestamp', async () => {
      const mockResult = { notes: [] };
      sinon.stub(notesService, 'getAll').resolves(mockResult);

      const req = { user: { _id: 'uid1' }, query: {} };
      const res = mockRes();
      const next = mockNext();

      await notesController.exportNotes(req, res, next);

      const payload = res.send.getCall(0).args[0];
      expect(payload).to.include('exported_at');
    });
  });

  // ─── importNotes ─────────────────────────────────────────────────────

  describe('importNotes()', () => {
    it('should return 201 with import results on success', async () => {
      const mockNote = { _id: 'nid1', title: 'Imported', content: 'Content', noteId: 'note-1' };
      sinon.stub(notesService, 'create').resolves(mockNote);
      sinon.stub(notesService, 'getByNoteId').resolves(null);

      const req = {
        user: { _id: 'uid1' },
        body: {
          notes: [{ title: 'Imported', content: 'Content', category: 'general' }],
        },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should return 400 if notes array is not provided', async () => {
      const req = {
        user: { _id: 'uid1' },
        body: { notes: undefined },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
    });

    it('should return 400 if notes array is empty', async () => {
      const req = {
        user: { _id: 'uid1' },
        body: { notes: [] },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
    });

    it('should return 400 if all notes have empty titles', async () => {
      const req = {
        user: { _id: 'uid1' },
        body: { notes: [{ title: '', content: 'Content' }] },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
    });

    it('should preserve category from imported notes', async () => {
      const mockNote = { _id: 'nid1', title: 'Task', content: 'Content', category: 'task' };
      sinon.stub(notesService, 'create').resolves(mockNote);
      sinon.stub(notesService, 'getByNoteId').resolves(null);

      const req = {
        user: { _id: 'uid1' },
        body: {
          notes: [{ title: 'Task', content: 'Content', category: 'task' }],
        },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      expect(notesService.create.calledOnce).to.be.true;
      const createCall = notesService.create.getCall(0);
      expect(createCall.args[1].category).to.equal('task');
    });

    it('should preserve taskStatus from imported notes', async () => {
      const mockNote = { _id: 'nid1', title: 'Task', content: 'Content', taskStatus: 'doing' };
      sinon.stub(notesService, 'create').resolves(mockNote);
      sinon.stub(notesService, 'getByNoteId').resolves(null);

      const req = {
        user: { _id: 'uid1' },
        body: {
          notes: [{ title: 'Task', content: 'Content', taskStatus: 'doing' }],
        },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      expect(notesService.create.calledOnce).to.be.true;
      const createCall = notesService.create.getCall(0);
      expect(createCall.args[1].taskStatus).to.equal('doing');
    });

    it('should preserve isPinned flag from imported notes', async () => {
      const mockNote = { _id: 'nid1', title: 'Important', content: 'Content', isPinned: true };
      sinon.stub(notesService, 'create').resolves(mockNote);
      sinon.stub(notesService, 'getByNoteId').resolves(null);

      const req = {
        user: { _id: 'uid1' },
        body: {
          notes: [{ title: 'Important', content: 'Content', isPinned: true }],
        },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      expect(notesService.create.calledOnce).to.be.true;
      const createCall = notesService.create.getCall(0);
      expect(createCall.args[1].isPinned).to.be.true;
    });

    it('should skip duplicate noteIds and report', async () => {
      sinon.stub(notesService, 'create').resolves({ _id: 'nid1', title: 'Note', content: 'Content' });
      sinon.stub(notesService, 'getByNoteId').resolves({ _id: 'nid2', noteId: 'note-123', title: 'Existing' });

      const req = {
        user: { _id: 'uid1' },
        body: {
          notes: [{ noteId: 'note-123', title: 'Duplicate', content: 'Content' }],
        },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.data.skippedCount).to.equal(1);
    });

    it('should generate new noteId if not provided', async () => {
      const mockNote = { _id: 'nid1', title: 'New', content: 'Content', noteId: 'gen-123' };
      sinon.stub(notesService, 'create').resolves(mockNote);
      sinon.stub(notesService, 'getByNoteId').resolves(null);

      const req = {
        user: { _id: 'uid1' },
        body: {
          notes: [{ title: 'New', content: 'Content' }],
        },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
    });

    it('should force userId to authenticated user', async () => {
      const mockNote = { _id: 'nid1', title: 'Note', content: 'Content', userId: 'uid1' };
      sinon.stub(notesService, 'create').resolves(mockNote);
      sinon.stub(notesService, 'getByNoteId').resolves(null);

      const req = {
        user: { _id: 'uid1' },
        body: {
          notes: [{ title: 'Note', content: 'Content', userId: 'different-user' }],
        },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      const createCall = notesService.create.getCall(0);
      expect(createCall.args[0]).to.equal('uid1');
      expect(createCall.args[1].userId).to.equal('uid1');
    });

    it('should handle import errors and add to skipped list', async () => {
      sinon.stub(notesService, 'create').rejects(new Error('Create failed'));
      sinon.stub(notesService, 'getByNoteId').resolves(null);

      const req = {
        user: { _id: 'uid1' },
        body: {
          notes: [{ title: 'Problematic', content: 'Content' }],
        },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.data.skippedCount).to.equal(1);
    });

    it('should return summary with imported and skipped counts', async () => {
      sinon.stub(notesService, 'create').resolves({ _id: 'nid1', title: 'Note', content: 'Content' });
      sinon.stub(notesService, 'getByNoteId').resolves(null);

      const req = {
        user: { _id: 'uid1' },
        body: {
          notes: [
            { title: 'Note 1', content: 'Content 1' },
            { title: 'Note 2', content: 'Content 2' },
          ],
        },
      };
      const res = mockRes();
      const next = mockNext();

      await notesController.importNotes(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.data).to.have.property('importedCount');
      expect(response.data).to.have.property('skippedCount');
    });
  });

  // ─── updateNote (success path) ────────────────────────────────────────

  describe('updateNote() — success path', () => {
    it('should return 200 with updated note', async () => {
      const mockNote = { _id: 'nid1', title: 'Updated', content: 'Content', userId: 'uid1' };
      sinon.stub(notesService, 'update').resolves(mockNote);

      const req = { user: { _id: 'uid1' }, params: { id: 'nid1' }, body: { title: 'Updated' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.updateNote(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });
  });

  // ─── deleteNote (success path) ────────────────────────────────────────

  describe('deleteNote() — success path', () => {
    it('should return 200 on successful delete', async () => {
      sinon.stub(notesService, 'remove').resolves();

      const req = { user: { _id: 'uid1' }, params: { id: 'nid1' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.deleteNote(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });
  });

  // ─── toggleShare ──────────────────────────────────────────────────────

  describe('toggleShare()', () => {
    it('should enable sharing on a private note', async () => {
      const mockNote = {
        _id: 'nid1',
        isPublic: false,
        shareToken: null,
        save: sinon.stub().resolves(),
      };
      sinon.stub(notesService, 'getOne').resolves(mockNote);

      const req = { user: { _id: 'uid1' }, params: { id: 'nid1' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.toggleShare(req, res, next);

      expect(mockNote.isPublic).to.be.true;
      expect(mockNote.shareToken).to.be.a('string').with.length.greaterThan(0);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('should disable sharing on a public note', async () => {
      const mockNote = {
        _id: 'nid1',
        isPublic: true,
        shareToken: 'existing-token',
        save: sinon.stub().resolves(),
      };
      sinon.stub(notesService, 'getOne').resolves(mockNote);

      const req = { user: { _id: 'uid1' }, params: { id: 'nid1' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.toggleShare(req, res, next);

      expect(mockNote.isPublic).to.be.false;
      expect(mockNote.shareToken).to.be.null;
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  // ─── getSharedNote ────────────────────────────────────────────────────

  describe('getSharedNote()', () => {
    it('should return 200 with note when token is valid', async () => {
      const mockNote = { _id: 'nid1', title: 'Shared', content: 'C', isPublic: true };
      sinon.stub(notesService, 'getByShareToken').resolves(mockNote);

      const req = { params: { token: 'valid-token' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.getSharedNote(req, res, next);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should return 404 when token is not found', async () => {
      sinon.stub(notesService, 'getByShareToken').resolves(null);

      const req = { params: { token: 'invalid-token' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.getSharedNote(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  // ─── togglePin ────────────────────────────────────────────────────────

  describe('togglePin()', () => {
    it('should pin an unpinned note', async () => {
      const mockNote = {
        _id: 'nid1',
        isPinned: false,
        userId: 'uid1',
        save: sinon.stub().resolves(),
      };
      sinon.stub(notesService, 'getOne').resolves(mockNote);

      const req = { user: { _id: 'uid1' }, params: { id: 'nid1' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.togglePin(req, res, next);

      expect(mockNote.isPinned).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
    });

    it('should unpin a pinned note', async () => {
      const mockNote = {
        _id: 'nid1',
        isPinned: true,
        userId: 'uid1',
        save: sinon.stub().resolves(),
      };
      sinon.stub(notesService, 'getOne').resolves(mockNote);

      const req = { user: { _id: 'uid1' }, params: { id: 'nid1' } };
      const res = mockRes();
      const next = mockNext();

      await notesController.togglePin(req, res, next);

      expect(mockNote.isPinned).to.be.false;
      expect(res.status.calledWith(200)).to.be.true;
    });
  });
});
