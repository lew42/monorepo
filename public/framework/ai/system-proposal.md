# System proposal: where the dictation, sheet, chat, session and prompt parts should live

Proposal only (2026-10-26, from the owner's direction through the cloud voice agent). Nothing here is built, and chat V1 and V2 must keep working at every step. [system-map.md](system-map.md) is what IS; this file is what SHOULD be. The reasons for each move are the "boundaries" list in the map, section 4.

## The shape in one picture

```
App
 ├─ Sheet            generic frame: sizes, drag, a list of panels. Knows nothing about chat.
 │   └─ panel "AI" ── Chat      a self-contained element
 ├─ Dictation        one instance per tab: owns the mic and the live draft
 │   └─ VoiceSession  the current voice session (today: a controller object inside chat.js)
 └─ Session          the record: one instance per session.jsonl (core/Session)
     ├─ Prompt          raw, one per Whisper sentence, never edited
     └─ RefinedPrompt   groups raw prompts (of: [ids])
         └─ Question | Task
```

The arrow runs one way: Chat does not know about the Sheet, the Sheet does not know about Chat. The host (the page, or the session detail page) wires them together.

## Folder by folder: what moves where

| Today | Proposed home | Why |
|---|---|---|
| `ext/drawer/Sheet.js`, `SheetPanel`, `SheetSize`, `SheetDock`, `rail.css` | **`ux/Sheet/`** (capitalised, its own readme). Keep `ext/drawer/rail.js` as a re-export shim. | The sheet has gesture and size state, so it is `ux`, not `ui`. A lowercase folder that holds four things (drawer container, sheet, tabs, chat chips) is why nobody can find the sheet. |
| `ext/drawer/drawer.js`, `tabs.js`, `tabs/*` | stay as the **desktop drawer** until the same Sheet can dock there (`SheetDock` already points that way) | No behaviour change on desktop. |
| `ext/drawer/ChatView.js` (the v2/v3 chips) | **`ext/Chat/`**, as the view setting of the Chat class | A chat concern is drawn in the sheet header today. |
| `ux/Dictate/chat.js`, `Widget.js` (mount, bubbles, `session_switcher`, `new_session_button`) | **`ext/Chat/Chat.js` as one class** | Chat is split across two folders today; `ux/Dictate/doc/map.md` already found this (D6, proposal 4). |
| `ext/Chat/Chat.js` function bag (`chat`, `speak`, `patch_piece`, `live`, `sticky_scroll`) | **methods on the Chat class** | Three different chats (V1, card chat, session page) use the bag; one class means one fix reaches all of them. |
| the global voice session (`create_controller` in `chat.js`, sessionStorage `lew42-voice-session`) | **`VoiceSession` class** next to `Dictation` in `ux/Dictate/` | Today nothing can hold or inspect it as an instance. |
| `ext/Session/Session.js` (functions only) | stays an `ext` client; its calls become methods on `VoiceSession` | The client is plumbing; the class owns the state. |
| `core/Session/Session.js` (`Session extends Task`) | **`ai/` (`framework/ai/Session/`)** | `core/Session/readme.md` already says it is "mainly an AI session class" and "probably belongs in the framework/ai module". Core should not hold the AI system's record. Leave `core/Session/Session.js` re-exporting so imports keep working. |
| `core/Task/Prompt.js`, `Question.js`, `Paragraph.js` | **stay in `core/Task/`** with `Task`; add `RefinedPrompt.js` beside them | They are tasks (`Prompt extends Task`), and `Task` is the base other modules extend. Moving Session out while Task stays is clean: `ai` imports `core`, never the reverse. *Alternative:* move all of Prompt/Question to `ai/` with Session; it wins only if nothing outside the AI system ever makes a Prompt. |
| `ai/AISession/` (session detail page and its tab renderers) | stays | It already has the right job; it mounts the Chat (below). |

## Classes

- **`Sheet`** (generic): sizes, drag, header, `sheet.panel("AI", () => chat)`. The "AI ▾" menu lists only what the host registered, so Debug/Docs/Settings/Element appear when the host registers them or are removed until they work.
- **`Chat`** (one class): the view, the composer, the mic (built in, optional), the session switcher and the New session button. A caller passes `{session?, dictation: true|false}`. It mounts in the sheet (global voice session, switcher, mic), on a session detail page (a fixed session, no switcher, no mic), or alone. The three versions become renderers behind it (`view: "bubbles" | "tree" | "cards"`, today V1, V2, V3), chosen by one setting instead of two chips in the sheet head.
- **`VoiceSession`**: the controller today, as a class with the same `ensure()` (one shared promise), `reset()` and `fresh` rules.
- **`Dictation`**: the engine is already `Dictate`; the proposal only gives the one-per-tab instance a name and a home.
- **`RefinedPrompt`**: new; see below.

## How the session detail page and the chat fit

The detail page ([`ai/AISession/AISessionDetail.js`](/framework/ai/AISession/AISessionDetail.js)) has a Chat tab with three chips today: "Chat" (the Claude transcript, `AISessionConversation`), "Chat v2" and "Chat v3" on `session.jsonl`. With one `Chat` class the tab mounts `new Chat({session})` and the chips become the `view` setting; the transcript view stays a fourth `view` because an SDK agent's words live in the Claude transcript, not in `session.jsonl`.

## Prompts: raw first, refined by reference

- **Raw `Prompt`: one per Whisper sentence.** Fields `at`, `text` (the sentence verbatim), optional `selection`. Appended to `session.jsonl` in order. Never edited, never merged. Reading the raw lines in order regenerates the transcript.
- **`RefinedPrompt`: its own line type** that groups raw prompts, with `title` and cleaned `text`.
- **Put the link on the RefinedPrompt** (`of: ["p-1","p-2","p-3"]`), not an `assign` on each raw prompt.
  - *Why:* a raw line stays one immutable fact. Regrouping is one new RefinedPrompt line with a corrected `of`, not N edits. Which group a sentence belongs to is a reverse index the class computes on replay ("compute, don't recall").
  - *The alternative* (an `assign` on each raw prompt) lets a raw prompt "move" after the fact, so the file stops being the transcript as written.
  - *When the alternative wins:* a view that needs one sentence's owner without replaying a huge log. A computed index covers that.
- **Each RefinedPrompt resolves to a `Question`** (complete when answered) **or a `Task`** (complete when done). Completion stays computed on read; Servex writes the closing line.
- **The UI shows raw first, then fades.** Raw sentences appear gray the moment they are said (V3's gray-while-moving, per sentence). When the RefinedPrompt that references them lands, they collapse into it and "show raw" keeps them one click away. V3's idea with a real "settled" signal instead of 8 s of quiet.
- **Replaces** the `{place}`, `{refined}`, `{summary}` lines and the double refining: `Sessions.refine()` becomes the thing that writes a `RefinedPrompt`.

## One tool for the AIs

AIs write all of this through `item({path, delta})`. Servex writes raw Prompts itself (Whisper is code); the smart seat writes RefinedPrompts, Questions and Tasks. The map's section 6 lists about 60 Servex tools that are one `item` call in different clothes (page, card, log, file writes; task state changes; reads). Fold them behind `item` with one-line aliases while old agents still call the old names, then retire the aliases.

## Build order (smallest first, each step keeps V1 and V2 working)

1. **Extract the Sheet** to `ux/Sheet/` behind a shim. No behaviour change.
2. **Chat class** absorbing `chat.js`, `Widget.js` and the `Chat.js` bag. V1 stays the default; the session detail page mounts it.
3. **Per-sentence raw Prompt and the `RefinedPrompt` line type.** Write both old and new line shapes until V3 is the default.
4. **Switch the default view**, then retire `{place}` / `{refined}` and the second cleaner.
5. **Move `Session` to `ai/`** with a re-export in `core/Session/`, and fold the tools into `item` as time allows.

## The top five moves

1. Pull the Sheet out of `ext/drawer` into `ux/Sheet`, generic, with panels the host registers.
2. Make Chat one class in `ext/Chat` that owns the mic, the session switcher and the view choice, and mount it everywhere (sheet, card, session page).
3. Make the global voice session a class (`VoiceSession`) instead of a controller hidden in `chat.js`.
4. Store raw Whisper sentences untouched and group them with a `RefinedPrompt` line that points at them.
5. Move `Session` to `framework/ai`, and fold the 60 look-alike tools into `item`.
