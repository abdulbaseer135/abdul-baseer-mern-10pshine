const { expect } = require('chai');
const ApiResponse = require('../../../src/utils/ApiResponse');

describe('ApiResponse Utility', () => {
  it('should create an ApiResponse with statusCode and data', () => {
    const data = { id: 1, name: 'Test' };
    const response = new ApiResponse(200, data, 'Success');
    
    expect(response.statusCode).to.equal(200);
    expect(response.data).to.deep.equal(data);
    expect(response.message).to.equal('Success');
  });

  it('should set success to true for 2xx status codes', () => {
    const response200 = new ApiResponse(200, {}, 'OK');
    const response201 = new ApiResponse(201, {}, 'Created');
    const response204 = new ApiResponse(204, {}, 'No Content');
    
    expect(response200.success).to.be.true;
    expect(response201.success).to.be.true;
    expect(response204.success).to.be.true;
  });

  it('should set success to false for 4xx and 5xx status codes', () => {
    const response400 = new ApiResponse(400, null, 'Bad Request');
    const response404 = new ApiResponse(404, null, 'Not Found');
    const response500 = new ApiResponse(500, null, 'Server Error');
    
    expect(response400.success).to.be.false;
    expect(response404.success).to.be.false;
    expect(response500.success).to.be.false;
  });

  it('should use default message when not provided', () => {
    const response = new ApiResponse(200, {});
    expect(response.message).to.equal('Success');
  });

  it('should handle null data', () => {
    const response = new ApiResponse(204, null, 'No Content');
    expect(response.data).to.be.null;
  });

  it('should handle complex data objects', () => {
    const complexData = {
      user: { id: 1, name: 'Test', email: 'test@test.com' },
      metadata: { total: 10, page: 1 },
      items: [1, 2, 3]
    };
    const response = new ApiResponse(200, complexData);
    expect(response.data).to.deep.equal(complexData);
  });

  it('should preserve all properties', () => {
    const response = new ApiResponse(201, { id: 1 }, 'Created');
    expect(response).to.have.all.keys('statusCode', 'data', 'message', 'success');
  });

  // ─── toJSON() coverage ────────────────────────────────────────────────

  it('toJSON() should return a plain object with all four fields', () => {
    const data = { id: 42 };
    const response = new ApiResponse(200, data, 'OK');
    const json = response.toJSON();

    expect(json).to.deep.equal({
      statusCode: 200,
      data: { id: 42 },
      message: 'OK',
      success: true,
    });
  });

  it('toJSON() should NOT return an ApiResponse instance', () => {
    const response = new ApiResponse(200, {}, 'OK');
    const json = response.toJSON();
    expect(json).to.not.be.instanceof(ApiResponse);
  });

  it('toJSON() should reflect success=false for error responses', () => {
    const response = new ApiResponse(404, null, 'Not Found');
    const json = response.toJSON();

    expect(json.success).to.be.false;
    expect(json.statusCode).to.equal(404);
    expect(json.data).to.be.null;
    expect(json.message).to.equal('Not Found');
  });

  it('toJSON() should work with default message', () => {
    const response = new ApiResponse(201, { created: true });
    const json = response.toJSON();

    expect(json.message).to.equal('Success');
    expect(json.success).to.be.true;
  });
});
