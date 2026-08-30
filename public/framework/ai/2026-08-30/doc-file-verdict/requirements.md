# doc-file-verdict

Verbatim ask:

The `doc/file/*.md` question: 371 files, 734KB, 19% of all framework markdown, and per the
simplify audit "the only mass nobody has ever questioned" (ai/2026-08-30/simplify-audit/proposal.md).

Answer with numbers:

1. Who reads them - find the renderer (ext/Doc's Files tab? doc/file/ naming convention -
   trace the code path from a Files tab click to the .md); are ALL 371 reachable from a
   rendered tab, or are some orphaned (belonging to deleted/moved source files - cross-check
   each doc/file/*.md against the source file it documents; count the orphans)?
2. Staleness sample - pick 12 across modules: does the .md still describe the current file
   (line counts, API names)? Score each fresh/stale/wrong.
3. Value sample - for 5 of the fresh ones: does the doc say anything the file's own comments
   don't?
4. The verdict, one of: keep (earning their bytes), prune-orphans-only (N files), or
   propose-retirement (with what replaces them - e.g. the Files tab rendering the source's
   own header comment). If retirement: what breaks (the files: declarations reference them?),
   the migration cost.

Report: the renderer path, reachable/orphaned counts, the 12-sample staleness split, the
verdict with its one-line justification.

Scope: read-only investigation, no repo edits outside this task dir. No server restarts,
no owner tabs driven, no stash, no commit.
