# Icon audit + facts: minion brief

Load the `minion` skill first. The owner's words: `../owner-words.md` (read in full). The parent brief: `../requirements.md`, asks 1 and 2.

**Fence:** you WRITE only inside `public/framework/ai/sessions/2026/09/30/icon-system/icon-system/audit/` (main tree). You change no site code. Read anything.
**Budget:** about $3. Sonnet. Use grep, not whole-file reads. Stop when the deliverables exist.

## Deliverables
1. `audit.md`: every icon use on the site. Find them by grep: `icon(` calls (the factory is `icon()` in `public/framework/core/View/View.js`, emits `span.material-icons.icon`), `material-icons`, `.icon` in CSS, and any selector styling an icon (e.g. `.x .icon`, `[class*=icon]`). Skip `public/framework/ai/` dated task dirs. For each CSS rule that lays out an icon or its immediate parent, record: file:line, selector, and which of these it sets — padding (icon or parent), width/height, font-size, line-height, vertical-align, flex/grid alignment, background, hover background. Then **group into patterns** (e.g. "inline with text", "square icon button", "icon + label item", "rail"), give a count per pattern, and list the **one-off implementations** ranked worst first (most custom declarations, most callers, or visibly misaligned). A table, one row per pattern; a second table for the one-offs.
2. **Screenshots of misaligned ones:** pick up to 6 suspects, shoot each page at 1920 with `node Server/layout-check.mjs <url> --widths 1920` or a headless Playwright probe in the session scratchpad (base `http://monorepo.localhost`; never drive the owner's tabs), crop or note where. Save PNGs in this dir, link them from audit.md.
3. `facts.md`, short, each claim with how you checked it: Are Material Icons fixed width? (measure: render 10 different ligatures at font-size 24px headless and report getBoundingClientRect widths/heights.) What is the glyph's box vs the line box at line-height 1 vs normal, and where does it sit against adjacent text baseline? When does an icon need a FRAME (a fixed em box, centred both ways) and when not? Recommend frame size in em (so container font-size scales icon, frame and padding together).
4. When done, append a `{"log":{...}}` summary line to your task.jsonl and end your turn. Every process you start uses `windowsHide: true`.

