# Claim — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Nothing imports it. It is loaded by `Server/plugins/MCP.js`'s `claim` and `release`
tools, through an `eval` — so it costs a visitor zero bytes and needs no localhost
guard of its own (the socket that reaches it already has one, LAW#6).

It was a `claim-tab` skill until 2026-08-18, and the verb moved into the tools on the
argument that a skill is a file a session must already know to read, while the MCP
`instructions` reach every session that has the tools — which is exactly the set of
sessions that can claim anything. `ai/2026-08-18/mcp-tab-awareness/`.

## Why a module and not a paste

The overlay could be a string of CSS inside the skill. It is a module because
**four sessions run in this repo at once** and the ring is the only thing that
says which window belongs to which — a thing several callers rely on is a thing
that gets a page, a record and a name (RULE#13). Pasted CSS also loses the two
findings below on the first rewrite.

## A claim has to survive a reload

The first version did not, and it was unusable for the case it was built for:
an agent editing files under `public/` **reloads its own claimed tab every few
seconds**, and the ring lasted until the next save. So a claim is `sessionStorage`
(per tab, which is exactly a claim's scope) and `reclaim()` reinstates it on boot.

The boot hook is **`DevBar.js`**, two lines, because that is the one dev-tier
module already called on every page — and a claim is dev chrome by the same
argument the rail is. It costs a visitor `claim.css` and nothing else.

⚠ That import is why `claim.js` reads `View` from `core/View/View.js` and **not
from `/app.js`**: `app.js` imports DevBar, so a `/app.js` import here closes the
circle, and a circular partner reads an uninitialized binding — the failure that
only shows up on a deep reload.

## Two findings, both silent

- **A ring on `body` paints nothing.** `--prim` is declared on `.theme-lew42`,
  which is `.app`'s class, so one level out every token is unset — a 6px border
  of `currentColor` on white. `claim()` appends inside `.app`, and the Router
  only ever empties `.pages`, so it survives navigation anyway.
- **Every route change rewrites `document.title`**, which wipes the mark a
  second after it lands. Hence the `MutationObserver` on the `<title>` node
  rather than one assignment. A full reload drops the module with it — reclaim.

## Open

- **Nothing releases on its own.** A session that dies mid-task leaves a ring on
  a tab nobody is driving. A heartbeat (the socket knows when its Claude went
  away) would fix it, and is more machinery than the problem has earned so far.
- **The label is a string, not a link.** The ring is `pointer-events: none` by
  necessity, so the task slug it shows cannot be clicked through to
  `/framework/ai/<date>/<slug>/`. A clickable tag would have to opt back into
  pointer events for one small box.
