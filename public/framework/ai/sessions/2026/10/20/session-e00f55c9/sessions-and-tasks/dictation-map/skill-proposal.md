# Skill proposal: a fence on a file never means "copy it"

**For:** the `make` skill (question 2, "place it"), and one line in the `sub-mastermind` brief template. Not applied; the system architect decides.

**Why:** on 2026-09-29 the audio task was told `Dictate.js` was read-only, so it copied Dictate's Whisper code into `audio/Transcriber/Whisper.js` (its lines 4-5 say so) instead of moving it. Dictate was never rebuilt on the new parts, and every dictation layer now exists twice ([the map](/framework/ux/Dictate/doc/map.md), section 6).

**The line:**

> If the code you need lives in a file you may not edit, import it; if you cannot import it, stop that piece and write a move proposal. Never copy a working engine into a second module. A new module that replaces an old one names, in the same task, the date the old one becomes a shim.
