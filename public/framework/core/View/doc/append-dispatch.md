# `append()` dispatches on type, and that is the whole API

| you pass | what happens |
|---|---|
| a View | `el.append(arg.el)` |
| a function | capture |
| a plain object | `append_pojo` — child views assigned to named properties |
| an array | flattened, dispatched again |
| a promise | awaited, then appended to `this` |
| anything else | `el.append()` — strings, numbers, DOM nodes |

**Options were considered and rejected.** `append(x, { mode: "prepend" })` and
similar all lose to the fact that the *type* already says what you meant.
`p("2 + 2 = ", 2 + 2, ". A ", a("link"), " inline.")` works with no ceremony
precisely because nobody had to say which argument was which.
