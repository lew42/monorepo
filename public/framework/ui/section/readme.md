# section — a subtle wrapper that names itself on hover

Wrap a chunk of a page in `section(classes, build)` and it draws a subtle
1px border, and shows its OWN class names in a corner on hover — so as you
browse the site, you're picking up what `.bleed`, `.flex` and `.grid`
actually look like, for free.

```js
section("bleed flex wrap gap", () => {
    h2("A full-width, wrap-flowing row");
});
```

## Use

- Wrap only the parts of a page worth labelling — this doesn't have to go on
  every element, or even every section of a page.
- The label is exactly the classes you passed in, written back as
  `.bleed .flex`. `.ui-section` itself never appears in the label.
- Add `ui-section-br` to move the label to the bottom-right corner instead
  of the default top-left — see it on this page.
- The border and the label both read framework tokens (`--line`, `--subtle`,
  `--surface`), so both themes and both corners look right with no extra work.

## Watch out

- **Opt-in by construction.** Nothing changes on any element that lacks
  `.ui-section` — `section()` is the only thing that adds it.
- The label is a pseudo-element (`::before`, `content: attr(...)`), not real
  DOM — it costs nothing to render and can't be selected as text.
- A section can nest inside another section; each one's border and label are
  independent.

## More

- [doc/decisions.md](./doc/decisions.md) — why the label is CSS, not markup.
- Live demo, both corners: [this page](/framework/ui/section/).
- Back to [UI](/framework/ui/).
