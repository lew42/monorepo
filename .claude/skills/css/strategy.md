# CSS strategy — the five questions

Answer in order before writing the declaration. Long form with live, measured examples:
`/framework/styles/rules/` (cascade · proportion · nesting · robust · reuse).

## 1. Does this need CSS at all?

The ladder, first rung that works: nothing · a utility class · an existing component's
class · the module's own `.css`, layout only (*would this rule still be right if the
component were dropped into a different site?* flex sizing yes, `background: #eef0f4` no) ·
`/styles.css`, skin, loaded last. Inline styles are off the ladder: `.style(…)` only for a value known at
runtime (a token override, a measured size) — never static styling.

## 2. Container or item?

Constrain the container, never the items. A property on a leaf must be unset on every
exception; a property on a container is overridden by the one child that wants out. The
container owns a **track**; a child opts out by claiming a wider one — `div.c("wide")`.

## 3. A token, or a declaration?

A custom property inherits; a declaration does not. Set the token high (`--measure`,
`--page-pad`, `--column`, `--gap`, `--flow`), read it low; a subtree disagrees by
re-declaring it on itself. A different colour, gap or column count is a token override, not
a new component: `div.c("grid auto gap").style({ "--column": "22em" })`. A token needs an
existing hardcode to replace; renaming one is breaking.

## 4. Which layer?

`base theme site util`, declared once in framework.css. The ratchet — specificity → a
layer → unlayered → `!important` → inline — works once per rung and raises the cost for
everyone after you. De-escalate upstream instead; record an eviction from framework.css in
`styles/readme.md`.

## 5. Does this block already exist?

Census first (`rg "^\s*\.[a-z-]+\s*\{" public/framework/framework.css -o`). Close beats
new — a modifier on the existing component, not a sibling. A pattern earns a name on its
second appearance and must have one by the third. If your CSS styles a class you don't
emit, `import` the module that does; the import is the loading edge.

## Two one-liners

- **Padding has two floors** — the text's font size and the box's own width:
  `padding: clamp(0.75em, 3.5%, 3.5em)`. 20px is fine on a 240px card, off on a 1000px one.
- **A block in normal flow containing blocks in normal flow cannot break.** What does:
  a flex/grid item's `min-width: auto`, an unbounded `1fr` on a reading column, leaving the
  flow, a chosen `height`, `overflow: hidden` without a scrollbar, negative margins.

## Ownership

- A module styles the classes it emits; generic elements (`pre`, `table`, `h2`) belong to
  framework.css. A theme is the inverse — generic elements only, never a component class.
  If your CSS styles a class you don't emit, `import` the module that does (the import is
  the loading edge; comment it or it gets deleted as unused).
- Never invent a font-size: `h1`–`h4` + body + `code`, each also a class. Margins are
  rhythm and belong to whatever arranges the content.
- Light and dark are modes of one theme (`color-scheme: light dark`, `light-dark(a, b)`
  per token), not two themes. A theme overrides tokens on `.app` or its own class, never
  `:root`, so two variants can render side by side. Vocabulary changes → a new theme;
  value changes → a token override.
