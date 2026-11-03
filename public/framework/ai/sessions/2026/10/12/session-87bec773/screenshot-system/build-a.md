Budget: $15

# Build A — Shots, the node side (Sonnet minion, worktree)

Read [plan.md](plan.md) first: it is the spec (classes, file layout, log lines, widths rule, diff). You build step 1 of "The slice". Load the `code` skill before writing JS.

## Your files (fence — touch nothing else)
- `public/framework/ext/Shots/PNG.mjs` — `class PNG` with static `decode(buffer)` and `encode({width,height,data})`. node `zlib` only. Must decode what Chromium writes (8-bit RGB and RGBA, colour types 2 and 6, non-interlaced, all five filter types). Encode RGBA, filter 0.
- `public/framework/ext/Shots/Diff.mjs` — `class Diff`, static `compare(before, after, {cell = 16, threshold})` → `{changed, regions, overlay, height}` exactly as plan.md says (overlay is a decoded image; caller encodes).
- `public/framework/ext/Shots/Shots.mjs` — `class Shots`: `widths(info)`, `dir(url)` (page folder, or nearest ancestor with a `page.js` + `screenshots/<rest>/`), `run(url, opts)`, `judge(id, verdict, why, by)`, `rounds(url)` (reads the log). Launch through `Server/browser.mjs` (`browser()`), viewport heights 860 at 400 and 1080 otherwise, full-page shot clipped to 4000 px. After load, read the active page's `resolutions` / `optimalWidth` (own property or its constructor's static) from the window — find how the app and its router are reachable (grep `public/framework/dev/DevBar/` for how it gets `app`). Wait for the page to settle (network idle + 300 ms) before each shot.
- `public/framework/ext/Shots/runs.jsonl` — the log. Append lines ONLY via `node .claude/hooks/append.mjs <file> <lines.json>` style code path or `fs.appendFileSync` of `JSON.stringify(line)+"\n"` from the Shots class (a hand-written edit to a .jsonl is blocked by a hook). Create it empty.
- `public/framework/ext/Shots/Shots.test.mjs` — node test: PNG round-trip (encode → decode equals), Diff on two synthetic images with one known changed rectangle finds exactly that region.
- `Server/shots.mjs` — the CLI:
  - `node Server/shots.mjs <url or path> [400,1200] [--note "..."] [--css "rules"] [--vs <round id>] [--task <task dir>] [--by <agent>]` — shoots one round, diffs it against `--vs` or the url's latest round, prints one short summary per width (file paths, changed %, top 3 regions, height change).
  - `--judge <round id> better|worse|same "why" [--by <agent>]`
  - `--list <url>` — the rounds, as a tree.
  - The base url: the site is `http://monorepo.localhost/` (Servex proxy). A worktree has its own dev server — accept `--base <origin>`.
- `.gitignore` — one line: `**/screenshots/`.

## Done means
- `node public/framework/ext/Shots/Shots.test.mjs` passes.
- Real run: `node Server/shots.mjs /framework/ext/Figma/` twice (second with `--css "body{padding:3em}"`) gives two rounds, a diff overlay png whose red boxes sit where the change is (open the png with Read and look), and the log has run + diff lines. Report the paths.
- Commit each working step in your worktree (`take_worktree`), with clear messages. Do not merge — the mastermind reviews and merges.
- Log progress lines in `public/framework/ai/sessions/2026/10/12/session-87bec773/screenshot-system/task.jsonl` through `append_log` or `node .claude/hooks/append.mjs`.
- Reply with: the worktree branch, the commit list, and the two-round summary output.
