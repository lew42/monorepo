**Choosing a layout is now five questions, asked in order, with live demos: [/layouts/decide/](/layouts/decide/).**

![The five questions at 1920](questions-1920.jpg)

1. **How much room is there?** Worked out top down; a phone is always one column.
2. **How much content is there?** A little wants a small box; a lot wants tabs or a left nav.
3. **Is it outlined yet?** If not, outline first, then choose.
4. **How will the content fill the width?** Columns work when they match in height.
5. **Which approved layout fits?** If none does, build a proposal and say so.

Each question is worded as a judgement with its usual answers and an example, never a do/don't rule.

## The column demos

A short column leaves a hole ([short](/layouts/decide/short/)):

![One short column](short-1920.jpg)

The fix: the title is centred vertically ([centred](/layouts/decide/centred/)). This uses one existing word, `h-center`, and no new CSS:

![The title centred](centred-1920.jpg)

The other two: [three equal columns](/layouts/decide/equal/), and [a little content or a lot](/layouts/decide/amount/) (preview cards, then a left nav beside a wall of sections):

![A little or a lot, at 3440](amount-3440.jpg)

## Also

- The same five questions are in the `layout` skill, as a new section ahead of the sizing questions. Nothing was removed.
- [Worked example](/layouts/decide/servex/): the five questions asked of /framework/servex/ one at a time through `Server/ask-each.mjs`.
