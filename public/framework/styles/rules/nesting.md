# Nesting — what can safely contain what

> "normal divs, for example, shouldn't ever have any problems stacking? unless
> you put something in there that's too big, or use some fancy positioning to
> move it outside the box"

**That is exactly right, and it is worth stating as a rule**, because it means
the failure list is short and closed:

> A block-level box in normal flow, containing block-level boxes in normal flow,
> **cannot break.** It is as wide as its parent, as tall as its content, and it
> stacks. There is no width to get wrong and no overflow to clip.

Everything that goes wrong is one of six departures from that. Learn the six and
you can nest with confidence.

## The six

### 1. A formatting context that won't shrink — `min-width: auto`

A **flex or grid item** has an automatic minimum size equal to its content. A
long unbreakable token, a `<pre>`, or a wide table then refuses to shrink, and
the item pushes out of its container.

```css
.item { min-width: 0; }                                  /* flex */
grid-template-columns: minmax(0, 1fr);                   /* grid — NOT 1fr */
```

⚠ `1fr` *is* `minmax(auto, 1fr)`. The `auto` floor is the content. This is the
single most common broken-grid cause in this repo, and `escape` reports it.

### 2. An unbounded maximum — `1fr` on a reading column

The other half of the same misunderstanding. `repeat(auto-fill, minmax(34em, 1fr))`
at **one** column gives that column the entire width — 130 characters a line at
1280px.

```css
/* tiles — stretching is fine */
repeat(auto-fill, minmax(min(14em, 100%), 1fr))

/* reading columns — bounded at BOTH ends */
repeat(auto-fill, minmax(min(34em, 100%), 38em))
```

### 3. Leaving the flow — `absolute`, `fixed`, `float`

An out-of-flow box no longer contributes height, so its container collapses
behind it and siblings slide underneath. Legitimate for overlays, badges and
sticky chrome; never for layout you could have asked a grid for.

### 4. A height someone chose — `height`, `max-height`, `100vh`

Content grows; a fixed height does not. The box either clips it (`overflow:
hidden`, and the content is simply unreachable) or spills it. **Prefer
`min-height`**, which sets a floor without setting a ceiling.

### 5. Clipping — `overflow: hidden` without a scrollbar

Fine as a deliberate crop with `max-height` (a thumbnail, a line clamp). A
failure everywhere else, because there is no affordance: the content exists and
cannot be reached. `clipped` reports it; `auto` is almost always the fix.

### 6. Negative margins and transforms

Both move a box without telling its parent. Legitimate and readable in small
doses — stacked avatars, a pulled-up hero — and a debugging nightmare when
they are load-bearing for a layout a grid could have expressed.

## The table

| container | child | safe? |
|---|---|---|
| block | block | **always** — this is the base case |
| block | inline | always |
| `.flow` | block | always — margins from one token, no collapse surprises |
| flex row | anything | **only with `min-width: 0`** on items that hold text |
| flex column | anything | safe; the cross axis stretches, which is usually wanted |
| grid | anything | **only with `minmax(0, …)`** tracks |
| any | `position: absolute` | parent contributes no height for it — usually wants `position: relative` |
| fixed height | growing content | **never** — use `min-height` |
| `overflow: hidden` | wider content | only as a deliberate crop, with `max-height` |

## Rhythm doesn't nest

Two vertical rhythm systems in one box is the "72px under a card icon" bug.

- **`.flow`** is the owl (`* + * { margin-block-start: var(--flow) }`), and a
  heading's gap resolves against **the heading's own font-size**. For stacked
  **prose**.
- **`flex v` + `gap`** is flat and predictable. For **UI** — cards, lists,
  meters, panels.

**One rhythm per container.** Never `.flow` inside a card. When siblings are
different kinds, each kind is one box with its own internal rhythm, and the
page's flow spaces the boxes.

## Live

Each combination below is built and measured in your browser as this page
renders. "Safe" is a result, not a claim.
