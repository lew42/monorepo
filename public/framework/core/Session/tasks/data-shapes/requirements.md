# Data shapes: sessions, tasks, prompts, chat, on Item / List / JSONL

**The owner's ask (2026-10-28, VS Code tab e00f55c9).** Design work only: **no major surgery, nothing that breaks.** The owner's words are in this tab's prompt log (the prompt starting "Okay, so I think there was a V3 built at some point"). The tab (vscode-mastermind) runs this project itself, as the owner offered.

## What the owner wants

1. **Class architecture pseudocode, one system map:**
   - which class extends which, in order;
   - each class's core properties and what goes in each one (a List of what? an instance of what?);
   - no implementation details.
2. **The shapes, priority one:** session, task, prompt (the raw sentences, the refined and titled grouping), the agent's replies, question cards, arbitrary content cards, and child sessions.
   - Everything that exists is an object.
   - Raw Whisper text need not persist; the sentences do.
3. **Underneath:** the critical design features of **Item, List and the JSONL streaming/store**. How they work now, what works, what doesn't, and what they should be:
   - `set` applies a delta and uses `get` to find the property;
   - lists need ids and order; is an "added at" time part of a list delta?
   - the store is swappable: JSONL deltas or snapshot mode (the owner's older system wrote one full JSON per change and worked well). A delta can be a whole-object assign, which is a snapshot as one line;
   - **code-made vs UI-made items:** code reruns on every load, while a UI action happens once. Probably code builds the persistent structure (with no items), and items arrive from agents and the UI.
4. **Chat as a module:**
   - `chat.messages` is a list of anything with a `render()`, like a page's content list, and the list is the source of truth that drives the view;
   - items are live: a button on any item writes through the socket;
   - the item tool over the socket (security later);
   - messages may be **references** to items that live elsewhere (sentences, tasks) mixed with **owned** items (cards). Where data actually lives must be unambiguous: no duplicate copies drifting out of sync, no rendering the wrong thing, nothing made twice.
5. **Tasks nested, flat with references, or a hybrid:** weigh each. The owner is **not in love** with the shape in `ai/design-decisions-2026-10-27.md`, so alternatives are wanted. Use fresh agents with little context: "design a session system that includes tasks…".
6. **Chat views:** a bubble chat with inline replies (SMS or Claude-app style) vs a structured card view. That's the v1/v2/v3 difference: `ext/Chat/` (v1), `v2/`, `v3/` (the rough draft, 2026-10-26, a plain view over `session.tasks`).
7. **Consolidate what exists. The map first, moves later:**
   - the chat code is spread over many places;
   - there are maybe 3+ prompt-refinement systems (the map counted 14 mentions);
   - the fast assistant vs smart assistant vs voice agent roles: the owner leans to ONE smart agent, and the others get marked legacy;
   - the plan is "move it in, index it as legacy, extract the value", with moves later and scripted.
8. **requirements.md files:** session folders hold many. Their essence belongs in the module they built (split into sub-docs where it fits). Note where this applies; don't move anything in this project.
9. **The task system's real failure:** this session ended at 56% with 223 open. The goal is a few core tasks per session, created as the owner dictates and actually finished.
   - Give an honest account of the whole path from each origin to done: the VS Code tab, the voice agent, the dictation sheet. Which code makes a task, and who finishes it.
   - Why so many stay undone.
   - Whether node should re-prompt every undone task (the owner: for 200 that's insane, so focus).
10. **Also keep in view (don't build):**
    - token accounting, and resume or fork that never loses context or tasks;
    - per-sentence sending re-reads the whole context, so batch it or auto-compact (later).

## Plan

- **The tab studies the code** enough to judge the seats' answers.
- **Seats, run in parallel, fresh, each writing its own folder** under `seats/<name>/`:
  - A one-page `shape.md`: class pseudocode (extends chain, properties, what each holds).
  - A `notes.md`: pros, cons, the questions it answers.
  - Optional `per-class/<Class>.md` when a class needs more.
  - It sends the tab a short summary.
  - **Independent design seats** get no proposal docs. They're told only the problem, plus the core code to read (`core/Item`, `core/List`, `ext/JSONL`, `core/Session`, `core/Task`): "design a session system with prompts, replies, tasks, questions, cards, child sessions, chat".
  - **Analysis seats** each own one area and read everything relevant:
    - (a) Item/List/Store/JSONL as built: what works, the gaps, swappable store, snapshot vs delta, code-made vs UI-made;
    - (b) the task path from each origin to done, and why tasks stay open;
    - (c) the map of chat, prompt-refinement and voice roles: what to consolidate, what's legacy.
  - Each also checks the owner's design directions (the proposal docs) against its findings.
- **Aggregate:** where several seats agree, that's the signal. Write `synthesis.md`:
  - one pseudocode system map;
  - the options per contested point, with pros and cons;
  - a short list of decisions for the owner.
- **Fences:** seats write only in their own `seats/<name>/`. No code edits, no moves.
- **Budget:** the week is reset Wednesday 2026-10-28 ~21:40; staying near 100% of pace is allowed. Opus for design judgment; Haiku or Sonnet for bulk reading.

## Read first (for analysis seats; NOT for independent design seats)

- `public/framework/ai/readme.md` line 9, then: `design-decisions-2026-10-27.md`, `system-map.md`, `system-proposal.md`, `chat-architectures.md`, `roles-proposal.md`.
- `core/Item/doc/owner-2026-10-21-items-hold-items.md` and `core/Item/doc/next.md`.
- `ext/Chat/readme.md`, `ext/Chat/v2/readme.md`, `ext/Chat/v3/readme.md`.
- `core/Task/readme.md`, `core/Task/doc/prompt.md`, `core/Session/readme.md`.
- The completion work: `ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/completion/`.
