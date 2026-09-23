# Workflows — every sign-up/sign-in flow as a clickable demo app

Six cards, each a tiny in-memory `demo.app()` page tree you click through end to end —
landing page to logged in — with a live click counter. Answers the platform's identity
question by showing the real thing rather than describing it: email signup, Google,
GitHub, returning-user sign-in, sign-out, and a two-way avatar comparison.

## Use

Open [`/imagine/platform/workflows/`](/imagine/platform/workflows/) — nothing to import,
it is a page.

## Watch out

- **The six trees live in `flows.js`**, one function each, and are handed straight to
  `demo.app()` — nothing here is fetched or saved.
- **`FlowAuth` (`flows.js`) is a subclass of `ux/Auth/Auth.js`** — it supplies `hideSocial`
  (a gap in `ux/Auth` logged, not fixed, in the code) and wires its own `commit()` to
  advance the demo to "logged in".
- **The two OAuth request folds are real, documented endpoints, never called** — see the
  `fold()` helper in `page.js`.

## More

- [`ux/Auth/readme.md`](/framework/ux/Auth/) — the sign-in form these demos wrap.
- [`doc/decisions.md`](./doc/decisions.md) — the provider decision (raw OAuth over a
  third-party auth vendor) and the click counts each flow took.
- Files: `page.js` (the card wall and the click counter), `flows.js` (the five page trees
  plus the Gravatar hash).
