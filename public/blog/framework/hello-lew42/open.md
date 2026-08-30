# Built in the open

Every change to this repo opens a task first: a folder with an append-only `.jsonl` log that
gets a line whenever something is decided, written, or verified. The board reads those files
live over a socket — no reload — so what you are looking at is the work happening, including
the task that wrote the post you are reading.

<figure class="blog-exhibit">

[![The task board: seven active tasks, each with a progress bar, a current step and the model
running it](board.png)](/framework/ai/)

<figcaption>The board at the moment this part was written. <code>post-hello</code>, second
row, is this post. <a href="/framework/ai/">The live board</a> · the long version is
<a href="/blog/ai/dashboard/">The AI dashboard</a>.</figcaption>
</figure>

I did not build that to be impressive. I built it because a lot of this site is written by
agents working in parallel, and I needed to see what six of them were doing without reading
six transcripts. The steps are the proposal outline, so the progress bar cannot disagree with
the plan; the outcome line at the bottom is the report. Same idea as the rest of the
framework: the data is the interface, and there is one copy of it.

## The CSS is layered, once

Four layers — `base theme site util` — declared in exactly one place, and every rule on the
site sits inside one of them.

```css /framework/framework.css
@layer base, theme, site, util;
```

That single line replaces the specificity arms race. A utility class wins because it is last
in the order, not because someone stacked selectors; a theme is a class on a `div`, so
swapping one word reskins the site with no component edited. It costs one rule of discipline
— a stylesheet that forgets to restate the layer list appends itself past `util` and quietly
wins everything. [The four layers, live](/framework/styles/layers/) · [the whole
vocabulary](/framework/styles/).

## What's next

The layout work is the live edge: [the generator](/framework/core/Page/generator/) draws page
trees against measured rules, and [/imagine/](/imagine/) is where the shapes get tried before
anything comes back into core. On the roadmap: content that is editable in the browser
without adding a backend, and finishing the [component tier](/framework/ui/).

Start anywhere — [the framework overview](/framework/), [Start here](/framework/start/) for
the tour, or [the rest of the posts](/blog/). Every claim on this site has a page you can
open; if one doesn't, that is a bug.
