# corpus.js — design notes

## Overview

`tests/` asks whether a rule FIRES; nothing asked whether a rating is in the right ORDER, and a rulebook that cannot be wrong is not a rulebook.

A corpus of "pages a person ranked" needs a person. A corpus of PAIRS does not: take a layout, break one named thing about it, and the original is better by construction. Every case declares the band it is about, so a failure says WHICH band stopped working rather than only that something did.

These are transforms on `styles/layouts/space/`'s spec text, so this file knows that format. A real dependency, and the cheapest one available: the alternative is a second corpus of hand-written pages that would drift from the first.

## The breaks

### "unbound the prose"

`base` first, and this case is why it exists. Unbounding `--measure: 52em` changed NOTHING at any width, because 52em is already ~100 characters a line here (hand-counted: `ai/sessions/2026/08/16/mastermind-layout/measure-verdict.md`) — the subject was broken before the break. A pair only means something if the left-hand side is actually good, so the baseline binds it properly.

### "took the padding out"

BOTH sides paint their boxes, and that is not decoration. `frame-gap` and `pad-share` measure boxes that draw an edge, and a preset's spec-level `pad` sits on unpainted wrappers — so removing it moved neither band by anything. The only difference between these two layouts is the inset.

### "scrambled the spacing"

EXPECTED TO FAIL, and it is a finding rather than a bad case. A layout's gap VOCABULARY is set by the components inside it — `web.js`'s cards, rows and tiles carry dozens of gaps between them — and a spec can add at most one per container. Eleven scrambled spec gaps are a rounding against that population, so `scale` cannot be moved from the layout at all. It is a band about a design system, not about an arrangement.

STILL TRUE after `scale` was re-derived from a count into a share (2026-08-17): +0 on all seven subjects, measured. The boundary this case marks is a fact about where the gaps live, not about the statistic reading them.

### "pinned the body narrow"

JUDGED AT 3440 ALONE, and that is the resolution of the one case that used to disagree. Pinning a body to 20em costs `width-used` at 3440 and HELPS it at 390, where 20em is most of the screen — so averaging the three widths washed the break out and `gallery` read as a disagreement. A break that is about a width is judged at that width.

The baseline UNPINS first, for the same reason "unbound the prose" binds first: `document` is already a 52em column at 3440, so narrowing it further cost nothing — both sides were already at zero credit.

### "laddered the columns"

A WRAPPING ROW only, and that guard is a case the corpus found about itself: eight fixed tracks added to a COLUMN body stack full-width and ladder nothing, so `document` and `landing` scored the break as "no change" when the honest answer is that it does not apply to them. `pair()` reports that as n/a.

### "hid the text"

THE CONTROL, and it is expected to FAIL. Every band here is geometry, so ink the same colour as its ground is invisible to all eleven — `rules.js`'s `invisible` is what owns it. A corpus with no declared boundary reads as a claim that the tier catches everything.

## The subjects

The layouts every break is applied to. Named rather than generated: a corpus whose subjects move when the generator is retuned proves nothing about the generator.

`masonry` and `split` were added when "laddered the columns" went to 0 OF 0 — every original subject either had no wrapping row for it to ladder (`document`, `dashboard`, `landing`) or too little text for `slivers` to read after the sample gates landed (`docs`, `gallery`). **A case that tests nothing is worse than a case that fails**, because it reports as a clean n/a and nobody looks again. The corpus caught that about itself, which is the strongest thing it has done.

## The add() function

TOKENS GO IN THE HEAD, before the `>`. Appending to the end of the line puts them in the PART half, where `basis pad > menu` + ` tone` reads as the part `menu` with a count of `tone` — the layout still renders, the token does nothing, and three cases quietly measured zero change.

And the INDENT survives. `"  > topbar"` has an empty head, so trimming it moved the line from depth 2 to depth 1 and silently reparented half the tree.

## The bound() function

Bind the reading column — and INSTALL one where the subject has none. Unbounding a `--measure: 52em` that already runs ~100 characters a line changes nothing, so a pair built that way compares two broken layouts.

## The judge() function

THE CASE PASSES ON ITS NAMED BAND, not on the total — and that distinction is what makes this a corpus rather than a smoke test. Taking the padding out of a gallery RAISES its total, because the content then spreads across more of the screen and `width-used` gains more than `pad-share` loses. That is a true fact about a weighted sum and it is not a failure of `pad-share`, which did exactly what it should. The total is reported beside it as information.

Judged on the MEAN across widths, never the worst. Half these breaks only bite at one end — an unbounded measure is harmless at 390 and ruinous at 3440 — and the worst width is usually the other one. Fitness uses the worst width because a layout must work everywhere; a CORPUS asks whether the tier noticed at all.

And no margin: "worse by 5" would be a second threshold nobody calibrated. The margin is reported so a reader can see how close it was.

### Band scoring details

A band with nothing to measure is NOT A FAILURE, it is a case that does not apply — `slivers` reads null on a dashboard of tiles because none of them holds twenty characters. Scored as a failure it made the corpus look broken when it was silent; `null` is the third verdict.

NOTHING LEFT TO LOSE is also n/a. `gallery` already scores zero on `width-used` at 3440, so pinning its body narrower cannot cost it anything and the pair proves nothing either way. A subject that already fails the band a case is about is not a subject for that case.

## The pair() function

`same` means the break had nothing to change on a subject — a column body cannot be laddered into slivers — which is n/a, not a failure, and reporting it as one made the corpus look broken when it was silent.
