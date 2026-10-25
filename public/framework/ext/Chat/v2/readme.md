# Chat v2: a session's chat, drawn from its `tasks` list

Read-only step 1 of the new chat (the owner's decision, [chat-shape.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-shape.md)): a session's conversation is its `tasks` list in `session.jsonl`. Each Prompt sits at the root of the chat (no bubbles, no card) as the smart assistant's refined version; its replies, questions and child tasks nest under it, marked 🧠. The raw Whisper text and the fast assistant's cleaned paragraphs are one click down, "show raw", never dropped. The old chat ([Chat.js](../Chat.js), `ux/Dictate/chat.js`) is untouched until v2 replaces it.

Try it: [/framework/ext/Chat/v2/](/framework/ext/Chat/v2/) draws [fixture/session.jsonl](fixture/session.jsonl); `?src=<url of any session.jsonl>` draws that session, live.

## Classes

- `ChatV2.js`: `class ChatV2 extends JSONL`. `read()` collects lines, `draw()` folds them and draws the roots in **list order, never sorted**, `live()` streams appends (a redraw keeps "show raw" open). Parts are its methods: `prompt`, `sentences`, `reply`, `child`.
- `ChatV2Model.js`: folds the lines into plain objects and holds every field read (`title`, `raw`, `paragraphs`, `replies`, `answer`), the computed `sentences(prompt)` and `phase(question)`. When `core/Task/Prompt.js` and `Question.js` land, swap this file's reads for the class getters; the views do not change.
- `ChatV2.css`: the `chat-v2-` classes, all in `@layer site`. Column max 46rem.
- `ChatV2.test.mjs`: headless Playwright, 19 checks (order, nesting, show raw, live append): `node ChatV2.test.mjs [base-url] [shots-dir]`.

## The shape it reads (one line each in `session.jsonl`)

```js
{tasks:{add:{type:"Prompt", id:"p-<ms>", title, text,          // the smart assistant's version; may be absent early
  raw:["whisper text", …], paragraphs:[{id:"a", text}],        // one raw per utterance; the fast assistant's cleaned text
  replies:[{id:"r-<ms>", text, by, ts, anchor?:{sentence:"a1", words?:[start,end]}}],   // end exclusive
  tasks:[ …child Task / Question entries… ]}}}
{tasks:{add:{type:"Question", id:"q-<ms>", text, from:"p-<ms>", answer?:{text, by, ts}}}}
{"<id>":{answer:{…}}}  {"<id>":{complete:{}}}  {"<id>":{replies:{add:{…}}}}   // later lines edit by id
```

Sentences are computed, not stored: a sentence id is its paragraph id plus a 1-based index (`a1`, `a2`, `b1`). A Question is open (no answer), answered (answer, not complete) or complete. A prompt's children are its own `tasks` plus any root Question or Task whose `from` is its id. A prompt with no title or text draws its paragraphs; an anchored reply sits beside its sentence (below on a phone) with the words marked.

## Who writes the data

Not wired yet: the fast assistant writes Prompts (raw and paragraphs; `Servex/agents/Sessions.js` `voice_say`), the smart assistant writes replies, questions and tasks. Both land in step 3 of [chat-v2](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-v2/requirements.md). Until then the fixture is the only data.

**Where it shows:** the standalone page (`?src=<session.jsonl url>`) and the session page's Chat tab, under its **Chat v2** chip (`?tab=chat&chat_view=v2`; `ai/AISession/AISessionDetail.js`). Sessions migrated by `Server/PromptsToSession.mjs` already hold Prompts, for example [session e00f55c9](/framework/ai/sessions/2026/10/20/session-e00f55c9/?tab=chat&chat_view=v2).

## Decisions

- Fields are read from a plain fold, not `Session.replay`: an unregistered `Prompt` hydrates as a bare Item that drops the raw strings, so the raw Whisper text would be lost. Swap to `s._tasks` once the classes land.
- Child cards are `ChatV2.child`, not `TaskView.row`, which needs a live Task; it reuses `TaskView.STAGE` for the icons.
