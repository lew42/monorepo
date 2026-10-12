# doc-file-prune

Verbatim ask:

> execute the doc-file verdict's prune: `public/framework/ai/2026-08-30/doc-file-verdict/task.jsonl` has the full method and lists.
>
> 1. Delete the 37 unreachable doc/file mds: the 1 true orphan (`ext/Timeline/doc/file/ai.js.md`), the 22 dead-on-arrival under plain-Page styles modules (styles/, styles/elements/, styles/layers/, styles/layers/theme/, styles/rules/ — regenerate the exact list by re-running the verdict's reachability check, don't guess), and the 14 `core/Page/doc/file/old/overview/*` undeclared ones (decision made: DELETE — the old/ tree is legacy and the new overview replaced it; do not add them to files:).
> 2. Fix the 1 wrong doc: `core/View/doc/file/View.js.md` — its centerpiece claims `View.stylesheet(import.meta, "../../framework.css")` is the file's last line; that code moved to `public/app.js:14`. Rewrite that claim truthfully and correct the three stale line citations (should be ~469/474/478 — verify against the CURRENT View.js before writing).
> 3. Verify: re-run the reachability check — 334 reachable, 0 unreachable after; the View Files tab renders the corrected doc; a 5-module Files-tab spot check clean.

## Scope

- File ownership: this task only. No agents dispatched.
- Source of truth: doc-file-verdict's reachability method (Doc.files_section() -> browser() -> ext/files/files.js's files(meta, this.files, {about}), reachable iff path is in module's `files:` string AND module is Doc-based).
