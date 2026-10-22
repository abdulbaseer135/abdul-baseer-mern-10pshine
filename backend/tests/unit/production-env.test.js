const { expect } = require('chai');
const { assertRequiredEnv } = require('../../src/config/env');

describe('Production environment validation', () => {
  let previous;
  const valid = {
    NODE_ENV: 'production', MONGO_URI: 'mongodb://127.0.0.1:27017/disposable',
    JWT_SECRET: 'a'.repeat(48), FRONTEND_URL: 'https://notes.example.com', CLIENT_URL: 'https://notes.example.com',
    BACKEND_URL: 'https://api.example.com', EMAIL_FROM: 'notes@example.com',
    RESEND_API_KEY: 'test-only', CLOUDINARY_CLOUD_NAME: 'test-only',
    CLOUDINARY_API_KEY: 'test-only', CLOUDINARY_API_SECRET: 'test-only',
  };
  beforeEach(() => {
    previous = { ...process.env };
    Object.assign(process.env, valid);
  });
  afterEach(() => { process.env = previous; });
  it('accepts complete deployment configuration', () => expect(assertRequiredEnv).not.to.throw());
  it('rejects a weak JWT secret', () => {
    process.env.JWT_SECRET = 'short';
    expect(assertRequiredEnv).to.throw('JWT_SECRET');
  });
  it('rejects missing origins and HTTP production URLs', () => {
    delete process.env.FRONTEND_URL;
    expect(assertRequiredEnv).to.throw('FRONTEND_URL');
    process.env.FRONTEND_URL = 'http://localhost:3000';
    expect(assertRequiredEnv).to.throw('FRONTEND_URL');
  });
  it('rejects incomplete durable upload configuration', () => {
    delete process.env.CLOUDINARY_API_SECRET;
    expect(assertRequiredEnv).to.throw('CLOUDINARY');
  });
  it('rejects missing email configuration', () => {
    delete process.env.EMAIL_FROM;
    expect(assertRequiredEnv).to.throw('EMAIL_FROM');
  });
  it('allows development without production service credentials', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.EMAIL_FROM;
    delete process.env.CLOUDINARY_API_SECRET;
    expect(assertRequiredEnv).not.to.throw();
  });
});
