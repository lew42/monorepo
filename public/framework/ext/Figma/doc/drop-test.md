# Drop test: what happens when a card, menu or layout lands in a container with another Scale mode (2026-11-16)

Owner's question: "dropping a card that has auto scale into a container that has scale ... can we drag and drop a menu into a bigger container? Or a big layout into a smaller container? ... where we're setting the scale: on the container, on the card, on both" ([owner-words-2026-11-16.md](./owner-words-2026-11-16.md)).

The test is built in the Lew42 v2 file as the frame **Lab · Drop test** (`162:11407`, page `Explore – Drag playground` 50:4106, x 2660). Every cell is a real instance of the real master (Card 16:364, Navigation 98:164, Nav + main 100:2164, Sidebar + Main 100:3511, Swap test card 100:5846, Two small cards 100:5139) inside a dashed container whose padding and gap are bound to Scale. Each cell's caption states the measured resolved mode, padding, gap and size. Numbers below were read from the Plugin API (`resolvedVariableModes`, `explicitVariableModes`, padding, `itemSpacing`).

"Auto" means: no explicit Scale mode on the layer, so it takes the nearest one above. Padding is shown as left/top.

## Results

| Case (node) | Result | Rule |
|---|---|---|
| 1 · Card Auto, plain frame (`162:11410`) | resolved 1000 Default, pad 48/48, gap 32, 660×312 | No mode anywhere above falls back to the collection default (Default). |
| 1 · Card Auto in container Mobile (`162:11425`) | resolved 400 Mobile, pad 24/32, gap 24, 660×252 | Auto follows the container. |
| 1 · Card Auto in container Default (`162:11440`) | resolved Default, pad 48/48, gap 32 | Same as plain. |
| 1 · Card Auto in container Mega (`162:11455`) | resolved 3440 Mega, pad 128/128, gap 64, 660×528 | Auto follows the container. The card is still 660 wide: only padding, gap and radius move, the width is a fixed number in the master. |
| 2 · Card instance explicit Mobile in Mega container (`162:11489`) | stays Mobile, pad 24/32 | An explicit mode on the instance beats the container above. |
| 2 · Card instance explicit Default in Mega container (`162:11504`) | stays Default, pad 48/48 | Same. |
| 2 · Card instance explicit Mega in Mobile container (`162:11519`) | stays Mega, pad 128/128 | Same, in the other direction. |
| 2 · Swap test card, master root explicit 360 XS, in Mega container (`162:11534`) | stays 360 XS, pad 16/16, gap 4 | An explicit mode in the master also beats the container. Nothing is inherited. |
| 2 · Two small cards, master explicit Mobile, in Default container (`162:11547`) | stays Mobile, gap 24 | Same. |
| 3 · Navigation plain frame (`162:11570`) | Default, 1000 wide, pad 48 | Navigation binds its width to Scale `width`. |
| 3 · Navigation in Mobile container, fixed 400 (`162:11589`) | Mobile, nav 400 wide inside a 400 container with 24 padding | Width follows the mode (400), but the container's own padding is bound to the same mode, so the nav sticks out by the padding (about 48 px) and is not clipped, because clipping is off. |
| 3 · Navigation in Mega container, hug (`162:11608`) | Mega, nav 3440 wide, container 3700 | A menu dropped in a bigger container does not stay menu-sized: it becomes the mode's whole width (3440). Use FILL plus a max width, not the `width` token, for a menu. |
| 3 · Navigation in Default container, FILL, fixed 1000 (`162:11627`) | nav 900 (container 1000 minus padding) | FILL overrides the bound width. This is the safe way to drop a menu into any container. |
| 3 · Nav + main (904 wide) into Mobile container, fixed 400 (`162:11684`) | stays 904 wide, container 400, mode Mobile | Fixed-width children overflow; nothing squeezes by itself. |
| 3 · Nav + main into Mobile container with FILL (`162:11721`) | 348 wide, fits; inner regions keep their explicit modes (XS nav, SM main) | FILL fits the width, and each region keeps the explicit mode it was built with, so those regions do not change. |
| 3 · Sidebar + Main (2600, explicit XL root) plain frame (`162:11762`) | 2600×1440, pad 80, gap 48 | Fine at its own size. |
| 3 · Sidebar + Main into Mobile container, fixed 400 (`162:11808`) | stays 2600 wide, 400 container, mode stays 2600 XL (explicit) | A big layout in a small container overflows by 2200; its explicit root keeps XL pad 80 and gap 48. |
| 3 · Sidebar + Main into Default container, FILL, fixed 1000 (`162:11854`) | width 900, height grows 1440 to 2046; the Rail stays 600, the Main column is squeezed to a sliver, its text wraps one letter per line, and the stat tiles spill outside | FILL on a layout made of fixed columns breaks: a Rail region fixed at 600 leaves almost no room for Main. The layout needs real min widths or a stacked Mobile variant to be droppable into small containers. |
| 4 · Mega container, cards Auto / explicit Default / explicit Mobile (`162:11904`, `11915`, `11926`) | Auto card pad 128, explicit Default card pad 48, explicit Mobile card pad 24; container pad stays Mega 128 | Explicit cards keep their own size. Only the container and Auto cards are Mega. |
| 4 · Default container, cards Auto / explicit Mega / explicit Mobile (`162:11941`, `11952`, `11963`) | Auto pad 48, explicit Mega pad 128, explicit Mobile pad 24 | Same rule. |

