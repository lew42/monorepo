Why `alignment` clusters on layouts nobody would call misaligned: its near-miss
window (3–12px) is **exactly the site's padding scale**, and a padded box's
children sit one padding inside its edge forever, by design.

## The tell is a repeated offset

A real misalignment is one element at one odd distance. A padding artefact is N
elements at the *same* distance, and that distance resolves to a round em value
at the container's font size — 11.2px is `0.8em` at 14px, 9.4px is `0.6em`.
The file gives the division to do before believing a cluster.

## Two live cases carry it

`library/stat-strip` (6 × 11.2px at 400) and `library/list-and-detail` (16–20 ×
9.4px at every width). Both keep the finding rather than dodging it, and both
captions point here — so the doctrine and the specimen cannot drift apart.

## It rejects the obvious fix

Loosening the window is not the answer; `false-positives.md` already records
that the loose setting fired 987 times. The precedent it points at instead is
`heading-offset`, which takes a *wider* window by narrowing the **relationship**
— same measurement, one-tenth the noise. The proposed fix here is the same
shape: an offset equal to an ancestor's padding on that side is an inset, not a
misalignment.

## Improvements

1. **The fix is described but not filed.** `polish.js` is where it lands and
   this file is not linked from there, so a maintainer reading the rule sees no
   sign the case has been made. *(simple, important.)*
