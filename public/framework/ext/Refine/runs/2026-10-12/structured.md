# Overnight briefs: feedback council, live site, Page class, Sessions, Dictate, Inbox, CLAUDE.md

## 🗳️ Feedback council: five checkers vote on every ask
- ⬜ Five checkers read the raw words in `words.jsonl` and every open ask not yet `done`, then give each ask one verdict: `done`, `partly`, `not done` or `done-but-wrong` [S1, S2, S3, S4, S5, S6]
  - Each verdict carries one line of evidence (URL, screenshot path, file:line) and, when not done, the smallest fix [S7]
  - Prove before calling anything missing: a false "not done" is the common failure, so search `git log`, grep, `.claude/skills/` and CLAUDE.md first [S8, S9]
- ⬜ Checks run on the live site at `http://monorepo.localhost`, never `http://localhost/` [S10]
  - Visual asks use headless Playwright at 1920 and 3440, never the owner's tabs [S11]
  - Time the Live card load [S12]; measure scroll with real overflow numbers on the named URLs [S13]
  - No window may pop up: `windowsHide: true`, `-WindowStyle Hidden` [S14]
- ⬜ Add up to 8 extra asks from `words.jsonl` that the current list misses, each with the same verdict [S17]
- ⬜ Edit no repo file; scratch stays in the scratchpad; screenshots only as evidence, 12 at most [S15, S16]
- ⬜ Output is one `votes/<name>.json` per checker, then a one-line reply "done" [S18, S19, S20]
  - Budget about $2 each: be quick, do not over-explore [S22]
  - Load the `minion` skill only if it does not conflict with editing nothing but votes and shots [S23]
  - Never write the owner's name in any file [S21]

---

## 🚨 Live page error and the merge guard
- ⬜ A page load error hit the owner mid-browse on `/framework/ai/sessions/`, and UI lands without screenshots [S123, S124, S125]
  - Owner's words: "We shouldn't be causing errors on the live site while I'm browsing it… I thought we weren't doing that anymore." [S126]
- ⬜ Find the cause: what reloaded and what failed around 19:00–19:15Z, from `git log --since`, the dev server and Servex logs, and the hold log [S128]
  - Name the commit that did it, and why the guard (`Server/hold.mjs`, worktree → `check_page` → merge) did not stop it [S129]
- ⬜ Close the gap in code, not only in a rule: merge holds reloads and boots the page headless before release; a page that fails after a reload keeps the old one with a one-line notice [S130]
  - Smallest fix that would have prevented this one; record the alternative [S131]
- ⬜ Screenshot gate: UI agents keep landing layouts nobody looked at (cut-off columns, crammed tables) [S132]
  - Check whether `merge.mjs` really requires the 400/1200/1920/3440 shots; if it can be skipped, make it require them in the task dir [S133]
- ⬜ One line in the relevant doc (`Server/doc/watch.md`), then commit, merge and land [S134, S135]
- ⬜ Sonnet 5.5, in a worktree; one Servex restart only if needed, proven on a private port [S136, S137]
- Done when each point is ticked with proof; finish with `STATE.md` here, one-sentence chat replies, landed via `finish-task` [S127, S138]

---

## 🗺️ Page class split plan
- Owner's question: "What exactly is 2,000 lines in the Page class? That might be a mistake." [S139, S140, S141]
- ✅ Measured: `core/Page/Page.class.js` is 2,270 lines: 926 comment (40%), 317 blank, 1,027 code, 151 methods [S142]
- ✅ Biggest areas by section markers: the jsonl replay and three file steps (~72–500), the six words, roles, link opening (~907), rendering (~1238), related aside (~1474), columns, the Finder shape (~1526–1973), preferences (~1973) [S143]
- ⬜ Write the plan only, do not move code; `Page.class.js` stays unchanged, `git diff` empty for it [S150, S149, S158]
- ⬜ A script measures each section and method (code vs comment lines) and lists which files call each group [S151]
- ⬜ `core/Page/doc/split-plan.md` fits one screen: for each group, keep in Page, move to a composed helper (one file named for it, e.g. `Page.Columns`, `Page.Links`, `Page.Jsonl`, attached as statics or held by reference), or move to an extension [S152]
  - Show the target as a class tree in code, with a target size for `Page.class.js` (for example, under 600 lines), aiming for a file a reader can scan [S146, S153, S154]
  - Each move names its risk (callers) and its order, lowest risk first [S147, S155]
  - Flag comments that are history rather than explanation as candidates to move to `doc/` [S156]
