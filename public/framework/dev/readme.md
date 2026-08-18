# Dev — the local-only tier: live reload, the DevBar rail, tab claims. For whoever runs `node server.js`.

## Use

```js /app.js
socket: Socket.singleton(),   // once, unconditional — inert off localhost
```

Save a file under `public/`; every tab that loaded it reloads. That is the whole tier.

## Watch out

- The one rule: dev-only, connects on localhost only, nothing here may ship behaviour to production (LAW#2, LAW#6). The check lives inside `Socket`, never at a call site: [Socket/doc/localhost.md](./Socket/doc/localhost.md)
- Windows: `pkill -f "node server.js"` matches nothing and the orphan pins a core — `taskkill //F //PID <pid>`: [doc/decisions.md](./doc/decisions.md)
- `claim.js` must not import `/app.js` — it closes a circle that only breaks on a deep reload: [doc/decisions.md](./doc/decisions.md)
- A tab reloads only for files it loaded; a stale tab is usually a file it never touched, not a bug: [doc/decisions.md](./doc/decisions.md)

## More

- [Overview](/framework/dev/) · [doc/decisions.md](./doc/decisions.md) — the boundary rules (dev may import ext, core may not), cross-module traps, the open DesignTool question
- [Socket](/framework/dev/Socket/) — reload + RPC bridge · [DevBar](/framework/dev/DevBar/) — `Ctrl + \` rail · [Claim](/framework/dev/Claim/) — agent's tab ring
- Files that matter: `Socket/Socket.js` (localhost check, RPC), `DevBar/DevBar.js` (tier's one mount), `Server/` (Node half, dev-only)
