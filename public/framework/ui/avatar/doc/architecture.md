# Avatar architecture — one CSS class, sized by a token

The avatar is not a component with code. It is one class, `.ui-avatar` (a circle that holds initials or a photo), plus `.ui-avatars` (a row of them that overlap). Everything lives in [`avatar.js`](../avatar.js), which only adds CSS inside `@layer theme`. The demo and its source are on the [page](/framework/ui/avatar/), which is [`page.js`](../page.js). There is no JavaScript at runtime.

## Size is a token, never a variant

**Decided:** the size is `--avatar`, read as `width` and `height: var(--avatar, 2.5em)`. There are no `small` or `large` classes.
**Why:** a size class would have to pick the sizes for the caller. A token lets any caller set any size inline.
**Instead:** size variant classes. They were not built, because they would fix the sizes for everyone.
**Detail:** [the page's photo demo](/framework/ui/avatar/photos/).

## Copy the markup; there is no helper

**Decided:** the component is markup. Write `span.c("ui-avatar", "ML")` for a circle and `div.c("ui-avatars", …)` for a stack. There is no `ui.avatar()`.
**Why:** the old `ui.avatar()` and `ui.avatars()` were one-line passthroughs to `span.c()` and `div.c()`. They added a name to learn and nothing else.
**Instead:** a helper function in `ui.js`. It would duplicate `span.c()`, so it was removed.
**Detail:** [the page's note on the removal](/framework/ui/avatar/).

## Colours are theme pairs, never literals

**Decided:** the fill is `var(--ink)` and the letters are `var(--surface)`. `.accent` fills with `var(--prime)`. `.wash` fills with `var(--wash)` and sets its letters to `var(--ink)`.
**Why:** `--ink` over `--surface` is a pair the theme already keeps readable in light and dark mode. A component may not name a colour, so a literal `white` would break in dark mode.
**Instead:** a literal `white` over `--bg`. This was caught in review and changed.
**Detail:** [the page](/framework/ui/avatar/).

## The overlap is a sibling selector, and the ring is the page colour

**Decided:** every circle after the first in a stack gets `margin-inline-start: -0.6em`, and every circle gets a `2px` border in `var(--surface)`.
**Why:** the caller used to set the margin on each circle with `i ? … : 0`. The `+` selector says it once and cannot get the first circle wrong. The surface-coloured ring reads as a hole onto whatever the stack sits on, and it retints with the theme.
**Instead:** a margin and border set per circle by the caller. That repeats the same rule everywhere it is used.
**Detail:** [the page's ring section](/framework/ui/avatar/).

## Photos fill the circle through the class

**Decided:** `.ui-avatar` clips with `overflow: hidden`, and a child `img` takes `100%` width and height with `object-fit: cover`.
**Why:** a photo and its initials share one component, so no second class is needed.
**Instead:** a separate photo class. Not needed, because the clip and the fit already live in the one class.
**Detail:** [the page's photo demo](/framework/ui/avatar/photos/).

## Every rule sits in the theme layer

**Decided:** all rules are inside `@layer theme`.
**Why:** `framework.css` orders the layers, and an unlayered rule would beat the util layer's own rules without any error.
**Instead:** unlayered rules. They silently lose or win the cascade depending on the page.
**Detail:** [the layer order in `framework.css`](/framework/styles/).

## Mismatches found in the check

- ⚠ The page's note says `.accent` and `.wash` "inherit the rest". `.wash` also sets the letters to `var(--ink)`, so it does not inherit them. The code is right; the page wording is loose (page is outside this doc's fence).
