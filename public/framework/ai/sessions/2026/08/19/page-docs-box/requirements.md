# page-docs-box — five live cards that SHOW a page's box: shell · measure · inset · region · full

**Laws first** (CLAUDE.md): less is more — ASAP; clarity is the one exception; prioritize; **show, don't tell**. **Length budget:** five demo pages, each ≤ 80 lines of JS, each ONE idea, each live; prose per page ≤ 4 lines; report ≤ 8 log lines + one headless png per page at 1280. Load `code` before JS, `new-page` once, `css` before any CSS (you should need almost none — use `framework.css` utilities and the demo tooling).

## The owner's words (2026-08-19)

> I kept asking you to document, show me how this works… we need a better overview of --measure, .$pages, --page-pad, all these things that actually matter… the problem is the CSS and layout. maybe pay attention to "full" (screen? viewport? app.$pages (no sidebar), framework pages (with framework sidebar)… these are all the regions that could be replaced… on the ext/Panel and Workspace pages, we have these workspaces that can't seem to go fullscreen. I don't think I want to remove the framework sidebar.

## Read first (≤ 10 files)

[`../page-layout-audit/inventory.md`](../page-layout-audit/inventory.md) §1–4 and [`proposal.md`](../page-layout-audit/proposal.md) §5–6 (band 2 is your spec) · `core/Page/Page.css` (the arrangement contract `:8`, the shell grid `:78-101`, tokens) · `core/Page/old/overview/shapes/page.js` (the demo you are replacing — it carries the device strip + `measure` slider tooling; reuse that tooling, drop its `full pad` / `full fill flex v` teaching) · `ext/demo/readme.md`, `ext/demo/stage.js` (the stage with MOBILE/TABLET/DESKTOP/MEGA and the measure slider) · `ext/demo/app.js` (`demo.app()`, a mini app with its own `.demo-app-pages` region) · `core/Page/old/overview/page/page.js` (the `demo.tree()` card shape — your pages use it so `browse()` draws a live thumb).

## The five pages — `core/Page/overview/<name>/page.js`, these exact names (a sibling agent's wall already lists them)

1. **`shell`** — the three tracks, LIT: one page whose `main`, `wide` and `bleed` children carry a wash each (`.wash`/`.tint` utilities), so a reader sees where each track starts and ends, at mobile and mega via the device strip. Caption: `main` is `--measure`, `wide` is the leftover, `bleed` spends the gutters.
2. **`measure`** — the same page at `--measure: 40em` and at `100%`, side by side or via the slider, with a live readout of the main track's computed width (`getComputedStyle(page).gridTemplateColumns`). One line under it naming WHERE `--measure` is declared today (`.pages` `Page.css:21` AND `.page` `Page.css:79`) — read it live, do not hard-code: the proposal may move it, and the card must stay true.
3. **`inset`** — `--page-pad`, `--gutter-x`, `--pad-y`: one page, one slider each (a `range` input writing the token on the page's element with `.style()`), the values printed. Caption: `--page-pad` flows from the region; the other two are the page's own.
4. **`region`** — the SAME page dropped into three regions: `.pages` (a `demo.app()`), a `.tab-panel` (a `demo.app()` whose parent uses `tabs()`), a `.demo-app-pages` — each with a live readout of what the page inside actually got: computed `--measure`, `--page-pad`, and the main track width. This is the card that shows the audit's finding (a region's `--measure: none` never reaches the page; `--page-pad` does) — **by reading the numbers, never by asserting them**, so it shows the fix the day the fix lands.
5. **`full`** — the regions a page could take over, as a row of five buttons: viewport · `app.$pages` · the Doc tab panel · a catalog `$pages` · a Panel workspace. Each button shows (in a `demo.app()` with visible chrome — sidebar, tab bar) which chrome survives and which disappears, and one line: what nav it costs, whether Back still works, and the mechanism that exists today (`full` = zero gutters, `fill` = height + scroll, `solo`, `layout-full`'s `position: fixed`) — from inventory §4. The owner keeps the site sidebar; say which options keep it. No new CSS classes — this card DESCRIBES and DEMONSTRATES; it does not ship a fullscreen mechanism.

Each page: `demo.tree({ meta: import.meta, group: "The box", tree })` or the nearest shape that gives `browse()` a live thumb; title = one word; ≤ 4 lines of `md` caption; live over picture, numbers over adjectives.

## Fences

You own ONLY `core/Page/overview/{shell,measure,inset,region,full}/`. Never `core/Page/page.js` (the sibling owns it and already lists your five in its BANDS and `files:`), never `Page.css`, `Page.class.js`, `ext/**`, `ext/Panel/**`. If the demo tooling lacks something you need, work around it in your page — log the gap, do not patch `ext/demo`.

## Verify, land

Headless only (Playwright from the scratchpad, `page-docs-box-probe.mjs`, import path `file:///C:/...`; never the owner's live tabs): each of the five urls renders with zero console errors and a `.page.active-page`; `region`'s three readouts are three real numbers (paste them in a log line — **two that must agree:** the `.tab-panel` page's main-track px from your readout vs from a direct `getComputedStyle` in the probe); one png each at 1280 into your task dir. `skill-improvement` if a skill misled you. `finish-task`; `links` = five urls + five pngs.
