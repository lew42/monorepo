verdict: fix
1. [fix] `ext/drawer/readme.md:33` still says the sheet's v2 chip is `SheetPanel.sync_v2()`, but this diff deleted that method. The line should point at `ChatView.sync()` (the new `ChatView.js` bullet on line 32 is right; line 33 is now stale).
2. [fix] Deliverable 3 asks for "one line per shot saying what it shows" and the pass counts. `session.jsonl` has one combined line for all three shots, and the sheet probe says "chip+v2 on/off ok" with no count. Log one line per png, plus the probe's real output.
3. [note] In `proof/v2-1920.png` and `v2-3440.png`, the bottom of the desktop AI panel shows clipped old rows ("started: Dictate… / ended: Dictate… 10-17 00:09") under the Chat v2 box. These look like AIFeed or bubble rows that the v2 box does not fully replace or overlap. The ✦ sheet (`v2-400.png`) is clean. Check that `.drawer-rail-sheet-v2` fills the desktop card the way it fills the sheet.
4. [note] `proof/proof.mjs:12-13`: the `open` locator is never used, and the "toggle candidates" log is leftover debugging. The desktop shots only show the drawer because it docks by default at 1920 and wider. Delete both lines, or click the toggle, so the script says what it does.
5. [note] `proof/proof.mjs:2` imports Browser.mjs by an absolute `file:///C:/Code/lew42/monorepo/…` path, so it only runs on this machine and at this checkout. A path relative to `import.meta.url` would be sturdier.
6. [note] On the desktop, the v2 chip in `v2-1920.png` (top right, beside "+ New session") is visibly shorter and darker than the button next to it. The pressed style comes from `ChatView.css`, but the sizing comes from `drawer-ai-switch-btn`. Making the two buttons the same height would read better.
7. [note] The desktop chip keeps the `drawer-rail-sheet-v2*` class names. The brief asked for this so the sheet would not break, so it is correct, but the name now says "sheet" on a surface that is not a sheet. If it is ever renamed, the new name belongs in ChatView's own prefix.

## Requirements
Widths given: 1920, 3440 and 400, from the minion's own proof (pngs in the worktree, `drawer-v2/proof/`). Checked by me: `node --check` passes on ChatView.js, tabs/ai.js and Sheet.js, and `ChatV2.test.mjs` gives 43 passed, 0 failed. I did not re-run the sheet probe.
- 1 "The same v2 chip in the desktop drawer's AI tab … sharing the SAME localStorage choice": yes. `tabs/ai.js` puts `view.chip()` beside "+ New session" and subscribes `chat.on_change(() => view.sync())`. `ChatView.KEY` is `lew42.sheet.chat_view`. `v2-1920.png` shows the chip pressed and Prompts in place of the bubbles, with the composer and mic kept (but see note 3).
- 2 "One component, not two": yes. `ext/drawer/ChatView.js` has `chip()`, `set()`, `sync()` and `release()`, and `Sheet.js` and `tabs/ai.js` both use it. The sheet's CSS classes are unchanged, and their rules moved into `ChatView.css`. There was no existing component to reuse, but the log has no line saying so (the brief asked for that line).
- 3 "Proof, headless … log one line per shot": partly. The three shots exist and the script is committed, but the shots are logged as one combined line (fix 2).
- 4 "Docs": partly. The "Where it shows" line in `Chat/v2/readme.md` and `doc/sheet.md` are updated. The drawer readme has a new bullet, but it also keeps a stale `sync_v2()` reference (fix 1).
- Class page for ChatView: no, but ChatView only holds a chip state and a stream handle, so there is nothing the owner needs to watch live. This is a note only.
- A fresh agent continuing from this folder: mostly yes. The brief, the closing log with commit hashes (94b3ea495, 9a56d446a; edea8d801 came later and is not logged), and the script are all here.

## Words
- The readme and doc lines are plain and say where the chip lives. `Chat/v2/readme.md`'s "Where it shows" sentence is now a single sentence of about 90 words, and would read better split in two.
- The chip's tooltip and the empty-state text are unchanged from the sheet's. Good: one string for both surfaces.
