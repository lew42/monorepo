# Mention — `#Page` and `@owner` become a small icon + the word, wherever the site renders written content

`#Page` is a reference to a real thing on the site — a page, a module, a doc. `@owner` is a
person or an agent role. Write either one in any markdown or chat text and it turns into a small
icon + the word, linking to wherever that name means — the owner's own words: *"you could
easily convert any reference to a actual thing you could click through to and read about."*

## Use

```js
import { mentions } from "/framework/ext/Mention/Mention.js";

mentions(someElement);   // walk it in place, using the site's own two maps
```

You don't usually call this yourself — `md()` (every markdown render) and `ext/Chat`'s `md_into`
(chat bubbles, Drill titles) already call it after every parse. Writing `#Page` or `@owner`
anywhere that text goes through either of those is enough.

Adding a name: open [`maps/refs.js`](maps/refs.js) (things — `#`) or
[`maps/people.js`](maps/people.js) (people and agent roles — `@`) and add one line,
`Name: { url, icon }`. `icon` is a [Material Symbols](https://fonts.google.com/icons) name, the
same ones `ui.item` takes.

## Watch out

- **Two separate namespaces, one per control character** — `#` only looks in `refs.js`, `@`
  only in `people.js`. This is deliberate (the owner, 2026-09-30): a reference and a person
  can never collide, and a third namespace later is a third map, nothing else changing.
- **A name not in its map stays plain text** — nothing throws, nothing warns (the merge smoke
  test fails on a console warning or error), and the name is recorded once in the exported
  `unknown` Set with one `console.debug`. See it live on [this page](/framework/ext/Mention/),
  under "Unknown names seen this session."
- **`#[Name with spaces]`** is the bracket form, for a name that isn't one word:
  [`doc/syntax.md`](doc/syntax.md) has the exact pattern and why a markdown heading (`# Title`)
  never matches it by accident.
- **A mention reads the LIVE page first, the cache second.** If the page a `#name` points at has
  already been built this session (you've visited it, or it's one `/framework/`'s own wall just
  loaded — in practice this covers most of the site, since the sidebar's own tree walk builds
  enough of it on every page load), the mention reads that live instance's own `icon` and
  `nav().class_card` straight off it — editing a page's icon updates its mentions on your very next
  reload, no extra step. Only a page truly nobody has built yet falls back to `refs.js`'s cached
  `icon`/`class_card`, kept honest by [`sync.mjs`](sync.mjs) for that cold case (reads every
  page-backed entry's own `page.js` text for its icon, and loads the page headless for its real
  `nav().class_card`). `people.js` and the four concept-only `refs.js` entries that borrow another
  page's url (`CLAUDE.md`, `skills`, `MCP`, `dev-server`) are left out of both — `doc/syntax.md`
  says why.
- **A `#reference` to a class gets the same dark card a class's own module index uses** —
  `Mention.js`'s `build_row()` and `page.js`'s demo wall both read `entry.class_card` and add
  `page-surface-dark`, the framework's existing always-dark island (`core/Page/words.js`'s `dark`
  SURFACE word), so `#Page` in a sentence and the `Page` card on `/framework/core/` read as the
  one idea. ⚠ `ui/item`'s own `.item` rule resets `background: none` at the same CSS specificity,
  in the same layer — `Mention.js` has to declare its own `.item.page-surface-dark` override
  AFTER importing `item.js`, or the reset silently wins and the card never looks dark at all.
- `mentions()` builds its icon rows OUTSIDE whatever `View` capture happens to be open when it
  runs, on purpose — see the comment beside `build_row()` in [`Mention.js`](Mention.js) if a
  future change to `View`'s capturing ever needs to know why.

## More

- [Overview](/framework/ext/Mention/) — every known name, live, and the unknown ones this
  session has actually seen.
- [`doc/syntax.md`](doc/syntax.md) — the exact pattern, the markdown-heading and email/colour
  edge cases, and the derive-the-map note.
- Back to [Ext](/framework/ext/).
