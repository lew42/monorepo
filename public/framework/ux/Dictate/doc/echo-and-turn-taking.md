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

## Reading state, stale queued replies, and what the assistant remembers (asked 2026-11-03)

**Asked.** (a) The read-aloud highlight drifts out of sync, mostly when replies are queued. (b) While you dictate for minutes the assistant queues many small replies; when you stop, Recite reads the oldest first, so it talks about something you said minutes ago. Stale ones should be skipped or collapsed. (c) A state flag for "I am reading aloud", and a mute. (d) You do not want interim replies that get lost and read late: reply less until near the end, and make the assistant's memory match what you actually heard.

### The state flag: `reading`, from two marker lines

The marker above is extended from one line to two per reply, both `say` with `kind: "read"`: `{state: "start", re}` when the first sentence of a reply begins playing, and `{state: "end", re, heard, words, ms}` when it finishes or is cut. Servex keeps one flag per session, `s.reading = {re, since} | null`, set on start, cleared on end (or after the timeout in point 3 above). Everything else asks the flag instead of guessing:

- the pause cue does not fire and a finished reply is held while `s.reading` is set (the floor check and the reading check are one `if`);
- the echo drop knows the exact span a reply was playing;
- the brief gets one note line when it ends, as above;
- the page can draw it: a small "reading" state beside the Hold button, so you see what the assistant thinks is happening.

It is the same signal as the two server checks above, just named; no new mechanism. A page that never sends it (old tab) leaves the flag clear, which is today's behaviour.

### Mute

Already outlined in [read-aloud-and-hold.md](read-aloud-and-hold.md): read-aloud off (the voice is silent and no reading work is done) and Hold (no reply at all until you pause, tap, or ask). Together with the `reading` flag they are the whole mute story: Hold stops the assistant starting a reply, read-aloud off stops the voice, and neither needs the mic closed. Muting the mic itself is the different, blunter option under "other options" below.

### Stale queued replies: skip all but the newest

**Today.** `Recite.queue()` appends every reply to `chunks`; `ended()` plays the next chunk (`Recite.js:235`). So replies queued during a long dictation play oldest first. `drop_heard()` (:458) already cuts one reply out of the queue, but only one that was paused by barge-in.

**Proposed rule: when reading is about to start or continue, play only the newest whole reply that has not started; the older unstarted ones are skipped.** They stay in the chat (nothing is lost, you can tap one to replay it), they are just not read.

- **Where (client, `audio/Recite/Recite.js`):** a small `skip_stale()` called from `queue()` when a new reply (`!continuing`) arrives and from `check_wait()` just before `play(i)`. It splices out the chunks of every reply with a lower `reply` id than the newest, that has no chunk already playing or played, calls `mark_played(id)` (so a reload never reads it, the same call `settle_pending` uses), and reports each through the marker as `heard: "skipped"`. A reply being read right now is never cut; the newest waits behind it.
- **A reply waiting for quiet is replaced, not queued behind.** While `wait_at` is set (you are talking), a newer reply simply takes its place. This is the case you described: ten interjections during one dictation become one reply when you stop.
- **Also by age:** an unstarted reply older than about 30 s when you fall quiet is skipped even if it is the only one, since it answers a thing you said long ago. One knob (`stale_ms`, default 30 000), saved with the other Recite settings; set 0 to turn it off.
- **Server backup (`Sessions.js`):** the cue is already held while you speak (step 2), so on release the single seat writes one reply, not many. If more than one finished reply sat in `held`, `release()` writes the newest as a normal reply and the older ones with `speak: false`; `Recite.final()` skips a line carrying it. So a second device or an old tab obeys too.
- **Alternative: collapse them into one spoken line** ("three earlier replies, newest: …"). It reads more, and it still talks about old things; skipping wins unless you want a spoken recap. Alternative: play newest-first order of everything. Worse: it still reads the stale ones.
- **Test:** `test/stale-queue.mjs`: queue five replies while the mock mic is loud; fall quiet; assert exactly the newest played, the other four marked played and reported `skipped`, and a reply already playing is not cut.

### Highlight out of sync (not yet reproduced; causes found by reading `ReciteHighlight.js`)

