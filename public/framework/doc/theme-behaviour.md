# Can a theme carry behaviour?

Asked directly: `theme-lew42` is a CSS class today, but it *used to be a class
extending `App`*, and themes might want to ship plugins or behaviour. Settled by a
three-persona council; all three landed in the same place by different routes.

**Verdict: the theme is CSS. Behaviour is a plain exported function the SITE calls.
Never a class, and never triggered by the class appearing.**

```js
// styles/layers/theme/lew42/lew42.js
export function lew42(app){ app.font("Montserrat"); app.font("Material Icons"); }

// app.js
new App({ config(){ lew42(this); } });
```

The weighing, shortest first:

- **Inheritance imposes an order and a single lineage** on things that have neither.
  `Theme extends App` makes every theme also a complete App variant — N themes × M App
  configurations — and *"lew42's fonts with a different Router option"* has no answer
  inside a class hierarchy except a deeper chain.
- **The decisive one, which is smaller and harder to argue with: a theme is designed
  to appear more than once on a page.** `theme/guide/page.js` renders `.theme-paper`
  and `.theme-terminal` side by side *to prove that*, and `lew42/page.js` renders light
  and dark together. **Behaviour does not survive duplication.** Two boxes would run it
  twice; `app.font()` is safe only because `Font.load` memoizes by name, for an
  unrelated reason. A theme that attached a listener or started a timer would fire
  twice and **break its own demo page.**
- A CSS class is a *value the cascade resolves*, any number of times, at any depth.
  That is the property that makes themes composable, and behaviour is exactly the thing
  that doesn't have it.

**If a function isn't enough**, the escalation is `ext/` — the tier that already exists
for "opt-in, may patch core" — or `app.navigated?.()`, which `Router` already calls on
every navigation, duck-typed, for free. **Not** a `Theme` registry with lifecycle
hooks: there is one theme with one behaviour, and an unused hook is permanent API
surface.

## The related move: `mode.js` is not a theme's

The light/dark toggle briefly lived under `styles/layers/theme/`, which made it the one
thing core imported from outside `core/` — across a directory that had just proved it
can move. The import took the whole site down mid-session. It lives at
`core/App/mode.js` now (the `Font.js` precedent): **theme-agnostic behaviour, imported
by the two things that render it.** `lew42.js` stays where it is, because *that*
behaviour belongs to one theme.
