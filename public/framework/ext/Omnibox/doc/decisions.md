# Decisions — the 2026-09-04 prototype's verdicts, kept as the record

This prototype graduated into [`core/Search`](/framework/core/Search/) on 2026-09-06. What
survived, what was dropped, and why is
[core/Search's own decisions page](/framework/core/Search/doc/decisions/) — read that one first.

Kept here because it is the record of how the interaction model was arrived at, and because two
of its arguments are still the ones core acts on.

## A visible field, not a modal-only box — still the rule

A modal-only omnibox (Ctrl+K conjures a whole overlay from nothing) hides its own existence: a
reader who never learns the shortcut never learns the feature exists. A field that is simply
*there* teaches itself, and the open keys are an accelerator for a control that already worked by
clicking into it. Core kept this and paid for it with a slim closed bar rather than a full field.

## Ranking: "strong" means an exact title match — still the rule

An exact, case-insensitive match on the WHOLE title is not a guess; a prefix match is. So an
exact match is the top tier and outranks everything. Core kept the tier idea and dropped the
"current topic first" bucket that sat under it: the box is app-level now, so there is no page
context to prefer, and the filter chips do the same job explicitly.

## The Space-bar mode switch — prototyped, and dropped

Space on an EMPTY box toggled search → command. The one way it was wrong is real, not
theoretical: a query whose first character is meant to be a space, or the word "space" itself,
collided with the trigger. Command mode was three hardcoded links — enough to prove the branch
existed and nothing more. Core dropped both: a command *palette* is a different feature, and a
mode switch nobody can see is not one.

## The preview is borrowed, never rebuilt — dropped, and why that is fine

The highlighted row drew the real `page.preview(page.nav())` — one dynamic import per settled
highlight, guarded by a token so a fast arrow-key run kept only the last paint. Core draws a wall
of forty cards instead, so every match shows itself at once and no single row needs a preview of
its own.

## Reused, not reinvented — dropped with the popover

The results panel was Dropdown's top-layer recipe (`popover="auto"`, measured `place()`), because
a column or a panel host is `overflow: hidden` all the way down. Core does not need it: the box
is mounted on `app.$app`, not inside a page, so nothing can clip it and a plain `position: fixed`
is enough.
