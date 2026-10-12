# Token accounting — bulletproof session cost data

Owner's ask (2026-10-07), kept close to their words. Budget: Sonnet, medium effort, no Opus, no fan-out.
Load the `minion` skill first. The week ran out two days early; the point of this task is that we can trust the numbers and see where tokens go.

## Phase 1 — INVESTIGATE FIRST (this task = the investigation + a written plan + only safe, obvious fixes)

Look into the system architecture and write down what is TRUE (verify by reading code and real files, not docs):

1. Servex, which uses the Claude SDK: how agents are spawned (`Servex/agents/*`, `Sessions.js`), how the MCP / in-process tools expose Servex's Claude SDK capability.
2. How the Claude SDK / CLI creates session files (`~/.claude/projects/<dir>/<uuid>.jsonl`): are they written and updated in real time? How soon after a message is the usage line on disk? Are sub-agent (Task/Agent tool, sidechain) transcripts in the same file or separate files? Do they carry `usage` (input, output, cache read, cache write, 5m vs 1h)?
3. How we compute actual session costs today (`Server/session-cost.mjs`, `Servex/Usage.js`, `spend.json` files, `usage.jsonl`, `framework/ai/sessions/`, `spend-tree.json`). Where could it be wrong: double counting across resumes/forks, missing sub-agents, cache pricing, per-model rates, OpenRouter vs Claude, sessions never logged.
4. If / how / when we log SDK minions to session files. Which spawned agents have NO session file or NO ledger line.
5. Can the SDK report usage in real time (per message / per tool result events)? Would we need to wrap the SDK and measure + sum per message and per tool?

## Phase 2 — what the owner wants (write the plan; build only what is small and safe)

- `framework/ai/sessions/` data grid needs improvement and ACCURATE information. Every session shows a clearly visible token cost: Claude sessions read `Claude $total`; OpenRouter sessions just `$total`.
- Sub-agents are aggregated into the parent's total (cost tree).
- Per session: a cost breakdown of what contributed (per message / tool / model / cache). The Claude session file keeps the full log; we want realtime data when possible (fetch + tail a jsonl with minimal latency). NEVER stale data.
- Robust data structures that can be rendered, filtered, trusted. Document the structured data, files, loading, saving and timing (a `doc/*.md` beside the sessions module, linked from its readme).
- Optimization the framework/ai systems should support (record each as a section in the plan, with what data it needs):
  1. Stay under pace; when over, switch to cheaper / lower-effort models (effort changes consumption).
  2. Right task to the right agent — no simple task to an expensive agent; also watch tokens wasted on agents too weak.
  3. Batch file reads: 10 reads in one turn, not 10 tool calls (measure how often this happens from the session files).
  4. 100% accounting so trends, patterns and optimizations can be found by browsing the data.
  5. Local / cheap / free models: tiny context (~32k) means minimal system prompt, skills, tools, file reads; the local system should target certain simple tasks, with the 32k budget accounted per component.
  6. Anything else you find that matters (call these out).

## Deliverables (each is its own numbered item — tick them in your report)

1. `findings.md` in this dir: the true architecture, with a "where cost data can be wrong" list, each item verified or marked unverified.
2. A reconciliation: pick 3 real sessions (one plain, one with sub-agents, one OpenRouter if any), sum their session-file usage with a node script, compare to what our ledger/grid says, report the gap. (Compute, don't recall — the script is the deliverable, in the dir.)
3. `plan.md`: prioritized build list for a bulletproof, realtime, tree-aggregated cost system + the improved `sessions/` grid, with effort estimates and which model should do each piece.
4. Small, obviously-correct fixes only (e.g. a wrong rate); commit each with clear attribution. Anything bigger → plan.md. No new npm dependency, no build step.

## Rules

- Pace: weekly Claude window just reset (0%); everything on Sonnet. Batch your reads.
- Read the readme chain before working in `public/framework/ai/`.
- Work in a worktree if you edit files the live site loads (see CLAUDE.md); commit your own work; no loose files.
- Report on your card in one screen of plain sentences with links. Land with `finish-task`.
