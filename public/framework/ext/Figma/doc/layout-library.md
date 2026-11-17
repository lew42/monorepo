# Layout library (Lew42 v2 size pages)

## Test bench: the new shape of a size page (2026-11-16, piloted on 360 XS and 1000 Default)

The owner rejected the 8-step structure below ("the simplest example that is undeniable and essential. Less words, more essence"). A size page is now a **test bench**: it shows what our core components look like at this width, so the owner can approve each one per resolution. Built by `mastermind-bench`; the other six pages wait until the owner has compared these two.

- [Specimens · 360 XS](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=114-9406) (`114:9406`) · [Specimens · 1000 Default](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=114-11659) (`114:11659`).
- **Root** `Specimens · <mode>` (not "bench": specimens is the design term): vertical auto layout, fill black at 5% (the owner's fix: a light gray root on a light gray canvas showed no edge), padding `pad-x`/`pad-y`, gap `gap`. It sets **no** Scale mode, so the page itself reads at Default and isn't cramped.
- **Header**: `h1` with the mode name, one `body` line, and the `Systems used` line (`small`, `muted`); max width `measure`, lines spaced by `text-gap`.
- **Two sections**, `Components` and `Screens` (`h2`), each a GRID frame of equal columns (3 at 360, 2 at 1000; rows Hug, gap `gap`).
- **Each specimen** is a `Specimen` instance (`111:57`) with the page's Scale mode set on the instance and its width bound to Scale `width`, so 360 or 1000 comes from the token, not a typed value. Title = the component's name, Review tag Draft, `Show notes` off (turn it on to add review notes; the 360 Card specimen has it on). Its Content slot holds one transparent region with ONE instance set to Fill (only Button hugs), so the region gives the width and the component itself is the white thing on the 5% black root. Regions are padded `pad-x`/`pad-y` for elements and content masters, unpadded for full-width pieces (App bar, Navigation, Profile, Res cards). Cards in specimens have their `Actions` row hidden (an instance override). Card `16:364` cannot own an `Actions` boolean: its actions live inside the swapped Content master (`Content · Text only` `15:104`, which is no longer on any page), and Figma refuses a property reference on an instance sublayer. The proper fix is an `Actions` boolean on each content master, exposed through Card.
- **360 XS**: Card, Button, Icon.Item Set, 600 / Stat tiles, 400 / List section (swapped into a Card's Content), 360 / App bar, 360 / Navigation, 360 / Profile, Res.360 XS Set. Screens: App bar + list, Card stack.
- **1000 Default**: Card, Button, Icon.Item Set, 1000 / Text column, Two cards, Three cards, Nav + main, Res.1000 Default Set. Screen: Text + cards.
- **The old step grid** is not deleted: it sits in a hidden frame `Archive · old steps`, far to the right on each page.

The rest of this doc describes the old structure, still live on the six pages not yet converted.

The size pages in [Lew42 v2](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2) (`360 XS` … `3440 Mega`) each hold one root frame, `Layouts · <mode>`, that shows which layouts work at that size. [3440 Mega](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=67-5) is the model; the other pages copy its structure.

## Structure of a size page

- **Root wrapper**: black at 5%, the page's Scale mode, padding and gap bound to `section-pad`.
- **Header**: `h1` with the mode name, one `h3` intro line and a Range line. On 1920, 2600 and 3440 it also holds a text line named `Systems used` that links the masters the page uses (index: AI page, Systems map `101:13905`). Keep it when you rebuild a header, and update its links when a master's id changes.
- **Grid of steps**: one column per step, read left to right, from basic to advanced, so the whole page sits at about 2:1 when zoomed out:
  1. Single column (one padded card)
  2. Two columns (50/50, 60/40, 40/60, rail + fill)
  3. Three and four columns
  4. Treatment: padding and gaps (padded or flush, gap or none)
  5. Treatment: grounds and cards (white, light gray, dark, transparent, photo; no Prime ground, white on prime fails contrast)
  6. Content in the regions (the big card filled with a dashboard grid, cards capped at `card-min`, text split into columns)
  7. Nesting (smaller layouts and the 3-column page unit inside bigger regions)
- **Range row** under the grid (step 8): the same layout at several widths, so its wide examples don't stretch the columns.
- Section titles are `h2`, and each step's `h3` line says how it builds on the one before. Example captions are `h3`.

## Rules the examples follow

- **The Scale mode goes on the region where the width is set** (a column, rail, grid or unit). Cards inside stay on Auto. A region whose width comes from a variable (`card-min`, `squeeze`) inherits the page's mode: a mode picked from its own width would change the variable and shrink it (found 2026-11-16).
- **Screens use a direct Colors/light ground**, not a Scheme mode, so white cards stay visible and don't inherit the ground.
- **Labels read `Role · Mode`** (e.g. `Main · Desktop`), with no typed widths, which go stale when the tokens change. Equal splits are named Column 1 and Column 2. Main and Aside differ in width and mode.
- **Smaller masters fill the regions that fit them**: the 600 masters in the 600 rails and sidebars, and the 360 masters in the unit's side columns. Every other region that is just space for a layout holds the resolution card of its mode (`Res.<width> Set`, Style=Card, set to Fill), and a nested region holds a real layout master where one exists at its mode (e.g. `1600 / 60 / 40`, `1000 / Three cards`). Step 6 keeps its own cards: they are the content. **No white cards on a white ground**: the shadow is too weak, so every screen is light gray.

## Review tags (2026-11-16)

Every step example (each `Example · …` frame, not each card) on the eight size pages starts with a `Review` tag, an instance of [Review Set](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=104-2072) on the Elements page: Status = Draft (gray, Scheme `muted`), Approved (Colors `ok`), Rejected (Colors `error`), label style, label in Colors `light`. All start as Draft; the owner flips them with the dropdown. **Agents treat only Approved examples as the system.** Padding binds to Scale `text-gap` and `radius`, so a tag grows a little with its page's mode.

Trap: a paint whose colour is bound to a variable lost its paint opacity (back to 1) after a later write, so a 15% tint of `dark` came out solid. Use a variable that carries its own alpha (Scheme `muted` is black at 55%) instead of paint opacity.

## Specimens and review notes (2026-11-16, pilot on 3440)

Figma comments are pinned to a canvas position and don't follow auto layout, so review notes live in the design instead. The masters are on the Elements page, in the folder frame `Review notes (Specimen, Notes, Note)` (`111:40`):

- **`Specimen`** (`111:57`): a Header row (an exposed `Review` tag and an h3 `Title` text property), a `Content` slot holding the example (its placeholder is a white dashed box), and a `Notes` slot holding a Notes list. Both slots are visible by default; the boolean `Show notes` hides the notes. Blocks are spaced by `gap`. Set the instance width to the example's width; it carries no Scale mode.
- **Fill all the way down** (the owner, 2026-11-16): the Notes slot, the Notes instance, its inner slot and every Note are Fill width. One Hug level in that chain collapsed the stack when the owner tested it. The Notes slot and the Specimen's Content and Notes slots have the slot setting "By default, fill items on slot's counter-axis" turned on, so an inserted Note comes in as Fill by itself (tested 2026-11-16: a fresh Note came in at 328 in a 328 slot). Through the API this is `slotSettings.stretchChildOnInsert`, set with `editComponentProperty(key, {slotSettings})`; the slot node itself has no property for it.
- **`Notes`** (`111:48`): the "list program" shape, which is one slot of item instances (`Notes`, preferred item Note) and then a dashed `Add note` row at the end. It starts empty: the slot holds a "No notes yet." line. To add a note, insert a Note into the slot and delete that line; Ctrl+D on a note adds more, inside a Specimen instance too (tested). It is a wrapper, so it is 5% black (a step darker than its parent), padded `pad-x`/`pad-y` with `gap` between notes; the `Add note` row is a control and keeps button padding. Its width is Fill, capped at `measure`. For chat or todo lists, copy this shape and swap the item. Build a generic `List` master once a second list exists; with only one, it would just add a layer.
- **`Note`** (`111:43`): a white bubble (Scheme `fill`, with Scheme White set on the master so it stays white on any ground) with a `Label` (small, muted, default "Note"; turn off `Show label` to drop it, or type an author) and the `Text` (body). It has no timestamp, so it never goes stale. Padding binds `pad-x`/`pad-y`, the gap between its two lines binds `text-gap`, and the corners bind `radius`.

An example instance at 360 (Scale XS) with two notes sits beside the masters in the folder (`119:7698`). Checked against the [build checklist](./build-checklist.md) on 2026-11-16: the folder frame is 5% black and padded, every padded container differs from its parent, cards are white, no text is wider than `measure`. The Specimen instances on 360 XS (11), 1000 Default (9) and 3440 Mega (38) were re-checked: all are Fill down the chain, and their Notes now show the empty state.

**Pilot:** all 38 `Example · …` frames on [3440 Mega](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=67-5) are now Specimen instances with the same names. Each one's viewport frame was moved into its Content slot unchanged, and the Review status was kept (all Draft). Each starts with one placeholder note. The other size pages wait for the owner's approval of the pilot. Caveat: text styles don't follow Scale, so at 3440 the notes read small next to the viewports.

**Stat tiles below 600** (2026-11-16): `600 / Stat tiles` (`100:5162`) now wraps by itself (cards Fill with min 140, equal heights; see [master-pass.md](./master-pass.md)), so at 328 and 368 wide it goes 2 + 1. The 360 XS and 400 Mobile pages hold plain instances of it again; the detached `Tiles · 2 + 1` frames they used before are gone.

**Bars use button tokens** (2026-11-16): `360 / App bar` (`100:4743`) binds its side padding to Scale `button-pad-x` and its gap and top/bottom padding to `button-pad-y` (12 / 6 at XS), not `pad-x` and `gap`. A bar is a row of controls, so card padding (48 at Default) made it look loose, above all inside a padded card. It carries no Scale mode; the region holding it sets one.

## 2600 XL (2026-11-16)

[2600 XL](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=100-1441) follows the 3440 steps. Its range is about 2200 to 3000. Step 7 drops the 1920 unit in beside one sidebar (with two sidebars it would be only 1144 wide). Interactive demos (Miller columns, sidebar toggle) sit at the bottom of step 6.

Layout masters for bigger pages to compose from are in the folder frame `2600 / Layouts`, to the right of the grid. Each region holds an instance of a smaller master and carries the Scale mode nearest its width:

- `2600 / Sidebar + Main` `100:3511`: a 600 SM rail and a main that fills (Desktop).
- `2600 / Rail + Main + Rail` `100:3553`: two 360 XS rails and an LG main.
- `2600 / Main + Aside` `100:3618`: a main that fills and a 600 SM aside.
- `2600 / Centred column` `100:3687`: one column held to `squeeze`, which is 1800 at XL.

Each region also has an instance-swap property with a short list (XS/360, 600 and 400, or LG). If the native swap menu should be the only way to swap, delete the properties; the nested instances stay. The older 2600 sets are parked in `Parked / Blocks`, `Parked / Layout sets` and `Parked / Interactive sets` under the grid.

## 1920 Desktop (2026-11-16)

[1920 Desktop](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=82-1684) follows the 3440 steps in the frame `Layouts · 1920 Desktop`, below the owner's own nodes on that page, which stay untouched. Range is its own last column, so the page sits at 2.14 : 1. Its range is about 1600 to 2300. The 360 rails and the unit's side columns hold the 360 masters (Navigation, Profile, App bar).

## 1600 LG (2026-11-16)

[1600 LG](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=64-6191) follows the 3440 steps on 1600 × 900 screens. Its range is about 1280 to 2200. At most four columns fit; six would make each card narrower than 230. The old Page master and Layout.Sidebar Set instances are in `Cut · old page contents (2026-11-16)` below the grid.

Masters sit in the folder frame `1600 / Layouts` above the grid (`100:6091`). Each one is built from smaller masters:

- `1600 / Rail + two cards` `100:3746`: 360 / Navigation in a 400 rail, beside 1000 / Two cards.
- `1600 / 60 / 40` `100:3785`: 1000 / Text column beside 600 / Stat tiles.
- `1600 / Three cards` `100:3812`: three 400 Mobile regions, each holding a Card with 400 / Icon + title as its content.
- `1600 / Rails both sides` `100:3849`: 360 / Navigation on the left, 1000 / Text column in the middle, 360 / Profile on the right.

## 1000 Default (2026-11-16)

[1000 Default](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=64-6138) follows the same steps on 1000 × 700 screens, with fewer variants than 1600. Its range is about 920 to 1400. At most three columns fit. Step 1 never leaves one small card alone in the full width: the content is either capped at the 720 measure or fills the row with real content (600 / Stat tiles).

Masters sit in the folder frame `1000 / Layouts` above the grid (`100:5811`):

- `1000 / Text column` `100:2115`: one Card capped at 720 and centred.
- `1000 / Two cards` `100:2139`: two 400 Mobile regions, each holding a Card with 400 / Icon + title as its content.
- `1000 / Nav + main` `100:2164`: 360 / Navigation beside 600 / Two small cards.
- `1000 / Three cards` `100:2189`: three 360 XS regions, each holding a Card with Icon + title content.

**Trap:** a master's height goes stale after a Scale mode change. Set the children to Hug, read the height, set them back to Fill, then set the master's `minHeight` to that value.

## Templates page and swap test

[Templates](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=99-3914) holds a first pilot: folder frames `LG` (LG / Dashboard grid, Article, Form), `XS` (XS / Filters) and `3440 layouts` (3440 / Rail + Main + Rail, with three instance-swap properties). It is paused: the owner chose the native swap menu, with masters in folder frames by size, and instance-swap properties only where a component really has a child slot. Size variants are not how we size things (the Scale mode on the region is); Icon.Item Set is the one exception. The layout's dashboard fills its main region between the two sidebars. The small [swap preview test](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=100-5842) is there so the owner can check in the UI whether the picker shows previews. It is parent-down: the card is fixed at 416 and set to 360 XS, and the swapped content is Fill. All three swap options (400 / Icon + title, 400 / List section, 360 / App bar) were checked by screenshot on 2026-11-16 and fit with no overflow. It used to break because the card hugged its width while a child was fixed at 320.
