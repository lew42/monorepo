# Publish audit: is Lew42 v2 ready to publish? (2026-11-17)

**Ready to publish? No.** Three things stand in the way:

1. **The file still borrows from the old library, Big Sloppy** (the Lew42 Design System file, `hbolzQ3Xnc78rhxAPj8xK2`). The `Icon.Item Set` master and the Icons page use its Icon, its icon glyphs, its text styles and its Icon size modes. Every page that holds an Icon.Item inherits that dependency. No library is attached any more, so these pieces are frozen copies that can never update.
2. **Test and lab masters would be published next to the real ones** (Master 1–6, Case 1–3, Swap test card, Card Set, Heading Set).
3. **Lint finds 867 errors on the 20 working pages**, and 2,931 more on the 7 Explore pages. Five pages are clean: 360 XS, 400 Mobile, 600 SM, 1600 LG and 3440 Mega.

What was checked: all 27 pages with [lint.js](../lint.js) (one read-only call per page), the 4 local variable collections, the 8 text styles, and every remote component, style and variable still in use. That took 35 Figma calls. The only edit to the file: 12 stale bound paints were re-bound to the same variable (see the last section).

## Blockers

| # | What | Where | Fix | Cost to reverse |
|---|---|---|---|---|
| 1 | Remote icon system from Big Sloppy | The `Icon.Item Set` variants `43:6070`–`43:6085` (Icons page) hold a remote `Icon` plus the remote text styles h1, h2, h3, h4, body and label. The Icons page holds 95 remote masters: about 90 `icon-*` glyphs, `Icon`, and `Page Set/Size=1920`. Also: 3 remote Icons on 360 XS, 5 on 600 SM, and 4 `icon-*` on Elements. Remote `size` and `text` bindings sit inside instances on 17 pages. | Build a local Icon and its glyph set on the Icons page, beside the old ones. Swap Icon.Item's nested Icon to it, set its Name to the local text styles, then swap the remaining remote Icons. | Medium. Swaps keep node ids and Undo or version history reverts them. Pilot on a copy (rule 14). |
| 2 | Big Sloppy layout pieces | Index: `Page Set/Size=1920` (the reference paste). Icons: 3 `Page Set` instances, wrapping `Page · Icons` `43:6068` and `Workspace` `43:6252`. 1920 Desktop: 2 remote `.Section`, plus 1 remote h1 text and 1 remote body text. 22 local nodes bind Big Sloppy variables directly (Index 5, Icons 16, 1920 Desktop 1). | Replace them with local Page and Section instances, or move them to a hidden Archive frame. | Low. Archiving is a move; unhide to restore. |
| 3 | Explicit modes from Big Sloppy collections | `Lew42 · Icon size` modes on 18 nodes (360 XS 3, 600 SM 5, Elements 4, Icons 6). `Lew42 · Scale` (the remote one) modes on 4 nodes (Index 1, Icons 3). | After blocker 1, clear them with `clearExplicitVariableModeForCollection`. | Low |
| 4 | **Done 2026-11-17** ([cleanup](../cleanup-2026-11-17.md)): Masters that should not publish | From [master-homes.md](../master-homes.md) (snapshot of 2026-11-16): Master 1–6 and Case 1–3 on Scale, `Swap test card` `100:5846`, `Card Set` `34:244` (7 variants) and `Heading Set` `34:466` (52 broken variants) on the Explore pages. | Archive them, or start the name with `.` to hide it from publishing. | Very low (rename back) |
| 5 | Pages without one Root | AI: no Root, 8 loose frames. Live: no Root (`61:9` and `Done · archive` `114:9146`). 1000 Default: 4 folders outside Root (`180:644` Sections, `180:645` Containers, `180:646` Content, `181:557` Swap demo). Index: a loose rectangle `image 1` `148:25853`. | Move them into Root, or into a hidden Archive frame. | Low |
| 6 | Lint errors on the working pages | Table below. The causes that repeat: (a) the Button master's inner frame `23:509` is light gray inside light-gray Cards, which gives same-on-same errors on Showcase (9), Elements and 1920 Desktop; one master fix clears them all. (b) Scale was built with raw values: 229 unbound paddings and gaps, 59 unbound fills. (c) 2600 XL has 73 white cards on white regions. (d) Padding is bound to `text-gap` or `gap`: Templates inputs `99:3777`…, Text, Columns (64), Card vs Section (12), Elements `34:5582`. (e) Body text runs 1,200–2,500 px wide (Scale 27, Card vs Section 17, Templates 10, Text 8). (f) Live has 39 titles in raw black. | Fix one page at a time, masters first (rule 14). Re-run lint after each. | Low per fix |
| 7 | Tokens not defined once | The token section below. | The proposal below, after the owner approves it. | Medium (rebinding) |
| 8 | **Done 2026-11-17** ([cleanup](../cleanup-2026-11-17.md)): The 7 Explore pages | 2,931 lint errors, and the masters in blocker 4 | Move them to the end under an Archive group, or into the Lab file, before publishing. | Low |

**Lint errors per page** (`lint.js`, 2026-11-17): Scale 326 · Columns 116 · Elements 78 · 2600 XL 77 · Icons 65 · 1920 Desktop 51 · Live 43 · Templates 37 · Card vs Section 36 · Text 12 · AI 9 · Showcase 9 · 1000 Default 4 · Squeeze 3 · Index 1 · 360 XS, 400 Mobile, 600 SM, 1600 LG, 3440 Mega 0. Explore pages: Color permutations 1,794 · Sizing 275 · Drag playground 237 · Icon + title 223 · Legacy vs Latest 206 · Figma → CSS 132 · Layout examples 64.

## Tokens today

