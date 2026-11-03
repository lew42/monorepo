verdict: fix
1. [fix] timeline/TimelinePage.js, refill(): the patch deletes `const all = ...` but the debug line still calls `TimelinePage.sources(all)` (diff line 118, an unchanged context line). With `?debug` on this throws a ReferenceError and the head never finishes drawing. Use `scoped` (or `this.timeline.rows()`) there.
2. [note] Requirements are otherwise met. Seen rows leave the default view and are kept, with a "Seen too" toggle and "Mark all seen". Today, Yesterday and a literal-day chip scope the rows. Date browsing of sessions is correctly left to the Sessions page.
3. [note] Seen is stored per browser in PagePrefs (Timeline.js `Seen`), so another device or browser shows everything as unseen. That matches the AI rail's read flag and is documented in inbox-data.md; fine for now.
4. [note] Opening a row marks it seen and calls refill() on every draw. `open_key` keeps the open row in the rail and `deactivated` clears it, which is a sound design. Timeline.js `rows()` caches `_rows`, so the filters run per call and are cheap.
5. [note] The "Inbox zero" message only shows when `scoped` is non-empty and `rows` is empty. An empty day with nothing seen shows only "0 built · 0 for you", which is acceptable.
6. [note] No shots were given and none were needed to read this diff. I have not checked the chip row at 400 wide; with six or seven chips it may wrap.
