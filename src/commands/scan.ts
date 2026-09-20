import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createSpinner } from 'nanospinner';
import type { ScanOptions, OutputFormat } from '../types/index.js';
import { ExitCode } from '../types/index.js';
import { parseEnvFile } from '../core/parser.js';
import { diffEnvFiles } from '../core/differ.js';
import { formatScanResult } from '../core/reporter.js';
import { log } from '../utils/logger.js';
import { loadConfig, defaults } from '../utils/config.js';

export async function runScan(options: Partial<ScanOptions>): Promise<void> {
  const cwd = options.cwd || process.cwd();
  const config = await loadConfig(cwd);
  const finalOptions: ScanOptions = {
    envFile: options.envFile ?? config.envFile ?? defaults.envFile,
    exampleFile: options.exampleFile ?? config.exampleFile ?? defaults.exampleFile,
    strict: options.strict ?? config.scan?.strict ?? defaults.scan.strict,
    format: (options.format ?? config.format ?? defaults.format) as OutputFormat,
    silent: options.silent ?? false,
    cwd,
  };

  const envPath = resolve(cwd, finalOptions.envFile);
  const examplePath = resolve(cwd, finalOptions.exampleFile);

  if (!existsSync(envPath)) {
    log.error(`Missing .env file at ${envPath}`);
    process.exit(ExitCode.FILE_NOT_FOUND);
  }

  if (!existsSync(examplePath)) {
    log.error(`Missing .env.example file at ${examplePath}`);
    process.exit(ExitCode.FILE_NOT_FOUND);
  }

  const spinner = createSpinner('Scanning environment files...').start();

  try {
    const start = performance.now();
    const envResult = await parseEnvFile(envPath);
    const exampleResult = await parseEnvFile(examplePath);

    if (envResult.errors.length > 0 || exampleResult.errors.length > 0) {
      spinner.error({ text: 'Failed to parse environment files' });
      process.exit(ExitCode.ERROR);
    }

    const diff = diffEnvFiles(exampleResult.entries, envResult.entries, {
      strict: finalOptions.strict,
    });

    // Set actual file paths on the diff result
    diff.sourceFile = examplePath;
    diff.targetFile = envPath;

    const duration = performance.now() - start;

    spinner.success({ text: 'Scan complete' });

    const output = formatScanResult({ diff, duration }, finalOptions.format);
    console.log(output);

    if (diff.missing.length > 0 || diff.extra.length > 0) {
      process.exit(ExitCode.SCAN_ISSUES_FOUND);
    } else {
      process.exit(ExitCode.SUCCESS);
    }
  } catch (error) {
    spinner.error({ text: 'An unexpected error occurred during scan' });
    if (error instanceof Error) {
      log.error(error.message);
    }
    process.exit(ExitCode.ERROR);
  }
}
