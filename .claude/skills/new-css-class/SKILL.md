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
3. **Prefix with the owning module** (`.panel-grip`, not `.grip`) unless the selector
   already starts with the module's own class.
4. **Opening a namespace?** A new module's first class adds its prefix to
   `css-scopes.txt` (one line, `prefix-   owner`).
5. ⚠ **`page-<slug>` is stamped on every page** — `.page-<x>` collides with any route
   slug `<x>`. Don't start a module class with `page-` unless you are `core/Page`.

Then back to `css` for where the rule goes.
