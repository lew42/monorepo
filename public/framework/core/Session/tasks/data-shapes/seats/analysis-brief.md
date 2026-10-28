# Analysis seat brief

You are one of three **analysis seats** in the data-shapes project. The project brief is [../requirements.md](../requirements.md): read it first, then its "Read first" list. Three other seats are designing the session system from scratch, blind; your job is the opposite: **report how the real system works today**, verified against the code, with file:line citations, and judge it.

Your seat is named in your first message. Do only its section below.

## (a) `items`: Item, List, Store and JSONL as built

- How `set`, `get`, `apply`, adopt, ids, order, moves, replay and the live tail actually work (`core/Item/Item.js`, `Store.js`, `core/List/List.js`, `ext/JSONL/`), and the tests that prove each.
- What works, what doesn't, and what's missing. The known gaps from `ai/design-decisions-2026-10-27.md` (sibling-unique ids, non-atomic writes, no compaction, the browser can't create a session, `set` of an Item only snapshots): confirm or correct each.
- **A swappable store:** could the same Item write either JSONL deltas or snapshot mode (one whole JSON per change, the owner's older system), and what would the switch be? Is "a delta that assigns the whole object" a workable snapshot line?
- **Code-made vs UI-made items:** what happens today when page code that builds items reruns on load? Where do duplicates come from? Propose the rule.
- **Is a timestamp part of a list delta** today; should it be?

## (b) `task-path`: every way a task is born, and why 223 stayed open

- For each origin (the VS Code tab and its hooks, the voice agent and its fast/smart seats, the dictation sheet, Servex spawns, the prompt-refinement hook `Servex/agents/PromptTasks.js`, which is OFF now), name **the code that creates the task**, the shape it writes, and **who is supposed to finish it**. A table.
- Take session e00f55c9 (`ai/sessions/2026/10/20/session-e00f55c9/session.jsonl`; 509 top-level, 286 done, 223 undone at 56%): use a **node script** (in your scratchpad, not the repo) to count the undone ones by origin, by age, by kind, and by whether any agent ever touched them. Compute; don't estimate.
- **Why so many stay undone**, honestly: too many made, no owner, no close-out, splitter noise, or something else. Back each cause with the count.
- What would make "a few core tasks per session, actually finished" true. Should node re-prompt undone tasks (the owner: for 200 that's insane)? What instead?

## (c) `consolidation`: the map of chat, prompt refinement and voice roles

- **Every place chat code lives** (`ext/Chat/` v1, `v2/`, `v3/`, `ai/AISession`, Servex's session and stream code, any others you find): one line each, what it does, who loads it, live or legacy.
- **Every prompt-refinement system** (the system map counted 14 mentions; at least `ext/Refine`, `Server/refine.mjs`, `Servex/agents/PromptTasks.js`, the voice fast seat): what each does, whether it runs today, what it's worth keeping.
- **The roles:** fast assistant, smart assistant, voice agent, voice mastermind, helper (`Servex/agents/roles.js`, `roles/`, `tiers.js`). The owner leans to ONE smart agent, the rest marked legacy. Map what each does today and what folding them into one would cost.
- **requirements.md essence:** list which session-folder requirements files hold design knowledge that belongs in a module readme or `doc/` (sample the e00f55c9 session folder; don't move anything).
- The output is a **consolidation map**: for each piece, keep / fold into X / mark legacy, with the reason. Moves come later, scripted.

## (d) `pages`: Page vs Item, page CRUD, and what pages must carry later

Asks 11–14 and 20 of [../requirements.md](../requirements.md).

- **Page vs Item today:** `core/Page/` (find its main class), how many lines and methods Page adds over Item, and what a subclass inherits. Should a session **have** a page or **be** one (the owner leans "has")? Weigh both with the namespace-bloat cost counted.
- **Page CRUD audit:** find the earlier create/update/move-pages work (try `node Server/PastWork.mjs page crud`, `ext/Make`, `ext/files`, the Router). Say whether it works, by running its tests or a headless check, not by reading alone. How child pages are stored today (declared `children:`? a list? the file system?), and what they should be.
- **Route vs item:** a page has a route; an item may own a file but has no route. Should views draw a file-owning item differently from an inline child item?
- **What must fit later** (shape only, no build): user pages and profiles, teams and groups, topic pages with their own chat, channels inside topics. Sketch each as classes on Item/List/Page and name what the current base lacks.
- **A web editor (Webflow/Figma-like):** a tree of layers, each change streaming to the right node. Sketch the shape and where it breaks today.

## (e) `streaming`: how JSONL streams, its limits, and other stores

Asks 14–18 of [../requirements.md](../requirements.md).

- **The real flow, end to end:** who appends a line (agents raw, the item tool, the browser store), which process watches the file (the dev server? Servex?), how the change reaches an open tab (socket or SSE, which code), and how `live()` applies it. A diagram in `shape.md`, with file:line for each hop.
- **Limits, measured:** time to replay a session file of today's biggest size and of 10× (generate a synthetic one in your scratchpad), and the file sizes of the largest real `.jsonl` files. When does one file per root stop working (an editor with 50 pages × hundreds of layers; mouse-rate changes)?
- **Splitting scopes:** e.g. prompts and replies in a session log file, the core in `session.jsonl`, so a server-side instance loads only the core. What breaks (cost totals, ordering across files)?
- **Agents writing raw lines vs instantiating server-side:** the trade-off, with the replay cost measured above.
- **Compaction, safely:** how to get snapshot speed without ever deleting history (append-only snapshot lines, archive-not-rewrite). The owner is nervous here; safety beats speed.
- **Other stores:** is the Item/Store API a clean interface that SQLite, Cloudflare (Durable Objects, D1, R2) or another log could sit behind? List the methods a backend must provide.
- **Persistence test matrix (ask 17):** every class that persists (Item, List, Task, Prompt, Question, Session, Page, and any others), tested standalone in its own file AND nested in another file, for add, set, move, remove and replay. Mark which cells have a test today (cite it) and which are missing. Don't write the tests.

## (f) `structures`: what else the Item/Page system should carry (ask 20, with 13 and 14)

Read [../synthesis.md](../synthesis.md) first: it is the agreed shape so far. Then the pages and streaming seats' notes.

- **The catalogue:** the data structures a web framework's pages will want: the editor's layer tree (Webflow/Figma-like), tables, boards, graphs, timelines, forms, a user/profile, a team, a topic with a chat, channels, comments on any item, a document with sections. For each: a class sketch on Item/List (what each property holds), whether it owns a file or lives inline, its id and size profile (lines per hour, lines in a year), and which line shapes it needs.
- **What they share:** the smallest set of base features that serves all of them (the id index, refs, on-demand `items`, the snapshot sidecar, per-file vs per-month rolling). Name what's missing from today's base, citing the seats' findings.
- **The editor in depth:** a page with 300 layers, 50 such pages; one file per page vs one per document; selection, drag and undo as local state vs lines; how one layer's history is read back.
- **Permissions and identity, as a shape only:** who may write which list, once users exist.
- Pick the 3 structures that would prove the base best, in order, and say why.

## What you write (all seats)

In your own folder (`seats/<your-name>/`, your task dir):

- **`shape.md`**, one page: the system as it really is, as pseudocode (classes, what each property holds) or a table for (b) and (c).
- **`notes.md`**: findings with file:line citations, what works, what doesn't, and your recommendation. Check the owner's design directions (the proposal docs) against what you found and say where they hold or break.
- Optional `per-class/<Class>.md`.

Plain sentences, for a new coder. Counts come from scripts (put them in your scratchpad), never from memory.

## Fences

- **Write only in your own folder.** No code edits, no readme edits, no moves. Don't open the other seats' folders.
- Commit your folder by path when done (`git add <your folder>` then `git commit`), and end your turn with a 5–10 line summary of your strongest findings.