I have not seen it drift, so these are the places it can, ranked by how likely they are with a queue. A test comes first (`test/highlight-queue.mjs`, two queued replies sharing an opening phrase, a bubble redrawn mid-sentence), then the fix.

1. **It lights the wrong bubble.** `find()` (:107) looks in the reply's own bubble only when the chunk carries a message id (`c.msg`). Some paths leave it empty (a reply queued by `queue_update()`, and a streamed reply until `tag_live` runs), so it falls back to a text search, newest match first (:115-117). Two queued replies that open alike ("I think…") can light the newer bubble while the older is read. Stale skipping removes most of these; the lasting fix is to set `msg` in every path that queues.
2. **A bubble redrawn under it.** The ranges are cached per sentence and rebuilt only when the key changes, the node disconnects, or a 300 ms retry fires (:76-90). A card that rebuilds whole (Chat V3 `update()`, and the assistant's moves) drops the lit words for up to a retry. The steady-display plan ([steady-display.md](steady-display.md): patch nodes, hold the assistant's moves until the pause) fixes the cause.
3. **Where it is, not how it is.** The lit sentence of a stale reply sits minutes up the chat, far from where you are looking, which reads as out of sync. Skipping stale replies fixes this too.
4. **The word is an estimate.** Kokoro gives no word times, so words share the sentence's seconds by letter count (`word_at`, :36): a long word or a pause makes the lit word a beat off. Not queue-related; to be fixed only if a real word timer ever exists.

### What the assistant remembers: heard-only context

**The ask.** When the assistant writes several paragraphs and only part is read aloud (you cut it, or it was skipped), its memory of what it said should match what you heard, so it does not build on words you never heard.

**What I could check.** The single seat's memory is its own model session; the log of what it wrote is `session.jsonl`. I have not checked whether the SDK allows rewriting a past turn of a live session (it very likely does not), so the design does not depend on it:

1. **Now: a correction note, no turn (cheap, with the marker).** On the next turn Servex opens with one line built from the `read` marker: `(heard: "<first words of your reply 1>…", in full. Your reply 2 "<first words>…" was NOT heard (skipped). Your reply 3 was cut after "<last heard words>"; the rest was NOT heard: treat it as unsaid.)`. About 30 tokens. This does not erase the unheard text; it tells the model to treat it as unsaid, which is what the owner asked it to remember.
2. **Later: rebuild, don't edit.** Whenever the seat is started fresh (a long session, compaction, a restart), Servex builds the opening context from `session.jsonl` and writes each of the assistant's replies as only the heard part (`heard` and `words` from the marker). So the memory is exactly what was heard, and the unheard remainder is gone for good. This is the "heard-only context" item in [single-voice-assistant.md](single-voice-assistant.md) ("Not built yet"); it needs the marker first.
3. **Why not erase in place:** it would mean editing the model's transcript file under it, which risks corrupting the session and is exactly the "never rewrite history" rule; and with replies now one short paragraph, most cut-offs lose a sentence or two, which the note in point 1 covers.

### One paragraph at a time, the next one started at the halfway point (asked 2026-11-03)

**Is it built?** No. You asked for it on 2026-11-02 and it is written down as "the next one is prepared about halfway through reading the current one" in [reply-pacing.md](reply-pacing.md), which says "not built yet". Checked in code: nothing in `audio/Recite/` or `Servex/agents/Sessions.js` asks for a second paragraph; the only trace is the brief's wording ("write ONE short paragraph"). So today the assistant writes one paragraph per cue and, if it wants more, nothing triggers it.

**The design: the half-way marker is the trigger.** It is one more state on the read marker, so there is one mechanism, not two.

