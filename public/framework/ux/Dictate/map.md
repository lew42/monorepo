# Map: ux/Dictate/

The mic widget, voice chat and every voice surface on the site. Model: [core/Item/readme.md](/framework/core/Item/readme.md)'s Map, commit `59fcd6650`.

## ux/Dictate/

| File | What it does |
|---|---|
| [Dictate.js](./Dictate.js) · [Dictate.css](./Dictate.css) | `class Dictate extends View`: the mic button itself — state, start/stop, the fetch-to-whisper-server path, `commit(text, reason)` (`:717`) where a finished sentence lands |
| [capture.js](./capture.js) | the mic turned into 16kHz mono WAV bytes (the one format whisper-server reads without ffmpeg); `audio/MicStream`'s buffer code is still a copy of this, not an import |
| [pcm-worklet.js](./pcm-worklet.js) | the `AudioWorkletProcessor` `capture.js` uses for raw PCM samples |
| [chat.js](./chat.js) | mounts a chat view onto a voice session: `Session.start()` (`:113`), `Session.say()` (`:236`), follows the live wire and hands events to `Recite.shared.from_wire()` (`:439`) |
| [Widget.js](./Widget.js) · [Widget.css](./Widget.css) | `class Widget` (Chat V1): the raw-log bubble thread — every owner sentence stays visible, `show_task()`, `Thread.replay_ctl()` |
| [DictateHealth.js](./DictateHealth.js) | the eight lights: every error from every stage (and `window` errors/rejections) lands here |
| [DictateDebug.js](./DictateDebug.js) · [DictateDebug.css](./DictateDebug.css) | the Debug tab view: each step from mic to AI answer, live, with the real error |
| [DictateDocs.js](./DictateDocs.js) · [DictateDocs.css](./DictateDocs.css) | the Docs tab: this readme and the module's docs, rendered in place (proof `test/docs-tab.mjs`) |
| [ChatStatus.js](./ChatStatus.js) (+ `ChatStatus.test.mjs`) | the one-word status line beside the mic: `listening` / `sending` / `agent working` / `speaking` |
| [ChatSettings.js](./ChatSettings.js) (+ `ChatSettings.test.mjs`) | the "Chat settings" panel opened by the ⚙: Whisper knobs, what to send after, read aloud, interruption |
| [ChatDefaults.js](./ChatDefaults.js) (+ `ChatDefaults.test.mjs`) | reads and saves the settings panel's defaults (session or global) |
| [DictationBar.js](./DictationBar.js) · [DictationBar.css](./DictationBar.css) | the phone sheet's one big mic that says its state, a Type button, no Send |
| [MicIndicator.js](./MicIndicator.js) · [MicIndicator.css](./MicIndicator.css) | the one "mic is open" badge every voice surface shows (red dot, "listening", a level bar) |
| [VoiceStrip.js](./VoiceStrip.js) · [VoiceStrip.css](./VoiceStrip.css) | the compact panel Refine and a demo use: wraps `Dictate` + `Connection` |
| [Connection.js](./Connection.js) · [Connection.css](./Connection.css) | the connection-state strip (uses `audio/v1/LevelMeter`) |
| [WhisperLog.js](./WhisperLog.js) · [WhisperLog.css](./WhisperLog.css) | a re-export shim: the real class moved to `audio/Whisper/WhisperLog.js`; this path stays so old imports keep working |
| [floor.js](./floor.js) | "who has the floor": a small shared record of mic-on/level/mic-off, so an assistant can tell mid-sentence from finished |
| [phantom-gate.js](./phantom-gate.js) | `should_drop_phantom`: the send-side gate dropping a stock Whisper hallucination before it posts (reuses `audio/Recite/BargeIn`'s checks, never a second blocklist) |
| [repeat.js](./repeat.js) | drops a tail of 5+ words that repeats the span just before it (Whisper's looping-reply bug) |
| [push-to-talk.js](./push-to-talk.js) · [FloatingMic.css](./FloatingMic.css) | the hold-a-hotkey mic for the dev shell: a small floating mic shown while held (`Hotkeys`, `MicIndicator`, `chat.js`) |
| [chunk-session.mjs](./chunk-session.mjs) | dry-run CLI: where a session file would be cut into archive chunks (silence gap or line cap); writes nothing yet |
| [page.js](./page.js) | this module's own Overview page (`.ux-dictate-page`, the wide-screen workbench + columns layout) |
| [mastermind.md](./mastermind.md) | the brief for a voice session's own standing mastermind (role readme, not a doc) |
| [VoiceChat/](#voicechat) | one plugin host per Recite: Interrupt, ReadAloud, SendAfter, ThinkingCue |
| [surfaces/](#surfaces) | every voice and chat surface on one page, with screenshots |
| [playground/](./playground/readme.md) | a full-bleed, live diagram of a dictation session |
| [variants/](./variants/readme.md) | four working Dictate widgets side by side (v1, Cards, …) |
| [v1/](./v1/) | today's box, unchanged — one of the four variants |
| [demo/](./demo/) | demo pages for this module (no readme yet) |
| [workspace/](./workspace/) | a workspace folder (no readme yet) |
| [test/](./test/) | every proof listed in the readme's "Watch out" (`test/mic-release.mjs`, `test/sentences.mjs`, `test/active-session.mjs`, `test/raw-stays.mjs`, …) |
| [tasks/](./tasks/) | this module's own task folders |
| [ai/](./ai/) | this module's own `ai/log.jsonl` |
| [doc/](#doc) | the design docs (below) |
| [files.jsonl](./files.jsonl), [weight.jsonl](./weight.jsonl), [improvements.jsonl](./improvements.jsonl), [inbox.jsonl](./inbox.jsonl), [failures.jsonl](./failures.jsonl) | file census; page weight; skill-improvement notes; notes left on the page; dev-only error log |
| [readme.md](./readme.md) | this module's index |

## doc

One `.md` design doc each (full list; see the readme's own links above and in "More" for which are read first): [architecture.md](./doc/architecture.md), [asks.md](./doc/asks.md), [background-work.md](./doc/background-work.md), [chat-notes.md](./doc/chat-notes.md), [chat.md](./doc/chat.md), [debug-tab.md](./doc/debug-tab.md), [decisions.md](./doc/decisions.md), [docs-tab.md](./doc/docs-tab.md), [echo-and-turn-taking.md](./doc/echo-and-turn-taking.md), [fast-and-smart.md](./doc/fast-and-smart.md), [flicker.md](./doc/flicker.md), [handover.md](./doc/handover.md), [https-lan.md](./doc/https-lan.md), [latency.md](./doc/latency.md), [locked-phone-and-pwa.md](./doc/locked-phone-and-pwa.md), [map.md](./doc/map.md) (the dictation-piece map, not this file), [mobile-socket-2026-10-09.md](./doc/mobile-socket-2026-10-09.md), [next.md](./doc/next.md), [notes.md](./doc/notes.md), [owner-2026-10-20-dictation-first.md](./doc/owner-2026-10-20-dictation-first.md), [phantom-gate.md](./doc/phantom-gate.md), [pipeline.md](./doc/pipeline.md), [placement-defaults.md](./doc/placement-defaults.md), [Playground-notes.md](./doc/Playground-notes.md), [principles.md](./doc/principles.md), [question-cards.md](./doc/question-cards.md), [read-aloud-and-hold.md](./doc/read-aloud-and-hold.md), [readaloud-voice-vs-owner.md](./doc/readaloud-voice-vs-owner.md), [readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md), [refine-dictate-tasks.md](./doc/refine-dictate-tasks.md), [refined-asks.md](./doc/refined-asks.md), [reply-pacing.md](./doc/reply-pacing.md), [sessions.md](./doc/sessions.md), [settings-plugins.md](./doc/settings-plugins.md), [settings.md](./doc/settings.md), [silence.md](./doc/silence.md), [single-voice-assistant.md](./doc/single-voice-assistant.md), [status-icons.md](./doc/status-icons.md), [steady-display.md](./doc/steady-display.md), [streaming-ui.md](./doc/streaming-ui.md), [surfaces.md](./doc/surfaces.md), [thinking-sound.md](./doc/thinking-sound.md), [try-it.md](./doc/try-it.md), [turn-taking.md](./doc/turn-taking.md), [upload.md](./doc/upload.md), [voice-architecture.md](./doc/voice-architecture.md), [voice-assistant.md](./doc/voice-assistant.md), [voice-bridge.md](./doc/voice-bridge.md), [wake-policy.md](./doc/wake-policy.md), [whisper-log.md](./doc/whisper-log.md), [whisper-timeline.md](./doc/whisper-timeline.md), [whisper.md](./doc/whisper.md), [widget-notes.md](./doc/widget-notes.md), [widget.md](./doc/widget.md); plus [file/](./doc/file) (a stray generated folder, see `orphans.txt`) and [files.jsonl](./doc/files.jsonl) (the file census).

## VoiceChat/

| File | What it does |
|---|---|
| [VoiceChat.js](./VoiceChat/VoiceChat.js) (+ `VoiceChat.test.mjs`) | `class VoiceChat`: one per Recite, a [`core/Plugin`](/framework/core/Plugin/readme.md) host for Interrupt / ReadAloud / SendAfter / ThinkingCue |
| [plugins/](./VoiceChat/plugins/) | one file per plugin (`SendAfter`, `ReadAloud`, `Interrupt`, `ThinkingCue`), registered in `plugins/index.js` |
| [files.jsonl](./VoiceChat/files.jsonl) | file census |
| [readme.md](./VoiceChat/readme.md) | this class's index |

## surfaces/

| File | What it does |
|---|---|
| [page.js](./surfaces/page.js) | the page: nine surfaces, each with a fresh screenshot, who answers and what it writes |
| `*.png` | the nine surfaces' screenshots: `card-chat-1920.png`, `card-sidebar-1920.png`, `devshell-1920.png`, `drawer-ai-1920.png`, `drawer-debug-1920.png`, `drawer-dictation-1920.png`, `drawer-switch-session-1920.png`, `floating-mic-1920.png`, `live-card-1920.png`, `live-fold-1920.png`, `refine-1920.png`, `session-page-1920.png`, `sheet-400.png`, `sheet-collapsed-400.png` |
| [sheet-steps/](./surfaces/sheet-steps/) | a shot per 40px of the sheet's drag |
| [ai/](./surfaces/ai/) | this page's own `ai/log.jsonl` |
| [failures.jsonl](./surfaces/failures.jsonl), [files.jsonl](./surfaces/files.jsonl) | dev-only error log; file census |
| [readme.md](./surfaces/readme.md) | this page's index |
