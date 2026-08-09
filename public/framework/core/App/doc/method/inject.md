```js
inject(){ this.$body.append(this.$app); }
```

First paint. Everything before this ran against an element tree that was never in
the document.

## Usage

`App.js:29` — `instantiate()`, step five. Nothing else.

## Necessity

Essential, and its position in the sequence is the whole no-flash story: fonts and
stylesheets are awaited in `load()`, the first page is already rendered, so the
first thing the reader sees is finished.

**The cost is the flip side of the same fact.** Nothing paints until the walk
finishes — 1765ms on a measured 5-deep cold link, where the chrome could have
painted immediately. Kept, because a nav that spells itself twice is worse.

It also means **you cannot measure anything before it.** `offsetWidth` and
`getBoundingClientRect()` return zero for the whole of `config()`, `render()` and
`load()`. Wait on `app.ready` if you need real numbers.

## Simplicity

Right-sized: one line, one name, and the name is the moment.
