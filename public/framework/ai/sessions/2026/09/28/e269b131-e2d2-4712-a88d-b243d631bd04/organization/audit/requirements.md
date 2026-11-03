# Step 3: audit the paging docs as a new user (three Sonnet readers)

Load the `minion` skill first. The owner's words are in `../owner-words.md`: read the "Continued (about 1:30 PM)" section in full. That section is your acceptance test. The whole brief is `../requirements.md` (asks 5 and 8–13). Budget: about $1.50 each. Read what your slice names, not the whole repo.

**You are auditing, not rewriting.** Edit nothing outside your own file.

## Your slice (the prompt names which one is yours)

**3a: the core/Page docs and the page skill.**
- Read `/framework/core/Page/`, meaning every top tab and every left-nav item under it. Source files: `public/framework/core/Page/page.js`, `readme.md`, `doc/`, `overview/`. Also read `.claude/skills/page/SKILL.md`.
- For each kind of page shown (the overview preview grid, columns, and so on), ask: does the SIMPLEST example come first, meaning the code that makes it and then what it produces?
- Screenshot `http://monorepo.localhost/framework/core/Page/` at 1920 in headless Playwright (the `ui-test` skill; never the owner's tabs). Save it as `3a-page-1920.png` and look at it.

**3b: every way to create a page.**
- Find and verify each route in the code:
  - `page.js`;
  - `page.jsonl` (the loader picks whichever file the folder has; find where it decides);
  - dynamic or index pages with no folder, such as the AI 2 cards (`/framework/ai2/`, `board.jsonl`, `page.jsonl` cards) and any other `route()` users.
- Start at `public/framework/core/Page/Page.class.js`, `core/Page/jsonl/`, `core/Page/doc/jsonl.md`, `doc/declaring.md`, `doc/data-children.md`, and the Router.
- For each route, give: the smallest working example (real code or a real file from the repo, with its path), what it produces (a URL), and whether and where core/Page documents it.

**3c: the layout vocabulary and `/imagine/`.**
- Map the owner's three layouts onto what exists today:
  - standard: one column, about 300–1000px, responsive to mobile;
  - wide: two columns in any proportion, stacking on mobile;
  - fill: three or more standard columns, and how they respond on a wide screen.
- Also map the top-down shape: background, padding, and full-bleed column pages.
- Look in `core/Page/doc/layout.md`, `layout-overview.md`, `columns.md`, `words.md`, `core/Page/words.js`, `Page.css`, and `public/framework/core/Layout/` if it exists.
- Then skim `public/imagine/` (readme, the `page.js` titles, and `layouts/`, `paging/`, `shells/`, `sections/`, `screens/`). List the past layout work worth folding into the paging system, each item with its URL and one clause on what it shows. Titles and first lines only.

## Output: one file, `<slice>.md` beside this brief (`3a.md`, `3b.md` or `3c.md`)

Use headings and lists, with no paragraphs over three lines. Every page or file you name is a link: a site URL, with the source path second.

1. `## Findings`: one line each, tagged **missing**, **verbose**, **unlinked**, **wrong** or **buried** (buried means the simplest example isn't first). Give the URL.
2. `## Simplest first`: for your slice, the one example each page kind or route should open with (code plus result).
3. `## Suggested structure`: your proposal for the core/Page top tabs, with the left-nav items under each. Methods and Properties tabs with one page per method are fine. Name the big concepts that deserve their own concept page, and say which are too trivial for one.
4. `## Value per space`: rank your top ten items. Put what is fundamental and easy to show first. Name what is confusing and hard to show, and doesn't earn space.

Stay under 150 lines.

## Fence

- Write only your own `<slice>.md` and, for 3a, the png.
- Every process sets `windowsHide: true`. Never start or restart a server.
- Reply with one line: the file path and your three most important findings.
