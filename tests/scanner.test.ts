import { describe, it, expect } from 'vitest';
import { defaultRules } from '../src/rules/default-rules.js';

describe('default audit rules', () => {
  it('detects AWS access key IDs', () => {
    const rule = defaultRules.find(r => r.id === 'aws-access-key')!;
    expect(rule.pattern.test('AKIAIOSFODNN7EXAMPLE')).toBe(true);
    expect(rule.pattern.test('not-an-aws-key')).toBe(false);
  });

  it('detects GitHub tokens', () => {
    const rule = defaultRules.find(r => r.id === 'github-token')!;
    expect(rule.pattern.test('ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn')).toBe(true);
    expect(rule.pattern.test('not-a-github-token')).toBe(false);
  });

  it('detects Stripe keys', () => {
    const rule = defaultRules.find(r => r.id === 'stripe-key')!;
    expect(rule.pattern.test('sk_test_1234567890abcdefghijklmn')).toBe(true);
    expect(rule.pattern.test('pk_live_1234567890abcdefghijklmn')).toBe(true);
    expect(rule.pattern.test('not-a-stripe-key')).toBe(false);
  });

  it('detects private keys', () => {
    const rule = defaultRules.find(r => r.id === 'private-key')!;
    expect(rule.pattern.test('-----BEGIN RSA PRIVATE KEY-----')).toBe(true);
    expect(rule.pattern.test('-----BEGIN PRIVATE KEY-----')).toBe(true);
    expect(rule.pattern.test('-----BEGIN PUBLIC KEY-----')).toBe(false);
  });

  it('detects database connection strings', () => {
    const rule = defaultRules.find(r => r.id === 'database-url')!;
    expect(rule.pattern.test('postgresql://admin:password123@db.host.com:5432/mydb')).toBe(true);
    expect(rule.pattern.test('mongodb+srv://user:pass@cluster.mongodb.net/db')).toBe(true);
    expect(rule.pattern.test('https://example.com')).toBe(false);
  });

  it('detects JWT tokens', () => {
    const rule = defaultRules.find(r => r.id === 'jwt-token')!;
    const fakeJwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123def456ghi789jkl012mno';
    expect(rule.pattern.test(fakeJwt)).toBe(true);
    expect(rule.pattern.test('not.a.jwt')).toBe(false);
  });

  it('has required fields on all rules', () => {
    for (const rule of defaultRules) {
      expect(rule.id).toBeTruthy();
      expect(rule.name).toBeTruthy();
      expect(rule.description).toBeTruthy();
      expect(rule.pattern).toBeInstanceOf(RegExp);
      expect(['critical', 'high', 'medium', 'low']).toContain(rule.severity);
      expect(typeof rule.allowInEnvFiles).toBe('boolean');
    }
  });
});
