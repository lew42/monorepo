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
| the global voice session (`create_controller` in `chat.js`, sessionStorage `lew42-voice-session`) | **`Assistant` class in `framework/ai`** (change 6; first proposed as `VoiceSession` in `ux/Dictate/`) | Today nothing can hold or inspect it as an instance. |
| `ext/Session/Session.js` (functions only) | stays an `ext` client; its calls become methods on `VoiceSession` | The client is plumbing; the class owns the state. |
| `core/Session/Session.js` (`Session extends Task`) | **`ai/AISession/` as `AISession`**, merged into the class that is already there (change 12 below) | Superseded 2026-10-26: the owner wants Session and Task out of core. See "Moving Session and Task out of core". |
| `core/Task/*` (`Task`, `Prompt`, `Question`, `Paragraph`, `Process`, `Project`, ...) | **`ai/AITask/` as `AITask`; `Prompt`, `Question`, `Paragraph`, `Process`, `Project` keep their names and extend it** (changes 13-16 below); add `RefinedPrompt.js` beside them | Superseded 2026-10-26: Task is the AI task-management system, not a core primitive. |
| `ai/AISession/` (session detail page and its tab renderers) | stays | It already has the right job; it mounts the Chat (below). |

## Classes

- **`Sheet`** (generic): sizes, drag, header, `sheet.panel("AI", () => chat)`. The "AI ▾" menu lists only what the host registered, so Debug/Docs/Settings/Element appear when the host registers them or are removed until they work.
- **`Chat`** (one class): the view, the composer, the mic (built in, optional), the session switcher and the New session button. A caller passes `{session?, dictation: true|false}`. It mounts in the sheet (global voice session, switcher, mic), on a session detail page (a fixed session, no switcher, no mic), or alone. The three versions become renderers behind it (`view: "bubbles" | "tree" | "cards"`, today V1, V2, V3), chosen by one setting instead of two chips in the sheet head.
- **`Assistant`** (was `VoiceSession`; owns the switcher and New session too): the controller today, as a class with the same `ensure()` (one shared promise), `reset()` and `fresh` rules.
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

## Lists and the chat

**The question:** what drives the on-screen conversation? **Answer: the chat is a derived view, not a stored list.** It is drawn from lists that already exist, in list order, and only the messages that belong to no task get a list of their own.

- **Why not "the tasks list is the chat" (A).** It is nearly right: the owner decided on 2026-10-25 (`ext/Chat/doc/chat-shape.md`, Option C) that `tasks` holds only things with a done (Prompt, Question, Task, Session) and replies live on what they answer. The one gap is a message that answers nothing (an assistant remark, a note). Making it a fake task pollutes the tally; so those, and only those, need a home.
- **Why not "separate buckets woven together" (B), as stated.** With no reference system, every second appearance becomes a copy, copies drift, and the weave has to be rebuilt on every draw. B is only safe if the second appearance is a Ref.
- **Recommendation: one home list per item, a Ref anywhere else.**
  - Completion-bearing items stay in `tasks`. Raw prompts stay flat at the root of `tasks` (nested Tasks and replies hang under them as today); no Tree class, because `Item.walk` and `Item.find` already search deep.
  - A new, small, non-completing `messages` List holds chat-only items. `Task.progress_of` never sees it, so completion needs no filter.
  - A `Ref` is a tiny Item `{type:"Ref", id, to:"<target id>"}` that renders the target's own view, live, resolved with `session.find(to)`. It carries no completion and is skipped by the tally exactly like a stopped task. Precedent: `Task.from_ref` already resolves a path-based reference to a whole task file.
  - The chat is **derived**: walk `tasks` and `messages`, draw in list order. Store a Ref in `messages` only where something must appear somewhere other than its home (a task surfaced into the conversation when it is answered). The alternative, a fully stored chat list of Refs, wins only if the owner wants to reorder the conversation by hand; it costs a write per event and a second list that can disagree with the first.
