# Shells — the record

The ask (owner, 2026-08-29): *"explore app layouts: sidebars, footers, canvas, inner
sidebars/footers, etc"*. Ten shells at `/imagine/shells/`, each its own screen, each with a
one-line verdict on the page it is about.

## 1. A shell is its own screen, and getting there took two seams

`/imagine/` calls `columns()`, and `Page.column_host()` is `chain().find(page => page.columnar)`
— the **shallowest** columnar ancestor. So every page under `/imagine/` is a column of that
one row, and **a nested columns host is impossible**: an inner `columns()` call is a no-op
because the outer host is found first. (`/imagine/vary/scroll/full/` calls `columns()` and is
in exactly that position.)

A shell is not a column. `Shell` overrides two methods and nothing else:

```js
container(){ return this.mounts_in(this.app.$pages, "app.$pages — a shell is its own screen"); }
render(){ return this.view ??= div.c("page shell hides-nav", …); }
```

- `container()` mounts the shell **beside** `/imagine/`'s view rather than inside its row.
  The arrangement contract then hides the host for free: an ancestor with a later marked
  sibling is replaced (`Page.css`, top of file). Same mechanism the site homepage uses.
- `render()` is what skips `render_column()` — a page in a columns tree renders as a column
  unless it draws itself.

Cold-loading any shell url activates `root → imagine → shells → shell`; imagine renders its
whole row invisibly and the shell has the region. Verified at all three widths.

**Consequence, and the one thing a reader should take away:** to put a real columns row
*inside* a shell, the row has to be a **separate tree** — `demo.app()`, which is what
`columns/page.js` does. That is not a workaround; a row inside a shell genuinely is a second
tree with its own root.

## 2. One grid, six permutations

```css
grid-template-columns: auto minmax(0, 1fr) auto;
grid-template-rows:    auto minmax(0, 1fr) auto;
grid-template-areas: "head head head" "left main right" "foot foot foot";
```

A part a shell doesn't declare leaves its track empty, and an empty `auto` track is 0px. So
left rail / right rail / both / footer / header+footer / sidebar+footer are the same six
declarations with different children, and `Shell.css` has **no per-shell rule**.

`minmax(0, 1fr)` on both middles rather than a bare `1fr`: `1fr` keeps its content minimum,
so one wide table in the content area would push the rails off screen instead of scrolling
inside it.

`"foot foot foot"` is also the answer `rail-foot/` exists to give: the footer spans the whole
floor, **under** the rail. Stopped at the rail's inline edge it reads as part of the content
and the rail loses its own bottom edge.

## 3. Three tones, and inner chrome is the third

| | fill | what it is |
|---|---|---|
| the frame | `--wash` | every outer chrome part, on the app's floor |
| the paper | `--surface` | the content region — the one raised thing |
| a division | *none* | inner chrome: a `--line` hairline, one type step down |

Inner chrome must not repeat the outer treatment. Two bands of equal weight, one inside the
other, and the eye cannot tell which owns the content — that is what banded `/framework/ux/*`,
and `ext/Doc` reached the same answer from the other side (a Doc nested in another Doc's panel
draws its strip as a left rail, never a second well).

The second half of the rule is behaviour, not paint: **inner chrome navigates inside its
area**. `inner-rail/`'s rail is the document's own table of contents and moves the inner
scroller; the outer rail moves you between screens. Inner chrome that changes the whole
screen is the outer rail one level in, whatever it looks like.

`#slug` hrefs are safe for that: `Router.link_clicked()` returns null for
`link.hash && link.pathname === location.pathname`, so it is a native in-page jump and the
shell never re-renders.

## 4. Measured — headless, 2026-08-29, at 400 / 1920 / 3440

Zero console errors on eleven pages × three widths. `.nav` computes `display: none` on every
shell. The document never scrolls; every scroller listed below was asked for.

