# Dictate — a mic button that always shows what is happening

**Dictation stopped, or the AI never answered? Open the Debug tab** (each step from the mic to the AI's answer, live, with the real error; what the stall was and how it was fixed): [`doc/debug-tab.md`](doc/debug-tab.md).

- `class DictateHealth` (the eight lights, [DictateHealth.js](DictateHealth.js); every error from every stage lands here, and `window` errors and rejections too)
- `class DictateDebug` (the view, [DictateDebug.js](DictateDebug.js))
- `chat.js` calls `report.init(session)` ([ext/Chat/v2/report.js](/framework/ext/Chat/v2/report.js)) once the voice session id is known.
- The Debug panel in the phone sheet has a resize handle whose height survives a reload ([`SheetPanel.tabs_grip`](/framework/ext/drawer/doc/sheet.md#the-debug-panel-handle-2026-10-25)).
- Proofs `test/errors.mjs` (every error is caught and shown), `test/stall.mjs`, `test/debug-tab.mjs`, `test/deltas.mjs`, `test/refresh.mjs` (reload, then dictate: [`doc/debug-tab.md#refresh-then-dictate`](doc/debug-tab.md#refresh-then-dictate)).
- Errors: [failures.jsonl](/framework/ux/Dictate/failures.jsonl) (dev only: git-ignored, written on this machine at the first failure).

**Whisper said the end twice?** A tail of 5+ words repeating the span before it is dropped, a short real repeat stays: `ux/Dictate/repeat.js`, proof `test/repeat.mjs`, [`mic-notes`](/framework/ext/Chat/doc/mic-notes.md#whisper-repeats-collapse_repeat).

**Words vanished and came back?** The flicker, its cause and the fix: your words become the sent piece in the draft's spot the moment they leave it (`ComposerMic.take_out` → `Widget.show_out`), proof `test/flicker.mjs`: [`doc/flicker.md`](doc/flicker.md).

**Map of every dictation piece** (mic, Whisper, cleaners, chat, voice session, assistants; the duplicates and the plan): [doc/map.md](doc/map.md).

**Every voice and chat surface, one page** (screenshots, who answers, the flow, the 30-second first reply): [`surfaces/`](./surfaces/) · [long form](doc/surfaces.md).

**How Dictate, Refine and tasks connect** (one spoken sentence, from the mic to a task line in the page's feed): [`doc/refine-dictate-tasks.md`](doc/refine-dictate-tasks.md). **The dictation redesign, mocks first** (five ways to lay out the controls, and the pick): [the variants page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/sheet-dictation-mocks/variants/index.html).

**Where a voice session lives** (2026-10-19): in the central session store like every other session, `/framework/ai/sessions/YYYY/MM/DD/<v-id>/session.jsonl`, with `kind: "voice"` on its first line and in Servex's `sessions.json`; older ones are still flat at `<home>ai/<v-id>.jsonl` ([`ext/Session`](/framework/ext/Session/)).

**The voice assistant** (one assistant places each sentence as you talk: same paragraph, own paragraph, own card; the plan and why the chat jumps): [`doc/voice-assistant.md`](doc/voice-assistant.md).

**The phone sheet** (✦ at the bottom of every page under 52em): `class Sheet` in [`ext/drawer/Sheet.js`](/framework/ext/drawer/Sheet.js), mounting the one [`chat.js`](chat.js). One layout at every height: a head, a full-width chat well, the mic footer; it opens over the page and snaps open at 90%. **Its connection log:** every lost, retried or restored link to Servex is a `src: "connection"` line in [the Whisper log](/framework/audio/Whisper/log/) (`ai/whisper/bucket.jsonl`). How and why: [ext/drawer/doc/sheet.md](/framework/ext/drawer/doc/sheet.md). Proofs: `test/sheet-steps.mjs` (a shot per 40 px of drag), `test/reconnect.mjs` (a Servex restart).

**`DictationBar`** (the phone sheet's one big mic that says its state, a Type button, no Send; switch back in one line): [`doc/refine-dictate-tasks.md#the-bar`](doc/refine-dictate-tasks.md).

**Talking to the mastermind from the Claude app's voice mode** (why not a browser bridge; a connector instead): [`doc/voice-bridge.md`](doc/voice-bridge.md).

State = which engine is listening and what it has heard so far, remembered between
renders — the graduation rule `Filter` and `Tags` already followed, applied to a
microphone. Built 2026-09-19 to replace `ext/Ask/mic.js`'s button, whose failures were
silent: the owner pressed 🎤, the browser's own recording light came on, and nothing
ever appeared — no error, no clue why.

**What the owner asked, merged and checked** (open first): [`doc/asks.md`](doc/asks.md); **next brief**: [`doc/next.md`](doc/next.md). **Try it on your phone** (talk, watch the five stages land on the session page): [`doc/try-it.md`](doc/try-it.md).

**Is the raw Whisper reply saved?** Yes, every reply on every surface, by `log_whisper()` into the [Whisper](/framework/audio/Whisper/) bucket; watch them arrive on that page ([doc/demo.md](/framework/audio/Whisper/doc/demo.md)). History: [`audio/Whisper/doc/raw-log.md`](/framework/audio/Whisper/doc/raw-log.md).

**When is the smart assistant woken?** Not per sentence: on a pause, a question or name, or every N sentences; the two knobs are per session: [`doc/wake-policy.md`](doc/wake-policy.md).

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

- **Wide screens** (2026-10-17): [`page.js`](./page.js) wraps the Overview in `.ux-dictate-page`; below 1920 it is the single 40em column it always was, from 1920 up the workbench sits on the left and the rest flows into 28em CSS columns (`Dictate.css`), like [/tasks/](/tasks/). Empty share at 3440: 0.74 before, 0.42 after. The alternative, a Browse view, needs more code.

- **Sentence-per-send on the shared composer** (2026-10-16): `composer({ per_sentence: true })` makes each finished sentence leave the box while the next is still heard; the Refine page uses it, this page's `chat()` keeps the default (pause mode already sends each sentence as a bubble). Proof: `ext/Refine/test/composer-flow.mjs` and a fake-mic run of this page.

- [`doc/sessions.md`](./doc/sessions.md) — one rolling voice session or many: the New session button tested, the decision (one rolling session is the direction, the button stays), and the dry-run chunker `chunk-session.mjs`
- [`doc/architecture.md`](./doc/architecture.md) — the decisions that hold today, and why

**The owner's direction, 2026-10-20: dictation on the website first** (one assistant, hands-free; a global named voice session with a session manager; the widget cleanup asks that never landed; the font flicker): [doc/owner-2026-10-20-dictation-first.md](doc/owner-2026-10-20-dictation-first.md).
