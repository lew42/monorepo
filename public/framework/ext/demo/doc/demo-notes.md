# demo — notes and design reasons

## CSS import for Page.class.js

The import of `../../core/Page/Page.class.js` is the loading edge for Page.css's opt-out track names (`.page.standard > .demo.quoted`), not an annotation. The CSS opt-out reads these track names, so the import must come first.

## Main demo() API documentation

demo — show the code, run it, and let the reader push it around. One box.

Examples:

```javascript
demo(() => {
    div.c("card", () => {
        h1("Title");
        p("Body");
    });
});

demo("Label above", () => { … });
demo(() => { … }, "Caption below the result.");
demo(() => { … }, { html: true });      // the HTML pane open from the start
demo(() => { … }).ac("stack");          // never put the panes side by side
demo(() => { … }).ac("quoted");         // a quoted aside — stay on the measure
```

The two halves also stand alone:

- `demo.stage(fn).ac("bleed")` — the render, full-bleed, no chrome
- `demo.source(fn)` — the code, open, in a named block

A demo PAGE is `page.demo()` — one shell, in shell.js. `demo.page()`, `demo.tree()`, `demo.exhibit()` (exhibit.js) and `demo.layout()` (layout.js) are `children:` factories over it: page SHAPES, not a fifth way to draw a demo.

Strings before the function label the box; strings after caption it. The caption is the important one: a doc page leads with code, and the sentence that explains it reads *after* you've seen it.

The source is `fn.toString()`, so the code you read is literally the code that ran. The function runs with the `.demo-render` as captor, like any capture fn, so examples are written exactly the way real page code is written.

### Viewport caveats

The stage is a DIV: a `@media` query inside an example reads the real browser viewport and will not move with the handle. See stage.js, doc/record.md §6.

A demo is an exhibit, so the box carries `wide` and leaves the reading measure on its own — the doctrine lives here rather than on thirty pages. See doc/record.md §14.

### Design record

See readme.md and doc/record.md for the long form.

## Error handling

Demo errors are visible and non-fatal, like md-error: a broken example shouldn't take the page down, but it must not fail silently either.

## Bar construction

The bar is placed now, filled last: its controls point at things further down, and `append(fn)` re-establishes the captor.

## Background visualization

The `checkered` stage background lets you tell whether what rendered painted its own background — an unpainted box shows the board through (framework.css).

## Promise handling

One function, so the button and the `html: true` flag cannot disagree. Read on SHOW: a demo whose content arrives from a promise has not finished building when demo() returns, and a click is always later than that.

## Full-size control

A LINK, and only when the page claims `<url>full/` via `route()`, so a reload lands back on it. Filling the window is the stage's own control now — one strip below this one, and it has the render, not the box. See styles/layouts/full.js.

## demo.stage(fn, steer) — full API

The stage on its own: its strip, the resizable box and the width readout, with no code pane and no border. This is a leaf demo page's entire render; it carries `wide` like any exhibit, and `.ac("bleed")` is what takes it the rest of the way to the window's edge.

`steer`, if given, is handed the render — the box a toolbar over this stage points at. `demo.exhibit()` is the caller that has one (exhibit.js).

The pieces are stage.js's, strip included; `demo()` above composes the same ones.

## source_block(label, body, file) — full API

THE code surface on the site. A named header (the file, a link to the whole of it, a copy button) over an open block.

### Why not <details>?

It is not a `<details>` any more. It was, for a year, and every caller that mattered wrote `.attr("open", "")` straight after — a disclosure that is always disclosed, which is the worst of both. Code beside a render is half the lesson, not an aside. `page.demo()` draws its peer column with this, and so does every `demo.source()` below, so there is exactly one of them. demo-merge step 2.

### File parameter details

`file` sometimes arrives as `this.file` off a Page — and every Page already has a `file(name)` METHOD of its own (Log.js, the jsonl log), which `this.file` reads instead of a caller's config when that config never set one. A string is a real path; anything else is that method (or nothing), so it gets no link rather than a crash.

## demo.source(fn, label, file) — full API

The code, open, under a render.

Examples:

- `demo.source(hero)` — the header reads "Source"
- `demo.source(hero, "The whole page")`
- `demo.source(tree, "Source", "/x/page.js")` — + the whole file, one click away
- `demo.source(template, "Source")` — a STRING, already built
- `demo.source.file(import.meta, "hero.js")` — the header reads "hero.js"

What prints is the FUNCTION, which on a demo page is the lesson; the third argument is the file it lives in, for the reader who wants the imports too. A string prints as-is, for code a page assembled rather than ran.

Two doors into `source_block()` above — never a second shape.

## copy_btn

The source block is the one place code is handed over, so the copy button rides it rather than living beside a second code block (ui/parts.js had one).

The reading at click time (not the function) is necessary because `demo.source.file` fetches, so there is nothing to hold until it lands. Copying what you can see cannot drift from it.

## file_link

Opens a real file path, not a route. The `target` attribute is load-bearing: the Router ignores a link that carries one (`link_clicked`).

## btn

One toolbar control. Every button here is a toggle, and `.on` is the pressed state — the caller flips it, because the caller is what knows the state.

## caption(text)

The caption is prose, so it wants markdown — but demo/ must not depend on markdown/. Soft dependency instead: if ext/markdown has been imported it has patched View.prototype.md, so use it; otherwise fall back to the backtick pass.

### Caption layout

The caption has TWO elements, not one. Inside a `.demo` the caption is the box's last STRIP — tinted, hairlined, and it has to reach both edges — while the sentence in it is prose and has to stay on the measure. One element could not be both: the `max-width` that kept the line readable also stopped the tint, at 45% of the box on a 3440 homepage. demo.css solves this in CSS.

## source_code(src, lang)

The same deal with ext/highlight: if it's loaded the source is highlighted, if not it's a plain code block, which is what this always was. The captor here is a <pre>, so code.js() returns a bare <code> — exactly the element this used to build by hand.

## source_file(meta, url)

The same soft dependency, for a whole file.

Both failure modes land in the box as text rather than as an unhandled rejection.

## Exports and composition

source() and dedent() moved to util/source — ext/highlight's code.fn() needs the identical transform. Re-exported here because that's where they've always been imported from.

The shell is for whoever composes one: exhibit.js and layout.js build demo PAGES out of these, and import them so the boxes cannot drift. One-way — those files import this one and patch `demo.*`.
