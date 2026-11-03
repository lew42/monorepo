# Flex guide — notes

`public/framework/styles/layouts/flex/page.js` (99 lines). Screenshots: `guide-flex-1280.png`, `guide-flex-400.png`.

**Already good.** Nine one-word class-string cards (row → gap → v → v-center → split → auto → basis → wrap → three), each opens at real size, draggable, source shown, click a box to see its words. "Where it breaks" section is the strongest part: three identical rows at different `--column` tokens breaking at different widths, one clause each. Ends on four copy-paste templates + a next link to Grid. Reads as a scan, one clause per idea — the house style.

**Missing, in the order a 5-year-old would need them:**
1. **Grow weights** — every example is equal peers (`auto`) or one fixed + one fluid (`basis`/`flex-1`). Never shown: two `flex-1`s at *different* numbers (`flex: 2` vs `flex: 1`) — the single idea that explains "why is one box bigger."
2. **`min-width: 0` and why text refuses to shrink** — not mentioned anywhere. This is the #1 flex trap (a flex child's default min-width is `auto`, so long unbroken text/a wide child blows out its row instead of wrapping). Panel's own `size.js` hug/fixed logic runs straight into this (see scenario 5 in this task's log — a hugged column didn't visibly react to short-vs-long content).
3. **`align` vs `justify`** — cross-axis vs main-axis is named nowhere; `v-center` and `split` each show one axis, never both together or the words that distinguish them.
4. **Wrap vs squeeze, side by side** — `wrap` and the plain `row` (squeeze) exist as separate cards; a 5-year-old needs them on the SAME screen with the same content to see the choice.
5. **A nested row-in-column** — every example is one level. Panel's own scenarios (this task) are nested 3 deep; the guide never shows even 2.

**Extend in place or rebuild as a panel step-through?** Extend in place, once. The card format already teaches well (this task's own drive found the toolbar's popovers and hover-reveal hard to script headlessly — a beginner would hit the same friction pointing a mouse). A rebuild-as-Panel-flow is worth doing only *after* a real panel-flow recorder exists (per requirements.md's north star) — building the guide twice, once now in cards and again as a flow, is not "less is more." Add the five gaps above to the existing nine cards first; revisit the flow idea when `sow`/`structure` can record a session rather than roll one.
