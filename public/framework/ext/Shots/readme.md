# Shots — the screenshot system: shoot, diff, judge

**Shots** takes a page's screenshots at the widths its template needs, keeps every round in that page's own folder, diffs each round against the one before it, and draws an overlay of what changed. An agent runs it, reads the pictures; the owner gives the last word with one click.

## Run it
```
node Server/shots.mjs <url>
```
Writes `<page folder>/screenshots/<round id>/<width>.png` (and `diff-<width>.png`) plus one line here, in [`runs.jsonl`](runs.jsonl).

## See it
- The dev bar's **Screenshots** tab — the page you're on, right now.
- [`/framework/ext/Shots/`](/framework/ext/Shots/) — every page that has a round, and `?url=` opens one.

## Classes
- `class ShotsJSONL extends JSONL` (`ShotsView.js`) — reads `runs.jsonl`'s `run`/`diff`/`judge` lines into a tree.
- `class ShotsView extends View` (`ShotsView.js`) — the one view: round tree, before/after/overlay, Better / Not better. Shared by the dev bar tab and the module page — one fix updates both (CLAUDE.md law 6).
- `Shots` / `PNG` / `Diff` (node side, `Shots.mjs` `PNG.mjs` `Diff.mjs`) — the half that shoots and writes the log; see [plan.md](../../ai/sessions/2026/10/12/session-87bec773/screenshot-system/plan.md).

## Files
- `ShotsView.js`, `ShotsView.css` — the browser side (this build).
- `page.js` — the module page.
- `../../dev/DevBar/shots.js` — the dev bar tab (registered in `tools.js`'s `tabs`).
- `runs.jsonl` — the committed log (pictures themselves are gitignored under `screenshots/`).

## Watch out
- `runs.jsonl`'s exact line shapes are the contract between the node side and this view — see [`doc/architecture.md`](doc/architecture.md) before changing either.
- The diff's line-filter upgrade (reporting a moved edge, not just a changed cell) is recorded, not built — [plan.md](../../ai/sessions/2026/10/12/session-87bec773/screenshot-system/plan.md#the-diff).

## More
[Overview](/framework/ext/) · [`doc/architecture.md`](doc/architecture.md): the log shape, who writes what, the padding principle it checks for.

## Notes from your asks

- Every UI change is screenshotted, so each round can be compared with the one before it. ([your words](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p11077), 2026-10-12)
- Shots only supplies the pictures; reading them well is a skill an agent improves, and the owner gives the last word. ([your words](/framework/ai/sessions/f155ecbd-2911-4f55-bc4c-c1cf9d7b7026/?tab=coverage#p3718), 2026-10-12)
