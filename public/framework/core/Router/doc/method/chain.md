`[root … active]`, or `[]` before the first navigation.

## Usage

Two callers, both internal:

- `Router.js:92` — `activate()`, as `from`.
- `Router.js:138` — `mark()`, to walk the pages that get a class.

## Necessity

Keep. It is one line of delegation to `Page.chain()`, but the `[]` is real: on the
very first navigation `this.active` is `undefined`, and both callers would
otherwise carry the same guard.

## Simplicity

Right-sized, but the ternary can go:

```js
chain(){ return this.active?.chain() ?? []; }
```

Same behaviour, one concept instead of two. Recorded in the readme rather than
applied — it touches a core class.
