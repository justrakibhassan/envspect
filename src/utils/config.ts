import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { existsSync } from 'node:fs';
import type { EnvspectConfig } from '../types/index.js';
import { log } from './logger.js';

/** Config file names to search for, in priority order */
const CONFIG_FILES = [
  '.envspectrc',
  '.envspectrc.json',
  'envspect.config.json',
] as const;

/**
 * Loads the envspect config file from the project root.
 * Searches for config files in priority order and returns the first found.
 * Returns an empty config object if no config file exists.
 */
export async function loadConfig(cwd?: string): Promise<EnvspectConfig> {
  const root = resolve(cwd || process.cwd());

  for (const fileName of CONFIG_FILES) {
    const filePath = join(root, fileName);

    if (!existsSync(filePath)) continue;

    try {
      const content = await readFile(filePath, 'utf-8');
      const config: EnvspectConfig = JSON.parse(content);
      log.debug(`Loaded config from ${fileName}`);
      return config;
    } catch (err) {
      log.warn(`Failed to parse config file: ${fileName}`);
      log.debug(String(err));
      return {};
    }
  }

  log.debug('No config file found, using defaults');
  return {};
}

/** Default config values */
export const defaults: Required<Pick<EnvspectConfig, 'envFile' | 'exampleFile' | 'format'>> & {
  scan: Required<NonNullable<EnvspectConfig['scan']>>;
  audit: Required<Pick<NonNullable<EnvspectConfig['audit']>, 'include' | 'exclude' | 'severity'>>;
} = {
  envFile: '.env',
  exampleFile: '.env.example',
  format: 'table',
  scan: {
    strict: false,
  },
  audit: {
    include: ['**/*.{ts,tsx,js,jsx,py,rb,go,java,php,rs,yaml,yml,toml,json,xml,sh}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/coverage/**',
      '**/*.min.js',
      '**/vendor/**',
      '**/package-lock.json',
      '**/pnpm-lock.yaml',
      '**/yarn.lock',
    ],
    severity: 'low',
  },
};