- **`Lew42 v2 · Scale`**: 13 numbers × 8 modes (1000 Default is the default mode, then 360 XS, 400 Mobile, 600 SM, 1600 LG, 1920 Desktop, 2600 XL, 3440 Mega). The variables: pad-x, pad-y, gap, radius, squeeze, section-pad-x, section-pad-y, button-pad-x, button-pad-y, text-gap, card-min, width and measure.
- **`Lew42 v2 · Colors`**: 8 colours × 1 mode: prime, light, dark, error, ok, warn, ink and master.
- **`Lew42 v2 · Scheme`**: 5 colours × 4 modes (White, Light gray, Prime, Dark): text, muted, fill (aliases light, prime and dark), accent (aliases prime) and on-accent (aliases ink in every mode).
- **`Lew42 v2 · Surface`**: 4 variables × 2 modes (Card, Section): surface-gap, layout-padding, surface-radius and surface-ground.
- **Styles**: 8 local text styles (h1, h2, h3, h4, body, label, code, small), every one used somewhere. 1 effect style, `Card shadow`, which is used. No paint or grid styles. Nothing is hidden from publishing.

**Flags**

- **Overlaps.**
  - The ground colour is said three ways: Colors `light` (bound directly on grounds), Scheme `fill` in its Light gray mode (which aliases `light`), and Surface `surface-ground`.
  - The radius is said twice: Scale `radius`, and Surface `surface-radius`, which aliases `radius` in its Card mode.
  - Surface `surface-gap` and `layout-padding` both alias Scale `gap`, so `layout-padding` is a gap value used as padding.
  - Scale `section-pad-y` equals `pad-y` in all 8 modes. `section-pad-x` equals `pad-x` in all modes except 400 Mobile (16 against 24).
- **Constants inside a moded collection.** `measure` is 720 in all 8 modes. `squeeze` is 1600 in 6 of the 8. Scheme `on-accent` is `ink` in all 4 modes.
- **Unused.** Colors `warn` has 0 bindings and nothing aliases it. `ok` has 1 binding. `dark` is used only through the Scheme alias.
- **Loose scopes.** Six Scale variables are set to ALL_SCOPES (section-pad-x, section-pad-y, button-pad-x, button-pad-y, text-gap, card-min), so they show in every number picker: opacity, font size and the rest.
- **Odd names.**
  - `squeeze` is a maximum content width; the old library called it `content-max`.
  - Every collection carries "v2" in its name, and that name travels into every file that uses the library.
- **Remote variables still bound.** Six Big Sloppy collections are still referenced:
  - `Lew42 · Scheme` (text, muted, surface, accent, on-accent)
  - `Lew42 · Scale` (h1-size, section-pad-x and -y, radius, gap, pad-x, pad-y)
  - `Lew42 · Colors` (light)
  - `Lew42 · Selection` (bg)
  - `Lew42 · Icon size` (size)
  - `Lew42 · Image` (modes only)

  Most of these sit inside the remote instances from blockers 1 and 2.
- **Remote text styles.** h1, h2, h3, h4, body and label from Big Sloppy are still applied to the 6 Icon.Item variants, and h1 and body are each on one text on 1920 Desktop.

## Token cleanup: before and after (a proposal only)

Nothing changes until the owner approves (rule 14). The alternatives and their reasons are noted on each line.

- **Surface (4 variables) → 2.** Drop `surface-gap` and `layout-padding`, and rebind those layers to Scale `gap` and `pad-x`/`pad-y`. Keep `surface-radius` and `surface-ground` while the Card or Section experiment runs ([card-vs-section.md](../card-vs-section.md)). Once [color.md](./color.md) (question C) is decided, fold the last two into Scale `radius` and Scheme, and delete the collection.
- **Scale `section-pad-x` and `section-pad-y`.** Give them their own larger values, from the table in [scale-tokens.md](../scale-tokens.md), so they mean something. The alternative is deleting both and rebinding to pad; that costs about 1,000 rebinds, so I don't recommend it.
- **Scale scopes.** Set GAP on the five spacing variables and WIDTH_HEIGHT on `card-min`. Nothing on the canvas changes.
- **Scale `squeeze` → `content-max`.** A rename keeps every binding.
- **Colors `warn`.** Delete it (0 uses). The alternative is to keep it next to `ok` and `error` as a set of three.
- **Big Sloppy references: 6 collections and 6 text styles → 0.** These go away by themselves once blockers 1 to 3 are fixed.
- **Count.** 4 collections and 30 variables today. After the first step: 4 collections and 27 variables (Surface down to 2, `warn` gone). After the Card or Section decision: 3 collections and 25 variables.

## Stale paints fixed

The 12 nodes below were each bound to Colors `light` (#F5F5F5) but stored a cached white (#FFFFFF), the same fault [lint.md](../lint.md) records for `162:10434`:

- `174:1588` .Scale Preview
- `200:1009` .360 XS Preview
- `162:10582` .400 Mobile Preview
- `200:542` .600 SM Preview
- `199:2` .1600 LG Preview
- `188:2` .1920 Desktop Preview
- `195:2` .2600 XL Preview
- `100:1636` Page · 2600 × 1440
- `197:2` .3440 Mega Preview
- `176:401` .Templates Preview
- `172:516` .Elements Preview
- `176:2` .Text Preview

Every one but the 2600 XL page frame is a Preview frame, so the script that builds previews ([preview-recipe.md](../preview-recipe.md)) is the likely source.

The first fix, `setBoundVariableForPaint(paint, 'color', v)` on the existing paint, left the cached white in place. What worked was setting the paint's colour to `v.resolveForConsumer(node).value` first, then calling `setBoundVariableForPaint`. A read-back confirmed all 12 store #F5F5F5 and stay bound to `light`.

No stale paints were found inside instances. `lint.js` now has a `stale-paint` rule, so the next lint run catches this.
