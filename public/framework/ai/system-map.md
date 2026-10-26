# System map: dictation, sheet, chat, session, task, prompt

Investigation only (2026-10-26). Nothing here changes code. Verified against the files named; where a fact comes from a doc and was not re-checked in code, it says so. Asked by the owner through the cloud voice agent: [the task](/framework/ai/sessions/2026/10/26/spawned/mastermind-system-map/).

## 1. The one-sentence pipeline

mic → Whisper (`ux/Dictate`) → live bubble in the composer → `POST /api/session/say` → Servex `Sessions.say()` → one line in the session's `session.jsonl` → SSE `GET /api/session/<id>/stream` (plus a 1.5 s file poll in `chat.js`) → every chat view redraws.

`session.jsonl` is one file, Servex is its only writer, and it holds **two line shapes side by side**:

- **Old shape (chat V1):** `{chat}`, `{place}`, `{summary}`, `{refined}`, `{react}`.
- **Task shape (chat V2, V3):** `{tasks:{add:{type:"Prompt"|"Question"|"Task", ...}}}`, `{"p-1":{...}}` edits, `{raw:{push}}`, `{paragraphs:{...}}`, `{replies:{add}}`. Written by `Servex/agents/PromptLines.js`, `Server/PromptRecords.mjs`, and the AIs through the item tool.

## 2. The parts: folder, classes, who creates it, when, where

