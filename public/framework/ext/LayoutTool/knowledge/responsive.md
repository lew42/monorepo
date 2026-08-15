# Responsiveness

A robust layout behaves **predictably** across widths: it reflows at a few
places it was told to, and does nothing surprising in between. A broken one is
usually misconfigured rather than badly tuned — and the misconfiguration shows
up as a *discontinuity*.

So the question is not "is it right at 1920", it is **where does its behaviour
change, and did anyone choose those places?**

## Don't sweep every pixel

Analysing 400→3440 one pixel at a time is 3041 full layout passes to find, in
practice, three or four widths where anything happens. It is also mostly
wasted: between two reflow points every metric moves smoothly, so 300
consecutive samples say the same thing 300 times.

**Sample coarsely, then bisect where the signature changes.**

1. Probe at a stride (64px is plenty) across the range.
2. At each width take a **signature** — cheap, discrete facts that only change
   when the layout genuinely rearranges: the set of rules firing, the number of
   grid/flex rows in each container, whether the document scrolls sideways,
   which nodes clip.
3. Wherever two neighbouring samples disagree, **bisect between them** to find
   the exact pixel the change happens at.

That finds the same edges as a per-pixel sweep for roughly 2% of the work, and
— more usefully — it reports them as a short list of *breakpoints with a
reason*, not a 3000-row table.

## What the edges tell you

- **An edge you can name** (`--column` running out, a `clamp()` bottoming out,
  a media query) is the layout working.
- **An edge nobody chose** is the finding. Two neighbouring pixels where a rail
  starts clipping, or a grid drops from three columns to one without passing
  through two, is a configuration bug — nearly always a fixed width, a missing
  `min-width: 0`, or `auto-fit` where `auto-fill` was meant.
- **No edges at all across 400→3440** is its own finding: nothing reflows, so
  either the layout is fixed-width (dead widescreen) or it is prose that only
  ever needed one column.

## Reading the sweep

The three widths worth *looking* at remain 1280 / 1920 / 3440 (plus 400 for
phone) — the sweep is for finding the widths you would not have thought to
check. When it reports an edge at, say, 1104px, that is the number to open the
browser at.

⚠ **A sweep measures one document per width**, so it costs one page load each.
Sample the stride first, and only bisect the intervals that actually differ —
bisecting everything is the per-pixel sweep with extra steps.

## What it found the first time it ran

On the corpus's own "Good widescreen" case, over 400→3440 at a 256px stride:
**13 samples, ~25 loads, 9 seconds**, and one finding worth having — an
`illegible` band that exists **only between ~840px and ~1208px**. Above and
below that window the page is clean.

No amount of checking 400 / 1280 / 1920 / 3440 finds that. It is exactly the
"the precise width in between is what produces the edge case" problem, and it
is the argument for the sweep existing at all.

⚠ **A continuous metric does not become discrete by bucketing it.** The first
signature included `width_used` in 5% buckets and reported four edges where
there was one: content width drifts smoothly, so it crosses a bucket boundary
every few hundred pixels and every crossing read as a reflow. The signature is
now the firing rule-set, the sideways-scroll flag, and the clipped count —
things that only change when the layout rearranges.
