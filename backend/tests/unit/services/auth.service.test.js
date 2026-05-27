const { expect } = require('chai');
const sinon = require('sinon');
const { connect, disconnect, clear } = require('../../helpers/testDb');
const { generateToken } = require('../../../src/services/auth.service');
const jwt = require('jsonwebtoken');

describe('Auth Service', () => {
  before(async () => {
    await connect();
  });
  afterEach(async () => await clear());
  after(async () => {
    sinon.restore();
    await disconnect();
  });

  describe('generateToken()', () => {
    it('should generate a valid JWT token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateToken(userId);
      
      expect(token).to.be.a('string');
      const decoded = jwt.decode(token);
      expect(decoded.id).to.equal(userId);
    });

    it('should generate different tokens for different userIds', () => {
      const token1 = generateToken('507f1f77bcf86cd799439011');
      const token2 = generateToken('507f1f77bcf86cd799439012');
      expect(token1).to.not.equal(token2);
    });

    it('should generate tokens with correct expiration', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateToken(userId);
      const decoded = jwt.decode(token);
      
      expect(decoded).to.have.property('iat');
      expect(decoded).to.have.property('exp');
    });

    it('should be decodable as valid JWT', () => {
      const userId = 'test-user-123';
      const token = generateToken(userId);
      
      expect(() => {
        jwt.decode(token);
      }).to.not.throw();
    });

    it('should handle empty userId', () => {
      const token = generateToken('');
      expect(token).to.be.a('string');
    });

    it('should handle special characters in userId', () => {
      const userId = '507f1f77bcf86cd799439011!@#$%';
      const token = generateToken(userId);
      expect(token).to.be.a('string');
    });

    it('should generate JWT with three parts', () => {
      const token = generateToken('test-user');
      const parts = token.split('.');
      expect(parts).to.have.lengthOf(3);
    });

    it('should validate token format is non-empty', () => {
      const token = generateToken('test-user');
      expect(token.length).to.be.greaterThan(0);
    });
  });

  describe('Error Handling for Token Generation', () => {
    it('should handle null userId gracefully', () => {
      expect(() => {
        generateToken(null);
      }).to.not.throw();
    });

    it('should handle undefined userId gracefully', () => {
      expect(() => {
        generateToken(undefined);
      }).to.not.throw();
    });

    it('should handle numeric userId', () => {
      const token = generateToken(123);
      expect(token).to.be.a('string');
    });
  });

  describe('Authentication Validation', () => {
    it('should validate token contains userId in payload', () => {
      const userId = 'user-auth-test-123';
      const token = generateToken(userId);
      const decoded = jwt.decode(token);
      
      expect(decoded.id).to.equal(userId);
    });

    it('should validate token structure', () => {
      const token = generateToken('test-user');
      const parts = token.split('.');
      
      expect(parts[0]).to.be.a('string');
      expect(parts[1]).to.be.a('string');
      expect(parts[2]).to.be.a('string');
    });
  });
});