1. The reply is one paragraph, shown whole as soon as it is written.
2. Recite starts reading it and posts `{state: "start", re}` (above).
3. When about half of the paragraph has been read, Recite posts `{state: "half", re}`. How half is counted: characters in the paragraph's chunks that have finished playing, plus the current chunk's share from `ReciteHighlight.fraction()` (`ReciteHighlight.js:45`, the audio clock the highlight already uses), divided by the paragraph's total characters. Characters, not words: no word timer exists and the sums are cheap. It fires once per paragraph.
4. Servex receives `half` and gives the single seat one cue: `(half read: write the next paragraph only if more is worth saying, otherwise end empty)`. Its text becomes the next paragraph on the same card (as reply-pacing says). The turn runs while the first half is still being read, about 6 to 10 seconds of speech for a short paragraph (an assumption from 2.5 words a second; the real turn time is to be measured first), so the next paragraph is ready when the first ends.
5. Recite plays the next paragraph after a gap (`para_gap_ms`, about 1 s, the pause reply-pacing.md asks for) so you can cut in.
6. At most two paragraphs exist unread at any moment: the one playing and the one prepared. Nothing piles up.

**Where it stops, using the same marker.** The assistant does not get the `half` cue when: you are speaking (the floor check), read-aloud is off (no marker is ever sent, so a paragraph stays one paragraph; the next comes only if you ask), or the reply was cut before the half. If you cut in during paragraph 1, or after paragraph 2 was prepared, the prepared one is skipped (stale rule above, reported `skipped`) and the heard-only note tells the assistant it was not heard. That is the whole link to "erase the unread": under paragraph pacing there is at most one unheard paragraph to forget, and the note in "What the assistant remembers" covers it, so the later rebuild is less urgent.

**Cost and trade-off.** One extra short turn per extra paragraph, on a seat whose context is already cached; the output total is the same or lower, since a long answer is no longer written in full when you will cut in. The risk is a turn that runs late, so the next paragraph is not ready when the first ends: then the reading simply stops at the end of paragraph 1 and the next one is read when it lands, as today. Alternative: write the whole answer at once, split it into paragraphs in code, and let Recite play them with the gap. It needs no extra turns and no marker, but it writes everything you might never hear, which is what you want to avoid. Recommendation: the half marker, after `start` and `end` exist (the three states are one small client change, one `say` kind).

**Test:** `test/half-marker.mjs` with a fake Recite clock: a two-chunk paragraph posts `half` once, after the first chunk and a share of the second; a cut before half posts none; read-aloud off posts none. `Sessions.single.test.mjs` gains: a `half` marker opens exactly one cue, and none while the floor is `speaking`.

### Reply less until near the end (asked as "option 1")

It needs no new code beyond what is already proposed: the brief now says do nothing per sentence and speak only to a real question; Hold (read-aloud-and-hold.md) says do not even open the cue until a long pause; and step 2 above holds the cue while the floor is `speaking`. The one extra setting worth adding: the pause before the cue fires (`single_pause_ms`, 1 s today) becomes a per-session value (try 3 s) so a breath inside a long dictation does not already count as the end. Options: A, keep 1 s and rely on Hold; B, 3 s by default (fewer interjections, the reply to a quick question arrives 2 s later). Recommendation: B plus the stale-skip, since it needs no button press.

### Cutting in: interrupts, the start grace, and the one-second silence (asked 2026-11-03, built 2026-11-03)

**Built:** `Recite.cancel_unheard()` (audio/Recite/Recite.js), `BargeIn.cut()` (audio/Recite/BargeIn.js), `BargeIn.grace_ms`/`quick_hold_ms`/`chunk_started()`/`last_speech_at`/`silence_ms()`, `Recite.resume_after_cut`, `Recite.min_quiet_ms()` and `Recite.on_read`, wired in `ux/Dictate/chat.js` to `report.read()` (`ext/Chat/v2/report.js`) — all below are now live, default on. Tests: `Recite.test.mjs` ("real speech cancels the whole queue", "resume_after_cut = true keeps the old manners", "does not report a reply already played to the end"), `playback-stutter.test.mjs` ("cutting in: …", "the start grace: …") and `ext/Chat/v2/report.test.mjs`. Open items are called out in each paragraph below, not repeated here.

**Why the assistant said "listening" and "no question is open" (found and fixed).** The pause cue read `(pause: reply now only if a question is open)`, which asks the model to weigh that condition and say the answer. Servex also streamed a cue turn's words as they came, so filler showed. Now the cue is a bare `(pause)`; the brief carries the rule (never filler, never speak while the owner talks, short after the pause, assume you are not done); a single-seat cue turn that is only filler or punctuation is dropped before anyone sees it (`is_filler` in `Servex/agents/Sessions.js`, test `Sessions.single.test.mjs`); and its replies are shown whole at the turn's end. A harness reminder to "say what you are doing" cannot be turned off from here, so the brief names it as not the owner, and "-" is the sanctioned way out. Needs a Servex restart to take effect.

