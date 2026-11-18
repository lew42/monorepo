# Lab · Templates: page, section and card templates (pilot, 2026-11-18)

**What it is.** A test of [vocabulary v6](./naming/vocabulary-v6.md) in Lew42 v2: every Page and every Card is a frame holding a stack of full-width, zero-gap **sections** (Header, Body, Footer, Hero, Media). The frame carries the treatment (background, radius, shadow, width); the sections carry the padding. Built on a new page, [Lab · Templates](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=387-2), right before `Archive ↓`. Nothing else in the file changed. Your words: the last three sections of [owner-words-2026-11-17-naming.md](./owner-words-2026-11-17-naming.md) ("Let's test it out… develop page templates, section templates, card templates").

**The answer in one line:** the model holds. A new 1000 About page took **22 steps** from the templates (5 to shape it, 17 to type text). The Explorations landing took 34 from the Index, counted the same way (12 shape, 22 text), so the templates cut the shape steps from 12 to 5. About pages at 500 and 1920 took 4 and 3 shape steps.

## The page

`Root` `387:3` (setup B, as on Explorations: no fill, padding 0, gap `gap`, wrap, Scale 1920 Desktop; 7636 × 6103, 1.25 : 1, inside rule 12's "2:1 to square"). Three tinted groups, each setting its own Scale mode once:

| Group | Node | Holds |
|---|---|---|
| `500 · Small` | `387:4` | four columns: Sections, Cards + Card ↔ Section, `Pages · Long` (the Pages heading, then the Long page), `Short + test` (the Short page, then `Test · About at 500` `399:451`) |
| `1000 · Default` | `387:23` | the same, with `Test · About page` `394:412` under the Short page, plus a fifth column, `Test · Pricing page` `393:521` (the page is `409:559`) |
| `1920 · Desktop` | `387:42` | the same (test `399:520`); every section except Media holds a `Container` capped at `max-width` (1600) |

Each test page sits under the Short page it was built from. The Pages heading sits over the Long page only, so the columns end close together: 500 within 16% (2154 to 2559), 1000 within 9% (2316 to 2541, the Pricing column at 2431), 1920 within 9%.

**Row 1 ends flush with row 2** (2026-11-18). Moving things alone could not close the void at the top right: row 1 can't be shorter than its Long pages, and at that height the existing templates filled only 6366 of the 7636. The fix was new content, a second 1000 test page (Pricing) in its own column. A 1000 column adds 1032, which leaves 238. So the `1000 · Default` group is set to Fill in Root, and its shelf spreads the leftover over its four gutters (space between: 92 instead of the 32 gap token). If a column is added or removed, the gutters re-spread by themselves. The other way to use the 238 would be a wider right padding on the group, which reads as a void.

Each group's columns open with a title and a one-paragraph note; the Sections column ends with a nesting tree.

## The masters (33, all with descriptions)

| Kind | 500 | 1000 | 1920 |
|---|---|---|---|
| `Sections/X · Header` (transparent; logo, nav, Button) | `390:43` | `388:2` | `390:111` |
| `Sections/X · Hero` (Dark; Content · Hero) | `390:48` | `388:12` | `390:122` |
| `Sections/X · Body` (transparent; Content · Text) | `390:56` | `388:22` | `390:133` |
| `Sections/X · Body · 2` / `· Body · 3` (Light gray; Cards as its own columns) | `390:98` (2, they stack at 500) | `388:64` (3) | `390:177` (3, in the Container) |
| `Sections/X · Media` (flush; full-bleed image, radius 0) | `390:60` | `388:26` | `390:138` |
| `Sections/X · Footer` (Dark) | `390:63` | `388:29` | `390:141` |
| `Cards/X · Card` (Body → Content) | `390:69` | `388:35` | `390:148` (1600 wide) |
| `Cards/X · Card · Header + Footer` | `390:75` | `388:41` | `390:154` |
| `Cards/X · Card · Media` (Media + Body) | `390:90` | `388:56` | `390:169` |
| `Pages/X · Short` (Header, Hero, Body, Footer) | `391:117` | `391:225` | `391:349` |
| `Pages/X · Long` (8 sections) | `391:141` | `391:254` | `391:382` |

Tokens only: `section-pad` on page sections (Header uses `pad-y` top and bottom), `pad` on a Card's sections (vocabulary caveat 1), `gap`, `text-gap`, `radius`, `card-min`, `max-width`, Scheme. Content comes from the existing `Content/500`, `Content/1000` and `Content/1600` masters.

## How to build a page from them

1. Drag `Pages/X · Short` or `· Long`.
2. Swap a section for another `Sections/X` section, or swap a Body's Content. Both work on the instance as it is.
3. To add or remove a section, detach the Page once. Its sections stay instances.
4. Type the text.

The test page: drag `Pages/1000 · Short`, detach, rename it About, drag in `Sections/1000 · Body · 3`, swap the Body's Content to Text + Media, then 17 text overrides.

**The second test page, Pricing: 45 steps** (11 shape, 34 text), counted the same way. Shape: drag `Pages/1000 · Short`, detach, rename it Pricing, drag in `Sections/1000 · Body · 3` and swap its three Cards to `Card · Header + Footer` (the plans), then drag in two `Sections/1000 · Body` and swap their Content to Text + Media ("Every plan includes") and Stat (three numbers). The Short page's own Body became the question. Text: the logo, the hero (4), three plans (name, tag, price, line and two Button labels each, 18), the includes (2), three numbers (6), the question (2) and the copyright. It has 7 sections to About's 5, and most of the extra steps are words, not shape: 2.2 shape steps per section for About and 1.6 for Pricing.

## What the test showed

- **Card ↔ section is three overrides on the Card** (radius 0, shadow off, width Fill), plus parent padding 0. Shown per size in the `Card ↔ Section` column.
- **Three cards with min width `card-min` do not fit at 1000** (3 × 320 + 2 gaps > 904), so the 1000 `Body · 3` drops the min width. At 500 the two cards of `Body · 2` stack, which is the wrap working.
- **A card's Footer has no top padding** (the reviewer found two stacked paddings, 96 at 1000, reading as a void). The Body above already pads, so the Footer's top is 0 and its other sides bind `pad`. Page Footers keep `section-pad`, because their Dark fill differs from the section above.
- **A card footer with two Buttons must wrap.** At 280 wide (a `Body · 3` column at 1000), the two Buttons in `Card · Header + Footer` stuck out of the card. Its Footer, at all three sizes (`390:75`, `388:41`, `390:154`), now wraps (rule 8), with the wrap spacing bound to the same gap token, so the Buttons stack when the card is narrow.
- **A swapped Content keeps its old height** (also seen on Explorations); set it to Hug after the swap. Every Content inside these masters is Hug.
- **Lint: 0 errors, 19 warnings** (18 before the Pricing page; its Header is the 19th). The warnings are `padded-no-fill` on the transparent Header and Body sections: the model puts the background on the frame, not the section (vocabulary caveat 3). Rule 2's wording and lint's check are proposed as an improvement in [improvements.jsonl](../improvements.jsonl), not changed here.
- **1920 "Text beside a photo" looks like it has a gap in the middle, but the master is right.** `Content/1600 · Content · Text + Media` (`252:784` on 1600 LG) is already two equal halves with the photo set to Fill: 778 + 40 + 778 in the 1600 Container. The space comes from the text, which is shorter than its half: the body stops at the 720 measure and the title is short. To close the gap you would give the text more room (a wider measure or a ⅔ + ⅓ split), not change the halves. Checked 2026-11-18; the master was left unchanged.

## Alternatives

- **Card sections as instances of the page sections** (the same master in both). Not chosen: page sections bind `section-pad` and card sections `pad`; the values are equal at 500 and 1000 and differ by 4 at 1920 (72 vs 68).
- **Pages as plain frames to duplicate** instead of masters. Not chosen: a master shows in Assets and can be dragged out; detaching it once is one step.
