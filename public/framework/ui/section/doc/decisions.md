# section — decisions

## 1. The label is a `::before` reading `attr()`, never a second DOM node

The owner's own words: "just a subtle border with the name of that section
... a hover effect ... maybe the section name should be the class name." The
cheapest way to show a string that already exists as an attribute is to let
CSS read it — `content: attr(data-section-label)` — rather than append a
`span` full of the same text. Nothing extra renders, nothing extra needs
`aria-hidden`, and there's no risk of the label wrapping the layout that the
CSS around it wasn't written for.

`section()` sets `data-section-label` itself, once, from the exact classes
the caller passed — not by reading `classList` back out of the DOM at hover
time. Same result, no extra work at hover, and it's easy to read the value
straight off the element in devtools.

## 2. `ui-section-br` is excluded from its own label

If the modifier class stayed in the label string, every bottom-right section
would show `.flow .ui-section-br` instead of just `.flow` — the label would
be telling you about ITSELF, not about the content classes the owner wanted
"self-evident." `section()` filters it out before building the label.

## 3. Two placements, not a general position system

The owner said "maybe top left, maybe bottom right, I don't know" — not a
free x/y. `.ui-section-br` is the one modifier class; there's no
`.ui-section-tr` or `.ui-section-bl` yet because nothing has asked for one.
Add a corner only when a real page needs it — the same "doesn't have to go
for every element" restraint applies to the placements too.
