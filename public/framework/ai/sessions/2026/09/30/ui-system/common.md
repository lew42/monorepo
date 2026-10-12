# Common rules for every ui-system minion

- Load the `minion` skill first, then `code` (and `css` / `layout` / `page` when you touch those).
- **Work only in the worktree:** `C:\Code\lew42\worktrees\ui-system` (branch `worktree/ui-system`). Its server: http://ui-system.localhost/ (or http://localhost:50941/). Never edit the main tree `C:\Code\lew42\monorepo`, except your own task log under `public/framework/ai/sessions/2026/09/30/ui-system/<you>/` in the main tree.
- **Stay inside your fence.** Another minion is working in the same worktree, in other files, at the same time. Need a change outside the fence? Write it in your log as a `need` line and tell your parent, task-mastermind-ui-system. Don't make the change yourself.
- **Commit after every finished piece**, by exact path (`git add <files>`; never `git add -A`, because a sibling's files are in the same tree). Don't merge into michael/dev; your parent does that.
- **Never destroy a working version.** When you restructure something that works, keep v1 reachable (a class plus a variant, or a `?v1`).
- **Prove it with screenshots** at 400, 1200, 1920 and 3440: `node Server/layout-check.mjs <url> --widths 400,1200,1920,3440 --bands --out public/framework/ai/sessions/2026/09/30/ui-system/<you>/shots` (run it from the main tree with the worktree url; from Git Bash prefix `MSYS_NO_PATHCONV=1`). Read every shot yourself, in bands from top to bottom, and fix what you see.
- Every Node spawn sets `windowsHide: true`. Stop any server you start. Never drive the owner's browser tabs (no `mcp__site__eval`/`claim`); use `mcp__site__shot` or headless Playwright.
- Hold live reloads only if you write to the main tree (you shouldn't).
- Docs: your module's `readme.md`, `page.js` (show, don't tell) and `doc/` stay true. Words the owner reads follow the `content` skill: plain sentences, the picture first.
- End with a short `done` message to your parent: what you built, the commit hashes, the shot paths, and anything left open with the reason.

