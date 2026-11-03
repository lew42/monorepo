# Build plan — phase 3, as four dispatchable briefs

Each paragraph below is one minion-sized brief, in the order they have to land — the
browser root (2) needs nothing from the Node root (1), but the dashboard brief (3)
needs `describe` to already exist on the Node side, and the retirement brief (4)
needs both live roots proven first.

**1. The Node root registry inside Servex, and the three tools on `/mcp`.** Add
`Servex/objects/Registry.js` (the fixed `{ servex, app: null }` root — `app` stays
absent on the Node side; there is no live `window.app` here) and
`Servex/objects/tools.js` (`list_objects`, `describe`, `call`, built from
`proto/objects.mjs`'s three functions, with its now-fixed `jsdoc()` and the
`__proto__`/`constructor`/`prototype` refusal carried over unchanged), registered
through the exact seam `Servex/agents/tools.js` already uses:
`for (const tool of object_tools(servex)) servex.mcp.tool(tool);` in `Servex.js`'s
`tools()`. Mark `@public` on `Servex/agents/Agents.js`'s `list`, `send`, `interrupt`,
`stop`, `registry_list` and on `Servex.js`'s `list`, `command` — the same methods
`Servex/agents/tools.js` and `Servex.js#tools()` already hand-wrap today. Done when
`call({target:"servex.agents", method:"list"})` over `/mcp` returns the same rows
`GET /agents` does.

**2. The browser root, over `dev/Socket`.** `window.app`'s tree becomes the browser
root registry — a single `{ app }` object `Socket.js` can walk. Add one more
server-called method beside `reload`/`eval`/`hold`: `Socket.prototype.object(envelope,
token)`, mirroring `eval()`'s own shape (reply at answer time, via `rpc("object_result",
token, …)`, never throwing out of `message()`). The JSDoc-from-fetched-source
technique is already proven (`proto/browser.html`, 9.3ms for one small module) — the
one new piece is walking `window.app`'s actual `View` tree (`app.router`, a page's
mounted children, …) instead of a single hand-built `Widget`, and resolving each
node's *defining* module url (a `View` subclass's file, not the instance) so the
fetch has something to fetch. Three more tools on `Server/plugins/MCP.js`, reusing
`pick()`'s existing tab-addressing exactly as `eval` does. Done when `describe`
against a real page's mounted `View` reaches the browser and back over the socket.

**3. The dashboard consuming `describe` for its own UI.** Once (1) is live, Servex's
dashboard gets a page — same shape as the AI board's Agents strip
(`board-from-events`, 2026-09-22) — that calls `list_objects` then `describe` on
each and renders a live, browsable tree of every `@public` method on every
registered root, with its JSDoc summary and parameters shown inline. This replaces
what is today a hand-written line in `Servex/agents/tools.js`'s own top comment
("Ten tools on one door") with something that stays correct as tools are added,
because it reads the same JSDoc the tool doc itself is built from. No new state —
it is a view over (1)'s own registry.

**4. Retire `eval` in favour of `call`, where `call` already covers it.** Once (1)
and (2) have shipped enough `@public` surface to answer what `eval` was actually
being asked for in practice (reading state, driving a named action — not "run this
arbitrary expression I haven't named a method for"), delete
`Server/plugins/MCP.js`'s `eval` tool entry and `Socket.prototype.eval()`. **What
does NOT get deleted:** `pages`/`shot`/`claim`/`release` (not object-shaped — they
are about *which tab*, not *which object*), and every existing REST route on
`Servex.js` (`/api/projects`, `/api/agents`, `/log/:name`, …) — those are purpose-built
product surface with their own callers (the dashboard's own UI, `ux/Dictate`'s CORS
POST), not a debugging door, and the object layer is additive for ad hoc reflection,
never a replacement for a route that already has a shape of its own. The one thing
this brief actually removes is the single most dangerous tool on either MCP door,
replaced by something that can only ever reach what was deliberately marked
reachable.
