# Review: playback-stutter

verdict: fix (two fixes, then met)

## Fix
- [ ] [Recite.js:282](/framework/audio/Recite/Recite.js) `unread_tail` matched whole sentences only, so a stream cut mid-sentence read that sentence twice. Start the tail after the streamed prefix. Done: see [findings.md](findings.md).
- [ ] `playback-stutter.test.mjs:410` ended in `|| …includes(…)`, so the order check could not fail. Drop the `||`; assert the joined chunks equal the final text.

## Notes
- Test missing from `core/Test/browser-scripts.mjs`; add it.
- Recite readme: the bar line omits the mode button, and calls it "🎚/abc" while `ReciteBar.js:314` draws `graphic_eq` / `abc`. Name it the same.
- Recite readme "Files": give the new test its own bullet with its run command.
- `BargeIn.js:226`: in `words` mode the snippet holds Kokoro mixed with the owner. The test covers pure echo, not echo plus words. Watch on the phone.

## Requirements
- Cause found from the phone log: yes.
- Cause fixed: partly (the cut-off sentence repeated, first fix above).
- Optional `words` interrupt: yes, `BargeIn.js:226/251`, bar toggle `ReciteBar.js:314`.
- Headless test: yes, 15/15, one check could not fail (second fix).
- Words: readme button name does not match the code.
