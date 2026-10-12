# Owner asks, grouped: transcription and refinement (round 2 of asks-by-module)

**The ask (owner, 2026-10-12):** after page and AI, transcription is next: merge the repeated asks for the voice pipeline (Whisper, clean transcript, structure, refined prompt, cards on the session page, phone use) into one ordered list.

**Reuse:** the scripts and method from [asks-by-module](../asks-by-module/STATE.md) (rerun them with the transcription filter; don't rewrite). Tonight's voice work is in [voice-to-session-page](../voice-to-session-page/STATE.md), [voice-verify](../voice-verify/STATE.md) and [refine-asks](../refine-asks/STATE.md); mark what they closed.

## Done when
- [ ] `ux/Dictate/doc/asks.md` (or the module that owns the pipeline): merged asks with counts and source links, open first, checked against the code by Sonnet, done ones short at the bottom; linked from the readme.
- [ ] Build the top two open asks that are small enough tonight, re-running the voice walk script after; the rest stay in the doc.

Sonnet 5.5, medium; Haiku under 60k per call. Commit each step; merge. `STATE.md`; land with `finish-task`.
