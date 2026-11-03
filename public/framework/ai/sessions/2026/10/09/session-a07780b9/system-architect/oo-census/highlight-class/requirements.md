# Code: turn `highlight.js` into the class `Highlight`

Queued by the [OO census](/framework/ai/sessions/2026/10/09/session-a07780b9/system-architect/oo-census/) (pick 8 of 10). The owner, 2026-10-09: classes and class hierarchies over lowercase files exporting loose functions; the class hierarchy should explain how a module works.

## Files

- `public/framework/ext/highlight/highlight.js` (12 files import it)

Proposed home: `public/framework/ext/Highlight/Highlight.js`.

## Why this one

Every code block on the site goes through it (code(), highlight()); a class with Highlight.View makes the code widget one component.

## Do

1. Load the `code` skill (section "The hierarchy explains the module"). Work in a worktree.
2. Write the class shape first in the module's readme `## Architecture` block (class, parts, which one is the manager), and one line in `doc/architecture.md` saying why this name, linking this task.
3. Move the functions onto the class as methods or statics. code() stays as the capture factory.
4. Move importers over by script, not by hand (`grep` the importers, rewrite the import lines, list every file changed). On Windows a case-only rename (`grip` to `Grip`) needs two `git mv` steps through a temporary name.
5. Load every page that imports it (headless, `mcp__site__shot`), run any test beside it, and commit each working step by exact path.

Done when: no file imports the old function names except a short re-export shim (or none), the module's page shows the class, and `node public/framework/code/patterns/function-bag-census.mjs --repo` no longer lists the file.
