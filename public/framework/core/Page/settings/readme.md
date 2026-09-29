# Settings — tabs that manage themselves, and a page's own nav switch

## What

Two small additions to `page.jsonl` (`core/Page/doc/jsonl.md` has the full format), both
read by `core/Page/Log.js`:

```
{"tab": {"name": "disabled", "disabled": true, "nav": false, "order": 3}}
{"settings": {"nav": false}}
```

**A `tab` line is state for ONE CHILD**, written on the PARENT's own `page.jsonl`. A child
that already exists — a declared child, a `{"file": "kid/page.jsonl"}` line — is already a
tab the moment `Doc.bar()` or `tabs()` sees it; a `tab` line only adds `disabled` (greyed,
unclickable, still a real page), `nav: false` (missing from the strip, still a real page at
its own url) or `order` (breaks a tie) on top of that.

**A `settings` line is a whole PAGE's own preference**, written on ITS OWN `page.jsonl` (or
a sibling `settings.jsonl` for a `page.js` folder — the same rule `weight.jsonl` uses). The
first and only setting is `nav`: "does this page appear in its parent's navigation?" — the
right drawer's Settings tab has an "Appears in navigation" checkbox for whichever page
you're looking at, and it writes exactly this line.

## Try it

The three tabs above (Normal, Disabled, Hidden) are `core/Page/settings/`'s own children —
this whole page IS the demo. Their only difference is two `tab` lines on THIS folder's own
`page.jsonl`, shown above.

To see the `settings` line work: open Disabled or Hidden, open the ☰ drawer's Settings tab,
untick "Appears in navigation," and reload — the tab you just visited drops out of this
page's own strip too (`tab_visible()`, `core/Page/Log.js`, also checks a loaded child's own
`.settings.nav`). Tick it back to bring it home.

## Watch out

⚠ `nav: false` and `disabled` only ever affect the STRIP — the bar of clickable links. The
page itself is never gone; its url still works, typed or linked from anywhere else.

⚠ A page nobody ever set `nav` on defaults to visible, UNLESS its own weight
([`core/Page/weight/`](/framework/core/Page/weight/)) is below 1 — `settings.js`'s own
fallback.

## More

The code: [`Log.js`](/framework/core/Page/doc/jsonl/)'s `tab()`/`settings()`/`tab_visible()`;
[`ext/Doc/Doc.js`](/framework/ext/Doc/)'s `bar()`; [`ext/tabs/tabs.js`](/framework/ext/tabs/).
The reader used by the drawer and by a loaded child: [`settings.js`](./settings.js)
(`page_settings()`).
