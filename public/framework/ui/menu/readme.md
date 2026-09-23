# Menu — a `<details>` dropdown template; CSS only, the behavior graduated to `ux/Menu`

The one line of real logic here — close the panel after a pick — was deliberately left at
the call site. A caller that wants close-on-pick *and* click-outside for free should take
[`ux/Menu`](/framework/ux/Menu/) instead — it wears these same `.ui-menu-*` classes.

## Use

```js
details.c("ui-menu", $menu => {
	summary.c("ui-menu-trigger btn flex v-center", () => { span("Actions"); icon("arrow_drop_down"); });
	div.c("ui-menu-list flex v", () => {
		a.c("ui-menu-item", "Rename").href("#").click(() => $menu.el.removeAttribute("open"));
	});
});
```

## Watch out

- **No light-dismiss.** A `<details>` stays open until something closes it — open two of
  these and both stay open. [`ux/Menu`](/framework/ux/Menu/) fixes that; this template
  doesn't, on purpose (it needs zero JS to *be* a disclosure).
- The panel is `position: absolute`, so an ancestor with `overflow: hidden` clips it — same
  trap as [`ui/tooltip`](/framework/ui/tooltip/).

## More

- [Overview](/framework/ui/menu/) — both variants, why there is no `ui.menu()`, the CSS in full
- [`ux/Menu`](/framework/ux/Menu/) — the class this graduated to
- Files: `menu.js` (the `.ui-menu-*` CSS), `page.js` (the demo)
