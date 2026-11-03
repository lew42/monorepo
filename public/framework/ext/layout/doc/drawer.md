# The drawer pushes

`panel.js` opens one right-hand drawer per document. It **pushes** the app shell
over rather than covering it — the one thing a live properties panel must not do
is cover the element you are editing at the exact moment you edit it.

## How the push works

`framework.css` reads `--drawer` as `padding-inline-end` on `.app`; `panel.js`
writes that custom property on the same element when the drawer opens. Both the
nav and the page region narrow, `.pages` keeps its own scrollbar at its own new
edge, and the panel itself stays `position: fixed` so no `overflow: hidden`
anywhere can clip it. Three shapes were weighed — wrap `$pages` in a row div with
the panel as a sibling (correct, but every page pays a shell div for an ext it may
never load); make `.app` a grid with a rail column (the shell would have to place
its own chrome explicitly) — against **the shell yields an inline-end rail**, which
won because it is one declaration and moves no structure.

Two details are load-bearing. The reservation is **`rem`, not `em`** — the padding
resolves against `.app`'s font-size and the width against the panel's own
`0.85em`, so an `em` value would reserve the wrong strip. And the reservation is
**self-limiting**, `min(var(--drawer), max(0px, 100% - 24em))`, so a narrow window
keeps its page and the drawer covers instead of pushing it to nothing — a media
query would have put a breakpoint in the framework for the sake of one `ext`.

## Sharing the edge with DevBar

[`dev/DevBar`](/framework/dev/DevBar/) docks at the same inline-end edge for an
unrelated reason (`color-scheme` and `.theme-lew42` scoping, not this panel's
`.app`-must-force-dark-mode constraint — DevBar forces its own dark scheme instead).
`.app` sums `--drawer + --devbar` (`framework.css`) so the two rails sit side by
side rather than one silently losing its push, and the layout panel insets itself
by `--devbar` so it never sits under the dev rail. `z-index: 40` sits between
`.demo.max` (30) and the mode-scheme button (60) for the same reason: the drawer
has to reach over a full-screen demo without burying the toggle a visitor needs to
get back out.

## The panel's own shape, and what survives a re-render

A pinned head (name, `copy`, `✕`) sits over a scrolling body — a drawer whose `✕`
scrolls out of view is a drawer you cannot shut. Knobs inside the panel are a
three-column grid (name / slider / value), scoped to `.layout-panel .layout-knob`
so the *bar's* knobs stay shrink-to-fit and inline; that grid is the actual
difference between a wide panel reading well and a wide bar being in the way.

A consumer that re-runs its own render (a tone chip re-runs a whole section band)
replaces the selected element out from under the panel. The fix is that a
[`layout.context()`](/framework/ext/layout/api/context/) registration sits on the
*region*, never the selection, so the region survives even when its children are
replaced. `panel.js` remembers that region as the selection's **host** and
re-resolves on the next click: the live code readout if the selection is still
connected, the host itself if it is not, the empty state if even the host is gone.
It used to slam shut mid-edit the moment a re-render happened; now it waits for the
next interaction and says what it can.
