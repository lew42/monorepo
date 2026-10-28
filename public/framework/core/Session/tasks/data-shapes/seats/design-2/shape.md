# Design seat 2: the shape

**The idea in one sentence:** every thing in a session has exactly one home list, and the chat is a list of pointers to those things, one pointer per thing, so nothing is ever copied.

A session is one file (`session.jsonl`). Its root is a `Session`. Each kind of thing (sentences, prompts, replies, tasks, questions, cards, child sessions) lives in its own List on the session. The `chat` is one more List, but it holds only `Entry`s, and an `Entry` is nothing but a reference (`ref`) to a thing in one of the home lists. A thing can be in the chat at most once, because an entry's key *is* its ref. Answers to the seven questions, and the alternatives, are in [notes.md](notes.md).

## Class map

```js
class Item                                  // KEEP (core/Item): data bag, set(delta), get(name), Events, toJSON
class List<T> extends Item                  // KEEP (core/List): ordered by position; add/remove/move/order by key; insert is a no-op for a key it has

class Session extends Item                  // CHANGE: no longer extends Task (notes.md, Q1)
  id: string                                // the agent's session uuid; line 1 of the file
  kind: "voice" | "vscode" | "spawned"
  title: string                             // set by an agent, may change
  closed: {at, why} | null                  // the conversation ended; NOT "the work is done"
  // the home lists: every thing lives in exactly one of these
  sentences: List<Sentence>                 // raw speech, append-only, never edited
  prompts:   List<Prompt>                   // refined groups of sentences
  replies:   List<Reply>
  tasks:     List<Task>                     // the FEW core tasks; subtasks nest inside them
  questions: List<Question>
  cards:     List<Card>
  sessions:  List<SessionRef>               // child sessions; each lives in its own file
  // the view list
  chat:      Chat                           // List<Entry>: pointers only, in display order
  // computed on read, never stored
  index: Map<id, Item>                      // every id in the file, at any depth: O(1) for refs and {"<id>":…} lines
  sources: Map<id, Set<Item>>               // reverse links: sentence/prompt id -> the tasks, replies, questions that cite it
  completion                                // settled core tasks / core tasks
  // the verbs a line may name (each is ONE line on disk, and does all its list work itself)
  say(sentence) · refine(prompt) · reply(reply) · add_task(task) · ask(question) · show(card) · spawn(ref)

class Sentence extends Item                 // NEW: one thing the owner said
  id, text, at                              // `at` = when it was heard (the phone's clock); `by` = "whisper" | "typed"

class Prompt extends Item                   // CHANGE: no longer a Task; holds no raw text and no replies
  id, title, text                           // text = the cleaned-up wording
  sentences: string[]                       // ids of the Sentences it groups (need not be contiguous)
  unhandled                                 // computed: its sentences that no task, reply or question cites

class Reply extends Item                    // NEW as a home of its own (today replies live inside a Prompt)
  id, text, at
  to: Anchor                                // {prompt} | {sentence, words?: [from, to]} | {question}

class Task extends Item                     // KEEP the state machine (core/Task): open, working, waiting, complete, stopped
  id, title, state, why
  from: Anchor | null                       // the ask it came from; the prompt never lists its tasks (computed: sources)
  done_by: string | null                    // a child session's path, when a child does this task
  tasks: List<Task>                         // children nest inside their parent
  completion                                // computed from children

class Question extends Item                 // CHANGE: no longer a Task; its state is computed from one field
  id, text, from: Anchor | null
  answer: {text?, sentence?, by, at} | null // the owner's answer: typed text, or a ref to the Sentence they said
  open                                      // computed: answer === null

class Card extends Item                     // arbitrary content the agent shows
  id, title, text, image?
  refs?: string[]                           // a status card lists things by ref, never by copy

class SessionRef extends Item               // a child session: a pointer plus the facts of the spawn act
  id, path                                  // path = the child's folder url; its live state is read from ITS file
  role, model, brief, at                    // fixed at spawn time; never a copy of the child's changing state

class Chat extends List<Entry>              // the chat IS this list (List extends Item, so it has render())
  render()                                  // draws each Entry, keyed by ref, so a change redraws one row
class Entry extends Item
  ref: string                               // a thing's id in this file, or a url path ("/framework/…") elsewhere; ALSO the entry's key
  render()                                  // = the target's own render(), or a "missing" row naming the ref

type Anchor = {prompt?, sentence?, words?, question?, task?}   // ids in this file; a path when the target lives elsewhere
```

## A session being built, line by line

Every line is stamped `by` and `ts` by the one writer (Servex's item tool). Every line carries the ids it creates, so applying a line twice changes nothing.

```jsonl
{"session":{"id":"9f2c41d0-…","kind":"voice"},"by":"servex","ts":"2026-10-28T09:00:00.000Z"}
{"say":{"id":"s-a1f3","text":"The tab bar scrolls away on my phone.","at":"2026-10-28T09:00:04.210Z"},"by":"whisper","ts":"2026-10-28T09:00:04.400Z"}
{"say":{"id":"s-b7k2","text":"Make it stick to the top.","at":"2026-10-28T09:00:07.950Z"},"by":"whisper","ts":"2026-10-28T09:00:08.100Z"}
{"refine":{"id":"p-c9d0","title":"Sticky tab bar","text":"Pin the session tab bar to the top on mobile.","sentences":["s-a1f3","s-b7k2"]},"by":"assistant","ts":"2026-10-28T09:00:15.000Z"}
{"add_task":{"id":"t-e4m8","title":"Session page: sticky tab bar","from":{"prompt":"p-c9d0","sentence":"s-b7k2"}},"by":"mastermind","ts":"2026-10-28T09:00:20.000Z"}
{"reply":{"id":"r-f2n6","text":"On it: the bar gets position: sticky.","to":{"prompt":"p-c9d0"}},"by":"mastermind","ts":"2026-10-28T09:00:21.000Z"}
{"t-e4m8":{"complete":{"proof":"/framework/ai/…/shots/400.png"}},"by":"mastermind","ts":"2026-10-28T09:06:40.000Z"}
```

What each verb line does when it is applied (live or on replay; the same code both times):

| Line | Home list | Chat |
|---|---|---|
| `say` | `sentences.add` | `chat.add({ref: "s-a1f3"})` at the end |
| `refine` | `prompts.add` | one `p-c9d0` entry takes the place of the first covered sentence's entry; the other covered sentence entries are removed from the chat (the sentences stay in their home) |
| `add_task` | `tasks.add`, or `<parent>.tasks.add` when the line names `parent` | `chat.add({ref: "t-e4m8"})`: a live task row |
| `reply` | `replies.add` | `chat.add({ref: "r-f2n6"})`; it draws its anchor as a quote |
| `{"t-e4m8":{"complete":…}}` | that task changes in place, found through `index` | nothing to add: the existing row redraws itself |

**Optional cache:** `session.snapshot.json` = `{"schema": 2, "through": {"line": 7, "bytes": 1342}, "state": <session.toJSON()>}`. Load reads it, then replays only the lines after `bytes`. It can be deleted at any time and rebuilt from the log (notes.md, Q5).
