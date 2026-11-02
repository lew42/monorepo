# Why read-aloud starts, stutters and restarts

**Short answer.** The restart is not the mic hearing itself and not two plays racing.

- `Recite.final()` read a finished reply a second time when the finished text differed from the stream.
- The phone log shows it on the old code.
- The current code still read the reply twice.

## What the owner's phone log says

Source: `ai/whisper/bucket.jsonl`, the Android 10 `K` runs, filtered by `owner-phone-watch.mjs`. Time 0 is the first `reply line`.

Run `mvynq0e6fox`, reply "I sent the highlight bug…". The stream starts at -4.98 s and sentence 0 plays at -4.14 s, so by 0 s the owner has heard the reply for four seconds:

```
-4.978  reply streaming  text "##"
-4.622  speak asked      sentence 0   (state loading)
-4.141  playing          sentence 0
-2.907  playing          sentence 1   (state playing)
 0.000  reply line       state playing   "I sent the highlight bug to `vscode-mast"
 0.000  speak asked      sentence 0   (state loading)       <- chunk 0 asked again, same millisecond
 0.627  spoke            sentence 0   2.816 s (the NEW sentence 0, a different length from the streamed one)
 0.692  playing          sentence 0                          <- the reply starts over
 3.216  spoke            sentence 1   9.6 s   (streamed sentence 1 was 3.26 s: this is a different list of sentences)
```

A second reply in the same run shows the same pattern; a reply with no stream shows none.

Missing from every restart: any `barge: …`, `paused by your line`, `replay` or `thinking cue` trace. The mic paused nothing. The new `speak asked 0` always lands in the same millisecond as the first `reply line`, the settled line arriving after the stream.

## The cause

The phone ran an older Recite than the repo. Its `page check` trace says `sheet_v: 2026-11-01e` and `Recite.js` 22657 bytes, exactly the file at commit `6fef75ea6`. The first run on newer code (`mvzmzf66v43`, 39694 bytes) never played a reply.

On that old code, `final()` ended with `this.read(text)`, and `read()` is `stop()` + `queue()`. The chain, in the order of the log:

1. The stream plays sentences 0, 1, 2… as they finish.
2. The stream ends (`partial("")`): `live` is cleared and `done` gets `norm(<the last streamed text>)`.
3. The settled line arrives. Its text is not exactly the last streamed text (for example it is longer, or the stream was a truncated prefix), so `done.has(key)` is false and `live` is null.
4. `final()` calls `read(text)`: `stop()` empties every chunk and `queue()` starts the whole reply from sentence 0. Audible: the reply starts, runs a few seconds, then starts over from the top.

## What the current code still does

Since "queue, never replace" (`dictation-v3`, 2026-11-01), step 4 is `queue(text)`: nothing is cut off, but the whole reply is queued behind the sentences already queued, so the first ones are read twice. Reproduced headlessly (`playback-stutter.test.mjs`, case "longer settled line"):

```
["My answer was right.", "We use Kokoro only, nothing else is used here.", "The second thing is simple",
 "My answer was right.", "We use Kokoro only, nothing else is used here.", "The second thing is simple and short.", "A third sentence follows."]
```

The first three are read twice.

## Suspects ruled out

- **(a) BargeIn hearing Kokoro.** No barge-in trace beside any restart in 26 owner runs. Still a risk: the `words` setting is for it.
- **(b) Two plays racing.** There is one `<audio>`, and every play bumps a token; nothing raced. The duplicate comes from the chunk list, not from play.
- **(c) Thinking cue or a second reply.** No `thinking cue` trace in the window.

## The fix

Proof in [requirements.md](requirements.md). In short: `final()` now compares the finished text with what the stream already queued, sentence by sentence, and queues only the part that was not read.

## Left to watch on the phone

- In `words` mode Whisper hears Kokoro mixed with the owner; the echo filter covers most of it. A missed real interruption while the reply is loud is where to look.
- A stream cut mid-sentence ("…is simple") finished by the settled line ("…is simple and short.") reads only the rest ("and short."), found by the [review](review.md). A genuinely different settled text is queued whole.
