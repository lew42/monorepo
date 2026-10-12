# ai2-merge state

Done (branch worktree/ai2-merge, commit "merge AI 2 into AI"): inventory, one migrate script, 53 files moved, 23 shims, 62 files rewritten, old page logs archived, readmes updated. Headless check of /framework/ai/, /framework/ai2/, /framework/ai2/log/ and a card page: no page errors, no 404 except generated usage.json/tasks.json (absent in any fresh worktree).
Left: review report, merge to michael/dev, remove worktrees ai2-merge and ai2m.
Decision: kept ai2/page.js as the route alias (alternative: a redirect, which would break the Page url logic); class files keep their lowercase names (renaming to one-class-per-file is a separate step, many callers).
