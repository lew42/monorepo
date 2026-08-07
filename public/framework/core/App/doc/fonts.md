# Fonts live in `Font.js`, next to the only class that constructs one

`app.font(name)` pushes onto `loaders`, so a font asked for in `config()` is
applied *before* first paint. Ask later and it still loads, it just isn't waited
for.

**Not moved to `util/`**, though an earlier note said it should be: `util/`'s own
pitch is *"plain functions, no classes, no state"* and `Font` is a class with a
registry.

**The unresolved part is the CDN.** Both registered faces are `fonts.gstatic.com`
urls — the one place in the framework that breaks the "vendor the dependency" rule
`ext/` is held to. Vendoring costs ~166KB in the repo for a look most sites will
never load. Stated, not settled.
