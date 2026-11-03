# Server perf: stop the site stalling (task mastermind brief)

**Owner's ask (2026-10-09/10):** the site "crashes a lot": whisper threw an error, then the page would not reload. Do a quick performance look and fix the cheap, obvious causes.

**Already measured** (`Server/doc/perf-2026-10-09.md`, read it first):
- `Server/plugins/Directory.js` logs "Rebuilding Framework Directories" on ~36% of all requests (19,697 of 54,330): every `/framework/` page hit re-walks the tree. The main server (`Server/run.js`) is the hottest node process.
- `monorepo.out` is 36 MB: every socket message and RPC is `console.log`ged synchronously.
- 41 dev-server node processes (one per worktree/pool slot, started and stopped within seconds); free RAM ~7.7 of 32 GB.
- Whisper reloaded its 1.6 GB model onto the GPU at 16:23 with no error line in `whisper.jsonl`; why it restarts is unknown.

**Do, in order (each a small commit, smoke-tested):**
- [ ] 1. **Directory rebuild**: rebuild only when a file under the walked tree actually changed (use the existing watcher/event, or mtime of the tree), not per request. Measure before/after (count rebuild log lines over N requests; request latency of `/framework/`).
- [ ] 2. **Logging**: drop the per-message `Socket message` / `RPC:` console lines (or gate them behind an env flag, default off). Keep errors.
- [ ] 3. **Pool dev servers**: find why qf-N worktrees each boot a dev server and churn; if a slot's dev server can start on demand (first request) instead of at checkout, do it; if that is `Servex/` code owned by another agent, write the finding and stop (do not edit `Servex/Pool.js` semantics).
- [ ] 4. **Whisper**: find who supervises whisper-server (Servex) and make its exit code and reason a log line; if a restart loop exists, say why.
5. Record results in `Server/doc/perf-2026-10-09.md` (update, do not duplicate).

**Fences:**
- Work in a worktree; never run `node server.js` directly (server-guard).
- A `Server/` change needs a restart: batch it into one, then `node Server/worktree-restart.mjs <name>` proves it boots on a private port BEFORE merging; `Server/merge.mjs` must pass.
- No new npm dependency; no OpenRouter. Sonnet 5.5; `node Server/usage-now.mjs` before any spawn; Haiku only for reading, under 60k tokens.
- One-sentence chat replies. Write `STATE.md` here so a fresh session can resume. Land with `finish-task`, commit with attribution, leave no worktree behind.
