# Hidden windows — the windowsHide sweep (minion brief)

Load the `minion` skill first. Your task's directory (read the whole thing, raw words included,
before touching anything): `public/framework/ai/2026-09-28/hidden-windows/`.

## The rule

The owner (2026-09-25): "never pop up a Node.js process without the hidden flag." Every
`spawn` / `spawnSync` / `exec` / `execFile` / `execFileSync` / `fork` from `node:child_process`
needs `{ windowsHide: true }` in its options object — even when `detached: true` is also set.
Every PowerShell `Start-Process` needs `-WindowStyle Hidden`.

## What to do

Run `node Server/window-lint.mjs` from the repo root — it lists every call site still missing
the flag, as `file:line  call()  — why`. Fix each REAL hit below (a mechanical one-line add to
that call's options object; do not touch anything else in the file, and do not reformat
surrounding code):

- `dev.mjs` — 3 hits (lines ~43, 54, 60)
- `public/framework/ai/2026-09-25/quickfix-worktrees/pool/proof.mjs` — 4 hits
- `Server/health-supervisor.mjs` — 1 hit (~145, a `fork`)
- `Server/plugins/Ask.js` — 1 hit (~173)
- `Server/plugins/Assistant.js` — 2 hits (~50 fork, ~125 spawn)
- `Server/plugins/CardAnswer.js` — 1 hit (~259)
- `Server/plugins/SocketServer/Runtime.js` — 1 hit (~135, an `exec`)
- `Server/plugins/Start.js` — 1 hit (~85; a second hit the lint tool found at line 30 already
  has `windowsHide` two lines down from the call — leave that one alone, it's already covered)
- `Server/worktree-down.mjs` — 2 hits (~77, ~90, both `execFile`)
- `Server/worktree-up.mjs` — 2 `Start-Process` hits (~155, ~157) — add `-WindowStyle Hidden` to
  each PowerShell command string; read the surrounding code first, since these are Start-Process
  calls built as argument arrays or strings, not JS options objects
- `server.js` — 2 hits (~158, ~258, ~283 — check all three the lint tool prints; one at line 20
  may be a false positive, a `fork()` used differently — check before touching)
- `Servex/agents/layers-proof.mjs` — 4 hits (all `execFile`)
- `Servex/agents/revive-proof.mjs` — 1 hit (~51, `execFile`; a second hit the lint tool found at
  line 34 already has `windowsHide` — leave it)
- `Servex/Process.js` — 1 hit, the real one, line ~175: `spawn(this.command, this.args, { cwd:
  this.cwd, env, shell: !!this.shell })`. There's a comment above it — `// inherit Servex's
  hidden console — see sustain.mjs` — that's still true and stays; just add `windowsHide: true`
  to the options object as belt-and-braces (it's a safe no-op when the parent's console is
  already hidden, and a real fix if this ever runs from a parent that has a visible console).
- `Servex/proof/proof.mjs` — 2 hits (~102, ~130)
- `Servex/Servex.js` — 2 hits (~568, ~588)
- `Servex/sustain.mjs` — 2 hits: line ~139 (`spawnSync(process.execPath, ["--check", f])` inside
  `restart()`'s parse check — just add `{ windowsHide: true }`) and line ~173, the Servex
  launcher itself — there's a comment there too (`⚠ no windowsHide: Servex spawns agents and
  servers...`) explaining a deliberate choice. Read it. Add `windowsHide: true` anyway (belt and
  braces, same reasoning as Process.js above) but DO NOT delete or shorten that comment — extend
  it with one clause noting the flag was added defensively, the original reasoning still holds.

**Two files the lint tool flags that are NOT real hits — leave them alone:**
- `Servex/orphan.mjs:48` — that's the word "Start-Process" inside an error message string
  (`"no pid from Start-Process"`), not a real command. orphan.mjs already does this correctly
  (read its own doc comment at the top) and needs no change.
- Any `this.spawn(...)` / bare `spawn(){` method call or definition the lint tool does NOT
  flag (it already filters those) — just don't go looking for more to "fix" beyond the list above.

## Prove it

After each file: `node --check <file>`. When the whole sweep is done: `node
Server/window-lint.mjs` again and paste its new output into this task's `task.jsonl` as a `log`
line (`node .claude/hooks/append.mjs …`) — it should be down to just the orphan.mjs false
positive (and anything you deliberately left, named).

This is a single-file-at-a-time mechanical sweep across many small files, not a shared module —
work directly in the main tree (no worktree needed), and run `node Server/health-supervisor.mjs`
once in the background from the repo root to catch any accidental breakage on the pages that
touch these files (there likely are none — these are all `Server/`/`Servex/` backend files, no
`public/` pages import them directly — so the health log staying empty is the expected, and
sufficient, proof).

Report back to `task-mastermind-hidden-windows` (send_to_agent, `reply_to: "message
task-mastermind-hidden-windows"`) when done, or the moment you are blocked.
