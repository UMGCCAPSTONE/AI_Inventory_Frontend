// Copies the shared ADRs shipped inside @umgccapstone/contracts into docs/adr/shared/.
// Canonical home: the backend repo's packages/contracts/adr/shared/, published in the
// package under /adr/shared. Run from client/: npm run adr:sync
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const clientRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(clientRoot, 'node_modules', '@umgccapstone', 'contracts', 'adr', 'shared');
const dest = join(clientRoot, '..', 'docs', 'adr', 'shared');

const banner =
  '<!-- SYNCED COPY — do not edit here. The canonical version ships inside the ' +
  '@umgccapstone/contracts package (authored in the backend repo under packages/contracts/adr/shared/). ' +
  'Run `npm run adr:sync` after bumping the package. -->\n\n';

if (!existsSync(src)) {
  // The package is published by backend T-0; until it is installed here the
  // committed copies in docs/adr/shared/ stand as-is and this sync is a no-op.
  console.warn('adr:sync skipped — @umgccapstone/contracts is not installed.');
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
let count = 0;
for (const file of readdirSync(src)) {
  if (!file.endsWith('.md') || file === 'README.md') continue;
  const body = readFileSync(join(src, file), 'utf8');
  writeFileSync(join(dest, file), banner + body);
  count++;
}
console.log(`Synced ${count} shared ADR(s) -> docs/adr/shared/`);
