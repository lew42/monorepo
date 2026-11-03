The nearest page at or above me that claims a **role**. A page says what it is; its
whole subtree can find it, at any depth.

```js
export default new Page({ meta: import.meta, is: "topic", … });   // the claim

this.topic();                  // anywhere below it
this.nearest("workspace");     // any other role — no new method needed
```

**Usage** — `topic()` and `document()` are the two named lookups
(`core/Page/Page.class.js`); the [Refs demo](/framework/core/Page/overview/columns/refs/)
is the working call site, a picker and a reader four levels apart with no import
between them.

**Necessity** — yes, and it is the smallest answer to *how do two deeply nested pages
talk?* Every page already had `.parent`; what was missing was one agreed name for "the
page this subtree belongs to". Without it each tree invents its own — a module-scope
singleton, a `window.` global, or a mutual import that breaks only on deep reload.

**Simplicity** — one line over `chain()`. No registry, no event bus, no subscription
list in core. `findLast`, not `find`: the closest claim wins, the same override
direction as CSS.

⚠ **The role word is `is:`, never the accessor's own name** — `topic: true` shadows
`topic()` on the one page most likely to call it.

The full record, the rejected alternatives and what a topic does once you have it:
[`doc/roles.md`](/framework/core/Page/doc/roles/).
