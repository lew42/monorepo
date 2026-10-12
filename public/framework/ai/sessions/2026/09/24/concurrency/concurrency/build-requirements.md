# Build brief — fork_self, wait_for_agent, resume/fork spawns, registry sweep

Load the `minion` skill first. Read `requirements.md` beside this file (the owner's words are the acceptance test), then `Servex/agents/readme.md`, `Servex/agents/Agents.js`, `Servex/agents/tools.js`, `Servex/agents/registry.js`, `Servex/MCP.js`, `Servex/agents/doc/traps.md`.

**Work ONLY in the worktree `C:/Code/lew42/worktrees/concurrency`** (branch `worktree/concurrency`). `Servex/node_modules` there is a junction to the main tree's, so `node` runs. Commit there when done. Do not touch the main tree's Servex/, do not restart Servex, do not run `sustain.mjs`.

**Fence (write):** `Servex/agents/Agents.js`, `Servex/agents/tools.js`, `Servex/agents/registry.js`, `Servex/MCP.js`, new files under `Servex/agents/` (a proof script, e.g. `fork-proof.mjs`). `Servex/Servex.js` ONLY for a one-line call at boot for deliverable 4 (another mastermind edits Servex.js too — keep it one line, near `this.tools()` or the Agents construction). Never: Assistant.js, Dispatcher.js, Process.js, sustain.mjs, proxy/keeper files. Log file: `C:/Code/lew42/monorepo/public/framework/ai/2026-09-24/concurrency/task.jsonl` via `node .claude/hooks/append.mjs` (from the main tree root).

SDK: `@anthropic-ai/claude-agent-sdk` 0.3.280. Options `resume` (sdk.d.ts ~2019), `forkSession` (~1641), `resumeSessionAt` (~2033), plus a standalone `forkSession()` function (~770). Read them yourself.

## Deliverables, in order

1. **`spawn` can resume or fork.** `Agents.spawn({resume: <session_id>, fork: true, ...})` passes `resume` / `forkSession` to the SDK. Tool `spawn_agent` gains `resume` and `fork`. A resumed spawn with no prompt must not send an empty turn. A resume must use the original session's `cwd` (sessions are stored per project dir) — document that in the description. Skip the role skill-load preamble on a resume/fork (the session already has its posture).

2. **`fork_self`** (tool). Args: `question` (required), `from` (the caller's agent id, if it is a Servex agent) OR `session_id` (for a session outside Servex, e.g. a VS Code tab: `$CLAUDE_CODE_SESSION_ID`), optional `model`, `cwd`. It spawns a fork (`resume` = caller's session, `fork: true`, `parent` = caller id when there is one, role `fork`, name derived from caller), ONE-SHOT: the fork stops itself after its first result, and its answer reaches the parent through the existing `wake_parent` (make the wake body say `fork answer:` and give the fork's full answer, not 300 chars — a fork's answer IS the payload; cap at something sane like 4000). Returns at once with the fork id. Default the fork to NO tools unless asked (`allowed_tools`), since most forks are "decide from what you know", and say so in the description; a fork may be given Read/Grep/Glob for "look at these three files".
   ⚠ The trap to test: the caller is MID-TURN when it calls fork_self — its transcript ends in an unanswered tool_use. Find out whether resume+fork handles that, or whether you need `resumeSessionAt` (the last complete message) or the standalone `forkSession({upToMessageId})`. Prove whichever works.
   The fork's prompt should tell it plainly: "You are a fork of <caller>. Answer this one question and stop. Do not take actions the original would take."

3. **`wait_for_agent(id, timeout_s?)`** (tool). Resolves when that agent's current turn ends and nothing is queued (state idle/stopped) — returns the agent's last words and state. If already idle, returns at once. Default timeout ~10 minutes, returns "still working" on timeout. Implement with an event/promise on the Agent, not polling.

4. **Stale registry.** At Servex boot (and in `registry_list()` for any host), a row whose state is not `stopped` but whose id is not in this process's `live` map is dead. Mark it `state: "gone"` (with `ended: "servex restarted"`) — do the sweep once at host construction/boot, and write it back. `list_agents` then never shows a dead agent as idle/working. Also record `forked_from` / `resumed_from` on the row for deliverables 1–2.

5. **The proof** — `Servex/agents/fork-proof.mjs`, standalone like `demo.mjs` (its own `Agents` host, no Servex needed; Haiku or Sonnet, cheap). Script: spawn agent A with a prompt that builds some context (e.g. a made-up fact list of ~2k tokens so the cache matters); A calls fork_self (or the script triggers the fork on A's behalf while A is mid-turn — best if A itself calls it through the in-process tool); while the fork runs, send A another message and show A answers it; then show A receives the fork's answer. Print: timings (fork call returned in X ms; A's other answer at T; fork answer at T), and the fork's usage — `input_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens` from the result message's `usage`. Save the run's output to `C:/Code/lew42/monorepo/public/framework/ai/2026-09-24/concurrency/proof.txt`.
   Note: the standalone host has no HTTP `/mcp`; for A to call fork_self in-process, register the tools with the SDK's `createSdkMcpServer` + `tool()` (see the readme's "Tools are node functions"), or have the script call `host.fork(...)` for A's session mid-turn — say which you did.

6. Update `Servex/agents/doc/traps.md` with anything the SDK surprised you with (a line each). Do not rewrite the readme; the mastermind does that.

## Done

Commit in the worktree. Reply with: what each tool does in one line, the proof numbers (fork return ms, cache_read vs input tokens, total fork cost), anything left open with its reason. Start your final message with `BLOCKED` only if you truly cannot proceed.
