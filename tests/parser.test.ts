import { describe, it, expect } from 'vitest';
import { parseEnvContent } from '../src/core/parser.js';

describe('parseEnvContent', () => {
  it('parses simple KEY=value pairs', () => {
    const content = 'APP_NAME=MyApp\nAPP_PORT=3000';
    const result = parseEnvContent(content, '.env');

    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].key).toBe('APP_NAME');
    expect(result.entries[0].value).toBe('MyApp');
    expect(result.entries[1].key).toBe('APP_PORT');
    expect(result.entries[1].value).toBe('3000');
  });

  it('handles double-quoted values', () => {
    const content = 'MSG="hello world"';
    const result = parseEnvContent(content);

    expect(result.entries[0].value).toBe('hello world');
  });

  it('handles single-quoted values', () => {
    const content = "MSG='hello world'";
    const result = parseEnvContent(content);

    expect(result.entries[0].value).toBe('hello world');
  });

  it('handles empty values', () => {
    const content = 'EMPTY_VAR=';
    const result = parseEnvContent(content);

    expect(result.entries[0].key).toBe('EMPTY_VAR');
    expect(result.entries[0].value).toBe('');
  });

  it('skips comment lines', () => {
    const content = '# this is a comment\nKEY=value';
    const result = parseEnvContent(content);

    const vars = result.entries.filter(e => !e.isComment);
    expect(vars).toHaveLength(1);
    expect(vars[0].key).toBe('KEY');
  });

  it('skips empty lines', () => {
    const content = 'A=1\n\n\nB=2';
    const result = parseEnvContent(content);

    const vars = result.entries.filter(e => !e.isComment);
    expect(vars).toHaveLength(2);
  });

  it('handles export prefix', () => {
    const content = 'export MY_VAR=hello';
    const result = parseEnvContent(content);

    const vars = result.entries.filter(e => !e.isComment);
    expect(vars[0].key).toBe('MY_VAR');
    expect(vars[0].value).toBe('hello');
  });

  it('handles inline comments on unquoted values', () => {
    const content = 'KEY=value # this is a comment';
    const result = parseEnvContent(content);

    expect(result.entries[0].value).toBe('value');
  });

  it('preserves # inside quoted values', () => {
    const content = 'KEY="value#with#hashes"';
    const result = parseEnvContent(content);

    expect(result.entries[0].value).toBe('value#with#hashes');
  });

  it('tracks line numbers correctly', () => {
    const content = '# comment\nA=1\n\nB=2';
    const result = parseEnvContent(content);

    const vars = result.entries.filter(e => !e.isComment);
    expect(vars[0].line).toBe(2);
    expect(vars[1].line).toBe(4);
  });

  it('returns errors for malformed lines', () => {
    const content = 'VALID=yes\nthis is not valid\nALSO_VALID=yes';
    const result = parseEnvContent(content);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].line).toBe(2);
  });
});
