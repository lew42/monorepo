# Syntax — the exact pattern, and why the edge cases are safe

```
/(?<![\w\[])([#@])(\[[^\]\n]+\]|[A-Za-z][\w./-]*[\w])/g
```

Read left to right:

1. **`(?<![\w\[])`** — the character right before the `#`/`@` must NOT be a letter, digit,
   underscore, or `[`. This is what keeps an email address alone: `mike@lew42.com` always has a
   letter right before its `@`, so it never matches. It also stops `#[[Name]]` from being read as
   two nested mentions.
2. **`([#@])`** — the control character. `#` looks its name up in `maps/refs.js`; `@` looks in
   `maps/people.js`. Nothing else in `Mention.js` cares which one it is beyond that one lookup —
   a third namespace later is a third entry in `Mention.js`'s `maps` object, not a rewrite.
3. **The name**, one of two shapes:
   - `\[[^\]\n]+\]` — `#[Page layout]`, for a name with a space (or anything except `]` or a
     newline) in it. The brackets are stripped before the map lookup.
   - `[A-Za-z][\w./-]*[\w]` — a bare name: starts with a letter, ends with a letter/digit/
     underscore, and allows `.`/`-` in the middle — so `CLAUDE.md` and `dev-server` both match
     as one name, no brackets needed. (This also means a single character never matches — the
     shortest bare name needs a start char AND an end char. Nobody has asked for a one-letter
     mention yet.)

## Why a markdown heading never matches

`# Title` is a `#` followed by a SPACE. The name group's two branches both require the very next
character to be `[` or a letter — a space is neither, so the whole pattern fails to match at that
position and the heading renders exactly as before. No special-casing was needed for this; it
falls out of the pattern itself.

## Why `#fff` (a colour) and `a#b` don't break anything

- `#fff` (a hex colour typed in prose) has the right SHAPE to match — `f` is a letter, `ff` are
  word characters — so it is treated as a possible mention, looked up, not found in `refs.js`,
  and left as plain text (added once to `unknown`, with a `console.debug`, never a warning).
  Nothing about the page changes — the text node is never even split, because `Mention.js` only
  rebuilds a text node when it finds at least one name it DOES recognise.
- `a#b` never reaches the name check at all — the lookbehind `(?<![\w\[])` rejects it immediately
  because `a` (a word character) sits right before the `#`.

## Live first, cache second (review finding 2, 2026-10-02)

The real fix for "a page's icon should just update its mentions" is `lookup()`'s own `live()` step,
not `sync.mjs` — `sync.mjs` is the fallback's fallback. Every `Page` ever constructed this session
is tracked (`core/track/track.js`'s `Page.instances()`, opted into once in `Page.class.js`'s own
constructor, `WeakRef`'d so a throwaway build doesn't leak); `live()` looks for one whose `.url`
matches the mention's target and, if it finds one, reads that LIVE instance's own `icon` and
`nav().class_card` instead of whatever `refs.js` says. In practice this is the common case, not the
rare one: the sidebar's own tree walk (`core/Sidebar/Sidebar.js`'s `nav()`) builds enough of the
site on every single page load — not just the page you're actually looking at — that most mentioned
pages already have a live instance before you ever read one. Proved by deliberately drifting
`core/Page/page.js`'s icon WITHOUT running `sync.mjs`: a fresh, cold page load of
`/framework/ext/Mention/` alone already showed the new icon (the sidebar's own walk had already
built `core/Page`); a second check that visited `/framework/core/Page/` first, then navigated to
Mention client-side (`Router.go()`, the same path a real link click takes), showed it too. Only a
page genuinely unreachable from the current sidebar state — deep in a branch nothing has expanded —
would actually fall back to the cache, and that's the trade-off this keeps rather than eliminates:
eagerly loading every one of the ~30 mentioned pages just to answer "what's its icon" would be a
much bigger, slower change than one map lookup, so that true cold case still reads `refs.js`.

## Where the cache itself comes from (built 2026-10-02)

Both `maps/refs.js` and `maps/people.js` started as a hand-written `{ Name: { url, icon } }`
object — picked for "the fastest working version that works first" (this task's own budget was
about $3) — and `refs.js`'s icons were still hand-typed duplicates of each page's own `icon:`,
with nothing to notice when the two drifted apart. [`sync.mjs`](../sync.mjs) is that later pass —
the cache's OWN source of truth, for whenever `live()` above has no live instance to read from —
in two parts:

