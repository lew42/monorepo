# Dates are data, not structure

`/content/blog/2026-08-03-the-capture-boundary/` has five segments. Two of them
are structure — `content`, `blog` — and the rest is a database row that happens
to be spelled with hyphens.

The filesystem router cannot tell the difference. Every url segment is a
directory, every directory wants a `page.js`, and a blog with two hundred posts
wants two hundred directories holding two hundred nearly identical modules.

## Three ways to own the segment

**A directory per post.** `blog/2026-08-03-x/page.js` exports a Page whose
content is the sibling `.md`. It works, it is boring, and it scales badly in a
specific way: the index cannot show a title without importing the module, so
either you hand-type the index or you import all two hundred to draw a list.

**`route()` over a manifest.** The blog page claims any name it recognises:

```js
route(name){
    const p = post(name);
    return p && { title: p.title, content(){ return md.file(import.meta, name + ".md", { h1: false }); } };
}
```

Zero directories, one module, and the index gets titles and dates from the same
manifest that answers the route. Measured: `/content/blog/` costs two module
fetches (`/page.js`, `/content/page.js`) plus `/content/blog/page.js` and
`posts.js` — four total, and it stays four whether there are six posts or six
hundred. Reading one post adds exactly one `.md`.

**Both.** These do not conflict, and the reason is worth stating precisely.
`child(name)` reads the `children` map first:

```
children.get(name)  ->  a Page     use it
                    ->  null       declared: import it
                    ->  undefined  never declared: route() may claim it
```

`route()` runs only for names that were **never declared**. So a post that
outgrows markdown — one that wants a chart, a form, a live demo — gets a real
directory and a real `page.js`, and you opt it in by adding its slug to
`children`. Everything else stays in the manifest. No branch, no flag, no
registry: the declaration *is* the switch.

## Why not the filesystem first

An earlier draft tried the import first and fell back to `route()`. Every
dynamic url then paid a doomed 404 before being claimed, which on a blog is
every url. The mirror image — check `route()` first — lets a greedy route
silently shadow a real file, and a file you wrote is a file you meant.

Declared-then-dynamic gets both: no wasted request, and no shadowing.

## The sort key you get for free

An ISO date at the front of the slug means the url sorts chronologically as a
string, which is why `chronological()` is a `localeCompare` and not a
`Date.parse`:

```js
[...posts].sort((a, b) => b.date.localeCompare(a.date));
```

It also means a reader can truncate the url in the address bar and get something
meaningful — except that they cannot, because `/content/blog/2026-08/` is not a
declared child and no `route()` claims it. Date-prefix urls *look* hierarchical
and are not. If you want `/blog/2026/08/` to work, that is three levels of
`route()` returning pages that list the level below, and it is a real amount of
code for a navigation almost nobody uses.
