# Style architecture: few tokens, four grounds, one card

Decided 2026-10-12 from the owner's dictation ([the brief](/framework/ai/2026-10-12/style-system/requirements.md)). The goal, in the owner's words: "a simple, consistent system that just works everywhere."

## The whole system on one screen

```
tokens      --prime  --light  --dark   --ink  --subtle  --surface      (colour)
            --lighten-1..3  --darken-1..3                                (the one step rule)
            --pad --gap --flow  --pad-card  --radius  --shadow           (space and shape)

grounds     .bg-white  .bg-light  .bg-prime  .bg-dark                    (a box that paints a ground owns its ink)
            .bg-lighten  .bg-darken                                      (one step from whatever ground it sits on)

boxes       .card       background + padding inside + radius + shadow   (the one card)
            Section     core/Section: no ground, no padding of its own  (a band; the parent decides)
```

## 1. Tokens: few, reusable

| Token | Is | Figma name | Replaces |
|---|---|---|---|
| `--prime` | the one accent | `prime` | `--prim` (kept as an alias, callers migrated by script) |
| `--light` | a light grey: `--dark` mixed into white, one step | (none; the owner's) | hand-picked greys |
| `--dark` | the dark neutral (the sidebar's) | `dark` | `--bg` (kept as an alias) |
| `--ink` | body text | `text` | — |
| `--subtle` | secondary text | `muted` | — |
| `--surface` | the page's own background (white, or near-black in dark mode) | — | — |

- **No `--white`.** `#fff` is as clear.
- **Lighten and darken have one rule:** white or black at 8, 16 or 32 percent alpha (`--lighten-1..3`, `--darken-1..3`), laid over whatever ground is behind. No hand-picked tint per colour. This is also how the Figma file builds its insets (10, 25, 50 percent); we keep our three steps.
- `--light` is the only opaque grey, and even it is computed: `color-mix(in srgb, var(--dark) 8%, #fff)`.

## 2. Grounds: four `bg-` classes

A `bg-` class exists only when it sets a background. Each of the four also sets the ink that reads on it, so text never has to be recoloured by hand:

| Class | Background | Ink | Secondary |
|---|---|---|---|
| `.bg-white` | `#fff` | dark | 55% black |
| `.bg-light` | `--light` | dark | 55% black |
| `.bg-prime` | `--prime` | dark (`#1a1a1a`) | 70% of that |
| `.bg-dark` | `--dark` | white | 70% white |

**Ink on prime is dark, not white** (the Figma file uses white). White on `#72c4ff` is 2.0:1 and on our orange 2.2:1, under every contrast rule; dark ink is 6:1 to 10:1 on all three accents. Alternative kept in mind: white text plus the button's text-shadow, which is what `button.prim` still does.

## 3. Card and section

- **A card** (`.card`): a background that differs from its parent, padding inside (`--pad-card`, scales with the card), breathing room outside (radius and a soft `--shadow`). A plain `div.c("card", …)` holding a heading and a paragraph looks finished with no other class. Its children get `--gap` between them.
- **A card inside a card** has no shadow or border; it is its parent's ground one step darker (`--bg-darken-amt`), so nesting reads at any depth and on any ground.
- **Ground + card mix freely:** `div.c("card bg-dark", …)` is a dark card; `div.c("card bg-prime", …)` a prime one.
- **A section** has no required background and no padding of its own: the context decides (one band alone takes `.pad`; three full-bleed columns take none). The class is [core/Section](/framework/core/Section/); a plain `div` with `bg-*` and `pad` is also a section. No new `.section` CSS class.
- **Cards are the basic responsive tool:** a wall of cards (`grid auto`) wraps from 400 to 3440 with no media query.
- **No `card()` helper.** `div.c("card", …)` is already one word; a helper would be a second way to make the same box. Alternative: a `card({title, text})` factory if the same three-line body keeps repeating.

## 4. The card page

[/framework/ui/card/](/framework/ui/card/) is the one card page: the component, its grounds and its nesting, live. The other card pages are linked from it, never deleted: [core/Page/card](/framework/core/Page/card/) (the earlier card lab: grounds, headers, levels) and [ux/Card](/framework/ux/Card/) (the AI board's card page, a different thing that shares the word).

## 5. Names and scopes

| Name | Page | What goes here | Next door |
|---|---|---|---|
| **Style library** | [/framework/styles/](/framework/styles/) | every token, ground, class and layout the CSS ships, shown live | how to write CSS → Code |
| **Code: CSS** | [/framework/code/css/](/framework/code/css/) | how and where to write a rule: layers, the ladder, naming | the vocabulary → Style library |
| **Design** | [/framework/design/](/framework/design/) | what a thing should look like: layout, colour, navigation | the classes that do it → Style library |

## 6. Figma pages

The Figma rebuilds (`ext/Figma/colors`, `palette/*`) use these tokens, grounds and the card instead of their own copies; what each page still needs of its own CSS is only what is truly unique to that design. Figma's browse view gets real routed pages instead of query strings.

## Alternatives not taken

- A `--white` token (the owner: `#fff` is as clear).
- Figma's 10/25/50 percent steps instead of our 8/16/32 (ours double, so one step is always the same relative move; already used site-wide).
- A `.section` CSS class (would be a second section beside `core/Section`).
- Removing the card's hairline border in favour of shadow only (would change every card on the site; the shadow is added, the border kept).
