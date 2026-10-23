# Servex

The always-on process on this machine (port 80). It runs the Claude agents, starts the dev servers, and owns every log file. It is not the dev server: this site's `Server/` only reloads pages, while Servex runs everything around it.

- **Agents & roles** — who the agents are and how each is set up: [roles](/framework/servex/doc/roles/)
- Start it with `node Servex/sustain.mjs`; the detail is in `Servex/readme.md` and `Servex/agents/readme.md`.
- **Read the real source** — the [FS tab](/framework/servex/fs/) browses `Servex/` and `Server/` themselves, dev server only (`Server/plugins/DevSource.js`). Everything else on the site reads `/directory.json` (`public/` only); these two folders sit outside it, so they get their own small route instead.

## Also here (readme audit, 2026-10-13)
- [lifecycle](./lifecycle/) — Lifecycle — how much is left running

## Notes from your asks

- Worktrees sit in a workspace folder beside the monorepo, never inside it, so the repo folder holds only the repo. ([your words](/framework/ai/sessions/730e8a7b-4cbf-4d09-90bd-d61d2bf9384a/?tab=coverage#p34), 2026-10-13)
- Passwords and API keys stay out of the repo, and a local secret such as the push key lives in a git-ignored file. ([your words](/framework/ai/sessions/730e8a7b-4cbf-4d09-90bd-d61d2bf9384a/?tab=coverage#p34), 2026-10-13)
- Agents keep working through the tasks already in progress without waiting to be told. ([your words](/framework/ai/sessions/f155ecbd-2911-4f55-bc4c-c1cf9d7b7026/?tab=coverage#p6258), 2026-10-14)
