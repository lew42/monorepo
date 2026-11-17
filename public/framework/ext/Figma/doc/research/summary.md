# Research summary: the simple system (2026-11-17)

One page that pulls together the six research reports for [the brief](../brief-2026-11-17.md). Nothing in Figma was changed to write it. The rules every agent follows are in [rules.md](../rules.md).

## The answer

1. **Real kits sort pages by type, never by size.** Buttons, Text, Icons, Cards, Sections, then a few full examples.
2. **Width is shown, not organized.** Kits draw a card or section once and let its parent set the width. Only layouts get previews, at 2 or 3 widths.
3. **Every kit keeps the page ground and the card colour as two tokens.** A card left on Auto then still stands out from its section.
4. **A Card is a component with one Content slot.** Slots exist so you don't have to detach. Figma names cards as the main use.
5. **Real pages are built from instances only, in a separate file.** They are not masters, and they are not previewed at every width.
6. **For us:** one page per type, one Layouts page previewed at 400, 1000 and 1920, a `surface` token beside `fill`, Card stays a slot component, and a small 3-column Index that lists only approved things.

## Decisions for you

Each one is already chosen. Say no to any of them and it changes.

| # | Decision | Answer | Cost to reverse |
|---|---|---|---|
| 1 | **Pages by type, not by size.** The 8 size pages fold into one Layouts page. A part that only exists at one width (App bar) gets a clear name, not a page. | **Yes.** Every kit we read does this, and it ends the duplicates; the size pages go to Archive, not the bin. | Low: the old pages are archived and can be brought back. |
| 2 | **Card stays a component with one Content slot. Don't detach it.** | **Yes.** It is the cheaper way to be wrong: you can always detach one copy later, but you can't re-link 400 detached cards. | Low. |
| 3 | **Add one `surface` token beside `fill`.** Sections use `fill`, cards use `surface`. Drop 3 cards into a Dark section and they turn dark and still stand out. | **Yes.** Tested in the scratch file: one click flipped a section and all its cards. I chose one extra token, not Material's five, and kept the name `fill` so nothing is renamed. | Low: delete one token and rebind the Card. |
| 4 | **Preview layouts only, at 400, 1000 and 1920.** 3440 only for the page shell. Buttons, text and icons get one preview. Every scheme is shown once, in one strip. | **Yes.** The 8 Scale modes stay as tokens. Only the drawings go. | None: nothing is deleted. |
| 5 | **A new, small Index.** 3 columns (Foundations, Elements and Cards, Layouts), about 25 instances, roughly square. Only approved things. Each thing appears once. | **Yes.** It is built beside the old Index, which goes to Archive once you approve. | None. |
| 6 | **Real designs live in Claude November 2026, not in v2.** They are built from Index instances only. "The first item of a repeated grid is the master" is fine there, never on the Index. | **Yes.** | None. |

## Safe next steps

Rule 14: each step is built beside the old version, on one page, and nothing spreads to other pages until you approve it.

1. **The new Index, first column only.** A new page `Index (new)`, right after Index. It holds the Foundations column: the Scheme strip, Scale and Text. The old Index is not touched. **To approve:** open `Index (new)` next to `Index`. You should see three small, lined-up blocks with no gaps, and each block's name under it.
2. **The `surface` token, on one test frame.** Add `surface` to Scheme (an unused token changes nothing). Bind it on a copy of Card in a test frame, never on the Card master yet. **To approve:** one screenshot: the same 3 cards in a White, a Light gray and a Dark section, each set by one click on the section. Then the Card master switches to `surface`.
3. **The new Layouts page.** A new page `Layouts` holds the 7 layouts from [think-layouts.md](../think-layouts.md), each one row: 400, 1000 and 1920 side by side. It is built from instances, so the masters stay where they are. The size pages are not touched. **To approve:** scan the rows. Nothing should overflow or overlap, and the 400 column should stack. Then the size pages go to Archive, one at a time.

## The reports

- [kits.md](./kits.md): how 10 real kits organize pages and widths (A, F).
- [figma-kits.md](./figma-kits.md): Figma's own kits, read from the library (G).
- [properties.md](./properties.md): properties, variants, slots and grids (B, D).
- [color.md](./color.md): one fill or `bg` + `surface`, with the test (C).
- [process.md](./process.md): system, theme and real designs; which widths to preview (E, F).
- [index-audit.md](./index-audit.md): what is on the Index today, and the small Index (H).
