# Sessions: what the owner asked for, most important first

This is the list to follow. Higher means do it first and never break it for something lower. Each line says what was asked, what is decided, and where it lives. The long history is in [decisions](/framework/ai/sessions/doc/decisions/).

## 1. Data is never lost, and moves are scripted
- **Asked:** move and rename with a script, never by retyping; do not delete logs or records; git is the undo.
- **Decided:** `Server/session-place.mjs` only renames, runs `--dry` first, is safe to run again, and writes `moves.jsonl` (old path, new path) in the task folder. The one thing it removes is the `files.jsonl` folder listing a dev server wrote into cache folders: noise that is rebuilt on demand.
- **Lives in:** [layout](/framework/ai/sessions/doc/layout/).

## 2. One store, one route
- **Asked:** a session is stored once; the same detail view opens however you arrive.
- **Decided:** the date tree, `ai/YYYY/MM/DD/session-<id8>/`. Every row opens `/framework/ai/sessions/<id>/`. Old shapes still load through `Session.locate`.
- **Lives in:** [layout](/framework/ai/sessions/doc/layout/), `Session.js`.

## 3. The page tells the truth
- **Asked:** state must be real; names must be useful, never "monorepo"; counts must come from the index, not from loading everything.
- **Decided:** state is worked out on every draw from the live agent list and the transcript clock (`true_state`). A name is the agent's name, else the last real prompt, else the source and id. Counts come from the rows and `session-index.json`.
- **Lives in:** `page.js` (`true_state`, `display_name`), [findings 14](/framework/ai/2026-10-08/session-class/).
- **Still to do:** Servex names every session when it spawns it; the dev server stops writing stale state into `sessions.json`.

## 4. A compact grid you can scan
- **Asked:** state icon first, plan usage as bars with the pace marker (the Dashboard's), no wasted space above the list, an "in flight" filter, sort toggles for recency and cost.
- **Decided:** all of it is built. The bars are `usage_rail` from `ext/AITask/usage.js`, the same component the Dashboard uses. Every column header sorts; the default order is cost weighted by recency; "Updated" sorts newest first.
- **Lives in:** `page.js`, `sessions.css`.

## 5. Children nest under their parent
- **Asked:** a child session is a sub-folder of its parent (`parent/child`), and the grid shows nested rows, collapsed, with the rolled-up cost.
- **Decided and built:** the grid nests rows from `session-tree.json`, collapsed, with the whole tree's cost on the parent row.
- **Not built:** the folder rule. A child can start a day later than its parent, so its date folder and its parent's disagree. Proposal and reason: [findings 14](/framework/ai/2026-10-08/session-class/).

## 6. Everything is linked
- **Asked:** a file that exists but is not linked from the site will never be found.
- **Decided:** this page links to the readme, this list and the docs from its header; the readme links every doc.
