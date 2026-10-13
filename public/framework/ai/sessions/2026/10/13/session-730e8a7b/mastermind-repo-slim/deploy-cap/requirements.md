# Deploy cap and tracked pictures: finish phase 1 of the repo-size plan

Budget: $10. Load the `sub-mastermind` skill first. The plan you are executing is `public/framework/ai/doc/repo-size.md` ("The plan, in three phases", phase 1, and the two ⬜ items under it); the owner's raw words are in `../requirements.md` (ask 3: reduce the repo, never destructive, back it up first: the backup is at `E:/Projects/lew42/monorepo-2026-10-13/`, taken 15:53 today). Your log is this dir's `task.jsonl`.

## Facts (from repo-size.md, 2026-10-13)

- The deployed site (`public/`) is 19,619 files; Cloudflare Workers Free stops at 20,000. The AI log under `public/framework/ai/sessions/` is ~7,300 of them and is dev-only (needs Servex).
- 2,725 screenshots (343 MB of every checkout) are tracked under `public/framework/ai/`; `.gitignore` now stops new ones (5e471fa3b) but the tracked ones stay tracked until untracked.
- Deploy config: find it (`wrangler.*`, `readme.md` root "deploy" section, `.github/workflows`) and read how `public/` is uploaded before you write `.assetsignore`.

## Deliverable

1. **`public/.assetsignore`** (Cloudflare's syntax, like .gitignore): exclude `framework/ai/sessions/`, every `shots/` dir, and the other pictures the plan names; commit it with a one-line comment per rule. Prove the count: a node script (`Server/deploy-count.mjs`, read-only) that applies the ignore rules and prints files-before, files-after, and the margin under 20,000. Two numbers that must agree: its "before" vs `git ls-files public | wc -l` (roughly; say why they differ if they do). Check that nothing the site links to at runtime (a `files.jsonl`, an image a `doc/` page shows) is excluded: run `Server/smoke.mjs` on `/framework/ai/` and one `doc/` page with images.
2. **Untrack the tracked pictures** (`Server/untrack-pictures.mjs`): `--dry` prints a manifest (path, size, blob hash) to this task dir; `--apply` runs `git rm --cached` from that manifest in batches and commits once: `untrack: 2,725 pictures under the AI log stay on disk, leave the index (repo-size.md phase 1)`. Files stay on disk; history is unchanged; undo is `git checkout HEAD~1 -- <paths>`. Only paths under `public/framework/ai/` that match the new `.gitignore` picture rules; never a `doc/` image. Then `git status` must be clean for your files and `du -sm` of a fresh `git ls-files` set shows the drop (log it).
3. **Report** on your card: files deployed before/after the cap, MB untracked, the undo line, links. Add the two ⬜ → ✅ in repo-size.md with the commit hashes.

Fence: `public/.assetsignore`, `Server/deploy-count.mjs`, `Server/untrack-pictures.mjs`, `public/framework/ai/doc/repo-size.md` (the two checklist lines only), this task dir. Work in a worktree (`take_worktree`), `merge.mjs` to land. Never delete a file from disk, never rewrite history, never push.
