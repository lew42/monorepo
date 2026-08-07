# markup — design record

**question → options → weighing → verdict**.

---

## 1. Why a serializer at all — `innerHTML` exists

`demo()` needed a third pane: the HTML the example built. `innerHTML` is that
information, and it is unusable — one line, no indentation, and littered with the
whitespace text nodes a builder leaves behind. A reader comparing
`div.c("card", () => …)` against its output needs the shape, and the shape is
exactly what `innerHTML` throws away.

Options: pretty-print `innerHTML` as a string (a second HTML parser, in a repo with
no dependencies); walk the DOM (this); or don't ship the pane.

**Verdict: walk the DOM.** It is 60 lines, it cannot mis-parse anything, and it has
the property the pane is for — it reports what is *there*.

---

## 2. In `util/`, not in `ext/demo/`

`demo()` is the first caller and would have been a fine home. It is the wrong one
for the same reason `source()` is in `util/`: **a second caller was already
obvious.** An element reference wants "show me this element's markup", and if that
page reimplemented it, the same `div` would print two ways on one site.

`source()` set the precedent and the lesson: two callers agreeing on a transform
means one copy, in `util/`, imported by both.

---

## 3. When does an element get one line?

The interesting decision. `<p>Call <code>x</code> now</p>` wants one line;
`<div><p>a</p></div>` wants three, even though it is shorter.

- **Length alone** — wrong, per the example above.
- **Length plus a regex for block tags** — a regex over serialized HTML, which is
  the thing this file exists to avoid.
- **Ask the DOM: is every descendant phrasing content?** ✓

**Verdict: a phrasing-content whitelist, then a length cap.** `one_line()` returns
`null` — not a long string — the moment it meets a non-phrasing child, so "has to
break" and "is too long to keep" stay two separate questions. The cap (68 chars)
is a reading judgement and the only tunable number in the file.

### 3a. …and then both answers went down the same path

Keeping the two questions separate was worth nothing for a year, because a `null`
and a too-long string both fell through to the same line and got one child per
line. A sentence came out as a column of fragments:

```
<p>
  Plain HTML with
  <strong>no classes</strong>
  ,
```

The fix is to let the separation do its job: a run of phrasing content never breaks
structurally, however long — it **wraps**, filled to the same 68 columns, with the
open and close tags hugging the text.

The safety argument is the interesting part, and it is the same one that forbids
re-indenting a `<pre>`: **every break replaces a space that was already there.**
`wrap()` splits only at spaces outside a tag, and a newline is whitespace, so the
wrapped form and the one-liner collapse to the identical string. Breaking anywhere
else — or indenting the content onto its own line, which adds whitespace inside the
element — would be a serializer whose output renders differently from its subject.

The whitelist is the same idea as `ext/markdown`'s `block_tags` and
`ext/highlight`'s `block_parents`, inverted. Three copies of "which tags are
inline" now exist in this repo. **That is a real smell and the merge is not
obvious** — markdown asks "may I put a `<p>` here", highlight asks "may I put a
`<pre>` here", and this asks "does this child force a newline". The answers agree
today and there is no reason they must.

---

## 4. `pre` and `textarea` are copied verbatim

Whitespace is content in those elements — re-indenting a `<pre>` changes what it
renders. So they are emitted with `innerHTML` untouched, on one line, however long.
Ugly output for an honest reason, and the alternative is output that lies.

---

## 5. Nothing is escaped, anywhere

The trap. Every path to the screen escapes this text exactly once already:
`code.html()` hands it to `hljs.highlight()`, which escapes; a plain `code()`
appends it as a text node, which escapes. Escaping here as well produces
`&amp;lt;div&amp;gt;` on the page — visible, mildly baffling, and easy to "fix" in
the wrong direction.

**Verdict: the function returns text, and the renderer owns escaping.** Written at
the top of `attributes()` because that is where the next person will be tempted.

---

## 6. Kept: it reports classes you did not write

An `<a href="/framework/">` inside a demo serializes as
`<a href="/framework/" class="in-path">`, because `Router.mark_links()` really did
add that class. On a doc page it reads like noise, and the same demo shows
different HTML depending on the url you arrived at.

Filtering it was considered and rejected: a serializer that hides part of the DOM is
a serializer you cannot trust for the next question. It is also, on the Router's
own page, the best possible demonstration of what `mark_links()` does.

---

## 7. Open

- **Attribute order is document order**, which for a View is the order the chain
  wrote them — `div.c("card").attr("role", "note")` reads back as typed. Nice, and
  not guaranteed by anything.
- **No `<svg>` special-casing.** SVG children serialize as ordinary elements, which
  is correct but verbose; an inline icon is a wall of `<path>`.
- **The 68-char cap is a guess.** It reads well at the font sizes on this site and
  has no other justification. It measures the *content*, never the content plus its
  indent — deliberately, so it agrees with the one-line test, and because with a tab
  per level there is no character count to add: a tab is `tab-size` wide, and that
  belongs to whoever renders it (2 in a demo's html pane, 4 in a `pre.code-block`).
- **`wrap()` finds a tag by scanning for `<` and `>`.** An attribute value
  containing a literal `>` — legal, and vanishingly rare — would end the tag early
  and let a break land inside it. A real tokenizer is not worth it for a doc pane.
