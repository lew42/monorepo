# Panel2 — decisions

## Open: `css-scopes.txt` reservation

`panel2-` is a free prefix (confirmed by grep against
`public/framework/styles/css-scopes.txt` and a site-wide census, 2026-10-02 — no other module
emits a `.panel2-*` class). This task's write fence is `ext/panel2/` plus its own demo page, which
does not include `public/framework/styles/css-scopes.txt`, so the reservation line couldn't be
added there directly (`new-css-class` skill, step 5's own fallback). Whoever next has write access
to that file should add one line, alphabetically among the other `ext/` prefixes:

```
panel2-      ext/panel2
```

## Why `Panel2.split` is a function, not a third static part

`requirements.md` step 3 asks for "parts as statics" — `Panel2.Header`, `Panel2.Side`, etc. — so a
caller can subclass one part and have every Panel2 pick it up through
`this.constructor.Header`/`.Side`. That pattern is for pieces of **one** panel's own chrome. The
split helper builds a wrapper holding **two separate Panel2 instances** plus a grip — there's
nothing on it a caller would plausibly want to subclass (it has no content, no header, no state of
its own beyond which axis), so it's a plain static function returning a plain `div`, not a fourth
View subclass. If a real need to subclass the split wrapper ever shows up (a themed divider, say),
promoting it to `Panel2.Split` is a small change — the function's shape doesn't have to change,
only where it lives.

## Open: the drawer breakpoint is the WINDOW, not the panel

The side-becomes-drawer rule is `@media (width < 34em)` — the real browser window. Found during
this task's own fresh-eyes review: put a Panel2 with a 16rem side inside a 22rem `.panel2-grid`
cell on a wide screen, and the side still sits beside main (the window is wide), leaving main only
about 6rem wide inside that narrow cell — squeezed, not stacked. A `@container` query instead of
`@media` would fix this (the side would respond to its OWN panel's width, not the window's), but
`design/layout`'s own rules warn a box can't restyle its own container, so this needs a measured
wrapper, not a one-line swap. Left as a real open question for whoever builds the `ai/` dashboard
(Part 2) that will actually put several of these in a grid — decide it against a real narrow cell,
not a guess here.

## Open: "Sprawl" (the owner's mid-task addition)

A layout word for a FEW big, equally-important sections that stack on a narrow screen and sit side
by side on a wide one (three rows at 1000px becoming three ~1000px columns at 3000px).
`framework-home` uses a plain CSS grid for this today. `.panel2-grid` (this module) does something
that LOOKS similar — fitting several panels into a row, stacking on a phone — but it's built for
MANY similarly-sized small panels (a dashboard wall), not a few large sections, so it is not
obviously the same word wearing a different name; that needs a real side-by-side comparison, not a
guess. Noted for whoever picks this up; not built here.

## Open: adaptive panel height in a split

Today `Panel2.split` gives each panel exactly the height its own content needs — `align-items:
stretch` on `.panel2-split` already stretches a short panel to match a taller sibling when neither
has a reason not to, but the open question is a panel whose OWN content wants to scroll
(`.panel2-main { overflow: auto }`): should IT fill the row's height, or keep hugging its content
like today? That call needs a real second panel with real, longer content to judge against, not a
guess made for this task's own short demo text.

## Decided: no backdrop, no click-outside-to-close on the drawer

The open drawer has a box-shadow (`panel2.css`) but no dimming backdrop behind it, and only its own
header toggle closes it — tapping the main content behind it does nothing. `core/Sidebar` and
`ext/drawer` both skip a backdrop too (they push the page rather than overlay it), so this isn't a
new inconsistency, but Panel2's side genuinely overlays main rather than pushing it, which a
backdrop usually signals. Left as today's behavior — a first caller with a real narrow-screen user
testing it is a better judge of whether a backdrop is wanted than a guess made for this demo.

## Why the side's open/closed state has no `localStorage`

`core/Sidebar` and `ext/drawer` both remember a reader's chosen width/open-state across reloads.
Panel2's side starts closed on every narrow-screen load on purpose — this is version one, there is
no real caller with an opinion yet about whether a drawer should reopen itself, and guessing wrong
here is cheap to fix later (one `Page.Store` call, same shape Sidebar's `size()` already shows)
once there's a real page to watch someone use it on.
