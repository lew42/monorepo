# Unmerged work: find every branch that was built and never merged, and keep it visible (you are a mastermind, on Sonnet, medium effort)

**The owner (2026-11-03):** "those masterminds building things that never get merged in, this is the task system that we're supposed to have." On 2026-11-03, 40 `worktree/*` branches had commits not on `michael/dev` that were more than 6 hours old. Examples: `dictate-plugins` (3 commits, finished and tested, sat 23 h), `session-twins-fix` (8), `voice-bridge` (6), `read-aloud-next` (6), `v1-switch-prep` (4).

## Build
1. **`Server/unmerged.mjs`** (law 7: compute, don't recall). For every `worktree/*` branch with commits not on `michael/dev`, list:
   - its commit count and age;
   - the files it touches;
   - whether those changes are already on michael/dev under another commit (`git cherry`, or a patch-id check);
   - the task folder that owns it (from the commit messages, `.worktrees.json`, or the task logs that name the branch);
   - that task's state.

   Output a table, and `--json`. A test against a temporary repo.
2. **Triage today's list** into `triage.md` beside this brief. One line each:
   - **merge:** worth landing; say who should;
   - **superseded:** already on michael/dev, or replaced; name by what;
   - **abandoned:** nobody needs it.

   **Delete nothing.** Never-destructive: the owner or the owning mastermind decides.
3. **Keep it visible.** A "Built, not merged" row in the In-flight block (`core/Session/InFlight.js`): a branch with work older than 6 hours whose task is in this session. Also add a line to `Servex/agents/roles/mastermind.md`: a mastermind's task isn't done until its branch is merged or marked superseded.

**Do:** test first; worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs <worktree folder>`. **Fences:** commit by path; no `python -`; no branch or worktree deletions. **Budget:** about $6. Report to vscode-mastermind (`send_to_agent` with `id: "vscode-mastermind"`) in 3 lines, with the triage counts, then complete your task and stop.
