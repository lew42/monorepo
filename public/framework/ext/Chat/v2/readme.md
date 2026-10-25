# Chat v2: a session's chat, drawn from its `tasks` list

Read-only step 1 of the new chat (the owner's decision, [chat-shape.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-shape.md)): a session's conversation is its `tasks` list in `session.jsonl`. Each Prompt sits at the root of the chat (no bubbles, no card) as the smart assistant's refined version; its replies, questions and child tasks nest under it, marked 🧠. The raw Whisper text and the fast assistant's cleaned paragraphs are one click down, "show raw", never dropped. The old chat ([Chat.js](../Chat.js), `ux/Dictate/chat.js`) is untouched until v2 replaces it.

Try it: [/framework/ext/Chat/v2/](/framework/ext/Chat/v2/) draws [fixture/session.jsonl](fixture/session.jsonl); `?src=<url of any session.jsonl>` draws that session, live.

## Classes

- `ChatV2.js`: `class ChatV2 extends JSONL`. `read()` draws everything on the first load, then patches in place: each later line updates only the element(s) `ChatV2Model.apply(line)` says it touched (`apply_one`, `patch`, `insert_reply`, `move_anchored`). A root Task or Question added live goes to the root, or into its prompt's nest when its `from` names one; "show raw" or a first title moves only the anchored replies between the nest and their sentences; `reset()` (the file was rewritten) drops the model so the replay draws whole. Parts are its methods: `prompt` (+ `prompt_head`, `prompt_raw_wrap`, `prompt_nest`), `sentences`, `reply` (+ `reply_body`), `child` (+ `child_body`).
- `ChatV2Model.js`: folds the lines into plain objects and holds every field read (`title`, `raw`, `paragraphs`, `replies`, `answer`), the computed `sentences(prompt)` and `phase(question)`. `apply(line)` also says what the line touched, for `ChatV2`'s in-place patch (see Decisions).
- `ChatV2.css`: the `chat-v2-` classes, all in `@layer site`. Column max 46rem.
- `ChatV2.test.mjs`: headless Playwright, 43 checks (order, nesting, show raw, live append, in-place patch with the chat's own scroller held): `node ChatV2.test.mjs [base-url] [shots-dir]`.

## The shape it reads (one line each in `session.jsonl`)

```js
{tasks:{add:{type:"Prompt", id:"p-<ms>", title, text,          // the smart assistant's version; may be absent early
  raw:["whisper text", …], paragraphs:[{id:"a", text}],        // one raw per utterance; the fast assistant's cleaned text
  replies:[{id:"r-<ms>", text, by, ts, anchor?:{sentence:"a1", words?:[start,end]} | {sentence:"a1", from, to}}],   // end exclusive, either shape
  tasks:[ …child Task / Question entries… ]}}}
{tasks:{add:{type:"Question", id:"q-<ms>", text, from:"p-<ms>", answer?:{text, by, ts}}}}
{"<id>":{answer:{…}}}  {"<id>":{complete:{}}}  {"<id>":{replies:{add:{…}}}}   // later lines edit by id
```

Sentences are computed, not stored: a sentence id is its paragraph id plus a 1-based index (`a1`, `a2`, `b1`). A Question is open (no answer), answered (answer, not complete) or complete. A prompt's children are its own `tasks` plus any root Question or Task whose `from` is its id. A prompt with no title or text draws its paragraphs; an anchored reply sits beside its sentence (below on a phone) with the words marked.

## Who writes the data

Not wired yet: the fast assistant writes Prompts (raw and paragraphs; `Servex/agents/Sessions.js` `voice_say`), the smart assistant writes replies, questions and tasks. Both land in step 3 of [chat-v2](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-v2/requirements.md). Until then the fixture is the only data.

**Where it shows:** the standalone page (`?src=<session.jsonl url>`) and the session page's Chat tab, under its **Chat v2** chip (`?tab=chat&chat_view=v2`; `ai/AISession/AISessionDetail.js`). Sessions migrated by `Server/PromptsToSession.mjs` already hold Prompts, for example [session e00f55c9](/framework/ai/sessions/2026/10/20/session-e00f55c9/?tab=chat&chat_view=v2).

## Decisions

- Fields are still read from a plain fold, not the real `Prompt`/`Question` classes (`core/Task/Prompt.js`, `Question.js`, now landed): the view needs the raw LINES, never an Item tree built from them, so `ChatV2Model` keeps its own small reads (`title`, `anchor`, `phase`…) matched by hand to the classes' own rules. The alternative, `Prompt.from(line)` read-only getters straight off the lines, wins once core exposes a cheap fold that does not require hydrating a live Item.
- Child cards are `ChatV2.child`, not `TaskView.row`, which needs a live Task; it reuses `TaskView.STAGE` for the icons.
- **In place, never redraw:** `ChatV2` keeps one `View` per item id (`els`), plus three containers per prompt (`head`, `raw`, `nest`) so a change to its own fields never touches its children. `ChatV2Model.apply(line)` says what the line touched — an add (with its parent, `null` at the root) or a field change on an id already drawn — and `ChatV2.apply_one` either appends one new element where it belongs or calls `view.empty(bodyFn)` to refill that ONE element's content, keeping its `.el` (so references elsewhere, and the scroll position, never move). The alternative, a keyed diff of the whole tree (React/morphdom-style), wins once the model's shape gets deep enough that per-field patch rules like this one outnumber the handful here — this chat is three levels deep at most, so hand-written patches stay cheaper.
