# Page content, simplified: one way per concept (task mastermind brief)

**Owner (2026-10-12):** child pages vs content vs parts is confusing; we may be overcomplicating it. Pick the best way, drop the redundant ones. "Page part" may be the better name for a part of a page. Good syntax matters.

**What is true today (verified in `core/Page/Page.class.js`):**
- `page.pages` is a `List` of child pages (each its own folder and url); `page.children` is a `Map` wrapper over it, and the config `children: "a b"` string is staged by a setter and unpacked by `declare()`.
- `page.content` is overloaded: a function (`content(){ h1() }` in `page.js`), a string, an address, or a `List` made lazily when a `{"content": ...}` line arrives. `render_content()` switches on the type.
- `render_content_list()` draws each item as title/text, because `Item` has no default `View` yet; so `PartsPage` (`core/Page/parts/Parts.js`) overrides `render_content()` only to call each item's `draw()`.

## Target (the mastermind's decision; record the alternative)
Three concepts, one way each:
```js
page.pages      // List<Page>: child pages, own folder and url (nav)
page.content    // List<PagePart>: the page's own blocks, stored as page.jsonl lines
PagePart extends Item; PagePart.View = class PagePartView extends View {}   // each kind draws itself
```
`content(){ ... }` in `page.js` stays working as one part kind (a code part) so no page breaks.

## Do, smallest first
1. Make `render_content_list()` draw an item through its class's `View` when it has one (`new this.constructor.View(...)`, per the code skill), falling back to today's title/text. Additive; no page changes.
2. Rename `Part` to `PagePart` (kinds `PageHeading`, `PageText`, `PageCard`, or a better name via the `naming` skill), with a shim at the old name; retire `PartsPage` once step 1 makes it redundant (keep a re-export shim).
3. Write `core/Page/doc/content.md`: the three concepts in one screen with the code above, and the deprecation path for `children` (Map wrapper, string form) and the overloaded `content` (function/string/address), not executed yet: it is major surgery (CLAUDE.md "Ask before"), so record it as a plan with caller counts, by script.
4. Update the `core/Page` readme architecture block and the parts readme. Layout-check; commit each step; merge.

## Fences
Worktree; do not change existing page behaviour beyond step 1's additive path; do not migrate the ~215 `.children` callers or rename `content` here. Sonnet 5.5; Haiku under 60k tokens for counting; no OpenRouter. One-sentence chat replies; `STATE.md` here; land with `finish-task`.
