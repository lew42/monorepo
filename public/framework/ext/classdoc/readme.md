# classdoc — design record

Built from a three-persona design council (Simple Steve / Elegant Eric /
Technical Tim). Where they disagreed, the disagreement is recorded — and in one
case **both were wrong and the code settled it.**

Format as everywhere: **question → options → weighing → verdict.**

---

## 1. How does a page discover which methods have notes?

No build step, no filesystem at runtime, a static host with no directory
listing. Options considered:

| option | why not |
|---|---|
| directory listing | does not exist on a static host. Out by construction. |
| a generated `index.json` | needs a build step, or it's hand-maintained anyway — a worse string, with JSON syntax |
| probe every method name, catch the 404s | N requests per page load to learn what a human already knows; and `fetch` resolves `ok:false` on 404 rather than throwing, so the "optimized" HEAD version becomes an unhandled rejection nobody sees |
| **a declared string** | ✓ |

**Verdict: a hand-typed string, exactly like `children`.** All three personas
reached this independently, which is about as strong a signal as this process
produces.

The framework already refuses to crawl anything — *"nothing crawls the
filesystem, so a page nobody imported does not exist"*. A method-doc list is that
same question with that same answer.

---

## 2. Reflect the method list, or type it too?

**This is where the council split.**

- **Tim:** derive the method list from
  `Object.getOwnPropertyNames(Class.prototype)`. A hand-typed list goes stale
  *silently* — add a method, forget the list, the page just never shows it. No
  error, forever. Reflection removes that failure mode for free.
- **Steve and Eric:** type it. Reflection documents `append_fn`, `prepend_pojo`,
  `backtick_append` — private helpers nobody should read — and it *still*
  cannot tell you which have prose, so you need the second list anyway.

**Verdict: type it — one list, not two.** Tim's drift bug is real but it is the
*cheaper* failure: a method missing from the docs is visible to anyone reading
the docs. Reflection's failure is a page of noise with an error box where the
notes should be, and it doesn't remove the curation problem, it defers it.

Recording Tim's dissent properly, because it has a trigger: **if a class ever
gets a "document everything" page**, reflection is right for that page and this
verdict does not apply to it.

---

## 3. `method.toString()` — what it gives you, and what's wrong

The council contradicted itself here, so the tie was broken by running it.

- **Steve:** `source()` strips everything before the first `{` and so drops the
  method's name and parameters.
- **Tim:** *"I traced it, it works — it correctly strips the `methodName(...)`
  prefix."*

**Steve was right.** Measured:

```
source(View.prototype.append)   →  "for (const arg of args){ … "     ← signature GONE
dedent(String(fn))              →  "append(...args){ … "             ← correct
```

`source()` is *correct for what it was built for* — `demo(fn)` and `code.fn(fn)`,
whose subject is an anonymous function nobody needs a signature for. It is wrong
for a method, where `append(...args)` is the one line confirming you're in the
right place. So `member()` is a sibling, not a patch: two existing callers depend
on `source()` behaving exactly as it does.

**Tim was right about the other one, and it is worse.**
`Class.prototype[name]` **executes a getter.** `App.get loaded()` builds a
`Promise.all`; read it off a bare prototype, where the instance state doesn't
exist, and it throws `undefined is not iterable` before `toString()` is ever
reached. Verified. `Object.getOwnPropertyDescriptor` is the only way to hold an
accessor's function rather than its result.

**The lesson worth keeping:** two experienced reviewers reached opposite
conclusions about four lines of string-slicing, and the disagreement was settled
in thirty seconds by running it. Trace less, execute more.

### Limits, stated so nobody "fixes" them later

- **Class fields are invisible.** `render = () => {}` lives on the instance, not
  the prototype — `member()` will not find it, and the symptom is identical to
  "no notes yet." Every method in `framework/core/` is prototype shorthand, per
  this repo's constructor convention, so this doesn't bite today.
- **Statics are searched second**, after the prototype, so `View.stylesheet`
  documents correctly. If a class ever has both a static and a method of one
  name, the method wins and the static is unreachable. No such class exists.

---

## 4. Should a patched method show the original or the patch?

`ext/highlight` replaces `View.prototype.append` at import time. Found by
building the feature — `/framework/core/View/append/` rendered a function nobody
recognised.

**Options.** (a) Show the original by reaching for the pre-patch source — there
isn't one at runtime, so this means hard-coding. (b) Show the patch silently.
(c) Show the patch, labelled.

**Verdict: (c).** A doc page that reads a live object is documenting the *running
program*, and on this site the running `View.append` really is highlight's
wrapper. Showing the original would be a lie that reads as truth; showing the
patch unlabelled makes a reader think the docs are broken when they compare
against `View.js`.

Detection is one line of trivia: JS infers a function's name from assignment to
an **identifier**, never to a **member expression**. So a shorthand method
carries `fn.name === "append"` and
`View.prototype.append = function(…){}` carries `fn.name === ""`.

---

## 5. Tabs or previews for the method list?

**Verdict: neither — `classdoc()` returns the page and the author picks.**

Eric proposed `classdoc()` end with `return page.tabs()`, making the drill-down
free. Tim's counter was decisive: `tabs()` renders every name into one bar with
**no overflow handling at all**, and `View` has ~35 candidate methods. A bar is
right for five and unusable for twenty, and nothing in `tabs()` will ever tell
you which side of that line you're on.

Since both are one call, the author makes it:

```js
classdoc(this, View, import.meta, "append ac on style stylesheet");
this.previews();          // …or this.tabs() when there are few enough
```

---

## 6. Rejected: a `ClassDoc extends Page` subclass

Tim's call-site sketch was `new ClassDoc({ cls: View, notes: "…" })`. Steve's
objection stands: a subclass buys nothing here. It has no named parts to
override — the whole job is *add some children* — and `Page` already is a
titled, linkable, lazily-loading tree.

A function that takes a page and adds to it composes with everything (a page can
call it twice, for two classes); a subclass would fix the page's identity to one
class forever.

---

## 7. Open

- **A missing `.md` renders `md.file`'s `.md-error` box.** Correct — it fails
  visibly rather than silently — but the copy reads like a fault when the honest
  meaning is "nobody has written this yet." One string, not a mechanism.
- **Deep-linking every method costs a `Page` each.** Cheap today at five. If a
  class ever documents thirty, measure before assuming it's fine.
