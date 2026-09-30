# The floor — don't reply while the owner is talking

Every entry the owner posts to the prompts log says whether they are **still talking**.
A responder (the fast assistant, a card's assistant) should **hold its reply while the latest
floor is `speaking`**, and answer once it is `done`.

The fast assistant (`Servex/agents/Assistant.js`, `heard()`) does exactly this. It holds each
`speaking` entry, then answers them all as one prompt on the next `done`, typed or floor-less
entry, or after 8 s with nothing new. Its prompt also gets the rhythm as one line, such as
`(paused 1.2 s, 0.4 s; spoke 6.1 s)`. Proof: [heard-test.txt](/framework/ai/2026-09-29/audio/next-clean-transcription/c-cues/heard-test.txt).

## On every entry

```json
{ "type": "prompt", "text": "…", "floor": "speaking",
  "cues": { "mic_on_at": "2026-09-30T01:57:44.333Z",
            "pauses": [ { "start": 623, "end": 1023, "ms": 400 }, { "start": 7003, "end": null, "ms": 990 } ],
            "speaking_ms": 5490 } }
```

- **`floor`**: `"speaking"` means the mic is still on and the owner went quiet for less than
  `done_after_ms` (1.5 s / 1500ms in `floor.js`), so more words may follow (a send in the middle
  of a dictation). `"done"` means the mic is off, or the owner has been quiet for `done_after_ms`
  or more. A typed message is always `"done"`, and never takes the cues: they wait for the next
  dictated entry (`via: "whisper"`).
- **`cues`**: only on an entry that came from the mic. A `{chat:{...}}` universal chat line (see
  `ext/Chat/readme.md`) gets `floor` stamped too, even if it came from voice, but never `cues` —
  `floor.js`'s `stamp()` treats it as a revision line, not a fresh dictation.
  - `pauses` lists every quiet stretch of `min_pause_ms` (300 ms in `floor.js`) or more since the
    previous entry. `start` and
    `end` are milliseconds since the mic turned on (`mic_on_at`). `end: null` means the pause
    was still going when the entry was sent. That pause is split at the send: the next entry
    reports only the rest of it, starting where it was cut, so no quiet is counted twice.
  - `speaking_ms` is the loud time since the previous entry.
  - Cues come from the Whisper engine only. The browser engine (Chrome's own recognizer) has
    no level meter and never reports quiet, so its entries carry no pauses.

## Mic on and mic off

When the mic turns on or off, one small line goes to the same log:

```json
{ "type": "floor", "state": "speaking" }     { "type": "floor", "state": "idle" }
```

Servex adds `at` when the line arrives. No reader of that log makes a card or a reply from
it: the fold ignores types it doesn't know, and the fast assistant only reacts to `prompt`.

## Where it comes from

[`ux/Dictate/floor.js`](/framework/ux/Dictate/floor.js): Dictate's own level meter feeds it (one
reading every 8 ms), and `post_prompt()` stamps both fields. So every composer gets them
without any code of its own, `ComposerMic` included. How the signals were chosen:
[`c-cues/research.md`](/framework/ai/2026-09-29/audio/next-clean-transcription/c-cues/research.md).
