**Usage** — called once, from `prerender()` (`View.js:23`). It is why a `View`
subclass needs no CSS declaration to be styleable:

```js
class DocsPager extends ColumnPager {}    // → .docs-pager.column-pager.pager
```

The class-name chain is walked to `View`, kebab-cased, and added; then
`this.classes`, then `this.name`.

**Necessity** — yes. Every component stylesheet in `framework/` selects a class
this method wrote.

**Simplicity** — right-sized for what it buys, with one trap that fails silently:

> **It runs inside `super()`, before a subclass's class fields initialize.** A
> `classes = "docs"` field arrives too late and is never seen. Name the subclass,
> or pass `classes` as a constructor argument.

The `.replace("View", "")` is a blunt instrument — it strips the substring
anywhere, so a class named `PreviewCard` would lose its middle. No such name
exists; worth knowing before you write one.

