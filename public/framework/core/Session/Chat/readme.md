# core/Session/Chat — a session's chat as one real list

A voice session's conversation is **one ordered list of real Items**, `session.messages`, beside the owner's raw words in `session.sentences`. A view draws the list and updates when an item is added; an agent adds to it with the item tool. Since 2026-11-01, Servex writes it for every voice session, **beside** the old V1 `{chat}` lines, which stay exactly as they were.

Why: the chat used to live in pseudo lines (`{chat}`, `{place}`) that each view re-read in its own way, and V1 reordered its bubbles. The owner asked for "a list that we can render in the right place, and then it automatically updates when items are added… via an item tool" ([the brief](/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-messages/requirements.md); [the owner's decisions](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/owner-decisions.md)).

## The shape

```js
session.sentences: List<Sentence>     // the raw words, append-only, never moved
session.messages:  Chat               // the conversation, in order (class Chat extends List)

class Sentence extends Item { text, via: "voice"|"text", at, said_at?, raw? }                // ./Sentence.js
class Message  extends Item { by: "owner"|"smart"|"fast"|"system", at, text }      // ./Message.js
class Prompt   extends Message { sentences: [ids], clean: {<sentence id>: text}, title?, text?, state, prompt?, raw, cleaned,
                                  kind?: "task"|"request"|"question", items: List<PromptItem|Ref>, sent: {fast?, smart?}, working? }  // ./Prompt.js
class PromptItem extends Item { title?, sentences: [ids] }                         // ./PromptItem.js — one of Prompt.items
class Reply    extends Message { re?: {to: <sentence id>}, level?, thread? }       // ./Reply.js
class Chat     extends List { messages, last, resurface(message) }                 // ./Chat.js
```

A **Ref** (`core/Item/Ref.js`, not its own file here) can be a member too: `{"messages":{"add":{"type":"Ref","path"|"url",…}}}` hydrates as the real core Ref (`Chat.js` imports `Ref.js` so `Message.hydrate`'s fallback to `Item.hydrate` finds it registered) — a line, or a task, shown here without copying it. `Chat.resurface(message)` makes one: a Ref to `message` at the bottom of the list, plus `resurfaced: <ref id>` set on `message` itself so a view can dim the original or draw an arrow to where it resurfaced. Doc: [`../../Item/doc/ref.md`](../../Item/doc/ref.md#made-by-listref-and-chatresurface).

- **A Prompt** is what the owner said in one go. It holds its sentences **by id** and grows while the owner keeps talking. `raw` rebuilds the exact words as said — each sentence's own text, in order, joined by one space, never trimmed (chat-model step 5; it is **computed**, never stored). `said` is the old name for the same getter, kept because `ext/Chat/v3/ChatV3.js` still reads it (that fence is dictation-v3's; remove `said` once v3 moves to `raw`). `clean` holds the fast seat's cleaned text per sentence and `cleaned` is the words with those in place (what a view shows by default); `title` and `text` are a refined version, once someone writes one (then `state` is `"refined"`). `prompt` links today's Prompt *task* in `session.tasks` (Chat V2/V3).
- **A Prompt as a card** (chat-model step 6, plan.md decision 4): `kind` ("task" | "request" | "question") turns a plain dictation into a card a view can draw as title → items → raw text; `items` is a `List` of `PromptItem` (each `{title, sentences:[ids]}`, grown the same way a Prompt's own sentences are: `{items:{"<item id>":{sentences:{push:"s-2"}}}}`), or a Ref to something filed elsewhere — no separate Card class (Law 6: the shape lives on Prompt itself). `sent: {fast?: {at}, smart?: {at}}` is written by `Sessions.mark_sent` through `ChatWriter.sent_line`, right beside the existing task-level broadcast, so a view that only reads messages can still draw the ✓/🧠 marks (🧠 means *answered*, not just received — see `doc/views-on-messages.md`). `working: {by, at} | null` is the smart seat's "seen it, writing" sign, written directly through the item tool exactly like `core/Task/Prompt.js`'s own field; the task copy stays the one views read until they move to the message.
- **A Reply** is an assistant's answer, anchored to the sentence it answers (`re.to`). `level` marks a refined restatement (`Sessions.line` with a level).
- **A plain Message** is a note, e.g. Servex saying an assistant could not be reached.
- **Order is the list's order.** Nothing is sorted by time. A message's text may change in place; its position never does.

This is the class map of the data-shapes synthesis ([synthesis.md](/framework/core/Session/tasks/data-shapes/synthesis.md) §2): Prompt and Question are messages, not tasks (§6 decision 2, the plan's fork F3); sentences live in their own list and a Prompt holds their ids (§3 [A], fork F4); the chat owns its messages (§3 [B]). Built so far: Message, Prompt, Reply, Sentence, Ref (2026-11-01, chat-model step 2). Question and Card as messages come when something writes them.

**Two names, on purpose:**
- **`messages`, not `chat`.** A line's key is the property it changes, and `{"chat":…}` is V1's own line: about twenty readers (`ext/Chat/Chat.js`, `ux/Dictate/chat.js`, `Widget.js`, `ext/Session/Session.js`, Recite, `SessionIndex`…) draw any line with a `chat` key as a bubble. The owner said either name is fine.
- **Two classes named `Prompt`.** `core/Task/Prompt.js` (the task, registered globally as "Prompt") and `./Prompt.js` (the chat message). Inside the chat, a member's type is looked up in `Message.TYPES` first (`Message.hydrate`), so `{"messages":{"add":{"type":"Prompt"}}}` builds the message and `{"tasks":{"add":{"type":"Prompt"}}}` still builds the task. Import the one you mean by its path. When the Prompt task retires, this one is registered and the note goes.

## On disk

Lines in the session's `session.jsonl`, each right after the V1 line it mirrors. One act is one line: an owner sentence adds the Sentence and adds or grows its Prompt in a single line.

```jsonl
{"chat":{"at":"…19:43:21.551-05:00","from":{"kind":"owner"},"text":"The tab bar is broken.","prompt":"p-1"}}      ← V1, unchanged
{"sentences":{"add":{"id":"s-1","at":"…19:43:21.551-05:00","text":"The tab bar is broken.","via":"voice"}},"messages":{"add":{"type":"Prompt","id":"m-1","by":"owner","at":"…","sentences":["s-1"],"prompt":"p-1"}},"by":"servex","ts":"…"}
{"sentences":{"add":{"id":"s-2","text":"On my phone.",…}},"messages":{"m-1":{"sentences":{"push":"s-2"}}},"by":"servex","ts":"…"}     ← the Prompt grows
{"messages":{"add":{"id":"m-2","type":"Reply","by":"smart","at":"…","text":"Which phone?","re":{"to":"s-1"}}},"by":"servex","ts":"…"}
{"messages":{"m-1":{"clean":{"s-2":"On my phone (an iPhone)."}}},"by":"voice-assistant-…","ts":"…"}                       ← a {place} improve: one sentence cleaned, in place
{"messages":{"m-1":{"title":"Fix the mobile tab bar","text":"…"}},"by":"smart","ts":"…"}                                      ← refined in place
```

Ids: `s-<ms>` and `m-<ms>` from Servex; the item tool gives an agent's add an 8-character random id. Ids are unique in the file.

## Who writes it

- **Servex, for every voice session** (`Servex/agents/Sessions.js` `write()`): every `{chat}` line it writes is followed by its mirror, made by `Servex/agents/ChatWriter.js`. That covers the owner's sentences (`say()`), the smart and fast seats' replies (`heard()`, `hold_fast()`), `session_line` (`line()`) and Servex's own notes. The restart notice (`unanswered()`) is mirrored too.
- **The order rules** (the owner's decisions #2), in `ChatWriter`:
  - A new sentence appends at the bottom: it grows the open Prompt only while that Prompt is still the **last** message and belongs to the same Prompt task; otherwise a new Prompt starts below.
  - A reply never splits a message in progress: while the owner is mid-thought (`Sessions.mid_thought`: the floor is `speaking`, or a thought is held), a reply waits in the writer and is appended when the thought ends (`release_thought`, or the floor going `done`), below the owner's last words.
  - Known edge: a reply held at the moment Servex restarts is lost from the list (V1 still has it).
- **Any agent, through the item tool:** `item({path: <session url>, delta: {messages: {add: {type: "Reply", by: "smart", text: "…"}}}})`, or `{messages: {"<id>": {title, text}}}` to refine a message in place. A read of the session (`item({path})`) answers `messages: {count, last}` (the last 20).
- **A root task, or a spawned child session, as a Ref** (2026-11-02, chat-model step 3): when `tasks.add` lands at a session's own root — a folder-making ask (`Servex/agents/page_tools.js`'s `put({task: …})`) or an inline subtask (`put({tasks: {add: …}})`) — the same write also appends `ChatWriter.ref_line({path|url})`: a Ref at the bottom of `session.messages`, right after the line that made the task. A spawned child session gets the same Ref wherever `SessionRecord.add_ref` (`Server/SessionRecord.mjs`, called by `Agents.open_task`/`link_parent` and `ChildLinks.link`) writes a `{"task":url}` reference onto a **session's own** `session.jsonl`, top-level or nested (never onto some task's `task.jsonl` beneath it — "root tasks only": `SessionRecord.is_chat_ref_target`). Idempotent the same way the `{task}` reference already was: a retried link never adds a second Ref.
- **The fast seat's `{place}` lines** (written by the voice assistant through the item tool): one with a cleaned `text` (edit `improve` or `both`) also writes `{"messages":{"<prompt id>":{"clean":{"<sentence id>":"…"}}}}`, so that sentence's text updates on its Prompt **in place**: the Prompt keeps its position and its raw words, and a later improve of the same sentence wins (`ChatWriter.place`, called from the item tool, `page_tools.js`). Where a sentence goes (`to`, `where`) is not mirrored: the list's order never changes.
- **`Sessions.mark_sent`** (chat-model step 6): besides its existing broadcast `{"sent":{to,at,re}}` line (read by V1/V2 through the Prompt *task*), it now looks up the Prompt *message* that owns the last line's sentence (`ChatWriter.message_for`) and, when found, also writes `{"messages":{"<mid>":{"sent":{"fast"|"smart":{"at":…}}}}}` through `ChatWriter.sent_line`. `message_for` tries memory first (`msg_at`, filled the same way as `by_at`), then falls back to the file itself (`ChatWriter.find_message` → `Sessions.find_message`, the same shape as `find_sentence`): the line that adds a sentence always also names the message it was filed under, so the mark still lands on the right message after a Servex restart.

## How a view reads it

- Replay the file into a `Session` (`Session.replay(lines)` in node, or `session.replay_line(line)` per streamed line, as `ext/JSONL` delivers them). `session.messages.messages` is the list.
- Live: listen to the Session's `"delta"` event; `from` is the Message that changed (a new member, or a Prompt that grew). The demo view, [ext/Chat/list](/framework/ext/Chat/list/), does exactly this in about 60 lines and redraws a 29 ms append without a reload.
- Read only the list lines (`messages`, `sentences`); never V1's `{chat}` lines.

## Check it

- `node Servex/agents/chat-messages.test.mjs` (22 checks): a mixed session through the real `Sessions.js` (spoken sentences with the floor, a reply mid-thought, a refined line, typed, a Servex note), then replayed twice and through a snapshot: the same list, same order, no twins; two counts that must agree (owner `{chat}` lines = sentences; other `{chat}` lines = replies and notes); the item tool's add and in-place edit; two `{place}` improves merging on one Prompt; a root `tasks.add` and a `SessionRecord.add_ref` call each landing one Ref, in order, resolving by path or url, never duplicated on a retry; `mark_sent` marking the Prompt message as well as the task broadcast; the item tool setting `kind`/`title`, adding a `PromptItem`, and pushing a sentence into it.
- `node public/framework/core/Session/Chat/Chat.test.mjs` (24 checks) adds the in-memory unit coverage for `kind`, `items` (a plain member hydrates `PromptItem`, a `{type:"Ref"}` one hydrates `Ref`), `sent` (fast/smart merge independently) and `working` (set and cleared with `null`, same shape as the Prompt task's own field).
- `node public/framework/core/Session/Chat/Prompt.raw.test.mjs` (2 checks, chat-model step 5): against a read-only copy of a real voice session (`fixture/v-u48msei-session.jsonl`, from `ai/sessions/2026/11/01/v-u48msei/`), every Prompt's `raw` equals its own sentences' V1 owner `{chat}` texts, joined the same way; and the two counts that must agree — the session's mirrored sentences, and the sentences held across all Prompts — agree (33 and 33, of 152 owner `{chat}` lines in the whole file: only the tail written after chat-model step 1 landed was ever mirrored).
- On a copy of the biggest real voice session (`v-9dvbbrn`, 2026-11-01): 1,004 owner lines gave 1,004 sentences in 330 Prompts, 316 replies gave 316 Replies; the replay took 86 ms.
- `node public/framework/core/Session/Chat/V1Bubbles.test.mjs` (6 checks, chat-model step 8): a controlled conversation and a harder one (a late-arriving, earlier-timed sentence that `place()` must reorder, plus an in-place `fix`) give V1 and the adapter the exact same bubbles; a smoke check on the real fixture.
- `node Server/ChatV1Compare.mjs` (read-only; no `--apply`): builds V1's bubble list from `{chat}` lines and from `session.messages` for real sessions and prints every difference. [doc/pseudo-properties.md#how-v1-switches-over-not-yet-buildermd-step-8](doc/pseudo-properties.md#how-v1-switches-over-not-yet-buildermd-step-8) has what it found.

## Migration (written, not run)

`node Server/ChatToMessages.mjs <session.jsonl …>` prints the lines an older session would have had, made by the same `ChatWriter`; `--apply` appends them (never rewrites; a partly mirrored file gets only what is missing, with `after` to place it) and records each file in `ai/sessions/chat-messages-moves.jsonl`. Not run on real sessions: the owner wants the list to prove itself first. It cannot know when the owner was mid-thought, so old replies keep V1's positions. Test: `node Server/ChatToMessages.test.mjs`.

## More

- [doc/pseudo-properties.md](doc/pseudo-properties.md): what V1's `{chat}` / `{place}` "pseudo properties" are, who writes and reads them, and how V1 switches over.
- [doc/views-on-messages.md](doc/views-on-messages.md): the plan to put Chat V2 and V3 on this list (plan only).

## Next

- ✅ Chat V3 reads this list instead of re-reading `{chat}` lines ([ext/Chat/v3](/framework/ext/Chat/v3/readme.md), 2026-11-01; the views belong to `mastermind-dictation-v3`, this list is the contract). Chat V2 next ([views-on-messages.md](doc/views-on-messages.md) step 2).
- ✅ Ref as a message, and `resurface()` (2026-11-01, chat-model step 2): `core/List/List.js`'s explicit `ref(x)` (F7, reworded 2026-11-02 — `add()`'s own default is unchanged, see `plan.md` decision 2) plus `Chat.resurface(message)`.
- ✅ Tasks and child sessions written as Refs in `session.messages` by Servex (2026-11-02, chat-model step 3): `page_tools.js`'s `tasks.add`, `Server/SessionRecord.mjs`'s `add_ref`.
- ✅ List view hooks: `ext/Chat/list/ChatList.js` draws the list through `DefaultView.place()` (chat-model step 4).
- ✅ `Prompt.raw`, the sent/working marks on the message, and Prompt as a card (`kind`/`items`) (2026-11-02, chat-model steps 5–6). `working` is still written on whichever Prompt (task or message) an instruction names; no caller does yet.
- ✅ V1 side by side (2026-11-02, chat-model step 8): `V1Bubbles.js` (also the live source of [Chat V1.2](/framework/ext/Chat/v1-2/readme.md), V1 drawn from `session.messages`) turns `session.messages` into the bubble list V1 draws (merge, `place()`'s time-reordering, and a `fix`'s in-place correction, all mirrored as plain data); `Server/ChatV1Compare.mjs` builds that list the V1 way (from `{chat}` lines) and the adapter way for real sessions and prints where they differ — run on the 5 largest voice sessions, raw output at `ai/sessions/2026/10/20/session-e00f55c9/chat-model/s8/compare.txt`. Found: none of the 5 are fully mirrored (2 `none`, 1 `partial`, and `said_at` — mirrored nowhere today — is the main reason the two others' bubble lists drift once `{chat}`'s `said_at` differs from its `at`). The switch-over steps it gates: [doc/pseudo-properties.md](doc/pseudo-properties.md#how-v1-switches-over-not-yet-buildermd-step-8).
- ⬜ Question and Card as messages, when a writer needs them.
- ⬜ remove the old `said` alias once Chat V3 reads `sent.smart` (and `raw`) directly, instead of `ext/Chat/v3/ChatV3.js:163`'s `p.cleaned || p.said`.
- ✅ `said_at` is mirrored onto the Sentence by `ChatWriter` and read by `V1Bubbles` (2026-11-02, v1-switch-prep).
- ✅ `Server/ChatToMessages.mjs` fills a partly mirrored session (missing messages only, in place, no twins; `{place}` improves into `clean`; `said_at` set in place): `node Server/ChatToMessages.test.mjs` (11 checks). The compare, each of the 5 largest sessions filled in memory: 0 differing bubbles.
- ⬜ V1 switches to the list, then the `{chat}` lines stop (the owner's decision #1, "later").
