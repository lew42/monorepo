# Repo junk census: findings

Read-only. Measured 2026-11-04 about 23:00 on the main tree `C:/Code/lew42/monorepo` (branch `compliance/dev`), plus `git worktree list`. Nothing changed. Receipts are commands or `path:line`.

## Short answer

- The main tree has **455 changed entries**: 173 modified, 266 untracked, 16 deleted. Receipt: `git status --porcelain | awk '{print $1}' | sort | uniq -c`.
- Most of the untracked count is **files the sweeper is not allowed to commit**: 101 `.md`, 27 `.js`, 43 folders, 20 `.png`, 11 root `Temp_*` files (see the table).
- The owner's "about 1,000 + 1,000" is roughly what you get by **adding up every registered worktree**. Each worktree keeps its own copy of the task records. One worktree (`voice-research`) is broken and adds 26,519 entries. See finding U5.
- The log sweeper (`Servex/LogSweeper.js`) is working: 8 "log sweep" commits since 18:00 today, the last at 21:54. Its allow-list covers 202 of the 455 entries. The other 253 never get committed by anything.

## 1. Every kind: count, size, writer, reader, ignored?

Sizes from `git ls-files` (tracked) and from stat on disk (changes). Writers and readers are `path:line` from the code.

| Kind | Tracked (n, size) | Changed now (n, size) | Writer | Reader | In `.gitignore`? |
|---|---|---|---|---|---|
| `files.jsonl` | 3,922 · 4.1 MB | 6 modified · 1 KB | `Server/plugins/PageFiles.js:30` (`LIST`), `Server/ModuleLog.mjs:75` | static site: `public/framework/ext/files/fs.js:52`, `ext/files/files.js:62`, `ai/AISession/AISessionCoverage.js:61` | no |
| `task.jsonl` | 2,114 · 12.7 MB | 75 modified · 227 KB; 29 + 55 KB untracked | `append.mjs` (`.claude/hooks/append.mjs:2`) | `core/Item`, the live task pages | no |
| `session.jsonl` | 2,043 · 25.4 MB | 49 modified · 418 KB; 19 untracked | `append.mjs` | session pages | no |
| `page.jsonl` | 1,268 · 3.2 MB | 1 modified | page tools | `core/Page` | no |
| `log.jsonl` | 65 · 0.7 MB | 6 modified · 56 KB; 18 untracked · 13 KB | `append.mjs` | module logs | no |
| `inbox.jsonl` | 261 · 2.2 MB | 2 modified; 9 untracked | `append.mjs` | Inbox rail | no |
| `past-work.md` | 312 · 2.7 MB | 74 untracked · 583 KB | `Servex/agents/Agents.js:308` (writes it at spawn via `Server/PastWork.mjs`) | the spawned agent | no |
| `review.md` | 394 · 1.0 MB | 16 untracked · 47 KB; 3 modified | review tooling (`Server/review.mjs`) | merge gate | no |
| `requirements.md` | 1,825 · 6.8 MB | 10 untracked · 21 KB; 12 modified · 33 KB | the mastermind, by hand | the spawned agent, `Servex/Budget.js:41` | no |
| `page.js` | 2,350 · 5.9 MB | 29 untracked · 3 KB | page tools in task folders | the page | no |
| `diff.patch` | 395 · 40.6 MB | 20 untracked · 762 KB; 3 modified | review tooling | nobody on the site | no |
| `digest.json` | 587 · 1.5 MB | none | `Server/…` (sessions indexer) | sessions page | no |
| `index.json` | 34 · 5.5 MB | 2 modified · 612 KB | sessions indexer | sessions page | partly (`public/framework/ai/sessions/**/index.json` rule per commit-rule) |
| `*.png` | 433 · 48.1 MB | 20 untracked · 2.8 MB | screenshot tools | docs and task pages | only `**/shots/` (`.gitignore:212`) |
| `*.jpg` | 368 · 54.8 MB | none | screenshot tools | docs | no |
| voice `v-*.jsonl` and `*.summary.json` | 21 tracked · 0.2 MB | **16 deleted** | voice system | `Server/ChatV1Compare.mjs:39` | rules at `.gitignore:104–107` and `:202–218` cover `public/framework/ai/v-*` and `public/ai/*`, **not** `public/framework/<module>/ai/v-*` |
| root `Temp_*` | 0 | 11 untracked · 184 KB | nothing in code (`grep -rln "Temp_" Server Servex` gives no hit) | nothing | no |

## 2. Does the static site need each machine-written kind?

