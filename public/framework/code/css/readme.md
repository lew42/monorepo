# CSS — layers, where a declaration belongs, and how to name a class

This page is the "how" of CSS in this framework: which rung of the ladder to reach for, which of
the four layers a rule sits in, and how to name and prefix a class. The vocabulary itself — the
actual utility classes, tokens and layout words — lives at
[/framework/styles/](/framework/styles/) and is never repeated here; this page only links to it.
Colour, contrast and light/dark live on [/framework/design/color/](/framework/design/color/)
instead — a different question (what should it look like) from the one this page answers (where
does the rule go).

## Index

- The ladder: nothing → a utility class → a layout word → a component class → the module's own CSS
- The four layers: `base theme site util`
- Tokens vs declarations
- Naming and prefixing a new class
- Icons (the glyph, the frame, scaling — not the pressable-button rules, which live on
  [/framework/design/ui/](/framework/design/ui/))

## Use

Answer these in order before writing a declaration:
1. Does this need CSS at all? (climb the ladder, stop at the first rung that works)
2. Container or item? (constrain the container, never the items)
3. A token, or a declaration? (a custom property inherits, a declaration doesn't)
4. Which layer?
5. Does this class already exist? (census first)

## Watch out

- **An unlayered rule beats every layer**, at any specificity. Everything goes in a layer.
- **`@layer util` beats `@layer theme` regardless of selector specificity** — the layer order
  decides, not the selector.
- **A class that does not exist paints nothing and throws nothing.** Verify a word by reading its
  rule in `framework.css` and reading a computed style back — never by inference.
- Full list of what has actually bitten, one line each: [doc/caveats.md](doc/caveats.md).

## More

- [doc/rules.md](doc/rules.md) — the full ladder, layers, tokens, ownership rules and the
  class-naming steps (folded in from the old `new-css-class` skill)
- [doc/caveats.md](doc/caveats.md) — every CSS trap that has actually bitten, one line each
- [/framework/styles/](/framework/styles/) — the vocabulary this page points at
- [/framework/design/color/](/framework/design/color/) — colour, contrast, light/dark
- [/framework/design/ui/](/framework/design/ui/) — icon buttons and other pressable things
