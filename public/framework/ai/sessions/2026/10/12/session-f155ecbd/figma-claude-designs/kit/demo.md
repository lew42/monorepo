# Report: Demo · Site (partial: stopped by the Figma tool limit, 2026-10-14)

Figma file `QYN0G2URSBHYH5I06MOjxU`. Brief: [brief-demo.md](brief-demo.md). Task log: [demo/task.jsonl](demo/task.jsonl).

## Done
- Page `Demo · Site` (`296:106079`, third page, after `Index · full size`; `Essentials` did not exist yet).
- Ten blank screens in a row from x 1000, each 1920×1080, clip on, vertical scroll, auto layout: Home `296:106080`, Docs · Getting started `…081`, Docs · Install `…082`, Elements · Buttons `…083`, Elements · Cards `…084`, Layouts `…085`, Templates `…086`, Reading · Why instances `…087`, Reading · Why slots `…088`, Settings `…089`.
- Checked by screenshot: the dark sidebar plus attached gray inner sidebar on a white page (the Docs screens) renders, and reactions on nested template items work.

## Not done (needs the Figma tool limit to reset)
- Run [demo/build-a.figma.txt](demo/build-a.figma.txt) (scheme A: Home, Docs ×2, Settings). Fixes already in it: article text order, the page minimum height so the gray sidebar fills, icons swapped through the nested `Icon glyph`.
- Scheme B (Elements · Buttons / Cards): top nav and tabs from `Tab` instances, body from the `1/4 · 3/4 · section rows` and card-grid templates.
- Scheme C (Layouts / Templates): `Template / 3col / icon rail 80 · inner nav 280 · main`, rail icons and inner items wired.
- Scheme D (the two Reading screens): `Crumb` bar plus a Next/Previous footer.
- Start screen and flow `Demo · Site` (`page.flowStartingPoints`), the ▶ PROTOTYPE badge, the Notes frame with the nav verdict, 100% screenshots, and the reaction-destination listing script.

## Lessons
- A reaction cannot target its own screen (the whole script rolls back): skip the current item.
- Icon identity lives in the nested `Icon glyph` instance, not in the `Icon` variant.
- Text collection mode `1:2` on a frame makes Tree items dark.
