# Minion brief: did the inventory find ALL the layout system-design work, and what is broken?

Load the `minion` skill first, then `layout` (read "Leave the defaults alone, one property at a time"). You are READ-ONLY on the site: write exactly one file, `inventory-audit.md` in the task dir. Commit nothing.

Task dir (the whole conversation): `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\page-system\`. The inventory is `inventory/A-imagine-layouts.md`, `B-framework.md`, `C-task-logs.md`, merged into `public/framework/core/Page/layout/doc/prior-work.md` (the 92-row judged table).

The owner asked (relayed 2026-09-29): did the earlier fan-out inventory really find ALL the layout system-design work? Some of it may be broken, maybe because the owner "was overly explicit about how to determine height and width and padding".

## Do
1. **Coverage.** Look for layout system-design work that prior-work.md misses. Search `public/framework/ai/**/task.jsonl` and `requirements.md` for layout, spacing, padding, width, height, measure, columns, grid, clamp, bleed, rhythm, sizing; memory-style notes in `.claude/`; the `layout`, `css` and `page` skills and their `improvements.md`; `public/framework/styles/**`, `core/Layout`, `core/Page/columns`, `ext/Panel`, `ext/Playground`, `ext/DesignTool`, `/imagine/**`, `/layouts/**`. List each missed item: what it is, where it lives, and when it was made.
2. **Broken.** For every row in prior-work.md plus every missed item marked live or demo, load its page headless (one browser, closed at the end, `windowsHide: true`; the live site is http://monorepo.localhost) at 1920 and 400. Mark it broken when you see a console error, a 404, an overflow, a collapsed or cropped box, or content that is squeezed or wastes the screen. For each broken one, say why in one line. Name the rule behind it when you can: a fixed height, a fixed width, a padding constant, a `--measure` or clamp that fights its container, a spacing token later replaced (the 2026-09-01 clamp change), and so on. That is the owner's question: was the owner's own over-explicit sizing rule the cause?
3. `inventory-audit.md`, under 120 lines: first the counts (checked, broken, missed). Then a "Broken" table (item, url, symptom, cause, the rule behind it). Then a "Missed" table. Then five lines at most on the pattern: which explicit sizing rules broke the most things.

Budget $3. Reply with the counts and the top three causes, then stop.