- **`files.jsonl`: needed by the deployed site, cannot be derived there.** Readers that run in the browser: `public/framework/ext/files/fs.js:52` (says it "only works on the dev server" when the file is missing), `ext/files/files.js:62`, and `public/framework/ai/AISession/AISessionCoverage.js:61`, which fetches `files.jsonl` from `location.origin`. A static host has no directory listing, so it must stay in git. It is also derivable on the dev server, so the dev server should write it only where a reader needs it. Not undeniable on the "derivable" half. Questionable.
- **`task.jsonl`, `session.jsonl`, `page.jsonl`, `inbox.jsonl`:** read by the live pages (`core/Item`, `ai/` pages), so they must be deployed. Keep them tracked. This is what the commit-rule says and what the sweeper does.
- **`past-work.md`, `review.md`, `diff.patch`:** no browser reader found. `diff.patch` appears only in review tooling and in tracked task folders. Derivable: `Server/PastWork.mjs` (header line 1: "computed by node Server/PastWork.mjs; do not hand-edit") can regenerate `past-work.md` at any time. Undeniable for `past-work.md`.
- **`*.jpg` and `*.png`: 102 MB tracked.** Repo-size doc already says the same thing (`public/framework/ai/doc/repo-size.md`, cited by the commit-rule). Not in the owner's question; mentioned because it is the largest weight in git.

## 3. Why untracked task files stay untracked

`public/framework/ai/sessions/doc/commit-rule.md` says: "code, briefs, readmes, docs: never swept: committed by the agent that wrote them." That is the gap.

- `Servex/LogSweeper.js:45` has `DENY = [ /…\.(js|mjs|css|html|md)$/ … ]`. So the sweeper will never commit `.md` or `.js`, which covers `past-work.md`, `review.md`, `requirements.md` and `page.js`. Receipt: the sweeper's own classification (run read-only against `git status`): `?? .md` 101 not swept, `?? .js` 27 not swept.
- `past-work.md` is written by Servex itself at spawn (`Servex/agents/Agents.js:308`), so no agent is there to commit it. Undeniable: 74 untracked now.
- `review.md` and `page.js` are written by tools, not the agent, and the agent that finishes does not always commit them.
- Who is meant to commit: the commit-rule says the agent. In practice, nobody does for generated files, and 312 `past-work.md` are tracked (committed by hand at some point), so the rule is followed only sometimes.

## 4. The 16 deleted lines

`git status` shows 16 `D` entries: 12 `.jsonl` and 4 `.summary.json`, all under `public/framework/<module>/ai/v-*`. Receipts: `git status --porcelain | grep '^ D'`.

- They are still in HEAD (last commits `434dd0d04a` 2026-10-13, `80b8a9ba90` 2026-10-08), but gone from disk. Nothing in the sweeper deletes (`LogSweeper.js`, header: "Never deletes anything"). So someone or something removed them outside git.
- Whether they are meant to be gone: **questionable.** The commit-rule says voice logs are records ("`public/ai/*.jsonl` (voice logs) … committed"). But the `.gitignore` rules for voice logs name `public/framework/ai/v-*` and `public/ai/*`, not `public/framework/<module>/ai/v-*`. So the rule and the ignore file disagree. Only 1 `v-*` file now exists on disk under `ai/`. Recovering them is `git restore -- <paths>`; I did not run it.

## 5. Findings that are undeniable

- **U1. The commit-rule says `*.summary.json` beside voice logs is gitignored; it is not.** Receipts: `git check-ignore -v public/framework/ext/Chat/ai/x.summary.json` prints nothing; `git ls-files | grep -c 'summary\.json$'` gives 50 tracked. The rule and the ignore file disagree. (`public/framework/ai/sessions/doc/commit-rule.md`, table row "`*.summary.json` next to a voice log".)
- **U2. Untracked generated files that the sweeper cannot commit.** `past-work.md`: 74 untracked, 583 KB, computed by `Server/PastWork.mjs` (header line 1 of the file). Receipt: `git status --porcelain | grep '^?? .*past-work.md' | wc -l`.
- **U3. Root scratch files.** `Temp_*` at repo root: 11 untracked, 184 KB, mtimes 2026-10-24 23:03–23:11. No code writes or reads them (`grep -rln "Temp_" Server Servex` returns nothing). Receipt: `ls -la Temp_*`.
- **U4. `.gitignore` does not untrack what it ignores.** `.gitignore:212` (`**/shots/`) is meant to keep screenshots out, but 213 tracked files sit under `/shots/` (`git ls-files | grep -c '/shots/'`). Ignore rules only affect untracked files, so this is expected; the fix is `git rm --cached`, which is a history decision.
- **U5. `voice-research` worktree is broken.** `git worktree list --porcelain` shows it as `locked initializing`, and `git -C C:/Code/lew42/worktrees/voice-research status --porcelain` gives 26,499 `D` entries (20 untracked). Its files exist on disk, but its index is empty. This one worktree is most of the "thousands" count. It also contains a stray folder whose name is a Windows path with the slashes removed (`UsersmikeAppDataLocalTempclaude…`), which points to a bad path join.
- **U6. Worktree copies of records are never swept.** `LogSweeper` sweeps only its own root (`Servex/LogSweeper.js:16`–`:21`, `this.root`), which is the main tree. Per-worktree `status --porcelain` counts: qf-6 248, qf-1 185, qf-5 179, qf-2 178, qf-7 176, test-view 162, data-shapes 162, mb-chatv3 161, item-tool 151, readmes-page 86, chat-view 68, data-shapes-2 52, browser-refs 36, one-writer 28. Sum excluding `voice-research`: about 2,327. Receipt: the loop `for w in $(git worktree list --porcelain …)`.
- **U7. Main-tree split.** Counted with the sweeper's own `allowed()` (run read-only): 202 changed entries are eligible for the next sweep; 253 are not (101 `.md`, 27 `.js`, 43 folders, 20 `.png`, 11 `Temp_*`, 12 deleted `.jsonl`, 4 deleted `.json`, others).

