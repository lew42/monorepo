verdict: fix
1. [fix] Recite.js:282 `unread_tail` matches only whole sentences, so when the stream ends partway through a sentence, that unfinished sentence is read twice. `partial("")` → `take(text, true)` queues the fragment "The second thing is simple", and `final()` then queues "The second thing is simple and short." from the start. That is the same start-over stutter, now on one sentence. Either let the tail begin after the streamed prefix (`text.slice(<streamed length>)`), or hold back the trailing fragment in `partial("")` until `final()` arrives.
2. [fix] playback-stutter.test.mjs:410: the "reads start to end, in order" check ends in `|| got.chunks.join(" ").includes("A third sentence follows.")`, so it passes whatever the order or the repeats. That `||` hides finding 1. The check at line 409 uses `Set` on exact strings, so it misses the repeat too (the fragment and the full sentence are different strings). Drop the `||` and assert that the joined chunks equal FINAL exactly.
3. [note] The new test is not on `public/framework/core/Test/browser-scripts.mjs`, while its sibling ReciteBubble.test.mjs is (line 7). Add it so the suite runs it.
4. [note] readme.md:496 (the `Recite.Bar` line) still lists the bar's controls without the new mode button. Line 495 calls that button "🎚/abc", but ReciteBar.js:314 draws the `graphic_eq` / `abc` icons. Name it the same way in both places.
5. [note] readme.md "Files" puts playback-stutter.test.mjs between Recite.js and BargeIn.js. The other tests each have their own bullet with the command to run them; give this one a bullet like theirs.
6. [note] BargeIn.js:226: in `words` mode, Recite keeps playing while Whisper transcribes, so the snippet holds Kokoro's voice mixed with the owner's. The echo filter (`owner_spoke`/echo match) has to sort it out. The test covers a pure echo (case r4) but not echo mixed with real words. architecture.md:337 already names the cost (about `listen_ms` of talking over the owner); worth watching on the phone.
7. [note] Requirements are otherwise met. findings.md proves the cause from the phone log (old build 6fef75ea6: `final()` → `read()` = stop + restart), with suspects (a)–(c) each ruled out by trace lines. `words` mode lives in BargeIn.js only and has the plugin shape (`id`/`label`/`defaults`/`start`/`stop`). The test runs under FENCE_SERVEX with stubbed /speak and /inference and a fake mic. A fresh agent could carry on from this folder: requirements.md ticks each ask with its proof and links findings.md.

## Requirements
- 1 "Cause found from the phone log, written to findings.md": yes. findings.md quotes the run `mvynq0e6fox` traces and gives the build's byte size and commit.
- 2 "Cause fixed (no restart at the start of a reply)": partly. The whole-reply restart and repeat are gone (Recite.js:347). The unfinished last streamed sentence still repeats (finding 1).
- 3 "Optional `words` interrupt: a cough or noise no longer stops playback": yes. BargeIn.js:226/251, plus the bar toggle at ReciteBar.js:314; test cases r2–r5.
- 4 "Headless test passes": yes as reported (15/15), but one check can't fail (finding 2).
- Class page with live instances: n/a. No new class; BargeIn only gained fields.
## Words
- findings.md, the readme bullets and architecture.md are plain and lead with the short answer: yes.
- The readme's button name matches the code: no (finding 4).
