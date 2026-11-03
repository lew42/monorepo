# Dictation map: from your voice to each chat view (2026-11-01)

This page follows one spoken sentence from the microphone to the screen, and names the class and file at each step. Every claim was checked in the code today, and the counts come from a node script run over the 28 real voice sessions since 2026-10-17 ([scripts/](scripts/)). The answers to your questions are in [answers.md](answers.md); the plan for one chat view is in [plan.md](plan.md).

## The one-screen version

```
mic ─► Capture ─► whisper-server ─► Whisper text ─► filler words cut ─► cut into sentences ─► POST /api/session/say
       (browser)   (port 8178)       (guesses + finals)   (regex unfill)     (ComposerMic)            │
                                                                                                    ▼
                                         Servex Sessions.say() writes the sentence TWICE into session.jsonl:
                                           {chat:{…}}            the old shape: Chat V1 reads it
                                           {tasks:{add:Prompt}}  the new shape: Chat V2 and V3 read it
                                                                                                    │
                     ┌──────────────────────────────────────────────────────────────────────────────┤
                     ▼                                                                              ▼
     fast seat: voice-assistant (Haiku)                                         smart seat: session-smart (Sonnet)
     gets the RAW sentence + every earlier one                                  gets the same RAW sentences, in batches
     writes {place} (cleaned text) + Questions                                  writes {chat} replies, Prompt title/text, tasks
                     │                                                                              │
                     ▼                                                                              ▼
     only Chat V1 reads {place}                                    Chat V1 reads {chat} replies; V2/V3 read only Prompt replies
```

- **Both seats still run.** Every voice session since 2026-10-17 spawned a `voice-assistant` and (in 25 of 28) a `session-smart`.
- **Both get the same raw Whisper text** ("echo mode"). Nobody cleans the text before the smart seat sees it.
- **The fast seat's cleaned text reaches one place only:** Chat V1's bubbles, and only when it labels the edit `improve`.
- **Chat V1 shows the words while you speak; V2 never does; V3 does, by borrowing V1's live event.**
- **The biggest duplicate:** each sentence is written in two shapes, and each smart reply mostly lands in the shape V2 and V3 don't read.

---

## 1. The path, step by step

| # | Step | Class (file) | What comes out |
|---|---|---|---|
| 1 | Open the mic, cut sound into chunks | `Capture` + `DictatePCM` worklet (`ux/Dictate/capture.js`, `pcm-worklet.js`) | audio chunks |
| 2 | Send a chunk to Whisper | `Dictate.transcribe()` → `POST /inference` (`ux/Dictate/Dictate.js` ~575-600) | Whisper text; the growing sentence is re-sent every 900 ms (`guess_ms`), so there are **guesses** and **finals** |
| 3 | Keep whisper-server running | Servex `whisper()` (`Servex/Servex.js`), large-v3-turbo + silero VAD, port 8178 | — |
| 4 | Log every Whisper answer | `Dictate.log_whisper()` → `/framework/ai/whisper/bucket.jsonl` (one global file, not per session) | `{kind: "interim"|"final", msg, raw}` |
| 5 | Cut filler words | `unfill()` (`ext/Chat/Mic.js:87`), a regex over "ah uh um er erm hmm mm" | the text that is sent. This is the **only** cleaning before the seats |
| 6 | Show the words as you speak | `ComposerMic` → `Widget` `on_live` → `Thread.live()` (`ux/Dictate/Widget.js:828`), plus a `chat-live` window event | a gray guess tail in a growing bubble. **Never written to disk** |
| 7 | Cut into sentences and send | `ComposerMic.send_sentences()` (`Mic.js:601`) → `chat.js:181` → `Session.say()` (`ext/Session/Session.js:79`) | `{text, raw}`: `raw` is the whole Whisper segment, `text` one sentence of it. They differ on 943 lines because of the cut, not because of cleaning |
| 8 | Write the sentence | `Sessions.say()` (`Servex/agents/Sessions.js:996`) | `{chat:{from:{kind:"owner"}, text, prompt}}` **and** `assign_prompt()` (`:475`) → `PromptLines.add_prompt` / `push_raw` / `append_paragraph` |
| 9 | Hold the thought | `hold_thought()` / `release_thought()` (`:1179`, `:1191`): wait for 2.5 s of quiet | one batch of sentences |
| 10 | Wake the fast seat | `voice_say()` (`:463`): "The prompt so far" (**every** earlier owner line) + the new sentences + `(prompt p-…)` | `{place}` lines, Question tasks |
| 11 | Wake the smart seat | `waker.add()` → `WakePolicy` flush → `feed_smart()` (`:271`): the new raw lines + why it woke | `{chat}` replies, Prompt `title`/`text`/`replies`/`tasks`, reactions |
| 12 | Also refine in code | `Sessions.refine()` (`:666`) → `Echo` → `ext/Refine` `clean` + `structure` (two model calls, lines of 2+ sentences or 15+ words) | `{refined}` (81 lines) |
| 13 | Stream to the page | `push()` SSE `/api/session/<id>/stream` (`:1531`): every line, plus `{kind:"stream", role:"smart", text}` while a reply is being written | — |
| 14 | Draw | V1 `chat.js` `draw_line()` → `Widget`; V2 `ChatV2`; V3 `ChatV3` (both `extends JSONL`), chosen by `ext/drawer/ChatView.js` | the chat |

