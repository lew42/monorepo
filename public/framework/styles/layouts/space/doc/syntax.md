# The layout text syntax

A layout is a **string**. Indentation is nesting, one line is one box, and the
whole grammar is a single production:

```
<class tokens> > <part> [count]
```

Either half may be empty. That is all of it — there is no other rule, no
punctuation to learn, and nothing that round-trips, because `gen()` emits this
text, `render()` consumes this text, and the url holds this text.

```
full fill flex v
  > topbar
  flex gap wrap flex-1 scroll
    basis pad --basis:15em > menu
    pad flow fluid > sections 5
    basis pad --basis:13em stick > toc
  > footer
```

Six lines, and that is the whole of [Docs](/framework/styles/layouts/docs/).

## The four kinds of token

| | |
|---|---|
| `flex gap wrap flex-1` | **classes** — the [layout words](../../words/), verbatim, straight onto the box |
| `--basis:15em` | a **declaration**: any token holding a `:`. `_` reads as a space |
| `scroll` `stick` `fluid` `tone` | this format's own **four words** — declaration sets, not classes |
| `> sections 5` | a **part** of the shared `site` object, and its count |

Every word, with a picture beside it: [**Words**](../../words/).

## Indentation is the tree

A line's depth is its first non-space column, compared against the line above
it. Anything deeper is a **child**; anything shallower closes boxes until it
fits. Two spaces per level is the convention and nothing enforces it — the
parser compares columns, so four spaces or a tab works as long as you are
consistent within a file.

```
flex gap          ← a row
  basis > menu    ← its first child
  flex-1          ← its second
    > hero        ← that one's only child
> footer          ← back to the top level
```

Blank lines are skipped. A line whose first non-space character is `#` is a
**comment** and is skipped too, which is the only thing in the grammar that is
not the production above.

## A line with no classes is not a box

`> footer` is *the footer*, appended where it stands. `pad > footer` is a padded
box **containing** the footer. The distinction is load-bearing and it is the one
thing people get wrong first: a bare part is a leaf, and only a class, a
declaration or a child makes a container around it.

The root line is the exception — it always becomes the page, whether or not it
carries anything.

## Four things that will bite you

- **`scroll` belongs to the ROW, not to a panel inside it.** A wrapping flex
  line is sized by its content — `align-content` can grow a line, never shrink
  one — so a scroller one level too deep never engages, and a `fill` page clips
  with no way down.
- **`stick` needs `align-self: flex-start`, and that is most of what it is.**
  A stretched rail has nothing to stick to, because it is already as tall as its
  row.
- **`fluid` is not `flex-1`.** `.flex-1` is `flex: 1 1 0%`, so a fluid track in a
  *wrapping* row shrinks to nothing rather than pushing its neighbours onto the
  next line. Swap one for the other in the lab and watch the article go one
  letter wide at 390. `fluid` is `flex: 1 1 24em`, which every hand-written
  layout in this rail types by hand.
- **A height comes from `fill`, and from nothing else.** Without one a `full`
  page is as tall as its content, so it has nothing to divide and every `scroll`
  in it is inert. This is why the ruler's screens are width **and** height pairs.
- **`tone` is translucent, and that is the point.** Two boxes deep composites
  darker than one, which is the only way a nesting can be read at a glance. It
  cannot be `wash`: this theme's three-step ladder is **opaque** by decision, so
  ten nested levels of it look exactly like one. `--tone` is a hue and it
  *inherits* — declare it once on a section and its whole subtree deepens the
  same colour instead of turning into a rainbow.

## Why text, and not JSON

A layout is edited by a person, in a textarea, at the speed of a thought.
`["flex gap", ["basis", "menu"]]` is the same information with four times the
punctuation and no way to indent it wrong. The text format has exactly one
representation, so nothing round-trips and nothing can drift.

Why a `:` means a declaration: every hand-written layout in this rail carries
inline state (`--basis: 15em`, `flex: 1 1 24em`), and the layouts readme is
explicit that this is correct — it is per-layout state, not a look. A format
that could not express it would only be able to describe two thirds of the tier.
