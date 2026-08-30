`demo.source(src, label, file)` is the code, open, in a named block under (or
beside) the render. `src` may be a function (stringified — the lesson) or a plain
string, for code a page assembled rather than ran.

## ⚠ It was a `<details>` until 2026-08-30

For a year it opened **closed**, on the reasoning that a leaf page shows the
thing first and answers "how" only when asked. In practice every caller that
mattered wrote `.attr("open", "")` straight after it — `demo.exhibit()` did, and
so did all nine `/web/` guide pages — which is a disclosure nobody ever wanted
disclosed, the worst of both. Code beside a render is half the lesson; an aside
is what a caption is for. demo-merge step 2.

Both `demo.source()` and `demo.source.file()` are now two-line doors into
`source_block(label, body, file)` in `demo.js`, and `page.demo()`'s peer column
is the **same block** — so there is exactly one code surface on the site and the
shell's code cannot drift from a leaf page's.

## Two functions, not one parsed signature

`demo()` itself parses its arguments by type (`args.findIndex(is.fn)`) because
label, caption and options are distinguishable that way. Here they aren't: the
function form is `(fn, label)` and the file form is `(meta, url, label)`, and
both collide on "the second argument is a string." So the file form gets its own
name, `demo.source.file` — the same split `md.file()` / `code.file()` already
make — rather than one function guessing which shape it was handed.

⚠ `demo.source.file` doesn't get its own API page: `Doc`'s member lookup only
resolves `subject[name]`, never `subject[a][b]`, so it's documented here instead.

## The copy button reads the rendered `<pre>`, not the function

It fetches `$source.el.querySelector("pre")?.textContent` at **click time**, not
the value that was passed in. `demo.source.file` fetches its text asynchronously,
so there's nothing to hold onto until it lands — reading the DOM instead means
what gets copied can never drift from what's actually on screen, including for
the fetched form.

## ⚠ The file-fetch fallback builds its `<pre>` before the `await`

When `ext/highlight`'s `code.file()` isn't loaded, `source_file()` in `demo.js`
constructs a bare `<pre>` with `capture: false` and only sets its text *after*
`fetch()` resolves. That's deliberate — a factory call after an `await` lands
wherever the captor has drifted to by then, so the `<pre>` has to exist first —
and both failure modes (bad status, dead network) become text inside that box
rather than an unhandled rejection.

## Improvements

1. **No timeout on the fetch fallback.** A hung network leaves the header
   permanently reading "Source" with an empty block under it — not wrong, but a
   spinner-less wait with no upper bound. *(simple, speculative.)*
2. **`copy_btn`'s 1400ms "copied" state is a magic number with no name.** Small,
   but it's the kind of literal that's easy to duplicate instead of reuse if a
   second copy button is ever added elsewhere. *(simple, speculative.)*
