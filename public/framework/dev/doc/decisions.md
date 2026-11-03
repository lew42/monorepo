# Dev — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

## What belongs here, and the rule that decides

**Nothing under `dev/` may become a required runtime dependency of the deployed
static site** (LAW#2, LAW#6). The check lives *inside the class*, not at each
call site — `Socket.initialize()` runs the localhost test once and `disabled`
short-circuits `send()`/`request()` at their own front doors, so nothing that
uses the socket needs its own `if (dev)` branch (`Socket` readme, "Where does
the localhost check live"). `Server/` is the same constraint from the other
side: `express` + `chokidar` + `ws`, all dev-only, serving `public/` as-is and
pushing a reload over the socket — never imported by browser code, and
production is plain static hosting with no server at all.

**Dev is allowed to depend on `ext/`; core is not.** `DevBar` pulls in
`ext/Ask`, `ext/JSONL` and `ext/DesignTool` (`tools.js`, `ask.js`, `layout.js`)
— never the other way. That's not a violation of anything: the "core never
imports ext" law is about the substrate every page needs, and dev-tier chrome
is neither. The traffic runs both directions across this particular boundary —
`ext/Ask`, `ext/Saver/FileSaver`, `ext/DesignTool/audit/twin.js` and `ext/JSONL`
all reach back into `dev/Socket` for the RPC bridge (`Socket` readme, "Who uses
this"). An ext importing `Socket` is safe precisely because `Socket` is what
makes itself inert off localhost — the ext doesn't have to know or care.

**`DevBar.js` is the one mount point for the whole tier.** `public/app.js`
calls it twice (`render()`, `navigated()`) and nothing else in the framework
imports it. `Claim` doesn't reach the page through its own import edge — it's
loaded by `Server/plugins/MCP.js`'s `claim` tool, through an `eval`, and
*reinstated* on every boot through a two-line hook inside `DevBar.js`, on the
argument that a claim is dev chrome by the same reasoning the rail itself is.

## Traps that cross modules

- **⚠ Windows: `pkill -f "node server.js"` silently matches nothing.** The
  orphan then busy-loops libuv on a dead console handle and pins a full CPU
  core. Capture the PID and `taskkill //F //PID $PID`, or `Stop-Process -Id
  <pid> -Force` from PowerShell.
- **⚠ `claim.js` imports `View` from `core/View/View.js` directly, never from
  `/app.js`.** `/app.js` imports `DevBar`, and `DevBar`'s boot hook imports
  `Claim` — so a `/app.js` import inside `claim.js` would close a circle, the
  same mutual-import trap that only breaks on a deep reload.
- **⚠ A save this tab never loaded triggers nothing; anything else it loaded
  triggers a full reload.** `Socket.changed()` is what makes a parallel agent
  fan-out survivable rather than a shared tab reloading on every unrelated
  save — worth knowing before assuming a stale tab is a bug rather than a file
  it never touched.

## Open

- **Whether `ext/DesignTool` belongs here instead of under `ext/`.** 26 files
  of browser measurement tooling, sitting under a directory CLAUDE.md defines
  as *opt-in addons the site imports* — raised in the 2026-08-16 documentation
  audit (`/framework/audit/overview/priorities/`), the owner's call, not decided.
