# How many columns fit — the Live card on every screen

The Live card (`/framework/ai2/live/`) sits to the right of two other columns: the site's
sidebar, and the AI 2 rail of card previews. Whatever width is left is the card's. On a
wide screen the card splits into columns so the space is used; on a narrow one it stays a
single column. No line of text ever gets wider than the site's reading width (`--measure`,
40em, about 75 characters), and the whole card still scrolls as one page — no box inside
it has a scrollbar of its own.

![The Live card at 3440 wide: usage and tasks, the running list, one agent's conversation, the chat](/framework/ai2/doc/img/wide-after-3440.jpg)

## The rule: count the levels of navigation

Each column you click through is one level: the **sidebar** picks a page, the **rail**
picks a card, the **card** lists the agents, and the **agent column** shows the one agent
you picked. A level only gets a column of its own when the card has room for it next to
the list. When it has no room, the agent's conversation takes over the card instead.

| Screen width | Sidebar + rail | Card width | Card columns | An agent's conversation |
| --- | --- | --- | --- | --- |
| 1280 | 241 + 331px | 709px | 1: everything stacked | takes over the card |
| 1920 | 256 + 352px | 1312px | 2: usage, tasks, chat · running now | takes over the card |
| 2560 | 288 + 396px | 1876px | 3: usage, tasks, chat · running now · agent | its own column |
| 3440 | 288 + 396px | 2756px | 4: usage, tasks · running now · agent · chat | its own column |

So a 1280 or 1920 screen shows three levels (sidebar, rail, card), and 2560 and up shows
four. The switch is measured on the **card's own width** (in `em`: 60, 95 and 130), not the
window's, because dragging the rail wider takes room from the card.

## When there is room: the agent column

- **It is never empty.** It opens on `assistant-fast` — or, if that is not running, the
  first working agent, or else the first row. That choice is made once, when the page
  loads; agents starting and stopping never change it. Only your click does.
- **Picking another agent moves nothing.** The column is always there, so nothing reflows:
  the rail's and the list's edges read the same before and after the click.
- **The conversation sits level with its row**, and the row stays highlighted, so your eye
  does not have to hunt for it.

![2560, an agent picked from further down the list](/framework/ai2/doc/img/wide-after-2560-agent.jpg)

## When there is no room: the conversation takes over

Nothing opens under a row any more — that pushed the rest of the list down the page. A click
replaces the card's usage, lists and chat with that agent's conversation, scrolled to the
top. **← Live** brings the card back exactly where you were scrolled. A half-typed message
survives all of it, and widening the window past the switch turns the takeover back into
the column without losing the conversation.

![1920, an agent's conversation taking over the card](/framework/ai2/doc/img/wide-after-1920-agent.jpg)

## All the screenshots

- Before, at 3440 — one narrow column and the chat the whole width: [wide-before-3440](/framework/ai2/doc/img/wide-before-3440.jpg)
- 3440: [as it loads](/framework/ai2/doc/img/wide-after-3440.jpg) · [another agent picked](/framework/ai2/doc/img/wide-after-3440-agent.jpg)
- 2560: [as it loads](/framework/ai2/doc/img/wide-after-2560.jpg) · [another agent picked](/framework/ai2/doc/img/wide-after-2560-agent.jpg)
- 1920: [as it loads](/framework/ai2/doc/img/wide-after-1920.jpg) · [an agent taking over](/framework/ai2/doc/img/wide-after-1920-agent.jpg)
- 1280: [as it loads](/framework/ai2/doc/img/wide-after-1280.jpg) · [an agent taking over](/framework/ai2/doc/img/wide-after-1280-agent.jpg)

## Why columns, and not something else

- **Masonry** (boxes packed wherever they fit) would fill the gaps best, but it moves boxes
  whenever one grows. This card is live — a new agent or a new chat line would shuffle
  what you are reading.
- **Equal-height rows** stretch every box to match the tallest one. With 50 agents in
  "Running now", that means 1,000px of empty box under the usage meters.
- **One centred column** keeps the reading width but leaves half the screen empty at 3440,
  which is the complaint this change answers.
- **Columns of different lengths** (what is built) leave some empty space under the short
  usage-and-tasks column, below the fold. That is the cost. The top of every column is
  always full, and nothing ever moves.

The CSS is the `live-card-wide` block near the end of `ai2.css`; the placement code is
`place()` in `live.js`.
