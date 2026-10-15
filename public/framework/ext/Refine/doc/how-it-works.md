# Refine: how it works today

Refine takes one prompt, typed or spoken, and does two things to it: it **cleans** the words, then it **refines** them into an outline of cards. Every claim below was read from the source; the file:line refs are where to look.

## 1. The classes

Read this table once. The boss is `RefineSystem`; everything else is a part it uses.

| Class (file) | One-line job | Extends / composes |
|---|---|---|
| `RefineSystem` (`RefineSystem.js:21`) | the boss: runs one prompt through the steps and owns the live `Prompt` | composes `Prompt`, `Scorer`, `Whisper` |
| `Prompt` (`Prompt.js:25`) | data for one prompt: raw text, clean sentences, refined cards, scores | plain data |
| `Prompt.View` (`Prompt.js:125`) | draws a `Prompt` | extends `View` |
| `Scorer` (`Scorer.js:6`) | rules, no model: gives each sentence `clarity`, `weight`, flags | used by `Prompt.load()` |
| `Outline` (`Outline.js:11`) | turns the markdown outline into nested cards | pure text in, data out |
| `RefinedCard` (`RefinedCard.js:13`) | one past owner prompt, refined by one Haiku call | plain data, no DOM |
| `VoiceFollow` (`VoiceFollow.js:10`) | shows the ✦ chat's dictated lines on the demo page | read-only |
| `RefineView`, `RefineDemo`, `RefineExplorer` | the page views (`Refine.js:472`, `RefineDemo.js:34`, `RefineExplorer.js:16`) | extend `View` |
| `clean()`, `quick_clean()` (`engine.js:207`, `:233`) | functions: the model clean, and the instant clean with no model | not classes |
| `structure()` (`structure.js:58`) | function: sentences → markdown outline | not a class |

The server half lives in `Servex/ext/refine/`:

- `run_refine()` (`Servex/ext/refine/run.js:30`) runs both steps for `POST /api/refine`. The Refine buttons and Echo (the VS Code pipeline) both call it.
- `LiveRefine` (`LiveRefine.js:28`) handles a prompt while it is still being spoken.
- `VoicePage` (`VoicePage.js:19`) writes each stage onto the session page as it happens.
- `RefineCall` (`RefineCall.js`) makes one model call, as its own new session. It uses Haiku unless the owner switches to OpenRouter.

The design note `doc/architecture.md` names the two steps `Cleaner` and `Structurer`. In code they are the functions `clean()` and `structure()`, not classes.

## 2. The two steps: clean, then refine

**Step 1: clean.** `clean()` (`engine.js:207`) asks a model to split the raw words into numbered, near-verbatim sentences, S1, S2, and so on. The model is Haiku. In the browser the call goes to Servex `/api/tidy` (`engine.js:194`); on the server it calls the same prompt directly (`engine.js:182`). Three guards follow:

- If the model returns nothing, a plain split on punctuation is used (`mechanicalSplit`, `engine.js:131`).
- A check drops any word the model invented (`applyFaithfulnessCheck`, `engine.js:136`).
- Spoken "no, wait" corrections are marked (`detectStrikes`, `engine.js:97`).

There is also an **instant** clean, `quick_clean()` (`engine.js:233`). It uses no model, takes about 1 ms, and runs on every dictated chunk so the text is never blank.

The clean sentences go to `Prompt.clean` in memory, and to the session page through `/api/voice`.

**Step 2: refine.** `structure()` (`structure.js:58`) asks the model for an outline: `## card` headings with `[S1, S2]` citations. `Outline.parse()` (`Outline.js`) turns that text into nested cards. `Scorer` then gives each sentence its clarity, and `Prompt.load()` puts the cards in `Prompt.refined`. In `run_refine`, the structure call and the clarity scores run at the same time, because both only need the clean sentences (`run.js:6-7`).

The refined cards go to `Prompt.refined`, to the prompt log (`prompts.jsonl`, through `PromptLog`), and to the session page.

**Live, while speaking.** `LiveRefine` (`LiveRefine.js:33`) takes the finished sentences in batches of at most 12 (`MAX_BATCH`) and asks the model to amend the outline. `RefineSystem.live()` (`RefineSystem.js:143`) keeps only the newest reply, so a late answer for an older batch is dropped.

