import type { AuditRule } from '../types/index.js';

/**
 * Built-in secret detection rules.
 * Each rule defines a regex pattern to detect potentially leaked secrets.
 */
export const defaultRules: AuditRule[] = [
  // ── AWS ──
  {
    id: 'aws-access-key',
    name: 'AWS Access Key ID',
    description: 'Detects AWS Access Key IDs (starts with AKIA)',
    pattern: /(?:^|[^A-Za-z0-9/+=])AKIA[0-9A-Z]{16}(?:[^A-Za-z0-9/+=]|$)/,
    severity: 'critical',
    allowInEnvFiles: true,
  },
  {
    id: 'aws-secret-key',
    name: 'AWS Secret Access Key',
    description: 'Detects AWS Secret Access Keys (40 char base64)',
    pattern: /(?:aws_secret_access_key|aws_secret)\s*[=:]\s*['"]?[A-Za-z0-9/+=]{40}['"]?/i,
    severity: 'critical',
    allowInEnvFiles: true,
  },
  // ── API Keys (Generic) ──
  {
    id: 'generic-api-key',
    name: 'Generic API Key Assignment',
    description: 'Detects hardcoded API key assignments in source code',
    pattern: /(?:api_key|apikey|api_secret|apisecret)\s*[=:]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
    severity: 'high',
    allowInEnvFiles: true,
  },
  // ── Private Keys ──
  {
    id: 'private-key',
    name: 'Private Key',
    description: 'Detects PEM-encoded private keys',
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
    severity: 'critical',
    allowInEnvFiles: false,
  },
  // ── GitHub ──
  {
    id: 'github-token',
    name: 'GitHub Token',
    description: 'Detects GitHub personal access tokens and fine-grained tokens',
    pattern: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/,
    severity: 'critical',
    allowInEnvFiles: true,
  },
  // ── Stripe ──
  {
    id: 'stripe-key',
    name: 'Stripe API Key',
    description: 'Detects Stripe secret and publishable keys',
    pattern: /(?:sk|pk)_(?:test|live)_[A-Za-z0-9]{24,}/,
    severity: 'critical',
    allowInEnvFiles: true,
  },
  // ── JWT ──
  {
    id: 'jwt-token',
    name: 'JWT Token',
    description: 'Detects hardcoded JWT tokens',
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
    severity: 'high',
    allowInEnvFiles: true,
  },
  // ── Database URLs ──
  {
    id: 'database-url',
    name: 'Database Connection String',
    description: 'Detects database connection strings with credentials',
    pattern: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis|amqp):\/\/[^\s'"]+:[^\s'"]+@[^\s'"]+/i,
    severity: 'high',
    allowInEnvFiles: true,
  },
  // ── Passwords ──
  {
    id: 'password-assignment',
    name: 'Password Assignment',
    description: 'Detects hardcoded password assignments in source code',
    pattern: /(?:password|passwd|pwd|secret)\s*[=:]\s*['"][^'"]{8,}['"]/i,
    severity: 'high',
    allowInEnvFiles: true,
  },
  // ── Google ──
  {
    id: 'google-api-key',
    name: 'Google API Key',
    description: 'Detects Google API keys',
    pattern: /AIza[0-9A-Za-z_-]{35}/,
    severity: 'high',
    allowInEnvFiles: true,
  },
  // ── Slack ──
  {
    id: 'slack-token',
    name: 'Slack Token',
    description: 'Detects Slack bot and user tokens',
    pattern: /xox[bporsca]-[0-9]{10,}-[A-Za-z0-9-]+/,
    severity: 'high',
    allowInEnvFiles: true,
  },
  // ── SendGrid ──
  {
    id: 'sendgrid-key',
    name: 'SendGrid API Key',
    description: 'Detects SendGrid API keys',
    pattern: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/,
    severity: 'high',
    allowInEnvFiles: true,
  },
  // ── Twilio ──
  {
    id: 'twilio-key',
    name: 'Twilio API Key',
    description: 'Detects Twilio Account SID and Auth tokens',
    pattern: /(?:AC[a-z0-9]{32}|SK[a-z0-9]{32})/,
    severity: 'high',
    allowInEnvFiles: true,
  },
  // ── npm ──
  {
    id: 'npm-token',
    name: 'npm Access Token',
    description: 'Detects npm access tokens',
    pattern: /npm_[A-Za-z0-9]{36}/,
    severity: 'critical',
    allowInEnvFiles: true,
  },
  // ── Discord ──
  {
    id: 'discord-token',
    name: 'Discord Bot Token',
    description: 'Detects Discord bot tokens',
    pattern: /[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27,}/,
    severity: 'critical',
    allowInEnvFiles: true,
  },
];
