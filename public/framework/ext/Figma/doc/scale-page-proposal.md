# A Tokens page that looks like the variables panel (2026-11-17, built the same night: see [Built](#built-2026-11-17))

The table of values below was read during the proposal, while Scale held other values; the live values are on the page itself.

File: Lew42 v2 (`ADpu9u2V0BlEZfR3rrMfER`). Read only: no edits were made in either file. Your words behind this are the last third of [owner-words-2026-11-17-sizes.md](./owner-words-2026-11-17-sizes.md): "it didn't mimic the look and feel of the actual variable collection system… I want to be able to see everything that's defined in our design system on the screen."

## Conclusion

1. **Build one new page, `Tokens`, directly after Index.** It shows every collection as a table laid out exactly like Figma's variables panel: one row per variable, one column per mode, in the panel's own order. Each cell shows the number and a live sample.
2. **Under the tables:** one strip per Scale mode, showing the same two cards in each mode. Beside the Scheme table, one strip with the same card in each of the four schemes.
3. **Size: about 5000 × 2900 (1.7 : 1).** With 4 Scale modes instead of 8, it shrinks to about 4100 × 2500 (1.65 : 1) on its own, because one script builds a column and a strip for each mode it finds.
4. **It can't go stale.** Every sample is bound to its variable, and the numbers are too: Figma lets a text layer bind to a number variable (still to be confirmed in the first build call). The few labels that can't be bound (colour hex codes, text-style specs) are written by the same script, and a lint check flags any that drift.
5. **On the Index:** one link card, no preview. Once you approve the Tokens page, the old Scale page goes to `Archive · Pages` (rules 14 and 29).

## What the three old attempts got right and wrong

