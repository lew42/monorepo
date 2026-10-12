# review — improvements

- 2026-10-12 (mastermind-refine-haiku-live): `Server/review.mjs`'s one-file-API check scans the whole tree, not the task's diff, so three old raw writes under ai/sessions/2026/08-09 (layout-primitives, day-audit, inventory rows.js) block every review. Scope the check to the --range diff.
