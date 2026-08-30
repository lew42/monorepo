# panel-clock-flicker

## The ask (verbatim)

> there's some strange behavior in chrome dev tools:
>
> on the framework/core/Page/generator pages, there's a .page--generator select.page-gen-menu {} selector (defined in generator.css:111), that seems to be flickering in the css sidebar of chrome dev tools. the actual select element doesn't flicker, it seems to be some sort of 1 second loop that's doing something strange. the values for padding, bg-color, border-color, and border-radius all "flicker" (they change to something else, then change back instantly)

Then, on the diagnosis (Panel clock template ticking on a hidden page → DevTools
Styles pane redraws every second): **"do it"** — apply the offered fix.

## Diagnosis (from the investigation, this session)

- Live-probe of the tab: no stylesheet churn, no `?t=` hot-swaps, one copy of the
  rule. The ONLY recurring mutation on the whole page: `div.panel-t-time`
  childList, every 1000ms aligned to the wall-clock second.
- Source: the `clock` template in `ext/Panel/templates.js` — repaints via
  `setTimeout(paint, 1000 - now.getMilliseconds())`, forever. Its kill-switch only
  fires once the element leaves the DOM; a hidden-but-mounted SPA page keeps it
  connected, so it ticks on every page of the site for the life of the tab.
- Chrome DevTools redraws the Styles pane on DOM mutation; the contested
  declarations (framework.css's base `select` sets padding + border) visibly
  resettle on each redraw. The element itself never restyles.

## Scope

- `public/framework/ext/Panel/templates.js` — the clock's `paint()`: keep ticking,
  but skip the DOM write while the clock is not visible (hidden page, or drawn
  and never connected). Resume within one tick of becoming visible.
- Verify headless (Playwright, scratchpad probe): hidden clock produces zero
  mutations; visible clock resumes.
- No other files. One session, no agents.
