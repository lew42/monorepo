# Report: `Type · Title layouts` (Figma `198:23900`)

Brief: [brief-titles.md](brief-titles.md). The owner's words: [ext/Figma/doc/title-layouts.md](/framework/ext/Figma/doc/title-layouts.md). Findings and verdict are in the page's Notes box.

## Built
- Page `Type · Title layouts` (`198:23900`, root `198:23901`), linked from `Claude · Overview`'s design-system card (new line `199:1280`).
- 7 component sets, one TEXT property per word slot, slot names carry the role (Big / Small): `Title / 2 words` (`198:23924`, Centre/Left/Right), `3 words` (`198:23942`, Between/Inline/Tucked), `4 words` (`198:23979`, five layouts), `5 words` (`198:23999`, Stacked·Centre/Stacked·Left/Hang), `Word + subtitle` (`198:24008`), `Weight contrast` (`198:24025`, One huge/Equal/Stepped), `Case` (`198:24038`).
- 8 rows, 6 tiles each (3 on 16:9, 3 on Shorts, 30% scale stages with the safe zone dashed): 2, 3, 4, 5 words, subtitle, weight, case, position (centre, lower-left, top-left, bottom-centre over a scrim, centre-right). Images are ones already in the file; none generated.
- Notes box (10 patterns, verdict, findings) and a dark Title casing rules box.

## Verdict
Keep: 2 words; 3 words Between and Inline; 4 words Stacked; 5 words Stacked·Centre; Word + subtitle (One huge contrast as an extra). Drop Tucked, Hang, Equal, Stepped.

## Found
- ALL CAPS "Dollar Choice" on one line overflows the Shorts safe zone: about 10 caps characters per Shorts line.
- Line lock: line height 100%, gap −0.12 em, about a quarter of cap height. Filler is 0.39 of Big.
- Small caps are synthesized (Montserrat has none).

## Not done / caveats
- The web search returned little; the 10 patterns are mostly from the art and common practice, not measured (said so in the Notes).
- Rotated side fillers not built (untested in auto layout).
- Values no token gives: title sizes 36/14 (30% of the Video styles), white title ink, the 42% scrim.
