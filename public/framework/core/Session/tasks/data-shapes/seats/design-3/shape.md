# Design seat 3: the session's shape

A session is **one file** (`session.jsonl`) that rebuilds **one object**. That object has exactly **three homes**, and every item lives in exactly one of them:

- **`chat`**: everything said or shown, in the order it happened (sentences, prompts, replies, questions, cards).
- **`tasks`**: the work. A few core tasks; their children nest inside them.
- **`sessions`**: one spawn record per child session. The child's own content lives in its own file.

Two rules keep everything else simple:

1. **Nest when a thing has one natural owner; refer when its home is elsewhere.** A sentence that becomes part of a prompt *moves into* the prompt. A task shown in the chat is a *reference* to the task.
2. **Copy only facts that never change; read anything that changes from its home.** A reference holds an id, never a title or a state.

Answers to the seven questions, with the alternatives: [notes.md](notes.md).

## Class map

```js
class Item                      // kept as is: data bag, set(delta), get(name), id, events, toJSON
class List extends Item         // kept as is: ordered members by id; add/remove/move/order; adding an id that is already there does nothing

class Session extends Item {    // NOT a Task any more (notes.md, question 1)
  id: string                    // the agent runtime's uuid; written on line 1
  kind: "voice" | "vscode" | "agent"
  parent?: { session, for }     // only for a child session: who spawned it, and for which task. Never changes
  title: string
  chat: Chat                    // HOME of everything said or shown
  tasks: TaskList               // HOME of the work: the few core tasks
  sessions: List<SessionRef>    // HOME of the spawn records
  // computed on read, never stored:
  index: Map<id, Item>          // every item in this file by id, at any depth; updated by add/remove/move events
  get(name)                     // a property first, then the index: a line can name any item by its bare id
  state, completion, open_questions, unhandled_asks, cost, children
  spawn({id, for, role, model}) // verb: adds a SessionRef and a Ref message to the chat
  file({ask, task, under?})     // verb: makes a task (or names an existing one) and sets the ask's outcome
}

class Chat extends List<Message> {
  get messages()                // = this.items (the owner's word for them)
  group({id, title, text, sentences, asks})   // verb: a Prompt lands where its first sentence was; the sentences move into it
  ungroup(prompt_id)            // verb: the sentences go back to where the prompt was
}

class Message extends Item {    // anything that sits in the chat
  by: "owner" | "<agent id>"
  created_at                    // computed: the `ts` of the line that added it
  render()                      // its own view, bound to it; patches itself in place
}
class Sentence extends Message { text /* never edited */, via: "voice" | "typed", fixed? /* a corrected text shown instead */ }
class Prompt   extends Message { title, text /* the cleaned version */, sentences: List<Sentence> /* moved in, owned */, asks: List<Ask> }
class Reply    extends Message { text, to?: Anchor }          // Anchor = { id: <any item id>, words?: [first, last] }
class Question extends Message { text, options?: string[], answer?: { text, by, from?: [sentence ids] } }   // phase computed: open | answered
class Card     extends Message { title, text, image?, rows? } // owned by the chat
class Ref      extends Message { ref: "<id>" | "<session id>/<id>" }   // render() draws the LIVE target, compact

class Ask extends Item {        // one thing a prompt asks for; lives in its prompt
  text, cites: [sentence ids]
  outcome?: { is: "task" | "answered" | "noted" | "no-action", ref?: <task or reply id> }
}

class Task extends Item {
  title
  state: "open" | "working" | "waiting" | "complete" | "stopped"   // changed only by verbs
  tasks: TaskList               // child tasks, nested inside
  waiting_on?: { who, what, question?: <question id> }
  outcome?, evidence?, why?     // complete needs outcome + evidence; stop needs why
  // computed: progress, completion, asked_by (asks whose outcome names me), workers (sessions spawned for me), cost
  start(), wait(), complete({outcome, evidence}), stop({why}), reopen()
}
class TaskList extends List<Task> {}   // warns when a session has more than 7 core tasks: group them

class SessionRef extends Item { id /* the child's session id */, for: <task id>, role, model }   // render() reads the child's file live
```

## A session being built, line by line

Each line is one event. `by` and `ts` are stamped by the one writer (Servex). Ids are made once, by whoever creates the item.

```jsonl
{"session":{"id":"9f2c41d0-…","kind":"voice"},"by":"servex","ts":"2026-10-28T09:14:00Z"}
{"chat":{"add":{"type":"Sentence","id":"s-k2p9x4","via":"voice","text":"The chat takes five seconds to open on my phone."}},"by":"owner","ts":"2026-10-28T09:14:03Z"}
{"chat":{"add":{"type":"Sentence","id":"s-m81qz0","via":"voice","text":"Make it open in under a second."}},"by":"owner","ts":"2026-10-28T09:14:07Z"}
{"chat":{"group":{"id":"p-7hd2ka","title":"Chat opens slowly on the phone","sentences":["s-k2p9x4","s-m81qz0"],"asks":[{"id":"a-0c4n1e","text":"Open the chat in under 1 s on the phone","cites":["s-m81qz0"]}]}},"by":"agent:smart","ts":"2026-10-28T09:14:15Z"}
{"file":{"ask":"a-0c4n1e","task":{"id":"t-chat-speed","title":"Chat opens in under 1 s on the phone"}},"by":"agent:smart","ts":"2026-10-28T09:14:16Z"}
{"chat":{"add":{"type":"Reply","id":"r-5tq0aa","to":{"id":"s-k2p9x4","words":[2,4]},"text":"Measured 4.8 s: it reads 1,040 lines before drawing. Filed as a task."}},"by":"agent:smart","ts":"2026-10-28T09:14:40Z"}
{"t-chat-speed":{"complete":{"outcome":"The chat opens in 0.6 s on a Pixel 7","evidence":["commit 3e1a9c2","shots/phone-open.png"]}},"by":"agent:builder","ts":"2026-10-28T10:02:11Z"}
```

What each line does:

- **Line 2–3:** a sentence arrives from Whisper and goes straight into the chat. Its text never changes.
- **Line 4:** the agent groups the two sentences into a refined prompt with one ask. The prompt sits where the first sentence was, and the sentences now live *inside* it, so they are drawn once.
- **Line 5:** the ask becomes a core task. The ask records where it went (`outcome: {is: "task", ref: "t-chat-speed"}`); the task finds who asked by looking it up.
- **Line 6:** the reply answers words 2–4 of the first sentence, counting from 0 ("takes five seconds").
- **Line 7:** the task completes, with proof. Every open view of it (in the task list, and as the ask's chip inside the prompt) updates from this one line.

A load reads `snapshot.json` (the whole state as of byte N, written by node) and replays only the lines after N. The snapshot is a cache: delete it and the file rebuilds the same state.
