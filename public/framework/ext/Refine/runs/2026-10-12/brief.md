# 🌙 Overnight asks for the mastermind

## 🚨 Live site error and the merge guard

1. Find the cause of the page load error that hit the owner mid-browse on `/framework/ai/sessions/`.
   - ⬜ Look at what reloaded and what failed around 19:00–19:15Z, using `git log --since`, the dev server and Servex logs, and the hold log.
   - ⬜ Name the commit that did it, and why the guard (`Server/hold.mjs`, worktree → `check_page` → merge) did not stop it.
   - Owner's words: "We shouldn't be causing errors on the live site while I'm browsing it… I thought we weren't doing that anymore." [S123, S124, S125, S126, S128, S129]

2. Close the gap in code, not only in a rule.
   - ⬜ Merge holds reloads and boots the page headless before release.
   - ⬜ A page that fails after a reload keeps the old one, with a one-line notice.
   - ⬜ Make the smallest fix that would have prevented this one, and record the alternative. [S130, S131]

3. Add a screenshot gate, because UI agents keep landing layouts nobody looked at (cut-off columns, crammed tables).
   - ⬜ Check whether `merge.mjs` really requires the 400/1200/1920/3440 shots.
   - ⬜ If it can be skipped, make it require them in the task dir. [S132, S133]

4. Write one line in the relevant doc (`Server/doc/watch.md`), then commit, merge and land.
   - ⬜ Work in a worktree on Sonnet 5.5. Restart Servex once, only if needed, and prove it on a private port.
   - Done when each point is ticked with proof. Finish with `STATE.md` here, one-sentence chat replies, and landing via `finish-task`. [S134, S135, S136, S137, S127, S138]

## 🗺️ Page class split

5. Answer the owner's question, "What exactly is 2,000 lines in the Page class? That might be a mistake."
   - ✅ Measured: `core/Page/Page.class.js` is 2,270 lines. Of those, 926 are comment (40%), 317 blank and 1,027 code, across 151 methods.
   - ✅ Biggest areas by section markers: the jsonl replay and three file steps, the six words, roles, link opening, rendering, the related aside, columns, the Finder shape, and preferences.
   - ⬜ Make a script measure each section and method (code vs comment lines) and list which files call each group.
   - Done when the script's output answers the question. [S139, S140, S141, S142, S143, S151, S144]

6. Write the split plan only, and do not move code.
   - ⬜ `Page.class.js` stays unchanged, so `git diff` is empty for it.
   - ⬜ `core/Page/doc/split-plan.md` fits one screen. For each group it says: keep in Page, move to a composed helper (one file named for it, held by reference or attached as a static), or move to an extension.
   - The owner suggests helper names such as `Page.Columns`, `Page.Links` and `Page.Jsonl`.
   - ⬜ Show the target as a class tree in code, with a target size for `Page.class.js` that a reader can scan. The owner suggests under 600 lines.
   - ⬜ Each move names its risk (callers) and its order, lowest risk first.
   - ⬜ Flag comments that are history rather than explanation as candidates to move to `doc/`. [S150, S149, S158, S152, S146, S153, S154, S147, S155, S156]

7. Link the plan from the core/Page readme.
   - ⬜ Use Sonnet 5.5, with Haiku under 60k tokens for counting. Commit, reply in one sentence, and land with `finish-task`.
   - Done when each item is ticked with proof. [S148, S157, S159, S145]

8. Page class split, step 7: move the jsonl replay and file steps (about 470 lines) into their own class file.
   - ✅ Steps 1–6 landed tonight, taking 2,270 lines down to 1,089 with nothing broken.
   - ⬜ This is the last move and the core path of every page, so it is the careful one. The plan is in `core/Page/doc/split-plan.md`, step 7.
   - ⬜ Put the code in `Page.Jsonl` (or the name the plan settles), held by the page or attached as a static so a subclass can swap it.
   - ⬜ `page.set()`, `Page.Reader` and every public name keep their exact behaviour, and replay order is unchanged. [S104, S101, S102, S105, S103, S106, S107, S108]

9. Prove step 7 changes nothing, with a baseline recorded first.
   - ⬜ Record a baseline for 40 pages: core, ai, sessions (including a live session page), imagine/paging, markdown, a parts page, and a page-tool-built page. For each, save `page_read` state and a 1200 screenshot, then repeat after the move and diff. Any difference is a failure.
   - ⬜ Prove the page tools still stream: `page_set` / `page_add` on a scratch page show in a watching headless browser within a second.
   - Done when there are 0 state diffs, 0 new console errors, matching screenshots at 400/1200/1920/3440, and a clean smoke test. [S109, S110, S111, S112, S113, S114, S115, S116]

