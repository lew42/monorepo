# Placement is not its business

A sidebar says what it **is**; whatever contains it says where it **goes**. One
line at the call site, and always the shared token:

```css
.topic > .sidebar { flex: 0 0 var(--sidebar); }
```

`Sidebar.css` sets `display: flex; flex-direction: column` and nothing about its own
width, position or margins. That is what lets the same component be a fixed rail in
one layout, a `basis` flex child in another, and a sticky top bar below 52em.

## No fallback in the `var()`

**Never `var(--sidebar, 19em)`.** The sharing is the point, and a fallback
reintroduces the two-numbers-that-drift problem the token exists to solve.

It drifted anyway once, by a different route: `/styles.css` styled a `.section-nav`
it had hand-rolled at `14em` while `--sidebar` sat at `13em`, and the comp asked for
`19em`. **A token cannot keep two things in agreement if one of them isn't using
it** — the fix was deleting the second sidebar, not changing the number.

## Where it is placed today

| call site | placement |
|---|---|
| `framework/page.js:20` | `.topic > .sidebar` in `/styles.css` |
| `styles/layouts/sidebar/page.js` | `.ac("basis").style("--basis", "var(--sidebar)")` |
| the demos on this page | `.style({ width: "13em" })`, because a demo box is not a layout |

Three placements, one component, no `width` in `Sidebar.css`.

## 2026-09-18 — resizing is not a fallback

`Sidebar.css` now writes `.sidebar { --sidebar: clamp(12rem, var(--sidebar-w), 50%) }`
— which reads, at a glance, like the exact `var(--sidebar, 19em)` mistake this file
just spent a section warning against. It isn't one, and the difference is worth
being precise about: a **fallback** (`var(--x, y)`) is read *by the consumer*, so
every consumer has to agree to skip it — the two-numbers-that-drift problem. This
is the **producer** re-declaring the token on itself, once, and a property declared
directly on an element always wins over one it would otherwise inherit, regardless
of layer or specificity. `.topic > .sidebar { flex: 0 0 var(--sidebar) }` in
`/styles.css` never changed and never needed to: it still reads one token, still
has no idea a `Sidebar` can resize itself, and still can't disagree with it — it is
just reading a value the panel now sets instead of one `:root` always did. Nothing
downstream of `.sidebar` gets a fallback either; it is `--sidebar`, the same name,
resolving to a different real value because a `Sidebar` is now allowed to be the
one thing on the page that says how wide it is. `doc/decisions.md`'s 2026-09-18
section has the rest — including the one thing this DOES cost: a box elsewhere
that reads `var(--sidebar)` to *match* a sidebar's width without being one
(`apidoc/page.js` and two others) still reads `framework.css`'s plain `19em`,
because that inheritance chain runs through `:root`, not through this element.

## The corollary

**A component that ships a look has decided something that wasn't its call**, and
the look is what breaks when it is reused. Placement is the same argument one level
up: a component that ships a width has decided the page's layout.

The test for anything about to be added to `Sidebar.css`: *would this rule still be
right if the component were dropped into a completely different site?* Flex
direction yes. `width: 19em` no.