## 3. How Dictate feeds it

One spoken prompt passes through these hops. Each hop names its class.

1. **Mic:** `Capture` (`ux/Dictate/capture.js:18`) opens the microphone at 16 kHz and cuts the sound into WAV chunks.
2. **Whisper:** `Dictate` (`ux/Dictate/Dictate.js:96`) sends each chunk to the local whisper-server through `Whisper` (`audio/Whisper/Whisper.js:19`). Each answer is reported through `on_whisper` (`Dictate.js:545`) and kept by `WhisperSession` (`audio/Whisper/WhisperSession.js:24`). `Connection` (`ux/Dictate/Connection.js:22`) draws the path as a row of status.
3. **Bubbles:** the chat's mic, `ComposerMic` (`ext/Chat/Mic.js`), puts the words in a chat bubble. `place()` (`ext/Chat/Chat.js:18`) puts each bubble in order of time. `ComposerMic` also calls `RefineSystem.post_live()` (`Mic.js:223` while speaking, `Mic.js:236` when done).
4. **Refine:** `RefineSystem` runs `quick()` on each chunk, `stream()` to the session page (throttled to 150 ms), and `go()` or `live()` for the model steps.

On the demo page, `VoiceFollow` reads the ✦ chat's session file (`lew42-voice-session`), so the chat and the demo show the same words.

## 4. What is known broken

Each item says what was seen, where, and what is known about the cause. Nothing here is fixed unless it says so.

**Connections drop**

- **The dev socket** reconnects on close after a delay (`dev/Socket/Socket.js:68-100`). Dictate shows "retrying" while it does (`Dictate.js:203`). Dictation does not depend on it (`ux/Dictate/doc/notes.md:218-223`).
- **Whisper** is restarted up to three times if it crashes (`ux/Dictate/doc/architecture.md:63`). A restart looks like "whisper just went quiet" (`ux/Dictate/doc/notes.md:40`).
- **A phone** cannot dictate over plain `http://`: the browser hides the mic. The cause is known, and the fix (https) needs the owner's choice of certificate (`ux/Dictate/doc/mobile-socket-2026-10-09.md`, `ux/Dictate/doc/https-lan.md`).
- **A phone's live view** is read-only: it tails `GET /api/voice/stream` and gets no push back (`ext/Refine/stages/doc/voice-to-page.md`).
- **A slow send:** one case took about 24 s before the agents started. The cause was not found, because Whisper's own log for that minute is missing (`ux/Dictate/doc/asks.md:120`).

**Out-of-order and wrong deltas**

- **Whisper answers can come back out of order.** A slow reply for an older, shorter segment can arrive last. Dictate drops it (`seq <= applied_seq`, `ux/Dictate/doc/notes.md:488`; also `notes.md:293`, `:445`).
- **Bubbles arrive out of order** too, so they are placed by time, not by arrival (`ux/Dictate/doc/architecture.md:85`).
- **The live outline can miss a sentence.** A sentence the model does not cite is placed by force (`LiveRefine.js` `unplaced`), which may be the wrong place. Models sometimes drop the `## heading` markers under load; the readme's recommendation 2 proposes a fix (`ext/Refine/readme.md`).
- **Model-written page deltas:** in one fresh Haiku test, six calls wrote zero wrong deltas (`core/Page/doc/ai-api.md:74`). A bad delta was measured in a CSS run, not in Refine (`ai/sessions/2026/08/17/vision-direction/quality.md:29`). No logged bubble-delta failure in Refine was found, so the owner's report has no matching log yet.
- **Broken JSONL lines** came from an agent writing its own log line badly (`ai/sessions/2026/08/15/live-streaming/task.jsonl:40`). A repair pass fixed the old ones (`ai/sessions/2026/09/19/health-quiet/requirements.md`).

## Owner's longer-term note (record only, no action)

> Subpages and navigation built out of jsonl deltas may be the wrong tool; better templates written in raw markup, which jsonl then uses, may be the answer. (owner, 2026-10-15, voice a98d6231)

Next: [the voice-to-refine proposal](voice-to-refine.md).
