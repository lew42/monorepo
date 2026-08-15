# Typed lists, and the `toString()` measurements

Built from a three-persona design council (Simple Steve / Elegant Eric / Technical
Tim). Where they disagreed the disagreement is recorded — and in one case **both were
wrong and running the code settled it.**

## Reflect the method list, or type it?

- **Tim:** derive it from `Object.getOwnPropertyNames(Class.prototype)`. A hand-typed
  list goes stale *silently* — add a method, forget the list, the page just never
  shows it. No error, forever.
- **Steve and Eric:** type it. Reflection documents `append_fn`, `prepend_pojo`,
  `backtick_append` — private helpers nobody should read — and it *still* cannot tell
  you which have prose, so you need the second list anyway.

**Verdict: type it.** Tim's drift bug is real but it is the *cheaper* failure: a
method missing from the docs is visible to anyone reading the docs. Reflection's
failure is a page of noise with an error box where the notes should be, and it doesn't
remove the curation problem, it defers it.

Recording the dissent properly, because it has a trigger: **if a class ever gets a
"document everything" page**, reflection is right for that page.

## `source()` vs `dedent(String(fn))`

The council contradicted itself, so the tie was broken by running it.

- **Steve:** `source()` strips everything before the first `{`, so it drops the
  method's name and parameters.
- **Tim:** *"I traced it, it works — it correctly strips the `methodName(...)` prefix."*

**Steve was right.** Measured:

```
source(View.prototype.append)   →  "for (const arg of args){ … "     ← signature GONE
dedent(String(fn))              →  "append(...args){ … "             ← correct
```

`source()` is *correct for what it was built for* — `demo(fn)` and `code.fn(fn)`,
whose subject is an anonymous function nobody needs a signature for. It is wrong for a
method, where `append(...args)` is the one line confirming you're in the right place.
So `member()` is a **sibling, not a patch**: two existing callers depend on `source()`
behaving exactly as it does.

**Tim was right about the other one, and it is worse.** `Class.prototype[name]`
**executes a getter.** `App.get loaded()` builds a `Promise.all`; read it off a bare
prototype, where the instance state doesn't exist, and it throws `undefined is not
iterable` before `toString()` is ever reached.

**The lesson: two experienced reviewers reached opposite conclusions about four lines
of string-slicing, and the disagreement was settled in thirty seconds by running it.
Trace less, execute more.**

## …and the half of it nobody measured

`dedent(String(fn))` was verified on its *first line* — the line the argument was
about — and shipped with every line after it a tab too deep:

```
append(...args){          ← column 0
        const tag = …     ← still at its depth in View.js
    }
```

`toString()` on a shorthand method starts at the **name**, so the first line's indent
was left behind in the file. It measures zero; `dedent()` took the minimum across all
lines; zero won, and nothing moved. Then the closing `}` — at the method's own depth,
not the body's — sat one level in from a signature at the root, which is what makes it
look like an indent bug rather than a *missing* dedent.

**Fix, in `util/source`:** a first line with no leading whitespace is not evidence
about the indent, so it is excluded from the measurement. The concise-arrow branch of
`source()` was quietly wrong for the same reason — `trimStart()` on the body makes
line one report zero — and got fixed by the same line.

Same lesson as above, applied to the fix rather than the argument: it was visible on
screen for the whole life of the feature and nobody read past line one.
