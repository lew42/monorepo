# Templates — the machinery, the type axis, and what Make cannot say yet

The realm at [`/imagine/paging/templates/`](/imagine/paging/templates/) puts eleven whole page
shapes inside the paging stage. This file is the part that does not belong on a page: exactly
which module draws each example, the two places another module had to be worked around, and the
three proposals that came out of building it.

---

## 1. What draws what, and where it lives

Nothing in the templates realm is a screenshot, a mock-up or a copied block. Every example runs
the family's own module, imported read-only. If one of those modules changes, the picture in the
templates realm changes with it — which is the whole argument for building it this way.

| family | imported | what runs |
|---|---|---|
| **Magazine** | `/imagine/mag/page.js`, `/imagine/mag/contents/page.js` | `mag.column()` draws the real cover (and brings `mag.css`); `contents.previews()` draws the six real contents entries through `Article.preview()`, with the real read-marks. The words come from `issue.json`. |
| **Blog** | `/blog/Post.js`, `/blog/posts.js`, `/blog/framework/page.js` | `Post.hero(featured())` is the front's lead over a real post; `blog_section.content()` is a real `Section` drawing its blurb and `Post.wall(of_section("framework"))`. |
| **Screens** | `/imagine/screens/screen.js` | `area(label, note, to)` — the two-box sheet, inside a real `.screens-screen` row; `frames(...)` draws the hop diagram. The links go into `/imagine/screens/divide/`. |
| **Shells** | `/imagine/shells/Shell.js`, `/imagine/shells/page.js` | A real `Shell` instance: `rail("left")`, `bar("head")`, `main()` → `content()` + `verdict()`, and `nav_links()` listing real shells at real urls. Parented to the real shells index. |
| **Decks** | `/imagine/decks/deck.js` | `region(61.8, …)` + `quiet(38.2, …)` inside a real `.decks-slice`, with `statement()` and `notes()`. |
| **Columns** | — | The one family whose real example is the page you are standing on. The picture is the width words drawn to their own weights; the row is real. |
| **Layouts** | `/framework/styles/layouts/preview.js` | `shape(classes, regions, column)` — the same function every layout word's card uses. |
| **Sections** | `/framework/styles/sections/hero.js`, `stats.js` | `hero(tone)` and `stats(tone)`. The surface chip is translated into a tone word, so this family repaints from the real four-tone vocabulary. |
| **UI** | `/framework/ui/ui.js` | `ui.table(...)`, plus the `ui/card` template markup verbatim — `ui/` is a template tier, so there is nothing to import for a card. |
| **UX** | `/framework/ux/Pagination`, `/framework/ux/Tags` | `new Pagination({ pages, current })` and `new Tags({ tags })` — real classes, live, clickable. |
| **Navigation** | `/framework/ui/crumbs/crumbs.js`, `../paging.js` | The `ui-crumbs` template markup, then four real `Paging.Item` rows carrying the four mechanism icons. |

### The two workarounds, and why each was necessary

**`.blog-hero` in a flex column measured a few px wide.** It declares
`container: blog-hero / inline-size` *and* `align-self: start`. On the blog front it lands in a
stretched track, so the two never meet; in a flex column, `start` makes the width shrink-to-fit,
and **an inline-size container may not be sized by its own contents** — the hero collapsed and
set its own title one character per line. The fix is one declaration,
`.templates-blog > .blog-hero { align-self: stretch }`, and it has to out-specify `.blog-hero`
rather than merely follow it: both rules are `@layer theme` at (0,1,0) and `blog.css` is appended
when `Post.js` is imported, which is *after* `templates.css`. (This is the trap the `css` skill
records for `container-type: size`, one axis over.)

**`Shell.render()` cannot run inside a page.** It stamps `hides-nav` — which takes the site's own
strip away — and attaches a window `keydown` listener, both of which belong to a shell that owns
the screen. The miniature therefore calls the shell's own parts (`head()`, `left()`, `main()`)
into a box of its own. See proposal 2 for the one line that would make even the grid reusable.

**A correction to `/imagine/paging/readme.md`.** It says "Import the blog's `posts.js`, never its
`Post.js` — the class loads `blog.css`, which re-sizes every `.page-previews` on the page." That is
no longer true, and may never have been: every `.page-previews` rule in `blog.css` is scoped —
`.blog-magazine > .page-previews` and `.page.blog-section > .page-previews` — so the sheet cannot
reach a wall it does not own. Checked line by line, 2026-09-05; `Post.js` is imported here and the
paging hub's own card wall is unaffected.

---

## 2. The type axis

`compact` · `regular` · `display` is a sixth chip group, added by subclassing rather than by
widening `words.js` — `paging.js` belongs to another task's fence. `Template` adds one key to
`opening()`, one stamp in `dress()`, one sentence in `note_axis()`, and `Template.Toolbar`
overrides `group()` for that one axis. Everything else — the press, the keyboard half, the
`aria-pressed`, the storage, the pixel caption — is inherited unchanged.

Two custom properties do the work:

- `--templates-step` moves ordinary text. An inherited `font-size` reaches it.
- `--templates-ramp` moves **display** type, which an inherited font-size **cannot** reach.

Four families size their headings in `cqw` off their own container — `.mag-cover-title`,
`.screens-label`, `.decks-title`, `.blog-hero-title`. That is right at full size and wrong in a
card: a `clamp()` whose middle term is `cqw` falls to its `rem` **floor** the moment the container
is small, so a `2.2rem` cover title lands on a 180px cover and the composition is lost. The
miniature needs its own floor either way, so `--templates-ramp` rides in the same declaration.
Measured on `/imagine/paging/templates/magazine/`, 1920: the cover title reads **34.2px** on
`compact`, **42.8px** on `regular`, **57.7px** on `display`, with no reload
(`performance.getEntriesByType("navigation").length === 1`).

