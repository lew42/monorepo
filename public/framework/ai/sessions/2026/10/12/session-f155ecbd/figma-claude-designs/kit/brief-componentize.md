# Brief: make the layouts and charts instanceable; a near-black mode (2026-10-12, night)

Read [brief-ds.md](brief-ds.md). `DS · 6 Screens` ([ds-screens.md](ds-screens.md)) found the gaps: the seven `DS · 4.1` layouts are frames, not components, and the chart pieces on `DS · 5` (bars, stacked bar, donut, sparkline) are hand-drawn, so screens copy recipes instead of instancing. File `QYN0G2URSBHYH5I06MOjxU`.

## Do
1. **Layout components** on a new page `Kit · Layouts`: `Layout / Stack`, `Two columns`, `Split`, `Media + text`, `Sidebar + content`, `Three columns`, `Bands`. Each region is a SLOT (`{slotContentId}`), hug or fill as in 4.1, gaps/pads bound to Resolution tokens, an `Collapsed` boolean or variant for the 390 stacked form. No grounds inside: the container's Text mode sets the scheme.
2. **Chart components**: `Chart / Bars` (n bars; heights as instance overrides), `Chart / Stacked bar` (segments with `layoutGrow` shares), `Chart / Donut` (arcData per segment), `Chart / Sparkline`, using `accent` + `muted` only.
3. **Near-black**: add a `Near-black BG` mode to the Text collection only if it can't be done as `Dark BG` + a 50% black layer cleanly; otherwise add a `Ground` component (variant Dark / Near-black / Light / Gray) that sets mode + layer, and use it. Say which you chose and why.
4. Swap at least the `DS · 6 Screens` dashboard and article phones to use the new instances (keep the prototype reactions working), and one use per layout on `DS · 4.1`.
5. Link `Kit · Layouts` from the other DS pages' nav row only where it already lists kit pages; don't rewrite pages.

Report `kit/componentize.md` (components + ids, the near-black decision, what was swapped), committed by path.
