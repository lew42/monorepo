# Sessions, tasks and messages: the classes, as pseudocode (2026-11-02)

One screen on how a session, its tasks and its chat fit together, checked against the code on 2026-11-02. Linked from [the Session readme](../readme.md).

## The classes

```js
class Item extends Events            // core/Item/Item.js: data + one rule for lines (set(delta)), replayed from JSONL
class List extends Item              // core/List: ordered members, each an Item with an id

class Task extends Item {            // core/Task/Task.js
  tasks: List<Task | Process | Session | Prompt…>   // made on first use; a member's `type` picks its class
  state                              // idle | running | waiting | complete | stopped (from verb lines: start(), complete(), …)
  completion                         // 0..1, computed on read, never stored (below)
  sessions: [{id, task}]             // ATTRIBUTION: who worked on it (node writes it). Not child sessions.
  start() wait() complete({outcome, evidence}) stop() …
}
class Process extends Task           // core/Task/Process.js: tasks are named steps, run in order by node (ProcessRunner)
                                     // templates: core/Task/processes/BuildProcess.js (8 steps), DesignProcess, InvestigateProcess

class Session extends Task {         // core/Session/Session.js, since 2026-10-24
  is_session: true
  tasks                              // the ONE list: tasks, processes and child sessions (an entry whose record is a session)
  children                           // a view over `tasks`: the child sessions; never a second list
  messages: Chat                     // the conversation, in order (core/Session/Chat)
  sentences: List<Sentence>          // the owner's raw words; a Prompt holds them by id
}

class Chat extends List              // members are Messages
class Message extends Item           // by, at, text
class Prompt  extends Message        // sentences: [ids], raw (computed), clean, kind, items, sent, working
class Reply   extends Message        // re: {to: sentence id}
// plus Ref (core/Item/Ref.js): points at a task, a session or an older message without copying it
```

## Where it's stored

A session folder is `ai/sessions/YYYY/MM/DD/<slug>/`, and its `session.jsonl` holds every line. A task with its own folder is a `{"task": "<folder url>"}` line in the parent, and its own `task.jsonl` in that folder. Child sessions are entries in `tasks`, the same way.

## Who writes the chat today (counted in the voice session `v-qfzrnhh`, 2026-11-02)

| Lines | Written by |
|---|---|
| Prompt messages (7) | Servex, as each sentence arrives (`ChatWriter`) |
| Reply messages (11) | Servex, which mirrors the smart seat's replies |
| Edits to messages (14) | Servex: the sent marks and the fast seat's cleaned text |
| Prompt **tasks** (7) | the fast seat: the older copy of each Prompt, which V2/V3 still read |
| Real tasks (1) | the smart seat, through the item tool |

So the voice agents don't yet add or edit messages by id themselves: Servex does it for them. The item tool can do it now, with `{"messages":{"add":{…}}}` or `{"messages":{"<id>":{text}}}`. The Prompt tasks inflate the session's task count with things that aren't tasks; they go away once the views read the Prompt messages.

## Completion

Today, `Task.completion` with subtasks is **the share of subtasks that are complete**. A half-done subtask counts as 0, and stopped ones are left out.

The owner's formula (2026-11-02) is **the average of each subtask's own completion**: the sum of their completions divided by their count. So a half-done subtask counts as 0.5, and a session at 100% means every task in it is at 100%. This is being changed in `core/Task/Task.js` (`progress_of` and `completion`), test first.

## An open naming question: `session.sessions`

The owner remembers child sessions living in `session.sessions`. In the code they are entries in `tasks`, shown by the `children` view. And `sessions` already means something else on every Task: who worked on it.

The proposal: rename the attribution field to `worked_by`, and make `session.sessions` the view of child sessions. That's a core API rename with many callers, so it waits for a "go" from the owner.

## Line keys: the three spellings ("marked lines")

These are real properties, not pseudo properties. The spelling of a key in a line says which namespace it means:

| Key | Means | Example |
|---|---|---|
| `title` | a data field | `{"title":"New name"}` |
| `start()` | a method call | `{"start()":{}}` |
| `#c3` | the list member with id `c3` | `{"tasks":{"#c3":{"title":"…"}}}` |

The marks keep a method and a data field with the same name from colliding. Every reader in core reads both the marked and the bare spelling. Writers switch to the marked one when `Store.marked_lines` is on, which is in progress (`ai/sessions/2026/10/20/session-e00f55c9/marked-lines-switch/`). The full rules are in [line-format.md](../../Item/doc/line-format.md).
