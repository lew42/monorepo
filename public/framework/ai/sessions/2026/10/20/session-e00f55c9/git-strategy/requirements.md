# The Git branching strategy: a proposal (you are a mastermind, on Sonnet)

**The owner (2026-11-01, about 21:45, [../night-2026-11-01/requirements.md](../night-2026-11-01/requirements.md), point 10):**
- Local `main` should match GitHub's `main`. Develop on a branch, not on main, and don't serve main as the work tree.
- `michael/dev` blocks a plain `michael` branch, because Git can't have both `x` and `x/y`. Maybe use `michael-dev`.
- The Cloudflare preview branches matter.
- The owner dislikes merges, so pull into main first, browse it, then merge locally.
- "We kind of got stuck on the michael/dev branch for a long time."
- "Study what we got, study the notes in there, do some web searches, and figure out what we need to do."

## Do: a proposal only
This is major surgery: no branch renames, no pushes to `main`, no deploy changes.
1. **Read what exists:**
   - the root `readme.md` (branches, deploy);
   - `Server/merge.mjs` and its docs;
   - `git branch -a`, `git worktree list`, and the remotes;
   - the Cloudflare Pages settings, if they're written down (grep "preview", "pages", "wrangler", "deploy");
   - any earlier notes on branch strategy (grep "branch strategy", "michael/dev", "main branch" under `public/framework/ai` and `doc/`).
2. **Research briefly on the web:** trunk-based development with short-lived branches; Cloudflare Pages preview branches; the `x` vs `x/y` ref-name limit. Use 3–5 searches, no more.
3. **Write `public/framework/doc/git-strategy.md`** (or next to wherever branch notes already live), linked from the root `readme.md`'s branches section:
   - today, as a picture;
   - the problems, in the owner's words;
   - two or three options, with the trade-offs for someone who dislikes merges;
   - the recommended one;
   - the exact migration steps, as commands, marked "run only after the owner says go";
   - what changes in `merge.mjs` and the agent rules.

**Fences:** docs only, committed by path to `michael/dev` and pushed. **Budget:** about $6. Report to vscode-mastermind in 3 lines: the recommendation and the one decision the owner must make.
