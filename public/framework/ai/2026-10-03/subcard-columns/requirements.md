# A card's sub-cards open in a column beside it

## The ask (owner, 2026-10-03, dictated)
> Let's see if we can get a nested card on any one of these pages. When we click a sub-card it could launch in a column: it's the rail process repeated, Miller columns in our page column system. With the drawer closed, the detail side is huge, 2000+ px, so the Now card can act as a preview rail that launches another column. I don't want a hand-managed navigation; a programmatic left nav that just lists the cards is more of a table of contents. It's the sub-cards I'm after. Routing and sharing the width may be tricky; figure it out.

## Now (screenshot it first)
The Now card (`/framework/ai/2026/10/03/now/`) has one sub-card, `your-prompts-refined-live`. Opening it REPLACES the Now card (a "← Now" back link) and puts a "talk into this request" column on the right. The parent disappears.

## Want
- At wide widths, opening a sub-card keeps the parent visible as a narrow preview column (its sections collapsed to titles), and the sub-card opens beside it. Deeper sub-cards repeat the pattern; older columns narrow. Below a width, it falls back to today's takeover with a back link.
- The parent lists its sub-cards (it already has a "+ request" table of contents: use it).
- Every state has its own URL (route everything); back/forward and reload land in the same columns.
- Reuse what exists: the inbox shell's `.inbox-sub` column (ux/Card/Card.css ~1117, ux/Inbox/Inbox.css), the page-columns work (core/Page columns, `column_host()` / `render_column`), ext/Panel's seams. No second column system (law 6).
- Screenshots at 1200, 1920, 2560, 3440 with the drawer closed and open.

## Owner follow-up, same day (this decides the shape)
> The inbox rail stays: it's our monitor; anything important that pops up shows there. The DETAIL side splits into two equal columns. A card opens in the first; its sub-card opens in the second; the next sub-card opens a third column and hides the first, so you always see the last two levels, as deep as it goes. I did this before for three columns (the /imagine/paging column paging work); I want it deeper. Sub-cards drill down in place so we don't lose context. A link to a DIFFERENT thing with its own page links away, for now; don't import and render other pages here.

Prior decision to honour: the owner, 2026-09-17, "N even columns and fixed navigation are the direction; continuous Miller columns are not" (`public/imagine/paging/paging.js` ~line 140, and `/web/nav/doc/study/`). Read `public/imagine/paging/mechanisms/` and the column-pages work before building; reuse what fits.

So: inbox rail (fixed) + exactly two equal detail columns showing the deepest two levels of the open card path; earlier levels collapse to a breadcrumb at the top of the first column. Each level is routed.

## Owner follow-up 2: clean up the card template while you're in it
On `/framework/ai/2026/10/03/now/your-prompts-refined-live/` the owner found:
- **"nothing running · cost not tracked"** and an **Actions** dropdown they've never used, in the header line: show status only when something IS running; move Actions to the properties sidebar (below).
- **"Show who worked on it, the files in this card's folder"** disclosure: takes a whole line, badly spaced; expanded, a "the mastermind 1:35 PM" line over a fixed-height file explorer that doesn't lay out. Move it into the properties sidebar as a plain section.
- **The "← Now" back link has zero padding** against the rail border. Becomes the breadcrumb in your column design anyway; it must be padded.
- **Drop the per-card talk column** ("talking into this request", its own composer and session). Owner: "a brand new context isn't necessarily better, it might be worse." Talking happens in the ONE global drawer agent, the same on every page. The card's right column becomes **card properties**: type, status, tags, who worked on it, its files, Actions. Small and quiet.

## Fence
Write: ux/Card/, ux/Inbox/, ai2/card.js (coordinate with @task-mastermind-inbox-cards-work and @mastermind-ai-3 through page inbox notes), core/Page column code only if needed, this task dir. NEVER the mcp__playwright tools.
Model: Sonnet. Budget $12.