Case frames: Case 1 `162:11469`, Case 2 `162:11565`, Case 3 menu and mid layout `162:11757`, Case 3 big layout `162:11899`, Case 4 `162:11977`.

## The rule for where to set Scale

1. **Set Scale on the container (the outermost frame of a layout or the instance that holds the cards), and leave the cards and masters Auto.** Auto cards then follow wherever they are dropped (Mobile 24/32, Default 48, Mega 128), and the container's own padding follows too, because it is bound to the same mode.
2. **Set an explicit mode on a card only to pin it against its container.** Any explicit mode, in the master or on the instance, beats the container above it (cases 2 and 4); so a master with an explicit root cannot be dropped and rescaled. The masters listed below are pinned.
3. **A mode moves padding, gap and radius only; it never makes a layout fit.** Widths stay fixed (the Card is 660 in every mode), the Navigation's width token turns a menu into a 3440 page in Mega, and a 2600 layout dropped into 400 overflows or squeezes. Use FILL with a max width for anything meant to be dropped, and one container mode cannot give the container and its cards different sizes (you cannot separate "layout mode" from "content mode": see [owner-words-2026-11-16.md](./owner-words-2026-11-16.md)).

## Which masters have an explicit Scale mode on their root (cannot follow a container)

From a scan of every component in the file (2026-11-16); the full list of 46:

- **Layouts built at one size:** Sidebar + Main and the other 2600 XL layouts `100:3511`, `100:3553`, `100:3618`, `100:3687`; `Page` 1920 `43:8103` and `51:9277`; Nav + main `100:2164` regions.
- **Previews and pages:** `.400 Mobile Preview` `162:10582`, `.1000 Default Preview` `162:10434`; the Layout.Columns sets `34:6211` to `34:6311`, `34:5784`, `34:5794`, `34:5801`, `34:5821`; the ScaleRegions `34:5834`, `34:5846`, `34:5858`, `34:5870`.
- **Templates:** Dashboard grid `98:104`, Article `98:128`, Form `99:3769`, Filters `99:3798`, Rail + Main + Rail `99:3835`, Swap test card `100:5846`, Two small cards `100:5139`, Stat tiles `100:5162`.
- **Resolution sets:** the `Res.*` sets (`Style=Card` and `Style=Space` variants, one explicit mode per page).

The masters that are **Auto** (follow the container): Card `16:364`, Button `23:506` (it only carries a Scheme mode), and Navigation `98:164`.

Open: the Mega grid problem (four 750-px cards still get Mega padding) is a separate question; rule 1 says set Scale on the column, and the test shows the cards would then follow it, but the container's own padding moves with it.
