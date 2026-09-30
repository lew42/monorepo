# To do

Work that is waiting, in priority order. Agents put anything **you did not specifically ask for**
here instead of starting it. You pick what runs next. Each line links to its brief.

## 1. Asked for, not finished yet

- **A layout system that sticks** (2026-09-25): pages use approved layouts most of the time,
  work at 3440 (several columns, or a navigation column beside a centred main column), and get
  checked at four widths before merging. Step 1 is running: `layout-check` and the AI 2
  overview redesign. Next: an audit of the main pages against the approved set, with a
  layout-check contact sheet for each, then fixing the worst.

- **A nightly full crawl of the site** (2026-09-28, from mastermind-servex). Every page under
  /framework/ (about 1,140), one width (1920): follow every same-site link, record 404s, page
  load errors and console errors, take one screenshot, and run the padding check. About 30
  minutes of machine time and no tokens. Only the failures go to todo.md, and a model looks
  only at those. It runs at night through a scheduled job, not an agent. It builds on
  smoke.mjs's link-following (task-mastermind-smoke-links).
- **Let task masterminds message each other** (2026-09-25, from mastermind-servex). Today about
  ten messages went mastermind to mastermind-servex to mastermind, because the policy lets them
  message only mastermind-servex. Each relay cost an Opus turn and added minutes. Proposal: in
  `Servex/agents/policy.js`, allow task-mastermind to task-mastermind and card-manager to
  card-manager, and let a lead (like ai2-lead) message its members. Every such message is
  still logged to the policy log for auditing. Alternative: keep the switchboard, which is
  safer against chatter but slow. Needs a Servex restart.
- **Hide every process window: one sweep** (2026-09-25). A rough count finds 16 files that start
  processes without `windowsHide` on every call: Servex/Process.js, Servex/Servex.js,
  Servex/sustain.mjs, Server/worktree-up.mjs and worktree-down.mjs, Server/plugins/Ask.js,
  Assistant.js, CardAnswer.js, Start.js and SocketServer/Runtime.js,
  Server/health-supervisor.mjs, DesignTool/vision/run.mjs and three proof scripts. One Sonnet
  minion adds the flag to each call and proves `MainWindowHandle` = 0 for the long-lived
  children (dev servers, whisper, workers). The syntax guard now flags these files whenever
  one is edited. The Servex/ files go live at the next restart. The worktree-up popup itself
  is task-mastermind-popups'.
- **Module agents: a short readme as the way in, a ready agent to ask, no agent grows old**
  (2026-09-25, designed by mastermind-servex, [design](/framework/ai/2026-09-25/servex-mastermind/)).
  Three pieces, in this order:
  1. *Context rule (Servex/agents, small):* when a long-lived agent (manager, mastermind,
     assistant) passes its role's threshold (card assistant 40k, task mastermind and manager 150k or at landing, mastermind-servex 150k or daily; [the per-role table](/framework/ai2/2026/09/25/fresh-sessions-instead-of-context-drift/)), Servex tells it to write
     a summary line into its card or task log and then restarts it from that line. The `recycle`
     step in Layers.js already does this for card agents. Prove it on a private Servex.
  2. *Readme budget (skills only):* the `documentation` skill says a readme is about 150 words:
     what the module is, its core ideas, the files to read, and the doc/ topics. Then one Sonnet
     sweep trims the ten longest module readmes, moving the detail into doc/.
  3. *(Replaced by "An assistant on every page" below.)* `ask_module(path, question)` (Servex, a new MCP tool): one checkpoint session per module,
     built lazily from its readme and the files it names. It is keyed by path plus a hash of
     those files, and rebuilt when the hash changes. Each question is a one-shot fork of it with
     read-only tools, answers in under 150 words, and stops. Start with Servex/, core/Page,
     ext/Chat, ai2 and styles/. Prove the cost and the cache hit on a private Servex, and
     compare the answer with a fresh agent's on five real questions.
  Needs a Servex restart for 1 and 3.
