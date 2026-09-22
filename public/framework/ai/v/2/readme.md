# AI v2 — one dense, full-width board, written to live; a second take on the AI dashboard beside the old one

## Use

`page.js` (about 300 lines) + `v2.css` — the whole board, one file each, so the mastermind can edit it by hand in a minute. It reads ONE file live, a run's `task.jsonl`, through a `Run extends TaskJSONL` that adds one verb of its own:

```
{"note": {"id": "…", "at": "…", "msg": "…", "links": [{"url": "…", "label": "…"}]}}
{"agent": {"task": "…", "model": "…", "at": "…", "does": "…"}}   ← in flight until a later line adds "outcome" and "landed_at"
```

`note` is the mastermind's own line to the owner — it shows up top-left, newest first, with no reload. `agent` is the normal task-log verb every task already writes at dispatch and at landing (`ext/JSONL`'s own doc); this board just reads the same lines the day dashboard does.

**Which run it shows.** `?run=/framework/ai/<date>/<slug>/` always wins. Failing that, the newest task dir whose slug starts `mastermind-` (no extra fetch — the names alone are enough). Failing THAT, today's tasks are checked for `{"assign":{"group":"ai-ops"}}` — a handful of small fetches, today only, never the whole archive. `RUN` in `page.js` is the last-resort fallback if none of that finds anything.

**Density.** Compact / cozy / roomy, top right, remembered per browser. It is the design system's own `--size` knob (`.size-small`/`.size-regular`/`.size-large`, `framework.css`) — nothing invented — with one rule bolted on everywhere this board sets a font-size: `max(12px, calc(… * var(--size)))`, so no setting can ever put a letter under 12px.

**Add a panel.** Copy `panel("Title", () => …)` in `board()`. A panel is a title plus whatever DOM the callback builds; look at `notes()` or `needs()` for the shape. A panel that can get long (the Decisions one did) should fold shut by default — see `decisions_panel()`.

## Watch out

- **Topics are cards, not columns.** The first cut used CSS `columns: 26em`, which split a long topic's rows across two columns and dropped its heading in the second one. `.v2-asks` is a `grid` of topic cards now — a grid item can't be split the way flowed text can — traded for uneven card heights (nothing here packs them level; the CSS `masonry` value isn't there yet).
- **The board reaches past the catalog's own gutter on purpose.** It lives inside `/framework/ai/`'s catalog (`ext/catalog/catalog.js`: "a catalog takes wide… no call site gets to decide otherwise"), which insets every catalog page by the OUTER page's `--gutter-x`/`--pad-y`. `.page:has(> .page-catalog .v2) { --gutter-x: 0; --pad-y: 0; }` in `v2.css` opts this board alone out — the owner's own words were "take over the full screen space, not including the sidebar." `:has()` re-evaluates with the route, so every other catalog page (the task pages, the day pages) is untouched.
- **The Decisions panel reuses `ext/AITask/decisions.js` — it is not a copy.** Approve, Improve, drag-to-rank and the reply box are the real writer; a press appends a real `verdict`/`rank` line to the run's own log, same as the real Decisions tab. `v2.css` copies about a dozen lines of `ai.css`'s own dress (the arrow, the status pill, the grip) so the panel reads the same, without loading the whole sheet. It resets `--size` back to 1 inside itself — a control there (a button, the reply textarea) already reads `--size` on its own, and multiplying by density a second time pushed a Send button to 9px before this was added.
- **A dismiss only hides a note on this board.** The × on a note remembers its id in `Page.Store` (`lew42:ai-v2`); the line stays in the run's log forever, same log everyone else still reads.
- **`Page.Store({ id: "ai-v2" })`, not a page url.** Density and dismissed-note ids are a board-wide preference, not tied to which run happens to be showing — the same pattern `core/Sidebar`'s own rail uses.

## More

- [The old dashboard](/framework/ai/) · [the run this board is showing, by default](/framework/ai/2026-09-17/mastermind-layout-browser/) · [ext/JSONL](/framework/ext/JSONL/) the log format · [ext/AITask](/framework/ext/AITask/) the Decisions tab this panel reuses
- Files: `page.js` (the board), `v2.css` (its own small ramp + the reused-panel dress)
