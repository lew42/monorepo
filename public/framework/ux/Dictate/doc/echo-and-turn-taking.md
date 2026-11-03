# Echo and turn-taking: the assistant's voice must never become the owner's words (proposal, 2026-11-03)

**The problem.** The read-aloud voice (Recite) leaks from the speakers into the mic, Whisper transcribes it, and it is sent as the owner's sentence. The assistant then answers itself. Seen on session `v-z0jonhy`.

## What already exists, and why it is not enough

- `MicStream.constraint()` asks the browser for echo cancellation (`audio/MicStream/MicStream.js:72`). On a phone speaker it is weak.
- `BargeIn.echo(text)` (`audio/Recite/BargeIn.js:287`) drops a line that is 60%+ words of the sentence being read, and `echo_threshold_mult` raises the loudness floor 1.6x (`:43`). **These only stop BargeIn from pausing the reading. The line still reaches the chat**: the send path never calls them (`ext/Chat/Mic.js` `take_out()` :841 and `post_held()` :858). This is the open item written down in [Recite architecture](/framework/audio/Recite/doc/architecture.md) and never built.
- The guard window is `echo_guard_ms` = 1500 ms after playback stops (`Recite.js:46`), and the match looks at only the chunks around the one playing (`BargeIn.js:291`). Whisper answers seconds after the sound, so the echoed line often arrives after the window has closed, or after a later chunk has started.
- Recite holds a new reply while the owner talks (`start_or_hold`, `Recite.js:157`) but only when `barge.on`; with barge-in off it plays at once (`:159`).
- On the server, the single seat's pause cue (`Sessions.js` `single_cue`, ~:716) fires `single_pause_ms` (1 s) after the last sentence and never looks at the floor. The reply is written the moment the turn ends (`heard()`, ~:1574). Only the fast seat's reply is held while the owner is speaking (`speaking(s)` and `held`, ~:1618).

## The design, in the order to build it

1. **Drop echoed lines at the send, by the clock and by the words** (the real fix, client). In `ext/Chat/Mic.js` `take_out()`, beside the duplicate check, call an injected `is_echo(text, said_at)` (same style as `on_out`; `chat.js` wires it to `Recite.shared`, so `ext/Chat` never imports `audio/`). Recite keeps a short list of what it has played: each sentence with the time it started and ended playing, for the last ~30 s. A line is echo when its audio time overlaps a playing span AND 60%+ of its words are in the last three replies read (not just the chunk playing). Dropped lines are traced (`DictateHealth.event`) so they are visible. Needs the line's audio start time: the mic already stamps `said_at` and the segment start.
2. **Hold the assistant's reply while the owner is talking, on the server.** In `single_cue`'s `fire`, if `this.speaking(s)` re-arm instead of opening the cue; in `set_floor`, when the floor becomes `done`, re-arm the cue. In `heard()`, when a single seat's reply finishes while `speaking(s)`, put it in `this.held` like the fast seat's, and `release()` writes it at `done`. All in `Sessions.js`, small.
3. **Hold playback the same way, always.** `Recite.start_or_hold` should hold on the mic's level whether or not barge-in is on (the level meter runs either way), and wait the 2.5 s quiet it already uses.
4. **Stopgap, one line:** raise the Dictate mic's own start-of-speech level while `recite.echo_active()`, like `effective_threshold()` does for barge-in; and widen `echo_guard_ms` to 4000. Cheap, but it also makes the owner harder to hear while the voice plays.

## The read-aloud finished marker (asked 2026-11-03)

**The gap.** The assistant never learns what was read aloud, when, or whether you heard it all; Servex only knows it wrote a reply. The ask: a cue that is invisible (like the pause cue), not per word (that would make a turn per word), and ideally one per reply or paragraph.

**The marker: one line per reply, when the last sentence of that reply has finished playing, or when playback was cut short.** Recite already knows this moment: `ended()` calls `settle_pending(i)` (`audio/Recite/Recite.js:235`, `:410`), which marks a reply played once its last chunk ends. A new injected callback `on_read({id, at, heard, words, ms})` fires there (and where a barge-in or a skip drops the rest), wired in `chat.js` like `on_out`, so `audio/` stays unimported by `ext/Chat`. `chat.js` posts it with the existing diagnostic path: `say` with a new `kind: "read"` (`Sessions.js` `say()` :1104 allows speech, error, click, context today; one more word, and `report.js` already posts this way). Shape: `{re: <the reply's at>, heard: "full" | "partial" | "skipped", words: <how many heard>, ms: <how long it played>}`.

- `heard: "partial"` with the words heard is what barge-in produces: the assistant learns exactly where you cut it off, which is the "heard-only context" item in [single-voice-assistant.md](single-voice-assistant.md) ("Not built yet").
- **Per reply, not per sentence.** A reply here is one short paragraph already ([reply-pacing.md](reply-pacing.md)), so "per paragraph" and "per reply" are the same marker. A per-sentence marker would add a message for every sentence read; skip it.

**What Servex does with it (all in `Sessions.js`, no model turn of its own):**

1. **Writes one data line** `{read: {at, re, heard, words, ms}}` to `session.jsonl`; the page's views ignore a key they do not draw (to check in `ext/Chat` replay before building).
2. **Hands it to the assistant as a note, not a turn.** The single seat's next turn (a sentence, or the pause cue) opens with `(read aloud: your reply "<first 6 words>…" finished, heard in full)` or `(…cut off after 14 words)`, the way `notes` already carries a page report to the smart seat (:1111). Zero extra turns, about 20 tokens, nothing reprocessed.
3. **Tells the cue when reading is going on.** From the moment a single-seat reply is written until its `read` marker (or a timeout of about 1.5 x the words at 2.5 per second, plus 5 s, so a closed tab never blocks it), `single_cue` re-arms instead of firing and the next reply waits: this is step 2 above, with a real end signal instead of a guess.
4. **Backs up the echo drop on the server.** The marker also gives the span the reply was playing. A speech line whose `said_at` falls inside that span (or within the guard after it) and that shares 60%+ of its words with the reply is dropped or flagged `echo: true` in `say()`, so a client that missed it (an old tab, another device) is still covered. The client check (step 1) stays the main one: it sees the audio clock.

**Cost and risk.** One small POST per reply, no model turn, no change to what you see. If the marker never arrives (tab closed, offline) the timeout in point 3 lets the assistant carry on; a missing marker only means "no cue about reading", as today.

## The other options, and when each wins

- **Mute the mic while reading** (`track.enabled = false`). Fully stops echo, but kills barge-in (interrupting a reply by talking). Best as an optional "speakers" mode; headphones users keep the mic open.
- **Better echo cancellation:** the browser's `echoCancellation` is already on; a second pass would need the played audio as a reference signal, which is a larger build. Wins only if matching by words proves too weak.
- **Drop by words alone, with no timing:** simpler, but a real reply of yours that repeats the assistant's words would be dropped. The audio-time overlap in step 1 is what prevents that.

## Not done yet

Nothing above is built; this page is the proposal. Order of value: 1, then 2 (they fix different halves: echo gets in, and the reply talks over the owner), then 3, 4 as needed. The read-aloud marker above is built with step 2 (it is the end signal step 2 waits for), and its server echo backup comes after step 1 proves itself.
