# Retire the eight ai/sessions/Session*.js re-export shims; one Sessions module set

Budget: $8. Load the `sub-mastermind` and `code` skills first. The owner's words: `../requirements-8.md` ask 3 ("one single data structure, no stale fragments") and `../requirements-10.md` ask 1 ("the categorization process needs to be carefully looked at"). The verdict is already in: `../ai-modules-home/module-homes.md` and its task log: "`ai/AISession` is live; the 8 `ai/sessions/Session*.js` files are 10-09 re-export shims; propose repointing their 3 importers and moving the shims aside." Your log is this dir's `task.jsonl`. CLAUDE.md: one of everything; moves are scripted with relink and undo; never destructive; link every mention.

## Deliverable

1. **Prove the verdict** on current `michael/dev`: each of the eight files (`Session.js`, `SessionDetail.js`, `SessionFollow.js`, `SessionLive.js`, `SessionRows.js`, `SessionTrace.js`, `SessionView.js`, `SessionsPage.js` under `public/framework/ai/sessions/`) only re-exports from `ai/AISession/*` (log the one line each); the importers (`ai/sessions/page.js`, `ai/sessions/system.js`, `ai/SystemClasses.js`, `ext/DataGrid/page.js`, and any `.md` link: grep) listed with file:line.
2. **Repoint the importers** to `ai/AISession/*`; `node --check` each; the Sessions page (`/framework/ai/sessions/`), the DataGrid page and the AI page load with no console FAIL (`Server/smoke.mjs`).
3. **Move the shims aside** with a script (`git mv` into `public/framework/ai/archive/retired/2026-10-13/sessions/` with a manifest, `TaskMove.mjs --relink` for md mentions, undo proven on a worktree copy); the Sessions module's readme says in one line where the detail classes live (`ai/AISession`) and that the shims are retired.
4. **The empty old tree**: `public/framework/ai/2026/` still exists as an empty `10/` and a dev-server `files.jsonl` listing; remove the empty dirs and `git rm` that listing so the folder is gone for good; if the dev server's Directory plugin recreates the listing for an empty dir, say so in your log and leave the fix as one line in `Server/doc/`.
5. `check_page` on the Sessions page at 1200; `merge.mjs`; card report; landing line checked with `tail -1`.

Fence: the eight shims, their four importers (import lines only), `ai/sessions/readme.md` (one line), `public/framework/ai/archive/retired/2026-10-13/`, `public/framework/ai/2026/`, this task dir. Sonnet.
