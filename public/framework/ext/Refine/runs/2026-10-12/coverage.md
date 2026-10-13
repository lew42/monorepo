# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | [sessions/2026/10/12/feedback-council/requirements.md] | ask #11 (thin) |
| S2 | Feedback council: brief for each of the five checkers. | ask #11 |
| S3 | Card dir (read the raw words there): `public/framework/ai/council/` (and the current run directory). | ask #11 |
| S4 | Words: `words.jsonl` in the active run directory. | ask #11 |
| S5 | Asks to check: new asks extracted from `words.jsonl` plus every open ask in `public/framework/ai/council/asks.jsonl` whose latest verdict isn't `done`. | ask #11 |
| S6 | Your job. | ask #11 |
| S7 | For EVERY ask, LOOK at the real result and give one verdict: `done` / `partly` / `not done` / `done-but-wrong`, one line of evidence (URL, screenshot path, file:line), and for anything not `done` the smallest fix. | ask #11 |
| S8 | Prove before you call something missing. | ask #12 |
| S9 | A false "not done" is the common failure: search the repo (`git log`, grep, the skills in `.claude/skills/`, CLAUDE.md) before writing it. | ask #12 |
| S10 | The live site: http://monorepo.localhost (never http://localhost/). | ask #13 |
| S11 | Visual asks: headless Playwright at 1920 and 3440 (Playwright, never the owner's tabs, no `mcp__site__eval` on tabs the owner has open). | ask #13 |
| S12 | Time the Live card load. | ask #13 |
| S13 | Check scroll on the named URLs with real overflow measures. | ask #13 |
| S14 | No window may pop up: `windowsHide: true`, `-WindowStyle Hidden`. | ask #13 |
| S15 | Do NOT edit any repo file. | ask #15 |
| S16 | Scratch goes in your scratchpad; screenshots go to `<run-dir>/shots/<your-name>-<ask>.png` only for the ones that are evidence (keep <=12). | ask #15 |
| S17 | Also scan `words.jsonl` and add up to 8 extra asks the owner made there that current asks miss, with the same verdict. | ask #14 |
| S18 | Return. | ask #15 (thin) |
| S19 | Write ONE json file `<run-dir>/votes/<your-name>.json`: `{"name":"...","votes":{"A1":{"v":"done\|partly\|not done\|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...},"extra":[{"ask":"...","v":"...","e":"...","f":"..."}]}`. | ask #15 |
| S20 | Then reply "done" in one line. | ask #15 |
| S21 | Never write the owner's name anywhere. | ask #15 |
| S22 | Budget about $2 each: be quick, do not over-explore. | ask #15 |
| S23 | Load the `minion` skill first only if it does not conflict: you edit nothing but your votes file and shots. | ask #15 |
| S24 | [sessions/2026/10/12/session-0e99727c/voice-to-session-page/requirements.md] | ask #24 |
| S25 | Voice to session page, in real time (mastermind brief). | ask #24 |
| S26 | Goal: when the owner speaks, they watch their words turn into cards on the session's own page, live, from the phone. | ask #24 |
| S27 | They test it tomorrow. | ask #24 |
| S28 | The five stages, each shown on the page as it happens: | ask #24 |
| S29 | Raw: Whisper's text, as spoken. | ask #24 |
| S30 | Clean: the same text, tidied. | ask #24 |
| S31 | Structure: the clean text split into its points. | ask #24 |
| S32 | Refined: the finished prompt. | ask #24 |
| S33 | Cards: the refining model writes them onto the page with the page tools. | ask #24 |
| S34 | Which page: every session has one at `/framework/ai/sessions/<id>/`. | ask #25 |
| S35 | By default an agent writes to its own page. | ask #25 |
| S36 | This works the same whether the owner dictates in the browser or the app. | ask #25 |
| S37 | "That's the kind of feedback loop that I'd like." (the owner, 2026-10-12) | ask #25 |
| S38 | What exists (read STATE/reports first, do not rebuild): `ai/sessions/2026/10/09/session-48083d9d/refine-dictate-ui/` (VoiceStrip, phase-2 report, mobile-socket answer), `ux/Dictate/doc/voice-architecture.md`, `ext/Refine`, the Whisper server under Servex, and the task audit's transcription loose ends (`ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task/by-system.md`, "Transcription and refinement": 10 `now` rows, Haiku-labelled, about 58% reliable). | ask #26 |
| S39 | Page tools: `Servex/agents/page_tools.js`. | ask #26 |
| S40 | The AI-facing page model is being written by @mastermind-page-ai-api (`core/Page/doc/ai-api.md`); use its tools, ask it, don't fork them. | ask #26 |
| S41 | Done when (tick each with proof). | ask #28 |
| S42 | Reproduce first on current `michael/dev`: dictate (a recorded audio file fed headless is fine) and record which stage breaks or lags, with timings, in `STATE.md`. | ask #27 |
| S43 | Whisper stays up: it survives a reload and a phone reconnect; a crash restarts by itself (Servex) and the page says so in one plain line. | ask #28 |
| S44 | Each stage is visible live on the session page: raw, clean, structure, refined, cards, each written by page-tool deltas as it happens (stream, not poll; about 100 ms updates), one class per stage with its own view. | ask #28 |
| S45 | Phone: the same flow works at 400 px from the phone address (`10.0.0.135`), proven headless at mobile width. | ask #28 |
| S46 | For tomorrow's test: a short `ux/Dictate/doc/try-it.md` (open this URL on the phone, press this, expect that) linked from the Dictate readme, and an `owner_note` (kind `needs-you`) pointing to it. | ask #28 |
| S47 | Close the transcription `now` loose ends this resolves, each by checking it, not trusting the Haiku label. | ask #28 |
| S48 | Layout-check at 400/1200/1920/3440; smoke clean; commit each step; merge. | ask #28 |
| S49 | Sonnet 5.5 (you); Haiku under 60k for reading. | ask #29 |
| S50 | Worktree; one Servex restart batched and proven on a private port. | ask #29 |
| S51 | One-sentence chat replies; `STATE.md` here; land with `finish-task`. | ask #29 |
| S52 | [sessions/2026/10/12/session-0eaa4f07/inbox-asks/requirements.md] | ask #22 |
| S53 | The AI Inbox and dashboard cards: close the open asks. | ask #22 |
| S54 | The asks: [ai/doc/asks.md](/framework/ai/doc/asks.md), cluster inbox-dashboard-cards (#3, asked 19x). | ask #22 |
| S55 | Read that entry and its source links first; its "Open" line is the work. | ask #22 |
| S56 | Labels came from reading docs, not every line of code, so check each against the code before building. | ask #22 |
| S57 | Done when. | ask #22 |
| S58 | Each open point in the cluster is done (with a commit), or written up in `STATE.md` with the reason it cannot be done tonight and the smallest next step. | ask #22 |
| S59 | Proof per point: a headless check, a screenshot, or a command's output. | ask #22 |
| S60 | Layout-check 400/1200/1920/3440 for any page change; smoke clean. | ask #22 |
| S61 | The cluster's entry in `ai/doc/asks.md` is updated (done / partly / open) with commit links. | ask #22 |
| S62 | Never destructive (move aside, never delete). | ask #22 |
| S63 | Sonnet 5.5, medium. | ask #22 |
| S64 | Worktree; commit each step; merge. | ask #22 |
| S65 | One-sentence chat replies; `STATE.md`; land with `finish-task`. | ask #22 |
| S66 | [sessions/2026/10/12/session-15fbffb1/sessions-asks/requirements.md] | ask #23 |
| S67 | The Sessions system: close the open asks. | ask #23 |
| S68 | The asks: [ai/doc/asks.md](/framework/ai/doc/asks.md), cluster sessions-system (#4, asked 16x). | ask #23 |
| S69 | Read that entry and its source links first; its "Open" line is the work. | ask #23 |
| S70 | Labels came from reading docs, not every line of code, so check each against the code before building. | ask #23 |
| S71 | Done when. | ask #23 |
| S72 | Each open point in the cluster is done (with a commit), or written up in `STATE.md` with the reason it cannot be done tonight and the smallest next step. | ask #23 |
| S73 | Proof per point: a headless check, a screenshot, or a command's output. | ask #23 |
| S74 | Layout-check 400/1200/1920/3440 for any page change; smoke clean. | ask #23 |
| S75 | The cluster's entry in `ai/doc/asks.md` is updated (done / partly / open) with commit links. | ask #23 |
| S76 | Never destructive (move aside, never delete). | ask #23 |
| S77 | Sonnet 5.5, medium. | ask #23 |
| S78 | Worktree; commit each step; merge. | ask #23 |
| S79 | One-sentence chat replies; `STATE.md`; land with `finish-task`. | ask #23 |
| S80 | [sessions/2026/10/12/session-19429b3d/session-housekeeping/requirements.md] | ask #16 |
| S81 | Session data housekeeping: commit rule, machine-log sweeper, OpenRouter gap (task mastermind brief). | ask #16 |
| S82 | Read `public/framework/ai/handover.md`, `ai/sessions/readme.md`, `ai/sessions/doc/` and `ai/sessions/2026/10/10/session-41240bd9/tasks-into-sessions/STATE.md`. | ask #16 |
| S83 | Tasks were moved into session folders; check what landed and what is left: 994 tasks had no session and stay, and 12 did not land. | ask #17 |
| S84 | Do. | ask #17 |
| S85 | Working-tree hygiene: `git status` shows dozens of machine-written files (`ai/sessions/2026/**/index.json`, `*/files.jsonl`, `public/ai/*.jsonl`, task `page.jsonl`/`task.jsonl`). | ask #18 |
| S86 | Decide for each class of file: commit (versioned log), gitignore (cache), or regenerate. | ask #18 |
| S87 | Write the rule in `ai/sessions/doc/` and the readme; apply it (`.gitignore` edits are fine; committing is fine; never delete data). | ask #18 |
| S88 | A Servex sweeper: a small class (one file named for the class) that commits machine-written logs in batches on a timer (e.g. every 30 min when quiet, only paths on an allowlist, attributed `servex: log sweep`). | ask #19 |
| S89 | It is idempotent and never touches code files or other agents' staged work; it has a dry run mode and logs what it did. | ask #19 |
| S90 | Put it where Servex jobs live (`Servex/`), after reading `Servex/readme.md`; do not change `Servex/Pool.js`. | ask #19 |
| S91 | OpenRouter account-vs-log gap: the account showed more dollars than `openrouter.jsonl` explains (handover item 1). | ask #20 |
| S92 | With a script, reconcile by day and model, find the missing calls (other keys? Servex-external callers? echo?), and write the finding in `ai/sessions/doc/`. | ask #20 |
| S93 | Make the Sessions page show "unattributed OpenRouter $" so the gap is visible, not hidden. | ask #20 |
| S94 | Verify the tasks-into-sessions move end to end with its verify script; list anything unreachable from the site and link it. | ask #17 |
| S95 | Fences. | ask #21 |
| S96 | Never destructive. | ask #21 |
| S97 | Worktree for code; commit each working step after a smoke test; merge via `Server/merge.mjs`. | ask #21 |
| S98 | A `Servex/` change needs a restart: batch it and prove it boots. | ask #19 |
| S99 | Sonnet 5.5; Haiku under 60k tokens for reading; `node Server/usage-now.mjs` before spawns; no OpenRouter calls. | ask #21 |
| S100 | One-sentence chat replies; `STATE.md` here; land with `finish-task`. | ask #21 |
| S101 | [sessions/2026/10/12/session-1c7d9e04/page-split-3/requirements.md] | ask #8 |
| S102 | Page.class.js split, step 7: jsonl (the last move). | ask #8 |
| S103 | Plan: [core/Page/doc/split-plan.md](/framework/core/Page/doc/split-plan.md), step 7. | ask #8 |
| S104 | Steps 1-6 landed tonight ([page-split-1](../../session-75fc1375/page-split-1/STATE.md), [page-split-2](../../session-e55f5a4b/page-split-2/STATE.md)): 2,270 to 1,089 lines, nothing broke. | ask #8 |
| S105 | Jsonl (~470 lines: replay, the file steps, `set()`'s jsonl handling) is the core path of every page, so this is the careful one. | ask #8 |
| S106 | Do. | ask #8 |
| S107 | Move the jsonl replay and file steps into their own class file (`Page.Jsonl`, or the name the plan settles), held by the page or attached as a static so a subclass can swap it. | ask #8 |
| S108 | `page.set()`, `Page.Reader` and every public name keep their exact behaviour; replay order is unchanged. | ask #8 |
| S109 | Before moving: record a baseline. | ask #9 |
| S110 | For 40 pages (core, ai, sessions incl. a live session page, imagine/paging, markdown, a parts page, a page-tool-built page), save the computed state (`page_read`) and a 1200 screenshot. | ask #9 |
| S111 | After: the same, diffed. | ask #9 |
| S112 | Any difference is a failure. | ask #9 |
| S113 | Prove the page tools still stream: `page_set`/`page_add` on a scratch page show in a watching headless browser within a second (as in `core/Page/doc/ai-api.md`'s proof). | ask #9 |
| S114 | Done when. | ask #9 |
| S115 | Baseline vs after: 0 state diffs, 0 new console errors, screenshots match at 400/1200/1920/3440. | ask #9 |
| S116 | Smoke clean. | ask #9 |
| S117 | `split-measure.mjs` before/after in `STATE.md`; step 7 ticked; `split-plan.md` says the split is complete. | ask #10 |
| S118 | Merge with live reloads held during the batch. | ask #10 |
| S119 | If any diff can't be fixed, don't merge: leave the branch and write why in `STATE.md`. | ask #10 |
| S120 | Sonnet 5.5, high. | ask #10 |
| S121 | Worktree. | ask #10 |
| S122 | Land with `finish-task`. | ask #10 |
| S123 | [sessions/2026/10/12/session-26eee6cc/live-page-error/requirements.md] | ask #1 |
| S124 | Live site: a page load error hit the owner mid-browse, and UI lands without screenshots. | ask #1 |
| S125 | Owner (2026-10-12, ~14:10 local): browsing `/framework/ai/sessions/` (a session detail open), the page refreshed itself and showed a page load error. | ask #1 |
| S126 | "We shouldn't be causing errors on the live site while I'm browsing it… I thought we weren't doing that anymore." | ask #1 |
| S127 | Done when (tick each with proof). | ask #4 |
| S128 | Find the cause: what reloaded and what failed around 19:00–19:15Z (merges on `michael/dev`: `git log --since`, the dev server and Servex logs via `server_logs`, the hold log). | ask #1 |
| S129 | Name the commit or write that did it, and why the guard (`Server/hold.mjs`, worktree → `check_page` → merge) didn't stop it. | ask #1 |
| S130 | Close the gap in code, not in a rule only: e.g. merge holds reloads and boots the page headless before releasing; a page that fails after a reload keeps the old one with a one-line notice instead of an error screen. | ask #2 |
| S131 | Smallest fix that would have prevented this one; record the alternative. | ask #2 |
| S132 | Screenshots gate: UI agents keep landing layouts nobody looked at (cut-off columns, crammed tables). | ask #3 |
| S133 | Check whether `merge.mjs`'s review gate really requires the 400/1200/1920/3440 shots for a page change; if it can be skipped, make it require them (files present in the task dir). | ask #3 |
| S134 | One line in the relevant doc. | ask #4 |
| S135 | Note in `Server/doc/watch.md`; commit; merge; land. | ask #4 |
| S136 | Sonnet 5.5. | ask #4 |
| S137 | Worktree; one Servex restart if needed, proven on a private port. | ask #4 |
| S138 | `STATE.md` here; one-sentence replies; land with `finish-task`. | ask #4 |
| S139 | [sessions/2026/10/12/session-38388428/page-split-plan/requirements.md] | ask #5 |
| S140 | Page.class.js split plan (plan only, no code moves). | ask #5 |
| S141 | Owner (2026-10-12): "What exactly is 2,000 lines in the Page class? That might be a mistake." | ask #5 |
| S142 | Measured: `core/Page/Page.class.js` is 2,270 lines: 926 comment (40%), 317 blank, 1,027 code, 151 methods. | ask #5 |
| S143 | Biggest areas by section markers: page.jsonl replay and the three file steps (lines ~72-500), the six words, roles, link opening (~907), rendering (~1238, `render_content_list` 101 lines), related aside (~1474), columns, the Finder shape (~1526-1973, ~450 lines), preferences (~1973). | ask #5 |
| S144 | Done when (tick each with proof). | ask #5 |
| S145 | The measuring script exists, and its output answers the owner's question: what the 2,270 lines are (code vs comment vs blank). | ask #7 (thin) |
| S146 | `core/Page/doc/split-plan.md` fits one screen and shows the target class tree in code, with a target size for `Page.class.js` (for example, under 600 lines). | ask #6 |
| S147 | Each move names its risk (callers) and its order, lowest risk first. | ask #6 |
| S148 | The core/Page readme links `doc/split-plan.md`. | ask #7 |
| S149 | `Page.class.js` is unchanged (`git diff` empty for it). | ask #6 |
| S150 | Do (write, do not move code). | ask #6 |
| S151 | A script that measures each section and method (code vs comment lines) and lists which other files call each group of methods (a cheap import/call grep). | ask #5 |
| S152 | `core/Page/doc/split-plan.md`, one screen: for each group, keep in Page, move to a composed helper class (one file named for it, e.g. `Page.Columns`, `Page.Links`, `Page.Jsonl`, attached as statics or held by reference), or move to an extension. | ask #6 |
| S153 | Aim for a Page class whose file a reader can scan. | ask #6 |
| S154 | Show the target as a class tree in code. | ask #6 |
| S155 | Name the risk per move (callers) and an order (lowest risk first). | ask #6 |
| S156 | Comments: flag ones that are history, not explanation (candidates to move to `doc/`). | ask #6 |
| S157 | Link it from the core/Page readme. | ask #7 |
| S158 | No changes to `Page.class.js` in this task; executing the split is a later task. | ask #6 |
| S159 | Sonnet 5.5; Haiku under 60k tokens for counting; commit; one-sentence chat replies; land with `finish-task`. | ask #7 |
| S160 | [sessions/2026/10/12/session-3b391f22/claude-md-consolidate/requirements.md] | ask #36 |
| S161 | CLAUDE.md consolidation, non-destructive (task mastermind brief). | ask #36 |
| S162 | Owner (2026-10-12): CLAUDE.md is too long (~4,100 words, ~5,700 tokens paid by every session), and rules added one correction at a time may conflict or be worded too strongly. | ask #36 |
| S163 | Consolidate for clarity, but nothing useful may be lost: a tip that does not belong in CLAUDE.md moves to where it belongs (a module readme, a `doc/`, a skill), and it is never just deleted. | ask #36 |
| S164 | The owner cannot judge each line, so the process must be safe by construction. | ask #36 |
| S165 | Do not wait on the owner: they may not read chat. | ask #36 |
| S166 | Inputs: `ai/sessions/2026/10/09/session-a07780b9/system-architect/claude-md-proposal.md` (a 1,172-word draft, never applied), `ai/sessions/2026/10/12/session-b5cae4be/skill-usage-audit/recommendation.md`. | ask #36 |
| S167 | Do. | ask #36 |
| S168 | Sentence manifest, by script: split the current CLAUDE.md into sentences/rules with ids; for each, a row: keep (in CLAUDE.md), move (to a named file, with the anchor), merge (into which kept rule), or retire (only for a rule about a system that no longer exists, and it still goes to an archive file). | ask #37 |
| S169 | Every sentence appears in exactly one row. | ask #37 |
| S170 | A check script proves zero sentences are dropped: every one is in the new CLAUDE.md, in its destination file, or in `ai/doc/claude-md-archive.md`. | ask #37 |
| S171 | Strength words: keep the owner's own strength ("always" only for what has broken things; else "usually", "prefer"). | ask #38 |
| S172 | Never strengthen a rule while moving it. | ask #38 |
| S173 | Owner quotes and dates stay with the rule wherever it goes. | ask #38 |
| S174 | Review page for the owner (one screen, linked from the AI board as a Note card): what was cut from CLAUDE.md, shown as short before/after blocks grouped by destination, plus the word counts. | ask #40 |
| S175 | The owner can read it later; it does not block. | ask #40 |
| S176 | Apply in a worktree: the new CLAUDE.md, the moved text appended to its destinations, the archive file, and the manifest. | ask #41 |
| S177 | Commit, review the diff yourself, merge. | ask #41 |
| S178 | Recent owner rules (2026-10-07 to 10-12: "Chat is the headline", "How to respond", "Mind the token burn", "Never destructive", "Stream, don't poll", "Haiku stays under 100k", "Commit after every working step", the class rules) stay in CLAUDE.md, tightened but not weakened. | ask #39 |
| S179 | Reversible: the old file is in git, and the manifest maps every sentence. | ask #41 |
| S180 | Write `STATE.md`; land with `finish-task`. | ask #41 |
| S181 | Fences. | ask #41 (thin) |
| S182 | Sonnet 5.5 (you): a fresh Sonnet reviewer reads the manifest and the new file once before merge and flags any rule whose meaning changed. | ask #41 |
| S183 | No OpenRouter. | ask #41 |
| S184 | One-sentence chat replies. | ask #41 |
| S185 | [sessions/2026/10/12/session-471f8c3b/page-slice/requirements.md] | ask #30 |
| S186 | Page system smallest slice: a page whose content is a streamed list of views (task mastermind brief). | ask #30 |
| S187 | Why (owner, 2026-10-08 and 2026-10-10): page content should not be only a markdown string; a page's views are a list loaded from the page's own JSONL, rendered in a loop (as chat messages and session files already are), and editing the list persists by itself because that is how streaming lists and pages work. | ask #30 |
| S188 | Templates (toolbars, headers, sidebars) are saved as JSONL view data. | ask #30 |
| S189 | Not yet proven. | ask #30 |
| S190 | Do. | ask #30 |
| S191 | Inventory what exists (cheap, a script plus readmes): `core/Page` (`page.jsonl`, `live()` tail, `thing.page`/`page.thing` composition), `ext/Refine`, the session viewers (`ai/AISession/*`), and streaming lists. | ask #30 |
| S192 | Read `core/Page/doc/indexing-2026-10-08.md`, `ext/Chat/doc/panel-composition-2026-10-08.md`, `ai/doc/tooling-architecture-2026-10-08.md`, and `ai/sessions/2026/10/08/task-system-design/task-system-design/`. | ask #30 |
| S193 | Design the class architecture first (CLAUDE.md "Design the class architecture before you build"): a short page naming each class, its job, what extends or composes what, and the orchestrator; show it where the owner can see it. | ask #31 |
| S194 | Build the smallest slice that proves it: one page whose body is a list of views stored in its `page.jsonl` (first line a snapshot is allowed, later lines deltas), rendered by one class, with at least three view kinds (heading, text/markdown, card) and add/move/remove through a tool or method that appends deltas. | ask #32 |
| S195 | A reload and a second tab show the same state live. | ask #33 |
| S196 | Smoke-test and layout-check it. | ask #33 |
| S197 | Then use it once for real: render one existing small page (a readme-like page) through it to show it is not a toy. | ask #33 |
| S198 | Record decisions and the alternative (e.g. `page.js` as today vs JSONL views; a snapshot line vs all deltas) in the module's `doc/`, linked from its readme and from the AI/page indexes. | ask #34 |
| S199 | Fences. | ask #35 |
| S200 | Worktree; commit each working step after a smoke test; review the diff; merge via `Server/merge.mjs`. | ask #35 |
| S201 | Everything is linked from the site. | ask #34 |
| S202 | Do not change existing `core/Page` behaviour: add beside it (note what you need). | ask #32 |
| S203 | One class per file; `Thing.View = ...` after the class. | ask #32 |
| S204 | Sonnet 5.5; `node Server/usage-now.mjs` before spawns; Haiku only for reading under 60k tokens; no OpenRouter. | ask #35 |
| S205 | One-sentence chat replies; `STATE.md` here; land with `finish-task`. | ask #35 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #1 | new words | "using", "s123", "s124", "s125", "s126", "s128", "s129" — not in the transcript at all |
| #2 | new words | "s130", "s131" — not in the transcript at all |
| #3 | new words | "s132", "s133" — not in the transcript at all |
| #4 | strength word | uses "only", not found in the cited sentence(s) |
| #4 | new words | "s134", "s135", "s136", "s137", "s127", "s138" — not in the transcript at all |
| #5 | new words | "those", "across", "s139", "s140", "s141", "s142", "s143", "s151", "s144" — not in the transcript at all |
| #6 | strength word | uses "only", not found in the cited sentence(s) |
| #6 | new words | "such", "rather", "s150", "s149", "s158", "s152", "s146", "s153", "s154", "s147", "s155", "s156" — not in the transcript at all |
| #7 | thin citation | cites S145 but shares no wording with it — the citation may not reflect what S145 actually says |
| #7 | new words | "s148", "s157", "s159", "s145" — not in the transcript at all |
| #8 | new words | "taking", "down", "s104", "s101", "s102", "s105", "s103", "s106", "s107", "s108" — not in the transcript at all |
| #9 | new words | "repeat", "s109", "s110", "s111", "s112", "s113", "s114", "s115", "s116" — not in the transcript at all |
| #10 | new words | "s117", "s118", "s119", "s120", "s121", "s122" — not in the transcript at all |
| #11 | thin citation | cites S1 but shares no wording with it — the citation may not reflect what S1 actually says |
| #11 | new words | "gives", "carries" — not in the transcript at all |
| #13 | new words | "numbers" — not in the transcript at all |
| #15 | thin citation | cites S18 but shares no wording with it — the citation may not reflect what S18 actually says |
| #15 | new words | "most" — not in the transcript at all |
| #16 | new words | "start" — not in the transcript at all |
| #19 | new words | "minutes" — not in the transcript at all |
| #21 | new words | "inside", "s100" — not in the transcript at all |
| #22 | new words | "times", "start" — not in the transcript at all |
| #23 | new words | "times" — not in the transcript at all |
| #25 | new words | "right" — not in the transcript at all |
| #26 | new words | "rather" — not in the transcript at all |
| #28 | new words | "meet", "rather" — not in the transcript at all |
| #29 | new words | "inside" — not in the transcript at all |
| #30 | new words | "idea", "four", "s185", "s186", "s187", "s188", "s189", "s190", "s191", "s192" — not in the transcript at all |
| #31 | new words | "s193" — not in the transcript at all |
| #32 | new words | "s194", "s203", "s202" — not in the transcript at all |
| #33 | new words | "s195", "s196", "s197" — not in the transcript at all |
| #34 | new words | "s198", "s201" — not in the transcript at all |
| #35 | new words | "inside", "s199", "s200", "s204", "s205" — not in the transcript at all |
| #36 | new words | "losing", "concern", "pays", "s160", "s161", "s162", "s163", "s164", "s165", "s166", "s167" — not in the transcript at all |
| #37 | new words | "gets", "s168", "s169", "s170" — not in the transcript at all |
| #38 | new words | "s171", "s172", "s173" — not in the transcript at all |
| #39 | new words | "these", "s178" — not in the transcript at all |
| #40 | new words | "s174", "s175" — not in the transcript at all |
| #41 | thin citation | cites S181 but shares no wording with it — the citation may not reflect what S181 actually says |
| #41 | new words | "s176", "s177", "s179", "s180", "s181", "s182", "s183", "s184" — not in the transcript at all |
