# log-model — the event log, the projections, naming, and the simplest conflict rule

Minion: Opus, effort high. Session id `66db742f-72f8-49a0-ba61-2a55c7dfabcb`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then sections **D**,
**E** and **F** of [`../mastermind-servex/requirements.md`](../mastermind-servex/requirements.md).
This is a **design** task: one page, one schema file, a worked example. Build no server code.

## What exists — read first, so the design continues it instead of replacing it

- `public/framework/ext/JSONL/doc/task-jsonl.md` — today's task log schema (verbs `assign`
  `log` `action` `agent` `chat` `shot` `ask` `decision` `verdict` `rank`; `assign` merges,
  `agent` merges by `task`, `ask` by `id`). `ai/board.jsonl` — the owner's board: `card` lines
  merged by `id`. `.claude/skills/every-prompt/say.mjs` writes both.
- `ai/2026-09-19/card-replies/` (a button on a card → a line in the mastermind's inbox) and
  `ai/2026-09-19/assistant-stream/` (`claude -p --include-partial-messages` deltas streamed as
  `ask_chunk` events) — the two loops that already run.
- The sibling task `agent-host` is writing one JSONL per agent session with event types
  `transcript delta tool result agent_msg subagent error`; `servex-port` is writing the
  single-writer appender. Your schema must contain theirs — read their briefs beside this one.
- `.claude/hooks/ledger.mjs` — the PostToolUse hook that already records file touches.

## Deliverables

1. **The event schema — `ai/2026-09-22/log-model/events.md`.** One append-only JSONL per
   session. Every entry is `{at, id, type, by, …}` — typed, immutable. Define each type the
   owner named and the ones the existing verbs need: `transcript`, `delta`, `intent`, `name`,
   `decision`, `task`, `agent_msg`, `file_touch`, `prompt` (raw), `refined`, `proposal`,
   `approve`, `rename`, `dispute`, `card`, `ask`, `answer`. For each: the fields, one example
   line, and which entries it may reference (`re: <id>`). Say how today's verbs map onto it
   (`assign.now` → ?, `log` → ?, `agent` → ?) so nothing already on the board is orphaned.
2. **Projections.** Tasks, decisions, proposals, prompts and cards are folded from events, never
   edited in place. Write the fold rules as plain sentences with one worked example each: a
   `task` is the newest `task` event per id plus every `decision` and `file_touch` that
   references it; a name is the newest `name` unless an `approve` locked it; a `dispute` adds an
   alternative without replacing the visible one. Show the fold as a ~40-line JS function on
   your page that a reader can run in the console over a sample log (a `sample.jsonl` you write,
   ~30 lines, telling one small story from raw prompt to approved name).
3. **The prompt lifecycle** — raw → refined (citing spans of the raw text by character offsets
   or by sentence index; pick one and say why) → pre-proposal → proposal → build. One example
   thread in the sample log.
4. **The naming rules as checks, not prose.** The fast assistant names at once; a mastermind may
   propose alternatives; nothing the owner has seen is renamed unless they ask; an approved
   name is locked. For each rule, the event that expresses it and the condition a writer must
   check before appending (e.g. `rename` on a `seen` name from anyone but the owner → refused,
   becomes a `dispute`). Say who enforces the check: the appender, so no agent can bypass it.
5. **The conflict recommendation (E).** Weigh the four options the owner listed — append+fold,
   pecking order, a log assistant, first-proposer ownership — against the naming rules, and
   recommend the simplest that satisfies them, in two sentences, with the case in which the
   runner-up would be better. The mastermind's lean is (1) append+fold with (2)'s visibility
   rule layered on; argue against it if the sample log shows a hole.
6. **The tiers (F) in one diagram or table:** fast assistant (Sonnet low, names and cards in
   seconds, relays verbatim, never filters) → masterminds at chosen efforts (dispute, refine
   downward, never overwrite) → the owner (optional ✓/✗ per item). Say what each tier may
   append and what it may not.

All of it on one page, `ai/2026-09-22/log-model/page.js`, level 1 first: the schema table and
the recommendation above the fold, the fold function and the sample one click down.

## Fence

Your task dir only, plus `ai/2026-09-22/page.js` `children:` (add your slug). Nothing under
`Servex/`, `Server/`, `ext/JSONL/`.

## Length

`events.md` under 200 lines. The page: one screen above the fold, two in all. Landing report:
eight sentences, the recommendation in the first.
