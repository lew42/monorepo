# Assets tidy: archives off the live pages, photos that never distort (2026-11-17)

Lew42 v2 (`ADpu9u2V0BlEZfR3rrMfER`). Two fixes for rules 28 and 29 in the [readme](../readme.md#rules); your words are in [owner-words-2026-11-17-naming.md](./owner-words-2026-11-17-naming.md), section "~21:45".

## 1. Archived masters are out of the swap menu (rule 29)

A hidden frame doesn't hide its components from the swap menu. So every live page's hidden `Archive` frame (it was a child of `Root`) moved, whole, to a new page called **`Archive · Pages`** (`304:1269`). That page sits right after the `Archive ↓` divider. Moving keeps node ids, so every instance stays linked. Each frame is now visible and named `Archive · <source page>`. They all sit in one auto-layout `Root` (`304:1270`): horizontal, wrapping, 71118 × 55118 (about 1.3:1).

| Moved frame | From | Masters inside |
|---|---|---|
| `231:1173` | Index | 0 (the old Index, `294:873`, and the owner's `image 1` `148:25853`) |
| `276:336` | Scale | 9 (already dotted) |
| `114:9405` | 360 XS | 5 |
| `128:7317` | 400 Mobile | 4 |
| `128:8008` | 600 SM | 5 |
| `114:11658` | 1000 Default | 19 (includes `Nav + main` `100:2164`, the one you swapped to by accident) |
| `128:8426` | 1600 LG | 4 |
| `128:8859` | 1920 Desktop | 5 |
| `263:1354` | 2600 XL | 9 |
| `128:9174` | 3440 Mega | 3 |
| `276:337` | Templates | 1 |
| `161:301` | Elements | 0 (the master labels) |

The card-pad agent's preview backups (`294:80`, `295:152`, `295:406`, `295:582`, `295:751`) moved with the frames they were in. Icons had no Archive.

- **39 masters got a `.` prefix** (component sets and standalone components only; variant names are untouched). Examples: `.App bar` `100:4743`, `.Nav + main` `100:2164`, `.Res.1000 Default Set` `100:9677`, `.Layout.Columns.Two Set` `34:5795`. The full list is in the session log.
- **Decision: the `Image` master `48:4583` stayed live.** It had been in Elements' Archive, but 36 instances use it, among them all four `X · Content · Text + Media` masters. So it moved into Elements' `Masters` folder (`161:300`) and kept its name, rather than being archived. The alternative was to archive it with a `.`; that would hide the base of every photo from Assets.
- **Archived masters still used on live pages** (they stay linked, and are shown here so someone can swap them out later): `.Navigation` `98:164` (1 instance on Templates), `.Stat tiles` `100:5162` and `.Res.600 SM Set` (Showcase), and `.Swap test card` `100:5846` (4 instances on Showcase and Templates).
- **Lint** ([lint.js](./lint.js) page-root, updated): on a live page it now reports an `Archive` child of Root as an error. Pages after `Archive ↓` are exempt, and so is the divider itself. Result: 0 page-root errors on every page.
- **Root rule:** [root-spec.md](./root-spec.md) now says Root has no Archive child. Archiving means moving to `Archive · Pages`.

## 2. Photos never distort (rule 28)

The seagull photo (`a24fc705…`, 480 × 639, portrait) was set as an instance fill override in **CROP** mode. A CROP fill stretches as soon as its frame resizes. I baked a landscape crop with a temporary clipped frame: 480 × 270 starting at y 30, head and upper body, exported at 2x. That made a new image, **`8e847a4a…`** (960 × 540). The temporary frame was removed. Every CROP fill is now **FILL** with the new image:

- **Masters** (the `Media` instance in each): `400 · Content · Text + Media` `265:552`, `600 ·` `264:906`, `1000 ·` `260:1196`, `1600 ·` `252:788`. The nested copies in the previews inherited the change (9 nodes needed no edit).
- **Preview photos:** `268:482` (360), `265:594` (400), `264:959` (600), `260:747` (1600 archived preview), and one nested override `I252:838;252:798;252:788` (1920 Step 2).
- **Archived preview photos:** `260:1285`, `276:350`, `262:863`, `263:1438`, `264:1274`. These are FILL now. They are 11712 to 26128 wide, so they show only a strip.
- **Not changed:** the eleven fills that were already FILL with the original portrait: the avatar `98:180`, the full-viewport "Region · Photo" and "Full-bleed photo" examples on the size pages, and `87:251`. FILL never distorts, and those frames are close to square or portrait.
- The `Image` master keeps its gray placeholder fill (its description says to replace the fill). `Card · with media` `16:374` has no photo, only a gray `Media` placeholder.

**Check:** I made temporary instances of `1000 · Content · Text + Media` at 1000, 1800 and 400 wide. The Media frame was 484, 884 and 184 wide, all at 280 tall. The bird was not distorted, and its head and beak were in view at every width. The temporary frame was removed. I also took a 1:1 screenshot of master `260:1192`: no cut-off head, nothing floating.

## Open (found, not mine to fix)

- Lint on Elements `Masters` `161:300` reports 4 errors that were there before: `Icon` `23:508` raw fill #ffffff, `Media (gray placeholder)` `16:375` raw fill #cccccc, and `Actions` `15:136` with raw gap 16/8. These are your hand-made masters (rule 1).
- At 400 wide, `1000 · Content · Text + Media` stays side by side (184-wide photo). It is a 1000 master, so this is expected, but a 400 card would use the `400 ·` master.
