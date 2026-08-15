# Proportion — how much room a frame leaves

> "when you have a card with 20px padding, that's 1000px wide, it looks off"

It does, and the reason is that **20px is a perfectly good answer to a different
question**. A box has two floors, and they measure different things:

| floor | against | asks |
|---|---|---|
| **legibility** | the text's font size | can the text breathe next to the edge? |
| **composition** | the box's own width | is the frame proportionate to what it holds? |

A 1000px card with 20px of padding clears the first floor easily — 20px is
1.25× a 16px font, which is comfortable — and fails the second badly, at 2% of
its width. A 240px card with the same 20px clears both. **Same declaration,
different verdict, because the box changed.**

## The rule

```
padding ≥ max( 0.6em ,  min( 3.5% of width , 3.5em ) )
```

Read it as: never tighter than about two-thirds of a line, and on anything wide,
about 3.5% of the width — but stop asking past 3.5em, because a 3000px band does
not need 105px of inset.

**In practice that whole formula is one declaration:**

```css
padding: clamp(0.75em, 3.5%, 3.5em);
```

`clamp()` *is* the rule. The floor is legibility, the middle is proportion, the
ceiling stops it running away. Percentage padding resolves against the
container's inline size, so it tracks the box at every width with no query.

`ext/LayoutTool`'s `pad-scale` rule measures exactly this, and `cramped`
measures the legibility floor. A box has to clear both.

## Padding inside padding

A second inset is legitimate exactly when **the inner box changes something you
can see** — a callout with its own background, a bordered panel, a code block.
When the two boxes paint identically, the second inset buys nothing and the
content just sits further in than anyone intended.

The test is *does the paint change*, not *is there a background*: two nested
boxes both painted `--surface` are as invisible as two transparent ones. That is
what the `double-pad` rule checks.

```css
/* ✅ the inner box earns its inset — it is visibly a different thing */
.callout { background: var(--wash); padding: 1em 1.25em; }

/* ❌ 24px + 24px of nothing */
.panel { padding: 1.5em; }
.panel > .body { padding: 1.5em; }   /* same paint, twice the inset */
```

## Margins that meet padding

Padding and margin meeting at a boundary is **normal and fine** — a padded
container whose children carry their own rhythm is the ordinary shape of a
document. It only goes wrong two ways:

- **Collapse.** Adjacent vertical margins collapse into the larger one, *except*
  across a padding or border edge. So adding `padding: 1px` to a container
  silently changes the space above its first child. Prefer `gap` or the `.flow`
  owl, both of which never collapse.
- **Double counting.** A container with `padding: 2em` whose first child also
  has `margin-block-start: 2em` yields 4em, and nobody chose 4em. Let the
  container own the outside and the flow own the inside — one of them, not both.

## The numbers, live

The examples below are measured in your browser as the page renders, at your
current width. If the rule stops being true, the page stops claiming it.
