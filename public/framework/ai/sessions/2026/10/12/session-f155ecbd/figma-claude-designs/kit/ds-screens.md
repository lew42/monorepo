# DS · 6 Screens (2026-10-12, night)

**Page built:** `DS · 6 Screens` (after `DS · 5 Diagrams & charts`), file `QYN0G2URSBHYH5I06MOjxU`. Docs root `173:1360` (nav links, h1, gist, a Specimen clone of each phone, dark Rules box listing components per screen). The live, clickable frames sit right of the root.

**Phones (390, Mobile, top-level frames at x=1600+):** 1 Sessions list `169:1064` · 2 Session detail `171:1206` · 3 Settings `171:1278` · 4 Dashboard on near-black `171:1351` · 5 Article `171:1420`.
**Desktop (1440, Default, below the phones):** Sessions `172:1249` · Detail `172:1338` · Article, title-left `172:1408`.

**Prototype:** big ▶ PROTOTYPE badge `173:1656` above screen 1; flow start = screen 1. List rows → detail, detail back → list, tab bar (Sessions / Settings / Stats / Docs) on screens 1–4, article back → Settings. Reactions sit on the instances' inner nodes.

**Components added or changed:** none. Every frame is kit instances plus plain auto-layout containers bound to tokens.

**Could not do / missing** (also in the Rules box):
- 4.1 layouts are frames, not components, so the screens follow their recipes instead of instancing them.
- No chart components: bars (frames) and the donut (ellipse `arcData`) are hand-drawn; the article image boxes are hand-made too.
- Near-black has no token: it is `surface` (Dark BG) + a 50% black layer.
- No component named Card; no sidebar instanced (desktop nav is Tab + Logo).
- Three Stats in a row wrap at 390, so the strip is 2×2.

**Still looks off:** the Tab bar's active label on the dark screen reads dark on dark; the docs page is tall (specimens fit 2 per row at 1440); the desktop Sessions page uses `pad-y` rather than `section-pad-y` (120 was too loose for an app page).
