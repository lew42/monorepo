# Minion C — the doc check on landing, and no landing without an outcome

Load the `minion` skill first. Parent task: `public/framework/ai/2026-09-28/task-loop/` (read its requirements.md). The design: `public/framework/ai/2026/09/28/skills-as-a-workflow-tasks-chased-by-nod/design.md`.

The owner's asks, as briefed:
- "`Server/on-landing.mjs` also checks that every module the task touched has a readme.md, a doc/ and resolving links, and posts one nag line on the card when not."
- "the ledger refuses a `landed_at` with no outcome and says so in the task log."

**Work only in the worktree `C:/Code/lew42/worktrees/task-loop`** (branch `worktree/task-loop`). Commit there. Your own log: `C:/Code/lew42/monorepo/public/framework/ai/2026-09-28/task-loop/landing-checks/task.jsonl` (open per the new-task skill; append with `node .claude/hooks/append.mjs`).

## Deliverables

### 1. Doc check — new `Server/doc-check.mjs`, called from `Server/on-landing.mjs`

Never throws. For each touched file (`action.files` in the task's task.jsonl), find its **module**: the nearest directory at or above it, under `public/`, that holds a `page.js` (skip `public/framework/ai/**` task dirs). For each module, check:

```
readme.md   exists?
doc/        exists?
its links   every relative or /site link resolves
            (/x/y/ → public/x/y/; ignore http(s) and # links)
```

Append one line to the task log:

```
doc-check: N modules — clean
doc-check: <module>: no readme; <module>: 2 dead links (…)
```

### 2. The nag on the card

When not clean, post ONE line on the task's card (line-1 `card` in its task.jsonl; skip if none) via Servex's MCP door — find the port the way other `Server/` scripts do (grep for `/mcp` in `Server/`):

```
POST http://127.0.0.1:<port>/mcp
tools/call: card_reply
{ card, from: "on-landing", text }

text = "Docs missing for <module> (no readme / no doc/ / dead links).
        Please fix before this counts as done."
```

### 3. Refuse a landing with no outcome — `.claude/hooks/ledger.mjs` (outcome check only)

In the `stop` branch: a `landed_at` with an empty or missing `outcome` is not a landing.

- Append once (not on every stop):
  ```
  {"log": {"at", "msg": "landing refused: landed_at has no outcome. Append {\"assign\": {\"outcome\": \"…\"}}."}}
  ```
- Don't spawn on-landing.
- Block with that reason, so the agent fixes it.

## Proof (put it in your log)

In a scratch copy (set `LEDGER_ROOT` to a scratch dir so nothing real is touched): (a) a stop hook input on a task with landed_at and no outcome → the refusal line and the block; (b) the same with an outcome → no refusal. Then run `node Server/on-landing.mjs <a probe task dir in the worktree>` whose task.jsonl touched a module with no doc/ → the doc-check line; show the card_reply request body you would send (point it at a private Servex if one is up on 8193 or 8195, else log the body). Also run doc-check against one real, landed task dir from the main tree read-only and show its line.

## Fence

Yours: `Server/on-landing.mjs`, new `Server/doc-check.mjs`, `.claude/hooks/ledger.mjs` (the outcome check only). Budget: under 120 changed lines. Land by appending landed_at + outcome to your log, then stop.
