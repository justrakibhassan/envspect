import { EnvEntry, DiffResult } from '../types/index.js';

export interface DiffOptions {
  strict?: boolean;
}

/**
 * Compares two sets of parsed environment entries and returns the differences.
 * @param source - entries from .env.example (the reference/template)
 * @param target - entries from .env (the actual file)
 * @param options - optional diff options
 */
export function diffEnvFiles(source: EnvEntry[], target: EnvEntry[], options: DiffOptions = {}): DiffResult {
  const sourceMap = new Map<string, EnvEntry>();
  const targetMap = new Map<string, EnvEntry>();

  // Map source keys, ignoring comments
  for (const entry of source) {
    if (!entry.isComment && entry.key) {
      sourceMap.set(entry.key, entry);
    }
  }

  // Map target keys, ignoring comments
  for (const entry of target) {
    if (!entry.isComment && entry.key) {
      targetMap.set(entry.key, entry);
    }
  }

  const missing: EnvEntry[] = [];
  const extra: EnvEntry[] = [];
  const empty: EnvEntry[] = [];
  let matched = 0;

  // Check for missing keys (in source/example but not in target/.env)
  for (const [key, entry] of sourceMap.entries()) {
    if (!targetMap.has(key)) {
      missing.push(entry);
    } else {
      matched++;
    }
  }

  // Check for extra and empty keys (in target/.env but not in source/example)
  for (const [key, entry] of targetMap.entries()) {
    if (!sourceMap.has(key)) {
      extra.push(entry);
    }
    if (entry.value.trim() === '') {
      empty.push(entry);
    }
  }

  return {
    missing,
    extra,
    empty,
    matched,
    sourceFile: 'source',
    targetFile: 'target',
  };
}

