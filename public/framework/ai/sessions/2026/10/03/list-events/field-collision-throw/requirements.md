# `static fields`: code-only, a collision throws

The owner's refinement (dictated to `vscode-mastermind`, right after the data decision landed):

> Refinement to the fields decision (the owner; vscode-mastermind):
> - `static fields` are declared in CODE only; nothing at runtime (a UI, a line,
>   an agent) may add an accessor. Any other key, with any name, lives only in
>   `data`, reached through get/set, and never becomes an instance property.
> - When the accessors are generated (at register or first use per class),
>   CHECK every field name against the whole prototype chain (methods,
>   getters, built-ins) and THROW a clear error on a collision ("field 'move'
>   collides with method List.move"). Never shadow silently.
> - Add one test for the collision case.

## What changed

- `Item.define_fields()` (`core/Item/Item.js`) now walks the WHOLE prototype
  chain for each declared field name (a new `find_descriptor()` helper), not
  just the class's own prototype. A real collision — a method, accessor or
  plain property anywhere up the chain — throws, naming the class and the
  kind of thing it collided with: `field "move" on Bad collides with method
  Bad.move`.
- Re-registering the same class is still safe: the guard recognizes its own
  prior accessor (tagged `get.is_field_accessor = true`) and skips it, rather
  than treating its own earlier work as a collision.
- `fields` was already code-only (a `static` class field, never read from
  jsonl or set at runtime) — nothing changed there; the refinement's first
  bullet is already satisfied by the existing design, confirmed by reading
  `apply()`/`set_one()`: neither ever adds to `this.constructor.fields`.

## Test

`core/Item/Item.test.mjs` — a clean field, a same-class method collision
(throws), an inherited-method collision (throws, proving the whole chain is
checked), idempotent re-registration (doesn't throw). Run:
`node public/framework/core/Item/Item.test.mjs`.

## Verified

- Node: all four assertions pass.
- Live, headless: `/framework/` still renders (no owner tab open, confirmed
  via `mcp__site__pages` first) — `Item.register(Page, "Page")` runs at
  module load with Page's real `fields = ["title", "icon", "description"]`
  and doesn't throw.

## Scope fence

`core/Item/Item.js` only. Doc: `page-item-design.md` top section gets a fifth
dated pass.
