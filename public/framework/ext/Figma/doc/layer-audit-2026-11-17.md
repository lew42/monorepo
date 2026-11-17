# Layer audit of the size pages, and a namespace with fewer wrappers (2026-11-17, read-only)

Lew42 v2 (`ADpu9u2V0BlEZfR3rrMfER`). This is a read-only audit: nothing in Figma was changed. It used 8 `use_figma` reads, one per size page. Rules it builds on: [rules.md](./rules.md) 6, 7, 15, 22 and 24; the Root setup is in [root-spec.md](./root-spec.md).

## 1. Is everything inside Root?

Yes on all 8 size pages, with one exception: **1920 Desktop** has `image 1` (`228:7335`, the owner's screenshot) loose beside Root. Each page also has a hidden `Archive` as Root's last child, which is allowed.

## 2. Wrappers to cut

A **pure wrapper** here is a frame with exactly one visible child and nothing of its own: no fill, no stroke, no effect, no padding. Inside a master, each one adds a click before you reach the instance you want to swap. There are 34 in total:

| Where | Count | What | Fix |
|---|---|---|---|
| Layout masters on 1000, 1600 and 2600: every frame named `Region · …` | 27 | Each holds one instance (Card, Navigation, Two cards…). They exist to carry a width or a Fill. | Put the instance straight in the master, and set Fill or Fixed on the instance itself. On 1000, the `Containers/1·2·3 columns` masters already work this way, with Cards directly inside. |
| `1000 · Text column / Actions` (`242:3975`) | 1 | Holds one Button | The Button goes straight in |
| `Specimens · … / Screens / Grid · Screens` on 1600, 1920 and 3440 | 3 | A grid around a single specimen | The specimen goes straight in `Screens` |
| 2600 `Layouts · 2600 XL / … / Row · 2` (Sections 3, 4 and 6) | 3 | A row holding one example | The example goes straight into its section |

**Hand-made card shells: not pure wrappers, but the same problem.** These are a frame with a fill and padding around one content instance: `Stat card`, `Action card`, `List card` and `Icon + title card`. They appear in every `.<size> Preview` (2 to 3 per page). Under the proposal below, each becomes one `<size> · block` instance with that content swapped in.

**Duplicates.** On 1000 Default, `Two cards` (`100:2139`) and `Three cards` (`100:2189`) do the same job as `Containers/2 columns` (`180:560`) and `3 columns` (`180:583`), but with Region wrappers. `Text column · old` (`100:2115`) has been replaced by `Text column` (`242:3970`). On 2600 XL, `Parked / Layout sets` holds two variant sets (`Layout.Columns.Two Set` `34:5795`, `Layout.Columns.Three Set` `34:5822`), and rule 6 says no variant sets. `Parked / Blocks` and `Parked / Interactive sets` hold only labels; their masters moved to Elements.

## 3. Proposed tree

This follows the owner's direction:
- Master names repeat their path with dots, so a name reads the same wherever it shows.
- Masters are grouped by size, then by column count, in frames named `1`, `2`, `3` and `4`.
- Each size has one default swappable thing, the `block`. It is a card by default. You make it a section by overriding its padding, radius and shadow to 0, not with variants.

```
1920 Desktop/Root                                   (tint, 3440 Mega, horizontal)
  Root Column - 1920 Desktop                        (title, 1920 Desktop mode)
    .1920 Desktop Preview                           (C, hidden from publishing)
  Root Column - Masters
    block
      1920 · block                                  (C) replaces Res.1920 Desktop Set: one master, Card look; override padding/radius/shadow to 0 = Space/section
    1
      1920 · 1 · page                               (C) was "1920 Page"
    2
      1920 · 2 · columns                            (C) two equal columns, no padding, transparent, optional 1 px border; each column = one "1000 · block" instance
      1920 · 2 · sidebar + main                     (C) was Layout.Sidebar Set's open state
    3
      1920 · 3 · columns
  Root Column - Specimens
    specimen instances                              (one "specimen" master: light gray ground, white area, label)
  Notes                                             (a few note frames, plain text)
  Archive                                           (hidden)
```

Every size page has the same skeleton: `<size> · block`, then the `1` to `4` folders, then specimens, then notes. Inside a master the depth is: master → instances, with no Region frames in between.

**Renames, current → proposed** (nothing renamed yet):

| Page | Current master (full name, id) | Proposed |
|---|---|---|
| all 8 | `Res.<size> Set` (Style=Card / Style=Space) | `<size> · block`. The Space look comes from overrides; the set and its variants are archived. |
| 360 XS | `App bar` 100:4743 · `Navigation` 98:164 · `Profile` 98:179 | `360 · 1 · app bar` · `360 · 1 · navigation` · `360 · 1 · profile` |
| 400 Mobile | `Card stack` 100:4291 · `List section` 100:4325 | `400 · 1 · card stack` · `content · list` (see 1000 below) |
| 600 SM | `Rail + main` 100:5116 · `Two small cards` 100:5139 · `Stat tiles` 100:5162 | `600 · 2 · rail + main` · `600 · 2 · columns` · `600 · 3 · stat tiles` |
| 1000 Default | `Text column` 242:3970 · `Containers/1 column` 180:548 · `2 columns` 180:560 · `3 columns` 180:583 · `Nav + main` 100:2164 | `1000 · 1 · text column` · `1000 · 1 · columns` · `1000 · 2 · columns` · `1000 · 3 · columns` · `1000 · 2 · nav + main` |
| 1000 Default | `Section` 180:617 · `Section · Slot` 242:12046 · (Elements `Card · Slot`) | `1000 · block` (a card by default; overrides make it a section, rule 15) |
| 1000 Default | `Content/Text` 180:516 · `Text + button` 180:520 · `Stat` 180:527 · `List` 180:531 · `Two columns of text` 180:541 | `content · text` · `content · text + button` · `content · stat` · `content · list` · `content · two columns`. Content has no width, so its name has no size. |
| 1000 Default | `Two cards` 100:2139 · `Three cards` 100:2189 · `Text column · old` 100:2115 | Archive (duplicates) |
| 1600 LG | `Rail + two cards` 100:3746 · `60 / 40` 100:3785 · `Three cards` 100:3812 · `Rails both sides` 100:3849 | `1600 · 2 · rail + main` · `1600 · 2 · 60/40` · `1600 · 3 · columns` · `1600 · 3 · rails both sides` |
| 1920 Desktop | `1920 Page` 43:8103 · `Page` 51:9277 (holds 2 remote `.Section`) | `1920 · 1 · page` · Archive (Big Sloppy pieces) |
| 2600 XL | `Centred column` 100:3687 · `Sidebar + Main` 100:3511 · `Main + Aside` 100:3618 · `Rail + Main + Rail` 100:3553 | `2600 · 1 · centred column` · `2600 · 2 · sidebar + main` · `2600 · 2 · main + aside` · `2600 · 3 · rails both sides` |
| 2600 XL | `Layout.Columns.Two Set` 34:5795 · `Layout.Columns.Three Set` 34:5822 | Archive |
| previews | `.<size> Preview` | keep (the dot hides them from publishing) |

**Open points for the owner.** These are choices made here; say if any is wrong:
- **"1920 · 2 · columns" holds "1000 · block" instances.** The name gives the block's tier (its Scale mode), not its drawn width. Each column in a 1600 content area is about 790 wide. The alternative is a `half` block per size, but that adds masters.
- **Content masters lose the size prefix.** Rule 13 says atoms need no per-size version. They could move to Elements later.
- **Folders `1`–`4` are plain frames.** The swap menu probably groups masters by the frame they sit in, so it would read `2 / 1920 · 2 · columns`. That is one click, accepted on purpose. This has not been checked in the Figma UI yet.

## 4. Current tree, per page

Notation: `[F]` frame, `[C]` master, `[SET]` component set, `[I]` instance (→ its master), followed by width × height. Text and shape layers are counted, not listed. Siblings repeated more than three times are folded into "… more". 2600 XL is listed 5 levels deep; the other pages are complete.

### 360 XS (Root 2432×5273, `128:9588`, 19 texts)
```
Root Column - 360 XS [F 1920x4761]
  .360 XS Preview [C 1920x1084]
    Content (1600) [F] > Header [F], Masonry [F]
      Column 1: Card · with media [I], Card [I]
      Column 2: Stat card [F] > Content · Stat [I]; Sidebar [I]
      Column 3: Card · Slot [I], Icon.Title [I], Action card [F] > Button [I], Icon + title [I]
  Layouts [F 1240x1198]
    App bar [C 360x52] > Menu button [F] > Icon [I → Icon (remote)]; Actions [F] > Search button, More button > Icon (remote)
    Navigation [C 360x320] > Links [F] > Link (4 or more)
    Profile [C 360x330] > Name [F]
    Res.360 XS Set [SET] > Style=Card [C 360x280], Style=Space [C 360x780]
  Specimens · 360 XS [F 1240x2415]
    Header [F]; Components [F] > Grid · Components [F] > 9 Specimen [I]; Screens [F] > Grid · Screens [F] > 2 Specimen [I]
Archive [F hidden]
```

### 400 Mobile (Root 2432×6696, `128:7721`)
```
Root Column - 400 Mobile [F 1920x6184]
  .400 Mobile Preview [C 1920x1690]
    Content (1600) > Header; Sizes [F] > Screen 360 (Profile, Navigation), Screen 400 (App bar, Card stack), Screen 600 (Rail + main, Two small cards, Stat tiles)
    Masonry > Column 1: Card · with media, Icon + title card [F] > Icon + title; Column 2: Card · Slot, List card [F] > List section; Column 3: Card, Icon.Title
  Layouts [F 1360x1672]
    Card stack [C 368x680] > Card ×3
    List section [C 320x291] > Rows [F] > Row [F] > Icon.Item Set / Size=Body (4 or more rows)
    Res.400 Mobile Set [SET] > Style=Card, Style=Space
  Specimens · 400 Mobile > Header; Components > Grid · Components > 7 Specimen; Screens > Grid · Screens > 2 Specimen
Archive [hidden]
```

### 600 SM (Root 2472×5144, `128:8425`)
```
Root Column - 600 SM [F 1960x4632]
  .600 SM Preview [C] > Content (1600) > Header; Masonry > Column 1: Card · Slot, Icon.Title, Stat card > Content · Stat; Column 2: Action card > Button, Icon + title, Sidebar; Column 3: Card, Card · with media
  Layouts [F 1960x1354]
    Rail + main [C 536x264] > Rail (fixed 72: icon rail) [F] > 5 × (… button [F] > Icon (remote)); Card [I]
    Two small cards [C] > Card ×2
    Stat tiles [C] > Card ×3
    Res.600 SM Set [SET] > Style=Card, Style=Space
  Specimens · 600 SM > Header; Components > Grid · Components > 7 Specimen; Screens > Grid · Screens > 2 Specimen
Archive [hidden]
```

### 1000 Default (Root 6992×4207, `128:9589`; owned by the 1000 pilot, read as it stood)
```
Root Column 1 - 1000 Default [F 2128x3021]
  .1000 Default Preview [C 2128x1493] > Header; Masonry > Column 1: Text column, Card · Slot, Card · with media; Column 2: Card · Slot ×3, Example · Sidebar + main [F] > Sidebar [F] > List; Main [F] > Two columns of text
  Swap demo [F] > Caption; Steps > Step 1–4 [F] > Caption, Section [I]
Root Column 2 - Masters [F 1920x3695]
  Layouts [F]
    Text column [C 1000x341] > Text (max 720: measure) [F]; Actions [F WRAPPER] > Button
    Text column · old [C] > Region · Text column (max 720: measure) [F WRAPPER] > Card
    Two cards [C] > Region · Left [WRAPPER] > Card; Region · Right [WRAPPER] > Card
    Nav + main [C] > Region · Nav (holds 360 / Navigation) [WRAPPER] > Navigation; Region · Main (holds 600 / Two small cards) [WRAPPER] > Two small cards
    Three cards [C] > Region · Column 1–3 [WRAPPER] > Card
  Sections [F] > Section [C] > 3 columns [I]; Section · Slot [C] > Content [SLOT]
  Containers [F] > 1 column [C] > Card; 2 columns [C] > Card ×2; 3 columns [C] > Card ×3
  Content [F] > Text [C]; Text + button [C] > Stack, Button; Stat [C]; List [C] > Row ×3; Two columns of text [C] > Stack ×2
Root Column 3 - Demos [F 1920x2777]
  Card → section [F] > Caption; As cards > Card · Slot ×2; Section · Slot [I]
  .1000 Default Preview · old [C] > Content (1600) > Header; Band > Three cards, Row > Nav + main, Text column · old; Masonry > Card, Stat card > Content · Stat, Card · Slot, Card · with media, List card > List section, Icon.Title
Archive [hidden]
```

### 1600 LG (Root 4032×7426, `128:8858`)
```
Root Column - 1600 LG [F 3520x6914]
  .1600 LG Preview [C] > Content (1600) > Header; Masonry > Column 1: Card · Slot, Icon.Title, Stat card > Content · Stat; Column 2: Icon + title, Action card > Button, Sidebar; Column 3: Card, Card · with media
  Layouts [F 3394x1880]
    Rail + two cards [C] > Region · Rail (holds 360 / Navigation) [WRAPPER] > Navigation; Region · Main (holds 1000 / Two cards) [WRAPPER] > Two cards
    60 / 40 [C] > Region · Main (holds 1000 / Text column) [WRAPPER] > Text column · old; Region · Aside (holds 600 / Stat tiles) [WRAPPER] > Stat tiles
    Three cards [C] > Region · Column 1–3 [WRAPPER] > Card
    Rails both sides [C] > Region · Rail left [WRAPPER] > Navigation; Region · Main [WRAPPER] > Text column · old; Region · Rail right [WRAPPER] > Profile
    Res.1600 LG Set [SET] > Style=Card, Style=Space
  Specimens · 1600 LG > Header; Components > Grid · Components > 8 Specimen; Screens > Grid · Screens [WRAPPER] > 1 Specimen
Archive [hidden]
```

### 1920 Desktop (Root 9068×4608, `128:9173`; `image 1` loose outside Root)
```
Root Column - Preview [F 2016x3065]
  .1920 Desktop Preview [C] > Content (1600) > Header; Band > Layout.Sidebar Set / State=Open; Masonry > Stat card > Content · Stat, Card, Icon + title, Card · with media, Card · Slot, Icon.Title, Action card > Icon + title, Button
  Page · 1920 Desktop [F] > Page master [I → 1920 Page]; Layout.Sidebar Set [I → State=Open]
Root Column - Masters [F 2060x3954]
  Masters [F] > Res.1920 Desktop Set [SET] > Style=Card, Style=Space; 1920 Page [C]; Page [C] > Header; Content > .Section (remote) ×2
Root Column - Specimens [F 3968x4096]
  Specimens · 1920 Desktop > Header; Components > Grid · Components > 7 Specimen; Screens > Grid · Screens [WRAPPER] > 1 Specimen
Archive [hidden]
```

### 2600 XL (Root 19672×24390, `154:1701`; listed 5 levels deep)
```
Root Column - 2600 XL [F 19160x23878]
  .2600 XL Preview [C] > Content (1600) > Header; Masonry > Card · Slot, Icon.Title, Card, Action card, Icon + title, Sidebar, Stat card, Card · with media
  Layouts [F 18840x2048]
    Label group [F]
    Sidebar + Main [C 2600x1440] > Region · Rail (SM, 600) [WRAPPER] > Navigation; Region · Main (Desktop, fills) [WRAPPER] > Dashboard grid
    Rail + Main + Rail [C] > Region · Left rail (XS, 360) [WRAPPER] > Navigation; Region · Main (LG, fills) [WRAPPER] > Article; Region · Right rail (XS, 360) [WRAPPER] > Profile
    Main + Aside [C] > Region · Main (Desktop, fills) [WRAPPER] > Form; Region · Aside (SM, 600) [WRAPPER] > Stat tiles
    Centred column [C] > Region · Column (squeeze, 1800 at XL) [WRAPPER] > Article
    Res.2600 XL Set [SET] > Style=Card, Style=Space
  Layouts · 2600 XL [F 19160x15284]
    Header
    Grid · steps 1 to 7 (one column per step) [F 18920x12707]
      Section 1 · Single column > Label group; Row · 1 > Example · Full width / Centred at squeeze / Text column, 720
      Section 2 · Two columns > Row · 1 (50/50, 60/40, 40/60); Row · 2 (Rail left + fill, Fill + rail right, Rails on both sides)
      Section 3 · Three and four columns > Row · 1 (Three equal, Four equal, Rail + three); Row · 2 [WRAPPER] > Six equal
      Section 4 · Treatment: padding and gaps > Row · 1 (3 examples); Row · 2 [WRAPPER] > Flush, no gap
      Section 5 · Treatment: grounds and cards > Row · 1, Row · 2 (6 examples)
      Section 6 · Content in the regions > Row · 1 (4); Row · 2 [WRAPPER] > Do: three columns; Row · 3 (Miller desktop, Miller mobile, Sidebar toggle)
      Section 7 · Nesting > Row · 1–3 (8 examples)
    Section 8 · Range [F 10080x1832] > Row · 1 > Example · 1920 / 2200 / 2600 / 3000 wide > Review [I → Review Set / Status=Draft], Page · … (fixed: viewport) [F]
  Parked / Blocks [F] > Label group; Masters [F] (labels only)
  Parked / Layout sets [F 8200x3106] > Masters > Layout.Columns.Two Set [SET] (Card-style, Flush), Layout.Columns.Three Set [SET] (Page card, Columns)
  Parked / Interactive sets [F] > Label group; Masters [F] (labels only)
Archive [hidden]
```

### 3440 Mega (Root 7520×11266, `128:9587`)
```
Root Column - 3440 Mega [F 7008x10754]
  .3440 Mega Preview [C] > Content (1600) > Header; Band > Sidebar + Main [I]; Masonry > Icon.Title, Card · with media, Card · Slot, Icon + title, Card ×2, Stat card > Content · Stat
  Masters [F 7008x1580] > Res.3440 Mega Set [SET] > Style=Card [C 3440x600], Style=Space [C 3440x1440]
  Specimens · 3440 Mega > Header; Components > Grid · Components > 7 Specimen; Screens > Grid · Screens [WRAPPER] > 1 Specimen
Archive [hidden]
```

**Also seen.** Remote Big Sloppy `Icon` instances sit inside the 360 `App bar` and the 600 `Rail + main` masters, and two remote `.Section` instances sit inside the 1920 `Page` master. These are publish blockers, already listed in [research/publish-audit.md](./research/publish-audit.md).