| shell @1920 | head | left | main / canvas | right | foot |
|---|---|---|---|---|---|
| left | — | 208 | 1712 | — | — |
| right | — | — | 1712 | 208 | — |
| both | — | 208 | 1504 | 208 | — |
| foot | — | — | 1920×1028 | — | 1920×52 |
| head-foot | 1920×52 | — | 1920×988 | — | 1920×40 |
| rail-foot | — | 208 | 1712×1040 | — | 1920×40 |
| canvas | 1920×52 | 208 | **1504×988** | 208 | 1920×40 |
| columns | — | 208 | 1712×1040 | — | 1920×40 |

**The canvas is the arithmetic check.** 1920 − 208 − 208 = 1504; 1080 − 52 − 40 = 988. The
readout in the stage's corner is a `ResizeObserver` printing `clientWidth × clientHeight`, and
it agrees at every width (400 → `400 × 509`, 3440 → `2972 × 1337`). Nothing in the CSS
computes it.

**Scrollers, and why each is wanted:** the content region on a document shell (the document
is taller than the screen), `.shell-inner-body` / `.shell-doc` on the inner-chrome shells (the
*area* scrolls, so its rail and its status line stay put), `.page-columns-row` at 400 on the
columns shell (the row is the one box that scrolls sideways), and every `.shell-bar` /
`.shell-rail` at 400 (a strip that scrolls beats a strip that wraps). No others.

**Under 40em** every part takes its own row and the rails become strips
(`grid-template-areas: "head" "left" "main" "right" "foot"`). `@media`, not `@container`: the
template lives on `.shell` itself and a container query never matches its own container. A
shell *is* the region, so the window is the honest thing to measure — with the dev rail open
it is not, which is the standing "close the rail before you measure" rule.

## 5. Rejected

- **A `.shell-left` / `.shell-foot` grid class per permutation.** Six rules saying what one
  template plus an absent child already says.
- **A `config` of booleans (`rails: "left"`, `footer: true`).** Declaring `left(){ … }` is the
  same information and it is also the thing that builds the part — extend, never configure.
- **Reusing `.page.topic`** for the frame. It carries site rules (`.topic > .sidebar`,
  `--measure: 40em`, a 52em stacking breakpoint) written for a docs section, and four of these
  ten shells have no sidebar at all.
- **`width: "full"` as the escape from the row.** It works, but a `full` column still sits
  under the host's crumb strip inside a scrolling row, and the column body's sticky head and
  prose inset are chrome the experiment did not choose. It is also the word with the known
  sidebar-collapse bug.
- **Letting the content region scroll on the columns shell.** The row then grows to its tallest
  column and pushes the footer off the screen.

## 6. Keyboard chrome toggles, and a shadowing trap they exposed

2026-08-31: every declared part hides and returns on one key (`[` `]` left/right,
`h` `f` head/foot) — a class on `.page.shell`, never a second "collapsed" page, which is
the new-page-per-state anti-pattern the rest of this lab argues against by construction
(one grid, an undeclared part already 0px). `rail()`/`bar()` stamp the same key as the
region's own `title` tooltip, off one map, so the hint and the handler can't drift apart.

**The listener could not live in `activated()`.** That was the first try, mirroring
`/imagine/game/`'s keyboard-travel round 4 exactly. It silently did nothing on
`canvas/` — the one shell that declares its own `activated()` for the stage's
`ResizeObserver`. `Object.assign(this, literal)` in the constructor puts that function
directly on the **instance**, which shadows a same-named method on `Shell.prototype`
outright; `this.activated` never sees the base version at all. `render()` is the one
method no leaf shell redeclares, so the listener attaches there instead, once, guarded
by the same `!this.view` check that already makes `render()` idempotent.

**Scoped by `.active-page`, not by add/remove.** Nine of ten shells could have used
`deactivated()` to tear the listener down; canvas still couldn't have paired with it
correctly without the same shadowing fix. Simpler to never remove it: the handler
checks `this.view.el.classList.contains("active-page")` (the class `Router.mark()`
already writes) and returns immediately otherwise, so a shell you are not standing on
answers nothing. Ten shells visited in a session is ten of those checks per keystroke —
cheap enough not to be a leak worth chasing.

