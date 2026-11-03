### worktree-servers-revive
dir: public/framework/ai/sessions/2026/10/03/worktree-servers-revive
kind: quiet
task.jsonl (1 lines):
{"assign":{"now":"queued","title":"Servex: worktree servers survive a restart, so 4 finished landings can merge","brief":"public/framework/ai/2026-10-03/worktree-servers-revive/requirements.md","owner":"mastermind-servex","queue":"second, after review-empty-diff (vscode-mastermind's review of 2026-10-03)","model":"claude-sonnet-5","effort":"medium"}}
--requirements.md--
Budget: $3.

# Servex: worktree servers survive a restart, so 4 finished landings can merge

Split out of [restart-keeps-agents](/framework/ai/sessions/2026/10/03/restart-keeps-agents/) to land first and alone (vscode-mastermind's review of 2026-10-03).

## The bug: a Servex restart forgets every worktree's dev server

**What happened:** four worktrees can't land, because their servers are dead and nothing can bring them back:
- `framework-home-grids` (port 60613; 2 commits; task-mastermind-framework-home-grids);
- `voice-refine` (port 61229) and `dictate-core` (port 61282) (task-mastermind-one-dictation; both have since merged another way, so check before reviving them);
- `sessions-tab-polish` (port 60008; task-mastermind-sessions-tab-polish, whose minion needs it for screenshots at merge).

Each worktree is still listed in `.worktrees.json`. None of them can be revived:
- `worktree-up.mjs` registers the worktree with `POST /api/projects` (`Servex/Servex.js` about line 481). That registration lives only in memory, so a restart drops it. `list_servers` and `restart_server` no longer know the name.
- It's registered `external: true`, so `Project.start_command()` returns null and Se
git log michael/dev grep slug:
(none)


### review-empty-diff
dir: public/framework/ai/sessions/2026/10/03/review-empty-diff
kind: quiet
task.jsonl (1 lines):
{"assign":{"now":"queued","title":"Review: an empty diff is refused, never passed unreviewed","brief":"public/framework/ai/2026-10-03/review-empty-diff/requirements.md","owner":"mastermind-servex","queue":"first (vscode-mastermind's review of 2026-10-03)","model":"claude-sonnet-5","effort":"medium"}}
--requirements.md--
Budget: $2.

# Review: an empty diff is refused, never passed unreviewed

**Why:** tonight's review of all 44 tasks from 2026-10-03 (vscode-mastermind, [card](/framework/ai/2026/10/03/now/review-of-today-s-44-tasks-what-s-really/)) found that the review gate passes work it never saw.
- `Server/review.mjs` `sizeOf()` (line 157) returns `"none"` when no file changed: `if (!files.length) return "none";`.
- The `size === "none"` branch (line 708) then writes "No review needed: only CSS/docs changed (0 line(s))" and passes.
- A task committed straight to the main tree has an empty branch diff, so it always passes. 8 of today's `review.md` files say this, including core JS changes (move-nesting-fix, now-card-blank, prompts-live).

## What to change

1. **An empty diff is a refusal.** In `review.mjs`'s main path, when the diff has no files, print `refused: nothing in range; pass --range <base>...<sha> (the commits this task made)` and exit 1. Don't write a pass.
2. **`sizeOf()` stops calling an empty diff "none".** Return `"empty"` (or make the callers check `files.length` first; pick one and say why). The "none" size stays for what its comment says: only .css/.md, 20 lines or fewer, no n
git log michael/dev grep slug:
(none)


### spawn-logs-ask
dir: public/framework/ai/sessions/2026/10/03/spawn-logs-ask
kind: quiet
task.jsonl (1 lines):
{"assign":{"now":"queued","title":"Servex: every spawned task writes its own line in the asks ledger","brief":"public/framework/ai/2026-10-03/spawn-logs-ask/requirements.md","owner":"mastermind-servex","queue":"after the day-audit seven (vscode-mastermind, 2026-10-03)","model":"claude-sonnet-5","effort":"medium"}}
--requirements.md--
Budget: $3.

# Servex: every spawned task writes its own line in the asks ledger

**Why:** [day-audit](/framework/ai/sessions/2026/10/03/day-audit/) found that about half of today's asks are missing from `public/framework/ai/asks.jsonl`, including spawned tasks (prompts-live, subcard-columns, topic-cards, now-card-blank, system-class). The task folders are complete; the ledger relies on someone remembering to write it. Make it code (law 7).

## What to build

1. When `spawn_agent` is called with a `task`, Servex appends one ask line itself, right after `open_task()` writes the task's first line (`Servex/agents/Agents.js`, about lines 158 and 711):
   - **title:** the card's title (or the brief's `# ` heading if there's no card);
   - **owner:** the new agent's id;
   - **words:** the brief's path;
   - **status:** `building`.
2. Use the writer that already exists in `Servex/asks/` (`Asks.js`; see its readme). Don't write a second one.
3. Skip it when the ledger already has an open line for that task dir or card, so a re-spawn or resume never doubles it.
4. **Tests** (beside `Servex/asks/asks.test.mjs`): a spawn with a task adds exactly one line; a second spawn on the same task adds
git log michael/dev grep slug:
(none)


### restart-keeps-agents
dir: public/framework/ai/sessions/2026/10/03/restart-keeps-agents
kind: quiet
task.jsonl (3 lines):
{"assign":{"now":"queued","title":"Servex: a restart keeps working agents, and a mastermind stays wakeable","brief":"public/framework/ai/2026-10-03/restart-keeps-agents/requirements.md","owner":"mastermind-servex","queue":"top (vscode-mastermind, 2026-10-03)","model":"claude-sonnet-5","effort":"high"}}
{"action":{"at":"2026-10-03T15:41:13-05:00","did":"edit","files":["public/framework/ai/2026-10-03/restart-keeps-agents/requirements.md"]}}
{"assign":{"title":"Servex: free 4 stuck landings, keep agents alive through restarts, and keep main on its branch"}}
--requirements.md--
Budget: $8 ($6, plus $2 for bug 4, resume on boot).

# Servex: a restart keeps working agents, and a mastermind stays wakeable

Servex bugs from today (vscode-mastermind, 2026-10-03), in this order. Start only after [worktree-servers-revive](/framework/ai/sessions/2026/10/03/worktree-servers-revive/) has landed (it was bug 5 here, split out to land first). The git-guard (once bug 3 here) moved to [main-branch-guard](/framework/ai/sessions/2026/10/03/main-branch-guard/).

## Bug 1: a restart ends the agents that were working

**What happened:**
- In one hour, agents restarted Servex twice.
- Three working agents ended with "session ended (other) without landing": inbox-cards-work, framework-home-grids and drawer-cleanup (13:34).
- mastermind-ai-3 was left "gone", and a spawn queued under it never ran.

**What it must do:**
1. **Resume working agents in place.** An agent that was working, or queued to run, when Servex went down comes back after the restart: same session, its turn resumed with one line ("Servex restarted; carry on from where you were"). Its queued children stay queued. The restart-survival code already exists (see Servex/readme.md, "restart survival"). Find why it mis
git log michael/dev grep slug:
(none)


### pool-unstick
dir: public/framework/ai/sessions/2026/10/03/pool-unstick
kind: quiet
task.jsonl (2 lines):
{"assign":{"now":"queued","title":"Servex: free the stuck pool slots, and stop them sticking","brief":"public/framework/ai/2026-10-03/pool-unstick/requirements.md","owner":"mastermind-servex","queue":"top (vscode-mastermind, 2026-10-03)","model":"claude-sonnet-5","effort":"medium"}}
{"action":{"at":"2026-10-03T13:01:39-05:00","did":"edit","files":["public/framework/ai/2026-10-03/pool-unstick/requirements.md"]}}
--requirements.md--
Budget: $8 ($5 asked, plus $3 for the orphan fix found after).

# Servex: free the stuck pool slots, and stop them sticking

**Why:** today's agents got no worktree. Two pool slots are still marked taken:
- **qf-6**, held by mastermind-servex-9 (stopped) for 17.7 hours. Its uncommitted files are `ai/board.jsonl`, `ai/cards.jsonl` and a task.jsonl with one dictation in it.
- **qf-9**, held by task-mastermind-task-audit (landed) for 17.2 hours. Its uncommitted files are `files.jsonl` indexes under `ai/2026-10-02`, `ai2` and `ext/Refine`.

`return_worktree` refuses both because of those uncommitted files. They are logs and generated indexes, not work. (vscode-mastermind, 2026-10-03)

## The real cause: the pool lost track of five of its worktrees (-10, from the repo, 2026-10-03)

- `.worktree-pool.json` lists only 2 slots, qf-6 and qf-9, both taken. `K` is 3.
- `git branch --list "worktree/qf-*"` shows all nine names in use. qf-2, 4, 5, 6, 7, 8 and 9 each have a worktree checked out, and the branches for qf-1 and qf-3 still exist.
- So `top_up()` sees 2 < 3 and calls `prepare()`. But `free_id()` finds no free name among qf-1 to qf-9 and returns null. `prepare()` then returns null with
git log michael/dev grep slug:
(none)


### node-reap-run
dir: public/framework/ai/sessions/2026/10/03/node-reap-run
kind: quiet
task.jsonl (1 lines):
{"assign":{"now":"queued","title":"Servex: free the RAM held by idle dev servers, now","brief":"public/framework/ai/2026-10-03/node-reap-run/requirements.md","owner":"mastermind-servex","queue":"top (vscode-mastermind, 01:37)","model":"claude-sonnet-5","effort":"medium"}}
--requirements.md--
Budget: $3.

# Servex: free the RAM held by idle dev servers, now

One step: run the reaper that's already written, and record what it freed. The lasting fix (Servex starts every server, with leases and idle stops) is the bigger brief, `public/framework/ai/sessions/2026/10/02/node-reap/requirements.md`, and isn't part of this step.

1. `node public/framework/ai/sessions/2026/10/02/node-reap/node-reap.mjs`: a dry run. Read its plan. It stops only these:
   - whole server trees in worktrees with no working or idle agent;
   - extra copies of the main server;
   - orphans with no parent.
   If the plan names a server that a live agent is using, stop and say which one; don't apply.
2. The same command with `--apply`. It writes `result.json` (node.exe count and MB, before and after).
3. Append the before and after figures from `result.json` as an `experiment` line in this task.jsonl, copied from the file, never typed from memory. Then land it.

Sonnet, medium effort. Never kill a process the script doesn't name. Don't wait on the owner.

git log michael/dev grep slug:
(none)


### session-detail-live
dir: public/framework/ai/sessions/2026/10/09/session-ca11999b/session-detail-live
kind: no-outcome
task.jsonl (142 lines):
{"assign":{"session_id":"ca11999b-71b1-4e27-a295-bfca5cde7d4d","agent":"minion-session-detail-live","brief":"public/framework/ai/2026-10-09/session-detail-live/requirements.md","model":"claude-sonnet-5-5","worktree":"C:/Code/lew42/worktrees/qf-3","requested_at":"2026-10-09T16:39:56-05:00","now":"starting","steps":[],"step":1}}
{"action":{"at":"2026-10-09T16:43:29-05:00","did":"edit","files":["public/framework/ai/2026-10-09/session-detail-live/review.md"]}}
{"review":{"at":"2026-10-09T16:43:35-05:00","size":"full","verdict":"fix","findings":[{"n":1,"kind":"fix","text":"`ai/AISession/AISessionConversation.js` is a second chat renderer. `ext/Chat/Chat.js` already does exactly this job: its `chat({ source, keep })` returns `.view` and `.sync()`, it draws each line once (a `seen` set), has smart scroll, labels each sender, and has `place_card` for inline cards. The brief (law 6: \"look before writing one\") asks to reuse the existing component, so feed…
{"review":{"answer":{"n":1,"reply":"fixed: conversation now drawn by ext/Chat (chat entries); AISessionConversation only maps transcript lines"}}}
...(130 lines)...
{"log":{"at":"2026-10-11T06:16:49-05:00","heartbeat":"answered","msg":"Idle, nothing running. The task is landed (`task.jsonl` line 31, merged to `michael/dev` as `5ff7890cc`). Two items are still open: the per-line transcript push, and a real AI card shown arriving live"}}
{"assign":{"cost_usd":20.1274,"cost":{"root":"minion-session-detail-live","agents":[{"id":"minion-session-detail-live","model":"claude-sonnet-5-5","role":"minion","usd":20.1274,"usd_breakdown":{"in":0.0005,"out":0.4121,"cache_read":2.1677,"cache_write":6.107},"cache_read_pct":24.9525}],"own_usd":20.13,"minions_usd":0,"parent_task":null,"open":1,"window":{"from":"2026-10-09T16:39:56-05:00","to":"2026-10-09T17:44:06-05:00"},"at":"2026-10-11T06:16:54-05:00"}}}
{"log":{"at":"2026-10-11T07:38:44-05:00","heartbeat":"check","msg":"status check sent to minion-session-detail-live"}}
{"log":{"at":"2026-10-11T07:38:47-05:00","heartbeat":"answered","msg":"Idle, nothing running. The task is landed (`task.jsonl` line 31, merged to `michael/dev` as `5ff7890cc`). Two items are still open: the per-line transcript push, and a real AI card shown arriving live"}}
{"assign":{"cost_usd":20.5806,"cost":{"root":"minion-session-detail-live","agents":[{"id":"minion-session-detail-live","model":"claude-sonnet-5-5","role":"minion","usd":20.5806,"usd_breakdown":{"in":0.0005,"out":0.4129,"cache_read":2.1677,"cache_write":6.3328},"cache_read_pct":24.3182}],"own_usd":20.58,"minions_usd":0,"parent_task":null,"open":1,"window":{"from":"2026-10-09T16:39:56-05:00","to":"2026-10-09T17:44:06-05:00"},"at":"2026-10-11T07:38:53-05:00"}}}
{"log":{"at":"2026-10-11T09:00:45-05:00","heartbeat":"check","msg":"status check sent to minion-session-detail-live"}}
{"log":{"at":"2026-10-11T09:00:48-05:00","heartbeat":"answered","msg":"Idle, nothing running. The task is landed (`task.jsonl` line 31, merged to `michael/dev` as `5ff7890cc`). Two items are still open: the per-line transcript push, and a real AI card shown arriving live"}}
{"assign":{"cost_usd":21.035,"cost":{"root":"minion-session-detail-live","agents":[{"id":"minion-session-detail-live","model":"claude-sonnet-5-5","role":"minion","usd":21.035,"usd_breakdown":{"in":0.0005,"out":0.4137,"cache_read":2.1677,"cache_write":6.5592},"cache_read_pct":23.7138}],"own_usd":21.04,"minions_usd":0,"parent_task":null,"open":1,"window":{"from":"2026-10-09T16:39:56-05:00","to":"2026-10-09T17:44:06-05:00"},"at":"2026-10-11T09:00:54-05:00"}}}
--requirements.md--
# Session detail page: live conversation, both sides, compact header

The owner (2026-10-09 ~16:55, VS Code tab 7efd07d5), looking at their own session's page under `/framework/ai/sessions/<id>/`: it shows only the prompts that existed at load; new prompts never appear until a reload; the AI's replies never appear at all; the top ~500 px is roomy and wastes space; the "Template: ..." line takes its own row; the title is truncated although it is the page's path; the content is a narrow column inside a full-width panel. They want the AI to be able to put UI cards (links, context cards) into this page, and each prompt refined later.

## Diagnosis already done (mastermind)
- `public/framework/ai/AISession/AISessionDetail.js:44-47` loads the transcript **once** (`load_transcript`, user prompts only, last 50). `AISessionFollow` (line 39) already tails the live log, but only to correct the grid row. So: nothing appends to the prompt list.

## Do, in order (commit each step)
1. **Live**: new lines from the tail append to the conversation in about 100 ms (stream, never poll; `doc/realtime.md` describes the tail). Keep scroll position unless the reader is at the bottom.
2. **Both sides**: sh
git log michael/dev grep slug:
2dc6b3084 merge michael/dev into session-detail-live
4ecd60a2d Merge worktree/qf-3 (session-detail-live: live two-sided session page, AI cards inline)
bf3bb1416 session-detail-live brief; handover: layout-audit ask queued


### checker-1
dir: public/framework/ai/sessions/2026/10/07/feedback-council/checker-1
kind: no-outcome
task.jsonl (24 lines):
{"assign":{"session_id":"a784b7fc-15c4-4e39-b458-07c149660503","agent":"minion-checker-1","brief":"Feedback council checker: verify 10 open owner asks against the live site and write a votes.json","model":"claude-sonnet-5","worktree":"C:/Code/lew42/worktrees/qf-6","parent_task":"public/framework/ai/2026-10-07/feedback-council","requested_at":"2026-10-07T22:44:53-05:00","now":"starting","steps":[],"step":1}}
{"log":{"at":"2026-10-07T22:53:34-05:00","msg":"Ran headless Playwright (Server/browser.mjs launcher) against http://monorepo.localhost to verify 10 asks: A1,A2,A3,A4,A5,A6,B11,B12,B13,B15. Shots in public/framework/ai/2026-10-07/feedback-council/shots/checker-1-*.png"}}
{"decision":{"at":"2026-10-07T22:53:34-05:00","what":"A4 and A5's prior evidence pointed at URLs that are now 404 (/framework/about/, /framework/ai/ai-dashboard/, /framework/core/Panel/md/doc/decisions/). Found the real current pages (/framework/ai/dashboard/, /framework/ext/Panel/doc/decisions/) and verified those instead of reporting a false 'not done' off a stale URL.","alternative":"Could have voted 'not done' on the literal named URL, but that would misreport a routing/naming mismatch as a …
{"log":{"at":"2026-10-07T22:53:34-05:00","msg":"B12 (AI2 works without Servex) not independently tested: stopping Servex to simulate that path is out of bounds for a minion (never kill/restart the dev server). Voted 'partly' citing the servex_up check already in rail.js/inbox.js as partial evidence."}}
...(12 lines)...
{"log":{"at":"2026-10-08T14:17:25-05:00","heartbeat":"deliberate","msg":"minion-checker-1 its agent is not running: it was stopped on purpose by task-mastermind-feedback-council at 2026-10-07T22:57:39-05:00; not revived."}}
{"log":{"at":"2026-10-08T14:57:37-05:00","heartbeat":"deliberate","msg":"minion-checker-1 its agent is not running: it was stopped on purpose by task-mastermind-feedback-council at 2026-10-07T22:57:39-05:00; not revived."}}
{"log":{"at":"2026-10-08T15:21:39-05:00","heartbeat":"deliberate","msg":"minion-checker-1 its agent is not running: it was stopped on purpose by task-mastermind-feedback-council at 2026-10-07T22:57:39-05:00; not revived."}}
{"log":{"at":"2026-10-08T16:19:53-05:00","heartbeat":"deliberate","msg":"minion-checker-1 its agent is not running: it was stopped on purpose by task-mastermind-feedback-council at 2026-10-07T22:57:39-05:00; not revived."}}
{"log":{"at":"2026-10-08T16:28:58-05:00","heartbeat":"deliberate","msg":"minion-checker-1 its agent is not running: it was stopped on purpose by task-mastermind-feedback-council at 2026-10-07T22:57:39-05:00; not revived."}}
{"log":{"at":"2026-10-08T16:56:56-05:00","heartbeat":"deliberate","msg":"minion-checker-1 its agent is not running: it was stopped on purpose by task-mastermind-feedback-council at 2026-10-07T22:57:39-05:00; not revived."}}
{"log":{"at":"2026-10-08T21:16:52-05:00","heartbeat":"deliberate","msg":"minion-checker-1 its agent is not running: it was stopped on purpose by task-mastermind-feedback-council at 2026-10-07T22:57:39-05:00; not revived."}}
{"log":{"at":"2026-10-08T22:53:41-05:00","heartbeat":"deliberate","msg":"minion-checker-1 its agent is not running: it was stopped on purpose by task-mastermind-feedback-council at 2026-10-07T22:57:39-05:00; not revived."}}
--requirements.md--
# Checker checker-1 — feedback council (run 2026-10-07/feedback-council)

You are checker **checker-1**, one of 5 checkers verifying open owner asks against the live site.

## Read first
- Card dir (raw words): `public/framework/ai/council/`
- Full ask history: `public/framework/ai/council/asks.jsonl` (latest line per id wins)
- This run: `public/framework/ai/sessions/2026/10/07/feedback-council/`
- No new words landed today (`words.jsonl` is empty) — check only the asks below, nothing to extract.

## Your asks (verify each; prior verdict/evidence shown is NOT truth, just a pointer)
- **A1**: Live card loads fast, or is removed (last verdict: partly; last evidence: Headless cold load of /framework/ai2/ lands on /live/ and renders in ~2.7s at 1920 and 3440 (includes app boot); the in-app click was not timed because my selector missed the button. Shot shots/council-3-A3-ai2-3440.png. Card claims ~0.5s.)
- **A2**: Show, don't tell; words after the picture (last verdict: partly; last evidence: CLAUDE.md 'Show it with the widget' plus content skill; AI 2 cards still show long text blocks, e.g. right column of Live at 3440 is a long bulleted assistant reply (shots/council-4-livecard-3440
git log michael/dev grep slug:
1ea84b4ee Feedback council: verify all 48 open asks against the live site


### session-trace
dir: public/framework/ai/sessions/2026/10/03/session-trace
kind: no-outcome
task.jsonl (15 lines):
{"assign":{"tab":"session-trace","group":"session-costs","parent_task":"public/framework/ai/2026-10-02/session-costs","request":"Cost-over-time chart + waste-flagging table on the session detail page, per owner's vscode-mastermind observation.","requested_at":"2026-10-03T00:05:00-05:00","model":"claude-sonnet-5","now":"building","steps":["session-cost.mjs: trace_of_transcript + --trace/--trace-file CLI","page.js: fetch trace.json, cumulative chart, tool table, waste flags (held)","docs pass"]}}
{"log":{"at":"2026-10-03T01:12:10-05:00","msg":"task-loop chase 1 of 2: could not wake: no owning agent found","chase":1}}
{"assign":{"step":"session-cost.mjs: trace_of_transcript + --trace/--trace-file CLI","now":"done"}}
{"log":{"at":"2026-10-03T01:13:18-05:00","msg":"trace_of_transcript(path) added to Server/session-cost.mjs — calls cost_of_transcript(path) once as a black box for the per-turn $ grouping (untouched, no change to its behavior/shape) and re-walks the file only to find each tool_use block + the same turn-boundary rule. --trace <id> and --trace-file <id> <out> added to the CLI. Proof: node Server/session-cost.mjs --trace 355eb7ba-ed23-46bb-ab6f-77c073a23571 -> calls.length=84, turns.length=87, real…
...(3 lines)...
{"log":{"at":"2026-10-03T01:25:00-05:00","msg":"Headless proof (Server/browser.mjs, own script, never the owner's connected tab): http://monorepo.localhost/framework/ai/sessions/361c4d18-e878-4c04-9537-444e847e13d5/ at 1920 wide — chart_present=1, table_rows=28, flag_section=1, zero console errors attributable to this change (359 'weight.jsonl/page.jsonl 404' requestfailed entries are pre-existing site-wide noise, confirmed identical in count on the plain /framework/ai/sessions/ grid page too, w…
{"log":{"at":"2026-10-03T01:25:00-05:00","msg":"Docs: readme.md gets one new bullet pointing at the chart+table plus a line in 'where the real dollars come from' about --trace-file; doc/decisions.md gets a full 2026-10-03 section — why trace.json is manual/on-demand (not Stop-hook-written, a trace can be several MB for a long session), the four waste thresholds named as tunables (3+ same-file reads, 2+ chunked reads, 15s/2+ polling window, 5+ read-no-write run), why the chart is Claude-$-only (n…
{"group":"session-costs"}
{"decision":{"at":"2026-10-03T01:25:00-05:00","what":"The polling check keys a Bash call by its FULL command text, never the 60-char target string target_of() derives server-side.","why":"An early version grouped Bash calls by the truncated target, which produced dozens of false polling flags on 361c4d18's own real data (different commands that just happened to start with the same 'cd some/long/path && ...' prefix looked identical). Re-grouping by input.command (kept raw on every call entry) fix…
{"verdict":{"id":"session-trace","decision":"landed","why":"All 5 build steps done, both prove-it checks from the brief satisfied against real data (not a hand-built fixture), headless UI check clean at 1920, docs updated. Open, named gaps: trace.json stays manual (not Stop-hook-wired, documented as a deliberate limitation); the Bash-write heuristic for polling/run-flags is a regex over command text, not a certainty (documented as a tunable); the chart's hover is a native <title> tooltip per tic…
{"assign":{"now":"landed","landed_at":"2026-10-03T01:25:00-05:00"}}
{"log":{"at":"2026-10-03T01:43:52-05:00","msg":"task-loop chase 2 of 2: could not wake: no owning agent found","chase":2}}
{"log":{"at":"2026-10-03T02:13:52-05:00","msg":"task-loop escalated: {\n  \"ok\": false,\n  \"why\": \"no card \\\"live\\\"\"\n}","chase":"escalated"}}
--requirements.md--
# Session detail page: cost-over-time chart + "what was it doing" waste table

Owner's own words (2026-10-03, said while looking at the vscode-mastermind session): "The data is
already there: every transcript line has a timestamp and the usage of each call."
1. A cumulative cost-over-time chart per session: x = time since start, y = $ spent. Claude $ and
   OpenRouter $ in different colours. Mark each tool call as a tick, so flat stretches and steep
   climbs are visible.
2. "What was it doing": under the chart, a table of steps grouped by tool (Read / Edit / Bash /
   spawn…) with the count, $ and share of the total. Flag waste automatically: the same file read
   3+ times, chunked reads of one file, polling (the same file re-read while waiting), and long
   runs of reads with no write.
3. Use the dataviz rules (one chart, honest axes). Sessions list → click → this page.
"This is the tool that tells us whether an agent did anything unnecessary." Don't wait on the
owner for anything in here — decide and build.

Fold this into the existing `/framework/ai/sessions/` module (CLAUDE.md law 6 — one Sessions
system, not a second page). Read these first:

- [`public/framework/ai/sessions/
git log michael/dev grep slug:
(none)
