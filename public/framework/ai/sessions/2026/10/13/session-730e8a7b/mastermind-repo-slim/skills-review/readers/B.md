# Skills Review — Reader B

## 1. Conflicts

None identified. All six skills align with CLAUDE.md and each other; they elaborate core rules rather than contradict them.

## 2. Repeats of CLAUDE.md

| Skill · Line | CLAUDE.md · Line | Gist |
|---|---|---|
| minion:12 | 15 | One of everything; don't edit shared SKILL |
| minion:14–16 | 46–47 | Read readmes top-down before working |
| minion:47 | 90 | Open task before first edit |
| minion:80 | 47 | Commit own files by path, never -A |
| minion:103–105 | 5 | Keep working; never wait/park |
| fork-claude:19–24 | 77 | Don't fork by default; cost matters |
| servex-mastermind:10 | 5 | Nothing waits on owner; decide |
| servex-mastermind:82 | 47/55 | Never stash/checkout/reset; shared tree |
| finish-task:20–22 | 18–24 | Show don't tell; brief outcomes |
| finish-task:56 | 47 | Commit by exact path after work |
| documentation:25 | 40 | Test each readme line earns its place |
| new-task:47 | 90 | Run new-task before first edit |

## 3. Retired / Stale

| File · Line | Quote | Status |
|---|---|---|
| minion:85 | syntax-guard.mjs (2026-10-09): "not wired in settings.json" | ⚠️ Stale wiring flag; file exists but hook unconfigured as noted |
| servex-mastermind:8 | "standing mastermind-servex agent is retired (2026-10-09)" | ✅ Current; noted as of 2026-10-09, still true 2026-10-13 |
| fork-claude:234 | "Full model ID — `claude-opus-5`, `claude-sonnet-5`, `claude-fable-5`, `claude-haiku-4-5-20251001`" | ✅ Current; Haiku date matches system reminder |
| finish-task:46 | `/framework/ai/doc/ai2/card-standard.md` link | ✅ File exists |
| documentation:100 | `architecture-template.md` | ✅ File exists |
| new-task:9 | `ai/doc/task-folders.md` link | ✅ File exists |

No retired task directories, `board.jsonl`, `ai/v/3/`, `ai2/`, `session.json`, or archived skills named.

## 4. Rule Inventory

**Topics:** commit, worktree, merge, review, screenshots, task-log, report/card, owner-note, spawn, model-choice, budget/tokens, windows-hide, servers, live-browser, docs/readme, naming, page-tools, hold-reload, skill-improvement, owner-words, never-wait, other.

