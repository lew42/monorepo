# Why read-aloud starts, stutters and restarts

**Short answer.** The restart is not the mic hearing itself, and it is not two plays racing. It is `Recite.final()` reading a finished reply a second time when the finished text is not exactly what the stream said. The phone's log shows it happening on the old code; the current code still reads the reply twice (it no longer cuts the first one off).

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

Run `mvynq0e6fox`, reply "My answer was right. We use Kokoro only,…" is the same pattern 0.5 s into the reply: `playing 0` at 27.596 s, then `reply line` (state playing) at 28.109 s, then `speak asked sentence 0` (state loading) in the same millisecond. Each reply that streamed shows it. A reply that had no stream (for example "I sent `vscode-mastermind` two turn-taki…") shows no restart.

What is missing from every restart: no `barge: …` trace, no `paused by your line`, no `replay`, no `thinking cue`. The mic did not pause anything. The new `speak asked 0` always comes in the same millisecond as the first `reply line`, which is the settled line arriving after the stream.

## The cause

The phone was running an older Recite than the one in the repo. The `page check` trace in those four runs says `sheet_v: 2026-11-01e` and `Recite.js` body 22657 bytes; that is the file at commit `6fef75ea6` (2026-11-01 18:50), 22657 bytes exactly. The first phone run on newer code is `mvzmzf66v43` (`sheet_v 2026-11-01f`, 39694 bytes), and it never played a reply.

On that old code, `final()` ended with `this.read(text)`, and `read()` is `stop()` + `queue()`. The chain, in the order of the log:

1. The stream plays sentences 0, 1, 2… as they finish.
2. The stream ends (`partial("")`): `live` is cleared and `done` gets `norm(<the last streamed text>)`.
3. The settled line arrives. Its text is not exactly the last streamed text (for example it is longer, or the stream was a truncated prefix), so `done.has(key)` is false and `live` is null.
4. `final()` calls `read(text)`: `stop()` empties every chunk and `queue()` starts the whole reply from sentence 0. Audible: the reply starts, runs a few seconds, then starts over from the top.

## What the current code still does

Since the "queue, never replace" change (`dictation-v3`, 2026-11-01), step 4 is `queue(text)` instead of `read(text)`: nothing is cut off, but the whole finished reply is queued behind the sentences already queued, so the first sentences are read twice. Reproduced headlessly on current `Recite.js` (`playback-stutter.test.mjs`, case "longer settled line", run against the main tree before the fix): after a stream of three sentences and a longer final, the chunks are

```
["My answer was right.", "We use Kokoro only, nothing else is used here.", "The second thing is simple",
 "My answer was right.", "We use Kokoro only, nothing else is used here.", "The second thing is simple and short.", "A third sentence follows."]
```

The first three are read twice.

## Suspects ruled out

- **(a) BargeIn hearing Kokoro's own voice.** No barge-in trace sits next to any restart in any of the 26 owner runs. It is still a risk in its own right (any loud sound pauses playback first and checks later), which is what the `words` setting is for.
- **(b) Two plays racing.** There is one `<audio>`, and every play bumps a token; nothing raced. The duplicate comes from the chunk list, not from play.
- **(c) Thinking cue or a second reply.** No `thinking cue` trace within the window; and the restart replays the same reply, not another.
- **Duplicate delivery.** Each reply arrives 3-4 times (Sheet's wire, chat's wire, and the 1.5 s file poll). That is normal and handled by `done`; it is not the cause.

## The fix

Proof in [requirements.md](requirements.md). In short: `final()` now compares the finished text with what the stream already queued, sentence by sentence, and queues only the part that was not read.

## Left to watch on the phone

- In `words` mode reading keeps going while Whisper checks the sound, so Whisper hears Kokoro's voice mixed with the owner's. The echo filter (own sentences) covers most of it; if a real interruption is missed while the reply is loud, that is the place to look.
- A stream that ends mid-sentence ("…is simple") and a settled line that finishes it ("…is simple and short.") now reads only the rest ("and short."), found by the fresh reviewer ([review.md](review.md)); a settled line that is a genuinely different text is still queued whole, never cutting the first off.
