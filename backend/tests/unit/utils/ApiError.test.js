const { expect } = require('chai');
const ApiError = require('../../../src/utils/ApiError');

describe('ApiError Utility', () => {
  it('should create an ApiError with statusCode and message', () => {
    const error = new ApiError(400, 'Bad Request');
    
    expect(error).to.be.instanceOf(Error);
    expect(error.statusCode).to.equal(400);
    expect(error.message).to.equal('Bad Request');
    expect(error.success).to.be.false;
  });

  it('should include errors array when provided', () => {
    const errors = [{ field: 'email', message: 'Invalid email' }];
    const error = new ApiError(422, 'Validation Failed', errors);
    
    expect(error.errors).to.deep.equal(errors);
  });

  it('should handle stack trace correctly', () => {
    const customStack = 'Custom stack trace';
    const error = new ApiError(500, 'Internal Server Error', [], customStack);
    
    expect(error.stack).to.equal(customStack);
  });

  it('should have correct HTTP status codes', () => {
    const badRequest = new ApiError(400, 'Bad Request');
    const unauthorized = new ApiError(401, 'Unauthorized');
    const notFound = new ApiError(404, 'Not Found');
    const conflict = new ApiError(409, 'Conflict');
    const serverError = new ApiError(500, 'Server Error');
    
    expect(badRequest.statusCode).to.equal(400);
    expect(unauthorized.statusCode).to.equal(401);
    expect(notFound.statusCode).to.equal(404);
    expect(conflict.statusCode).to.equal(409);
    expect(serverError.statusCode).to.equal(500);
  });

  it('should have success property as false', () => {
    const error = new ApiError(400, 'Error');
    expect(error.success).to.be.false;
  });

  it('should preserve error message', () => {
    const message = 'Custom error message';
    const error = new ApiError(400, message);
    expect(error.message).to.equal(message);
  });
});
