The module's one export: `ui`, a plain namespace object holding the three real
functions (`table`, `timeline`, `keys`). Everything else in this file is a list
of imports kept for their **side effect**.

## Two different reasons to import here

The three functions are imported for their *values* — `table`, `timeline`,
`keys` — and re-exported as both `ui.<name>` and a bare named export.

The other nine imports (`crumbs.js`, `badge.js`, `alert.js`, `panel.js`,
`tooltip.js`, `avatar.js`, `dialog.js`, `menu.js`, `accordion.js`) import
**nothing** — each one is a `<style>` tag as its whole module body. They are
listed here, and only here, "so the classes exist site-wide" per the comment
above them.

## ⚠ This list is the only reason those nine components are styled at all

None of the nine css-only components' own `page.js` imports its sibling
`<name>.js`. `alert/page.js` never writes `import "./alert.js"` — the `.ui-alert`
rule reaches the page purely because `ui.js` imported it, and `ui.js` is
imported by `app.js`, which every page on the site loads. Add a twentieth
css-only component and forget the line here, and its page renders **completely
unstyled, with no error anywhere** — the exact "stylesheet that 404s resolves
and warns" trap's quieter sibling: this one doesn't even 404, it just never
runs.

## Improvements

1. **The dependency from a component's look to `ui.js`'s import list is
   invisible from the component's own directory.** A comment in each
   css-only `<name>.js` file pointing at `ui.js` (or the reverse: a comment in
   `ui.js` next to each line naming which page depends on it) would make the
   edge visible from either end, the way `code-architecture`'s "if your CSS
   styles a class you don't emit, import the module that emits it" already
   asks of cross-module cases. *(simple, important)*
2. **A component that both exports a function and ships CSS (`table`,
   `timeline`, `keys`) loads its stylesheet via the function import, not a
   separate side-effect line** — already correct, worth stating so nobody
   "fixes" it by adding a redundant `import "./table/table.js"` a second way.
   *(simple, speculative — nothing is currently wrong)*
