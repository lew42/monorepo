# Mention — implementation notes

## CSS specificity and dark mentions

`ui/item`'s `.item` rule resets `background: none` (so a tree row isn't a stack of buttons) at the same specificity `.page-surface-dark` uses (one class each), in the same layer — a tie that `.item`'s rule was winning, because it loads first (Mention.js imports it). This file importing after it, and declaring its own rule after that, is what lets a dark mention actually paint dark. `--dark-bg`/`--dark-ink` are Page.css's own custom properties, set on this exact element by its `.page-surface-dark` class (core/Page/Page.css) — reading them back here, instead of repeating the hex a second time, is what review finding 5 (2026-10-02) asked for: one colour, one place it's actually written, however many rules need to paint it.

## Inline dark mention height

The owner (live on the Now card, 2026-10-03) noted that a dark mention taller than the line it's in reads as a mistake. `.item`'s own padding and its 1.3em icon frame (ui/item/item.js) are sized for a tappable row, and a plain inline mention is already that tall — it just has no visible edge, so nobody notices. `.page-surface-dark`'s fill paints that same box solid.

For inline mentions only, padding-block is tightened to zero, and the icon is resized to 1em at 0.85em font-size. A tree row or any other `.item` keeps its own tappable room.

## Namespace design

Two separate namespaces, one per control character (the owner, 2026-09-30): `#` looks names up in `refs.js` (real things on the site — `#Page`, `#Servex`), `@` looks them up in `people.js` (users and agents — `@owner`, `@mastermind`). Adding a third namespace later is adding a third map and a third key to `maps` — nothing in this file needs to change.

## Path mentions and fallback

A path (`/`) from the web root points into `refs.js` and `people.js` by url (the owner, 2026-09-30). Only a path that IS a known page's url upgrades; every other slash stays plain text.

The `path: false` marker (refs.js) — an entry that borrows another page's url (it has none of its own) — must never resolve a literal path to it. Typing "/framework/" means the Framework page, never "CLAUDE.md" just because CLAUDE.md's own mention happens to point there too (bug, 2026-10-03).

## Live instances vs. cache

`refs.js`'s `icon`/`class_card` are a cache, only as fresh as the last `sync.mjs` run — editing a page's icon does not update its mentions until someone remembers to re-run that script. Review finding 2 (2026-10-02) asked for the live half: `Page.instances()` (core/track/track.js; every Page ever constructed this session, opted in once, WeakRef'd so a throwaway build doesn't leak) answers the common case for real — a page you've already visited this session, or one `/framework/`'s own wall just loaded, IS a live object right now, holding its own current `icon` and (for a Doc) `nav().class_card`. Read those instead of the cache.

A page nobody has loaded yet has no live instance to ask, so the cache is still the fallback for that cold case — fixing that would mean eagerly loading every one of the ~30 mentioned pages just to answer "what's its icon", a much bigger and slower change than this one lookup.

## Live agent ids

A live agent's own id is never in `people.js` — Servex mints one per task (`task-mastermind-inbox-cards-work`, `minion-card`, …), unbounded. There is no roster to keep in sync the way `refs.js`'s fixed pages are (bug, 2026-10-03: a card's own text named `@task-mastermind-…` and it stayed plain words). It links to `/framework/ai/sessions/<id>/`, which `AISessionsPage.child()` redirects to the agent's task folder (`AgentUrl`; an unknown name shows "Session not found"). `Mention.js` builds the link synchronously with that fallback url and `retarget()` swaps in the real folder url (via `data-agent`) once `AgentUrl.load()` resolves, so a link never waits on the fetch. It reads as a small icon mention by its own shape, using the four kinds `activity.js`'s `who_word()` already names in plain sentences.

## Path as parent/child lookup

A path walks down from a known page (the owner, 2026-09-30): `@parent/child`, `@Servex/heartbeat`. The first segment is looked up, the rest is appended to its url as child slugs. `@` falls back to the `#` map when the first segment is a page rather than an agent, so `@Servex/lifecycle` still resolves.

## Mentions in template literals

`ref_entry(url)` exposes the same `/` lookup that `mentions()` uses on inline text, for a caller that already has a url (not a sentence to scan) and wants the page it names — icon, title, class_card — without re-reading `refs.js` or `Page.instances()` by hand. `url` may or may not start with "/"; either way it is read the same way a literal "/path" mention in prose is. Returns null for a url this site's `#`/`@` maps don't know (refs.js doesn't have every page yet — a caller falls back to the raw url rather than treating that as an error).

## Unknown mentions and logging

A name not in its map is left as plain text (untouched — the original text node is never even split) and recorded in `unknown`, once per name, with one `console.debug` — never `warn`/`error`, which would fail this site's own merge smoke test. Unknown's keys carry their sigil (`"#Nope"`, not `"Nope"`) so `#Nope` and a future `@Nope` don't collide.

## Build context and class card

`build_row` is built outside whatever captor happens to be open when `mentions()` runs (a page's own content() callback, most of the time) — `item()` is a normal View factory and would otherwise auto-append itself into that captor before this file ever moves it into place. See doc/decisions.md if this ever needs to be true for a second reason.

`entry.class_card` (maps/refs.js, kept in sync by sync.mjs) is true when the page this mention points at documents a real ES class — the same always-dark "this is a class" look `Page.preview_card()` already gives a class's own card on its module index (`page-surface-dark`, deliverable 3), so a reference to `#Page` in a sentence and the `Page` card on `/framework/core/` read as the one idea rather than two different looks for the same fact.

`extra` is the inline-text sizing ("inline mention", Mention.css's tightened padding). The one caller outside this file that needs the same dark card at ordinary row height (a content-list "ref" row, core/Page/Page.class.js, 2026-10-03) passes just "mention", keeping the identifying class but skipping the tighten-for-text rule.

## Synchronous design

Throughout synchronous (no fetch, nothing awaited) — so this is safe to call from inside a `View` capture callback, same as `md()` itself.

## Opt-in integration

OPT-IN, never every div (the owner, 2026-09-30): md(), chat bubbles and comments call `mentions()` themselves. `p()` and h1–h6 reach it through a hook in core/View (core can't import ext — imports flow down — so ext registers itself here).

## Pattern rules

The pattern matches `#` and `@` mentions and `/` paths:
- Not preceded by a letter/digit/underscore or `[` — so `a#b` and `user@example.com` are left alone (an email's `@` always has a word character right before it).
- `#[Page layout]` — the bracket form, for a name with a space in it.
- A markdown heading (`# Title`, `#` then a space) never matches — the character right after `#` has to be `[` or a letter, never a space.
- `#fff` (a colour written in prose) matches the shape but almost never the map, so it falls through to plain text — same as any other typo.

`/` must START a word (only after a space, `(` or the start), so "and/or", "1/2" and a url's inner slashes never match.


## Inline code that is only a reference (2026-10-25)

An inline `code` whose whole text is one reference (`/framework/ai/`, `@owner`, or a bare agent id such as `mastermind-x`) becomes the same link; `mentions()` does it before the text walk (`upgrade_code`). Longer code and `pre` stay code. Owner's ask: anything referenceable is clickable, never only a code snippet.
