# Live — the one-screen presentation of what you and the voice agent are discussing now

Open [/live/](/live/). It shows only the current topic, your latest ask refined into structure while you talk. **The voice agent (caller `voice-app`) is the only author; it clears the page when the topic changes. Agents never post findings, "Heard" or summary cards here** (their output stays in `task.jsonl`, session logs and module docs): [doc/presentation.md](doc/presentation.md).

- `page.js` + [`Live.js`](Live.js): draws the page, then tails `page.jsonl` live (with a phone-safe poll fallback).
- `page.jsonl`: the log the page tools append to; never hand-write it. History stays in the file; `{"content":{"clear":true}}` only blanks the screen.
- [doc/notes.md](doc/notes.md): why it is a page.js and page.jsonl together, the phone-stream fixes, and the owner's direction (a two-way page, walk-through mode, UI-first).

## The feed (2026-10-16)

`/live/` is a feed of white preview cards on light gray, newest on top. Each card shows `preview` (else `title`); a tap opens `/live/?card=<id>` with the full `text` (back and reload work). Render: `Live.draw()` builds a `Live.Card` (a small `Page`) per item and calls its stock `preview()` → `preview_card()` (Previews.js); `Card.full()` renders the whole card. Add one with `page_add` on `/live/`:
`{"type":"part-card","id":"example","title":"Full title","preview":"Short label","text":"Full **markdown** body"}`; `page_set {"<id>":{"preview":"…"}}` retitles. `after: "<id>"` places a card under another.

## The blank slate, Now and the archive (2026-10-16)

`/live/` starts empty except for three cards that are **views**, so nothing on it needs an agent to rewrite it: **Now** ([`LiveNow.js`](LiveNow.js): what is in flight, the last landings and what waits, read from the session index and task logs), **Tasks** ([`LiveTasks.js`](LiveTasks.js): one line from the task system) and **Archive** (a link). The old cards are at [/live/archive/](/live/archive/) ([archive/readme.md](archive/readme.md)). The plan for every old card is in [doc/notes.md](doc/notes.md).

## Sessions (2026-10-19)

**A session is one cloud voice agent conversation** (the owner, 2026-10-19), with `/live/` as its screen; its log is `ai/sessions/YYYY/MM/DD/cloud-voice-agent/`. [/live/sessions/](/live/sessions/) lists sessions newest first, each opening as a page of its cards. ⚠️ The current view ([doc/sessions.md](doc/sessions.md)) still uses the older page-centric definition, "the cards between two `clear` lines of `page.jsonl`" — to be replaced once the session store lands ([Servex/ext/remote/doc/voice-logging.md](/framework/servex/remote/doc/voice-logging.md)). Decisions from the 2026-10-19 session: research first, don't rewrite; `item` tool = a live server-side instance taking `set(path, value)` deltas (leaning, not decided); evolving compaction, never whole-card rewrites; card buttons that write to disk are phase two. The discussion behind each: [the session log](/framework/ai/sessions/2026/10/19/cloud-voice-agent/session.md).

## The answer goes on a card (the owner, 2026-10-16)

When the owner asks a question, the voice agent puts the answer on `/live/` as a card first, says "take a look", and keeps the spoken reply to one or two sentences. A status answer ("what's running") is a card listing each agent's id, state, what it is on and its cost: shown, not spoken. The voice agent's copy of this rule is in [`RemoteMCP.js`](../../Servex/ext/remote/RemoteMCP.js) (it takes effect after a Servex restart).
