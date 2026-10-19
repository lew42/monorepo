# Plan: three command characters in `ext/Mention` (path, actor, class)

The owner's ask: [section 2 of the 10-06 brief](../../../../06/markdown-explorer-and-class-cards/requirements.md). Brief: [requirements.md](requirements.md).

## What exists today

`#Name` looks in `maps/refs.js`, `@name` in `maps/people.js`. `/path` already works, but only by looking a url up **in those two maps** (`by_path`). So a real page that is in no map (`/framework/core/Page/navigation/`) stays plain text: that is the alias table the owner does not want. All three kinds also look alike (same `.item.inline.mention`); only a `#class` is dark.

## The three kinds

| Kind | Char | Means | Resolves by | Icon | Colour token |
|---|---|---|---|---|---|
| Path | `/` | a place on the site or disk | the site's own folder listing, 1:1 | the page's own icon (live), else `folder` / `description` | `--mention-path` (teal) |
| Actor | `@` | a user or an agent | `maps/people.js`, then a live agent id | its map icon (`person`, `psychology`, ...) | `--mention-actor` (violet) |
| Class | `#` | a class or concept | `maps/refs.js` | its map icon, in a **frame** | `--mention-class` = the dark card |

Each mention element carries one kind class (`mention-path`, `mention-actor`, `mention-class`); the stylesheet reads only that class and the tokens, so a theme changes one token.

## The `/` rule (decision)

A `/` token is a path mention only if **both** hold:
1. it starts a line or follows whitespace or `(` (the existing lookbehind; an email, a URL `https://x/y`, `a/b` never match); and
2. it names something that exists, walked from the root through `Page.listing(url)`: `/` lists `framework`, `/framework/` lists `core`, and so on. Each listing is the `files.jsonl` / `page.jsonl` the site already reads, memoised per folder by `Page`.

Otherwise it stays plain text. The walk stops at the first missing segment, so prose like `/etc/hosts` costs one cached lookup (`/` has no `etc`) and **no request that can 404**.

**Sync first, async to finish.** `mentions()` must not await inside a capture. So the first pass is synchronous: `Page.loaded_listing(parent)` (never fetches). If every segment's listing is already loaded, the answer is immediate. If one is not loaded, the walk is started (`Page.listing`) and, when it resolves, the text node is upgraded in place (a plain DOM replace, outside any `View` capture, same as `build_row` already does). `mention_html()` (a string, cannot upgrade later) uses the sync answer only.

**`ref_entry(url)` reuse.** `ref_entry` stays the one `/path` entry point: a live `Page` instance or a map hit gives the exact icon and `class_card` as today (so `core/Page`'s content `ref` row is unchanged); a path with neither gets its kind default from the listing (`folder`, or `description` for a file). One function, no second lookup.

**decision:** path existence comes from `Page.listing()`, not from a new index. **Alternative:** the dev server serves one `paths.json` of every path. Rejected: a second source that drifts from `files.jsonl`, and a static build step the site must not have.
**decision:** the map-based `by_path` stays only as the first (free) hit, for virtual pages with no folder (`/framework/servex/md/doc/roles/`). **Alternative:** drop it. Rejected: those would stop linking.

## What changes in the three readers

- **`mentions(el)`** (`md()`, `ext/Chat` bubbles, Drill titles, Inbox row titles): `replace_node` asks `resolve(sigil, raw)`, which returns an entry now or `null`, plus (for `/`) a promise when the answer is pending. Nothing outside Mention changes; a name not found stays text and nothing throws.
- **`mention_html(str)`**: same `resolve`, sync only; the output gains the kind class.
- **`build_row(name, entry, extra)`** (cards, `core/Page` content `ref` row): adds the kind class from `entry.kind` (default: the class a caller passes today, so no caller breaks) and the framed icon for `class_card` entries. Signature unchanged.
- **Chat engine, `core/Page`, class cards:** untouched (fence).

## Show it

A "three kinds" block on `ext/Mention/page.js`: one plain-markdown sentence with `/framework/core/Page/`, `@owner`, `#Page`, rendered by the mention system, three looks on one screen. `check_page` on `/framework/ext/Mention/` and a chat page at 400, 1200, 1920, 3440.
