# Socket — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

## What a save does

Three outcomes, decided per path by [`changed()`](/framework/dev/Socket/api/changed/):

- **a file this tab never loaded** — nothing happens. That is the change that
  made parallel agent fan-outs survivable; every tab used to reload on every save.
- **a `.css` this tab loaded as a `<link>`** — the `?t=` on that element is
  bumped and the sheet re-fetches. No navigation, state intact.
- **anything else it loaded** — one `reload()` for the whole batch.

A `.jsonl` never arrives here at all: appends stream as `jsonl` frames and the
page updates in place. [wire](/framework/dev/Socket/doc/wire/) is the protocol.

## Who uses this

| caller | for | page |
|---|---|---|
| `public/app.js` | `socket: Socket.singleton()` — boots the one connection every page shares | every page |
| `ext/Ask/Ask.js` | the dev-only browser→CLI bridge: `available()`, and two RPC calls | [Ask](/framework/ext/Ask/) |
| `ext/Saver/FileSaver.js` | `write()`/`delete()` over `async_rpc`/`rpc`, so a document persists to a real file on localhost | [Saver](/framework/ext/Saver/), [editor](/framework/ext/editor/), [Panel](/framework/ext/Panel/) |
| `ext/DesignTool/audit/twin.js` | queues an accepted layout fix to disk via `async_rpc("write", …)` | [DesignTool audit](/framework/ext/DesignTool/audit/) |
| `ext/JSONL` | patches `jsonl`/`jsonl_reset` onto the prototype and subscribes — the streaming half | [JSONL](/framework/ext/JSONL/) |
| `dev/DevBar/tools.js` | reads `socket.disabled`/`socket.connected` to show a status row — never sends | [DevBar](/framework/dev/DevBar/) |
| `Server/plugins/MCP.js` | the other end: `hello` makes this tab findable, `eval` makes it answerable — that is `mcp__site__pages` / `mcp__site__eval` | `Server/README.md` |

Six callers in `public/`, all through `Socket.singleton()`. **No module reaches for
`new Socket()` directly** — the constructor stays public for a test, but
nothing in `public/` has needed it yet.

## Decisions

**Where does the localhost check live — the call site, or the class?** In the
class — the top of `initialize()`. A call site check means every site that adopts this
writes an environment branch, and every one of them writes it slightly
differently; the day one gets it wrong, production opens a WebSocket to a host
that has no server. Inside, the check runs once and `disabled` short-circuits
`send()` and `request()` at their own front doors so no caller needs a
second guard. **Verdict: in the class**, and it is a constraint rather than a
preference — production is static hosting.

**Reconnect from `error`, from `close`, or both?** A failed connect fires
**both**, in that order. Reconnecting from each turned a stopped dev server into
a connection storm. `close` is the single reconnect path and `error` only logs —
the two listeners in `connect()`. **Verdict: one path.** The rule generalises —
when two events always arrive together, only one of them may act.

**Reject `ready` on disconnect, or leave it pending?** Leave it pending. A
`send()` awaiting `ready` while `node server.js` restarts should *land when the
server is back*, not throw — restarting the server is routine. `reconnect()`
only swaps in a fresh promise when the old one had resolved (the `connected`
check in `reconnect()`),
because replacing a still-pending promise strands everything already awaiting
it on a promise nothing will ever settle. **Verdict: never reject.**

**`singleton()`, not `new Socket()` per caller.** One document wants one
connection; a second instance means a second watcher subscription server-side
and two reloads per save. It is a static rather than a module-level `const` so
importing the module opens nothing — `public/app.js:25` is the edge that
connects. Kept: the constructor is still public, because a test wants to build
one without touching the singleton.

**`assign()`-based, like every class here.** `constructor(...args)` →
`assign(...args)` → `initialize()`. Documented once in the
[code-architecture skill](/framework/); not repeated as a member page.

## Traps

- **⚠ Never reject `.ready`** — see above. A rejected `ready` makes every later
  `send()` throw for the life of the page.
- **⚠ `reload()`, `changed()` and `eval()` are called BY the server**, through
  `message()`'s method lookup. Nothing in `public/` calls any of them, so a grep
  for callers finds none and all three look dead. They are the live path.
- **⚠ The dev server runs arbitrary JS in this tab, by design.** `eval()` is that
  door — a Claude session calls the `mcp__site__eval` tool and gets DOM truth out
  of the running page instead of squinting at a screenshot. Two gates make it
  acceptable and **both** must hold: this socket connects on localhost only
  (above), and `POST /mcp` refuses any peer whose address is not loopback
  (`Server/plugins/MCP.js`, `Server/README.md`). Widening either one hands the
  browser to whatever else can reach this machine.