**Measured, headless:** left rail hides and returns; canvas's four parts hide together
and the stage's own `ResizeObserver` readout moves from `1504 x 908` to the full
`1920 x 1000` and back — the grid arithmetic finding (§4) proven live, not asserted. A
synthetic focused `<input>` blocks the toggle, same as `/imagine/game/`'s guard.

## 7. The 2026-09-05 UX pass — real stills, and a 3-column card measured and reverted

**A stranger could not tell the ten shells apart from their cards.** Every card was an icon,
a title and one line of description — "Left rail" and "Right rail" read identically at a
glance, and "Canvas centre" gave no hint it is a design-tool grid with a floating board. The
fix: `Shell.js`'s `preview(nav)` now renders a real screenshot of that shell (960×600,
`shots/<slug>.jpg`, generated headless) instead of the icon — a picture, never a live
instance, same rule `mini.js` and `screens/screen.js` already keep. Ten shapes are now visibly
different before you click any of them.

**The 3-column card, built and measured, lost.** The owner's brief tonight (title+intro left,
the shell's own still centre, its `finding` text right) was built for real on this page and
measured against the tile wall it already had, headless, both widths:

| | width used | dead space | column height |
|---|---|---|---|
| wall @1280 | 91.6% | 108px | 998px |
| 3-col @1280 | 91.6% | 108px | 3568px |
| wall @3440 | 46.0% | 1856px | 1289px |
| 3-col @3440 | 46.0% | 1856px | 4038px |

Width used and dead space did not move — the column's own `large` word caps both regardless
of what is drawn inside it, so a 3-column row can only spend the same capped width in a
narrower, taller shape. Height went to roughly 3.5–3.6× because ten shells at one full-width
row each cannot share a row the way a wall does; and the right-hand "readout" column had
nothing to read out — a shell's `finding` is prose, not a metric, so it only repeated words
already sitting inside the still. Reverted. This confirms the same-shaped finding
`/imagine/screens/` reached independently the same night (695→1439 at 1280, 856→1747 at 3440
there) — on a page that is a menu of same-shaped choices, the tile wall's job is exactly to
show several at once, and a one-per-row card gives up that job for nothing in return.

**Does a shell connect to `/imagine/paging/`'s vocabulary? Only in effect, not in name.**
Clicking a shell card *is* the `takeover` mechanism verbatim (`words.js`: "fills the screen;
every page behind it collapses to the crumb strip") — `Shell.container()` mounts beside
`/imagine/`'s own view and the row stands down, which is takeover exactly. But nothing in
`shells/` says so: the readme and every shell's own file talk about "opens FULL SCREEN"
without ever using the word `takeover` or linking to `/imagine/paging/`, so a reader who has
just read the paging hub does not recognise this lab as an example of the same idea. One line
in the readme now closes that gap (`## Use`, and the note above `children:` in `page.js`); a
deeper fix — shells actually importing paging's `MECHANISMS` map for its icon/label rather
than restating "takeover" as a fact — is a bigger seam than this pass's fences allow (it would
make `/imagine/shells/` depend on `/imagine/paging/`, a cross-realm import neither module
declares today) and is left as the open question below.

**Persistence: none.** `grep -rn "store()\|localStorage" public/imagine/shells/` returns
nothing — every shell is a static demo with no state to remember, so there is nothing for
`baseline()` to mark.

## 8. Open — the owner decides

- **Should a document in a shell keep its left edge?** It does today, so at 1920 a 40em
  document leaves ~1170px of paper to its right and at 3440 ~2660px. That is the site's
  one-left-edge rule holding, and it is also the emptiest thing in the lab. Centring inside the
  content region is one declaration; the rule says no. (`columns.md`'s "empty room" finding is
  the same question one scope up, and its answer was *not* to widen anything.)
- **Does core want a word for "index, not rail"?** A page in a columns row whose `content()`
  is a wall of `previews()` gets core's row list under it as well — the same children twice.
  `shells/page.js` overrides `column()` to drop the rows, and `/imagine/vary/` and
  `/imagine/gallery/` have the same shape without the override.
