# Systems of Lew42 v2 (read-only audit of the file and docs)

File `ADpu9u2V0BlEZfR3rrMfER`. Goal ([the owner's ask](./owner-words-2026-11-16.md)): every thing that happens in the file falls into one system, and each system is written down once. The AI page already has a text list called "Systems map" (node `101:13905`, 11 entries). This page is the fuller, checked version; the Systems page proposal in section 4 should replace that text list.

Status: **solid** = defined in the file, used consistently, lint or the file enforces it. **shaky** = defined but broken in places, or enforced only by hand. **missing** = discussed, not in the file.

Counts below were read live from the file (27 pages, 4 variable collections, 9 text styles, 1 effect style, 0 paint styles).

## 1. The systems

### 1. Scale
- **Decides:** how big spacing and type are, per region width.
- **Defined:** variable collection `Scale`, 8 modes (360 XS, 400 Mobile, 600 SM, 1000 Default, 1600 LG, 1920 Desktop, 2600 XL, 3440 Mega), 13 variables (`width`, `pad-x`, `pad-y`, `gap`, `text-gap`, `measure`, and others). One page per mode, named like the mode.
- **Rules:** set the mode on a region (root, a column) to match its width, never on a card or inside a master. The `width` variable holds the resolution; layer names never do. A grid of narrow cards under a wide root inherits the wide mode (open problem, see overlaps).
- **Lint:** `mode-mismatch`, `pad-token`, `raw-value`.
- **Status:** shaky. Tokens work; mode placement is by hand; the wide-root/narrow-card cascade has only a workaround. Mega vs XL values are not monotonic ([token-audit.md](./token-audit.md)).

### 2. Scheme
- **Decides:** which colour a thing shows (text, fill, accent) by mode.
- **Defined:** collection `Scheme`, 4 modes; variables `text`, `muted`, `fill`, `accent`, `on-accent`.
- **Rules:** put the mode on the thing that should look different, not on every child. White is the default; Prime text is white; `on-accent` is dark ink on orange. `fill` replaced `surface`.
- **Lint:** `raw-fill`, `same-on-same`, `mode-mismatch`.
- **Status:** shaky. Card binds Scheme `fill`, so a card on a white ground comes out white on white (the "card-white fix", [think-index.md](./think-index.md)).

### 3. Colors
- **Decides:** the raw palette that Scheme points at.
- **Defined:** collection `Colors`, 1 mode: `prime`, `light`, `dark`, `error`, `ok`, `warn`, `ink`, `master`.
- **Rules:** nothing in a master binds Colors directly except grounds and pages; components bind Scheme. Never a typed hex.
- **Lint:** `raw-fill`, `raw-value`.
- **Status:** solid. Small and consistent.

### 4. Surface
- **Decides:** what a Card and a Section look like (radius, gap, padding, ground).
- **Defined:** collection `Surface`, modes Card and Section; `surface-gap`, `layout-padding`, `surface-radius`, `surface-ground`. Only Card `16:364` binds `surface-radius` ([card-vs-section.md](./card-vs-section.md)).
- **Rules:** a card is white on light gray; a section is full width; no inset padded or transparent cards.
- **Lint:** `padded-no-fill`, `same-on-same`.
- **Status:** shaky. It overlaps Scale on padding and Scheme on fill (section 3); one master uses it.

### 5. Text styles
- **Decides:** all type.
- **Defined:** 9 styles: h1 Montserrat Black 48, h2 Bold 36, h3 SemiBold 24, h4 Bold 14, body Medium 16, label Bold 16, code JetBrains Mono 14, small SemiBold 12, display Black 128.
- **Rules:** every text node has a style; never Inter; JetBrains Mono stays for code; text no wider than `measure` (720).
- **Lint:** `unstyled-text`, `line-length`, `text-gap`.
- **Status:** shaky. Styles are solid; the AI page and docs disagree on the count (8 vs 9); sizes are fixed, not tied to Scale modes.

### 6. Icons
- **Decides:** the one icon set and how an icon sits beside a title.
- **Defined:** page Icons: `Icon.Item Set` (`43:6069`, 6 variants), `Icons Preview` (`43:7935`); `Icon.Title` (`110:1776`) on Elements.
- **Rules:** use `Icon.Item`, never a pasted vector; Icons is hand-edited by the owner, don't touch it.
- **Lint:** none. Lint does not look at icons.
- **Status:** solid for the set; shaky for sizing (the old file had an `Icon size` collection; v2 has none).

### 7. Layout (Fill / Hug / Fixed)
- **Decides:** how a frame sizes itself; the parent sets width and mode, content Fills.
- **Defined:** no collection. Documented in the AI page "Layout" frame (`60:467`), [build-checklist.md](./build-checklist.md), and the readme. The four permutations: Fill×Hug (section, block), Hug×Hug (card, inline), Hug×Fill (rail, sidebar), Fill×Fill (panel).
- **Rules:** the parent drives; a row whose children all Fill height never grows; sidebars Fill height, others Hug; no fixed heights on layouts.
- **Lint:** `child-drives`, `padded-no-fill`. It does not see floating layouts or fixed heights.
- **Status:** shaky. Rules are known; the 4 permutations are not shown anywhere as one demo (the owner asked for arrows: red grow, blue shrink, black fixed).

### 8. Pages and Roots
- **Decides:** how a page is shaped: one title, one `Root` frame in auto layout, a Scale mode.
- **Defined:** 27 pages; most carry a `Root` frame. AI page rules, [design-system-notes.md](./design-system-notes.md) rule 8.
- **Rules:** a page has exactly one Root; no connectors (the Plugin API cannot make them anyway); one page per Scale mode, named exactly like the mode.
- **Lint:** none for Root count or connectors. `padded-no-fill` only.
- **Status:** shaky. Explore pages and the Showcase have no Root; one page per size is under review.

### 9. Masters and homes
- **Decides:** where each reusable thing is defined, and that there is only one.
- **Defined:** components sit on 14 pages (list in section 2 under "Where masters live"). The page a master lives on should be the page named for it.
- **Rules:** Index first, then reuse, then ask before a new master; masters are visible beside what they drive, not framed.
- **Lint:** `hidden-in-master`. It does not check the page a master is on.
- **Status:** shaky, the worst one. `Card` is on Scale and on Explore – Color permutations; `Page` is on 1920 Desktop; layouts are on Templates and 2600 XL and each size page; Elements holds 11 unrelated masters.

### 10. Naming
- **Decides:** how things are called, so they sort and swap.
- **Defined:** the AI page and [design-system-notes.md](./design-system-notes.md) rule 3.
- **Rules:** sets are named like JS classes, dot-nested, ending in " Set" (`Icon.Item Set`, `Layout.Sidebar Set`); a slash makes a swap-menu folder; no resolution in layer names; a `.` prefix hides a helper from publishing.
- **Lint:** none. Lint cannot read names.
- **Status:** shaky. Examples that break it: `Master 1` to `Master 6`, `Case 1` to `Case 3` (Scale page); `Res.360 XS Set` (resolution in the name, by design as the resolution cards); `Card · Slot`, `Content · Stat` (a middle dot, not a slash); `Page` and `1920 Page` both exist.

### 11. Swapping
- **Decides:** what a component can be swapped to, and how.
- **Defined:** [think-swap.md](./think-swap.md), [swap-catalogue.md](./swap-catalogue.md); live pieces: `Card · Slot` (`112:7282`), `Layout.*` sets, the `Content /` folder of 5 blocks, the Swap test card (`100:5846`).
- **Rules:** four mechanisms exist: a slot (the default), the native swap menu (Ctrl/Cmd-click), an instance-swap property with preferred values (thumbnails do show), and a plain frame. Pick the slot first.
- **Lint:** none.
- **Status:** shaky. Card `16:364` still carries a swap property meant to go; the swap menu works only where names use slash folders.

### 12. Resolution cards
- **Decides:** one standard block per resolution, so a template cannot go in the wrong size container.
- **Defined:** one `Res.<mode> Set` per size page (360 XS, 400 Mobile, 600 SM, 1000 Default, 1600 LG, 1920 Desktop, 2600 XL, 3440 Mega), each with 2 variants.
- **Rules:** same card, one per size; sits on its own size page.
- **Lint:** none.
- **Status:** solid in shape; the "resolution in the name" rule needs an explicit exception (naming).

### 13. Previews and Index
- **Decides:** how the file shows itself: one `.<Page> Preview` per page; Index holds instances in 3 columns.
- **Defined:** [think-index.md](./think-index.md) (proposal). Built: `.400 Mobile Preview` (`162:10582`), `.1000 Default Preview` (`162:10434`), `Icons Preview` (`43:7935`). The Index page still uses Big Sloppy's remote `Page Set`.
- **Rules:** preview = instances only, best 10%, in the page's Root; Index is one Root; judge from a 1:1 crop.
- **Lint:** none.
- **Status:** missing as a system (2 of 27 pages have one); the AI page text contradicts it ("one instance of every master").

### 14. Review and approval
- **Decides:** when a thing counts as done.
- **Defined:** `Review Set` (`104:2072`, tag Draft / Approved / Rejected) on Elements; [approval-strategy.md](./approval-strategy.md) phases 0 to 3.
- **Rules:** builder and reviewer are different agents; a judged screenshot at 1:1 is required before "done"; check long text and a narrow width; a preview holds only approved masters.
- **Lint:** lint must show 0 errors first.
- **Status:** shaky. The tag and phases exist; nothing records which masters are Approved.

### 15. Lint
- **Decides:** which mistakes a script catches so the owner doesn't.
- **Defined:** `doc/lint.js` (read-only `use_figma` script), [lint.md](./lint.md). 8 error rules (`same-on-same`, `pad-token`, `text-gap`, `raw-value`, `raw-fill`, `unstyled-text`, `line-length`, `child-drives`) and 3 warnings (`mode-mismatch`, `hidden-in-master`, `padded-no-fill`).
- **Rules:** run before saying "done"; fix the master, not the instance; 0 errors.
- **Lint:** it is lint.
- **Status:** shaky. Last read: 2600 XL 132 errors, 1920 Desktop 48; one open error (Button master hidden Icon frame `23:508`). It cannot see naming, floating frames, connectors, the master's page, or nesting depth ([essence.md](./essence.md) section 4 lists the missing rules).

### 16. Showcase and Live (found, not on the expected list)
- **Decides:** where finished examples go (`Showcase`, `Click through` frame `128:7156`) and where the owner's current work goes (`Live`).
- **Defined:** the pages themselves; nothing written.
- **Rules:** none written. Live is owned by the voice app; don't edit.
- **Lint:** none.
- **Status:** missing. Roles are by habit only.

### 17. Elements (found)
- **Decides:** small building blocks that are not layouts: Button `23:506`, Image `48:4583`, Icon.Title `110:1776`, Note, Notes, Specimen, Review Set.
- **Defined:** page Elements.
- **Rules:** one Button, one Image; Specimen and Note are documentation tools, not content.
- **Status:** shaky. It mixes tools for the docs (Note, Notes, Specimen, Review) with the real elements; none of them has a home page named after it.

### 18. Docs on the page (found)
- **Decides:** how a page explains itself: AI page frames (Index `60:361`, Rules `60:388`, Components `60:413`, Tokens `60:432`, Text `60:450`, Layout `60:467`, Connectors `99:533`, Systems map `101:13905`), Note and Specimen masters, repo `doc/*.md`.
- **Rules:** show live variables, never typed values; the repo is the source of truth.
- **Status:** shaky. The AI page and the repo docs state different things (section 3).

## 2. Orphans (fall into no system)

- **Index rectangle:** a loose 3424px image beside Index's Root, `137:725`. Pre-dates the Root rule; belongs to nothing.
- **Showcase "Click through" frame `128:7156`:** a flow demo, no Root, no system (see Systems 16).
- **Explore – Sizing `33:3` and Explore – Drag playground `50:4106`:** pages with no Root; experiments. Every Explore page (Sizing, Drag playground, Color permutations, Icon + title, 2600 layouts) belongs to no system and is headed for Archive ([consolidation-plan.md](./consolidation-plan.md)).
- **Per-page `Archive` frames:** old work parked on size pages; no rule says when they go.
- **Scale page masters `Master 1` to `Master 6`, `Case 1` to `Case 3`** (ids `19:459`, `19:479`, `19:499`, `19:519`, `19:544`, `21:502`, `18:437`, `18:442`, `18:447`): unnamed trial masters. No system names them; likely the origin of the swap property on Card.
- **`Size · Default` (`9:2`) and `Content · Stat` (`15:131`)** on Scale: one-off masters on the page that is meant to show tokens.
- **Duplicates the owner already complained about:** `Card · with media` (`16:374`) next to Card (`16:364`) and `Card Set` (`34:244`, 7 variants) on Explore; `Page` (`51:9277`) next to `1920 Page` (`43:8103`); `Heading Set` (`34:466`, 52 variants) on Explore – Icon + title next to `Icon.Title` (`110:1776`).
- **Templates masters** `Dashboard grid`, `Article`, `Form`, `Filters`, `Rail + Main + Rail` (`98:104`, `98:128`, `99:3769`, `99:3798`, `99:3835`): layouts whose home is Templates, not a size page, and not named by the Layout rules.
- **Variable collections not in v2:** none left (v2 has 4); the old file's `Button`, `Selection`, `Icon size`, `Image`, `Bar`, `Flow` and `Constants` collections are still described in the repo readme and [token-audit.md](./token-audit.md).
- **AI page "Connectors" frame `99:533`:** the Plugin API cannot create connectors; the rule has no system to live in.

### Where masters live (read live, standalone and sets)

| Page | Masters |
|---|---|
| Scale | Card `16:364`, Card · with media `16:374`, Content · Stat `15:131`, Size · Default `9:2`, Master 1-6, Case 1-3 |
| 360 XS | App bar, Navigation, Profile, Res.360 XS Set |
| 400 Mobile | Card stack, List section, Icon + title, Res.400 Mobile Set, `.400 Mobile Preview` |
| 600 SM | Rail + main, Two small cards, Stat tiles, Res.600 SM Set |
| 1000 Default | Text column, Two cards, Nav + main, Three cards, Res.1000 Default Set, `.1000 Default Preview` |
| 1600 LG | Rail + two cards, 60 / 40, Three cards, Rails both sides, Res.1600 LG Set |
| 1920 Desktop | Res.1920 Desktop Set, 1920 Page, Page |
| 2600 XL | Sidebar + Main, Rail + Main + Rail, Main + Aside, Centred column, Res.2600 XL Set, Nav item, Sidebar, Layout.Columns.One/Two/Three Set, Layout.ScaleRegions Set |
| 3440 Mega | Res.3440 Mega Set |
| Templates | Dashboard grid, Article, Form, Filters, Rail + Main + Rail, Swap test card |
| Elements | Button, Image, Review Set, Icon.Title, Card · Slot, Layout.Sidebar Set, Layout.Miller Set, Layout.Miller.Mobile Set, Note, Notes, Specimen |
| Icons | Icon.Item Set, Icons Preview |
| Explore – Color permutations | Card Set |
| Explore – Icon + title | Heading Set |

## 3. Overlaps (two systems decide one thing)

- **Surface vs Scale, padding:** Surface `layout-padding` and `surface-gap` decide the same thing as Scale `pad-x`, `pad-y`, `gap`. The 750px-cards-under-a-3440-root problem is this overlap. **Suggest:** drop `layout-padding` and `surface-gap`; keep Surface for radius and ground only, or fold it into Scheme.
- **Surface vs Scheme vs Colors, ground:** `surface-ground`, Scheme `fill` and Colors `light` all say "the background". Cards bind `fill`, grounds use `light` directly, hence white on white. **Suggest:** one rule: ground = Colors `light`, card = Scheme `fill`; delete `surface-ground`.
- **Four swap mechanisms:** slot, swap menu, instance-swap property, plain frame, plus `Card · Slot` and the leftover property on Card `16:364`. **Suggest:** slot is the default, the others are named exceptions.
- **Three indexes:** the AI page Index (`60:361`, "an instance of every master"), Big Sloppy's Index on the Index page, and the proposed preview Index. **Suggest:** the preview Index only; edit the AI page text.
- **Resolution cards vs the naming rule:** `Res.<mode> Set` carries the resolution in its name where Naming forbids it. **Suggest:** keep, and write it as the one named exception.
- **Layout masters on three kinds of page:** layouts sit on size pages (Layout sets named by size), on Templates (by use) and on Elements and 2600 XL (`Layout.*` sets). Masters and homes, Layout and Resolution cards each claim them. **Suggest:** one home per layout: its size page, one `Layout.*` set per family.
- **Docs in two places:** the AI page frames and the repo `doc/*.md` both state the rules, with different counts (3 vs 4 collections, 12 vs 13 variables, 8 vs 9 text styles, Layout.Sidebar "not built yet" vs built). **Suggest:** the repo is the source; the AI page shows live variables and links.
- **Index first vs Index as Big Sloppy content:** the lookup rule needs an Index that does not exist yet ([essence.md](./essence.md), contradiction 8).

## 4. Design for a Systems page (propose only; nothing built)

**Where:** a page named `Systems`, placed directly under `AI` and above `Scale`. It replaces the text "Systems map" (`101:13905`) on the AI page, which becomes a link to it. One Root, one title ("Systems"), the Review tag set to Draft.

**Shape:** 3 columns by 4 rows = 12 cards, each the same Card master, full width of its column, no extra wrapper. Each card has four parts, top to bottom: **name** (h3), **one-line rule** (body), **a live instance** showing the rule, and **a link** to where it is defined (a hyperlink on the "Defined in" text, set with `setRangeHyperlink`, pointing at the page or collection).

The 18 systems above fold into 12 cards; merging is the point, the owner said "we need to reduce".

| # | Card | One-line rule | Live instance | Links to |
|---|---|---|---|---|
| 1 | Scale | Mode goes on the region, matching its width. | Two Regions (Mobile, Default) holding the same Card, so pad and gap visibly change. | Scale page |
| 2 | Scheme + Colors | Mode goes on the thing that looks different. | One Card in each of the 4 Scheme modes. | Scheme collection |
| 3 | Surface | A card is white on light gray; a section is full width. | One Card beside one Section. | Card master `16:364` |
| 4 | Text | Every text has a style; never Inter. | The 9 styles, each set in its own style, name beside it. | Text page |
| 5 | Layout (Fill/Hug/Fixed) | The parent drives; content Fills. | A 2×2 of the four permutations with red grow, blue shrink, black fixed arrows. | Layout frame `60:467` |
| 6 | Pages and Roots | One title, one Root, no connectors. | A mini page (title + Root) as an instance of `Page`. | `Page` master |
| 7 | Masters and homes | A thing lives on the page named for it; Index first. | A short list of Index instances showing each master's page. | Index page |
| 8 | Naming | Dot-nested, ends in " Set", no resolution, slash = folder. | `Icon.Item Set` next to `Layout.Sidebar Set`, tagged right/wrong. | AI page Rules `60:388` |
| 9 | Swapping | Slot first; swap menu for the rest. | One live `Card · Slot` with an instance-swap and a slot. | `Card · Slot` `112:7282` |
| 10 | Icons and Elements | One Button, one Image, one icon set. | Button default and accent, Icon.Item, Image. | Elements, Icons |
| 11 | Resolution cards | One card per size, on its size page. | The 8 `Res.*` sets in a row. | Size pages |
| 12 | Review, Lint and Previews | Lint 0, judged shot, approved previews only. | The `Review Set` tag, 3 states, plus the last lint count as a typed-free script link. | `lint.md`, Review Set `104:2072` |

**Rules for the page itself:** every instance is a real master instance, never a copy; no typed values (read from variables); a card goes Approved only after the system it shows is solid; a new system needs a card or it does not exist ("everything that happens falls into one of our systems").

**Build order (when approved):** cards 1, 4 and 8 first (three are already solid and cheap), then 2, 3, 5 and 9. Cards 7, 11 and 12 wait for the preview Index. Cost: about one small builder session and one reviewer; no new masters except a `Systems Card` if Card cannot carry the link line.

## 5. What to fix first (ranked)

1. Masters and homes: move each master to its named page; delete or rename `Master 1-6`, `Case 1-3`, the duplicate `Card` and `Page`. Highest effect on "I click through and it is on a bullshit page".
2. Remove the overlaps in section 3 (Surface padding, Surface ground); then fix Card white-on-white.
3. Add lint rules for what it cannot see: master not on its named page, name pattern, more than one Root, Scale mode inside a master, nesting over 4 levels.
4. Build the Systems page (section 4); then the preview Index.
5. Fix the stale counts on the AI page and in the repo readme (still describes 10 old collections and Big Sloppy).
