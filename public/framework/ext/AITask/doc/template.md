# The template, and its override

`AITask` **is** the master template, and `report(m, req)` is its outline — a
local **Requirements · Report · Session** tab bar (hand-rolled from
`ext/tabs`'s CSS classes; not `Page.prototype.tabs`, since these are sections
of one page, not routed children), Report open by default because the answer,
not the brief, is what a task page leads with. Report is `outcome`, then
`links` (the same pill row `card.js` renders), then `refresh` (which draws
`status`, `checklist`, `extra`, `shots` and `figures` into the `.ai-live` box,
and redraws them there as the log streams). Session is `chat` then `log`.
Requirements is `head` — `requirements.md` rendered whole when there is one,
else the request verbatim. `status` is the one-line "where this is right now"
— the same `now` `card.js` shows, silent once `landed_at` is set (`outcome` is
the truth by then) or when the manifest never wrote one. A task dir's own
`page.js` overrides whichever one it wants and inherits the rest:

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
`extra` on this one instance, and every other method — `outcome`'s answer,
`head`'s request quote, `figures`'s spend tables, `chat`'s panel, `log`'s
transcript — runs unchanged. `Doc`'s own "Overrides" line (visible on this
module's API pages) names the same mechanism from the reading side.

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

## A task dir is never declared, either way

Both `/framework/ai/page.js` and each day's `page.js` declare a `route(name)`
that checks `dashboard.js`'s `has_page_js(date, name)` (a `directory.json`
listing, warmed by `dashboard()` when the day page renders) — true, and
`route()` returns nothing, so `Page.child()`'s own filesystem probe
(`Page.load()`) dynamic-imports the task's real `page.js`; false or still
unknown (a cold deep link, cache not warm yet), and `route()` falls back to
`new AITask({ title, icon, url, src })`. So the template is the default
across the whole archive, a curated `page.js` is the exception, and neither
one is ever named in `children:` — `has_page_js` reading "unknown" the same
as "false" means a task with its own page is briefly generic-viewed only on
a cold direct link, never broken.
