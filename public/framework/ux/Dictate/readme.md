# Dictate — a mic button that always shows what is happening

**Every voice and chat surface, one page** (screenshots, who answers, the flow, the 30-second first reply): [`surfaces/`](./surfaces/) · [long form](doc/surfaces.md).

**The voice assistant** (one assistant places each sentence as you talk: same paragraph, own paragraph, own card; the plan and why the chat jumps): [`doc/voice-assistant.md`](doc/voice-assistant.md).

**Talking to the mastermind from the Claude app's voice mode** (why not a browser bridge; a connector instead): [`doc/voice-bridge.md`](doc/voice-bridge.md).

State = which engine is listening and what it has heard so far, remembered between
renders — the graduation rule `Filter` and `Tags` already followed, applied to a
microphone. Built 2026-09-19 to replace `ext/Ask/mic.js`'s button, whose failures were
silent: the owner pressed 🎤, the browser's own recording light came on, and nothing
ever appeared — no error, no clue why.

**What the owner asked, merged and checked** (open first): [`doc/asks.md`](doc/asks.md); **next brief**: [`doc/next.md`](doc/next.md). **Try it on your phone** (talk, watch the five stages land on the session page): [`doc/try-it.md`](doc/try-it.md).

**Is the raw Whisper reply saved?** Yes, every reply, to the Servex `whisper-raw` log: [`audio/Whisper/doc/raw-log.md`](/framework/audio/Whisper/doc/raw-log.md).

**How fast is the first reply?** Measured hop by hop, before and after: [`doc/latency.md`](doc/latency.md).

**Class architecture of the voice UI** (which class owns what, what is a copy of what): [`doc/voice-architecture.md`](doc/voice-architecture.md). **`VoiceStrip`** is the compact panel Refine and the demo below use; **mobile**: [`doc/mobile-socket-2026-10-09.md`](doc/mobile-socket-2026-10-09.md).

**Streaming UI and context cards** (live 3-line text area, sentences moving up, reference pills, context cards; being designed in Figma): [`doc/streaming-ui.md`](doc/streaming-ui.md).

- Moved verbatim to [doc/readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md): usage, design and mechanics in full.

## Also here (readme audit, 2026-10-13)
- [playground](./playground/) — The dictation playground — a full-bleed, live diagram of a dictation session
- [surfaces](./surfaces/) — every voice and chat surface on one page
- [v1](./v1/)
- [variants](./variants/) — Dictate variants — the same mic, a different look (or, once, a different mic)
- [workspace](./workspace/)
- [MicIndicator](MicIndicator.js) — the one mic-state badge every voice surface shows

## More

- **Sentence-per-send on the shared composer** (2026-10-16): `composer({ per_sentence: true })` makes each finished sentence leave the box while the next is still heard; the Refine page uses it, this page's `chat()` keeps the default (pause mode already sends each sentence as a bubble). Proof: `ext/Refine/test/composer-flow.mjs` and a fake-mic run of this page.

- [`doc/sessions.md`](./doc/sessions.md) — one rolling voice session or many: the New session button tested, the decision (one rolling session is the direction, the button stays), and the dry-run chunker `chunk-session.mjs`
- [`doc/architecture.md`](./doc/architecture.md) — the decisions that hold today, and why
