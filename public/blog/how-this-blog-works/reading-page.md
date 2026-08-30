# The un-centered reading page

A 40em measure is the right width for reading and the wrong width for a 3440 monitor.
Center it and two thirds of the screen is empty, symmetrically, on purpose. It reads
as a page that failed to load.

## Stop centering, start spending

The prose does not move. It starts at the left gutter, stays 40em wide, and never
re-centers when something else appears — so the eye returns to the same left edge on
every line at every window size. What changes is what happens to the *right* of it.

<figure class="blog-exhibit">

```css /blog/blog.css
.blog-prose {
	display: grid;
	grid-template-columns:
		[read-start]    min(var(--measure), 100%)  [read-end]
		[exhibit-start] minmax(0, 1fr)             [exhibit-end];
	column-gap: var(--blog-gap);
	align-items: start;
}

.blog-prose > *                { grid-column: read; }
.blog-prose > .blog-exhibit    { grid-column: exhibit; }
```

<figcaption>The whole layout. Everything is prose unless it says otherwise, and
anything that says <code>blog-exhibit</code> — this listing included — takes the space
beside the paragraph it follows.</figcaption>
</figure>

The anchoring is free. Both tracks are *definite* columns, so grid auto-placement
only ever moves its cursor forward: a paragraph takes row *n* column 1, an exhibit
written straight after it finds row *n* column 2 still empty and lands beside it, and
the next paragraph sends the cursor back to column 1, which is what starts row *n+1*.
No ids, no measuring, no JavaScript.

## What earns the right side

Three things, in order of how often they show up.

**Exhibits.** Screenshots, demos, code listings, tables — everything a post about
software actually wants to show. A screenshot of a 3440 screen is 3440 pixels wide;
the track lets it be. A code listing beside the paragraph explaining it is the reason
you were reading the paragraph.

**A rail.** Fifteen ems pinned to the right gutter, holding this post's parts and its
headings, with the section you are reading marked. It is always there, so the right
edge of the window always has something on it — which is what keeps a post with no
figures from looking abandoned.

**The gutter.** What is left is the same `--gutter-x` every other page on the site
pays. On a 3440 screen the ink now reaches within about 80px of the right edge instead
of stopping 1400px short.

## Down to 400

Nothing here is a media query on the window. The rail is the framework's own `.rail`
word, and `Page.css` already turns any rail into a full-width strip when *its row* —
not the window — drops below 38em. The prose grid's second track is
`minmax(0, 1fr)`: at 400 it is a few pixels wide, exhibits fall back into the reading
column, and the page is one honest column of text.

The three sizes are one layout with one breakpoint, and the breakpoint measures the
box it is styling.
