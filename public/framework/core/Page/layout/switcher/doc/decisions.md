# Decisions

## Open

- **CSS namespace reservation, not yet written to `css-scopes.txt`.** That file is outside this
  task's fence (`core/Page/layout/switcher/**` only), so the line is recorded here instead
  (`new-css-class` skill, step 5's own instruction for exactly this case). The next agent who can
  write `public/framework/styles/css-scopes.txt` should add, under the `core` block:

  ```
  switcher-    core/Page/layout/switcher
  ```

  Census run before choosing the name: `grep -rhoE "\.switcher[a-z0-9-]*" public --include=*.css
  --include=*.js` returned one hit, `ux/Auth/Auth.js`'s `this.switcher(...)` — a method call on an
  unrelated `Auth` view, not a CSS class or a stylesheet rule, so it isn't a real collision.

## Decided

- **Built on `ext/tabs`, not a rewrite of it.** `switcher()` calls `this.tabs(names).ac("vertical")`
  rather than reimplementing routing/marking — see [decide.md](decide.md). Reuse over a second
  mechanism, per `code#3` (parts/behaviour reuse) and the owner's own "could you just reuse the
  layout?" in the brief's source transcript.
- **The demo's ten child pages are deliberately content-free filler** (`cmp-w-index`, `cmp-w-app`,
  `wide-index`, `wide-app`, `narrow-index`, `narrow-app`, `tree-styles`, `tree-router`, `nav-home`,
  `nav-settings`) — they exist only to give `switcher()` real routes to switch between on this
  pattern page, not as documentation subjects of their own. No `doc/` under any of them.
- **`leaf: true` on the pattern page** keeps all ten filler pages out of the site nav rail (they
  used to flood it — "index.js" and "app.js" each showed three times under "Switcher") while
  keeping the pattern page itself listed in `core/Page/layout/`'s hub exactly as before. `leaf`
  only hides a page's OWN children from the rail tree (`Page.class.js:1044`, `ux/Tree/Tree.js`) —
  it does not touch routing, so `this.switcher()` still resolves every name normally. Same pattern
  as `audit/page.js`. No hide-just-from-nav flag exists for a single child; `leaf` on the whole
  page was the fit here because every child on this page is filler, not real content.
- **The "wide vs narrow" and "three skins" demo rows both take `.ac("wide")`.** Without it they sit
  in the page's default `main` track (the prose measure), and two ~880px+400px cards side by side
  don't fit there — `flex wrap` drops the narrow one onto its own line below the wide one instead
  of beside it, at every width including 3440 (layout skill: "two or more columns of content never
  live in main").
- **Each demo child's own `h1.page-title` is shrunk to `h3` size, inside the switcher's demo frames
  only** (`switcher.css`'s two `.switcher-demo-frame-* .page h1.page-title` rules) — a whole-page
  display heading is the wrong size for a one-line stand-in file in an 880px or 400px box; nowhere
  else on the site is `h1.page-title` touched.
- **The collapsed header shows the current item's label, full width, with a real toggle icon** —
  not a bare chevron above a second, separate row. `switcher.js`/`switcher.css` still never set or
  read `.active`/`.in-path`; see decide.md §2 for exactly what changed and two more `<details>`
  quirks it took to get there (a zero-width absolutely-positioned `<summary>`, and a header that
  measured full width only on an actually-narrow BROWSER, not a narrow container on a wide one).
