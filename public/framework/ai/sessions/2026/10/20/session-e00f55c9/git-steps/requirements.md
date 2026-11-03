# Git plan steps 3 and 4: merge.mjs changes, then rename michael/dev to compliance/dev (you are a mastermind, on Sonnet, high effort)

**The plan:** [doc/git.md](/framework/doc/git.md). Read "Done on 2026-11-03" first. **The owner (2026-11-03):** go for the plan, "renaming michael/dev to compliance is a good idea", deleting the old branch is fine, and "when we make all these decisions, we don't want to just not follow up on it".

## What changed today (so don't repeat it)
- `main` was published through pull request #26.
- `michael/dev` and `main` sit at the same commit (b816f9f27, later commits on top).
- `production` exists on GitHub.
- **`lew42.com` follows `main` today,** so a push to `main` is a push to the public site. It will follow `production` once the owner changes one Cloudflare setting.
- The rule on `main` still requires a pull request.

## Step 3: `Server/merge.mjs`
1. **One place for the dev branch's name** (today `BASE = "michael/dev"`, line 77). Make it a constant every reader imports: merge.mjs, Servex, Server scripts, hooks. Find them all with a grep.
2. **Pull before pushing:**
   - before the push, `git fetch origin`;
   - if `origin/<dev>` moved, bring it in first;
   - when a push is refused, fetch, bring it in, and push again once, instead of only warning.
3. **Name the task in the merge commit,** e.g. `Merge qf-5: bold the session title`, not `Merge branch 'worktree/qf-5'`.
4. **Publish to `main`: build it, but leave it OFF** (a setting, default off) until `lew42.com` follows `production`.
   - When on, it publishes through the API, opening and merging a pull request (the route that worked for #26), because the rule requires one.
   - Afterwards, move the local `main` label forward.
   - Say in git.md how to turn it on.
- **Tests first** (a temporary repo), then the usual review and merge.

## Step 4: the rename, `michael/dev` → `compliance/dev`
- **A node script with a dry run** and a manifest of every file and setting that names the branch. Then:
  - `git branch -m michael/dev compliance/dev`;
  - push `compliance/dev`;
  - set its upstream;
  - delete `origin/michael/dev`.
- **Run it only when no agent is working:** `node Servex/sustain.mjs --restart --dry-run` lists who is mid-turn. Ask vscode-mastermind for the moment first, since the main checkout is shared. Then restart Servex and the dev server.
- **Update the docs:** the root readme, CLAUDE.md wording (a proposal only; CLAUDE.md is the owner's), `ai/doc/agent-rules.md`, `Server/doc/worktrees.md` and git.md.

**Fences:**
- Never force-push `main` or `production`.
- Never touch the rule on `main`; that change is the owner's.
- Delete no branch except `michael/dev`, after the rename.
- Commit by path; no `python -`.

**Budget:** about $10. If you're stuck after two honest tries, say so. Report to vscode-mastermind (`send_to_agent`, `id: "vscode-mastermind"`) in 3 lines per step, then complete your task and stop.
