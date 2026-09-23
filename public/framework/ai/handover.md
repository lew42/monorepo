# Handover — read this first

The file a fresh assistant, mastermind or minion reads before anything else. Rewritten
2026-09-22 15:55 by the Servex run's mastermind. Replace the dated sections as they go stale;
keep it one screen.

## The state, in one paragraph

**Servex is running, and it is the always-on process now.** `Servex/` in this repo (ported today
from `C:/Code/servex`) holds the reverse proxy on 8080, the dashboard on 8090, the single-writer
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

**Tomorrow starts with** [`ai/2026-09-22/ai2-nested/`](2026-09-22/ai2-nested/requirements.md): the
persistence survey (`ext/Saver`, `page.json`, `Page.Store`, Make), then per-card storage (decision
`card-storage` + `card-storage-2`: the conversation stream stays an append-only per-card log written
only by Servex; a card's state lives in `ai/cards/<slug>/` through the page persistence system),
sub-cards opening in a third column, the deferred AI 2 items. Budget: the weekly window ends Tue
21:59; it sat at ~83% used with ~88% elapsed on Monday night — Sonnet only until the reset.

**Lessons the evening paid for:** on Windows a process started with `windowsHide` has NO
console, so its children pop VISIBLE consoles — roots get a hidden console (PowerShell
`Start-Process -WindowStyle Hidden`) and nothing below hides itself (`server.js`, `sustain.mjs`,
`Process.js`, `CardAnswer/Ask/Assistant.js`, `worktree-up.mjs` all fixed). Minions work in
worktrees (`launch-wt.sh` in the run's scratchpad: carry-in of the uncommitted tree as a
per-worktree tag, land by patch or copy); tear one down with `wt-teardown.ps1 <slug>` (kills by
path first — two orphaned servers burned a core each when the registry's pid went stale). A card
JSON through a bash heredoc double-encodes non-ASCII — Write tool only. A launch inside `bash … &`
never notifies — one `run_in_background` call per minion.

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
