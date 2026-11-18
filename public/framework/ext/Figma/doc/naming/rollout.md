# Rollout: every size page to the v4 template (2026-11-17, voice-app)

Michael approved it (~19:45): "go ahead with the proposal, get these resolution pages squared away." The spec is [proposal.md](./proposal.md) (v4). The pilot on 1920 Desktop is done; see the section "Pilot built" in this file and the naming-pilot report. Rules: the readme's Rules (7, 12, 14, 17, 18, 20–24).

**His complaint, which is the test:** "On the 1600 page I see a masonry of 500-wide cards. Everything on the 1600 page should be 1600. Columns are fine, but the main thing should show what 1600 looks like. Background and foreground colours really matter."

## Per page X: the checklist

1. **Root** follows **Root layout v2** at the top of [root-spec.md](../root-spec.md): Root has padding 0, gap `gap` and no fill; each column has the `tint` fill, `section-pad` padding and its own mode. Never `remove()`; clone, then archive the old. It holds titled Root columns, each with an explicit Scale mode X:
   - `X · Preview`: the new preview.
   - `X · Masters`: Default, Content card, and the 2/3/4 folders.
   - optionally `X · Build demo` (1920 already has one).
2. **Archive** everything that isn't X, or is a placeholder or old system, into the hidden `Archive` frame (the last child of Root). That covers old specimens, `Res.*` sets, `Page · X` placeholders, the old Layouts folders, the old masonry preview and anything parked. Archive, never delete; moving keeps instances linked. Leave the owner's hand-made nodes and `image 1` alone.
3. **`X · Default`** exists for every size (1920 `252:797`, 1600 `251:544`, 1000 `251:972`, 600 `251:1290`, 400 `251:1730`). Make 2600, 3440 and 360. Where `X · Content` exists, the Default holds a nested `X · Content` instance instead of its h1. Otherwise it holds the size from the table.
4. **`X · Content`**, for X = 1600, 1000, 600, 400 only: ONE X-wide white padded card on that page, with the bare masters stacked directly inside and dividers between them.
   - Every size gets `X · Content` (the placeholder: dashed outline, h1 = its own name), `X · Content · Text`, `X · Content · Text + Media` and `X · Content · Stat`.
   - 1000 and 1600 also get `X · Content · 2 · Equal`.
   - 1600 is already done (`252:779/781/784/790`).
5. **Layouts** in folders `X · 2`, `X · 3`, `X · 4`. Horizontal, no padding or fill, gap `gap`, columns named `Column 1…N`, Fill. Each column holds the Default named in the table.
6. **The new `.X Preview`**, built beside the old one. Then swap the Index's instance of the old preview to the new one with `swapComponent`, and archive the old preview.
   - **Every item is X wide.** No grid of small cards.
   - Header: h1 "X Tier" plus one line.
   - Content, mostly white surfaces on Colors `light`, with Scheme contrast:
     - a Default with `X · Content · Text`;
     - a Default with `· Text + Media`;
     - a dark-scheme Default;
     - `X · 2 · Equal` with real content in both columns;
     - `X · 2 · Sidebar` with a white sidebar on light gray;
     - `X · 3` where it exists;
     - one image.
   - Items stack with a small gap. For X ≤ 600, arrange the X-wide items in 2–3 columns so the sheet stays compact.
7. **Every new master has a description** (rule 21). Lint shows 0 errors on what you touched. Take one 1:1 screenshot per Root column and check it per rule 18. Root comes out roughly 2:1 to square, with no voids.
8. **Append one row per page to the table below as each page finishes**, so progress shows while you work.

## What nests where

| Page | `X · Content` | Default holds | `X · 2` | `X · 3` | `X · 4` |
|---|---|---|---|---|---|
| 3440 Mega | no | 1920 · Default | 1600 · Default | 1000 · Default | 600 · Default |
| 2600 XL | no | 1600 · Content | 1000 · Default | 600 · Default | 600 · Default |
| 1920 Desktop | no | 1600 · Content | 1000 · Default (built) | 600 · Default (built) | 400 · Default (built) |
| 1600 LG | yes (built) | 1600 · Content | 600 · Default | 400 · Default | 400 · Default |
| 1000 Default | yes | 1000 · Content | 400 · Default | none | none |
| 600 SM | yes | 600 · Content | 400 · Default (rare) | none | none |
| 400 Mobile | yes | 400 · Content | none | none | none |
| 360 XS | no | 400 · Content | none | none | none |

A column's Default is the nearest size. It may be squeezed by about 10% at most, or stretched by up to about 1.6×.

## Progress