## 2. The assistants (the roles and their prompts)

| Role | Prompt file | Model, effort (`tiers.js`, `Sessions.js:1282-1316`) | What it receives | What it writes (real counts, 28 sessions) |
|---|---|---|---|---|
| **fast seat: `voice-assistant`** | `.claude/skills/voice-assistant/SKILL.md` (loaded by `voice_brief()`) | Haiku 5.5, low; no tools except the `item` door | per released thought: **all** earlier raw owner lines + the new raw sentence(s) + the Prompt id | 2,790 `{place}`; 201 Question tasks. Zero `{chat}` |
| **smart seat: `session-smart`** | `Servex/agents/session-smart.md` appended to the Claude Code preset | Sonnet 5.5, medium (Sonnet also when over pace) | batches of the new raw owner lines, `[on <path> at <time>] text`, + why it woke + the Prompt id | 1,062 `{chat}` replies; ~170 Prompt edits (title, text, replies, tasks); 422 reactions |
| `session-fast` (retired) | `Servex/agents/session-fast.md` | Haiku, low | the escape hatch: write `fast` into `%LOCALAPPDATA%\lew42\servex\session-assistant.txt` (the file does not exist, so `voice` wins) | last spawned 2026-10-17 |
| code, no model | `PromptLines.js` | — | each owner line | 913 Prompts, 1,746 raw pushes, 1,746 paragraph appends, all stamped `by: "fast"` though no seat wrote them |
| code + Echo | `Sessions.refine()`, `Servex/agents/Echo.js` | `ext/Refine` model calls | finished long lines | 81 `{refined}` |
| cloud voice agent (a different system) | `Servex/ext/remote/doc/cloud-voice-agent.md` | the Claude app | your phone call | `ask_mastermind`, `/live/` cards; not part of the site's dictation |

## 3. Which view reads which line

| Line in `session.jsonl` | Written by | V1 (`ux/Dictate/chat.js` + `Widget.js` + `ext/Chat/Chat.js`) | V2 (`ext/Chat/v2/`) | V3 (`ext/Chat/v3/`) |
|---|---|---|---|---|
| `{chat}` owner | `say()` | ✅ a bubble | ⬜ | ⬜ |
| `{chat}` smart reply (1,062) | smart seat | ✅ | ⬜ | ⬜ |
| `{place}` (2,790) | fast seat | ✅ `Widget.place()` (text only if `edit` is `improve`/`both`) | ⬜ | ⬜ |
| `{summary}`, `{refined}`, `{para}`, `{react}`, `{sent}` | fast seat, code, smart | ✅ | ⬜ (`sent` only for its marks) | ⬜ |
| `{tasks:{add:Prompt}}` + `raw.push` + `paragraphs` | code | ⬜ (only Tasks/Questions) | ✅ | ✅ |
| Prompt `title`/`text`/`replies` | smart seat | ⬜ | ✅ | ✅ |
| Question / Task | fast and smart seats | ✅ a row (`draw_task`) | ✅ | ✅ |
| live words (not in the file) | the browser | ✅ `Thread.live()` | ⬜ | ✅ by listening to V1's `chat-live` event |

