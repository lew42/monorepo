# Node does the background work

Most of what an agent waits on has no decision in it: reading files, counting matches, loading a
page, running a test, watching a log for a line. Servex is one long-lived node process, and its tool
handlers are plain node functions, so that work can run there. The agent hands it off, ends its
turn, and hears back when it is done.

## Why it matters

Today, when a mastermind checks "does the page still load?", it runs the check as its own tool call.
For the 20–40 seconds that takes, it is deaf: the owner's message, a child's `done`, a question from
another agent all wait in its queue. And the check costs model tokens for work with no judgement in
it.

## One tool: `start_job`

An agent calls `start_job({ kind, args, note })`. The handler starts the work and **returns at
once** with `{ job_id: "job-7" }`. The agent ends its turn. When the job finishes, Servex delivers one
message into the caller's queue through the same `wake_parent` path a child agent uses:

```
[from: job-7 · reply to: log agent-mastermind-servex]
done: load_page /framework/ai/ — 200, 0 failed requests, 1 console error
("x is not defined", app.js:41). Full result: logs/job-7.json
```

The message is at most 300 characters plus the path of the full result. The full output never
enters the agent's context, so later turns do not re-read it.

## The five kinds — built, and measured

All five are real. Every `start_job` call returned in 0–2 ms; the table's last column is how long the
job itself took in the proof run ([jobs-proof.txt](../jobs-proof.txt), 2026-09-24).

| kind | what node does | measured |
|---|---|---|
| `read` | reads files or a glob; returns sizes, line counts, and the lines matching `args.find` | 46 ms |
| `grep` | ripgrep inside the repo, never `/`; the MSYS path trap handled once, here | 46 ms |
| `check` | `node --check` on the named files, then a headless page load counting failed requests and console errors | 69 ms (a page load takes longer) |
| `watch` | follows a log until a pattern, a hold clearing, or an agent's `result`, with a timeout | 1 s (as long as it waits) |
| `decide` | node gathers the facts, then asks ONE question of Sonnet with no tools | 2.6 s, $0.05 |

`decide` is for a pick-one over facts node gathered, when the agent's own context is not needed. When
it is needed, a fork is the better call — and measured, it was cheaper too ($0.014 for a fork against
$0.05 for `decide`), because the fork reads its context from the cache (see [forks.md](forks.md)).

## Where it shows

- Two lines in the caller's own agent log: `{type: "job", state: "started"}` and
  `{type: "job", state: "done", ms, ok}`. The board already streams that log, so a running job
  appears under its agent as a small chip with a timer.
- The full result goes to `%LOCALAPPDATA%/lew42/servex/logs/job-<id>.json`, through Servex's single
  writer.
- A job is not an agent: no `registry.json` row, no `task.jsonl` line. The agent logs what it
  concluded, not what node read for it.

## Timing

A mastermind's turn can end the moment `start_job` returns — 0 to 2 ms, measured. The check still takes 20–40 seconds, but
in node, and any message that arrives meanwhile is answered at once. A night run does dozens of these
checks, so this saves minutes of unanswered messages per hour (a guess), and 2–10k tokens per check
that every later turn would have re-read (also a guess).

## Traps

- A job never starts a job or an agent. Node work stays plain node — that is the recursion door shut.
- A job never writes repo files. It reads, runs and reports; the agent that asked decides and edits.
- Never put a job's full output in the wake — a summary and a file path.

From [proposal-node.md](../proposal-node.md).