- **Cards that show the thing** (2026-09-25, designed by mastermind-servex,
  [design](/framework/ai/2026-09-25/servex-mastermind/), card
  [cards-that-show-the-thing](/framework/ai2/2026/09/25/cards-that-show-the-thing/)). Every card is
  one screen: name, one-line state, live objects, a checklist, links, detail one click down. Five
  pieces, in this order, each a Sonnet minion:
  1. *Card vocabulary (ai2/card.js, in a worktree):* four new line kinds, each a method on `Card`:
     `{"state": "…"}`, `{"checklist": [{text, done, href}]}`, `{"objects": "<module path>"}` and
     `{"preview": "…"}` (60 characters at most). The Overview tab shows before it tells ([the card standard](/framework/ai2/doc/card-standard.md)): the card's folder with `ext/files`, then its objects, its checklist and its state, and the words last. Each tab, file and sub-card gets its own URL; card tabs live in localStorage today, and routing is task-mastermind-page-system's, so coordinate. `ext/files` draws a `..` row for every step outside the page's folder: show the path from the common parent instead. The rail shows `preview`, or else `state`, never the latest log line. The Live
     card's preview becomes counts (agents, working, 5h %). Update the ai2 readme's "a preview is
     never clipped" note: previews are now written short.
  2. *The object widget (ux/Objects, new):* `class Objects extends Tree`. `Objects.of(x)` walks a
     live object: a property holding a class instance becomes a row (`name: Class ×n`), a Map or
     array becomes a count that opens lazily, and the class name links to its module page. A
     module may export `objects()` in its page.js for rows the walk cannot see (a state dot,
     `new`). + New appears only where it is declared, and it makes a demo instance that is never
     saved. Run new-css-class for any class name and reuse Tree's rows. Its page.js shows it on a
     live `Page` and a live `Tree`.
  3. *Server objects (Servex, needs a restart):* `GET /api/objects` runs the same walk on the
     Servex instance, two levels deep, with names, counts and states only, never values. The
     widget reads it when a card says `{"objects": "/Servex/"}`. Prove it on a private Servex.
  4. *The check (Server/card-check.mjs, no model; reuse text_flags() from Server/text-check.mjs, which already runs at landing):* a state line, a preview of 60 characters or
     less, a checklist, every item ticked on a done card, objects on group and module cards, no
     paragraph over 60 words above the fold, and first mentions linked. It runs in on-landing
     next to layout-check, and its failures go to the servex-mastermind day task. The four card-writing prompts already open with the standard (done 2026-09-25).
  5. *Pilot, then the rest:* write the Servex group card (2026/09/24/servex) to the standard with
     Servex's card tools, check it against the design picture, then do the other seven group
     cards. card-check must pass on all eight.
- **An assistant on every page** (2026-09-25, designed by mastermind-servex,
  [design](/framework/ai/2026-09-25/servex-mastermind/page-assistant/), card
  [an-assistant-on-every-page](/framework/ai2/2026/09/25/an-assistant-on-every-page/)). It replaces
  piece 3 (`ask_module`) of "Module agents" above. Servex code, so it needs a restart, and it's
  proven on a private Servex first. Sonnet minions, in this order:
  - [ ] *Key by path (Layers.js):* `record()` takes any page path, not just a card id, and the id
        is still `assistant-<last segment>` with a `-2` suffix on a clash. A card stays a page
        whose baseline reads its `page.jsonl`; everything else reads its `readme.md`.
  - [ ] *Baseline checkpoint:* per path, spawn once with the assistant skill plus the readme, and
        don't talk to it. Store its session id with a hash of the readme, and rebuild it when the
        hash changes or its transcript is gone (after the 30-day cleanup).
  - [ ] *Resume and New session:* Resume continues the path's current session. New session is
        `spawn_agent({resume: baseline, fork: true})`, and the previous session stays listed.
        The 10-minute idle stop and wake-on-message already in Layers apply unchanged.
  - [ ] *`ask_module(path, question)`:* a one-shot fork of the same baseline, with read-only
        tools, answering in under 150 words and then stopping.
  - [ ] *At most 30 running:* before any spawn, if 30 agents are live, stop the longest-idle page
        assistant first. Never stop a working agent or a mastermind.
  - [ ] *The chat on every page:* the dev bar gets a chat tab for the current page, plus an
        optional button a page can place. It reuses the Live card's agent conversation view
        (`POST /api/agents/<id>/message`). Route it: `?chat=<session>` on the page's URL.
  - [ ] *Prove it* on three pages (ux/Tree, core/Page, one AI 2 card): open, talk, leave, come
        back, Resume, then New session. Cost per new session measured against a cold start.
