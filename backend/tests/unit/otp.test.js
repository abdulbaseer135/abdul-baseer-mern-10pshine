const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry } = require('../../src/utils/otp');

describe('OTP Utilities', () => {
  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = generateOTP();
      expect(otp).to.have.lengthOf(6);
      expect(/^\d{6}$/.test(otp)).to.be.true;
    });

    it('should generate OTPs within valid range (100000-999999)', () => {
      for (let i = 0; i < 100; i++) {
        const otp = parseInt(generateOTP());
        expect(otp).to.be.greaterThanOrEqual(100000);
        expect(otp).to.be.lessThanOrEqual(999999);
      }
    });

    it('should generate different OTPs on multiple calls', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      const otp3 = generateOTP();
      // High probability they're different (entropy test)
      const uniqueOtps = new Set([otp1, otp2, otp3]);
      expect(uniqueOtps.size).to.be.greaterThan(1);
    });
  });

  describe('hashOTP', () => {
    it('should return a 64-character hex string (SHA-256)', () => {
      const hash = hashOTP('123456');
      expect(hash).to.have.lengthOf(64);
      expect(/^[a-f0-9]{64}$/.test(hash)).to.be.true;
    });

    it('should hash the same OTP consistently', () => {
      const otp = '123456';
      const hash1 = hashOTP(otp);
      const hash2 = hashOTP(otp);
      expect(hash1).to.equal(hash2);
    });

    it('should produce different hashes for different OTPs', () => {
      const hash1 = hashOTP('123456');
      const hash2 = hashOTP('654321');
      expect(hash1).to.not.equal(hash2);
    });

    it('should handle empty string', () => {
      const hash = hashOTP('');
      expect(hash).to.have.lengthOf(64);
    });
  });

  describe('verifyOTP', () => {
    let otp;
    let hashedOtp;

    beforeEach(() => {
      otp = '123456';
      hashedOtp = hashOTP(otp);
    });

    it('should return true when OTP matches hash', () => {
      const result = verifyOTP(hashedOtp, otp);
      expect(result).to.be.true;
    });

    it('should return false when OTP does not match', () => {
      const result = verifyOTP(hashedOtp, '654321');
      expect(result).to.be.false;
    });

    it('should be case-sensitive', () => {
      const result = verifyOTP(hashedOtp, '123456 ');
      expect(result).to.be.false;
    });

    it('should return false for incorrect hash', () => {
      const wrongHash = hashOTP('000000');
      const result = verifyOTP(wrongHash, otp);
      expect(result).to.be.false;
    });

    it('should handle empty OTP', () => {
      const emptyHash = hashOTP('');
      const result = verifyOTP(emptyHash, '');
      expect(result).to.be.true;
    });
  });

  describe('getOTPExpiry', () => {
    it('should return a Date object', () => {
      const expiry = getOTPExpiry();
      expect(expiry).to.be.instanceOf(Date);
    });

    it('should return a future date (10 minutes from now)', () => {
      const now = Date.now();
      const expiry = getOTPExpiry();
      const expiryTime = expiry.getTime();
      const tenMinutesInMs = 10 * 60 * 1000;

      // Should be approximately 10 minutes in future (allow 1 second margin)
      expect(expiryTime).to.be.greaterThan(now + tenMinutesInMs - 1000);
      expect(expiryTime).to.be.lessThan(now + tenMinutesInMs + 1000);
    });

    it('should return different expirations for different calls', (done) => {
      const expiry1 = getOTPExpiry();
      setTimeout(() => {
        const expiry2 = getOTPExpiry();
        expect(expiry2.getTime()).to.be.greaterThan(expiry1.getTime());
        done();
      }, 100);
    });
  });

  describe('Integration: Full OTP flow', () => {
    it('should generate, hash, and verify OTP successfully', () => {
      const otp = generateOTP();
      const hashedOtp = hashOTP(otp);
      const isValid = verifyOTP(hashedOtp, otp);
      expect(isValid).to.be.true;
    });

    it('should fail verification if OTP is tampered with', () => {
      const otp = generateOTP();
      const hashedOtp = hashOTP(otp);
      const tamperedOtp = String(Number(otp) + 1);
      const isValid = verifyOTP(hashedOtp, tamperedOtp);
      expect(isValid).to.be.false;
    });
  });
});
