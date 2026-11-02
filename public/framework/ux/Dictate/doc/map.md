# Dictation map — every piece, where it lives, and what to do about the duplicates

What *runs* behind a spoken sentence (jobs, models, costs, readers): [background-work.md](background-work.md).

**What this is:** one page that finds any piece of the dictation system in one click: the mic, Whisper, the cleaners, the chat box, the voice session and the assistants. Made 2026-10-20 as a **plan only**: nothing was moved or changed. The proposals at the bottom wait for the owner's approval ([decisions](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/)).

How the facts were found: an import-graph script over `public/`, `Server/`, `Servex/` (importer counts, and which files the real site reaches from `public/app.js`), `git log` for dates, and `grep` for each `file:line` proof. The script and its raw output live in the task folder's history; rerun it before acting on a count.

---

## 1. The chain — one spoken sentence, mic to reply

This is the path the **real** chat box takes (the ✦ sheet on a phone, the AI tab of the desktop drawer, the Dictate page demo):

```
 mic ──► whisper-server ──► raw text ──► clean (×2!) ──► chat box ──► voice session ──► assistant(s) ──► reply on screen
```

| Step | Class that does it | File |
|---|---|---|
| open the mic, cut sound into chunks | `Capture` (+ the `DictatePCM` worklet) | [ux/Dictate/capture.js](../capture.js), [pcm-worklet.js](../pcm-worklet.js) |
| send a chunk to whisper-server, get raw text | `Dictate.start_whisper()` → POST `/inference` | [ux/Dictate/Dictate.js](../Dictate.js) :408, :536 |
| keep whisper-server running | Servex `Process.Whisper` (the dev server's own starter is switched off with `NO_WHISPER=1`) | `Servex/Servex.js` :390, `Server/plugins/Whisper.js` |
| watch whisper-server (up? ping? every answer) | `Whisper`, `WhisperSession`, `WhisperLog` | [audio/Whisper/](/framework/audio/Whisper/) |
| clean, path 1: one model call at a level | `Dictate.revise_chunk()` → `Revise.run()` → Servex `/api/tidy` → `tidy.js` | Dictate.js :705, [ux/Revise/Revise.js](../../Revise/Revise.js), `Servex/agents/tidy.js` |
| clean, path 2: instant rules + live outline | `ComposerMic` → `RefineSystem.post_live()` → Servex `/api/refine/live` → `LiveRefine` | [ext/Chat/Mic.js](../../../ext/Chat/Mic.js) :223, :236, [ext/Refine/RefineSystem.js](../../../ext/Refine/RefineSystem.js) :30 |
| the box you type or talk into | `composer()` + `ComposerMic extends Dictate` | [ext/Chat/Composer.js](../../../ext/Chat/Composer.js), Mic.js :108 |
| the whole chat (log + box), one mount for every surface | `Widget`, mounted by `chat()` | [ux/Dictate/Widget.js](../Widget.js), [ux/Dictate/chat.js](../chat.js) |
| the bubbles | `speak()`, `patch_piece()`… | [ext/Chat/Chat.js](../../../ext/Chat/Chat.js) |
| one voice session (start, say, floor, live replies over SSE) | `Session` (functions, no class) | [ext/Session/Session.js](../../../ext/Session/Session.js) |
| wake the assistants for a session | `Sessions` (Servex) | `Servex/agents/Sessions.js` |
| assistant 1: places each sentence (`voice-assistant`) | spawned at Sessions.js :1109 | skill `.claude/skills/voice-assistant/` |
| assistant 2: the smart one (`session-smart`) | spawned at Sessions.js :1129 | `Servex/agents/roles.js` |
| the phone shell around it | `Sheet`, `DictationBar` | [ext/drawer/Sheet.js](../../../ext/drawer/Sheet.js), [ux/Dictate/DictationBar.js](../DictationBar.js) |

The same chain, told by surface, with screenshots: [surfaces/](../surfaces/) and [refine-dictate-tasks.md](refine-dictate-tasks.md).

---

## 2. Every piece

"Importers" counts files that import it: **code** = a real module, **page** = a `page.js`, **demo** = tasks/test/variants/v1/playground/proof files. "Site" = ✅ when the live site reaches it from `public/app.js` (a real surface uses it); ⬜ = only demo and doc pages reach it.

### Mic and audio — `ux/Dictate` and `audio/`

| File | Class | One job | Importers (code/page/demo) | Site | Last commit |
|---|---|---|---|---|---|
| [ux/Dictate/capture.js](../capture.js) | `Capture` | opens the chosen mic, glues worklet chunks into a WAV | 3 (2/0/1) | ✅ | 10-12 |
| [ux/Dictate/pcm-worklet.js](../pcm-worklet.js) | `DictatePCM` | hands the main thread raw sound (audio thread) | loaded by URL | ✅ | 09-21 |
| [audio/MicStream/MicStream.js](/framework/audio/MicStream/) | `MicStream` | the same job as Capture, for the audio/ demos | 12 (1/4/7) | ⬜ | 10-12 |
| audio/MicStream/pcm-worklet.js | `Lew42PCM` | a copy of Dictate's worklet under another name (its own line 6 says so) | loaded by URL | ⬜ | 09-29 |
| [audio/Recorder/Recorder.js](/framework/audio/Recorder/) | `Recorder` | record, play back, save a clip | 3 (0/2/1) | ⬜ | 09-29 |
| audio/Part.js | `Part` | base class for every audio/ tool | 7 (4/0/3) | ⬜ | 09-30 |
| [audio/Voice/Voice.js](/framework/audio/Voice/) | `Voice` | speaks text aloud (TTS) | 1 (0/1/0) | ⬜ | 10-05 |
| [ux/Dictate/MicIndicator.js](../MicIndicator.js) | `MicIndicator` | the one "mic is open" dot + level bar | 5 (5/0/0) | ✅ | 10-13 |
| [ux/Dictate/floor.js](../floor.js) | — | who has the floor (speaking / done) | 5 (5/0/0) | ✅ | 10-04 |
| [ux/Dictate/push-to-talk.js](../push-to-talk.js) | — | hold a key to talk | 2 (2/0/0) | ✅ | 10-13 |
| core/Page/card/log/whisper/ClipMic.js | `ClipMic` | plays a saved clip into the mic pipeline (test page) | 1 (0/1/0) | ⬜ | 09-30 |

### Whisper — speech to text

| File | Class | One job | Importers | Site | Last commit |
|---|---|---|---|---|---|
| [ux/Dictate/Dictate.js](../Dictate.js) | `Dictate` | **the live engine**: mic button, Whisper calls, browser fallback, then hands each chunk to Revise | 19 (11/2/6) | ✅ | 10-20 |
| [ux/Dictate/repeat.js](../repeat.js) | `collapse_tail` | drops a 5+ word tail that repeats the span before it (Whisper looping); called by `ComposerMic.collapse_repeat` | 1 (`ext/Chat/Mic.js`) | ✅ | 10-25 |
| [audio/Transcriber/Whisper.js](/framework/audio/Transcriber/) | `Whisper` (as `Transcriber.Whisper`) | a **second** Whisper engine, copied from Dictate.js (lines 4-5 say "read-only for this task") | 1 (index.js) | ⬜ | 09-30 |
| audio/Transcriber/WhisperSegments.js | `WhisperSegments` | a third variant: Whisper with per-word timestamps | 1 | ⬜ | 09-29 |
| audio/Transcriber/Browser.js | `Browser` | Chrome's own recognizer | 1 | ⬜ | 09-29 |
| audio/Transcriber/Transcriber.js, index.js | `Transcriber` | base class + bundle of the three above | 4 / 5 (0/3/2) | ⬜ | 09-29 |
| [audio/Whisper/Whisper.js](/framework/audio/Whisper/) | `Whisper` | **the server as an object** (up? ping?) — does not transcribe | 3 (3/0/0) | ✅ | 10-09 |
| audio/Whisper/WhisperSession.js | `WhisperSession` | one surface's request log with the server | 1 | ✅ | 10-20 |
| audio/Whisper/WhisperLog.js, WhisperLogRows.js | `WhisperLog`, `WhisperLogRows` | the live log of every Whisper answer | 6 / 3 | ✅ | 10-20 |
| audio/Whisper/WhisperDemo.js | `WhisperDemo` | the Whisper page's demo | 2 pages | ⬜ | 10-20 |
| ux/Dictate/WhisperLog.js | — | 3-line shim → audio/Whisper/WhisperLog.js | 0 | ⬜ | 10-16 |
| `Server/plugins/Whisper.js` | `Whisper` | starts whisper-server from the dev server (off under Servex) | 1 | server | 10-12 |
| `Server/whisper-test.mjs`, `Server/TranscribeLoop.mjs` | `TranscribeLoop` | replay saved recordings through Whisper (tests) | 0 | script | 10-12 |
| core/Page/card/log/whisper/ (Instrument.js, Transcript.js) | `Transcript` | a test page for Whisper's guesses | 1 page | ⬜ | 10-12 |

### Cleaning — raw words to tidy sentences

| File | Class | One job | Importers | Site | Last commit |
|---|---|---|---|---|---|
| [ux/Revise/Revise.js](/framework/ux/Revise/) | `Revise` | text + level (clean / edit / summary) → one model call via `/api/tidy` | 3 (1/1/1): **Dictate.js**, Playground | ✅ | 10-15 |
| `Servex/agents/tidy.js` | — | the server side of `/api/tidy`: the level prompts | Servex.js, RefineCall, local chat | server | — |
| [ext/Refine/Cleaner.js](/framework/ext/Refine/cleaner/) | `Cleaner` | instant rules `quick_clean`, or the model via `/api/tidy` | 2 (engine.js, its page) | ✅ | 10-16 |
| ext/Refine/engine.js | — | old function names → Cleaner (shim) | 11 (10 code, most in Servex) | ✅ | 10-15 |
| [ext/Refine/RefineSystem.js](/framework/ext/Refine/) | `RefineSystem` | runs one prompt through clean → outline → scores; `post_live` | 3 (Mic.js, RefineDemo, Explorer) | ✅ | 10-16 |
| ext/Refine/Prompt.js, Placement.js, Scorer.js, Outline.js, structure.js | `Prompt`, `Placement`… | the prompt's data, where a sentence goes, its scores, its outline | 2–5 each | ✅ | 10-10…10-16 |
| ext/Refine/stages/*.js (9 files) | `RawStage`…`VoiceStage` | the Refine page's columns and the voice session page | 1–6 each | ⬜ | 10-12 |
| ext/Refine/Refine.js, RefineDemo.js, RefineExplorer.js, RefinedCard.js, VoiceFollow.js, prompt-card.js | — | the Refine page and its cards | 1–2 each | mixed | 10-04…10-16 |
| `Servex/ext/refine/` (9 files: LiveRefine, LiveClean, RefineCall, VoicePage, Annotator, ClarityScorer, CardAsk, TagRouter, run.js) | — | the server half: live refine, model calls, writing the voice page | 1–4 each | server | 10-12…10-16 |
| `Servex/agents/Echo.js` | `Echo` | refines each owner prompt after it lands (calls `run_refine`) | 1 | server | 10-20 |
| `Server/refine.mjs`, `RefineQueue.mjs`, `DayPromptsRefine.mjs`, `refine-days.mjs`, `refine-litmus.mjs` | `RefineQueue` | refine past prompts in bulk, the model ladder | 0–3 | scripts | 10-14…10-20 |
| ux/Dictate/playground/Playground.js | `Playground` | raw vs cleaned side by side; has its **own** rules fallback `tidy()` (:50-73) | 3; embedded by the drawer's Dictation tab | ✅ | 10-17 |

### Chat box, voice session, assistants

| File | Class | One job | Importers | Site | Last commit |
|---|---|---|---|---|---|
| [ux/Dictate/chat.js](../chat.js) | — | **the one chat mount** for every surface; starts the session | 9 (7/1/1) | ✅ | 10-20 |
| [ux/Dictate/Widget.js](../Widget.js) | `Widget` | log + composer + mic as one component | 5 (3/0/2) | ✅ | 10-20 |
| [ext/Chat/Chat.js](/framework/ext/Chat/) | — | the bubbles (no class; exports functions) | 9 (6/3/0) | ✅ | 10-20 |
| ext/Chat/Composer.js | — | the text box + send | 9 (6/1/2) | ✅ | 10-16 |
| ext/Chat/Mic.js | `ComposerMic extends Dictate` | the box's mic: Whisper → box, starts both cleaners | 1 | ✅ | 10-20 |
| [ext/Chat/ChatPanel.js](/framework/ext/Chat/panel/) | `ChatPanel` | an older "log + composer + mic" component | 4 (1/3/0) | ⬜ | 10-12 |
| ext/Chat/md.js, roles.js | — | markdown in bubbles; who said it | 3–4 | ✅ | 09-30 |
| ext/Chat/Drill.js | `ChatDrill` | drill into a thread | 1 | ⬜ | 09-30 |
| [ext/Session/Session.js](/framework/ext/Session/) | — | one ✦ voice session: start, say, floor, resume, SSE replies | 7 (6/1/0) | ✅ | 10-20 |
| ext/drawer/Sheet.js | `Sheet`… | the phone strip and the voice sheet | 7 | ✅ | 10-20 |
| ext/drawer/rail.js | — | 7-line shim → Sheet.js | 1 | ✅ | 10-16 |
| ext/drawer/tabs/ai.js, tabs/dictation.js | — | the desktop drawer's AI tab (chat) and Dictation tab (Playground) | — | ✅ | 09-28…10-20 |
| [ux/Dictate/DictationBar.js](../DictationBar.js) | `DictationBar` | the sheet's one-big-mic bar | 1 | ✅ | 10-20 |
| ux/Dictate/VoiceStrip.js, Connection.js | `VoiceStrip`, `Connection` | status strip; "the path a prompt takes" row | 1 each | ⬜ / ✅ | 10-12 |
| dev/DevBar/ask.js | — | the dev bar's ask threads (mounts chat.js) | 1 | ✅ | 09-30 |
| `Servex/agents/Sessions.js` | `Sessions` | voice sessions on the server; spawns the assistants | 6 | server | 10-20 |
| `Servex/agents/Assistant.js` | `Assistant` | **a third assistant**: the card's fast assistant (every-prompt), retired for voice 10-17 | 2 | server | 10-13 |

### Demos and old versions (nothing real imports them)

| Folder | What | Last commit |
|---|---|---|
| [ux/Dictate/variants/](../variants/) (v1/Dictate.js, Cards, Compact, Parts) | four looks of the mic; `variants/v1/Dictate.js` is a second `class Dictate` | 09-29…10-12 |
| [ux/Dictate/v1/](../v1/) | the first Dictate page | — |
| [ux/Dictate/workspace/](../workspace/) | sentences as draggable cards | 10-06 |
| [audio/v1/](/framework/audio/v1/) | the old six-class audio (MicPicker, LevelMeter, PushToTalk) | 09-30 |
| ux/Dictate/tasks/ (37), ext/Refine/tasks/ (31), audio/tasks/ | task pages, history | — |

---

## 3. Duplicates and dead ends (with proof)

| # | What | Proof |
|---|---|---|
| D1 | **Two Whisper engines.** The live one is inside `Dictate`; `Transcriber.Whisper` is a copy used only by the audio/ demo pages. | `audio/Transcriber/Whisper.js:4-5` ("copied from … Dictate.js … read-only for this task"); `Dictate.js:536` and `Transcriber/Whisper.js:185` both POST `/inference` |
| D2 | **Three classes named `Whisper`.** The engine above, the server object `audio/Whisper/Whisper.js`, and the dev-server starter `Server/plugins/Whisper.js`. | `class Whisper` in all three files |
| D3 | **Each spoken chunk is cleaned twice** in the live box: once by Revise (`/api/tidy`), once by RefineSystem (`/api/refine/live`). | `Dictate.js:705` (`Revise.run`); `Mic.js:223, :236` (`RefineSystem.post_live`) |
| D4 | **Three cleaners**: `ux/Revise` (levels, model), `ext/Refine/Cleaner` (rules + model), Playground's own rules `tidy()`. Revise and Cleaner both call the same `/api/tidy`. | `Revise.js:8`, `Cleaner.js:196`, `Playground.js:50-73` |
| D5 | **Two assistants per voice session** where the owner asked for one, plus a third retired one still in the code. | `Sessions.js:1109` (`voice-assistant`), `:1129` (`session-smart`); `:1118` (`session-fast`, retired); `Assistant.js` |
| D6 | **Two "chat = log + composer + mic" components**: `Widget` (live) and `ChatPanel` (only pages). The chat is split over two folders: the mount and widget in `ux/Dictate`, the bubbles, box and mic in `ext/Chat`. | `Widget.js:1-9` imports four ext/Chat files; `ChatPanel` importers are 3 pages (ai/local, Chat/drill, Chat/panel) + `ext/Chat/index.js` |
| D7 | **Two mic capture classes and two copies of the worklet**: `Capture` (live) and `MicStream` (demos). `MicStream` even imports its device memory from `Dictate.js`. | `MicStream/pcm-worklet.js:6` ("A copy of ux/Dictate/pcm-worklet.js"); `MicStream.js:4` |
| D8 | **Two `class Dictate`**: the live one and `variants/v1/Dictate.js`. | both files |
| L1 | **Wrong link**: the Dictate page's "Whisper" tile opens Transcriber, which the live engine does not use. | `ux/Dictate/page.js:34` |
| L2 | **Wrong caller**: the Cleaner page lists Revise as a caller; Revise never imports Cleaner (both just hit `/api/tidy`). | `ext/Refine/cleaner/page.js:18`; `Revise.js:1-2` |
| L3 | **One word, two systems**: "refine" means both the owner's 09-29 *levels* step (built as Revise) and the prompt → cards pipeline (ext/Refine). | 09-29 brief point 2 (below); ext/Refine readme |
| X | **Shims** that only keep old imports alive: `ux/Dictate/WhisperLog.js` (0 importers), `ext/drawer/rail.js` (1), `ext/Refine/engine.js` (11). | each file's first comment |

---

## 4. Proposed organization (for the owner to approve)

The rule behind every option: **one home per job**. `audio/` = sound in (mic, Whisper). `ext/Refine` = text cleaned and shaped. `ext/Chat` = the chat you see. `ux/Dictate` = the mic button and the page that shows the whole system together. Every option keeps old URLs alive with a shim and is moved by a script (`git mv`, manifest, reversible). The decision cards, with caveats and confidence, are on the [task page](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/).

| Decision | Recommended | Alternatives | What it takes |
|---|---|---|---|
| **1. One Whisper engine** (D1, D2, L1) | Pull Dictate's Whisper code out into one engine class in `audio/Whisper/` (beside the server object); Dictate and the audio/ demos both use it; retire `audio/Transcriber/Whisper.js` and `WhisperSegments.js` to a shim | (b) make Dictate use `Transcriber.Whisper` (it was never on a live surface); (c) keep both, fix the link and label Transcriber "experiment" | ~6 files: Dictate.js, Transcriber/index.js, 3 audio pages, Dictate page.js:34. The link fix (L1) is one line and safe on its own |
| **2. One cleaner** (D3, D4, L2, L3) | `ext/Refine/Cleaner` is the one cleaner (it already has rules + model); Revise's three levels become Cleaner options; the live box cleans once (the RefineSystem path, which also drives the outline); Revise's page becomes the Cleaner's "levels" demo; Playground's `tidy()` calls Cleaner | (b) keep Revise as the levels UI only, its `run()` delegating to Cleaner, and turn off `Dictate.revise_chunk` in ComposerMic; (c) leave both, document which runs where | Dictate.js (revise_chunk), Mic.js, Revise.js, Playground.js, Cleaner.js; 3 importers of Revise |
| **3. One assistant per voice session** (D5) | Sessions spawns only `voice-assistant`; a turn that needs real work is handed to a mastermind by message, not by a second standing agent | (b) keep `session-smart` but asleep until asked (no spawn per session); (c) leave both | `Servex/agents/Sessions.js` (spawn at :1129, the reply merge around :235), roles.js, the Chat page's ⚡/🧠 labels. Needs a Servex restart; the owner picks the time |
| **4. One chat home** (D6) | Move `chat.js` and `Widget.js` into `ext/Chat` (the chat lives with its bubbles, box and mic); `ChatPanel` retires to a shim over Widget; ux/Dictate keeps the mic button | (b) move everything chat into `ux/Dictate`; (c) leave, and say the split once at the top of both readmes | 2 moves, ~12 importers (Sheet.js, tabs/ai.js, tabs/sessions.js, ai/rail, DevBar ask, pages); scripted |
| **5. One mic capture** (D7, D8) | `Capture` stays the one capture class, moved to `audio/` as the engine under `MicStream`'s demos; one worklet file; `variants/v1/Dictate.js` and `audio/v1/` move to an archive path | (b) make Dictate use MicStream; (c) leave, label demos | Capture, MicStream, 2 worklets, 7 demo importers |

Order: 1 (link fix first, it is free) → 2 → 4 → 5; 3 is independent and server-side.

---

## 5. Screenshots, as they are now (2026-10-20)

Each line: what a newcomer would understand from the page.

| Page | 400 | 1920 | What a newcomer gets |
|---|---|---|---|
| [Dictate](/framework/ux/Dictate/) | [400](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/dictate-400.png) | [1920](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/dictate-1920.png) | A working chat box and six tiles; "four parts" is named but the tiles are Workspace/Variants/Playground, not the parts, and the Whisper tile points at the wrong module |
| [Refine](/framework/ext/Refine/) | [400](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/refine-400.png) | [1920](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/refine-1920.png) | A second chat box plus Said → Cleaned → Outline → Scores; clear as a lab, but no sentence says how it differs from Revise |
| [Revise](/framework/ux/Revise/) | [400](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/revise-400.png) | [1920](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/revise-1920.png) | The clearest page: text + level → better text; but it calls itself "the AI step of dictation", which Refine also claims |
| [Chat](/framework/ext/Chat/) | [400](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/chat-400.png) | [1920](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/chat-1920.png) | The bubble log alone, ⚡ fast and 🧠 smart assistants shown; points to Chat Panel, not to the Widget the sheet really uses |
| [audio](/framework/audio/) | [400](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/audio-400.png) | [1920](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/audio-1920.png) | Pick a mic, talk, record: a clean three-step demo, but it runs on MicStream + Transcriber, not the engine the site uses |
| [Whisper](/framework/audio/Whisper/) | [400](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/whisper-400.png) | [1920](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/whisper-1920.png) | Every guess and final from the server, live; the most useful page for seeing what Whisper hears |
| [Transcriber](/framework/audio/Transcriber/) | [400](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/transcriber-400.png) | [1920](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/shots/transcriber-1920.png) | Code first, then a property table of a "Whisper"; nothing says this is a separate engine from Dictate's |

---

## 5b. The `{chat}` and `{place}` lines

V1 draws a voice session from two "pseudo property" lines, `{chat}` and `{place}`; what they are, who writes and reads them, and the plan to move V1 onto `session.messages`: [core/Session/Chat/doc/pseudo-properties.md](/framework/core/Session/Chat/doc/pseudo-properties.md).

---

## 6. Why it got this way

On 2026-09-29 the owner asked for three named layers (audio, transcription, refinement at levels) and said "ux/Dictate can stay where it is, **rebuilt on the audio/ parts**" ([the 09-29 brief](/framework/ai/sessions/2026/09/29/audio/audio/requirements.md), points 2–3). The task built `audio/Transcriber` and `ux/Revise` (merge `b1b82d33a`) but fenced `Dictate.js` as read-only, so it *copied* Dictate's Whisper code instead of moving it, and Dictate was never rebuilt on the new parts. A week later `ext/Refine` (`8dbc5dd10`, `c7233feb8`) built its own cleaner and its own `Whisper` class for a different job (prompt → cards) under the same word. Each task added a new module beside the old one and none retired the old one, so every layer now exists twice. Proposed skill line: [skill-proposal.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-map/skill-proposal.md).
