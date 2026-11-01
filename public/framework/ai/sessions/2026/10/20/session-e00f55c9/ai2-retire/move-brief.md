# Do the ai2 move (the owner, 2026-11-01: "do the move… we don't want to delete data. We don't want to duplicate data. We should have one dated folder structure")

Read [audit.md](audit.md) and [move-plan.md](move-plan.md) in this folder first, then [audit-ai2.mjs](audit-ai2.mjs). Wait to start until the main tree has GitHub's michael/dev: run `git merge-base --is-ancestor origin/michael/dev michael/dev`. If that fails, check again every 2 minutes, for up to 40 minutes.

## Do, as one node script (`move-ai2.mjs`, in this folder), `--dry-run` first

1. **The missing lines (295 lines into 14 files, per move-plan.md):** append each line the store lacks to its destination with `node .claude/hooks/append.mjs`. Never rewrite a file, and never add a line the destination already holds.
2. **The 794 duplicate session folders:**
   - **The 60 with files the kept folder lacks:** copy those files into the kept folder (or append the missing lines, for a `.jsonl` that exists in both).
   - **Every extra folder:** move it with `git mv` to `public/framework/ai/archive/session-twins/<old path>`, which is outside the store, so nothing counts it twice. Delete nothing.
3. **The ai2 records:** the stubs and logs under `public/framework/ai2/` move with `git mv` to `public/framework/ai/archive/ai2-folder/`.
   - Leave `public/framework/ai2/card.js` and `page.js` in place for now: 531 saved cards still name `/framework/ai2/card.js` as their class. List that as the next step; don't do it.

**Changed (the owner, 2026-11-01: "we don't want stale, duplicate data"):** no archive copies.
- **A file byte-identical to one in the kept folder:** `git rm` it, and record its path and sha in `manifest.json`.
- **A generated cache that differs** (`index.json`, `cache.jsonl`): confirm that its script regenerates it, then `git rm` it.
- **Anything with lines found nowhere else:** merge those lines into the kept folder first, then remove the old copy.
- **The ai2 stubs and logs:** the same. Merge any unique lines into the store, then `git rm`.

Git history is the backup.

## Prove it

- **Before and after, compute for the whole store:**
  - the count of distinct session ids;
  - the total lines across all `.jsonl` files;
  - the `index.json` dollars, counted once per id.

  No id may be lost, and no line may be lost (lines may only be added).
- **Write `manifest.json`:** every old path → new path, and every appended line with its destination.
- **Write `move-report.md`:** one screen, the before/after table first.

## Fences

- **Main tree:** these are records.
- **No `python`:** use node only. Delete nothing; use `git mv` or append only.
- **Commit by path** (the moved paths plus your files), then `git push origin michael/dev`. If the push is refused, `git pull --rebase` is NOT allowed. Report it instead.
- **Budget:** about $15.
