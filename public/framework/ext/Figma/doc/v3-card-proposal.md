# Lew42 v3: one Card, two switches (proposal, 2026-11-18)

**Status:** a proposal. It is on the [Proposal page](https://www.figma.com/design/JYGQX0WaBO4HcGMZTkL2rx/Lew42-v3?node-id=16-3) (`16:2`, right after Scale). None of the owner's masters were changed. The cards on that page are a copy, `.Proposal/Card` (`16:48`), so he can click one and try its switches. The owner's words behind it: [owner-words-2026-11-18.md](./owner-words-2026-11-18.md).

## The idea

Figma can't add a layer into an instance unless the instance has a slot. So Media and Footer already sit inside the Card master, hidden, and two on/off switches (boolean properties) show them. That gives one master, with no variants and no slots: 2 switches × 2 colour modes × 3 sizes = 24 looks from one Card.

## The base set: 4 components, plain frames for the rest

| Piece | Kind | What it is |
|---|---|---|
| Card | component (his) | The surface: fill and clip, padding 0, gap 0. Holds Media, Body and Footer. |
| Media | component (new) | An edge-to-edge image, hidden until switched on. Placeholder `.Proposal/Media` (`16:45`). |
| Button, Icon | components (his) | Unchanged. |
| Body | frame | The padded area inside a card: `pad` around it, `gap` between its blocks. |
| Content | frame, never a component | A plain group of text: no fill, no padding, Fill width, Hug height, `text-gap`. |
| Actions | frame | The button row (his "Frame 1"), with `gap` between the buttons. |
| Footer | frame | A bottom row: `darken` fill, `gap` padding top and bottom, `pad` left and right. |
| Wrapper | frame (his) | Zero padding. Its gap is the space between cards: bind it to `gap` for cards, set it to 0 for flush sections. |

**Body, not Section:** "Section" stays free for the full-width page band, so that card ↔ section keeps one clear meaning. **Alternative:** call it Section, if it never needs to mean the page band.

## Layer names

```
Card            fill · clip · padding 0 · gap 0
├─ Media        switch "Media", off
├─ Body         pad around · gap between
│  ├─ Content   text-gap
│  │  ├─ Kicker
│  │  ├─ Title
│  │  └─ Text
│  └─ Actions   gap → Button, Button
└─ Footer       switch "Footer", off · darken
```

## Rhythm: two gaps and one edge

- `text-gap` sets the space between lines inside Content.
- `gap` sets the space between blocks inside Body (Content → Actions).
- `pad` sets the space around Body: the card's edge.

The Card itself has no padding and no gap, so Media and Footer sit flush against Body. Each group of text is one Content. A second group of text is a second Content, and `gap` separates the two groups. No other wrappers are needed.

**Background:** the Card keeps its fill. Media and Footer cover it, and it shows behind Body. So Body needs no fill of its own, and a colour mode set on the Card reaches all three parts. **Alternative:** a Card with no fill, where Body carries the fill instead. The owner said he is fine with either.

**Card ↔ section:** his Card has no radius and no shadow, so it already is a section. Give it Fill width inside a full-width Wrapper with gap 0. If cards get a radius later, a section is the same Card with the radius overridden to 0.

## Alternatives, and why not

- **Slots:** one free Content slot. Anything fits, but what you put in belongs to that one instance, and he is wary of slots.
- **Variants:** Media × Footer makes 4 masters to keep in sync by hand.
- **Plain frames:** duplicate a card and edit it. This is free, but there is no master to change them all.

## To adopt it on his Card (when he says yes, about 5 minutes)

1. Card (`2:110`): set padding 0 and gap 0.
2. Wrap Content (`5:128`) and "Frame 1" (`12:224`) in a frame named Body, with padding `pad` and gap `gap`.
3. Rename "Frame 1" to Actions, and bind its gap to `gap` (it is 32 now, unbound).
4. Add Media above Body and Footer below it, both hidden, then add the two switches.

His instances should keep their text and colour modes, because the nodes move inside the master without changing their ids.

## Seen while building

- In the Light Footer, the Share button's `darken` fill sits on the Footer's own `darken`, so it reads faintly. A plain or accent button would stand out more.
- The Media placeholder has a fixed height of 240, so it does not scale with the Scale mode. A real image would use scale mode Fill and a fixed aspect ratio.
- One API trap: a paint bound to `accent` on a fresh Button instance came back unbound after the build, and binding it again fixed it.
