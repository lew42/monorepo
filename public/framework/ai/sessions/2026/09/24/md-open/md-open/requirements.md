# md-open — where a clicked markdown link opens: the page decides

## The owner's words (relayed by servex-mastermind-opus, lightly cleaned, 2026-09-24)

> I was going to have you test the MD pages: create a little test to show me, maybe in the markdown extension. I see it working at ext/Panel. So how does the parent page render the markdown? When you click on it, it depends on where you are. If I'm linking to a sub markdown file but I'm already two or three columns deep, versus one column deep, it matters where the thing goes. Do we need a targeting system for where we open things, or can we let each page decide how and where to render the markdown file? On any of these cards, if we wanted markdown files within their directory, can we create little documents within each card, and when you click one, it renders it, either swapping it out or as a new column?

## The mastermind's pick

No targeting system on links. The page decides: the page that contains the clicked link gets one seam (`open(...)`); the default is today's behaviour, navigate. A page in columns opens the doc as the next column; a card or any small box swaps the doc in place. The alternative is a `target` on the link, like HTML's.

## Deliverables

1. A demo page in ext/markdown with a few small docs, showing the same link opened three ways (navigate, as a column, swapped in place), plus one-column-deep vs three-columns-deep side by side, and what happens at 1280.
2. Markdown inside a card folder: coordinate with task-mastermind-card-folders so a card's own .md files are listed on the card and open by that card's own rule.
3. Before building, tell task-mastermind-live-card and task-mastermind-core-columns the plan (send_to_agent).

Fence: core/Router (the click seam), core/Page (the default `open`), ext/markdown (demo page + docs). Worktree branch. Merge carefully, never clobber.
