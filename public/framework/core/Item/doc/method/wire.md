The wire **type name** this instance will serialize under:
`this.type ?? Item.names.get(this.constructor) ?? this.constructor.name`.

Three fallbacks, in order:

1. an explicit `this.type` — set on an instance hydrated from an **unknown**
   type, so it round-trips under its original name (see [`hydrate`](hydrate.md)).
2. the name this **class** was registered under —
   [`Item.register(Class, name)`](register.md)'s inverse map.
3. `this.constructor.name` — the bare class name, for a class nobody registered.

**⚠ Case 3 is a trap for a minified or renamed build.** This codebase has no
build step (see `CLAUDE.md`), so `constructor.name` is stable in practice — but
it is still the reason `Item.register` exists at all rather than relying on
`constructor.name` everywhere: a class that changes its export name would
silently change every future document's wire format if this fallback were the
only mechanism.
