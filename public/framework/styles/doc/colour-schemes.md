# Colour schemes: one simple default, special ones on purpose

For [architecture.md](architecture.md) §2 (the four grounds). Contrast figures below are computed (WCAG ratio, 4.5 is the floor for body text), not eyeballed.

## Words that cannot be misread

- **Ground** = a background (`bg-white`, `bg-light`, `bg-dark`, `bg-prime`). **Ink** = text on it. Say "dark ground" or "white ink"; never plain "dark", which can mean either.

## 1. The default: white, light and dark ground stack freely

- **A light card on white, white on light, either on a dark ground.** Nest a card in a card and it steps one notch (`--bg-darken-amt`); the Figma palette's dark stack (a darker panel, then a lighter one inside) is the model, and it has better contrast than ours does today.
- Ink follows the ground (`.bg-*` sets it); never recolour text by hand.
- **Use this everywhere unless you can name why not.** Inbox rails, lists and walls: one scheme.

## 2. Upgraded schemes: sparingly, on purpose

- A rail of twelve differently coloured rows is exhausting: colour is a signal, and a signal that is always on says nothing. Colour one row for a reason (needs you, failed, selected), not for variety.
- A page may carry **one** coloured band or card as its callout; two is a design problem.

## 3. Prime ground: a callout, not a default

- Prime (`--prime` #FF6157 here, #72c4ff in the Figma file) is a **special callout**. It is never the page's background.
- It must be **darkened or tinted for contrast**, then checked against its ink:

| Prime ground | Ink | Ratio | Verdict |
|---|---|---|---|
| `#FF6157` plain | dark `#1a1a1a` | 5.88 | passes: what `.bg-prime` does |
| `#FF6157` plain | white | 2.96 | fails: never |
| `#FF6157` darkened 25% (`#bf4941`) | white | 4.95 | passes |
| `#FF6157` darkened 40% (`#993a34`) | white | 6.98 | passes comfortably |
| `#FF6157` tinted 85% (`#ffe7e6`) | dark | 14.77 | passes: a soft callout |
| `#72c4ff` plain | white | 1.90 | fails: why the Figma file's white-on-prime was not copied |
| `#72c4ff` darkened 40% (`#447699`) | white | 4.89 | passes |

- Rule: pick **dark ink on plain or tinted prime**, or **white ink on prime darkened at least 25%**; compute the ratio before shipping (a few lines of node: luminance of each, then `(L1 + .05) / (L2 + .05)`).
- Not yet in code: a `bg-prime-dark` / `bg-prime-tint` pair would make these two options one class each (proposal for @mastermind-style-system; today only plain `.bg-prime` exists).
