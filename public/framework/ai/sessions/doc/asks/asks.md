# Sessions: what the owner asked for, and where it stands

<!-- merged from priorities.md (original kept in archive/) -->
## Sessions: what the owner asked for, most important first

This is the list to follow. Higher means do it first and never break it for something lower. Each line says what was asked, what is decided, and where it lives. The long history is in [decisions](decisions.md).

### 1. Data is never lost, and moves are scripted
- **Asked:** move and rename with a script, never by retyping; do not delete logs or records; git is the undo.
- **Decided:** `Server/session-place.mjs` only renames, runs `--dry` first, is safe to run again, and writes `moves.jsonl` (old path, new path) in the task folder. The one thing it removes is the `files.jsonl` folder listing a dev server wrote into cache folders: noise that is rebuilt on demand.
- **Lives in:** [layout](../data/layout.md).

### 2. One store, one route
- **Asked:** a session is stored once; the same detail view opens however you arrive.
- **Decided:** the dated store, `ai/sessions/YYYY/MM/DD/<id>/`. Every row opens `/framework/ai/sessions/<id>/`. Old shapes still load through `Session.locate`. Every pattern and its count: [patterns](../data/patterns.md).
- **Lives in:** [layout](../data/layout.md), `Session.js`.

### 3. The page tells the truth
- **Asked:** state must be real; names must be useful, never "monorepo"; counts must come from the index, not from loading everything.
- **Decided:** state is worked out on every draw from the live agent list and the transcript clock (`true_state`). A name is the agent's name, else the last real prompt, else the source and id. Counts come from the rows and `session-index.json`.
- **Lives in:** `page.js` (`true_state`, `display_name`), [findings 14](/framework/ai/2026-10-08/session-class/).
- **Still to do:** Servex names every session when it spawns it; the dev server stops writing stale state into `sessions.json`.

### 4. A compact grid you can scan
- **Asked:** state icon first, plan usage as bars with the pace marker (the Dashboard's), no wasted space above the list, an "in flight" filter, sort toggles for recency and cost.
- **Decided:** all of it is built. The bars are `usage_rail` from `ext/AITask/usage.js`, the same component the Dashboard uses. Every column header sorts; the default order is cost weighted by recency; "Updated" sorts newest first.
- **Lives in:** `page.js`, `sessions.css`.

### 5. Children nest under their parent
- **Asked:** a child session is a sub-folder of its parent (`parent/child`), and the grid shows nested rows, collapsed, with the rolled-up cost. Opening a session shows it in the right-hand column, a 50/50 split.
- **Decided and built:** the grid nests rows from `session-tree.json`, collapsed, with the whole tree's cost on the parent row.
- **Not built:** the folder rule. A child can start a day later than its parent, so its date folder and its parent's disagree. Proposal and reason: [findings 14](/framework/ai/2026-10-08/session-class/).

### 6. Everything is linked
- **Asked:** a file that exists but is not linked from the site will never be found.
- **Decided:** this page links to the readme, this list and the docs from its header; the readme links every doc.


---

<!-- merged from redesign-asks-2026-10-09.md (original kept in archive/) -->
## Redesign asks, 2026-10-09

Recorded, not built. The owner (VS Code tab 7efd07d5) said:

- The Sessions page has too much text and no clear visual hierarchy. Much of it could simply disappear.
- A later redesign should fix that: fewer words, one obvious thing to look at first.
- This page is to become THE place for anything happening in real time (what is running, what is stalled, what is costing money).

Until then, new work here should add as little text as it can. The red flags are already small tags, not sentences.


---

<!-- merged from session-as-container-2026-10-08.md (original kept in archive/) -->
## Idea: a session as a container for a whole AI setup (owner, 2026-10-08)

Open design, recorded from dictation. Treat a **session** as a looser, modular container: the model(s), system prompts, roles and configuration for a whole piece of AI work. A session could automatically spawn several agents and set up certain roles and configurations, using Claude or OpenRouter models, so the AI system is configurable at the session level.

Related ask: tools should be defined and organised **per role** in a clear way (how new tools are created, which role gets which tools). Both go to the system-architecture mastermind (`2026-10-08/ai-system-docs`) for study; no build yet.
