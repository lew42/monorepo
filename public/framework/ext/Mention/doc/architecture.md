# Mention architecture — two maps, read synchronously, shown live

`ext/Mention` turns `#Page`, `@owner` and `/path` in written text into a small icon + word that links to the thing it names. Its main entry is [`Mention.js`](../Mention.js) (class-free: one exported `mentions(el)` walker and `mention_html(str)` for strings). The data is two plain maps, [`maps/refs.js`](../maps/refs.js) for `#` and [`maps/people.js`](../maps/people.js) for `@`. Live page data comes from `core/Page`'s instance registry; the cache is only the fallback.

## Synchronous over plain maps

**Decided:** the maps are imported ES modules and every lookup and DOM edit runs synchronously, with no fetch and no `await`.
**Why:** a mention is applied inside a `View` capture callback, where any `await` would leave the box to fill in after the DOM has moved on.
**Instead:** a fetched JSON index, which needs a JSON import attribute and a load step that can fail and blank every markdown page.
**Detail:** [Mention-notes: synchronous design](./Mention-notes.md#synchronous-design)

## Two namespaces, one per control character

**Decided:** `#` looks only in `refs.js` (things), `@` only in `people.js` (people and agent roles), and `@` falls back to `#` for a page name.
**Why:** a thing and a person can never collide, and a third kind is a third map plus one key in `maps`.
**Instead:** one shared map, where `#Page` and `@Page` would fight for the same name.
**Detail:** [Mention-notes: namespace design](./Mention-notes.md#namespace-design)

## Live page data before the cache

**Decided:** `live()` reads `Page.instances()` first, so an icon or `class_card` comes from the page object when this session has built it; `refs.js` answers only for a page nobody has loaded yet.
**Why:** a page's icon changes in its own `page.js`, and the mention should show the change without a second step.
**Instead:** eagerly load all ~30 mentioned pages to answer every lookup, which is much slower.
**Detail:** [Mention-notes: live instances vs. cache](./Mention-notes.md#live-instances-vs-cache)

## The dev server keeps the cache fresh

**Decided:** when a watched `page.js` changes, `Server/plugins/MentionSync.js` re-reads its icon and rewrites `refs.js`, using the same `fs.watch` handle as the rest of the dev server.
**Why:** a hand-typed icon copy drifted from the page's own `icon:` field with nothing to notice.
**Instead:** a human re-runs `sync.mjs` after each change (still needed for `class_card`, which needs a headless page load).
**Detail:** [sync-icons and auto-sync](/framework/ai/sessions/2026/10/03/list-events/mention-auto-sync/)

## Opt-in only, never every element

**Decided:** only `md()`, chat bubbles and `p()`/`h1`–`h6` call `mentions()`; `View.js` reaches it through the `View.upgrade` hook that `Mention.js` sets.
**Why:** `core` may not import `ext` (imports flow down), and walking every text node would cost time on every page.
**Instead:** walk every element, which turns ordinary words into links by surprise.
**Detail:** [Mention-notes: opt-in integration](./Mention-notes.md#opt-in-integration)

## An unknown name stays plain text, logged once

**Decided:** a `#name` or `@name` that no map knows is left untouched and added to the exported `unknown` set, with one `console.debug`.
**Why:** a `console.warn` or `error` fails the merge smoke test, and a stray name must not break a page.
**Instead:** `console.warn` on every miss, which would fail every merge that mentions a new page before its map line lands.
**Detail:** [Mention-notes: unknown mentions](./Mention-notes.md#unknown-mentions-and-logging)

## A path matches only a known page's own url

**Decided:** a `/path` upgrades only when it equals a known page's `url`; an entry with `path: false` never answers a path.
**Why:** `/framework/` once resolved to `CLAUDE.md`, because that entry borrows the Framework page's url.
**Instead:** resolve any slash-led word, which turns file paths in prose into broken links.
**Detail:** [Mention-notes: path mentions and fallback](./Mention-notes.md#path-mentions-and-fallback)

## One class look, from the class's own card

**Decided:** a mention whose entry has `class_card` gets the same always-dark card that a class's own module index uses (`page-surface-dark`), built by one function, `build_row()`.
**Why:** a `#Page` in a sentence and the `Page` card on the index are the same fact, and should read the same.
**Instead:** a second style for inline mentions, which would drift from the card on the index.
**Detail:** [Mention-notes: build context and class card](./Mention-notes.md#build-context-and-class-card)

## Rows are built outside the open captor

**Decided:** `build_row()` clears `View.captor` while it makes the `item()`, then puts it back.
**Why:** `item()` is a normal `View` factory and would otherwise append itself into whatever content callback is open.
**Instead:** pass the parent in, which every caller would have to know to do.
**Detail:** [Mention-notes: build context and class card](./Mention-notes.md#build-context-and-class-card)

## CSS order: the dark mention wins over the item reset

⚠ `ui/item`'s `.item` rule resets the background at the same specificity as `.page-surface-dark`, in the same layer. `Mention.js` imports `item.js` first and declares its own `.item.page-surface-dark` rule after, so the dark fill wins. Moving the `css()` call above the import silently un-darkens every class card.
**Detail:** [Mention-notes: CSS specificity](./Mention-notes.md#css-specificity-and-dark-mentions)

## Three command characters (2026-10-19)

**Decided:** `/` is a path (teal), `@` an actor (violet, round icon), `#` a class or concept (framed icon; the dark card only when the entry is a class). Each mention carries one kind class (`mention-path`, `mention-actor`, `mention-class`); colours are the tokens `--mention-path`, `--mention-actor`, `--mention-class` in `Mention.js`'s stylesheet.
**Why:** the owner's 2026-10-06 ask: a reader sees what kind of thing a word is before reading it, and `/` is 1:1 with the file system with no alias table.
**The `/` rule:** a token that starts a line or follows whitespace or `(`, and whose every segment exists in the site's own folder listings (`Page.listing`, walked from `/`). Listings already loaded answer at once; otherwise the text node is upgraded when they arrive. `mention_html()` uses only what is loaded. A path shows as typed and never takes the dark card.
**Instead:** a generated `paths.json` of every path (a second source that drifts from `files.jsonl`, and a build step). The map-based `by_path` stays as the first free hit, for virtual pages like `/framework/servex/md/doc/roles/` that have no folder.
