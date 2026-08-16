The element every DOM query in this class is scoped to.

```js
root(){ return this.app.$app.el; }
```

## Usage

- `Router.js:132` — `mark_links()`, the anchor sweep. The only caller: `mark()`
  unmarks the views it remembers rather than querying for them.

## Necessity

Keep, and it earns its line by existing at all: **scoped to `$app`, never
`document`.** On a cold load `$app` is still detached from the document, so a
document-wide query finds zero links and nothing lights up. One caller, one rule,
one place for the rule to live.

## Simplicity

**The name is contested.** `app.root` is the root **Page**; `router.root()` is the
app's root **element** — same word, two different things, one class apart, and
`load_segments()` reads `this.app.root` (`Router.js:70`) not far above the method
called `root` (`Router.js:113`).

Proposal (readme): rename to `scope()`. Same length, says what it is for, and
stops answering a question it doesn't answer.
