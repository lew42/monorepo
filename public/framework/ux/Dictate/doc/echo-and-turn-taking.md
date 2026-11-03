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

## The other options, and when each wins

- **Mute the mic while reading** (`track.enabled = false`). Fully stops echo, but kills barge-in (interrupting a reply by talking). Best as an optional "speakers" mode; headphones users keep the mic open.
- **Better echo cancellation:** the browser's `echoCancellation` is already on; a second pass would need the played audio as a reference signal, which is a larger build. Wins only if matching by words proves too weak.
- **Drop by words alone, with no timing:** simpler, but a real reply of yours that repeats the assistant's words would be dropped. The audio-time overlap in step 1 is what prevents that.

## Not done yet

Nothing above is built; this page is the proposal. Order of value: 1, then 2 (they fix different halves: echo gets in, and the reply talks over the owner), then 3, 4 as needed.
