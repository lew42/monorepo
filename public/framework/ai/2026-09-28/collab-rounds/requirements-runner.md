# Minion brief: the runner, `node Server/collab.mjs <taskdir>`

Load the `minion` skill first, then `code`.

**Owner's words** (read all of it): `public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words-2.md`. The core: *"use rounds or … phases … an initial phase where everyone goes and does their [work] … each minion create their own directory … have each of the minions read maybe one or two others and then revise their own … each minion just votes on which one they pick the best one … with any improvements they would recommend or caveats."* And for design: names first, then everyone implements the agreed names, then cross-review, then vote.
Task: `public/framework/ai/2026-09-28/collab-rounds/`. Design: the card dir `public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md`, "Added" section.
**The contract:** `public/framework/ai/2026-09-28/collab-rounds/collab-format.md`. Another minion is building the page that draws `collab.jsonl`, against the same contract, at the same time. Do not change the contract; if it is wrong, say so in your final message.

**Work in the worktree `C:\Code\lew42\worktrees\collab-rounds`** (branch `worktree/collab-rounds`). Commit there. Do not merge.

## Deliverables

1. `Server/collab.mjs <taskdir> [--mock]`: reads `<taskdir>/collab.json`, appends `collab.jsonl` lines as they happen, runs the phases strictly in order (every member finishes a phase before the next starts; members of one phase run in parallel).
2. Members are Servex agents. Copy the small `mcp()` helper and the spawn/wait/stop pattern from `Server/review.mjs` (lines ~121–127 and ~218–222; Servex MCP over loopback). One agent per member for the whole run: `spawn_agent` for phase 1 (`role: "member"`, `model` from the spec, `effort: "low"`, `permission_mode: "bypassPermissions"`, `cwd` the repo root), then `send_to_agent` for each later phase, `wait_for_agent` after each, `stop_agent` at the end — always, even on error. Each prompt tells the member: the question, the context files, its own dir `<taskdir>/collab/<id>/` (write ONLY there), the exact file name for this phase, and which peer files to read (assign 1–2 peers round-robin). The research `brief` phase asks for a rough web search (WebSearch/WebFetch) with sources listed. A vote phase writes `<n>-vote.json` `{"pick", "caveat"}`; a member never votes for itself (the prompt lists who it may pick).
3. Cost per member per phase from `wait_for_agent`'s answer (check what field it really returns — run one tiny spawn yourself first); sum per phase and for the run.
4. The tally: counts, winner (most votes; a tie goes to the draft with more caveat-free votes, then the cheaper member — say which rule fired), every caveat. For design runs, the winning names from the first vote are passed into the `implement` prompt. Write `collab/tally.md` — one screen the mastermind reads instead of the drafts: the winner's file path, the counts, each caveat, the cost.
5. `--mock`: no agents; writes canned member files and votes, so the page and the flow can be tested for $0. A timeout per phase (default 10 minutes per member) marks a member `error` and carries on without it.
6. `Server/doc/collab.md`: one screen — how to write a `collab.json`, run it, and read the tally.

**Fence (the only files you may write):** `Server/collab.mjs`, `Server/doc/collab.md`, and test runs under `public/framework/ai/2026-09-28/collab-rounds/test-*/`.

**Proof before you stop:** a `--mock` run on a research spec and on a design spec; then one REAL run with 2 Haiku members (`claude-haiku-4-5-20251001`) on a trivial research question in `public/framework/ai/2026-09-28/collab-rounds/test-real/`, with its total cost. Every spawned agent is stopped afterwards (`list_agents` shows them stopped).

Every Node spawn sets `windowsHide: true`. Length budget: about 250 lines. Log to `public/framework/ai/2026-09-28/collab-rounds/task.jsonl` with `node .claude/hooks/append.mjs` (a JSON array file written with the Write tool). Final message: what you built, the two mock dirs, the real run's cost, anything in the contract you disagree with.
