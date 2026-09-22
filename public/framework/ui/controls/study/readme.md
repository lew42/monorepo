# Controls — the design record

One night's crawl (2026-09-01, `ai/2026-09-01/controls-study/`) answering one question: does
the site have ONE button, or five accidental ones? Full log and raw JSON:
[task dir](/framework/ai/2026-09-01/controls-study/).

## Method

1. **Source first.** Read `framework/ext/`'s ten interactive modules and `framework/ui/`'s
   twenty markup-you-copy templates, then grepped real importers (`grep -rl "ext/<Name>"`,
   excluding the module's own dir) rather than trusting a readme's claim of use. Every
   `ext/` interactive module has real outside importers; nine of twenty `ui/` templates
   (dialog, tooltip, accordion, card, toolbar, progress, field, kbd, stats) have zero
   `.ui-<name>` hits anywhere outside `framework/ui/` itself — shelf-ware by the module's
   own design (a template tier is meant to be copied, not imported), but shelf-ware all
   the same for a reader asking "is this pattern actually on the site."
2. **Button clustering.** Headless Playwright crawled 14 representative pages at 1280×900
   (home, framework, ui, Dropdown, Panel, drawer, tabs, editor, gallery, audit,
   web/nav/tabs, toc, files, blog), read `getComputedStyle` on every `button, a, [role=button],
   .btn, .nav-link, [onclick]` with `cursor: pointer`, and clustered by
   (padding, border-radius, background, border, font-size, font-weight, text-transform).
   **305 clickable elements sampled == 305 rows in `button-rows.json`** (scratchpad,
   not committed). 27 distinct raw signatures; several are state variants of one family
   (a `.tab` sampled active/inactive/hover on one page yields 3–4 rows), so the honest
   count is **~9 real visual families**.
3. **Panel/menu clustering failed passively, on purpose.** The same crawl over
   `.panel, .drawer, [role=menu], .dropdown, [class*=panel], [class*=menu]` found only
   21 elements (3 clusters) — dropdowns and drawers render at zero size until opened, so
   a passive DOM read never sees them. Fixed by **driving** each one open instead
   (see below) and comparing the opened states directly.
4. **Driven states.** Each control's own demo page already has a live, working instance —
   used that instead of hand-rolling a fixture. Dropdown: click the trigger, screenshot
   the open popover, Escape to close. Drawer: click "Open the rail" (its own demo copy),
   drag the inline grip 10 pointer-steps (304px → 380px, confirmed 1:1), Enter on the
   focused ✕. Tabs: click OVERVIEW → DOCS, confirm the panel swap. Mode: click the
   button, confirm `.app`'s inline `color-scheme` flips.
5. **Keyboard spot-check, 5 controls**, driven headless (Tab/focus, Enter, Escape) —
   see the page for the pass/partial/fail table. The one FAIL (Panel's toolbar) was
   found by `.focus()` silently failing to move `document.activeElement`, which turned
   out to mean "focusable in markup, unreachable in practice" — the toolbar is
   hover-revealed and hidden by default.

## Caveats

- The button crawl is 1280px only — a mobile-width pass would likely change which
  rows collapse into a family (a `.tab` bar goes vertical, `nav-link`s may hide).
- `ext/toc`'s rail only renders past an `82em` measure; at 1280/1920 in this container
  it never appeared, so `toc-default.png` shows the page without the rail — a real gap
  in this crawl's coverage, not evidence the control is broken.
- "27 signatures → ~9 families" is a judgment call made by eye, not an automated
  second clustering pass — a stricter distance metric might land on a different number
  either side of 9.

## Where things are

- `page.js` — the study page.
- `shots/` — every screenshot referenced (572KB total, budget 2.5MB).
- Raw crawl JSON (`button-rows.json`, `panel-rows.json`, `drive-log.json`) lived in the
  session scratchpad, not committed — this readme is the durable record of what they showed.
