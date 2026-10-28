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

## The owner's add-on (2026-10-28, ~00:35, same tab; the prompt starting "Just something else real quick")

Still design only: nothing built. "We're going to have to work interactively and refine the shape before we pull the trigger."

11. **Page vs Item.** Pages are the essence of the framework. A page is something with a route (dynamic routes included); an item is more like a subpage: it may be saved to a file but has no page of its own. Maybe render file-owning items differently from child items.
    - Should a session **have** a page rather than **be** one? The owner leans to "has". Page adds many methods to Item; stacking APIs in one namespace bloats every subclass.
12. **Page CRUD:** an earlier ask for creating, updating and moving pages may exist somewhere, but it was never tested with confidence. Find it and say whether it works. How are child pages stored (`page.pages`? `children`, which was a pseudo-map, since retired)? Automatic from the file system, or from creating a page inside a page?
13. **What else the item/page system must carry later** (ideas, not builds): user pages and profiles, teams and groups, topic pages with their own chat, channels inside topics (mini Discord communities).
14. **A web editor (Webflow / Figma / hybrid)**: a tree of items and layers, each change streaming to the right spot. Can several pages share one JSONL file? With 50 pages and hundreds of designs each, one file reaches megabytes or more: JSONL's size is a real limit. Mouse-move-rate changes would bloat it fast.
15. **Other stores:** is the Item API compatible with other streaming systems or databases (SQLite, Cloudflare products)? An analysis of the Item API as a store interface.
16. **Items hold items:** each item has, or can get on demand, its own `items` (so it acts as a list). Check whether that is still how it works. How do lists save and re-apply deltas efficiently, and is it tested?
17. **Persistence tests in every known mode:** every class tested standalone in its own file AND nested inside another file. Add to the plan.
18. **How JSONL streaming really flows:** today an agent appends a raw line, a file watcher (the dev server or Servex) notices and pushes it over a socket. The owner doesn't like agents writing log files directly; the alternative is to instantiate the object server-side, but replaying thousands of deltas or megabytes may take seconds.
    - The owner likes JSONL tailing: simple, logged, replayable; every change is history, and an editor could replay one layer's history alone.
    - Compaction makes the owner nervous (done wrong, it destroys data). Performance matters less than safety.
    - Ideas: split scopes into files, e.g. prompts and replies in a session log file and only the core in `session.jsonl`, so server-side instantiation loads the core only (cost may still need the whole).
19. **Priorities named in passing:** streaming working properly; dictation working on the website itself, so the phone app isn't needed.
20. **If there is budget left and nothing else to do:** look into what other data structures the page system could carry.

Seats (d) `pages` and (e) `streaming` (below) take 11–18.

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

## Seats (spawned 2026-10-28 00:28)

Briefs: [seats/design-brief.md](seats/design-brief.md) (blind) and [seats/analysis-brief.md](seats/analysis-brief.md). All six run in the main tree as single workers (the pool had no free worktree; a first `minion-shapes-design-1` got one and was stopped at zero turns so all seats work the same way).

| Seat | Agent | Model | Folder |
|---|---|---|---|
| Blind design 1 | mastermind-shapes-design-1 | Opus | [seats/design-1/](seats/design-1/) |
| Blind design 2 | mastermind-shapes-design-2 | Opus | [seats/design-2/](seats/design-2/) |
| Blind design 3 | mastermind-shapes-design-3 | Opus | [seats/design-3/](seats/design-3/) |
| (a) Item/List/Store/JSONL | mastermind-shapes-items | Opus | [seats/items/](seats/items/) |
| (b) Task path | mastermind-shapes-task-path | Sonnet | [seats/task-path/](seats/task-path/) |
| (c) Consolidation map | mastermind-shapes-consolidation | Sonnet | [seats/consolidation/](seats/consolidation/) |
| (d) Pages (asks 11–14, 20) | mastermind-shapes-pages | Opus | [seats/pages/](seats/pages/) |
| (e) Streaming and stores (asks 14–18) | mastermind-shapes-streaming | Opus | [seats/streaming/](seats/streaming/) |

Ask 16 (items hold items; list delta re-apply) was sent to seat (a) as an addition.

Synthesis: `synthesis.md` (written by the tab once the seats land).

## Read first (for analysis seats; NOT for independent design seats)

- `public/framework/ai/readme.md` line 9, then: `design-decisions-2026-10-27.md`, `system-map.md`, `system-proposal.md`, `chat-architectures.md`, `roles-proposal.md`.
- `core/Item/doc/owner-2026-10-21-items-hold-items.md` and `core/Item/doc/next.md`.
- `ext/Chat/readme.md`, `ext/Chat/v2/readme.md`, `ext/Chat/v3/readme.md`.
- `core/Task/readme.md`, `core/Task/doc/prompt.md`, `core/Session/readme.md`.
- The completion work: `ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/completion/`.
