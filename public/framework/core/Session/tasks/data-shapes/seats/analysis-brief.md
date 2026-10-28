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

## What you write (all seats)

In your own folder (`seats/<your-name>/`, your task dir):

- **`shape.md`**, one page: the system as it really is, as pseudocode (classes, what each property holds) or a table for (b) and (c).
- **`notes.md`**: findings with file:line citations, what works, what doesn't, and your recommendation. Check the owner's design directions (the proposal docs) against what you found and say where they hold or break.
- Optional `per-class/<Class>.md`.

Plain sentences, for a new coder. Counts come from scripts (put them in your scratchpad), never from memory.

## Fences

- **Write only in your own folder.** No code edits, no readme edits, no moves. Don't open the other seats' folders.
- Commit your folder by path when done (`git add <your folder>` then `git commit`), and end your turn with a 5–10 line summary of your strongest findings.
