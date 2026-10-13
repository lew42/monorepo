# Dictate — a mic button that always shows what is happening

State = which engine is listening and what it has heard so far, remembered between
renders — the graduation rule `Filter` and `Tags` already followed, applied to a
microphone. Built 2026-09-19 to replace `ext/Ask/mic.js`'s button, whose failures were
silent: the owner pressed 🎤, the browser's own recording light came on, and nothing
ever appeared — no error, no clue why.

**What the owner asked, merged and checked** (open first): [`doc/asks.md`](doc/asks.md). **Try it on your phone** (talk, watch the five stages land on the session page): [`doc/try-it.md`](doc/try-it.md).

**Class architecture of the voice UI** (which class owns what, what is a copy of what): [`doc/voice-architecture.md`](doc/voice-architecture.md). **`VoiceStrip`** is the compact panel Refine and the demo below use; **mobile**: [`doc/mobile-socket-2026-10-09.md`](doc/mobile-socket-2026-10-09.md).

- Moved verbatim to [doc/readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md): usage, design and mechanics in full.

## Also here (readme audit, 2026-10-13)
- [playground](./playground/) — The dictation playground — a full-bleed, live diagram of a dictation session
- [surfaces](./surfaces/) — Surfaces
- [v1](./v1/)
- [variants](./variants/) — Dictate variants — the same mic, a different look (or, once, a different mic)
- [workspace](./workspace/)
