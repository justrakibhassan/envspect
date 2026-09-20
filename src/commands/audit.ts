import { resolve } from 'node:path';
import { createSpinner } from 'nanospinner';
import type { AuditOptions, OutputFormat } from '../types/index.js';
import { ExitCode } from '../types/index.js';
import { scanDirectory } from '../core/scanner.js';
import { formatAuditReport } from '../core/reporter.js';
import { defaultRules } from '../rules/default-rules.js';
import { log } from '../utils/logger.js';
import { loadConfig, defaults } from '../utils/config.js';

export async function runAudit(options: Partial<AuditOptions>): Promise<void> {
  const cwd = options.cwd || process.cwd();
  const config = await loadConfig(cwd);
  const finalOptions: AuditOptions = {
    include: options.include ?? config.audit?.include ?? defaults.audit.include,
    exclude: options.exclude ?? config.audit?.exclude ?? defaults.audit.exclude,
    severity: options.severity ?? config.audit?.severity ?? defaults.audit.severity,
    format: (options.format ?? config.format ?? defaults.format) as OutputFormat,
    silent: options.silent ?? false,
    cwd,
  };

  const spinner = createSpinner('Auditing codebase for secrets...').start();

  try {
    const report = await scanDirectory({
      cwd: resolve(cwd),
      rules: defaultRules,
      include: finalOptions.include,
      exclude: finalOptions.exclude,
      minSeverity: finalOptions.severity,
    });

    spinner.success({ text: 'Audit complete' });

    const output = formatAuditReport(report, finalOptions.format);
    console.log(output);

    if (report.findings.length > 0) {
      process.exit(ExitCode.AUDIT_SECRETS_FOUND);
    } else {
      process.exit(ExitCode.SUCCESS);
    }
  } catch (error) {
    spinner.error({ text: 'An unexpected error occurred during audit' });
    if (error instanceof Error) {
      log.error(error.message);
    }
    process.exit(ExitCode.ERROR);
  }
}
