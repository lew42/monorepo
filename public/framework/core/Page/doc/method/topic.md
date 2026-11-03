The page my subtree belongs to — `nearest("topic")`, named.

```js
new Page({ meta: import.meta, is: "topic", selection: null, … });   // the host claims it
this.topic().select(mail);                                          // any descendant, any depth
```

**Usage** — the [Refs demo](/framework/core/Page/overview/columns/refs/): the picker
calls it 2 hops up, the reader 3, the notes column 4, and all three get the same page
back.

**Necessity** — yes, as a *name*. `nearest("topic")` already works; this exists so the
common case is a word rather than a string literal, and so there is one spelling of it
across the site instead of four.

**Simplicity** — one line. The temptation is to make it settable, or to have core hold
the topic's state; both put a store in `Page`. It returns a page — what that page
carries is the page's business.

⚠ **A topic is its own topic.** The walk includes `this`, so a host can call
`this.topic()` in its own `content()` and get itself. That is what makes a helper
written for a child safe to call anywhere.

The walk, the `is:` word and why the closest claim wins:
[`doc/roles.md`](/framework/core/Page/doc/roles/).
