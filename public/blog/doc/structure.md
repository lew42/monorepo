# File structure

The shape a person hand-adding a post has to hold in their head: **one entry, one
two-line file, one markdown file per part.**

```
public/blog/
    posts.js          THE MANIFEST — the sections, and every post's title, date, description
    Post.js           Post extends Page — reads the manifest, lays out for reading
    Section.js        Section extends Page — a section index, also two lines to use
    page.js           the shell (rail + region) AND the magazine front
    blog.css          the front and the reading layout
    meta.mjs          stamps each index.html from the manifest (run by hand)
    index.html        the blog's own meta shell
    readme.md  doc/

    framework/
        page.js       export default new Section({ meta: import.meta })
        index.html    generated
        how-this-blog-works/
            page.js       export default new Post({ meta: import.meta })
            index.html    generated
            lead.png      the og:image, and (lead: true) the picture at the top
            meta-tags.md      part 1  ->  /blog/framework/how-this-blog-works/meta-tags/
            reading-page.md   part 2  ->  /blog/framework/how-this-blog-works/reading-page/
        hello-lew42/
            page.js  post is in parts, so its page.js declares them
            no-build.md  pages.md  open.md  *.png

    systems/   ai/    the same shape
```

A single-part post is the same with one `post.md` and no `parts:`.

## Why a post lives under a section

`/blog/<section>/<post>/`, never `/blog/<post>/`. A flat url has no ancestor, so the
section in the rail could never light up as `in-path` — **the file structure IS the
active state**, and both marks are `Router.mark_links()`'. [The front](/blog/doc/front/)
has the table.

## Why the metadata is in one manifest, not in each page.js

The front needs every post's title and date. If posts were declared as `children`, it
would import all six post modules — and run every markdown fetch in them — to print a
list of links. The homepage documents this exact trap for its `sections` array. So
`posts.js` is **data only**, and a `Post` looks *itself* up in it by its own directory:

```js
constructor(...args){
	const seed = Object.assign({}, ...args);
	const path = under_blog(seed.meta).join("/");        // "framework/hello-lew42"

	super(post(path) ?? Post.unlisted(path), ...args);
}
```

`Section` does the same with `under_blog(meta)[0]`. The entry goes in **first**, so later
args still win and a `page.js` can override one field without the manifest stopping being
the default. It has to happen in the constructor because `Page`'s own constructor runs
`naming()` and `declare()` — both of which need `title` and `parts` already assigned.

Sections **are** declared (`children: "framework systems ai doc"`) — three modules that
import nothing but the manifest. Posts are not, and they still route: `Page.child()`
probes the filesystem for a name it does not know. The manifest is what *links* them,
which is the part that actually matters — nothing on this site crawls.

**An entry commissions a post.** Its directory may not exist yet; every reader of the
manifest treats it as a list of links, so a half-written post is one card that 404s and
never a broken front. `meta.mjs` reports it as `pending` and refuses to create the
directory.

## Ordering

`listed()` sorts by `date` descending, so appending an entry is enough; the array's own
order never matters. Dates are strings, never `Date` objects — `new Date("2026-08-30")`
is UTC midnight, which is the previous day in every American timezone, and the byline
would be off by one for half the readers.

The front's lead is `featured: true` on one entry, or the newest post. ⚠ Not `lead:` —
that means something else (draw the picture at the top of the post), and a `lead` field
would silently shadow the `lead()` method, which is the trap `opens` sprang in core.

## Multi-part posts

`parts: { "<file stem>": "<Part title>" }`, in reading order. Each key becomes a real
child `Page` at `/blog/<section>/<slug>/<key>/` whose content is `<key>.md`.
`Post.declare()` is the whole of it — six lines, run before `Page.declare()` turns the
list into children.

It can be written in the manifest **or** in the post's own two-line `page.js`, and the
page.js wins (later args). Beside the `.md` files it names is often the better place;
nothing outside the post reads it.

The parts mount in the post's own `$pages` region (`Page.container()` walks up for the
nearest one), so **the head and the rail stay put and only the prose swaps**.

Part one is marked `default`, the arrangement contract's own word for *shown without
being routed to*, so `/blog/<section>/<slug>/` opens part one instead of showing a table
of contents. Two consequences, both of which bit during the build:

- **A default page is never routed to, so nothing builds it.** The host has to, and has
  to hand it `app` while it does — `Post.read()` calls
  `part_default().assign({ app: this.app }).render()`. `Page.render_column()` documents
  the same trap for columns.
- **`@layer util` exempts `.default` from hiding but never hides one**, so a default
  part and a routed part are both on screen until something says otherwise. `blog.css`
  restates Page.css's columns rule for this region — one line, and the pair has to stay
  in step.

## The trap that ate every single-part post

```js
div.c("blog-read", () => { this.head(); this.read(); });     // ⚠ WRONG
div.c("blog-read", () => { this.head(); return this.read(); });
```

A block-bodied arrow inside a factory **must return**. `read()` hands back the promise
`md.file()` returns, and a promise the callback drops is never appended: no error, no
404, an empty column. It was invisible for a whole build because the only post that
existed was multi-part, and a multi-part `read()` renders a child `Page` — which appends
itself to the captor as a side effect and needs no return at all.

## Why not the column system for parts

`Page.columns()` was the other candidate and is the wrong shape here: a column is a
16–40em scroller with a sticky head, which is a browser, not a reading page. Two or
three parts of prose want the full measure and one scroll position, not a Finder. The
columns vocabulary stays where it is good — indexes and browsers.

## Alternatives considered

- **Front-matter in the `.md` files.** Reading it means fetching every post's markdown
  to build the front, which is worse than importing the modules.
- **Per-post `page.js` config, the front imports each.** Costs the import; and the
  strings would then live in the page *and* in the generated `index.html`, so the
  manifest would have to exist anyway for `meta.mjs`.
- **A `.md` file with no directory** (`/blog/x/` renders `/blog/x.md`, which core
  already supports for free). Genuinely simpler — and it cannot carry an `index.html`,
  which is the whole point of the exercise.
