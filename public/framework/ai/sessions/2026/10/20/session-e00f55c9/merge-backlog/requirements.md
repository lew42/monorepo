# Merge the finished branches that were never merged (you are a mastermind, on Sonnet, high effort)

**Why:** the triage in [../unmerged-work/triage.md](../unmerged-work/triage.md) found finished work that sat unmerged for days. The owner (2026-11-03): "those masterminds building things that never get merged in". `node Server/unmerged.mjs` lists them.

## Yours, in this order
1. **`worktree/chatv3-title-dedupe`** (2 commits; its task is already complete). Merge it.
2. **`worktree/session-twins-fix`** (8 commits, 2 conflicts; task `session-e00f55c9/session-twins-fix`).
3. **`worktree/voice-bridge`** (6 commits, 1 conflict; task `session-e00f55c9/voice-bridge`).
4. **`worktree/v1-switch-prep`** (4 commits; 6 of 8 files are already on dev). Land the 2 leftover files if they still matter; otherwise mark it superseded.

**For each branch:**
- Read its task folder (requirements, plan, review) first.
- Make a fresh worktree from `michael/dev`. Bring the branch in there and resolve the conflicts in favour of what's on `michael/dev` now. Don't redo newer work.
- Run its tests, then `node Server/review.mjs <its task dir> <worktree>`, then `node Server/merge.mjs <worktree folder>`.
- Record the outcome on its task, and in `triage.md` next to the branch.
- If one would take more than about 30 minutes, or its conflicts touch something now being rebuilt (Recite, Dictate, Chat V3, `Servex/agents/Sessions.js`), stop. Write why in `triage.md` and move on.

**Not yours:**
- `read-aloud-next` and `dictation-perf` (Recite and Dictate are being rebuilt right now);
- `dictate-plugins` (ported by `mastermind-chat-settings`).

**Fences:** commit by path; no `python -`; delete no branch or worktree. If a merge's smoke check fails because a worktree's server is down, use `node Server/worktree-restart.mjs <name>`. **Budget:** about $8. Report to vscode-mastermind (`send_to_agent`, `id: "vscode-mastermind"`) in 3 lines, then complete your task and stop.