- **The council hears every ask, and re-runs by itself** (2026-09-25, designed by mastermind-servex,
  [the ask loop](/framework/ai/council/)). No Servex code is needed. One Sonnet minion:
  - [ ] *`Server/council.mjs`, the collector:* gathers the owner's words since the last run from
        `.claude/prompts/<day>.jsonl` and from the `prompt` lines (by the owner) in AI 2 card
        `page.jsonl` files. **Drop sessions that belong to Servex agents** (their `session_id`
        is in `/api/agents`): the relay records relayed and agent-to-agent prompts as
        `author: "owner"` too. It writes them to the run's dir as `words.jsonl`.
  - [ ] *The run:* spawn one task mastermind (Servex `spawn_agent`, loopback /mcp, the same way
        as `Server/clarity.mjs`) with the standing brief `ai/council/requirements.md` (copied from
        2026-09-25/feedback-council). First it turns the new words into asks; then five checkers
        check the new asks plus every ask in `ai/council/asks.jsonl` whose latest verdict isn't
        done. It appends one line per ask to `asks.jsonl`, never rewriting old lines.
  - [ ] *The rhythm:* `on-landing.mjs` calls `council.mjs maybe`. It runs after 10 landings since
        the last run, or once 24 hours have passed with at least one landing. The last run is the
        latest `run` in `asks.jsonl`. Off switch: `ai/council/off`.
  - [ ] *Prove it* on one run: the cost, how many asks, how many of them new, and that the page
        updates.
- **A dictation workspace, better than one text box** (2026-09-25): somewhere to see a long
  dictation as it grows. Each sentence becomes an item you can see and move, and the raw
  transcript stays beside the structure. It is the next Dictate round after the current fixes
  land. It should start from a fresh agent that reads the `ext/Chat` and `ux/Dictate` readmes,
  because the current Dictate manager's context is full. Card: [Dictate](/framework/ai2/2026/09/24/prompt-mechanics-2/)
- **Cost on AI 2 previews and detail pages, and detail pages that fill the page.** Running now
  (task-mastermind-ai2-dashboard).
- **Recipe lab**: one task built three ways (Opus alone, Sonnet alone, five Sonnets), judged
  blind by you. Stopped for budget. [Brief](2026-09-24/recipe-lab/)
- **A page watcher per worktree, and `layout-check.mjs`**: screenshots at four widths, and a
  message to the owning mastermind when a page breaks. Stopped for budget.
  [Brief](2026-09-24/worktree-watch/)
- **Reorganize what's been built**: 12 ranked moves, starting with five imports that must move
  before the prune is safe. [Plan](2026-09-24/inventory/)
- **Merge card kinds**: 75 → 36. The first three merges are low risk.
  [Plan](/framework/ux/Content/plan/) · [brief](2026-09-24/card-consolidation/merges-requirements.md)
- **Small fixes from the feedback council** (2026-09-25, [verdicts](2026-09-25/feedback-council/)),
  each one the owner asked for and the council found unfinished:
  - Live card cold load is 1.7 to 4.6 s (the click is fast): defer the 32k-px `.ai2-rows` render. Said seven times.
  - Landed row preview prints `[object Object]`: stringify the outcome.
  - Empty AI 2 state says "Pick something on the left": land on Live; Live grid should stretch at 3440.
  - Rail rows are flush with no gap: round only the stack, or add a gap. Live's `.ai2-rows` and chat log still scroll on their own.
  - Live preview says "8 working · 2 tasks running": name what is running. Group bars are solid, not N green segments.
  - About page: padding and back-button icon still unchecked; the decisions URL the owner named is a 404.
  - Load AI 2 with Servex stopped and fix what breaks.
  - Skills: one line in `layout` (approved layouts, four widths); a console-error watcher line in `servex-mastermind`; soften non-law `must` lines.

