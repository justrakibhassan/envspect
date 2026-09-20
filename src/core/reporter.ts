import { DiffResult, AuditReport, OutputFormat } from '../types/index.js';
import { c } from '../utils/logger.js';

/**
 * Formats a scan/diff result for terminal output.
 */
export function formatScanResult(result: { diff: DiffResult; duration: number }, format: OutputFormat): string {
  const { diff, duration } = result;

  if (format === 'json') {
    return JSON.stringify(result, null, 2);
  }

  if (format === 'minimal') {
    let out = '';
    diff.missing.forEach(m => out += `MISSING: ${m.key}\n`);
    diff.extra.forEach(e => out += `EXTRA: ${e.key}\n`);
    diff.empty.forEach(e => out += `EMPTY: ${e.key}\n`);
    return out.trim();
  }

  // 'table' output
  let out = c.bold(`┌─ Env Diff Report ─────────────────┐\n`);
  out += `│ Source: ${diff.sourceFile}\n`;
  out += `│ Target: ${diff.targetFile}\n`;
  out += `└───────────────────────────────────┘\n\n`;

  if (diff.missing.length > 0) {
    out += c.red(c.bold(`Missing Keys (${diff.missing.length}):\n`));
    diff.missing.forEach(m => out += `  - ${c.red(m.key)}\n`);
  }

  if (diff.extra.length > 0) {
    out += c.yellow(c.bold(`\nExtra Keys (${diff.extra.length}):\n`));
    diff.extra.forEach(e => out += `  - ${c.yellow(e.key)}\n`);
  }

  if (diff.empty.length > 0) {
    out += c.cyan(c.bold(`\nEmpty Keys (${diff.empty.length}):\n`));
    diff.empty.forEach(e => out += `  - ${c.cyan(e.key)}\n`);
  }

  out += c.gray(`\nMatched: ${diff.matched} | Duration: ${duration.toFixed(2)}ms\n`);
  return out;
}

/**
 * Formats an audit report for terminal output.
 */
export function formatAuditReport(report: AuditReport, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }

  if (format === 'minimal') {
    return report.findings
      .map(f => `${f.filePath}:${f.line} [${f.rule.severity}] ${f.rule.name} - ${f.match}`)
      .join('\n');
  }

  // 'table' output
  let out = c.bold(`┌─ Audit Report ────────────────────┐\n`);
  out += `│ Files Scanned: ${report.filesScanned}\n`;
  out += `│ Findings: ${report.findings.length}\n`;
  out += `└───────────────────────────────────┘\n\n`;

  if (report.findings.length === 0) {
    out += c.green('No secrets or issues found. ✨\n');
  } else {
    report.findings.forEach(f => {
      let colorFn = c.cyan;
      if (f.rule.severity === 'critical') colorFn = c.red;
      else if (f.rule.severity === 'high') colorFn = c.yellow;
      
      out += `${colorFn(c.bold(`[${f.rule.severity.toUpperCase()}]`))} ${f.rule.name} in ${f.filePath}:${f.line}\n`;
      out += `  Match:   ${f.match}\n`;
      out += `  Context: ${c.dim(f.context)}\n\n`;
    });
  }

  out += c.gray(`Duration: ${report.duration.toFixed(2)}ms\n`);
  return out;
}
