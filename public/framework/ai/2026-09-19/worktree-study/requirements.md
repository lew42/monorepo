# worktree-study — how parallel minions could work in git worktrees here, and what the one-hour prompt cache changes

Load the `minion` skill first. Then this brief. Model: Sonnet. **A study with one experiment. Time box 40 minutes. One screen back. You change nothing in the main tree except your own task dir.**

**Three laws.** Less is more. Clear beats brief by far. Prioritize (can minions use worktrees next week, yes or no, and what it takes).

## The owner's words (2026-09-19, through the assistant)

> Spawn a minion to study our system for git worktrees (asked in an earlier session) and for prompt caching (the default cache TTL may now be one hour): how could parallel minions use worktrees, and what does the cache lifetime change?

And a few minutes later, the owner's own reasons — the two things the recommendation must be judged against:

> Why worktrees: minions build in their own git worktree, so (1) their writes do not trigger live reload on the running site all the time (I am unsure that problem is solved yet), and (2) they avoid conflicts and stepping on each other.

On (1): say plainly what is solved today and what is not — the read-fires-reload bug is fixed and the reload hold exists (`Server/doc/watch.md`), but a hold is a courtesy each agent must remember, while a worktree makes it structural: the live tree changes only when the mastermind lands proven work.

## What is already known — do not redo it

- **Yesterday's experiment** (`public/framework/ai/2026-09-18/worktree-test/`, and the `worktree-minions` decision in the run ledger `ai/2026-09-17/mastermind-layout-browser/task.jsonl`): the Agent tool's `isolation: "worktree"` works mechanically (separate dir, own `npm install`, own server on its own port, LiveReload cannot cross) — but the harness cuts the worktree from `main`, which is 113 commits behind `michael/dev`, and a worktree never sees another checkout's UNCOMMITTED files. Two days of work here is uncommitted (hundreds of files). Verdict then: not usable; file fences stay.
- **Why it matters more today:** every agent writes into the ONE tree that the owner's live site and both dev servers serve. Today that cost: every page blanked twice (a backtick in a shared module), a four-minute outage (a `Server/` file that parsed but would not boot), a dev bar that "changed seven times in a few seconds", and two agents cross-editing one file. Incident reports: `ai/2026-09-19/mistake-audit/`, `ai/2026-09-19/incident-site-down/`. Mitigations built today: the syntax-guard hook, the reload hold (`node Server/hold.mjs`), a supervisor boot-test (in flight).
- **Standing rules:** the mastermind and minions never commit or push; never `git stash`, `checkout --`, `reset`. The owner commits.

## Answer these — with one real experiment

1. **Plain git, not the harness:** `git worktree add <path outside the repo> <branch-or-HEAD>` from `michael/dev`'s HEAD — does it give a minion a tree it can serve (`PORT=81xx node server.js` from inside it; `node_modules` — symlink/junction to the main tree's, or install?) Try it for real in a sibling directory (e.g. `C:\Code\lew42\wt-study`), prove a server answers from it, then REMOVE it (`git worktree remove`, and delete the branch if you made one). This touches `.git/worktrees` only — say exactly what it wrote and that you cleaned it.
2. **The uncommitted-work problem — the real blocker.** Measure it (`git status --porcelain | wc -l`, tracked-modified vs untracked). Then evaluate, WITHOUT doing anything destructive, the ways a worktree could start from today's real state: (a) the owner commits `michael/dev` first (a work-in-progress commit; then every worktree is cut from it) — what it costs, what it fixes; (b) carry the diff in: `git diff HEAD > x.patch` + copy untracked files into the fresh worktree (try this in your experiment worktree — it never touches the main tree; does it apply cleanly? how long? how big?); (c) a standing `wip` branch the mastermind is allowed to commit to (a rule change — the owner's decision). Recommend one.
3. **The way back.** A minion's finished work must reach the live tree: `git diff` from its worktree applied to the main tree by the mastermind after it has been PROVEN (boot test, page load, critic) — what happens when two minions touched the same file; how conflicts surface; whether the merge itself can be a small script (`Server/` or `.claude/` tool) with the reload hold around it so the owner sees ONE reload per landed task instead of fifty.
4. **What worktrees would NOT fix** (say it plainly): shared files outside git's view (the run ledger `task.jsonl`, `board.jsonl`, `usage.json` — agents must still write those in the MAIN tree so the owner sees them live: how does a minion in a worktree do that? an env var with the main tree's path?), the hooks (`.claude/hooks/ledger.mjs` resolves its root from its own path — which tree's ledger does a worktree minion's hook write to?), skills (read from which tree?), ports, whisper, the OS temp dir.
5. **Prompt caching.** Facts to start from: this Claude Code session reports a **1-hour** prompt-cache TTL (dropping to 5 minutes only in usage overage). Work out what that changes for THIS system, concretely: resuming a landed minion or the persistent auditor within the hour re-reads its context from cache (cheap) — so "wake the same agent" beats "spawn fresh" for follow-ups inside an hour; the mastermind's own wakeups need not be short to stay warm; a worktree minion's long build/test pauses no longer cost a cold re-read. Put rough numbers on it using today's real agent sizes (the task notifications recorded ~180k–480k tokens per minion; say what share is cached input vs fresh). Do not browse the web; if a fact about pricing is not available locally (`claude --help`, installed docs), say "unverified" rather than guess.
6. **The recommendation**, as `decision` lines with alternatives: is the next step (i) keep fences + today's guards, (ii) worktrees for `Server/` and shared-module work only (the edits that can take the site down), or (iii) worktrees for every minion — and what the owner must do once (commit? a `wip` branch rule?) to unlock it.