- **directory.json per folder (later)** (the owner, 2026-09-30): split a big folder's file listing out of its page.jsonl into its own `directory.json`, so page.jsonl stays light. Not now.

## 2. Only you can do

- A Cloudflare login (about 5 minutes).
- The rule for tabs (multi-file work goes to a Servex mastermind): it changes CLAUDE.md.
- Authorize the Gmail connector.
- Say "prune" for the 739 dead files, **after** the five imports above are moved.
- Keep git stash@{0} until that prune lands.
- health.mjs lock is global (Temp/lew42-health.lock): make it per-base.

[Where these came from](2026-09-24/loose-ends/)

## 3. Proposed by agents, not requested

- **The audit's top ten** half-finished tasks: two copies of the board, the health readout not
  in the dev bar, the dev bar's missing chat tab, ask-about-any-element, Make onto ux/Tree,
  the skill trims, two Editor bugs, the /layouts/shell/ hero, four AI 2 items, and a small-fix
  sweep. [Ranked page](2026-09-24/task-audit/)
- **Readmes**: 29 stale, 46 missing. [List](2026-09-24/inventory/)
- **Servex**: the Dispatcher doesn't recognise a revived task mastermind.
  [concurrency](2026-09-24/concurrency/)
- **Names**: make skill name = role = agent id. [names.md](2026-09-24/concurrency/)
- **AI 2**: larger icons; read and unread under your control; a doc opened inside a card has no
  side padding.

- **A guard for `git stash` / `checkout --` / `reset --hard` in the main tree** (mastermind-servex-3, 2026-09-28). The rule is written in three skills and was still broken today: a PreToolUse hook on Bash that refuses these in `C:/Code/lew42/monorepo` (worktrees are fine). Wiring a Bash hook in `.claude/settings.json` is the owner's call.

