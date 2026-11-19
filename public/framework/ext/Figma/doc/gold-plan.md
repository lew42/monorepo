# Lew42 v2: the gold and the plan (2026-11-16, merge of 16 reports, nothing edited in Figma)

File `ADpu9u2V0BlEZfR3rrMfER`. Sources: [owner words](./owner-words-2026-11-16.md), [essence](./essence.md), [study-sizes](./study-sizes.md), [study-core](./study-core.md), [study-space](./study-space.md), [master-homes](./master-homes.md), [swap-catalogue](./swap-catalogue.md), [drop-test](./drop-test.md), [mode-split](./mode-split.md), [scale-tokens](./scale-tokens.md), [systems](./systems.md), [process-review](./process-review.md), [think-swap](./think-swap.md), [think-index](./think-index.md), [think-layouts](./think-layouts.md), [think-docs](./think-docs.md). (`bad-patterns.md` did not exist yet.)

## 1. The essence
1. **Few blocks, many outcomes:** one Card, one Button, one icon set, five `Content` blocks, seven layouts. Everything else is one of these at another size or colour.
2. **Two switches.** Scale (size) goes on the region that sets the width, never on a card. Scheme (colour) goes on the thing that should look different.
3. **One home per thing:** a master lives on the page named for it. Previews are instances of masters, never copies.
4. **Swapping = folders.** Name by role (`Content /`, `Nav /`, `Layout /`), never by size; a region's swap menu is exactly one folder.
5. **Done = lint 0 errors + a 1:1 screenshot + a different reviewer + the Review tag flipped by you.** One editor on the file at a time.

## 2. The gold (keep, don't touch)
- **Card** `16:364` (520 uses), **Button** `23:506`, **Review Set** `104:2072`, **Content · Stat** `15:131`, **Icon.Item Set** `43:6069`.
- **Variables:** Scale (8 modes, 13 vars), Scheme (4), Colors; the 9 text styles; **Text page** `99:5363`.
- **Icons Preview** `43:7935`: the model every other preview should copy.
- **Showcase:** Block · Scale `109:21`, Block · Scheme `109:175`, Click through `128:7156`; Squeeze bars `81:1591`.
- **Best layouts:** Sidebar + Main `100:3511` (best item in the file), Rail + main `100:5116`, Card stack `100:4291`, Three cards `100:2189`, Page `43:8103`.
- **Templates:** Dashboard grid `98:104`, Article `98:128`, Form `99:3769`; reference look: Big Sloppy Page Set `103:25367`.
- **Lint** ([lint.md](./lint.md), 11 rules): the only check that disagreed with agents' own "done". **Live** status board `85:1554`.
- **Tested rules (drop-test):** Auto cards follow their container; an explicit mode beats it; use FILL + max width for anything droppable.

## 3. The plan (smallest and most visible first)
1. **AI page: cut to the 7 rules in section 6** (rest moves below as reference); fix the 5 contradictions. *Safe, text only.*
2. **Archive page; move junk in:** unused masters (Image `48:4583`, Page `51:9277`, Columns Two/Three, Rail+Main+Rail `100:3553`), test masters Master 1-6 + Case 1-3, Swap test card. Check ids and counts before and after. *Safe.*
3. **Masters to their homes:** Card family, Nav item `34:484`, Sidebar `34:486`, Icon + title `100:4360` to Elements; restore orphan `Content · Text only` `15:104`; five blocks into one `Content /` folder; Templates into their tier. Screenshot each (a move can change its Scale mode). *Safe, one editor.*
4. **Rename by role and set each region's preferred values to one folder** (`Content /`, `Nav /`, `Layout /`, max 6). Test: select a Card, menu shows 5 thumbnails. *Safe.*
5. **Remove Draft pills and Specimen wrappers;** show the instance bare with a Review tag. *Safe, bulk.*
6. **Wrapper in the Grid section master** (Region on page mode > Grid on card mode) + rule in [modes.md](./modes.md). *Needs your yes (edits a master).*
7. **Token table fix** (about 35 of 104 cells), then drop Surface `layout-padding` and `surface-gap`. *Needs your yes (rebinds every Card).*
8. **4 tier pages, then previews and Index** (each preview = 3 x 516 masonry on a 1920 sheet; Index = 3 columns), then the Systems page. *Needs your yes.*

## 4. Decisions for Michael (recommended answer first)
1. **8 size pages to 4 tiers (Mobile 360/400/600, Default 1000, Desktop 1600/1920, Mega 2600/3440)?** Yes. The 8 modes stay; only pages merge. Mobile is the only tier with different components; the rest is one Card at another width. You keep the sidebar and the swap test.
2. **Wrapper for content/layout mode?** Yes: Region on the page's mode > Grid on the card's mode > Cards on Auto. One extra frame, no new tokens, works today (measured: padding 128, cards 48).
3. **Token table?** Yes, apply scale-tokens (monotone gap, radius, button-pad, text-gap; section-pad doubled), keep Mega `pad` 128; skip the two type tokens for now.
4. **Archive Explore x7, test and junk masters, the 8 `Res.N Set` placeholders, Specimen?** Yes: moved to an Archive page, nothing deleted. Block · Scale already shows one Card at every mode.
5. **Systems page (12 cards, under AI, replacing the text "Systems map")?** Yes, after steps 3 to 7; cards 1, 4, 8 first.

## 5. Conflicts between the reports, resolved
- **Per-card mode (scale-tokens) vs wrapper (mode-split):** wrapper. Per-card breaks silently on every new or swapped card, and it breaks the rule "never on a card". Use scale-tokens' lookup (pad about 6% of card width: 750 wide = Default) only to choose the grid's mode.
- **Mega `pad`:** think-layouts says 128 is too big; scale-tokens keeps 128. Keep 128: the hero card works, and the grid case is fixed by the wrapper, not the value.
- **Card Content: slot (think-swap) vs keep the property (swap-catalogue):** keep the property for now and put its preferred values on the `Content /` folder. Slot migration (356 instances) comes after the folder test passes.
- **Res cards: keep (systems "solid", your ask) vs delete (study-sizes):** archive the placeholders; Block · Scale is the resolution card. Bring one back only if you ask.
- **Specimen as the doc unit (think-docs) vs drop it (study-core):** drop the frame; keep the Review tag on the bare instance.
- **Previews:** study-space (masonry inside a preview) and think-index (3 columns on Index) are two levels of one design. No Section level, no scaling Mega cards down.

## 6. Rules for agents (cut down from process-review)
1. One editor per page, one at a time on the file; everyone else read-only. Name the node ids you touch.
2. Reuse first (Index); a new master needs the owner's OK.
3. Scale on the region that sets the width, never a card; a grid of cards gets the card's mode on its own frame.
4. Tokens only: `pad-x`/`pad-y`, `gap`, `text-gap` inside text only, text max 720; no raw hex or px.
5. Every text has a style; never Inter; JetBrains Mono stays.
6. Done = lint 0 errors (pasted) + a 1:1 shot per section + a different reviewer; never self-approve.
7. Never edit your hand-made pages (Index, Icons, 1920 Desktop) or change structure: propose it. Reversible local fixes: do and log.
