# Minion brief — browser launcher tagging, chrome.exe reaper, warm-browser `check_page` tool

Task dir: `public/framework/ai/2026-10-03/playwright-reap/` — read `requirements.md` there (this file,
one level up — the owner's original ask is at the top of it) and log your steps into
`task.jsonl` beside it as you go (`node .claude/hooks/append.mjs public/framework/ai/2026-10-03/playwright-reap/task.jsonl '{"log":{"msg":"..."}}'`).

**No worktree was available** (all 3 quick-fix slots were taken by other agents). Work in the
**main tree** (`C:\Code\lew42\monorepo`), and **commit each numbered piece below as soon as it
works**, by exact path — `git add <paths>` then `git commit -m "..."`. Don't batch an uncommitted
pile; a crash loses it, and uncommitted files block other agents' merges.

Load the `code` skill first. Load the `minion` skill too (triggers on "your brief is at").

## What already exists (don't rebuild it — law 6, one of everything)

- **`Server/browser.mjs`** is already the one shared Chromium launcher. `Server/plugins/Shot.js`
  (the `shot` MCP tool), `Server/smoke.mjs`, and
  `public/framework/ext/DesignTool/vision/run.mjs` already import `{ browser }` from it — nothing
  to move there, the brief's step 1 ("move smoke.mjs and the shot tool onto it") is **already
  done** (commit `f336d7e6d`). Confirm this with `grep -rn "chromium.launch\|\.launch(" --include=*.mjs --include=*.js` outside `browser.mjs` itself and `.claude/hooks/syntax-guard.mjs`/`Server/window-lint.mjs` (which already enforce the one-launcher rule) — if you find a stray `.launch(`, fix it, but expect none.
- **`Servex/Lifecycle.js`** already logs and sweeps a `kind: "browser"` resource generically
  (`resources()` line ~176, `kept()`/`why()`/`sweep()`) whenever `browser.mjs`'s own
  `log_browser()` writes a start line. So a script that uses `browser.mjs` and then dies without
  closing it is **already** caught by the heartbeat sweep. The actual gap (see step 2) is a
  chrome.exe that was **never** written to the lifecycle log at all — one launched by
  `@playwright/mcp`'s own internal Playwright install, which does not go through `browser.mjs`.
- **`public/framework/ai/2026-10-02/node-reap/node-reap.mjs`** is a one-off dated script for
  **node.exe server trees only** — its own header says "It never touches claude.exe, chrome, or a
  tree it can't place." Don't extend that file; it's not the always-on reaper. `Servex/Lifecycle.js`'s
  `sweep()` (run every heartbeat tick) is the always-on reaper, and `processes()` in it (line ~128)
  **already captures chrome.exe** in its process snapshot (`Name='node.exe' or 'cmd.exe' or
  'chrome.exe' or 'bash.exe'`) — it's just not turned into rows yet. Extend THAT.

## Finding that changes step 3 of the owner's brief

`~/.claude.json` has **no `@playwright/mcp` entry for this repo at all** (checked both
`"c:/Code/lew42/monorepo"` and `"C:/Code/lew42/monorepo"` project blocks — both have
`"mcpServers": {}`). The only `@playwright/mcp` entry in the whole file belongs to an unrelated
project, `c:/Code/frozen-helix`. So nothing here currently launches Chrome through that MCP server
for this repo — the owner's 2.5 GB chrome.exe sighting was their own Chrome, not ours, and the
risk today is really "a `browser.mjs`-based script, or some future playwright MCP use, leaves
chrome.exe running," not an existing MCP leak. Add the monorepo project a `@playwright/mcp` entry
with `--isolated` (no persistent profile) so that IF it's ever turned on, the reaper in step 2
below can recognise its chrome.exe by profile path. Don't touch the frozen-helix entry.

## 1. Tag `Server/browser.mjs`'s launch with a user-data-dir

Edit `Server/browser.mjs`'s `launch()` (line 77-84). Add a `--user-data-dir` under
`%LOCALAPPDATA%/lew42/playwright/<tag>-<pid>`, where `<tag>` is `process.env.LEW_AGENT ||
path.basename(process.argv[1] || "script")` (same fields `log_browser` already uses two lines
below — reuse them, don't invent new ones). Pass it via `args: ["--user-data-dir=" + dir, ...
(opts.args||[])]` merged into the existing `chromium.launch({ headless: true, channel: "chromium",
...opts })` call — Playwright's `channel: "chromium"` launch still accepts `args`. Create the dir
first (`fs.mkdirSync(dir, { recursive: true })`). Update the file's own header comment (lines 1-34)
to mention the tag, and bump `Server/doc/browser.md` with one sentence saying every launch is now
tagged and why (so the reaper in step 2 can trust it). Also add a `SIGINT` handler next to the
existing `beforeExit`/`exit` hooks in `hook_exit()` (line 105-110) — today only `beforeExit` and
`exit` are hooked; Ctrl+C sends `SIGINT`, which skips `beforeExit`, so add
`process.once("SIGINT", () => { close().finally(() => process.exit(130)); })`.

**Prove it**: run any script that calls `browser()` (e.g. `node Server/smoke.mjs
http://monorepo.localhost/framework/`) and show, in `task.jsonl`, the actual directory created
under `%LOCALAPPDATA%/lew42/playwright/`.

## 2. The reaper — extend `Servex/Lifecycle.js`, not node-reap.mjs

In `Lifecycle.js`'s `resources()` (line ~168-210), after the existing scans, add one more: for
every `chrome.exe` row in `this.procs` (already collected by `processes()`) that
**is not already claimed** (`!seen.has(p.pid)`) and whose `cmd` matches
`/ms-playwright|chrome-for-testing|lew42[\\/]playwright/i` (the marker from step 1, plus the two
the brief named), add a row: `{ kind: "browser", id: `chrome:${p.pid}`, pid: p.pid, path: null,
owner_task: null, owner_agent: null, born: p.born, logged: false }`. Reuse `claim(p.pid)` so its
children are claimed too.

Then in `why()` (line ~242), a `kind: "browser"` row with `logged: false` needs its own rule (the
existing browser rows all have `logged: true` from the log, so this is new): close it if its
**parent node process is gone** (walk `this.procs.get(p.ppid)` — if undefined, there's no live
launcher) OR it is **older than 30 minutes** (`Date.now() - r.born > 30*60*1000`). Otherwise keep
it. Return a plain-sentence reason either way (match the style of the other `why()` branches).

**Never touch a chrome.exe without one of the three markers** — that's the owner's own browser.
Don't add a catch-all "any old chrome.exe" rule.

`kept()` (line ~222) already runs first and already has the "outside C:\Code\lew42 and not in the
creation log" guard (line 235) — check that an unlogged chrome row (`r.logged === false`, `r.path
=== null`) doesn't get swept into that unrelated branch by accident (it currently only fires when
`!r.logged && !inside(r.path, ...)`, and `inside(null, ...)` is false, so it WOULD wrongly say "not
reaped" for every tagged chrome — add an early return in `kept()` for `r.kind === "browser" &&
r.logged === false` so it skips that check and falls through to `why()`'s own 30-minute/orphan
rule).

**Prove it** (owner's own ask, item 4): launch a browser via `browser()` from a short-lived Node
script, kill that script's process (not the browser), run `node Servex/Lifecycle.js --dry` and
show the chrome.exe appearing in "WOULD CLOSE" with a reason naming the orphan check; then without
`--dry` and show the lifecycle.jsonl end line it writes.

## 3. The `@playwright/mcp` config entry

In `C:\Users\mike\.claude.json`, find the monorepo project block (there are two casings,
`"c:/Code/lew42/monorepo"` at ~line 1601 and `"C:/Code/lew42/monorepo"` at ~line 1633 — use
whichever one is `cwd`'s actual casing; check with `git rev-parse --show-toplevel` or just add to
both if unsure which Claude Code reads, noting which in your log). Add under its `mcpServers`:
```json
"playwright": { "type": "stdio", "command": "npx", "args": ["@playwright/mcp@latest", "--isolated"], "env": {} }
```
`--isolated` is `@playwright/mcp`'s own flag for "no persistent profile, nothing written to a
known path" — confirm its spelling against `npx @playwright/mcp@latest --help` before relying on
it (run that once, it's cheap) and adjust if the real flag name differs. Don't touch the
`frozen-helix` entry or the top-level global `mcpServers` block (~line 2055).

## 4. Part 2 — the warm shared browser + `check_page` tool

`Server/browser.mjs`'s `browser()` is already "one Chromium per process, reused" — Servex is a
long-running single node process, so calling `browser()` from inside Servex already gives exactly
the "one warm browser, started lazily" the owner asked for. Don't build a second browser
singleton.

Add a `check_page` tool in `Servex/Servex.js`'s `tools()` method (line 704), right beside
`start_server` (line 712) — literally next to it, matching the brief's own wording:

```js
.tool("check_page", { description: "Navigate the one warm shared headless Chromium to a URL and report back what a developer tools console would show: console lines (errors/warns/logs, deduped with counts), failed requests, HTTP 4xx/5xx responses, page errors (uncaught JS exceptions), and load time. Waits for load plus 2s so late console lines land too. Starts the shared browser on first call (a few hundred MB); closes the tab when done, not the browser. Never drives the owner's own open tabs — this is its own private Chromium (see `Server/browser.mjs`).",
    inputSchema: { type: "object", required: ["url"], properties: {
        url: { type: "string", description: "The page to load." },
        shot: { type: "boolean", description: "Also take a screenshot; the response names its saved path." } } } },
    async a => JSON.stringify(await check_page(a.url, { shot: a.shot })));
```

Write `check_page(url, opts)` in a new small file, `Server/browser-check.mjs` (so `Servex.js`
imports it, not reimplements it — one function, reusable from a CLI too):
`import { browser } from "./browser.mjs";` then open `(await browser()).newContext()`, a page,
collect `page.on("console", ...)`, `page.on("requestfailed", ...)`, `page.on("response", r =>
r.status() >= 400 ...)`, `page.on("pageerror", ...)`, `page.goto(url, {waitUntil:"load"})`, `await
page.waitForTimeout(2000)`, then dedupe console lines by text (keep a count), close the **context**
(not the shared browser), return `{ url, load_ms, console: [...], failed: [...], http_errors:
[...], page_errors: [...], shot: path|null }`.

**Memory cap (owner's own ask, item 6)**: after each `check_page` call, read the Chromium
process's RSS the same way `node-reap.mjs`'s `snapshot()` does
(`Get-CimInstance Win32_Process`, filter to the pid `(await browser()).process()?.pid` and its
children, sum `WorkingSetSize`) — don't invent a second way to read process memory, copy that
query. If total > 600 MB, or the browser has been idle (no `check_page` call) for 30 minutes
(track `last_used` at module scope in `browser-check.mjs`), call `close()` from `browser.mjs` so
the next call relaunches fresh. Log both the RSS check and any close through
`append_log({name: "browser-check", entry: {...}})` (the Servex MCP tool already defined at line
732 — call `this.log.append("browser-check", {...})` directly since you're inside Servex, not
through the MCP door).

**Prove it** (owner's own ask, item 8): call `check_page("http://monorepo.localhost/framework/ai/live/")`
through the MCP tool (or `node -e` hitting the same function directly if Servex needs a restart to
pick up the new tool — say which you did) and paste its returned 404 list into `task.jsonl`, plus
the browser's RSS at that point.

## Fence (don't touch anything else)

- `Server/browser.mjs`, `Server/doc/browser.md`, `Server/browser-check.mjs` (new)
- `Servex/Lifecycle.js`, `Servex/Servex.js` (only the `tools()` method, add the one `.tool(...)`)
- `~/.claude.json` (only the one `playwright` entry, under the monorepo project — never the global block)
- this task dir (`public/framework/ai/2026-10-03/playwright-reap/`)
- `.claude/skills/ui-test/SKILL.md` or wherever the browser-testing pointer lives — ONE sentence
  saying probe scripts import `Server/browser.mjs`'s tagged launch (it already does for the
  scripts that matter; just confirm and note it, don't restructure the skill)

**Don't restart Servex** until everything above is committed and you've re-read
`Servex/Servex.js` once for a syntax mistake — a broken `Servex.js` takes down every agent's MCP
connection, yours included, and it restarts every running agent. When you do restart (needed for
`check_page` to exist as a live tool), run `node Servex/sustain.mjs --restart` and say so in your
log FIRST, then do it, since it ends your own turn too — make it genuinely the last thing you do,
after everything is committed.

Model: Sonnet. Budget: this task's remaining budget (started at $8). Over pace this week (61%
used vs ~29% of the week elapsed) — no reviewer spawn; the task mastermind will read your diff
directly instead.

## Landing

When everything above is proven and committed: update `Server/doc/browser.md` and this task's own
`readme`-equivalent (there isn't one — the task dir itself, plus the one-sentence skill pointer,
is the doc), then load `finish-task` and land. Write the outcome as a checklist against the
owner's eight numbered "Do" items plus the two in "Part 2" — ten lines, each ticked only with its
proof (a log line, a diff, a pasted result), same as the sub-mastermind skill's own example.
