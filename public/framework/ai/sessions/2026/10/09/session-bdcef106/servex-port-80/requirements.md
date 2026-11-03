# servex-port-80

## The ask, verbatim (the owner, 2026-09-23 14:10)

> so, the monorepo dev server shouldn't be a dependency of the servex... let's give servex port 80,
> so we can have *.localhost. servex.localhost, monorepo.localhost.. these read clean, that's what i want.

## What changes

- Servex's reverse proxy listens on **port 80** (was 8080). `servex.localhost` is the dashboard,
  `monorepo.localhost` is this repo's dev server, `wt-<slug>.localhost` a worktree — no port in any of them.
- The monorepo dev server stops owning port 80. It is an ordinary project behind the proxy, on its
  own remembered port, started by Servex the first time someone visits it.
- A bare `localhost` (no name) goes to the monorepo, so every existing `http://localhost/...` link,
  `.mcp.json` and `check.mjs` keep working.
- `Server/plugins/Hosts.js` is deleted — it forwarded names from port 80 to the proxy, and behind
  the proxy it would bounce `monorepo.localhost` back to itself forever.

## Fence

`Servex/` (ReverseProxy, Servex, sustain, readme), `Server/run.js`, `Server/plugins/Hosts.js`,
`Server/worktree-up.mjs`, `%LOCALAPPDATA%/lew42/servex/ports.json` (the `monorepo` entry).
Restarting Servex is part of the job; nothing is in flight under it.