1. **Icon**, from text: for every `refs.js` entry whose `url` has a real `page.js` on disk, it
   reads that file's own TEXT (never imports it — `page.js` files import `/app.js`, a browser-only
   path Node can't resolve) and pulls the one-tab-indented `icon: "…"` literal, which this
   codebase's page.js files always write as the page's own top-level config property.
2. **`class_card`**, from the live page: whether `#Name` should wear the same dark, always-dark
   "this is a class" look the module index pages give a class card (deliverable 3, 2026-10-02).
   Text alone can't answer this reliably (chasing an import to find out whether it names a real ES
   class is exactly the kind of guess that caught Sidebar's demo data below), so this half loads
   each page headless (`Server/browser.mjs`) and reads `app.router.active.nav().class_card` — the
   same fact `ext/Doc`'s `Doc.is_class(this.subject)` already computes every time the page renders,
   not a second guess at it.

A mismatch in either gets fixed in place; `refs.js`'s curated LIST of which ~30 names are worth a
mention (still a human judgment call, not a mechanical one) never changes. Run it after changing a
mentioned page's icon or its `subject`: `node public/framework/ext/Mention/sync.mjs`.

Left alone, on purpose: `people.js` (agent ROLES, not pages — several share one url, so there is
no single page icon or class to agree or disagree with), and four `refs.js` entries that borrow
another page's url just to have somewhere to click (`CLAUDE.md`, `skills`, `MCP`, `dev-server` —
their icon stands for their own concept, not for whatever page they happen to land on; syncing
`skills` and `MCP` from the Servex page they share would have erased the one reason they look
different from each other).

## The dark card, and the one CSS trap in it

`Mention.js`'s `build_row()` and `page.js`'s own demo wall both add `page-surface-dark` to a
`class_card` entry's row — the exact class `core/Page/Page.class.js`'s `preview_card()` adds to a
class's own card, so the two never drift apart in LOOK the way the old hand-typed icons drifted in
VALUE. ⚠ `ui/item/item.js`'s own `.item` rule resets `background: none` (so a tree row isn't a
stack of buttons) at the SAME specificity as `.page-surface-dark` (one class each), in the SAME
`@layer theme` — a tie that the reset was winning, because `.item`'s stylesheet is inserted the
first time anything on the site imports `item.js`, almost always before `Mention.js` ever runs.
`Mention.js` declares its own `.item.page-surface-dark { background: var(--dark-bg); color:
var(--dark-ink); }` AFTER importing `item.js`, which is what makes a later-inserted rule win the
tie — skipping that one line left every dark mention rendering with no background at all, caught
only by checking a
fresh headless page's actual computed style, not a screenshot through a tool that turned out to be
reusing a browser context with the old module graph cached.

## What "resolves" means here

The dev server answers every url with `200`, including one with no real page behind it — so
"check every url answers 200" (the original brief) is not actually a check on this server.
Every entry in both maps was instead checked by confirming the target `page.js` exists on disk
(`public<url>page.js`, or, for a `.md` link, the file itself). The four one-off links
(`CLAUDE.md`, `skills`, `MCP`, `dev-server`) don't have a `page.js` of their own — see
[readme.md](../readme.md) and the comments at the top of [`maps/refs.js`](../maps/refs.js) for
exactly which real page each one landed on, and why.

## Paths: `#Servex/lifecycle`

A mention can name a child page: `#Servex/lifecycle`, or `#[Page/some child]` in brackets. The first part is looked up in the map; the rest is added to its url as child slugs (`/framework/servex/lifecycle/`), and the link reads `Servex/lifecycle`. The owner wrote this with `@` too (`@Servex/heartbeat`), so an `@` name that isn't a person or agent falls back to the `#` map. The child is not checked: a wrong child name gives a link to a missing page.

## Paths: `/framework/core/Page`

A `/` that starts a word is a path from the web root: `/framework/core/Page` is the same link as `#Page`. It has no map of its own; it upgrades only when the path is exactly a known name's url, so `and/or`, `1/2`, `/nope/path` and a slash inside a url stay plain text.

## Where it runs (opt-in, never every div)

`md()`, chat bubbles and comments (`ext/Chat/md.js`), the AI 2 rows, and `p()` / `h1`–`h6`. The last two get it through one hook, `View.upgrade`, set by `Mention.js`, because core can't import ext. A plain `div().text()` is never touched.
