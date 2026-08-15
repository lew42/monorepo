# Cascade — where a declaration belongs

> "how do we create the right CSS cascade, so we're not putting max-width on
> every p, and then having to unset it later"

The question contains its own answer. **A property set on a leaf must be unset
on every exception; a property set on a container is overridden by the one child
that wants out.** So the direction of the cascade is the whole strategy:

> **Constrain the container. Never the items.**

## The worked example

```css
/* ❌ every leaf carries the constraint */
.page p, .page li, .page h2, .page blockquote { max-width: 52em; }
```

Now a table must unset it. So must a code block, a figure, a card grid, and the
one paragraph inside a callout that should be full width. Each `unset` is a new
rule, and the sixth one will be written by someone who does not know about the
other five.

```css
/* ✅ the track carries it, once */
.page.standard {
    --measure: 52em;
    grid-template-columns: [main-start] min(var(--measure), 100%) [main-end] 1fr;
}
.page.standard > *      { grid-column: main; }
.page.standard > .wide  { grid-column: wide; }   /* opting out is ADDITIVE */
```

Nothing is unset. A block that wants more width **asks for more track**, and the
asking is one class at the call site where you can see it.

## Tokens flow; declarations don't

A custom property inherits. A declaration does not. That difference is the
lever:

```css
.page.standard { --measure: 52em; }        /* every descendant can read this */
.page.standard > .measure { --measure: 34em; }   /* one subtree disagrees */
```

**Set the token high and read it low.** `Page.css` puts `--measure` and
`--page-pad` on the region so *every* page inherits a sheet, and any page opts
out by re-declaring the token on itself — "a declared value beats an inherited
one at any specificity, in any layer". No specificity war, no `!important`, no
unset.

⚠ **This is why `.page.full` is a trap for full-width pages.** It sets
`--page-pad: 0`, and the page *title* is rendered by `Page` outside anything
your `content()` builds — so padding you add to an inner wrapper misses it and
the `h1` lands flush in the corner of the region. A page that wants full width
*with* a gutter declares the two tokens; it does not take `full` and try to put
the padding back. (`gutter` in LayoutTool exists because this shipped.)

## The four layers, and what goes in each

```css
@layer base, theme, site, util;   /* restated IN FULL in every stylesheet */
```

| layer | holds | example |
|---|---|---|
| `base` | reset, box-sizing | `*, *::before { box-sizing: border-box }` |
| `theme` | the vocabulary — tokens, elements, components | `.page-preview`, `h2`, `--prim` |
| `site` | this site's opinion, loaded last | `/styles.css` |
| `util` | single-purpose classes that must win | `.flex`, `.gap`, `.hidden` |

- **The first `@layer` statement fixes the order**, and a name first seen later
  is appended at the *end*. One short list drops `site` past `util`, silently.
- **Every rule lives inside a layer.** An unlayered rule beats every layer at
  any specificity.
- **Base-theme selectors stay flat** — one element, no descendant combinators —
  or a theme's `h2` can never win against `framework.css`'s `.page > h2`.

## The ratchet

Escalation is one-way: specificity → a layer → unlayered → `!important` →
inline. **Each rung works once, and spending it raises the cost for everyone
after you.**

> **Never escalate downstream. De-escalate upstream.**

If you find yourself overriding a `framework.css` rule, that is a bug report
about `framework.css` — the fix is a flatter selector, a `:where()`, or a token,
made *there*. Record evictions in `framework/styles/readme.md`.

## The ladder — stop at the first rung that works

1. **Nothing.** The default already handles it.
2. **A utility class** — `flex gap v-center`, `grid auto gap`, `measure`,
   `surface`, `wash`, `muted`.
3. **An existing component's class** — `.page-preview`, `.sidebar-link`.
4. **The module's own `.css`, layout only.** Where things sit, how they size.
   The test: *would this rule still be right if the component were dropped into
   a completely different site?* Flex sizing yes; `background: #eef0f4` no.
5. **`/styles.css`** — skin.

A component that ships a look has decided something that wasn't its call, and
the look is what breaks when it is reused.