**Interrupts, built.** `BargeIn.owner_spoke()` cancels the whole queue the instant real speech is confirmed — the wire line, or the own-mic Whisper check (`cut()`, which calls `Recite.cancel_unheard()`): every reply, playing or still queued, is dropped and reported through `on_read`; no auto-resume by default (`resume_after_cut`). It also fires while a reply is held by turn-taking (`wait_at`, nothing playing yet) through the wire-line path. **Open:** the local own-mic volume trigger (`hear()`, not `owner_spoke()`) still only fires while Recite is "playing" — it does not yet cancel a reply that is merely held (`wait_at`); and Servex does not drop or `speak:false` a reply still in flight on its own side when the floor becomes speaking (the client-side cancel is the one built; a second device or an old tab is not covered).

**The start grace, built.** `BargeIn.grace_ms` (1000 ms) blocks the fast volume trigger for that long after a chunk starts (`chunk_started()`, called from `Recite.play()`/`speak_browser()`), but only when the owner was quiet as it began — `chunk_grace_skip` skips the grace entirely when they were already talking, and `quick_hold_ms` (120, not the ordinary `hold_ms` 250) cuts fast instead. A Whisper-confirmed non-echo word (the wire-line path) still cuts in at once, grace or not.

**One second of silence before anything is read, built.** `BargeIn.last_speech_at` (updated every frame in `hear()`, whatever `this.state` is) replaces "is the level low right now": `Recite.start_or_hold()`/`check_wait()` hold until `BargeIn.silence_ms()` clears `Recite.min_quiet_ms()` (at least 1000 ms, never less than `turn_wait_ms`), whether or not the ear (`barge.on`) is on. **Open:** the server-side pause cue (`Sessions.js` `single_cue`) still fires 1 s after the last sentence without checking the floor, as noted above in "Hold the assistant's reply while the owner is talking, on the server" (step 2) — that part of the design is unbuilt.

**Telling the assistant where it was cut off, built — differently than first designed.** `Recite.on_read({id, reply, chunk, sentence, heard: "cut"|"skipped", words})` fires from `cancel_unheard()`; `ux/Dictate/chat.js` wires it to `report.read(ev)` (`ext/Chat/v2/report.js`), which posts a `context` note (not a `say` with `kind: "read"`, and not a Servex-side state machine) — a plain sentence (`read_note()`) for the assistant's next turn, never a prompt. **Open:** nothing is erased from what the assistant remembers saying — the note tells it to treat the rest as unsaid, but the heard-only rebuild ("What the assistant remembers", above) is unbuilt.

**A reply that starts while you are still talking must die at once.** If the floor is "speaking" (or the mic level is over the threshold) when a reply starts, or it starts and you carry on, there is no start grace: the cut-in uses a short hold (about 120 ms, not 250) and goes through `cancel_unheard()`. The grace exists only to stop the reply's own first word tripping the mic when you were quiet; it is skipped whenever you were already talking. With the one-second silence rule above this should be rare, so the quick cut is the backstop.

## The "How loud counts as talking" slider: what it really does (checked 2026-11-03)

It is the barge-in threshold (`BargeIn.threshold`, `audio/Recite/BargeIn.js:31`, `effective_threshold()` :141), the mic level above which the reading is **paused**. It is a sensitivity, not an echo filter: **lower = more sensitive**, so the assistant's own voice leaking into the mic crosses it, the reading pauses itself at once, and a paused reply makes no more sound to leak. That is why sliding it all the way down seemed to cure the echo. The cost: the assistant is cut off by its own voice and any small noise, and `speaking()` (:136) is true so new replies are held. Raising it was the wrong advice for the echo that reaches the chat: the slider never touches the send path (`take_out()`), so the echoed words still get sent whatever it says. Raising it only stops the false pauses. The real fix stays step 1 above (drop echoed lines at the send). The slider's tooltip now says this.

