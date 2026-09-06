---
name: new-css-class
description: Run every time you are about to introduce (or rename) a CSS class name in this repo — it checks the name against the reserved prefixes in framework/styles/css-scopes.txt and the live census, and makes it carry its owning module's prefix. Thirty seconds; skip only when reusing a class that already exists.
---

# New CSS class

1. **`cat public/framework/styles/css-scopes.txt`.** A bare line (`flex`) reserves
   `.flex` and `.flex-*`; a trailing dash (`ui-`) reserves a namespace, and new things
   there are `.ui-<thing>`. The framework block is off limits for anything new.
2. **Census the live CSS:** `grep -rhoE "\.<name>[a-z0-9-]*" public --include=*.css --include=*.js | sort -u`.
   A hit in another module is a collision — pick another name. ⚠ Look at WHERE a hit is before it vetoes a name: the census includes vendored bundles — `.grip` reported 2 hits, both inside `public/fly/three.core.js` (minified three.js, no stylesheet). Add `-n` and read the line.
3. **List every view class you declare** (`grep -n 'class [A-Z]' <your files>`): `classify()`
   mints a CSS class from each constructor name in the chain, so `Stage` wears `.stage`. Check
   each minted name against the census like any other class; prefix it with the module when
   it collides.
4. **Prefix with the owning module** (`.panel-grip`, not `.grip`) unless the selector
   already starts with the module's own class.
   ⚠ **A `View` subclass's NAME is a CSS class too**, in this same namespace — `View.classify()`
   kebab-cases every constructor in the chain, so `class Stage` wore the framework's own
   `.stage` and shrink-wrapped itself to 307px inside a 1546px frame; `class Swapper` wore a
   bare global `.swapper` while the `.paging-swapper` rules written for it matched nothing;
   `class LayoutsPair` wore `.layouts-pair`, its own two-track flex row, and laid its toggle
   and its caption out sideways. Three agents, one night, nothing thrown in any of them
   (2026-09-05). Prefix the class as you would the string: `PagingStage` → `.paging-stage`.
5. **Opening a namespace?** A new module's first class adds its prefix to
   `css-scopes.txt` (one line, `prefix-   owner`).
6. ⚠ **`page-<slug>` is stamped on every page** — `.page-<x>` collides with any route
   slug `<x>`. Don't start a module class with `page-` unless you are `core/Page`.

Then back to `css` for where the rule goes.
