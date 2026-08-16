The inverse of `false-positives.md`: layouts broken **on purpose** that the tool
scores clean. The more dangerous direction, because a missed finding looks
exactly like a passing one.

Five entries, all found the same way — build something wrong (or navigate to
something that isn't there), measure it, get a good grade back.

## The five

- **Vertical overflow of a visible box.** Every geometry rule measures the
  horizontal axis or a clip; a pane growing past a bounded parent whose
  `overflow` is `visible` trips none of them. The honest detector is a
  `sweep()`.
- **`dead-space` needs four text blocks over 20 characters.** A table is
  invisible to it in one direction (reported 13% used while filling the width)
  and a hero or toolbar in the other (can waste any width for free).
- **`pad-scale` stops at 85% of the viewport**, and `gutter` — which is meant to
  catch what it hands over — measures against the font size, so a 3300px band
  with a 20px inset passes both.
- **The measuring iframe was clamped.** `framework.css`'s base reset is
  `iframe { max-width: 100% }`, so `frame(url, 3440)` from a 1920 window laid
  out at 1920 and reported it as 3440. Fixed in `LayoutTool.css` **and** in
  `frame()`'s own `cssText`.
- **A page with nothing on it.** Seven dead urls scored 90–94/A against a site
  median of 66 — the purest form of the problem, since there is no geometric
  error to find and no geometric rule could have found one. The `empty` rule
  measures the absence.

## The pattern it names

Three of the four are the same mistake: **a guard added to kill false positives
took real findings with it.** That is the sentence the file exists for — it
makes `false-positives.md` and this one a pair, and it gives a reviewer a reason
to re-test a guard rather than trust it.

## The iframe entry carries a live warning

Any wide measurement taken before that fix is suspect: the corpus's 3440 column,
the audit's 3440 column, and anything concluded from them. The tell was two
identical rows — 1920 and 3440 returning the same score and the same
`width_used`.

## Improvements

1. **Nothing regression-tests a blind spot.** Each entry is a live page that
   scores clean; a suite that asserted "this one is *supposed* to be caught and
   is not" would turn the list into a to-do the tool checks itself. The corpus
   can now express half of it — `quiet:` says a rule must not fire — but there
   is no way yet to declare "this SHOULD fire and doesn't." *(medium, useful.)*
2. **The `empty` entry closes a blind spot and opens a smaller one**, which the
   file says: a page whose whole content is a demo stage is invisible to
   `probe.IGNORE` and reads as empty. Correct about what the tool can see,
   misleading about what a reader can. *(simple, speculative.)*
