# Live — the owner's voice-work feed

Open [/live/](/live/). A title line, then the feed, newest first. Each dictation's summary and its results land here, written by the voice mastermind through `page_log`, `page_add` and `page_set` with `path: "/live/"`.

- `page.js` + [`Live.js`](Live.js): draws the page with almost no chrome, then tails `page.jsonl` live.
- `page.jsonl`: the log those tools append to; never hand-write it.
- [doc/notes.md](doc/notes.md): why it is a page.js and page.jsonl together.
