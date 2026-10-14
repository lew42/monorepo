The root of the page tree the sidebar draws: a `Page` whose `children` become the nav rows. Optional; without it the sidebar draws its own `children`.

## Usage

```js
Tree.nodes_of(this.root).then(nodes => this.$tree.draw(nodes));   // Sidebar.js:105
```

`refresh_nav()` re-draws from the same root when a tab changes.

## Necessity

Keep. It is the one source of rows, so the nav and the routes cannot drift apart.
