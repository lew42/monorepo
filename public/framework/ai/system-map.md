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

## 3d. The voice session, question by question (audited 2026-10-26 against the code)

Line numbers are in `Servex/agents/Sessions.js` unless a file is named. The answers come from the code, not from older docs. What could not be found is listed under "Doc holes".

**Who creates the fast and the smart agent, and when?**
- Servex, one pair per voice session, never shared. `create()` (804) mints the session and `prewarm_fast()` (837) wakes the fast seat at once. The smart seat is woken by the first `say()` (996). Both go through `wake()` (1348) then `spawn()` (1282).
- **Fast seat:** role `voice-assistant`, id `voice-assistant-<session id>`, effort low, no built-in tools, system prompt `.claude/skills/voice-assistant/SKILL.md`, keeps Servex's `item` door. The seat is chosen by `session_assistant()` (70): file `session-assistant.txt`, else env `SERVEX_SESSION_ASSISTANT`, else `voice`. The older `fast` seat (`session-fast.md`) is still selectable.
- **Smart seat:** role `session-smart`, effort medium, full tools. The model drops a tier when usage is over pace, and `openai/gpt-6-luna` is the fallback after a usage-limit refusal (`claude_model()` 1276).
- At most `max_pairs` = 2 pairs run at once; an idle pair sleeps after 30 minutes.

**What happens on "New session"?**
- Browser: `reset` in `ux/Dictate/chat.js` (102) clears the tab's id in `sessionStorage["lew42-voice-session"]`; the next `ensure()` (69) POSTs `/api/session/new`.
- Servex `create()`: unless `fresh` is set, a session under 60 minutes old (`resume_ms`) is **resumed instead** (819). Otherwise it mints `v-<time36><rand>`, writes `ai/sessions/YYYY/MM/DD/<id>/session.jsonl` with line 1 `{session:{id,home,kind,at,project,host,fast:null,smart:null,backing}}`, a presence line in `<home>/ai/log.jsonl`, and a row in `sessions.json`. No agent exists until the fast one is prewarmed straight after.

**What happens when I switch to an old session, or Servex restarts?**
- Switch: the switcher (`chat.js` 379) lists `GET /api/sessions`; `resume_to` (95) sets the id; `resume()` (843) writes no line, spawns no smart agent, only prewarms the fast seat.
- Restart: `load()` (497) rebuilds from `sessions.json` and drops any open floor or prompt. If the last chat line was the owner's, `unanswered()` (545) appends a system line "Servex restarted; say it again". No agent is respawned at boot; the next `say` calls `wake()`, which resumes the SDK session from `s.backing[role]` when model and cwd still match, else starts fresh with the last 40 lines as context, and writes a `{backing}` line (1384).

**Where does a raw sentence go first?**
- The mic (`ext/Chat/Mic.js`) hands it to `deliver` (`chat.js` 167), which calls `Session.say` (`ext/Session/Session.js` 79), a POST to `/api/session/say` (route 1560). The only client identity is `said_at`, the phone clock corrected by an offset learned from earlier replies. There is no client-made id.
- `say()` (996) then writes, in order: a `nav` line if the page changed; `assign_prompt` (482), which appends to the **open** Prompt (`push_raw` + `append_paragraph`) or mints `p-<ms>`; the `chat` line `{at, session, path, from, via, text, prompt, raw, said_at, floor, cues}`; a fire-and-forget `refine()` (666; only for 2+ sentences or 15+ words, and not while still speaking) that later writes `{refined}`; a wake of the fast agent (at once, or when a held thought is released, `release_thought` 1191); and a `sent` line (630).
- Servex does not dedupe `say`; the only guard is the browser's `same_as_last_send` (4 s).

