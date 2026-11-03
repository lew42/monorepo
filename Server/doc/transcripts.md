# Transcripts — what each session was about, touched and cost, from the raw logs, no AI

`node Server/Transcripts.mjs` reads the raw Claude SDK transcripts (`~/.claude/projects/<project>/<session-id>.jsonl`, 5-10 MB each) and writes a small `essence.jsonl` into the matching task folder, next to `task.jsonl`. Class: `Transcripts` in [`Transcripts.mjs`](../Transcripts.mjs). Typical result: 1 MB raw becomes 13 KB.

## Where it lands, and the join key
`task.jsonl` line 1 holds `assign.session_id`; that id is the transcript's file name. A transcript with no task folder gets nothing written (it is only counted in the run report: refine/dictate test sessions, whose first prompt starts `Current outline`, versus other).
`essence.jsonl`: line 1 `{"summary":{...}}`, then one event per line: `k:"prompt"` (with `from`: `owner`, `agent` or `system`), `k:"say"`, `k:"tool"`.
A run skips a session whose raw size has not changed (`--force` redoes it).

## Kept
- **Prompts**, full text (owner up to 8000 chars, agent/system briefs 2000); the dispatcher's readme dump is cut off and counted in `preamble_chars`. `from:"owner"` = typed in VS Code (`turnOrigin:"human"`) or relayed by the voice agent (`[from: owner`).
- **Assistant text**, 600 chars per block, `truncated` flag. **No thinking, no tool results.**
- **Tools**: `{tool, path}` for Read/Edit/Write/MultiEdit/Glob/Grep, `{tool:"Bash", cmd}` at 200 chars. Every other tool is only counted in `summary.tools`.
- **Summary**: models, first/last time, prompt and turn counts, raw and essence bytes, est. tokens (bytes/4), `modules_edited` / `modules_read` (via `SessionIndex.module_of`, from paths collapsed to directories; the top directories sit in `dirs`), usage per model, cost.

## Cost
`usage` is summed over unique `message.id` (a message is written once per content block, with the same usage). `recorded_usd` is the session's last `cost-state` record, the real figure; `est_usd` is computed from `Transcripts.PRICES`, which is fitted, marked "verify", and runs about 14% high on Opus. Trust `recorded_usd`.

## CLI
```
node Server/Transcripts.mjs [--since YYYY-MM-DD] [--limit N] [--dry-run] [--session <uuid>] [--force]
node Server/Transcripts.mjs --grep "dedup|duplicate" [--all]
```
Default: last 2 days (by file time), newest first, only sessions with a task folder. `--dry-run` prints raw KB -> essence KB and totals without writing. `--grep` searches the owner's prompts in the essence files already written ("didn't I ask for this before?"); `--all` includes agent briefs. It only sees days that were run, so widen `--since` first.

Related: [`session-index.md`](./session-index.md) (task records in memory).
