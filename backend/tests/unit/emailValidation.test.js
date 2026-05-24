const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const dns = require('node:dns').promises;
const { validateEmailFormat, validateEmailDomain } = require('../../src/utils/emailValidation');

describe('Email Validation Utilities', () => {
  describe('validateEmailFormat', () => {
    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.com',
        'user_name@example.com',
        'user123@test-domain.com',
        'a@b.co',
      ];

      validEmails.forEach((email) => {
        expect(validateEmailFormat(email)).to.be.true;
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
        'user@domain',
        'user@@example.com',
        '',
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmailFormat(email)).to.be.false;
      });
    });

    it('should be case-insensitive', () => {
      expect(validateEmailFormat('User@Example.COM')).to.be.true;
      expect(validateEmailFormat('USER@EXAMPLE.COM')).to.be.true;
    });

    it('should accept emails with numbers and special characters', () => {
      expect(validateEmailFormat('user123+test@example.com')).to.be.true;
      expect(validateEmailFormat('first.last@sub.example.co.uk')).to.be.true;
    });
  });

  describe('validateEmailDomain', () => {
    let resolveMxStub;

    beforeEach(() => {
      resolveMxStub = sinon.stub(dns, 'resolveMx');
    });

    afterEach(() => {
      resolveMxStub.restore();
    });

    it('should return true when MX records exist', async () => {
      resolveMxStub.resolves([{ priority: 10, exchange: 'mail.example.com' }]);
      const result = await validateEmailDomain('user@example.com');
      expect(result).to.be.true;
    });

    it('should return true for known valid domains even if DNS fails', async () => {
      resolveMxStub.rejects(new Error('DNS lookup failed'));
      const result = await validateEmailDomain('user@gmail.com');
      expect(result).to.be.true;
    });

    it('should return true for multiple known valid domains', async () => {
      resolveMxStub.rejects(new Error('DNS lookup failed'));
      
      const knownDomains = [
        'user@gmail.com',
        'test@yahoo.com',
        'admin@outlook.com',
        'dev@hotmail.com',
        'hello@icloud.com',
      ];

      for (const email of knownDomains) {
        const result = await validateEmailDomain(email);
        expect(result).to.be.true;
      }
    });

    it('should return false for unknown domain if DNS fails', async () => {
      resolveMxStub.rejects(new Error('DNS lookup failed'));
      const result = await validateEmailDomain('user@unknowndomain123xyz.com');
      expect(result).to.be.false;
    });

    it('should return false for invalid email format', async () => {
      const result = await validateEmailDomain('notanemail');
      expect(result).to.be.false;
    });

    it('should return false when MX records array is empty', async () => {
      resolveMxStub.resolves([]);
      const result = await validateEmailDomain('user@example.com');
      expect(result).to.be.false;
    });

    it('should extract domain correctly for complex emails', async () => {
      resolveMxStub.resolves([{ priority: 10, exchange: 'mail.example.com' }]);
      const result = await validateEmailDomain('user+tag@example.com');
      expect(result).to.be.true;
      expect(resolveMxStub.calledWith('example.com')).to.be.true;
    });

    it('should be case-insensitive for known domains', async () => {
      resolveMxStub.rejects(new Error('DNS lookup failed'));
      const result1 = await validateEmailDomain('user@GMAIL.COM');
      const result2 = await validateEmailDomain('user@Gmail.Com');
      expect(result1).to.be.true;
      expect(result2).to.be.true;
    });

    it('should handle DNS errors gracefully', async () => {
      resolveMxStub.rejects(new Error('Network timeout'));
      const result = await validateEmailDomain('user@example.com');
      // Unknown domain fails gracefully
      expect(result).to.be.false;
    });

    it('should return true for known valid domains with uppercase', async () => {
      resolveMxStub.rejects(new Error('DNS lookup failed'));
      const result = await validateEmailDomain('test@PROTONMAIL.COM');
      expect(result).to.be.true;
    });
  });

  describe('Integration: Email validation flow', () => {
    let resolveMxStub;

    beforeEach(() => {
      resolveMxStub = sinon.stub(dns, 'resolveMx');
    });

    afterEach(() => {
      resolveMxStub.restore();
    });

    it('should validate format first, then domain', async () => {
      // Invalid format should not call DNS
      const result = await validateEmailDomain('notanemail');
      expect(result).to.be.false;
      expect(resolveMxStub.called).to.be.false;
    });

    it('should handle valid format but failed domain check', async () => {
      resolveMxStub.rejects(new Error('DNS failed'));
      const result = await validateEmailDomain('user@unknown-domain-xyz.com');
      expect(result).to.be.false;
    });
  });
});
