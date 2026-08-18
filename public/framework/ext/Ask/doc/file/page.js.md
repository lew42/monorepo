The module's own documentation page — a `Doc`, not a plain `Page`. It's also
the module's own smallest real caller: two `asker()` buttons and one inline
`chat()` mount, all running against a real dev socket when read on localhost.

## `subject: Ask` is a module namespace object

```js
import * as Ask from "./Ask.js";
```

`Ask.js` exports four loose functions with no class or object to hang them
on, so this page imports the **module namespace object** itself as the
`subject` — every named export (`ask`, `available`, `thread`, `start`) is an
own, enumerable property of it, which is exactly the "namespace object" shape
`ext/Doc`'s own docs describe. `member()` (in `util/source/source.js`) finds
each one via a plain `Object.getOwnPropertyDescriptor`, the same lookup it
would use on a hand-authored `{ ask, available, ... }` object — a real ESM
namespace object satisfies the contract for free, with no object literal to
maintain in sync. `chat()` (from the sibling `chat.js`) is deliberately left
out of this subject: it's a view factory, not a value-returning function, and
its interesting surface (the options table) is already the Overview's job.

## `asker()` is the smallest possible caller

A named instance method — not a helper function, not a class — because
`content()` calls `this.asker(...)` twice with different prompts and models.
It's the whole demo system for this module: no `demo()` wrapper, no rail,
just a button and a paragraph that fills in.

## Improvements

1. **`import * as Ask from "./Ask.js"` as a `Doc` subject has no other
   precedent in the framework** (`grep -rn "import \* as" --include=page.js`
   returns nothing else). It works, and it's arguably the *correct* reading of
   ext/Doc's own "namespace object" subject shape for a file of loose exports
   — but until a second module tries it, it's a pattern of one. Worth
   revisiting once `ext/JSONL` or another loose-function module gets its own
   `Doc` pass, to see if it holds up twice. *(simple to redo elsewhere if it
   doesn't; noted as a pattern to watch, not a defect.)*
2. **`thread()` and `start()` are demoed only as static code blocks**, not
   live buttons like `ask()`/`chat()` — both write real files (a thread
   dir, or a whole new task under `framework/ai/`), so a live demo here would
   either spam the repo with scratch threads or require a sandboxed target
   path this module doesn't have. The trade is named in the prose itself
   ("both write real files, and their live demos are the pages that already
   use them"). Fine as is; noted so a future pass doesn't "fix" it into
   spamming test threads. *(n/a — deliberate, not a gap.)*