| Where | Worked | Confused |
|---|---|---|
| Big Sloppy, **↳ Scale** token page ([503:12812](https://www.figma.com/design/hbolzQ3Xnc78rhxAPj8xK2?node-id=503-12812)) | Rows are tokens and columns are modes, the same way round as the panel. Every shape is live. | It is one page per collection (10 pages), so you never see everything at once. Each cell is a 300 × 161 white card, which makes 14 rows 3440 × 2761. The numbers are typed, and they have already drifted (it says Mega `pad-x` is 56). |
| Big Sloppy, Scale page, **"Every value"** table (inside [185:10457](https://www.figma.com/design/hbolzQ3Xnc78rhxAPj8xK2?node-id=185-10457)) | The closest to the panel: live, compact (54 px rows), one row per token. | It shows bars but no numbers. The columns run in mode-creation order (XS, SM, Default, LG, XL, Mobile, Mega), which is neither the panel's order nor size order. Long bars spill into the next column. It sits in the middle of a 1920 × 7875 page (4 : 1). |
| Big Sloppy, **Tokens** page and the Index's Foundations column | Collection cards with their modes as pills give a good map. The Index's Scale preview, the same mini page at each step, reads well. | The cards show no values. Nothing connects a card to the panel. |
| v2, **Scale** page ([5:5](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=5-5)) | The idea of a live sample per mode. | It is turned the wrong way. "Tokens · by mode (live)" ([50:4237](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=50-4237)) puts each mode in its own column at its real width (360 to 3440) and lists the tokens down each column, so the labels repeat 8 times. The section is 12368 × 950 (13 : 1), unreadable when zoomed to fit, and has no numbers. The sample cards' text is stale: it says padding 16 at XS and 128 at Mega, but `pad-x` is now 32 in every mode, and it says "12 variables" where there are 13. The `Masters` strip (13264 × 410) is empty. Root is 13776 × 11749. |

**The one lesson:** the panel's shape (variables down, modes across, a number in every cell) is what you carry in your head. All three attempts broke at least one part of it.

## What v2 defines today (read live, 2026-11-17)

**`Lew42 v2 · Scale`**: 13 numbers × 8 modes. In panel order: 1000 Default, 360 XS, 400 Mobile, 500 SM (was 600 SM), 1600 LG, 1920 Desktop, 2600 XL, 3440 Mega.

| variable | 1000 | 360 | 400 | 600 | 1600 | 1920 | 2600 | 3440 | scope |
|---|---|---|---|---|---|---|---|---|---|
| pad-x | 32 | 32 | 32 | 32 | 32 | 32 | 32 | 32 | GAP |
| pad-y | 32 | 32 | 32 | 32 | 32 | 32 | 32 | 32 | GAP |
| gap | 32 | 12 | 24 | 22 | 40 | 44 | 48 | 64 | GAP |
| radius | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | CORNER_RADIUS |
| squeeze | 1600 | 1600 | 1600 | 1600 | 1600 | 1600 | 1800 | 2400 | WIDTH_HEIGHT |
| section-pad-x | 48 | 16 | 16 | 32 | 64 | 72 | 120 | 256 | ALL |
| section-pad-y | 48 | 16 | 32 | 32 | 64 | 72 | 120 | 256 | ALL |
| button-pad-x | 32 | 12 | 14 | 18 | 24 | 24 | 28 | 36 | ALL |
| button-pad-y | 12 | 6 | 8 | 10 | 14 | 16 | 16 | 20 | ALL |
| text-gap | 12 | 4 | 6 | 6 | 10 | 12 | 12 | 16 | ALL |
| card-min | 320 | 280 | 280 | 280 | 400 | 432 | 500 | 600 | ALL |
| width | 1000 | 360 | 400 | 600 | 1600 | 1920 | 2600 | 3440 | WIDTH_HEIGHT |
| measure | 720 | 720 | 720 | 720 | 720 | 720 | 720 | 720 | WIDTH_HEIGHT |

**`Lew42 v2 · Colors`** (1 mode): prime #FF7950, light #F5F5F5, dark #433E37, error #CC0000, ok #15803D, warn #A16207, ink #1A1612, master #8B5CF6, tint black 5% (ALL_SCOPES).

**`Lew42 v2 · Scheme`** (White, Light gray, Prime, Dark):

| variable | White | Light gray | Prime | Dark |
|---|---|---|---|---|
| text | black 80% | black 80% | white | white |
| muted | black 55% | black 55% | white | white 70% |
| fill | white | → light | → prime | → dark |
| accent | → prime | → prime | white | → prime |
| on-accent | → ink | → ink | → ink | → ink |

**`Lew42 v2 · Surface`** (Card, Section): surface-gap (→ gap, 1), layout-padding (→ gap, 0), surface-radius (→ radius, 0), surface-ground (→ light, black 12%).

**Text styles (8):** h1 Montserrat Black 48 / 200%, h2 Bold 36 / 150%, h3 SemiBold 24 / 140%, h4 Bold 14 / 140%, body Medium 16 / 180%, label Bold 16 / 24, code JetBrains Mono 14 / 160%, small SemiBold 12 / 140%. None of them is bound to a variable. **Effect styles (1):** Card shadow, two drop shadows (y 1, blur 2, 6%; y 4, blur 12, 5%). **Paint styles:** none.

**What the page will make obvious at once:** in 8 modes, `pad-x`, `pad-y`, `radius` and `measure` never change, and `on-accent` is the same in all 4 schemes. So today a Scale mode changes only the gaps, section padding, button padding and widths. The page marks such rows "same in every mode" (the builder works that out), which is the clearest argument for fewer modes.

## The page

```
Tokens  (Root v2: no fill, padding 0, gap 64, wraps at a fixed width of ~4990)
┌────────────────────────────── Row 1: the tables ───────────────────────────────────────┐
│ Scale · 13 × 8              1920 │ Colors · 9 × 1           │ Text styles · 8          │
│ name    │1000│360│400│…│3440     │ prime  ■ #FF7950         │ h1   Aa The quick… 48/200│
│ ─ Card ───────────────────       │ light  ■ #F5F5F5  …      │ h2   Aa The quick… 36/150│
│ pad-x   │▣32 │▣32│…  [same]      ├──────────────────────────┤ …                        │
│ gap     │▪▪32│▪▪12│…             │ Scheme · 5 × 4           │ small Aa …        12/140 │
│ radius  │◰4  │◰4 │…  [same]      │ text   │Aa│Aa│Aa│Aa      ├──────────────────────────┤
│ ─ Section ─ ─ Button ─ ─ Text ─  │ fill   │■ │■ │■ │■       │ Effect styles · 1        │
│ ─ Width: card-min, squeeze, …    │ Scheme strip:            │ Card shadow [ card ]     │
│ Surface · 4 × 2   │Card│Section│ │ [card][card][card][card] │                          │
└──────────────────────────────────┴──────────────────────────┴──────────────────────────┘
┌────────────────────────────── Row 2: one strip per Scale mode ─────────────────────────┐
│ 360 XS        400 Mobile       600 SM          1000 Default                            │
│ [▒[card][card]▒] [▒[card][card]▒] [▒▒[card][card]▒▒] [▒▒▒[card][card]▒▒▒]              │
│ 1600 LG            1920 Desktop         2600 XL                3440 Mega               │
│ [▒▒▒▒[card][card]▒▒▒▒] [ … ]  [▒▒▒▒▒▒[card][card]▒▒▒▒▒▒]  [▒▒▒▒▒▒▒▒▒[card][card]▒▒▒▒▒▒▒▒▒] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**The tables (row 1).** Each table is one tinted group (Colors `tint`) titled with the collection name and its size ("Scale · 13 × 8").
- **Columns:** a name column 260 wide, then one 200-wide column per mode, headed with the mode name exactly as the panel shows it, in the panel's order (the default mode first). Each mode column is a frame with that collection's mode set explicitly, so every cell below it resolves in that mode.
- **Rows:** 56 tall. Thin group rows split Scale into Card, Section, Button, Text and Width, the way the panel shows slash groups.
- **Each cell shows the number (bound text) and a sample:**
  - padding: a small box with that padding around a dot;
  - gap: two squares that far apart;
  - radius: a square with that corner;
  - colour: a swatch with its hex code;
  - text colour: "Aa" on its scheme's own `fill`.
- **Lengths wider than a cell** (`width`, `squeeze`, `card-min`, `measure`, and `section-pad` at Mega) show only the number. Their real size shows in the strips.
- **Text styles** get one row per style: a sample line in that style (live), then font, size and line height.

**The strips (row 2).** One strip per Scale mode, in size order, labelled with the mode name and its bound `gap`, `section-pad` and `button-pad` numbers.
- **Each strip** is a tinted section with that Scale mode, holding two `400 · Default` cards, each with the same Content (title, line, Button). The cards keep one width in every strip, so the only differences you see are the mode's.
- **Wrapping:** the strips wrap 4 to a row; the small modes fit one row and the big modes the next.
- **The Scheme strip** sits under the Scheme table: the same card four times, one per scheme mode, on a `light` ground.

**Size, in numbers (8 modes):**
- Row 1 is about 4990 wide (1920 + 1760 + 1180, with gaps) and 1550 tall.
- Row 2 is about 4610 wide and 1200 tall.
- With the title, the page is about 4990 × 2900, so 1.7 : 1.

## When the modes shrink

mastermind-tiers (its proposal will be `doc/tiers-proposal.md`, not written yet) is proposing fewer sizes. Nothing on this page is drawn by hand: one script reads the collections and makes one column and one strip for each mode it finds, then sets Root's width to the widest row. With 4 modes:
- the Scale table becomes 1060 wide;
- the strips fit one row;
- the page comes out about 4100 × 2500 (1.65 : 1).

Re-run the script after adding or removing a variable, mode or style. Lint then confirms the page is current, through a new check `tokens.coverage`: every variable has a row, every mode has a column, and every unbound label matches its value.

## How it fits the Index

- **On the Index:** one card in the first group, "Tokens: every variable, mode and style", linking to the page. No preview, because you asked for fewer previews on the Index, and this page is too large to preview usefully. The alternative is to make the Scale table a component and place one instance on the Index: it would be live, but it adds about 1920 × 1000 to a page you want smaller.
- **The AI page's Systems map** links here for "what does a token resolve to".

## Choices made, and the alternatives

- **Column order follows the panel (1000 Default first),** because the ask is to match the panel. The alternative is size order (360 first), which matches the size pages. The panel always puts the default mode first, so getting size order there too would mean making 360 the default mode.
- **Spacing samples are drawn at full size, never scaled.** Scaling a frame in Figma breaks its variable bindings, so bigger values show as a number only and are seen at full size in the strips.
- **Optional: rename the Scale variables into slash groups** (`card/pad-x`, `section/pad-x`, and so on) so the panel itself shows the same groups as the page. A rename keeps every binding, but it is your call, because the names travel into every file that uses the library.
- **A new page, not a rebuild of Scale:** this follows rule 14 (build beside the old one). The Scale page's masters (`Card` `16:364` and others) must move to their homes first ([master-homes.md](./master-homes.md)), and then its Root goes to `Archive · Pages`.

## To build (after your look)

- **Who builds it:** one Sonnet builder with the script `scripts/tokens-page.figma.txt` (beside `index-pages.figma.txt`).
- **Calls:** about 5 `use_figma` calls (tables, strips, Root width, lint, screenshot).
- **Estimated cost:** about $4. A different agent reviews it.
- **The first call** tests binding a text layer to a number variable. If Figma refuses, the numbers become script-written labels like the hex codes, and `tokens.coverage` guards them.

## Built (2026-11-17)

[Open the Tokens page](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=359-2) (page `359:2`), right after Scale. Scale was not touched, and no value was typed: every number was read live from the variables.

**Layout.** `Root` `359:3` has no fill, padding 0, gap `gap`, Scale mode 1920 Desktop, and runs horizontally with no wrap. It holds two equal Root columns, each 3844 wide (tint fill, `section-pad` padding, 1920 Desktop). The page is 7732 × 4882 (1.6 : 1).

| Part | Node | What it shows |
|---|---|---|
| Column `Tokens · Variables` | `359:5` | the tables, the Scheme strip, the styles, the small stretch strips; it fills Root's height, so both columns end level |
| Scale · 13 × 8 | `359:8` | every Scale variable × 8 modes, in panel order (1000 Default first) |
| Colors · 9 × 1 | `359:494` | a swatch and a hex code per colour |
| Surface · 4 × 2 | `359:555` | Card and Section; arrows mark aliases |
| Scale modes · 8 | `367:7112` | each mode's width (written from the live `width`), the low, middle and high end of its range, and which three are the core sizes (500 SM, 1000 Default, 1920 Desktop) |
| Row · Scheme | `360:2` | Scheme · 5 × 4, then the Scheme strip `360:105`: one `1000 · Default` per scheme |
| Row · Styles | `360:140` | Text styles · 8, Effect styles · 1, and "How to read this page" |
| Stretch · 360 XS to 1000 Default | `360:201` | 360 XS `360:205`, 400 Mobile `360:248`, 500 SM `360:291` (320 / 480 / 700) and 1000 Default `360:334` (700 / 1000 / 1300) |
| Column `Tokens · Stretch` | `360:377` | 1600 LG `360:381` and 1920 Desktop `360:424` (1300 / 1800 / 2400, low and mid side by side), 2600 XL `360:467` and 3440 Mega `360:510` (2400 / 3000 / 3440) |

**How it is wired.**
- Each table cell sets its collection's mode on itself, so its sample resolves in that column's mode. The samples are bound:
  - padding (`pad-*`, `section-pad-*`, `button-pad-*`, `layout-padding`): a box with that padding;
  - gaps (`gap`, `text-gap`, `surface-gap`): two dots that far apart;
  - radius (`radius`, `surface-radius`): a square with that corner;
  - colours: a swatch; Scheme: "Aa" on that scheme's own fill.
- A box too big for its cell (padding over 54, a gap over 96) shows only its number. Its real size is in the strips.
- **The numbers are written by the build script, not bound.** Figma refuses it: `variable of resolved type 'FLOAT' cannot be bound to 'characters'`. After a value changes, the samples follow on their own, but the numbers need a rebuild.
- "same in every mode" is computed per row: today `measure` (720) in Scale and `on-accent` (→ ink) in Scheme.
- Every strip holds the same master, `Defaults/1000 · Default` (`251:972`), at three fixed widths. The strip sets the Scale mode and the card inherits it (rule 32).

**Checks.** Lint: 0 errors. The 8 mode-mismatch warnings are the strips being wider than their mode on purpose; the 2 padded-no-fill warnings are table rows named after `section-pad`. The screenshots were checked: nothing is cropped and nothing is outside Root. A fresh reviewer (mastermind-tokens-review) said PASS: every variable has a row, every mode a column, and the numbers match. Its one fix, a card caption that said "1000 wide · Default mode" everywhere, is applied: each of the 28 cards now names its own width and mode (a text override, rule 22).

**Balanced (voice-app follow-up, ~23:20).** Column 1 used to end about 660 above column 2. Moving whole strips only moved the gap, so column 1 got the Scale modes table (above) and now fills Root's height; the two columns end level at 4882. Left on purpose: the big strips leave about 260 empty on the right (3440 in a 3700 column).

**Rebuilt after 600 SM became 500 SM** (mode `2:3`, width 600 → 500, by mastermind-size-system). The script read the live mode name and rewrote every label and frame name, then recomputed every number in the Scale table from the live values in its cell's mode. One number changed: `width` in 500 SM. The SM strip keeps its 320 / 480 / 700 cards, because the range did not change. To redo it after any Scale edit, rerun that pass: rename by live mode names, then recompute each `number` text from `valuesByMode`.

**What the page shows at a glance.** The card's text doesn't scale with the mode: at 3440 Mega the card's padding is 128, but its title is the same size as at 360. And `measure` never changes.
