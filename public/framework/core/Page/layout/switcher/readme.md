# Switcher — one list-switches-content pattern, three skins

Vertical tabs, a file tree beside its code, and a plain left nav all do the same job: a list on
the left, or above on a phone, routes the content on the right. Vertical tabs is the CSS-flush
skin, a file tree adds a monospace/file-glyph skin, a left nav adds a quiet-sidebar skin — the
routing underneath is identical, and that identity is the whole point of this module.

## Use

```js page.js
import "/framework/core/Page/layout/switcher/switcher.js";   // once, anywhere in your app

content(){ this.switcher("guide api reference"); }                    // vertical tabs (default)
content(){ this.switcher("index-js router-js", { skin: "tree" }); }   // file tree
content(){ this.switcher("home settings", { skin: "nav" }); }         // left nav
```

`names` is the same space-separated child-name string `this.tabs()` already takes (ext/tabs) —
`switcher()` calls `this.tabs(names).ac("vertical")` for you and wraps it. Every name needs a
real child page (a `children:` line and its own folder), because a switcher IS routing: each
choice gets a real url, the same as any other page on the site.

## Why this needed its own module, and not just a CSS class on `ext/tabs`

The owner had been uneasy about `ext/tabs`'s active/in-path classes for a while — not because
they don't work, but because adapting them for a phone (turning a left nav into a sticky
dropdown) sounded like it would mean rewriting how "which one is current" gets decided. It
doesn't: [doc/decide.md](doc/decide.md) is the proof, with the files and lines. `switcher.js`
adds exactly one behaviour ext/tabs doesn't have — a container-query collapse to a one-row
sticky header — and touches zero of Router's or Page.css's own code to do it.

## Watch out

- **This is presentation on top of `ext/tabs`, not a replacement for it.** A plain `this.tabs()`
  call still works everywhere it always has; reach for `switcher()` only when the list itself
  needs to collapse into a dropdown on a narrow container.
- **The container query needs a sized ancestor.** `.switcher` declares `container-type:
  inline-size` on itself; if the box around it has no defined width (a flex item with no
  `flex-basis`, say), the query has nothing to measure against. See `doc/decide.md`.
- **`switcher.js` closes the `<details>` after a click purely as a courtesy** — it reads which
  link was clicked, never which one carries `.active`. Delete that one listener and the pattern
  still works; the list just stays open until the reader taps the header again.
- **The three skins are demos, not a closed set.** A fourth skin is a fourth CSS block in
  `switcher.css` under `.switcher-skin-<name>`; nothing in `switcher.js` needs to change.

## More

- [doc/decide.md](doc/decide.md) — the proof: can the collapse be added without touching the
  active-class logic, with the files and lines
- [core/Router](/framework/core/Router/) — `mark()` / `mark_links()`, the classes this module reads
- [core/Page/layout](/framework/core/Page/layout/) — the hub this page sits in, beside `floating`
- [ext/tabs](/framework/ext/tabs/) — the routing and the vertical-rail styling this builds on
