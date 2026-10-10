# Move task folders into their session folders (task mastermind brief)

**Owner's ask (2026-10-10):** convert the old session and task directory structures to the new one, provided nothing is mangled, deleted or lost. Port things over and condense where it makes sense. **If tasks belong to sessions, put them within the session folder.** "Get it done." This reverses the earlier hold on `--tasks` (handover note 2026-10-10): the hold was only "a moved task has no route yet"; solve that, then move.

## Where things stand
- `Server/session-migrate.mjs` (read its header; `Server/session-migrate.test.mjs`) already moved session folders and cards into `public/framework/ai/sessions/YYYY/MM/DD/<slug>/` with a manifest `ai/sessions/migration-manifest.json`, dry run by default, `--apply`, `--undo`, nothing deleted. Its `--tasks` flag (off) additionally moves each task folder `ai/YYYY-MM-DD/<task>/` (or `ai/YYYY/MM/DD/<task>/`) to `<session slug>/task/`, joined by `session_id` in `task.jsonl`.
- The blocker: a page exists only while its parent's `children:` declares it (CLAUDE.md "Nothing crawls"; `ai/sessions/doc/data/layout.md`), so a moved task has no route and every old link and card to it would 404.
- Read first: `ai/sessions/doc/data/` (layout and data architecture), `ai/doc/` indexes for the date layout, `core/Page/doc/indexing-2026-10-08.md`.

## Do, in order
1. **Dry run `--tasks`** and report counts: tasks with a session (move), tasks without one (stay; list them), name clashes, tasks whose `task.jsonl` has several sessions (pick the first/owning one, list the rest), and the total bytes.
2. **Make routes resolve before moving anything.** Choose the simplest working approach and record the alternative: e.g. a resolver that maps an old `/framework/ai/<date>/<task>/` URL through the manifest to its new path (a redirect or an alias in the dev server's router), AND the AI board/card links that name task dirs. Prove with a handful of real old URLs that they still load after a move. If this needs `core/Page` semantics, add it beside it as a resolver; do not change Page behaviour (note what you need).
3. **Integrity proof:** a script that, before and after `--apply`, lists every file under the moved trees with size and sha1 and proves each old file exists at its new path with identical content (`migration-verify`): zero missing, zero changed. Condensing (merging duplicate folders, dropping empty ones) is allowed only as move-aside to an archive path with an entry in the manifest; never delete.
4. **Apply** in a worktree, in batches if large, committing each batch after a smoke test (`node Server/merge.mjs <worktree> --dry-run` must pass; zero same-origin 404s). Keep `--undo` working; test it on a dry copy.
5. **Update** `ai/sessions/readme.md`, the data-layout doc, the handover (remove the hold note I left: "Decision 2026-10-10 ... --tasks stays OFF"), and the AI board/dashboard readers that list tasks, so the board still shows every task. Everything stays linked from the site.

## Fences
- Never destructive: move, link, archive; `git mv` for tracked files; manifest of every old to new path; reversible.
- The live working tree has machine-written session files; commit rule: `git add -A -- . ':!public/framework/ai/sessions/2026'` for agent logs, and add `ai/sessions/2026/` composites in their own commit once the move is verified.
- Sonnet 5.5; `node Server/usage-now.mjs` before any spawn; Haiku minions only for cheap reading under 60k tokens; no OpenRouter. Do not touch `Servex/Pool.js`.
- One-sentence chat replies; `STATE.md` in this dir so a fresh session resumes; land with `finish-task`, commit with attribution, no worktree left behind. If a decision needs the owner, make it, record the alternative, and keep going.
