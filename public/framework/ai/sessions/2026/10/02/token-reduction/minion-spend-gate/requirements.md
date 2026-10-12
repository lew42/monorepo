# Minion: wire the spend gate's Continue/Stop card; budget_usd on spawn_agent — requirements

Owner's ask (token-reduction/requirements.md item 4, trimmed): "Spending $10 or $20 to find out
if something works is fine if it's promising; blowing $20 with no results is not acceptable."
The spend-follows-results MECHANISM is already written and working in `Servex/agents/Agents.js`
(`tool_started`, `tool_results`, `meter`, `gate_check`, `grant`, `gate_row`) — read that code
first, in full, before touching anything (search the file for `SPEND FOLLOWS RESULTS` for the
big comment that explains it). Your job is two small, separate pieces. Budget: $3.

Worktree: `C:\Code\lew42\worktrees\token-reduction` (already set up; server on port 60173).
Fence: `Servex/agents/Agents.js`, `Servex/cards/Cards.js`, `Servex/agents/tools.js`, plus one new
proof file you create. Do not touch any other file (another minion owns Heartbeat.js/Lifecycle.js
in the same worktree — if you hit a conflict there, stop and say so, don't resolve it yourself).

## 1. The Continue/Stop card answer does nothing today — fix it

`gate_check()` in `Agents.js` (search `g.gated = true` — a few lines above is the `Promise.resolve(
card && ask ? ask({ card, question: text, options: ["Continue (+$5)", "Stop"] }, ...`) calls
`card_ask` with NO `from` field. Look at `Servex/cards/Cards.js`'s `ask()` (search `card_ask: ONE
place line`) and `wake()` (right below it, search `Any chose, answer`) — `wake()` only targets a
specific agent when the `place` line it finds carries `from`; with none, it falls back to
texting EVERY attached non-minion agent "The owner answered…: Continue (+$5)" — the wrong
agent(s) get a text message instead of the gated one getting unblocked, and no tool is actually
called.

Fix, as a matched pair:
- In `gate_check()`, pass `from: this.id` on the `ask(...)` call, so `wake()` can find this exact
  agent.
- In `Cards.js`, give `ask()` an optional `kind` passthrough: if `kind` is given, put it on the
  `place` object (alongside `ask`/`options`/`from`). Then in `wake()`, when building `found`, also
  carry `found.kind` from `l.place.kind`. When `found.kind === "spend-gate"`, do NOT just text the
  agent the generic "owner answered" line — instead, call the real action directly, with no extra
  model turn spent: `answer === "Stop"` → `this.agents.stop(found.from, { by: "owner" })`;
  otherwise (Continue) → `this.agents.grant(found.from, 5)`. Keep the existing generic path
  (texting the agent) for every OTHER `card_ask` with options — this is a special case ONLY for
  `kind === "spend-gate"`, added as one `if` before the generic send loop, not a rewrite of
  `wake()`.
- Back in `gate_check()`, pass `kind: "spend-gate"` on the same `ask()` call.
- `Cards.js`'s `this.agents` is already set (see existing `this.agents.send(...)` calls in the
  file) — use it, don't import `Agents.js` directly.

## 2. `budget_usd` on `spawn_agent`

In `Servex/agents/tools.js`, the `spawn_agent` tool's `inputSchema.properties` (search
`description: "What it is: `minion`, `mastermind`, `assistant`."` to find the right object) is
missing `budget_usd`. Add one field:

```js
budget_usd: { type: "number", description: "Dollar ceiling for the results-gated spend guard (Agents.js spend_gate) — overrides the task's `Budget: $N` brief line and the $20 default. The agent still starts with $2 and unlocks $3 per result up to this ceiling." },
```

Nothing else needs to change — `spawn()` already spreads the whole spec onto the Agent instance
(`...spec` in `Agents.js`'s `spawn()`), and `read_ceiling()` already reads `this.budget_usd`
first. Confirm that by reading `read_ceiling()` (search `read_ceiling`) — don't just trust this
brief, check it compiles and actually flows through.

## 3. Prove it

Write `Servex/agents/spend-gate-proof.mjs`, standalone (no test framework, no real Servex, no
network — follow the style of `Servex/agents/revive-proof.mjs` and `wake-proof.mjs`: a bare
`new Agents()` host, a fake/stub query if the real ones need the SDK — read how `demo.mjs` or
`fork-proof.mjs` fakes a session if `Agent.start()` needs mocking, OR, simpler, unit-test the pure
pieces directly without spawning a real session: `gate()`, `allowance_usd()`, `tool_started()`,
`tool_results()`, `gate_check()`, `grant()` are plain methods on `Agents.Agent.prototype` you can
call on a bare object `Object.assign(Object.create(Agents.Agent.prototype), {...minimal fields...})`
with `host` stubbed to capture what `gate_log`/`ask` would be called with — much cheaper than a
live SDK session and these are pure-logic checks). Cover exactly what the brief's "Tests" list
under item 4 asks for:
- $2 (default `SERVEX_GATE_FIRST_USD`) spent with no result → `gate_check()` interrupts once and
  calls `card_ask`-equivalent once (assert the stub was called once, with the right `since_result_usd`).
- A successful commit-shaped tool result (`tool_started` with a Bash `git commit` input, then
  `tool_results` with `is_error: false`) unlocks $3 more (`allowance_usd()` goes up by 3); a
  FAILED one (`is_error: true`) does not.
- An open tool call (one in `g.open` with no matching `tool_results` yet) delays the interrupt:
  `gate_check()` sets `g.due = true` and does NOT call `interrupt()` while `g.open.size` is
  nonzero and `state === "working"`.
- `ceiling_usd()`/`read_ceiling()` picks up a `Budget: $N` line from a fake brief file, and
  `budget_usd` (once wired above) overrides it.
- `grant(usd)` raises `allowance_usd()` by that amount and clears `g.gated`, so a second
  `gate_check()` does not re-fire the card.

Run it (`node Servex/agents/spend-gate-proof.mjs`), paste the pass/fail output as a `log` line in
your task.jsonl.

## Land

1. All proofs green: your new one, plus confirm you did not break `node Servex/agents/wake-proof.mjs`
   and `node Servex/agents/revive-guard-proof.mjs` (read-only check — run them, don't edit them).
2. `node --check` on every file you touched.
3. Commit in the worktree: only `Servex/agents/Agents.js Servex/cards/Cards.js
   Servex/agents/tools.js Servex/agents/spend-gate-proof.mjs`.
4. Write a one-line `outcome` in your task.jsonl (`landed_at` + `outcome`) and stop. Do NOT run
   merge.mjs yourself — report back to your parent (mastermind-token-reduction) with the commit
   sha and what passed; the parent merges.

## Not in scope here (left for a later pass, named so it isn't silently dropped)

- Pricing a Claude (non-OpenRouter) agent's spend mid-turn with `tiers.js` — today `spent_usd()`
  for a Claude agent only knows its cost at turn end (`result()`). Leave it: the exploited path in
  the owner's own evidence (the $17 Gemini overrun) is OpenRouter, which is already metered
  live via `meter()`. Note this gap in your task.jsonl as a `log` line, don't build it.
- The Sessions grid UI column for `since_result_usd` — a front-end page change, out of this
  minion's fence. Note it in your task.jsonl; it's a follow-up, not part of this merge.
