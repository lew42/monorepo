import path from "path";
import PageFiles from "./plugins/PageFiles.js";

/* One-time: creates every missing page.jsonl the covers() rule in Server/plugins/PageFiles.js
 * allows, using the EXACT SAME WALK the dev server's own boot catch-up runs at startup —
 * `boot(dir, true)`, where the server itself always passes `false` (existing logs only, so a
 * fresh server starts fast) and this script passes `true` (also create what's missing).
 *
 * Run it from the repo root (or a worktree root) — it walks THAT root's own public/:
 *
 *   node Server/page-files-backfill.mjs
 *
 * IDEMPOTENT: a second run visits the same folders but creates 0 logs and appends 0 lines,
 * because every covered folder already has its log and every log already agrees with what's
 * on disk (the same "replay before you write" rule every other page.jsonl write goes through).
 *
 * This never starts the dev server's watch() — it builds a bare instance straight on
 * PageFiles' own prototype, so it gets `boot`/`ensure`/`catchup`/`sync`/`append` unchanged
 * and nothing that keeps the process alive after the walk finishes. */

const PUBLIC = path.resolve("public");

const pf = Object.create(PageFiles.prototype);
pf.pending = new Map();

let visited = 0, created = 0, appended = 0;

// Wrap three of PageFiles' own methods just to count what they did — the methods
// themselves, and the order they call each other in, are untouched.
const real_boot = PageFiles.prototype.boot;
pf.boot = function (dir, create) { visited++; return real_boot.call(this, dir, create); };

const real_ensure = PageFiles.prototype.ensure;
pf.ensure = function (full) { const did = real_ensure.call(this, full); if (did) created++; return did; };

const real_append = PageFiles.prototype.append;
pf.append = function (log, obj) { appended++; return real_append.call(this, log, obj); };

const started = Date.now();
pf.boot(PUBLIC, true);
const ms = Date.now() - started;

console.log(`page-files-backfill: ${visited} folders visited, ${created} logs created, ${appended} lines appended, ${ms}ms`);