## 6. Questionable (needs a decision)

- **Q1. `public/public/` (4 untracked entries, dated 2026-10-25).** A path with the repo prefix doubled, for example `public/public/framework/ai/sessions/2026/10/25/session-e06424f1/` with a 22-byte `files.jsonl`. I did not find the writer. Likely a script that joins an absolute path onto the repo root twice. Needs a search for the join, not guessing.
- **Q2. Whether the 16 deleted voice logs should come back.** See section 4.
- **Q3. Whether `files.jsonl` should keep being committed (3,922 files, 4.1 MB).** The static site reads it (section 2), so yes unless the Files tab and Coverage tab are changed to not need it. That is a design change, not cleanup.
- **Q4. Sweep interval.** The sweeper runs every 30 minutes (`SERVEX_SWEEP_MIN`, default 30), so about 125 `task.jsonl` and `session.jsonl` show as modified between sweeps. A shorter interval reduces the snapshot count but adds commits. Owner's call.
- **Q5. Stale worktrees.** Several are `locked` (`browser-refs`, `chat-view`, `data-shapes`, `deprecate`, `item-tool`, `one-writer`, `test-view`, `voice-research`). Whether they can be returned or removed is for the owner. Do not remove without asking.

## 7. Ranked recommendations (undeniable only, biggest reduction first)

Each item says: what to ignore, what to stop writing, what to commit, what to archive. Each has the check that would prove nothing broke.

1. **Fix the worktree and the broken index (U5, U6).** Biggest single drop in the "changed" number, since it is the sum across worktrees. Options, for the owner to choose: rebuild its index with a `git reset --mixed HEAD` inside that worktree (index only, files on disk untouched, but it is a git reset, so it needs a go-ahead), or return it with `return_worktree` once the locking agent is confirmed gone. Proof: `git -C <worktree> status --porcelain | wc -l` drops to near zero for that worktree, and `git -C monorepo status --porcelain` is unchanged. This does not change any file.
2. **Stop the generated `past-work.md` from showing as untracked (U2).** Smallest change: add `**/past-work.md` to `.gitignore`, because `Server/PastWork.mjs` regenerates it. 74 files leave `git status` at once. Proof: `node Server/PastWork.mjs --task <dir>` rewrites the same file on any task folder. What generates them again: `Servex/agents/Agents.js:308` at every spawn; the ignore rule stops the untracked report without changing the writer.
3. **Move the root `Temp_*` files aside (U3).** Move the 11 files to the session scratchpad. Reversible. 11 files leave `git status`. Proof: `grep -rln "Temp_" Server Servex` still returns nothing. What generates them again: nothing automatic; they were hand-written on 2026-10-24.
4. **Make the ignore file match the commit-rule (U1).** Either add `public/framework/*/ai/v-*.summary.json` to `.gitignore` (and stop tracking the 50 `summary.json`), or change the rule. This is a decision, so it goes to the owner as a question. Proof of the mismatch: `git check-ignore -v <path>` as above. What generates them again: the voice pipeline writes `*.summary.json` next to each `v-*.jsonl` (commit-rule table).
5. **Restore or formally delete the 16 voice logs (section 4, Q2).** Restore with `git restore -- <paths>` if the owner wants them; otherwise `git rm` them as one reviewed commit. Either way they leave `git status`. Proof: `git status --porcelain | grep -c '^ D'` drops to 0. Not run.
6. **Decide `public/public/` (Q1).** Find the join that doubles the prefix, fix it, and move the 4 entries aside. Proof: `git status --porcelain public/public` gives nothing after the move.
7. **Images (U4).** Tracked screenshots are 102 MB of git history. Untracking the 213 `/shots/` files with `git rm --cached` removes them from future history size but not from history. Repo-size doc already has the plan. Not a `git status` change.

Not recommended from this census: changing the sweep interval (Q4), changing `files.jsonl` (Q3), or removing worktrees (Q5). These need the owner.

## Method

- `git status --porcelain`, `git ls-files`, `git worktree list --porcelain`, `git check-ignore -v`, `git log` by path.
- A read-only node script (run from the shell, deleted afterwards) that loaded `Servex/LogSweeper.js` and called its `allowed()` on each `git status` path, and a second one that counted tracked and changed files by kind with sizes.
- Grep for writers and readers: `Servex/agents/Agents.js:308`, `Server/plugins/PageFiles.js:30`, `Servex/LogSweeper.js:27–45`, `ext/files/fs.js:52`, `AISession/AISessionCoverage.js:61`.
- Not done: no file was changed, restored or removed; no server or browser started; I did not run `git restore` on the deleted voice logs.
