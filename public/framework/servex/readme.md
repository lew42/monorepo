# Servex

The always-on process on this machine (port 80). It runs the Claude agents, starts the dev servers, and owns every log file. It is not the dev server: this site's `Server/` only reloads pages, while Servex runs everything around it.

- **Agents & roles** — who the agents are and how each is set up: [roles](/framework/servex/doc/roles/)
- Start it with `node Servex/sustain.mjs`; the detail is in `Servex/readme.md` and `Servex/agents/readme.md`.
- **Read the real source** — the [FS tab](/framework/servex/fs/) browses `Servex/` and `Server/` themselves, dev server only (`Server/plugins/DevSource.js`). Everything else on the site reads `/directory.json` (`public/` only); these two folders sit outside it, so they get their own small route instead.
