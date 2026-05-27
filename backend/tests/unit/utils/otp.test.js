const { expect } = require('chai');
const { generateOTP, hashOTP, verifyOTP } = require('../../../src/utils/otp');

describe('OTP Utility', () => {
  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = generateOTP();
      expect(otp).to.be.a('string');
      expect(otp).to.match(/^\d{6}$/);
    });

    it('should generate different OTPs on multiple calls', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      expect(otp1).to.not.equal(otp2);
    });

    it('should only contain numeric digits', () => {
      for (let i = 0; i < 10; i++) {
        const otp = generateOTP();
        expect(/^\d+$/.test(otp)).to.be.true;
      }
    });
  });

  describe('hashOTP', () => {
    it('should hash an OTP string', () => {
      const otp = '123456';
      const hashed = hashOTP(otp);
      expect(hashed).to.be.a('string');
      expect(hashed).to.not.equal(otp);
    });

    it('should produce consistent hashes for the same OTP', () => {
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
  });

  describe('verifyOTP', () => {
    it('should verify a matching OTP', () => {
      const otp = '123456';
      const hashed = hashOTP(otp);
      const result = verifyOTP(hashed, otp);
      expect(result).to.be.true;
    });

    it('should reject a non-matching OTP', () => {
      const otp = '123456';
      const wrongOtp = '654321';
      const hashed = hashOTP(otp);
      const result = verifyOTP(hashed, wrongOtp);
      expect(result).to.be.false;
    });

    it('should handle invalid hash format gracefully', () => {
      const result = verifyOTP('invalid-hash', '123456');
      expect(result).to.be.false;
    });
  });
});
