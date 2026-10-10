# Servex dashboard renders docs and demos for Servex and Server modules

**Card:** 2026/09/29/openrouter-brain-a-knowledge-base-that-o (part 2).
**Goal:** the Servex dashboard (Servex/public/, served on localhost / servex.localhost) gets a **Docs** tab. It lists every module under `Servex/` and `Server/` that has a `readme.md` (e.g. Servex/ext/openrouter, Servex/agents, Server/…). Clicking one renders its readme, its `doc/*.md`, and a `demo.js` if one exists, the way the site renders a module's page. Every view has its own URL (`/docs/<path>`), so reload and back land in the same place.

## Steps (smallest first)
1. A read-only route in Servex (see Servex/pages.js and Servex.js) that serves the module list and raw markdown, from those two roots only (no `..`, no other paths).
2. The tab: a list on the left, rendered markdown on the right. Reuse the site's markdown renderer if it's importable as-is from `monorepo.localhost`; don't add a dependency.
3. Demos: only for a module that ships `demo.js`. Leave that to one example.

Note: most projects in Servex's list don't use Server/ or use an old copy. This tab covers only this repo's Servex/ and Server/.
Needs a Servex restart to go live: `node Servex/sustain.mjs --restart`, only when few agents are working. Do not stop other agents.
Land: a screenshot of the tab showing Servex/ext/openrouter, and the card report. Model: Sonnet, medium. Fence: Servex/public/**, Servex/pages.js, the route lines in Servex.js.

