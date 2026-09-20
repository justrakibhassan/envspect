import { Command } from 'commander';
import { runScan } from './commands/scan.js';
import { runAudit } from './commands/audit.js';
import { runSync } from './commands/sync.js';
import type { OutputFormat } from './types/index.js';

const program = new Command();

program
  .name('envspect')
  .description('Zero-config .env validation, secret leak detection, and team sync CLI')
  .version('0.1.0')
  .option('-f, --format <type>', 'Output format (table, json, minimal)', 'table')
  .option('-s, --silent', 'Suppress non-essential output', false)
  .option('--cwd <path>', 'Working directory', process.cwd());

program
  .command('scan')
  .description('Compare .env against .env.example')
  .option('--env <file>', 'Path to .env file', '.env')
  .option('--example <file>', 'Path to .env.example file', '.env.example')
  .option('--strict', 'Enable strict mode (fails on extra variables in .env)', false)
  .action(async (options) => {
    const globalOpts = program.opts();
    await runScan({
      ...globalOpts,
      envFile: options.env,
      exampleFile: options.example,
      strict: options.strict,
      format: globalOpts.format as OutputFormat,
    });
  });

program
  .command('audit')
  .description('Scan codebase for hardcoded secrets')
  .option('--include <globs...>', 'Glob patterns to include')
  .option('--exclude <globs...>', 'Glob patterns to exclude')
  .option('--severity <level>', 'Minimum severity level to report', 'low')
  .action(async (options) => {
    const globalOpts = program.opts();
    await runAudit({
      ...globalOpts,
      ...options,
      format: globalOpts.format as OutputFormat,
    });
  });

program
  .command('sync')
  .description('Encrypted .env sync for teams (coming soon)')
  .action(async () => {
    await runSync();
  });

if (process.argv.length <= 2) {
  program.help();
}

program.parse();
