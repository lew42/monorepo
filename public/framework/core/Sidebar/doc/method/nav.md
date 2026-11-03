The scroller. One line of dispatch over `pages`.

```js
(this.pages || []).forEach(page => page.pages ? this.group(page) : this.link(page));
```

## Usage

`Sidebar.js:79` — `menu()`, the only caller.

## Necessity

Essential, and that ternary is the whole "one `pages` property, no second `groups`"
verdict in code: **an entry with its own `pages` is a group**, duck-typed. A flat
sidebar, a grouped one and a mix are the same call, and it nests without a new
concept.

`.sidebar-nav` is **the** scroller — `flex: 1 1 auto; min-height: 0; overflow-y:
auto` — which is what pins the bar above it and the footer below it by structure
rather than by `position`.

## Simplicity

Right-sized. `(this.pages || [])` rather than `this.pages ?? []` is the only nit,
and it is a real (if tiny) difference: an empty string or `0` would also be treated
as no pages. Neither can occur.

**The nesting is one level deep and nothing enforces that.** A group inside a group
would render its nested `pages` through `group()` → `link()`, and `link()` would
read `.url` off an entry that hasn't got one, producing `href="undefined"` with no
warning. Nobody has tried it; the readme carries the question of whether to recurse
or to refuse.
