# layout-system — the site's layout problems, their causes, and a SIMPLE page layout system

Laws: less is more (ASAP) · clarity is the one exception · prioritize. **Length budget: `proposal.md` ≤ 80 lines; final message to the mastermind ≤ 40 lines.** Causes and a design, not a defect list.

Mike (2026-08-17), verbatim:

> we have MASSIVE LAYOUT PROBLEMS ALL OVER THE SITE. AND ALL THE KINGS HORSES AND ALL THE KINGS MEN CANT FIGURE OUT WTF IS GOING ON.... Enlist an Opus minion to investigate these things. Ask them what they suggest we do about it. We need a SIMPLE PAGE LAYOUT SYSTEM. Where we can have our previews, and sometimes go full screen if we need to...
> [a report page] opened here in VS Code, which wasn't terrible, except the nav "rail" that is vertical on my big screen, became a 50/50 vertical split (2 scrollable rows), which was very hard to read...
> Sometimes there's a tradeoff (you have to choose to either center a page, or let it sprawl to 100% width which is often too big). … It starts with ROBUST LAYOUT.
> Part of this strategy is reviewing all the CSS. Is it necessary? Is it ideal? … Whenever we reach for a brand new style, we should probably consider, "why don't we have this already"? Materials, Layouts, Themes... shouldn't that cover most of what we need?
> IMPORTANT: Do not monkey patch everything. If you find the CSS fixes contribute more CSS, make the CSS cascade more complex, need complex selectors that are hard to read/remember what they're doing - these are all smells.

## Do this, in this order

1. **Look** — headless Playwright, three widths: **900** (VS Code Simple Browser), **1440**, **3440** (Mike's monitor); DPR 1. Pages: `/framework/`, `/framework/ai/`, `/framework/ai/2026-08-17/`, `/framework/ai/2026-08-17/report/`, `/framework/ext/DesignTool/`, `/framework/web/` (or whichever guide page exists), one doc page (`/framework/ext/Panel/doc/` or similar), `/framework/ui/`. Save one **contact sheet** PNG per width (tile the pages, small) in this dir — three files, not thirty. Log any 404 as a finding, don't chase it.
2. **Name the defects you can see** — ≤ 12 lines, each with page · width · what's wrong (sprawl, dead space, rail split, overflow, cramped, unreadable measure…).
3. **Find the causes** — read `public/framework/framework.css` (the layers `base theme site util`), `styles/` (materials, layouts, themes), the `.page.*` classes, `ext/page.js`, `ext/layout/`, `ext/demo/`, the rail component. Which rules produce which defects — file:line. **A defect on many pages is one rule, not many pages.** Count stylesheets and rules under `public/framework/` (`find … -name '*.css' | wc -l`; total rule count) — two numbers that must agree with what you say about sprawl of CSS.
4. **Consult the prior art** — `ai/2026-08-15/layout-hunt/audit.md`, today's `layouts-redesign`, `high-fixes`, `ui-wall`, `wall-polish` task dirs, `.claude/skills/layout/SKILL.md`, `.claude/skills/css/SKILL.md`, `styles/readme.md`. What did they conclude, and why is the site still broken? (One paragraph.)
5. **Propose the SIMPLE PAGE LAYOUT SYSTEM** — ≤ 5 primitives (e.g. page shell · measure · rail/stage · preview/full-screen · grid-of-cards). For each: what it is, the CSS it needs (sketch, ≤ 6 lines each), what existing CSS it replaces/deletes. How a page opts into full-screen. How previews (demo stages) live inside it at 900 → 3440. What must be **deleted** for it to hold. Then the migration order: which 3 template pages first, so derivations follow.
6. **What would go wrong** — the three ways this proposal fails, one line each.

## Rules

- Read-only outside this dir. Write `proposal.md` here; log findings as `{"log": {"at","msg"}}` lines in `task.jsonl` (bash `printf`, never `Out-File`). Land with `{"assign": {"step": 6, "landed_at": "<ISO>", "outcome": "**…** — …", "links": [{"url": "/framework/ai/2026-08-17/layout-system/proposal.md", "label": "proposal"}], "tokens": null}}` and a `landed —` line in `../day.jsonl`.
- Dev server: `http://localhost/` is up. Headless only — never drive Mike's tabs. Wait for `networkidle` and one `requestAnimationFrame` before shooting.
- Do not fix anything. A written redesign is the deliverable.
