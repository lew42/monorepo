# Code: turn `home.js` into the class `ServexHome`

Queued by the [OO census](/framework/ai/2026-10-09/system-architect/oo-census/) (pick 3 of 10). The owner, 2026-10-09: classes and class hierarchies over lowercase files exporting loose functions; the class hierarchy should explain how a module works.

## Files

- `Servex/home.js` (26 files import it)

Proposed home: `Servex/ServexHome.js`.

## Why this one

26 Servex files import its three loose exports (HOME, place, stamp); a tiny class with statics is a quick, safe win at the root of Servex.

## Do

1. Load the `code` skill (section "The hierarchy explains the module"). Work in a worktree.
2. Write the class shape first in the module's readme `## Architecture` block (class, parts, which one is the manager), and one line in `doc/architecture.md` saying why this name, linking this task.
3. Move the functions onto the class as methods or statics. Re-export HOME, place and stamp from home.js until every importer has moved; tests set SERVEX_HOME before a dynamic import.
4. Move importers over by script, not by hand (`grep` the importers, rewrite the import lines, list every file changed). On Windows a case-only rename (`grip` to `Grip`) needs two `git mv` steps through a temporary name.
5. Load every page that imports it (headless, `mcp__site__shot`), run any test beside it, and commit each working step by exact path.

Done when: no file imports the old function names except a short re-export shim (or none), the module's page shows the class, and `node public/framework/code/patterns/function-bag-census.mjs --repo` no longer lists the file.
