# agent-host — Claude sessions held in memory, spawned, messaged and interrupted through Servex

Minion: Opus, effort high. Session id `e69d8104-747e-4a3c-a7f6-d04d37985fc6`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then section **B**
(and the "Shape" paragraph) of
[`../mastermind-servex/requirements.md`](../mastermind-servex/requirements.md) — the owner's
own words. Load the `claude-api` skill before you touch the SDK. Private port if you need one:
**8092**.

## What exists

- `@anthropic-ai/claude-agent-sdk` **0.3.280** is installed in `Servex/node_modules/`
  (`Servex/package.json` is done — do not edit it). `import { query } from
  "@anthropic-ai/claude-agent-sdk"` works from any file under `Servex/`. Its exports include
  `query`, `tool`, `createSdkMcpServer`, `forkSession`, `getSessionMessages`, `listSubagents`,
  `getSubagentMessages`. Read the package's own `README.md` and `.d.ts` in `node_modules` for the
  truth — the option names the owner remembers (`includePartialMessages`, `forwardSubagentText`)
  must be checked against the installed version; log what each actually is called, or that it
  does not exist and what does the job instead.
- The sibling task `servex-port` is building `Servex/` at the same time — the proxy, the process
  supervisor, the single-writer log (`Servex/Log.js`, `append(name, entry)` / `POST /log/<name>`)
  and the `/mcp` endpoint with a registration seam `servex.mcp.tool(name, schema, handler)`. You
  do not import any of it and it does not import you; integration is the next task. Your code
  lives in **`Servex/agents/`** only.
- The CLI launch recipe that works today, for comparison, is in the run ledger: a `claude -p`
  minion with `--permission-mode acceptEdits --allowedTools "Bash,Read,Write,Edit,Glob,Grep"`
  can run node and write files. `--permission-mode bypassPermissions` is refused by the
  classifier on the CLI. Find what the SDK equivalent is and prove it the same way (the spawned
  agent runs `node --version` and writes a file).

## Deliverables

1. **`Servex/agents/Agents.js`** — the host. A `Map` of live sessions. `spawn({name, role,
   model, effort, prompt, cwd, visibility})` starts an SDK `query()` in **streaming-input mode**
   (an async iterable of user messages fed from a per-agent queue, so the session stays alive and
   steerable between turns). `send(id, text, {from, reply_to})` pushes a message onto that queue,
   **wrapped** so the agent can see who asked and where to answer — a plain, readable envelope
   like `[from: mastermind-servex · reply to: log agent-host]\n<text>`. `interrupt(id)` uses the
   SDK's interrupt. `list()` returns `{id, role, model, state, visibility, started_at, turns}`
   per agent. `stop(id)` ends the session cleanly. House style: `code` skill (assign-based OOP,
   every method a seam, parts as static subclasses — `Agents.Agent` for one session).
2. **Human-readable ids, never UUIDs.** `<role>-<name>` (`minion-servex-port`,
   `mastermind-servex`); a collision gets `-2`. The SDK's own session uuid is kept on the agent
   as `session_id` so `claude --resume` still works from a terminal — and logged.
3. **Every SDK message becomes one typed event on the agent's own JSONL** — `{at, agent, type,
   …}` where `type` is one of `transcript` (assistant text, complete), `delta` (a partial-message
   token chunk, so a UI can stream), `tool` (a tool call: name + a short input summary), `result`
   (turn ended: cost, duration, turns), `agent_msg` (an injected message, with `from` and
   `reply_to`), `subagent` (nested transcript text, if the SDK forwards it), `error`. Write them
   through one seam — `this.log(entry)` — that today appends to
   `%LOCALAPPDATA%/lew42/servex/logs/agent-<id>.jsonl` with `fs.appendFile`, and that the
   integration task will point at `Servex/Log.js`. Keep the raw SDK messages out of the repo:
   they are in the SDK's own session store; your JSONL is the projection.
4. **`Servex/agents/tools.js`** — exports an array `[{name, schema, handler}]` for
   `spawn_agent`, `send_to_agent`, `interrupt_agent`, `list_agents`, in the same shape
   `Server/plugins/MCP.js` uses for a tool (read it: `name`, `description`, `inputSchema`, and a
   handler returning MCP content). Each handler is one line calling `Agents`. Not wired anywhere
   yet — the sibling's seam takes this array.
5. **`Servex/agents/demo.mjs` — the proof, runnable by anyone:** `node Servex/agents/demo.mjs`
   spawns one Haiku agent (`claude-haiku-4-5-20251001`, effort low) with a small job (count to
   twenty slowly, one number per line), streams its deltas to stdout as they arrive, sends it a
   mid-run message after two seconds ("stop at ten and say who told you to"), then spawns a
   second agent, lists both, interrupts the first, and prints the tail of each agent's JSONL.
   Measure and log: time from `spawn` to first delta; that the mid-run message was seen (the
   agent names the sender from the envelope); that `interrupt` stopped output within a second;
   the cost of the run from the `result` events. A second proof: an agent that runs `node
   --version` and writes a file under your task dir — the permission question, answered.
6. **`Servex/agents/readme.md`** — one screen: what it is, the five verbs, the id rule, the
   event types, the seams the integration task will connect (`this.log`, `tools.js`), and the
   two things the owner asked for later that are designed in but not built (sub-masterminds
   spawning masterminds; minions spawning minions — say in one sentence each how `spawn` already
   allows it, or what is missing).

## Fence

`Servex/agents/**` and your task dir. Append-only to `.jsonl`. Nothing else — not
`Servex/package.json`, not the sibling's files, not `Server/`, not `public/`. Files the demo
writes go under your task dir or the scratchpad.

## Length

Aim under ~350 lines for `Agents.js` + `tools.js`; the demo under 120. Landing report: ten
sentences, with the four measured numbers.
