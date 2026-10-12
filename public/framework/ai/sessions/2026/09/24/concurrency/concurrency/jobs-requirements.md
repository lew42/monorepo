# Jobs brief — start_job: background work done by node, answered as a message

Load the `minion` skill first. Read `requirements.md` beside this file (the owner's words: "Maybe the MCP server, as a node process, can help coordinate asynchronous things: reading a bunch of files, or even making little decisions"). Then `proposal-node.md` beside it, which is the design you are building, and `doc/node-jobs.md`. Then `Servex/agents/readme.md` and `Servex/agents/Agents.js` (read only).

**Work ONLY in the worktree `C:/Code/lew42/worktrees/concurrency`.** Sibling minions are editing `Agents.js`, `tools.js`, `registry.js`, `MCP.js`, `ops.js` and `roles.js` there, so do not touch those. Commit only your own files (`git add <files>`).

**Fence (write):** a new `Servex/agents/jobs.js`, a new `Servex/agents/jobs-proof.mjs`, and a new `Servex/agents/doc/jobs.md`.

## Deliverables

1. `jobs.js` exports `job_tools(host)`, the same shape as `tools(host)`: a `start_job({kind, args, from})` tool that starts the work and returns `{job_id}` at once. When the work finishes, `host.get(from).send(summary, {from: job_id, reply_to: ...})` delivers at most 300 chars plus the path of the full result file, written through `host.store()` (Servex's single writer) as `job-<id>`. If `from` is not a live agent (e.g. a VS Code tab), the result is just kept, and a `job_result({job_id, wait_s?})` tool returns it, waiting up to wait_s if it is not done yet.
   Kinds, in this order:
   - `read`: files or a glob. Returns the size, line count, and the lines matching `args.find`; with `args.full`, it returns the full text up to a cap.
   - `grep`: ripgrep (or a node fallback) inside a given dir, never `/`.
   - `watch`: follow a file until a regex appears, or until a timeout.
   - `decide`: node gathers the text of `args.files`, then makes ONE SDK `query()` with no tools, `settingSources: []`, a one-line system prompt, Sonnet (`claude-sonnet-5`), and `args.question` plus the gathered text. It returns the answer and its usage.
   - `check`: `node --check` on the files named. Page loads are optional; skip them if Playwright wiring is heavy, and say so.
   The job also logs `{type:"job", state:"started"|"done", job, kind, ms, ok}` to the CALLER's agent log (`agent-<from>`) when `from` is given.
2. `jobs-proof.mjs`: standalone, with its own `Agents` host and a fake agent (an object with `.send()`, like the Dispatcher). Run read, grep, watch, check and decide, and print each one's return ms (should be about 0) and done ms. Put `decide`'s tokens and cost in `C:/Code/lew42/monorepo/public/framework/ai/2026-09-24/concurrency/jobs-proof.txt`.
3. `doc/jobs.md`: what it is, the kinds, when to use a job, `decide`, a fork or a minion, one line each. Under 50 lines.
4. Commit. Reply with each kind's measured times, decide's cost, and anything left open.
