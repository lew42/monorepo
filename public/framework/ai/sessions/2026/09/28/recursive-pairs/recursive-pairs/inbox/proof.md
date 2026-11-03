# Deliverable 8 — a VS Code tab is an agent you can message

Commit: `a1cc03288e0823fda69913cd7e50665382f659d5` on `worktree/recursive-pairs`
(`Servex/agents/External.js`, `Servex/agents/External.test.mjs`, `Servex/agents/doc/external.md`,
the send-path line in `Servex/agents/Agents.js`, the install line in `Servex/Servex.js`, and a new
section in `.claude/skills/servex-mastermind/SKILL.md`).

## 1. Register — ✅

> An MCP tool `register_session({id, session_id})`, called from a tab. Servex lists it in
> `list_agents` as `kind: "external"`, with an inbox at `logs/inbox/<id>.jsonl`.

Proof (private Servex, port 8490, `external-proof.mjs`):

```
PASS register_session: { "id": "vscode-external-proof", "kind": "external", "state": "external",
  "session_id": "sess-proof-fake-uuid", "registered_at": "2026-09-28T13:59:43-05:00", … }
PASS list_agents shows it as kind:"external" — {"id":"vscode-external-proof","kind":"external",…}
```

The row lands in the exact same `registry.json` every real agent's row lives in —
`registry.js` needed no change at all, its `read()`/`save()` already take any shape.

## 2. Deliver — ✅

> `send_to_agent` to an external id appends one JSON line to its inbox (`from`, `text`, `reply_to`,
> `at`). Policy treats it like a live agent of that name.

Proof:

```
PASS send_to_agent -> inbox in 3 ms: {"from":"mastermind-servex","text":"hello from a sibling agent",
  "reply_to":"log agent-host","at":"2026-09-28T13:59:43-05:00"}
```

The one line this needed is in `Agents.send()` (the send path, as fenced): a registered external
id is checked *after* `live` and *before* `wake()`, so it never reaches `wake()`'s "never got a
session" throw. `policy.js` (outside this fence) needed no change: it already buckets any id it
doesn't recognise as `kind: "worker"`, the same bucket a minion falls into — the owner,
`mastermind-servex` and `dispatcher` may always message a worker, and anyone else may within 30
minutes of it messaging them first. Checked against `policy.test.mjs`, unchanged and still green.

## 3. Card to creator — ✅

> `create_card` records `by` (check; cards' page.jsonl already shows `by`). What the owner says
> into a card goes to its creator's inbox when the creator is external. Subscribe to cards in
> External.js (`servex.cards.on`), not in Layers.js.

`by` was **already recorded** by `Cards.create()` before this task — checked, so `Cards.js` needed
no edit (the fence said "only if `by` is not already recorded"). `External.js` subscribes with
`servex.cards.on(...)` itself, watching for a fresh owner prompt and forwarding it to the card's
`by` when that id is registered as external.

Proof — real Cards module, real card folder, real `/card/append` route (the same route
`ux/Dictate` posts to):

```
PASS create_card by=vscode-external-proof: { "ok": true, "id": "2026/09/28/external-proof-card", … }
PASS a card prompt reached the creator's inbox in 5 ms (< 2000 ms): {"from":"owner",
  "text":"build the thing we talked about","reply_to":"card 2026/09/28/external-proof-card",
  "at":"2026-09-28T13:59:43-05:00"}
```

## 4. Watch — ✅

> A few lines in the `servex-mastermind` skill: a tab runs one `Monitor` on its inbox with no
> expiry, re-armed at the start of each turn.

Added a "A VS Code tab is an agent you can message" section to
`.claude/skills/servex-mastermind/SKILL.md`: how to `register_session`, the exact `tail -f` shape
of what to watch, and — since a `Monitor` call always expires (30 minutes at most, confirmed
against the tool's own schema) — the instruction to re-arm it at the start of every turn rather
than treat one watch as forever.

## 5. Prove it — ✅

> A message said into a card reaches the tab's inbox **within 2 seconds**, timestamped, on the
> private Servex.

Both the direct `send_to_agent` case and the card-creator case landed in **single-digit
milliseconds** (3 ms and 5 ms), each with a real `at` timestamp — three orders of magnitude under
the 2-second bar. Full run: `external-proof.mjs` (scratchpad), a private Servex on **port 8490**
with `SERVEX_NO_LAYERS=1` (exactly the fence's own recipe), `SERVEX_HOME` pointed at a scratch
dir, no real Claude session ever started (so this cost nothing). Also `node
Servex/agents/External.test.mjs` — 9 unit checks, all passing, against a real `Agents` host and a
scratch registry dir (not a re-implementation of the send-path hook — the actual one).

## What's left open (fence-respecting, not "out of scope")

- **A Servex restart forgets an external row.** `Agents.revive()` — outside this task's fence
  (Agents.js could only be touched "on the send path") — has no `agent-<id>.jsonl` log to judge an
  external row's recency by, so it buries it `gone` on the next boot. The row keeps its
  `session_id` and `kind`, so calling `register_session` again fully restores it. Written up in
  `Servex/agents/doc/external.md`'s last section, for whoever next opens `revive()`.
- **`Servex/agents/readme.md` isn't updated** to list `External.js` and its doc, because it wasn't
  in this task's file fence. The doc stands on its own either way.

## An incident, caught and closed before it reached anyone

The first version of `External.test.mjs` used static `import` for `Agents.js`, after setting
`process.env.SERVEX_HOME` to a scratch dir. ES module imports are hoisted ahead of every other
statement in a file, so `home.js`'s module-level `HOME` constant had already frozen on the
**real** machine's Servex home before that line ever ran. Two test runs during this task wrote real
lines into the **live** Servex's `logs/inbox/vscode-x.jsonl` (never into its `registry.json` — that
one path did use an explicit scratch `registry_dir` and was never affected). Caught by checking the
real `%LOCALAPPDATA%\lew42\servex\` directly, the polluted file was deleted, and the test was
rewritten to `await import(...)` both modules *after* the env var is set — the same pattern
`global.test.mjs` already uses, for the same reason. Verified clean afterward and re-verified after
a second run. No agent, card, or registry row on the real Servex was ever touched.

## Also noticed, and worked around: a shared-worktree race

Partway through, a re-read of `Servex/agents/Agents.js` and `Servex/Servex.js` showed my edits to
both files gone — a sibling minion's own concurrent write to the same files (both are shared
touchpoints across more than one of this task's minions) had overwritten them. Re-applied both
edits, verified they held, and committed promptly afterward to shrink the window. Flagging this
for whoever coordinates the three sibling minions: `Agents.js` and `Servex.js` are common ground
and a plain `Edit`/`Write` race between two minions can silently drop one side's change with no
error — worth a note in `common.md` for the next task like this one.
