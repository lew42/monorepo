# Auth — login, signup, reset and a social row, as one class

The first `ux/` workflow: view switching is the state a template can't hold, so it's a
class, not a component — [`/framework/ux/`](/framework/ux/) is the tier this exemplifies.

## Use

```js
import { Auth } from "/framework/ux/Auth/Auth.js";

new Auth();                    // starts on "login", appends its own card
new Auth({ view: "signup" });
```

Extend by overriding a seam — `MagicAuth.js` is the worked example:

```js
class MagicAuth extends Auth {
	login_title(){ return "Sign in with a link"; }
	password_field(){ return null; }   // no password — a link replaces it
}
```

## Watch out

- **A `<form>` needs `novalidate`** or an invalid field never fires `submit` at all —
  the browser blocks it for its own bubble UI first. `:invalid`/`:user-invalid` still
  work with it on; only the auto-block turns off — [`doc/decisions.md`](/framework/ux/Auth/doc/decisions/).
- **A composed method is a seam per thing it composes**, not one seam for the whole
  method — `login()` calls `password_field()` rather than building the field inline,
  which is the one line that let `MagicAuth` skip it instead of forking `login()`.
- **A ux never ships its own compact/contrast mode** — the words-proof band on
  [`page.js`](/framework/ux/Auth/) is the config-word contract, not an Auth option.

## More

- [Overview](/framework/ux/Auth/) · [`doc/decisions.md`](/framework/ux/Auth/doc/decisions/) — the
  five layout questions answered, the CSS, the named-extension verdict
- Files: `Auth.js` (the class), `MagicAuth.js` (the named extension), `page.js` (the demo)
