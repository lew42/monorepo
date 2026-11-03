# How Whisper hears you: one timeline

Whisper (the speech-to-text server) only ever sees a **recorded clip**, never a live stream. The page cuts your talking into **segments**, and for each segment it keeps asking Whisper "what is in the clip so far?". The answers while you talk are **guesses** (`interim`); the answer when you stop is the **final**. Numbers below are the code's defaults (`ux/Dictate/Dictate.js:813-824`, `ext/Chat/Mic.js:11-31`); the gear panel can change them.

## Where the page decides speech or silence

`Dictate.on_level` (`Dictate.js:443`): every microphone level reading is smoothed, and **louder than `silence_at` (0.01, a rough guess) means speech**; that sets `has_speech` and `last_loud_at`. Everything else below is a clock reading those two. A clip with less than `min_speech_ms` (120 ms) of speech is never sent, because Whisper invents "Thank you." from silence ([silence.md](silence.md)).

## One example: a 3.4 s sentence, then a long monologue

A timer (`heartbeat`, every 0.2 s, `Dictate.js:309`) asks three questions in order: has the speaker been quiet for `pause_ms` (0.7 s)? has this segment run `max_segment_ms` (15 s)? has it been `resend_ms` (0.9 s) since the last guess?

```
seconds   0     1     2     3     4     5     6   ...   15 (cap)      then
          |-----|-----|-----|-----|-----|-----|---------------|
you:      "Yeah, so it seems that it works."  (quiet)
segment:  [=============== one segment, buffer grows ==========] cut
guess 1         ^1.0 s   Whisper gets the clip 0 to 1.0 s      -> "Yeah, so"
guess 2               ^2.0 s   clip 0 to 2.0 s (the window GROWS) -> "Yeah, so it seems"
guess 3                     ^3.0 s  clip 0 to 3.0 s             -> "Yeah, so it seems that it"
you stop at 3.4 s. guess at 4.0 is skipped (quiet more than 0.3 s: the final is next)
FINAL                              ^4.2 s  0.7 s of quiet passed: clip 0 to 4.2 s
                                            -> "Yeah, so it seems that it works."
next segment starts at ZERO at 4.2 s: the buffer was emptied (cut), nothing carried over
sent to the chat                                 ^ about 2 s after the final text arrived
```

- **Guesses** come about 1.0 s apart (0.9 s wait, noticed on the next 0.2 s tick). Each re-sends the whole segment from its start, so the clip is longer every time and the words may change. A guess is skipped if the last one is still being answered, or you have already gone quiet. Guesses are drawn gray and are **not written to `session.jsonl`**.
- **The final** is sent when you have been quiet 0.7 s. Its text replaces the guess and goes into the box (`commit`, `Dictate.js:521`). Still not written to `session.jsonl`.
- **The cap:** if you talk without a 0.7 s gap, the segment is closed at 15 s as a final anyway (`reason "forced"`) and the next one starts at zero. There is no overlap, so a word spoken exactly at the cut can be split or lost.
- **The line in `session.jsonl`** is written only when the box is **sent** (`Mic.send_screen`, `Mic.js:673`): everything on screen goes out in one message when you have been quiet `paragraph_pause_ms` (2 s) after a finished sentence, or `pause_send_ms` (2 s) otherwise, counted from when the last final's text arrived. Then `Session.say()` posts it, and Servex writes the `{chat}` line and grows the Prompt's `raw` ([pipeline.md](pipeline.md), SEND and SAVED). Safety cuts: 1200 characters or 60 s of waiting words go out at the next sentence end.
- After that, the fast assistant hears it once you have been quiet 2.5 s, and the smart assistant by its wake rule ([wake-policy.md](wake-policy.md)).

So one spoken sentence is about **3 guesses, 1 final, 1 line in the file**, and the chat shows it about 6 s after you start the sentence, about 2.8 s after you stop.
