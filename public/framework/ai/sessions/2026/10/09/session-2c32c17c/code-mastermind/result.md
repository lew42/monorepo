# Code mastermind: result

## What changed
- `/framework/code/` page: the written-out list under the links is gone (it repeated them); the link wall stays.
- `code/readme.md`: new section, code, design and content as three sides of one thing.
- `code/objects/readme.md`: names the one default object view, `view()` in `ux/Content/Object/DefaultView.js`. A class now picks what matters with `static shown = [...]` (listed first, in order) and `static hidden = [...]` (internal state such as timers).

## The three systems (proposal)
- **Code** (`/framework/code/`, skill `code`): syntax, classes, patterns, JS vs CSS dos and don'ts, reuse the tokens and layouts, never add CSS.
- **Design** (`/framework/design/`, one skill `design`): layout, color, navigation, what goes where. Replaces the separate `layout`, `color`, `navigation` skills with one entry that points at the three readmes.
- **Content** (`/framework/design/content/`, skill `content`): writing it down. Absorbs `documentation` (readme/doc shape), later page.jsonl content via the page tool.
- `css` and `new-css-class` fold into `code` (they already only point at `code/css`).

## Next tasks
1. system-architect applies the skill merge above (it owns shared skills; proposal only here).
2. Move callers of `object()` / `inspect()` to `view()`, then archive the two.
3. Add `static shown/hidden` to the first classes (Session, Servex, Prompt).
4. CSS audit: count one-off classes vs tokens and layouts; list candidates to delete.
5. Add the manager-class / `architecture.md` rules to `code/patterns` (they live only in the skill now).
