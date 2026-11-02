# Read-aloud: resume after barge-in, karaoke follow with phrase streaming, tap to pause

Budget: $15. Load the `minion` skill first, then `code` and `ui`. You own this one task end to end. The owner's words: [../recite-voice/requirements.md](../recite-voice/requirements.md), last section ("The owner's feedback once read-aloud was heard", 2026-11-01 20:34). Read-aloud now works on the owner's phone (Android Chrome, https://monorepo.lew42.com).

**Code you start from** (read the readmes first: `public/framework/audio/Recite/readme.md`, `doc/`):
- `audio/Recite/Recite.js`: state `idle | loading | playing | paused | heard` ("heard" = paused by barge-in). Around line 183 it pauses when the owner's line arrives.
- `audio/Recite/BargeIn.js`: barge-in follows the Dictate mic's level.
- `audio/Recite/ReciteBar.js`: the one-line control on the bar.
- `audio/Recite/ReciteHighlight.js`: the karaoke playhead.
- `ext/drawer/Sheet.js`, `read_aloud()`: which session's replies are read. Bump `READ_ALOUD_V` on every change there.

## Build, in this order: one worktree, one commit per piece, one merge per piece

Make the worktree with `node Server/worktree-up.mjs read-aloud-next`.

1. **(a) Resume after barge-in.** Today the interrupt works but reading never comes back.
   - Once the owner goes quiet (no mic speech for about 1.5 s, and no new line), resume where it stopped: the sentence that was cut, from its start.
   - If the owner's line was a new question (it ends in "?" or a reply to it is coming), drop the old reply and read the new one when it arrives.
   - Add a resume control on the bar (ReciteBar) while the state is `heard` or `paused`.
2. **(c) Karaoke follow + phrase-level streaming.** They share the word timing.
   - **Start sooner:** begin speaking after the first phrase (a comma or clause, or about 3 words) of a streaming reply, not the whole sentence. Keep the queue in order, so nothing is spoken twice or skipped.
   - **Follow the voice:** while reading, keep the line being read visible in the chat. If the sheet is not fully open, scroll its content so the line moves down with the voice, and highlight the words or phrase being spoken.
   - **Hand back the scroll:** if the owner scrolls by hand, stop following until the next reply.
3. **(b) Tap the text being read** to pause it; tap again to resume.

## Prove it (each piece, before its merge)

- Extend `audio/Recite/Recite.test.mjs` for the state logic (resume, question drops the old reply, phrase splits, no double or skipped phrase).
- Take headless shots at 400x860 (phone) and 1200, of the sheet half open while a long reply is read, showing the highlight and the scroll position moving. Put them in `shots/` here and read them yourself. Recite has a demo page at `/framework/audio/Recite/`.
- Review: `node Server/review.mjs <this dir> <worktree path>`. Answer every finding as a `{"review":{"answer":{"n","reply"}}}` line in this dir's `task.jsonl` (`node .claude/hooks/append.mjs`).
- Then `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree path> --review-dir <this dir>`. `node Server/smoke.mjs` must show no FAIL.
- Docs current in the same commit: `audio/Recite/readme.md` and `doc/`.

**Report** after each merge, to `mastermind-dictation-v3`, in 3 lines: what changed, the proof, what is next.

**Never:** restart or kill any server or Servex, start or stop recite-server, run `python`, drive the owner's tabs, `git stash`, or `git add` the generated `files.jsonl` (commit by exact path). Log progress in this dir's `task.jsonl`. Resolve, don't park: decide, and write the alternative beside it.

## New order (2026-11-01 20:45, from vscode-mastermind after the owner's notes)

The owner's notes: [owner-notes-2026-11-01-2040.md](../owner-notes-2026-11-01-2040.md), item 4. After (a) resume lands, build **ECHO next, ahead of (c) karaoke**: the read-aloud voice leaks into the mic, fires barge-in falsely ("Up things" at 20:35:13 stopped a reply) and writes phantom lines ("Thank you." at 20:35:43). One merge, the cheapest sure wins (plan.md item 6):
- while Recite plays (and ~1.5 s after), drop any heard text that fuzzy-matches the sentence being read or the recent read text (most of its words appear there); log each drop, never send it;
- drop Whisper finals on near-silent audio (the mic level is already measured);
- a blocklist of known Whisper phantoms ("Thank you.", "Thanks for watching", "you", etc.) dropped when they arrive alone;
- `echoCancellation: true` (and noiseSuppression) in getUserMedia;
- barge-in fires only on heard text that does NOT match the reply being read.
Prove it with a test that feeds read text back in as heard text (dropped, no barge-in) and an unrelated owner line (sent, barge-in fires). Then (c) with phrase streaming, then (b).

`mastermind-ink-check` now builds in `worktree/views-fix` (the guess colour, V2 live text, paragraph breaks in `ux/Dictate/` views and the send path); if your echo work and its paragraph work touch the same file, agree with it by message first.

## Highlight drops out (2026-11-01 20:47, the owner via vscode-mastermind)

