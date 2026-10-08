# Token accounting — findings (investigation, 2026-10-07)

One real bug found and fixed (it was silently hiding most of the real spend). One more
found, verified, and left for `plan.md` (too risky to hot-fix in this pass). Everything
below is checked against real files on this machine, not assumed.

## The big one, fixed: `find_transcript()` only ever found ONE project folder

`Server/session-cost.mjs`'s `find_transcript(session_id)` is the function every cost
reader in this repo (`task-cost.mjs`, `spend-tree.mjs`, the Sessions tab) calls to get an
agent's REAL, complete cost — it's supposed to search every `~/.claude/projects/c--Code-
lew42-*` folder, because a worktree session's transcript lives under its own, differently
named folder. The code to do that already existed and even said so in its own comment —
but the match was case-SENSITIVE (`startsWith("c--Code-lew42-")`, lowercase `c`), while
the Claude CLI names a **worktree's** project folder with an **uppercase** `C`
(`C--Code-lew42-worktrees-<slug>`). Checked live: of **145** real project folders on this
machine, the old check let through exactly **1** — the main checkout itself, which only
matched by luck (`c--Code-lew42-monorepo` happens to start lowercase).

**Why this matters so much:** worktrees are where most real multi-file work happens (the
sub-mastermind skill routes almost everything there by default). Every one of those
agents' real cost was invisible to `find_transcript()`, so every reader fell back to the
agent's own running-total log instead — and the 2026-10-04 `token-accounting` task
already proved that fallback undercounts by 20–60%+ whenever the transcript can't be
read (a dropped SDK `result` event, a revive, a restart). This is very likely why **the
week ran out two days early**: a large share of real, billed spend from worktree-run
work was never priced correctly anywhere in this repo's own ledgers.

**Fixed** (`Server/session-cost.mjs`, one line, case-insensitive match). Verified before
and after with a scan of the real registry: agents with a `session_id` but no findable
transcript dropped from **499 of 2101** to **11 of 2101** (and those 11 are legitimately
gone — a test placeholder id, and a couple of session pairs that likely never completed a
turn). Script: `scratch-scan.mjs` in this dir, rerunnable.

## Found, verified, NOT fixed here: an OpenRouter agent's logged "cost" is stale by one turn

Every agent's "result" line (written to `agent-<id>.jsonl` on every turn, the thing
`task-cost.mjs`/`spend-tree.mjs` sum) is built like this (`Agents.js`, `result()`):

```
if (this.provider === "openrouter") this.refresh_or_cost();   // async, NOT awaited
else this.cost = message.total_cost_usd ?? this.cost;
...
this.emit({ type: "result", cost: this.cost, ... });            // reads it right away
```

