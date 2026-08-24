# Wizard — the generic multi-step engine, for lessons, courses and signup to extend

## Use

```js
import { Wizard } from "/framework/ux/Wizard/Wizard.js";

new Wizard.Keys({
	steps: [
		{ title: "Name", content(wizard){ /* build into the captor */ }, validate(wizard){ return !!wizard.values.name; } },
		{ title: "Options", content(wizard){ … } },
		{ title: "Confirm", content(wizard){ … } },
	],
});
```

A step is composition — a title, a `content` function, an optional `validate` gate — never a
class the caller has to write. `next() back() go() done()` are each a seam; `Wizard.Keys` adds
`Enter`/arrow keys on top with no other line changed. No persistence, no router coupling.

## Watch out

- **A mixin can't survive a second one on the same hook** — proven, not asserted:
  [`doc/decisions.md`](/framework/ux/Wizard/doc/decisions/), the mixin-vs-subclass experiment.
- **`render()` builds directly onto `this`**, no inner wrapper div — a caller's `.ac()`/`.style()`
  (the words demo, a subclass) has to land on the real root, the way `Sidebar` does it.
- **Focus is restored after every rebuild.** Every step throws its old buttons away
  (`update()`), so a keyboard user mid-flow would otherwise land on `document.body` and lose
  `Enter`/arrows until they clicked back in — only refocuses if focus was already inside.
- Toggling the indicator (rail vs. compact) has to live entirely in `@layer theme` with no
  utility class riding the same element — `.flex { display: flex }` is `@layer util` and beats
  any `@layer theme` rule regardless of a container query. `Wizard.js`'s own CSS comment has
  the reasoning.

## More

- [`doc/decisions.md`](/framework/ux/Wizard/doc/decisions/) — the experiment, with its evidence
- [`ux/`](/framework/ux/) — the tier this extends; [`ux/doc/system.md`](/framework/ux/doc/system/)
  for the graduation rule and the config-word contract
- Files: `Wizard.js` (the class, `Wizard.Step` and `Wizard.Keys` as static parts), `page.js`
  (the live demo + the words proof)