**What does each seat do per sentence?**
- **Fast, every sentence:** one `{place:{re, to:"same"|"paragraph"|"card", edit:"improve"|"move"|"both", text, where?, title?}}` through `item`, optionally a `{summary}` once a card holds 2+ sentences, and for a question a `Question` (`tasks.add`, `q-<ms>`). It files no Tasks and writes no chat reply.
- **Smart, batched:** woken by timing knobs (`gap_ms`, `every`), typed lines, the mic going off, and cues such as `(paused 6 s)`, `(asked)`, `(6 sentences)`. It files Tasks, answers Questions, refines Prompts (`{"p-…":{title,text}}`), adds replies, names the session, writes `chat` lines through `session_line`, and can spawn agents and send owner notes.

**Is it one Prompt per sentence?**
- No: **one Prompt per utterance, and it grows**. A Prompt closes after 8 s of quiet (`close_prompt_later` 1162), when a reply lands (`reply_closes_prompt` 1173), when a held thought is released, when a line is typed, or on restart. Each sentence is one `raw` entry, so the `raw.push` lines are the per-sentence record.

**What is in a voice session's files?**
- Only `session.jsonl` (plus `index.json`); voice sessions write no `prompts.jsonl` (that is for VS Code tabs, `PromptTasks.js` 83). Content lines: `session`, `chat`, `tasks.add` (Prompt, Question, Task), keyed Prompt edits, `place`, `summary`, `refined`, `backing`, `log`. Plumbing lines: `sent`, `quiet`, `pause`, `select`, `nav`, `skip`, `para`, `react`.
- Biggest recent one, `v-sq8y7db` (8359 lines, 2.7 MB): about 1650 `place`, about 1640 owner `chat`, 1581 `raw.push`, 622 Prompts and 42 Tasks, 553 assistant chat lines, 400 `ms` and 684 `delay_ms` timing lines. `v-9dvbbrn`: 5625 lines, 285 Prompts.

**Why does the session page show "thousands of prompts"?**
- 622 is the real Prompt count; **8359 is the Timeline row count**, because `SessionTimelineRows` draws one row per `session.jsonl` line (61-104) and `place`, `sent`, `quiet`, `raw.push` and paragraph lines are "plumbing" rows. Plumbing is hidden by default (`HIDDEN`, `SessionTimeline.js` 15) but still counted in the totals (65-84). The 622 is inflated because the 8 s and reply closes split one thought into several Prompts. Nothing collapses consecutive pushes. Not proven: whether the owner saw the 8359 or the 622.

**How do the chats and the page relate?** All read the same `session.jsonl`. V1 (`chat.js` + `Widget.js`) polls Range requests every 1.5 s plus an SSE stream, replays from line 0 on every attach and dedupes by `at`; it draws `chat`, `place`, `refined` and task lines, merging lines into one bubble when the gap is under 8 s (`MERGE_GAP_MS`). V2 (`ChatV2Model`) folds `tasks.add`, keyed edits, `raw.push`, `paragraphs` and `replies` by hand. V3 filters task lines and replays them into a real Session.

**The fast seat, precisely (verified 2026-10-26).**
- **Default role:** `voice-assistant` (a `roles.js` row, prefix `voice-assistant`, tier fast, effort low) with the skill `.claude/skills/voice-assistant/SKILL.md`. `session-fast` was retired 2026-10-17 ("drop the fast assistant for now") and its row and brief stay on disk only as the escape hatch: write `fast` into `%LOCALAPPDATA%\lew42\servex\session-assistant.txt` and restart Servex (the file survives restarts; an env var does not reach a relaunched Servex). `ASSISTANTS = ["fast","voice"]`, read once at boot.
- **Lifetime:** one long-lived SDK agent per voice session, prewarmed at create or resume, never one per sentence. It sleeps with the pair after `idle_ms` (30 min) and is resumed from `backing`.
- **Woken with:** each time a sentence is finished, the **whole prompt so far plus the new sentence** (SKILL.md), and the session file path to write to. It runs urgent, ahead of the smart seat.
- **Writes:** exactly one `{place:{re, to, edit, text, where?, title?}}` per sentence through `item`. `re` is the sentence's `at`; `to` is `same` (stay in the bubble), `paragraph` (start a new one) or `card` (own titled card); `edit:"improve"` carries `text`, the cleaned sentence (punctuation, filler, capitals, never a paraphrase); `move` relocates without text; `both` does both. For a question it also files a `Question` task.
- **Revision today:** the browser applies a `place` as a patch keyed by `re` (`Widget.place`, `Widget.js` 577): the cleaned text replaces the piece and `settled` marks the sentence "no longer raw". Nothing stops a second `place` for the same `re`; the second patch overwrites the text, so **the latest place line wins and the fast seat can revise**. A `card` class cannot be taken back, and a `place` for an unknown `re` is silently dropped (`return false`); a place whose sentence is not last in its bubble is forced to `same` ("late split").

