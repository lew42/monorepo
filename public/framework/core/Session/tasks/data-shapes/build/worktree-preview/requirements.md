# Build F: a worktree waiting for review stays up and opens on the owner's phone, NOT merged

**The owner (ask 45):** "we should be able to have a dev server for each worktree… so that I can click through to it" from the phone.

[../phone-preview/study.md](../phone-preview/study.md) found three things, and recommends option A plus keep-alive:
- the phone reaches the main site over the home Wi-Fi;
- worktree servers bind to loopback only;
- Servex deletes a worktree folder at landing, before the owner can look.

## Setup

`git worktree add C:/Code/lew42/worktrees/worktree-preview -b worktree/worktree-preview michael/dev`, then lock it. This is Servex and `Server/` code. It goes live only at a Servex restart, which the owner does after merging, never during a voice call.

## Scope (the study's section 4)

1. **Hold until merge:**
   - in `Servex/Worktrees.js` `judge()` and `Server/Worktrees.mjs`, a task that has landed but isn't merged stays open;
   - `Server/on-landing.mjs` skips `--archive --now` for an unmerged branch;
   - the 48-hour backstop stays.

   This must not keep pool slots (`qf-*`) from recycling.
2. **Exempt from `stop_idle`** while open and unmerged.
3. **Bind to the LAN while waiting** (`HOST=0.0.0.0` at `Servex/Servex.js:428-433`), only when the task asks for a preview (`{"assign":{"preview":true}}`). The LAN socket stays push-only, as it already is for the main site (`dev/Socket/doc/lan.md`).
4. **Show the link:** the landing line and the ready-to-merge card carry `http://<LAN IP>:<port>/…`, computed, not typed.
5. **Tests:** a landed but unmerged worktree survives `judge()` and `on-landing`; a merged one is still cleaned; a pool slot still recycles. Use a scratch repo in your scratchpad, never the real worktrees.

## Fences

- **Never touch the real worktrees or Servex's running state.** No restart. Never print a token or secret.
- **Don't merge.** When done: run `node Server/review.mjs <this task dir> <worktree>`, answer every finding, and land with the branch, tests, review phrase and the exact restart note for the owner.
- **Budget:** about $30. Spawn no one but the reviewer. **Finish by about 21:00.**
