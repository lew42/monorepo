# Seat 1: the session shape

**The idea in one line:** a session is one file. Inside it, every thing has exactly one owner list. Raw words never move. Everything else points at them by id.

Four lists hang off the session. Three of them own data, and one (`chat`) mostly owns conversation and points at the rest:

| List | Owns | Why it is separate |
|---|---|---|
| `sentences` | every sentence the owner said or typed | the raw words; append-only, never edited, never moved |
| `chat` | prompts, replies, questions, cards, and `Ref`s | the conversation, in the order it happened |
| `tasks` | the task tree (a few core tasks, their subtasks) | work outlives the moment it was asked |
| `sessions` | one link per child session | each child is its own file |

## Class map

```js
class Item                       // KEPT: data bag, set(delta), get(name), events, toJSON
class List extends Item          // KEPT: ordered members by id; add/remove/move/order with `after`

class Session extends Item {     // CHANGED: no longer extends Task (notes.md, Q1)
  id: string                     // the session id (Claude uuid, or "v-xxxx" for voice); the folder holds session.jsonl
  kind: "voice" | "vscode" | "agent"
  title, model, role             // plain fields
  state: "open" | "closed"       // its OWN state; close() refuses while a task is open
  parent?: { session, task? }    // write-once birth fact (line 1); never edited, so it cannot drift
  sentences: List<Sentence>      // the transcript
  chat: List<Prompt | Reply | Question | Card | Ref>
  tasks: List<Task>              // tree roots only
  sessions: List<SessionLink>    // child sessions
  index: Map<id, Item>           // COMPUTED: every item in the file by id; filled by List.adopted/released, never stored

  // verbs: one line each, so a change that touches two lists is still one line on disk
  hear({id, text, prompt, at?})  // a sentence -> sentences, and into draft prompt `prompt` (made, in chat, if new)
  task({id, title, under?, from?})   // a task -> tasks (or under a task), plus a Ref in chat
  reply({id, text, re?})         // a Reply -> chat
  ask({id, text, re?})           // a Question -> chat
  show({id, ...card})            // a Card -> chat
  spawn({id, role, model, for?}) // a SessionLink -> sessions, plus a Ref in chat
  close()                        // refuses while any task is open or working
  // computed: completion (from tasks), open_questions, cost (own + children)
}

class Sentence extends Item {    // owned by session.sentences
  text: string                   // the words, as heard (Whisper chunk text is NOT kept)
  via: "voice" | "typed"
  at?: string                    // when spoken, only if it differs from the line's ts (phone was offline)
}

class Prompt extends Item {      // owned by session.chat
  sentences: string[]            // sentence ids, in order: REFS, not copies
  state: "draft" | "refined"
  title?, text?                  // the refined version (cleaned, titled)
  no_action?: string             // why nothing needs doing, when that is the answer
  refine({title, text}), split({at: sentenceId, id}), merge({with: promptId})
  // computed: words (the joined sentence text), replies, made (tasks/questions whose `from` points into me), settled
}

class Reply extends Item {       // owned by session.chat
  text, by
  re?: Anchor                    // what it answers
}

class Question extends Item {    // owned by session.chat; NOT a Task
  text, by
  re?: Anchor
  answer?: { text?, to?: id, by } // a button's text, or a pointer to the sentence or prompt that answered
  // computed: phase = answer ? "answered" : "open"
}

class Card extends Item {        // owned by session.chat; updated in place
  title?, text?, image?
  items?: List<Item>             // a status list, rows, anything with render()
}

class Ref extends Item {         // owned by session.chat; a pointer, never a copy
  to: id                         // a task, a sentence, or a SessionLink
  why?: "made" | "done" | "mention"
  render() { return session.index.get(to).render() }   // draws the real thing, live
}

class Task extends Item {        // owned by session.tasks or by a parent task's `tasks`
  title
  state: "open" | "working" | "waiting" | "complete" | "stopped"
  from?: Anchor                  // the words that asked for it
  waiting_on?, why?, outcome?, evidence?
  tasks: List<Task>              // children, nested
  start(), wait({on, what}), complete({outcome, evidence}), stop(why), reopen()
  // computed: completion, progress, worker (the SessionLink whose `for` is me)
}

class SessionLink extends Item {  // owned by session.sessions
  id                              // = the child's session id
  role, model, for?: taskId       // which task it was spawned to do
  // computed: session (the child, opened lazily from its own file), state, cost
}

// Anchor is plain data, not an Item: { to: id, words?: [from, to] }
// `to` names a prompt or a sentence; `words` narrows to a word range in that sentence.
```

Ids are unique in the whole file, not only among siblings, so any line can name any item by its bare id (`{"t-4k2m":{…}}`).

## A session being built, on disk

```jsonl
{"session":{"id":"v-7k2q","kind":"voice","at":"2026-10-28T09:00:00-05:00"}}
{"hear":{"id":"s-a1","text":"The tab bar is broken on my phone.","prompt":"p-b2"},"by":"dictate","ts":"2026-10-28T09:00:04-05:00"}
{"hear":{"id":"s-a2","text":"Can you fix it today?","prompt":"p-b2"},"by":"dictate","ts":"2026-10-28T09:00:07-05:00"}
{"p-b2":{"refine":{"title":"Fix the mobile tab bar","text":"The tab bar is broken on the phone. Fix it today."}},"by":"fast-assistant","ts":"2026-10-28T09:00:15-05:00"}
{"task":{"id":"t-c3","title":"Fix the mobile tab bar","under":"t-ui","from":{"to":"p-b2"}},"by":"agent","ts":"2026-10-28T09:00:20-05:00"}
{"reply":{"id":"r-d4","text":"On it. Filed under UI.","re":{"to":"s-a2"}},"by":"agent","ts":"2026-10-28T09:00:21-05:00"}
{"t-c3":{"complete":{"outcome":"The tab bar wraps at 400 px.","evidence":["shots/400.png"]}},"by":"agent","ts":"2026-10-28T09:40:02-05:00"}
```

Line 2 makes sentence `s-a1` and, because `p-b2` does not exist yet, a draft prompt `p-b2` at the end of the chat. Line 3 adds `s-a2` to the same draft. Line 5 adds the task under the core task `t-ui` and a `Ref` to it in the chat; the chat now shows the task's live card where it was made. Line 7 changes only the task; the chat's `Ref` redraws by itself.

Answers to the seven questions, the alternatives and what today's code gets right and wrong: [notes.md](notes.md).
