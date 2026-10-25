# Chat shape: what a session's chat is stored as

The owner's question (2026-10-25): the fast assistant (Haiku) and the smart assistant (Opus) both write to their own session with the item tool. Should the chat simply be the session's `tasks` list, with prompts, questions, tasks and child sessions all in it? Or does the chat need its own store? This page lays out the options, so we can agree on one shape before building.

## What exists today

- `Session extends Task` (`core/Session/Session.js`). A session has one `tasks` list; child sessions are entries in it; `children` is a view.
- `Prompt` is **not** a Task yet. It is a plain class in `ext/Refine/Prompt.js`, and the hook's records go to `prompts.jsonl` (`Server/PromptRecords.mjs`).
- The dictation chat stores bubbles its own way (the voice session's log), separate from both.

So today there are three stores for one conversation. Every option below brings that down to one or two.

## The things a chat shows

| Thing | Who makes it | Needs a "done"? |
|---|---|---|
| Your prompt (raw Whisper text + cleaned paragraphs) | fast assistant | yes: every ask in it gets handled |
| A question you asked | fast assistant, from your prompt | yes: answered, then seen by you |
| A task (something to do) | smart assistant | yes |
| A child session (an agent it launched) | code, at spawn | yes |
| A reply from the assistant | smart assistant | no, it answers something |
| A status line or note ("working on it") | either | no |

The last two rows are the whole problem: they have no "done".

## Option A: everything is a task, one list

Every row above is an entry in `tasks`. A reply or a note is a `Note extends Task` that is born complete. The chat renders `tasks` in order.

- ✅ One list, one renderer, completion everywhere.
- ⬜ The list fills with born-done notes, so "15 of 20 done" counts chatter. The counts would have to skip notes.

## Option B: two lists, tasks and a timeline

`tasks` holds only things with a done. A second list, `timeline`, holds every bubble in order; a bubble either carries text or points at a task by id.

- ✅ The chat order is explicit, and the counts stay honest.
- ⬜ Two lists that must agree. Every new task needs a timeline entry too, which breaks "one of everything".

## Option C (recommended): one list; a reply lives on what it answers

`tasks` holds only things with a done: Prompt, Question, Task, Session. **A reply is not an entry.** It is written onto the thing it answers: `prompt.replies`, `question.answer`, `task.outcome`. A note goes on its task as `now` or a log line. The chat is `tasks` in order, and each prompt draws as your bubble with its replies and its child tasks under it.

- ✅ One list. The counts are honest, because every entry has a real done.
- ✅ Nothing floats loose: a reply always says what it answered. That is the same rule as completion.
- ⬜ A reply that answers nothing in particular (the assistant speaking first) needs a home. It goes on the latest prompt.

## How it reads in Option C

Each line is one item-tool call. Ids are timestamps (`p-<ms>`, `q-<ms>`); nothing else depends on their shape.

```js
// fast assistant: a new prompt (keeps the raw Whisper text, so nothing is lost)
item({path: SESSION, delta: {tasks: {add: {type: "Prompt", id: "p-1761390000000",
  raw: ["yeah so I think it's important"], paragraphs: [{id: "a", text: "Yeah, so I think it's important…"}]}}}})

// fast assistant: the next sentence, appended to the last paragraph
item({path: SESSION + "/p-1761390000000", delta: {raw: {push: "…"}, paragraphs: {append: {id: "a", text: " …"}}}})

// fast assistant: or a new paragraph
item({path: SESSION + "/p-1761390000000", delta: {paragraphs: {add: {id: "b", text: "…"}}}})

// fast assistant: a question it heard becomes a Question card, open until answered
item({path: SESSION, delta: {tasks: {add: {type: "Question", id: "q-…", text: "Does a question extend Task?", from: "p-1761390000000"}}}})

// smart assistant: answers it
item({path: SESSION + "/q-…", delta: {answer: {text: "Yes: …"}}})

// you, on the page: tick it once you have read the answer
item({path: SESSION + "/q-…", delta: {complete: {}}})
```

A question has three states: **open**, **answered** (the assistant replied), **complete** (you have read it). "Answered but not complete" is exactly the list you wanted: questions whose answers you never saw.

The smart assistant hears all of this by `follow` on its own session, which skips its own writes.

## What each option needs built

- **All options:** `class Prompt extends Task` and `class Question extends Task` in core, registered so `tasks.add` can make them. The hook's `prompts.jsonl` moves onto the session's `tasks` (a scripted migration). Appending to a paragraph needs the partial-string edit already noted in `core/Item`'s inbox.
- **A:** a `Note` type, plus counts that skip notes.
- **B:** the `timeline` list, plus code that keeps it in step with `tasks`.
- **C:** `replies` / `answer` fields, and a chat renderer that draws a prompt's replies and child tasks under its bubble.

## One rule from the misorder bug (applies to every option)

The chat is drawn in **list order**, the order Node appended the entries, never sorted by a time stamp or by the `p-<ms>` id. Bubbles appeared out of order on 2026-10-25 because the chat sorted by a time that mixed the phone's clock with the PC's ([order/report.md](order/report.md)). One list with one writer is already in order, so a sort can only make it wrong. If a stamp is needed for display, it is Servex's `ts`.

## Still open

- Should one prompt be one Prompt, or should the fast assistant split a long dictation into several (one per idea)? The recommendation is one per idea: the fast assistant already decides where the ideas break.
- Does the dictation sheet's current bubble log become this, or does it stay as the raw transport log underneath? The recommendation is to keep it as the raw log and draw the chat from `tasks`.

## Decision (the owner, 2026-10-25): Option C, with these corrections

- **C it is.** The conversation lives in the session's own `session.jsonl`, in its `tasks` list. No third store: `prompts.jsonl` folds into the session (a scripted migration, nothing lost). Responses are not dissected the way prompts are.
- **The fast assistant does not make tasks or questions.** It gives live feedback only: the transcription, cleaning, and placing sentences into paragraphs and prompts. Turning a prompt into tasks, questions and cards is the **smart assistant's** job. (This corrects the Question example above: the smart assistant adds it, not the fast one.)
- **The smart assistant is the voice mastermind.** It stays hands-free so it can always answer. It spawns its own masterminds for the work and never does the work itself. It may rewrite, or redo entirely, anything the fast assistant wrote.
- **A plain chat reply is allowed.** It lives on the prompt it answers (`prompt.replies`). A reply can point at one sentence or a word range by id, so an answer can sit beside the exact words it answers.
- **The trace is the point.** "Didn't I ask for this?" must be answerable by search: the raw prompt, when it was said, the tasks made from it, and whether each was done. The raw Whisper text stays on the Prompt.
- **Layout, first pass (Figma mock later):** no left/right bubbles. Your transcription sits at the root of the chat area, not in a card. The smart assistant's replies and cards nest under the prompt they answer, marked with the brain icon.
- **Build it as Chat v2, a new widget.** The current dictation chat stays as it is until v2 replaces it. Call it chat: dictation is one feature of the chat.
