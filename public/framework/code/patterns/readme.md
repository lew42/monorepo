# Patterns — the shape of a module

The framework's house style: a small set of shapes, used everywhere, so any file can be read top
to bottom and understood. Full detail, with the worked examples: [the Patterns page](/framework/code/patterns/).

## Index

- Capturing is synchronous
- A module is a class; every method is a seam
- Parts are classes, hung on the constructor as statics
- Names
- The blessed page shape — the code is shown on [the Patterns page](/framework/code/patterns/), section 5

## Use

Copy the assign-based constructor exactly:
```js
constructor(...args){ this.assign(...args); }
assign(...args){ return Object.assign(this, ...args); }
```
`...args`, never named parameters or a `config` object; later args win.

## Watch out

- **Capturing is synchronous** — a factory call written after an `await` appends to the wrong
  place, and nothing throws. Capture the container first, fill it in a callback.
- **A page method named `render()` collides with core** — `draw()` and `report()` are free names.
  The full list of names core already owns is on [dos-and-donts](../dos-and-donts/).

## More

- Full detail, with the worked examples: [the Patterns page](/framework/code/patterns/)
- [dos-and-donts](../dos-and-donts/) — the traps these patterns exist to avoid
- [objects](../objects/) — the view every class ships once it has real state
