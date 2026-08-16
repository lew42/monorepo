What the rail shows, in order, one array per tab:

```js
export const tabs = [
    ["page",   [viewport, route, server, xray, jump]],
    ["layout", [layout]],
    ["ai",     [ask]],
];
```

`devbar.refresh()` walks the open tab's array and calls each with `app`. Each
function renders itself into whatever the captor is at the time — none of them
return anything the caller uses.

Two of the seven live in their own file — `ask.js` and `layout.js` — because
they are big enough to have a design of their own. The other five are here.

## `layout` is alone on a tab, and that is the point

A section that is not rendered does not run. `layout` is the one that reads every
rect on the page — and imports ~45KB to do it — so putting it behind a tab is
not tidiness, it is the gate on doing that work at all. Before tabs it ran on
every navigation of every session with the rail open. (What the tab does *not*
save is the download on this site: see
[measuring](/framework/dev/DevBar/docs/measuring/).)

## Deliberately not a registry

`tabs` is a plain array, edited by hand. A `DevBar.tool(name, fn)`
registration API would let other modules push content in from a distance —
exactly the black magic `CLAUDE.md` names as the thing this codebase avoids.
Adding a section costs one function and one array entry, both in this file,
both visible in one diff.

## `route()` reads the active page, not the address bar

```js
const page = app?.router?.active;
```

`Router.go()` loads the next page before it pushes history, so during
`navigated()` — when `refresh()` runs — `location.pathname` is one hop behind
where the app actually is. `app.router.active` is the page that's really
showing.

## `sizes()` is the one function with real logic; see [sizing](/framework/dev/DevBar/docs/sizing/)

The four-preset math, the disabled-when-unreachable state, and why the lit
button reads `settings.width` rather than a live measurement are covered
there in full — this file is the caller.

## `viewport()`'s `em` row is the one number worth reading twice

```js
row("em", `${(innerWidth / px).toFixed(1)}em`);
```

Every breakpoint, measure and column token across this site's layouts is
written in `em`, off the body's clamped font size — not `px`. This row is
the only place in the framework's own UI that shows a reader what window
size they're actually looking at, in the unit the layouts are written in.

## Improvements

1. **`server()`'s live update (`socket.ready.then(...)`) only fires once,
   the first time the section renders while the socket is still
   connecting.** A later disconnect-then-reconnect doesn't re-arm it —
   correct today because reconnecting reloads the page (see
   `dev/Socket/docs/backoff.md`), but the function doesn't say that's why
   it's safe to leave alone. *(simple, useful — one comment.)*
2. **`LINKS` and `SIZES` are both hardcoded at the top of the file.** Fine at
   five and four entries; worth a second look only if this list starts
   growing per-project rather than framework-wide. *(simple, speculative.)*
