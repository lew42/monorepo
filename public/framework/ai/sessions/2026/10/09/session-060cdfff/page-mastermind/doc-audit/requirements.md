# core/Page doc audit: one recommendation per doc file

Budget: $1 per minion. Model: Haiku. Read only, except your own `recs.md`. Stay under 60k tokens: read each file once, and grep (do not read whole) to find related docs.

The owner (2026-10-09, 19:05) wants the page system's docs cleaned up: merged, condensed or moved where they overlap, and superseded files archived with a note.

You recommend; the mastermind (`mastermind-page-system`) decides and does the moves with a script. **Change no file except your own `recs.md`**, written in this folder (`doc-audit/`).

## What to read

1. `public/framework/core/Page/readme.md` (the module's index) and `public/framework/core/Page/doc/architecture.md` (the current class architecture and decisions; treat it as the truth).
2. Your files, named in your prompt, all in `public/framework/core/Page/doc/`.
3. For each file, grep `public/framework/core/Page/` and `public/framework/ext/` for docs on the same topic (its key words, and links to it), and skim only the matching parts.

## What to decide, per file

One verdict:

- **keep**: current, unique, and in the right place.
- **condense**: right place, but long or repetitive; say what to cut.
- **merge**: overlaps another doc; name the doc it should merge into and which one survives.
- **move**: belongs beside another module; name the folder.
- **archive**: superseded or describes a system that no longer exists; name what replaced it.

Also note: is it linked from `readme.md` or another doc (`grep -rl "<name>.md" public/framework/core/Page`)? Any claim you can see is stale (a file, class or method that no longer exists: check with a quick grep)?

## What to write

`recs.md` in your own task folder, one block per file:

```
## <file>.md: <verdict>
- why: one or two plain sentences
- into / folder / replaced by: <path, if any>
- linked from: <files, or "nowhere">
- stale: <claims checked and found wrong, or "none found">
```

"keep" with "none found" is a fine answer. Then stop.
