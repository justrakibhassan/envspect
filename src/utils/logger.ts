import pc from 'picocolors';

/**
 * Centralized logger with consistent formatting and color coding.
 * Wraps picocolors for a unified output style across all commands.
 */
export const log = {
  /** Informational message */
  info: (msg: string) => console.log(pc.cyan('ℹ'), msg),

  /** Success message */
  success: (msg: string) => console.log(pc.green('✔'), msg),

  /** Warning message */
  warn: (msg: string) => console.log(pc.yellow('⚠'), msg),

  /** Error message */
  error: (msg: string) => console.error(pc.red('✖'), msg),

  /** Debug message (only when ENVSPECT_DEBUG is set) */
  debug: (msg: string) => {
    if (process.env.ENVSPECT_DEBUG) {
      console.log(pc.gray(`[debug] ${msg}`));
    }
  },

  /** Dim/muted text */
  dim: (msg: string) => console.log(pc.dim(msg)),

  /** Bold header */
  header: (msg: string) => console.log(`\n${pc.bold(pc.underline(msg))}\n`),

  /** Raw console.log (no prefix) */
  raw: (msg: string) => console.log(msg),

  /** Blank line */
  newline: () => console.log(),
} as const;

/** Color helpers for inline use */
export const c = {
  red: pc.red,
  green: pc.green,
  yellow: pc.yellow,
  cyan: pc.cyan,
  dim: pc.dim,
  bold: pc.bold,
  underline: pc.underline,
  gray: pc.gray,
} as const;