- ⬜ Link the plan from the core/Page readme [S148, S157]
- ⬜ Sonnet 5.5; Haiku under 60k tokens for counting; commit; one-sentence replies; land with `finish-task` [S159]
- Done when the measuring script's output answers the owner's question and each item is ticked with proof [S144, S145]

---

## ✂️ Page class split, step 7: jsonl
- ✅ Steps 1–6 landed tonight: 2,270 lines down to 1,089, nothing broke [S104]
- ⬜ Step 7, the last move, is the jsonl replay and file steps (about 470 lines), the core path of every page, so it is the careful one [S101, S102, S105]
  - Plan: `core/Page/doc/split-plan.md`, step 7 [S103]
- ⬜ Move the replay and file steps into their own class file, `Page.Jsonl` (or the name the plan settles), held by the page or attached as a static so a subclass can swap it. Do it [S106, S107]
- ⬜ `page.set()`, `Page.Reader` and every public name keep their exact behaviour; replay order is unchanged [S108]
- ⬜ Record a baseline first: for 40 pages (core, ai, sessions incl. a live session page, imagine/paging, markdown, a parts page, a page-tool-built page), save `page_read` state and a 1200 screenshot; after the move, the same, diffed [S109, S110, S111]
  - Any difference is a failure [S112]
  - Prove the page tools still stream: `page_set` / `page_add` on a scratch page show in a watching headless browser within a second [S113]
- Done when 0 state diffs, 0 new console errors, screenshots match at 400/1200/1920/3440, and smoke is clean [S114, S115, S116]
- ⬜ Record `split-measure.mjs` before and after in `STATE.md`, tick step 7, and say in `split-plan.md` that the split is complete [S117]
- ⬜ Merge with live reloads held; if a diff cannot be fixed, do not merge: leave the branch and write why in `STATE.md` [S118, S119]
- ⬜ Sonnet 5.5, high, in a worktree; land with `finish-task` [S120, S121, S122]

---

## 🧩 Page slice: a page as a list of views
- Why: page content should not be only a markdown string; a page's views are a list in its own `page.jsonl`, rendered in a loop, and editing the list persists by itself [S185, S186, S187]
- ⬜ Templates (toolbars, headers, sidebars) are saved as JSONL view data [S188]
- ⬜ Not yet proven, so build the smallest slice that proves it [S189, S190]
  - ⬜ Inventory what exists first, cheaply: `core/Page` (`page.jsonl`, `live()` tail, `thing.page`/`page.thing` composition), `ext/Refine`, the session viewers (`ai/AISession/*`), and streaming lists [S191]
  - Read the four named docs and the task-system design folder first [S192]
- ⬜ Design the class architecture first: a short page naming each class, its job, what extends or composes what, and the orchestrator, shown where the owner can see it [S193]
- ⬜ Build the slice: one page whose body is a list of views in its `page.jsonl` (a snapshot first line allowed, then deltas), one rendering class, at least three view kinds (heading, text/markdown, card), add/move/remove through a tool that appends deltas [S194]
  - One class per file; `Thing.View = ...` after the class [S203]
  - Do not change existing `core/Page` behaviour: add beside it and note what is needed [S202]
- ⬜ Proof: a reload and a second tab show the same state live; smoke-test and layout-check it [S195, S196]
- ⬜ Use it once for real: render one existing small readme-like page through it [S197]
- ⬜ Record decisions and the alternative (`page.js` as today vs JSONL views; a snapshot line vs all deltas) in the module's `doc/`, linked from its readme and the AI/page indexes [S198]
- ⬜ Everything is linked from the site [S201]
- Fences: worktree, commit each working step after a smoke test, review the diff, merge via `Server/merge.mjs` [S199, S200]
- Sonnet 5.5; `node Server/usage-now.mjs` before spawns; Haiku only for reading under 60k; no OpenRouter; one-sentence replies, `STATE.md`, `finish-task` [S204, S205]

---

## 🎙️ Voice to session page, in real time
- ⬜ Goal: when the owner speaks, they watch their words turn into cards on the session's own page, live, from the phone; they test it tomorrow [S24, S25, S26, S27]
- ⬜ Five stages, each shown live on the page as it happens [S28]
  - Raw: Whisper's text, as spoken [S29]
  - Clean: the same text, tidied [S30]
  - Structure: the clean text split into its points [S31]
  - Refined: the finished prompt [S32]
  - Cards: the refining model writes them onto the page with the page tools [S33]
