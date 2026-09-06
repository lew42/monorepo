# core/Layout

**Thirty arrangements you can browse, each proven at seven widths.** A *layout* is the
arrangement of boxes — named slots, a width range it is proven at, and the rules about where
it may go. **It owns no content.** What you see inside one on the site is a *fixture*, poured
into its slots, and that is the whole test: a shape that only looks right with particular
content is a draft page, not a layout.

Open [/framework/core/Layout/](/framework/core/Layout/) and click around. One column first.

## Use

- **Pick one by name.** Every layout page opens the layout at its narrowest proven width with
  a handle to drag, and seven widths beside it showing how it responds.
- **Read the props off the page.** `layout.columns`, `layout.widths[0]`, `layout.tags` — plain
  page props, which is why the tree's filters need no schema and no registry.
- **`check(layout, box)`** (`rules.js`) — the three deny rules, dev only, a visible warning and
  never a block.
- **`prove(layout, width)`** — the eight stress fixtures at one width. It is the button on
  every layout page, and it is what writes `approved:`.

## Watch out

- **Content scale follows the box.** *Small columns never get large content; a massive
  container is careful with tiny content and how it lays out.* We make this mistake too
  often. Before placing anything, say the box's width range and the content's natural range
  in one line — if they do not overlap, the placement is wrong before any CSS is.
- **Some boxes grow and some cannot.** `grows: true` is a stack and content length can never
  break it. `grows: false` is a bounded box — a hero, a viewport-height band, an inner-scroll
  rail — and it must ALSO say what happens to content longer than it: `overflow: "scroll"`,
  `"clip"` or `"truncate"`. **A bounded layout that says nothing is a draft.**
- **A layout is proven for a RANGE.** Above its ceiling it holds and centres, never scales up.
  Below its floor it stacks to a named 1-column `fallback`, and the fallback is the thing being
  judged there.
- **Wrapping layouts misalign at awkward counts.** A layout that says `wraps: true` is proven
  at 1 · 2 · 3 · 5 · 7 items at every width. Walls take `grid auto-fill` (columns stay aligned,
  the last row left-aligns); `flex wrap` is for a row of controls, where raggedness is the point.
- **`decl`, never `rules`.** `rules` here means LayoutRules. The CSS declarations are `decl`.
- **`room` is not a page width.** `Layout.words()` is overridden to do nothing, because core's
  `words()` aliases `room` onto `width` and every layout page would otherwise stamp `page-w-page`.
- **`page-layout-` is the namespace.** `layout-` belongs to `ext/layout`, which is a live
  control surface with twelve importers and is not this module's rival.

## The props, one line each

| prop | what it says |
|---|---|
| `columns` | 1 · 2 · 3 · 4 ("four or more") — the band it lands in |
| `room` | which of the five framework words it compiles to: `page` `rail` `wall` `stage` `solo` |
| `widths` | `[floor, ceiling]` — the range it is PROVEN at; the floor is where the viewport opens |
| `fallback` | the 1-column layout it becomes below its floor |
| **`grows`** | **`true` — a stack: content length can never break it. `false` — a bounded box, and then `overflow` is required.** |
| **`overflow`** | **what happens to content longer than a bounded box: `"scroll"`, `"clip"` or `"truncate"`.** |
| `wraps` | the track count follows the room, so it gets the 1 · 2 · 3 · 5 · 7 item fixtures |
| `tags` | facets, from [/imagine/design/vocabulary/](/imagine/design/vocabulary/) |
| `slots` | name → fixture kind, derived from `boxes` |
| `accepts` · `allowed_in` | what may go inside it, and what it may go inside. Both default to `"any"` |
| `denies` | the deny list. Three rules exist and most layouts use none |
| `approved` | the date the fixtures last passed at every strip width — or nothing, and it is a draft |

## More

- [Props](/framework/core/Layout/doc/props/) — every prop in full, and why each one is a plain page prop.
- [The rules](/framework/core/Layout/doc/rules/) — three deny rules, and the line-by-line argument for what CSS already answers.
- [Fixtures and approval](/framework/core/Layout/doc/fixtures/) — the eight runs, what the checker reads, and what "approved" means.
- [The port](/framework/core/Layout/doc/porting/) — where the thirty came from and the five things that changed on the way.
- The plan this is slice A of: `ai/2026-09-06/layout-study/plan.md`.
