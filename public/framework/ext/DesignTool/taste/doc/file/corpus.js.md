THE ORDERING CORPUS. `tests/` asks whether a rule *fires*; nothing asked
whether a *rating* is in the right order, and a rulebook that cannot be wrong
is not a rulebook. Six breaks × five named layouts (`styles/layouts/space/`'s
own spec text), each declaring the band it costs, so a failure names which
band stopped working rather than only that something did.

## A pair only means something if the left side is actually good

`base` fixes the subject *before* `apply` breaks it. Unbounding
`--measure: 52em` changed nothing at any width, because 52em already runs
~100 characters a line here (hand count, `ai/2026-08-16/mastermind-layout/measure-verdict.md`)
— the first version of "unbound the prose" was comparing two already-broken
layouts. Every case's `base` exists to keep the comparison honest.

## A band with nothing to read is n/a, not a failure

`judge()` returns `pass: null` whenever the named band has no live reading at
all — `slivers` reads `null` on a dashboard of tiles because none holds twenty
characters — or when the subject already scores at or below `0.001` on it
before the break, meaning there was nothing left to lose. Either scored as a
failure would make the corpus look broken when it was actually silent.

## Two cases are expected to FAIL, and that is the boundary being declared

`"hid the text"` (`expect: false`) is invisible to all eleven bands because
every one of them is geometry — `rules.js`'s `invisible` owns colour contrast,
not this tier. `"scrambled the spacing"` cannot be reached at all: a layout's
gap *vocabulary* belongs to its components, and a spec can add at most one gap
per container. A corpus with no declared failure reads as a claim that the
tier catches everything.

## A break about one width is judged at that width

`brk.at` (only `"pinned the body narrow"` sets it, to 3440) narrows `judge()`
to the marks at that width before scoring. Averaging all three would wash the
break out — pinning a body to 20em *helps* `width-used` at 390, where 20em is
most of the screen, and only costs it at 3440.

## `declass()` matches the class token only

`\bpad\b` also matches inside `--pad:`, which would turn every declaration's
custom property into `--:0em` and made two subjects score *better* after "took
the padding out" — the opposite of the intended direction. The regex anchors
to whitespace/line boundaries for exactly that reason.

## Improvements

1. **This file validates the ORDER a break produces, not the PLACE a band's
   ideal band sits.** A pass proves the tier noticed a named defect; it says
   nothing about whether `measure`'s ideal should be 52–68 or 50–70. Ranking
   against a human's judgement — real pages someone put in order — is the
   missing half, and it needs a person. *(large, needs a person.)*
2. **`SUBJECTS` is five named layouts, hand-picked so a corpus whose subjects
   move when the generator retunes proves nothing** — but `styles/layouts/space/presets.js`
   carries nine presets, so a regression specific to one of the other four is
   invisible here until someone adds it. *(simple, speculative.)*
3. **"laddered the columns" currently reads n/a on all five `SUBJECTS`**,
   live at `corpus/` — not the "`document`/`landing` only" the guard comment
   was written against. `presets.js` shows why three of the five (`document`,
   `dashboard`, `landing`) have no line carrying both `flex-1` and `wrap`, so
   `apply` is a no-op there as designed — but `docs` and `gallery` *do* have
   that line, and still read n/a, which by `judge()`'s logic means `slivers`
   was likely already at zero credit on their unbroken preset. Not confirmed
   live in this pass — worth a look before trusting this case at all.
   *(medium, worth a look.)*
