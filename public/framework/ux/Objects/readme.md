# ux/Objects

`class Objects extends Tree` inspects live objects:

- Properties with class instances display as `name: Class ×n` and link to their module page.
- Maps, Sets, and Arrays display counts that expand lazily on click.
- Modules can export `objects()` in their `page.js` to define custom inspector rows.
- Demo instances created with `+ New` are ephemeral and never persisted.
