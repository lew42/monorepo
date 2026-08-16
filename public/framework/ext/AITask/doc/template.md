# The template, and its override

`AITask` **is** the master template, and `report(m, req)` is its outline —
named methods called in order: `head`, then `refresh` (which draws `checklist`,
`extra` and `figures` into the `.ai-live` box, and redraws them there as the log
streams), then `chat` and `log`. A task dir's own `page.js` overrides whichever
one it wants and inherits the rest:

```js
export default new AITask({
    meta: import.meta,
    title: "Panel system",
    icon: "receipt_long",
    extra(){ md("what this one uniquely needs to say"); },
});
```

No options, no flags — this is assign-based OOP doing what it already does
everywhere else in the framework: the constructor's `Object.assign` shadows
`extra` on this one instance, and every other method — `head`'s request
quote, `figures`'s spend tables, `chat`'s panel, `log`'s transcript — runs
unchanged. `Doc`'s own "Overrides" line (visible on this module's API pages)
names the same mechanism from the reading side.

## Why `extra()` and not a fifth argument to `report()`

`extra(m){}` is empty by default and exists purely to be filled — it's the
one method with no default behavior at all, sitting between the checklist and
the spend tables. Naming it as a method rather than threading a render
callback through `report()`'s signature means a task's `page.js` never has to
know `report()` exists; it overrides the one part it cares about and the
outline finds it by name, same as every other override point in this class.

## `content()` is not part of the outline

`content()` is the ordinary `Page` entry point — it awaits `session()` and
`requirements()` **once**, synchronously captures the container, then fills
it inside a callback (`$s.append(() => …)`), which is what makes calling
`report()` after an `await` safe. `report()` itself is never async: by the
time it runs, both reads have already resolved. A task's own `page.js`
overrides one of the named parts, never `content()` — doing so would
mean re-implementing the read-then-capture dance for no benefit.

Every later redraw goes through the same rule from the other end:
`refresh()` refills `$live` inside `empty(() => …)`, because a streamed batch
arrives as a socket message with no captor of its own.

## A task dir with no `page.js` still gets this

Both `/framework/ai/page.js` and each day's `page.js` declare a `route(name)`
that falls back to `new AITask({ title, icon, url, src })` for any undeclared
task dir. So the template is the default across the whole archive, and a
curated `page.js` — an `extra()`, most often — is the exception, opted into
per task rather than assumed.
