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
.blog-prose { display: flow-root; }

.blog-prose > *:not(.blog-exhibit) { max-width: min(var(--measure), 100%); }

.blog-exhibit {
	float: right;
	clear: right;
	width: calc(100% - min(var(--measure), 100%) - var(--blog-gap));
}
```

<figcaption>The whole layout. Everything is prose unless it says otherwise, and
anything that says <code>blog-exhibit</code> — this listing included — takes the space
beside the paragraph it follows.</figcaption>
</figure>

It is a float, and that is a measurement rather than a preference: the first version
was a two-column grid. In a grid the two columns share a *row*, so a figure taller
than the paragraph next to it sets that row's height and the following paragraph
starts below the **figure** — a 300px hole in the reading column at every exhibit.

A float is out of flow. The prose runs unbroken down the left at exactly its measure,
and because the text and the figure never overlap horizontally, the paragraphs' line
boxes are not shortened either. They simply do not know the figure is there.

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
not the window — drops below 38em. One container query of my own stops the exhibits
floating below 84em, which is the width where the space left over would be under 24em
and a 300px code listing is worse than a full-width one. Below that the post is one
honest column of text.

The three sizes are one layout with one breakpoint, and the breakpoint measures the
box it is styling.
