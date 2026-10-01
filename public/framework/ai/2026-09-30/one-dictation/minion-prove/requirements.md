# Minion brief: prove this afternoon's chat fixes live (step 0)

Load the `minion` skill first, then `ui-test`. Your parent is **task-mastermind-one-dictation**. Read `public/framework/ai/2026-09-30/one-dictation/checklist-2026-10-01.md` first: the owner's 14 fixes.

## Why
The voice session's minions edited main directly. Several had no shell, so none of these fixes has been seen working. They are live on `http://monorepo.localhost` now, uncommitted. Your job is to PROVE or DISPROVE each one with headless Playwright and a screenshot. **You change no code:** report only. Your parent fixes and commits.

## Check each, at 400 (phone) and 1920
Use `/framework/ux/Dictate/` (the demo) and the ✦ sheet (tap ✦ on any page at 400). For each check, say pass or fail, give the shot path, and if it fails, give the cause in one line with file:line.
1. **No duplicates** (checklist 1): one typed send and one assistant reply draw exactly one bubble each, on the demo and in the sheet. Stub Servex the way `minion-chatjoin/proof.mjs` does (page.route on the session endpoints), and feed the reply lines through the same channels chat.js listens to: the SSE push AND the file poll.
2. **Full-screen sheet** (4): maximize the ✦ sheet at 400×800. The thread fills the space, and there is no empty band under the buttons. Measure it: the gap from the composer's bottom to the sheet's bottom, in px.
3. **Auto-scroll** (5): with 30 bubbles, a new one keeps the view at the bottom. Scroll up, and a new one does NOT move you, and a "jump to bottom" button shows. Note whether that button exists at all.
4. **Mic sounds** (7): launch Chromium with `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`. Wrap `AudioContext.prototype.createOscillator` to count calls. Start and stop the mic on both surfaces: does each give one start chime and one stop chime?
5. **The dot** (8): mount `new Widget({pulse: true})` (or whatever `ux/Dictate/doc/widget.md` documents) on a blank page. Shoot it on and off. Then say whether ANY real surface uses it yet.
6. **Do the two surfaces match?** (2): list every option and setting the demo's `chat()` mount and the sheet's mount pass (page.js vs ext/drawer/rail.js), side by side, and every behaviour that differs (autosend, send mode, keep, mode). This is the input to the next merge.
7. **Menu merge and threaded replies:** if `public/framework/ai/2026-10-01/chat-menu-merge/` or `card-threaded-replies/` has landed by the time you get here, check its claim the same way. If not, skip it.

## Rules
Never `say()` into a live session (stub every Servex call), never drive the owner's tabs, never restart Servex, and never edit code. Scripts and shots go in `public/framework/ai/2026-09-30/one-dictation/minion-prove/`.

## Land
Write `minion-prove/report.md`: one line per check (pass or fail, shot, cause), then the surfaces table for 6. End your turn with the same lines.
