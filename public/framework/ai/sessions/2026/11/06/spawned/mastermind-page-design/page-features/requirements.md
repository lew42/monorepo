Budget: $6

# Which Page features work from voice: tabs, columns, place, nav, previews

Load the `minion` skill first. Card (the owner's words and replies): `/framework/ai/2026/11/06/page-and-item-voice-help-feature-demos-c/`.

## The question

Voice Claude drives pages with ONE tool: `item({path, delta})` (the Servex `item` MCP tool; `{"help":{}}` as the delta prints what a page takes). The owner wants to know which Page features voice can actually use, and to SEE each working one. Five features: **tabs, columns, place, nav (the `navigation` word), previews** (a wall of child-page preview cards).

For each feature:
1. Find how it is driven by a delta. Start from `public/framework/core/Page/doc/ai-api.md`, `public/framework/core/Page/readme.md`, the `place`/`tab` docs in `Page.class.js` `static callable`, and `Page.WORDS` (navigation, width, arrangement, surface, background, type_size). Grep, don't read whole files.
2. Try it with the item tool on its own sub-page and look at it with a headless screenshot (`site` MCP `shot`, or Playwright headless). Width 1200 is enough; 400 too if it is about layout.
3. Verdict: **works**, **partly** or **broken**, with the exact delta, the shot path, and for a broken one the cause as `file:line` (prove it; do not guess).

## Where to build the demos

- Sub-pages of /live/ are LivePages, which draw their own way, so a feature may be fine in Page and not drawn by LivePage. Make a hub sub-page: `item({path:"/live/", delta:{"pages":{"add":{"name":"demos","title":"Page features"}}}})`, then one sub-page per feature under it (`/live/demos/tabs/`, …). If a feature does not render in a LivePage sub-page, also try it on a plain Page (line 1 `"class"` left out, or a `class` of `/framework/core/Page/Page.class.js`) under `/live/demos/` to tell "Page is broken" from "LivePage does not draw it", and say which.
- On the hub (`/live/demos/`), one `part-link` card per feature with a one-line verdict, so the owner can tap through.
- **Do NOT write to `/live/` content itself** (no add, clear, save or restore on `/live/`): voice-app is presenting there right now. Adding the `demos` sub-page is the only write to `/live/`.

## Deliverable

1. The demos, live under `/live/demos/`.
2. `public/live/doc/page-features.md` (one screen): a table, one row per feature: verdict, the delta voice sends, link to its demo, shot. Then, for each partly/broken one, two lines: cause (`file:line`) and the smallest fix. Link it from `public/live/readme.md` (one line under "Going into a thing: sub-pages" or a new "Page features" line).
3. Your findings as `log` lines in your task.jsonl; shots in your task dir.

## Fence

- Write only: page logs under `/live/demos/` (through the item tool, never by hand), `public/live/doc/page-features.md`, one link line in `public/live/readme.md`, your task dir.
- No code changes. A fix you would make goes in the doc as "smallest fix"; the mastermind decides.
- Never restart Servex or the dev server, never drive the owner's open tabs, never `git stash`. Commit only your own files, by exact path.
- Done = the doc committed and the demos reachable. Then stop.
