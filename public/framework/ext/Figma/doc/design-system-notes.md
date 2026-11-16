# Design-system notes: the owner's open thinking (2026-11-16)

These are thoughts from a live voice session, recorded so they survive. **None of them is a decision.** Nothing here changes a token, a collection or a mode; the live files stay as they are until the owner decides. The seven-mode Scale itself is documented in [token-audit.md](./token-audit.md) and [modes.md](./modes.md).

## The Scale modes

- **Seven modes multiply every token edit.** The Scale collection has Default, Mobile, Mega, SM, LG, XS and XL, so changing one idea (say, the pad) means changing seven cells, per token. The cost grows with every token added.
- **A layout should work from about 0.5x to 2x its target width.** If a layout is built for 1000, it should still be fine at 500 and at 2000. If that holds, fewer modes cover the same range.
- **The modes are a Figma stand-in for container-query units in the browser.** In CSS a card scales with `cqi` of its own container; Figma has no such unit, so a mode on a region plays that part. This is why the mode is set on the region (root frame, a column) and matches its width.
- **Possibly fewer modes.** Mobile / Default / Mega, or Standard / Double. **Undecided; don't touch the tokens.**
- **A mode set on a container cascades to its children.** Sometimes that is wanted (a whole column at SM) and sometimes not (a card inside it that should stay Default). The nearest explicit mode wins; set a mode only where the change should stop.

## How we work

- **Review step: test with short and long text.** After building anything with text, try a short and a long (wrapping) string before approving it. Most layout bugs show up only when the text wraps.
- **Build without animation first, add animation later.** Static layouts first; interactive variants and Smart Animate are a layer on top. See [animation-system.md](./animation-system.md) if it exists yet (written during the 2600-layout exploration).

## Layout version

- **Use the Latest auto-layout version everywhere** (it matches CSS border-box). **Equal splits: grid flow + `fr`.** Figma has two versions, Latest (default for new frames since July 2026) and Legacy (can be switched back to only until January 2027). Fixed / Hug / Fill are the same in both; Latest only changes six edge cases (padding as a minimum width, inside strokes counting in layout, a parent's stroke setting no longer reaching children, Fill children splitting by content area, auto gap never negative, a single child in a "Between" stack aligning to the start). What the plugin API can read or set: [layout-versions.md](./layout-versions.md) (written by the layout exploration; may not exist yet).

## Core rules for Lew42 v2 (decided, 2026-11-16)

1. **`Index` is the first page** (the existing `Page 1`, to be renamed). It lists every master component in the file, and only those: one instance of each, with its name, its home page and a one-line purpose. No preview mirrors, no duplicate content. It is the single source an agent reads to know what exists.
2. **Every agent reads `Index` first and reuses what is there.** No new component that duplicates an existing one (v2 already has a `Button` on the `Scale` page). A new master needs the owner's OK, and is added to `Index` in the same step.

3. **Component sets are named like a JS class, dot-nested, ending in " Set"** (the owner, 2026-11-16): `Icon.Item Set`, `Layout.Columns.Two Set`. The dot is the nesting, so the name reads as `Class.Part`.
4. **v2 depends on nothing outside itself.** No instance may have a main component from another file (Big Sloppy included). The remote ones that remain are listed in [component-inventory.md](./component-inventory.md) (encapsulation), to be detached and replaced.
5. **`Elements` is the home of the core content items** (text as styles, `Button`, `Image`); the icon item lives on the `Icons` page. One home per element.
6. **Don't edit the pages the owner is editing by hand** (today: `Index`, `Icons`, `1920 Pages`).
7. **Scale modes are named resolution first, then name** (the owner, 2026-11-16): `360 XS`, `400 Mobile`, `600 SM`, `1000 Default`, `1600 LG`, `2600 XL`, `3440 Mega`; use `<resolution> <name>` in every label. No 1920 mode (undecided). A **`width`** variable in the Scale collection holds each mode's resolution, so a frame whose width is bound to it follows its mode. Proposed re-scaling of the values: [scale-proposal.md](./scale-proposal.md) (not applied).

The inventory and the proposed minimal level-one set: [component-inventory.md](./component-inventory.md). The brief every Figma agent gets carries the same two rules ([explore-brief.md](/framework/ai/sessions/2026/11/16/spawned/mastermind-figma/explore-brief.md)).

## Rules from the explorations (2026-11-16)

- **Master components live loose on the root canvas of their page, visibly, so it is obvious they are masters; never inside a frame** (the owner's later correction: no "Masters" frame, no categorising frame either). Presentation frames never nest masters.
- **Idea, not tried yet: arrows from a master to where its instances are used.** Big Sloppy's "Flow" page has connector/arrow components that could draw them. Caveats: the Lew42 v2 file isn't a library, so those components can't be imported there (they would be rebuilt as plain lines), and Figma's real connector objects are FigJam-only in the plugin API. Worth a try on one page if it stays cheap.
- **No duplicate content between a page's preview and its page content.** Keep one or the other.
- **Every page is self-documenting:** it shows its own tokens, modes and components.

## Structure idea (not decided)

- **One page per "space":** Layout, Text, Scale, Color, Navigation. Each doubles as an asset-library page.
- **One 1920-wide, auto-height preview per page**, gathered on the root design-system page. That worked in Big Sloppy.

## Open question: layout components

- The lean is a **minimal set of building-block components** (for example a column layout with placeholder child cards that shows the structure), **not** pre-built 2/3/4-column permutations that fill the asset panel.
- Permutations can be shown on a page as plain frames or instances, for reference.
- Level-one layouts to cover: 2, 3 and 4 columns; full-height vs auto-height vs card columns; equalized vs natural heights.

## A "content length" space

Short and long text, column wrapping, and how uneven content heights change columns. It is where the review step "test with short and long text" gets its examples.

## Open question: fill/hug turning into Fixed

Figma switches an incompatible fill or hug setting to Fixed on its own (for example Fill inside a Hug parent). When should we fight that, and when just accept it? Worked cases: [Explore – Sizing](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER?node-id=34-28).

## Layer names with sizing (trial)

Putting the sizing after the layer name, width × height, like `Sidebar (Hug × Fill)`, on the "Explore – Layout examples" page only. It does not update itself when the sizing changes, so it is a trial to see whether it helps reading layouts.

## The "level one" kit idea

A small first kit: **text, icons, buttons, images and basic layouts, leaning on browser defaults** (what a plain HTML page would do) instead of inventing a Figma-only behaviour. Everything bigger is built from these. Not started; the explorations on the Lew42 v2 file (Explore pages) are the way to find what belongs in it.

## Related

- [readme.md](../readme.md): the Figma system readme, with the component strategy and modes rules.
- [token-audit.md](./token-audit.md): the collections as they stand, and the open flags (Mega vs XL is not monotonic).
