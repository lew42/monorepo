# Handover — read this first

The file a fresh assistant, mastermind or minion reads before anything else. Rewritten
2026-09-22 15:55 by the Servex run's mastermind. Replace the dated sections as they go stale;
keep it one screen.

## LATEST, 2026-10-04 1:30 am (vscode-mastermind, session 60d9def6): the owner is on a break
- **Mission until Claude's 100% (reset Wed Oct 7, 9:59 pm):** be independent of Claude Code. Claude week at 77%.
- **In flight:** @task-mastermind-local-brain (generated question ladder for local models; then Echo cleans on local Qwen; one-shot vs step-loop test). @mastermind-servex-10 finishes two fixes (spend gate sees OpenRouter cost; spawns record parent) and stops: **the Servex mastermind role is retired**, architecture lives with the VS Code mastermind.
- **Model results** (/framework/ai/2026-10-03/new-brain/, raw API, no SDK): local qwen2.5-coder (4.7 GB) passes at $0/22 s; gpt-oss-120b $0.001 (66 s) or on Groq $0.003 (11 s); DeepSeek v4.1 flash 10/10 refine. Haiku is no longer the bar.
- **Rules saved tonight:** main site is production (worktree → check_page → merge); do a 5–10 s edit yourself, spawn for 30 s+; small task = one Sonnet agent, no Opus without a reason; replies short and anchored on names the owner knows; cheap jobs = one raw API call with only the files needed.
- **Fixed tonight:** phone reaches the main server at http://10.0.0.135:3104/ (Servex binds the main site to the LAN); Now card opens in place; Your prompts shows the words said; prompt hook ignores subagent hand-backs.
- **Open for the owner:** worktree/sessions-tab-polish and worktree/data-grid are unmerged (merge refused by the permission check); the worktree pool is broken (pool-unstick).
- **Owner's next themes:** cheap OpenRouter models that work; system design for token use (readme chain cost, mastermind-does-it vs minions, fold layers to one agent per task, every spawn logged with cost and output). Spend study: /framework/ai/2026-10-03/spend-tree/ (reviews catch a real fix 87% of the time — keep them).

