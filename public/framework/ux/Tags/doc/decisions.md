# Tags — decisions

Landed 2026-08-21, wave 2 of the graduation. Task log:
[`ai/2026-08-21/ux-graduations/`](/framework/ai/2026-08-21/ux-graduations/).

## The caller census, and what stayed in `ui/`

`ui/tags/page.js` is the only consumer of `.ui-tags-input` (`parts.js:20`, `@layer
util`) and the only tags-specific user of `.ui-pill` (`parts.js:15`). `ui/ui.js:29`
re-exports `{ css, component }` from `parts.js`, which is how the site-wide CSS side
effect loads on every page. No `ui.tags()` ever existed, no other caller anywhere under
`public/` (`ai/` excluded). The class imports `../../ui/parts.js` directly for the
stylesheet, the same move `ux/Tree` made for `ui/tree/tree.js` — a `ux` importing a `ui`
template, the direction that is allowed.

## Class-name stamp check

Grepped every `.css`/`.js` under `public/framework` (`ai/` excluded) for a bare `.tags`
selector: zero hits. Plain `Tags`, no prefix needed.

## The trap this one actually hit: `classify()` reads `this.name`

`View.classify()` ends with `if (this.name) this.ac(this.name)` — a mechanism for
naming a view for later lookup. `Tags.Chip` was first written as
`new this.constructor.Chip({ tags: this, name })`, passing the tag's text as `name`.
`assign()` is a plain `Object.assign`, so that set `this.name = "core"` on the chip —
and `classify()` then added `"core"` itself as a CSS class on the chip's `<span>`,
silently, for every tag whose text happened to look like a plausible class name. Caught
before the first render, by reading `classify()` end to end rather than assuming a
constructor arg is inert. Renamed to `value`; `chip(name){ … { tags: this, value: name }
… }`. **Not previously in the traps list** — flagged for the `code` skill via
`skill-improvement`, since `View`'s own trap list only names shadowed *methods*
(`text`, `toggle`, `show`, `hide`, `click`), never a shadowed *property* a mechanism
reads back out of `this`.

## `remove()` was the other near miss

`View.prototype.remove()` detaches an element from its own parent. A first draft named
the tag-removal method `remove(name)`, which would have shadowed it — a caller could
never again do `some_tags_instance.remove()` to detach the whole `Tags` box from ITS
parent. Renamed to `drop(name)`, the same move `ux/Tree` made for `toggle()` →
`flip()`.

## `Tags.Chip` is the one real part in this wave

The brief named `Tags.Chip` and `Pagination.Button` as candidate parts, "only where
real." A chip earns it: it owns its OWN listener (the ×, closing over `this.tags` and
`this.value`) rather than a state the parent toggles centrally — the same bar `Tree.Row`
met and `Pagination`'s buttons didn't. `Menu`'s items and `Pagination`'s buttons stayed
plain methods; see their own `doc/decisions.md` for why.

## `draw()` resets everything, same as `Tree`

`add()`/`drop()` both call `draw()` — a full `empty()` + rebuild, not a targeted DOM
patch. The caller owns the list; diffing old tags against new tags to preserve some
finer-grained DOM state is complexity this doesn't need, the exact call `Tree.draw()`
already made. The one UX cost — the field is a fresh element after every add, so a
mid-typing focus would be lost — is paid back with one line: `add()` calls
`this.$input.el.focus()` right after `draw()`, so typing several tags in a row never
needs a click back into the box. Verified in the headless interaction proof.

## No named extension

Nothing in `ui/tags/page.js`'s own doc asks for a subclass. **Zero named extensions
shipped.**

## Parked
- **Duplicate detection is exact-string only.** `add()` skips a tag already in the list
  by `===`; no case-folding, no trim-then-compare against existing entries beyond the
  new value's own trim. Not asked for, not built.
