# Spacing and modes: what real systems do (research, 2026-11-17)

This answers the mode-cascade problem in [owner-words-2026-11-17-root.md](../owner-words-2026-11-17-root.md). The problem: you set a big Section to Mega, and every Auto card inside gets Mega padding. Fixing that today takes per-card overrides or a wrapper ([mode-split.md](../mode-split.md)). It is research only: nothing in Figma was changed. **[V]** means seen in the source. **[R]** means reported second-hand.

## Conclusion

1. **No system we checked lets card padding change with screen width.** Material 3 cards use fixed padding (4–24dp) at every window size [V]. Figma's Simple Design System gives cards a fixed 24 or 32 and only switches the *section's* padding between Desktop and Mobile [V]. Carbon's scale and Atlassian's `space.*` tokens are fixed and have no breakpoint modes [V]. Untitled UI uses one 4px scale at every width [V].
2. **What does change with width is page-level spacing, and only a little.** That means the page margin, the gutter between columns and the section's vertical rhythm. M3 margins go 16 → 24dp and then stop, with gutters 8 → 16 → 24 [V]. Untitled UI's container padding is 16 on mobile and 32 on desktop [V]. SDS section padding is 24 on mobile and 48 on desktop [V]. Carbon says "jump a step on the spacing scale at page breakpoints" [V].
3. **Extra width goes into a max-width container or into more columns, never into bigger padding.** Untitled UI puts a 1280 container in a 1440 frame [V]. M3 adds panes from 840dp and up [V].
4. **One mode per screen, set at the top; nobody nests modes.** Figma's model is "set the mode on the outermost frame, and everything inside inherits it." Modes can also be set on a whole page [V]. The "nested modes" write-ups are about combining collections (brand × theme), not about overriding a parent's size inside it [R].
5. **So our pain is self-made.** We put card tokens (`pad-x`, `pad-y`, `button-pad`, `radius`, `text-gap`) in the same collection as page tokens (`section-pad`, `content-max`), and that collection switches with width. Any frame that sets the page size therefore also resizes every card inside it.

## Q2: modes on everything, or split the tokens?

| | **Rule 19** (modes only on Root, Root columns or viewports, and a Container whose cards differ) | **Split** (cards don't follow Scale) |
|---|---|---|
| What you must remember | Where each of the 3 mode spots is, plus "freeze the children before Root goes to Mega" | Nothing; a Mega Section can't touch a card |
| Failure if forgotten | Cards silently take Mega padding (today's bug) | None; at worst a card looks the same at 400 and 3440, which is what M3 and SDS intend |
| Cost | Zero now; a wrapper per grid forever | About a day of rebinding ([mode-split.md](../mode-split.md), option C), done once |
| Matches real systems | No (it is a workaround for our token layout) | Yes |

**Split wins.** The simplifying assumption that makes it hard to mess up is ***cards don't scale; only the page does.*** Card tokens get one value (a single-mode collection, e.g. `Card` or the existing `Constants`). `Scale` keeps only the page tokens: `section-pad-x/y`, the grid `gap` between cards, and `content-max`. If a dense or roomy card is ever wanted, add a 2-mode `Density` collection (Compact / Default) that is set only on a Container. Because its default is never set, forgetting it does no harm. Rule 19 then shrinks to one line: *set Scale on the frame that sets the width (Root, a column, a viewport), nowhere else.* The freeze step is no longer needed.

## Q3: the token remap (1920 ≈ 72, 2600 ≈ 120, 3440 ≈ 256)

What real systems use for page margin and section padding:

| System | Mobile | Tablet | Desktop | Wider |
|---|---|---|---|---|
| Material 3 margin / gutter | 16 / 8 | 24 / 16 | 24 / 24 | 24 / 24 (adds panes instead) [V] |
| Untitled UI container padding | 16 | 32 | 32, in a 1280 max container | the same [V] |
| SDS section padding (y), card padding | 24, 24–32 | – | 48, 24–32 (hero 160) [V] | – |
| Atlassian largest space token | | | 80 [V] | |
| Common web practice, section spacing | 16 sides | | 64–96 | 96–128 on ultra-wide [R] |

- Your **72 at 1920** fits (inside 64–96).
- **120 at 2600** is at the top of what anyone uses.
- **256 at 3440 is about 2× the largest value we found.** Real systems would keep about 128 and cap the content (a `content-max` of about 1600–2880, with auto margins) or add columns. At 3440 the empty space is a layout decision, not a padding token.
- The ratios also wobble: 72 / 1920 is 3.8%, 120 / 2600 is 4.6% and 256 / 3440 is 7.4%. A steady ladder is easier to trust. [scale-tokens.md](../scale-tokens.md) already proposed 120 / 160 / 240 for Desktop / XL / Mega. By this research those are high but consistent. 72–96 / 112–128 / 128–160 plus a `content-max` would match real systems more closely.

## Recommendation

1. **Split the tokens.** Card padding, button padding, radius and text-gap get one fixed value. Only `section-pad`, the card `gap` and `content-max` stay in Scale.
2. **Scale is set once per width frame** (Root, a Root column, a viewport), never on a Section, a Container or a card. Rule 19 becomes that one line, and the freeze step and the wrappers go away.
3. **Grow the page margin slowly and cap the content:** section-pad-x about 16 / 32 / 48 / 72 / 96 / 128 from Mobile to Mega, plus a `content-max`. Don't use 256.
4. **Test it before rebinding:** mock one 3440 Section with fixed-value cards beside today's in a lab frame (one `use_figma` call), and you judge it.
5. **The alternative:** keep everything in Scale and follow rule 19 with wrappers. It works today, but it relies on remembering three places.

## Sources

- Figma: [Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables) (Auto inherits from the nearest parent with a mode; modes on frames, sections and pages)
- Simple Design System: [section.css](https://github.com/figma/sds/blob/main/src/ui/layout/Section/section.css), [cards.css](https://github.com/figma/sds/blob/main/src/ui/compositions/Cards/cards.css), [CardGridIcon.figma.ts](https://github.com/figma/sds/blob/main/src/figma/compositions/card-grid/CardGridIcon.figma.ts) (`Platform` picks section padding 1200 or 600)
- Material 3: [layout and responsive reference](https://github.com/hamen/material-3-skill/blob/master/skills/material-3/references/layout-and-responsive.md), [M3 breakpoints](https://m3.material.io/foundations/layout/applying-layout)
- [Carbon spacing](https://carbondesignsystem.com/elements/spacing/overview/) · [Atlassian spacing](https://atlassian.design/foundations/spacing) · [Untitled UI grids and spacing](https://www.untitledui.com/components/grids-spacing)
- [Belka: breakpoint variables](https://belkadigital.com/blog/why-youll-kick-yourself-for-not-designing-responsive-components-with-figma) · [Figma variables playbook 2025/26](https://www.designsystemscollective.com/design-system-mastery-with-figma-variables-the-2025-2026-best-practice-playbook-da0500ca0e66) [R] · [Common section spacing values](https://better-design.com/principles/ui/spacing) [R]
- Our side: [mode-split.md](../mode-split.md), [scale-tokens.md](../scale-tokens.md), [root-plan-2026-11-17.md](../root-plan-2026-11-17.md)
