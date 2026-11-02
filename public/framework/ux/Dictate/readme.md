# Dictate — a mic button that always shows what is happening

**How a chat is made, mic to screen** (the pipeline, the two views, the class sketch, the colours, the item tool; one file:line per stage): [`doc/pipeline.md`](doc/pipeline.md).

**The whole stack on one page** (dictation, sheet, chat v1/v2/v3, session, task, prompt, the session page): [ai/system-map.md](/framework/ai/system-map.md); the proposed shape (Sheet and Chat as classes, the global voice session as a class, raw then refined prompts): [ai/system-proposal.md](/framework/ai/system-proposal.md). Note: the global voice session is not a class today; it is a controller (`create_controller` in `chat.js`) kept in sessionStorage `lew42-voice-session`.

- ⬜ **Goal:** the owner calls the whole experience "chat", so it is one thing under that name (no renames yet): the first view and [Chat v2](/framework/ext/Chat/v2/readme.md) become one chat. Matching line in [Chat v2's readme](/framework/ext/Chat/v2/readme.md).

## How messages travel

You speak and Whisper turns the sound into text, one sentence at a time. The page then sends each sentence to Servex with a plain HTTP `POST` to `/api/session/say` (no WebSocket carries your words out; the only live wire is a one-way `EventSource` stream, `/api/session/<id>/stream`, that brings the chat's new lines back).<sup>[<a href="#fn1">1</a>]</sup><sup>[<a href="#fn2">2</a>]</sup> The page does not make the voice session: the first time a sentence needs one, `chat.js` asks Servex with `POST /api/session/new`, and Servex's `Sessions.create()` picks the id (`v-…`), writes the session file and starts the fast assistant warming up.<sup>[<a href="#fn3">3</a>]</sup><sup>[<a href="#fn4">4</a>]</sup> The fast assistant is fed per thought, not per word: your sentences are held while you are still speaking and handed to it together once you have been quiet for 2.5 s (a typed line goes straight in).<sup>[<a href="#fn5">5</a>]</sup><sup>[<a href="#fn6">6</a>]</sup> The smart assistant is fed in batches by `WakePolicy`: one batch when you pause for 12 s, or ask a question, or call it by name, or as soon as each sentence is finished (default every: 1; before 2026-10-25 it was 6), and you can change the 12 s and the count in the dictation settings panel.<sup>[<a href="#fn7">7</a>]</sup><sup>[<a href="#fn8">8</a>]</sup>

1. <a id="fn1"></a>`ext/Session/Session.js:39` (`post()`: `fetch(servex_url("/api/session/<verb>"), {method: "POST"})`) and `:150-170` (`stream()`: `new EventSource(…/api/session/<id>/stream)`).
2. <a id="fn2"></a>`ext/Session/Session.js:83` (`say()` posts `say`); `Servex/agents/Sessions.js:1468` (the stream route) and `:1471` (the POST route for `new`, `say`, `settings` and the rest).
3. <a id="fn3"></a>`ux/Dictate/chat.js:72` (`Session.start(…)`, one shared promise so two mounts make one session) and `ext/Session/Session.js:56-57` (`start()` posts `new`).
4. <a id="fn4"></a>`Servex/agents/Sessions.js:766` (`create()`), `:783` (the `v-` id), `:792` (`prewarm_fast`).
5. <a id="fn5"></a>`Servex/agents/Sessions.js:970-972` (a spoken line is held with `hold_thought`, released when the floor is not "speaking" and the quiet is at least `answer_quiet_ms`, default 2500 at `:246`), `:977-982` (the else branch: a typed line goes straight to the fast seat).
6. <a id="fn6"></a>`Servex/agents/Sessions.js:1107-1117` (`release_thought()` hands the held lines to the fast seat in one message).
7. <a id="fn7"></a>`Servex/agents/Sessions.js:1119` (the same lines also go to `waker.add()`) and `:254-265` (`waker` flushes into `feed_smart()`).
8. <a id="fn8"></a>`Servex/agents/WakePolicy.js:12` (`WAKE_DEFAULTS = {gap_ms: 12000, every: 1}`), `:66` (the sentence count flush), `:2-5` (pause, question or name, count); the settings panel posts `POST /api/session/settings`: `ext/Chat/Mic.js:388`.


**Reading this inside the app:** the sheet's **Docs** tab shows this readme and the module's docs ([`doc/docs-tab.md`](doc/docs-tab.md)).

**Dictation stopped, or the AI never answered? Open the Debug tab** (each step from the mic to the AI's answer, live, with the real error; what the stall was and how it was fixed): [`doc/debug-tab.md`](doc/debug-tab.md).

- `class DictateHealth` (the eight lights, [DictateHealth.js](DictateHealth.js); every error from every stage lands here, and `window` errors and rejections too)
- `class DictateDebug` (the view, [DictateDebug.js](DictateDebug.js))
- `class DictateDocs` (the Docs tab: this readme and the docs, rendered in place; [DictateDocs.js](DictateDocs.js), [DictateDocs.css](DictateDocs.css); proof `test/docs-tab.mjs`)
- `chat.js` calls `report.init(session)` ([ext/Chat/v2/report.js](/framework/ext/Chat/v2/report.js)) once the voice session id is known.
- **A Question card moves to the end of the chat when it is answered** (2026-10-25): `Widget.js`'s `show_task` drops the row where it was just built (the end of `$bubbles`) instead of moving it back to where it was asked, when `chat.js`'s `draw_task` says `moved` — the same rule, and the same shared signal (`ChatV2Model.newly_answered`), as v2's root-surfacing: [`ext/Chat/readme.md`](/framework/ext/Chat/readme.md).
- **`chat-live` window event:** the composer's mic (`Widget.js`, `on_live`) also dispatches `new CustomEvent("chat-live", {detail: {text, settled, guess, sent}})` on `window` each time it reports the unsent words, beside the V1 `$thread.live()` call. Nothing in V1 listens; [Chat v3](/framework/ext/Chat/v3/readme.md) draws the same words as its faint draft.
- The Debug panel in the phone sheet has a resize handle whose height survives a reload ([`SheetPanel.tabs_grip`](/framework/ext/drawer/doc/sheet.md#the-debug-panel-handle-2026-10-25)).
- Proofs `test/errors.mjs` (every error is caught and shown), `test/stall.mjs`, `test/debug-tab.mjs`, `test/deltas.mjs`, `test/repeat.mjs` (Whisper's repeated tail), `test/order.mjs` (bubbles in the order spoken, including the open-bubble-stays-last case), `test/flicker.mjs` (no word vanishes or moves), `test/chat-sent.mjs` (the two moving cursors reach "done"; the scroll lock and the ↓ button; Questions under their Prompt, the open bubble re-anchoring below one; bubbles and Chat v2), `test/chat-gray.mjs` (gray-state labels and the faded sent bubble), `test/refresh.mjs` (reload, then dictate: [`doc/debug-tab.md#refresh-then-dictate`](doc/debug-tab.md#refresh-then-dictate)).
- **Two moving cursors (2026-10-25):** the bubble chat draws the same ✓ (fast seat) / 🧠 (smart seat) cursors Chat v2 has — the one shared pair for the whole bubble (`ext/Chat/cursors.js`), moved onto whichever live piece is newest, never one pair per piece. `ext/Chat/chunks.js` says what a fast chunk / a finished sentence is; `Chat.js`'s `place_live_cursors()` moves the pair. The green Understand check is off for now, the yellow `?` stays: [`ux/Understand/readme.md`](/framework/ux/Understand/readme.md).
- Errors: [failures.jsonl](/framework/ux/Dictate/failures.jsonl) (dev only: git-ignored, written on this machine at the first failure).

**Whisper said the end twice?** A tail of 5+ words repeating the span before it is dropped, a short real repeat stays: `ux/Dictate/repeat.js`, proof `test/repeat.mjs`, [`mic-notes`](/framework/ext/Chat/doc/mic-notes.md#whisper-repeats-collapse_repeat).

**Words vanished and came back?** The flicker, its cause and the fix: your words become the sent piece in the draft's spot the moment they leave it (`ComposerMic.take_out` → `Widget.show_out`), proof `test/flicker.mjs`: [`doc/flicker.md`](doc/flicker.md).

**Map of every dictation piece** (mic, Whisper, cleaners, chat, voice session, assistants; the duplicates and the plan): [doc/map.md](doc/map.md).

**Every voice and chat surface, one page** (screenshots, who answers, the flow, the 30-second first reply): [`surfaces/`](./surfaces/) · [long form](doc/surfaces.md).

**How Dictate, Refine and tasks connect** (one spoken sentence, from the mic to a task line in the page's feed): [`doc/refine-dictate-tasks.md`](doc/refine-dictate-tasks.md). **The dictation redesign, mocks first** (five ways to lay out the controls, and the pick): [the variants page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/sheet-dictation-mocks/variants/index.html).

**Where a voice session lives** (2026-10-19): in the central session store like every other session, `/framework/ai/sessions/YYYY/MM/DD/<v-id>/session.jsonl`, with `kind: "voice"` on its first line and in Servex's `sessions.json`; older ones are still flat at `<home>ai/<v-id>.jsonl` ([`ext/Session`](/framework/ext/Session/)).

**The voice assistant** (one assistant places each sentence as you talk: same paragraph, own paragraph, own card; the plan and why the chat jumps): [`doc/voice-assistant.md`](doc/voice-assistant.md).

**The phone sheet** (✦ at the bottom of every page under 52em): `class Sheet` in [`ext/drawer/Sheet.js`](/framework/ext/drawer/Sheet.js), mounting the one [`chat.js`](chat.js). One layout at every height: a head, a full-width chat well, the mic footer; it opens over the page and snaps open at 90%. **Its connection log:** every lost, retried or restored link to Servex is a `src: "connection"` line in [the Whisper log](/framework/audio/Whisper/log/) (`ai/whisper/bucket.jsonl`). How and why: [ext/drawer/doc/sheet.md](/framework/ext/drawer/doc/sheet.md). Proofs: `test/sheet-steps.mjs` (a shot per 40 px of drag), `test/reconnect.mjs` (a Servex restart).

**Replies read aloud:** `chat.js` hands every event on the live wire to `Recite.shared.from_wire(ev)`, and `DictationBar.mount` puts the Recite bar directly above the mic ([audio/Recite](/framework/audio/Recite/)).

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

**What do the fast and smart seats each do, and which model, prompt and effort do they run?** A job-by-seat table, the gaps, a recommended split and how to experiment: [`doc/fast-and-smart.md`](doc/fast-and-smart.md).

**Settings panel:** the ⚙ beside ⌨ on the sheet's bar (and the gear on a plain composer) opens "Dictation settings": the send delay (2 s) and the smart assistant's batch seconds and sentences; values live in `localStorage` key `chat.mic.settings.4` (`ext/Chat/Mic.js` `SETTINGS`): [`doc/settings.md`](doc/settings.md).

**How fast is the first reply?** Measured hop by hop, before and after: [`doc/latency.md`](doc/latency.md). **Raw text slow on the phone?** On a slow uplink the upload is the delay, so the WAV is 8-bit mu-law (half the bytes) and a guess in flight is dropped when the segment ends: [`doc/upload.md`](doc/upload.md).

**Dim to strong:** words still being spoken use `--draft-ink`, and every line once written uses `--final-ink`. The pair is defined in `framework.css`, and V1, V2 and V3 all use it.

**Class architecture of the voice UI** (which class owns what, what is a copy of what): [`doc/voice-architecture.md`](doc/voice-architecture.md). **`VoiceStrip`** is the compact panel Refine and the demo below use; **mobile**: [`doc/mobile-socket-2026-10-09.md`](doc/mobile-socket-2026-10-09.md).

**Streaming UI and context cards** (live 3-line text area, sentences moving up, reference pills, context cards; being designed in Figma): [`doc/streaming-ui.md`](doc/streaming-ui.md).

- Moved verbatim to [doc/readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md): usage, design and mechanics in full.

## One session across tabs, and settings per device

- **Join, don't start.** A page or tab with no session of its own joins the latest voice session if that had a line in the last **30 minutes** (`JOIN_IDLE_MS` in [chat.js](chat.js)). Only a longer idle gap, or the New session button, starts a fresh one. So a link opened in a new tab, or the Recite page, joins the conversation in use.
- **Read-aloud follows the session on every page:** the ✦ Sheet starts [Recite](/framework/audio/Recite/) and follows the page's session, or, with none, the voice session that had a line within the same 30 minutes ([ext/drawer/Sheet.js](../../ext/drawer/Sheet.js) `read_aloud()`).
- **The mic does not restart by itself after a reload.** The browser grants the mic without a tap once allowed, but it keeps a new `AudioContext` suspended until the page gets a tap (Chrome's autoplay rule), and the mic's capture and level meter run on one. So the first tap after a reload starts it.
- **⬜ Settings are per device today.** The gear's settings (send delay, wake, voice, speed) live in this browser's `localStorage`, so a phone and a desktop differ. The owner wants one set that applies everywhere (2026-11-01): a settings record in Servex, read at load, with the browser's copy as a cache.

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
- [`doc/architecture.md`](./doc/architecture.md) — the decisions that hold today, and why (no longer in the drawer's Docs tab: [why](doc/docs-tab.md))

**The owner's direction, 2026-10-20: dictation on the website first** (one assistant, hands-free; a global named voice session with a session manager; the widget cleanup asks that never landed; the font flicker): [doc/owner-2026-10-20-dictation-first.md](doc/owner-2026-10-20-dictation-first.md).

- [Design decisions 2026-10-27](/framework/ai/design-decisions-2026-10-27.md) — sentences are written instantly by code; the fast seat is paused as a placer (leaning), the chat is one stored list.