| Part | Folder | Classes | Created by / when / where |
|---|---|---|---|
| **Dictation engine** | `ux/Dictate/` | `Dictate` (`Dictate.js`, the engine), `DictationBar`, `VoiceStrip`, `MicIndicator`, `Connection`, `DictateHealth`, `DictateDebug`, `DictateDocs`; plain modules `capture.js`, `push-to-talk.js`, `floor.js`, `repeat.js` | The mic is started by the composer (`ext/Chat/Mic.js`: `ComposerMic extends Dictate`) when a chat mounts, or by `push-to-talk.js`. It is not one global object: each mount owns its mic, and the sheet keeps its mic running when it is closed (`Sheet.close({keep_mic:true})`). |
| **The global voice session** | `ux/Dictate/chat.js` | **No class.** `create_controller({persist})` builds a controller object; one `GLOBAL` instance per browser tab, kept in `sessionStorage["lew42-voice-session"]` | Born on the **first sentence** (`ensure()` → `Session.start()` → `POST /api/session/new` → `Sessions.create()` in `Servex/agents/Sessions.js:804`, id `v-xxxx`). `Session.start()` is one shared promise, so two mounts make one session. Resumes within `resume_ms` unless "New session" set `fresh`. It survives navigation and a closed sheet because it lives in the controller and sessionStorage, not in a view. |
| **Chat V1 mount** (the default) | `ux/Dictate/chat.js`, `Widget.js` | `chat(el, opts)` is a function (line ~148), `Widget` (the bubble list), exports `session_switcher`, `new_session_button`, `ago`, `chat.current/resume/reset/on_change` | Mounted by every surface: `ext/drawer/Sheet.js`, `tabs/ai.js`, `tabs/sessions.js`, `ux/Dictate/page.js`, `push-to-talk.js`, `dev/DevBar/ask.js`, `ai/AIDashboard`, `ai/rail/rail.js`. |
| **Chat V1 drawing helpers** | `ext/Chat/` | `Chat.js` is a **function bag** (`chat()`, `speak`, `patch_piece`, `live`, `mergeable`, `sticky_scroll`, `place_live_cursors`); `ChatPanel`, `Composer`, `ComposerMic`, `Drill` are classes; `chunks.js`, `cursors.js`, `roles.js`, `strip.js` | Called by `Widget.js` (the V1 bubbles use `speak`, `patch_piece`, `live`). |
| **Is `Chat.js` used at all?** | | | **Yes.** Imported by `ux/Dictate/Widget.js`, `ext/drawer/ChatView.js` (`sticky_scroll`), `ext/Chat/page.js`, `ChatPanel.js`, `Drill.js`, `ai/cards/CardChat.js` (a card's chat) and `ai/AISession/AISessionConversation.js` (the session page's conversation). It is the engine for V1 bubbles *and* for card/session chats. It is not dead; it is a function bag that should be a class. |
| **Chat V2** | `ext/Chat/v2/` | `ChatV2 extends JSONL`, `ChatV2Model` (pure fold of lines), `report.js` (click/error/context reports through `/api/session/say`) | Mounted in place of V1's bubbles by `ext/drawer/ChatView.js` when the **v2 chip** is on (`lew42.sheet.chat_view = "v2"`). Draws the `tasks` list as a tree: Prompt at the root, replies, questions and tasks nested. Folds lines by hand; does not use the `Prompt` class. |
| **Chat V3** | `ext/Chat/v3/` (built in worktree `chat-v3`, task `2026-10-25/mastermind-v3-draft`, **already merged** to `michael/dev`) | `ChatV3 extends JSONL` | Behind the **v3 chip**, never the default. Replays task-delta lines into a real `core/Session` (the item tool's own replay), then draws a card per Prompt. See "What V3 actually implements" below. |
| **The sheet** | `ext/drawer/` (lowercase, mixed) | `Sheet extends View` (`Sheet.of(app)`), `SheetPanel extends View`, `SheetSize` (closed / strip / split / full), `SheetDock` (desktop right drawer, open by default at ≥1920 px), `AIPage extends Page` (route `<path>/ai/`), `ChatView` (the v2/v3 chips), `AIFeed` | The ✦ button (`menu.js`) opens it; on a phone a bottom strip raises it. The sheet **mounts chat** in `ensure_mount()` (`Sheet.js:415`) by calling `chat(this.$slot.el, ...)`. |
| **The drawer** | `ext/drawer/drawer.js`, `tabs.js`, `tabs/*` | `drawer(fn)` function; tabs are modules: `ai`, `debug` (was `dictation`), `docs`, `settings`, `element`, `sessions`, `admin` | The plain right-hand container for desktop. The AI tab mounts the same `chat()` plus `session_header` (`tabs/ai.js:139`). |
| **Sheet header dropdown** | `Sheet.js:263-303` | `SheetPanel.head_row()`, `toggle_menu()`, `choose()` | The title button reads "AI ▾". Its menu lists `tabs.shown()`: **AI (chat)** (the default) and the other tabs (Debug, Docs, Settings, Element). A pick opens that tab's body inside the sheet (the sheet goes full first). The "debug and others that don't work yet" are those other tabs: they are the *desktop drawer's* tab modules reused in the sheet, so the sheet has no panel/tab navigation of its own; it borrows `tabs.js`. A second path, `links()` (More: Debug, Docs, Settings, Open full AI), closes the sheet and opens the drawer instead. |
| **Session switcher** | `ux/Dictate/chat.js:379` | `session_switcher(mount)` function | Rendered in the sheet head by `SheetPanel.session_switcher()` (a thin wrapper), and in the desktop AI tab by `tabs/ai.js`. A "<session title> ▾" `ux/Popover` menu of `Session.recent_project({limit:12})` plus a bare "+" New session. **This is chat, but it lives in `ux/Dictate/chat.js` and is wrapped by the sheet.** |
| **Session client** | `ext/Session/Session.js` | functions only: `start`, `say`, `stream`, `watch`, `resume`, `recent_project`, `nav`, `floor` | Used by `chat.js` and the views. |
| **Session (the record)** | `core/Session/` | `Session extends Task` (since 2026-10-24); `AISession extends Session` (`ai/AISession/`, adds cost and cache) | The folder `ai/sessions/YYYY/MM/DD/<slug>/` with `session.jsonl`. A voice session's folder is made by `Sessions.create()` at the first sentence; a spawned agent's by Servex at `spawn_agent`. A session's `tasks` list holds tasks, projects, processes, child sessions, Prompts and Questions. |
| **Task** | `core/Task/` | `Task extends Item`, `Prompt extends Task`, `Question extends Task`, `Paragraph extends Item`, `TaskQueue` | Tasks are lines in a session's `session.jsonl`, written through the item tool; computed state replays them. |
| **Prompt** | `core/Task/Prompt.js`, doc `core/Task/doc/prompt.md` | `Prompt` with `raw` (append-only chunks), `paragraphs`, computed `sentences`, `title`, `text`, `replies`, `tasks`, `working`; completion computed on read | Written by `Servex/agents/PromptLines.js` (`add_prompt`, `push_raw`, `append_paragraph`) when `Sessions.say()` runs (line ~485), migrated by `Server/PromptsToSession.mjs`, mirrored to `prompts.jsonl` by `Server/PromptRecords.mjs`. `ext/Refine/Prompt.js` was renamed `PromptRun`, so core `Prompt` is the only class named Prompt. |
| **Old LLM refine path** | `ext/Refine/` (browser) + `Servex/agents/Sessions.js` `refine()` (line 666) + `Echo.js` + `Servex/ext/refine/` | `RefineSystem`, `Cleaner`, `Placement`, `Scorer`, `Outline`, `PromptRun`; Servex `Echo`, `LiveRefine` | **Still running.** `Sessions.say()` calls `this.refine()` (line 1021) for each finished owner line: two model calls (`clean`, `structure`) then one `{refined:{at,re,sentences,sections,flags,cost_usd}}` line. V1 draws it (`Widget.js` `draw_refined`, `chat.js:235`). V2 and V3 ignore it. `ComposerMic` also posts every chunk to `/api/refine/live` (`RefineSystem.post_live`), and `ux/Revise` calls `/api/tidy`, so a live chunk is cleaned twice. `Echo.js` separately runs the `refine_step` tool (references, asks_flags, done) on each owner prompt. |
| **The `{place}` line** | `Servex/agents/Sessions.js:70` | the `voice-assistant` role | The default fast seat (since 2026-10-17): woken per sentence, writes one `{place}` line saying where the sentence belongs. V1 reads it (`Widget.js` `settled`). The old `session-fast` chatter is the escape hatch (`session-assistant.txt`). |
| **The smart seat** | `Servex/agents/session-smart.md`, `WakePolicy.js` | `session-smart` agent | Fed by `WakePolicy`; writes titles, `text`, replies, Questions and Tasks through the item tool. It carries a "Chat v2" section of version-specific rules. |

## 3. Which chat version uses what

| | Reads | Default? | Uses `Prompt` class? | Uses `refine`/`place`? |
|---|---|---|---|---|
| **V1** (`Widget.js` + `Chat.js`) | `{chat}` `{place}` `{summary}` `{refined}` `{react}` | Yes | No | **Yes** (`place` and `refined`) |
| **V2** (`ChatV2`) | `tasks` lines, folded by hand | No (v2 chip) | No (its own model) | No |
| **V3** (`ChatV3`) | `tasks` lines, replayed into a real `Session` | No (v3 chip) | Yes, via `Session` replay | No |

Several parts of V1 are shared with V2: the ✓/🧠 cursor maker (`ext/Chat/cursors.js`), the "open bubble stays last" rule, and the session file.

### What V3 actually implements

Read-only, additive, 19 headless checks (`ChatV3.test.mjs`). One card per Prompt in time order. A Prompt touched in the last 8 s (`MOVING_MS`, mirrors Servex's `prompt_close_ms`) shows its raw words gray with no title; after quiet it redraws solid with title and cleaned text (smart seat's `text`, else the fast seat's paragraphs, else raw). Replies, Questions and Tasks sit inside the card. "show raw" opens the append-only chunks. The words still being spoken show as a faint dashed draft (the composer fires a `chat-live` window event, one line in `Widget.js`). It shows the newest 40 cards with "show earlier", and each card has a `#id` permalink. **Not built:** a Prompt per sentence (today new words append to the newest Prompt), a completion rule written by Servex (8 s of quiet is a client guess), grouping or summary cards, a per-task route.

## 4. Where the boundaries are wrong today

1. **Chat is split across `ux/Dictate` and `ext/Chat`.** The mount (`chat.js`), bubble list (`Widget.js`) and session switcher are in `ux/Dictate`; the engine (`Chat.js`), composer and mic are in `ext/Chat`. Already found in `ux/Dictate/doc/map.md` (D6, proposal 4).
2. **The sheet lives in a lowercase folder that is really four things:** the desktop drawer container, the sheet, the tabs, and the chat-version chips plus page inbox. The sheet has no panel navigation of its own; it borrows the drawer's `tabs.js`, which is why the "AI ▾" menu offers tabs that do not fit a phone.
3. **Chat features live in the sheet header.** The session switcher and the v2/v3 chips are chat concerns, drawn by `SheetPanel.head_row()`.
4. **The global voice session is not a class.** It is a controller object inside a function file, with state in sessionStorage; nothing can hold or inspect it as an instance.
5. **`Chat.js` is a function bag** used by three different chats (V1, card chat, session page).
6. **Two line shapes in one file.** V1 reads one, V2 and V3 the other; the smart seat writes both kinds of rule sets (`session-smart.md` carries V2-specific rules).
7. **Two prompt writers.** `PromptLines.js` (Servex, per sentence) and `PromptRecords.mjs` (`prompts.jsonl`) both create Prompts; V2 does not use the `Prompt` class at all (it folds lines by hand).
8. **Refining runs twice per chunk** in the live box (`Revise` and `RefineSystem`), and a third time on the server (`Sessions.refine()` and `Echo`), with no chat version that uses all of them.
9. **Too many tools** (section 6).

## 5. Proposed shape (no code; the owner's direction, 2026-10-26)

### 5.1 Everything is a class, with an instance hierarchy

```
App
 └─ Sheet            (generic: panels + tabs, knows nothing about chat)
     └─ Panel/Tab ── Chat   (a self-contained element)
 └─ Dictation        (one global instance per tab; owns the mic and the live draft)
 └─ Session          (core/Session; the record; one instance per session file)
     └─ Prompt (raw, one per Whisper sentence)
     └─ RefinedPrompt (groups raw prompts)
         └─ Question | Task
```

### 5.2 Sheet: reusable and generic

Move the sheet out of `ext/drawer/` into its own capitalised module (suggested `ux/Sheet/`; alternative `ui/Sheet` if the logic stays thin; it has gestures and size state, so `ux`). It owns: sizes (closed / strip / split / full), drag, header, a list of panels, the tab menu. It takes panels from the caller (`sheet.panel("AI", () => chat)`), so the **AI ▾ menu lists what the host registered**, and Debug/Docs/Settings are registered by the host or removed until they work. It never imports a chat. `drawer.js`/`tabs.js` stay as the desktop container until the same Sheet can dock there too (`SheetDock` already points that way). Keep `ext/drawer/rail.js` as a shim for old imports.

### 5.3 Chat: self-contained, usable anywhere

One `Chat` class (in `ext/Chat/`, absorbing `ux/Dictate/chat.js` and `Widget.js`) owns: the bubble/card view, the composer, the mic (built in, optional), the session switcher and the New session button, the current session. A caller passes `{session?, dictation: true|false}`. It mounts in the sheet, on a session page for an SDK session (no dictation, fixed session, no switcher), or alone. The global voice session becomes a `VoiceSession` instance the Chat can hold; a chat created without one just shows the session it is given. `Chat.js`'s function bag becomes methods on this class. The chat versions become three renderers behind the same class (`view: "bubbles" | "tree" | "cards"`), chosen by one setting instead of three chips in the head.

### 5.4 Prompts: raw first, refined by reference

- **Raw `Prompt`: one per Whisper sentence.** Fields `at` (timestamp), `text` (the Whisper sentence verbatim), optional `selection`. Appended to `session.jsonl` in order. **Never edited, never merged, never mangled.** Anyone can regenerate the transcript by reading the raw Prompt lines in order.
- **`RefinedPrompt`: a distinct line type** that groups raw prompts, with `title` and cleaned `text`.
- **Recommendation: put the link on the RefinedPrompt** (`of: ["p-1","p-2","p-3"]`), not an `assign` on the raw one.
  - *Why:* a raw line stays one immutable fact. Regrouping (two groups turn out to be one, a sentence belongs elsewhere) is a new RefinedPrompt line with a corrected `of`, not an edit to raw lines; nothing about the raw transcript is ever touched. The reverse index (which refined group does `p-2` belong to) is cheap and computed on replay by the class, which is what "compute, don't recall" asks for.
  - *The alternative* (an `assign` line on each raw prompt) would let a raw prompt "move" after the fact, so the transcript is no longer the file as written, and one regrouping writes N lines.
  - *When the alternative wins:* if a view needs the owner of one sentence without replaying the whole file (a per-sentence lookup on a huge log). A computed index covers it.
- **Each RefinedPrompt resolves to one of two outcomes:** a `Question` card (complete when answered) or a `Task` (complete when done). Completion stays computed on read; Servex writes the closing line.
- **The UI shows raw text first, then fades to the refined view.** Raw sentences appear gray the moment they are said (V3's gray-while-moving, but per sentence); when the RefinedPrompt that references them lands, the raw sentences collapse into it and "show raw" keeps them one click away. Exactly V3's idea, with a real "settled" signal (the RefinedPrompt line) instead of 8 s of quiet.
- **What this replaces:** the `{place}`, `{refined}` and `{summary}` lines and the double refining. The old `refine()` call becomes the thing that writes a `RefinedPrompt`.

### 5.5 One tool for the AIs

AIs write all of this through the single `item({path, delta})` tool: raw Prompt add, RefinedPrompt add, Question answer, Task complete. Servex writes raw Prompts itself (Whisper is code); the smart seat writes RefinedPrompts, Questions and Tasks.

### 5.6 Build order (smallest first)

1. Sheet extraction behind a shim (no behaviour change).
2. Chat class absorbing `chat.js`/`Widget.js` (V1 stays the default).
3. Per-sentence raw Prompt and the `RefinedPrompt` line type (write both old and new shapes until V3 is the default).
4. Switch the default view, then retire `{place}`/`{refined}` and the second cleaner.

## 6. Tools that could fold into `item`

The owner counts 100+ Servex tools. The cloud door lists about 110. Grouped by what they do; each duplicates `item` or another tool in its group:

- **Write a page, card, log or file by path** (`item` takes a path and a delta): `page_set`, `page_add`, `page_call`, `page_log`, `page_note`, `page_reply`, `add_item`, `create_page`, `create_card`, `card_set`, `card_reply`, `card_ask`, `attach_card`, `card_summary`, `append_log`, `dir_log`, `log`, `log_session`, `session_line`, `session_summary`, `append_prompt_event`, `amend_bubble`, `refine_step`, `place`, `file_to_group`, `set_layout`, `set_focus`, `cloud_voice_log`, `audit_session`, `owner_note`, `module_inbox`, `dated_create`, `write_file`, `edit_file`. (The Servex doc `ext/remote/doc/mcp-unify.md` already lists several of these as "arbitrary writes".)
- **Change a task's state** (a delta on the task item): `close_task`, `snooze_task`, `reprioritise_task`, `kill_task`, `rename_session`, `claim_topic`, `release_topic`, `follow`, `unfollow`.
- **Read an item** (`item` with no `delta` returns current state): `page_read`, `read_page`, `read_card`, `list_cards`, `list_pages`, `read_file`, `list_dir`, `glob`, `dated_query`, `list_follows`, `list_claims`, `list_waiting`.
- **Not item's job, keep:** `spawn_agent`, `send_to_agent`, `stop_agent`, `interrupt_agent`, `list_agents`, `wait_for_agent`, `take_worktree`/`return_worktree`, `start_server`/`stop_server`/`restart_server`, `shell`, `check_page`, `system_health`, and the wake/job tools. These start or inspect processes, not records.

Folding the first three groups removes roughly 60 tools; each fold is a small change inside `item` (a `type`-keyed delta) plus a one-line alias while old agents still call the old name. Not built here; listed so the owner can pick.

## 7. What belongs in `ui`, `ux`, `ext`

- **`ui/` (template-like, little logic):** the visual pieces with no state of their own: a bubble, a card, a tab strip, a sheet *frame*, a chip, a button. Take data in, emit events.
- **`ux/` (stateful behaviour, classes you extend):** `Dictate` (the engine and global dictation), `Sheet` (sizes, drag, panels), the live-draft behaviour, `Popover`.
- **`ext/` (opt-in addons core never imports):** `Chat` (as the class above), `Session` client, `Refine`, `JSONL`.
- **`core/`:** `Session`, `Task`, `Prompt`, `Question`, `Item`.

Today the sheet and the chat sit in `ext/drawer` and `ux/Dictate` and cross-import each other (`Sheet.js` imports `chat.js`; `chat.js` has the session switcher the sheet wraps). The proposed shape makes the arrow one-way: Chat knows nothing about Sheet, Sheet knows nothing about Chat, the host wires them.

## 8. Temporary and retired versions

- `ext/drawer/archive/sheet-chain-2026-10-16.js`: the four-class sheet chain, opt-in only.
- `ext/drawer/rail.js`: shim re-exporting `Sheet.js` (was `DrawerRail`).
- `ux/Dictate/v1/`, `variants/`, `playground/`, `workspace/`: experiments; see the Dictate readme.
- `ai2/chat.js`, `dev/DevBar/chat.js`, `ext/Ask/chat.js`: other chat-named files, each a different, older surface.
- `session-fast` agent: replaced by the `voice-assistant` seat (kept behind `session-assistant.txt`).
- `ext/Refine/Prompt.js` → renamed `PromptRun`.
- `core/Session/doc/one-replay-plan.md`: the plan for why V2's hand fold should go (plan only).

## Sources

[ux/Dictate/doc/pipeline.md](/framework/ux/Dictate/doc/pipeline.md) · [ux/Dictate/doc/map.md](/framework/ux/Dictate/doc/map.md) · [ext/Chat/readme.md](/framework/ext/Chat/readme.md) · [ext/Chat/v2](/framework/ext/Chat/v2/readme.md) · [ext/Chat/v3](/framework/ext/Chat/v3/readme.md) · [ext/drawer/readme.md](/framework/ext/drawer/readme.md) · [core/Session/readme.md](/framework/core/Session/readme.md) · [core/Task/doc/prompt.md](/framework/core/Task/doc/prompt.md)
