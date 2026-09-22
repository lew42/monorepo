## The record — 2026-09-17, the repeated anchor

### What the three posts are, and what was held still

One post, rendered three times, word for word identical. The eyebrow, the h1, the
standfirst, the three h2s and their paragraphs are the same string in all three, and they
all sit on the same `--surface` card. **The only difference is the treatment of the little
mark after each h2**: the accent (A), a muted grey (B), or an accent underline on an
otherwise ordinary ink (C). Anything else that differed between the posts would make the
comparison worth nothing, which is why the specimen text is a constant declared once in
`anchors.js` rather than three pieces of prose.

The marks say different things on purpose — a date, a count, a tag. That is the owner's own
point tested rather than asserted: what the mark says matters far less than that it repeats
in the same place, at the same size, in the same colour.

### The size: why the mark is the h4 level and not "half the h2"

The ask was for the mark to be "very small, half the size" of the h2. Half of this site's
h2 is 1.125em, **and that is not a level this site has** — the six are h1 (3em), h2
(2.25em), h3 (1.5em), h4 (0.875em), body (1em) and code (0.875em), and inventing a seventh
was out of bounds. The h4 level is the one that is actually meant for this: bold, uppercase,
letter-spaced — a timestamp or a tag by character, not just by size. It lands at **0.39× the
h2 beside it**, not 0.5×, which is smaller than the sketch and reads better for it.

Two mechanical consequences, both worth knowing:

- **The mark is a SIBLING of the h2, not a child of it.** `em` is the element's own font
  size, so a `0.875em` span inside a `2.25em` heading is 1.97em of body text — a size the
  site does not have. As a sibling in a flex row at body size, `.h4` is exactly the h4
  level. The row is `align-items: baseline`, which is what puts the mark on the line the
  heading ends on.
- **`anchors.css` declares no `font-size` at all.** Including its own caption and its own
  takeaway box, which would have been the easy place to slip a `0.85em` in — a page that
  says "never invent a size" while inventing one is not making its point.

### What was measured, and what is judged

Measured, off the rendered marks: A is `#b84a24` on `#ffffff` at **5.2:1**; B is `#6a6a6a`
at **5.4:1**; C's text is the ordinary `#3f3f3f` at 10.5:1 with its rule in `#ff8f60` at
**2.2:1**.

Judged, and this is the finding: **A reads as anchored and B does not, even though B has the
higher contrast of the two.** The eye is not looking for contrast, it is looking for
difference — B's grey is the same family as the ink all around it, so it reads as part of
the paragraph; A's orange is the only colour on the whole post, so all three marks are found
before a word is read. Contrast decides whether a thing can be read; difference decides
whether it is found.

C anchors too, more quietly, and it costs two things. Its rule is `--prim` at 2.2:1, which
is below even the 3:1 bar for a UI shape — that is deliberate in this theme (`--prim` is the
fill and bar colour, `--prim-ink` is the text one), but it means C's mark is decoration
rather than a signal that survives a bad screen. And an accent underline is already what
this site draws under a link in prose (`framework.css`, `:where(p, li, …) a`), so C borrows
a mark that is taken.

### The alternatives, and why they were not built

**Centring the wall** was tried and reverted. At 3440 a centred wall sat in the middle of a
3,342px column while the sentence above it stayed left at its own measure — two regions on
two axes with about 800px of grey between them. Left-aligned, everything shares the page's
text axis and the leftover becomes an honest right-hand gutter.

**A track ceiling instead of a wall ceiling** was the first attempt and was wrong for a
reason worth writing down: `auto-fit` counts its repetitions using the track's *max* when
that max is definite, so `minmax(min(20rem,100%), 34em)` counted 511px tracks at 1280 and
fitted only two of the three posts. The ceiling belongs on the wall, with `1fr` tracks
underneath it.

**A fourth post** showing no mark at all was considered and dropped — the brief asks for
three, and the page already has a control in the sense that matters: three identical posts.

### Open

- `styles/css-scopes.txt` is outside this page's write fence, and this page opens a
  namespace. The line to add, under `# imagine`, is:

  ```
  type-        /framework/styles/system/studies/type (the anchor study: .type-anchor and .type-anchors-*)
  ```

  Until it is there, the reservation lives only here. (The cost of not having it was paid
  once already during this task: a bare `muted` modifier on a post picked up framework.css's
  own `.muted` utility and faded the entire post — heading, body and all — and it looked
  like a deliberate design rather than a bug.)