**It also gates when a queued reply starts (checked later the same day; updated 2026-11-03).** One number, two jobs, both through `BargeIn.speaking()` (level above `effective_threshold()`): (1) while a reply plays, a level above it for `hold_ms` pauses the reading (`hear()`, `trigger()`) — this one DOES need the ear toggle on (`barge.on`); with it off, nothing pauses an already-playing reply. (2) when a reply arrives while nothing plays, `Recite.start_or_hold()`/`check_wait()` hold on `BargeIn.silence_ms()` (the one-second rule, above) — this one no longer needs `barge.on`: a fresh reply always waits for quiet, whatever the ear says. So **low slider = queue until quiet, strictly** (a small sound counts as you talking, so the wait is long and replies rarely start over you); **high slider = replies start while you talk**, since ordinary talking does not reach the bar, and you must then shout to pause one. The cost of low: in a noisy room the level may never fall under the bar, so replies wait for ever (`noise_floor` adapts only up to about 1.15x). Both effects are why low "queued properly" and high "interrupted you". The tooltip says so, and the right default is low-to-middle, not high; the lasting fix for the leak is still the send-side echo drop.

## Another option: recognise the owner's voice (speaker identification; asked 2026-11-03)

**What the owner remembers:** WhisperX has diarization (who spoke when) built in, and runs a few extra models to do it. No doc or agent note in the repo mentions WhisperX or diarization (searched `public/framework` and `Servex`); the only mention is the owner's own words in session `v-z0jonhy`. What follows is general knowledge, not something measured on this machine.

- **What WhisperX is:** Whisper plus a forced-alignment model (word times) plus a diarization model (pyannote; needs a Hugging Face token and a licence click-through). It works on a whole recording in a batch, typically on a GPU. Cost and latency: three to four extra models to load, roughly seconds per clip, and a Python stack beside the local whisper-server. It does not fit this pipeline, which re-sends a growing guess every 0.9 s and wants a sentence out within a second or two.
- **Diarization labels, it does not know you.** It says "speaker 1, speaker 2" per clip; on one-sentence clips the grouping is unreliable, and nothing says which label is the owner without an enrolment.
- **The lighter form is speaker verification:** enrol the owner once (a few seconds of speech, kept as one small voice embedding), then check each clip against it and drop a clip that does not match (the read-aloud voice, a TV, another person). One small model, about tens of milliseconds per clip, no extra Whisper pass. This can work, because the read-aloud voice is a synthetic Kokoro voice, very unlike a person's. Costs: a model to ship and run (server side, the only place Python or an ONNX runtime can live: `ext/Chat` must stay plain browser JS), an enrolment step, and a possible miss when you whisper, are ill, or use another microphone. Phone and desktop mics would each need a check.
- **Recommendation:** not WhisperX. Build the cheap send-side drop first (step 1: the clock plus 60% word match against what was read, which already covers the case we have: our own voice, whose words we know). Add speaker verification only if that proves too weak, mainly for other people's voices, which the word match cannot see. Read-aloud off ([read-aloud-and-hold.md](read-aloud-and-hold.md)) removes the leak entirely at no cost.

## The other options, and when each wins

- **Mute the mic while reading** (`track.enabled = false`). Fully stops echo, but kills barge-in (interrupting a reply by talking). Best as an optional "speakers" mode; headphones users keep the mic open.
- **Better echo cancellation:** the browser's `echoCancellation` is already on; a second pass would need the played audio as a reference signal, which is a larger build. Wins only if matching by words proves too weak.
- **Drop by words alone, with no timing:** simpler, but a real reply of yours that repeats the assistant's words would be dropped. The audio-time overlap in step 1 is what prevents that.

## Not done yet

Nothing above is built; this page is the proposal. Order of value: 1, then 2 (they fix different halves: echo gets in, and the reply talks over the owner), then 3, 4 as needed. The stale-queue skip (`skip_stale`) is small, client only, and fixes the most visible annoyance, so it can go first if you want one quick win; the `reading` flag and the heard-only note ride on the marker. The read-aloud marker above is built with step 2 (it is the end signal step 2 waits for), and its server echo backup comes after step 1 proves itself.