The owner likes the word-by-word highlight. The bug: it sometimes vanishes for whole sentences or chunks, then comes back a sentence or two later. Build this **after echo, ahead of (c) karaoke** (they share `audio/Recite/ReciteHighlight.js`). One merge.
- Log first: when the spoken sentence can't be found in the bubble, write a `highlight: not found` trace with both texts (the spoken one and the bubble's text near the playhead) to the phone's log, so the phone itself proves the cause.
- The likely causes, to confirm from that trace: text-prep or markdown (links, icons, mention chips) changes the spoken text so it no longer matches the DOM; or the bubble re-renders while the reply streams and drops the highlight's node.
- Fix the cause: match on normalized text (or map the prepared text back to DOM offsets), and re-find the node after a re-render instead of holding a stale one.
Prove it with a test reply holding a link, a mention chip and markdown, re-rendered mid-read: every sentence stays highlighted, no `not found` traces.

## Turn-taking, one playback model with (a) resume (2026-11-01 20:48)

The owner's notes, items 11–12: [owner-notes-2026-11-01-2040.md](../owner-notes-2026-11-01-2040.md). Build (a) resume, queueing and turn-taking as **one change, one merge**:
- a new reply QUEUES behind the one being read and never replaces it; only an owner barge-in stops playback;
- never START a reply while the owner is speaking: hold it until about 1.5 s of quiet;
- if the owner speaks mid-reply: stop, keep the rest queued, resume after quiet (unless their line asks something new, which drops the rest).
Echo matching (above) is what makes "the owner is speaking" trustworthy, so do echo in the same change or the merge right after. The order is now: (a)+queue+turn-taking → echo → highlight dropout → (c) karaoke with phrase streaming → (b) tap to pause.
Prove it with a test: two replies arriving back to back play in order; a reply arriving mid-speech waits for quiet; a barge-in stops, then resumes the rest.

## No flood, prioritise, resumable bubbles (2026-11-01 21:01)

The owner's notes, items 13–18: [owner-notes-2026-11-01-2040.md](../owner-notes-2026-11-01-2040.md). Simple items first.
- **Prove "never starts while I speak"** in the queue merge: the owner still heard a reply start mid-speech. The test feeds mic speech, then a reply arriving, and asserts no playback until quiet.
- **No flood:** queued replies release only after about 2–3 s of quiet (one quiet window, not 1.5 s). The one most relevant direct answer (the reply to the owner's latest line) plays first. Agent updates collapse into one spoken line, "I have an update on X, tap to hear it", instead of each being read. Fold this into the current queue change if it is small; otherwise it is the next merge, ahead of echo.
- **Resumable bubbles:** tap an old bubble to continue reading from its last spoken word.
- **Parked (back burner, do not build):** paced word streaming (phrase-level start in (c)) and heard-only context. Karaoke follow and the highlight stay; Chatterbox waits, Kokoro is fine.

## Folded in (2026-11-01 21:08): owner items 20–22, no new merges

- **Played flag (item 20), in the queue merge:** each reply carries played/unplayed, kept across a reload (e.g. a localStorage set of message ids, or a `played` line), so a reload never re-reads a played reply and never skips an unplayed one.
- **Tap a bubble to play, tap to pause/resume (item 21), in the (b) merge, with resumable bubbles:** links inside the bubble keep working. The tap ignores clicks on `a`, mention chips and buttons.
- **Raise the mic threshold while read-aloud plays (item 22), in the echo merge:** a higher level gates send/barge-in while playing and ~1.5 s after, so coughs and the leaking voice don't fire. Name the factor as a setting.

## Folded in (2026-11-01 21:11): owner items 23–26, no new merge before (c)

- **Subtle lit words (item 24), in the highlight-dropout merge** (same file, `ReciteHighlight.js`): the bubble text is muted while it waits; each word lights up as it is read and STAYS lit. That is the visible "read" marker; item 20's played flag stays in the data only.
- **Tap a card (item 25) is item 21:** it is already in the (b) merge.
- **One bubble-UI merge after resumable bubbles:** a voice toolbar per bubble (item 26), above or below it, with big targets the right thumb reaches, in place of the tiny bottom-left play button; and a dropdown chevron on the voice name in `ReciteBar` (item 23; "heart" reads as a like button), styled like the light-mode selects.
- Item 27 (a tooltip on the person icon) goes to `mastermind-ink-check`; it lives in the Dictate bar, not in Recite.

**Order now:** (a)+queue+turn-taking (+ no flood if small) → no flood + prioritise (if not folded in) → echo → highlight dropout (+ lit words) → (b) tap to pause → resumable bubbles → bubble toolbar + voice chevron → (c) karaoke follow, without phrase streaming.

## Folded in (2026-11-01 21:18): owner items 31–33, no new merge

The owner's notes: [owner-notes-2026-11-01-2040.md](../owner-notes-2026-11-01-2040.md), items 31–33.
- **Replay (items 31–32), in the resumable-bubbles merge:** long replies never get heard because the owner's new speech interrupts them, and tapping an old bubble does nothing today. Tapping an old bubble replays it from its last spoken word. Generate the audio again on demand (Kokoro), do not store it; name a setting (`replay_audio: "regenerate" | "keep"`) with regenerate as the default, and say in the readme what "keep" would cost.
- **Per-bubble controls (item 33, revises item 26), in the bubble-UI merge:** play/pause and back 10 s are the two main controls; the targets need NOT be big. Optional, only if cheap: tap a spot in the text to jump there.