## 2026-10-03 11:45 pm (vscode-mastermind, session 60d9def6)
- **Running:** @task-mastermind-day-overview (spend by day, Claude $ vs real $, by module), @task-mastermind-message-cost (raw → clean → $ per message; voice refine has never written a `refined` line).
- **Unmerged though "landed":** worktree/sessions-tab-polish and worktree/data-grid (12 commits each, both merge clean into dev, both touch ai/sessions/page.js). My merge.mjs --skip-smoke was refused by the permission classifier; the owner merges, or @mastermind-servex-10 finds why merge.mjs didn't.
- **Spend:** week 75% at 44% elapsed. Breakdown + fixes: /framework/ai/2026/10/03/now/where-this-week-s-claude-spend-went/ (sent to @mastermind-servex-10: record parent on every spawn, clarity only on owner reports, small tasks = one agent).
- **Queued briefs:** refine-to-plan (Echo → plan → quick first try, plus a live voice demo page), core List redesign (back to the framework repo's List: any value, parent not owner, Events not Item) waits for the owner's go.
- **Tonight's review of all 44 tasks:** /framework/ai/2026/10/03/now/review-of-today-s-44-tasks-what-s-really/.

## 2026-10-03 10:50 pm: a fresh VS Code mastermind tab starts here (vscode-mastermind)
- **Start from the day audit:** [ai/2026-10-03/day-audit/](/framework/ai/2026-10-03/day-audit/) lists every task from today: landed, open with its next step, queued, and done directly.
- **How to answer the owner:** substance on the day's Now card as a topic sub-card (`create_card` with `parent: "2026/10/03/now"`, then `page_add`); the sidebar gets 1–3 lines + a link. Replies: at most 3 headings, bold-titled bullets, plain words.
- **Finishing (capped, nothing new tonight):** @task-mastermind-sessions-tab-polish (mid-merge, $3 cap), @task-mastermind-data-grid (land only the windowed Sessions rows, $4 cap), @task-mastermind-push-to-talk (code landed c25c5a39, writing its landing line). Then revive @task-mastermind-system-class (nothing landed under core/System; land the class + module page first).
- **Queued, briefs written (start when usage allows; week 74% at ~45% elapsed):** dev-shell-polish, point-at-it (Ctrl+Shift+click selection), launch-icons, machine-page, ai-git-context-cost, readme trim (readme-weight.json), sessions blank fields (low). All in `ai/2026-10-03/<slug>/requirements.md` and `ai/asks.jsonl`.
- **With @mastermind-servex-10:** agents resume after restarts, no branch switching in the main tree, OpenRouter read-batching + caching check, a standing performance duty.
- **Rules learned today:** the mcp__playwright tools are denied (they pop windows); a fix made after a review needs its own proof (sub-mastermind skill); integrations only where they make sense, as their own commit (finish-task); performance rules at /framework/code/performance/ (skill `performance`); CLAUDE.md: a name is a name plus its scope.
- **The machine:** the CPU cooler's pump failed and was replaced with a Cooler Master air cooler (2026-10-03). CPU temperature isn't readable without admin (Monitor says why); if the fans get loud, check HWiNFO's CPU Package.
- **The hourly check-in** is a session cron: re-create it in the new tab (CronList first).

## After a PC restart: check this (2026-10-03, observed)
- Servex, the port-80 gate, the dev server and whisper start by themselves. Working agents do NOT resume: revive each one with an unlanded task (send_to_agent revive:true). Run CronList before re-creating a session cron: the VS Code session reattaches and its crons can survive. What came back and what didn't: [restart-observe](/framework/ai/2026-10-03/restart-observe/).

## 2026-10-03 2:45 pm: before the owner's PC restart (vscode-mastermind)
- **Answer on the Now card** (/framework/ai/2026/10/03/now/, `talking` item, newest first; write nested lines `{"talking": {...}}` with .claude/hooks/append.mjs); the sidebar gets a line + link.
- **Cut off by the restart, revive after:** @task-mastermind-topic-cards (Now topics as sub-cards), @task-mastermind-system-class (nothing committed under core/System yet), @mastermind-servex-10 (the restart-kills-agents fix). Held: @task-mastermind-framework-home-grids, the git/context/cost pages (ai/2026-10-03/ai-git-context-cost/).
- **Re-create the hourly check-in cron** (session-only, lost on restart). Usage far over pace (67% week at 38% elapsed): two agents at a time, Sonnet.
- **Never** the mcp__playwright tools (denied in .claude/settings.json; they pop windows).

## 2026-10-02 night: for a fresh VS Code mastermind tab (vscode-mastermind)
- **Who owns what:** @mastermind-page-2 (Gemini 3.8 Flash: core/Page, Item, List, Task, content, and the UI queue), @mastermind-ai-2 (Gemini 3.8 Flash: /framework/ai/, sessions, cards, models), @task-mastermind-one-dictation (Dictate, chat, drawer), @mastermind-servex-10 (Opus: Servex, RAM, token reduction, known issues). Route new asks to the owner with send_to_agent; don't spawn new task masterminds.
- **The queue:** `ai/2026-10-02/roadmap/requirements.md`, section "Owners". **The design:** `ai/2026-09-30/proposal-flow/page-item-design.md` (top sections are newest: List has events, no LiveList; sessions are pages in `ai/YYYY/MM/DD/`).
- **Budget:** the Claude week was 56% used at ~30% elapsed. OpenRouter has a +$40 burst until Monday (`%LOCALAPPDATA%/lew42/servex/openrouter-burst.json`); push hands-on work there. RAM: leftover dev servers are the leak (node-reap with servex-10).
- **The owner's standing rules this session:** replies get at most 3 headings, bold-titled bullets, short; decide and don't park; one source of truth; class folder = file = class name; pages are live (page tools); refine only the owner's prompts.
- **Why a fresh tab:** the old one (361c4d18) cost about $168 at API prices since the weekly reset, 83% of it re-reading its own huge context on every step.

## The state, in one paragraph

**Servex is running, and it is the always-on process now.** `Servex/` in this repo (ported today
from `C:/Code/servex`) holds the reverse proxy on **port 80** (since 2026-09-23: `servex.localhost` / plain `localhost` = dashboard, `monorepo.localhost` = this site, started on first visit), the dashboard on 8090, the single-writer
log, and Claude sessions held open in memory — `node Servex/sustain.mjs --status` says whether it
is up, `--stop` stops it. Its `/mcp` at `http://127.0.0.1:8090/mcp` answers eleven tools: six
for servers, five for agents (`spawn_agent`, `send_to_agent`, `interrupt_agent`, `list_agents`,
`stop_agent`). The owner's dev server on :80 is still theirs and still separate. The board at
`/framework/ai/` opens on a **Days** view — one line per finished task — and
[the last three days](2026-09-22/review-3-days/) is the clean report of 09-19..21. The run
that built all this is [`ai/2026-09-22/mastermind-servex/`](2026-09-22/mastermind-servex/); its
`requirements.md` carries the owner's whole architecture brief. **Phases 1 and 2 are done** (17:14), and the loop the owner named as top priority closed at 19:28 (`card-to-task`): every item of
[`tiers-design/doc/phases.md`](2026-09-22/tiers-design/doc/phases.md) landed; a fast assistant
lives inside Servex and names each dictated sentence in ~2 s (the Prompts tab on the board).
Phase 3 — parallel teams with a judge, the object layer — is next.

## The three things a new session should not relearn the hard way

1. **A CLI minion works only with `--permission-mode acceptEdits --allowedTools "Bash,Read,Write,
   Edit,Glob,Grep,Skill,WebFetch,WebSearch"`.** `bypassPermissions` is refused by the classifier
   on the CLI (the Agent SDK accepts it). Without those flags a minion can neither run `node`
   nor write. Smoke-tested 2026-09-22; the recipe is in the mastermind skill.
2. **Never launch anything with `cmd /c start`, never anything that opens a window.** A minion
   did, at 15:33 today, and three Windows error dialogs landed on the owner's desktop. Hidden
   launch is PowerShell `Start-Process -WindowStyle Hidden`; the minion skill's never-list has it.
3. **A reverted working tree is a stash until `git stash list` says otherwise.** `stash@{0}` is
   still on the shelf; only the owner drops it. Read one with `git show 'stash@{0}:<path>'`.

## What landed today, 2026-09-22 — every one has a page under [`ai/2026-09-22/`](2026-09-22/)

`servex-port` (the port, six recovery proofs) · `agent-host` (spawn/send/interrupt over the SDK,
first word in 3 s) · `servex-integrate` (one process, SSE stream on the dashboard, the keeper,
CORS, agents spawning agents) · `log-model` (append+fold; the naming rule lives in the writer) ·
`worktree-design` (a worktree is 274 MB; full worktrees, no restructure) · `server-fixes` (the
junction bug that emptied `node_modules`, fixed) · `tiers-design` (six roles on one page, five
docs, two new skills) · `whisper-servex` (dictation works; each sentence becomes a `prompt` log
line) · `review-3-days` · `days-view` · `reuse-audit` (the components are already merged; 739
dead files wait on the owner) · **phase 2:** `spawn-role` (role → skill, the registry) ·
`worktree-proof` (a real task in a 278 MB worktree, home and removed) · `sub-mastermind-live`
(a child's landing wakes its parent — the parking bug reproduced, then fixed) · `servex-routes`
(worktrees reach the proxy) · `naming-checks` (the rules live in `Log.append`) ·
`board-from-events` (agents live on the board, cards fold themselves) · `skills-shrink-2` (the
audit applied, −17% words) · `prompt-lifecycle` (the fast assistant in Servex, the Prompts view,
✓/✗, pre-proposals) · **evening (the owner present, budget mode from 18:48):** `board-declutter`
(one chrome line, a URL per view, grid hidden, text off the rail) · `reload-rethink` (215 reloads a
day, 203 for directory.json — a read file never reloads a tab; a hold is a fence with `--paths`) ·
`dictate-silence` (whisper was fed the quiet gaps; the bench with mic picker, live meter,
record-until-stop) · `grip-fix` · `ux-subpages` · `nav-rerender` · `talk` (one card filling with
the owner's words, top edge never moves) · `record` (a recordings workspace + `Server/whisper-test.mjs`)
· `layout-analysis` (the gutter is padding on the page now; a bleed is the only opt-out — 133 pages
measured) · `inbox-model` + `ai2-master-detail` (**`/framework/ai2/`**: rail of previews, one routed
page per card, one-line composer with the mic in it, author on every row, `+ New card` you talk
into with the transcript pinned in a footer, nothing jumps) · `card-to-task` (**the loop**: a spoken
request → `task` line → Servex's `Dispatcher` spawns a Sonnet task mastermind → the card shows
queued/working/landed — proven, 5 m 41 s and $2.04 from sentence to page) · `open-mic` (the mic
stays on, one line per sentence, a card evolves as you talk, mention links, a master assistant that
speaks only to disagree; the silent-reply bug was a tool writing its event as a string) ·
`padding-law` (68 of 107 pages had text at an edge at some width, 4 do now; `node
Server/padding-check.mjs <url>` before landing a page; the health watcher measures at 3440 too) ·
`system-retro` — **the end-of-day report**: [`ai/2026-09-22/system-retro/`](2026-09-22/system-retro/)
(34 tasks, ~$552, the cost table and timeline, the fifteen laws the owner said more than once with
where each is written, the state of every tier, what goes where with five ranked suggestions).

**2026-09-23 (Tuesday, updated 13:05).** [`ai2-nested`](2026-09-22/ai2-nested/) landed and is merged
(`fdbd9f48`): **`/framework/ai2/` opens on four columns by importance** (needs-you · reports · landed ·
live), the rail + card page is the second view, sub-cards open in a third column, every card has its own
event file on Servex (`/log/cards/<slug>`, 166 migrated). It cost $27.61 in two rounds because the
worktree's copy of the brief was stale (fixed: `launch-wt.sh` copies the task dir's `.md` files in) and
the first live stream event broke the screen (rows built outside a builder; one-line hand fix in
`overview.js` `draw()`); round 3 is queued in [`next.md`](2026-09-22/ai2-nested/next.md). Also today:
`Server/plugins/Hosts.js` — **`servex.localhost`, `monorepo.localhost`, `wt-<slug>.localhost` with no
port**, through the owner's dev server to Servex's proxy (live after the owner restarts their server;
caveats in decision `caveat-front-door`); **dispatch is paused** by `%LOCALAPPDATA%/lew42/servex/dispatch.off`
(delete to resume; decision `dispatch-pause`); the mastermind no longer polls when idle (skill step 6;
one cron at 22:04 dispatches `names-align` after the weekly reset at 21:59). Budget: weekly 91% at 91–93%
elapsed all day — Sonnet only until the reset.

**Lessons the evening paid for:** on Windows a process started with `windowsHide` has NO
console, so its children pop VISIBLE consoles — roots get a hidden console (PowerShell
`Start-Process -WindowStyle Hidden`) and nothing below hides itself (`server.js`, `sustain.mjs`,
`Process.js`, `CardAnswer/Ask/Assistant.js`, `worktree-up.mjs` all fixed). Minions work in
worktrees (`launch-wt.sh` in the run's scratchpad: a branch off `michael/dev`, the task dir's `.md`
files copied in because the brief is never committed, the minion commits on its branch); tear one
down with `wt-teardown.ps1 <slug>` (kills by path first — two orphaned servers burned a core each
when the registry's pid went stale — then `git merge --no-ff`, then removes the worktree). A card
JSON through a bash heredoc double-encodes non-ASCII — Write tool only. A launch inside `bash … &`
never notifies — one `run_in_background` call per minion.

## Stood down 2026-09-23 13:10 — the handoff

The owner stood the Servex run down. **Nothing is in flight**; no cron, no wakeup, no worktree, no
minion. The next session picks up here, in this order:

1. **`names-align`** — brief not yet written. Skill = role = agent id: `fast-assistant`,
   `master-assistant`, `mastermind`, `task-mastermind`, `minion`, `log-assistant`; singletons drop
   the suffix; `Servex/agents/roles.js` is the one table; the master assistant is Opus at low–medium;
   the CLI launch recipe shrinks to a "fallback" section in the mastermind and minion skills;
   in-process tools ([`tiers-design/doc/tools.md`](2026-09-22/tiers-design/doc/tools.md)) become the
   spawn default. One Sonnet minion in a worktree, after the weekly reset (Tue 21:59).
2. **AI 2 round 3** — [`ai2-nested/next.md`](2026-09-22/ai2-nested/next.md) (eight numbered items:
   the chain of who touched a card, cost per card, dispatch state on the card, stale agents in Live,
   the empty word, landed over three days, prove against a live-log replay).
3. **Small Servex items** from today's questions: a `restart_servex` tool (`process.exit(0)`, the
   keeper respawns); re-attach agents after a restart; `pause_dispatch`/`resume_dispatch` tools on top
   of the pause file; the port-management layer (decision `caveat-front-door`).

**Switches left in a state the owner should know:** dispatch is **paused** —
`%LOCALAPPDATA%\lew42\servex\dispatch.off` exists; delete it and spoken tasks spawn again.
~~`Server/plugins/Hosts.js`~~ — replaced 2026-09-23 by [`servex-port-80`](2026-09-23/servex-port-80/):
Servex's proxy owns port 80 and the dev server runs behind it. Servex runs under keeper 40072 (server 21744) with the merged code. The main tree has
uncommitted work (Hosts.js, run.js, worktree-up.mjs, Dispatcher.js, the skill, ledgers) — the owner
commits.

## What the owner is waiting on - in order

**Re-checked against the repo on 2026-09-22 by `ai/2026-09-22/review-3-days/`** — every item below
was verified, not carried forward. Two of the old seven turned out to be resolved and are struck
through at the bottom; the corrected list, with what proved it, is also on
[that task's page](2026-09-22/review-3-days/).

0. **Say "prune"** — 739 dead files (14,354 lines) behind 26 moved `/imagine/` pages, byte-identical to their moved copies and imported by nothing; the table and the one command are on [`reuse-audit`](2026-09-22/reuse-audit/). 2 minutes.
1. **One restart switches on three finished fixes**: stop the supervisor named in
   `ai/health/heartbeat.json` (`supervisor_pid`) and start `node Server/health-supervisor.mjs`
   again. **Still true, 2026-09-22 15:00** — the heartbeat is live and `supervisor_pid` still reads
   **34636**, the same process id as yesterday, started 2026-09-19 19:30 and never restarted since.
   Until it is, the watcher runs Saturday's rules, and the reason it never picked up new ones is
   itself one of the fixes waiting (`ai/2026-09-21/safe-rollout/`).
2. **One block for `.claude/settings.json`** — the hold-guard's recording half (a `Bash` matcher on
   the existing `PostToolUse` array) and the prompt-relay hook that fixes the one measurably
   fixable stage of the 29-minute delay. **Still true, 2026-09-22** — read the file: `PostToolUse`
   carries only `Edit|Write|NotebookEdit` and `Skill`, and there is no `UserPromptSubmit` key at
   all. The exact block, already driven with real test payloads, is
   `ai/2026-09-21/arm-the-hooks/settings-block.md` (one paste, superseding the two in
   `ai/2026-09-19/hold-guard/`).
3. **Decide what happens to the shelf.** The commit itself is done (`3e9536d4`, tree clean).
   ⚠ `stash@{0}` (1,389 files, Friday night) is still there. Its files differ from HEAD, but that
   is expected: later work moved them on, and Sunday's restore is what put them on disk in the
   first place. It is very likely fully subsumed and it costs nothing to keep. **Only the owner
   should drop it**, and only after they are satisfied — along with the 22 files inside it whose
   honest intent was a deletion (`ai/2026-09-20/stash-restore/`).
4. **Seven skill changes written; six still unapplied** — `ai/2026-09-19/system-eval/`. Checked
   2026-09-22: change 4 landed (`.claude/hooks/append.mjs` exists and `new-task/SKILL.md` names
   it). The other six have not: `.claude/sessions.mjs` and `ai/sessions.jsonl` do not exist,
   `auditor/SKILL.md` is still its own skill, and `mastermind/SKILL.md` is 386 lines — it grew.
5. **Three Server-side items need one restart window**: two plugins and a hook name the old board
   path, `Append.js` fails on a resolved url, `Directory.js` mangles nested listings. Still true —
   `Server/plugins/Assistant.js:56` and `.claude/hooks/prompt-relay.mjs:52` both still default to
   `public/framework/ai/v/3/board.jsonl`, which moved on 2026-09-19 and works today only because a
   filesystem hard link stands in for it.
6. **Housekeeping, unchanged in substance:** 15 idle `node` processes, exactly one of which holds a
   port (`:80`, pid 9572 — the owner's). The idle **pm2 daemon is still running** (pid 31704); an
   earlier check called it gone, which was wrong — it runs as `node.exe`, so a name filter misses
   it. `:8123` is not listening at all.

**Resolved since this list was written, both verified 2026-09-22:**

- ~~A Bash permission rule for CLI minions.~~ **DONE.** `--permission-mode bypassPermissions` is
  refused by the auto-mode classifier, but `acceptEdits` plus `--allowedTools
  Bash,Read,Write,Edit,Glob,Grep` both writes files **and runs them** — smoke-tested on Haiku in
  9s. The recipe is in `ai/2026-09-22/mastermind-servex/task.jsonl`.
- ~~The V3 head row measuring 255px at 400px wide.~~ **DONE, and now proven.** `ai/2026-09-21/head-mobile/`
  shipped the `More ▾` fold but could not run a single command to check it. Measured 2026-09-22 on
  a private `:8091` server: `.v3-head` is **133px at 400**, 105px at 1280, 76px at 1920, with zero
  console errors at all three widths.

## Where to look

- The owner's words, verbatim, newest last: `ai/board.jsonl` (moved out of `v/3/` 2026-09-19). Their live board is
  [`/framework/ai/v/3/`](v/3/). `node .claude/skills/every-prompt/say.mjs state` prints the
  state, the inbox and the cards in one go, and posts cards.
- Recent work: `ai/2026-09-21/*/` then `ai/2026-09-20/*/` — each has a brief, a log, and usually
  a one-screen page. The newest run ledger is `ai/2026-09-19/mastermind-sonnet-run/task.jsonl`.
- The previous handover, longer and still mostly true:
  `ai/2026-09-17/mastermind-layout-browser/handover.md`, with `asks.md` beside it.
- The roles: `.claude/skills/every-prompt/tiers.md`. How the process is going:
  [`/framework/ai/process/`](process/).

- Owner items and every decided loose end since 2026-08-08: [/framework/ai/2026-09-24/loose-ends/](/framework/ai/2026-09-24/loose-ends/) (2026-09-24).
