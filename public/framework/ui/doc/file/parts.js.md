Two helpers every component in the directory shares, plus the two classes too
small to earn their own file.

## `css()` — the layer statement you can't forget

`css(rules)` wraps a rule string in `@layer base, theme, site, util;` before
appending it as a `<style>` tag, because a shorter list silently drops `site`
past `util` at the moment it's first declared — every `<name>.js` in this
directory calls this instead of writing the layer line itself, so there is
exactly one place that constant can go stale.

## `component()` — the `.c()` form for a bare function

`component(fn)` returns `fn` with a `.c(classes, ...args)` method attached,
matching every `View` factory's chainable class-then-call shape:
`table.c("num", head, rows)`. It is `Object.assign`, not a class — the
one-line version of the pattern every constructor in the framework uses.

## `.ui-pill` and `.ui-tags-input`

Two classes with no module of their own: a pill is `background: var(--wash)` +
`border-radius: 999px`, used by badges and tags alike, and `.ui-tags-input` is
the one opt-out of the base theme's `input` border — deliberately in `@layer
util`, because the rule it overrides (`input:not(…)`) carries an attribute
selector's specificity that a plain class in `theme` would lose to.

## Who else imports this file

`styles/elements/forms/page.js` imports `{ css }` from here directly, for its
own unrelated stylesheet — using the layer-safe `<style>` helper, not
anything UI-specific. See the readme's "Who uses it" table.

## Improvements

Nothing ranked: 25 lines, every declaration a token, and the one thing that
looked like an escalation (`.ui-tags-input` in `util`) is a commented,
deliberate one.
