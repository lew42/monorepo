# Pilot: the 1000 Default page (built 2026-11-17, waiting for your look)

**Status: built on [1000 Default](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=64-2898).** It follows [rules](./rules.md) 7 and 17–24, the [Root plan](./root-plan-2026-11-17.md) and your words ([Root](./owner-words-2026-11-17-root.md), [layouts](./owner-words-2026-11-17-layouts.md), [section 6](./owner-words-2026-11-17.md)). Nothing old was deleted: what was replaced sits beside its replacement or in the hidden `Archive`. Nothing rolls out to other pages until you approve this one (rule 14).

## What you see

Root (`128:9589`) follows the spec: horizontal, fill Colors `tint`, Scale 3440 Mega, padding `section-pad-x` / `-y`, gap `section-pad-x`. It is **6992 × 4207** (about 1.7 : 1). Its only children are three titled Root columns and the hidden Archive. Each column sets Scale **1000 Default** and hugs its height.

```
Root  6992 × 4207, horizontal, tint, Mega
├─ Root Column 1 - 1000 Default (2128 wide)  "Preview"
│    .1000 Default Preview (NEW)   title "1000 Default" + Masonry of 7 example cards
│    Swap demo (rebuilt, wraps 2 + 2)
├─ Root Column 2 - Masters (1920)            "Masters"
│    Layouts   Text column (NEW), Text column · old, Two cards, Nav + main, Three cards
│    Sections  Section, Section · Slot (NEW)
│    Containers, Content
├─ Root Column 3 - Demos (1920)              "Demos"
│    Card → section (swap demo)
│    .1000 Default Preview · old  (the Index still shows it)
└─ Archive (hidden)
```

Column heights are 3021, 3695 and 2777. About 15% of the column band is empty, and about 36% of the whole Root, its Mega padding included.

## The decisions, one line each

1. **The page title comes from the preview** (your words: "the title can come from the preview itself"). Column 1 is titled "Preview", and the preview's own `h1` "1000 Default" sits right under it, linked to the page.
2. **The preview is layout exploration at 1000** (rule 23): a `Masonry` of 7 example cards, each about 1000 wide, with column heights 1107 and 1095. Reading order: single column (reading), single column (dark), 50/50, 1/3 + 2/3, sidebar + main, three columns, then the image card.
   - **Widths:** every width is Fill. The only fixed width is Root Column 1 at 2128, which makes each card 1000 (2128 − 2 × 48 padding − 32 gap, halved). Stretch that column to watch the cards wrap.
   - **Built from masters:** `Card · Slot` instances with only their slot content changed (Content masters inside), the new `Text column`, and `Card · with media`. The dark card is `Card · Slot` with Scheme Dark. Sidebar + main is a one-off frame: a white sidebar beside a Main region on Scheme Light gray.
   - **Ground colours as you locked them:** the sheet is Colors `light`, the cards are white, and Root is `tint`.
3. **Text column:** a new master (`242:3970`), a full-width card where only the `Text` frame stops at the 720 `measure`. The old one is renamed `Text column · old` and stays beside it in Layouts.
   - *Alternative:* a narrow card centred in a filled band. It wins for long-read pages.
4. **Card → section is a swap between two masters** (rule 22, which replaces the override idea in rule 15). The new `Section · Slot` (`242:12046`, in Sections) is `Card · Slot` drawn flush: radius 0, no shadow, clip on, section padding. Swap an instance between the two; the slot content stays. The demo shows both.
5. **Swap demo rebuilt:** the steps wrap two per row inside the 1920 column, Fill with a minimum of 800. The old 5120-wide demo is in Archive.
6. **Modes (rule 19):**
   - **Before the columns:** each Root child had its resolved mode set explicitly, so nothing shifted when Root went to Mega.
   - **The master folders:** they then dropped that mode, so they show the column's 1000 Default again. That is how they looked before Root went to Mega.
   - **Left as is:** the old preview keeps its own 1920 Desktop mode.
7. **Every new master has a description** (rule 21): Text column, Section · Slot, the new preview. Card · Slot's description now also names its swap partner.

## Moved to Archive

`Res.1000 Default Set`, `Specimens · 1000 Default`, the loose `Text column` instance (`103:24900`, a copy of the old master) and the old 5120 `Swap demo`. Already there: `Page · 1000 Default`, `Cut · old page contents`.

## What you check to approve it

1. Column 1 at a glance: does the preview read as "1000" (one card width, single column first)?
2. Text column: the card lines up with its neighbours, and its text line stops at 720.
3. Card → section: does swapping between `Card · Slot` and `Section · Slot` feel right?
4. Root: about 1.7 : 1 with no big void. Is three columns the shape you want on every size page?
5. When the new preview is approved, point the Index at it, then archive the old one.

## Found on the way

- **Lint double-counted colour alpha:** a paint bound to `tint` (black 5%) stores the 5% as `paint.opacity`, and lint multiplied by the variable's 5% again. It made the tint look invisible, so lint reported same-on-same where there was none. Fixed in [lint.js](./lint.js).
- **A text style id ends in a comma** (`S:…,`). Setting it without the comma fails silently and leaves the text at 12 px. Look styles up by name (`getLocalTextStylesAsync()`).
- **Seagull photos (fix job):** all 10 preview photos are cropped with no distortion, head and upper body, using `CROP` with the full image width. The 512 × 200 Media box can't be resized on an instance; a taller box in `Card · with media` is logged in [improvements](../improvements.jsonl).
- **Still open:**
  - The `Section` master is 1200 wide on a 1000 page (rule 17). It needs a 1000 version or a label.
  - The dark example sets Scheme Dark on the instance. That is a mode, not a content override, but it is worth a look under rule 22.
