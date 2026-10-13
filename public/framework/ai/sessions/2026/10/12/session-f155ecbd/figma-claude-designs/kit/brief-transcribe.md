# Brief: transcription UI designs (owner, 2026-10-13)

The owner's words: "play around with some transcription UI designs. You can use anything that we've created. It seems like you have some little icon items, like tap to talk circles. But in terms of the overall composition, I don't know if you've made anything like that yet."

Context:
- The site has a dictation system (`public/framework/ux/Dictate/`). Read its readme only, for what exists: tap to talk, live words streaming in, sessions, local Whisper.
- The owner dictates a lot while doing other things, often on a phone, and wants to see the words arrive live and act on them.

Read [doc/page-layout.md](/framework/ext/Figma/doc/page-layout.md), [brief-ds.md](brief-ds.md) (tokens, modes, prime as a small splash, hug or fill) and [use-figma.md](/framework/ext/Figma/doc/use-figma.md). Find the existing tap-to-talk / mic pieces in the file (search node names for mic, talk, record, dictat) and reuse them. File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. **The owner reads the file, not chat**: a Notes box at the top.

## Page `Screens · Transcription` (new)
1. Components first:
   - `Mic button`: idle / listening / processing / error, with a level ring or bars.
   - `Live transcript line`: a final line, a partial line in muted ink, a speaker / time stamp.
   - `Transcript session row`, for lists.
   - `Action chip`: send to Claude, copy, new note.
2. Compositions, each at 390 (phone) and 1920 (desktop):
   - (a) The phone, full screen: a big mic at the bottom, live words above.
   - (b) A floating mini-bar over any page.
   - (c) A desktop side panel docked to the right of the site.
   - (d) A session history: a list on the left, the transcript on the right.
   - (e) An "after" view: a transcript turned into tasks or notes, with action chips.
   - (f) A dark, near-black variant of (a) for night use.
   Make 2–3 of them a clickable prototype (tap the mic → listening → words arrive → stop → actions) with ▶ PROTOTYPE badges.
3. Verdict in Notes: which composition you'd build first and why.
4. Layout per page-layout.md: one 1920 wrapper made into `Page · Screens · Transcription`. Prototype screens stay top-level in a `Prototype screens` Section. Masters go in a `Components` frame.

Screenshot and fix. Link the page from the Overview design-system card. Report `kit/transcribe.md`, committed by path.
