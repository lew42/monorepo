`import.meta`, handed to the page so it can work out its own url.

```js
export default new Page({ meta: import.meta, title: "Intro" });
```

**Usage** — read in exactly one place, `naming()` (`Page.class.js:22`):
`new URL(".", this.meta.url).pathname`. Written by every `page.js` on the site that
lives in a folder — around 160 of them.

**Necessity** — yes, and there is no substitute. A module cannot be asked where it
came from by anything except its own `import.meta`, so this is the one fact a page
can only tell the framework, never the other way round.

**Simplicity** — right-sized: one word, and the file's path becomes the url. Two
things worth knowing:

- **It also makes `link()` work while the page is dormant.** A url derived at
  construction means an imported-but-never-rendered page is already linkable.
- It is kept on the instance after `naming()` runs, and `ext/classdoc` and `md.file`
  both use it to resolve sibling files (`doc/method/x.md`, `readme.md`) — which is
  the same trap in a second costume: **resolve module-relative urls against
  `import.meta`, never the document.**

