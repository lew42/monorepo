Budget: $15

# Build C — Shots: a Figma frame vs its built page, and the view at full width (Sonnet minion, worktree)

Shots is merged on `michael/dev` (`public/framework/ext/Shots/`: `Shots.mjs`, `PNG.mjs`, `Diff.mjs`, `ShotsView.js`; CLI `Server/shots.mjs`). Read its `readme.md` and `doc/architecture.md`, then [plan.md](plan.md). Load the `code` skill. The owner's loop this serves: `public/framework/ext/Figma/doc/figma-browser-loop.md` (Figma decides the layout; the code is checked against the approved frame with a screenshot diff, because a model can't reliably see subtle differences between two images).

## 1. Figma mode
`node Server/shots.mjs --figma <png path | fileKey:nodeId> <url> [width]`
- **Figma side:** a PNG. Given `fileKey:nodeId`, use `public/framework/ext/Figma/data/<fileKey>/shots/<node-id with : → ->.png` if it exists; otherwise fetch it with the Figma MCP `get_screenshot` (you have it as `mcp__figma__get_screenshot`; read how `ext/Figma/track.mjs` stores shots and save the png the same way, under its 600 KB cap — if the MCP returns an image, not a url, save via the same folder and say how in the doc). Width defaults to the frame's own width.
- **Page side:** the normal Shots picture at that width.
- **Crop both to their content** (trim uniform background margins), then scale the Figma picture to the page picture's width if they differ (nearest-neighbour or box filter in `PNG`/a small helper; no npm).
- Same `Diff.compare`, same overlay, logged as a normal round with `"kind":"figma"`, `"figma":{"key","node","file"}` in the `run` line, so Better / Not better work unchanged. The round's BEFORE is the Figma picture (`vs` names a pseudo-round id `figma-<key>-<node>` whose png is copied into the round folder as `figma.png`) — pick the simplest shape that keeps the log readable and say what you chose in `doc/architecture.md`.
- **First real pair:** Figma Sept-2026 `QYN0G2URSBHYH5I06MOjxU` frame `131:1062` vs `http://monorepo.localhost/framework/ext/Figma/guide/` at 3440. Run it, open the overlay with Read, and write one paragraph in the doc: what the diff says differs, and whether that matches what you see.

## 2. Hang the overlay on `FigmaComparePage`
`public/framework/ext/Figma/FigmaComparePage.js` is the existing side-by-side view. Where it shows a frame beside its built page, add the latest figma-kind round's overlay and diff line (read `runs.jsonl` through `ShotsView`'s own `ShotsJSONL`, never a second reader), with a link to that round in `/framework/ext/Shots/?url=…&round=…`.

## 3. `ShotsView` fixes from the first live look
- At ≥ 1200 px the round tree sits in a narrow column and the chosen round's detail falls below the fold: put the tree left and the detail right (before / after / overlay) on wide screens; stacked on narrow. Load the `layout` skill.
- Pictures are gitignored, so another machine has the log but not the pngs: a missing image shows a small "picture not on this machine" box, never a broken image or a console 404 storm (check with `node Server/smoke.mjs`; an `<img>` 404 is fine if smoke allows it — otherwise probe with `fetch(…, {method:"HEAD"})` once per round).
- Moved regions (`moved` in the diff line) listed beside the changed ones: "moved 3 (largest 1400×900 by +48,+48)".

## Done means
- `node public/framework/ext/Shots/Shots.test.mjs` passes (add a crop + scale test).
- The first real pair has a round in `runs.jsonl` and an overlay you looked at.
- `/framework/ext/Shots/?url=/framework/ext/Figma/guide/` and the Figma compare page render at 400 and 1920 with no console errors (headless only; boot a private worktree server via `node Server/worktree-up.mjs <name>` or shoot against `http://monorepo.localhost` for code already merged).
- Work in a NEW worktree from LOCAL `michael/dev`: `node Server/worktree-up.mjs screenshot-build-c`. Commit each working step there. Never commit the background indexer's `files.jsonl`/`page.jsonl` noise outside your fence — `git add` named paths only, never `-a`. Do not merge. Log progress in this task's `task.jsonl` with `node .claude/hooks/append.mjs` (verb-wrapped lines: `{"log":{"at","msg"}}`).
- Reply under 200 words: worktree path, branch, commits, the CLI line of the first pair, and the screenshot paths.
