import { readFile } from 'node:fs/promises';
import { EnvEntry, ParseResult, ParseError } from '../types/index.js';

/**
 * Parses an environment file from the given file path.
 */
export async function parseEnvFile(filePath: string): Promise<ParseResult> {
  try {
    const content = await readFile(filePath, 'utf8');
    return parseEnvContent(content, filePath);
  } catch (error: any) {
    throw new Error(`Failed to read file at ${filePath}: ${error.message}`);
  }
}

/**
 * Parses environment content into a structured ParseResult.
 */
export function parseEnvContent(content: string, filePath: string = 'unknown'): ParseResult {
  const entries: EnvEntry[] = [];
  const errors: ParseError[] = [];
  const lines = content.split(/\r?\n/);
  
  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    
    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Handle full line comments
    if (trimmed.startsWith('#')) {
      entries.push({
        key: '',
        value: '',
        line: i + 1,
        isComment: true,
        comment: trimmed.substring(1).trim(),
        raw: rawLine
      });
      i++;
      continue;
    }

    // Strip optional export prefix
    const matchLine = trimmed.startsWith('export ') ? trimmed.substring(7).trimStart() : trimmed;
    
    const eqIdx = matchLine.indexOf('=');
    if (eqIdx === -1) {
      errors.push({ line: i + 1, message: 'Malformed line, missing "="', raw: rawLine });
      i++;
      continue;
    }

    const key = matchLine.substring(0, eqIdx).trim();
    let valueStr = matchLine.substring(eqIdx + 1).trim();
    let comment: string | undefined = undefined;
    
    // Check for quoted values
    if (valueStr.startsWith('"') || valueStr.startsWith("'") || valueStr.startsWith('`')) {
      const quoteChar = valueStr[0];
      
      // Multiline check for double quotes or backticks
      if (quoteChar === '"' || quoteChar === '`') {
        let endIndex = valueStr.indexOf(quoteChar, 1);
        let valueLines = [valueStr];
        let multilineRaw = [rawLine];
        let currentLineIdx = i;
        
        while (endIndex === -1 && currentLineIdx < lines.length - 1) {
          currentLineIdx++;
          const nextLine = lines[currentLineIdx];
          valueLines.push(nextLine);
          multilineRaw.push(nextLine);
          endIndex = nextLine.indexOf(quoteChar);
        }
        
        if (endIndex === -1) {
          errors.push({ line: i + 1, message: `Unmatched ${quoteChar}`, raw: multilineRaw.join('\n') });
          i = currentLineIdx + 1;
          continue;
        } else {
          valueStr = valueLines.join('\n');
          const finalRaw = multilineRaw.join('\n');
          // Extract the value without quotes
          const extractedValue = valueStr.substring(1, valueStr.lastIndexOf(quoteChar));
          
          // Check for inline comment after quote
          const afterQuote = valueStr.substring(valueStr.lastIndexOf(quoteChar) + 1).trim();
          if (afterQuote.startsWith('#')) {
             comment = afterQuote.substring(1).trim();
          }

          entries.push({
            key,
            value: extractedValue,
            line: i + 1,
            isComment: false,
            comment,
            raw: finalRaw
          });
          i = currentLineIdx + 1;
          continue;
        }
      } else {
         // Single quotes don't support multiline
         const endIndex = valueStr.indexOf(quoteChar, 1);
         if (endIndex === -1) {
             errors.push({ line: i + 1, message: 'Unmatched single quote', raw: rawLine });
             i++;
             continue;
         }
         const extractedValue = valueStr.substring(1, endIndex);
         const afterQuote = valueStr.substring(endIndex + 1).trim();
         if (afterQuote.startsWith('#')) {
             comment = afterQuote.substring(1).trim();
         }
         entries.push({
             key,
             value: extractedValue,
             line: i + 1,
             isComment: false,
             comment,
             raw: rawLine
         });
         i++;
         continue;
      }
    }

    // Unquoted value: check for inline comment
    const hashIdx = valueStr.indexOf('#');
    let value = valueStr;
    if (hashIdx !== -1) {
      value = valueStr.substring(0, hashIdx).trim();
      comment = valueStr.substring(hashIdx + 1).trim();
    }

    entries.push({
      key,
      value,
      line: i + 1,
      isComment: false,
      comment,
      raw: rawLine
    });
    
    i++;
  }

  return { entries, filePath, errors };
}
