# Decisions — /imagine/research/

## 2026-09-05 — the second UX pass: from stat tiles to the 3-column card

**The problem the depth fix (2026-09-04) left standing.** Collapsing the raw stream and the
theories board behind closed `<details>` cut the page from 14,413px to 877px at 3440 — a real
win, but it also meant the front no longer said *anything a topic actually found*. The four
topic cards under "The dig" were stat tiles: a name, an entry count, a kind breakdown, a
coloured bar. A stranger asking "what do we actually know" had to open a topic's own page, or
open the separate "Theories on the table" section and find their topic re-grouped inside it,
to read one real claim.

**What was tried.** The owner's 3-column card, verbatim from the 2026-09-05 brief — the same
shape `/imagine/layouts/`'s catalogue already uses (`LayoutsCard.js`): left = a small title and
what it is, centre = the actual thing, live, right = the numbers behind it. Applied per topic:
left = the topic name and its tally, centre = the topic's own newest theory rendered in full
(`Program.theory()`, unchanged — title, credence badge, the reasoning, the source), right = the
credence counts as labelled readouts. `board()` (the old global, per-topic-grouped theories
section) is gone; its content now lives inside each topic's own card, and `takes()` (the
opinions filed against a topic) is called from there too. The flat, chronological "Latest"
feed is untouched — a genuinely different view (recency across topics, not grouped by one) —
and stays behind its own closed `<details>`.

**Measured, `/imagine/research/`, `.research-program`'s own rect** (not a raw box-union — see
the caveat below):

| | before | after |
|---|---|---|
| width used (3440, right edge ÷ 3440) | 46.0% | 46.0% — unchanged, expected |
| dead space (3440) | 1,856px | 1,856px — unchanged, expected |
| page height, 1280 | 734px | 2,291px |
| page height, 3440 | 877px | 2,855px |

Width and dead space are unchanged on purpose: the column is `width: "large"`, and the layout
skill is explicit that widening a column is never the fix for dead space — this exact page
already tried `"fill"` and reverted it (2026-09-04) because it starves an open topic column to
its 288px floor. Nothing in this pass touches the column's outer bound; the 3-column card lives
entirely inside it.

Height roughly tripled. That is a real cost, and it is the number that could have said
"revert." **Kept anyway**, because the increase is bounded and the trade is legible: 2,855px at
3440 is under two screens, nowhere near the 14,413px crisis the depth fix addressed, and every
added pixel is one theory — a real, sourced, credence-tagged claim — not raw unfiltered
entries. The five-sentence read is the deciding evidence: before, "how do I use it" had no
honest answer beyond "click a card and hope"; after, the front answers its own question
("what do we actually know about ancient technology") directly, once per topic, without a
click. A page that measures worse on one axis and reads unmistakably better on the one the
owner actually asked about is the case the brief itself names as a legitimate keep.

**Left open:** the theory shown is always the newest (`all()`'s sort order), not the
highest-credence or most-discussed one — a reasonable default, not a considered choice. If a
topic's most interesting theory is not its newest, this card will not surface it without a
click into "+N more."

## The measurement trap this pass found

**A closed `<details>`'s children still report real, non-zero `getBoundingClientRect()`
geometry in this browser**, positioned as if the section were open — even though nothing is
painted and the outer `<details>` element's own rect is correctly small (just the summary bar).
A plain box-union script (the brief's own recipe, taken literally) reads `maxBoxBottom` past
9,000px on a page that visibly ends before 900px, because it counts every hidden card inside
"Theories on the table" and "Latest" as if they were on-screen.

The fix used here: filter boxes with `el.checkVisibility({ checkOpacity: false,
checkVisibilityCSS: true })` before taking the union, or — more directly for a height number —
read the actual content wrapper's own rect (`.research-program`, here) rather than unioning
every descendant. The corrected number for "before" (877px at 3440) matches the depth-fix
review card's own claimed figure exactly, which is what validated the method. Any page on this
site using closed-by-default disclosure should measure the same way, or its "after" number will
look far worse than the page actually is.
