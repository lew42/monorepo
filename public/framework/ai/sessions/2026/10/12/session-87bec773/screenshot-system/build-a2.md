Budget: $10

# Build A2 — Diff that sees movement (Sonnet minion, worktree)

**Why:** the first real run (`body{padding:3em}` on `/framework/ext/Figma/`) lit up 130 regions at 1920: when padding grows, everything below and right of it shifts, so a pixel diff paints the whole page red. A model reading that overlay learns nothing. The owner's question is "the padding grew here", so the diff must say **what moved, by how much**, separately from **what is new or gone**.

Read [plan.md](plan.md) and `public/framework/ext/Shots/Diff.mjs` (it is merged on `michael/dev`). Load the `code` skill.

## Build (fence: `Diff.mjs`, `Shots.mjs` only where it prints/logs the diff, `Server/shots.mjs` output, `Shots.test.mjs`)
1. **Per-cell displacement:** for each changed cell, search the BEFORE image for the best match within ±64 px (downsample by 4 for a coarse search, refine at full size around the best). A cell whose best match is near-perfect at a nonzero offset is **moved (dx, dy)**; one with no good match is **changed**.
2. **Group:** neighbouring moved cells with the same offset (±2 px) merge into one moved region; changed cells merge as today. Sort by area; keep at most 8 of each in the log (with a count of the rest).
3. **Overlay:** moved regions tinted blue with the offset written as a label is NOT possible without a font — instead draw a short line (arrow shaft) from the region's old top-left to its new one, and box the region in blue; changed regions stay red. Keep the faded AFTER image underneath.
4. **Log line:** `diff` gains `moved:[[x,y,w,h,dx,dy]]` and `changed_regions` (rename nothing else; keep `regions` = the red ones for the view). CLI prints e.g. `1920: moved 3 regions (largest 1400×900 by +48,+48), changed 2 (largest 300×40 at 120,60)`.
5. **Height change** stays its own line.
6. Test: synthetic image where one block shifts by (10, 20) and another is recoloured → one moved region with that offset, one changed region.
7. Re-run the real two-round case and report the new CLI line per width; open `diff-1920.png` and check it reads as "content moved by the padding" with few red boxes.

Commit in your worktree (`node Server/worktree-up.mjs screenshot-build-a2` if `take_worktree` has no slot; base it on local `michael/dev`). Do not merge. Reply under 200 words: branch, commits, the CLI lines before and after.

## Also: answer the review (`review.md` beside this brief)
Work in the EXISTING worktree `C:\Code\lew42\worktrees\screenshot-build-a` (branch `worktree/screenshot-build-a`) — it is not merged yet; one merge lands both. Its unrelated dirty `files.jsonl`/`page.jsonl` changes are a background indexer's: never commit them; `git checkout -- <those files>` in that worktree before you finish so the tree is clean.
- **[fix] 1:** keep the normal viewport height; `page.screenshot({fullPage:true})`, then crop to 4000 px with `PNG` (no viewport resize).
- **4:** empty `runs.jsonl` of the throwaway test round before committing (the real rounds will be re-shot after merge); the region cap in step 2 above covers the 100+ regions.
- **5:** tidy `files.jsonl` (one `runs.jsonl` entry).
- **6:** a round id that already exists gets a `-2` suffix; read the log once per `rounds()` call, not per line; `as_url` drops `?query` and `#hash`.
Then record each answer as the review tool expects (read `node Server/review.mjs`'s header for the answer line), commit.