## Rules

- `new-task` first (your dir: `ai/2026-09-19/worktree-study/`); `finish-task`. A one-screen `page.js`: the answer in a sentence, the six points as cards, the decision lines.
- **Fence:** your task dir; ONE experiment worktree OUTSIDE the repo, created and removed by you (leave `git worktree list` exactly as you found it — check before and after). Nothing else. Never commit, never `git stash`, never `checkout --`/`reset`, never touch the main tree's index.
- **Never kill or restart the owner's dev server (port 80) or the mastermind's (8123), never stop whisper-server, never drive the owner's tabs.** Kill only what you started, by real Windows PID. Never `find /`. Write files with the Write or Edit tool, never a bash heredoc. Do not write the owner's name anywhere.
- Post to the owner's log at start and landing, SHORT: `node .claude/skills/assistant/say.mjs say "<about five words>" "<two sentences>" --as worktree-study --id worktrees --status working --icon account_tree` (then `--status done`).
- Landing `outcome`: one screen.

## ADDITION (woken 2026-09-19, 20-minute time box, context intact)

Multi-tier proposal from the owner, through the assistant: a fast Sonnet-medium assistant acts the
instant anything arrives; it can spawn Opus masterminds because the Fable mastermind is slow and
does one task at a time. Concern: two masterminds coordinated by a lesser model may lose
understanding (left hand / right hand). Worktrees may solve it: each mastermind owns a worktree
and spawns minions into it; a minion can branch its own worktree. Parallelism may not always be
needed; different minions on different things may be enough. The owner likes sub-worktrees: run,
say, nine masterminds toward one target, each deciding its own minions, then compare the resulting
versions and let the owner pick. Include feasibility, the pointer/coordination design, and cost.

Answer from what was measured today plus reading (no new experiment touching the main tree; no
web):

1. **FEASIBILITY** — can N worktrees of this repo coexist (the diff carry-in measured today: 8.6 MB
   / 0.5s; a per-worktree npm install under a second; disk per worktree; ports per worktree);
   `git worktree add` of a worktree's own branch for a sub-worktree — does git allow a worktree cut
   from another worktree's HEAD plus ITS uncommitted diff? What breaks at nine (Claude Code harness
   facts verifiable locally: a nested agent's completion notifies the MAIN session, not its parent;
   sessions message each other by name; the 1-hour cache).
2. **COORDINATION**, the owner's left-hand/right-hand worry — the smallest "pointer" design: one
   shared, append-only ledger in the MAIN tree (the run's task.jsonl/board.jsonl, which every tier
   already writes through say.mjs) saying who owns which target and which worktree, each mastermind
   writing only its own lines; the assistant ROUTES (owner words to the mastermind that owns that
   topic) but never decides; masterminds never edit the main tree — only a single lander applies a
   chosen worktree's diff inside the reload hold. What a lesser-model coordinator can safely do
   (route, summarise, show) and must not (merge, judge between versions).
3. **COMPARE-AND-PICK** — nine versions of one target: each worktree serves on its own port; a
   comparison page (a wall of live iframes or headless shots at three widths, plus each version's
   one-paragraph rationale) with Approve on one; the losing worktrees removed. What this is good
   for (a design question with taste in it) and what it wastes tokens on (a bug fix with one right
   answer).
4. **COST** — a table from today's real numbers (minion sizes 160k–770k tokens, the mastermind's own
   turns, the weekly line reportedly hit today with ~7 Sonnet minions and one Fable mastermind): one
   Fable mastermind + minions (today) vs. one Sonnet assistant + 2 Opus masterminds vs. nine Opus
   masterminds on one target. Mark every unverifiable rate as unverified; compare in multiples of
   "one Sonnet minion task", not dollars.
5. **RECOMMENDATION** as a `decision` line with alternatives — not nine; start with the assistant
   (exists) + ONE mastermind + compare-and-pick of THREE worktree versions for the next real design
   question (the V3 timeline is a candidate), and measure.

Add ONE card-section to `page.js` for this addition (not six new cards). Post one short line at the
end: `node .claude/skills/assistant/say.mjs say "<about five words>" "<two sentences>" --as
worktree-study --id worktrees --status done --icon account_tree`.
