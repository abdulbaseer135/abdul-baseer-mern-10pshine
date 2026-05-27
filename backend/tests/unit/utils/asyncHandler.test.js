const { expect } = require('chai');
const sinon = require('sinon');
const asyncHandler = require('../../../src/utils/asyncHandler');

describe('asyncHandler Middleware', () => {
  it('should execute the provided function', async () => {
    const mockFn = sinon.stub().resolves('success');
    const handler = asyncHandler(mockFn);
    
    const req = {};
    const res = {};
    const next = sinon.stub();
    
    await handler(req, res, next);
    
    expect(mockFn.calledOnce).to.be.true;
  });

  it('should pass req, res, next to the function', async () => {
    const mockFn = sinon.stub().resolves();
    const handler = asyncHandler(mockFn);
    
    const req = { body: { test: 'data' } };
    const res = { send: () => {} };
    const next = sinon.stub();
    
    await handler(req, res, next);
    
    expect(mockFn.calledWith(req, res, next)).to.be.true;
  });

  it('should call next with error when function throws', async () => {
    const error = new Error('Test error');
    const mockFn = sinon.stub().rejects(error);
    const handler = asyncHandler(mockFn);
    
    const req = {};
    const res = {};
    const next = sinon.stub();
    
    await handler(req, res, next);
    
    expect(next.calledWith(error)).to.be.true;
  });

  it('should handle async errors gracefully', async () => {
    const mockFn = sinon.stub().rejects(new Error('Async error'));
    const handler = asyncHandler(mockFn);
    
    const req = {};
    const res = {};
    const next = sinon.stub();
    
    await handler(req, res, next);
    
    expect(next.called).to.be.true;
  });

  it('should not call next on successful execution', async () => {
    const mockFn = sinon.stub().resolves('success');
    const handler = asyncHandler(mockFn);
    
    const req = {};
    const res = { json: sinon.stub() };
    const next = sinon.stub();
    
    await handler(req, res, next);
    
    expect(next.called).to.be.false;
  });

  it('should work with multiple sequential calls', async () => {
    const mockFn1 = sinon.stub().resolves('first');
    const mockFn2 = sinon.stub().resolves('second');
    
    const handler1 = asyncHandler(mockFn1);
    const handler2 = asyncHandler(mockFn2);
    
    const req = {};
    const res = {};
    const next = sinon.stub();
    
    await handler1(req, res, next);
    await handler2(req, res, next);
    
    expect(mockFn1.calledOnce).to.be.true;
    expect(mockFn2.calledOnce).to.be.true;
  });
});
