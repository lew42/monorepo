# content is always a List: step 1, as built (2026-10-12)

Step 1 of [content.md](content.md), "Design: `content` is always a List". Steps 2 and 3 (`children`) are not built. Live: [/framework/core/Page/content-shapes/](/framework/core/Page/content-shapes/), proof in [STATE.md](../../ai/2026-10-12/content-list/STATE.md).

## The classes

```js
class PageContent extends List          // page.content, the same object for the page's life
class PageContentItem extends Item      // a bare item: draws straight into the page, no wrapper
class PageCode extends PageContentItem      // a function:   View.draw() = fn.call(page)
class PageAddress extends PageContentItem   // "/x.md":      View.draw() = page.content_at(address)
class PageParagraph extends PageContentItem // "some text":  View.draw() = p(text)
```

Each has a `View` attached after the class (`PageCode.View = …`). `PageContent.View` draws the list. `Page.render_content()` is `this.content.render()`, with no type-switch.

## Where it differs from the design text

- **No extra DOM.** A list that holds only bare items draws them straight into the page box, so the 1,096 `content(){}` pages produce the same DOM as before. A list with real parts (or a `set()`) uses the old `.page-content-list` rows box.
- **Bare items are `transient`.** `Item.Store` persists content events, and a function cannot be written to a jsonl file. `PageContent.toJSON()` and `Page.lists()` skip transient items, so a code-only page serialises as before.
- **One bare item at a time.** A new function, string or address replaces the previous bare one (`bare()` releases it first), as assigning `content` always did.
- **A class-body `content(){}` is hoisted.** It shadows the `Page.prototype` accessor, so the constructor moves it into the list and puts the accessor on the instance (`hoist_content()`). `ai/cards/card.js` and the other class-body pages keep working untouched.
- **`page.jsonl` default.** `Jsonl.js` used `page.content ??= page.log_view`; it now adds `log_view` as a `fallback` item, dropped when real parts arrive (what the old replace did).
- **`Page` assigns twice** (once inside `super()`); the setter replaces, so one item results.
- **Callers.** `this.content()` became `this.content.render()` in about 25 files; truthiness tests on `page.content` became `page.has_content()`; `ext/Doc` and `ext/catalog` read `page.content.value` / `take_content()` for the raw function. `take_content()` hands the content to the catalog's intro page and clears it, so on that one page `page.content` becomes a fresh List afterwards.

## New ability

A page with `content(){…}` and a `{"content":…}` jsonl line shows both: [/framework/core/Page/content-shapes/both/](/framework/core/Page/content-shapes/both/). Before, the line replaced the function.
