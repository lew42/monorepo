# core/Session/Chat — a session's chat as one real list

A voice session's conversation is **one ordered list of real Items**, `session.messages`, beside the owner's raw words in `session.sentences`. A view draws the list and updates when an item is added; an agent adds to it with the item tool. Since 2026-11-01, Servex writes it for every voice session, **beside** the old V1 `{chat}` lines, which stay exactly as they were.

Why: the chat used to live in pseudo lines (`{chat}`, `{place}`) that each view re-read in its own way, and V1 reordered its bubbles. The owner asked for "a list that we can render in the right place, and then it automatically updates when items are added… via an item tool" ([the brief](/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-messages/requirements.md); [the owner's decisions](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/owner-decisions.md)).

## The shape

```js
session.sentences: List<Sentence>     // the raw words, append-only, never moved
session.messages:  Chat               // the conversation, in order (class Chat extends List)

class Sentence extends Item { text, via: "voice"|"text", at, raw? }                // ./Sentence.js
class Message  extends Item { by: "owner"|"smart"|"fast"|"system", at, text }      // ./Message.js
class Prompt   extends Message { sentences: [ids], title?, text?, state, prompt?, said }  // ./Prompt.js
class Reply    extends Message { re?: {to: <sentence id>}, level?, thread? }       // ./Reply.js
class Chat     extends List { messages, last }                                      // ./Chat.js
```

- **A Prompt** is what the owner said in one go. It holds its sentences **by id** and grows while the owner keeps talking. `said` is the words joined (the full dictation); `title` and `text` are a refined version, once someone writes one (then `state` is `"refined"`). `prompt` links today's Prompt *task* in `session.tasks` (Chat V2/V3).
- **A Reply** is an assistant's answer, anchored to the sentence it answers (`re.to`). `level` marks a refined restatement (`Sessions.line` with a level).
- **A plain Message** is a note, e.g. Servex saying an assistant could not be reached.
- **Order is the list's order.** Nothing is sorted by time. A message's text may change in place; its position never does.

This is the class map of the data-shapes synthesis ([synthesis.md](/framework/core/Session/tasks/data-shapes/synthesis.md) §2): Prompt and Question are messages, not tasks (§6 decision 2, the plan's fork F3); sentences live in their own list and a Prompt holds their ids (§3 [A], fork F4); the chat owns its messages (§3 [B]). Built so far: Message, Prompt, Reply, Sentence. Question, Card and Ref as messages come when something writes them.

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
- **Not mirrored:** the fast seat's `{place}` lines. The seat is off by default since 2026-11-01; if it comes back, its cleaned text becomes `{text}` on the Prompt.

## How a view reads it

- Replay the file into a `Session` (`Session.replay(lines)` in node, or `session.replay_line(line)` per streamed line, as `ext/JSONL` delivers them). `session.messages.messages` is the list.
- Live: listen to the Session's `"delta"` event; `from` is the Message that changed (a new member, or a Prompt that grew). The demo view, [ext/Chat/list](/framework/ext/Chat/list/), does exactly this in about 60 lines and redraws a 29 ms append without a reload.
- Read only the list lines (`messages`, `sentences`); never V1's `{chat}` lines.

## Check it

- `node Servex/agents/chat-messages.test.mjs` (12 checks): a mixed session through the real `Sessions.js` (spoken sentences with the floor, a reply mid-thought, a refined line, typed, a Servex note), then replayed twice and through a snapshot: the same list, same order, no twins; two counts that must agree (owner `{chat}` lines = sentences; other `{chat}` lines = replies and notes); the item tool's add and in-place edit.
- On a copy of the biggest real voice session (`v-9dvbbrn`, 2026-11-01): 1,004 owner lines gave 1,004 sentences in 330 Prompts, 316 replies gave 316 Replies; the replay took 86 ms.

## Migration (written, not run)

`node Server/ChatToMessages.mjs <session.jsonl …>` prints the lines an older session would have had, made by the same `ChatWriter`; `--apply` appends them (never rewrites) and records each file in `ai/sessions/chat-messages-moves.jsonl`. Not run: the owner wants the list to prove itself first. It cannot know when the owner was mid-thought, so old replies keep V1's positions.

## Next

- ⬜ Chat V3 reads this list instead of re-reading `{chat}` lines (the views belong to `mastermind-dictation-v3`; this list is the contract).
- ⬜ Question, Card and Ref as messages, when a writer needs them.
- ⬜ V1 switches to the list, then the `{chat}` lines stop (the owner's decision #1, "later").
