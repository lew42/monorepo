verdict: fix
1. [fix] Requirement 1 is short one piece: seat (h)'s table lists `Store.address()` (`core/Item/Store.js:240`, replacement "structured `from` on `move`"), and it has no `DEPRECATED (` mark; the census prints 13 marks on 11 symbols and none is `Store.address`. Add the one line, or write in the landing why it was skipped.
2. [fix] Nothing in this task folder records requirement 5's proof or the build's progress: `session.jsonl` holds only the assign line, a commit stamp and the shots line, and there is no landing, test log or smoke result. A fresh agent can't tell from the folder that tests were run. I ran them in the worktree and they pass (Item 28 assertions, List 19, Task 66/66, Session snapshot PASS, persistence 82 checks, `Deprecated.test.mjs` 6 asserts). Write those results, and the smoke result, into the landing.
3. [note] Two table rows have no mark, and the reason is sound but not written anywhere: the config key `children:` and `{"file":x}` both have an undecided replacement. Say in the landing that they were left on purpose.
4. [note] Neither guide the `List#each`/`List#children` and `Task#finish` marks point at mentions those names. `core/List/readme.md` never names the old aliases. `core/Task/readme.md:124` does say "`finish()` is an alias", so that one is fine. One line in the List readme would close it.
5. [note] The evidence I was given doesn't match this build. `review/diff.patch` is 5,502 lines against michael/dev, so it also contains builds A to C (ClassDoc, watch/, DefaultView). The real build G diff is `git diff integration/data-shapes...worktree/deprecate`: 58 files, +368/−2. The shots are of `monorepo.localhost` (the main tree), not the worktree, and of pages build G doesn't change. Fix this in `Server/review.mjs` (diff base and shot host for a branch made off an integration branch), not in this build.

Widths given: 400, 1200, 1920, 3440 for seven pages. None of those pages is changed by this diff, because build G adds only comments and one-line doc notes. So the page systems below are answered n/a, with the shots kept only as context.

## Requirements
- 1 "one comment line at the definition, worded the same everywhere" — partly. 13 marks, all in the exact `// DEPRECATED (2026-10-28): use … Guide: … Remove when: ….` shape (census: 0 incomplete, 0 with a missing guide). `Store.address()` is unmarked (finding 1).
- 2 "Docs that still teach the old way get one line … linking the replacement" — yes. 44 `Old way (deprecated` lines across `core/Page/doc`, `core/Sidebar`, `ext/Doc/doc`, `ext/demo/doc`, `web/nav` and others, with no example rewritten.
- 3 "Move each guide beside its module, linked from its readme; seat copy stays with a pointer" — yes. `core/Page/doc/migration-children-to-pages.md` (+111 lines) is listed in `doc/files.jsonl` and linked from `core/Page/readme.md` "More", and the seat copy has a "Moved (2026-10-28)" line. The Saver guide is honestly marked "still to write" in `ext/Saver/readme.md`, matching the seat table's "to write".
- 4 "A census script `Server/Deprecated.mjs`, with a dry run, every mark with its live caller count" — yes. It runs as a dry run by default, prints a count per mark (e.g. `page.children` 187 lines in 104 files), has a test, and is indexed in `Server/README.md`.
- 5 "Prove nothing changed in behaviour" — yes, but not recorded. The diff touches only comments and markdown, and the tests pass when rerun (finding 2).
- Fence "comments and docs only, no renames, no removals" — yes. Every `.js` hunk is a `+// DEPRECATED` line; the only `−` lines are the two edited lines in `core/Page/readme.md` and `doc/rules.md`.
- Fence "Don't merge" — yes. `worktree/deprecate` is at 83e16b26a on top of `integration/data-shapes` (10d1a6a48) and not merged.
- New class: n/a (no class added or changed).
- Readmes and docs of the touched modules: `doc/rules.md` gains the mark format and the log-reader clause, `Server/README.md` indexes the script, and the Page, Sidebar, Saver and web/nav readmes say "old way". The gaps are findings 1, 2 and 4.
## Page structure
- n/a — no page changed
## Navigation
- n/a
## Layout
- n/a
## Sizing
- n/a
## Wrapping
- n/a
## Spacing and padding
- n/a
## Colour and contrast
- n/a
## Flow
- n/a
## Words
- content: plain, one idea per line — yes. Each "Old way" line says what is old, what replaces it and links the guide (e.g. `core/Page/readme.md` line 3).
- Consistent wording so a search finds them — yes. The same sentence is used in every doc that teaches `page.children`, and the same comment shape in every code mark.
- The doc line's "this page teaches or uses `page.children`" is a little vague on readmes that only mention it once — note only, no finding.
