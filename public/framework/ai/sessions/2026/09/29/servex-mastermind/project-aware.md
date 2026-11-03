# Is Servex project-aware?

**Mostly not yet.** The proxy, the ports and dev-server supervision already work per project. Almost everything else (cards, the assistants, the page AI, worktrees, the task loop) is wired to the monorepo through one `REPO` constant or a `public/framework/ai` path. And today Servex can't even tell which project a request came from: the monorepo's `ServexProxy.js:57` deletes the `host` header before forwarding.

| Area | Per project today? | What's wired to the monorepo |
|---|---|---|
| Project list, ports, proxy, dev servers, their logs | **yes** | only the scan root `C:/Code` (`Servex.js:73`) |
| Health, the monitor, Whisper | machine-wide, which is right | — |
| Usage bars | no | writes `public/framework/ai/usage.json`; it's machine data, so it belongs in Servex's home |
| Cards and card routes | no | `cards/Cards.js:22`, a fixed `public/framework/ai` root |
| Prompt log, dispatcher | no | one global `prompts` log (`Servex.js:132`) |
| Fast assistant, page AI (Layers), global mastermind | no | `cwd: REPO`, monorepo skills and groups files (`Assistant.js:7`, `Layers.js:10`, `Global.js:17`) |
| Agent spawns | partly | follows `cwd` if given, otherwise defaults to Servex's own folder |
| Worktree pool, lifecycle reaper, task loop | no | `Pool.js:40` finds the repo from Servex's own git; `Lifecycle.js` imports `Server/*.mjs` |
| Experts, readme chain, pages | no | `experts.json:10`, `readme-chain.js:29`, `pages.js:8` |
| Socket, `/ask/turn` | per project by construction | they live in each site's own dev server (`Server/plugins/`), not in Servex |

## Decisions

1. **Key everything by the request's Host.** Host → project name (`ReverseProxy.name`, `:91`) → project root (`servex.project(name).dir`). The Servex socket and every voice session take that root, so project A's transcriptions and sessions are saved under A's folder and can never mix with B's. To make this possible, `ServexProxy.js` stops deleting `host` and sets `x-forwarded-host`, and Servex trusts that header only from loopback.
2. **One Servex process hosts every project's agents, for now.** The owner is right: one memory gate, one monitor and one queue see the whole machine, and the fans are a machine problem. Split later only if one project's agents starve another's.
3. **One seam replaces the `REPO` constant:** `servex.project(host).root`, plus a small per-project config (`.servex.json`: where cards live, which skills to use). Cards, assistants, Layers, the pool and the task loop each take a root instead of importing one.

## For a new site to "just start working"

- [ ] It has a `package.json` under `C:/Code` (Servex finds it and gives it `<name>.localhost`).
- [ ] It loads the framework's shell (dictation, the ✦ rail and the drawer come from `/framework/`), or includes the one `<script>` that does.
- [ ] Servex reads its Host and resolves its root (decision 1).
- [ ] Its cards go to `<root>/ai/` (from `.servex.json`, or that default).
- [ ] Its agents spawn with `cwd = <root>`, so the SDK loads that project's own CLAUDE.md and skills. With none, they fall back to the framework's.
- [ ] A worktree pool is created lazily for it, the first time a task asks.
- [ ] A smoke test proves it: dictate a line on `<new>.localhost`, and see it land in that site's session file, not the monorepo's.
