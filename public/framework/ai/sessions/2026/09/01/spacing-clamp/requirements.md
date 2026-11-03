# Responsive spacing clamp + imagine layout fixes

The ask, verbatim:

> can we make the gaps and padding on most containers use some sort of % clamp with min/max? at 3440, for example, there's not enough spacing (homepage, etc). look at some of the recent work on the imagine page. i've tried to have you audit the padding and layout on the site, and we're still getting ABSOLUTELY BROKEN LAYOUTS.
>
> you need to use extreme care here to not fuck this up again. edit the layout skill, or whichever is the culprit. we need to be absolutely certain we don't keep making these errors. on the imagine/design/padding/ page, we have "CLOSEST REAL MISS" title that is 0px from the left viewport edge. complete fail...
>
> also, on many of these imagine pages, we have either MUCH TOO SMALL COLUMNS (the imagine/design/ column's paragraph is 200px wide? At 3440 px, this looks ridiculous?) if the page columns use % padding, and we let them use some more space, then everything will look less cramped

## Scope

- Spacing tokens (gap, padding) become viewport-responsive via clamp() where fixed values break at 3440.
- Fix the two named failures: imagine/design/padding/ title at 0px from viewport edge; imagine/design/ columns too narrow (200px paragraphs at 3440).
- Root-cause why repeated audits keep missing these; encode the guard in the layout skill (or the actual culprit skill).
- Verify with headless screenshots at 1280 and 3440 before claiming anything works.

## Fences

- No build step, no new deps, all CSS inside layers.
- CLAUDE.md untouched.
