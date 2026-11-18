# Local icons in Lew42 v2 (phase 1, 2026-11-17)

**What this is.** Lew42 v2 (`ADpu9u2V0BlEZfR3rrMfER`) drew every icon with Big Sloppy's remote `Icon` component, which is publish blocker 1 in [research/publish-audit.md](./research/publish-audit.md). Phase 1 builds a local copy of every glyph in use, beside the old ones. Nothing points at the local icons yet; the remote ones are untouched.

**Where.** Icons page (`43:5481`), inside `Root` (`162:10500`), a new group `Icons · Local` ([`309:1532`](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=309-1532)). It is 1600 wide, Scale 1000 Default, Scheme as its sibling column. It holds a title, one line of text, and `Categories` (`309:1535`): ten folders (1 px inside stroke bound to Colors `master`, padding `pad-x`/`pad-y`, gaps `gap`), each a title such as `ARROWS · 12` above a wrapping row of masters. Lint: 0 errors, 0 warnings.

## How each icon is made

- One `COMPONENT` per glyph, 24 × 24, no fill, named `<Category>/<Glyph>` (for example `Arrows/Arrow up`). The slash makes the swap menu and the Assets panel group icons by category. Only icons use slash names (Root frames can't act as folders, so the name has to).
- Inside it is one vector named `Glyph`: the Material Icons ligature set at 24 px (line height 100%) and flattened, so it keeps the font's own position in the 24 box. Its fill is bound to Scheme `text`. Its constraints are Scale.
- The glyph was set fresh in the same font rather than copied from a detached remote instance. It is the same font and the same ligature, so the outline is identical, and nothing remote was touched. All 99 names rendered as glyph-width text before flattening (no Symbols-only names).
- Each master's description says the Material name and the site call, for example `icon("arrow_upward")`. The [Material name is still the identity for code](./icons.md#handoff-to-code); the readable name is for the menu.
- **Sizing is a resize, not a mode.** Tested on a temporary instance: resized to 16 the glyph scales by 0.667, at 48 by 2, centred both times. A swap keeps the instance's size. So the local set needs no `Icon` wrapper and no `Icon size` collection.

## Categories (10, 99 icons)

Every glyph the file uses: 93 from the Icons page, plus 6 used only on `Archive · Pages` (bolt, task_alt, rate_review, edit_note, event, flag).

| Category | Folder | Icons (Material name → component id) |
|---|---|---|
| Arrows · 12 | `309:1558` | arrow_back 1561, arrow_forward 1565, arrow_upward 1569, arrow_downward 1573, chevron_left 1577, chevron_right 1581, expand_more 1585, expand_less 1589, open_in_new 1593, logout 1597, refresh 1601, sort 1605 |
| Menus · 13 | `309:1609` | menu 1612, more_vert 1616, more_horiz 1620, apps 1624, close 1628, add 1632, remove 1636, check 1640, search 1644, tune 1648, filter_list 1652, drag_indicator 1656, settings 1660 |
| Actions · 13 | `309:13796` | edit 13799, delete 13803, content_copy 13807, share 13811, download 13815, upload 13819, visibility 13823, visibility_off 13827, lock 13831, lock_open 13835, send 13839, edit_note 13843, bolt 13847 |
| Status · 14 | `309:13851` | info 13854, warning 13858, error 13862, check_circle 13866, task_alt 13870, help 13874, notifications 13878, flag 13882, star 13886, favorite 13890, thumb_up 13894, bookmark 13898, label 13902, rate_review 13906 |
| Files · 8 | `309:13910` | description 13913, folder 13917, image 13921, collections 13925, attach_file 13929, link 13933, inbox 13937, mail 13941 |
| People · 6 | `309:13945` | person 13948, group 13952, account_circle 13956, chat 13960, forum 13964, call 13968 |
| Media · 8 | `309:13972` | play_arrow 13975, pause 13979, stop 13983, skip_next 13987, volume_up 13991, mic 13995, photo_camera 13999, videocam 14003 |
| Layout · 8 | `309:14007` | dashboard 14010, grid_view 14014, view_column 14018, view_agenda 14022, view_list 14026, table_rows 14030, crop_free 14034, devices 14038 |
| Design · 11 | `309:14042` | palette 14045, contrast 14049, format_paint 14053, straighten 14057, code 14061, lightbulb 14065, rule 14069, insights 14073, token 14077, smart_button 14081, radio_button_checked 14085 |
| Places · 6 | `309:14089` | home 14092, calendar_today 14096, schedule 14100, event 14104, location_on 14108, shopping_cart 14112 |

Ids are `309:<n>`. Readable names differ from the Material name in a few places: arrow_upward → Arrow up, more_vert → More vertical, calendar_today → Calendar, play_arrow → Play, photo_camera → Camera, videocam → Video, location_on → Location, account_circle → Account, task_alt → Task done, content_copy → Copy, drag_indicator → Drag handle, filter_list → Filter, rate_review → Review, shopping_cart → Cart, description → Document. The rest are the Material name in sentence case.

## Remote icons in use today (counted 2026-11-17)

Remote instances of Big Sloppy's `Icon` (the glyph is its text property `Icon#211:0`) and of its `icon-<name>` glyph components:

| Page | `Icon` | `icon-*` | Note |
|---|---|---|---|
| Icons | 318 | 241 | Mostly inside the remote `Page Set` wrappers `Page · Icons` `43:6068` and `Workspace` `43:6252` (blocker 2), the seven old category frames (`Arrows` `43:6089` … `Layout` `43:6168`), the 6 `Icon.Item Set` variants and `Icons Preview` `43:7935` |
| Elements | 5 | 4 | |
| Showcase | 9 | 0 | |
| Templates | 1 | 0 | |
| Archive · Pages | 164 | 0 | archived, leave as is |
| Explore – Drag playground | 1 | 0 | archived page, leave as is |

The 3 on 360 XS and 5 on 600 SM that the publish audit listed are no longer there. 99 distinct glyphs; `folder` is the most used (84).

## Phase 2 plan (not started)

1. **Icon.Item Set** (`43:6069`, 6 variants). In each variant, swap the nested remote `Icon` to the local glyph its text property names (`folder` → `Files/Folder`), resize it to the variant's size (H1 48, H2 36, H3 24, Label 16, Body 16, H4 14), clear its explicit `Lew42 · Icon size` mode, and set `Name` to the local text style of the same name. First record every Icon.Item instance's glyph value: a swap drops the old text-property override, so each instance's nested glyph is then swapped to its own local icon. One call to record, one to swap.
2. **Elements, Showcase, Templates** (15 remote `Icon` + 4 `icon-*`): swap each to the local icon its glyph names, keep its size. One call per page, in parallel.
3. **Icons page**: archive, don't swap. The seven old category frames duplicate the local set; `Page · Icons` and `Workspace` are remote wrappers (blocker 2). Move them to `Archive · Pages` (rule 29). Rebuild `Icons Preview` from local icons. Two calls.
4. **Clear the remote modes** left after the swaps (blocker 3: `Lew42 · Icon size` and the remote `Lew42 · Scale`) with `clearExplicitVariableModeForCollection`. Bundled into the calls above.
5. Lint each page and take a 1:1 screenshot of each changed area.

Rough cost: about 12 to 15 `use_figma` calls. Pilot on Icon.Item first (rule 14).

**The alternative:** keep a single local `Icon` with a text property (the remote design). It wasn't chosen because a font ligature can't show in the swap menu as a thumbnail or a group, it depends on the font being installed, and lint already exempts glyph text as a special case. Vectors swap like any master.