- ⬜ Which page: every session has one at `/framework/ai/sessions/<id>/`; by default an agent writes to its own page; the same works whether the owner dictates in the browser or the app [S34, S35, S36]
- Owner's words: "That's the kind of feedback loop that I'd like." [S37]
- ✅ Exists, so read it first and do not rebuild: `refine-dictate-ui` (VoiceStrip, phase-2 report, mobile-socket answer), `ux/Dictate/doc/voice-architecture.md`, `ext/Refine`, the Whisper server under Servex, and the 10 transcription `now` loose ends from the task audit (Haiku-labelled, about 58% reliable) [S38]
- ✅ Page tools are in `Servex/agents/page_tools.js`; the AI page model belongs to `@mastermind-page-ai-api`, so use its tools and ask it rather than fork them [S39, S40]
- ⬜ Reproduce first on current `michael/dev`: dictate a recorded audio file headless, and record in `STATE.md` which stage breaks or lags, with timings [S42]
- ⬜ Done when, each ticked with proof [S41]
  - Whisper stays up through a reload and a phone reconnect; a crash restarts by itself (Servex) and the page says so in one plain line [S43]
  - Each stage streams live (about 100 ms, a stream, not a poll), one class per stage with its own view, written by page-tool deltas [S44]
  - The same flow works at 400 px from `10.0.0.135`, proven headless at mobile width [S45]
  - Tomorrow's test: `ux/Dictate/doc/try-it.md` (open this URL on the phone, press this, expect that), linked from the Dictate readme, plus an `owner_note` (kind `needs-you`) that points to it [S46]
  - Close the transcription `now` loose ends this resolves, each checked rather than trusted from the Haiku label [S47]
  - Layout-check at 400/1200/1920/3440; smoke clean; commit each step; merge [S48]
- ⬜ Sonnet 5.5 for the agent; Haiku under 60k for reading; worktree; one Servex restart, batched and proven on a private port [S49, S50]
- ⬜ One-sentence chat replies, `STATE.md` here, land with `finish-task` [S51]

---

