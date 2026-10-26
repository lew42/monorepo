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
| **Session page "Chat" chip** (`AISessionConversation`) | the **Claude transcript** of an SDK agent, not `session.jsonl` | First chip on a session page | No | No |

Several parts of V1 are shared with V2: the ✓/🧠 cursor maker (`ext/Chat/cursors.js`), the "open bubble stays last" rule, and the session file.

### What V3 actually implements

Read-only, additive, 19 headless checks (`ChatV3.test.mjs`). One card per Prompt in time order. A Prompt touched in the last 8 s (`MOVING_MS`, mirrors Servex's `prompt_close_ms`) shows its raw words gray with no title; after quiet it redraws solid with title and cleaned text (smart seat's `text`, else the fast seat's paragraphs, else raw). Replies, Questions and Tasks sit inside the card. "show raw" opens the append-only chunks. The words still being spoken show as a faint dashed draft (the composer fires a `chat-live` window event, one line in `Widget.js`). It shows the newest 40 cards with "show earlier", and each card has a `#id` permalink. **Not built:** a Prompt per sentence (today new words append to the newest Prompt), a completion rule written by Servex (8 s of quiet is a client guess), grouping or summary cards, a per-task route.

## 3b. The session detail page

The page that shows one session. Code and tab detail: [ai/AISession](/framework/ai/AISession/readme.md).

- **Where it lives:** `ai/AISession/AISessionDetail.js` (`class AISessionDetail extends Page`). Routed by `AISessionsPage.child()` and `StoreFolder.child()` at the session's dated folder, `/framework/ai/sessions/YYYY/MM/DD/<folder>/`; the id url redirects there. Links come from `AISession.page_url(id, fallback)`; `AgentUrl.js` maps an agent name to its task folder.
- **Tabs** (`?tab=`): main = overview, timeline, chat, tasks; the More popover = board, coverage, cost, models, related. The old keys `work` and `conversation` map to tasks and chat. Chat and coverage show only when the session has prompts or is a VS Code tab.
- **Renderers:** overview = `SessionOutlineView` (`SessionOutline.js` holds the data, no DOM); timeline = `SessionTimeline`; tasks = `SessionTasksGrid` on `ext/DataGrid` with the nested `SessionWork`; board = `SessionOverview`; stats bar = `SessionStats`; cost = `AICost.cost_line`. The data is `SessionTasks` (`core/Session`) replaying `session.jsonl`. `SessionFeed.js` is the older flat list and is no longer wired in.
- **How it relates to the chat:** the Chat tab has three chips, kept in `?chat_view`. "Chat" is `AISessionConversation`, which wraps `ext/Chat/Chat.js` `chat()` and draws the **Claude transcript** (a fourth chat flavour). "Chat v2" and "Chat v3" mount `ChatV2` / `ChatV3` on `session.jsonl`, the file the sheet's chat reads. The sheet's chat follows the live voice session; the session page's chat is fixed to the session it shows.

## 3c. Lists, ids, replay and the tasks list (how the chat's data is held)

- **List** ([core/List](/framework/core/List/readme.md)): `List extends Item`, evented. `add`, `insert`, `remove`, `move` (can cross lists with `from`), `order`, `clear`, `replace` all work by id, and each one `announce`s its verb plus a `delta` event; that delta is exactly the JSONL line a Store appends. Views subscribe to the verbs and redraw only what changed. A member id is unique only among the siblings of one list, and an id that would shadow a property name of the list or its owner is refused. `Item.find(id)` searches every owned list at any depth, and `walk(fn)` is the deep traversal, so a tree of lists already has find and walk; no separate Tree class exists or is needed yet.
- **Ids:** the default is `crypto.randomUUID()`. Servex's `PromptLines.js` mints timestamped ids instead: `p-<ms>` (prompt), `q-<ms>` (question), `r-<ms>` (reply), each `max(Date.now(), last + 1)` per prefix, so they are monotonic and unique per process. The shape is arbitrary on purpose; nothing reads it. They are *not* unique across prefixes by construction, and nothing stops reuse after a remove.
- **JSONL delta replay:** `Item.set(delta)` applies one line (a key naming a method calls it; otherwise a property, a data key, or a child id found across the owner's lists, with nested deltas recursing into that child's `set`; otherwise it is stored and emits `change` and `delta`). `Item.replay(lines)` is `replay_new`, then `replay_line` per line (default `set`), then `replay_end`; `Item.open(src)` replays a file and keeps tailing it. A Page replays `page.jsonl` this way. A Session replays `session.jsonl` in one of two shapes: the task shape (spawned agents, first line `{assign}`, replayed by `Task.replay_line`) or the record shape (tabs and voice calls, first line `{session}`, replayed by `Session.apply_line`). Created times come from each line's time, in memory only.
- **The tasks list and prompts:** `session.tasks` is a List of Prompts, Questions, Tasks and child Sessions, all `Task` subclasses with a state and a completion. `Task.progress_of(list)` counts `{done, total, stopped}`; a stopped task counts in neither. A Prompt carries `plain_lists` (`raw`, `parts`, `refined`, `notes`), `paragraphs` and `replies`, and reads complete when everything it asks is settled. Servex is the only writer: it appends `{tasks:{add:{type:"Prompt",id:"p-<ms>",…}}}` as the owner speaks, then `{"p-<ms>":{…}}` deltas into the nested Prompt.
- **The V1 `chat` pseudo-property:** V1's lines (`{chat:{…}}`, `{place}`, `{refined}`) are not list operations. `Session.apply_line` falls through to `this.put(k, v)` for any unknown key, so replay just overwrites `session.chat`, and V1's view re-fetches `session.jsonl` and filters the raw lines itself. That is the part to retire; the proposal's "Lists and the chat" section says with what.

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

## 5. Proposed shape

Moved: what the shape SHOULD be (folder by folder, classes, the raw/refined prompt design, build order, top five moves) is in [system-proposal.md](system-proposal.md). This file is what IS.

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

## 9. Major pieces with no proper docs

- `Servex/agents/Sessions.js` (creates voice sessions, `say()`, `refine()`): no Servex-side doc of its own.
- The global voice session (`create_controller` in `ux/Dictate/chat.js`): only comments, no doc page.
- A generic Sheet: `ext/drawer/doc/sheet.md` documents the AI sheet, not a reusable one.
- Which chat version reads `place` / `refined` / `refine`: no single doc (this map's section 3 is the first).
- `ext/Session/readme.md` still names `session-fast`; the default fast seat is `voice-assistant`.

## Sources

[ux/Dictate/doc/pipeline.md](/framework/ux/Dictate/doc/pipeline.md) · [ux/Dictate/doc/map.md](/framework/ux/Dictate/doc/map.md) · [ext/Chat/readme.md](/framework/ext/Chat/readme.md) · [ext/Chat/v2](/framework/ext/Chat/v2/readme.md) · [ext/Chat/v3](/framework/ext/Chat/v3/readme.md) · [ext/drawer/readme.md](/framework/ext/drawer/readme.md) · [core/Session/readme.md](/framework/core/Session/readme.md) · [core/Task/doc/prompt.md](/framework/core/Task/doc/prompt.md)
