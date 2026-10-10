# object-layer — one envelope `{target, method, args}` everywhere, designed now, built later

Minion: Sonnet, effort high. Session id `54ebf7f2-4a93-4907-895c-a97c36b16389`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then section **I** of
[`../mastermind-servex/requirements.md`](../mastermind-servex/requirements.md) — the owner's
words: "One RPC envelope {target, method, args} used everywhere: Servex ↔ dashboard, dev server
↔ browser, and three generic MCP tools (list_objects, describe, call) that reach any live object —
window.app in a browser via the dev server's socket, or Node-side objects directly. JSDoc becomes
the tool documentation." **Design now, build later** — this is a paper task with one throwaway
prototype in your task dir; nothing under `Servex/` or `Server/` changes.

## What exists — the three wires the envelope must fit

- **Dev server ↔ browser:** `public/framework/dev/Socket/Socket.js` (the one WebSocket a page
  holds; `rpc`, `async_rpc`, server-called methods `reload/changed/eval/hold`) and
  `Server/plugins/SocketServer/` (`socket.rpc(method, ...args)`, `Append.js` as one RPC
  example) — the MCP `eval` tool on the dev server (`Server/plugins/MCP.js`) already runs code
  in a tab through it.
- **Servex ↔ dashboard:** REST routes in `Servex/Servex.js` (`/api/projects`, `/api/agents`,
  `/log/<name>`) and SSE in `Servex/Stream.js`; the MCP door `Servex/MCP.js` with eleven tools.
- **Objects that would be targets:** `servex` (projects, processes, log, agents, assistant),
  `window.app` in a page (`public/app.js`; a `View` tree), an agent (`Servex/agents/Agents.js`).

## Deliverables — one page and one prototype

1. **`ai/2026-09-22/object-layer/page.js`** — level 1: the envelope in one code block, one
   diagram of the three wires with the same envelope on each, and the three tools with one
   example call each (`list_objects` → `["servex", "servex.agents", "app", "app.router"]`;
   `describe("servex.agents")` → methods with their JSDoc one-liners and parameter names;
   `call({target: "servex.agents", method: "list", args: []})`). One click down:
2. **`doc/envelope.md`** — the exact shape (request, reply, error, streaming reply for a
   method that yields), how a `target` path resolves (dotted path from a root registry;
   what is exposed — only what JSDoc marks `@public`? everything enumerable? decide, say why,
   name the alternative), how it rides each wire (WebSocket frame, HTTP POST, MCP tool), and
   how JSDoc becomes the tool doc (which tags; how the browser side gets them without a build
   step — the source is served as-is, so the prototype must parse `/** … */` from the
   function's own `toString()` or from the fetched source text; pick one and measure it).
3. **`doc/security.md`** — `call` on a live server is `eval` with a nicer name. Say what stays
   loopback-only, what a target registry refuses, and the one rule the owner must keep in
   mind (the dev-server RCE that was closed 2026-09-19 is in `ai/2026-09-19/`).
4. **The prototype — `proto/objects.mjs`** in your task dir: ~120 lines of Node that takes a
   root registry (`{servex: <a fake with two JSDoc'd methods>, app: {...}}`), implements
   `list_objects`, `describe`, `call` over it with JSDoc parsed from source, and runs six
   assertions (`node proto/objects.mjs` prints six PASS lines). Plus `proto/browser.html`
   loaded headless on your private port **8096** (`PORT=8096 node server.js`; kill by PID)
   proving `describe` works on a `View` subclass's methods in the browser from its own source
   text — one screenshot into `shots/`.
5. **`doc/build-plan.md`** — the phase-3 build as four dispatchable briefs, each one paragraph:
   the Node root registry inside Servex (and the three tools on its `/mcp`), the browser root
   over `dev/Socket`, the dashboard consuming `describe` for its own UI, and the eval tool
   retired in favour of `call`. Say what is deleted when it lands (`eval`? the REST routes?).

## Fence

Your task dir and `ai/2026-09-22/page.js` `children:`. Nothing else. Append-only to `.jsonl`.

## Length

Page: one screen above the fold. Each doc ≤ 1 screen. Landing report: six sentences, the six
PASS lines summarised, the describe-in-browser number (ms).
