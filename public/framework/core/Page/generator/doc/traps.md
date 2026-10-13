# generator — traps (moved from the readme)

<!-- moved verbatim from readme.md lines 217-262, 2026-10-12 readme audit -->
## Watch out

- **A seed is only an address against a fixed MODEL.** `gen.js` exports the number and the
  page prints it. v1 → v2 (2026-08-27) and v2 → v3 (2026-08-29, `small` reweighted rare) each
  moved **all six** proof seeds — keep a tree you like as its *text*, not as `#7`.
- **A config that overrides `column()` must stamp its own width class.** `width: "full"` is a
  field nobody reads until something writes `.page-column-full`; core's `column()` ends with
  that line and so must yours.
- **A page's view is built when it activates**, so a generated child is invisible until
  something links to it — the host's own column draws that list.
- **Every generated href carries the seed.** `Router.go()` pushes `pathname + search + hash`,
  so a plain href drops it one level in and the reload rebuilds a different tree.
- **A word rule must select `> .page-gen-nav >`.** A tab's page now renders *inside* its
  parent's column, so a descendant selector dresses a grandchild as its grandparent.
- **A bare `0` in a token is not a length.** `gap=0` makes `calc(100% - 1 * var(--gap))`
  invalid at computed-value time, which throws away `--column`, which throws away
  `.flex.auto`'s whole `flex` shorthand. Three cards shrank to 62px, silently. `0px`.
- **A global cannot reach a component that DECLARES the token** — `--gap` on the host loses to
  `--gap` on the nav at any distance. A global arrives as the *fallback* (`var(--gen-gap, …)`),
  which is the one indirection `--gen-list` and `--gen-gap` exist for.
- **A look's class does not travel with the look.** Adding `vary-colstyles-look-ink` to this
  host changes nothing measurable: that stylesheet is only loaded under `/imagine/`. Loaded by
  hand it *does* dress the row, bodies, heads and titles — those read core's own class names —
  but never an item, because a generated column draws `.page-gen-item` and colstyles styles
  `.page-column-item`. Measured; the numbers are in
  [`doc/decisions.md`](/framework/core/Page/generator/doc/decisions.md).
- **A look must be (0,4,0).** Core's body rule is `.page.columns .page-column-body`; a plain
  `.page-gen-look-x .page-column-body` ties it and stylesheet order decides. Restate
  `.page.columns` — colstyles paid for this one first.
- **An in-place page whose child opened a column went `display: none`.** Core's arrangement
  rule shows an ancestor only if the active page is *inside* it; a tab's child mounts out in
  the row. Worked around in `generator.css` (`@layer util`) — the core hook is named there.
- **An export is a READ of the live tree**, never a second draw — so what lands on disk is what
  was on screen, and no seed is re-rolled. `flow=` is the one spec setting with no page.js form;
  `--column`'s gap fallback is `1em` there and `0px` here, and reusing the wrong one silently
  drops a three-card wall to two.
- **A link INTO the generator with `#s=<spec>` from outside is silently ignored on a soft
  navigation.** `Router.go()` (`core/Router/Router.js`) calls `history.pushState()` only AFTER
  the target module has already constructed itself, so a page whose `initialize()` reads
  `location.hash` (`land()`, here) sees the OLD hash — and falls back to whatever tree this
  browser last stored. `target="_blank"` on the link is the fix (`link_clicked()` already
  excludes a link with a `target`), forcing a hard load where the hash is right from the first
  line — `/imagine/paging/explorer/`'s own link to the magazine shape.
- The rest — how "in place" is two lines of `container()`, a specificity trap, why
  `demo.tree()` was the wrong reuse, how a control edits the spec, and both halves of the
  dev-only gate: [`doc/decisions.md`](/framework/core/Page/generator/doc/decisions.md).
