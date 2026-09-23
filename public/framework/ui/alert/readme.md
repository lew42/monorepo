# alert

A callout: a padded surface with a coloured left edge. No `ui.alert()` — copy the markup, the CSS does the rest.

## Use

```js
div.c("ui-alert surface pad flex gap accent", () => {
	icon("info");
	p("Your message here.");
});
```

## Watch out

- Only two tones exist — default and `accent`/`error` — because the token set has one accent and no `--ok`/`--warn` — [alert.js](alert.js)

## More

- [page](/framework/ui/alert/) — the tones, an action row, and why there is no `ui.alert()`
- Back to [UI](/framework/ui/).
