The one place `parent` is assigned. Four shapes arrive the same way:

```js
add("alpha", "just some text")              // a string IS the content
add("alpha", () => p("hi"))                 // a content function
add("alpha", { title: "A", content(){} })   // options
add("alpha", new Page({ … }))               // a Page you built
```

**The url is MINE plus the name I'm giving it**, so an inline page never writes a
path and moving a parent moves its whole subtree with it.

## Adoption goes through the constructor, not after it

```js
const adopt = { name, parent: this, app: this.app };
new Page(pojo, adopt)          // later args win — no branch needed
```

`initialize()` runs at the end of the constructor, so an inline page used to reach
it with **no parent and therefore no url** — and any child *it* added there
computed `undefinedkid/`, silently. Every `route()`-built page is in exactly that
position. This is why the assign-based constructor matters beyond style: injecting
a dependency costs one object key and no signature change.

## The sharp edge

A POJO's keys land on a real `Page`, so **a key named like a method shadows it**.
`{ render(){ … } }` in capture style returns nothing, and `activate()` then reads
`.el` of `undefined`. `content()` is the seam that shape wants.
