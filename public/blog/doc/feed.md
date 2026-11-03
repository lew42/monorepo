# The feed, and how long a post is

Two things `meta.mjs` writes besides the meta shells, both derived from `posts.js` and
both committed: **`feed.xml`**, the Atom feed, and **`words.js`**, one word count per
post. Neither is a build step — you run `node public/blog/meta.mjs --write`, and the
output ships as files.

## The feed

[`/blog/feed.xml`](/blog/feed.xml) — Atom 1.0, six entries, newest first.

Every stamped `index.html` carries the autodiscovery line, so a reader's *subscribe*
button lights up on a **post**, not only on the front:

```html
<link rel="alternate" type="application/atom+xml" title="lew42 blog" href="https://lew42.com/blog/feed.xml">
```

### Atom, not RSS 2.0

One reason, and it is the dates. Atom wants RFC 3339 — `2026-08-30T00:00:00Z`, which is
the manifest's own `2026-08-30` plus a constant. RSS 2.0 wants RFC 822 (`Sat, 30 Aug 2026
00:00:00 GMT`), and building that means `new Date(post.date)` — the exact call `posts.js`
refuses, because a bare `YYYY-MM-DD` parses as **UTC midnight** and prints as the day
*before* in every American timezone. A published date off by one is a bug a reader can
see; here it is a string concatenation that cannot drift.

### Summaries, not full content

`<summary>` is the manifest's `description`. Putting the whole post in `<content>` would
mean rendering markdown to HTML in node — a dependency the site does not have and would
not run in the browser. A summary feed is valid Atom, and it is the shape a reader clicks
*through* rather than reads inside their reader. If full content is ever wanted, the
markdown renderer is the cost, not the feed format.

### Watch out

- **`express.static` serves `.xml` as `application/xml`,** not `application/atom+xml`.
  Every reader sniffs the root element, so this is cosmetic — but it is why the `<link
  rel="self" type="application/atom+xml">` inside the feed matters: it is the only place
  the feed states its own type.
- **The rail's link sets `target`,** which is what keeps the Router's hands off it
  (`Router.link_clicked()` returns null for any anchor with a `target`). Without it the
  app would try to walk to a page called `feed.xml`.
- **`<updated>` on the feed is the newest entry's,** never "now". A timestamp that moves
  when nothing was published is what teaches a reader to stop polling.

## The sitemap

[`/blog/sitemap.xml`](/blog/sitemap.xml) — the site root, the blog root, and every
published post, `<lastmod>` from the manifest's own `date`. Same argument as the feed one
size down: a crawler that has no idea what Atom is still finds every url, generated and
committed rather than served at runtime.

## The word counts

`words.js` is generated — one number per post, so a card can say *4 min read* without
fetching six markdown files to find out. `posts.js` turns a count into minutes at
**220 wpm** (the middle of the usual 200–250 for screen prose, nudged down because these
posts are half code listings), and the rate lives there because it is the only judgement
in the whole thing. The counts are facts.

### What counts as a word

A token with a letter or a digit in it, after four strips:

| stripped | why |
|---|---|
| ` ``` ` fence markers | their *contents* stay — you read a code block, slowly |
| `<figure>` `<figcaption>` tags | the tags, not their text; a caption is read |
| `![alt](x.png)` entirely | **an image's alt is not read** |
| a link's `(url)` | its text is |

The alt rule was the one this got wrong first. Counting `![…](x.png)` like a link put 113
words of alt text into `/blog/systems/panel-playground/` — four figures with a sentence of
alt each — and its stamped count came out **21% over** the words the rendered page shows.
With alts dropped, five of six posts land inside **0.6%** of a headless count of
`.blog-prose`'s own `innerText`, and the worst is 5.6%.

### Watch out

- **`words.js` is imported by `posts.js`, which `meta.mjs` imports** — delete it and
  `meta.mjs` will not start. The error names the file; regenerate by restoring an empty
  `export default {}` and re-running.
- **A zero count reports itself.** A post whose `.md` files the generator cannot find
  prints `⚠ 0 words <slug>/` rather than shipping a card that quietly stopped saying how
  long the post is. That is how the `hello-lew42` parts trap was found —
  [file structure](/blog/doc/structure/).
- **A post with no count draws nothing**, never *0 min read*.

## The reading path

Not generated, but the same argument: [`Post.next_up()`](/blog/Post.js) puts the next
**part**, else the next **post**, else the front at the bottom of every post's prose. The
order is `listed()`'s and the parts' is the manifest's, so adding an entry re-links the
chain on both sides of it and nothing on a post says what follows it.

**A part also gets its previous neighbour**, `prev_part()` mirroring `next_part()` — null
on the first part rather than a fake "back to nothing" link. Both hops draw with the same
`.blog-next-link` markup, side by side in a `flex gap wrap` row (`.flex-1` on each), so a
single hop still spans the whole measure and two wrap to a stack under it at 400 — nothing
new in `blog.css`.

Two things it has to do that are not obvious:

- **The box is created during `render()` and filled in `after_prose()`.** `read()` returns
  a *promise* for a single-part post, and `View.append_promise` appends whenever it
  resolves — so anything built synchronously after it lands **above** the prose.
  `el.append` on a node already in the tree is a move, which is what puts it back at the
  end, idempotently.
- **It is rebuilt every `after_prose()`,** which parts also fire on `activated` and
  `deactivated`. Moving between parts does not re-run `content()`, so a footer drawn once
  would still be offering part two from part three.

It is capped at `--measure`, not at the read column: `.blog-read` is `flex: 1 1 40em` and
takes everything the rail leaves — 2900px at 3440 — so an uncapped block there is a
2900px-wide link with four words in it.
