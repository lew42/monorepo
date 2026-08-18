The component's whole look, in `@layer theme` plus two rules in `@layer util`. No
literal colour anywhere — every value is a token (`--line`, `--subtle`, `--ink`,
`--prim`) so a theme retunes the whole set without touching a selector.

## Three shapes, one set of classes

`.tabs` (underline, horizontal) is the base. `.block` swaps the hairline for folder
borders and moves it from the bar onto the tabs. `.vertical` turns the same bar into
a sticky left rail, and collapses back to a horizontal strip under `64em`. All three
read `.active` / `.in-path` / `[aria-current]` off the DOM — no rule here writes a
class, only reads what `Router.mark_links()` (or, for a stand-in app, nothing at
all — hence the third selector) already wrote.

## The two `@layer util` rules belong to Page's arrangement contract

`.tab-panel:has(> .page:is(.active-page, .active-ancestor)) > .page.default:...`
is the same "hide the default once something real is active" rule every region in
the framework needs — it lives here only because `Page.css` may never name a class
only an ext emits. Moving it back would put an undeclarable dependency in core.

## ⚠ Two comments still say "classdoc"

Lines 21 and 111 read *"classdoc's well does"* and *"classdoc's overview does"* —
`ext/classdoc` became `ext/Doc` today, and this file was not part of that rename
because CSS is outside this audit's fences. Flagged at the top of
[the audit report](/framework/audit/modules/ext-tabs.md); the fix is a two-word
edit whenever a `.css` file is back in scope.

## Improvements

1. **Fix the two stale "classdoc" comments** (lines 21, 111) to say `Doc`.
   *(simple, important — but out of this pass's fences; see the audit.)*
2. **The `64em` vertical→horizontal breakpoint is one measurement**, checked
   against a single topic-region shape (viewport minus a 19em sidebar). A host with
   a different sidebar width has no evidence either way. *(medium, useful.)*
3. **No rule here has ever been exercised past ~50 tabs.** The scroll-and-reveal
   behaviour that makes overflow safe is proven at exactly one size. *(medium,
   speculative until a module grows past `View`'s fifty members.)*
