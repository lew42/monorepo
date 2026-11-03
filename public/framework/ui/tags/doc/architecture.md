# Tags architecture — the template is markup, the behaviour lives in a class

`ui/tags` is a copy-paste template: a row of chips with a `×`, plus an input. It holds no logic. The page [`/framework/ui/tags/`](/framework/ui/tags/) is the template, rendered and printed as source (`page.js`). The working version is [`class Tags`](/framework/ux/Tags/) in `ux/Tags/Tags.js`.

## The template has no behaviour
**Decided:** `ui/tags` ships markup only. Its `×` and input have no listeners on purpose.
**Why:** an inert template cannot be wrong about wiring, and the first real use would rewrite it anyway.
**Instead:** a `ui.tags()` factory with wiring. It was built and dropped: it was inert too, so it was deleted rather than extended.
**Detail:** [`ux/Tags` decisions](/framework/ux/Tags/doc/decisions/)

## Behaviour is a class, not a function
**Decided:** `class Tags extends View` holds the list. `add()` and `drop()` change it and fire `onChange`.
**Why:** the list has state, so it is a class. Typing a tag and clicking `×` both go through the same two methods.
**Instead:** a loose helper that mutates DOM chips. Each new surface would copy its own version.
**Detail:** [`ux/Tags` decisions](/framework/ux/Tags/doc/decisions/)

## A chip owns its own `×` listener
**Decided:** `Tags.Chip` is a `View` that calls `this.tags.drop(this.value)` on its own `×`.
**Why:** each chip knows its own value, so the parent never tracks which `×` was clicked.
**Instead:** one click handler on the parent that finds the chip. That works, but every parent would need the same lookup.
**Detail:** [`ux/Tags` decisions](/framework/ux/Tags/doc/decisions/)

## The field opts out of the theme's input rule, in the `util` layer
**Decided:** `.ui-tags-input` (`border: none; background: none; padding: 0`) sits in `@layer util` in [`ui/parts.js`](/framework/ui/), not in `@layer theme`.
**Why:** the theme styles every `input` with `input:not(…)`. That selector carries attribute-selector specificity, so a class in `theme` loses. A later layer wins regardless of specificity.
**Instead:** an inline style. That works, but it is the top rung of the escalation ladder, and a layer does the same job properly.
**Detail:** the comment at [`parts.js`](/framework/ui/) line 18

## One class for the field, shared with every inline input
**Decided:** `ui-tags-input` is a shared class in `parts.js`, not a rule private to tags.
**Why:** a search box, inline editor or editable cell needs the same opt-out. One class means one fix.
**Instead:** a copy in each module, which would drift.
**Detail:** [`ux/Tags` decisions](/framework/ux/Tags/doc/decisions/)
