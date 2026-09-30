# Syntax — the exact pattern, and why the edge cases are safe

```
/(?<![\w\[])([#@])(\[[^\]\n]+\]|[A-Za-z][\w.-]*[\w])/g
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
   - `[A-Za-z][\w.-]*[\w]` — a bare name: starts with a letter, ends with a letter/digit/
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

## Where a derived map would plug in

Both `maps/refs.js` and `maps/people.js` are today a hand-written `{ Name: { url, icon } }`
object — picked for "the fastest working version that works first" (this task's own budget was
about $3). A later pass could build `refs.js`'s object instead of writing it by hand: walk
`directory.json` (the same file `ext/toc`'s sibling, `ext/filesystem`, already reads), take each
page's own `title` and `icon` field, and key the map by title. The one thing that pass would still
need a human for: deciding WHICH of several hundred pages are worth a one-word mention — today's
seed (the core seven, Servex, nineteen `ext/` modules, four one-off links) is a judgment call, not
a mechanical one. `Mention.js` itself would not change at all; only where `refs.js`'s object comes
from.

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
