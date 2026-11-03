# 🧰 Server perf, tasks-into-sessions move, and Figma system

## 🖥️ Server perf: brief and order
- Brief: the server-perf requirements (session 30be6115). [S1]
- ⬜ Stop the site stalling. The owner says the site "crashes a lot": whisper threw an error, then the page would not reload. [S2, S3]
- ⬜ Do a quick performance look and fix the cheap, obvious causes. [S4]
- ✅ Already measured: read `Server/doc/perf-2026-10-09.md` first. [S5]
- ⬜ Do the work in order, each step a small commit, smoke-tested. [S11]

## 🖥️ Server perf: Directory rebuild
- ⬜ `Server/plugins/Directory.js` logs "Rebuilding Framework Directories" on about 36% of requests (19,697 of 54,330): every `/framework/` hit re-walks the tree. [S6]
- ⬜ Rebuild only when a file under the walked tree actually changed (the existing watcher or event, or the tree's mtime), not per request. [S12]

## 🖥️ Server perf: Logging
- ⬜ `monorepo.out` is 36 MB because every socket message and RPC is `console.log`ged synchronously. [S8]
- ⬜ Drop the per-message `Socket message` and `RPC:` lines, or gate them behind an env flag that defaults to off. [S14]
- ⬜ Keep errors. [S15]

## 🖥️ Server perf: Pool dev servers
- The main server `Server/run.js` is the hottest node process. [S7]
- 41 dev-server node processes exist, one per worktree or pool slot, each started and stopped within seconds; free RAM is about 7.7 of 32 GB. [S9]
- ⬜ Find why each `qf-N` worktree boots a dev server and churns. If a slot can start on demand (first request, not at checkout), do it. If that code is `Servex/` owned by another agent, write the finding and stop. [S16]

## 🖥️ Server perf: Whisper
- ⬜ Whisper reloaded its 1.6 GB model onto the GPU at 16:23 with no error line in `whisper.jsonl`; why it restarts is unknown. [S10]
- ⬜ Find who supervises whisper-server (Servex) and make its exit code and reason a log line. If a restart loop exists, say why. [S17]

## 🖥️ Server perf: Measuring and recording
- ⬜ Measure before and after: count rebuild log lines over N requests, and `/framework/` request latency. [S13]
- ⬜ Record results in `Server/doc/perf-2026-10-09.md`: update it, don't duplicate it. [S18]
- ⬜ Write `STATE.md` in the session folder so a fresh session can resume. [S25]

## 🖥️ Server perf: Fences
- Fences: work in a worktree and never run `node server.js` directly (server-guard). [S19, S20]
- A `Server/` change needs a restart. Batch it into one, then `node Server/worktree-restart.mjs <name>` must prove it boots on a private port before merging; `Server/merge.mjs` must pass. [S21]
- No new npm dependency; no OpenRouter. [S22]
- Sonnet 5.5; run `node Server/usage-now.mjs` before any spawn; Haiku only for reading, under 60k tokens. [S23]
- One-sentence chat replies. [S24]
- ⬜ Land with `finish-task`, commit with attribution, leave no worktree behind. [S26]

---

## 🗂️ Tasks into sessions: brief
- Source: the tasks-into-sessions requirements (session 41240bd9). [S27]
- ⬜ Move task folders into their session folders. The owner's ask (2026-10-10): convert the old session and task directory structures to the new one, provided nothing is mangled, deleted or lost. [S28, S29]
- ⬜ Port things over and condense where it makes sense. If tasks belong to sessions, put them inside the session folder. Get it done. [S30, S31, S32]
- This reverses the earlier hold on `--tasks` (handover note 2026-10-10). That hold was only "a moved task has no route yet", so solve that, then move. [S33]

## 🗂️ Tasks into sessions: where things stand
- ✅ Where things stand: `Server/session-migrate.mjs` already moved session folders and cards to `public/framework/ai/sessions/YYYY/MM/DD/<slug>/`. [S34, S35]
- ✅ It is a dry run by default, has `--apply` and `--undo`, deletes nothing, and records every move in `ai/sessions/migration-manifest.json` (its header and `Server/session-migrate.test.mjs` explain more). [S36]
- ⬜ Its `--tasks` flag is off. [S37]
- ⬜ When on, it moves each task folder `ai/YYYY-MM-DD/<task>/` to `<session slug>/task/`, matched by `session_id` in `task.jsonl`. [S38]
- ⬜ The blocker: a page exists only while its parent's `children:` declares it, so a moved task has no route and every old link and card would 404. [S39]

## 🗂️ Tasks into sessions: dry run
- ⬜ Do the steps in order and tick each one when proven. [S41]
- ⬜ Dry-run `--tasks` and report: tasks with a session (move), tasks without one (stay, listed), name clashes, tasks whose `task.jsonl` lists several sessions (pick the first or owning one, list the rest), and total bytes. [S42]

## 🗂️ Tasks into sessions: routes
- Read first: `ai/sessions/doc/data/` (layout and data architecture), the `ai/doc/` indexes for the date layout, and `core/Page/doc/indexing-2026-10-08.md`. [S40]
- ⬜ Make routes resolve before moving anything. [S43]
- ⬜ Choose the simplest working approach and record the alternative. Example: a resolver that maps an old `/framework/ai/<date>/<task>/` URL through the manifest to its new path (a redirect or alias in the dev server's router), plus the AI board and card links that name task folders. [S44]
- ⬜ Prove with a handful of real old URLs that they still load after a move. [S45]
- ⬜ If this needs `core/Page` semantics, add a resolver beside it and do not change Page behaviour; note what you need. [S46]

## 🗂️ Tasks into sessions: integrity and condensing
- ⬜ Integrity proof (`migration-verify`): before and after `--apply`, list every file under the moved trees with size and sha1, and prove each old file exists at its new path with identical content (zero missing, zero changed). [S47]
- ⬜ Condensing (merging duplicate folders, dropping empty ones) only as a move-aside to an archive path with a manifest entry. Never delete. [S48]
- ⬜ Keep `--undo` working and test it on a dry copy. [S50]

## 🗂️ Tasks into sessions: apply and land
- ⬜ Apply in a worktree, in batches if large, committing each batch after a smoke test: `node Server/merge.mjs <worktree> --dry-run` must pass, with zero same-origin 404s. [S49]
- ⬜ Update `ai/sessions/readme.md`, the data-layout doc, the handover (remove the hold note "Decision 2026-10-10 ... --tasks stays OFF"), and the AI board and dashboard readers that list tasks, so the board still shows every task. [S51]
- ⬜ Everything stays linked from the site. [S52]

## 🗂️ Tasks into sessions: fences
- Fences. Never destructive: move, link, archive; `git mv` for tracked files; a manifest of every old-to-new path; every move reversible. [S53, S54]
- Commit rule: the live tree has machine-written session files, so agent logs use `git add -A -- . ':!public/framework/ai/sessions/2026'`, and `ai/sessions/2026/` composites go in their own commit once the move is verified. [S55]
- Sonnet 5.5; run `node Server/usage-now.mjs` before any spawn; Haiku minions only for cheap reading under 60k tokens; no OpenRouter. [S56]
- Do not touch `Servex/Pool.js`. [S57]
- One-sentence chat replies; `STATE.md` in this folder; land with `finish-task`, commit with attribution, leave no worktree. [S58]
- If a decision needs the owner, make it, record the alternative, and keep going. [S59]

---

## 🎨 Figma system: the ask
- Source: the Figma system requirements (session 62419663). The owner's dictated ask (2026-10-10) is the essence; details are the owner's best guess. [S60, S61, S62]
- ⬜ Build `ext/Figma`, an extension that tracks Figma files through the Figma MCP so the owner can browse them on our site: each page previewed, each document shown as a larger preview built from its pages. [S63]
- ⬜ Keep notes of every observation about how the Figma system works. [S64]
- ⬜ Then pull in the Sept-2026 file and reproduce as many of its designs as possible within reason, as real framework pages. [S65]

## 🎨 Figma system: what is already known
- ✅ Verified 2026-10-10, no need to redo: the Figma MCP is connected (`mcp__figma__*`), and `whoami` works. The plan is lew42 (`team::846709509681843175`, admin), plus Test Team, UI, Test and Michael's Starter team. [S66, S67]
- No tool lists a user's files, so every call needs a file key from a URL. [S68]
- ✅ Keys known: Sept-2026 `QYN0G2URSBHYH5I06MOjxU`; July-2026 `0rZv3Z6Hnqkxa2UQJ5xOOG` (already converted into `styles/layouts`, see `ai/sessions/2026/08/18/figma/`); scratch file `T5PuB8EhKhfyh0xtpIT1L0` ("Claude layout test", lew42 drafts). [S69]
- Tools. Read: `get_metadata` (no nodeId lists pages; with a nodeId, an XML tree), `get_screenshot` (a short-lived PNG URL, downloaded with curl), `get_variable_defs`; `get_design_context` costs 4x, so the 2026-08-18 run skipped it. Write: `use_figma` (Plugin API JS; load skill `skill://figma/figma-use/SKILL.md` through `ReadMcpResourceTool`, server `figma`, first), `create_new_file`, `generate_figma_design` (captures a live web page into a file), `html_to_figma`. [S70]
- ⬜ A new page was added to Sept-2026 (id `124:1062`, "Claude test page", empty) and may be deleted. [S71]
- Sept-2026 pages: Page 1 `0:1`, Page 2 `7:1148`, Page 6 `69:4759`, Page 3 `11:1467`, Page 7 `112:10252`, Page 8 `119:15240`, Vector Design `19:5982`, Paragraph Design `24:5995`. Page 7 is the one the owner values. [S72, S73]

## 🎨 Figma system: Color Schemes
- Frame `Color Schemes` (`112:11362`) holds nested color-scheme cards. [S74]
- A white card with a ~10% grey card inside; the primary light blue card with a 10–20% darken so white text keeps contrast; a dark card with many lighten and darken steps (10%, 50%, nested). [S75]
- The owner observes that dark mode nests more levels while keeping contrast; it is unknown whether light mode can. [S76]
- ⬜ The cards read as transparency overlays (probably black or white at 10, 25 and 50%), not fixed greys. Verify with `get_design_context` on one card, or `use_figma` reading fills and opacity. [S77]

## 🎨 Figma system: The Palette
- Frame `The Palette` (`112:12899`, 1920 x 11219) is a long style sheet: Palette, Typography, Controls, Feature Cards & Lists, Pricing & Dashboard, Task Management, Timeline & Task Detail, AI Collaboration, Hero Layouts. [S78]
- Screenshots are in the earlier session scratchpad; re-take them cheaply. [S79]
- The owner thinks Figma embeds are not responsive. If so, re-render them as screenshots and lay them out in our own responsive grids. [S80]
- ⬜ Check current Figma embed behaviour (a quick web check or test) and record the result. [S81]

## 🎨 Figma system: deliverables
- ⬜ Smallest working slice first; ship, then widen. [S82]
- ⬜ Observations note `ext/Figma/doc/observations.md`: how the MCP behaves (limits, token costs, rate limits, what failed), updated as you go. It is the memory for the next agent. [S83, S84]
- ⬜ `ext/Figma` extension, written as classes: e.g. `FigmaFile` and `FigmaPage`. Design the names first, put the class architecture on its readme, and show the class. [S85]
- ⬜ Store each tracked file as JSONL beside the extension (file key, name, pages, node ids, screenshot paths, fetched-at). A node script fetches and refreshes it (compute, don't recall). [S86]
- ⬜ Download screenshots into the repo, size-capped, so the site works without Figma. [S87]
- ⬜ Browse page: a files list, then a file's pages as a responsive preview grid, then a page's frames. [S88]
- ⬜ Everything linked from the site: the `ext` readme and the framework index. [S89, S101]
- ⬜ Live via the `live()` tail where data changes. [S90]
- ⬜ Reproduce Page 7: start with `Color Schemes` as a framework demo (nested cards using alpha-overlay darken and lighten tokens, dark and light), then the Palette sections one at a time. [S91]
- ⬜ Reuse existing framework CSS and classes first (law 6: check `styles/` and `ux/` before writing anything). [S92]

## 🎨 Figma system: Haiku build pattern
- ⬜ Sonnet reads the Figma file and writes a minimal spec per section (node ids, screenshot, exact tokens). A Haiku 5.5 minion under 60k tokens gets only that spec and builds the page. [S93]
- ⬜ Record what Haiku got right and wrong, per section. [S94]

## 🎨 Figma system: page content storage (open question)
- ⬜ Open question: decide and write it down; do not wait on the owner. [S95]
  - Owner's thinking: a page's content is a list of views in its JSONL (the first line may hold a snapshot, later lines are deltas, so playback and the live tail come free; condense or snapshot when large), like chat messages and session files already render. [S96]
  - Find what exists (`core/Page/doc/indexing-2026-10-08.md`, `ext/Refine`, the streaming list and Page classes, `page.js` vs `page.jsonl`). Decide whether the first slice uses it or plain `page.js`; take the simpler working path and record the alternative. [S97]
  - If page-as-JSONL-views is not built yet, do not build it here. Write a short `doc/` note with what was learned and the smallest slice. [S98]

## 🎨 Figma system: fences
- Fences: work in a worktree; commit each working step after a smoke test; merge via `Server/merge.mjs` after reviewing the diff. [S99, S100]
- Figma writes go only to scratch file `T5PuB8EhKhfyh0xtpIT1L0` or to new files in lew42 drafts. Never modify or delete Sept-2026 or July-2026. [S102, S103]
- Do not touch `ai/sessions/`, `Servex/`, or `core/Page` semantics; note what you need instead. [S104]
- Sonnet 5.5; run `node Server/usage-now.mjs` before each spawn; Haiku minions for cheap reading and building, under 60k tokens; no OpenRouter. [S105, S106]
- One-sentence chat replies; progress log lines at least every 5 minutes; `STATE.md` in this folder. [S107]
- ⬜ Land with `finish-task`, commit with attribution, leave no worktree behind. [S108]
