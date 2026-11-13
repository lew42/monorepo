# Token audit: Lew42 Design System variable collections (2026-11-13)

The file now has **10 variable collections**, every name prefixed "Lew42 · " (it was 18 collections, 49 variables). Each has a live demo page under Tokens ([readme](../readme.md#the-token-demo-pages-mine-2026-11-13)). This page records what was done and the flags still open. The recipe for binding and modes is in [use-figma.md](./use-figma.md).

## The 10 collections

| Collection | Variables x modes | Role |
|---|---|---|
| Colors | 8 x 1 | The base palette; Scheme aliases it |
| Scheme | 5 x 4 (White, Light gray, Prime, Dark) | text, muted, surface, accent, on-accent: every card, page and button reads it |
| Scale | 12 x 7 (cards bind pad-x, pad-y, gap directly) | The size system; the owner's own, values unchanged |
| Constants | 2 x 1 (round, icon-pad) | Values that never change with size |
| Button | 3 x 9 | Every button and pill: fill, label, stroke |
| Selection | 3 x 3 (Off, On, Hover) | Marks the selected item |
| Icon size | 1 x 6 | The one switch for icon size |
| Image | 1 x 2 (Rounded, Flush) | Why a photo has no corner inside a card |
| Bar | 4 x 3 (Plain, Tonal, Floating) | Bars and toolbars |
| Flow | 5 x 1 | The flowchart kit; stays separate because it belongs to one feature |

## What was done (owner approved, 2026-11-13)

1. **Renamed** the ten with the "Lew42 · " prefix (a rename keeps every binding).
2. **Card padding merged into Scale.** 20 direct bindings and 5 on the Cut list were repointed to Scale `pad-x`, `pad-y` and `gap`; the one Unpadded Card became a plain 0. Card `8:5` and Panel `153:1779` look unchanged (checked by screenshot).
3. **Theme merged into Scheme.** Scheme `accent` in White, Light gray and Dark is now an alias of Colors `prime`, and `on-accent` there is a literal white; the Prime mode is unchanged. The Blue, Gold and Teal demo units went to the Cut list (`Cut · Theme · the UI colour section`, `Cut · Page · Themes`, `Cut · Pills · Theme modes row`); the Live and Component notes swatches became literal fills.
4. **Tossed:** Label, Device, TEST Pad, Size (demo, Pill), Card strategy test, ZZ scratch dir. A before-and-after read of 223 bound nodes showed zero value changes, because deleting a variable keeps each node's last value.
5. **Flow stays separate** (not folded into Constants), as the owner decided.
6. **Demo pages** for the seven collections that had none: Constants, Button, Selection, Icon size, Image, Bar, Flow.

Leftovers, harmless: 24 literalized swatches still carry an explicit mode of the deleted Theme collection; the Cut list's old Theme bindings keep their last values. Collection id `41:159` is an orphan explicit mode on 21 nodes of the file's root page; clear it when touching that page.

**The alias chain** (shown at the top of the ↳ Button page, 534:11266): a button reads Button, which aliases Scheme, which aliases Colors. Primary fill = Scheme `accent` = Colors `prime`; Primary label = Scheme `on-accent` = white (ink on the Prime ground). So the Scheme mode of the ground a button sits on picks its colours, shown by one Primary button on each of White, Light gray, Prime and Dark.

## Flags still open (proposals; values untouched)

- **Bar fill = Selection bg in every mode** (Plain=Off transparent, Tonal=Hover black 6%, Floating=On surface). One could be dropped from Bar.
- **Scale gap-y** aliases gap in 6 of 7 modes; only Mobile differs (24 vs 16). 11 uses. Toss candidate.
- **Scale content-max** (1680, 400, 2400, 1600...) does not match the 1600 and 2880 areas the resolution pages use; **toolbar-pad-x** has 9 uses.
- **Button label** equals Scheme text in 5 of its 9 modes (aliased, fine).
- **Scheme muted:** White and Light gray are the same value.
- **Icon size:** Body and Label are both 16, so one mode is a duplicate.
- **Colors ink** has 0 direct uses (only Scheme on-accent in Prime). **ok** and **warn** have 1 use each and no alias.
- **Flow arrow-gap** is 0 and **fork-half-row** (-61) has 0 uses.

## Redundancy seen on the Scale demo page (values unchanged)

Read from the Scale demo page, columns ordered by width. Proposals only.

- **XS vs Mobile:** pad-x 16 and 16, h1-size 32 and 32, radius 3 and 4. They differ only in pad-y (16 vs 32), gap (12 vs 16), button padding and section padding. Closest pair; the first mode to merge.
- **Mega vs XL (not monotonic):** Mega is the 3440 column but its pad-y is 64 (XL 80), radius 6 (XL 8), btn-pad-x 24 (LG 32, XL 40), btn-pad-y 14 (LG 18, XL 22). Buttons and padding shrink going to Mega while section-pad doubles. Either Mega should continue the ladder or XL is the redundant one.
- **LG vs Default:** pad-x 64 vs 48, gap 40 vs 26, content-max both 1680. Visibly different, keep unless the ladder shrinks.
- **content-max** is 1680 in Default, LG, XL, 1600 in SM and XS, 2400 Mega, 400 Mobile: the "wider than the cell" bar cannot show it as a shape.
- **gap-y** equals gap in every mode except Mobile (24 vs 16): drop the variable and give Mobile's two stacks the gap directly, or keep it only for Mobile.
- **radius** is 3, 4, 4, 4, 6, 6, 8: four of seven modes are 4 or less, nearly indistinguishable on screen.
- **Desktop (1920)** has no mode: it uses Default with a 1600 area.
