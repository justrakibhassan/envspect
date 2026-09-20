import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AuditRule, AuditFinding, AuditReport } from '../types/index.js';

export interface ScanDirectoryOptions {
  cwd: string;
  rules: AuditRule[];
  include: string[];
  exclude: string[];
  minSeverity: 'critical' | 'high' | 'medium' | 'low';
}

const severityLevels: Record<string, number> = { 
  critical: 4, 
  high: 3, 
  medium: 2, 
  low: 1 
};

/**
 * Converts a simple glob pattern to a RegExp.
 */
function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
    .replace(/\*/g, '.*')                 // Convert * to .*
    .replace(/\?/g, '.');                 // Convert ? to .
  return new RegExp(`^${escaped}$`);
}

/**
 * Checks if a path matches any of the given glob patterns.
 */
function matchGlobs(path: string, globs: string[]): boolean {
  if (globs.length === 0) return true;
  return globs.some(glob => globToRegex(glob).test(path));
}

/**
 * Recursively walks a directory and returns files matching globs.
 */
async function walkDir(dir: string, includeGlobs: string[], excludeGlobs: string[], fileList: string[] = [], cwd: string = dir): Promise<string[]> {
  try {
    const files = await readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const res = join(dir, file.name);
      // Normalize to forward slashes for glob matching
      const relPath = res.substring(cwd.length + 1).replace(/\\/g, '/');
      
      if (file.isDirectory()) {
        if (!matchGlobs(relPath, excludeGlobs)) {
          await walkDir(res, includeGlobs, excludeGlobs, fileList, cwd);
        }
      } else {
        if (matchGlobs(relPath, includeGlobs) && !matchGlobs(relPath, excludeGlobs)) {
          fileList.push(res);
        }
      }
    }
  } catch (error) {
    // Ignore read errors for inaccessible directories
  }
  return fileList;
}

/**
 * Scans a directory for secrets and audit issues based on rules.
 */
export async function scanDirectory(options: ScanDirectoryOptions): Promise<AuditReport> {
  const start = performance.now();
  const findings: AuditFinding[] = [];
  let filesScanned = 0;
  
  const targetFiles = await walkDir(options.cwd, options.include, options.exclude, [], options.cwd);
  const minSevLevel = severityLevels[options.minSeverity];
  
  for (const file of targetFiles) {
    filesScanned++;
    try {
      const content = await readFile(file, 'utf8');
      const lines = content.split(/\r?\n/);
      const fileName = file.replace(/\\/g, '/').split('/').pop() || '';
      const isEnvFile = fileName.endsWith('.env') || fileName.startsWith('.env');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        for (const rule of options.rules) {
          if (severityLevels[rule.severity] < minSevLevel) {
            continue;
          }
          if (isEnvFile && !rule.allowInEnvFiles) {
            continue;
          }
          
          const match = rule.pattern.exec(line);
          if (match) {
            const matchedText = match[0];
            // Redact matched secret
            const redacted = matchedText.length > 4 
              ? matchedText.substring(0, 4) + '*'.repeat(matchedText.length - 4)
              : '****';
              
            findings.push({
              rule,
              filePath: file.substring(options.cwd.length + 1), // relative path
              line: i + 1,
              match: redacted,
              context: line.trim().substring(0, 100) // max 100 chars
            });
          }
        }
      }
    } catch (e) {
      // Skip files that cannot be read
    }
  }

  return {
    findings,
    filesScanned,
    rulesApplied: options.rules.length,
    duration: performance.now() - start
  };
}
