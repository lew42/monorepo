# Screens — seven Figma frames, four already ours, three new phone screens

Node `181:1456`, `Frame 14620`. The owner's brief: *"feel free (encouraged) to rewrite any
text to express anything about our framework."* Four of the seven frames (`homepage`,
`landing-page`, `about-page`, `contact-page`) already exist as
[landing](../landing/) / [document](../document/) / [stack](../stack/) — linked from
`page.js`, not rebuilt. The other three (`home`, `profile`, `settings`) are a small
phone-width app with no existing layout of that shape — built here.

## Use

One spec per screen, `entry`'d the same way [Wire](../wire/) does — a twin card plus a
bare `/full/` url to measure.

```js /framework/styles/layouts/screens/specs.js
const check = (glyph, label, note, on) => div.c("surface pad flex split v-center", () => {
	div.c("flex gap v-center", () => { /* icon chip, label, note */ });
	const box = input().attr("type", "checkbox");
	if (on) box.attr("checked", "checked");
});
```

## Watch out

- **No toggle-switch class exists.** A native `<input type="checkbox">` stands in —
  themed for free by `framework.css`'s `accent-color`, same trick as
  [ui/progress](/framework/ui/progress/). A drawn pill switch would be new CSS this
  task does not own.
- **The copy is true, not generic.** Stat numbers are copied verbatim from
  [ui/stats](/framework/ui/stats/) rather than re-typed, so the two pages can't drift.
- Bottom tab bar (`tabs()`) is shared by all three specs — one function, not three copies.

## More

- [Overview](/framework/styles/layouts/) · [doc/decisions.md](./doc/decisions.md) the mapping + the one dilemma
- Files: `specs.js` (the three, plus `tabs()`/`check()`/`group()`) · `page.js` (the index + the four-frame mapping table)
- Nearby: [wire](/framework/styles/layouts/wire/) eight strings, one gap found · [landing](/framework/styles/layouts/landing/) the other four frames · [ui/stats](/framework/ui/stats/) where the numbers came from
