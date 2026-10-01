# Minion brief: merge 12, the pulsing ✦ dot and the mic sounds

Load the `minion` skill first. Your parent is **task-mastermind-one-dictation**. Read `public/framework/ai/2026-09-30/one-dictation/checklist-2026-10-01.md`: you own items **7** and **8**. Merge 11 (minion-onewidget) has already landed, so the demo and the ✦ sheet make the same `chat()` call.

## Why
The owner dictates while looking away, so the mic has to be heard and seen without any effort. In their own words: "a little orange dot... the size of it pulses with the audio... bottom right corner maybe". Then: "maybe it should be the AI icon shape", and, after closing the sheet with the mic on, "all I should see on my screen is the little orange dot". The start and stop sounds "are important", and this afternoon they didn't play.

## What exists
- **The dot itself:** `Widget.Pulse` in `ux/Dictate/Widget.js` (around line 897, with `Widget.css` around line 155) is a `pulse: true` opt-in. It's built and documented in `doc/widget.md`, but it was never loaded live, and no surface uses it. Its task, `ai/2026-10-01/dictate-pulse-dot/`, ended without landing. Read its task.jsonl, then finish that work here instead of starting another dot (law 6).
- **The level bars:** `level: true`, which merge 11 has dropped from every caller.
- **The sounds:** `beep()` in `ext/Chat/Mic.js:84`, from task `ai/2026-10-01/dictate-stop-sound/`, which claimed a fix.

## Do
1. **The dot becomes the ✦ shape**: the same glyph or SVG the rail's ✦ button uses (find it in `ext/drawer/`). It's in the primary orange (`--prim`), small, at the bottom right of the chat feed, and it scales with the voice level.
   - When the mic is off, it is dimmed (low opacity) but still visible.
   - Tapping the dot starts or stops the mic. Tapping anywhere in the empty feed starts it too.
2. **It's on by default, on every surface.** Make `pulse` the default (`Widget.prototype.pulse = true`), so the demo, the ✦ sheet and the ☰ drawer all show it. Remove the `level` bars, and drop the option from the docs.
3. **After the sheet closes, the dot stays.** Close the ✦ sheet while the mic is listening, and a floating ✦ dot stays at the bottom right of the viewport (fixed position, above the page, small). Nothing else from the sheet shows.
   - Tapping that dot stops the mic, and the dot goes away. The rail's own ✦ button is still how you reopen the sheet. (The alternative was to have the tap reopen the sheet. That was rejected because the owner said "tap it to start or stop".)
   - Find where the sheet closes in `ext/drawer/rail.js`. Today the mic may stop when the sheet closes, so check that first. The owner wants it to keep listening.
4. **The sounds:**
   - Prove that one start chime plays on start and one stop chime on stop, on both the demo and the sheet. If either is missing, fix it in `beep()` or its callers.
   - The usual trap is an `AudioContext` created before any user gesture. It stays suspended. Make sure the context is created or resumed inside the tap handler.

## Prove (headless Playwright with `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`; never the owner's tabs; stub every Servex call as `minion-chatjoin/proof.mjs` does)
- **The sounds:** count `AudioContext.prototype.createOscillator` calls. Start then stop the mic on the demo and in the sheet. Each surface gives 2 oscillators per chime (the two notes), one start chime and one stop chime.
- **The dot:** read its computed scale at level 0 and while the fake device plays sound, and shoot it on and off at 400 and 1920 (`minion-dot/shots/`).
- **Floating:** open the sheet at 400×800, start the mic, close the sheet, and shoot it. Only the dot shows, at the bottom right. Tap it: the mic stops and the dot is gone.
- **No level bars** are left anywhere: grep it, and check the DOM.

## Rules
- Work in your worktree only. Commit by exact path, and never commit `.jsonl` files.
- Run `node Server/review.mjs` on your task dir and answer every finding.
- End your turn with the commit hash, the oscillator counts, and the shot paths.