**If the axis survives**, moving it into `words.js` is four lines — a `TYPE` array, a key in
`Paging.opening()`, a row in `VALUES`, and a line in `note_axis()` — and deletes
`Template.Toolbar` entirely.

---

## 3. Proposal — the words Make would need

[Make](/imagine/paging/make/) builds a real page from one line of text. Today that line is:

```
Title: <style> <content> <mechanism>
```

Three words, and **not one of them is a template**. Each family page prints the line it would
need; here is the whole grammar those eleven lines add up to. **Nothing below is implemented** —
Make's storage is another task's fence, and this is the spec it would need.

### 3.1 A fourth word: the template

```
Title: <template> <style> <type> <mechanism>

The Column:  magazine  tint   display  launch
Field notes: blog      plain  regular  launch
Walkthrough: screens   dark   regular  takeover
Console:     shells    card   compact  takeover
Q3 review:   decks     prim   display  swap
```

`template` ∈ `magazine blog screens shells decks columns layouts sections ui ux navigation`.
`type` ∈ `compact regular display`. Both are closed sets, both default when absent, and an unknown
word is ignored rather than fatal — the rule `read()` already follows.

`read()`/`write()` in `make/page.js` are the only two functions that change: two more
`words.find(...)` lines and two more slots in the joined string. `DEFAULTS` gains
`template: "columns"` and `type: "regular"` — `columns` because that is what every made page
already is.

### 3.2 What a single word still cannot carry

Four of the eleven need something the line has no room for. This is the real finding, and it is
why the proposal stops here rather than guessing:

| family | what is missing | shape it wants |
|---|---|---|
| Magazine | which ISSUE fills it | a **source**: `from mag:issue-01` |
| Blog | which SECTION's posts fill the wall | a **source**: `from blog:framework` |
| Screens | the per-hop choice between `full` (replace) and `fill` (join) | a **child modifier**, one per line of the tree |
| Shells | WHICH PARTS it declares (`head` `left` `right` `foot`) | a **part list**: `+head +left` |
| Decks | the CUT — `61.8 38.2` is the whole of a deck layout | a **share list** |
| Sections | which bands, in what order | a **child list**, which the tree already is |

Two of these — Screens' per-hop word and Sections' band order — are already expressible as
*children*, which Make's indentation says today. The other four want a `from <source>` clause.
The smallest honest next step is therefore:

```
Title: <template> <style> <type> <mechanism> [from <source>]
```

one optional clause, parsed off the end, ignored when the template does not use it.

### 3.3 What this does NOT propose

- **No change to where a made page is stored.** That is the persistence work's call
  ([`persistence.md`](/imagine/paging/doc/persistence.md)), and this grammar is the same string
  whether it lands in `localStorage` or on disk.
- **No new mechanism.** All four are unchanged; a template picks one, it does not add one.
- **No template registry in `core/`.** `families.js` is a list in one realm. If templates graduate,
  the registry moves; until then a new family is one entry in one array.

---

## 4. Proposal — one line in `Shell.css`

`Shell.css` keys its 3×3 grid on `.page.shell` (0,2,0), with a comment saying why: `.page` sets
its own `display: grid` and the shell has to beat it. The cost is that a shell's layout is
unavailable anywhere `.page` cannot go — and `.page` cannot go inside another page, because
`Page.css` hides `.page:not(.active-page, …)`. So the templates realm restates six declarations.

The change that would delete them, keeping the specificity that comment is about:

```diff
- .page.shell {
+ .page.shell,
+ .shell {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-rows: auto minmax(0, 1fr) auto;
      grid-template-areas: "head head head" "left main right" "foot foot foot";
      --shell-rail: 13em;
  }
```

A selector list keeps `.page.shell` at (0,2,0) for the case the comment names, and adds `.shell`
at (0,1,0) for a shell that is not a page. Nothing else in `Shell.css` needs touching — the parts
(`.shell-rail`, `.shell-bar`, `.shell-main`) are already single-class rules and already work
inside the miniature. **Not applied**: `shells/` is a fence for this task.

---

## 5. What was measured

- Every page in the realm at 1280 and 3440, headless: **zero console errors**, zero horizontal
  overflow, nothing framed or textual at x:0, no prose past the measure.
- The surface chip: `paging-plain` → `paging-dark` on the column body, background
  `rgb(38,38,38)`, `color-scheme: dark`, one navigation entry — no reload.
- The type chip: cover title 34.2 → 42.8 → 57.7px across the three words, with the change caption
  reporting it ("typography: regular → display. The box grew from 773px tall to 902px").
- The theming wall: fifteen cells at 3440 in one screen; four tracks still fit at 1280.

## 6. What is left open

- **The hub leaves ~750px of the row empty at 3440.** It is `large` (28–64em) because its
  children open beside it, and `fill` on a page whose children open beside it squeezes them to
  their floor (the `layout` skill records the Research front doing exactly that). The columns row
  paints its own empty slots; widening the hub would trade dead space for an unreadable measure.
- **Seven of the eleven families are smaller than the four the owner named** — one example on the
  card, one on the page, and a linked member list. That was the brief's own priority order.
- **`templates` is wired into `/imagine/paging/`'s `children:` by this task** (one word). Nothing
  crawls, so without it the whole realm 404s; `paging/page.js` is otherwise another task's file.
