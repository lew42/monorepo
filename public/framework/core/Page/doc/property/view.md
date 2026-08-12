The built view. Memoised — a page builds **once**.

**Usage** — assigned and returned by `render()` (`Page.class.js:132,136`), appended
by `activate()` (`Page.class.js:120`), and read by anything that restyles a page
after the fact (`framework/ext/layout/layout.js:45,50,53,58`).

**Necessity** — yes. It is what makes navigation cheap: leaving a page does not
destroy it, so coming back is a class change, not a rebuild.

**Simplicity** — right-sized as a memo, and it is the source of the loudest silent
failure on the class:

> **An overridden `render()` must assign `this.view`.** `activate()` appends
> `this.view`, not the return value — miss it and you read `.el` of `undefined`. The
> idiom every layout page uses is `return this.view ??= div.c("page …", …)`.

Because it never invalidates, **a page cannot re-render from changed data.** That is
a deliberate limit, not an oversight: anything that needs to change holds its own
container and calls `empty(fn)` on it.

