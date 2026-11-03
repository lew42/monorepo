# Design seat brief: a session system with tasks, from scratch

You are one of three **independent design seats**. The other two get this same brief and work blind. Where your answers agree with theirs, that agreement is the signal. So design what YOU think is right, not what you guess is wanted.

## The problem

Design a **session system**. A session is one conversation between the owner and an AI agent. It is used from a phone browser (voice) and a VS Code tab. It holds:

- **Prompts:** the owner talks. Speech-to-text (Whisper) arrives as raw sentences, a few seconds apart. The raw sentences must persist (the raw Whisper chunk text need not). An agent later groups sentences into a **refined prompt**: a titled, cleaned-up unit, which may contain several asks.
- **Replies:** the agent answers. A reply may answer a whole prompt, or one sentence or word range of it.
- **Tasks:** asks become tasks. A task can have child tasks. Tasks have states (open, working, waiting, complete, stopped) and must actually get finished; a session should hold a few core tasks, not hundreds.
- **Questions:** the agent asks the owner something. A question is open until answered.
- **Cards:** arbitrary content the agent shows (a summary, a status list, a picture).
- **Child sessions:** agents the session spawns, each its own session.
- **The chat:** the view of all of the above, in order, live. Its `messages` is a list of things that each have a `render()`, like a page's content list. Some entries are owned by the chat (a card); some are **references** to things that live elsewhere (a sentence, a task). Where each piece of data lives must be unambiguous: no duplicate copies drifting out of sync, nothing made twice, nothing rendered wrong.
- Every item is live: a button on any item (complete a task, answer a question) writes a change through a socket, and every open view updates instantly with no flicker.

## The base you build on (read the code, it is real)

- `public/framework/core/Item/Item.js` and `Store.js` (an Item is an object whose changes are deltas; `set` applies a delta, `get` finds a property by path).
- `public/framework/core/List/List.js` (an ordered list of Items with ids).
- `public/framework/ext/JSONL/JSONL.js` and `live.js` (the append-only file each root writes, one delta per line, replayed on load and tailed live).
- `public/framework/core/Task/Task.js`, `Prompt.js`, `Question.js`, and `public/framework/core/Session/Session.js` (what exists today: Session extends Task extends Item).

You may keep, change or replace any of it. Say which and why.

Questions you must answer:

1. **Class map:** which class extends which; each class's core properties and what each holds (a List of what? an instance of what? a reference to what?).
2. **Tasks: nested** (children inside their parent), **flat with references** (one list, parent ids), or a **hybrid**? Pick one; give the cost of the others.
3. **Where each thing lives** and how the chat shows it without copying it. What exactly is a chat entry?
4. **Ids and order:** how ids are made (unique where?), how list order is kept, whether a timestamp belongs on a list entry.
5. **Storage:** append-only deltas, full snapshots (one whole JSON per change; the owner's older system did this and it worked well), or both. What does one line on disk look like for each kind of change?
6. **Code-made vs UI-made:** code that builds structure reruns on every page load; a click happens once. How do you keep a rerun from making duplicates?
7. **Child sessions:** inside the parent's file, or their own file with a reference?

## What you write

All in your own folder (the task dir you were given, `seats/<your-name>/`):

- **`shape.md`**, one page: the class map as pseudocode (`class X extends Y { prop: List<Z> // what it holds }`), then 3–6 sample JSONL lines showing a session being built (a sentence arrives, it is grouped into a prompt, a task is made, a reply is written, the task completes).
- **`notes.md`**: your answers to the 7 questions, the pros and cons of your choice against the alternatives, and what the current code gets right or wrong.
- Optional `per-class/<Class>.md` when a class needs more.

Plain sentences, for a new coder. No implementation; pseudocode only.

## Fences

- **Write only in your own folder.** No edits to code, readmes or other files. No moves.
- **Stay independent:** do NOT open `public/framework/ai/design-decisions-*.md`, `system-map.md`, `system-proposal.md`, `chat-architectures.md`, `roles-proposal.md`, anything under `core/Item/doc/`, the parent `data-shapes/requirements.md`, the other seats' folders, or the `past-work.md` Servex may write beside you. Those are other people's answers; reading them spoils the signal. Readmes beside the code above are fine.
- Keep it to about an hour of reading. Commit your folder by path when done (`git add <your folder>` then `git commit`), and end your turn with a 5–10 line summary: your class map in one breath, your task choice, your storage choice, your biggest worry.
