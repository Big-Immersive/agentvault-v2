import { describe, it, expect } from 'vitest';
import { checkLicense } from '../../src/license/license.js';
import type { LicenseDescriptor } from '../../src/types/index.js';

describe('license', () => {
  describe('checkLicense', () => {
    it('should allow unlimited access', () => {
      const license: LicenseDescriptor = {
        name: 'test-bank',
        accessType: 'unlimited',
        issuedAt: new Date().toISOString(),
      };
      expect(checkLicense(license)).toEqual({ valid: true });
    });

    it('should allow valid time_locked', () => {
      const license: LicenseDescriptor = {
        name: 'test-bank',
        accessType: 'time_locked',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      };
      expect(checkLicense(license)).toEqual({ valid: true });
    });

    it('should reject expired time_locked', () => {
      const license: LicenseDescriptor = {
        name: 'test-bank',
        accessType: 'time_locked',
        issuedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        expiresAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
      };
      const result = checkLicense(license);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('expired');
    });

    it('should allow access_limited with remaining', () => {
      const license: LicenseDescriptor = {
        name: 'test-bank',
        accessType: 'access_limited',
        issuedAt: new Date().toISOString(),
        remainingAccesses: 5,
        maxAccesses: 10,
      };
      expect(checkLicense(license)).toEqual({ valid: true });
    });

    it('should reject access_limited with zero remaining', () => {
      const license: LicenseDescriptor = {
        name: 'test-bank',
        accessType: 'access_limited',
        issuedAt: new Date().toISOString(),
        remainingAccesses: 0,
        maxAccesses: 10,
      };
      const result = checkLicense(license);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Access limit');
    });

    it('should check both time and access for time_and_access', () => {
      const license: LicenseDescriptor = {
        name: 'test-bank',
        accessType: 'time_and_access',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        remainingAccesses: 5,
      };
      expect(checkLicense(license)).toEqual({ valid: true });
    });

    it('should reject expired subscription', () => {
      const license: LicenseDescriptor = {
        name: 'test-bank',
        accessType: 'subscription',
        issuedAt: new Date(Date.now() - 172800000).toISOString(),
        expiresAt: new Date(Date.now() - 86400000).toISOString(),
        subscriptionId: 'sub-123',
      };
      const result = checkLicense(license);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Subscription expired');
    });
  });
});