`refresh_or_cost()` has to `await` a network call (OpenRouter's own billing settling) to
learn the real price of the turn that just finished — so the very next line, which logs
`this.cost` into the permanent record, almost always fires BEFORE that await resolves. It
logs last turn's number, not this one's. The real number does land in `this.cost`
eventually, but nothing re-logs it — the next turn's result line picks it up only if
there IS a next turn. **The agent's very last turn's real cost is never captured in its
own ledger at all.**

Verified against a real OpenRouter agent (`echo-57d98556`): its 2nd turn really cost
`$0.3124` (`openrouter.jsonl`, the real metered log), but the agent's own `result` line
for that turn logged `cost: 0`. See `reconcile.mjs`'s run below.

**Why not fixed now:** the fix is to `await` the price before emitting (or emit a second,
corrected line once it resolves) — a real change to a hot path in `Agents.js` that every
live agent runs through, with its own test (`openrouter-cost-blind-proof.mjs`) already
covering adjacent behavior. That's past "a wrong rate" territory into "ask before major
surgery" — written up as a prioritized, scoped item in `plan.md` instead.

## Phase 1 — the architecture, verified

**1. How Servex spawns agents / exposes tool capability.** Every Servex agent is one call
to `query()` from `@anthropic-ai/claude-agent-sdk` (`Servex/agents/Agents.js:1, :881`) —
the same official SDK, which runs the `claude` CLI as a child process under the hood, so
every agent writes the exact same transcript format the CLI itself would. In-process
tools (`spawn_agent`, `page_add`, etc.) are exposed through `createSdkMcpServer()`
(`Servex/agents/tools.js:1, :384`) — an **in-process** MCP server, no network hop, each
tool a plain `tool()`-wrapped function. This is why Servex-spawned agents and a VS Code
tab's own CLI session are both just rows in `~/.claude/projects/...` — there's only one
underlying session mechanism.

**2. Session file timing; sub-agents.** The CLI (and therefore the SDK) appends to
`~/.claude/projects/<folder>/<uuid>.jsonl` turn by turn, in near real time — this is
*why* the Stop hook (`node Server/session-cost.mjs --append-stdin`, wired in
`.claude/settings.json`) can price a turn seconds after it ends. A **spawned Servex
agent** (a minion, via `spawn_agent`) is its OWN separate `query()` call with its OWN
session id and OWN transcript file — never a sidechain inside the parent's file. The SDK
*also* has its own in-process subagent concept (`forwardSubagentText`,
`parent_tool_use_id` on a message, `Agents.js:931-934, :1314-1327`) — those ARE nested
lines inside the SAME transcript (tagged `nested: true`), but Servex doesn't appear to use
that SDK feature for real minion spawns (every minion in the registry has its own
`session_id`); it's seen on the delta/text-block event path only. Not fully chased further
— named as a minor open question in `plan.md`, not guessed at.

**3. Where today's cost computation can be wrong.** Full map already lives in
`ai/sessions/doc/decisions.md`'s 2026-10-04 entry (re-verified here, still accurate) —
the short version: `session-cost.mjs` reads a session's own transcript (now fixed to find
ALL of them, see above); `task-cost.mjs`/`spend-tree.mjs` prefer that transcript over the
agent's own log, falling back only when no transcript is found (now much rarer). The
**new** item this task found: the OpenRouter stale-cost race, above. **Still true, not
re-litigated:** a minion with no recorded `parent` in the registry is invisible to
`task-cost.mjs`'s per-task tree walk (named in decisions.md already).