- **Order, the hard rule.** Draw in list order (Servex's append order, or its `ts`), never sort by client `created_at`. The 2026-10-25 misorder bug came from mixing the phone's clock with the PC's.
- **Ids that make a Ref reliable.** Keep Servex's monotonic `<prefix>-<ms>` ids, with two changes: unique across the whole session, not only among siblings (one counter, the prefix is only a label), and never reused after a remove (a removed id is a tombstone; the next mint is larger). A Ref to a missing id draws a visible "gone" row, not nothing (rule: anything that can fail says so).
- **The item tool.** Add a Ref: `item({path: SESSION, delta: {messages: {add: {type: "Ref", id: "f-<ms>", to: "p-<ms>"}}}})`. Move one: `{messages: {move: {id, after, from}}}`. Neither ever moves or copies the target; to re-home the target itself, use a `move` on its own list, and every Ref still resolves because the id is session-wide.
- **Retiring V1's `chat` pseudo-property.** `Session.apply_line`'s `put` fall-through is the only reason `{chat}` lines exist. Step 1: Servex writes real `messages` list lines in addition. Step 2: V1 and V2 read through a compatibility fold that turns old `{chat}` lines into `messages` entries on replay. Step 3: stop writing `{chat}`. Each step keeps V1 and V2 working.

## The data-first shape (the voice agent's proposal, tested against List and replay)

**The goal.** The data is a few lists that replay exactly; every view only renders a list. Then a wrong screen is a UI bug by construction, because the data can be checked alone (replay the file, compare).

**The voice agent's five pieces, one verdict each** (what each needs from the real code is in the "breaks" list below):

1. **A derived `session.log` List that every created item is pushed into at creation (never its own line type).** *Holds, with a change.* A List announces `add` with a `delta` that is exactly the file line, so a listener per list can append a Ref to `session.log` in the order replay applies lines. Because it is derived, nothing new is stored and it cannot drift from the file. It needs session-wide unique ids (already proposed) and a Ref (already proposed), and it is the same thing "Lists and the chat" calls the derived chat. *Alternative:* no `log` at all, walking `tasks` and `messages` at draw time. Simpler, and it wins unless several views need the same creation-order list cheaply.
2. **One raw Prompt per Whisper sentence, flat in `session.prompts`; a RefinedPrompt references source ids; tasks, questions and replies nest under their owner.** *Holds only after a real change:* a sentence today is a string in the open Prompt's `raw` array (`raw.push`), not an Item, so there is nothing to put in a list or reference by id. Making each sentence an Item changes the Servex writer, `Prompt.js` and V2's fold. A flat `prompts` list also means a new List beside `tasks`; the owner's Option C kept `tasks` for things with a done, so raw prompts (they have none) fit `prompts` better than the root of `tasks` that "Lists and the chat" suggested. This replaces that suggestion.
3. **Chat is a generic ux view that renders a list it is given.** *Holds.* Bubbles, scroll lock, reactions, the input bar and mic meter need no AI knowledge. What does not move into it: the session switcher and New session (they belong to the Assistant), and the Claude-transcript view (a fourth renderer).
4. **`Assistant`, a new class in `framework/ai`, owns the current voice session, the fast and smart agents' addresses, and the session switcher, and renders a Chat.** *Holds; replaces my earlier `VoiceSession` and the "Chat owns the switcher" rows.* Name clash: `Servex/agents/Assistant.js` is a different class (the page assistants, Node side). They never load together, but a reader meets two. *Alternative name:* `VoiceAssistant`.
5. **The Sheet is an empty generic container the Assistant renders into; the session detail page reuses Chat bound to one session, with a simpler input (dictate, then send) and refined prompts by default, raw on expand.** *Holds.* The Sheet needs only the panel-registration change already proposed. The default-refined view needs the `of` references (piece 2) to exist; until then it shows the raw sentences.

**Where it breaks against the real code** (the test: replay `session.jsonl` into a Session and the `log` must equal the creation lines in file order):

- **Two replay shapes.** A spawned agent's session replays through `Task.replay_line`, a tab's or voice call's through `Session.apply_line`. The `log` listener must be added to both, or voice sessions get a log and agent sessions do not.
- **One line can create several items.** A `tasks.add` that carries nested children, or `{"p-1":{replies:{add}}}`, creates inside a nested list. The test only holds if the rule is "one log entry per `add` event, at any depth, in event order". Whether List `announce` bubbles up to the session was not verified (doc hole 9 below); if it does not, the listener has to subscribe in every nested list as it is created.
- **Not every line creates.** Keyed edits, `place`, `summary` and `sent` change or annotate; they must not log. The rule must say so, or the "equals line order" test fails on the first plumbing line.
- **Removal.** If an item is removed, its log Ref now points at nothing. With a tombstone rule the Ref draws "gone"; the test must compare with removals applied.
- **Ids.** Today ids are unique only among siblings, and `p-`, `q-`, `r-` can collide in principle. Refs need the session-wide counter; until it exists the log can hold the wrong item.
- **Order is only as good as the file.** Servex re-stamps `at`; the client re-keys with `retag`. Use file line order for the log, never `at` (which is why piece 1 is derived from replay, not sorted).
- **The page that complained.** The Timeline draws one row per file line (8359 rows for `v-sq8y7db`). A `log` List would not fix that on its own; the Timeline must draw the `log` (about one row per created item), and plumbing lines stay in the raw file view. Per-sentence Prompts raise the Prompt count (1581 sentences against 622 Prompts there), so the default view must group them under their RefinedPrompt, or the "thousands" gets worse.
- **Servex timing.** A sentence becomes an Item when Servex writes it; there is no client id, so a retried POST makes a duplicate. Needs a client-made id (the `said_at` already travels; a UUID next to it fixes it).

## Moving Session and Task out of core (proposal only: nothing moves until the owner approves each change)

**Names.** Two clashes to settle first:

- **`AISession`.** `ai/AISession/AISession.js` (630 lines) is already `class AISession extends Session`: the transcript and cost reader. **Merge, recommended:** the moved record class (`core/Session/Session.js`, 181 lines) becomes the base inside `ai/AISession/`, and the existing file's cost and transcript methods stay as they are on the subclass, in `AISessionCost.mjs`-style helpers if it grows. One name, one class, `instanceof` works. *Alternative: keep two classes* (a record class and a transcript reader). It wins if the browser must load the record without the cost math, or the file passes ~800 lines. The cost of two is exactly the confusion the owner is trying to remove.
- **`AITask`.** `ai/AITask/AITask.js` is already `class AITask extends Page` (the task viewer, about 18 importers). **Rename the viewer to `AITaskPage`**, then `AITask extends Item` is the moved `Task`. *Alternative:* call the moved Task `AITaskRecord`, no rename; wins if 18 importers is more risk than the owner wants. The Task.js header already says "AITask extends Task (a later pass)".

**Direction rule.** `ai` imports `core`, never the reverse. Today core does depend on Task: `core/Page/Page.class.js:416` imports `../Task/TasksPage.js`, and `core/Item/Dated.js:4` imports `../Session/Day.js` (a date helper, not AI). Those two have to be cut before core can be clean; moving the files alone breaks both.

**Migration checklist** (every group that moves or changes; nothing is done yet). Risk: low = a path string, medium = needs a script and a test, high = can blank pages or lose records.

| # | What | Count | What changes | Risk |
|---|---|---|---|---|
| a | Task-folder `page.js` stubs: `import { TaskPage } from "/framework/core/Task/TaskPage.js"` | 822 | Path in the import. **Do not edit them.** Keep a one-line re-export at the old path; later a scripted move with a dry run and manifest rewrites them. | Medium. A missed one blanks that task page. |
| b | `Servex/agents/page_tools.js:501` (`PAGE_JS`, the template that makes those stubs) | 1 | New stubs point at the new path. | Low, but do it with (a), or old and new stubs differ. |
| c | `core/Task/*` itself: `Task`, `Prompt`, `Question`, `Paragraph`, `Process`, `Project`, `TaskPage`, `TaskView`, `TasksPage`, `TaskQueue`, `sentences`, `Day`... | about 14 files | Move to `ai/AITask/`. Re-export shims at the old paths. | High (it is the base of everything below). |
| d | `core/Session/*` (`Session`, `Day`, `SessionTasks`, `SessionSettings`, `SessionMenu`) | about 5 files | `Session` and its helpers to `ai/AISession/`; `Day.js` to a neutral util/core home (it is a date helper). Shims at the old paths. | High for `Session`; low for the helpers. |
| e | Core leaks: `core/Page/Page.class.js:416` (TasksPage), `core/Item/Dated.js:4` (Day.js) | 2 | Cut the dependency: Page must load TasksPage only when the page asks for it; Dated takes `Day` from its new neutral home. | **High:** both are on every page's load path. |
| f | Non-ai importers: `ext/Chat/chunks.js` (sentences), `ext/Doc/Doc.js:170`, `ux/Dictate/Widget.js:10`, `ext/Chat/v2` x2, `v3`, `ext/Refine/PromptRun.js`, `public/live/LiveTasks.js` | 8 | Imports go to the new path. `ext` and `ux` importing `ai` reverses the "imports flow down" rule, so `sentences.js` (a plain helper) goes to `util/`, and the rest must be reviewed one by one. | Medium. |
| g | `Server/` importers (AIIndex, AIIndexStream, AskIndex, ChildLinks, CloseoutWalk, DatedFiles, DoneCheck, PromptRecords, PromptTrace, PromptsToSession, SessionConsolidate, SessionIdentity, SessionRecord, TaskDirs, TaskHomes, TaskMigrate, TaskMove, TaskQueue, TrackingCheck, UndoneToTasks, UndoneVerify, rename-phase-to-step) | about 22 | Imports (can stay on the shims at first). These run the index and the checks. | Medium. A broken one stops indexing silently. |
| h | `Servex/` importers (Dropped, Landed, ProcessRunner, Servex.js, TaskLoop, agents: Agents, PromptLines, PromptTasks, page_tools, turn-costs; `proof/process-run.mjs`) | about 17 | Imports. Needs a Servex restart to take effect. | High: a bad import stops the one process that runs every agent. Test on a private Servex from the worktree first. |
| i | Servex tests (about 10) and `core/Task` / `core/Session` tests | about 15 | Imports and file locations. Tests are the proof the move is safe, so they move first. | Low. |
| j | `.claude/hooks`: `jsonl-schema`, `prompt-relay`, `reply-relay` | 3 | Imports. A broken hook blocks tool calls for every agent. | High. |
| k | `ai/` importers (AISession x11, AITask x2, AIOverview, SystemClasses, queue/TaskQueueView, rail/DayIndexLog, asks/ProposalTriage) | about 17 | Imports, plus the `AITask` to `AITaskPage` rename (about 18 importers). | Medium. |
| l | Path strings in data: `ai/asks/undone.json`, `ai/readmes/chains.json`, `ext/Refine/stages/things.json`, `styles/layouts/catalog/census.json` | 4 | The doc and readme chain paths. Regenerate by script where a script produced them. | Low. |
| m | Docs: `core/Task/readme.md` and `doc/`, `core/Session/readme.md` and `doc/`, `core/readme`, `framework/readme`, `ai/readme`, `system-map` | about 10 | Move with the code; leave a redirect line at the old readme. | Low. |

**Order** (each step keeps V1 and V2 working): tests first (i); the neutral `Day` and the lazy `TasksPage` (e) while Task is still in core; then copy `core/Task` into `ai/AITask/` and make the old files shims (c, d); then importers move in groups f, g, k (Servex last: h, j, on a private Servex); then new stubs (b); then the scripted stub rewrite (a) with a dry run; last remove the shims.

## One tool for the AIs

AIs write all of this through `item({path, delta})`. Servex writes raw Prompts itself (Whisper is code); the smart seat writes RefinedPrompts, Questions and Tasks. The map's section 6 lists about 60 Servex tools that are one `item` call in different clothes (page, card, log, file writes; task state changes; reads). Fold them behind `item` with one-line aliases while old agents still call the old names, then retire the aliases.

## Tests: one lean core test per class (rule added 2026-10-26)

The rule is now in [agents.md](agents.md) and [framework/readme.md](../readme.md), pointing at [core/Test](../core/Test/readme.md): one instance, the top ~50% of what the class does, an assert after each call, well under 1 s, `X.test.mjs` beside the class. Before this pass the rule lived only in `core/Test/readme.md` ("Every class has its basic test"); no role readme or base doc told an agent to write one.

| Class | Test today | Needs |
|---|---|---|
| `Session` / **`AISession`** | `core/Session/Session.test.mjs`, `session-task.test.mjs`; `ai/AISession/` has cost, index, outline and timeline tests but none for the class itself | Keep both and move them with the class (change 12 depends on them); add a replay test for the record shape and one for the log. |
| **`AITask`** (today `Task`) | `core/Task/Task.test.mjs`, `child-verb.test.mjs` | Keep and move first; they are the proof the move is safe. |
| `Prompt`, `Question`, `Process`, `Project`, `TaskQueue`, `TasksPage` | `Prompt.test.mjs`, `Question.test.mjs`, `Process.test.mjs`, `Project.test.mjs`, `TaskQueue.test.mjs`, `TasksPage.test.mjs` (load-sensitive) | Nothing new; `Paragraph` has none (add). |
| **`RefinedPrompt`** | none (class is new) | New: build one from three raw ids, replay the line, check the reverse index and completion. |
| **`session.log`** | none | New: replay a fixture `session.jsonl` and assert the log equals the creation lines in file order, once per replay shape; this is the "log matches the file" test from the data-first section. |
| **`Assistant`** | none | New, node-side logic only: create, resume, switch return the right session id and prewarm calls (the fast/smart spawn stubbed). |
| **`Chat`** (generic view) | `chunks.test.mjs`, `strip.test.mjs` cover helpers only | New, small: render a list into a node (the `Test` class has no DOM; use the existing fake-DOM pattern or test the model half only), add/remove/reorder, scroll-lock flag. |
| **`Sheet`** | none | New: sizes, drag clamp, panel register/unregister. |
| `List`, `Item` | `List.test.mjs`, `Item.test.mjs`, `Item.basic.test.mjs` | Add the bubbling question (does a nested `add` announce at the session) as one test, since the log depends on it. |

## All proposed changes, one list (approve or reject each; nothing is built yet)

Folder moves and shims:

1. Extract the Sheet (`SheetPanel`, `SheetSize`, `SheetDock`, `Sheet.js`, `rail.css`) from `ext/drawer` to `ux/Sheet/`, with `ext/drawer/rail.js` kept as a shim. Risk low. Alternative: leave it.
2. Make the Sheet an empty generic container: panels are registered by the host (the Assistant), and unregistered ones (Debug, Docs, Settings, Element) disappear until they work. Risk low.
3. Move the `ChatView.js` chips (v2/v3 setting) from `ext/drawer` into `ext/Chat` as the Chat's `view` setting. Risk low.

Chat and Assistant:

4. One `Chat` class in `ext/Chat` that absorbs `ux/Dictate/chat.js`, `Widget.js` and the `Chat.js` function bag, and is a generic view of a list it is given (bubbles, scroll lock, reactions, input bar and mic meter). Risk high: V1 is the live chat. V1 stays default until the new one matches it.
5. The three chat versions and the Claude-transcript view become renderers behind `Chat` (`view: "bubbles" | "tree" | "cards" | "transcript"`). Risk medium.
6. A new `Assistant` class in `framework/ai` that owns the current voice session, the fast/smart addresses and the session switcher and New session, and renders a Chat into the Sheet. Replaces the earlier `VoiceSession` proposal. Name clash with `Servex/agents/Assistant.js`; alternative name `VoiceAssistant`. Risk medium.
7. `ext/Session/Session.js` stays the client; its calls become methods on `Assistant`. Risk low.
8. The session detail page mounts `Chat` bound to one session, with a simpler input (dictate, then send), refined prompts by default and raw on expand; the Claude-transcript view stays as a renderer. Risk medium.

Data:

9. Each Whisper sentence becomes an Item in a flat `session.prompts` List (replacing the `raw` string array on the open Prompt). Changes Servex, `Prompt.js` and V2's fold. Risk high.
10. `RefinedPrompt` (new, in `ai/AITask/`) references its source ids with `of: [...]`; tasks, questions and replies nest under their owner. Risk medium.
11. Session-wide unique ids (one counter, never reused, tombstones), a `Ref` item, and a derived `session.log` List of Refs built from creation events in file order (never its own stored line). Risk medium; first answer the open List question (does `add` announce at the session?).
12. **`Session` moves to `ai/AISession/` and merges with the existing `AISession` class there** (one name, one class). Alternative: two classes, a record class and a transcript reader. Risk high (base class; 20 importers plus the shims).
13. **`Task` moves out of core into `ai/AITask/` as `AITask`**, and the existing viewer `ai/AITask/AITask.js` (a `Page`) is renamed `AITaskPage` (about 18 importers). Alternative: name the moved class `AITaskRecord`. Risk high.
14. `Prompt`, `Question`, `Paragraph`, `Process`, `Project`, `TaskQueue`, `TaskPage`, `TaskView`, `TasksPage` move with it and extend `AITask`. Risk high (see the checklist, a-m).
15. Cut core's two dependencies on Task/Session before moving: `core/Page/Page.class.js:416` loads `TasksPage` only when asked; `core/Item/Dated.js:4` takes `Day` from a neutral home; `sentences.js` goes to `util/`. Risk high: both are on every page's load path.
16. Leave re-export shims at every old `core/Task/*` and `core/Session/*` path; change the template in `page_tools.js:501`; later rewrite the 822 task-folder `page.js` stubs by script (dry run, manifest) and remove the shims. Risk medium.

Retirements and rules:

17. Retire V1's `{chat}` pseudo-property: Servex writes real `messages` list lines too, V1/V2 read through a fold, then it stops writing `{chat}`. Risk medium (three steps, each keeps V1 and V2 working).
18. Retire `{place}`, `{refined}`, `{summary}` and the second cleaner: `Sessions.refine()` and its `ext/Refine` `clean` + `structure` calls become the writer of a `RefinedPrompt`. Risk medium.
19. Give each sentence a client-made id (UUID next to `said_at`) so a retried POST cannot duplicate it. Risk low.
20. The session detail Timeline draws the `log` (about one row per created item) and keeps plumbing in the raw file view, so "8359 prompts" stops. Risk low.
21. **Fast seat does ONE first pass per sentence and never revises** (owner's intent): the skill says so, and `Widget.place` ignores a second `place` for an already-settled `re`. Today the latest place line wins. Risk low.
22. Tests: the lean-core-test rule (done today in the base docs), then the new tests in the table above, the move-first ones before changes 12-16. Risk low.
23. Fold the ~60 look-alike Servex tools behind `item` with one-line aliases, then retire the aliases. Risk medium; do last.

**Build order** (each step keeps V1 and V2 working): 22 (tests), 1-3, 4-8 with 19, 9-11 with 17, 18 and 21 and 20, then 15, 12-14, 16 on a private Servex, then 23.

## The top five moves

1. Write the tests first (22), then make the data right: sentences as Items, `RefinedPrompt`, a derived log (9-11).
2. Make Chat one generic view and the Assistant the class that owns the voice session (4, 6, 8).
3. Pull the Sheet into `ux/Sheet`, generic (1-2).
4. Move Session and Task out of core as `AISession` and `AITask`, after cutting core's two dependencies (12-16).
5. Make the fast seat one pass and the smart seat the only reviser (18, 21), then fold the tools into `item` (23).
