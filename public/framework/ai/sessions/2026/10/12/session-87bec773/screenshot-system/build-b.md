Budget: $15

# Build B — Shots, the browser side (Sonnet minion, worktree)

Read [plan.md](plan.md) first: it is the spec. You build step 2 of "The slice". Load the `code`, `ui` and `layout` skills before writing. Another minion is building the node side (`Shots.mjs`, `PNG.mjs`, `Diff.mjs`, `Server/shots.mjs`) at the same time — do not create or edit those.

## The log you read (fixed format)
`public/framework/ext/Shots/runs.jsonl`, one JSON object per line, three verbs:
- `{"run":{"id":"2026-10-12-163000","url":"/framework/ext/Figma/","dir":"public/framework/ext/Figma/screenshots/2026-10-12-163000","widths":[400,1200],"parent":"<older id>|null","note","css","task","by","at","shots":{"400":{"file":"400.png","height":3120,"cut":false}}}}`
- `{"diff":{"id":"<new round>","vs":"<older round>","width":400,"changed":0.12,"regions":[[x,y,w,h,amount]],"overlay":"diff-400.png","height":[before,after]}}` (overlay sits in the NEW round's dir)
- `{"judge":{"id","vs","verdict":"better"|"worse"|"same","by","why","at"}}`

An image's url is `"/" + dir.replace(/^public\//, "") + "/" + file`. Read the log with `ext/JSONL` (live tail if it offers one — new rounds should appear without a reload; "stream, don't poll"). Until the node minion lands, write 3 fake lines in a scratch copy for your own testing, never into the real `runs.jsonl` (create it empty if missing).

## Your files (fence)
- `public/framework/ext/Shots/ShotsView.js` — `class ShotsView extends View` (check how other ext views extend `core/View`): given a page url, the rounds as a tree (parent → children, newest first), each round a row of width thumbnails (the top of each picture, so a 4,000 px tall shot doesn't flood the rail); click a round → before / after / overlay for one width, side by side when wide, stacked when narrow; the diff's changed % and the judge lines; two buttons **Better** and **Not better** that append `{"judge":{…,"by":"owner"}}` through `Socket.singleton().async_rpc("append", "/framework/ext/Shots/runs.jsonl", [JSON.stringify(line)])` (see `ext/filesystem/FsFile.js:160`). Empty state: "No shots of this page yet: `node Server/shots.mjs <url>`".
- `public/framework/ext/Shots/ShotsView.css` (in a layer, per the css skill).
- `public/framework/dev/DevBar/shots.js` — a section function `(app) => …` that renders `ShotsView` for the active page's url (see how `route()` in `tools.js` gets it), and in `tools.js` add `["screenshots", [shots]]` to `tabs`. This one edit shows it in both the old dev bar and `dev/DevShell`'s right rail.
- `public/framework/ext/Shots/page.js` — the module page: every page that has shots (from the log), each linking to its ShotsView; `?url=…&round=…` routes the view (reload lands in the same place). Tiny page.js: import the class, instantiate.
- `public/framework/ext/Shots/readme.md` (short index: what Shots is, the CLI line, the tab, the files, links to `doc/`), `doc/architecture.md` (copy the decisions from plan.md: widths rule + the tall-page alternative, log format, the diff, who does what, the later items, and the padding principle: "one default clamped padding token should work in about 90 % of places: a container has padding or it doesn't; compact and spacious remaps come later; 80/20, less CSS, nothing broken").
- Link the module: add `Shots` to `public/framework/ext/page.js`'s children (or however ext lists its modules — check) and one line to `public/framework/ext/readme.md`.

## Done means
- The page and the tab render with your scratch data, at 400 and 1920 (shoot headless with `mcp__site__shot` or `node Server/layout-check.mjs` — never the owner's tabs). Look at the pngs.
- `check_page` on `/framework/ext/Shots/` shows no console errors.
- Commit in your worktree. Do not merge. Reply under 250 words: branch, worktree path, commits, the screenshot paths.
