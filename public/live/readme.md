# Live — the one-screen presentation of what you and the voice agent are discussing now

Open [/live/](/live/). It shows only the current topic, your latest ask refined into structure while you talk. **The voice agent (caller `voice-app`) is the only author; it clears the page when the topic changes. Agents never post findings, "Heard" or summary cards here** (their output stays in `task.jsonl`, session logs and module docs): [doc/presentation.md](doc/presentation.md).

- `page.js` + [`Live.js`](Live.js): draws the page, then tails `page.jsonl` live (with a phone-safe poll fallback).
- `page.jsonl`: the log the page tools append to; never hand-write it. History stays in the file; `{"content":{"clear":true}}` only blanks the screen.
- [doc/notes.md](doc/notes.md): why it is a page.js and page.jsonl together, and the phone-stream fixes.

## The feed (2026-10-16)

`/live/` is a feed of white preview cards on light gray, newest on top. Each card shows `preview` (else `title`); a tap opens `/live/?card=<id>` with the full `text` (back and reload work). Render: `Live.draw()` builds a `Live.Card` (a small `Page`) per item and calls its stock `preview()` → `preview_card()` (Previews.js); `Card.full()` renders the whole card. Add one with `page_add` on `/live/`:
`{"type":"part-card","id":"example","title":"Full title","preview":"Short label","text":"Full **markdown** body"}`; `page_set {"<id>":{"preview":"…"}}` retitles. `after: "<id>"` places a card under another.
