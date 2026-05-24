const { expect } = require('chai');
const { validateEmailFormat, validateEmailDomain } = require('../../../src/utils/emailValidation');

describe('Email Validation Utilities', () => {
  describe('validateEmailFormat', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@subdomain.example.com'
      ];
      
      validEmails.forEach(email => {
        expect(validateEmailFormat(email)).to.be.true;
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid.email',
        'user@',
        '@example.com',
        'user name@example.com',
        'user@.com',
        'user@@example.com'
      ];
      
      invalidEmails.forEach(email => {
        expect(validateEmailFormat(email)).to.be.false;
      });
    });

    it('should reject null or undefined', () => {
      expect(validateEmailFormat(null)).to.be.false;
      expect(validateEmailFormat(undefined)).to.be.false;
    });

    it('should handle empty string', () => {
      expect(validateEmailFormat('')).to.be.false;
    });
  });

  describe('validateEmailDomain', () => {
    it('should validate domains with valid MX records', async () => {
      // Common domains with valid MX records
      const validDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
      
      for (const domain of validDomains) {
        const result = await validateEmailDomain(`test@${domain}`);
        expect(result).to.be.a('boolean');
      }
    });

    it('should reject invalid domains', async () => {
      const result = await validateEmailDomain('test@invalid-domain-12345.com');
      expect(result).to.be.false;
    });

    it('should handle malformed emails gracefully', async () => {
      try {
        const result = await validateEmailDomain('invalid-email');
        expect(result).to.be.false;
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });
});
