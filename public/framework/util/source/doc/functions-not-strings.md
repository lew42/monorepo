# Why examples are functions, not strings

The reason every `demo()` on this site takes a callback:

```js
demo(() => { div.c("card", () => p("hi")); }, "the caption");
```

A string is dead text in the editor — no highlighting, no completion, no
formatting, no syntax errors. A function body gets all four from the IDE for
free, and then `fn.toString()` hands the page **the exact text the IDE
checked**. There is no build step to desynchronise the two, which is the
whole reason this works on a no-bundler site and would not work in a bundled
framework — a bundler would mangle the very source `toString()` reads back.

## The cost, accepted

The example must be valid JS in the surrounding scope: real imports, real
variables in closure. An example that *shouldn't* run, or that needs an
import the page doesn't have, is a `code.js()` string instead — see
[`ext/tabs`](/framework/ext/tabs/)'s page, whose demo box says so out loud
rather than faking a render.

## What this bought later

`ext/Doc`'s method pages are the same idea one level up: `member(subject,
name)` reads the **actual running function** off a class or namespace object,
so a patched method ([`patched()`](/framework/util/source/api/patched/))
shows the patch, not a stale original. Same guarantee, same reason: no copy
to drift from the thing it's showing.