10. Close out step 7.
    - ⬜ Record `split-measure.mjs` before and after in `STATE.md`, tick step 7, and say in `split-plan.md` that the split is complete.
    - ⬜ Merge with live reloads held. If a diff cannot be fixed, do not merge: leave the branch and write why in `STATE.md`.
    - ⬜ Use Sonnet 5.5 on high, in a worktree, and land with `finish-task`. [S117, S118, S119, S120, S121, S122]

## 🗳️ Feedback council

11. Run five checkers that read the raw words in `words.jsonl` and every open ask not yet `done`.
    - ⬜ Each gives every ask one verdict: `done`, `partly`, `not done` or `done-but-wrong`.
    - ⬜ Each verdict carries one line of evidence (URL, screenshot path, file:line) and, when not done, the smallest fix. [S1, S2, S3, S4, S5, S6, S7]

12. Prove before calling anything missing, because a false "not done" is the common failure.
    - ⬜ Search `git log`, grep, `.claude/skills/` and CLAUDE.md first. [S8, S9]

13. Run the checks on the live site at `http://monorepo.localhost`, never `http://localhost/`.
    - ⬜ Visual asks use headless Playwright at 1920 and 3440, never the owner's tabs.
    - ⬜ Time the Live card load, and measure scroll with real overflow numbers on the named URLs.
    - ⬜ No window may pop up: use `windowsHide: true` and `-WindowStyle Hidden`. [S10, S11, S12, S13, S14]

14. Add up to 8 extra asks from `words.jsonl` that the current list misses, each with the same verdict. [S17]

15. Keep the council read-only and cheap.
    - ⬜ Edit no repo file. Scratch stays in the scratchpad, and screenshots are evidence only, 12 at most.
    - ⬜ Output one `votes/<name>.json` per checker, then reply with one line, "done".
    - ⬜ Budget about $2 each: be quick, do not over-explore.
    - ⬜ Load the `minion` skill only if it does not conflict with editing nothing but votes and shots.
    - ⬜ Never write the owner's name in any file. [S15, S16, S18, S19, S20, S22, S23, S21]

## 🧹 Session housekeeping

16. Start the housekeeping task (a commit rule, a machine-log sweeper, and the OpenRouter gap) by reading first.
    - ⬜ Read `public/framework/ai/handover.md`, `ai/sessions/readme.md`, `ai/sessions/doc/` and the tasks-into-sessions `STATE.md`. [S80, S81, S82]

17. Check the tasks-into-sessions move end to end.
    - Tasks were moved into session folders: 994 had no session and stay, and 12 did not land.
    - ⬜ Check what landed and what is left, then do it.
    - ⬜ Run its verify script, and list anything unreachable from the site and link it. [S83, S84, S94]

18. Settle working-tree hygiene, since `git status` shows dozens of machine-written files.
    - Examples are `ai/sessions/2026/**/index.json`, `*/files.jsonl`, `public/ai/*.jsonl` and task `page.jsonl`/`task.jsonl`.
    - ⬜ For each class of file, decide: commit (versioned log), gitignore (cache), or regenerate.
    - ⬜ Write the rule in `ai/sessions/doc/` and the readme, then apply it. `.gitignore` edits and commits are fine, and nothing is ever deleted. [S85, S86, S87]

19. Build a Servex sweeper: a small class in its own file that commits machine-written logs in batches on a timer.
    - The owner suggests every 30 minutes when quiet.
    - ⬜ It touches only allowlisted paths, is attributed `servex: log sweep`, and is idempotent.
    - ⬜ It never touches code files or other agents' staged work, and it has a dry-run mode and logs what it did.
    - ⬜ Put it under `Servex/` after reading `Servex/readme.md`. Do not change `Servex/Pool.js`.
    - ⬜ A `Servex/` change needs a restart: batch it and prove it boots. [S88, S89, S90, S98]

20. Close the OpenRouter gap: the account shows more dollars than `openrouter.jsonl` explains (handover item 1), and the cause is open.
    - ⬜ With a script, reconcile by day and model and find the missing calls (other keys? Servex-external callers? echo?). Write the finding in `ai/sessions/doc/`.
    - ⬜ The Sessions page shows "unattributed OpenRouter $", so the gap is visible, not hidden. [S91, S92, S93]

21. Keep the housekeeping inside the fences.
    - ⬜ Never destructive. Use a worktree for code, and commit each working step after a smoke test.
    - ⬜ Merge via `Server/merge.mjs`.
    - ⬜ Use Sonnet 5.5, with Haiku under 60k tokens for reading. Run `node Server/usage-now.mjs` before spawns, make no OpenRouter calls, reply in one sentence, and finish with `STATE.md` and `finish-task`. [S95, S96, S97, S99, S100]

