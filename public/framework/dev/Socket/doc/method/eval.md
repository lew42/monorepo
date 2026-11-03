## Usage

**Zero callers in `public/`** — like `reload()` and `changed()`, it is invoked
by name from the server through `message()`'s method lookup.
`Server/plugins/SocketServer/Tab.js` sends the frame on behalf of the MCP
`eval` tool, and the reply travels back as its own frame:

```json
{ "method": "eval", "args": ["document.title", "<token>"] }
{ "method": "eval_result", "args": ["<token>", { "value": "\"Page\"" }] }
```

The server correlates by token with a 10s timeout — [wire](/framework/dev/Socket/doc/wire/)
documents both directions and the correlation.

## Necessity

This is how a Claude session reads **DOM truth from a real tab** — the state a
fresh headless browser can never see: a panel you dragged open, a store you
edited, the page as it actually is. `shot` photographs a reloaded copy; `eval`
asks the living one.

Indirect eval (`(0, eval)(code)`) runs in global scope, so expressions read the
page's real globals. The result is `Promise.resolve()`d — an `await`-shaped
expression works — then JSON-serialized, falling back to `String(value)` for
circular structures (`window` → `[object Window]`). A thrown or rejected
evaluation settles the token as `{ error }`, never as silence.

It re-announces `hello` with the current pathname first: an SPA navigation
changes the route without a new socket, so the server's idea of where this tab
lives self-heals on every call.

## Traps

**⚠ It evaluates arbitrary code from the server BY DESIGN.** The security model
is two gates that must both hold: the socket only ever connects on localhost
(the hard constraint in `initialize()`), and the server's `/mcp` endpoint
refuses every non-loopback request. Weaken either and any page on your network
can run code in your tabs. See the readme's traps.

**⚠ It must never throw out of the handler.** `message()` has no catch — one
bad expression would take down every later frame on the socket. Both the
synchronous throw and the rejected promise settle the token instead. Keep that
property when editing.

**⚠ A never-settling promise is the server's problem, not this method's.** The
tab keeps no timer; `Tab.js` answers the MCP caller "the tab did not answer in
10s" and the tab stays usable.
