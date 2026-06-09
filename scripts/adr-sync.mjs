#!/usr/bin/env node
/**
 * Sync cross-repo (shared) ADRs into docs/adr/shared/ and verify they have not
 * drifted. Zero dependencies — runnable with plain `node`.
 *
 * Usage:
 *   node scripts/adr-sync.mjs            # sync: copy shared ADRs into docs/adr/shared/
 *   node scripts/adr-sync.mjs --check    # CI: fail if docs/adr/shared/ differs from source
 *
 * Source: the ADR_SHARED_SOURCE env var points at a directory containing the
 * shared ADR markdown files. When it is unset, the script SKIPS gracefully
 * (exit 0) — the shared source is not published yet (see docs/adr/shared/README.md).
 * The target's own README.md is never overwritten or removed.
 */
import { readdirSync, readFileSync, existsSync, statSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)
const targetDir = join(repoRoot, 'docs', 'adr', 'shared')
const PRESERVE = new Set(['README.md'])

const checkMode = process.argv.includes('--check')
const source = process.env.ADR_SHARED_SOURCE?.trim()

// Banner prepended to each synced copy so it's obvious the file is generated, not authored here.
// The ADR bodies are authored once in @umgccapstone/contracts (adr/shared/); this mirrors the
// backend repo's banner so the decision text stays congruent across both repos.
const BANNER =
  '<!-- SYNCED COPY — do not edit here. Authored in @umgccapstone/contracts ' +
  '(adr/shared/) and pulled in via `npm run adr:sync`. -->\n\n'

function log(msg) {
  process.stdout.write(`[adr-sync] ${msg}\n`)
}

/** Read all synced .md files (name -> content) from a directory, excluding preserved files. */
function readMarkdown(dir) {
  const files = new Map()
  if (!existsSync(dir)) return files
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md') || PRESERVE.has(name)) continue
    if (!statSync(join(dir, name)).isFile()) continue
    files.set(name, readFileSync(join(dir, name), 'utf8'))
  }
  return files
}

// No source configured → nothing to sync yet. Skip gracefully so dev + CI stay green.
if (!source) {
  log('ADR_SHARED_SOURCE is not set; the shared-ADR source is not published yet. Skipping.')
  process.exit(0)
}

if (!existsSync(source) || !statSync(source).isDirectory()) {
  log(`ERROR: ADR_SHARED_SOURCE "${source}" does not exist or is not a directory.`)
  process.exit(1)
}

const sourceFiles = readMarkdown(source)
const targetFiles = readMarkdown(targetDir)

if (checkMode) {
  const problems = []
  for (const [name, content] of sourceFiles) {
    const expected = BANNER + content
    if (!targetFiles.has(name)) problems.push(`missing in shared/: ${name}`)
    else if (targetFiles.get(name) !== expected) problems.push(`out of date: ${name}`)
  }
  for (const name of targetFiles.keys()) {
    if (!sourceFiles.has(name)) problems.push(`stale (not in source): ${name}`)
  }

  if (problems.length > 0) {
    log('ERROR: docs/adr/shared/ has drifted from the source. Run `npm run adr:sync`.')
    for (const p of problems) log(`  - ${p}`)
    process.exit(1)
  }
  log(`OK: docs/adr/shared/ is in sync (${sourceFiles.size} file(s)).`)
  process.exit(0)
}

// Sync mode: write source files into target, remove stale synced files (keep README.md).
mkdirSync(targetDir, { recursive: true })
let written = 0
for (const [name, content] of sourceFiles) {
  const dest = join(targetDir, name)
  const expected = BANNER + content
  if (!existsSync(dest) || readFileSync(dest, 'utf8') !== expected) {
    writeFileSync(dest, expected)
    written += 1
  }
}
let removed = 0
for (const name of targetFiles.keys()) {
  if (!sourceFiles.has(name)) {
    rmSync(join(targetDir, name))
    removed += 1
  }
}
log(`Synced ${sourceFiles.size} file(s) from ${source} (updated ${written}, removed ${removed}).`)
process.exit(0)