## 📥 AI Inbox and 🗂️ Sessions system

22. Close the open asks in cluster `inbox-dashboard-cards` (#3, asked 19 times) in `ai/doc/asks.md`.
    - ⬜ Start from the entry's "Open" line and its source links.
    - ⬜ Labels came from docs, not every line of code, so check each against the code before building.
    - ⬜ Done when each open point is done with a commit, or written up in `STATE.md` with the reason and the smallest next step. Proof is a headless check, a screenshot, or command output.
    - ⬜ Layout-check 400/1200/1920/3440 for any page change, with a clean smoke test.
    - ⬜ Update the cluster's entry in `ai/doc/asks.md` as done, partly or open, with commit links.
    - ⬜ Never destructive: move aside, never delete.
    - ⬜ Use Sonnet 5.5 on medium, in a worktree. Commit each step, merge, reply in one sentence, and finish with `STATE.md` and `finish-task`. [S52, S53, S54, S55, S56, S57, S58, S59, S60, S61, S62, S63, S64, S65]

23. Close the open asks in cluster `sessions-system` (#4, asked 16 times) in `ai/doc/asks.md`.
    - ⬜ Read the entry and its source links first. Its "Open" line is the work.
    - ⬜ Labels came from docs, not every line of code, so check each against the code before building.
    - ⬜ Done when each open point is done with a commit, or written up in `STATE.md` with the reason and the smallest next step. Proof is a headless check, a screenshot, or command output.
    - ⬜ Layout-check 400/1200/1920/3440 for any page change, with a clean smoke test.
    - ⬜ Update the cluster's entry in `ai/doc/asks.md` as done, partly or open, with commit links.
    - ⬜ Never destructive: move aside, never delete.
    - ⬜ Use Sonnet 5.5 on medium, in a worktree. Commit each step, merge, reply in one sentence, and finish with `STATE.md` and `finish-task`. [S66, S67, S68, S69, S70, S71, S72, S73, S74, S75, S76, S77, S78, S79]

## 🎙️ Voice to session page, in real time

24. Build the goal: when the owner speaks, they watch their words turn into cards on the session's own page, live, from the phone, and test it tomorrow.
    - ⬜ Show five stages live on the page as they happen:
      - Raw: Whisper's text, as spoken.
      - Clean: the same text, tidied.
      - Structure: the clean text split into its points.
      - Refined: the finished prompt.
      - Cards: the refining model writes them onto the page with the page tools. [S24, S25, S26, S27, S28, S29, S30, S31, S32, S33]

25. Write to the right page.
    - ⬜ Every session has one at `/framework/ai/sessions/<id>/`, and by default an agent writes to its own page.
    - ⬜ The same works whether the owner dictates in the browser or the app.
    - Owner's words: "That's the kind of feedback loop that I'd like." [S34, S35, S36, S37]

26. Read what exists first and do not rebuild it.
    - ✅ Read `refine-dictate-ui` (VoiceStrip, phase-2 report, mobile-socket answer), `ux/Dictate/doc/voice-architecture.md`, `ext/Refine`, the Whisper server under Servex, and the 10 transcription `now` loose ends from the task audit (Haiku-labelled, about 58% reliable).
    - ✅ Page tools are in `Servex/agents/page_tools.js`. The AI page model belongs to `@mastermind-page-ai-api`, so use its tools and ask it rather than fork them. [S38, S39, S40]

27. Reproduce first on current `michael/dev`.
    - ⬜ Dictate a recorded audio file headless, and record in `STATE.md` which stage breaks or lags, with timings. [S42]

28. Meet the done-when list, each item ticked with proof.
    - ⬜ Whisper stays up through a reload and a phone reconnect. A crash restarts by itself (Servex) and the page says so in one plain line.
    - ⬜ Each stage streams live (about 100 ms, a stream, not a poll), with one class per stage and its own view, written by page-tool deltas.
    - ⬜ The same flow works at 400 px from `10.0.0.135`, proven headless at mobile width.
    - ⬜ Tomorrow's test is `ux/Dictate/doc/try-it.md` (open this URL on the phone, press this, expect that), linked from the Dictate readme. Add an `owner_note` (kind `needs-you`) that points to it.
    - ⬜ Close the transcription `now` loose ends this resolves, each checked rather than trusted from the Haiku label.
    - ⬜ Layout-check at 400/1200/1920/3440, with a clean smoke test. Commit each step, then merge. [S41, S43, S44, S45, S46, S47, S48]

29. Keep the voice work inside the fences.
    - ⬜ Use Sonnet 5.5 for the agent and Haiku under 60k for reading, in a worktree.
    - ⬜ Restart Servex once, batched and proven on a private port.
    - ⬜ Reply in one sentence, keep `STATE.md` here, and land with `finish-task`. [S49, S50, S51]

## 🧩 Page slice: a page as a list of views

30. Prove the idea that a page's body is a list of views in its own `page.jsonl`, rendered in a loop, with edits persisting by themselves.
    - ⬜ Save templates (toolbars, headers, sidebars) as JSONL view data.
    - This is not yet proven, so build the smallest slice that proves it.
    - ⬜ Inventory what exists first, cheaply: `core/Page` (`page.jsonl`, `live()` tail, `thing.page`/`page.thing` composition), `ext/Refine`, the session viewers (`ai/AISession/*`), and streaming lists. Read the four named docs and the task-system design folder first. [S185, S186, S187, S188, S189, S190, S191, S192]

31. Design the class architecture before building.
    - ⬜ Write a short page naming each class, its job, what extends or composes what, and the orchestrator, shown where the owner can see it. [S193]

32. Build the slice.
    - ⬜ One page whose body is a list of views in its `page.jsonl` (a snapshot first line allowed, then deltas), and one rendering class.
    - ⬜ At least three view kinds: heading, text/markdown, card.
    - ⬜ Add, move and remove go through a tool that appends deltas.
    - ⬜ One class per file, with `Thing.View = ...` after the class.
    - ⬜ Do not change existing `core/Page` behaviour: add beside it and note what is needed. [S194, S203, S202]

33. Prove it and use it once for real.
    - ⬜ A reload and a second tab show the same state live. Smoke-test and layout-check it.
    - ⬜ Render one existing small readme-like page through it. [S195, S196, S197]

34. Record decisions and link everything from the site.
    - ⬜ Record the decisions and the alternative (`page.js` as today vs JSONL views; a snapshot line vs all deltas) in the module's `doc/`, linked from its readme and the AI/page indexes. [S198, S201]

35. Keep the slice inside the fences.
    - ⬜ Use a worktree, commit each working step after a smoke test, review the diff, and merge via `Server/merge.mjs`.
    - ⬜ Use Sonnet 5.5 and run `node Server/usage-now.mjs` before spawns. Haiku is only for reading under 60k, with no OpenRouter.
    - ⬜ Reply in one sentence, keep `STATE.md`, and land with `finish-task`. [S199, S200, S204, S205]

## 📜 CLAUDE.md consolidation

36. Consolidate CLAUDE.md for clarity without losing anything.
    - The concern: it is about 4,100 words (about 5,700 tokens every session pays), and rules added one correction at a time may conflict or be too strong.
    - ⬜ A tip moves to where it belongs (module readme, `doc/`, skill), never just deleted.
    - ⬜ Make the process safe by construction, since the owner cannot judge each line. Do not wait on the owner, who may not read chat.
    - ⬜ Inputs are the 1,172-word draft (never applied) and the skill-usage audit recommendation. Then do it. [S160, S161, S162, S163, S164, S165, S166, S167]

37. Build a sentence manifest by script and prove nothing is dropped.
    - ⬜ Every sentence gets an id and exactly one row: keep, move (with a named file and anchor), merge (into which kept rule), or retire. Retire is only for a system that no longer exists, and it still goes to an archive file.
    - ⬜ A check script proves each sentence is in the new CLAUDE.md, its destination file, or `ai/doc/claude-md-archive.md`. [S168, S169, S170]

38. Keep the owner's strength and voice.
    - ⬜ Use "always" only for what has broken things, else "usually" or "prefer". Never strengthen a rule while moving it.
    - ⬜ Owner quotes and dates stay with their rule wherever it goes. [S171, S172, S173]

39. Keep the recent owner rules (2026-10-07 to 10-12) in CLAUDE.md, tightened but not weakened.
    - ⬜ These are "Chat is the headline", "How to respond", "Mind the token burn", "Never destructive", "Stream, don't poll", "Haiku stays under 100k", "Commit after every working step", and the class rules. [S178]

40. Write a review page for the owner.
    - ⬜ One screen, linked from the AI board as a Note card, and it does not block.
    - ⬜ It shows what was cut, short before/after blocks grouped by destination, and word counts. [S174, S175]

41. Apply it safely and land.
    - ⬜ Apply in a worktree: the new CLAUDE.md, moved text appended to its destinations, the archive file, and the manifest. Commit, review the diff yourself, then merge.
    - ⬜ A fresh Sonnet 5.5 reviewer reads the manifest and the new file once before merge and flags any rule whose meaning changed.
    - ⬜ It is reversible: the old file is in git and the manifest maps every sentence. Write `STATE.md` and land with `finish-task`.
    - ⬜ Make no OpenRouter calls, and reply in one sentence. [S176, S177, S179, S180, S181, S182, S183, S184]
