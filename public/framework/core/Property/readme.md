# Property — one live value you can bind to

`class Property extends Events(Object)`: `get()`, `set(v)` (emits `change(value, old)` only if it changed), `bind(fn)` (calls `fn` now and on every change, returns the unbind), `listeners()`. It never bubbles. Item stays as it is; Property is opt-in.

`Property.Map` is the DOM-free helper that gives a template its two fallthrough maps (`data` and `props`): clone, override, delete falls back, shared until written, a Property created lazily when something binds. Test: `node public/framework/core/Property/Property.test.mjs`.

- Used by [Template](/framework/core/Page/Template/) · design: [core/Page/doc/templates.md](../Page/doc/templates.md)
- Watch out: a clone that writes an inherited bound value gets its own new Property (`"rebind"`); it never sets the parent's.
