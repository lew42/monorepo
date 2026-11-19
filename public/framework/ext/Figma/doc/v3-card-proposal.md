# Lew42 v3: cards — verdict, and the proposal it replaced (2026-11-18)

## Verdict (owner, 18:30): his Default card stays

- **Declined:** the switches card (Media, Header or Footer on/off switches) and any single card preset with sections: Card · Plain, Card · Media and the Body layer. The padding stays on the card itself.
- **Default card:** a real card with the standard padding (`pad`) on the card itself, and no radius by default. With radius 0 it doubles as a section in bigger layouts. This is his `Card` (`2:110`) on the Scale page.
- **Section vs card:** a section is full width, radius 0, may have padding, and can fill another section or a page. A card with a radius needs padding around it from its parent; it can't sit flush in a zero-padding section.
- **Nesting:** cards in sections and cards in cards. A nested card on a coloured background uses `lighten` or `darken` as its fill.

On the page, the first column, `Column - Verdict` (`27:169`), lists what is declined, kept and open. The four older columns are tagged DECLINED in red and kept for the record. Two nesting examples (`27:251` Light, `27:304` Dark) show a detached copy of his Default card used as the parent section, holding two of his Cards at Mobile with a `darken` fill. A padded-vs-flush example shows a rounded card (radius bound to `size/1` as a stand-in; there is no radius token).

**Open: a "Needs padding" property (proposed, not built).** A boolean property on the Card master, on for rounded cards, that changes nothing on screen. A later read-only audit would walk every card with it switched on and check that its parent has padding on each side the card touches, listing flush cards by node id. **Simpler alternative:** no property; the audit flags any card with radius above 0 that touches its parent's edge. The property wins only if some rounded cards may sit flush on purpose.

**Images merged:** the two Media instances inside the proposal cards now point at `Image` (`24:25`) on the Images page. `.Proposal/Media` (`16:45`, no instances left) moved to the new **Archive** page (`27:162`), in frame `27:163`.

---

The rest of this doc is the declined proposal, kept for the record.


**Status:** a proposal. It is on the [Proposal page](https://www.figma.com/design/JYGQX0WaBO4HcGMZTkL2rx/Lew42-v3?node-id=16-3) (`16:2`, right after Scale). None of the owner's masters were changed. The cards on that page are a copy, `.Proposal/Card` (`16:48`), so he can click one and try its switches. The owner's words behind it: [owner-words-2026-11-18.md](./owner-words-2026-11-18.md).

## Update (~17:40): two masters, nothing hidden (declined 18:30)

The owner doesn't want every card carrying a hidden Media layer, which would also be exported to the web. He usually detaches cards anyway. So a 4th column on the Proposal page (`19:118`) shows the alternative:

- **Card · Plain** (`.Proposal/Card · Plain`, `19:127`): the Card with Body only (Content + Actions). The Card has 0 padding; Body carries `pad` and `gap`.
- **Card · Media** (`19:144`): a Media above a Card · Plain instance, so edits to Card · Plain reach it.
- **Anything else** (a Footer, two Media, a list): drop a Card · Plain, detach it, and add the section above or below Body.
- **In one line:** switches = one master, but every card carries hidden layers; two masters = nothing hidden, one extra master, and a Footer is a detach.

The switches version below is kept for comparison.

## The idea (first version: switches)

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
