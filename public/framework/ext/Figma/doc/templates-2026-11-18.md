# Lab · Templates: page, section and card templates (pilot, 2026-11-18)

**What it is.** A test of [vocabulary v6](./naming/vocabulary-v6.md) in Lew42 v2: every Page and every Card is a frame holding a stack of full-width, zero-gap **sections** (Header, Body, Footer, Hero, Media). The frame carries the treatment (background, radius, shadow, width); the sections carry the padding. Built on a new page, [Lab · Templates](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=387-2), right before `Archive ↓`. Nothing else in the file changed. Your words: the last three sections of [owner-words-2026-11-17-naming.md](./owner-words-2026-11-17-naming.md) ("Let's test it out… develop page templates, section templates, card templates").

**The answer in one line:** the model holds. A new 1000 About page took **22 steps** from the templates (5 to shape it, 17 to type text). The Explorations landing took 34 from the Index, counted the same way (12 shape, 22 text), so the templates cut the shape steps from 12 to 5. About pages at 500 and 1920 took 4 and 3 shape steps.

## The page

`Root` `387:3` (setup B, as on Explorations: no fill, padding 0, gap `gap`, wrap, Scale 1920 Desktop; 7636 × 6103, 1.25 : 1, inside rule 12's "2:1 to square"). Three tinted groups, each setting its own Scale mode once:

| Group | Node | Holds |
|---|---|---|
| `500 · Small` | `387:4` | four columns: Sections, Cards + Card ↔ Section, `Pages · Long` (the Pages heading, then the Long page), `Short + test` (the Short page, then `Test · About at 500` `399:451`) |
| `1000 · Default` | `387:23` | the same; its test is `Test · About page` `394:412` (17 text overrides, the step count) |
| `1920 · Desktop` | `387:42` | the same (test `399:520`); every section except Media holds a `Container` capped at `max-width` (1600) |

Each test page sits under the Short page it was built from. The Pages heading sits over the Long page only, so the four columns end close together: 500 within 16% (2154 to 2559), 1000 and 1920 within 9%.

**The void at the top right stays** (about 1270 × 2765). Row 1 (500 + 1000) is 6366 wide and the 1920 row is 7636. It can't be closed by moving things. Row 1 can't be shorter than its Long pages (about 2700 with headings), and at that height the 500 and 1000 templates fill only about 6400 of width. Adding columns (splitting Short | Long | Test, or giving Card ↔ Section its own column) makes row 1 wider, but each new column ends 900 to 1600 short of the Long page, so the void just moves inside a group. Closing it needs about 1270 of new content in row 1, for example a second 1000 test page beside the first.

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

## What the test showed

- **Card ↔ section is three overrides on the Card** (radius 0, shadow off, width Fill), plus parent padding 0. Shown per size in the `Card ↔ Section` column.
- **Three cards with min width `card-min` do not fit at 1000** (3 × 320 + 2 gaps > 904), so the 1000 `Body · 3` drops the min width. At 500 the two cards of `Body · 2` stack, which is the wrap working.
- **A card's Footer has no top padding** (the reviewer found two stacked paddings, 96 at 1000, reading as a void). The Body above already pads, so the Footer's top is 0 and its other sides bind `pad`. Page Footers keep `section-pad`, because their Dark fill differs from the section above.
- **A swapped Content keeps its old height** (also seen on Explorations); set it to Hug after the swap. Every Content inside these masters is Hug.
- **Lint: 0 errors, 18 warnings.** The warnings are `padded-no-fill` on the transparent Header and Body sections: the model puts the background on the frame, not the section (vocabulary caveat 3). Rule 2's wording and lint's check are proposed as an improvement in [improvements.jsonl](../improvements.jsonl), not changed here.
- **1920 "Text beside a photo" looks like it has a gap in the middle, but the master is right.** `Content/1600 · Content · Text + Media` (`252:784` on 1600 LG) is already two equal halves with the photo set to Fill: 778 + 40 + 778 in the 1600 Container. The space comes from the text, which is shorter than its half: the body stops at the 720 measure and the title is short. To close the gap you would give the text more room (a wider measure or a ⅔ + ⅓ split), not change the halves. Checked 2026-11-18; the master was left unchanged.

## Alternatives

- **Card sections as instances of the page sections** (the same master in both). Not chosen: page sections bind `section-pad` and card sections `pad`; the values are equal at 500 and 1000 and differ by 4 at 1920 (72 vs 68).
- **Pages as plain frames to duplicate** instead of masters. Not chosen: a master shows in Assets and can be dragged out; detaching it once is one step.
