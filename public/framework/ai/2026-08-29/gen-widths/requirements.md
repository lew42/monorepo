# gen-widths

Verbatim ask:

TASK — generator width defaults + the two new width words in its controls.

First: run `new-task` (slug `gen-widths`, group `pages`). Read `core/Page/generator/` (gen.js MODEL, tree.js, controls.js, spec.js, rules.js, page.js, doc/decisions.md). Run the `code` skill.

1. Default width = the default track. Owner: "make the default width for the generator the 'default' size, the small ones are super small." Find where generated pages get width words (drawn in gen.js? defaulted in tree.js/controls?) and make the unmarked/most-common outcome the DEFAULT track (no word), with `small` staying its super-small self, used only where drawn deliberately. Also the header size control's initial state = default/med. If this changes the draw sequence or weights, that is a MODEL version change — bump the exported MODEL, note it in doc/decisions.md, keep the same-seed-twice proof green, and log which seeds moved (never silently).
2. hug + fill in the controls. A core sibling is landing two new width words TODAY: `hug` (content width) and `fill` (spend leftover; distinct from full's takeover), classes following the `.page-column-<word>` family exactly. Add both to the per-column width menu and the header size options, building against those class names; if the core CSS hasn't landed when you verify, note the seam status in your log (render will look default until it lands) — do not write your own CSS for them.
3. Sync readme.md (controls table) one line.

FENCE — core/Page/generator/** only.

VERIFY headless (Playwright global): roll 3 seeds — most columns sit on the default track (count small vs default per seed, report); width menu shows small/default/large/full/hug/fill and each applies its class (inspect classList); same seed twice → identical spec; zero console errors at 1280/1920. One keeper screenshot at 1920. Report: where the default was set, seeds moved (if any) + MODEL note, the class-name seam status, the counts.
