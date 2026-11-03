# How Dictate, Refine and tasks connect

Written 2026-10-17, before the dictation redesign (sheet step 10), so the redesign starts from what exists. The mocks are on [the variants page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/sheet-dictation-mocks/variants/index.html).

## The path of one spoken sentence

1. **Dictate hears it.** The mic (`Dictate.js`, its state shown by `MicIndicator`) sends audio to Whisper, and every finished sentence is saved raw, uncleaned, to Servex's prompts log (`log_prompt()`). Nothing the owner says is lost before any AI touches it.
2. **The chat sends it.** The sheet, the desktop AI tab and push-to-talk all mount the one `chat.js` `GLOBAL` conversation. In pause mode each sentence goes as its own bubble, tagged with the page it was said on.
3. **Servex answers it.** A voice session (`Servex/agents/Sessions.js`) has a fast assistant and a smart one. The smart one does the work: it answers, and it routes anything bigger.
4. **Refine turns a long dictation into a brief.** For more than a few sentences, the smart assistant runs `node Server/refine.mjs` into the task folder. Its `coverage.md` proves that every sentence reached the brief (`Server/doc/refine.md`). [`ext/Refine`](/framework/ext/Refine/) is the page that shows a run: raw, then clean, then cards, side by side.
5. **A task is opened.** The smart assistant starts a task mastermind with the polished brief (a task folder with `task.jsonl`), or, for "file a task about this page", hands it to that page's own pair with `ask_manager` (sheet step 8). It writes one `task` line into the folder's `ai/log.jsonl` with `dir_log`.
6. **The sheet shows it.** `AIFeed` (`ext/drawer/AIFeed.js`) streams that page's `ai/log.jsonl` and `ai/chat.jsonl` with `live()`, so the task line and the page pair's answer appear among the chat bubbles within about a second.

## Where each part lives

| Part | Home | What it owns |
|---|---|---|
| The mic, Whisper, the chat | [`ux/Dictate`](/framework/ux/Dictate/) | hearing, raw logging, the one conversation |
| The sheet and the feed | [`ext/drawer`](/framework/ext/drawer/) | `Sheet`, `AIPage` (`<path>/ai/`), `AIFeed` |
| Refining words into a brief | [`ext/Refine`](/framework/ext/Refine/), `Server/refine.mjs` | raw to clean to cards, with a coverage check; the refine queue turns past prompts into cards on a session's Coverage tab |
| Tasks | task folders under `ai/sessions/`, `Servex` | `task.jsonl`, the landing line, the board card |

## Watch out

- **Two things are called "task".** A task folder (`task.jsonl`, the AI board) is a unit of AI work. [`core/Task`](/framework/core/Task/) is a DOM-free `Task` class with a state machine. They are not connected.
- **Refine runs in two places.** It runs on the server for a brief (`refine.mjs`), and on the `ext/Refine` page as a live demo. The demo's compact panel is `VoiceStrip`, which the live sheet does not use (decision `d-voicestrip`, 2026-10-17).

## The bar

Sheet step 10 picked variant **D, fewer controls** for the phone sheet, so the sheet now shows `DictationBar` ([`DictationBar.js`](/framework/ux/Dictate/DictationBar.js)): one big mic whose caption is the engine's state in one word (starting, listening, sending, paused, off), a **Type** button that opens the text box in place, and no Send and no gear. Tap the mic to talk or pause, hold it for 0.6 s to turn it off.

- **No second engine.** It drives the composer's own mic (`ComposerMic`, a `Dictate`) and hides the composer's row with CSS. Its height is fixed, so a changing word moves nothing.
- **Both sizes.** Split shows the big bar in the composer; the strip shows a small round mic and the word in the strip's row.
- **Proof.** `node public/framework/ux/Dictate/test/dictation-bar.mjs <base-url> [shots dir] [--strip] [--before]` drives three sentences from the fake mic at 400 and counts elements whose top moves (numbers in the task log).
- **The alternative, A compact** (the old mic row with a Send button): delete the one `DictationBar.mount(...)` line in `ext/drawer/Sheet.js`. `VoiceStrip` stays in the tree and is untouched.
