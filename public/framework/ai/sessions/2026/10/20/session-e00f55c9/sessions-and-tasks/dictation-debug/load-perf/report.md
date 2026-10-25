# Phone sheet: load time and freezes, measured

Headless Chrome, 390 px phone, cold cache, `monorepo.localhost`, a saved session of 207 bubbles (237 KB). Every Servex and Whisper call is stubbed. "4x" is the CPU slowed four times, an estimate of a mid phone. Three runs each, medians.

## The two numbers

- **Time to first bubble after tapping the sparkle: 1.4 s on this PC, 7.2 s at 4x.** The sheet itself is up in 42 ms (178 ms at 4x). The rest is one unbroken main-thread task that draws all 207 saved bubbles, and the first one only paints when the task ends. The network is not the wait: the session file comes back in 5 ms.
- **Longest freeze while dictating: 264 ms at 4x (none over 50 ms on this PC).** At 4x a minute of dictation had 22 tasks over 50 ms, 1.5 s blocked in all. The load freeze above (1.2 s / 6.9 s) is the bigger one.

## Why opening is slow (ranked by ms saved)

1. **`ux/Dictate/Widget.js:250` `anchor()` forces a layout for every replayed line.** It is 85% of the replay: 1017 of 1206 ms (1x), 5.8 of 6.9 s (4x). Fix: call it once per animation frame (`requestAnimationFrame`) and not at all while replaying history; saves about 1.0 s / 5.8 s.
2. **`Widget.js:319` `refresh()` walks every line with a `querySelector` on each draw (O(n²)):** 101 ms (1x), 594 ms (4x). Fix: run it once after the replay batch, at the call in `draw()` (Widget.js:274-309); saves about 0.1 s / 0.6 s.
3. **`Widget.js:525` `mark()` → `ux/Understand/Understand.js:27` asks the model about every replayed owner line:** 177 POSTs (354 requests with preflights, 34.5 KB), each a paid call on Servex, and 60-380 ms of script. Fix: skip `mark()` for lines that came from history, only mark new ones; saves 0.1 s / 0.4 s here and the spend on every open.
4. Also: `ext/Session/Session.js:203` `watch()` downloads and parses the whole file every 1.5 s (237,701 B each, about 158 KB/s forever, seen at +46, +8663, +10184 ms at 4x). Fix: fetch only the bytes after `seen` (a `Range` request). And the sheet draws all 207 bubbles while the session page's Chat tab draws the newest 50 (`ext/Chat/Chat.js:335`, `recent = 50`): the same cap in `Widget.js` would shrink 1-3 by about three quarters.

Requests (median 1x run, `waterfall.json`): 692 files, 1,517,303 wire bytes (sum of the per-request sizes). 320 files (1.24 MB, 248 scripts, 62 stylesheets) are the page before the tap and finish in 354 ms; the tap adds 372 files, of which 354 are the marks. The session detail page's Chat tab is a different loader (`ext/Chat/Chat.js` through `AISessionConversation`, newest 50), so it was not measured.

## Why it freezes while dictating (ranked by ms saved, 4x, 60 s)

1. **`Widget.js:250` `anchor()` again, via `ext/Chat/Mic.js:266` `show_live` → `Widget.js:713`/`438`.** Every caption redraw (about 3 a second) reads layout of the whole thread right after changing it: 6.6 s of the 29 s of busy main thread (2.5 s in the real-mic run), including the worst task, 264 ms. Fix: one `anchor()` per frame, skipped when the draft's height did not change; saves about 6 s a minute.
2. **`ux/Dictate/Dictate.js:424-431` `on_level` runs about 125 times a second** (once per audio chunk, `capture.js:62`) and each time writes 3 to 5 styles at once: the button, `MicIndicator.js:21`, the widget meter (`Widget.js:694`/`732`), `DictationBar.js:61`. 2.2 s inclusive, 1.26 s of it in `View.js:289` `style`; it is on the stack of about half of the 22 slow tasks (50-77 ms). Fix: store the level and write it once per frame, as `DictationBar.js:70` already does; saves about 1.5 s a minute.
3. **`capture.js:93` `snapshot()` + `capture.js:150` `wav()` rebuild the whole growing segment every 900 ms** (up to 15 s of audio): 376 ms a minute at 4x, and 30-55 ms of the tasks at `Dictate.js:291`/`470`. Right behind it, the send redraw `Mic.js:644` `take_out` → `Widget.js:77` `show_out` costs about 45 ms each (282 ms for 6). Fix: send the interim guess from the last few seconds only; saves about 0.3 s a minute.

## Caveats

- The Chrome fake mic beeps without pauses, so the "real" run is one long segment (1 `say`); the "hand" run drives captions and 6-7 sentences by hand. The 1x hand run also had the real mic on. Raw numbers: `longtasks.json`. Attribution is the sampling profile inside each task's window, so it is approximate.
- Side effect: my first three probe runs had `/api/hitl` unstubbed, so about 531 real marks calls reached Servex (the owner's paid model). Every later run stubbed it.
- Out of date once these land: `ux/Dictate/doc/voice-assistant.md#nothing-jumps` (the anchor rule) and the `ext/Session` readme on `watch()` polling.

Files here: `waterfall.json`, `longtasks.json`, `load-home-1x.json`, `load-home-4x.json`, the harnesses `load.mjs` and `freeze.mjs`, and `build-outputs.mjs`.
