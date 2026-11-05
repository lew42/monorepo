# Finish removing framework/ai2

Expected cost: about $3. Sonnet. The owner has asked for this since 2026-09-30, and it's been marked done without happening. The evidence is in [findings.md](../ai2-and-ai-folders/findings.md); I reran its main receipts. Read `ai/sessions/2026/10/20/session-e00f55c9/ai2-retire/audit.md` and `move-report.md`, but don't repeat their work.

## Do

1. **Settle the one open question:** are the 295 log lines the audit named now in the sessions store? Rerun `ai2-retire/audit-ai2.mjs` against the current tree. If any are missing, move them first, by script.
2. **Stop new links to ai2:** `Servex/agents/Layers.js:523` still builds `/framework/ai2/${id}/` for every card page. Point it at the real home in `framework/ai`. Update `Server/smoke.mjs:117`, `Server/review.mjs:134` and any other code that builds or checks the route.
3. **Fix the live import:** `public/framework/dev/DevBar/chat.js:4` goes through the `ai2/live.js` shim. Import from `ai/rail/live.js` directly.
4. **Keep old links working:** about 374 files mention `/framework/ai2/`, mostly old records. Don't rewrite history; make the old URLs land on the right page, including on the static production site, where no server runs. Check how the Router and static host handle this, and state what you chose.
5. **Move the folder:** a node script with a dry run and a manifest of every old and new path. `page.js` and `ai2.css` need a real decision: keep what's still used in `framework/ai`, and archive the rest. Nothing is deleted without a copy in git.

## Done means

All of these, in your report, with output:

- `ls public/framework/ai2` fails.
- A search for `ai2/` in code imports returns nothing.
- `/framework/ai2/` and one old card URL load the right page in a headless check, with no console errors.
- The dev bar's chat still loads.
- `merge.mjs` lands it, and the folder is gone on `compliance/dev`.

Don't report done before the merge. "Merged but kept on purpose" is how this has stalled before.

## Also

Finish the `framework/ai/` folder map the findings left partial: it stopped at `screenshots` on a 120 s timeout. Commit the script beside `public/framework/ai/readme.md`, link its table from that readme, and list which folders are undeniably dead. Don't move those; I'll take that list to the owner.

Update `public/framework/ai/readme.md` and `public/framework/readme.md` so neither mentions ai2 as existing. Leave zero footprint: return the worktree, close anything you started, and list what you closed.
