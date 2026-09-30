# Code — the code in this framework: HTML, CSS, JS

This is a browsable knowledge system, the same idea as [Design](/framework/design/) but for the
code itself: how it's written, what to never do, where a CSS rule belongs, and how a class shows
its own state. Anyone — a person or an agent — reads it the same way.

## Index

[patterns](./patterns/) — the shape of a module: assign-based classes, parts as static
subclasses, the page shape, imports  
[dos-and-donts](./dos-and-donts/) — the traps that never throw, and the house opinions on
formatting and file size  
[css](./css/) — layers, where a declaration belongs, class naming — the vocabulary itself lives
at [/framework/styles/](/framework/styles/), this page never repeats it  
[objects](./objects/) — object-oriented design: every class ships a view of its own state (a
chip, a row, a panel)

## Use

Read the child page for the thing you're about to do — a new class, a CSS rule, a class name, a
view of an object's state. Each page's `doc/` has the full detail; the page itself is the gist.

## Watch out

- This system holds the KNOWLEDGE. The `code`, `css` and `new-css-class` skills still exist and
  still load automatically — they're now short pointers here, so an agent gets a quick overview
  even before it reads a page.
- A rule lives on exactly one page. If you think a rule is missing, check the sibling pages
  first — CSS and class-naming both moved out of the old `css` skill into [css](./css/).

## More

- [/framework/design/](/framework/design/) — the sibling system: what goes into making anything
  *look* right, as opposed to what makes the code itself sound
- [/framework/styles/](/framework/styles/) — the CSS vocabulary (utilities, tokens, layers) that
  [css](./css/) points at
- [CLAUDE.md](/) — the three laws every page here follows
