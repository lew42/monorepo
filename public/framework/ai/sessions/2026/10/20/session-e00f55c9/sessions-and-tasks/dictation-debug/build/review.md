verdict: pass
1. [note] Leaving the Debug tab after opening the page straight at `<page>/ai/debug/` replaces the url with the page's own url, not `<page>/ai/`, because `url_before` was never set (`ext/drawer/Sheet.js:411-415`, `route_tab`). A reload then follows `Sheet.routed()`, and with no `here` in `history.state` the sheet may come back closed. Falling back to `ai` instead of `about` keeps the sheet open.
2. [note] The old name "dictation" is mapped to "debug" in four places: a hidden duplicate `VIEWS` row plus `HIDDEN` (`ext/drawer/AIPage.js:314-318`), `view_of` (`AIPage.js:325`), `SheetPanel.pick` (`Sheet.js:396`) and `DrawerTabs.open` (`tabs.js:506`). A simpler way: one alias, applied once where the url is read (`AIPage.old_link()` already rewrites `?drawer=dictation`). That would drop the hidden row and the `HIDDEN` set.
3. [note] A failed send is written to the Sent row twice: by `chat.js` deliver's catch (`ux/Dictate/chat.js:1048` in the diff) and again by `ComposerMic.post_held`'s `.catch` (`ext/Chat/Mic.js:98`), which only runs if deliver throws (it never does). The Mic.js `.catch` is dead weight. It is harmless.
4. [note] `ErrorLog.module_of` blames the first `/framework/…` file in the stack (`ext/ErrorLog/ErrorLog.js:159`). An uncaught error thrown inside a shared helper (`core/View`) is therefore logged to `core/View/failures.jsonl`, not to the page's module. That is fine for now, but the zero-errors board in `page-watcher.md` should group by `page` as well as by module.
5. [note] `report.md` "Docs this made out of date" still lists `ext/drawer/doc/tabs.md` and `doc/sheet.md`, but the diff updates both. What is still stale: `ux/Dictate/surfaces/page.js` lists `tabs/dictation.js`, which no code loads now (dead file, keep or archive). Also `ext/drawer/readme.md:486` still says the AIPage views are "chat, live, sessions, dictation and settings".
6. [note] In `shots/debug-390.png` the chat fills the top half and the Debug rows start below it, so the Sent and AI rows are under the fold at 390×844. The owner has to scroll to see the two rows that matter most for "the AI never answers". Showing Debug without the chat above it in the full sheet would put all five rows on one screen. In `shots/debug-390-reloaded.png` the same sentence and reply appear twice. That is most likely two test runs (one before the reload, one after), not a duplicate bubble, but worth one look.

## Requirements
- 1 "Make the drawer's Dictation tab a Debug tab… each layer, live" — yes — `DictateHealth.LAYERS` holds the owner's five questions word for word; `shots/debug-1920.png` shows all five green with live reasons.
- 2 "Each layer shows a real error message when it fails" — yes — `Session.post` now gives reasons like "Servex did not answer session/say in 10 s" (`ext/Session/Session.js:294-300`); the Whisper error names the url; the llm row turns red after 60 s with no answer; a wire drop lasting 8 s turns it red too.
- 3 "The tab is routed… pick one and say why" — yes — subpath `<page>/ai/debug/`; why is in `doc/debug-tab.md#routed` (a peer path collides with real child pages); `shots/debug-390-reloaded.png` is still on Debug after the reload.
- 4 "Find the stall and fix it, including whether the mic is released on reload. Reproduce it first" — yes — `test/stall.mjs` reproduces it (1 send in 25 s, then 4 after the fix); the 10 s limit on each session call plus the 25 s backstop unblock the queue; the mic hand-over fixes the silent stop; the reload releases 1 of 1 tracks (`pagehide`). The 10 s limit is safe: Servex's session handlers answer synchronously (`Servex/agents/Sessions.js:1376`).
- 5 "A UI rule, written into rules.md" — yes — `framework/doc/rules.md` has the rule in three parts, and the framework readme has one line linking it.
- 6 "Errors logged per page and per module… extend what writes ai/errors/" — yes — `ErrorLog.report` now also writes `<module>/failures.jsonl` (git-ignored, `.gitignore:225`), and `app.js` calls `watch()` on every page (`watch` is idempotent, so Refine's own call is still fine).
- 7 "Propose (don't build yet) a watcher" — yes — `ext/ErrorLog/doc/page-watcher.md` reuses `WorktreeWatch`, `follow` and the noise rule.
- 8 "One subscription system" — yes — nothing is sent directly; a failure is a line in the module's log, and `follow` delivers it.
- 9 "Bubbles and deltas" — yes — one piece per `at`, time order inside a bubble, and a stream that ends stops blinking; `test/deltas.mjs` checks all of them.
- 10 "Dictate into the VS Code tab" — n/a — the owner stopped it; the result is recorded in `core/Page/ai/doc/dictation.md`.
- Class with live instances — yes — `DictateHealth` is a static store; the Debug tab is its live view, and `globalThis.DictateHealth` reaches it from the console.

## Page structure
Widths given: 390 and 1920 (builder shots, no layout.json, so nothing is measured).
- page 1 — yes — shots/debug-1920.png: the title "Debug", then "Dictation, layer by layer" says what the page is.

## Navigation
- techniques — tabs (AIPage view row, drawer tabs), a sheet (phone), a sidebar
- view row — yes — shots/debug-1920.png: Debug shows as the current view; Dictation is hidden.

## Layout
- yes — shots/debug-1920.png: two columns (layers | events); at 390 one column.

## Sizing
- yes — max 100rem, columns at least 24rem; the events list scrolls at 28em (it clips mid-line at 1920, which is acceptable for a scroll box).

## Wrapping
- yes — the reasons wrap in full (`overflow-wrap: anywhere`); the question text wraps under the label at 390.

## Spacing and padding
- yes — `.pad` on the tab; the rows have even gaps.

## Colour and contrast
- yes — green, amber and red dots and labels; the muted question text is light but readable.

## Flow
- note — at 390 the chat comes before the rows (finding 6).

## Words
- yes — plain sentences that name the step and the cause; the intro line says what green, amber and red mean.
