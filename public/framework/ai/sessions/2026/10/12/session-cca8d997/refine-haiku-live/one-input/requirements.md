Budget: $20

# One chat input everywhere; every mic refines live — minion brief

Owner asks (verbatim intent, `../requirements.md` §2 and §3): every chat area (session detail, the VS Code-style right sidebar, the Dictate page, Refine) uses THE SAME input: text field + microphone + a gear for settings, same look and behaviour. Whenever there is a mic, dictation goes through refinement: **raw text shows in the input while speaking** (rough reference), **chat bubbles show the clean text, paragraphed** (never a wall of raw), and the outline refines live underneath.

Work ONLY in the worktree `C:/Code/lew42/wt-refine-haiku-live` (branch `worktree/refine-haiku-live`). Load the `code`, `ui` and `css` skills first. Another minion is building the server half in the same worktree (`Servex/ext/refine/LiveRefine.js`, Servex.js); don't touch those. Commit only your own files (`git add <paths>`).

## Decided (by the mastermind; build this)
- **THE input is `ext/Chat/Composer.js` `composer()`** (with `ComposerMic` in `Mic.js`): already used by ChatPanel, Widget, the drawer AI tab, cards. Don't build a second one. Extend it.
- **Shape: a textarea, not an `<input>`.** One line tall when empty, grows to at most ~5 lines, then scrolls inside itself; it never pushes the area above it. Mic, gear and Send in one slim row. Alternative recorded, not taken: a single-line `<input>` that scrolls sideways (owner's suggestion) — it cannot show a paragraph of dictation, which is exactly what the raw reference needs. Write this decision in `ext/Chat/doc/` (a short `one-input-2026-10-12.md`, linked from ext/Chat's readme).
- **Mic → refine:** add `RefineSystem.live(text, { final })` in `public/framework/ext/Refine/RefineSystem.js` posting to `/api/refine/live` per `../contract.md` (keep the newest `seq`; the route goes live after a Servex restart, so fail quietly to today's behaviour when it 404s). `ComposerMic` calls it as Whisper text arrives (raw shown in the box) and with `final: true` on send; the sent bubble shows the slots' clean text joined into paragraphs (a paragraph break at a topic change = when the slot's cite moves to a different outline section, or every ~4 sentences). If a session id is known to the caller, pass it.
- **Surfaces to move onto composer():** the Refine demo (`ext/Refine/RefineDemo.js`, keep VoiceStrip's Connection row as a status line above if it still helps, but the input is composer) and the Dictate page (`ux/Dictate/page.js`). The session detail chat belongs to @mastermind-sessions-detail: don't edit it; it is told to use composer().
- The Refine demo shows the live outline updating as you talk (it already has a Prompt view; feed it the answer's `md`).

## Proof
Screenshots at 400/1200/1920/3440 BEFORE and AFTER for every surface touched (Refine, Dictate page, drawer AI tab, one card's compose), headless only (`Server/browser.mjs`; boot the worktree's own dev server on a private port, see `Server/doc/worktrees.md`), saved in this folder. Load each page headless and check the console is clean. Run `node Server/smoke.mjs C:/Code/lew42/wt-refine-haiku-live` if it exists. Commit each working step (message ends `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`). Do not merge. Log in your task.jsonl. Reply when done in 3 lines: commits, screenshots folder, anything left.
