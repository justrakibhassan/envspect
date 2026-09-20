/**
 * Parsed environment variable entry
 */
export interface EnvEntry {
  key: string;
  value: string;
  line: number;
  comment?: string;
  isComment: boolean;
  raw: string;
}

/**
 * Result of parsing an env file
 */
export interface ParseResult {
  entries: EnvEntry[];
  filePath: string;
  errors: ParseError[];
}

export interface ParseError {
  line: number;
  message: string;
  raw: string;
}

/**
 * Diff results between two env files
 */
export interface DiffResult {
  missing: EnvEntry[];     // In example but not in .env
  extra: EnvEntry[];       // In .env but not in example
  empty: EnvEntry[];       // In .env but has empty value
  matched: number;         // Count of matching keys
  sourceFile: string;
  targetFile: string;
}

/**
 * Secret detection rule
 */
export interface AuditRule {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  allowInEnvFiles: boolean;
}

/**
 * A single audit finding
 */
export interface AuditFinding {
  rule: AuditRule;
  filePath: string;
  line: number;
  match: string;
  context: string;
}

/**
 * Complete audit report
 */
export interface AuditReport {
  findings: AuditFinding[];
  filesScanned: number;
  rulesApplied: number;
  duration: number;
}

/**
 * Scan command result
 */
export interface ScanResult {
  diff: DiffResult;
  duration: number;
  success: boolean;
}

/**
 * Output format options
 */
export type OutputFormat = 'table' | 'json' | 'minimal';

/**
 * Global CLI options
 */
export interface GlobalOptions {
  format: OutputFormat;
  silent: boolean;
  cwd: string;
}

/**
 * Scan command options
 */
export interface ScanOptions extends GlobalOptions {
  envFile: string;
  exampleFile: string;
  strict: boolean;
}

/**
 * Audit command options
 */
export interface AuditOptions extends GlobalOptions {
  include: string[];
  exclude: string[];
  severity: AuditRule['severity'];
}

/**
 * Config file shape (.envspectrc)
 */
export interface EnvspectConfig {
  envFile?: string;
  exampleFile?: string;
  scan?: {
    strict?: boolean;
  };
  audit?: {
    include?: string[];
    exclude?: string[];
    severity?: AuditRule['severity'];
    customRules?: Partial<AuditRule>[];
  };
  format?: OutputFormat;
}

/**
 * Exit codes for CLI
 */
export const ExitCode = {
  SUCCESS: 0,
  SCAN_ISSUES_FOUND: 1,
  AUDIT_SECRETS_FOUND: 2,
  FILE_NOT_FOUND: 3,
  CONFIG_ERROR: 4,
  ERROR: 5,
} as const;

export type ExitCodeValue = (typeof ExitCode)[keyof typeof ExitCode];
