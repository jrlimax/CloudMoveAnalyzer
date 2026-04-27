/**
 * Test helper - loads the original JS files (which are global scripts, not ESM)
 * and exposes their internal functions for testing.
 *
 * Strategy: read the file as text, eval inside a scoped context to extract
 * the functions and constants we need to test.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

/**
 * Loads the move-database.js file and returns its exposed internals.
 */
export function loadMoveDatabase() {
  const source = readFileSync(resolve(ROOT, 'js', 'move-database.js'), 'utf8');

  // Wrap in function and return the internals
  const wrapped = `
    ${source}
    return {
      MOVE_DB_RAW,
      MOVE_DB,
      MOVE_NOTES,
      parseMoveCSV
    };
  `;

  // eslint-disable-next-line no-new-func
  return new Function(wrapped)();
}

/**
 * Loads selected pure functions from app.js by extracting them as text.
 * This avoids running the DOM-coupled bootstrap code.
 */
export function loadAppFunctions() {
  const source = readFileSync(resolve(ROOT, 'js', 'app.js'), 'utf8');
  const db = loadMoveDatabase();

  // Extract specific function definitions via regex
  const functionsToExtract = [
    'lookupResourceType',
    'getStatus',
    'getNoteKeyForType',
    'getDocUrlForType',
  ];

  const extracted = {};
  for (const name of functionsToExtract) {
    const pattern = new RegExp(
      `function\\s+${name}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\}`,
      'm'
    );
    const match = source.match(pattern);
    if (!match) {
      throw new Error(`Function ${name} not found in app.js`);
    }
    extracted[name] = match[0];
  }

  // Build a sandbox with MOVE_DB / MOVE_NOTES injected
  const sandbox = `
    const MOVE_DB = ${JSON.stringify(db.MOVE_DB)};
    const MOVE_NOTES = ${JSON.stringify(db.MOVE_NOTES)};
    ${Object.values(extracted).join('\n\n')}
    return {
      ${functionsToExtract.join(', ')}
    };
  `;

  // eslint-disable-next-line no-new-func
  return new Function(sandbox)();
}
