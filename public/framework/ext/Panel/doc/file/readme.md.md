## readme.md

The maintainer's document: what a panel is, section vs panel, the file map, the
`T` vocabulary in a paragraph, one condensed verdict per decision, **What will
bite you** (the traps, each one measured), who uses the module, and what is still
open. Each verdict links to [Decisions](/framework/ext/Panel/docs/decisions/) for
the full record; the template paragraph links to
[Templates](/framework/ext/Panel/docs/templates/) and
[the generator](/framework/ext/Panel/docs/generator/).

⚠ **This file states the readme's shape, never its counts.** "Twenty verdicts"
was wrong within the day the decisions section grew one, and a number in a
document *about* another document rots faster than anything it describes while
telling a reader nothing they came for.

## It used to be the design record too

Before the 2026-08-14 audit, `readme.md` was 203 lines and carried the entire
worked decision history inline — three screens where the `documentation` skill
asks for one. The record itself wasn't wrong, just misplaced: it is now
[`doc/decisions.md`](/framework/ext/Panel/docs/decisions/) and
[`doc/templates.md`](/framework/ext/Panel/docs/templates/), summarized here
in a paragraph each and linked, per the skill's own rule for a section over
two paragraphs.

## The file map is the part that rots

The shape section names **every source file in the module except `page.js` and
the readme itself**, and most of the traps name a specific file or selector on
top of that. The 2026-08-15 toolbar/grip/random splits made a whole run of those
lines wrong at once — a rename inside the directory is the change this file
cannot survive without being edited in the same commit.

## Improvements

1. **The "Who uses this" section is hand-maintained** — it goes stale exactly
   the way `files:` in `page.js` does: silently, the next time an import is
   added or removed elsewhere in the site. No crawler checks it; a future audit
   pass is the only thing that will catch drift. *(medium, important — the same
   trade `ext/doc`'s own readme names for `files:`)*
2. **The Open section reads as notes, but two of its items are findings** —
   three live mounts sharing one document, and a workspace narrower than 16em
   clipping its own `--panel-hug`, both measured. The other two are questions
   somebody deferred (`ext/editor` has not adopted `properties`; the inspector
   offers no `grow`). Nothing links either kind to a task, so the ones that are
   bugs are only ever found by reading this file. *(medium, useful)*
