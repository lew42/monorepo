# Templates — eleven whole page shapes, each drawn by its own real machinery

A **template** is a whole page shape you can start from; pick one, and the page you make wears
it. The rest of [`/imagine/paging/`](/imagine/paging/) is about ONE box — what a click does to
it, what surface it wears. This is the rung above: the shape of a whole page, already built and
already in use somewhere on this site.

Live: [/imagine/paging/templates/](/imagine/paging/templates/) — eleven cards, each with a small
live example. Open a family and the same example is bigger, with chips over it.

## Use

```js /imagine/paging/templates/<family>/page.js
import { Template } from "../templates.js";
import { family } from "../families.js";

const it = family("magazine");

export default new Template({
    meta: import.meta,
    title: "Magazine",
    width: "large",
    axes: "style type layout",     // five surfaces, three type scales, four widths
    family: it,                    // what it says AND what draws it — families.js
    takeaway: it.what,
});
```

Everything a family page says and draws lives in one entry in
[`families.js`](/imagine/paging/templates/families.js), so its sentence and its picture cannot
drift apart. A `Template` is a [`Paging`](/imagine/paging/) with two additions: the box holds the
family instead of the teaching sample, and there is a sixth chip group — `compact` `regular`
`display`.

## Nothing here is a copy

Every example is the family's own module, imported read-only from where it lives. Change one of
those modules and the picture here changes with it.

| family | what actually runs |
|---|---|
| Magazine | `mag.column()` · `contents.previews()` · `Article.preview()` |
| Blog | `Post.hero()` · `section.content()` · `Post.wall()` |
| Screens | `area()` · `frames()` from `screens/screen.js` |
| Shells | a real `Shell` — `rail()` `bar()` `main()` `nav_links()` |
| Decks | `region()` `quiet()` `statement()` `notes()` |
| Layouts | `shape()` from `styles/layouts/preview.js` |
| Sections | `hero(tone)` `stats(tone)` — the surface chip picks the tone |
| UX | `new Pagination(…)` · `new Tags(…)` |

## Watch out

- **`.blog-hero` is an inline-size container that also says `align-self: start`.** In a flex
  column those two meet and the hero measures a few px wide — it set its own title one character
  per line. `.templates-blog > .blog-hero { align-self: stretch }`, and it has to out-specify
  `.blog-hero`, because `blog.css` loads *after* this sheet.
- **A `cqw` heading cannot be moved by an inherited `font-size`,** so the type chip re-floors the
  four display headings itself: [`doc/templates.md`](/imagine/paging/doc/templates.md).
- **`Shell.render()` cannot run inside a page** — it stamps `hides-nav` and attaches a window
  keydown listener. The mini shell calls the shell's own parts and restates the 3×3 grid; the
  one-line change to `Shell.css` that would delete that restatement is a proposal, with the diff:
  [`doc/templates.md`](/imagine/paging/doc/templates.md).
- **Importing `blog/Post.js` is safe** (the paging readme still says otherwise). Every
  `.page-previews` rule in `blog.css` is scoped — `.blog-magazine >` and `.page.blog-section >` —
  so the sheet cannot re-size a wall it does not own. Checked 2026-09-05.
- **Make cannot say any of these words yet.** Every family page ends with the one line Make
  would need and what is missing from it: [`doc/templates.md`](/imagine/paging/doc/templates.md).

## More

- [`doc/templates.md`](/imagine/paging/doc/templates.md) — which family's machinery is imported
  from where, the type axis, and the Make proposal in full
- [Theming](/imagine/paging/templates/theming/) — the same template under five surfaces × three
  type scales, in one screen, with the token named beside each
- Files: `templates.js` (the `Template` class, the type axis, the hub card) ·
  `families.js` (the eleven entries and every real import) · `templates.css` ·
  `page.js` (the hub) · one `page.js` per family · `theming/page.js`
- Where it sits: [Paging](/imagine/paging/) · [Make](/imagine/paging/make/) ·
  [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns.md)
