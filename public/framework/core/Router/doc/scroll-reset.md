# Scroll reset — written down because removing it looks safe

`activate()` ends with `page.view.el.closest(".pages")?.scrollTo(0, 0)`, and the
reason it needs writing down is that **removing it looks safe.**

The browser clamps `scrollTop` to the new content height, so navigating to a
*short* page self-corrects and reads as working. It only misbehaves when both pages
are taller than the region — which is most docs pages and none of the quick tests.

`.closest(".pages")` rather than `parentNode`: **the region scrolls, not the page**,
and a page mounted in a tab panel has `.tab-panel` as its parent with the scroller
above that. `.pages` is the arrangement contract's own class, so this asks for the
contract instead of guessing at the tree.

**No per-url scroll memory.** Back lands at the top too. Remembering a position per
url is a Map that has to be written on every navigation and never gets cleaned up,
and arriving halfway down a page you have never seen is not a feature. Nobody has
asked to return mid-page yet.
