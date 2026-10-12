# Minion: revive keeps provider+model; landed task stops its agents — requirements

Owner's ask (token-reduction/requirements.md items 6 and 1, trimmed): "a FINISHED free-model
agent was woken 9 times by heartbeat and revive, cost went $0→$2.84 — the revive seems to drop
the OpenRouter provider and run it on Claude" and "when a task has landed_at, Servex stops its
minions and reviewers at once, and the heartbeat never wakes an agent that has nothing queued
and no open task."

Budget: $2.

Worktree: `C:\Code\lew42\worktrees\token-reduction` (already set up, server on port 60173, proxy
`http://token-reduction.localhost/`). Work there. Fence: `Servex/agents/Agents.js`,
`Servex/agents/revive-proof.mjs`, `Servex/agents/revive-guard-proof.mjs` only. Do not touch any
other file.

## 1. Fix: revive drops `provider`

In `Servex/agents/Agents.js`, function `reopen(row)` (around line 487-500):

```js
reopen(row){
	const keys = ["role", "name", "topics", "page", "parent", "visibility", "model", "effort", "cwd",
		"permission_mode", "allowed_tools", "setting_sources"];
	const base = strip(row.spec ?? Object.fromEntries(keys.map(k => [k, row[k]])));
	...
```

`keys` is the fallback used when a row has no `spec` (an older/legacy row, or any row whose
`recipe()` returned null) — and it is missing `"provider"`. A row's top-level `model` survives,
but `provider` silently reverts to `spawn()`'s own default ("anthropic"), so a revived OpenRouter
agent (e.g. `nvidia/nemotron-3-ultra:free`) runs on Claude instead, unmetered by the openrouter
guard and billed on the subscription. **Fix: add `"provider"` to the `keys` array.** That is the
whole fix — one word added to one array literal. Do not touch `recipe()` (line ~839-844): it
already includes `provider` and is correct.

## 2. Prove it

Add one scene to `Servex/agents/revive-proof.mjs` (read the file first to match its existing
style — it is a standalone script, `node Servex/agents/revive-proof.mjs`, no test framework):
a registry row with NO `spec` (simulate a legacy row — `model: "deepseek/deepseek-v4-pro"`,
`provider: "openrouter"` as plain fields, no `spec` key at all) goes through `reopen()`
(or whatever public path the file already uses to exercise revive), and the result must show
`provider === "openrouter"` and `model === "deepseek/deepseek-v4-pro"` on the reopened spec —
not `"anthropic"`. Follow the file's existing pass/fail-count convention; don't invent a new one.

Run it: `node Servex/agents/revive-proof.mjs` from the worktree root, paste the output into your
task.jsonl as a `log` line. It must pass.

## 3. Landed task stops its agents — is it already true?

This part is a FEW READS AND A PROOF, not a rewrite, unless the proof fails. Read, in the
worktree:
- `Servex/Lifecycle.js` — `resources()` (idle/dormant agents become candidate rows), `why()`
  (the `kind === "agent"` branch: an agent whose parent's task has `landed` is reaped), `reap(dir)`
  (closes everything a task owns, called once by `Server/on-landing.mjs` right when a task lands).
- `Servex/Heartbeat.js` — `tick()`: `if (!t || t.done){ this.watch.delete(file); continue; }` already
  skips sending a status check to a task whose OWN task.jsonl has landed.

The gap, if there is one: a MINION's own task.jsonl often never gets its own `landed_at` line (it
just reports to its parent and gets stopped) — so if `Lifecycle.reap()`'s parent-task match ever
fails to catch it (e.g. the minion's `parent` field doesn't match the landed task's recorded
`.agent`, or the minion is still mid-tool/"working" and never reaches "idle" so it's never even a
candidate row), the heartbeat keeps sending it status checks forever, billing it.

Write one proof script, `Servex/agents/landed-reap-proof.mjs` (same standalone style as
`revive-proof.mjs` — a scratch dir for the registry, no real Servex, no network): build a fake
task dir with a landed line (`{"assign":{"landed_at":"<now>","outcome":"done","agent":"mastermind-x"}}`),
register one idle agent row with `parent: "mastermind-x"`, run `Lifecycle.why()` (or `reap()`) on
it with a fake `servex` stub exposing just what `Lifecycle` reads (`agents.registry_list`/`live`,
etc. — read `Lifecycle.js`'s `resources()`/`agents()` to see exactly what it needs), and assert
the idle agent's row is flagged to close with reason containing "landed". If it is NOT flagged,
that is a real bug: fix the narrowest thing in `Lifecycle.js` that makes it flag correctly (most
likely the match in `why()`'s agent branch, around line 246-253) — do not restructure anything
else. If it already passes, that's the fix: a regression test locking in correct behavior counts
as the deliverable here, per the brief's "Never backfires" section ("Tests for each rule,
including 'a landed task's agents are stopped'").

Log the proof's pass/fail output as a `log` line in your task.jsonl either way.

## Land

1. Run `node Servex/agents/revive-proof.mjs` and your new `landed-reap-proof.mjs` — both green.
2. `node --check Servex/agents/Agents.js` and `node --check Servex/Lifecycle.js` (if touched).
3. Commit in the worktree: `git add Servex/agents/Agents.js Servex/agents/revive-proof.mjs Servex/agents/landed-reap-proof.mjs Servex/Lifecycle.js` (only the files you actually touched) then commit.
4. Write a one-line `outcome` in your task.jsonl (`landed_at` + `outcome`) and stop. Do NOT run
   merge.mjs yourself — report back to your parent (mastermind-token-reduction) with the commit
   sha and what passed; the parent merges.