"Pseudo lines" are the V1 rows: `chat`, `place`, `summary`, `refined`, `para`, `react`, `sent`, `quiet`, `nav`, `pause`. They are not item deltas; `core/Session`'s replay just stores the last one as a property (`Session.apply_line` → `put`).

## 4. What is dead or duplicated

| # | What | Proof |
|---|---|---|
| D1 | **Each sentence is written in two shapes**, `{chat}` for V1 and a Prompt for V2/V3. | `Sessions.say()`: `assign_prompt` then `write({chat})` |
| D2 | **Smart replies mostly miss V2 and V3.** 882 `{chat}` replies against 56 Prompt `replies.add` in the two big sessions (v-9dvbbrn 315/42, v-sq8y7db 567/14). | [scripts/](scripts/) |
| D3 | **The fast seat's cleaned text is used by V1 only, and 669 of its 2,790 placements (24%) are thrown away**: it writes `edit: "clean"`, a value its skill never names, and `Widget.place()` only applies `improve`/`both`. | `Widget.js:581`; skill: `improve`/`move`/`both` |
| D4 | **The skill promises "the cleaned text goes into the Prompt's paragraph"; nothing does that.** Paragraphs hold the raw words, written by code. | `SKILL.md` `edit`; `assign_prompt` |
| D5 | **The fast seat's grouping is almost unused:** 2,756 of 2,790 placements say `same`. | counts |
| D6 | **The fast seat re-reads everything, every time.** In v-sq8y7db: 1,130 model calls, 122.7 M input tokens, 33.6 M of them cache writes (the smart seat: 122.8 M, only 1.0 M writes). `voice_say` re-sends the whole prompt so far as a new message each turn. Registry cost: voice-assistant $844 over 21 sessions against session-smart $80 over 85 (unreconciled with the $263 script figure in `ai/roles-proposal.md`). | `scripts/seat-growth.mjs`; `registry.json` |
| D7 | **The fast seat went silent in 6 sessions** (spawned, zero placements): v-4lwslx3, v-7bnqmeh, v-lhvz99u, v-zg6h7hl, v-xhx7fmx, v-dwlaoin. Nothing in the file says why. | counts |
| D8 | **Three cleaners exist; the live chat uses none of the model ones.** `ux/Revise` and `RefineSystem.post_live` run only when `Widget.revision` is set, and it defaults to `false` (`Widget.js:124`). The 2026-10-20 map's "cleaned twice" is out of date for the live chat; `Sessions.refine()` still runs server-side. | `Mic.js:241,251,519` |
| D9 | **The live words exist only in one browser tab.** The Whisper log is global (`ai/whisper/bucket.jsonl`), not tied to a session, and V3 can only show the draft when V1's `Widget` is mounted beside it. | `Widget.js:828`, `ChatV3.js:153` |
| D10 | Docs out of date: `ux/Dictate/doc/fast-and-smart.md` (2026-10-25) and `ai/design-decisions-2026-10-27.md` §8 (pause the fast seat, LEANING) were never applied: `Sessions.js` last changed 2026-10-25. | `git log Servex/agents/Sessions.js` |

Earlier maps this builds on: [ux/Dictate/doc/map.md](/framework/ux/Dictate/doc/map.md) (every file, 2026-10-20), [ai/system-map.md](/framework/ai/system-map.md) (the whole stack, 2026-10-26), [ux/Dictate/doc/pipeline.md](/framework/ux/Dictate/doc/pipeline.md).
