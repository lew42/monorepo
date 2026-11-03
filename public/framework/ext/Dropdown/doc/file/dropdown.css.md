## dropdown.css

Structure, and the one thing a top-layer box cannot leave to the theme: a
surface, so it reads over whatever it opens across. Every colour is a token.

## The UA styles a popover, and they all have to go

```css
.dropdown-list { position: fixed; inset: auto; margin: 0; }
```

`[popover]` ships with `inset: 0` and `margin: auto` — that is the UA centring
it. Both have to be cleared before `dropdown.js`'s measured `left`/`top` mean
anything. `display` is the UA's too: closed is `none`, and
`.dropdown-list:popover-open` is where the flex column is declared.

## Reclaiming the box from the theme

```css
.dropdown > .dropdown-trigger:is(button, .btn) { … }
```

The theme styles every `button` as a small uppercase LABEL at 0-2-0
(`padding: 0.7em 1.4em`, `text-transform: uppercase`) — right for READ GUIDE,
four times too wide for a picture and a word. `:is()` takes the specificity of
its most specific arm, so restating the theme's own selector shape lands this at
0-3-0. Only the box is reclaimed; the theme keeps its voice everywhere else.

## A long list scrolls inside itself

`max-block-size: min(60vh, 22em)` with `overflow: auto`,
`scrollbar-width: thin` and `scrollbar-gutter: stable` — the same pair
`core/Page/Page.css`'s `.rail` uses. The gutter is reserved either way, so the
options do not shift when the bar appears.

## The name gives, never the picture

`.dropdown-name` is `flex: 1 1 auto; min-inline-size: 0` with an ellipsis: a
trigger in a 19rem rail is narrower than some template names, and an ellipsis is
the honest end of one. `.dropdown .icon` is clamped to `1em` — Material Icons is
a ligature font, and a name it does not carry renders as the whole word.
