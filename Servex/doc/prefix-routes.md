# Per-project prefix routes (a second process behind one name)

`monorepo.localhost` is one name, but two processes answer it: the dev server for everything, and the Cloudflare Worker (`wrangler dev`) for `/api/*`. The proxy picks by path, so the browser sees one origin and the Worker sees the host `monorepo.localhost`.

## The config: a project's own `package.json`

```json
"servex": { "routes": [ { "prefix": "/api", "service": "api", "start": ["node", "worker/scripts/serve.mjs"] } ] }
```

- `prefix`: a path segment. `/api` takes `/api`, `/api/x` and `/api?x=1`, never `/apix`. HTTP and WebSocket upgrades both follow it.
- `service`: the second process is named `<project>-<service>` (`monorepo-api`). It gets its own port from [PortRegistry](../PortRegistry.js) like any project, and shows in the dashboard, `list_servers`, `stop_server`, `restart_server` and `server_logs` like any project.
- `start`: the command, run from the project's directory (`node` means Servex's own node). Servex sets `PORT`; the service must bind loopback only.

Any project can list routes; nothing is specific to the monorepo.

## How it works

1. `Servex.add()` reads a scanned project's `routes` (`Project.routes`) and calls `Servex.serve()`: it adds a `Project` for the service (`launch` = `start`, `of` = the project) and puts `{prefix, name}` into `Servex.prefixes[project]`.
2. `ReverseProxy.name(req)` returns the service name when the request path is under one of the Host project's prefixes, else the project name. Ports, the knock before a `POST` or an upgrade, autostart (`missing`), the Starting page and the `seen` cache all key on that name, so the service starts on demand exactly like a project does.
3. The proxy never rewrites the `Host` header or the path, so the Worker sees `monorepo.localhost` and `/api/...`.

Routes apply to projects Servex scans from its root, not to a worktree's own dev server (a worktree answers `<worktree>.localhost` with the dev server only; it has no `/api`).

## Starting

The first request starts the service. wrangler takes about 15 s to boot, so a page navigation gets the self-reloading "Starting monorepo-api…" page; a `POST`, a `fetch` or an upgrade waits up to the proxy's `wait` (15 s) on the port and then gets `503` with `Retry-After`. `serve.mjs` applies the D1 migrations and `seed/dev.sql` first, which is most of that time.

## Why `/api` moved off the dev server

`/api/folder-names` and `/api/index` are now `/dev/folder-names` and `/dev/page-index` ([Server/plugins/FolderNames.js](../../Server/plugins/FolderNames.js), [PageIndex.js](../../Server/plugins/PageIndex.js)). Once `/api/*` belongs to the Worker, the Worker would answer those with its 404 JSON, and `core/Router/listing.js` would silently treat the folder as missing.

Test: [ReverseProxy.test.mjs](../ReverseProxy.test.mjs). The Worker side: [worker/readme.md](../../worker/readme.md#run-it-locally).
