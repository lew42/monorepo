# mastermind-servex — the run ledger for the Servex Mastermind program

Opened 2026-09-22 14:50 by the mastermind (Fable, sidebar session `e2b82220`). Group `ai-ops`.
This is the mastermind's own memory for the run; the work happens in sibling task dirs, one
per minion, each with its own `requirements.md` and `task.jsonl`.

## The ask, verbatim

> hello mastermind.
>
> i'm not even sure the current state of our mastermind system, and this prompt might change some of that:
>
> look through the C:/Code/ repos for a directory named Servex. read that to guide this prompt. also, look at any past work over the last day or 3, some of this has prior work.
>
> create an opus minion to review the last few days, and see what's complete, what's left, and try to clean things up, and get them presentable.
>
> our new ai dashboard system still sucks... i never have a nice clean report of what happened....
>
> anyway, here's your task, mastermind. stay on pace, use minions to keep costs low, etc. try to build as much of this as you can, without me. don't rely on my dev server, try to use the Servex's dev server system.
>
> Servex Mastermind — architecture brief
> What exists (read these first, don't rebuild them)
> Servex — an older repo (server manager: process supervision, per-site *.localhost hosts, a small UI). Being ported into this monorepo. Audit what it already does before adding anything; don't re-specify proxy/port plumbing that's already there.
> Dev server (node server.js) — static server plus extras, a WebSocket for live reload, and an MCP server with an eval-style tool that can run arbitrary code in the browser session or server-side.
> AI dashboard — a timeline UI on one project page, backed by a task system with its own log files.
> Skills — a mastermind skill, possibly an assistant skill, and a recent skill audit of uncertain status.
> Whisper — a local GPU transcription setup that may or may not work yet.
> Environment: Windows (native, not WSL), vanilla JS, no TypeScript, no React/Vue, no bundler, my own class View { .el } UI layer.
> Goal
>
> Replace "tell a sidebar session to be the mastermind and hope" with a real system: a long-lived Node process (Servex) that spawns Claude sessions via the Agent SDK, keeps them alive and steerable mid-run, streams everything to a real-time dashboard, and turns my long voice prompts into structured, well-named, approvable work.
>
> Shape
> Servex is the always-on process. It never restarts. It supervises dev servers and Whisper, owns all log files (single writer), hosts every agent session in memory, and exposes one MCP endpoint over HTTP that every Claude session (sidebar, terminal, or SDK-spawned) connects to.
> Agents are Agent SDK query() sessions in streaming-input mode, held in a Map. Spawning, messaging, and interrupting are MCP tools whose handlers run inside Servex — that's how a normal Claude session gets to steer a running agent even though it can't hold stdin.
> Claude's native Read/Write/Edit stay native. Servex is a switchboard for rare, coarse operations (spawn, send, interrupt, restart, logs), not a file proxy.
> Per-project dev server MCPs stay thin: browser bridge and project-scoped scripts. Cross-project things go through Servex.
> Requirements
>
> A. Servex core. Port the repo; keep what works. Add: Agent SDK session host; single-writer JSONL log appender (one open stream per file); /mcp over HTTP; Whisper as a supervised process whose text output becomes log entries. Claude sessions never start dev servers themselves — a CLAUDE.md rule plus start/restart/logs tools.
>
> B. Agent sessions. Tools: spawn_agent, send_to_agent, interrupt_agent, list_agents. Human-readable agent IDs, not UUIDs. Every injected message is wrapped with sender and reply-to, so a minion knows who asked and where to answer. A registry of live agents with role and visibility. Logs carry everything; direct messages are reserved for "blocked" or "done." Sub-masterminds (a top mastermind boils down requirements, spawns a focused mastermind per task) and minions spawning minions are both wanted, later. Use includePartialMessages and forwardSubagentText so the UI can stream tokens and nested transcripts.
>
> C. Worktrees — primary concern. Every team that takes a task gets a fresh sandbox. Parallel teams may work the same task for comparison, with the best of each merged afterward. Design this in from the start even if it lands in phase 2: per-worktree dev server routed by the proxy, cleanup policy, and a realistic look at performance on this very large repo (thousands of generated pages). Investigate Claude Code's built-in --worktree/subagent isolation before writing our own.
>
> D. Log and content model. One append-only JSONL per session; every entry is a typed, immutable event (transcript, intent, name, decision, task, agent_msg, file_touch, …). Tasks, decisions, proposals, and prompts are projections folded from events, never edited in place. "Approve," "rename," "dispute" are just new entries. Raw Claude transcripts live outside the repo and are served on demand for drill-down. File-touch tracking comes from PostToolUse hooks on Write/Edit inside Servex.
>
> Prompt lifecycle: raw (verbatim, timestamped, audio playback later) → refined (summarized, grouped, re-ordered, citing spans of the raw text) → pre-proposal → proposal (classes, methods, names; approvable) → build (phases, tasks, subtasks).
>
> Naming rules are hard requirements: the fast assistant names things immediately; a mastermind may propose alternatives; nothing I've already seen gets renamed unless I ask; an approved name is locked. Human-in-the-loop is optional per item (hover ✓/✗, or "not this, what else?"), never mandatory.
>
> E. Conflict handling — evaluate, don't over-build. Options to weigh: (1) append + fold: nobody edits, contested properties show all proposals until I click; (2) pecking order: higher-tier agents can attach alternatives but never replace what's visible; (3) log assistant: one dedicated session owns semantic updates and consensus, invoked only on conflict — mechanical appends stay programmatic so we're not paying tokens for file ops; (4) ownership: first proposer owns until approval. Recommend the simplest that satisfies the naming rules.
>
> F. Assistant tiers. A fast assistant (Sonnet, low effort) watches the transcript stream and emits structure every sentence or two — names, icons, outlines, question cards — so I see feedback in seconds. It relays my verbatim words to every mastermind; it never filters. Multiple masterminds at different effort levels may run at once, dispute the assistant's structure via messages, and refine downward — but never silently overwrite. A Sonnet → Opus → Fable ladder is one option; team composition should be configurable, not fixed.
>
> G. Dashboard. Real-time timeline, newest on top, inbox-style preview cards → detail page. Live transcript appears as I speak. Extend the existing AI dashboard; decide later whether it moves into Servex (my UI framework is still settling — don't force the move now).
>
> H. Skills. Audit what exists. Define role skills loaded on spawn (mastermind, sub-mastermind, minion, assistant, log assistant) so an agent gets to the right posture on demand. Separate always-loaded "don't forget X" skills from on-demand ones, and keep the always-loaded set lean.
>
> I. Object layer (design now, build later). One RPC envelope {target, method, args} used everywhere: Servex ↔ dashboard, dev server ↔ browser, and three generic MCP tools (list_objects, describe, call) that reach any live object — window.app in a browser via the dev server's socket, or Node-side objects directly. JSDoc becomes the tool documentation.
>
> Phases
> Audit + port Servex; log writer; spawn/send/interrupt with streaming to a minimal UI. Worktree design settled on paper.
> Fast assistant + prompt lifecycle + naming/approval; worktrees working for one team per task.
> Parallel teams, sub-masterminds, object layer, Whisper in the loop.
>
> ---- do as much as you can, without me. i am afk. good luck! stay on pace, watch usage.
> wtf?

## How the run is organised

- Each minion gets a sibling dir under `ai/2026-09-22/` with a `requirements.md` and a
  `task.jsonl`; this ledger holds the `agent` lines that point at them.
- The Servex port lives at `Servex/` in the monorepo root, beside `Server/` (decision logged in
  `task.jsonl`); the old repo at `C:/Code/servex` is read, never edited.
- Minion launch recipe that works (smoke-tested 14:49 today, Haiku ran `node --version` AND
  wrote a file): `claude --session-id <uuid> -p "<prompt>" --model <id> --effort <level>
  --permission-mode acceptEdits --allowedTools "Bash,Read,Write,Edit,Glob,Grep" --output-format json`.
