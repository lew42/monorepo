# Page health — is it working? After every change, the pages it could have broken get loaded in a hidden browser, and whoever made the edit hears about it at their next write

## Use

Run `node Server/health-supervisor.mjs`. It keeps one `Server/health.mjs` per tree alive, and
that loads pages from `HEALTH_BASE`, the owner's `http://monorepo.localhost` by default. A change
to a **template** (`.js`, `.css`, `.html`) under `public/` loads the pages it could break. A
change to a `.jsonl`, `.json` or `.md` file is data, so it never triggers a check. Each check looks
for console errors, stalls over 2 s and `JSONL: unknown verb` warnings, and it takes a 1920-wide
screenshot into `shots/<date>/`. Findings go to today's log, `public/framework/ai/health/<date>.jsonl`:
read it live on [this page](/framework/ai/health/). Each check also writes one line into the
editing agent's task. **How to run it, what it reports, and the proofs:
`Server/doc/health.md`.**

## Watch out

- **Two spacing lint checks are WARNINGS, never errors** (added 2026-09-19, `card-word`):
  a framed box holding text with under 8px of padding on any side, and a list of more than
  eight sibling rows pitched over 250px apart. One `page.evaluate()`, capped at ten combined
  findings per page — `lint_findings()` in `Server/health.mjs`, read it there; it excludes
  the framework's own control family (buttons, fields) on purpose. Under the supervisor, saving
  `Server/health.mjs` restarts the watcher; saving `health-supervisor.mjs` does not.
- **The feedback loop is the point, not the page.** `.claude/hooks/health-guard.mjs` (a sibling of
  `syntax-guard.mjs`, wired the same one-line way into `ledger.mjs`) is what actually tells an
  agent "you broke this" — at that agent's very NEXT write, never mid-write. Reading the log
  yourself is the fallback, not the normal path.
- **No Playwright installed globally → the watcher says so once and exits 0.** `npm install -g
  playwright` (and `npx playwright install chromium`) to run it at all — [`doc/decisions.md`](./doc/decisions.md).
- **A day file over 2MB stops recording warnings** (errors keep recording) and says so once, to
  the watcher's own console — never a new verb in the log.
- **The dev-bar line is built, not wired.** `devbar.js` exports a plain function of the same shape
  `dev/DevBar/hold.js` already has; `dev/DevBar/**` was outside this task's fence, so wiring it in
  is one import + one call left for whoever owns that file — the exact two lines are in
  [`doc/decisions.md`](./doc/decisions.md).
- **`note` warnings you might see from OTHER tasks' logs while this watcher runs are real, existing
  bugs it found, not something it caused** — a `"step"` top-level key some old lines carry, an
  unparsed line — see `ext/JSONL/JSONL.js`'s `skip()`.

## More

- [`doc/decisions.md`](./doc/decisions.md) — the mapping rules in full, the archiving numbers,
  the hook's exact contract, the dev-bar wiring lines, what was deliberately left
- `Server/health.mjs` — the watcher itself, heavily commented; read it before changing it
- `.claude/hooks/health-guard.mjs` — the hook half
- `log.js` — the one small `JSONL` reader `page.js` and `devbar.js` both share
