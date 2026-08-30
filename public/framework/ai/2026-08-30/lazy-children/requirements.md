# lazy-children — implement the nav-stub proposal

## The ask (verbatim)

TASK — implement the lazy-children (nav stub) proposal. THE PROPOSAL IS THE SPEC:
`public/framework/ai/2026-08-30/eager-load-cost/proposal.md` + `cost.json` (the measured baseline:
/framework/* = 261 modules / 1.08MB regardless of destination; 67-84% overhead). Read it fully, then
`core/Page/Page.class.js` (`load_all_children()`, `child()`, `nav_for()`, `previews()`, `walls()`,
`default_column()`). Run the `code` skill.

THE DESIGN (from the proposal — deviate only with a measured reason): `children:` accepts nav-stub
entries — `{title, icon, description}` (+ whatever nav_for needs) stored as-is in the children Map,
no import, no add(); `nav_for()`/`previews()`/`walls()` read stubs via a duck-type fallback; the real
import happens at `Page.child()` on actual navigation exactly as bare-string children resolve today.
Named breakages to handle: `default_column()` needs a live Page (a stub can't be the default — assert
or document); two-level walls need the grandchild resolved (walls() may need to trigger the child's
real load, or such parents stay eager — proposal's call).

MIGRATION (smallest-first, per the proposal): (1) /blog/'s section children if truly unused for nav
(check the rail first — B10's BlogNav reads `sections`/posts.js data, not children — verify before
dropping anything); (2) the leaf:true branches (ai/ui/ux/audit — ~70 of the 204 overhead modules);
(3) /imagine/'s 12 sibling subtrees (the Start card previews need stub titles/icons/descriptions —
supply them). Keep every migrated declaration READABLE — a stub line should be as short as the string
it replaces plus its three fields.

VERIFY — the same CDP measurement the baseline used (its method is in the eager-load-cost task log):
re-measure all 5 baseline urls cold; report the before -> after table (modules + KB). Behavior:
previews render identically (screenshot the /imagine/ Start card wall + /framework/ front before/after
— pixel-comparable), navigation into a stubbed child works cold and warm, the 138-url imagine sweep +
a 20-url framework sample all console-clean, finder/columns/generator unregressed. Two numbers that
must agree: cost.json's baseline totals vs your re-measured baseline (same code = same numbers) BEFORE
the first edit — proving the measurement matches theirs.

FENCE — `core/Page/Page.class.js`, the children: declarations migrated (each named in the log),
`core/Page/doc/declaring.md` (or wherever children: docs live — one section), `doc/decisions.md`.
NOT ext/demo (a sibling is in it), NOT core/Page/page.js.

HARD RULES: never kill/restart the :80 dev server (DOWN — private `$env:PORT='8094'; node server.js`,
tear down after); never drive owner tabs; never stash; never commit. Screenshots/probes to the
scratchpad (lazy-*), keepers to the task dir.
