# Dev toolbar

## The ask, verbatim

> let's make a site-wide right "dev" toolbar. CTRL + \ will activate it, and it
> should use localstorage to remember activation state, it should ahve an X to
> close it
>
> let's go dark UI theme for this one.

## Scope

A persistent right rail of developer chrome, on every page of the site.

- `Ctrl + \` toggles it (works anywhere, including inside inputs — it is chrome).
- The open/closed state persists in `localStorage`, so a reload restores it.
- An `✕` in its header closes it.
- Dark UI regardless of the reader's colour scheme — this is tooling, not content.

## Constraints inherited

- No build step; native ESM; static-safe (no dev-server dependency at runtime).
- It must not fight `ext/layout`'s right drawer, which already owns `--drawer`
  and the same edge.
- The shell should **push**, not cover — the bar is persistent, so a permanent
  overlay would bury content you cannot scroll out from under.

## Proposal (= the steps)

1. Scope: read the shell, `--drawer`, `ext/layout`'s panel, Socket, Router.
2. `DevBar` shell — fixed right rail, header, `✕`, mount once from `app.js`.
3. `Ctrl + \` binding + `localStorage` persistence.
4. Dark palette scoped to the bar (token overrides on its own class).
5. Push the shell without breaking `ext/layout`'s drawer.
6. The tools inside: route, viewport, socket, colour scheme, jump links.
7. `readme.md` + `page.js` + parent link.
8. Verify in the browser at several widths, light and dark.

## Phase 2 (noted, not built)

- Draggable width / resize handle.
- A tool registry other modules can push into (`DevBar.tool(name, fn)`).
- Element inspector — `ext/layout`'s selection already covers most of it.
