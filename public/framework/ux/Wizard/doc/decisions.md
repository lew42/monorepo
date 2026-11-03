# Decisions — the mixin-vs-subclass experiment

The owner's explicit ask: build ONE optional feature both ways and record the verdict with
evidence, not taste. Keyboard nav (`Enter`/arrows) was the feature. Both were built against the
real, shipped `Wizard` class and run headless in a browser (a scratch script, not a toy
stand-in) — the numbers below are its printed output, not an estimate.

## The verdict

**Subclass won.** `Wizard.Keys` (`Wizard.js`) is the shipped feature. A mixin applied via
`Object.assign(Wizard.prototype, keys_mixin)` cannot survive a second mixin wanting the same
hook — proven two ways below, not asserted — and it mutates the shared class, so it can't be
un-applied either. The subclass form composed cleanly and left the base untouched.

## a) `class WizardKeys extends Wizard`

```js
class WithKeys extends Wizard {
	render(){ super.render(); this.on("keydown", e => e.key === "Enter" && this.next()); }
}
class WithAnnounce extends WithKeys {
	render(){ super.render(); this.announced = true; }
}
```

Two features stacked on the same hook (`render()`). Result, from the running instance:

| check | result |
|---|---|
| `sub_index_after_enter` (fire a real `keydown Enter`) | **1** — the listener fired AND `next()` ran |
| `sub_announced` | **true** — both layers ran |
| `sub_lines` (both `render()` bodies) | 2 |
| `subbed.constructor.Step === Wizard.Step` | **true** — statics still resolve down the chain (code skill §3) |
| a fresh, unrelated `new Wizard()` afterward | **untouched** — `.constructor === Wizard`, no `announced` |

`super.render()` is a static, compile-time link — it always calls the RIGHT prior method, and
stacking a third layer is just another `extends`.

## b) `Object.assign(Wizard.prototype, keys_mixin)`

Two mixins, both wanting `render()` — the exact case the owner asked to prove.

**First attempt, the naive way** — a plain object has no `super`, so each mixin calls "the
base" by reading `Wizard.prototype.render` live:

```js
const keys_mixin_naive = { render(){ Wizard.prototype.render.call(this); this.on("keydown", …); } };
const announce_mixin_naive = { render(){ Wizard.prototype.render.call(this); this.announced = true; } };
Object.assign(Wizard.prototype, keys_mixin_naive);
Object.assign(Wizard.prototype, announce_mixin_naive);
new Wizard({ steps });
```

Result: **`RangeError: Maximum call stack size exceeded`.** `Wizard.prototype.render` is read
at CALL time, not define time — by the time `announce_mixin_naive.render` runs, that property
IS itself. It calls itself. Forever. Not a taste call: a crash.

**Second attempt, the "careful" way** a real mixin author has to remember by hand — save the
base in a local BEFORE assigning anything, so nothing self-references:

```js
const original_render = Wizard.prototype.render;
const keys_mixin = { render(){ original_render.call(this); this.on("keydown", …); } };
const announce_mixin = { render(){ original_render.call(this); this.announced = true; } };
Object.assign(Wizard.prototype, keys_mixin);
Object.assign(Wizard.prototype, announce_mixin);   // same key, "render" — second wins
```

| check | result |
|---|---|
| `Wizard.prototype.render === keys_mixin.render` | **false** — silently overwritten |
| `mixin_index_after_enter` (fire a real `keydown Enter`) | **0** — no listener, `next()` never called |
| `mixin_announced` | **true** — only `announce_mixin`'s version ever ran |
| `mixin_lines` (both `render()` bodies) | 2 — same size as the subclass, so line count was never the deciding factor |
| `plain_wizard_also_announces` (a FRESH, unrelated `new Wizard()` afterward) | **true** — the shared prototype is permanently mutated; nothing opted out |

`announce_mixin` didn't ask to replace `keys_mixin` — it just happened to claim the same
property name, on the same shared object every `Wizard` anywhere reads from. And because
`Object.assign` writes onto `Wizard.prototype` itself, there is no "remove the mixin": the only
way back is knowing exactly which keys it touched and restoring them by hand, which is what the
`original_render` restore line in the experiment script had to do.

## Why this was the fair fight

Both versions solve the identical problem (keyboard nav, stacked with a second unrelated
feature) with the identical line count (2 lines each). The difference is structural, not
stylistic: a subclass's `super` is resolved once, by the language, at the correct spot in the
chain; a mixin's "call the previous behavior" is a manual, live lookup into a single shared
slot that the next `Object.assign` can and did overwrite. `this.constructor.Step` — the part
lookup every subclass in this framework relies on (code skill §3) — has no equivalent hazard
under mixins, because mixins don't touch the static side at all; they only ever had one thing
to give you, and two of them wanting it was already enough to break it.

## What shipped, what didn't

`Wizard.Keys` (subclass) is live in `Wizard.js`, used by the page's own demo. The losing mixin
code above is the actual code that was run to fail — kept here as the record, never landed as a
file.
