# Repo size: what git holds, and the plan to slim it (2026-10-13)

**Screenshots are the problem; the session logs are not.** Pictures are 84% of git history. Every text record, all sessions included, is 30 MB. GitHub is nowhere near a limit yet, but the AI log adds about 350 MB of pictures a month, and the deployed site is 381 files short of the free file cap of its host, Cloudflare Workers (static assets).

⚠️ **Before the next push:** the next push sends ~127 MB of pictures that are already committed. Ignoring them now does not take them out of commits already made; only the [unpushed-only rewrite](#the-smaller-variant-rewrite-only-what-is-not-pushed) does, and it has to run before the push. That is your call.

| Measure (morning of 2026-10-13, `node Server/repo-size.mjs`; the numbers move every hour, re-run the script for today's) | Size |
|---|---|
| `.git` on this machine | 762 MB (608 MB packs + 139 MB in `.git/worktrees`, the per-worktree indexes) |
| All history, packed | 474 MB: **screenshots 397 MB**, session text 30 MB, framework code 16 MB |
| A fresh checkout of HEAD | 583 MB, of which images 447 MB |
| On GitHub now (last push 2026-10-02) | 305 MB |
| The next push of `michael/dev` | 1,699 commits, ~160 MB (127 MB of it images) |
| Files the site deploys (`public/`) | 19,619 of the 20,000 Cloudflare Workers Free allows |

The two totals agree: summed packed blobs (474 MB) plus trees and commits (134 MB) make the 608 MB of packs. The full run, every table: `node Server/repo-size.mjs` (read-only, about 10 seconds). The task log with each decision: [task.jsonl](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/repo-size-plan/task.jsonl).

---

## What should be committed

The rule stays the one in [commit-rule.md](../sessions/doc/commit-rule.md): a record is committed, a cache is ignored. The numbers add one line to it: **a screenshot is never committed under the AI log.**

| Kind | All its versions, packed | Verdict |
|---|---|---|
| Screenshots in `public/framework/ai/` (Playwright output and the pictures task reports show on their cards) | 309 MB | ⚠️ stop committing (done: `.gitignore`). Images inside any `doc/` folder stay committed. A report picture now lives only on the machine that took it; the AI log is dev-only, so the site loses nothing. |
| `task.jsonl`, `page.jsonl`, `log.jsonl`, `day.jsonl`, `board.jsonl` | 9.8 MB | keep: the decision path (the sweeper commits all but `board.jsonl`, which is not on its allowlist) |
| `files.jsonl` folder listings | 4.2 MB | keep: the static site reads them, and there is no build step to make them |
| `usage.jsonl` | 0.2 MB (184 KB, 1,411 lines) | keep: not a size problem, and the history is wanted |
| Transcripts, recordings, health logs, `notes/inbox/` (406 MB on disk) | 0 | already ignored |
| `owner-prompts.jsonl` (7.2 MB of your own prompts, in a 10-12 task dir) | 1.8 MB | ⚠️ slipped past the transcript rule (transcripts are ignored so your words never leave this machine); new ones are now ignored too; the one copy is not pushed yet: [your call](#the-smaller-variant-rewrite-only-what-is-not-pushed) |

---

## The plan, in three phases

| Phase | Saves | Risk | Undo |
|---|---|---|---|
| 1. Stop the bleeding | ~350 MB of history a month | low | delete the `.gitignore` lines |
| 2. Archive old sessions out of the working tree | ~670 MB of disk (Aug + Sep) | low | copy the folders back |
| 3. Rewrite history | ~310 MB of the 474 MB (the AI-log pictures outside `doc/`, 309 MB, plus `owner-prompts.jsonl`) | high: every clone and worktree | the legacy archive repo |

### Phase 1 — stop the bleeding

- ✅ `.gitignore` now ignores `png`/`jpg`/`webp` anywhere under `public/framework/ai/`, except inside a `doc/` folder, and any new `owner-prompts.jsonl`. The files stay on disk, where `Server/merge.mjs` (the script that lands a worktree) already reads the review screenshots.
- ✅ **Untracked the 2,714 pictures already tracked** (342 MB; a fresh checkout 583 → 241 MB; commit 9cc753185, script `Server/untrack-pictures.mjs`, undo `git checkout 9cc753185~1 -- <paths>`): a node script running `git rm --cached` from a manifest, dry run first. Files stay on disk; history is unchanged. Not done here: it is a commit of 2,725 deletions, and [this task's brief](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/repo-size-plan/requirements.md) said to move nothing.
- ✅ **Keep the deploy under 20,000 files** (done: `public/.assetsignore`, commit bf34ebfc5; `node Server/deploy-count.mjs` shows 16,945 → 7,928 files after both commits) (the Cloudflare Workers Free limit; Workers Paid allows 100,000): a `public/.assetsignore` with `framework/ai/sessions/` drops ~7,300 files from the upload. The AI log is dev-only (it needs [Servex](/framework/servex/), the agent system that runs on this machine), so production loses nothing it can use. Outside this task's fence; the next task should add it before the next push.
- ⬜ Records keep flowing through `Servex/LogSweeper.js` ([commit-rule.md](../sessions/doc/commit-rule.md)); nothing to change.

### Phase 2 — archive old sessions

A session older than about 30 days is moved out of `public/framework/ai/sessions/<year>/<month>/` by a script that writes a manifest of every path. A tracked folder is `git rm`'d in one commit (history keeps it); an ignored one (most of the disk, mostly `shots/`) is just moved. Where it goes:

| Where | Cost over time | Can a server query it? | Forgotten-bill risk |
|---|---|---|---|
| The E: drive (the external USB backup drive) | $0 | only when plugged in | none; but one drive, one copy |
| Cloudflare R2 (object storage) | free to 10 GB-month, then $0.015/GB-month; egress free | yes, from a Worker or a public bucket | low: 2 GB a month of growth stays free for months; set a billing alert |
| Cloudflare Workers static assets (where the site is hosted) | free | yes, as plain URLs | none; but 20,000 files and 25 MiB per file, so it needs one bundle per day, not loose files |
| A compacted summary, in the repo | ~1% of the raw size | yes, the site reads it today | none; but it loses detail (see compaction below) |

**Recommended:** the compacted summary in the repo (what the site shows), plus the raw month as one bundle on the E: drive and in R2 (two copies, one queryable). R2 needs a Cloudflare login, which is already on your list: that login is the next step, and it is yours. Until then: E: only, which costs nothing and can't be queried.

An in-memory query store (load many sessions, filter them in the UI) is a reader, not a place to keep things: it can load from any of the four above, and [ext/Query](../../ext/Query/readme.md) is where it would start.

### Phase 3 — rewrite history (your decision)

A `legacy` *branch* in this repo saves nothing: its pictures are still in `.git`. The old history has to live in a **separate archive repo**. GitHub's limits in play: a file over 100 MiB is refused, one over 50 MiB warns; a repo should stay under 1 GB and under 5 GB is strongly recommended ([GitHub docs](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)). After the next push GitHub holds ~465 MB, so this is not urgent: at the October rate (~350 MB a month) it would pass 1 GB in about six weeks **without** phase 1, and with phase 1 it barely grows.

The commands, run only after every worktree (a second checkout an agent works in, under `C:/Code/lew42/worktrees/`) has merged or been dropped. `git filter-repo` is a Python tool: `pip install git-filter-repo`.

```sh
# 1. keep the whole history as its own repo (the backup on E: is a second copy)
git clone --mirror C:/Code/lew42/monorepo E:/Projects/lew42/monorepo-legacy.git
# 2. rewrite a fresh clone, never the working one
git clone --no-local C:/Code/lew42/monorepo C:/Code/lew42/monorepo-slim
cd C:/Code/lew42/monorepo-slim
git filter-repo --invert-paths \
  --path-regex '^public/framework/ai/(?!(?:.*/)?doc/).*\.(png|jpe?g|webp)$' \
  --path public/framework/ai/sessions/2026/10/12/session-d4cd44ab/asks-by-module/owner-prompts.jsonl \
  --path .worktree-logs/
# 3. check the result, then replace GitHub's copy
node C:/Code/lew42/monorepo/Server/repo-size.mjs --root C:/Code/lew42/monorepo-slim
git remote add origin https://github.com/lew42/monorepo.git
git push --force origin michael/dev main
```

The regex keeps every image inside a `doc/` folder, the same rule as the `.gitignore` (checked with Python's `re`: `ai/doc/x.png` and `ai/sessions/doc/y.png` survive; a `shots/` png goes). `.worktree-logs/` is the old per-worktree agent logs, committed by mistake early on. The push names only `michael/dev` and `main`: the `alex`, `castin` and `edric` branches on GitHub are left for their owners to re-clone, and the 183 `salvage/` branches (work set aside instead of deleted) and 89 tags are dropped from the slim repo on purpose; the `--mirror` legacy repo keeps them all.

What breaks: every other clone, every worktree and its branch, open GitHub pull requests, and every commit id written into a `task.jsonl` (they still resolve in the legacy repo).

#### The smaller variant: rewrite only what is not pushed

Run the same `filter-repo` line with `--refs origin/michael/dev..michael/dev` added (filter-repo then rewrites only that range; check `git filter-repo --help` once it is installed, it is not on this machine yet). It strips the pictures (118 MB) and `owner-prompts.jsonl` (1.8 MB) from the ~1,700 commits since the last push, so the next push is ~41 MB instead of ~160 MB (computed by script from the unpushed blobs), and GitHub and the other clones are untouched. History already on GitHub keeps its pictures. Every worktree still has to be merged first and re-made after. Dry run it in the `monorepo-slim` clone and compare with `repo-size.mjs` before touching the working repo.

---

## Compaction (proposal, not built)

A JSONL log may be compacted when its task has **landed with no surprises**: no `kill`, no failed review finding, no `decision` overruled later, nothing still linking to one of its middle lines.

- **A compacted record keeps** the brief link, every `decision` line whole, the outcome, every link it produced, the review tally, and a count of the lines it replaced (`{"compacted":{"lines":412,"from":"…","to":"…"}}`).
- **It loses** the step-by-step deltas: each `now`, each progress `log`, each page edit between the first and the last.
- **The one rule that keeps the decision path:** a decision line, and the line just before it, are never compacted. The raw file goes to the phase-2 archive before the compacted one replaces it, so it is never destroyed.

---

## Open: the framework's future shape (your decision)

You named two shapes; neither is decided.

- **Clone a blank-state monorepo.** Needs: the framework (`core`, `ext`, `styles`, `ux`, `ui`: 16 MB of packed history, 13 MB at HEAD) split from this site's content and AI log; a starter `public/` with one page; the slim history from phase 3 or a fresh one. Simple to start a site from; every site then carries its own copy, and updates are merges.
- **An npm package that Servex sets up.** Needs: `core`/`ext` published as a package served as real `.js` URLs (no build step, so it is copied or served from `node_modules`); Servex gaining a "new project" command that makes the folder, the port and the dev server; a versioning habit. Updates are an `npm update`; the cost is the publishing and the boundary between framework and site.

Either way the AI log (sessions, tasks, screenshots) stays out of the framework; that part is what phases 1–3 separate.
