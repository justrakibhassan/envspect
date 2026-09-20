import { log, c } from '../utils/logger.js';

export async function runSync(): Promise<void> {
  log.info(`Sync feature is coming in ${c.bold('v1.0')}!`);
  log.dim('This will allow you to share encrypted .env files securely with your team.');
}