**Transport.**
- **Browser to Servex:** `POST /api/session/<verb>` (`start`, `say`, `settings`, others). `say` carries `{session, path, text, via, raw, floor, cues, quiet_ms, said_at, re?, thread?, selection?, kind}`. The browser calls it through `ext/Session/Session.js`.
- **The `{chat}` line:** every `say` appends one `{chat:{at, from, via, text, prompt, raw, said_at, floor, cues}}` to `session.jsonl`, and the same message goes out on the live wire.
- **Delays:** `quiet_ms` = 1500 ms is the hold for a typed/sent line; `answer_quiet_ms` = 2500 ms is how long the owner must be quiet (or the mic off) before a held thought is released to the smart seat; `hold_max_ms` = 8000 ms is the cap; `gap_ms` and `every` (`WakePolicy.js`, per session in `sessions.json`, settable by `POST /api/session/settings`) batch the smart wake. The Prompt itself closes after 8 s (`close_prompt_later`).
- **Live stream:** Server-sent events per session. `open_stream` (1538) serves `text/event-stream`, `push(id, msg)` (1531) writes every line and every partial reply (`{kind:"stream", role, text}`) to all connected clients, and replays in-flight replies on reconnect. The browser uses `Session.stream(id, fn)` (`chat.js` 300), an `EventSource`, which reconnects itself (the dev server's `/servex` proxy cuts a stream at 30 s). Besides the stream, V1 re-reads `session.jsonl` by Range request every 1.5 s. The Whisper stream (raw words as they are heard, before `say`) is a separate path in `audio/Whisper`; **not traced in this pass** (doc hole 9).
- **Does the old `ext/Refine` path still run?** Yes. `Sessions.js` imports `clean` (`engine.js`) and `structure` (`structure.js`) at lines 13-14, and `say()` calls `refine()` fire-and-forget for any owner line that passes `worth_refining` (2+ sentences or 15+ words, and `floor` not `"speaking"`). It writes the `{refined}` line the V1 and V3 views draw. So a long sentence is cleaned **twice** today, once by the fast seat's `place`/`improve` and once by `refine()`.
- **Owner's intent for the proposal** (2026-10-26): the fast seat does ONE first pass per sentence and never revises it; the smart seat does the intelligent work (refined prompts, tasks, questions). Today's patch-by-`re` allows revision, so the proposal makes it a rule (see the proposal's change 21).

**Doc holes (not answered, or no doc):**
1. No doc for `Sessions.js` as a whole (create, wake, sleep, `max_pairs`, the `say` order above); only code comments.
2. The wake knobs (`gap_ms`, `every`) and exactly what wakes the smart seat were not verified.
3. Why Agents.js `revive()` skips session agents (what sets `revivable`) was inferred, not read.
4. The handlers for `place`, `session_line`, `session_summary` in `tools.js` were not read; the write path is known only from the key list in `page_tools.js` 417.
5. The `/api/sessions` row shape and the Servex-side SSE emitter.
6. Whether the stored `chat` line keeps the client `at` or Servex's own after `retag`; this decides ordering rules.
7. No doc says a Prompt is a growing utterance rather than a sentence; every older doc says "prompt" without saying which.
8. `Assistant.js`, `Global.js`, `Registry.js` and `roles/*` were not read for this pass.
9. The Whisper stream path (raw words before `say`), the exact route names of `/api/session/<verb>` beyond `start`, `say` and `settings`, and whether List `announce` bubbles from a nested list up to the session.
10. `ux/Dictate/doc/voice-assistant.md` is the fast seat's plan; whether it still matches the SKILL.md after the 2026-10-17 landing was not compared.

## 3e. Pseudo-properties: every line type that is not a real property or list operation (audited 2026-10-26)

**The rule today.** `Session.replay_line` (`core/Session/Session.js` 78) strips `by`, `ts`, `at`, `session`, then `apply_line` handles only `stop`, `start`, `task`, `tasks`, `settings`, `decide` and nested ids as real operations. **Everything else falls to `put(key, value)` (line 125): the last value wins and no history is kept.** So replaying the file gives no chat, no places, no reactions; each view re-reads the raw file and filters the lines itself. Only the spawned-agent "task" shape goes through `Task.replay_line` (`Task.js` 533).

**The owner's decision (2026-10-26): move away from them.** Replay must be plain "apply every delta to get the instance state", and every line maps to a real property or a list operation. The replacement for each is in the proposal (change 24).

Counts are from `v-sq8y7db` (8359 lines). Writers are in `Sessions.js` unless named.

| Line | Count | Written by | Replay today | Read by (re-filtered from the raw file) |
|---|---|---|---|---|
| `chat` | 2217 | 1020 (owner), 954 (smart), 1476/1497 (assistant), 389/555/1252/1327 (system) | `put`, last one survives | `chat.js` 259, `ext/Session/Session.js` 267, `ChatV2Model` 15, `SessionTimelineRows` 92, `find_line` 1139 |
| `place` | 1654 | the fast seat via `item` (`page_tools.js` 417) | `put` | `chat.js` 232, `Widget.place` 577 |
| `sent` | 684 | `mark_sent` 635 | `put` | `chat.js` 233, `Widget.sent`, `ChatV2Model` 20 |
| `quiet` | 417 | 1219 | `put` | `SessionTimelineRows` 95 only |
| `react` | 268 | 1118 (owner), 1475 (assistant) | `put` | `chat.js` 230, `Chat.js` 364/885 |
| `refined` | 62 | `refine()` 680 | `put` | `chat.js` 235, `Session.js` 286, `Widget.js` 346 |
| `nav` | 55 | 1067 | `put` | dropped by `entry()` |
| `pause` | 38 | 1234 | `put` | nothing found |
| `backing` | 11 | 1384 | `put` | `ext/Session/Session.js` 288 |
| `log` | 5 | 1002 | `put` | `SessionTimelineRows` 75 |
| `para`, `select`, `skip`, `summary` | 0 here | 1462, 1244, 1469/1470, item tool | `put` | `chat.js` 231, 234; `Widget.js` 277 |
| `sessions`, `find`, `content`, bare `{by,ts}` | few | item tool or a mastermind | `put` | `sessions` in the timeline; the rest nothing |
| `session` (line 1) | 1 | 827 | stripped; only `kind` kept | `replay_new` |
| **Real operations:** `tasks.add` (664), keyed Prompt edits (2052: `raw`, `paragraphs`, `replies`, `title`/`text`, `complete`, `stop`) | | `PromptLines` via 485-490; smart seat via `item` | list ops and `Prompt.replay_line` | `ChatV2Model`, `ChatV3`, outline |

**A line that is lost.** `v-9dvbbrn` has `{"content":{"p-…":{"tasks":{"add":{"id":"q-1793048185470",…}}}}}`: `apply_line` `put`s it as a property named `content`, so the Question it adds never exists in any view (only 16 such `content` lines; one Question there). Plain proof that unknown keys drop data.

**Doc holes:** the plan for this is `core/Session/doc/one-replay-plan.md` (not built); `pause` and `find` have no reader.

## 3f. What a `v-<id>` voice session is, and the three voice things (audited 2026-10-26)

**Is `v-<id>` a real SDK session? No: it is a wrapper record.**
- `create()` mints `v-<time36><rand>` (`Sessions.js` 821) and writes line 1 `{session:{…, fast:null, smart:null, backing:{…null}}}` plus a row in `sessions.json`. It has no Claude transcript of its own. Those line-1 `fast`/`smart` fields are always null.
- The two SDK sessions behind it are spawned by `wake()` (1377-1384), which records the agent id in `sessions.json` (`voice-assistant-v-9dvbbrn`, `session-smart-v-9dvbbrn`) and the SDK uuid in `backing`, then appends a `{backing:{at, fast, smart, how}}` line (latest wins). Example `v-9dvbbrn`: line 2 (+0.2 s) holds the fast uuid `e006ac9c…`, line 5 the smart uuid `5644835c…`; later `how:"resume"` lines reuse both. The transcripts live under `~/.claude/projects/c--Code-lew42-monorepo/` (fast 73 MB, smart 7 MB).
- **`voice-assistant-v-<id>` is the fast seat** (`fast_seat:"voice"`, `Sessions.js` 1288). Older sessions had `session-fast-v-<id>`: `sessions.json` holds 67 of those (registry start 2026-09-30 to 2026-10-17, e.g. `v-d2pkfij`, `v-4eumhe6`, `v-qdb0cdv`) and 21 `voice-assistant-v-*` from 2026-10-17 (e.g. `v-qyb352y`, `v-8olmat5`, `v-9dvbbrn`). 8 voice-like rows have no fast agent (`v-qj7yrho`, `v-rzd5ehk`, and the `cloud-voice-*` rows).
- **Cost is counted once, correctly.** The indexer treats `v-` as record-only (`AISessionIndex.mjs` 121-132): its own `usd` is 0 and `tree_usd` is the sum of its children (318-329). `v-9dvbbrn`: fast $28.95 + smart $22.48 = `tree_usd` 51.43, `children: 2`. The *registry* row cost is unreliable (193.57 and 24.81 for the same two; `cost-accounting.md` 22 calls it inflated, resumes double-count, `turn-costs.js` 4-10); do not read cost from there. The honest-shape fix is below.
- **`session-assistant.txt` is a boot-time switch** between `fast` and `voice` (`Sessions.js` 70-85). The file does not exist on this machine, so the value is the default `voice`. Only `session_assistant()` reads it. It is a leftover escape hatch from the 2026-10-17 swap, not a feature: the proposal retires it (change 27).
- **Who creates a v- session:** `POST /api/session/new` (`Sessions.js` 1560; earlier text in 3d said `/start`, which is the older name). By hand: the first sentence or typed line after "New session" (`chat.js` 74 `ensure()`), and the drawer's AI tab for a card (`ext/drawer/tabs/ai.js` 344). **Automatically, no click:** `Layers.session_for` (`Layers.js` 584-591), reached from `card_prompt_session` (the owner's words on a card) and `page_ai` (`POST /api/page-ai`); it resumes the newest session under an hour old, else creates one. Creation prewarms the fast agent at once.

**The honest shape (proposal change 26).** A voice session is a *conversation record*; the SDK sessions are *workers attached to it*. Say so in the data, not in a null field:
- Drop the always-null `fast`/`smart` fields in line 1; the `backing` line is the single record of which SDK sessions serve the record (rename it `seats`: `{seats:{fast:{agent, uuid}, smart:{agent, uuid}}}` as a list-op or a real property).
- A voice session reports cost only as the sum of its seats, computed by the indexer from the seats' own transcripts (already how it works); nothing reads the registry cost for it. A seat's SDK session names its record as parent (already `parent:"v-…"`). This is a rename plus one rule, not a rebuild.
- *Alternative:* make the smart seat the session (its transcript IS the conversation) and the fast seat a child. Wins if the owner wants "a voice session is a real SDK session"; costs a big change, since today the smart seat does not see every sentence.

**Three different voice things, kept apart**

| | What | Code | Record | Agents |
|---|---|---|---|---|
| (a) | The website's global voice assistant (the sheet) | `Sessions.js`, `ux/Dictate/chat.js`, `ext/Session/Session.js` | `v-<id>` folder under `ai/sessions/YYYY/MM/DD/` | `voice-assistant-v-<id>` (fast), `session-smart-v-<id>` (smart) |
| (b) | The cloud voice agent (Claude app through the remote MCP) | `Servex/ext/remote/RemoteMCP.js`, [cloud-voice-agent.md](/Servex/ext/remote/doc/cloud-voice-agent.md), `/live/` | a `cloud-voice-<name>` row (`kind:"cloud-voice-agent"`, `fast`/`smart` null, `cost` null unless it states one) | the voice model itself is the Claude app, not an SDK agent; `ask_mastermind` spawns a real `mastermind` named `voice-<short>` (Opus) |
| (c) | A VS Code mastermind tab acting as a voice assistant | skills `voice-mastermind`, `every-prompt`; `register_session` (`External.js`) | a `kind:"external"` registry row plus an inbox file | none; Servex has no process or accounting for it |

**Leftover fragments:** the `assistant` role row (`roles.js` 55) and `session-fast` row (95), both retired, and `session-fast.md` still on disk; `ASSISTANTS = ["fast","voice"]` and the `FAST_NAMED` regex (`Sessions.js` 79, 65); header comments in `Sessions.js` (118, 136-139) that still describe the old pair and "first say spawns"; Servex still boots an always-on `Assistant` (`Servex.js` 222-229, `SERVEX_NO_ASSISTANT`), unchecked whether anything uses it; `cloud-voice-*` rows whose cost nothing sums (whether `voice-<short>` rolls into that row was not traced).

## 3g. Every prompt-refinement system, and whether it runs (census 2026-10-26)

The older list of eight, with how they differ: [doc/prompt-refinement-map.md](doc/prompt-refinement-map.md). That page misses the voice fast seat's own `{place}` path (row 1), which is the only one running every sentence today, and calls PromptTasks live when it is switched off. "Runs" was checked in the real session files and `%LOCALAPPDATA%/lew42/servex`; "works" means it produced well-formed output, not that quality was judged (nothing was run).

| # | System | Files | Called by | Runs today? | Keep / merge / retire |
|---|---|---|---|---|---|
| 1 | Voice fast seat `{place}` (`edit: improve` or `clean`) | skill `voice-assistant/SKILL.md`; written by the seat through the item tool | the always-up `voice-assistant-<id>` agent, woken per sentence | **Yes, every sentence.** `v-9dvbbrn`: 975 `place`, all `improve`, latest 10-26. `v-sq8y7db`: 1654 (669 clean, 164 improve, 821 nothing) | **Keep, as the one first pass** (change 21) |
| 2 | `{refined}` line from `Sessions.refine()` gated by `worth_refining` | `Servex/agents/Sessions.js` 97, 666, called at 1021 | `Sessions.say()` on a finished line of 2+ sentences or 15+ words | **Yes, sparse.** `v-9dvbbrn` 5 lines, `v-sq8y7db` 62 (last 10-25); one `clean` plus one `structure` call each | **Merge into the smart seat's refiner** (it cleans twice what row 1 already cleaned) |
| 3 | `clean()` / `structure()` engine | `ext/Refine/engine.js`, `structure.js` | rows 2, 6, 13 and `/api/refine` | indirect | **Keep as the one engine** behind a single caller |
| 4 | Live dictation refine | `Servex/ext/refine/LiveRefine.js`, `LiveClean`, `Annotator`, `ClarityScorer`, `TagRouter`; client `ext/Chat/Mic.js` (`refine_tick`, `refine_final`) and `ext/Refine/RefineSystem.js` | Mic to `POST /api/refine/live` | Code path live, **no fresh output** (newest `prompts.jsonl` stages from 10-25) | **Retire as a second chat refiner**; its card/outline output is the RefinedPrompt idea (merge into change 10) |
| 5 | `Placement` (rules, `use_model` false) | `ext/Refine/Placement.js`, `doc/placement.md` | `RefineSystem.js` | unverified, no caller turns the model on | **Retire** (row 1 does the placing) |
| 6 | Echo + `refine_step` tool | `Servex/agents/Echo.js`, `echo.md` | only when `SERVEX_ECHO=on` | **Dormant**: 0 `refine_step` lines; newest per-session echo log 10-08 | **Retire** with the `refine_step` tool |
| 7 | PromptTasks + PromptRecords `live` (a prompt into tasks) | `Servex/agents/PromptTasks.js`, `Server/PromptRecords.mjs` | `hooks.prompted` | **Off**: `prompt-tasks.off` (10-25); no source-linked tasks on 10-26 | **Keep the parts step, merge it as the smart seat's job on the Prompt**; drop the separate hook |
| 8 | `PromptRecords --process review`, prompt-breakdown plan, `PromptTrace`, `PromptsToSession` | `Server/*` | by hand | not run on 10-25/26 | keep `review` (replaces rows 9, 10, 11) |
| 9 | `RefineQueue` (`refined` cards on the Coverage tab) | `Server/RefineQueue.mjs`, `RefinedCard.js` | by hand | last run 10-23 (91 runs, 1357 asks) | **Retire** for new prompts; keep old cards as history |
| 10 | `PromptAudit` | `Server/PromptAudit.mjs` | by hand | last outputs 10-21/22 | **Retire** (review replaces both passes) |
| 11 | Day batch tools | `Server/refine.mjs`, `refine-days`, `DayPromptsRefine`, `refine-litmus` | by hand | last output 10-13 | **Retire**; keep `refine.mjs` prompts (`structuredPromptDefault`) |
| 12 | `/api/refine` (`run_refine`) and `/api/tidy` (the numbered `S1.` cleaner) | `Servex/ext/refine/run.js`, `agents/tidy.js`, `ux/Revise`, `AISessionConversation.js` | the session page and `/api/tidy` | endpoints exist, fresh calls not verified | **Merge** into one `clean` caller (row 3) |
| 13 | Assistant chain | `Servex/agents/Chain.js` 104, `Assistant.js` 65 | only with `SERVEX_CHAIN=on` | off by default | **Retire** |
| 14 | `amend_bubble` `refined` cards | `Servex/agents/Layers.js` 1086 | a smart agent | 162 lobby lines, last 2026-09-24 | **Retire** (superseded by RefinedPrompt) |

**The "sentences 3-7" refiner.** No code produces ranges like "sentences 3-7" today. The pieces are: the numbered `S1.` output of `tidy.js` and `refine.mjs`; the `[3]` cite in `RefinedCard.js`; and the `[S#, S#]` cite in the PromptRecords parts brief (each number individually, never a range). The range citing the owner remembers is therefore a *proposal*, not a lost feature: it needs per-session ordinal sentence ids (change 28).

**Result: two systems earn their keep** (the fast seat's one pass, row 1, and the smart seat's refine-the-whole-Prompt, rows 2/7/4 merged). The other twelve are duplicates, dormant, or by-hand history. Counting `Sessions.refine` plus Echo's cleaner plus `LiveRefine` plus `tidy`, the same sentence can be cleaned by up to four code paths; today two actually fire (rows 1 and 2).

## 3h. The Process class: what it is and whether it runs (audited 2026-10-27)

**What it is.** `class Process extends Task` ([core/Task/Process.js](/framework/core/Task/Process.js), 110 lines): its children are named steps, always in series. It is data plus one decision, `next()`; it never changes itself. `Servex/ProcessRunner.js` (191 lines) is the node side: it replays the file, asks `next()`, writes the line, and launches the step. Templates are subclasses with `static steps` in `core/Task/processes/` (`build` 8 steps, `design`, `investigate`). Created in one call: `item({path: <session>, delta: {tasks: {add: {title, process: "build", brief}}}})`. Doc: [core/Task/doc/process.md](/framework/core/Task/doc/process.md).

**It does run outside the SDK context.** `ProcessRunner` is built in `Servex.js` (289), woken by the item tool after any write to a process file (`hooks.changed`), by an agent turn end (`Agents.js` 1787) and by the TaskLoop tick (resume after a restart). When a step completes, node sends `Process.prompt(N+1)` (the step text, the brief, every earlier outcome) to a fresh agent, the previous step's agent (`same`) or the creator (`owner`). Each step's cost is measured and a stalled step is pulsed.

**It does not trigger node functions.** A step launches a session (`run: fresh | same | owner | wait`) and nothing else; there is no step type that calls a function. Gap, not a bug: a "run NavCheck" or "merge" step is today an agent told to run it.

**Does it run anywhere today? Barely.** Six task files carry `"class":"Process"` in the whole repo: five in `session-e00f55c9` (10-20) and one test, `e2e-check-process` (10-22). Totals read from the files: the real one, `readmes-page`, has 9 spawns and 6 completes over 10-22 to 10-25; of the four 10-25 `chat-*` ones, one reached a spawn and a complete and the rest sit at 0. No Process was created after 10-25 and none is on this week's sessions. The old [ai/process](/framework/ai/process/) page is unrelated (a stale 2026-09-19 view of agent work). Verdict: **built, tested (`Process.test.mjs`, `ProcessRunner.test.mjs`), wired into Servex, and used by one real task plus a few starts.** Nothing depends on it, so it is the cheapest place to put mandatory sequences (see [roles-proposal.md](roles-proposal.md), role versus process).

### 3h.1 Reconcile: `AITask/` and `systems-map.md` beside this file

- **`ai/AITask/`** (`class AITask extends Page`): the *viewer* for one session-store task folder and the day/board views of the AI front page. Different from `core/Task` (the Task data class and `TaskPage`, the module-task viewer). Two viewers for one data shape is the duplication; folded by proposal change 32 (below in system-proposal.md), not a rename now.
- **`ai/systems-map.md`** (63 lines, last change 2026-10-13): a *directory of systems* (one row per system: where it lives, entry readme, size, a note), written by hand with git-log numbers. This file, `system-map.md`, is a *how it works* map of sessions, tasks, prompts and chat. **Different purpose, partly duplicate**: its rows for sessions and tasks repeat what 1-3 here say, and its sizes are stale. Recommendation: keep it as the index, regenerate the numbers by script (law 7), and replace its Sessions/Tasks/Chat rows with links into this file. Not merged: a directory and an explanation should not share one page.

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

- `Servex/agents/Sessions.js` (creates voice sessions, `say()`, `refine()`): no Servex-side doc of its own; section 3d is the first, with its eight doc holes.
- The global voice session (`create_controller` in `ux/Dictate/chat.js`): only comments, no doc page.
- A generic Sheet: `ext/drawer/doc/sheet.md` documents the AI sheet, not a reusable one.
- Which chat version reads `place` / `refined` / `refine`: no single doc (this map's section 3 is the first).
- `ext/Session/readme.md` still names `session-fast`; the default fast seat is `voice-assistant`.

## Sources

[ux/Dictate/doc/pipeline.md](/framework/ux/Dictate/doc/pipeline.md) · [ux/Dictate/doc/map.md](/framework/ux/Dictate/doc/map.md) · [ext/Chat/readme.md](/framework/ext/Chat/readme.md) · [ext/Chat/v2](/framework/ext/Chat/v2/readme.md) · [ext/Chat/v3](/framework/ext/Chat/v3/readme.md) · [ext/drawer/readme.md](/framework/ext/drawer/readme.md) · [core/Session/readme.md](/framework/core/Session/readme.md) · [core/Task/doc/prompt.md](/framework/core/Task/doc/prompt.md)
