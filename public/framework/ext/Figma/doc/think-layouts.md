# The few layouts that make Lew42 v2 feel finished (2026-11-16, a recommendation, nothing edited)

The reference is Big Sloppy's Page Set ([on v2's Index](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=103-25367)), measured with a read-only script. Its strength is not many layouts; it is **one card size and one rhythm repeated**: white cards on #f5f5f5, a dark pill label and an orange kicker and button as the only colour.

## Keep these seven (everything else is a Card swap inside them)

1. **Page shell:** Page (1920, padding 120, content max 1600) → Header (48 title, one 16 line) → Sections stacked 96 apart. Carries the page's width only. It sets the margins and rhythm for every page.
2. **Four features:** Section (dark pill + 36 title) → 4 Cards in a wrap row (icon, title, one line). Cards at Default. The quick "what it does" row; it is the densest a 1600 column holds.
3. **Three cards:** Section (24 title + one line) → 3 Cards in a wrap row (kicker, title, line, button). Cards at Default. **Photo cards are this layout** with Card's full-bleed image turned on, not a second layout.
4. **Masonry three:** Section → 3 vertical columns, cards hug their height. Cards at Default. The only layout for mixed lengths; nothing stretches.
5. **Split:** Section → text (max 720) beside one image or Card, either side (Big Sloppy's `.1600 · Split`). Cards at Default. Breaks the card rhythm once per page, so the grid doesn't get monotonous.
6. **Dark band:** a full-width Section on Scheme Dark (or Prime) with a centred title and one button (`.1600 · Call to action`). The "little dark, little primary": at most one per page.
7. **Sidebar + Main:** a rail that hugs its width and fills the height, beside Main holding layouts 2 to 5. Rail at SM, Main at its own width's mode. The app page; the other six are content pages.

## Why the reference looks strong, in numbers

- **Margins:** 120 page padding, and the 1600 cap centres the content, so 160 a side at 1920. Sections 96 apart; header to first section 48; section title to grid 24.
- **Cards:** padding 48, gap 26, radius 4, a soft shadow. Cards are 381 wide four across and 516 three across, min 320, so a card is 1.2 to 1.6 times its minimum.
- **Type:** page title 48, section title 36 (with a 14 caps pill) or 24 (with a one-line description); card title about 20, body 14 to 16. Descriptions max 760 wide.
- **The trick:** a 1920 page with **1000-Default-sized cards**. The page is wide, the cards are not; the space goes into margins and gaps, not fatter cards.

## v2's Scale tokens against those numbers

- **Match:** Default `pad-x/y` 48, Default `radius` 4, Default `card-min` 320, `squeeze` 1600 (the 1600 cap), `measure` 720 (reference 760), h1 48.
- **Close:** Default `gap` 32 (reference 26). Keep 32, the odd 26 is not worth copying.
- **Don't match:** 1920 Desktop `pad` 68 / `gap` 44 / `radius` 8 / `card-min` 432. Four Cards at 432 min with a 44 gap need 1860, so Four features **wraps to 3 inside 1600**. The reference never used Desktop values on its cards.
- **Don't match:** `section-pad-x/y` equals card `pad` in every mode (68 at 1920). The reference's section spacing is 96 apart and 160 at the sides: twice the card pad, as [scale-proposal.md](./scale-proposal.md) already says (Default 96).
- **Too big:** Mega `pad` 128 is 2.7 times the reference card padding, and the proposal's 160 is worse. A 3440 screen needs bigger margins and more columns, not fatter cards: card pad around 64, `section-pad` 200 to 320.

## One layout at every resolution, without 8 copies

- **One master per layout, built at 1920.** Show it on a bench as **three instances: 400, 1920, 3440**. Each instance overrides only its width and the Scale mode on its outermost frame (the [modes rule](./modes.md)).
- **Columns come from wrapping, not modes.** Cards are Fill with min `card-min`, so 4 → 3 → 2 → 1 happens by itself. Figma can't bind a column count to a mode, so Masonry is the one exception: a 1 / 2 / 3 column swap.
- **Use the 0.5x to 2x rule ([design-system-notes.md](./design-system-notes.md)):** Default cards serve about 500 to 2000, so a 1920 page keeps Default cards like the reference. Mobile covers 360 to 600 and Mega covers 2600+. Three modes do the visible work; the other five are rarely needed.
- **What changes per size is the page, not the card:** page padding and section spacing (`section-pad`) grow with the width, and cards stay one size.