- **⚠ `eval()` must never throw.** `message()` has no `catch`, so an exception
  escaping the handler kills frame dispatch — reloads included — for the life of
  the page. Every failure path replies `{ error }` instead, and a result that
  `JSON.stringify` refuses (circular, a DOM node) falls back to `String(value)`.
- **⚠ `changed()` leans on one line in `/app.js`.**
  `performance.setResourceTimingBufferSize(100000)` runs before the app is built,
  because the default buffer stops recording at ~250 entries and a single doc page
  loads 339. Delete it and a long-lived tab quietly forgets its own files and
  stops reloading — silently, forever, with a socket that looks perfectly healthy.
- **⚠ The CSS swap mutates the EXISTING `<link>`.** Replacing the element instead
  re-registers its `@layer` names at the end of the cascade, so `site` lands past
  `util` and every override on the site inverts. Nothing throws; the page just
  looks wrong.
- **⚠ `.jsonl` files stream — they never reload.** The server routes them to a
  tailer instead of `changed`, so a page showing a log that does **not** call
  `JSONL.live()` will sit there stale while the file grows. Fetch is still the
  static/production path; `live()` is the explicit opt-in.
- **⚠ Editing `public/index.html` reloads nothing.** The SPA fallback makes the
  navigation url the *route*, so `index.html` is a navigation entry rather than a
  resource entry and never appears in the loaded set. Hard-reload by hand.
- **⚠ The gate is part of static compatibility.** `CLAUDE.md` lists it as a hard
  constraint. Widening it — a query flag, an env token — is a production change
  disguised as a dev convenience.

## Proposed

Findings from the every-member audit. **None applied.**

### 1. `ls`, `rm`, `write`, `cmd` and `log` still have no caller — `async_rpc` and raw `rpc` now do

**Update, 2026-08-15 audit:** this finding's premise was wrong by the time it
was re-read. `server.js` now reads `DevSocket.Socket.use(Runtime);` —
uncommented — and two real features call in: `FileSaver.write()`/`delete()`
(`ext/Saver/FileSaver.js`) and `DesignTool/audit/twin.js`'s `accept()`, both
via `async_rpc`/`rpc` called directly with their own method-name strings.
Neither reaches for the `write()`, `rm()` or `ls()` **wrapper** methods built
for them. Full accounting: [wire](/framework/dev/Socket/doc/wire/).

| | keep | delete |
|---|---|---|
| `send`, `request`, `rpc`, `async_rpc` | `async_rpc`/`rpc` are the two names both real callers actually use | `async_rpc(m, a)` **is** `request({method, args})` — still two names for one call |
| `ls()`, `rm()`, `write()` wrapper methods | — | zero callers each, even now — both real callers spell `rpc("rm", …)` / `async_rpc("write", …)` themselves rather than using them |
| `cmd()` and `log()` | server-callable, like `reload` | still zero callers on either end; both just `console.log` |

*Options:* (a) keep all of it; (b) delete `async_rpc`, `cmd`, `log` and keep
`send`/`request`/`rpc`/`ls`/`rm`/`write`; (c) reduce to `send`/`request`/`rpc`
and let a caller spell its own `rpc("ls", dir)` — which is already what both
real callers do.

*Weighing:* (a) leaves five methods (`ls`, `rm`, `write`, `cmd`, `log`) that
are a claim nothing has ever exercised, real callers included. (c) is the
smallest honest surface, and now has two callers demonstrating it's also the
one people reach for unprompted. (b) keeps three wrappers both real callers
already bypass.

**Recommendation: (c)** — the two live callers already chose this shape
without being asked to. This is stronger than when the finding was first
written, not weaker: a caller existing and still bypassing the wrapper is
better evidence than no caller at all.

### 2. `disabled` is undefined until it is true

`initialize()` sets `this.disabled = true` on the non-localhost branch only, so on localhost the property is `undefined` rather than
`false`. Every read is `if (this.disabled)`, so nothing misbehaves — but
`socket.disabled === false` is never true, which is a surprising answer from the
console.

*Options:* (a) leave it; (b) `this.disabled = false` in the defaults block
beside `connected`.

**Recommendation: (b).** One line, and it makes the property honest to read.

### 3. `promise()` is a deferred, and it is local

The `promise()` helper at the top of `Socket.js` attaches `.resolve`/`.reject`
to a promise. `View`/`App` have their own resolve-later needs (`app.ready`,
`styles_loaded`). *Options:* (a) leave it here — one caller, one file;
(b) move it to `util/`. **Recommendation: (a)** until a second caller exists;
`util/`'s stated bar is *two callers that must agree*, and this is one.
`Promise.withResolvers()` is now baseline and replaces the helper outright —
worth doing the day the browser floor allows it.
