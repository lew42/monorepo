The one place `parent` is assigned. Four shapes arrive the same way:

```js
add("alpha", "just some text")              // a string IS the content
add("alpha", () => p("hi"))                 // a content function
add("alpha", { title: "A", content(){} })   // options
add("alpha", new Page({ … }))               // a Page you built
```

**Usage** — called by `declare()` for a non-string entry (`Page.class.js:39`), by
`child()` for both the `route()` and filesystem branches (`Page.class.js:75,78`),
and by `ext/doc`, which builds a page per class member with it
(`framework/ext/doc/Doc.js:37,63,99,126`).

**Necessity** — yes. It is the single adoption point, and the single place a child
gets `name`, `parent` and `app`.

**Simplicity** — right-sized, and the four shapes cost one ternary because of the
assign-based constructor. **The url is MINE plus the name I'm giving it**, so an
inline page never writes a path and moving a parent moves its whole subtree.

## Adoption goes through the constructor, not after it

```js
const adopt = { name, parent: this, app: this.app };
new Page(pojo, adopt)          // later args win — no branch needed
```

`initialize()` runs at the end of the constructor, so an inline page used to reach
it with **no parent and therefore no url** — and any child *it* added there computed
`undefinedkid/`, silently. Every `route()`-built page is in exactly that position.

## The sharp edge

A POJO's keys land on a real `Page`, so **a key named like a method shadows it**.
`{ render(){ … } }` in capture style returns nothing, and `activate()` then reads
`.el` of `undefined`. `content()` is the seam that shape wants.

