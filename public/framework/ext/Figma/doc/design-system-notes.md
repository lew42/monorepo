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

## The "level one" kit idea

A small first kit: **text, icons, buttons, images and basic layouts, leaning on browser defaults** (what a plain HTML page would do) instead of inventing a Figma-only behaviour. Everything bigger is built from these. Not started; the explorations on the Lew42 v2 file (Explore pages) are the way to find what belongs in it.

## Related

- [readme.md](../readme.md): the Figma system readme, with the component strategy and modes rules.
- [token-audit.md](./token-audit.md): the collections as they stand, and the open flags (Mega vs XL is not monotonic).
