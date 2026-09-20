// Core functions
export { parseEnvFile, parseEnvContent } from './core/parser.js';
export { diffEnvFiles } from './core/differ.js';
export { scanDirectory } from './core/scanner.js';
export { formatScanResult, formatAuditReport } from './core/reporter.js';

// Commands
export { runScan } from './commands/scan.js';
export { runAudit } from './commands/audit.js';

// Rules
export { defaultRules } from './rules/default-rules.js';

// Types
export type {
  EnvEntry,
  ParseResult,
  ParseError,
  DiffResult,
  AuditRule,
  AuditFinding,
  AuditReport,
  ScanResult,
  OutputFormat,
  ScanOptions,
  AuditOptions,
  EnvspectConfig,
} from './types/index.js';
