# Minion brief: the Collab objects and the live page

Load the `minion` skill first, then `code`, `page`, `new-page`, `css` as they apply.

**Owner's words** (read all of it): `public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words-2.md`. The line that matters most: *"almost everything should just be an object with properties and methods … instances and arrays of those instances, like the more of the internal structure we can see via UI."*
Task: `public/framework/ai/2026-09-28/collab-rounds/` (requirements.md, and the card dir `public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/` — design.md, the "Added" section).
**The contract:** `public/framework/ai/2026-09-28/collab-rounds/collab-format.md`. Another minion is writing the runner (`Server/collab.mjs`) against the same contract at the same time. Do not change the contract; if it is wrong, say so in your final message.

**Work in the worktree `C:\Code\lew42\worktrees\collab-rounds`** (branch `worktree/collab-rounds`, its server at http://localhost:64519/). Commit there. Do not merge.

## Deliverables

1. `ext/Collab/Collab.js` — classes `Collab`, `Member`, `Phase`, `Vote` (house style: assign-based, parts as static subclasses, e.g. `Collab.Member`). `Collab` replays a `collab.jsonl` (subclass or reuse `ext/JSONL`'s `JSONL`, with verbs `collab phase member vote tally winner`), live-streaming via `.live()`. After replay: `collab.members[]` (each with its phases' files, cost, status), `collab.phases[]` (each with status, cost, its votes), `collab.votes[]`, `collab.winner`, `collab.cost`. Methods for the obvious questions: `tally(phase)` (counts), `member(id)`, `phase(n)`.
2. A view that draws one live run: the question; members as columns or rows (model, cost, status per phase, a link to each file they wrote); phases in order with a done/running mark; each vote as "member → pick" with its caveat; the winner highlighted with its caveats. Show it, don't tell it — this is what the owner looks at.
3. `ext/Collab/page.js` — the module's page: the live view on a sample run. Put a small realistic sample in `ext/Collab/demo/` (a `collab.jsonl` plus the member files it links to, 3 members, a research run through its vote). Also: `?src=<url of any collab.jsonl>` draws that run instead, so the mastermind can link a real run. Add `Collab` to `children:` in `ext/page.js`.
4. `ext/Collab/readme.md` (index shape: what · Use · Watch out · More) and `ext/Collab/doc/collab.md` (the objects and the phase lists, one screen).

**Fence (the only files you may write):** `public/framework/ext/Collab/**` and the one `children:` line in `public/framework/ext/page.js`. Every new CSS class goes through the `new-css-class` skill (prefix `collab-`).

**Proof before you stop:** load `http://localhost:64519/framework/ext/Collab/` headless (Playwright, headless — never the owner's tabs), zero console errors, one screenshot at 1920 saved to `public/framework/ai/2026-09-28/collab-rounds/shots/objects-1920.png`. Open it and judge it: can someone who never saw this see the members, the phases, the votes and the winner in five seconds?

Any process you start sets `windowsHide: true`. Length budget: Collab.js about 150 lines, the view about 150. Log to `public/framework/ai/2026-09-28/collab-rounds/task.jsonl` with `node .claude/hooks/append.mjs` (a JSON array file written with the Write tool). Final message: what you built, the screenshot path, anything in the contract you disagree with.
