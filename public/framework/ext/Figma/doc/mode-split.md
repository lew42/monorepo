# Mode split: one Mega grid of four cards, without Mega padding on the cards (2026-11-16)

Tested in the Lew42 v2 file, frame **Lab · Mode split** (`162:11043`, page Explore – Sizing). Nothing outside that frame changed; no master or variable was touched.

## Conclusion

**Use A, the wrapper.** Put the section's padding on one frame and the grid of cards on a second frame inside it. The padding frame carries the **page size** (Mega). The grid frame carries the **card size** (Default). The cards are set to Auto and follow the grid. It needs one extra frame and no new tokens, and it works today.

**The rule to remember:** *a frame that holds padding and a frame that holds a grid of cards are two frames. The padding frame gets the page size; the grid frame gets the card size.*

The cause of the problem: today one frame ("Grid section") owns both the padding and the cards, so its single Scale mode drives both. Figma has no way to say "this mode for my own padding, that mode for my children" (see D), so the only fix is to give the two jobs two frames. Splitting the Scale collection in two (C) is the long-term fallback, but it costs about a day of rebinding (below) and the wrapper gets the same picture now.

## What was measured (3440-wide section, four cards, 1:1)

| | Section padding | Gap | Card width | Card padding | Screenshot |
|---|---|---|---|---|---|
| X1 today (grid on Mega) | 128 | 64 | 748 | **128** | [x1-today.png](./mode-split/x1-today.png) |
| X2 grid flipped to Default | **48** | 32 | 812 | 48 | [x2-flip-default.png](./mode-split/x2-flip-default.png) |
| **A wrapper** | 128 | 32 | 772 | 48 | [a-wrapper.png](./mode-split/a-wrapper.png) |
| B per-card override | 128 | 64 | 748 | 48 | [b-per-card.png](./mode-split/b-per-card.png) |
| C two collections (mocked) | 128 | 64 | 748 | 48 | [c-mock.png](./mode-split/c-mock.png) |

X1 is the problem (cards of 748 with 128 of padding). X2 is your "if I change the grid to Default" case: the cards are right, but the grid's own margin collapses from 128 to 48.

## The options

### A. Wrapper (recommended)
Region (Mega, owns the padding) > Grid (Default, owns the gap, no padding) > Cards (Auto).
- **Pros:** one extra frame; no new tokens or collections; the padding stays 128 and the cards get 48; the gap follows the cards (32), so it looks like a Default grid in a Mega page. Adding a card needs nothing, because it inherits the grid's Default.
- **Cons:** one more nesting level per grid; a designer who forgets the wrapper gets X1 or X2 again. The gap is the card size's gap (32), not Mega's 64; if you want a 64 gap, that is an override (or the C split).
- **Rule:** padding frame = page size; grid frame = card size.

### B. Per-card override
Grid on Mega; each card instance set explicitly to Default.
- **Pros:** no extra frame; the padding and gap stay Mega (128, 64).
- **Cons:** one override per card, and a newly added or swapped card inherits Mega again, so it silently breaks. Fine for a one-off, bad for a design system.
- **Rule:** every card in a Mega grid needs its own size mode, every time. Nothing warns you if you forget.

### C. Two collections: "Layout" and "Content"
Layout holds `section-pad`, the page gap and `squeeze`; Content holds card `pad`, `text-gap`, `radius`, `button-pad` and `card-min`. A frame can then be Layout = Mega and Content = Default at once.
- **Pros:** it is exactly the "content mode / layout mode" idea; no extra frame; a designer sets two switches on one frame.
- **Cons:** a big change, and every Region/Section frame then carries two explicit modes, so the "set the size only on the outermost frame" rule becomes "set two things". Much of the cost is judging which binding is layout and which is content.
- **Estimated cost (not done):** sampled on Templates, Elements, Showcase, 3440 Mega and Index: about 1,500 Scale bindings, of which about 110 are clearly layout (`section-pad`, width, `measure`) and about 250 are ambiguous `gap` bindings. A script can split most gaps (a gap on a frame whose children are Card instances is a layout gap). Needs a new 8-mode collection, a rebinding script, a judgement pass on the leftovers and a review at every size. About a day of agent work; high risk of silent mismatches.
- **Rule:** every container sets Layout; every card sets Content; never mix them on the same frame without knowing which one you mean.

### D. Anything else
- **Mode mapping** (derive one collection's mode from another's) does not exist. The feature request has had no reply from Figma: [forum](https://forum.figma.com/suggest-a-feature-11/feature-request-let-a-variable-mode-be-derived-from-another-collection-s-mode-mode-mapping-57866). Modes inherit only inside one collection ([help](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)).
- **Extended collections** are Enterprise-only, inherit variables and modes, and allow value overrides, but cannot add variables or modes. They do not stop the cascade ([forum](https://forum.figma.com/report-a-problem-6/extended-collections-collection-variant-and-mode-share-one-value-57108)).
- **Aliasing between collections** resolves with the consuming node's mode for the target collection. A "Layout" variable aliasing `Scale` still follows the node's Scale mode, so it does not decouple ([forum](https://forum.figma.com/ask-the-community-7/managing-linked-modes-across-multiple-variable-collections-in-a-multi-brand-design-system-54208)).
- **Fixed named tokens in a one-mode collection** (`pad-sm`, `pad-md`, `pad-lg`; the (d) hatch in [modes.md](./modes.md)). Bind the section padding to a fixed Mega-sized token and the cascade cannot touch it. This is C-lite: no second switch, but no mode follow either.

Nothing in Figma gives a shortcut today.

## Next step if you accept A
Add the wrapper to the Grid section master (Region frame holding the padding, Grid frame set to Default holding the cards) and write the rule into [modes.md](./modes.md). That edits a master, so it is proposed here, not done.
