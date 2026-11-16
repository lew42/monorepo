# Layout library (Lew42 v2 size pages)

The size pages in [Lew42 v2](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2) (`360 XS` … `3440 Mega`) each hold one root frame, `Layouts · <mode>`, that shows which layouts work at that size. [3440 Mega](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=67-5) is the model; the other pages copy its structure.

## Structure of a size page

- **Root wrapper**: black at 5%, the page's Scale mode, padding and gap bound to `section-pad`.
- **Header**: `h1` with the mode name, one `h3` intro line and a Range line.
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
- **Smaller masters fill the regions that fit them**: the 600 masters in the 600 rails and sidebars, and the 360 masters in the unit's side columns. The resolution cards (`Res.<mode> Set`) will replace the remaining plain placeholders.

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

[Templates](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=99-3914) holds a first pilot: folder frames `LG` (LG / Dashboard grid, Article, Form), `XS` (XS / Filters) and `3440 layouts` (3440 / Rail + Main + Rail, with three instance-swap properties). It is paused: the owner chose the native swap menu, with masters in folder frames by size, and instance-swap properties only where a component really has a child slot. The small [swap preview test](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=100-5842) is there so the owner can check in the UI whether the picker shows previews.