| Page | Agent | Root after (size, shape) | New ids | Archived | Notes |
|---|---|---|---|---|---|
| 1000 Default | mastermind-pages-small | 4544 × 3086, 1.5 : 1 (Root v2: no fill, gap `gap`) | columns `1000 · Preview` `260:1258` (`.1000 Preview` `260:1260`), `1000 · Masters` `251:970`; card `1000 · Content` `260:1184`: `1000 · Content` `260:1185`, `· Text` `260:1188`, `· Text + Media` `260:1192` (seagull photo), `· Stat` `260:1199`, `· 2 · Equal` `260:1210`; folder `1000 · 2` `260:1219`: `· Equal` `260:1220` (2 × 400 · Default), `· Sidebar` `260:1225` (400 + 600 · Default); `1000 · Default` `251:972` now holds `1000 · Content` | old `Root Column 2 - Masters` `242:2213` (Layouts incl. Text column `242:3970`, Sections incl. Section · Slot `242:12046`, Containers, Content) and `Root Column 3 - Demos` `242:2215` (Card → section, `.1000 Default Preview · old`) | Index now shows `.1000 Preview` (swapped `162:11146`). Your `Root Column 1 - 1000 Default` `228:4524` (pilot preview `242:6074`, swap demo `242:12067`) is untouched, so it is not yet tinted like the new columns. Removed, not archived: the h1 `251:973` inside `1000 · Default` (before the no-remove rule). The 1000 · 2 columns show real content once 400 · Content exists. Lint 0. |
| 1600 LG | mastermind-pages-large | 4224 × 3286 (1.3 : 1), stopped mid-check | `.1600 · Preview` `260:715` (column `260:716`); `1600 · 2 · Equal` `260:689`, `· 2 · Sidebar` `260:694`, `1600 · 3 · Equal` `260:699`, `1600 · 4 · Equal` `260:706` (folders `260:686/687/688`); `Content` in `1600 · Default` `260:684` | all moved into the hidden Archive `128:8426`, nothing deleted: `242:3594` (old `.1600 LG Preview` `199:2`), `255:5559` (Layouts, Specimens), `251:545` (the Default's h1) | Stopped at voice-app's request: Michael is redoing this page by hand under Root layout v2. Lint at the stop: 1 error (new preview's light fill on the old Root's light ground). `· Text + Media`'s Media `252:788` has the seagull photo. Index has no 1600 preview instance. |
| 1920 Desktop | mastermind-pages-large | 6464 × 3336 (1.9 : 1) | column `1920 · Preview` `262:822` with `.1920 · Preview` `262:824`; pilot columns renamed `1920 · Masters` `252:776`, `1920 · Build demo` `252:829`; Root layout v2 (Root bare, columns tinted and padded, title = column name) | moved into the hidden Archive `128:8859`: `243:776` (old `.1920 Desktop Preview` `188:2`, `Page · 1920 Desktop`), `243:778` (old Masters), `243:780` (Specimens) | Lint: 0 errors except `image 1` `228:7335` (yours, loose on purpose, left alone). `1920 · Default` no longer pins a Scale mode and is fixed 1920; the four layouts are fixed 1920. Index had no 1920 preview instance, so nothing was swapped. |
| 600 SM | mastermind-pages-small | 2700 × 1588, 1.7 : 1 (Root v2) | columns `600 · Preview` `264:930` (`.600 Preview` `264:932`, a 3-column `Masonry` of 600-wide items), `600 · Masters` `251:1288`; card `600 · Content` `264:897`: `600 · Content` `264:898`, `· Text` `264:901`, `· Text + Media` `264:905` (photo above text, stacked), `· Stat` `264:912`; folder `600 · 2` `264:924`: `· Equal` `264:925` (2 × 400 · Default, rare); `600 · Default` `251:1290` now holds `600 · Content` | old `Root Column - 600 SM` `242:2806` (`.600 SM Preview` `200:542`, Layouts `100:5115` with Rail + main / Two small cards / Stat tiles and `Res.600 SM Set`, `Specimens · 600 SM`); the Default's old h1, now `600 · Default h1 (old…)` | The Index has no 600 preview, so nothing to swap. The Image master's "Image" label is hidden on every photo instance (on 1000 too): it floated over the photos. Lint 0 (600 and 1000 rechecked). |
| 2600 XL | mastermind-pages-large | 5984 × 4122 (1.45 : 1) | columns `2600 · Preview` (`.2600 · Preview` `263:1394`) and `2600 · Masters`; `2600 · Default` (fixed 2600, holds `1600 · Content`); folders `2600 · 2` (`· Equal`: 2 × 1000 · Default; `· Sidebar`: 600 + 1600 · Default), `2600 · 3` (3 × 600), `2600 · 4` (4 × 600); a new hidden `Archive` | the whole old `Root Column - 2600 XL` `242:6073` (old `.2600 XL Preview` `195:2`, Layouts with `Res.2600 XL Set`, the step grid, Parked sets) moved into the new hidden `Archive` | Lint 0. Root layout v2. The Masters column is shorter than the Preview, so there is empty space under it. Layouts carry no Scale mode; their Root column sets it. |
| 3440 Mega | mastermind-pages-large | 8480 × 8358 (1 : 1) | columns `3440 · Preview` (`.3440 · Preview` `264:1215`) and `3440 · Masters`; `3440 · Default` (fixed 3440, holds a `1920 · Default` named Content, set to Scheme Light gray so it shows as a band in the band); folders `3440 · 2` (`· Equal`: 2 × 1600 · Default; `· Sidebar`: 1000 + 1920 · Default), `3440 · 3` (3 × 1000), `3440 · 4` (4 × 600) | the old `Root Column - 3440 Mega` `242:3969` (old `.3440 Mega Preview` `197:2`, Masters with your `Res.3440 Mega Set` `100:8489`, Specimens) moved into the hidden Archive `128:9174` | Lint 0. The preview is 8358 tall: each 3440 · Default pads 256 around a 1920 band that also pads 256, because no Default pins a Scale mode now. Setting the inner band to 1920 Desktop would cut about 1500, but that puts a mode inside a master, so it's your call. That leaves a big empty area under Masters. |
