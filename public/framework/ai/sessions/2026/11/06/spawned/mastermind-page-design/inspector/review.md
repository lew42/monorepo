verdict: fix
1. [fix] Inspect ships no CSS: no rule anywhere matches `item-inspector-*`, `delta-history-*` or `live-settings-inspect`. So each row's class name runs straight into its title ("settings — SettingsLivePage", "h0xklxtePageHeading" in proof/plan-settings-1200.png), the rows sit on bare background while Files above them sit in white cards, and "WHAT IT IS MADE OF" stacks directly on "INSIDE" as two identical h4s. Add an `Inspect.css` (or `live-settings-*` rules) that frames the rows like `LivePage.Files` and separates the type.
2. [fix] The DeltaHistory summary shows only list counts ("content: 11"), but requirements.md deliverable 2 asks for "title, cards in order, sub-pages". List each card (id and title) and each sub-page at line N, not just a number (`ext/Inspect/DeltaHistory.js:47-50`).
3. [fix] The proof doesn't show the slider. All four shots are the top screen only and end inside "Inside", so neither Methods, Fields nor the slider at line 1 and line N appears in any image. Deliverable 4 asks for that proof. Take full-page shots, or one at line 1 and one at line N (proof.md rows 3-6).
4. [fix] ext/Inspect isn't indexed. `public/framework/ext/readme.md` "## Index" lists every ext module, and Inspect has no line there. Deliverable 6 says "check", and law 10 requires the index line.
5. [fix] The method walk is now written twice (`ext/Inspect/ItemInspector.js:7-11` and `live/design/ui/MethodMap.js:37-42`), against law 6. The brief explicitly allowed moving the walk into Inspect and having MethodMap import it: ext may be imported from /live/, and the direction that is forbidden is core importing ext. The readme's reason for the copy ("MethodMap lives under /live/") argues for that move, not against it.
6. [fix] Heading cards show only their id ("h0xklxte", "wbswuioz") because `ItemInspector.js:51` reads `title`, and a part-heading keeps its words in `text`. Fall back to `text`, cut short, when there is no title.
7. [note] "Inside" lists internal lists: `_pages (1)` (the virtual settings page itself) on /live/plan/ and `removed (15)` on /live/design/ (design-settings-1200.png). Consider skipping lists whose name starts with `_`, or labelling the removed ones as removed.
8. [note] `DeltaHistory.js:35` creates `this.$list` but never fills it. The line rows are appended after `$summary` instead, so on a 141-line page the summary sits above a very long list that has no scroll limit. Put the rows in `$list` and give it a max height.
9. [note] DeltaHistory replays as `Page` whenever line 1 names no type, even on a LivePage or DesignPage (`DeltaHistory.js:26`). Settings knows the real class (`of.constructor`) and could pass it in as `{Class}`.
10. [note] The brief's "first comment line" for each method was optional ("if cheap") and was skipped. Also, Methods lists every method of the class, not only the ones a delta can call. That is fine for now, but worth one line in the readme's Watch out.
11. [note] No `ext/Inspect/page.js` exists, so the readme's own url shows only the readme. Other ext modules have a page with a live example (ext/readme.md Index). A one-line demo would fit the "show the class" rule.

## Requirements
- 1 "ItemInspector: Inside, Methods, Fields" — partly — all three sections exist; headings show only their id (finding 6); unstyled (finding 1)
- 2 "DeltaHistory: lines, slider, replay in memory, summary of title, cards in order, sub-pages" — partly — the lines, the slider and the in-memory replay are there (no host attached to the Store, `Store.replay_depth` held by `replay`); the summary shows counts only (finding 2)
- 3 "Two lines in LivePage.Settings, dynamic import, h4s" — yes — `public/live/LivePage.js:511-514`; `append(promise)` is supported by `View.append_promise`
- 4 "Proof at 400/1200, slider at 1 and at N, smoke clean" — partly — four shots exist, but none shows the slider (finding 3); proof.md reports smoke as exit 0
- 5 "Node test, card count per N, under 1 s" — yes — `Inspect.test.mjs`, 0.13 s according to proof.md
- 6 "readme, ext index line, live/readme link" — partly — `ext/Inspect/readme.md` and the `public/live/readme.md` line exist; the ext/readme.md index line is missing (finding 4)
- Show the class and its live instances — n/a — these are Views, not stateful classes

## Words
- The readme is one screen in the what · files · use · watch out · more shape — yes
- The `public/live/readme.md` addition is one sentence that names both views and links the module — yes
- Section labels on the page: "What it is made of" and "How it got here" are the owner's plain words — yes; but "Inside" directly under "What it is made of" reads as a duplicate heading (finding 1)

Widths given: none in a shots/ folder; I judged from the worker's own proof/ shots at 400 and 1200 (in the pd-inspect worktree). A fresh agent can continue from requirements.md, proof.md and the worktree commits listed there.
