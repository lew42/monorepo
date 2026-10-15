### 1. Day audit (2026-10-03) · `public/framework/ai/sessions/2026/10/03/day-audit/audit-2026-10-03.json`

One JSON array, not a file per task: 22 records, one per task. Written by `day-audit.mjs` in the same folder. A sibling `files.jsonl` sits beside it.

- `title`, `owner` (the task's slug, e.g. `task-mastermind-console-clean`), `status` (`landed` or `stalled`)
- `brief`, `log`, `landed` (`yes` or `no`), `dir` (e.g. `2026-10-03/console-clean`), `outcome` (the task's outcome line, trimmed)

Example record, trimmed:

```json
{
  "title": "Console: clean on /ai/live; smoke fails on console noise and 404s",
  "owner": "task-mastermind-console-clean",
  "status": "landed",
  "brief": "yes",
  "log": "yes",
  "landed": "yes",
  "dir": "2026-10-03/console-clean",
  "outcome": "Landed. /framework/ai/live/: console lines 210→1(allowed)..."
}
```

### 2. Branch audit (2026-10-13 run, files dated 10-14) · `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/branch-audit-merge/`

Three JSON arrays, all from `classify.mjs`, `absent.mjs` and `moved.mjs` in the same folder. The owner's question did not name a single file; these are the candidates.

- `classify.json`: 141 records, one per branch. Fields: `branch`, `ahead`, `missing`, `records`, `docs` (list of paths), `code` (list of paths).
- `absent.json`: 44 records. Fields: `branch`, `absent` (list), `differ` (count).
- `moved.json`: 44 records. Fields: `branch`, `ahead`, `date`, `files`, `absent`, `devMoved`, `devUnchanged`.

Example from `classify.json`, trimmed:

```json
{"branch":"_tmp_cards_and_logs_check","ahead":6,"missing":17,"records":4,
 "docs":["public/framework/core/Page/card/doc/system.md", "..."],
 "code":["public/framework/core/Page/card/card.css", "..."]}
```

### 3. Readme audit (dated 2026-10-12; no 2026-10-13 file found) · `public/framework/ai/sessions/2026/10/12/session-87bec773/readme-audit/audit-before.json` and `audit-after.json`

The closest match. Written by `audit.mjs` in the same folder (a readme census). The two files are the same shape, one before and one after the upkeep pass. Each is an array of 311 records, one per readme. The after run still has 20 readmes with broken links.

- `file` (readme path), `lines` (line count), `broken` (list of link targets that do not resolve), `missing` (child modules the readme never names)

Example record (from `audit-before.json`):

```json
{"file":"public/framework/ai/archive/ai2/readme.md","lines":4,
 "broken":["../../2026-10-09/ai2-merge/manifest.json"],"missing":[]}
```

Looked for a 2026-10-13 readme audit under `sessions/2026/10/13/` and `2026/10/14/` (names containing `readme`, `audit`); the only readme-related 10-13 work is `readme-upkeep/` (`reach.txt`, a link check that writes text, not JSON). No 10-13 readme-audit JSON exists.

### 4. Does `Server/PastWork.mjs` or the past-work skill read them?

- Day audit: no. No match for `day-audit` or `audit-2026-10-03` in `Server/**/*.mjs` or `.claude/skills/past-work/`.
- Branch audit: no. No match for `classify.json`, `absent.json`, `moved.json` (or `branch-audit`). The `moved.json` hits in `Server/TaskMove.mjs` and `Server/TaskDirs.mjs` are a different file: the task-move stub.
- Readme audit: no. No match for `readme-audit`, `audit-before` or `audit-after`.

`PastWork.mjs` reads `task.jsonl` through `SessionIndex.reduce` (`Server/PastWork.mjs`, the import of `SessionIndex.mjs`), not these outputs.
