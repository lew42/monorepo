# Live — the one-screen presentation of what you and the voice agent are discussing now

Open [/live/](/live/). It shows only the current topic, your latest ask refined into structure while you talk. **The voice agent (caller `voice-app`) is the only author; it clears the page when the topic changes. Agents never post findings, "Heard" or summary cards here** (their output stays in `task.jsonl`, session logs and module docs): [doc/presentation.md](doc/presentation.md).

- `page.js` + [`Live.js`](Live.js): draws the page, then tails `page.jsonl` live (with a phone-safe poll fallback).
- `page.jsonl`: the log the page tools append to; never hand-write it. History stays in the file; `{"content":{"clear":true}}` only blanks the screen.
- [doc/notes.md](doc/notes.md): why it is a page.js and page.jsonl together, and the phone-stream fixes.
