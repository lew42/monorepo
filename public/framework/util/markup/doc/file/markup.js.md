One exported function, `markup(el, indent)`, and four private helpers behind
it: `node_markup`, `one_line`, `wrap`, `attributes`. 144 lines, no imports, no
state kept between calls.

## The shape: two functions that recurse into each other

`node_markup()` decides one node's line(s); `markup()` maps it over
`childNodes` and joins with `\n`. `one_line()` is the one that recurses back
into `node_markup`'s sibling `markup()` for a block child, and into itself for
a phrasing child — the mutual recursion is how `<p>Call <code>x</code>
now</p>` collapses to one line while `<div><p>a</p></div>` doesn't.

## `phrasing`, `voids`, `verbatim` — three sets, three different reasons

`phrasing` decides what *can* stay inline. `voids` (`<br>`, `<img>`, …) have
no closing tag and no children — a fact about HTML, not a style choice.
`verbatim` (`<pre>`, `<textarea>`, `<script>`, `<style>`) get their
`innerHTML` copied untouched because whitespace is content in them, and
re-indenting would change what they render.

## `attributes()` is where the escaping trap lives

Nothing here escapes anything — see the comment at line 134 and
[doc/design.md §5](/framework/util/markup/docs/design/). It is the shortest
function in the file and the one most likely to be "fixed" in the wrong
direction.

## Improvements

1. **No `<svg>` special-casing** — correct today, verbose for an inline icon.
   *(medium, speculative — see doc/design.md §7)*
2. **`wrap()` finds a tag by scanning for literal `<`/`>`**, so an attribute
   value containing a literal `>` would end the tag early. Vanishingly rare;
   a real tokenizer isn't worth it for a doc pane. *(large effort for a tiny
   payoff — not worth doing)*
