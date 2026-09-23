# decision

A question, its alternatives as cards, and the one chosen — marked three ways so the choice reads even without colour. No `ui.decision()` — copy the markup.

## Use

```js
div.c("ui-decision", () => {
	div.c("ui-decision-ask", "The question");
	ul.c("ui-decision-options", () => {
		li.c("ui-decision-option chosen", () => {
			span.c("ui-decision-mark", "chosen");
			div.c("ui-decision-say", "The option");
			p.c("ui-decision-why", "Why it won");
		});
	});
	p.c("ui-decision-because", "Why this choice, overall");
});
```

## Watch out

- Unchosen cards are `--surface`, not `--wash` — `--wash` is the app's own ground and a wash-on-wash box paints nothing — [decision.js](decision.js)
- The chosen card never leans on `--prim` alone (2.96:1, below the 3:1 a UI shape needs) — it is marked by ground, border and the word "chosen" together — [decision.js](decision.js)

## More

- [page](/framework/ui/decision/) — the markup, the contrast numbers, and who uses it (every task page's Decisions tab)
- Back to [UI](/framework/ui/).