## 📥 AI Inbox and dashboard cards
- ⬜ Close the open asks in cluster `inbox-dashboard-cards` (#3, asked 19 times) in `ai/doc/asks.md` [S52, S53, S54]
  - Start from that entry's "Open" line and its source links [S55]
  - Labels came from docs, not every line of code, so check each against the code before building [S56]
- ⬜ Done when each open point is done with a commit, or written up in `STATE.md` with the reason and the smallest next step [S57, S58]
  - Proof per point: a headless check, a screenshot, or command output [S59]
- ⬜ Layout-check 400/1200/1920/3440 for any page change; smoke clean [S60]
- ⬜ Update the cluster's entry in `ai/doc/asks.md` as done, partly or open, with commit links [S61]
- ⬜ Never destructive: move aside, never delete [S62]
- ⬜ Sonnet 5.5, medium; worktree; commit each step; merge; one-sentence replies, `STATE.md`, `finish-task` [S63, S64, S65]

---

## 🗂️ Sessions system
- ⬜ Close the open asks in cluster `sessions-system` (#4, asked 16 times) in `ai/doc/asks.md` [S66, S67, S68]
  - Read the entry and its source links first; its "Open" line is the work [S69]
  - Labels came from docs, not every line of code, so check each against the code before building [S70]
- ⬜ Done when each open point is done with a commit, or written up in `STATE.md` with the reason and the smallest next step [S71, S72]
  - Proof per point: a headless check, a screenshot, or command output [S73]
- ⬜ Layout-check 400/1200/1920/3440 for any page change; smoke clean [S74]
- ⬜ Update the cluster's entry in `ai/doc/asks.md` as done, partly or open, with commit links [S75]
- ⬜ Never destructive: move aside, never delete [S76]
- ⬜ Sonnet 5.5, medium; worktree; commit each step; merge; one-sentence replies, `STATE.md`, `finish-task` [S77, S78, S79]

---

## 🧹 Session housekeeping: commit rule, log sweeper, OpenRouter gap
- Task brief: a commit rule, a machine-log sweeper, and the OpenRouter gap [S80, S81]
- ⬜ Read `public/framework/ai/handover.md`, `ai/sessions/readme.md`, `ai/sessions/doc/` and the tasks-into-sessions `STATE.md` first [S82]
- ⬜ Tasks were moved into session folders: 994 had no session and stay, 12 did not land; check what landed and what is left, then do it [S83, S84]
- ⬜ Working-tree hygiene: `git status` shows dozens of machine-written files (`ai/sessions/2026/**/index.json`, `*/files.jsonl`, `public/ai/*.jsonl`, task `page.jsonl`/`task.jsonl`) [S85]
  - For each class of file, decide: commit (versioned log), gitignore (cache), or regenerate [S86]
  - Write the rule in `ai/sessions/doc/` and the readme, then apply it; `.gitignore` edits and commits are fine, never delete data [S87]
- ⬜ Servex sweeper: a small class in its own file that commits machine-written logs in batches on a timer (e.g. every 30 min when quiet), only allowlisted paths, attributed `servex: log sweep` [S88]
  - Idempotent; never touches code files or other agents' staged work; has a dry-run mode and logs what it did [S89]
  - Put it under `Servex/` after reading `Servex/readme.md`; do not change `Servex/Pool.js` [S90]
- ⬜ OpenRouter gap: the account shows more dollars than `openrouter.jsonl` explains (handover item 1); the cause is open [S91]
  - ⬜ With a script, reconcile by day and model and find the missing calls (other keys? Servex-external callers? echo?); write the finding in `ai/sessions/doc/` [S92]
  - ⬜ The Sessions page shows "unattributed OpenRouter $", so the gap is visible, not hidden [S93]
- ⬜ Verify the tasks-into-sessions move end to end with its verify script; list anything unreachable from the site and link it [S94]
- Fences: never destructive; worktree for code; commit each working step after a smoke test; merge via `Server/merge.mjs` [S95, S96, S97]
- ⬜ A `Servex/` change needs a restart: batch it and prove it boots [S98]
- ⬜ Sonnet 5.5; Haiku under 60k tokens for reading; `node Server/usage-now.mjs` before spawns; no OpenRouter calls; one-sentence replies, `STATE.md`, `finish-task` [S99, S100]

---

## 📜 CLAUDE.md consolidation
- Task brief, non-destructive. The owner's concern: CLAUDE.md is about 4,100 words (about 5,700 tokens every session pays), and rules added one correction at a time may conflict or be too strong [S160, S161, S162]
- ⬜ Consolidate for clarity, but lose nothing: a tip moves to where it belongs (module readme, `doc/`, skill), never just deleted [S163]
- ⬜ Make the process safe by construction, since the owner cannot judge each line; do not wait on the owner, who may not read chat [S164, S165]
- ⬜ Inputs: the 1,172-word draft (never applied) and the skill-usage audit recommendation; then do it [S166, S167]
- ⬜ Sentence manifest, by script: every sentence gets an id and one row: keep, move (with a named file and anchor), merge (into which kept rule), or retire (only for a system that no longer exists, and it still goes to an archive file) [S168]
  - Every sentence appears in exactly one row [S169]
  - ⬜ A check script proves nothing is dropped: each sentence is in the new CLAUDE.md, its destination file, or `ai/doc/claude-md-archive.md` [S170]
- ⬜ Strength words: keep the owner's own strength ("always" only for what has broken things, else "usually" or "prefer"); never strengthen a rule while moving it [S171, S172]
- ⬜ Owner quotes and dates stay with their rule wherever it goes [S173]
- ⬜ Review page for the owner, one screen, linked from the AI board as a Note card: what was cut, short before/after blocks grouped by destination, word counts; it does not block [S174, S175]
- ⬜ Apply in a worktree: new CLAUDE.md, moved text appended to its destinations, the archive file, the manifest; commit, review the diff yourself, merge [S176, S177]
- ⬜ Recent owner rules (2026-10-07 to 10-12: "Chat is the headline", "How to respond", "Mind the token burn", "Never destructive", "Stream, don't poll", "Haiku stays under 100k", "Commit after every working step", the class rules) stay in CLAUDE.md, tightened but not weakened [S178]
- ⬜ Reversible: the old file is in git and the manifest maps every sentence; write `STATE.md` and land with `finish-task` [S179, S180]
- Fences; a fresh Sonnet 5.5 reviewer reads the manifest and the new file once before merge and flags any rule whose meaning changed; no OpenRouter; one-sentence chat replies [S181, S182, S183, S184]
