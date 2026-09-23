# Accordion — one panel open at a time, with no JS: native `<details>` sharing a `name` attribute

## Use

```js
details.c("ui-accordion-item pad", () => {
	summary(question);
	p.c("muted", answer);
}).attr("name", "faq")   // the shared name is what makes the browser close the others
```

## Watch out

- There is no `ui.accordion()` — the whole thing is the `name` attribute and two CSS rules (the hairline between items, the margin under an open answer). Drop the `name` and panels open independently.
- Wants nesting, animation or remembering the open panel across a reload? None of those are built — see the page's "What it deliberately doesn't do" section.

## More

- [Overview](/framework/ui/accordion/) — the FAQ demo and the marker-vs-flex-summary demo
- Files: `accordion.js` (the two CSS rules), `page.js` (show, don't tell)
