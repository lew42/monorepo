# System tab: what is here, and what is not

The AI page's **System** tab. Today this folder holds one thing:

- [`models/`](models/) — `now.json`, which agent runs on which model (computed by `node Server/ModelsNow.mjs --write` from roles, the live registry and spend). It answers *which model for which job*; it does not map the AI systems.

The map of the AI systems lives elsewhere: [`../systems-map.md`](../systems-map.md) (where each system lives and how fresh its readme is), [`../readme.md`](../readme.md) ("Every system, one line each"), [`../doc/readme.md`](../doc/readme.md) (all docs by subsystem) and [`../concepts.js`](../concepts.js) / [`../AIOverview.js`](../AIOverview.js) (the System tab's text).

Open: the tab has no page for Servex agents, sessions or the page system. Until it does, the readme index above is the map.

## Notes from your asks

- Docs are written for an AI reader first, and the owner views the same docs through the System tab or the readme index. ([your words](/framework/ai/sessions/730e8a7b-4cbf-4d09-90bd-d61d2bf9384a/?tab=coverage#p728), 2026-10-13)
