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

## The corollary

**A component that ships a look has decided something that wasn't its call**, and
the look is what breaks when it is reused. Placement is the same argument one level
up: a component that ships a width has decided the page's layout.

The test for anything about to be added to `Sidebar.css`: *would this rule still be
right if the component were dropped into a completely different site?* Flex
direction yes. `width: 19em` no.
