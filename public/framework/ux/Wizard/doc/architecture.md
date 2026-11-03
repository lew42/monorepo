# Wizard architecture — steps as composition, not class inheritance

Wizard (`Wizard.js`) is a generic multi-step engine, extended by lessons, courses, and signup flows. It composes steps as plain objects with `title`, `content()`, and optional `validate()`, which `own_step()` wraps in `Wizard.Step` instances. Entry point: [`Wizard.js`](../Wizard.js); also defines `Wizard.Step` and `Wizard.Keys` as static parts. The demo lives at [`page.js`](../page.js).

## Composition — steps are objects, not subclasses

**Decided:** a step is a plain object with `{ title, content, validate }`; `own_step()` wraps it in an instance of `this.constructor.Step` so a subclass can swap what a step IS.
**Why:** a caller writes data, not code; a subclass can change the step shape without the caller rewriting their step objects.
**Instead:** steps as subclasses the caller writes (forces API surface to the caller) or step registries with named types (indirection, duplication).
**Detail:** [code skill §3](/framework/code/patterns/#parts-are-static-subclasses) — the part-lookup contract.

## Subclass over mixin for optional features

**Decided:** `Wizard.Keys` (keyboard nav) is a subclass, not a mixin on the shared prototype.
**Why:** a second mixin that also wants `render()` would silently overwrite the first; the subclass's `super` is resolved once, at the right spot in the chain, and leaves the base untouched.
**Instead:** `Object.assign(Wizard.prototype, mixin)` — proven to crash or delete the first feature when two mixins share a hook.
**Detail:** [doc/decisions.md](./decisions.md) — the experiment with headless browser measurements.

## Focus restoration after every step rebuild

**Decided:** after `update()`, focus is restored to the primary button, but only if focus was already inside the wizard.
**Why:** every `update()` rebuilds buttons, so a keyboard user would lose focus (land on `document.body`) and lose `Enter`/arrow listeners until they clicked back in.
**Instead:** none (always restore would steal focus on first render; never restore breaks keyboard flow mid-sequence).
**Detail:** [`Wizard.js:135–142`](../Wizard.js).

## CSS layer isolation for responsive toggle

**Decided:** display toggling between steps rail and crumbs bar lives entirely in `@layer theme` with no util utilities on the same element.
**Why:** `.flex { display: flex }` is `@layer util` and beats any `@layer theme` rule at any specificity or container query; a util riding the same element wins silently.
**Instead:** utilities on the toggle elements (breaks responsiveness in some cases) or a second build pass (forbidden, no build step).
**Detail:** [`Wizard.js:4–12, 13–25`](../Wizard.js).

## Seams for extension

**Decided:** `next()`, `back()`, `go()`, `done()`, and `advance()` are the extension seams; a subclass overrides one to change behavior.
**Why:** each is a single point of change; a subclass that wants to change "the main action" overrides only `advance()`.
**Instead:** a large polymorphic base (more to override) or callbacks passed at construction (less static, harder to track).
**Detail:** [`Wizard.js:80–108`](../Wizard.js).

## No persistence or router coupling

**Decided:** the Wizard class has no persistence, no router; state is just `index` and `values`.
**Why:** callers that want persistence or routing build it on top of the seams; the base stays small and composable.
**Instead:** optional persistence (adds state) or optional router (adds dependencies).
**Detail:** [`Wizard.js:40–42`](../Wizard.js).