- **`list_agents` returns every row ever** (mastermind-servex-9, 2026-09-30): 1248 rows, 1.3 MB, on the first call of a fresh mastermind — it blows the context it was meant to inform. Default to live rows (not stopped/gone), with `all: true` for the archive. Also the ledger's `files.jsonl` in pool worktree qf-4 shows 10+ modified `ai/*/files.jsonl` and `public/files.jsonl` — a generator writes into whichever tree it runs in; it should skip worktrees.
- **chat-hitl asks 1 and 3 unmet** (review proof, 2026-09-30): the first review.mjs run on next-chat-hitl found the demo stuck on "marking…" and two of the owner's asks unmet — [report](2026-09-30/review/proof/review/report.md). chat-hitl-2 is landed and stopped; needs an owner (a $5 fix task).
- **Cards: mini-pages wraps 2+1, leaving the page mostly empty at 3440** (review-fix-2, 2026-09-30): [`card/mini-pages/`](/framework/core/Page/card/mini-pages/)'s three preview cards wrap to two rows at every width, so "Going deep" sits alone under a mostly empty screen (82% empty at 3440). A row of three, or a `grid auto` that actually fits three, would keep the set together. Small, not urgent.
- **Cards: the preview wall still ends 4+2 at 1920** (carried from [review/report.md](2026-09-29/cards-and-logs/review/report.md) item 5, confirmed still open by review-fix-2's own fresh review, 2026-09-30): [`core/Page/card/`](/framework/core/Page/card/)'s index. Minor.
- **Cards: no real JSONL log file yet, and the AI 2 Inbox/Log-view-with-status-lights idea** (carried from [review/report.md](2026-09-29/cards-and-logs/review/report.md) item 4 and the 09-30 Inbox ask, confirmed still open by review-fix-2's own fresh review): `Logger.js` has `Logger.JSONL` (in-memory) but nothing writes one to disk yet; the Inbox/status-lights idea is split out at [next-log-view/requirements.md](2026-09-29/cards-and-logs/next-log-view/requirements.md).

- **Merge candidates, when tokens allow** (the owner, 2026-09-30: "put somewhere… a future to do when we have more tokens"). A sweep that recommends things to merge: one Sonnet minion per `core/` directory (Page, View, App, …). Each one loads the readme chain top-down, reads its module, and lists overlaps with other modules as merge candidates, ranked. A mastermind then collects the lists into one ranked page. It's a fan-out, so check the week's usage first. Words: [ai-page/owner-words.md](2026-09-30/ai-page/owner-words.md).
- **merge.mjs leaves the merge uncommitted in the main tree** (mastermind-servex-9, 2026-09-30): three times today (voice-sessions twice, cards-and-logs 3d4aa09a) the merge wrote the files into michael/dev and stopped before the commit, and the mastermind committed by exact path. Find the exit path that skips the commit (a conflict resolved by hand? the review gate?) and make the merge either commit or say in one line what it left. $5, Servex/merge fence, after the 5-hour window is back under pace.
- **UI: `/framework/ui/` goes under construction for a major overhaul** (the owner, 2026-09-30), once the skill structure for content, layout, UI and navigation is settled; `/framework/styles/` stays the CSS style guide. Words: [ui-skills/owner-words.md](2026-09-30/ui-skills/owner-words.md).
- **Dormancy loose ends** (dormant-idle, 2026-09-30, $5 minion, after pace): `heartbeat_status` wakes a dormant agent just to ask how it is; a message that wakes a dormant agent can briefly push working past the cap of 5 (only spawns wait). Answer status from the saved row; count wakes against the cap or accept the overshoot in a line of doc.
- **AI 2 merges into `/framework/ai/`** (the owner, 2026-09-30: "eventually… merge our AI2 dashboard into the framework slash AI page once it gets up and running… don't do that yet"). After the new AI page and the AI 2 Inbox settle. Words: [ai2-inbox-read/owner-words.md](2026-09-30/ai2-inbox-read/owner-words.md).
- **Task dir before task.jsonl** (voice-dir-404, 2026-09-30, fold into asks-ledger or dispatch, $0 extra): a brand-new task dir exists for a moment before its task-mastermind spawns and writes line 1; AI 2 now tolerates it (one console line, f055b4aa) but the dispatcher could write line 1 itself when it creates the dir, as the CLI launcher does.
- **merge.mjs smoke-tests deleted/moved page.js** (audio-consolidate, 2026-09-30, fold into the merge.mjs $5 item): the diff is read with `--no-renames`, so a moved page fails at its old URL. Skip page.js files that no longer exist on the branch, or test the rename target. Note the old URL still deserves an alias page when links exist (Route everything), so the tool fix is not a licence to drop them.
- **Docs tabs pad twice at 400px** (ai-page, 2026-09-30, $5 minion, after pace): ext/tabs nests a `.page` inside a `.page`, so a tab’s content gets 56px of side padding on a phone. Every module’s Docs tabs. Fix in ext/tabs (the inner page drops its side padding when its parent is a page), never per module.
- **Chat Widget: threads and reactions pass-through** (audio-consolidate 5c1b7d15, 2026-09-30, $3): chat-reactions' rail.js edits were carried onto the Widget (react lines drawn, thread fields reach say()), but the Widget does not pass threads/react into its own thread yet. Whoever resumes chat-reactions starts from 5c1b7d15; detail in ai/2026-09-30/audio-consolidate/left.md.
- **Chat sidebar not in Montserrat** (the owner, 2026-09-30, $3 minion): measure `getComputedStyle(...).fontFamily` on the live sidebar and its controls headless; fix at the cause (a missing font link on that host, a shadow root, or a rule in the widget), never with a new font-family declaration. framework.css sets `font: inherit` on controls and `var(--font)` in the theme layer, so the cause is outside the defaults.
- **Graded rules pass** (design-code follow-up, 2026-09-30, one task after the 4:50 reset, foundational): every rule on the nine /framework/design/ and /framework/code/ pages gets its grade as first word (probably; always/never only with an earned: date + breakage), the css page gets the top line (probably write no CSS...), and review.mjs reads the grade (never blocks, probably asks why). Brief = ui-skills-proposal.md "Graded rules" + "What stops an agent writing a style". Also from design-code: docs top-tabs and concept tiles on the nine child pages; the 3440 tile wrap; a live Objects instance; one worked example using both; page->design rename.
