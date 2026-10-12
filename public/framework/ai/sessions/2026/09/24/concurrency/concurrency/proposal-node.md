# Proposal — let node do the background work (angle: `node`)

## The rule

**If a job needs no judgment, Servex's own node code does it; if it needs a little judgment, node
gathers the facts and asks a cheap one-shot model; only real judgment goes to a fork or a minion —
and every one of the three answers later, as a message, so the agent that asked is never stuck
waiting.**

## Why this matters

Today, when a mastermind wants to know "does the page still load?", it runs the check itself, as a
tool call. For the 40 seconds that check takes, the mastermind is deaf: a message from the owner,
a child's `done`, a sibling's question all sit in its queue until the tool returns. And the check
costs model tokens for work that has no decision in it — reading files, counting matches, loading
a page, running a test, watching a log for a line.

Servex is already one long-lived node process that holds every agent and runs tool handlers as
plain node functions ([tools.md](/framework/ai/2026-09-22/tiers-design/doc/tools.md)). So the work
can move there, and the agent's turn can end the moment the job is handed off.

## The design

### One tool: `start_job`

An agent calls `start_job({ kind, args, note })`. The handler starts the work in the background
and **returns at once** with `{ job_id: "job-7" }`. The agent ends its turn and is free.

When the job finishes, Servex delivers one message into the caller's queue — through the **same
`wake_parent` path a child agent uses**, so there is no second way to reach an agent:

```
[from: job-7 · reply to: log agent-mastermind-servex]
done: load_page /framework/ai/ — 200, 0 failed requests, 1 console error ("x is not defined",
app.js:41). Full result: logs/job-7.json
```

A job sits in the `live` map the way the Dispatcher does (a `.send()` and a `parent`), so
`wake_parent` needs no change. The message is at most 300 characters plus the result file's path.

### The kinds, first five

| kind | what node does | typical time |
|---|---|---|
| `read` | reads files or a glob, returns sizes, line counts, and the lines matching `args.find` | < 1 s |
| `grep` | ripgrep inside the repo (never `/`), with `MSYS_NO_PATHCONV` handled once, here | < 2 s |
| `check` | `node --check` on the files named, then boots a page headless (Playwright, already used by `probe.mjs`) and counts failed requests and console errors | 5–40 s |
| `watch` | follows a log until a pattern, a hold clearing, or an agent's `result` — with a timeout | seconds to minutes |
| `decide` | node gathers the facts from `args.files` / a previous job, then asks ONE question of Sonnet in the minimal config, and returns its answer | 2–3 s |

`decide` is the "little decision". It runs `query()` with no tools, no setting sources, a one-line
system prompt and the gathered text inlined — the 823-token prefix measured on
[model-latency](/framework/ai/2026-09-19/model-latency/) (Sonnet: median about 2 s, $0.002 to say
"ok"). It cannot call tools, so it cannot wander or recurse.

### Where it shows

- Each job writes two lines to the **caller's own** agent log (`agent-<id>.jsonl`): `{type: "job",
  state: "started"}` and `{type: "job", state: "done", ms, ok}`. The AI board already streams that
  log, so a running job appears under its agent as a small chip with a timer.
- The full result goes to `%LOCALAPPDATA%/lew42/servex/logs/job-<id>.json`, through Servex's single
  writer.
- Jobs do **not** go into `registry.json` (they are not agents) and do **not** write to
  `task.jsonl` — the agent logs what it concluded, not what node read for it.

### Choosing the rung: node, `decide`, fork, or fresh minion

| rung | start-up | what you pay | use it for |
|---|---|---|---|
| **node job** | ~0 | nothing in tokens | facts: read, count, load, test, watch |
| **`decide`** | ~2 s | ~1–5k fresh tokens | one yes/no or pick-one over facts node gathered |
| **`fork_self`** | ~3 s (a new `claude` process) | your whole context again, but as a **cache read** (about a tenth of the fresh price) — **per turn** | a decision that needs everything you already know |
| **fresh minion** | ~3 s + reading from zero | the 41k-token as-launched prefix, then every file it reads | a real piece of work with its own files to change |

The one surprise worth saying out loud: **a fork is cheap for one turn and expensive for many.**
Each tool call the fork makes re-reads the whole cached context. A mastermind at 120k tokens that
forks and lets the fork read three files in three tool calls pays four cache reads of 120k — about
the price of 48k fresh tokens (estimate). The same fork handed the three files already read by a
`read` job answers in one turn: one cache read, about 12k fresh-equivalent. So the best pattern for
the owner's "look at these three files, then decide" is **node reads, the fork decides**:
`start_job({kind: "read"})` → on its `done`, `fork_self("given job-7's result, which …?")`.

## Timing (honest estimates)

- **Today:** a mastermind that checks its minion's work runs `node --check` plus a headless page
  load itself: about 20–40 s of deafness per check (guess, from the syntax-guard and probe runs).
  A night run does dozens of these, so minutes of unanswered messages per hour.
- **With jobs:** the mastermind's turn ends in under a second after calling `start_job`; the check
  still takes 20–40 s, but in node, and any message that arrives meanwhile is answered at once.
  Token saving: the tool output never enters the context — only the 300-character summary does
  (guess: 2–10k tokens saved per check, which every later turn would have re-read).
- **Little decisions:** today a mastermind decides inline (free in time but grows its context) or
  spawns a minion (3 s start-up, 41k prefix, a minute or more). `decide` is ~2 s and ~$0.01.

## The picture

```
 mastermind ──start_job(check)──▶ Servex (node)            the mastermind's turn ENDS here
     │  ◀────── {job_id: job-7} ──┘   │
     │                                ├─ node --check
  owner asks "status?" ──▶ answered   ├─ headless page load
  child wakes "done"   ──▶ answered   ├─ (optional) decide ─▶ Sonnet, one shot, no tools
     │                                ▼
     ◀─────── wake: "done: 200, 0 failed, 1 error …" ── job-7 ──▶ logs/job-7.json
```

Three lanes: the agent (always free to answer), node (does the waiting), the cheap model (only for
the one judgment). The arrow back is the same wake a child agent sends.

## What to build next (benefit per effort)

1. `start_job` with `check` and `watch` — the two slowest things masterminds do today; ~100 lines in `Servex/agents/jobs.js`, reusing `wake_parent`.
2. `read` + `decide` — the owner's "look at three files and decide" without a fork; ~60 lines.
3. The board chip for `type: "job"` lines, so the owner sees what node is doing for whom.

## What NOT to do

- Never let `decide` have tools, or let a job start a job or an agent — that is the runaway-recursion door, and node work must stay plain node.
- Never put a job's full output in the wake message — summary plus a file path, or every later turn re-reads it.
- Never let a job write repo files; it reads, runs and reports — the agent that asked decides and edits, inside its own fence.
