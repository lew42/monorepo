# Object-oriented review: what is still not a class and should be, ranked; the top five made classes

Budget: $10. Load the `sub-mastermind` and `code` skills first. The owner's words: `../requirements-13.md` ask 5 (verbatim there): "there's still a lot of stuff that's not object-oriented that should be… review most of what we've done and make sure it's been done properly". CLAUDE.md: classes are the structure; one class per file named for the class; no lowercase function bags. What exists: `code/patterns/function-bag-census.mjs` and `class-census.mjs` (the census scripts), `Server/doc/scripts.md` (the scripts side, finished today), `ai/doc/architecture.md`. Your log is this dir's `task.jsonl`.

## Deliverable

1. **The census, by script**: run `function-bag-census.mjs` over `public/framework` (and `Servex/agents`, `Server/plugins`), rank every function-bag file by importers, and write `code/patterns/doc/oo-census.md`: the table (file, exports, importers, the class it should be, size), the rule it breaks, in one line each; a Haiku pass (one per file, under 20k) names the class and its API for the top 20; you check the top 10.
2. **The top five become classes** where the change is contained (under about 10 callers each; no core API renames, which are ask-first): file named for the class, a one-line shim at the old path so nothing breaks, callers updated by `Server/RenameScript.mjs` with `--plan` first; `node --check`, tests green, the pages that import them opened headless; one commit each.
3. **"Done properly" spot check**: for ten modules landed in the last two weeks (pick by `git log`), does the readme match the code, does the page open, does `doc/architecture.md` name the classes that exist? A line each in the same doc, fixes under five minutes made on the spot.
4. Linked from `code/patterns/readme.md` and `ai/doc/architecture.md`; card (title "Object-oriented review: N function bags ranked, 5 made classes, 10 modules spot-checked"); landing line checked with `tail -1`; `merge.mjs`.

Fence: the five files and their shims and callers, `code/patterns/doc/oo-census.md`, one readme line, the spot-check fixes (named in the log), this task dir. Sonnet; Haiku for the scans.
