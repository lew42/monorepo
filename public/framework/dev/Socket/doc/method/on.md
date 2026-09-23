## Usage

```js
// the socket is the only thing in the browser that hears the file system
const off = app.socket.on("data", path => {
    if (path.endsWith("/directory.json")) reread();
});
```

`on(name, fn)` adds a listener and returns its own unsubscribe. `emit(name, …args)`
is the other half, and it is called from inside this class only.

There are two events today:

| event | argument | fired when |
|---|---|---|
| `data` | the url-path that changed | a file this tab **read** (`fetch`/XHR, and `.json` `.jsonl` `.md` `.txt` `.csv`) changed — see [changed](/framework/dev/Socket/api/changed/) |
| `skipped` | the running count | a reload was refused because this tab is blocked — the dev bar's "3 held" readout, `dev/DevBar/blocked.js` |

## Necessity

`changed()` used to have exactly two answers for a changed file: hot-swap it, or
reload the tab. A file the page had **read** could be neither — nothing in the
DOM points at it, so there is nothing to swap — so it reloaded, and that was 203
of the 215 reloads an AI-board tab took on 2026-09-22
([reload-rethink](/framework/ai/2026-09-22/reload-rethink/)).

Re-reading the file is the whole fix, but only the page knows how to re-read its
own data. So the socket needs a way to *tell* rather than *act*, and a page needs
a way to listen without knowing a websocket exists. That is this pair.

## Why a listener registry and not a window event

`hold()` fires a `dev-hold` window event, and that was the obvious precedent. It
is right there and wrong here: a window event is addressed to the whole document,
so every listener on the page has to filter, and there is no natural unsubscribe.
What a page actually wants to subscribe to is **this socket** — and there is only
ever one of it (`Socket.singleton()`), reachable as `app.socket` from any page.
Six lines of registry, no global namespace spent, and `off()` comes back for free.

## Traps

**⚠ Nothing unsubscribes for you.** A page that subscribes and is then navigated
away from keeps its listener, its closure and everything the closure holds. Guard
on `isConnected` — `ext/AITask/dashboard.js`'s `on_directory()` is the worked
example — or keep the `off()` and call it.

**⚠ Silent off localhost.** There is no socket at all on static hosting
([localhost](/framework/dev/Socket/doc/localhost/)), so `app.socket` is a
disabled instance. Reaching it as `page?.app?.socket?.on(…)` is the shape that
degrades correctly: the subscription simply never happens, and the page still
works from its one initial fetch.

**⚠ `message()` looks methods up on `this`.** Every method on this class is
addressable by name from the server, `on` and `emit` included. The server never
sends those frames, but a method added here is API surface on the wire as well as
in the page — [wire](/framework/dev/Socket/doc/wire/).
