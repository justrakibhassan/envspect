import { describe, it, expect } from 'vitest';
import { parseEnvContent } from '../src/core/parser.js';
import { diffEnvFiles } from '../src/core/differ.js';

describe('diffEnvFiles', () => {
  it('detects missing variables', () => {
    const example = parseEnvContent('A=1\nB=2\nC=3', '.env.example');
    const env = parseEnvContent('A=1', '.env');
    const diff = diffEnvFiles(example.entries, env.entries);

    expect(diff.missing).toHaveLength(2);
    expect(diff.missing.map(e => e.key)).toContain('B');
    expect(diff.missing.map(e => e.key)).toContain('C');
  });

  it('detects extra variables', () => {
    const example = parseEnvContent('A=1', '.env.example');
    const env = parseEnvContent('A=1\nEXTRA=yes', '.env');
    const diff = diffEnvFiles(example.entries, env.entries);

    expect(diff.extra).toHaveLength(1);
    expect(diff.extra[0].key).toBe('EXTRA');
  });

  it('detects empty variables', () => {
    const example = parseEnvContent('A=1\nB=2', '.env.example');
    const env = parseEnvContent('A=1\nB=', '.env');
    const diff = diffEnvFiles(example.entries, env.entries);

    expect(diff.empty).toHaveLength(1);
    expect(diff.empty[0].key).toBe('B');
  });

  it('counts matched variables', () => {
    const example = parseEnvContent('A=1\nB=2\nC=3', '.env.example');
    const env = parseEnvContent('A=x\nB=y\nC=z', '.env');
    const diff = diffEnvFiles(example.entries, env.entries);

    expect(diff.matched).toBe(3);
    expect(diff.missing).toHaveLength(0);
    expect(diff.extra).toHaveLength(0);
  });

  it('ignores comment entries', () => {
    const example = parseEnvContent('# comment\nA=1', '.env.example');
    const env = parseEnvContent('A=1', '.env');
    const diff = diffEnvFiles(example.entries, env.entries);

    expect(diff.missing).toHaveLength(0);
    expect(diff.matched).toBe(1);
  });

  it('handles completely empty files', () => {
    const example = parseEnvContent('', '.env.example');
    const env = parseEnvContent('', '.env');
    const diff = diffEnvFiles(example.entries, env.entries);

    expect(diff.missing).toHaveLength(0);
    expect(diff.extra).toHaveLength(0);
    expect(diff.matched).toBe(0);
  });
});
