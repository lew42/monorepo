# Review ext/editor and ext/Panel

## The ask, verbatim

> do a review of the ext/editor (shouldn't this be renamed by now to Editor?) and
> ext/Panel systems. where are we on these? create a page to simplify the findings
> in an interactive way. make sure the page is linkable. make a note in whatever
> skill (new task?) to make sure to always link deliverables (several of the past
> tasks create pages that have no links, anywhere, and i have to manually type
> them in)

## Four deliverables

1. **A review** of `ext/editor` and `ext/Panel` — where they stand, what is
   open, what is debt, what is done.
2. **A ruling on the rename** — `ext/editor` → `ext/Editor`, or not, with the
   convention that decides it stated so the next module doesn't re-litigate.
3. **An interactive findings page**, linkable — not a wall of prose. The
   findings should be filterable/browsable, in the house demo vocabulary.
4. **A skill amendment**: the deliverable-linking rule, so no future task
   leaves a page Mike has to type the URL for by hand.

## Scope

- Read-only on `ext/editor` and `ext/Panel` source — this is a review, not a
  refactor. Fixes are *proposed on the page*, not committed, EXCEPT anything
  that is a one-line, obviously-correct defect (log it if so).
- The rename, if ruled for, is a **proposal** — it touches a directory name,
  every importer and a dozen doc references. Working agreement: propose, wait.

## Files owned by this task

- `public/framework/ai/2026-08-14/editor-panel-review/**` (page, log, brief)
- `public/framework/ai/2026-08-14/page.js` (declare the slug)
- `.claude/skills/new-task/SKILL.md` (the linking rule)
- Link lines only in `ext/editor/page.js`, `ext/Panel/page.js`.