| Topic | Gist | File · Line |
|---|---|---|
| task-log | Open task before first edit with new-task | minion:47, new-task:9 |
| task-log | Append milestones, not keystrokes; decide & measure when they happen | minion:54, new-task:62 |
| task-log | Use append.mjs helper for all JSONL writes | minion:94, new-task:32 |
| task-log | Never write findings.md; task log is only findings | minion:54 |
| worktree | Take worktree with Servex MCP; never start own for small fix | minion:20–25 |
| worktree | Never link node_modules (deletes main tree on cleanup) | minion:25 |
| worktree | Work in worktree first; main tree hold only for final writes | minion:57 |
| commit | Commit own files by exact path after each step, never -A | minion:80, finish-task:56 |
| commit | Commit before landing; find every file task touched | finish-task:56 |
| merge | Smoke test with merge.mjs before merging | minion:22 |
| merge | Review diff before merge; mastermind merges, not minion | servex-mastermind:118–120 |
| merge | Land everything committed and merged before counting done | servex-mastermind:106–108 |
| review | Review finding answered in task log, not review.md | minion:28 |
| report/card | Outcome ≤120 words; no paragraph >60 | finish-task:22 |
| report/card | Outcome is checklist of asks with proof, ticked only with picture | finish-task:22 |
| report/card | Give task plain title; without it, board shows "When I..." | finish-task:62 |
| report/card | Smaller version of asked ask is miss | finish-task:28–29 |
| page-tools | Any page in deliverable must be linked from reader's existing path | finish-task:31–35, new-task:72–75 |
| page-tools | Before landing, verify pages linked from parent's children | new-task:72–75 |
| page-tools | Load page or content skill before writing owner reads | finish-task:12 |
| page-tools | Change owner sees lands with Next/Next walkthrough demo | finish-task:14–18 |
| page-tools | Look at whole page at 1920 from owner's navigation path | finish-task:20 |
| docs/readme | Read directory's readme index before working there | documentation:12 |
| docs/readme | Readme ≤~100 lines; first 40 lines injected to agents | documentation:10 |
| docs/readme | Readme covers four things; test each line earns place | documentation:21–30 |
| docs/readme | page.js shows structure first; class architecture before demo | documentation:61–62 |
| docs/readme | doc/*.md declared not crawled; named in page.js only | documentation:71–78 |
| docs/readme | Mastermind keeps docs true; minions report stale items | documentation:84 |
| docs/readme | Superseded doc moves to archive/, never deleted | documentation:86 |
| docs/readme | Decisions in doc/architecture.md; why & alternative, not dates | documentation:97–99 |
| skill-improvement | Skill let you down; append improvements.md, don't edit SKILL.md | minion:12 |
| skill-improvement | This skill + new-task are all minion carries by default | minion:48 |
| owner-words | Brief's deliverables are numbered; each checked against owner's own sentence | minion:40 |
| owner-words | Brief verbatim, scope, file-ownership fence | new-task:19–20 |
| owner-note | Page inbox: notes reach agent that owns it; for coordination only | CLAUDE.md:99 |
| never-wait | Nothing waits on owner; decide, name alternative, keep going | servex-mastermind:10, minion:103–105 |
| never-wait | Resolve, don't park; "out of scope" is refusal, decide | minion:103–105 |
| windows-hide | Never spawn process with visible window; set windowsHide:true | minion:77 |
| windows-hide | Never kill dev server; never drive owner's browser tabs | minion:78–79 |
| windows-hide | A proof never posts as owner; stub POST or use via:"test" | minion:27–28 |
| servers | Don't start servers by hand; worktree URL already serves | minion:26–27 |
| servers | Minions default to Haiku; Sonnet only for UI/OO code | servex-mastermind:110–112 |
| hold-reload | Reload hold: seconds not minutes, work in worktree first | minion:56–67 |
| hold-reload | Measure-wire test must wait for hold to clear | minion:68–70 |
| live-browser | No agent claims live tab; headless Playwright only | servex-mastermind:31 |
| live-browser | Never run `find /`; use Glob/rg scoped to repo | minion:90 |
| naming | Slug kebab-case; run TaskDirs.mjs --new from repo root | new-task:15–18 |
| naming | task.jsonl line 1 has session_id, not optional | new-task:30 |
| naming | Verbs in task log: assign, log, action, agent, chat, shot, ask, decision, verdict, rank, experiment, review | new-task:34–40 |
| spawn | A CLI minion is --session-id'd, headless, has own id | minion:30–36 |
| spawn | Track own experiments in task.jsonl as {experiment:{try,measure,result}} | servex-mastermind:14 |
| spawn | Mastermind writes brief, spawns task mastermind (not you) | servex-mastermind:49–51 |
| spawn | Spawn minions for audits; read-only; Sonnet at medium effort | servex-mastermind:52–56 |
| model-choice | Over pace: Sonnet by default, no Opus without reason | CLAUDE.md:75 |
| model-choice | Fork model & effort per worker; Sonnet default for fan-outs | fork-claude:210–234 |
| budget/tokens | Check usage with usage-now.mjs; over pace = queue, don't spawn | servex-mastermind:114–116 |
| budget/tokens | Every turn re-processes context; batch calls, let script read | CLAUDE.md:77 |
| budget/tokens | Don't fork by default; each costs N × context retransmit | fork-claude:16–24 |
| budget/tokens | Fork library, not working session, to avoid inherited momentum | fork-claude:84–149 |
| other | Never link worktree node_modules; deletion cascades to main | minion:25 |
| other | After every .js write, run --check before anything else | minion:85 |
| other | Backtick in shell string eats it; write file with Write tool | minion:87 |
| other | Never use git commands with -i flag (no interactive) | minion:1 |
| other | VS Code tab is agent; register with id, session_id; tail inbox | servex-mastermind:60–78 |
| other | When taking over from predecessor, message every running task | servex-mastermind:92–94 |
| other | Never stop mastermind with children working | servex-mastermind:96–98 |
| other | When permission REFUSES call, change HOW, never second mechanism | minion:89 |

**Counts:** Conflicts: 0 · Repeats: 12 · Retired: 1 flagged · Rules: 77
