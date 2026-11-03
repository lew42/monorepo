# The unreferenced-files census learns the three loads a grep misses; what is still unreferenced after that is deleted

Budget: $6. Load the `sub-mastermind` and `code` skills first. The owner's words (2026-10-14): "if it's in git and it's non-destructive and it's not referenced anywhere, then boom, just delete it. We can always dig it back out if we need to." And: before deleting, one cheap agent per file looks for references a grep misses (generated paths, dynamic loads). Read `ai/doc/unreferenced-verdicts.md` first: 167 suspects, 0 dead, because the census (`Server/Unreferenced.mjs`) refuses a bare name shared by several files, and misses `page.jsonl` `place` lines and `files.jsonl` listings. Your log is this dir's `task.jsonl`.

## Deliverable

1. **`Server/Unreferenced.mjs`** counts three more references: a quoted bare name in a `.js` of the same folder (`View.stylesheet(import.meta, "card.css")`, `import "./x.js"`), a `place` value in the same folder's `page.jsonl`, and a listing in the folder's `files.jsonl`. Tests for each on a fixture; `node --check`. Re-run: the suspect list in `ai/doc/unreferenced.md` regenerates (say 167 → N in the log).
2. **The remaining N**: one Haiku call per file, under 10k tokens each, in a node loop (`Server/Brief.mjs` or the pattern in `ai/doc/unreferenced-verdicts.md`): "find any reference, including generated or dynamic; answer referenced-by <where> or dead". Sonnet spot-checks every `dead` call by reading the file and its folder.
3. **Delete the dead ones** with `Server/RetireFiles.mjs --apply` (it is scripted, has `--undo`, git keeps the history); update the checklist in `unreferenced-verdicts.md` (`- [x]` lines with the commit); `ai/doc/unreferenced-verdicts.md` top line says the new numbers. If N is 0 after step 1, say so and stop; that is a result.
4. Card (titled "Unreferenced files: census fixed, N suspects, M deleted"); landing line checked with `tail -1`; `merge.mjs`.

Fence: `Server/Unreferenced.mjs` (+ test), `Server/RetireFiles.mjs` only if it needs a fix, `ai/doc/unreferenced.md`, `ai/doc/unreferenced-verdicts.md`, the deleted files, this task dir. Sonnet, Haiku for the per-file loop. Never delete anything the census or Haiku did not name; never `git clean`.
