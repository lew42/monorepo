# Socket notes

## DATA path constant
Paths this tab reads as DATA rather than RUNS. A change to one of these is new CONTENT, not new code — the program in the browser is byte-for-byte the same afterwards, so re-reading the file is the whole fix and a reload costs the reader their scroll position for nothing. Measured 2026-09-22: 203 of the 215 reloads an /framework/ai/ tab took that day were `directory.json` being rebuilt because an agent created a file somewhere. Extension AND initiator both have to say "data" — `ext/files` FETCHES a `.js` to show its source, and that same `.js` is a live module that really does need a reload.

## Per-tab pause switch and reload state
The per-tab pause switch is restored before anything can reload this tab. `window.$BLOCKRELOAD` used to be the whole of it, which meant the switch was forgotten by the very first reload it failed to stop. sessionStorage is exactly right here: it survives the reload and dies with the tab. The checkbox and its "n held" count are in dev/DevBar/blocked.js. Put the reader back where they were, if the last thing this tab did was reload.

## Tab identification
A stable name for THIS tab, minted once. Two tabs on one page are otherwise indistinguishable, so `path` cannot address one of them — every `hello` carries this instead, and MCP's tools take it as `tab`. sessionStorage: it survives the reload (constant here) and dies with the tab, which is exactly a tab's lifetime.

## First connection and reconnection logic
Only once this tab has ever really connected — the very first attempt, before the server has even finished starting on a cold load, is not a restart and should not say it is one. Never reject `.ready` — a pending promise parks send()s until we are back, and restarting `node server.js` is routine.

## THE HOLD STRIP
THE HOLD STRIP (2026-10-01, page-holds) — the owner's words: a restart blanked the page; it should hold and reconnect, never go white. Nothing in this file ever reloads on a close (reconnect() above only retries — search this file for `reload()` and every caller is changed()/a stale pill click, never the socket lifecycle), so the page was never actually going blank FROM the disconnect itself. What was missing is this: zero sign that anything is happening, so a few hundred ms of silence during the supervisor's boot-tested swap (Server/doc/watch.md) reads as "it died" instead of "it's coming back." This shows one small, fixed, un-clickable line the moment a reconnect is scheduled and removes it the instant `open()` succeeds — it never reloads or blocks anything itself.

## inject_style deduplication
(show_reconnecting() is gone: dev/Socket/Link.js draws the connection banner.) Used by mark_stale(): both are a fixed, un-asked-for notice over whatever is already on screen, and both need their one `<style>` rule in the DOM exactly once no matter how many times they fire. `marker` becomes a `data-<marker>` attribute so a second call is a no-op instead of a second `<style>` tag.

## Socket as file system listener
The socket is the only thing in the browser that hears the file system, so this is how a page hears it too: `socket.on("data", path => …)`. Returns its own unsubscribe. A plain registry rather than window events, because what a page wants to subscribe to is THIS socket, and there is only ever one.

## Reload skip tracking
A reload this tab refused. The count matters as much as the refusal: a switch that silently swallows reloads reads as "the dev server has stopped working" ten minutes later, and the reader has no way to tell the two apart. The dev bar shows it and clicking it takes them all at once — dev/DevBar/blocked.js.

## hold() wire shape
Called BY the server, like reload() — Server/plugins/SocketServer/LiveReload.js broadcasts this every time the reload-hold's holder list changes (never on every poll tick, only when it differs). `hold_holders` is read by dev/DevBar/hold.js for the readout beside Block; this file stays the one place that knows the wire shape, so hold.js never has to. A plain window event, not a bare property, because a tab can open dev/DevBar/hold.js AFTER a hold already changed the socket's state at least once.

## changed() three outcomes
No `paths` — or a null inside one — means "unknown", which is the old reload-everything. Three outcomes, cheapest first: A path this tab never loaded is ignored. A stylesheet is hot-swapped in place. A DATA file the tab fetched fires a `data` event any page can subscribe to, so the page re-reads the file itself and nothing is lost. Only the fourth case — a module this tab actually RAN has changed — reloads, because a changed ES module cannot be re-imported over the old one without a build step. It no longer short-circuits on `$BLOCKRELOAD`. Blocking means "do not throw my state away"; a CSS swap and a data event throw nothing away, so they keep running while blocked and only `reload()` itself refuses (and counts).

## Reload state preservation
WHAT A RELOAD THROWS AWAY: Most reloads are gone now (see changed() above), but the ones that are left are real, and they still cost the reader their place on the page. These two methods put back the three things they would notice: where they had scrolled, which disclosures were open, and the text they were typing. `?view=` and any `#hash` need nothing — the url survives a reload by itself.

`window.scrollY` IS ALWAYS 0 ON THIS SITE, so stashing it would restore nothing while looking like it worked. The document does not scroll: `.pages` inside the app shell does (measured headless on /framework/ai/sessions/2026/09/22/ at 1440×900 — document 900px tall in a 900px window, `.pages` 5,028px in 900). So this walks for the elements that really carry a scrollTop.

It cannot restore a fold whose body is BUILT ON CLICK (ai/AITask's `fold()`): re-adding the open class would show an empty box, which is worse than a shut one. Native `<details>` is safe because its content is always there. A module with lazily-built state has to remember that itself.

## loaded() path tracking
Every same-origin url this tab fetched, pathname → still hot-swappable. False once something read the file as data — ext/files shows sources, and swapping a <link> would leave that copy stale on screen.

## restyle() cache busting
Bumps `?t=` on the SAME <link> element. A replacement element registers its @layer at the END of the cascade and silently reorders the whole site.

## No write() helper
No `write()` helper: files are written only through ext/filesystem/FsFile.js (the one file API).
