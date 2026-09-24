# How many columns fit — the Live card on every screen

The Live card (`/framework/ai2/live/`) sits to the right of two other columns: the site's
sidebar, and the AI 2 rail of card previews. Whatever width is left is the card's. On a
wide screen the card splits into columns so the space is used; on a narrow one it stays a
single column. No line of text ever gets wider than the site's reading width (`--measure`,
40em, about 75 characters), and the whole card still scrolls as one page — no box inside
it has a scrollbar of its own.

![The Live card at 3440 wide, with an agent's conversation open beside the list](/framework/ai2/doc/img/wide-after-3440-agent.jpg)

## The rule: count the levels of navigation

Each column you click through is one level: the **sidebar** picks a page, the **rail**
picks a card, the **card** lists the agents, and the **agent column** shows the one agent
you picked. A level only gets a column of its own when the card has room for it next to
the list; otherwise the agent's conversation opens right under its row, in place.

| Screen width | Sidebar + rail | Card width | Card columns | Where an agent opens |
| --- | --- | --- | --- | --- |
| 1280 | 241 + 331px | 709px | 1: everything stacked | under its row |
| 1920 | 256 + 352px | 1312px | 2: usage, tasks, chat · running now | under its row |
| 2560 | 288 + 396px | 1876px | 3: usage, tasks, chat · running now · agent | its own column |
| 3440 | 288 + 396px | 2756px | 4: usage, tasks · running now · agent · chat | its own column |

So a 1280 or 1920 screen shows three levels (sidebar, rail, card), and 2560 and up shows
four. The switch is measured on the **card's own width** (in `em`: 60, 95 and 130), not the
window's, because dragging the rail wider takes room from the card.

Two promises hold at every width, and the proof run measured both:

- **Opening an agent moves nothing.** Once the agent column exists it is always there,
  holding a one-line hint until you pick an agent, so nothing reflows when one opens. The
  rail's and the list's left and top edges read the same before and after the click.
- **The conversation opens level with its row**, so your eye does not have to hunt for it.
  Click another agent and the column switches to that one.

## The screenshots

Before, at 3440: one narrow column and the chat running the whole width.

![Before, 3440](/framework/ai2/doc/img/wide-before-3440.jpg)

After, at each width — the card with nothing open, then with an agent open.

![After, 3440](/framework/ai2/doc/img/wide-after-3440.jpg)
![After, 2560](/framework/ai2/doc/img/wide-after-2560.jpg)
![After, 2560, agent open](/framework/ai2/doc/img/wide-after-2560-agent.jpg)
![After, 1920](/framework/ai2/doc/img/wide-after-1920.jpg)
![After, 1920, agent open under its row](/framework/ai2/doc/img/wide-after-1920-agent.jpg)
![After, 1280](/framework/ai2/doc/img/wide-after-1280.jpg)

## Why columns, and not something else

- **Masonry** (boxes packed wherever they fit) would fill the gaps best, but it moves boxes
  whenever one grows. This card is live — a new agent or a new chat line would shuffle
  what you are reading.
- **Equal-height rows** stretch every box to match the tallest one. With 50 agents in
  "Running now", that means 1,000px of empty box under the usage meters.
- **One centred column** keeps the reading width but leaves half the screen empty at 3440,
  which is the complaint this change answers.
- **Columns of different lengths** (what is built) leave some empty space under the short
  columns, below the fold. That is the cost. The top of every column is always full, and
  nothing ever moves.

The CSS is the `live-card-wide` block at the end of `ai2.css`; the placement code is
`AgentTalk.attach()` in `live.js`.
