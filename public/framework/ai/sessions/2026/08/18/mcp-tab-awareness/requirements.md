# MCP tab awareness — report visibility per eval, and own the claim verb

## The ask, verbatim

> when mcp -> server -> socket -> browser eval(), why can't the client just say:
>
> `response.visibilityState = document.visibilityState;`
>
> we report back the CURRENT visibility state (one moment, it might be visible, the
> next, hidden, and the AI gets feedback per MCP request)
>
> the eval works, even if the tab is hidden, no? or does hidden tab just sleep entirely?

And earlier, on the deleted skill:

> what happened to the "claim" skill? i thought we had one, but it seems to have been
> removed? this is the dev/Claim module, via MCP. it should probably be defined as part
> of the MCP tool?

## What is true

A hidden tab does **not** sleep. The event loop runs, the socket delivers, `eval`
executes, promises settle, `setTimeout` fires (throttled to ~1s). Only the *rendering
steps* stop: no `requestAnimationFrame`, no `ResizeObserver`/`IntersectionObserver`,
no paint.

So a geometry read is still a **forced synchronous reflow** and is accurate for the
current DOM. The failure mode is narrower than previously written down: it is the
page's **own frame-loop code** that never runs, so the DOM never changes.

- CSS-driven sizing (media/container queries, flex, grid, explicit widths) — measures true.
- Sizing applied inside a rAF or ResizeObserver callback — silently stale.

That is what cost half an hour on `styles/layouts/space/`: five screens all read 4184px
because the generator's resize never ran, not because the browser froze the numbers.

## Why this belongs in MCP, not a skill

Visibility is **time-varying** — a tab is foreground when you spawn and claim it, and
hidden the moment the owner clicks away, which is the normal workflow. A static warning
in a doc is a guess about a value that changes mid-session; a per-call report is a
measurement. And `dev/Claim/` has exactly one caller — `mcp__site__eval` — so the verb
belongs beside the tools, delivered by the server's `instructions` to every session that
actually has them.

`.claude/skills/claim-tab/SKILL.md` was deleted in `e92692c` (2026-08-18 15:20) during the
skills reorg; its content survives as one bullet in `.claude/skills/layout/caveats.md:12`,
which only a layout task ever loads.

## Scope

- `public/framework/dev/Socket/Socket.js` — attach tab state inside `reply`, at answer time.
- `Server/plugins/SocketServer/Tab.js` — pass the extra fields through `settle`.
- `Server/plugins/MCP.js` — render the status line; add `claim` / `release` tools; one clause
  each on `instructions` and `eval`'s description.
- `public/framework/dev/Claim/` — repoint readme + page.js at the MCP tools; clear the five
  dead `claim-tab` references.

## Out of scope

- CDP / Playwright MCP adoption. Written up as a comparison only, no code.
- Changing what `shot` does.

## Verify

Restart the dev server, reload a tab, then `eval` it twice — once foreground, once after
clicking away — and confirm the reported `visibility` flips.
