verdict: fix
1. [fix] The drawer's tab docs are now out of date. `ext/drawer/readme.md:31` still lists the tabs as "AI, Debug, Settings, Element", and the tab table in `ext/drawer/doc/tabs.md:14` has no Docs row. The diff adds Docs to `tabs.js`, `AIPage.js` and `Sheet.js`, so both files need a Docs entry that links to `tabs/docs.js` and `ux/Dictate/doc/docs-tab.md` (law 9).
2. [fix] The `ux/Dictate` readme doesn't list the new class. Its class list (readme.md:19-24) names `DictateHealth` and `DictateDebug`, but not `DictateDocs` (DictateDocs.js/.css) or the new proof `test/docs-tab.mjs`. Line 17 only links to the doc (law 10).
3. [fix] Someone picking this up from the task folder couldn't tell what happened. `docs-tab/session.jsonl` has only the assign line and `{"commit":"ca58e60497b7"}`. The brief asked for findings as `log` lines, but there are no test results (docs-tab, settings, order, flicker, repeat), no note that the optional demo (ask 4) was skipped, and no note that the work went outside the fence.
4. [note] The work went outside the fence (`ux/Dictate/**`): it edits `ext/drawer/AIPage.js`, `Sheet.js` and `tabs.js` and adds `tabs/docs.js`. That was the right call. Those three lists are where AI · Debug are made, so "same component, no second tab system" could only be met there, and `tabs/docs.js` copies `tabs/debug.js` line for line. It should still be logged (see 3).
5. [note] I checked all eight footnotes in "How messages travel" in the worktree and each matches its file:line (`Session.js:39/56-57/83`, the stream at ~:162, `chat.js:72`, `Sessions.js:246/766/783/792/970-972/1107-1119/1468/1471`, `WakePolicy.js:2-5/12/66`, `Mic.js:388`). One small slip: footnote 5 cites `:975-982` for "a typed line goes straight in", but :975 is the typed-while-spoken-words-are-held case. Only the `else` at ~:977-982 goes straight to the fast seat.
6. [note] The markers `[1]`…`[8]` in the paragraph show as plain text, not links to the footnote list (shots/docs-1920.png). Ask 3 also wanted the section "linked from the tab's top". It is the first section of the readme, so it is visible at the top of the tab, but there is no link to it.
7. [note] The doc row could also link `doc/wake-policy.md`. The paragraph's last sentence is about WakePolicy, and the brief's five docs were only "start with".
8. [note] Two quick clicks on doc links can land on the wrong page. `DictateDocs.open()` (DictateDocs.js:38-52) awaits `md.file` without checking that the path is still the latest one asked for, so whichever file loads last wins.
9. [note] At 400 (shots/docs-400.png) the sheet's leftover task lines and the mic bar fill the top ~25% before the Docs content starts. That is the sheet's existing layout, not this diff. At 1920 the drawer tab row (AI · Debug · Docs · Settings · Files) still fits on one line.

## Requirements
- Shots given: docs-400.png, docs-1920.png, docs-doc-400.png, docs-doc-1920.png (in the worktree's `docs-tab/shots/`, committed in the diff).
- 1 "A third tab, Docs, beside AI and Debug … same component, no second tab system" — yes — added to `DrawerTabs.list`, `AIPage.VIEWS` and the sheet's More row; shots/docs-1920.png drawer tab row.
- 2 "Shows the ux/Dictate readme rendered the way the site renders a readme … links to doc/*.md … back link" — yes — uses `ext/markdown` `md.file`; the five docs are listed above the readme; "← Back to the readme" button; .md links inside the text open in place (docs-doc-*.png).
- 3 "How messages travel: one plain paragraph at the top of the readme … each claim with a file:line footnote" — yes, with notes 5 and 6 — readme.md:3-14, footnotes verified against the code.
- 4 "Live demos optional, last" — skipped, and the skip isn't recorded anywhere (finding 3).
- Proof: `test/docs-tab.mjs` exists and covers open → heading → doc → back → link in the text. `node --check` passes on all three JS files. I didn't rerun the tests and found no recorded results.
- Class with live instances — `DictateDocs` holds only a view's state (the current path). Nothing for the owner to watch, so n/a.

## Words
- The paragraph is plain and in order (speak → POST → session → fast → smart). Terms like `EventSource` and "fast seat" are explained in passing. It is long (~190 words) but meets the brief's "one paragraph".
- docs-tab.md says what it is, where it's made and what proves it, in three short sections.
