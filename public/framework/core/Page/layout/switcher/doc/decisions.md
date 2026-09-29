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
- **The demo's eight child pages are deliberately content-free filler** (`wide-index`, `wide-app`,
  `narrow-index`, `narrow-app`, `tree-styles`, `tree-router`, `nav-home`, `nav-settings`) — they
  exist only to give `switcher()` real routes to switch between on this pattern page, not as
  documentation subjects of their own. No `doc/` under any of them.
