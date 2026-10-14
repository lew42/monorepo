# The changes to core this model needs, written down and not made

Status: proposed, not made (2026-10-14). These four edits would move the [navigation model](../readme.md) from a demo into core. Each touches `Page`, `Router`, `Sidebar` or `ext/toc`, which the model task was asked not to change, so the [model page](/framework/core/Page/navigation/model/) shows each one with a demo override instead ([`NavModel.js`](../NavModel.js)). Each is small; each is its own task when someone takes it.

1. **`section: true`, a page word: "I own the left tree for everything under me."**
   Today only `/framework/page.js` draws its own `Sidebar` (`root: this`), in its own `render()`. The change: [`Page`](/framework/core/Page/)'s `words()` accepts `section`, and the App roots the one [`Sidebar`](/framework/core/Sidebar/) at `this.chain().findLast(p => p.section)`. Until then `NavModel.SECTIONS` lists the section roots by url.
2. **`?in=<section>` on a link: keep the reader's section.**
   In [`Router`](/framework/core/Router/), when the clicked url carries `in` and that url is a section root, render the target inside that section's frame (its tree, a crumb of `[section, target]`) instead of the target's own. Example: `/framework/core/Router/?in=/web/` opens Router inside the Web tree, crumb *Web › Router*. `NavModel.opens(href)` is the rule, and it is the function the Router would call.
3. **`kind: "workspace"`, a page word: fill, no padding, parts are panes.**
   `Page.render()` adds `.page-kind-workspace`; `Page.css` gives it `padding: 0; height: 100%; max-width: none`. The demo child `workspace/page.js` does this by hand today with `.page-navm-workspace`.
4. **`ext/toc` draws nothing below three headings.**
   In [`ext/toc`](/framework/ext/toc/) `toc.js` `fill()`, hide at `headings.length < 3`, not `!headings.length`. Its own [`doc/decisions.md`](/framework/ext/toc/doc/decisions.md) records that the three-heading floor was never built, not that it was rejected. A page with one or two headings does not need a column for them.
