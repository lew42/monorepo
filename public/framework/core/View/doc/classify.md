# `classify()` runs inside `super()`, before class fields exist

```js
class DocsPager extends ColumnPager {}    // → .docs-pager.column-pager.pager
class Foo extends View { classes = "docs"; }   // ✗ arrives too late
```

`prerender()` is called from the constructor, so a subclass's class *fields* have
not initialised yet. Name the subclass instead — the class-name chain is
kebab-cased into CSS classes, which is why a `View` subclass needs no CSS
declaration to be styleable.
