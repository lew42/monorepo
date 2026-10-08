# B: the masonry preview wall, and previews scaled from their own width

Read first: [../common.md](../common.md), [../requirements.md](../requirements.md) (asks 4 and 5), [../owner-words.md](../owner-words.md) (section 1), [../plan.md](../plan.md). Before shot: [the UI wall at 1920](../shots/before/monorepo-localhost-framework-ui/1920.png). It leaves holes wherever one card in a band is taller than the others.

**The owner:** "a preview grid that allows different heights and widths in a masonry style way, where ... there's basically no voids of like space where things are misaligned ... The problem with true masonry is that you can't get the order to go across the top and then wrap ... I was thinking that the smallest elements should go to the top ... each ... width ... mobile 400-ish, ... a thousand or 1920 or 3440 ... previewing ... the 3440 layouts in the UI grid on the homepage, we might want a little zoom slider ... it probably should be a dynamic zoom, so it kind of fits a certain number."

## Deliverables

1. **The masonry wall:** `browse()` (`ext/catalog/browse.js`) lays its cards out with no holes. Extend what exists: `.packed` plus `pack()` (`styles/layouts/masonry/masonry.js`, decisions in its `doc/decisions.md`). It already keeps order running across, so don't build a second masonry.
   - **Smallest first:** cards are ordered by measured height, shortest at the top. A band's own editorial order is the tie-break.
   - It works at 400, 1200, 1920 and 3440, and a card may span 2 columns when its preview is wide.
   - Decide whether bands stay as separate walls or become one wall with band filters (the facet rail already filters). Pick the one with fewer holes, and log the alternative.
2. **Previews at their own width, scaled:** a page can say how wide it is meant to be seen (a `width` such as 400, 1000, 1920 or 3440, or a word: mobile, tablet, desktop, mega, the words `ext/demo/stage.js` already uses). The preview lays the content out at that width and scales it down with CSS `zoom` to fit its card, never `transform` (see `stage.js` lines 47 to 54 for why). Default: today's look.
3. **The zoom control:** a slider on the wall's rail sets how many cards fit per row (dynamic zoom), so a wall of 3440 layouts can still be read. It is remembered per viewer in localStorage (wrapped in try/catch) and is a URL parameter, so a reload lands in the same place.
4. Docs: the masonry module's readme and page show the new wall live. Add one line to `ext/catalog`'s readme.

## Fence
`ext/catalog/` and `styles/layouts/masonry/`. Not `framework.css` (minion G is editing it): put new CSS in the masonry module's own `.css`/`css()`. Not `core/Page/` (the `preview_card` code there): if you need a hook, log a `need` line.

## Proof
Shots of /framework/ui/ and /framework/styles/layouts/masonry/ at the four widths, before and after, plus one shot of the slider at two settings. Measure the holes: the empty area between cards as a % of the wall, before and after. Log it as an `experiment` line.

Model: Opus.