**4. Which spawned agents have no session file or no ledger line (measured live).**
Of 2107 registered agents: **6** never got a `session_id` at all (one `dispatcher` that
never spawns, and a handful of old minions — `scratch-scan.mjs`'s output), **8** have no
`agent-<id>.jsonl` log file at all, and — after the fix above — only **11** have a
`session_id` with no findable transcript (down from 499). None of this is hidden data
loss at scale; it's a small, named tail now instead of half the fleet.

**5. Real-time usage; would we need to wrap the SDK?** Already done, today: every
`assistant` SDK message carries `message.usage` per turn (`Agents.js:1316`,
`this.last_usage`), and `Agents.js` already uses it live for OpenRouter per-call pricing
(`price()`/`meter()`) and for the live "context" figure shown on an agent's card. So the
SDK already reports usage per message, and Servex already wraps it — the gap isn't
"can we get real-time data", it's "does every write path actually persist the number
before something else reads it" (exactly the stale-cost race found above).

## Deliverable 2 — reconciliation, 3 real sessions (`reconcile.mjs`, rerunnable)

| session | ledger says | real total says | gap |
|---|---|---|---|
| plain (this task's own mastermind) | $11.7096 | $4.4708 (transcript) | ledger reads **higher** — flagged below, not fully explained |
| root + 192 minions (`task-mastermind-loose-ends`) | $49.93 (whole tree) | $107.08 (whole tree) | ledger undercounts by **54%** |
| OpenRouter (`echo-57d98556`) | $0 | $0.3124 (real metered) | ledger misses the agent's last-priced turn entirely |

**Flagged, not resolved:** session 1's direction is backwards from the other two (ledger
HIGHER than the transcript, not lower). Worth a second look — possibly a compaction or a
resumed session id carrying over a stale higher total — but this task's own session is
still live while writing this, so re-running `reconcile.mjs` after this task lands (on a
closed transcript) would be a cleaner check than guessing now. Named as an open item in
`plan.md`, not swept under the $107 vs $49.93 headline number above.

## Addition (owner, same day): realtime — using the existing stream, not a new one

Checked, as asked, before writing the plan (full detail now lives at
[`ai/sessions/doc/realtime-plan.md`](/framework/ai/sessions/doc/realtime-plan.md), linked
from that dir's readme so it survives past this chat):

**(1) How core/Page streams `page.jsonl` today.** A WebSocket, not SSE, not polling:
`dev/Socket/Socket.js` sends `subscribe(path, offset)`; the dev server
(`Server/plugins/SocketServer/Tail.js`) tails the file and pushes back `jsonl(path,
lines, offset)` the moment new bytes land — byte-offset only, never a replay.
`ext/JSONL/live.js` is the browser-side wiring; `JSONL.live()` is the one call a page
makes to use it. Localhost only; off the dev server a page just fetches once (fine here —
this tab is dev/localhost-only already).

**(2) Does `sessions/` already reuse it?** No. Checked directly in `page.js`: every
number on this page — `sessions.json`, `week.json`, `spend-tree.json` — comes from a
plain one-shot `fetch()` of a snapshot a script has to be re-run by hand to refresh.
Even the ONE live-jsonl-eligible file this page already touches, a session's own
`page.jsonl` (the Stop hook's `{"cost":...}` lines), is read with a one-shot
`get_jsonl()`, never `JSONL.live()`. This page has never used the fast path — it isn't a
second stream to retire, it would be the FIRST real use of the one that exists.

**(3) Can the same mechanism tail a session's cost lines, and who writes them live?**
Yes, mechanically — it tails any `.jsonl` under `public/`, so a new `session.jsonl`
works exactly like any other. Who writes it, and how fast, differs by kind: a Servex
agent's `Agents.js` already sees every SDK message live, in-process (`assistant()`,
`result()` already read `message.usage` per message for OpenRouter pricing) — it could
append a cost line per MESSAGE, true sub-turn realtime. A VS Code tab/plain CLI run has
no such in-process watcher; only the Stop hook sees it, once per WHOLE TURN (it re-reads
the full transcript after the turn ends) — that's this kind's real ceiling, not a bug to
fix. Recommendation, tradeoff, alternative, and the staged migration (`sessions.json` →
live `session.jsonl`, Servex rows first) are all in `realtime-plan.md`.

## Addition (owner, same day): session freshness — is a long session quietly expensive?

Full writeup: [`ai/sessions/doc/context-cost.md`](/framework/ai/sessions/doc/context-cost.md),
linked from that dir's readme. Measured against a real 5,142-turn session
(`361c4d18…`, `context-measure.mjs` in this dir, rerunnable on any session id) —
the owner's instinct was right, and by a bigger margin than guessed:

**(1) How much of a long session's $ is repeated context, not new work — measured.**
**79.2%** of this session's whole $1,709.65 was `cache_read` (re-reading old context),
another **13.5%** was `cache_write` (re-priming it), and genuinely fresh input was
**$0.0003** — three hundredths of one cent, across 5,142 turns. Only **7.3%** (the
output tokens — the model's own words) was anything resembling "new work." The
owner's own back-of-envelope ("12 tool calls over a 100k window is ~1.2M cache-read
tokens") undersells it if anything: $/turn grew **4x** from the session's first 10
turns to its last 10, because the context itself kept growing even through several
in-place `/compact` resets (context size bounced between ~50k and 1.8M tokens across
the transcript, confirmed by direct measurement — `compact()`/`oversized()` in
`Agents.js` already exists and fires at 200k tokens, but the session re-grows past it
quickly and compaction summarizes in place rather than truly resetting).

**(2) Does a gap actually break the cache? Measured, not assumed — yes, badly.**
Every gap over roughly the 1-hour cache TTL shows the exact signature: `cache_read`
collapses to a small floor (~27k-57k, likely just the system prompt + tool schemas)
while `cache_write` jumps to the FULL context size, repriced at the cache-write rate
(2x input, this repo's own confirmed rate). Real examples from this one session: a
6-16 hour gap turned a turn that would have cost **$0.15-0.55** (a normal cache hit at
that context size) into one costing **$5.82-$8.08** — 15-50x more expensive, for the
exact same context, purely because nobody talked to it for over an hour.

**(3) Where Servex already decides resume-vs-fresh — and the gap is real.**
`Layers.js` (the card assistant/manager tier) ALREADY has exactly the rule the owner
is describing, built 2026-09-28, in the owner's own words in the code comment:
*"FRESH, NOT COMPACTED"*. `stale()` refuses to resume an assistant whose context is
`>= resume_max_tokens` (30,000) OR whose last use is `>= resume_max_age_ms` (**60
minutes — already tied to the cache TTL**), and a manager past `fresh_at.manager`
(150,000 tokens) the same way. When stale, `ask_checkpoint()` asks the agent for ONE
line (`card_summary`: decisions, open questions, what it was mid-task) and restarts it
FRESH under the same id rather than resuming the bloated session. **This exact
mechanism does not cover masterminds or task-masterminds** — those only go through
`Agents.js`'s generic `sleep()`/`awaken()`/`compact()` path, which resumes a dormant
agent's session regardless of how long it's been idle (no age check at all) and only
ever compacts in-place at 200k tokens (an SDK summarization, not Layers.js's "ask for
one checkpoint line, then truly restart fresh" pattern). A long-lived mastermind or
manager-type agent that sleeps overnight and gets woken the next morning is
GUARANTEED a cache-miss-priced first turn under today's code — exactly the 15-50x
spike measured in (2).

**Recommendation (decided, alternative named):** extend `Layers.js`'s existing
`stale()`/`ask_checkpoint()` pattern to masterminds and task-masterminds in
`Agents.js`'s own `awaken()` path, rather than inventing a second mechanism (CLAUDE.md
law 6 — one rule for "should this agent resume or restart fresh", reused where it
isn't wired up yet). **Alternative considered:** raise `compact_tokens` sensitivity
or add an age check to `oversized()`/`compact()` instead — rejected as the first
choice because `/compact` summarizes IN PLACE (same session, same growing id), while
the owner's own words describe wanting a genuinely NEW session with a short,
deliberately batched re-read — exactly what Layers.js already builds, not what
`compact()` does. `context-cost.md` has the full mechanism proposal (a context-size +
cache-read-cost column on the Sessions grid, a "consider fresh session" signal, and
the handoff shape) for the next task to build.

## Addition (owner, same day): post-analysis over real history — where the $ went

Now that `find_transcript()` is fixed and `spend-tree.json` is reliable (re-run,
see above), `post-analysis.mjs` (this dir, rerunnable) scans every registered agent
and every `task.jsonl`. Real numbers, this run:

- **Total: $9,730.54 Claude $, 2,113 agents.** By model: `claude-opus-5-5` $4,569 and
  `claude-sonnet-5` $4,142 are nearly even — Opus is NOT a small minority of spend.
  By role: `task-mastermind` $4,429, `minion` $2,969, `mastermind` $1,406.
- **Opus/Fable spent on minion-tier work: $499.07 across 82 minions**, with no
  stated reason recorded on any of them — against the house rule (model-defaults
  memory note): "spawn on Sonnet by default, Opus only with a reason." This is the
  single most directly actionable number in this whole report: ~5% of all spend is
  minions that should, by policy, have been on Sonnet.
- **"Long window" candidates (the session-freshness signature, applied as a real
  filter): $2,265.92 across 62 agents** — over 70% cache-read AND over $15 real
  money. These are exactly the agents plan.md item 8 (extend `Layers.js`'s fresh-not-
  compacted rule) would have caught.
- **Stopped-in-flight waste: $1,675.37 subtree $ across 14 roots whose own
  `task.jsonl` never got a `landed_at` line** (checked against the real file — a few
  of these may be genuinely still-open tasks, not abandoned ones; read the task dir
  before assuming waste). The two biggest: `task-mastermind-openrouter` ($619 subtree)
  and `task-mastermind-one-dictation` ($609 subtree).

**Not duplicated:** a separate Haiku agent (`prompt-audit`) is already auditing
unbuilt owner asks — a different question (what was asked but never built) from this
one (what was built and cost money, landed or not). No overlap.

## Addition (owner, same day): cheap-first-opinion — and its own real cost

The owner's proposal: for most tasks, have a Sonnet minion take a quick first look
(readmes, a quick answer) before a bigger/pricier agent spends anything — but with
the owner's own caveat that a cheap agent reading hundreds of files is itself not
free. Measured, not assumed (`cheap-first-tradeoff.mjs`, this dir): the 8
highest-spending real Sonnet minions each made 74-206 Read/Grep/Glob/ToolSearch
calls, costing **$0.15-$0.39 per read-shaped call** (**$0.26 average**) — a minion
doing 200 unscoped reads can cost $30-70 on its own, on the "cheap" model. **The
caveat is real, confirmed by real data**, not a hypothetical.

**Proposal:** a cheap-first-opinion pattern, with the owner's own caveat built in as
a hard rule rather than a suggestion:
1. Before a mastermind spawns a bigger/pricier agent for genuinely new-looking work,
   it first spawns (or does itself, if cheap enough) a quick Sonnet pass — but that
   pass answers from the readme chain and a SCRIPT-computed shortlist (grep/glob run
   as a tool, not 100 individual Read calls the model chooses one at a time), never
   an open-ended "look around" with no file budget. This is already half-policy
   (CLAUDE.md law 7, "compute, don't recall" — a script finds the files, the model
   only reads what the script names) — the gap is that nothing currently REFUSES a
   cheap-first pass that blows past a read budget without producing an answer.
2. **Mechanism:** reuse `Agents.js`'s own existing read-loop guard
   (`tool_started()`'s `SERVEX_READ_WARN`, already fires a warning at 40 reads) —
   extend it from a warning to an actual gate for a cheap-first-opinion role
   specifically: past N reads with no shortlist/grep call among them, refuse further
   individual `Read` calls and tell the agent to compute a shortlist instead. Reuses
   an existing mechanism (law 6) rather than building a second budget system (the
   spend gate, `gate()`/`allowance_usd()`, already exists for $ — this is the same
   idea applied to read COUNT for this one role).
3. **Default, alternative named:** default the read ceiling to 40 (the number
   already live as a warning threshold, just promoted to a real gate for this role)
   rather than inventing a new number from nothing. Alternative considered: gate on
   $ spent instead of read count — rejected as the first choice because the`spend
   gate already exists for $ project-wide (`gated_role()`), and a read-count gate is
   the more direct lever for "stop reading file-by-file, compute a shortlist" (the
   owner's actual complaint), not a $ ceiling that could be hit by one single
   expensive turn instead.

## Also noted (not this task's to fix): the quick-fix worktree pool is stuck

7 stale worktrees (`qf-2`, `qf-4` through `qf-9`) sit in `C:/Code/lew42/worktrees/`,
several holding uncommitted work from stopped agents (`git worktree list`, checked live).
This is why this task worked directly in the main tree for its own output files instead
of taking a pool worktree, per its own brief. Not investigated further (out of this
task's fence) — just named here so it isn't lost.
