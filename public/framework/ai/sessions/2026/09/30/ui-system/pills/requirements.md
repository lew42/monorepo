# C: class pills, and a compact card page

Read first: [../common.md](../common.md), [../requirements.md](../requirements.md) (asks 3 and 7), [../owner-words.md](../owner-words.md) (section 1, from "on this UI card page" to the end), [../plan.md](../plan.md). Before shot: [the card page at 3440](../shots/before/monorepo-localhost-framework-ui-card/3440.png). A 200px-tall card is stretched across about 2000px, the source sits far off to the right, and the notes run in a narrow column below with empty space beside them.

**The owner:** "you can see which CSS classes are added to any card right in the UI ... at first they could just look like either floating words or little pills ... if you see a card you like, you just look at the CSS classes and can reproduce it ... document which CSS classes are useful, different ... contents or orders of contents ... background colors or ... text themes ... spacing and layout and sizing and scale ... we do probably want to see the actual source code on these templates." And: "this UI card here is rendered at like a massive width ... 2000 pixels wide and 200 pixels tall ... think about the optimal width for each kind of UI thing ... take a screenshot of it at 3440 and kind of look at all these big empty spaces ... a little bit more compact, just a little bit more meaningful. I do kind of like the code next to the template." Also: "some sort of like section UI to put like a label around a section ... a variant of that ... a layout area, like a two column or three column layout ... or on a specific card itself."

## Deliverables

1. **Class pills, a library block:** `ui/classes/` (run the `new-css-class` and `naming` skills first; `ui-` is the tier's prefix). Given an element, it draws the element's classes as small pills. Clicking a pill links to where that class is documented (`/framework/styles/...`, or the ui page for a `ui-` class). There are two forms:
   - **On a component:** a pill row on a component's preview or demo, naming its root classes (for example `surface pad flex v gap`).
   - **On a layout area:** a labelled outline around a region, naming its layout classes (for example `grid auto`, `cols`), as a variant of the existing section label (`ui/section/`; read it first and extend it rather than duplicating it).
   - Optional deep mode: pills on each child too, toggled on and off.
2. **Pills shown everywhere demos are drawn:** `demo.exhibit()` and `demo.stage()` (`ext/demo/`) show the pills for the rendered template, so every ui page gets them for free.
3. **The card page, compact:** at 3440 there are no big empty areas. The demo is drawn at the card's **ideal width** rather than stretched. The code sits beside the template, and the notes are short and placed where they belong. Fix this in `demo.exhibit()` and `demo.stage()` wherever the cause is shared, so every ui page improves. Keep v1 reachable (`?v1`, or the old exhibit as a variant).
   - **An ideal width for each kind of component:** a component's page declares it (for example `width: "22em"`, or a word), and the stage uses it. Set it for card and for at least five more components whose pages you only touch on that one line: toolbar, table, dialog, stats and alert.
4. Update the card page to the newer `.card` word if it still teaches `surface pad flex v gap` (see `ui/readme.md`, Watch out, last item), keeping the old pattern as a variant.

## Fence
`ui/classes/` (new), `ui/section/`, `ui/card/`, `ext/demo/`, and a one-line `width` on the five pages named above. Not `ui/page.js` (minion A), not `ext/catalog/` (minion B), not `framework.css` (minion G).

## Proof
Shots of /framework/ui/card/, /framework/ui/table/ and /framework/ui/section/ at the four widths, before and after. At 3440, give the card page's empty area as a % before and after, in an `experiment` line.

Model: Sonnet.

