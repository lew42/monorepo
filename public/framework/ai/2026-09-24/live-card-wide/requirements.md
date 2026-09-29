# Live card — use wide screens in columns, keep text at a reading width

## The owner's words (dictated, lightly cleaned)

"The live page is only a narrow column. The progress bars don't need more than a small column, and the running-now list is huge now, which is kind of cool. But we might want to use more space. The little chat window at the bottom is full width, and it's kind of cool that we can use the full space. However, the text is way too wide, well past a comfortable reading width, and I don't like that. We have to figure out a strategy to use wide space in a solid way that doesn't break at whatever resolution we render at. That's tricky: once you put things in two columns, the columns either need to be the same height, or one needs to be vertically centered, or you have a big gap. A masonry-type layout could maybe do some live restructuring or re-columning. Take a screenshot at 3440 and you'll see that 50% of the page is just empty space. Also, I can't really click on these things. When I click on assistant-fast, it expands in place, but I think we want to rely on columns more. I don't know how many columns deep we want to go. The framework sidebar is one level of navigation, and the inbox column with the previews is the second. If the live page adds a third level, that's not necessarily bad, but it only works on giant monitors, and a lot of people wouldn't have enough space. At about 1920 there's really no more room for a second column, so we run into a space problem."

## Deliverables

1. Screenshots of /framework/ai2/live/ at 3440, 2560, 1920 and 1280, before and after.
2. No line of reading text wider than a comfortable measure, anywhere, the chat included. Reuse the site's measure token / layout words / core/Page columns (doc/columns.md).
3. Wide screens: the Live card's parts (usage, running now, tasks, chat, an opened agent's conversation) fill the width in columns, with no big empty areas and no ragged gaps. The approach is chosen, and the viable alternatives (masonry, equal-height rows, one centered column) are written in a decision line.
4. Clicking an agent opens its conversation as a column beside the list when there is room, and in place (as today) when there isn't. One short doc gives the rule for how many navigation levels fit at each width (sidebar, inbox, card, agent), with the screenshots.

## Fence

`public/framework/ai2/live.js`, the Live card rules in `public/framework/ai2/ai2.css`, `public/framework/ai2/page.js` (class hooks only), one new doc in `public/framework/ai2/doc/`, readme line. Worktree `C:\Code\lew42\worktrees\live-card-wide`, branch `worktree/live-card-wide`. Merge carefully, never clobber.
