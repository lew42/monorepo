S1. [sessions/2026/10/12/feedback-council/requirements.md]
S2. Feedback council: brief for each of the five checkers.
S3. Card dir (read the raw words there): `public/framework/ai/council/` (and the current run directory).
S4. Words: `words.jsonl` in the active run directory.
S5. Asks to check: new asks extracted from `words.jsonl` plus every open ask in `public/framework/ai/council/asks.jsonl` whose latest verdict isn't `done`.
S6. Your job.
S7. For EVERY ask, LOOK at the real result and give one verdict: `done` / `partly` / `not done` / `done-but-wrong`, one line of evidence (URL, screenshot path, file:line), and for anything not `done` the smallest fix.
S8. Prove before you call something missing.
S9. A false "not done" is the common failure: search the repo (`git log`, grep, the skills in `.claude/skills/`, CLAUDE.md) before writing it.
S10. The live site: http://monorepo.localhost (never http://localhost/).
S11. Visual asks: headless Playwright at 1920 and 3440 (Playwright, never the owner's tabs, no `mcp__site__eval` on tabs the owner has open).
S12. Time the Live card load.
S13. Check scroll on the named URLs with real overflow measures.
S14. No window may pop up: `windowsHide: true`, `-WindowStyle Hidden`.
S15. Do NOT edit any repo file.
S16. Scratch goes in your scratchpad; screenshots go to `<run-dir>/shots/<your-name>-<ask>.png` only for the ones that are evidence (keep <=12).
S17. Also scan `words.jsonl` and add up to 8 extra asks the owner made there that current asks miss, with the same verdict.
S18. Return.
S19. Write ONE json file `<run-dir>/votes/<your-name>.json`: `{"name":"...","votes":{"A1":{"v":"done|partly|not done|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...},"extra":[{"ask":"...","v":"...","e":"...","f":"..."}]}`.
S20. Then reply "done" in one line.
S21. Never write the owner's name anywhere.
S22. Budget about $2 each: be quick, do not over-explore.
S23. Load the `minion` skill first only if it does not conflict: you edit nothing but your votes file and shots.
S24. [sessions/2026/10/12/session-0e99727c/voice-to-session-page/requirements.md]
S25. Voice to session page, in real time (mastermind brief).
S26. Goal: when the owner speaks, they watch their words turn into cards on the session's own page, live, from the phone.
S27. They test it tomorrow.
S28. The five stages, each shown on the page as it happens:
S29. Raw: Whisper's text, as spoken.
S30. Clean: the same text, tidied.
S31. Structure: the clean text split into its points.
S32. Refined: the finished prompt.
S33. Cards: the refining model writes them onto the page with the page tools.
S34. Which page: every session has one at `/framework/ai/sessions/<id>/`.
S35. By default an agent writes to its own page.
S36. This works the same whether the owner dictates in the browser or the app.
S37. "That's the kind of feedback loop that I'd like." (the owner, 2026-10-12)
S38. What exists (read STATE/reports first, do not rebuild): `ai/sessions/2026/10/09/session-48083d9d/refine-dictate-ui/` (VoiceStrip, phase-2 report, mobile-socket answer), `ux/Dictate/doc/voice-architecture.md`, `ext/Refine`, the Whisper server under Servex, and the task audit's transcription loose ends (`ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task/by-system.md`, "Transcription and refinement": 10 `now` rows, Haiku-labelled, about 58% reliable).
S39. Page tools: `Servex/agents/page_tools.js`.
S40. The AI-facing page model is being written by @mastermind-page-ai-api (`core/Page/doc/ai-api.md`); use its tools, ask it, don't fork them.
S41. Done when (tick each with proof).
S42. Reproduce first on current `michael/dev`: dictate (a recorded audio file fed headless is fine) and record which stage breaks or lags, with timings, in `STATE.md`.
S43. Whisper stays up: it survives a reload and a phone reconnect; a crash restarts by itself (Servex) and the page says so in one plain line.
S44. Each stage is visible live on the session page: raw, clean, structure, refined, cards, each written by page-tool deltas as it happens (stream, not poll; about 100 ms updates), one class per stage with its own view.
S45. Phone: the same flow works at 400 px from the phone address (`10.0.0.135`), proven headless at mobile width.
S46. For tomorrow's test: a short `ux/Dictate/doc/try-it.md` (open this URL on the phone, press this, expect that) linked from the Dictate readme, and an `owner_note` (kind `needs-you`) pointing to it.
S47. Close the transcription `now` loose ends this resolves, each by checking it, not trusting the Haiku label.
S48. Layout-check at 400/1200/1920/3440; smoke clean; commit each step; merge.
S49. Sonnet 5.5 (you); Haiku under 60k for reading.
S50. Worktree; one Servex restart batched and proven on a private port.
S51. One-sentence chat replies; `STATE.md` here; land with `finish-task`.
S52. [sessions/2026/10/12/session-0eaa4f07/inbox-asks/requirements.md]
S53. The AI Inbox and dashboard cards: close the open asks.
S54. The asks: [ai/doc/asks.md](/framework/ai/doc/asks.md), cluster inbox-dashboard-cards (#3, asked 19x).
S55. Read that entry and its source links first; its "Open" line is the work.
S56. Labels came from reading docs, not every line of code, so check each against the code before building.
S57. Done when.
S58. Each open point in the cluster is done (with a commit), or written up in `STATE.md` with the reason it cannot be done tonight and the smallest next step.
S59. Proof per point: a headless check, a screenshot, or a command's output.
S60. Layout-check 400/1200/1920/3440 for any page change; smoke clean.
S61. The cluster's entry in `ai/doc/asks.md` is updated (done / partly / open) with commit links.
S62. Never destructive (move aside, never delete).
S63. Sonnet 5.5, medium.
S64. Worktree; commit each step; merge.
S65. One-sentence chat replies; `STATE.md`; land with `finish-task`.
S66. [sessions/2026/10/12/session-15fbffb1/sessions-asks/requirements.md]
S67. The Sessions system: close the open asks.
S68. The asks: [ai/doc/asks.md](/framework/ai/doc/asks.md), cluster sessions-system (#4, asked 16x).
S69. Read that entry and its source links first; its "Open" line is the work.
S70. Labels came from reading docs, not every line of code, so check each against the code before building.
S71. Done when.
S72. Each open point in the cluster is done (with a commit), or written up in `STATE.md` with the reason it cannot be done tonight and the smallest next step.
S73. Proof per point: a headless check, a screenshot, or a command's output.
S74. Layout-check 400/1200/1920/3440 for any page change; smoke clean.
S75. The cluster's entry in `ai/doc/asks.md` is updated (done / partly / open) with commit links.
S76. Never destructive (move aside, never delete).
S77. Sonnet 5.5, medium.
S78. Worktree; commit each step; merge.
S79. One-sentence chat replies; `STATE.md`; land with `finish-task`.
S80. [sessions/2026/10/12/session-19429b3d/session-housekeeping/requirements.md]
S81. Session data housekeeping: commit rule, machine-log sweeper, OpenRouter gap (task mastermind brief).
S82. Read `public/framework/ai/handover.md`, `ai/sessions/readme.md`, `ai/sessions/doc/` and `ai/sessions/2026/10/10/session-41240bd9/tasks-into-sessions/STATE.md`.
S83. Tasks were moved into session folders; check what landed and what is left: 994 tasks had no session and stay, and 12 did not land.
S84. Do.
S85. Working-tree hygiene: `git status` shows dozens of machine-written files (`ai/sessions/2026/**/index.json`, `*/files.jsonl`, `public/ai/*.jsonl`, task `page.jsonl`/`task.jsonl`).
S86. Decide for each class of file: commit (versioned log), gitignore (cache), or regenerate.
S87. Write the rule in `ai/sessions/doc/` and the readme; apply it (`.gitignore` edits are fine; committing is fine; never delete data).
S88. A Servex sweeper: a small class (one file named for the class) that commits machine-written logs in batches on a timer (e.g. every 30 min when quiet, only paths on an allowlist, attributed `servex: log sweep`).
S89. It is idempotent and never touches code files or other agents' staged work; it has a dry run mode and logs what it did.
S90. Put it where Servex jobs live (`Servex/`), after reading `Servex/readme.md`; do not change `Servex/Pool.js`.
S91. OpenRouter account-vs-log gap: the account showed more dollars than `openrouter.jsonl` explains (handover item 1).
S92. With a script, reconcile by day and model, find the missing calls (other keys? Servex-external callers? echo?), and write the finding in `ai/sessions/doc/`.
S93. Make the Sessions page show "unattributed OpenRouter $" so the gap is visible, not hidden.
S94. Verify the tasks-into-sessions move end to end with its verify script; list anything unreachable from the site and link it.
S95. Fences.
S96. Never destructive.
S97. Worktree for code; commit each working step after a smoke test; merge via `Server/merge.mjs`.
S98. A `Servex/` change needs a restart: batch it and prove it boots.
S99. Sonnet 5.5; Haiku under 60k tokens for reading; `node Server/usage-now.mjs` before spawns; no OpenRouter calls.
S100. One-sentence chat replies; `STATE.md` here; land with `finish-task`.
S101. [sessions/2026/10/12/session-1c7d9e04/page-split-3/requirements.md]
S102. Page.class.js split, step 7: jsonl (the last move).
S103. Plan: [core/Page/doc/split-plan.md](/framework/core/Page/doc/split-plan.md), step 7.
S104. Steps 1-6 landed tonight ([page-split-1](../../session-75fc1375/page-split-1/STATE.md), [page-split-2](../../session-e55f5a4b/page-split-2/STATE.md)): 2,270 to 1,089 lines, nothing broke.
S105. Jsonl (~470 lines: replay, the file steps, `set()`'s jsonl handling) is the core path of every page, so this is the careful one.
S106. Do.
S107. Move the jsonl replay and file steps into their own class file (`Page.Jsonl`, or the name the plan settles), held by the page or attached as a static so a subclass can swap it.
S108. `page.set()`, `Page.Reader` and every public name keep their exact behaviour; replay order is unchanged.
S109. Before moving: record a baseline.
S110. For 40 pages (core, ai, sessions incl. a live session page, imagine/paging, markdown, a parts page, a page-tool-built page), save the computed state (`page_read`) and a 1200 screenshot.
S111. After: the same, diffed.
S112. Any difference is a failure.
S113. Prove the page tools still stream: `page_set`/`page_add` on a scratch page show in a watching headless browser within a second (as in `core/Page/doc/ai-api.md`'s proof).
S114. Done when.
S115. Baseline vs after: 0 state diffs, 0 new console errors, screenshots match at 400/1200/1920/3440.
S116. Smoke clean.
S117. `split-measure.mjs` before/after in `STATE.md`; step 7 ticked; `split-plan.md` says the split is complete.
S118. Merge with live reloads held during the batch.
S119. If any diff can't be fixed, don't merge: leave the branch and write why in `STATE.md`.
S120. Sonnet 5.5, high.
S121. Worktree.
S122. Land with `finish-task`.
S123. [sessions/2026/10/12/session-26eee6cc/live-page-error/requirements.md]
S124. Live site: a page load error hit the owner mid-browse, and UI lands without screenshots.
S125. Owner (2026-10-12, ~14:10 local): browsing `/framework/ai/sessions/` (a session detail open), the page refreshed itself and showed a page load error.
S126. "We shouldn't be causing errors on the live site while I'm browsing it… I thought we weren't doing that anymore."
S127. Done when (tick each with proof).
S128. Find the cause: what reloaded and what failed around 19:00–19:15Z (merges on `michael/dev`: `git log --since`, the dev server and Servex logs via `server_logs`, the hold log).
S129. Name the commit or write that did it, and why the guard (`Server/hold.mjs`, worktree → `check_page` → merge) didn't stop it.
S130. Close the gap in code, not in a rule only: e.g. merge holds reloads and boots the page headless before releasing; a page that fails after a reload keeps the old one with a one-line notice instead of an error screen.
S131. Smallest fix that would have prevented this one; record the alternative.
S132. Screenshots gate: UI agents keep landing layouts nobody looked at (cut-off columns, crammed tables).
S133. Check whether `merge.mjs`'s review gate really requires the 400/1200/1920/3440 shots for a page change; if it can be skipped, make it require them (files present in the task dir).
S134. One line in the relevant doc.
S135. Note in `Server/doc/watch.md`; commit; merge; land.
S136. Sonnet 5.5.
S137. Worktree; one Servex restart if needed, proven on a private port.
S138. `STATE.md` here; one-sentence replies; land with `finish-task`.
S139. [sessions/2026/10/12/session-38388428/page-split-plan/requirements.md]
S140. Page.class.js split plan (plan only, no code moves).
S141. Owner (2026-10-12): "What exactly is 2,000 lines in the Page class? That might be a mistake."
S142. Measured: `core/Page/Page.class.js` is 2,270 lines: 926 comment (40%), 317 blank, 1,027 code, 151 methods.
S143. Biggest areas by section markers: page.jsonl replay and the three file steps (lines ~72-500), the six words, roles, link opening (~907), rendering (~1238, `render_content_list` 101 lines), related aside (~1474), columns, the Finder shape (~1526-1973, ~450 lines), preferences (~1973).
S144. Done when (tick each with proof).
S145. The measuring script exists, and its output answers the owner's question: what the 2,270 lines are (code vs comment vs blank).
S146. `core/Page/doc/split-plan.md` fits one screen and shows the target class tree in code, with a target size for `Page.class.js` (for example, under 600 lines).
S147. Each move names its risk (callers) and its order, lowest risk first.
S148. The core/Page readme links `doc/split-plan.md`.
S149. `Page.class.js` is unchanged (`git diff` empty for it).
S150. Do (write, do not move code).
S151. A script that measures each section and method (code vs comment lines) and lists which other files call each group of methods (a cheap import/call grep).
S152. `core/Page/doc/split-plan.md`, one screen: for each group, keep in Page, move to a composed helper class (one file named for it, e.g. `Page.Columns`, `Page.Links`, `Page.Jsonl`, attached as statics or held by reference), or move to an extension.
S153. Aim for a Page class whose file a reader can scan.
S154. Show the target as a class tree in code.
S155. Name the risk per move (callers) and an order (lowest risk first).
S156. Comments: flag ones that are history, not explanation (candidates to move to `doc/`).
S157. Link it from the core/Page readme.
S158. No changes to `Page.class.js` in this task; executing the split is a later task.
S159. Sonnet 5.5; Haiku under 60k tokens for counting; commit; one-sentence chat replies; land with `finish-task`.
S160. [sessions/2026/10/12/session-3b391f22/claude-md-consolidate/requirements.md]
S161. CLAUDE.md consolidation, non-destructive (task mastermind brief).
S162. Owner (2026-10-12): CLAUDE.md is too long (~4,100 words, ~5,700 tokens paid by every session), and rules added one correction at a time may conflict or be worded too strongly.
S163. Consolidate for clarity, but nothing useful may be lost: a tip that does not belong in CLAUDE.md moves to where it belongs (a module readme, a `doc/`, a skill), and it is never just deleted.
S164. The owner cannot judge each line, so the process must be safe by construction.
S165. Do not wait on the owner: they may not read chat.
S166. Inputs: `ai/sessions/2026/10/09/session-a07780b9/system-architect/claude-md-proposal.md` (a 1,172-word draft, never applied), `ai/sessions/2026/10/12/session-b5cae4be/skill-usage-audit/recommendation.md`.
S167. Do.
S168. Sentence manifest, by script: split the current CLAUDE.md into sentences/rules with ids; for each, a row: keep (in CLAUDE.md), move (to a named file, with the anchor), merge (into which kept rule), or retire (only for a rule about a system that no longer exists, and it still goes to an archive file).
S169. Every sentence appears in exactly one row.
S170. A check script proves zero sentences are dropped: every one is in the new CLAUDE.md, in its destination file, or in `ai/doc/claude-md-archive.md`.
S171. Strength words: keep the owner's own strength ("always" only for what has broken things; else "usually", "prefer").
S172. Never strengthen a rule while moving it.
S173. Owner quotes and dates stay with the rule wherever it goes.
S174. Review page for the owner (one screen, linked from the AI board as a Note card): what was cut from CLAUDE.md, shown as short before/after blocks grouped by destination, plus the word counts.
S175. The owner can read it later; it does not block.
S176. Apply in a worktree: the new CLAUDE.md, the moved text appended to its destinations, the archive file, and the manifest.
S177. Commit, review the diff yourself, merge.
S178. Recent owner rules (2026-10-07 to 10-12: "Chat is the headline", "How to respond", "Mind the token burn", "Never destructive", "Stream, don't poll", "Haiku stays under 100k", "Commit after every working step", the class rules) stay in CLAUDE.md, tightened but not weakened.
S179. Reversible: the old file is in git, and the manifest maps every sentence.
S180. Write `STATE.md`; land with `finish-task`.
S181. Fences.
S182. Sonnet 5.5 (you): a fresh Sonnet reviewer reads the manifest and the new file once before merge and flags any rule whose meaning changed.
S183. No OpenRouter.
S184. One-sentence chat replies.
S185. [sessions/2026/10/12/session-471f8c3b/page-slice/requirements.md]
S186. Page system smallest slice: a page whose content is a streamed list of views (task mastermind brief).
S187. Why (owner, 2026-10-08 and 2026-10-10): page content should not be only a markdown string; a page's views are a list loaded from the page's own JSONL, rendered in a loop (as chat messages and session files already are), and editing the list persists by itself because that is how streaming lists and pages work.
S188. Templates (toolbars, headers, sidebars) are saved as JSONL view data.
S189. Not yet proven.
S190. Do.
S191. Inventory what exists (cheap, a script plus readmes): `core/Page` (`page.jsonl`, `live()` tail, `thing.page`/`page.thing` composition), `ext/Refine`, the session viewers (`ai/AISession/*`), and streaming lists.
S192. Read `core/Page/doc/indexing-2026-10-08.md`, `ext/Chat/doc/panel-composition-2026-10-08.md`, `ai/doc/tooling-architecture-2026-10-08.md`, and `ai/sessions/2026/10/08/task-system-design/task-system-design/`.
S193. Design the class architecture first (CLAUDE.md "Design the class architecture before you build"): a short page naming each class, its job, what extends or composes what, and the orchestrator; show it where the owner can see it.
S194. Build the smallest slice that proves it: one page whose body is a list of views stored in its `page.jsonl` (first line a snapshot is allowed, later lines deltas), rendered by one class, with at least three view kinds (heading, text/markdown, card) and add/move/remove through a tool or method that appends deltas.
S195. A reload and a second tab show the same state live.
S196. Smoke-test and layout-check it.
S197. Then use it once for real: render one existing small page (a readme-like page) through it to show it is not a toy.
S198. Record decisions and the alternative (e.g. `page.js` as today vs JSONL views; a snapshot line vs all deltas) in the module's `doc/`, linked from its readme and from the AI/page indexes.
S199. Fences.
S200. Worktree; commit each working step after a smoke test; review the diff; merge via `Server/merge.mjs`.
S201. Everything is linked from the site.
S202. Do not change existing `core/Page` behaviour: add beside it (note what you need).
S203. One class per file; `Thing.View = ...` after the class.
S204. Sonnet 5.5; `node Server/usage-now.mjs` before spawns; Haiku only for reading under 60k tokens; no OpenRouter.
S205. One-sentence chat replies; `STATE.md` here; land with `finish-task`.
